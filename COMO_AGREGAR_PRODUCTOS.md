# Cómo Agregar Más Productos/Tiempos de Servicio

El sistema ahora mapea automáticamente el tiempo seleccionado al código de producto correcto en Siigo.

## 📍 Ubicación del Archivo de Configuración

El mapeo se encuentra en:
```
src/constants/SiigoProductCodes.ts
```

## ✅ Configuración Actual

```typescript
export const SIIGO_SERVICE_TIME_MAPPINGS: ServiceTimeMapping[] = [
    {
        hours: 0,
        minutes: 30,
        productCode: '001',
        description: 'Recorrido de 30 minutos',
        price: 30000
    },
    {
        hours: 1,
        minutes: 0,
        productCode: '002',
        description: 'Recorrido de 1 hora',
        price: 40000
    },
    {
        hours: 2,
        minutes: 0,
        productCode: '002',
        description: 'Recorrido de 2 horas',
        price: 80000
    }
];
```

## 🆕 Cómo Agregar un Nuevo Producto/Tiempo

### Paso 1: Crear el Producto en Siigo

1. Ir a Siigo → Inventario → Productos/Servicios
2. Crear un nuevo producto tipo "Servicio"
3. Asignar un código (ej: `003`)
4. Anotar el código asignado

### Paso 2: Agregar el Botón en TimeSelector

Editar `src/components/TimeSelector.tsx`:

```typescript
const timeOptions = [
    { hours: 0, minutes: 30, label: "1/2 hora", price: "$30.000" },
    { hours: 1, minutes: 0, label: "1 hora", price: "$40.000" },
    { hours: 2, minutes: 0, label: "2 horas", price: "$80.000" },
    // NUEVO - Agregar aquí
    { hours: 3, minutes: 0, label: "3 horas", price: "$120.000" }
];
```

### Paso 3: Agregar el Mapeo en SiigoProductCodes.ts

Editar `src/constants/SiigoProductCodes.ts`:

```typescript
export const SIIGO_SERVICE_TIME_MAPPINGS: ServiceTimeMapping[] = [
    {
        hours: 0,
        minutes: 30,
        productCode: '001',
        description: 'Recorrido de 30 minutos',
        price: 30000
    },
    {
        hours: 1,
        minutes: 0,
        productCode: '002',
        description: 'Recorrido de 1 hora',
        price: 40000
    },
    {
        hours: 2,
        minutes: 0,
        productCode: '002',
        description: 'Recorrido de 2 horas',
        price: 80000
    },
    // NUEVO - Agregar aquí
    {
        hours: 3,
        minutes: 0,
        productCode: '003', // Código del nuevo producto en Siigo
        description: 'Recorrido de 3 horas',
        price: 120000
    }
];
```

### Paso 4: Actualizar ServiceValue.tsx (si es necesario)

Si los valores fijos cambian, editar `src/components/ServiceValue.tsx`:

```typescript
// Valores fijos según el tiempo seleccionado
if (qtyHours === 0 && qtyMinutes === 30) {
    baseValue = 30000;
} else if (qtyHours === 1 && qtyMinutes === 0) {
    baseValue = 40000;
} else if (qtyHours === 2 && qtyMinutes === 0) {
    baseValue = 80000;
} else if (qtyHours === 3 && qtyMinutes === 0) { // NUEVO
    baseValue = 120000;
}
```

### Paso 5: Reiniciar el Servidor

```bash
npm run dev
```

## 🔧 Funciones Disponibles

El archivo `SiigoProductCodes.ts` exporta tres funciones útiles:

### `getProductCodeByTime(hours, minutes)`
Obtiene el código de producto según el tiempo.

```typescript
const code = getProductCodeByTime(1, 0); // Retorna '002'
```

### `getServiceDescription(hours, minutes)`
Obtiene la descripción del servicio según el tiempo.

```typescript
const description = getServiceDescription(0, 30); // Retorna 'Recorrido de 30 minutos'
```

### `getServiceMapping(hours, minutes)`
Obtiene todo el objeto de mapeo.

```typescript
const mapping = getServiceMapping(2, 0);
// Retorna: { hours: 2, minutes: 0, productCode: '002', description: '...', price: 80000 }
```

## 📝 Notas Importantes

1. **Códigos Únicos**: Cada combinación de horas/minutos debe tener un mapeo único
2. **Códigos en Siigo**: Los códigos de producto deben existir en tu cuenta de Siigo
3. **Sincronización**: Mantén sincronizados:
   - Botones en `TimeSelector.tsx`
   - Mapeo en `SiigoProductCodes.ts`
   - Cálculo de valores en `ServiceValue.tsx`
4. **Código por Defecto**: Si no se encuentra un mapeo, se usa el código `'001'` por defecto
