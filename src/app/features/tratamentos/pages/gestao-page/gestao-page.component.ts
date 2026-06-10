import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { getMockTratamento } from '../../data/mock-tratamento';
import { BudgetCardComponent } from '../../components/budget-card/budget-card.component';
import { JourneyTrackerComponent } from '../../components/journey-tracker/journey-tracker.component';
import { OdontogramGridComponent } from '../../components/odontogram-grid/odontogram-grid.component';
import { ProcedureCardComponent } from '../../components/procedure-card/procedure-card.component';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';

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
            class="text-[clamp(32px,4vw,48px)] leading-tight text-[#7C5145]"
            style="font-family: 'Noto Serif', serif; font-weight: 400;"
          >
            Gestão de Tratamentos
          </h1>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <span class="text-sm text-[#78716C]">Paciente:</span>
            <span
              class="rounded-full px-3 py-1 text-sm font-semibold text-[#1A1C1C]"
              style="background: #F3F3F3;"
              >{{ tratamento().patient.nome }}</span
            >
            <span class="text-sm text-[#78716C]">ID: #{{ tratamento().patient.codigo }}</span>
          </div>
        </div>

        <div class="flex shrink-0 flex-wrap items-center gap-3">
          <button
            type="button"
            class="cursor-pointer rounded-xl px-5 py-3 text-sm font-bold text-[#7C5145] transition hover:opacity-80"
            style="background: #F3F3F3; border-radius: 12px;"
          >
            Imprimir Plano
          </button>
          <button
            type="button"
            class="cursor-pointer rounded-xl px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
            style="background: #7C5145; border-radius: 12px; box-shadow: var(--shadow-btn);"
          >
            Finalizar Sessão
          </button>
        </div>
      </div>

      <!-- Two-column layout -->
      <div class="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
        <!-- Left column -->
        <div class="min-w-0 flex-1">
          <!-- Odontogram card -->
          <div class="rounded-[32px] bg-white p-6" style="box-shadow: var(--shadow-card);">
            <app-odontogram-grid
              [toothStates]="tratamento().toothStates"
              [procedures]="tratamento().procedures"
              [readonly]="true"
            />
          </div>

          <!-- Mobile-only: Clinical notes (between odontogram and plan) -->
          <div
            class="mt-6 rounded-[32px] bg-white p-6 lg:hidden"
            style="box-shadow: var(--shadow-card);"
          >
            <p
              class="mb-3 text-sm font-bold uppercase tracking-wider text-[#78716C]"
              style="font-family: Manrope, sans-serif; letter-spacing: 1px;"
            >
              Anotações Clínicas
            </p>
            <p class="text-sm leading-relaxed text-[#69594A]">{{ tratamento().observacoes }}</p>
          </div>

          <!-- Plano de execução header -->
          <div class="mt-8 flex items-center justify-between">
            <h2
              class="text-[20px] font-bold text-[#1A1C1C]"
              style="font-family: 'Noto Serif', serif;"
            >
              Plano de Execução
            </h2>
            <a
              [routerLink]="['/tratamentos', id(), 'novo']"
              class="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
              style="background: #7C5145; border-radius: 12px; box-shadow: var(--shadow-btn);"
            >
              <span class="text-lg leading-none">+</span>
              Adicionar Procedimento
            </a>
          </div>

          <!-- Procedure cards -->
          <div class="mt-4 flex flex-col gap-4">
            @for (proc of tratamento().procedures; track proc.id) {
              <app-procedure-card [procedure]="proc" (cardClick)="navigateToEdit(proc.id)" />
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
          <div
            class="hidden rounded-[32px] bg-white p-6 lg:block"
            style="box-shadow: var(--shadow-card);"
          >
            <p
              class="mb-3 text-sm font-bold uppercase tracking-wider text-[#78716C]"
              style="font-family: Manrope, sans-serif; letter-spacing: 1px;"
            >
              Anotações Clínicas
            </p>
            <p class="text-sm leading-relaxed text-[#69594A]">{{ tratamento().observacoes }}</p>
          </div>

          <app-journey-tracker
            [currentStep]="tratamento().journeyStep"
            [proximoPasso]="'Iniciar extração dos sisos superiores (dentes 18 e 28)'"
          />
        </div>
      </div>
    </div>

    <!-- Budget dialog -->
    @if (showBudgetDialog()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.45);"
        (click)="showBudgetDialog.set(false)"
      >
        <div
          class="w-full max-w-md rounded-[32px] bg-white p-8"
          style="box-shadow: 0 24px 64px rgba(0,0,0,0.15); max-height: 90vh; overflow-y: auto;"
          (click)="$event.stopPropagation()"
        >
          <!-- Dialog header -->
          <div class="mb-6 flex items-center justify-between">
            <h2
              style="font-family: 'Noto Serif', serif; font-weight: 400; font-size: 20px; color: #1A1C1C; margin: 0;"
            >
              Detalhes do Orçamento
            </h2>
            <button
              type="button"
              class="grid h-8 w-8 place-items-center rounded-full transition hover:bg-[#F3F3F3]"
              style="color: #78716C;"
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

          <!-- Procedure rows -->
          <div class="flex flex-col" style="gap: 8px;">
            @for (proc of tratamento().procedures; track proc.id) {
              <div
                class="flex items-center justify-between rounded-2xl"
                style="padding: 14px 16px; background: #F9F9F9;"
              >
                <div class="min-w-0 flex-1 pr-4">
                  <p
                    style="font-family: Manrope, sans-serif; font-size: 14px; font-weight: 700; color: #1A1C1C; margin: 0;"
                  >
                    {{ proc.nome }}
                  </p>
                  <p
                    style="font-family: Manrope, sans-serif; font-size: 12px; color: #69594A; margin: 4px 0 6px;"
                  >
                    {{ proc.tipo }}
                  </p>
                  <app-status-badge [status]="proc.status" />
                </div>
                <div class="shrink-0 text-right">
                  <p
                    style="font-family: Manrope, sans-serif; font-size: 16px; font-weight: 700; color: #1A1C1C; margin: 0;"
                  >
                    {{ proc.valor | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
                  </p>
                </div>
              </div>
            }
          </div>

          <!-- Summary -->
          <div class="mt-6 rounded-2xl" style="background: #F3F3F3; padding: 16px;">
            <div class="flex items-center justify-between" style="margin-bottom: 8px;">
              <span style="font-family: Manrope, sans-serif; font-size: 12px; color: #78716C;"
                >Total do orçamento</span
              >
              <span
                style="font-family: Manrope, sans-serif; font-size: 14px; font-weight: 700; color: #1A1C1C;"
              >
                {{ tratamento().totalOrcamento | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
              </span>
            </div>
            <div class="flex items-center justify-between" style="margin-bottom: 8px;">
              <span style="font-family: Manrope, sans-serif; font-size: 12px; color: #78716C;"
                >Executado</span
              >
              <span
                style="font-family: Manrope, sans-serif; font-size: 14px; font-weight: 700; color: #16A34A;"
              >
                {{ tratamento().executado | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
              </span>
            </div>
            <div class="h-px my-2" style="background: #E7E5E4;"></div>
            <div class="flex items-center justify-between">
              <span
                style="font-family: Manrope, sans-serif; font-size: 13px; font-weight: 700; color: #7C5145;"
                >A pagar</span
              >
              <span
                style="font-family: 'Noto Serif', serif; font-size: 18px; font-weight: 700; color: #7C5145;"
              >
                {{ tratamento().aPagar | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class GestaoPageComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected id = computed(() => this.route.snapshot.paramMap.get('id') ?? '1');
  protected tratamento = computed(() => getMockTratamento(this.id()));
  protected showBudgetDialog = signal(false);

  protected navigateToEdit(procedureId: string): void {
    this.router.navigate(['/tratamentos', this.id(), 'editar'], {
      queryParams: { procedimento: procedureId },
    });
  }
}
