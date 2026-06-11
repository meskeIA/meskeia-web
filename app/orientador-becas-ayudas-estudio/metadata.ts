import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador de Becas y Ayudas al Estudio | meskeIA',
  description:
    'Descubre qué tipos de becas y ayudas al estudio existen en España según el nivel educativo y la situación familiar: beca general MEC, ayudas NEAE, comedor, transporte, libros y becas autonómicas, con enlaces a los organismos oficiales.',
  keywords:
    'becas estudio españa, beca general mec, ayudas comedor escolar, beca transporte escolar, ayudas libros texto, becas universidad, becas bachillerato fp, ayudas neae, becas comunidad autonoma',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/orientador-becas-ayudas-estudio/',
  },
  openGraph: {
    type: 'website',
    title: 'Orientador de Becas y Ayudas al Estudio',
    description:
      '¿Qué becas y ayudas al estudio existen para tu situación? Responde unas preguntas y descubre las categorías que pueden encajar contigo, con enlaces oficiales.',
    url: 'https://meskeia.com/orientador-becas-ayudas-estudio/',
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
    title: 'Orientador de Becas y Ayudas al Estudio',
    description:
      'Beca general MEC, ayudas NEAE, comedor, transporte, libros y becas autonómicas. Descubre qué tipos de ayuda existen para tu situación.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Orientador de Becas y Ayudas al Estudio',
  description: 'Orientador interactivo que, según el nivel educativo (educación obligatoria, Bachillerato/FP, universidad o necesidades educativas especiales) y la situación familiar, muestra qué tipos de becas y ayudas al estudio españolas pueden aplicarte, con enlaces a los organismos oficiales.',
  url: 'https://meskeia.com/orientador-becas-ayudas-estudio/',
  category: 'UtilityApplication',
  features: [
    'Wizard de perfil: nivel educativo, tipo de ayuda y situación familiar',
    'Catálogo de 8 categorías de becas y ayudas al estudio',
    'Beca General de Estudios Postobligatorios (MEC) y ayudas NEAE',
    'Comedor, transporte y libros escolares: dónde consultar en tu región',
    'Becas propias de cada Comunidad Autónoma',
    'Enlaces directos a organismos oficiales (Ministerio de Educación, BDNS...)',
    'Sin importes ni promesas de concesión: solo orientación y enlaces a comprobadores oficiales',
    'Gratuito, sin registro, en español',
  ],
  keywords: ['becas estudio', 'beca general MEC', 'ayudas comedor escolar', 'becas universidad', 'ayudas NEAE'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la Beca General de Estudios Postobligatorios y quién puede solicitarla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es la beca del Ministerio de Educación para Bachillerato, Formación Profesional, universidad y enseñanzas artísticas superiores. Su concesión depende de tres tipos de requisitos publicados cada curso: académico (nota media mínima), económico (la renta familiar debe estar por debajo de unos umbrales que determinan los componentes que recibes) y patrimonial (límites sobre inmuebles y rendimientos del capital). El comprobador oficial en becaseducacion.gob.es indica con tus datos reales qué umbral te correspondería.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las ayudas NEAE y para quién son?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las ayudas para alumnado con Necesidad Específica de Apoyo Educativo (NEAE) son una convocatoria estatal para estudiantes de infantil, primaria, secundaria, bachillerato o FP con discapacidad, trastorno del desarrollo, TDAH, trastorno grave de conducta o de la comunicación, o altas capacidades. Según el caso, pueden cubrir refuerzo educativo, comedor, transporte, residencia y material específico, sujetas también a umbrales de renta familiar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Quién gestiona las ayudas de comedor, transporte y libros escolares?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A diferencia de la beca general (estatal), estas ayudas dependen casi siempre de la Comunidad Autónoma, el ayuntamiento o el propio centro educativo, con requisitos, porcentajes de bonificación y plazos propios de cada región. La secretaría de tu centro o la consejería de educación de tu Comunidad Autónoma son la fuente más fiable para conocer el procedimiento exacto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Las becas autonómicas son compatibles con la beca general del Ministerio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En general sí, las convocatorias autonómicas (becas de excelencia, complementos, ayudas para material o conectividad) suelen ser compatibles con la beca general estatal, salvo que las bases de alguna de ellas indiquen lo contrario. Conviene revisar la compatibilidad en la convocatoria autonómica concreta antes de solicitar varias ayudas a la vez.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Dónde puedo pedir ayuda si necesito apoyo urgente para gastos escolares y no sé qué beca me corresponde?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los Servicios Sociales de tu ayuntamiento pueden orientarte sobre el conjunto de ayudas municipales, autonómicas y estatales disponibles para tu situación, incluido apoyo para tramitar becas. También puedes consultar el buscador oficial BDNS (infosubvenciones.es) para ver qué convocatorias de becas están abiertas en tu zona.',
      },
    },
  ],
};
