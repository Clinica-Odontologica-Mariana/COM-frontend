import { CalendarDay, WeekDayColumn } from '../models/appointment.model';

const WEEKDAY_LABELS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const WEEKDAY_HEADERS_SHORT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getWeekdayHeaders(): string[] {
  return [...WEEKDAY_LABELS];
}

export function getWeekdayHeadersShort(): string[] {
  return [...WEEKDAY_HEADERS_SHORT];
}

export function formatWeekDayHeading(date: Date): string {
  const label = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function buildMonthGrid(year: number, month: number): CalendarDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);

  const days: CalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    days.push({
      date,
      isoDate: toIsoDate(date),
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: isSameDay(date, today),
    });
  }
  return days;
}

export function buildWeekColumns(referenceDate: Date): WeekDayColumn[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(referenceDate);
  start.setDate(referenceDate.getDate() - referenceDate.getDay());
  start.setHours(0, 0, 0, 0);

  const columns: WeekDayColumn[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    columns.push({
      date,
      isoDate: toIsoDate(date),
      dayNumber: date.getDate(),
      weekdayLabel: WEEKDAY_LABELS[i],
      isToday: isSameDay(date, today),
    });
  }
  return columns;
}

export function formatRelativeDayLabel(dateIso: string, time?: string): string {
  const target = new Date(dateIso + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const timePart = time ? ` • ${time}` : '';

  if (diffDays === 0) return `HOJE${timePart}`;
  if (diffDays === 1) return `AMANHÃ${timePart}`;

  const weekday = WEEKDAY_LABELS[target.getDay()];
  if (diffDays > 1 && diffDays <= 7) return `${weekday}${timePart}`;

  const day = target.getDate();
  return `DIA ${day}${timePart}`;
}

export function abbreviateName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

export function formatMonthYear(year: number, month: number): string {
  const formatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
  const label = formatter.format(new Date(year, month, 1));
  return label.charAt(0).toUpperCase() + label.slice(1);
}
