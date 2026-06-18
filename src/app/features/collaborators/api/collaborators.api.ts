import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  AddressLookupResult,
  Collaborator,
  CollaboratorCollections,
  CollaboratorFormValue,
  CollaboratorRole,
  CollaboratorStatus,
  cloneCollaboratorForm,
  createEmptyCollaboratorForm,
  formatPhoneValue,
  getInitials,
  passwordStrengthScore,
  normalizeDocumentId,
  normalizeEmail,
} from '../models/collaborator.models';

const STORAGE_KEY = 'com-frontend.collaborators';

@Injectable({ providedIn: 'root' })
export class CollaboratorsApi {
  private readonly platformId = inject(PLATFORM_ID);

  list(): Observable<Collaborator[]> {
    return of(this.readAll());
  }

  getById(id: string): Observable<Collaborator | null> {
    return of(this.readAll().find((collaborator) => collaborator.id === id) ?? null);
  }

  create(formValue: CollaboratorFormValue): Observable<Collaborator> {
    const collaborator = formValueToCollaborator(formValue);
    const items = this.readAll();
    this.writeAll([...items, collaborator]);
    return of(collaborator);
  }

  update(id: string, formValue: CollaboratorFormValue): Observable<Collaborator | null> {
    const items = this.readAll();
    const index = items.findIndex((collaborator) => collaborator.id === id);

    if (index < 0) {
      return of(null);
    }

    const current = items[index];
    const updated = formValueToCollaborator(formValue, id, current.createdAt);
    items[index] = updated;
    this.writeAll(items);
    return of(updated);
  }

  delete(id: string): Observable<void> {
    this.writeAll(this.readAll().filter((collaborator) => collaborator.id !== id));
    return of(void 0);
  }

  toggleStatus(id: string): Observable<Collaborator | null> {
    const items = this.readAll();
    const index = items.findIndex((collaborator) => collaborator.id === id);

    if (index < 0) {
      return of(null);
    }

    const current = items[index];
    const updated: Collaborator = {
      ...current,
      status: current.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
      updatedAt: new Date().toISOString(),
    };

    items[index] = updated;
    this.writeAll(items);
    return of(updated);
  }

  isEmailAvailable(email: string, collaboratorId?: string): Observable<boolean> {
    const normalizedEmail = normalizeEmail(email);
    const available = !this.readAll().some(
      (collaborator) =>
        collaborator.email.toLowerCase() === normalizedEmail && collaborator.id !== collaboratorId,
    );
    return of(available);
  }

  isDocumentAvailable(documentId: string, collaboratorId?: string): Observable<boolean> {
    const normalizedDocumentId = normalizeDocumentId(documentId);
    const available = !this.readAll().some(
      (collaborator) =>
        normalizeDocumentId(collaborator.documentId) === normalizedDocumentId && collaborator.id !== collaboratorId,
    );
    return of(available);
  }

  lookupZipCode(zipCode: string): Observable<AddressLookupResult | null> {
    return of(null);
  }

  collections(): CollaboratorCollections {
    return {
      workplaces: [],
      specialties: [],
      services: [],
    };
  }

  fetchCollections(): Observable<CollaboratorCollections> {
    return of(this.collections());
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
    return this.collections().workplaces.find((workplace) => workplace.id === workplaceId)?.name ?? 'Unidade';
  }

  getCollections(): CollaboratorCollections {
    return this.collections();
  }

  getAllRoles(): CollaboratorRole[] {
    return ['ADMIN', 'RECEPTIONIST', 'DENTIST', 'ASSISTANT'];
  }

  cloneForm(value: CollaboratorFormValue | Collaborator): CollaboratorFormValue {
    if (isCollaboratorFormValue(value)) {
      return cloneCollaboratorForm(value);
    }

    return collaboratorToFormValue(value);
  }

  getInitials(fullName: string): string {
    return getInitials(fullName);
  }

  private readAll(): Collaborator[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as Collaborator[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private writeAll(items: Collaborator[]): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

}

function formValueToCollaborator(
  formValue: CollaboratorFormValue,
  id = cryptoRandomId(),
  createdAt = new Date().toISOString(),
): Collaborator {
  const password = formValue.accessMode === 'MANUAL' ? formValue.password.trim() : '';
  const birthDate = formValue.birthDate || null;

  return {
    id,
    avatarUrl: formValue.avatarPreviewUrl,
    fullName: formValue.fullName.trim(),
    documentId: normalizeDocumentId(formValue.documentId),
    birthDate,
    email: normalizeEmail(formValue.email),
    phone: formatPhoneValue(formValue.phone),
    address: {
      zipCode: formValue.address.zipCode.trim(),
      street: formValue.address.street.trim(),
      number: formValue.address.number.trim(),
      city: formValue.address.city.trim(),
      state: formValue.address.state.trim(),
    },
    roles: [...formValue.roles],
    workplaceIds: [...formValue.workplaceIds],
    status: formValue.status,
    professionalId: formValue.professionalId.trim(),
    specialties: [...formValue.specialties],
    servicesProvided: [...formValue.servicesProvided],
    workingHours: formValue.workingHours.map((workingHour) => ({ ...workingHour })),
    canManageAppointments: formValue.canManageAppointments,
    superAdmin: formValue.superAdmin,
    permissions: { ...formValue.permissions },
    accessMode: formValue.accessMode,
    passwordStrength: passwordStrengthScore(password),
    notes: formValue.notes.trim(),
    createdAt,
    updatedAt: new Date().toISOString(),
  };
}

function collaboratorToFormValue(collaborator: Collaborator): CollaboratorFormValue {
  return cloneCollaboratorForm({
    avatarFile: null,
    avatarPreviewUrl: collaborator.avatarUrl,
    fullName: collaborator.fullName,
    documentId: collaborator.documentId,
    birthDate: collaborator.birthDate ?? '',
    email: collaborator.email,
    phone: collaborator.phone,
    address: { ...collaborator.address },
    roles: [...collaborator.roles],
    workplaceIds: [...collaborator.workplaceIds],
    status: collaborator.status,
    professionalId: collaborator.professionalId,
    specialties: [...collaborator.specialties],
    servicesProvided: [...collaborator.servicesProvided],
    workingHours: collaborator.workingHours.map((workingHour) => ({ ...workingHour })),
    canManageAppointments: collaborator.canManageAppointments,
    superAdmin: collaborator.superAdmin,
    permissions: { ...collaborator.permissions },
    accessMode: collaborator.accessMode,
    password: '',
    passwordConfirm: '',
    notes: collaborator.notes,
  });
}

function isCollaboratorFormValue(value: CollaboratorFormValue | Collaborator): value is CollaboratorFormValue {
  return 'avatarFile' in value && 'passwordConfirm' in value;
}

function cryptoRandomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 11);
}
