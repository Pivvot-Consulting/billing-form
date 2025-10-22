/**
 * Controlador de Autenticación
 * Orquesta la lógica de negocio para autenticación de operadores
 */

import * as AuthService from '@/services/supabase/auth.service';
import { LoginDto, LoginResponseDto } from '@/types/dto/auth.dto';
import { OperatorSession } from '@/types/entities/operator.types';

/**
 * Maneja el inicio de sesión de un operador
 */
export async function handleLogin(credentials: LoginDto): Promise<LoginResponseDto> {
  // Validaciones de negocio
  if (!credentials.email || !credentials.password) {
    throw new Error('Email y contraseña son requeridos');
  }

  if (!isValidEmail(credentials.email)) {
    throw new Error('El formato del email es inválido');
  }

  if (credentials.password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }

  try {
    const response = await AuthService.login(credentials);
    
    // Aquí podrías agregar lógica adicional como:
    // - Registrar el login en auditoría
    // - Enviar notificación de inicio de sesión
    // - Actualizar última fecha de acceso
    
    return response;
  } catch (error) {
    console.error('Error en handleLogin:', error);
    throw new Error('Credenciales inválidas o error en el servidor');
  }
}

/**
 * Maneja el cierre de sesión de un operador
 */
export async function handleLogout(): Promise<void> {
  try {
    await AuthService.logout();
    
    // Limpiar datos locales si es necesario
    if (typeof window !== 'undefined') {
      localStorage.removeItem('operator_session');
      sessionStorage.clear();
    }
  } catch (error) {
    console.error('Error en handleLogout:', error);
    throw new Error('Error al cerrar sesión');
  }
}

/**
 * Obtiene la sesión actual y valida que esté activa
 */
export async function getCurrentOperatorSession(): Promise<OperatorSession | null> {
  try {
    const session = await AuthService.getCurrentSession();
    
    if (!session) {
      return null;
    }

    // Validar que el operador esté activo
    if (!session.operator.activo) {
      await handleLogout();
      throw new Error('El operador está inactivo');
    }

    return session;
  } catch (error) {
    console.error('Error en getCurrentOperatorSession:', error);
    return null;
  }
}

/**
 * Verifica si hay una sesión válida
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentOperatorSession();
  return session !== null;
}

/**
 * Refresca la sesión actual
 */
export async function refreshCurrentSession(): Promise<LoginResponseDto> {
  try {
    return await AuthService.refreshSession();
  } catch (error) {
    console.error('Error al refrescar sesión:', error);
    throw new Error('No se pudo refrescar la sesión');
  }
}

// Utilidades privadas
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
