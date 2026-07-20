import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

// App estructuralmente española (clasificación CNAE-2009 del INE y Tarifas del IAE
// de la AEAT): no procede lenguaje dual ES/Latam. Ver <RegionBadge variant="es-only" />.

export const metadata: Metadata = {
  title: 'Conversor CNAE ⇄ IAE - Busca tu Código CNAE y Epígrafe IAE | meskeIA',
  description:
    'Conversor CNAE-2009 ⇄ epígrafes IAE. Describe tu actividad en lenguaje corriente ("hago páginas web", "corto el pelo") y localiza los códigos CNAE y epígrafes de IAE que encajan, con su sección y su efecto en la retención de IRPF.',
  keywords:
    'conversor cnae iae, conversor iae-cnae, conversor iae, conversor cnae, conversor cnae 2009, código cnae, epígrafe iae, qué cnae me corresponde, buscar epígrafe iae, cnae 2009, tarifas iae, modelo 036, modelo 037, alta autónomo, sección 1ª iae, sección 2ª iae',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor CNAE ⇄ IAE - Busca tu código y tu epígrafe',
    description:
      'Describe tu actividad y localiza los códigos CNAE-2009 y los epígrafes del IAE que encajan, con su sección y lo que implica en tus facturas.',
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
    title: 'Conversor CNAE ⇄ IAE - meskeIA',
    description:
      'Busca tu código CNAE y tu epígrafe de IAE describiendo tu actividad con tus palabras.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Conversor CNAE IAE meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Conversor CNAE ⇄ IAE',
  description:
    'Buscador y conversor entre códigos CNAE-2009 (clasificación estadística del INE) y epígrafes del Impuesto sobre Actividades Económicas (Tarifas de la AEAT). Permite localizar la actividad describiéndola en lenguaje corriente y muestra los candidatos con su sección del IAE y su efecto sobre la retención de IRPF en factura.',
  url: 'https://meskeia.com/conversor-cnae-iae/',
  category: 'BusinessApplication',
  features: [
    'Búsqueda en lenguaje natural: escribe cómo describirías tu trabajo',
    'Conversión en ambos sentidos: de CNAE a epígrafes IAE y de epígrafe IAE a CNAE',
    'Sección del IAE de cada epígrafe (1ª empresarial, 2ª profesional, 3ª artística)',
    'Aviso de la retención de IRPF asociada a cada sección',
    'Nivel de certeza declarado epígrafe por epígrafe, sin ocultar lo dudoso',
    'Catálogo curado de las actividades más frecuentes en altas de autónomo',
    'Funciona 100 % en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
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
        text: 'El CNAE es la Clasificación Nacional de Actividades Económicas del INE (versión CNAE-2009, aprobada por el RD 475/2007) y tiene finalidad estadística: sirve para clasificar la actividad en registros como el alta en el RETA. El epígrafe del IAE procede de las Tarifas del Impuesto sobre Actividades Económicas (RD Legislativo 1175/1990) y tiene finalidad censal y tributaria: es el que se declara a la AEAT en el modelo 036 o 037. Son códigos distintos, de organismos distintos, y no existe una tabla oficial de equivalencia entre ellos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé qué CNAE me corresponde si no encuentro mi actividad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lo práctico es buscar por cómo describirías tu trabajo, no por el nombre oficial: quien hace webs no busca "actividades de programación informática", busca "hago páginas web". Este conversor busca sobre términos coloquiales además de sobre la denominación oficial. Si aun así no aparece nada, existen clases residuales como la 7490 (otras actividades profesionales, científicas y técnicas) y la 9609 (otros servicios personales), pero conviene usarlas solo cuando ninguna clase específica describa la actividad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa que un epígrafe del IAE sea de la Sección 1ª o de la Sección 2ª?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Sección 1ª agrupa las actividades empresariales (con local, medios materiales o personal organizado) y la Sección 2ª el ejercicio individual de una profesión. La consecuencia práctica está en la factura: las facturas de un profesional de la Sección 2ª a empresas y a otros profesionales llevan retención de IRPF (15 %, o 7 % durante los tres primeros años de actividad), mientras que las de una actividad empresarial de la Sección 1ª, con carácter general, no la llevan. La Sección 3ª recoge las actividades artísticas, con tratamiento análogo al profesional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se paga el IAE siendo autónomo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mayoría de autónomos declara el epígrafe pero no paga cuota: están exentas del IAE las personas físicas y quienes tengan un importe neto de la cifra de negocios inferior a 1.000.000 de euros. Declarar el epígrafe y pagar la cuota son cosas distintas: el alta censal en el epígrafe es obligatoria aunque exista exención, porque es la forma en que la AEAT registra qué actividad se ejerce.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué pasa si me doy de alta en un epígrafe equivocado y cómo se corrige?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un epígrafe incorrecto puede arrastrar consecuencias reales: retención de IRPF aplicada o no aplicada donde no correspondía, régimen de IVA inadecuado u obligaciones censales que no encajan con la actividad real. Se corrige presentando una declaración censal de modificación (modelo 036 o 037) marcando la baja en el epígrafe erróneo y el alta en el correcto. Cuanto antes se rectifique, menor es el volumen de facturas emitidas bajo el criterio equivocado que habrá que revisar.',
      },
    },
  ],
};
