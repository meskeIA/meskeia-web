import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Insectos del Jardín - Identifica plagas y aliados del huerto | meskeIA',
  description: '35 insectos del jardín y huerto: beneficiosos, polinizadores, perjudiciales y neutros. Identifica plagas, actúa con control biológico y protege tus aliados. Gratis y sin registro.',
  keywords: 'insectos jardín, plagas jardín, mariquita, pulgón, control biológico, insectos beneficiosos, polinizadores jardín, mosca blanca, crisopa, abeja, huerto ecológico, identificar insectos, insectos huerto España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Insectos del Jardín - Identifica plagas y aliados del huerto',
    description: '35 insectos del jardín: beneficiosos, polinizadores y perjudiciales. Ficha completa con qué hacer ante cada uno. Control biológico y jardinería ecológica.',
    url: 'https://meskeia.com/guia-insectos-jardin/',
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
    title: 'Guía de Insectos del Jardín - Plagas y aliados',
    description: '35 insectos del jardín: identifica si son beneficiosos o perjudiciales y qué hacer con cada uno. Jardinería ecológica y control biológico.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Guía de Insectos del Jardín meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Insectos del Jardín',
  description: 'Directorio interactivo de 35 insectos comunes del jardín y huerto: mariquitas, pulgones, crisopas, mariposas, trips, moscas blancas, abejorros y más. Incluye rol (beneficioso, perjudicial, polinizador, neutro), zonas del jardín donde aparecen, dieta, cómo identificarlos y qué acción tomar. Enfocado en jardinería ecológica y control biológico.',
  url: 'https://meskeia.com/guia-insectos-jardin/',
  category: 'EducationalApplication',
  features: [
    '35 insectos con ficha completa: rol, orden, tamaño, zona, actividad y dieta',
    'Filtro por rol: beneficioso, perjudicial, polinizador, neutro',
    'Filtro por zona del jardín: suelo, plantas, flores, frutos, madera, raíces',
    'Buscador por nombre común y nombre científico',
    'Acción recomendada para cada insecto (qué hacer como jardinero)',
    'Curiosidad entomológica por especie',
    'Enfoque en control biológico y jardinería ecológica',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo identifico si un insecto en mi jardín es beneficioso o perjudicial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los insectos beneficiosos más comunes incluyen la mariquita (elimina pulgones), la crisopa verde (depredadora de ácaros y pulgones) y el abejorro (polinizador clave). Los perjudiciales más frecuentes son el pulgón, la mosca blanca y el trips. Observar qué come el insecto y los daños visibles en las plantas es el primer paso para identificarlos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el control biológico de plagas en el jardín?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El control biológico consiste en usar organismos vivos, principalmente insectos depredadores o parásitos, para reducir la población de plagas sin recurrir a pesticidas químicos. Por ejemplo, liberar mariquitas para combatir pulgones o atraer crisopas plantando flores silvestres. Es el método central de la jardinería ecológica y no daña a los polinizadores.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué insectos debo proteger en mi huerto para que las plantas crezcan mejor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hay que proteger especialmente a los polinizadores (abejas, abejorros, mariposas) y a los depredadores naturales de plagas (mariquitas, crisopas, arañas de jardín, tijeretas). Evitar insecticidas de amplio espectro y plantar flores con néctar entre los cultivos favorece su presencia y aumenta la producción de frutos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre plaga y presencia puntual de un insecto perjudicial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una plaga implica una proliferación que supera el umbral de daño económico o estético: colonias de pulgones que cubren los brotes, trips que decoloran hojas o mosca blanca que debilita la planta. Una presencia puntual de un insecto herbívoro, en cambio, suele ser inofensiva y no requiere intervención. Actuar solo cuando el daño es visible evita eliminar también a sus depredadores naturales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos insectos hay catalogados y qué información incluye cada ficha?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La guía incluye 35 insectos del jardín y huerto. Cada ficha recoge el rol (beneficioso, perjudicial, polinizador o neutro), el orden taxonómico, el tamaño aproximado, las zonas del jardín donde aparece, la actividad (diurna/nocturna), la dieta, cómo identificarlo visualmente, qué acción tomar y una curiosidad entomológica. Puede filtrarse por rol o zona y buscarse por nombre común o científico.',
      },
    },
  ],
};
