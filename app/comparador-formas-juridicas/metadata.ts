import { Metadata } from 'next';

import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';
import { IRPF_MAX, IS_GENERAL, IS_MICRO_TRAMO1, IS_MICRO_TRAMO2, IS_NUEVA_CREACION, IS_COOPERATIVAS, NB, marginalIRPF, tramoIRPF } from './datos';
export const metadata: Metadata = {
  title: 'Comparador de Formas Jurídicas - Autónomo vs SL vs Cooperativa | meskeIA',
  description: 'Compara las diferentes formas jurídicas para emprender en España: autónomo, sociedad limitada, cooperativa, asociación, comunidad de bienes. Capital, fiscalidad, responsabilidad y trámites.',
  keywords: 'formas juridicas, autonomo vs sl, comparador empresas, sociedad limitada, cooperativa, asociacion, comunidad de bienes, emprender, constituir empresa, responsabilidad limitada, capital social, fiscalidad autonomo, irpf, impuesto sociedades',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Comparador de Formas Jurídicas - meskeIA',
    description: 'Descubre qué forma jurídica te conviene más: autónomo, SL, cooperativa o asociación. Comparativa completa.',
    url: 'https://meskeia.com/comparador-formas-juridicas/',
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
    title: 'Comparador de Formas Jurídicas - meskeIA',
    description: 'Autónomo vs SL vs Cooperativa: encuentra la mejor opción para tu negocio.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Comparador Formas Jurídicas meskeIA',
  },
};


export const jsonLd = generateWebAppSchema({
  name: "Comparador de Formas Jurídicas - Autónomo vs SL vs Cooperativa",
  description: "Compara las diferentes formas jurídicas para emprender en España: autónomo, sociedad limitada, cooperativa, asociación, comunidad de bienes. Capital, fiscalidad, responsabilidad y trámites.",
  url: 'https://meskeia.com/comparador-formas-juridicas/',
  category: 'UtilityApplication',
  // Antes vacío (hallazgo 3058): la plantilla pide de 4 a 8 características reales
  features: [
    'Tabla comparativa de hasta 4 formas jurídicas: autónomo, SL/SLU, cooperativa, asociación y comunidad de bienes',
    'Capital mínimo, número de socios, responsabilidad, fiscalidad, cotización y costes de constitución',
    'Test rápido de 5 preguntas que descarta las formas imposibles para el número de personas',
    'Ficha detallada de cada forma con trámites de alta, ventajas y desventajas',
    'Tipos del IRPF y del Impuesto sobre Sociedades tomados de los datos fiscales verificados de meskeIA',
  ],
});

const MARGINAL_60K = marginalIRPF(60_000);
const TRAMO_SIGUIENTE = tramoIRPF(marginalIRPF(60_001));

