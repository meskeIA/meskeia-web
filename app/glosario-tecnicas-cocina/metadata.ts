import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Glosario de técnicas de cocina: blanquear, confitar, bresar… | meskeIA',
  description:
    'Qué significan de verdad los verbos de las recetas: blanquear, escaldar, pochar, bresar, confitar, nacarar el arroz, desglasar, napar y muchos más, agrupados por método y con ejemplos. Buscador incluido, gratis y en español.',
  keywords:
    'tecnicas de cocina, glosario de cocina, que es blanquear en cocina, que es confitar, que es bresar, que es desglasar, nacarar el arroz, diferencia pochar y hervir, reaccion de maillard, calor humedo y calor seco',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Glosario de técnicas de cocina', description: 'Los verbos de las recetas explicados: blanquear, confitar, bresar, desglasar y muchos más, con ejemplos.', url: 'https://meskeia.com/glosario-tecnicas-cocina', siteName: 'meskeIA', locale: 'es_ES', images: [{ url: 'https://meskeia.com/coquinum/og-image.png', width: 1200, height: 630, alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA' }] },
  twitter: { card: 'summary_large_image', title: 'Glosario de técnicas de cocina', description: 'Blanquear, confitar, bresar, desglasar… los verbos de las recetas, explicados con ejemplos.', images: ['https://meskeia.com/coquinum/og-image.png'] },
  other: { 'application-name': 'Glosario de técnicas de cocina meskeIA' },
  alternates: { canonical: 'https://meskeia.com/glosario-tecnicas-cocina/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Glosario de técnicas de cocina',
  description:
    'Glosario de técnicas culinarias que explica los verbos que aparecen en las recetas (blanquear, escaldar, escalfar, bresar, confitar, nacarar, desglasar, napar, atemperar y muchos más), agrupados por método —cocción en líquido o vapor, con grasa o calor seco, preparación previa y ligar o acabar— con definiciones breves y ejemplos, más un buscador.',
  url: 'https://meskeia.com/glosario-tecnicas-cocina/',
  category: 'EducationalApplication',
  features: [
    'Más de 40 técnicas culinarias definidas',
    'Buscador de técnicas sin sensibilidad a acentos',
    'Filtro por tipo: líquido o vapor, grasa o calor seco, preparación previa, ligar y acabar',
    'Definición breve y ejemplo típico de cada técnica',
    'Explicación del calor húmedo, el seco y la reacción de Maillard',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Qué es blanquear en cocina?', acceptedAnswer: { '@type': 'Answer', text: 'Blanquear es hervir un alimento muy brevemente y cortarlo enseguida en agua con hielo. El agua con hielo detiene la cocción y fija el color, por eso se usa con verduras como las judías verdes o el brócoli. No hay que confundirlo con montar huevos, que en repostería también se llama a veces "blanquear".' } },
    { '@type': 'Question', name: '¿Qué diferencia hay entre pochar y hervir?', acceptedAnswer: { '@type': 'Answer', text: 'Al hervir, el líquido está en plena ebullición, en torno a 100 °C, con burbujas fuertes. Al escalfar o pochar, el líquido está caliente pero sin llegar a hervir, a unos 70-90 °C, con apenas movimiento. La cocción suave del pochado es más delicada y evita que se rompan alimentos frágiles como un huevo o un pescado.' } },
    { '@type': 'Question', name: '¿Qué significa desglasar una salsa?', acceptedAnswer: { '@type': 'Answer', text: 'Desglasar es añadir un líquido —vino, caldo o agua— a una sartén o cazuela caliente después de dorar carne o verduras. Con el calor y una cuchara se despegan los jugos caramelizados pegados al fondo, que concentran mucho sabor. Ese líquido, ya con esos jugos disueltos, se convierte en la base de una salsa.' } },
    { '@type': 'Question', name: '¿Qué es la reacción de Maillard?', acceptedAnswer: { '@type': 'Answer', text: 'Es la reacción entre azúcares y proteínas que se produce por encima de unos 140 °C y genera el dorado y el aroma tostado de los alimentos: la corteza del pan, la piel del pollo o la costra de una carne sellada. Por eso una carne dorada sabe más que una hervida. En cocción con agua no se alcanza, porque el agua no pasa de 100 °C.' } },
    { '@type': 'Question', name: '¿Qué es nacarar el arroz?', acceptedAnswer: { '@type': 'Answer', text: 'Nacarar es rehogar el arroz en grasa caliente durante uno o dos minutos, antes de añadir el caldo, hasta que el grano se vuelve translúcido y brillante como el nácar. Sella el grano, ayuda a que el arroz suelte el almidón de forma controlada y aporta sabor. Es un paso habitual en el risotto, la paella y otros arroces.' } },
  ],
};
