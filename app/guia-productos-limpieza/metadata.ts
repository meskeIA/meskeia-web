import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía Productos de Limpieza del Hogar - Usos y Contraindicaciones - meskeIA',
  description: 'Guía completa de productos de limpieza domésticos: lejía, salfumán, vinagre, bicarbonato, alcohol, amoniaco y más. Dónde usarlos, qué superficies dañan y qué mezclas son peligrosas.',
  keywords: 'productos limpieza hogar, lejía contraindicaciones, salfumán mármol, mezclas peligrosas limpieza, vinagre limpieza usos, amoniaco lejía peligro, bicarbonato limpieza',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía Productos de Limpieza - Usos y Contraindicaciones - meskeIA',
    description: 'Descubre dónde usar (y donde NO usar) lejía, salfumán, vinagre, amoniaco y más. Incluye mezclas peligrosas que debes evitar.',
    url: 'https://meskeia.com/guia-productos-limpieza/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía Productos de Limpieza - Usos y Peligros - meskeIA',
    description: '¿Puedo usar lejía en mármol? ¿Se puede mezclar vinagre con agua oxigenada? Guía de productos de limpieza domésticos.',
  },
  other: {
    'application-name': 'Guía Productos Limpieza - meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Productos de Limpieza del Hogar',
  description: 'Referencia completa de 9 productos de limpieza domésticos comunes: usos indicados, superficies donde dañan y combinaciones peligrosas que nunca deben mezclarse. Incluye lejía, salfumán, vinagre, bicarbonato, alcohol, amoniaco, agua oxigenada, acetona y jabón de Castilla.',
  url: 'https://meskeia.com/guia-productos-limpieza/',
  category: 'EducationalApplication',
  features: [
    'Guía de 9 productos de limpieza habituales con denominación popular',
    'Usos indicados para cada producto con superficies específicas',
    'Contraindicaciones detalladas con la razón química del daño',
    'Alertas de mezclas peligrosas con nivel de riesgo (crítico/alto)',
    'Denominaciones regionales e internacionales de cada producto',
    'Tabla comparativa de todos los productos y su tipo químico',
    'Gratuito, sin registro, funciona 100% en el navegador',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Se puede usar lejía en mármol?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. La lejía (hipoclorito sódico) daña el mármol causando manchas amarillas permanentes y erosión de la superficie. El cloro ataca la calcita del mármol de forma irreversible. Para limpiar mármol se recomienda agua tibia con jabón neutro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué pasa si mezclo lejía con vinagre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mezclar lejía con vinagre es muy peligroso: libera cloro gaseoso (Cl₂), un gas irritante severo de ojos, nariz y vías respiratorias. Incluso pequeñas cantidades en espacio cerrado pueden causar irritación intensa. Además, la mezcla anula la eficacia de ambos productos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve el salfumán y por qué no se debe usar en mármol?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El salfumán (ácido clorhídrico, HCl) sirve para eliminar cal y sarro resistente en azulejos, juntas de baldosas y sanitarios muy incrustados. No debe usarse en mármol porque el ácido reacciona de forma inmediata y visible con el carbonato cálcico del mármol (CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂), disolviéndolo. El daño es completamente irreversible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las mezclas de productos de limpieza más peligrosas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las tres mezclas más peligrosas del hogar son: (1) Lejía + amoniaco: genera cloraminas gaseosas tóxicas que pueden causar edema pulmonar; (2) Lejía + vinagre o ácidos: libera cloro gaseoso irritante; (3) Acetona o alcohol + llamas: explosión o incendio por su extrema inflamabilidad. Nunca mezcles productos de limpieza sin conocer sus componentes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es seguro mezclar bicarbonato con vinagre para limpiar mejor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El mito de que bicarbonato + vinagre "potencian" la limpieza es falso. Al ser un ácido y una base, se neutralizan entre sí produciendo agua, sal y CO₂ (la efervescencia visible). El resultado final tiene prácticamente ningún poder limpiador. La mezcla solo es inofensiva si está bien ventilada, pero es inútil para limpiar.',
      },
    },
  ],
};
