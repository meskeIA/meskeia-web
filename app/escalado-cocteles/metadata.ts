import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Escalado de cócteles y graduación de la mezcla | meskeIA',
  description:
    'Escala un cóctel al número de copas que necesites y calcula la graduación alcohólica final de la mezcla. Negroni, margarita, mojito, gin-tonic y más. Bebe con responsabilidad. Gratis y en español.',
  keywords:
    'escalar coctel, calculadora cocteles, graduacion alcoholica coctel, cocteles para fiesta cantidades, receta coctel proporciones, abv coctel, cocteles batch',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Escalado de cócteles y graduación', description: 'Escala cócteles a las copas que necesites y calcula la graduación de la mezcla.', url: 'https://meskeia.com/escalado-cocteles', siteName: 'meskeIA', locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: 'Escalado de cócteles', description: 'Cócteles a escala para fiestas, con la graduación de la mezcla.' },
  other: { 'application-name': 'Escalado de cócteles meskeIA' },
  alternates: { canonical: 'https://meskeia.com/escalado-cocteles/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Escalado de cócteles y graduación de la mezcla',
  description:
    'Escala la receta de un cóctel al número de copas deseado y estima la graduación alcohólica (% vol) de la mezcla final, teniendo en cuenta la dilución por el hielo. Incluye cócteles clásicos como negroni, margarita, daiquiri, mojito, gin-tonic y Aperol Spritz.',
  url: 'https://meskeia.com/escalado-cocteles/',
  features: [
    'Escala cualquier cóctel al número de copas',
    'Graduación alcohólica de la mezcla final',
    'Tiene en cuenta la dilución por el hielo',
    'Cócteles clásicos predefinidos',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Cómo escalo un cóctel para una fiesta?', acceptedAnswer: { '@type': 'Answer', text: 'Multiplica cada ingrediente por el número de copas que quieras preparar. La herramienta lo hace automáticamente para cócteles clásicos: eliges el cóctel y las copas, y te da las cantidades totales de cada ingrediente, además de la graduación de la mezcla. Para grandes cantidades, prepara la base por adelantado y añade el hielo y lo gaseoso al servir.' } },
    { '@type': 'Question', name: '¿Qué graduación tiene un cóctel?', acceptedAnswer: { '@type': 'Answer', text: 'Depende de los ingredientes y de la dilución. Un negroni ronda el 24% antes de diluir y baja a un 18-19% tras removerlo con hielo; un gin-tonic queda en torno al 10% por la tónica. La herramienta calcula la graduación final estimada teniendo en cuenta el agua que aporta el hielo.' } },
    { '@type': 'Question', name: '¿Por qué el hielo cambia la graduación?', acceptedAnswer: { '@type': 'Answer', text: 'Porque al remover o agitar con hielo, parte se derrite y añade agua a la mezcla, lo que rebaja la graduación y suaviza el cóctel. Esa dilución forma parte del equilibrio de la bebida: un cóctel sin diluir resulta demasiado fuerte. Por eso la graduación final es menor que la suma de los licores.' } },
    { '@type': 'Question', name: '¿Cuántas copas salen de una botella?', acceptedAnswer: { '@type': 'Answer', text: 'Una botella de 700 ml de destilado da, según el cóctel, entre 11 y 14 copas si cada una lleva unos 50 ml de alcohol. Calculando las cantidades totales con esta herramienta puedes ver cuántas botellas necesitas para tu número de invitados.' } },
    { '@type': 'Question', name: '¿Cómo preparar cócteles para mucha gente?', acceptedAnswer: { '@type': 'Answer', text: 'Lo práctico es preparar la mezcla base (los licores y el cítrico o el almíbar) por adelantado y guardarla fría, y añadir el hielo y los componentes gaseosos justo al servir, para que no pierdan el gas ni se aguen. Sirve siempre con responsabilidad y ofrece también opciones sin alcohol.' } },
  ],
};
