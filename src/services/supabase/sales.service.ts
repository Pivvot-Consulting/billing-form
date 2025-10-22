/**
 * Servicio de Ventas
 * Maneja todas las operaciones relacionadas con ventas, clientes y aceptaciones
 */

import { supabase } from '@/lib/supabase';
import { SUPABASE_TABLES, SUPABASE_RPC } from '@/constants/supabase.constants';
import { CreateSaleDto, CreateSaleResponseDto } from '@/types/dto/sale.dto';
import { Sale, SaleWithDetails, Aceptacion, MarketingRespuesta } from '@/types/entities/sale.types';

/**
 * Crea una venta completa con cliente, aceptación y marketing
 * Usa la función RPC para hacer todo en una transacción
 */
export async function createCompleteSale(
  saleData: CreateSaleDto
): Promise<CreateSaleResponseDto> {
  try {
    const { data, error } = await supabase.rpc(SUPABASE_RPC.CREAR_ENVIO_COMPLETO, saleData);

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error('No se pudo crear la venta');
    }

    return data[0];
  } catch (error) {
    console.error('Error al crear venta completa:', error);
    throw error;
  }
}

/**
 * Obtiene todas las ventas del operador autenticado
 */
export async function getOperatorSales(): Promise<SaleWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.VENTAS)
      .select(`
        id,
        operador_id,
        cliente_id,
        tiempo_servicio_min,
        valor_total,
        generar_factura,
        numero_factura,
        estado_factura,
        creada_en,
        actualizada_en,
        clientes:cliente_id (
          nombre,
          apellido,
          numero_documento,
          correo
        )
      `)
      .order('id', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    throw error;
  }
}

/**
 * Obtiene una venta específica con sus detalles
 */
export async function getSaleById(saleId: number): Promise<SaleWithDetails | null> {
  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.VENTAS)
      .select(`
        *,
        clientes:cliente_id (*),
        aceptaciones (*),
        marketing_respuestas (*)
      `)
      .eq('id', saleId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error al obtener venta:', error);
    return null;
  }
}

/**
 * Actualiza el número de factura de una venta
 */
export async function updateSaleInvoice(
  saleId: number,
  numeroFactura: string,
  estadoFactura?: string
): Promise<Sale> {
  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.VENTAS)
      .update({
        numero_factura: numeroFactura,
        estado_factura: estadoFactura || 'generada',
      })
      .eq('id', saleId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error al actualizar factura:', error);
    throw error;
  }
}

/**
 * Obtiene las aceptaciones de una venta
 */
export async function getSaleAceptaciones(saleId: number): Promise<Aceptacion[]> {
  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.ACEPTACIONES)
      .select('*')
      .eq('venta_id', saleId);

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Error al obtener aceptaciones:', error);
    throw error;
  }
}

/**
 * Obtiene las respuestas de marketing de una venta
 */
export async function getSaleMarketingResponses(saleId: number): Promise<MarketingRespuesta[]> {
  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.MARKETING_RESPUESTAS)
      .select('*')
      .eq('venta_id', saleId);

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Error al obtener respuestas de marketing:', error);
    throw error;
  }
}

/**
 * Obtiene estadísticas de ventas del operador
 */
export async function getOperatorSalesStats() {
  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.VENTAS)
      .select('valor_total, creada_en');

    if (error) {
      throw new Error(error.message);
    }

    const sales = data || [];
    const totalVentas = sales.length;
    const valorTotal = sales.reduce((sum, sale) => sum + (sale.valor_total || 0), 0);
    const hoy = new Date().toISOString().split('T')[0];
    const ventasHoy = sales.filter(sale => sale.creada_en.startsWith(hoy)).length;

    return {
      totalVentas,
      valorTotal,
      ventasHoy,
      promedioVenta: totalVentas > 0 ? valorTotal / totalVentas : 0,
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
}
