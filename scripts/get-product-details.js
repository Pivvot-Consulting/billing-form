// Script para obtener los detalles de un producto específico de Siigo
require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

const SIIGO_API_BASE_URL = 'https://api.siigo.com/';
const PRODUCT_CODE = '001'; // Código del producto a consultar

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

async function getProductByCode(token, code) {
    try {
        const response = await axios.get(`${SIIGO_API_BASE_URL}v1/products`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Partner-Id': 'Flotu'
            },
            params: {
                code: code
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error obteniendo producto:', error.response?.data || error.message);
        throw error;
    }
}

async function main() {
    console.log(`Consultando detalles del producto con código: ${PRODUCT_CODE}`);
    console.log('');
    
    try {
        const token = await getSiigoToken();
        console.log('Token obtenido exitosamente');
        console.log('');
        
        const products = await getProductByCode(token, PRODUCT_CODE);
        
        if (products && products.results && products.results.length > 0) {
            const product = products.results[0];
            console.log('DETALLES DEL PRODUCTO:');
            console.log('==================================================');
            console.log(JSON.stringify(product, null, 2));
            console.log('');
            
            if (product.taxes && product.taxes.length > 0) {
                console.log('IMPUESTOS CONFIGURADOS:');
                console.log('==================================================');
                product.taxes.forEach((tax, index) => {
                    console.log(`Impuesto ${index + 1}:`);
                    console.log(`  ID: ${tax.id}`);
                    console.log(`  Nombre: ${tax.name}`);
                    console.log(`  Porcentaje: ${tax.percentage}%`);
                    console.log('');
                });
            } else {
                console.log('Este producto NO tiene impuestos configurados.');
                console.log('');
            }
        } else {
            console.log(`No se encontró el producto con código: ${PRODUCT_CODE}`);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
