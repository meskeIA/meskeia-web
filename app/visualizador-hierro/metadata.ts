import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Hierro: Hemoglobina, Absorción y Anemia Ferropénica | meskeIA',
  description: 'Distribución del hierro en el cuerpo, absorción hemo vs no hemo, regulación por hepcidina y espectro clínico desde déficit hasta hemocromatosis.',
  keywords: ['hierro como funciona', 'hierro hemo no hemo', 'anemia ferropénica causas', 'hemoglobina hierro', 'ferritina hierro', 'hepcidina hierro', 'hierro vitamina c absorcion', 'hemocromatosis'],
  openGraph: {
    title: 'El Hierro: Hemoglobina, Absorción y Anemia Ferropénica',
    description: 'Absorción hemo vs no hemo, hepcidina y espectro desde déficit hasta sobrecarga',
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
  name: "El Hierro: Hemoglobina, Absorción y Anemia Ferropénica",
  description: "Distribución del hierro en el cuerpo, absorción hemo vs no hemo, regulación por hepcidina y espectro clínico desde déficit hasta hemocromatosis.",
  url: "https://meskeia.com/visualizador-hierro/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre hierro hemo y hierro no hemo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El hierro hemo procede de la hemoglobina y mioglobina de carnes y pescados. Se absorbe directamente a través de receptores específicos en el intestino con una tasa del 15-35%, independientemente de lo que se coma con él. El hierro no hemo se encuentra en vegetales, legumbres y cereales, y su absorción es mucho más variable (2-20%), ya que depende del pH intestinal y de sustancias facilitadoras como la vitamina C, o inhibidoras como los fitatos, oxalatos y taninos del té y el café.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué síntomas produce la anemia ferropénica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La anemia ferropénica aparece cuando las reservas de hierro se agotan y la producción de hemoglobina cae. Los síntomas más frecuentes son fatiga persistente, palidez, disnea ante esfuerzos leves, palpitaciones y dificultad para concentrarse. En fases avanzadas pueden aparecer síntomas menos conocidos como pica (deseo de comer hielo, tierra o almidón), síndrome de piernas inquietas y fragilidad ungueal. Es la deficiencia nutricional más prevalente a nivel mundial.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la hepcidina y cómo regula el hierro en el cuerpo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La hepcidina es una hormona peptídica producida principalmente en el hígado que actúa como el principal regulador del hierro sistémico. Cuando las reservas de hierro son suficientes o hay inflamación, la hepcidina se eleva y bloquea la ferroportina, la proteína que exporta hierro desde las células intestinales y los macrófagos hacia la sangre. Cuando hay déficit, la producción de hepcidina cae, permitiendo mayor absorción intestinal y liberación de reservas. En enfermedades inflamatorias crónicas, la hepcidina elevada causa anemia de proceso crónico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se puede mejorar la absorción del hierro en una dieta vegetariana?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las personas con dieta vegetariana o vegana dependen del hierro no hemo, cuya absorción es menor. Para maximizarla conviene consumir alimentos ricos en vitamina C (pimiento, kiwi, cítricos) junto con las fuentes de hierro vegetal (legumbres, espinacas, tofu, semillas de calabaza). También ayuda remojar y germinar legumbres para reducir los fitatos, y cocinar en sartenes de hierro fundido. Evitar el té, café y lácteos en la misma comida que los alimentos ricos en hierro reduce la inhibición competitiva.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la hemocromatosis y cómo se diferencia de la anemia ferropénica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La hemocromatosis es el extremo opuesto de la deficiencia: una acumulación excesiva de hierro en órganos como el hígado, el corazón y el páncreas. La forma hereditaria (mutación HFE, frecuente en poblaciones de origen noreuropeo) altera la regulación por hepcidina, provocando absorción intestinal continua sin freno. El exceso de hierro genera radicales libres que dañan progresivamente los tejidos, pudiendo causar cirrosis, diabetes, cardiopatía e hipogonadismo. El tratamiento principal son las flebotomías periódicas para extraer el hierro almacenado.',
      },
    },
  ],
};
