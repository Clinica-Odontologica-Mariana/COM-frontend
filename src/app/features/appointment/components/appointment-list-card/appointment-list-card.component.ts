import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Appointment, LOCATION_LABELS, PROCEDURE_LABELS, STATUS_LABELS } from '../../models/appointment.model';
import { formatRelativeDayLabel } from '../../utils/calendar.utils';

@Component({
  selector: 'app-appointment-list-card',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="rounded-xl bg-[#F3F3F3] p-4">
      <div class="flex flex-wrap items-start justify-between gap-2">
        <span
          class="inline-block rounded-md px-2 py-0.5 text-[9px] font-bold tracking-tight uppercase whitespace-nowrap"
          [style.background-color]="badgeStyle().bg"
          [style.color]="badgeStyle().text"
        >
          {{ badgeLabel() }}
        </span>
        @if (showStatus()) {
          <span class="text-[10px] font-medium text-[#78716C]">{{ STATUS_LABELS[appointment().status] }}</span>
        }
      </div>

      <p class="mt-2 font-serif text-base font-bold text-[#1A1C1C]">{{ appointment().patientName }}</p>
      <p class="mt-0.5 text-sm text-[#514440]">
        {{ PROCEDURE_LABELS[appointment().procedure] }} • {{ LOCATION_LABELS[appointment().location!] }}
      </p>

      <div class="mt-3 flex flex-wrap gap-2">
        <a
          [routerLink]="['/agenda', appointment().id, 'editar']"
          class="rounded-md border border-[#7C5145]/20 px-3 py-1.5 text-[9px] font-bold tracking-wide text-[#7C5145] uppercase"
        >
          Editar
        </a>
      </div>
    </article>
  `,
})
export class AppointmentListCardComponent {
  readonly appointment = input.required<Appointment>();
  readonly showStatus = input(false);

  protected readonly PROCEDURE_LABELS = PROCEDURE_LABELS;
  protected readonly LOCATION_LABELS = LOCATION_LABELS;
  protected readonly STATUS_LABELS = STATUS_LABELS;

  protected badgeLabel(): string {
    return formatRelativeDayLabel(this.appointment().date, this.appointment().startTime);
  }

  protected badgeStyle(): { bg: string; text: string } {
    const label = formatRelativeDayLabel(this.appointment().date);
    if (label.startsWith('HOJE')) {
      return { bg: 'rgba(124, 81, 69, 0.1)', text: '#7C5145' };
    }
    if (label.startsWith('AMANHÃ')) {
      return { bg: 'rgba(255, 218, 211, 0.3)', text: '#534436' };
    }
    if (label.startsWith('DIA')) {
      return { bg: 'rgba(245, 222, 203, 0.3)', text: '#534436' };
    }
    return { bg: '#E8E8E8', text: '#514440' };
  }
}
