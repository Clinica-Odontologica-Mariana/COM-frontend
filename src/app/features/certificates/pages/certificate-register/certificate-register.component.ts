import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Certificate {
  id: string;
  title: string;
  institution: string;
  year: number;
  image: string;
  status: 'valid' | 'expired';
  conclusionDate: string;
  validityDate: string;
}

@Component({
  selector: 'app-certificate-register-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="min-h-screen bg-gradient-to-br from-[#FAFAF9] to-[#F5F1ED] px-6 py-8 lg:px-12">
      <div class="mx-auto flex gap-8 lg:gap-12">
        <!-- LEFT SIDE: FORM -->
        <div class="w-full lg:w-1/2">
          <div class="rounded-2xl bg-white p-8 shadow-sm">
            <h1 class="mb-2 text-2xl font-bold text-[#5E514B]">
              {{ editingId() ? 'Editar Credencial' : 'Adicionar Credencial' }}
            </h1>
            <p class="mb-8 text-sm text-[#8B8680]">Preencha os dados oficiais do documento.</p>

            <form (ngSubmit)="onSubmit()" #form="ngForm" class="space-y-6">
              <!-- Nome do Certificado/Curso -->
              <div>
                <label class="block text-xs font-bold uppercase tracking-wide text-[#78716C]">
                  Nome do Certificado/Curso
                </label>
                <input
                  type="text"
                  [(ngModel)]="formData.certificateName"
                  name="certificateName"
                  placeholder="Laserterapia Aplicada"
                  class="mt-2 block w-full rounded-lg bg-[#F5F1ED] px-4 py-3 text-sm placeholder-[#A89D95] focus:outline-none focus:ring-2 focus:ring-[#8B574B]"
                  required
                />
              </div>

              <!-- Instituição -->
              <div>
                <label class="block text-xs font-bold uppercase tracking-wide text-[#78716C]">
                  Instituição
                </label>
                <input
                  type="text"
                  [(ngModel)]="formData.institution"
                  name="institution"
                  placeholder="Instituto Albert Einstein"
                  class="mt-2 block w-full rounded-lg bg-[#F5F1ED] px-4 py-3 text-sm placeholder-[#A89D95] focus:outline-none focus:ring-2 focus:ring-[#8B574B]"
                  required
                />
              </div>

              <!-- Datas: Conclusão e Validade -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wide text-[#78716C]">
                    Conclusão
                  </label>
                  <input
                    type="date"
                    [(ngModel)]="formData.conclusionDate"
                    name="conclusionDate"
                    class="mt-2 block w-full rounded-lg bg-[#F5F1ED] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B574B]"
                    required
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wide text-[#78716C]">
                    Validade
                  </label>
                  <input
                    type="date"
                    [(ngModel)]="formData.validityDate"
                    name="validityDate"
                    class="mt-2 block w-full rounded-lg bg-[#F5F1ED] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B574B]"
                    required
                  />
                </div>
              </div>

              <!-- Upload do Documento -->
              <div>
                <label class="block text-xs font-bold uppercase tracking-wide text-[#78716C]">
                  Upload do Documento
                </label>
                <div
                  class="mt-2 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#D4CCBE] bg-[#FAFAF9] py-12 transition hover:bg-[#F5F1ED]"
                  (drop)="onFileDropped($event)"
                  (dragover)="$event.preventDefault()"
                  (dragleave)="$event.preventDefault()"
                >
                  <svg class="mb-3 h-12 w-12 text-[#A89D95]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <p class="text-center text-sm font-medium text-[#5E514B]">Arraste seu PDF ou JPG aqui</p>
                  <p class="mt-1 text-xs text-[#A89D95]">MÁXIMO 10MB</p>
                  <input
                    type="file"
                    #fileInput
                    (change)="onFileSelected($event)"
                    accept=".pdf,.jpg,.jpeg,.png"
                    class="hidden"
                  />
                  <button
                    type="button"
                    (click)="fileInput.click()"
                    class="mt-3 text-xs text-[#8B574B] underline hover:text-[#744A40]"
                  >
                    Ou clique para selecionar
                  </button>
                </div>
                @if (formData.fileName) {
                  <p class="mt-2 text-xs text-green-600">✓ {{ formData.fileName }}</p>
                }
              </div>

              <!-- Botões -->
              <div class="flex gap-3">
                <button
                  type="submit"
                  [disabled]="!form.valid || loading()"
                  class="flex-1 rounded-xl bg-[#8B574B] px-6 py-4 text-center font-semibold text-white transition hover:bg-[#744A40] disabled:opacity-50"
                >
                  {{ loading() ? 'Salvando...' : editingId() ? 'Atualizar' : 'Salvar Certificado' }}
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

          <div class="space-y-6">
            @for (cert of certificates(); track cert.id) {
              <div class="group rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
                <!-- Imagem do Certificado -->
                <div class="relative mb-4 overflow-hidden rounded-lg bg-gray-200 h-48">
                  <img [src]="cert.image" [alt]="cert.title" class="h-full w-full object-cover" />
                  <div
                    [class]="'absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-white ' + (cert.status === 'valid' ? 'bg-[#4CAF50]' : 'bg-[#D4A574]')"
                  >
                    {{ cert.status === 'valid' ? 'VÁLIDO' : 'EXPIRADO' }}
                  </div>
                </div>

                <!-- Info -->
                <h3 class="text-lg font-bold text-[#5E514B]">{{ cert.title }}</h3>
                <p class="text-sm text-[#8B8680]">{{ cert.institution }} • {{ cert.year }}</p>

                <!-- Actions -->
                <div class="mt-4 flex items-center justify-center gap-4">
                  <button (click)="viewCertificate(cert.id)" class="text-[#8B8680] transition hover:text-[#5E514B]" title="Visualizar">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </button>
                  <button (click)="downloadCertificate(cert.id)" class="text-[#8B8680] transition hover:text-[#5E514B]" title="Download">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 16v-4m0 0l-3 3m3-3l3 3m2-11H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2z"></path>
                    </svg>
                  </button>
                  <button (click)="editCertificate(cert.id)" class="text-[#8B8680] transition hover:text-[#5E514B]" title="Editar">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button (click)="openDeleteModal(cert.id)" class="text-red-500 transition hover:text-red-700" title="Deletar">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            }

            @if (certificates().length === 0) {
              <div class="rounded-2xl bg-white p-12 text-center">
                <p class="text-[#A89D95]">Nenhum certificado cadastrado ainda.</p>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- DELETE MODAL -->
      @if (showDeleteModal()) {
        <div class="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div class="rounded-2xl bg-white p-8 shadow-lg max-w-sm mx-4">
            <div class="flex justify-center mb-4">
              <div class="rounded-full bg-red-100 p-3">
                <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <h3 class="text-center text-xl font-bold text-[#5E514B] mb-2">Excluir Certificado?</h3>
            <p class="text-center text-sm text-[#8B8680] mb-6">Tem certeza que deseja remover o certificado? Esta ação não pode ser desfeita.</p>
            <div class="flex gap-3">
              <button
                (click)="confirmDelete()"
                class="flex-1 rounded-xl bg-[#DC2626] px-4 py-3 font-semibold text-white transition hover:bg-[#B91C1C]"
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
        <div class="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50" (click)="closeViewModal()">
          <div class="rounded-2xl bg-white shadow-2xl max-w-2xl mx-4 w-full max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <!-- Close Button -->
            <div class="sticky top-0 flex items-center justify-between bg-white px-6 py-4 border-b border-[#E8DED8]">
              <h2 class="text-xl font-bold text-[#5E514B]">{{ certificateToView()?.title }}</h2>
              <button (click)="closeViewModal()" class="text-[#A89D95] transition hover:text-[#5E514B]">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <!-- Content -->
            <div class="p-6">
              <!-- Imagem -->
              <img
                [src]="certificateToView()?.image"
                [alt]="certificateToView()?.title"
                class="w-full rounded-lg mb-6 max-h-96 object-cover"
              />

              <!-- Informações -->
              <div class="space-y-4">
                <div>
                  <label class="text-xs font-bold uppercase text-[#78716C]">Nome do Certificado</label>
                  <p class="text-lg font-semibold text-[#5E514B]">{{ certificateToView()?.title }}</p>
                </div>

                <div>
                  <label class="text-xs font-bold uppercase text-[#78716C]">Instituição</label>
                  <p class="text-lg font-semibold text-[#5E514B]">{{ certificateToView()?.institution }}</p>
                </div>

                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label class="text-xs font-bold uppercase text-[#78716C]">Ano</label>
                    <p class="text-lg font-semibold text-[#5E514B]">{{ certificateToView()?.year }}</p>
                  </div>
                  <div>
                    <label class="text-xs font-bold uppercase text-[#78716C]">Conclusão</label>
                    <p class="text-lg font-semibold text-[#5E514B]">
                      {{ certificateToView()?.conclusionDate | date: 'dd/MM/yyyy' }}
                    </p>
                  </div>
                  <div>
                    <label class="text-xs font-bold uppercase text-[#78716C]">Validade</label>
                    <p class="text-lg font-semibold text-[#5E514B]">
                      {{ certificateToView()?.validityDate | date: 'dd/MM/yyyy' }}
                    </p>
                  </div>
                </div>

                <div>
                  <label class="text-xs font-bold uppercase text-[#78716C]">Status</label>
                  <div
                    [class]="'inline-block rounded-full px-4 py-2 text-sm font-bold text-white ' + (certificateToView()?.status === 'valid' ? 'bg-[#4CAF50]' : 'bg-[#D4A574]')"
                  >
                    {{ certificateToView()?.status === 'valid' ? 'VÁLIDO' : 'EXPIRADO' }}
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="mt-6 flex gap-3">
                <button
                  (click)="downloadCertificate(certificateToView()!.id)"
                  class="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#8B574B] px-4 py-3 font-semibold text-white transition hover:bg-[#744A40]"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 16v-4m0 0l-3 3m3-3l3 3m2-11H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2z"></path>
                  </svg>
                  Download
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
export class CertificateRegisterPageComponent {
  loading = signal(false);
  editingId = signal<string | null>(null);
  showDeleteModal = signal(false);
  certificateToDelete = signal<string | null>(null);
  showViewModal = signal(false);
  certificateToView = signal<Certificate | null>(null);
  
  certificates = signal<Certificate[]>([
    {
      id: '1',
      title: 'Mestrado em Ortodontia Estética',
      institution: 'Universidade de Coimbra',
      year: 2023,
      image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop',
      status: 'valid',
      conclusionDate: '2023-12-15',
      validityDate: '2028-12-15',
    },
  ]);

  formData = {
    certificateName: '',
    institution: '',
    conclusionDate: '',
    validityDate: '',
    file: null as File | null,
    fileName: '',
  };

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      this.formData.file = file;
      this.formData.fileName = file.name;
    }
  }

  onFileDropped(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file && file.size <= 10 * 1024 * 1024 && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
      this.formData.file = file;
      this.formData.fileName = file.name;
    }
  }

  onSubmit(): void {
    if (!this.formData.certificateName || !this.formData.institution || !this.formData.conclusionDate || !this.formData.validityDate) return;

    this.loading.set(true);
    
    setTimeout(() => {
      if (this.editingId()) {
        // Atualizar certificado existente
        this.certificates.update((certs) =>
          certs.map((cert) =>
            cert.id === this.editingId()
              ? {
                  ...cert,
                  title: this.formData.certificateName,
                  institution: this.formData.institution,
                  year: new Date(this.formData.conclusionDate).getFullYear(),
                  conclusionDate: this.formData.conclusionDate,
                  validityDate: this.formData.validityDate,
                  status: new Date(this.formData.validityDate) > new Date() ? 'valid' : 'expired',
                }
              : cert,
          ),
        );
        this.editingId.set(null);
      } else {
        // Adicionar novo certificado
        const newCert: Certificate = {
          id: Date.now().toString(),
          title: this.formData.certificateName,
          institution: this.formData.institution,
          year: new Date(this.formData.conclusionDate).getFullYear(),
          image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop',
          status: new Date(this.formData.validityDate) > new Date() ? 'valid' : 'expired',
          conclusionDate: this.formData.conclusionDate,
          validityDate: this.formData.validityDate,
        };
        this.certificates.update((certs) => [newCert, ...certs]);
      }

      this.resetForm();
      this.loading.set(false);
    }, 1000);
  }

  editCertificate(id: string): void {
    const cert = this.certificates().find((c) => c.id === id);
    if (cert) {
      this.formData = {
        certificateName: cert.title,
        institution: cert.institution,
        conclusionDate: cert.conclusionDate,
        validityDate: cert.validityDate,
        file: null,
        fileName: cert.title,
      };
      this.editingId.set(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.resetForm();
  }

  viewCertificate(id: string): void {
    const cert = this.certificates().find((c) => c.id === id);
    if (cert) {
      this.certificateToView.set(cert);
      this.showViewModal.set(true);
    }
  }

  closeViewModal(): void {
    this.showViewModal.set(false);
    this.certificateToView.set(null);
  }

  downloadCertificate(id: string): void {
    const cert = this.certificates().find((c) => c.id === id);
    if (cert) {
      // Simular download criando um link temporário
      const link = document.createElement('a');
      link.href = cert.image;
      link.download = `${cert.title.replace(/\s+/g, '_')}_${cert.year}.jpg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  }

  openDeleteModal(id: string): void {
    this.certificateToDelete.set(id);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.certificateToDelete.set(null);
  }

  confirmDelete(): void {
    const id = this.certificateToDelete();
    if (id) {
      this.certificates.update((certs) => certs.filter((c) => c.id !== id));
      this.closeDeleteModal();
    }
  }

  private resetForm(): void {
    this.formData = {
      certificateName: '',
      institution: '',
      conclusionDate: '',
      validityDate: '',
      file: null,
      fileName: '',
    };
  }
}
