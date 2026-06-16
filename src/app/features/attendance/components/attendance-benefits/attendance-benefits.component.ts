import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Benefit } from '../../models/attendance.model';

@Component({
  selector: 'app-attendance-benefits',
  template: `
    <div class="md:hidden flex flex-col gap-8 bg-white px-6 py-16">
      <h2 class="text-[#714A3E] text-3xl font-serif text-center leading-tight">
        Por que escolher o atendimento móvel?
      </h2>

      <div class="flex flex-col gap-4">
        @for (benefit of benefits(); track benefit.title) {
          <div class="flex items-center gap-4 p-4 rounded-lg bg-[#FBF9F8]">
            <div
              class="flex items-center justify-center w-10 h-10 rounded-full bg-[#FFDBD0] shrink-0"
            >
              <span class="material-symbols-outlined text-[#714A3E] text-xl">
                {{ benefit.icon }}
              </span>
            </div>
            <div class="flex flex-col gap-0.5">
              <h3 class="text-[#714A3E] text-base leading-6">{{ benefit.title }}</h3>
              <p class="text-[#635D58] text-sm leading-5">{{ benefit.description }}</p>
            </div>
          </div>
        }
      </div>
    </div>

    <div class="hidden md:flex flex-col w-full">
      <div class="flex flex-col items-start mb-10 md:mb-12">
        <h2 class="text-[#7C5145] text-4xl md:text-5xl font-serif leading-tight">
          Por que escolher o<br />atendimento móvel?
        </h2>
      </div>

      <div class="flex flex-col gap-8">
        @for (benefit of benefits(); track benefit.title) {
          <div class="flex items-start">
            <div
              class="flex items-center justify-center w-12 h-12 bg-[#EEEEEE] rounded-full mr-6 shrink-0"
            >
              <span class="material-symbols-outlined text-[#7C5145] text-3xl">
                {{ benefit.icon }}
              </span>
            </div>
            <div class="flex flex-col gap-1 pt-0.5">
              <h3 class="text-[#1A1C1C] text-base font-bold">{{ benefit.title }}</h3>
              <p class="text-[#514440] text-base leading-relaxed">{{ benefit.description }}</p>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceBenefitsComponent {
  readonly benefits = input.required<Benefit[]>();
}
