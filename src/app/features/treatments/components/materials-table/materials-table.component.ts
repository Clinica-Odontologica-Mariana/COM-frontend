import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Material } from '../../models/treatment.model';

@Component({
  selector: 'app-materials-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="overflow-hidden rounded-xl border border-[#F5F5F4]">
      <!-- Header -->
      <div
        class="grid items-center gap-4 px-4 py-3"
        [class]="readonly() ? 'grid-cols-[1fr_auto]' : 'grid-cols-[1fr_auto_auto]'"
        style="background: #F3F3F3;"
      >
        <span
          class="text-[10px] font-bold uppercase tracking-[1px] text-[#78716C]"
          style="font-family: Manrope, sans-serif;"
          >Item &amp; Categoria</span
        >
        <span
          class="w-28 text-center text-[10px] font-bold uppercase tracking-[1px] text-[#78716C]"
          style="font-family: Manrope, sans-serif;"
          >Quantidade</span
        >
        @if (!readonly()) {
          <span
            class="w-10 text-center text-[10px] font-bold uppercase tracking-[1px] text-[#78716C]"
            style="font-family: Manrope, sans-serif;"
            >Excluir</span
          >
        }
      </div>

      <!-- Rows -->
      @for (item of materials(); track $index; let last = $last) {
        <div
          class="grid items-center gap-4 px-4 py-3"
          [class]="readonly() ? 'grid-cols-[1fr_auto]' : 'grid-cols-[1fr_auto_auto]'"
          [class.border-b]="!last"
          style="border-color: #F5F5F4;"
        >
          <div class="flex items-center gap-3">
            <div
              class="grid h-12 w-12 shrink-0 place-items-center rounded-lg text-[#7C5145]"
              style="background: #EEEEEE;"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5"
                />
                <path d="M10 11.25h4" />
                <path
                  d="M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-[#1A1C1C]">{{ item.name }}</p>
              <p class="text-xs text-[#78716C]">{{ item.category }}</p>
            </div>
          </div>

          @if (readonly()) {
            <p
              class="w-28 text-center font-bold text-[18px] text-[#1A1C1C]"
              style="font-family: Manrope, sans-serif;"
            >
              {{ item.quantity }}
            </p>
          } @else {
            <div class="flex w-28 items-center justify-center gap-1">
              <button
                type="button"
                class="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[#69594A] transition hover:bg-[#E7E5E4] disabled:opacity-30"
                [disabled]="item.quantity <= 1"
                (click)="quantityChange.emit({ index: $index, delta: -1 })"
                title="Diminuir"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6h8"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
              <span
                class="w-6 text-center font-bold text-[16px] text-[#1A1C1C] tabular-nums"
                style="font-family: Manrope, sans-serif;"
                >{{ item.quantity }}</span
              >
              <button
                type="button"
                class="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[#69594A] transition hover:bg-[#E7E5E4]"
                (click)="quantityChange.emit({ index: $index, delta: 1 })"
                title="Aumentar"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M6 2v8M2 6h8"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </div>
          }

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
        <div class="px-4 py-6 text-center text-sm text-[#A8A29E]">Nenhum material adicionado.</div>
      }
    </div>
  `,
})
export class MaterialsTableComponent {
  materials = input.required<Material[]>();
  readonly = input<boolean>(false);
  removeItem = output<number>();
  quantityChange = output<{ index: number; delta: number }>();
}
