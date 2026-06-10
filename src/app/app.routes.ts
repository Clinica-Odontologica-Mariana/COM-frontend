import { Routes } from '@angular/router';

// Pacientes de teste (seed via database)
// Beatriz Oliveira Cavalcanti: c14671c5-976a-4d1e-9567-8a417f778b59
// Carlos Eduardo Mendes:       a3f7c291-5e4b-4d82-b913-0f2c8e7a1d56
const DEFAULT_PATIENT_ID = 'a3f7c291-5e4b-4d82-b913-0f2c8e7a1d56';

export const routes: Routes = [
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
      import(
        './features/medical-records/pages/patient-record-page/patient-record-page.component'
      ).then((m) => m.PatientRecordPageComponent),
  },
  {
    path: 'inventories/new',
    loadComponent: () =>
      import(
        './features/inventories/pages/inventory-item-form-page/inventory-item-form-page.component'
      ).then((m) => m.InventoryItemFormPageComponent),
  },
  {
    path: 'inventories/:id/edit',
    loadComponent: () =>
      import(
        './features/inventories/pages/inventory-item-form-page/inventory-item-form-page.component'
      ).then((m) => m.InventoryItemFormPageComponent),
  },
  {
    path: 'inventories',
    loadComponent: () =>
      import('./features/inventories/pages/inventory-page/inventory-page.component').then(
        (m) => m.InventoryPageComponent,
      ),
  },
  {
    path: 'medical-records',
    pathMatch: 'full',
    redirectTo: `medical-records/${DEFAULT_PATIENT_ID}`,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'inventories',
  },
];
