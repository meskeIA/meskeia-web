import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';
import { formatNumber } from '@/lib';
import { presionOsmotica, compararCompartimentos, solutoPorId, molaridadDesde, osmolaridad } from './motor';

export const metadata: Metadata = {
  title: 'Simulador de Ósmosis: Presión Osmótica y Medio Hipotónico, Isotónico o Hipertónico | meskeIA',
  description: 'Separa dos disoluciones con una membrana semipermeable y mira hacia dónde pasa el agua, calcula la presión osmótica (π = i·M·R·T) y comprueba qué le pasa a una célula animal o vegetal en un medio hipotónico, isotónico o hipertónico.',
  keywords: 'osmosis, ósmosis, que es la osmosis, presion osmotica, membrana semipermeable, medio hipotonico, medio isotonico, medio hipertonico, plasmolisis, turgencia, hemolisis, crenacion, factor de van t hoff, osmolaridad, simulador, biologia, quimica, secundaria, preparatoria, educación media',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-osmosis/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Ósmosis y Presión Osmótica | meskeIA',
    description: 'Hacia dónde pasa el agua a través de una membrana, cuánta presión osmótica hay y qué le pasa a una célula en agua dulce o salada, con tus números.',
    url: 'https://meskeia.com/simulador-osmosis/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de ósmosis y presión osmótica | meskeIA',
    description: 'Membrana semipermeable, π = i·M·R·T y célula en medio hipotónico, isotónico o hipertónico',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Ósmosis y Presión Osmótica',
  description: 'Simulador de ósmosis con dos problemas: dos disoluciones separadas por una membrana semipermeable (sentido del paso del agua, presión osmótica de cada lado con π = i·M·R·T y columna de agua equivalente) y una célula animal o vegetal en un medio hipotónico, isotónico o hipertónico.',
  url: 'https://meskeia.com/simulador-osmosis/',
  category: 'EducationalApplication',
  features: [
    'Dos compartimentos separados por una membrana semipermeable, con un soluto distinto en cada lado',
    'Presión osmótica con la ecuación de van \'t Hoff π = i·M·R·T, en atm, kPa y mmHg',
    'Seis solutos con su factor de van \'t Hoff: glucosa, sacarosa, urea, NaCl, KCl y CaCl₂',
    'Concentración en mol/L o en % masa/volumen, con la conversión a molaridad y osmolaridad',
    'Columna de agua que equilibra la diferencia de presión osmótica (osmómetro)',
    'Célula animal (glóbulo rojo) o vegetal en un medio: tonicidad, sentido del agua, hemólisis, crenación, turgencia o plasmólisis',
  ],
  keywords: ['ósmosis', 'presión osmótica', 'membrana semipermeable', 'medio hipotónico', 'medio hipertónico', 'plasmólisis', 'simulador de biología'],
});

// Cifras de las respuestas: salen del motor, no se teclean
const piGlucosa = presionOsmotica(0.1, 25);
const columnaGlucosa = compararCompartimentos(0.1, 0, 25);
const nacl = solutoPorId('nacl');
const mSuero = nacl ? molaridadDesde(0.9, 'porcentaje', nacl) : null;
const osmSuero = nacl && mSuero !== null ? osmolaridad(mSuero, nacl) : null;
const piSuero37 = osmSuero !== null ? presionOsmotica(osmSuero, 37) : null;

const atmGlucosa = piGlucosa ? formatNumber(piGlucosa.atm, 2) : '2,45';
const mGlucosa = columnaGlucosa ? formatNumber(columnaGlucosa.alturaColumna, 1) : '25,3';
const textoMSuero = mSuero !== null ? formatNumber(mSuero, 3) : '0,154';
const textoOsmSuero = osmSuero !== null ? formatNumber(osmSuero, 3) : '0,308';
const atmSuero = piSuero37 ? formatNumber(piSuero37.atm, 1) : '7,8';

export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Qué es la ósmosis?',
    answer: 'Es el paso de agua a través de una membrana semipermeable, que deja pasar el agua y no el soluto, desde la disolución más diluida hacia la más concentrada. El agua se mueve en los dos sentidos, pero pasa más hacia el lado con más partículas disueltas, así que el neto va de menos a más concentración hasta que las dos se igualan o una presión lo frena.',
  },
  {
    question: '¿Cómo se calcula la presión osmótica?',
    answer: `Con la ecuación de van 't Hoff, π = i·M·R·T: factor de van 't Hoff por molaridad por la constante de los gases (0,082 atm·L/(mol·K)) por la temperatura en kelvin. Una disolución de glucosa 0,1 M a 25 °C tiene π = 0,1 · 0,082 · 298 ≈ ${atmGlucosa} atm, la presión de una columna de agua de unos ${mGlucosa} m.`,
  },
  {
    question: '¿Qué diferencia hay entre un medio hipotónico, isotónico e hipertónico?',
    answer: 'Se comparan con el interior de la célula. Un medio hipotónico tiene menos partículas disueltas y el agua entra en la célula; uno isotónico tiene las mismas y el agua no pasa en neto; uno hipertónico tiene más y el agua sale. Por eso la misma disolución puede ser hipotónica para una célula e hipertónica para otra.',
  },
  {
    question: '¿Qué le pasa a una célula en agua destilada o en agua muy salada?',
    answer: 'En agua destilada, que es hipotónica, entra agua: un glóbulo rojo se hincha y puede reventar (hemólisis), mientras que una célula vegetal queda turgente porque la pared celular la frena. En agua muy salada, hipertónica, sale agua: el glóbulo rojo se arruga (crenación) y en la célula vegetal la membrana se despega de la pared (plasmólisis).',
  },
  {
    question: '¿Por qué el cloruro de sodio cuenta el doble que la glucosa?',
    answer: 'Porque la presión osmótica depende del número de partículas disueltas, no de qué sean. La glucosa se disuelve en moléculas enteras (i = 1) y el NaCl se separa en Na⁺ y Cl⁻ (i = 2), así que 0,1 M de NaCl tiene unas 0,2 osmol/L. El CaCl₂ da tres iones (i = 3). En la realidad los iones no se separan del todo y el factor es algo menor: el NaCl a 0,9 % ronda 1,86.',
  },
  {
    question: '¿Por qué el suero fisiológico es isotónico?',
    answer: `El suero fisiológico es cloruro de sodio al 0,9 %: 9 g por litro, que son ${textoMSuero} mol/L y unas ${textoOsmSuero} osmol/L con el factor ideal. Es casi lo mismo que el plasma sanguíneo (entre 275 y 295 mOsm/kg), así que un glóbulo rojo no gana ni pierde agua. Su presión osmótica a 37 °C ronda las ${atmSuero} atm.`,
  },
  {
    question: '¿Qué diferencia hay entre ósmosis y difusión?',
    answer: 'En la difusión se mueve el soluto, de donde hay más concentración a donde hay menos, y no hace falta membrana. En la ósmosis se mueve el agua a través de una membrana que el soluto no puede cruzar, y lo hace hacia el lado más concentrado. Las dos son transporte pasivo: no gastan energía de la célula.',
  },
  {
    question: '¿Qué es la ósmosis inversa?',
    answer: 'Es empujar el agua en sentido contrario al natural: si al lado concentrado se le aplica una presión mayor que su presión osmótica, el agua pasa del concentrado al diluido y el soluto se queda atrás. Así funcionan los filtros domésticos de ósmosis inversa y las plantas desaladoras, que necesitan presiones de decenas de atmósferas porque el agua de mar es muy concentrada.',
  },
];

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PREGUNTAS_FRECUENTES.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};
