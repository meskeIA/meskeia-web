/**
 * Calculadora de Legítimas Hereditarias — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_legitimas)
 *
 * Calcula la herencia forzosa según el régimen de derecho civil aplicable
 * (Derecho Común, Cataluña, Aragón, Galicia, Baleares, País Vasco, Navarra).
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type RegimenId = 'comun' | 'cataluna' | 'aragon' | 'galicia' | 'baleares' | 'pais-vasco' | 'navarra';

export interface ParametrosLegitimas {
  /** Patrimonio neto del causante (€) */
  patrimonioNeto: number;
  /**
   * Régimen de derecho civil aplicable:
   * - 'comun': Madrid, Andalucía, Castilla, Extremadura, La Rioja, Cantabria, Asturias, Murcia, C.Valenciana, Canarias
   * - 'cataluna': Catalunya
   * - 'aragon': Aragón
   * - 'galicia': Galicia
   * - 'baleares': Illes Balears
   * - 'pais-vasco': Bizkaia y Álava (Gipuzkoa no tiene legítima)
   * - 'navarra': Comunidad Foral de Navarra (legítima puramente formal)
   */
  regimen: RegimenId;
  /** Número de hijos/descendientes (0-20) */
  numHijos: number;
  /** Si hay cónyuge/pareja superviviente */
  tieneConyuge?: boolean;
}

