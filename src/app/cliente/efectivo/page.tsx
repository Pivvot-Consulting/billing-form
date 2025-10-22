'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/common/Container';
import { Button } from '@nextui-org/button';
import { ROUTES } from '@/constants/routes';
import CashForm from './CashForm';

export default function EfectivoPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen w-screen p-8">
      <Container className="max-w-2xl mx-auto">
        <Button
          variant="light"
          onPress={() => router.push(ROUTES.CLIENT.METODO_PAGO)}
          className="mb-4"
        >
          ← Volver
        </Button>
        <CashForm />
      </Container>
    </main>
  );
}
