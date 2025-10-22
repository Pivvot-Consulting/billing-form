-- ============================================
-- Función RPC: generar_codigo_operador
-- ============================================
-- Genera un nuevo código de operador de forma atómica
-- Desactiva códigos activos existentes antes de crear uno nuevo
-- Previene violaciones de la constraint única uq_operator_codes_one_active_per_operator
--
-- IMPORTANTE: Esta función debe ejecutarse en Supabase SQL Editor
-- ============================================

CREATE OR REPLACE FUNCTION generar_codigo_operador(
  p_len INT DEFAULT 4,
  p_expira_min INT DEFAULT 30
)
RETURNS TABLE (
  id INT,
  code TEXT,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_operator_id UUID;
  v_code TEXT;
  v_expires_at TIMESTAMPTZ;
  v_id INT;
BEGIN
  -- Obtener el ID del operador autenticado
  v_operator_id := auth.uid();
  
  -- Verificar autenticación
  IF v_operator_id IS NULL THEN
    RAISE EXCEPTION 'No hay usuario autenticado';
  END IF;

  -- CRITICAL: Desactivar cualquier código activo existente
  -- Esto previene la violación de la constraint única
  UPDATE operator_codes
  SET used_at = NOW()
  WHERE operator_id = v_operator_id
    AND used_at IS NULL
    AND expires_at > NOW();

  -- Generar código aleatorio de p_len dígitos
  -- Ejemplo: para p_len=4, genera números entre 1000 y 9999
  v_code := LPAD(FLOOR(RANDOM() * POWER(10, p_len))::TEXT, p_len, '0');
  
  -- Calcular fecha de expiración
  v_expires_at := NOW() + (p_expira_min || ' minutes')::INTERVAL;

  -- Insertar nuevo código
  INSERT INTO operator_codes (operator_id, code, expires_at)
  VALUES (v_operator_id, v_code, v_expires_at)
  RETURNING operator_codes.id INTO v_id;

  -- Retornar el código generado
  RETURN QUERY
  SELECT v_id, v_code, v_expires_at;
END;
$$;

-- ============================================
-- Permisos
-- ============================================
-- Permitir que usuarios autenticados ejecuten la función
GRANT EXECUTE ON FUNCTION generar_codigo_operador(INT, INT) TO authenticated;

-- ============================================
-- Comentarios
-- ============================================
COMMENT ON FUNCTION generar_codigo_operador IS 'Genera un nuevo código de operador, desactivando códigos activos existentes para evitar violación de constraint única';

-- ============================================
-- Testing
-- ============================================
-- Para probar la función (ejecutar como usuario autenticado):
-- SELECT * FROM generar_codigo_operador(4, 30);

-- ============================================
-- Constraint Única (Verificación)
-- ============================================
-- Verificar que existe la constraint única parcial
-- Esta constraint permite solo un código activo (used_at IS NULL) por operador

-- Si no existe, crearla con:
/*
CREATE UNIQUE INDEX IF NOT EXISTS uq_operator_codes_one_active_per_operator
ON operator_codes (operator_id)
WHERE used_at IS NULL;
*/

-- Para verificar si existe:
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'operator_codes' 
-- AND indexname = 'uq_operator_codes_one_active_per_operator';
