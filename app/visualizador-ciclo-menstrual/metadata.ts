import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Ciclo Menstrual: Fases y Hormonas — meskeIA',
  description: 'Visualizador educativo del ciclo menstrual. Gráfico interactivo de las 4 hormonas (FSH, LH, estrógeno, progesterona) en las 4 fases. SOP y anticonceptivos explicados.',
  keywords: [
    'ciclo menstrual fases',
    'FSH LH estrógeno progesterona',
    'ovulación fisiología',
    'fase folicular lútea',
    'SOP síndrome ovario poliquístico',
    'anticonceptivos hormonales mecanismo',
    'ciclo menstrual 28 días',
    'endometrio hormonal',
  ],
  openGraph: {
    title: 'Ciclo Menstrual: Fases y Hormonas — meskeIA',
    description: 'Las 4 fases del ciclo, las 4 hormonas protagonistas, SOP y anticonceptivos.',
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
  name: "Ciclo Menstrual: Fases y Hormonas",
  description: "Visualizador educativo del ciclo menstrual. Gráfico interactivo de las 4 hormonas (FSH, LH, estrógeno, progesterona) en las 4 fases. SOP y anticonceptivos explicados.",
  url: "https://meskeia.com/visualizador-ciclo-menstrual/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué fases tiene el ciclo menstrual y cuánto dura cada una?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ciclo menstrual consta de cuatro fases: menstruación (días 1-5), fase folicular (días 1-13), ovulación (día 14 aprox.) y fase lútea (días 15-28). La duración total varía entre 21 y 35 días según la persona. La fase lútea es la más constante, durando siempre unos 14 días.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué hormonas controlan el ciclo menstrual y cuál es el papel de cada una?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las cuatro hormonas principales son FSH (estimula el desarrollo folicular), LH (desencadena la ovulación con un pico agudo), estrógeno (construye el endometrio y dispara el pico de LH) y progesterona (mantiene el endometrio tras la ovulación). FSH y LH son producidas por la hipófisis; estrógeno y progesterona, por los ovarios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta el síndrome de ovario poliquístico (SOP) al ciclo menstrual?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El SOP altera el equilibrio hormonal: los niveles de LH permanecen elevados de forma crónica y la FSH queda suprimida, lo que impide la maduración completa de los folículos y la ovulación. El resultado son ciclos irregulares o ausentes, niveles altos de andrógenos y múltiples folículos pequeños visibles en ecografía. Afecta al 8-13 % de las personas en edad reproductiva.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo actúan los anticonceptivos hormonales sobre el ciclo menstrual?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los anticonceptivos combinados (estrógeno + progestina) mantienen los niveles hormonales artificialmente estables, suprimiendo el pico de FSH que inicia el ciclo folicular y el pico de LH que provoca la ovulación. Sin estos picos, no hay ovulación. El sangrado mensual que ocurre en el descanso de la píldora es un sangrado por privación hormonal, no una menstruación real.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué días del ciclo menstrual es posible el embarazo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fertilidad es máxima en la ventana fértil: los 5 días anteriores a la ovulación más el día de la ovulación misma, ya que los espermatozoides sobreviven hasta 5 días en el aparato reproductor. El óvulo solo es viable unas 12-24 horas tras la ovulación. En un ciclo de 28 días, esta ventana suele estar entre los días 9 y 15, aunque varía con la longitud del ciclo de cada persona.',
      },
    },
  ],
};
