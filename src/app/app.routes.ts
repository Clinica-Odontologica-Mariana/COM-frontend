import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

// Pacientes de teste (seed via database)
// Beatriz Oliveira Cavalcanti: c14671c5-976a-4d1e-9567-8a417f778b59
// Carlos Eduardo Mendes:       a3f7c291-5e4b-4d82-b913-0f2c8e7a1d56
const DEFAULT_PATIENT_ID = 'a3f7c291-5e4b-4d82-b913-0f2c8e7a1d56';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent,
  },
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'unidades',
    loadComponent: () =>
      import('./features/public/pages/locations/locations-page.component').then(
        (m) => m.LocationsPageComponent,
      ),
    data: { layout: 'public' },
  },
  {
    path: 'admin-access',
    loadComponent: () =>
      import('./features/admin-access/pages/admin-access-page/admin-access-page.component').then(
        (m) => m.AdminAccessPageComponent,
      ),
  },
  {
    path: 'clinics/new',
    loadComponent: () =>
      import('./features/clinics/pages/clinic-form-page/clinic-form-page.component').then(
        (m) => m.ClinicFormPageComponent,
      ),
  },
  {
    path: 'clinics/:id/edit',
    loadComponent: () =>
      import('./features/clinics/pages/clinic-form-page/clinic-form-page.component').then(
        (m) => m.ClinicFormPageComponent,
      ),
  },
  {
    path: 'clinics',
    loadComponent: () =>
      import('./features/clinics/pages/clinics-page/clinics-page.component').then(
        (m) => m.ClinicsPageComponent,
      ),
  },
  {
    path: 'patients/:id/treatments',
    loadComponent: () =>
      import('./features/patients/pages/treatments/treatments-page.component').then(
        (m) => m.TreatmentsPageComponent,
      ),
  },
  {
    path: 'patients/:id/edit',
    loadComponent: () =>
      import('./features/patients/pages/edit-patient/edit-patient.component').then(
        (m) => m.EditPatientComponent,
      ),
  },
  {
    path: 'medical-records/:id',
    loadComponent: () =>
      import('./features/medical-records/pages/patient-record-page/patient-record-page.component').then(
        (m) => m.PatientRecordPageComponent,
      ),
  },
  {
    path: 'medical-records',
    pathMatch: 'full',
    redirectTo: `medical-records/${DEFAULT_PATIENT_ID}`,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
