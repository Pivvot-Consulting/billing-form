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

// Autenticación
export const auth = cache(async (): Promise<string>=>{
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
        cookies().set(CONSTANTS.SIIGO_API_TOKEN_STORAGE_KEY, access_token)
        return access_token

    } catch (error: unknown) {
        const apiError = handleError(error as Error, 'Siigo Authentication');
        console.error('Siigo authentication failed:', apiError);
        throw apiError;
    }
})

// Conexión API para creación de facturas y clientes
export const createBill = cache(async(data: Bill): Promise<unknown>=>{
    try {
        const {name, lastName, address, documentNumber, serviceValue, email, phone, qtyHours = 0, qtyMinutes = 0} = data

        // Validar datos requeridos
        if (!name || !lastName || !email || !address || !phone || !documentNumber || !serviceValue) {
            throw new Error('VALIDATION_ERROR: Faltan datos requeridos para crear la factura');
        }

        console.log('SiigoService: Iniciando creación de factura con datos:', data);

        // Obtener el código de producto correcto según el tiempo seleccionado
        const productCode = getProductCodeByTime(qtyHours, qtyMinutes);
        const productDescription = getServiceDescription(qtyHours, qtyMinutes);
        
        console.log(`Usando producto Siigo - Código: ${productCode}, Descripción: ${productDescription}`);

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
            console.log('Centro de costos incluido:', ENV.SIIGO_COST_CENTER_ID);
        } else {
            console.log('Centro de costos omitido (no configurado o 0)');
        }

        console.log('Datos de factura a enviar:', JSON.stringify(invoiceData, null, 2));

        const response = await postSiigo('v1/invoices', invoiceData);
        
        if (!response?.data) {
            throw new Error('SIIGO_SERVER_ERROR: No se recibió respuesta del servidor');
        }

        console.log('Factura creada exitosamente:', response.data);
        return response.data;

    } catch (error: unknown) {
        // Log detallado del error de Siigo para debugging
        console.error('Error en Siigo Create Bill:', error);
        
        const axiosError = error as AxiosErrorResponse;
        if (axiosError?.response?.data) {
            console.error('Detalles del error de Siigo:', JSON.stringify(axiosError.response.data, null, 2));
            
            // Log específico de errores
            if (axiosError.response.data.Errors) {
                console.error('Errores específicos de Siigo:');
                axiosError.response.data.Errors.forEach((err: SiigoError, index: number) => {
                    console.error(`Error ${index + 1}:`, JSON.stringify(err, null, 2));
                });
            }
        }
        
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