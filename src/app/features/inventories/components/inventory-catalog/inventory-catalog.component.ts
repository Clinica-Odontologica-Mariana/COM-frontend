import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InventoryItem, InventoryStatus } from '../../models/inventory.model';

@Component({
  selector: 'app-inventory-catalog',
  imports: [NgClass, RouterLink],
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
        <div class="hidden grid-cols-[1.7fr_0.55fr_0.65fr_0.85fr_0.55fr] bg-[#F0F0EF] px-8 py-5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#8A817C] md:grid">
          <span>Item & Categoria</span>
          <span>Quantidade</span>
          <span>Mínimo</span>
          <span>Validade</span>
          <span class="text-right">Status</span>
        </div>

        @for (item of items(); track item.name) {
          <article class="grid gap-4 border-t border-[#F2EFED] px-5 py-5 first:border-t-0 md:grid-cols-[1.7fr_0.55fr_0.65fr_0.85fr_0.55fr] md:items-center md:px-8">
            <div class="flex min-w-0 items-center gap-4">
              <div class="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#F0F0F0] text-2xl">
                {{ item.icon }}
              </div>
              <div class="min-w-0">
                <h3 class="truncate text-base font-extrabold text-[#2D2926]">{{ item.name }}</h3>
                <p class="mt-1 truncate text-xs text-[#A09A96]">{{ item.details }}</p>
              </div>
            </div>

            <div class="flex items-center justify-between md:block">
              <span class="text-xs font-bold uppercase tracking-widest text-[#A09A96] md:hidden">Quantidade</span>
              <strong
                class="text-xl"
                [ngClass]="item.status === 'critico' ? 'text-[#C91920]' : 'text-[#2D2926]'"
              >
                {{ item.quantity }}
              </strong>
            </div>

            <div class="flex items-center justify-between text-sm text-[#8A817C] md:block">
              <span class="text-xs font-bold uppercase tracking-widest text-[#A09A96] md:hidden">Mínimo</span>
              {{ item.minimum }}
            </div>

            <div
              class="flex items-center justify-between text-sm md:block"
              [ngClass]="item.status === 'vencendo' ? 'font-extrabold text-[#C91920]' : 'text-[#6F6661]'"
            >
              <span class="text-xs font-bold uppercase tracking-widest text-[#A09A96] md:hidden">Validade</span>
              {{ item.validity }}
            </div>

            <div class="flex justify-end">
              <span
                class="rounded-full px-3 py-1 text-[11px] font-extrabold uppercase"
                [ngClass]="statusClasses[item.status]"
              >
                {{ statusLabels[item.status] }}
              </span>
            </div>
          </article>
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
    vencendo: 'Vencendo',
  };

  protected readonly statusClasses: Record<InventoryStatus, string> = {
    critico: 'bg-[#FFD8D5] text-[#C91920]',
    estavel: 'bg-[#DFF9E8] text-[#299A5A]',
    vencendo: 'bg-[#F7E2CB] text-[#8B6A4A]',
  };
}
