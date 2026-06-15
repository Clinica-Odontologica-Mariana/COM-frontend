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
        if (!isLoginRequest) {
          toastService.error(message);
        }
        return throwError(() => new Error(message));
      }

      return throwError(() => error);
    }),
  );
};

function resolveErrorMessage(error: HttpErrorResponse): string {
  const backendMessage = readBackendErrorMessage(error.error);

  if (backendMessage) {
    return backendMessage;
  }

  if (error.status === 403) {
    return 'Você não tem permissão para essa ação.';
  }

  if (error.status >= 500) {
    return 'Não foi possível processar a solicitação. Tente novamente mais tarde.';
  }

  if (isApiErrorResponse(error.error)) {
    if (error.error.error?.code === 'KEYCLOAK_AUTH_FAILED') {
      return 'Usuário ou senha inválidos.';
    }

    const backendMessage = error.error.error?.message ?? error.error.message;
    if (backendMessage && backendMessage !== 'Unexpected error') {
      return backendMessage;
    }
  }

  return 'Ocorreu um erro inesperado.';
}

function readBackendErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object' || !('error' in payload)) {
    return null;
  }

  const apiError = (payload as { error?: unknown }).error;

  if (!apiError || typeof apiError !== 'object' || !('message' in apiError)) {
    return null;
  }

  const message = (apiError as { message?: unknown }).message;

  return typeof message === 'string' && message.trim() ? message : null;
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
