import { describe, expect, it } from 'vitest';
import {
  buildMonthGrid,
  formatMonthYear,
  formatRelativeDayLabel,
  toIsoDate,
} from './calendar.utils';

describe('calendar.utils', () => {
  describe('toIsoDate', () => {
    it('formats date using local calendar day', () => {
      const date = new Date(2026, 5, 12, 23, 30);
      expect(toIsoDate(date)).toBe('2026-06-12');
    });

    it('does not shift to next day unlike toISOString in late evening', () => {
      const date = new Date(2026, 5, 12, 22, 0);
      expect(date.toISOString().slice(0, 10)).not.toBe(toIsoDate(date));
      expect(toIsoDate(date)).toBe('2026-06-12');
    });
  });

  describe('buildMonthGrid', () => {
    it('returns 42 days for a month grid', () => {
      expect(buildMonthGrid(2026, 5).length).toBe(42);
    });
  });

  describe('formatRelativeDayLabel', () => {
    it('labels today as HOJE', () => {
      const today = toIsoDate(new Date());
      expect(formatRelativeDayLabel(today)).toBe('HOJE');
    });
  });

  describe('formatMonthYear', () => {
    it('returns capitalized month label', () => {
      const label = formatMonthYear(2026, 0);
      expect(label.length).toBeGreaterThan(0);
      expect(label[0]).toBe(label[0].toUpperCase());
    });
  });
});
