import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-global-footer',
  imports: [RouterLink],
  template: `
    <footer class="border-t mt-5 border-[rgba(221,199,180,0.2)] bg-[#E2D8D1] text-[#5D4B3E]">
      <div class="mx-auto flex max-w-7xl flex-col gap-20 px-8 py-20">
        <div class="grid gap-14 xl:grid-cols-[1.35fr_0.55fr_0.75fr_0.75fr]">
          <section class="max-w-md">
            <h2 class="font-serif text-2xl font-bold text-[#A77769]">Dra. Mariana Dias</h2>
            <p class="mt-6 text-sm leading-5.75 text-[#5D4B3E]">
              Referência em odontologia humanizada e itinerante. A Dra. Mariana tem a missão de
              transformar sorrisos com elegância e cuidado, priorizando sempre o bem-estar e a
              essência de cada paciente.
            </p>

            <div class="mt-8 flex gap-4">
              @for (social of socials; track social.label) {
                <a
                  [href]="social.href"
                  class="grid h-11 w-11 place-items-center rounded-full border border-[rgba(221,199,180,0.2)] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 hover:shadow-md"
                  [attr.aria-label]="social.label"
                >
                  <img [src]="social.icon" width="20" height="20" alt="" aria-hidden="true" />
                </a>
              }
            </div>
          </section>

          <section>
            <h3 class="text-sm font-semibold uppercase tracking-[0.18em] text-[#2D241E]">
              Acesso rápido
            </h3>
            <nav class="mt-7 space-y-4 text-sm font-medium leading-5" aria-label="Rodapé">
              @for (item of quickLinks; track item.label) {
                <a
                  [routerLink]="item.href"
                  class="flex items-center gap-2 transition hover:text-[#A77769]"
                >
                  <span class="h-1 w-1 rounded-full bg-[rgba(167,119,105,0.4)]"></span>
                  <span>{{ item.label }}</span>
                </a>
              }
            </nav>
          </section>

          <section>
            <h3 class="text-sm font-semibold uppercase tracking-[0.18em] text-[#2D241E]">
              Contatos
            </h3>
            <div class="mt-7 space-y-4 text-sm leading-5">
              <div class="flex items-start gap-3">
                <a href="https://api.whatsapp.com/send?phone=61993359225">
                  <img src="/telefone.svg" width="14" height="14" alt="" aria-hidden="true" />
                </a>
                <div>
                  <a class="text-sm" href="https://api.whatsapp.com/send?phone=61993359225">
                    (61) 99843-9300
                  </a>
                  <p
                    class="mt-1 text-[10px] uppercase tracking-widest text-[rgba(167,119,105,0.6)]"
                  >
                    Whatsapp & Voz
                  </p>
                </div>
              </div>

              <a href="mailto:contato@dramariana.odo.br" class="flex items-center gap-3">
                <img src="/email.svg" width="15" height="12" alt="" aria-hidden="true" />
                <span class="text-sm">contato&#64;dramariana.odo.br</span>
              </a>

              <p class="flex items-start gap-3">
                <img src="/localizacao.svg" width="12" height="15" alt="" aria-hidden="true" />
                <span>CSB 02, Lote 01/04 - Taguatinga, Brasília</span>
              </p>
            </div>
          </section>

          <section>
            <h3 class="text-sm font-semibold uppercase tracking-[0.18em] text-[#2D241E]">
              Disponibilidade
            </h3>
            <div class="mt-7 space-y-6 text-sm leading-5">
              <div>
                <p class="font-semibold text-[#2D241E]">Segunda à Sexta</p>
                <p class="text-sm">08:00 — 19:00</p>
                <p class="mt-2 text-[10px] uppercase tracking-widest text-[rgba(167,119,105,0.6)]">
                  Sob agendamento prévio
                </p>
              </div>

              <div>
                <p class="font-semibold text-[#2D241E]">Sábados</p>
                <p class="text-sm">09:00 — 13:00</p>
              </div>

              <a
                href="https://api.whatsapp.com/send?phone=61993359225"
                class="mt-2 block rounded-2xl bg-[#A77769] px-8 py-3.5 text-center text-sm font-bold text-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] transition hover:bg-[#9A6A5C]"
              >
                Agendar Horário
              </a>
            </div>
          </section>
        </div>

        <div class="border-t border-[rgba(221,199,180,0.2)] pt-8">
          <div class="flex flex-col gap-6 text-xs md:flex-row md:items-center md:justify-between">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
              <p class="text-sm font-normal text-[#5D4B3E]">
                © 2026 Dra. Mariana Dias. Todos os direitos reservados.
              </p>
              <div
                class="flex gap-5 uppercase tracking-widest text-[10px] text-[rgba(167,119,105,0.6)]"
              >
                <a href="#">Privacidade</a>
                <a href="#">Termos</a>
              </div>
            </div>

            <div
              class="flex flex-wrap gap-5 text-[10px] font-semibold uppercase tracking-widest text-[rgba(167,119,105,0.6)]"
            >
              <span
                class="rounded-full border border-[rgba(221,199,180,0.1)] bg-white/50 px-4 py-1.5"
              >
                CRO-DF: 16877
              </span>
              <span
                class="rounded-full border border-[rgba(221,199,180,0.1)] bg-white/50 px-4 py-1.5"
              >
                Resp. Técnica: Dra. Mariana Dias
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalFooterComponent {
  protected readonly socials = [
    {
      label: 'Instagram',
      icon: '/instagram.svg',
      href: 'https://www.instagram.com/dramarianadias_/',
    },
    { label: 'Facebook', icon: '/facebook.svg', href: '' },
    { label: 'Email', icon: '/email.svg', href: 'mailto:contato@dramariana.odo.br' },
  ];

  protected readonly quickLinks = [
    { label: 'Sobre', href: '/' },
    { label: 'Atendimento', href: '/attendance' },
    { label: 'Unidades', href: '/locations' },
  ];
}
