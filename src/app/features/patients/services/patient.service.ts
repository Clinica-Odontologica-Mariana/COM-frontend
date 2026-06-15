import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PatientApi } from '../api/patient.api';
import {
  PaginatedPatients,
  Patient,
  PatientFilters,
  PatientFormDto,
} from '../models/patient.model';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private readonly api = inject(PatientApi);

  list(filters: PatientFilters = {}, page = 1): Observable<PaginatedPatients> {
    return this.api.list(filters, page);
  }

  getById(id: string): Observable<Patient> {
    return this.api.getById(id);
  }

  create(dto: PatientFormDto): Observable<Patient> {
    return this.api.create(dto);
  }

  update(id: string, dto: PatientFormDto): Observable<Patient> {
    return this.api.update(id, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete(id);
  }
}
