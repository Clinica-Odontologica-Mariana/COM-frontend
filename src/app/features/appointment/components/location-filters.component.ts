import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ScheduleOptionsApi, WorkplaceOption } from '../api/schedule-options.api';

@Component({
  selector: 'app-location-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rounded-2xl border border-[#D5C2BD]/10 bg-white p-4 shadow-sm">
      <h3 class="font-serif text-sm font-bold text-[#7C5145]">Filtrar Local</h3>

      <div class="mt-3 flex flex-col gap-2">
        @if (loading()) {
          @for (_ of skeletonRows; track $index) {
            <div class="h-5 animate-pulse rounded bg-[#F3F3F3]"></div>
          }
        } @else {
          <label class="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              class="h-4 w-4 rounded-md border-2 border-[#83746F] accent-[#7C5145]"
              [checked]="allSelected()"
              (change)="toggleAll()"
            />
            <span class="text-[11px] font-medium text-[#1A1C1C]">Todos</span>
          </label>

          @for (wp of workplaces(); track wp.id) {
            <label class="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                class="h-4 w-4 rounded-md border-2 border-[#83746F] accent-[#7C5145]"
                [checked]="isSelected(wp.id)"
                (change)="toggle(wp.id)"
              />
              <span class="text-[11px] font-medium text-[#514440]">{{ wp.name }}</span>
            </label>
          }

          @if (!loading() && workplaces().length === 0) {
            <p class="text-[11px] text-[#78716C]">Nenhum local disponível.</p>
          }
        }
      </div>
    </section>
  `,
})
export class LocationFiltersComponent {
  private readonly scheduleOptionsApi = inject(ScheduleOptionsApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly selectedLocations = input<string[]>([]);
  readonly selectedLocationsChange = output<string[]>();

  protected readonly workplaces = signal<WorkplaceOption[]>([]);
  protected readonly loading = signal(true);
  protected readonly skeletonRows = [1, 2, 3];

  constructor() {
    this.scheduleOptionsApi
      .listWorkplaces()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ws) => {
          this.workplaces.set(ws);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  protected allSelected(): boolean {
    return this.selectedLocations().length === 0;
  }

  protected isSelected(id: string): boolean {
    const selected = this.selectedLocations();
    return selected.length > 0 && selected.includes(id);
  }

  protected toggleAll(): void {
    this.selectedLocationsChange.emit([]);
  }

  protected toggle(id: string): void {
    const current = this.selectedLocations();

    if (current.length === 0) {
      this.selectedLocationsChange.emit([id]);
      return;
    }

    if (current.includes(id)) {
      const next = current.filter((l) => l !== id);
      this.selectedLocationsChange.emit(next);
    } else {
      this.selectedLocationsChange.emit([...current, id]);
    }
  }
}
