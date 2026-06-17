import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, Location } from '@angular/common';
import { HistoryService } from '../../services/history.service';
import { ClinicContextService } from '../../services/clinic-context.service';
import { ClinicSummaryDto } from '../../api/financial-transactions.api';
import { HistoryFilters, HistoryResult } from '../../models/history.model';
import { HistoryFiltersComponent } from '../../components/panel-filters/panel-filters.component';
import { HistoryPaginationComponent } from '../../components/panel-pagination/panel-pagination.component';
import { getStatusColor } from '../../utils/status.utils';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    HistoryFiltersComponent,
    HistoryPaginationComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="min-h-screen bg-stone-50 p-4 md:p-8">
      <div class="max-w-6xl mx-auto flex flex-col gap-5">

        <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <button type="button" (click)="goBack()"
              class="flex items-center gap-1.5 text-[11px] font-bold text-stone-500 hover:text-stone-700 uppercase tracking-wider mb-1">
              ‹ Voltar ao Painel
            </button>
            <h1 class="font-serif text-2xl md:text-3xl font-bold text-stone-800 m-0">Histórico Completo</h1>
            <p class="text-sm text-stone-500 m-0 mt-1">Visualize, filtre e exporte todas as suas transações.</p>
          </div>
        </header>

        <section *ngIf="result" class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="bg-white border border-stone-200 rounded-xl p-4">
            <p class="text-[10px] font-bold uppercase tracking-wider text-stone-500 m-0">Receitas</p>
            <p class="text-xl font-bold text-emerald-600 m-0 mt-1">
              {{ result.summary.receitas | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
            </p>
          </div>
          <div class="bg-white border border-stone-200 rounded-xl p-4">
            <p class="text-[10px] font-bold uppercase tracking-wider text-stone-500 m-0">Despesas</p>
            <p class="text-xl font-bold text-red-600 m-0 mt-1">
              {{ result.summary.despesas | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
            </p>
          </div>
          <div class="bg-white border border-stone-200 rounded-xl p-4">
            <p class="text-[10px] font-bold uppercase tracking-wider text-stone-500 m-0">Saldo</p>
            <p class="text-xl font-bold m-0 mt-1"
              [ngClass]="result.summary.saldo >= 0 ? 'text-emerald-600' : 'text-red-600'">
              {{ result.summary.saldo | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
            </p>
          </div>
        </section>

        <app-history-filters [filters]="filters" [clinics]="clinics" (filtersChange)="onFiltersChange($event)" />

        <section class="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead class="bg-stone-50">
                <tr>
                  <th *ngFor="let h of headers"
                      class="px-5 py-3.5 text-[10px] font-bold tracking-wider uppercase text-stone-500"
                      [class.text-right]="h === 'Valor'">
                    {{ h }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let a of result?.items; trackBy: trackById"
                    class="hover:bg-stone-50 transition-colors">
                  <td class="px-5 py-4 text-[13px] border-t border-stone-100 text-stone-500 whitespace-nowrap">{{ a.date }}</td>
                  <td *ngIf="clinics.length > 1" class="px-5 py-4 text-[13px] border-t border-stone-100 text-stone-600 whitespace-nowrap">{{ a.clinicName }}</td>
                  <td class="px-5 py-4 text-[13px] border-t border-stone-100 font-medium text-stone-800">{{ a.description }}</td>
                  <td class="px-5 py-4 border-t border-stone-100">
                    <span class="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold"
                      [ngClass]="a.category === 'RECEITA' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">
                      {{ a.category }}
                    </span>
                  </td>
                  <td class="px-5 py-4 border-t border-stone-100">
                    <div class="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                      <svg width="8" height="8" viewBox="0 0 8 8">
                        <rect width="8" height="8" rx="4" [attr.fill]="statusColor(a.status)" />
                      </svg>
                      {{ a.status }}
                    </div>
                  </td>
                  <td class="px-5 py-4 text-[13px] border-t border-stone-100 font-bold text-right whitespace-nowrap"
                      [ngClass]="a.value > 0 ? 'text-emerald-600' : 'text-red-600'">
                    {{ a.value | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                  </td>
                </tr>
                <tr *ngIf="result && result.items.length === 0">
                  <td [attr.colspan]="headers.length" class="px-5 py-12 text-center text-sm text-stone-400 border-t border-stone-100">
                    Nenhuma transação encontrada com os filtros atuais.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <app-history-pagination
            *ngIf="result"
            [page]="result.page"
            [pageSize]="result.pageSize"
            [total]="result.total"
            [totalPages]="result.totalPages"
            (pageChange)="onPageChange($event)"
            (pageSizeChange)="onPageSizeChange($event)"
          />
        </section>
      </div>
    </main>
  `,
})
export class HistoryPageComponent implements OnInit {
  protected get headers(): string[] {
    return this.clinics.length > 1
      ? ['Data', 'Clínica', 'Descrição', 'Categoria', 'Status', 'Valor']
      : ['Data', 'Descrição', 'Categoria', 'Status', 'Valor'];
  }

  protected result: HistoryResult | null = null;
  protected filters: HistoryFilters = { category: 'TODAS' };
  protected clinics: ClinicSummaryDto[] = [];
  protected page = 1;
  protected pageSize = 10;

  private readonly service = inject(HistoryService);
  private readonly clinicContext = inject(ClinicContextService);
  private readonly location = inject(Location);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.clinicContext.getClinics().subscribe({
      next: (clinics) => {
        this.clinics = clinics;
        this.cdr.markForCheck();
      },
      error: () => {
      },
    });
    this.load();
  }

  protected onFiltersChange(filters: HistoryFilters): void {
    this.filters = filters;
    this.page = 1;
    this.load();
  }

  protected onPageChange(page: number): void {
    this.page = page;
    this.load();
  }

  protected onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.page = 1;
    this.load();
  }

  protected goBack(): void {
    this.location.back();
  }

  protected get statusColor(): (status: string) => string {
    return getStatusColor;
  }

  protected trackById(index: number, item: HistoryResult['items'][number]): string | number {
    return item.id ?? index;
  }

  private load(): void {
    this.service
      .getHistory({ page: this.page, pageSize: this.pageSize, filters: this.filters })
      .subscribe(res => {
        this.result = res;
        this.cdr.markForCheck();
      });
  }
}