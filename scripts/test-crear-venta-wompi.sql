-- ============================================
-- Script de Prueba: crear_venta_desde_wompi
-- ============================================
-- Este script te ayuda a probar la función paso a paso
-- ============================================

-- PASO 1: Ver transacciones de Wompi disponibles
SELECT 
  id,
  wompi_transaction_id,
  reference,
  amount_in_cents,
  amount_in_cents / 100.0 as amount,
  customer_email,
  customer_phone,
  webhook_data->'data'->'transaction'->'customer_data'->>'full_name' as customer_full_name,
  status,
  processed_at,
  venta_id
FROM wompi_transactions
WHERE status = 'APPROVED'
ORDER BY created_at DESC
LIMIT 10;

-- PASO 2: Ver operadores disponibles (necesitas el UUID)
SELECT 
  id as operador_id,
  email
FROM auth.users
LIMIT 5;

-- PASO 3: Probar la función con una transacción específica
-- ⚠️ REEMPLAZA LOS VALORES:
--    - p_wompi_transaction_id: ID de la transacción (de PASO 1)
--    - p_operator_id: UUID del operador (de PASO 2)
/*
SELECT * FROM crear_venta_desde_wompi(
  p_wompi_transaction_id := 1,  -- ← Reemplaza con ID real
  p_operator_id := 'tu-uuid-aqui',  -- ← Reemplaza con UUID real
  p_tiempo_servicio_min := NULL  -- NULL = cálculo automático
);
*/

-- PASO 4: Verificar que se creó el cliente
SELECT 
  id,
  nombre,
  apellido,
  correo,
  direccion,
  celular,
  tiempo_servicio_min,
  valor_total,
  created_at
FROM clientes
WHERE direccion = 'Pago Virtual'
ORDER BY created_at DESC
LIMIT 5;

-- PASO 5: Verificar que se creó la venta
SELECT 
  v.id as venta_id,
  v.operador_id,
  v.cliente_id,
  v.tiempo_servicio_min,
  v.valor_total,
  v.wompi_transaction_id,
  v.estado_pago,
  v.estado_factura,
  v.creada_en,
  c.nombre || ' ' || c.apellido as cliente,
  c.correo
FROM ventas v
INNER JOIN clientes c ON v.cliente_id = c.id
WHERE v.wompi_transaction_id IS NOT NULL
ORDER BY v.creada_en DESC
LIMIT 5;

-- PASO 6: Verificar la vinculación completa
SELECT 
  wt.id as transaction_id,
  wt.reference,
  wt.amount,
  wt.venta_id,
  v.id as venta_id_verificacion,
  v.tiempo_servicio_min,
  v.valor_total,
  v.estado_pago,
  c.nombre || ' ' || c.apellido as cliente,
  c.correo
FROM wompi_transactions wt
LEFT JOIN ventas v ON wt.venta_id = v.id
LEFT JOIN clientes c ON v.cliente_id = c.id
WHERE wt.status = 'APPROVED'
ORDER BY wt.created_at DESC
LIMIT 5;

-- ============================================
-- Consultas de Debugging
-- ============================================

-- Ver estructura de wompi_transactions
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'wompi_transactions'
ORDER BY ordinal_position;

-- Ver estructura de clientes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'clientes'
ORDER BY ordinal_position;

-- Ver estructura de ventas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'ventas'
ORDER BY ordinal_position;

-- Ver si la función existe
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_name = 'crear_venta_desde_wompi';
