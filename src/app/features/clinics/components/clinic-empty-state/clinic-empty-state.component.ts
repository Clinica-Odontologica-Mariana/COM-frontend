import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-clinic-empty-state',
  template: `
    <article
      class="rounded-4xl border border-dashed border-[#D9C7BE] bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(250,244,241,0.96))] px-8 py-12 text-center shadow-[0px_1px_2px_rgba(0,0,0,0.04)]"
    >
      <div
        class="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#F4E9E3] text-2xl text-[#A77769]"
      >
        +
      </div>

      <h3
        class="mt-6 text-2xl font-bold text-[#7C5145]"
        style="font-family: 'Noto Serif', serif"
      >
        Nenhuma clínica ativa no momento
      </h3>

      <p class="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#78716C]">
        Cadastre a primeira unidade para começar a organizar endereços, horários operacionais e
        futuros vínculos com agenda, prontuários e equipes.
      </p>

      <button
        type="button"
        (click)="create.emit()"
        class="mt-8 inline-flex h-12 items-center justify-center rounded-2xl bg-[#7C5145] px-6 text-sm font-bold text-white shadow-[0px_12px_24px_-12px_rgba(124,81,69,0.45)] transition hover:bg-[#69453B]"
      >
        Cadastrar primeira clínica
      </button>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClinicEmptyStateComponent {
  readonly create = output<void>();
}
