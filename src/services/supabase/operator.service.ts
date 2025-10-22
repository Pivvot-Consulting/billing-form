/**
 * Servicio de Operadores
 * Maneja operaciones relacionadas con operadores y sus códigos
 */

import { supabase } from '@/lib/supabase';
import { SUPABASE_TABLES, SUPABASE_RPC, OPERATOR_CODE_CONFIG } from '@/constants/supabase.constants';
import { OperatorCode, GenerateCodeResponse } from '@/types/entities/operatorCode.types';
import { GenerateOperatorCodeDto } from '@/types/dto/sale.dto';

/**
 * Genera un código aleatorio de N dígitos
 */
function generateRandomCode(length: number = 4): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
}

/**
 * Genera un nuevo código para el operador autenticado
 * Intenta usar RPC si existe, sino inserta directamente
 * IMPORTANTE: Desactiva códigos activos existentes antes de crear uno nuevo
 */
export async function generateOperatorCode(
  params?: GenerateOperatorCodeDto
): Promise<GenerateCodeResponse> {
  const codeLength = params?.p_len || OPERATOR_CODE_CONFIG.DEFAULT_LENGTH;
  const expirationMinutes = params?.p_expira_min || OPERATOR_CODE_CONFIG.DEFAULT_EXPIRATION_MINUTES;

  try {
    // Intentar usar RPC primero (el RPC debe manejar la desactivación internamente)
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      SUPABASE_RPC.GENERAR_CODIGO_OPERADOR, 
      {
        p_len: codeLength,
        p_expira_min: expirationMinutes,
      }
    );

    if (!rpcError && rpcData && rpcData.length > 0) {
      return rpcData[0];
    }

    // Si RPC no existe o falla, insertar directamente
    // CRITICAL: Primero desactivar TODOS los códigos con used_at IS NULL
    
    // Desactivar TODOS los códigos no usados (incluso expirados)
    // Esto es necesario porque la constraint única es sobre used_at IS NULL solamente
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error: updateError } = await supabase
        .from(SUPABASE_TABLES.OPERATOR_CODES)
        .update({ used_at: new Date().toISOString() })
        .eq('operator_id', user.id)
        .is('used_at', null);
      
      if (updateError) {
        console.error('Error al desactivar códigos existentes:', updateError);
      }
    }

    // Generar nuevo código
    const newCode = generateRandomCode(codeLength);
    const expiresAt = new Date(Date.now() + expirationMinutes * 60000).toISOString();

    const { data: insertData, error: insertError } = await supabase
      .from(SUPABASE_TABLES.OPERATOR_CODES)
      .insert([{
        code: newCode,
        expires_at: expiresAt,
      }])
      .select('id, code, expires_at')
      .single();

    if (insertError) {
      // Si aún falla por constraint único (race condition), retornar el código existente
      if (insertError.code === '23505') {
        const existingCode = await getActiveOperatorCode();
        if (existingCode) {
          return {
            id: existingCode.id,
            code: existingCode.code,
            expires_at: existingCode.expires_at,
          };
        }
      }
      throw new Error(insertError.message);
    }

    if (!insertData) {
      throw new Error('No se pudo generar el código');
    }

    return insertData;
  } catch (error) {
    console.error('Error al generar código:', error);
    throw error;
  }
}

/**
 * Crea un código manualmente para el operador
 */
export async function createOperatorCode(
  code: string,
  expiresAt: string
): Promise<OperatorCode> {
  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.OPERATOR_CODES)
      .insert([{ code, expires_at: expiresAt }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error al crear código:', error);
    throw error;
  }
}

/**
 * Obtiene todos los códigos del operador autenticado
 */
export async function getOperatorCodes(): Promise<OperatorCode[]> {
  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.OPERATOR_CODES)
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Error al obtener códigos:', error);
    throw error;
  }
}

/**
 * Obtiene el código activo más reciente del operador
 * Un código está activo si: used_at IS NULL AND expires_at > now()
 */
export async function getActiveOperatorCode(): Promise<OperatorCode | null> {
  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.OPERATOR_CODES)
      .select('*')
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error al obtener código activo:', error);
    return null;
  }
}

/**
 * Obtiene o crea un código activo
 * Si no existe código activo o está expirado/usado, genera uno nuevo
 */
export async function getOrCreateActiveCode(): Promise<OperatorCode> {
  try {
    // Buscar código activo
    const activeCode = await getActiveOperatorCode();

    if (activeCode) {
      return activeCode;
    }

    // Si no hay código activo, generar uno nuevo
    const newCodeData = await generateOperatorCode();
    
    // Consultar el código completo recién creado
    const { data: fullCode, error } = await supabase
      .from(SUPABASE_TABLES.OPERATOR_CODES)
      .select('*')
      .eq('id', newCodeData.id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return fullCode;
  } catch (error) {
    console.error('Error en getOrCreateActiveCode:', error);
    throw error;
  }
}

/**
 * Desactiva un código específico marcándolo como usado
 */
export async function deactivateOperatorCode(codeId: number): Promise<void> {
  try {
    const { error } = await supabase
      .from(SUPABASE_TABLES.OPERATOR_CODES)
      .update({ used_at: new Date().toISOString() })
      .eq('id', codeId);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error al desactivar código:', error);
    throw error;
  }
}

/**
 * Valida si un código existe y está activo (no usado y no expirado)
 */
export async function validateOperatorCode(code: string): Promise<boolean> {
  try {
    
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.OPERATOR_CODES)
      .select('id, used_at, expires_at, operator_id')
      .eq('code', code)
      .is('used_at', null)  // No ha sido usado
      .gt('expires_at', new Date().toISOString())  // No ha expirado
      .maybeSingle();

    if (error) {
      console.error('Error en validateOperatorCode:', error);
      return false;
    }

    if (!data) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error al validar código:', error);
    return false;
  }
}
