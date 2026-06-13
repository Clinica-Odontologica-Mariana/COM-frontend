import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { HomeComponent } from './features/home/pages/home.component';

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
    path: 'locations',
    loadComponent: () =>
      import('./features/public/pages/locations/locations-page.component').then(
        (m) => m.LocationsPageComponent,
      ),
    data: { layout: 'public' },
  },
  {
    path: 'attendance',
    loadComponent: () =>
      import('./features/attendance/pages/attendance-page/attendance-page.components').then(
        (m) => m.AttendancePageComponent,
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
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/clinics/pages/clinic-form-page/clinic-form-page.component').then(
        (m) => m.ClinicFormPageComponent,
      ),
  },
  {
    path: 'clinics/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/clinics/pages/clinic-form-page/clinic-form-page.component').then(
        (m) => m.ClinicFormPageComponent,
      ),
  },
  {
    path: 'clinics',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/clinics/pages/clinics-page/clinics-page.component').then(
        (m) => m.ClinicsPageComponent,
      ),
  },
  {
    path: 'patients/:id/treatments',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/patients/pages/treatments/treatments-page.component').then(
        (m) => m.TreatmentsPageComponent,
      ),
  },
  {
    path: 'patients/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/patients/pages/edit-patient/edit-patient.component').then(
        (m) => m.EditPatientComponent,
      ),
  },
  {
    path: 'medical-records/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/medical-records/pages/patient-record-page/patient-record-page.component').then(
        (m) => m.PatientRecordPageComponent,
      ),
  },
  {
    path: 'agenda',
    loadComponent: () =>
      import('./features/appointment/pages/appointment-main-page/appointment-main-page.component').then(
        (m) => m.AppointmentMainPageComponent,
      ),
  },
  {
    path: 'agenda/novo',
    loadComponent: () =>
      import('./features/appointment/pages/appointment-create-page/appointment-create-page.component').then(
        (m) => m.AppointmentCreatePageComponent,
      ),
  },
  {
    path: 'agenda/agendamentos',
    loadComponent: () =>
      import('./features/appointment/pages/appointments-list-page/appointments-list-page.component').then(
        (m) => m.AppointmentsListPageComponent,
      ),
  },
  {
    path: 'agenda/:id/editar',
    loadComponent: () =>
      import('./features/appointment/pages/appointment-edit-page/appointment-edit-page.component').then(
        (m) => m.AppointmentEditPageComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
