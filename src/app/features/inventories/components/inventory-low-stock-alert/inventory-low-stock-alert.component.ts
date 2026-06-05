import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-inventory-low-stock-alert',
  template: `
    <article class="rounded-xl bg-[#FFD8D5] px-6 py-7 shadow-sm sm:px-8 lg:flex lg:items-center lg:justify-between lg:gap-8">
      <div>
        <h2 class="font-serif text-2xl font-bold text-[#B1111D] sm:text-3xl">
          Atenção: Estoque Baixo
        </h2>
        <p class="mt-3 max-w-xl text-sm font-medium leading-6 text-[#C23A42]">
          4 itens atingiram a quantidade mínima de segurança. É necessário realizar o pedido de
          reposição para evitar interrupções nos atendimentos.
        </p>

        <div class="mt-4 flex flex-wrap gap-2">
          @for (tag of tags(); track tag) {
            <span class="rounded-full bg-white/45 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-[#B1111D]">
              {{ tag }}
            </span>
          }
        </div>
      </div>

      <button class="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#C91920] px-6 text-sm font-bold text-white shadow-lg shadow-[#B1111D]/25 transition hover:bg-[#A9141A] lg:mt-0">
        <span aria-hidden="true">+</span>
        Fazer Pedido Agora
      </button>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryLowStockAlertComponent {
  readonly tags = input.required<string[]>();
}
