import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { MedicalAlertDTO } from '../../models/patient-record.models';

@Component({
  selector: 'app-medical-alerts',
  template: `
    <section class="rounded-lg border border-[#E7DCD5] bg-white p-6 shadow-sm">
      <p class="text-sm font-semibold text-[#A77769] mb-4">Alertas médicos</p>

      <div class="mt-6 space-y-6">
        @for (alert of alerts(); track alert.id) {
          <article class="rounded-lg bg-[#FBF8F6] p-5 mb-4 last:mb-0">
            <p class="text-sm font-semibold mb-2" [class]="severityClass(alert.severity)">
              {{ severityLabel(alert.severity) }}
            </p>
            <p class="text-sm leading-6 text-[#5F5049]">{{ alert.description }}</p>
          </article>
        } @empty {
          <p class="rounded-lg bg-[#FBF8F6] p-5 text-sm text-[#76645B]">
            Nenhum alerta médico cadastrado.
          </p>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicalAlertsComponent {
  readonly alerts = input<MedicalAlertDTO[]>([]);

  protected severityClass(severity: MedicalAlertDTO['severity']): string {
    if (severity === 'HIGH') {
      return 'text-red-600';
    }

    if (severity === 'MEDIUM') {
      return 'text-yellow-600';
    }

    return 'text-blue-600';
  }

  protected severityLabel(severity: MedicalAlertDTO['severity']): string {
    if (severity === 'HIGH') {
      return 'Alta severidade';
    }

    if (severity === 'MEDIUM') {
      return 'Média severidade';
    }

    return 'Baixa severidade';
  }
}
