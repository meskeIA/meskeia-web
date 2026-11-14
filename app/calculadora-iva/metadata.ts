import { Metadata } from 'next';

import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';
import { PORCENTAJES_IVA } from '@/data/fiscal/iva';
import { formatTipoNominal } from '@/lib/formatters';

/** «21 %» con el espacio duro que pide el formato español (CLAUDE.md global §2). */
const pct = (n: number): string => `${formatTipoNominal(n)} %`;

const G = pct(PORCENTAJES_IVA.general);
const R = pct(PORCENTAJES_IVA.reducido);
const S = pct(PORCENTAJES_IVA.superreducido);

export const metadata: Metadata = {
  title: `Calculadora de IVA Online - Calcula IVA ${G}, ${R}, ${S} | meskeIA`,
  description: `Calculadora de IVA española gratuita. Añade o quita IVA al ${G}, ${R} o ${S}. Calcula base imponible, cuota de IVA y total con un clic.`,
  keywords: 'calculadora iva, calcular iva, quitar iva, añadir iva, iva 21, iva 10, iva 4, base imponible, impuestos españa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de IVA Online - meskeIA',
    description: `Calcula el IVA español fácilmente. Añade o quita IVA al ${G}, ${R} o ${S}.`,
    url: 'https://meskeia.com/calculadora-iva/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de IVA Online',
    description: `Calcula el IVA español fácilmente. Añade o quita IVA al ${G}, ${R} o ${S}.`,
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: `Calculadora de IVA Online - Calcula IVA ${G}, ${R}, ${S}`,
  description: `Calculadora de IVA española gratuita. Añade o quita IVA al ${G}, ${R} o ${S}. Calcula base imponible, cuota de IVA y total con un clic.`,
  url: 'https://meskeia.com/calculadora-iva/',
  category: 'FinanceApplication',
  features: [
    'Añadir el IVA a una base imponible',
    'Quitar el IVA a un precio con IVA incluido',
    `Tipos general (${G}), reducido (${R}) y superreducido (${S})`,
    'Desglose de base imponible, cuota de IVA y total, redondeado al céntimo y cuadrado con el total',
    'Lectura de importes en formato español (1.234,56)',
    'Código HTML exportable con la tabla del resultado',
  ],
});

