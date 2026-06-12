import { TestBed } from '@angular/core/testing';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { describe, expect, it, beforeEach } from 'vitest';
import { PatientService } from './patient.service';

describe('PatientService', () => {
  let service: PatientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientService);
  });

  it('lists patients with pagination', async () => {
    const result = await firstValueFrom(service.list({}, 1));
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
  });

  it('filters by name', async () => {
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

    const created = await firstValueFrom(service.create(dto));
    expect(created.fullName).toBe('Test Patient');
    expect(created.id).toBeTruthy();
  });

  it('updates a patient', async () => {
    const list = await firstValueFrom(service.list({}, 1));
    const patient = list.items[0];
    const updated = await firstValueFrom(
      service.update(patient.id, { ...patient, fullName: 'Nome Atualizado' }),
    );
    expect(updated.fullName).toBe('Nome Atualizado');
  });

  it('deletes a patient immutably', async () => {
    const before = await firstValueFrom(service.list({}, 1));
    const id = before.items[0].id;
    await lastValueFrom(service.delete(id));
    const after = await firstValueFrom(service.list({}, 1));
    expect(after.items.find((p) => p.id === id)).toBeUndefined();
  });

  it('throws when patient not found', async () => {
    await expect(firstValueFrom(service.getById('invalid-id'))).rejects.toThrow();
  });
});
