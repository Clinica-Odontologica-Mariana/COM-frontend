import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InventoryCatalogComponent } from '../../components/inventory-catalog/inventory-catalog.component';
import { InventoryExpiryCardComponent } from '../../components/inventory-expiry-card/inventory-expiry-card.component';
import { InventoryLowStockAlertComponent } from '../../components/inventory-low-stock-alert/inventory-low-stock-alert.component';
import { InventoryShowcaseComponent } from '../../components/inventory-showcase/inventory-showcase.component';
import { InventorySuppliersComponent } from '../../components/inventory-suppliers/inventory-suppliers.component';
import { INVENTORY_ITEMS, LOW_STOCK_TAGS, SUPPLIERS } from '../../data/inventory.mock';

@Component({
  selector: 'app-inventory-page',
  imports: [
    InventoryCatalogComponent,
    InventoryExpiryCardComponent,
    InventoryLowStockAlertComponent,
    InventoryShowcaseComponent,
    InventorySuppliersComponent,
  ],
  template: `
    <section class="min-h-screen bg-[#F9F9F9] px-5 py-6 sm:px-8 lg:px-12">
      <div class="mx-auto max-w-7xl">
        <header class="flex flex-col gap-4 border-b border-[#EEE8E5] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <h1 class="font-serif text-3xl font-bold text-[#7D5147] sm:text-4xl">
            Gestão de Estoque
          </h1>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label class="flex h-12 min-w-0 items-center gap-3 rounded-full bg-white px-5 text-sm text-[#8A817C] shadow-sm sm:w-72">
              <span class="text-lg text-[#57514D]" aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Buscar insumos..."
                class="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-[#A9A19C]"
              />
            </label>

            <button class="h-11 rounded-full px-4 text-sm font-semibold text-[#8B574B] transition hover:bg-[#EFE8E5]">
              Exportar Relatório
            </button>
          </div>
        </header>

        <div class="mt-8 grid gap-6 xl:grid-cols-[minmax(0,2.1fr)_minmax(280px,1fr)]">
          <app-inventory-low-stock-alert [tags]="lowStockTags" />
          <app-inventory-expiry-card />
        </div>

        <app-inventory-catalog [items]="inventoryItems" />

        <section class="mt-16 grid gap-8 xl:grid-cols-2">
          <app-inventory-suppliers [suppliers]="suppliers" />
          <app-inventory-showcase />
        </section>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryPageComponent {
  protected readonly lowStockTags = LOW_STOCK_TAGS;
  protected readonly inventoryItems = INVENTORY_ITEMS;
  protected readonly suppliers = SUPPLIERS;
}
