import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

export interface MultiSelectOption {
  value: string;
  label: string;
  subtitle?: string;
}

@Component({
  selector: 'app-collaborator-multi-select',
  template: `
    <section class="space-y-2">
      @if (label()) {
        <div class="flex items-center justify-between gap-3">
          <label class="text-sm font-semibold text-[#6C625D]" [attr.for]="searchId">{{ label() }}</label>
          @if (required()) {
            <span class="text-xs font-medium text-[#B28C7D]">Obrigatório</span>
          }
        </div>
      }

      <div class="rounded-3xl border border-[#E9DFD9] bg-white p-3 shadow-[0_8px_24px_-18px_rgba(28,25,23,0.25)] focus-within:border-[#B48A7C] focus-within:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]">
        <div class="flex items-center gap-2 rounded-2xl bg-[#FAF7F5] px-4 py-3">
          <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0 stroke-[#B8ADA7]" fill="none" stroke-width="2">
            <path d="m21 21-4.3-4.3"></path>
            <circle cx="11" cy="11" r="7"></circle>
          </svg>
          <input
            [id]="searchId"
            type="text"
            class="min-w-0 flex-1 bg-transparent text-sm text-[#3F3835] outline-none placeholder:text-[#A99F99]"
            [placeholder]="placeholder()"
            [value]="searchTerm()"
            (input)="setSearchTerm($any($event.target).value)"
            [disabled]="disabled()"
          />
        </div>

        <div class="mt-3 flex flex-wrap gap-2">
          @for (selectedItem of selectedOptions(); track selectedItem.value) {
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full bg-[#F4ECE8] px-3 py-1.5 text-xs font-semibold text-[#8B5E4E] transition hover:bg-[#EEDDD5]"
              (click)="toggle(selectedItem.value)"
              [disabled]="disabled()"
            >
              {{ selectedItem.label }}
              <span aria-hidden="true">×</span>
            </button>
          }
        </div>

        <div class="mt-3 max-h-56 space-y-2 overflow-auto pr-1">
          @if (!filteredOptions().length) {
            <p class="px-2 py-3 text-sm text-[#988B84]">Nenhuma opção encontrada.</p>
          } @else {
            @for (option of filteredOptions(); track option.value) {
              <label
                class="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 text-sm text-[#4B4440] transition hover:bg-[#FAF7F5]"
                [class.opacity-60]="disabled()"
              >
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-[#D7C8C2] text-[#8B5E4E] focus:ring-[#B48A7C]"
                  [checked]="selected().includes(option.value)"
                  (change)="toggle(option.value)"
                  [disabled]="disabled()"
                />
                <span class="min-w-0 flex-1">
                  <span class="block font-medium">{{ option.label }}</span>
                  @if (option.subtitle) {
                    <span class="block text-xs text-[#948781]">{{ option.subtitle }}</span>
                  }
                </span>
              </label>
            }
          }
        </div>
      </div>

      @if (helperText()) {
        <p class="px-1 text-xs leading-5 text-[#847872]">{{ helperText() }}</p>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollaboratorMultiSelectComponent {
  readonly label = input('');
  readonly placeholder = input('Pesquisar');
  readonly helperText = input('');
  readonly required = input(false);
  readonly disabled = input(false);
  readonly options = input<readonly MultiSelectOption[]>([]);
  readonly selected = input<readonly string[]>([]);

  readonly selectedChange = output<string[]>();

  protected readonly searchTerm = signal('');
  protected readonly searchId = `search-${Math.random().toString(36).slice(2, 8)}`;

  protected readonly filteredOptions = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.options();
    }

    return this.options().filter((option) => {
      const haystack = `${option.label} ${option.subtitle ?? ''}`.toLowerCase();
      return haystack.includes(term);
    });
  });

  protected readonly selectedOptions = computed(() => {
    const selectedValues = this.selected();
    return this.options().filter((option) => selectedValues.includes(option.value));
  });

  protected toggle(value: string): void {
    if (this.disabled()) {
      return;
    }

    const current = new Set(this.selected());
    if (current.has(value)) {
      current.delete(value);
    } else {
      current.add(value);
    }

    this.selectedChange.emit(Array.from(current));
  }

  protected setSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }
}
