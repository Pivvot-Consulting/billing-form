'use client'
import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/common/Container';
import Title from '@/components/common/Title';
import { Button } from '@nextui-org/button';
import ServiceValue from '@/components/ServiceValue';
import { generatePaymentUrl, formatCurrency, isWompiResponseUrl, extractStatusFromUrl } from '@/services/WompiService';
import { showErrorToast, showLoadingToast, updateLoadingToast } from '@/utils/errorHandler';
import { ROUTES } from '@/constants';
import FormInput from '@/components/common/FormInput';

export default function PagoVirtualPage() {
  const router = useRouter();
  
  const [qtyHours, setQtyHours] = useState<number>(0);
  const [qtyMinutes, setQtyMinutes] = useState<number>(0);
  const [serviceValue, setServiceValue] = useState<number>(0);
  const [isExtendedTime, setIsExtendedTime] = useState<boolean>(false);
  const [operatorCode, setOperatorCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [codeError, setCodeError] = useState<string>('');

  // Limpiar errores cuando cambia el monto o código
  useEffect(() => {
    setCodeError('');
  }, [operatorCode]);

  useEffect(() => {
    // Aquí puedes agregar validaciones en tiempo real si lo deseas
  }, [serviceValue]);

  const handleTimeChange = useCallback((hours: number, minutes: number) => {
    setQtyHours(hours);
    setQtyMinutes(minutes);
  }, []);

  const handleServiceValueChange = useCallback((value: number) => {
    setServiceValue(value);
  }, []);

  const handleExtendedTimeChange = useCallback((isExtended: boolean) => {
    setIsExtendedTime(isExtended);
  }, []);

  const handlePayment = useCallback(async () => {
    // Validar código de operador
    if (!operatorCode || operatorCode.trim().length === 0) {
      setCodeError('El código de operador es requerido');
      showErrorToast(new Error('Debes ingresar el código del operador'), 'Validación');
      return;
    }

    if (operatorCode.trim().length !== 4) {
      setCodeError('El código debe tener 4 dígitos');
      showErrorToast(new Error('El código debe tener 4 dígitos'), 'Validación');
      return;
    }

    // Validar monto
    if (!serviceValue || serviceValue < 2000) {
      showErrorToast(new Error('El monto mínimo es $2,000 COP'), 'Validación');
      return;
    }

    if (serviceValue > 10000000) {
      showErrorToast(new Error('El monto máximo es $10,000,000 COP'), 'Validación');
      return;
    }

    let loadingToastId: string | null = null;

    try {
      setLoading(true);
      loadingToastId = showLoadingToast('Generando enlace de pago...');

      // Generar URL de pago con código de operador
      const paymentData = await generatePaymentUrl({
        amount: serviceValue,
        redirectUrl: window.location.origin + ROUTES.CLIENT.VIRTUAL,
        operatorCode: operatorCode.trim(),
      });

      setPaymentUrl(paymentData.paymentUrl);
      setReference(paymentData.reference);

      if (loadingToastId) {
        updateLoadingToast(loadingToastId, '¡Enlace generado! Redirigiendo...', 'success');
      }

      // Abrir Wompi en una nueva ventana o iframe
      // Por ahora abrimos en la misma ventana
      window.location.href = paymentData.paymentUrl;

    } catch (error) {
      console.error('Error al generar pago:', error);
      
      if (loadingToastId) {
        updateLoadingToast(loadingToastId, 'Error al generar el enlace de pago', 'error');
      } else {
        showErrorToast(error, 'Generar Pago');
      }
    } finally {
      setLoading(false);
    }
  }, [serviceValue]);

  // Detectar si venimos de una respuesta de Wompi
  useEffect(() => {
    const currentUrl = window.location.href;
    
    if (isWompiResponseUrl(currentUrl)) {
      const status = extractStatusFromUrl(currentUrl);
      
      if (status === 'approved') {
        updateLoadingToast('', '¡Pago aprobado! El operador validará tu transacción.', 'success');
        
        // Limpiar URL
        window.history.replaceState({}, '', ROUTES.CLIENT.VIRTUAL);
        
        // Resetear formulario
        setQtyHours(0);
        setQtyMinutes(0);
        setServiceValue(0);
        setIsExtendedTime(false);
        setOperatorCode('');
        setPaymentUrl('');
        setReference('');
      } else if (status === 'declined') {
        showErrorToast(new Error('El pago fue rechazado. Intenta nuevamente.'), 'Pago Rechazado');
        window.history.replaceState({}, '', ROUTES.CLIENT.VIRTUAL);
      } else if (status === 'error') {
        showErrorToast(new Error('Ocurrió un error en el pago. Intenta nuevamente.'), 'Error en Pago');
        window.history.replaceState({}, '', ROUTES.CLIENT.VIRTUAL);
      }
    }
  }, []);

  return (
    <main className="h-screen w-screen grid place-items-center px-8">
      <Container className="flex flex-col gap-6">
        <div>
          <Button
            variant="light"
            onPress={() => router.push(ROUTES.CLIENT.METODO_PAGO)}
            className="mb-4"
          >
            ← Volver
          </Button>
          <Title>Generar Venta - Pago Virtual</Title>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Una vez realices el pago, el operador validará tu transacción 
            y podrás proceder con el servicio.
          </p>
        </div>

        <div className="space-y-6">
          {/* Campo de código de operador */}
          <FormInput
            type="text"
            label="Código del Vendedor"
            placeholder="Ingresa el código del vendedor"
            isInvalid={!!codeError}
            errorMessage={codeError}
            isRequired
            value={operatorCode}
            onChange={(e) => setOperatorCode(e.target.value.toUpperCase())}
            className="uppercase"
            maxLength={4}
          />

          <ServiceValue
            qtyHours={qtyHours}
            qtyMinutes={qtyMinutes}
            serviceValue={serviceValue}
            isExtendedTime={isExtendedTime}
            onTimeChange={handleTimeChange}
            onServiceValueChange={handleServiceValueChange}
            onExtendedTimeChange={handleExtendedTimeChange}
          />
          {serviceValue > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Total a pagar:</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(serviceValue)}
              </p>
            </div>
          )}

          <Button
            color="secondary"
            size="lg"
            className="w-full"
            onPress={handlePayment}
            isLoading={loading}
            isDisabled={loading || serviceValue === 0 || operatorCode.trim().length !== 4}
          >
            {loading ? 'Generando enlace...' : 'Continuar al Pago'}
          </Button>
        </div>

        {reference && (
          <div className="text-xs text-gray-400 text-center">
            Referencia: {reference}
          </div>
        )}
      </Container>
    </main>
  );
}
