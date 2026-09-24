import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import {
  SISTEMAS,
  RENDIMIENTO_AEROTERMIA,
  FUENTE_RENDIMIENTO,
  SIN_AYUDAS_CALDERAS_FOSILES,
  AYUDAS_RENOVABLES,
  AYUDAS_PROGRAMA_2021,
} from './motor';

/*
 * Los resultados posibles son los cinco sistemas de motor.ts. El suelo radiante es una
 * RESPUESTA de la pregunta 3, no un resultado, y los radiadores eléctricos sí lo son y no se
 * nombraban (hallazgo 1394): este es el texto que leen los buscadores y las IA.
 */
const SISTEMAS_EN_TEXTO = 'aerotermia, bomba de calor (split), caldera de gas, pellet o radiadores eléctricos';
const DESCRIPCION = `Test de 10 preguntas para saber qué sistema de calefacción te conviene: ${SISTEMAS_EN_TEXTO}. Según vivienda, clima, uso, presupuesto y ayudas públicas.`;

/** Características REALES de la app, para los dos schema (familia de selectores, forma e). */
const CARACTERISTICAS = [
  'Test de 10 preguntas sobre vivienda, clima, uso y presupuesto',
  'Recomendación de sistema principal y alternativa entre cinco tecnologías',
  'Aparta, y lo explica, los sistemas que no caben en el presupuesto o que necesitan una unidad exterior o gas natural que no tienes',
  'Coste de instalación y coste anual orientativos',
  'Ventajas e inconvenientes del sistema recomendado y de la alternativa',
  'Información sobre ayudas públicas y la normativa europea de calderas',
  '100% en el navegador, sin registro ni instalación',
];

export const metadata: Metadata = {
  title: 'Selector de Sistema de Calefacción — ¿Cuál me conviene? | meskeIA',
  description: DESCRIPCION,
  keywords: [
    'qué calefacción instalar',
    'aerotermia o caldera de gas',
    'bomba de calor o gas natural',
    'selector calefacción',
    'mejor sistema de calefacción España',
    'cambiar caldera gas',
    'aerotermia precio España',
    'subvenciones calefacción',
    'calefacción eficiente hogar',
    'bomba de calor aerotermia diferencia',
  ],
  openGraph: {
    title: '¿Qué sistema de calefacción te conviene? Test gratuito | meskeIA',
    description:
      'Aerotermia, bomba de calor (split), caldera de gas, pellet o radiadores eléctricos. Descubre cuál se adapta mejor a tu vivienda, uso y presupuesto.',
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
      'Test de 10 preguntas para encontrar tu sistema de calefacción ideal según vivienda, uso, presupuesto y ayudas públicas.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-calefaccion/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Sistema de Calefacción',
        description: `Test orientativo de 10 preguntas para descubrir qué sistema de calefacción (${SISTEMAS_EN_TEXTO}) se adapta mejor a tu vivienda, uso y presupuesto. Incluye información sobre ayudas públicas.`,
        url: 'https://meskeia.com/selector-calefaccion/',
        features: CARACTERISTICAS,
      })
    ),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Sistema de Calefacción",
  description: DESCRIPCION,
  url: "https://meskeia.com/selector-calefaccion/",
  category: 'FinanceApplication',
  features: CARACTERISTICAS,
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
        text: `En coste de funcionamiento, las bombas de calor (aerotermia) están entre los sistemas más eficientes: generan ${RENDIMIENTO_AEROTERMIA} (${FUENTE_RENDIMIENTO}), algo menos con mucho frío o con radiadores de alta temperatura. El coste total depende del precio de la electricidad frente al del gas, del aislamiento de la vivienda y del clima. Como orientación, este test usa un coste anual de ${SISTEMAS.aerotermia.costeAnual} para la aerotermia, ${SISTEMAS['caldera-gas'].costeAnual} para la caldera de gas y ${SISTEMAS.electrico.costeAnual} para los radiadores eléctricos.`,
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
        text: `${AYUDAS_RENOVABLES} Conviene comprobar en la agencia de energía de la comunidad o en el IDAE si hay alguna convocatoria abierta. ${AYUDAS_PROGRAMA_2021} Para una caldera de gas nueva no hay ayudas: ${SIN_AYUDAS_CALDERAS_FOSILES}.`,
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
        text: `Con las horquillas orientativas que usa este test, una caldera o estufa de pellet cuesta ${SISTEMAS.pellet.costeInstalacion} instalada y una caldera de gas ${SISTEMAS['caldera-gas'].costeInstalacion}; el coste anual orientativo es de ${SISTEMAS.pellet.costeAnual} frente a ${SISTEMAS['caldera-gas'].costeAnual}. El pellet necesita además espacio de almacenamiento y un mantenimiento más frecuente, y la caldera de gas, acometida de gas natural. De las dos, solo la de pellet puede optar hoy a ayudas públicas en la UE: la de gas quedó fuera en 2025.`,
      },
    },
  ],
};
