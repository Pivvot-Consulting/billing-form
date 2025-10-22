-- ============================================
-- POLÍTICAS RLS FALTANTES PARA operator_codes
-- ============================================
-- 
-- Problema: El formulario público no puede validar códigos porque
-- solo existen políticas para usuarios autenticados.
--
-- Solución: Agregar políticas para usuarios anónimos (anon)
-- que permiten validar códigos activos sin autenticarse.
--
-- ============================================

-- 1. POLÍTICA CRÍTICA: Permitir a usuarios ANÓNIMOS validar códigos activos
-- Esta política es NECESARIA para que el formulario público funcione
DROP POLICY IF EXISTS "Usuarios anónimos pueden validar códigos" ON operator_codes;

CREATE POLICY "Usuarios anónimos pueden validar códigos"
ON operator_codes
FOR SELECT
TO anon  -- Rol para usuarios no autenticados
USING (
  -- Solo pueden ver códigos que:
  used_at IS NULL           -- No han sido usados
  AND expires_at > NOW()    -- No han expirado
);

-- 2. POLÍTICA: Usuarios autenticados (clientes) pueden validar códigos
-- Permite a usuarios autenticados que NO son operadores validar códigos
DROP POLICY IF EXISTS "Clientes autenticados pueden validar códigos" ON operator_codes;

CREATE POLICY "Clientes autenticados pueden validar códigos"
ON operator_codes
FOR SELECT
TO authenticated
USING (
  -- Pueden ver códigos activos O sus propios códigos (si son operadores)
  (used_at IS NULL AND expires_at > NOW())
  OR auth.uid() = operator_id
);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Listar todas las políticas de operator_codes
SELECT 
  policyname,
  roles,
  cmd,
  qual AS "using_expression",
  with_check AS "with_check_expression"
FROM pg_policies
WHERE tablename = 'operator_codes'
ORDER BY policyname;

-- Resultado esperado: 5 políticas
-- 1. oc_insert_own (authenticated, INSERT)
-- 2. oc_select_own (authenticated, SELECT)
-- 3. oc_update_own (authenticated, UPDATE)
-- 4. Usuarios anónimos pueden validar códigos (anon, SELECT)
-- 5. Clientes autenticados pueden validar códigos (authenticated, SELECT)

-- ============================================
-- PRUEBA MANUAL
-- ============================================

-- Probar como usuario anónimo (ejecutar sin autenticarse en Supabase Dashboard)
-- Esto debería retornar códigos activos:
/*
SELECT code, expires_at
FROM operator_codes
WHERE used_at IS NULL
  AND expires_at > NOW()
LIMIT 5;
*/
