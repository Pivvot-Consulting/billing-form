'use server'
import { post, postSiigo } from "./HttpService"
import { cache } from "react"
import { cookies } from "next/headers"
import { Bill } from "@/interfaces/interfaces"
import CONSTANTS from "@/constants/Constants"
import ENV from "@/env/Env"
import { handleError, ApiError } from "@/utils/errorHandler"

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

    } catch (error: any) {
        const apiError = handleError(error, 'Siigo Authentication');
        console.error('Siigo authentication failed:', apiError);
        throw apiError;
    }
})

// Conexión API para creación de facturas y clientes
export const createBill = cache(async(data: Bill): Promise<any>=>{
    try {
        const {name, lastName, address, documentNumber, serviceValue, email, phone} = data

        // Validar datos requeridos
        if (!name || !lastName || !email || !address || !phone || !documentNumber || !serviceValue) {
            throw new Error('VALIDATION_ERROR: Faltan datos requeridos para crear la factura');
        }

        console.log('SiigoService: Iniciando creación de factura con datos:', data);

        // Obtener fecha actual
        const currentDate = new Date().toISOString().split('T')[0];

        const invoiceData = {
            "document": {
                "id": 28010 // Id del documento de factura
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
            "cost_center": 849, // C. de costos: PIVOT MOBILITY S.A.S.
            "seller": 488, // Código de usuario creado para facturar
            "stamp": {
                "send": true // Campo para indicar el envío de la factura electrónica
            },
            "mail": {
                "send": true // Campo para indicar el envío de la factura al cliente
            },
            "observations": "Facturación del servicio de transporte en scooter",
            "items": [
                {
                    "code": "7001",
                    "description": "Servicio de transporte en scooter",
                    "quantity": 1,
                    "price": serviceValue,
                    "discount": 0,
                    "taxes": []
                }
            ],
            "payments": [
                {
                    "id": 4366,
                    "value": serviceValue,
                    "due_date": currentDate
                }
            ],
            "globaldiscounts": []
        };

        const response = await postSiigo('v1/invoices', invoiceData);
        
        if (!response?.data) {
            throw new Error('SIIGO_SERVER_ERROR: No se recibió respuesta del servidor');
        }

        console.log('Factura creada exitosamente:', response.data);
        return response.data;

    } catch (error: any) {
        const apiError = handleError(error, 'Siigo Create Bill');
        console.error('Error creating bill:', apiError);
        throw apiError;
    }
})