import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ProcedureView } from '../../models/patient-record.models';

@Component({
  selector: 'app-procedures-history',
  imports: [CurrencyPipe, RouterLink],
  template: `
    <section class="rounded-xl bg-[#F3F3F3] p-8">
      <div class="flex items-center justify-between gap-2">
        <h3
          class="text-xl font-bold text-[#7C5145] leading-tight"
          style="font-family: 'Noto Serif', serif"
        >
          Histórico de Procedimentos
        </h3>

        <a
          [routerLink]="['/patients', patientId(), 'treatments']"
          class="flex shrink-0 items-center gap-1 rounded-lg bg-[#7C5145] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#6B4439]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Gerenciar
        </a>
      </div>

      @if (procedures().length) {
        <div class="mt-6 space-y-4">
          @for (proc of procedures(); track proc.id) {
            <div
              class="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-3 shadow-sm"
            >
              <div class="flex items-center gap-3 min-w-0">
                <!-- Tooth icon -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 shrink-0 text-[#A8A29E]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M12 2C9.5 2 7 4 7 7c0 2 .5 3.5 1 5 .5 1.5 1 4 1 6 0 1 .5 2 1.5 2s1.5-1 2-2c.5-1 1-1 1.5 0 .5 1 1 2 2 2s1.5-1 1.5-2c0-2 .5-4.5 1-6 .5-1.5 1-3 1-5 0-3-2.5-5-5-5z"
                  />
                </svg>

                <div class="min-w-0">
                  <p class="truncate text-sm font-bold text-[#44403C]">{{ proc.description }}</p>
                  <p class="text-[10px] text-[#A8A29E]">
                    @if (proc.toothNumber) {
                      Dente {{ proc.toothNumber }} ·
                    }
                    {{ proc.estimatedPrice | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
                  </p>
                </div>
              </div>

              <!-- Status icon: DONE=filled brown, IN_PROGRESS=light brown with dash, PENDING=gray empty -->
              <div
                class="grid h-5 w-5 shrink-0 place-items-center rounded-full border-2"
                [class.border-[#7C5145]]="proc.status === 'DONE'"
                [class.bg-[#7C5145]]="proc.status === 'DONE'"
                [class.border-[#A77769]]="proc.status === 'IN_PROGRESS'"
                [class.bg-[#EFE7E3]]="proc.status === 'IN_PROGRESS'"
                [class.border-[#D6D3D1]]="proc.status !== 'DONE' && proc.status !== 'IN_PROGRESS'"
              >
                @if (proc.status === 'DONE') {
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3 w-3 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                } @else if (proc.status === 'IN_PROGRESS') {
                  <span class="h-0.5 w-2 rounded bg-[#7C5145]"></span>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <p class="mt-6 text-sm text-[#A8A29E]">Nenhum procedimento no plano de Treatment.</p>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProceduresHistoryComponent {
  readonly procedures = input<ProcedureView[]>([]);
  readonly patientId = input('');
}
