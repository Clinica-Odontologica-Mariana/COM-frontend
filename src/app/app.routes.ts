import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'atendimento',
    loadComponent: () =>
      import('./features/attendance/pages/attendance-page/attendance-page.components').then(
        (m) => m.AttendancePageComponent,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'atendimento',
  },
];
