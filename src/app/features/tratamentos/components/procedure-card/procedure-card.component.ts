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
      class="flex cursor-pointer items-center justify-between rounded-xl transition-opacity hover:opacity-90"
      style="padding: 24px; gap: 16px;"
      [style.background-color]="cardBg()"
      [style.border-left]="borderLeft()"
      [style.opacity]="variant() === 'completed' ? '0.6' : '1'"
      (click)="cardClick.emit()"
      role="button"
      [attr.tabindex]="0"
      (keydown.enter)="cardClick.emit()"
    >
      <!-- Left: icon + info -->
      <div class="flex items-start gap-4 min-w-0 flex-1">
        <!-- Icon circle -->
        <div
          class="grid h-12 w-12 shrink-0 place-items-center rounded-full"
          [style.background-color]="iconBg()"
        >
          <img [src]="iconSrc()" alt="" width="20" height="20" />
        </div>

        <!-- Text content -->
        <div class="min-w-0">
          <p
            class="text-[18px] font-bold leading-7 text-[#1A1C1C]"
            style="font-family: Manrope, sans-serif;"
            [class.line-through]="variant() === 'completed'"
          >
            {{ procedure().nome }}
          </p>
          <p class="text-sm text-[#69594A]">{{ procedure().subtitulo }}</p>
          <div class="mt-2 flex items-center gap-2">
            <app-status-badge [status]="procedure().status" />
            @if (procedure().dataInicio && variant() === 'in_progress') {
              <span class="text-[12px] font-medium text-[#7C5145]" style="font-family: Manrope, sans-serif;">
                Iniciado em {{ procedure().dataInicio }}
              </span>
            }
          </div>
        </div>
      </div>

      <!-- Right: amount -->
      <div class="shrink-0 text-right">
        <p
          class="text-[20px] font-bold leading-7"
          style="font-family: Manrope, sans-serif;"
          [style.color]="amountColor()"
        >
          {{ procedure().valor | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
        </p>
        @if (variant() === 'completed' && procedure().dataFim) {
          <p class="text-xs text-[#69594A]">Pago em {{ procedure().dataFim }}</p>
        } @else {
          <p class="text-xs text-[#69594A]">Valor do procedimento</p>
        }
      </div>
    </div>
  `,
})
export class ProcedureCardComponent {
  procedure = input.required<Procedure>();
  cardClick = output<void>();

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

  protected cardBg = computed(() => {
    switch (this.variant()) {
      case 'in_progress':
        return 'rgba(124,81,69,0.05)';
      case 'completed':
        return '#FFFFFF';
      default:
        return '#F3F3F3';
    }
  });

  protected borderLeft = computed(() =>
    this.variant() === 'in_progress' ? '4px solid #7C5145' : 'none',
  );

  protected iconBg = computed(() => {
    switch (this.variant()) {
      case 'in_progress':
        return 'rgba(124,81,69,0.10)';
      case 'completed':
        return '#DCFCE7';
      default:
        return '#E7E5E4';
    }
  });

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

  protected amountColor = computed(() =>
    this.variant() === 'in_progress' ? '#7C5145' : '#1A1C1C',
  );
}
