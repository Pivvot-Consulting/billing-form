/**
 * Servicio para integración con Wompi
 * Maneja la generación de URLs de pago sin necesidad de SDK
 */

import { CreateWompiPaymentData, WompiPaymentUrlResponse } from '@/types/entities/wompi.types';

// Variables de entorno
const WOMPI_CHECKOUT_URL = process.env.NEXT_PUBLIC_WOMPI_CHECKOUT_URL || 'https://checkout.wompi.co/p/';
const WOMPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || '';

/**
 * Genera una referencia única para la transacción
 * Formato: pivvot-timestamp-operatorCode
 */
function generateReference(operatorCode?: string): string {
  const timestamp = new Date().getTime();
  if (operatorCode) {
    return `pivvot-${timestamp}-${operatorCode}`;
  }
  return `pivvot-${timestamp}`;
}

/**
 * Valida que el monto esté dentro de los límites permitidos
 */
function validateAmount(amount: number): void {
  const MIN_AMOUNT = 2000; // $2,000 COP
  const MAX_AMOUNT = 10000000; // $10,000,000 COP

  if (amount < MIN_AMOUNT) {
    throw new Error(`El monto mínimo es $${MIN_AMOUNT.toLocaleString('es-CO')} COP`);
  }

  if (amount > MAX_AMOUNT) {
    throw new Error(`El monto máximo es $${MAX_AMOUNT.toLocaleString('es-CO')} COP`);
  }
}

/**
 * Genera la URL de pago de Wompi
 * Esta URL abre el checkout de Wompi donde el usuario completa el pago
 */
export async function generatePaymentUrl(data: CreateWompiPaymentData): Promise<WompiPaymentUrlResponse> {
  // Validar configuración
  if (!WOMPI_PUBLIC_KEY) {
    throw new Error('La llave pública de Wompi no está configurada');
  }

  // Validar monto
  validateAmount(data.amount);

  // Generar referencia única (incluye código de operador si está presente)
  const reference = generateReference(data.operatorCode);

  // Convertir monto a centavos (Wompi trabaja en centavos)
  const amountInCents = Math.round(data.amount * 100);

  // Generar firma de integridad desde el backend
  let signature: string;
  try {
    const response = await fetch('/api/wompi/generate-signature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reference,
        amountInCents,
        currency: 'COP',
      }),
    });

    if (!response.ok) {
      throw new Error('Error al generar firma de integridad');
    }

    const data = await response.json();
    signature = data.signature;
  } catch (error) {
    console.error('Error al generar firma:', error);
    throw new Error('No se pudo generar la firma de integridad');
  }

  // Construir parámetros de la URL
  const params = new URLSearchParams({
    'public-key': WOMPI_PUBLIC_KEY,
    'currency': 'COP',
    'amount-in-cents': amountInCents.toString(),
    'reference': reference,
    'signature:integrity': signature,
  });

  // Agregar email del cliente si está disponible
  if (data.customerEmail) {
    params.append('customer-data:email', data.customerEmail);
  }

  // Agregar URL de redirección si está disponible
  if (data.redirectUrl) {
    params.append('redirect-url', data.redirectUrl);
  }

  // Construir URL completa
  const baseUrl = WOMPI_CHECKOUT_URL.endsWith('/') 
    ? WOMPI_CHECKOUT_URL 
    : `${WOMPI_CHECKOUT_URL}/`;
  
  const paymentUrl = `${baseUrl}?${params.toString()}`;

  return {
    paymentUrl,
    reference,
    amount: data.amount,
    amountInCents,
  };
}

/**
 * Valida si una URL es una respuesta de Wompi
 */
export function isWompiResponseUrl(url: string): boolean {
  return (
    url.includes('response=approved') ||
    url.includes('response=declined') ||
    url.includes('response=error') ||
    url.includes('response=pending')
  );
}

/**
 * Extrae el estado de la respuesta desde la URL
 */
export function extractStatusFromUrl(url: string): string | null {
  const urlObj = new URL(url);
  return urlObj.searchParams.get('response');
}

/**
 * Extrae la referencia desde la URL
 */
export function extractReferenceFromUrl(url: string): string | null {
  const urlObj = new URL(url);
  return urlObj.searchParams.get('reference');
}

/**
 * Formatea un monto en pesos colombianos
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
