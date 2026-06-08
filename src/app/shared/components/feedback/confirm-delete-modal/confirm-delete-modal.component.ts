import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-delete-modal',
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center px-6 py-8">
        <button
          type="button"
          class="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
          (click)="cancel.emit()"
          aria-label="Fechar modal de exclusão"
        ></button>

        <section
          class="relative z-10 w-full max-w-[360px] rounded-[32px] bg-white px-8 py-8 text-center shadow-[0px_32px_60px_-24px_rgba(28,25,23,0.45)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
        >
          <div
            class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FAD4D0] text-[#C81E1E]"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" class="h-7 w-7 fill-current">
              <path
                d="M12 3.5 2.6 20.5h18.8L12 3.5Zm0 4.7c.5 0 .9.4.9.9v4.9a.9.9 0 1 1-1.8 0V9.1c0-.5.4-.9.9-.9Zm0 9.2a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2Z"
              />
            </svg>
          </div>

          <h2
            id="confirm-delete-title"
            class="mt-6 text-[24px] font-semibold leading-tight text-[#8B5E4E]"
            style="font-family: 'Noto Serif', serif"
          >
            {{ title() }}
          </h2>

          <p class="mt-4 text-sm leading-7 text-[#7C7C7C]">
            {{ description() }}
          </p>

          <button
            type="button"
            (click)="confirm.emit()"
            class="mt-8 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-[#CB1E1E] px-5 text-sm font-semibold text-white shadow-[0px_14px_20px_-12px_rgba(203,30,30,0.7)] transition hover:bg-[#B01A1A]"
          >
            {{ confirmLabel() }}
          </button>

          <button
            type="button"
            (click)="cancel.emit()"
            class="mt-5 inline-flex items-center justify-center text-sm font-medium text-[#6F6F6F] transition hover:text-[#504A46]"
          >
            {{ cancelLabel() }}
          </button>
        </section>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDeleteModalComponent {
  readonly open = input(false);
  readonly title = input('Excluir item?');
  readonly description = input('Tem certeza que deseja remover este item? Esta ação não pode ser desfeita.');
  readonly confirmLabel = input('Sim, Excluir');
  readonly cancelLabel = input('Cancelar');

  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
