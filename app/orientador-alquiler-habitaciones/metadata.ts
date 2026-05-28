import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador Alquiler por Habitaciones — Zona Tensionada 2026 | meskeIA',
  description: 'Oriéntate sobre las reglas del alquiler por habitaciones en España 2026. Calcula el techo de renta en zona tensionada: la suma de habitaciones no puede superar el alquiler del piso completo.',
  keywords: 'alquiler habitaciones zona tensionada, alquiler por habitaciones España 2026, ley vivienda habitaciones, tope renta habitaciones, SERPAVI, alquiler compartido regulación',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador Alquiler por Habitaciones en Zona Tensionada',
    description: 'Reglas del alquiler por habitaciones en zona tensionada: techo de renta, SERPAVI, sanciones y municipios declarados.',
    url: 'https://meskeia.com/orientador-alquiler-habitaciones/',
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
    title: 'Orientador Alquiler por Habitaciones — España 2026',
    description: 'Reglas, topes y sanciones del alquiler por habitaciones en zona tensionada.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Orientador Alquiler Habitaciones meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Orientador Alquiler por Habitaciones',
  description: 'Herramienta de orientación sobre la regulación del alquiler por habitaciones en zonas de mercado residencial tensionado en España (2026). Calcula el techo de renta por habitación, informa sobre la normativa vigente (Ley 12/2023, Proposición de Ley 2025, RDL 8/2026), municipios declarados y sanciones.',
  url: 'https://meskeia.com/orientador-alquiler-habitaciones/',
  features: [
    'Orientación sobre el techo de renta por habitación en zona tensionada',
    'Información sobre +300 municipios declarados zona tensionada',
    'Normativa actualizada: Ley 12/2023 + Prop. Ley habitaciones + RDL 8/2026',
    'Régimen sancionador estatal y autonómico (Cataluña)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto puedo cobrar por una habitación en zona tensionada en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En una zona declarada de mercado residencial tensionado, la suma de las rentas de todas las habitaciones del piso no puede superar la renta máxima que correspondería al alquiler del inmueble completo según el índice de referencia aplicable (SERPAVI u otro índice autonómico). Dicho de otro modo, alquilar por habitaciones no puede ser un mecanismo para eludir el tope de renta del piso entero.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una zona de mercado residencial tensionado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es una declaración administrativa que identifica municipios o áreas donde el precio del alquiler supera el 30 % de los ingresos medios de los hogares o ha crecido más de 3 puntos sobre el IPC en los últimos 5 años. La Ley 12/2023 de vivienda establece el procedimiento. Declarada la zona, se activan límites de renta para nuevos contratos y renovaciones. A mediados de 2026 hay más de 300 municipios declarados, concentrados sobre todo en Cataluña.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es legal alquilar una habitación a un precio superior al índice de referencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No en zonas tensionadas. Cobrar por encima del tope de renta se considera infracción grave según la Ley 12/2023 y puede acarrear multas de entre 10.000 y 100.000 €. En Cataluña, la Agència de l\'Habitatge aplica su propio régimen sancionador, con sanciones que pueden alcanzar los 90.000 € en casos de reincidencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué contratos de alquiler de habitaciones afecta la nueva regulación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regulación afecta a los contratos de alquiler de habitación para uso de vivienda habitual del inquilino, firmados a partir de la entrada en vigor de la normativa en cada municipio. Los contratos de temporada o los alquileres turísticos siguen una regulación distinta. El RDL 8/2026 y la proposición de ley en tramitación a 2026 buscan cerrar vacíos normativos en los contratos de habitación que no quedaban plenamente cubiertos por la Ley de Arrendamientos Urbanos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Dónde puedo consultar si mi municipio es zona tensionada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cada comunidad autónoma publica las resoluciones de declaración en su boletín oficial. En Cataluña, la Agència de l\'Habitatge mantiene actualizado el listado en la web oficial. Para el resto de España, el Ministerio de Vivienda y Agenda Urbana publica las declaraciones en el BOE. Esta herramienta incluye un buscador con los municipios declarados con más de 300 municipios registrados a mayo de 2026.',
      },
    },
  ],
};
