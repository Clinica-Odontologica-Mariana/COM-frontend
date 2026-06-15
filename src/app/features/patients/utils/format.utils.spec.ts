import { describe, expect, it } from 'vitest';
import {
  cpfValidator,
  formatCpf,
  formatPhone,
  formatZipCode,
  pastDateValidator,
  todayIsoDate,
  validateCpf,
} from './format.utils';

describe('format.utils', () => {
  describe('formatCpf', () => {
    it('formats partial and full CPF', () => {
      expect(formatCpf('52998224725')).toBe('529.982.247-25');
      expect(formatCpf('529')).toBe('529');
    });
  });

  describe('formatPhone', () => {
    it('formats landline with 10 digits', () => {
      expect(formatPhone('6133224455')).toBe('(61) 3322-4455');
    });

    it('formats mobile with 11 digits', () => {
      expect(formatPhone('61998439301')).toBe('(61) 99843-9301');
    });
  });

  describe('formatZipCode', () => {
    it('formats zip code', () => {
      expect(formatZipCode('71900000')).toBe('71900-000');
    });
  });

  describe('validateCpf', () => {
    it('accepts valid CPFs', () => {
      expect(validateCpf('529.982.247-25')).toBe(true);
      expect(validateCpf('390.533.447-05')).toBe(true);
      expect(validateCpf('111.444.777-35')).toBe(true);
    });

    it('rejects invalid CPFs', () => {
      expect(validateCpf('123.456.789-01')).toBe(false);
      expect(validateCpf('111.111.111-11')).toBe(false);
    });
  });

  describe('cpfValidator', () => {
    it('returns invalidCpf for bad value', () => {
      expect(cpfValidator({ value: '123.456.789-01' } as never)).toEqual({ invalidCpf: true });
    });

    it('returns null for valid value', () => {
      expect(cpfValidator({ value: '529.982.247-25' } as never)).toBeNull();
    });
  });

  describe('pastDateValidator', () => {
    it('rejects future dates', () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      const iso = future.toISOString().slice(0, 10);
      expect(pastDateValidator({ value: iso } as never)).toEqual({ futureDate: true });
    });

    it('accepts past dates', () => {
      expect(pastDateValidator({ value: '1990-01-01' } as never)).toBeNull();
    });
  });

  describe('todayIsoDate', () => {
    it('returns ISO date string', () => {
      expect(todayIsoDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
