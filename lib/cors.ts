/**
 * Utilidad CORS centralizada para API Routes meskeIA
 *
 * En producción: solo permite requests desde meskeia.com
 * En desarrollo: permite cualquier origen (localhost, etc.)
 */

const ALLOWED_ORIGINS = [
  'https://meskeia.com',
  'https://www.meskeia.com',
];

/**
 * Obtiene el origen permitido según el entorno
 * En producción solo acepta meskeia.com, en desarrollo acepta cualquier origen
 */
function getAllowedOrigin(requestOrigin?: string | null): string {
  // En desarrollo, permitir cualquier origen
  if (process.env.NODE_ENV === 'development') {
    return requestOrigin || '*';
  }

  // En producción, verificar que el origen esté en la lista permitida
  if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) {
    return requestOrigin;
  }

  // Por defecto en producción, devolver el dominio principal
  return 'https://meskeia.com';
}

/**
 * Genera headers CORS para una API Route
 * @param methods - Métodos HTTP permitidos (ej: 'GET, POST, OPTIONS')
 * @param requestOrigin - Origen de la petición (request.headers.get('origin'))
 */
export function getCorsHeaders(methods: string, requestOrigin?: string | null): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(requestOrigin),
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
