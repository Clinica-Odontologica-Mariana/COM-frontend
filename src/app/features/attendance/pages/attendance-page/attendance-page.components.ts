import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AttendanceBenefitsComponent } from '../../components/attendance-benefits/attendance-benefits.component';
import { AttendanceCtaComponent } from '../../components/attendance-cta/attendance-cta.component';
import { AttendanceFaqComponent } from '../../components/attendance-faq/attendance-faq.component';
import { AttendanceHeroComponent } from '../../components/attendance-hero/attendance-hero.component';
import { AttendanceJourneyComponent } from '../../components/attendance-journey/attendance-journey.component';
import { AttendanceMobilityPartnersComponent } from '../../components/attendance-mobility/attendance-mobility.component';
import {
  BENEFITS,
  FAQ_ITEMS,
  JOURNEY_STEPS,
  MOBILITY_HIGHLIGHTS,
} from '../../data/attendance.data';

@Component({
  selector: 'app-attendance-page',
  standalone: true,
  imports: [
    AttendanceHeroComponent,
    AttendanceJourneyComponent,
    AttendanceMobilityPartnersComponent,
    AttendanceBenefitsComponent,
    AttendanceFaqComponent,
    AttendanceCtaComponent,
  ],
  template: `
    <div class="bg-white md:bg-[#F9F9F9]">
      <app-attendance-hero />
      <app-attendance-journey [steps]="journeySteps" />

      <app-attendance-benefits class="md:hidden block" [benefits]="benefits" />

      <div class="md:hidden">
        <app-attendance-mobility-partners [highlights]="mobilityHighlights" />
      </div>

      <section class="hidden md:block bg-[#F3F3F3] mx-12 py-24 px-12 rounded-[48px] mb-8">
        <div class="flex flex-row items-center gap-16">
          <div class="flex-1 min-w-0">
            <app-attendance-mobility-partners [highlights]="mobilityHighlights" />
          </div>
          <div class="flex-1 min-w-0">
            <app-attendance-benefits [benefits]="benefits" />
          </div>
        </div>
      </section>

      <app-attendance-faq [items]="faqItems" />
      <app-attendance-cta />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendancePageComponent {
  protected readonly journeySteps = JOURNEY_STEPS;
  protected readonly mobilityHighlights = MOBILITY_HIGHLIGHTS;
  protected readonly benefits = BENEFITS;
  protected readonly faqItems = FAQ_ITEMS;
}
