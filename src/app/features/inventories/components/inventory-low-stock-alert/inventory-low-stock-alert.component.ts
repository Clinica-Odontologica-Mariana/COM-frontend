import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InventoryItem } from '../../models/inventory.model';

@Component({
  selector: 'app-inventory-low-stock-alert',
  template: `
    <article class="rounded-xl bg-[#FFD8D5] px-6 py-7 shadow-sm sm:px-8 lg:flex lg:items-center lg:justify-between lg:gap-8">
      <div>
        <h2 class="font-serif text-2xl font-bold text-[#B1111D] sm:text-3xl">
          Atenção: Estoque Baixo
        </h2>
        <p class="mt-3 max-w-xl text-sm font-medium leading-6 text-[#C23A42]">
          {{ items().length }} {{ items().length === 1 ? 'item atingiu' : 'itens atingiram' }}
          a quantidade mínima de segurança. É necessário planejar a reposição.
        </p>

        <div class="mt-4 flex flex-wrap gap-2">
          @for (item of items(); track item.id) {
            <span class="rounded-full bg-white/45 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-[#B1111D]">
              {{ item.name }} ({{ item.currentQuantity }})
            </span>
          }
        </div>
      </div>

      <a
        routerLink="/inventories/new"
        class="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#C91920] px-6 text-sm font-bold text-white shadow-lg shadow-[#B1111D]/25 transition hover:bg-[#A9141A] lg:mt-0"
      >
        <span aria-hidden="true">+</span>
        Cadastrar reposição
      </a>
    </article>
  `,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryLowStockAlertComponent {
  readonly items = input.required<InventoryItem[]>();
}
