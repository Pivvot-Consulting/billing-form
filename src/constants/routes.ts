/**
 * Constantes de rutas de navegación de la aplicación
 */

export const ROUTES = {
  // Rutas públicas
  HOME: '/',
  
  // Rutas de cliente
  CLIENT: {
    METODO_PAGO: '/cliente/metodo-pago',
    EFECTIVO: '/cliente/efectivo',
    VIRTUAL: '/cliente/virtual',
  },
  
  // Rutas de operador (auth)
  OPERATOR: {
    LOGIN: '/operator/login',
    DASHBOARD: '/operator/dashboard',
  },
  
  // Rutas externas
  EXTERNAL: {
    WOMPI: process.env.NEXT_PUBLIC_WOMPI_PAYMENT_URL || '',
    TERMINOS: 'https://share.hsforms.com/1uhXLisvsTA6wNahbec4MTg3uhim',
    PRIVACIDAD: 'https://share.hsforms.com/1uhXLisvsTA6wNahbec4MTg3uhim',
  }
} as const;

/**
 * Rutas protegidas que requieren autenticación
 */
export const PROTECTED_ROUTES = [
  ROUTES.OPERATOR.DASHBOARD,
] as const;

/**
 * Rutas públicas accesibles sin autenticación
 */
export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.CLIENT.METODO_PAGO,
  ROUTES.CLIENT.EFECTIVO,
  ROUTES.CLIENT.VIRTUAL,
  ROUTES.OPERATOR.LOGIN,
] as const;
