import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'inventories/new',
    renderMode: RenderMode.Client,
  },
  {
    path: 'inventories/:id/edit',
    renderMode: RenderMode.Client,
  },
  {
    path: 'inventories',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
