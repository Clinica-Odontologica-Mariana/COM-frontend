import { CurrencyPipe, Location, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Procedure, ProcedureStatus, TreatmentData } from '../../models/treatment.model';
import { TreatmentService } from '../../services/treatment.service';
import { BudgetCardComponent } from '../../components/budget-card/budget-card.component';
import { JourneyTrackerComponent } from '../../components/journey-tracker/journey-tracker.component';
import { OdontogramGridComponent } from '../../components/odontogram-grid/odontogram-grid.component';
import { ProcedureCardComponent } from '../../components/procedure-card/procedure-card.component';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { forkJoin } from 'rxjs';
import { ToastService } from '../../../../core/services/toast.service';

type ConfirmType = 'complete' | 'start';

const STATUS_ORDER: Record<ProcedureStatus, number> = {
  in_progress: 0,
  pending: 1,
  completed: 2,
  interrupted: 3,
};

@Component({
  selector: 'app-management-page',
  imports: [
    RouterLink,
    CurrencyPipe,
    OdontogramGridComponent,
    ProcedureCardComponent,
    BudgetCardComponent,
    JourneyTrackerComponent,
    StatusBadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Loading state -->
    @if (loading()) {
      <div class="flex items-center justify-center py-32">
        <div
          class="h-10 w-10 animate-spin rounded-full border-4 border-[#7C5145] border-t-transparent"
        ></div>
      </div>
    }

    <!-- Error state -->
    @if (!loading() && loadError()) {
      <div class="px-6 py-8 md:px-12">
        <div class="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
          <p class="text-base font-semibold text-red-700">
            Não foi possível carregar o tratamento.
          </p>
          <p class="mt-1 text-sm text-red-500">{{ loadError() }}</p>
          <button
            type="button"
            class="mt-4 rounded-xl bg-[#7C5145] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            (click)="reload()"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    }

    <!-- Main content -->
    @if (!loading() && !loadError() && treatment()) {
      <div class="px-6 py-8 md:px-12">
        <!-- Page header -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1
              class="font-family-serif text-[clamp(32px,4vw,48px)] font-normal leading-tight text-[#7C5145]"
            >
              Gestão de Tratamentos
            </h1>
            <div class="mt-2 flex flex-wrap items-center gap-2">
              <span class="text-sm text-[#78716C]">Paciente:</span>
              <span
                class="rounded-full bg-[#F3F3F3] px-3 py-1 text-sm font-semibold text-[#1A1C1C]"
              >
                {{ treatment()!.patient.name }}
              </span>
              <span class="text-sm text-[#78716C]"
                >ID: #PAC-{{ treatment()!.patient.id.slice(0, 4).toUpperCase() }}</span
              >
            </div>
          </div>

          <div class="flex shrink-0 flex-wrap items-center gap-3">
            <button
              type="button"
              class="cursor-pointer rounded-xl bg-[#F3F3F3] px-5 py-3 text-sm font-bold text-[#7C5145] transition hover:opacity-80"
            >
              Imprimir Plano
            </button>
            <button
              type="button"
              class="cursor-pointer rounded-xl bg-[#7C5145] px-6 py-3 text-sm font-bold text-white shadow-(--shadow-btn) transition hover:opacity-90"
              (click)="goBack()"
            >
              Voltar
            </button>
          </div>
        </div>

        <!-- Two-column layout -->
        <div class="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
          <!-- Left column -->
          <div class="min-w-0 flex-1">
            <!-- Odontogram card -->
            <div class="rounded-4xl bg-white p-6 shadow-(--shadow-card)">
              <app-odontogram-grid
                [toothStates]="treatment()!.toothStates"
                [procedures]="treatment()!.procedures"
                [readonly]="true"
              />
            </div>

            <!-- Mobile-only: Clinical notes (between odontogram and plan) -->
            <div class="mt-6 rounded-4xl bg-white p-6 shadow-(--shadow-card) lg:hidden">
              <div class="mb-3 flex items-center justify-between">
                <p
                  class="font-family-sans text-sm font-bold uppercase tracking-[1px] text-[#78716C]"
                >
                  Anotações Clínicas
                </p>
                <button
                  type="button"
                  class="grid h-7 w-7 place-items-center rounded-full cursor-pointer text-[#78716C] transition hover:bg-[#F3F3F3]"
                  (click)="openNotesDialog()"
                  aria-label="Editar anotações clínicas"
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path
                      d="M10.5 1.5L13.5 4.5L5 13H2V10L10.5 1.5Z"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <p class="text-sm leading-relaxed text-[#69594A]">{{ treatment()!.notes }}</p>
            </div>

            <!-- Execution plan header -->
            <div class="mt-8 flex items-center justify-between">
              <h2 class="font-family-serif text-[20px] font-bold text-[#1A1C1C]">
                Plano de Execução
              </h2>
              <a
                [routerLink]="['/treatments', id(), 'new']"
                class="flex items-center gap-2 rounded-xl bg-[#7C5145] px-5 py-2.5 text-sm font-bold text-white shadow-(--shadow-btn) transition hover:opacity-90"
              >
                <span class="text-lg leading-none">+</span>
                Adicionar Procedimento
              </a>
            </div>

            <!-- Procedure cards (grouped and sorted) -->
            <div class="mt-4 flex flex-col gap-4">
              @for (proc of sortedProcedures(); track proc.id) {
                <app-procedure-card
                  [procedure]="proc"
                  [allowComplete]="true"
                  [allowStart]="true"
                  (cardClick)="navigateToEdit(proc.id)"
                  (markComplete)="requestConfirm('complete', proc)"
                  (markStart)="requestConfirm('start', proc)"
                />
              }
            </div>
          </div>

          <!-- Right column -->
          <div class="flex w-full shrink-0 flex-col gap-8 lg:w-72">
            <app-budget-card
              [total]="treatment()!.totalBudget"
              [executed]="treatment()!.executed"
              [toPay]="treatment()!.toPay"
              (viewDetails)="showBudgetDialog.set(true)"
            />

            <!-- Clinical notes (desktop only) -->
            <div class="hidden rounded-4xl bg-white p-6 shadow-(--shadow-card) lg:block">
              <div class="mb-3 flex items-center justify-between">
                <p
                  class="font-family-sans text-sm font-bold uppercase tracking-[1px] text-[#78716C]"
                >
                  Anotações Clínicas
                </p>
                <button
                  type="button"
                  class="grid h-7 w-7 place-items-center rounded-full text-[#78716C] transition hover:bg-[#F3F3F3]"
                  (click)="openNotesDialog()"
                  aria-label="Editar anotações clínicas"
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path
                      d="M10.5 1.5L13.5 4.5L5 13H2V10L10.5 1.5Z"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <p class="text-sm leading-relaxed text-[#69594A]">{{ treatment()!.notes }}</p>
            </div>

            <app-journey-tracker
              [currentStep]="treatment()!.journeyStep"
              [nextStep]="'Iniciar extração dos sisos superiores (dentes 18 e 28)'"
            />
          </div>
        </div>
      </div>

      <!-- Confirmation dialog (complete or start) -->
      @if (confirmProcedure()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          (click)="cancelConfirm()"
        >
          <div
            class="w-full max-w-sm rounded-4xl bg-white p-8 shadow-[0_24px_64px_rgba(0,0,0,0.15)]"
            (click)="$event.stopPropagation()"
          >
            <div class="mb-2 flex items-center justify-between">
              <h2 class="font-family-serif m-0 text-xl font-normal text-[#1A1C1C]">
                {{
                  confirmType() === 'complete' ? 'Concluir Procedimento' : 'Iniciar Procedimento'
                }}
              </h2>
              <button
                type="button"
                class="grid h-8 w-8 place-items-center rounded-full text-[#78716C] transition hover:bg-[#F3F3F3]"
                (click)="cancelConfirm()"
                aria-label="Fechar"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M1 1l12 12M13 1L1 13"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </div>

            <p class="mb-1 text-sm text-[#78716C]">
              {{
                confirmType() === 'complete'
                  ? 'Tem certeza que deseja marcar este procedimento como concluído?'
                  : 'Tem certeza que deseja iniciar este procedimento?'
              }}
            </p>
            <p class="mb-6 text-sm font-semibold text-[#1A1C1C]">{{ confirmProcedure()!.name }}</p>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="rounded-xl bg-[#F3F3F3] px-5 py-2.5 text-sm font-bold text-[#78716C] transition hover:opacity-80"
                (click)="cancelConfirm()"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-(--shadow-btn) transition hover:opacity-90"
                [class]="confirmType() === 'complete' ? 'bg-[#16A34A]' : 'bg-[#7C5145]'"
                (click)="executeConfirm()"
              >
                {{ confirmType() === 'complete' ? 'Concluir' : 'Iniciar' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Budget dialog -->
      @if (showBudgetDialog()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          (click)="showBudgetDialog.set(false)"
        >
          <div
            class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-4xl bg-white p-8 shadow-[0_24px_64px_rgba(0,0,0,0.15)]"
            (click)="$event.stopPropagation()"
          >
            <div class="mb-6 flex items-center justify-between">
              <h2 class="font-family-serif m-0 text-xl font-normal text-[#1A1C1C]">
                Detalhes do Orçamento
              </h2>
              <button
                type="button"
                class="grid h-8 w-8 place-items-center rounded-full text-[#78716C] transition hover:bg-[#F3F3F3]"
                (click)="showBudgetDialog.set(false)"
                aria-label="Fechar"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M1 1l12 12M13 1L1 13"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </div>

            <div class="flex flex-col gap-2">
              @for (proc of sortedProcedures(); track proc.id) {
                <div class="flex items-center justify-between rounded-2xl bg-[#F9F9F9] px-4 py-3.5">
                  <div class="min-w-0 flex-1 pr-4">
                    <p
                      class="font-family-sans m-0 text-sm font-bold text-[#1A1C1C]"
                      [class.line-through]="proc.status === 'completed'"
                    >
                      {{ proc.name }}
                    </p>
                    <p class="font-family-sans mb-1.5 mt-1 text-xs text-[#69594A]">
                      {{ proc.type }}
                    </p>
                    <app-status-badge [status]="proc.status" />
                  </div>
                  <div class="shrink-0 text-right">
                    <p
                      class="font-family-sans m-0 text-base font-bold"
                      [class]="proc.status === 'completed' ? 'text-[#16A34A]' : 'text-[#1A1C1C]'"
                    >
                      {{ proc.value | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
                    </p>
                  </div>
                </div>
              }
            </div>

            <div class="mt-6 rounded-2xl bg-[#F3F3F3] p-4">
              <div class="mb-2 flex items-center justify-between">
                <span class="font-family-sans text-xs text-[#78716C]">Total do orçamento</span>
                <span class="font-family-sans text-sm font-bold text-[#1A1C1C]">
                  {{ treatment()!.totalBudget | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
                </span>
              </div>
              <div class="mb-2 flex items-center justify-between">
                <span class="font-family-sans text-xs text-[#78716C]">Executado</span>
                <span class="font-family-sans text-sm font-bold text-[#16A34A]">
                  {{ treatment()!.executed | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
                </span>
              </div>
              <div class="my-2 h-px bg-[#E7E5E4]"></div>
              <div class="flex items-center justify-between">
                <span class="font-family-sans text-[13px] font-bold text-[#7C5145]">A pagar</span>
                <span class="font-family-serif text-[18px] font-bold text-[#7C5145]">
                  {{ treatment()!.toPay | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Notes edit dialog -->
      @if (showNotesDialog()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          (click)="showNotesDialog.set(false)"
        >
          <div
            class="w-full max-w-md rounded-4xl bg-white p-8 shadow-[0_24px_64px_rgba(0,0,0,0.15)]"
            (click)="$event.stopPropagation()"
          >
            <div class="mb-5 flex items-center justify-between">
              <h2 class="font-family-serif m-0 text-xl font-normal text-[#1A1C1C]">
                Editar Anotações Clínicas
              </h2>
              <button
                type="button"
                class="grid h-8 w-8 place-items-center rounded-full text-[#78716C] transition hover:bg-[#F3F3F3]"
                (click)="showNotesDialog.set(false)"
                aria-label="Fechar"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M1 1l12 12M13 1L1 13"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </div>

            <textarea
              class="min-h-36 w-full resize-none rounded-xl bg-[#F3F3F3] p-4 text-sm leading-relaxed text-[#1A1C1C] focus:outline-none focus:ring-2 focus:ring-[#7C5145]/30"
              [value]="editingNotes()"
              (input)="editingNotes.set($any($event.target).value)"
              rows="6"
              placeholder="Adicione observações sobre o tratamento..."
            ></textarea>

            <div class="mt-4 flex justify-end gap-3">
              <button
                type="button"
                class="rounded-xl bg-[#F3F3F3] px-5 py-2.5 text-sm font-bold text-[#78716C] transition hover:opacity-80"
                (click)="showNotesDialog.set(false)"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="rounded-xl bg-[#7C5145] px-5 py-2.5 text-sm font-bold text-white shadow-(--shadow-btn) transition hover:opacity-90"
                (click)="saveNotes()"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      }
    }
  `,
})
export class TreatmentManagementPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private treatmentService = inject(TreatmentService);
  private platformId = inject(PLATFORM_ID);
  private readonly toast = inject(ToastService);

  protected id = computed(() => this.route.snapshot.paramMap.get('id') ?? '');

  protected loading = signal(true);
  protected loadError = signal<string | null>(null);
  private _data = signal<TreatmentData | null>(null);
  protected treatment = computed<TreatmentData | null>(() => this._data());

  protected sortedProcedures = computed<Procedure[]>(() => {
    const t = this._data();
    if (!t) return [];
    return [...t.procedures].sort((a, b) => {
      const groupDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      if (groupDiff !== 0) return groupDiff;
      return (a.startDate ?? '').localeCompare(b.startDate ?? '');
    });
  });

  protected showBudgetDialog = signal(false);
  protected showNotesDialog = signal(false);
  protected editingNotes = signal('');

  protected confirmProcedure = signal<Procedure | null>(null);
  protected confirmType = signal<ConfirmType>('complete');

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.load();
    }
  }

  protected reload(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.treatmentService.getTreatmentByPatient(this.id()).subscribe({
      next: (data) => {
        this._data.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loadError.set(
          err?.message ?? 'Erro desconhecido. Verifique sua conexão e tente novamente.',
        );
        this.loading.set(false);
      },
    });
  }

  protected navigateToEdit(procedureId: string): void {
    this.router.navigate(['/treatments', this.id(), 'edit'], {
      queryParams: { procedure: procedureId },
    });
  }

  protected goBack(): void {
    this.location.back();
  }

  protected openNotesDialog(): void {
    this.editingNotes.set(this._data()?.notes ?? '');
    this.showNotesDialog.set(true);
  }

  protected saveNotes(): void {
    const notes = this.editingNotes().trim();
    this._data.update((t) => (t ? { ...t, notes } : null));
    this.showNotesDialog.set(false);
    this.treatmentService.updateNotes(this._data()!.id, notes).subscribe({
      error: () => {
        // Notes saved locally; warn that the background sync failed
        this.toast.error('Não foi possível salvar as anotações no servidor.');
      },
    });
  }

  protected requestConfirm(type: ConfirmType, proc: Procedure): void {
    this.confirmType.set(type);
    this.confirmProcedure.set(proc);
  }

  protected cancelConfirm(): void {
    this.confirmProcedure.set(null);
  }

  protected executeConfirm(): void {
    const proc = this.confirmProcedure();
    if (!proc) return;

    if (this.confirmType() === 'complete') {
      this.applyComplete(proc);
    } else {
      this.applyStart(proc);
    }

    this.confirmProcedure.set(null);
  }

  private applyComplete(proc: Procedure): void {
    const today = new Date().toLocaleDateString('pt-BR');
    this._data.update((t) => {
      if (!t) return null;
      const updatedProcs = t.procedures.map((p) =>
        p.id === proc.id ? { ...p, status: 'completed' as ProcedureStatus, endDate: today } : p,
      );
      const executed = updatedProcs
        .filter((p) => p.status === 'completed')
        .reduce((sum, p) => sum + p.value, 0);
      return { ...t, procedures: updatedProcs, executed, toPay: t.totalBudget - executed };
    });
    forkJoin(proc.ids.map((id) => this.treatmentService.completeProcedure(id))).subscribe({
      error: () => {
        this.toast.error('Não foi possível concluir o procedimento. Recarregando os dados.');
        this.load();
      },
    });
  }

  private applyStart(proc: Procedure): void {
    const today = new Date().toLocaleDateString('pt-BR');
    this._data.update((t) => {
      if (!t) return null;
      const updatedProcs = t.procedures.map((p) =>
        p.id === proc.id ? { ...p, status: 'in_progress' as ProcedureStatus, startDate: today } : p,
      );
      return { ...t, procedures: updatedProcs };
    });
    forkJoin(
      proc.ids.map((id, i) =>
        this.treatmentService.startProcedure(id, proc.name, proc.value, proc.teeth[i] ?? null),
      ),
    ).subscribe({
      error: () => {
        this.toast.error('Não foi possível iniciar o procedimento. Recarregando os dados.');
        this.load();
      },
    });
  }
}
