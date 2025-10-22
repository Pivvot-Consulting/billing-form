# 🚗 Sistema de Facturación - Arrendamiento de Vehículos Eléctricos

Sistema completo de gestión de ventas con backend en Supabase, frontend en Next.js 14 y facturación integrada con Siigo.

## 🌟 Características

- ✅ **Autenticación de operadores** con Supabase Auth
- ✅ **Gestión de códigos temporales** para vincular ventas
- ✅ **Formularios públicos** para clientes
- ✅ **Integración dual**: Supabase + Siigo
- ✅ **Registro de aceptaciones legales** (términos y privacidad)
- ✅ **Dashboard con estadísticas** para operadores
- ✅ **Arquitectura por capas** (Controllers, Services, Hooks)
- ✅ **TypeScript** con types estrictos
- ✅ **RLS (Row Level Security)** en Supabase

## 🚀 Inicio Rápido

### 1. Clonar e Instalar

```bash
# Instalar dependencias
npm install
```

### 2. Configurar Supabase (CRÍTICO)

**⚠️ EJECUTAR SCRIPTS SQL EN ESTE ORDEN:**

Ver guía completa: **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**

1. **🔴 OBLIGATORIO**: Políticas RLS para validación de códigos
   ```bash
   scripts/supabase_rls_operator_codes.sql
   ```
   Sin esto, el formulario público **NO** puede validar códigos.

2. **🟡 Opcional**: Funciones RPC optimizadas
   ```bash
   scripts/supabase_generar_codigo_operador.sql
   scripts/supabase_crear_envio_completo.sql
   ```
   Mejoran el rendimiento pero no son obligatorias.

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz:

```bash
# SUPABASE (Requerido)
NEXT_PUBLIC_SUPABASE_URL=https://pzeehfdxstqsrvwgdjfa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key

# SIIGO (Opcional)
SIIGO_USER_NAME=tu_usuario
SIIGO_ACCESS_KEY=tu_access_key
SIIGO_DOCUMENT_ID=28010
SIIGO_COST_CENTER_ID=849
SIIGO_SELLER_ID=488
SIIGO_PAYMENT_ID=4366

# WOMPI (Opcional)
NEXT_PUBLIC_WOMPI_PAYMENT_URL=https://checkout.wompi.co/...
```

### 4. Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### 5. Build para Producción

```bash
npm run build
npm start
```

## 📚 Documentación

- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - ⚠️ Configuración REQUERIDA de funciones RPC en Supabase
- **[ARQUITECTURA.md](./ARQUITECTURA.md)** - Arquitectura completa del sistema, capas, flujos y endpoints
- **[GUIA_DE_USO.md](./GUIA_DE_USO.md)** - Guía paso a paso para operadores y clientes
- **[DOCUMENTACION_TECNICA.md](./DOCUMENTACION_TECNICA.md)** - Documentación técnica de Siigo
- **[CONFIGURACION_SIIGO.md](./CONFIGURACION_SIIGO.md)** - Configuración de Siigo
- **[SOLUCION_CONSTRAINT_ERROR.md](./SOLUCION_CONSTRAINT_ERROR.md)** - Solución a errores de constraint único

## 🏗️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI**: NextUI, TailwindCSS, Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Facturación**: Siigo API
- **Validación**: React Hook Form, Zod (opcional)
- **Estado**: React Hooks personalizados

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Rutas Next.js
│   ├── page.tsx           # Selección Operador/Cliente
│   ├── operator/          # Rutas de operador (auth)
│   └── cliente/           # Rutas de cliente (público)
├── controllers/           # Lógica de negocio
├── services/              # Servicios externos (Supabase, Siigo)
├── hooks/                 # Custom React Hooks
├── types/                 # TypeScript types y DTOs
├── constants/             # Constantes y configuración
├── components/            # Componentes UI
└── lib/                   # Configuración de librerías
```

## 👥 Flujos de Usuario

### 🔵 Operador
1. Login con email/password
2. Ver/generar códigos de venta temporales
3. Ver estadísticas de ventas
4. Gestionar ventas

### 🟢 Cliente
1. Aceptar términos y privacidad
2. Seleccionar método de pago (Virtual/Efectivo)
3. Completar formulario con código del vendedor
4. Registrar venta automáticamente

## 🔐 Seguridad

- **RLS en Supabase**: Los operadores solo ven sus propias ventas
- **Autenticación JWT**: Tokens seguros de Supabase Auth
- **Validación de códigos**: Códigos expiran en 30 minutos
- **HTTPS**: Todas las comunicaciones encriptadas

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
npm test

# Tests con coverage
npm run test:coverage
```

