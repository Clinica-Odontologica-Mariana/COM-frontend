import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it, beforeEach } from 'vitest';
import { AppointmentService } from './appointment.service';
import { toIsoDate } from '../utils/calendar.utils';

describe('AppointmentService', () => {
  let service: AppointmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
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

  it('creates and deletes appointment', async () => {
    const created = await firstValueFrom(
      service.create({
        patientId: 'p1',
        procedure: 'limpeza',
        location: 'asa_sul',
        date: toIsoDate(new Date()),
        startTime: '10:00',
        endTime: '11:00',
      }),
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
