import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Hashing y Colisiones | meskeIA',
  description:
    'Visualiza tablas hash, funciones hash (mod, polinómica, djb2) y colisiones. Encadenamiento vs sondeo lineal con factor de carga en tiempo real.',
  keywords:
    'tabla hash, hashing, función hash, colisiones, encadenamiento, sondeo lineal, factor de carga, djb2, estructuras de datos, informática',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Hashing y Colisiones',
    description:
      'Visualiza tablas hash con funciones hash y resolución de colisiones por encadenamiento o sondeo lineal. Factor de carga α en tiempo real.',
    url: 'https://meskeia.com/simulador-hashing-colisiones/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Hashing y Colisiones | meskeIA',
    description:
      'Tablas hash interactivas: encadenamiento vs sondeo lineal, funciones hash mod/polinómica/djb2, factor de carga α.',
  },
  other: {
    'application-name': 'Simulador Hashing meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Hashing y Colisiones',
  description:
    'Tablas hash interactivas con funciones hash y resolución de colisiones por encadenamiento o sondeo lineal.',
  url: 'https://meskeia.com/simulador-hashing-colisiones/',
  category: 'EducationalApplication',
  features: [
    'Tabla hash visual con CSS grid',
    'Funciones hash: suma ASCII mod m, polinómica mod m, djb2 mod m',
    'Encadenamiento separado vs sondeo lineal',
    'Factor de carga α = n/m en tiempo real con barra de progreso',
    '5 conjuntos de palabras predefinidas',
    'Cálculo paso a paso del índice hash',
  ],
});
