import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { Procedure, ToothState } from '../../models/tratamento.model';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

interface ToothStyle {
  bg: string;
  border: string;
  labelColor: string;
}

const TOOTH_STYLES: Record<ToothState, ToothStyle> = {
  default: { bg: '#EEEEEE', border: 'none', labelColor: '#A8A29E' },
  selected: { bg: 'rgba(34,197,94,0.18)', border: '2px solid #22C55E', labelColor: '#22C55E' },
  pending: { bg: '#FEF3C7', border: '2px solid #F59E0B', labelColor: '#F59E0B' },
  note: { bg: 'rgba(34,145,197,0.18)', border: '2px solid #2291C5', labelColor: '#2291C5' },
  inactive: { bg: '#EEEEEE', border: 'none', labelColor: '#A8A29E' },
};

const UPPER_ARCH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_ARCH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

const LEGEND = [
  { label: 'Concluído', dot: '#22C55E', bg: '#DCFCE7', text: '#16A34A' },
  { label: 'Pendente', dot: '#F59E0B', bg: '#FFFBEB', text: '#92400E' },
  { label: 'Observação', dot: '#2291C5', bg: 'rgba(34,145,197,0.12)', text: '#2291C5' },
];

const MOBILE_STATE_CONFIG: Record<string, { label: string; bg: string; border: string; color: string }> = {
  pending: { label: 'Pendentes', bg: '#FEF3C7', border: '#F59E0B', color: '#92400E' },
  selected: { label: 'Concluídos', bg: 'rgba(34,197,94,0.18)', border: '#22C55E', color: '#16A34A' },
  note: { label: 'Observações', bg: 'rgba(34,145,197,0.18)', border: '#2291C5', color: '#2291C5' },
};

