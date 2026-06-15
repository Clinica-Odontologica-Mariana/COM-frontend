import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { HistoryService } from './history.service';
import { RecentActivity } from '../models/panel.model';
import { DashboardData } from '../models/panel.model';

export interface ReportOptions {
  month: number; // 1–12
  year: number;
  dashboardData: DashboardData;
  barChartCanvas: HTMLCanvasElement;
  pieChartCanvas: HTMLCanvasElement;
}

const MONTH_NAMES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly historyService = inject(HistoryService);

  async generatePDF(options: ReportOptions): Promise<void> {
    const { month, year, dashboardData, barChartCanvas, pieChartCanvas } = options;

    // 1. Busca todas as transações do mês selecionado
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const result = await firstValueFrom(
      this.historyService.getHistory({
        page: 1,
        pageSize: 9999,
        filters: { startDate, endDate, category: 'TODAS' },
      })
    );

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210; // largura A4
    const margin = 14;
    const contentW = W - margin * 2;
    let y = 0;

    // ── CABEÇALHO ──────────────────────────────────────────────
    pdf.setFillColor(167, 119, 105); // #A77769
    pdf.rect(0, 0, W, 28, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('Relatório Financeiro Mensal', margin, 12);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(`${MONTH_NAMES[month - 1]} ${year}`, margin, 20);
    pdf.text(
      `Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
      W - margin,
      20,
      { align: 'right' }
    );

    y = 36;

    // ── CARDS DE RESUMO ─────────────────────────────────────────
    const stats = dashboardData.stats;
    const cards = [
      { label: 'Receita Total', value: stats.monthlyRevenue, color: [209, 250, 229] as [number,number,number], text: [6, 78, 59] as [number,number,number] },
      { label: 'Despesas',      value: stats.monthlyExpenses ?? result.summary.despesas, color: [254, 226, 226] as [number,number,number], text: [127, 29, 29] as [number,number,number] },
      { label: 'Saldo Mensal',  value: stats.monthlyBalance ?? result.summary.saldo, color: [167, 119, 105] as [number,number,number], text: [255, 255, 255] as [number,number,number] },
    ];

    const cardW = (contentW - 8) / 3;
    cards.forEach((card, i) => {
      const x = margin + i * (cardW + 4);
      pdf.setFillColor(...card.color);
      pdf.roundedRect(x, y, cardW, 22, 3, 3, 'F');
      pdf.setTextColor(...card.text);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.text(card.label.toUpperCase(), x + 4, y + 7);
      pdf.setFontSize(11);
      pdf.text(
        card.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        x + 4,
        y + 16
      );
    });

    y += 30;

    // ── GRÁFICOS ────────────────────────────────────────────────
    pdf.setTextColor(40, 40, 40);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('Tendência Mensal', margin, y);
    pdf.text('Receita por Serviço', margin + contentW * 0.62, y);
    y += 4;

    // Captura os canvas já renderizados na página
    const barImg = barChartCanvas.toDataURL('image/png');
    const pieImg = pieChartCanvas.toDataURL('image/png');

    const barW = contentW * 0.58;
    const barH = barW * (220 / 580); // mantém proporção do canvas
    pdf.addImage(barImg, 'PNG', margin, y, barW, barH);

    const pieW = contentW * 0.36;
    const pieH = pieW;
    pdf.addImage(pieImg, 'PNG', margin + contentW * 0.62, y, pieW, pieH);

    y += Math.max(barH, pieH) + 10;

    // ── TABELA DE HISTÓRICO ─────────────────────────────────────
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(40, 40, 40);
    pdf.text(`Transações — ${MONTH_NAMES[month - 1]} ${year}`, margin, y);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    pdf.text(`${result.total} transação(ões) encontrada(s)`, W - margin, y, { align: 'right' });
    y += 6;

    // Cabeçalho da tabela
    const cols = { date: 14, desc: 60, cat: 30, status: 28, value: 20 };
    const rowH = 7;

    pdf.setFillColor(245, 245, 244);
    pdf.rect(margin, y, contentW, rowH, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(80, 80, 80);

    let cx = margin + 2;
    pdf.text('DATA',      cx, y + 4.5); cx += cols.date;
    pdf.text('DESCRIÇÃO', cx, y + 4.5); cx += cols.desc;
    pdf.text('CATEGORIA', cx, y + 4.5); cx += cols.cat;
    pdf.text('STATUS',    cx, y + 4.5); cx += cols.status;
    pdf.text('VALOR',     W - margin - 2, y + 4.5, { align: 'right' });

    y += rowH;

    // Linhas da tabela
    pdf.setFont('helvetica', 'normal');
    result.items.forEach((item, idx) => {
      // Nova página se necessário
      if (y + rowH > 285) {
        pdf.addPage();
        y = 14;
      }

      if (idx % 2 === 0) {
        pdf.setFillColor(250, 250, 249);
        pdf.rect(margin, y, contentW, rowH, 'F');
      }

      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 100, 100);

      cx = margin + 2;
      pdf.text(item.date, cx, y + 4.5); cx += cols.date;

      // Trunca descrição longa
      const desc = item.description.length > 32
        ? item.description.substring(0, 32) + '…'
        : item.description;
      pdf.setTextColor(30, 30, 30);
      pdf.text(desc, cx, y + 4.5); cx += cols.desc;

      // Badge categoria
      const isReceita = item.category === 'RECEITA';
      pdf.setFillColor(...(isReceita ? [209, 250, 229] : [254, 226, 226]) as [number,number,number]);
      pdf.roundedRect(cx, y + 1.5, 22, 4, 1, 1, 'F');
      pdf.setFontSize(6.5);
      pdf.setTextColor(...(isReceita ? [6, 78, 59] : [127, 29, 29]) as [number,number,number]);
      pdf.text(item.category, cx + 11, y + 4.5, { align: 'center' });
      cx += cols.cat;

      // Status
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 100, 100);
      pdf.text(item.status, cx, y + 4.5); cx += cols.status;

      // Valor
      const valueStr = item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      pdf.setTextColor(...(item.value > 0 ? [6, 78, 59] : [127, 29, 29]) as [number,number,number]);
      pdf.setFont('helvetica', 'bold');
      pdf.text(valueStr, W - margin - 2, y + 4.5, { align: 'right' });
      pdf.setFont('helvetica', 'normal');

      // Linha separadora
      pdf.setDrawColor(240, 240, 240);
      pdf.line(margin, y + rowH, W - margin, y + rowH);

      y += rowH;
    });

    // ── RODAPÉ ──────────────────────────────────────────────────
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(160, 160, 160);
      pdf.text(`Página ${i} de ${pageCount}`, W - margin, 292, { align: 'right' });
      pdf.text('Clínica — Relatório gerado automaticamente', margin, 292);
    }

    pdf.save(`relatorio-${MONTH_NAMES[month - 1].toLowerCase()}-${year}.pdf`);
  }
}