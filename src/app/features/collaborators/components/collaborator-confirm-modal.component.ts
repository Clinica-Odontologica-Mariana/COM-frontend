import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-collaborator-confirm-modal',
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
        <button
          type="button"
          class="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
          (click)="cancel.emit()"
          aria-label="Fechar confirmação"
        ></button>

        <section
          class="relative z-10 w-full max-w-lg rounded-4xl bg-white px-7 py-7 shadow-[0px_32px_60px_-24px_rgba(28,25,23,0.45)]"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
        >
          <div class="flex items-start gap-4">
            <div
              class="mt-1 grid h-12 w-12 shrink-0 place-items-center rounded-full"
              [class.bg-[#FEECE8]]="variant() === 'danger'"
              [class.text-[#C4493D]]="variant() === 'danger'"
              [class.bg-[#F4ECE8]]="variant() !== 'danger'"
              [class.text-[#8B5E4E]]="variant() !== 'danger'"
              aria-hidden="true"
            >
              @if (variant() === 'danger') {
                <span class="text-xl">!</span>
              } @else {
                <span class="text-xl">i</span>
              }
            </div>

            <div class="min-w-0 flex-1">
              <h2 [id]="titleId" class="text-2xl font-semibold text-[#8B5E4E]" style="font-family: 'Noto Serif', serif">
                {{ title() }}
              </h2>
              <p class="mt-3 text-sm leading-6 text-[#726863]">
                {{ description() }}
              </p>
            </div>
          </div>

          <div class="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              class="inline-flex h-11 items-center justify-center rounded-2xl border border-[#E7D7CF] bg-white px-5 text-sm font-semibold text-[#7C5145] transition hover:bg-[#F8F4F1]"
              (click)="cancel.emit()"
            >
              {{ cancelLabel() }}
            </button>
            <button
              type="button"
              class="inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-semibold text-white transition"
              [class.bg-[#8B5E4E]]="variant() !== 'danger'"
              [class.hover:bg-[#744A40]]="variant() !== 'danger'"
              [class.bg-[#C4493D]]="variant() === 'danger'"
              [class.hover:bg-[#A83F34]]="variant() === 'danger'"
              (click)="confirm.emit()"
            >
              {{ confirmLabel() }}
            </button>
          </div>
        </section>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollaboratorConfirmModalComponent {
  readonly open = input(false);
  readonly title = input('');
  readonly description = input('');
  readonly confirmLabel = input('Confirmar');
  readonly cancelLabel = input('Cancelar');
  readonly variant = input<'default' | 'danger'>('default');
  readonly titleId = `modal-title-${Math.random().toString(36).slice(2, 8)}`;

  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
