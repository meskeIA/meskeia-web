import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Energía para el Hogar — ¿Gas, eléctrico, aerotermia o biomasa? | meskeIA',
  description: 'Test de 10 preguntas para saber qué sistema de calefacción y agua caliente te conviene: electricidad/bomba de calor, gas natural, aerotermia, biomasa/pellets o solar térmica. Sin marcas, análisis técnico y económico.',
  keywords: ['gas o aerotermia', 'bomba de calor o gas natural', 'qué calefacción elegir', 'aerotermia o caldera gas', 'pellets o gas', 'sistema calefacción eficiente España', 'calefacción más barata 2025', 'cambiar caldera a bomba de calor', 'ayudas rehabilitación energética', 'qué energía hogar elegir'],
  openGraph: {
    title: '¿Gas, aerotermia o biomasa? Test de energía para el hogar | meskeIA',
    description: 'Descubre qué sistema energético se adapta mejor a tu vivienda, zona climática y presupuesto.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-energia-hogar/',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Qué energía para tu hogar? Test gratuito | meskeIA',
    description: 'Test de 10 preguntas para elegir entre gas natural, bomba de calor, aerotermia, biomasa o solar térmica.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: { canonical: 'https://meskeia.com/selector-energia-hogar/' },
  other: {
    'schema:WebApplication': JSON.stringify(generateWebAppSchema({
      name: 'Selector de Energía para el Hogar',
      description: 'Test orientativo para saber qué sistema de calefacción y agua caliente (gas, eléctrico/bomba de calor, aerotermia, biomasa o solar térmica) se adapta mejor a la vivienda.',
      url: 'https://meskeia.com/selector-energia-hogar/',
      features: [
        'Test de 10 preguntas sobre vivienda y preferencias',
        '5 sistemas: gas natural, electricidad/bomba calor, aerotermia, biomasa, solar+backup',
        'Análisis de zona climática, presupuesto y espacio',
        'Orientación sobre ayudas y subvenciones',
        '100% en el navegador, gratuito, en español',
      ],
    })),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Energía para el Hogar",
  description: "Test de 10 preguntas para saber qué sistema de calefacción y agua caliente te conviene: electricidad/bomba de calor, gas natural, aerotermia, biomasa/pellets o solar térmica. Sin marcas, análisis técn",
  url: "https://meskeia.com/selector-energia-hogar/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre aerotermia y bomba de calor convencional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La aerotermia es un tipo específico de bomba de calor que extrae energía del aire exterior para producir calefacción, refrigeración y agua caliente sanitaria (ACS) en un único sistema. Una bomba de calor convencional puede referirse a equipos split (solo climatización, sin ACS) o a sistemas de suelo radiante. La aerotermia es la opción más completa para sustituir una caldera de gas de forma íntegra. Su eficiencia (COP) varía entre 2,5 y 4,5 según la temperatura exterior.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta instalar aerotermia en una vivienda y qué ayudas existen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El coste de instalación de aerotermia en una vivienda de tamaño medio oscila entre 6.000 y 12.000 €, incluyendo el equipo y la adaptación del sistema de distribución (radiadores de baja temperatura o suelo radiante). Las ayudas del programa PERTE Rehabilitación y los fondos Next Generation EU pueden cubrir entre el 40% y el 80% de la inversión según el nivel de renta y la mejora energética obtenida. Conviene consultar con el IDAE o con tu comunidad autónoma para conocer las convocatorias vigentes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué tipo de vivienda no es adecuada la aerotermia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La aerotermia pierde eficiencia en zonas con inviernos muy fríos (por debajo de -10 °C prolongados), aunque los modelos modernos funcionan hasta -25 °C. También puede ser poco rentable en viviendas con muy baja demanda de calefacción (pisos pequeños bien orientados en clima mediterráneo) o en edificios donde el coste de adaptación del sistema de distribución es prohibitivo. En esos casos, la caldera de gas de condensación o la biomasa pueden ser opciones más eficientes económicamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es rentable instalar biomasa (pellets) frente al gas natural?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La biomasa tiene un coste de combustible habitualmente inferior al gas natural, pero requiere mayor inversión inicial (caldera + silo/almacenamiento: 8.000-15.000 €) y más mantenimiento. Es especialmente rentable en viviendas unifamiliares con alta demanda de calefacción, zonas sin red de gas natural o con acceso local a pellets o leña. En zonas urbanas con gas natural canalizado, la diferencia de coste operativo no siempre compensa la inversión y la gestión del combustible sólido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué sistema de calefacción consume menos electricidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las bombas de calor (aerotermia incluida) son los sistemas eléctricos más eficientes: por cada kWh eléctrico consumido, producen entre 2,5 y 4,5 kWh de calor. Los radiadores eléctricos de resistencia tienen un rendimiento del 100% (1 kWh eléctrico = 1 kWh de calor), lo que los hace hasta 3-4 veces menos eficientes que una bomba de calor. El suelo radiante combinado con bomba de calor es el sistema eléctrico de mayor eficiencia global en viviendas bien aisladas.',
      },
    },
  ],
};
