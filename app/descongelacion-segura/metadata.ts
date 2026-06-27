import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Descongelación segura: cuánto tarda y cómo hacerlo bien | meskeIA',
  description:
    'Calcula cuánto tarda en descongelarse un alimento según el peso y el método seguro: en la nevera, en agua fría o en el microondas. Nunca a temperatura ambiente. Gratis y en español.',
  keywords:
    'descongelar carne, descongelacion segura, cuanto tarda en descongelar, descongelar pollo nevera, descongelar agua fria, descongelar microondas, descongelar alimentos tiempo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Descongelación segura', description: 'Cuánto tarda en descongelarse un alimento según el peso y el método seguro.', url: 'https://meskeia.com/descongelacion-segura', siteName: 'meskeIA', locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: 'Descongelación segura', description: 'Tiempo de descongelación por peso y método, de forma segura.' },
  other: { 'application-name': 'Descongelación segura meskeIA' },
  alternates: { canonical: 'https://meskeia.com/descongelacion-segura/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Descongelación segura',
  description:
    'Calcula el tiempo aproximado de descongelación de un alimento a partir de su peso y del método elegido —en la nevera, en agua fría o en el microondas— siguiendo las pautas de seguridad alimentaria para evitar el crecimiento de bacterias.',
  url: 'https://meskeia.com/descongelacion-segura/',
  features: [
    'Tiempo de descongelación según peso y método',
    'Métodos seguros: nevera, agua fría y microondas',
    'Avisos de seguridad alimentaria',
    'En cuánto tiempo tener listo el alimento',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Cuál es la forma más segura de descongelar?', acceptedAnswer: { '@type': 'Answer', text: 'En la nevera. Es lento (unas 10 horas por kilo), pero mantiene el alimento siempre a temperatura segura y permite incluso recongelarlo si luego lo cocinas. Los métodos rápidos seguros son el agua fría cambiándola cada 30 minutos y el microondas, pero en estos hay que cocinar el alimento justo después.' } },
    { '@type': 'Question', name: '¿Por qué no se debe descongelar a temperatura ambiente?', acceptedAnswer: { '@type': 'Answer', text: 'Porque la superficie del alimento entra en la "zona de peligro" (entre 4 y 60 °C), donde las bacterias se multiplican rápidamente, mientras el centro sigue congelado. Dejar carne o pescado descongelando en la encimera durante horas es una de las causas más comunes de intoxicación alimentaria.' } },
    { '@type': 'Question', name: '¿Cuánto tarda en descongelarse un pollo?', acceptedAnswer: { '@type': 'Answer', text: 'Un pollo entero de 1,5 kg tarda en torno a 15 horas en la nevera, o alrededor de 1,5 horas en agua fría (cambiándola cada 30 minutos). En el microondas es casi inmediato con la función descongelar, pero hay que cocinarlo justo después porque algunas zonas empiezan a calentarse.' } },
    { '@type': 'Question', name: '¿Se puede cocinar un alimento sin descongelar?', acceptedAnswer: { '@type': 'Answer', text: 'Sí, muchos alimentos se pueden cocinar directamente congelados, como verduras, croquetas o filtes finos, aunque tardan más (alrededor de un 50% más). Lo que no conviene es asar una pieza grande congelada, porque el exterior se haría mucho antes que el interior.' } },
    { '@type': 'Question', name: '¿Hay que cocinar enseguida tras descongelar?', acceptedAnswer: { '@type': 'Answer', text: 'Depende del método. Si descongelaste en la nevera, el alimento aguanta un par de días refrigerado antes de cocinarlo. Si usaste agua fría o microondas, hay que cocinarlo inmediatamente, porque parte del alimento ha podido alcanzar temperaturas en las que las bacterias crecen.' } },
  ],
};
