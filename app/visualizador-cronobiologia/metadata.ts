import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

const APP_NAME = 'visualizador-cronobiologia';
const TITLE = 'Cronobiología: Ritmos Circadianos, Cronotipos y Cronofarmacología - meskeIA';
const DESCRIPTION = 'Visualiza el reloj molecular CLOCK/BMAL1/PER/CRY, sincronizadores circadianos, cronotipos búho/alondra y el efecto del momento del día en la eficacia de medicamentos.';
const URL = `https://meskeia.com/${APP_NAME}/`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    siteName: 'meskeIA',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export function generateJsonLd() {
  return generateWebAppSchema({
    name: TITLE,
    description: DESCRIPTION,
    url: URL,
    features: [
      'Reloj molecular CLOCK/BMAL1/PER/CRY interactivo',
      'Slider de hora del día con fase circadiana activa',
      'Zeitgebers y sincronizadores circadianos',
      'Cronotipos alondra, colibrí y búho con curvas de alerta',
      'Tabla de cronofarmacología con horarios óptimos de medicamentos',
    ],
  });
}

export const jsonLd = generateWebAppSchema({
  name: "Cronobiología: Relojes Circadianos, Cronotipos y Cronofarmacología",
  description: "Visualizador interactivo de cronobiología. Reloj molecular CLOCK/BMAL1/PER/CRY con SVG circular y slider hora, 5 sincronizadores Zeitgebers (luz, alimentación, ejercicio, temperatura, social), cronoti",
  url: "https://meskeia.com/visualizador-cronobiologia/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la cronobiología y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cronobiología estudia los ritmos biológicos, especialmente el ciclo de aproximadamente 24 horas llamado ritmo circadiano. Permite entender cómo el momento del día afecta al sueño, el metabolismo, la temperatura corporal y la respuesta a medicamentos. Tiene aplicaciones directas en medicina, nutrición y rendimiento deportivo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el reloj molecular CLOCK/BMAL1?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El reloj molecular se basa en un bucle de retroalimentación negativa. Las proteínas CLOCK y BMAL1 activan la transcripción de los genes PER y CRY. Cuando las proteínas PER/CRY se acumulan, bloquean su propia producción, creando una oscilación de unas 24 horas que regula la expresión de miles de genes en el organismo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre cronotipos alondra y búho?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las alondras tienen el pico de alerta temprano (7-10h), rinden mejor por la mañana y se duermen pronto. Los búhos alcanzan su máximo rendimiento cognitivo por la tarde-noche (19-23h) y tienen dificultades para madrugar. El cronotipo está determinado genéticamente en un ~50% y cambia a lo largo de la vida: los adolescentes tienden a ser búhos; los mayores, alondras.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la cronofarmacología y por qué importa la hora de tomar medicamentos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cronofarmacología estudia cómo el momento de administración de un fármaco modifica su eficacia y toxicidad. Por ejemplo, los antihistamínicos son más efectivos tomados por la noche, los estatinas aprovechan la mayor síntesis hepática de colesterol nocturna, y los quimioterápicos pueden ser hasta 5 veces menos tóxicos administrados en ventanas horarias óptimas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los Zeitgebers o sincronizadores circadianos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los Zeitgebers (del alemán "dadores de tiempo") son señales externas que sincronizan el reloj biológico interno con el entorno. El más potente es la luz solar azul, que actúa directamente sobre el núcleo supraquiasmático del hipotálamo. Otros sincronizadores relevantes son los horarios de comida, el ejercicio físico, la temperatura ambiental y las interacciones sociales.',
      },
    },
  ],
};
