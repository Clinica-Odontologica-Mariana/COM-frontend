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
