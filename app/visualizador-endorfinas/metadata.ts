import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Endorfinas - Los Opioides que Fabrica tu Cuerpo | meskeIA',
  description: 'Qué son las endorfinas, cómo activan los receptores opioides, por qué el "runner\'s high" es en realidad endocannabinoides, qué lo dispara realmente y la diferencia con los opioides externos.',
  keywords: ['endorfinas que son', 'runners high endorfinas', 'endorfinas ejercicio', 'sistema opioide endogeno', 'anandamida runner high', 'endorfinas risa', 'endorfinas picante capsaicina', 'endorfinas musica', 'beta-endorfina'],
  openGraph: {
    title: 'Endorfinas - Los Opioides de tu Cuerpo | meskeIA',
    description: 'El mito del runner\'s high, los opioides endógenos y cómo activar el sistema naturalmente.',
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
  name: "Endorfinas - Los Opioides que Fabrica tu Cuerpo",
  description: "Qué son las endorfinas, cómo activan los receptores opioides, por qué el \"runner's high\" es en realidad endocannabinoides, qué lo dispara realmente y la diferencia con los opioides externos.",
  url: "https://meskeia.com/visualizador-endorfinas/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son las endorfinas y para qué sirven?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las endorfinas son péptidos opioides endógenos producidos por el sistema nervioso central y la glándula pituitaria. Actúan uniéndose a los receptores opioides del cerebro para reducir la percepción del dolor y generar sensaciones de bienestar. La beta-endorfina es la más potente y abundante de las endorfinas conocidas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El "runner\'s high" es realmente causado por las endorfinas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No exactamente. Aunque el mito popular atribuye la euforia del corredor a las endorfinas, investigaciones con neuroimagen han demostrado que las moléculas responsables son principalmente los endocannabinoides —como la anandamida— que sí atraviesan la barrera hematoencefálica. Las endorfinas son demasiado grandes para cruzarla con facilidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué actividades liberan endorfinas de forma natural?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Varias actividades estimulan la liberación de endorfinas: el ejercicio físico intenso, la risa, el contacto social, escuchar música que emociona y comer alimentos picantes que contienen capsaicina. El picante activa receptores TRPV1 que el cerebro interpreta como dolor, lo que desencadena la respuesta endorfinérgica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre las endorfinas y los opioides externos como la morfina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ambos se unen a los mismos receptores opioides del cerebro (mu, delta y kappa), pero los opioides externos como la morfina o la heroína producen efectos mucho más intensos y prolongados, y generan dependencia física. Las endorfinas endógenas se producen en cantidades controladas y se degradan rápidamente, sin provocar adicción.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se pueden medir los niveles de endorfinas en sangre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, pero es técnicamente difícil. Las endorfinas se degradan muy rápido y no atraviesan bien la barrera hematoencefálica, por lo que los niveles periféricos en plasma no reflejan fielmente la actividad central. Los estudios más fiables usan neuroimagen con ligandos opioides específicos o análisis de líquido cefalorraquídeo.',
      },
    },
  ],
};
