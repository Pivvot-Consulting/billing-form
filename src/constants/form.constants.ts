/**
 * Constantes relacionadas con formularios
 */

/**
 * Opciones de tipo de documento
 */
export const DOCUMENT_TYPE_OPTIONS = [
  { key: 'CC', label: 'Cédula de ciudadanía' },
  { key: 'Pasaporte', label: 'Pasaporte' },
  { key: 'NIT', label: 'NIT' },
] as const;

/**
 * Versiones de documentos legales
 */
export const LEGAL_DOCUMENTS = {
  TERMINOS: {
    VERSION: 'v1.3',
    URL: 'https://drive.google.com/file/d/1Xllp7D7dvRGL45Go7qVjJQ7gh7SyHUhv/view',
  },
  PRIVACIDAD: {
    VERSION: 'v1.0',
    URL: 'https://share.hsforms.com/1uhXLisvsTA6wNahbec4MTg3uhim',
  },
} as const;

/**
 * Configuración de validación de formularios
 */
export const VALIDATION_RULES = {
  NOMBRE: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  APELLIDO: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  DOCUMENTO: {
    CC: {
      MIN_LENGTH: 6,
      MAX_LENGTH: 10,
    },
    NIT: {
      MIN_LENGTH: 9,
      MAX_LENGTH: 10,
    },
    Pasaporte: {
      MIN_LENGTH: 6,
      MAX_LENGTH: 20,
    },
  },
  TELEFONO: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 10,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;

/**
 * Mensajes de error de validación
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo es requerido',
  INVALID_EMAIL: 'Correo electrónico inválido',
  INVALID_PHONE: 'Número de teléfono inválido (debe tener 10 dígitos)',
  INVALID_DOCUMENT: 'Número de documento inválido',
  MIN_LENGTH: (field: string, min: number) => `${field} debe tener al menos ${min} caracteres`,
  MAX_LENGTH: (field: string, max: number) => `${field} debe tener máximo ${max} caracteres`,
  INVALID_CODE: 'Código de operador inválido',
} as const;
