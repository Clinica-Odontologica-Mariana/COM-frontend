import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { InventoryCatalogComponent } from '../../components/inventory-catalog/inventory-catalog.component';
import { InventoryLowStockAlertComponent } from '../../components/inventory-low-stock-alert/inventory-low-stock-alert.component';
import { AuthService } from '../../../../core/services/auth.service';
import {
  ClinicOption,
  InventoryItem,
  InventoryItemType,
  InventoryStatus,
} from '../../models/inventory.model';
import { InventoryService } from '../../services/inventory.service';
import { INVENTORY_TYPE_OPTIONS, INVENTORY_UNIT_OPTIONS } from '../../data/inventory.mock';

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
                (ngModelChange)="updateSearch($event)"
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
        @if (successMessage()) {
          <div class="mt-6 rounded-xl bg-[#DFF9E8] px-5 py-4 text-sm font-semibold text-[#247B49]">
            {{ successMessage() }}
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
              <app-inventory-low-stock-alert
                [items]="lowStockItems()"
                (restockRequested)="openRestockModal()"
              />
            </div>
          }

          <app-inventory-catalog
            [items]="paginatedItems()"
            [activeFiltersCount]="activeFiltersCount()"
            (filtersRequested)="openFilters()"
          />

          @if (filteredItems().length > pageSize()) {
            <nav class="mt-5 flex flex-col gap-3 text-sm text-[#6F6661] sm:flex-row sm:items-center sm:justify-between">
              <span>
                Exibindo {{ pageStart() + 1 }}-{{ pageEnd() }} de {{ filteredItems().length }} itens
              </span>

              <div class="flex gap-2">
                <button
                  type="button"
                  class="h-10 rounded-lg border border-[#E3D7D1] bg-white px-4 font-bold text-[#8B574B] transition hover:bg-[#F5EFEC] disabled:cursor-not-allowed disabled:opacity-50"
                  [disabled]="currentPage() === 1"
                  (click)="previousPage()"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  class="h-10 rounded-lg border border-[#E3D7D1] bg-white px-4 font-bold text-[#8B574B] transition hover:bg-[#F5EFEC] disabled:cursor-not-allowed disabled:opacity-50"
                  [disabled]="currentPage() === totalPages()"
                  (click)="nextPage()"
                >
                  Próxima
                </button>
              </div>
            </nav>
          }
        }
      </div>

      @if (filtersOpen()) {
        <div class="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4" role="presentation">
          <section
            class="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Filtros de estoque"
          >
            <div class="flex items-start justify-between gap-4">
              <h2 class="font-serif text-2xl font-bold text-[#7D5147]">Filtros</h2>
              <button
                type="button"
                class="grid h-9 w-9 place-items-center rounded-lg text-[#78716C] transition hover:bg-[#F1ECE9]"
                aria-label="Fechar filtros"
                (click)="closeFilters()"
              >
                x
              </button>
            </div>

            <div class="mt-6 grid gap-4">
              <label class="grid gap-2">
                <span class="text-xs font-extrabold uppercase tracking-wide text-[#7D7772]">Tipo</span>
                <select
                  class="h-12 rounded-xl bg-[#EDEDED] px-4 text-sm text-[#6F6661] outline-none focus:ring-2 focus:ring-[#B98577]"
                  [ngModel]="typeFilter()"
                  (ngModelChange)="typeFilter.set($event)"
                >
                  <option value="">Todos</option>
                  @for (option of typeOptions; track option.value) {
                    <option [value]="option.value">{{ option.label }}</option>
                  }
                </select>
              </label>

              <label class="grid gap-2">
                <span class="text-xs font-extrabold uppercase tracking-wide text-[#7D7772]">Unidade</span>
                <select
                  class="h-12 rounded-xl bg-[#EDEDED] px-4 text-sm text-[#6F6661] outline-none focus:ring-2 focus:ring-[#B98577]"
                  [ngModel]="unitFilter()"
                  (ngModelChange)="unitFilter.set($event)"
                >
                  <option value="">Todas</option>
                  @for (option of unitOptions; track option.value) {
                    <option [value]="option.value">{{ option.label }}</option>
                  }
                </select>
              </label>

              <label class="grid gap-2">
                <span class="text-xs font-extrabold uppercase tracking-wide text-[#7D7772]">Status</span>
                <select
                  class="h-12 rounded-xl bg-[#EDEDED] px-4 text-sm text-[#6F6661] outline-none focus:ring-2 focus:ring-[#B98577]"
                  [ngModel]="statusFilter()"
                  (ngModelChange)="statusFilter.set($event)"
                >
                  <option value="">Todos</option>
                  <option value="critico">Crítico</option>
                  <option value="estavel">Estável</option>
                </select>
              </label>
            </div>

            <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                class="h-11 rounded-lg border border-[#E3D7D1] bg-white px-5 text-sm font-bold text-[#8B574B] transition hover:bg-[#F5EFEC]"
                (click)="clearFilters()"
              >
                Limpar
              </button>
              <button
                type="button"
                class="h-11 rounded-lg bg-[#8B574B] px-5 text-sm font-bold text-white transition hover:bg-[#744A40]"
                (click)="applyFilters()"
              >
                Aplicar
              </button>
            </div>
          </section>
        </div>
      }

      @if (restockOpen()) {
        <div class="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4" role="presentation">
          <section
            class="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Cadastrar reposição"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="font-serif text-2xl font-bold text-[#B1111D]">Cadastrar reposição</h2>
                <p class="mt-1 text-sm text-[#8A817C]">
                  Informe a quantidade de entrada para os itens em estoque baixo.
                </p>
              </div>
              <button
                type="button"
                class="grid h-9 w-9 place-items-center rounded-lg text-[#78716C] transition hover:bg-[#F1ECE9]"
                aria-label="Fechar reposição"
                (click)="closeRestockModal()"
              >
                x
              </button>
            </div>

            @if (errorMessage()) {
              <div class="mt-5 rounded-xl bg-[#FFD8D5] px-4 py-3 text-sm font-semibold text-[#B1111D]">
                {{ errorMessage() }}
              </div>
            }

            <div class="mt-6 max-h-[55vh] space-y-3 overflow-y-auto pr-1">
              @for (item of lowStockItems(); track item.id) {
                <label class="grid gap-3 rounded-xl border border-[#EEE8E5] p-4 sm:grid-cols-[1fr_10rem] sm:items-center">
                  <span>
                    <strong class="block text-sm text-[#2D2926]">{{ item.name }}</strong>
                    <span class="mt-1 block text-xs text-[#8A817C]">
                      Atual: {{ item.currentQuantity }} {{ item.unit }} · mínimo:
                      {{ item.minimumQuantity }}
                    </span>
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    class="h-11 rounded-lg bg-[#EDEDED] px-3 text-sm text-[#2D2926] outline-none focus:ring-2 focus:ring-[#B98577]"
                    [ngModel]="restockQuantities()[item.id] ?? ''"
                    (ngModelChange)="updateRestockQuantity(item.id, $event)"
                    (keydown)="blockInvalidNumberInput($event)"
                    (paste)="blockInvalidNumberPaste($event)"
                  />
                </label>
              }
            </div>

            <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                class="h-11 rounded-lg border border-[#E3D7D1] bg-white px-5 text-sm font-bold text-[#8B574B] transition hover:bg-[#F5EFEC]"
                (click)="closeRestockModal()"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="h-11 rounded-lg bg-[#C91920] px-5 text-sm font-bold text-white transition hover:bg-[#A9141A] disabled:cursor-not-allowed disabled:opacity-60"
                [disabled]="isRestocking()"
                (click)="saveRestock()"
              >
                {{ isRestocking() ? 'Salvando...' : 'Confirmar reposição' }}
              </button>
            </div>
          </section>
        </div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly inventoryService = inject(InventoryService);

  protected readonly typeOptions = INVENTORY_TYPE_OPTIONS;
  protected readonly unitOptions = INVENTORY_UNIT_OPTIONS;
  protected readonly clinics = signal<ClinicOption[]>([]);
  protected readonly items = signal<InventoryItem[]>([]);
  protected readonly selectedClinicId = signal('');
  protected readonly searchTerm = signal('');
  protected readonly typeFilter = signal<InventoryItemType | ''>('');
  protected readonly unitFilter = signal('');
  protected readonly statusFilter = signal<InventoryStatus | ''>('');
  protected readonly filtersOpen = signal(false);
  protected readonly restockOpen = signal(false);
  protected readonly restockQuantities = signal<Partial<Record<string, string>>>({});
  protected readonly pageSize = signal(10);
  protected readonly currentPage = signal(1);
  protected readonly isLoading = signal(true);
  protected readonly isRestocking = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  protected readonly filteredItems = computed(() => {
    const term = this.searchTerm().trim().toLocaleLowerCase('pt-BR');
    const type = this.typeFilter();
    const unit = this.unitFilter();
    const status = this.statusFilter();

    return this.items().filter((item) => {
      const matchesSearch = !term || [item.name, item.description ?? '', item.sku ?? '', item.unit]
        .join(' ')
        .toLocaleLowerCase('pt-BR')
        .includes(term);

      return (
        matchesSearch &&
        (!type || item.itemType === type) &&
        (!unit || item.unit === unit) &&
        (!status || this.statusFor(item) === status)
      );
    });
  });

  protected readonly pageStart = computed(() => (this.currentPage() - 1) * this.pageSize());
  protected readonly pageEnd = computed(() =>
    Math.min(this.pageStart() + this.pageSize(), this.filteredItems().length),
  );
  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredItems().length / this.pageSize())),
  );
  protected readonly paginatedItems = computed(() =>
    this.filteredItems().slice(this.pageStart(), this.pageEnd()),
  );
  protected readonly activeFiltersCount = computed(() =>
    [this.typeFilter(), this.unitFilter(), this.statusFilter()].filter(Boolean).length,
  );

  protected readonly lowStockItems = computed(() => {
    return this.items().filter((item) => {
      return this.statusFor(item) === 'critico';
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
    this.currentPage.set(1);
    this.loadItems();
  }

  protected updateSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }

  protected openFilters(): void {
    this.filtersOpen.set(true);
  }

  protected closeFilters(): void {
    this.filtersOpen.set(false);
  }

  protected applyFilters(): void {
    this.currentPage.set(1);
    this.closeFilters();
  }

  protected clearFilters(): void {
    this.typeFilter.set('');
    this.unitFilter.set('');
    this.statusFilter.set('');
    this.currentPage.set(1);
  }

  protected previousPage(): void {
    this.currentPage.update((page) => Math.max(1, page - 1));
  }

  protected nextPage(): void {
    this.currentPage.update((page) => Math.min(this.totalPages(), page + 1));
  }

  protected openRestockModal(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.restockQuantities.set(
      Object.fromEntries(this.lowStockItems().map((item) => [item.id, ''])),
    );
    this.restockOpen.set(true);
  }

  protected closeRestockModal(): void {
    if (this.isRestocking()) {
      return;
    }

    this.restockOpen.set(false);
    this.restockQuantities.set({});
  }

  protected updateRestockQuantity(itemId: string, value: string | number | null): void {
    this.restockQuantities.update((quantities) => ({
      ...quantities,
      [itemId]: value === null ? '' : String(value),
    }));
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

  protected saveRestock(): void {
    const movements = this.lowStockItems()
      .map((item) => ({ item, quantity: this.parsePositiveDecimal(this.restockQuantities()[item.id]) }))
      .filter((entry): entry is { item: InventoryItem; quantity: number } => entry.quantity !== null);

    if (!movements.length) {
      this.errorMessage.set('Informe a quantidade de reposição para pelo menos um item.');
      return;
    }

    this.isRestocking.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    forkJoin(
      movements.map(({ item, quantity }) =>
        this.inventoryService.createMovement({
          inventoryItemId: item.id,
          movementType: 'IN',
          quantity,
          reason: 'Reposição de estoque baixo',
        }),
      ),
    )
      .pipe(finalize(() => this.isRestocking.set(false)))
      .subscribe({
        next: () => {
          this.restockOpen.set(false);
          this.restockQuantities.set({});
          this.successMessage.set('Reposição registrada com sucesso.');
          this.loadItems();
        },
        error: (error: unknown) => this.showError(error),
      });
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
        this.currentPage.set(1);
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
    this.isRestocking.set(false);
    this.errorMessage.set(error instanceof Error ? error.message : 'Não foi possível carregar o estoque.');
  }

  private statusFor(item: InventoryItem): InventoryStatus {
    if (item.minimumQuantity !== null && item.currentQuantity <= item.minimumQuantity) {
      return 'critico';
    }

    return 'estavel';
  }

  private parsePositiveDecimal(value: string | undefined): number | null {
    const normalized = value?.trim().replace(',', '.') ?? '';

    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
      return null;
    }

    const quantity = Number(normalized);

    return quantity > 0 ? quantity : null;
  }
}
