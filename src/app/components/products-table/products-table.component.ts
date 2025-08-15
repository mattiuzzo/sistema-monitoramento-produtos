// src/app/components/products-table/products-table.component.ts

import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockedProduct, ReleasedProduct } from '../../models/product.model';
import { DateFormatPipe } from '../../pipes/date-format.pipe'; // Importa o pipe

// Define um tipo união para os produtos e um tipo para o tipo da tabela
type Product = BlockedProduct | ReleasedProduct;
type TableType = 'blocked' | 'released';

@Component({
  selector: 'app-products-table',
  standalone: true,
  imports: [CommonModule, DateFormatPipe], // Importa CommonModule e o DateFormatPipe
  templateUrl: './products-table.component.html',
  styleUrls: ['./products-table.component.scss']
})
export class ProductsTableComponent implements OnChanges {
  @Input() title!: string; // Título da seção (Ex: "Produtos Bloqueados")
  @Input() products: Product[] = []; // Array de produtos a serem exibidos
  @Input() type!: TableType; // Tipo da tabela: 'blocked' ou 'released'
  @Input() loading: boolean = false; // Indica se os dados estão sendo carregados
  @Output() refresh = new EventEmitter<void>(); // Evento para acionar a atualização de dados

  // Propriedades para classes CSS dinâmicas
  sectionHeaderClass: string = '';
  sectionTitleIconClass: string = '';
  
  // detecta mudanças nas propriedades de entrada, especialmente 'type'
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['type']) {
      this.updateComponentBasedOnType();
    }
  }

  // Atualiza as classes CSS e ícones com base no tipo da tabela
  private updateComponentBasedOnType(): void {
    if (this.type === 'blocked') {
      this.sectionHeaderClass = 'blocked-header';
      this.sectionTitleIconClass = 'fas fa-exclamation-triangle';
    } else if (this.type === 'released') {
      this.sectionHeaderClass = 'released-header';
      this.sectionTitleIconClass = 'fas fa-check-circle';
    }
  }

  // Emite o evento de refresh quando o botão é clicado
  onRefreshClick(): void {
    this.refresh.emit();
  }

  // Type guards para diferenciar os tipos de produto no template
  isBlockedProduct(product: Product): product is BlockedProduct {
    return this.type === 'blocked';
  }

  isReleasedProduct(product: Product): product is ReleasedProduct {
    return this.type === 'released';
  }

  tpOrigem(product: Product): string {
    if (this.isBlockedProduct(product)) {
      return product.origem.substring(0, 1);
    } else if (this.isReleasedProduct(product)) {
      return '';
    }
    return '';
  }

}