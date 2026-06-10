import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-budget-card',
  imports: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="relative overflow-hidden rounded-[32px] p-8"
      style="background-color: #7C5145;"
    >
      <!-- Decorative blurred circle -->
      <div
        class="pointer-events-none absolute"
        style="width:192px; height:192px; right:-48px; top:-48px; background:#98695C; opacity:0.5; filter:blur(32px); border-radius:50%;"
      ></div>

      <div class="relative z-10">
        <p class="text-[20px] leading-snug text-white" style="font-family: 'Noto Serif', serif; font-weight: 400;">
          Resumo do Orçamento
        </p>
        <p class="mt-3 text-[36px] font-bold leading-none text-white" style="font-family: 'Noto Serif', serif;">
          {{ total() | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
        </p>

        <div class="my-6 h-px" style="background: rgba(255,255,255,0.1);"></div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-white/70">Executado</p>
            <p class="mt-1 text-[18px] font-bold text-white" style="font-family: Manrope, sans-serif;">
              {{ executado() | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
            </p>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-white/70">A Pagar</p>
            <p class="mt-1 text-[18px] font-bold text-white" style="font-family: Manrope, sans-serif;">
              {{ aPagar() | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="mt-6 w-full rounded-xl py-3 text-sm font-bold transition hover:opacity-90 cursor-pointer"
          style="background-color: #FFFFFF; color: #7C5145; border-radius: 12px;"
          (click)="viewDetails.emit()"
        >
          Ver Detalhes do Orçamento
        </button>
      </div>
    </div>
  `,
})
export class BudgetCardComponent {
  total = input.required<number>();
  executado = input.required<number>();
  aPagar = input.required<number>();
  viewDetails = output<void>();
}