export interface ResultadoLegitimas {
  /** Nombre del régimen */
  nombreRegimen: string;
  /** CCAA donde aplica */
  ccaas: string;
  /** Fuente normativa */
  fuenteNormativa: string;
  /** Patrimonio neto */
  patrimonioNeto: number;
  /** Legítima total (€) — herencia forzosa mínima para todos los descendientes */
  legitimaTotal: number;
  /** Fracción del patrimonio que representa la legítima */
  fraccionLegitima: string;
  /**
   * Legítima individual por hijo (€).
   * En regímenes de legítima colectiva (Aragón) la distribución es libre.
   */
  legitimaPorHijo: number | null;
  /** Tercio de mejora (€) — solo Derecho Común */
  tercioMejora: number | null;
  /** Parte de libre disposición (€) */
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

interface DatosRegimen {
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
  'pais-vasco':{ nombre: 'País Vasco', ccaas: 'Bizkaia y Álava (Gipuzkoa: sin legítima)', fuente: 'Ley 5/2015 de Derecho Civil Vasco' },
  navarra:     { nombre: 'Navarra', ccaas: 'Comunidad Foral de Navarra', fuente: 'Compilación del Derecho Civil Foral de Navarra' },
};

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularLegitimas(p: ParametrosLegitimas): ResultadoLegitimas {
  if (p.patrimonioNeto < 0) throw new Error('El patrimonio neto no puede ser negativo.');
  if (p.numHijos < 0 || p.numHijos > 20) throw new Error('El número de hijos debe estar entre 0 y 20.');
  if (!REGIMENES[p.regimen]) throw new Error(`Régimen "${p.regimen}" no reconocido.`);

  const r = (n: number) => Math.round(n * 100) / 100;
  const datos = REGIMENES[p.regimen];
  const tieneConyuge = p.tieneConyuge ?? false;
  const PN = p.patrimonioNeto;

  let legitimaTotal = 0;
  let legitimaPorHijo: number | null = null;
  let tercioMejora: number | null = null;
  let libreDisposicion = 0;
  let derechoConyuge: number | null = null;
  let descripcionDerechoConyuge = '';
  let esLegitivaColectiva = false;
  let esNavarra = false;
  let fraccionLegitima = '';
  const notas: string[] = [];

  switch (p.regimen) {
    case 'comun': {
      const tercioEstricto = PN / 3;
      tercioMejora = r(PN / 3);
      libreDisposicion = r(PN / 3);
      legitimaTotal = r(tercioEstricto + tercioMejora); // 2/3
      legitimaPorHijo = p.numHijos > 0 ? r(tercioEstricto / p.numHijos) : null;
      fraccionLegitima = '2/3 del patrimonio (1/3 estricta + 1/3 mejora)';
      if (tieneConyuge) {
        derechoConyuge = r(tercioMejora);
        descripcionDerechoConyuge = 'Usufructo del tercio de mejora (CC art. 834). No es propiedad, solo uso y disfrute vitalicio.';
      }
      notas.push('El testador puede distribuir libremente el tercio de mejora entre descendientes, incluso favoreciendo a uno.');
      break;
    }
    case 'cataluna': {
      legitimaTotal = r(PN / 4);
      legitimaPorHijo = p.numHijos > 0 ? r(legitimaTotal / p.numHijos) : null;
      libreDisposicion = r(PN - legitimaTotal);
      fraccionLegitima = '1/4 del patrimonio para todos los descendientes';
      if (tieneConyuge) {
        derechoConyuge = r(PN / 4);
        descripcionDerechoConyuge = 'Cuarta viudal: derecho a 1/4 del patrimonio si quedan sin recursos. No siempre aplicable.';
      }
      notas.push('Mayor libertad de testar que el Derecho Común. La legítima es un crédito contra la herencia, no una parte indisponible.');
      break;
    }
    case 'aragon': {
      legitimaTotal = r(PN / 2);
      libreDisposicion = r(PN / 2);
      esLegitivaColectiva = true;
      fraccionLegitima = '1/2 del patrimonio (legítima colectiva — distribución libre entre descendientes)';
      if (tieneConyuge) {
        derechoConyuge = r(PN);
        descripcionDerechoConyuge = 'Usufructo universal de viudedad (CDFA art. 271): uso y disfrute de TODOS los bienes durante la vida del viudo.';
      }
      notas.push('Legítima colectiva: el testador puede designar libremente qué descendiente recibe qué parte, siempre que el conjunto reciba ≥ 1/2.');
      break;
    }
    case 'galicia': {
      legitimaTotal = r(PN / 4);
      legitimaPorHijo = p.numHijos > 0 ? r(legitimaTotal / p.numHijos) : null;
      libreDisposicion = r(PN - legitimaTotal);
      fraccionLegitima = '1/4 del patrimonio para descendientes';
      if (tieneConyuge) {
        derechoConyuge = r(PN / 4);
        descripcionDerechoConyuge = 'Usufructo del 1/4 del haber hereditario (Ley 2/2006 art. 253).';
      }
      break;
    }
    case 'baleares': {
      const fraccion = p.numHijos <= 1 ? 1 / 3 : 1 / 2;
      legitimaTotal = r(PN * fraccion);
      legitimaPorHijo = p.numHijos > 0 ? r(legitimaTotal / p.numHijos) : null;
      libreDisposicion = r(PN - legitimaTotal);
      fraccionLegitima = p.numHijos <= 1 ? '1/3 del patrimonio (1 hijo)' : '1/2 del patrimonio (2 o más hijos)';
      if (tieneConyuge) {
        derechoConyuge = r(legitimaTotal);
        descripcionDerechoConyuge = 'Usufructo universal de viudedad sobre todos los bienes.';
      }
      notas.push(`Con ${p.numHijos} hijo(s) se aplica la fracción ${p.numHijos <= 1 ? '1/3' : '1/2'} (Compilació Balear).`);
      break;
    }
    case 'pais-vasco': {
      legitimaTotal = r(PN / 3);
      legitimaPorHijo = p.numHijos > 0 ? r(legitimaTotal / p.numHijos) : null;
      libreDisposicion = r((PN * 2) / 3);
      fraccionLegitima = '1/3 del patrimonio para descendientes (Bizkaia/Álava)';
      if (tieneConyuge) {
        derechoConyuge = r(PN);
        descripcionDerechoConyuge = 'Usufructo universal de viudedad foral (Ley 5/2015 art. 52).';
      }
      notas.push('En Gipuzkoa no existe legítima de descendientes. En Bizkaia y Álava aplica este 1/3.');
      break;
    }
    case 'navarra': {
      legitimaTotal = 0;
      libreDisposicion = r(PN);
      esNavarra = true;
      fraccionLegitima = 'Legítima formal (simbólica) — 0 € efectivos';
      if (tieneConyuge) {
        derechoConyuge = r(PN);
        descripcionDerechoConyuge = 'Usufructo de fidelidad: derecho al usufructo de todos los bienes del premuerto mientras no contraiga nuevas nupcias.';
      }
      notas.push('En Navarra la legítima es "formal": basta con mencionar a los herederos forzosos sin dejarles nada real. Total libertad de testar.');
      break;
    }
  }

  if (!fraccionLegitima) fraccionLegitima = 'Consulta con notaría';

  return {
    nombreRegimen: datos.nombre,
    ccaas: datos.ccaas,
    fuenteNormativa: datos.fuente,
    patrimonioNeto: PN,
    legitimaTotal,
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
