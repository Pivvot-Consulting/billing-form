/**
 * Constantes relacionadas con Supabase
 */

/**
 * Nombres de tablas en Supabase
 */
export const SUPABASE_TABLES = {
  OPERADORES: 'operadores',
  OPERATOR_CODES: 'operator_codes',
  CLIENTES: 'clientes',
  VENTAS: 'ventas',
  ACEPTACIONES: 'aceptaciones',
  MARKETING_RESPUESTAS: 'marketing_respuestas',
} as const;

/**
 * Funciones RPC disponibles en Supabase
 */
export const SUPABASE_RPC = {
  CREAR_ENVIO_COMPLETO: 'crear_envio_completo',
  GENERAR_CODIGO_OPERADOR: 'generar_codigo_operador',
} as const;

/**
 * Configuración de códigos de operador
 */
export const OPERATOR_CODE_CONFIG = {
  DEFAULT_LENGTH: 4,
  DEFAULT_EXPIRATION_MINUTES: 30,
  MIN_LENGTH: 4,
  MAX_LENGTH: 8,
} as const;

/**
 * Configuración de sesión
 */
export const SESSION_CONFIG = {
  STORAGE_KEY: 'operator_session',
  TOKEN_REFRESH_MARGIN: 60, // segundos antes de expiración para refrescar
} as const;
