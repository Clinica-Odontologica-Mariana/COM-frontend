import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'certificados',
    loadComponent: () =>
      import('./features/certificates/pages/certificate-register/certificate-register.component').then(
        (m) => m.CertificateRegisterPageComponent,
      ),
  },
  // Temporarily removed route for 'medical-records/:id' because the component
  // file is missing in this workspace. Restore when `patient-record-page.component` exists.

  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'certificados',
  },
];
