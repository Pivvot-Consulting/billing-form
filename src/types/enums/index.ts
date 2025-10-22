/**
 * Enumeraciones del sistema
 */

/**
 * Tipos de documento de identidad
 */
export type DocumentTypeType = 'CC' | 'Pasaporte' | 'NIT';

/**
 * Estados de factura
 */
export enum FacturaEstado {
  PENDIENTE = 'pendiente',
  GENERADA = 'generada',
  ERROR = 'error',
  CANCELADA = 'cancelada'
}

/**
 * Métodos de pago
 */
export enum MetodoPago {
  EFECTIVO = 'efectivo',
  VIRTUAL = 'virtual'
}

/**
 * Roles de usuario
 */
export enum UserRole {
  OPERADOR = 'operador',
  CLIENTE = 'cliente',
  ADMIN = 'admin'
}

/**
 * Versiones de documentos legales
 */
export const DOCUMENT_VERSIONS = {
  TERMINOS: 'v1.3',
  PRIVACIDAD: 'v1.0'
} as const;
