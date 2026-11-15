/**
 * Calculadora de Legítimas Hereditarias — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_legitimas) y /api/chatgpt/legitimas
 *
 * Calcula la herencia forzosa según el régimen de derecho civil aplicable
 * (Derecho Común, Cataluña, Aragón, Galicia, Baleares, País Vasco, Navarra).
 *
 * ⚠️ Este motor no tiene app: sus cifras las cita un LLM a un usuario real, así que cada
 * número publicado va anclado al artículo que lo sostiene y, cuando el caso no se puede
 * calcular con seguridad, se lanza un error que EXPLICA por qué en vez de devolver una cifra.
 *
 * Reparación del 09/09/2026 (cinco defectos verificados + tres hallados al anclar las fuentes):
 *   1. Con 0 descendientes se publicaba la legítima de descendientes (2/3 en común) y el
 *      usufructo del art. 834 CC, que exige concurrir CON descendientes. Ahora el caso se
 *      modela en Derecho Común (arts. 807, 809, 810, 837 y 838 CC) y se rechaza con
 *      explicación en los forales, salvo Navarra, cuya legítima formal no depende de ello.
 *   2. `REGIMENES['constructor']` era truthy y colaba una clave de Object.prototype, que
 *      hacía desaparecer el patrimonio entero. Ahora el guardián es `Object.hasOwn`.
 *   3. NaN e Infinity atravesaban las tres guardas (`NaN < 0` es false) y `numHijos: 2.5`
 *      repartía entre dos hijos y medio. Ahora se exige finitud y entero.
 *   4. Baleares publicaba «usufructo universal» y la mitad. El art. 45 de la Compilació
 *      (redacción de la Ley 7/2017) da al viudo el usufructo de LA MITAD en concurrencia
 *      con descendientes: se corrige la descripción y la cifra deja de copiar la legítima.
 *   5. Las partes no sumaban el caudal (240 de 1.344 casos): se mezclaba una fracción sin
 *      redondear con otra ya redondeada. Ahora la libre disposición sale POR DIFERENCIA.
 *   +  Al anclar el art. 45 en el BOE apareció el art. 42: la legítima balear es 1/3 con
 *      CUATRO hijos o menos, no con uno. Y el art. 52 de la Ley 5/2015 vasca da al viudo el
 *      usufructo de la mitad, no el universal. Ambos se corrigen aquí (ver el informe).
 *
 * Fuentes consultadas en sesión el 09/09/2026 (texto consolidado del BOE):
 *   · Código Civil, arts. 807, 809, 810, 813, 834, 837 y 838 (BOE-A-1889-4763)
 *   · Compilació de Dret Civil de les Illes Balears, arts. 41, 42, 45, 65 y 79
 *     (BOIB-i-1990-90001, con la reforma de la Ley 7/2017)
 *   · Ley 5/2015 de Derecho Civil Vasco, arts. 47, 48, 49 y 52 (BOE-A-2015-8273)
 *
 * Desde el 15/11/2026 (cabo C0763, hallazgo 4738) las fracciones NO se escriben aquí: salen de
 * `data/fiscal/legitimas.ts`, con la cita literal de su artículo y la fecha de verificación. Al
 * mudarlas no cambió ningún resultado: el motor calcula `(caudal × num) / den`, la misma
 * aritmética de antes (los dos «PN × (1/3)» pasaron a «PN / 3», que no mueve un céntimo: un tercio
 * de una cifra en céntimos nunca cae en el medio céntimo donde el redondeo podría cambiar).
 */

import {
  LEGITIMAS_ARAGON,
  LEGITIMAS_BALEARES,
  LEGITIMAS_CATALUNA,
  LEGITIMAS_COMUN,
  LEGITIMAS_GALICIA,
  LEGITIMAS_NAVARRA,
  LEGITIMAS_PAIS_VASCO,
  type FraccionNormativa,
} from '@/data/fiscal/legitimas';

/** Aplica una fracción normativa al caudal, sin redondear: `(caudal × num) / den`. */
function aplicar(caudal: number, f: Pick<FraccionNormativa, 'num' | 'den'>): number {
  return (caudal * f.num) / f.den;
}

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type RegimenId = 'comun' | 'cataluna' | 'aragon' | 'galicia' | 'baleares' | 'pais-vasco' | 'navarra';

