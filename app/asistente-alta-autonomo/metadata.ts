import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { formatNumber } from '@/lib/formatters';
import { TRAMOS_RETA_2025, TARIFA_PLANA_2025 } from '@/data/fiscal';

// Las cifras del FAQPage salen de data/fiscal, como las de la página: hasta el 24/09/2026 iban
// escritas a mano («80 €/mes», «~206 €») y no habrían cambiado con la norma.
const TRAMO_1 = TRAMOS_RETA_2025[0];
const TRAMO_MAX = TRAMOS_RETA_2025[TRAMOS_RETA_2025.length - 1];
const eur = (v: number) => `${formatNumber(v, 0)} €`;

export const metadata: Metadata = {
  title: 'Asistente Alta Autónomo - Guía Paso a Paso para Darse de Alta | meskeIA',
  description: 'Guía completa para darte de alta como autónomo en España. Checklist interactivo con todos los trámites: Hacienda, Seguridad Social, IAE, licencias. Calculadora de cuota y costes.',
  keywords: 'alta autónomo, darse de alta autónomo, modelo 036, modelo 037, RETA, cuota autónomo, tarifa plana, IAE, epígrafe, Seguridad Social, Hacienda, emprender, freelance, España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Asistente Alta Autónomo - meskeIA',
    description: 'Darte de alta como autónomo paso a paso. Checklist, calculadora de cuota y todos los trámites necesarios.',
    url: 'https://meskeia.com/asistente-alta-autonomo/',
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
    title: 'Asistente Alta Autónomo - meskeIA',
    description: 'Guía completa para darte de alta como autónomo en España con checklist y calculadora.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Asistente Alta Autónomo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Asistente Alta Autónomo",
  description: "Guía completa para darte de alta como autónomo en España. Checklist interactivo con todos los trámites: Hacienda, Seguridad Social, IAE, licencias. Calculadora de cuota y costes.",
  url: "https://meskeia.com/asistente-alta-autonomo/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo darse de alta como autónomo paso a paso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El proceso tiene tres pasos principales: primero dar de alta la actividad en Hacienda mediante el modelo 036 o 037 (trámite gratuito online en la Sede Electrónica de la AEAT); segundo, inscribirse en el Régimen Especial de Trabajadores Autónomos (RETA) en la Seguridad Social antes de iniciar la actividad, como máximo con 60 días naturales de antelación (art. 32.3 del RD 84/1996); y tercero, obtener las licencias municipales o sectoriales si la actividad las requiere. El orden correcto es primero Hacienda, luego Seguridad Social.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto se paga de cuota de autónomo en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Desde 2023 la cuota de autónomos depende de los ingresos reales netos. En 2026 hay ${TRAMOS_RETA_2025.length} tramos: el mínimo es de ~${eur(TRAMO_1.cuotaMinima)} al mes para ingresos netos inferiores a ${eur(TRAMO_1.rendimientoMax ?? 0)}/mes, y el máximo es de ~${eur(TRAMO_MAX.cuotaMaxima)} para ingresos por encima de ${eur(TRAMO_MAX.rendimientoMin)}/mes. La cuota base elegida determina también la prestación por incapacidad y la futura pensión.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Existe una tarifa plana para nuevos autónomos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Sí. Los nuevos autónomos que se den de alta por primera vez (o tras 2 años sin estarlo) tienen derecho a la cuota reducida de ${eur(TARIFA_PLANA_2025.cuota)}/mes durante los primeros ${TARIFA_PLANA_2025.duracion} meses, prorrogable otros ${TARIFA_PLANA_2025.duracion} meses si los rendimientos netos no superan el Salario Mínimo Interprofesional (art. 38 ter de la Ley 20/2007). Hay que solicitarla en el mismo momento del alta en la Seguridad Social: no se puede pedir después. Los familiares colaboradores no tienen tarifa plana (art. 38 ter.11), sino una bonificación propia (art. 35).`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el IAE y cuándo hay que darse de alta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Impuesto sobre Actividades Económicas (IAE) es el censo de actividades económicas gestionado por Hacienda. Darse de alta en el IAE equivale a declarar qué actividad se va a ejercer y en qué epígrafe. Esta gestión se realiza simultáneamente con el modelo 036/037 y es obligatoria antes de iniciar la actividad. Las personas físicas están exentas del pago sea cual sea su facturación, y las sociedades lo están mientras su cifra de negocios no llegue a 1 millón de euros (art. 82.1.c del TRLRHL), aunque todos deben figurar en el censo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre el modelo 036 y el modelo 037?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El modelo 037 es una versión simplificada del 036 para autónomos persona física con actividad sencilla: un solo domicilio fiscal, sin representante, sin régimen especial de IVA y sin retenciones a terceros. El modelo 036 es más completo y es obligatorio para sociedades, personas con varios establecimientos, operaciones intracomunitarias o cuando se requiere ISOC. Si tienes dudas, el 037 cubre la mayoría de altas de autónomos individuales.',
      },
    },
  ],
};
