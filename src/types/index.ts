export type TipoMovimiento = "gasto" | "ingreso";
export type Moneda = "ARS" | "USD";

export interface IMovimiento {
  _id?: string;
  userId: string;
  tipo: TipoMovimiento;
  monto: number;
  moneda: Moneda;
  descripcion: string;
  categoria: string;
  fecha: string;
  createdAt?: string;
}

export interface IGastoFijo {
  _id?: string;
  userId: string;
  nombre: string;
  monto: number;
  moneda: Moneda;
  diaVencimiento: number;
  categoria: string;
  activo: boolean;
  createdAt?: string;
}

export interface ICompra {
  _id?: string;
  userId: string;
  descripcion: string;
  montoTotal: number;
  moneda: Moneda;
  cantidadCuotas: number;
  cuotasPagadas: number;
  montoPorCuota: number;
  tasaInteres: number;
  tarjeta: string;
  fechaInicio: string;
  categoria: string;
  createdAt?: string;
}

export const CATEGORIAS_GASTO = [
  "Comida",
  "Transporte",
  "Entretenimiento",
  "Salud",
  "Educación",
  "Servicios",
  "Ropa",
  "Hogar",
  "Tecnología",
  "Suscripciones",
  "Otros",
] as const;

export const CATEGORIAS_INGRESO = [
  "Salario",
  "Freelance",
  "Inversiones",
  "Venta",
  "Regalo",
  "Reembolso",
  "Otros",
] as const;
