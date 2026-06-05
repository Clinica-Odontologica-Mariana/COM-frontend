import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'inventories',
    loadComponent: () =>
      import('./features/inventories/pages/inventory-page/inventory-page.component').then(
        (m) => m.InventoryPageComponent,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'inventories',
  },
];
