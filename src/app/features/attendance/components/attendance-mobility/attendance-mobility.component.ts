import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MobilityHighlight } from '../../models/attendance.model';

@Component({
  selector: 'app-attendance-mobility-partners',
  template: `
    <div class="md:hidden flex flex-row justify-center gap-4 px-4 py-10">
      <div class="flex flex-col items-center gap-3 flex-1">
        <img
          [src]="highlights()[1].image"
          [alt]="highlights()[1].imageAlt"
          class="w-full aspect-square object-cover rounded-3xl"
        />
        <span class="text-[#514440] text-xs font-bold tracking-widest uppercase">
          {{ highlights()[1].title }}
        </span>
      </div>
      <div class="flex flex-col items-center gap-3 flex-1">
        <img
          [src]="highlights()[0].image"
          [alt]="highlights()[0].imageAlt"
          class="w-full aspect-square object-cover rounded-3xl"
        />
        <span class="text-[#514440] text-xs font-bold tracking-widest uppercase">
          {{ highlights()[0].title }}
        </span>
      </div>
    </div>

    <div class="hidden md:flex flex-row justify-center gap-4 w-full">
      <div class="flex flex-col items-center gap-4 flex-1 min-w-0">
        <img
          [src]="highlights()[0].image"
          [alt]="highlights()[0].imageAlt"
          class="w-full h-64 object-cover rounded-3xl"
        />
        <div class="flex flex-col items-start bg-[#FFDAD3] p-6 gap-2 rounded-2xl w-full">
          <span class="text-[#30130D] text-lg font-medium">{{ highlights()[0].title }}</span>
          <span class="text-[#30130D] text-sm leading-relaxed">
            {{ highlights()[0].description }}
          </span>
        </div>
      </div>

      <div class="flex flex-col items-start gap-4 mt-12 flex-1 min-w-0">
        <div
          class="flex flex-col items-start bg-white p-6 gap-2 rounded-2xl w-full"
          style="box-shadow: 0px 1px 2px #0000000D"
        >
          <span class="text-[#7C5145] text-lg font-medium">{{ highlights()[1].title }}</span>
          <span class="text-[#514440] text-sm leading-relaxed">
            {{ highlights()[1].description }}
          </span>
        </div>
        <img
          [src]="highlights()[1].image"
          [alt]="highlights()[1].imageAlt"
          class="w-full h-80 object-cover rounded-3xl"
        />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceMobilityPartnersComponent {
  readonly highlights = input.required<MobilityHighlight[]>();
}
