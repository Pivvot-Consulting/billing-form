# Configuración de IDs de Siigo

## Problema Actual

El error `invalid_reference` indica que uno o más de los siguientes IDs no son válidos para tu cuenta de Siigo:

- **Document ID** (ID del tipo de documento de factura)
- **Cost Center ID** (Centro de costos)
- **Seller ID** (Código del vendedor)
- **Payment ID** (Método de pago)

## Pasos para Resolver

### 1. Agregar Variables de Entorno

Abre tu archivo `.env.local` y agrega estas líneas:

```env
SIIGO_DOCUMENT_ID=28010
SIIGO_COST_CENTER_ID=849
SIIGO_SELLER_ID=488
SIIGO_PAYMENT_ID=4366
```

### 2. Verificar los IDs Correctos en Siigo

Necesitas verificar los IDs correctos para tu cuenta de Siigo:

#### **Document ID** (ID del Documento)
- Ir a Siigo → Configuración → Documentos
- Buscar el documento tipo "Factura de Venta"
- Anotar el ID del documento

#### **Cost Center ID** (Centro de Costos)
- Ir a Siigo → Configuración → Centros de Costos
- Buscar "PIVOT MOBILITY S.A.S." o el centro de costos que uses
- Anotar el ID

#### **Seller ID** (Vendedor)
- Ir a Siigo → Configuración → Usuarios o Vendedores
- Buscar el usuario que factura
- Anotar el ID

#### **Payment ID** (Forma de Pago)
- Ir a Siigo → Configuración → Formas de Pago
- Buscar la forma de pago (generalmente "Efectivo" o "Contado")
- Anotar el ID

### 3. Actualizar el .env.local

Una vez tengas los IDs correctos, actualiza tu archivo `.env.local` con los valores correctos:

```env
SIIGO_DOCUMENT_ID=<ID_CORRECTO>
SIIGO_COST_CENTER_ID=<ID_CORRECTO>
SIIGO_SELLER_ID=<ID_CORRECTO>
SIIGO_PAYMENT_ID=<ID_CORRECTO>
```

### 4. Reiniciar el Servidor

```bash
# Detén el servidor con Ctrl+C
# Luego reinicia:
npm run dev
```

### 5. Intentar Facturar Nuevamente

Ahora cuando intentes facturar, la consola mostrará errores más detallados que indican exactamente qué campo está fallando.

## Logging Mejorado

He agregado logging detallado que mostrará:
- El error completo de Siigo
- Cada error específico en el array de errores
- El mensaje descriptivo del error

Cuando vuelvas a intentar, revisa la consola del servidor para ver el mensaje específico de Siigo.

## Ejemplo de Cómo Obtener IDs via API de Siigo

Si tienes acceso a la API, puedes consultar:

```bash
# Documentos
GET https://api.siigo.com/v1/document-types

# Centros de Costos
GET https://api.siigo.com/v1/cost-centers

# Vendedores (Usuarios)
GET https://api.siigo.com/v1/users

# Formas de Pago
GET https://api.siigo.com/v1/payment-types
```
