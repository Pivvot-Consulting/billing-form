'use client'
import React, { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/common/Container';
import Title from '@/components/common/Title';
import { Button } from '@nextui-org/button';
import { Checkbox } from '@nextui-org/checkbox';
import { Link } from '@nextui-org/link';
import { ROUTES, LEGAL_DOCUMENTS } from '@/constants';

export default function MetodoPagoPage() {
  const router = useRouter();
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const canContinue = useMemo(
    () => termsAccepted && privacyAccepted, 
    [termsAccepted, privacyAccepted]
  );

  const handleTermsChange = useCallback((checked: boolean) => {
    setTermsAccepted(checked);
  }, []);

  const handlePrivacyChange = useCallback((checked: boolean) => {
    setPrivacyAccepted(checked);
  }, []);

  return (
    <main className="h-screen w-screen grid place-items-center px-8">
      <Container className="flex flex-col gap-6">
        <div>
          <Button
            variant="light"
            onPress={() => router.push(ROUTES.HOME)}
            className="mb-4"
          >
            ← Volver
          </Button>
          <Title>Arrendamiento de vehículo eléctrico</Title>
          <p className="text-gray-600 mt-2">Selecciona tu método de pago</p>
        </div>

        <div className="flex flex-col gap-4">
          <Button 
            color="secondary" 
            size="lg"
            className="w-full"
            onPress={() => router.push(ROUTES.EXTERNAL.WOMPI)}
            isDisabled={!canContinue}
          >
            Pago Virtual
          </Button>

          <Button 
            color="primary" 
            size="lg"
            className="w-full"
            onPress={() => router.push(ROUTES.CLIENT.EFECTIVO)}
            isDisabled={!canContinue}
          >
            Pago en Estación
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          <Checkbox 
            color="primary" 
            isSelected={termsAccepted} 
            onValueChange={handleTermsChange} 
            size="md"
            classNames={{
              base: "py-2 cursor-pointer",
              wrapper: "cursor-pointer",
              label: "cursor-pointer text-base"
            }}
          >
            Acepto {' '}
            <Link 
              size="sm" 
              href={LEGAL_DOCUMENTS.TERMINOS.URL} 
              isExternal 
              showAnchorIcon
              className="inline-flex items-center"
            >
              términos y condiciones
            </Link>
          </Checkbox>
          
          <Checkbox 
            color="primary" 
            isSelected={privacyAccepted} 
            onValueChange={handlePrivacyChange} 
            size="md"
            classNames={{
              base: "py-2 cursor-pointer",
              wrapper: "cursor-pointer",
              label: "cursor-pointer text-base"
            }}
          >
            Acepto {' '}
            <Link 
              size="sm" 
              href={LEGAL_DOCUMENTS.PRIVACIDAD.URL} 
              isExternal 
              showAnchorIcon
              className="inline-flex items-center"
            >
              política de privacidad y protección de datos personales
            </Link>
          </Checkbox>
        </div>
      </Container>
    </main>
  );
}
