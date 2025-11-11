-- ============================================
-- DEBUGGING: Crear Venta desde Wompi
-- ============================================
-- Ejecuta estas consultas EN ORDEN para encontrar el problema
-- ============================================

-- ========================================
-- PASO 1: Verificar que la función existe
-- ========================================
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_name = 'crear_venta_desde_wompi';

-- Si NO aparece nada, la función NO está creada
-- Ejecuta: scripts/supabase_crear_venta_desde_wompi.sql


-- ========================================
-- PASO 2: Ver transacciones disponibles
-- ========================================
SELECT 
  id,
  wompi_transaction_id,
  reference,
  amount_in_cents / 100.0 as amount,
  customer_email,
  status,
  processed_at,
  venta_id
FROM wompi_transactions
WHERE status = 'APPROVED'
ORDER BY created_at DESC
LIMIT 5;

-- Anota el ID de una transacción que tenga:
-- - status = 'APPROVED'
-- - processed_at = NULL (o vacío)
-- - venta_id = NULL (o vacío)


-- ========================================
-- PASO 3: Ver tu operador ID
-- ========================================
SELECT 
  id as operador_id,
  email
FROM auth.users
LIMIT 5;

-- Anota tu UUID de operador


-- ========================================
-- PASO 4: Probar la función MANUALMENTE
-- ========================================
-- ⚠️ REEMPLAZA LOS VALORES ANTES DE EJECUTAR:

/*
SELECT * FROM crear_venta_desde_wompi(
  p_wompi_transaction_id := 1,  -- ← Reemplaza con ID del PASO 2
  p_operator_id := 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',  -- ← Reemplaza con UUID del PASO 3
  p_tiempo_servicio_min := NULL
);
*/

-- Si ves un error, cópialo completo


-- ========================================
-- PASO 5: Verificar si se creó el cliente
-- ========================================
SELECT 
  id,
  nombre,
  apellido,
  correo,
  direccion,
  created_at
FROM clientes
ORDER BY created_at DESC
LIMIT 5;

-- ¿Aparece algún cliente con direccion = 'Pago Virtual'?


-- ========================================
-- PASO 6: Verificar si se creó la venta
-- ========================================
SELECT 
  id,
  cliente_id,
  tiempo_servicio_min,
  valor_total,
  wompi_transaction_id,
  estado_pago,
  creada_en
FROM ventas
ORDER BY creada_en DESC
LIMIT 5;

-- ¿Aparece alguna venta con wompi_transaction_id?


-- ========================================
-- PASO 7: Ver logs de errores (si los hay)
-- ========================================
-- Ejecuta la función con RAISE NOTICE para ver logs

DO $$
DECLARE
  v_result RECORD;
BEGIN
  -- ⚠️ REEMPLAZA LOS VALORES:
  SELECT * INTO v_result FROM crear_venta_desde_wompi(
    p_wompi_transaction_id := 1,  -- ← ID de transacción
    p_operator_id := 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',  -- ← UUID operador
    p_tiempo_servicio_min := NULL
  );
  
  RAISE NOTICE 'Resultado: venta_id=%, cliente_id=%, success=%, message=%', 
    v_result.venta_id, 
    v_result.cliente_id, 
    v_result.success, 
    v_result.message;
END $$;


-- ========================================
-- PASO 8: Ver estructura del webhook_data
-- ========================================
-- Para verificar que los datos están en el JSON
SELECT 
  id,
  reference,
  webhook_data->'data'->'transaction'->'customer_data' as customer_data,
  webhook_data->'data'->'transaction'->'customer_data'->>'full_name' as full_name,
  webhook_data->'data'->'transaction'->'customer_data'->>'phone_number' as phone,
  customer_email
FROM wompi_transactions
WHERE status = 'APPROVED'
ORDER BY created_at DESC
LIMIT 1;

-- Verifica que full_name y phone tengan valores


-- ========================================
-- PASO 9: Verificar permisos
-- ========================================
SELECT 
  routine_name,
  grantee,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_name = 'crear_venta_desde_wompi';

-- Debe aparecer 'authenticated' con 'EXECUTE'


-- ========================================
-- PASO 10: Probar inserción directa
-- ========================================
-- Si la función falla, probar insertar manualmente

-- Insertar cliente de prueba
/*
INSERT INTO clientes (
  tipo_documento,
  numero_documento,
  nombre,
  apellido,
  correo,
  direccion,
  celular,
  tiempo_servicio_min,
  valor_total
) VALUES (
  'CC',
  'TEST123',
  'Cliente',
  'Prueba',
  'test@test.com',
  'Pago Virtual',
  '3001234567',
  0,
  0
)
RETURNING id;
*/

-- Si esto funciona, el problema está en la función
-- Si esto falla, el problema está en los permisos de la tabla
