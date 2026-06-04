import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AppointmentListCardComponent } from '../../components/appointment-list-card/appointment-list-card.component';
import { Appointment } from '../../models/appointment.model';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-appointments-list-page',
  imports: [RouterLink, AppointmentListCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-full bg-[#F9F9F9]">
      <div class="mx-auto max-w-3xl px-6 py-10 lg:px-8">
        <nav class="mb-4 flex items-center gap-2 text-sm text-[#78716C]" aria-label="Breadcrumb">
          <a routerLink="/agenda" class="transition hover:text-[#7C5145]">Agenda</a>
          <span aria-hidden="true">›</span>
          <span class="text-[#514440]">Agendamentos</span>
        </nav>

        <div class="mb-8">
          <h1 class="font-serif text-3xl font-bold text-[#7C5145] md:text-4xl">Agendamentos</h1>
          <p class="mt-2 text-base text-[#69594A]">Todos os atendimentos futuros, em ordem cronológica.</p>
        </div>

        <div class="flex flex-col gap-3">
          @for (apt of appointments(); track apt.id) {
            <app-appointment-list-card [appointment]="apt" [showStatus]="true" />
          } @empty {
            <p class="rounded-xl bg-white p-8 text-center text-sm text-[#78716C] shadow-sm">
              Nenhum agendamento encontrado.
            </p>
          }
        </div>
      </div>
    </div>
  `,
})
export class AppointmentsListPageComponent {
  private readonly appointmentService = inject(AppointmentService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly appointments = signal<Appointment[]>([]);

  constructor() {
    this.appointmentService
      .listUpcoming(null)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((items) => this.appointments.set(items));
  }
}
