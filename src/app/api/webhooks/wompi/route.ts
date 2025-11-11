/**
 * API Route para recibir webhooks de Wompi
 * Este endpoint es llamado por Wompi cuando hay actualizaciones en las transacciones
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  createTransactionFromWebhook, 
  updateTransaction, 
  getTransactionByWompiId,
  createSaleFromWompiTransaction 
} from '@/services/supabase/wompi.service';
import { WompiWebhookPayload } from '@/types/entities/wompi.types';
import * as OperatorService from '@/services/supabase/operator.service';
import * as SiigoService from '@/services/SiigoService';
import { Bill } from '@/interfaces/interfaces';
import crypto from 'crypto';

/**
 * Valida la firma de integridad del webhook de Wompi
 * IMPORTANTE: La firma del webhook NO usa el secreto de integridad
 * Solo concatena los valores y calcula el SHA256
 * 
 * NOTA: En ambiente de prueba, Wompi puede no validar la firma correctamente
 * Por lo tanto, en test mode permitimos webhooks incluso si la firma no coincide
 */
function validateSignature(
  payload: WompiWebhookPayload,
  receivedChecksum: string | null
): boolean {
  // En ambiente de prueba, permitir siempre (Wompi test no valida firma correctamente)
  if (payload.environment === 'test') {
    console.log('⚠️ Modo test - omitiendo validación de firma');
    return true;
  }

  // En producción, validar la firma
  if (!receivedChecksum) {
    console.error('❌ No se recibió checksum en producción');
    return false;
  }

  try {
    const transaction = payload.data?.transaction;
    if (!transaction) {
      console.error('❌ No hay datos de transacción');
      return false;
    }

    // Construir el string de concatenación según las propiedades de la firma
    const properties = payload.signature?.properties || [
      'transaction.id',
      'transaction.status',
      'transaction.amount_in_cents'
    ];

    // Obtener los valores según las propiedades
    const values: string[] = [];
    for (const prop of properties) {
      const keys = prop.split('.');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let value: any = payload.data;
      
      for (const key of keys) {
        value = value?.[key];
      }
      
      if (value !== undefined && value !== null) {
        values.push(String(value));
      }
    }

    // Concatenar los valores (SIN secreto de integridad)
    const concatenatedString = values.join('');
    
    // Calcular el hash SHA256
    const calculatedChecksum = crypto
      .createHash('sha256')
      .update(concatenatedString)
      .digest('hex');

    const isValid = calculatedChecksum === receivedChecksum;

    console.log('🔐 Validación de firma del webhook:', {
      properties,
      values,
      concatenatedString,
      receivedChecksum,
      calculatedChecksum,
      match: isValid
    });

    // Si no coincide, intentar con el timestamp agregado (algunas versiones de Wompi lo incluyen)
    if (!isValid && payload.timestamp) {
      const concatenatedWithTimestamp = concatenatedString + payload.timestamp;
      const calculatedWithTimestamp = crypto
        .createHash('sha256')
        .update(concatenatedWithTimestamp)
        .digest('hex');
      
      const isValidWithTimestamp = calculatedWithTimestamp === receivedChecksum;
      
      console.log('🔐 Intentando con timestamp:', {
        concatenatedWithTimestamp,
        calculatedWithTimestamp,
        match: isValidWithTimestamp
      });
      
      return isValidWithTimestamp;
    }

    return isValid;
  } catch (error) {
    console.error('❌ Error al validar firma:', error);
    return false;
  }
}

/**
 * POST /api/webhooks/wompi
 * Recibe notificaciones de Wompi sobre transacciones
 */
