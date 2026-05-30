import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de la Filosofía — Corrientes y Pensadores | meskeIA',
  description: 'Explora 16 corrientes filosóficas desde los presocráticos hasta el posmodernismo. Cronología interactiva con filósofos clave, conceptos fundamentales y contexto histórico.',
  keywords: ['historia filosofía', 'corrientes filosóficas', 'presocráticos', 'estoicismo', 'existencialismo', 'filosofía moderna', 'cronología filosófica'],
  openGraph: {
    title: 'Historia de la Filosofía — Corrientes y Pensadores',
    description: 'De Tales de Mileto a Derrida: 16 corrientes filosóficas con filósofos clave, conceptos y contexto histórico.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-filosofia/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  alternates: { canonical: 'https://meskeia.com/visualizador-filosofia/' },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Visualizador de Historia de la Filosofía',
  description: 'Herramienta educativa sobre historia de la filosofía y corrientes filosóficas',
  url: 'https://meskeia.com/visualizador-filosofia/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son las principales corrientes de la filosofía occidental?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las principales corrientes filosóficas occidentales incluyen el racionalismo (Descartes, Spinoza, Leibniz), el empirismo (Locke, Hume, Berkeley), el idealismo alemán (Kant, Hegel), el existencialismo (Kierkegaard, Sartre, Camus), el positivismo (Comte, Stuart Mill), el marxismo, la fenomenología (Husserl, Heidegger) y el posmodernismo (Foucault, Derrida, Lyotard). Cada corriente responde a problemas filosóficos como el conocimiento, la realidad, la libertad o la moral desde perspectivas distintas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Quiénes son los filósofos presocráticos y qué aportaron?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los presocráticos (siglos VII-V a.C.) fueron los primeros pensadores griegos que buscaron explicaciones racionales del universo sin recurrir a los mitos. Tales de Mileto propuso el agua como principio de todo; Heráclito, el fuego y el cambio constante ("todo fluye"); Parménides defendió la inmutabilidad del ser; y Demócrito formuló la teoría atomista. Su aportación fue inaugura el pensamiento filosófico y científico en Occidente al separar explicación mítica de explicación racional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia al racionalismo del empirismo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El racionalismo (siglos XVII-XVIII) sostiene que el conocimiento verdadero proviene de la razón y las ideas innatas, independientemente de la experiencia sensible; sus máximos representantes son Descartes, Spinoza y Leibniz. El empirismo, en cambio, afirma que todo conocimiento tiene su origen en la experiencia y los sentidos; Locke, Berkeley y Hume son sus figuras clave. Kant intentó sintetizar ambas tradiciones en su filosofía crítica, distinguiendo los juicios a priori de los a posteriori.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el existencialismo y cuáles son sus ideas principales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El existencialismo es una corriente filosófica del siglo XX que sitúa la existencia individual concreta en el centro de la reflexión. Sus ideas principales incluyen: la existencia precede a la esencia (Sartre), es decir, no hay naturaleza humana predefinida; la angustia y la libertad radical como condición humana; la responsabilidad total por las propias elecciones; y la autenticidad frente a la vida en "masa". Sus principales representantes son Kierkegaard (precursor), Heidegger, Sartre, Beauvoir y Camus.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve una cronología visual de la historia de la filosofía?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una cronología visual permite situar cada corriente y filósofo en su contexto histórico, ver las influencias entre escuelas y comprender cómo cada movimiento reaccionó a los anteriores. Facilita el estudio de filosofía en bachillerato y universidad al mostrar de un vistazo la evolución desde los presocráticos (s. VII a.C.) hasta el posmodernismo (s. XX), relacionando ideas abstractas con los períodos históricos que las condicionaron.',
      },
    },
  ],
};
