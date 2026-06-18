import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  link?: string;
}

@Component({
  selector: 'app-patient-page-header',
  imports: [RouterLink],
  template: `
    <header
      class="sticky top-0 z-10 flex flex-col gap-4 border-b border-transparent bg-[#F9F9F9]/70 px-6 py-6 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between lg:px-8"
    >
      <div class="space-y-1">
        @if (breadcrumbs().length > 0) {
          <nav class="flex items-center gap-2 text-xs uppercase tracking-widest text-[#78716C]">
            @for (item of breadcrumbs(); track item.label; let last = $last) {
              @if (item.link && !last) {
                <a [routerLink]="item.link" class="hover:text-[#7C5145]">{{ item.label }}</a>
              } @else if (!last) {
                <span>{{ item.label }}</span>
              } @else {
                <span class="font-bold text-[#7C5145]">{{ item.label }}</span>
              }
              @if (!last) {
                <span class="text-[#A8A29E]">›</span>
              }
            }
          </nav>
        }
        <h1 class="font-serif text-3xl font-bold text-[#7C5145]">{{ title() }}</h1>
      </div>
      <div class="flex shrink-0 items-center gap-3">
        <ng-content />
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientPageHeaderComponent {
  readonly title = input.required<string>();
  readonly breadcrumbs = input<BreadcrumbItem[]>([]);
}
