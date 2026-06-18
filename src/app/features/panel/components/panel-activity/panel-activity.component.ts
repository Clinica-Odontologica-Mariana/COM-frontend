import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecentActivity } from '../../models/panel.model';
import { getStatusColor } from '../../utils/status.utils';

@Component({
  selector: 'app-panel-activity',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      <header class="flex flex-col gap-3 p-4 sm:p-5 pb-4 border-b border-stone-200">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 class="font-serif text-base sm:text-lg font-bold text-stone-800 m-0">{{ title }}</h2>

          <div class="flex items-center gap-2 flex-wrap">
            <label
              class="flex items-center gap-2 px-3 py-1.5 border border-stone-200 rounded-lg bg-stone-50 focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500/40 transition flex-1 sm:flex-none"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 11 11"
                fill="none"
                class="text-stone-400 shrink-0"
              >
                <path
                  d="M9.683 10.5 6.008 6.825c-.291.234-.625.418-1.005.554C4.623 7.515 4.22 7.583 3.792 7.583 2.732 7.583 1.835 7.216 1.101 6.482.367 5.748 0 4.851 0 3.792 0 2.732.367 1.835 1.101 1.101 1.835.367 2.732 0 3.792 0c1.059 0 1.956.367 2.69 1.101C7.216 1.835 7.583 2.732 7.583 3.792c0 .427-.068.83-.204 1.21-.136.379-.32.713-.554 1.005L10.5 9.683 9.683 10.5ZM3.792 6.417c.729 0 1.349-.256 1.859-.766.51-.51.766-1.13.766-1.859 0-.729-.256-1.35-.766-1.859C5.141 1.423 4.521 1.167 3.792 1.167c-.729 0-1.35.256-1.859.766-.51.51-.766 1.13-.766 1.859 0 .729.256 1.349.766 1.859.51.51 1.13.766 1.859.766Z"
                  fill="currentColor"
                />
              </svg>
              <input
                type="text"
                [(ngModel)]="searchTerm"
                placeholder="Buscar..."
                class="bg-transparent outline-none text-xs text-stone-700 placeholder-stone-400 w-20 sm:w-40"
              />
            </label>
            <button
              *ngIf="searchTerm"
              type="button"
              (click)="searchTerm = ''"
              class="text-[10px] font-bold text-red-600 hover:text-red-700 uppercase tracking-wider"
            >
              Limpar
            </button>
          </div>
        </div>
      </header>

      <div class="hidden md:block overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-stone-50">
            <tr>
              <th
                *ngFor="let h of headers"
                class="px-5 py-3.5 text-[10px] font-bold tracking-wider uppercase text-stone-500"
                [class.text-right]="h === 'Valor'"
                [class.w-12]="h === ''"
              >
                {{ h }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let a of filteredActivities; trackBy: trackById"
              class="group hover:bg-stone-50 transition-colors"
            >
              <td
                class="px-5 py-4 text-[13px] border-t border-stone-100 text-stone-500 whitespace-nowrap"
              >
                {{ a.date }}
              </td>
              <td
                *ngIf="showClinic"
                class="px-5 py-4 text-[13px] border-t border-stone-100 text-stone-600 whitespace-nowrap"
              >
                {{ a.clinicName }}
              </td>
              <td
                class="px-5 py-4 text-[13px] border-t border-stone-100 font-medium text-stone-800"
              >
                {{ a.description }}
              </td>
              <td class="px-5 py-4 border-t border-stone-100">
                <span
                  class="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold"
                  [ngClass]="
                    a.type === 'RECEITA'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  "
                >
                  {{ a.type }}
                </span>
              </td>
              <td class="px-5 py-4 border-t border-stone-100">
                <div class="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                  <svg width="8" height="8" viewBox="0 0 8 8">
                    <rect width="8" height="8" rx="4" [attr.fill]="getStatusColor(a.status)" />
                  </svg>
                  {{ a.status }}
                </div>
              </td>
              <td
                class="px-5 py-4 text-[13px] border-t border-stone-100 font-bold text-right whitespace-nowrap"
                [ngClass]="a.value > 0 ? 'text-emerald-600' : 'text-red-600'"
              >
                {{ a.value | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
              </td>
              <td class="px-5 py-4 border-t border-stone-100 text-right">
                <button
                  type="button"
                  (click)="onEditClick(a)"
                  title="Editar transação"
                  class="text-stone-400 hover:text-stone-700 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                  </svg>
                </button>
              </td>
            </tr>
            <tr *ngIf="filteredActivities.length === 0">
              <td
                [attr.colspan]="headers.length"
                class="px-5 py-8 text-center text-sm text-stone-400 border-t border-stone-100"
              >
                Nenhuma transação encontrada.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="block md:hidden">
        <div
          *ngFor="let a of filteredActivities; trackBy: trackById"
          class="flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3.5 border-t border-stone-100 group cursor-pointer"
          (click)="onEditClick(a)"
        >
          <div
            class="w-9 sm:w-10 h-9 sm:h-10 rounded-full flex items-center justify-center shrink-0"
            [ngClass]="
              a.type === 'RECEITA' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
            "
          >
            <svg
              *ngIf="a.type === 'RECEITA'"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
            <svg
              *ngIf="a.type === 'DESPESA'"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs sm:text-[13px] font-bold m-0 text-stone-800 truncate">
              {{ a.description }}
            </p>
            <p class="text-[9px] sm:text-[10px] text-stone-500 m-0 mt-0.5">
              {{ a.date }} · {{ a.category }}<span *ngIf="showClinic"> · {{ a.clinicName }}</span>
            </p>
          </div>
          <div class="text-right shrink-0">
            <p
              class="text-xs sm:text-[13px] font-bold m-0"
              [ngClass]="a.value > 0 ? 'text-emerald-600' : 'text-red-600'"
            >
              {{ a.value | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
            </p>
            <p
              class="text-[8px] sm:text-[9px] font-bold uppercase m-0 mt-1"
              [style.color]="getStatusColor(a.status)"
            >
              {{ a.status }}
            </p>
          </div>
        </div>
      </div>
      <footer class="p-4 border-t border-stone-200 bg-stone-50/50 flex justify-center">
        <button
          type="button"
          (click)="onViewAll()"
          class="bg-transparent border-none text-[11px] font-bold tracking-wider text-[#A77769] hover:text-[#7C5145] uppercase cursor-pointer transition-colors"
        >
          {{ isMobile ? 'Ver Todas as Transações' : 'Ver Histórico Completo' }}
        </button>
      </footer>
    </div>
  `,
})
export class PanelActivityComponent {
  @Input() activities: RecentActivity[] = [];
  @Input() isMobile = false;
  @Input() title = 'Transações Recentes';
  @Input() showClinic = false;

  @Output() viewAll = new EventEmitter<void>();
  @Output() edit = new EventEmitter<RecentActivity>();

  protected get headers(): string[] {
    return this.showClinic
      ? ['Data', 'Clínica', 'Descrição', 'Categoria', 'Status', 'Valor', '']
      : ['Data', 'Descrição', 'Categoria', 'Status', 'Valor', ''];
  }

  protected searchTerm = '';
  protected getStatusColor(status: string): string {
    return getStatusColor(status);
  }

  protected get filteredActivities(): RecentActivity[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.activities;
    return this.activities.filter(
      (a) =>
        this.matches(a.date, term) ||
        this.matches(a.clinicName, term) ||
        this.matches(a.description, term) ||
        this.matches(a.category, term) ||
        this.matches(a.type, term) ||
        this.matches(a.status, term) ||
        this.matches(this.formatValue(a.value), term),
    );
  }

  protected onViewAll(): void {
    this.viewAll.emit();
  }

  protected onEditClick(activity: RecentActivity): void {
    this.edit.emit(activity);
  }

  protected trackById(index: number, item: RecentActivity): string | number {
    return item.id ?? index;
  }

  private matches(value: unknown, term: string): boolean {
    return String(value ?? '')
      .toLowerCase()
      .includes(term);
  }

  private formatValue(value: number): string {
    return `${value} ${value.toFixed(2)} ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  }
}
