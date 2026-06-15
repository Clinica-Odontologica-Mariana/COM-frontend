import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-history-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-t border-stone-200 bg-stone-50/50">
      <div class="flex items-center gap-3 text-[11px] text-stone-500">
        <span>
          Mostrando
          <strong class="text-stone-700">{{ rangeStart }}-{{ rangeEnd }}</strong>
          de
          <strong class="text-stone-700">{{ total }}</strong>
        </span>
        <label class="flex items-center gap-1.5">
          <span class="hidden sm:inline">por página</span>
          <select
            [ngModel]="pageSize"
            (ngModelChange)="pageSizeChange.emit(+$event)"
            class="px-2 py-1 border border-stone-200 rounded-md text-xs bg-white focus:outline-none"
          >
            <option *ngFor="let s of pageSizeOptions" [ngValue]="s">{{ s }}</option>
          </select>
        </label>
      </div>

      <div class="flex items-center gap-1">
        <button type="button" (click)="go(1)" [disabled]="page === 1"
          class="px-2.5 py-1.5 rounded-md text-xs font-bold text-stone-600 border border-stone-200 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed">
          «
        </button>
        <button type="button" (click)="go(page - 1)" [disabled]="page === 1"
          class="px-2.5 py-1.5 rounded-md text-xs font-bold text-stone-600 border border-stone-200 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed">
          ‹
        </button>

        <ng-container *ngFor="let p of visiblePages; trackBy: trackPage">
          <span *ngIf="p === '…'" class="px-2 text-stone-400 text-xs">…</span>
          <button *ngIf="p !== '…'"
            type="button"
            (click)="go(+p)"
            [class.bg-stone-800]="p === page"
            [class.text-white]="p === page"
            [class.border-stone-800]="p === page"
            [class.text-stone-700]="p !== page"
            class="min-w-8 px-2.5 py-1.5 rounded-md text-xs font-bold border border-stone-200 hover:bg-stone-100 transition-colors"
          >
            {{ p }}
          </button>
        </ng-container>

        <button type="button" (click)="go(page + 1)" [disabled]="page === totalPages"
          class="px-2.5 py-1.5 rounded-md text-xs font-bold text-stone-600 border border-stone-200 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed">
          ›
        </button>
        <button type="button" (click)="go(totalPages)" [disabled]="page === totalPages"
          class="px-2.5 py-1.5 rounded-md text-xs font-bold text-stone-600 border border-stone-200 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed">
          »
        </button>
      </div>
    </nav>
  `,
})
export class HistoryPaginationComponent {
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() total = 0;
  @Input() totalPages = 1;
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get rangeStart(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }
  get rangeEnd(): number {
    return Math.min(this.page * this.pageSize, this.total);
  }

  /** Lista compacta de páginas: 1 … 4 5 [6] 7 8 … 20 */
  get visiblePages(): (number | '…')[] {
    const total = this.totalPages;
    const current = this.page;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: (number | '…')[] = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    if (start > 2) pages.push('…');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push('…');
    pages.push(total);
    return pages;
  }

  protected go(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.pageChange.emit(p);
  }

  protected trackPage(_: number, item: number | '…'): string | number {
    return item;
  }
}