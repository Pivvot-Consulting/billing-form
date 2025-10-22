/**
 * Utilidades para cálculo de impuestos (IVA)
 * Flotu Mobility - Pivvot Consulting
 */

/**
 * Tasa de IVA en Colombia (19%)
 */
export const IVA_RATE = 0.19;

/**
 * IDs de impuestos en Siigo
 * Estos valores deben coincidir con los configurados en Siigo
 */
export const SIIGO_TAX_IDS = {
  IVA_19: 2929, // ✅ ID del IVA 19% en Siigo (obtenido de API)
} as const;

/**
 * Interfaz para el resultado del cálculo de impuestos
 */
export interface TaxCalculation {
  basePrice: number;      // Precio sin IVA
  taxAmount: number;      // Monto del IVA
  totalPrice: number;     // Precio total (con IVA)
  taxRate: number;        // Tasa del impuesto (0.19 para 19%)
}

/**
 * Calcula el precio base y el IVA a partir de un precio FINAL (que ya incluye IVA)
 * 
 * Ejemplo:
 * - Usuario paga: $10,000 (precio final con IVA)
 * - Precio base: $8,403
 * - IVA (19%): $1,597
 * 
 * @param finalPrice - Precio final que el usuario paga (CON IVA incluido)
 * @param taxRate - Tasa del impuesto (por defecto 0.19 = 19%)
 * @returns Objeto con precio base, monto de IVA y total
 */
export function calculateTaxFromFinalPrice(
  finalPrice: number,
  taxRate: number = IVA_RATE
): TaxCalculation {
  // Validación
  if (finalPrice < 0) {
    throw new Error('El precio final no puede ser negativo');
  }

  if (taxRate < 0 || taxRate > 1) {
    throw new Error('La tasa de impuesto debe estar entre 0 y 1');
  }

  // Cálculo del precio base (precio sin IVA)
  // Fórmula: Precio Base = Precio Final / (1 + Tasa IVA)
  const basePrice = finalPrice / (1 + taxRate);

  // Cálculo del monto del IVA
  // Fórmula: IVA = Precio Final - Precio Base
  const taxAmount = finalPrice - basePrice;

  return {
    basePrice: Math.round(basePrice * 100) / 100,  // Redondear a 2 decimales
    taxAmount: Math.round(taxAmount * 100) / 100,  // Redondear a 2 decimales
    totalPrice: finalPrice,
    taxRate: taxRate
  };
}

/**
 * Calcula el IVA a partir de un precio BASE (sin IVA)
 * 
 * Ejemplo:
 * - Precio base: $8,403
 * - IVA (19%): $1,597
 * - Total: $10,000
 * 
 * @param basePrice - Precio base sin IVA
 * @param taxRate - Tasa del impuesto (por defecto 0.19 = 19%)
 * @returns Objeto con precio base, monto de IVA y total
 */
export function calculateTaxFromBasePrice(
  basePrice: number,
  taxRate: number = IVA_RATE
): TaxCalculation {
  // Validación
  if (basePrice < 0) {
    throw new Error('El precio base no puede ser negativo');
  }

  if (taxRate < 0 || taxRate > 1) {
    throw new Error('La tasa de impuesto debe estar entre 0 y 1');
  }

  // Cálculo del monto del IVA
  // Fórmula: IVA = Precio Base * Tasa IVA
  const taxAmount = basePrice * taxRate;

  // Cálculo del precio total
  // Fórmula: Total = Precio Base + IVA
  const totalPrice = basePrice + taxAmount;

  return {
    basePrice: basePrice,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100,
    taxRate: taxRate
  };
}

/**
 * Formatea un valor numérico como moneda colombiana (COP)
 * 
 * @param value - Valor a formatear
 * @returns String formateado como "$10,000"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Crea el objeto de impuestos para enviar a Siigo API
 * 
 * @param finalPrice - Precio final que el usuario paga (CON IVA incluido)
 * @returns Array de impuestos en formato Siigo
 */
export function createSiigoTaxObject(finalPrice: number) {
  const calculation = calculateTaxFromFinalPrice(finalPrice);

  return [
    {
      id: SIIGO_TAX_IDS.IVA_19,
      name: "IVA",
      percentage: 19,
      value: calculation.taxAmount
    }
  ];
}

