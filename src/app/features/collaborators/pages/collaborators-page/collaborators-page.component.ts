import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, finalize, map } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api.config';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDeleteModalComponent } from '../../../../shared/components/feedback/confirm-delete-modal/confirm-delete-modal.component';

type SystemRole = 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST';

interface UserSummary {
  id: string;
  username: string;
  email: string;
  enabled: boolean;
  firstName: string;
  lastName: string;
  role: SystemRole | null;
}

interface CreateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: SystemRole;
}

interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  role?: SystemRole;
}

const ROLE_LABELS: Record<SystemRole, string> = {
  ADMIN: 'Administrador',
  DOCTOR: 'Dentista',
  RECEPTIONIST: 'Recepcionista',
};

@Component({
  selector: 'app-collaborators-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmDeleteModalComponent],
  template: `
    <div class="min-h-screen bg-[#FAFAF9] text-[#4D453F]" style="font-family: 'Manrope', sans-serif">
      <section class="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
        <header class="rounded-[32px] bg-white px-6 py-6 shadow-[0_18px_45px_-32px_rgba(28,25,23,0.25)] sm:px-8">
          <div class="max-w-3xl space-y-3">
            <p class="text-xs font-semibold uppercase tracking-[0.32em] text-[#B28C7D]">Equipe</p>
            <h1 class="text-4xl font-bold leading-tight text-[#7C5145] sm:text-5xl" style="font-family: 'Noto Serif', serif">
              Funcionários
            </h1>
            <p class="text-sm leading-7 text-[#726863] sm:text-base">
              Cadastre os funcionários da clínica, defina o acesso (role) e gerencie a equipe.
            </p>
          </div>
        </header>

        @if (accessChecked() && !isAdmin()) {
          <section class="rounded-[32px] bg-white p-10 text-center shadow-[0_18px_45px_-36px_rgba(28,25,23,0.28)]">
            <h2 class="text-2xl font-semibold text-[#7C5145]" style="font-family: 'Noto Serif', serif">Acesso restrito</h2>
            <p class="mt-3 text-sm leading-7 text-[#726863]">Apenas administradores podem gerenciar funcionários.</p>
          </section>
        } @else if (isAdmin()) {
          <section class="rounded-[32px] bg-white p-6 shadow-[0_18px_45px_-36px_rgba(28,25,23,0.28)] sm:p-8">
            <div class="flex flex-col gap-2">
              <h2 class="text-2xl font-semibold text-[#7C5145]" style="font-family: 'Noto Serif', serif">
                {{ editingId() ? 'Editar funcionário' : 'Novo funcionário' }}
              </h2>
              <p class="text-sm leading-7 text-[#726863]">
                {{ editingId() ? 'Atualize os dados ou troque a role do funcionário.' : 'Os dados criam o acesso no sistema com a role escolhida.' }}
              </p>
            </div>

            <form class="mt-8 grid gap-5 lg:grid-cols-2" [formGroup]="form" (ngSubmit)="submit()">
              <label class="space-y-2">
                <span class="text-sm font-semibold text-[#6C625D]">Primeiro nome *</span>
                <input formControlName="firstName" type="text" [class]="inputClass" />
                @if (invalid('firstName')) {
                  <p class="text-xs text-[#C26E63]">Primeiro nome é obrigatório.</p>
                }
              </label>

              <label class="space-y-2">
                <span class="text-sm font-semibold text-[#6C625D]">Sobrenome *</span>
                <input formControlName="lastName" type="text" [class]="inputClass" />
                @if (invalid('lastName')) {
                  <p class="text-xs text-[#C26E63]">Sobrenome é obrigatório.</p>
                }
              </label>

              <label class="space-y-2">
                <span class="text-sm font-semibold text-[#6C625D]">Usuário *</span>
                <input formControlName="username" type="text" autocomplete="off" [class]="inputClass" [class.opacity-60]="editingId()" />
                @if (editingId()) {
                  <p class="text-xs text-[#A89A92]">O usuário não pode ser alterado.</p>
                } @else if (invalid('username')) {
                  <p class="text-xs text-[#C26E63]">Usuário é obrigatório.</p>
                }
              </label>

              <label class="space-y-2">
                <span class="text-sm font-semibold text-[#6C625D]">E-mail *</span>
                <input formControlName="email" type="email" autocomplete="off" [class]="inputClass" />
                @if (invalid('email')) {
                  <p class="text-xs text-[#C26E63]">Informe um e-mail válido.</p>
                }
              </label>

              @if (!editingId()) {
                <label class="space-y-2">
                  <span class="text-sm font-semibold text-[#6C625D]">Senha *</span>
                  <input formControlName="password" type="password" autocomplete="new-password" [class]="inputClass" />
                  @if (invalid('password')) {
                    <p class="text-xs text-[#C26E63]">A senha precisa de ao menos 8 caracteres.</p>
                  }
                </label>
              }

              <label class="space-y-2">
                <span class="text-sm font-semibold text-[#6C625D]">Acesso (role){{ editingId() ? '' : ' *' }}</span>
                <select formControlName="role" [class]="inputClass">
                  @if (editingId()) {
                    <option value="">Manter role atual</option>
                  }
                  <option value="ADMIN">Administrador</option>
                  <option value="DOCTOR">Dentista</option>
                  <option value="RECEPTIONIST">Recepcionista</option>
                </select>
              </label>

              <div class="lg:col-span-2 flex justify-end gap-3">
                @if (editingId()) {
                  <button
                    type="button"
                    (click)="cancelEdit()"
                    class="inline-flex h-12 items-center justify-center rounded-2xl border border-[#E7D7CF] px-6 text-sm font-semibold text-[#7C5145] transition hover:bg-[#FAF5F2]"
                  >
                    Cancelar
                  </button>
                }
                <button
                  type="submit"
                  [disabled]="submitting()"
                  class="inline-flex h-12 items-center justify-center rounded-2xl bg-[#8B5E4E] px-6 text-sm font-semibold text-white transition hover:bg-[#744A40] disabled:cursor-not-allowed disabled:bg-[#C2A496]"
                >
                  {{ submitting() ? 'Salvando...' : editingId() ? 'Salvar alterações' : 'Cadastrar funcionário' }}
                </button>
              </div>
            </form>
          </section>

          <section class="rounded-[32px] bg-white p-6 shadow-[0_18px_45px_-36px_rgba(28,25,23,0.28)] sm:p-8">
            <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <h2 class="text-2xl font-semibold text-[#7C5145]" style="font-family: 'Noto Serif', serif">Funcionários cadastrados</h2>
              <div class="text-sm text-[#726863]">{{ filteredUsers().length }} de {{ users().length }} registro(s)</div>
            </div>

            <div class="mt-5 flex flex-col gap-3 sm:flex-row">
              <div class="relative flex-1">
                <svg class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B9ABA3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" stroke-linecap="round" />
                </svg>
                <input
                  type="search"
                  [value]="searchTerm()"
                  (input)="searchTerm.set($any($event.target).value)"
                  placeholder="Buscar por nome, usuário ou e-mail"
                  [class]="inputClass"
                  class="!pl-11"
                  aria-label="Buscar funcionário"
                />
              </div>
              <select
                [value]="roleFilter()"
                (change)="roleFilter.set($any($event.target).value)"
                [class]="inputClass"
                class="sm:w-56"
                aria-label="Filtrar por role"
              >
                <option value="">Todas as roles</option>
                <option value="ADMIN">Administrador</option>
                <option value="DOCTOR">Dentista</option>
                <option value="RECEPTIONIST">Recepcionista</option>
              </select>
            </div>

            @if (loading()) {
              <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                @for (_ of skeletonItems; track $index) {
                  <div class="h-36 animate-pulse rounded-[24px] bg-[#FAF7F5]"></div>
                }
              </div>
            } @else if (!users().length) {
              <div class="mt-6 rounded-[24px] border border-dashed border-[#E7D7CF] px-6 py-10 text-center text-sm text-[#726863]">
                Nenhum funcionário cadastrado ainda.
              </div>
            } @else if (!filteredUsers().length) {
              <div class="mt-6 rounded-[24px] border border-dashed border-[#E7D7CF] px-6 py-10 text-center text-sm text-[#726863]">
                Nenhum funcionário encontrado para o filtro atual.
              </div>
            } @else {
              <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                @for (user of filteredUsers(); track user.id) {
                  <article class="flex flex-col rounded-[24px] border border-[#F0E2DB] bg-[#FFFCFB] p-5">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <h3 class="text-lg font-semibold text-[#3F3835]">{{ fullName(user) }}</h3>
                        <p class="text-sm text-[#726863]">{{ user.email }}</p>
                      </div>
                      <span
                        class="rounded-full px-3 py-1 text-xs font-semibold"
                        [class.bg-[#EEF7EE]]="user.enabled"
                        [class.text-[#2D6B2D]]="user.enabled"
                        [class.bg-[#FEF1EF]]="!user.enabled"
                        [class.text-[#9E4F45]]="!user.enabled"
                      >
                        {{ user.enabled ? 'Ativo' : 'Inativo' }}
                      </span>
                    </div>
                    <div class="mt-4 flex flex-wrap gap-2">
                      @if (user.role) {
                        <span class="rounded-full bg-[#F5ECE8] px-3 py-1 text-xs font-semibold text-[#8B5E4E]">{{ roleLabels[user.role] }}</span>
                      }
                      <span class="rounded-full bg-[#F5F1EE] px-3 py-1 text-xs font-semibold text-[#7A716B]">{{ '@' + user.username }}</span>
                    </div>
                    <div class="mt-5 flex justify-end gap-2 border-t border-[#F2E9E4] pt-4">
                      <button
                        type="button"
                        (click)="startEdit(user)"
                        class="rounded-2xl border border-[#E7D7CF] px-4 py-2 text-sm font-semibold text-[#7C5145] transition hover:bg-[#FAF5F2]"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        (click)="askDelete(user)"
                        class="rounded-2xl border border-[#F0CFC9] px-4 py-2 text-sm font-semibold text-[#B0473C] transition hover:bg-[#FCF1EF]"
                      >
                        Excluir
                      </button>
                    </div>
                  </article>
                }
              </div>
            }
          </section>
        }
      </section>
    </div>

    <app-confirm-delete-modal
      [open]="!!pendingDelete()"
      title="Excluir funcionário?"
      [description]="deleteDescription()"
      confirmLabel="Sim, excluir"
      (confirm)="confirmDelete()"
      (cancel)="pendingDelete.set(null)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollaboratorsPageComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  protected readonly inputClass =
    'w-full rounded-2xl border border-[#E9DFD9] bg-[#FAF7F5] px-4 py-3 text-sm text-[#3F3835] outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]';
  protected readonly skeletonItems = Array.from({ length: 3 });
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly users = signal<UserSummary[]>([]);
  protected readonly editingId = signal<string | null>(null);
  protected readonly pendingDelete = signal<UserSummary | null>(null);
  protected readonly isAdmin = signal(false);
  protected readonly accessChecked = signal(false);
  protected readonly searchTerm = signal('');
  protected readonly roleFilter = signal<SystemRole | ''>('');
  protected readonly roleLabels = ROLE_LABELS;

  protected readonly filteredUsers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const role = this.roleFilter();
    return this.users().filter((user) => {
      if (role && user.role !== role) {
        return false;
      }
      if (!term) {
        return true;
      }
      const haystack = `${this.fullName(user)} ${user.username} ${user.email}`.toLowerCase();
      return haystack.includes(term);
    });
  });

  protected readonly form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['RECEPTIONIST' as SystemRole | '', Validators.required],
  });

  ngOnInit(): void {
    this.auth.getCurrentUser().subscribe({
      next: (user) => {
        const admin = (user.roles ?? []).some((role) => role.toUpperCase() === 'ADMIN');
        this.isAdmin.set(admin);
        this.accessChecked.set(true);
        if (admin) {
          this.loadUsers();
        }
      },
      error: () => {
        this.accessChecked.set(true);
        this.loading.set(false);
      },
    });
  }

  protected invalid(name: 'firstName' | 'lastName' | 'username' | 'email' | 'password'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.dirty || control.touched);
  }

  protected fullName(user: UserSummary): string {
    const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    return name || user.username;
  }

  protected deleteDescription(): string {
    const user = this.pendingDelete();
    return user
      ? `O acesso de ${this.fullName(user)} será removido permanentemente. Esta ação não pode ser desfeita.`
      : '';
  }

  protected startEdit(user: UserSummary): void {
    this.editingId.set(user.id);
    this.form.reset({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      username: user.username,
      email: user.email ?? '',
      password: '',
      role: '',
    });
    this.applyEditMode(true);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset({ firstName: '', lastName: '', username: '', email: '', password: '', role: 'RECEPTIONIST' });
    this.applyEditMode(false);
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const raw = this.form.getRawValue();
    const editingId = this.editingId();

    this.submitting.set(true);
    const request$ = editingId
      ? this.updateUser(editingId, {
          firstName: raw.firstName.trim(),
          lastName: raw.lastName.trim(),
          email: raw.email.trim().toLowerCase(),
          role: raw.role ? (raw.role as SystemRole) : undefined,
        })
      : this.createUser({
          firstName: raw.firstName.trim(),
          lastName: raw.lastName.trim(),
          username: raw.username.trim(),
          email: raw.email.trim().toLowerCase(),
          password: raw.password,
          role: raw.role as SystemRole,
        });

    request$.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: () => {
        this.toast.success(editingId ? 'Funcionário atualizado.' : 'Funcionário cadastrado.');
        this.cancelEdit();
        this.loadUsers();
      },
      error: () =>
        this.toast.error(editingId ? 'Não foi possível atualizar o funcionário.' : 'Não foi possível cadastrar o funcionário.'),
    });
  }

  protected askDelete(user: UserSummary): void {
    this.pendingDelete.set(user);
  }

  protected confirmDelete(): void {
    const user = this.pendingDelete();
    if (!user) {
      return;
    }
    this.pendingDelete.set(null);
    this.deleteUser(user.id).subscribe({
      next: () => {
        this.toast.success('Funcionário excluído.');
        if (this.editingId() === user.id) {
          this.cancelEdit();
        }
        this.loadUsers();
      },
      error: () => this.toast.error('Não foi possível excluir o funcionário.'),
    });
  }

  private applyEditMode(editing: boolean): void {
    const username = this.form.controls.username;
    const password = this.form.controls.password;
    const role = this.form.controls.role;
    if (editing) {
      username.disable();
      password.disable();
      password.clearValidators();
      role.clearValidators();
    } else {
      username.enable();
      password.enable();
      password.setValidators([Validators.required, Validators.minLength(8)]);
      role.setValidators([Validators.required]);
    }
    password.updateValueAndValidity();
    role.updateValueAndValidity();
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.listUsers()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (users) => this.users.set(users),
        error: () => this.toast.error('Não foi possível carregar os funcionários.'),
      });
  }

  private listUsers(): Observable<UserSummary[]> {
    return unwrap(this.http.get<UserSummary[] | ApiResponse<UserSummary[]>>(`${this.base}/users`)).pipe(
      map((users) => users ?? []),
    );
  }

  private createUser(payload: CreateUserRequest): Observable<void> {
    return unwrap(this.http.post<void | ApiResponse<void>>(`${this.base}/users`, payload));
  }

  private updateUser(id: string, payload: UpdateUserRequest): Observable<void> {
    return this.http.put<void>(`${this.base}/users/${id}`, payload);
  }

  private deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/users/${id}`);
  }
}

function unwrap<T>(source: Observable<T | ApiResponse<T>>): Observable<T> {
  return source.pipe(map((response) => (isApiResponse(response) ? response.data : response)));
}

function isApiResponse<T>(value: T | ApiResponse<T>): value is ApiResponse<T> {
  return typeof value === 'object' && value !== null && 'data' in value;
}
