import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Velocidad de Escritura - Mide tus PPM y Precisión | meskeIA',
  description: 'Test de mecanografía online gratuito. Mide tu velocidad de escritura en palabras por minuto (PPM), precisión y mejora tu técnica con textos en español.',
  keywords: 'test velocidad escritura, palabras por minuto, ppm, mecanografia, typing test, velocidad teclear, test mecanografia español',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Velocidad de Escritura - meskeIA',
    description: 'Mide tu velocidad de escritura en palabras por minuto y mejora tu mecanografía.',
    url: 'https://meskeia.com/test-velocidad-escritura/',
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
    title: 'Test de Velocidad de Escritura',
    description: 'Mide tu velocidad de escritura en palabras por minuto y mejora tu mecanografía.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Test de Velocidad de Escritura",
  description: "Test de mecanografía online gratuito. Mide tu velocidad de escritura en palabras por minuto (PPM), precisión y mejora tu técnica con textos en español.",
  url: "https://meskeia.com/test-velocidad-escritura/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántas palabras por minuto escribe una persona media?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La velocidad de escritura media con teclado se sitúa entre 40 y 60 palabras por minuto (PPM). Los mecanógrafos profesionales alcanzan 80-100 PPM, mientras que los usuarios ocasionales suelen estar por debajo de 40. Con práctica regular es posible superar los 70 PPM en pocas semanas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se mide la velocidad de escritura en un test de mecanografía?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El test cronometra cuántas palabras correctas escribes en un minuto (PPM brutos) y descuenta los errores para obtener las PPM netas. La precisión se calcula como el porcentaje de pulsaciones correctas sobre el total. Cuanto más alta sea la precisión, más útil resulta la velocidad bruta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve mejorar la velocidad de mecanografía?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Escribir más rápido aumenta la productividad en trabajos que implican redactar correos, informes o código. También reduce la carga cognitiva: cuando el teclado es automático, puedes concentrarte en el contenido. Pasar de 30 a 60 PPM puede suponer ahorrar 30-60 minutos de trabajo diario.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre PPM brutos y PPM netos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las PPM brutas cuentan todas las palabras escritas, independientemente de si son correctas. Las PPM netas descuentan las palabras con errores. Los empleadores y concursos de mecanografía suelen usar PPM netos como medida real de rendimiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo mejorar mi velocidad de escritura rápidamente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mejora más rápida llega al aprender la posición correcta de los dedos (método QWERTY con los 10 dedos) y practicar 15-20 minutos diarios. Es más efectivo escribir despacio y sin errores al principio que ir rápido y corregir constantemente. La velocidad sube sola cuando la precisión es alta y los movimientos se vuelven automáticos.',
      },
    },
  ],
};
