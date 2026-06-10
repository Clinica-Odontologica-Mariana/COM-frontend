import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tratamentos/:id/novo',
    loadComponent: () =>
      import('./features/tratamentos/pages/cadastro-procedimento-page/cadastro-procedimento-page.component').then(
        (m) => m.CadastroProcedimentoPageComponent,
      ),
  },
  {
    path: 'tratamentos/:id/editar',
    loadComponent: () =>
      import('./features/tratamentos/pages/edicao-procedimento-page/edicao-procedimento-page.component').then(
        (m) => m.EdicaoProcedimentoPageComponent,
      ),
  },
  {
    path: 'tratamentos/:id',
    loadComponent: () =>
      import('./features/tratamentos/pages/gestao-page/gestao-page.component').then(
        (m) => m.GestaoPageComponent,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'tratamentos/1',
  },
];
