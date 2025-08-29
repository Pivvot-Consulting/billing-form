'use client'
import React, { useEffect, useState, useCallback } from 'react';
import FormInput from '@/components/common/FormInput'
import Title from '@/components/common/Title';
import Container from '@/components/common/Container';
// import TimeSelector from "@/components/TimeSelector";
import ServiceValue from "@/components/ServiceValue";
import { Button } from '@nextui-org/button'
import { Select, SelectItem } from '@nextui-org/select';
import { NumericFormat } from 'react-number-format'
import { Bill, BillErrors } from '@/interfaces/interfaces';
// import { DocumentTypeType, ServiceTimeType } from '@/types/enumTypes';
import { DocumentTypeType } from '@/types/enumTypes';
import { showErrorToast, showLoadingToast, updateLoadingToast, validateFormData } from '@/utils/errorHandler';

// Services
import * as SiigoService from '../../services/SiigoService'

const select = [
	{ key: 'CC', label: 'Cédula de ciudadanía' }, 
	{ key: 'PP', label: 'Pasaporte' }, 
	{ key: 'NIT', label: 'NIT' }
]

// const selectTime = [
// 	{ key: 'MH', label: 'Media Hora' }, 
// 	{ key: 'HR', label: 'Por Hora' }
// ]

export default function Form() {
	// Estado para los campos del formulario
	// const [formData, setFormData] = useState<Bill>({});
	const [formData, setFormData] = useState<Bill>({
		documentType: 'CC', // Valor por defecto de Tipo de Documento
		// serviceTime: 'MH', // Valor por defecto de Tiempo de Servicio
		qtyHours: 0, 
		qtyMinutes: 0, 
		serviceValue: 0,
	});

	// Estado para los errores de validación
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [errors, setErrors] = useState<BillErrors>({});
	
	// Estado para activar/desactivar el campo qtyService
	// const [qtyDisabled, setQtyDisabled] = useState(true);

	// Estado para la respuesta del servidor
	const [response, setResponse] = useState('');
	const [errorResponse, setErrorResponse] = useState('');
	const [loading, setLoading] = useState<boolean>(false)

	// Optimized handlers with useCallback to prevent unnecessary re-renders
	const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData(prev => ({ ...prev, name: e.target.value }));
	}, []);

	const handleLastNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData(prev => ({ ...prev, lastName: e.target.value }));
	}, []);

	const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData(prev => ({ ...prev, email: e.target.value }));
	}, []);

	const handleAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData(prev => ({ ...prev, address: e.target.value }));
	}, []);

	const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData(prev => ({ ...prev, phone: e.target.value }));
	}, []);

	// Actualiza el valor de `serviceValue` cuando cambian `serviceTime` o `qtyTime` y ajusta automáticamente `qtyTime` si `serviceTime` es 'MH'
	// useEffect(() => {
	// 	const { serviceTime } = formData;
	
	// 	setFormData((prev) => {
	// 		const updatedFormData = { ...prev };
		
	// 		if (serviceTime === 'MH') {
	// 			updatedFormData.qtyTime = 1; // Fija `qtyTime` en 1 si `serviceTime` es 'MH'
	// 			updatedFormData.serviceValue = 1 * 20000; // Calcula el valor directamente
	// 			setQtyDisabled(true);

	// 		} else if (serviceTime === 'HR') {
	// 			updatedFormData.serviceValue = prev.qtyTime * 35000; // Calcula el valor basado en `qtyTime`
	// 			setQtyDisabled(false);
	// 		}
		
	// 		return updatedFormData;
	// 	});
	// }, [formData.serviceTime, formData.qtyTime]);


	// Actualiza el valor de `serviceValue` cuando cambian `serviceTime` o `qtyTime` y ajusta automáticamente `qtyTime` si `serviceTime` es 'MH'
	// useEffect(() => {
	// 	const { serviceTime, qtyTime } = formData;
	// 	let serviceValue = 0;
	
	// 	if (serviceTime === 'MH') {
	// 	  	serviceValue = qtyTime * 20000;

	// 	} else if (serviceTime === 'HR') {
	// 	  	serviceValue = qtyTime * 35000;
	// 	}
	
	// 	setFormData((prev) => ({ ...prev, serviceValue }));

	// }, [formData.serviceTime, formData.qtyTime]);

	// Remove error messages
	useEffect(() => {
		setErrors((array => ({ ...array, name: undefined })))
	}, [formData.name])

	useEffect(() => {
		setErrors((array => ({ ...array, lastName: undefined })))
	}, [formData.lastName])

	useEffect(() => {
		setErrors((array => ({ ...array, address: undefined })))
	}, [formData.address])

	useEffect(() => {
		setErrors((array => ({ ...array, email: undefined })))
	}, [formData.email])

	// useEffect(() => {
	// 	setErrors((array => ({ ...array, address: undefined })))
	// }, [formData.address])

	useEffect(() => {
		setErrors((array => ({ ...array, serviceValue: undefined })))
	}, [formData.serviceValue])

	useEffect(() => {
		setErrors((array => ({ ...array, documentType: undefined })))
	}, [formData.documentType])

	useEffect(() => {
		setErrors((array => ({ ...array, documentNumber: undefined })))
	}, [formData.documentNumber])

	useEffect(() => {
		setErrors((array => ({ ...array, qtyHours: undefined })))
	}, [formData.qtyHours])

	useEffect(() => {
		setErrors((array => ({ ...array, qtyMinutes: undefined })))
	}, [formData.qtyMinutes])

	const clearResponses = useCallback(() => {
		setResponse('')
		setErrorResponse('')
	}, [])


	// Validación simple del formulario
	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.name) newErrors.name = 'El nombre es requerido';
		if (!formData.lastName) newErrors.lastName = 'El apellido es requerido';
		if (!formData.email) newErrors.email = 'El correo es requerido';
		if (!formData.address) newErrors.address = 'La dirección es requerido';
		if (!formData.phone) newErrors.phone = 'El número celular es requerido';
		if (!formData.documentType) newErrors.documentType = 'El tipo de documento es requerido';
		if (!formData.documentNumber || formData.documentNumber === 0) newErrors.documentNumber = 'El numero de documento es requerido';
		// if (!formData.serviceTime) newErrors.serviceTime = 'El tiempo de servicio es requerido';
		if (!formData.qtyHours || formData.qtyHours < 0) newErrors.qtyHours = 'La cantidad de horas no puede ser negativa';
		if (!formData.qtyMinutes || formData.qtyMinutes < 0) newErrors.qtyMinutes = 'La cantidad de horas no puede ser negativa';
		if (!formData.serviceValue || formData.serviceValue === 0) newErrors.serviceValue = 'El valor del servicio es requerido';

		return newErrors;
	};

	// const handleTimeSelection = (hours: number, minutes: number) => {
	// 	// setFormData({ ...formData, qtyTime: minutes / 60, serviceTime: 'HR' });
	// 	setFormData({ ...formData, qtyHours: hours });

	// 	setFormData({ ...formData, qtyMinutes: minutes });
	// };

	// const setQtyHours = (value: number) => {
	// 	setFormData((prev) => ({ ...prev, qtyHours: value }));
	// };

	// const setQtyMinutes = (value: number) => {
	// 	setFormData((prev) => ({ ...prev, qtyMinutes: value }));
	// };

	// Manejo del envío del formulario
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setErrors({});
		clearResponses();

		// Validación con utilidad centralizada
		console.log('FormData antes de validación:', formData);
		console.log('ServiceValue tipo:', typeof formData.serviceValue, 'valor:', formData.serviceValue);
		const validation = validateFormData(formData as Record<string, unknown>);
		
		if (!validation.isValid) {
			validation.errors.forEach(error => showErrorToast(new Error(error), 'Validación'));
			const validationErrors = validateForm();
			setErrors(validationErrors);
			return;
		}

		let loadingToastId: string | null = null;

		try {
			setLoading(true);
			loadingToastId = showLoadingToast('Generando factura...');
			
			console.log('Enviando datos del formulario:', formData);
			
			const result = await SiigoService.createBill(formData);
			console.log('Respuesta de Siigo:', result);
			
			// Actualizar toast de carga a éxito
			if (loadingToastId) {
				updateLoadingToast(loadingToastId, '¡Factura generada exitosamente!', 'success');
			}
			
			setResponse('Factura generada satisfactoriamente');
			setFormData({
				documentType: 'CC',
				qtyHours: 0,
				qtyMinutes: 0,
				serviceValue: 0,
			});

		} catch (error) {
			console.error('Error detallado:', error);
			
			// Actualizar toast de carga a error
			if (loadingToastId) {
				updateLoadingToast(loadingToastId, 'Error al generar la factura', 'error');
			} else {
				showErrorToast(error, 'Crear Factura');
			}
			
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const errorMessage = (error as any)?.message || 'Ocurrió un error al enviar el formulario.';
			setErrorResponse(`Error: ${errorMessage}`);

		} finally {
			setLoading(false);
		}
	};


	return (
		<Container className=''>
			<Title>Generar Factura</Title>

			{response && <p className="text-success mb-4">{response}</p>}

			<form onSubmit={handleSubmit} className="space-y-4 max">
				<Select
					items={select}
					label="Tipo de documento"
					placeholder="Selecciona una opción"
					variant='underlined'
					isInvalid={!!errors.documentType}
					errorMessage={errors.documentType}
					// selectedKeys={formData.documentType ? [formData.documentType] : []}
					selectedKeys={[formData.documentType || 'CC']} // Asegura que siempre haya una opción seleccionada
					onChange={(event) => {
						setFormData({ ...formData, documentType: !!event.target.value ? event.target.value as DocumentTypeType : undefined })
					}}
				>
					{(data: { key: string, label: string }) => (
						<SelectItem key={data.key}>
							{data.label}
						</SelectItem>
					)}
				</Select>
				<NumericFormat
					customInput={FormInput}
					size='sm'
					type="text"
					label='Numero de documento'
					isInvalid={!!errors.documentNumber}
					errorMessage={errors.documentNumber}
					isRequired
					value={formData.documentNumber ?? ''}
					thousandSeparator
					onValueChange={value => setFormData({ ...formData, documentNumber: value.floatValue })}
					decimalScale={0}
				/>
				<FormInput
					type="text"
					label='Nombre'
					isInvalid={!!errors.name}
					errorMessage={errors.name}
					isRequired
					value={formData.name ?? ''}
					onChange={handleNameChange}
				/>
				<FormInput
					type="text"
					label='Apellido'
					isInvalid={!!errors.lastName}
					errorMessage={errors.lastName}
					isRequired
					value={formData.lastName ?? ''}
					onChange={handleLastNameChange}
				/>
				<FormInput
					type="email"
					label='Correo electrónico'
					isRequired
					isInvalid={!!errors.email}
					errorMessage={errors.email}
					value={formData.email ?? ''}
					onChange={handleEmailChange}
				/>
				<FormInput
					type="text"
					label='Dirección'
					isInvalid={!!errors.address}
					errorMessage={errors.address}
					isRequired
					value={formData.address ?? ''}
					onChange={handleAddressChange}
				/>
				<FormInput
					type="text"
					label='Número de Celular'
					isInvalid={!!errors.phone}
					errorMessage={errors.phone}
					isRequired
					value={formData.phone ?? ''}
					onChange={handlePhoneChange}
				/>
				{/* <Select
					items={selectTime}
					label="Tiempo de servicio"
					placeholder="Selecciona una opción"
					variant='underlined'
					isInvalid={!!errors.serviceTime}
					errorMessage={errors.serviceTime}
					// selectedKeys={formData.serviceTime ? [formData.serviceTime] : []}
					selectedKeys={[formData.serviceTime || 'MH']} // Asegura que siempre haya una opción seleccionada
					onChange={(event) => {
						setFormData({ ...formData, serviceTime: !!event.target.value ? event.target.value as ServiceTimeType : undefined })
					}}
				>
					{selectTime.map((data) => (
						<SelectItem key={data.key}>{data.label}</SelectItem>
					))}
				</Select>
				<NumericFormat
					customInput={FormInput}
					type="text"
					label='Cantidad de tiempo'
					isInvalid={!!errors.qtyTime}
					errorMessage={errors.qtyTime}
					isRequired
					value={formData.qtyTime ?? 1}
					thousandSeparator
					// disabled={formData.serviceTime == 'MH'}
					disabled={qtyDisabled}
					onValueChange={value => setFormData({ ...formData, qtyTime: value.floatValue || 1 })}
					decimalScale={0}
				/>
				<NumericFormat
					customInput={FormInput}
					type="text"
					prefix='$'
					label='Valor del servicio'
					isInvalid={!!errors.serviceValue}
					errorMessage={errors.serviceValue}
					disabled
					// isRequired
					value={formData.serviceValue ?? 0}
					thousandSeparator
					onValueChange={value => setFormData({ ...formData, serviceValue: value.floatValue })}
					decimalScale={0}
				/> */}

				{/* Valor del servicio */}
				<div className="mt-4">
					<ServiceValue 
						qtyHours={formData.qtyHours || 0}
						qtyMinutes={formData.qtyMinutes || 0}
						serviceValue={formData.serviceValue || 0}
						onTimeChange={(hours, minutes) => {
							setFormData({ 
								...formData, 
								qtyHours: hours, 
								qtyMinutes: minutes 
							});
						}}
						onServiceValueChange={(value) => {
							setFormData({ 
								...formData, 
								serviceValue: value 
							});
						}}
					/>
				</div>

				{errorResponse && <p className="text-danger mb-4">{errorResponse}</p>}

				<Button
					type="submit"
					color="primary"
					size="lg"
					className="w-full"
					isLoading={loading}
					disabled={loading}
				>
					{loading ? 'Generando factura...' : 'Generar Factura'}
				</Button>

			</form>
		</Container>
	)
}
