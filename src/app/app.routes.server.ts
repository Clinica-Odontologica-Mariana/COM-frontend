import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'home',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'patients/:id/treatments',
    renderMode: RenderMode.Client,
  },
  {
    path: 'patients/:id/edit',
    renderMode: RenderMode.Client,
  },
  {
    path: 'medical-records/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
