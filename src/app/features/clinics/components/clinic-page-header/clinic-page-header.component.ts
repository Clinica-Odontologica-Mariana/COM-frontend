import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-clinic-page-header',
  template: `
    <section class="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
      <div class="max-w-full space-y-4">
        <div class="space-y-3">
          <h1
            class="text-4xl font-bold leading-tight text-[#7C5145] md:text-4xl"
            style="font-family: 'Noto Serif', serif"
          >
            Gerenciamento de Clínicas
          </h1>

          <p class="max-w-full text-base leading-7 text-[#78716C] md:text-lg">
            Gerencie suas clínicas de forma eficiente e organizada.
          </p>
        </div>
      </div>

      <button
        type="button"
        (click)="create.emit()"
        class="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-[#7C5145] px-7 text-sm font-bold text-white shadow-[0px_20px_25px_-5px_rgba(124,81,69,0.25),0px_8px_10px_-6px_rgba(124,81,69,0.2)] transition hover:-translate-y-0.5 hover:bg-[#69453B]"
      >
        <span class="text-lg leading-none">+</span>
        Nova Clínica
      </button>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClinicPageHeaderComponent {
  readonly create = output<void>();
}
