/**
 * Controlador de Ventas
 * Orquesta la lógica de negocio para gestión de ventas
 */

import * as SalesService from '@/services/supabase/sales.service';
import * as OperatorService from '@/services/supabase/operator.service';
import { CreateSaleDto, CreateSaleResponseDto } from '@/types/dto/sale.dto';
import { Bill } from '@/interfaces/interfaces';
import { LEGAL_DOCUMENTS } from '@/constants/form.constants';
import { DocumentTypeType } from '@/types/enums';

/**
 * Crea una venta completa desde el formulario del cliente
 */
export async function handleCreateSaleFromForm(
  formData: Bill,
  operatorCode: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _generateInvoice: boolean = true // Parámetro reservado para uso futuro
): Promise<CreateSaleResponseDto> {
  // Validar código de operador
  const isValidCode = await OperatorService.validateOperatorCode(operatorCode);
  if (!isValidCode) {
    throw new Error('El código de operador es inválido o ha expirado');
  }

  // Validar datos del formulario
  validateSaleFormData(formData);

  // Calcular tiempo de servicio en minutos
  const timeInMinutes = calculateServiceTimeInMinutes(
    formData.qtyHours || 0,
    formData.qtyMinutes || 0
  );

  if (timeInMinutes <= 0) {
    throw new Error('El tiempo de servicio debe ser mayor a 0');
  }

  if (!formData.serviceValue || formData.serviceValue <= 0) {
    throw new Error('El valor del servicio debe ser mayor a 0');
  }

  // Preparar datos para Supabase
  const saleData: CreateSaleDto = {
    p_operator_code: operatorCode,
    p_tipo_documento: formData.documentType as DocumentTypeType,
    p_numero_documento: String(formData.documentNumber),
    p_nombre: formData.name!,
    p_apellido: formData.lastName!,
    p_correo: formData.email!,
    p_direccion: formData.address!,
    p_celular: formData.phone!,
    p_tiempo_servicio_min: timeInMinutes,
    p_valor_total: formData.serviceValue,
    p_acepta_terminos: true,
    p_acepta_privacidad: true,
    p_version_terminos: LEGAL_DOCUMENTS.TERMINOS.VERSION,
    p_version_privacidad: LEGAL_DOCUMENTS.PRIVACIDAD.VERSION,
    p_ip: null,
    p_user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    p_marketing: null,
  };

  try {
    const result = await SalesService.createCompleteSale(saleData);
    return result;
  } catch (error) {
    console.error('Error al crear venta:', error);
    throw new Error('No se pudo registrar la venta. Por favor intenta nuevamente.');
  }
}

/**
 * Obtiene las ventas del operador con estadísticas
 */
export async function getOperatorSalesWithStats() {
  try {
    const [sales, stats] = await Promise.all([
      SalesService.getOperatorSales(),
      SalesService.getOperatorSalesStats(),
    ]);

    return {
      sales,
      stats,
    };
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    throw new Error('No se pudieron obtener las ventas');
  }
}

/**
 * Actualiza el número de factura de una venta
 */
export async function updateInvoiceNumber(
  saleId: number,
  invoiceNumber: string
): Promise<void> {
  if (!invoiceNumber || invoiceNumber.trim().length === 0) {
    throw new Error('El número de factura es requerido');
  }

  try {
    await SalesService.updateSaleInvoice(saleId, invoiceNumber.trim(), 'generada');
  } catch (error) {
    console.error('Error al actualizar número de factura:', error);
    throw new Error('No se pudo actualizar el número de factura');
  }
}

/**
 * Obtiene los detalles completos de una venta
 */
export async function getSaleDetails(saleId: number) {
  try {
    const sale = await SalesService.getSaleById(saleId);
    
    if (!sale) {
      throw new Error('Venta no encontrada');
    }

    return sale;
  } catch (error) {
    console.error('Error al obtener detalles de venta:', error);
    throw error;
  }
}

// Utilidades privadas

function validateSaleFormData(formData: Bill): void {
  const errors: string[] = [];

  if (!formData.name || formData.name.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  }

  if (!formData.lastName || formData.lastName.trim().length < 2) {
    errors.push('El apellido debe tener al menos 2 caracteres');
  }

  if (!formData.email || !isValidEmail(formData.email)) {
    errors.push('El correo electrónico es inválido');
  }

  if (!formData.address || formData.address.trim().length < 5) {
    errors.push('La dirección debe tener al menos 5 caracteres');
  }

  if (!formData.phone || !isValidPhone(formData.phone)) {
    errors.push('El número de teléfono es inválido (debe tener 10 dígitos)');
  }

  if (!formData.documentType) {
    errors.push('El tipo de documento es requerido');
  }

  if (!formData.documentNumber || formData.documentNumber <= 0) {
    errors.push('El número de documento es inválido');
  }

  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

function calculateServiceTimeInMinutes(hours: number, minutes: number): number {
  return (hours * 60) + minutes;
}
