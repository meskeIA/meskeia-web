'use client';

import { useState, useMemo } from 'react';
import styles from './SimuladorBonoJovenAlquiler.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
  DataReference,
  ShareCard, RegionBadge
} from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber, parseSpanishNumberOr } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  BONO_ALQUILER_JOVEN_2026,
  UMBRAL_IPREM_VIVIENDA_JOVEN,
  FISCAL_VIVIENDA_JOVEN_META,
  IPREM_2026,
} from '@/data/fiscal';

/**
 * Las cuantías del Real Decreto son importes redondos y en la prosa se leen como tales:
 * «300 €/mes», no «300,00 €/mes». Lo que se CALCULA —la ayuda efectiva, el pago real, el
 * acumulado— sigue con `formatCurrency`, que es lo que pide la regla de formato. Aquí lo
 * que importa es que la cifra salga del módulo en vez de estar tecleada (hallazgo 444).
 */
const eur = (n: number) => `${formatNumber(n, 0)} €`;

/** Porcentaje con un decimal como mucho: «50», «37,5», «57,1». Redondea antes de formatear
 *  para que un 60,000000000000004 de la aritmética en coma flotante se lea «60». */
const pct = (n: number) => {
  const redondeado = Math.round(n * 10) / 10;
  return formatNumber(redondeado, Number.isInteger(redondeado) ? 0 : 1);
};

/**
 * La cifra y su «%» separados por un espacio DURO (U+00A0), como pide la Ortografía de la RAE
 * (2010) y la regla de formato del proyecto desde el 25/09/2026: «60 %», no «60%», y que el
 * signo no salte solo a la línea siguiente (hallazgo 2393). `formatPercentage` hace lo mismo,
 * pero con decimales fijos; aquí hacen falta los variables de `pct`.
 */
const conPorcentaje = (cifra: string) => `${cifra}\u00A0%`;

// Los datos de los requisitos salen del módulo sellado contra el BOE, como las cuantías:
// tecleados en la prosa, un cambio del RD dejaría la tarjeta contradiciendo a su propia
// pregunta (hallazgo 2394, la forma de los 596 y 645).
const EDAD_MAX = BONO_ALQUILER_JOVEN_2026.edad.maxima;
const EXCLUSIONES = BONO_ALQUILER_JOVEN_2026.exclusiones;
const CONTRATO = BONO_ALQUILER_JOVEN_2026.contrato;
const CAMBIO_DOMICILIO = BONO_ALQUILER_JOVEN_2026.cambioDomicilio;

/** El umbral de renta se computa sobre 14 pagas (IPREM_2026.anual14), la referencia que
 *  el propio módulo fiscal declara para cálculo de topes (hallazgo 536). */
const topeIngresos = (veces: number) => eur(IPREM_2026.anual14 * veces);

/** Una ayuda se abona en céntimos: el redondeo pertenece a la cuantía mensual (hallazgo 688) */
const redondearCentimos = (n: number): number => Math.round(n * 100) / 100;

interface Requisito {
  id: string;
  pregunta: string;
  explicacion: string;
  bloqueante: boolean;
}

