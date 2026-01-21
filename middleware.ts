import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de acceso restringido para modo mantenimiento
 *
 * Permite acceso solo a usuarios con el token correcto (vía cookie o URL).
 *
 * Flujo:
 * 1. Usuario accede con ?access=TOKEN → Se guarda cookie → Redirige a /
 * 2. Usuario con cookie válida → Acceso normal
 * 3. Usuario sin cookie → Página de mantenimiento (503)
 *
 * Para desactivar: eliminar este archivo y hacer deploy
 *
 * @author meskeIA
 * @date 2026-01-21
 */

const SECRET_TOKEN = process.env.MAINTENANCE_ACCESS_TOKEN;
const COOKIE_NAME = 'meskeia_access';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 año en segundos

// Página de mantenimiento con estilo meskeIA
const MAINTENANCE_HTML = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>meskeIA - Mantenimiento</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #2E86AB 0%, #48A9A6 100%);
      color: white;
      text-align: center;
      padding: 2rem;
    }
    .container {
      max-width: 500px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 3rem 2rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .icon { font-size: 4rem; margin-bottom: 1.5rem; }
    h1 { font-size: 1.8rem; margin-bottom: 1rem; font-weight: 600; }
    p { font-size: 1.1rem; opacity: 0.9; line-height: 1.6; }
    .logo {
      margin-top: 2rem;
      font-size: 1.2rem;
      font-weight: 700;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🔧</div>
    <h1>Sitio en mantenimiento</h1>
    <p>Estamos trabajando para mejorar tu experiencia. Volvemos pronto.</p>
    <div class="logo">meskeIA</div>
  </div>
</body>
</html>
`;

export function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Si no hay token configurado, permitir acceso (failsafe)
  if (!SECRET_TOKEN) {
    console.warn('MAINTENANCE_ACCESS_TOKEN no configurado - acceso permitido');
    return NextResponse.next();
  }

  // Verificar si viene con el token en la URL
  const accessParam = url.searchParams.get('access');
  if (accessParam === SECRET_TOKEN) {
    // Token correcto: dar cookie y redirigir a la raíz (sin el token en URL)
    const cleanUrl = new URL('/', request.url);
    const response = NextResponse.redirect(cleanUrl);

    response.cookies.set(COOKIE_NAME, SECRET_TOKEN, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });

    return response;
  }

  // Verificar si tiene cookie válida
  const cookieValue = request.cookies.get(COOKIE_NAME)?.value;
  if (cookieValue === SECRET_TOKEN) {
    return NextResponse.next();
  }

  // Sin acceso: mostrar página de mantenimiento
  return new NextResponse(MAINTENANCE_HTML, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Retry-After': '3600', // Sugerir reintentar en 1 hora
    },
  });
}

// Configuración: aplicar a todas las rutas excepto archivos estáticos y API
export const config = {
  matcher: [
    /*
     * Aplicar a todas las rutas excepto:
     * - api (API routes)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico, robots.txt, sitemap.xml (archivos públicos)
     * - Archivos con extensión (imágenes, fuentes, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
  ],
};
