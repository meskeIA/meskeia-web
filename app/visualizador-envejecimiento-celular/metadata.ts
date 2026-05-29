import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador del Envejecimiento Celular | Telómeros, Senescencia y Hallmarks | meskeIA',
  description: 'Los mecanismos moleculares del envejecimiento: telómeros (límite de Hayflick), senescencia celular (SASP), disfunción mitocondrial, reloj epigenético de Horvath y los 9 Hallmarks of Aging.',
  keywords: ['envejecimiento celular', 'telomeros', 'senescencia', 'hallmarks aging', 'mitocondrias', 'reloj epigenetico', 'Horvath', 'senoterapia', 'longevidad'],
  openGraph: {
    title: 'Visualizador del Envejecimiento Celular | meskeIA',
    description: 'Telómeros, senescencia, hallmarks of aging y relojes biológicos: los mecanismos moleculares del envejecimiento explicados visualmente.',
    url: 'https://meskeia.com/visualizador-envejecimiento-celular/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Envejecimiento Celular - Telómeros, Senescencia y Hallmarks",
  description: "Los mecanismos moleculares del envejecimiento: telómeros (límite de Hayflick), senescencia celular (SASP), disfunción mitocondrial, reloj epigenético de Horvath y los 9 Hallmarks of Aging.",
  url: "https://meskeia.com/visualizador-envejecimiento-celular/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son los telómeros y por qué se relacionan con el envejecimiento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los telómeros son las regiones protectoras en los extremos de los cromosomas, similares a los capuchones de los cordones de zapatos. Con cada división celular se acortan un poco. Cuando alcanzan una longitud crítica (límite de Hayflick, aproximadamente 50-70 divisiones), la célula deja de dividirse y entra en senescencia o muere. El acortamiento telomérico es uno de los biomarcadores más estudiados del envejecimiento biológico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los Hallmarks of Aging y cuántos se han identificado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los Hallmarks of Aging son los mecanismos moleculares y celulares universales del envejecimiento, descritos por primera vez por López-Otín et al. en la revista Cell (2013). La revisión de 2023 amplió la lista a 12 hallmarks, incluyendo inestabilidad genómica, acortamiento telomérico, alteraciones epigenéticas, pérdida de proteostasis, senescencia celular, disfunción mitocondrial y disbiosis. Son la hoja de ruta de la investigación en longevidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la senescencia celular y cuál es su relación con las enfermedades del envejecimiento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La senescencia celular es el estado en que una célula deja de dividirse pero no muere: permanece metabólicamente activa y secreta un conjunto de moléculas inflamatorias conocido como SASP (Senescence-Associated Secretory Phenotype). La acumulación de células senescentes con la edad contribuye a inflamación crónica de bajo grado (inflammaging) y se ha asociado con Alzheimer, diabetes tipo 2, sarcopenia y cáncer. Los fármacos senolíticos, que eliminan selectivamente estas células, están en ensayos clínicos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué mide el reloj epigenético de Horvath?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El reloj epigenético de Horvath (2013) estima la edad biológica de un tejido midiendo patrones de metilación del ADN en 353 sitios CpG específicos. La diferencia entre la edad biológica calculada y la edad cronológica (llamada "aceleración epigenética") predice mortalidad y riesgo de enfermedades con más precisión que el año de nacimiento. Versiones posteriores como GrimAge o DunedinPACE mejoran aún más la predicción.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puede revertirse o frenarse el envejecimiento celular con intervenciones actuales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La investigación actual distingue entre frenar y revertir. Intervenciones con evidencia en modelos animales incluyen restricción calórica, inhibición de mTOR (rapamicina), activadores de sirtuinas (resveratrol, NAD+) y senolíticos. En humanos los resultados son preliminares. El estilo de vida tiene impacto demostrado: ejercicio aeróbico regular, sueño de calidad y no fumar reducen la aceleración epigenética. La reversión completa del envejecimiento en humanos no es posible con las herramientas actuales.',
      },
    },
  ],
};
