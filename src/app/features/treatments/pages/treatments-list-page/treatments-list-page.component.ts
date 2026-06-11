import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { getAllMockTreatments } from '../../data/mock-treatment';
import { ProcedureStatus, TreatmentData } from '../../models/treatment.model';

interface PatientSummary {
  treatmentId: string;
  patientId: string;
  patientName: string;
  patientCode: string;
  initials: string;
  procedureCount: number;
  completedCount: number;
  totalBudget: number;
  toPay: number;
  dominantStatus: ProcedureStatus;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function getDominantStatus(treatment: TreatmentData): ProcedureStatus {
  const procs = treatment.procedures;
  if (procs.some((p) => p.status === 'in_progress')) return 'in_progress';
  if (procs.some((p) => p.status === 'pending')) return 'pending';
  if (procs.some((p) => p.status === 'planned')) return 'planned';
  if (procs.every((p) => p.status === 'completed')) return 'completed';
  return 'interrupted';
}

const STATUS_LABEL: Record<ProcedureStatus, string> = {
  in_progress: 'Em andamento',
  pending: 'Pendente',
  planned: 'Planejado',
  completed: 'Concluído',
  interrupted: 'Interrompido',
};

const STATUS_COLORS: Record<ProcedureStatus, { bg: string; text: string; dot: string }> = {
  in_progress: { bg: '#FFF7ED', text: '#C2610C', dot: '#F97316' },
  pending: { bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6' },
  planned: { bg: '#F3F4F6', text: '#374151', dot: '#9CA3AF' },
  completed: { bg: '#F0FDF4', text: '#15803D', dot: '#22C55E' },
  interrupted: { bg: '#FFF1F2', text: '#BE123C', dot: '#F43F5E' },
};

@Component({
  selector: 'app-treatments-list-page',
  imports: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen px-6 py-8 md:px-12" style="font-family: 'Manrope', sans-serif;">
      <!-- Page header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            class="text-[clamp(32px,4vw,48px)] leading-tight text-[#7C5145]"
            style="font-family: 'Noto Serif', serif; font-weight: 400;"
          >
            Tratamentos
          </h1>
          <p class="mt-1 text-sm text-[#78716C]">
            {{ filteredPatients().length }} paciente{{ filteredPatients().length !== 1 ? 's' : '' }} encontrado{{ filteredPatients().length !== 1 ? 's' : '' }}
          </p>
        </div>
      </div>

      <!-- Search bar -->
      <div class="mt-6 flex items-center gap-3 rounded-2xl px-4 py-3" style="background: #F3F3F3;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#78716C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Buscar paciente pelo nome..."
          class="flex-1 bg-transparent text-sm text-[#1A1C1C] outline-none placeholder:text-[#A8A29E]"
          [value]="searchQuery()"
          (input)="onSearch($event)"
        />
        @if (searchQuery()) {
          <button
            type="button"
            class="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[#78716C] transition hover:bg-[#E7E5E4]"
            (click)="clearSearch()"
          >
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        }
      </div>

      <!-- Patient list -->
      <div class="mt-6 space-y-3">
        @if (filteredPatients().length === 0) {
          <div class="flex flex-col items-center gap-3 rounded-3xl py-16 text-center" style="background: #F3F3F3;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C4B5AC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <p class="text-sm font-semibold text-[#78716C]">Nenhum paciente encontrado</p>
            <p class="text-xs text-[#A8A29E]">Tente buscar com outro nome</p>
          </div>
        }

        @for (p of filteredPatients(); track p.treatmentId) {
          <button
            type="button"
            class="group flex w-full items-center gap-4 rounded-2xl p-4 text-left transition hover:shadow-md md:gap-6 md:p-5"
            style="background: #FFFFFF; border: 1px solid #EDE8E4;"
            (click)="openTreatment(p.treatmentId)"
          >
            <!-- Avatar -->
            <div
              class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-sm font-bold text-white"
              [style.background]="avatarColor(p.patientName)"
            >
              {{ p.initials }}
            </div>

            <!-- Patient info -->
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-base font-bold text-[#1A1C1C] transition group-hover:text-[#7C5145]">
                  {{ p.patientName }}
                </span>
                <span class="text-xs text-[#78716C]">
                  ID: #PAC-{{ p.patientId.slice(0, 4).toUpperCase() }}
                </span>
              </div>

              <!-- Stats row -->
              <div class="mt-2 flex flex-wrap items-center gap-3">
                <!-- Status badge -->
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  [style.background]="statusColors(p.dominantStatus).bg"
                  [style.color]="statusColors(p.dominantStatus).text"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full"
                    [style.background]="statusColors(p.dominantStatus).dot"
                  ></span>
                  {{ statusLabel(p.dominantStatus) }}
                </span>

                <!-- Procedure progress -->
                <span class="text-xs text-[#78716C]">
                  {{ p.completedCount }}/{{ p.procedureCount }} procedimento{{ p.procedureCount !== 1 ? 's' : '' }}
                </span>

                <!-- Progress bar -->
                <div class="hidden h-1.5 w-20 overflow-hidden rounded-full bg-[#EDE8E4] sm:block">
                  <div
                    class="h-full rounded-full bg-[#7C5145] transition-all"
                    [style.width]="progressWidth(p)"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Budget info -->
            <div class="hidden shrink-0 text-right md:block">
              <p class="text-sm font-bold text-[#1A1C1C]">
                {{ p.totalBudget | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
              </p>
              <p class="mt-0.5 text-xs text-[#78716C]">
                {{ p.toPay | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }} a pagar
              </p>
            </div>

            <!-- Arrow -->
            <svg
              class="ml-1 shrink-0 text-[#C4B5AC] transition group-hover:translate-x-0.5 group-hover:text-[#7C5145]"
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            >
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        }
      </div>
    </div>
  `,
})
export class TreatmentsListPageComponent {
  private router = inject(Router);

  protected readonly searchQuery = signal('');

  private readonly allPatients: PatientSummary[] = getAllMockTreatments().map((t) => ({
    treatmentId: t.id,
    patientId: t.patient.id,
    patientName: t.patient.name,
    patientCode: t.patient.code,
    initials: getInitials(t.patient.name),
    procedureCount: t.procedures.length,
    completedCount: t.procedures.filter((p) => p.status === 'completed').length,
    totalBudget: t.totalBudget,
    toPay: t.toPay,
    dominantStatus: getDominantStatus(t),
  }));

  protected filteredPatients = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.allPatients;
    return this.allPatients.filter((p) => p.patientName.toLowerCase().includes(q));
  });

  protected onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected clearSearch(): void {
    this.searchQuery.set('');
  }

  protected openTreatment(id: string): void {
    void this.router.navigate(['/treatments', id]);
  }

  protected statusLabel(status: ProcedureStatus): string {
    return STATUS_LABEL[status];
  }

  protected statusColors(status: ProcedureStatus): { bg: string; text: string; dot: string } {
    return STATUS_COLORS[status];
  }

  protected progressWidth(p: PatientSummary): string {
    if (p.procedureCount === 0) return '0%';
    return `${Math.round((p.completedCount / p.procedureCount) * 100)}%`;
  }

  protected avatarColor(name: string): string {
    const colors = ['#7C5145', '#8B7355', '#6B7D5E', '#5E7D8B', '#7D5E8B', '#8B6B55'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }
}
