import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { ClinicsApi } from '../../../clinics/api/clinics.api';
import { ClinicRecord } from '../../../clinics/models/clinic.models';
import { ToastService } from '../../../../core/services/toast.service';
import { ProfessionalsApi } from '../../api/professionals.api';
import {
  CreateUserRequestDto,
  ProfessionalCreatePayload,
  ProfessionalDto,
  ProfessionalViewModel,
  SystemRole,
  UserSummaryDto,
} from '../../models/professional.models';

@Component({
  selector: 'app-professionals-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-[#FAFAF9] text-[#4D453F]" style="font-family: 'Manrope', sans-serif">
      <section class="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
        <header class="rounded-[32px] bg-white px-6 py-6 shadow-[0_18px_45px_-32px_rgba(28,25,23,0.25)] sm:px-8">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div class="max-w-3xl space-y-3">
              <p class="text-xs font-semibold uppercase tracking-[0.32em] text-[#B28C7D]">Equipe clínica</p>
              <h1 class="text-4xl font-bold leading-tight text-[#7C5145] sm:text-5xl" style="font-family: 'Noto Serif', serif">
                Profissionais da clínica
              </h1>
              <p class="text-sm leading-7 text-[#726863] sm:text-base">
                Cadastre usuários do sistema e, quando a role for <strong>DOCTOR</strong>, crie também o registro profissional.
              </p>
            </div>
            <div class="rounded-[24px] bg-[#FAF7F5] px-4 py-4 text-sm text-[#6C625D]">
              <p class="font-semibold text-[#8B5E4E]">Fluxo atual</p>
              <p class="mt-1 max-w-sm">POST /users e, para dentistas, POST /professionals.</p>
            </div>
          </div>
        </header>

        <section class="rounded-[32px] bg-white p-6 shadow-[0_18px_45px_-36px_rgba(28,25,23,0.28)] sm:p-8">
          <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div class="max-w-2xl space-y-2">
              <h2 class="text-2xl font-semibold text-[#7C5145]" style="font-family: 'Noto Serif', serif">Novo cadastro</h2>
              <p class="text-sm leading-7 text-[#726863]">
                Admin e recepcionista criam apenas o usuário. Dentista cria usuário e profissional vinculado a uma clínica.
              </p>
            </div>
            @if (feedback()) {
              <div class="rounded-2xl border border-[#F0D9D2] bg-[#FFF8F6] px-4 py-3 text-sm text-[#A05B4F]" aria-live="polite">
                {{ feedback() }}
              </div>
            }
          </div>

          <form class="mt-8 grid gap-5 lg:grid-cols-2" [formGroup]="form" (ngSubmit)="submit()">
            <label class="space-y-2">
              <span class="text-sm font-semibold text-[#6C625D]">Primeiro nome *</span>
              <input
                formControlName="firstName"
                type="text"
                class="w-full rounded-2xl border border-[#E9DFD9] bg-[#FAF7F5] px-4 py-3 text-sm text-[#3F3835] outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
              />
              @if (controlInvalid('firstName')) {
                <p class="text-xs text-[#C26E63]">Primeiro nome é obrigatório.</p>
              }
            </label>

            <label class="space-y-2">
              <span class="text-sm font-semibold text-[#6C625D]">Sobrenome *</span>
              <input
                formControlName="lastName"
                type="text"
                class="w-full rounded-2xl border border-[#E9DFD9] bg-[#FAF7F5] px-4 py-3 text-sm text-[#3F3835] outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
              />
              @if (controlInvalid('lastName')) {
                <p class="text-xs text-[#C26E63]">Sobrenome é obrigatório.</p>
              }
            </label>

            <label class="space-y-2">
              <span class="text-sm font-semibold text-[#6C625D]">Username *</span>
              <input
                formControlName="username"
                type="text"
                class="w-full rounded-2xl border border-[#E9DFD9] bg-[#FAF7F5] px-4 py-3 text-sm text-[#3F3835] outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
              />
              @if (controlInvalid('username')) {
                <p class="text-xs text-[#C26E63]">Username é obrigatório.</p>
              }
            </label>

            <label class="space-y-2">
              <span class="text-sm font-semibold text-[#6C625D]">E-mail *</span>
              <input
                formControlName="email"
                type="email"
                class="w-full rounded-2xl border border-[#E9DFD9] bg-[#FAF7F5] px-4 py-3 text-sm text-[#3F3835] outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
              />
              @if (controlInvalid('email')) {
                <p class="text-xs text-[#C26E63]">E-mail inválido ou já cadastrado.</p>
              }
            </label>

            <label class="space-y-2">
              <span class="text-sm font-semibold text-[#6C625D]">Senha *</span>
              <input
                formControlName="password"
                type="password"
                class="w-full rounded-2xl border border-[#E9DFD9] bg-[#FAF7F5] px-4 py-3 text-sm text-[#3F3835] outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
              />
              @if (controlInvalid('password')) {
                <p class="text-xs text-[#C26E63]">Senha precisa ter ao menos 8 caracteres.</p>
              }
            </label>

            <label class="space-y-2">
              <span class="text-sm font-semibold text-[#6C625D]">Role *</span>
              <select
                formControlName="role"
                class="w-full rounded-2xl border border-[#E9DFD9] bg-white px-4 py-3 text-sm text-[#3F3835] outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="DOCTOR">DOCTOR</option>
                <option value="RECEPTIONIST">RECEPTIONIST</option>
              </select>
            </label>

            @if (requiresProfessionalFields()) {
              <div class="lg:col-span-2 rounded-[24px] border border-[#EFE2DA] bg-[#FCF9F7] p-5">
                <p class="text-sm font-semibold uppercase tracking-[0.16em] text-[#8B5E4E]">Dados do profissional</p>
                <div class="mt-4 grid gap-5 lg:grid-cols-3">
                  <label class="space-y-2">
                    <span class="text-sm font-semibold text-[#6C625D]">Clínica principal *</span>
                    <select
                      formControlName="clinicId"
                      class="w-full rounded-2xl border border-[#E9DFD9] bg-white px-4 py-3 text-sm text-[#3F3835] outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
                    >
                      <option value="">Selecione</option>
                      @for (clinic of clinics(); track clinic.id) {
                        <option [value]="clinic.id">{{ clinic.name }}</option>
                      }
                    </select>
                    @if (controlInvalid('clinicId')) {
                      <p class="text-xs text-[#C26E63]">Clínica é obrigatória para DOCTOR.</p>
                    }
                  </label>

                  <label class="space-y-2">
                    <span class="text-sm font-semibold text-[#6C625D]">Specialty ID *</span>
                    <input
                      formControlName="specialtyId"
                      type="text"
                      placeholder="UUID da especialidade"
                      class="w-full rounded-2xl border border-[#E9DFD9] bg-[#FAF7F5] px-4 py-3 text-sm text-[#3F3835] outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
                    />
                    @if (controlInvalid('specialtyId')) {
                      <p class="text-xs text-[#C26E63]">Especialidade é obrigatória para DOCTOR.</p>
                    }
                  </label>

                  <label class="space-y-2">
                    <span class="text-sm font-semibold text-[#6C625D]">License Number *</span>
                    <input
                      formControlName="licenseNumber"
                      type="text"
                      placeholder="CRO/SP-12345"
                      class="w-full rounded-2xl border border-[#E9DFD9] bg-[#FAF7F5] px-4 py-3 text-sm text-[#3F3835] outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
                    />
                    @if (controlInvalid('licenseNumber')) {
                      <p class="text-xs text-[#C26E63]">License number é obrigatório para DOCTOR.</p>
                    }
                  </label>
                </div>
              </div>
            }

            <div class="lg:col-span-2 flex justify-end">
              <button
                type="submit"
                [disabled]="submitting()"
                class="inline-flex h-12 items-center justify-center rounded-2xl bg-[#8B5E4E] px-6 text-sm font-semibold text-white transition hover:bg-[#744A40] disabled:cursor-not-allowed disabled:bg-[#C2A496]"
              >
                {{ submitting() ? 'Salvando...' : 'Salvar profissional' }}
              </button>
            </div>
          </form>
        </section>

        <section class="rounded-[32px] bg-white p-6 shadow-[0_18px_45px_-36px_rgba(28,25,23,0.28)] sm:p-8">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="text-2xl font-semibold text-[#7C5145]" style="font-family: 'Noto Serif', serif">Profissionais cadastrados</h2>
              <p class="mt-1 text-sm text-[#726863]">Lista combinando usuários e vínculos profissionais.</p>
            </div>
            <div class="text-sm text-[#726863]">{{ professionalsView().length }} registro(s)</div>
          </div>

          @if (loading()) {
            <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              @for (_ of skeletonItems; track $index) {
                <div class="h-52 animate-pulse rounded-[24px] bg-[#FAF7F5]"></div>
              }
            </div>
          } @else if (!professionalsView().length) {
            <div class="mt-6 rounded-[24px] border border-dashed border-[#E7D7CF] px-6 py-10 text-center text-sm text-[#726863]">
              Nenhum cadastro encontrado ainda.
            </div>
          } @else {
            <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              @for (item of professionalsView(); track item.id) {
                <article class="rounded-[24px] border border-[#F0E2DB] bg-[#FFFCFB] p-5">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <h3 class="text-lg font-semibold text-[#3F3835]">{{ item.fullName }}</h3>
                      <p class="text-sm text-[#726863]">{{ item.email }}</p>
                    </div>
                    <span class="rounded-full px-3 py-1 text-xs font-semibold" [class.bg-[#EEF7EE]]="item.active" [class.text-[#2D6B2D]]="item.active" [class.bg-[#FEF1EF]]="!item.active" [class.text-[#9E4F45]]="!item.active">
                      {{ item.active ? 'Ativo' : 'Inativo' }}
                    </span>
                  </div>

                  <div class="mt-4 flex flex-wrap gap-2 text-xs">
                    <span class="rounded-full bg-[#F5ECE8] px-3 py-1 font-semibold text-[#8B5E4E]">{{ item.role }}</span>
                    <span class="rounded-full bg-[#F5F1EE] px-3 py-1 font-semibold text-[#7A716B]">{{ item.username }}</span>
                  </div>

                  <div class="mt-4 space-y-2 text-sm text-[#5D5550]">
                    <p><strong>Clínica:</strong> {{ item.clinicName }}</p>
                    <p><strong>Especialidade:</strong> {{ item.specialtyId }}</p>
                    <p><strong>License:</strong> {{ item.licenseNumber }}</p>
                  </div>

                  <div class="mt-5 flex justify-end">
                    <button
                      type="button"
                      class="rounded-2xl border border-[#E7D7CF] px-4 py-2 text-sm font-semibold text-[#7C5145] transition hover:bg-[#FAF5F2]"
                      (click)="deleteProfessional(item)"
                    >
                      Excluir
                    </button>
                  </div>
                </article>
              }
            </div>

            @if (totalPages() > 1) {
              <div class="mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  class="rounded-2xl border border-[#E7D7CF] px-4 py-2 text-sm font-semibold text-[#7C5145] transition hover:bg-[#FAF5F2] disabled:cursor-not-allowed disabled:opacity-50"
                  (click)="changePage(page() - 1)"
                  [disabled]="page() === 0"
                >
                  Anterior
                </button>

                <span class="text-sm text-[#726863]">Página {{ page() + 1 }} de {{ totalPages() }}</span>

                <button
                  type="button"
                  class="rounded-2xl border border-[#E7D7CF] px-4 py-2 text-sm font-semibold text-[#7C5145] transition hover:bg-[#FAF5F2] disabled:cursor-not-allowed disabled:opacity-50"
                  (click)="changePage(page() + 1)"
                  [disabled]="page() + 1 >= totalPages()"
                >
                  Próxima
                </button>
              </div>
            }
          }
        </section>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalsPageComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly toast = inject(ToastService);
  private readonly api = inject(ProfessionalsApi);
  private readonly clinicsApi = inject(ClinicsApi);

  protected readonly skeletonItems = Array.from({ length: 6 });
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly feedback = signal('');
  protected readonly page = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly users = signal<UserSummaryDto[]>([]);
  protected readonly clinics = signal<ClinicRecord[]>([]);
  protected readonly professionals = signal<ProfessionalDto[]>([]);

  protected readonly form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['DOCTOR' as SystemRole, Validators.required],
    clinicId: this.fb.control({ value: '', disabled: true }),
    specialtyId: this.fb.control({ value: '', disabled: true }),
    licenseNumber: this.fb.control({ value: '', disabled: true }),
  });

  protected readonly professionalsView = computed(() => {
    const clinics = this.clinics();
    const users = this.users();
    const cache = this.professionals();

    return users.map<ProfessionalViewModel>((user) => {
      const professional = cache.find((item) => item.userId === user.id);
      const clinic = clinics.find((item) => item.id === professional?.clinicId);
      return {
        id: user.id,
        userId: user.id,
        username: user.username,
        fullName: this.api.fullName(user),
        email: user.email,
        role: this.api.roleForUser(user.id, professional ? 'DOCTOR' : undefined),
        clinicId: professional?.clinicId ?? '',
        clinicName: clinic?.name ?? (professional ? 'Clínica não encontrada' : '—'),
        specialtyId: professional?.specialtyId ?? '—',
        licenseNumber: professional?.licenseNumber ?? '—',
        active: user.enabled,
      };
    });
  });

  constructor() {
    this.form.controls.role.valueChanges.subscribe((role) => this.syncRoleFields(role));
  }

  ngOnInit(): void {
    this.syncRoleFields(this.form.controls.role.value);
    this.loadReferenceData();
    this.loadProfessionals();
  }

  protected requiresProfessionalFields(): boolean {
    return this.form.controls.role.value === 'DOCTOR';
  }

  protected controlInvalid(controlName: 'firstName' | 'lastName' | 'username' | 'email' | 'password' | 'clinicId' | 'specialtyId' | 'licenseNumber'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  protected changePage(nextPage: number): void {
    const clampedPage = Math.max(0, Math.min(nextPage, this.totalPages() - 1));
    if (clampedPage === this.page()) {
      return;
    }

    this.page.set(clampedPage);
    this.loadProfessionals();
  }

  protected submit(): void {
    this.feedback.set('');
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    if (this.requiresProfessionalFields() && !this.professionalFieldsValid()) {
      return;
    }

    const raw = this.form.getRawValue();
    const userPayload: CreateUserRequestDto = {
      firstName: raw.firstName.trim(),
      lastName: raw.lastName.trim(),
      username: raw.username.trim(),
      email: raw.email.trim(),
      password: raw.password,
      role: raw.role,
    };

    this.submitting.set(true);
    this.api
      .createUser(userPayload)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (createdUser) => {
          if (createdUser.role !== 'DOCTOR') {
            this.toast.success('Usuário criado com sucesso.');
            this.resetForm();
            this.loadReferenceData();
            return;
          }

          const professionalPayload: ProfessionalCreatePayload = {
            userId: createdUser.id,
            clinicId: raw.clinicId,
            specialtyId: raw.specialtyId,
            licenseNumber: raw.licenseNumber.trim(),
          };

          this.api.createProfessional(professionalPayload).subscribe({
            next: () => {
              this.toast.success('Profissional criado com sucesso.');
              this.resetForm();
              this.loadReferenceData();
              this.loadProfessionals();
            },
            error: () => {
              this.feedback.set('Usuário criado, mas falhou ao criar o registro profissional.');
              this.toast.error('Usuário criado, mas falhou ao criar o registro profissional.');
              this.loadReferenceData();
            },
          });
        },
        error: () => {
          this.feedback.set('Não foi possível criar o usuário.');
          this.toast.error('Não foi possível criar o usuário.');
        },
      });
  }

  protected deleteProfessional(item: ProfessionalViewModel): void {
    if (!item.clinicId || item.licenseNumber === '—') {
      return;
    }

    if (!confirm(`Excluir o profissional ${item.fullName}?`)) {
      return;
    }

    const professional = this.professionals().find((current) => current.userId === item.userId);
    if (!professional) {
      return;
    }

    this.api.deleteProfessional(professional.id).subscribe({
      next: () => {
        this.toast.success('Profissional removido com sucesso.');
        this.loadProfessionals();
      },
      error: () => {
        this.toast.error('Não foi possível excluir o profissional.');
      },
    });
  }

  private loadReferenceData(): void {
    forkJoin({
      users: this.api.listUsers(),
      clinics: this.clinicsApi.list(),
    }).subscribe({
      next: ({ users, clinics }) => {
        this.users.set(users);
        this.clinics.set(clinics);
      },
      error: () => {
        this.toast.error('Não foi possível carregar dados auxiliares.');
      },
    });
  }

  private loadProfessionals(): void {
    this.loading.set(true);
    this.api.listProfessionals(this.page(), 20).subscribe({
      next: (page) => {
        this.professionals.set(page.content);
        this.totalPages.set(Math.max(page.totalPages || 1, 1));
        this.page.set(page.number ?? 0);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Não foi possível carregar os profissionais.');
      },
    });
  }

  private professionalFieldsValid(): boolean {
    const clinicId = this.form.controls.clinicId.value.trim();
    const specialtyId = this.form.controls.specialtyId.value.trim();
    const licenseNumber = this.form.controls.licenseNumber.value.trim();

    const hasError = !clinicId || !specialtyId || !licenseNumber;
    if (!hasError) {
      return true;
    }

    this.form.controls.clinicId.markAsTouched();
    this.form.controls.specialtyId.markAsTouched();
    this.form.controls.licenseNumber.markAsTouched();
    this.feedback.set('Complete os dados do profissional para DOCTOR.');
    return false;
  }

  private resetForm(): void {
    this.form.reset({
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      role: 'DOCTOR',
      clinicId: '',
      specialtyId: '',
      licenseNumber: '',
    });
    this.syncRoleFields('DOCTOR');
  }

  private syncRoleFields(role: SystemRole): void {
    const clinicId = this.form.controls.clinicId;
    const specialtyId = this.form.controls.specialtyId;
    const licenseNumber = this.form.controls.licenseNumber;

    if (role === 'DOCTOR') {
      clinicId.enable({ emitEvent: false });
      specialtyId.enable({ emitEvent: false });
      licenseNumber.enable({ emitEvent: false });
      clinicId.setValidators([Validators.required]);
      specialtyId.setValidators([Validators.required]);
      licenseNumber.setValidators([Validators.required]);
    } else {
      clinicId.reset('', { emitEvent: false });
      specialtyId.reset('', { emitEvent: false });
      licenseNumber.reset('', { emitEvent: false });
      clinicId.clearValidators();
      specialtyId.clearValidators();
      licenseNumber.clearValidators();
      clinicId.disable({ emitEvent: false });
      specialtyId.disable({ emitEvent: false });
      licenseNumber.disable({ emitEvent: false });
    }

    clinicId.updateValueAndValidity({ emitEvent: false });
    specialtyId.updateValueAndValidity({ emitEvent: false });
    licenseNumber.updateValueAndValidity({ emitEvent: false });
  }
}
