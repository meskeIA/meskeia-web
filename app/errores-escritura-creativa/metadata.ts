import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Errores de Escritura Creativa — 15 Fallos con Correcciones y Ejemplos | meskeIA',
  description: '15 errores frecuentes en escritura creativa con ejemplo incorrecto y corrección comentada. Head-hopping, diálogos de exposición, el truco del espejo, adjetivitis y más. Con consejo práctico para cada caso.',
  keywords: 'errores escritura creativa, como escribir mejor, head hopping narrador, show dont tell, dialogos realistas, adjetivitis, escritura de novela, tecnica narrativa, fallos escritores, mary sue, deus ex machina',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Errores de Escritura Creativa — 15 Fallos con Correcciones',
    description: '15 errores frecuentes en escritura creativa con ejemplos malos y correcciones explicadas. Aprende qué falla y por qué.',
    url: 'https://meskeia.com/errores-escritura-creativa',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Errores de Escritura Creativa — 15 Fallos con Correcciones',
    description: '15 errores frecuentes en escritura creativa con ejemplos. Head-hopping, el truco del espejo, adjetivitis y más.',
  },
  other: {
    'application-name': 'Errores de Escritura Creativa meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Errores de Escritura Creativa — 15 Fallos con Correcciones',
  description: 'Directorio de 15 errores frecuentes en escritura creativa con ejemplo incorrecto y corrección comentada. Cubre voz narrativa, diálogos, descripción, estructura, personajes y estilo.',
  url: 'https://meskeia.com/errores-escritura-creativa/',
  category: 'EducationalApplication',
  features: [
    '15 errores frecuentes en escritura creativa analizados en profundidad',
    'Ejemplo de texto incorrecto y corrección explicada para cada error',
    'Explicación del porqué falla y porqué funciona la corrección',
    'Filtros por categoría: voz, diálogos, descripción, estructura, personajes, estilo',
    'Niveles básico, intermedio y avanzado',
    'Consejo práctico aplicable directamente al manuscrito',
    'Proceso de revisión en 5 pasadas',
    'Gratuito, sin registro, en español',
  ],
});