## 🐳 Docker

```bash
# Build
docker-compose build

# Run
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

## 🔄 Endpoints Principales

### Supabase RPC
- `POST /rest/v1/rpc/crear_envio_completo` - Crear venta completa
- `POST /rest/v1/rpc/generar_codigo_operador` - Generar código

### Tablas
- `GET /rest/v1/ventas` - Listar ventas (auth)
- `GET /rest/v1/operator_codes` - Listar códigos (auth)

Ver [ARQUITECTURA.md](./ARQUITECTURA.md) para detalles completos.

## 📊 Base de Datos

### Tablas Principales
- `operadores` - Usuarios autenticados
- `operator_codes` - Códigos temporales
- `clientes` - Datos de compradores
- `ventas` - Transacciones
- `aceptaciones` - Registro de términos aceptados
- `marketing_respuestas` - Cuestionarios (futuro)

## 🚧 Próximas Funcionalidades

- [ ] Historial de ventas detallado
- [ ] Búsqueda y filtros avanzados
- [ ] Notificaciones en tiempo real
- [ ] Reportes y exports
- [ ] Tests automatizados
- [ ] Middleware de autenticación
- [ ] PWA para uso offline

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y propiedad de Pivvot Consulting.

## 🐛 Solución de Problemas

### Error: ENUM tipo_documento con valores faltantes

```
Error: invalid input value for enum tipo_documento: "PP"
```

**Causa**: El ENUM `tipo_documento` en Supabase no incluye todos los valores (PP, NIT).

**Solución**: Ejecutar el script SQL para agregar valores:
```bash
scripts/supabase_fix_enum_tipo_documento.sql
```

Ver guía completa: [FIX_ENUM_TIPO_DOCUMENTO.md](./FIX_ENUM_TIPO_DOCUMENTO.md)

---

### Error: Type Casting en tipo_documento

```
Error: column "tipo_documento" is of type tipo_documento but expression is of type text
```

**Causa**: La función RPC `crear_envio_completo` no hace cast de TEXT a ENUM.

**Solución**: Ejecutar el script SQL corregido:
```bash
scripts/supabase_crear_envio_completo.sql
```

---

### Error: "No se encontró código activo con ese valor"

```
📊 Resultado de validación: {data: null, error: null}
⚠️ No se encontró código activo con ese valor
```

**Causa**: Faltan políticas RLS para usuarios anónimos en `operator_codes`.

**Solución**: Ejecutar el script SQL obligatorio:
```bash
scripts/supabase_rls_operator_codes.sql
```

---

### Error de Constraint Único en operator_codes

Si encuentras el error `duplicate key value violates unique constraint "uq_operator_codes_one_active_per_operator"`:

**Causa**: Códigos expirados con `used_at IS NULL` no se desactivan correctamente.

**Solución**: Ya está corregido en el código frontend. Para optimizar, ejecutar:
```bash
scripts/supabase_generar_codigo_operador.sql
```

---

### Documentación Completa

- **[RESUMEN_SOLUCION_COMPLETA.md](./RESUMEN_SOLUCION_COMPLETA.md)** - Resumen de todos los problemas resueltos
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Guía de configuración de Supabase (OBLIGATORIO)
- **[SOLUCION_CONSTRAINT_ERROR.md](./SOLUCION_CONSTRAINT_ERROR.md)** - Análisis del constraint error
- **[BUG_ANALYSIS.md](./BUG_ANALYSIS.md)** - Análisis visual detallado

## 📞 Soporte

Para soporte técnico, consulta los documentos listados arriba.
- [GUIA_DE_USO.md](./GUIA_DE_USO.md) - Solución de problemas comunes
- [ARQUITECTURA.md](./ARQUITECTURA.md) - Detalles técnicos del sistema

---

**Desarrollado con ❤️ usando Next.js y Supabase**
