import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ProcedureStatus } from '../../models/treatment.model';

interface BadgeConfig {
  label: string;
  color: string;
  bg: string;
}

const BADGE_CONFIGS: Record<ProcedureStatus, BadgeConfig> = {
  pending:      { label: 'Pendente',      color: '#92400E', bg: '#FEF3C7' },
  in_progress:  { label: 'Em andamento',  color: '#7C5145', bg: '#F0E4DF' },
  completed:    { label: 'Concluído',     color: '#166534', bg: '#BBFCC7' },
  interrupted:  { label: 'Observação',    color: '#1E40AF', bg: '#DBEAFE' },
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
