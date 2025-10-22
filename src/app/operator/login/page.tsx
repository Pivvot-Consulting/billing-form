'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/common/Container';
import FormInput from '@/components/common/FormInput';
import Title from '@/components/common/Title';
import { Button } from '@nextui-org/button';
import { useAuth } from '@/hooks';
import { showErrorToast, showLoadingToast, updateLoadingToast } from '@/utils/errorHandler';
import { ROUTES } from '@/constants/routes';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'El correo no es válido';
    }
    
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    let loadingToastId: string | null = null;

    try {
      loadingToastId = showLoadingToast('Iniciando sesión...');
      
      await login({ email, password });
      
      if (loadingToastId) {
        updateLoadingToast(loadingToastId, '¡Bienvenido!', 'success');
      }
      
      // El hook de useAuth ya redirige al dashboard
    } catch (error: any) {
      console.error('Error en login:', error);
      
      if (loadingToastId) {
        updateLoadingToast(loadingToastId, 'Credenciales inválidas', 'error');
      } else {
        showErrorToast(error, 'Iniciar Sesión');
      }
    }
  };

  return (
    <main className="h-screen w-screen grid place-items-center px-8">
      <Container className="max-w-md">
        <div className="mb-6">
          <Button
            variant="light"
            onPress={() => router.push(ROUTES.HOME)}
            className="mb-4"
          >
            ← Volver
          </Button>
          <Title>Iniciar Sesión</Title>
          <p className="text-gray-600 mt-2">Panel de Operador</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            type="email"
            label="Correo electrónico"
            placeholder="operador@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isInvalid={!!errors.email}
            errorMessage={errors.email}
            isRequired
            autoComplete="email"
          />

          <FormInput
            type="password"
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isInvalid={!!errors.password}
            errorMessage={errors.password}
            isRequired
            autoComplete="current-password"
          />

          <Button
            type="submit"
            color="primary"
            size="lg"
            className="w-full"
            isLoading={loading}
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>
      </Container>
    </main>
  );
}
