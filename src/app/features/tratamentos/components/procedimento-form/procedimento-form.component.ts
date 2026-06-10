import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { Material, Procedure, ProcedureStatus, ToothState } from '../../models/tratamento.model';
import { MaterialsTableComponent } from '../materials-table/materials-table.component';
import { OdontogramGridComponent } from '../odontogram-grid/odontogram-grid.component';

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
  { value: 'planejado', label: 'Planejado' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'concluido', label: 'Finalizado' },
  { value: 'interrompido', label: 'Interrompido' },
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

interface ProcedimentoForm {
  nome: FormControl<string>;
  tipo: FormControl<string>;
  dataInicio: FormControl<string>;
  dataFim: FormControl<string>;
  valor: FormControl<string>;
}

@Component({
  selector: 'app-procedimento-form',
  imports: [ReactiveFormsModule, RouterLink, OdontogramGridComponent, MaterialsTableComponent],
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
            Procedimento
          </h1>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <span class="text-sm text-[#78716C]">Paciente:</span>
            <span
              class="rounded-full px-3 py-1 text-sm font-semibold text-[#1A1C1C]"
              style="background: #F3F3F3;"
            >{{ patientName() }}</span>
            <span class="text-sm text-[#78716C]">{{ patientCode() }}</span>
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-3">
          <button
            type="button"
            class="rounded-xl px-5 py-3 text-sm font-bold text-[#7C5145] transition hover:opacity-80"
            style="background: #F3F3F3; border-radius: 12px;"
            (click)="onCancel()"
          >
            {{ isEdit() ? 'Excluir' : 'Cancelar' }}
          </button>
          <button
            type="button"
            class="rounded-xl px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
            style="background: #7C5145; border-radius: 12px; box-shadow: var(--shadow-btn);"
            (click)="onSave()"
          >
            Salvar
          </button>
        </div>
      </div>

      <!-- Form card -->
      <div class="mt-8 rounded-[32px] p-6 md:p-8" style="background: #F3F3F3;">
        <p class="text-[20px] font-bold text-[#1A1C1C]" style="font-family: 'Noto Serif', serif;">
          Descrição do procedimento
        </p>

        <form [formGroup]="form" class="mt-6 space-y-8">
          <!-- Row 1: Nome | Tipo -->
          <div class="grid gap-6 md:grid-cols-2">
            <div class="flex flex-col gap-2">
              <label
                class="text-[12px] font-bold uppercase text-[#78716C]"
                style="font-family: Manrope, sans-serif; letter-spacing: 0.6px;"
              >Nome</label>
              <input
                formControlName="nome"
                type="text"
                placeholder="Ex: Extração de Siso"
                class="rounded-xl px-4 py-[17px] text-base outline-none transition"
                style="background: #EEEEEE; font-family: Manrope, sans-serif; border: 2px solid transparent;"
                [style.border-color]="form.controls.nome.touched && form.controls.nome.invalid ? '#B20000' : 'transparent'"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label
                class="text-[12px] font-bold uppercase text-[#78716C]"
                style="font-family: Manrope, sans-serif; letter-spacing: 0.6px;"
              >Tipo</label>
              <select
                formControlName="tipo"
                class="rounded-xl px-4 py-[17px] text-base outline-none transition"
                style="background: #EEEEEE; font-family: Manrope, sans-serif; border: 2px solid transparent; appearance: none; cursor: pointer;"
              >
                <option value="" disabled>Selecione o tipo</option>
                @for (t of procedureTypes; track t) {
                  <option [value]="t">{{ t }}</option>
                }
              </select>
            </div>
          </div>

          <!-- Row 2: Datas -->
          <div class="grid gap-6 md:grid-cols-2">
            <div class="flex flex-col gap-2">
              <label
                class="text-[12px] font-bold uppercase text-[#78716C]"
                style="font-family: Manrope, sans-serif; letter-spacing: 0.6px;"
              >Data do início do tratamento</label>
              <input
                formControlName="dataInicio"
                type="date"
                class="rounded-xl px-4 py-[17px] text-base outline-none transition"
                style="background: #EEEEEE; font-family: Manrope, sans-serif; border: 2px solid transparent;"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label
                class="text-[12px] font-bold uppercase text-[#78716C]"
                style="font-family: Manrope, sans-serif; letter-spacing: 0.6px;"
              >Data do fim do tratamento</label>
              <input
                formControlName="dataFim"
                type="date"
                class="rounded-xl px-4 py-[17px] text-base outline-none transition"
                style="background: #EEEEEE; font-family: Manrope, sans-serif; border: 2px solid transparent;"
              />
            </div>
          </div>

          <!-- Row 3: Valor (full width) -->
          <div class="flex flex-col gap-2">
            <label
              class="text-[12px] font-bold uppercase text-[#78716C]"
              style="font-family: Manrope, sans-serif; letter-spacing: 0.6px;"
            >Valor do procedimento</label>
            <div class="flex items-center overflow-hidden rounded-xl" style="background: #EEEEEE;">
              <span class="px-4 text-base font-semibold text-[#78716C]" style="font-family: Manrope, sans-serif;">R$</span>
              <input
                formControlName="valor"
                type="text"
                placeholder="0,00"
                class="flex-1 bg-transparent py-[17px] pr-4 text-base outline-none"
                style="font-family: Manrope, sans-serif;"
                (blur)="formatValor()"
              />
            </div>
          </div>

          <!-- Row 4: Materiais select -->
          <div class="flex flex-col gap-2">
            <label
              class="text-[12px] font-bold uppercase text-[#78716C]"
              style="font-family: Manrope, sans-serif; letter-spacing: 0.6px;"
            >Materiais</label>
            <div class="flex items-center gap-2">
              <select
                [formControl]="materialSelectControl"
                class="flex-1 rounded-xl px-4 py-[17px] text-base outline-none transition"
                style="background: #EEEEEE; font-family: Manrope, sans-serif; border: 2px solid transparent; appearance: none; cursor: pointer;"
              >
                <option value="">Selecione um material</option>
                @for (m of mockMaterials; track m.name) {
                  <option [value]="m.name">{{ m.name }} — {{ m.category }}</option>
                }
              </select>
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
          </div>

          <!-- Odontogram -->
          <div>
            <label
              class="mb-3 block text-[12px] font-bold uppercase text-[#78716C]"
              style="font-family: Manrope, sans-serif; letter-spacing: 0.6px;"
            >Dentes relacionados</label>
            <div class="rounded-[32px] bg-white p-6" style="box-shadow: var(--shadow-card);">
              <app-odontogram-grid
                [toothStates]="toothStatesSignal()"
                [readonly]="false"
                (toothToggled)="onToothToggled($event)"
              />
            </div>
          </div>

          <!-- Materials table -->
          @if (materials().length > 0) {
            <div>
              <label
                class="mb-3 block text-[12px] font-bold uppercase text-[#78716C]"
                style="font-family: Manrope, sans-serif; letter-spacing: 0.6px;"
              >Materiais adicionados</label>
              <app-materials-table
                [materials]="materials()"
                [readonly]="false"
                (removeItem)="removeMaterial($event)"
              />
            </div>
          }

          <!-- Status selector -->
          <div>
            <label
              class="mb-3 block text-[12px] font-bold uppercase text-[#78716C]"
              style="font-family: Manrope, sans-serif; letter-spacing: 0.6px;"
            >Status</label>
            <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
              @for (opt of statusOptions; track opt.value) {
                <button
                  type="button"
                  class="flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition"
                  [style.background]="selectedStatus() === opt.value ? 'rgba(124,81,69,0.10)' : '#E2E2E2'"
                  [style.border]="selectedStatus() === opt.value ? '2px solid #7C5145' : '2px solid transparent'"
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
  `,
})
export class ProcedimentoFormComponent implements OnInit {
  tratamentoId = input.required<string>();
  patientName = input.required<string>();
  patientCode = input.required<string>();
  isEdit = input<boolean>(false);
  existingProcedure = input<Procedure | null>(null);

  private fb = inject(FormBuilder);
  private router = inject(Router);

  protected readonly procedureTypes = PROCEDURE_TYPES;
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly mockMaterials = MOCK_MATERIALS;

  protected selectedTeeth = signal<number[]>([]);
  protected materials = signal<Material[]>([]);
  protected selectedStatus = signal<ProcedureStatus>('em_andamento');
  protected materialSelectControl = new FormControl<string>('');

  protected form: FormGroup<ProcedimentoForm> = this.fb.group({
    nome: this.fb.nonNullable.control('', Validators.required),
    tipo: this.fb.nonNullable.control('', Validators.required),
    dataInicio: this.fb.nonNullable.control(''),
    dataFim: this.fb.nonNullable.control(''),
    valor: this.fb.nonNullable.control(''),
  }) as FormGroup<ProcedimentoForm>;

  protected toothStatesSignal = computed<Record<number, ToothState>>(() =>
    this.selectedTeeth().reduce<Record<number, ToothState>>((acc, t) => {
      acc[t] = 'selected';
      return acc;
    }, {}),
  );

  ngOnInit(): void {
    const proc = this.existingProcedure();
    if (proc) {
      this.form.patchValue({
        nome: proc.nome,
        tipo: proc.tipo,
        dataInicio: proc.dataInicio,
        dataFim: proc.dataFim,
        valor: proc.valor.toFixed(2).replace('.', ','),
      });
      this.selectedTeeth.set([...proc.dentes]);
      this.materials.set([...proc.materiais]);
      this.selectedStatus.set(proc.status);
    }
  }

  protected formatValor(): void {
    const raw = this.form.controls.valor.value.trim();
    if (!raw) return;
    const num = parseFloat(raw.replace(/\./g, '').replace(',', '.'));
    if (!isNaN(num)) {
      this.form.controls.valor.setValue(num.toFixed(2).replace('.', ','));
    }
  }

  protected addMaterial(): void {
    const name = this.materialSelectControl.value ?? '';
    if (!name) return;
    const found = MOCK_MATERIALS.find((m) => m.name === name);
    if (!found) return;
    if (this.materials().some((m) => m.name === name)) return;
    this.materials.update((list) => [...list, { name: found.name, category: found.category, quantity: 1 }]);
    this.materialSelectControl.reset('');
  }

  protected onToothToggled(tooth: number): void {
    this.selectedTeeth.update((teeth) =>
      teeth.includes(tooth) ? teeth.filter((t) => t !== tooth) : [...teeth, tooth],
    );
  }

  protected removeMaterial(index: number): void {
    this.materials.update((list) => list.filter((_, i) => i !== index));
  }

  protected onSave(): void {
    this.router.navigate(['/tratamentos', this.tratamentoId()]);
  }

  protected onCancel(): void {
    this.router.navigate(['/tratamentos', this.tratamentoId()]);
  }
}
