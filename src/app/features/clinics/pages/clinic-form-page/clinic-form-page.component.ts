import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ClinicFormDrawerComponent } from '../../components/clinic-form-drawer/clinic-form-drawer.component';
import { ClinicsMockService } from '../../data/clinics-mock.service';
import { ClinicFormValue } from '../../models/clinic.models';

@Component({
  selector: 'app-clinic-form-page',
  imports: [ClinicFormDrawerComponent],
  template: `
    <app-clinic-form-drawer
      [saving]="saving()"
      [errorMessage]="pageError()"
      (cancel)="goBack()"
      (save)="saveClinic($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClinicFormPageComponent {
  private readonly router = inject(Router);
  private readonly clinicsMockService = inject(ClinicsMockService);

  protected readonly saving = signal(false);
  protected readonly pageError = signal<string | null>(null);

  protected goBack(): void {
    void this.router.navigate(['/clinics']);
  }

  protected saveClinic(payload: ClinicFormValue): void {
    this.saving.set(true);
    this.pageError.set(null);

    this.clinicsMockService.create(payload).subscribe({
      next: () => {
        void this.router.navigate(['/clinics']);
      },
      error: (error: Error) => {
        this.saving.set(false);
        this.pageError.set(error.message || 'Não foi possível salvar a clínica.');
      },
    });
  }
}
