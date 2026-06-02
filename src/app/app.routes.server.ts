import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'certificados',
    renderMode: RenderMode.Client,
  },
  // Removed 'medical-records/:id' server route because the corresponding
  // client route is not present in the current routing configuration.
  // Restore when the client route is added back to `app.routes.ts`.
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
