/**
 * Tipos para la integración con Wompi
 */

/**
 * Estados posibles de una transacción en Wompi
 */
export type WompiTransactionStatus = 
  | 'APPROVED' 
  | 'DECLINED' 
  | 'ERROR' 
  | 'VOIDED' 
  | 'PENDING';

/**
 * Tipos de métodos de pago en Wompi
 */
export type WompiPaymentMethodType = 
  | 'CARD' 
  | 'NEQUI' 
  | 'PSE' 
  | 'BANCOLOMBIA_TRANSFER' 
  | 'BANCOLOMBIA_COLLECT';

/**
 * Estructura de una transacción Wompi en nuestra base de datos
 */
export interface WompiTransaction {
  id: number;
  wompi_transaction_id: string;
  reference: string;
  status: WompiTransactionStatus;
  status_message?: string;
  amount_in_cents: number;
  amount: number;
  currency: string;
  payment_method_type?: WompiPaymentMethodType;
  payment_method_name?: string;
  payment_method_bin?: string;
  payment_method_last_four?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_legal_id?: string;
  customer_legal_id_type?: string;
  customer_full_name?: string;
  payment_link_id?: string;
  redirect_url?: string;
  webhook_data?: Record<string, unknown>;
  wompi_created_at?: string;
  wompi_finalized_at?: string;
  processed: boolean;
  processed_at?: string;
  processed_by_operator_id?: string | number;
  venta_id?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Datos del método de pago desde Wompi
 */
export interface WompiPaymentMethod {
  type: WompiPaymentMethodType;
  extra?: {
    bin?: string;
    name?: string;
    brand?: string;
    exp_year?: string;
    exp_month?: string;
    last_four?: string;
    card_holder?: string;
    is_three_ds?: boolean;
    unique_code?: string;
    phone_number?: string;
    external_identifier?: string;
  };
  installments?: number;
}

/**
 * Estructura de la transacción en el webhook de Wompi
 */
export interface WompiWebhookTransaction {
  id: string;
  reference: string;
  status: WompiTransactionStatus;
  status_message?: string;
  amount_in_cents: number;
  currency: string;
  payment_method_type: WompiPaymentMethodType;
  payment_method?: WompiPaymentMethod;
  customer_email?: string;
  customer_data?: {
    phone_number?: string;
    full_name?: string;
    legal_id?: string;
    legal_id_type?: string;
  };
  billing_data?: {
    legal_id?: string;
    legal_id_type?: string;
  };
  shipping_address?: {
    address_line_1?: string;
    city?: string;
    phone_number?: string;
    region?: string;
  };
  redirect_url?: string;
  payment_link_id?: string;
  created_at: string;
  finalized_at?: string;
  taxes?: Array<{
    type: string;
    amount_in_cents: number;
  }>;
}

/**
 * Estructura del webhook que envía Wompi
 */
export interface WompiWebhookPayload {
  event: 'transaction.updated';
  data: {
    transaction: WompiWebhookTransaction;
  };
  sent_at: string;
  timestamp: number;
  environment: 'test' | 'production';
  signature?: {
    checksum: string;
    properties: string[];
  };
}

/**
 * Respuesta al generar URL de pago
 */
export interface WompiPaymentUrlResponse {
  paymentUrl: string;
  reference: string;
  amount: number;
  amountInCents: number;
}

/**
 * Datos para crear una transacción de pago
 */
export interface CreateWompiPaymentData {
  amount: number; // Monto en pesos
  customerEmail?: string;
  redirectUrl?: string;
  operatorCode?: string; // Código del operador (4 dígitos)
}
