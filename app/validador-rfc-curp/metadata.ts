import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

// App dirigida a México (SAT / RENAPO). Lenguaje mexicano, locale es_MX.

export const metadata: Metadata = {
  title: 'Validar RFC y CURP - Calculadora de RFC con Homoclave | meskeIA',
  description: 'Valida tu RFC y tu CURP en segundos: estructura, fecha y dígito verificador. Calcula las 10 primeras posiciones de tu RFC desde tu nombre y fecha de nacimiento.',
  keywords: 'validar rfc, calcular rfc, validador de rfc, calculadora rfc, calcular rfc con homoclave, validar rfc sat, curp, validar curp, homoclave, dígito verificador rfc, rfc persona moral, sacar mi rfc',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Validar RFC y CURP - Calculadora de RFC',
    description: 'Comprueba si tu RFC o tu CURP están bien formados y calcula las 10 primeras posiciones de tu RFC. Todo en tu navegador, sin enviar datos.',
    url: 'https://meskeia.com/validador-rfc-curp/',
    siteName: 'meskeIA',
    locale: 'es_MX',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Validar RFC y CURP - Calculadora de RFC',
    description: 'Valida RFC y CURP (estructura, fecha y dígito verificador) y calcula tu RFC paso a paso.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Validador de RFC y CURP meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Validador y Calculadora de RFC y CURP',
  description: 'Herramienta para validar la estructura de un RFC (persona física o moral) y de una CURP mexicana, comprobando fecha y dígito verificador, y para calcular las 10 primeras posiciones del RFC a partir del nombre, los apellidos y la fecha de nacimiento.',
  url: 'https://meskeia.com/validador-rfc-curp/',
  category: 'UtilityApplication',
  features: [
    'Validación de RFC de persona física (13 caracteres) y persona moral (12 caracteres)',
    'Comprobación del dígito verificador del RFC con el algoritmo del SAT',
    'Cálculo de las 10 primeras posiciones del RFC desde nombre, apellidos y fecha de nacimiento',
    'Aplicación del listado oficial de palabras inconvenientes del SAT',
    'Validación de CURP: estructura, entidad federativa, fecha y dígito verificador',
    'Desglose explicado de cada parte del RFC y de la CURP',
    'Funciona 100% en el navegador: ningún dato personal sale de tu dispositivo',
    'Gratuito, sin registro y sin publicidad',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo sé si mi RFC está bien escrito?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un RFC de persona física tiene 13 caracteres (4 letras, 6 dígitos de fecha en formato AAMMDD y 3 caracteres de homoclave) y el de persona moral tiene 12 (3 letras, 6 dígitos y 3 de homoclave). El último carácter es un dígito verificador que se calcula con una fórmula del SAT: si no cuadra, hay un error de captura. Esta herramienta revisa longitud, fecha y dígito verificador y te dice cuál sería el carácter correcto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede calcular la homoclave del RFC?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No de manera confiable. Las posiciones 11 y 12 (la homoclave) las asigna el SAT a partir de sus propios registros para distinguir entre personas con nombre, apellidos y fecha de nacimiento idénticos. Cualquier página que prometa la homoclave exacta está adivinando. Lo que sí se puede calcular con precisión son las 10 primeras posiciones; el RFC completo se obtiene en el portal del SAT o en una oficina.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre RFC, CURP y NSS?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El RFC (Registro Federal de Contribuyentes) lo emite el SAT y sirve para asuntos fiscales: facturar, declarar impuestos o darte de alta en un trabajo. La CURP (Clave Única de Registro de Población) la emite RENAPO, tiene 18 caracteres, la tiene toda persona residente en México desde el nacimiento y se usa para identificarte en trámites de todo tipo. El NSS es el Número de Seguridad Social del IMSS y solo tiene que ver con tu seguridad social.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el RFC lleva una fecha y para qué sirve el dígito verificador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fecha (AAMMDD, de nacimiento en personas físicas o de constitución en personas morales) reduce muchísimo la probabilidad de que dos contribuyentes coincidan en las primeras posiciones. El dígito verificador, el último carácter, se calcula con una suma ponderada módulo 11 sobre los caracteres anteriores y detecta la mayoría de los errores de captura: una letra cambiada o dos caracteres intercambiados hacen que deje de cuadrar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las palabras inconvenientes del RFC?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El SAT mantiene un listado de combinaciones de cuatro letras consideradas altisonantes (por ejemplo BUEI, CACA, MAME, PUTO o RATA). Cuando las iniciales de una persona forman una de esas palabras, la cuarta letra se sustituye por una X. Así, alguien apellidado Ramos Torres y llamada Ana no queda con RATA sino con RATX, seguido de su fecha y su homoclave.',
      },
    },
  ],
};
