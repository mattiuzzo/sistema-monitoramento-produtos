// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, throwError } from 'rxjs'; // Certifique-se de que throwError está aqui
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root' // Disponível em toda a aplicação
})
export class AuthService {
  // BehaviorSubject para notificar sobre o status do token (útil para interceptors ou componentes)
  private accessTokenSubject = new BehaviorSubject<string | null>(null);
  public accessToken$ = this.accessTokenSubject.asObservable(); // Observable público

  private authUrl = `${environment.apiBaseUrl}/api/oauth2/v1/token?grant_type=password`;

  constructor(private http: HttpClient) {
    this.loadToken(); // Tenta carregar o token ao inicializar o serviço
  }

  // Carrega o token do localStorage
  private loadToken(): void {
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.accessTokenSubject.next(token);
    }
  }

  // Realiza a autenticação
  authenticate(): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'username': 'admin', // Suas credenciais, idealmente deveriam vir de um formulário de login
      'password': '2023CPSPTH' // Suas credenciais
    });

    return this.http.post<any>(this.authUrl, {}, { headers }).pipe(
      tap(response => {
        const token = response.access_token;
        localStorage.setItem('accessToken', token); // Armazena o token
        this.accessTokenSubject.next(token); // Notifica os subscribers
        console.log('Autenticação bem-sucedida. Token:', token);
      }),
      catchError(error => {
        console.error('Erro na autenticação:', error);
        this.accessTokenSubject.next(null); // Limpa o token em caso de erro
        localStorage.removeItem('accessToken');
        return throwError(() => new Error('Falha na autenticação. Verifique as credenciais e tente novamente.'));
      })
    );
  }

  // Retorna o token de acesso atual
  getAccessToken(): string | null {
    return this.accessTokenSubject.value;
  }

  // Realiza o logout
  logout(): void {
    localStorage.removeItem('accessToken');
    this.accessTokenSubject.next(null);
    console.log('Sessão encerrada.');
  }
}