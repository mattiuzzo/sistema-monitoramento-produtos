// src/app/components/stats-cards/stats-cards.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
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
  releasedTodayCount$: Observable<number>; // Novo totalizador
  refreshTimer$: Observable<number>;
  refreshLoading$: Observable<boolean>; // Controla a animação do ícone de refresh

  constructor(private monitorService: MonitorService) {
    // Busca os dados do MonitorService e os mapeia para a contagem
    this.blockedCount$ = this.monitorService.blockedProducts$.pipe(map(products => products.length));
    this.releasedCount$ = this.monitorService.releasedProducts$.pipe(map(products => products.length));
    this.releasedTodayCount$ = this.monitorService.releasedProducts$.pipe(
      map(products => products.filter(p => this.isToday(p.dataLib)).length)
    );
    this.refreshTimer$ = this.monitorService.currentTimer$;
    this.refreshLoading$ = this.monitorService.loading$;
  }

  ngOnInit(): void { }

  private isToday(dateString: string): boolean {
    if (!dateString || dateString.length !== 8) return false;
    const year = Number(dateString.substring(0, 4));
    const month = Number(dateString.substring(4, 6)) - 1; // Mês começa em 0 no JS
    const day = Number(dateString.substring(6, 8));
    const date = new Date(year, month, day);

    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
  }

  private isToday2(dateString: string): boolean {
    const today = new Date();
    const date = new Date(dateString);
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }
}