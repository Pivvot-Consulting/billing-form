import React, { useEffect } from "react";
import TimeSelector from "@/components/TimeSelector";

interface ServiceValueProps {
	qtyHours: number;
	qtyMinutes: number;
	serviceValue: number;
	onTimeChange: (hours: number, minutes: number) => void;
	onServiceValueChange: (value: number) => void;
}

export default function ServiceValue({ 
	qtyHours, 
	qtyMinutes, 
	serviceValue,
	onTimeChange, 
	onServiceValueChange 
}: ServiceValueProps) {

	// Calcula el valor del servicio cada vez que cambien las horas o minutos
	useEffect(() => {
		let totalValue = 0;

		if (qtyHours === 0 && qtyMinutes > 0) {
			// Cálculo para menos de 1 hora
			totalValue = (qtyMinutes * 20000) / 30;

		} else {
			// Cálculo para 1 hora o más
			totalValue = qtyHours * 35000 + (qtyMinutes * 35000) / 60;
		}

		const roundedValue = Math.round(totalValue);
		onServiceValueChange(roundedValue); // Notifica al componente padre

	}, [qtyHours, qtyMinutes, onServiceValueChange]);

	const handleTimeSelection = (hours: number, minutes: number) => {
		onTimeChange(hours, minutes);
	};

	return (
		<div>
			{/* Selector de tiempo */}
			<TimeSelector
				qtyHours={qtyHours}
				qtyMinutes={qtyMinutes}
				setQtyHours={(hours) => onTimeChange(hours, qtyMinutes)}
				setQtyMinutes={(minutes) => onTimeChange(qtyHours, minutes)}
				handleTimeSelection={handleTimeSelection}
			/>

			{/* Valor del servicio */}
			<div className="mt-4">
				<p className="text-xl font-bold">Tiempo contratado:</p>
				<p className="text-lg">
					{qtyHours < 10 ? `0${qtyHours}` : qtyHours}:
					{qtyMinutes < 10 ? `0${qtyMinutes}` : qtyMinutes} horas
				</p>
				<p className="text-lg font-semibold mt-2">
					Valor del servicio: ${serviceValue.toLocaleString("es-CO")}
				</p>
			</div>
		</div>
	);
}
