import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CollaboratorConfirmModalComponent } from '../../components/collaborator-confirm-modal.component';
import { CollaboratorStatusBadgeComponent } from '../../components/collaborator-status-badge.component';
import { CollaboratorFormComponent } from '../../components/collaborator-form.component';
import { CollaboratorsApi } from '../../api/collaborators.api';
import {
  COLLABORATOR_ROLE_OPTIONS,
  Collaborator,
  CollaboratorListFilters,
  CollaboratorRole,
} from '../../models/collaborator.models';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-collaborators-page',
  imports: [CollaboratorStatusBadgeComponent, CollaboratorConfirmModalComponent, CollaboratorFormComponent],
  template: `
    <div class="min-h-screen bg-[#FAFAF9] text-[#4D453F]" style="font-family: 'Manrope', sans-serif">
      <section class="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
        <header class="flex flex-col gap-5 rounded-[32px] bg-white px-6 py-6 shadow-[0_18px_45px_-32px_rgba(28,25,23,0.25)] sm:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-3xl space-y-3">
            <p class="text-xs font-semibold uppercase tracking-[0.32em] text-[#B28C7D]">Equipe clínica</p>
            <h1 class="text-4xl font-bold leading-tight text-[#7C5145] sm:text-5xl" style="font-family: 'Noto Serif', serif">
              Gestão de Colaboradores
            </h1>
            <p class="max-w-2xl text-sm leading-7 text-[#726863] sm:text-base">
              Gerencie nomes, papéis, unidades, status e ações rápidas em uma interface clara e responsiva.
            </p>
          </div>

          <button
            type="button"
            class="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#8B5E4E] px-5 text-sm font-semibold text-white shadow-[0_14px_28px_-18px_rgba(139,94,78,0.8)] transition hover:bg-[#744A40]"
            (click)="openCreateForm()"
          >
            <span class="text-lg leading-none">+</span>
            Novo Colaborador
          </button>
        </header>

        <section class="grid gap-4 rounded-[32px] bg-white px-5 py-5 shadow-[0_18px_45px_-36px_rgba(28,25,23,0.28)] lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] lg:items-end">
          <label class="space-y-2">
            <span class="text-sm font-semibold text-[#6E625C]">Buscar por nome, e-mail ou documento</span>
            <div class="flex items-center gap-2 rounded-2xl border border-[#E9DFD9] bg-[#FAF7F5] px-4 py-3 focus-within:border-[#B48A7C] focus-within:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]">
              <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0 stroke-[#B8ADA7]" fill="none" stroke-width="2">
                <path d="m21 21-4.3-4.3"></path>
                <circle cx="11" cy="11" r="7"></circle>
              </svg>
              <input
                type="search"
                class="min-w-0 flex-1 bg-transparent text-sm text-[#3F3835] outline-none placeholder:text-[#A99F99]"
                placeholder="Ex: Dr. Ricardo, ricardo@..."
                [value]="filters().query"
                (input)="updateFilter('query', $any($event.target).value)"
              />
            </div>
          </label>

          <label class="space-y-2">
            <span class="text-sm font-semibold text-[#6E625C]">Papel</span>
            <select
              class="h-13 w-full rounded-2xl border border-[#E9DFD9] bg-white px-4 text-sm outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
              [value]="filters().role"
              (change)="updateFilter('role', $any($event.target).value)"
            >
              <option value="ALL">Todos</option>
              @for (role of roleOptions; track role.value) {
                <option [value]="role.value">{{ role.label }}</option>
              }
            </select>
          </label>

          <label class="space-y-2">
            <span class="text-sm font-semibold text-[#6E625C]">Unidade</span>
            <select
              class="h-13 w-full rounded-2xl border border-[#E9DFD9] bg-white px-4 text-sm outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
              [value]="filters().workplaceId"
              (change)="updateFilter('workplaceId', $any($event.target).value)"
            >
              <option value="ALL">Todas as unidades</option>
              @for (workplace of workplaces(); track workplace.id) {
                <option [value]="workplace.id">{{ workplace.name }}</option>
              }
            </select>
          </label>

          <label class="space-y-2">
            <span class="text-sm font-semibold text-[#6E625C]">Status</span>
            <select
              class="h-13 w-full rounded-2xl border border-[#E9DFD9] bg-white px-4 text-sm outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
              [value]="filters().status"
              (change)="updateFilter('status', $any($event.target).value)"
            >
              <option value="ALL">Todos</option>
              <option value="ACTIVE">Ativo</option>
              <option value="INACTIVE">Inativo</option>
            </select>
          </label>
        </section>

        @if (loading()) {
          <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            @for (_ of skeletonItems; track $index) {
              <article class="h-64 animate-pulse rounded-[28px] bg-white p-5 shadow-[0_18px_45px_-36px_rgba(28,25,23,0.28)]">
                <div class="h-16 rounded-3xl bg-[#F1ECE8]"></div>
                <div class="mt-4 h-5 w-44 rounded-full bg-[#F1ECE8]"></div>
                <div class="mt-3 h-4 w-56 rounded-full bg-[#F4EFEB]"></div>
                <div class="mt-6 h-10 rounded-2xl bg-[#F4EFEB]"></div>
              </article>
            }
          </section>
        } @else if (!visibleCollaborators().length) {
          <article class="rounded-[28px] bg-white px-6 py-16 text-center shadow-[0_18px_45px_-36px_rgba(28,25,23,0.28)]">
            <h2 class="text-2xl font-semibold text-[#7C5145]" style="font-family: 'Noto Serif', serif">
              Nenhum colaborador encontrado
            </h2>
            <p class="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#726863]">
              Ajuste os filtros ou crie um novo colaborador para começar.
            </p>
          </article>
        } @else {
          <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            @for (collaborator of pagedCollaborators(); track collaborator.id) {
              <article class="rounded-[28px] bg-white p-5 shadow-[0_18px_45px_-36px_rgba(28,25,23,0.28)] transition hover:-translate-y-0.5">
                <div class="flex items-start gap-4">
                  <div class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-[#F4ECE8] text-lg font-bold text-[#8B5E4E]">
                    @if (collaborator.avatarUrl) {
                      <img [src]="collaborator.avatarUrl" [alt]="collaborator.fullName" class="h-full w-full object-cover" />
                    } @else {
                      {{ initials(collaborator) }}
                    }
                  </div>

                  <div class="min-w-0 flex-1">
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <h3 class="truncate text-lg font-semibold text-[#3F3835]">{{ collaborator.fullName }}</h3>
                        <p class="truncate text-sm text-[#7A716B]">{{ collaborator.email }}</p>
                      </div>
                      <button
                        type="button"
                        class="rounded-full p-2 text-[#A29087] transition hover:bg-[#FAF5F2] hover:text-[#8B5E4E]"
                        (click)="openDetails(collaborator)"
                        aria-label="Visualizar detalhes"
                      >
                        <svg viewBox="0 0 24 24" class="h-4 w-4 fill-current" aria-hidden="true">
                          <path d="M12 5c5.5 0 9.6 4.5 10.9 6.3a1.3 1.3 0 0 1 0 1.4C21.6 14.5 17.5 19 12 19S2.4 14.5 1.1 12.7a1.3 1.3 0 0 1 0-1.4C2.4 9.5 6.5 5 12 5Zm0 2C8 7 4.6 10 3.2 12 4.6 14 8 17 12 17s7.4-3 8.8-5c-1.4-2-4.8-5-8.8-5Zm0 1.8A3.2 3.2 0 1 1 12 15a3.2 3.2 0 0 1 0-6.2Zm0 2A1.2 1.2 0 1 0 12 13a1.2 1.2 0 0 0 0-2.2Z"></path>
                        </svg>
                      </button>
                    </div>

                    <div class="mt-4 flex flex-wrap gap-2">
                      @for (role of collaborator.roles; track role) {
                        <span class="rounded-full bg-[#F5ECE8] px-3 py-1 text-xs font-semibold text-[#8B5E4E]">
                          {{ roleLabel(role) }}
                        </span>
                      }
                    </div>
                  </div>
                </div>

                <div class="mt-5 space-y-3 text-sm text-[#6B625D]">
                  <div class="flex items-start gap-2">
                    <span class="mt-0.5 text-[#B28C7D]">✉</span>
                    <span class="break-all">{{ collaborator.email }}</span>
                  </div>
                  <div class="flex items-start gap-2">
                    <span class="mt-0.5 text-[#B28C7D]">🪪</span>
                    <span>{{ collaborator.documentId }}</span>
                  </div>
                  <div class="flex items-start gap-2">
                    <span class="mt-0.5 text-[#B28C7D]">⌂</span>
                    <span class="line-clamp-2">
                      {{ workplaceNames(collaborator) }}
                    </span>
                  </div>
                </div>

                <div class="mt-5 flex items-center justify-between gap-3">
                  <app-collaborator-status-badge [status]="collaborator.status" />

                  <div class="flex items-center gap-1">
                    <button
                      type="button"
                      class="rounded-full px-3 py-2 text-xs font-semibold text-[#7C5145] transition hover:bg-[#FAF5F2]"
                      (click)="openToggleStatusModal(collaborator)"
                    >
                      {{ collaborator.status === 'ACTIVE' ? 'Inativar' : 'Ativar' }}
                    </button>
                    <button
                      type="button"
                      class="rounded-full px-3 py-2 text-xs font-semibold text-[#C4493D] transition hover:bg-[#FEF3F1]"
                      (click)="openDeleteModal(collaborator)"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </article>
            }
          </section>
            @if (totalPages() > 1) {
              <div class="mt-4 flex items-center justify-between">
                <div class="text-sm text-[#726863]">Mostrando {{ showStart() }} - {{ showEnd() }} de {{ visibleCollaborators().length }}</div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="rounded-full border px-3 py-2 text-sm text-[#7C5145] transition hover:bg-[#FAF5F2]"
                    (click)="setPage(page() - 1)"
                    [disabled]="page() === 1"
                  >
                    ‹
                  </button>

                  @for (p of pagesArray(); track p) {
                    <button
                      type="button"
                      class="rounded px-3 py-2 text-sm transition"
                      [class.bg-[#8B5E4E]]="page() === p"
                      [class.text-white]="page() === p"
                      [class.text-[#7C5145]]="page() !== p"
                      (click)="setPage(p)"
                    >
                      {{ p }}
                    </button>
                  }

                  <button
                    type="button"
                    class="rounded-full border px-3 py-2 text-sm text-[#7C5145] transition hover:bg-[#FAF5F2]"
                    (click)="setPage(page() + 1)"
                    [disabled]="page() === totalPages()"
                  >
                    ›
                  </button>
                </div>
              </div>
            }
        }
      </section>
    </div>

    <app-collaborator-confirm-modal
      [open]="deleteModalOpen()"
      title="Excluir colaborador?"
      description="Esta ação remove o colaborador do mock local e não pode ser desfeita."
      confirmLabel="Sim, excluir"
      cancelLabel="Cancelar"
      variant="danger"
      (confirm)="confirmDelete()"
      (cancel)="closeDeleteModal()"
    />

    <app-collaborator-confirm-modal
      [open]="statusModalOpen()"
      [title]="statusModalTitle()"
      [description]="statusModalDescription()"
      [confirmLabel]="statusModalConfirmLabel()"
      cancelLabel="Cancelar"
      (confirm)="confirmToggleStatus()"
      (cancel)="closeStatusModal()"
    />

    @if (detailsOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
        <button type="button" class="absolute inset-0 bg-black/45 backdrop-blur-[2px]" (click)="closeDetails()" aria-label="Fechar detalhes"></button>
        <section class="relative z-10 w-full max-w-3xl rounded-[32px] bg-white px-6 py-6 shadow-[0px_32px_60px_-24px_rgba(28,25,23,0.45)] sm:px-8" role="dialog" aria-modal="true" aria-labelledby="collaborator-details-title">
          @if (viewingCollaborator(); as collaborator) {
            <div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div class="flex items-start gap-4">
                <div class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-[#F4ECE8] text-lg font-bold text-[#8B5E4E]">
                  @if (collaborator.avatarUrl) {
                    <img [src]="collaborator.avatarUrl" [alt]="collaborator.fullName" class="h-full w-full object-cover" />
                  } @else {
                    {{ initials(collaborator) }}
                  }
                </div>
                <div>
                  <h2 id="collaborator-details-title" class="text-2xl font-semibold text-[#7C5145]" style="font-family: 'Noto Serif', serif">
                    {{ collaborator.fullName }}
                  </h2>
                  <p class="mt-1 text-sm text-[#726863]">{{ collaborator.email }}</p>
                </div>
              </div>

              <app-collaborator-status-badge [status]="collaborator.status" />
            </div>

            <div class="mt-6 grid gap-4 sm:grid-cols-2">
              <div class="rounded-3xl bg-[#FAF7F5] p-4">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[#A29087]">Documento</p>
                <p class="mt-2 text-sm text-[#4B4440]">{{ collaborator.documentId }}</p>
              </div>
              <div class="rounded-3xl bg-[#FAF7F5] p-4">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[#A29087]">Telefone</p>
                <p class="mt-2 text-sm text-[#4B4440]">{{ collaborator.phone || '—' }}</p>
              </div>
              <div class="rounded-3xl bg-[#FAF7F5] p-4">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[#A29087]">Roles</p>
                <p class="mt-2 text-sm text-[#4B4440]">{{ rolesLabel(collaborator) }}</p>
              </div>
              <div class="rounded-3xl bg-[#FAF7F5] p-4">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[#A29087]">Unidades</p>
                <p class="mt-2 text-sm text-[#4B4440]">{{ workplaceNames(collaborator) }}</p>
              </div>
            </div>

            <div class="mt-6 rounded-3xl bg-[#FAF7F5] p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[#A29087]">Observações</p>
              <p class="mt-2 text-sm leading-7 text-[#4B4440]">{{ collaborator.notes || 'Sem observações cadastradas.' }}</p>
            </div>

            <div class="mt-6 flex justify-end">
              <div class="flex gap-3">
                <button type="button" class="rounded-2xl border px-5 py-3 text-sm font-semibold text-[#7C5145] transition hover:bg-[#FAF5F2]" (click)="openEditForm(viewingCollaborator()!)">Editar</button>
                <button type="button" class="rounded-2xl bg-[#8B5E4E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#744A40]" (click)="closeDetails()">
                  Fechar
                </button>
              </div>
            </div>
          }
        </section>
      </div>
    }

    @if (formOpen()) {
      <app-collaborator-form
        [editingId]="formEditingId()"
        [initial]="formInitial()"
        (saved)="onFormSaved()"
        (cancelled)="onFormCancelled()"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollaboratorsPageComponent implements OnInit {
  private readonly collaboratorsApi = inject(CollaboratorsApi);
  private readonly toastService = inject(ToastService);

  protected readonly skeletonItems = Array.from({ length: 6 });
  protected readonly loading = signal(true);
  protected readonly collaborators = signal<Collaborator[]>([]);
  protected readonly filters = signal<CollaboratorListFilters>({
    query: '',
    role: 'ALL',
    workplaceId: 'ALL',
    status: 'ALL',
  });
  protected readonly selectedCollaborator = signal<Collaborator | null>(null);
  protected readonly collaboratorPendingDelete = signal<Collaborator | null>(null);
  protected readonly collaboratorPendingToggle = signal<Collaborator | null>(null);
  protected readonly viewingCollaborator = computed(() => this.selectedCollaborator());

  protected readonly roleOptions = COLLABORATOR_ROLE_OPTIONS;
  protected readonly workplaces = signal(this.collaboratorsApi.getCollections().workplaces);

  protected readonly visibleCollaborators = computed(() => {
    const filters = this.filters();
    const query = filters.query.trim().toLowerCase();

    return this.collaborators().filter((collaborator) => {
      const matchesQuery =
        !query ||
        [collaborator.fullName, collaborator.email, collaborator.documentId].some((value) =>
          value.toLowerCase().includes(query),
        );
      const matchesRole = filters.role === 'ALL' || collaborator.roles.includes(filters.role);
      const matchesWorkplace =
        filters.workplaceId === 'ALL' || collaborator.workplaceIds.includes(filters.workplaceId);
      const matchesStatus = filters.status === 'ALL' || collaborator.status === filters.status;

      return matchesQuery && matchesRole && matchesWorkplace && matchesStatus;
    });
  });

  // Pagination
  protected readonly page = signal(1);
  protected readonly pageSize = 6;
  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.visibleCollaborators().length / this.pageSize)));
  protected readonly pagedCollaborators = computed(() => {
    const p = Math.max(1, Math.min(this.page(), this.totalPages()));
    const start = (p - 1) * this.pageSize;
    return this.visibleCollaborators().slice(start, start + this.pageSize);
  });

  protected readonly pagesArray = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));
  protected readonly showStart = computed(() => (this.visibleCollaborators().length ? (this.page() - 1) * this.pageSize + 1 : 0));
  protected readonly showEnd = computed(() => Math.min(this.page() * this.pageSize, this.visibleCollaborators().length));

  protected readonly detailsOpen = computed(() => !!this.selectedCollaborator());
  protected readonly deleteModalOpen = computed(() => !!this.collaboratorPendingDelete());
  protected readonly statusModalOpen = computed(() => !!this.collaboratorPendingToggle());
  protected readonly statusModalTitle = computed(() => {
    const collaborator = this.collaboratorPendingToggle();
    if (!collaborator) return 'Alterar status?';
    return collaborator.status === 'ACTIVE' ? 'Inativar colaborador?' : 'Ativar colaborador?';
  });
  protected readonly statusModalDescription = computed(() => {
    const collaborator = this.collaboratorPendingToggle();
    if (!collaborator) return 'Tem certeza que deseja alterar o status deste colaborador?';
    return collaborator.status === 'ACTIVE'
      ? `O colaborador ${collaborator.fullName} ficará inativo até ser reativado novamente.`
      : `O colaborador ${collaborator.fullName} voltará a aparecer como ativo para a equipe.`;
  });
  protected readonly statusModalConfirmLabel = computed(() => {
    const collaborator = this.collaboratorPendingToggle();
    if (!collaborator) return 'Confirmar';
    return collaborator.status === 'ACTIVE' ? 'Sim, inativar' : 'Sim, ativar';
  });

  protected readonly formOpen = signal(false);
  protected readonly formEditingId = signal<string | null>(null);
  protected readonly formInitial = signal<import('../../models/collaborator.models').CollaboratorFormValue | null>(null);

  ngOnInit(): void {
    this.collaboratorsApi.fetchCollections().subscribe({
      next: (cols) => this.workplaces.set(cols.workplaces),
      error: () => {},
    });
    this.loadCollaborators();
  }

  protected openCreateForm(): void {
    this.formEditingId.set(null);
    this.formInitial.set(this.collaboratorsApi.createDraft());
    this.formOpen.set(true);
  }

  protected setPage(n: number): void {
    const max = this.totalPages();
    const next = Math.max(1, Math.min(n, max));
    this.page.set(next);
  }

  protected openEditForm(collaborator: import('../../models/collaborator.models').Collaborator): void {
    if (!collaborator) return;
    this.formEditingId.set(collaborator.id);
    this.collaboratorsApi.getById(collaborator.id).subscribe({
      next: (full) => {
        if (full) {
          this.formInitial.set(this.collaboratorsApi.cloneForm(full as any));
        } else {
          this.formInitial.set(this.collaboratorsApi.createDraft());
        }
        this.formOpen.set(true);
      },
      error: () => {
        this.toastService.error('Não foi possível carregar os dados do colaborador para edição.');
      },
    });
  }

  protected closeForm(): void {
    this.formOpen.set(false);
    this.formEditingId.set(null);
    this.formInitial.set(null);
  }

  protected onFormSaved(): void {
    this.closeForm();
    this.loadCollaborators();
  }

  protected onFormCancelled(): void {
    this.closeForm();
  }

  protected updateFilter(field: keyof CollaboratorListFilters, value: string): void {
    this.filters.update((current) => ({
      ...current,
      [field]: value,
    }));
    this.page.set(1);
  }

  protected openDetails(collaborator: Collaborator): void {
    this.selectedCollaborator.set(collaborator);
  }

  protected closeDetails(): void {
    this.selectedCollaborator.set(null);
  }

  protected openDeleteModal(collaborator: Collaborator): void {
    this.collaboratorPendingDelete.set(collaborator);
  }

  protected closeDeleteModal(): void {
    this.collaboratorPendingDelete.set(null);
  }

  protected confirmDelete(): void {
    const collaborator = this.collaboratorPendingDelete();
    if (!collaborator) {
      return;
    }

    this.collaboratorsApi.delete(collaborator.id).subscribe({
      next: () => {
        this.collaborators.update((items) => items.filter((item) => item.id !== collaborator.id));
        this.closeDeleteModal();
        this.toastService.success(`Colaborador ${collaborator.fullName} removido com sucesso.`);
      },
      error: () => {
        this.toastService.error('Não foi possível excluir o colaborador.');
      },
    });
  }

  protected openToggleStatusModal(collaborator: Collaborator): void {
    this.collaboratorPendingToggle.set(collaborator);
  }

  protected closeStatusModal(): void {
    this.collaboratorPendingToggle.set(null);
  }

  protected confirmToggleStatus(): void {
    const collaborator = this.collaboratorPendingToggle();
    if (!collaborator) {
      return;
    }

    this.collaboratorsApi.toggleStatus(collaborator.id).subscribe({
      next: (updated) => {
        if (!updated) {
          return;
        }

        this.collaborators.update((items) =>
          items.map((item) => (item.id === updated.id ? updated : item)),
        );
        this.toastService.success(
          updated.status === 'ACTIVE'
            ? `Colaborador ${updated.fullName} reativado.`
            : `Colaborador ${updated.fullName} inativado.`,
        );
        this.closeStatusModal();
      },
      error: () => {
        this.toastService.error('Não foi possível alterar o status.');
      },
    });
  }

  protected initials(collaborator: Collaborator): string {
    return this.collaboratorsApi.getInitials(collaborator.fullName);
  }

  protected roleLabel(role: CollaboratorRole): string {
    return this.collaboratorsApi.displayRole(role);
  }

  protected rolesLabel(collaborator: Collaborator): string {
    return collaborator.roles.map((role) => this.roleLabel(role)).join(', ');
  }

  protected workplaceNames(collaborator: Collaborator): string {
    const workplaces = this.workplaces();
    return collaborator.workplaceIds
      .map((id) => workplaces.find((workplace) => workplace.id === id)?.name ?? 'Unidade')
      .join(', ');
  }

  protected showNotReadyToast(): void {
    this.toastService.info('O formulário completo de colaboradores será conectado na próxima etapa.');
  }

  private loadCollaborators(): void {
    this.loading.set(true);
    this.collaboratorsApi.list().subscribe({
      next: (items) => {
        this.collaborators.set(items);
        this.loading.set(false);
        this.page.set(1);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Não foi possível carregar os colaboradores.');
      },
    });
  }
}
