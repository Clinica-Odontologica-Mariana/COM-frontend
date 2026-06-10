import { CurrencyPipe, Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { getMockTratamento } from '../../data/mock-tratamento';
import { Procedure, ProcedureStatus, TratamentoData } from '../../models/tratamento.model';
import { TratamentoService } from '../../services/tratamento.service';
import { BudgetCardComponent } from '../../components/budget-card/budget-card.component';
import { JourneyTrackerComponent } from '../../components/journey-tracker/journey-tracker.component';
import { OdontogramGridComponent } from '../../components/odontogram-grid/odontogram-grid.component';
import { ProcedureCardComponent } from '../../components/procedure-card/procedure-card.component';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';

type ConfirmType = 'complete' | 'start';

const STATUS_ORDER: Record<ProcedureStatus, number> = {
  em_andamento: 0,
  pendente: 1,
  planejado: 1,
  concluido: 2,
  interrompido: 3,
};

@Component({
  selector: 'app-gestao-page',
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
            <span class="rounded-full bg-[#F3F3F3] px-3 py-1 text-sm font-semibold text-[#1A1C1C]">
              {{ tratamento().patient.nome }}
            </span>
            <span class="text-sm text-[#78716C]">ID: #{{ tratamento().patient.codigo }}</span>
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
            Voltar aos Pacientes
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
              [toothStates]="tratamento().toothStates"
              [procedures]="tratamento().procedures"
              [readonly]="true"
            />
          </div>

          <!-- Mobile-only: Clinical notes (between odontogram and plan) -->
          <div class="mt-6 rounded-[32px] bg-white p-6 shadow-[var(--shadow-card)] lg:hidden">
            <div class="mb-3 flex items-center justify-between">
              <p
                class="[font-family:var(--font-family-sans)] text-sm font-bold uppercase tracking-[1px] text-[#78716C]"
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
            <p class="text-sm leading-relaxed text-[#69594A]">{{ tratamento().observacoes }}</p>
          </div>

          <!-- Plano de execução header -->
          <div class="mt-8 flex items-center justify-between">
            <h2 class="[font-family:var(--font-family-serif)] text-[20px] font-bold text-[#1A1C1C]">
              Plano de Execução
            </h2>
            <a
              [routerLink]="['/tratamentos', id(), 'novo']"
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
            [total]="tratamento().totalOrcamento"
            [executado]="tratamento().executado"
            [aPagar]="tratamento().aPagar"
            (viewDetails)="showBudgetDialog.set(true)"
          />

          <!-- Clinical notes (desktop only) -->
          <div class="hidden rounded-4xl bg-white p-6 shadow-[var(--shadow-card)] lg:block">
            <div class="mb-3 flex items-center justify-between">
              <p
                class="[font-family:var(--font-family-sans)] text-sm font-bold uppercase tracking-[1px] text-[#78716C]"
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
            <p class="text-sm leading-relaxed text-[#69594A]">{{ tratamento().observacoes }}</p>
          </div>

          <app-journey-tracker
            [currentStep]="tratamento().journeyStep"
            [proximoPasso]="'Iniciar extração dos sisos superiores (dentes 18 e 28)'"
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
          class="w-full max-w-sm rounded-[32px] bg-white p-8 shadow-[0_24px_64px_rgba(0,0,0,0.15)]"
          (click)="$event.stopPropagation()"
        >
          <div class="mb-2 flex items-center justify-between">
            <h2 class="[font-family:var(--font-family-serif)] m-0 text-xl font-normal text-[#1A1C1C]">
              {{ confirmType() === 'complete' ? 'Concluir Procedimento' : 'Iniciar Procedimento' }}
            </h2>
            <button
              type="button"
              class="grid h-8 w-8 place-items-center rounded-full text-[#78716C] transition hover:bg-[#F3F3F3]"
              (click)="cancelConfirm()"
              aria-label="Fechar"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <p class="mb-1 text-sm text-[#78716C]">
            {{ confirmType() === 'complete'
              ? 'Tem certeza que deseja marcar este procedimento como concluído?'
              : 'Tem certeza que deseja iniciar este procedimento?' }}
          </p>
          <p class="mb-6 text-sm font-semibold text-[#1A1C1C]">{{ confirmProcedure()!.nome }}</p>

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
          class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[32px] bg-white p-8 shadow-[0_24px_64px_rgba(0,0,0,0.15)]"

          (click)="$event.stopPropagation()"
        >
          <div class="mb-6 flex items-center justify-between">
            <h2
              class="[font-family:var(--font-family-serif)] m-0 text-xl font-normal text-[#1A1C1C]"
            >
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
              <div
                class="flex items-center justify-between rounded-2xl bg-[#F9F9F9] px-4 py-[14px]"
              >
                <div class="min-w-0 flex-1 pr-4">
                  <p
                    class="[font-family:var(--font-family-sans)] m-0 text-sm font-bold text-[#1A1C1C]"
                    [class.line-through]="proc.status === 'concluido'"
                  >
                    {{ proc.nome }}
                  </p>
                  <p
                    class="[font-family:var(--font-family-sans)] mb-1.5 mt-1 text-xs text-[#69594A]"
                  >
                    {{ proc.tipo }}
                  </p>
                  <app-status-badge [status]="proc.status" />
                </div>
                <div class="shrink-0 text-right">
                  <p
                    class="[font-family:var(--font-family-sans)] m-0 text-base font-bold"
                    [class]="proc.status === 'concluido' ? 'text-[#16A34A]' : 'text-[#1A1C1C]'"
                  >
                    {{ proc.valor | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
                  </p>
                </div>
              </div>
            }
          </div>

          <div class="mt-6 rounded-2xl bg-[#F3F3F3] p-4">
            <div class="mb-2 flex items-center justify-between">
              <span class="[font-family:var(--font-family-sans)] text-xs text-[#78716C]"
                >Total do orçamento</span
              >
              <span class="[font-family:var(--font-family-sans)] text-sm font-bold text-[#1A1C1C]">
                {{ tratamento().totalOrcamento | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
              </span>
            </div>
            <div class="mb-2 flex items-center justify-between">
              <span class="[font-family:var(--font-family-sans)] text-xs text-[#78716C]"
                >Executado</span
              >
              <span class="[font-family:var(--font-family-sans)] text-sm font-bold text-[#16A34A]">
                {{ tratamento().executado | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
              </span>
            </div>
            <div class="my-2 h-px bg-[#E7E5E4]"></div>
            <div class="flex items-center justify-between">
              <span
                class="[font-family:var(--font-family-sans)] text-[13px] font-bold text-[#7C5145]"
                >A pagar</span
              >
              <span
                class="[font-family:var(--font-family-serif)] text-[18px] font-bold text-[#7C5145]"
              >
                {{ tratamento().aPagar | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
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
          class="w-full max-w-md rounded-[32px] bg-white p-8 shadow-[0_24px_64px_rgba(0,0,0,0.15)]"
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
            [value]="editingObs()"
            (input)="editingObs.set($any($event.target).value)"
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
  `,
})
export class GestaoPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private tratamentoService = inject(TratamentoService);

  protected id = computed(() => this.route.snapshot.paramMap.get('id') ?? '1');

  private _data = signal<TratamentoData | null>(null);
  protected tratamento = computed<TratamentoData>(
    () => this._data() ?? getMockTratamento(this.id()),
  );

  protected sortedProcedures = computed<Procedure[]>(() => {
    return [...this.tratamento().procedures].sort((a, b) => {
      const groupDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      if (groupDiff !== 0) return groupDiff;
      return (a.dataInicio ?? '').localeCompare(b.dataInicio ?? '');
    });
  });

  protected showBudgetDialog = signal(false);
  protected showNotesDialog = signal(false);
  protected editingObs = signal('');

  protected confirmProcedure = signal<Procedure | null>(null);
  protected confirmType = signal<ConfirmType>('complete');

  ngOnInit(): void {
    this.tratamentoService.getTratamento(this.id()).subscribe((data) => this._data.set(data));
  }

  protected navigateToEdit(procedureId: string): void {
    this.router.navigate(['/tratamentos', this.id(), 'editar'], {
      queryParams: { procedimento: procedureId },
    });
  }

  protected goBack(): void {
    this.location.back();
  }

  protected openNotesDialog(): void {
    this.editingObs.set(this.tratamento().observacoes);
    this.showNotesDialog.set(true);
  }

  protected saveNotes(): void {
    const obs = this.editingObs().trim();
    this._data.update((t) => (t ? { ...t, observacoes: obs } : null));
    this.showNotesDialog.set(false);
    this.tratamentoService.updateObservacoes(this.id(), obs).subscribe();
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
        p.id === proc.id ? { ...p, status: 'concluido' as ProcedureStatus, dataFim: today } : p,
      );
      const executado = updatedProcs
        .filter((p) => p.status === 'concluido')
        .reduce((sum, p) => sum + p.valor, 0);
      return { ...t, procedures: updatedProcs, executado, aPagar: t.totalOrcamento - executado };
    });
    this.tratamentoService.completeProcedure(proc.id).subscribe();
  }

  private applyStart(proc: Procedure): void {
    const today = new Date().toLocaleDateString('pt-BR');
    this._data.update((t) => {
      if (!t) return null;
      const updatedProcs = t.procedures.map((p) =>
        p.id === proc.id ? { ...p, status: 'em_andamento' as ProcedureStatus, dataInicio: today } : p,
      );
      return { ...t, procedures: updatedProcs };
    });
    this.tratamentoService.startProcedure(proc.id, proc.nome).subscribe();
  }
}
