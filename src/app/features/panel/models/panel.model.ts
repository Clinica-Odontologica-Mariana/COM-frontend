export interface DashboardStats {
  totalPatients: number;
  appointmentsToday: number;
  pendingTasks: number;
  monthlyRevenue: number;
  monthlyExpenses?: number;
  monthlyBalance?: number;
}

export interface RecentActivity {
  id: number;
  date: string;
  description: string;
  category: 'RECEITA' | 'DESPESA';
  status: 'Concluído' | 'Pago' | 'Pendente';
  value: number;
}

export interface MonthlyTrend {
  label: string;   // 'JAN', 'FEV', etc.
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