@Component({
  selector: 'app-odontogram-grid',
  imports: [StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Header -->
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h3
        style="font-family: 'Noto Serif', serif; font-weight: 400; font-size: 20px; line-height: 28px; color: #1A1C1C; margin: 0;"
      >
        Odontograma Digital
      </h3>

      <!-- Desktop legend -->
      <div class="hidden items-center gap-2 lg:flex">
        @for (l of legend; track l.label) {
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-3 py-1"
            style="font-family: Manrope, sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;"
            [style.background]="l.bg"
            [style.color]="l.text"
          >
            <span class="h-1.5 w-1.5 shrink-0 rounded-full" [style.background-color]="l.dot"></span>
            {{ l.label }}
          </span>
        }
      </div>

      <!-- Mobile info button -->
      <button
        type="button"
        class="relative grid h-7 w-7 place-items-center rounded-full transition hover:bg-[#E7E5E4] lg:hidden"
        style="color: #69594A; flex-shrink: 0;"
        (click)="showTooltip.set(!showTooltip())"
        aria-label="Informação sobre odontograma"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="8" stroke="currentColor" stroke-width="1.5"/>
          <path d="M9 8v5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="9" cy="5.5" r="1" fill="currentColor"/>
        </svg>
      </button>
    </div>

    <!-- Mobile tooltip -->
    @if (showTooltip()) {
      <div
        class="mb-5 flex items-start gap-3 rounded-2xl p-4 lg:hidden"
        style="background: #1A1C1C;"
      >
        <svg class="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="white" stroke-width="1.2"/>
          <path d="M7 6.5v4" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
          <circle cx="7" cy="4.5" r="0.7" fill="white"/>
        </svg>
        <p style="font-family: Manrope, sans-serif; font-size: 13px; color: white; margin: 0; line-height: 20px; flex: 1;">
          Para melhor visualização do odontograma, acesse em uma tela maior.
        </p>
        <button
          type="button"
          class="shrink-0"
          style="color: rgba(255,255,255,0.55); margin-top: 2px;"
          (click)="showTooltip.set(false)"
          aria-label="Fechar"
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    }

    <!-- Mobile compact summary -->
    <div class="flex flex-col gap-4 lg:hidden">
      @for (group of mobileGroups(); track group.state) {
        <div class="flex items-center gap-3">
          @for (tooth of group.sample; track tooth) {
            <div class="flex flex-col items-center" style="gap: 3px;">
              <div
                style="width: 30px; height: 38px; border-radius: 6px;"
                [style.background]="group.bg"
                [style.border]="'2px solid ' + group.border"
              ></div>
              <span
                style="font-family: Manrope, sans-serif; font-size: 9px; font-weight: 700;"
                [style.color]="group.color"
              >{{ tooth }}</span>
            </div>
          }
          <span style="font-family: Manrope, sans-serif; font-size: 13px; font-weight: 600;" [style.color]="group.color">
            {{ group.count }}{{ group.showPlus ? '+' : '' }} {{ group.label }}
          </span>
        </div>
      }
      @if (mobileGroups().length === 0) {
        <p style="font-family: Manrope, sans-serif; font-size: 13px; color: #78716C;">
          Nenhum dente marcado.
        </p>
      }
    </div>

    <!-- Desktop full grid -->
    <div class="hidden lg:block">
      <!-- Upper arch -->
      <div class="flex justify-center gap-1">
        @for (tooth of upperArch; track tooth) {
          <div class="flex flex-col items-center" style="gap: 4px;">
            <span
              class="block text-center font-bold leading-none"
              style="font-family: Manrope, sans-serif; font-size: 10px;"
              [style.color]="styleFor(tooth).labelColor"
            >{{ tooth }}</span>
            <button
              type="button"
              class="h-10 w-7 transition-all duration-150"
              style="border-radius: 8px 8px 0 0;"
              [style.background-color]="styleFor(tooth).bg"
              [style.border]="styleFor(tooth).border"
              [style.opacity]="toothStates()[tooth] === 'inactive' ? '0.4' : '1'"
              [style.outline]="activeTooth() === tooth ? '2px solid #7C5145' : 'none'"
              [style.cursor]="'pointer'"
              (click)="onClick(tooth)"
              [attr.aria-label]="'Dente ' + tooth"
            ></button>
          </div>
        }
      </div>

      <!-- Gap between arches -->
      <div class="my-2"></div>

      <!-- Lower arch -->
      <div class="flex justify-center gap-1">
        @for (tooth of lowerArch; track tooth) {
          <div class="flex flex-col items-center" style="gap: 4px;">
            <button
              type="button"
              class="h-10 w-7 transition-all duration-150"
              style="border-radius: 0 0 8px 8px;"
              [style.background-color]="styleFor(tooth).bg"
              [style.border]="styleFor(tooth).border"
              [style.opacity]="toothStates()[tooth] === 'inactive' ? '0.4' : '1'"
              [style.outline]="activeTooth() === tooth ? '2px solid #7C5145' : 'none'"
              [style.cursor]="'pointer'"
              (click)="onClick(tooth)"
              [attr.aria-label]="'Dente ' + tooth"
            ></button>
            <span
              class="block text-center font-bold leading-none"
              style="font-family: Manrope, sans-serif; font-size: 10px;"
              [style.color]="styleFor(tooth).labelColor"
            >{{ tooth }}</span>
          </div>
        }
      </div>
    </div>

    <!-- Tooth history panel (desktop only) -->
    @if (activeTooth() !== null) {
      <div
        class="mt-4 hidden rounded-xl lg:block"
        style="background: #F3F3F3; padding: 16px;"
      >
        <div class="mb-3 flex items-center justify-between">
          <p
            style="font-family: Manrope, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #78716C; margin: 0;"
          >
            Dente {{ activeTooth() }} — Histórico
          </p>
          <button
            type="button"
            class="grid h-6 w-6 place-items-center rounded-full transition hover:bg-[#E7E5E4]"
            style="color: #78716C;"
            (click)="activeTooth.set(null)"
            aria-label="Fechar histórico"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        @if (toothProcedures().length === 0) {
          <p style="font-family: Manrope, sans-serif; font-size: 13px; color: #78716C;">
            Nenhum procedimento registrado para este dente.
          </p>
        } @else {
          <div class="flex flex-col" style="gap: 8px;">
            @for (proc of toothProcedures(); track proc.id) {
              <div
                class="flex items-center justify-between rounded-lg bg-white"
                style="padding: 12px 14px;"
              >
                <div>
                  <p style="font-family: Manrope, sans-serif; font-size: 14px; font-weight: 700; color: #1A1C1C; margin: 0;">
                    {{ proc.nome }}
                  </p>
                  <p style="font-family: Manrope, sans-serif; font-size: 12px; color: #69594A; margin: 4px 0 0;">
                    {{ proc.tipo }} · {{ proc.dataInicio }}
                  </p>
                </div>
                <app-status-badge [status]="proc.status" />
              </div>
            }
          </div>
        }
      </div>
    }
  `,
})
export class OdontogramGridComponent {
  toothStates = input<Record<number, ToothState>>({});
  readonly = input<boolean>(false);
  procedures = input<Procedure[]>([]);
  toothToggled = output<number>();

  protected readonly upperArch = UPPER_ARCH;
  protected readonly lowerArch = LOWER_ARCH;
  protected readonly legend = LEGEND;

  protected activeTooth = signal<number | null>(null);
  protected showTooltip = signal(false);

  protected toothProcedures = computed(() => {
    const tooth = this.activeTooth();
    if (tooth === null) return [];
    return this.procedures().filter((p) => p.dentes.includes(tooth));
  });

  protected mobileGroups = computed(() => {
    const states = this.toothStates();
    const grouped: Record<string, number[]> = {};
    for (const [tooth, state] of Object.entries(states)) {
      if (state === 'default' || state === 'inactive') continue;
      if (!grouped[state]) grouped[state] = [];
      grouped[state].push(Number(tooth));
    }
    return Object.entries(grouped).map(([state, teeth]) => {
      const cfg = MOBILE_STATE_CONFIG[state] ?? { label: state, bg: '#EEEEEE', border: '#A8A29E', color: '#57534E' };
      return { state, sample: teeth.slice(0, 2), count: teeth.length, showPlus: teeth.length > 2, ...cfg };
    });
  });

  protected styleFor(tooth: number): ToothStyle {
    const state = this.toothStates()[tooth] ?? 'default';
    return TOOTH_STYLES[state];
  }

  protected onClick(tooth: number): void {
    if (this.readonly()) {
      this.activeTooth.set(this.activeTooth() === tooth ? null : tooth);
    } else {
      this.toothToggled.emit(tooth);
    }
  }
}
