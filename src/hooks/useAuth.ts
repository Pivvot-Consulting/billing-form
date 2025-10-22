/**
 * Hook para gestión de autenticación
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthController } from '@/controllers';
import { LoginDto } from '@/types/dto/auth.dto';
import { OperatorSession } from '@/types/entities/operator.types';
import { ROUTES } from '@/constants/routes';

export function useAuth() {
  const router = useRouter();
  const [session, setSession] = useState<OperatorSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar sesión al montar
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
      const currentSession = await AuthController.getCurrentOperatorSession();
      setSession(currentSession);
    } catch (err) {
      console.error('Error al verificar sesión:', err);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginDto) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await AuthController.handleLogin(credentials);
      
      const newSession: OperatorSession = {
        operator: {
          id: response.operator.id,
          email: response.operator.email,
          nombre: response.operator.nombre,
          apellido: response.operator.apellido,
          activo: true,
          creado_en: new Date().toISOString(),
          actualizado_en: new Date().toISOString(),
        },
        access_token: response.access_token,
        refresh_token: response.refresh_token,
      };

      setSession(newSession);
      
      // Esperar un momento para que las cookies se establezcan
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Usar window.location para forzar recarga completa y que el middleware vea las cookies
      window.location.href = ROUTES.OPERATOR.DASHBOARD;
      
      return response;
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Error al iniciar sesión';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await AuthController.handleLogout();
      setSession(null);
      router.push(ROUTES.HOME);
    } catch (err: unknown) {
      console.error('Error al cerrar sesión:', err);
      setError((err as Error).message || 'Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const refreshSession = async () => {
    try {
      const response = await AuthController.refreshCurrentSession();
      
      const newSession: OperatorSession = {
        operator: {
          id: response.operator.id,
          email: response.operator.email,
          nombre: response.operator.nombre,
          apellido: response.operator.apellido,
          activo: true,
          creado_en: new Date().toISOString(),
          actualizado_en: new Date().toISOString(),
        },
        access_token: response.access_token,
        refresh_token: response.refresh_token,
      };

      setSession(newSession);
      return response;
    } catch (err) {
      console.error('Error al refrescar sesión:', err);
      throw err;
    }
  };

  return {
    session,
    operator: session?.operator || null,
    isAuthenticated: !!session,
    loading,
    error,
    login,
    logout,
    refreshSession,
    checkSession,
  };
}
