import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de SQL JOIN Visual - INNER LEFT RIGHT FULL | meskeIA',
  description: 'Visualiza cómo funcionan los JOIN de SQL: INNER, LEFT, RIGHT, FULL OUTER y CROSS. Tablas editables, diagrama de Venn animado, líneas de conexión y consulta SQL generada. Bases de datos.',
  keywords: 'SQL JOIN, INNER LEFT RIGHT FULL OUTER, diagrama Venn JOIN, bases de datos, producto cartesiano, CROSS JOIN, SQL didáctico, informática universidad, NULL OUTER',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-sql-join/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de SQL JOIN Visual | meskeIA',
    description: 'Aprende los JOIN de SQL con diagrama de Venn y líneas de coincidencia interactivas',
    url: 'https://meskeia.com/simulador-sql-join',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de SQL JOIN Visual | meskeIA',
    description: 'Aprende SQL JOIN con simulaciones interactivas',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de SQL JOIN Visual',
  description: 'Simulador interactivo para entender los JOIN de SQL. Define dos tablas pequeñas, elige INNER, LEFT, RIGHT, FULL OUTER o CROSS JOIN y observa la operación con diagrama de Venn animado, líneas de conexión entre filas y la consulta SQL generada.',
  url: 'https://meskeia.com/simulador-sql-join/',
  category: 'EducationalApplication',
  features: [
    '5 tipos de JOIN: INNER, LEFT, RIGHT, FULL OUTER, CROSS',
    'Tablas A y B editables con hasta 6 filas cada una',
    'Diagrama de Venn animado con sombreado del JOIN',
    'Líneas SVG conectando filas coincidentes',
    'Consulta SQL generada automáticamente',
    'Tabla resultado con NULL resaltados',
    '4 ejemplos clásicos (empleados, pedidos, productos, estudiantes)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['SQL JOIN', 'bases de datos', 'INNER LEFT RIGHT', 'informática universidad'],
});
