/**
 * Servicio de Transacciones Wompi en Supabase
 * Maneja todas las operaciones relacionadas con pagos virtuales de Wompi
 */

import { supabase } from '@/lib/supabase';
import { SUPABASE_TABLES } from '@/constants/supabase.constants';
import type { 
  WompiTransaction, 
  WompiWebhookPayload,
  WompiTransactionStatus 
} from '@/types/entities/wompi.types';

/**
 * Crea una nueva transacción desde el webhook de Wompi
 */
export async function createTransactionFromWebhook(
  payload: WompiWebhookPayload
): Promise<WompiTransaction> {
  try {
    const transaction = payload.data.transaction;

    // Preparar datos para insertar
    const transactionData = {
      wompi_transaction_id: transaction.id,
      reference: transaction.reference,
      status: transaction.status,
      status_message: transaction.status_message,
      amount_in_cents: transaction.amount_in_cents,
      amount: transaction.amount_in_cents / 100,
      currency: transaction.currency,
      payment_method_type: transaction.payment_method_type,
      payment_method_name: transaction.payment_method?.extra?.name,
      payment_method_bin: transaction.payment_method?.extra?.bin,
      payment_method_last_four: transaction.payment_method?.extra?.last_four,
      customer_email: transaction.customer_email || transaction.customer_data?.full_name,
      customer_phone: transaction.customer_data?.phone_number || transaction.shipping_address?.phone_number,
      customer_legal_id: transaction.billing_data?.legal_id || transaction.customer_data?.legal_id,
      customer_legal_id_type: transaction.billing_data?.legal_id_type || transaction.customer_data?.legal_id_type,
      payment_link_id: transaction.payment_link_id,
      redirect_url: transaction.redirect_url,
      webhook_data: payload,
      wompi_created_at: transaction.created_at,
      wompi_finalized_at: transaction.finalized_at,
      processed: false,
    };

    // Insertar en Supabase
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.WOMPI_TRANSACTIONS)
      .insert(transactionData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error al crear transacción desde webhook:', error);
    throw error;
  }
}

/**
 * Actualiza una transacción existente
 */
export async function updateTransaction(
  wompiTransactionId: string,
  payload: WompiWebhookPayload
): Promise<WompiTransaction> {
  try {
    const transaction = payload.data.transaction;

    const updateData = {
      status: transaction.status,
      status_message: transaction.status_message,
      wompi_finalized_at: transaction.finalized_at,
      webhook_data: payload,
    };

    const { data, error } = await supabase
      .from(SUPABASE_TABLES.WOMPI_TRANSACTIONS)
      .update(updateData)
      .eq('wompi_transaction_id', wompiTransactionId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error al actualizar transacción:', error);
    throw error;
  }
}

/**
 * Obtiene una transacción por su ID de Wompi
 */
export async function getTransactionByWompiId(
  wompiTransactionId: string
): Promise<WompiTransaction | null> {
  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.WOMPI_TRANSACTIONS)
      .select('*')
      .eq('wompi_transaction_id', wompiTransactionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error al obtener transacción:', error);
    return null;
  }
}

/**
 * Obtiene una transacción por su referencia
 */
export async function getTransactionByReference(
  reference: string
): Promise<WompiTransaction | null> {
  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.WOMPI_TRANSACTIONS)
      .select('*')
      .eq('reference', reference)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error al obtener transacción por referencia:', error);
    return null;
  }
}

/**
 * Obtiene todas las transacciones pendientes de procesar
 */
export async function getPendingTransactions(): Promise<WompiTransaction[]> {
  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.WOMPI_TRANSACTIONS)
      .select('*')
      .eq('processed', false)
      .eq('status', 'APPROVED')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Error al obtener transacciones pendientes:', error);
    throw error;
  }
}

/**
 * Obtiene todas las transacciones con filtros opcionales
 */
export async function getTransactions(filters?: {
  status?: WompiTransactionStatus;
  processed?: boolean;
  limit?: number;
}): Promise<WompiTransaction[]> {
  try {
    let query = supabase
      .from(SUPABASE_TABLES.WOMPI_TRANSACTIONS)
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.processed !== undefined) {
      query = query.eq('processed', filters.processed);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    throw error;
  }
}

/**
 * Crea una venta a partir de una transacción de Wompi aprobada
 */
export async function createSaleFromWompiTransaction(
  transactionId: number,
  operatorId: string,
  timeInMinutes?: number
): Promise<{
  ventaId: number;
  clienteId: number;
  success: boolean;
  message: string;
}> {
  try {
    const { data, error } = await supabase.rpc('crear_venta_desde_wompi', {
      p_wompi_transaction_id: transactionId,
      p_operator_id: operatorId,
      p_tiempo_servicio_min: timeInMinutes || null,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error('No se recibió respuesta de la función');
    }

    const result = data[0];

    return {
      ventaId: result.venta_id,
      clienteId: result.cliente_id,
      success: result.success,
      message: result.message,
    };
  } catch (error) {
    console.error('Error al crear venta desde Wompi:', error);
    throw error;
  }
}

/**
 * Marca una transacción como procesada por un operador
 */
export async function markTransactionAsProcessed(
  transactionId: number,
  operatorId: string | number,
  ventaId?: number
): Promise<WompiTransaction> {
  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.WOMPI_TRANSACTIONS)
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
        processed_by_operator_id: operatorId,
        venta_id: ventaId,
      })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error al marcar transacción como procesada:', error);
    throw error;
  }
}

/**
 * Obtiene estadísticas de transacciones
 */
export async function getTransactionStats() {
  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.WOMPI_TRANSACTIONS)
      .select('status, amount, created_at, processed');

    if (error) {
      throw new Error(error.message);
    }

    const transactions = data || [];
    const today = new Date().toISOString().split('T')[0];

    return {
      total: transactions.length,
      approved: transactions.filter(t => t.status === 'APPROVED').length,
      pending: transactions.filter(t => t.status === 'PENDING').length,
      declined: transactions.filter(t => t.status === 'DECLINED').length,
      processed: transactions.filter(t => t.processed).length,
      unprocessed: transactions.filter(t => !t.processed && t.status === 'APPROVED').length,
      todayTransactions: transactions.filter(t => t.created_at.startsWith(today)).length,
      totalAmount: transactions
        .filter(t => t.status === 'APPROVED')
        .reduce((sum, t) => sum + t.amount, 0),
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
}
