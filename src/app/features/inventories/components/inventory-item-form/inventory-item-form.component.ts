import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ClinicOption, InventoryTypeOption, InventoryUnitOption } from '../../models/inventory.model';

@Component({
  selector: 'app-inventory-item-form',
  imports: [ReactiveFormsModule],
  template: `
    <article class="rounded-[2rem] bg-[#F3F3F3] px-6 py-8 shadow-sm ring-1 ring-[#ECE8E5] sm:px-8 lg:px-10">
      <div class="flex items-center gap-4">
        <span class="h-10 w-10 rounded-full bg-[#E2D7D2]" aria-hidden="true"></span>
        <h2 class="font-serif text-2xl font-bold text-[#202020]">{{ title() }}</h2>
      </div>

      <form class="mt-8 grid gap-x-8 gap-y-6 lg:grid-cols-2" [formGroup]="form()">
        @if (showClinicField()) {
          <label class="grid gap-2 lg:col-span-2">
            <span class="text-xs font-extrabold uppercase tracking-wide text-[#7D7772]">Clínica</span>
            <select
              formControlName="clinicId"
              class="h-14 rounded-xl border-0 bg-[#EDEDED] px-4 text-sm text-[#7D7772] outline-none focus:ring-2 focus:ring-[#B98577]"
            >
              <option value="">Selecione</option>
              @for (clinic of clinics(); track clinic.id) {
                <option [value]="clinic.id">{{ clinic.name }}</option>
              }
            </select>
          </label>
        }

        <label class="grid gap-2">
          <span class="text-xs font-extrabold uppercase tracking-wide text-[#7D7772]">Nome</span>
          <input
            formControlName="name"
            type="text"
            placeholder="Item ou Equipamento"
            class="h-14 rounded-xl border-0 bg-[#EDEDED] px-4 text-sm text-[#2D2926] outline-none placeholder:text-[#A6A19D] focus:ring-2 focus:ring-[#B98577]"
          />
        </label>

        <label class="grid gap-2">
          <span class="text-xs font-extrabold uppercase tracking-wide text-[#7D7772]">Tipo</span>
          <select
            formControlName="type"
            class="h-14 rounded-xl border-0 bg-[#EDEDED] px-4 text-sm text-[#7D7772] outline-none focus:ring-2 focus:ring-[#B98577]"
          >
            <option value="">Opções</option>
            @for (option of typeOptions(); track option.value) {
              <option [value]="option.value">{{ option.label }}</option>
            }
          </select>
        </label>

        <label class="grid gap-2">
          <span class="text-xs font-extrabold uppercase tracking-wide text-[#7D7772]">Unidade</span>
          <select
            formControlName="unit"
            class="h-14 rounded-xl border-0 bg-[#EDEDED] px-4 text-sm text-[#7D7772] outline-none focus:ring-2 focus:ring-[#B98577]"
          >
            <option value="">Opções</option>
            @for (option of unitOptions(); track option.value) {
              <option [value]="option.value">{{ option.label }}</option>
            }
          </select>
        </label>

        <label class="grid gap-2">
          <span class="text-xs font-extrabold uppercase tracking-wide text-[#7D7772]">SKU</span>
          <input
            formControlName="sku"
            type="text"
            maxlength="80"
            placeholder="Código interno"
            class="h-14 rounded-xl border-0 bg-[#EDEDED] px-4 text-sm text-[#2D2926] outline-none placeholder:text-[#A6A19D] focus:ring-2 focus:ring-[#B98577]"
          />
        </label>

        <label class="grid gap-2">
          <span class="text-xs font-extrabold uppercase tracking-wide text-[#7D7772]">
            Estoque mínimo
          </span>
          <input
            formControlName="minimumQuantity"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            class="h-14 rounded-xl border-0 bg-[#EDEDED] px-4 text-sm text-[#2D2926] outline-none placeholder:text-[#A6A19D] focus:ring-2 focus:ring-[#B98577]"
            [class.ring-2]="hasError('minimumQuantity')"
            [class.ring-[#C91920]]="hasError('minimumQuantity')"
            (keydown)="blockInvalidNumberInput($event)"
            (paste)="blockInvalidNumberPaste($event)"
          />
          @if (hasError('minimumQuantity')) {
            <span class="text-xs font-semibold text-[#C91920]">
              Informe um número maior ou igual a zero com até duas casas decimais.
            </span>
          }
        </label>

        @if (showInitialQuantity()) {
          <label class="grid gap-2">
            <span class="text-xs font-extrabold uppercase tracking-wide text-[#7D7772]">
              Quantidade inicial
            </span>
            <input
              formControlName="initialQuantity"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              class="h-14 rounded-xl border-0 bg-[#EDEDED] px-4 text-sm text-[#2D2926] outline-none placeholder:text-[#A6A19D] focus:ring-2 focus:ring-[#B98577]"
              [class.ring-2]="hasError('initialQuantity')"
              [class.ring-[#C91920]]="hasError('initialQuantity')"
              (keydown)="blockInvalidNumberInput($event)"
              (paste)="blockInvalidNumberPaste($event)"
            />
            @if (hasError('initialQuantity')) {
              <span class="text-xs font-semibold text-[#C91920]">
                Informe um número maior ou igual a zero com até duas casas decimais.
              </span>
            }
          </label>
        }

        @if (showQuantityAdjustment()) {
          <label class="grid gap-2">
            <span class="text-xs font-extrabold uppercase tracking-wide text-[#7D7772]">
              Ajustar quantidade atual
            </span>
            <input
              formControlName="adjustedQuantity"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              class="h-14 rounded-xl border-0 bg-[#EDEDED] px-4 text-sm text-[#2D2926] outline-none placeholder:text-[#A6A19D] focus:ring-2 focus:ring-[#B98577]"
              [class.ring-2]="hasError('adjustedQuantity')"
              [class.ring-[#C91920]]="hasError('adjustedQuantity')"
              (keydown)="blockInvalidNumberInput($event)"
              (paste)="blockInvalidNumberPaste($event)"
            />
            @if (hasError('adjustedQuantity')) {
              <span class="text-xs font-semibold text-[#C91920]">
                Informe um número maior ou igual a zero com até duas casas decimais.
              </span>
            }
          </label>
        }

        <label class="grid gap-2 lg:col-span-2">
          <span class="text-xs font-extrabold uppercase tracking-wide text-[#7D7772]">Descrição</span>
          <textarea
            formControlName="description"
            rows="4"
            placeholder="Observações sobre o item"
            class="resize-none rounded-xl border-0 bg-[#EDEDED] px-4 py-4 text-sm text-[#2D2926] outline-none placeholder:text-[#A6A19D] focus:ring-2 focus:ring-[#B98577]"
          ></textarea>
        </label>
      </form>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryItemFormComponent {
  readonly form = input.required<FormGroup>();
  readonly typeOptions = input.required<InventoryTypeOption[]>();
  readonly unitOptions = input.required<InventoryUnitOption[]>();
  readonly clinics = input<ClinicOption[]>([]);
  readonly title = input('Cadastrar Item');
  readonly showClinicField = input(true);
  readonly showInitialQuantity = input(true);
  readonly showQuantityAdjustment = input(false);

  protected hasError(controlName: string): boolean {
    const control = this.form().get(controlName);

    return Boolean(control?.invalid && (control.dirty || control.touched));
  }

  protected blockInvalidNumberInput(event: KeyboardEvent): void {
    if (['e', 'E', '+', '-'].includes(event.key)) {
      event.preventDefault();
    }
  }

  protected blockInvalidNumberPaste(event: ClipboardEvent): void {
    const pastedValue = event.clipboardData?.getData('text') ?? '';

    if (/[eE+-]/.test(pastedValue)) {
      event.preventDefault();
    }
  }
}
