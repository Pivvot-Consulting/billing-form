'use client'
import React, { useEffect, useState } from 'react';
import { Button } from '@nextui-org/button';
import { WompiTransaction } from '@/types/entities/wompi.types';
import { 
  getPendingTransactions, 
  createSaleFromWompiTransaction 
} from '@/services/supabase/wompi.service';
import { formatCurrency } from '@/services/WompiService';
import { showErrorToast, showLoadingToast, updateLoadingToast } from '@/utils/errorHandler';
import { CreditCard, CheckCircle, Clock } from 'lucide-react';

interface WompiTransactionsProps {
  operatorId: string | number;
}

export default function WompiTransactions({ operatorId }: WompiTransactionsProps) {
  const [transactions, setTransactions] = useState<WompiTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await getPendingTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
      showErrorToast(error, 'Cargar Transacciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
    
    // Recargar cada 30 segundos
    const interval = setInterval(loadTransactions, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (transaction: WompiTransaction) => {
    let loadingToastId: string | null = null;
    
    try {
      setProcessingId(transaction.id);
      loadingToastId = showLoadingToast('Creando venta y validando pago...');

      // Crear venta desde la transacción de Wompi
      const result = await createSaleFromWompiTransaction(
        transaction.id,
        String(operatorId)
      );

      if (!result.success) {
        throw new Error(result.message);
      }

      if (loadingToastId) {
        updateLoadingToast(
          loadingToastId, 
          `¡Venta creada exitosamente! ID: ${result.ventaId}`, 
          'success'
        );
      }

      // Recargar transacciones
      await loadTransactions();
    } catch (error) {
      console.error('Error al validar pago:', error);
      if (loadingToastId) {
        updateLoadingToast(loadingToastId, 'Error al crear la venta', 'error');
      } else {
        showErrorToast(error, 'Crear Venta');
      }
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Pagos Virtuales Pendientes</h3>
        </div>
        <div className="p-6">
          <p className="text-center text-gray-500">Cargando transacciones...</p>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="w-full bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CreditCard size={20} />
            Pagos Virtuales Pendientes
          </h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
            <p className="text-gray-600">No hay pagos pendientes de validar</p>
            <p className="text-sm text-gray-400 mt-2">
              Los pagos aprobados aparecerán aquí automáticamente
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CreditCard size={20} />
          Pagos Virtuales Pendientes
          <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {transactions.length}
          </span>
        </h3>
        <Button
          size="sm"
          variant="light"
          onPress={loadTransactions}
          isLoading={loading}
        >
          Actualizar
        </Button>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      APROBADO
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(transaction.created_at).toLocaleString('es-CO')}
                    </span>
                  </div>
                  
                  <p className="text-2xl font-bold text-green-600 mb-2">
                    {formatCurrency(transaction.amount)}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {transaction.payment_method_type && (
                      <div>
                        <span className="text-gray-600">Método:</span>
                        <p className="font-medium">
                          {transaction.payment_method_name || transaction.payment_method_type}
                          {transaction.payment_method_last_four && 
                            ` ****${transaction.payment_method_last_four}`
                          }
                        </p>
                      </div>
                    )}
                    
                    {transaction.customer_email && (
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <p className="font-medium text-xs">{transaction.customer_email}</p>
                      </div>
                    )}
                    
                    {transaction.customer_phone && (
                      <div>
                        <span className="text-gray-600">Teléfono:</span>
                        <p className="font-medium">{transaction.customer_phone}</p>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-gray-600">Referencia:</span>
                      <p className="font-medium text-xs">{transaction.reference}</p>
                    </div>
                  </div>
                </div>

                <Button
                  color="primary"
                  size="lg"
                  onPress={() => handleApprove(transaction)}
                  isLoading={processingId === transaction.id}
                  disabled={processingId !== null}
                  className="ml-4"
                >
                  Validar Pago
                </Button>
              </div>

              <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                <Clock size={12} />
                <span>
                  Recibido hace {Math.round((Date.now() - new Date(transaction.created_at).getTime()) / 60000)} minutos
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
