import { DecimalPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InventoryItem, InventoryStatus } from '../../models/inventory.model';

@Component({
  selector: 'app-inventory-catalog',
  imports: [DecimalPipe, NgClass, RouterLink],
  template: `
    <section class="mt-10">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 class="font-serif text-3xl font-bold text-[#7D5147] sm:text-4xl">
            Catálogo de Insumos
          </h2>
          <p class="mt-1 text-sm text-[#8A817C]">
            Gerenciamento completo de materiais e fornecedores.
          </p>
        </div>

        <div class="flex gap-3">
          <button class="h-10 rounded-full bg-[#ECEBEA] px-5 text-sm font-bold text-[#6F6661] transition hover:bg-[#E1DDDA]">
            Filtros
          </button>
          <a
            routerLink="/inventories/new"
            class="inline-flex h-10 items-center justify-center rounded-full bg-[#8B574B] px-5 text-sm font-bold text-white shadow-md shadow-[#8B574B]/20 transition hover:bg-[#744A40]"
          >
            + Adicionar Item
          </a>
        </div>
      </div>

      <div class="mt-6 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-[#EEE8E5]">
        <div class="hidden grid-cols-[1.6fr_0.65fr_0.65fr_0.65fr_0.55fr_0.45fr] bg-[#F0F0EF] px-8 py-5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#8A817C] md:grid">
          <span>Item & Categoria</span>
          <span>Quantidade</span>
          <span>Mínimo</span>
          <span>Unidade</span>
          <span class="text-right">Status</span>
          <span class="text-right">Ações</span>
        </div>

        @for (item of items(); track item.id) {
          <article class="grid gap-4 border-t border-[#F2EFED] px-5 py-5 first:border-t-0 md:grid-cols-[1.6fr_0.65fr_0.65fr_0.65fr_0.55fr_0.45fr] md:items-center md:px-8">
            <div class="flex min-w-0 items-center gap-4">
              <div class="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#F0F0F0] text-2xl">
                {{ item.itemType === 'MATERIAL' ? '+' : '▣' }}
              </div>
              <div class="min-w-0">
                <h3 class="truncate text-base font-extrabold text-[#2D2926]">{{ item.name }}</h3>
                <p class="mt-1 truncate text-xs text-[#A09A96]">
                  {{ typeLabels[item.itemType] }}{{ item.sku ? ' • SKU ' + item.sku : '' }}
                </p>
              </div>
            </div>

            <div class="flex items-center justify-between md:block">
              <span class="text-xs font-bold uppercase tracking-widest text-[#A09A96] md:hidden">Quantidade</span>
              <strong
                class="text-xl"
                [ngClass]="statusFor(item) === 'critico' ? 'text-[#C91920]' : 'text-[#2D2926]'"
              >
                {{ item.currentQuantity | number: '1.0-2' }}
              </strong>
            </div>

            <div class="flex items-center justify-between text-sm text-[#8A817C] md:block">
              <span class="text-xs font-bold uppercase tracking-widest text-[#A09A96] md:hidden">Mínimo</span>
              {{ item.minimumQuantity === null ? 'Não definido' : (item.minimumQuantity | number: '1.0-2') }}
            </div>

            <div class="flex items-center justify-between text-sm text-[#6F6661] md:block">
              <span class="text-xs font-bold uppercase tracking-widest text-[#A09A96] md:hidden">Unidade</span>
              {{ item.unit }}
            </div>

            <div class="flex justify-end">
              <span
                class="rounded-full px-3 py-1 text-[11px] font-extrabold uppercase"
                [ngClass]="statusClasses[statusFor(item)]"
              >
                {{ statusLabels[statusFor(item)] }}
              </span>
            </div>

            <div class="flex justify-end">
              <a
                [routerLink]="['/inventories', item.id, 'edit']"
                class="inline-flex h-9 items-center justify-center rounded-lg bg-[#F1ECE9] px-4 text-xs font-extrabold text-[#8B574B] transition hover:bg-[#E5D8D2]"
              >
                Editar
              </a>
            </div>
          </article>
        } @empty {
          <div class="px-8 py-12 text-center text-sm font-semibold text-[#8A817C]">
            Nenhum item cadastrado para a clínica selecionada.
          </div>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryCatalogComponent {
  readonly items = input.required<InventoryItem[]>();

  protected readonly statusLabels: Record<InventoryStatus, string> = {
    critico: 'Crítico',
    estavel: 'Estável',
  };

  protected readonly statusClasses: Record<InventoryStatus, string> = {
    critico: 'bg-[#FFD8D5] text-[#C91920]',
    estavel: 'bg-[#DFF9E8] text-[#299A5A]',
  };

  protected readonly typeLabels = {
    MATERIAL: 'Material',
    EQUIPMENT: 'Equipamento',
  };

  protected statusFor(item: InventoryItem): InventoryStatus {
    if (item.minimumQuantity !== null && item.currentQuantity <= item.minimumQuantity) {
      return 'critico';
    }

    return 'estavel';
  }
}
