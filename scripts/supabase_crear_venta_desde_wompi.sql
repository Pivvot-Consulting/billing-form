-- ============================================
-- Función RPC: crear_venta_desde_wompi
-- ============================================
-- Crea una venta a partir de una transacción de Wompi aprobada
-- Vincula la transacción con la venta creada
-- ============================================

-- Eliminar todas las versiones anteriores de la función
DROP FUNCTION IF EXISTS crear_venta_desde_wompi CASCADE;

CREATE OR REPLACE FUNCTION crear_venta_desde_wompi(
  p_wompi_transaction_id BIGINT,
  p_operator_id UUID,
  p_tiempo_servicio_min INT DEFAULT NULL
)
RETURNS TABLE (
  venta_id BIGINT,
  cliente_id BIGINT,
  wompi_transaction_id BIGINT,
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction RECORD;
  v_cliente_id BIGINT;
  v_venta_id BIGINT;
  v_tiempo_calculado INT;
  v_nombre TEXT;
  v_apellido TEXT;
  v_full_name_parts TEXT[];
  v_customer_full_name TEXT;
BEGIN
  RAISE NOTICE 'Iniciando crear_venta_desde_wompi con transaction_id=%, operator_id=%', p_wompi_transaction_id, p_operator_id;
  -- 1. Obtener la transacción de Wompi
  SELECT *
  INTO v_transaction
  FROM wompi_transactions
  WHERE id = p_wompi_transaction_id
    AND status = 'APPROVED'
    AND processed_at IS NULL;  -- Solo transacciones no procesadas

  -- Validar que existe y está aprobada
  IF v_transaction.id IS NULL THEN
    RAISE NOTICE 'Transacción no encontrada o ya procesada';
    RETURN QUERY
    SELECT 
      NULL::BIGINT,
      NULL::BIGINT,
      p_wompi_transaction_id,
      FALSE,
      'Transacción no encontrada, no aprobada o ya procesada'::TEXT;
    RETURN;
  END IF;
  
  RAISE NOTICE 'Transacción encontrada: id=%, reference=%, amount=%', v_transaction.id, v_transaction.reference, v_transaction.amount;

  -- 2. Calcular tiempo de servicio si no se proporciona
  -- Basado en el valor pagado (puedes ajustar estas tarifas)
  IF p_tiempo_servicio_min IS NULL THEN
    CASE
      WHEN v_transaction.amount_in_cents <= 3000000 THEN  -- <= $30,000
        v_tiempo_calculado := 30;  -- 30 minutos
      WHEN v_transaction.amount_in_cents <= 4000000 THEN  -- <= $40,000
        v_tiempo_calculado := 60;  -- 1 hora
      WHEN v_transaction.amount_in_cents <= 8000000 THEN  -- <= $80,000
        v_tiempo_calculado := 120;  -- 2 horas
      ELSE
        -- Para montos personalizados, calcular proporcionalmente
        -- Asumiendo $40,000 por hora = 40000/60 = 666.67 por minuto
        v_tiempo_calculado := ROUND((v_transaction.amount_in_cents / 100.0) / 666.67);
    END CASE;
  ELSE
    v_tiempo_calculado := p_tiempo_servicio_min;
  END IF;

  RAISE NOTICE 'Tiempo de servicio calculado: % minutos', v_tiempo_calculado;

  -- 3. Crear o buscar cliente basado en el email de la transacción
  -- Primero intentar buscar por email
  SELECT id INTO v_cliente_id
  FROM clientes
  WHERE correo = v_transaction.customer_email
  LIMIT 1;

  RAISE NOTICE 'Buscando cliente con email=%', v_transaction.customer_email;
  
  IF v_cliente_id IS NULL THEN
    RAISE NOTICE 'Cliente no existe, creando nuevo...';
    -- Cliente no existe, crear uno nuevo con datos mínimos
    -- Extraer nombre completo del webhook_data
    v_customer_full_name := COALESCE(
      v_transaction.webhook_data->'data'->'transaction'->'customer_data'->>'full_name',
      'Cliente Virtual'
    );
    
    -- Dividir nombre completo en partes (trim y split por espacios)
    v_full_name_parts := string_to_array(TRIM(v_customer_full_name), ' ');
    
    -- Dividir en nombre (primeras 2 palabras) y apellido (resto)
    -- Ejemplo: "Francisco Javier Castillo Barrios" -> nombre: "Francisco Javier", apellido: "Castillo Barrios"
    CASE
      WHEN array_length(v_full_name_parts, 1) >= 4 THEN
        -- Si hay 4+ palabras, primeras 2 son nombres, resto apellidos
        v_nombre := v_full_name_parts[1] || ' ' || v_full_name_parts[2];
        v_apellido := array_to_string(v_full_name_parts[3:array_length(v_full_name_parts, 1)], ' ');
      WHEN array_length(v_full_name_parts, 1) = 3 THEN
        -- Si hay 3 palabras, primera es nombre, resto apellidos
        v_nombre := v_full_name_parts[1];
        v_apellido := v_full_name_parts[2] || ' ' || v_full_name_parts[3];
      WHEN array_length(v_full_name_parts, 1) = 2 THEN
        -- Si hay 2 palabras, primera es nombre, segunda apellido
        v_nombre := v_full_name_parts[1];
        v_apellido := v_full_name_parts[2];
      WHEN array_length(v_full_name_parts, 1) = 1 THEN
        v_nombre := v_full_name_parts[1];
        v_apellido := 'Virtual';
      ELSE
        v_nombre := 'Cliente';
        v_apellido := 'Virtual';
    END CASE;
    
    -- Insertar cliente
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
      COALESCE(
        v_transaction.webhook_data->'data'->'transaction'->'billing_data'->>'legal_id_type',
        'CC'
      )::tipo_documento,
      COALESCE(
        v_transaction.webhook_data->'data'->'transaction'->'billing_data'->>'legal_id',
        '0000000000'
      ),
      v_nombre,
      v_apellido,
      v_transaction.customer_email,
      COALESCE(
        v_transaction.webhook_data->'data'->'transaction'->'shipping_address'->>'address_line_1',
        'Dirección Virtual - Barranquilla'
      ),
      COALESCE(v_transaction.customer_phone, '0000000000'),
      v_tiempo_calculado,  -- Usar el tiempo calculado
      v_transaction.amount_in_cents / 100.0   -- Valor total desde la transacción
    )
    RETURNING id INTO v_cliente_id;
    
    RAISE NOTICE 'Cliente creado con id=%', v_cliente_id;
  ELSE
    RAISE NOTICE 'Cliente existente encontrado con id=%', v_cliente_id;
  END IF;

  -- 4. Crear venta
  INSERT INTO ventas (
    operador_id,
    cliente_id,
    tiempo_servicio_min,
    valor_total,
    wompi_transaction_id,
    estado_pago,
    estado_factura
  ) VALUES (
    p_operator_id,
    v_cliente_id,
    v_tiempo_calculado,
    v_transaction.amount_in_cents / 100.0,  -- Convertir centavos a pesos
    v_transaction.wompi_transaction_id,
    'aprobado',  -- Estado del pago
    'pendiente'  -- Estado de la factura (pendiente de generar)
  )
  RETURNING id INTO v_venta_id;
  
  RAISE NOTICE 'Venta creada con id=%', v_venta_id;

  -- 5. Actualizar la transacción de Wompi con el venta_id y marcar como procesada
  UPDATE wompi_transactions
  SET 
    venta_id = v_venta_id,
    processed_at = NOW(),
    processed_by_operator_id = p_operator_id::TEXT
  WHERE id = p_wompi_transaction_id;
  
  RAISE NOTICE 'Transacción actualizada con venta_id=%', v_venta_id;

  -- 6. Retornar resultado exitoso
  RAISE NOTICE 'Proceso completado exitosamente';
  
  RETURN QUERY
  SELECT 
    v_venta_id,
    v_cliente_id,
    p_wompi_transaction_id,
    TRUE,
    'Venta creada exitosamente'::TEXT;

EXCEPTION
  WHEN OTHERS THEN
    -- En caso de error, la transacción se revierte automáticamente
    RAISE NOTICE 'ERROR: %', SQLERRM;
    RETURN QUERY
    SELECT 
      NULL::BIGINT,
      NULL::BIGINT,
      p_wompi_transaction_id,
      FALSE,
      ('Error al crear venta: ' || SQLERRM)::TEXT;
END;
$$;

-- Comentario explicativo
COMMENT ON FUNCTION crear_venta_desde_wompi IS 
'Crea una venta a partir de una transacción de Wompi aprobada. Vincula la transacción con la venta y marca la transacción como procesada.';

-- ============================================
-- Permisos
-- ============================================
-- Permitir ejecución a usuarios autenticados (operadores)
GRANT EXECUTE ON FUNCTION crear_venta_desde_wompi(BIGINT, UUID, INT) TO authenticated;
