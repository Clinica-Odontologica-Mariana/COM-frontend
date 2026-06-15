import { describe, expect, it } from 'vitest';
import {
  abbreviateName,
  buildMonthGrid,
  buildWeekColumns,
  formatMonthYear,
  formatRelativeDayLabel,
  getWeekdayHeaders,
  getWeekdayHeadersShort,
  isSameDay,
  toIsoDate,
} from './calendar.utils';

describe('calendar.utils', () => {
  describe('toIsoDate', () => {
    it('formats date using local calendar day', () => {
      const date = new Date(2026, 5, 12, 23, 30);
      expect(toIsoDate(date)).toBe('2026-06-12');
    });

    it('pads month and day with leading zeros', () => {
      expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
    });

    it('formats last day of year correctly', () => {
      expect(toIsoDate(new Date(2025, 11, 31))).toBe('2025-12-31');
    });
  });

  describe('isSameDay', () => {
    it('returns true for same calendar day at different times', () => {
      const a = new Date(2026, 5, 15, 8, 0);
      const b = new Date(2026, 5, 15, 23, 59);
      expect(isSameDay(a, b)).toBe(true);
    });

    it('returns false for consecutive days', () => {
      const a = new Date(2026, 5, 15);
      const b = new Date(2026, 5, 16);
      expect(isSameDay(a, b)).toBe(false);
    });

    it('returns false for same day in different months', () => {
      const a = new Date(2026, 4, 15);
      const b = new Date(2026, 5, 15);
      expect(isSameDay(a, b)).toBe(false);
    });
  });

  describe('buildMonthGrid', () => {
    it('returns 42 days for a month grid', () => {
      expect(buildMonthGrid(2026, 5).length).toBe(42);
    });

    it('marks today correctly', () => {
      const now = new Date();
      const grid = buildMonthGrid(now.getFullYear(), now.getMonth());
      const todayCells = grid.filter((d) => d.isToday);
      expect(todayCells.length).toBe(1);
      expect(todayCells[0].dayNumber).toBe(now.getDate());
    });

    it('marks cells outside current month', () => {
      const grid = buildMonthGrid(2026, 5);
      const outOfMonth = grid.filter((d) => !d.isCurrentMonth);
      expect(outOfMonth.length).toBeGreaterThan(0);
    });

    it('isoDate matches date object', () => {
      const grid = buildMonthGrid(2026, 0);
      for (const cell of grid) {
        expect(cell.isoDate).toBe(toIsoDate(cell.date));
      }
    });
  });

  describe('buildWeekColumns', () => {
    it('returns 7 columns', () => {
      expect(buildWeekColumns(new Date(2026, 5, 15)).length).toBe(7);
    });

    it('starts on Sunday', () => {
      const cols = buildWeekColumns(new Date(2026, 5, 15));
      expect(cols[0].date.getDay()).toBe(0);
    });

    it('marks today in the correct column', () => {
      const today = new Date();
      const cols = buildWeekColumns(today);
      const todayCols = cols.filter((c) => c.isToday);
      expect(todayCols.length).toBe(1);
      expect(todayCols[0].dayNumber).toBe(today.getDate());
    });

    it('isoDate matches date object for each column', () => {
      const cols = buildWeekColumns(new Date(2026, 5, 15));
      for (const col of cols) {
        expect(col.isoDate).toBe(toIsoDate(col.date));
      }
    });
  });

  describe('formatRelativeDayLabel', () => {
    it('labels today as HOJE', () => {
      const today = toIsoDate(new Date());
      expect(formatRelativeDayLabel(today)).toBe('HOJE');
    });

    it('labels tomorrow as AMANHÃ', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(formatRelativeDayLabel(toIsoDate(tomorrow))).toBe('AMANHÃ');
    });

    it('includes time suffix when provided', () => {
      const today = toIsoDate(new Date());
      expect(formatRelativeDayLabel(today, '14:00')).toBe('HOJE • 14:00');
    });

    it('shows DIA N for dates beyond one week', () => {
      const far = new Date();
      far.setDate(far.getDate() + 20);
      const label = formatRelativeDayLabel(toIsoDate(far));
      expect(label.startsWith('DIA')).toBe(true);
    });
  });

  describe('getWeekdayHeaders', () => {
    it('returns 7 items', () => {
      expect(getWeekdayHeaders().length).toBe(7);
    });

    it('starts with DOM', () => {
      expect(getWeekdayHeaders()[0]).toBe('DOM');
    });
  });

  describe('getWeekdayHeadersShort', () => {
    it('returns 7 short headers', () => {
      expect(getWeekdayHeadersShort().length).toBe(7);
    });
  });

  describe('abbreviateName', () => {
    it('abbreviates middle names', () => {
      expect(abbreviateName('João Carlos Silva')).toBe('João S.');
    });

    it('keeps single name unchanged', () => {
      expect(abbreviateName('Beatriz')).toBe('Beatriz');
    });

    it('abbreviates two-part name keeping last initial', () => {
      expect(abbreviateName('Ana Costa')).toBe('Ana C.');
    });

    it('handles extra whitespace', () => {
      expect(abbreviateName('  João   Silva  ')).toBe('João S.');
    });
  });

  describe('formatMonthYear', () => {
    it('returns capitalized month label', () => {
      const label = formatMonthYear(2026, 0);
      expect(label.length).toBeGreaterThan(0);
      expect(label[0]).toBe(label[0].toUpperCase());
    });

    it('includes year in the label', () => {
      expect(formatMonthYear(2026, 5)).toContain('2026');
    });
  });
});
