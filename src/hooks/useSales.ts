/**
 * Hook para gestión de ventas
 */

'use client';

import { useState, useCallback } from 'react';
import { SaleController } from '@/controllers';
import { SaleWithDetails } from '@/types/entities/sale.types';
import { Bill } from '@/interfaces/interfaces';

interface SalesStats {
  totalVentas: number;
  valorTotal: number;
  ventasHoy: number;
  promedioVenta: number;
}

export function useSales() {
  const [sales, setSales] = useState<SaleWithDetails[]>([]);
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SaleController.getOperatorSalesWithStats();
      setSales(data.sales);
      setStats(data.stats);
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al cargar ventas');
      console.error('Error al cargar ventas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSale = async (
    formData: Bill,
    operatorCode: string,
    generateInvoice: boolean = true
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await SaleController.handleCreateSaleFromForm(
        formData,
        operatorCode,
        generateInvoice
      );
      return result;
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Error al crear venta';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSaleDetails = async (saleId: number) => {
    try {
      setLoading(true);
      setError(null);
      return await SaleController.getSaleDetails(saleId);
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al obtener detalles de venta');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateInvoice = async (saleId: number, invoiceNumber: string) => {
    try {
      setLoading(true);
      setError(null);
      await SaleController.updateInvoiceNumber(saleId, invoiceNumber);
      // Recargar ventas después de actualizar
      await loadSales();
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al actualizar factura');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    sales,
    stats,
    loading,
    error,
    loadSales,
    createSale,
    getSaleDetails,
    updateInvoice,
  };
}
