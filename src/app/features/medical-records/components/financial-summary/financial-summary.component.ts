import { CurrencyPipe, formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { BalanceView, LastVisitView } from '../../models/patient-record.models';

@Component({
  selector: 'app-financial-summary',
  imports: [CurrencyPipe],
  template: `
    <div class="flex flex-col gap-4 sm:flex-row h-full">
      <!-- Última visita -->
      <section class="flex-1 rounded-xl bg-[#F3F3F3] p-6">
        <p class="text-xs font-bold uppercase tracking-[1.2px] text-[#69594A]">Última Visita</p>

        @if (lastVisit(); as v) {
          <div class="mt-3">
            <p
              class="text-3xl font-bold text-[#7C5145] leading-tight"
              style="font-family: 'Noto Serif', serif"
            >
              {{ shortDate() }}
            </p>
            <p class="mt-1 text-xs text-[#78716C] leading-5 line-clamp-2">{{ v.description }}</p>
          </div>
        } @else {
          <div class="mt-3 space-y-2">
            <div class="h-8 w-24 animate-pulse rounded bg-[#E2D8D4]"></div>
            <div class="h-4 w-32 animate-pulse rounded bg-[#E2D8D4]"></div>
          </div>
        }
      </section>

      <!-- Valor dos treatments -->
      <section class="flex-1 rounded-xl bg-[#7C5145] p-6 flex flex-col justify-between">
        <p class="text-xs font-bold uppercase tracking-[1.2px] text-white/60">
          Valor dos treatments
        </p>

        @if (balance(); as b) {
          <div class="mt-3">
            <p
              class="text-3xl font-bold text-white leading-tight"
              style="font-family: 'Noto Serif', serif"
            >
              {{ b.amount | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
            </p>
            <p class="mt-1 text-xs text-white/60">Valor estimado do plano</p>
          </div>
        } @else {
          <div class="mt-3 space-y-2">
            <div class="h-8 w-28 animate-pulse rounded bg-white/20"></div>
            <div class="h-4 w-32 animate-pulse rounded bg-white/20"></div>
          </div>
        }
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancialSummaryComponent {
  readonly balance = input<BalanceView | null>(null);
  readonly lastVisit = input<LastVisitView | null>(null);

  protected readonly shortDate = computed(() => {
    const date = this.lastVisit()?.date;
    if (!date) return '';
    return formatDate(date, 'd MMM', 'pt-BR').replace(/\.$/, '');
  });
}
