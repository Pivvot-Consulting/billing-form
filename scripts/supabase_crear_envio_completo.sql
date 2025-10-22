-- ============================================
-- Función RPC: crear_envio_completo
-- ============================================
-- Crea una venta completa con cliente y aceptaciones en una transacción
-- Marca el código de operador como usado
--
-- CORRECCIÓN: Especifica tabla para columnas ambiguas
-- ============================================

-- PASO 1: Eliminar TODAS las versiones anteriores de la función
-- Esto previene el error "function name is not unique"
DO $$ 
DECLARE 
  func_signature TEXT;
BEGIN
  FOR func_signature IN 
    SELECT oid::regprocedure::text
    FROM pg_proc
    WHERE proname = 'crear_envio_completo'
      AND pg_function_is_visible(oid)
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || func_signature;
    RAISE NOTICE 'Eliminada función: %', func_signature;
  END LOOP;
END $$;

-- PASO 2: Crear función corregida
CREATE OR REPLACE FUNCTION crear_envio_completo(
  p_operator_code TEXT,
  p_tipo_documento TEXT,
  p_numero_documento TEXT,
  p_nombre TEXT,
  p_apellido TEXT,
  p_correo TEXT,
  p_direccion TEXT,
  p_celular TEXT,
  p_tiempo_servicio_min INT,
  p_valor_total NUMERIC,
  p_acepta_terminos BOOLEAN,
  p_acepta_privacidad BOOLEAN,
  p_version_terminos TEXT,
  p_version_privacidad TEXT,
  p_ip TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_marketing JSONB DEFAULT NULL
)
RETURNS TABLE (
  venta_id INT,
  cliente_id INT,
  operador_id UUID,
  aceptacion_id INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_operador_id UUID;
  v_cliente_id INT;
  v_venta_id INT;
  v_aceptacion_id INT;
  v_code_id INT;
BEGIN
  -- 1. Validar y obtener el código de operador
  SELECT 
    operator_codes.id, 
    operator_codes.operator_id
  INTO v_code_id, v_operador_id
  FROM operator_codes
  WHERE operator_codes.code = p_operator_code
    AND operator_codes.used_at IS NULL
    AND operator_codes.expires_at > NOW();  -- ✅ Especificado: operator_codes.expires_at

  -- Si no se encuentra código válido, abortar
  IF v_code_id IS NULL THEN
    RAISE EXCEPTION 'Código de operador inválido o expirado: %', p_operator_code;
  END IF;

  -- 2. Crear o actualizar cliente
  -- Buscar cliente existente por numero_documento
  SELECT id INTO v_cliente_id
  FROM clientes
  WHERE numero_documento = p_numero_documento
  LIMIT 1;

  IF v_cliente_id IS NULL THEN
    -- Cliente no existe, insertar nuevo
    INSERT INTO clientes (
      tipo_documento,
      numero_documento,
      nombre,
      apellido,
      correo,
      direccion,
      celular
    ) VALUES (
      p_tipo_documento::tipo_documento,  -- ✅ Cast explícito de TEXT a ENUM
      p_numero_documento,
      p_nombre,
      p_apellido,
      p_correo,
      p_direccion,
      p_celular
    )
    RETURNING id INTO v_cliente_id;
  ELSE
    -- Cliente existe, actualizar
    UPDATE clientes
    SET
      tipo_documento = p_tipo_documento::tipo_documento,
      nombre = p_nombre,
      apellido = p_apellido,
      correo = p_correo,
      direccion = p_direccion,
      celular = p_celular,
      updated_at = NOW()
    WHERE id = v_cliente_id;
  END IF;

  -- 3. Crear venta
  INSERT INTO ventas (
    operador_id,
    cliente_id,
    tiempo_servicio_min,
    valor_total
  ) VALUES (
    v_operador_id,
    v_cliente_id,
    p_tiempo_servicio_min,
    p_valor_total
  )
  RETURNING id INTO v_venta_id;

  -- 4. Crear aceptación legal
  INSERT INTO aceptaciones (
    venta_id,
    acepta_terminos,
    acepta_privacidad,
    version_terminos,
    version_privacidad,
    ip,
    user_agent
  ) VALUES (
    v_venta_id,
    p_acepta_terminos,
    p_acepta_privacidad,
    p_version_terminos,
    p_version_privacidad,
    p_ip,
    p_user_agent
  )
  RETURNING id INTO v_aceptacion_id;

  -- 5. Marcar código como usado
  UPDATE operator_codes
  SET 
    used_at = NOW(),
    venta_id = v_venta_id
  WHERE operator_codes.id = v_code_id;

  -- 6. Guardar respuestas de marketing (si existen)
  IF p_marketing IS NOT NULL THEN
    INSERT INTO marketing_respuestas (
      venta_id,
      respuestas
    ) VALUES (
      v_venta_id,
      p_marketing
    );
  END IF;

  -- Retornar IDs
  RETURN QUERY
  SELECT v_venta_id, v_cliente_id, v_operador_id, v_aceptacion_id;

EXCEPTION
  WHEN OTHERS THEN
    -- En caso de error, la transacción se revierte automáticamente
    RAISE EXCEPTION 'Error al crear venta: %', SQLERRM;
END;
$$;

-- ============================================
-- Permisos
-- ============================================
-- Permitir ejecución a usuarios anónimos (formulario público)
GRANT EXECUTE ON FUNCTION crear_envio_completo TO anon;
GRANT EXECUTE ON FUNCTION crear_envio_completo TO authenticated;

-- ============================================
-- Comentarios
-- ============================================
COMMENT ON FUNCTION crear_envio_completo IS 'Crea una venta completa con cliente, aceptaciones y marca el código como usado. CORRECCIÓN: Columnas ambiguas especificadas con nombre de tabla.';

-- ============================================
-- Testing
-- ============================================
-- Para probar (como usuario anónimo o autenticado):
/*
SELECT * FROM crear_envio_completo(
  p_operator_code := '1234',
  p_generar_factura := true,
  p_tipo_documento := 'CC',
  p_numero_documento := '123456789',
  p_nombre := 'Juan',
  p_apellido := 'Pérez',
  p_correo := 'juan@example.com',
  p_direccion := 'Calle 123',
  p_celular := '3001234567',
  p_tiempo_servicio_min := 60,
  p_valor_total := 35000,
  p_acepta_terminos := true,
  p_acepta_privacidad := true,
  p_version_terminos := '1.0',
  p_version_privacidad := '1.0'
);
*/

-- ============================================
-- Notas Importantes
-- ============================================
-- 1. Esta función usa SECURITY DEFINER, lo que significa que se ejecuta
--    con los permisos del creador de la función, no del usuario que la llama
--
-- 2. Permite acceso anónimo (anon) para que funcione desde el formulario público
--
-- 3. La validación del código ahora especifica explícitamente:
--    - operator_codes.expires_at (NO ambiguo)
--    - operator_codes.used_at (NO ambiguo)
--
-- 4. Usa transacciones automáticas - si algo falla, todo se revierte
--
-- 5. El UPDATE final marca el código como usado y vincula con la venta
