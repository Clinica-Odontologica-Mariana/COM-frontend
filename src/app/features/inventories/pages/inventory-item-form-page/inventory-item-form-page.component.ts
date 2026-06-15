import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { concatMap, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { InventoryItemFormComponent } from '../../components/inventory-item-form/inventory-item-form.component';
import { INVENTORY_TYPE_OPTIONS, INVENTORY_UNIT_OPTIONS } from '../../data/inventory.mock';
import {
  ClinicOption,
  InventoryItem,
  InventoryItemCreatePayload,
  InventoryItemUpdatePayload,
} from '../../models/inventory.model';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-inventory-item-form-page',
  imports: [RouterLink, InventoryItemFormComponent],
  template: `
    <section class="min-h-screen bg-[#F9F9F9] px-5 py-8 sm:px-8 lg:px-12">
      <div class="mx-auto max-w-5xl">
        <header class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <h1 class="font-serif text-4xl font-medium leading-tight text-[#7D5147] sm:text-5xl">
            Materiais e Equipamentos
          </h1>

          <div class="flex gap-4 sm:pt-1">
            <a
              class="inline-flex h-12 min-w-36 items-center justify-center rounded-lg bg-white px-8 text-sm font-bold text-[#8B574B] shadow-[0_8px_18px_rgba(0,0,0,0.12)] transition hover:bg-[#F1ECE9]"
              routerLink="/inventories"
            >
              Cancelar
            </a>
            @if (isEditMode()) {
              <button
                type="button"
                class="inline-flex h-12 min-w-36 items-center justify-center rounded-lg bg-white px-8 text-sm font-bold text-[#8B574B] shadow-[0_8px_18px_rgba(0,0,0,0.12)] transition hover:bg-[#F1ECE9]"
                [disabled]="isSaving()"
                (click)="deleteItem()"
              >
                Excluir
              </button>
            }
            <button
              type="button"
              class="inline-flex h-12 min-w-36 items-center justify-center rounded-lg bg-[#8B574B] px-8 text-sm font-bold text-white shadow-[0_8px_18px_rgba(139,87,75,0.3)] transition hover:bg-[#744A40]"
              [disabled]="isSaving()"
              (click)="save()"
            >
              {{ isSaving() ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </header>

        @if (errorMessage()) {
          <div class="mt-6 rounded-xl bg-[#FFD8D5] px-5 py-4 text-sm font-semibold text-[#B1111D]">
            {{ errorMessage() }}
          </div>
        }

        <div class="mt-12">
          <app-inventory-item-form
            [form]="itemForm"
            [typeOptions]="typeOptions"
            [unitOptions]="unitOptions"
            [clinics]="clinics()"
            [title]="isEditMode() ? 'Editar Item' : 'Cadastrar Item'"
            [showClinicField]="!isEditMode()"
            [showInitialQuantity]="!isEditMode()"
            [showQuantityAdjustment]="isEditMode()"
          />
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryItemFormPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly inventoryService = inject(InventoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly typeOptions = INVENTORY_TYPE_OPTIONS;
  protected readonly unitOptions = INVENTORY_UNIT_OPTIONS;
  protected readonly clinics = signal<ClinicOption[]>([]);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly itemId = signal<string | null>(null);
  protected readonly isEditMode = signal(false);
  private readonly originalQuantity = signal(0);

  protected readonly itemForm = this.formBuilder.group({
    name: ['', Validators.required],
    type: ['', Validators.required],
    clinicId: ['', Validators.required],
    unit: ['', Validators.required],
    sku: [''],
    description: [''],
    minimumQuantity: [null as number | null, [decimalQuantityValidator()]],
    initialQuantity: [0 as number | null, [Validators.required, decimalQuantityValidator()]],
    adjustedQuantity: [0 as number | null, [Validators.required, decimalQuantityValidator()]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.itemId.set(id);
    this.isEditMode.set(Boolean(id));

    this.authService.ensureDevSession().subscribe({
      next: () => {
        if (id) {
          this.loadItem(id);
          return;
        }

        this.loadClinics();
      },
      error: (error: unknown) => this.showError(error),
    });
  }

  protected save(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    const itemId = this.itemId();

    if (itemId) {
      this.inventoryService.updateItem(itemId, this.buildUpdatePayload()).pipe(
        concatMap((item) => this.adjustQuantityIfNeeded(item.id)),
      ).subscribe({
        next: () => void this.router.navigate(['/inventories']),
        error: (error: unknown) => this.showError(error),
      });
      return;
    }

    this.inventoryService
      .createItem(this.buildCreatePayload(), this.toNumber(this.itemForm.controls.initialQuantity.value))
      .subscribe({
        next: () => void this.router.navigate(['/inventories']),
        error: (error: unknown) => this.showError(error),
      });
  }

  protected deleteItem(): void {
    const itemId = this.itemId();

    if (!itemId) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    this.inventoryService.deleteItem(itemId).subscribe({
      next: () => void this.router.navigate(['/inventories']),
      error: (error: unknown) => this.showError(error),
    });
  }

  private loadClinics(): void {
    this.inventoryService.listClinics().subscribe({
      next: (clinics) => {
        this.clinics.set(clinics);
        this.itemForm.controls.clinicId.setValue(clinics[0]?.id ?? '');
      },
      error: (error: unknown) => this.showError(error),
    });
  }

  private loadItem(id: string): void {
    this.inventoryService.findItem(id).subscribe({
      next: (item) => this.patchForm(item),
      error: (error: unknown) => this.showError(error),
    });
  }

  private patchForm(item: InventoryItem): void {
    this.originalQuantity.set(Number(item.currentQuantity) || 0);

    this.itemForm.patchValue({
      name: item.name,
      type: item.itemType,
      clinicId: item.clinicId,
      unit: item.unit,
      sku: item.sku ?? '',
      description: item.description ?? '',
      minimumQuantity: item.minimumQuantity ?? 0,
      initialQuantity: item.currentQuantity,
      adjustedQuantity: item.currentQuantity,
    });
  }

  private buildCreatePayload(): InventoryItemCreatePayload {
    return {
      clinicId: this.itemForm.controls.clinicId.value ?? '',
      itemType: this.itemForm.controls.type.value as InventoryItemCreatePayload['itemType'],
      name: (this.itemForm.controls.name.value ?? '').trim(),
      description: this.emptyToNull(this.itemForm.controls.description.value ?? ''),
      sku: this.emptyToNull(this.itemForm.controls.sku.value ?? ''),
      unit: (this.itemForm.controls.unit.value ?? '').trim(),
      minimumQuantity: this.toNullableNumber(this.itemForm.controls.minimumQuantity.value),
    };
  }

  private buildUpdatePayload(): InventoryItemUpdatePayload {
    const payload = this.buildCreatePayload();
    const { clinicId: _clinicId, ...updatePayload } = payload;

    return updatePayload;
  }

  private emptyToNull(value: string): string | null {
    const trimmed = value.trim();

    return trimmed ? trimmed : null;
  }

  private toNullableNumber(value: number | string | null): number | null {
    if (value === null || value === '') {
      return null;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  private toNumber(value: number | string | null): number {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  private adjustQuantityIfNeeded(itemId: string) {
    const adjustedQuantity = this.toNumber(this.itemForm.controls.adjustedQuantity.value);
    const originalQuantity = this.originalQuantity();

    if (adjustedQuantity === originalQuantity) {
      return of(null);
    }

    if (adjustedQuantity === 0 && originalQuantity > 0) {
      return this.inventoryService.createMovement({
        inventoryItemId: itemId,
        movementType: 'OUT',
        quantity: originalQuantity,
        reason: 'Zerar estoque pelo cadastro de estoque',
      });
    }

    return this.inventoryService.createMovement({
      inventoryItemId: itemId,
      movementType: 'ADJUSTMENT',
      quantity: adjustedQuantity,
      reason: 'Ajuste manual pelo cadastro de estoque',
    });
  }

  private showError(error: unknown): void {
    this.isSaving.set(false);
    this.errorMessage.set(error instanceof Error ? error.message : 'Não foi possível salvar o item.');
  }
}

function decimalQuantityValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as number | string | null;

    if (value === null || value === '') {
      return null;
    }

    const normalized = String(value).replace(',', '.');

    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
      return { decimalQuantity: true };
    }

    const numericValue = Number(normalized);

    return Number.isFinite(numericValue) && numericValue >= 0 ? null : { decimalQuantity: true };
  };
}
