export type ToothState = 'default' | 'selected' | 'pending' | 'note' | 'inactive';
export type ProcedureStatus = 'completed' | 'pending' | 'in_progress' | 'interrupted';

export interface Material {
  name: string;
  category: string;
  quantity: number;
}

export interface Procedure {
  id: string;
  ids: string[];
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  value: number;
  teeth: number[];
  materials: Material[];
  status: ProcedureStatus;
  subtitle: string;
}

export interface Patient {
  id: string;
  name: string;
  code: string;
}

export interface TreatmentData {
  id: string;
  patient: Patient;
  procedures: Procedure[];
  totalBudget: number;
  executed: number;
  toPay: number;
  toothStates: Record<number, ToothState>;
  journeyStep: number;
  notes: string;
}
