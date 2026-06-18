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

@Component({
  selector: 'app-atestado-form',
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
        <span class="text-sm font-semibold text-[#3F322D]">Novo Atestado</span>
      </div>

      <h1
        class="mb-8 text-xl font-bold text-[#3F322D]"
        style="font-family: 'Noto Serif', serif"
      >
        Gerar Atestado
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

          <!-- Motivo -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wide text-[#78716C]">
              Motivo do Atendimento
            </label>
            <input
              type="text"
              placeholder="Ex: consulta odontológica, extração dentária..."
              [ngModel]="reason()"
              (ngModelChange)="reason.set($event)"
              class="mt-1.5 block w-full rounded-lg border border-[#D8C8BF] px-3 py-2.5 text-sm outline-none focus:border-[#A77769]"
            />
          </div>

          <!-- Afastamento -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wide text-[#78716C]">
              Afastamento
            </label>
            <div class="mt-1.5 flex items-center gap-2">
              <input
                type="number"
                min="0"
                placeholder="0"
                [ngModel]="timeOff()"
                (ngModelChange)="timeOff.set(+$event)"
                class="w-24 rounded-lg border border-[#D8C8BF] px-3 py-2.5 text-sm outline-none focus:border-[#A77769]"
              />
              <div class="flex overflow-hidden rounded-lg border border-[#D8C8BF] text-xs font-semibold">
                <button
                  type="button"
                  (click)="timeUnit.set('horas')"
                  class="px-3 py-2 transition"
                  [class.bg-[#7C5145]]="timeUnit() === 'horas'"
                  [class.text-white]="timeUnit() === 'horas'"
                  [class.text-[#78716C]]="timeUnit() !== 'horas'"
                >
                  Horas
                </button>
                <button
                  type="button"
                  (click)="timeUnit.set('dias')"
                  class="border-l border-[#D8C8BF] px-3 py-2 transition"
                  [class.bg-[#7C5145]]="timeUnit() === 'dias'"
                  [class.text-white]="timeUnit() === 'dias'"
                  [class.text-[#78716C]]="timeUnit() !== 'dias'"
                >
                  Dias
                </button>
              </div>
            </div>
            <p class="mt-1 text-xs text-[#A8A29E]">
              Deixe 0 para não mencionar afastamento
            </p>
          </div>

          <!-- CID (opcional) -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wide text-[#78716C]">
              CID <span class="font-normal text-[#A8A29E]">(opcional)</span>
            </label>
            <input
              type="text"
              placeholder="Ex: K08.1"
              [ngModel]="cid()"
              (ngModelChange)="cid.set($event)"
              class="mt-1.5 block w-full rounded-lg border border-[#D8C8BF] px-3 py-2.5 text-sm outline-none focus:border-[#A77769]"
            />
          </div>

          <!-- Observações -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wide text-[#78716C]">
              Observações <span class="font-normal text-[#A8A29E]">(opcional)</span>
            </label>
            <textarea
              rows="3"
              placeholder="Orientações adicionais..."
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
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
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
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Baixar PDF
            }
          </button>
        </div>

        <!-- ── PREVIEW DO ATESTADO ── -->
        <div>
          <p class="mb-3 text-xs font-bold uppercase tracking-wide text-[#78716C]">
            Prévia do Documento
          </p>

          <div
            #atestadoDoc
            style="
              background: white;
              padding: 48px 40px;
              font-family: 'Times New Roman', serif;
              font-size: 12px;
              color: #1a1a1a;
              line-height: 1.7;
              aspect-ratio: 1 / 1.414;
              display: flex;
              flex-direction: column;
              box-shadow: 0 2px 8px rgba(0,0,0,0.12);
            "
          >
            <!-- Cabeçalho -->
            <div style="border-bottom: 2px solid #7C5145; padding-bottom: 14px; margin-bottom: 24px;">
              <h2 style="font-size: 17px; font-weight: bold; color: #7C5145; margin: 0; font-family: 'Times New Roman', serif;">
                Clínica Odontológica Mariana
              </h2>
            </div>

            <!-- Título -->
            <div style="text-align: center; margin-bottom: 32px;">
              <span style="font-size: 14px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase;">
                ATESTADO ODONTOLÓGICO
              </span>
            </div>

            <!-- Corpo -->
            <div style="flex: 1; font-size: 12px; line-height: 1.9;">
              <p style="margin: 0 0 16px 0; text-align: justify;">
                Atesto que o(a) paciente <strong>{{ patientName() || '___________________________' }}</strong>
                esteve sob atendimento odontológico nesta clínica no dia
                <strong>{{ formattedDate() }}</strong>
                @if (reason()) {
                  , em razão de <strong>{{ reason() }}</strong>
                }.
              </p>

              @if (timeOff() > 0) {
                <p style="margin: 0 0 16px 0; text-align: justify;">
                  Em virtude do procedimento realizado, recomenda-se afastamento de suas atividades habituais
                  por <strong>{{ timeOff() }} {{ timeUnit() }}</strong>.
                </p>
              }

              @if (cid()) {
                <p style="margin: 0 0 16px 0; font-size: 11px; color: #555;">
                  CID: {{ cid() }}
                </p>
              }

              @if (observations()) {
                <div style="margin-top: 12px; padding: 8px 10px; border-left: 3px solid #7C5145;">
                  <p style="margin: 0 0 4px 0; font-weight: bold; font-size: 10px; text-transform: uppercase; color: #7C5145; letter-spacing: 1px;">
                    Observações
                  </p>
                  <p style="margin: 0; font-size: 11px;">{{ observations() }}</p>
                </div>
              }
            </div>

            <!-- Local e data -->
            <div style="text-align: right; margin-bottom: 32px; font-size: 11px; color: #555;">
              Brasília, {{ formattedDate() }}.
            </div>

            <!-- Rodapé / Assinatura -->
            <div style="margin-top: auto; border-top: 1px solid #ccc; padding-top: 14px; text-align: center;">
              <div style="display: inline-block; width: 200px; border-bottom: 1px solid #333; height: 28px; margin-bottom: 4px;"></div>
              <p style="margin: 0; font-size: 10px; color: #555;">Assinatura e Carimbo do Profissional</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AtestadoFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(MedicalRecordApi);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  private readonly atestadoEl = viewChild.required<ElementRef<HTMLDivElement>>('atestadoDoc');

  protected readonly patientId = signal('');
  protected readonly patientName = signal('');
  protected readonly date = signal(new Date().toISOString().split('T')[0]);
  protected readonly reason = signal('');
  protected readonly timeOff = signal(0);
  protected readonly timeUnit = signal<'horas' | 'dias'>('dias');
  protected readonly cid = signal('');
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

  protected async generatePdf(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    this.generating.set(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const el = this.atestadoEl().nativeElement;
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
      pdf.save(`atestado-${this.patientName() || this.patientId()}.pdf`);
    } finally {
      this.generating.set(false);
    }
  }
}