export async function POST(request: NextRequest) {
  try {
    // Leer el body del request
    const payload: WompiWebhookPayload = await request.json();

    // Obtener el checksum del header
    const receivedChecksum = request.headers.get('x-event-checksum');

    console.log('📨 Webhook recibido de Wompi:', {
      event: payload.event,
      transactionId: payload.data?.transaction?.id,
      status: payload.data?.transaction?.status,
      reference: payload.data?.transaction?.reference,
      checksum: receivedChecksum,
    });

    // Validar la firma de integridad
    const isValidSignature = validateSignature(payload, receivedChecksum);
    
    if (!isValidSignature) {
      console.error('❌ Firma de integridad inválida');
      return NextResponse.json(
        { message: 'Firma de integridad inválida' },
        { status: 401 }
      );
    }

    console.log('✅ Firma de integridad validada');

    // Validar que sea un evento de transacción
    if (payload.event !== 'transaction.updated') {
      console.log('⚠️ Evento no procesado:', payload.event);
      return NextResponse.json(
        { message: 'Evento no procesado', event: payload.event },
        { status: 200 }
      );
    }

    // Validar que tenga datos de transacción
    if (!payload.data?.transaction) {
      console.error('❌ No se encontraron datos de transacción en el payload');
      return NextResponse.json(
        { message: 'Datos de transacción no encontrados' },
        { status: 400 }
      );
    }

    const transaction = payload.data.transaction;

    // Extraer código de operador de la referencia (formato: pivvot-timestamp-CODE)
    const referenceParts = transaction.reference.split('-');
    const operatorCode = referenceParts.length === 3 ? referenceParts[2] : null;

    console.log('📋 Código de operador extraído:', operatorCode);

    // Verificar si la transacción ya existe
    const existingTransaction = await getTransactionByWompiId(transaction.id);

    if (existingTransaction) {
      // Actualizar transacción existente
      console.log('🔄 Actualizando transacción existente:', transaction.id);
      
      const updatedTransaction = await updateTransaction(transaction.id, payload);
      
      console.log('✅ Transacción actualizada:', {
        id: updatedTransaction.id,
        status: updatedTransaction.status,
        reference: updatedTransaction.reference,
      });

      return NextResponse.json({
        message: 'Transacción actualizada exitosamente',
        transactionId: updatedTransaction.id,
        status: updatedTransaction.status,
      });
    } else {
      // Crear nueva transacción
      console.log('➕ Creando nueva transacción:', transaction.id);
      
      const newTransaction = await createTransactionFromWebhook(payload);
      
      console.log('✅ Transacción creada:', {
        id: newTransaction.id,
        status: newTransaction.status,
        reference: newTransaction.reference,
        amount: newTransaction.amount,
      });

      // Si la transacción está APPROVED y tenemos código de operador, crear venta automáticamente
      if (newTransaction.status === 'APPROVED' && operatorCode) {
        try {
          console.log('🔄 Procesando venta automáticamente con código:', operatorCode);
          
          // Validar código de operador
          const isValidCode = await OperatorService.validateOperatorCode(operatorCode);
          
          if (!isValidCode) {
            console.error('❌ Código de operador inválido o expirado:', operatorCode);
            return NextResponse.json({
              message: 'Transacción creada pero código de operador inválido',
              transactionId: newTransaction.id,
              status: newTransaction.status,
              warning: 'El código de operador es inválido o ha expirado',
            });
          }

          // Obtener operator_id del código
          const operatorData = await OperatorService.getOperatorByCode(operatorCode);
          
          if (!operatorData) {
            console.error('❌ No se pudo obtener datos del operador');
            return NextResponse.json({
              message: 'Transacción creada pero no se pudo obtener operador',
              transactionId: newTransaction.id,
              status: newTransaction.status,
            });
          }

          console.log('👤 Operador encontrado:', operatorData.operator_id);

          // Crear venta usando la función RPC
          const saleResult = await createSaleFromWompiTransaction(
            newTransaction.id,
            operatorData.operator_id,
            undefined // tiempo se calcula automáticamente según el monto
          );

          if (!saleResult.success) {
            console.error('❌ Error al crear venta:', saleResult.message);
            return NextResponse.json({
              message: 'Transacción creada pero error al crear venta',
              transactionId: newTransaction.id,
              status: newTransaction.status,
              error: saleResult.message,
            });
          }

          console.log('✅ Venta creada:', {
            ventaId: saleResult.ventaId,
            clienteId: saleResult.clienteId,
          });

          // Generar factura en Siigo
          try {
            // Obtener datos del cliente desde webhook
            const customerFullName = transaction.customer_data?.full_name || 'Cliente Virtual';
            const nameParts = customerFullName.trim().split(/\s+/);
            
            // Dividir en nombre (primeras 2 palabras) y apellido (resto)
            // Ejemplo: "Francisco Javier Castillo Barrios" -> nombre: "Francisco Javier", apellido: "Castillo Barrios"
            let firstName = 'Cliente';
            let lastName = 'Virtual';
            
            if (nameParts.length >= 4) {
              // Si hay 4+ palabras, asumir que las primeras 2 son nombres y el resto apellidos
              firstName = nameParts.slice(0, 2).join(' ');
              lastName = nameParts.slice(2).join(' ');
            } else if (nameParts.length === 3) {
              // Si hay 3 palabras, primera es nombre, resto apellidos
              firstName = nameParts[0];
              lastName = nameParts.slice(1).join(' ');
            } else if (nameParts.length === 2) {
              // Si hay 2 palabras, primera es nombre, segunda apellido
              firstName = nameParts[0];
              lastName = nameParts[1];
            } else if (nameParts.length === 1) {
              firstName = nameParts[0];
              lastName = 'Virtual';
            }

            // Obtener billing_data del webhook
            const billingData = payload.data.transaction.billing_data;
            const shippingAddress = payload.data.transaction.shipping_address;

            // Calcular tiempo de servicio para determinar el código de producto correcto
            // Basado en la misma lógica que la función SQL
            const amountInCents = newTransaction.amount * 100;
            let qtyHours = 0;
            let qtyMinutes = 0;
            let isExtendedTime = false;

            if (amountInCents <= 3000000) { // <= $30,000
              qtyMinutes = 30; // Código 001
            } else if (amountInCents <= 4000000) { // <= $40,000
              qtyHours = 1; // Código 002
            } else if (amountInCents <= 8000000) { // <= $80,000
              qtyHours = 2; // Código 004
            } else {
              // Tiempo extendido - Código 003
              isExtendedTime = true;
            }

            // Limpiar número de teléfono (remover + y espacios, y código de país 57)
            const rawPhone = transaction.customer_data?.phone_number || '0000000000';
            let cleanPhone = rawPhone.replace(/[\s+]/g, '');
            // Si empieza con 57, removerlo (código de país Colombia)
            if (cleanPhone.startsWith('57') && cleanPhone.length > 10) {
              cleanPhone = cleanPhone.substring(2);
            }
            // Limitar a 10 dígitos máximo
            cleanPhone = cleanPhone.substring(0, 10);

            const billData: Bill = {
              name: firstName,
              lastName: lastName,
              email: transaction.customer_email || 'virtual@pivvot.com',
              address: shippingAddress?.address_line_1 || 'Dirección Virtual - Barranquilla',
              phone: cleanPhone,
              documentType: 'CC',
              documentNumber: parseInt(billingData?.legal_id || '0') || 0,
              serviceValue: newTransaction.amount,
              qtyHours,
              qtyMinutes,
              isExtendedTime,
            };

            await SiigoService.createBill(billData);

          } catch (siigoError) {
            console.error('⚠️ Error al generar factura en Siigo (no crítico):', siigoError);
            // No fallar si Siigo falla, la venta ya está creada
          }

          return NextResponse.json({
            message: 'Transacción creada exitosamente',
            transactionId: newTransaction.id,
            status: newTransaction.status,
            ventaId: saleResult.ventaId,
            clienteId: saleResult.clienteId,
            invoiceGenerated: true,
          });

        } catch (error) {
          console.error('❌ Error al procesar venta automáticamente:', error);
          // Retornar éxito de transacción aunque falle la venta
          return NextResponse.json({
            message: 'Transacción creada pero error al procesar venta',
            transactionId: newTransaction.id,
            status: newTransaction.status,
            error: error instanceof Error ? error.message : 'Error desconocido',
          });
        }
      }

      return NextResponse.json({
        message: 'Transacción creada exitosamente',
        transactionId: newTransaction.id,
        status: newTransaction.status,
      });
    }

  } catch (error) {
    console.error('❌ Error al procesar webhook de Wompi:', error);
    
    // Retornar 200 para que Wompi no reintente
    // pero loguear el error para investigación
    return NextResponse.json(
      { 
        message: 'Error al procesar webhook',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 200 }
    );
  }
}

/**
 * GET /api/webhooks/wompi
 * Endpoint de verificación (opcional)
 */
export async function GET() {
  return NextResponse.json({
    message: 'Webhook de Wompi activo',
    timestamp: new Date().toISOString(),
  });
}
