import type { Metadata } from 'next';
import { generateCalculatorSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Propinas - Calcula la propina perfecta | meskeIA',
  description:
    '¿Cuánto dejar de propina en un restaurante? Calculadora automática con diferentes porcentajes (5%, 10%, 15%). Divide la cuenta entre personas fácilmente.',
  keywords: [
    'calculadora propinas',
    'calcular propina',
    'porcentaje propina',
    'propina camarero',
    'tip calculator',
    'propinas español',
  ],
  authors: [{ name: 'meskeIA' }],
  openGraph: {
    type: 'website',
    title: 'Calculadora de Propinas - meskeIA',
    description:
      'Calcula propinas automáticamente con diferentes porcentajes. Gratis, sin registro, 100% offline.',
    url: 'https://meskeia.com/calculadora-propinas/',
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
    title: 'Calculadora de Propinas - meskeIA',
    description: 'Calcula propinas automáticamente. Sin publicidad, funciona offline.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/calculadora-propinas/',
  },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto se deja de propina en un restaurante en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En España la propina no es obligatoria y no hay un porcentaje fijo establecido. Lo habitual es dejar entre un 5% y un 10% del total de la cuenta si el servicio ha sido satisfactorio. En ciudades turísticas o restaurantes de mayor categoría es más frecuente; en bares de barrio y menús del día no suele esperarse.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el 15% de propina sobre una cuenta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Multiplica el importe total de la cuenta por 0,15. Por ejemplo, si la cuenta es 48 €, la propina del 15% sería 48 × 0,15 = 7,20 €. Una calculadora de propinas hace este cálculo automáticamente y también puede dividir el importe entre los comensales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se divide la cuenta de un restaurante entre varias personas con propina incluida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Primero calcula el importe total incluyendo la propina (cuenta + propina), y luego divide ese total entre el número de personas. Por ejemplo, una cuenta de 60 € con un 10% de propina suma 66 €; entre 4 personas corresponde pagar 16,50 € cada una.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto se deja de propina en Estados Unidos frente a Europa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En Estados Unidos la propina es prácticamente obligatoria por convención social y suele oscilar entre el 15% y el 20% en restaurantes, ya que el salario base de los camareros es muy bajo. En Europa, incluida España, las propinas son opcionales y voluntarias; un 5%-10% se considera generoso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La propina está sujeta a impuestos o cotiza a la Seguridad Social?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En España las propinas en efectivo tienen un tratamiento fiscal ambiguo, pero legalmente se consideran rendimientos del trabajo y deben declararse en el IRPF. Los trabajadores de hostelería están obligados a incluirlas en su base imponible si son habituales y cuantificables. El empleador, en cambio, no tiene obligación de retener IRPF sobre propinas que el cliente entrega directamente al trabajador.',
      },
    },
  ],
};

// Schema.org JSON-LD con template reutilizable
export const jsonLd = generateCalculatorSchema({
  name: 'Calculadora de Propinas',
  description:
    'Calculadora online gratuita para calcular propinas automáticamente con diferentes porcentajes. Divide la cuenta entre personas, selecciona país/contexto y guarda preferencias.',
  url: 'https://meskeia.com/calculadora-propinas/',
  calculationType: 'Propinas',
  features: [
    'Cálculo automático de propinas con múltiples porcentajes',
    'Porcentajes predefinidos por país (España, USA, México, UK, Francia, Alemania, Japón)',
    'División de cuenta entre múltiples personas',
    'Porcentaje personalizado configurable',
    'Guarda preferencias en el navegador',
    'Funciona 100% offline (PWA)',
    'Sin registros, sin publicidad, totalmente gratis',
    'Formato español (números con coma decimal)',
    'Responsive y optimizado para móviles',
  ],
});
