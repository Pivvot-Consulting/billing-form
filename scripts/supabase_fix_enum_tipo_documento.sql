-- ============================================
-- Fix ENUM tipo_documento
-- ============================================
-- Agrega valores faltantes al ENUM tipo_documento
-- para que coincida con las opciones del frontend
-- ============================================

-- Ver valores actuales del ENUM
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'tipo_documento'::regtype
ORDER BY enumsortorder;

-- Agregar valores faltantes si no existen
-- NOTA: Solo se pueden agregar valores, no eliminar

-- 1. Agregar 'PP' (Pasaporte) si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'PP' 
        AND enumtypid = 'tipo_documento'::regtype
    ) THEN
        ALTER TYPE tipo_documento ADD VALUE 'PP';
        RAISE NOTICE 'Valor "PP" agregado al ENUM tipo_documento';
    ELSE
        RAISE NOTICE 'Valor "PP" ya existe en el ENUM';
    END IF;
END $$;

-- 2. Agregar 'NIT' si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'NIT' 
        AND enumtypid = 'tipo_documento'::regtype
    ) THEN
        ALTER TYPE tipo_documento ADD VALUE 'NIT';
        RAISE NOTICE 'Valor "NIT" agregado al ENUM tipo_documento';
    ELSE
        RAISE NOTICE 'Valor "NIT" ya existe en el ENUM';
    END IF;
END $$;

-- 3. Agregar 'CC' si no existe (debería existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'CC' 
        AND enumtypid = 'tipo_documento'::regtype
    ) THEN
        ALTER TYPE tipo_documento ADD VALUE 'CC';
        RAISE NOTICE 'Valor "CC" agregado al ENUM tipo_documento';
    ELSE
        RAISE NOTICE 'Valor "CC" ya existe en el ENUM';
    END IF;
END $$;

-- Verificar valores finales
SELECT 
    'tipo_documento' as enum_name,
    enumlabel as valor,
    enumsortorder as orden
FROM pg_enum 
WHERE enumtypid = 'tipo_documento'::regtype
ORDER BY enumsortorder;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- enum_name       | valor | orden
-- ----------------|-------|------
-- tipo_documento  | CC    | 1
-- tipo_documento  | PP    | 2
-- tipo_documento  | NIT   | 3
-- ============================================
