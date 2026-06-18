import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  SimpleChanges,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { Material, Procedure, ProcedureStatus, ToothState } from '../../models/treatment.model';
import { MaterialsTableComponent } from '../materials-table/materials-table.component';
import { OdontogramGridComponent } from '../odontogram-grid/odontogram-grid.component';
import { TreatmentService } from '../../services/treatment.service';
import { ConfirmDeleteModalComponent } from '../../../../shared/components/feedback/confirm-delete-modal/confirm-delete-modal.component';
import { Observable, forkJoin } from 'rxjs';

const PROCEDURE_TYPES = [
  'Cirurgia',
  'Restauração',
  'Estética',
  'Ortodontia',
  'Endodontia',
  'Periodontia',
  'Implante',
  'Prótese',
  'Prevenção',
  'Outros',
];

type StatusOption = { value: ProcedureStatus; label: string };

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'pending', label: 'Pendente' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'completed', label: 'Concluído' },
  { value: 'interrupted', label: 'Observação' },
];

const MOCK_MATERIALS: Omit<Material, 'quantity'>[] = [
  { name: 'Resina Composta', category: 'Restauração' },
  { name: 'Amálgama', category: 'Restauração' },
  { name: 'Cimento de Ionômero de Vidro', category: 'Restauração' },
  { name: 'Anestésico Local', category: 'Cirurgia' },
  { name: 'Fio de Sutura', category: 'Cirurgia' },
  { name: 'Gaze Estéril', category: 'Cirurgia' },
  { name: 'Braquete Metálico', category: 'Ortodontia' },
  { name: 'Fio Ortodôntico', category: 'Ortodontia' },
  { name: 'Escova Interdental', category: 'Prevenção' },
  { name: 'Flúor Gel', category: 'Prevenção' },
];

const API_STATUS: Record<ProcedureStatus, string> = {
  pending: 'PENDING',
  in_progress: 'APPROVED',
  completed: 'DONE',
  interrupted: 'CANCELLED',
};

interface ProcedureFormGroup {
  name: FormControl<string>;
  type: FormControl<string>;
  startDate: FormControl<string>;
  endDate: FormControl<string>;
  value: FormControl<string>;
}

