import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  Appointment,
  AppointmentStatus,
  STATUS_LABELS,
} from '../models/appointment.model';
import { AppointmentService } from '../services/appointment.service';
import { AppointmentListCardComponent } from '../components/appointment-list-card.component';
import { LocationFiltersComponent } from '../components/location-filters.component';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-appointments-list-page',
  imports: [RouterLink, AppointmentListCardComponent, LocationFiltersComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-full bg-[#F9F9F9]">
      <div class="mx-auto max-w-3xl px-6 py-10 lg:px-8">
        <nav class="mb-4 flex items-center gap-2 text-sm text-[#78716C]" aria-label="Breadcrumb">
          <a routerLink="/schedule" class="transition hover:text-[#7C5145]">Agenda</a>
          <span aria-hidden="true">›</span>
          <span class="text-[#514440]">Agendamentos</span>
        </nav>

        <div class="mb-8">
          <h1 class="font-serif text-3xl font-bold text-[#7C5145] md:text-4xl">Agendamentos</h1>
          <p class="mt-2 text-base text-[#69594A]">
            Todos os atendimentos futuros, em ordem cronológica.
          </p>
        </div>

        <div class="mb-6 space-y-4">
          <div class="relative">
            <input
              type="search"
              class="h-11 w-full rounded-xl bg-white px-4 pr-10 text-sm text-[#57534E] shadow-sm outline-none placeholder:text-[#A8A29E]"
              placeholder="Buscar por paciente, procedimento ou referência..."
              [value]="searchQuery()"
              (input)="onSearchChange($event)"
            />
            <svg
              class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A8A29E]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" />
            </svg>
          </div>

          <div class="grid gap-4 lg:grid-cols-2">
            <app-location-filters
              [selectedLocations]="selectedLocations()"
              (selectedLocationsChange)="onLocationsChange($event)"
            />

            <div class="rounded-2xl border border-[#D5C2BD]/10 bg-white p-4 shadow-sm">
              <label for="status-filter" class="font-serif text-sm font-bold text-[#7C5145]">
                Status
              </label>
              <select
                id="status-filter"
                class="mt-3 h-11 w-full rounded-xl bg-[#EEEEEE] px-4 text-sm text-[#57534E] outline-none"
                [value]="statusFilter()"
                (change)="onStatusChange($event)"
              >
                <option value="">Todos os status</option>
                @for (status of statusOptions; track status) {
                  <option [value]="status">{{ STATUS_LABELS[status] }}</option>
                }
              </select>
            </div>
          </div>
        </div>

        @if (loading()) {
          <p class="rounded-xl bg-white p-8 text-center text-sm text-[#78716C] shadow-sm">
            Carregando agendamentos...
          </p>
        } @else {
          <div class="flex flex-col gap-3">
            @for (apt of paginatedAppointments(); track apt.id) {
              <app-appointment-list-card [appointment]="apt" [showStatus]="true" />
            } @empty {
              <p class="rounded-xl bg-white p-8 text-center text-sm text-[#78716C] shadow-sm">
                Nenhum agendamento encontrado.
              </p>
            }
          </div>
        }

        @if (total() > 0) {
          <div
            class="mt-6 flex flex-col gap-4 rounded-2xl bg-[#F3F3F3] px-6 py-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <p class="text-xs font-medium text-[#78716C]">
              Mostrando {{ showingFrom() }}–{{ showingTo() }} de {{ total() }} agendamentos
            </p>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="rounded-lg p-2 text-[#A8A29E] disabled:opacity-40"
                [disabled]="page() <= 1"
                aria-label="Página anterior"
                (click)="goToPage(page() - 1)"
              >
                ‹
              </button>
              @for (pageNumber of pages(); track pageNumber) {
                <button
                  type="button"
                  class="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition"
                  [class.bg-[#7C5145]]="pageNumber === page()"
                  [class.text-white]="pageNumber === page()"
                  [class.text-[#78716C]]="pageNumber !== page()"
                  (click)="goToPage(pageNumber)"
                >
                  {{ pageNumber }}
                </button>
              }
              <button
                type="button"
                class="rounded-lg p-2 text-[#A8A29E] disabled:opacity-40"
                [disabled]="page() >= totalPages()"
                aria-label="Próxima página"
                (click)="goToPage(page() + 1)"
              >
                ›
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class AppointmentsListPageComponent {
  private readonly appointmentService = inject(AppointmentService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly STATUS_LABELS = STATUS_LABELS;
  protected readonly statusOptions: AppointmentStatus[] = ['confirmed', 'pending', 'cancelled'];

  protected readonly allAppointments = signal<Appointment[]>([]);
  protected readonly loading = signal(true);
  protected readonly searchQuery = signal('');
  protected readonly selectedLocations = signal<string[]>([]);
  protected readonly statusFilter = signal<AppointmentStatus | ''>('');
  protected readonly page = signal(1);

  protected readonly filteredAppointments = computed(() => {
    let items = this.allAppointments();

    const locations = this.selectedLocations();
    if (locations.length > 0) {
      items = items.filter(
        (apt) => apt.isBlocked || (apt.workplaceId != null && locations.includes(apt.workplaceId)),
      );
    }

    const status = this.statusFilter();
    if (status) {
      items = items.filter((apt) => apt.status === status);
    }

    return this.appointmentService.filterBySearch(items, this.searchQuery());
  });

  protected readonly total = computed(() => this.filteredAppointments().length);

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / PAGE_SIZE)));

  protected readonly paginatedAppointments = computed(() => {
    const safePage = Math.min(this.page(), this.totalPages());
    const start = (safePage - 1) * PAGE_SIZE;
    return this.filteredAppointments().slice(start, start + PAGE_SIZE);
  });

  protected readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1),
  );

  constructor() {
    this.appointmentService
      .listUpcoming(null)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((items) => {
        this.allAppointments.set(items);
        this.loading.set(false);
      });
  }

  protected onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.page.set(1);
  }

  protected onLocationsChange(locations: string[]): void {
    this.selectedLocations.set(locations);
    this.page.set(1);
  }

  protected onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as AppointmentStatus | '';
    this.statusFilter.set(value);
    this.page.set(1);
  }

  protected goToPage(page: number): void {
    this.page.set(Math.min(Math.max(page, 1), this.totalPages()));
  }

  protected showingFrom(): number {
    if (this.total() === 0) return 0;
    return (this.page() - 1) * PAGE_SIZE + 1;
  }

  protected showingTo(): number {
    return Math.min(this.page() * PAGE_SIZE, this.total());
  }
}
