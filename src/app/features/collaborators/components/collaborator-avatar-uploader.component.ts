import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-collaborator-avatar-uploader',
  template: `
    <section class="space-y-3">
      <div class="flex items-center gap-3">
        <label class="text-sm font-semibold text-[#6C625D]" [attr.for]="inputId">{{ label() }}</label>
      </div>

      <div class="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-[#E1D4CE] bg-white p-4">
        <div class="flex w-full max-w-[300px] flex-col items-center justify-center gap-3 text-center">
          <div class="mx-auto flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-[#F6F0ED] text-[#8B5E4E]">
            @if (previewUrl()) {
              <img [src]="previewUrl()" alt="Pré-visualização do avatar" class="h-full w-full object-cover" />
            } @else {
              <span class="text-2xl font-semibold">{{ initials() || 'CO' }}</span>
            }
          </div>

          <div class="mt-3 flex flex-col items-center gap-3">
            <div
              role="button"
              tabindex="0"
              class="inline-flex min-w-[140px] cursor-pointer items-center justify-center rounded-2xl bg-[#8B5E4E] px-5 py-3 transition hover:bg-[#744A40]"
              (click)="fileInput.click()"
              (keydown.enter)="fileInput.click()"
              (keydown.space)="$event.preventDefault(); fileInput.click()"
              aria-label="Selecionar foto"
            >
              <span style="color: #fff !important; font-size: 14px !important; font-weight: 700; line-height: 1.25; white-space: nowrap; display: block">
                Selecionar foto
              </span>
            </div>

            @if (previewUrl()) {
              <button
                type="button"
                class="inline-flex h-11 items-center justify-center rounded-2xl border border-[#E7D7CF] bg-white px-5 text-sm font-semibold text-[#7C5145] transition hover:bg-[#F8F4F1]"
                (click)="remove.emit()"
              >
                Remover
              </button>
            }
          </div>

          <p class="mt-3 text-sm leading-6 text-[#726863] text-center">{{ description() }}</p>
          @if (helperText()) {
            <p class="text-xs text-[#A29087] text-center">{{ helperText() }}</p>
          }
          <p class="text-xs leading-5 text-[#8A7D76] text-center">Formatos: JPG, PNG, SVG. Máx 2MB.</p>
        </div>
      </div>

      <input
        #fileInput
        [id]="inputId"
        type="file"
        accept="image/*"
        class="sr-only"
        (change)="onFileChange($event)"
      />
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollaboratorAvatarUploaderComponent {
  readonly label = input('Avatar');
  readonly description = input('Envie uma imagem para representar o colaborador no dashboard.');
  readonly helperText = input('');
  readonly previewUrl = input('');
  readonly initials = input('CO');
  readonly buttonLabel = input('Selecionar foto');

  readonly fileSelected = output<File | null>();
  readonly remove = output<void>();

  protected readonly inputId = `avatar-${Math.random().toString(36).slice(2, 8)}`;

  protected onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.fileSelected.emit(file);
    input.value = '';
  }
}
