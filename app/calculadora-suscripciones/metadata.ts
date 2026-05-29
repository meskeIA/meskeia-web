import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora de Suscripciones - Control de Gastos Recurrentes | meskeIA',
  description: 'Controla todas tus suscripciones (Netflix, Spotify, gym...). Calcula el gasto mensual y anual total. Detecta suscripciones olvidadas y optimiza tu presupuesto.',
  keywords: 'suscripciones, netflix, spotify, hbo, gym, gastos recurrentes, control gastos, presupuesto, mensual, anual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Suscripciones - meskeIA',
    description: 'Controla todas tus suscripciones y descubre cuánto gastas realmente al mes y al año',
    url: 'https://meskeia.com/calculadora-suscripciones/',
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
    title: 'Calculadora de Suscripciones - meskeIA',
    description: 'Controla todas tus suscripciones y optimiza tu presupuesto',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Suscripciones - Control de Gastos Recurrentes",
  description: "Controla todas tus suscripciones (Netflix, Spotify, gym...). Calcula el gasto mensual y anual total. Detecta suscripciones olvidadas y optimiza tu presupuesto.",
  url: 'https://meskeia.com/calculadora-suscripciones/',
  category: 'FinanceApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto gasta de media una persona en suscripciones digitales al mes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Estudios recientes en España y Latinoamérica sitúan el gasto medio en suscripciones digitales entre 40 € y 80 € mensuales por hogar, sumando plataformas de streaming de vídeo, música, videojuegos, almacenamiento en la nube y servicios de productividad. El problema habitual es que muchos usuarios desconocen su cifra real porque los cargos llegan en fechas distintas y algunos son anuales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo saber todas las suscripciones que tengo activas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La forma más fiable es revisar los extractos del banco y la tarjeta de crédito buscando cargos recurrentes (mensuales o anuales). También puedes comprobar el email por confirmaciones de pago y revisar la sección de suscripciones en App Store o Google Play para las apps de móvil. Una calculadora de suscripciones te permite centralizar todo en un solo lugar y ver el total real.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona una calculadora de suscripciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Introduces cada suscripción con su nombre, importe y frecuencia de pago (mensual o anual). La herramienta convierte todos los importes a una base común mensual y anual, muestra el gasto total acumulado y puede identificar cuáles representan un mayor porcentaje del presupuesto. Todo el procesamiento ocurre en el navegador, sin que los datos salgan de tu dispositivo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre calcular suscripciones con una hoja de cálculo y con una calculadora específica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una hoja de cálculo requiere crear fórmulas manualmente y recordar convertir periodos anuales a mensuales. Una calculadora especializada automatiza esas conversiones, permite añadir y eliminar suscripciones con un clic, y muestra visualmente el peso de cada categoría. El resultado es más rápido y con menos riesgo de error en la suma total.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cada cuánto tiempo debería revisar mis suscripciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se recomienda hacer una revisión completa cada tres o seis meses. Las suscripciones anuales suelen renovarse de forma silenciosa y pueden pasar desapercibidas durante meses. Una revisión periódica permite detectar servicios que ya no se usan, aprovechar periodos de prueba gratuitos antes de que se conviertan en cobros y renegociar tarifas cuando el proveedor ofrezca promociones.',
      },
    },
  ],
};
