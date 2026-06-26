import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de crema pastelera y crema inglesa | meskeIA',
  description:
    'Calcula las yemas, el azúcar y la maicena para tu crema pastelera o inglesa según los mililitros de leche. Proporciones profesionales por litro, escaladas a lo que necesites. Gratis y en español.',
  keywords:
    'calculadora crema pastelera, proporcion crema pastelera, crema pastelera 500 ml leche, crema inglesa receta, cuanta maicena crema pastelera, yemas crema pastelera, crema diplomata',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Calculadora de crema pastelera', description: 'Yemas, azúcar y maicena según la leche, para crema pastelera o inglesa.', url: 'https://meskeia.com/calculadora-crema-pastelera', siteName: 'meskeIA', locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: 'Calculadora de crema pastelera', description: 'Proporciones de crema pastelera e inglesa por la leche que uses.' },
  other: { 'application-name': 'Crema pastelera meskeIA' },
  alternates: { canonical: 'https://meskeia.com/calculadora-crema-pastelera/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de crema pastelera y crema inglesa',
  description:
    'Calcula las cantidades de yemas, azúcar, maicena y mantequilla para preparar crema pastelera, pastelera ligera o crema inglesa a partir de los mililitros de leche, escalando las proporciones profesionales por litro.',
  url: 'https://meskeia.com/calculadora-crema-pastelera/',
  features: [
    'Ingredientes según la leche que uses',
    'Crema pastelera, ligera e inglesa',
    'Proporciones profesionales por litro',
    'Yemas en número y en gramos',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Qué proporción lleva la crema pastelera?', acceptedAnswer: { '@type': 'Answer', text: 'Por cada litro de leche, una crema pastelera firme lleva unas 8 yemas, 250 g de azúcar y unos 90 g de maicena (más mantequilla y vainilla al gusto). La herramienta escala estas cantidades a los mililitros de leche que vayas a usar, así no tienes que hacer reglas de tres.' } },
    { '@type': 'Question', name: '¿En qué se diferencia la crema pastelera de la inglesa?', acceptedAnswer: { '@type': 'Answer', text: 'La crema pastelera lleva almidón (maicena o harina), lo que la espesa y la deja firme para rellenar. La crema inglesa no lleva almidón: se cuaja solo con las yemas y queda como una salsa fina, ideal para acompañar postres o como base de helado. Esta sí puede cortarse si se calienta de más.' } },
    { '@type': 'Question', name: '¿Cuánta maicena lleva la crema pastelera?', acceptedAnswer: { '@type': 'Answer', text: 'Unos 80-90 gramos de maicena por litro de leche para una crema firme de relleno. Si la quieres más ligera para mezclar con nata (crema diplomata), baja a unos 70 g. Con harina en vez de maicena se necesita algo más de cantidad y cocción.' } },
    { '@type': 'Question', name: '¿Cómo evito que la crema pastelera se corte o agrume?', acceptedAnswer: { '@type': 'Answer', text: 'Mezcla bien las yemas con el azúcar y el almidón antes de añadir la leche caliente, y luego cuécela sin dejar de remover hasta que espese. Si quedan grumos, pásala por un colador. Para que no se forme costra al enfriar, cúbrela con film a piel (tocando la superficie).' } },
    { '@type': 'Question', name: '¿Cuánto dura la crema pastelera en la nevera?', acceptedAnswer: { '@type': 'Answer', text: 'Al llevar huevo y lácteos, conviene consumirla en 2 o 3 días, bien tapada en la nevera y refrigerada cuanto antes tras hacerla. No se recomienda congelarla porque el almidón suele soltar agua al descongelar y cambia la textura.' } },
  ],
};
