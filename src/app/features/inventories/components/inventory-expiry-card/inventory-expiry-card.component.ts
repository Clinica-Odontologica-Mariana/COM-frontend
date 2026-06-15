import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-inventory-expiry-card',
  template: `
    <aside class="rounded-xl border-l-4 border-[#8B574B] bg-white px-7 py-7 shadow-sm">
      <div class="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#8A817C]">
        <span class="text-xl" aria-hidden="true">▣</span>
        Próximos ao vencimento
      </div>
      <h2 class="mt-6 font-serif text-2xl font-bold text-[#2D2926]">Validade Crítica</h2>
      <p class="mt-3 text-sm leading-6 text-[#8A817C]">
        Luvas de Látex (M) vencem em 12 dias. Priorize o uso deste lote.
      </p>
      <button class="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#7D6B61] transition hover:text-[#8B574B]">
        Ver detalhes
        <span class="text-2xl leading-none" aria-hidden="true">→</span>
      </button>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryExpiryCardComponent {}
