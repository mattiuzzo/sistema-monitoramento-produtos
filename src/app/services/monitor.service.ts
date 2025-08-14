// src/app/services/monitor.service.ts

// Adicione forkJoin e throwError aqui
import { BehaviorSubject, interval, Observable, Subject, timer, forkJoin, throwError } from 'rxjs';
// Adicione finalize aqui
import { switchMap, startWith, tap, catchError, map, finalize } from 'rxjs/operators';
import { ProductService } from './product.service';
import { AuthService } from './auth.service';
import { BlockedProduct, ReleasedProduct } from '../models/product.model';
import { Injectable } from '@angular/core';

// Definimos tipos para o status de conexão para melhor tipagem
// Adicione 'Carregando...'
export type ConnectionStatus = 'Conectando...' | 'Conectado' | 'Online' | 'Erro de conexão' | 'Erro' | 'Carregando...';

@Injectable({
  providedIn: 'root'
})
export class MonitorService {
  private readonly REFRESH_INTERVAL_MS = 600000; // 10 minutos

  private currentTimerSubject = new BehaviorSubject<number>(600);
  public currentTimer$ = this.currentTimerSubject.asObservable();

  private connectionStatusSubject = new BehaviorSubject<ConnectionStatus>('Conectando...');
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  private lastUpdateSubject = new BehaviorSubject<string>('--:--:--');
  public lastUpdate$ = this.lastUpdateSubject.asObservable();

  private blockedProductsSubject = new BehaviorSubject<BlockedProduct[]>([]);
  public blockedProducts$ = this.blockedProductsSubject.asObservable();

  private releasedProductsSubject = new BehaviorSubject<ReleasedProduct[]>([]);
  public releasedProducts$ = this.releasedProductsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new Subject<string>();
  public error$ = this.errorSubject.asObservable();

  constructor(
    private productService: ProductService,
    private authService: AuthService
  ) {
    this.initMonitor();
  }

  private initMonitor(): void {
    this.startTimer();

    this.authService.authenticate().pipe(
      tap(() => {
        this.connectionStatusSubject.next('Conectado');
        console.log('Autenticação inicial bem-sucedida.');
      }),
      catchError(err => {
        this.connectionStatusSubject.next('Erro de conexão');
        this.errorSubject.next('Falha na autenticação inicial. Verifique as credenciais e tente novamente.');
        return throwError(() => err); // Use throwError aqui
      })
    ).subscribe({
      next: () => this.startAutoRefresh(),
      error: () => console.error("Falha na autenticação inicial, auto-refresh não iniciado.")
    });
  }

  startAutoRefresh(): void {
    interval(this.REFRESH_INTERVAL_MS).pipe(
      startWith(0),
      switchMap(() => this.loadDataInternal())
    ).subscribe({
      next: () => {
        this.currentTimerSubject.next(600);
        this.updateLastUpdate();
        this.connectionStatusSubject.next('Online');
        console.log('Dados atualizados com sucesso.');
      },
      error: err => {
        console.error('Erro durante o auto-refresh:', err);
        this.connectionStatusSubject.next('Erro');
        this.errorSubject.next('Erro ao carregar dados. Tentando reconectar automaticamente...');
        timer(5000).subscribe(() => {
          this.authService.authenticate().subscribe({
            next: () => this.loadDataInternal().subscribe(),
            error: () => console.warn('Re-autenticação falhou após erro de carregamento de dados.')
          });
        });
      }
    });
  }

  loadData(): void {
    this.loadDataInternal().subscribe();
  }

  private loadDataInternal(): Observable<[BlockedProduct[], ReleasedProduct[]]> {
    this.connectionStatusSubject.next('Carregando...'); // Este 'Carregando...' agora é válido
    this.loadingSubject.next(true);

    // Use forkJoin para executar ambas as chamadas em paralelo
    return forkJoin([
      this.productService.getBlockedProducts(),
      this.productService.getReleasedProducts().pipe(
        map(released => released.slice(0, 10)) // Aplica o slice nos 10 primeiros antes de combinar
      )
    ]).pipe(
      tap(([blocked, released]) => {
        // Atualiza os BehaviorSubjects com os dados recebidos
        this.blockedProductsSubject.next(blocked);
        this.releasedProductsSubject.next(released);
      }),
      // Garante que o loading seja desativado, mesmo em caso de erro
      finalize(() => this.loadingSubject.next(false)),
      catchError(err => {
        console.error('Erro ao carregar dados internos:', err);
        this.errorSubject.next(`Erro ao carregar dados: ${err.message || 'Erro desconhecido'}`);
        return throwError(() => err); // Use throwError aqui
      })
    );
  }

  private startTimer(): void {
    interval(1000).subscribe(() => {
      let current = this.currentTimerSubject.value;
      current--;
      if (current < 0) {
        current = 120;
      }
      this.currentTimerSubject.next(current);
    });
  }

  private updateLastUpdate(): void {
    const now = new Date();
    this.lastUpdateSubject.next(now.toLocaleTimeString('pt-BR'));
  }
}