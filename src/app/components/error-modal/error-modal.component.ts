// src/app/components/error-modal/error-modal.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.scss']
})
export class ErrorModalComponent {
  @Input() message: string | null = null; // Mensagem a ser exibida no modal
  @Input() show: boolean = false; // Controla a visibilidade do modal
  @Output() close = new EventEmitter<void>(); // Evento emitido ao fechar o modal

  // Emite o evento de close
  onClose(): void {
    this.close.emit();
  }
}