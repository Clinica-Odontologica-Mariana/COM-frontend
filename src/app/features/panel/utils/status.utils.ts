export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    'Concluído': '#10B981',
    'Pago':      '#10B981',
    'Pendente':  '#F59E0B',
  };
  return map[status] ?? '#9CA3AF';
}