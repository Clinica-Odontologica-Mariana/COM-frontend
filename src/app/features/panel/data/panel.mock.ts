import { DashboardData } from '../models/panel.model';

export const DASHBOARD_MOCK_DATA: DashboardData = {
  stats: {
    totalPatients: 1250,
    appointmentsToday: 12,
    pendingTasks: 5,
    monthlyRevenue: 15400.50
  },
  activities: [
    {
      id: 1,
      date: '12 Jun, 2024',
      description: 'Pagamento Implante - R. Alves',
      category: 'RECEITA',
      status: 'Concluído',
      value: 4500.00
    },
    {
      id: 2,
      date: '11 Jun, 2024',
      description: 'Fornecedor Dental - Insumos',
      category: 'DESPESA',
      status: 'Pago',
      value: -1280.00
    },
    {
      id: 3,
      date: '10 Jun, 2024',
      description: 'Manutenção Equipamentos',
      category: 'DESPESA',
      status: 'Pendente',
      value: -850.00
    }
  ],
  monthlyTrend: [
        { label: 'JAN', receita: 82000,  despesa: 38000 },
    { label: 'FEV', receita: 105000, despesa: 44000 },
    { label: 'MAR', receita: 161000, despesa: 52000 },
    { label: 'ABR', receita: 130000, despesa: 49000 },
    { label: 'MAI', receita: 218000, despesa: 61000 },
    { label: 'JUN', receita: 142580, despesa: 58420 },
  ],
  revenueByService: [
    { label: 'Implantes',  value: 58300, color: '#3B82F6' },
    { label: 'Ortodontia', value: 42100, color: '#10B981' },
    { label: 'Estética',   value: 42180, color: '#F59E0B' },
  ],
};
