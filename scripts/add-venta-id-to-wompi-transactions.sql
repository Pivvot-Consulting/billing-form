-- ============================================
-- Agregar relación entre wompi_transactions y ventas
-- ============================================
-- Esto permite vincular una transacción de Wompi con una venta
-- cuando el operador valida el pago
-- ============================================

-- Agregar columna venta_id a wompi_transactions
ALTER TABLE wompi_transactions
ADD COLUMN IF NOT EXISTS venta_id INT REFERENCES ventas(id) ON DELETE SET NULL;

-- Crear índice para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_wompi_transactions_venta_id 
ON wompi_transactions(venta_id);

-- Comentario explicativo
COMMENT ON COLUMN wompi_transactions.venta_id IS 
'ID de la venta asociada a esta transacción de Wompi. Se llena cuando el operador valida el pago.';
