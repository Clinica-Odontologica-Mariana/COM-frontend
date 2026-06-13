import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import {
  AddressLookupResult,
  Collaborator,
  CollaboratorAccessMode,
  CollaboratorCollections,
  CollaboratorFormValue,
  CollaboratorRole,
  CollaboratorStatus,
  CollaboratorWorkingHour,
  ServiceOption,
  SpecialtyOption,
  Workplace,
  cloneCollaboratorForm,
  createEmptyCollaboratorForm,
  formatPhoneValue,
  getInitials,
  normalizeDocumentId,
  normalizeEmail,
  passwordStrengthScore,
} from '../models/collaborator.models';

@Injectable({ providedIn: 'root' })
export class CollaboratorsApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  list(): Observable<Collaborator[]> {
    return unwrap(this.http.get<Collaborator[]>(`${this.base}/collaborators`));
  }

  getById(id: string): Observable<Collaborator | null> {
    return unwrap(this.http.get<Collaborator | null>(`${this.base}/collaborators/${id}`));
  }

  create(formValue: CollaboratorFormValue): Observable<Collaborator> {
    const payload = toCreatePayload(formValue);
    return unwrap(this.http.post<Collaborator>(`${this.base}/collaborators`, payload));
  }

  update(id: string, formValue: CollaboratorFormValue): Observable<Collaborator | null> {
    const payload = toUpdatePayload(formValue);
    return unwrap(this.http.put<Collaborator>(`${this.base}/collaborators/${id}`, payload));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/collaborators/${id}`);
  }

  toggleStatus(id: string): Observable<Collaborator | null> {
    return unwrap(this.http.patch<Collaborator>(`${this.base}/collaborators/${id}/status`, null));
  }

  isEmailAvailable(email: string, collaboratorId?: string): Observable<boolean> {
    const params = new URLSearchParams();
    params.set('email', normalizeEmail(email));
    if (collaboratorId) params.set('excludeId', collaboratorId);
    return unwrap(this.http.get<boolean>(`${this.base}/collaborators/availability/email?${params.toString()}`));
  }

  isDocumentAvailable(documentId: string, collaboratorId?: string): Observable<boolean> {
    const params = new URLSearchParams();
    params.set('documentId', normalizeDocumentId(documentId));
    if (collaboratorId) params.set('excludeId', collaboratorId);
    return unwrap(this.http.get<boolean>(`${this.base}/collaborators/availability/document?${params.toString()}`));
  }

  lookupZipCode(zipCode: string): Observable<AddressLookupResult | null> {
    return unwrap(this.http.get<AddressLookupResult | null>(`${this.base}/address/lookup?zip=${zipCode}`));
  }

  collections(): CollaboratorCollections {
    // Backend should provide collections; return empty arrays as fallback until integration.
    return {
      workplaces: [],
      specialties: [],
      services: [],
    };
  }

  fetchCollections(): Observable<CollaboratorCollections> {
    return unwrap(this.http.get<CollaboratorCollections>(`${this.base}/collaborators/collections`));
  }

  createDraft(): CollaboratorFormValue {
    return cloneCollaboratorForm(createEmptyCollaboratorForm());
  }

  displayRole(role: CollaboratorRole): string {
    switch (role) {
      case 'ADMIN':
        return 'Admin';
      case 'RECEPTIONIST':
        return 'Recepção';
      case 'DENTIST':
        return 'Dentista';
      case 'ASSISTANT':
        return 'Auxiliar';
    }
  }

  displayStatus(status: CollaboratorStatus): string {
    return status === 'ACTIVE' ? 'Ativo' : 'Inativo';
  }

  workplaceName(workplaceId: string): string {
    return WORKPLACES.find((workplace) => workplace.id === workplaceId)?.name ?? 'Unidade';
  }

  getCollections(): CollaboratorCollections {
    return this.collections();
  }

  getAllRoles(): CollaboratorRole[] {
    return ['ADMIN', 'RECEPTIONIST', 'DENTIST', 'ASSISTANT'];
  }

  cloneForm(value: CollaboratorFormValue): CollaboratorFormValue {
    return cloneCollaboratorForm(value);
  }

  getInitials(fullName: string): string {
    return getInitials(fullName);
  }

}
