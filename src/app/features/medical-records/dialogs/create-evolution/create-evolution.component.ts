import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MedicalRecordNoteCreateDTO } from '../../models/patient-record.models';

@Component({
  selector: 'app-create-evolution',
  imports: [ReactiveFormsModule],
  template: `
    <div
      class="fixed inset-0 z-50 grid place-items-center bg-[#3F322D]/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-note-title"
      (click)="onBackdrop($event)"
    >
      <form
        class="w-full max-w-xl rounded-lg bg-white p-5 shadow-2xl"
        [formGroup]="form"
        (ngSubmit)="submit()"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-[#A77769]">Nova evolução</p>
            <h2 id="create-note-title" class="text-xl font-semibold text-[#3F322D]">
              Registrar evolução clínica
            </h2>
          </div>
          <button
            type="button"
            class="rounded-lg border border-[#D8C8BF] px-3 py-2 text-sm font-semibold text-[#7B564A] transition hover:bg-[#EFE7E3]"
            (click)="closed.emit()"
          >
            Fechar
          </button>
        </div>

        <div class="mt-5">
          <label class="block">
            <span class="text-sm font-semibold text-[#5F5049]">Evolução clínica</span>
            <textarea
              rows="8"
              formControlName="note"
              placeholder="Descreva a evolução clínica do paciente..."
              class="mt-1 w-full resize-none rounded-lg border border-[#D8C8BF] px-3 py-2.5 text-sm outline-none transition focus:border-[#A77769]"
              [class.border-red-400]="form.controls.note.invalid && form.controls.note.touched"
            ></textarea>
            @if (form.controls.note.invalid && form.controls.note.touched) {
              <p class="mt-1 text-xs text-red-600">O texto da evolução é obrigatório.</p>
            }
          </label>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-lg border border-[#D8C8BF] px-4 py-2.5 text-sm font-semibold text-[#7B564A] transition hover:bg-[#EFE7E3]"
            (click)="closed.emit()"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="rounded-lg bg-[#A77769] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7B564A] disabled:cursor-not-allowed disabled:opacity-60"
            [disabled]="form.invalid || saving()"
          >
            {{ saving() ? 'Salvando...' : 'Salvar evolução' }}
          </button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateEvolutionComponent {
  readonly saving = input(false);
  readonly closed = output<void>();
  readonly saved = output<MedicalRecordNoteCreateDTO>();

  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    note: ['', [Validators.required, Validators.minLength(3)]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saved.emit({ note: this.form.getRawValue().note });
  }

  protected onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }
}