/** Quién ostenta la legítima que devuelve el cálculo. */
export type Legitimarios = 'descendientes' | 'ascendientes' | 'ninguno';

export interface ParametrosLegitimas {
  /** Patrimonio neto del causante (€). Finito y no negativo. */
  patrimonioNeto: number;
  /**
   * Régimen de derecho civil aplicable:
   * - 'comun': Madrid, Andalucía, Castilla, Extremadura, La Rioja, Cantabria, Asturias, Murcia, C.Valenciana, Canarias
   * - 'cataluna': Catalunya
   * - 'aragon': Aragón
   * - 'galicia': Galicia
   * - 'baleares': Illes Balears
   * - 'pais-vasco': toda la Comunidad Autónoma, también Gipuzkoa (Ley 5/2015 arts. 8 y 10.1)
   * - 'navarra': Comunidad Foral de Navarra (legítima puramente formal)
   */
  regimen: RegimenId;
  /** Número de hijos/descendientes. Entero entre 0 y 20. */
  numHijos: number;
  /** Si hay cónyuge/pareja superviviente */
  tieneConyuge?: boolean;
  /**
   * Si viven padres u otros ascendientes del causante.
   * Solo se consulta cuando `numHijos` es 0: los descendientes excluyen a los ascendientes
   * (CC art. 807). En Derecho Común es OBLIGATORIO indicarlo si no hay hijos — sin este dato
   * el cálculo se rechaza en vez de suponer que no hay ascendientes.
   */
  tieneAscendientes?: boolean;
}

export interface ResultadoLegitimas {
  /** Nombre del régimen */
  nombreRegimen: string;
  /** CCAA donde aplica */
  ccaas: string;
  /** Fuente normativa */
  fuenteNormativa: string;
  /** Patrimonio neto (redondeado al céntimo) */
  patrimonioNeto: number;
  /** Legítima total (€) — herencia forzosa mínima del grupo indicado en `legitimarios` */
  legitimaTotal: number;
  /** Quién ostenta esa legítima: descendientes, ascendientes o nadie */
  legitimarios: Legitimarios;
  /** Fracción del patrimonio que representa la legítima */
  fraccionLegitima: string;
  /**
   * Legítima individual por hijo (€) — mínimo indisponible de cada uno.
   * En Derecho Común es la legítima ESTRICTA repartida entre los hijos (el tercio de mejora
   * es de reparto libre); en el resto de regímenes, la legítima total entre los hijos.
   * `null` cuando no hay descendientes o la legítima es colectiva (Aragón y País Vasco).
   */
  legitimaPorHijo: number | null;
  /** Tercio de mejora (€) — solo Derecho Común con descendientes */
  tercioMejora: number | null;
  /** Parte de libre disposición (€). Siempre `patrimonioNeto − legitimaTotal`. */
  libreDisposicion: number;
  /** Derecho del cónyuge (usufructo o cuarta viudal) (€) */
  derechoConyuge: number | null;
  /** Descripción del derecho del cónyuge */
  descripcionDerechoConyuge: string;
  /** Si la legítima es colectiva (puede distribuirse libremente entre descendientes) */
  esLegitivaColectiva: boolean;
  /** Si es Navarra (legítima puramente formal = 0 €) */
  esNavarra: boolean;
  /** Notas adicionales */
  notas: string[];
}

// ─── Datos de regímenes ────────────────────────────────────────────────────────

export interface DatosRegimen {
  nombre: string;
  ccaas: string;
  fuente: string;
}

