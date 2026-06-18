import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from '../../../core/config/api.config';
import { ApiResponse } from '../../../core/models/api-response.model';

export type TransactionType = 'RECEITA' | 'DESPESA';
export type TransactionStatus = 'PENDING' | 'PAID' | 'COMPLETED' | 'CANCELLED';

export interface FinancialTransactionApiDto {
  id: string;
  clinicId: string;
  appointmentId: string | null;
  treatmentPlanId: string | null;
  description: string;
  type: TransactionType;
  category: string | null;
  amount: number;
  status: TransactionStatus;
  transactionDate: string;
  notes: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyTrendApiDto {
  year: number;
  month: number;
  monthLabel: string;
  totalReceita: number;
  totalDespesa: number;
}

export interface RevenueByServiceApiDto {
  category: string;
  total: number;
}

export interface ClinicSummaryDto {
  id: string;
  name: string;
}

interface PageDto<T> {
  content: T[];
}

export interface FinancialTransactionCreatePayload {
  clinicId: string;
  appointmentId?: string | null;
  treatmentPlanId?: string | null;
  description: string;
  type: TransactionType;
  category?: string | null;
  amount: number;
  status?: TransactionStatus;
  transactionDate: string;
  notes?: string | null;
}

export interface FinancialTransactionUpdatePayload {
  description: string;
  type: TransactionType;
  category?: string | null;
  amount: number;
  status?: TransactionStatus;
  transactionDate: string;
  notes?: string | null;
}

@Injectable({ providedIn: 'root' })
export class FinancialTransactionsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  listClinics(): Observable<ClinicSummaryDto[]> {
    return this.http
      .get<ApiResponse<PageDto<ClinicSummaryDto>>>(`${this.baseUrl}/clinics?size=100`)
      .pipe(map((response) => response.data.content));
  }

  findByClinic(
    clinicId: string,
    start?: string,
    end?: string,
  ): Observable<FinancialTransactionApiDto[]> {
    let params = new HttpParams();
    if (start) params = params.set('start', start);
    if (end) params = params.set('end', end);

    return this.http
      .get<
        ApiResponse<FinancialTransactionApiDto[]>
      >(`${this.baseUrl}/financial-transactions/by-clinic/${clinicId}`, { params })
      .pipe(map((response) => response.data));
  }

  getMonthlyTrend(clinicId: string, months: number): Observable<MonthlyTrendApiDto[]> {
    const params = new HttpParams().set('months', months);
    return this.http
      .get<
        ApiResponse<MonthlyTrendApiDto[]>
      >(`${this.baseUrl}/financial-transactions/dashboard/${clinicId}/monthly-trend`, { params })
      .pipe(map((response) => response.data));
  }

  getRevenueByService(
    clinicId: string,
    start: string,
    end: string,
  ): Observable<RevenueByServiceApiDto[]> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http
      .get<
        ApiResponse<RevenueByServiceApiDto[]>
      >(`${this.baseUrl}/financial-transactions/dashboard/${clinicId}/revenue-by-service`, { params })
      .pipe(map((response) => response.data));
  }

  create(payload: FinancialTransactionCreatePayload): Observable<FinancialTransactionApiDto> {
    return this.http
      .post<
        ApiResponse<FinancialTransactionApiDto>
      >(`${this.baseUrl}/financial-transactions`, payload)
      .pipe(map((response) => response.data));
  }

  update(
    id: string,
    payload: FinancialTransactionUpdatePayload,
  ): Observable<FinancialTransactionApiDto> {
    return this.http
      .put<
        ApiResponse<FinancialTransactionApiDto>
      >(`${this.baseUrl}/financial-transactions/${id}`, payload)
      .pipe(map((response) => response.data));
  }
}
