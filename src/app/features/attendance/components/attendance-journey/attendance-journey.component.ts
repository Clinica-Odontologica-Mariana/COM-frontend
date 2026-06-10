import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JourneyStep } from '../../models/attendance.model';

@Component({
  selector: 'app-attendance-journey',
  imports: [CommonModule],
  template: `
    <section class="md:hidden bg-[#FBF9F8] px-4 py-12 flex flex-col gap-6">
      <header class="border-l-4 border-[#714A3E] pl-5">
        <h2 class="text-[#714A3E] text-2xl font-serif leading-tight">Como Funciona</h2>
      </header>

      <div class="grid grid-cols-2 gap-3">
        @for (step of steps(); track step.number) {
          <article
            class="flex flex-col gap-2 p-4 rounded-xl border border-[#E7DED74C] bg-white"
            style="box-shadow: 0px 1px 2px 0px #0000000C"
          >
            <span class="text-[#714A3E33] text-sm font-serif">{{ step.number }}</span>
            <h3 class="text-[#714A3E] text-sm font-serif font-medium leading-5">
              {{ step.title }}
            </h3>
            <p class="text-[#635D58] text-xs leading-relaxed">{{ step.description }}</p>
          </article>
        }
      </div>
    </section>

    <section class="hidden md:flex flex-col px-12 py-20">
      <header class="flex flex-col items-center gap-4 mb-16">
        <h2 class="text-[#7C5145] text-4xl font-serif text-center">Seu Caminho para o Sorriso</h2>
        <div class="bg-[#7C5145] w-24 h-1 rounded-full"></div>
      </header>

      <div class="flex flex-col gap-6">
        <div class="flex gap-6">
          <article
            class="flex flex-col bg-[#F3F3F3] p-10 rounded-3xl flex-2 min-h-75 justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default"
          >
            <div class="flex justify-between items-start">
              <span class="text-[#7C5145] text-5xl font-serif leading-none">01</span>
              <svg
                width="27"
                height="30"
                viewBox="0 0 27 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="w-6.5 h-7.5"
              >
                <path
                  d="M3 30C2.175 30 1.46875 29.7062 0.88125 29.1187C0.29375 28.5312 0 27.825 0 27V6C0 5.175 0.29375 4.46875 0.88125 3.88125C1.46875 3.29375 2.175 3 3 3H4.5V0H7.5V3H19.5V0H22.5V3H24C24.825 3 25.5312 3.29375 26.1187 3.88125C26.7062 4.46875 27 5.175 27 6V27C27 27.825 26.7062 28.5312 26.1187 29.1187C25.5312 29.7062 24.825 30 24 30H3ZM3 27H24V12H3V27ZM3 9H24V6H3V9ZM3 9V6V9ZM13.5 18C13.075 18 12.7188 17.8563 12.4312 17.5688C12.1437 17.2812 12 16.925 12 16.5C12 16.075 12.1437 15.7188 12.4312 15.4312C12.7188 15.1437 13.075 15 13.5 15C13.925 15 14.2812 15.1437 14.5688 15.4312C14.8563 15.7188 15 16.075 15 16.5C15 16.925 14.8563 17.2812 14.5688 17.5688C14.2812 17.8563 13.925 18 13.5 18ZM7.5 18C7.075 18 6.71875 17.8563 6.43125 17.5688C6.14375 17.2812 6 16.925 6 16.5C6 16.075 6.14375 15.7188 6.43125 15.4312C6.71875 15.1437 7.075 15 7.5 15C7.925 15 8.28125 15.1437 8.56875 15.4312C8.85625 15.7188 9 16.075 9 16.5C9 16.925 8.85625 17.2812 8.56875 17.5688C8.28125 17.8563 7.925 18 7.5 18ZM19.5 18C19.075 18 18.7188 17.8563 18.4312 17.5688C18.1437 17.2812 18 16.925 18 16.5C18 16.075 18.1437 15.7188 18.4312 15.4312C18.7188 15.1437 19.075 15 19.5 15C19.925 15 20.2812 15.1437 20.5688 15.4312C20.8563 15.7188 21 16.075 21 16.5C21 16.925 20.8563 17.2812 20.5688 17.5688C20.2812 17.8563 19.925 18 19.5 18ZM13.5 24C13.075 24 12.7188 23.8563 12.4312 23.5688C12.1437 23.2812 12 22.925 12 22.5C12 22.075 12.1437 21.7188 12.4312 21.4312C12.7188 21.1437 13.075 21 13.5 21C13.925 21 14.2812 21.1437 14.5688 21.4312C14.8563 21.7188 15 22.075 15 22.5C15 22.925 14.8563 23.2812 14.5688 23.5688C14.2812 23.8563 13.925 24 13.5 24ZM7.5 24C7.075 24 6.71875 23.8563 6.43125 23.5688C6.14375 23.2812 6 22.925 6 22.5C6 22.075 6.14375 21.7188 6.43125 21.4312C6.71875 21.1437 7.075 21 7.5 21C7.925 21 8.28125 21.1437 8.56875 21.4312C8.85625 21.7188 9 22.075 9 22.5C9 22.925 8.85625 23.2812 8.56875 23.5688C8.28125 23.8563 7.925 24 7.5 24ZM19.5 24C19.075 24 18.7188 23.8563 18.4312 23.5688C18.1437 23.2812 18 22.925 18 22.5C18 22.075 18.1437 21.7188 18.4312 21.4312C18.7188 21.1437 19.075 21 19.5 21C19.925 21 20.2812 21.1437 20.5688 21.4312C20.8563 21.7188 21 22.075 21 22.5C21 22.925 20.8563 23.2812 20.5688 23.5688C20.2812 23.8563 19.925 24 19.5 24Z"
                  fill="#7C5145"
                />
              </svg>
            </div>
            <div class="flex flex-col gap-3">
              <h3 class="text-[#7C5145] text-2xl font-serif">{{ steps()[0].title }}</h3>
              <p class="text-[#514440] text-base max-w-103">{{ steps()[0].description }}</p>
            </div>
          </article>

          <article
            class="flex flex-col bg-[#F5DECB] p-10 rounded-3xl flex-1 min-h-75 justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default"
          >
            <span class="text-[#25190D] text-5xl font-serif leading-none">02</span>
            <div class="flex flex-col gap-3">
              <h3 class="text-[#25190D] text-2xl font-serif">{{ steps()[1].title }}</h3>
              <p class="text-[#25190D] text-base">{{ steps()[1].description }}</p>
            </div>
          </article>
        </div>

        <div class="flex gap-6">
          <article
            class="flex flex-col bg-[#7C5145] p-10 rounded-3xl flex-1 min-h-75 justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default"
          >
            <span class="text-white text-5xl font-serif leading-none">03</span>
            <div class="flex flex-col gap-3">
              <h3 class="text-white text-2xl font-serif">{{ steps()[2].title }}</h3>
              <p class="text-white/80 text-sm">{{ steps()[2].description }}</p>
            </div>
          </article>

          <article
            class="flex flex-col bg-[#E8E8E8] p-10 rounded-3xl flex-2 min-h-75 justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default"
          >
            <div class="flex justify-between items-start">
              <span class="text-[#7C5145] text-5xl font-serif leading-none">04</span>
              <svg
                width="22"
                height="21"
                viewBox="0 0 22 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="w-5.5 h-5.25"
              >
                <path
                  d="M7.6 21L5.7 17.8L2.1 17L2.45 13.3L0 10.5L2.45 7.7L2.1 4L5.7 3.2L7.6 0L11 1.45L14.4 0L16.3 3.2L19.9 4L19.55 7.7L22 10.5L19.55 13.3L19.9 17L16.3 17.8L14.4 21L11 19.55L7.6 21ZM8.45 18.45L11 17.35L13.6 18.45L15 16.05L17.75 15.4L17.5 12.6L19.35 10.5L17.5 8.35L17.75 5.55L15 4.95L13.55 2.55L11 3.65L8.4 2.55L7 4.95L4.25 5.55L4.5 8.35L2.65 10.5L4.5 12.6L4.25 15.45L7 16.05L8.45 18.45ZM9.95 14.05L15.6 8.4L14.2 6.95L9.95 11.2L7.8 9.1L6.4 10.5L9.95 14.05Z"
                  fill="#7C5145"
                />
              </svg>
            </div>
            <div class="flex flex-col gap-3">
              <h3 class="text-[#7C5145] text-2xl font-serif">{{ steps()[3].title }}</h3>
              <p class="text-[#514440] text-base">{{ steps()[3].description }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceJourneyComponent {
  readonly steps = input.required<JourneyStep[]>();
}
