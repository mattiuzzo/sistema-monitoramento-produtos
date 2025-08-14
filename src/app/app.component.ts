// src/app/app.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { StatsCardsComponent } from './components/stats-cards/stats-cards.component';
import { ProductsTableComponent } from './components/products-table/products-table.component';
import { ErrorModalComponent } from './components/error-modal/error-modal.component';
import { MonitorService } from './services/monitor.service';
import { BlockedProduct, ReleasedProduct } from './models/product.model';
import { Subscription } from 'rxjs'; // Importar Subscription

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HeaderComponent, StatsCardsComponent, ProductsTableComponent, ErrorModalComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  blockedProducts: BlockedProduct[] = [];
  releasedProducts: ReleasedProduct[] = [];
  loading: boolean = false;
  errorMessage: string | null = null;
  showErrorModal: boolean = false;
  private subscriptions = new Subscription(); // Para gerenciar as subscriptions

  constructor(public monitorService: MonitorService) {}

  ngOnInit(): void {
    // Subscreve-se aos observables do MonitorService para atualizar a UI
    this.subscriptions.add(
      this.monitorService.blockedProducts$.subscribe(data => {
        this.blockedProducts = data;
      })
    );
    this.subscriptions.add(
      this.monitorService.releasedProducts$.subscribe(data => {
        this.releasedProducts = data;
      })
    );
    this.subscriptions.add(
      this.monitorService.loading$.subscribe(isLoading => {
        this.loading = isLoading;
      })
    );
    this.subscriptions.add(
      this.monitorService.error$.subscribe(errorMsg => {
        this.errorMessage = errorMsg;
        this.showErrorModal = true;
        // Auto-fecha o modal de erro após 5 segundos, como no JS original
        setTimeout(() => this.closeErrorModal(), 5000);
      })
    );
  }

  // Método para acionar a atualização manual de dados
  onRefresh(): void {
    this.monitorService.loadData();
  }

  // Método para fechar o modal de erro
  closeErrorModal(): void {
    this.showErrorModal = false;
    this.errorMessage = null;
  }

  // Importante para evitar vazamento de memória com Observables
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}