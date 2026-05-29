import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Visualizador del Ayuno Intermitente — Fases Metabólicas | meskeIA',
  description: 'Explora cómo cambia tu metabolismo hora a hora durante el ayuno: glucógeno, gluconeogénesis, cetosis y autofagia. Información fisiológica educativa.',
  keywords: ['ayuno intermitente', 'metabolismo', 'cetosis', 'autofagia', 'gluconeogénesis', 'glucógeno', 'fisiología', '16:8', 'fasting'],
  openGraph: {
    title: 'Visualizador del Ayuno Intermitente — Fases Metabólicas',
    description: 'Qué ocurre en tu cuerpo durante el ayuno: glucógeno, gluconeogénesis, cetosis y autofagia explicados paso a paso.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalContent',
  name: 'Visualizador del Ayuno Intermitente',
  description: 'Explicación fisiológica de las fases metabólicas durante el ayuno intermitente.',
  educationalLevel: 'general',
  inLanguage: 'es',
  publisher: {
    '@type': 'Organization',
    name: 'meskeIA',
    url: 'https://meskeia.com',
  },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué ocurre en el cuerpo durante las primeras horas de ayuno?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En las primeras 4-6 horas tras la última comida, el cuerpo consume la glucosa circulante en sangre. A continuación empieza a movilizar el glucógeno almacenado en el hígado (unos 100 g) y en los músculos para mantener los niveles de glucosa en sangre. La insulina cae de forma progresiva y el glucagón sube, señalizando que el organismo debe obtener energía de sus reservas. Esta fase dura hasta que el glucógeno hepático se agota, lo que suele ocurrir entre las 12 y las 18 horas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo empieza la cetosis durante el ayuno intermitente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cetosis comienza cuando las reservas de glucógeno hepático se agotan, generalmente entre las 12 y las 18 horas de ayuno, aunque el momento exacto varía según la actividad física, el metabolismo individual y los carbohidratos consumidos en la última comida. El hígado convierte entonces los ácidos grasos en cuerpos cetónicos (betahidroxibutirato, acetoacetato), que el cerebro y los músculos pueden usar como combustible alternativo a la glucosa. El ayuno 16:8 puede inducir cetosis leve en personas habituadas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la autofagia y cuándo se activa con el ayuno?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La autofagia es el proceso por el que las células degradan y reciclan sus componentes dañados o innecesarios. Fue descrita por Yoshinori Ohsumi, quien recibió el Nobel de Medicina en 2016. Se activa cuando los niveles de nutrientes caen, ya que la vía mTOR —el sensor de nutrientes de la célula— se inhibe. Los estudios en humanos sugieren que se detecta un aumento de marcadores de autofagia a partir de las 24-72 horas de ayuno, aunque la intensidad varía entre individuos. El ayuno 16:8 diario produce una activación modesta comparada con ayunos prolongados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién no es adecuado el ayuno intermitente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ayuno intermitente no es apropiado para todas las personas. Se desaconseja en menores de edad, mujeres embarazadas o en periodo de lactancia, personas con diabetes tipo 1 o que usan insulina (riesgo de hipoglucemia), personas con antecedentes de trastornos de la conducta alimentaria, y personas con bajo peso o desnutrición. Las personas con diabetes tipo 2 o que toman medicación hipoglucemiante deben consultarlo con un médico antes de iniciarlo, ya que puede requerir ajustes de dosis.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el ayuno 16:8, el 5:2 y el ayuno en días alternos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ayuno 16:8 consiste en comer durante una ventana de 8 horas y ayunar las 16 restantes cada día; es el protocolo más popular por su facilidad de integración en la vida cotidiana. El protocolo 5:2 implica comer con normalidad 5 días a la semana y restringir la ingesta a unas 500-600 kcal los otros 2 días no consecutivos. El ayuno en días alternos alterna días de ingesta libre con días de ayuno completo o muy restringido; es el más estudiado en investigación pero el más difícil de mantener a largo plazo. Todos producen déficit calórico, que es el mecanismo principal de pérdida de peso.',
      },
    },
  ],
};