const REQUISITOS: Requisito[] = [
  {
    id: 'edad',
    pregunta: `Tienes entre ${BONO_ALQUILER_JOVEN_2026.edad.minima} y ${EDAD_MAX} años (inclusive) al solicitar la ayuda`,
    // Sale de `edad.maxima`, como la pregunta de encima: tecleada, un cambio del RD dejaba
    // la tarjeta diciendo una edad y su pregunta otra (hallazgo 2394).
    explicacion: `El art. 133.1.b del RD 326/2026 exige tener ${EDAD_MAX} años o menos, incluida esa edad, en el momento de solicitar la ayuda, y el art. 133.1, ser mayor de edad.`,
    bloqueante: true,
  },
  {
    id: 'ingresos',
    pregunta: `Tus rentas anuales no superan ${formatNumber(UMBRAL_IPREM_VIVIENDA_JOVEN.general, 0)} veces el IPREM (${topeIngresos(UMBRAL_IPREM_VIVIENDA_JOVEN.general)}/año)`,
    explicacion: `El RD 326/2026 fija el umbral en ${formatNumber(UMBRAL_IPREM_VIVIENDA_JOVEN.general, 0)} veces el IPREM (${topeIngresos(UMBRAL_IPREM_VIVIENDA_JOVEN.general)}/año), que sube a ${formatNumber(UMBRAL_IPREM_VIVIENDA_JOVEN.discapacidad33, 1)} (${topeIngresos(UMBRAL_IPREM_VIVIENDA_JOVEN.discapacidad33)}/año) con una discapacidad reconocida del ${conPorcentaje('33')} o más (y si eres hijo o hija de víctima de violencia de género) y a ${formatNumber(UMBRAL_IPREM_VIVIENDA_JOVEN.discapacidad65, 0)} (${topeIngresos(UMBRAL_IPREM_VIVIENDA_JOVEN.discapacidad65)}/año) con una discapacidad del ${conPorcentaje('65')} o más. Cada Comunidad Autónoma concreta el cómputo en su convocatoria.`,
    bloqueante: true,
  },
  /**
   * ⚠️ 28/09/2026 (hallazgo 2391) — la tarjeta decía a secas «No puedes ser titular de un
   * derecho de propiedad o usufructo sobre ninguna vivienda en España», y el art. 133.2.a
   * exceptúa a quien acredite que no puede disponer de ella por separación o divorcio, que no
   * puede habitarla por otra causa ajena a su voluntad o que le resulta inaccesible por
   * discapacidad. Un copropietario que tras su divorcio no puede usar su vivienda respondía
   * «No» con honestidad y recibía «No cumples los requisitos obligatorios»: rechazo de más,
   * el sentido del 1168. La excepción va en la PREGUNTA, que es lo que se contesta, y no solo
   * en la explicación.
   */
  {
    id: 'propietario',
    pregunta: 'No eres propietario ni usufructuario de ninguna vivienda en España (salvo las excepciones de abajo)',
    explicacion: `El art. 133.2.a del RD 326/2026 excluye a quien sea propietario o usufructuario de alguna vivienda en España, salvo que acredite que no puede disponer de ella por separación o divorcio, que no puede habitarla por otra causa ajena a su voluntad o que le resulta inaccesible por una discapacidad reconocida del ${conPorcentaje(formatNumber(EXCLUSIONES.propiedad.discapacidadMinimaInaccesible, 0))} o más. Si estás en una de esas excepciones, responde «Sí»: tendrás que acreditarla ante tu comunidad autónoma.`,
    bloqueante: true,
  },
  {
    id: 'habitual',
    pregunta: 'La vivienda es tu residencia habitual y permanente',
    explicacion: 'Debes destinar la vivienda alquilada a tu domicilio habitual y permanente.',
    bloqueante: true,
  },
  /**
   * La incompatibilidad del art. 136 tiene que llegar al VEREDICTO, no solo a la prosa.
   *
   * `BONO_ALQUILER_JOVEN_2026.compatibleConOtrasAyudasAlquiler` está sellado en `false` desde
   * que se creó el módulo y no lo leía NADIE en todo el repositorio. La regla se contaba en
   * tres canales —la FAQ visible, el faqJsonLd y el consejo de la deducción autonómica—, y
   * los tres viven dentro del `<EducationalSection>` colapsado o en el JSON-LD: con la guía
   * sin desplegar, la página no contenía «incompatible», ni «art. 136», ni «otra ayuda».
   * Así que a quien ya cobraba una ayuda autonómica al alquiler se le respondía «🎉 ¡Cumples
   * todos los requisitos!» sin una sola mención de lo que le excluye (hallazgo 686).
   *
   * Va como BLOQUEANTE porque el art. 136 no admite matiz —es incompatibilidad, no
   * preferencia—, y además el CLAUDE.md del proyecto prohíbe expresamente esconder una
   * advertencia legal dentro de `<EducationalSection>`.
   */
  /*
   * ⚠️ 28/09/2026 — el art. 136 tiene un segundo párrafo que la tarjeta callaba: «No se
   * considerarán afectados por esta incompatibilidad los supuestos excepcionales» en que una
   * administración, una ONG o una asociación dé una ayuda para la misma finalidad a víctimas de
   * violencia de género, de trata o de violencia sexual, a familias monoparentales o
   * monomarentales, a personas desahuciadas, en chabolismo, infravivienda o emergencia
   * habitacional, sin hogar u otras especialmente vulnerables. Sin él, quien está en esos
   * supuestos respondía «No» y la app le rechazaba: la forma del 2391 (una excepción del RD
   * que no llega a la pregunta que bloquea).
   */
  {
    id: 'sinOtrasAyudas',
    pregunta: 'No cobras ninguna otra ayuda al pago del alquiler (salvo las excepciones de abajo)',
    explicacion: `El art. 136 del RD 326/2026 declara el Bono Joven ${BONO_ALQUILER_JOVEN_2026.compatibleConOtrasAyudasAlquiler ? 'compatible' : 'INCOMPATIBLE'} con cualquier otra ayuda al pago del alquiler o de la cesión de uso de la vivienda, venga del Estado, de tu Comunidad Autónoma, de tu ayuntamiento o de otra entidad pública. La excepción son las ayudas para esa misma finalidad que una administración, una ONG o una asociación den a víctimas de violencia de género, de trata o de violencia sexual, a familias monoparentales o monomarentales, a personas desahuciadas de su vivienda habitual, en chabolismo, infravivienda o emergencia habitacional, sin hogar u otras especialmente vulnerables: si la tuya es de ese tipo, responde «Sí».`,
    bloqueante: true,
  },
  /**
   * ⚠️ 15/09/2026 (hallazgo 852) — pasa a BLOQUEANTE. El art. 133.1.e del RD lo exige, y así
   * lo cuentan la tarjeta («debe estar formalizado por escrito y depositada la fianza») y el
   * faqJsonLd («el RD no fija ninguna condición sobre el propietario: SOLO EXIGE que el
   * contrato esté formalizado por escrito y con la fianza depositada»), pero en el veredicto
   * iba con `bloqueante: false` y sin distintivo IMPRESCINDIBLE: a quien respondía «No» se le
   * decía «Cumples los requisitos obligatorios» y se le pintaba el panel entero con su ayuda
   * mensual. Es la forma exacta del hallazgo 686 (art. 136), reparado el 10/09, y el sentido
   * del error vuelve a ser el malo para un dictamen de elegibilidad. La pregunta contempla el
   * futuro («o lo estará»), así que un «No» significa que no lo estará.
   *
   * ⚠️ 21/09/2026 (hallazgo 1168) — la PREGUNTA no se ajustó cuando el requisito pasó a
   * bloquear, y preguntaba por el REGISTRO del contrato, que la propia explicación presenta
   * como un añadido de cada comunidad autónoma. Quien tiene su contrato por escrito y la
   * fianza depositada —es decir, quien cumple el art. 133.1.e— pero no lo tiene registrado
   * respondía «No» con honestidad y recibía «No cumples los requisitos obligatorios», sin
   * panel ni matiz. Es el defecto simétrico del 852: aquel aprobaba de más y este rechazaba
   * de más, y en un dictamen de elegibilidad los dos sentidos del error importan. La pregunta
   * pasa a ser la del artículo por el que se bloquea; el depósito o registro autonómico se
   * dice donde corresponde, como lo que es: algo que puede pedir tu comunidad y que este
   * simulador no comprueba.
   *
   * ⚠️ 28/09/2026 (hallazgo 2390) — y aquella pregunta tampoco era la del artículo, porque la
   * atribución de partida estaba mal: en el BOE el art. 133.1.e es SOLO el tope de renta (lo
   * que el propio módulo le atribuye en `rentaMaximaMensual`), y el contrato es el art.
   * 133.1.a, que no menciona la fianza en ninguna de sus letras y que para la HABITACIÓN
   * dispensa expresamente la forma de la Ley 29/1994. Así, quien alquila una habitación sin
   * fianza depositada respondía «No» y recibía «No cumples los requisitos obligatorios» por una
   * exigencia que el RD no hace. La pregunta es ahora la del art. 133.1.a —tener contrato de
   * alquiler o de cesión, o estar en condiciones de firmarlo—, y la fianza y el registro pasan
   * a ser lo que son: requisitos que la comunidad autónoma PUEDE añadir (art. 8.1).
   */
  {
    id: 'contrato',
    pregunta: 'Tienes contrato de alquiler o de cesión de uso como inquilino (o lo firmarás si te conceden la ayuda)',
    explicacion: `El art. 133.1.a del RD 326/2026 exige ser titular de un contrato de alquiler o de cesión de uso de la vivienda o la habitación, o estar en condiciones de firmarlo: en ese caso hay que firmarlo en el plazo máximo de ${CONTRATO.mesesParaFirmarTrasConcesion} meses desde que te notifiquen la concesión. Para una vivienda completa, el contrato ${CONTRATO.viviendaEnTerminosLAU ? 'ha de estar formalizado conforme a' : 'no necesita seguir la forma de'} la Ley 29/1994, de Arrendamientos Urbanos; para una habitación, el RD ${CONTRATO.habitacionEnTerminosLAU ? 'también exige' : 'no exige'} esa forma. El RD no pide que la fianza esté depositada ni el contrato registrado, pero tu comunidad autónoma puede añadirlo en su convocatoria (art. 8.1), y este simulador no lo verifica.`,
    bloqueante: true,
  },
  /**
   * ⚠️ 28/09/2026 (hallazgo 2388, ALTO) — las exclusiones del art. 133.2.b y c no llegaban al
   * veredicto. «No podrá concederse la ayuda cuando […] la persona arrendataria o cesionaria
   * tenga parentesco en primer o segundo grado de consanguinidad o de afinidad con la persona
   * arrendadora o cedente» (b), ni cuando sea socia o partícipe del arrendador (c). Ninguno de
   * los requisitos lo preguntaba, así que quien alquila el piso de su padre o de su hermana
   * respondía «Sí» a todo con honestidad y recibía «¡Cumples todos los requisitos!». Es la
   * forma del hallazgo 686 (art. 136): una exclusión del RD que solo contaba la prosa.
   *
   * Va como BLOQUEANTE y no como aviso en el veredicto porque el RD no la matiza: «no podrá
   * concederse». Un aviso junto a «¡Cumples todos los requisitos!» seguiría aprobando de más.
   */
  {
    id: 'arrendador',
    pregunta: `Quien te alquila no es familiar tuyo hasta el ${EXCLUSIONES.parentescoArrendadorHastaGrado}.º grado ni una persona o empresa de la que seas socio`,
    explicacion: `El art. 133.2.b del RD 326/2026 impide conceder la ayuda si tienes parentesco hasta el ${EXCLUSIONES.parentescoArrendadorHastaGrado}.º grado, por consanguinidad o por afinidad, con quien te alquila o te cede la vivienda (por ejemplo, padres, hijos, hermanos, abuelos o nietos, y suegros, yernos, nueras o cuñados). El art. 133.2.c la impide también si eres socio o partícipe de la persona o la empresa arrendadora, salvo que sea una cooperativa sin ánimo de lucro en régimen de cesión de uso.`,
    bloqueante: true,
  },
  /**
   * 28/09/2026 — el art. 8.2.a, común a todas las ayudas del Plan, exige nacionalidad española,
   * de la UE, del EEE o Suiza, o residencia legal en España. Tampoco lo preguntaba nadie, y es
   * la misma forma del 2388: una condición del RD que no llegaba al veredicto.
   */
  {
    id: 'nacionalidad',
    pregunta: 'Tienes nacionalidad española o de otro país de la UE, del EEE o Suiza, o residencia legal en España',
    explicacion: 'El art. 8.2.a del RD 326/2026, común a todas las ayudas del Plan, exige la nacionalidad española o la de un Estado de la Unión Europea, del Espacio Económico Europeo o Suiza (o el parentesco con sus nacionales que prevea la normativa aplicable). Con otra nacionalidad, hace falta residencia legal en España.',
    bloqueante: true,
  },
  // El requisito de renta NO se pregunta: la app tiene el importe tecleado y el límite del
  // RD, así que lo comprueba ella (art. 133.1.e). Preguntarlo era pedirle al usuario que
  // respondiera algo que el simulador sabe, y además con los topes del plan anterior.
  {
    id: 'comunidad',
    pregunta: 'Tu Comunidad Autónoma tiene el Bono Joven activo',
    explicacion: 'La gestión y disponibilidad del Bono Joven depende de cada Comunidad Autónoma, que recibe los fondos del Estado y los tramita.',
    bloqueante: false,
  },
];

