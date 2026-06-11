import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-budget-card',
  imports: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative overflow-hidden rounded-[32px] bg-[#7C5145] p-8">
      <!-- Decorative blur circle -->
      <div
        class="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#98695C] opacity-50 blur-[32px]"
      ></div>

      <div class="relative z-10">
        <p class="[font-family:var(--font-family-serif)] text-[20px] font-normal leading-snug text-white">
          Resumo do Orçamento
        </p>
        <p class="[font-family:var(--font-family-serif)] mt-3 text-[36px] font-bold leading-none text-white">
          {{ total() | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
        </p>

        <div class="my-6 h-px bg-white/10"></div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-white/70">Executado</p>
            <p class="[font-family:var(--font-family-sans)] mt-1 text-[18px] font-bold text-white">
              {{ executed() | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
            </p>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-white/70">A Pagar</p>
            <p class="[font-family:var(--font-family-sans)] mt-1 text-[18px] font-bold text-white">
              {{ toPay() | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="mt-6 w-full cursor-pointer rounded-xl bg-white py-3 text-sm font-bold text-[#7C5145] transition hover:opacity-90"
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
  executed = input.required<number>();
  toPay = input.required<number>();
  viewDetails = output<void>();
}
