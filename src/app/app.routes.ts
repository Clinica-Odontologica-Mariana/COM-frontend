import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'medical-records/:id',
    loadComponent: () =>
      import('./features/medical-records/pages/patient-record-page/patient-record-page.component').then(
        (m) => m.PatientRecordPageComponent,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'medical-records/1',
  },
];
