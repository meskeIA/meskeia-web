import { Metadata } from 'next';
import { COMPLEMENTO_BRECHA_GENERO_2026 } from '@/data/fiscal';
import { formatCurrency } from '@/lib/formatters';

// Las cifras salen del módulo fiscal, nunca tecleadas: en la próxima revalorización el
// snippet de buscadores y el JSON-LD envejecían en silencio mientras la app decía otra cosa.
const CUANTIA = formatCurrency(COMPLEMENTO_BRECHA_GENERO_2026.cuantiaPorHijoMensual);
const MAX_HIJOS = COMPLEMENTO_BRECHA_GENERO_2026.maxHijos;
const MAX_MES = formatCurrency(COMPLEMENTO_BRECHA_GENERO_2026.maxMensual);

const title = 'Verificador del Complemento por Brecha de Género 2026 — ¿Te corresponde? | meskeIA';
const description = `Comprueba si tienes derecho al complemento por brecha de género en tu pensión: ${CUANTIA}/mes por hijo (máximo ${MAX_HIJOS}). Incluye los cambios tras la sentencia TJUE 2025 que iguala el trato a hombres y mujeres.`;

export const metadata: Metadata = {
  title,
  description,
  keywords: 'complemento brecha género 2026, complemento maternidad pensión, art 60 LGSS, sentencia TJUE complemento, reclamación complemento hombres, pensión jubilación viudedad complemento',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Verificador del Complemento por Brecha de Género 2026 | meskeIA',
    description,
    url: 'https://meskeia.com/verificador-complemento-brecha-genero/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Verificador del Complemento por Brecha de Género 2026 | meskeIA',
    description: `6 preguntas para saber si te corresponde el complemento de ${CUANTIA}/mes por hijo en tu pensión.`,
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Verificador Complemento Brecha de Género meskeIA',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Verificador del Complemento por Brecha de Género 2026',
  description,
  url: 'https://meskeia.com/verificador-complemento-brecha-genero/',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
  featureList: [
    'Checklist de 6 preguntas alineadas con el art. 60 LGSS',
    `Cálculo del importe mensual y anual (${CUANTIA}/hijo, máx. ${MAX_HIJOS})`,
    'Considera la doctrina TJUE 2025 e igualdad de trato H/M',
    'Detecta casos de reclamación retroactiva (denegaciones previas)',
    'Datos normativos 2026 verificados con fuente oficial',
    'Sin registro, gratuito y 100% en el navegador',
  ],
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el complemento por brecha de género en la pensión y a cuánto asciende en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `El complemento por brecha de género es un incremento en la pensión de jubilación, viudedad o incapacidad permanente reconocido por el artículo 60 de la Ley General de la Seguridad Social. Su importe vigente es de ${CUANTIA} al mes por cada hijo o hija, con un máximo de ${MAX_HIJOS} hijos (${MAX_MES}/mes). La cuantía se fija cada año en la Ley de Presupuestos o en el Real Decreto-ley de revalorización de pensiones, y tributa como rendimiento del trabajo en el IRPF.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Pueden los hombres cobrar el complemento por brecha de género?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Tras la STJUE C-623/23 (15-mayo-2025) y la doctrina del Tribunal Supremo (9-julio-2025), los requisitos son idénticos para hombres y mujeres: pensión contributiva de jubilación, incapacidad permanente o viudedad con hecho causante desde el 4 de febrero de 2021, al menos un hijo o hija, y que el otro progenitor no perciba ya el complemento por los mismos hijos. Ya no se exige a los hombres ninguna condición adicional. Si a un hombre se le denegó el complemento antes de 2025 por no cumplir esos requisitos adicionales hoy eliminados, puede reclamarlo de forma retroactiva ante el Instituto Nacional de la Seguridad Social.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo saber si tengo derecho al complemento por brecha de género?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los requisitos son: ser titular de una pensión contributiva de jubilación, viudedad o incapacidad permanente con hecho causante desde el 4 de febrero de 2021; tener al menos un hijo o hija biológico o adoptado; y que el otro progenitor no perciba ya el complemento por los mismos hijos. No es necesario acreditar una interrupción concreta de la carrera laboral: el complemento se reconoce automáticamente si se cumplen estas condiciones. El verificador comprueba estas condiciones en 6 preguntas y calcula el importe estimado según el número de hijos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se solicita el complemento por brecha de género al INSS?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La solicitud se tramita ante el Instituto Nacional de la Seguridad Social (INSS) mediante el formulario de revisión de pensión. Puede presentarse de forma presencial en cualquier Centro de Atención e Información de la Seguridad Social, por sede electrónica con certificado digital o a través del servicio Tu Seguridad Social. Si la pensión ya está reconocida, el complemento se añade de oficio en muchos casos, pero conviene verificarlo en el resumen de la pensión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El complemento por brecha de género es compatible con cualquier tipo de pensión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El complemento se reconoce sobre las pensiones contributivas de jubilación —ordinaria o anticipada—, incapacidad permanente (total, absoluta o gran invalidez) y viudedad. No procede en la jubilación parcial: el artículo 60.4 LGSS lo excluye expresamente, y solo se reconoce cuando desde ella se accede a la jubilación plena. Tampoco alcanza a las pensiones no contributivas. Sí es compatible con el complemento a mínimos: el artículo 60.3.e) LGSS dispone que su importe no cuenta como ingreso para determinar el derecho a ese complemento y que, cuando procede, se suma a la cuantía mínima reconocida.',
      },
    },
  ],
};
