import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'inventories/new',
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
    path: '',
    pathMatch: 'full',
    redirectTo: 'inventories',
  },
];
