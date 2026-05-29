import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Eficiencia Energética - Retorno Inversión Aislamiento y Ventanas | meskeIA',
  description: 'Calcula el ahorro en tu factura y el plazo de amortización de mejoras de eficiencia energética: aislamiento, ventanas, caldera y bomba de calor. Gratis y sin registro.',
  keywords: 'calculadora eficiencia energetica, retorno inversion aislamiento, ahorro ventanas doble acristalamiento, bomba de calor amortizacion, mejoras energeticas hogar, certificado energetico, ahorro factura luz calefaccion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Eficiencia Energética | meskeIA',
    description: 'Calcula el ahorro y amortización de mejoras energéticas en tu hogar: aislamiento, ventanas y calefacción.',
    url: 'https://meskeia.com/calculadora-eficiencia-energetica/',
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
    title: 'Calculadora de Eficiencia Energética | meskeIA',
    description: 'Calcula en cuántos años se amortizan las mejoras energéticas de tu hogar.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora Eficiencia Energética meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Eficiencia Energética',
  description: 'Herramienta gratuita para calcular el ahorro energético y el retorno de la inversión de mejoras en el hogar: aislamiento de tejado y paredes, ventanas de doble o triple acristalamiento, cambio de caldera y bomba de calor.',
  url: 'https://meskeia.com/calculadora-eficiencia-energetica/',
  features: [
    'Cálculo de ahorro anual con aislamiento de tejado y paredes',
    'Retorno de inversión en ventanas de doble y triple acristalamiento',
    'Comparativa caldera de gas vs bomba de calor',
    'Plazo de amortización (payback) en años',
    'Estimación de reducción de CO₂',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto se ahorra en la factura instalando aislamiento térmico en el tejado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ahorro varía según el estado previo del hogar, el clima y el sistema de calefacción, pero en viviendas mal aisladas puede reducir la pérdida de calor en un 25-30%. En términos económicos, el ahorro anual suele situarse entre 200 y 600 euros dependiendo de la superficie y la zona climática. La calculadora estima el payback concreto según tus datos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En cuántos años se amortiza el cambio a ventanas de doble acristalamiento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El plazo de amortización típico de las ventanas de doble acristalamiento oscila entre 10 y 20 años, dependiendo del coste de instalación y el ahorro energético logrado. Con triple acristalamiento el ahorro es mayor pero el coste inicial también sube. La herramienta calcula el periodo de recuperación exacto según el precio que hayas pagado y el ahorro estimado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una bomba de calor y una caldera de gas en consumo energético?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una bomba de calor consume entre 3 y 5 veces menos energía que una caldera de gas para producir el mismo calor, ya que no genera calor sino que lo transfiere del exterior al interior. Sin embargo, su coste de instalación es mayor. Dependiendo del precio de la electricidad frente al gas en tu zona, la amortización puede lograrse entre 5 y 15 años.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué tipo de hogar es útil esta calculadora de eficiencia energética?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para propietarios de viviendas que estén valorando reformas energéticas: aislamiento de fachada o cubierta, sustitución de ventanas o cambio del sistema de calefacción. También sirve para arrendatarios que quieran comparar el gasto energético entre distintas viviendas, o para cualquier persona que quiera entender el impacto económico y medioambiental de estas mejoras.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el retorno de la inversión (ROI) de una mejora energética?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El retorno de la inversión se obtiene dividiendo el coste total de la mejora entre el ahorro anual estimado en la factura energética. Por ejemplo, si una mejora cuesta 3.000 euros y ahorra 300 euros al año, el payback es de 10 años. La calculadora realiza este cálculo automáticamente para cada tipo de mejora, permitiendo comparar distintas opciones.',
      },
    },
  ],
};
