import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { MedicalAlertView } from '../../models/patient-record.models';

const TYPE_LABELS: Record<MedicalAlertView['type'], string> = {
  allergy: 'Alergia',
  condition: 'Condição',
  medication: 'Medicação',
};

@Component({
  selector: 'app-medical-alerts',
  template: `
    <section
      class="rounded-xl border border-[#F0BAAF] p-8"
      style="background: rgba(255, 218, 211, 0.2)"
    >
      <div class="mb-4 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 text-[#E07060]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <p class="text-sm font-bold text-[#E07060]">Alertas Médicos</p>
      </div>

      @if (alerts().length) {
        <ul class="space-y-2">
          @for (alert of alerts(); track alert.id) {
            <li
              class="text-sm font-medium leading-5"
              [class.text-red-600]="alert.severity === 'HIGH'"
              [class.text-amber-700]="alert.severity === 'MEDIUM'"
              [class.text-blue-700]="alert.severity === 'LOW'"
            >
              <span class="font-semibold">{{ typeLabel(alert.type) }}:</span>
              {{ alert.description }}
            </li>
          }
        </ul>
      } @else {
        <p class="text-sm text-[#A8A29E]">Nenhum alerta médico cadastrado.</p>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicalAlertsComponent {
  readonly alerts = input<MedicalAlertView[]>([]);

  protected typeLabel(type: MedicalAlertView['type']): string {
    return TYPE_LABELS[type] ?? type;
  }
}
