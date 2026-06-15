import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppointmentHeaderComponent } from '../components/appointment-header.component';
import {
  Appointment,
  CalendarDay,
  CalendarViewMode,
  WeekDayColumn,
} from '../models/appointment.model';
import { AppointmentService } from '../services/appointment.service';
import { buildMonthGrid, buildWeekColumns, formatMonthYear } from '../utils/calendar.utils';
import { CalendarWeekGridComponent } from '../components/calendar-week-grid.component';
import { LocationFiltersComponent } from '../components/location-filters.component';
import { UpcomingAppointmentsComponent } from '../components/upcoming-appointments.component';
import { CalendarMonthGridComponent } from '../components/calendar-month-grid.component';

@Component({
  selector: 'app-appointment-main-page',
  imports: [
    AppointmentHeaderComponent,
    CalendarMonthGridComponent,
    CalendarWeekGridComponent,
    LocationFiltersComponent,
    UpcomingAppointmentsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-full flex-col">
      <app-appointment-header
        [viewMode]="viewMode()"
        [searchQuery]="searchQuery()"
        (viewModeChange)="setViewMode($event)"
        (searchQueryChange)="onSearchChange($event)"
      />

      @if (searchQuery()) {
        <p class="px-4 text-sm text-[#78716C] sm:px-6 lg:px-8">
          @if (hasSearchResults()) {
            Resultados para "<span class="font-medium text-[#514440]">{{ searchQuery() }}</span
            >"
          } @else {
            Nenhum agendamento encontrado para "<span class="font-medium text-[#514440]">{{
              searchQuery()
            }}</span
            >"
          }
        </p>
      }

      <div class="flex flex-1 flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:px-8">
        <div class="min-w-0 flex-1 lg:pl-2">
          <div class="mb-4 flex items-center justify-between gap-2">
            <h2 class="font-serif text-base font-bold text-[#514440] sm:text-lg">
              {{ monthLabel() }}
            </h2>
            <div class="flex shrink-0 gap-1 sm:gap-2">
              <button
                type="button"
                class="rounded-lg border border-[#D5C2BD]/20 px-2.5 py-1 text-sm text-[#514440] hover:bg-white sm:px-3"
                (click)="prevPeriod()"
                aria-label="Período anterior"
              >
                ‹
              </button>
              <button
                type="button"
                class="rounded-lg border border-[#D5C2BD]/20 px-2.5 py-1 text-xs font-medium text-[#514440] hover:bg-white sm:px-3 sm:text-sm"
                (click)="goToday()"
              >
                Hoje
              </button>
              <button
                type="button"
                class="rounded-lg border border-[#D5C2BD]/20 px-2.5 py-1 text-sm text-[#514440] hover:bg-white sm:px-3"
                (click)="nextPeriod()"
                aria-label="Próximo período"
              >
                ›
              </button>
            </div>
          </div>

          @if (viewMode() === 'month') {
            <app-calendar-month-grid [days]="monthDays()" [appointments]="appointments()" />
          } @else {
            <app-calendar-week-grid [columns]="weekColumns()" [appointments]="appointments()" />
          }
        </div>

        <aside class="flex w-full shrink-0 flex-col gap-4 lg:w-72 xl:w-80">
          <app-location-filters
            [selectedLocations]="selectedLocations()"
            (selectedLocationsChange)="onLocationsChange($event)"
          />
          <app-upcoming-appointments [appointments]="upcoming()" />
        </aside>
      </div>
    </div>
  `,
})
export class AppointmentMainPageComponent {
  private readonly appointmentService = inject(AppointmentService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly viewMode = signal<CalendarViewMode>('month');
  protected readonly currentDate = signal(new Date());
  protected readonly selectedLocations = signal<string[]>([]);
  protected readonly searchQuery = signal('');
  protected readonly appointments = signal<Appointment[]>([]);
  protected readonly upcoming = signal<Appointment[]>([]);
  protected readonly monthDays = signal<CalendarDay[]>([]);
  protected readonly weekColumns = signal<WeekDayColumn[]>([]);

  protected readonly monthLabel = computed(() =>
    formatMonthYear(this.currentDate().getFullYear(), this.currentDate().getMonth()),
  );

  constructor() {
    this.refreshCalendar();
    this.loadUpcoming();
  }

  protected setViewMode(mode: CalendarViewMode): void {
    this.viewMode.set(mode);
    this.refreshCalendar();
  }

  protected onLocationsChange(locations: string[]): void {
    this.selectedLocations.set(locations);
    this.refreshCalendar();
    this.loadUpcoming();
  }

  protected onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.refreshCalendar();
    this.loadUpcoming();
  }

  protected hasSearchResults(): boolean {
    return this.appointments().length > 0 || this.upcoming().length > 0;
  }

  protected prevPeriod(): void {
    const d = new Date(this.currentDate());
    if (this.viewMode() === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else {
      d.setDate(d.getDate() - 7);
    }
    this.currentDate.set(d);
    this.refreshCalendar();
  }

  protected nextPeriod(): void {
    const d = new Date(this.currentDate());
    if (this.viewMode() === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else {
      d.setDate(d.getDate() + 7);
    }
    this.currentDate.set(d);
    this.refreshCalendar();
  }

  protected goToday(): void {
    this.currentDate.set(new Date());
    this.refreshCalendar();
  }

  private refreshCalendar(): void {
    const d = this.currentDate();
    const year = d.getFullYear();
    const month = d.getMonth();
    const locations = this.selectedLocations();
    const locFilter = locations.length > 0 ? locations : null;

    this.monthDays.set(buildMonthGrid(year, month));
    this.weekColumns.set(buildWeekColumns(d));

    if (this.viewMode() === 'month') {
      this.appointmentService
        .listByMonth(year, month, locFilter)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (items) => this.appointments.set(this.applySearch(items)),
          error: () => this.appointments.set([]),
        });
    } else {
      const cols = buildWeekColumns(d);
      const start = cols[0].isoDate;
      const end = cols[6].isoDate;
      this.appointmentService
        .listByDateRange(start, end, locFilter)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (items) => this.appointments.set(this.applySearch(items)),
          error: () => this.appointments.set([]),
        });
    }
  }

  private loadUpcoming(): void {
    const locations = this.selectedLocations();
    const locFilter = locations.length > 0 ? locations : null;
    const searching = this.searchQuery().trim().length > 0;
    this.appointmentService
      .listUpcoming(searching ? null : 5, locFilter)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => this.upcoming.set(this.applySearch(items)),
        error: () => this.upcoming.set([]),
      });
  }

  private applySearch(items: Appointment[]): Appointment[] {
    return this.appointmentService.filterBySearch(items, this.searchQuery());
  }
}
