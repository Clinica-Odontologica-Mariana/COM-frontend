import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { UserProfileApi } from '../../api/user-profile.api';
import { ChangePasswordPayload, UpdateUserProfilePayload, UserProfile } from '../../models/user-profile.models';

interface ProfileCard {
  label: string;
  value: string;
}

interface BackendFieldError {
  field?: string;
  message?: string;
}

@Component({
  selector: 'app-my-profile-page',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-[#FBF8F5] text-[#5C5652]" style="font-family: 'Manrope', sans-serif">
      <section class="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
        <header class="rounded-[32px] bg-white px-6 py-6 shadow-[0_18px_45px_-32px_rgba(28,25,23,0.25)] sm:px-8">
          <div class="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div class="max-w-2xl space-y-3">
              <p class="text-xs font-semibold uppercase tracking-[0.32em] text-[#B28C7D]">Meu Perfil</p>
              <h1 class="text-4xl font-bold leading-tight text-[#2F2A27] sm:text-5xl" style="font-family: 'Noto Serif', serif">
                Edição do usuário logado
              </h1>
              <p class="text-sm leading-7 text-[#726863] sm:text-base">
                Atualize seus dados pessoais e altere sua senha com segurança.
              </p>
            </div>

            <div class="grid gap-3 sm:grid-cols-3 xl:w-[44rem]">
              @for (card of summaryCards(); track card.label) {
                <div class="rounded-[24px] bg-[#FAF7F5] px-4 py-4">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A29087]">{{ card.label }}</p>
                  <p class="mt-2 break-words text-sm font-semibold text-[#3F3835]">{{ card.value }}</p>
                </div>
              }
            </div>
          </div>
        </header>

        <div class="rounded-[28px] bg-white p-2 shadow-[0_18px_45px_-36px_rgba(28,25,23,0.28)]">
          <div class="flex gap-2 overflow-x-auto px-2 py-1">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition"
              [class.bg-[#F5ECE8]]="activeTab() === 'personal'"
              [class.text-[#8B5E4E]]="activeTab() === 'personal'"
              [class.text-[#726863]]="activeTab() !== 'personal'"
              (click)="activeTab.set('personal')"
            >
              Informações Pessoais
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition"
              [class.bg-[#F5ECE8]]="activeTab() === 'security'"
              [class.text-[#8B5E4E]]="activeTab() === 'security'"
              [class.text-[#726863]]="activeTab() !== 'security'"
              (click)="activeTab.set('security')"
            >
              Segurança / Alterar Senha
            </button>
          </div>
        </div>

        @if (loading()) {
          <div class="grid gap-4 lg:grid-cols-2">
            @for (_ of skeletonItems; track $index) {
              <div class="h-72 animate-pulse rounded-[28px] bg-white shadow-[0_18px_45px_-36px_rgba(28,25,23,0.28)]"></div>
            }
          </div>
        } @else if (loadError()) {
          <div class="rounded-[24px] border border-[#F0D9D2] bg-[#FFF8F6] px-6 py-5 text-sm text-[#A05B4F]">
            <div class="flex items-start justify-between gap-4">
              <p>{{ loadError() }}</p>
              <button type="button" class="font-semibold underline" (click)="loadProfile()">Tentar novamente</button>
            </div>
          </div>
        } @else {
          @if (activeTab() === 'personal') {
            <div class="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
              <aside class="space-y-4">
                @for (card of identityCards(); track card.label) {
                  <div class="rounded-[24px] bg-white p-5 shadow-[0_18px_45px_-36px_rgba(28,25,23,0.28)]">
                    <p class="text-xs font-semibold uppercase tracking-[0.22em] text-[#A29087]">{{ card.label }}</p>
                    <p class="mt-2 break-words text-sm text-[#3F3835]">{{ card.value }}</p>
                  </div>
                }
              </aside>

              <form class="rounded-[28px] bg-white p-6 shadow-[0_18px_45px_-36px_rgba(28,25,23,0.28)] sm:p-8" [formGroup]="profileForm" (ngSubmit)="submitProfile()">
                <div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div class="max-w-2xl space-y-2">
                    <h2 class="text-2xl font-semibold text-[#7C5145]" style="font-family: 'Noto Serif', serif">Informações Pessoais</h2>
                    <p class="text-sm leading-7 text-[#726863]">
                      O backend permite editar apenas nome, e-mail e telefone. Usuário, papéis e data de criação ficam somente leitura.
                    </p>
                  </div>
                  <div class="rounded-[22px] bg-[#FAF7F5] px-4 py-3 text-sm text-[#6C625D]">
                    <p class="font-semibold text-[#8B5E4E]">Usuário</p>
                    <p class="mt-1 break-words">{{ profile()?.username ?? '—' }}</p>
                  </div>
                </div>

                @if (profileBanner()) {
                  <div class="mt-6 rounded-2xl border border-[#F0D9D2] bg-[#FFF8F6] px-4 py-3 text-sm text-[#A05B4F]" aria-live="polite">
                    {{ profileBanner() }}
                  </div>
                }

                <div class="mt-8 grid gap-5 sm:grid-cols-2">
                  <label class="space-y-2 sm:col-span-2">
                    <span class="text-sm font-semibold text-[#6C625D]">Nome *</span>
                    <input
                      formControlName="name"
                      type="text"
                      autocomplete="name"
                      [attr.aria-invalid]="controlInvalid(profileForm.controls.name)"
                      class="w-full rounded-2xl border bg-[#FAF7F5] px-4 py-3 text-sm text-[#3F3835] outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
                      [class.border-[#F0D9D2]]="controlInvalid(profileForm.controls.name)"
                      [class.border-[#E9DFD9]]="!controlInvalid(profileForm.controls.name)"
                    />
                    @if (controlInvalid(profileForm.controls.name)) {
                      <p class="text-xs text-[#C26E63]">{{ controlMessage('name') }}</p>
                    }
                  </label>

                  <label class="space-y-2 sm:col-span-2">
                    <span class="text-sm font-semibold text-[#6C625D]">E-mail *</span>
                    <input
                      formControlName="email"
                      type="email"
                      autocomplete="email"
                      [attr.aria-invalid]="controlInvalid(profileForm.controls.email)"
                      class="w-full rounded-2xl border bg-[#FAF7F5] px-4 py-3 text-sm text-[#3F3835] outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
                      [class.border-[#F0D9D2]]="controlInvalid(profileForm.controls.email)"
                      [class.border-[#E9DFD9]]="!controlInvalid(profileForm.controls.email)"
                    />
                    @if (emailChanged()) {
                      <div class="rounded-2xl border border-[#F2D6BF] bg-[#FFF7EE] px-4 py-3 text-sm text-[#9A5E33]" aria-live="polite">
                        Atenção: Será necessário confirmar o novo e-mail. Um link de verificação será enviado e a alteração só será concluída após a confirmação.
                      </div>
                    }
                    @if (controlInvalid(profileForm.controls.email)) {
                      <p class="text-xs text-[#C26E63]">{{ controlMessage('email') }}</p>
                    }
                  </label>

                  <label class="space-y-2 sm:col-span-2">
                    <span class="text-sm font-semibold text-[#6C625D]">Telefone</span>
                    <input
                      formControlName="phone"
                      type="tel"
                      autocomplete="tel"
                      placeholder="+5511999999999"
                      [attr.aria-invalid]="controlInvalid(profileForm.controls.phone)"
                      class="w-full rounded-2xl border bg-[#FAF7F5] px-4 py-3 text-sm text-[#3F3835] outline-none transition focus:border-[#B48A7C] focus:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
                      [class.border-[#F0D9D2]]="controlInvalid(profileForm.controls.phone)"
                      [class.border-[#E9DFD9]]="!controlInvalid(profileForm.controls.phone)"
                    />
                    @if (controlInvalid(profileForm.controls.phone)) {
                      <p class="text-xs text-[#C26E63]">{{ controlMessage('phone') }}</p>
                    }
                  </label>
                </div>

                <div class="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="submit"
                    [disabled]="profileSubmitting() || profileForm.pristine || profileForm.invalid"
                    class="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#8B5E4E] px-5 text-sm font-semibold text-white transition hover:bg-[#744A40] disabled:cursor-not-allowed disabled:bg-[#C2A496]"
                  >
                    @if (profileSubmitting()) {
                      <svg viewBox="0 0 24 24" class="h-4 w-4 animate-spin fill-current" aria-hidden="true">
                        <path d="M12 2a10 10 0 1 0 10 10h-2a8 8 0 1 1-8-8V2Z"></path>
                      </svg>
                    }
                    <span>{{ profileSubmitting() ? 'Salvando...' : 'Salvar Alterações' }}</span>
                  </button>
                </div>
              </form>
            </div>
          } @else {
            <form class="rounded-[28px] bg-white p-6 shadow-[0_18px_45px_-36px_rgba(28,25,23,0.28)] sm:p-8" [formGroup]="passwordForm" (ngSubmit)="submitPassword()">
              <div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div class="max-w-2xl space-y-2">
                  <h2 class="text-2xl font-semibold text-[#7C5145]" style="font-family: 'Noto Serif', serif">Segurança / Alterar Senha</h2>
                  <p class="text-sm leading-7 text-[#726863]">
                    A nova senha deve ter ao menos 8 caracteres e misturar letras maiúsculas, minúsculas, números e símbolos.
                  </p>
                </div>

                <div class="rounded-[22px] bg-[#FAF7F5] px-4 py-3 text-sm text-[#6C625D]">
                  <p class="font-semibold text-[#8B5E4E]">Proteção</p>
                  <p class="mt-1 max-w-xs">Ao trocar a senha, os tokens serão revogados e você será redirecionado ao login.</p>
                </div>
              </div>

              @if (passwordBanner()) {
                <div class="mt-6 rounded-2xl border border-[#F0D9D2] bg-[#FFF8F6] px-4 py-3 text-sm text-[#A05B4F]" aria-live="polite">
                  {{ passwordBanner() }}
                </div>
              }

              <div class="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                <div class="space-y-5">
                  <label class="space-y-2">
                    <span class="text-sm font-semibold text-[#6C625D]">Senha atual *</span>
                    <div class="flex items-center gap-2 rounded-2xl border px-4 py-3 transition focus-within:border-[#B48A7C] focus-within:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]" [class.border-[#F0D9D2]]="controlInvalid(passwordForm.controls.currentPassword)" [class.border-[#E9DFD9]]="!controlInvalid(passwordForm.controls.currentPassword)">
                      <input
                        formControlName="currentPassword"
                        [type]="showCurrentPassword() ? 'text' : 'password'"
                        autocomplete="current-password"
                        [attr.aria-invalid]="controlInvalid(passwordForm.controls.currentPassword)"
                        class="h-full w-full bg-transparent text-sm text-[#3F3835] outline-none placeholder:text-[#B1A7A2]"
                        placeholder="Digite sua senha atual"
                      />
                      <button type="button" class="rounded-full p-2 text-[#B28C7D] transition hover:bg-[#F7EFEC] hover:text-[#8B5E4E]" (click)="showCurrentPassword.update((value) => !value)" [attr.aria-label]="showCurrentPassword() ? 'Ocultar senha atual' : 'Mostrar senha atual'">
                        @if (showCurrentPassword()) {
                          <svg viewBox="0 0 24 24" class="h-5 w-5 stroke-current" fill="none" stroke-width="1.8"><path d="M3 3l18 18"></path><path d="M10.6 10.6A2 2 0 0 0 12 14a2 2 0 0 0 1.4-.6"></path><path d="M8.1 5.5A10.7 10.7 0 0 1 12 4c5 0 8.5 4.1 10 8a15.7 15.7 0 0 1-2.3 3.8"></path><path d="M14.4 14.4A4 4 0 0 1 6.7 11"></path><path d="M6.2 6.2A15.2 15.2 0 0 0 2 12c1.5 3.9 5 8 10 8a10.8 10.8 0 0 0 5.2-1.4"></path></svg>
                        } @else {
                          <svg viewBox="0 0 24 24" class="h-5 w-5 stroke-current" fill="none" stroke-width="1.8"><path d="M2 12s3.5-8 10-8 10 8 10 8-3.5 8-10 8S2 12 2 12Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        }
                      </button>
                    </div>
                    @if (controlInvalid(passwordForm.controls.currentPassword)) {
                      <p class="text-xs text-[#C26E63]">{{ controlMessage('currentPassword') }}</p>
                    }
                  </label>

                  <label class="space-y-2">
                    <span class="text-sm font-semibold text-[#6C625D]">Nova senha *</span>
                    <div class="flex items-center gap-2 rounded-2xl border px-4 py-3 transition focus-within:border-[#B48A7C] focus-within:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]" [class.border-[#F0D9D2]]="controlInvalid(passwordForm.controls.newPassword)" [class.border-[#E9DFD9]]="!controlInvalid(passwordForm.controls.newPassword)">
                      <input
                        formControlName="newPassword"
                        [type]="showNewPassword() ? 'text' : 'password'"
                        autocomplete="new-password"
                        [attr.aria-invalid]="controlInvalid(passwordForm.controls.newPassword)"
                        class="h-full w-full bg-transparent text-sm text-[#3F3835] outline-none placeholder:text-[#B1A7A2]"
                        placeholder="Mínimo 8 caracteres"
                      />
                      <button type="button" class="rounded-full p-2 text-[#B28C7D] transition hover:bg-[#F7EFEC] hover:text-[#8B5E4E]" (click)="showNewPassword.update((value) => !value)" [attr.aria-label]="showNewPassword() ? 'Ocultar nova senha' : 'Mostrar nova senha'">
                        @if (showNewPassword()) {
                          <svg viewBox="0 0 24 24" class="h-5 w-5 stroke-current" fill="none" stroke-width="1.8"><path d="M3 3l18 18"></path><path d="M10.6 10.6A2 2 0 0 0 12 14a2 2 0 0 0 1.4-.6"></path><path d="M8.1 5.5A10.7 10.7 0 0 1 12 4c5 0 8.5 4.1 10 8a15.7 15.7 0 0 1-2.3 3.8"></path><path d="M14.4 14.4A4 4 0 0 1 6.7 11"></path><path d="M6.2 6.2A15.2 15.2 0 0 0 2 12c1.5 3.9 5 8 10 8a10.8 10.8 0 0 0 5.2-1.4"></path></svg>
                        } @else {
                          <svg viewBox="0 0 24 24" class="h-5 w-5 stroke-current" fill="none" stroke-width="1.8"><path d="M2 12s3.5-8 10-8 10 8 10 8-3.5 8-10 8S2 12 2 12Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        }
                      </button>
                    </div>
                    @if (controlInvalid(passwordForm.controls.newPassword)) {
                      <p class="text-xs text-[#C26E63]">{{ controlMessage('newPassword') }}</p>
                    }
                    <div class="mt-3 rounded-2xl bg-[#FAF7F5] p-4">
                      <div class="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#8B5E4E]">
                        <span>Força da senha</span>
                        <span [class.text-[#C26E63]]="passwordStrengthLabel().tone === 'weak'" [class.text-[#B28C7D]]="passwordStrengthLabel().tone === 'medium'" [class.text-[#4F8A59]]="passwordStrengthLabel().tone === 'strong'">{{ passwordStrengthLabel().label }}</span>
                      </div>
                      <div class="mt-3 h-2 overflow-hidden rounded-full bg-[#ECE2DD]">
                        <div class="h-full rounded-full transition-all" [class.bg-[#C26E63]]="passwordStrengthLabel().tone === 'weak'" [class.bg-[#D7A85D]]="passwordStrengthLabel().tone === 'medium'" [class.bg-[#4F8A59]]="passwordStrengthLabel().tone === 'strong'" [style.width.%]="passwordStrengthLabel().percent"></div>
                      </div>
                    </div>
                  </label>

                  <label class="space-y-2">
                    <span class="text-sm font-semibold text-[#6C625D]">Confirmar nova senha *</span>
                    <div class="flex items-center gap-2 rounded-2xl border px-4 py-3 transition focus-within:border-[#B48A7C] focus-within:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]" [class.border-[#F0D9D2]]="controlInvalid(passwordForm.controls.confirmPassword)" [class.border-[#E9DFD9]]="!controlInvalid(passwordForm.controls.confirmPassword)">
                      <input
                        formControlName="confirmPassword"
                        [type]="showConfirmPassword() ? 'text' : 'password'"
                        autocomplete="new-password"
                        [attr.aria-invalid]="controlInvalid(passwordForm.controls.confirmPassword)"
                        class="h-full w-full bg-transparent text-sm text-[#3F3835] outline-none placeholder:text-[#B1A7A2]"
                        placeholder="Repita a nova senha"
                      />
                      <button type="button" class="rounded-full p-2 text-[#B28C7D] transition hover:bg-[#F7EFEC] hover:text-[#8B5E4E]" (click)="showConfirmPassword.update((value) => !value)" [attr.aria-label]="showConfirmPassword() ? 'Ocultar confirmação' : 'Mostrar confirmação'">
                        @if (showConfirmPassword()) {
                          <svg viewBox="0 0 24 24" class="h-5 w-5 stroke-current" fill="none" stroke-width="1.8"><path d="M3 3l18 18"></path><path d="M10.6 10.6A2 2 0 0 0 12 14a2 2 0 0 0 1.4-.6"></path><path d="M8.1 5.5A10.7 10.7 0 0 1 12 4c5 0 8.5 4.1 10 8a15.7 15.7 0 0 1-2.3 3.8"></path><path d="M14.4 14.4A4 4 0 0 1 6.7 11"></path><path d="M6.2 6.2A15.2 15.2 0 0 0 2 12c1.5 3.9 5 8 10 8a10.8 10.8 0 0 0 5.2-1.4"></path></svg>
                        } @else {
                          <svg viewBox="0 0 24 24" class="h-5 w-5 stroke-current" fill="none" stroke-width="1.8"><path d="M2 12s3.5-8 10-8 10 8 10 8-3.5 8-10 8S2 12 2 12Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        }
                      </button>
                    </div>
                    @if (controlInvalid(passwordForm.controls.confirmPassword)) {
                      <p class="text-xs text-[#C26E63]">{{ controlMessage('confirmPassword') }}</p>
                    }
                  </label>
                </div>

                <aside class="rounded-[28px] bg-[#FAF7F5] p-5">
                  <h3 class="text-sm font-semibold uppercase tracking-[0.2em] text-[#8B5E4E]">Requisitos</h3>
                  <div class="mt-4 space-y-3">
                    @for (criterion of passwordCriteria(); track criterion.label) {
                      <div class="flex items-start gap-3 rounded-2xl border px-4 py-3" [class.border-[#D9F0D8]]="criterion.satisfied" [class.bg-[#F4FBF4]]="criterion.satisfied" [class.border-[#F0D9D2]]="!criterion.satisfied" [class.bg-white]="!criterion.satisfied">
                        <span class="mt-0.5 text-sm font-black" [class.text-[#4F8A59]]="criterion.satisfied" [class.text-[#C26E63]]="!criterion.satisfied">{{ criterion.satisfied ? '✓' : '•' }}</span>
                        <div>
                          <p class="text-sm font-semibold" [class.text-[#4F8A59]]="criterion.satisfied" [class.text-[#A05B4F]]="!criterion.satisfied">{{ criterion.label }}</p>
                        </div>
                      </div>
                    }
                  </div>
                </aside>
              </div>

              <div class="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="submit"
                  [disabled]="passwordSubmitting() || passwordForm.invalid || !passwordsMatch() || passwordForm.pristine"
                  class="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#8B5E4E] px-5 text-sm font-semibold text-white transition hover:bg-[#744A40] disabled:cursor-not-allowed disabled:bg-[#C2A496]"
                >
                  @if (passwordSubmitting()) {
                    <svg viewBox="0 0 24 24" class="h-4 w-4 animate-spin fill-current" aria-hidden="true">
                      <path d="M12 2a10 10 0 1 0 10 10h-2a8 8 0 1 1-8-8V2Z"></path>
                    </svg>
                  }
                  <span>{{ passwordSubmitting() ? 'Alterando...' : 'Alterar Senha' }}</span>
                </button>
              </div>
            </form>
          }
        }
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyProfilePageComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(UserProfileApi);
  private readonly toast = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loading = signal(true);
  protected readonly loadError = signal('');
  protected readonly profile = signal<UserProfile | null>(null);
  protected readonly initialEmail = signal('');
  protected readonly activeTab = signal<'personal' | 'security'>('personal');
  protected readonly profileSubmitting = signal(false);
  protected readonly passwordSubmitting = signal(false);
  protected readonly profileBanner = signal('');
  protected readonly passwordBanner = signal('');
  protected readonly emailChanged = signal(false);
  protected readonly showCurrentPassword = signal(false);
  protected readonly showNewPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);

  protected readonly skeletonItems = Array.from({ length: 3 });

  protected readonly profileForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    phone: ['', [this.phoneValidator()]],
    email: ['', [Validators.required, Validators.email]],
  });

  protected readonly passwordForm = this.fb.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8), this.passwordComplexityValidator()]],
      confirmPassword: ['', Validators.required],
    },
    { validators: [this.passwordMatchValidator()] },
  );

  protected readonly summaryCards = computed<ProfileCard[]>(() => {
    const profile = this.profile();
    return [
      { label: 'Usuário', value: profile?.username ?? '—' },
      { label: 'Papéis', value: this.formatRoles(profile?.roles ?? []) },
      { label: 'Criada em', value: this.formatDate(profile?.createdAt ?? '') },
    ];
  });

  protected readonly identityCards = computed<ProfileCard[]>(() => {
    const profile = this.profile();
    return [
      { label: 'ID', value: profile?.id ?? '—' },
      { label: 'Nome', value: profile?.name ?? '—' },
      { label: 'Telefone', value: profile?.phone ?? '—' },
    ];
  });

  ngOnInit(): void {
    this.bindProfileSignals();
    this.loadProfile();
  }

  protected loadProfile(): void {
    this.loading.set(true);
    this.loadError.set('');

    this.api.getMe().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.initialEmail.set(profile.email ?? '');
        this.profileForm.reset({
          name: profile.name ?? '',
          phone: profile.phone ?? '',
          email: profile.email ?? '',
        });
        this.profileForm.markAsPristine();
        this.profileForm.markAsUntouched();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set('Não foi possível carregar os dados do usuário autenticado.');
      },
    });
  }

  protected submitProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.profileSubmitting.set(true);
    this.profileBanner.set('');

    const payload: UpdateUserProfilePayload = {
      name: this.profileForm.controls.name.value.trim(),
      email: this.profileForm.controls.email.value.trim().toLowerCase(),
      phone: normalizePhoneValue(this.profileForm.controls.phone.value),
    };

    this.api.updateMe(payload).subscribe({
      next: (updatedProfile) => {
        this.profileSubmitting.set(false);
        const current = this.profile();
        this.profile.set({
          ...(current ?? {
            id: updatedProfile.id,
            username: updatedProfile.username,
            name: updatedProfile.name,
            email: updatedProfile.email,
            phone: updatedProfile.phone,
            roles: updatedProfile.roles,
            createdAt: updatedProfile.createdAt,
          }),
          ...updatedProfile,
        });
        this.initialEmail.set(updatedProfile.email);
        this.profileForm.reset({
          name: updatedProfile.name,
          email: updatedProfile.email,
          phone: updatedProfile.phone ?? '',
        });
        this.profileForm.markAsPristine();
        this.profileForm.markAsUntouched();
        this.emailChanged.set(false);
        this.toast.success('Perfil atualizado com sucesso!');
      },
      error: (error) => {
        this.profileSubmitting.set(false);
        this.handleProfileError(error);
      },
    });
  }

  protected submitPassword(): void {
    if (this.passwordForm.invalid || !this.passwordsMatch()) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.passwordSubmitting.set(true);
    this.passwordBanner.set('');

    const payload: ChangePasswordPayload = {
      currentPassword: this.passwordForm.controls.currentPassword.value,
      newPassword: this.passwordForm.controls.newPassword.value,
      confirmPassword: this.passwordForm.controls.confirmPassword.value,
    };

    this.api.changePassword(payload).subscribe({
      next: () => {
        this.passwordSubmitting.set(false);
        this.toast.success('Senha alterada com sucesso!');
        this.authService.logout();
        window.setTimeout(() => {
          void this.router.navigateByUrl('/admin-access');
        }, 2000);
      },
      error: (error) => {
        this.passwordSubmitting.set(false);
        this.handlePasswordError(error);
      },
    });
  }

  protected controlInvalid(control: AbstractControl): boolean {
    return control.invalid && (control.dirty || control.touched);
  }

  protected controlMessage(
    name: 'name' | 'phone' | 'email' | 'currentPassword' | 'newPassword' | 'confirmPassword',
  ): string {
    const control = this.getControl(name);
    const errors = control.errors ?? {};

    if (errors['required']) {
      switch (name) {
        case 'name':
          return 'Nome é obrigatório.';
        case 'email':
          return 'E-mail é obrigatório.';
        case 'currentPassword':
          return 'Informe sua senha atual.';
        case 'newPassword':
          return 'Informe a nova senha.';
        case 'confirmPassword':
          return 'Confirme a nova senha.';
        default:
          return 'Campo obrigatório.';
      }
    }

    if (name === 'email' && errors['email']) {
      return 'Informe um e-mail válido.';
    }

    if (name === 'email' && errors['conflict']) {
      return 'Este e-mail já está em uso por outro usuário.';
    }

    if (name === 'phone' && errors['phone']) {
      return 'Telefone deve estar em formato E.164, como +5511999999999.';
    }

    if (name === 'newPassword' && errors['minlength']) {
      return 'A nova senha precisa ter pelo menos 8 caracteres.';
    }

    if (name === 'newPassword' && errors['complexity']) {
      return 'A senha precisa ter maiúsculas, minúsculas, números e símbolos.';
    }

    if (name === 'confirmPassword' && errors['passwordMismatch']) {
      return 'As senhas não coincidem.';
    }

    if (typeof errors['serverMessage'] === 'string' && errors['serverMessage']) {
      return errors['serverMessage'];
    }

    return 'Campo inválido.';
  }

  protected passwordCriteria(): Array<{ label: string; satisfied: boolean }> {
    const password = this.passwordForm.controls.newPassword.value;
    return [
      { label: 'Mínimo de 8 caracteres', satisfied: password.length >= 8 },
      { label: 'Letras maiúsculas e minúsculas', satisfied: /[a-z]/.test(password) && /[A-Z]/.test(password) },
      { label: 'Inclui números', satisfied: /\d/.test(password) },
      { label: 'Inclui símbolos', satisfied: /[^A-Za-z0-9]/.test(password) },
    ];
  }

  protected passwordStrengthLabel(): { label: string; percent: number; tone: 'weak' | 'medium' | 'strong' } {
    const score = this.passwordCriteria().filter((criterion) => criterion.satisfied).length;
    if (score <= 1) {
      return { label: 'Fraca', percent: 25, tone: 'weak' };
    }

    if (score === 2 || score === 3) {
      return { label: 'Média', percent: 65, tone: 'medium' };
    }

    return { label: 'Forte', percent: 100, tone: 'strong' };
  }

  protected passwordsMatch(): boolean {
    const newPassword = this.passwordForm.controls.newPassword.value;
    const confirmPassword = this.passwordForm.controls.confirmPassword.value;
    return !newPassword || !confirmPassword || newPassword === confirmPassword;
  }

  private bindProfileSignals(): void {
    this.profileForm.controls.email.valueChanges.subscribe((value) => {
      this.emailChanged.set(normalizeText(value) !== normalizeText(this.initialEmail()));
    });

    this.passwordForm.controls.confirmPassword.valueChanges.subscribe(() => {
      this.passwordForm.updateValueAndValidity({ emitEvent: false });
    });
  }

  private handleProfileError(error: unknown): void {
    if (error instanceof HttpErrorResponse) {
      const issues = extractBackendFieldErrors(error.error);
      if (issues.length) {
        issues.forEach((issue) => this.applyFieldError(issue.field, issue.message));
        return;
      }

      if (error.status === 409) {
        this.applyFieldError('email', 'Este e-mail já está em uso por outro usuário.');
        return;
      }

      this.profileBanner.set(resolveBackendMessage(error, 'Não foi possível atualizar o perfil.'));
      return;
    }

    this.profileBanner.set('Não foi possível atualizar o perfil.');
  }

  private handlePasswordError(error: unknown): void {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 429) {
        this.passwordBanner.set('Proteção contra brute force: muitas tentativas. Aguarde alguns minutos e tente novamente.');
        return;
      }

      const issues = extractBackendFieldErrors(error.error);
      if (issues.length) {
        issues.forEach((issue) => this.applyFieldError(issue.field, issue.message));
        return;
      }

      this.passwordBanner.set(resolveBackendMessage(error, 'Não foi possível alterar a senha.'));
      return;
    }

    this.passwordBanner.set('Não foi possível alterar a senha.');
  }

  private applyFieldError(field: string | undefined, message: string | undefined): void {
    if (!field) {
      return;
    }

    const control = this.getControl(field as 'name' | 'phone' | 'email' | 'currentPassword' | 'newPassword' | 'confirmPassword');
    const nextErrors = { ...(control.errors ?? {}) };

    if (field === 'email' && message?.toLowerCase().includes('uso')) {
      nextErrors['conflict'] = true;
    }

    if (field === 'newPassword' && message?.toLowerCase().includes('fraca')) {
      nextErrors['complexity'] = true;
    }

    if (field === 'confirmPassword' && message?.toLowerCase().includes('coincid')) {
      nextErrors['passwordMismatch'] = true;
    }

    nextErrors['serverMessage'] = message ?? 'Campo inválido.';
    control.setErrors(nextErrors);
    control.markAsTouched();
  }

  private getControl(name: 'name' | 'phone' | 'email' | 'currentPassword' | 'newPassword' | 'confirmPassword') {
    return name === 'name'
      ? this.profileForm.controls.name
      : name === 'phone'
        ? this.profileForm.controls.phone
        : name === 'email'
          ? this.profileForm.controls.email
          : name === 'currentPassword'
            ? this.passwordForm.controls.currentPassword
            : name === 'newPassword'
              ? this.passwordForm.controls.newPassword
              : this.passwordForm.controls.confirmPassword;
  }

  private formatRoles(roles: string[]): string {
    if (!roles.length) {
      return '—';
    }

    return roles
      .map((role) => {
        switch (role.toUpperCase()) {
          case 'ADMIN':
            return 'Administrador';
          case 'RECEPTIONIST':
            return 'Recepcionista';
          case 'DOCTOR':
          case 'DENTIST':
            return 'Dentista';
          default:
            return role;
        }
      })
      .join(', ');
  }

  private formatDate(value: string): string {
    if (!value) {
      return '—';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }

  private phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = normalizeText(control.value);
      if (!value) {
        return null;
      }

      const normalized = value.replace(/[^\d+]/g, '');
      const isE164 = /^\+[1-9]\d{7,14}$/.test(normalized) || /^[1-9]\d{7,14}$/.test(normalized);
      return isE164 ? null : { phone: true };
    };
  }

  private passwordComplexityValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = normalizeText(control.value);
      if (!value) {
        return null;
      }

      const hasMinLength = value.length >= 8;
      const hasLower = /[a-z]/.test(value);
      const hasUpper = /[A-Z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasSymbol = /[^A-Za-z0-9]/.test(value);
      return hasMinLength && hasLower && hasUpper && hasNumber && hasSymbol ? null : { complexity: true };
    };
  }

  private passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const newPassword = control.get('newPassword')?.value as string;
      const confirmPassword = control.get('confirmPassword')?.value as string;

      if (!newPassword || !confirmPassword) {
        return null;
      }

      return newPassword === confirmPassword ? null : { passwordMismatch: true };
    };
  }
}

function normalizePhoneValue(value: string): string | null {
  const normalized = normalizeText(value).replace(/[^\d+]/g, '');
  if (!normalized) {
    return null;
  }

  return normalized.startsWith('+') ? normalized : `+${normalized}`;
}

function normalizeText(value: string): string {
  return value.trim();
}

function extractBackendFieldErrors(payload: unknown): BackendFieldError[] {
  if (Array.isArray(payload)) {
    return payload.filter(isBackendFieldError);
  }

  if (isRecord(payload)) {
    const candidate = payload as { errors?: unknown; error?: { details?: unknown } };
    if (Array.isArray(candidate.errors)) {
      return candidate.errors.filter(isBackendFieldError);
    }

    if (Array.isArray(candidate.error?.details)) {
      return candidate.error.details.filter(isBackendFieldError);
    }
  }

  return [];
}

function isBackendFieldError(value: unknown): value is BackendFieldError {
  return isRecord(value) && ('field' in value || 'message' in value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function resolveBackendMessage(error: HttpErrorResponse, fallback: string): string {
  const payload = error.error as { message?: unknown; error?: { message?: unknown; code?: unknown } } | string | null;
  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (isRecord(payload)) {
    const message = payload.message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }

    const nested = payload.error?.message;
    if (typeof nested === 'string' && nested.trim()) {
      return nested;
    }
  }

  if (error.status === 403) {
    return 'Você não tem permissão para executar esta ação.';
  }

  if (error.status >= 500) {
    return 'Não foi possível processar a solicitação agora.';
  }

  return fallback;
}
