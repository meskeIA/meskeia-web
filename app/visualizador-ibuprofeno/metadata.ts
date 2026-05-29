import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Ibuprofeno: Cómo Funciona | meskeIA',
  description: 'El ibuprofeno inhibe reversiblemente COX-1 y COX-2 bloqueando prostaglandinas inflamatorias. Visualiza por qué es mejor para la inflamación y sus riesgos en estómago, riñón y corazón.',
  keywords: ['ibuprofeno como funciona', 'ibuprofeno mecanismo', 'ibuprofeno COX', 'ibuprofeno estomago', 'ibuprofeno riñon', 'ibuprofeno inflamacion', 'ibuprofeno embarazo', 'ibuprofeno vs paracetamol'],
  openGraph: {
    title: 'Ibuprofeno: El Antiinflamatorio que Bloquea las COX',
    description: 'Por qué es mejor para la inflamación y qué paga en estómago, riñón y corazón.',
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
  name: "Ibuprofeno: Inhibidor COX con Efecto Antiinflamatorio",
  description: "El ibuprofeno inhibe reversiblemente COX-1 y COX-2 bloqueando prostaglandinas inflamatorias. Visualiza por qué es mejor para la inflamación y sus riesgos en estómago, riñón y corazón.",
  url: "https://meskeia.com/visualizador-ibuprofeno/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funciona el ibuprofeno en el cuerpo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ibuprofeno inhibe reversiblemente las enzimas ciclooxigenasa COX-1 y COX-2, que son necesarias para sintetizar prostaglandinas. Al reducir los niveles de estas moléculas inflamatorias, disminuye el dolor, la inflamación y la fiebre. Su efecto dura entre 4 y 8 horas dependiendo de la dosis.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el ibuprofeno puede dañar el estómago?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La COX-1 produce prostaglandinas que protegen la mucosa gástrica estimulando la secreción de moco y bicarbonato. Al inhibir también COX-1 (no solo COX-2), el ibuprofeno reduce esta protección y puede provocar irritación, úlceras o sangrado gastrointestinal, especialmente con uso prolongado o en ayunas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre ibuprofeno y paracetamol?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ibuprofeno es un antiinflamatorio (AINE) que actúa inhibiendo COX-1 y COX-2, por lo que reduce inflamación, dolor y fiebre. El paracetamol actúa principalmente en el sistema nervioso central y carece de efecto antiinflamatorio significativo en tejidos periféricos. El ibuprofeno es más indicado para dolores con componente inflamatorio (muscular, articular), mientras que el paracetamol se prefiere cuando hay riesgo gástrico o renal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el ibuprofeno está contraindicado en el embarazo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A partir del segundo trimestre, las prostaglandinas son esenciales para mantener abierto el ductus arterioso fetal, un vaso sanguíneo clave en la circulación prenatal. El ibuprofeno, al inhibir su síntesis, puede provocar el cierre prematuro de este vaso, causando hipertensión pulmonar fetal. También puede reducir el líquido amniótico. Por eso está contraindicado a partir de la semana 20 de gestación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué riesgo tiene el ibuprofeno para el corazón?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ibuprofeno inhibe COX-2, que produce prostaciclina (PGI2), una molécula vasodilatadora y antiagregante plaquetaria. Al reducirla, puede aumentar la tendencia a la trombosis y elevar la presión arterial. Este riesgo cardiovascular es mayor con dosis altas, uso crónico o en personas con enfermedad cardiaca preexistente.',
      },
    },
  ],
};