const REGIMENES: Record<RegimenId, DatosRegimen> = {
  comun:       { nombre: 'Derecho Común', ccaas: 'Madrid, Andalucía, Castilla y León, Castilla-La Mancha, Extremadura, La Rioja, Cantabria, Asturias, Murcia, C.Valenciana, Canarias', fuente: 'Código Civil arts. 806-840' },
  cataluna:    { nombre: 'Cataluña', ccaas: 'Catalunya', fuente: 'Codi Civil de Catalunya, Libro IV' },
  aragon:      { nombre: 'Aragón', ccaas: 'Aragón', fuente: 'Código del Derecho Foral de Aragón (CDFA) arts. 486 y ss.' },
  galicia:     { nombre: 'Galicia', ccaas: 'Galicia', fuente: 'Ley 2/2006 de Derecho Civil de Galicia' },
  baleares:    { nombre: 'Islas Baleares', ccaas: 'Illes Balears (Mallorca e Ibiza)', fuente: 'Compilació de Dret Civil de les Illes Balears' },
  // Ley 5/2015, art. 8: se aplica «en todo el ámbito territorial de la Comunidad Autónoma del País
  // Vasco», y art. 10.1: a quien tenga vecindad civil vasca. Hasta el 15/11/2026 decía «Gipuzkoa:
  // sin legítima», y el art. 49 fija 1/3 sin excepción guipuzcoana (hallazgo 4727).
  'pais-vasco':{ nombre: 'País Vasco', ccaas: 'Bizkaia, Gipuzkoa y Álava (vecindad civil vasca)', fuente: 'Ley 5/2015 de Derecho Civil Vasco' },
  navarra:     { nombre: 'Navarra', ccaas: 'Comunidad Foral de Navarra', fuente: 'Compilación del Derecho Civil Foral de Navarra' },
};

/**
 * Ficha normativa de cada régimen (nombre, CCAA donde rige y norma que lo sostiene).
 *
 * Se exporta para que la app `estimador-legitimas` la muestre en su selector ANTES de calcular
 * sin volver a escribirla: hasta el 10/09/2026 la app llevaba su propia tabla y ya divergía
 * —anunciaba que «en Menorca rige el Derecho Común», cuando el art. 65 de la Compilació le
 * extiende el régimen de Mallorca—. El texto normativo vive aquí, con el cálculo.
 */
export const REGIMENES_INFO: Readonly<Record<RegimenId, Readonly<DatosRegimen>>> = REGIMENES;

/** Claves realmente definidas — evita que 'constructor', 'toString' o 'valueOf' pasen por régimen. */
export const REGIMENES_VALIDOS: readonly RegimenId[] = Object.keys(REGIMENES) as RegimenId[];

