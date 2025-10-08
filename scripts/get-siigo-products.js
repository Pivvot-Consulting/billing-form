// Script para obtener productos/servicios de Siigo
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

async function getProducts(token) {
    try {
        const response = await axios.get(`${SIIGO_API_BASE_URL}v1/products?type=Service`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Partner-Id': 'Flotu'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error obteniendo productos:', error.response?.data || error.message);
        throw error;
    }
}

async function main() {
    console.log('Consultando productos/servicios de Siigo...');
    console.log('');
    
    try {
        const token = await getSiigoToken();
        console.log('Token obtenido exitosamente');
        console.log('');
        
        console.log('PRODUCTOS/SERVICIOS DISPONIBLES:');
        console.log('==================================================');
        const products = await getProducts(token);
        
        if (products && products.results && products.results.length > 0) {
            products.results.forEach(prod => {
                console.log('Codigo: ' + prod.code + ' | Nombre: ' + prod.name + ' | Tipo: ' + prod.type);
            });
        } else {
            console.log('No se encontraron productos/servicios');
            console.log('');
            console.log('NECESITAS CREAR UN PRODUCTO/SERVICIO EN SIIGO:');
            console.log('1. Ve a Siigo -> Inventario -> Productos/Servicios');
            console.log('2. Crea un producto tipo "Servicio"');
            console.log('3. Nombre sugerido: "Servicio de transporte en scooter"');
            console.log('4. Anota el CODIGO que le asignes');
        }
        console.log('');
        
        console.log('Consulta completada');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
