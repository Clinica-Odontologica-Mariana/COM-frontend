import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Patient } from '../../models/patient.model';
import { formatBirthDate, getInitials } from '../../utils/format.utils';

@Component({
  selector: 'app-patient-table',
  imports: [RouterLink],
  template: `
    <section class="overflow-hidden rounded-3xl bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-[#F3F3F3]">
            <tr class="text-left text-[11px] font-bold uppercase tracking-wider text-[#A8A29E]">
              <th class="px-8 py-5"></th>
              <th class="px-6 py-5">Nome do paciente</th>
              <th class="px-6 py-5">CPF</th>
              <th class="px-6 py-5">Data de nascimento</th>
              <th class="px-6 py-5">Status</th>
              <th class="px-8 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (patient of patients(); track patient.id) {
              <tr class="border-t border-[#FAFAF9]">
                <td class="px-8 py-6">
                  @if (patient.photoUrl) {
                    <img
                      [src]="patient.photoUrl"
                      [alt]="patient.fullName"
                      class="h-10 w-10 rounded-full border border-[#F5F5F4] object-cover"
                    />
                  } @else {
                    <div
                      class="flex h-10 w-10 items-center justify-center rounded-full border border-[#F5F5F4] bg-[#F5DECB] text-xs font-bold text-[#7C5145]"
                    >
                      {{ getInitials(patient.fullName) }}
                    </div>
                  }
                </td>
                <td class="px-6 py-6">
                  <p class="text-base font-semibold text-[#7C5145]">{{ patient.fullName }}</p>
                  <p class="text-[11px] text-[#A8A29E]">#{{ patient.registrationNumber }}</p>
                </td>
                <td class="px-6 py-6 text-sm font-medium text-[#78716C]">{{ patient.cpf }}</td>
                <td class="px-6 py-6 text-sm text-[#78716C]">
                  {{ formatBirthDate(patient.birthDate) }}
                </td>
                <td class="px-6 py-6">
                  @if (patient.status === 'active') {
                    <span
                      class="inline-flex rounded-full bg-[#FFDBD1] px-3 py-1 text-[10px] font-bold text-[#31130A]"
                    >
                      Ativo
                    </span>
                  } @else {
                    <span
                      class="inline-flex rounded-full bg-[#F5F5F4] px-3 py-1 text-[10px] font-bold text-[#A8A29E]"
                    >
                      Inativo
                    </span>
                  }
                </td>
                <td class="px-8 py-6">
                  <div class="flex items-center justify-end gap-2">
                    <a
                      [routerLink]="['/pacientes', patient.id, 'editar']"
                      class="rounded-lg p-2 text-[#A8A29E] transition hover:bg-[#F5F5F4] hover:text-[#7C5145]"
                      aria-label="Editar paciente"
                    >
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </a>
                    <button
                      type="button"
                      class="rounded-lg p-2 text-[#A8A29E] transition hover:bg-[#F5F5F4] hover:text-red-600"
                      aria-label="Excluir paciente"
                      (click)="deletePatient.emit(patient.id)"
                    >
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="px-8 py-16 text-center text-sm text-[#78716C]">
                  Nenhum paciente encontrado.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientTableComponent {
  readonly patients = input.required<Patient[]>();

  readonly deletePatient = output<string>();

  protected readonly formatBirthDate = formatBirthDate;
  protected readonly getInitials = getInitials;
}
