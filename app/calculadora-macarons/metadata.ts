import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de macarons: almendra, azúcar y claras | meskeIA',
  description:
    'Calcula la harina de almendra, el azúcar glas, el azúcar granulado y las claras para tus macarons por el método francés (TPT). Escala la receta a las claras que tengas. Gratis y en español.',
  keywords:
    'calculadora macarons, receta macarons proporciones, tant pour tant macaron, harina almendra azucar glas macaron, macarons metodo frances, cuantas claras macarons, tpt macaron',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Calculadora de macarons', description: 'Almendra, azúcar glas, granulado y claras para tus macarons (método francés).', url: 'https://meskeia.com/calculadora-macarons', siteName: 'meskeIA', locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: 'Calculadora de macarons', description: 'Las cantidades exactas para tus macarons por el método francés.' },
  other: { 'application-name': 'Calculadora de macarons meskeIA' },
  alternates: { canonical: 'https://meskeia.com/calculadora-macarons/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de macarons',
  description:
    'Calcula la harina de almendra, el azúcar glas, el azúcar granulado y las claras de huevo para preparar macarons por el método francés, partiendo del "tant pour tant" (igual peso de almendra y azúcar glas) y escalando a las claras disponibles.',
  url: 'https://meskeia.com/calculadora-macarons/',
  features: [
    'Cantidades de macarons por el método francés',
    'Tant pour tant (almendra : azúcar glas 1:1)',
    'Escala según el número de claras',
    'Estimación de unidades resultantes',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Qué es el "tant pour tant" en los macarons?', acceptedAnswer: { '@type': 'Answer', text: 'El tant pour tant (TPT) es la mezcla a partes iguales de harina de almendra y azúcar glas que forma la base del macaron. Por ejemplo, 100 g de almendra con 100 g de azúcar glas. A esa base se le añade un merengue de claras con azúcar granulado para dar estructura y aire.' } },
    { '@type': 'Question', name: '¿Cuántas claras necesito para los macarons?', acceptedAnswer: { '@type': 'Answer', text: 'Con el método francés, por cada 100 g de harina de almendra se usan unos 75 g de claras, es decir, algo más de 2 claras. La herramienta calcula la almendra, los dos azúcares y las claras a partir del número de claras que tengas, para que no sobre ni falte.' } },
    { '@type': 'Question', name: '¿Por qué se me agrietan los macarons o no tienen pie?', acceptedAnswer: { '@type': 'Answer', text: 'Suele ser por no secar las conchas antes de hornear (deben formar una piel mate al tacto), por un macaronage mal hecho (mezcla de más o de menos) o por una temperatura de horno inadecuada. El "pie" característico aparece cuando el secado y la temperatura son correctos.' } },
    { '@type': 'Question', name: '¿Qué es el macaronage?', acceptedAnswer: { '@type': 'Answer', text: 'Es el momento de mezclar el TPT con el merengue. Hay que integrar con movimientos envolventes hasta que la masa caiga formando una cinta continua que se reabsorbe en unos segundos. Mezclar de menos deja la masa rígida y con picos; de más, demasiado líquida y sin forma.' } },
    { '@type': 'Question', name: '¿Sirve para el método italiano?', acceptedAnswer: { '@type': 'Answer', text: 'Esta calculadora usa el método francés, el más sencillo, donde el merengue se monta en crudo. El método italiano incorpora un almíbar caliente al merengue y da conchas más estables, pero requiere termómetro y algo más de práctica. Las proporciones de base son parecidas.' } },
  ],
};
