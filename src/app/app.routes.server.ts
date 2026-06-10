import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'tratamentos/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'tratamentos/:id/novo',
    renderMode: RenderMode.Client,
  },
  {
    path: 'tratamentos/:id/editar',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
