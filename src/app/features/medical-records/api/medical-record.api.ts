import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { API_BASE_URL } from '../../../core/config/api.config';
import {
  ClinicalEvolutionDTO,
  CreateEvolutionDTO,
  PatientDTO,
  PatientRecordDTO,
  PrescriptionDTO,
} from '../models/patient-record.models';

@Injectable({
  providedIn: 'root',
})
export class MedicalRecordApi {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_BASE_URL);

  getPatient(id: number) {
    return this.http.get<PatientDTO>(`${this.api}/patients/${id}`);
  }

  getRecord(patientId: number) {
    return this.http.get<PatientRecordDTO>(`${this.api}/records/${patientId}`);
  }

  getEvolutions(patientId: number) {
    return this.http.get<ClinicalEvolutionDTO[]>(`${this.api}/patients/${patientId}/evolutions`);
  }

  createEvolution(payload: CreateEvolutionDTO) {
    return this.http.post<ClinicalEvolutionDTO>(`${this.api}/evolutions`, payload);
  }

  getPrescriptions(patientId: number) {
    return this.http.get<PrescriptionDTO[]>(`${this.api}/patients/${patientId}/prescriptions`);
  }
}
