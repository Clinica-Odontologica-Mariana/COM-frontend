import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';
import { AppointmentStatusPillsComponent } from '../../components/appointment-status-pills/appointment-status-pills.component';
import {
  Appointment,
  AppointmentLocation,
  AppointmentStatus,
  LOCATION_LABELS,
  PROCEDURE_LABELS,
  ProcedureType,
} from '../../models/appointment.model';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-appointment-edit-page',
  imports: [ReactiveFormsModule, AppointmentStatusPillsComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-full bg-[#F9F9F9]">
      <div class="mx-auto max-w-5xl px-6 py-10 lg:px-8">
        <nav class="mb-4 flex items-center gap-2 text-sm text-[#78716C]" aria-label="Breadcrumb">
          <a routerLink="/agenda" class="transition hover:text-[#7C5145]">Agenda</a>
          <span aria-hidden="true">›</span>
          <span class="text-[#514440]">Editar Agendamento</span>
        </nav>

        @if (loading()) {
          <p class="text-[#78716C]">Carregando...</p>
        } @else if (appointment()) {
          <div class="mb-10">
            <h1 class="font-serif text-3xl font-bold tracking-tight text-[#7C5145] md:text-4xl">Editar Agendamento</h1>
            <p class="mt-2 text-sm font-medium text-[#69594A]">Ref: {{ appointment()!.referenceCode }}</p>
          </div>

          <div class="grid gap-6 lg:grid-cols-3">
            <!-- Form section -->
            <div class="rounded-3xl bg-white p-10 shadow-sm lg:col-span-2">
              <form [formGroup]="form" (ngSubmit)="onSave()">
                <!-- Patient read-only -->
                <div class="mb-8">
                  <p class="mb-2 font-serif text-lg font-medium text-[#69594A]">Paciente</p>
                  <div class="flex items-center gap-4 rounded-xl bg-[#F3F3F3] p-4">
                    <div
                      class="grid h-12 w-12 place-items-center rounded-full bg-[#FFC8BD] text-base font-bold text-[#7A5149]"
                    >
                      {{ appointment()!.patientInitials }}
                    </div>
                    <div>
                      <p class="font-serif text-xl font-bold text-[#7C5145]">{{ appointment()!.patientName }}</p>
                      <p class="text-sm text-[#78716C]">{{ appointment()!.patientEmail }}</p>
                    </div>
                  </div>
                </div>

                <div class="mb-6 grid gap-6 sm:grid-cols-2">
                  <div>
                    <label class="mb-2 block text-sm tracking-widest text-[#78716C] uppercase">Procedimento</label>
                    <select formControlName="procedure" class="w-full rounded-xl bg-[#F3F3F3] px-4 py-4 text-base outline-none">
                      @for (proc of procedures; track proc) {
                        <option [value]="proc">{{ PROCEDURE_LABELS[proc] }}</option>
                      }
                    </select>
                  </div>
                  <div>
                    <label class="mb-2 block text-sm tracking-widest text-[#78716C] uppercase">Local de Atendimento</label>
                    <select formControlName="location" class="w-full rounded-xl bg-[#F3F3F3] px-4 py-4 text-base outline-none">
                      @for (loc of locations; track loc) {
                        <option [value]="loc">{{ LOCATION_LABELS[loc] }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="mb-8 grid gap-6 sm:grid-cols-2">
                  <div>
                    <label class="mb-2 block text-sm tracking-widest text-[#78716C] uppercase">Data</label>
                    <input type="date" formControlName="date" class="w-full rounded-xl bg-[#F3F3F3] px-4 py-4 text-base outline-none" />
                  </div>
                  <div>
                    <label class="mb-2 block text-sm tracking-widest text-[#78716C] uppercase">Horário</label>
                    <input type="time" formControlName="startTime" class="w-full rounded-xl bg-[#F3F3F3] px-4 py-4 text-base outline-none" />
                  </div>
                </div>

                <div class="mb-2">
                  <label class="mb-3 block text-sm tracking-widest text-[#78716C] uppercase">Status da Consulta</label>
                  <app-appointment-status-pills
                    [value]="form.controls.status.value"
                    (valueChange)="form.controls.status.setValue($event)"
                  />
                </div>
              </form>
            </div>

            <!-- Clinical notes sidebar -->
            <div class="rounded-3xl bg-[#7C5145] p-8 shadow-xl shadow-[#7C5145]/10">
              <h3 class="font-serif text-2xl font-bold text-white">Notas Clínicas</h3>
              <p class="mt-6 text-sm leading-relaxed font-light text-white/80">
                {{ appointment()!.clinicalNotes || 'Nenhuma nota clínica registrada.' }}
              </p>
              <button type="button" class="mt-6 flex items-center gap-2 border-b border-white pb-1 text-sm font-bold text-white">
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ver Histórico Completo
              </button>
            </div>
          </div>

          <!-- Additional notes -->
          <section class="mt-12 border-t border-[#E2E2E2] pt-12">
            <div class="mb-6 flex items-center gap-3 border-b border-[#E2E2E2] pb-2">
              <svg class="h-4 w-4 text-[#69594A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <h2 class="font-serif text-2xl text-[#7E544C]">Observações Adicionais</h2>
            </div>

            <label class="mb-2 block text-sm font-medium text-[#514440]">Notas Clínicas ou Logísticas</label>
            <textarea
              [formControl]="form.controls.notes"
              rows="4"
              class="w-full rounded-xl bg-[#F3F3F3] px-4 py-4 text-base outline-none"
            ></textarea>
          </section>

          <!-- Footer actions -->
          <div class="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#E7E5E4] pt-8">
            <button
              type="button"
              class="flex items-center gap-2 rounded-xl px-6 py-3 text-base font-bold text-[#DC2626] transition hover:bg-red-50"
              (click)="onDelete()"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Excluir Agendamento
            </button>

            <div class="flex gap-4">
              <button
                type="button"
                class="rounded-xl bg-[#E7E5E4] px-8 py-4 text-base font-bold text-[#44403C] transition hover:bg-[#D6D3D1]"
                (click)="onDiscard()"
              >
                Descartar
              </button>
              <button
                type="button"
                [disabled]="form.invalid || saving()"
                class="rounded-xl bg-[#7C5145] px-12 py-4 text-base font-bold text-white shadow-lg shadow-[#7C5145]/20 transition hover:bg-[#6B4539] disabled:opacity-50"
                (click)="onSave()"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        } @else {
          <p class="text-[#78716C]">Agendamento não encontrado.</p>
        }
      </div>
    </div>
  `,
})
export class AppointmentEditPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly appointmentService = inject(AppointmentService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmDialog = inject(ConfirmDialogService);

  protected readonly PROCEDURE_LABELS = PROCEDURE_LABELS;
  protected readonly LOCATION_LABELS = LOCATION_LABELS;

  protected readonly procedures: ProcedureType[] = ['limpeza', 'check_up', 'implante', 'canal', 'avaliacao', 'implante_dentario'];
  protected readonly locations: AppointmentLocation[] = ['asa_sul', 'taguatinga', 'samambaia', 'domiciliar'];

  protected readonly appointment = signal<Appointment | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    procedure: ['limpeza' as ProcedureType, Validators.required],
    location: ['asa_sul' as AppointmentLocation, Validators.required],
    date: ['', Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    status: ['pending' as AppointmentStatus, Validators.required],
    notes: [''],
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.appointmentService
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((apt) => {
        this.loading.set(false);
        if (!apt || apt.isBlocked) {
          this.appointment.set(null);
          return;
        }
        this.appointment.set(apt);
        this.form.patchValue({
          procedure: apt.procedure,
          location: apt.location ?? 'asa_sul',
          date: apt.date,
          startTime: apt.startTime,
          endTime: apt.endTime,
          status: apt.status,
          notes: apt.notes ?? '',
        });
      });
  }

  protected onSave(): void {
    const apt = this.appointment();
    if (!apt || this.form.invalid) return;

    this.saving.set(true);
    const { procedure, location, date, startTime, endTime, notes } = this.form.getRawValue();
    const status = this.form.controls.status.value;

    this.appointmentService
      .update(apt.id, { procedure, location, date, startTime, endTime, notes, status })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          void this.router.navigate(['/agenda']);
        },
        error: () => this.saving.set(false),
      });
  }

  protected onDelete(): void {
    const apt = this.appointment();
    if (!apt) return;

    this.confirmDialog
      .confirm('Deseja excluir este agendamento?', 'Excluir agendamento')
      .pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.appointmentService
          .delete(apt.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => void this.router.navigate(['/agenda']));
      });
  }

  protected onDiscard(): void {
    void this.router.navigate(['/agenda']);
  }
}
