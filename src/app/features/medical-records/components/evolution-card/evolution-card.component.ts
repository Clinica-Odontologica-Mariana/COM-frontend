import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

import { ClinicalNoteView } from '../../models/patient-record.models';

const MAX_CHARS = 300;

@Component({
  selector: 'app-evolution-card',
  imports: [DatePipe],
  template: `
    <article
      class="rounded-xl border border-[#F5F5F4] bg-white p-8 shadow-sm"
      [class.opacity-80]="archived()"
    >
      <!-- Header: icon + title + status badge -->
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-center gap-3">
          <!-- Icon -->
          <div
            class="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
            [class.bg-[#F5DECB]]="!archived()"
            [class.bg-[#F5F5F4]]="archived()"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              [attr.color]="archived() ? '#A8A29E' : '#69594A'"
            >
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>

          <!-- Title + date -->
          <div>
            <p class="text-base font-bold leading-6 text-[#292524]">{{ note().title }}</p>
            <p class="text-xs text-[#A8A29E]">
              {{ note().createdAt | date: "dd 'de' MMMM',' yyyy • HH:mm" : undefined : 'pt-BR' }}
            </p>
          </div>
        </div>

        <!-- Status badge -->
        <div class="flex shrink-0 items-center gap-2">
          <span
            class="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-[1px]"
            [class.bg-[#DCFCE7]]="!archived()"
            [class.text-green-700]="!archived()"
            [class.bg-[#F5F5F4]]="archived()"
            [class.text-[#78716C]]="archived()"
          >
            {{ archived() ? 'Arquivado' : 'Registrado' }}
          </span>

          <!-- Delete -->
          @if (confirmingDelete()) {
            <span class="text-xs text-[#78716C]">Excluir?</span>
            <button
              type="button"
              class="rounded-full px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
              (click)="confirmDelete()"
            >
              Sim
            </button>
            <button
              type="button"
              class="rounded-full px-2 py-1 text-xs text-[#78716C] transition hover:bg-[#F5F5F4]"
              (click)="cancelDelete()"
            >
              Não
            </button>
          } @else {
            <button
              type="button"
              class="rounded-full px-2 py-1 text-xs text-[#A8A29E] transition hover:bg-[#F5F5F4] hover:text-[#78716C] cursor-pointer"
              (click)="requestDelete()"
              aria-label="Excluir evolução"
            >
              Excluir
            </button>
          }
        </div>
      </div>

      <!-- Note text -->
      <p class="mt-4 text-sm leading-[1.65] text-[#57534E] whitespace-pre-wrap">
        {{ displayText() }}
      </p>

      @if (isTruncated()) {
        <button
          type="button"
          class="mt-2 text-xs font-bold text-[#7C5145] transition hover:text-[#6B4439]"
          (click)="expanded.set(!expanded())"
        >
          {{ expanded() ? 'Ver menos' : 'Ver mais' }}
        </button>
      }
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvolutionCardComponent {
  readonly note = input.required<ClinicalNoteView>();
  readonly deleted = output<string>();

  protected readonly confirmingDelete = signal(false);
  protected readonly expanded = signal(false);

  protected readonly archived = computed(() => {
    const d = new Date(this.note().createdAt);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return d < cutoff;
  });

  protected readonly isTruncated = computed(() => this.note().note.length > MAX_CHARS);

  protected readonly displayText = computed(() => {
    const text = this.note().note;
    if (this.expanded() || text.length <= MAX_CHARS) return text;
    return text.slice(0, MAX_CHARS).trimEnd() + '…';
  });

  protected requestDelete(): void {
    this.confirmingDelete.set(true);
  }
  protected cancelDelete(): void {
    this.confirmingDelete.set(false);
  }
  protected confirmDelete(): void {
    this.confirmingDelete.set(false);
    this.deleted.emit(this.note().id);
  }
}
