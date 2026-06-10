import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ProcedureStatus } from '../../models/tratamento.model';

interface BadgeConfig {
  label: string;
  color: string;
  bg: string;
}

const BADGE_CONFIGS: Record<ProcedureStatus, BadgeConfig> = {
  concluido: { label: 'Concluído', color: '#57534E', bg: '#E7E5E4' },
  pendente: { label: 'Pendente', color: '#92400E', bg: '#FEF3C7' },
  em_andamento: { label: 'Em andamento', color: '#FFFFFF', bg: '#7C5145' },
  interrompido: { label: 'Interrompido', color: '#B20000', bg: 'rgba(178,0,0,0.10)' },
  planejado: { label: 'Planejado', color: '#1E40AF', bg: '#DBEAFE' },
};

@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center gap-1.5 rounded-full px-3 font-bold uppercase leading-none"
      style="font-family: Manrope, sans-serif; font-size: 10px; letter-spacing: -0.5px; padding-top: 5px; padding-bottom: 5px;"
      [style.background-color]="cfg().bg"
      [style.color]="cfg().color"
    >
      <span class="h-1.5 w-1.5 shrink-0 rounded-full" [style.background-color]="cfg().color"></span>
      {{ cfg().label }}
    </span>
  `,
})
export class StatusBadgeComponent {
  status = input.required<ProcedureStatus>();

  protected cfg = computed(() => BADGE_CONFIGS[this.status()]);
}
