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
import {
  CLINIC_SCHEDULE_TEMPLATE,
  ClinicCardViewModel,
  ClinicFormValue,
  ClinicScheduleDay,
  cloneClinicSchedule,
} from '../../models/clinic.models';

function zipCodeValidator(value: string): boolean {
  return /^\d{8}$/.test(value.replace(/\D/g, ''));
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
          class="w-full overflow-hidden rounded-3xl border border-[#F1E7E2] bg-[rgba(250,250,249,0.8)] shadow-[0px_1px_2px_rgba(124,45,18,0.05)] backdrop-blur"
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
                  <span class="text-sm font-medium text-[#4D4540]">Nome da Clínica</span>
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

                  <button
                    type="button"
                    (click)="imageInput.click()"
                    class="flex min-h-43 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-[#E5D7CF] bg-[#FFFDFC] px-6 py-8 text-center transition hover:bg-[#FBF7F5]"
                  >
                    @if (imagePreviewUrl()) {
                      <img
                        [src]="imagePreviewUrl()"
                        alt="Pré-visualização da clínica"
                        class="h-24 w-24 rounded-2xl object-cover"
                      />
                    } @else {
                      <span
                        class="flex h-14 w-14 items-center justify-center rounded-full bg-[#F4E7E1] text-[#BA9485]"
                        aria-hidden="true"
                      >
                        <svg viewBox="0 0 24 24" class="h-7 w-7 stroke-current" fill="none" stroke-width="1.8">
                          <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h7A2.5 2.5 0 0 1 16 7.5V8h1.5A2.5 2.5 0 0 1 20 10.5v7a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-10Z" />
                          <path d="m10 13 2 2 4-4" />
                          <path d="M16.5 4v3m-1.5-1.5h3" />
                        </svg>
                      </span>
                    }

                    <div class="space-y-1">
                      <p class="text-sm font-medium text-[#7C736D]">
                        Arraste uma foto ou clique para buscar
                      </p>
                      <p class="text-xs text-[#B9ACA6]">PNG, JPG até 10MB</p>
                      @if (imageFileName()) {
                        <p class="text-xs font-medium text-[#8B5E4E]">{{ imageFileName() }}</p>
                      }
                    </div>
                  </button>
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
                  <span class="text-sm font-medium text-[#4D4540]">Telefone da Clínica</span>
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
                    <span class="text-xs text-[#A34D43]">Informe um e-mail válido para contato.</span>
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
                  <span class="text-sm font-medium text-[#4D4540]">Instagram</span>
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
                <div class="grid gap-5 md:grid-cols-[343px_163px]">
                  <label class="grid gap-2">
                    <span class="text-sm font-medium text-[#4D4540]">Logradouro (Rua/Av)</span>
                    <input
                      formControlName="street"
                      type="text"
                      class="h-12 rounded-2xl bg-[#F7F5F4] px-4 text-sm text-[#2D241E] outline-none ring-1 ring-transparent transition focus:ring-[#D9C5BC]"
                    />
                  </label>

                  <label class="grid gap-2">
                    <span class="text-sm font-medium text-[#4D4540]">Número</span>
                    <input
                      formControlName="number"
                      type="text"
                      class="h-12 rounded-2xl bg-[#F7F5F4] px-4 text-sm text-[#2D241E] outline-none ring-1 ring-transparent transition focus:ring-[#D9C5BC]"
                    />
                  </label>
                </div>

                <div class="grid gap-5 md:grid-cols-2">
                  <label class="grid gap-2">
                    <span class="text-sm font-medium text-[#4D4540]">Bairro</span>
                    <input
                      formControlName="neighborhood"
                      type="text"
                      class="h-12 rounded-2xl bg-[#F7F5F4] px-4 text-sm text-[#2D241E] outline-none ring-1 ring-transparent transition focus:ring-[#D9C5BC]"
                    />
                  </label>

                  <label class="grid gap-2">
                    <span class="text-sm font-medium text-[#4D4540]">CEP</span>
                    <input
                      formControlName="zipCode"
                      type="text"
                      class="h-12 rounded-2xl bg-[#F7F5F4] px-4 text-sm text-[#2D241E] outline-none ring-1 ring-transparent transition focus:ring-[#D9C5BC]"
                      placeholder="00000-000"
                    />
                  </label>
                </div>

                <label class="grid gap-2">
                  <span class="text-sm font-medium text-[#4D4540]">Cidade</span>
                  <input
                    formControlName="city"
                    type="text"
                    class="h-12 rounded-2xl bg-[#F7F5F4] px-4 text-sm text-[#2D241E] outline-none ring-1 ring-transparent transition focus:ring-[#D9C5BC]"
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
                Horário de Funcionamento
              </h2>
              <p class="max-w-55 text-sm leading-7 text-[#6B625D]">
                Defina os dias e horários em que você atende em cada clínica para organizar a agenda da unidade.
              </p>
            </div>

            <div
              class="overflow-hidden rounded-[28px] border border-[#F2E8E2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] md:p-8"
            >
              <div class="space-y-3">
                @for (day of schedule(); track day.dayKey) {
                  <div
                    class="grid gap-4 rounded-3xl border border-[#F2E8E2] bg-[#FFFDFC] px-5 py-5 md:grid-cols-[minmax(0,1fr)_118px_44px_118px] md:items-center"
                  >
                    <label class="flex cursor-pointer items-center gap-4 text-sm font-medium text-[#4D4540]">
                      <input
                        type="checkbox"
                        class="peer sr-only"
                        [checked]="day.enabled"
                        (change)="toggleDay(day.dayKey, $any($event.target).checked)"
                      />
                      <span
                        class="flex h-6 w-6 items-center justify-center rounded border border-[#B3ACA7] bg-white text-white transition peer-checked:border-[#8B5E4E] peer-checked:bg-[#8B5E4E]"
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

                    <input
                      type="text"
                      inputmode="numeric"
                      maxlength="5"
                      autocomplete="off"
                      placeholder="08:00"
                      class="h-11 rounded-2xl bg-[#F7F5F4] px-4 text-center text-sm font-medium text-[#6E6762] outline-none ring-1 ring-transparent transition placeholder:text-[#BBB0AA] focus:ring-[#D9C5BC] disabled:cursor-not-allowed disabled:opacity-50"
                      [value]="displayTime(day.openingTime)"
                      [disabled]="!day.enabled"
                      (input)="onTimeInput(day.dayKey, 'openingTime', $event)"
                    />

                    <span class="self-center text-center text-sm text-[#B1A39C]">até</span>

                    <input
                      type="text"
                      inputmode="numeric"
                      maxlength="5"
                      autocomplete="off"
                      placeholder="18:00"
                      class="h-11 rounded-2xl bg-[#F7F5F4] px-4 text-center text-sm font-medium text-[#6E6762] outline-none ring-1 ring-transparent transition placeholder:text-[#BBB0AA] focus:ring-[#D9C5BC] disabled:cursor-not-allowed disabled:opacity-50"
                      [value]="displayTime(day.closingTime)"
                      [disabled]="!day.enabled"
                      (input)="onTimeInput(day.dayKey, 'closingTime', $event)"
                    />
                  </div>
                }
              </div>

              <button
                type="button"
                (click)="showExtraIntervalHint()"
                class="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#8B5E4E] transition hover:text-[#714D40]"
              >
                <span aria-hidden="true">⊕</span>
                Adicionar outro intervalo
              </button>

              @if (extraIntervalHintVisible()) {
                <p class="mt-3 text-xs leading-6 text-[#8C817B]">
                  No mock atual, cada dia usa um único intervalo. A estrutura já está isolada para
                  evoluir isso quando a API entrar.
                </p>
              }
            </div>
          </section>

          @if (submitted() && validationMessage()) {
            <div class="rounded-2xl border border-[#E9C9C0] bg-[#FFF6F4] px-4 py-3 text-sm text-[#A34D43]">
              {{ validationMessage() }}
            </div>
          }

          @if (errorMessage()) {
            <div class="rounded-2xl border border-[#E9C9C0] bg-[#FFF6F4] px-4 py-3 text-sm text-[#A34D43]">
              {{ errorMessage() }}
            </div>
          }
        </form>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClinicFormDrawerComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly clinic = input<ClinicCardViewModel | null>(null);
  readonly saving = input(false);
  readonly errorMessage = input<string | null>(null);

  readonly cancel = output<void>();
  readonly save = output<ClinicFormValue>();

  protected readonly submitted = signal(false);
  protected readonly imagePreviewUrl = signal('');
  protected readonly imageFileName = signal('');
  protected readonly extraIntervalHintVisible = signal(false);
  protected readonly schedule = signal<ClinicScheduleDay[]>(cloneClinicSchedule(CLINIC_SCHEDULE_TEMPLATE));
  protected readonly isEditing = computed(() => !!this.clinic());
  protected readonly title = computed(() =>
    this.isEditing() ? 'Editar Clínica' : 'Nova Clínica',
  );

  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    phone: ['', [Validators.required, Validators.maxLength(20)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    whatsapp: ['', [Validators.maxLength(20)]],
    instagram: ['', [Validators.required, Validators.maxLength(60)]],
    street: ['', [Validators.required, Validators.maxLength(150)]],
    number: ['', [Validators.required, Validators.maxLength(20)]],
    neighborhood: ['', [Validators.required, Validators.maxLength(100)]],
    zipCode: ['', [Validators.required]],
    city: ['', [Validators.required, Validators.maxLength(100)]],
    imageUrl: [''],
  });

  protected readonly validationMessage = computed(() => {
    if (!this.submitted()) {
      return null;
    }

    const value = this.form.getRawValue();
    const enabledDays = this.schedule().filter((day) => day.enabled);

    if (this.form.controls.email.invalid) {
      return 'Informe um e-mail válido para contato.';
    }

    if (this.form.invalid) {
      return 'Preencha os campos obrigatórios para continuar.';
    }

    if (!zipCodeValidator(value.zipCode)) {
      return 'Informe um CEP com 8 dígitos.';
    }

    if (!enabledDays.length) {
      return 'Selecione ao menos um dia de funcionamento.';
    }

    if (enabledDays.some((day) => !timeValueValidator(day.openingTime) || !timeValueValidator(day.closingTime))) {
      return 'Informe horários válidos no formato HH:MM.';
    }

    if (enabledDays.some((day) => day.openingTime >= day.closingTime)) {
      return 'O horário de fechamento precisa ser posterior ao de abertura.';
    }

    return null;
  });

  constructor() {
    effect(() => {
      const clinic = this.clinic();
      this.submitted.set(false);
      this.extraIntervalHintVisible.set(false);

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
          zipCode: clinic.zipCode,
          city: clinic.city,
          imageUrl: clinic.imageUrl,
        });
        this.imagePreviewUrl.set(clinic.imageUrl);
        this.imageFileName.set('');
        this.schedule.set(cloneClinicSchedule(clinic.schedule));
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
        imageUrl: '',
      });
      this.imagePreviewUrl.set('');
      this.imageFileName.set('');
      this.schedule.set(cloneClinicSchedule(CLINIC_SCHEDULE_TEMPLATE));
    });
  }

  protected toggleDay(dayKey: ClinicScheduleDay['dayKey'], enabled: boolean): void {
    this.schedule.update((days) =>
      days.map((day) => (day.dayKey === dayKey ? { ...day, enabled } : day)),
    );
  }

  protected onPhoneInput(controlName: 'phone' | 'whatsapp', event: Event): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = this.formatPhoneValue(input.value);
    input.value = formattedValue;
    this.form.controls[controlName].setValue(formattedValue, { emitEvent: false });
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
    dayKey: ClinicScheduleDay['dayKey'],
    field: 'openingTime' | 'closingTime',
    event: Event,
  ): void {
    const input = event.target as HTMLInputElement;
    const normalizedValue = this.normalizeTimeValue(input.value);
    input.value = this.displayTime(normalizedValue);
    this.updateDayTime(dayKey, field, normalizedValue);
  }

  protected updateDayTime(
    dayKey: ClinicScheduleDay['dayKey'],
    field: 'openingTime' | 'closingTime',
    value: string,
  ): void {
    const normalizedValue = this.normalizeTimeValue(value);
    this.schedule.update((days) =>
      days.map((day) => (day.dayKey === dayKey ? { ...day, [field]: normalizedValue } : day)),
    );
  }

  protected displayTime(value: string): string {
    return value;
  }

  protected showExtraIntervalHint(): void {
    this.extraIntervalHintVisible.set(true);
  }

  protected onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.imageFileName.set(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      this.imagePreviewUrl.set(result);
      this.form.controls.imageUrl.setValue(result);
    };
    reader.readAsDataURL(file);
  }

  protected submit(): void {
    this.submitted.set(true);

    if (this.validationMessage()) {
      return;
    }

    const value = this.form.getRawValue();
    this.save.emit({
      ...value,
      zipCode: value.zipCode.replace(/\D/g, ''),
      schedule: cloneClinicSchedule(this.schedule()),
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
      return secondBlock ? `(${areaCode}) ${firstBlock}-${secondBlock}` : `(${areaCode}) ${firstBlock}`;
    }

    const firstBlock = remainingDigits.slice(0, 4);
    const secondBlock = remainingDigits.slice(4, 8);
    return secondBlock ? `(${areaCode}) ${firstBlock}-${secondBlock}` : `(${areaCode}) ${firstBlock}`;
  }
}
