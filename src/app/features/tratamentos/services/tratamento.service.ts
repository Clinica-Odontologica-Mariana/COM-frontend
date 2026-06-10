import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { ProcedureStatus, TratamentoData } from '../models/tratamento.model';
import { getMockTratamento } from '../data/mock-tratamento';

@Injectable({ providedIn: 'root' })
export class TratamentoService {
  private http = inject(HttpClient);

  getTratamento(id: string): Observable<TratamentoData> {
    return this.http
      .get<TratamentoData>(`/api/tratamentos/${id}`)
      .pipe(catchError(() => of(getMockTratamento(id))));
  }

  updateObservacoes(id: string, observacoes: string): Observable<void> {
    return this.http
      .patch<void>(`/api/tratamentos/${id}`, { observacoes })
      .pipe(catchError(() => of(undefined)));
  }

  updateProcedureStatus(
    tratamentoId: string,
    procedureId: string,
    status: ProcedureStatus,
  ): Observable<void> {
    return this.http
      .patch<void>(`/api/tratamentos/${tratamentoId}/procedimentos/${procedureId}`, { status })
      .pipe(catchError(() => of(undefined)));
  }
}
