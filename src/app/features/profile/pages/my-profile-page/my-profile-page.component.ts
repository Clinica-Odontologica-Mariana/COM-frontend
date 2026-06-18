import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrentUser, AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { UserProfileApi } from '../../api/user-profile.api';

interface ProfileCard {
  label: string;
  value: string;
}

@Component({
  selector: 'app-my-profile-page',
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-[#FBF8F5] text-[#5C5652]" style="font-family: 'Manrope', sans-serif">
      <section class="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
        <header class="rounded-[32px] bg-white px-6 py-6 shadow-[0_18px_45px_-32px_rgba(28,25,23,0.25)] sm:px-8">
          <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div class="flex items-start gap-4 sm:gap-5">
              <div class="relative shrink-0">
                <div class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[28px] bg-[#F5EAE4] shadow-[0_12px_30px_-20px_rgba(28,25,23,0.35)] sm:h-28 sm:w-28">
                  @if (profilePhotoUrl()) {
                    <img [src]="profilePhotoUrl()" alt="Foto de perfil do usuário" class="h-full w-full object-cover" />
                  } @else {
                    <div class="text-2xl font-bold text-[#8B5E4E]">{{ initials() }}</div>
                  }
                </div>
                <div class="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full border-4 border-white bg-white text-[#8B5E4E] shadow-[0_8px_24px_-12px_rgba(28,25,23,0.45)]">
                  <svg viewBox="0 0 24 24" class="h-4 w-4 fill-current" aria-hidden="true">
                    <path d="M12 5c5.5 0 9.6 4.5 10.9 6.3a1.3 1.3 0 0 1 0 1.4C21.6 14.5 17.5 19 12 19S2.4 14.5 1.1 12.7a1.3 1.3 0 0 1 0-1.4C2.4 9.5 6.5 5 12 5Zm0 2C8 7 4.6 10 3.2 12 4.6 14 8 17 12 17s7.4-3 8.8-5c-1.4-2-4.8-5-8.8-5Zm0 1.8A3.2 3.2 0 1 1 12 15a3.2 3.2 0 0 1 0-6.2Zm0 2A1.2 1.2 0 1 0 12 13a1.2 1.2 0 0 0 0-2.2Z"></path>
                  </svg>
                </div>
              </div>

              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-[0.32em] text-[#B28C7D]">Meu Perfil</p>
                <h1 class="mt-2 truncate text-3xl font-bold text-[#2F2A27] sm:text-4xl" style="font-family: 'Noto Serif', serif">
                  {{ displayName() }}
                </h1>
                <p class="mt-3 text-sm text-[#726863]">Dados lidos diretamente de /auth/me</p>
              </div>
            </div>

            <div class="grid gap-2 sm:grid-cols-2 md:w-[22rem]">
              @for (card of topCards(); track card.label) {
                <div class="rounded-3xl bg-[#FAF7F5] px-4 py-3">
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
              Segurança
            </button>
          </div>
        </div>

        @if (loading()) {
          <div class="grid gap-4 md:grid-cols-2">
            @for (_ of skeletonItems; track $index) {
              <div class="h-64 animate-pulse rounded-[28px] bg-white shadow-[0_18px_45px_-36px_rgba(28,25,23,0.28)]"></div>
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
                @for (card of personalCards(); track card.label) {
                  <div class="rounded-[24px] bg-white p-5 shadow-[0_18px_45px_-36px_rgba(28,25,23,0.28)]">
                    <p class="text-xs font-semibold uppercase tracking-[0.22em] text-[#A29087]">{{ card.label }}</p>
                    <p class="mt-2 break-words text-sm text-[#3F3835]">{{ card.value }}</p>
                  </div>
                }
              </aside>

              <section class="rounded-[28px] bg-white p-6 shadow-[0_18px_45px_-36px_rgba(28,25,23,0.28)] sm:p-8">
                <div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div class="max-w-2xl space-y-2">
                    <h2 class="text-2xl font-semibold text-[#7C5145]" style="font-family: 'Noto Serif', serif">Foto de Perfil</h2>
                    <p class="text-sm leading-7 text-[#726863]">
                      Atualize a foto do usuário autenticado. O backend já expõe os endpoints de upload, leitura e remoção.
                    </p>
                  </div>

                  <div class="flex flex-wrap gap-3">
                    <button
                      type="button"
                      class="inline-flex h-11 items-center justify-center rounded-2xl border border-[#E7D7CF] bg-white px-5 text-sm font-semibold text-[#7C5145] transition hover:bg-[#FAF5F2] disabled:cursor-not-allowed disabled:opacity-60"
                      [disabled]="photoLoading()"
                      (click)="fileInput.click()"
                    >
                      {{ photoLoading() ? 'Carregando...' : 'Selecionar foto' }}
                    </button>
                    <button
                      type="button"
                      class="inline-flex h-11 items-center justify-center rounded-2xl bg-[#8B5E4E] px-5 text-sm font-semibold text-white transition hover:bg-[#744A40] disabled:cursor-not-allowed disabled:bg-[#C2A496]"
                      [disabled]="photoDeleting() || !profilePhotoUrl()"
                      (click)="removePhoto()"
                    >
                      @if (photoDeleting()) {
                        <svg viewBox="0 0 24 24" class="h-4 w-4 animate-spin fill-current" aria-hidden="true">
                          <path d="M12 2a10 10 0 1 0 10 10h-2a8 8 0 1 1-8-8V2Z"></path>
                        </svg>
                      }
                      <span>Remover foto</span>
                    </button>
                    <input #fileInput type="file" accept="image/*" class="hidden" (change)="uploadPhoto($event)" />
                  </div>
                </div>

                <div class="mt-8 grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
                  <div class="rounded-[28px] bg-[#FAF7F5] p-6">
                    <div class="mx-auto flex h-52 w-52 items-center justify-center overflow-hidden rounded-[32px] bg-[#F5EAE4] shadow-[0_12px_30px_-20px_rgba(28,25,23,0.35)]">
                      @if (profilePhotoUrl()) {
                        <img [src]="profilePhotoUrl()" alt="Foto de perfil atual" class="h-full w-full object-cover" />
                      } @else {
                        <div class="flex h-full w-full items-center justify-center text-4xl font-bold text-[#8B5E4E]">
                          {{ initials() }}
                        </div>
                      }
                    </div>

                    <p class="mt-5 text-center text-sm font-semibold text-[#6C625D]">Foto do usuário autenticado</p>
                    <p class="mt-2 text-center text-sm leading-6 text-[#726863]">
                      Se não houver foto cadastrada, o sistema mostra as iniciais do usuário.
                    </p>
                  </div>

                  <div class="grid gap-4 sm:grid-cols-2">
                    @for (card of personalCards(); track card.label) {
                      <div class="rounded-[24px] bg-[#FAF7F5] p-5">
                        <p class="text-xs font-semibold uppercase tracking-[0.22em] text-[#A29087]">{{ card.label }}</p>
                        <p class="mt-2 break-words text-sm text-[#3F3835]">{{ card.value }}</p>
                      </div>
                    }
                  </div>
                </div>

                @if (photoMessage()) {
                  <div
                    class="mt-6 rounded-2xl border px-4 py-3 text-sm"
                    aria-live="polite"
                    [class.border-[#D9F0D8]]="photoMessageType() === 'success'"
                    [class.bg-[#F4FBF4]]="photoMessageType() === 'success'"
                    [class.text-[#4F8A59]]="photoMessageType() === 'success'"
                    [class.border-[#F0D9D2]]="photoMessageType() === 'error'"
                    [class.bg-[#FFF8F6]]="photoMessageType() === 'error'"
                    [class.text-[#A05B4F]]="photoMessageType() === 'error'"
                  >
                    {{ photoMessage() }}
                  </div>
                }
              </section>
            </div>
          } @else {
            <section class="rounded-[28px] bg-white p-6 shadow-[0_18px_45px_-36px_rgba(28,25,23,0.28)] sm:p-8">
              <h2 class="text-2xl font-semibold text-[#7C5145]" style="font-family: 'Noto Serif', serif">Segurança</h2>
              <div class="mt-6 rounded-[24px] border border-[#E7D7CF] bg-[#FAF7F5] p-6 text-sm leading-7 text-[#726863]">
                <p class="font-semibold text-[#8B5E4E]">Ainda não disponível no backend</p>
                <p class="mt-3">
                  O backend atual não expõe endpoint para alterar nome, e-mail ou senha do próprio usuário.
                  Nesta versão, o perfil fica somente leitura e a única ação disponível é atualizar a foto.
                </p>
              </div>
            </section>
          }
        }
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyProfilePageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly api = inject(UserProfileApi);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(true);
  protected readonly loadError = signal('');
  protected readonly profile = signal<CurrentUser | null>(null);
  protected readonly profilePhotoUrl = signal<string | null>(null);
  protected readonly photoLoading = signal(false);
  protected readonly photoDeleting = signal(false);
  protected readonly photoMessage = signal('');
  protected readonly photoMessageType = signal<'success' | 'error'>('success');
  protected readonly activeTab = signal<'personal' | 'security'>('personal');

  protected readonly skeletonItems = Array.from({ length: 2 });

  protected readonly topCards = computed<ProfileCard[]>(() => {
    const profile = this.profile();
    return [
      { label: 'Usuário', value: profile?.username ?? '—' },
      { label: 'ID', value: profile?.subject ?? '—' },
    ];
  });

  protected readonly personalCards = computed<ProfileCard[]>(() => {
    const profile = this.profile();
    return [
      { label: 'E-mail', value: profile?.email ?? '—' },
      { label: 'Papéis', value: this.displayRoles(profile?.roles ?? []) },
      { label: 'Nome exibido', value: this.displayName() },
      { label: 'Claims', value: this.claimSummary(profile) },
    ];
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  protected loadProfile(): void {
    this.loading.set(true);
    this.loadError.set('');

    this.authService.getCurrentUser().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.loading.set(false);
        this.loadProfilePhoto();
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set('Não foi possível carregar os dados do usuário autenticado.');
      },
    });
  }

  protected uploadPhoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) {
      return;
    }

    this.photoLoading.set(true);
    this.photoMessage.set('');

    this.api.uploadProfilePhoto(file).subscribe({
      next: () => {
        this.photoLoading.set(false);
        this.photoMessageType.set('success');
        this.photoMessage.set('Foto de perfil atualizada com sucesso.');
        this.toast.success('Foto de perfil atualizada com sucesso!');
        this.loadProfilePhoto();
      },
      error: () => {
        this.photoLoading.set(false);
        this.photoMessageType.set('error');
        this.photoMessage.set('Não foi possível atualizar a foto de perfil.');
        this.toast.error('Não foi possível atualizar a foto de perfil.');
      },
    });
  }

  protected removePhoto(): void {
    this.photoDeleting.set(true);
    this.photoMessage.set('');

    this.api.deleteProfilePhoto().subscribe({
      next: () => {
        this.photoDeleting.set(false);
        this.profilePhotoUrl.set(null);
        this.photoMessageType.set('success');
        this.photoMessage.set('Foto de perfil removida.');
        this.toast.success('Foto de perfil removida.');
      },
      error: () => {
        this.photoDeleting.set(false);
        this.photoMessageType.set('error');
        this.photoMessage.set('Não foi possível remover a foto de perfil.');
        this.toast.error('Não foi possível remover a foto de perfil.');
      },
    });
  }

  protected displayName(): string {
    const profile = this.profile();
    if (!profile) {
      return 'Usuário';
    }

    const claimName = this.claimString(profile, 'name') || this.claimString(profile, 'preferred_username');
    if (claimName) {
      return claimName;
    }

    return profile.username;
  }

  protected initials(): string {
    const words = this.displayName().split(/\s+/).filter(Boolean).slice(0, 2);
    if (!words.length) {
      return 'US';
    }

    return words.map((word) => word[0]?.toUpperCase() ?? '').join('');
  }

  protected displayRoles(roles: string[]): string {
    if (!roles.length) {
      return '—';
    }

    return roles.map((role) => this.normalizeRole(role)).join(', ');
  }

  protected claimSummary(profile: CurrentUser | null): string {
    if (!profile?.claims) {
      return '—';
    }

    const keys = Object.keys(profile.claims);
    return keys.length ? keys.join(', ') : '—';
  }

  private loadProfilePhoto(): void {
    this.api.getProfilePhotoDownloadUrl().subscribe({
      next: (url) => this.profilePhotoUrl.set(url),
      error: () => this.profilePhotoUrl.set(null),
    });
  }

  private normalizeRole(role: string): string {
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
  }

  private claimString(profile: CurrentUser, key: string): string {
    const value = profile.claims?.[key];
    return typeof value === 'string' ? value.trim() : '';
  }
}
