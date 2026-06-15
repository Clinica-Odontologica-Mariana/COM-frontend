import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-attendance-cta',
  imports: [],
  template: `
    <section class="md:hidden bg-[#714A3E] px-6 py-16 flex flex-col gap-6">
      <h2 class="text-white text-base font-serif text-center leading-6">
        Pronto para transformar sua experiência odontológica?
      </h2>

      <div class="flex flex-col gap-4">
        <a
          href="https://wa.me/5561998439300"
          target="_blank"
          rel="noopener"
          class="flex items-center justify-center bg-white py-4 px-6 rounded-lg"
        >
          <span class="text-[#714A3E] text-base uppercase tracking-wide">Agendar Consulta</span>
        </a>

        <a
          href="https://wa.me/5561998439300"
          target="_blank"
          rel="noopener"
          class="flex items-center justify-center gap-2 bg-transparent py-4 px-6 rounded-lg border border-white"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
            />
            <path
              d="M11.999 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.979-1.306A9.94 9.94 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"
              fill-rule="evenodd"
              clip-rule="evenodd"
            />
          </svg>
          <span class="text-white text-base uppercase tracking-wide">Falar no WhatsApp</span>
        </a>
      </div>
    </section>

    <section class="hidden md:block mx-12 mb-32">
      <div class="bg-[#7C5145] rounded-[48px] overflow-hidden">
        <div
          class="flex flex-col items-center py-24 px-6 rounded-[48px] bg-cover bg-center"
          style="background-image: url('/home/cta-bg.png');"
        >
          <div class="flex flex-col items-center gap-8 text-center">
            <h2 class="text-white text-5xl font-serif leading-tight max-w-2xl">
              Pronto para transformar sua<br />experiência odontológica?
            </h2>

            <p class="text-white text-lg max-w-2xl">
              Agende sua primeira conversa e descubra como a Dra. Mariana pode levar o melhor da
              saúde bucal até você.
            </p>

            <div class="flex items-center gap-4 pt-4">
              <a
                href="https://wa.me/5561998439300"
                target="_blank"
                rel="noopener"
                class="flex items-center justify-center bg-white py-5 px-10 rounded-xl transition hover:bg-[#F4ECE7]"
              >
                <span class="text-[#7C5145] text-lg font-bold">Agendar Consulta</span>
              </a>

              <a
                href="https://wa.me/5561998439300"
                target="_blank"
                rel="noopener"
                class="flex items-center justify-center bg-transparent py-5 px-10 rounded-xl border border-[#FFFFFF4D] transition hover:bg-white/10"
              >
                <span class="text-white text-lg font-bold">Falar no WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceCtaComponent {}
