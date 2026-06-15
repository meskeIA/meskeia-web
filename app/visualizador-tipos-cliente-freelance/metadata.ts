import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tipos de Cliente Freelance - Explicador Visual | meskeIA',
  description: 'Conoce los 6 tipos de relación cliente-freelance en España: puntual, recurrente, agencia, subcontratación, marketplace y falso autónomo. Ventajas, riesgos y señales de alerta.',
  keywords: 'cliente freelance, tipos cliente, falso autónomo, agencia, subcontratación, marketplace, relación comercial, autónomo España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tipos de Cliente Freelance - Explicador Visual',
    description: '6 tipos de relación cliente-freelance en España: ventajas, riesgos, facturación y señales de alerta. Incluye falso autónomo.',
    url: 'https://meskeia.com/visualizador-tipos-cliente-freelance/',
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
    title: 'Tipos de Cliente Freelance - Explicador Visual',
    description: 'De cliente puntual a falso autónomo: conoce las 6 relaciones comerciales freelance en España.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Tipos de Cliente Freelance meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tipos de Cliente Freelance - Explicador Visual',
  description: 'Explicador visual interactivo sobre los 6 tipos de relación cliente-freelance en España: puntual, recurrente, agencia intermediaria, subcontratación, marketplace y empleo encubierto (falso autónomo). Ventajas, riesgos, modelo de facturación y señales de alerta.',
  url: 'https://meskeia.com/visualizador-tipos-cliente-freelance/',
  category: 'EducationalApplication',
  features: [
    'Los 6 tipos de relación cliente-freelance con ventajas y riesgos',
    'Señales de alerta y ejemplos reales para cada tipo',
    'Detección de falso autónomo con base legal (Estatuto de los Trabajadores)',
    'Tabla comparativa de estabilidad, independencia y riesgo legal',
    'Espectro visual de independencia profesional',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué tipos de clientes puede tener un freelance o autónomo en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un freelance puede relacionarse con sus clientes de seis formas principales: cliente puntual (proyectos únicos sin continuidad), cliente recurrente (proyectos periódicos con la misma empresa), agencia intermediaria (la agencia contrata al freelance para trabajos de sus propios clientes), subcontratación (otro autónomo o empresa le delega parte de su trabajo), marketplace (plataformas como Fiverr o Upwork que conectan oferta y demanda), y la situación de falso autónomo (relación que jurídicamente encubre un empleo por cuenta ajena).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el falso autónomo y cómo se detecta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El falso autónomo es quien factura como autónomo a una sola empresa pero trabaja en condiciones propias de un empleado: horario fijo marcado por la empresa, ausencia de clientes propios, dependencia económica superior al 75 % de ingresos de un solo pagador, y uso de herramientas y lugar de trabajo de la empresa. El Estatuto de los Trabajadores y la jurisprudencia española consideran esta relación como laboral encubierta, lo que puede derivar en inspecciones de la Seguridad Social y reclamación de cuotas no abonadas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el tipo de cliente más estable para un freelance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cliente recurrente ofrece la mayor estabilidad porque genera ingresos predecibles a lo largo del tiempo mediante retainers o proyectos periódicos. En el lado opuesto, el cliente puntual aporta máxima independencia pero mínima previsibilidad de ingresos. Las agencias intermediarias ofrecen volumen de trabajo pero suelen reducir márgenes y la independencia del freelance. La combinación de varios clientes recurrentes es la estructura más recomendada para diversificar riesgo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta trabajar a través de un marketplace freelance a la fiscalidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Trabajar en marketplaces como Fiverr, Upwork o Malt no cambia las obligaciones fiscales del autónomo español: sigue debiendo declarar todos los ingresos en el IRPF y emitir facturas cuando la plataforma lo permita o el cliente lo exija. Algunos marketplaces actúan como intermediarios y retienen un porcentaje de comisión (habitualmente entre el 5 y el 20 %), que es un gasto deducible. Si el marketplace está en el extranjero, puede haber implicaciones en IVA intracomunitario o modelo 347.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre subcontratación y agencia intermediaria para un freelance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la subcontratación, quien contrata al freelance es otro autónomo o una empresa pequeña que necesita delegar parte de su propio trabajo; el cliente final no suele tener relación directa con el freelance. En la agencia intermediaria, la agencia actúa como comercializador entre sus clientes finales y el freelance: la agencia vende el servicio, pero quien lo ejecuta es el profesional independiente. La diferencia clave está en quién asume la relación comercial con el cliente final y quién impone las condiciones del encargo.',
      },
    },
  ],
};
