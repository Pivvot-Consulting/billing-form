'use client'
import React, { useMemo, useState, useCallback } from 'react';
import Container from '@/components/common/Container';
import { Checkbox } from '@nextui-org/checkbox';
import { Link } from '@nextui-org/link';
import { Button } from '@nextui-org/button';
import Title from '@/components/common/Title';
import { useRouter } from 'next/navigation';
import ENV from '@/env/Env';

export default function Page() {

  const router = useRouter()

  // Terms condition
  const [termsAndConditionsAccepted, setTermsAndConditionsAccepted] = useState<boolean>(false)
  const [privacy, setPrivacy] = useState<boolean>(false)

  const disabled = useMemo<boolean>(()=>!(termsAndConditionsAccepted && privacy), [termsAndConditionsAccepted, privacy])

  const handleTermsChange = useCallback((checked: boolean) => {
    setTermsAndConditionsAccepted(checked);
  }, []);

  const handlePrivacyChange = useCallback((checked: boolean) => {
    setPrivacy(checked);
  }, []);

  return (
    <main className={`h-screen w-screen grid place-items-center px-8`}>
      <Container className='flex flex-col gap-6'>
        <Title>Arrendamiento de vehículo eléctrico</Title>
        <Button color='secondary' onPress={()=>router.push(ENV.NEXT_PUBLIC_WOMPI_PAYMENT_URL)} isDisabled={disabled}>Pago virtual</Button>
        <Button color='primary' onPress={()=>router.push('cash')} isDisabled={disabled}>Pago en efectivo</Button>
        <div className='flex flex-col gap-4'>
          <Checkbox 
            color="primary" 
            isSelected={termsAndConditionsAccepted} 
            onValueChange={handleTermsChange} 
            size='md'
            classNames={{
              base: "py-2 cursor-pointer",
              wrapper: "cursor-pointer",
              label: "cursor-pointer text-base"
            }}
          >
            Acepto {' '}
            <Link 
              size='sm' 
              href={'https://share.hsforms.com/1uhXLisvsTA6wNahbec4MTg3uhim'} 
              isExternal 
              showAnchorIcon
              className="inline-flex items-center"
            >
              términos y condiciones
            </Link>
          </Checkbox>
          
          <Checkbox 
            color="primary" 
            isSelected={privacy} 
            onValueChange={handlePrivacyChange} 
            size='md'
            classNames={{
              base: "py-2 cursor-pointer",
              wrapper: "cursor-pointer",
              label: "cursor-pointer text-base"
            }}
          >
            Acepto {' '}
            <Link 
              size='sm' 
              href={'https://share.hsforms.com/1uhXLisvsTA6wNahbec4MTg3uhim'} 
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
