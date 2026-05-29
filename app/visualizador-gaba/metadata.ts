import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'GABA: El Freno del Sistema Nervioso | meskeIA',
  description:
    'Visualiza cómo el GABA equilibra la excitación cerebral: GABA-A vs GABA-B, moduladores alostéricos (benzodiacepinas, alcohol, anestésicos), epilepsia y ansiedad.',
  keywords: [
    'GABA neurotransmisor',
    'GABA ansiedad',
    'GABA benzodiacepinas',
    'GABA-A GABA-B',
    'GABA epilepsia',
    'GABA alcohol',
    'glutamato GABA equilibrio',
    'GABA sueño',
  ],
  openGraph: {
    title: 'GABA: El Gran Freno del Sistema Nervioso',
    description:
      'Sin GABA, el cerebro entraría en convulsiones en segundos. Benzodiacepinas, alcohol, anestésicos: todos actúan aquí.',
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
  name: "GABA: El Gran Freno del Sistema Nervioso",
  description: "Visualiza cómo el GABA equilibra la excitación cerebral: GABA-A vs GABA-B, moduladores alostéricos (benzodiacepinas, alcohol, anestésicos), epilepsia y ansiedad.",
  url: "https://meskeia.com/visualizador-gaba/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el GABA y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El GABA (ácido gamma-aminobutírico) es el principal neurotransmisor inhibidor del sistema nervioso central. Actúa reduciendo la excitabilidad neuronal al abrir canales de cloro (receptor GABA-A) o disminuir la liberación de otros neurotransmisores (receptor GABA-B). Sin GABA, el cerebro no podría regular su propia actividad eléctrica y entraría en estados de hiperexcitabilidad como las convulsiones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo actúan las benzodiacepinas sobre el GABA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las benzodiacepinas (diazepam, alprazolam, lorazepam) son moduladores alostéricos positivos del receptor GABA-A. No activan el receptor directamente, sino que se unen a un sitio adyacente y aumentan la frecuencia de apertura del canal de cloro cuando el GABA está presente. Esto potencia el efecto inhibidor del GABA, produciendo efectos ansiolíticos, sedantes, anticonvulsivantes y relajantes musculares.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre el receptor GABA-A y GABA-B?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'GABA-A es un receptor ionotrópico (canal iónico): al activarse abre directamente un canal de cloro, produciendo inhibición rápida en milisegundos. Es el blanco de benzodiacepinas, barbitúricos y anestésicos. GABA-B es un receptor metabotrópico acoplado a proteínas G: su efecto es más lento y sostenido, modulando la liberación presináptica de neurotransmisores y la conductancia al potasio postsináptico. El baclofeno actúa sobre GABA-B y se usa para la espasticidad muscular.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el alcohol tiene efecto relajante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El alcohol etílico potencia la actividad del receptor GABA-A (aumentando la inhibición neuronal) y bloquea el receptor NMDA (reductor de la excitación). Este doble efecto produce sedación, desinhibición y relajación a dosis bajas. Con dosis altas, la depresión del sistema nervioso puede afectar el centro respiratorio. La tolerancia crónica al alcohol lleva a una regulación a la baja de GABA-A, lo que explica los síntomas de abstinencia (ansiedad, convulsiones, delirium tremens).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué relación tiene el GABA con la epilepsia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La epilepsia es un desequilibrio entre excitación e inhibición neuronal. Muchas formas de epilepsia implican disfunción del sistema GABAérgico: mutaciones en subunidades del receptor GABA-A, déficit de síntesis de GABA o degradación excesiva. Los antiepilépticos como el valproato aumentan los niveles de GABA inhibiendo su degradación; el fenobarbital potencia GABA-A; el vigabatrin inhibe la enzima que destruye el GABA (GABA-transaminasa).',
      },
    },
  ],
};
