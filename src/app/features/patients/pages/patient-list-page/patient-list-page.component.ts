import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';
import { ToastService } from '../../../../core/services/toast.service';
import { PatientFiltersComponent } from '../../components/patient-filters/patient-filters.component';
import {
  BreadcrumbItem,
  PatientPageHeaderComponent,
} from '../../components/patient-page-header/patient-page-header.component';
import { PatientPaginationComponent } from '../../components/patient-pagination/patient-pagination.component';
import { PatientTableComponent } from '../../components/patient-table/patient-table.component';
import { Patient, PatientFilters } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-list-page',
  imports: [
    RouterLink,
    PatientPageHeaderComponent,
    PatientFiltersComponent,
    PatientTableComponent,
    PatientPaginationComponent,
  ],
  template: `
    <div class="min-h-full pb-12">
      <app-patient-page-header title="Pacientes" [breadcrumbs]="breadcrumbs">
        <a
          routerLink="/patients/new"
          class="rounded-xl bg-[#7C5145] px-8 py-2 text-base font-bold text-white shadow-lg shadow-[#7C5145]/20 transition hover:bg-[#6a453b]"
        >
          Novo Cadastro
        </a>
      </app-patient-page-header>

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
          <app-patient-table [patients]="patients()" (deletePatient)="onDelete($event)" />

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
export class PatientListPageComponent {
  private readonly patientService = inject(PatientService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);

  protected readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Cadastro de Pacientes', link: '/patients' },
    { label: 'Listagem' },
  ];

  protected readonly filters = signal<PatientFilters>({
    name: '',
    cpf: '',
    status: '',
  });
  protected readonly patients = signal<Patient[]>([]);
  protected readonly page = signal(1);
  protected readonly total = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly loading = signal(true);

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

  protected onDelete(id: string): void {
    const patient = this.patients().find((item) => item.id === id);
    const name = patient?.fullName ?? 'este paciente';

    this.confirmDialog
      .confirm(`Deseja excluir ${name}?`, 'Excluir paciente')
      .pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.patientService
          .delete(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.toast.success('Paciente excluído com sucesso.');
              this.loadPatients();
            },
            error: () => this.toast.error('Não foi possível excluir o paciente.'),
          });
      });
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
