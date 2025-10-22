'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/common/Container';
import Title from '@/components/common/Title';
import { Button } from '@nextui-org/button';
import { useAuth, useSales } from '@/hooks';
import { useOperatorCodeRealtime } from '@/hooks/useOperatorCodeRealtime';
import { showErrorToast, showLoadingToast, updateLoadingToast } from '@/utils/errorHandler';
import { ROUTES } from '@/constants/routes';
import { CheckCircle2, Clock, XCircle, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { operator, logout, loading: authLoading } = useAuth();
  const { 
    activeCode, 
    minutesRemaining, 
    isExpiringSoon,
    status,
    generateNewCode, 
    loading: codeLoading,
    error: codeError,
  } = useOperatorCodeRealtime();
  const { stats, loadSales, loading: salesLoading } = useSales();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Verificar autenticación
    if (!authLoading && !operator) {
      router.push(ROUTES.OPERATOR.LOGIN);
      return;
    }

    // Cargar datos
    if (operator) {
      loadSales();
    }
  }, [mounted, operator, authLoading, router]);

  const handleGenerateCode = async () => {
    let loadingToastId: string | null = null;
    try {
      loadingToastId = showLoadingToast('Generando nuevo código...');
      await generateNewCode();
      if (loadingToastId) {
        updateLoadingToast(loadingToastId, '¡Código generado exitosamente!', 'success');
      }
    } catch (error) {
      console.error('Error al generar código:', error);
      if (loadingToastId) {
        updateLoadingToast(loadingToastId, 'Error al generar código', 'error');
      } else {
        showErrorToast(error, 'Generar Código');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      showErrorToast(error, 'Cerrar Sesión');
    }
  };

  if (authLoading || !operator) {
    return (
      <main className="h-screen w-screen grid place-items-center">
        <div>Cargando...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-screen p-8">
      <Container className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <Title>Dashboard Operador</Title>
            <p className="text-gray-600 mt-2">
              Bienvenido, {operator.nombre || operator.email}
            </p>
          </div>
          <Button
            color="danger"
            variant="light"
            onPress={handleLogout}
          >
            Cerrar Sesión
          </Button>
        </div>

        {/* Información del Operador */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Información del Operador</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{operator.email}</p>
            </div>
            {operator.telefono && (
              <div>
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="font-medium">{operator.telefono}</p>
              </div>
            )}
          </div>
        </div>

        {/* Código Actual con Estado Visual */}
        <div className={`
          rounded-lg shadow-md p-6 mb-6 text-white transition-all duration-300
          ${status === 'new' ? 'bg-gradient-to-r from-green-500 to-emerald-600 animate-pulse' :
            status === 'used' ? 'bg-gradient-to-r from-gray-500 to-gray-600' :
            status === 'expired' ? 'bg-gradient-to-r from-red-500 to-rose-600' :
            'bg-gradient-to-r from-blue-500 to-purple-600'}
        `}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                Código de Venta Actual
                {status === 'new' && <Sparkles size={20} className="animate-spin" />}
                {status === 'active' && <CheckCircle2 size={20} />}
                {status === 'used' && <XCircle size={20} />}
                {status === 'expired' && <Clock size={20} />}
              </h2>
              <p className="text-white/80 text-sm mt-1">
                {status === 'new' ? '🎉 Nuevo código generado' :
                 status === 'used' ? '✅ Código ya utilizado' :
                 status === 'expired' ? '⏰ Código expirado' :
                 'Comparte este código con tus clientes'}
              </p>
            </div>
            <Button
              color="default"
              variant="solid"
              onPress={handleGenerateCode}
              isLoading={codeLoading}
              disabled={codeLoading || status === 'new'}
              className="bg-white text-blue-600"
            >
              Generar Nuevo
            </Button>
          </div>

          {codeError && (
            <div className="bg-red-500/20 border border-red-300 rounded-lg p-3 mb-4">
              <p className="text-sm">⚠️ {codeError}</p>
            </div>
          )}

          {activeCode ? (
            <div className="mt-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 text-center">
                <p className="text-sm text-white/80 mb-2">Tu código es:</p>
                <p className="text-5xl font-bold tracking-wider mb-3 font-mono">
                  {activeCode.code}
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {status === 'active' && (
                    <>
                      {isExpiringSoon ? (
                        <span className="bg-yellow-500/30 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          <Clock size={14} />
                          ⚠️ Expira en {minutesRemaining} min
                        </span>
                      ) : (
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          <Clock size={14} />
                          Expira en {minutesRemaining} min
                        </span>
                      )}
                    </>
                  )}
                  {status === 'new' && (
                    <span className="bg-green-500/30 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <Sparkles size={14} />
                      Nuevo - Listo para usar
                    </span>
                  )}
                  {status === 'used' && activeCode.used_at && (
                    <span className="bg-gray-500/30 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <CheckCircle2 size={14} />
                      Usado el {new Date(activeCode.used_at).toLocaleString('es-CO')}
                    </span>
                  )}
                  {status === 'expired' && (
                    <span className="bg-red-500/30 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <XCircle size={14} />
                      Expirado
                    </span>
                  )}
                </div>
                
                {/* Info adicional */}
                <div className="mt-4 text-xs text-white/60">
                  <p>Creado: {new Date(activeCode.created_at).toLocaleString('es-CO')}</p>
                  <p>Expira: {new Date(activeCode.expires_at).toLocaleString('es-CO')}</p>
                </div>
              </div>
              
              {/* Indicador de Realtime */}
              <div className="mt-3 text-center">
                <span className="text-xs text-white/60 flex items-center justify-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Actualización automática en tiempo real
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/80 mb-4">No hay código activo</p>
              <Button
                color="default"
                variant="solid"
                onPress={handleGenerateCode}
                isLoading={codeLoading}
                className="bg-white text-blue-600"
              >
                Generar Código
              </Button>
            </div>
          )}
        </div>

        {/* Estadísticas de Ventas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Estadísticas</h2>
          
          {salesLoading ? (
            <p className="text-center text-gray-500">Cargando estadísticas...</p>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Ventas</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalVentas}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Ventas Hoy</p>
                <p className="text-2xl font-bold text-green-600">{stats.ventasHoy}</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Valor Total</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${stats.valorTotal.toLocaleString('es-CO')}
                </p>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Promedio</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${Math.round(stats.promedioVenta).toLocaleString('es-CO')}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">No hay estadísticas disponibles</p>
          )}
        </div>
      </Container>
    </main>
  );
}
