import { ChangeDetectionStrategy, Component } from '@angular/core';

interface LocationUnit {
  name: string;
  region?: string;
  description: string;
  address: string;
  hours?: string;
  phone?: string;
  imageUrl?: string;
  mapUrl?: string;
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
            href="https://api.whatsapp.com/send?phone=61993359225"
            class="inline-flex w-fit items-center justify-center rounded-xl bg-[#89594C] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#744A40]"
          >
            Reservar horário
          </a>
        </div>

        <div class="grid gap-8 lg:grid-cols-2">
          <article
            class="overflow-hidden rounded-lg border border-[#EFEAE7] bg-white shadow-[0_16px_40px_rgba(45,36,30,0.04)] lg:col-span-1"
          >
            <div class="grid min-h-124 md:grid-cols-[1.05fr_0.95fr]">
              <div
                class="min-h-80 bg-cover bg-center"
                [style.background-image]="'url(' + featuredUnit.imageUrl + ')'"
                role="img"
                [attr.aria-label]="featuredUnit.name"
              ></div>
              <div class="flex flex-col p-8 lg:p-10">
                <h3 class="font-serif text-3xl font-bold text-[#89594C]">
                  {{ featuredUnit.name }}
                </h3>
                <p class="mt-4 text-base leading-7 text-[#5E514B]">
                  {{ featuredUnit.description }}
                </p>

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
                    <span>{{ featuredUnit.address }}</span>
                  </p>
                  <p class="flex gap-4">
                    <span
                      class="relative mt-0.5 h-5 w-5 rounded-full border-2 border-[#89594C]"
                      aria-hidden="true"
                    >
                      <span
                        class="absolute left-1/2 top-1/2 h-1.5 w-0.5 -translate-x-1/2 -translate-y-full bg-[#89594C]"
                      ></span>
                      <span
                        class="absolute left-1/2 top-1/2 h-0.5 w-1.5 -translate-y-1/2 bg-[#89594C]"
                      ></span>
                    </span>
                    <span>{{ featuredUnit.hours }}</span>
                  </p>
                </div>

                <a
                  [href]="featuredUnit.mapUrl"
                  class="mt-auto inline-flex w-fit items-center gap-2 pt-10 text-sm font-bold uppercase tracking-wide text-[#89594C] transition hover:text-[#744A40]"
                >
                  Ver no mapa <span aria-hidden="true">-></span>
                </a>
              </div>
            </div>
          </article>

          <article
            class="overflow-hidden rounded-lg bg-[#75624F] text-white shadow-[0_16px_40px_rgba(45,36,30,0.08)]"
          >
            <div
              class="relative h-48 bg-cover bg-center opacity-80"
              [style.background-image]="'url(' + mapPreviewUrl + ')'"
              aria-hidden="true"
            >
              <span
                class="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#B78474] shadow-[0_0_0_10px_rgba(183,132,116,0.18)]"
              ></span>
            </div>
            <div class="p-8 lg:p-10">
              <h3 class="font-serif text-3xl font-bold">{{ highlightedUnit.name }}</h3>
              <p class="mt-3 text-base leading-7 text-white/80">
                {{ highlightedUnit.description }}
              </p>
              <div class="mt-7 space-y-4 text-base">
                <p class="flex gap-4">
                  <img
                    src="/localizacao.svg"
                    width="18"
                    height="22"
                    alt=""
                    aria-hidden="true"
                    class="mt-1 h-5 w-5 brightness-0 invert"
                  />
                  <span>{{ highlightedUnit.address }}</span>
                </p>
                <p class="flex gap-4">
                  <img
                    src="/telefone.svg"
                    width="18"
                    height="18"
                    alt=""
                    aria-hidden="true"
                    class="mt-1 h-5 w-5 brightness-0 invert"
                  />
                  <span>{{ highlightedUnit.phone }}</span>
                </p>
              </div>
              <a
                href="https://api.whatsapp.com/send?phone=61993359225"
                class="mt-9 flex items-center justify-center rounded-lg bg-white/14 px-6 py-4 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white/22"
              >
                Reservar horário
              </a>
            </div>
          </article>