// ─── FAQ — FUENTE ÚNICA de las dos bocas ─────────────────────────────────
// La FAQ visible de page.tsx pinta este array y el FAQPage se deriva de él: la misma pregunta
// sobre las cooperativas tenía dos respuestas distintas (hallazgo 3051), y el FAQPage atribuía el
// capital de 1 € a la ley equivocada e inventaba un plazo para la reserva legal (3050).
export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Cuál es la diferencia entre ser autónomo y montar una sociedad limitada?',
    answer: `El autónomo tributa por IRPF (escala progresiva hasta el ${IRPF_MAX}) y responde con su patrimonio personal de las deudas. La sociedad limitada tributa por el Impuesto sobre Sociedades (${IS_GENERAL} el tipo general; ${IS_MICRO_TRAMO1}/${IS_MICRO_TRAMO2} si su cifra de negocios es menor de 1${NB}M${NB}€, y ${IS_NUEVA_CREACION} los dos primeros periodos con base positiva si es de nueva creación) y limita la responsabilidad al capital aportado, que puede ser desde 1 euro desde la Ley 18/2022. La SL implica más trámites de constitución y obligaciones contables, pero protege el patrimonio personal del socio.`,
  },
  {
    question: '¿Qué forma jurídica me conviene si empiezo con pocos beneficios?',
    answer: `No hay un umbral único: lo que cuenta es el beneficio (no la facturación), lo que cobre el administrador, si se reparten dividendos y los costes fijos de cada forma. Con beneficios bajos, el autónomo suele ser más sencillo y barato de mantener. Como referencia de tipos: el IRPF marginal es del ${MARGINAL_60K}${NB}% hasta 60.000 € de base y del ${marginalIRPF(60_001)}${NB}% hasta ${TRAMO_SIGUIENTE.hasta.toLocaleString('es-ES')} €, frente al ${IS_MICRO_TRAMO1}/${IS_MICRO_TRAMO2} de una SL pequeña o el ${IS_NUEVA_CREACION} de una de nueva creación. Para tu caso, compara con números en el comparador autónomo vs SL y con un asesor.`,
  },
  {
    question: '¿Qué capital mínimo se necesita para constituir una sociedad limitada en España?',
    answer: 'Desde la Ley 18/2022, de creación y crecimiento de empresas (en vigor desde el 19/10/2022), el capital mínimo de una SL es de 1 euro (art. 4.1 de la Ley de Sociedades de Capital). Mientras no llegue a 3.000 €, la sociedad debe destinar a reserva legal al menos el 20 % del beneficio hasta que esa reserva y el capital sumen 3.000 €, sin plazo fijo; y si en la liquidación el patrimonio no alcanza para pagar a los acreedores, los socios responden solidariamente de la diferencia entre 3.000 € y el capital suscrito. Las sociedades anónimas siguen requiriendo 60.000 €.',
  },
  {
    question: '¿Qué ventajas fiscales tiene una cooperativa frente a una SL?',
    answer: `Las cooperativas fiscalmente protegidas tributan al ${IS_COOPERATIVAS} en el Impuesto sobre Sociedades por sus resultados cooperativos (Ley 20/1990, art. 33.2.a), frente al ${IS_GENERAL} general de una SL o al ${IS_MICRO_TRAMO1}/${IS_MICRO_TRAMO2} de una SL pequeña. Las especialmente protegidas, como las de trabajo asociado, tienen además una bonificación del 50 % de la cuota íntegra (art. 34.2). También acceden a bonificaciones en cotizaciones y a ayudas de economía social. La contrapartida: más complejidad normativa y la obligación de dotar fondos obligatorios con parte de los excedentes.`,
  },
  {
    question: '¿Puede una persona sola constituir una sociedad limitada?',
    answer: 'Sí, existe la Sociedad Limitada Unipersonal (SLU), en la que un único socio, persona física o jurídica, es titular del 100 % del capital social. Debe hacerse constar en el Registro Mercantil y en toda la documentación que la sociedad es unipersonal, y los contratos entre el socio único y la SLU deben constar por escrito y en un libro registro.',
  },
  {
    question: '¿Qué es una Comunidad de Bienes y cuándo conviene?',
    answer: 'Una Comunidad de Bienes (CB) es un contrato por el que dos o más personas ponen en común bienes o derechos para desarrollar una actividad económica. No tiene personalidad jurídica propia. Conviene cuando el riesgo patrimonial es bajo, la actividad es temporal o pequeña y se quiere evitar la complejidad de una SL. Cada comunero tributa en IRPF por su parte de los beneficios. Atención: la responsabilidad es ilimitada y solidaria, y un acreedor puede reclamar la deuda total a cualquiera de los comuneros.',
  },
  {
    question: '¿Puedo transformar mi actividad de autónomo en SL sin liquidar la empresa?',
    answer: 'Sí. El proceso se llama aportación de rama de actividad o constitución de SL con aportaciones no dinerarias: el autónomo aporta a la SL los activos de su negocio (cartera de clientes, contratos, equipos) a cambio de participaciones. Conviene un asesor fiscal para evitar tributar en el traspaso y asegurar la continuidad de contratos y empleados.',
  },
  {
    question: '¿Una cooperativa puede tener trabajadores que no sean socios?',
    answer: `Sí, pero con límites que fija la normativa, estatal o autonómica según el caso. En general, las horas trabajadas por empleados no socios no pueden superar un porcentaje de las de los socios trabajadores, y superarlo puede hacer perder la condición de cooperativa fiscalmente protegida y el tipo del ${IS_COOPERATIVAS}.`,
  },
  {
    question: '¿Cuál es la diferencia entre SL, SLU y SRL?',
    answer: 'Las tres se refieren a la misma figura: la Sociedad de Responsabilidad Limitada. La SLU (Sociedad Limitada Unipersonal) tiene un único socio, lo que obliga a inscribir la unipersonalidad en el Registro Mercantil y a hacerlo constar en su documentación. SRL es otra abreviatura de la misma forma, menos usada en España.',
  },
  {
    question: '¿Qué es una Sociedad Civil Profesional y para qué sirve?',
    answer: 'Las sociedades profesionales, reguladas por la Ley 2/2007, agrupan a profesionales colegiados para ejercer conjuntamente su actividad (abogados, médicos, arquitectos…). Pueden adoptar cualquier forma societaria, tienen personalidad jurídica propia y los profesionales mantienen responsabilidad personal por sus actos profesionales. Requieren inscripción en el Registro Mercantil y en el registro del colegio profesional correspondiente.',
  },
  {
    question: '¿Puede una asociación contratar empleados y tener ingresos?',
    answer: 'Sí. Una asociación puede contratar trabajadores por cuenta ajena (Régimen General de la Seguridad Social) y realizar actividades económicas para financiar sus fines. Esos ingresos tributan en el Impuesto sobre Sociedades, con exenciones relevantes. Lo que está prohibido es repartir beneficios entre los asociados: deben reinvertirse en los fines de la entidad.',
  },
  {
    question: '¿Qué pasa si constituyo una SL y luego quiero cerrarla?',
    answer: 'Disolver y liquidar una SL requiere acuerdo en junta general, nombramiento de un liquidador, pago de las deudas, reparto del activo restante entre los socios, escritura pública de liquidación y cancelación en el Registro Mercantil. Si hay deudas pendientes, el administrador puede responder personalmente de ellas si no promovió la disolución a tiempo.',
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
