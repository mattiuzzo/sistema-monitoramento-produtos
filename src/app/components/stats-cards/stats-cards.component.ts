// src/app/components/stats-cards/stats-cards.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitorService } from '../../services/monitor.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-cards.component.html',
  styleUrls: ['./stats-cards.component.scss']
})
export class StatsCardsComponent implements OnInit {
  blockedCount$: Observable<number>;
  releasedCount$: Observable<number>;
  refreshTimer$: Observable<number>;
  refreshLoading$: Observable<boolean>; // Controla a animação do ícone de refresh

  constructor(private monitorService: MonitorService) {
    // Busca os dados do MonitorService e os mapeia para a contagem
    this.blockedCount$ = this.monitorService.blockedProducts$.pipe(map(products => products.length));
    this.releasedCount$ = this.monitorService.releasedProducts$.pipe(map(products => products.length));
    this.refreshTimer$ = this.monitorService.currentTimer$;
    this.refreshLoading$ = this.monitorService.loading$;
  }

  ngOnInit(): void {}
}