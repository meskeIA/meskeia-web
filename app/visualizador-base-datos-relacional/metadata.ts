import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Base de Datos Relacional: Tablas, JOIN e Índices | meskeIA',
  description:
    'Cómo funciona una base de datos relacional: tablas y claves primarias/foráneas, los 4 tipos de JOIN visualizados, índices que aceleran 1000x las consultas, transacciones ACID y cuándo elegir SQL vs NoSQL.',
  keywords: [
    'base de datos relacional',
    'SQL JOIN cómo funciona',
    'índices base de datos',
    'transacciones ACID',
    'SQL vs NoSQL cuándo usar',
    'clave primaria foránea',
    'normalización base de datos',
    'PostgreSQL MySQL concepto',
  ],
  openGraph: {
    title: 'Base de Datos Relacional: Tablas, JOIN e Índices | meskeIA',
    description:
      'Por qué un índice convierte una búsqueda de segundos en milisegundos — y cuándo NoSQL es mejor opción.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Base de Datos Relacional: Tablas, JOIN e Índices",
  description: "Cómo funciona una base de datos relacional: tablas y claves primarias/foráneas, los 4 tipos de JOIN visualizados, índices que aceleran 1000x las consultas, transacciones ACID y cuándo elegir SQL vs No",
  url: "https://meskeia.com/visualizador-base-datos-relacional/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una base de datos relacional y en qué se diferencia de NoSQL?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una base de datos relacional organiza los datos en tablas con filas y columnas, vinculadas entre sí mediante claves primarias y foráneas. Su lenguaje estándar es SQL. Las bases NoSQL (como MongoDB o Redis) almacenan datos en documentos, pares clave-valor o grafos, sin esquema fijo. Las relacionales son preferibles cuando los datos tienen estructura definida y se necesitan consultas complejas; NoSQL escala mejor para grandes volúmenes de datos semiestructurados o con patrones de acceso muy simples.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona un JOIN en SQL?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un JOIN combina filas de dos o más tablas basándose en una condición de coincidencia, normalmente entre una clave foránea y una clave primaria. El INNER JOIN devuelve solo las filas con coincidencia en ambas tablas. El LEFT JOIN incluye todas las filas de la tabla izquierda aunque no tengan coincidencia. El RIGHT JOIN hace lo inverso. El FULL OUTER JOIN devuelve todas las filas de ambas tablas, con NULL donde no hay coincidencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirven los índices en una base de datos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un índice es una estructura de datos auxiliar (normalmente un árbol B) que permite localizar registros sin recorrer toda la tabla. Sin índice, una búsqueda en una tabla de un millón de filas requiere examinarlas todas (O(n)). Con un índice bien diseñado, la búsqueda se reduce a unos pocos accesos a disco (O(log n)), lo que puede significar pasar de varios segundos a milisegundos. El coste es espacio adicional en disco y mayor tiempo en operaciones de escritura.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa que una base de datos sea ACID?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ACID son las cuatro propiedades que garantizan la fiabilidad de las transacciones: Atomicidad (la transacción se ejecuta completa o no se ejecuta en absoluto), Consistencia (los datos siempre pasan de un estado válido a otro), Aislamiento (transacciones concurrentes no interfieren entre sí) y Durabilidad (los datos confirmados persisten aunque falle el sistema). Estas propiedades son esenciales en aplicaciones bancarias, de comercio electrónico o cualquier sistema donde la integridad de los datos es crítica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué motor de base de datos relacional debo elegir: PostgreSQL, MySQL o SQLite?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'PostgreSQL es la opción más completa para producción: soporte avanzado de tipos (JSON, arrays, geoespacial), cumplimiento ACID estricto y extensibilidad. MySQL es muy popular en aplicaciones web por su velocidad en lecturas y amplio soporte de hosting. SQLite no requiere servidor y almacena la base de datos en un único archivo, ideal para aplicaciones móviles, prototipos o proyectos con un solo usuario concurrente. Para proyectos nuevos con necesidades complejas, PostgreSQL suele ser la elección más robusta.',
      },
    },
  ],
};
