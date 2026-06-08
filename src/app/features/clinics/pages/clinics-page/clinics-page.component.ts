import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ClinicCardComponent } from '../../components/clinic-card/clinic-card.component';
import { ClinicEmptyStateComponent } from '../../components/clinic-empty-state/clinic-empty-state.component';
import { ClinicPageHeaderComponent } from '../../components/clinic-page-header/clinic-page-header.component';
import { ClinicsMockService } from '../../data/clinics-mock.service';
import { ClinicCardViewModel, toClinicCardViewModel } from '../../models/clinic.models';

@Component({
  selector: 'app-clinics-page',
  imports: [ClinicCardComponent, ClinicEmptyStateComponent, ClinicPageHeaderComponent],
  template: `
    <div class="min-h-screen bg-[#F9F9F9]" style="font-family: 'Manrope', sans-serif">
      <section class="mx-auto flex w-full max-w-350 flex-col gap-10 px-6 py-8 md:px-10 xl:px-12">
        <app-clinic-page-header (create)="openCreatePage()" />

        @if (feedback()) {
          <div
            class="rounded-2xl border px-4 py-3 text-sm"
            [class.border-[#D7E8DA]]="feedbackKind() === 'success'"
            [class.bg-[#F3FBF4]]="feedbackKind() === 'success'"
            [class.text-[#346243]]="feedbackKind() === 'success'"
            [class.border-[#E9C9C0]]="feedbackKind() === 'error'"
            [class.bg-[#FFF6F4]]="feedbackKind() === 'error'"
            [class.text-[#A34D43]]="feedbackKind() === 'error'"
          >
            {{ feedback() }}
          </div>
        }

        @if (loading()) {
          <section class="grid gap-6 lg:grid-cols-2">
            @for (_ of skeletonCards; track $index) {
              <article class="overflow-hidden rounded-4xl border border-[#EFE7E3] bg-white">
                <div class="h-64 animate-pulse bg-[#EAE4E0]"></div>
                <div class="space-y-4 p-8">
                  <div class="h-7 w-48 animate-pulse rounded-full bg-[#EEE8E4]"></div>
                  <div class="h-4 w-full animate-pulse rounded-full bg-[#F3EEEB]"></div>
                  <div class="h-4 w-40 animate-pulse rounded-full bg-[#F3EEEB]"></div>
                </div>
              </article>
            }
          </section>
        } @else if (!visibleClinics().length) {
          <app-clinic-empty-state (create)="openCreatePage()" />
        } @else {
          <section class="grid gap-6 lg:grid-cols-2">
            @for (clinic of visibleClinics(); track clinic.id) {
              <app-clinic-card [clinic]="clinic" (edit)="openEditPage($event)" />
            }
          </section>
        }
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClinicsPageComponent implements OnInit {
  private readonly clinicsMockService = inject(ClinicsMockService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly skeletonCards = Array.from({ length: 3 });
  protected readonly loading = signal(true);
  protected readonly feedback = signal<string | null>(null);
  protected readonly feedbackKind = signal<'success' | 'error'>('success');
  protected readonly clinics = signal<ClinicCardViewModel[]>([]);

  protected readonly visibleClinics = computed(() =>
    this.clinics()
      .filter((clinic) => clinic.active)
      .sort((left, right) => left.name.localeCompare(right.name, 'pt-BR')),
  );

  ngOnInit(): void {
    this.hydrateNavigationFeedback();
    this.loadClinics();
  }

  protected openCreatePage(): void {
    void this.router.navigate(['/clinics/new']);
  }

  protected openEditPage(clinic: ClinicCardViewModel): void {
    void this.router.navigate(['/clinics', clinic.id, 'edit']);
  }

  private hydrateNavigationFeedback(): void {
    const state = history.state as {
      feedbackKind?: 'success' | 'error';
      feedbackMessage?: string;
    };

    if (!state.feedbackMessage) {
      return;
    }

    this.feedbackKind.set(state.feedbackKind ?? 'success');
    this.feedback.set(state.feedbackMessage);
    this.location.replaceState(this.router.url);
  }

  private loadClinics(): void {
    this.loading.set(true);

    this.clinicsMockService.list().subscribe({
      next: (clinics) => {
        this.clinics.set(clinics.map(toClinicCardViewModel));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.feedbackKind.set('error');
        this.feedback.set('Não foi possível carregar as clínicas mockadas.');
      },
    });
  }
}
