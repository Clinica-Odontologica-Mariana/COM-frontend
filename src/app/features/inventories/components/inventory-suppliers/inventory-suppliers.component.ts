import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Supplier } from '../../models/inventory.model';

@Component({
  selector: 'app-inventory-suppliers',
  template: `
    <article class="rounded-2xl bg-[#F4E8E4] px-6 py-8 sm:px-10 sm:py-12">
      <h2 class="font-serif text-2xl font-bold text-[#8B574B] sm:text-3xl">
        Parceiros & Fornecedores
      </h2>
      <p class="mt-6 max-w-md text-base leading-7 text-[#6F6661]">
        Centralize seus pedidos e mantenha o contato direto com os principais distribuidores do
        mercado odontológico.
      </p>

      <div class="mt-8 space-y-4">
        @for (supplier of suppliers(); track supplier.name) {
          <div class="flex items-center gap-4 rounded-xl bg-white/75 px-5 py-4">
            <div class="grid h-11 w-11 place-items-center rounded-full bg-[#EFE4E0] text-sm font-extrabold text-[#8B574B]">
              {{ supplier.initials }}
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="truncate text-sm font-extrabold text-[#2D2926]">{{ supplier.name }}</h3>
              <p class="mt-1 text-xs text-[#8A817C]">{{ supplier.lastOrder }}</p>
            </div>
            <span class="text-2xl text-[#8B574B]" aria-hidden="true">
              {{ supplier.action === 'phone' ? '⌕' : '✉' }}
            </span>
          </div>
        }
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventorySuppliersComponent {
  readonly suppliers = input.required<Supplier[]>();
}
