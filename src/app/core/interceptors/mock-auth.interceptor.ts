import { HttpInterceptorFn, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

const MOCK_USER = {
  subject: '1',
  username: 'admin',
  email: 'admin@clinica.com',
  roles: ['admin'],
  claims: {},
};

const MOCK_TOKEN = 'dev-token-abcdef';

export const mockAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const isBrowser = typeof window !== 'undefined';
  const isLocal = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (!isLocal) return next(req);

  // Mock login
  if (req.method === 'POST' && req.url.endsWith('/auth/login')) {
    const body = req.body as any;
    const username = (body?.username ?? '').toString();
    const password = (body?.password ?? '').toString();

    if ((username === 'admin' || username === 'admin@clinica.com') && password === 'clinica') {
      const payload = {
        access_token: MOCK_TOKEN,
        refresh_token: 'dev-refresh-token',
        expires_in: 60 * 60,
      };
      const res = new HttpResponse({ status: HttpStatusCode.Ok, body: payload });
      return of(res).pipe(delay(250));
    }

    const err = new HttpResponse({ status: HttpStatusCode.Unauthorized, body: { message: 'Credenciais inválidas (mock).' } });
    return of(err).pipe(delay(250));
  }

  // Mock current user
  if (req.method === 'GET' && req.url.endsWith('/auth/me')) {
    const authHeader = req.headers.get('Authorization') ?? '';
    if (authHeader.includes(MOCK_TOKEN)) {
      const body = { success: true, data: MOCK_USER };
      const res = new HttpResponse({ status: HttpStatusCode.Ok, body });
      return of(res).pipe(delay(150));
    }

    const err = new HttpResponse({ status: HttpStatusCode.Unauthorized, body: { message: 'Não autenticado (mock).' } });
    return of(err).pipe(delay(150));
  }

  return next(req);
};
