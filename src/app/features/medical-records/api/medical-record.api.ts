import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { API_BASE_URL, SUPPRESS_ERROR_TOAST } from '../../../core/config/api.config';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  MedicalRecordAttachmentCreateDTO,
  MedicalRecordAttachmentDTO,
  MedicalRecordDTO,
  MedicalRecordNoteCreateDTO,
  MedicalRecordNoteDTO,
  OdontogramEntryDTO,
  PatientDTO,
  TreatmentPlanDTO,
  TreatmentPlanItemDTO,
} from '../models/patient-record.models';

function unwrap<T>(source: Observable<ApiResponse<T>>): Observable<T> {
  return source.pipe(map((res) => res.data));
}

@Injectable({ providedIn: 'root' })
export class MedicalRecordApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  getPatient(patientId: string): Observable<PatientDTO> {
    return unwrap(this.http.get<ApiResponse<PatientDTO>>(`${this.base}/patients/${patientId}`));
  }

  getMedicalRecord(patientId: string): Observable<MedicalRecordDTO> {
    return unwrap(
      this.http.get<ApiResponse<MedicalRecordDTO>>(
        `${this.base}/medical-records/by-patient/${patientId}`,
      ),
    );
  }

  getNotes(patientId: string): Observable<MedicalRecordNoteDTO[]> {
    return unwrap(
      this.http.get<ApiResponse<MedicalRecordNoteDTO[]>>(
        `${this.base}/medical-records/by-patient/${patientId}/notes`,
      ),
    );
  }

  createNote(
    patientId: string,
    payload: MedicalRecordNoteCreateDTO,
  ): Observable<MedicalRecordNoteDTO> {
    return unwrap(
      this.http.post<ApiResponse<MedicalRecordNoteDTO>>(
        `${this.base}/medical-records/by-patient/${patientId}/notes`,
        payload,
      ),
    );
  }

  updateNote(
    patientId: string,
    noteId: string,
    payload: MedicalRecordNoteCreateDTO,
  ): Observable<MedicalRecordNoteDTO> {
    return unwrap(
      this.http.put<ApiResponse<MedicalRecordNoteDTO>>(
        `${this.base}/medical-records/by-patient/${patientId}/notes/${noteId}`,
        payload,
      ),
    );
  }

  deleteNote(patientId: string, noteId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/medical-records/by-patient/${patientId}/notes/${noteId}`,
    );
  }

  getAttachments(patientId: string): Observable<MedicalRecordAttachmentDTO[]> {
    return unwrap(
      this.http.get<ApiResponse<MedicalRecordAttachmentDTO[]>>(
        `${this.base}/medical-records/by-patient/${patientId}/attachments`,
      ),
    );
  }

  addAttachment(
    patientId: string,
    payload: MedicalRecordAttachmentCreateDTO,
  ): Observable<MedicalRecordAttachmentDTO> {
    return unwrap(
      this.http.post<ApiResponse<MedicalRecordAttachmentDTO>>(
        `${this.base}/medical-records/by-patient/${patientId}/attachments`,
        payload,
      ),
    );
  }

  deleteAttachment(patientId: string, attachmentId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/medical-records/by-patient/${patientId}/attachments/${attachmentId}`,
    );
  }

  createTreatmentPlan(patientId: string, medicalRecordId: string): Observable<TreatmentPlanDTO> {
    return unwrap(
      this.http.post<ApiResponse<TreatmentPlanDTO>>(
        `${this.base}/treatment-plans`,
        { patientId, medicalRecordId, title: 'Plano de Tratamento', status: 'DRAFT' },
        { context: new HttpContext().set(SUPPRESS_ERROR_TOAST, true) },
      ),
    );
  }

  getTreatmentPlans(patientId: string): Observable<TreatmentPlanDTO[]> {
    return unwrap(
      this.http.get<ApiResponse<TreatmentPlanDTO[]>>(
        `${this.base}/treatment-plans/by-patient/${patientId}`,
      ),
    );
  }

  getTreatmentPlanItems(planId: string): Observable<TreatmentPlanItemDTO[]> {
    return unwrap(
      this.http.get<ApiResponse<TreatmentPlanItemDTO[]>>(
        `${this.base}/treatment-plans/${planId}/items`,
      ),
    );
  }

  createTreatmentPlanItem(
    planId: string,
    payload: {
      description: string;
      toothNumber: number | null;
      estimatedPrice: number;
      status: string;
    },
  ): Observable<TreatmentPlanItemDTO> {
    return unwrap(
      this.http.post<ApiResponse<TreatmentPlanItemDTO>>(
        `${this.base}/treatment-plans/${planId}/items`,
        payload,
      ),
    );
  }

  updateTreatmentPlanItem(
    planId: string,
    itemId: string,
    payload: {
      description: string;
      toothNumber: number | null;
      estimatedPrice: number;
      status: string;
    },
  ): Observable<TreatmentPlanItemDTO> {
    return unwrap(
      this.http.put<ApiResponse<TreatmentPlanItemDTO>>(
        `${this.base}/treatment-plans/${planId}/items/${itemId}`,
        payload,
      ),
    );
  }

  updatePatient(patientId: string, payload: Partial<PatientDTO>): Observable<PatientDTO> {
    return unwrap(
      this.http.put<ApiResponse<PatientDTO>>(`${this.base}/patients/${patientId}`, payload),
    );
  }

  updateMedicalRecord(
    recordId: string,
    payload: Partial<
      Pick<
        MedicalRecordDTO,
        'allergies' | 'chronicConditions' | 'continuousMedications' | 'generalObservations'
      >
    >,
  ): Observable<MedicalRecordDTO> {
    return unwrap(
      this.http.put<ApiResponse<MedicalRecordDTO>>(
        `${this.base}/medical-records/${recordId}`,
        payload,
      ),
    );
  }

  getOdontogramEntries(patientId: string): Observable<OdontogramEntryDTO[]> {
    return unwrap(
      this.http.get<ApiResponse<OdontogramEntryDTO[]>>(
        `${this.base}/odontogram-entries/by-patient/${patientId}`,
      ),
    );
  }
}
