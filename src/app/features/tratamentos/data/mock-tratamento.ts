import { TratamentoData } from '../models/tratamento.model';

export const MOCK_TRATAMENTOS: Record<string, TratamentoData> = {
  '1': {
    id: '1',
    patient: {
      id: '001',
      nome: 'Ana Carolina Ferreira',
      codigo: 'PAC-001',
    },
    procedures: [
      {
        id: 'p1',
        nome: 'Extração de Siso',
        tipo: 'Cirurgia',
        dataInicio: '10/03/2026',
        dataFim: '10/03/2026',
        valor: 850.0,
        dentes: [18, 28, 38, 48],
        materiais: [
          { name: 'Anestésico Local', category: 'Medicamento', quantity: 2 },
          { name: 'Gaze Estéril', category: 'Material', quantity: 5 },
        ],
        status: 'em_andamento',
        subtitulo: 'Cirurgia — 4 dentes',
      },
      {
        id: 'p2',
        nome: 'Clareamento Dental',
        tipo: 'Estética',
        dataInicio: '15/04/2026',
        dataFim: '30/04/2026',
        valor: 1200.0,
        dentes: [11, 12, 13, 21, 22, 23],
        materiais: [{ name: 'Gel Clareador 35%', category: 'Material', quantity: 1 }],
        status: 'pendente',
        subtitulo: 'Estética — 6 dentes',
      },
      {
        id: 'p3',
        nome: 'Restauração em Resina',
        tipo: 'Restauração',
        dataInicio: '05/02/2026',
        dataFim: '05/02/2026',
        valor: 320.0,
        dentes: [36, 37],
        materiais: [
          { name: 'Resina Composta A2', category: 'Material', quantity: 1 },
          { name: 'Ácido Fosfórico', category: 'Material', quantity: 1 },
        ],
        status: 'concluido',
        subtitulo: 'Restauração — 2 dentes',
      },
    ],
    totalOrcamento: 2370.0,
    executado: 320.0,
    aPagar: 2050.0,
    toothStates: {
      18: 'pending',
      28: 'pending',
      38: 'pending',
      48: 'pending',
      11: 'note',
      12: 'note',
      13: 'note',
      21: 'note',
      22: 'note',
      23: 'note',
      36: 'selected',
      37: 'selected',
    },
    journeyStep: 1,
    observacoes:
      'Paciente apresenta bruxismo. Recomendado uso de placa de mordida após conclusão dos tratamentos. Próxima sessão: Fase Curativa (extração sisos superiores).',
  },
};

export function getMockTratamento(id: string): TratamentoData {
  return (
    MOCK_TRATAMENTOS[id] ?? {
      ...MOCK_TRATAMENTOS['1'],
      id,
    }
  );
}
