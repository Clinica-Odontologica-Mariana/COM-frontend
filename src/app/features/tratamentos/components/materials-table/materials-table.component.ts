import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Material } from '../../models/tratamento.model';

@Component({
  selector: 'app-materials-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="overflow-hidden rounded-xl border border-[#F5F5F4]">
      <!-- Header -->
      <div
        class="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-3"
        style="background: #F3F3F3;"
      >
        <span
          class="text-[10px] font-bold uppercase tracking-[1px] text-[#78716C]"
          style="font-family: Manrope, sans-serif;"
        >Item &amp; Categoria</span>
        <span
          class="w-24 text-center text-[10px] font-bold uppercase tracking-[1px] text-[#78716C]"
          style="font-family: Manrope, sans-serif;"
        >Quantidade</span>
        @if (!readonly()) {
          <span
            class="w-10 text-center text-[10px] font-bold uppercase tracking-[1px] text-[#78716C]"
            style="font-family: Manrope, sans-serif;"
          >Excluir</span>
        }
      </div>

      <!-- Rows -->
      @for (item of materials(); track $index; let last = $last) {
        <div
          class="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-3"
          [class.border-b]="!last"
          style="border-color: #F5F5F4;"
        >
          <div class="flex items-center gap-3">
            <div
              class="grid h-12 w-12 shrink-0 place-items-center rounded-lg text-lg"
              style="background: #EEEEEE; border-radius: 8px;"
            >
              💊
            </div>
            <div>
              <p class="text-sm font-semibold text-[#1A1C1C]">{{ item.name }}</p>
              <p class="text-xs text-[#78716C]">{{ item.category }}</p>
            </div>
          </div>

          <p
            class="w-24 text-center font-bold text-[18px] text-[#1A1C1C]"
            style="font-family: Manrope, sans-serif;"
          >{{ item.quantity }}</p>

          @if (!readonly()) {
            <button
              type="button"
              class="grid h-10 w-10 place-items-center rounded-lg transition hover:bg-red-50"
              (click)="removeItem.emit($index)"
              title="Remover item"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M2.25 4.5h13.5M6 4.5V3a.75.75 0 0 1 .75-.75h4.5A.75.75 0 0 1 12 3v1.5M7.5 8.25v5.25M10.5 8.25v5.25M3.75 4.5l.75 10.5a.75.75 0 0 0 .75.75h7.5a.75.75 0 0 0 .75-.75L14.25 4.5"
                  stroke="#B20000"
                  stroke-width="1.4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          }
        </div>
      }

      @if (materials().length === 0) {
        <div class="px-4 py-6 text-center text-sm text-[#A8A29E]">
          Nenhum material adicionado.
        </div>
      }
    </div>
  `,
})
export class MaterialsTableComponent {
  materials = input.required<Material[]>();
  readonly = input<boolean>(false);
  removeItem = output<number>();
}
