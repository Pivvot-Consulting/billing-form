import React, { useState, useEffect } from "react";
import TimeSelector from "@/components/TimeSelector";

export default function ServiceValue() {
	const [qtyHours, setQtyHours] = useState(0);
	const [qtyMinutes, setQtyMinutes] = useState(0);
	const [serviceValue, setServiceValue] = useState(0);

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

		setServiceValue(Math.round(totalValue)); // Redondea para evitar decimales

	}, [qtyHours, qtyMinutes]);

	return (
		<div>
			{/* Selector de tiempo */}
			<TimeSelector
				qtyHours={qtyHours}
				qtyMinutes={qtyMinutes}
				setQtyHours={setQtyHours}
				setQtyMinutes={setQtyMinutes}

				handleTimeSelection={(hours, minutes) => {
					setQtyHours(hours);
					setQtyMinutes(minutes);
				}}
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
