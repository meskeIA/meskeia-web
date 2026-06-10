import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador de Ayudas para Autónomos y Pymes — Subvenciones y Financiación | meskeIA',
  description:
    'Descubre qué ayudas, subvenciones y líneas de financiación pública existen para autónomos, emprendedores y pymes en España según tu situación: tarifa plana, Kit Digital, avales ICO, ENISA, CDTI y más, con enlaces oficiales.',
  keywords:
    'ayudas autonomos, subvenciones pymes, financiacion emprendedores, kit digital, avales ico, enisa, cdti, bdns subvenciones, ayudas autonomicas, tarifa plana autonomos, ayudas emprendedores españa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/orientador-ayudas-autonomos-pymes/',
  },
  openGraph: {
    type: 'website',
    title: 'Orientador de Ayudas para Autónomos y Pymes',
    description:
      '¿Qué ayudas y subvenciones públicas puedes solicitar como autónomo, emprendedor o pyme? Responde unas preguntas y descubre las categorías que encajan con tu situación.',
    url: 'https://meskeia.com/orientador-ayudas-autonomos-pymes/',
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
    title: 'Orientador de Ayudas para Autónomos y Pymes',
    description:
      'Tarifa plana, Kit Digital, avales ICO, ENISA, CDTI, ayudas autonómicas... Descubre qué ayudas públicas encajan con tu situación.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Orientador de Ayudas para Autónomos y Pymes',
  description: 'Orientador interactivo que, según tu situación (autónomo nuevo, en activo, pyme o startup) y tus necesidades, muestra qué categorías de ayudas, subvenciones y financiación pública española pueden aplicarte, con enlaces a los organismos oficiales.',
  url: 'https://meskeia.com/orientador-ayudas-autonomos-pymes/',
  category: 'BusinessApplication',
  features: [
    'Wizard de perfil: tipo de figura, necesidad y situación personal',
    'Catálogo de 15 categorías de ayudas, subvenciones y financiación',
    'Tarifa plana, capitalización del paro, avales ICO, ENISA, CDTI, Kit Digital',
    'Ayudas específicas para mujeres, jóvenes, +45, discapacidad y zona rural',
    'Enlaces directos a organismos oficiales (Seguridad Social, SEPE, ICO, BDNS...)',
    'Acceso al buscador oficial de convocatorias activas (BDNS)',
    'Explicación de cómo funciona cada tipo de ayuda (subvención, préstamo, bonificación, deducción)',
    'Gratuito, sin registro, en español',
  ],
  keywords: ['ayudas autónomos', 'subvenciones pymes', 'financiación emprendedores', 'Kit Digital', 'avales ICO', 'BDNS'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué ayudas existen para quien se da de alta como autónomo por primera vez?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las más habituales son la tarifa plana en la cuota de autónomos (con extensiones según tu perfil), la capitalización de la prestación por desempleo si la tenías reconocida, y el asesoramiento gratuito de las Cámaras de Comercio. Mujeres, jóvenes, mayores de 45, personas con discapacidad o residentes en zonas rurales pueden acceder a duraciones o cuantías ampliadas en varias de estas ayudas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Dónde puedo consultar las convocatorias de subvenciones activas en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Base de Datos Nacional de Subvenciones (BDNS), en infosubvenciones.es, es el registro oficial donde se publican todas las convocatorias activas de cualquier administración: estatal, autonómica y local. Permite filtrar por tipo de beneficiario, sector y fecha, y es la fuente más fiable porque las convocatorias cambian varias veces al año.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una subvención, un préstamo, un aval y una bonificación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una subvención suele cubrir parte del coste de un proyecto sin devolución. Un préstamo (como los de ENISA) hay que devolverlo, aunque en condiciones más favorables que un banco. Un aval (como el de ICO) no es dinero: es una garantía que facilita que el banco te conceda financiación. Una bonificación reduce lo que pagas (por ejemplo, tu cuota de autónomo o de Seguridad Social) y una deducción fiscal reduce el impuesto que pagas en tu declaración.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Hay ayudas específicas para mujeres, jóvenes o personas con discapacidad que emprenden?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Existen programas como el PAEM (Programa de Apoyo Empresarial a las Mujeres) gestionado por las Cámaras de Comercio, líneas de ENISA orientadas a jóvenes emprendedores, y financiación específica de Fundación ONCE para personas con discapacidad. Además, varios de estos colectivos acceden a extensiones en la duración o cuantía de la tarifa plana de autónomos y a bonificaciones reforzadas en la contratación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Las ayudas autonómicas son compatibles con las ayudas estatales o europeas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En muchos casos sí, pero depende de las bases reguladoras de cada convocatoria, que pueden establecer límites de acumulación o exigir que el conjunto de ayudas no supere un determinado porcentaje de la inversión. Antes de solicitar varias ayudas a la vez, conviene revisar las condiciones de compatibilidad de cada una en su convocatoria oficial.',
      },
    },
  ],
};
