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
    path: 'patients',
    loadComponent: () =>
      import('./features/patients/pages/patient-list-page/patient-list-page.component').then(
        (m) => m.PatientListPageComponent,
      ),
  },
  {
    path: 'patients/new',
    loadComponent: () =>
      import('./features/patients/pages/patient-form-page/patient-form-page.component').then(
        (m) => m.PatientFormPageComponent,
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
    path: 'patients/:id/treatments',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/medical-records/pages/patient-record-page/patient-record-page.component').then(
        (m) => m.PatientRecordPageComponent,
      ),
  },
  {
    path: 'treatments',
    loadComponent: () =>
      import('./features/treatments/pages/treatments-list-page/treatments-list-page.component').then(
        (m) => m.TreatmentsListPageComponent,
      ),
  },
  {
    path: 'treatments/:id/new',
    loadComponent: () =>
      import('./features/treatments/pages/create-procedure-page/create-procedure-page.component').then(
        (m) => m.CreateProcedurePageComponent,
      ),
  },
  {
    path: 'treatments/:id/edit',
    loadComponent: () =>
      import('./features/treatments/pages/edit-procedure-page/edit-procedure-page.component').then(
        (m) => m.EditProcedurePageComponent,
      ),
  },
  {
    path: 'treatments/:id',
    loadComponent: () =>
      import('./features/treatments/pages/management-page/management-page.component').then(
        (m) => m.TreatmentManagementPageComponent,
      ),
  },
  {
    path: 'medical-records',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/medical-records/pages/medical-records-list-page/medical-records-list-page.component').then(
        (m) => m.MedicalRecordsListPageComponent,
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
    path: 'schedule',
    loadComponent: () =>
      import('./features/appointment/pages/appointment-main-page.component').then(
        (m) => m.AppointmentMainPageComponent,
      ),
  },
  {
    path: 'schedule/new',
    loadComponent: () =>
      import('./features/appointment/pages/appointment-create-page.component').then(
        (m) => m.AppointmentCreatePageComponent,
      ),
  },
  {
    path: 'schedule/appointments',
    loadComponent: () =>
      import('./features/appointment/pages/appointments-list-page.component').then(
        (m) => m.AppointmentsListPageComponent,
      ),
  },
  {
    path: 'schedule/:id/edit',
    loadComponent: () =>
      import('./features/appointment/pages/appointment-edit-page.component').then(
        (m) => m.AppointmentEditPageComponent,
      ),
  },
  {
    path: 'inventories/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/inventories/pages/inventory-item-form-page/inventory-item-form-page.component').then(
        (m) => m.InventoryItemFormPageComponent,
      ),
  },
  {
    path: 'inventories/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/inventories/pages/inventory-item-form-page/inventory-item-form-page.component').then(
        (m) => m.InventoryItemFormPageComponent,
      ),
  },
  {
    path: 'inventories',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/inventories/pages/inventory-page/inventory-page.component').then(
        (m) => m.InventoryPageComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