type EstadoRequisito = 'si' | 'no' | 'pendiente';
type TipoVivienda = 'vivienda' | 'habitacion';

// Todo lo normativo sale de data/fiscal/vivienda-joven.ts, sellado contra el BOE.
const BONO: Record<TipoVivienda, number> = BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual;
const DURACION_MAX_MESES = BONO_ALQUILER_JOVEN_2026.plazo.totalMaximoMeses; // 2 + prórroga de 2
const LIMITE_SOBRE_RENTA = BONO_ALQUILER_JOVEN_2026.limiteSobreRenta;
const RENTA_MAX = BONO_ALQUILER_JOVEN_2026.rentaMaximaMensual;
/** «60 %», con el espacio duro ya puesto (hallazgo 2393) */
const LIMITE_PORC = conPorcentaje(pct(LIMITE_SOBRE_RENTA * 100));
const DURACION_MAX_ANIOS = DURACION_MAX_MESES / 12;

interface EscenarioCalculado {
  /** Renta mensual del ejemplo, en euros (es el dato del caso, no una cifra normativa) */
  renta: number;
  /** Ayuda efectiva: el MENOR entre la cuantía del art. 137 y el 60 % de la renta */
  ayuda: number;
  /** Lo que paga de su bolsillo */
  pagoReal: number;
  /** Acumulado si cobra la ayuda el plazo completo del art. 134 */
  acumulado: number;
  /** Porcentaje de la renta que cubre la ayuda, y su relación con el tope del art. 137 */
  notaLimite: string;
}

/**
 * Los casos prácticos del bloque educativo se calculan con la MISMA aritmética que el
 * simulador de arriba, en vez de llevar el porcentaje y el veredicto tecleados (hallazgo 645).
 * No basta con interpolar el importe: si la cuantía del art. 137 subiera, «el 50 %, por debajo
 * del límite» pasaría a ser falso por partida doble —el porcentaje y la afirmación sobre el
 * tope—, y la prosa contradiría al calculador de la misma página.
 */
const calcularEscenario = (renta: number, tipo: TipoVivienda): EscenarioCalculado => {
  const cuantiaMaxima = BONO[tipo];
  const porElLimite = renta * LIMITE_SOBRE_RENTA;
  // Misma regla que en el simulador de arriba: se redondea la cuantía MENSUAL, y el
  // acumulado se calcula sobre ella (hallazgo 688).
  const ayuda = redondearCentimos(Math.min(cuantiaMaxima, porElLimite));
  const porcentaje = conPorcentaje(pct((ayuda / renta) * 100));
  return {
    renta,
    ayuda,
    pagoReal: renta - ayuda,
    acumulado: ayuda * DURACION_MAX_MESES,
    notaLimite:
      porElLimite < cuantiaMaxima
        ? `el ${porcentaje} de la renta, que es el máximo que permite el art. 137`
        : porElLimite === cuantiaMaxima
          ? `el ${porcentaje} de la renta, justo en el límite del art. 137`
          : `el ${porcentaje} de la renta, por debajo del límite del ${LIMITE_PORC}`,
  };
};

/** Rentas de ejemplo de los casos prácticos; todo lo demás lo deriva el cálculo de arriba */
const ESCENARIO_GRADUADA = calcularEscenario(600, 'vivienda');
const ESCENARIO_TRABAJADOR = calcularEscenario(800, 'vivienda');
const ESCENARIO_HABITACION = calcularEscenario(350, 'habitacion');

