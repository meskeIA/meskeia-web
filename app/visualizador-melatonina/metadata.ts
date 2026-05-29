import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Melatonina - La Hormona que Regula tu Reloj Interno | meskeIA',
  description: 'Cómo funciona la melatonina: la curva circadiana opuesta al cortisol, el efecto de la luz azul en su producción, los patrones estacionales, el jet lag y lo que dice la ciencia sobre los suplementos.',
  keywords: ['melatonina como funciona', 'melatonina luz azul', 'ritmo circadiano melatonina', 'melatonina suplemento ciencia', 'jet lag melatonina', 'melatonina estaciones', 'pineal melatonina', 'melatonina edad', 'melatonina pantallas'],
  openGraph: {
    title: 'Melatonina - La Hormona del Reloj Interno | meskeIA',
    description: 'Curva circadiana, efecto de la luz, jet lag y suplementos de melatonina.',
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
  name: "Melatonina - La Hormona del Reloj Interno",
  description: "Cómo funciona la melatonina: la curva circadiana opuesta al cortisol, el efecto de la luz azul en su producción, los patrones estacionales, el jet lag y lo que dice la ciencia sobre los suplementos.",
  url: "https://meskeia.com/visualizador-melatonina/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la melatonina y dónde se produce en el cuerpo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La melatonina es una hormona producida principalmente por la glándula pineal, una pequeña estructura del tamaño de un guisante situada en el centro del cerebro. Se sintetiza a partir del aminoácido triptófano y su producción sigue un ritmo circadiano muy marcado: aumenta con la oscuridad (empezando hacia las 21:00-22:00 h), alcanza su pico entre las 2:00 y las 4:00 de la madrugada, y disminuye con la luz del amanecer. Su función principal es señalar al organismo que es de noche y que es hora de dormir.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la luz azul de las pantallas afecta al sueño?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La retina contiene células ganglionares con fotopigmento melanopsina, especialmente sensibles a la luz azul (longitud de onda ~480 nm), que es la que emiten las pantallas LED, móviles y televisores. Cuando estas células detectan luz azul, envían señales al núcleo supraquiasmático del hipotálamo, que frena la producción de melatonina. Incluso 1-2 horas de exposición a pantallas antes de dormir pueden retrasar la secreción de melatonina entre 90 y 120 minutos, desplazando la fase del sueño y reduciendo su calidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué dice la ciencia sobre los suplementos de melatonina para dormir?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La evidencia científica sobre los suplementos de melatonina es sólida en casos específicos: son eficaces para reducir el jet lag, reajustar el ritmo circadiano en trabajadores nocturnos y tratar el trastorno de fase de sueño retrasada. Su efecto sobre el insomnio crónico general es más modesto que el de los tratamientos conductuales. En España, la melatonina en dosis superiores a 1,9 mg está clasificada como medicamento y requiere prescripción; las dosis de 0,5-1 mg son las más estudiadas para inducir el sueño.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta el jet lag a la melatonina y cómo recuperarse más rápido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El jet lag ocurre cuando el reloj interno del organismo queda desfasado respecto al huso horario local. La producción de melatonina sigue el ritmo del reloj interno, no el del nuevo entorno, lo que provoca somnolencia diurna e insomnio nocturno. Para acelerar la adaptación, la luz brillante por la mañana (en viajes al este) y la toma de melatonina en la nueva hora de dormir (0,5-1 mg, 30 minutos antes) han demostrado reducir el tiempo de recuperación. El organismo tarda aproximadamente 1 día por cada hora de diferencia horaria en reajustarse de forma natural.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cambia la producción de melatonina con la edad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, la producción de melatonina varía considerablemente a lo largo de la vida. Los bebés no producen melatonina de forma rítmica hasta los 3-4 meses, lo que explica sus patrones de sueño irregulares. La producción alcanza su máximo en la infancia y empieza a disminuir progresivamente a partir de la pubertad. En adultos mayores, la secreción nocturna de melatonina puede ser entre 2 y 5 veces menor que en adultos jóvenes, lo que contribuye a la fragmentación del sueño y al adelanto de fase (tendencia a acostarse y levantarse más temprano) habitual en personas mayores.',
      },
    },
  ],
};
