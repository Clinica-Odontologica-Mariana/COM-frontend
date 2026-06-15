import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  Appointment,
  BLOCKED_EVENT_COLOR,
  LOCATION_COLORS,
  LOCATION_LABELS,
  PROCEDURE_LABELS,
} from '../models/appointment.model';
import { abbreviateName } from '../utils/calendar.utils';

@Component({
  selector: 'app-calendar-event-chip',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (appointment().isBlocked) {
      <div
        class="w-full rounded-md font-bold leading-tight"
        [class.px-1.5]="!compact()"
        [class.py-1.5]="!compact()"
        [class.px-2.5]="compact()"
        [class.py-2]="compact()"
        [class.text-[9px]]="!compact()"
        [class.text-xs]="compact()"
        [style.background-color]="blockedColor.bg"
        [style.color]="blockedColor.text"
      >
        {{ appointment().title }}
      </div>
    } @else {
      <a
        [routerLink]="['/schedule', appointment().id, 'edit']"
        class="block w-full rounded-md leading-tight transition hover:opacity-90"
        [class.px-1.5]="!compact()"
        [class.py-1.5]="!compact()"
        [class.px-2.5]="compact()"
        [class.py-2]="compact()"
        [class.text-[9px]]="!compact()"
        [class.text-xs]="compact()"
        [style.background-color]="chipStyle().bg"
        [style.color]="chipStyle().text"
      >
        <p class="font-bold">{{ displayName() }}</p>
        <p class="opacity-90">{{ subtitle() }}</p>
      </a>
    }
  `,
})
export class CalendarEventChipComponent {
  readonly appointment = input.required<Appointment>();
  readonly compact = input(false);

  protected readonly blockedColor = BLOCKED_EVENT_COLOR;

  protected chipStyle(): { bg: string; text: string } {
    const apt = this.appointment();
    if (apt.isBlocked || !apt.location) return BLOCKED_EVENT_COLOR;
    return LOCATION_COLORS[apt.location];
  }

  protected displayName(): string {
    return abbreviateName(this.appointment().patientName);
  }

  protected subtitle(): string {
    const apt = this.appointment();
    const proc = PROCEDURE_LABELS[apt.procedure];
    const loc = apt.location ? LOCATION_LABELS[apt.location] : '';
    return loc ? `${proc} • ${loc}` : proc;
  }
}
