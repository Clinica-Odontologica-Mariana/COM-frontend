import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

import { ClinicalNoteView } from '../../models/patient-record.models';

const MAX_CHARS = 300;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

@Component({
  selector: 'app-evolution-card',
  imports: [DatePipe],
  template: `
    <article
      class="rounded-xl max-w-screen order border-[#F5F5F4] bg-white p-8 not-lg:p-4 shadow-sm"
      [class.opacity-80]="archived()"
    >
      <!-- Header: icon + title + status badge -->
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-center gap-3">
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

          <div>
            <p class="text-sm lg:text-base font-bold leading-6 text-[#292524]">
              {{ note().title }}
            </p>
            <p class="text-xs text-[#A8A29E]">
              {{ note().createdAt | date: "dd 'de' MMMM',' yyyy • HH:mm" : undefined : 'pt-BR' }}
            </p>
          </div>
        </div>

        <!-- Status badge + actions -->
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

          @if (!editing()) {
            <!-- Mobile: three-dots dropdown -->
            <div class="relative lg:hidden">
              <button
                type="button"
                class="grid h-7 w-7 cursor-pointer place-items-center rounded-full text-[#A8A29E] transition hover:bg-[#F5F5F4] hover:text-[#78716C]"
                (click)="toggleMenu()"
                aria-label="Mais opções"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
                </svg>
              </button>
              @if (showMenu()) {
                <div class="absolute right-0 top-full z-20 mt-1 min-w-27.5 overflow-hidden rounded-lg border border-[#E7DCD5] bg-white shadow-lg">
                  @if (confirmingDelete()) {
                    <div class="px-3 py-2 text-xs text-[#78716C]">Confirmar?</div>
                    <button
                      type="button"
                      class="w-full px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
                      (click)="confirmDelete()"
                    >
                      Sim, excluir
                    </button>
                    <button
                      type="button"
                      class="w-full px-3 py-2 text-left text-xs text-[#78716C] hover:bg-[#F5F5F4]"
                      (click)="cancelDeleteAndClose()"
                    >
                      Cancelar
                    </button>
                  } @else {
                    <button
                      type="button"
                      class="w-full px-3 py-2 text-left text-xs text-[#78716C] hover:bg-[#F5F5F4]"
                      (click)="startEditAndClose()"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      class="w-full px-3 py-2 text-left text-xs text-red-500 hover:bg-red-50"
                      (click)="requestDelete()"
                    >
                      Excluir
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Desktop: text buttons -->
            <div class="hidden items-center gap-2 lg:flex">
              <button
                type="button"
                class="rounded-full px-2 py-1 text-xs text-[#A8A29E] transition hover:bg-[#F5F5F4] hover:text-[#78716C] cursor-pointer"
                (click)="startEdit()"
                aria-label="Editar evolução"
              >
                Editar
              </button>

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
          }
        </div>
      </div>

      <!-- Edit mode -->
      @if (editing()) {
        <div class="mt-4">
          <textarea
            #editArea
            rows="6"
            class="w-full resize-none rounded-lg border border-[#D8C8BF] px-3 py-2.5 text-sm outline-none transition focus:border-[#A77769]"
            [value]="editValue()"
            (input)="editValue.set($any($event.target).value)"
          ></textarea>
          <div class="mt-3 flex justify-end gap-2">
            <button
              type="button"
              class="rounded-lg border border-[#D8C8BF] px-4 py-2 text-xs font-semibold text-[#7B564A] transition hover:bg-[#EFE7E3]"
              (click)="cancelEdit()"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="rounded-lg bg-[#A77769] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#7B564A]"
              (click)="saveEdit()"
            >
              Salvar
            </button>
          </div>
        </div>
      } @else {
        <!-- Note text (read mode) -->
        <p class="mt-4 text-sm leading-[1.65] text-[#57534E] whitespace-pre-wrap wrap-break-word">
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
      }
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvolutionCardComponent {
  readonly note = input.required<ClinicalNoteView>();
  readonly deleted = output<string>();
  readonly edited = output<{ id: string; note: string }>();

  protected readonly confirmingDelete = signal(false);
  protected readonly expanded = signal(false);
  protected readonly editing = signal(false);
  protected readonly editValue = signal('');
  protected readonly showMenu = signal(false);

  protected readonly archived = computed(() => {
    const raw = this.note().createdAt;
    if (!raw) return false;
    const created = new Date(raw).getTime();
    if (isNaN(created) || created === 0) return false;
    return Date.now() - created > THIRTY_DAYS_MS;
  });

  protected readonly isTruncated = computed(() => this.note().note.length > MAX_CHARS);

  protected readonly displayText = computed(() => {
    const text = this.note().note;
    if (this.expanded() || text.length <= MAX_CHARS) return text;
    return text.slice(0, MAX_CHARS).trimEnd() + '…';
  });

  protected toggleMenu(): void {
    this.showMenu.update((v) => !v);
  }

  protected startEdit(): void {
    this.editValue.set(this.note().note);
    this.editing.set(true);
  }
  protected startEditAndClose(): void {
    this.showMenu.set(false);
    this.startEdit();
  }
  protected cancelEdit(): void {
    this.editing.set(false);
  }
  protected saveEdit(): void {
    const value = this.editValue().trim();
    if (!value) return;
    this.edited.emit({ id: this.note().id, note: value });
    this.editing.set(false);
  }

  protected requestDelete(): void {
    this.confirmingDelete.set(true);
  }
  protected cancelDelete(): void {
    this.confirmingDelete.set(false);
  }
  protected cancelDeleteAndClose(): void {
    this.confirmingDelete.set(false);
    this.showMenu.set(false);
  }
  protected confirmDelete(): void {
    this.confirmingDelete.set(false);
    this.showMenu.set(false);
    this.deleted.emit(this.note().id);
  }
}
