'use server'
import { post, postSiigo } from "./HttpService"
import { cache } from "react"
import { cookies } from "next/headers"
import { Bill } from "@/interfaces/interfaces"
import CONSTANTS from "@/constants/Constants"
import ENV from "@/env/Env"
import { handleError } from '@/utils/errorHandler';
import { getProductCodeByTime, getServiceDescription } from '@/constants/SiigoProductCodes';

interface SiigoError {
    Message: string;
    [key: string]: unknown;
}

interface AxiosErrorResponse {
    response?: {
        status: number;
        data: {
            Status: number;
            Errors?: SiigoError[];
        };
    };
}

// Autenticación - Obtiene un token fresco cada vez
export const auth = async (): Promise<string> => {
    try {        
        if (!ENV.SIIGO_USER_NAME || !ENV.SIIGO_ACCESS_KEY) {
            throw new Error('SIIGO_AUTH_ERROR: Credenciales de Siigo no configuradas');
        }

        const res = await post(`${CONSTANTS.SIIGO_API_BASE_URL}auth`, {
            "username": ENV.SIIGO_USER_NAME,
            "access_key": ENV.SIIGO_ACCESS_KEY
        })

        if (!res?.data?.access_token) {
            throw new Error('SIIGO_AUTH_ERROR: Token de acceso no recibido');
        }

        const access_token = res.data.access_token
        
        cookies().set(CONSTANTS.SIIGO_API_TOKEN_STORAGE_KEY, access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 23 // 23 horas (tokens de Siigo duran 24h)
        })
        
        return access_token

    } catch (error: unknown) {
        const apiError = handleError(error as Error, 'Siigo Authentication');
        console.error('Siigo authentication failed:', apiError);
        throw apiError;
    }
}

// Conexión API para creación de facturas y clientes
export const createBill = cache(async(data: Bill): Promise<unknown>=>{
    try {
        const {name, lastName, address, documentNumber, serviceValue, email, phone, qtyHours = 0, qtyMinutes = 0, isExtendedTime = false} = data

        // Validar datos requeridos
        if (!name || !lastName || !email || !address || !phone || !documentNumber || !serviceValue) {
            throw new Error('VALIDATION_ERROR: Faltan datos requeridos para crear la factura');
        }

        // Obtener el código de producto correcto según el modo seleccionado
        let productCode: string;
        let productDescription: string;
        
        if (isExtendedTime) {
            // Modo tiempo extendido - usar código 003
            productCode = '003';
            productDescription = 'Tiempo Extendido';
        } else {
            // Modo tiempo fijo - usar mapeo según horas y minutos
            productCode = getProductCodeByTime(qtyHours, qtyMinutes);
            productDescription = getServiceDescription(qtyHours, qtyMinutes);
        }

        // Obtener fecha actual
        const currentDate = new Date().toISOString().split('T')[0];

        const invoiceData: Record<string, unknown> = {
            "document": {
                "id": ENV.SIIGO_DOCUMENT_ID // Id del documento de factura
            },
            "date": currentDate,
            "customer": {
                "person_type": "Person",
                "id_type": "13",
                "identification": `${documentNumber}`,
                "branch_office": 0,
                "name": [
                    name,
                    lastName
                ],
                "address": {
                    "address": address,
                    "city": {
                        "country_code": "Co",
                        "country_name": "Colombia",
                        "state_code": "08",
                        "state_name": "ATLÁNTICO",
                        "city_code": "08001",
                        "city_name": "BARRANQUILLA"
                    },
                    "postal_code": "080001"
                },
                "phones": [
                    {
                        "indicative": "57",
                        "number": phone,
                        "extension": ""
                    }
                ],
                "contacts": [
                    {
                        "first_name": name,
                        "last_name": lastName,
                        "email": email
                    }
                ]
            },
            "seller": ENV.SIIGO_SELLER_ID, // Código de usuario creado para facturar
            "stamp": {
                "send": true // Campo para indicar el envío de la factura electrónica
            },
            "mail": {
                "send": true // Campo para indicar el envío de la factura al cliente
            },
            "observations": "Facturación del servicio de transporte en scooter",
            "items": [
                {
                    "code": productCode,
                    "description": productDescription,
                    "quantity": 1,
                    "price": serviceValue,
                    "discount": 0,
                    "taxes": []
                }
            ],
            "payments": [
                {
                    "id": ENV.SIIGO_PAYMENT_ID,
                    "value": serviceValue,
                    "due_date": currentDate
                }
            ],
            "globaldiscounts": []
        };

        // Agregar centro de costos solo si está configurado y es mayor a 0
        if (ENV.SIIGO_COST_CENTER_ID && ENV.SIIGO_COST_CENTER_ID > 0) {
            invoiceData.cost_center = ENV.SIIGO_COST_CENTER_ID;
        }

        const response = await postSiigo('v1/invoices', invoiceData);
        
        if (!response?.data) {
            throw new Error('SIIGO_SERVER_ERROR: No se recibió respuesta del servidor');
        }

        return response.data;

    } catch (error: unknown) {
        const axiosError = error as AxiosErrorResponse;
        
        // Mensaje de error más descriptivo
        let errorMessage = 'Error en la solicitud a Siigo.';
        if (axiosError?.response?.data?.Errors?.[0]?.Message) {
            errorMessage = axiosError.response.data.Errors[0].Message;
        }
        
        const apiError = handleError(error as Error, 'Siigo Create Bill');
        console.error('Error creating bill:', apiError);
        
        // Incluir el mensaje específico de Siigo en el error
        throw new Error(`SIIGO_ERROR: ${errorMessage}`);
    }
})