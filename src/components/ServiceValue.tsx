'use client'
import React, { useEffect, useState, useMemo, useCallback } from "react";
import TimeSelector from "@/components/TimeSelector";
import { NumericFormat } from 'react-number-format';
import FormInput from '@/components/common/FormInput';

interface ServiceValueProps {
	qtyHours: number;
	qtyMinutes: number;
	serviceValue: number;
	additionalValue?: number;
	onTimeChange: (hours: number, minutes: number) => void;
	onServiceValueChange: (value: number) => void;
	onAdditionalValueChange?: (value: number) => void;
}

const ServiceValue = React.memo(function ServiceValue({ 
	qtyHours, 
	qtyMinutes, 
	serviceValue,
	additionalValue = 0,
	onTimeChange, 
	onServiceValueChange,
	onAdditionalValueChange
}: ServiceValueProps) {

	const [localAdditionalValue, setLocalAdditionalValue] = useState(additionalValue);

	// Calcula el valor base usando useMemo
	const baseValue = useMemo(() => {
		if (qtyHours === 0 && qtyMinutes === 30) {
			return 30000;
		} else if (qtyHours === 1 && qtyMinutes === 0) {
			return 40000;
		} else if (qtyHours === 2 && qtyMinutes === 0) {
			return 80000;
		}
		return 0;
	}, [qtyHours, qtyMinutes]);

	// Calcula el valor del servicio cada vez que cambien las horas, minutos o valor adicional
	useEffect(() => {
		const totalValue = baseValue + localAdditionalValue;
		onServiceValueChange(totalValue);
	}, [baseValue, localAdditionalValue, onServiceValueChange]);

	const handleTimeSelection = useCallback((hours: number, minutes: number) => {
		onTimeChange(hours, minutes);
	}, [onTimeChange]);

	const handleAdditionalValueChange = useCallback((value: number) => {
		setLocalAdditionalValue(value);
		if (onAdditionalValueChange) {
			onAdditionalValueChange(value);
		}
	}, [onAdditionalValueChange]);

	return (
		<div>
			{/* Selector de tiempo */}
			<TimeSelector
				qtyHours={qtyHours}
				qtyMinutes={qtyMinutes}
				handleTimeSelection={handleTimeSelection}
			/>

			{/* Campo de valor adicional */}
			<div className="mt-4">
				<NumericFormat
					customInput={FormInput}
					type="text"
					prefix='$'
					label='Valor adicional (opcional)'
					value={localAdditionalValue ?? 0}
					thousandSeparator
					onValueChange={value => handleAdditionalValueChange(value.floatValue || 0)}
					decimalScale={0}
				/>
			</div>

			{/* Valor del servicio */}
			<div className="mt-4">
				<p className="text-xl font-bold">Tiempo contratado:</p>
				<p className="text-lg">
					{qtyHours < 10 ? `0${qtyHours}` : qtyHours}:
					{qtyMinutes < 10 ? `0${qtyMinutes}` : qtyMinutes} horas
				</p>
				<p className="text-lg font-semibold mt-2">
					Valor total del servicio: ${serviceValue.toLocaleString("es-CO")}
				</p>
			</div>
		</div>
	);
});

export default ServiceValue;
