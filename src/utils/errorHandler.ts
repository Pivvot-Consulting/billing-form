import toast from 'react-hot-toast';

// Tipos de error personalizados
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

// Mapeo de códigos de error a mensajes amigables
const ERROR_MESSAGES: Record<string, string> = {
  // Errores de red
  'NETWORK_ERROR': 'Error de conexión. Verifica tu conexión a internet.',
  'TIMEOUT_ERROR': 'La solicitud tardó demasiado. Intenta nuevamente.',
  
  // Errores de Siigo API
  'SIIGO_AUTH_ERROR': 'Error de autenticación con Siigo. Verifica las credenciales.',
  'SIIGO_INVALID_DATA': 'Los datos enviados no son válidos. Revisa el formulario.',
  'SIIGO_SERVER_ERROR': 'Error en el servidor de Siigo. Intenta más tarde.',
  'SIIGO_RATE_LIMIT': 'Demasiadas solicitudes. Espera un momento e intenta nuevamente.',
  
  // Errores de validación
  'VALIDATION_ERROR': 'Por favor, completa todos los campos requeridos.',
  'INVALID_EMAIL': 'El formato del correo electrónico no es válido.',
  'INVALID_DOCUMENT': 'El número de documento no es válido.',
  'INVALID_PHONE': 'El número de teléfono no es válido.',
  
  // Errores generales
  'UNKNOWN_ERROR': 'Ocurrió un error inesperado. Intenta nuevamente.',
  'SERVER_ERROR': 'Error del servidor. Intenta más tarde.',
  'CLIENT_ERROR': 'Error en la solicitud. Verifica los datos ingresados.'
};

// Función principal para manejar errores
export const handleError = (error: any, context?: string): ApiError => {
  console.error(`Error en ${context || 'aplicación'}:`, error);

  let apiError: ApiError = {
    message: ERROR_MESSAGES.UNKNOWN_ERROR,
    status: 500,
    code: 'UNKNOWN_ERROR'
  };

  // Manejo de errores de Axios
  if (error?.response) {
    const { status, data } = error.response;
    apiError.status = status;
    apiError.details = data;

    switch (status) {
      case 400:
        apiError.code = 'CLIENT_ERROR';
        apiError.message = data?.message || ERROR_MESSAGES.CLIENT_ERROR;
        break;
      case 401:
        apiError.code = 'SIIGO_AUTH_ERROR';
        apiError.message = ERROR_MESSAGES.SIIGO_AUTH_ERROR;
        break;
      case 403:
        apiError.code = 'SIIGO_AUTH_ERROR';
        apiError.message = 'No tienes permisos para realizar esta acción.';
        break;
      case 404:
        apiError.code = 'NOT_FOUND';
        apiError.message = 'Recurso no encontrado.';
        break;
      case 422:
        apiError.code = 'SIIGO_INVALID_DATA';
        apiError.message = data?.message || ERROR_MESSAGES.SIIGO_INVALID_DATA;
        break;
      case 429:
        apiError.code = 'SIIGO_RATE_LIMIT';
        apiError.message = ERROR_MESSAGES.SIIGO_RATE_LIMIT;
        break;
      case 500:
      case 502:
      case 503:
        apiError.code = 'SIIGO_SERVER_ERROR';
        apiError.message = ERROR_MESSAGES.SIIGO_SERVER_ERROR;
        break;
      default:
        apiError.message = data?.message || ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }
  // Manejo de errores de red
  else if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    apiError.code = 'TIMEOUT_ERROR';
    apiError.message = ERROR_MESSAGES.TIMEOUT_ERROR;
  }
  else if (error?.code === 'NETWORK_ERROR' || !error?.response) {
    apiError.code = 'NETWORK_ERROR';
    apiError.message = ERROR_MESSAGES.NETWORK_ERROR;
  }
  // Errores personalizados
  else if (error?.message) {
    apiError.message = error.message;
    apiError.code = error.code || 'CUSTOM_ERROR';
  }

  return apiError;
};

// Función para mostrar toast de error
export const showErrorToast = (error: any, context?: string): void => {
  const apiError = handleError(error, context);
  
  toast.error(apiError.message, {
    duration: 5000,
    position: 'top-right',
    style: {
      background: '#ef4444',
      color: 'white',
      fontWeight: '500',
    },
    iconTheme: {
      primary: 'white',
      secondary: '#ef4444',
    },
  });
};

// Función para mostrar toast de éxito
export const showSuccessToast = (message: string): void => {
  toast.success(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#10b981',
      color: 'white',
      fontWeight: '500',
    },
    iconTheme: {
      primary: 'white',
      secondary: '#10b981',
    },
  });
};

// Función para mostrar toast de carga
export const showLoadingToast = (message: string): string => {
  return toast.loading(message, {
    position: 'top-right',
    style: {
      background: '#3b82f6',
      color: 'white',
      fontWeight: '500',
    },
  });
};

// Función para actualizar toast de carga
export const updateLoadingToast = (toastId: string, message: string, type: 'success' | 'error'): void => {
  if (type === 'success') {
    toast.success(message, { 
      id: toastId,
      duration: 4000,
    });
  } else {
    toast.error(message, { 
      id: toastId,
      duration: 5000,
    });
  }
};

// Función para validar datos del formulario
export const validateFormData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.name?.trim()) errors.push('El nombre es requerido');
  if (!data.lastName?.trim()) errors.push('El apellido es requerido');
  if (!data.email?.trim()) errors.push('El correo electrónico es requerido');
  if (!data.address?.trim()) errors.push('La dirección es requerida');
  if (!data.phone?.trim()) errors.push('El teléfono es requerido');
  if (!data.documentNumber) errors.push('El número de documento es requerido');
  if (!data.serviceValue || data.serviceValue <= 0) errors.push('El valor del servicio debe ser mayor a 0');

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email && !emailRegex.test(data.email)) {
    errors.push('El formato del correo electrónico no es válido');
  }

  // Validar número de documento
  if (data.documentNumber && data.documentNumber.toString().length < 6) {
    errors.push('El número de documento debe tener al menos 6 dígitos');
  }

  // Validar teléfono
  const phoneRegex = /^[0-9]{10}$/;
  if (data.phone && !phoneRegex.test(data.phone.replace(/\s/g, ''))) {
    errors.push('El teléfono debe tener 10 dígitos');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Wrapper para funciones async con manejo de errores
export const withErrorHandling = async <T>(
  asyncFn: () => Promise<T>,
  context?: string,
  showToast: boolean = true
): Promise<{ data?: T; error?: ApiError }> => {
  try {
    const data = await asyncFn();
    return { data };
  } catch (error) {
    const apiError = handleError(error, context);
    
    if (showToast) {
      showErrorToast(error, context);
    }
    
    return { error: apiError };
  }
};
