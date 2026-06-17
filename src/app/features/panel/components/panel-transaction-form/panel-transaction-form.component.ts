import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencyMaskDirective } from '../../../../shared/directives/currency-mask.directive';
import {
  ClinicSummaryDto,
  FinancialTransactionCreatePayload,
  TransactionStatus,
  TransactionType,
} from '../../api/financial-transactions.api';

interface TransactionFormModel {
  clinicId: string;
  type: TransactionType;
  description: string;
  category: string;
  amountDisplay: string;
  status: TransactionStatus;
  transactionDate: string;
  notes: string;
}

@Component({
  selector: 'app-transaction-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyMaskDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      *ngIf="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      (click)="close()"
    >
      <div
        class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        (click)="$event.stopPropagation()"
      >
        <div>
          <h3 class="font-serif text-lg font-bold text-stone-800 m-0">Nova Transação</h3>
          <p class="text-sm text-stone-500 m-0 mt-1">
            Preencha os campos abaixo para atualizar o caixa.
          </p>
        </div>

        <div
          *ngIf="errorMessage"
          class="px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold"
        >
          {{ errorMessage }}
        </div>

        <form (ngSubmit)="submit()" class="flex flex-col gap-3">
          <div class="flex flex-col gap-1.5" *ngIf="clinics.length > 1">
            <label class="text-[11px] font-bold uppercase tracking-wider text-stone-500"
              >Clínica</label
            >
            <select
              [(ngModel)]="model.clinicId"
              name="clinicId"
              required
              class="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#A77769]"
            >
              <option value="" disabled>Selecione...</option>
              <option *ngFor="let c of clinics" [value]="c.id">{{ c.name }}</option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[11px] font-bold uppercase tracking-wider text-stone-500"
              >Tipo</label
            >
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                (click)="model.type = 'RECEITA'"
                [class]="
                  model.type === 'RECEITA'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-500'
                    : 'bg-stone-50 text-stone-600 border-stone-200'
                "
                class="py-2 text-xs font-bold rounded-lg border transition-all"
              >
                Receita
              </button>
              <button
                type="button"
                (click)="model.type = 'DESPESA'"
                [class]="
                  model.type === 'DESPESA'
                    ? 'bg-red-100 text-red-800 border-red-500'
                    : 'bg-stone-50 text-stone-600 border-stone-200'
                "
                class="py-2 text-xs font-bold rounded-lg border transition-all"
              >
                Despesa
              </button>
            </div>
          </div>

          <label class="flex flex-col gap-1.5">
            <span class="text-[11px] font-bold uppercase tracking-wider text-stone-500"
              >Descrição</span
            >
            <input
              type="text"
              [(ngModel)]="model.description"
              name="description"
              maxlength="255"
              required
              placeholder="Ex: Consulta Ortodontia, Compra de Luvas..."
              class="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A77769]"
            />
          </label>

          <div class="grid grid-cols-2 gap-3">
            <label class="flex flex-col gap-1.5">
              <span class="text-[11px] font-bold uppercase tracking-wider text-stone-500"
                >Categoria</span
              >
              <input
                type="text"
                [(ngModel)]="model.category"
                name="category"
                maxlength="80"
                placeholder="Ex: Consultas, Materiais"
                class="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A77769]"
              />
            </label>

            <label class="flex flex-col gap-1.5">
              <span class="text-[11px] font-bold uppercase tracking-wider text-stone-500"
                >Valor (R$)</span
              >
              <input
                type="text"
                appCurrencyMask
                [(ngModel)]="model.amountDisplay"
                name="amount"
                required
                placeholder="R$ 0,00"
                class="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A77769]"
              />
            </label>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <label class="flex flex-col gap-1.5">
              <span class="text-[11px] font-bold uppercase tracking-wider text-stone-500"
                >Data do Lançamento</span
              >
              <input
                type="date"
                [(ngModel)]="model.transactionDate"
                name="transactionDate"
                required
                class="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A77769]"
              />
            </label>

            <label class="flex flex-col gap-1.5">
              <span class="text-[11px] font-bold uppercase tracking-wider text-stone-500"
                >Status</span
              >
              <select
                [(ngModel)]="model.status"
                name="status"
                class="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#A77769]"
              >
                <option value="PENDING">Pendente</option>
                <option value="PAID">Pago</option>
                <option value="COMPLETED">Concluído</option>
              </select>
            </label>
          </div>

          <label class="flex flex-col gap-1.5">
            <span class="text-[11px] font-bold uppercase tracking-wider text-stone-500"
              >Observações</span
            >
            <textarea
              rows="2"
              [(ngModel)]="model.notes"
              name="notes"
              placeholder="Detalhes adicionais..."
              class="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A77769] resize-none"
            ></textarea>
          </label>

          <div class="flex gap-3 justify-end mt-2">
            <button
              type="button"
              (click)="close()"
              class="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="saving || !isValid"
              class="px-4 py-2 rounded-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {{ saving ? 'Salvando...' : 'Confirmar Lançamento' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class TransactionFormModalComponent {
  private _open = false;

  @Input() set open(value: boolean) {
    this._open = value;
    if (value) {
      this.model = this.emptyModel();
    }
  }
  get open(): boolean {
    return this._open;
  }

  @Input() clinics: ClinicSummaryDto[] = [];
  @Input() saving = false;
  @Input() errorMessage: string | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<FinancialTransactionCreatePayload>();

  protected model: TransactionFormModel = this.emptyModel();

  protected get isValid(): boolean {
    return (
      !!this.model.clinicId &&
      !!this.model.description.trim() &&
      !!this.model.transactionDate &&
      this.parsedAmount > 0
    );
  }

  protected get parsedAmount(): number {
    const digits = this.model.amountDisplay.replace(/\D/g, '');
    return Number(digits || '0') / 100;
  }

  protected submit(): void {
    if (this.saving || !this.isValid) return;

    this.submitted.emit({
      clinicId: this.model.clinicId,
      description: this.model.description.trim(),
      type: this.model.type,
      category: this.model.category.trim() || null,
      amount: this.parsedAmount,
      status: this.model.status,
      transactionDate: this.model.transactionDate,
      notes: this.model.notes.trim() || null,
    });
  }

  protected close(): void {
    if (this.saving) return;
    this.closed.emit();
  }

  private emptyModel(): TransactionFormModel {
    return {
      clinicId: this.clinics[0]?.id ?? '',
      type: 'RECEITA',
      description: '',
      category: '',
      amountDisplay: '',
      status: 'PENDING',
      transactionDate: new Date().toISOString().slice(0, 10),
      notes: '',
    };
  }
}
