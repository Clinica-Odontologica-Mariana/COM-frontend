import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-patient-pagination',
  template: `
    <div
      class="flex flex-col gap-4 rounded-2xl bg-[#F3F3F3] px-6 py-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <p class="text-xs font-medium text-[#78716C]">
        Mostrando {{ showingFrom() }}–{{ showingTo() }} de {{ total() }} pacientes
      </p>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-lg p-2 text-[#A8A29E] disabled:opacity-40"
          [disabled]="page() <= 1"
          aria-label="Página anterior"
          (click)="pageChange.emit(page() - 1)"
        >
          <svg class="h-3 w-3" viewBox="0 0 8 12" fill="currentColor" aria-hidden="true">
            <path d="M6 0L0 6l6 6V0z" />
          </svg>
        </button>

        @for (pageNumber of pages(); track pageNumber) {
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition"
            [class.bg-[#7C5145]]="pageNumber === page()"
            [class.text-white]="pageNumber === page()"
            [class.text-[#78716C]]="pageNumber !== page()"
            (click)="pageChange.emit(pageNumber)"
          >
            {{ pageNumber }}
          </button>
        }

        <button
          type="button"
          class="rounded-lg p-2 text-[#A8A29E] disabled:opacity-40"
          [disabled]="page() >= totalPages()"
          aria-label="Próxima página"
          (click)="pageChange.emit(page() + 1)"
        >
          <svg class="h-3 w-3 rotate-180" viewBox="0 0 8 12" fill="currentColor" aria-hidden="true">
            <path d="M6 0L0 6l6 6V0z" />
          </svg>
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientPaginationComponent {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly total = input.required<number>();
  readonly pageSize = input.required<number>();

  readonly pageChange = output<number>();

  protected readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1),
  );

  protected showingFrom(): number {
    if (this.total() === 0) return 0;
    return (this.page() - 1) * this.pageSize() + 1;
  }

  protected showingTo(): number {
    return Math.min(this.page() * this.pageSize(), this.total());
  }
}
