import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Procedure } from '../../models/tratamento.model';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

type Variant = 'in_progress' | 'pending' | 'completed';

@Component({
  selector: 'app-procedure-card',
  imports: [CurrencyPipe, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="cardClass()"
      (click)="cardClick.emit()"
      role="button"
      [attr.tabindex]="0"
      (keydown.enter)="cardClick.emit()"
    >
      <!-- Left: icon + info -->
      <div class="flex min-w-0 flex-1 items-start gap-4">
        <div [class]="iconBgClass()">
          <img [src]="iconSrc()" alt="" width="20" height="20" [style.filter]="iconFilter()" />
        </div>

        <div class="min-w-0">
          <p
            class="[font-family:var(--font-family-sans)] text-[18px] font-bold leading-7 text-[#1A1C1C]"
            [class.line-through]="variant() === 'completed'"
          >
            {{ procedure().nome }}
          </p>
          <p class="text-sm text-[#69594A]">{{ procedure().subtitulo }}</p>
          <div class="mt-2 flex items-center gap-2">
            <app-status-badge [status]="procedure().status" />
            @if (procedure().dataInicio && variant() === 'in_progress') {
              <span class="[font-family:var(--font-family-sans)] text-[12px] font-medium text-[#7C5145]">
                Iniciado em {{ procedure().dataInicio }}
              </span>
            }
          </div>
        </div>
      </div>

      <!-- Right: amount + optional action buttons -->
      <div class="flex shrink-0 flex-col items-end gap-2">
        <div class="text-right">
          <p class="[font-family:var(--font-family-sans)] text-[20px] font-bold leading-7" [class]="amountColorClass()">
            {{ procedure().valor | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
          </p>
          @if (variant() === 'completed' && procedure().dataFim) {
            <p class="text-xs text-[#69594A]">Pago em {{ procedure().dataFim }}</p>
          } @else {
            <p class="text-xs text-[#69594A]">Valor do procedimento</p>
          }
        </div>

        @if (allowComplete() && variant() === 'in_progress') {
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-lg bg-[#DCFCE7] px-3 py-1.5 text-xs font-bold text-[#16A34A] transition hover:bg-[#BBF7D0]"
            (click)="$event.stopPropagation(); markComplete.emit()"
            aria-label="Concluir procedimento"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M1.5 5.5L4 8L9.5 2.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Concluir
          </button>
        }

        @if (allowStart() && variant() === 'pending') {
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-lg bg-[#7C5145]/10 px-3 py-1.5 text-xs font-bold text-[#7C5145] transition hover:bg-[#7C5145]/20"
            (click)="$event.stopPropagation(); markStart.emit()"
            aria-label="Iniciar procedimento"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M2.5 2L9 5.5L2.5 9V2Z" fill="currentColor" />
            </svg>
            Iniciar
          </button>
        }
      </div>
    </div>
  `,
})
export class ProcedureCardComponent {
  procedure = input.required<Procedure>();
  allowComplete = input(false);
  allowStart = input(false);
  cardClick = output<void>();
  markComplete = output<void>();
  markStart = output<void>();

  protected variant = computed<Variant>(() => {
    switch (this.procedure().status) {
      case 'em_andamento':
        return 'in_progress';
      case 'concluido':
        return 'completed';
      default:
        return 'pending';
    }
  });

  protected cardClass = computed(() => {
    const base =
      'flex cursor-pointer items-start justify-between rounded-xl p-6 gap-4 transition-opacity hover:opacity-90';
    switch (this.variant()) {
      case 'in_progress':
        return `${base} bg-[#7C5145]/5 border-l-4 border-[#7C5145]`;
      case 'completed':
        return `${base} bg-white opacity-60`;
      default:
        return `${base} bg-[#F3F3F3]`;
    }
  });

  protected iconBgClass = computed(() => {
    const base = 'grid h-12 w-12 shrink-0 place-items-center rounded-full';
    switch (this.variant()) {
      case 'in_progress':
        return `${base} bg-[#7C5145]/10`;
      case 'completed':
        return `${base} bg-[#DCFCE7]`;
      default:
        return `${base} bg-[#E7E5E4]`;
    }
  });

  protected iconFilter = computed(() =>
    this.variant() === 'completed'
      ? 'invert(42%) sepia(73%) saturate(559%) hue-rotate(98deg) brightness(94%) contrast(89%)'
      : '',
  );

  protected iconSrc = computed(() => {
    switch (this.procedure().tipo) {
      case 'Ortodontia':
        return '/ortho_icon.svg';
      case 'Endodontia':
        return '/endo_icon.svg';
      case 'Implante':
      case 'Prótese':
        return '/implante_icon.svg';
      case 'Prevenção':
      case 'Restauração':
      case 'Estética':
        return '/limpeza_icon.svg';
      default:
        return '/dente_icon.svg';
    }
  });

  protected amountColorClass = computed(() =>
    this.variant() === 'in_progress' ? 'text-[#7C5145]' : 'text-[#1A1C1C]',
  );
}
