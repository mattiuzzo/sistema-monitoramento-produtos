// src/app/models/product.model.ts

export interface BlockedProduct {
  codigo: string;
  descricao: string;
  dataBloq: string;
  usuarioBloq: string;
  origem: string;
  empresa: string;
}

export interface ReleasedProduct {
  codigo: string;
  descricao: string;
  dataLib: string;
  usuarioLib: string;
  horaLib: string;
  empresa: string;
}