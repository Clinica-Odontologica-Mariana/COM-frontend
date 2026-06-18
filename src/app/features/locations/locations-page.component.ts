import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ClinicsApi } from '../clinics/api/clinics.api';
import {
  ClinicCardViewModel,
  toClinicCardViewModel,
  WorkingDay,
} from '../clinics/models/clinic.models';

interface LocationUnit extends ClinicCardViewModel {
  fullAddress: string;
  mapUrl: string;
  whatsappUrl: string;
}

@Component({
  selector: 'app-locations-page',
  template: `
    <section class="border-b border-[#EDE7E2] bg-[#F9F9F9]">
      <div
        class="mx-auto grid max-w-7xl gap-12 px-8 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:px-12 lg:py-28"
      >
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.45em] text-[#89594C]">
            Presença & cuidado
          </p>
          <h1
            class="mt-8 max-w-3xl font-serif text-6xl font-bold leading-[0.95] text-[#171717] sm:text-7xl lg:text-8xl"
          >
            Onde nos
            <span class="block font-normal italic text-[#89594C]">encontrar.</span>
          </h1>
        </div>

        <p class="max-w-md text-xl leading-8 text-[#5E514B] lg:justify-self-end">
          Estrutura de excelência em clínicas parceiras ou o conforto exclusivo do atendimento
          odontológico no seu endereço.
        </p>
      </div>
    </section>

    <main class="bg-[#F9F9F9] px-8 py-16 lg:px-12">
      <div class="mx-auto max-w-7xl">
        <div
          class="mb-12 flex flex-col gap-4 border-b border-[#EDE7E2] pb-10 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.32em] text-[#A77769]">
              Atendimento presencial
            </p>
            <h2 class="mt-4 font-serif text-4xl font-bold text-[#4F3F38]">
              Nossas Unidades Parceiras
            </h2>
          </div>
          <a
            [href]="primaryWhatsappUrl()"
            class="inline-flex w-fit items-center justify-center rounded-xl bg-[#89594C] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#744A40]"
          >
            Reservar horário
          </a>
        </div>

        @if (loading()) {
          <div class="grid gap-8 lg:grid-cols-2">
            @for (_ of skeletonCards; track $index) {
              <article class="overflow-hidden rounded-lg border border-[#EFEAE7] bg-white">
                <div class="h-64 animate-pulse bg-[#EAE4E0]"></div>
                <div class="space-y-4 p-8">
                  <div class="h-7 w-56 animate-pulse rounded-full bg-[#EEE8E4]"></div>
                  <div class="h-4 w-full animate-pulse rounded-full bg-[#F3EEEB]"></div>
                  <div class="h-4 w-2/3 animate-pulse rounded-full bg-[#F3EEEB]"></div>
                </div>
              </article>
            }
          </div>
        } @else if (!visibleUnits().length) {
          <div class="rounded-lg border border-[#E9C9C0] bg-[#FFF6F4] px-6 py-5 text-[#A34D43]">
            Não foi possível carregar as unidades no momento.
          </div>
        } @else {
          <div class="grid gap-8 lg:grid-cols-2">
            @for (unit of visibleUnits(); track unit.id) {
              <article
                class="overflow-hidden rounded-lg border border-[#EFEAE7] bg-white shadow-[0_16px_40px_rgba(45,36,30,0.04)]"
              >
                <div class="h-64 overflow-hidden bg-[#F3F1EF]">
                  @if (unit.imageUrl) {
                    <img
                      [src]="unit.imageUrl"
                      [alt]="unit.name"
                      class="h-full w-full object-cover"
                      loading="lazy"
                    />
                  } @else {
                    <div
                      class="flex h-full items-center justify-center px-6 text-center text-[#8B7E77]"
                    >
                      <p class="text-base font-semibold">Imagem da unidade indisponível</p>
                    </div>
                  }
                </div>

                <div class="flex min-h-88 flex-col p-8 lg:p-10">
                  <div class="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p class="text-xs font-bold uppercase tracking-[0.24em] text-[#A77769]">
                        {{ unit.city || 'Unidade' }}
                      </p>
                      <h3 class="mt-3 font-serif text-3xl font-bold text-[#89594C]">
                        {{ unit.name }}
                      </h3>
                    </div>

                    <span
                      class="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em]"
                      [class.bg-emerald-100]="unit.active"
                      [class.text-emerald-800]="unit.active"
                      [class.bg-red-100]="!unit.active"
                      [class.text-red-700]="!unit.active"
                    >
                      {{ unit.active ? 'Ativa' : 'Inativa' }}
                    </span>
                  </div>

                  <div class="mt-8 space-y-5 text-base leading-6 text-[#2D241E]">
                    <p class="flex gap-4">
                      <img
                        src="/localizacao.svg"
                        width="18"
                        height="22"
                        alt=""
                        aria-hidden="true"
                        class="mt-1 h-5 w-5"
                      />
                      <span>{{ unit.fullAddress || 'Endereço não informado' }}</span>
                    </p>
                    <p class="flex gap-4">
                      <span
                        class="relative mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 border-[#89594C]"
                        aria-hidden="true"
                      >
                        <span
                          class="absolute left-1/2 top-1/2 h-1.5 w-0.5 -translate-x-1/2 -translate-y-full bg-[#89594C]"
                        ></span>
                        <span
                          class="absolute left-1/2 top-1/2 h-0.5 w-1.5 -translate-y-1/2 bg-[#89594C]"
                        ></span>
                      </span>
                      <span>{{ formatSchedule(unit.workingDays) }}</span>
                    </p>
                    @if (unit.phone) {
                      <p class="flex gap-4">
                        <img
                          src="/telefone.svg"
                          width="18"
                          height="18"
                          alt=""
                          aria-hidden="true"
                          class="mt-1 h-5 w-5"
                        />
                        <span>{{ unit.phone }}</span>
                      </p>
                    }
                    @if (unit.email) {
                      <p class="flex gap-4">
                        <span
                          class="mt-1 h-5 w-5 shrink-0 text-center text-sm font-bold text-[#89594C]"
                        >
                          &#64;
                        </span>
                        <span>{{ unit.email }}</span>
                      </p>
                    }
                  </div>

                  <div class="mt-auto flex items-center justify-between gap-3 pt-10">
                    <a
                      [href]="unit.mapUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex w-fit items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#89594C] transition hover:text-[#744A40]"
                    >
                      Ver no mapa <span aria-hidden="true">-></span>
                    </a>
                    <a
                      [href]="unit.whatsappUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center justify-center rounded border border-[#9E8D83] bg-[#7A6B62] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#6B5D55]"
                    >
                      Agendar
                    </a>
                  </div>
                </div>
              </article>
            }
          </div>
        }
      </div>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationsPageComponent implements OnInit {
  private readonly clinicsApi = inject(ClinicsApi);

  protected readonly skeletonCards = Array.from({ length: 4 });
  protected readonly loading = signal(true);
  protected readonly units = signal<LocationUnit[]>([]);
  protected readonly visibleUnits = computed(() =>
    [...this.units()].sort((left, right) => left.name.localeCompare(right.name, 'pt-BR')),
  );
  protected readonly primaryWhatsappUrl = computed(
    () =>
      this.visibleUnits().find((unit) => unit.whatsapp)?.whatsappUrl ??
      'https://api.whatsapp.com/send?phone=61993359225',
  );

  ngOnInit(): void {
    this.clinicsApi.list().subscribe({
      next: (clinics) => {
        this.units.set(clinics.map((clinic) => toLocationUnit(toClinicCardViewModel(clinic))));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  protected formatSchedule(days: WorkingDay[]): string {
    const enabledDays = days.filter((day) => day.enabled);

    if (!enabledDays.length) {
      return 'Horário não informado';
    }

    const dayLabels = enabledDays.map((day) => day.label.replace('-feira', ''));
    const schedules = enabledDays
      .map((day) =>
        day.intervals.map((interval) => `${interval.startTime} - ${interval.endTime}`).join(', '),
      )
      .filter(Boolean);
    const uniqueSchedules = Array.from(new Set(schedules));

    if (!uniqueSchedules.length) {
      return dayLabels.join(', ');
    }

    if (uniqueSchedules.length === 1) {
      return `${formatList(dayLabels)}: ${uniqueSchedules[0]}`;
    }

    return 'Horários variados';
  }
}

function toLocationUnit(clinic: ClinicCardViewModel): LocationUnit {
  const fullAddress = [
    [clinic.street, clinic.number].filter(Boolean).join(', '),
    clinic.neighborhood,
    [clinic.city, clinic.state].filter(Boolean).join(' - '),
    clinic.zipCode,
  ]
    .filter(Boolean)
    .join(' | ');

  return {
    ...clinic,
    fullAddress,
    mapUrl: `https://maps.google.com/?q=${encodeURIComponent(fullAddress || clinic.name)}`,
    whatsappUrl: `https://api.whatsapp.com/send?phone=${clinic.whatsapp || clinic.phone || '61993359225'}`,
  };
}

function formatList(values: string[]): string {
  if (values.length <= 1) {
    return values[0] ?? '';
  }

  if (values.length === 2) {
    return `${values[0]} e ${values[1]}`;
  }

  return `${values.slice(0, -1).join(', ')} e ${values.at(-1)}`;
}
