import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { PrescriptionDTO } from '../../models/patient-record.models';

@Component({
  selector: 'app-prescriptions-panel',
  template: `
    <section class="rounded-lg border border-[#E7DCD5] bg-white p-5 shadow-sm">
      <p class="text-sm font-semibold text-[#A77769]">Prescrições</p>

      <div class="mt-6 space-y-4">
        @for (prescription of prescriptions(); track prescription.id) {
          <article class="rounded-lg bg-[#FBF8F6] p-4">
            <h3 class="font-semibold text-[#3F322D]">{{ prescription.medication }}</h3>
            <p class="mt-1 text-sm font-medium text-[#7B564A]">{{ prescription.dosage }}</p>
            <p class="mt-2 text-sm leading-6 text-[#5F5049]">{{ prescription.instructions }}</p>
          </article>
        } @empty {
          <p class="rounded-lg bg-[#FBF8F6] p-4 text-sm text-[#76645B]">
            Nenhuma prescricao registrada.
          </p>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionsPanelComponent {
  readonly prescriptions = input<PrescriptionDTO[]>([]);
}
