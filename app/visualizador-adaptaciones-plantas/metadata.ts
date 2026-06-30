import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Adaptaciones de las Plantas: Xerófitas, Carnívoras y Más | meskeIA',
  description:
    'Visualizador interactivo de adaptaciones vegetales. 6 hábitats extremos (desierto, selva, tundra, acuático, salino, rupestre), 8 mecanismos adaptativos (CAM, C4, micorrizas) y sección completa de plantas carnívoras.',
  keywords: [
    'adaptaciones plantas',
    'xerófitas halófitas',
    'plantas carnívoras',
    'fotosíntesis CAM C4',
    'micorrizas',
    'biología bachillerato',
    'biología preparatoria',
    'biología secundaria',
  ],
  openGraph: {
    title: 'Adaptaciones de las Plantas — Hábitats Extremos | meskeIA',
    description:
      'Cómo las plantas sobreviven en desiertos, selvas, tundras y suelos salinos. Plantas carnívoras: Venus, Drosera, Nepenthes.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-adaptaciones-plantas/',
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
  alternates: { canonical: 'https://meskeia.com/visualizador-adaptaciones-plantas/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Adaptaciones de las Plantas',
  description:
    'Visualizador interactivo de adaptaciones vegetales a hábitats extremos. 6 entornos (desierto, selva tropical, tundra, acuático, salino, rupestre), 8 mecanismos clave (CAM, C4, suculencia, micorrizas, neumatóforos) y sección especial de plantas carnívoras con 5 géneros.',
  url: 'https://meskeia.com/visualizador-adaptaciones-plantas/',
  category: 'EducationalApplication',
  features: [
    '6 hábitats extremos con adaptaciones específicas',
    '8 mecanismos adaptativos explicados en profundidad',
    'Sección especial de plantas carnívoras: Venus, Drosera, Nepenthes, Pinguicula, Utricularia',
    'Fotosíntesis CAM vs C4 vs C3 comparada',
    'Micorrizas y la Wood Wide Web explicadas',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son las adaptaciones de las plantas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las adaptaciones vegetales son características morfológicas, anatómicas o fisiológicas que han evolucionado para permitir a una planta sobrevivir y reproducirse en un entorno concreto. Pueden afectar a la forma de las hojas, el tipo de raíz, los mecanismos fotosintéticos o incluso la estrategia nutricional, como ocurre en las plantas carnívoras que obtienen nitrógeno atrapando insectos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sobreviven las plantas en el desierto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las plantas xerófitas, como los cactus, han desarrollado varias estrategias: almacenan agua en tejidos suculentos, reducen las hojas a espinas para minimizar la transpiración y utilizan la fotosíntesis CAM (Metabolismo Ácido de las Crasuláceas), que abre los estomas de noche para fijar CO₂ y los cierra de día. Sus raíces son muy extensas y superficiales para captar el agua de lluvia rápidamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué las plantas carnívoras atrapan insectos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las plantas carnívoras crecen en suelos muy pobres en nitrógeno y fósforo (turberas, acantilados, zonas pantanosas). Para compensar esta carencia, han desarrollado trampas que capturan y digieren insectos u otros pequeños animales, obteniendo así los nutrientes que el suelo no puede aportarles. Géneros como Dionaea (Venus atrapamoscas), Drosera (rocíos de sol) y Nepenthes (plantas jarro) emplean mecanismos muy diferentes: trampas de cierre, pegajosas y de ahogamiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre la fotosíntesis C3, C4 y CAM?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las tres son rutas de fijación de CO₂. C3 (la más común, usada por trigo y árboles) fija el CO₂ directamente en el ciclo de Calvin y es eficiente a temperaturas moderadas. C4 (maíz, caña de azúcar) preconcentra el CO₂ en células especializadas antes de entrar al ciclo de Calvin, siendo más eficiente en climas cálidos y soleados. CAM (cactus, agaves, orquídeas) fija el CO₂ de noche cuando los estomas están abiertos, lo almacena como ácido málico y lo usa en el ciclo de Calvin durante el día con los estomas cerrados, minimizando la pérdida de agua.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se adaptan las plantas a vivir en el agua?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las plantas acuáticas (hidrófitas) han reducido o eliminado tejidos de soporte porque el agua las sostiene. Sus hojas suelen ser finas y divididas para facilitar el intercambio gaseoso con el agua. Muchas desarrollan aerénquima, un tejido con grandes espacios de aire que facilita la flotación y el transporte de oxígeno a las raíces. Los nenúfares tienen hojas flotantes con estomas en la cara superior, al contrario que las plantas terrestres.',
      },
    },
  ],
};
