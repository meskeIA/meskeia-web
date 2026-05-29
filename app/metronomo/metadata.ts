import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Metrónomo Online - Tempo Preciso para Músicos | meskeIA',
  description: 'Metrónomo online gratuito con tempo ajustable (40-220 BPM), tap tempo, múltiples compases y visualización del pulso. Ideal para práctica musical.',
  keywords: 'metronomo, metronomo online, tempo, bpm, musica, practica musical, compas, tap tempo, ritmo, musicos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Metrónomo Online - Tempo Preciso para Músicos',
    description: 'Metrónomo online gratuito con tempo ajustable, tap tempo y múltiples compases.',
    url: 'https://meskeia.com/metronomo/',
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
    title: 'Metrónomo Online - Tempo Preciso para Músicos',
    description: 'Metrónomo online gratuito con tempo ajustable, tap tempo y múltiples compases.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Metrónomo Online",
  description: "Metrónomo online gratuito con tempo ajustable (40-220 BPM), tap tempo, múltiples compases y visualización del pulso. Ideal para práctica musical.",
  url: "https://meskeia.com/metronomo/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Para qué sirve un metrónomo al practicar música?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El metrónomo mantiene un pulso constante durante la práctica musical, lo que ayuda a desarrollar el sentido del ritmo y a tocar con precisión temporal. Practicar con metrónomo es especialmente útil para identificar inestabilidades en el tempo, trabajar pasajes difíciles a velocidad reducida y aumentar gradualmente la velocidad de forma controlada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se usa el tap tempo en un metrónomo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tap tempo permite detectar automáticamente los BPM de una canción: simplemente pulsa el botón varias veces siguiendo el pulso de la música que escuchas. El metrónomo calcula el promedio de tus pulsaciones y ajusta el tempo en consecuencia. Es útil cuando quieres replicar el tempo exacto de una grabación sin medirlo manualmente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué rango de BPM cubre este metrónomo y qué significan los tempos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Este metrónomo cubre de 40 a 220 BPM. Como referencia: Largo (40-60 BPM) es muy lento y solemne; Andante (76-108) es un paso moderado; Allegro (120-168) es rápido y animado; Presto (168-200) es muy rápido. La mayoría de estilos populares se sitúan entre 80 y 140 BPM.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los compases más habituales y cómo afectan al metrónomo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los compases más comunes son 4/4 (cuatro pulsos por compás, el más frecuente en pop y rock), 3/4 (tres pulsos, típico del vals), 6/8 (seis corcheas, muy usado en música folclórica) y 2/4 (marchas). El metrónomo acentúa el primer tiempo de cada compás para que puedas percibir la estructura métrica de forma auditiva.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito instalar algo para usar este metrónomo online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. El metrónomo funciona directamente en el navegador sin instalación, sin aplicación móvil y sin registro. Solo necesitas activar el audio del dispositivo. Es compatible con ordenadores, tablets y teléfonos móviles modernos.',
      },
    },
  ],
};
