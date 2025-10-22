/**
 * Script para obtener los IDs de impuestos desde Siigo
 * Ejecutar: node scripts/get-siigo-taxes.js
 */

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const SIIGO_API_BASE_URL = 'https://api.siigo.com/';

async function getSiigoToken() {
  try {
    const response = await axios.post(`${SIIGO_API_BASE_URL}auth`, {
      username: process.env.SIIGO_USER_NAME,
      access_key: process.env.SIIGO_ACCESS_KEY
    });

    return response.data.access_token;
  } catch (error) {
    console.error('❌ Error al autenticar con Siigo:', error.response?.data || error.message);
    throw error;
  }
}

async function getTaxes(token) {
  try {
    const response = await axios.get(`${SIIGO_API_BASE_URL}v1/taxes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Partner-Id': 'Flotu'
      }
    });

    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener impuestos:', error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  console.log('🔍 Obteniendo impuestos de Siigo...\n');

  // 1. Autenticar
  console.log('1️⃣ Autenticando...');
  const token = await getSiigoToken();
  console.log('✅ Token obtenido\n');

  // 2. Obtener impuestos
  console.log('2️⃣ Consultando impuestos...');
  const taxes = await getTaxes(token);
  console.log(`✅ Se encontraron ${taxes.length} impuestos\n`);

  // 3. Buscar IVA 19%
  console.log('📊 Impuestos disponibles:\n');
  console.log('═══════════════════════════════════════════════════════');
  
  taxes.forEach((tax, index) => {
    const isIVA19 = tax.percentage === 19 && tax.name?.toLowerCase().includes('iva');
    const marker = isIVA19 ? '⭐' : '  ';
    
    console.log(`${marker} ${index + 1}. ID: ${tax.id}`);
    console.log(`   Nombre: ${tax.name}`);
    console.log(`   Porcentaje: ${tax.percentage}%`);
    console.log(`   Tipo: ${tax.type || 'N/A'}`);
    console.log(`   Activo: ${tax.active !== false ? 'Sí' : 'No'}`);
    console.log('   ─────────────────────────────────────────────────');
  });

  // 4. Mostrar el que probablemente necesitas
  const iva19 = taxes.find(t => t.percentage === 19 && t.name?.toLowerCase().includes('iva'));
  
  if (iva19) {
    console.log('\n🎯 IVA 19% encontrado:');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`   ID: ${iva19.id} ← COPIAR ESTE VALOR`);
    console.log(`   Nombre: ${iva19.name}`);
    console.log(`   Porcentaje: ${iva19.percentage}%`);
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📝 INSTRUCCIONES:');
    console.log('1. Copiar el ID de arriba');
    console.log('2. Abrir: src/utils/taxCalculations.ts');
    console.log('3. Buscar: SIIGO_TAX_IDS');
    console.log(`4. Reemplazar: IVA_19: 13615`);
    console.log(`5. Por: IVA_19: ${iva19.id}\n`);
  } else {
    console.log('\n⚠️  No se encontró un impuesto de IVA 19%');
    console.log('Revisa la lista completa arriba y busca el que corresponda\n');
  }

  // 5. Exportar a JSON para referencia
  const fs = require('fs');
  fs.writeFileSync('siigo-taxes.json', JSON.stringify(taxes, null, 2));
  console.log('💾 Impuestos guardados en: siigo-taxes.json\n');
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
