import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CurrencyMaskDirective } from '../../../../shared/directives/currency-mask.directive';
import { DateMaskDirective } from '../../../../shared/directives/date-mask.directive';
import { InventoryTypeOption } from '../../models/inventory.model';

@Component({
  selector: 'app-inventory-item-form',
  imports: [ReactiveFormsModule, CurrencyMaskDirective, DateMaskDirective],
  template: `
    <article class="rounded-[2rem] bg-[#F3F3F3] px-6 py-8 shadow-sm ring-1 ring-[#ECE8E5] sm:px-8 lg:px-10">
      <div class="flex items-center gap-4">
        <span class="h-10 w-10 rounded-full bg-[#E2D7D2]" aria-hidden="true"></span>
        <h2 class="font-serif text-2xl font-bold text-[#202020]">Cadastrar Item</h2>
      </div>

      <form class="mt-8 grid gap-x-8 gap-y-6 lg:grid-cols-2" [formGroup]="form()">
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
          <span class="text-xs font-extrabold uppercase tracking-wide text-[#7D7772]">
            Data de Compra
          </span>
          <input
            formControlName="purchaseDate"
            appDateMask
            type="text"
            inputmode="numeric"
            maxlength="10"
            placeholder="dd/mm/yyyy"
            class="h-14 rounded-xl border-0 bg-[#EDEDED] px-4 text-sm text-[#2D2926] outline-none placeholder:text-[#1F1F1F] focus:ring-2 focus:ring-[#B98577]"
          />
        </label>

        <label class="grid gap-2">
          <span class="text-xs font-extrabold uppercase tracking-wide text-[#7D7772]">
            Data de Vencimento (opcional)
          </span>
          <input
            formControlName="expirationDate"
            appDateMask
            type="text"
            inputmode="numeric"
            maxlength="10"
            placeholder="dd/mm/yyyy"
            class="h-14 rounded-xl border-0 bg-[#EDEDED] px-4 text-sm text-[#2D2926] outline-none placeholder:text-[#1F1F1F] focus:ring-2 focus:ring-[#B98577]"
          />
        </label>

        <label class="grid gap-2 lg:max-w-[28rem]">
          <span class="text-xs font-extrabold uppercase tracking-wide text-[#7D7772]">
            Quantidade
          </span>
          <input
            formControlName="quantity"
            type="number"
            min="0"
            placeholder="00"
            class="h-14 rounded-xl border-0 bg-[#EDEDED] px-4 text-sm text-[#2D2926] outline-none placeholder:text-[#A6A19D] focus:ring-2 focus:ring-[#B98577]"
          />
        </label>

        <label class="grid gap-2 lg:col-span-2">
          <span class="text-xs font-extrabold uppercase tracking-wide text-[#7D7772]">
            Valor da Compra
          </span>
          <input
            formControlName="purchaseValue"
            appCurrencyMask
            type="text"
            inputmode="numeric"
            placeholder="R$ 0,00"
            class="h-14 rounded-xl border-0 bg-[#EDEDED] px-4 text-sm text-[#2D2926] outline-none placeholder:text-[#A6A19D] focus:ring-2 focus:ring-[#B98577]"
          />
        </label>
      </form>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryItemFormComponent {
  readonly form = input.required<FormGroup>();
  readonly typeOptions = input.required<InventoryTypeOption[]>();
}
