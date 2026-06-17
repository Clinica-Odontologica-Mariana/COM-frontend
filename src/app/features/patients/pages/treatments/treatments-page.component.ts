import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-treatments-page',
  imports: [RouterLink],
  template: `
    <div
      class="flex min-h-screen items-center justify-center"
      style="font-family: 'Manrope', sans-serif"
    >
      <div class="text-center">
        <p class="text-lg font-semibold text-[#7C5145]">Gestão de treatments</p>
        <p class="mt-1 text-sm text-[#A8A29E]">Em breve</p>
        <a routerLink="/" class="mt-6 inline-block text-sm text-[#7C5145] underline">Voltar</a>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreatmentsPageComponent {}
