import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  PLATFORM_ID,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { PatientView } from '../../models/patient-record.models';

@Component({
  selector: 'app-patient-header',
  imports: [RouterLink],
  template: `
    @if (patient(); as p) {
      <header class="flex flex-col gap-5 py-6 lg:flex-row lg:items-center lg:justify-between">
        <!-- Avatar + info -->
        <div class="flex items-center gap-4">
          <div
            class="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#EFE7E3] text-xl font-bold text-[#7C5145]"
            style="font-family: 'Noto Serif', serif"
            aria-hidden="true"
          >
            {{ initials() }}
          </div>

          <div>
            <h1
              class="text-2xl font-bold text-[#3F322D] leading-tight"
              style="font-family: 'Noto Serif', serif"
            >
              {{ p.fullName }}
            </h1>
            <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#78716C]">
              <span class="font-medium text-[#A8A29E]">Ref. #{{ shortId() }}</span>
              <span class="text-[#D6D3D1]">•</span>
              <span>{{ age() }} anos</span>
              <span class="text-[#D6D3D1]">•</span>
              <span
                class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold"
                [class.bg-green-100]="p.active"
                [class.text-green-700]="p.active"
                [class.bg-gray-100]="!p.active"
                [class.text-gray-500]="!p.active"
              >
                <span
                  class="h-1.5 w-1.5 rounded-full"
                  [class.bg-green-500]="p.active"
                  [class.bg-gray-400]="!p.active"
                ></span>
                {{ p.active ? 'Paciente Ativo' : 'Inativo' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            title="Imprimir prontuário"
            class="grid h-9 w-9 place-items-center rounded-lg border border-[#E7DCD5] bg-white text-[#78716C] transition hover:bg-[#EFE7E3]"
            (click)="print()"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
          </button>
          <button
            type="button"
            [title]="copied() ? 'Link copiado!' : 'Compartilhar'"
            class="grid h-9 w-9 place-items-center rounded-lg border border-[#E7DCD5] bg-white transition hover:bg-[#EFE7E3]"
            [class.text-green-600]="copied()"
            [class.text-[#78716C]]="!copied()"
            (click)="share(p.fullName)"
          >
            @if (copied()) {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            } @else {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            }
          </button>
          <a
            [routerLink]="['/pacientes', p.id, 'editar']"
            class="rounded-lg bg-[#7C5145] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6B4439]"
          >
            Editar Cadastro
          </a>
        </div>
      </header>
    } @else {
      <header class="flex items-center gap-4 py-6">
        <div class="h-16 w-16 animate-pulse rounded-full bg-[#EFE7E3]"></div>
        <div class="space-y-2">
          <div class="h-7 w-64 animate-pulse rounded bg-[#EFE7E3]"></div>
          <div class="h-4 w-48 animate-pulse rounded bg-[#EFE7E3]"></div>
        </div>
      </header>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientHeaderComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly patient = input<PatientView | null>(null);

  protected readonly initials = computed(() =>
    (this.patient()?.fullName ?? '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join(''),
  );

  protected readonly shortId = computed(() =>
    (this.patient()?.id ?? '').replace(/-/g, '').slice(0, 5).toUpperCase(),
  );

  protected readonly age = computed(() => {
    const bd = this.patient()?.birthDate;
    if (!bd) return 0;
    const today = new Date();
    const born = new Date(bd);
    let age = today.getFullYear() - born.getFullYear();
    const m = today.getMonth() - born.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < born.getDate())) age--;
    return age;
  });

  protected readonly copied = signal(false);

  protected print(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.print();
  }

  protected share(patientName: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const url = window.location.href;

    if (navigator.share) {
      navigator
        .share({ title: `Prontuário — ${patientName}`, url })
        .catch(() => this.copyToClipboard(url));
    } else {
      this.copyToClipboard(url);
    }
  }

  private copyToClipboard(url: string): void {
    if (!navigator.clipboard) {
      this.showCopied();
      return;
    }
    navigator.clipboard
      .writeText(url)
      .then(() => this.showCopied())
      .catch(() => this.showCopied());
  }

  private showCopied(): void {
    this.copied.set(true);
    this.cdr.markForCheck();
    setTimeout(() => {
      this.copied.set(false);
      this.cdr.markForCheck();
    }, 2000);
  }
}
