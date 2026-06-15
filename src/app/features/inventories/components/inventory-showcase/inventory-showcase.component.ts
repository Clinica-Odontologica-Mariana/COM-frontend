import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-inventory-showcase',
  template: `
    <article class="relative min-h-80 overflow-hidden rounded-2xl bg-[#DFE4E4] p-8">
      <div class="absolute inset-x-8 top-8 grid gap-4">
        <div class="h-16 rounded-sm bg-white shadow-sm"></div>
        <div class="h-16 rounded-sm bg-white shadow-sm"></div>
        <div class="h-24 rounded-sm bg-white shadow-sm"></div>
      </div>
      <div class="absolute bottom-12 left-10 h-24 w-36 rounded-md bg-[#2D2926] shadow-xl"></div>
      <div class="absolute bottom-12 right-12 h-24 w-28 rounded-lg bg-[#EDEBE8] shadow-lg"></div>
      <div class="absolute right-14 top-16 flex gap-2">
        @for (box of storageBoxes; track box) {
          <span class="h-12 w-7 rounded-sm bg-[#F7F7F7] shadow-sm"></span>
        }
      </div>
      <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/45 to-transparent px-6 py-7 text-white">
        <p class="text-xs font-extrabold uppercase tracking-[0.22em]">Qualidade Garantida</p>
        <h2 class="mt-2 font-serif text-2xl font-bold">Controle de Insumos Premium</h2>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryShowcaseComponent {
  protected readonly storageBoxes = Array.from({ length: 8 }, (_, index) => index);
}
