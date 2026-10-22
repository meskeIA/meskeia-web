/**
 * Datos normativos: clasificaciones de actividad económica (CNAE-2025 e IAE)
 *
 * ⚠️ ESTE MÓDULO NO CONTIENE EL CATÁLOGO, SOLO SUS METADATOS.
 *
 * El catálogo completo (unos 2.500 códigos, ~315 KB) vive en
 * `public/datos/cnae-iae-catalogo.json` y las apps lo cargan con `fetch` bajo
 * demanda: incrustarlo en un módulo importable lo metería en el bundle y
 * penalizaría a todo el catálogo de meskeIA.
 *
 * Lo que sí vive aquí son los metadatos de vigilancia —fuente, URL oficial,
 * fecha de verificación—, para que:
 *   1. El módulo figure en `data/fiscal/MANIFIESTO-VIGILANCIA.md` como los demás.
 *      Un dato normativo sin contrato de vigilancia envejece sin que nadie lo note.
 *   2. `DataReference` y la ficha de Delegum citen la fuente sin duplicarla.
 *
 * El catálogo se regenera con `node scripts/generar-catalogos-cnae-iae.mjs`,
 * que descarga las fuentes oficiales y avisa de las diferencias con el publicado.
 *
 * Fuentes:
 *   - IAE:  RD Legislativo 1175/1990 (texto consolidado, API de datos abiertos del BOE)
 *   - CNAE: RD 10/2025, clasificación CNAE-2025 (INE)
 *
 * Verificado: 2026-07-20
 */

/** Ruta pública del catálogo. Las apps hacen `fetch(CNAE_IAE_RUTA_CATALOGO)`. */
export const CNAE_IAE_RUTA_CATALOGO = '/datos/cnae-iae-catalogo.json';

export const FISCAL_CNAE_IAE_META = {
  descripcion:
    'Catálogos oficiales completos de clasificación de actividad económica: CNAE-2025 (INE) y epígrafes del IAE (AEAT)',
  /**
   * Se sella con la fecha de la última REGENERACIÓN del catálogo, porque el generador
   * descarga las fuentes oficiales (BOE e INE) y compara con lo publicado: regenerar ES
   * verificar. La del 30/08/2026 (commit 1a743d87) dejó este sello sin actualizar pese a
   * que `generar-catalogos-cnae-iae.mjs` lo recuerda por consola al terminar, y el mismo
   * catálogo pasó a mostrar dos fechas según la página: 30/08 en meskeIA (que leía el
   * `generado` del JSON) y 20/07 en la ficha de Delegum (hallazgo 588). Ahora las dos
   * páginas leen de aquí.
   *
   * ⚠️ 08/09/2026 — el aviso del generador tampoco bastaba: solo se imprimía cuando
   * cambiaban las FUENTES OFICIALES, y una regeneración por sinónimos —la de los
   * hallazgos 631-632, sin novedades en el BOE ni en el INE— reescribía el catálogo y su
   * `meta.generado` en silencio, dejando este sello otra vez por detrás. El generador lo
   * recuerda ya en las dos salidas.
   */
  verificado: '2026-10-20',
  vigencia: '2026',

  iae: {
    fuente: 'Tarifas e Instrucción del IAE — RD Legislativo 1175/1990 (texto consolidado)',
    urlOficial: 'https://www.boe.es/buscar/act.php?id=BOE-A-1990-23930',
    organismo: 'AEAT',
    finalidad: 'tributaria',
  },

  cnae: {
    fuente: 'Clasificación Nacional de Actividades Económicas CNAE-2025 — RD 10/2025',
    urlOficial:
      'https://www.ine.es/dyngs/INEbase/operacion.htm?c=Estadistica_C&cid=1254736177032&menu=ultiDatos&idp=1254735976614',
    organismo: 'INE',
    finalidad: 'estadística',
  },

  /**
   * El punto que condiciona cualquier app que use estos datos: no existe tabla
   * oficial que traduzca un CNAE a un epígrafe del IAE. Son clasificaciones de
   * organismos distintos y con finalidades distintas. Cualquier "conversor"
   * entre ambas aplica un criterio propio, no un dato — y equivocarse de
   * epígrafe tiene consecuencias fiscales para quien se da de alta.
   */
  sinEquivalenciaOficial: true,

  /** Sí es oficial, en cambio, la correspondencia entre versiones de la CNAE. */
  correspondenciaCnaeOficial: true,

  /**
   * El catálogo NO incluye las cuotas del IAE: las del texto consolidado están
   * en pesetas de 1990 y la cuota real depende de coeficientes de situación y
   * recargos provinciales. Sirve para identificar la actividad, no para
   * calcular el impuesto.
   */
  incluyeCuotas: false,
} as const;

/**
 * Secciones de las Tarifas del IAE y su consecuencia práctica más relevante.
 *
 * Fuente única de estos textos: las apps NO deben redactar los suyos, porque el
 * dato que contienen (los porcentajes de retención) es normativo y divergiría.
 * Cada app añade su presentación —clases CSS, iconos— sobre esta base.
 */
