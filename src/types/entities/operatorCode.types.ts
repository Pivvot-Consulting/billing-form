/**
 * Entidad Código de Operador
 * Códigos temporales para vincular ventas con operadores
 */
export interface OperatorCode {
  id: number;
  operator_id: string;
  code: string;
  expires_at: string;
  used_at: string | null;
  venta_id: number | null;
  created_at: string;
}

/**
 * Respuesta al generar un nuevo código
 */
export interface GenerateCodeResponse {
  id: number;
  code: string;
  expires_at: string;
}

/**
 * Estado del código
 */
export type CodeStatus = 'active' | 'used' | 'expired' | 'new';
