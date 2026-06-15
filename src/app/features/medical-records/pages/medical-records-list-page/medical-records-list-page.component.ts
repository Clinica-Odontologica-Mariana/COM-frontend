import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import {
  BreadcrumbItem,
  PatientPageHeaderComponent,
} from '../../../patients/components/patient-page-header/patient-page-header.component';
import { PatientFiltersComponent } from '../../../patients/components/patient-filters/patient-filters.component';
import { PatientPaginationComponent } from '../../../patients/components/patient-pagination/patient-pagination.component';
import { Patient, PatientFilters } from '../../../patients/models/patient.model';
import { PatientService } from '../../../patients/services/patient.service';
import { formatCpf, getInitials } from '../../../patients/utils/format.utils';

@Component({
  selector: 'app-medical-records-list-page',
  imports: [RouterLink, PatientPageHeaderComponent, PatientFiltersComponent, PatientPaginationComponent],
  template: `
    <div class="min-h-full pb-12">
      <app-patient-page-header title="Prontuários" [breadcrumbs]="breadcrumbs" />

      <div class="space-y-6 px-6 lg:px-8">
        <app-patient-filters
          [filters]="filters()"
          (filtersChange)="onFiltersChange($event)"
          (filter)="loadPatients()"
          (clear)="clearFilters()"
        />

        @if (loading()) {
          <p class="py-12 text-center text-sm text-[#78716C]">Carregando pacientes...</p>
        } @else {
          <section class="overflow-hidden rounded-3xl bg-white shadow-sm my-5">
            <div class="overflow-x-auto">
              <table class="min-w-full">
                <thead class="bg-[#F3F3F3]">
                  <tr class="text-left text-[11px] font-bold uppercase tracking-wider text-[#A8A29E]">
                    <th class="px-8 py-5"></th>
                    <th class="px-6 py-5">Nome do paciente</th>
                    <th class="px-6 py-5">CPF</th>
                    <th class="px-6 py-5">Telefone</th>
                    <th class="px-6 py-5">Status</th>
                    <th class="px-8 py-5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  @for (patient of patients(); track patient.id) {
                    <tr
                      class="cursor-pointer border-t border-[#FAFAF9] transition hover:bg-[#FAFAF9]"
                      (click)="openRecord(patient.id)"
                    >
                      <td class="px-8 py-6">
                        <div
                          class="flex h-10 w-10 items-center justify-center rounded-full border border-[#F5F5F4] bg-[#F5DECB] text-xs font-bold text-[#7C5145]"
                        >
                          {{ getInitials(patient.fullName) }}
                        </div>
                      </td>
                      <td class="px-6 py-6">
                        <p class="text-base font-semibold text-[#7C5145]">{{ patient.fullName }}</p>
                        <p class="text-[11px] text-[#A8A29E]">#{{ patient.registrationNumber }}</p>
                      </td>
                      <td class="px-6 py-6 text-sm font-medium text-[#78716C]">
                        {{ formatCpf(patient.cpf) }}
                      </td>
                      <td class="px-6 py-6 text-sm text-[#78716C]">
                        {{ patient.phone || '—' }}
                      </td>
                      <td class="px-6 py-6">
                        @if (patient.status === 'active') {
                          <span class="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            Ativo
                          </span>
                        } @else {
                          <span class="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-500">
                            Inativo
                          </span>
                        }
                      </td>
                      <td class="px-8 py-6" (click)="$event.stopPropagation()">
                        <div class="flex items-center justify-end">
                          <a
                            [routerLink]="['/medical-records', patient.id]"
                            class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#7C5145] transition hover:bg-[#F5EFEC]"
                            aria-label="Ver prontuário"
                          >
                            <svg
                              class="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                            </svg>
                            Ver prontuário
                          </a>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="6" class="px-8 py-16 text-center">
                        <p class="text-sm text-[#78716C]">Nenhum paciente encontrado.</p>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>

          @if (total() > 0) {
            <app-patient-pagination
              [page]="page()"
              [totalPages]="totalPages()"
              [total]="total()"
              [pageSize]="pageSize()"
              (pageChange)="onPageChange($event)"
            />
          }
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicalRecordsListPageComponent {
  private readonly patientService = inject(PatientService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Prontuários', link: '/medical-records' },
    { label: 'Buscar paciente' },
  ];

  protected readonly filters = signal<PatientFilters>({ name: '', cpf: '', status: '' });
  protected readonly patients = signal<Patient[]>([]);
  protected readonly page = signal(1);
  protected readonly total = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly loading = signal(true);

  protected readonly formatCpf = formatCpf;
  protected readonly getInitials = getInitials;

  constructor() {
    this.loadPatients();
  }

  protected onFiltersChange(filters: PatientFilters): void {
    this.filters.set(filters);
  }

  protected clearFilters(): void {
    this.filters.set({ name: '', cpf: '', status: '' });
    this.page.set(1);
    this.loadPatients();
  }

  protected onPageChange(page: number): void {
    this.page.set(page);
    this.loadPatients();
  }

  protected openRecord(id: string): void {
    void this.router.navigate(['/medical-records', id]);
  }

  protected loadPatients(): void {
    this.loading.set(true);
    this.patientService
      .list(this.filters(), this.page())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.patients.set(result.items);
          this.total.set(result.total);
          this.totalPages.set(result.totalPages);
          this.page.set(result.page);
          this.pageSize.set(result.pageSize);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
