import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Appointment, WeekDayColumn } from '../../models/appointment.model';
import { CalendarEventChipComponent } from '../calendar-event-chip/calendar-event-chip.component';
import { formatWeekDayHeading } from '../../utils/calendar.utils';

@Component({
  selector: 'app-calendar-week-grid',
  imports: [CalendarEventChipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Mobile: lista vertical por dia -->
    <div class="flex flex-col gap-3 sm:hidden">
      @for (col of columns(); track col.isoDate) {
        <section
          class="overflow-hidden rounded-2xl border border-[#D5C2BD]/10 bg-white shadow-sm"
        >
          <header
            class="flex items-center gap-3 border-b border-[#D5C2BD]/10 px-4 py-3"
            [class.bg-[#FFDBD1]/70]="col.isToday"
          >
            <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              [class.bg-[#7C5145]]="col.isToday"
              [class.text-white]="col.isToday"
              [class.bg-[#F3F3F3]]="!col.isToday"
              [class.text-[#514440]]="!col.isToday"
            >
              {{ col.dayNumber }}
            </span>
            <p
              class="text-sm font-semibold"
              [class.text-[#7C5145]]="col.isToday"
              [class.text-[#514440]]="!col.isToday"
            >
              {{ dayHeading(col) }}
            </p>
            @if (col.isToday) {
              <span class="ml-auto rounded-full bg-[#7C5145] px-2 py-0.5 text-[10px] font-bold text-white">
                Hoje
              </span>
            }
          </header>

          <div class="flex flex-col gap-2 p-3">
            @if (eventsForDay(col.isoDate).length === 0) {
              <p class="py-2 text-center text-xs text-[#A8A29E]">Sem agendamentos</p>
            } @else {
              @for (apt of eventsForDay(col.isoDate); track apt.id) {
                <app-calendar-event-chip [appointment]="apt" [compact]="true" />
              }
            }
          </div>
        </section>
      }
    </div>

    <!-- Desktop: grade semanal -->
    <div class="hidden overflow-hidden rounded-2xl border border-[#D5C2BD]/10 bg-white shadow-sm sm:block">
      <div class="grid grid-cols-7 border-b border-[#D5C2BD]/20">
        @for (col of columns(); track col.isoDate) {
          <div
            class="border-r border-[#D5C2BD]/10 px-2 py-3 text-center last:border-r-0"
            [class.bg-[#FFDBD1]/70]="col.isToday"
          >
            <p
              class="text-[10px] font-bold tracking-widest uppercase"
              [class.text-[#7C5145]]="col.isToday"
              [class.text-[#514440]]="!col.isToday"
            >
              {{ col.weekdayLabel }}
            </p>
            <p
              class="mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold"
              [class.bg-[#7C5145]]="col.isToday"
              [class.text-white]="col.isToday"
              [class.text-[#514440]]="!col.isToday"
            >
              {{ col.dayNumber }}
            </p>
          </div>
        }
      </div>

      <div class="grid min-h-[400px] grid-cols-7">
        @for (col of columns(); track col.isoDate) {
          <div
            class="border-r border-[#D5C2BD]/10 p-2 last:border-r-0"
            [class.bg-[#FFDBD1]/70]="col.isToday"
          >
            <div class="flex flex-col gap-2">
              @for (apt of eventsForDay(col.isoDate); track apt.id) {
                <app-calendar-event-chip [appointment]="apt" />
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class CalendarWeekGridComponent {
  readonly columns = input.required<WeekDayColumn[]>();
  readonly appointments = input.required<Appointment[]>();

  protected eventsForDay(isoDate: string): Appointment[] {
    return this.appointments().filter((a) => a.date === isoDate);
  }

  protected dayHeading(col: WeekDayColumn): string {
    return formatWeekDayHeading(col.date);
  }
}

