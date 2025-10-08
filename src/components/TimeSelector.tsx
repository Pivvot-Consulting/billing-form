import React from "react";
import { Button } from '@nextui-org/button'

interface TimeSelectorProps {
	qtyHours: number;
	qtyMinutes: number;
	handleTimeSelection: (hours: number, minutes: number) => void;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({ qtyHours, qtyMinutes, handleTimeSelection }) => {
	// Función para determinar si un botón está seleccionado
	const isSelected = (hours: number, minutes: number) => {
		return qtyHours === hours && qtyMinutes === minutes;
	};

	// Opciones de tiempo fijas con sus valores
	const timeOptions = [
		{ hours: 0, minutes: 30, label: "1/2 hora", price: "$30.000" },
		{ hours: 1, minutes: 0, label: "1 hora", price: "$40.000" },
		{ hours: 2, minutes: 0, label: "2 horas", price: "$80.000" }
	];

	return (
		<div className="space-y-4">
			<p className="text-gray-700 font-medium text-lg">Selecciona el tiempo de servicio:</p>

			<div className="flex flex-row gap-3 justify-center">
				{timeOptions.map((option) => (
					<Button
						key={`${option.hours}-${option.minutes}`}
						variant={isSelected(option.hours, option.minutes) ? "solid" : "bordered"}
						color={isSelected(option.hours, option.minutes) ? "primary" : "default"}
						onClick={() => handleTimeSelection(option.hours, option.minutes)}
						className="h-auto py-4 flex flex-col items-center gap-2 flex-1"
					>
						<span className="text-lg font-bold">{option.label}</span>
						<span className="text-sm">{option.price}</span>
					</Button>
				))}
			</div>

			{/* Mostrar tiempo seleccionado */}
			{(qtyHours > 0 || qtyMinutes > 0) && (
				<div className="text-center">
					<p className="text-md text-gray-600">
						Tiempo seleccionado: <span className="font-semibold">{qtyHours > 0 ? `${qtyHours} ${qtyHours === 1 ? 'hora' : 'horas'}` : `${qtyMinutes} minutos`}</span>
					</p>
				</div>
			)}
		</div>
	);
};

export default TimeSelector;
