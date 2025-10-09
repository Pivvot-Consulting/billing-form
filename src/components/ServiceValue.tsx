'use client'
import React, { useEffect, useState, useMemo, useCallback } from "react";
import TimeSelector from "@/components/TimeSelector";
import { NumericFormat } from 'react-number-format';
import FormInput from '@/components/common/FormInput';

interface ServiceValueProps {
	qtyHours: number;
	qtyMinutes: number;
	serviceValue: number;
	isExtendedTime?: boolean;
	onTimeChange: (hours: number, minutes: number) => void;
	onServiceValueChange: (value: number) => void;
	onExtendedTimeChange?: (isExtended: boolean) => void;
}

const ServiceValue = React.memo(function ServiceValue({ 
	qtyHours, 
	qtyMinutes, 
	serviceValue,
	isExtendedTime = false,
	onTimeChange, 
	onServiceValueChange,
	onExtendedTimeChange
}: ServiceValueProps) {

	const [customValue, setCustomValue] = useState(0);

	// Calcula el valor base usando useMemo (solo para tiempo fijo)
	const baseValue = useMemo(() => {
		if (isExtendedTime) {
			return 0; // En modo extendido no hay valor base fijo
		}
		
		if (qtyHours === 0 && qtyMinutes === 30) {
			return 30000;
		} else if (qtyHours === 1 && qtyMinutes === 60) {
			return 40000;
		} else if (qtyHours === 2 && qtyMinutes === 120) {
			return 80000;
		}
		return 0;
	}, [qtyHours, qtyMinutes, isExtendedTime]);

	// Calcula el valor del servicio
	useEffect(() => {
		if (isExtendedTime) {
			// En modo tiempo extendido, usar el valor personalizado
			onServiceValueChange(customValue);
		} else {
			// En modo tiempo fijo, usar base (sin adicional)
			onServiceValueChange(baseValue);
		}
	}, [isExtendedTime, baseValue, customValue, onServiceValueChange]);

	const handleTimeSelection = useCallback((hours: number, minutes: number) => {
		onTimeChange(hours, minutes);
	}, [onTimeChange]);

	const handleToggleExtendedTime = useCallback(() => {
		const newValue = !isExtendedTime;
		if (onExtendedTimeChange) {
			onExtendedTimeChange(newValue);
		}
		
		// Resetear el valor personalizado cuando cambia el modo
		if (newValue) {
			// Cambió a modo extendido
			setCustomValue(0);
		} else {
			// Cambió a modo fijo
			setCustomValue(0);
		}
	}, [isExtendedTime, onExtendedTimeChange]);

	const handleCustomValueChange = useCallback((value: number) => {
		setCustomValue(value);
	}, []);

	return (
		<div>
			{/* Selector de tiempo */}
			<TimeSelector
				qtyHours={qtyHours}
				qtyMinutes={qtyMinutes}
				isExtendedTime={isExtendedTime}
				handleTimeSelection={handleTimeSelection}
				onToggleExtendedTime={handleToggleExtendedTime}
			/>

			{/* Campo para valor personalizado (solo en modo tiempo extendido) */}
			{isExtendedTime && (
				<div className="mt-4">
					<NumericFormat
						customInput={FormInput}
						type="text"
						prefix='$'
						label='Valor del servicio (tiempo extendido)'
						placeholder='Ingresa el valor del servicio'
						value={customValue ?? 0}
						thousandSeparator
						onValueChange={value => handleCustomValueChange(value.floatValue || 0)}
						decimalScale={0}
					/>
				</div>
			)}

			{/* Valor del servicio */}
			<div className="mt-4">
				{!isExtendedTime && (
					<>
						<p className="text-xl font-bold">Tiempo contratado:</p>
						<p className="text-lg">
							{qtyHours < 10 ? `0${qtyHours}` : qtyHours}:
							{qtyMinutes < 10 ? `0${qtyMinutes}` : qtyMinutes} horas
						</p>
					</>
				)}
				<p className="text-lg font-semibold mt-2">
					Valor total del servicio: ${serviceValue.toLocaleString("es-CO")}
				</p>
			</div>
		</div>
	);
});

export default ServiceValue;
