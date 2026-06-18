import { ChangeDetectionStrategy, Component, input } from '@angular/core';

interface JourneyStep {
  label: string;
  subtitle: string;
}

const STEPS: JourneyStep[] = [
  { label: 'Triagem Inicial', subtitle: 'Realizado em 05 Out' },
  { label: 'Fase Curativa', subtitle: 'Em progresso (2 procedimentos)' },
  { label: 'Fase Preventiva', subtitle: 'Aguardando curativo' },
];

@Component({
  selector: 'app-journey-tracker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col"
      style="background: #F3F3F3; border-radius: 32px; padding: 32px; gap: 24px;"
    >
      <!-- Heading -->
      <h3
        style="font-family: 'Noto Serif', serif; font-weight: 400; font-size: 20px; line-height: 28px; color: #1A1C1C; margin: 0;"
      >
        Status da Jornada
      </h3>

      <!-- Steps -->
      <div style="display: flex; flex-direction: column; gap: 32px; padding-bottom: 24px;">
        @for (step of steps; track step.label; let i = $index) {
          <div
            class="flex flex-row items-start gap-4"
            style="position: relative; isolation: isolate;"
            [style.opacity]="i > currentStep() ? '0.4' : '1'"
          >
            <!-- Circle -->
            <div
              style="width: 24px; height: 24px; border-radius: 9999px; flex-shrink: 0; display: grid; place-items: center; z-index: 2;"
              [style]="circleStyle(i)"
            >
              @if (i < currentStep()) {
                <!-- Checkmark for completed -->
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path
                    d="M1 3.5L3.5 6L8 1"
                    stroke="white"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              }
            </div>

            <!-- Connector line (not last step) -->
            @if (i < steps.length - 1) {
              <div
                style="position: absolute; left: 11px; top: 24px; bottom: -32px; width: 2px; background: rgba(124,81,69,0.2); z-index: 1;"
              ></div>
            }

            <!-- Step text -->
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <p
                style="font-family: Manrope, sans-serif; font-size: 14px; font-weight: 700; line-height: 20px; margin: 0;"
                [style.color]="i === currentStep() ? '#7C5145' : '#1A1C1C'"
              >
                {{ step.label }}
              </p>
              <p
                style="font-family: Manrope, sans-serif; font-size: 12px; font-weight: 400; line-height: 16px; color: #69594A; margin: 0;"
              >
                {{ step.subtitle }}
              </p>
            </div>
          </div>
        }
      </div>

      <!-- Next step card -->
      @if (nextStep()) {
        <div
          style="background: #FFFFFF; border-top: 4px solid #69594A; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 8px;"
        >
          <!-- Header row -->
          <div style="display: flex; flex-direction: row; align-items: center; gap: 8px;">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5.5" stroke="#69594A" />
              <path d="M6 5.5V8.5" stroke="#69594A" stroke-width="1.2" stroke-linecap="round" />
              <circle cx="6" cy="3.5" r="0.6" fill="#69594A" />
            </svg>
            <span
              style="font-family: Manrope, sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: #69594A;"
            >
              Próximo Passo
            </span>
          </div>
          <!-- Body -->
          <p
            style="font-family: Manrope, sans-serif; font-size: 12px; font-weight: 400; line-height: 20px; color: #514440; margin: 0;"
          >
            {{ nextStep() }}
          </p>
        </div>
      }
    </div>
  `,
})
export class JourneyTrackerComponent {
  currentStep = input<number>(0);
  nextStep = input<string>('');

  protected readonly steps = STEPS;

  protected circleStyle(i: number): Record<string, string> {
    const cur = this.currentStep();
    if (i < cur) {
      return { background: '#7C5145' };
    }
    if (i === cur) {
      return {
        background: '#7C5145',
        border: '4px solid #FFFFFF',
        'box-shadow': '0 0 0 2px rgba(124,81,69,0.25)',
      };
    }
    return { background: '#D6D3D1' };
  }
}
