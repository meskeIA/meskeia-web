import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Qué Pasa Cuando Duermes - Ciclos y Fases del Sueño | meskeIA',
  description: 'Explora la ciencia del sueño de forma visual: fases N1-N2-N3-REM, hipnograma interactivo, horas necesarias por edad, enemigos del sueño con consejos basados en ciencia. Explicador visual interactivo.',
  keywords: 'ciclos sueno, fases sueno, REM, sueno profundo, hipnograma, higiene sueno, horas dormir, N1 N2 N3, ondas cerebrales, ciencia del sueño',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Qué Pasa Cuando Duermes - Ciclos y Fases del Sueño',
    description: 'Fases del sueño, hipnograma, horas por edad y enemigos del descanso. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-ciclos-sueno/',
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
    title: 'Qué Pasa Cuando Duermes - Explicador Visual',
    description: 'La ciencia del sueño explicada visualmente: fases, ciclos, necesidades por edad y enemigos del descanso.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Ciclos Sueño meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Qué Pasa Cuando Duermes - Ciclos y Fases del Sueño',
  description: 'Explicador visual interactivo sobre la ciencia del sueño: las 4 fases (N1, N2, N3, REM), hipnograma de una noche entera, horas necesarias según la edad y los 6 enemigos del sueño con consejos basados en evidencia.',
  url: 'https://meskeia.com/visualizador-ciclos-sueno/',
  category: 'EducationalApplication',
  features: [
    'Las 4 fases del sueño explicadas: ondas cerebrales, temperatura, tono muscular',
    'Hipnograma CSS interactivo de 8 horas con ciclos de 90 minutos',
    'Horas de sueño necesarias por grupo de edad (recién nacido a anciano)',
    '6 enemigos del sueño con medidor de impacto y consejos científicos',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos ciclos de sueño tiene una noche normal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una noche de sueño de 7-9 horas contiene entre 4 y 6 ciclos completos. Cada ciclo dura aproximadamente 90 minutos y atraviesa las fases N1 (sueño ligero), N2 (sueño consolidado), N3 (sueño profundo) y REM. Los primeros ciclos de la noche contienen más sueño profundo N3, mientras que los últimos tienen mayor proporción de fase REM.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el sueño REM y el sueño profundo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El sueño profundo (fase N3) es el momento de mayor recuperación física: el cuerpo repara tejidos, refuerza el sistema inmune y consolida la memoria declarativa. La fase REM (movimientos oculares rápidos) es donde ocurren la mayoría de los sueños y se consolida la memoria emocional y procedimental. Durante el REM el cerebro es muy activo pero el cuerpo permanece paralizado; en el sueño profundo tanto el cerebro como el cuerpo están en reposo máximo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas horas de sueño necesita un adulto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los adultos entre 18 y 64 años necesitan entre 7 y 9 horas de sueño por noche según la National Sleep Foundation y la Academia Americana de Medicina del Sueño. Los mayores de 65 años pueden funcionar bien con 7-8 horas. Dormir menos de 6 horas de forma crónica se asocia con mayor riesgo cardiovascular, metabólico y cognitivo. Las necesidades individuales varían, pero menos del 3 % de la población tiene una mutación genética que le permite funcionar bien con menos de 6 horas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la pantalla del móvil afecta al sueño?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La luz azul emitida por pantallas (móviles, tabletas, ordenadores) suprime la producción de melatonina, la hormona que regula el ritmo circadiano y señala al cerebro que es hora de dormir. Estudios muestran que el uso de pantallas en la hora previa al sueño puede retrasar el inicio del sueño entre 30 y 60 minutos y reducir la fase REM. Se recomienda evitar pantallas al menos 30-60 minutos antes de acostarse.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un hipnograma y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un hipnograma es un gráfico que representa la arquitectura del sueño a lo largo de la noche: muestra en el eje X las horas y en el eje Y las distintas fases (N1, N2, N3, REM y vigilia). Permite visualizar cuándo ocurre cada fase, la duración de los ciclos y la proporción de sueño profundo frente a sueño ligero. Los médicos especialistas del sueño lo utilizan para diagnosticar trastornos como la apnea o el insomnio.',
      },
    },
  ],
};