// ─────────────────────────────────────────────────────────────────────────
// FAQ — FUENTE ÚNICA de las dos bocas: la FAQ visible de page.tsx y el FAQPage de abajo
// (hallazgo 4644: la pregunta del autónomo estaba escrita dos veces con dos respuestas).
// Fuentes de los tipos: AEAT, «Tipos impositivos en el IVA 2026» (2 de junio de 2026), y
// Ley 37/1992, art. 3 (Canarias, Ceuta y Melilla fuera del territorio de aplicación del IVA).
// ─────────────────────────────────────────────────────────────────────────
export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Cuáles son los tipos de IVA en España en 2026?',
    answer: `España tiene tres tipos de IVA: el general del ${G}, que se aplica a la mayoría de bienes y servicios; el reducido del ${R}, para la mayoría de alimentos, la hostelería, el transporte de viajeros y la entrega de viviendas; y el superreducido del ${S}, para alimentos básicos como el pan, la leche, los huevos, las frutas, las verduras, las legumbres y el aceite de oliva, y para los medicamentos y los libros. Hay además operaciones exentas, como la educación reglada, la asistencia sanitaria y las operaciones financieras. Estos tipos rigen en la Península y Baleares: en Canarias se aplica el IGIC, y en Ceuta y Melilla el IPSI, no el IVA.`,
  },
  {
    question: '¿Qué diferencia hay entre añadir IVA y quitar IVA?',
    answer: 'Añadir IVA: el precio que tienes es la base imponible sin impuesto y quieres saber el precio final. Fórmula: precio final = base × (1 + tipo). Por ejemplo: 100 € × 1,21 = 121 €. Quitar IVA: el precio que tienes ya incluye el IVA y quieres obtener la base imponible. Fórmula: base = precio con IVA / (1 + tipo). Por ejemplo: 121 € / 1,21 = 100 €. La calculadora redondea la base al céntimo y obtiene la cuota como diferencia, para que el desglose sume exactamente el total.',
  },
  {
    question: '¿Cómo se calcula la base imponible de una factura?',
    answer: `La base imponible es el precio del bien o servicio antes de impuestos. Sobre ella se aplica el tipo de IVA para obtener la cuota tributaria. La suma de ambas es el total de la factura. Por ejemplo: base 500 € + IVA ${G} (105 €) = total 605 €. En facturas simplificadas o tiques, el total ya incluye el IVA y hay que dividir para obtener la base.`,
  },
  {
    question: `¿Qué bienes y servicios tienen IVA al ${R}?`,
    answer: `El tipo reducido del ${R} se aplica, entre otros, a los alimentos que no van al superreducido, como la carne, el pescado o la pasta (el aceite de oliva va al ${S}); al agua; a la hostelería y la restauración, incluidas las bebidas servidas para consumir en el acto; al transporte de viajeros; a la entrega de viviendas; a las flores y plantas ornamentales; a la entrada a teatros, conciertos, cines y museos; y a las obras de renovación y reparación de viviendas que cumplan los requisitos. Las bebidas alcohólicas y los refrescos, zumos y gaseosas con azúcares o edulcorantes añadidos, vendidos como producto, van al ${G}.`,
  },
  {
    question: '¿Tengo que cobrar IVA si soy autónomo?',
    answer: `En general sí, cuando tu actividad está sujeta y no exenta: repercutes el IVA en tus facturas (${G}, ${R} o ${S} según lo que vendas), lo declaras cada trimestre con el modelo 303 y puedes deducir el IVA soportado en los gastos de la actividad. Hay actividades exentas, como la asistencia sanitaria de los profesionales sanitarios, la enseñanza reglada, los seguros, las operaciones financieras o el alquiler de vivienda: no repercuten IVA ni deducen el soportado.`,
  },
  {
    question: '¿Qué diferencia hay entre IVA repercutido y soportado?',
    answer: 'IVA repercutido: el que cobras tú a tus clientes en tus facturas (lo debes ingresar a Hacienda). IVA soportado: el que pagas tú a tus proveedores en tus compras (lo puedes deducir). En el modelo 303 pagas la diferencia: repercutido menos soportado.',
  },
  {
    question: '¿Cuándo se presenta el modelo 303?',
    answer: 'Trimestralmente: 1T (1-20 abril), 2T (1-20 julio), 3T (1-20 octubre), 4T (1-30 enero del año siguiente). También hay una declaración resumen anual con el modelo 390 (hasta el 30 de enero). Las grandes empresas lo presentan mensualmente.',
  },
  {
    question: '¿Qué es el recargo de equivalencia y a quién afecta?',
    answer: 'Es un régimen especial para comerciantes minoristas personas físicas que venden a consumidores finales (no a empresas). No gestionan el IVA ellos mismos: su proveedor les repercute el IVA normal más el recargo. A cambio no presentan el modelo 303.',
  },
  {
    question: '¿Puedo deducir el IVA de cualquier gasto?',
    answer: 'Solo el IVA de gastos afectos a tu actividad económica. No puedes deducir el IVA de gastos personales, de vehículos que no sean 100 % profesionales (la norma general es un 50 % deducible), ni de facturas sin tus datos o con datos incorrectos.',
  },
  {
    question: '¿Qué pasa si no cobro IVA cuando debería?',
    answer: 'Hacienda puede considerar que el IVA estaba incluido en el precio y reclamarte la parte proporcional. Tendrás que ingresarlo de tu bolsillo. Además, puede imponerte recargos e intereses. Siempre es mejor facturar correctamente desde el inicio.',
  },
  {
    question: '¿Cómo funciona el IVA en facturas a clientes fuera de España?',
    answer: 'Clientes en la UE con NIF intracomunitario (empresa o autónomo): factura sin IVA, el cliente lo autorrepercute. Clientes particulares de la UE sin NIF: IVA del país de destino (sistema OSS). Clientes fuera de la UE: factura exenta de IVA (exportación).',
  },
  {
    question: '¿El IVA afecta al IRPF?',
    answer: 'No directamente. El IVA es un impuesto de gestión: cobras el de tus clientes y pagas el de tus proveedores; la diferencia va a Hacienda. No es un ingreso ni un gasto propio. El IRPF se calcula sobre la base imponible (sin IVA). Sin embargo, el IVA no deducible (gastos personales) sí es gasto deducible en IRPF.',
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
