import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Appointment } from '../../models/appointment.model';
import { AppointmentListCardComponent } from '../appointment-list-card/appointment-list-card.component';

@Component({
  selector: 'app-upcoming-appointments',
  imports: [RouterLink, AppointmentListCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="flex min-h-0 flex-1 flex-col rounded-2xl border border-[#D5C2BD]/10 bg-white p-4 shadow-sm">
      <div class="mb-4 flex min-w-0 items-center justify-between gap-3">
        <h3 class="shrink-0 font-serif text-sm font-bold text-[#7C5145]">Próximos</h3>
        <a
          routerLink="/agenda/agendamentos"
          class="shrink-0 text-[10px] font-bold tracking-wider whitespace-nowrap text-[#7C5145] uppercase transition hover:opacity-80"
        >
          Ver todos
        </a>
      </div>

      <div class="flex min-h-0 flex-col gap-2.5 overflow-y-auto">
        @for (apt of appointments(); track apt.id) {
          <app-appointment-list-card [appointment]="apt" />
        } @empty {
          <p class="text-sm text-[#78716C]">Nenhum agendamento próximo.</p>
        }
      </div>
    </section>
  `,
})
export class UpcomingAppointmentsComponent {
  readonly appointments = input.required<Appointment[]>();
}
