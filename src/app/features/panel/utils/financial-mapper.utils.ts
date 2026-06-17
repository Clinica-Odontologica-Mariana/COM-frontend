import {
  FinancialTransactionApiDto,
  MonthlyTrendApiDto,
  RevenueByServiceApiDto,
  TransactionStatus,
} from '../api/financial-transactions.api';
import { MonthlyTrend, RecentActivity, RevenueByService } from '../models/panel.model';

const STATUS_LABELS: Record<TransactionStatus, RecentActivity['status']> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};

const REVENUE_PALETTE = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F97316',
  '#6366F1',
];

export function mapStatus(status: TransactionStatus): RecentActivity['status'] {
  return STATUS_LABELS[status] ?? 'Pendente';
}

export function toRecentActivity(
  dto: FinancialTransactionApiDto,
  clinicName: string,
): RecentActivity {
  const amount = Math.abs(dto.amount);
  return {
    id: dto.id,
    clinicName,
    date: formatDateBr(dto.transactionDate),
    description: dto.description,
    category: dto.type,
    status: mapStatus(dto.status),
    value: dto.type === 'RECEITA' ? amount : -amount,
  };
}

export function toMonthlyTrend(dto: MonthlyTrendApiDto): MonthlyTrend {
  return {
    label: dto.monthLabel,
    receita: dto.totalReceita,
    despesa: dto.totalDespesa,
  };
}

export function toRevenueByService(dtos: RevenueByServiceApiDto[]): RevenueByService[] {
  return dtos.map((dto, index) => ({
    label: dto.category,
    value: dto.total,
    color: REVENUE_PALETTE[index % REVENUE_PALETTE.length],
  }));
}

export function formatDateBr(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

export function trailingMonthsWindow(months: number): { start: string; end: string } {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth() - (months - 1), 1);
  return { start: toIsoDate(start), end: toIsoDate(end) };
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function mergeMonthlyTrends(perClinic: MonthlyTrendApiDto[][]): MonthlyTrendApiDto[] {
  const byKey = new Map<string, MonthlyTrendApiDto>();

  for (const trend of perClinic) {
    for (const month of trend) {
      const key = `${month.year}-${month.month}`;
      const existing = byKey.get(key);
      if (existing) {
        existing.totalReceita += month.totalReceita;
        existing.totalDespesa += month.totalDespesa;
      } else {
        byKey.set(key, { ...month });
      }
    }
  }

  return Array.from(byKey.values()).sort((a, b) => a.year - b.year || a.month - b.month);
}

export function mergeRevenueByService(
  perClinic: RevenueByServiceApiDto[][],
): RevenueByServiceApiDto[] {
  const totals = new Map<string, number>();

  for (const list of perClinic) {
    for (const item of list) {
      totals.set(item.category, (totals.get(item.category) ?? 0) + item.total);
    }
  }

  return Array.from(totals.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

export function byTransactionDateDesc(
  a: FinancialTransactionApiDto,
  b: FinancialTransactionApiDto,
): number {
  if (a.transactionDate !== b.transactionDate)
    return a.transactionDate < b.transactionDate ? 1 : -1;
  return a.createdAt < b.createdAt ? 1 : -1;
}
