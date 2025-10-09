import React from "react";
import { Button } from '@nextui-org/button'

interface TimeSelectorProps {
	qtyHours: number;
	qtyMinutes: number;
	isExtendedTime: boolean;
	handleTimeSelection: (hours: number, minutes: number) => void;
	onToggleExtendedTime: () => void;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({ 
	qtyHours, 
	qtyMinutes, 
	isExtendedTime,
	handleTimeSelection,
	onToggleExtendedTime
}) => {
	// Función para determinar si un botón está seleccionado
	const isSelected = (hours: number, minutes: number) => {
		return !isExtendedTime && qtyHours === hours && qtyMinutes === minutes;
	};

	// Opciones de tiempo fijas con sus valores
	const timeOptions = [
		{ hours: 0, minutes: 30, label: "1/2 hora", price: "$30.000" },
		{ hours: 1, minutes: 60, label: "1 hora", price: "$40.000" },
		{ hours: 2, minutes: 120, label: "2 horas", price: "$80.000" }
	];

	return (
		<div className="space-y-4">
			<p className="text-gray-700 font-medium text-lg">Selecciona el tiempo de servicio:</p>

			{/* Opciones de tiempo fijo (se ocultan en modo tiempo extendido) */}
			{!isExtendedTime && (
				<>
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

					{/* Separador */}
					<div className="flex items-center gap-3 my-4">
						<div className="flex-1 h-px bg-gray-300"></div>
						<span className="text-sm text-gray-500">o</span>
						<div className="flex-1 h-px bg-gray-300"></div>
					</div>
				</>
			)}

			{/* Botón para activar tiempo extendido */}
			<div className="flex justify-center">
				<Button
					variant={isExtendedTime ? "solid" : "bordered"}
					color={isExtendedTime ? "secondary" : "default"}
					onClick={onToggleExtendedTime}
					className="h-auto py-3 px-6"
				>
					<span className="text-md font-bold">⏱️ Tiempo Extendido</span>
				</Button>
			</div>

			{/* Mensaje cuando está en modo tiempo extendido */}
			{isExtendedTime && (
				<div className="text-center p-3 bg-blue-50 rounded-lg mt-2">
					<p className="text-sm text-gray-700">
						📝 <span className="font-semibold">Modo Tiempo Extendido activado</span>
					</p>
					<p className="text-xs text-gray-600 mt-1">
						Ingresa el valor del servicio a continuación.
					</p>
				</div>
			)}
		</div>
	);
};

export default TimeSelector;
