import { CurrencyPipe, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { ProcedureStatus } from '../../models/treatment.model';
import { TreatmentListItem, TreatmentService } from '../../services/treatment.service';

interface PatientSummary {
  treatmentId: string;
  patientId: string;
  patientName: string;
  initials: string;
  procedureCount: number;
  completedCount: number;
  totalBudget: number;
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

function dominantStatusFromApiStatus(status: string): ProcedureStatus {
  switch (status?.toUpperCase()) {
    case 'DONE':
      return 'completed';
    case 'APPROVED':
      return 'in_progress';
    case 'CANCELLED':
      return 'interrupted';
    default:
      return 'pending';
  }
}

function mapToSummary(item: TreatmentListItem): PatientSummary {
  return {
    treatmentId: item.id,
    patientId: item.patientId,
    patientName: item.patientName || item.title,
    initials: getInitials(item.patientName || item.title),
    procedureCount: item.procedureCount,
    completedCount: item.completedCount,
    totalBudget: item.totalAmount ?? 0,
    dominantStatus: dominantStatusFromApiStatus(item.status),
  };
}

const STATUS_LABEL: Record<ProcedureStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  completed: 'Concluído',
  interrupted: 'Interrompido',
};

const STATUS_COLORS: Record<ProcedureStatus, { bg: string; text: string; dot: string }> = {
  pending: { bg: '#FEF3C7', text: '#92400E', dot: '#D97706' },
  in_progress: { bg: '#F0E4DF', text: '#7C5145', dot: '#9B6B5F' },
  completed: { bg: '#DCFCE7', text: '#166534', dot: '#22C55E' },
  interrupted: { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
};

@Component({
  selector: 'app-treatments-list-page',
  imports: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-fit w-full px-6 py-8 md:px-12" style="font-family: 'Manrope', sans-serif;">
      <!-- Page header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            class="text-[clamp(32px,4vw,48px)] leading-tight text-[#7C5145]"
            style="font-family: 'Noto Serif', serif; font-weight: 400;"
          >
            Tratamentos
          </h1>
          @if (!loading() && !loadError()) {
            <p class="mt-1 text-sm text-[#78716C]">
              {{ filteredPatients().length }} paciente{{
                filteredPatients().length !== 1 ? 's' : ''
              }}
              encontrado{{ filteredPatients().length !== 1 ? 's' : '' }}
            </p>
          }
        </div>
      </div>

      <!-- Loading state -->
      @if (loading()) {
        <div class="mt-12 flex items-center justify-center">
          <div
            class="h-10 w-10 animate-spin rounded-full border-4 border-[#7C5145] border-t-transparent"
          ></div>
        </div>
      }

      <!-- Error state -->
      @if (!loading() && loadError()) {
        <div class="mt-8 rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
          <p class="text-base font-semibold text-red-700">
            Não foi possível carregar os tratamentos.
          </p>
          <p class="mt-1 text-sm text-red-500">{{ loadError() }}</p>
          <button
            type="button"
            class="mt-4 rounded-xl bg-[#7C5145] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            (click)="load()"
          >
            Tentar novamente
          </button>
        </div>
      }

      @if (!loading() && !loadError()) {
        <!-- Search bar -->
        <div
          class="mt-6 flex items-center gap-3 rounded-2xl px-4 py-3"
          style="background: #F3F3F3;"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#78716C"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="shrink-0"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
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
                <path
                  d="M1 1l12 12M13 1L1 13"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          }
        </div>

        <!-- Patient list -->
        <div class="w-full mt-6 space-y-3">
          @if (filteredPatients().length === 0) {
            <div
              class="flex flex-col items-center gap-3 rounded-3xl py-16 text-center"
              style="background: #F3F3F3;"
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C4B5AC"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <p class="text-sm font-semibold text-[#78716C]">Nenhum paciente encontrado</p>
              <p class="text-xs text-[#A8A29E]">Tente buscar com outro nome</p>
            </div>
          }

          @for (p of filteredPatients(); track p.treatmentId) {
            <button
              type="button"
              class="group flex w-full items-center gap-4 rounded-2xl cursor-pointer p-4 text-left transition hover:shadow-md md:gap-6 md:p-5"
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
                  <span
                    class="text-base font-bold text-[#1A1C1C] transition group-hover:text-[#7C5145]"
                  >
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
                    {{ p.completedCount }}/{{ p.procedureCount }} procedimento{{
                      p.procedureCount !== 1 ? 's' : ''
                    }}
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
              </div>

              <!-- Arrow -->
              <svg
                class="ml-1 shrink-0 text-[#C4B5AC] transition group-hover:translate-x-0.5 group-hover:text-[#7C5145]"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class TreatmentsListPageComponent implements OnInit {
  private router = inject(Router);
  private treatmentService = inject(TreatmentService);
  private platformId = inject(PLATFORM_ID);

  protected readonly searchQuery = signal('');
  protected loading = signal(true);
  protected loadError = signal<string | null>(null);
  private allPatients = signal<PatientSummary[]>([]);

  protected filteredPatients = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.allPatients();
    return this.allPatients().filter((p) => p.patientName.toLowerCase().includes(q));
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.load();
    }
  }

  protected load(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.treatmentService.getTreatmentList().subscribe({
      next: (items) => {
        this.allPatients.set(items.map(mapToSummary));
        this.loading.set(false);
      },
      error: (err) => {
        this.loadError.set(err?.message ?? 'Erro ao carregar tratamentos. Verifique sua conexão.');
        this.loading.set(false);
      },
    });
  }

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
