/**
 * Hook para gestión de códigos de operador
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { OperatorController } from '@/controllers';
import { OperatorCode } from '@/types/entities/operatorCode.types';

export function useOperatorCode() {
  const [activeCode, setActiveCode] = useState<OperatorCode | null>(null);
  const [allCodes, setAllCodes] = useState<OperatorCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [minutesRemaining, setMinutesRemaining] = useState<number>(0);
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);

  // Cargar código activo al montar
  useEffect(() => {
    loadActiveCode();
  }, []);

  // Actualizar tiempo restante cada minuto
  useEffect(() => {
    if (!activeCode) return;

    const updateRemainingTime = () => {
      const info = calculateTimeInfo(activeCode);
      setMinutesRemaining(info.minutesRemaining);
      setIsExpiringSoon(info.isExpiringSoon);
    };

    updateRemainingTime();
    const interval = setInterval(updateRemainingTime, 60000); // Cada minuto

    return () => clearInterval(interval);
  }, [activeCode]);

  const loadActiveCode = async () => {
    try {
      setLoading(true);
      setError(null);
      const code = await OperatorController.getOrCreateActiveCode();
      setActiveCode(code);
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al cargar código activo');
      console.error('Error al cargar código:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateNewCode = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await OperatorController.handleReplaceCode();
      await loadActiveCode();
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al generar código');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAllCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      const codes = await OperatorController.getAllOperatorCodes();
      setAllCodes(codes);
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al cargar códigos');
      console.error('Error al cargar códigos:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateCode = async (code: string): Promise<boolean> => {
    try {
      return await OperatorController.validateCode(code);
    } catch (err) {
      console.error('Error al validar código:', err);
      return false;
    }
  };

  return {
    activeCode,
    allCodes,
    loading,
    error,
    minutesRemaining,
    isExpiringSoon,
    generateNewCode,
    loadActiveCode,
    loadAllCodes,
    validateCode,
  };
}

// Utilidades privadas
function calculateTimeInfo(code: OperatorCode) {
  const expiresAt = new Date(code.expires_at);
  const now = new Date();
  const minutesRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 60000));
  const isExpiringSoon = minutesRemaining < 5;

  return { minutesRemaining, isExpiringSoon };
}
