// Script temporal para obtener los IDs de documentos de Siigo
// Ejecutar: node scripts/get-siigo-documents.js

require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

const SIIGO_API_BASE_URL = 'https://api.siigo.com/';

async function getSiigoToken() {
    try {
        const response = await axios.post(`${SIIGO_API_BASE_URL}auth`, {
            username: process.env.SIIGO_USER_NAME,
            access_key: process.env.SIIGO_ACCESS_KEY
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error obteniendo token:', error.response?.data || error.message);
        throw error;
    }
}

async function getDocuments(token) {
    try {
        const response = await axios.get(`${SIIGO_API_BASE_URL}v1/document-types?type=FV`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Partner-Id': 'Flotu'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error obteniendo documentos:', error.response?.data || error.message);
        throw error;
    }
}

async function getCostCenters(token) {
    try {
        const response = await axios.get(`${SIIGO_API_BASE_URL}v1/cost-centers`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Partner-Id': 'Flotu'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error obteniendo centros de costos:', error.response?.data || error.message);
        throw error;
    }
}

async function getUsers(token) {
    try {
        const response = await axios.get(`${SIIGO_API_BASE_URL}v1/users`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Partner-Id': 'Flotu'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error obteniendo usuarios:', error.response?.data || error.message);
        throw error;
    }
}

async function getPaymentTypes(token) {
    try {
        const response = await axios.get(`${SIIGO_API_BASE_URL}v1/payment-types?document_type=FV`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Partner-Id': 'Flotu'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error obteniendo formas de pago:', error.response?.data || error.message);
        throw error;
    }
}

async function main() {
    console.log('Consultando configuracion de Siigo...');
    console.log('');
    
    try {
        const token = await getSiigoToken();
        console.log('Token obtenido exitosamente');
        console.log('');
        
        // Obtener documentos
        console.log('DOCUMENTOS DE FACTURA:');
        console.log('==================================================');
        const documents = await getDocuments(token);
        if (documents && documents.length > 0) {
            documents.forEach(doc => {
                console.log('ID: ' + doc.id + ' | Nombre: ' + doc.name);
            });
        } else {
            console.log('No se encontraron documentos');
        }
        console.log('');
        
        // Obtener centros de costos
        console.log('CENTROS DE COSTOS:');
        console.log('==================================================');
        const costCenters = await getCostCenters(token);
        if (costCenters && costCenters.results) {
            costCenters.results.forEach(cc => {
                console.log('ID: ' + cc.id + ' | Nombre: ' + cc.name + ' | Activo: ' + cc.active);
            });
        } else {
            console.log('No se encontraron centros de costos');
        }
        console.log('');
        
        // Obtener usuarios
        console.log('USUARIOS/VENDEDORES:');
        console.log('==================================================');
        const users = await getUsers(token);
        if (users && users.results) {
            users.results.forEach(user => {
                console.log('ID: ' + user.id + ' | Nombre: ' + user.first_name + ' ' + user.last_name);
            });
        } else {
            console.log('No se encontraron usuarios');
        }
        console.log('');
        
        // Obtener formas de pago
        console.log('FORMAS DE PAGO:');
        console.log('==================================================');
        const paymentTypes = await getPaymentTypes(token);
        if (paymentTypes && paymentTypes.length > 0) {
            paymentTypes.forEach(pt => {
                console.log('ID: ' + pt.id + ' | Nombre: ' + pt.name);
            });
        } else {
            console.log('No se encontraron formas de pago');
        }
        console.log('');
        
        console.log('Consulta completada');
        console.log('');
        console.log('Actualiza tu .env.local con los IDs correctos.');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
