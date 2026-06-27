import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de maíces y nixtamal: tipos y usos | meskeIA',
  description:
    'Tipos de maíz y productos derivados: dulce, pozolero, blanco, azul, masa nixtamalizada, masa harina, harina de arepa, polenta, maicena y palomitas, con sus usos. Qué es la nixtamalización. Gratis y en español.',
  keywords:
    'tipos de maiz, nixtamalizacion, masa nixtamalizada, masa harina tortilla, harina de arepa, maiz pozolero cacahuazintle, polenta, maicena almidon, maiz azul',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Guía de maíces y nixtamal', description: 'Tipos de maíz y derivados, sus usos y qué es la nixtamalización.', url: 'https://meskeia.com/guia-maices', siteName: 'meskeIA', locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: 'Guía de maíces y nixtamal', description: 'Tipos de maíz, derivados y nixtamalización.' },
  other: { 'application-name': 'Guía de maíces meskeIA' },
  alternates: { canonical: 'https://meskeia.com/guia-maices/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de maíces y nixtamal',
  description:
    'Guía de los tipos de maíz y sus productos derivados —maíz dulce, pozolero, blanco, azul, masa nixtamalizada, masa harina, harina de arepa precocida, polenta, maicena y maíz de palomitas— con sus usos, y una explicación de qué es la nixtamalización.',
  url: 'https://meskeia.com/guia-maices/',
  category: 'EducationalApplication',
  features: [
    'Tipos de maíz y derivados con sus usos',
    'Qué es la nixtamalización',
    'Masa, harinas, polenta y maicena',
    'De la tortilla a la arepa',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Qué es la nixtamalización?', acceptedAnswer: { '@type': 'Answer', text: 'Es un proceso ancestral mesoamericano que consiste en cocer el grano de maíz con cal (hidróxido de calcio) y dejarlo reposar. Esto ablanda el grano, permite molerlo en masa para tortillas, mejora su sabor y aroma y, además, libera nutrientes como la niacina, lo que históricamente previno enfermedades carenciales. Es la base de la cocina del maíz mexicana.' } },
    { '@type': 'Question', name: '¿Qué diferencia hay entre la masa harina y la harina de arepa?', acceptedAnswer: { '@type': 'Answer', text: 'La masa harina mexicana es harina de maíz nixtamalizado (cocido con cal), pensada para tortillas, sopes y tamales. La harina de arepa venezolana y colombiana es harina de maíz precocida pero sin nixtamalizar, con la que se hacen arepas y hallacas. No son intercambiables: dan masas y sabores distintos.' } },
    { '@type': 'Question', name: '¿La maicena es lo mismo que la harina de maíz?', acceptedAnswer: { '@type': 'Answer', text: 'No. La maicena es solo el almidón del maíz, un polvo muy fino que se usa para espesar salsas y cremas y en repostería sin gluten. La harina de maíz contiene el grano molido entero (germen y endospermo) y se usa para masas y panes. Una espesa, la otra da estructura.' } },
    { '@type': 'Question', name: '¿Por qué algunas tortillas son azules?', acceptedAnswer: { '@type': 'Answer', text: 'Porque están hechas con maíz azul o morado, una variedad rica en antocianinas, los mismos pigmentos antioxidantes de los arándanos o la uva tinta. Aporta color y un sabor ligeramente más intenso. Es muy apreciado en México y también se usa para bebidas como la chicha morada peruana.' } },
    { '@type': 'Question', name: '¿Todo el maíz sirve para palomitas?', acceptedAnswer: { '@type': 'Answer', text: 'No: las palomitas se hacen con una variedad concreta de cáscara dura que atrapa el vapor en su interior hasta que la presión hace reventar el grano. El maíz dulce de mesa o el de masa no revientan igual. Por eso el maíz para palomitas se vende como tal.' } },
  ],
};
