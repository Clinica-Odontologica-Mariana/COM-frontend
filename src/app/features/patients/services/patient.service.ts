import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { INITIAL_PATIENTS } from '../data/patients.mock';
import {
  PaginatedPatients,
  Patient,
  PatientFilters,
  PatientFormDto,
} from '../models/patient.model';

const PAGE_SIZE = 10;

@Injectable({ providedIn: 'root' })
export class PatientService {
  private patients: Patient[] = structuredClone(INITIAL_PATIENTS);
  private nextId = this.patients.length + 1;
  private nextRegistration = 1048294;

  list(filters: PatientFilters = {}, page = 1): Observable<PaginatedPatients> {
    const filtered = this.applyFilters(filters);
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    const items = filtered.slice(start, start + PAGE_SIZE);

    return of({
      items,
      total,
      page: safePage,
      pageSize: PAGE_SIZE,
      totalPages,
    }).pipe(delay(150));
  }

  getById(id: string): Observable<Patient> {
    const patient = this.patients.find((p) => p.id === id);
    if (!patient) {
      return throwError(() => new Error('Paciente não encontrado'));
    }
    return of(structuredClone(patient)).pipe(delay(100));
  }

  create(dto: PatientFormDto): Observable<Patient> {
    const patient: Patient = {
      ...dto,
      id: String(this.nextId++),
      registrationNumber: String(this.nextRegistration++),
    };
    this.patients.unshift(patient);
    return of(structuredClone(patient)).pipe(delay(200));
  }

  update(id: string, dto: PatientFormDto): Observable<Patient> {
    const index = this.patients.findIndex((p) => p.id === id);
    if (index === -1) {
      return throwError(() => new Error('Paciente não encontrado'));
    }
    const updated: Patient = {
      ...this.patients[index],
      ...dto,
      id,
      registrationNumber: this.patients[index].registrationNumber,
    };
    this.patients[index] = updated;
    return of(structuredClone(updated)).pipe(delay(200));
  }

  delete(id: string): Observable<void> {
    const index = this.patients.findIndex((p) => p.id === id);
    if (index === -1) {
      return throwError(() => new Error('Paciente não encontrado'));
    }
    this.patients.splice(index, 1);
    return of(undefined).pipe(delay(150));
  }

  private applyFilters(filters: PatientFilters): Patient[] {
    const name = filters.name?.trim().toLowerCase() ?? '';
    const cpf = filters.cpf?.replace(/\D/g, '') ?? '';

    return this.patients.filter((patient) => {
      const matchesName =
        !name || patient.fullName.toLowerCase().includes(name);
      const matchesCpf =
        !cpf || patient.cpf.replace(/\D/g, '').includes(cpf);
      const matchesStatus =
        !filters.status || patient.status === filters.status;

      return matchesName && matchesCpf && matchesStatus;
    });
  }
}
