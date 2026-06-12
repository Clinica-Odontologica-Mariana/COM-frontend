import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastMessage, ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="pointer-events-none fixed right-5 top-5 z-[100] flex w-[calc(100%-2.5rem)] max-w-96 flex-col gap-3 sm:right-6 sm:top-6">
      @for (toast of toastService.messages(); track toast.id) {
        <section
          class="pointer-events-auto flex items-start gap-3 rounded-3xl border bg-white px-5 py-4 shadow-[0_18px_45px_-24px_rgba(28,25,23,0.55)]"
          [class]="toastClasses(toast)"
          role="status"
          aria-live="polite"
        >
          <div
            class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            [class]="iconClasses(toast)"
            aria-hidden="true"
          >
            @if (toast.type === 'error') {
              <svg viewBox="0 0 24 24" class="h-4 w-4 fill-current">
                <path
                  d="M12 3 2.6 20h18.8L12 3Zm0 5c.5 0 .9.4.9.9v4.8a.9.9 0 1 1-1.8 0V8.9c0-.5.4-.9.9-.9Zm0 9.8a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2Z"
                />
              </svg>
            } @else {
              <svg viewBox="0 0 24 24" class="h-4 w-4 fill-current">
                <path
                  d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.7 7.7-5.3 5.3a1 1 0 0 1-1.4 0l-2.4-2.4A1 1 0 1 1 9 11.2l1.7 1.7 4.6-4.6a1 1 0 0 1 1.4 1.4Z"
                />
              </svg>
            }
          </div>

          <p class="min-w-0 flex-1 text-sm font-medium leading-6 text-[#5C5652]">
            {{ toast.message }}
          </p>

          <button
            type="button"
            class="rounded-full p-1 text-[#9B8F88] transition hover:bg-[#F5EFEC] hover:text-[#6E625C]"
            (click)="toastService.dismiss(toast.id)"
            aria-label="Fechar mensagem"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4 stroke-current" fill="none" stroke-width="2">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </section>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);

  protected toastClasses(toast: ToastMessage): string {
    if (toast.type === 'error') {
      return 'border-[#F1D5CC]';
    }

    if (toast.type === 'success') {
      return 'border-[#D6E9D2]';
    }

    return 'border-[#E7D7CF]';
  }

  protected iconClasses(toast: ToastMessage): string {
    if (toast.type === 'error') {
      return 'bg-[#FFF0EC] text-[#C26E63]';
    }

    if (toast.type === 'success') {
      return 'bg-[#EDF8EA] text-[#548C47]';
    }

    return 'bg-[#F4ECE8] text-[#8B5E4E]';
  }
}
