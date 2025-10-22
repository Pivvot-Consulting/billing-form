import { DocumentTypeType } from '../enums';

/**
 * Data Transfer Objects para ventas
 */

/**
 * DTO para crear una venta completa (RPC)
 */
export interface CreateSaleDto {
  p_operator_code: string;
  p_tipo_documento: DocumentTypeType;
  p_numero_documento: string;
  p_nombre: string;
  p_apellido: string;
  p_correo: string;
  p_direccion: string;
  p_celular: string;
  p_tiempo_servicio_min: number;
  p_valor_total: number;
  p_acepta_terminos: boolean;
  p_acepta_privacidad: boolean;
  p_version_terminos: string;
  p_version_privacidad: string;
  p_ip?: string | null;
  p_user_agent?: string;
  p_marketing?: Record<string, any> | null;
}

/**
 * DTO de respuesta al crear venta
 */
export interface CreateSaleResponseDto {
  venta_id: number;
  cliente_id: number;
  operador_id: string;
  aceptacion_id: number;
}

/**
 * DTO para generar código de operador
 */
export interface GenerateOperatorCodeDto {
  p_len?: number;
  p_expira_min?: number;
}
