import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (dialog.state(); as dialogState) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        role="presentation"
        (click)="dialog.cancel()"
      >
        <div
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="'confirm-dialog-title'"
          class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          (click)="$event.stopPropagation()"
        >
          <h2 id="confirm-dialog-title" class="font-serif text-lg font-bold text-[#1A1C1C]">
            {{ dialogState.title }}
          </h2>
          <p class="mt-3 text-sm text-[#57534E]">{{ dialogState.message }}</p>
          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-xl px-5 py-2 text-sm font-semibold text-[#78716C] transition hover:bg-[#F5F5F4]"
              (click)="dialog.cancel()"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="rounded-xl bg-[#7C5145] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#6a453b]"
              (click)="dialog.accept()"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  protected readonly dialog = inject(ConfirmDialogService);
}
