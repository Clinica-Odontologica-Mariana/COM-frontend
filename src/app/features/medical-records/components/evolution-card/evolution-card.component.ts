import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ClinicalEvolutionDTO } from '../../models/patient-record.models';

@Component({
  selector: 'app-evolution-card',
  imports: [DatePipe],
  template: `
    <article class="rounded-lg border border-[#E7DCD5] bg-white p-4 shadow-sm">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 class="text-base font-semibold text-[#3F322D]">{{ evolution().title }}</h3>
          <p class="mt-1 text-sm text-[#76645B]">
            {{ evolution().createdAt | date: 'dd/MM/yyyy HH:mm' }}
          </p>
        </div>
        <span class="w-fit rounded-full px-2.5 py-1 text-xs font-semibold" [class]="statusClass()">
          {{ statusLabel() }}
        </span>
      </div>

      <p class="mt-4 text-sm leading-6 text-[#5F5049]">{{ evolution().description }}</p>

      @if (evolution().tags.length) {
        <div class="mt-4 flex flex-wrap gap-2">
          @for (tag of evolution().tags; track tag) {
            <span class="rounded-full bg-[#EFE7E3] px-2.5 py-1 text-xs font-medium text-[#7B564A]">
              {{ tag }}
            </span>
          }
        </div>
      }
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvolutionCardComponent {
  readonly evolution = input.required<ClinicalEvolutionDTO>();

  protected statusClass(): string {
    const status = this.evolution().status;

    if (status === 'FINISHED') {
      return 'bg-green-100 text-green-700';
    }

    if (status === 'ARCHIVED') {
      return 'bg-gray-100 text-gray-600';
    }

    return 'bg-yellow-100 text-yellow-700';
  }

  protected statusLabel(): string {
    const status = this.evolution().status;

    if (status === 'FINISHED') {
      return 'Finalizada';
    }

    if (status === 'ARCHIVED') {
      return 'Arquivada';
    }

    return 'Em andamento';
  }
}
