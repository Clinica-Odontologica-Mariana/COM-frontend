import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  Appointment,
  BLOCKED_EVENT_COLOR,
  CalendarDay,
  LOCATION_COLORS,
} from '../models/appointment.model';
import { CalendarEventChipComponent } from './calendar-event-chip.component';
import { getWeekdayHeaders, getWeekdayHeadersShort } from '../utils/calendar.utils';

@Component({
  selector: 'app-calendar-month-grid',
  imports: [CalendarEventChipComponent, CalendarEventChipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="overflow-hidden rounded-2xl border border-[#D5C2BD]/10 bg-white shadow-sm">
      <div class="grid grid-cols-7 border-b border-[#D5C2BD]/20">
        @for (header of weekdayHeaders; track header; let i = $index) {
          <div
            class="px-0.5 py-2 text-center text-[10px] font-bold tracking-wide text-[#514440] uppercase sm:px-3 sm:py-2.5 sm:tracking-widest"
          >
            <span class="sm:hidden">{{ weekdayHeadersShort[i] }}</span>
            <span class="hidden sm:inline">{{ header }}</span>
          </div>
        }
      </div>

      <div class="grid grid-cols-7">
        @for (day of days(); track day.isoDate) {
          <div
            class="min-h-13 border-r border-b border-[#D5C2BD]/10 px-0.5 py-1 last:border-r-0 sm:min-h-27.5 sm:px-3 sm:py-2"
            [class.bg-[#F3F3F3]/20]="!day.isCurrentMonth && !day.isToday"
            [class.bg-[#FFDBD1]/70]="day.isToday"
          >
            <span
              class="mb-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] sm:mb-1 sm:h-6 sm:min-w-6 sm:px-1.5 sm:text-xs"
              [class.bg-[#7C5145]]="day.isToday"
              [class.font-bold]="day.isToday"
              [class.text-white]="day.isToday"
              [class.font-semibold]="day.isCurrentMonth && !day.isToday"
              [class.text-[#514440]]="day.isCurrentMonth && !day.isToday"
              [class.text-[#83746F]]="!day.isCurrentMonth && !day.isToday"
            >
              {{ day.dayNumber }}
            </span>

            <div class="flex flex-wrap justify-center gap-0.5 sm:hidden">
              @for (apt of dayEvents(day.isoDate, 3); track apt.id) {
                <span
                  class="h-1.5 w-1.5 shrink-0 rounded-full"
                  [style.background-color]="dotColor(apt)"
                ></span>
              }
              @if (extraCount(day.isoDate, 3) > 0) {
                <span class="text-[8px] font-semibold leading-none text-[#78716C]">
                  +{{ extraCount(day.isoDate, 3) }}
                </span>
              }
            </div>

            <div class="hidden flex-col gap-1 sm:flex">
              @for (apt of dayEvents(day.isoDate); track apt.id) {
                <app-calendar-event-chip [appointment]="apt" />
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class CalendarMonthGridComponent {
  readonly days = input.required<CalendarDay[]>();
  readonly appointments = input.required<Appointment[]>();

  protected readonly weekdayHeaders = getWeekdayHeaders();
  protected readonly weekdayHeadersShort = getWeekdayHeadersShort();

  private readonly eventsByDay = computed(() => {
    const map = new Map<string, Appointment[]>();
    for (const apt of this.appointments()) {
      const list = map.get(apt.date) ?? [];
      list.push(apt);
      map.set(apt.date, list);
    }
    return map;
  });

  protected dayEvents(isoDate: string, limit?: number): Appointment[] {
    const events = this.eventsByDay().get(isoDate) ?? [];
    return limit != null ? events.slice(0, limit) : events;
  }

  protected extraCount(isoDate: string, limit: number): number {
    const events = this.eventsByDay().get(isoDate) ?? [];
    return Math.max(0, events.length - limit);
  }

  protected dotColor(apt: Appointment): string {
    if (apt.isBlocked || !apt.location) return BLOCKED_EVENT_COLOR.bg;
    return LOCATION_COLORS[apt.location].dot;
  }
}
