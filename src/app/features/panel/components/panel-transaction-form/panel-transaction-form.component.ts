import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencyMaskDirective } from '../../../../shared/directives/currency-mask.directive';
import {
  ClinicSummaryDto,
  FinancialTransactionCreatePayload,
  FinancialTransactionUpdatePayload,
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
          <h3 class="font-serif text-lg font-bold text-stone-800 m-0">
            {{ isEditing ? 'Editar Transação' : 'Nova Transação' }}
          </h3>
          <p class="text-sm text-stone-500 m-0 mt-1">
            {{
              isEditing
                ? 'Altere os dados da transação abaixo.'
                : 'Preencha os campos abaixo para atualizar o caixa.'
            }}
          </p>
        </div>

        <div
          *ngIf="errorMessage"
          class="px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold"
        >
          {{ errorMessage }}
        </div>

        <div
          *ngIf="isTreatmentLinked"
          class="px-3 py-2.5 rounded-lg bg-sky-50 border border-sky-100 text-sky-700 text-[11px] sm:text-xs font-medium leading-relaxed"
        >
          <strong class="font-bold">Origem de Tratamento:</strong> Algumas informações financeiras
          estão bloqueadas para edição direta.
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
              [disabled]="isEditing"
              class="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#A77769] disabled:bg-stone-100 disabled:text-stone-500"
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
                (click)="!isTreatmentLinked && (model.type = 'RECEITA')"
                [disabled]="isTreatmentLinked"
                [class]="
                  model.type === 'RECEITA'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-500'
                    : 'bg-stone-50 text-stone-600 border-stone-200'
                "
                class="py-2 text-xs font-bold rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Receita
              </button>
              <button
                type="button"
                (click)="!isTreatmentLinked && (model.type = 'DESPESA')"
                [disabled]="isTreatmentLinked"
                [class]="
                  model.type === 'DESPESA'
                    ? 'bg-red-100 text-red-800 border-red-500'
                    : 'bg-stone-50 text-stone-600 border-stone-200'
                "
                class="py-2 text-xs font-bold rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                [disabled]="isTreatmentLinked"
                placeholder="Ex: Consultas, Materiais"
                class="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A77769] disabled:bg-stone-100 disabled:text-stone-500 disabled:cursor-not-allowed"
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
                [disabled]="isTreatmentLinked"
                placeholder="R$ 0,00"
                class="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A77769] disabled:bg-stone-100 disabled:text-stone-500 disabled:cursor-not-allowed"
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
                [disabled]="isTreatmentLinked"
                class="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A77769] disabled:bg-stone-100 disabled:text-stone-500 disabled:cursor-not-allowed"
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
                <option *ngIf="isEditing" value="CANCELLED">Cancelado</option>
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
              {{
                saving ? 'Salvando...' : isEditing ? 'Atualizar Transação' : 'Confirmar Lançamento'
              }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class TransactionFormModalComponent implements OnChanges {
  private _open = false;

  @Input() set open(value: boolean) {
    this._open = value;
    if (value && !this.transaction) {
      this.model = this.emptyModel();
    }
  }
  get open(): boolean {
    return this._open;
  }

  @Input() clinics: ClinicSummaryDto[] = [];
  @Input() saving = false;
  @Input() errorMessage: string | null = null;
  @Input() transaction: any = null;

  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<
    FinancialTransactionCreatePayload | FinancialTransactionUpdatePayload
  >();

  protected model: TransactionFormModel = this.emptyModel();

  get isEditing(): boolean {
    return !!this.transaction;
  }

  get isTreatmentLinked(): boolean {
    return !!this.transaction?.treatmentPlanId;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transaction'] && this.transaction) {
      this.populateModel(this.transaction);
    } else if (changes['transaction'] && !this.transaction && this.open) {
      this.model = this.emptyModel();
    }
  }

  protected get isValid(): boolean {
    return (
      (this.isEditing || !!this.model.clinicId) &&
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

    const payload: any = {
      description: this.model.description.trim(),
      status: this.model.status,
      notes: this.model.notes.trim() || null,

      type: this.isTreatmentLinked ? this.transaction.type : this.model.type,
      category: this.isTreatmentLinked
        ? this.transaction.category
        : this.model.category.trim() || null,
      amount: this.isTreatmentLinked
        ? Math.abs(this.transaction.amount || this.transaction.value || 0)
        : this.parsedAmount,
      transactionDate: this.isTreatmentLinked
        ? this.formatDateToIso(this.transaction.transactionDate || this.transaction.date)
        : this.model.transactionDate,
    };

    if (!this.isEditing) {
      payload.clinicId = this.model.clinicId;
    }

    this.submitted.emit(payload);
  }

  private formatDateToIso(dateStr: string): string {
    if (!dateStr) return new Date().toISOString().slice(0, 10);
    if (dateStr.includes('/')) {
      const [d, m, y] = dateStr.split('/');
      return `${y}-${m}-${d}`;
    }
    return dateStr;
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

  private populateModel(data: any): void {
    let tDate = data.transactionDate || data.date;
    if (tDate && tDate.includes('/')) {
      const parts = tDate.split('/');
      if (parts.length === 3) tDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    let tStatus = data.status;
    const statusMap: Record<string, string> = {
      Concluído: 'COMPLETED',
      Pago: 'PAID',
      Pendente: 'PENDING',
      Cancelado: 'CANCELLED',
    };
    tStatus = statusMap[tStatus] || tStatus;

    const val = Math.abs(data.amount || data.value || 0);
    const amountStr = val.toLocaleString('pr-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const tType = data.type || (data.category?.toUpperCase() === 'DESPESA' ? 'DESPESA' : 'RECEITA');

    this.model = {
      clinicId: data.clinicId ?? '',
      type: tType,
      description: data.description || '',
      category:
        data.category &&
        data.category.toLowerCase() !== 'receita' &&
        data.category.toLowerCase() !== 'despesa'
          ? data.category
          : '',
      amountDisplay: amountStr,
      status: tStatus,
      transactionDate: tDate || new Date().toISOString().slice(0, 10),
      notes: data.notes || '',
    };
  }
}
