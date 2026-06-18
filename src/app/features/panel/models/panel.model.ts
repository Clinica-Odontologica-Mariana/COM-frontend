export interface DashboardStats {
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyBalance: number;
}

export interface RecentActivity {
  id: number | string;
  clinicName: string;
  date: string;
  description: string;
  type: 'RECEITA' | 'DESPESA';
  category: string;
  status: 'Concluído' | 'Pago' | 'Pendente' | 'Cancelado';
  value: number;
  treatmentPlanId: string | null;
}

export interface MonthlyTrend {
  label: string; // 'JAN', 'FEV', etc.
  receita: number;
  despesa: number;
}

export interface RevenueByService {
  label: string;
  value: number;
  color: string;
}

export interface DashboardData {
  stats: DashboardStats;
  activities: RecentActivity[];
  monthlyTrend: MonthlyTrend[];
  revenueByService: RevenueByService[];
}
