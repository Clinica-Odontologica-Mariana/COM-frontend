import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { CertificateApi } from '../api/certificate.api';
import { adaptCertificate, adaptCertificates } from '../adapters/certificate.adapter';
import { CertificateCreateDto, CertificateUpdateDto } from '../models/certificate.dto';
import { CertificateState, CertificateViewModel } from '../models/certificate.model';

export const DEFAULT_PATIENT_ID = 'a3f7c291-5e4b-4d82-b913-0f2c8e7a1d56';

const initialState: CertificateState = {
  certificates: [],
  loading: false,
  saving: false,
  deletingId: null,
  error: null,
};

@Injectable()
export class CertificateService {
  private readonly api = inject(CertificateApi);
  private readonly state = signal<CertificateState>(initialState);

  readonly certificates = computed(() => this.state().certificates);
  readonly loading = computed(() => this.state().loading);
  readonly saving = computed(() => this.state().saving);
  readonly deletingId = computed(() => this.state().deletingId);
  readonly error = computed(() => this.state().error);
  readonly patientId = DEFAULT_PATIENT_ID;

  load(): void {
    this.patchState({ loading: true, error: null });
    this.api.getByPatient(DEFAULT_PATIENT_ID).subscribe({
      next: (dtos) => {
        this.patchState({ certificates: adaptCertificates(dtos), loading: false });
      },
      error: (err: Error) => {
        this.patchState({ error: err.message, loading: false });
      },
    });
  }

  create(dto: CertificateCreateDto): Observable<CertificateViewModel> {
    this.patchState({ saving: true, error: null });
    return this.api.create(dto).pipe(
      map((newDto) => {
        const vm = adaptCertificate(newDto);
        this.patchState({ certificates: [vm, ...this.state().certificates] });
        return vm;
      }),
      catchError((err: Error) => {
        this.patchState({ error: err.message });
        return throwError(() => err);
      }),
      finalize(() => this.patchState({ saving: false })),
    );
  }

  update(id: string, dto: CertificateUpdateDto): Observable<CertificateViewModel> {
    this.patchState({ saving: true, error: null });
    return this.api.update(id, dto).pipe(
      map((updatedDto) => {
        const vm = adaptCertificate(updatedDto);
        this.patchState({
          certificates: this.state().certificates.map((c) => (c.id === id ? vm : c)),
        });
        return vm;
      }),
      catchError((err: Error) => {
        this.patchState({ error: err.message });
        return throwError(() => err);
      }),
      finalize(() => this.patchState({ saving: false })),
    );
  }

  delete(id: string): Observable<void> {
    this.patchState({ deletingId: id });
    return this.api.delete(id).pipe(
      tap(() => {
        this.patchState({
          certificates: this.state().certificates.filter((c) => c.id !== id),
        });
      }),
      catchError((err: Error) => {
        this.patchState({ error: err.message });
        return throwError(() => err);
      }),
      finalize(() => this.patchState({ deletingId: null })),
    );
  }

  clearError(): void {
    this.patchState({ error: null });
  }

  private patchState(patch: Partial<CertificateState>): void {
    this.state.update((s) => ({ ...s, ...patch }));
  }
}