export interface SeccionIae {
  seccion: '1ª' | '2ª' | '3ª';
  nombre: string;
  /** Quién se da de alta en esta sección. */
  quienes: string;
  /** Consecuencia sobre la retención de IRPF en factura. */
  retencion: string;
  /** Si la actividad obliga a practicar retención de IRPF al facturar a empresas y profesionales. */
  retencionIrpf: boolean;
  /** Tipo general de retención en %, o null si la sección no retiene. */
  tipoRetencion: number | null;
  /** Tipo reducido del año de inicio y los dos siguientes, en %. Null si no aplica. */
  tipoRetencionInicio: number | null;
}

/** Retención de las actividades profesionales: general (art. 101.5.a LIRPF) y del inicio de actividad (art. 95.1 RIRPF). */
const RETENCION_PROFESIONAL_GENERAL = 15;
const RETENCION_PROFESIONAL_INICIO = 7;

export const SECCIONES_IAE: readonly SeccionIae[] = [
  {
    seccion: '1ª',
    nombre: 'Actividades empresariales',
    quienes:
      'Ganadería independiente, minería, industria, comercio y servicios organizados con medios materiales o personal. Es la sección de comercios, talleres, bares, obras y de buena parte de los servicios.',
    retencion:
      'Las facturas de una actividad empresarial, con carácter general, no llevan retención de IRPF.',
    retencionIrpf: false,
    tipoRetencion: null,
    tipoRetencionInicio: null,
  },
  {
    seccion: '2ª',
    nombre: 'Actividades profesionales',
    quienes:
      'Ejercicio individual de una profesión: abogacía, arquitectura, ingeniería, medicina, traducción, consultoría, diseño y demás profesiones ejercidas por cuenta propia.',
    retencion:
      // «15\u00A0%»: espacio duro entre la cifra y el signo, para que el % no abra línea él
      // solo (hallazgo 2227 del conversor CNAE-IAE; CLAUDE.md §2, desde el 25/09/2026).
      // Las cifras salen de las mismas constantes que `tipoRetencion` y `tipoRetencionInicio`:
      // hasta el 19/10/2026 se tecleaban aquí y coincidían por casualidad (cabo C0048).
      `Las facturas a empresas y a otros profesionales llevan retención de IRPF: ${RETENCION_PROFESIONAL_GENERAL}\u00A0% con carácter general y ${RETENCION_PROFESIONAL_INICIO}\u00A0% durante el año de inicio de la actividad y los dos siguientes.`,
    retencionIrpf: true,
    tipoRetencion: RETENCION_PROFESIONAL_GENERAL,
    tipoRetencionInicio: RETENCION_PROFESIONAL_INICIO,
  },
  {
    seccion: '3ª',
    nombre: 'Actividades artísticas',
    quienes:
      'Cine, teatro, circo, música, danza, deporte y espectáculos taurinos ejercidos por cuenta propia.',
    retencion:
      'Tratamiento análogo al profesional: las facturas a empresas y a otros profesionales llevan retención de IRPF.',
    retencionIrpf: true,
    tipoRetencion: 15,
    tipoRetencionInicio: 7,
  },
] as const;

/**
 * Exención del IAE por cifra de negocio. La mayoría de autónomos y pequeñas
 * empresas están obligados a DECLARAR el epígrafe, pero exentos de pagar la cuota.
 * Base: art. 82.1.c) del Texto Refundido de la Ley de Haciendas Locales (RDL 2/2004).
 */
export const IAE_EXENCION = {
  umbralCifraNegocio: 1_000_000,
  descripcion:
    'Están exentos del pago del IAE los sujetos pasivos con una cifra neta de negocio inferior a un millón de euros, además de las personas físicas cualquiera que sea su cifra de negocio y quienes inicien su actividad durante los dos primeros períodos impositivos.',
  normativa: 'Art. 82.1.c) RDL 2/2004 (Texto Refundido de la Ley Reguladora de las Haciendas Locales)',
  urlOficial: 'https://www.boe.es/buscar/act.php?id=BOE-A-2004-4214',
  nota: 'Estar exento del pago no exime de declarar el epígrafe en el alta censal (modelo 036/037).',
} as const;

/**
 * Cambio de clasificación vigente, relevante para cualquier trámite en curso.
 *
 * `desde` es la entrada en vigor del RD 10/2025 (BOE-A-2025-587, DF 2.ª: «el día siguiente al de
 * su publicación», BOE del 15/01/2025). Hasta el 11/10/2026 decía '2026-01-01', una fecha que no
 * está en la norma (hallazgo 2923, cotejado en el BOE en el triaje de ese día). Las otras fechas
 * del RD van en la nota: no hay UNA fecha de sustitución, y el preámbulo dice expresamente que no
 * deroga la CNAE-2009.
 */
export const CNAE_VIGENCIA = {
  vigente: 'CNAE-2025',
  anterior: 'CNAE-2009',
  normaVigente: 'RD 10/2025, de 14 de enero',
  normaAnterior: 'RD 475/2007, de 13 de abril',
  desde: '2025-01-16',
  nota: 'La CNAE-2025 sustituye a la CNAE-2009: se aplica a las estadísticas oficiales con fecha de referencia desde el 01/01/2025, las empresas inscritas en la Seguridad Social debían comunicar su código antes del 30/06/2025 y el resto de registros públicos estatales debe estar codificado antes del 01/01/2027 (RD 10/2025, arts. 5 y 6 y disposición adicional única). El INE publica la tabla oficial de correspondencia entre ambas, incorporada al catálogo.',
} as const;
