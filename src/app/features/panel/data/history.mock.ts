import { RecentActivity } from '../models/panel.model';

export const MOCK_HISTORY: RecentActivity[] = Array.from({ length: 87 }).map((_, i) => {
  const isReceita = i % 3 !== 0;
  const day = String((i % 28) + 1).padStart(2, '0');
  const month = String((i % 12) + 1).padStart(2, '0');
  return {
    id: i + 1,
    date: `${day}/${month}/2025`,
    description: isReceita ? `Recebimento #${i + 1}` : `Pagamento #${i + 1}`,
    category: isReceita ? 'RECEITA' : 'DESPESA',
    status: i % 4 === 0 ? 'Pendente' : 'Concluído',
    value: isReceita ? 500 + i * 12 : -(150 + (i % 7) * 30),
  };
});