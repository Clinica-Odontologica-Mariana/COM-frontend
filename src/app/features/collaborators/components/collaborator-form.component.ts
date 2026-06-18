import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  AsyncValidatorFn,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { debounceTime, map, of, switchMap } from 'rxjs';
import { CollaboratorsApi } from '../api/collaborators.api';
import {
  CollaboratorCollections,
  CollaboratorFormValue,
  CollaboratorRole,
  cloneCollaboratorForm,
  createEmptyCollaboratorForm,
} from '../models/collaborator.models';
import { ToastService } from '../../../core/services/toast.service';
import { CollaboratorAvatarUploaderComponent } from './collaborator-avatar-uploader.component';
import { CollaboratorMultiSelectComponent } from './collaborator-multi-select.component';

@Component({
  selector: 'app-collaborator-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CollaboratorAvatarUploaderComponent,
    CollaboratorMultiSelectComponent,
  ],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        (click)="onCancel()"
        aria-hidden="true"
      ></button>

      <form
        (ngSubmit)="onSubmit()"
        [formGroup]="form"
        class="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-[0_32px_60px_-24px_rgba(28,25,23,0.45)]"
      >
        <!-- Header -->
        <div
          class="sticky top-0 z-10 bg-white px-6 py-4 sm:px-8 flex items-center justify-between border-b border-[#F0E2DB]"
        >
          <button
            type="button"
            aria-label="Voltar"
            (click)="onCancel()"
            class="rounded-full p-2 hover:bg-[#F5EFEC]"
          >
            <svg
              viewBox="0 0 24 24"
              class="h-5 w-5 text-[#7C5145]"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M19 12H5m7-7-7 7 7 7"></path>
            </svg>
          </button>
          <h1 class="text-2xl font-semibold text-[#7C5145]" style="font-family: 'Noto Serif', serif">
            {{ editingId ? 'Editar Colaborador' : 'Adicionar Novo Colaborador' }}
          </h1>
          <!-- settings removed -->
        </div>

        <!-- Tabs -->
        <div class="sticky top-16 z-10 bg-white border-b border-[#F0E2DB]">
          <div class="flex gap-8 px-6 sm:px-8 overflow-x-auto">
            <button
              type="button"
              (click)="activeTab.set('identity')"
              class="py-4 text-sm font-medium uppercase tracking-[0.1em] whitespace-nowrap"
              [class.border-b-2]="activeTab() === 'identity'"
              [class.border-[#8B5E4E]]="activeTab() === 'identity'"
              [class.text-[#8B5E4E]]="activeTab() === 'identity'"
              [class.text-[#948781]]="activeTab() !== 'identity'"
            >
              Identidade e Contato
            </button>
            <button
              type="button"
              (click)="activeTab.set('roles')"
              class="py-4 text-sm font-medium uppercase tracking-[0.1em] whitespace-nowrap"
              [class.border-b-2]="activeTab() === 'roles'"
              [class.border-[#8B5E4E]]="activeTab() === 'roles'"
              [class.text-[#8B5E4E]]="activeTab() === 'roles'"
              [class.text-[#948781]]="activeTab() !== 'roles'"
            >
              Papel e Permissões
            </button>
            <button
              type="button"
              (click)="activeTab.set('security')"
              class="py-4 text-sm font-medium uppercase tracking-[0.1em] whitespace-nowrap"
              [class.border-b-2]="activeTab() === 'security'"
              [class.border-[#8B5E4E]]="activeTab() === 'security'"
              [class.text-[#8B5E4E]]="activeTab() === 'security'"
              [class.text-[#948781]]="activeTab() !== 'security'"
            >
              Segurança
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 sm:p-8">
          <!-- Tab 1: Identity & Contact -->
          @if (activeTab() === 'identity') {
            <div class="space-y-8">
              <div class="grid gap-8 sm:grid-cols-[200px_1fr]">
                <!-- Avatar Uploader -->
                <div>
                  <app-collaborator-avatar-uploader
                    label="Foto do Perfil"
                    description="Envie uma imagem de perfil."
                    [previewUrl]="form.controls.avatarPreviewUrl.value"
                    [initials]="getInitials()"
                    (fileSelected)="onFileSelected($event)"
                    (remove)="onRemoveAvatar()"
                  />
                </div>

                <!-- Form Fields -->
                <div class="grid gap-6 sm:grid-cols-2">
                  <label class="space-y-2">
                    <span class="text-sm font-semibold text-[#6C625D]">Nome Completo *</span>
                    <input
                      formControlName="fullName"
                      placeholder="Ex: João da Silva"
                      class="w-full rounded-xl border border-[#E9DFD9] bg-[#FAF7F5] px-4 py-3 text-sm text-[#3F3835] outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
                    />
                    @if (fieldError('fullName')) {
                      <p class="text-xs text-[#C26E63]">{{ fieldMessage('fullName') }}</p>
                    }
                  </label>

                  <label class="space-y-2">
                    <span class="text-sm font-semibold text-[#6C625D]">Data de Nascimento</span>
                    <input
                      formControlName="birthDate"
                      type="date"
                      class="w-full rounded-xl border border-[#E9DFD9] bg-[#FAF7F5] px-4 py-3 text-sm text-[#3F3835] outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
                    />
                  </label>

                  <label class="space-y-2">
                    <span class="text-sm font-semibold text-[#6C625D]">E-mail Corporativo *</span>
                    <input
                      formControlName="email"
                      type="email"
                      placeholder="joao@dramariana.com.br"
                      class="w-full rounded-xl border border-[#E9DFD9] bg-[#FAF7F5] px-4 py-3 text-sm text-[#3F3835] outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
                    />
                    @if (fieldError('email')) {
                      <p class="text-xs text-[#C26E63]">{{ fieldMessage('email') }}</p>
                    }
                  </label>

                  <label class="space-y-2">
                    <span class="text-sm font-semibold text-[#6C625D]">Telefone (WhatsApp)</span>
                    <input
                      formControlName="phone"
                      placeholder="+55 (00) 00000-0000"
                      class="w-full rounded-xl border border-[#E9DFD9] bg-[#FAF7F5] px-4 py-3 text-sm text-[#3F3835] outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
                    />
                  </label>

                  <label class="space-y-2">
                    <span class="text-sm font-semibold text-[#6C625D]">Documento (CPF/CNPJ) *</span>
                    <input
                      formControlName="documentId"
                      placeholder="000.000.000-00"
                      class="w-full rounded-xl border border-[#E9DFD9] bg-[#FAF7F5] px-4 py-3 text-sm text-[#3F3835] outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
                    />
                    @if (fieldError('documentId')) {
                      <p class="text-xs text-[#C26E63]">{{ fieldMessage('documentId') }}</p>
                    }
                  </label>

                  <label class="space-y-2">
                    <span class="text-sm font-semibold text-[#6C625D]">Unidades</span>
                    <app-collaborator-multi-select
                      [options]="collections.workplaces.map((w) => ({ value: w.id, label: w.name }))"
                      [selected]="form.controls.workplaceIds.value"
                      (selectedChange)="onWorkplacesChange($event)"
                    />
                  </label>
                </div>
              </div>

              <!-- Localização -->
              <div class="space-y-4">
                <h3 class="text-sm font-semibold uppercase tracking-[0.1em] text-[#8B5E4E]">
                  Localização
                </h3>
                <div class="grid gap-4 sm:grid-cols-3">
                  <label class="space-y-2">
                    <span class="text-xs font-semibold uppercase tracking-[0.1em] text-[#6C625D]">CEP</span>
                    <div class="flex gap-2">
                      <input
                        formControlName="address.zipCode"
                        placeholder="00000-000"
                        class="w-full rounded-xl border border-[#E9DFD9] bg-[#FAF7F5] px-4 py-2 text-sm outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
                      />
                      <button
                        type="button"
                        class="flex h-11 items-center justify-center rounded-xl bg-[#8B5E4E] px-4 text-white transition hover:bg-[#744A40]"
                      >
                        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="m21 21-4.3-4.3"></path>
                          <circle cx="11" cy="11" r="7"></circle>
                        </svg>
                      </button>
                    </div>
                  </label>
                  <label class="space-y-2 sm:col-span-2">
                    <span class="text-xs font-semibold uppercase tracking-[0.1em] text-[#6C625D]">Logradouro</span>
                    <input
                      formControlName="address.street"
                      placeholder="Rua, Avenida..."
                      class="w-full rounded-xl border border-[#E9DFD9] bg-[#FAF7F5] px-4 py-2 text-sm outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
                    />
                  </label>
                </div>
                <div class="grid gap-4 sm:grid-cols-3">
                  <label class="space-y-2">
                    <span class="text-xs font-semibold uppercase tracking-[0.1em] text-[#6C625D]">Número</span>
                    <input
                      formControlName="address.number"
                      placeholder="123"
                      class="w-full rounded-xl border border-[#E9DFD9] bg-[#FAF7F5] px-4 py-2 text-sm outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
                    />
                  </label>
                  <label class="space-y-2">
                    <span class="text-xs font-semibold uppercase tracking-[0.1em] text-[#6C625D]">Bairro</span>
                    <input
                      placeholder="Bairro"
                      class="w-full rounded-xl border border-[#E9DFD9] bg-[#FAF7F5] px-4 py-2 text-sm outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
                    />
                  </label>
                  <label class="space-y-2">
                    <span class="text-xs font-semibold uppercase tracking-[0.1em] text-[#6C625D]">Cidade / UF</span>
                    <input
                      placeholder="Brasília / DF"
                      class="w-full rounded-xl border border-[#E9DFD9] bg-[#FAF7F5] px-4 py-2 text-sm outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
                    />
                  </label>
                </div>
              </div>
            </div>
          }

          <!-- Tab 2: Roles & Permissions -->
          @if (activeTab() === 'roles') {
            <div class="space-y-6">
              <div class="space-y-3">
                <h3 class="text-sm font-semibold text-[#6C625D]">Atribuição de Papéis</h3>
                <p class="text-sm text-[#726863]">
                  Selecione uma ou mais funções para o colaborador no sistema.
                </p>
              </div>

              <div class="grid gap-4 sm:grid-cols-3">
                <label class="flex items-start gap-4 rounded-2xl bg-[#FAF7F5] p-5 cursor-pointer transition hover:border-[#B48A7C] border-2 border-[#F0E2DB]">
                  <input
                    #adminCheckbox
                    type="checkbox"
                    class="mt-1 h-5 w-5 rounded border-[#D7C8C2] text-[#8B5E4E] focus:ring-[#B48A7C]"
                    [checked]="form.controls.roles.value.includes('ADMIN')"
                    (change)="toggleRole('ADMIN', adminCheckbox.checked)"
                  />
                  <div>
                    <p class="font-semibold text-[#8B5E4E]">ADMIN</p>
                    <p class="text-xs text-[#726863]">Gestão total da plataforma</p>
                  </div>
                </label>
                
                <label class="flex items-start gap-4 rounded-2xl bg-[#FAF7F5] p-5 cursor-pointer transition hover:border-[#B48A7C] border-2 border-[#F0E2DB]">
                  <input
                    #assistantCheckbox
                    type="checkbox"
                    class="mt-1 h-5 w-5 rounded border-[#D7C8C2] text-[#8B5E4E] focus:ring-[#B48A7C]"
                    [checked]="form.controls.roles.value.includes('ASSISTANT')"
                    (change)="toggleRole('ASSISTANT', assistantCheckbox.checked)"
                  />
                  <div>
                    <p class="font-semibold text-[#8B5E4E]">AUXILIAR</p>
                    <p class="text-xs text-[#726863]">Suporte clínico e administrativo</p>
                  </div>
                </label>

                <label class="flex items-start gap-4 rounded-2xl bg-[#FAF7F5] p-5 cursor-pointer transition hover:border-[#B48A7C] border-2 border-[#F0E2DB]">
                  <input
                    #receptionistCheckbox
                    type="checkbox"
                    class="mt-1 h-5 w-5 rounded border-[#D7C8C2] text-[#8B5E4E] focus:ring-[#B48A7C]"
                    [checked]="form.controls.roles.value.includes('RECEPTIONIST')"
                    (change)="toggleRole('RECEPTIONIST', receptionistCheckbox.checked)"
                  />
                  <div>
                    <p class="font-semibold text-[#8B5E4E]">RECEPCIONISTA</p>
                    <p class="text-xs text-[#726863]">Agendamentos e atendimento</p>
                  </div>
                </label>

                <label class="flex items-start gap-4 rounded-2xl bg-[#FAF7F5] p-5 cursor-pointer transition hover:border-[#B48A7C] border-2 border-[#F0E2DB]">
                  <input
                    #dentistCheckbox
                    type="checkbox"
                    class="mt-1 h-5 w-5 rounded border-[#D7C8C2] text-[#8B5E4E] focus:ring-[#B48A7C]"
                    [checked]="form.controls.roles.value.includes('DENTIST')"
                    (change)="toggleRole('DENTIST', dentistCheckbox.checked)"
                  />
                  <div>
                    <p class="font-semibold text-[#8B5E4E]">DENTISTA</p>
                    <p class="text-xs text-[#726863]">Consultas e prontuários</p>
                  </div>
                </label>
              </div>
            </div>
          }

          <!-- Tab 3: Security -->
          @if (activeTab() === 'security') {
            <div class="space-y-6">
              <div class="space-y-4">
                <h3 class="text-sm font-semibold text-[#8B5E4E]">Acesso ao Sistema</h3>

                <label class="flex items-center gap-4 rounded-2xl bg-[#FAF7F5] p-4 cursor-pointer">
                  <input
                    type="radio"
                    name="accessMode"
                    value="INVITE"
                    [checked]="form.controls.accessMode.value === 'INVITE'"
                    (change)="form.controls.accessMode.setValue('INVITE')"
                    class="h-5 w-5"
                  />
                  <div>
                    <p class="font-semibold text-[#8B5E4E]">Gerar convite por e-mail</p>
                    <p class="text-xs text-[#726863]">
                      O colaborador receberá um link para criar sua própria senha.
                    </p>
                  </div>
                </label>

                <label class="flex items-center gap-4 rounded-2xl bg-[#FAF7F5] p-4 cursor-pointer">
                  <input
                    type="radio"
                    name="accessMode"
                    value="MANUAL"
                    [checked]="form.controls.accessMode.value === 'MANUAL'"
                    (change)="form.controls.accessMode.setValue('MANUAL')"
                    class="h-5 w-5"
                  />
                  <div>
                    <p class="font-semibold text-[#8B5E4E]">Definir senha manualmente</p>
                    <p class="text-xs text-[#726863]">Você define a senha inicial (min. 8 caracteres).</p>
                  </div>
                </label>
              </div>

              @if (form.controls.accessMode.value === 'MANUAL') {
                <div class="space-y-4 pt-4 border-t border-[#F0E2DB]">
                  <label class="space-y-2">
                    <span class="text-sm font-semibold text-[#6C625D]">Senha *</span>
                    <input
                      formControlName="password"
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      class="w-full rounded-xl border border-[#E9DFD9] bg-[#FAF7F5] px-4 py-3 text-sm outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
                    />
                    @if (fieldError('password')) {
                      <p class="text-xs text-[#C26E63]">{{ fieldMessage('password') }}</p>
                    }
                  </label>

                  <label class="space-y-2">
                    <span class="text-sm font-semibold text-[#6C625D]">Confirmar Senha *</span>
                    <input
                      formControlName="passwordConfirm"
                      type="password"
                      placeholder="Confirme a senha"
                      class="w-full rounded-xl border border-[#E9DFD9] bg-[#FAF7F5] px-4 py-3 text-sm outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
                    />
                    @if (fieldError('passwordConfirm')) {
                      <p class="text-xs text-[#C26E63]">{{ fieldMessage('passwordConfirm') }}</p>
                    }
                  </label>
                </div>
              }

              <div class="space-y-4">
                <h3 class="text-sm font-semibold text-[#8B5E4E]">Observações Internas</h3>
                <textarea
                  formControlName="notes"
                  placeholder="Adicione notas sobre o histórico, referências ou detalhes contratuais..."
                  rows="5"
                  class="w-full rounded-xl border border-[#E9DFD9] bg-[#FAF7F5] px-4 py-3 text-sm text-[#3F3835] outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
                ></textarea>
              </div>
            </div>
          }
        </div>

        <!-- Footer -->
        <div
          class="sticky bottom-0 z-10 border-t border-[#F0E2DB] bg-white px-6 py-4 sm:px-8 flex justify-end gap-3"
        >
          <button
            type="button"
            (click)="onCancel()"
            class="rounded-2xl border border-[#E7D7CF] bg-white px-6 py-3 text-sm font-semibold text-[#7C5145] transition hover:bg-[#FAF5F2]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            [disabled]="submitting()"
            class="rounded-2xl bg-[#8B5E4E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#744A40] disabled:cursor-not-allowed disabled:bg-[#C2A496]"
          >
            {{ submitting() ? 'Salvando...' : 'Salvar Colaborador' }}
          </button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollaboratorFormComponent implements OnInit {
  private readonly toast = inject(ToastService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(CollaboratorsApi);

  @Input() editingId: string | null = null;
  private _initial: CollaboratorFormValue | null = null;
  @Input()
  set initial(value: CollaboratorFormValue | null) {
    this._initial = value;
    if (value) {
      this.form.patchValue(cloneCollaboratorForm(value) as any);
    } else {
      this.form.patchValue(createEmptyCollaboratorForm() as any);
    }
  }
  get initial(): CollaboratorFormValue | null {
    return this._initial;
  }
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  protected readonly submitting = signal(false);
  protected readonly submitError = signal('');
  protected readonly activeTab = signal<'identity' | 'roles' | 'security'>('identity');
  protected collections: CollaboratorCollections = this.api.getCollections();

  protected readonly form = this.fb.group({
    avatarFile: [null],
    avatarPreviewUrl: [''],
    fullName: ['', Validators.required],
    documentId: ['', Validators.required, this.documentUniqueValidator()],
    birthDate: [''],
    email: ['', [Validators.required, Validators.email], this.emailUniqueValidator()],
    phone: [''],
    address: this.fb.group({
      zipCode: [''],
      street: [''],
      number: [''],
      city: [''],
      state: [''],
    }),
    roles: [[] as string[]],
    workplaceIds: [[] as string[]],
    status: ['ACTIVE'],
    professionalId: [''],
    specialties: [[] as string[]],
    servicesProvided: [[] as string[]],
    workingHours: [[] as any[]],
    canManageAppointments: [false],
    superAdmin: [false],
    permissions: this.fb.group({
      managePatients: [false],
      viewReports: [false],
      uploadFiles: [false],
    }),
    accessMode: ['INVITE'],
    password: [''],
    passwordConfirm: [''],
    notes: [''],
  });

  constructor() {
    this.setupPasswordValidation();
  }

  ngOnInit(): void {
    this.api.fetchCollections().subscribe({
      next: (cols) => (this.collections = cols),
      error: () => {},
    });
  }

  protected getInitials(): string {
    const fullName = this.form.controls.fullName.value;
    if (!fullName) return 'CO';
    return fullName
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  protected fieldError(name: string): boolean {
    const control = this.form.get(name as any);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  protected fieldMessage(name: string): string {
    const control = this.form.get(name as any);
    if (!control) {
      return 'Campo inválido.';
    }

    const errors = control.errors ?? {};
    if (errors['required']) {
      if (name === 'fullName') return 'Nome é obrigatório.';
      if (name === 'email') return 'E-mail é obrigatório.';
      if (name === 'documentId') return 'Documento é obrigatório.';
      if (name === 'password') return 'Senha é obrigatória (mín. 8 caracteres).';
      if (name === 'passwordConfirm') return 'Confirme a senha.';
      return 'Campo obrigatório.';
    }

    if (errors['email']) {
      return 'E-mail inválido.';
    }

    if (errors['emailTaken'] || errors['conflict']) {
      return 'E-mail já cadastrado.';
    }

    if (errors['documentTaken']) {
      return 'Documento já cadastrado.';
    }

    if (errors['passwordMismatch']) {
      return 'As senhas não correspondem.';
    }

    if (errors['minlength']) {
      return 'Senha precisa ter no mínimo 8 caracteres.';
    }

    if (typeof errors['serverMessage'] === 'string' && errors['serverMessage']) {
      return errors['serverMessage'];
    }

    return 'Campo inválido.';
  }

  protected onWorkplacesChange(selected: string[]): void {
    this.form.controls.workplaceIds.setValue(selected);
  }

  protected toggleRole(role: CollaboratorRole, checked: boolean): void {
    const current = new Set(this.form.controls.roles.value || []);
    if (checked) {
      current.add(role);
    } else {
      current.delete(role);
    }
    this.form.controls.roles.setValue(Array.from(current));
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.submitError.set('');
    const value = this.form.getRawValue() as unknown as CollaboratorFormValue;

    const obs = this.editingId ? this.api.update(this.editingId, value) : this.api.create(value);
    obs.subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.success('Colaborador salvo com sucesso.');
        this.saved.emit();
      },
      error: (error) => {
        this.submitting.set(false);
        this.handleSubmitError(error);
      },
    });
  }

  protected onCancel(): void {
    this.cancelled.emit();
  }

  protected onFileSelected(file: File | null): void {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result;
      this.form.controls.avatarPreviewUrl.setValue(typeof res === 'string' ? res : '');
    };
    reader.readAsDataURL(file);
  }

  protected onRemoveAvatar(): void {
    this.form.controls.avatarPreviewUrl.setValue('');
    this.form.controls.avatarFile.setValue(null);
  }

  private setupPasswordValidation(): void {
    this.form.controls.password.valueChanges.subscribe(() => {
      this.form.controls.passwordConfirm.updateValueAndValidity();
    });
  }

  private handleSubmitError(error: unknown): void {
    if (!(error instanceof HttpErrorResponse)) {
      this.submitError.set('Erro ao salvar colaborador.');
      this.toast.error('Erro ao salvar colaborador.');
      return;
    }

    const httpError = error;
    const issues = extractFieldErrors(httpError.error);
    let appliedFieldErrors = false;

    for (const issue of issues) {
      const field = (issue.field ?? '').toString();
      const message = issue.message ?? 'Valor inválido.';

      if (!field) {
        continue;
      }

      const control = this.form.get(field as any);
      if (!control) {
        continue;
      }

      const nextErrors = { ...(control.errors ?? {}) };
      if (field === 'email' && httpError.status === 409) {
        nextErrors['conflict'] = true;
      }

      nextErrors['serverMessage'] = message;
      control.setErrors(nextErrors);
      control.markAsTouched();
      appliedFieldErrors = true;
    }

    if (httpError.status === 409 && !this.form.controls.email.errors) {
      this.form.controls.email.setErrors({ conflict: true, serverMessage: 'E-mail já cadastrado.' });
      this.form.controls.email.markAsTouched();
      appliedFieldErrors = true;
    }

    if (httpError.status === 429) {
      const message = 'Muitas tentativas. Aguarde um momento antes de tentar novamente.';
      this.submitError.set(message);
      this.toast.error(message);
      return;
    }

    if (httpError.status >= 500) {
      const message = resolveDetailedSubmitMessage(httpError);
      this.submitError.set(message);
      return;
    }

    if (appliedFieldErrors) {
      return;
    }

    const fallback = resolveSubmitMessage(httpError);
    this.submitError.set(fallback);
    this.toast.error(fallback);
  }

  private emailUniqueValidator(): AsyncValidatorFn {
    return (control: AbstractControl) =>
      of(control.value).pipe(
        debounceTime(300),
        switchMap((value) =>
          this.api.isEmailAvailable((value ?? '').toString(), this.editingId ?? undefined),
        ),
        map((available) => (available ? null : { emailTaken: true })),
      );
  }

  private documentUniqueValidator(): AsyncValidatorFn {
    return (control: AbstractControl) =>
      of(control.value).pipe(
        debounceTime(300),
        switchMap((value) =>
          this.api.isDocumentAvailable((value ?? '').toString(), this.editingId ?? undefined),
        ),
        map((available) => (available ? null : { documentTaken: true })),
      );
  }
}

function extractFieldErrors(payload: unknown): Array<{ field?: string; message?: string }> {
  if (Array.isArray(payload)) {
    return payload.filter(isFieldErrorLike);
  }

  if (isObject(payload)) {
    const candidate = payload as { errors?: unknown; error?: { details?: unknown }; message?: unknown };
    if (Array.isArray(candidate.errors)) {
      return candidate.errors.filter(isFieldErrorLike);
    }

    if (Array.isArray(candidate.error?.details)) {
      return candidate.error.details.filter(isFieldErrorLike);
    }
  }

  return [];
}

function isFieldErrorLike(value: unknown): value is { field?: string; message?: string } {
  return isObject(value) && ('field' in value || 'message' in value);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function resolveSubmitMessage(error: HttpErrorResponse): string {
  const detailedMessage = resolveDetailedSubmitMessage(error);

  if (error.status === 400) {
    return detailedMessage === 'Ocorreu um erro inesperado ao salvar o colaborador.'
      ? 'Corrija os campos destacados e tente novamente.'
      : detailedMessage;
  }

  if (error.status === 409) {
    return detailedMessage === 'Ocorreu um erro inesperado ao salvar o colaborador.'
      ? 'Já existe um colaborador com esses dados.'
      : detailedMessage;
  }

  if (error.status >= 500) {
    return detailedMessage;
  }

  return detailedMessage || 'Erro ao salvar colaborador.';
}

function resolveDetailedSubmitMessage(error: HttpErrorResponse): string {
  const body = error.error;

  if (typeof body === 'string' && body.trim()) {
    return body.trim();
  }

  if (isObject(body)) {
    const candidate = body as {
      message?: unknown;
      error?: {
        message?: unknown;
      };
    };

    if (typeof candidate.message === 'string' && candidate.message.trim()) {
      return candidate.message.trim();
    }

    if (typeof candidate.error?.message === 'string' && candidate.error.message.trim()) {
      return candidate.error.message.trim();
    }
  }

  if (error.status >= 500) {
    return 'Ocorreu um erro inesperado ao salvar o colaborador.';
  }

  return error.message || 'Erro ao salvar colaborador.';
}
