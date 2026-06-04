import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PatientFilters, PatientStatus } from '../../models/patient.model';
import { formatCpf } from '../../utils/format.utils';

@Component({
  selector: 'app-patient-filters',
  imports: [FormsModule],
  template: `
    <section class="rounded-3xl bg-white p-8 shadow-sm">
      <div class="grid gap-6 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
        <div class="space-y-2">
          <label class="px-1 text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
            Nome do paciente
          </label>
          <div class="relative">
            <input
              type="search"
              class="h-11 w-full rounded-xl bg-[#EEEEEE] px-4 pr-10 text-sm text-[#57534E] placeholder:text-[#A8A29E] outline-none"
              placeholder="Pesquisar por nome..."
              [ngModel]="filters().name"
              (ngModelChange)="onNameChange($event)"
            />
            <svg
              class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A8A29E]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" />
            </svg>
          </div>
        </div>

        <div class="space-y-2">
          <label class="px-1 text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
            CPF
          </label>
          <input
            type="text"
            class="h-11 w-full rounded-xl bg-[#EEEEEE] px-4 text-sm text-[#57534E] placeholder:text-[#A8A29E] outline-none"
            placeholder="000.000.000-00"
            [ngModel]="filters().cpf"
            (ngModelChange)="onCpfChange($event)"
          />
        </div>

        <div class="space-y-2">
          <label class="px-1 text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
            Status
          </label>
          <select
            class="h-11 w-full appearance-none rounded-xl bg-[#EEEEEE] px-4 text-sm text-[#57534E] outline-none"
            [ngModel]="filters().status ?? ''"
            (ngModelChange)="onStatusChange($event)"
          >
            <option value="">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>

        <div class="flex gap-2">
          <button
            type="button"
            class="h-12 flex-1 rounded-xl bg-[#F5F5F4] px-6 text-sm font-semibold text-[#57534E] transition hover:bg-[#E7E5E4]"
            (click)="clear.emit()"
          >
            Limpar
          </button>
          <button
            type="button"
            class="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFC8BD] text-[#7A5149] transition hover:bg-[#ffb5a8]"
            aria-label="Filtrar"
            (click)="filter.emit()"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M3 5h18l-7 8v6l-4 2v-8L3 5z" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientFiltersComponent {
  readonly filters = input.required<PatientFilters>();

  readonly filter = output<void>();
  readonly clear = output<void>();
  readonly filtersChange = output<PatientFilters>();

  protected onNameChange(value: string): void {
    this.filtersChange.emit({ ...this.filters(), name: value });
  }

  protected onCpfChange(value: string): void {
    this.filtersChange.emit({ ...this.filters(), cpf: formatCpf(value) });
  }

  protected onStatusChange(value: PatientStatus | ''): void {
    this.filtersChange.emit({ ...this.filters(), status: value });
  }
}
