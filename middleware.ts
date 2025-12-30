import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { MAINTENANCE_MODE, MAINTENANCE_EXCLUDED_PATHS } from './maintenance.config';

export function middleware(request: NextRequest) {
  // Si el modo mantenimiento está desactivado, no hacer nada
  if (!MAINTENANCE_MODE) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Verificar si la ruta está excluida del mantenimiento
  const isExcluded = MAINTENANCE_EXCLUDED_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  // Si la ruta está excluida, permitir acceso
  if (isExcluded) {
    return NextResponse.next();
  }

  // Redirigir todas las demás rutas a /mantenimiento
  const maintenanceUrl = new URL('/mantenimiento', request.url);
  return NextResponse.redirect(maintenanceUrl);
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
  matcher: [
    /*
     * Aplicar a todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico, archivos de imagen
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
