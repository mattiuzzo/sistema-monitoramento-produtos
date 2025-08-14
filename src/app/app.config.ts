// src/app/app.config.ts

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { AuthInterceptor } from './interceptors/auth.interceptor'; // Importa o interceptor funcional

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // Fornece o HttpClient com o interceptor funcional
    provideHttpClient(withInterceptors([AuthInterceptor])),
    // Os serviços AuthService, ProductService, MonitorService
    // não precisam ser fornecidos aqui porque usam `providedIn: 'root'`.
  ]
};