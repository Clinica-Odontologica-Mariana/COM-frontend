import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { FaqItem } from '../../models/attendance.model';

@Component({
  selector: 'app-attendance-faq',
  styles: [
    `
      .faq-answer {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows 500ms ease-in-out;
      }
      .faq-answer.open {
        grid-template-rows: 1fr;
      }
      .faq-answer > div {
        overflow: hidden;
      }
      .faq-item {
        transition: background-color 500ms ease-in-out;
      }
      .faq-item:not(.open):hover {
        background-color: #f5ede9;
      }
      .faq-item.open {
        background-color: #f0e6e2;
      }
    `,
  ],
  template: `
    <section class="md:hidden bg-[#FBF9F8] px-6 py-16 flex flex-col gap-8">
      <h2 class="text-[#714A3E] text-3xl font-serif leading-tight">Dúvidas Frequentes</h2>

      <div class="flex flex-col gap-4">
        @for (item of items(); track item.question; let i = $index) {
          <div
            class="faq-item flex flex-col rounded-lg overflow-hidden bg-white"
            [class.open]="openIndex() === i"
            style="box-shadow: 0px 1px 2px 0px #0000000C"
          >
            <button
              type="button"
              class="flex w-full items-center justify-between text-left p-5 cursor-pointer"
              (click)="toggle(i)"
              [attr.aria-expanded]="openIndex() === i"
            >
              <span class="text-[#714A3E] text-base leading-6 pr-8">{{ item.question }}</span>
              <svg
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="w-3.5 h-3.5 shrink-0 transition-transform duration-500 ease-in-out"
                [class.rotate-45]="openIndex() === i"
              >
                <path d="M6 8H0V6H6V0H8V6H14V8H8V14H6V8Z" fill="#714A3E" />
              </svg>
            </button>
            <div class="faq-answer" [class.open]="openIndex() === i">
              <div>
                <p class="px-5 pb-5 text-[#635D58] text-sm leading-relaxed">
                  {{ item.answer }}
                </p>
              </div>
            </div>
          </div>
        }
      </div>
    </section>

    <section class="hidden md:flex flex-col items-center py-32 px-12 gap-16">
      <div class="flex flex-col items-center gap-4 text-center">
        <h2 class="text-[#7C5145] text-4xl font-serif">Dúvidas Frequentes</h2>
        <p class="text-[#514440] text-base">
          Tudo o que você precisa saber sobre o nosso modelo de atendimento.
        </p>
      </div>

      <div class="flex flex-col w-full max-w-3xl">
        @for (item of items(); track item.question; let i = $index) {
          <div
            class="faq-item flex flex-col border-b border-[#E8DED8] last:border-b-0 rounded-xl overflow-hidden px-4"
            [class.open]="openIndex() === i"
          >
            <button
              type="button"
              class="flex w-full items-center justify-between py-6 text-left cursor-pointer"
              (click)="toggle(i)"
              [attr.aria-expanded]="openIndex() === i"
            >
              <span
                class="text-[#1A1C1C] text-xl pr-8 transition-colors duration-300"
                [class.text-[#7C5145]]="openIndex() === i"
                >{{ item.question }}</span
              >
              <svg
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="w-3.5 h-3.5 shrink-0 transition-transform duration-500 ease-in-out"
                [class.rotate-45]="openIndex() === i"
              >
                <path
                  d="M6 8H0V6H6V0H8V6H14V8H8V14H6V8Z"
                  [attr.fill]="openIndex() === i ? '#7C5145' : '#1A1C1C'"
                />
              </svg>
            </button>
            <div class="faq-answer" [class.open]="openIndex() === i">
              <div>
                <p class="pb-6 text-[#514440] text-base leading-relaxed">
                  {{ item.answer }}
                </p>
              </div>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceFaqComponent {
  readonly items = input.required<FaqItem[]>();
  protected readonly openIndex = signal<number | null>(null);

  protected toggle(index: number): void {
    this.openIndex.update((current) => (current === index ? null : index));
  }
}
