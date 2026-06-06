import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InventoryItemFormComponent } from '../../components/inventory-item-form/inventory-item-form.component';
import { INVENTORY_TYPE_OPTIONS } from '../../data/inventory.mock';

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
              routerLink="/inventories"
              class="inline-flex h-12 min-w-36 items-center justify-center rounded-lg bg-white px-8 text-sm font-bold text-[#8B574B] shadow-[0_8px_18px_rgba(0,0,0,0.12)] transition hover:bg-[#F1ECE9]"
            >
              Excluir
            </a>
            <button
              type="button"
              class="inline-flex h-12 min-w-36 items-center justify-center rounded-lg bg-[#8B574B] px-8 text-sm font-bold text-white shadow-[0_8px_18px_rgba(139,87,75,0.3)] transition hover:bg-[#744A40]"
              (click)="save()"
            >
              Salvar
            </button>
          </div>
        </header>

        <div class="mt-12">
          <app-inventory-item-form [form]="itemForm" [typeOptions]="typeOptions" />
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryItemFormPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly typeOptions = INVENTORY_TYPE_OPTIONS;
  protected readonly itemForm = this.formBuilder.group({
    name: ['', Validators.required],
    type: ['', Validators.required],
    purchaseDate: ['', Validators.required],
    expirationDate: [''],
    quantity: [null, [Validators.required, Validators.min(0)]],
    purchaseValue: [''],
  });

  protected save(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    void this.router.navigate(['/inventories']);
  }
}
