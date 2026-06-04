import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'pacientes',
    loadComponent: () =>
      import('./features/patients/pages/patient-list-page/patient-list-page.component').then(
        (m) => m.PatientListPageComponent,
      ),
  },
  {
    path: 'pacientes/novo',
    loadComponent: () =>
      import('./features/patients/pages/patient-form-page/patient-form-page.component').then(
        (m) => m.PatientFormPageComponent,
      ),
  },
  {
    path: 'pacientes/:id/editar',
    loadComponent: () =>
      import('./features/patients/pages/patient-form-page/patient-form-page.component').then(
        (m) => m.PatientFormPageComponent,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'pacientes',
  },
];
