import { TestBed } from '@angular/core/testing';
import { firstValueFrom, lastValueFrom, of, throwError } from 'rxjs';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import { PatientApi } from '../api/patient.api';
import { Patient, PaginatedPatients } from '../models/patient.model';
import { PatientService } from './patient.service';

const mockPatient: Patient = {
  id: '1',
  registrationNumber: '1',
  status: 'active',
  fullName: 'Helena Silveira',
  cpf: '529.982.247-25',
  birthDate: '1985-03-15',
  profession: 'Advogada',
  gender: 'female',
  chiefComplaint: '',
  healthConditions: [],
  continuousMedications: '',
  phone: '(61) 99843-9301',
  email: 'helena@exemplo.com',
  address: { zipCode: '', street: '', neighborhood: '', city: '', state: '' },
};

const mockPage: PaginatedPatients = {
  items: [mockPatient],
  total: 1,
  page: 1,
  pageSize: 10,
  totalPages: 1,
};

describe('PatientService', () => {
  let service: PatientService;
  let api: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    api = {
      list: vi.fn().mockReturnValue(of(mockPage)),
      getById: vi.fn().mockReturnValue(of(mockPatient)),
      create: vi.fn().mockReturnValue(of(mockPatient)),
      update: vi.fn().mockReturnValue(of(mockPatient)),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: PatientApi, useValue: api }],
    });

    service = TestBed.inject(PatientService);
  });

  it('lists patients with pagination', async () => {
    const result = await firstValueFrom(service.list({}, 1));
    expect(api['list']).toHaveBeenCalledWith({}, 1);
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
  });

  it('filters by name', async () => {
    const filtered: PaginatedPatients = {
      ...mockPage,
      items: [{ ...mockPatient, fullName: 'Helena' }],
    };
    api['list'].mockReturnValue(of(filtered));
    const result = await firstValueFrom(service.list({ name: 'Helena' }, 1));
    expect(result.items.every((p) => p.fullName.toLowerCase().includes('helena'))).toBe(true);
  });

  it('creates a patient', async () => {
    const dto = {
      status: 'active' as const,
      fullName: 'Test Patient',
      cpf: '529.982.247-25',
      birthDate: '1990-01-01',
      profession: 'Tester',
      gender: 'other' as const,
      chiefComplaint: 'Test',
      healthConditions: [],
      continuousMedications: '',
      phone: '(61) 3322-4455',
      email: 'test@exemplo.com',
      whatsappReminders: true,
      address: {
        zipCode: '70000-000',
        street: 'Rua Teste',
        neighborhood: 'Centro',
        city: 'Brasília',
        state: 'DF',
      },
    };
    api['create'].mockReturnValue(of({ ...mockPatient, fullName: 'Test Patient' }));
    const created = await firstValueFrom(service.create(dto));
    expect(api['create']).toHaveBeenCalledWith(dto);
    expect(created.fullName).toBe('Test Patient');
    expect(created.id).toBeTruthy();
  });

  it('updates a patient', async () => {
    api['update'].mockReturnValue(of({ ...mockPatient, fullName: 'Nome Atualizado' }));
    const updated = await firstValueFrom(
      service.update('1', { ...mockPatient, fullName: 'Nome Atualizado' }),
    );
    expect(updated.fullName).toBe('Nome Atualizado');
  });

  it('deletes a patient immutably', async () => {
    await lastValueFrom(service.delete('1'));
    expect(api['delete']).toHaveBeenCalledWith('1');
  });

  it('throws when patient not found', async () => {
    api['getById'].mockReturnValue(throwError(() => new Error('Paciente não encontrado')));
    await expect(firstValueFrom(service.getById('invalid-id'))).rejects.toThrow();
  });
});
