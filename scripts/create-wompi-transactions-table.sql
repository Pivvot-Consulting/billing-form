-- Tabla para almacenar transacciones de Wompi
-- Esta tabla guarda toda la información que Wompi envía en el webhook

CREATE TABLE IF NOT EXISTS wompi_transactions (
  id BIGSERIAL PRIMARY KEY,
  
  -- Identificadores de Wompi
  wompi_transaction_id TEXT UNIQUE NOT NULL, -- ID único de la transacción en Wompi
  reference TEXT UNIQUE NOT NULL, -- Referencia generada por nosotros (formato: pivvot-timestamp)
  
  -- Estado de la transacción
  status TEXT NOT NULL, -- APPROVED, DECLINED, ERROR, VOIDED, PENDING
  status_message TEXT, -- Mensaje adicional del estado
  
  -- Montos
  amount_in_cents BIGINT NOT NULL, -- Monto en centavos
  amount DECIMAL(12,2) NOT NULL, -- Monto en pesos (calculado)
  currency TEXT DEFAULT 'COP',
  
  -- Información del método de pago
  payment_method_type TEXT, -- CARD, NEQUI, PSE, etc.
  payment_method_name TEXT, -- Nombre del método (ej: VISA, Mastercard)
  payment_method_bin TEXT, -- Primeros dígitos de la tarjeta
  payment_method_last_four TEXT, -- Últimos 4 dígitos
  
  -- Información del cliente (capturada de Wompi)
  customer_email TEXT,
  customer_phone TEXT,
  customer_legal_id TEXT, -- Documento del cliente si Wompi lo captura
  customer_legal_id_type TEXT, -- Tipo de documento
  
  -- Información adicional
  payment_link_id TEXT, -- ID del link de pago si se usó
  redirect_url TEXT, -- URL de redirección después del pago
  
  -- Datos completos del webhook (JSON)
  webhook_data JSONB, -- Guarda todo el payload del webhook para referencia
  
  -- Timestamps de Wompi
  wompi_created_at TIMESTAMP WITH TIME ZONE,
  wompi_finalized_at TIMESTAMP WITH TIME ZONE,
  
  -- Control interno
  processed BOOLEAN DEFAULT FALSE, -- Si ya fue procesado/validado por el operador
  processed_at TIMESTAMP WITH TIME ZONE, -- Cuándo fue validado
  processed_by_operator_id TEXT, -- ID del operador que lo validó (puede ser string o number)
  
  -- Relación con venta (si se genera factura después)
  venta_id BIGINT, -- ID de la venta si se genera factura
  
  -- Timestamps del sistema
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_wompi_transactions_reference ON wompi_transactions(reference);
CREATE INDEX IF NOT EXISTS idx_wompi_transactions_status ON wompi_transactions(status);
CREATE INDEX IF NOT EXISTS idx_wompi_transactions_processed ON wompi_transactions(processed);
CREATE INDEX IF NOT EXISTS idx_wompi_transactions_created_at ON wompi_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_wompi_transactions_wompi_id ON wompi_transactions(wompi_transaction_id);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_wompi_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_wompi_transactions_updated_at
  BEFORE UPDATE ON wompi_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_wompi_transactions_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE wompi_transactions IS 'Almacena todas las transacciones recibidas desde Wompi via webhook';
COMMENT ON COLUMN wompi_transactions.wompi_transaction_id IS 'ID único de la transacción en Wompi';
COMMENT ON COLUMN wompi_transactions.reference IS 'Referencia única generada por nuestra aplicación';
COMMENT ON COLUMN wompi_transactions.status IS 'Estado de la transacción: APPROVED, DECLINED, ERROR, VOIDED, PENDING';
COMMENT ON COLUMN wompi_transactions.processed IS 'Indica si el operador ya validó/procesó esta transacción';
COMMENT ON COLUMN wompi_transactions.webhook_data IS 'Payload completo del webhook de Wompi en formato JSON';
