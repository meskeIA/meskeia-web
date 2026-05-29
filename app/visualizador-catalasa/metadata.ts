import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Catalasa - La Enzima más Rápida del Cuerpo | meskeIA',
  description: 'Cómo funciona la catalasa: destruye el peróxido de hidrógeno a 40 millones de reacciones por segundo, su localización en los peroxisomas, el experimento clásico con hígado y agua oxigenada, y sus usos industriales.',
  keywords: ['catalasa enzima', 'peroxido hidrogeno catalasa', 'enzima mas rapida', 'peroxisoma catalasa', 'catalasa higado', 'agua oxigenada enzima', 'radicales libres catalasa', 'catalasa experimento'],
  openGraph: {
    title: 'Catalasa - La Enzima más Rápida | meskeIA',
    description: 'La enzima que destruye el agua oxigenada a 40 millones de reacciones por segundo.',
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
  name: "Catalasa - La Enzima más Rápida del Cuerpo",
  description: "Cómo funciona la catalasa: destruye el peróxido de hidrógeno a 40 millones de reacciones por segundo, su localización en los peroxisomas, el experimento clásico con hígado y agua oxigenada, y sus usos",
  url: "https://meskeia.com/visualizador-catalasa/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la catalasa y qué función tiene en el cuerpo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La catalasa es una enzima antioxidante presente en casi todos los organismos aerobios. Su función principal es descomponer el peróxido de hidrógeno (H₂O₂), un subproducto tóxico del metabolismo celular, en agua y oxígeno molecular. Esta reacción protege a las células del daño oxidativo causado por este compuesto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué se dice que la catalasa es la enzima más rápida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La catalasa tiene uno de los valores de número de recambio (kcat) más altos conocidos en la naturaleza: puede catalizar hasta 40 millones de reacciones por segundo por molécula de enzima. Esto la sitúa entre las enzimas más eficientes del mundo biológico, superando con creces a la mayoría de enzimas metabólicas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Dónde se localiza la catalasa dentro de la célula?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La catalasa se concentra principalmente en los peroxisomas, orgánulos especializados en reacciones oxidativas que generan H₂O₂ como subproducto. También está presente en el citoplasma y las mitocondrias de células con alta actividad metabólica, como hepatocitos (hígado), eritrocitos y células renales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué consiste el experimento del hígado y el agua oxigenada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es una demostración clásica de biología: al mezclar hígado crudo (rico en catalasa) con agua oxigenada (H₂O₂), se produce una efervescencia intensa de burbujas de oxígeno. El experimento puede realizarse con distintas condiciones (temperatura, pH) para observar cómo afectan a la actividad enzimática. El hígado cocido no reacciona porque el calor desnaturaliza la enzima.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué se usa la catalasa en la industria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La catalasa tiene aplicaciones industriales relevantes. En la industria textil y papelera se emplea para eliminar el exceso de peróxido de hidrógeno tras el blanqueo. En la industria alimentaria se usa en la producción de queso para descomponer el H₂O₂ empleado como conservante de la leche. También tiene uso en diagnóstico clínico y en biocatálisis industrial como enzima verde.',
      },
    },
  ],
};
