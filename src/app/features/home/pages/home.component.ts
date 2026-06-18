import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { CertificateApi } from '../../certificates/api/certificate.api';
import { adaptCertificates } from '../../certificates/adapters/certificate.adapter';
import { CertificateViewModel } from '../../certificates/models/certificate.model';

const MAX_PUBLIC_CERTIFICATES = 3;

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [],
  template: `
    <main class="bg-[#FAFAF9] text-[#6B5B52]">
      <!-- HERO -->
      <section id="sobre" class="mx-auto max-w-7xl px-6 py-16 lg:px-12 lg:py-20">
        <div class="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p class="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#A77769]">
              Trajetória e propósito
            </p>
            <h1
              class="max-w-3xl font-serif text-4xl leading-[1.05] text-[#8B574B] sm:text-5xl lg:text-6xl"
            >
              Dra. Mariana, transformando sorrisos onde você estiver.
            </h1>
            <p class="mt-6 max-w-2xl text-sm leading-7 text-[#6D625E] sm:text-base">
              Minha jornada começou na Universidade de Brasília (UnB) quando me encantei pela
              odontologia. Desde cedo, sou movida pelo desejo de ajudar as pessoas sendo realçando
              sua beleza e confiança ou restaurando sua saúde. Por isso me encantei pela Odontologia
              Estética e hoje aprofundo meus conhecimentos na Especialização de Dentística na USP
              Ribeirão Preto.
            </p>

            <div class="mt-8 flex items-center gap-4 text-[#A77769]">
              <span class="h-px w-10 bg-[#D9C8C0]"></span>
              <p class="font-serif text-xl italic">
                "A saúde começa pelo acolhimento, não pela técnica."
              </p>
            </div>
          </div>

          <div class="justify-self-center">
            <img
              src="/mariana-dias-profile.png"
              alt="Dra. Mariana Dias"
              class="h-205 w-full object-cover object-center sm:h-125"
            />
          </div>
        </div>
      </section>

      <!-- CERTIFICATES -->
      @if (certificates().length > 0) {
        <section id="certificados" class="border-b border-[#EEE5E0] px-6 py-16 lg:px-12">
          <div class="mx-auto max-w-5xl">
            <div>
              <h2 class="font-serif text-3xl text-[#8B574B] sm:text-4xl">Certificações</h2>
              <p class="mt-2 text-sm text-[#A29087]">Formação e qualificação profissional</p>
            </div>

            <div class="mt-10 grid gap-4 md:grid-cols-3">
              @for (cert of certificates(); track cert.id) {
                <article
                  class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#F0E8E3] transition hover:shadow-md"
                >
                  <span
                    class="inline-block rounded-full bg-[#F5EDE8] px-3 py-1 text-xs font-semibold text-[#8B574B]"
                  >
                    {{ cert.certificateType }}
                  </span>
                  <h3 class="mt-3 font-serif text-lg text-[#5E514B]">{{ cert.title }}</h3>
                  @if (cert.content) {
                    <p class="mt-2 text-sm leading-6 text-[#8F817A]">{{ cert.content }}</p>
                  }
                  @if (cert.issuedAtFormatted) {
                    <p class="mt-4 text-xs text-[#B49B91]">{{ cert.issuedAtFormatted }}</p>
                  }
                </article>
              }
            </div>
          </div>
        </section>
      }

      <!-- SPECIALTIES -->
      <section id="atendimento" class="mx-auto max-w-7xl px-6 py-16 lg:px-12">
        <h2 class="font-serif text-3xl text-[#8B574B] sm:text-4xl">Especializações & Foco</h2>

        <div class="mt-10 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <article
            class="tilt-card relative min-h-85 overflow-hidden rounded-[28px] bg-[#8A5C4D] text-white shadow-[0_18px_45px_rgba(138,92,77,0.22)]"
          >
            <div
              class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.1),transparent_25%),linear-gradient(135deg,#A26A59_0%,#8A5C4D_45%,#6D4338_100%)]"
            ></div>
            <div class="absolute inset-0 opacity-40">
              <div
                class="absolute left-8 top-10 h-20 w-20 rounded-full border border-white/25"
              ></div>
              <div
                class="absolute right-10 top-14 h-32 w-32 rounded-full border border-white/15"
              ></div>
              <div
                class="absolute bottom-10 left-16 h-44 w-44 rounded-full border border-white/10"
              ></div>
            </div>
            <div class="absolute bottom-0 left-0 right-0 p-7">
              <h3 class="font-serif text-3xl">Reabilitação Oral</h3>
              <p class="mt-3 max-w-md text-sm leading-6 text-white/85">
                Restaurando a função mastigatória e a estética através de próteses e implantes com
                tecnologia guiada.
              </p>
            </div>
          </article>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <article class="rounded-[28px] bg-[#F7D7D1] p-7 shadow-sm">
              <p class="font-serif text-2xl text-[#8B574B]">Odontogeriatria</p>
              <p class="mt-4 text-sm leading-6 text-[#6F625D]">
                Atendimento especializado para a terceira idade, com protocolos adaptados para
                pacientes com Alzheimer ou limitações motoras.
              </p>
            </article>

            <div class="grid gap-4 sm:grid-cols-2">
              <article class="rounded-[28px] bg-[#ECECEC] p-7 shadow-sm">
                <img src="estrela_icon.svg" class="size-7" />
                <h3 class="mt-8 font-serif text-2xl text-[#8B574B]">Estética</h3>
              </article>
              <article class="rounded-[28px] bg-[#F2E2CC] p-7 shadow-sm">
                <img src="escudo_icon.svg" class="size-7" />
                <h3 class="mt-8 font-serif text-2xl text-[#8B574B]">Prevenção</h3>
              </article>
            </div>
          </div>
        </div>
      </section>

      <!-- PHILOSOPHY -->
      <section class="bg-[#F3F3F3] px-6 py-16 lg:px-12">
        <div class="mx-auto max-w-7xl text-center">
          <h2 class="font-serif text-4xl text-[#8B574B]">Nossa Filosofia</h2>
          <p class="mt-2 text-sm text-[#A29087]">
            Um novo paradigma de cuidado que une a precisão técnica ao calor humano.
          </p>

          <div class="mt-10 grid gap-4 lg:grid-cols-3">
            @for (item of philosophy; track item.title) {
              <article
                class="rounded-[22px] bg-white p-8 text-left shadow-sm ring-1 ring-[#EFE8E4]"
              >
                <div
                  class="grid h-12 w-12 place-items-center rounded-full bg-[#F5D7CF] text-[#8B574B]"
                >
                  <img src="{{ item.icon }}" class="size-5" />
                </div>
                <h3 class="mt-6 font-serif text-2xl text-[#8B574B]">{{ item.title }}</h3>
                <p class="mt-5 text-sm leading-7 text-[#6F645F]">{{ item.description }}</p>
              </article>
            }
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="px-6 py-20 lg:px-12">
        <div
          class="mx-auto max-w-5xl rounded-4xl bg-[#A06D5E] px-6 py-16 text-center text-white shadow-[0_18px_60px_rgba(160,109,94,0.25)]"
        >
          <h2 class="font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl">
            Agende uma consulta com <br />uma especialista
          </h2>
          <a
            href="https://api.whatsapp.com/send?phone=61998439300"
            class="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#8B574B] transition hover:bg-[#F3E9E5]"
          >
            Solicitar Orçamento
          </a>
        </div>
      </section>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private readonly certificateApi = inject(CertificateApi);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly certificates = signal<CertificateViewModel[]>([]);

  protected readonly philosophy = [
    {
      icon: 'casa_icon.svg',
      title: 'Conveniência Ética',
      description:
        'Levamos o consultório completo até você, garantindo privacidade absoluta e eliminando o estresse do deslocamento.',
    },
    {
      icon: 'coracao_icon.svg',
      title: 'Humanização Real',
      description:
        'Consultas com tempo estendido. Ouvimos o paciente além da queixa clínica, tratando a pessoa, não apenas o dente.',
    },
    {
      icon: 'tecnologia_icon.svg',
      title: 'Tecnologia Portátil',
      description:
        'Equipamentos de última geração em versões compactas para diagnósticos precisos em qualquer ambiente.',
    },
  ];

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    // Destaques são públicos: carregam para qualquer visitante (logado ou não).
    this.certificateApi.getFeatured().subscribe({
      next: (dtos) => {
        this.certificates.set(adaptCertificates(dtos).slice(0, MAX_PUBLIC_CERTIFICATES));
      },
      error: () => {
        /* mantém a seção oculta se a listagem falhar */
      },
    });
  }
}
