import { Routes } from '@angular/router';

export const routes: Routes = [
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
    path: '',
    pathMatch: 'full',
    redirectTo: 'agenda',
  },
];
