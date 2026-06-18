import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { EvolutionCardComponent } from '../evolution-card/evolution-card.component';
import { ClinicalNoteView } from '../../models/patient-record.models';

export interface NoteEditPayload {
  id: string;
  note: string;
}

@Component({
  selector: 'app-clinical-evolutions',
  imports: [EvolutionCardComponent],
  template: `
    <section>
      <div class="mb-8 flex items-center justify-between gap-3">
        <h2 class="min-w-0 text-xl font-bold text-[#7C5145] sm:text-2xl" style="font-family: 'Noto Serif', serif">
          Evoluções Clínicas
        </h2>

        <button
          type="button"
          class="flex shrink-0 cursor-pointer items-center gap-2 text-sm font-bold text-[#7C5145] transition hover:text-[#6B4439]"
          (click)="newNote.emit()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-3 w-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nova Evolução
        </button>
      </div>

      <div class="flex flex-col gap-4">
        @for (note of notes(); track note.id) {
          <app-evolution-card
            [note]="note"
            (deleted)="noteDeleted.emit($event)"
            (edited)="noteEdited.emit($event)"
          />
        } @empty {
          <div
            class="rounded-xl border border-dashed border-[#D6D3D1] bg-[#FAFAF9] p-12 text-center"
          >
            <p class="text-sm font-medium text-[#78716C]">Nenhuma evolução clínica registrada.</p>
            <button
              type="button"
              class="mt-4 text-sm font-bold text-[#7C5145] transition hover:text-[#6B4439]"
              (click)="newNote.emit()"
            >
              Adicionar primeira evolução
            </button>
          </div>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClinicalEvolutionsComponent {
  readonly notes = input<ClinicalNoteView[]>([]);
  readonly newNote = output<void>();
  readonly noteDeleted = output<string>();
  readonly noteEdited = output<NoteEditPayload>();
}
