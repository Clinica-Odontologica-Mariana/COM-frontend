import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import {
  ScheduleOptionsApi,
  ProcedureOption,
  ProfessionalOption,
  WorkplaceOption,
} from '../api/schedule-options.api';
import { AgendaPatientOption } from '../models/appointment.model';
import { AppointmentService } from '../services/appointment.service';

@Component({
  selector: 'app-appointment-create-page',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full bg-[#F9F9F9]">
      <div class="mx-auto max-w-full px-6 py-10 lg:px-12">
        <nav class="mb-4 flex items-center gap-2 text-sm text-[#78716C]" aria-label="Breadcrumb">
          <a routerLink="/schedule" class="transition hover:text-[#7C5145]">Agenda</a>
          <span aria-hidden="true">›</span>
          <span class="text-[#514440]">{{
            isRescheduling() ? 'Reagendar' : 'Cadastrar Agendamento'
          }}</span>
        </nav>

        <div class="mb-10">
          <h1 class="font-serif text-4xl text-[#7C5145] md:text-5xl">
            {{ isRescheduling() ? 'Reagendar Consulta' : 'Novo Agendamento' }}
          </h1>
          <p class="mt-4 max-w-2xl text-lg leading-7 text-[#69594A]">
            {{
              isRescheduling()
                ? 'Ajuste a data e horário para agendar uma nova consulta para este paciente.'
                : 'Preencha os detalhes do atendimento para garantir a melhor experiência ao paciente.'
            }}
          </p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="relative">
          <div class="grid gap-6 lg:grid-cols-12">
            <!-- Patient card -->
            <div class="rounded-xl bg-white p-8 shadow-sm lg:col-span-6">
              <div class="mb-6 flex items-center gap-3">
                <svg
                  class="h-5 w-5 text-[#7C5145]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <h3 class="font-serif text-xl text-[#1A1C1C]">Dados do Paciente</h3>
              </div>

              <label class="mb-2 block text-xs tracking-widest text-[#78716C] uppercase"
                >Nome do Paciente</label
              >
              <div class="relative">
                <div class="flex items-center rounded-lg bg-[#EEEEEE] px-4">
                  <svg
                    class="h-4 w-4 shrink-0 text-[#A8A29E]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    formControlName="patientSearch"
                    class="w-full bg-transparent px-3 py-4 text-base outline-none placeholder:text-[#A8A29E]"
                    placeholder="Buscar paciente..."
                    (input)="onPatientSearch()"
                    autocomplete="off"
                  />
                </div>

                @if (patientResults().length > 0) {
                  <ul
                    class="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-[#E7E5E4] bg-white shadow-lg"
                  >
                    @for (patient of patientResults(); track patient.id) {
                      <li>
                        <button
                          type="button"
                          class="flex w-full flex-col px-4 py-3 text-left hover:bg-[#F3F3F3]"
                          (click)="selectPatient(patient)"
                        >
                          <span class="font-medium text-[#1A1C1C]">{{ patient.name }}</span>
                          <span class="text-sm text-[#78716C]">{{ patient.email }}</span>
                        </button>
                      </li>
                    }
                  </ul>
                }
              </div>

              @if (selectedPatient()) {
                <p class="mt-2 text-sm text-[#7C5145]">
                  Selecionado: {{ selectedPatient()!.name }}
                </p>
              }
            </div>

            <!-- Professional card -->
            <div class="rounded-xl bg-white p-8 shadow-sm lg:col-span-6">
              <div class="mb-6 flex items-center gap-3">
                <svg
                  class="h-5 w-5 text-[#7C5145]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 class="font-serif text-xl text-[#1A1C1C]">Profissional Responsável</h3>
              </div>

              @if (loadingOptions()) {
                <div class="h-12 animate-pulse rounded-lg bg-[#F3F3F3]"></div>
              } @else if (professionalOptions().length === 0) {
                <p class="text-sm text-[#78716C]">Nenhum profissional disponível.</p>
              } @else {
                <select
                  formControlName="professionalId"
                  class="w-full rounded-lg bg-[#EEEEEE] px-4 py-4 text-base outline-none"
                >
                  <option value="">Selecionar profissional...</option>
                  @for (prof of professionalOptions(); track prof.id) {
                    <option [value]="prof.id">
                      {{ prof.name }}{{ prof.specialty ? ' — ' + prof.specialty : '' }}
                    </option>
                  }
                </select>
              }
            </div>

            <!-- Procedure card -->
            <div class="rounded-xl bg-[#98695C] p-8 shadow-sm lg:col-span-6">
              <svg
                class="mb-4 h-6 w-6 text-[#FFFBFF]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
              <h3 class="mb-6 font-serif text-xl text-[#FFFBFF]">Procedimento</h3>

              @if (loadingOptions()) {
                <div class="h-12 animate-pulse rounded-lg bg-white/20"></div>
              } @else if (procedureOptions().length === 0) {
                <p class="text-sm text-white/60">Nenhum procedimento disponível.</p>
              } @else {
                <select
                  formControlName="procedureId"
                  class="w-full rounded-lg bg-white/10 px-5 py-3 text-base text-white outline-none"
                >
                  <option value="" class="text-[#1A1C1C]">Selecionar procedimento...</option>
                  @for (proc of procedureOptions(); track proc.id) {
                    <option [value]="proc.id" class="text-[#1A1C1C]">{{ proc.name }}</option>
                  }
                </select>
              }
            </div>

            <!-- Schedule card -->
            <div class="rounded-xl bg-white p-8 shadow-sm lg:col-span-6">
              <div class="mb-6 flex items-center gap-3">
                <svg
                  class="h-5 w-5 text-[#7C5145]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 class="font-serif text-xl text-[#1A1C1C]">Agenda</h3>
              </div>

              <label class="mb-2 block text-xs tracking-widest text-[#78716C] uppercase"
                >Data do Agendamento</label
              >
              <input
                type="date"
                formControlName="date"
                class="mb-6 w-full rounded-lg bg-[#EEEEEE] px-4 py-4 text-base outline-none"
              />

              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="mb-2 block text-xs tracking-widest text-[#78716C] uppercase"
                    >Início</label
                  >
                  <input
                    type="time"
                    formControlName="startTime"
                    class="w-full rounded-lg bg-[#EEEEEE] px-4 py-4 text-base outline-none"
                  />
                </div>
                <div>
                  <label class="mb-2 block text-xs tracking-widest text-[#78716C] uppercase"
                    >Término</label
                  >
                  <input
                    type="time"
                    formControlName="endTime"
                    class="w-full rounded-lg bg-[#EEEEEE] px-4 py-4 text-base outline-none"
                  />
                </div>
              </div>
            </div>

            <!-- Location card -->
            <div class="rounded-xl bg-white p-8 shadow-sm lg:col-span-12">
              <div class="mb-6 flex items-center gap-3">
                <svg
                  class="h-5 w-5 shrink-0 text-[#7C5145]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <h3 class="font-serif text-xl whitespace-nowrap text-[#1A1C1C]">
                  Local de Atendimento
                </h3>
              </div>

              @if (loadingOptions()) {
                <div class="grid grid-cols-2 gap-3">
                  @for (_ of [1, 2, 3, 4]; track $index) {
                    <div class="h-14 animate-pulse rounded-xl bg-[#F3F3F3]"></div>
                  }
                </div>
              } @else if (workplaceOptions().length === 0) {
                <p class="text-sm text-[#78716C]">Nenhum local de atendimento disponível.</p>
              } @else {
                <div class="grid grid-cols-2 gap-3">
                  @for (wp of workplaceOptions(); track wp.id) {
                    <button
                      type="button"
                      class="rounded-xl border px-4 py-4 text-sm font-bold transition"
                      [class.border-[#FFDAD3]]="form.controls.workplaceId.value === wp.id"
                      [class.bg-[#FFDAD3]]="form.controls.workplaceId.value === wp.id"
                      [class.text-[#30130D]]="form.controls.workplaceId.value === wp.id"
                      [class.border-[#F5F5F4]]="form.controls.workplaceId.value !== wp.id"
                      [class.bg-white]="form.controls.workplaceId.value !== wp.id"
                      [class.text-[#78716C]]="form.controls.workplaceId.value !== wp.id"
                      (click)="selectWorkplace(wp)"
                    >
                      {{ wp.name }}
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Notes card -->
            <div class="rounded-xl bg-white p-8 shadow-sm lg:col-span-12">
              <div class="mb-6 flex items-center gap-3">
                <svg
                  class="h-4 w-4 text-[#7C5145]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                <h3 class="font-serif text-xl text-[#1A1C1C]">Observações Adicionais</h3>
              </div>
              <textarea
                formControlName="notes"
                rows="4"
                class="w-full rounded-xl bg-[#EEEEEE] px-6 py-6 text-base outline-none placeholder:text-[#6B7280]"
                placeholder="Algum detalhe clínico ou logístico importante para esta visita?"
              ></textarea>
            </div>
          </div>

          <div class="mt-8 flex justify-end gap-6">
            <a
              routerLink="/schedule"
              class="rounded-xl px-6 py-4 text-base font-bold text-[#78716C] transition hover:bg-[#F5F5F4]"
            >
              Descartar
            </a>
            <button
              type="submit"
              [disabled]="form.invalid || !selectedPatient() || submitting()"
              class="rounded-xl bg-[#7C5145] px-12 py-4 text-base font-bold text-white shadow-lg shadow-[#7C5145]/20 transition hover:bg-[#6B4539] disabled:opacity-50"
            >
              {{ isRescheduling() ? 'Confirmar Reagendamento' : 'Cadastrar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class AppointmentCreatePageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly appointmentService = inject(AppointmentService);
  private readonly scheduleOptionsApi = inject(ScheduleOptionsApi);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly patientResults = signal<AgendaPatientOption[]>([]);
  protected readonly selectedPatient = signal<AgendaPatientOption | null>(null);
  protected readonly submitting = signal(false);
  protected readonly isRescheduling = signal(false);
  protected readonly loadingOptions = signal(true);
  protected readonly procedureOptions = signal<ProcedureOption[]>([]);
  protected readonly workplaceOptions = signal<WorkplaceOption[]>([]);
  protected readonly professionalOptions = signal<ProfessionalOption[]>([]);

  private readonly patientSearch$ = new Subject<string>();

  protected readonly form = this.fb.nonNullable.group({
    patientSearch: [''],
    patientId: ['', Validators.required],
    professionalId: ['', Validators.required],
    procedureId: ['' as string],
    workplaceId: ['', Validators.required],
    date: ['', Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    notes: [''],
  });

  constructor() {
    this.loadOptions();

    this.patientSearch$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((query) => {
          if (query.trim().length < 2) return of([]);
          return this.appointmentService.searchPatients(query).pipe(catchError(() => of([])));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((results) => this.patientResults.set(results));

    const rescheduleId = this.route.snapshot.queryParamMap.get('reschedule');
    if (rescheduleId) {
      this.isRescheduling.set(true);
      this.appointmentService
        .getById(rescheduleId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (apt) => {
            if (!apt || apt.isBlocked) return;
            this.form.patchValue({
              workplaceId: apt.workplaceId ?? '',
              date: apt.date,
              startTime: apt.startTime,
              endTime: apt.endTime,
            });
            const patient: AgendaPatientOption = {
              id: apt.patientId,
              name: apt.patientName,
              email: apt.patientEmail ?? '',
              initials: apt.patientInitials ?? '',
            };
            this.selectedPatient.set(patient);
            this.form.patchValue({ patientId: patient.id, patientSearch: patient.name });
          },
          error: () => {},
        });
    }
  }

  private loadOptions(): void {
    this.scheduleOptionsApi
      .listProcedures()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (p) => this.procedureOptions.set(p), error: () => {} });

    this.scheduleOptionsApi
      .listProfessionals()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (p) => this.professionalOptions.set(p), error: () => {} });

    this.scheduleOptionsApi
      .listWorkplaces()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (w) => {
          this.workplaceOptions.set(w);
          this.loadingOptions.set(false);
        },
        error: () => this.loadingOptions.set(false),
      });
  }

  protected onPatientSearch(): void {
    this.patientSearch$.next(this.form.controls.patientSearch.value);
  }

  protected selectPatient(patient: AgendaPatientOption): void {
    this.selectedPatient.set(patient);
    this.form.patchValue({ patientId: patient.id, patientSearch: patient.name });
    this.patientResults.set([]);
  }

  protected selectWorkplace(wp: WorkplaceOption): void {
    this.form.controls.workplaceId.setValue(wp.id);
  }

  protected onSubmit(): void {
    if (this.form.invalid || !this.selectedPatient()) return;

    const { patientId, professionalId, procedureId, workplaceId, date, startTime, endTime, notes } =
      this.form.getRawValue();

    const selectedWorkplace = this.workplaceOptions().find((w) => w.id === workplaceId);
    const clinicId = selectedWorkplace?.clinicId ?? '';

    this.submitting.set(true);
    this.appointmentService
      .create({
        patientId,
        clinicId,
        workplaceId,
        professionalId,
        procedureId,
        date,
        startTime,
        endTime,
        notes,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          void this.router.navigate(['/schedule']);
        },
        error: () => this.submitting.set(false),
      });
  }
}
