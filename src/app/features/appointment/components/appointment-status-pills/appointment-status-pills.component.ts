import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AppointmentStatus, STATUS_LABELS } from '../../models/appointment.model';

@Component({
  selector: 'app-appointment-status-pills',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap gap-3">
      @for (status of statuses; track status) {
        <button
          type="button"
          class="flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition"
          [class.border-[#7C5145]]="value() === status"
          [class.bg-[rgba(124,81,69,0.1)]]="value() === status"
          [class.text-[#7C5145]]="value() === status"
          [class.border-[#E7E5E4]]="value() !== status"
          [class.text-[#1A1C1C]]="value() !== status"
          (click)="valueChange.emit(status)"
        >
          <span class="h-2 w-2 rounded-full" [style.background-color]="dotColor(status)"></span>
          {{ STATUS_LABELS[status] }}
        </button>
      }
    </div>
  `,
})
export class AppointmentStatusPillsComponent {
  readonly value = input.required<AppointmentStatus>();
  readonly valueChange = output<AppointmentStatus>();

  protected readonly statuses: AppointmentStatus[] = ['confirmed', 'pending', 'cancelled'];
  protected readonly STATUS_LABELS = STATUS_LABELS;

  protected dotColor(status: AppointmentStatus): string {
    switch (status) {
      case 'confirmed':
        return '#22C55E';
      case 'pending':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
    }
  }
}
