import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ClinicSummaryDto, FinancialTransactionsApi } from '../api/financial-transactions.api';

@Injectable({ providedIn: 'root' })
export class ClinicContextService {
  private readonly api = inject(FinancialTransactionsApi);

  private clinics$?: Observable<ClinicSummaryDto[]>;

  getClinics(): Observable<ClinicSummaryDto[]> {
    if (!this.clinics$) {
      this.clinics$ = this.api.listClinics().pipe(
        map((clinics) => {
          if (!clinics.length) {
            throw new Error(
              'Nenhuma clínica cadastrada. Cadastre uma clínica para visualizar o painel financeiro.',
            );
          }
          return clinics;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.clinics$;
  }

  reset(): void {
    this.clinics$ = undefined;
  }
}
