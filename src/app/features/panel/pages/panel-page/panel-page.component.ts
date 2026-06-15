import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, ElementRef, HostListener, OnDestroy, OnInit,
  ViewChild, inject,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { PanelService } from '../../data/panel.service';
import { DashboardData } from '../../models/panel.model';
import { PanelActivityComponent } from '../../components/panel-activity/panel-activity.component';
import { PanelCardComponent } from '../../components/panel-card/panel-card.component';
import { ReportService } from '../../data/report.service';

Chart.register(...registerables);

const MOBILE_BREAKPOINT = 768;

@Component({
  selector: 'app-panel-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule, PanelActivityComponent, PanelCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-5 font-sans text-stone-800 bg-stone-50/50 min-h-screen">

      <header class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
        <div>
          <h1 class="font-serif text-xl sm:text-2xl md:text-[26px] font-bold text-stone-900 m-0 mb-1">
            Painel Financeiro
          </h1>
          <p class="text-xs sm:text-sm text-stone-500 m-0">
            Visão consolidada de entradas, saídas e saúde financeira da clínica.
          </p>
        </div>
        <button
          type="button"
          (click)="modalOpen = true"
          class="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#A77769] hover:bg-[#6B4438] text-white rounded-lg text-xs sm:text-sm font-bold tracking-wide whitespace-nowrap transition-colors"
        >
          Gerar Relatório
        </button>
      </header>

      <div *ngIf="isLoading" class="flex items-center justify-center py-20 text-stone-400 text-sm">
        Carregando...
      </div>
      <div *ngIf="errorMessage" class="flex items-center justify-center py-20 text-red-500 text-sm">
        {{ errorMessage }}
      </div>

      <section *ngIf="data && !isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <app-panel-card
          label="RECEITA TOTAL"
          [value]="(data.stats.monthlyRevenue | currency:'BRL':'symbol':'1.2-2':'pt-BR') || 'R$ 0,00'"
          badgeText="+12.5%"
          type="revenue"
        />
        <app-panel-card label="DESPESAS" value="R$ 58.420,00" badgeText="+4.2%" type="expense" />
        <app-panel-card label="SALDO MENSAL" value="R$ 84.160,00" type="balance" />
      </section>

      <section *ngIf="data && !isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_400px] gap-4 min-w-0">

        <!-- GRÁFICO DE BARRAS -->
        <article class="min-w-0 p-4 sm:p-6 rounded-xl border border-stone-200 bg-white shadow-sm md:col-span-2 lg:col-span-1">
          <header class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
            <h2 class="font-serif text-lg font-bold text-stone-800 m-0">Tendência Mensal</h2>
            <div class="flex items-center gap-3 flex-wrap">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span class="text-xs sm:text-[10px] font-bold tracking-wide uppercase text-stone-500">RECEITA</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span class="text-xs sm:text-[10px] font-bold tracking-wide uppercase text-stone-500">DESPESAS</span>
              </div>
            </div>
          </header>
          <div style="position:relative; height:280px; min-height:200px; min-width:0;">
            <canvas #barCanvas role="img" aria-label="Gráfico de barras de receita e despesa mensal">Dados mensais de receita e despesa.</canvas>
          </div>
        </article>

        <!-- GRÁFICO DE PIZZA -->
        <article class="min-w-0 p-4 sm:p-6 rounded-xl border border-stone-200 bg-white shadow-sm md:col-span-2 lg:col-span-1 lg:row-span-1">
          <h2 class="font-serif text-lg font-bold text-stone-800 m-0 mb-6">Receita por Serviço</h2>
          <div class="flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-6 sm:gap-8 min-w-0">
            <div style="position:relative; width:180px; height:180px; flex-shrink:0; min-width:180px;">
              <canvas #pieCanvas role="img" aria-label="Gráfico de rosca com receita por serviço">Receita por serviço.</canvas>
            </div>
            <ul class="flex flex-col gap-3 m-0 p-0 list-none w-full sm:w-auto">
              <li *ngFor="let s of data.revenueByService" class="flex items-start gap-2.5">
                <span class="w-3 h-3 rounded-full shrink-0 mt-1" [style.background]="s.color"></span>
                <div>
                  <span class="block text-sm font-semibold text-stone-800">{{ s.label }}</span>
                  <span class="block text-xs text-stone-500 mt-0.5">
                    R$ {{ s.value | number:'1.0-0':'pt-BR' }}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </article>
      </section>

      <app-panel-activity
        *ngIf="data && !isLoading"
        [activities]="data.activities"
        [isMobile]="isMobile"
        (viewAll)="goToHistory()"
      />

      <!-- MODAL RELATÓRIO -->
<div
  *ngIf="modalOpen"
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
  (click)="modalOpen = false"
>
  <div
    class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 flex flex-col gap-5"
    (click)="$event.stopPropagation()"
  >
    <div>
      <h3 class="font-serif text-lg font-bold text-stone-800 m-0">Gerar Relatório</h3>
      <p class="text-sm text-stone-500 m-0 mt-1">Escolha o mês e ano do relatório.</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div class="flex flex-col gap-1.5">
        <label class="text-[11px] font-bold uppercase tracking-wider text-stone-500">Mês</label>
        <select
          [(ngModel)]="reportMonth"
          class="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#A77769]"
        >
          <option *ngFor="let m of monthNames; let i = index" [value]="i + 1">
            {{ m }}
          </option>
        </select>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[11px] font-bold uppercase tracking-wider text-stone-500">Ano</label>
        <select
          [(ngModel)]="reportYear"
          class="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#A77769]"
        >
          <option *ngFor="let y of years" [value]="y">{{ y }}</option>
        </select>
      </div>
    </div>

    <div class="flex gap-3 justify-end">
      <button
        type="button"
        (click)="modalOpen = false"
        class="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
      >
        Cancelar
      </button>
      <button
        type="button"
        (click)="generateReport()"
        [disabled]="reportLoading"
        class="px-4 py-2 rounded-lg text-sm font-bold text-white bg-[#A77769] hover:bg-[#6B4438] disabled:opacity-60 transition-colors"
      >
        {{ reportLoading ? 'Gerando...' : 'Baixar PDF' }}
      </button>
    </div>
  </div>
</div>
    </div>
  `,
})
export class PanelPageComponent implements OnInit, OnDestroy {

  // Setters substituem @ViewChild estático — disparam assim que o *ngIf renderiza os canvas
  @ViewChild('barCanvas')
  set barCanvas(el: ElementRef<HTMLCanvasElement> | undefined) {
    if (el && !this.barChart) {
      this.barCanvasRef = el;
      this.tryBuildCharts();
    }
  }

  @ViewChild('pieCanvas')
  set pieCanvas(el: ElementRef<HTMLCanvasElement> | undefined) {
    if (el && !this.pieChart) {
      this.pieCanvasRef = el;
      this.tryBuildCharts();
    }
  }

  private barCanvasRef?: ElementRef<HTMLCanvasElement>;
  private pieCanvasRef?: ElementRef<HTMLCanvasElement>;

  private readonly panelService = inject(PanelService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  protected data: DashboardData | null = null;
  protected isMobile = false;
  protected isLoading = false;
  protected errorMessage: string | null = null;

  private barChart?: Chart;
  private pieChart?: Chart;

  private readonly reportService = inject(ReportService);

protected modalOpen = false;
protected reportMonth = new Date().getMonth() + 1; // mês atual
protected reportYear = new Date().getFullYear();
protected reportLoading = false;
protected readonly years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);
protected readonly monthNames = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

protected async generateReport(): Promise<void> {
  if (!this.data || !this.barCanvasRef || !this.pieCanvasRef) return;
  this.reportLoading = true;
  try {
    await this.reportService.generatePDF({
      month: this.reportMonth,
      year: this.reportYear,
      dashboardData: this.data,
      barChartCanvas: this.barCanvasRef.nativeElement,
      pieChartCanvas: this.pieCanvasRef.nativeElement,
    });
    this.modalOpen = false;
  } finally {
    this.reportLoading = false;
    this.cdr.markForCheck();
  }
}

  ngOnInit(): void {
    this.isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    this.isLoading = true;
    this.panelService.getDashboardData().subscribe({
      next: apiData => {
        this.data = apiData;
        this.isLoading = false;
        this.cdr.markForCheck();
        // setTimeout garante que o Angular termina de renderizar o *ngIf
        // antes de tentar acessar os canvas
        setTimeout(() => this.tryBuildCharts(), 0);
      },
      error: err => {
        this.errorMessage = err.message ?? 'Erro ao carregar dados.';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  ngOnDestroy(): void {
    this.barChart?.destroy();
    this.pieChart?.destroy();
  }

  @HostListener('window:resize')
  onResize(): void {
    const next = window.innerWidth < MOBILE_BREAKPOINT;
    if (next !== this.isMobile) {
      this.isMobile = next;
      this.cdr.markForCheck();
    }
  }

  protected goToHistory(): void {
    this.router.navigate(['panel/history']);
  }

  private tryBuildCharts(): void {
    if (!this.data || !this.barCanvasRef || !this.pieCanvasRef) return;
    if (this.barChart && this.pieChart) return; // já construiu, evita duplicata

    const trend = this.data.monthlyTrend;
    const services = this.data.revenueByService;

    this.barChart = new Chart(this.barCanvasRef.nativeElement, {
      type: 'bar',
      data: {
        labels: trend.map(m => m.label),
        datasets: [
          {
            label: 'Receita',
            data: trend.map(m => m.receita),
            backgroundColor: '#10b981',
            borderRadius: 4,
            borderSkipped: false,
          },
          {
            label: 'Despesa',
            data: trend.map(m => m.despesa),
            backgroundColor: '#ef4444',
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ' R$ ' + (ctx.raw as number).toLocaleString('pt-BR'),
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#78716c', font: { size: 11 } },
          },
          y: {
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: {
              color: '#78716c',
              font: { size: 11 },
              callback: v => 'R$ ' + (+v / 1000).toFixed(0) + 'K',
            },
          },
        },
      },
    });

    this.pieChart = new Chart(this.pieCanvasRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: services.map(s => s.label),
        datasets: [{
          data: services.map(s => s.value),
          backgroundColor: services.map(s => s.color),
          borderWidth: 0,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const val = ctx.raw as number;
                const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const pct = Math.round((val / total) * 100);
                return ` ${ctx.label}: R$ ${val.toLocaleString('pt-BR')} (${pct}%)`;
              },
            },
          },
        },
      },
    });
  }
}