          <article class="rounded-lg border-l-4 border-[#89594C] bg-[#F3F1EF] p-8">
            <h3 class="font-serif text-2xl font-bold text-[#89594C]">{{ compactUnit.name }}</h3>
            <div class="mt-6 space-y-5 text-base leading-6 text-[#2D241E]">
              <p class="flex gap-4">
                <span class="relative mt-1 h-5 w-5 text-[#89594C]" aria-hidden="true">
                  <span
                    class="absolute left-1/2 top-0 h-5 w-4 -translate-x-1/2 rounded-full border-2 border-[#89594C]"
                  ></span>
                  <span
                    class="absolute left-1/2 top-1.5 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#89594C]"
                  ></span>
                </span>
                <span>{{ compactUnit.address }}</span>
              </p>
              <p class="flex gap-4">
                <span
                  class="relative h-6 w-6 rounded-full border-2 border-[#89594C]"
                  aria-hidden="true"
                >
                  <span
                    class="absolute left-1/2 top-1/2 h-2 w-0.5 -translate-x-1/2 -translate-y-full bg-[#89594C]"
                  ></span>
                  <span
                    class="absolute left-1/2 top-1/2 h-0.5 w-2 -translate-y-1/2 bg-[#89594C]"
                  ></span>
                </span>
                <span>{{ compactUnit.hours }}</span>
              </p>
            </div>
            <div
              class="mt-8 h-44 rounded-md bg-cover bg-center grayscale"
              [style.background-image]="'url(' + compactUnit.imageUrl + ')'"
              role="img"
              [attr.aria-label]="compactUnit.name"
            ></div>
          </article>

          <article class="rounded-lg bg-white p-8 shadow-[0_16px_40px_rgba(45,36,30,0.04)] lg:p-10">
            <div class="grid gap-10 md:grid-cols-[1fr_15rem] md:items-center">
              <div>
                <span
                  class="rounded-full bg-[#F0E8E5] px-5 py-2 text-xs font-bold uppercase tracking-[0.24em] text-[#89594C]"
                >
                  {{ wideUnit.region }}
                </span>
                <h3 class="mt-8 font-serif text-4xl font-bold text-[#89594C]">
                  {{ wideUnit.name }}
                </h3>
                <p class="mt-5 max-w-2xl text-lg leading-8 text-[#5E514B]">
                  {{ wideUnit.description }}
                </p>
                <div
                  class="mt-8 grid gap-6 text-sm uppercase tracking-wide text-[#A77769] sm:grid-cols-2"
                >
                  <div>
                    <p class="font-bold">Endereço</p>
                    <p class="mt-2 normal-case tracking-normal text-base text-[#2D241E]">
                      {{ wideUnit.address }}
                    </p>
                  </div>
                  <div>
                    <p class="font-bold">Contato</p>
                    <p class="mt-2 normal-case tracking-normal text-base text-[#2D241E]">
                      {{ wideUnit.phone }}
                    </p>
                  </div>
                </div>
              </div>
              <div
                class="mx-auto aspect-square w-full max-w-60 rounded-full bg-cover bg-center shadow-[0_0_0_12px_rgba(221,199,180,0.35)]"
                [style.background-image]="'url(' + wideUnit.imageUrl + ')'"
                role="img"
                [attr.aria-label]="wideUnit.name"
              ></div>
            </div>
          </article>
        </div>
      </div>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationsPageComponent {
  protected readonly units: LocationUnit[] = [
    {
      name: 'Unidade Brasília',
      description:
        'Localizada na Asa Sul, oferecendo tecnologia de ponta em um ambiente sereno e sofisticado.',
      address: 'Asa Sul, 904 - EQS Brasília, DF',
      hours: 'Segunda a Sexta: 08h - 19h Sabado: 08h - 13h',
      imageUrl:
        'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=900&q=80',
      mapUrl: 'https://maps.google.com/?q=Asa+Sul+Brasilia',
    },
    {
      name: 'Unidade Águas Claras',
      description: 'Conveniência e agilidade para pacientes da região oeste e condomínios.',
      address: 'Av. Castanheiras, 325',
      phone: '(61) 4195-0000',
    },
    {
      name: 'Unidade Taguatinga',
      address: 'Setor Especial, Q1 Lote16',
      hours: 'Terças e Quintas: 09h - 18h',
      description: 'Atendimento em clínica parceira para procedimentos de rotina e avaliação.',
      imageUrl:
        'https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=900&q=80',
    },
    {
      name: 'Unidade Samambaia',
      region: 'Zona Oeste',
      description:
        'Fácil acesso pelo metrô, com foco em ortodontia estética e clareamento a laser.',
      address: 'QE 40 Conjunto O, Loja 3',
      phone: '(61) 2091-0000',
      imageUrl:
        'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=900&q=80',
    },
  ];

  protected readonly mapPreviewUrl =
    'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=1000&q=80';

  protected readonly featuredUnit = this.units[0];
  protected readonly highlightedUnit = this.units[1];
  protected readonly compactUnit = this.units[2];
  protected readonly wideUnit = this.units[3];
}