@Component({
  selector: 'app-procedure-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    OdontogramGridComponent,
    MaterialsTableComponent,
    ConfirmDeleteModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="px-6 py-8 md:px-12">
      <!-- Page header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1
            class="text-[clamp(32px,4vw,48px)] leading-tight text-[#7C5145]"
            style="font-family: 'Noto Serif', serif; font-weight: 400;"
          >
            {{ isEdit() ? 'Editar Procedimento' : 'Novo Procedimento' }}
          </h1>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <span class="text-sm text-[#78716C]">Paciente:</span>
            <span
              class="rounded-full px-3 py-1 text-sm font-semibold text-[#1A1C1C]"
              style="background: #F3F3F3;"
              >{{ patientName() }}</span
            >
            <span class="text-sm text-[#78716C]">{{ patientCode() }}</span>
          </div>
        </div>

        <div class="flex shrink-0 flex-wrap items-center gap-3">
          @if (isEdit()) {
            <button
              type="button"
              class="rounded-xl px-5 py-3 text-sm font-bold transition hover:opacity-80"
              style="background: #FEE2E2; color: #991B1B; border-radius: 12px;"
              (click)="openDeleteConfirm()"
            >
              Excluir
            </button>
          }
          <button
            type="button"
            class="rounded-xl px-5 py-3 text-sm font-bold text-[#7C5145] transition hover:opacity-80"
            style="background: #F3F3F3; border-radius: 12px;"
            (click)="onCancel()"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="rounded-xl px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
            style="background: #7C5145; border-radius: 12px; box-shadow: var(--shadow-btn);"
            [disabled]="saving()"
            (click)="onSave()"
          >
            {{ saving() ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>

      <!-- Error banner -->
      @if (saveError()) {
        <div class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ saveError() }}
        </div>
      }

      <!-- Form card -->
      <div class="mt-8 rounded-4xl p-6 md:p-8" style="background: #F3F3F3;">
        <p class="text-[20px] font-bold text-[#1A1C1C]" style="font-family: 'Noto Serif', serif;">
          Descrição do procedimento
        </p>

        <form [formGroup]="form" class="mt-6 space-y-8">
          <!-- Row 1: Name | Type -->
          <div class="grid gap-6 md:grid-cols-2">
            <div class="flex flex-col gap-2">
              <label
                class="text-[12px] font-bold uppercase text-[#78716C]"
                style="font-family: Manrope, sans-serif; letter-spacing: 0.6px;"
                >Nome *</label
              >
              <input
                formControlName="name"
                type="text"
                placeholder="Ex: Extração de Siso"
                class="rounded-xl px-4 py-4.25 text-base outline-none transition"
                style="background: #EEEEEE; font-family: Manrope, sans-serif; border: 2px solid transparent;"
                [style.border-color]="
                  form.controls.name.touched && form.controls.name.invalid
                    ? '#B20000'
                    : 'transparent'
                "
              />
              @if (form.controls.name.touched && form.controls.name.invalid) {
                <span class="text-xs text-red-600">Nome é obrigatório.</span>
              }
            </div>

            <div class="flex flex-col gap-2">
              <label
                class="text-[12px] font-bold uppercase text-[#78716C]"
                style="font-family: Manrope, sans-serif; letter-spacing: 0.6px;"
                >Tipo</label
              >
              <select
                formControlName="type"
                class="rounded-xl px-4 py-4.25 text-base outline-none transition opacity-50 cursor-not-allowed"
                style="background: #EEEEEE; font-family: Manrope, sans-serif; border: 2px solid transparent; appearance: none;"
              >
                <option value="" disabled>Selecione o tipo</option>
                @for (t of procedureTypes; track t) {
                  <option [value]="t">{{ t }}</option>
                }
              </select>
              <span class="text-[11px] text-[#78716C]" style="font-family: Manrope, sans-serif;">
                Aguardando suporte do backend para salvar este campo.
              </span>
            </div>
          </div>

          <!-- Row 2: Dates -->
          <div class="grid gap-6 md:grid-cols-2">
            <div class="flex flex-col gap-2">
              <label
                class="text-[12px] font-bold uppercase text-[#78716C]"
                style="font-family: Manrope, sans-serif; letter-spacing: 0.6px;"
                >Data do início do tratamento</label
              >
              <input
                formControlName="startDate"
                type="date"
                class="rounded-xl px-4 py-4.25 text-base outline-none transition"
                style="background: #EEEEEE; font-family: Manrope, sans-serif; border: 2px solid transparent;"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label
                class="text-[12px] font-bold uppercase text-[#78716C]"
                style="font-family: Manrope, sans-serif; letter-spacing: 0.6px;"
                >Data do fim do tratamento</label
              >
              <input
                formControlName="endDate"
                type="date"
                class="rounded-xl px-4 py-4.25 text-base outline-none transition"
                style="background: #EEEEEE; font-family: Manrope, sans-serif; border: 2px solid transparent;"
              />
            </div>
          </div>

          <!-- Row 3: Value -->
          <div class="flex flex-col gap-2">
            <label
              class="text-[12px] font-bold uppercase text-[#78716C]"
              style="font-family: Manrope, sans-serif; letter-spacing: 0.6px;"
              >Valor do procedimento *</label
            >
            <div
              class="flex items-center overflow-hidden rounded-xl"
              style="background: #EEEEEE; border: 2px solid transparent;"
              [style.border-color]="
                form.controls.value.touched && form.controls.value.invalid
                  ? '#B20000'
                  : 'transparent'
              "
            >
              <span
                class="px-4 text-base font-semibold text-[#78716C]"
                style="font-family: Manrope, sans-serif;"
                >R$</span
              >
              <input
                formControlName="value"
                type="text"
                placeholder="0,00"
                class="flex-1 bg-transparent py-4.25 pr-4 text-base outline-none"
                style="font-family: Manrope, sans-serif;"
                (blur)="formatValue()"
              />
            </div>
            @if (form.controls.value.touched && form.controls.value.invalid) {
              <span class="text-xs text-red-600">Valor é obrigatório.</span>
            }
          </div>

          <!-- Row 4: Materials select + quantity -->
          <div class="flex flex-col gap-2">
            <label
              class="text-[12px] font-bold uppercase text-[#78716C]"
              style="font-family: Manrope, sans-serif; letter-spacing: 0.6px;"
              >Materiais</label
            >
            <div class="flex items-center gap-2">
              <select
                [formControl]="materialSelectControl"
                class="flex-1 rounded-xl px-4 py-4.25 text-base outline-none transition"
                style="background: #EEEEEE; font-family: Manrope, sans-serif; border: 2px solid transparent; appearance: none; cursor: pointer;"
              >
                <option value="">Selecione um material</option>
                @for (m of mockMaterials; track m.name) {
                  <option [value]="m.name">{{ m.name }}</option>
                }
              </select>

              <!-- Quantity input -->
              <div
                class="flex items-center overflow-hidden rounded-xl"
                style="background: #EEEEEE; min-width: 100px;"
              >
                <button
                  type="button"
                  class="px-3 py-4.25 text-lg font-bold text-[#7C5145] transition hover:bg-[#E4DCD9] disabled:opacity-30"
                  [disabled]="materialQty() <= 1"
                  (click)="materialQty.update((q) => Math.max(1, q - 1))"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  class="w-10 bg-transparent py-4.25 text-center text-base font-semibold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style="font-family: Manrope, sans-serif;"
                  [value]="materialQty()"
                  (change)="onQtyInputChange($event)"
                />
                <button
                  type="button"
                  class="px-3 py-4.25 text-lg font-bold text-[#7C5145] transition hover:bg-[#E4DCD9]"
                  (click)="materialQty.update((q) => q + 1)"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                class="shrink-0 rounded-xl px-5 text-sm font-bold text-white transition hover:opacity-90"
                style="background: #7C5145; border-radius: 12px; padding-top: 17px; padding-bottom: 17px;"
                (click)="addMaterial()"
              >
                Adicionar
              </button>
            </div>
            <a
              routerLink="/materiais/novo"
              class="mt-1 self-start text-[12px] font-semibold text-[#7C5145] hover:underline"
              style="font-family: Manrope, sans-serif;"
            >
              + Cadastrar novo material
            </a>

            <!-- Materials table -->
            @if (materials().length > 0) {
              <div class="mt-3">
                <app-materials-table
                  [materials]="materials()"
                  [readonly]="false"
                  (removeItem)="removeMaterial($event)"
                  (quantityChange)="onQuantityChange($event)"
                />
              </div>
            }
          </div>

          <!-- Odontogram -->
          <div>
            <label
              class="mb-3 block text-[12px] font-bold uppercase text-[#78716C]"
              style="font-family: Manrope, sans-serif; letter-spacing: 0.6px;"
              >Dentes relacionados</label
            >
            <div class="rounded-4xl bg-white p-6" style="box-shadow: var(--shadow-card);">
              <app-odontogram-grid
                [toothStates]="toothStatesSignal()"
                [readonly]="false"
                (toothToggled)="onToothToggled($event)"
              />
            </div>
          </div>

          <!-- Status selector -->
          <div>
            <label
              class="mb-3 block text-[12px] font-bold uppercase text-[#78716C]"
              style="font-family: Manrope, sans-serif; letter-spacing: 0.6px;"
              >Status *</label
            >
            <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
              @for (opt of statusOptions; track opt.value) {
                <button
                  type="button"
                  class="flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition"
                  [style.background]="
                    selectedStatus() === opt.value ? 'rgba(124,81,69,0.10)' : '#E2E2E2'
                  "
                  [style.border]="
                    selectedStatus() === opt.value ? '2px solid #7C5145' : '2px solid transparent'
                  "
                  [style.color]="selectedStatus() === opt.value ? '#7C5145' : '#69594A'"
                  (click)="selectedStatus.set(opt.value)"
                >
                  <span
                    class="h-4 w-4 shrink-0 rounded-full border"
                    [style.background]="selectedStatus() === opt.value ? '#7C5145' : 'white'"
                    [style.border-color]="selectedStatus() === opt.value ? '#7C5145' : '#6B7280'"
                  ></span>
                  {{ opt.label }}
                </button>
              }
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <app-confirm-delete-modal
      [open]="deleteConfirmOpen()"
      title="Excluir Procedimento?"
      description="Tem certeza que deseja remover este procedimento? Esta ação não pode ser desfeita."
      confirmLabel="Sim, Excluir"
      cancelLabel="Cancelar"
      (confirm)="onDeleteConfirmed()"
      (cancel)="deleteConfirmOpen.set(false)"
    />
  `,
})
export class ProcedureFormComponent implements OnChanges {
  treatmentId = input.required<string>();
  patientId = input.required<string>();
  patientName = input.required<string>();
  patientCode = input.required<string>();
  isEdit = input<boolean>(false);
  existingProcedure = input<Procedure | null>(null);

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private treatmentService = inject(TreatmentService);

  protected readonly procedureTypes = PROCEDURE_TYPES;
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly mockMaterials = MOCK_MATERIALS;
  protected readonly Math = Math;

  protected selectedTeeth = signal<number[]>([]);
  protected materials = signal<Material[]>([]);
  protected selectedStatus = signal<ProcedureStatus>('in_progress');
  protected materialSelectControl = new FormControl<string>('');
  protected materialQty = signal<number>(1);
  protected saving = signal(false);
  protected saveError = signal<string | null>(null);
  protected deleteConfirmOpen = signal(false);

  protected form: FormGroup<ProcedureFormGroup> = this.fb.group({
    name: this.fb.nonNullable.control('', Validators.required),
    type: this.fb.nonNullable.control({ value: '', disabled: true }),
    startDate: this.fb.nonNullable.control(''),
    endDate: this.fb.nonNullable.control(''),
    value: this.fb.nonNullable.control('', Validators.required),
  }) as FormGroup<ProcedureFormGroup>;

  protected toothStatesSignal = computed<Record<number, ToothState>>(() =>
    this.selectedTeeth().reduce<Record<number, ToothState>>((acc, t) => {
      acc[t] = 'pending';
      return acc;
    }, {}),
  );

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['existingProcedure']) {
      const proc = this.existingProcedure();
      if (proc) {
        this.form.patchValue({
          name: proc.name,
          type: proc.type,
          startDate: this.ptBrToIso(proc.startDate),
          endDate: this.ptBrToIso(proc.endDate),
          value: proc.value.toFixed(2).replace('.', ','),
        });
        this.selectedTeeth.set([...proc.teeth]);
        this.materials.set([...proc.materials]);
        this.selectedStatus.set(proc.status);
      } else {
        this.form.reset();
        this.selectedTeeth.set([]);
        this.materials.set([]);
        this.selectedStatus.set('in_progress');
      }
    }
  }

  private ptBrToIso(date: string): string {
    if (!date) return '';
    const parts = date.split('/');
    if (parts.length !== 3) return date;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  protected formatValue(): void {
    const raw = this.form.controls.value.value.trim();
    if (!raw) return;
    const num = parseFloat(raw.replace(/\./g, '').replace(',', '.'));
    if (!isNaN(num)) {
      this.form.controls.value.setValue(num.toFixed(2).replace('.', ','));
    }
  }

  protected addMaterial(): void {
    const name = this.materialSelectControl.value ?? '';
    if (!name) return;
    const found = MOCK_MATERIALS.find((m) => m.name === name);
    if (!found) return;
    const qty = this.materialQty();
    this.materials.update((list) => {
      const existing = list.findIndex((m) => m.name === name);
      if (existing >= 0) {
        return list.map((m, i) => (i === existing ? { ...m, quantity: m.quantity + qty } : m));
      }
      return [...list, { name: found.name, category: found.category, quantity: qty }];
    });
    this.materialSelectControl.reset('');
    this.materialQty.set(1);
  }

  protected onQtyInputChange(event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    this.materialQty.set(isNaN(val) || val < 1 ? 1 : val);
  }

  protected onToothToggled(tooth: number): void {
    this.selectedTeeth.update((teeth) =>
      teeth.includes(tooth) ? teeth.filter((t) => t !== tooth) : [...teeth, tooth],
    );
  }

  protected removeMaterial(index: number): void {
    this.materials.update((list) => list.filter((_, i) => i !== index));
  }

  protected onQuantityChange(event: { index: number; delta: number }): void {
    this.materials.update((list) =>
      list.map((m, i) =>
        i === event.index ? { ...m, quantity: Math.max(1, m.quantity + event.delta) } : m,
      ),
    );
  }

  protected onSave(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const rawValue = this.form.controls.value.value.trim();
    const estimatedPrice = parseFloat(rawValue.replace(/\./g, '').replace(',', '.')) || 0;
    const description = this.form.controls.name.value;
    const status = API_STATUS[this.selectedStatus()];
    const teeth = this.selectedTeeth();
    const materials = this.materials();

    this.saving.set(true);
    this.saveError.set(null);

    const proc = this.existingProcedure();
    let request$: Observable<unknown>;

    if (proc) {
      // Slots to save: at least 1 item (null tooth if none selected)
      const newSlots: (number | undefined)[] = teeth.length > 0 ? teeth : [undefined];
      const oldIds = proc.ids;

      const updateCount = Math.min(oldIds.length, newSlots.length);
      const updates = oldIds.slice(0, updateCount).map((id, i) =>
        this.treatmentService.updateProcedureItem(id, {
          description,
          estimatedPrice,
          status,
          toothNumber: newSlots[i],
          materials,
        }),
      );
      const deletes = oldIds
        .slice(updateCount)
        .map((id) => this.treatmentService.deleteProcedureItem(id));
      const creates = newSlots.slice(updateCount).map((toothNumber) =>
        this.treatmentService.createProcedureItem(this.treatmentId(), {
          description,
          estimatedPrice,
          status,
          toothNumber,
          materials,
        }),
      );

      request$ = forkJoin([...updates, ...deletes, ...creates]);
    } else {
      const toothList = teeth.length > 0 ? teeth : [undefined];
      request$ = forkJoin(
        toothList.map((toothNumber) =>
          this.treatmentService.createProcedureItem(this.treatmentId(), {
            description,
            estimatedPrice,
            status,
            toothNumber,
            materials,
          }),
        ),
      );
    }

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/treatments', this.patientId()]);
      },
      error: () => {
        this.saving.set(false);
        this.saveError.set('Não foi possível salvar o procedimento. Tente novamente.');
      },
    });
  }

  protected openDeleteConfirm(): void {
    this.deleteConfirmOpen.set(true);
  }

  protected onDeleteConfirmed(): void {
    const proc = this.existingProcedure();
    if (!proc) return;
    this.deleteConfirmOpen.set(false);
    forkJoin(proc.ids.map((id) => this.treatmentService.deleteProcedureItem(id))).subscribe({
      next: () => void this.router.navigate(['/treatments', this.patientId()]),
      error: () => this.saveError.set('Não foi possível excluir o procedimento. Tente novamente.'),
    });
  }

  protected onCancel(): void {
    void this.router.navigate(['/treatments', this.patientId()]);
  }
}
