import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de chocolate y cacao: tipos, porcentajes y usos | meskeIA',
  description:
    'Qué significa el porcentaje del chocolate y qué tipo usar: negro, con leche, blanco, de cobertura, cacao en polvo natural o alcalinizado, nibs y más, con sus usos en repostería. Gratis y en español.',
  keywords:
    'guia chocolate, porcentaje cacao chocolate, chocolate de cobertura, cacao en polvo natural alcalinizado, chocolate negro 70, tipos de chocolate reposteria, nibs de cacao',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Guía de chocolate y cacao', description: 'Qué significa el porcentaje y qué chocolate usar para cada cosa.', url: 'https://meskeia.com/guia-chocolate', siteName: 'meskeIA', locale: 'es_ES', images: [{ url: 'https://meskeia.com/coquinum/og-image.png', width: 1200, height: 630, alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA' }] },
  twitter: { card: 'summary_large_image', title: 'Guía de chocolate y cacao', description: 'Tipos, porcentajes y usos del chocolate.', images: ['https://meskeia.com/coquinum/og-image.png'] },
  other: { 'application-name': 'Guía de chocolate meskeIA' },
  alternates: { canonical: 'https://meskeia.com/guia-chocolate/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de chocolate y cacao',
  description:
    'Guía de los tipos de chocolate y cacao —negro en sus distintos porcentajes, con leche, blanco, de cobertura, cacao en polvo natural y alcalinizado, y nibs— explicando qué significa el porcentaje de cacao y para qué se usa cada uno en repostería.',
  url: 'https://meskeia.com/guia-chocolate/',
  category: 'EducationalApplication',
  features: [
    'Tipos de chocolate con su porcentaje de cacao',
    'Usos recomendados en repostería',
    'Cacao en polvo natural y alcalinizado',
    'Qué significa el porcentaje del chocolate',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Qué significa el porcentaje de un chocolate?', acceptedAnswer: { '@type': 'Answer', text: 'El porcentaje indica la proporción de cacao (pasta y manteca) que contiene el chocolate; el resto es principalmente azúcar, y en el chocolate con leche también leche. Un 70% tiene un 70% de cacao y un 30% de azúcar, aproximadamente. A más porcentaje, más intenso y amargo, y menos dulce.' } },
    { '@type': 'Question', name: '¿Qué chocolate uso para repostería?', acceptedAnswer: { '@type': 'Answer', text: 'El chocolate negro del 70% es el más versátil para repostería: equilibra intensidad y dulzor y funciona en ganache, mousse, coberturas y bizcochos. Para bombones y baños con brillo se usa chocolate de cobertura, que lleva más manteca de cacao y queda más fluido al fundir.' } },
    { '@type': 'Question', name: '¿Qué diferencia hay entre cacao natural y alcalinizado?', acceptedAnswer: { '@type': 'Answer', text: 'El cacao en polvo natural es ácido y de sabor afrutado, y reacciona con el bicarbonato en las recetas. El alcalinizado (o "dutch") se trata para reducir su acidez, quedando más oscuro y de sabor más suave; va mejor con la levadura química y en bebidas. No siempre son intercambiables sin ajustar el leudante.' } },
    { '@type': 'Question', name: '¿El chocolate blanco lleva cacao?', acceptedAnswer: { '@type': 'Answer', text: 'El chocolate blanco no lleva pasta de cacao (la parte que da color y sabor a chocolate), solo manteca de cacao, leche y azúcar. Por eso es de color marfil y muy dulce. Técnicamente es un derivado del cacao, aunque su sabor es muy distinto del chocolate negro o con leche.' } },
    { '@type': 'Question', name: '¿Por qué se "corta" o agarrota el chocolate al fundir?', acceptedAnswer: { '@type': 'Answer', text: 'El chocolate se agarrota si entra en contacto con una pequeña cantidad de agua o se calienta de más. Para evitarlo, fúndelo al baño maría suave o en microondas a golpes cortos, removiendo, y asegúrate de que todos los utensilios estén bien secos. Una vez agarrotado, es difícil de recuperar para baños lisos.' } },
  ],
};
