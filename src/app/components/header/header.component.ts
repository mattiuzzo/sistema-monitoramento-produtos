// src/app/components/header/header.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitorService, ConnectionStatus } from '../../services/monitor.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  connectionStatusText$: Observable<ConnectionStatus>;
  connectionStatusClass$: Observable<string>;
  lastUpdate$: Observable<string>;

  constructor(private monitorService: MonitorService) {
    // Subscreve-se aos Observables do MonitorService
    this.connectionStatusText$ = this.monitorService.connectionStatus$;
    this.lastUpdate$ = this.monitorService.lastUpdate$;

    // Mapeia o status de conexão para as classes CSS correspondentes
    this.connectionStatusClass$ = this.monitorService.connectionStatus$.pipe(
      map(status => {
        switch (status) {
          case 'Conectado':
          case 'Online':
            return 'connected';
          case 'Carregando...':
          case 'Conectando...':
            return 'connecting';
          case 'Erro de conexão':
          case 'Erro':
            return 'error';
          default:
            return '';
        }
      })
    );
  }

  ngOnInit(): void {}
}