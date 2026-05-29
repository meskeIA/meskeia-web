import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'ATP Sintasa - El Motor Molecular que Produce tu Energía | meskeIA',
  description: 'Cómo funciona la ATP sintasa: el motor molecular rotante que produce ATP, la quimioósmosis de Mitchell, el gradiente de protones, y cuánto ATP fabrica tu cuerpo cada día.',
  keywords: ['ATP sintasa motor molecular', 'quimiosmosis Mitchell', 'gradiente protones ATP', 'mitocondria ATP', 'fosforilacion oxidativa', 'Nobel quimiosmosis', 'cuanto ATP produce cuerpo', 'F0F1 ATP sintasa'],
  openGraph: {
    title: 'ATP Sintasa - El Motor Molecular | meskeIA',
    description: 'La máquina molecular rotante que produce la energía de tus células.',
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
  name: "ATP Sintasa - El Motor Molecular que te da Energía",
  description: "Cómo funciona la ATP sintasa: el motor molecular rotante que produce ATP, la quimioósmosis de Mitchell, el gradiente de protones, y cuánto ATP fabrica tu cuerpo cada día.",
  url: "https://meskeia.com/visualizador-atp-sintasa/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la ATP sintasa y cómo produce energía?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ATP sintasa es un complejo proteico en la membrana interna mitocondrial que sintetiza ATP (adenosín trifosfato), la molécula de energía universal de las células. Lo hace aprovechando el flujo de protones (H⁺) a través de su canal, un proceso llamado quimioósmosis. Al girar su subunidad rotatoria, cataliza la unión de ADP y fosfato para formar ATP.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué consiste la quimioósmosis de Mitchell?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La quimioósmosis es el mecanismo propuesto por Peter Mitchell en 1961, galardonado con el Premio Nobel de Química en 1978. La cadena de transporte de electrones bombea protones al espacio intermembrana mitocondrial, creando un gradiente electroquímico. Cuando los protones regresan al interior a través de la ATP sintasa, la energía del gradiente impulsa la síntesis de ATP.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto ATP produce el cuerpo humano cada día?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cuerpo humano en reposo produce y consume aproximadamente su propio peso en ATP cada día, entre 40 y 70 kg. Esto es posible porque cada molécula de ATP se recicla cientos de veces: se hidroliza a ADP para liberar energía y se resintesiza continuamente. Una sola célula puede contener hasta 1.000 millones de moléculas de ATP que se regeneran muy rápidamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la parte rotatoria de la ATP sintasa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ATP sintasa tiene dos dominios principales: F₀ (embebido en la membrana, con el canal de protones) y F₁ (sobresaliente hacia la matriz, donde se sintetiza el ATP). El paso de protones hace girar el anillo c de F₀, que transmite la rotación al eje central (subunidad γ). Este eje provoca cambios conformacionales en las tres subunidades β de F₁ que alternan entre estados de unión de sustratos y liberación de ATP.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ocurre cuando la ATP sintasa deja de funcionar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La inhibición de la ATP sintasa es rápidamente letal. Venenos como el oligomicino bloquean su canal de protones e interrumpen toda la fosforilación oxidativa. Mutaciones en los genes mitocondriales que codifican la ATP sintasa causan enfermedades mitocondriales graves que afectan principalmente a tejidos con alta demanda energética: cerebro, corazón y músculo esquelético.',
      },
    },
  ],
};
