import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { filter } from 'rxjs';

import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';
import { AttachmentView } from '../../models/patient-record.models';

@Component({
  selector: 'app-patient-gallery',
  imports: [DatePipe],
  template: `
    <section class="my-4 max-w-screen">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-[#7C5145]" style="font-family: 'Noto Serif', serif">
          Exames e Galeria
        </h2>
      </div>

      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
        @for (att of attachments(); track att.id) {
          <div class="overflow-hidden rounded-xl border border-[#E7E5E4] bg-white">
            <!-- Preview area -->
            <div
              class="flex aspect-square cursor-pointer items-center justify-center overflow-hidden"
              [class]="
                att.isImage && !att.imageUrl ? 'bg-[#E7E5E4]' : !att.isImage ? 'bg-[#F5F5F4]' : ''
              "
              (click)="openModal(att)"
            >
              @if (att.isImage && att.imageUrl) {
                <img
                  [src]="att.imageUrl"
                  [alt]="att.originalFileName"
                  class="h-full w-full object-cover transition duration-200 hover:scale-105"
                />
              } @else if (att.isImage) {
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-10 w-10 text-[#A8A29E]"
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
              } @else {
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-10 w-10 text-[#A8A29E]"
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
              }
            </div>

            <!-- Info bar — always visible -->
            <div class="flex items-center justify-between gap-2 px-3 py-2">
              <div class="min-w-0 cursor-pointer" (click)="openModal(att)">
                <p class="truncate text-[11px] font-semibold text-[#44403C]">
                  {{ att.originalFileName }}
                </p>
                <p class="mt-0.5 text-[10px] text-[#A8A29E]">
                  {{ att.createdAt | date: 'dd/MM/yyyy' }}
                </p>
              </div>
              <button
                type="button"
                class="shrink-0 rounded p-1 text-[#A8A29E] transition hover:bg-[#F5F5F4] hover:text-red-400"
                (click)="requestDelete(att.id)"
                aria-label="Excluir anexo"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        }

        <!-- Upload slot -->
        <label
          class="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#D6D3D1] bg-[#F5F5F4] transition hover:border-[#A8A29E]"
          style="min-height: 120px"
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
          <span class="text-[10px] font-bold uppercase tracking-wide text-[#78716C]">
            {{ uploading() ? 'Enviando...' : 'Anexar arquivo' }}
          </span>
        </label>
      </div>

      @if (!attachments().length) {
        <p class="mt-4 text-center text-sm text-[#A8A29E]">Nenhum arquivo anexado ainda.</p>
      }
    </section>

    <!-- Lightbox modal -->
    @if (selected()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        (click)="closeModal()"
      >
        <div
          class="relative flex w-[90vw] max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          (click)="$event.stopPropagation()"
        >
          <!-- Close button -->
          <button
            type="button"
            class="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-1.5 text-[#78716C] shadow transition hover:bg-white hover:text-[#44403C]"
            (click)="closeModal()"
            aria-label="Fechar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Image or document icon -->
          <div class="flex min-h-0 flex-1 items-center justify-center bg-[#1C1917]">
            @if (selected()!.isImage && selected()!.imageUrl) {
              <img
                [src]="selected()!.imageUrl!"
                [alt]="selected()!.originalFileName"
                class="h-full w-full object-contain"
                style="max-height: calc(90vh - 80px)"
              />
            } @else if (selected()!.isImage) {
              <div class="flex h-48 items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-16 w-16 text-[#78716C]"
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
              <div class="flex h-48 flex-col items-center justify-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-16 w-16 text-[#78716C]"
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
          </div>

          <!-- Details -->
          <div class="shrink-0 px-5 py-4">
            <p class="text-base font-semibold text-[#1C1917]">{{ selected()!.originalFileName }}</p>
            <div class="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#78716C]">
              <span>
                <span class="font-medium text-[#44403C]">Data:</span>
                {{ selected()!.createdAt | date: 'dd/MM/yyyy' }}
              </span>
              <span>
                <span class="font-medium text-[#44403C]">Tamanho:</span>
                {{ formatSize(selected()!.sizeBytes) }}
              </span>
              <span>
                <span class="font-medium text-[#44403C]">Tipo:</span>
                {{ selected()!.mimeType }}
              </span>
            </div>
            @if (selected()!.description) {
              <p class="mt-3 text-sm text-[#78716C]">{{ selected()!.description }}</p>
            }
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientGalleryComponent {
  readonly patientId = input.required<string>();
  readonly attachments = input<AttachmentView[]>([]);
  readonly uploading = input(false);
  readonly deleted = output<string>();
  readonly fileSelected = output<File>();

  private readonly confirmDialog = inject(ConfirmDialogService);

  protected readonly selected = signal<AttachmentView | null>(null);

  protected openModal(att: AttachmentView): void {
    this.selected.set(att);
  }

  protected closeModal(): void {
    this.selected.set(null);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closeModal();
  }

  protected requestDelete(id: string): void {
    this.confirmDialog
      .confirm('Deseja excluir este arquivo?', 'Excluir arquivo')
      .pipe(filter(Boolean))
      .subscribe(() => this.deleted.emit(id));
  }

  protected formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  protected onFileSelected(event: Event): void {
    const el = event.target as HTMLInputElement;
    Array.from(el.files ?? []).forEach((f) => this.fileSelected.emit(f));
    el.value = '';
  }
}
