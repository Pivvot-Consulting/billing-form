/**
 * Data Transfer Objects para autenticación
 */

/**
 * DTO para login de operador
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * DTO de respuesta de login
 */
export interface LoginResponseDto {
  operator: {
    id: string;
    email: string;
    nombre?: string;
    apellido?: string;
  };
  access_token: string;
  refresh_token: string;
  expires_in: number;
}
