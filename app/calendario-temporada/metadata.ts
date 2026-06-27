import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calendario de frutas y verduras de temporada | meskeIA',
  description:
    'Descubre qué frutas y verduras son de temporada cada mes del año (hemisferio norte). Comer de temporada es más sabroso, barato y sostenible. Gratis y en español.',
  keywords:
    'frutas de temporada, verduras de temporada, calendario temporada, que fruta es de temporada, productos de temporada por mes, comer de temporada',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Calendario de frutas y verduras de temporada', description: 'Qué frutas y verduras son de temporada cada mes.', url: 'https://meskeia.com/calendario-temporada', siteName: 'meskeIA', locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: 'Frutas y verduras de temporada', description: 'Qué es de temporada cada mes del año.' },
  other: { 'application-name': 'Calendario de temporada meskeIA' },
  alternates: { canonical: 'https://meskeia.com/calendario-temporada/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calendario de frutas y verduras de temporada',
  description:
    'Calendario mensual de las frutas y verduras de temporada para el hemisferio norte (España y latitudes similares), para comer productos en su mejor momento, más sabrosos, baratos y sostenibles.',
  url: 'https://meskeia.com/calendario-temporada/',
  category: 'EducationalApplication',
  features: [
    'Frutas y verduras de temporada por mes',
    'Pensado para el hemisferio norte',
    'Selector de mes',
    'Fomenta el consumo sostenible',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Por qué conviene comer de temporada?', acceptedAnswer: { '@type': 'Answer', text: 'Porque la fruta y la verdura de temporada están en su mejor momento de sabor y de nutrientes, suelen ser más baratas por su abundancia y tienen menor impacto ambiental, al no requerir invernaderos intensivos ni largos transportes. Además, comer de temporada da variedad a lo largo del año.' } },
    { '@type': 'Question', name: '¿Qué frutas son de temporada en verano?', acceptedAnswer: { '@type': 'Answer', text: 'El verano es la gran temporada de la fruta de hueso y refrescante: melocotón, nectarina, ciruela, albaricoque, cereza (a inicio), y sobre todo sandía y melón. También higos y las primeras uvas. Son frutas jugosas y dulces ideales para el calor, en su punto entre junio y agosto.' } },
    { '@type': 'Question', name: '¿Qué verduras hay en invierno?', acceptedAnswer: { '@type': 'Answer', text: 'El invierno es temporada de crucíferas y hortalizas de hoja resistentes: brócoli, coliflor, col, acelga, espinaca, puerro y alcachofa. Son verduras perfectas para guisos, cremas y platos de cuchara, justo cuando más apetece la comida caliente.' } },
    { '@type': 'Question', name: '¿Este calendario sirve para Latinoamérica?', acceptedAnswer: { '@type': 'Answer', text: 'Este calendario está pensado para el hemisferio norte (España y latitudes similares). En el hemisferio sur, como gran parte de Sudamérica, las estaciones están invertidas: cuando aquí es invierno, allí es verano. Aun así, la idea de comer de temporada es igual de válida; solo cambia el mes de cada producto.' } },
    { '@type': 'Question', name: '¿La temporada es exacta?', acceptedAnswer: { '@type': 'Answer', text: 'Es orientativa. El clima, la zona y el tipo de cultivo adelantan o retrasan cada producto, y muchos están disponibles algo antes o después de su mejor mes. Lo importante es la idea general: priorizar lo que esté de temporada en tu zona en cada momento del año.' } },
  ],
};
