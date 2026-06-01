import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CreateEvolutionDTO } from '../../models/patient-record.models';

@Component({
  selector: 'app-create-evolution',
  imports: [ReactiveFormsModule],
  template: `
    <div
      class="fixed inset-0 z-50 grid place-items-center bg-[#3F322D]/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-evolution-title"
    >
      <form
        class="w-full max-w-xl rounded-lg bg-white p-5 shadow-2xl"
        [formGroup]="form"
        (ngSubmit)="submit()"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-[#A77769]">Nova evolução</p>
            <h2 id="create-evolution-title" class="text-xl font-semibold text-[#3F322D]">
              Registrar evolução clínica
            </h2>
          </div>
          <button
            type="button"
            class="rounded-lg border border-[#D8C8BF] px-3 py-2 text-sm font-semibold text-[#7B564A]"
            (click)="closed.emit()"
          >
            Fechar
          </button>
        </div>

        <div class="mt-5 space-y-4">
          <label class="block">
            <span class="text-sm font-semibold text-[#5F5049]">Título</span>
            <input
              type="text"
              formControlName="title"
              class="mt-1 w-full rounded-lg border border-[#D8C8BF] px-3 py-2.5 text-sm outline-none focus:border-[#A77769]"
            />
          </label>

          <label class="block">
            <span class="text-sm font-semibold text-[#5F5049]">Descrição</span>
            <textarea
              rows="5"
              formControlName="description"
              class="mt-1 w-full resize-none rounded-lg border border-[#D8C8BF] px-3 py-2.5 text-sm outline-none focus:border-[#A77769]"
            ></textarea>
          </label>

          <label class="block">
            <span class="text-sm font-semibold text-[#5F5049]">Tags</span>
            <input
              type="text"
              formControlName="tags"
              placeholder="Separadas por vírgula"
              class="mt-1 w-full rounded-lg border border-[#D8C8BF] px-3 py-2.5 text-sm outline-none focus:border-[#A77769]"
            />
          </label>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-lg border border-[#D8C8BF] px-4 py-2.5 text-sm font-semibold text-[#7B564A]"
            (click)="closed.emit()"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="rounded-lg bg-[#A77769] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
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
  readonly patientId = input.required<number>();
  readonly saving = input(false);
  readonly closed = output<void>();
  readonly saved = output<CreateEvolutionDTO>();

  private readonly formBuilder = new FormBuilder();

  protected readonly form = this.formBuilder.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    tags: [''],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    this.saved.emit({
      patientId: this.patientId(),
      title: value.title,
      description: value.description,
      tags: value.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
  }
}
