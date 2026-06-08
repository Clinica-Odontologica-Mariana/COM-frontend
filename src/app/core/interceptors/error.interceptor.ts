import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const message = resolveErrorMessage(error);
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

  if (error.status === 401) {
    return 'Sessão expirada. Faça login novamente.';
  }

  if (error.status === 403) {
    return 'Você não tem permissão para acessar este recurso.';
  }

  if (error.status >= 500) {
    return 'Não foi possível processar a solicitação agora.';
  }

  return error.message || 'Ocorreu um erro inesperado.';
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
