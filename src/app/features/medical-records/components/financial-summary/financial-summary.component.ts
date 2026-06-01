import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { FinancialSummaryDTO } from '../../models/patient-record.models';

@Component({
  selector: 'app-financial-summary',
  imports: [CurrencyPipe, DatePipe],
  template: `
    <section class="rounded-lg border border-[#E7DCD5] bg-white p-5 shadow-sm">
      <p class="text-sm font-semibold text-[#A77769]">Resumo financeiro</p>

      @if (financial(); as financial) {
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p class="text-xs font-semibold uppercase text-[#8D7A71]">Saldo</p>
            <p class="mt-1 text-2xl font-semibold text-[#3F322D]">
              {{ financial.balance | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
            </p>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase text-[#8D7A71]">Proxima fatura</p>
            <p class="mt-1 text-2xl font-semibold text-[#3F322D]">
              {{ financial.nextDueDate | date: 'dd/MM/yyyy' }}
            </p>
          </div>
        </div>
      } @else {
        <div class="mt-4 h-20 animate-pulse rounded-lg bg-[#EFE7E3]"></div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancialSummaryComponent {
  readonly financial = input<FinancialSummaryDTO | null>(null);
}
