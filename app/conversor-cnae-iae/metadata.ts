import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

// App estructuralmente española (CNAE-2025 del INE y Tarifas del IAE de la AEAT):
// no procede lenguaje dual ES/Latam. Ver <RegionBadge variant="es-only" />.
//
// Nota de identidad (decidido 2026-07-21): el slug /conversor-cnae-iae/ conserva
// "conversor" de forma DELIBERADA para captar la búsqueda real "conversor cnae iae"
// (alta intención: quien cree que existe una conversión directa). El producto es un
// BUSCADOR dual —así se llama en todas las superficies visibles (title, H1, nombre de
// catálogo)— y la propia página corrige esa expectativa. No renombrar el slug "por
// coherencia": es captura SEO intencionada, no un descuido.

export const metadata: Metadata = {
  title: 'Buscador de códigos CNAE-2025 y epígrafes del IAE | meskeIA',
  description:
    'Busca tu código CNAE-2025 (INE) y tu epígrafe del IAE (Tarifas de la AEAT) en los catálogos oficiales completos. Búsqueda por actividad en lenguaje corriente, por código y por códigos antiguos de la CNAE-2009, con su jerarquía y la sección del IAE.',
  keywords:
    'conversor cnae iae, codigo cnae, cnae 2025, buscar cnae, que cnae me corresponde, epigrafe iae, buscar epigrafe iae, tarifas iae, conversor cnae 2009 a 2025, cnae 2009, modelo 036, modelo 037, alta autónomo, sección 1ª iae, sección 2ª iae, retención irpf autónomo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Buscador de códigos CNAE-2025 y epígrafes del IAE',
    description:
      'Dos catálogos oficiales completos: la CNAE-2025 del INE y las Tarifas del IAE. Busca por actividad, por código o por un código antiguo de la CNAE-2009.',
    url: 'https://meskeia.com/conversor-cnae-iae/',
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
    title: 'Buscador de códigos CNAE-2025 y epígrafes del IAE - meskeIA',
    description:
      'Localiza tu actividad en los catálogos oficiales del INE y de la AEAT, con su jerarquía y su sección.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Buscador CNAE 2025 e IAE meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Buscador de códigos CNAE-2025 y epígrafes del IAE',
  description:
    'Buscador sobre dos catálogos oficiales completos: la Clasificación Nacional de Actividades Económicas CNAE-2025 (RD 10/2025, INE) y las Tarifas del Impuesto sobre Actividades Económicas (RD Legislativo 1175/1990, AEAT). Permite localizar una actividad describiéndola en lenguaje corriente, buscar por código, resolver códigos antiguos de la CNAE-2009 y consultar la sección del IAE y su efecto sobre la retención de IRPF.',
  url: 'https://meskeia.com/conversor-cnae-iae/',
  category: 'BusinessApplication',
  features: [
    'Catálogo completo de la CNAE-2025 con secciones, divisiones, grupos y clases',
    'Catálogo completo de las Tarifas del IAE con divisiones, agrupaciones, grupos y epígrafes',
    'Búsqueda en lenguaje corriente: escribe cómo describirías tu trabajo',
    'Reconoce códigos de la CNAE-2009 y muestra su equivalencia en la CNAE-2025',
    'Equivalencia inversa: de qué código de la CNAE-2009 procede cada clase actual',
    'Filtro por sección del IAE (1ª empresarial, 2ª profesional, 3ª artística) y su efecto en la retención de IRPF',
    'Texto literal oficial, sin correspondencias inventadas entre clasificaciones',
    'Funciona en el navegador, sin registro, gratis y sin publicidad',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el código CNAE y el epígrafe del IAE?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El CNAE es la Clasificación Nacional de Actividades Económicas del INE y tiene finalidad estadística: aparece en el alta en la Seguridad Social, en el Registro Mercantil o al pedir financiación. El epígrafe del IAE procede de las Tarifas del Impuesto sobre Actividades Económicas (RD Legislativo 1175/1990) y tiene finalidad censal y tributaria: es el que se declara a la AEAT en el modelo 036 o 037. Son códigos distintos, de organismos distintos, y no existe una tabla oficial de equivalencia entre ellos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Desde cuándo se aplica la CNAE-2025 y a qué equivale mi código CNAE-2009?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La CNAE-2025 fue aprobada por el Real Decreto 10/2025 y sustituye a la CNAE-2009 desde enero de 2026. Los códigos antiguos de cuatro dígitos siguen apareciendo en documentos anteriores; la tabla de correspondencia oficial del INE permite saber a qué clase o clases de la CNAE-2025 equivalen. En muchos casos la equivalencia es uno a uno, pero algunas clases antiguas se han dividido entre varias nuevas y hay que leer los literales para elegir.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa que un epígrafe del IAE sea de la Sección 1ª o de la Sección 2ª?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Sección 1ª agrupa las actividades empresariales (organizadas con local, medios materiales o personal) y la Sección 2ª el ejercicio individual de una profesión. La consecuencia práctica está en la factura: las facturas de un profesional de la Sección 2ª a empresas y a otros profesionales llevan retención de IRPF (15 % con carácter general y 7 % el año de inicio de la actividad y los dos siguientes), mientras que las de una actividad empresarial de la Sección 1ª, con carácter general, no la llevan. La Sección 3ª recoge las actividades artísticas, con tratamiento análogo al profesional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se paga el IAE siendo autónomo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con carácter general, no: están exentas del pago las personas físicas y quienes tengan un importe neto de la cifra de negocios inferior a un millón de euros, lo que deja fuera del pago a la mayoría de autónomos y pequeñas empresas. Declarar el epígrafe es otra cosa distinta: el alta censal en el epígrafe es obligatoria aunque exista exención, porque es la forma en que la AEAT registra qué actividad se ejerce.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo darme de alta en varios epígrafes del IAE a la vez?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Cada actividad que se ejerce efectivamente debe tener su alta en el epígrafe que le corresponda, y todas se declaran en el mismo modelo 036 o 037. Es lo habitual cuando el negocio tiene varias patas: dar clases y vender material, ejecutar obra y redactar proyectos, prestar servicios y revender producto. Estar en varios epígrafes no multiplica las obligaciones formales, pero obliga a aplicar a cada factura el régimen propio de su actividad.',
      },
    },
  ],
};
