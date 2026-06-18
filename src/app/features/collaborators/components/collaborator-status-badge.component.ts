import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CollaboratorStatus } from '../models/collaborator.models';

@Component({
  selector: 'app-collaborator-status-badge',
  template: `
    <span
      class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
      [class.bg-[#ECF8E9]]="status() === 'ACTIVE'"
      [class.text-[#4E8D42]]="status() === 'ACTIVE'"
      [class.bg-[#F5EFEA]]="status() === 'INACTIVE'"
      [class.text-[#9A7C6D]]="status() === 'INACTIVE'"
    >
      <span
        class="mr-2 h-2.5 w-2.5 rounded-full"
        [class.bg-[#5DBA4B]]="status() === 'ACTIVE'"
        [class.bg-[#B9A79A]]="status() === 'INACTIVE'"
        aria-hidden="true"
      ></span>
      {{ status() === 'ACTIVE' ? 'Ativo' : 'Inativo' }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollaboratorStatusBadgeComponent {
  readonly status = input<CollaboratorStatus>('ACTIVE');
}
