import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Anestesia: Cómo Funciona | meskeIA',
  description: 'Visualiza los 3 tipos de anestesia (local, regional, general), mecanismos moleculares GABA-A y NMDA, los 5 componentes de la anestesia general y la monitorización intraoperatoria.',
  keywords: ['anestesia como funciona', 'anestesia general mecanismo', 'anestesia local mecanismo', 'propofol mecanismo', 'GABA anestesia', 'anestesia epidural', 'consciencia intraoperatoria'],
  openGraph: {
    title: 'Anestesia: Cómo se Apaga y Enciende la Consciencia',
    description: '170 años de cirugía sin dolor: mecanismos moleculares y el misterio que aún no resolvemos.',
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
  name: "Anestesia: Cómo se Apaga y Enciende la Consciencia",
  description: "Visualiza los 3 tipos de anestesia (local, regional, general), mecanismos moleculares GABA-A y NMDA, los 5 componentes de la anestesia general y la monitorización intraoperatoria.",
  url: "https://meskeia.com/visualizador-anestesia/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funciona la anestesia general?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La anestesia general actúa principalmente potenciando el receptor GABA-A (inhibidor) y bloqueando el receptor NMDA (excitador) en el sistema nervioso central. Fármacos como el propofol o el sevoflurano aumentan la inhibición neuronal de forma global, produciendo inconsciencia, amnesia y relajación muscular. El proceso se mantiene con una combinación de fármacos administrados por vía intravenosa o inhalatoria.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre anestesia local, regional y general?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La anestesia local bloquea la conducción nerviosa en una zona pequeña (ej. una muela), sin afectar la consciencia. La anestesia regional (epidural, espinal, bloqueo de nervio) adormece una región más amplia del cuerpo manteniendo al paciente despierto. La anestesia general suprime la consciencia de forma completa e implica control de la vía aérea y monitorización continua de constantes vitales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la consciencia intraoperatoria y con qué frecuencia ocurre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La consciencia intraoperatoria es la recuperación parcial o total del estado consciente durante una cirugía bajo anestesia general. Ocurre en aproximadamente 1-2 casos por cada 1.000 cirugías, aunque la mayoría son episodios sin dolor. Puede deberse a dosis insuficientes, variabilidad individual o interacciones farmacológicas. El índice biespectral (BIS) es uno de los monitores utilizados para reducir este riesgo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la anestesia local con lidocaína o bupivacaína?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los anestésicos locales bloquean los canales de sodio dependientes de voltaje en las membranas de las neuronas. Al impedir la entrada de sodio, no se genera el potencial de acción necesario para transmitir la señal de dolor. La bupivacaína tiene mayor duración (hasta 8 horas) que la lidocaína (1-3 horas) por su mayor afinidad al canal y su unión a proteínas plasmáticas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué los anestesiólogos añaden adrenalina a la anestesia local?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La adrenalina (epinefrina) se añade a los anestésicos locales como vasoconstrictor: reduce el flujo sanguíneo en la zona de inyección, retrasando la absorción sistémica del anestésico. Esto prolonga el efecto local (hasta el doble), reduce el riesgo de toxicidad sistémica por absorción rápida y disminuye el sangrado local durante el procedimiento.',
      },
    },
  ],
};
