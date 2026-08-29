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
    url: 'https://meskeia.com/simulador-sql-join/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de SQL JOIN Visual | meskeIA',
    description: 'Aprende SQL JOIN con simulaciones interactivas',
    images: ['https://meskeia.com/stemum/og-image.png']
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
    'En español',
  ],
  keywords: ['SQL JOIN', 'bases de datos', 'INNER LEFT RIGHT', 'informática universidad'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un JOIN en SQL y para qué se usa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un JOIN en SQL es una operación que combina filas de dos o más tablas basándose en una columna relacionada entre ellas. Se usa cuando los datos de interés están repartidos en varias tablas: por ejemplo, unir una tabla de clientes con una tabla de pedidos para ver qué cliente hizo qué compra. Sin JOIN habría que hacer consultas separadas y cruzar los resultados manualmente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre INNER JOIN y LEFT JOIN?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'INNER JOIN devuelve solo las filas que tienen correspondencia en ambas tablas; las filas sin pareja se descartan. LEFT JOIN devuelve todas las filas de la tabla izquierda aunque no tengan coincidencia en la derecha, rellenando con NULL las columnas de la tabla derecha cuando no hay match. RIGHT JOIN hace lo mismo pero conservando todas las filas de la tabla derecha.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa que aparezca NULL en el resultado de un JOIN?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un NULL en el resultado de un JOIN indica que esa fila no tenía correspondencia en la otra tabla. Aparece en LEFT, RIGHT y FULL OUTER JOIN: por ejemplo, en un LEFT JOIN, si un cliente no tiene ningún pedido, las columnas de la tabla de pedidos aparecerán como NULL en su fila. Es importante tenerlo en cuenta al filtrar resultados con WHERE, porque NULL no es igual a ningún valor, ni siquiera a otro NULL.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve el FULL OUTER JOIN y cuándo conviene usarlo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'FULL OUTER JOIN devuelve todas las filas de ambas tablas, con NULL en las columnas de la tabla que no tiene correspondencia. Es útil cuando se quiere identificar registros sin pareja en cualquiera de los dos lados: por ejemplo, detectar clientes sin pedidos Y pedidos sin cliente asignado en una sola consulta. No está disponible nativamente en MySQL (se simula con UNION de LEFT y RIGHT JOIN).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el producto cartesiano y cuándo se produce con CROSS JOIN?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El producto cartesiano combina cada fila de la tabla A con cada fila de la tabla B, sin ninguna condición de coincidencia. CROSS JOIN lo genera explícitamente: si A tiene 4 filas y B tiene 3, el resultado tendrá 12 filas. Se usa en casos concretos como generar combinaciones de tallas y colores en un catálogo de productos. Hay que usarlo con cuidado porque tablas grandes producen resultados enormes.',
      },
    },
  ],
};
