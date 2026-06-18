import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type PanelCardType = 'revenue' | 'expense' | 'balance';

@Component({
  selector: 'app-panel-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="p-6 rounded-xl flex flex-col gap-1 w-full transition-all"
      [ngClass]="containerClass"
    >
      <div class="flex justify-between items-start mb-2">
        <div
          class="w-12 h-12 rounded-lg flex items-center justify-center"
          [ngClass]="iconWrapperClass"
        >
          <!-- RECEITA -->
          <svg
            *ngIf="type === 'revenue'"
            width="20"
            height="12"
            viewBox="0 0 20 12"
            fill="none"
            class="text-current"
          >
            <path
              d="M1.4 12L0 10.6 7.4 3.15 11.4 7.15 16.6 2H14V0H20V6H18V3.4L11.4 10 7.4 6 1.4 12Z"
              fill="currentColor"
            />
          </svg>

          <!-- DESPESA -->
          <svg
            *ngIf="type === 'expense'"
            width="20"
            height="12"
            viewBox="0 0 20 12"
            fill="none"
            class="text-current"
          >
            <path
              d="M14 12V10H16.6L11.4 4.85 7.4 8.85 0 1.4 1.4 0 7.4 6 11.4 2 18 8.6V6H20V12H14Z"
              fill="currentColor"
            />
          </svg>

          <!-- SALDO -->
          <svg
            *ngIf="type === 'balance'"
            width="19"
            height="18"
            viewBox="0 0 19 18"
            fill="none"
            class="text-current"
          >
            <path
              d="M2 18C1.45 18 .979 17.804.588 17.413.196 17.021 0 16.55 0 16V2C0 1.45.196.979.588.588.979.196 1.45 0 2 0H16C16.55 0 17.021.196 17.413.588 17.804.979 18 1.45 18 2H10C8.817 2 7.854 2.371 7.113 3.113 6.371 3.854 6 4.817 6 6V12C6 13.183 6.371 14.146 7.113 14.888 7.854 15.629 8.817 16 10 16H18C18 16.55 17.804 17.021 17.413 17.413 17.021 17.804 16.55 18 16 18H2ZM10 14C9.45 14 8.979 13.804 8.588 13.413 8.196 13.021 8 12.55 8 12V6C8 5.45 8.196 4.979 8.588 4.588 8.979 4.196 9.45 4 10 4H17C17.55 4 18.021 4.196 18.413 4.588 18.804 4.979 19 5.45 19 6V12C19 12.55 18.804 13.021 18.413 13.413 18.021 13.804 17.55 14 17 14H10ZM13 10.5C13.433 10.5 13.792 10.358 14.075 10.075 14.358 9.792 14.5 9.433 14.5 9 14.5 8.567 14.358 8.208 14.075 7.925 13.792 7.642 13.433 7.5 13 7.5 12.567 7.5 12.208 7.642 11.925 7.925 11.642 8.208 11.5 8.567 11.5 9 11.5 9.433 11.642 9.792 11.925 10.075 12.208 10.358 12.567 10.5 13 10.5Z"
              fill="currentColor"
            />
          </svg>
        </div>

        <span
          *ngIf="badgeText"
          class="px-2 py-0.5 rounded-full text-[10px] font-bold"
          [ngClass]="getBadgeColor()"
        >
          {{ badgeText }}
        </span>
      </div>

      <p
        class="text-[11px] font-bold tracking-[1.2px] uppercase m-0"
        [ngClass]="type === 'balance' ? 'text-white/80' : 'text-stone-500'"
      >
        {{ label }}
      </p>
      <p
        class="font-serif text-[26px] font-bold m-0 leading-tight"
        [ngClass]="type === 'balance' ? 'text-white' : 'text-stone-800'"
      >
        {{ value }}
      </p>
    </div>
  `,
})
export class PanelCardComponent {
  @Input() label = '';
  @Input() value: string | number | null = '';
  @Input() badgeText?: string;
  @Input() type: PanelCardType = 'revenue';

  get containerClass(): string {
    return this.type === 'balance'
      ? 'bg-[#A77769] shadow-md border border-transparent text-white'
      : 'bg-white border border-stone-200 shadow-sm text-stone-800';
  }

  get iconWrapperClass(): string {
    switch (this.type) {
      case 'revenue':
        return 'bg-green-100 text-green-600';
      case 'expense':
        return 'bg-red-100 text-red-600';
      case 'balance':
        return 'bg-white/20 text-white';
    }
  }
  
  protected getBadgeColor(): string {
    const isPositive = this.badgeText?.includes('+');

    if (this.type === 'revenue') {
      return isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700';
    } else {
      return isPositive ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800';
    }
  }
}
