import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);
  const isLoginRequest = request.url.includes('/auth/login');

  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401 && !isLoginRequest) {
          authService.logout();
          void router.navigateByUrl('/admin-access');
        }

        const message = resolveErrorMessage(error);
        toastService.error(message);
        return throwError(() => new Error(message));
      }

      return throwError(() => error);
    }),
  );
};

function resolveErrorMessage(error: HttpErrorResponse): string {
  if (error.status === 403) {
    return 'Você não tem permissão para essa ação';
  }

  if (isApiErrorResponse(error.error)) {
    if (error.error.error?.code === 'KEYCLOAK_AUTH_FAILED') {
      return 'Usuário ou senha inválidos.';
    }

    return error.error.error?.message ?? error.error.message ?? 'Ocorreu um erro inesperado.';
  }

  if (error.status === 401) {
    return 'Sessão expirada. Faça login novamente.';
  }

  if (error.status >= 500) {
    return 'Não foi possível processar a solicitação agora.';
  }

  return error.message || 'Ocorreu um erro inesperado.';
}

function isApiErrorResponse(value: unknown): value is {
  message?: string;
  error?: {
    code?: string;
    message?: string;
  };
} {
  return typeof value === 'object' && value !== null;
}
