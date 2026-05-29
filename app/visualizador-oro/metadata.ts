import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Oro: Por Qué la Relatividad Explica su Color y su Nobleza | meskeIA',
  description: 'La relatividad especial de Einstein explica por qué el oro es amarillo, no se oxida y es vital en electrónica. Configuración electrónica, nanopartículas y medicina.',
  keywords: [
    'por que el oro es amarillo',
    'por que el oro no se oxida',
    'oro relatividad',
    'oro electrónica',
    'nanopartículas oro',
    'oro medicina',
    'configuracion electronica oro',
    'oro metal noble',
  ],
  openGraph: {
    title: 'El Oro: Por Qué la Relatividad Explica su Color y su Nobleza',
    description: 'Einstein explica por qué el oro es amarillo, no se oxida y está en cada circuito electrónico',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "El Oro: Por Qué la Relatividad Explica su Color y su Nobleza",
  description: "La relatividad especial de Einstein explica por qué el oro es amarillo, no se oxida y es vital en electrónica. Configuración electrónica, nanopartículas y medicina.",
  url: "https://meskeia.com/visualizador-oro/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Por qué el oro es amarillo y la plata es gris?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La explicación es relativista: los electrones más cercanos al núcleo del oro viajan a velocidades tan próximas a la de la luz que su masa aumenta y sus órbitas se contraen. Esto hace que los electrones de las capas s absorban luz azul-violeta, reflejando el resto del espectro como amarillo dorado. La plata tiene un número atómico menor, sus electrones viajan más despacio, los efectos relativistas son menores y absorbe en el ultravioleta —fuera del visible— por eso nos parece gris neutro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el oro no se oxida ni se corroe?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El oro es un metal noble porque su configuración electrónica relativista hace que sus electrones de valencia estén fuertemente ligados al núcleo, siendo poco reactivos. No reacciona con el oxígeno, el agua ni la mayoría de los ácidos. Solo se disuelve en agua regia (mezcla de ácido nítrico y clorhídrico concentrados) que genera iones complejos capaces de estabilizar los átomos de oro. Esta inactividad química lo hace ideal para joyería, monedas y contactos eléctricos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué se usa el oro en electrónica y por qué no se sustituye por algo más barato?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El oro se usa en conectores, contactos y microcircuitos porque combina tres propiedades que ningún metal barato iguala: no se oxida (garantizando contacto eléctrico fiable durante décadas), conduce bien la electricidad y es maleable para fabricarse en capas delgadísimas. El cobre oxida y el plomo contamina; el oro, aunque caro, es el único material que garantiza fiabilidad a largo plazo en dispositivos críticos como servidores, smartphones, satélites o marcapasos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las nanopartículas de oro y para qué sirven en medicina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las nanopartículas de oro (AuNPs) de entre 1 y 100 nm tienen propiedades ópticas radicalmente distintas al oro macroscópico: según su tamaño absorben y emiten colores diferentes, desde el rojo al azul. En medicina se investigan como vehículos de administración de fármacos directamente a células tumorales, como agentes de contraste en imagen médica y como sensores moleculares ultrasensibles para diagnóstico. Ya hay aplicaciones aprobadas en pruebas diagnósticas de flujo lateral (los tests rápidos COVID-19 usan nanopartículas de oro).',
      },
    },
    {
      '@type': 'Question',
      name: '¿De dónde viene el oro de la Tierra?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El oro no se forma en estrellas ordinarias: requiere la colisión de dos estrellas de neutrones o una explosión de hipernova, eventos donde la presión y la energía son suficientes para la nucleosíntesis de elementos pesados. El oro que existe en la Tierra llegó en meteoritos durante el bombardeo intenso temprano de hace 3.900-4.500 millones de años. Una parte quedó dispersa en la corteza y otra descendió al núcleo. Las vetas de oro en la corteza se formaron posteriormente por procesos hidrotermales que concentraron partículas dispersas.',
      },
    },
  ],
};
