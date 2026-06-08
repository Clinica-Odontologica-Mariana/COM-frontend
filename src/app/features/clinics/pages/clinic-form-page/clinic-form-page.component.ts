import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClinicFormDrawerComponent } from '../../components/clinic-form-drawer/clinic-form-drawer.component';
import { ClinicsMockService } from '../../data/clinics-mock.service';
import { ClinicCardViewModel, ClinicFormValue, toClinicCardViewModel } from '../../models/clinic.models';

@Component({
  selector: 'app-clinic-form-page',
  imports: [ClinicFormDrawerComponent],
  template: `
    @if (loading()) {
      <div class="min-h-screen bg-[#F9F9F9]" style="font-family: 'Manrope', sans-serif">
        <section class="mx-auto flex w-full max-w-350 flex-col gap-8 px-6 py-8 md:px-10 xl:px-12">
          <div class="h-24 animate-pulse rounded-3xl bg-white"></div>
          <div class="h-180 animate-pulse rounded-4xl bg-white"></div>
        </section>
      </div>
    } @else {
      <app-clinic-form-drawer
        [clinic]="clinic()"
        [saving]="saving()"
        [errorMessage]="pageError()"
        (cancel)="goBack()"
        (save)="saveClinic($event)"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClinicFormPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clinicsMockService = inject(ClinicsMockService);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly pageError = signal<string | null>(null);
  protected readonly clinic = signal<ClinicCardViewModel | null>(null);

  ngOnInit(): void {
    const clinicId = this.route.snapshot.paramMap.get('id');

    if (!clinicId) {
      this.loading.set(false);
      return;
    }

    this.clinicsMockService.findById(clinicId).subscribe({
      next: (clinic) => {
        this.clinic.set(toClinicCardViewModel(clinic));
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.pageError.set(error.message || 'Não foi possível carregar a clínica.');
        this.loading.set(false);
      },
    });
  }

  protected goBack(): void {
    void this.router.navigate(['/clinics']);
  }

  protected saveClinic(payload: ClinicFormValue): void {
    this.saving.set(true);
    this.pageError.set(null);

    const clinicId = this.route.snapshot.paramMap.get('id');
    const request = clinicId
      ? this.clinicsMockService.update(clinicId, payload)
      : this.clinicsMockService.create(payload);

    request.subscribe({
      next: () => {
        void this.router.navigate(['/clinics'], {
          state: {
            feedbackMessage: clinicId
              ? 'Clínica atualizada com sucesso no ambiente mockado.'
              : 'Clínica cadastrada com sucesso no ambiente mockado.',
            feedbackKind: 'success',
          },
        });
      },
      error: (error: Error) => {
        this.saving.set(false);
        this.pageError.set(error.message || 'Não foi possível salvar a clínica.');
      },
    });
  }
}