/** ¿Es `v` una de las siete claves propias de REGIMENES? Descarta las heredadas del prototipo. */
export function esRegimenValido(v: unknown): v is RegimenId {
  return typeof v === 'string' && Object.hasOwn(REGIMENES, v);
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularLegitimas(p: ParametrosLegitimas): ResultadoLegitimas {
  // ── Validación de entrada ──────────────────────────────────────────────────
  // El orden importa: primero el régimen, porque su nombre se cita en los demás mensajes.
  if (!esRegimenValido(p.regimen)) {
    throw new Error(
      `Régimen "${String(p.regimen)}" no reconocido. Valores válidos: ${REGIMENES_VALIDOS.join(', ')}.`
    );
  }
  if (!Number.isFinite(p.patrimonioNeto)) {
    throw new Error('El patrimonio neto debe ser un número finito (no NaN ni infinito).');
  }
  if (p.patrimonioNeto < 0) throw new Error('El patrimonio neto no puede ser negativo.');
  if (!Number.isInteger(p.numHijos)) {
    throw new Error('El número de hijos debe ser un número entero (no cabe fraccionar un descendiente).');
  }
  if (p.numHijos < 0 || p.numHijos > 20) throw new Error('El número de hijos debe estar entre 0 y 20.');

  const datos = REGIMENES[p.regimen];
  const sinDescendientes = p.numHijos === 0;

  // Sin descendientes ya no hay legítima de descendientes que calcular (CC art. 807: los
  // descendientes excluyen a los ascendientes, y a falta de ambos no hay heredero forzoso
  // salvo el viudo). Navarra queda fuera: su legítima es formal, 0 € haya o no descendientes.
  if (sinDescendientes && p.regimen !== 'navarra') {
    if (p.regimen !== 'comun') {
      throw new Error(
        `Sin descendientes, la legítima ya no es la de los hijos: pasa a los ascendientes conforme al ` +
        `derecho foral de ${datos.nombre}, que esta herramienta no cubre — solo calcula la legítima de ` +
        `descendientes en los regímenes forales. Consulta con notaría. (El caso sin descendientes sí se ` +
        `calcula en el Derecho Común.)`
      );
    }
    if (typeof p.tieneAscendientes !== 'boolean') {
      throw new Error(
        'Sin descendientes la legítima corresponde a los ascendientes (padres o abuelos) si viven, y no ' +
        'existe legítima alguna si no viven (CC art. 807). Para calcularlo hace falta saberlo: indica ' +
        '"tieneAscendientes" como true o false.'
      );
    }
  }

  const r = (n: number) => Math.round(n * 100) / 100;
  const tieneConyuge = p.tieneConyuge ?? false;
  const tieneAscendientes = p.tieneAscendientes ?? false;
  // El caudal se publica ya redondeado al céntimo: es la referencia con la que las partes cuadran.
  const PN = r(p.patrimonioNeto);

  let legitimaTotal = 0;
  let legitimarios: Legitimarios = sinDescendientes ? 'ninguno' : 'descendientes';
  let legitimaPorHijo: number | null = null;
  let tercioMejora: number | null = null;
  let derechoConyuge: number | null = null;
  let descripcionDerechoConyuge = '';
  let esLegitivaColectiva = false;
  let esNavarra = false;
  let fraccionLegitima = '';
  const notas: string[] = [];

  // ── Derecho Común sin descendientes (arts. 807, 809, 810, 837 y 838 CC) ────
  if (sinDescendientes && p.regimen === 'comun') {
    if (tieneAscendientes) {
      legitimarios = 'ascendientes';
      // Art. 809: la mitad del haber hereditario, o un tercio si concurren con el cónyuge viudo.
      legitimaTotal = r(aplicar(PN, tieneConyuge ? LEGITIMAS_COMUN.legitimaAscendientesConViudo : LEGITIMAS_COMUN.legitimaAscendientes));
      fraccionLegitima = tieneConyuge
        ? '1/3 del patrimonio para los ascendientes, por concurrir con el cónyuge viudo (CC art. 809)'
        : '1/2 del patrimonio para los ascendientes (CC art. 809)';
      notas.push('Sin descendientes, los herederos forzosos son los padres y ascendientes (CC art. 807.2.º).');
      notas.push('La legítima se divide por mitad entre la línea paterna y la materna; si solo sobrevive una línea, la recibe entera (CC art. 810).');
      if (tieneConyuge) {
        // Art. 837: usufructo de la mitad de la herencia cuando concurre con ascendientes.
        derechoConyuge = r(aplicar(PN, LEGITIMAS_COMUN.usufructoViudoConAscendientes));
        descripcionDerechoConyuge = 'Usufructo de la mitad de la herencia (CC art. 837), por concurrir con ascendientes. No es propiedad, solo uso y disfrute vitalicio, y grava también la legítima de los ascendientes (CC art. 813).';
      }
    } else {
      legitimarios = 'ninguno';
      legitimaTotal = 0;
      fraccionLegitima = tieneConyuge
        ? 'Sin legítima de descendientes ni de ascendientes: el patrimonio es de libre disposición, con el usufructo del cónyuge viudo (CC art. 838)'
        : 'Sin legítima: no hay herederos forzosos, el 100 % del patrimonio es de libre disposición';
      notas.push('Sin descendientes ni ascendientes vivos no hay legítima que reservar: puede testarse libremente a favor de cualquier persona (CC art. 807).');
      if (tieneConyuge) {
        // Art. 838: usufructo de los dos tercios de la herencia.
        derechoConyuge = r(aplicar(PN, LEGITIMAS_COMUN.usufructoViudoSinDescendientesNiAscendientes));
        descripcionDerechoConyuge = 'Usufructo de los dos tercios de la herencia (CC art. 838), al no haber descendientes ni ascendientes. No es propiedad, solo uso y disfrute vitalicio.';
      }
    }
  } else {
    switch (p.regimen) {
      case 'comun': {
        // 2/3 legítima (1/3 estricta + 1/3 mejora) + 1/3 libre disposición.
        // Las tres partes se derivan por diferencia para que sumen EXACTAMENTE el caudal.
        legitimaTotal = r(aplicar(PN, LEGITIMAS_COMUN.legitimaDescendientes));
        const tercioEstricto = r(aplicar(PN, LEGITIMAS_COMUN.legitimaEstricta));
        tercioMejora = r(legitimaTotal - tercioEstricto);
        legitimaPorHijo = r(tercioEstricto / p.numHijos);
        fraccionLegitima = '2/3 del patrimonio (1/3 estricta + 1/3 mejora)';
        if (tieneConyuge) {
          derechoConyuge = tercioMejora;
          descripcionDerechoConyuge = 'Usufructo del tercio de mejora (CC art. 834). No es propiedad, solo uso y disfrute vitalicio.';
        }
        notas.push('El testador puede distribuir libremente el tercio de mejora entre descendientes, incluso favoreciendo a uno.');
        break;
      }
      case 'cataluna': {
        legitimaTotal = r(aplicar(PN, LEGITIMAS_CATALUNA.legitima));
        legitimaPorHijo = r(legitimaTotal / p.numHijos);
        fraccionLegitima = '1/4 del patrimonio para todos los descendientes';
        if (tieneConyuge) {
          // Art. 452-1 CCCat: no es un usufructo, sino «la cantidad que sea precisa para
          // atenderlas, hasta un máximo de la cuarta parte del activo hereditario líquido», y
          // solo si el viudo no tiene recursos suficientes. La cifra publicada es ese MÁXIMO.
          derechoConyuge = r(aplicar(PN, LEGITIMAS_CATALUNA.cuartaViudalMaxima));
          descripcionDerechoConyuge = 'Cuarta viudal (CCCat art. 452-1): si el viudo no tiene recursos suficientes, la cantidad necesaria para atender sus necesidades, en propiedad, hasta un máximo de 1/4 del activo hereditario líquido. La cifra es ese máximo, haya o no hijos.';
        }
        notas.push('Mayor libertad de testar que el Derecho Común. La legítima es un crédito contra la herencia, no una parte indisponible.');
        break;
      }
      case 'aragon': {
        legitimaTotal = r(aplicar(PN, LEGITIMAS_ARAGON.legitimaColectiva));
        esLegitivaColectiva = true;
        fraccionLegitima = '1/2 del patrimonio (legítima colectiva — distribución libre entre descendientes)';
        if (tieneConyuge) {
          derechoConyuge = aplicar(PN, LEGITIMAS_ARAGON.usufructoViudedad);
          descripcionDerechoConyuge = 'Usufructo universal de viudedad (CDFA art. 271): uso y disfrute de TODOS los bienes durante la vida del viudo.';
        }
        notas.push('Legítima colectiva: el testador puede designar libremente qué descendiente recibe qué parte, siempre que el conjunto reciba ≥ 1/2.');
        break;
      }
      case 'galicia': {
        legitimaTotal = r(aplicar(PN, LEGITIMAS_GALICIA.legitima));
        legitimaPorHijo = r(legitimaTotal / p.numHijos);
        fraccionLegitima = '1/4 del patrimonio para descendientes';
        if (tieneConyuge) {
          derechoConyuge = r(aplicar(PN, LEGITIMAS_GALICIA.usufructoViudoConDescendientes));
          descripcionDerechoConyuge = 'Usufructo del 1/4 del haber hereditario (Ley 2/2006 art. 253).';
        }
        break;
      }
      case 'baleares': {
        // Arts. 42 (Mallorca y, por el art. 65, Menorca) y 79 (Eivissa i Formentera):
        // 1/3 del haber si los hijos son CUATRO O MENOS, 1/2 si exceden de ese número.
        const hastaCuatroHijos = p.numHijos <= LEGITIMAS_BALEARES.umbralHijos.valor;
        legitimaTotal = r(aplicar(PN, hastaCuatroHijos ? LEGITIMAS_BALEARES.legitimaHastaUmbral : LEGITIMAS_BALEARES.legitimaSobreUmbral));
        legitimaPorHijo = r(legitimaTotal / p.numHijos);
        fraccionLegitima = hastaCuatroHijos
          ? '1/3 del patrimonio (cuatro hijos o menos)'
          : '1/2 del patrimonio (más de cuatro hijos)';
        if (tieneConyuge) {
          // Art. 45 (redacción de la Ley 7/2017): en concurrencia con descendientes, el
          // usufructo es de la MITAD del haber; el universal queda para los demás supuestos.
          derechoConyuge = r(aplicar(PN, LEGITIMAS_BALEARES.usufructoViudoConDescendientes));
          descripcionDerechoConyuge = 'Usufructo de la mitad del haber hereditario por concurrir con descendientes (art. 45 Compilació Balear, Ley 7/2017). Rige en Mallorca y Menorca; en Eivissa i Formentera el cónyuge viudo no es legitimario (art. 79).';
        }
        notas.push(`Con ${p.numHijos} hijo(s) se aplica la fracción ${hastaCuatroHijos ? '1/3' : '1/2'}: la Compilació reserva 1/3 si los hijos son cuatro o menos y 1/2 si exceden de cuatro (arts. 42 y 79).`);
        break;
      }
      case 'pais-vasco': {
        // Art. 49 Ley 5/2015: la legítima de los hijos o descendientes es un tercio del caudal.
        // Art. 48.2: el causante «puede elegir entre ellos a uno o varios y apartar a los demás»
        // (el art. 51.3 la llama «legítima colectiva»): no hay mínimo por hijo, como en Aragón.
        legitimaTotal = r(aplicar(PN, LEGITIMAS_PAIS_VASCO.legitima));
        esLegitivaColectiva = true;
        fraccionLegitima = '1/3 del patrimonio para descendientes (legítima colectiva)';
        if (tieneConyuge) {
          // Art. 52: usufructo de la MITAD de todos los bienes si concurre con descendientes
          // (dos tercios en su defecto). No es un usufructo universal.
          derechoConyuge = r(aplicar(PN, LEGITIMAS_PAIS_VASCO.usufructoViudoConDescendientes));
          // La descripción evita a propósito la fórmula «todos los bienes» del art. 52: aquí el
          // usufructo alcanza la MITAD, y esa frase es la que delata a un usufructo universal.
          descripcionDerechoConyuge = 'Usufructo de la mitad de los bienes del causante por concurrir con descendientes (Ley 5/2015 art. 52). Sin descendientes sería el usufructo de dos tercios.';
        }
        notas.push('Legítima colectiva (Ley 5/2015 arts. 48.2 y 51.3): el tercio puede atribuirse a uno o varios descendientes, apartando a los demás.');
        notas.push('Rige en toda la Comunidad Autónoma, también en Gipuzkoa (arts. 8 y 49). Excepciones: en el valle de Ayala (Álava) hay libertad de testar (art. 89), y en la tierra llana de Bizkaia, Aramaio y Llodio la troncalidad prevalece sobre la legítima (art. 47).');
        break;
      }
      case 'navarra': {
        legitimaTotal = aplicar(PN, LEGITIMAS_NAVARRA.legitimaFormal);
        legitimarios = 'ninguno';
        esNavarra = true;
        fraccionLegitima = 'Legítima formal (simbólica) — 0 € efectivos';
        if (tieneConyuge) {
          derechoConyuge = aplicar(PN, LEGITIMAS_NAVARRA.usufructoFidelidad);
          descripcionDerechoConyuge = 'Usufructo de fidelidad: derecho al usufructo de todos los bienes del premuerto mientras no contraiga nuevas nupcias.';
        }
        notas.push('En Navarra la legítima es "formal": basta con mencionar a los herederos forzosos sin dejarles nada real. Total libertad de testar.');
        break;
      }
    }
  }

  // La libre disposición se obtiene SIEMPRE por diferencia: es lo que garantiza que las
  // partes publicadas sumen exactamente el caudal publicado, ya redondeadas.
  const libreDisposicion = r(PN - legitimaTotal);

  if (!fraccionLegitima) fraccionLegitima = 'Consulta con notaría';

  return {
    nombreRegimen: datos.nombre,
    ccaas: datos.ccaas,
    fuenteNormativa: datos.fuente,
    patrimonioNeto: PN,
    legitimaTotal,
    legitimarios,
    fraccionLegitima,
    legitimaPorHijo,
    tercioMejora,
    libreDisposicion,
    derechoConyuge: tieneConyuge ? derechoConyuge : null,
    descripcionDerechoConyuge: tieneConyuge ? descripcionDerechoConyuge : '',
    esLegitivaColectiva,
    esNavarra,
    notas,
  };
}
