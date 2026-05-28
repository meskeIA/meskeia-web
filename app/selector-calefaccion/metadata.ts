import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Sistema de Calefacción — ¿Cuál me conviene? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué sistema de calefacción te conviene: caldera de gas, bomba de calor, aerotermia, suelo radiante o pellet. Según vivienda, uso y subvenciones disponibles.',
  keywords: [
    'qué calefacción instalar',
    'aerotermia o caldera de gas',
    'bomba de calor o gas natural',
    'selector calefacción',
    'mejor sistema de calefacción España',
    'cambiar caldera gas',
    'aerotermia precio España',
    'subvenciones calefacción 2025',
    'calefacción eficiente hogar',
    'bomba de calor aerotermia diferencia',
  ],
  openGraph: {
    title: '¿Qué sistema de calefacción te conviene? Test gratuito | meskeIA',
    description:
      'Aerotermia, bomba de calor, caldera de gas, pellet o suelo radiante. Descubre cuál se adapta mejor a tu vivienda, uso y presupuesto.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-calefaccion/',
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
    title: '¿Aerotermia o caldera? Test para elegir calefacción | meskeIA',
    description:
      'Test de 10 preguntas para encontrar tu sistema de calefacción ideal según vivienda, uso y subvenciones disponibles.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-calefaccion/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Sistema de Calefacción',
        description:
          'Test orientativo de 10 preguntas para descubrir qué sistema de calefacción (aerotermia, bomba de calor, caldera de gas, pellet o suelo radiante) se adapta mejor a tu vivienda, uso y presupuesto. Incluye información sobre subvenciones disponibles.',
        url: 'https://meskeia.com/selector-calefaccion/',
        features: [
          'Test de 10 preguntas sobre vivienda y uso',
          'Recomendación de sistema principal y alternativa',
          'Estimación de coste de instalación orientativa',
          'Información sobre subvenciones PERTE y Next Generation EU',
          'Pros y contras de cada tecnología',
          '100% en el navegador, sin registro ni instalación',
          'Gratuito y sin publicidad',
          'En español',
        ],
      })
    ),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Sistema de Calefacción",
  description: "Test de 10 preguntas para saber qué sistema de calefacción te conviene: caldera de gas, bomba de calor, aerotermia, suelo radiante o pellet. Según vivienda, uso y subvenciones disponibles.",
  url: "https://meskeia.com/selector-calefaccion/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué sistema de calefacción consume menos y es más barato?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En términos de coste de funcionamiento, las bombas de calor (aerotermia) son actualmente las más eficientes: por cada kWh eléctrico consumido generan entre 3 y 5 kWh de calor (COP 3-5). Sin embargo, el coste total depende del precio de la electricidad frente al gas, el aislamiento de la vivienda y la zona climática. En viviendas bien aisladas en zonas con inviernos suaves, la aerotermia suele ser la opción más económica a largo plazo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre bomba de calor y aerotermia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La aerotermia es un tipo concreto de bomba de calor que extrae la energía térmica del aire exterior. Existen otras bombas de calor que usan el suelo (geotermia) o el agua como fuente. En el mercado doméstico español, cuando se habla de "bomba de calor" para calefacción suele referirse a sistemas aire-aire o aire-agua, que son la base de la aerotermia. La diferencia clave está en el origen de la energía: aire, suelo o agua.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué subvenciones existen para cambiar la calefacción en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En 2025 siguen activas las ayudas del Plan de Recuperación (fondos Next Generation EU) canalizadas a través del IDAE y las comunidades autónomas. Las más relevantes son las del Programa PERTE para la rehabilitación energética de edificios y las ayudas directas a la sustitución de calderas de combustibles fósiles por sistemas de energía renovable (aerotermia, geotermia, biomasa). Los porcentajes de subvención oscilan entre el 30 % y el 70 % según la renta y el tipo de actuación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es viable instalar aerotermia en un piso antiguo con radiadores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, es posible, aunque requiere una evaluación técnica. La aerotermia funciona mejor con circuitos de baja temperatura (suelo radiante o fan-coils), pero se puede adaptar a radiadores convencionales si se sobredimensionan o si el edificio tiene un buen nivel de aislamiento. En pisos con radiadores estándar y mal aislados, la eficiencia de la aerotermia se reduce notablemente y el ahorro puede ser menor de lo esperado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta instalar una caldera de pellet frente a una de gas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una caldera de pellet de gama media para una vivienda unifamiliar cuesta entre 4.000 y 8.000 € instalada, frente a los 2.500-4.500 € de una caldera de gas de condensación. Sin embargo, el pellet es un combustible más barato que el gas natural en muchas zonas de España, lo que puede amortizar la diferencia en 5-8 años dependiendo del consumo. La caldera de pellet requiere además un espacio de almacenamiento y una limpieza periódica más frecuente.',
      },
    },
  ],
};
