/**
 * Entidad Operador
 * Representa un usuario operador del sistema
 */
export interface Operator {
  id: string;
  email: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

/**
 * Sesión de operador con token
 */
export interface OperatorSession {
  operator: Operator;
  access_token: string;
  refresh_token: string;
}
