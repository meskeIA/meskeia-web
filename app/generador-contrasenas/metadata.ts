import type { Metadata } from 'next';
import { generateGeneratorSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Contraseñas Seguras | meskeIA',
  description:
    'Generador de contraseñas seguras con algoritmos criptográficos avanzados. Personaliza longitud, caracteres y genera contraseñas imposibles de descifrar. 100% privado y gratuito.',
  keywords: [
    'generador contraseñas',
    'password generator español',
    'contraseñas seguras',
    'seguridad online',
    'ciberseguridad',
    'contraseñas aleatorias',
    'generador passwords',
    'contraseñas fuertes',
    'seguridad informática',
    'protección datos',
  ],
  authors: [{ name: 'meskeIA' }],
  openGraph: {
    type: 'website',
    title: 'Generador de Contraseñas Seguras - meskeIA',
    description:
      'Crea contraseñas ultra seguras con criptografía avanzada. Personalizable, privado, sin registro. Protege tus cuentas con la mejor seguridad.',
    url: 'https://meskeia.com/generador-contrasenas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary',
    title: 'Generador de Contraseñas Seguras - meskeIA',
    description:
      'Herramienta gratuita para generar contraseñas ultra seguras con criptografía de nivel militar',
  },
  alternates: {
    canonical: 'https://meskeia.com/generador-contrasenas/',
  },
};

// Schema.org JSON-LD con template reutilizable
export const jsonLd = generateGeneratorSchema({
  name: 'Generador de Contraseñas Seguras',
  description:
    'Generador de contraseñas ultra seguras con algoritmos criptográficos avanzados (Web Crypto API). Personaliza longitud, tipos de caracteres, cantidad y genera contraseñas imposibles de descifrar. 100% privado (todo en tu navegador).',
  url: 'https://meskeia.com/generador-contrasenas/',
  generatorType: 'Contraseñas Seguras',
  features: [
    'Generación criptográfica con Web Crypto API (crypto.getRandomValues)',
    'Longitud personalizable (8-128 caracteres)',
    'Control de tipos: mayúsculas, minúsculas, números, símbolos',
    'Generación múltiple (hasta 10 contraseñas simultáneas)',
    'Análisis de fortaleza en tiempo real (débil, media, fuerte, muy fuerte)',
    'Estimación de tiempo de hackeo',
    'Copiado al portapapeles con un clic',
    'Historial de contraseñas generadas',
    '100% privado - todo se ejecuta en tu navegador',
    'Sin almacenamiento en servidor',
    'Sin registro ni publicidad',
    'Funciona 100% offline (PWA)',
    'Responsive y optimizado para móviles',
  ],
});
