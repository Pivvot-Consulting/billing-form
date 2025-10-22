/**
 * Hook para gestión de códigos de operador con suscripción en tiempo real
 * Se suscribe a cambios en operator_codes y regenera automáticamente cuando se usa un código
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { SUPABASE_TABLES } from '@/constants/supabase.constants';
import { OperatorCode, CodeStatus } from '@/types/entities/operatorCode.types';
import * as OperatorService from '@/services/supabase/operator.service';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useOperatorCodeRealtime() {
  const [activeCode, setActiveCode] = useState<OperatorCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<CodeStatus>('active');
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isRegeneratingRef = useRef(false);

  // Calcular estado del código
  const calculateCodeStatus = useCallback((code: OperatorCode | null): CodeStatus => {
    if (!code) return 'active';
    
    if (code.used_at) {
      return 'used';
    }
    
    const expiresAt = new Date(code.expires_at);
    const now = new Date();
    
    if (expiresAt <= now) {
      return 'expired';
    }
    
    // Verificar si es nuevo (creado hace menos de 5 segundos)
    const createdAt = new Date(code.created_at);
    const secondsSinceCreation = (now.getTime() - createdAt.getTime()) / 1000;
    
    if (secondsSinceCreation < 5) {
      return 'new';
    }
    
    return 'active';
  }, []);

  // Cargar o crear código activo
  const loadActiveCode = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const code = await OperatorService.getOrCreateActiveCode();
      setActiveCode(code);
      setStatus(calculateCodeStatus(code));
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Error al cargar código activo';
      setError(errorMessage);
      console.error('Error al cargar código:', err);
    } finally {
      setLoading(false);
    }
  }, [calculateCodeStatus]);

  // Generar nuevo código manualmente
  const generateNewCode = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const newCodeData = await OperatorService.generateOperatorCode();
      
      // Consultar el código completo
      const { data: fullCode, error: fetchError } = await supabase
        .from(SUPABASE_TABLES.OPERATOR_CODES)
        .select('*')
        .eq('id', newCodeData.id)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setActiveCode(fullCode);
      setStatus('new');
      
      // Resetear a 'active' después de 3 segundos
      setTimeout(() => {
        setStatus(calculateCodeStatus(fullCode));
      }, 3000);
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Error al generar código';
      setError(errorMessage);
      console.error('Error al generar código:', err);
    } finally {
      setLoading(false);
    }
  }, [calculateCodeStatus]);

  // Regenerar código automáticamente cuando se usa
  const regenerateCodeAfterUse = useCallback(async () => {
    if (isRegeneratingRef.current) {
      return; // Evitar regeneraciones simultáneas
    }

    isRegeneratingRef.current = true;

    try {
      // Esperar un momento para asegurar que la DB esté actualizada
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verificar nuevamente si ya existe un código activo (por si otra pestaña ya generó uno)
      const existingActive = await OperatorService.getActiveOperatorCode();
      if (existingActive) {
        setActiveCode(existingActive);
        setStatus(calculateCodeStatus(existingActive));
        return;
      }
      
      const newCodeData = await OperatorService.generateOperatorCode();
      
      const { data: fullCode, error: fetchError } = await supabase
        .from(SUPABASE_TABLES.OPERATOR_CODES)
        .select('*')
        .eq('id', newCodeData.id)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setActiveCode(fullCode);
      setStatus('new');
      
      setTimeout(() => {
        setStatus(calculateCodeStatus(fullCode));
      }, 3000);
    } catch (err: unknown) {
      console.error('Error al regenerar código:', err);
      // Intentar recargar en lugar de fallar silenciosamente
      try {
        await loadActiveCode();
      } catch (reloadErr) {
        console.error('Error al recargar código activo:', reloadErr);
        setError('No se pudo regenerar el código automáticamente');
      }
    } finally {
      isRegeneratingRef.current = false;
    }
  }, [calculateCodeStatus, loadActiveCode]);

  // Configurar suscripción en tiempo real
  useEffect(() => {
    // Cargar código inicial
    loadActiveCode();

    // Obtener el usuario actual
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return;
      }

      // Crear canal de suscripción
      const channel = supabase
        .channel('operator-codes-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: SUPABASE_TABLES.OPERATOR_CODES,
            filter: `operator_id=eq.${user.id}`,
          },
          (payload) => {
            const updatedCode = payload.new as OperatorCode;
            
            // Si el código fue usado (used_at cambió de null a una fecha)
            if (updatedCode.used_at && !payload.old.used_at) {
              regenerateCodeAfterUse();
            } else {
              // Actualizar el estado actual
              setActiveCode(updatedCode);
              setStatus(calculateCodeStatus(updatedCode));
            }
          }
        )
        .subscribe();

      channelRef.current = channel;
    };

    setupRealtimeSubscription();

    // Cleanup
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [loadActiveCode, regenerateCodeAfterUse, calculateCodeStatus]);

  // Calcular minutos restantes
  const minutesRemaining = activeCode
    ? Math.max(0, Math.floor((new Date(activeCode.expires_at).getTime() - Date.now()) / 60000))
    : 0;

  const isExpiringSoon = minutesRemaining < 5 && minutesRemaining > 0;

  return {
    activeCode,
    loading,
    error,
    status,
    minutesRemaining,
    isExpiringSoon,
    generateNewCode,
    refreshCode: loadActiveCode,
  };
}
