export type ToothState = 'default' | 'selected' | 'pending' | 'note' | 'inactive';
export type ProcedureStatus = 'concluido' | 'pendente' | 'em_andamento' | 'interrompido' | 'planejado';

export interface Material {
  name: string;
  category: string;
  quantity: number;
}

export interface Procedure {
  id: string;
  nome: string;
  tipo: string;
  dataInicio: string;
  dataFim: string;
  valor: number;
  dentes: number[];
  materiais: Material[];
  status: ProcedureStatus;
  subtitulo: string;
}

export interface Patient {
  id: string;
  nome: string;
  codigo: string;
}

export interface TratamentoData {
  id: string;
  patient: Patient;
  procedures: Procedure[];
  totalOrcamento: number;
  executado: number;
  aPagar: number;
  toothStates: Record<number, ToothState>;
  journeyStep: number;
  observacoes: string;
}
