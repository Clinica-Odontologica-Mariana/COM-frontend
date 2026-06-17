import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CertificateService } from '../../services/certificate.service';
import { CertificateViewModel } from '../../models/certificate.model';

const CERTIFICATE_TYPES = [
  'Especialização',
  'Aperfeiçoamento',
  'Extensão',
  'Mestrado',
  'Doutorado',
  'Residência',
  'Certificação Profissional',
  'Outro',
];

@Component({
  selector: 'app-certificate-register-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [CertificateService],
  template: `
    <main class="min-h-screen bg-linear-to-br from-[#FAFAF9] to-[#F5F1ED] px-6 py-8 lg:px-12">
      <!-- Error global -->
      @if (service.error()) {
        <div
          class="mb-6 flex items-center justify-between rounded-xl bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm"
        >
          <span>{{ service.error() }}</span>
          <button (click)="service.clearError()" class="ml-4 text-red-500 hover:text-red-700">
            ✕
          </button>
        </div>
      }

      @if (successMessage()) {
        <div
          class="mb-6 flex items-center justify-between rounded-xl bg-green-50 px-5 py-4 text-sm text-green-700 shadow-sm"
        >
          <span>{{ successMessage() }}</span>
          <button
            (click)="successMessage.set(null)"
            class="ml-4 text-green-500 hover:text-green-700"
          >
            ✕
          </button>
        </div>
      }

      <div class="mx-auto flex gap-8 lg:gap-12">
        <!-- LEFT SIDE: FORM -->
        <div class="w-full lg:w-1/2">
          <div class="rounded-2xl bg-white p-8 shadow-sm">
            <h1 class="mb-2 text-2xl font-bold text-[#5E514B]">
              {{ editingId() ? 'Editar Credencial' : 'Adicionar Credencial' }}
            </h1>
            <p class="mb-8 text-sm text-[#8B8680]">Preencha os dados oficiais do documento.</p>

            <form (ngSubmit)="onSubmit()" #form="ngForm" class="space-y-6">
              <!-- Título -->
              <div>
                <label class="block text-xs font-bold uppercase tracking-wide text-[#78716C]">
                  Título do Certificado / Curso
                </label>
                <input
                  type="text"
                  [(ngModel)]="formData.title"
                  name="title"
                  placeholder="Laserterapia Aplicada"
                  maxlength="150"
                  class="mt-2 block w-full rounded-lg bg-[#F5F1ED] px-4 py-3 text-sm placeholder-[#A89D95] focus:outline-none focus:ring-2 focus:ring-[#8B574B]"
                  required
                />
              </div>

              <!-- Tipo de Certificado -->
              <div>
                <label class="block text-xs font-bold uppercase tracking-wide text-[#78716C]">
                  Tipo de Credencial
                </label>
                <select
                  [(ngModel)]="formData.certificateType"
                  name="certificateType"
                  class="mt-2 block w-full rounded-lg bg-[#F5F1ED] px-4 py-3 text-sm text-[#5E514B] focus:outline-none focus:ring-2 focus:ring-[#8B574B]"
                  required
                >
                  <option value="" disabled>Selecione o tipo</option>
                  @for (type of certificateTypes; track type) {
                    <option [value]="type">{{ type }}</option>
                  }
                </select>
              </div>

              <!-- Descrição / Conteúdo -->
              <div>
                <label class="block text-xs font-bold uppercase tracking-wide text-[#78716C]">
                  Descrição <span class="font-normal text-[#A89D95]">(opcional)</span>
                </label>
                <textarea
                  [(ngModel)]="formData.content"
                  name="content"
                  placeholder="Instituição, detalhes do curso, carga horária..."
                  rows="3"
                  class="mt-2 block w-full rounded-lg bg-[#F5F1ED] px-4 py-3 text-sm placeholder-[#A89D95] focus:outline-none focus:ring-2 focus:ring-[#8B574B] resize-none"
                ></textarea>
              </div>

              <!-- Data de Emissão -->
              <div>
                <label class="block text-xs font-bold uppercase tracking-wide text-[#78716C]">
                  Data de Emissão <span class="font-normal text-[#A89D95]">(opcional)</span>
                </label>
                <input
                  type="date"
                  [(ngModel)]="formData.issuedAt"
                  name="issuedAt"
                  class="mt-2 block w-full rounded-lg bg-[#F5F1ED] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B574B]"
                />
              </div>

              <!-- Upload do Documento -->
              <div>
                <label class="block text-xs font-bold uppercase tracking-wide text-[#78716C]">
                  Documento
                </label>
                <!-- Banner informativo — upload ainda não disponível -->
                <div
                  class="mt-2 flex items-start gap-3 rounded-lg border border-[#D4A574]/50 bg-[#FDF6EE] px-4 py-3 text-sm text-[#8B6535]"
                >
                  <svg
                    class="mt-0.5 h-4 w-4 shrink-0 text-[#D4A574]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span
                    >O upload de arquivos para certificados ainda não está disponível. Salve os
                    demais dados e anexe o documento quando a funcionalidade for liberada.</span
                  >
                </div>
              </div>

              <!-- Botões -->
              <div class="flex gap-3">
                <button
                  type="submit"
                  [disabled]="!form.valid || service.saving()"
                  class="flex-1 rounded-xl bg-[#8B574B] px-6 py-4 text-center font-semibold text-white transition hover:bg-[#744A40] disabled:opacity-50"
                >
                  {{
                    service.saving()
                      ? 'Salvando...'
                      : editingId()
                        ? 'Atualizar'
                        : 'Salvar Certificado'
                  }}
                </button>
                @if (editingId()) {
                  <button
                    type="button"
                    (click)="cancelEdit()"
                    class="flex-1 rounded-xl border-2 border-[#D4CCBE] px-6 py-4 text-center font-semibold text-[#5E514B] transition hover:bg-[#F5F1ED]"
                  >
                    Cancelar
                  </button>
                }
              </div>
            </form>
          </div>
        </div>

        <!-- RIGHT SIDE: GALLERY -->
        <div class="w-full lg:w-1/2">
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-[#5E514B]">Meus Certificados</h2>
            <p class="text-sm text-[#8B8680]">Galeria de conquistas recentes</p>
          </div>

          <!-- Loading -->
          @if (service.loading()) {
            <div class="space-y-4">
              @for (i of [1, 2, 3]; track i) {
                <div class="rounded-2xl bg-white p-6 shadow-sm animate-pulse">
                  <div class="mb-3 h-5 w-3/4 rounded bg-[#EDE8E6]"></div>
                  <div class="mb-2 h-4 w-1/2 rounded bg-[#EDE8E6]"></div>
                  <div class="h-4 w-1/4 rounded bg-[#EDE8E6]"></div>
                </div>
              }
            </div>
          }

          <!-- Empty state -->
          @if (!service.loading() && service.certificates().length === 0 && !service.error()) {
            <div class="rounded-2xl bg-white p-12 text-center shadow-sm">
              <svg
                class="mx-auto mb-4 h-12 w-12 text-[#D4CCBE]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              <p class="font-semibold text-[#5E514B]">Nenhum certificado cadastrado</p>
              <p class="mt-1 text-sm text-[#A89D95]">
                Adicione sua primeira credencial pelo formulário ao lado.
              </p>
            </div>
          }

          <!-- Error state -->
          @if (!service.loading() && service.error() && service.certificates().length === 0) {
            <div class="rounded-2xl bg-white p-12 text-center shadow-sm">
              <p class="font-semibold text-red-600">Não foi possível carregar os certificados.</p>
              <button
                (click)="service.load()"
                class="mt-4 text-sm text-[#8B574B] underline hover:text-[#744A40]"
              >
                Tentar novamente
              </button>
            </div>
          }

          <!-- List -->
          @if (!service.loading()) {
            <div class="space-y-4">
              @for (cert of service.certificates(); track cert.id) {
                <div class="group rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
                  <!-- Header -->
                  <div class="mb-3 flex items-start justify-between gap-3">
                    <div class="flex-1 min-w-0">
                      <h3 class="truncate text-lg font-bold text-[#5E514B]">{{ cert.title }}</h3>
                      <p class="mt-0.5 text-sm font-medium text-[#8B8680]">
                        {{ cert.certificateType }}
                      </p>
                    </div>
                    <div class="flex shrink-0 items-center gap-2">
                      @if (cert.status === 'active') {
                        <button
                          (click)="service.toggleFeatured(cert)"
                          [disabled]="!cert.featured && !service.canFeatureMore()"
                          [title]="
                            cert.featured
                              ? 'Remover dos destaques da home'
                              : service.canFeatureMore()
                                ? 'Destacar na home'
                                : 'Máximo de 3 destaques'
                          "
                          [class]="
                            'flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition ' +
                            (cert.featured
                              ? 'border-[#E0B84A] bg-[#FBF3DC] text-[#9A7B1E]'
                              : 'border-[#EDE7E2] text-[#A89D95] hover:text-[#8B574B] disabled:cursor-not-allowed disabled:opacity-40')
                          "
                        >
                          <span>{{ cert.featured ? '★' : '☆' }}</span>
                          Destaque
                        </button>
                      }
                      <span
                        [class]="
                          'rounded-full px-3 py-1 text-xs font-bold text-white ' +
                          (cert.status === 'active' ? 'bg-[#4CAF50]' : 'bg-[#D4A574]')
                        "
                      >
                        {{ cert.status === 'active' ? 'ATIVO' : 'REVOGADO' }}
                      </span>
                    </div>
                  </div>

                  <!-- Content preview -->
                  @if (cert.content) {
                    <p class="mb-3 line-clamp-2 text-sm text-[#78716C]">{{ cert.content }}</p>
                  }

                  <!-- Meta -->
                  <div class="flex flex-wrap items-center gap-4 text-xs text-[#A89D95]">
                    @if (cert.issuedAtFormatted) {
                      <span class="flex items-center gap-1">
                        <svg
                          class="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          ></path>
                        </svg>
                        Emitido em {{ cert.issuedAtFormatted }}
                      </span>
                    }
                    @if (cert.hasFile) {
                      <span class="flex items-center gap-1 text-[#8B574B]">
                        <svg
                          class="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                          ></path>
                        </svg>
                        Arquivo anexado
                      </span>
                    }
                  </div>

                  <!-- Actions -->
                  <div
                    class="mt-4 flex items-center justify-end gap-4 border-t border-[#F5F1ED] pt-4"
                  >
                    <button
                      (click)="viewCertificate(cert)"
                      class="flex items-center gap-1.5 text-xs text-[#8B8680] transition hover:text-[#5E514B]"
                      title="Visualizar"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        ></path>
                      </svg>
                      Visualizar
                    </button>
                    <button
                      (click)="editCertificate(cert)"
                      class="flex items-center gap-1.5 text-xs text-[#8B8680] transition hover:text-[#5E514B]"
                      title="Editar"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        ></path>
                      </svg>
                      Editar
                    </button>
                    <button
                      (click)="openDeleteModal(cert.id)"
                      [disabled]="service.deletingId() === cert.id"
                      class="flex items-center gap-1.5 text-xs text-red-400 transition hover:text-red-600 disabled:opacity-50"
                      title="Excluir"
                    >
                      @if (service.deletingId() === cert.id) {
                        <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                          ></circle>
                          <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          ></path>
                        </svg>
                      } @else {
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          ></path>
                        </svg>
                      }
                      Excluir
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- DELETE MODAL -->
      @if (showDeleteModal()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        >
          <div class="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
            <div class="mb-4 flex justify-center">
              <div class="rounded-full bg-red-100 p-3">
                <svg
                  class="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
            </div>
            <h3 class="mb-2 text-center text-xl font-bold text-[#5E514B]">Excluir Certificado?</h3>
            <p class="mb-6 text-center text-sm text-[#8B8680]">Esta ação não pode ser desfeita.</p>
            <div class="flex gap-3">
              <button
                (click)="confirmDelete()"
                [disabled]="!!service.deletingId()"
                class="flex-1 rounded-xl bg-[#DC2626] px-4 py-3 font-semibold text-white transition hover:bg-[#B91C1C] disabled:opacity-50"
              >
                Sim, Excluir
              </button>
              <button
                (click)="closeDeleteModal()"
                class="flex-1 rounded-xl border-2 border-[#D4CCBE] px-4 py-3 font-semibold text-[#5E514B] transition hover:bg-[#F5F1ED]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      }

      <!-- VIEW MODAL -->
      @if (showViewModal() && certificateToView()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          (click)="closeViewModal()"
        >
          <div
            class="mx-4 w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            style="max-height: 90vh"
            (click)="$event.stopPropagation()"
          >
            <!-- Header -->
            <div
              class="sticky top-0 flex items-center justify-between border-b border-[#E8DED8] bg-white px-6 py-4"
            >
              <h2 class="text-xl font-bold text-[#5E514B]">{{ certificateToView()?.title }}</h2>
              <button
                (click)="closeViewModal()"
                class="text-[#A89D95] transition hover:text-[#5E514B]"
              >
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <!-- Content -->
            <div class="space-y-5 p-6">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-bold uppercase text-[#78716C]">Título</label>
                  <p class="mt-1 font-semibold text-[#5E514B]">{{ certificateToView()?.title }}</p>
                </div>
                <div>
                  <label class="text-xs font-bold uppercase text-[#78716C]">Tipo</label>
                  <p class="mt-1 font-semibold text-[#5E514B]">
                    {{ certificateToView()?.certificateType }}
                  </p>
                </div>
              </div>

              @if (certificateToView()?.content) {
                <div>
                  <label class="text-xs font-bold uppercase text-[#78716C]">Descrição</label>
                  <p class="mt-1 whitespace-pre-wrap text-sm text-[#5E514B]">
                    {{ certificateToView()?.content }}
                  </p>
                </div>
              }

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-bold uppercase text-[#78716C]">Data de Emissão</label>
                  <p class="mt-1 font-semibold text-[#5E514B]">
                    {{ certificateToView()?.issuedAtFormatted ?? '—' }}
                  </p>
                </div>
                <div>
                  <label class="text-xs font-bold uppercase text-[#78716C]">Status</label>
                  <div class="mt-1">
                    <span
                      [class]="
                        'inline-block rounded-full px-4 py-1 text-sm font-bold text-white ' +
                        (certificateToView()?.status === 'active' ? 'bg-[#4CAF50]' : 'bg-[#D4A574]')
                      "
                    >
                      {{ certificateToView()?.status === 'active' ? 'ATIVO' : 'REVOGADO' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Arquivo -->
              <div>
                <label class="text-xs font-bold uppercase text-[#78716C]">Arquivo</label>
                @if (certificateToView()?.hasFile) {
                  <div
                    class="mt-2 flex items-start gap-3 rounded-lg border border-[#D4A574]/50 bg-[#FDF6EE] px-4 py-3 text-sm text-[#8B6535]"
                  >
                    <svg
                      class="mt-0.5 h-4 w-4 shrink-0 text-[#D4A574]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <span
                      >Arquivo disponível no servidor. Download direto ainda não implementado.</span
                    >
                  </div>
                } @else {
                  <p class="mt-1 text-sm text-[#A89D95]">Nenhum arquivo anexado.</p>
                }
              </div>

              <div class="flex gap-3 pt-2">
                <button
                  (click)="editCertificate(certificateToView()!); closeViewModal()"
                  class="flex-1 rounded-xl border-2 border-[#8B574B] px-4 py-3 font-semibold text-[#8B574B] transition hover:bg-[#F5F1ED]"
                >
                  Editar
                </button>
                <button
                  (click)="closeViewModal()"
                  class="flex-1 rounded-xl border-2 border-[#D4CCBE] px-4 py-3 font-semibold text-[#5E514B] transition hover:bg-[#F5F1ED]"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertificateRegisterPageComponent implements OnInit {
  protected readonly service = inject(CertificateService);
  protected readonly certificateTypes = CERTIFICATE_TYPES;

  protected readonly editingId = signal<string | null>(null);
  protected readonly showDeleteModal = signal(false);
  protected readonly certificateToDelete = signal<string | null>(null);
  protected readonly showViewModal = signal(false);
  protected readonly certificateToView = signal<CertificateViewModel | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected formData = {
    title: '',
    certificateType: '',
    content: '',
    issuedAt: '',
  };

  ngOnInit(): void {
    this.service.load();
  }

  protected onSubmit(): void {
    if (!this.formData.title || !this.formData.certificateType) return;

    const issuedAtIso = this.formData.issuedAt
      ? new Date(this.formData.issuedAt).toISOString()
      : undefined;

    if (this.editingId()) {
      this.service
        .update(this.editingId()!, {
          title: this.formData.title,
          certificateType: this.formData.certificateType,
          content: this.formData.content || undefined,
          issuedAt: issuedAtIso,
        })
        .subscribe({
          next: () => {
            this.showSuccess('Certificado atualizado com sucesso.');
            this.resetForm();
          },
          error: () => {
            /* service.error() já exibe a mensagem */
          },
        });
    } else {
      this.service
        .create({
          title: this.formData.title,
          certificateType: this.formData.certificateType,
          content: this.formData.content || undefined,
          issuedAt: issuedAtIso,
        })
        .subscribe({
          next: () => {
            this.showSuccess('Certificado salvo com sucesso.');
            this.resetForm();
          },
          error: () => {
            /* service.error() já exibe a mensagem */
          },
        });
    }
  }

  protected editCertificate(cert: CertificateViewModel): void {
    this.formData = {
      title: cert.title,
      certificateType: cert.certificateType,
      content: cert.content ?? '',
      issuedAt: cert.issuedAt ? cert.issuedAt.split('T')[0] : '',
    };
    this.editingId.set(cert.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.resetForm();
  }

  protected viewCertificate(cert: CertificateViewModel): void {
    this.certificateToView.set(cert);
    this.showViewModal.set(true);
  }

  protected closeViewModal(): void {
    this.showViewModal.set(false);
    this.certificateToView.set(null);
  }

  protected openDeleteModal(id: string): void {
    this.certificateToDelete.set(id);
    this.showDeleteModal.set(true);
  }

  protected closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.certificateToDelete.set(null);
  }

  protected confirmDelete(): void {
    const id = this.certificateToDelete();
    if (!id) return;

    this.service.delete(id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.showSuccess('Certificado excluído.');
      },
      error: () => {
        this.closeDeleteModal();
      },
    });
  }

  private resetForm(): void {
    this.formData = { title: '', certificateType: '', content: '', issuedAt: '' };
    this.editingId.set(null);
  }

  private showSuccess(message: string): void {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(null), 4000);
  }
}
