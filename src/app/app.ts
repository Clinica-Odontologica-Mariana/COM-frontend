import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = signal('COM-frontend');

  protected readonly highlights = [
    {
      title: 'Paleta principal',
      description: '#cf9c92, #a77769, #efebe9 e #ddc7b4 já estão disponíveis como tokens Tailwind.',
    },
    {
      title: 'Base pronta',
      description:
        'O projeto já entra com utilitários, gradientes e cards estruturados para evoluir rápido.',
    },
    {
      title: 'Foco em UI',
      description:
        'A tela inicial foi redesenhada para validar a integração visual do Tailwind no app.',
    },
  ];

  protected readonly metrics = [
    { value: '4', label: 'cores principais' },
    { value: '1', label: 'setup Tailwind' },
    { value: '100%', label: 'utilitários reutilizáveis' },
  ];
}
