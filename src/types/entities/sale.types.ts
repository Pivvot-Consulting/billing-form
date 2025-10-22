/**
 * Entidad Venta
 * Representa una transacción de venta en el sistema
 */
export interface Sale {
  id: number;
  operador_id: string;
  cliente_id: number;
  tiempo_servicio_min: number;
  valor_total: number;
  generar_factura: boolean;
  numero_factura?: string;
  estado_factura?: string;
  creada_en: string;
  actualizada_en: string;
}

/**
 * Aceptación de términos y políticas
 */
export interface Aceptacion {
  id: number;
  venta_id: number;
  acepta_terminos: boolean;
  acepta_privacidad: boolean;
  version_terminos: string;
  version_privacidad: string;
  ip?: string;
  user_agent?: string;
  creado_en: string;
}

/**
 * Respuestas de marketing
 */
export interface MarketingRespuesta {
  id: number;
  venta_id: number;
  respuestas: Record<string, unknown>;
  creado_en: string;
}

/**
 * Venta completa con relaciones
 */
export interface SaleWithDetails extends Sale {
  cliente?: {
    nombre: string;
    apellido: string;
    numero_documento: string;
    correo: string;
  };
  aceptacion?: Aceptacion;
  marketing_respuestas?: MarketingRespuesta;
}
