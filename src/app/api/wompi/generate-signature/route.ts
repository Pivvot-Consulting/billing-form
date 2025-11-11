/**
 * API Route para generar la firma de integridad de Wompi
 * Esta firma es necesaria para validar la integridad de la transacción
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * POST /api/wompi/generate-signature
 * Genera la firma de integridad para una transacción de Wompi
 */
export async function POST(request: NextRequest) {
  try {
    const { reference, amountInCents, currency } = await request.json();

    // Validar parámetros
    if (!reference || !amountInCents || !currency) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: reference, amountInCents, currency' },
        { status: 400 }
      );
    }

    // Obtener el secreto de integridad
    const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
    
    if (!integritySecret) {
      console.error('❌ WOMPI_INTEGRITY_SECRET no está configurado');
      return NextResponse.json(
        { error: 'Configuración de Wompi incompleta' },
        { status: 500 }
      );
    }

    // Concatenar valores según documentación de Wompi:
    // "<Referencia><Monto><Moneda><SecretoIntegridad>"
    const concatenatedString = `${reference}${amountInCents}${currency}${integritySecret}`;

    // Generar hash SHA256
    const signature = crypto
      .createHash('sha256')
      .update(concatenatedString)
      .digest('hex');

    console.log('🔐 Firma de integridad generada:', {
      reference,
      amountInCents,
      currency,
      signature,
    });

    return NextResponse.json({
      signature,
      reference,
      amountInCents,
      currency,
    });

  } catch (error) {
    console.error('❌ Error al generar firma de integridad:', error);
    return NextResponse.json(
      { error: 'Error al generar firma de integridad' },
      { status: 500 }
    );
  }
}
