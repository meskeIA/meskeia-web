import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cuánta comida y bebida por invitado para un evento | meskeIA',
  description:
    'Calcula cuánta comida y bebida preparar según el número de invitados y el tipo de evento: aperitivo, comida sentada o barbacoa. Carne, pan, postre, agua, vino y más. Gratis y en español.',
  keywords:
    'cuanta comida por invitado, cantidades comida fiesta, cuanta bebida por persona evento, calculadora comida evento, cuanto vino por invitado, organizar comida grupo, catering cantidades',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Cuánta comida y bebida por invitado', description: 'Las cantidades de comida y bebida para tu evento según los invitados.', url: 'https://meskeia.com/cantidades-evento', siteName: 'meskeIA', locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: 'Cantidades para un evento', description: 'Cuánta comida y bebida preparar por invitado.' },
  other: { 'application-name': 'Cantidades para evento meskeIA' },
  alternates: { canonical: 'https://meskeia.com/cantidades-evento/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cuánta comida y bebida por invitado',
  description:
    'Estima las cantidades de comida y bebida a preparar para un evento según el número de invitados y el tipo (aperitivo o cóctel de pie, comida o cena sentada, y barbacoa o asado), con cantidades orientativas por persona de cada elemento.',
  url: 'https://meskeia.com/cantidades-evento/',
  features: [
    'Cantidades de comida y bebida por número de invitados',
    'Aperitivo, comida sentada y barbacoa',
    'Carne, pan, guarnición, postre y bebidas',
    'Estimaciones por persona ajustables',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Cuánta carne calcular por persona en una comida?', acceptedAnswer: { '@type': 'Answer', text: 'Para una comida sentada se calculan unos 200-250 gramos de carne o pescado por persona como plato principal, además de entrante, guarnición y postre. En una barbacoa, donde la carne es la protagonista, se sube a unos 400 gramos por persona. Son cantidades de producto crudo y orientativas.' } },
    { '@type': 'Question', name: '¿Cuánta bebida por invitado en una fiesta?', acceptedAnswer: { '@type': 'Answer', text: 'Como referencia, cuenta medio litro de agua por persona, más refrescos o zumos, y para quien beba alcohol, alrededor de un tercio de botella de vino o un par de cervezas por persona en una comida. Ajusta según la duración, la hora y el perfil de tus invitados, y ofrece siempre opciones sin alcohol.' } },
    { '@type': 'Question', name: '¿Cuántos canapés por persona en un aperitivo?', acceptedAnswer: { '@type': 'Answer', text: 'En un aperitivo o cóctel de pie se calculan entre 8 y 12 bocados salados por persona si sustituyen a una comida, o menos si es solo un picoteo antes de algo. Combina opciones frías y calientes y reparte la variedad para que haya para todos los gustos.' } },
    { '@type': 'Question', name: '¿Es mejor que sobre o que falte comida?', acceptedAnswer: { '@type': 'Answer', text: 'Lo razonable es prever un pequeño margen para que no falte, pero sin pasarse para no desperdiciar. Las cantidades orientativas ya incluyen ese punto medio. Platos que se pueden guardar o congelar (guisos, repostería) permiten ir más holgado sin riesgo de tirar comida.' } },
    { '@type': 'Question', name: '¿Cómo ajusto las cantidades a mis invitados?', acceptedAnswer: { '@type': 'Answer', text: 'Ten en cuenta el apetito del grupo, la duración del evento y la hora: una cena larga pide más que un aperitivo corto, y un grupo joven o muy comilón come por encima de la media. Usa las cifras como base y súbelas o bájalas un 10-20% según conozcas a tus invitados.' } },
  ],
};
