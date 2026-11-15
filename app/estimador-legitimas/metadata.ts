import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador de Legítimas — Herencia forzosa por CCAA | meskeIA',
  description: 'Calcula la legítima hereditaria según el derecho civil de tu comunidad autónoma (Código Civil, Cataluña, Aragón, Galicia, Baleares, País Vasco, Navarra). Estimación de cuotas por heredero forzoso y parte de libre disposición.',
  keywords: 'legitima herencia, calculo legitima, tercio legitima estricta mejora, herencia forzosa españa, legitima cataluña aragon galicia, parte libre disposicion herencia, herederos forzosos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador de Legítimas | meskeIA',
    description: 'Estima la herencia forzosa y la parte de libre disposición según el régimen civil de tu comunidad autónoma.',
    url: 'https://meskeia.com/estimador-legitimas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Estimador de Legítimas | meskeIA',
    description: 'Calcula legítimas hereditarias por CCAA: Código Civil, Cataluña, Aragón, Galicia…',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimador Legítimas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador de Legítimas",
  description: "Calcula la legítima hereditaria según el derecho civil de tu comunidad autónoma (Código Civil, Cataluña, Aragón, Galicia, Baleares, País Vasco, Navarra). Estimación de cuotas por heredero forzoso y pa",
  url: "https://meskeia.com/estimador-legitimas/",
  category: 'FinanceApplication',
  features: [
    'Calcula la legítima estricta, el tercio de mejora y la libre disposición del Código Civil',
    'Compara siete regímenes civiles: común, Cataluña, Aragón, Galicia, Baleares, País Vasco y Navarra',
    'Reparte la legítima por hijo en los regímenes de legítima individual',
    'Calcula el caso sin descendientes del Código Civil, con o sin ascendientes',
    'Estima el derecho del cónyuge viudo citando el artículo que lo sostiene',
    'Muestra el territorio y la norma de cada régimen antes de calcular',
    'Cuadra las partes al céntimo con el caudal introducido',
  ],
});

// ─────────────────────────────────────────────────────────────────────────
// FAQ — FUENTE ÚNICA de la FAQ visible (page.tsx la importa y la pinta) y del FAQPage.
// Hasta el 15/11/2026 estaban escritas por separado y se contradecían: la visible decía que
// el viudo «no es heredero forzoso» (el art. 807.3.º CC lo nombra) y respondía a la
// desheredación con otras causas (hallazgos 4730 y 4736); el FAQPage decía que manda el
// domicilio (art. 14.1 CC: la vecindad civil, hallazgo 4732).
// ─────────────────────────────────────────────────────────────────────────
export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Qué es la legítima en una herencia y quiénes tienen derecho a ella?',
    answer: 'La legítima es la parte de la herencia que la ley reserva obligatoriamente a determinados herederos forzosos, con independencia de lo que diga el testamento. En el Código Civil español (art. 807), los herederos forzosos son los hijos y descendientes (en primer lugar), los padres y ascendientes (en defecto de descendientes) y el cónyuge viudo, cuya legítima es un usufructo. El testador solo puede disponer libremente de la parte no reservada por ley.',
  },
  {
    question: '¿Cuánto es la legítima según el Código Civil español?',
    answer: 'En el régimen general del Código Civil, la herencia se divide en tres tercios: el tercio de legítima estricta (que se reparte obligatoriamente a partes iguales entre los hijos), el tercio de mejora (que puede destinarse a cualquier descendiente a elección del testador) y el tercio de libre disposición (de uso totalmente libre). En la práctica, los hijos tienen derecho a dos tercios del caudal hereditario (legítima larga), aunque uno de ellos puede concentrarse en un solo hijo mediante la mejora.',
  },
  {
    question: '¿Cambia la legítima según la comunidad autónoma?',
    answer: 'Sí, España tiene un sistema de pluralidad de derechos civiles. Cataluña reserva solo la cuarta parte del caudal para los descendientes (legítima reducida). Aragón y el País Vasco establecen una legítima colectiva para el grupo de descendientes. Galicia permite la mejora de habitación y tiene reglas propias. Navarra solo reconoce una legítima formal, sin contenido patrimonial efectivo. Baleares también tiene particularidades relevantes. El régimen aplicable no lo decide el domicilio, sino la vecindad civil del fallecido (art. 14.1 del Código Civil).',
  },
  {
    question: '¿Puede el testador desheredar a los hijos y dejarlos sin legítima?',
    answer: 'La desheredación válida requiere una causa legal expresa recogida en el testamento y que esa causa sea reconocida por el Código Civil o el derecho foral aplicable. Las causas incluyen maltrato de obra o injurias graves al testador, negación de alimentos en situación de necesidad, y otras causas de indignidad. Si no hay causa legal o no se prueba, el heredero desheredado puede impugnar el testamento judicialmente y recuperar su legítima.',
  },
  {
    question: '¿Qué es la parte de libre disposición y cómo se calcula?',
    answer: 'La parte de libre disposición es la fracción de la herencia sobre la que el testador puede decidir con total libertad: dejarla a quien quiera (familiar, amigo, pareja no casada, fundación) o usarla para mejorar la cuota de un descendiente concreto. Bajo el Código Civil general, equivale a un tercio del caudal hereditario. En regímenes forales con legítima más reducida (como Cataluña, con legítima de un cuarto), la parte libre es mayor.',
  },
  {
    question: '¿Las donaciones en vida reducen la herencia?',
    answer: 'Sí, las donaciones a herederos forzosos se "colacionan" (se suman al caudal ficticio para calcular legítimas). Las donaciones a terceros pueden atacarse si vulneran legítimas.',
  },
  {
    question: '¿El seguro de vida forma parte de la herencia?',
    answer: 'No, el seguro de vida va directamente al beneficiario designado y no forma parte del caudal hereditario. No está sujeto a legítimas ni a impuesto de sucesiones como herencia.',
  },
  {
    question: '¿Qué es la "acción de suplemento de legítima"?',
    answer: 'Es la acción con la que el heredero forzoso a quien el testador ha dejado, por cualquier título, menos de la legítima que le corresponde pide lo que le falta (el Código Civil la llama «complemento», art. 815). Si son las donaciones las que la vulneran, se pide su reducción (arts. 817 a 820). El Código Civil no le fija un plazo propio: el de prescripción depende de cómo se califique la acción, así que conviene consultarlo pronto con un abogado.',
  },
  {
    question: '¿Puedo beneficiar a mi cónyuge en Derecho Común?',
    answer: 'Sí, dentro de los límites de las legítimas. El cónyuge viudo es heredero forzoso en usufructo (art. 807.3.º): si hay hijos, le corresponde el usufructo del tercio de mejora (art. 834). Además, puedes dejarle en propiedad el tercio de libre disposición. Los hijos conservan su legítima de dos tercios (art. 808).',
  },
  {
    question: '¿Qué ley se aplica si vivo en una CCAA pero nací en otra?',
    answer: 'La vecindad civil (no el empadronamiento) determina la ley aplicable. La vecindad civil se adquiere por origen, residencia continuada o declaración. Puede diferir del lugar de residencia actual.',
  },
  {
    question: '¿Pueden los herederos renunciar a la legítima?',
    answer: 'Sí, pero solo una vez abierta la sucesión (tras el fallecimiento). En derecho común no es posible renunciar anticipadamente a la legítima del testador vivo (art. 816 del Código Civil); algunos derechos forales sí lo admiten, como el vasco mediante pacto sucesorio (Ley 5/2015, art. 48.5).',
  },
];

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PREGUNTAS_FRECUENTES.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};
