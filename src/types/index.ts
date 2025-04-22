export interface Producto {
  ProductoId: string;
  ProductoNombre: string;
  ProductoTasaIVA: number;
  Precio: {
    PrecioLista: number;
  }[];
}

export interface FacturaItem {
  ProductoId: string;
  ProductoNombre: string;
  Cantidad: number;
  PrecioUnitario: number;
  Subtotal: number;
  IVA: number;
  Total: number;
}

export interface Factura {
  DocumentoId: number;
  FacturaResolucionTipo: string;
  FacturaFecha: string;
  ClienteId: string;
  FacturaTipoOperacion: string;
  FacturaBodegaId: string;
  FacturaTipoPago: string;
  Detalle: {
    ProductoId: string;
    FacturaDetalleCantidad: number;
    FacturaDetalleVrUnitario: number;
    FacturaDetalleDcto: number;
    FacturaDetalleTotalPC: number;
    FacturaDetalleTipoFlete: string;
    FacturaDetalleNotaLong: string;
    FacturaLoteId: string;
  }[];
}
