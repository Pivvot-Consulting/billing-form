'use client'
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import FormInput from '@/components/common/FormInput';
import Title from '@/components/common/Title';
import ServiceValue from '@/components/ServiceValue';
import { Button } from '@nextui-org/button';
import { Select, SelectItem } from '@nextui-org/select';
import { NumericFormat } from 'react-number-format';
import { Bill, BillErrors } from '@/interfaces/interfaces';
import { DocumentTypeType } from '@/types/enums';
import { showErrorToast, showLoadingToast, updateLoadingToast } from '@/utils/errorHandler';
import { useSales } from '@/hooks';
import { DOCUMENT_TYPE_OPTIONS, ROUTES } from '@/constants';
import * as SiigoService from '@/services/SiigoService';

export default function CashForm() {
  const router = useRouter();
  const { createSale } = useSales();

  const [formData, setFormData] = useState<Bill>({
    documentType: 'CC',
    qtyHours: 0,
    qtyMinutes: 0,
    serviceValue: 0,
    isExtendedTime: false,
  });

  const [operatorCode, setOperatorCode] = useState('');
  const [errors, setErrors] = useState<BillErrors & { operatorCode?: string }>({});
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');

  // Limpiar errores cuando cambian los valores
  useEffect(() => { setErrors(prev => ({ ...prev, name: undefined })); }, [formData.name]);
  useEffect(() => { setErrors(prev => ({ ...prev, lastName: undefined })); }, [formData.lastName]);
  useEffect(() => { setErrors(prev => ({ ...prev, email: undefined })); }, [formData.email]);
  useEffect(() => { setErrors(prev => ({ ...prev, address: undefined })); }, [formData.address]);
  useEffect(() => { setErrors(prev => ({ ...prev, phone: undefined })); }, [formData.phone]);
  useEffect(() => { setErrors(prev => ({ ...prev, documentType: undefined })); }, [formData.documentType]);
  useEffect(() => { setErrors(prev => ({ ...prev, documentNumber: undefined })); }, [formData.documentNumber]);
  useEffect(() => { setErrors(prev => ({ ...prev, serviceValue: undefined })); }, [formData.serviceValue]);
  useEffect(() => { setErrors(prev => ({ ...prev, operatorCode: undefined })); }, [operatorCode]);

  const validateForm = () => {
    const newErrors: BillErrors & { operatorCode?: string } = {};

    if (!operatorCode || operatorCode.trim().length === 0) {
      newErrors.operatorCode = 'El código del vendedor es requerido';
    }
    if (!formData.name) newErrors.name = 'El nombre es requerido';
    if (!formData.lastName) newErrors.lastName = 'El apellido es requerido';
    if (!formData.email) newErrors.email = 'El correo es requerido';
    if (!formData.address) newErrors.address = 'La dirección es requerida';
    if (!formData.phone) newErrors.phone = 'El número celular es requerido';
    // documentType siempre tiene valor por defecto 'CC', no requiere validación
    if (!formData.documentNumber || formData.documentNumber === 0) {
      newErrors.documentNumber = 'El número de documento es requerido';
    }
    if (!formData.serviceValue || formData.serviceValue === 0) {
      newErrors.serviceValue = 'El valor del servicio es requerido';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setErrors({});
    setResponse('');

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showErrorToast(new Error('Por favor completa todos los campos requeridos'), 'Validación');
      return;
    }

    let loadingToastId: string | null = null;

    try {
      setLoading(true);
      loadingToastId = showLoadingToast('Procesando venta...');

      // 1. Guardar en Supabase
      const saleResult = await createSale(formData, operatorCode.trim(), true);

      // 2. Generar factura en Siigo
      try {
        await SiigoService.createBill(formData);
      } catch (siigoError) {
        console.error('Error al generar factura en Siigo:', siigoError);
        // Continuar aunque falle Siigo
      }

      if (loadingToastId) {
        updateLoadingToast(loadingToastId, '¡Venta registrada exitosamente!', 'success');
      }

      setResponse('Venta registrada satisfactoriamente');
      
      // Limpiar formulario
      setFormData({
        documentType: 'CC',
        qtyHours: 0,
        qtyMinutes: 0,
        serviceValue: 0,
        isExtendedTime: false,
      });
      setOperatorCode('');

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push(ROUTES.CLIENT.METODO_PAGO);
      }, 2000);

    } catch (error) {
      console.error('Error al procesar venta:', error);

      if (loadingToastId) {
        updateLoadingToast(loadingToastId, 'Error al procesar la venta', 'error');
      } else {
        showErrorToast(error, 'Procesar Venta');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Title>Generar Venta - Pago en Efectivo</Title>

      {response && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {response}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Código del Vendedor */}
        <FormInput
          type="text"
          label="Código del Vendedor"
          placeholder="Ingresa el código del vendedor"
          isInvalid={!!errors.operatorCode}
          errorMessage={errors.operatorCode}
          isRequired
          value={operatorCode}
          onChange={(e) => setOperatorCode(e.target.value)}
          className="uppercase"
        />

        <Select
          items={DOCUMENT_TYPE_OPTIONS}
          label="Tipo de documento"
          placeholder="Selecciona una opción"
          variant="underlined"
          isInvalid={!!errors.documentType}
          errorMessage={errors.documentType}
          selectedKeys={[formData.documentType || 'CC']}
          onChange={(event) => {
            const newValue = event.target.value as DocumentTypeType;
            setFormData({ 
              ...formData, 
              documentType: newValue || 'CC' // Fallback a 'CC' si el valor es vacío
            });
          }}
        >
          {(option) => (
            <SelectItem key={option.key}>
              {option.label}
            </SelectItem>
          )}
        </Select>

        <NumericFormat
          customInput={FormInput}
          size="sm"
          type="text"
          label="Número de documento"
          isInvalid={!!errors.documentNumber}
          errorMessage={errors.documentNumber}
          isRequired
          value={formData.documentNumber ?? ''}
          thousandSeparator="."
          decimalSeparator=","
          onValueChange={value => setFormData({ ...formData, documentNumber: value.floatValue })}
          decimalScale={0}
        />

        <FormInput
          type="text"
          label="Nombre"
          isInvalid={!!errors.name}
          errorMessage={errors.name}
          isRequired
          value={formData.name ?? ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <FormInput
          type="text"
          label="Apellido"
          isInvalid={!!errors.lastName}
          errorMessage={errors.lastName}
          isRequired
          value={formData.lastName ?? ''}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
        />

        <FormInput
          type="email"
          label="Correo electrónico"
          isRequired
          isInvalid={!!errors.email}
          errorMessage={errors.email}
          value={formData.email ?? ''}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <FormInput
          type="text"
          label="Dirección"
          isInvalid={!!errors.address}
          errorMessage={errors.address}
          isRequired
          value={formData.address ?? ''}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />

        <FormInput
          type="text"
          label="Número de Celular"
          isInvalid={!!errors.phone}
          errorMessage={errors.phone}
          isRequired
          value={formData.phone ?? ''}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />

        <div className="mt-4">
          <ServiceValue 
            qtyHours={formData.qtyHours || 0}
            qtyMinutes={formData.qtyMinutes || 0}
            serviceValue={formData.serviceValue || 0}
            isExtendedTime={formData.isExtendedTime || false}
            onTimeChange={useCallback((hours: number, minutes: number) => {
              setFormData(prev => ({ 
                ...prev, 
                qtyHours: hours, 
                qtyMinutes: minutes 
              }));
            }, [])}
            onServiceValueChange={useCallback((value: number) => {
              setFormData(prev => ({ 
                ...prev, 
                serviceValue: value 
              }));
            }, [])}
            onExtendedTimeChange={useCallback((isExtended: boolean) => {
              setFormData(prev => ({ 
                ...prev, 
                isExtendedTime: isExtended,
                qtyHours: isExtended ? 2 : 0,
                qtyMinutes: isExtended ? 0 : 0,
                serviceValue: 0
              }));
            }, [])}
          />
        </div>

        <Button
          type="submit"
          color="primary"
          size="lg"
          className="w-full"
          isLoading={loading}
          disabled={loading}
        >
          {loading ? 'Procesando venta...' : 'Registrar Venta'}
        </Button>
      </form>
    </>
  );
}
