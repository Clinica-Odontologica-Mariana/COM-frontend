import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CalendarViewMode } from '../../models/appointment.model';

@Component({
  selector: 'app-appointment-header',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header
      class="sticky top-0 z-10 flex flex-col gap-3 bg-[#F9F9F9]/80 px-4 py-3 backdrop-blur-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4 lg:px-8"
    >
      <div class="flex items-center justify-between gap-3 sm:justify-start sm:gap-6">
        <h1 class="font-serif text-xl font-bold tracking-tight text-[#7C5145] sm:text-2xl">Agenda</h1>

        <div class="flex rounded-full bg-[#EEEEEE] p-0.5 sm:order-none">
          <button
            type="button"
            class="rounded-full px-4 py-1 text-xs font-semibold transition"
            [class.bg-white]="viewMode() === 'month'"
            [class.text-[#7C5145]]="viewMode() === 'month'"
            [class.shadow-sm]="viewMode() === 'month'"
            [class.text-[#514440]]="viewMode() !== 'month'"
            (click)="viewModeChange.emit('month')"
          >
            Mês
          </button>
          <button
            type="button"
            class="rounded-full px-4 py-1 text-xs font-medium transition"
            [class.bg-white]="viewMode() === 'week'"
            [class.text-[#7C5145]]="viewMode() === 'week'"
            [class.shadow-sm]="viewMode() === 'week'"
            [class.text-[#514440]]="viewMode() !== 'week'"
            (click)="viewModeChange.emit('week')"
          >
            Semana
          </button>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2 sm:gap-3">
        <div
          class="hidden items-center gap-1.5 rounded-full border border-[#D5C2BD]/10 bg-[#F3F3F3] px-3 py-1.5 md:flex"
          title="Integração com Google Calendar via backend em breve"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-[#10B981]"></span>
          <span class="text-[10px] font-medium text-[#514440]">Sincronizado com Google Calendar</span>
        </div>

        <a
          routerLink="/agenda/novo"
          class="inline-flex items-center gap-2 rounded-full bg-[#7C5145] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#6B4539] sm:px-4"
        >
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span class="hidden font-serif sm:inline">Novo Agendamento</span>
          <span class="font-serif sm:hidden">Novo</span>
        </a>

        @if (searchOpen()) {
          <div class="flex w-full min-w-0 flex-1 items-center gap-2 sm:w-auto sm:flex-none">
            <div class="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-full bg-[#EEEEEE] px-3 sm:min-w-[200px] md:min-w-[240px]">
              <svg class="h-4 w-4 shrink-0 text-[#7C5145]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                #searchInput
                type="search"
                class="w-full bg-transparent text-sm text-[#514440] outline-none placeholder:text-[#A8A29E]"
                placeholder="Buscar agendamentos..."
                [value]="searchQuery()"
                (input)="onSearchInput($event)"
              />
            </div>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-full text-[#78716C] transition hover:bg-[#EEEEEE]"
              aria-label="Fechar busca"
              (click)="closeSearch()"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        } @else {
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEEEEE] text-[#7C5145] transition hover:bg-[#E7E5E4]"
            aria-label="Buscar agendamentos"
            (click)="openSearch()"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        }
      </div>
    </header>
  `,
})
export class AppointmentHeaderComponent {
  readonly viewMode = input.required<CalendarViewMode>();
  readonly searchQuery = input('');
  readonly viewModeChange = output<CalendarViewMode>();
  readonly searchQueryChange = output<string>();

  protected readonly searchOpen = signal(false);
  private readonly searchInputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  protected openSearch(): void {
    this.searchOpen.set(true);
    setTimeout(() => this.searchInputRef()?.nativeElement.focus(), 0);
  }

  protected closeSearch(): void {
    this.searchOpen.set(false);
    this.searchQueryChange.emit('');
  }

  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQueryChange.emit(value);
  }
}
