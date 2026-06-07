import { ChangeDetectionStrategy, Component } from '@angular/core';

// TODO: Integrar com GET /prescriptions/by-patient/{patientId} quando endpoint for adicionado ao backend.

@Component({
  selector: 'app-prescriptions-panel',
  template: `
    <section
      class="rounded-xl border border-[#F0BAAF] p-8"
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
        <h3 class="text-xl font-bold text-[#7E544C]" style="font-family: 'Noto Serif', serif">
          Prescrições Ativas
        </h3>
      </div>

      <!-- Empty state -->
      <div class="space-y-6 text-sm text-[#78716C]">
        <p class="text-center text-[#A8A29E]">Nenhuma prescrição ativa registrada.</p>
      </div>

      <!-- CTA -->
      <button
        type="button"
        class="mt-6 w-full rounded-lg border border-[#7E544C] py-3 text-xs font-bold uppercase tracking-[1.2px] text-[#7E544C] transition hover:bg-[#7E544C]/5"
      >
        Emitir Nova Receita
      </button>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionsPanelComponent {}
