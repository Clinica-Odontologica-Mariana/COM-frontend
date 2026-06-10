import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { AttachmentView } from '../../models/patient-record.models';

// TODO: presigned URL endpoint not available — image previews show placeholder until backend provides
// GET /medical-records/attachments/{id}/download-url

@Component({
  selector: 'app-patient-gallery',
  imports: [DatePipe],
  template: `
    <section class="my-4">
      <div class="mb-8 flex items-center justify-between gap-4">
        <h2 class="text-2xl font-bold text-[#7C5145]" style="font-family: 'Noto Serif', serif">
          Exames e Galeria
        </h2>

        <label
          class="flex cursor-pointer items-center gap-1.5 text-sm font-bold text-[#78716C] transition hover:text-[#57534E]"
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
          <input
            type="file"
            class="sr-only"
            accept="image/*,application/pdf"
            multiple
            (change)="onFileSelected($event)"
            [disabled]="uploading()"
          />
          {{ uploading() ? 'Enviando...' : 'Adicionar' }}
        </label>
      </div>

      <div class="grid grid-cols-3 gap-3 sm:grid-cols-3">
        @for (att of attachments(); track att.id) {
          <div class="group relative aspect-square overflow-hidden rounded-xl bg-[#E7E5E4]">
            <!-- Image preview or icon -->
            @if (att.isImage) {
              <div class="grid h-full w-full place-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-8 w-8 text-[#A8A29E]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            } @else {
              <div class="grid h-full w-full place-items-center bg-[#F5F5F4]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-8 w-8 text-[#A8A29E]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
            }

            <!-- Overlay on hover -->
            <div
              class="absolute inset-0 flex flex-col justify-end bg-black/40 p-3 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <p class="truncate text-[10px] font-bold uppercase tracking-[1px] text-white">
                {{ att.originalFileName }}
              </p>
              <div class="mt-1 flex items-center justify-between">
                <span class="text-[10px] text-white/70">{{
                  att.createdAt | date: 'dd/MM/yyyy'
                }}</span>
                <button
                  type="button"
                  class="rounded px-1.5 py-0.5 text-[10px] font-semibold text-white/80 transition hover:bg-white/20"
                  (click)="deleted.emit(att.id)"
                  aria-label="Excluir anexo"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Upload slot -->
        <label
          class="group max-w-80 flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#D6D3D1] bg-[#EEEEEE] transition hover:border-[#A8A29E]"
        >
          <input
            type="file"
            class="sr-only"
            accept="image/*,application/pdf"
            multiple
            (change)="onFileSelected($event)"
            [disabled]="uploading()"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-[#A8A29E] transition group-hover:text-[#78716C]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span class="text-[10px] font-bold uppercase tracking-wide text-[#78716C]"
            >Anexar arquivo</span
          >
        </label>
      </div>

      @if (!attachments().length) {
        <p class="mt-4 text-center text-sm text-[#A8A29E]">Nenhum arquivo anexado ainda.</p>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientGalleryComponent {
  readonly patientId = input.required<string>();
  readonly attachments = input<AttachmentView[]>([]);
  readonly uploading = input(false);
  readonly deleted = output<string>();
  readonly fileSelected = output<File>();

  protected onFileSelected(event: Event): void {
    const el = event.target as HTMLInputElement;
    Array.from(el.files ?? []).forEach((f) => this.fileSelected.emit(f));
    el.value = '';
  }
}
