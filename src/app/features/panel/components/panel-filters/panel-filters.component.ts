import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistoryFilters } from '../../models/history.model';
import { ClinicSummaryDto } from '../../api/financial-transactions.api';

@Component({
  selector: 'app-history-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-xl border border-stone-200 shadow-sm p-4 sm:p-5">
      <header class="flex items-center justify-between mb-4">
        <h3 class="font-serif text-sm sm:text-base font-bold text-stone-800 m-0">Filtros</h3>
        <button
          type="button"
          (click)="reset()"
          class="text-[10px] sm:text-[11px] font-bold text-red-600 hover:text-red-700 uppercase tracking-wider"
        >
          Limpar
        </button>
      </header>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <!-- Busca -->
        <label class="flex flex-col gap-1">
          <span class="text-[10px] font-bold uppercase tracking-wider text-stone-500">Buscar</span>
          <input
            type="text"
            [(ngModel)]="model.search"
            (ngModelChange)="emit()"
            placeholder="Descrição, status, valor..."
            class="px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40"
          />
        </label>

        <!-- Categoria -->
        <label class="flex flex-col gap-1">
          <span class="text-[10px] font-bold uppercase tracking-wider text-stone-500">Categoria</span>
          <select
            [(ngModel)]="model.category"
            (ngModelChange)="emit()"
            class="px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="TODAS">Todas</option>
            <option value="RECEITA">Receita</option>
            <option value="DESPESA">Despesa</option>
          </select>
        </label>

        <!-- Status -->
        <label class="flex flex-col gap-1">
          <span class="text-[10px] font-bold uppercase tracking-wider text-stone-500">Status</span>
          <select
            [(ngModel)]="model.status"
            (ngModelChange)="emit()"
            class="px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option [ngValue]="undefined">Todos</option>
            <option value="Concluído">Concluído</option>
            <option value="Pago">Pago</option>
            <option value="Pendente">Pendente</option>
          </select>
        </label>

        <!-- Clínica -->
        <label class="flex flex-col gap-1" *ngIf="clinics.length > 1">
          <span class="text-[10px] font-bold uppercase tracking-wider text-stone-500">Clínica</span>
          <select
            [(ngModel)]="model.clinicId"
            (ngModelChange)="emit()"
            class="px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option [ngValue]="undefined">Todas</option>
            <option *ngFor="let c of clinics" [value]="c.id">{{ c.name }}</option>
          </select>
        </label>

        <!-- Período -->
        <div class="flex gap-2 col-span-full lg:col-span-2">
          <label class="flex flex-col gap-1 flex-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-stone-500">De</span>
            <input type="date" [(ngModel)]="model.startDate" (ngModelChange)="emit()"
              class="px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </label>
          <label class="flex flex-col gap-1 flex-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-stone-500">Até</span>
            <input type="date" [(ngModel)]="model.endDate" (ngModelChange)="emit()"
              class="px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </label>
        </div>

        <!-- Valor min/max -->
        <div class="flex gap-2 col-span-full lg:col-span-2">
          <label class="flex flex-col gap-1 flex-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-stone-500">Valor mín.</span>
            <input type="number" [(ngModel)]="model.minValue" (ngModelChange)="emit()" placeholder="0"
              class="px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </label>
          <label class="flex flex-col gap-1 flex-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-stone-500">Valor máx.</span>
            <input type="number" [(ngModel)]="model.maxValue" (ngModelChange)="emit()" placeholder="0"
              class="px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </label>
        </div>
      </div>
    </div>
  `,
})
export class HistoryFiltersComponent {
  @Input() set filters(value: HistoryFilters) {
    this.model = { category: 'TODAS', ...value };
  }
  @Input() clinics: ClinicSummaryDto[] = [];
  @Output() filtersChange = new EventEmitter<HistoryFilters>();

  protected model: HistoryFilters = { category: 'TODAS' };

  protected emit(): void {
    this.filtersChange.emit({ ...this.model });
  }

  protected reset(): void {
    this.model = { category: 'TODAS' };
    this.emit();
  }
}