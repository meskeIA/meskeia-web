import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';
import {
  OBLIGACION_DECLARAR_2025,
  REDUCCION_TRIBUTACION_CONJUNTA_2025,
  REDUCCION_RENDIMIENTOS_TRABAJO_2025,
} from '@/data/fiscal/irpf';
import { DEDUCCION_MATERNIDAD_IRPF } from '@/data/fiscal/maternidad';
import {
  ESCALA_RECARGO_EXTEMPORANEO,
  FRACCIONAMIENTO_IRPF,
  SANCION_PRESENTACION_TARDIA_SIN_PERJUICIO,
} from '@/data/fiscal/recargos-sanciones';
import { formatNumber } from '@/lib/formatters';

/** «22.000 €» · «15 %» con el espacio duro del formato español. */
const eur = (n: number): string => `${formatNumber(n, 0)} €`;
const pct = (n: number): string => `${formatNumber(n, 0)} %`;

const OB = OBLIGACION_DECLARAR_2025.trabajo;
const RC = REDUCCION_TRIBUTACION_CONJUNTA_2025;
const RE = ESCALA_RECARGO_EXTEMPORANEO;
const MULTA = SANCION_PRESENTACION_TARDIA_SIN_PERJUICIO;
const FR = FRACCIONAMIENTO_IRPF;

export const metadata: Metadata = {
  // anio-ok: «Renta 2026» es el año de la CAMPAÑA, no la vigencia del dato; cambia con la campaña junto a las fechas fijas del cuerpo
  title: 'Checklist Declaración de la Renta 2026 — Documentos y Fechas | meskeIA',
  description: 'Lista de documentos para hacer la renta 2026 (ejercicio 2025). Adaptada a tu perfil: asalariado, autónomo, pensionista, inversor o arrendador. Fechas clave, deducciones y guía paso a paso.',
  keywords: 'checklist declaración renta 2026, documentos renta 2025, qué documentos necesito para la renta, fechas declaración renta, deducciones irpf, borrador renta, renta web',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    // anio-ok: el año de la campaña, como el title de arriba
    title: 'Checklist Declaración de la Renta 2026 | meskeIA',
    description: 'Todos los documentos que necesitas para hacer la renta, organizados por perfil: asalariado, autónomo, pensionista, inversor y propietario.',
    url: 'https://meskeia.com/checklist-declaracion-renta/',
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
    // anio-ok: el año de la campaña, como el title de arriba
    title: 'Checklist Declaración Renta 2026 | meskeIA',
    description: 'Todos los documentos que necesitas para la renta, por perfil. Asalariado, autónomo, pensionista, inversor, arrendador.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Checklist Declaración de la Renta 2026",
  description: "Lista de documentos para hacer la renta 2026 (ejercicio 2025). Adaptada a tu perfil: asalariado, autónomo, pensionista, inversor o arrendador. Fechas clave, deducciones y guía paso a paso.",
  url: "https://meskeia.com/checklist-declaracion-renta/",
  category: 'FinanceApplication',
  features: [
    'Checklist de documentos filtrado por cinco perfiles combinables: asalariado, autónomo, pensionista, inversor y propietario',
    'Progreso con recuento y porcentaje de documentos verificados, total y por categoría',
    'Marcar o desmarcar de una vez todos los documentos visibles',
    'Distintivo de documentos imprescindibles',
    'Descarga de la lista en texto con perfil, progreso y fechas clave',
    'Fechas clave de la campaña de la Renta',
    'Manejable con teclado (Espacio/Enter) y en móvil',
  ],
});

