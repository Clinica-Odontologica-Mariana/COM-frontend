import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AppointmentLocation, LOCATION_COLORS, LOCATION_LABELS } from '../../models/appointment.model';

@Component({
  selector: 'app-location-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rounded-2xl border border-[#D5C2BD]/10 bg-white p-4 shadow-sm">
      <h3 class="font-serif text-sm font-bold text-[#7C5145]">Filtrar Local</h3>

      <div class="mt-3 flex flex-col gap-2">
        <label class="flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            class="h-4 w-4 rounded-md border-2 border-[#83746F] accent-[#7C5145]"
            [checked]="allSelected()"
            (change)="toggleAll()"
          />
          <span class="text-[11px] font-medium text-[#1A1C1C]">Todos</span>
        </label>

        @for (loc of locations; track loc) {
          <label class="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              class="h-4 w-4 rounded-md border-2 border-[#83746F] accent-[#7C5145]"
              [checked]="isSelected(loc)"
              (change)="toggleLocation(loc)"
            />
            <span class="text-[11px] font-medium text-[#514440]">{{ LOCATION_LABELS[loc] }}</span>
            <span
              class="ml-auto h-1.5 w-1.5 rounded-full"
              [style.background-color]="LOCATION_COLORS[loc].dot"
            ></span>
          </label>
        }
      </div>
    </section>
  `,
})
export class LocationFiltersComponent {
  readonly selectedLocations = input<AppointmentLocation[]>([]);
  readonly selectedLocationsChange = output<AppointmentLocation[]>();

  protected readonly locations: AppointmentLocation[] = ['asa_sul', 'samambaia', 'taguatinga'];
  protected readonly LOCATION_LABELS = LOCATION_LABELS;
  protected readonly LOCATION_COLORS = LOCATION_COLORS;

  protected allSelected(): boolean {
    return this.selectedLocations().length === 0;
  }

  protected isSelected(loc: AppointmentLocation): boolean {
    const selected = this.selectedLocations();
    return selected.length > 0 && selected.includes(loc);
  }

  protected toggleAll(): void {
    this.selectedLocationsChange.emit([]);
  }

  protected toggleLocation(loc: AppointmentLocation): void {
    const current = this.selectedLocations();
    if (current.length === 0) {
      this.selectedLocationsChange.emit([loc]);
      return;
    }

    if (current.includes(loc)) {
      const next = current.filter((l) => l !== loc);
      this.selectedLocationsChange.emit(next.length === 0 ? [] : next);
    } else {
      const next = [...current, loc];
      if (next.length === this.locations.length) {
        this.selectedLocationsChange.emit([]);
      } else {
        this.selectedLocationsChange.emit(next);
      }
    }
  }
}
