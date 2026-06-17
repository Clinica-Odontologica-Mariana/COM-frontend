import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';
import {
  BreadcrumbItem,
  PatientPageHeaderComponent,
} from '../../components/patient-page-header/patient-page-header.component';
import {
  HEALTH_CONDITIONS,
  HealthCondition,
  PatientFormDto,
  PatientGender,
  PatientStatus,
} from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';
import {
  cpfValidator,
  formatCpf,
  formatPhone,
  formatZipCode,
  getInitials,
  pastDateValidator,
  todayIsoDate,
} from '../../utils/format.utils';

interface PatientFormControls {
  fullName: FormControl<string>;
  cpf: FormControl<string>;
  birthDate: FormControl<string>;
  profession: FormControl<string>;
  gender: FormControl<PatientGender>;
  status: FormControl<PatientStatus>;
  chiefComplaint: FormControl<string>;
  continuousMedications: FormControl<string>;
  phone: FormControl<string>;
  email: FormControl<string>;
  zipCode: FormControl<string>;
  street: FormControl<string>;
  neighborhood: FormControl<string>;
  city: FormControl<string>;
  state: FormControl<string>;
}

@Component({
  selector: 'app-patient-form-page',
  imports: [ReactiveFormsModule, RouterLink, PatientPageHeaderComponent],
  template: `
    <div class="min-h-full pb-12">
      <app-patient-page-header [title]="pageTitle()" [breadcrumbs]="breadcrumbs()">
        <a
          routerLink="/patients"
          class="rounded-xl px-6 py-2 text-base font-bold text-[#78716C] transition hover:bg-[#F5F5F4]"
        >
          Cancelar
        </a>
        <button
          type="button"
          class="rounded-xl bg-[#7C5145] px-8 py-2 text-base font-bold text-white shadow-lg shadow-[#7C5145]/20 transition hover:bg-[#6a453b] disabled:opacity-60"
          [disabled]="saving()"
          (click)="onSubmit()"
        >
          Salvar Registro
        </button>
      </app-patient-page-header>

      @if (loading()) {
        <p class="px-8 py-12 text-center text-sm text-[#78716C]">Carregando...</p>
      } @else {
        <form class="space-y-6 px-6 lg:px-8" [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section
              class="order-2 space-y-8 rounded-4xl border border-[#E7E5E4]/20 bg-[#F3F3F3] p-8 shadow-sm lg:order-1 lg:col-span-2"
            >
              <div class="flex items-center gap-4">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-full bg-[#98695C]/20 text-[#7C5145]"
                >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path
                      d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14z"
                    />
                  </svg>
                </div>
                <h2 class="font-serif text-xl font-bold text-[#1A1C1C]">Dados Pessoais</h2>
              </div>

              <div class="grid gap-6 sm:grid-cols-2">
                <div class="space-y-1 sm:col-span-2">
                  <label
                    for="fullName"
                    class="px-1 text-xs font-bold uppercase tracking-wide text-[#78716C]"
                  >
                    Nome completo
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    formControlName="fullName"
                    class="h-14 w-full rounded-xl bg-[#EEEEEE] px-4 text-base outline-none"
                    placeholder="Ex: Ana Silva Oliveira"
                  />
                  @if (form.controls.fullName.invalid && form.controls.fullName.touched) {
                    <p class="text-xs text-red-500">Nome completo é obrigatório.</p>
                  }
                </div>

                <div class="space-y-1">
                  <label
                    for="cpf"
                    class="px-1 text-xs font-bold uppercase tracking-wide text-[#78716C]"
                  >
                    CPF
                  </label>
                  <input
                    id="cpf"
                    type="text"
                    formControlName="cpf"
                    class="h-14 w-full rounded-xl bg-[#EEEEEE] px-4 text-base outline-none"
                    placeholder="000.000.000-00"
                    (input)="onCpfInput($event)"
                  />
                  @if (form.controls.cpf.touched && form.controls.cpf.hasError('required')) {
                    <p class="text-xs text-red-500">CPF é obrigatório.</p>
                  }
                  @if (form.controls.cpf.touched && form.controls.cpf.hasError('invalidCpf')) {
                    <p class="text-xs text-red-500">CPF inválido.</p>
                  }
                </div>

                <div class="space-y-1">
                  <label
                    for="birthDate"
                    class="px-1 text-xs font-bold uppercase tracking-wide text-[#78716C]"
                  >
                    Data de nascimento
                  </label>
                  <input
                    id="birthDate"
                    type="date"
                    formControlName="birthDate"
                    [max]="todayIso"
                    class="h-14 w-full rounded-xl bg-[#EEEEEE] px-4 text-base outline-none"
                  />
                  @if (
                    form.controls.birthDate.touched &&
                    form.controls.birthDate.hasError('futureDate')
                  ) {
                    <p class="text-xs text-red-500">Data de nascimento não pode ser futura.</p>
                  }
                </div>

                <div class="space-y-1">
                  <label
                    for="profession"
                    class="px-1 text-xs font-bold uppercase tracking-wide text-[#78716C]"
                  >
                    Profissão
                  </label>
                  <input
                    id="profession"
                    type="text"
                    formControlName="profession"
                    class="h-14 w-full rounded-xl bg-[#EEEEEE] px-4 text-base outline-none"
                    placeholder="Ocupação atual"
                  />
                </div>

                <div class="space-y-1">
                  <label
                    for="status"
                    class="px-1 text-xs font-bold uppercase tracking-wide text-[#78716C]"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    formControlName="status"
                    class="h-14 w-full rounded-xl bg-[#EEEEEE] px-4 text-base outline-none"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>

                <div class="space-y-2 sm:col-span-2">
                  <label class="px-1 text-xs font-bold uppercase tracking-wide text-[#78716C]">
                    Gênero
                  </label>
                  <div class="grid gap-4 sm:grid-cols-3">
                    @for (option of genderOptions; track option.value) {
                      <label
                        class="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#E2E2E2] px-3 py-3"
                      >
                        <input
                          type="radio"
                          formControlName="gender"
                          [value]="option.value"
                          class="h-4 w-4"
                        />
                        <span class="text-sm font-medium text-[#1A1C1C]">{{ option.label }}</span>
                      </label>
                    }
                  </div>
                </div>
              </div>
            </section>

            <section
              class="order-1 flex flex-col items-center justify-center rounded-4xl border border-[#7C5145]/10 bg-[#7C5145]/5 p-8 text-center lg:order-2"
            >
              <div class="relative">
                @if (photoPreview()) {
                  <img
                    [src]="photoPreview()"
                    alt="Foto do paciente"
                    class="h-32 w-32 rounded-full border-4 border-white object-cover shadow-xl"
                  />
                } @else {
                  <div
                    class="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-[#F9F9F9] shadow-xl"
                  >
                    <span class="text-2xl font-bold text-[#D6D3D1]">
                      {{ getInitials(form.controls.fullName.value || 'Paciente') }}
                    </span>
                  </div>
                }
                <label
                  class="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#7C5145] text-white shadow-lg"
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    class="sr-only"
                    (change)="onPhotoSelected($event)"
                  />
                  <svg
                    class="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    aria-hidden="true"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </label>
              </div>
              <h3 class="mt-6 font-serif text-lg font-bold text-[#1A1C1C]">Foto do Paciente</h3>
              <p class="mt-2 max-w-xs text-sm leading-relaxed text-[#78716C]">
                Arquivos JPG ou PNG, máximo 2MB. Recomendado para identificação clínica rápida.
              </p>
              @if (photoPreview()) {
                <button
                  type="button"
                  class="mt-4 text-sm font-semibold text-[#7C5145] underline hover:text-[#6a453b]"
                  (click)="onRemovePhoto()"
                >
                  Remover foto
                </button>
              }
            </section>
          </div>

          <section
            class="space-y-10 rounded-4xl border border-[#E7E5E4]/20 bg-[#F3F3F3] p-8 shadow-sm"
          >
            <div class="flex items-center gap-4">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-[#69594A]/10 text-[#69594A]"
              >
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path
                    d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z"
                  />
                </svg>
              </div>
              <h2 class="font-serif text-xl font-bold text-[#1A1C1C]">Anamnese Inicial</h2>
            </div>

            <div class="relative space-y-10 pl-0 lg:pl-12">
              <div class="absolute bottom-0 left-5 top-12 hidden w-px bg-[#E7E5E4] lg:block"></div>

              <div class="relative space-y-2">
                <div
                  class="absolute -left-12 top-1 hidden h-10 w-10 items-center justify-center rounded-full border-2 border-[#69594A] bg-[#F9F9F9] lg:flex"
                >
                  <span class="text-xs font-bold text-[#69594A]">1</span>
                </div>
                <label class="text-base font-bold text-[#1A1C1C]">
                  Qual o motivo principal da consulta?
                </label>
                <textarea
                  formControlName="chiefComplaint"
                  rows="4"
                  class="w-full rounded-xl bg-[#F9F9F9] px-4 py-4 text-base outline-none"
                  placeholder="Descreva as queixas e expectativas do paciente..."
                ></textarea>
              </div>

              <div class="relative space-y-4">
                <div
                  class="absolute -left-12 top-1 hidden h-10 w-10 items-center justify-center rounded-full border-2 border-[#E7E5E4] bg-[#F9F9F9] lg:flex"
                >
                  <span class="text-xs text-[#A8A29E]">+</span>
                </div>
                <label class="text-base font-bold text-[#1A1C1C]">
                  Condições de saúde e Histórico
                </label>
                <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  @for (condition of healthConditions; track condition) {
                    <label
                      class="flex cursor-pointer items-center gap-3 rounded-xl bg-[#EEEEEE] px-3 py-3"
                    >
                      <input
                        type="checkbox"
                        [checked]="isConditionSelected(condition)"
                        (change)="toggleCondition(condition, $event)"
                        class="h-4 w-4 rounded"
                      />
                      <span class="text-sm text-[#1A1C1C]">{{ condition }}</span>
                    </label>
                  }
                </div>
              </div>

              <div class="relative space-y-2">
                <div
                  class="absolute -left-12 top-1 hidden h-10 w-10 items-center justify-center rounded-full border-2 border-[#E7E5E4] bg-[#F9F9F9] lg:flex"
                >
                  <span class="text-xs text-[#A8A29E]">Rx</span>
                </div>
                <label class="text-base font-bold text-[#1A1C1C]">
                  Uso contínuo de medicamentos?
                </label>
                <input
                  type="text"
                  formControlName="continuousMedications"
                  class="h-14 w-full rounded-xl bg-[#F9F9F9] px-4 text-base outline-none"
                  placeholder="Liste medicamentos ou suplementos..."
                />
              </div>
            </div>
          </section>

          <div class="grid gap-6 lg:grid-cols-2">
            <section
              class="space-y-6 rounded-4xl border border-[#E7E5E4]/20 bg-[#F3F3F3] p-8 shadow-sm"
            >
              <div class="flex items-center gap-4">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFC8BD]/20 text-[#7E544C]"
                >
                  <svg
                    class="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                    <path d="M8 7h8M8 11h6" />
                  </svg>
                </div>
                <h2 class="font-serif text-xl font-bold text-[#1A1C1C]">Contato</h2>
              </div>

              <div class="space-y-1">
                <label
                  for="phone"
                  class="px-1 text-xs font-bold uppercase tracking-wide text-[#78716C]"
                >
                  WhatsApp / Telefone
                </label>
                <div class="flex gap-2">
                  <div
                    class="flex h-14 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEEEEE] text-[#A8A29E]"
                  >
                    <svg
                      class="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <path
                        d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
                      />
                    </svg>
                  </div>
                  <input
                    id="phone"
                    type="text"
                    formControlName="phone"
                    class="h-14 flex-1 rounded-xl bg-[#EEEEEE] px-4 text-base outline-none"
                    placeholder="(00) 00000-0000"
                    (input)="onPhoneInput($event)"
                  />
                </div>
              </div>

              <div class="space-y-1">
                <label
                  for="email"
                  class="px-1 text-xs font-bold uppercase tracking-wide text-[#78716C]"
                >
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  class="h-14 w-full rounded-xl bg-[#EEEEEE] px-4 text-base outline-none"
                  placeholder="paciente@exemplo.com"
                />
                @if (form.controls.email.touched && form.controls.email.hasError('email')) {
                  <p class="text-xs text-red-500">E-mail inválido.</p>
                }
              </div>

            </section>

            <section
              class="space-y-6 rounded-4xl border border-[#E7E5E4]/20 bg-[#F3F3F3] p-8 shadow-sm"
            >
              <div class="flex items-center gap-4">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-full bg-[#D5C2BD]/30 text-[#7C5145]"
                >
                  <svg class="h-4 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path
                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z"
                    />
                  </svg>
                </div>
                <h2 class="font-serif text-xl font-bold text-[#1A1C1C]">Localização</h2>
              </div>

              <div class="grid gap-4 sm:grid-cols-[140px_1fr]">
                <div class="space-y-1">
                  <label
                    for="zipCode"
                    class="px-1 text-xs font-bold uppercase tracking-wide text-[#78716C]"
                  >
                    CEP
                  </label>
                  <input
                    id="zipCode"
                    type="text"
                    formControlName="zipCode"
                    class="h-14 w-full rounded-xl bg-[#EEEEEE] px-4 text-base outline-none"
                    placeholder="00000-000"
                    (input)="onZipCodeInput($event)"
                  />
                </div>
                <div class="space-y-1">
                  <label
                    for="street"
                    class="px-1 text-xs font-bold uppercase tracking-wide text-[#78716C]"
                  >
                    Logradouro
                  </label>
                  <input
                    id="street"
                    type="text"
                    formControlName="street"
                    class="h-14 w-full rounded-xl bg-[#EEEEEE] px-4 text-base outline-none"
                    placeholder="Rua, Avenida, Praça..."
                  />
                </div>
              </div>

              <div class="grid gap-4 sm:grid-cols-[1fr_140px_80px]">
                <div class="space-y-1">
                  <label
                    for="neighborhood"
                    class="px-1 text-xs font-bold uppercase tracking-wide text-[#78716C]"
                  >
                    Bairro
                  </label>
                  <input
                    id="neighborhood"
                    type="text"
                    formControlName="neighborhood"
                    class="h-14 w-full rounded-xl bg-[#EEEEEE] px-4 text-base outline-none"
                    placeholder="Nome do bairro"
                  />
                </div>
                <div class="space-y-1">
                  <label
                    for="city"
                    class="px-1 text-xs font-bold uppercase tracking-wide text-[#78716C]"
                  >
                    Cidade
                  </label>
                  <input
                    id="city"
                    type="text"
                    formControlName="city"
                    class="h-14 w-full rounded-xl bg-[#EEEEEE] px-4 text-base outline-none"
                    placeholder="São Paulo"
                  />
                </div>
                <div class="space-y-1">
                  <label
                    for="state"
                    class="px-1 text-xs font-bold uppercase tracking-wide text-[#78716C]"
                  >
                    UF
                  </label>
                  <input
                    id="state"
                    type="text"
                    formControlName="state"
                    maxlength="2"
                    class="h-14 w-full rounded-xl bg-[#EEEEEE] px-4 text-center text-base uppercase outline-none"
                    placeholder="SP"
                  />
                </div>
              </div>
            </section>
          </div>
        </form>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientFormPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly patientService = inject(PatientService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);

  private static readonly ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png'];

  protected readonly healthConditions = HEALTH_CONDITIONS;
  protected readonly genderOptions: { value: PatientGender; label: string }[] = [
    { value: 'female', label: 'Feminino' },
    { value: 'male', label: 'Masculino' },
    { value: 'other', label: 'Outro' },
  ];

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly photoPreview = signal<string | undefined>(undefined);
  protected readonly pageTitle = signal('Novo Paciente');
  protected readonly breadcrumbs = signal<BreadcrumbItem[]>([
    { label: 'Pacientes', link: '/patients' },
    { label: 'Novo Cadastro' },
  ]);

  protected selectedConditions = signal<HealthCondition[]>([]);
  protected patientId: string | null = null;

  protected readonly todayIso = todayIsoDate();

  protected readonly form: FormGroup<PatientFormControls> = this.fb.group({
    fullName: this.fb.nonNullable.control('', Validators.required),
    cpf: this.fb.nonNullable.control('', [Validators.required, cpfValidator]),
    birthDate: this.fb.nonNullable.control('', pastDateValidator),
    profession: this.fb.nonNullable.control(''),
    gender: this.fb.nonNullable.control<PatientGender>('female'),
    status: this.fb.nonNullable.control<PatientStatus>('active'),
    chiefComplaint: this.fb.nonNullable.control(''),
    continuousMedications: this.fb.nonNullable.control(''),
    phone: this.fb.nonNullable.control(''),
    email: this.fb.nonNullable.control('', Validators.email),
    zipCode: this.fb.nonNullable.control(''),
    street: this.fb.nonNullable.control(''),
    neighborhood: this.fb.nonNullable.control(''),
    city: this.fb.nonNullable.control(''),
    state: this.fb.nonNullable.control(''),
  });

  protected readonly getInitials = getInitials;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.patientId = id;
      this.pageTitle.set('Editar Paciente');
      this.breadcrumbs.set([
        { label: 'Pacientes', link: '/patients' },
        { label: 'Editar Cadastro' },
      ]);
      this.loadPatient(id);
    }
  }

  protected onCpfInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.controls.cpf.setValue(formatCpf(input.value));
  }

  protected onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.controls.phone.setValue(formatPhone(input.value));
  }

  protected onZipCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.controls.zipCode.setValue(formatZipCode(input.value));
  }

  protected isConditionSelected(condition: HealthCondition): boolean {
    return this.selectedConditions().includes(condition);
  }

  protected toggleCondition(condition: HealthCondition, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.selectedConditions();
    this.selectedConditions.set(
      checked ? [...current, condition] : current.filter((item) => item !== condition),
    );
  }

  protected onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!PatientFormPageComponent.ALLOWED_PHOTO_TYPES.includes(file.type)) {
      this.toast.error('A foto deve ser JPG ou PNG.');
      input.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.toast.error('A foto deve ter no máximo 2MB.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : undefined;
      this.photoPreview.set(result);
    };
    reader.readAsDataURL(file);
  }

  protected onRemovePhoto(): void {
    this.photoPreview.set(undefined);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto = this.buildDto();
    this.saving.set(true);

    const request$ = this.patientId
      ? this.patientService.update(this.patientId, dto)
      : this.patientService.create(dto);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(
          this.patientId ? 'Paciente atualizado com sucesso.' : 'Paciente cadastrado com sucesso.',
        );
        void this.router.navigate(['/patients']);
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Não foi possível salvar o paciente.');
      },
    });
  }

  private loadPatient(id: string): void {
    this.loading.set(true);
    this.patientService
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (patient) => {
          this.form.patchValue({
            fullName: patient.fullName,
            cpf: patient.cpf,
            birthDate: patient.birthDate,
            profession: patient.profession,
            gender: patient.gender,
            status: patient.status,
            chiefComplaint: patient.chiefComplaint,
            continuousMedications: patient.continuousMedications,
            phone: patient.phone,
            email: patient.email,
            zipCode: patient.address.zipCode,
            street: patient.address.street,
            neighborhood: patient.address.neighborhood,
            city: patient.address.city,
            state: patient.address.state,
          });
          this.selectedConditions.set([...patient.healthConditions]);
          this.photoPreview.set(patient.photoUrl);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          void this.router.navigate(['/patients']);
        },
      });
  }

  private buildDto(): PatientFormDto {
    const value = this.form.getRawValue();
    return {
      fullName: value.fullName,
      cpf: value.cpf,
      birthDate: value.birthDate,
      profession: value.profession,
      gender: value.gender,
      status: value.status,
      photoUrl: this.photoPreview(),
      chiefComplaint: value.chiefComplaint,
      healthConditions: this.selectedConditions(),
      continuousMedications: value.continuousMedications,
      phone: value.phone,
      email: value.email,
      address: {
        zipCode: value.zipCode,
        street: value.street,
        neighborhood: value.neighborhood,
        city: value.city,
        state: value.state,
      },
    };
  }
}
