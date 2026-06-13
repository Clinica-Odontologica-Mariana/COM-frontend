import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideClock3, LucideMapPin, LucidePencil, LucideTrash2 } from '@lucide/angular';
import { ClinicCardViewModel } from '../../models/clinic.models';

@Component({
  selector: 'app-clinic-card',
  imports: [NgOptimizedImage, LucidePencil, LucideTrash2, LucideMapPin, LucideClock3],
  template: `
    <article
      class="group overflow-hidden rounded-4xl bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0px_20px_30px_-12px_rgba(0,0,0,0.12)]"
    >
      <div class="relative h-64 overflow-hidden">
        @if (clinic().imageUrl) {
          <img
            [ngSrc]="clinic().imageUrl"
            [alt]="clinic().name"
            width="720"
            height="320"
            class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        } @else {
          <div
            class="flex h-full w-full items-center justify-center bg-[#F5F1EE] px-6 text-center text-[#8B7E77]"
          >
            <div class="space-y-2">
              <p class="text-base font-semibold">Sem imagem configurada</p>
              <p class="text-sm">Adicione uma foto da clínica para exibir neste card.</p>
            </div>
          </div>
        }

        @if (clinic().active) {
          <span
            class="absolute right-5 top-5 inline-flex h-8 items-center rounded-full border border-emerald-200 bg-emerald-100 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800"
          >
            Ativa
          </span>
        } @else {
          <span
            class="absolute right-5 top-5 inline-flex h-8 items-center rounded-full border border-red-200 bg-red-100 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-red-700"
          >
            Inativa
          </span>
        }
      </div>

      <div class="space-y-5 p-8">
        <div class="flex items-start justify-between gap-4">
          <h3
            class="text-3xl font-bold leading-tight text-[#8B5E4E]"
            style="font-family: 'Noto Serif', serif"
          >
            {{ clinic().name }}
          </h3>

          <div class="flex flex-col items-end gap-3">
            <div class="flex items-center gap-3">
            <button
              type="button"
              (click)="edit.emit(clinic())"
              class="flex h-7 w-7 items-center justify-center rounded-full bg-[#F9F9F9] transition hover:bg-[#F1ECE9]"
              aria-label="Editar clínica"
            >
              <svg
                lucidePencil
                aria-hidden="true"
                class="h-3.5 w-3.5 text-[#B28C7D]"
                [strokeWidth]="2.1"
              ></svg>
            </button>

            <button
              type="button"
              (click)="delete.emit(clinic())"
              class="flex h-7 w-7 items-center justify-center rounded-full bg-[#F9F9F9] transition hover:bg-[#F6EFEC]"
              aria-label="Excluir clínica"
            >
              <svg
                lucideTrash2
                aria-hidden="true"
                class="h-3.5 w-3.5 text-[#E16F63]"
                [strokeWidth]="2.1"
              ></svg>
            </button>
            </div>
          </div>
        </div>

        <div class="space-y-4 text-sm text-[#57534E]">
          <div class="flex items-start gap-3">
            <svg
              lucideMapPin
              aria-hidden="true"
              class="mt-0.5 h-4 w-4 shrink-0 text-[#B28C7D]"
              [strokeWidth]="2.1"
            ></svg>
            <p class="leading-6">{{ clinic().addressLabel }}</p>
          </div>

          <div class="flex items-start gap-3">
            <svg
              lucideClock3
              aria-hidden="true"
              class="mt-0.5 h-4 w-4 shrink-0 text-[#B28C7D]"
              [strokeWidth]="2.1"
            ></svg>
            <div>
              <p class="font-bold text-[#2D241E]">{{ clinic().serviceWindowLabel }}</p>
              <p class="mt-1 text-xs leading-5 text-[#948883]">{{ clinic().serviceDaysLabel }}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClinicCardComponent {
  readonly clinic = input.required<ClinicCardViewModel>();
  readonly edit = output<ClinicCardViewModel>();
  readonly delete = output<ClinicCardViewModel>();
}
