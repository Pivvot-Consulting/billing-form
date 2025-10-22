/**
 * Servicio de Autenticación con Supabase
 * Maneja login, logout y gestión de sesión de operadores
 */

import { supabase } from '@/lib/supabase';
import { LoginDto, LoginResponseDto } from '@/types/dto/auth.dto';
import { OperatorSession } from '@/types/entities/operator.types';

/**
 * Inicia sesión con email y contraseña
 */
export async function login(credentials: LoginDto): Promise<LoginResponseDto> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error('No se recibieron datos de usuario o sesión');
    }

    return {
      operator: {
        id: data.user.id,
        email: data.user.email!,
        nombre: data.user.user_metadata?.nombre,
        apellido: data.user.user_metadata?.apellido,
      },
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in || 3600,
    };
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
}

/**
 * Cierra la sesión del operador
 */
export async function logout(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error en logout:', error);
    throw error;
  }
}

/**
 * Obtiene la sesión actual del operador
 */
export async function getCurrentSession(): Promise<OperatorSession | null> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw new Error(error.message);
    }

    if (!data.session) {
      return null;
    }

    return {
      operator: {
        id: data.session.user.id,
        email: data.session.user.email!,
        nombre: data.session.user.user_metadata?.nombre,
        apellido: data.session.user.user_metadata?.apellido,
        telefono: data.session.user.user_metadata?.telefono,
        activo: true,
        creado_en: data.session.user.created_at,
        actualizado_en: data.session.user.updated_at || data.session.user.created_at,
      },
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    };
  } catch (error) {
    console.error('Error al obtener sesión:', error);
    return null;
  }
}

/**
 * Refresca el token de sesión
 */
export async function refreshSession(): Promise<LoginResponseDto> {
  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      throw new Error(error.message);
    }

    if (!data.session || !data.user) {
      throw new Error('No se pudo refrescar la sesión');
    }

    return {
      operator: {
        id: data.user.id,
        email: data.user.email!,
        nombre: data.user.user_metadata?.nombre,
        apellido: data.user.user_metadata?.apellido,
      },
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in || 3600,
    };
  } catch (error) {
    console.error('Error al refrescar sesión:', error);
    throw error;
  }
}

/**
 * Verifica si hay una sesión activa
 */
export async function hasActiveSession(): Promise<boolean> {
  const session = await getCurrentSession();
  return session !== null;
}
