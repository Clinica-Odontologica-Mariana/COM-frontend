import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TreatmentSummaryDTO } from '../../models/patient-record.models';

@Component({
  selector: 'app-treatment-summary',
  template: `
    <section class="rounded-lg border border-[#E7DCD5] bg-white p-5 shadow-sm">
      <p class="text-sm font-semibold text-[#A77769]">Resumo do tratamento</p>

      @if (summary(); as summary) {
        <div class="mt-4 flex items-end justify-between gap-4">
          <div>
            <div class="text-4xl font-semibold text-[#3F322D]">{{ summary.progressPercentage }}%</div>
            <p class="mt-2 text-sm text-[#76645B]">{{ summary.description }}</p>
          </div>
          <span class="rounded-lg bg-[#EFE7E3] px-3 py-2 text-sm font-semibold text-[#7B564A]">
            {{ summary.currentStep }}
          </span>
        </div>

        <div class="mt-5 h-2 rounded-full bg-[#EFE7E3]">
          <div
            class="h-2 rounded-full bg-[#A77769]"
            [style.width.%]="summary.progressPercentage"
          ></div>
        </div>
      } @else {
        <div class="mt-4 h-24 animate-pulse rounded-lg bg-[#EFE7E3]"></div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreatmentSummaryComponent {
  readonly summary = input<TreatmentSummaryDTO | null>(null);
}