export default function SimuladorBonoJovenAlquilerPage() {
  const [alquilMensual, setAlquilMensual] = useState('');
  const [tipoVivienda, setTipoVivienda] = useState<TipoVivienda>('vivienda');
  const [municipioPequeno, setMunicipioPequeno] = useState(false);
  const [estados, setEstados] = useState<Record<string, EstadoRequisito>>(
    Object.fromEntries(REQUISITOS.map(r => [r.id, 'pendiente']))
  );

  const toggleEstado = (id: string, valor: EstadoRequisito) => {
    setEstados(prev => ({ ...prev, [id]: prev[id] === valor ? 'pendiente' : valor }));
  };

  // `parseSpanishNumberOr` y no el parseo casero de antes, que convertía la coma en punto y
  // se lo daba a parseFloat: así «1.500» se leía 1,5 —el punto del millar español pasaba a
  // decimal— y con ello la app CONCEDÍA la ayuda a quien cobra por encima del tope del
  // art. 133.1.e sin ningún aviso, porque 1,50 € queda muy por debajo de los 1.000 €. El
  // navegador además normaliza la coma del teclado español al punto, así que tecleando
  // «1,500» ocurría lo mismo. Es justo el patrón que persigue `npm run check:parser`
  // (hallazgo 440).
  const alquilerCrudo = parseSpanishNumber(alquilMensual);
  /** Un negativo tecleado no es un campo vacío: hay que avisar, no pedir rellenarlo de nuevo (hallazgo 538) */
  const alquilerNegativo = Number.isFinite(alquilerCrudo) && alquilerCrudo < 0;
  /**
   * ⚠️ 21/09/2026 (hallazgo 1170) — y un texto ILEGIBLE tampoco es un campo vacío.
   * `parseSpanishNumberOr` devuelve su 0 por defecto en todo lo que `parseSpanishNumber`
   * RECHAZA («mil euros», «1e3», «12abc»), así que el dato ilegible y el campo en blanco
   * eran indistinguibles para el motor y nada lo decía en pantalla: el veredicto pedía
   * «Introdúcela aquí arriba» a quien la ve escrita en el campo. La asimetría era del
   * propio código —el negativo SÍ se detectaba aparte y marcaba `aria-invalid`—, no de
   * la norma.
   */
  const alquilerIlegible = alquilMensual.trim() !== '' && !Number.isFinite(alquilerCrudo);
  /**
   * 28/09/2026 (sospecha del acta del Inspector, confirmada) — el tercer caso de la misma
   * familia: un «0» o «0,00» TECLEADO se leía como campo vacío, sin `aria-invalid`, y el
   * veredicto pedía «Introdúcela aquí arriba» a quien la tiene escrita. Una renta de 0 € no
   * es un alquiler sobre el que calcular el 60 % del art. 137: se señala como dato no válido.
   */
  const alquilerCero = alquilMensual.trim() !== '' && alquilerCrudo === 0;
  const alquilerInvalido = alquilerNegativo || alquilerIlegible || alquilerCero;
  const alquilerNum = Math.max(0, parseSpanishNumberOr(alquilMensual));
  const bonificacionMaxima = BONO[tipoVivienda];
  // El bono no puede superar el 60% de la renta mensual (RD 326/2026, art. 137)
  // El redondeo al céntimo pertenece a la CUANTÍA MENSUAL, no al total: una ayuda se abona
  // en céntimos, y el 60 % del art. 137 puede dar fracciones de céntimo (con 333,33 €/mes de
  // renta salen 199,998 €). La app publicaba el mensual redondeado y multiplicaba por 48 el
  // valor SIN redondear, así que las dos cifras que enseña una al lado de la otra no se
  // multiplicaban: «200,00 €» y «9599,90 €» en vez de 9.600,00 € (hallazgo 688).
  const bonificacionEfectiva = redondearCentimos(
    alquilerNum > 0
      ? Math.min(bonificacionMaxima, alquilerNum * LIMITE_SOBRE_RENTA)
      : bonificacionMaxima,
  );
  // El acumulado se calcula sobre la ayuda EFECTIVA: con el tope del 60% mordiendo, el
  // total del programa es un número que este caso concreto no puede llegar a cobrar.
  const totalAyudaMax = bonificacionEfectiva * DURACION_MAX_MESES;
  const alquilerConBono = Math.max(0, alquilerNum - bonificacionEfectiva);

  /** Renta máxima del contrato para poder acceder a la ayuda (art. 133.1.e) */
  const rentaMaxima = municipioPequeno
    ? RENTA_MAX.municipioPequeno[tipoVivienda]
    : RENTA_MAX[tipoVivienda];
  /** `null` mientras no haya renta tecleada: no se puede juzgar lo que no se sabe */
  const rentaDentroDelLimite = alquilerNum > 0 ? alquilerNum <= rentaMaxima : null;

  const resultado = useMemo(() => {
    const bloqueantes = REQUISITOS.filter(r => r.bloqueante);
    const algunBloqueanteFalla = bloqueantes.some(r => estados[r.id] === 'no');
    const algunBloqueantePendiente = bloqueantes.some(r => estados[r.id] === 'pendiente');
    const todosConfirmados = REQUISITOS.every(r => estados[r.id] === 'si');
    const algunNoRecomendado = REQUISITOS.filter(r => !r.bloqueante).some(r => estados[r.id] === 'no');

    // La renta por encima del tope excluye igual que cualquier requisito imprescindible:
    // es una condición del propio RD, no un aspecto que la CA pueda matizar.
    if (rentaDentroDelLimite === false) return 'no-apto';
    if (algunBloqueanteFalla) return 'no-apto';
    if (todosConfirmados && !algunNoRecomendado && rentaDentroDelLimite === true) return 'apto';
    if (!algunBloqueantePendiente && !algunBloqueanteFalla) return 'casi';
    return 'pendiente';
  }, [estados, rentaDentroDelLimite]);

  const iconoEstado = (estado: EstadoRequisito) => {
    if (estado === 'si') return '✅';
    if (estado === 'no') return '❌';
    return '⬜';
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">🏠</div>
        <h1 className={styles.title}>Simulador Bono Joven Alquiler</h1>
        <p className={styles.subtitle}>
          Comprueba si puedes recibir hasta {eur(BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.vivienda)}/mes
          (vivienda) o {eur(BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.habitacion)}/mes (habitación) durante
          hasta {BONO_ALQUILER_JOVEN_2026.plazo.totalMaximoMeses / 12} años
        </p>
        <p className={styles.heroLaw}>Real Decreto 326/2026, de 22 de abril · Plan Estatal de Vivienda 2026-2030</p>
      </header>

      <RegionBadge variant="es-only" />


      <LegalNotice />

      <DisclaimerCard
        variant="financial"
        severity="critical"
        collapsible={false}
        context="Bono Joven al Alquiler 2026-2030 (RD 326/2026): las cuantías son orientativas. Los requisitos concretos, límite de ingresos y condiciones específicas los fija cada Comunidad Autónoma en su convocatoria. Consulta siempre con tu CA antes de tomar decisiones económicas."
      />

      <DataReference
        normativa="Plan Estatal de Vivienda 2026-2030 · ayuda al alquiler joven"
        fuente={FISCAL_VIVIENDA_JOVEN_META.fuente}
        verificado={FISCAL_VIVIENDA_JOVEN_META.verificado}
        urlOficial={FISCAL_VIVIENDA_JOVEN_META.urlOficial}
      />

      {/* Sección de tu alquiler */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><span aria-hidden="true">💶</span> Tu alquiler actual</h2>

        <div className={styles.field}>
          <span className={styles.label}>¿Alquilas una vivienda completa o una habitación?</span>
          <div className={styles.tipoSelector}>
            <button
              className={`${styles.tipoBtn} ${tipoVivienda === 'vivienda' ? styles.tipoBtnActivo : ''}`}
              type="button"
              onClick={() => setTipoVivienda('vivienda')}
              aria-pressed={tipoVivienda === 'vivienda'}
            >
              <span aria-hidden="true">🏠</span> Vivienda completa{' '}
              <span className={styles.tipoBono}>hasta {eur(BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.vivienda)}/mes</span>
            </button>
            <button
              className={`${styles.tipoBtn} ${tipoVivienda === 'habitacion' ? styles.tipoBtnActivo : ''}`}
              type="button"
              onClick={() => setTipoVivienda('habitacion')}
              aria-pressed={tipoVivienda === 'habitacion'}
            >
              <span aria-hidden="true">🛏️</span> Habitación (piso compartido){' '}
              <span className={styles.tipoBono}>hasta {eur(BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.habitacion)}/mes</span>
            </button>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="alquiler">Renta mensual del alquiler</label>
          <div className={styles.inputEuro}>
            <span aria-hidden="true">€</span>
            <input
              id="alquiler"
              type="text"
              inputMode="decimal"
              min={0}
              step={10}
              value={alquilMensual}
              onChange={e => setAlquilMensual(e.target.value)}
              placeholder="550"
              aria-label="Renta mensual en euros"
              aria-invalid={alquilerInvalido}
              aria-describedby={alquilerInvalido ? 'alquiler-error' : undefined}
            />
            <span>/mes</span>
          </div>
          {alquilerInvalido ? (
            <p className={styles.errorText} id="alquiler-error" role="alert">
              {alquilerNegativo
                ? 'La renta no puede ser un importe negativo.'
                : alquilerCero
                  ? 'La renta tiene que ser mayor que 0 €: escribe lo que pagas (o pagarás) cada mes.'
                  : `«${alquilMensual.trim()}» no es un importe válido: escribe solo la cifra, con coma para los decimales (por ejemplo, 550 o 1.250,50).`}
            </p>
          ) : (
            <span className={styles.helperText}>Introduce lo que pagas actualmente o lo que pagarás</span>
          )}
        </div>

        <div className={styles.field}>
          <button
            type="button"
            className={`${styles.tipoBtn} ${municipioPequeno ? styles.tipoBtnActivo : ''}`}
            onClick={() => setMunicipioPequeno(v => !v)}
            aria-pressed={municipioPequeno}
          >
            <span aria-hidden="true">🏘️</span> El municipio tiene 10.000 habitantes o menos
            <span className={styles.tipoBono}>renta máxima {formatCurrency(RENTA_MAX.municipioPequeno[tipoVivienda])}/mes</span>
          </button>
          <span className={styles.helperText}>
            En municipios y núcleos pequeños el Real Decreto rebaja la renta máxima que da derecho a la ayuda.
          </span>
        </div>

        {rentaDentroDelLimite === false && (
          <div className={styles.avisoRenta} role="alert">
            <span aria-hidden="true">⚠️</span>{' '}
            <strong>La renta supera el máximo que da derecho a la ayuda.</strong> Para{' '}
            {tipoVivienda === 'vivienda' ? 'una vivienda completa' : 'una habitación'}
            {municipioPequeno ? ' en un municipio de 10.000 habitantes o menos' : ''} el tope es{' '}
            {formatCurrency(rentaMaxima)}/mes (RD 326/2026, art. 133.1.e) y has introducido{' '}
            {formatCurrency(alquilerNum)}/mes. Tu comunidad autónoma puede elevar ese máximo, pero
            solo con acuerdo previo del Ministerio: compruébalo en su convocatoria.
          </div>
        )}

        {alquilerNum > 0 && resultado !== 'no-apto' && (
          <div className={styles.ahorroPanel}>
            <div className={styles.ahorroCard}>
              <span className={styles.ahorroValor}>{formatCurrency(bonificacionEfectiva)}</span>
              <span className={styles.ahorroLabel}>Ayuda mensual</span>
              {bonificacionEfectiva < bonificacionMaxima && (
                <span className={styles.ahorroNota}>Límite: {LIMITE_PORC} de la renta</span>
              )}
            </div>
            <div className={styles.ahorroCard}>
              <span className={styles.ahorroValor}>{formatCurrency(alquilerConBono)}</span>
              <span className={styles.ahorroLabel}>Tu pago real</span>
            </div>
            <div className={styles.ahorroCard}>
              <span className={styles.ahorroValor}>{formatCurrency(totalAyudaMax)}</span>
              {/* La etiqueta sale del mismo plazo del art. 134 que multiplica la cifra de al
                  lado: tecleada, un cambio del módulo dejaría el rótulo mintiendo (hallazgo 645) */}
              <span className={styles.ahorroLabel}>Máximo en {DURACION_MAX_ANIOS} años</span>
            </div>
          </div>
        )}
      </section>

      {/* Checklist de requisitos */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><span aria-hidden="true">✅</span> Comprueba tus requisitos</h2>

        <div className={styles.checkGrid} role="list">
          {REQUISITOS.map(req => {
            const estado = estados[req.id];
            return (
              <div
                key={req.id}
                className={`${styles.checkCard} ${estado === 'si' ? styles.checkCardOk : estado === 'no' ? styles.checkCardFail : ''}`}
                role="listitem"
              >
                <span className={styles.checkEstado} aria-hidden="true">{iconoEstado(estado)}</span>
                <div className={styles.checkInfo}>
                  <p className={styles.checkPregunta}>{req.pregunta}</p>
                  <p className={styles.checkExplicacion}>{req.explicacion}</p>
                </div>
                {req.bloqueante && (
                  <span className={styles.badgeImprescindible} aria-label="Requisito imprescindible">IMPRESCINDIBLE</span>
                )}
                <div className={styles.radioGroup} role="group" aria-label={`Respuesta para: ${req.pregunta}`}>
                  <button
                    type="button"
                    className={`${styles.radioBtn} ${estado === 'si' ? styles.radioBtnActive : ''}`}
                    onClick={() => toggleEstado(req.id, 'si')}
                    aria-pressed={estado === 'si'}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    className={`${styles.radioBtn} ${estado === 'no' ? styles.radioBtnActive : ''}`}
                    onClick={() => toggleEstado(req.id, 'no')}
                    aria-pressed={estado === 'no'}
                  >
                    No
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Resultado */}
      {resultado !== 'pendiente' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}><span aria-hidden="true">📊</span> Tu resultado</h2>
          {resultado === 'apto' && (
            <div className={`${styles.resultadoCard} ${styles['resultado-apto']}`} role="status" aria-live="polite" aria-atomic="true">
              <div className={styles.resultadoIcon} aria-hidden="true">🎉</div>
              <h3 className={styles.resultadoTitulo}>¡Cumples todos los requisitos!</h3>
              <p className={styles.resultadoTexto}>
                En principio puedes solicitar el Bono Joven al Alquiler y recibir hasta <strong>{formatCurrency(bonificacionEfectiva)}/mes durante hasta {BONO_ALQUILER_JOVEN_2026.plazo.totalMaximoMeses / 12} años</strong> ({BONO_ALQUILER_JOVEN_2026.plazo.inicialMeses / 12} años prorrogables otros {BONO_ALQUILER_JOVEN_2026.plazo.prorrogaMaximaMeses / 12}, art. 134 RD 326/2026).
                El siguiente paso es contactar con la oficina de vivienda de tu Comunidad Autónoma para tramitar la solicitud.
              </p>
            </div>
          )}
          {resultado === 'casi' && (
            <div className={`${styles.resultadoCard} ${styles['resultado-casi']}`} role="status" aria-live="polite" aria-atomic="true">
              <div className={styles.resultadoIcon} aria-hidden="true">⚠️</div>
              {/*
                ⚠️ 15/09/2026 (hallazgo 853) — el párrafo afirmaba «Cumples los requisitos
                obligatorios» y dos frases después reconocía que faltaba la renta, que es una
                condición OBLIGATORIA del art. 133.1.e —por la que esta misma app rechaza de
                plano, antes incluso de mirar la checklist— y no un «aspecto adicional». Las dos
                frases se contradecían dentro del mismo párrafo y el sentido del error era el
                optimista. Ahora el veredicto solo afirma el cumplimiento cuando la renta está
                comprobada; mientras falte, dice qué falta.
              */}
              <h3 className={styles.resultadoTitulo}>
                {rentaDentroDelLimite === true ? 'Cumples los requisitos básicos' : 'Falta un dato para poder juzgarlo'}
              </h3>
              <p className={styles.resultadoTexto}>
                {rentaDentroDelLimite === true ? (
                  <>
                    Cumples los requisitos obligatorios que se pueden comprobar aquí, incluida la renta,
                    aunque algunos aspectos adicionales (documentación completa, disponibilidad de fondos
                    en tu CA) pueden condicionar la aprobación final.
                  </>
                ) : (
                  <>
                    De momento no fallas ninguno de los requisitos que has respondido, pero todavía no se
                    puede decir que cumplas los obligatorios: falta la renta, que el art. 133.1.e impone
                    igual que los demás.{' '}
                    {alquilerInvalido
                      ? 'La que has introducido no es válida: corrígela aquí arriba.'
                      : 'Introdúcela aquí arriba para comprobarla contra su tope.'}
                  </>
                )}{' '}
                Consulta con tu Comunidad Autónoma.
              </p>
              {/* «Los fondos y plazos varían cada año» contradecía el art. 138, que es el mismo
                  texto que corrige el hallazgo 2396 en el paso 1 del proceso de solicitud */}
              {estados.comunidad === 'no' && (
                <p className={styles.resultadoTexto}>
                  <strong>Tu Comunidad Autónoma no tiene el Bono Joven activo ahora mismo</strong>: aunque
                  cumplas el resto de requisitos, hoy no puedes solicitarlo hasta que abra su convocatoria.
                  El art. 138 del RD 326/2026 obliga a las comunidades autónomas a convocar esta ayuda
                  de forma continuada y permanente, así que vuelve a comprobarlo más adelante.
                </p>
              )}
            </div>
          )}
          {resultado === 'no-apto' && (
            <div className={`${styles.resultadoCard} ${styles['resultado-no-apto']}`} role="status" aria-live="polite" aria-atomic="true">
              <div className={styles.resultadoIcon} aria-hidden="true">❌</div>
              <h3 className={styles.resultadoTitulo}>No cumples los requisitos obligatorios</h3>
              {/*
                ⚠️ 15/09/2026 (hallazgo 854) — las dos causas SE SUMAN, no se sustituyen. La rama
                de la renta reemplazaba al mensaje genérico, así que quien fallaba a la vez por
                renta y por un requisito imprescindible leía solo lo primero y concluía que
                mudándose a un piso más barato tendría derecho, cuando el otro requisito lo
                excluye igual. El veredicto era correcto; lo que inducía a error era la acción
                que sugería.
              */}
              <p className={styles.resultadoTexto}>
                {rentaDentroDelLimite === false && (
                  <>
                    La renta que has introducido ({formatCurrency(alquilerNum)}/mes) supera el máximo
                    de {formatCurrency(rentaMaxima)}/mes que da derecho a esta ayuda.{' '}
                  </>
                )}
                {/*
                  ⚠️ 21/09/2026 (hallazgo 1169) — la coletilla «así que una renta más baja no
                  bastaría por sí sola» se añadió para el caso de DOS causas y se imprimía
                  SIEMPRE que fallaba un bloqueante: también con la renta dentro del tope, y
                  también con el campo vacío, hablando entonces de rebajar un importe que el
                  usuario no había introducido. Es el error del 854 al revés —aquel callaba una
                  causa real y este sugería una que no existe—, y en los dos casos lo que falla
                  es la acción que induce. Ahora solo sale cuando la renta ES la otra causa.
                */}
                {REQUISITOS.filter((r) => r.bloqueante).some((r) => estados[r.id] === 'no') && (
                  <>
                    {rentaDentroDelLimite === false ? 'Y además, hay' : 'Hay'} al menos un requisito
                    imprescindible que no cumples
                    {rentaDentroDelLimite === false ? ', así que una renta más baja no bastaría por sí sola' : ''}.{' '}
                  </>
                )}
                El Bono Joven al Alquiler no estaría disponible para tu situación actual.
                Consulta otras ayudas al alquiler disponibles en tu Comunidad Autónoma.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Próximos pasos */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><span aria-hidden="true">📋</span> Proceso de solicitud</h2>
        <div className={styles.pasosGrid}>
          {[
            // «Algunas están activas todo el año, otras tienen plazos específicos» contradecía el
            // art. 138: las comunidades «realizarán convocatorias abiertas de esta ayuda de forma
            // continuada y permanente» (hallazgo 2396)
            { num: '1', titulo: 'Verifica disponibilidad en tu CA', desc: 'Cada comunidad autónoma gestiona la ayuda, y el art. 138 del RD 326/2026 le obliga a convocarla de forma continuada y permanente, no por plazos cerrados. Comprueba en la web de vivienda de la tuya si la convocatoria ya está abierta y cómo se presenta.' },
            { num: '2', titulo: 'Reúne la documentación', desc: 'DNI/NIE, declaración de la renta, contrato de alquiler, certificado de empadronamiento y justificante de ingresos.' },
            { num: '3', titulo: 'Presenta la solicitud', desc: 'Normalmente se tramita online a través del portal de vivienda de tu CA o presencialmente en las oficinas de vivienda.' },
            { num: '4', titulo: 'Resolución y cobro', desc: 'El plazo de resolución lo fija cada comunidad autónoma en su convocatoria: el RD 326/2026 no lo regula. Una vez aprobado, la ayuda se abona mensualmente o de forma retroactiva.' },
          ].map(paso => (
            <div key={paso.num} className={styles.pasoCard}>
              <div className={styles.pasoNum} aria-hidden="true">{paso.num}</div>
              <div className={styles.pasoInfo}>
                <h3>{paso.titulo}</h3>
                <p>{paso.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <EducationalSection
        title="Guía completa del Bono Joven al Alquiler"
        subtitle="Todo lo que necesitas saber sobre esta ayuda estatal"
      >
        {/* Tabla comparativa */}
        <section className={styles.guideSection}>
          <h2>Comparativa: Bono Joven vs otras ayudas al alquiler</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th>Ayuda</th>
                  <th>Cuantía</th>
                  <th>Duración</th>
                  <th>Edad límite</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Bono Joven al Alquiler 2026-2030 (estatal)</td>
                  <td>Hasta {eur(BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.vivienda)}/mes (vivienda) · {eur(BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.habitacion)}/mes (habitación)</td>
                  <td>Hasta {BONO_ALQUILER_JOVEN_2026.plazo.totalMaximoMeses / 12} años ({BONO_ALQUILER_JOVEN_2026.plazo.inicialMeses / 12}+{BONO_ALQUILER_JOVEN_2026.plazo.prorrogaMaximaMeses / 12})</td>
                  <td>≤{BONO_ALQUILER_JOVEN_2026.edad.maxima} años</td>
                </tr>
                <tr>
                  <td>Ayudas al alquiler de la CA</td>
                  {/* Sin cifra: las convocatorias autonómicas fijan cuantías y duraciones
                      distintas cada año, y el «30-40 % de la renta / 1-3 años» que había aquí
                      no salía de ninguna norma ni de data/fiscal (hallazgo 598). */}
                  <td>La fija cada convocatoria autonómica</td>
                  <td>La fija cada convocatoria autonómica</td>
                  <td>Sin límite (en general)</td>
                </tr>
                <tr>
                  <td>Renta Básica de Emancipación (derogada)</td>
                  <td>210 €/mes</td>
                  <td>4 años</td>
                  <td>22-30 años</td>
                </tr>
                <tr>
                  <td>Deducción IRPF por alquiler (estatal)</td>
                  <td>Derogada (solo CCAA)</td>
                  <td>Anual</td>
                  <td>Sin límite general</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Escenarios */}
        <section className={styles.guideSection}>
          <h2>Casos prácticos: ¿cuánto ahorras?</h2>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">👩‍🎓</span>
              <h3>Recién graduada, 23 años</h3>
              <p>Alquiler de {eur(ESCENARIO_GRADUADA.renta)}/mes (vivienda). Bono de {eur(ESCENARIO_GRADUADA.ayuda)}/mes ({ESCENARIO_GRADUADA.notaLimite}). Paga {eur(ESCENARIO_GRADUADA.pagoReal)}/mes real. En {DURACION_MAX_ANIOS} años ahorra {eur(ESCENARIO_GRADUADA.acumulado)}.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">👨‍💼</span>
              <h3>Trabajador de 32 años</h3>
              <p>Alquiler de {eur(ESCENARIO_TRABAJADOR.renta)}/mes. El bono es de {eur(ESCENARIO_TRABAJADOR.ayuda)}/mes ({ESCENARIO_TRABAJADOR.notaLimite}). Paga {eur(ESCENARIO_TRABAJADOR.pagoReal)}/mes reales.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">👫</span>
              <h3>Pareja joven, ambos de {EDAD_MAX} años o menos</h3>
              {/*
                ⚠️ 28/09/2026 (hallazgo 2397) — aquí se afirmaba «Solo uno de los titulares puede
                beneficiarse del bono. Si ambos cumplen, el bono se asigna a uno», sin artículo
                detrás: los arts. 132-139 hacen beneficiaria a cada persona física que reúna los
                requisitos y no limitan la ayuda a una por contrato, ni lo hace el resto del RD.
                Lo que el RD sí deja abierto —cómo se aplica el 60 % del art. 137 cuando la renta
                se comparte— se dice como lo que es: algo que concreta la convocatoria.
              */}
              <p>
                El RD 326/2026 no limita la ayuda a una persona por contrato: el art. 133.1 hace
                beneficiaria a cada persona que reúna los requisitos, y el art. 133.1.d mira las rentas
                de cada solicitante, no las del hogar. Lo que no concreta es cómo se aplica el límite
                del {LIMITE_PORC} de la renta (art. 137) cuando dos titulares comparten el mismo
                alquiler, así que pregúntalo en la convocatoria de tu comunidad autónoma antes de
                contar con dos ayudas completas.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🏙️</span>
              <h3>Habitación en piso compartido</h3>
              <p>
                El Plan 2026-2030 incluye expresamente la modalidad de habitación: hasta{' '}
                {eur(BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.habitacion)}/mes. Alquiler de{' '}
                {eur(ESCENARIO_HABITACION.renta)}/mes por habitación → bono de{' '}
                {eur(ESCENARIO_HABITACION.ayuda)}/mes ({ESCENARIO_HABITACION.notaLimite}).
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre el Bono Joven</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3>¿Se puede pedir el bono si ya tengo contrato firmado?</h3>
              <p>Sí, en la mayoría de las CCAA puedes solicitar el Bono Joven aunque el contrato ya esté vigente. La ayuda suele ser retroactiva desde la fecha de solicitud.</p>
            </div>
            <div className={styles.faqItem}>
              {/* El título sale de `edad.maxima` como su respuesta (hallazgo 2394) */}
              <h3>¿Qué pasa si cumplo {EDAD_MAX + 1} años mientras cobro el bono?</h3>
              {/*
                28/09/2026 — la respuesta decía que el RD «no dice qué ocurre» si se supera la edad
                máxima durante el cobro, y el art. 133.1.b fija la edad «en el momento de solicitar
                la ayuda». Lo que de verdad queda abierto es la prórroga del art. 134.
              */}
              <p>El art. 133.1.b del RD 326/2026 exige tener {EDAD_MAX} años o menos, incluida esa edad, <strong>en el momento de solicitar la ayuda</strong>: la edad se comprueba al pedirla, así que cumplir {EDAD_MAX + 1} durante los {BONO_ALQUILER_JOVEN_2026.plazo.inicialMeses / 12} años concedidos no te hace incumplir ese requisito. El RD no dice qué ocurre con la edad al prorrogar la ayuda: el art. 134 condiciona la prórroga al acuerdo de tu comunidad autónoma y a que se sigan cumpliendo los requisitos, así que pregúntalo en tu CA antes de contar con ella.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Es compatible el bono con otras ayudas?</h3>
              <p>
                Con otras ayudas al pago del alquiler, <strong>no</strong>: el art. 136 del RD 326/2026 declara esta
                ayuda incompatible con cualquier otra destinada al pago del alquiler o de la cesión de uso de la misma
                vivienda o habitación, venga de donde venga. No es algo que decida cada comunidad. La única excepción
                la fija el propio artículo: las ayudas para esa misma finalidad que se den a víctimas de violencia de
                género, de trata o de violencia sexual, a familias monoparentales o monomarentales, a personas
                desahuciadas, sin hogar o en emergencia habitacional y a otras especialmente vulnerables. Lo que sí es
                otra cosa es la deducción autonómica del IRPF por alquiler de vivienda habitual, que no es una ayuda al
                pago sino un beneficio fiscal, y se rige por la normativa de cada región.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué ocurre si cambio de piso durante el periodo de cobro?</h3>
              {/*
                ⚠️ 28/09/2026 (hallazgo 2395) — decía «Generalmente debes comunicarlo a la CA.
                Según los casos, la ayuda puede mantenerse…», y el art. 133.3 lo fija: plazo de
                quince días desde la firma del nuevo contrato y continuidad entre contratos. Sin
                esas dos condiciones, quien avisa tarde o deja un hueco no sabe que se juega la ayuda.
              */}
              <p>
                Si te mudas dentro de la misma comunidad autónoma con un nuevo contrato, el art. 133.3 del
                RD 326/2026 te obliga a comunicarlo al órgano que te concedió la ayuda en el plazo máximo
                de {CAMBIO_DOMICILIO.diasParaComunicar} días desde la firma del nuevo contrato. Conservas la
                ayuda si el nuevo alquiler cumple todos los requisitos y el nuevo contrato se firma
                {CAMBIO_DOMICILIO.exigeContinuidadEntreContratos ? ' sin interrupción temporal con el anterior' : ''};
                la cuantía se ajusta a la nueva renta
                {CAMBIO_DOMICILIO.cuantiaPuedeSubir ? '' : ' y nunca puede superar la que venías cobrando'}.
                El artículo no regula la mudanza a otra comunidad autónoma: pregúntalo antes de mudarte.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿El propietario del piso debe cumplir algún requisito?</h3>
              {/*
                ⚠️ 28/09/2026 (hallazgo 2389) — decía que el RD «no fija a nivel estatal ninguna
                condición sobre el propietario» y le atribuía el contrato al art. 133.1.e. Lo
                escribió la reparación del hallazgo 537 (30/08), juzgada contra este módulo —que
                entonces no recogía el art. 133.2— y no contra el BOE: el art. 133.2.b excluye el
                parentesco hasta el segundo grado con el arrendador para toda España, y el contrato
                es el art. 133.1.a (el 133.1.e es el tope de renta).
              */}
              <p>
                Sí, en su relación contigo: el art. 133.2.b del RD 326/2026 impide conceder la ayuda si
                tienes parentesco hasta el {EXCLUSIONES.parentescoArrendadorHastaGrado}.º grado, por
                consanguinidad o por afinidad, con quien te alquila o te cede la vivienda, y el
                art. 133.2.c si eres socio o partícipe de la persona o la empresa arrendadora (salvo
                cooperativas sin ánimo de lucro en régimen de cesión de uso). El contrato, además, debe
                cumplir el art. 133.1.a: para una vivienda completa, formalizado conforme a la Ley 29/1994,
                de Arrendamientos Urbanos; para una habitación el RD no exige esa forma. Tu comunidad
                autónoma puede añadir requisitos en su convocatoria (art. 8.1).
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cuánto tarda en resolverse la solicitud?</h3>
              <p>Depende de tu comunidad autónoma: el RD 326/2026 no fija ningún plazo de resolución, así que lo marca cada convocatoria autonómica, y conviene mirarlo en la suya. Es recomendable solicitarlo cuanto antes, porque las CCAA resuelven por orden de entrada hasta agotar los fondos asignados.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Se puede pedir si tengo contrato de habitación?</h3>
              <p>
                Sí. El Plan 2026-2030 la incluye expresamente: el art. 137 asigna a la habitación hasta{' '}
                {eur(BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.habitacion)}/mes y el art. 133.1.e le pone
                su propio tope de renta, {eur(BONO_ALQUILER_JOVEN_2026.rentaMaximaMensual.habitacion)}/mes
                ({eur(BONO_ALQUILER_JOVEN_2026.rentaMaximaMensual.municipioPequeno.habitacion)} en municipios
                de 10.000 habitantes o menos). Con el Plan anterior sí quedaba a criterio de cada convocatoria
                autonómica; con este ya no. El selector de arriba lo calcula.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué pasa si mis ingresos suben durante el cobro?</h3>
              <p>El umbral de ingresos lo fija el Estado en {formatNumber(UMBRAL_IPREM_VIVIENDA_JOVEN.general, 0)} veces el IPREM (art. 133.1.d); lo que concreta cada Comunidad Autónoma es el cómputo y las comprobaciones periódicas durante el cobro. Si dejas de cumplir ese umbral podrías perder la ayuda, así que informa a tu CA de cualquier cambio relevante en tu situación económica.</p>
            </div>
          </div>
        </section>

        {/* Guía pasos */}
        <section className={styles.guideSection}>
          <h2>Documentación que necesitarás</h2>
          <div className={styles.stepsGrid}>
            {[
              { n: '1', titulo: 'DNI o NIE vigente', desc: 'Documento de identidad en vigor. Si eres extranjero comunitario, también sirve el certificado de registro.' },
              { n: '2', titulo: 'Última declaración de IRPF', desc: 'O certificado de imputaciones de IRPF si no estás obligado a declarar. Justifica tus ingresos.' },
              { n: '3', titulo: 'Contrato de arrendamiento', desc: 'Copia del contrato vigente con fecha, partes, renta mensual y duración. Debe estar firmado por ambas partes.' },
              { n: '4', titulo: 'Certificado de empadronamiento', desc: 'Que acredite que el piso alquilado es tu residencia habitual. Reciente (no más de 3 meses).' },
              { n: '5', titulo: 'Datos bancarios', desc: 'Número de cuenta (IBAN) donde quieres recibir la ayuda, de titularidad del solicitante.' },
              { n: '6', titulo: 'Declaración responsable', desc: 'Formulario propio de la CA donde declaras que cumples los requisitos. Suele incluirse en el formulario de solicitud.' },
            ].map(s => (
              <div key={s.n} className={styles.stepCard}>
                <div className={styles.stepNum} aria-hidden="true">{s.n}</div>
                <h3>{s.titulo}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className={styles.guideSection}>
          <h2>6 consejos para maximizar tus posibilidades</h2>
          <div className={styles.tipsGrid}>
            {[
              { icon: '⚡', titulo: 'Solicita cuanto antes', desc: 'Muchas CCAA agotan los fondos. No esperes: solicita el bono en cuanto tengas el contrato firmado.' },
              { icon: '📋', titulo: 'Prepara la documentación completa', desc: 'Una solicitud incompleta genera retrasos. Revisa la lista de documentos de tu CA antes de presentar.' },
              { icon: '🔍', titulo: 'Consulta el límite de renta de tu CA', desc: `El Real Decreto fija ${eur(BONO_ALQUILER_JOVEN_2026.rentaMaximaMensual.vivienda)}/mes para vivienda completa y ${eur(BONO_ALQUILER_JOVEN_2026.rentaMaximaMensual.habitacion)}/mes para habitación (${eur(BONO_ALQUILER_JOVEN_2026.rentaMaximaMensual.municipioPequeno.vivienda)} y ${eur(BONO_ALQUILER_JOVEN_2026.rentaMaximaMensual.municipioPequeno.habitacion)} en municipios de 10.000 habitantes o menos). Tu CA puede elevarlo, pero solo con acuerdo previo del Ministerio.` },
              { icon: '💡', titulo: 'Comprueba la deducción autonómica IRPF', desc: 'Aparte del bono, muchas CCAA tienen deducción en el IRPF por alquiler de vivienda habitual. Esa sí es compatible, porque es un beneficio fiscal y no una ayuda al pago del alquiler, que el art. 136 declara incompatible.' },
              { icon: '📱', titulo: 'Activa notificaciones en la sede electrónica', desc: 'La CA puede pedir documentación adicional. Deja activadas las notificaciones para no perder plazos de respuesta.' },
              { icon: '🤝', titulo: 'Involucra al propietario', desc: 'El propietario puede necesitar aportar documentación (datos catastrales, etc.). Informa al arrendador con antelación.' },
            ].map(t => (
              <div key={t.icon} className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">{t.icon}</span>
                <h3>{t.titulo}</h3>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Warning */}
        <section className={styles.warningBox}>
          <h2><span aria-hidden="true">⚠️</span> Advertencias importantes</h2>
          <div className={styles.warningGrid}>
            {[
              // «Cada año puede haber convocatorias distintas» chocaba con el art. 138, igual que el
              // paso 1 del proceso de solicitud (hallazgo 2396)
              { titulo: 'Los fondos son limitados y se agotan', desc: 'El Estado transfiere fondos a las CCAA, pero estos son finitos: aunque el art. 138 obliga a mantener la convocatoria abierta de forma continuada y permanente, puede haber momentos sin fondos disponibles.' },
              // El límite de renta y el plazo los fija el Estado, no la CA: decir lo contrario
              // contradecía al aviso de renta y al consejo «Consulta el límite de renta de tu
              // CA» de esta misma página, que citan el art. 135, y empujaba a quien queda fuera
              // por el art. 133.1.e a esperar otro tope en su comunidad (hallazgo 643).
              { titulo: 'Tu CA concreta la convocatoria, no los límites estatales', desc: `El límite de renta del contrato (${eur(RENTA_MAX.vivienda)}/mes en vivienda y ${eur(RENTA_MAX.habitacion)}/mes en habitación, art. 133.1.e) y el plazo de la ayuda (${BONO_ALQUILER_JOVEN_2026.plazo.inicialMeses / 12} años prorrogables otros ${BONO_ALQUILER_JOVEN_2026.plazo.prorrogaMaximaMeses / 12}, art. 134) los fija el Real Decreto para toda España: tu Comunidad Autónoma solo puede elevar la renta máxima con acuerdo previo del Ministerio (art. 135). Lo que sí concreta cada CA es su convocatoria —que el art. 138 le obliga a mantener abierta de forma continuada y permanente—: cuándo la abre, qué documentación exige y cómo se acreditan los requisitos. Consúltala antes de solicitar.` },
              { titulo: 'El fraude puede conllevar devolución + sanción', desc: 'Si se detecta que no cumplías los requisitos, deberás devolver todo lo cobrado más posibles sanciones. Declara siempre tu situación real.' },
              { titulo: 'La retroactividad no está garantizada en todas las CCAA', desc: 'Algunas CCAA pagan desde la fecha de solicitud, no desde el inicio del contrato. Solicita cuanto antes para no perder mensualidades.' },
            ].map(w => (
              <div key={w.titulo} className={styles.warningItem}>
                <strong>{w.titulo}</strong>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-bono-joven-alquiler')} />
      <ShareCard appName="simulador-bono-joven-alquiler" />
      <Footer appName="simulador-bono-joven-alquiler" />
    </div>
  );
}
