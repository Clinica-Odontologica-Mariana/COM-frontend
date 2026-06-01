import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { PatientDTO } from '../../models/patient-record.models';

@Component({
  selector: 'app-patient-header',
  imports: [DatePipe],
  template: `
    <header class="rounded-lg border border-[#E7DCD5] bg-white p-5 shadow-sm">
      @if (patient(); as patient) {
        <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex min-w-0 items-center gap-4">
            <div
              class="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#EFE7E3] text-xl font-semibold text-[#7B564A]"
              aria-hidden="true"
            >
              {{ initials() }}
            </div>

            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="truncate text-2xl font-semibold text-[#3F322D]">{{ patient.name }}</h2>
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-semibold"
                  [class.bg-green-100]="patient.active"
                  [class.text-green-700]="patient.active"
                  [class.bg-gray-100]="!patient.active"
                  [class.text-gray-600]="!patient.active"
                >
                  {{ patient.active ? 'Ativo' : 'Inativo' }}
                </span>
              </div>

              <div class="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#76645B]">
                <span>ID {{ patient.id }}</span>
                <span>CPF {{ patient.cpf }}</span>
                <span>{{ age() }} anos</span>
                <span>Nascimento {{ patient.birthDate | date: 'dd/MM/yyyy' }}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <button class="rounded-lg border border-[#D8C8BF] px-3 py-2 text-sm font-semibold text-[#7B564A]">
              Editar Cadastro
            </button>
            <button class="rounded-lg border border-[#D8C8BF] px-3 py-2 text-sm font-semibold text-[#7B564A]">
              Compartilhar
            </button>
            <button class="rounded-lg bg-[#A77769] px-3 py-2 text-sm font-semibold text-white">
              Imprimir
            </button>
          </div>
        </div>
      } @else {
        <div class="h-20 animate-pulse rounded-lg bg-[#EFE7E3]"></div>
      }
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientHeaderComponent {
  readonly patient = input<PatientDTO | null>(null);

  protected readonly initials = computed(() => {
    const name = this.patient()?.name ?? '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  });

  protected readonly age = computed(() => {
    const birthDate = this.patient()?.birthDate;

    if (!birthDate) {
      return 0;
    }

    const today = new Date();
    const bornAt = new Date(birthDate);
    let age = today.getFullYear() - bornAt.getFullYear();
    const monthDifference = today.getMonth() - bornAt.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < bornAt.getDate())) {
      age -= 1;
    }

    return age;
  });
}
