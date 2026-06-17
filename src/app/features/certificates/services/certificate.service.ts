import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { CertificateApi } from '../api/certificate.api';
import { adaptCertificate, adaptCertificates } from '../adapters/certificate.adapter';
import { CertificateCreateDto, CertificateUpdateDto } from '../models/certificate.dto';
import { CertificateState, CertificateViewModel } from '../models/certificate.model';

const initialState: CertificateState = {
  certificates: [],
  loading: false,
  saving: false,
  deletingId: null,
  error: null,
};

const MAX_FEATURED = 3;

@Injectable()
export class CertificateService {
  private readonly api = inject(CertificateApi);
  private readonly state = signal<CertificateState>(initialState);

  readonly certificates = computed(() => this.state().certificates);
  readonly loading = computed(() => this.state().loading);
  readonly saving = computed(() => this.state().saving);
  readonly deletingId = computed(() => this.state().deletingId);
  readonly error = computed(() => this.state().error);
  readonly featuredCount = computed(
    () => this.state().certificates.filter((c) => c.featured).length,
  );
  readonly canFeatureMore = computed(() => this.featuredCount() < MAX_FEATURED);
  load(): void {
    this.patchState({ loading: true, error: null });
    this.api.getAll().subscribe({
      next: (dtos) => {
        this.patchState({ certificates: adaptCertificates(dtos), loading: false });
      },
      error: () => {
        this.patchState({ error: 'Não foi possível carregar os certificados.', loading: false });
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

  toggleFeatured(cert: CertificateViewModel): void {
    const next = !cert.featured;
    if (next && !this.canFeatureMore()) {
      this.patchState({ error: `Máximo de ${MAX_FEATURED} certificados em destaque.` });
      return;
    }
    this.api.setFeatured(cert.id, next).subscribe({
      next: (dto) => {
        const vm = adaptCertificate(dto);
        this.patchState({
          certificates: this.state().certificates.map((c) => (c.id === cert.id ? vm : c)),
          error: null,
        });
      },
      error: (err: Error) => {
        this.patchState({ error: err.message });
      },
    });
  }

  clearError(): void {
    this.patchState({ error: null });
  }

  private patchState(patch: Partial<CertificateState>): void {
    this.state.update((s) => ({ ...s, ...patch }));
  }
}
