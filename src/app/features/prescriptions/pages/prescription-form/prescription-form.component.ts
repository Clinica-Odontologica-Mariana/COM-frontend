import { formatDate, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { MedicalRecordApi } from '../../../medical-records/api/medical-record.api';

interface MedicationItem {
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  via: string;
}

@Component({
  selector: 'app-prescription-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6" style="font-family: 'Manrope', sans-serif">
      <!-- Breadcrumb -->
      <div class="mb-6 flex items-center gap-3">
        <a
          [routerLink]="['/medical-records', patientId()]"
          class="flex items-center gap-1.5 text-sm text-[#78716C] transition hover:text-[#3F322D]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Prontuário
        </a>
        <span class="text-[#D6D3D1]">/</span>
        <span class="text-sm font-semibold text-[#3F322D]">Nova Receita</span>
      </div>

      <h1
        class="mb-8 text-xl font-bold text-[#3F322D]"
        style="font-family: 'Noto Serif', serif"
      >
        Emitir Nova Receita
        @if (patientName()) {
          <span class="ml-2 text-base font-normal text-[#78716C]">— {{ patientName() }}</span>
        }
      </h1>

      <div class="grid gap-8 lg:grid-cols-2">
        <!-- ── FORMULÁRIO ── -->
        <div class="space-y-6 rounded-xl border border-[#F0E8E4] bg-white p-6 shadow-sm">
          <!-- Data -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wide text-[#78716C]">
              Data
            </label>
            <input
              type="date"
              [ngModel]="date()"
              (ngModelChange)="date.set($event)"
              class="mt-1.5 block w-full rounded-lg border border-[#D8C8BF] px-3 py-2.5 text-sm outline-none focus:border-[#A77769]"
            />
          </div>

          <!-- Medicamentos -->
          <div>
            <div class="mb-3 flex items-center justify-between">
              <label class="text-xs font-bold uppercase tracking-wide text-[#78716C]">
                Medicamentos
              </label>
              <button
                type="button"
                (click)="addMedication()"
                class="text-xs font-semibold text-[#7C5145] transition hover:text-[#6B4439]"
              >
                + Adicionar
              </button>
            </div>

            <div class="space-y-4">
              @for (med of medications(); track $index) {
                <div class="rounded-lg border border-[#EDE5E0] bg-[#FAF7F5] p-4">
                  <div class="mb-2 flex items-center justify-between">
                    <span class="text-xs font-bold text-[#7C5145]">
                      Medicamento {{ $index + 1 }}
                    </span>
                    @if (medications().length > 1) {
                      <button
                        type="button"
                        (click)="removeMedication($index)"
                        class="text-xs text-red-400 transition hover:text-red-600"
                      >
                        Remover
                      </button>
                    }
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    <div class="col-span-2">
                      <input
                        type="text"
                        placeholder="Nome do medicamento"
                        [ngModel]="med.name"
                        (ngModelChange)="updateMedication($index, 'name', $event)"
                        class="w-full rounded-md border border-[#D8C8BF] px-3 py-2 text-sm outline-none focus:border-[#A77769]"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Dose (ex: 500mg)"
                      [ngModel]="med.dose"
                      (ngModelChange)="updateMedication($index, 'dose', $event)"
                      class="rounded-md border border-[#D8C8BF] px-3 py-2 text-sm outline-none focus:border-[#A77769]"
                    />
                    <input
                      type="text"
                      placeholder="Via (ex: VO, sublingual)"
                      [ngModel]="med.via"
                      (ngModelChange)="updateMedication($index, 'via', $event)"
                      class="rounded-md border border-[#D8C8BF] px-3 py-2 text-sm outline-none focus:border-[#A77769]"
                    />
                    <input
                      type="text"
                      placeholder="Frequência (ex: 8/8h)"
                      [ngModel]="med.frequency"
                      (ngModelChange)="updateMedication($index, 'frequency', $event)"
                      class="rounded-md border border-[#D8C8BF] px-3 py-2 text-sm outline-none focus:border-[#A77769]"
                    />
                    <input
                      type="text"
                      placeholder="Duração (ex: 7 dias)"
                      [ngModel]="med.duration"
                      (ngModelChange)="updateMedication($index, 'duration', $event)"
                      class="rounded-md border border-[#D8C8BF] px-3 py-2 text-sm outline-none focus:border-[#A77769]"
                    />
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Observações -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wide text-[#78716C]">
              Observações
            </label>
            <textarea
              rows="3"
              placeholder="Orientações adicionais ao paciente..."
              [ngModel]="observations()"
              (ngModelChange)="observations.set($event)"
              class="mt-1.5 w-full resize-none rounded-lg border border-[#D8C8BF] px-3 py-2.5 text-sm outline-none focus:border-[#A77769]"
            ></textarea>
          </div>

          <!-- Botão gerar PDF -->
          <button
            type="button"
            (click)="generatePdf()"
            [disabled]="generating()"
            class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#7C5145] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6B4439] disabled:cursor-not-allowed disabled:opacity-60"
          >
            @if (generating()) {
              <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
              Gerando PDF...
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Baixar PDF
            }
          </button>
        </div>

        <!-- ── PREVIEW DA RECEITA ── -->
        <div>
          <p class="mb-3 text-xs font-bold uppercase tracking-wide text-[#78716C]">
            Prévia do Documento
          </p>

          <div
            #prescriptionDoc
            style="
              background: white;
              padding: 40px;
              font-family: 'Times New Roman', serif;
              font-size: 12px;
              color: #1a1a1a;
              line-height: 1.6;
              aspect-ratio: 1 / 1.414;
              display: flex;
              flex-direction: column;
              box-shadow: 0 2px 8px rgba(0,0,0,0.12);
            "
          >
            <!-- Cabeçalho -->
            <div
              style="border-bottom: 2px solid #7C5145; padding-bottom: 14px; margin-bottom: 18px;"
            >
              <h2
                style="font-size: 17px; font-weight: bold; color: #7C5145; margin: 0; font-family: 'Times New Roman', serif;"
              >
                Clínica Odontológica Mariana
              </h2>
            </div>

            <!-- Título -->
            <div style="text-align: center; margin-bottom: 18px;">
              <span
                style="font-size: 13px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase;"
              >RECEITUÁRIO</span>
            </div>

            <!-- Dados do paciente -->
            <div
              style="margin-bottom: 18px; padding: 10px 12px; border: 1px solid #e0d4cc; background: #faf7f5;"
            >
              <p style="margin: 0 0 3px 0; font-size: 11px;">
                <strong>Paciente:</strong> {{ patientName() || '—' }}
              </p>
              <p style="margin: 0; font-size: 11px;">
                <strong>Data:</strong> {{ formattedDate() }}
              </p>
            </div>

            <!-- Medicamentos -->
            <div style="flex: 1; margin-bottom: 16px;">
              @for (med of medications(); track $index; let i = $index) {
                @if (med.name) {
                  <div style="margin-bottom: 12px;">
                    <p style="margin: 0; font-weight: bold; font-size: 12px;">
                      {{ i + 1 }}. {{ med.name }}
                      @if (med.dose) {
                        <span style="font-weight: normal;"> — {{ med.dose }}</span>
                      }
                      @if (med.via) {
                        <span style="font-weight: normal; color: #555;"> ({{ med.via }})</span>
                      }
                    </p>
                    @if (med.frequency || med.duration) {
                      <p style="margin: 3px 0 0 16px; font-size: 11px; color: #444;">
                        @if (med.frequency) { Tomar {{ med.frequency }}. }
                        @if (med.duration) { Por {{ med.duration }}. }
                      </p>
                    }
                  </div>
                }
              }
            </div>

            <!-- Observações -->
            @if (observations()) {
              <div
                style="margin-bottom: 16px; padding: 8px 10px; border-left: 3px solid #7C5145;"
              >
                <p
                  style="margin: 0 0 4px 0; font-weight: bold; font-size: 10px; text-transform: uppercase; color: #7C5145; letter-spacing: 1px;"
                >
                  Observações
                </p>
                <p style="margin: 0; font-size: 11px;">{{ observations() }}</p>
              </div>
            }

            <!-- Rodapé -->
            <div
              style="margin-top: auto; border-top: 1px solid #ccc; padding-top: 14px; text-align: center;"
            >
              <div
                style="display: inline-block; width: 180px; border-bottom: 1px solid #333; height: 28px; margin-bottom: 4px;"
              ></div>
              <p style="margin: 0; font-size: 10px; color: #555;">Assinatura e Carimbo do Profissional</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(MedicalRecordApi);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  private readonly prescriptionEl =
    viewChild.required<ElementRef<HTMLDivElement>>('prescriptionDoc');

  protected readonly patientId = signal('');
  protected readonly patientName = signal('');
  protected readonly date = signal(new Date().toISOString().split('T')[0]);
  protected readonly medications = signal<MedicationItem[]>([
    { name: '', dose: '', frequency: '', duration: '', via: '' },
  ]);
  protected readonly observations = signal('');
  protected readonly generating = signal(false);

  protected readonly formattedDate = computed(() => {
    const d = this.date();
    if (!d) return '';
    return formatDate(new Date(d + 'T12:00:00'), "dd 'de' MMMM 'de' yyyy", 'pt-BR');
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id') ?? '';
      this.patientId.set(id);
      if (id) {
        this.api
          .getPatient(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({ next: (p) => this.patientName.set(p.fullName), error: () => {} });
      }
    });
  }

  protected addMedication(): void {
    this.medications.update((list) => [
      ...list,
      { name: '', dose: '', frequency: '', duration: '', via: '' },
    ]);
  }

  protected removeMedication(index: number): void {
    this.medications.update((list) => list.filter((_, i) => i !== index));
  }

  protected updateMedication(index: number, field: keyof MedicationItem, value: string): void {
    this.medications.update((list) =>
      list.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  protected async generatePdf(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    this.generating.set(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const el = this.prescriptionEl().nativeElement;
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
      pdf.save(`receita-${this.patientName() || this.patientId()}.pdf`);
    } finally {
      this.generating.set(false);
    }
  }
}
