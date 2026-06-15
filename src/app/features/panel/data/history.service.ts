import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { RecentActivity } from '../models/panel.model';
import { HistoryFilters, HistoryQuery, HistoryResult } from '../models/history.model';
import { MOCK_HISTORY } from './history.mock';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  /* Substitua o corpo de getHistory() por HttpClient quando integrar com a API. */
  getHistory(query: HistoryQuery): Observable<HistoryResult> {
    const all = this.applyFilters(MOCK_HISTORY, query.filters);
    const total = all.length;
    const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
    const page = Math.min(Math.max(1, query.page), totalPages);
    const start = (page - 1) * query.pageSize;
    const items = all.slice(start, start + query.pageSize);

    const receitas = all.filter(a => a.value > 0).reduce((s, a) => s + a.value, 0);
    const despesas = all.filter(a => a.value < 0).reduce((s, a) => s + a.value, 0);

    return of({
      items,
      total,
      page,
      pageSize: query.pageSize,
      totalPages,
      summary: { receitas, despesas: Math.abs(despesas), saldo: receitas + despesas },
    }).pipe(delay(120));
  }

  private applyFilters(list: RecentActivity[], f: HistoryFilters): RecentActivity[] {
    const term = (f.search ?? '').trim().toLowerCase();
    return list.filter(a => {
      if (f.category && f.category !== 'TODAS' && a.category !== f.category) return false;
      if (f.status && a.status !== f.status) return false;
      if (f.minValue != null && a.value < f.minValue) return false;
      if (f.maxValue != null && a.value > f.maxValue) return false;
      if (f.startDate && this.toIso(a.date) < f.startDate) return false;
      if (f.endDate && this.toIso(a.date) > f.endDate) return false;
      if (!term) return true;
      const key = (f.column ?? 'all');
      const haystack = key === 'all'
        ? [a.date, a.description, a.category, a.status, String(a.value)]
        : [String(a[key as keyof RecentActivity] ?? '')];
      return haystack.some(v => v.toLowerCase().includes(term));
    });
  }

  private toIso(date: string): string {
    if (/^\d{4}-\d{2}-\d{2}/.test(date)) return date;
    const [d, m, y] = date.split('/');
    return `${y}-${m}-${d}`;
  }
}