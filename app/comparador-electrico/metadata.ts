import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Comparador Eléctrico vs Gasolina — ¿Cuándo compensa el eléctrico? | meskeIA',
  description: 'Calcula el punto de equilibrio entre un coche eléctrico y uno de gasolina. Introduce los precios, km anuales, consumos y subsidio MOVES III. Muestra el año en que el eléctrico empieza a ser más barato.',
  keywords: [
    'eléctrico vs gasolina',
    'cuando compensa el eléctrico',
    'punto de equilibrio coche eléctrico',
    'MOVES III subsidio',
    'ahorro coche eléctrico',
    'comparador eléctrico gasolina diesel',
    'coste eléctrico por kilómetro',
    'break even coche eléctrico España',
  ],
  openGraph: {
    title: '¿Cuándo compensa el eléctrico? Calculadora de break-even | meskeIA',
    description: 'Compara el coste total de un eléctrico vs gasolina en tu situación real. Incluye MOVES III, cargador doméstico y proyección a 10 años.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/comparador-electrico/',
    siteName: 'meskeIA',
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Cuándo compensa el eléctrico? | meskeIA',
    description: 'Calcula el año exacto en que el coche eléctrico empieza a salirte más barato que la gasolina.',
  },
  alternates: {
    canonical: 'https://meskeia.com/comparador-electrico/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Comparador Eléctrico vs Combustión',
        description: 'Calculadora de punto de equilibrio entre vehículo eléctrico y de combustión. Compara costes reales incluyendo precio de compra, subsidios MOVES III, consumo eléctrico, precio de gasolina, cargador doméstico y proyección a N años.',
        url: 'https://meskeia.com/comparador-electrico/',
        features: [
          'Cálculo del año de break-even (punto de equilibrio)',
          'Proyección de ahorro acumulado a 5, 8, 10 y 15 años',
          'Integración del subsidio MOVES III (0 / 4.500 € / 7.000 €)',
          'Coste de instalación de cargador doméstico',
          'Tabla comparativa año a año',
          'Coste por kilómetro de cada opción',
          '100% en el navegador, sin registro',
          'Gratuito y en español',
        ],
      })
    ),
  },
};
