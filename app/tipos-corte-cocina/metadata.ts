import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tipos de corte en cocina: brunoise, juliana, mirepoix… | meskeIA',
  description:
    'Guía de los cortes clásicos de cocina con su dimensión y su uso: brunoise (dados de 1–3 mm), juliana (tiras de 1–2 mm), bastón, mirepoix, chiffonade, paisana, vichy y más. Busca cualquier corte y descubre para qué plato sirve. Gratis y en español.',
  keywords:
    'tipos de corte cocina, que es brunoise, corte juliana, mirepoix, chiffonade, corte baston, cortes de verduras, macedonia corte, corte parmentier, corte paisana, emince, cortes clasicos cocina',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Tipos de corte en cocina (dimensiones y usos)', description: 'Brunoise, juliana, mirepoix, bastón, chiffonade… qué mide cada corte y para qué se usa.', url: 'https://meskeia.com/tipos-corte-cocina', siteName: 'meskeIA', locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: 'Tipos de corte en cocina', description: 'Dimensiones y usos de los cortes clásicos: brunoise, juliana, mirepoix, chiffonade y más.' },
  other: { 'application-name': 'Tipos de corte en cocina meskeIA' },
  alternates: { canonical: 'https://meskeia.com/tipos-corte-cocina/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tipos de corte en cocina',
  description:
    'Tabla de consulta de los cortes clásicos de cocina (brunoise, juliana, mirepoix, bastón, chiffonade, paisana, vichy, emincé y más) con su dimensión orientativa en mm o cm y el uso o plato típico de cada uno, con buscador y filtros por forma.',
  url: 'https://meskeia.com/tipos-corte-cocina/',
  category: 'EducationalApplication',
  features: [
    'Cortes de cocina con su dimensión exacta (mm/cm)',
    'Buscador por nombre y uso',
    'Filtro por forma: dados, tiras, láminas y otros',
    'Uso y plato típico de cada corte',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Qué es el corte brunoise?', acceptedAnswer: { '@type': 'Answer', text: 'El brunoise es el dado más fino de la cocina clásica, con piezas de entre 1 y 3 mm de lado. Se usa para sofritos finos, guarniciones y rellenos, donde interesa que la verdura casi desaparezca en la salsa. Se obtiene cortando primero en juliana muy fina y luego en dados.' } },
    { '@type': 'Question', name: '¿Cuánto mide el corte juliana?', acceptedAnswer: { '@type': 'Answer', text: 'La juliana son tiras muy finas de entre 1 y 2 mm de grosor y unos 4 a 5 cm de largo. Es un corte pensado para cocciones rápidas: salteados, wok y ensaladas. Si las tiras son más gruesas (unos 6 mm), ya hablamos de bastón o batonnet.' } },
    { '@type': 'Question', name: '¿Qué es un mirepoix?', acceptedAnswer: { '@type': 'Answer', text: 'El mirepoix es un corte irregular de verdura de aproximadamente 1 a 1,5 cm, normalmente cebolla, zanahoria y apio. No se busca comerlo: es la base aromática que da sabor a fondos, caldos y guisos, y después se retira o se tritura. Al no verse en el plato, no necesita un corte fino ni regular.' } },
    { '@type': 'Question', name: '¿Qué diferencia hay entre juliana y bastón?', acceptedAnswer: { '@type': 'Answer', text: 'Ambos son cortes en tiras alargadas, pero cambia el grosor. La juliana es muy fina, de 1 a 2 mm, para salteados y ensaladas; el bastón (batonnet) es más grueso, de unos 6 mm por 5 a 6 cm de largo, y es el corte típico de las patatas fritas y los crudités.' } },
    { '@type': 'Question', name: '¿Qué es el corte chiffonade?', acceptedAnswer: { '@type': 'Answer', text: 'La chiffonade son tiras finísimas de hoja, de menos de 2 mm, que se obtienen enrollando varias hojas y cortándolas en transversal. Se usa sobre todo con hierbas y verduras de hoja como la albahaca, la espinaca o la lechuga, para decorar y aromatizar sin masticar trozos grandes.' } },
  ],
};
