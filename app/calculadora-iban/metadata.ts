import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calcular IBAN: Calculadora y Validador de IBAN Online | meskeIA',
  description:
    'Calcula el IBAN de una cuenta bancaria española a partir del CCC (entidad, sucursal, DC y número de cuenta) y valida cualquier IBAN con el módulo 97. Incluye el cálculo paso a paso y estructura del BIC/SWIFT.',
  keywords:
    'calcular iban, validar iban, calculo iban, calculadora iban, calcular iban cuenta bancaria, generador iban, calcular swift, calcular bic, iban españa, digitos de control iban, modulo 97, ccc a iban',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calcular IBAN: Calculadora y Validador de IBAN Online',
    description:
      'Convierte tu cuenta bancaria (CCC de 20 dígitos) en IBAN, valida cualquier IBAN con el módulo 97 y consulta la estructura del BIC/SWIFT. Cálculo paso a paso.',
    url: 'https://meskeia.com/calculadora-iban/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calcular IBAN - Calculadora y Validador de IBAN',
    description:
      'Calcula el IBAN desde el CCC, valida cualquier IBAN con el módulo 97 y descompón códigos BIC/SWIFT.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Calculadora de IBAN meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Calculadora y Validador de IBAN',
  description:
    'Herramienta para calcular el IBAN de una cuenta bancaria española a partir de los 20 dígitos del CCC, validar cualquier IBAN internacional con el algoritmo módulo 97 de la norma ISO 13616 y entender la estructura de un código BIC/SWIFT.',
  url: 'https://meskeia.com/calculadora-iban/',
  category: 'UtilityApplication',
  features: [
    'Calcula el IBAN español desde entidad, sucursal, dígitos de control y número de cuenta',
    'Muestra el cálculo paso a paso: reordenación, sustitución de letras y resto módulo 97',
    'Valida IBAN de cualquier país comprobando longitud y dígitos de control',
    'Verifica los dos dígitos de control internos del CCC (peso 1-2-4-8-5-10-9-7-3-6 módulo 11)',
    'Identifica la entidad bancaria española a partir del código de entidad',
    'Descompone y valida el formato de un código BIC/SWIFT',
    'Funciona 100% en el navegador, sin registro ni envío de datos',
    'Gratuito, sin publicidad y en español',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el IBAN de una cuenta bancaria española?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se parte de los 20 dígitos del CCC (4 de entidad, 4 de sucursal, 2 de control y 10 de número de cuenta). Se colocan al principio y se les añade al final "ES00"; después se sustituyen las letras por números según su posición en el alfabeto más 9 (E=14, S=28), obteniendo un número enorme. Se calcula el resto de dividir ese número entre 97 y los dígitos de control del IBAN son 98 menos ese resto, escritos siempre con dos cifras.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé si un IBAN es válido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un IBAN es formalmente válido si tiene la longitud exacta que le corresponde a su país (24 caracteres en España, 22 en Alemania, 27 en Francia) y si al mover los cuatro primeros caracteres al final, convertir las letras en números y dividir entre 97 el resto es exactamente 1. Si el resto es distinto de 1, hay al menos un carácter equivocado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede calcular el BIC o SWIFT a partir del IBAN?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. El BIC no se deriva matemáticamente del IBAN: es un código asignado a cada entidad y oficina por SWIFT y no está codificado dentro del número de cuenta. Lo que sí puede hacerse es deducir la entidad a partir del código de entidad del IBAN español y consultar después su BIC, pero el dato definitivo lo da siempre el banco, la app bancaria o el extracto de la cuenta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el IBAN español tiene 24 caracteres y el de otros países no?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La norma ISO 13616 fija solo el comienzo del IBAN: dos letras de país y dos dígitos de control. El resto, llamado BBAN, lo define cada país según el formato de numeración que ya tenía. España conservó su CCC de 20 dígitos, de ahí los 24 caracteres totales; Noruega usa 15, Alemania 22 y Malta 31. Por eso comprobar la longitud es el primer filtro al validar un IBAN extranjero.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Un IBAN válido garantiza que la cuenta existe y es de quien dice ser?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. La validación solo comprueba la coherencia matemática del número: detecta erratas y dígitos cambiados, pero no consulta ningún registro bancario. Un IBAN puede pasar todas las comprobaciones y no corresponder a ninguna cuenta abierta, o pertenecer a una persona distinta de la esperada. En los fraudes de cambio de número de cuenta en facturas el IBAN suele ser perfectamente válido, por lo que conviene confirmar el titular por un canal alternativo antes de transferir.',
      },
    },
  ],
};
