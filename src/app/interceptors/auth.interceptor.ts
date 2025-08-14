// src/app/interceptors/auth.interceptor.ts

import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core'; // Importe `inject` para injetar serviços em interceptors funcionais
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService); // Injeta o AuthService

  const accessToken = authService.getAccessToken();

  // Helper para adicionar o token à requisição
  const addToken = (request: HttpRequest<unknown>, token: string): HttpRequest<unknown> => {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  };

  // Helper para lidar com erros 401 (Não Autorizado)
  const handle401Error = (request: HttpRequest<unknown>, handler: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    return authService.authenticate().pipe(
      switchMap(newAccessToken => {
        console.log('Re-autenticação bem-sucedida. Re-tentando a requisição original.');
        // Re-tenta a requisição original com o novo token
        return handler(addToken(request, newAccessToken));
      }),
      catchError(authError => {
        console.error('Re-autenticação falhou:', authError);
        authService.logout(); // Faz logout se a re-autenticação falhar
        // Você pode adicionar um redirecionamento para a tela de login aqui, se houver
        return throwError(() => new Error('Sessão expirada. Por favor, faça login novamente.'));
      })
    );
  };

  // Adiciona o token se ele existir e a requisição não for para o endpoint de autenticação
  let clonedReq = req;
  if (accessToken && !req.url.includes('/oauth2/v1/token')) {
    clonedReq = addToken(req, accessToken);
  }

  // Passa a requisição (clonada ou não) para o próximo handler e intercepta erros
  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Se for um erro 401 e não for a própria requisição de login que falhou
      if (error.status === 401 && !req.url.includes('/oauth2/v1/token')) {
        console.warn('Token expirado ou inválido. Tentando re-autenticar...');
        return handle401Error(req, next); // Usa o helper para tentar re-autenticar
      }
      return throwError(() => error); // Re-lança outros erros
    })
  );
};