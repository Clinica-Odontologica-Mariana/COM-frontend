import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed right-4 top-4 z-50 flex flex-col gap-2" aria-live="polite">
      @for (toast of toastService.messages(); track toast.id) {
        <div
          class="rounded-xl px-4 py-3 text-sm font-medium shadow-lg"
          [class.bg-[#7C5145]]="toast.type === 'success'"
          [class.text-white]="toast.type === 'success'"
          [class.bg-red-600]="toast.type === 'error'"
          [class.text-white]="toast.type === 'error'"
        >
          {{ toast.message }}
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);
}
