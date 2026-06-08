import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InventoryCatalogComponent } from '../../components/inventory-catalog/inventory-catalog.component';
import { InventoryLowStockAlertComponent } from '../../components/inventory-low-stock-alert/inventory-low-stock-alert.component';
import { AuthService } from '../../../../core/services/auth.service';
import { ClinicOption, InventoryItem } from '../../models/inventory.model';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-inventory-page',
  imports: [
    FormsModule,
    InventoryCatalogComponent,
    InventoryLowStockAlertComponent,
  ],
  template: `
    <section class="min-h-screen bg-[#F9F9F9] px-5 py-6 sm:px-8 lg:px-12">
      <div class="mx-auto max-w-7xl">
        <header class="flex flex-col gap-4 border-b border-[#EEE8E5] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <h1 class="font-serif text-3xl font-bold text-[#7D5147] sm:text-4xl">
            Gestão de Estoque
          </h1>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              class="h-12 rounded-full bg-white px-5 text-sm font-semibold text-[#6F6661] shadow-sm outline-none focus:ring-2 focus:ring-[#B98577]"
              [ngModel]="selectedClinicId()"
              (ngModelChange)="selectClinic($event)"
            >
              @for (clinic of clinics(); track clinic.id) {
                <option [value]="clinic.id">{{ clinic.name }}</option>
              }
            </select>

            <label class="flex h-12 min-w-0 items-center gap-3 rounded-full bg-white px-5 text-sm text-[#8A817C] shadow-sm sm:w-72">
              <span class="text-lg text-[#57514D]" aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Buscar insumos..."
                [ngModel]="searchTerm()"
                (ngModelChange)="searchTerm.set($event)"
                class="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-[#A9A19C]"
              />
            </label>

            <button
              type="button"
              class="h-11 rounded-full px-4 text-sm font-semibold text-[#8B574B] transition hover:bg-[#EFE8E5]"
              (click)="loadItems()"
            >
              Atualizar
            </button>
          </div>
        </header>

        @if (errorMessage()) {
          <div class="mt-6 rounded-xl bg-[#FFD8D5] px-5 py-4 text-sm font-semibold text-[#B1111D]">
            {{ errorMessage() }}
          </div>
        }

        @if (isLoading()) {
          <div class="mt-12 rounded-xl bg-white px-8 py-10 text-center text-sm font-semibold text-[#8A817C] shadow-sm ring-1 ring-[#EEE8E5]">
            Carregando estoque...
          </div>
        } @else if (!selectedClinicId()) {
          <div class="mt-12 rounded-xl bg-white px-8 py-10 text-center text-sm font-semibold text-[#8A817C] shadow-sm ring-1 ring-[#EEE8E5]">
            Cadastre uma clínica antes de gerenciar o estoque.
          </div>
        } @else {
          @if (lowStockItems().length > 0) {
            <div class="mt-8">
              <app-inventory-low-stock-alert [items]="lowStockItems()" />
            </div>
          }

          <app-inventory-catalog [items]="filteredItems()" />
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly inventoryService = inject(InventoryService);

  protected readonly clinics = signal<ClinicOption[]>([]);
  protected readonly items = signal<InventoryItem[]>([]);
  protected readonly selectedClinicId = signal('');
  protected readonly searchTerm = signal('');
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  protected readonly filteredItems = computed(() => {
    const term = this.searchTerm().trim().toLocaleLowerCase('pt-BR');

    if (!term) {
      return this.items();
    }

    return this.items().filter((item) => {
      return [item.name, item.description ?? '', item.sku ?? '', item.unit]
        .join(' ')
        .toLocaleLowerCase('pt-BR')
        .includes(term);
    });
  });

  protected readonly lowStockItems = computed(() => {
    return this.items().filter((item) => {
      return item.minimumQuantity !== null && item.currentQuantity <= item.minimumQuantity;
    });
  });

  ngOnInit(): void {
    this.authService.ensureDevSession().subscribe({
      next: () => this.loadClinics(),
      error: (error: unknown) => this.showError(error),
    });
  }

  protected selectClinic(clinicId: string): void {
    this.selectedClinicId.set(clinicId);
    this.loadItems();
  }

  protected loadItems(): void {
    const clinicId = this.selectedClinicId();

    if (!clinicId) {
      this.items.set([]);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.inventoryService.listItems(clinicId).subscribe({
      next: (items) => {
        this.items.set(items);
        this.isLoading.set(false);
      },
      error: (error: unknown) => this.showError(error),
    });
  }

  private loadClinics(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.inventoryService.listClinics().subscribe({
      next: (clinics) => {
        this.clinics.set(clinics);
        this.selectedClinicId.set(clinics[0]?.id ?? '');
        this.isLoading.set(false);
        this.loadItems();
      },
      error: (error: unknown) => this.showError(error),
    });
  }

  private showError(error: unknown): void {
    this.isLoading.set(false);
    this.errorMessage.set(error instanceof Error ? error.message : 'Não foi possível carregar o estoque.');
  }
}
