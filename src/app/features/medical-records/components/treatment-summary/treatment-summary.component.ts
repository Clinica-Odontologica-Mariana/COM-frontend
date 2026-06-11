import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TreatmentSummaryView } from '../../models/patient-record.models';

@Component({
  selector: 'app-treatment-summary',
  template: `
    <section class="rounded-xl bg-[#F3F3F3] p-6 h-full">
      <p class="text-xs font-bold uppercase tracking-[1.2px] text-[#69594A]">Resumo do Treatment</p>

      @if (summary(); as s) {
        <div class="mt-4">
          <div class="flex items-baseline gap-2">
            <span class="text-5xl font-bold text-[#7C5145]" style="font-family: 'Noto Serif', serif"
              >{{ s.progressPercentage }}%</span
            >
            <span class="text-sm text-[#78716C]">{{ s.currentStep }}</span>
          </div>

          <p class="mt-4 text-sm leading-6 text-[#57534E] max-w-xs">{{ s.description }}</p>

          <div class="mt-5 h-1.5 rounded-full bg-[#E2D8D4]">
            <div
              class="h-1.5 rounded-full bg-[#7C5145] transition-all duration-500"
              [style.width.%]="s.progressPercentage"
            ></div>
          </div>
        </div>
      } @else {
        <div class="mt-4 space-y-3">
          <div class="h-12 w-32 animate-pulse rounded bg-[#E2D8D4]"></div>
          <div class="h-4 w-full animate-pulse rounded bg-[#E2D8D4]"></div>
          <div class="h-4 w-3/4 animate-pulse rounded bg-[#E2D8D4]"></div>
          <div class="h-2 w-full animate-pulse rounded-full bg-[#E2D8D4]"></div>
        </div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreatmentSummaryComponent {
  readonly summary = input<TreatmentSummaryView | null>(null);
}
