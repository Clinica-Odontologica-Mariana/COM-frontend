import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { AppointmentService } from './appointment.service';
import { AppointmentApi } from '../api/appointment.api';
import { Appointment } from '../models/appointment.model';

const makeAppointment = (overrides: Partial<Appointment> = {}): Appointment => ({
  id: 'apt-1',
  referenceCode: 'REF-001',
  patientId: 'p1',
  patientName: 'Lúcia Silva',
  procedure: 'limpeza',
  location: 'asa_sul',
  date: '2024-06-01',
  startTime: '10:00',
  endTime: '11:00',
  status: 'confirmed',
  isBlocked: false,
  ...overrides,
});

function createApiMock() {
  return {
    list: vi.fn().mockReturnValue(of([makeAppointment(), makeAppointment({ id: 'apt-2', patientName: 'João Souza' })])),
    listByPeriod: vi.fn().mockReturnValue(of([makeAppointment()])),
    listUpcoming: vi.fn().mockReturnValue(of([makeAppointment()])),
    getById: vi.fn().mockReturnValue(of(makeAppointment())),
    create: vi.fn().mockReturnValue(of(makeAppointment({ id: 'new-apt' }))),
    update: vi.fn().mockReturnValue(of(makeAppointment({ notes: 'Nota de teste' }))),
    delete: vi.fn().mockReturnValue(of(true)),
  };
}

describe('AppointmentService', () => {
  let service: AppointmentService;
  let api: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    api = createApiMock();
    TestBed.configureTestingModule({
      providers: [
        AppointmentService,
        { provide: AppointmentApi, useValue: api },
      ],
    });
    service = TestBed.inject(AppointmentService);
  });

  it('lists appointments by month', async () => {
    const now = new Date();
    const result = await firstValueFrom(service.listByMonth(now.getFullYear(), now.getMonth()));
    expect(result.length).toBeGreaterThan(0);
  });

  it('lists upcoming appointments sorted', async () => {
    const result = await firstValueFrom(service.listUpcoming(5));
    expect(result.length).toBeLessThanOrEqual(5);
    expect(result.every((apt) => !apt.isBlocked)).toBe(true);
  });

  it('filters by location', async () => {
    const now = new Date();
    const result = await firstValueFrom(
      service.listByMonth(now.getFullYear(), now.getMonth(), ['asa_sul']),
    );
    expect(result.every((apt) => apt.isBlocked || apt.location === 'asa_sul')).toBe(true);
  });

  it('creates an appointment', async () => {
    const created = await firstValueFrom(
      service.create({
        patientId: 'p1',
        clinicId: 'clinic-1',
        workplaceId: 'wp-1',
        professionalId: 'prof-1',
        date: '2024-06-01',
        startTime: '10:00',
        endTime: '11:00',
      }),
    );
    expect(created.id).toBeTruthy();
  });

  it('deletes an appointment', async () => {
    const deleted = await firstValueFrom(service.delete('apt-1'));
    expect(deleted).toBe(true);
  });

  it('filterBySearch matches patient name', async () => {
    const all = await firstValueFrom(service.list());
    const filtered = service.filterBySearch(all, 'Lúcia');
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((apt) => apt.patientName.toLowerCase().includes('lúcia'))).toBe(true);
  });

  it('updates an appointment', async () => {
    const updated = await firstValueFrom(
      service.update('apt-1', { notes: 'Nota de teste' }),
    );
    expect(updated?.notes).toBe('Nota de teste');
  });
});
