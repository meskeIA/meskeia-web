import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tiempos de asado al horno por peso: pollo, pavo, cordero | meskeIA',
  description:
    'Calcula cuánto asar al horno pollo, pavo, cordero, cerdo o ternera según el peso, con la temperatura del horno y la interna objetivo. Ideal para asados de fiesta. Gratis y en español.',
  keywords:
    'tiempos de asado horno, cuanto asar pollo entero, tiempo asado pavo por kilo, asar cordero horno tiempo, tiempo asado cerdo, roast beef tiempo horno, minutos por kilo asado',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Tiempos de asado al horno por peso', description: 'Cuánto asar pollo, pavo, cordero, cerdo o ternera según el peso, con la temperatura interna objetivo.', url: 'https://meskeia.com/tiempos-asado', siteName: 'meskeIA', locale: 'es_ES', images: [{ url: 'https://meskeia.com/coquinum/og-image.png', width: 1200, height: 630, alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA' }] },
  twitter: { card: 'summary_large_image', title: 'Tiempos de asado al horno', description: 'Cuánto asar cada carne según el peso, con la temperatura interna objetivo.', images: ['https://meskeia.com/coquinum/og-image.png'] },
  other: { 'application-name': 'Tiempos de asado meskeIA' },
  alternates: { canonical: 'https://meskeia.com/tiempos-asado/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tiempos de asado al horno por peso',
  description:
    'Calcula el tiempo de asado al horno de pollo, pavo, pato, cordero, cerdo y ternera a partir del peso de la pieza, indicando la temperatura del horno, la temperatura interna objetivo y el reposo recomendado.',
  url: 'https://meskeia.com/tiempos-asado/',
  category: 'UtilityApplication',
  features: [
    'Tiempo de asado según el peso de la pieza',
    'Pollo, pavo, pato, cordero, cerdo y ternera',
    'Temperatura del horno y temperatura interna objetivo',
    'Tiempo de reposo recomendado',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Cuánto se asa un pollo entero?', acceptedAnswer: { '@type': 'Answer', text: 'Un pollo entero se asa unos 45 minutos por kilo a 190 °C, más unos 20 minutos de base. Un pollo de 1,5 kg tardaría en torno a 1 hora y 25 minutos. Lo importante es que el interior alcance 74 °C y que el jugo del muslo salga transparente; el tiempo es solo una guía.' } },
    { '@type': 'Question', name: '¿Cuánto tiempo de horno necesita un pavo?', acceptedAnswer: { '@type': 'Answer', text: 'El pavo necesita unos 40 minutos por kilo a 180 °C, pero las piezas grandes rinden algo menos por kilo. Un pavo de 5 kg ronda las 3 horas y media. Conviene cubrir la pechuga con papel de aluminio si se dora antes de tiempo y confirmar 74 °C en el interior con termómetro.' } },
    { '@type': 'Question', name: '¿A qué temperatura se asa la carne en el horno?', acceptedAnswer: { '@type': 'Answer', text: 'Las aves y el cerdo suelen ir a 180-190 °C, el cordero a 190 °C y la ternera (roast beef) a 200 °C para sellar por fuera y dejar el interior jugoso. Subir el horno al final ayuda a dorar la piel. La calculadora indica la temperatura recomendada para cada pieza.' } },
    { '@type': 'Question', name: '¿Por qué hay que dejar reposar la carne asada?', acceptedAnswer: { '@type': 'Answer', text: 'Al reposar, la temperatura se reparte por inercia y los jugos se redistribuyen, así que la carne queda más jugosa y se corta mejor. Las piezas grandes agradecen entre 15 y 20 minutos tapadas; durante ese tiempo la temperatura interna sube todavía unos grados.' } },
    { '@type': 'Question', name: '¿El tiempo de asado garantiza que la carne esté hecha?', acceptedAnswer: { '@type': 'Answer', text: 'No por sí solo. El tiempo es orientativo y depende del horno, de la forma de la pieza y de su temperatura de partida. La única forma segura de saber que la carne está en su punto y es segura es medir la temperatura interna con un termómetro de cocina en la parte más gruesa.' } },
  ],
};