// ─────────────────────────────────────────────────────────────────────────
// FAQ — FUENTE ÚNICA de las dos bocas: la FAQ visible de page.tsx y el FAQPage de abajo
// (hallazgo 4627: la conjunta tenía dos respuestas distintas). Las cifras salen de data/fiscal
// (hallazgo 4628). Fuentes leídas el 14/11/2026 en el BOE consolidado: LIRPF arts. 69.1, 81,
// 84.2 y 96; LGT arts. 27.2 y 198; Ley 49/2002, art. 19 y DA 9.ª.3; Orden HAC/277/2026, arts.
// 7.1, 11.5 y 12.3.
// ─────────────────────────────────────────────────────────────────────────
export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Estoy obligado a hacer la declaración de la renta?',
    answer: `No siempre. Si solo tienes rendimientos del trabajo, no tienes que declarar cuando no superan ${eur(OB.unPagador)} al año con un único pagador, o ${eur(OB.variosPagadores)} si tienes varios pagadores y lo cobrado del segundo y los restantes, sumado, supera ${eur(OB.limiteSegundoPagador)} (art. 96 de la Ley del IRPF). Quien estuvo de alta como autónomo en algún momento del año está obligado a declarar sean cuales sean sus ingresos, y también quien quiera reducir su base por aportaciones a planes de pensiones. Hay otros supuestos (rentas del capital, imputaciones de inmuebles): Renta Web te indica si estás obligado al acceder con tus datos.`,
  },
  {
    question: '¿Qué pasa si no presento la declaración estando obligado?',
    answer: `Si sale a pagar y no la presentas, la AEAT puede reclamarte la cuota con intereses de demora y una sanción de entre el 50 % y el 150 % de lo dejado de ingresar. Si la presentas tarde por tu cuenta, sin requerimiento, no hay sanción por esa cuota: se aplica un recargo del ${pct(RE.porcentajeBase)} más otro ${pct(RE.porcentajePorMes)} por cada mes completo de retraso, y del ${pct(RE.porcentajeMas12Meses)} pasados ${RE.mesesEscalaProporcional} meses, con intereses de demora desde entonces (art. 27.2 de la Ley General Tributaria). Si sale a devolver no hay cuota que recargar ni pierdes la devolución por presentarla tarde, pero la AEAT puede imponerte una multa fija de ${eur(MULTA.multaSinRequerimiento)} si la presentas fuera de plazo sin requerimiento, o de ${eur(MULTA.multaFija)} con él (art. 198). Hacienda tiene 4 años para reclamar (plazo de prescripción).`,
  },
  {
    question: '¿Puedo confirmar el borrador sin revisarlo?',
    answer: 'Técnicamente sí, pero no es recomendable. La AEAT solo incluye en el borrador los datos que conoce (salarios, retenciones, inmuebles por catastro). No incluye deducciones por plan de pensiones, donaciones, gastos de autónomos, mejoras de eficiencia energética o deducciones autonómicas. Confirmar el borrador sin revisarlo puede suponer pagar más de lo necesario.',
  },
  {
    question: '¿Sale mejor la declaración individual o conjunta?',
    answer: `Depende de los ingresos de cada miembro de la unidad familiar. La conjunta suele ser más ventajosa cuando uno de los cónyuges no tiene ingresos o son muy bajos, porque la base imponible se reduce en ${eur(RC.biparental)} en la unidad familiar del matrimonio no separado legalmente, con o sin hijos, y en ${eur(RC.monoparental)} en la monoparental, la de un progenitor con sus hijos, que no se aplica si convive con el otro progenitor (art. 84.2 de la Ley del IRPF). Si ambos trabajan con sueldos similares, suele salir mejor por separado. Renta Web permite simular las dos opciones antes de decidir.`,
  },
  {
    question: '¿Qué es el borrador y cómo se obtiene?',
    answer: 'Es el proyecto de declaración que la AEAT elabora con los datos que ya tiene de ti (nóminas, pensiones, inmuebles, ventas de fondos, etc.). Se obtiene en Renta Web, en la sede electrónica de la Agencia Tributaria, con Cl@ve, certificado electrónico, DNI electrónico o el número de referencia; para la Renta 2025 estuvo disponible desde el 8 de abril de 2026. Solo es un punto de partida: no incluye las deducciones ni los ingresos que no le hayan comunicado, así que hay que revisarlo y completarlo antes de confirmarlo.',
  },
  {
    question: '¿Cómo funciona la deducción por donaciones a ONGs?',
    answer: 'Los donativos a entidades acogidas a la Ley 49/2002 (Cruz Roja, UNICEF, Cáritas, etc.), incluidas las entidades de la Iglesia Católica, que la propia ley trata como beneficiarias del mecenazgo, tienen una deducción del 80 % sobre los primeros 250 € y del 40 % sobre el resto, que sube al 45 % si en los dos años anteriores donaste a la misma entidad, cada año al menos lo mismo que el anterior (art. 19 de la Ley 49/2002). Por ejemplo, 250 € a una ONG dan 200 € de deducción. La base de la deducción no puede superar el 10 % de la base liquidable.',
  },
  {
    question: '¿Puedo aplazar el pago si la declaración sale a pagar?',
    answer: `Sí. Puedes fraccionar el pago en dos plazos, sin intereses ni recargos: el ${pct(FR.primerPlazoPct)} al presentar la declaración y el ${pct(FR.segundoPlazoPct)} restante hasta el 5 de noviembre de 2026. Si quieres domiciliar el pago único o el primer plazo, el límite era el 25 de junio de 2026. También puedes solicitar un aplazamiento ordinario con intereses si necesitas más tiempo, aunque Hacienda no siempre lo concede.`,
  },
  {
    question: '¿Cómo tributan las indemnizaciones por despido?',
    answer: 'La indemnización mínima legal por despido improcedente está exenta de IRPF hasta los límites legales (45 días por año trabajado con máximo 42 mensualidades, para contratos anteriores a 2012; o 33 días con máximo 24 mensualidades para los posteriores). La parte que supere esos límites tributa íntegramente como rendimiento del trabajo. El finiquito (salario pendiente, vacaciones no disfrutadas) siempre tributa.',
  },
  {
    question: '¿Qué documentos necesito para hacer la declaración de la Renta?',
    answer: 'Los documentos básicos para cualquier perfil son el DNI o NIE, los datos bancarios de la cuenta donde quieres recibir la devolución o realizar el pago, y el número de referencia o Cl@ve PIN para acceder a Renta Web. Según tu situación, necesitarás además: el certificado de retenciones de tu empresa (asalariados), los libros de ingresos y gastos (autónomos), los estados de posición de cuentas e inversiones (inversores), o los contratos y recibos de alquiler (arrendadores).',
  },
  {
    question: '¿Qué deducciones puedo aplicarme en la Renta como asalariado?',
    answer: `Los trabajadores por cuenta ajena pueden aplicar, entre otras: la reducción por rendimientos del trabajo (hasta ${eur(REDUCCION_RENDIMIENTOS_TRABAJO_2025.reduccion1)} según nivel de ingresos), la deducción por inversión en vivienda habitual si adquirieron antes de 2013, la deducción por maternidad (hasta ${eur(DEDUCCION_MATERNIDAD_IRPF.importeAnualPorHijo)} por hijo menor de 3 años), las deducciones por familia numerosa o discapacidad, y las deducciones autonómicas variables según comunidad de residencia. Es recomendable revisar las deducciones disponibles en tu comunidad autónoma, ya que pueden suponer varios cientos de euros.`,
  },
  {
    question: '¿Qué documentos necesita un autónomo para hacer la Renta?',
    answer: 'Un trabajador autónomo en estimación directa debe reunir: el libro de facturas emitidas y recibidas, el libro de bienes de inversión si tiene inmovilizado amortizable, los justificantes de gastos deducibles (suministros, material, cuotas de autónomo, seguros profesionales, etc.), los modelos trimestrales presentados (130 o 131) y los certificados de retenciones si algún cliente le practicó retención. Si tributó en estimación objetiva (módulos), necesitará el resumen anual del modelo 131.',
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
