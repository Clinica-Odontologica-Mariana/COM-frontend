import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast.service';
import {
  CLINIC_SCHEDULE_TEMPLATE,
  ClinicCardViewModel,
  ClinicDayKey,
  ClinicFormValue,
  WorkingDay,
  cloneWorkingDays,
} from '../../models/clinic.models';

function zipCodeValidator(value: string): boolean {
  return /^\d{8}$/.test(value.replace(/\D/g, ''));
}

function stateValidator(value: string): boolean {
  return /^[A-Z]{2}$/.test(value.trim().toUpperCase());
}

function timeValueValidator(value: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(value)) {
    return false;
  }

  const [hoursText, minutesText] = value.split(':');
  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

@Component({
  selector: 'app-clinic-form-drawer',
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-[#F9F9F9]" style="font-family: 'Manrope', sans-serif">
      <section class="mx-auto flex w-full max-w-350 flex-col gap-10 px-6 py-8 md:px-10 xl:px-12">
        <header
          class="sticky top-0 z-20 w-full overflow-hidden rounded-3xl border border-[#F1E7E2] bg-[rgba(250,250,249,0.92)] shadow-[0px_1px_2px_rgba(124,45,18,0.05)] backdrop-blur"
        >
          <div
            class="mx-auto flex min-h-23 w-full flex-col gap-5 px-6 py-6 md:px-8 lg:flex-row lg:items-center lg:justify-between"
          >
            <h1
              class="text-3xl font-bold leading-tight text-[#7C5145]"
              style="font-family: 'Noto Serif', serif"
            >
              {{ title() }}
            </h1>

            <div class="flex items-center gap-4 self-start lg:self-auto">
              <button
                type="button"
                (click)="cancel.emit()"
                class="inline-flex h-11 items-center justify-center rounded-xl bg-[#F6F1EE] px-5 text-sm font-medium text-[#7A6F69] transition hover:bg-[#EFE7E2] hover:text-[#5F5752]"
              >
                Cancelar
              </button>

              <button
                type="button"
                (click)="submit()"
                [disabled]="saving()"
                class="inline-flex h-11 min-w-35 items-center justify-center rounded-2xl bg-[#8B5E4E] px-8 text-sm font-semibold text-white shadow-[0px_14px_24px_-16px_rgba(139,94,78,0.75)] transition hover:bg-[#744E41] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {{ saving() ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </div>
        </header>

        <form [formGroup]="form" (ngSubmit)="submit()" class="mx-auto w-full space-y-14">
          <section class="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
            <div class="space-y-3">
              <h2
                class="text-3xl font-bold text-[#8B5E4E]"
                style="font-family: 'Noto Serif', serif"
              >
                Informações Básicas
              </h2>
              <p class="max-w-55 text-sm leading-7 text-[#6B625D]">
                Insira os dados principais da clínica parceira
              </p>
            </div>

            <div
              class="overflow-hidden rounded-[28px] border border-[#F2E8E2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] md:p-8"
            >
              <div class="grid gap-6">
                <label class="grid gap-2">
                  <span class="text-sm font-medium text-[#4D4540]">Nome da Clínica *</span>
                  <input
                    formControlName="name"
                    type="text"
                    class="h-12 rounded-2xl bg-[#F7F5F4] px-4 text-sm text-[#2D241E] outline-none ring-1 ring-transparent transition focus:ring-[#D9C5BC]"
                    placeholder="Ex: Clínica Odontológica Sorriso Perfeito"
                  />
                </label>

                <div class="grid gap-2">
                  <span class="text-sm font-medium text-[#4D4540]">Foto da Unidade</span>
                  <input
                    #imageInput
                    type="file"
                    accept="image/png,image/jpeg"
                    class="sr-only"
                    (change)="onImageSelected($event)"
                  />

                  @if (imagePreviewUrl()) {
                    <div class="overflow-hidden rounded-3xl border border-[#E5D7CF] bg-[#FFFDFC]">
                      <img
                        [src]="imagePreviewUrl()"
                        alt="Pré-visualização da clínica"
                        class="aspect-video w-full object-cover"
                      />
                      <div class="flex items-center gap-2 px-4 py-3">
                        <button
                          type="button"
                          (click)="imageInput.click()"
                          class="inline-flex h-9 items-center justify-center rounded-xl bg-[#F6F1EE] px-4 text-xs font-medium text-[#7A6F69] transition hover:bg-[#EFE7E2]"
                        >
                          Trocar foto
                        </button>
                        <button
                          type="button"
                          (click)="removeImage()"
                          class="inline-flex h-9 items-center justify-center rounded-xl bg-[#FEF2F0] px-4 text-xs font-medium text-[#A34D43] transition hover:bg-[#FCDDD9]"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  } @else {
                    <button
                      type="button"
                      (click)="imageInput.click()"
                      class="flex min-h-43 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-[#E5D7CF] bg-[#FFFDFC] px-6 py-8 text-center transition hover:bg-[#FBF7F5]"
                    >
                      <span
                        class="flex h-14 w-14 items-center justify-center rounded-full bg-[#F4E7E1] text-[#BA9485]"
                        aria-hidden="true"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          class="h-7 w-7 stroke-current"
                          fill="none"
                          stroke-width="1.8"
                        >
                          <path
                            d="M4 7.5A2.5 2.5 0 0 1 6.5 5h7A2.5 2.5 0 0 1 16 7.5V8h1.5A2.5 2.5 0 0 1 20 10.5v7a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-10Z"
                          />
                          <path d="m10 13 2 2 4-4" />
                          <path d="M16.5 4v3m-1.5-1.5h3" />
                        </svg>
                      </span>

                      <div class="space-y-1">
                        <p class="text-sm font-medium text-[#7C736D]">
                          Arraste uma foto ou clique para buscar
                        </p>
                        <p class="text-xs text-[#B9ACA6]">PNG, JPG até 10MB</p>
                      </div>
                    </button>
                  }
                </div>

                @if (isEditing()) {
                  <div class="space-y-5 rounded-3xl border border-[#F2E8E2] bg-[#FFFDFC] p-5">
                    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div class="space-y-1">
                        <p class="text-sm font-semibold text-[#4D4540]">Status da clínica</p>
                        <p class="text-xs leading-5 text-[#8F827B]">
                          Controle a disponibilidade da clínica na plataforma.
                        </p>
                      </div>

                      <div class="flex gap-2">
                        <button
                          type="button"
                          (click)="clinicActive.set(true)"
                          class="inline-flex h-10 items-center justify-center rounded-2xl px-5 text-sm font-medium transition"
                          [class.bg-[#8B5E4E]]="clinicActive()"
                          [class.text-white]="clinicActive()"
                          [class.shadow-[0px_4px_12px_-4px_rgba(139,94,78,0.5)]]="clinicActive()"
                          [class.bg-[#F7F5F4]]="!clinicActive()"
                          [class.text-[#7A6F69]]="!clinicActive()"
                        >
                          Ativa
                        </button>
                        <button
                          type="button"
                          (click)="clinicActive.set(false)"
                          class="inline-flex h-10 items-center justify-center rounded-2xl px-5 text-sm font-medium transition"
                          [class.bg-[#8B5E4E]]="!clinicActive()"
                          [class.text-white]="!clinicActive()"
                          [class.shadow-[0px_4px_12px_-4px_rgba(139,94,78,0.5)]]="!clinicActive()"
                          [class.bg-[#F7F5F4]]="clinicActive()"
                          [class.text-[#7A6F69]]="clinicActive()"
                        >
                          Inativa
                        </button>
                      </div>
                    </div>

                    @if (!clinicActive()) {
                      <div class="rounded-2xl border border-[#F2E8E2] bg-white p-4">
                        <p class="text-sm text-[#6B625D]">
                          Esta clínica não aparecerá para os clientes e agendamentos.
                        </p>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </section>

          <section class="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
            <div class="space-y-3">
              <h2
                class="text-3xl font-bold text-[#8B5E4E]"
                style="font-family: 'Noto Serif', serif"
              >
                Informações de Contato
              </h2>
              <p class="max-w-55 text-sm leading-7 text-[#6B625D]">
                Canais de comunicação para agendamentos e suporte.
              </p>
            </div>

            <div
              class="overflow-hidden rounded-[28px] border border-[#F2E8E2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] md:p-8"
            >
              <div class="grid gap-5 md:grid-cols-2">
                <label class="grid gap-2">
                  <span class="text-sm font-medium text-[#4D4540]">Telefone da Clínica *</span>
                  <input
                    formControlName="phone"
                    type="text"
                    inputmode="numeric"
                    class="h-12 rounded-2xl bg-[#F7F5F4] px-4 text-sm text-[#2D241E] outline-none ring-1 ring-transparent transition focus:ring-[#D9C5BC]"
                    placeholder="(00) 0000-0000"
                    (input)="onPhoneInput('phone', $event)"
                  />
                </label>

                <label class="grid gap-2">
                  <span class="text-sm font-medium text-[#4D4540]">E-mail de Contato</span>
                  <input
                    formControlName="email"
                    type="email"
                    class="h-12 rounded-2xl bg-[#F7F5F4] px-4 text-sm text-[#2D241E] outline-none ring-1 transition focus:ring-[#D9C5BC]"
                    [class.ring-[#E2A39A]]="shouldShowEmailError()"
                    [class.ring-transparent]="!shouldShowEmailError()"
                    placeholder="contato@clinica.com"
                    (blur)="normalizeEmailInput('email')"
                  />
                  @if (shouldShowEmailError()) {
                    <span class="text-xs text-[#A34D43]"
                      >Informe um e-mail válido para contato.</span
                    >
                  }
                </label>

                <label class="grid gap-2">
                  <span class="text-sm font-medium text-[#4D4540]">WhatsApp (opcional)</span>
                  <input
                    formControlName="whatsapp"
                    type="text"
                    inputmode="numeric"
                    class="h-12 rounded-2xl bg-[#F7F5F4] px-4 text-sm text-[#2D241E] outline-none ring-1 ring-transparent transition focus:ring-[#D9C5BC]"
                    placeholder="(00) 0 0000-0000"
                    (input)="onPhoneInput('whatsapp', $event)"
                  />
                </label>

                <label class="grid gap-2">
                  <span class="text-sm font-medium text-[#4D4540]">Instagram (opcional)</span>
                  <input
                    formControlName="instagram"
                    type="text"
                    class="h-12 rounded-2xl bg-[#F7F5F4] px-4 text-sm text-[#2D241E] outline-none ring-1 ring-transparent transition focus:ring-[#D9C5BC]"
                    placeholder="@clinica_exemplo"
                  />
                </label>
              </div>
            </div>
          </section>

          <section class="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
            <div class="space-y-3">
              <h2
                class="text-3xl font-bold text-[#8B5E4E]"
                style="font-family: 'Noto Serif', serif"
              >
                Localização
              </h2>
              <p class="max-w-55 text-sm leading-7 text-[#6B625D]">
                Endereço completo da clínica para exibição aos pacientes.
              </p>
            </div>

            <div
              class="overflow-hidden rounded-[28px] border border-[#F2E8E2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] md:p-8"
            >
              <div class="grid gap-5">
                <div class="grid gap-5 md:grid-cols-[180px_minmax(0,1fr)]">
                  <label class="grid gap-2">
                    <span class="text-sm font-medium text-[#4D4540]">CEP *</span>
                    <input
                      formControlName="zipCode"
                      type="text"
                      inputmode="numeric"
                      class="h-12 rounded-2xl bg-[#F7F5F4] px-4 text-sm text-[#2D241E] outline-none ring-1 ring-transparent transition focus:ring-[#D9C5BC]"
                      placeholder="00000-000"
                      (input)="onCepInput($event)"
                    />
                  </label>

                  <label class="grid gap-2">
                    <span class="text-sm font-medium text-[#4D4540]">Logradouro (Rua/Av) *</span>
                    <input
                      formControlName="street"
                      type="text"
                      class="h-12 rounded-2xl bg-[#F7F5F4] px-4 text-sm text-[#2D241E] outline-none ring-1 ring-transparent transition focus:ring-[#D9C5BC]"
                    />
                  </label>
                </div>

                <div class="grid gap-5 md:grid-cols-[180px_minmax(0,1fr)]">
                  <label class="grid gap-2">
                    <span class="text-sm font-medium text-[#4D4540]">Número *</span>
                    <input
                      formControlName="number"
                      type="text"
                      class="h-12 rounded-2xl bg-[#F7F5F4] px-4 text-sm text-[#2D241E] outline-none ring-1 ring-transparent transition focus:ring-[#D9C5BC]"
                    />
                  </label>

                  <label class="grid gap-2">
                    <span class="text-sm font-medium text-[#4D4540]">Bairro *</span>
                    <input
                      formControlName="neighborhood"
                      type="text"
                      class="h-12 rounded-2xl bg-[#F7F5F4] px-4 text-sm text-[#2D241E] outline-none ring-1 ring-transparent transition focus:ring-[#D9C5BC]"
                    />
                  </label>
                </div>

                <div class="grid gap-5 md:grid-cols-[110px_minmax(0,1fr)]">
                  <label class="grid w-full gap-2">
                    <span class="text-sm font-medium text-[#4D4540]">UF *</span>
                    <input
                      formControlName="state"
                      type="text"
                      maxlength="2"
                      class="h-12 w-full rounded-2xl bg-[#F7F5F4] px-4 text-center text-sm font-medium uppercase text-[#2D241E] outline-none ring-1 ring-transparent transition focus:ring-[#D9C5BC]"
                      placeholder="SP"
                      (input)="onStateInput($event)"
                    />
                  </label>

                  <label class="grid min-w-0 gap-2">
                    <span class="text-sm font-medium text-[#4D4540]">Cidade *</span>
                    <input
                      formControlName="city"
                      type="text"
                      class="h-12 w-full min-w-0 rounded-2xl bg-[#F7F5F4] px-4 text-sm text-[#2D241E] outline-none ring-1 ring-transparent transition focus:ring-[#D9C5BC]"
                    />
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section class="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
            <div class="space-y-3">
              <h2
                class="text-3xl font-bold text-[#8B5E4E]"
                style="font-family: 'Noto Serif', serif"
              >
                Horário de Funcionamento
              </h2>
              <p class="max-w-55 text-sm leading-7 text-[#6B625D]">
                Defina os dias e horários em que você atende em cada clínica. Você pode adicionar
                múltiplos intervalos por dia, por exemplo, manhã e tarde.
              </p>
            </div>

            <div
              class="overflow-hidden rounded-[28px] border border-[#F2E8E2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] md:p-8"
            >
              <div class="space-y-3">
                @for (day of workingDays(); track day.dayKey) {
                  <div class="rounded-3xl border border-[#F2E8E2] bg-[#FFFDFC] px-5 py-5">
                    <label
                      class="flex cursor-pointer items-center gap-4 text-sm font-medium text-[#4D4540]"
                    >
                      <input
                        type="checkbox"
                        class="peer sr-only"
                        [checked]="day.enabled"
                        (change)="toggleDay(day.dayKey, $any($event.target).checked)"
                      />
                      <span
                        class="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[#B3ACA7] bg-white text-white transition peer-checked:border-[#8B5E4E] peer-checked:bg-[#8B5E4E]"
                      >
                        <svg
                          viewBox="0 0 16 16"
                          class="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2.4"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path d="m3.5 8.2 2.6 2.6 6-7" />
                        </svg>
                      </span>
                      <span>{{ day.label }}</span>
                    </label>

                    @if (day.enabled) {
                      <div class="mt-3 space-y-2 pl-10">
                        @for (interval of day.intervals; track $index) {
                          <div class="flex items-center gap-2">
                            <input
                              type="text"
                              inputmode="numeric"
                              maxlength="5"
                              autocomplete="off"
                              placeholder="08:00"
                              class="h-11 w-29.5 shrink-0 rounded-2xl bg-[#F7F5F4] px-4 text-center text-sm font-medium text-[#2D241E] outline-none ring-1 ring-transparent transition placeholder:text-[#BBB0AA] focus:ring-[#D9C5BC]"
                              [value]="interval.startTime"
                              (input)="onTimeInput(day.dayKey, $index, 'startTime', $event)"
                            />

                            <span class="shrink-0 text-sm text-[#B1A39C]">até</span>

                            <input
                              type="text"
                              inputmode="numeric"
                              maxlength="5"
                              autocomplete="off"
                              placeholder="18:00"
                              class="h-11 w-29.5 shrink-0 rounded-2xl bg-[#F7F5F4] px-4 text-center text-sm font-medium text-[#2D241E] outline-none ring-1 ring-transparent transition placeholder:text-[#BBB0AA] focus:ring-[#D9C5BC]"
                              [value]="interval.endTime"
                              (input)="onTimeInput(day.dayKey, $index, 'endTime', $event)"
                            />

                            @if (day.intervals.length > 1) {
                              <button
                                type="button"
                                (click)="removeInterval(day.dayKey, $index)"
                                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F7F5F4] text-[#B28C7D] transition hover:bg-[#F0E7E2] hover:text-[#8B5E4E]"
                                aria-label="Remover intervalo"
                              >
                                <svg
                                  viewBox="0 0 16 16"
                                  class="h-3.5 w-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="2.4"
                                  stroke-linecap="round"
                                >
                                  <path d="M3 8h10" />
                                </svg>
                              </button>
                            }
                          </div>
                        }

                        <button
                          type="button"
                          (click)="addInterval(day.dayKey)"
                          class="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-[#8B5E4E] transition hover:text-[#714D40]"
                        >
                          <span aria-hidden="true">⊕</span>
                          Adicionar intervalo
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </section>
        </form>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClinicFormDrawerComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastService);

  readonly clinic = input<ClinicCardViewModel | null>(null);
  readonly saving = input(false);
  readonly errorMessage = input<string | null>(null);

  readonly cancel = output<void>();
  readonly save = output<ClinicFormValue>();

  protected readonly submitted = signal(false);
  protected readonly imagePreviewUrl = signal('');
  protected readonly imageFileName = signal('');
  protected readonly selectedImageFile = signal<File | null>(null);
  protected readonly imageRemoved = signal(false);
  protected readonly workingDays = signal<WorkingDay[]>(this.createEmptyWorkingDays());
  protected readonly clinicActive = signal(true);
  private readonly lastErrorToast = signal('');
  protected readonly isEditing = computed(() => !!this.clinic());
  protected readonly title = computed(() => (this.isEditing() ? 'Editar Clínica' : 'Nova Clínica'));
  private lastCepLookup = '';

  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    phone: ['', [Validators.required, Validators.maxLength(20)]],
    email: ['', [Validators.email, Validators.maxLength(150)]],
    whatsapp: ['', [Validators.maxLength(20)]],
    instagram: ['', [Validators.maxLength(60)]],
    street: ['', [Validators.required, Validators.maxLength(150)]],
    number: ['', [Validators.required, Validators.maxLength(20)]],
    neighborhood: ['', [Validators.required, Validators.maxLength(100)]],
    zipCode: ['', [Validators.required]],
    city: ['', [Validators.required, Validators.maxLength(100)]],
    state: ['SP', [Validators.required]],
    imageUrl: [''],
  });

  protected readonly validationMessage = computed(() => {
    if (!this.submitted()) {
      return null;
    }

    const value = this.form.getRawValue();
    const enabledDays = this.workingDays().filter((day) => day.enabled);

    if (this.form.controls.email.invalid) {
      return 'Informe um e-mail válido para contato.';
    }

    if (this.form.invalid) {
      return 'Preencha os campos obrigatórios para continuar.';
    }

    if (!zipCodeValidator(value.zipCode)) {
      return 'Informe um CEP com 8 dígitos.';
    }

    if (!stateValidator(value.state)) {
      return 'Informe uma UF válida com 2 letras.';
    }

    if (!enabledDays.length) {
      return 'Selecione ao menos um dia de funcionamento.';
    }

    for (const day of enabledDays) {
      for (const interval of day.intervals) {
        if (!timeValueValidator(interval.startTime) || !timeValueValidator(interval.endTime)) {
          return 'Informe horários válidos no formato HH:MM.';
        }

        if (interval.startTime >= interval.endTime) {
          return `O horário de fechamento precisa ser posterior ao de abertura em ${day.label}.`;
        }
      }
    }

    for (const day of enabledDays) {
      if (day.intervals.length > 1) {
        const sorted = [...day.intervals].sort((a, b) => a.startTime.localeCompare(b.startTime));

        for (let i = 0; i < sorted.length - 1; i++) {
          if (sorted[i].endTime > sorted[i + 1].startTime) {
            return `Intervalos sobrepostos em ${day.label}.`;
          }
        }
      }
    }

    return null;
  });

  constructor() {
    effect(() => {
      const clinic = this.clinic();
      this.submitted.set(false);

      if (clinic) {
        this.form.reset({
          name: clinic.name,
          phone: this.formatPhoneValue(clinic.phone),
          email: clinic.email,
          whatsapp: this.formatPhoneValue(clinic.whatsapp),
          instagram: clinic.instagram,
          street: clinic.street,
          number: clinic.number,
          neighborhood: clinic.neighborhood,
          zipCode: this.formatCepValue(clinic.zipCode),
          city: clinic.city,
          state: clinic.state,
          imageUrl: clinic.imageUrl,
        });
        this.imagePreviewUrl.set(clinic.imageUrl || '');
        this.imageFileName.set('');
        this.selectedImageFile.set(null);
        this.imageRemoved.set(false);
        this.workingDays.set(cloneWorkingDays(clinic.workingDays));
        this.clinicActive.set(clinic.active);
        return;
      }

      this.form.reset({
        name: '',
        phone: '',
        email: '',
        whatsapp: '',
        instagram: '',
        street: '',
        number: '',
        neighborhood: '',
        zipCode: '',
        city: '',
        state: 'SP',
        imageUrl: '',
      });
      this.imagePreviewUrl.set('');
      this.imageFileName.set('');
      this.selectedImageFile.set(null);
      this.imageRemoved.set(false);
      this.workingDays.set(this.createEmptyWorkingDays());
      this.clinicActive.set(true);
    });

    effect(() => {
      const message = this.errorMessage();

      if (!message) {
        this.lastErrorToast.set('');
        return;
      }

      if (message === this.lastErrorToast()) {
        return;
      }

      this.lastErrorToast.set(message);
      this.toastService.error(message);
    });
  }

  protected toggleDay(dayKey: ClinicDayKey, enabled: boolean): void {
    this.workingDays.update((days) =>
      days.map((day) => (day.dayKey === dayKey ? { ...day, enabled } : day)),
    );
  }

  protected addInterval(dayKey: ClinicDayKey): void {
    this.workingDays.update((days) =>
      days.map((day) =>
        day.dayKey === dayKey
          ? { ...day, intervals: [...day.intervals, { startTime: '', endTime: '' }] }
          : day,
      ),
    );
  }

  protected removeInterval(dayKey: ClinicDayKey, index: number): void {
    this.workingDays.update((days) =>
      days.map((day) =>
        day.dayKey === dayKey
          ? { ...day, intervals: day.intervals.filter((_, idx) => idx !== index) }
          : day,
      ),
    );
  }

  protected onPhoneInput(controlName: 'phone' | 'whatsapp', event: Event): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = this.formatPhoneValue(input.value);
    input.value = formattedValue;
    this.form.controls[controlName].setValue(formattedValue, { emitEvent: false });
  }

  protected onCepInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = this.formatCepValue(input.value);
    const cep = formatted.replace(/\D/g, '');
    input.value = formatted;
    this.form.controls.zipCode.setValue(formatted, { emitEvent: false });

    if (cep.length === 8 && cep !== this.lastCepLookup) {
      void this.fillAddressFromCep(cep);
    }

    if (cep.length < 8) {
      this.lastCepLookup = '';
    }
  }

  protected onStateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = input.value
      .replace(/[^a-zA-Z]/g, '')
      .slice(0, 2)
      .toUpperCase();
    input.value = formatted;
    this.form.controls.state.setValue(formatted, { emitEvent: false });
  }

  protected normalizeEmailInput(controlName: 'email'): void {
    const normalizedValue = this.form.controls[controlName].value.trim().toLowerCase();
    this.form.controls[controlName].setValue(normalizedValue, { emitEvent: false });
    this.form.controls[controlName].updateValueAndValidity({ emitEvent: false });
  }

  protected shouldShowEmailError(): boolean {
    const emailControl = this.form.controls.email;
    return emailControl.invalid && (emailControl.touched || this.submitted());
  }

  protected onTimeInput(
    dayKey: ClinicDayKey,
    intervalIndex: number,
    field: 'startTime' | 'endTime',
    event: Event,
  ): void {
    const input = event.target as HTMLInputElement;
    const normalizedValue = this.normalizeTimeValue(input.value);
    input.value = normalizedValue;
    this.workingDays.update((days) =>
      days.map((day) =>
        day.dayKey === dayKey
          ? {
              ...day,
              intervals: day.intervals.map((interval, idx) =>
                idx === intervalIndex ? { ...interval, [field]: normalizedValue } : interval,
              ),
            }
          : day,
      ),
    );
  }

  protected onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.imageFileName.set(file.name);
    this.selectedImageFile.set(file);
    this.imageRemoved.set(false);

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      this.imagePreviewUrl.set(result);
      this.form.controls.imageUrl.setValue(result);
    };
    reader.readAsDataURL(file);
  }

  protected removeImage(): void {
    this.imagePreviewUrl.set('');
    this.imageFileName.set('');
    this.selectedImageFile.set(null);
    this.imageRemoved.set(true);
    this.form.controls.imageUrl.setValue('');
  }

  protected submit(): void {
    this.submitted.set(true);
    const validationMessage = this.validationMessage();

    if (validationMessage) {
      this.toastService.error(validationMessage);
      return;
    }

    const value = this.form.getRawValue();
    const active = this.isEditing() ? this.clinicActive() : true;

    this.save.emit({
      ...value,
      zipCode: value.zipCode.replace(/\D/g, ''),
      state: value.state.trim().toUpperCase(),
      imageFile: this.selectedImageFile(),
      imageRemoved: this.imageRemoved(),
      workingDays: cloneWorkingDays(this.workingDays()),
      active,
    });
  }

  private normalizeTimeValue(value: string): string {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 4);

    if (!digitsOnly.length) {
      return '';
    }

    if (digitsOnly.length <= 2) {
      return digitsOnly;
    }

    const hoursText = digitsOnly.slice(0, 2);
    const minutesText = digitsOnly.slice(2, 4);
    const formattedValue = `${hoursText}:${minutesText}`;

    if (minutesText.length < 2) {
      return formattedValue;
    }

    return this.clampTimeValue(formattedValue);
  }

  private clampTimeValue(value: string): string {
    if (!/^\d{2}:\d{2}$/.test(value)) {
      return value;
    }

    const [hoursText, minutesText] = value.split(':');
    const hours = Math.min(Math.max(Number(hoursText), 0), 23);
    const minutes = Math.min(Math.max(Number(minutesText), 0), 59);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  private formatPhoneValue(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 2) {
      return digits.length ? `(${digits}` : '';
    }

    const areaCode = digits.slice(0, 2);
    const remainingDigits = digits.slice(2);

    if (digits.length === 11) {
      const firstBlock = remainingDigits.slice(0, 5);
      const secondBlock = remainingDigits.slice(5, 9);
      return secondBlock
        ? `(${areaCode}) ${firstBlock}-${secondBlock}`
        : `(${areaCode}) ${firstBlock}`;
    }

    const firstBlock = remainingDigits.slice(0, 4);
    const secondBlock = remainingDigits.slice(4, 8);
    return secondBlock
      ? `(${areaCode}) ${firstBlock}-${secondBlock}`
      : `(${areaCode}) ${firstBlock}`;
  }

  private formatCepValue(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
  }

  private createEmptyWorkingDays(): WorkingDay[] {
    return cloneWorkingDays(CLINIC_SCHEDULE_TEMPLATE).map((day) => ({
      ...day,
      enabled: false,
      intervals: [{ startTime: '', endTime: '' }],
    }));
  }

  private async fillAddressFromCep(cep: string): Promise<void> {
    this.lastCepLookup = cep;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const address = (await response.json()) as ViaCepResponse;

      if (this.lastCepLookup !== cep || address.erro) {
        return;
      }

      this.form.patchValue(
        {
          street: address.logradouro || this.form.controls.street.value,
          neighborhood: address.bairro || this.form.controls.neighborhood.value,
          city: address.localidade || this.form.controls.city.value,
          state: address.uf || this.form.controls.state.value,
        },
        { emitEvent: false },
      );
    } catch {
      // CEP lookup is a convenience; manual address entry remains available.
    }
  }
}

interface ViaCepResponse {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}
