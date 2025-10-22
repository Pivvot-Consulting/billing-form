/**
 * Controlador de Operador
 * Orquesta la lógica de negocio para gestión de operadores y sus códigos
 */

import * as OperatorService from '@/services/supabase/operator.service';
import { OperatorCode, GenerateCodeResponse } from '@/types/entities/operatorCode.types';
import { OPERATOR_CODE_CONFIG } from '@/constants/supabase.constants';

/**
 * Genera un nuevo código para el operador
 */
export async function handleGenerateCode(
  length?: number,
  expirationMinutes?: number
): Promise<GenerateCodeResponse> {
  // Validaciones
  if (length && (length < OPERATOR_CODE_CONFIG.MIN_LENGTH || length > OPERATOR_CODE_CONFIG.MAX_LENGTH)) {
    throw new Error(`La longitud del código debe estar entre ${OPERATOR_CODE_CONFIG.MIN_LENGTH} y ${OPERATOR_CODE_CONFIG.MAX_LENGTH}`);
  }

  if (expirationMinutes && expirationMinutes < 1) {
    throw new Error('El tiempo de expiración debe ser mayor a 0');
  }

  try {
    const code = await OperatorService.generateOperatorCode({
      p_len: length,
      p_expira_min: expirationMinutes,
    });

    return code;
  } catch (error) {
    console.error('Error al generar código:', error);
    throw new Error('No se pudo generar el código');
  }
}

/**
 * Obtiene el código activo del operador o genera uno nuevo si no existe
 */
export async function getOrCreateActiveCode(): Promise<OperatorCode> {
  try {
    // Buscar código activo
    const activeCode = await OperatorService.getActiveOperatorCode();

    if (activeCode) {
      return activeCode;
    }

    // Si no hay código activo, generar uno nuevo
    const newCode = await handleGenerateCode();
    
    // Obtener el código recién creado
    const codes = await OperatorService.getOperatorCodes();
    const createdCode = codes.find(c => c.code === newCode.code);

    if (!createdCode) {
      throw new Error('Error al obtener el código generado');
    }

    return createdCode;
  } catch (error) {
    console.error('Error en getOrCreateActiveCode:', error);
    throw new Error('No se pudo obtener o crear un código activo');
  }
}

/**
 * Reemplaza el código actual por uno nuevo
 */
export async function handleReplaceCode(): Promise<GenerateCodeResponse> {
  try {
    // Desactivar el código actual si existe
    const activeCode = await OperatorService.getActiveOperatorCode();
    if (activeCode) {
      await OperatorService.deactivateOperatorCode(activeCode.id);
    }

    // Generar nuevo código
    return await handleGenerateCode();
  } catch (error) {
    console.error('Error al reemplazar código:', error);
    throw new Error('No se pudo reemplazar el código');
  }
}

/**
 * Obtiene todos los códigos del operador
 */
export async function getAllOperatorCodes(): Promise<OperatorCode[]> {
  try {
    return await OperatorService.getOperatorCodes();
  } catch (error) {
    console.error('Error al obtener códigos:', error);
    throw new Error('No se pudieron obtener los códigos');
  }
}

/**
 * Valida un código de operador
 */
export async function validateCode(code: string): Promise<boolean> {
  if (!code || code.trim().length === 0) {
    return false;
  }

  try {
    return await OperatorService.validateOperatorCode(code.trim());
  } catch (error) {
    console.error('Error al validar código:', error);
    return false;
  }
}

/**
 * Obtiene información del código activo con tiempo restante
 */
export async function getActiveCodeInfo(): Promise<{
  code: OperatorCode;
  minutesRemaining: number;
  isExpiringSoon: boolean;
} | null> {
  try {
    const activeCode = await OperatorService.getActiveOperatorCode();

    if (!activeCode) {
      return null;
    }

    const expiresAt = new Date(activeCode.expires_at);
    const now = new Date();
    const minutesRemaining = Math.floor((expiresAt.getTime() - now.getTime()) / 60000);
    const isExpiringSoon = minutesRemaining < 5; // Menos de 5 minutos

    return {
      code: activeCode,
      minutesRemaining,
      isExpiringSoon,
    };
  } catch (error) {
    console.error('Error al obtener info de código activo:', error);
    return null;
  }
}
