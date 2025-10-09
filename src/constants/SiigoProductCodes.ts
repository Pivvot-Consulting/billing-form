// Mapeo de tiempos de servicio a códigos de productos en Siigo
// Actualiza estos códigos según los productos configurados en tu cuenta de Siigo
// NOTA: Los precios YA incluyen IVA

export interface ServiceTimeMapping {
    hours: number;
    minutes: number;
    productCode: string;
    description: string;
    price: number;
}

export const SIIGO_SERVICE_TIME_MAPPINGS: ServiceTimeMapping[] = [
    {
        hours: 0,
        minutes: 30,
        productCode: '001',
        description: 'Recorrido de 30 minutos',
        price: 30000 // Precio con IVA incluido
    },
    {
        hours: 1,
        minutes: 60,
        productCode: '002',
        description: 'Recorrido de 1 hora',
        price: 40000 // Precio con IVA incluido
    },
    {
        hours: 2,
        minutes: 0,
        productCode: '003', // Usa el mismo código de 1 hora, ajusta si tienes un código específico
        description: 'Tiempo Extendido',
        price: 0 // Precio con IVA incluido
    },
    {
        hours: 2,
        minutes: 120,
        productCode: '004', // Usa el mismo código de 1 hora, ajusta si tienes un código específico
        description: 'Recorrido de 2 hora',
        price: 80000 // Precio con IVA incluido
    }
];

/**
 * Obtiene el código de producto de Siigo según el tiempo de servicio
 * @param hours - Horas del servicio
 * @param minutes - Minutos del servicio
 * @returns El código de producto correspondiente o '001' por defecto
 */
export function getProductCodeByTime(hours: number, minutes: number): string {
    const mapping = SIIGO_SERVICE_TIME_MAPPINGS.find(
        m => m.hours === hours && m.minutes === minutes
    );
    
    return mapping?.productCode ?? '001'; // Código por defecto
}

/**
 * Obtiene la descripción del servicio según el tiempo
 * @param hours - Horas del servicio
 * @param minutes - Minutos del servicio
 * @returns La descripción del servicio
 */
export function getServiceDescription(hours: number, minutes: number): string {
    const mapping = SIIGO_SERVICE_TIME_MAPPINGS.find(
        m => m.hours === hours && m.minutes === minutes
    );
    
    return mapping?.description ?? 'Servicio de transporte en scooter';
}

/**
 * Obtiene toda la información del servicio según el tiempo
 * @param hours - Horas del servicio
 * @param minutes - Minutos del servicio
 * @returns Objeto con toda la información del servicio o undefined
 */
export function getServiceMapping(hours: number, minutes: number): ServiceTimeMapping | undefined {
    return SIIGO_SERVICE_TIME_MAPPINGS.find(
        m => m.hours === hours && m.minutes === minutes
    );
}
