import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { AppointmentService } from './appointment.service';
import { AppointmentApi } from '../api/appointment.api';
import { Appointment } from '../models/appointment.model';

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'apt1',
    referenceCode: '#APT1',
    patientId: 'p1',
    patientName: 'Lúcia Oliveira',
    patientInitials: 'LO',
    procedure: 'avaliacao',
    procedureId: null,
    location: null,
    workplaceId: null,
    clinicId: null,
    professionalId: null,
    statusId: null,
    date: '2026-06-18',
    startTime: '09:00',
    endTime: '10:00',
    status: 'pending',
    isBlocked: false,
    ...overrides,
  };
}

const mockAppointments: Appointment[] = [
  makeAppointment({ id: 'apt1', patientName: 'Lúcia Oliveira', workplaceId: 'asa_sul' }),
  makeAppointment({ id: 'apt2', patientName: 'Carlos Mendes', workplaceId: 'taguatinga' }),
  makeAppointment({ id: 'apt3', patientName: 'Ana Lima', isBlocked: true, workplaceId: null }),
];

function createApiMock() {
  return {
    list: vi.fn().mockReturnValue(of(mockAppointments)),
    listByPeriod: vi.fn().mockReturnValue(of(mockAppointments)),
    listUpcoming: vi.fn().mockReturnValue(of(mockAppointments.filter((a) => !a.isBlocked))),
    getById: vi.fn().mockReturnValue(of(mockAppointments[0])),
    create: vi.fn().mockReturnValue(of(makeAppointment({ id: 'new-apt' }))),
    update: vi.fn().mockReturnValue(of(makeAppointment({ id: 'apt1', notes: 'Nota de teste' }))),
    delete: vi.fn().mockReturnValue(of(undefined)),
    searchPatients: vi.fn().mockReturnValue(of([])),
  };
}

describe('AppointmentService', () => {
  let service: AppointmentService;
  let api: ReturnType<typeof createApiMock>;

  beforeEach(() => {
    api = createApiMock();
    TestBed.configureTestingModule({
      providers: [AppointmentService, { provide: AppointmentApi, useValue: api }],
    });
    service = TestBed.inject(AppointmentService);
  });

  it('lists appointments by month', async () => {
    const now = new Date();
    const result = await firstValueFrom(service.listByMonth(now.getFullYear(), now.getMonth()));
    expect(result.length).toBeGreaterThan(0);
    expect(api.listByPeriod).toHaveBeenCalled();
  });

  it('lists upcoming appointments sorted', async () => {
    const result = await firstValueFrom(service.listUpcoming(5));
    expect(result.length).toBeLessThanOrEqual(5);
    expect(result.every((apt) => !apt.isBlocked)).toBe(true);
  });

  it('filters by location (workplaceId)', async () => {
    const now = new Date();
    const result = await firstValueFrom(
      service.listByMonth(now.getFullYear(), now.getMonth(), ['asa_sul']),
    );
    expect(result.every((apt) => apt.isBlocked || apt.workplaceId === 'asa_sul')).toBe(true);
  });

  it('creates and deletes appointment', async () => {
    const created = await firstValueFrom(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      service.create({
        patientId: 'p1',
        procedureId: null,
        date: '2026-06-18',
        startTime: '10:00',
        endTime: '11:00',
      } as any),
    );
    expect(created.id).toBeTruthy();

    const deleted = await firstValueFrom(service.delete(created.id));
    expect(deleted).toBe(true);
  });

  it('filterBySearch matches patient name', async () => {
    const all = await firstValueFrom(service.list());
    const filtered = service.filterBySearch(all, 'Lúcia');
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((apt) => apt.patientName.toLowerCase().includes('lúcia'))).toBe(true);
  });

  it('updates an appointment', async () => {
    const list = await firstValueFrom(service.list());
    const apt = list.find((item) => !item.isBlocked);
    expect(apt).toBeTruthy();

    const updated = await firstValueFrom(
      service.update(apt!.id, { notes: 'Nota de teste' }),
    );
    expect(updated?.notes).toBe('Nota de teste');
  });
});
