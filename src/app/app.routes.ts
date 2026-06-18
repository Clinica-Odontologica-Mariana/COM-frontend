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
      import('./features/locations/locations-page.component').then((m) => m.LocationsPageComponent),
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
    path: 'profissionais',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/professionals/pages/professionals-page/professionals-page.component').then(
        (m) => m.ProfessionalsPageComponent,
      ),
  },
  {
    path: 'employees',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/collaborators/pages/collaborators-page/collaborators-page.component').then(
        (m) => m.CollaboratorsPageComponent,
      ),
  },
  {
    path: 'meu-perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/pages/my-profile-page/profile-page.component').then(
        (m) => m.MyProfilePageComponent,
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
    path: 'pacientes',
    loadComponent: () =>
      import('./features/patients/pages/patient-list-page/patient-list-page.component').then(
        (m) => m.PatientListPageComponent,
      ),
  },
  {
    path: 'pacientes/new',
    loadComponent: () =>
      import('./features/patients/pages/patient-form-page/patient-form-page.component').then(
        (m) => m.PatientFormPageComponent,
      ),
  },
  {
    path: 'pacientes/:id/editar',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/patients/pages/edit-patient/edit-patient.component').then(
        (m) => m.EditPatientComponent,
      ),
  },
  {
    path: 'treatments',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/treatments/pages/treatments-list-page/treatments-list-page.component').then(
        (m) => m.TreatmentsListPageComponent,
      ),
  },
  {
    path: 'treatments/:id/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/treatments/pages/create-procedure-page/create-procedure-page.component').then(
        (m) => m.CreateProcedurePageComponent,
      ),
  },
  {
    path: 'treatments/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/treatments/pages/edit-procedure-page/edit-procedure-page.component').then(
        (m) => m.EditProcedurePageComponent,
      ),
  },
  {
    path: 'treatments/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/treatments/pages/management-page/management-page.component').then(
        (m) => m.TreatmentManagementPageComponent,
      ),
  },
  {
    path: 'pacientes/:id/tratamentos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/patients/pages/treatments/treatments-page.component').then(
        (m) => m.TreatmentsPageComponent,
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
    path: 'medical-records/:id/receita',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/prescriptions/pages/prescription-form/prescription-form.component').then(
        (m) => m.PrescriptionFormComponent,
      ),
  },
  {
    path: 'medical-records/:id/atestado',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/prescriptions/pages/atestado-form/atestado-form.component').then(
        (m) => m.AtestadoFormComponent,
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
    path: 'certificados',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/certificates/pages/certificate-register/certificate-register.component').then(
        (m) => m.CertificateRegisterPageComponent,
      ),
  },
  {
    path: 'panel',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/panel/pages/panel-page/panel-page.component').then(
        (m) => m.PanelPageComponent,
      ),
  },
  {
    path: 'panel/history',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/panel/pages/panel-history-page/panel-history-page.component').then(
        (m) => m.HistoryPageComponent,
      ),
  },
  {
    path: 'schedule',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/appointment/pages/appointment-main-page.component').then(
        (m) => m.AppointmentMainPageComponent,
      ),
  },
  {
    path: 'schedule/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/appointment/pages/appointment-create-page.component').then(
        (m) => m.AppointmentCreatePageComponent,
      ),
  },
  {
    path: 'schedule/appointments',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/appointment/pages/appointments-list-page.component').then(
        (m) => m.AppointmentsListPageComponent,
      ),
  },
  {
    path: 'schedule/:id/edit',
    canActivate: [authGuard],
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
