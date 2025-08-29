# Documentación Técnica - Sistema de Facturación para Arrendamiento de Vehículos Eléctricos

## Índice
1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Funcionalidades Principales](#funcionalidades-principales)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Componentes Clave](#componentes-clave)
6. [Servicios e Integraciones](#servicios-e-integraciones)
7. [Flujo de Datos](#flujo-de-datos)
8. [Guía de Implementación](#guía-de-implementación)
9. [Configuración de Entorno](#configuración-de-entorno)
10. [API y Endpoints](#api-y-endpoints)

---

## Descripción General

**Billing Form** es una aplicación web desarrollada en **Next.js 14** con **TypeScript** que permite gestionar la facturación electrónica para servicios de arrendamiento de vehículos eléctricos (scooters). La aplicación se integra con la API de **Siigo** para la generación automática de facturas electrónicas y con **Wompi** para procesamiento de pagos virtuales.

### Propósito
- Automatizar el proceso de facturación para servicios de transporte en scooters eléctricos
- Proporcionar múltiples opciones de pago (virtual y efectivo)
- Integrar con sistemas contables mediante Siigo
- Calcular automáticamente tarifas basadas en tiempo de servicio

### Tecnologías Utilizadas
- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Framework**: NextUI, Tailwind CSS
- **Animaciones**: Framer Motion
- **HTTP Client**: Axios
- **Validación**: React Number Format
- **Autenticación**: JWT Decode
- **Fechas**: date-fns

---

## Arquitectura del Sistema

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Next.js API    │    │   Servicios     │
│   (React/TSX)   │◄──►│   Routes         │◄──►│   Externos      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        ├─ Siigo API
         │                        │                        ├─ Wompi
         │                        │                        └─ JWT Service
         │                        │
         ▼                        ▼
┌─────────────────┐    ┌──────────────────┐
│   Componentes   │    │   Servicios      │
│   UI            │    │   Internos       │
└─────────────────┘    └──────────────────┘
```

### Patrón de Arquitectura
- **Arquitectura por Capas**: Separación clara entre presentación, lógica de negocio y servicios
- **Server-Side Rendering (SSR)**: Utiliza Next.js App Router para renderizado del lado del servidor
- **Composición de Componentes**: Componentes reutilizables y modulares
- **Servicios Centralizados**: Lógica de API centralizada en servicios dedicados

---

## Funcionalidades Principales

### 1. **Página de Inicio** (`/`)
- **Propósito**: Punto de entrada con selección de método de pago
- **Características**:
  - Checkbox para aceptar términos y condiciones
  - Checkbox para política de privacidad
  - Botón para pago virtual (redirige a Wompi)
  - Botón para pago en efectivo (redirige al formulario)
  - Validación de aceptación de términos antes de habilitar botones

### 2. **Formulario de Facturación** (`/cash`)
- **Propósito**: Captura de datos del cliente y generación de factura
- **Características**:
  - Formulario completo de datos del cliente
  - Selector de tiempo de servicio con cálculo automático de precio
  - Validación en tiempo real de campos
  - Integración con API de Siigo para facturación
  - Manejo de estados de carga y errores

### 3. **Cálculo Dinámico de Precios**
- **Lógica de Tarifas**:
  - **Menos de 1 hora**: $20,000 por cada 30 minutos
  - **1 hora o más**: $35,000 por hora + proporcional por minutos adicionales
- **Actualización en Tiempo Real**: El precio se recalcula automáticamente al cambiar el tiempo

---

## Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── cash/              # Ruta para pago en efectivo
│   │   ├── page.tsx       # Página principal de efectivo
│   │   └── Form.tsx       # Formulario de facturación
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página de inicio
│   └── globals.css        # Estilos globales
├── components/            # Componentes reutilizables
│   ├── common/           # Componentes comunes
│   ├── ServiceValue.tsx  # Calculadora de valor del servicio
│   └── TimeSelector.tsx  # Selector de tiempo
├── services/             # Servicios de API
│   ├── HttpService.ts    # Cliente HTTP configurado
│   ├── SiigoService.ts   # Integración con Siigo
│   ├── JwtService.ts     # Manejo de JWT
│   └── utilService.ts    # Utilidades
├── interfaces/           # Definiciones de tipos
├── constants/           # Constantes de la aplicación
├── env/                # Configuración de entorno
├── types/              # Tipos TypeScript
└── enums/              # Enumeraciones
```

---

## Componentes Clave

### 1. **ServiceValue.tsx**
```typescript
// Calcula automáticamente el valor del servicio
const ServiceValue = () => {
  const [serviceValue, setServiceValue] = useState(0);
  
  useEffect(() => {
    let totalValue = 0;
    if (qtyHours === 0 && qtyMinutes > 0) {
      // Menos de 1 hora: $20,000 por 30 min
      totalValue = (qtyMinutes * 20000) / 30;
    } else {
      // 1 hora o más: $35,000/hora
      totalValue = qtyHours * 35000 + (qtyMinutes * 35000) / 60;
    }
    setServiceValue(Math.round(totalValue));
  }, [qtyHours, qtyMinutes]);
};
```

### 2. **TimeSelector.tsx**
```typescript
// Selector de tiempo con botones predefinidos y ajuste manual
const TimeSelector = ({ qtyHours, setQtyHours, qtyMinutes, setQtyMinutes }) => {
  // Botones rápidos: 1 hora, 45 min, 30 min, 15 min
  // Controles +/- para ajuste fino en incrementos de 15 min
};
```

### 3. **Form.tsx**
```typescript
// Formulario principal con validación y envío
const Form = () => {
  const [formData, setFormData] = useState<Bill>({
    documentType: 'CC',
    qtyHours: 0,
    qtyMinutes: 0,
    serviceValue: 0,
  });
  
  const handleSubmit = async (e) => {
    // Validación + envío a Siigo
    await SiigoService.createBill(formData);
  };
};
```

---

## Servicios e Integraciones

### 1. **SiigoService.ts**
**Propósito**: Integración con la API de Siigo para facturación electrónica

```typescript
// Autenticación con Siigo
export const auth = async (): Promise<string> => {
  const res = await post(`${CONSTANTS.SIIGO_API_BASE_URL}auth`, {
    "username": ENV.SIIGO_USER_NAME,
    "access_key": ENV.SIIGO_ACCESS_KEY
  });
  return res.data.access_token;
};

// Creación de factura
export const createBill = async (data: Bill) => {
  return postSiigo('v1/invoices', {
    "document": { "id": 28010 },
    "date": "2024-11-20",
    "customer": {
      "person_type": "Person",
      "id_type": "13",
      "identification": `${documentNumber}`,
      // ... datos del cliente
    },
    "items": [{
      "code": "7001",
      "description": "Servicio de transporte en scooter",
      "quantity": 1,
      "price": serviceValue
    }]
  });
};
```

### 2. **HttpService.ts**
**Propósito**: Cliente HTTP centralizado con interceptores

```typescript
// Interceptor para Siigo con autenticación automática
siigoInstance.interceptors.request.use(async (config) => {
  const token = await cookies().get(Constants.SIIGO_API_TOKEN_STORAGE_KEY)?.value;
  config.headers['Authorization'] = `Bearer ${token}`;
  config.headers['Partner-Id'] = `Flotu`;
  return config;
});
```

### 3. **Integración con Wompi**
- **Pago Virtual**: Redirección directa a URL de Wompi configurada en variables de entorno
- **Variable**: `NEXT_PUBLIC_WOMPI_PAYMENT_URL`

---

## Flujo de Datos

### 1. **Flujo de Pago en Efectivo**
```
Usuario → Página Inicio → Acepta Términos → Selecciona "Pago Efectivo" 
    ↓
Formulario → Completa Datos → Selecciona Tiempo → Calcula Precio
    ↓
Validación → Envío a Siigo → Generación Factura → Confirmación
```

### 2. **Flujo de Pago Virtual**
```
Usuario → Página Inicio → Acepta Términos → Selecciona "Pago Virtual"
    ↓
Redirección a Wompi → Procesamiento Externo
```

### 3. **Cálculo de Precios**
```
Cambio en Tiempo → useEffect → Recálculo Automático → Actualización UI
```

---

## Guía de Implementación

### Prerrequisitos
- **Node.js**: v20.13.1 (especificado en engines)
- **npm/yarn/pnpm**: Gestor de paquetes
- **Docker**: Para despliegue containerizado
- **Cuenta Siigo**: Para facturación electrónica
- **Cuenta Wompi**: Para pagos virtuales

### Instalación Tradicional

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd billing-form
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

5. **Construir para producción**
```bash
npm run build
npm start
```

### Despliegue con Docker

#### Desarrollo con Docker
```bash
# Construir y ejecutar con docker-compose
docker-compose up --build

# Ejecutar en segundo plano
docker-compose up -d

# Ver logs
docker-compose logs -f billing-form

# Detener servicios
docker-compose down
```

#### Producción con Docker
```bash
# Usar configuración de producción
docker-compose -f docker-compose.prod.yml up -d

# Con Nginx reverse proxy
docker-compose -f docker-compose.prod.yml up -d nginx billing-form
```

#### Comandos Docker Individuales
```bash
# Construir imagen
docker build -t billing-form:latest .

# Ejecutar contenedor
docker run -d \
  --name billing-form-app \
  -p 3000:3000 \
  --env-file .env.local \
  billing-form:latest

# Ver logs del contenedor
docker logs -f billing-form-app

# Detener y eliminar contenedor
docker stop billing-form-app
docker rm billing-form-app
```

---

## Configuración de Entorno

### Variables de Entorno Requeridas

```env
# Siigo API Configuration
SIIGO_USER_NAME=tu_usuario_siigo
SIIGO_ACCESS_KEY=tu_access_key_siigo

# Wompi Configuration
NEXT_PUBLIC_WOMPI_PAYMENT_URL=https://checkout.wompi.co/p/tu_enlace_de_pago

# Environment
NODE_ENV=development
```

### Configuración de Siigo
1. **Crear cuenta en Siigo**
2. **Obtener credenciales API**
3. **Configurar documento de factura** (ID: 28010)
4. **Configurar centro de costos** (ID: 849)
5. **Configurar vendedor** (ID: 488)

### Configuración de Wompi
1. **Crear cuenta en Wompi**
2. **Generar enlace de pago**
3. **Configurar webhook** (opcional)

---

## API y Endpoints

### Endpoints Internos (Next.js API Routes)
Actualmente no hay API routes definidas, toda la lógica se maneja en server actions.

### Integraciones Externas

#### Siigo API
- **Base URL**: `https://api.siigo.com/`
- **Autenticación**: `POST /auth`
- **Crear Factura**: `POST /v1/invoices`

#### Wompi
- **Redirección directa** a checkout configurado

---

## Consideraciones de Seguridad

1. **Variables de Entorno**: Credenciales sensibles en `.env.local`
2. **Server Actions**: Lógica sensible ejecutada en el servidor
3. **Validación**: Validación tanto en cliente como servidor
4. **JWT**: Manejo seguro de tokens de autenticación
5. **HTTPS**: Requerido para producción

---

## Mantenimiento y Escalabilidad

### Mejoras Sugeridas
1. **Base de Datos**: Implementar persistencia local
2. **Logging**: Sistema de logs estructurado
3. **Testing**: Tests unitarios y de integración
4. **Monitoring**: Métricas y alertas
5. **Cache**: Implementar cache para tokens
6. **Webhooks**: Manejo de respuestas de Wompi

### Escalabilidad
- **Microservicios**: Separar servicios por dominio
- **Queue System**: Para procesamiento asíncrono
- **Load Balancing**: Para alta disponibilidad
- **CDN**: Para assets estáticos

---

## Arquitectura Docker

### Estructura de Contenedores

```
┌─────────────────────┐    ┌─────────────────────┐
│   Nginx Proxy       │    │   Next.js App       │
│   (Puerto 80/443)   │◄──►│   (Puerto 3000)     │
└─────────────────────┘    └─────────────────────┘
         │                           │
         │                           │
         ▼                           ▼
┌─────────────────────┐    ┌─────────────────────┐
│   SSL/TLS           │    │   API Services      │
│   Load Balancer     │    │   - Siigo           │
└─────────────────────┘    │   - Wompi           │
                           └─────────────────────┘
```

### Configuraciones Docker

#### **Dockerfile Multi-stage**
- **Stage 1 (deps)**: Instalación de dependencias
- **Stage 2 (builder)**: Construcción de la aplicación
- **Stage 3 (runner)**: Imagen de producción optimizada

#### **docker-compose.yml** (Desarrollo)
- Contenedor principal de la aplicación
- Puerto 3000 expuesto
- Variables de entorno desde `.env.local`
- Health checks configurados

#### **docker-compose.prod.yml** (Producción)
- Configuración optimizada para producción
- Nginx reverse proxy con SSL
- Límites de recursos
- Puerto 80/443 para acceso público

### Optimizaciones Docker

1. **Imagen Alpine**: Base ligera (Node.js 20.13.1-alpine)
2. **Multi-stage build**: Reduce tamaño final de imagen
3. **Output standalone**: Next.js genera bundle autocontenido
4. **User security**: Ejecuta como usuario no-root
5. **Health checks**: Monitoreo automático de salud
6. **Resource limits**: Control de memoria y CPU

### Comandos de Despliegue

#### **Desarrollo Local**
```bash
# Construir y ejecutar
docker-compose up --build

# Modo detached
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f
```

#### **Producción**
```bash
# Despliegue completo con Nginx
docker-compose -f docker-compose.prod.yml up -d

# Solo aplicación
docker-compose -f docker-compose.prod.yml up -d billing-form

# Actualizar aplicación
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

#### **Mantenimiento**
```bash
# Ver estado de contenedores
docker-compose ps

# Reiniciar servicios
docker-compose restart

# Limpiar recursos
docker-compose down --volumes --remove-orphans
docker system prune -a
```

---

## Monitoreo y Logs

### Health Checks
- **Endpoint**: `/health` (configurar en Next.js)
- **Intervalo**: 30 segundos
- **Timeout**: 10 segundos
- **Reintentos**: 3 antes de marcar como unhealthy

### Logs de Aplicación
```bash
# Logs de contenedor específico
docker logs -f billing-form-app

# Logs con docker-compose
docker-compose logs -f billing-form

# Logs con timestamp
docker-compose logs -f -t billing-form
```

### Métricas de Recursos
```bash
# Uso de recursos en tiempo real
docker stats billing-form-app

# Información detallada del contenedor
docker inspect billing-form-app
```

---

## Troubleshooting Docker

### Problemas Comunes

#### **Error de permisos**
```bash
# Verificar permisos de archivos
ls -la .env.local

# Cambiar propietario si es necesario
sudo chown $USER:$USER .env.local
```

#### **Puerto ocupado**
```bash
# Verificar puertos en uso
netstat -tulpn | grep :3000

# Cambiar puerto en docker-compose.yml
ports:
  - "3001:3000"  # Puerto host:contenedor
```

#### **Variables de entorno no cargadas**
```bash
# Verificar archivo de entorno
cat .env.local

# Recrear contenedor con nuevas variables
docker-compose up -d --force-recreate
```

#### **Imagen no actualizada**
```bash
# Forzar rebuild sin cache
docker-compose build --no-cache

# Eliminar imagen anterior
docker rmi billing-form:latest
```

---

## Contacto y Soporte

Para soporte técnico o consultas sobre la implementación, contactar al equipo de desarrollo de Pivvot.

---

*Documentación generada para el proyecto Billing Form - Sistema de Facturación para Arrendamiento de Vehículos Eléctricos*
