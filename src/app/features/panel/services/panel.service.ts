import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DashboardData, MonthlyTrend } from '../models/panel.model';
import { ClinicContextService } from './clinic-context.service';
import {
  ClinicSummaryDto,
  FinancialTransactionApiDto,
  FinancialTransactionCreatePayload,
  FinancialTransactionUpdatePayload,
  FinancialTransactionsApi,
  MonthlyTrendApiDto,
  RevenueByServiceApiDto,
} from '../api/financial-transactions.api';
import {
  byTransactionDateDesc,
  mergeMonthlyTrends,
  mergeRevenueByService,
  toMonthlyTrend,
  toRecentActivity,
  toRevenueByService,
  trailingMonthsWindow,
} from '../utils/financial-mapper.utils';

const TREND_MONTHS = 6;
const RECENT_ACTIVITIES_LIMIT = 8;

interface ClinicDashboardSlice {
  trend: MonthlyTrendApiDto[];
  revenue: RevenueByServiceApiDto[];
  recent: Array<FinancialTransactionApiDto & { clinicName: string }>;
}

@Injectable({ providedIn: 'root' })
export class PanelService {
  private readonly api = inject(FinancialTransactionsApi);
  private readonly clinicContext = inject(ClinicContextService);

  getDashboardData(): Observable<DashboardData> {
    return this.clinicContext.getClinics().pipe(
      switchMap((clinics) => this.fetchPerClinic(clinics)),
      map((perClinic) => this.buildDashboardData(perClinic)),
    );
  }

  createTransaction(
    payload: FinancialTransactionCreatePayload,
  ): Observable<FinancialTransactionApiDto> {
    return this.api.create(payload);
  }

  updateTransaction(
    id: string,
    payload: FinancialTransactionUpdatePayload,
  ): Observable<FinancialTransactionApiDto> {
    return this.api.update(id, payload);
  }

  private fetchPerClinic(clinics: ClinicSummaryDto[]): Observable<ClinicDashboardSlice[]> {
    const { start, end } = trailingMonthsWindow(TREND_MONTHS);

    return forkJoin(
      clinics.map((clinic) =>
        forkJoin({
          trend: this.api.getMonthlyTrend(clinic.id, TREND_MONTHS),
          revenue: this.api.getRevenueByService(clinic.id, start, end),
          recent: this.api
            .findByClinic(clinic.id)
            .pipe(map((dtos) => dtos.map((dto) => ({ ...dto, clinicName: clinic.name })))),
        }),
      ),
    );
  }

  private buildDashboardData(perClinic: ClinicDashboardSlice[]): DashboardData {
    const monthlyTrend: MonthlyTrend[] = mergeMonthlyTrends(perClinic.map((c) => c.trend)).map(
      toMonthlyTrend,
    );
    const revenueByService = mergeRevenueByService(perClinic.map((c) => c.revenue));
    const recent = perClinic.flatMap((c) => c.recent).sort(byTransactionDateDesc);

    const currentMonth = monthlyTrend.at(-1);
    const monthlyRevenue = currentMonth?.receita ?? 0;
    const monthlyExpenses = currentMonth?.despesa ?? 0;

    return {
      stats: {
        monthlyRevenue,
        monthlyExpenses,
        monthlyBalance: monthlyRevenue - monthlyExpenses,
      },
      activities: recent
        .slice(0, RECENT_ACTIVITIES_LIMIT)
        .map((dto) => toRecentActivity(dto, dto.clinicName)),
      monthlyTrend,
      revenueByService: toRevenueByService(revenueByService),
    };
  }
}
