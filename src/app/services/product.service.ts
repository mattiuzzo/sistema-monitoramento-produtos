// src/app/services/product.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs'; // Certifique-se de que throwError está aqui
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { BlockedProduct, ReleasedProduct } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Headers específicos que não dependem do token de autenticação
  private getBaseHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'TenantId': '05,01' // Mantido como no script original
    });
  }

  getBlockedProducts(): Observable<BlockedProduct[]> {
    return this.http.get<BlockedProduct[]>(`${this.baseUrl}/hblibprod/produtos`, { headers: this.getBaseHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getReleasedProducts(): Observable<ReleasedProduct[]> {
    // A API original retornava todos e era fatiada para os 10 primeiros.
    // Vamos fazer o fatiamento aqui para manter a consistência, se a API não o fizer por si só.
    return this.http.get<ReleasedProduct[]>(`${this.baseUrl}/hblibprod/liberados`, { headers: this.getBaseHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Um erro ocorreu na requisição:', error);
    // Aqui você pode adicionar lógica para tratar diferentes tipos de erros
    // Por exemplo, relançar um erro específico para o componente.
    return throwError(() => new Error(`Erro de comunicação com a API: ${error.message || error.statusText}`));
  }
}