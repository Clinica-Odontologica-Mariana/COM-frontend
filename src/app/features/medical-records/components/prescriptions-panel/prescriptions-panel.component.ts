import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-prescriptions-panel',
  imports: [RouterLink],
  template: `
    <section
      class="rounded-xl border max-w-screen border-[#F0BAAF] p-4 sm:p-8"
      style="background: rgba(255, 218, 211, 0.3)"
    >
      <!-- Heading -->
      <div class="mb-6 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-[#7E544C]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3
          class="text-base lg:text-xl font-bold text-[#7E544C]"
          style="font-family: 'Noto Serif', serif"
        >
          Gerar Documentos
        </h3>
      </div>

      <!-- CTAs -->
      <div class="flex flex-col gap-3">
        <a
          [routerLink]="['/medical-records', patientId(), 'receita']"
          class="flex items-center gap-3 rounded-lg border border-[#7E544C] px-4 py-3 text-xs font-bold uppercase tracking-[1.2px] text-[#7E544C] transition hover:bg-[#7E544C]/5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Gerar Receita
        </a>

        <a
          [routerLink]="['/medical-records', patientId(), 'atestado']"
          class="flex items-center gap-3 rounded-lg border border-[#7E544C] px-4 py-3 text-xs font-bold uppercase tracking-[1.2px] text-[#7E544C] transition hover:bg-[#7E544C]/5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 4h6m-6 4h3" />
          </svg>
          Gerar Atestado
        </a>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionsPanelComponent {
  readonly patientId = input.required<string>();
}
