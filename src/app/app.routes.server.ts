import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'attendance',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'home',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'locations',
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
    path: 'patients/**',
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
    path: 'medical-records',
    renderMode: RenderMode.Client,
  },
  {
    path: 'medical-records/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'treatments/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'treatments/:id/new',
    renderMode: RenderMode.Client,
  },
  {
    path: 'treatments/:id/edit',
    renderMode: RenderMode.Client,
  },
  {
    path: 'schedule',
    renderMode: RenderMode.Client,
  },
  {
    path: 'schedule/new',
    renderMode: RenderMode.Client,
  },
  {
    path: 'schedule/appointments',
    renderMode: RenderMode.Client,
  },
  {
    path: 'schedule/:id/edit',
    renderMode: RenderMode.Client,
  },
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
