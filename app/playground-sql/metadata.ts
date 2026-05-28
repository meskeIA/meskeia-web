import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Playground SQL - Editor y Ejercicios Interactivos | meskeIA',
  description: 'Aprende SQL practicando en el navegador. Editor interactivo con datasets de ejemplo, ejercicios guiados y resultados en tiempo real. Sin instalar nada.',
  keywords: 'playground sql, editor sql online, aprender sql, sql ejercicios, base de datos, sqlite, consultas sql, select, join, group by, practicar sql, sql español',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Playground SQL - Aprende SQL Practicando | meskeIA',
    description: 'Editor SQL interactivo con ejercicios guiados. Practica SELECT, JOIN, GROUP BY y más sin instalar nada.',
    url: 'https://meskeia.com/playground-sql/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Playground SQL | meskeIA',
    description: 'Aprende SQL practicando en el navegador con ejercicios guiados.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Playground SQL",
  description: "Aprende SQL practicando en el navegador. Editor interactivo con datasets de ejemplo, ejercicios guiados y resultados en tiempo real. Sin instalar nada.",
  url: "https://meskeia.com/playground-sql/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es SQL y para qué se usa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SQL (Structured Query Language) es el lenguaje estándar para gestionar y consultar bases de datos relacionales. Se usa para crear tablas, insertar datos, realizar búsquedas con SELECT, combinar tablas con JOIN, agrupar resultados con GROUP BY y mucho más. Es una de las habilidades más demandadas en perfiles de desarrollador, analista de datos y científico de datos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona un playground SQL en el navegador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El playground ejecuta consultas SQL usando SQLite compilado en WebAssembly (sql.js), lo que permite correr un motor de base de datos completo directamente en el navegador sin enviar datos a ningún servidor. Puedes escribir consultas, ver los resultados en tiempo real y experimentar con datasets de ejemplo sin instalar nada ni crear ninguna cuenta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las cláusulas SQL más importantes para aprender primero?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El orden de aprendizaje recomendado es: SELECT y FROM (recuperar datos), WHERE (filtrar filas), ORDER BY (ordenar), GROUP BY con COUNT/SUM/AVG (agregar), JOIN (combinar tablas) y HAVING (filtrar grupos). Con estas cláusulas se resuelven el 80% de las consultas del día a día en análisis de datos y desarrollo de aplicaciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia este playground de instalar MySQL o PostgreSQL?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Instalar MySQL o PostgreSQL requiere descargar software, configurar un servidor local y gestionar usuarios y permisos, lo que puede llevar horas a un principiante. Este playground funciona al instante desde el navegador y cubre toda la sintaxis SQL estándar (ANSI SQL), que es compatible con MySQL, PostgreSQL, SQL Server y otros sistemas. Es ideal para aprender la base antes de pasar a un sistema concreto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es SQL difícil de aprender desde cero?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SQL es uno de los lenguajes más accesibles para principiantes porque su sintaxis se parece al inglés natural. En pocas horas se puede aprender a realizar consultas básicas con SELECT, WHERE y ORDER BY. Las partes más complejas (subconsultas, CTEs, window functions) requieren más práctica, pero son innecesarias al inicio. Practicar con ejercicios reales, como los de este playground, es la forma más rápida de avanzar.',
      },
    },
  ],
};
