export interface HistoryFilters {
  search?: string;
  category?: 'TODAS' | 'RECEITA' | 'DESPESA';
  status?: 'Concluído' | 'Pago' | 'Pendente' | 'Cancelado';
  /** Quando ausente, considera todas as clínicas cadastradas. */
  clinicId?: string;
  startDate?: string;
  endDate?: string;
  minValue?: number;
  maxValue?: number;
}

export interface HistoryQuery {
  page: number;
  pageSize: number;
  filters: HistoryFilters;
}

export interface HistoryResult {
  items: import('./panel.model').RecentActivity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary: {
    receitas: number;
    despesas: number;
    saldo: number;
  };
}