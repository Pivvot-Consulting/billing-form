import React, { useState, useEffect } from "react";
import { Button } from '@nextui-org/button'

interface TimeSelectorProps {
	qtyHours: number;
	qtyMinutes: number;

	setQtyHours: (value: number) => void;
	setQtyMinutes: (value: number) => void;

	handleTimeSelection: (hours: number, minutes: number) => void;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({ qtyHours, setQtyHours, qtyMinutes, setQtyMinutes, handleTimeSelection, }) => {
	const [formattedTime, setFormattedTime] = useState<string>("00:00");

	// Actualiza el tiempo formateado cada vez que cambian las horas o minutos
	useEffect(() => {
		const hours = qtyHours < 10 ? `0${qtyHours}` : `${qtyHours}`;
		const minutes = qtyMinutes < 10 ? `0${qtyMinutes}` : `${qtyMinutes}`;

		setFormattedTime(`${hours}:${minutes}`);

	}, [qtyHours, qtyMinutes]);

	const increaseTime = () => {
		let newMinutes = qtyMinutes + 15;
		let newHours = qtyHours;

		if (newMinutes >= 60) {
			newMinutes = newMinutes - 60;
			newHours = newHours + 1;
		}

		setQtyHours(newHours);
		setQtyMinutes(newMinutes);
	};

	const decreaseTime = () => {
		let newMinutes = qtyMinutes - 15;
		let newHours = qtyHours;

		if (newMinutes < 0) {
			if (newHours > 0) {
				newMinutes = 60 + newMinutes; // Ajusta minutos
				newHours = newHours - 1; // Resta una hora
			} else {
				newMinutes = 0; // Evita valores negativos
			}
		}

		setQtyHours(newHours);
		setQtyMinutes(newMinutes);
	};

	return (
		<div className="space-y-2">
			<p className="text-gray-700 font-medium">¿Cuánto tiempo?</p>

			<div className="flex gap-2">
				<Button variant="flat" onClick={() => handleTimeSelection(1, 0)} className="flex-1 bg-gray-200">1 hora</Button>

				<Button variant="flat" onClick={() => handleTimeSelection(0, 45)} className="flex-1 bg-gray-200">45 min</Button>

				<Button variant="flat" onClick={() => handleTimeSelection(0, 30)} className="flex-1 bg-gray-200">30 min</Button>

				<Button variant="flat" onClick={() => handleTimeSelection(0, 15)} className="flex-1 bg-gray-200">15 min</Button>
			</div>

			{/* Ajuste manual de tiempo */}
			<div className="flex items-center justify-between mt-2">
				<Button isDisabled={qtyHours <= 0 && qtyMinutes <= 0} onClick={decreaseTime} className="w-10 h-10">-</Button>
				<p className="text-lg font-semibold">{formattedTime}</p>
				<Button onClick={increaseTime} className="w-10 h-10">+</Button>
			</div>
		</div>
	);
};

export default TimeSelector;
