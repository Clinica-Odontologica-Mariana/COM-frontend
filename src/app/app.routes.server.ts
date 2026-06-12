import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'attendance',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'home',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'admin-access',
    renderMode: RenderMode.Client,
  },
  {
    path: 'clinics',
    renderMode: RenderMode.Client,
  },
  {
    path: 'clinics/new',
    renderMode: RenderMode.Client,
  },
  {
    path: 'clinics/:id/edit',
    renderMode: RenderMode.Client,
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