import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { RecentActivity } from '../models/panel.model';
import { HistoryFilters, HistoryQuery, HistoryResult } from '../models/history.model';
import { ClinicContextService } from './clinic-context.service';
import {
  FinancialTransactionApiDto,
  FinancialTransactionsApi,
} from '../api/financial-transactions.api';
import {
  byTransactionDateDesc,
  formatDateBr,
  mapStatus,
  toRecentActivity,
} from '../utils/financial-mapper.utils';

type DtoWithClinic = FinancialTransactionApiDto & { clinicName: string };

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private readonly api = inject(FinancialTransactionsApi);
  private readonly clinicContext = inject(ClinicContextService);

  getHistory(query: HistoryQuery): Observable<HistoryResult> {
    return this.clinicContext.getClinics().pipe(
      map((clinics) =>
        clinics.filter((c) => !query.filters.clinicId || c.id === query.filters.clinicId),
      ),
      switchMap((clinics) =>
        forkJoin(
          clinics.map((clinic) =>
            this.api
              .findByClinic(clinic.id, query.filters.startDate, query.filters.endDate)
              .pipe(map((dtos) => dtos.map((dto) => ({ ...dto, clinicName: clinic.name })))),
          ),
        ),
      ),
      map((perClinic) => perClinic.flat().sort(byTransactionDateDesc)),
      map((dtos) => this.filterDtos(dtos, query.filters)),
      map((dtos) =>
        this.buildResult(
          dtos.map((dto) => toRecentActivity(dto, dto.clinicName)),
          query,
        ),
      ),
    );
  }

  private filterDtos(list: DtoWithClinic[], f: HistoryFilters): DtoWithClinic[] {
    const term = (f.search ?? '').trim().toLowerCase();

    return list.filter((dto) => {
      if (f.startDate && dto.transactionDate < f.startDate) return false;
      if (f.endDate && dto.transactionDate > f.endDate) return false;
      if (f.category && f.category !== 'TODAS' && dto.type !== f.category) return false;

      const statusLabel = mapStatus(dto.status);
      if (f.status && statusLabel !== f.status) return false;

      const value = dto.type === 'RECEITA' ? dto.amount : -dto.amount;
      if (f.minValue != null && value < f.minValue) return false;
      if (f.maxValue != null && value > f.maxValue) return false;

      if (!term) return true;
      const haystack = [
        formatDateBr(dto.transactionDate),
        dto.clinicName,
        dto.description,
        dto.type,
        statusLabel,
        value.toFixed(2),
        value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      ];
      return haystack.some((v) => v.toLowerCase().includes(term));
    });
  }

  private buildResult(all: RecentActivity[], query: HistoryQuery): HistoryResult {
    const total = all.length;
    const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
    const page = Math.min(Math.max(1, query.page), totalPages);
    const start = (page - 1) * query.pageSize;
    const items = all.slice(start, start + query.pageSize);

    const receitas = all.filter((a) => a.value > 0).reduce((sum, a) => sum + a.value, 0);
    const despesas = all.filter((a) => a.value < 0).reduce((sum, a) => sum + a.value, 0);

    return {
      items,
      total,
      page,
      pageSize: query.pageSize,
      totalPages,
      summary: { receitas, despesas: Math.abs(despesas), saldo: receitas + despesas },
    };
  }
}
