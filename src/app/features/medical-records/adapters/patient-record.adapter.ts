import {
  AttachmentView,
  BalanceView,
  ClinicalNoteView,
  LastVisitView,
  MedicalAlertView,
  MedicalRecordAttachmentDTO,
  MedicalRecordDTO,
  MedicalRecordNoteDTO,
  PatientDTO,
  PatientView,
  ProcedureView,
  TreatmentPlanDTO,
  TreatmentPlanItemDTO,
  TreatmentSummaryView,
} from '../models/patient-record.models';

export function adaptPatient(dto: PatientDTO): PatientView {
  return {
    id: dto.id,
    fullName: dto.fullName,
    cpf: dto.cpf,
    phone: dto.phone,
    email: dto.email,
    birthDate: dto.birthDate,
    active: dto.active,
    emergencyContactName: dto.emergencyContactName,
    emergencyContactPhone: dto.emergencyContactPhone,
  };
}

function stableAlertId(type: string, desc: string): string {
  return `${type}-${desc.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)}`;
}

export function adaptMedicalAlerts(record: MedicalRecordDTO): MedicalAlertView[] {
  const alerts: MedicalAlertView[] = [];

  if (record.allergies?.trim()) {
    record.allergies
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((desc) => {
        alerts.push({ id: stableAlertId('allergy', desc), description: desc, severity: 'HIGH', type: 'allergy' });
      });
  }

  if (record.chronicConditions?.trim()) {
    record.chronicConditions
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((desc) => {
        alerts.push({ id: stableAlertId('condition', desc), description: desc, severity: 'MEDIUM', type: 'condition' });
      });
  }

  if (record.continuousMedications?.trim()) {
    record.continuousMedications
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((desc) => {
        alerts.push({ id: stableAlertId('medication', desc), description: desc, severity: 'LOW', type: 'medication' });
      });
  }

  return alerts;
}

export function adaptTreatmentSummary(
  plans: TreatmentPlanDTO[],
  items: TreatmentPlanItemDTO[],
): TreatmentSummaryView | null {
  if (!plans.length) return null;

  const activePlan = plans.find((p) => p.status === 'ACTIVE' || p.status === 'IN_PROGRESS') ?? plans[0];

  const planItems = items.filter((i) => i.treatmentPlanId === activePlan.id);
  const total = planItems.length;
  const completed = planItems.filter((i) => i.status === 'DONE' || i.completedAt !== null).length;

  const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    progressPercentage,
    description: activePlan.notes ?? `Plano: ${activePlan.title}`,
    currentStep: adaptPlanStatus(activePlan.status),
  };
}

function adaptPlanStatus(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: 'Ativo',
    IN_PROGRESS: 'Em andamento',
    COMPLETED: 'Concluído',
    CANCELLED: 'Cancelado',
    DRAFT: 'Rascunho',
  };
  return map[status] ?? status;
}

export function adaptLastVisit(notes: MedicalRecordNoteDTO[]): LastVisitView | null {
  /**
   * TODO(BACKEND): data derivada da nota mais recente, não de consulta clínica real.
   * Endpoint esperado: GET /appointments/by-patient/{id}?sort=date&order=desc&limit=1
   * Impacto atual: a data exibida é quando a nota foi criada, podendo divergir da visita real.
   */
  if (!notes.length) return null;

  const sorted = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const latest = sorted[0];
  const shortNote = latest.note.length > 100 ? latest.note.slice(0, 97) + '...' : latest.note;

  return { date: latest.createdAt, description: shortNote };
}

export function adaptBalance(plans: TreatmentPlanDTO[]): BalanceView | null {
  // TODO: integrate with dedicated financial/billing endpoint when available
  if (!plans.length) return null;
  const total = plans.reduce((sum, p) => sum + (p.totalAmount ?? 0), 0);
  return { amount: total };
}

function computeNoteTitle(note: string): string {
  const first = note.split(/[.\n!?]/)[0].trim();
  return first.length > 55 ? first.slice(0, 52) + '…' : first;
}

export function adaptNotes(dtos: MedicalRecordNoteDTO[]): ClinicalNoteView[] {
  return [...dtos]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((dto) => ({
      id: dto.id,
      title: computeNoteTitle(dto.note),
      note: dto.note,
      createdAt: dto.createdAt,
    }));
}

export function adaptAttachments(dtos: MedicalRecordAttachmentDTO[]): AttachmentView[] {
  return [...dtos]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((dto) => ({
      id: dto.id,
      originalFileName: dto.originalFileName,
      mimeType: dto.mimeType,
      sizeBytes: dto.sizeBytes,
      description: dto.description,
      createdAt: dto.createdAt,
      isImage: dto.mimeType.startsWith('image/'),
    }));
}

export function adaptProcedures(items: TreatmentPlanItemDTO[]): ProcedureView[] {
  return [...items]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((item) => ({
      id: item.id,
      description: item.description,
      status: item.status,
      toothNumber: item.toothNumber,
      estimatedPrice: item.estimatedPrice,
      completedAt: item.completedAt,
    }));
}
