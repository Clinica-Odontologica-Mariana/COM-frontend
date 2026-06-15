import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-access-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div
      class="min-h-screen bg-[#FBF8F5] text-[#5C5652]"
      style="font-family: 'Manrope', sans-serif"
    >
      <a
        routerLink="/"
        class="fixed left-5 top-5 z-20 inline-flex h-11 items-center gap-2 rounded-full border border-[#E7D7CF] bg-white/90 px-4 text-sm font-semibold text-[#7C5145] shadow-[0_12px_28px_-20px_rgba(28,25,23,0.55)] backdrop-blur transition hover:bg-white hover:text-[#5F3F35] sm:left-6 sm:top-6"
        aria-label="Voltar para a home"
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4 stroke-current" fill="none" stroke-width="2">
          <path d="M19 12H5"></path>
          <path d="m12 19-7-7 7-7"></path>
        </svg>
      </a>

      <section class="grid min-h-screen lg:grid-cols-[minmax(0,1.2fr)_minmax(26rem,0.8fr)]">
        <div class="relative hidden overflow-hidden bg-[#734C3E] lg:block">
          <div
            class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(248,231,212,0.5),transparent_36%),linear-gradient(180deg,rgba(119,76,60,0.18),rgba(84,49,38,0.5))]"
          ></div>
          <div
            class="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_30%,rgba(255,255,255,0.03)_60%,rgba(55,26,18,0.2))]"
          ></div>
          <div
            class="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-[#CFA186]/20 blur-3xl"
          ></div>
          <div class="absolute right-0 top-0 h-96 w-96 rounded-full bg-[#EAD5C6]/15 blur-3xl"></div>
          <div
            class="absolute inset-0 bg-[linear-gradient(180deg,rgba(33,20,14,0.08)_0%,rgba(33,20,14,0.45)_100%)]"
          ></div>

          <div class="relative flex h-full flex-col justify-between px-12 py-14 xl:px-16 xl:py-16">
            <div class="flex items-center gap-3 text-white/90">
              <img
                src="/Logo_clinica.svg"
                alt="Dra. Mariana"
                class="h-11 w-auto brightness-0 invert"
              />
            </div>

            <div class="max-w-xl">
              <p class="text-base font-semibold uppercase tracking-[0.3em] text-[#F4DDD0]/85">
                Painel Administrativo
              </p>
              <h1
                class="mt-5 text-6xl font-bold leading-[1.02] text-white xl:text-[5.25rem]"
                style="font-family: 'Noto Serif', serif"
              >
                Saúde e<br />
                bem-estar
              </h1>
            </div>

            <div class="max-w-xl space-y-4 text-[#F5E3D8]">
              <p
                class="text-2xl leading-relaxed italic xl:text-[2rem]"
                style="font-family: 'Noto Serif', serif"
              >
                “A precisão da odontologia com o acolhimento do ambiente humano.”
              </p>
              <div
                class="space-y-1 text-sm font-semibold uppercase tracking-[0.28em] text-[#F8E8DE]/80"
              >
                <p>Dra. Mariana</p>
                <p>Fundadora</p>
              </div>
              <p class="pt-10 text-xs font-medium uppercase tracking-[0.28em] text-[#F8E8DE]/60">
                © 2026 Dra. Mariana
              </p>
            </div>
          </div>
        </div>

        <div
          class="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-12 xl:px-16"
        >
          <div class="w-full max-w-116">
            <div class="mb-10 lg:hidden">
              <img src="/Logo_clinica.svg" alt="Dra. Mariana" class="h-12 w-auto" />
            </div>

            <div>
              <div>
                <p class="text-sm font-semibold uppercase tracking-[0.3em] text-[#B28C7D]">
                  Painel Administrativo
                </p>
                <h1
                  class="mt-4 text-5xl font-bold leading-tight text-[#7C5145]"
                  style="font-family: 'Noto Serif', serif"
                >
                  Boas-vindas
                </h1>
                <p class="mt-4 text-lg leading-8 text-[#726863]">
                  Acesse sua central de gestão clínica.
                </p>
              </div>

              <form class="mt-12 space-y-7" [formGroup]="form" (ngSubmit)="submit()">
                <div class="space-y-3">
                  <label
                    class="block text-sm font-semibold uppercase tracking-[0.2em] text-[#7E726C]"
                  >
                    E-mail
                  </label>
                  <div
                    class="flex h-15 items-center rounded-full border border-[#E7D7CF] bg-white px-6 transition focus-within:border-[#B48A7C] focus-within:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
                  >
                    <input
                      type="email"
                      formControlName="username"
                      placeholder="seuemail@clinica.com"
                      class="h-full flex-1 border-0 bg-transparent text-base text-[#3F3835] outline-none placeholder:text-[#B1A7A2]"
                    />
                    <svg
                      viewBox="0 0 24 24"
                      class="h-5 w-5 stroke-[#B28C7D]"
                      fill="none"
                      stroke-width="1.8"
                    >
                      <path d="M4 6h16v12H4z"></path>
                      <path d="m4 7 8 6 8-6"></path>
                    </svg>
                  </div>
                  @if (showFieldError('username')) {
                    <p class="px-3 text-sm text-[#C26E63]">Informe um e-mail válido</p>
                  }
                </div>

                <div class="space-y-3">
                  <div class="flex items-center justify-between gap-4">
                    <label
                      class="block text-sm font-semibold uppercase tracking-[0.2em] text-[#7E726C]"
                    >
                      Senha
                    </label>
                  </div>
                  <div
                    class="flex h-15 items-center rounded-full border border-[#E7D7CF] bg-white px-6 transition focus-within:border-[#B48A7C] focus-within:shadow-[0_0_0_4px_rgba(178,140,125,0.12)]"
                  >
                    <input
                      [type]="showPassword() ? 'text' : 'password'"
                      formControlName="password"
                      placeholder="Digite sua senha"
                      class="h-full flex-1 border-0 bg-transparent text-base text-[#3F3835] outline-none placeholder:text-[#B1A7A2]"
                    />
                    <button
                      type="button"
                      class="flex h-9 w-9 items-center justify-center rounded-full text-[#B28C7D] transition hover:bg-[#F7EFEC] hover:text-[#8B5E4E]"
                      (click)="togglePasswordVisibility()"
                      [attr.aria-label]="showPassword() ? 'Ocultar senha' : 'Mostrar senha'"
                    >
                      @if (showPassword()) {
                        <svg
                          viewBox="0 0 24 24"
                          class="h-5 w-5 stroke-current"
                          fill="none"
                          stroke-width="1.8"
                        >
                          <path d="M3 3l18 18"></path>
                          <path d="M10.6 10.6A2 2 0 0 0 12 14a2 2 0 0 0 1.4-.6"></path>
                          <path
                            d="M8.1 5.5A10.7 10.7 0 0 1 12 4c5 0 8.5 4.1 10 8a15.7 15.7 0 0 1-2.3 3.8"
                          ></path>
                          <path d="M14.4 14.4A4 4 0 0 1 6.7 11"></path>
                          <path
                            d="M6.2 6.2A15.2 15.2 0 0 0 2 12c1.5 3.9 5 8 10 8a10.8 10.8 0 0 0 5.2-1.4"
                          ></path>
                        </svg>
                      } @else {
                        <svg
                          viewBox="0 0 24 24"
                          class="h-5 w-5 stroke-current"
                          fill="none"
                          stroke-width="1.8"
                        >
                          <path d="M2 12s3.5-8 10-8 10 8 10 8-3.5 8-10 8S2 12 2 12Z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      }
                    </button>
                  </div>
                  @if (showFieldError('password')) {
                    <p class="px-3 text-sm text-[#C26E63]">Informe sua senha de acesso.</p>
                  }
                </div>

                @if (errorMessage()) {
                  <div
                    class="rounded-3xl border border-[#F1D5CC] bg-[#FFF6F2] px-5 py-4 text-sm leading-6 text-[#9A5E52]"
                  >
                    {{ errorMessage() }}
                  </div>
                }

                <button
                  type="submit"
                  [disabled]="submitting()"
                  class="flex h-15 w-full items-center justify-center gap-3 rounded-full bg-[#8B5E4E] px-6 text-base font-semibold text-white transition hover:bg-[#744E41] disabled:cursor-not-allowed disabled:bg-[#C2A496]"
                >
                  <span>{{ submitting() ? 'Entrando...' : 'Entrar no Painel' }}</span>
                  <svg
                    viewBox="0 0 24 24"
                    class="h-5 w-5 stroke-current"
                    fill="none"
                    stroke-width="2"
                  >
                    <path d="M5 12h14"></path>
                    <path d="m13 6 6 6-6 6"></path>
                  </svg>
                </button>
              </form>

              <div class="mt-10 border-t border-[#F0E2DB] pt-8">
                <p class="text-sm leading-7 text-[#8B817B]">
                  Problemas com o acesso? Contate o suporte técnico
                </p>
                <div
                  class="mt-8 flex items-center gap-6 text-xs font-semibold uppercase tracking-[0.24em] text-[#9B8F88]"
                >
                  <button type="button" class="transition hover:text-[#7C5145]">Privacidade</button>
                  <button type="button" class="transition hover:text-[#7C5145]">Termos</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAccessPageComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly showPassword = signal(false);
  protected readonly form = this.formBuilder.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  constructor() {
    if (this.authService.isTokenValid()) {
      void this.router.navigateByUrl('/panel');
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    const { username, password } = this.form.getRawValue();

    this.authService
      .login(username.trim(), password)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/panel');
        },
        error: (error: Error) => {
          const message = error.message || 'Não foi possível realizar o login.';
          this.errorMessage.set(message);
        },
      });
  }

  protected showFieldError(fieldName: 'username' | 'password'): boolean {
    const field = this.form.controls[fieldName];
    return field.invalid && (field.dirty || field.touched);
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update((visible) => !visible);
  }
}
