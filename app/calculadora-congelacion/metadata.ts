import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Qué se puede congelar y cuánto dura | meskeIA',
  description:
    'Descubre qué alimentos se congelan bien, cuáles no y cuánto duran en el congelador: carnes, pescados, frutas, verduras, lácteos, cocinados y pan. Con buscador y filtro. Gratis y en español.',
  keywords:
    'que se puede congelar, cuanto dura en el congelador, congelar alimentos, alimentos que no se congelan, congelar leche nata, congelar verduras, tiempo congelacion alimentos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Qué se puede congelar y cuánto dura', description: 'Qué alimentos se congelan bien, cuáles no y cuánto aguantan en el congelador.', url: 'https://meskeia.com/calculadora-congelacion', siteName: 'meskeIA', locale: 'es_ES', images: [{ url: 'https://meskeia.com/coquinum/og-image.png', width: 1200, height: 630, alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA' }] },
  twitter: { card: 'summary_large_image', title: 'Qué se puede congelar y cuánto dura', description: 'Qué congelar, qué no y cuánto aguanta cada alimento.', images: ['https://meskeia.com/coquinum/og-image.png'] },
  other: { 'application-name': 'Congelar alimentos meskeIA' },
  alternates: { canonical: 'https://meskeia.com/calculadora-congelacion/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Qué se puede congelar y cuánto dura',
  description:
    'Guía de congelación de alimentos: qué se congela bien, qué conviene evitar y cuánto tiempo se conserva cada alimento en el congelador, para carnes, pescados, frutas, verduras, lácteos, cocinados y pan, con buscador y filtro por categoría.',
  url: 'https://meskeia.com/calculadora-congelacion/',
  features: [
    'Qué alimentos se congelan bien y cuáles no',
    'Tiempos de conservación en el congelador',
    'Buscador y filtro por categoría',
    'Consejos para congelar mejor',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Qué alimentos no se deben congelar?', acceptedAnswer: { '@type': 'Answer', text: 'No conviene congelar lechuga y verduras de hoja crudas, patata cruda, nata para montar, mayonesa y salsas con nata o huevo, porque su agua cristaliza y los deja mustios, harinosos o cortados al descongelar. Tampoco huevos con cáscara, que revientan. Muchos de ellos sí aguantan ya cocinados.' } },
    { '@type': 'Question', name: '¿Cuánto dura la carne en el congelador?', acceptedAnswer: { '@type': 'Answer', text: 'La carne cruda en piezas se conserva de 6 a 12 meses a −18 °C, la picada de 3 a 4 meses (es más perecedera) y el pollo de 9 a 12 meses. Son tiempos de calidad: pasado ese plazo sigue siendo seguro si no se ha roto la cadena de frío, pero pierde sabor y textura.' } },
    { '@type': 'Question', name: '¿Se puede recongelar un alimento descongelado?', acceptedAnswer: { '@type': 'Answer', text: 'No se debe recongelar un alimento crudo que se ha descongelado, porque cada ciclo favorece el crecimiento de bacterias y degrada la textura. La excepción: si lo descongelaste en la nevera y lo cocinas, ese alimento ya cocinado sí se puede volver a congelar.' } },
    { '@type': 'Question', name: '¿Por qué hay que escaldar las verduras antes de congelar?', acceptedAnswer: { '@type': 'Answer', text: 'Escaldar (un golpe corto de agua hirviendo y luego agua con hielo) frena las enzimas que, incluso congeladas, degradan el color, el sabor y los nutrientes de las verduras. Por eso la verdura escaldada aguanta mejor y más tiempo que la congelada en crudo.' } },
    { '@type': 'Question', name: '¿Cómo evito las quemaduras por congelación?', acceptedAnswer: { '@type': 'Answer', text: 'Las quemaduras por frío (manchas secas y grisáceas) aparecen cuando el alimento está mal protegido y se deshidrata. Para evitarlas, envuelve bien, saca el aire de las bolsas, usa recipientes herméticos y no superes los tiempos recomendados. No son peligrosas, pero estropean el sabor y la textura.' } },
  ],
};
