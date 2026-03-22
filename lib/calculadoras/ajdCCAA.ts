/**
 * Calculadora del AJD (Actos Jurídicos Documentados) por CCAA — lógica pura
 * Usada por: MCP server (calcular_ajd_ccaa)
 *
 * Calcula el Impuesto sobre Actos Jurídicos Documentados (AJD) — cuota variable
 * de documentos notariales — aplicando el tipo vigente en cada Comunidad Autónoma.
 *
 * Hechos imponibles más habituales:
 *   A) Escritura de compraventa de vivienda NUEVA (primera transmisión):
 *      - El comprador paga IVA (10% general, 4% VPO) + AJD.
 *      - Base AJD = precio de compraventa (sin IVA).
 *
 *   B) Escritura de compraventa de vivienda DE SEGUNDA MANO:
 *      - El comprador paga ITP (no AJD en la compraventa).
 *      - NO aplica AJD en la compraventa de segunda mano.
 *
 *   C) Escritura de préstamo hipotecario:
 *      - Desde la Ley 5/2019 (LCCI, vigente desde 16/06/2019), el sujeto pasivo
 *        es el PRESTAMISTA (banco). El prestatario NO paga AJD en la hipoteca.
 *      - Base AJD = total garantizado (capital + intereses ordinarios +
 *        intereses de demora + costas y gastos).
 *
 *   D) Otros documentos notariales con contenido económico:
 *      - Constitución de sociedades, ampliaciones de capital, actas notariales, etc.
 *
 * Tipos AJD cuota variable (documentos notariales 1.ª copia) 2025:
 *   Tipo estatal supletorio: 0,50% (art. 31.2 TRLITP).
 *   Cada CCAA puede regular el tipo (Ley 22/2009).
 *
 * Fuente: TRLITP arts. 27-32 (RDL 1/1993) + Normativas autonómicas — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_itp_ccaa, calcular_hipoteca, calcular_compraventa_inmueble
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────

export type ComunidadAutonomaAJD =
  | 'andalucia' | 'aragon' | 'asturias' | 'baleares' | 'canarias' | 'cantabria'
  | 'castilla_la_mancha' | 'castilla_leon' | 'cataluna' | 'extremadura' | 'galicia'
  | 'la_rioja' | 'madrid' | 'murcia' | 'navarra' | 'pais_vasco' | 'valencia';

export type TipoDocumentoAJD =
  | 'compraventa_vivienda_nueva'  // Comprador paga AJD. Base = precio sin IVA
  | 'prestamo_hipotecario_banco'  // Banco paga desde 2019. Base = total garantizado
  | 'otro_documento_notarial';    // Otros actos inscribibles con contenido económico

export type ReduccionAJD = 'ninguna' | 'joven' | 'vpo' | 'familia_numerosa' | 'discapacidad';

interface TarifaAJD {
  tipoGeneral: number;   // %
  tipoReducido?: number; // % (VPO, jóvenes, etc.)
  limiteEdadJoven?: number;
  notasReduccion?: string;
}

// ─── Tabla AJD por CCAA 2025 ─────────────────────────────────────────────

const TIPOS_AJD_CCAA: Record<ComunidadAutonomaAJD, TarifaAJD> = {
  andalucia:         { tipoGeneral: 1.2,  tipoReducido: 0.3,  limiteEdadJoven: 35, notasReduccion: 'Tipo reducido 0,3%: VPO, jóvenes ≤35 años con ingresos limitados, familia numerosa, discapacidad.' },
  aragon:            { tipoGeneral: 1.5,  tipoReducido: 0.5,  limiteEdadJoven: 35, notasReduccion: 'Tipo reducido 0,5%: vivienda habitual de jóvenes ≤35 años y VPO.' },
  asturias:          { tipoGeneral: 1.2,  tipoReducido: 0.3,  limiteEdadJoven: 36, notasReduccion: 'Tipo reducido 0,3%: familia numerosa y discapacidad ≥65%. Jóvenes ≤35 años: verificar ordenanza.' },
  baleares:          { tipoGeneral: 1.2,  tipoReducido: 0.5,  notasReduccion: 'Tipo reducido 0,5%: VPO, jóvenes y familia numerosa.' },
  canarias:          { tipoGeneral: 0.75, tipoReducido: 0.4,  limiteEdadJoven: 35, notasReduccion: 'Tipo general 0,75% (menor por IGIC). Reducido 0,4% VPO y circunstancias especiales.' },
  cantabria:         { tipoGeneral: 1.5,  tipoReducido: 0.3,  limiteEdadJoven: 35, notasReduccion: 'Tipo reducido 0,3%: familia numerosa y discapacidad.' },
  castilla_la_mancha:{ tipoGeneral: 1.5,  tipoReducido: 0.5,  notasReduccion: 'Tipo reducido 0,5%: VPO y determinadas circunstancias.' },
  castilla_leon:     { tipoGeneral: 1.5,  tipoReducido: 0.4,  limiteEdadJoven: 36, notasReduccion: 'Tipo reducido 0,4%: vivienda habitual jóvenes ≤35 años, familia numerosa y discapacidad.' },
  cataluna:          { tipoGeneral: 1.5,  tipoReducido: 0.1,  notasReduccion: 'Tipo reducido 0,1%: VPO. Sin reducción general por edad.' },
  extremadura:       { tipoGeneral: 1.5,  tipoReducido: 0.75, notasReduccion: 'Tipo reducido 0,75%: VPO, familia numerosa y otros supuestos.' },
  galicia:           { tipoGeneral: 1.5,  tipoReducido: 0.5,  limiteEdadJoven: 36, notasReduccion: 'Tipo reducido 0,5%: jóvenes ≤35 años, familia numerosa y VPO.' },
  la_rioja:          { tipoGeneral: 1.0,  tipoReducido: 0.4,  notasReduccion: 'Tipo reducido 0,4%: VPO y familia numerosa.' },
  madrid:            { tipoGeneral: 0.75, tipoReducido: 0.4,  notasReduccion: 'Madrid tiene el tipo general más bajo del territorio común (0,75%). Reducido 0,4% para familia numerosa.' },
  murcia:            { tipoGeneral: 1.5,  tipoReducido: 0.1,  notasReduccion: 'Tipo reducido 0,1%: VPO.' },
  navarra:           { tipoGeneral: 0.5,  tipoReducido: 0.3,  notasReduccion: 'Régimen foral navarro (tipo más bajo de España). Reducido para VPO y familia numerosa.' },
  pais_vasco:        { tipoGeneral: 0.5,  tipoReducido: 0.3,  notasReduccion: 'Régimen foral. Verificar tipo exacto con el territorio histórico (Álava, Gipuzkoa, Bizkaia).' },
  valencia:          { tipoGeneral: 1.5,  tipoReducido: 0.1,  limiteEdadJoven: 35, notasReduccion: 'Tipo reducido 0,1%: VPO. Sin reducción general por edad.' },
};

// ─── Interfaz resultado ────────────────────────────────────────────────────

export interface ParametrosAJDCCAA {
  comunidadAutonoma: ComunidadAutonomaAJD;
  tipoDocumento: TipoDocumentoAJD;
  /** Base imponible del documento (€): precio sin IVA para compraventa, total garantizado para hipoteca */
  baseImponible: number;
  reduccion?: ReduccionAJD;
  edadComprador?: number;
}

export interface ResultadoAJDCCAA {
  comunidadAutonoma: ComunidadAutonomaAJD;
  tipoDocumento: TipoDocumentoAJD;
  baseImponible: number;
  tipoAJD: number;
  reduccion: ReduccionAJD;
  /** **Cuota AJD (€)** */
  cuotaAJD: number;
  notasReduccion: string;
  advertencias: string[];
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────

export function calcularAJDCCAA(p: ParametrosAJDCCAA): ResultadoAJDCCAA {
  if (p.baseImponible <= 0) throw new Error('La base imponible debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];
  const tarifa = TIPOS_AJD_CCAA[p.comunidadAutonoma];
  const reduccion = p.reduccion ?? 'ninguna';

  let tipoAJD: number;
  if (reduccion !== 'ninguna' && tarifa.tipoReducido !== undefined) {
    if (reduccion === 'joven') {
      const limiteEdad = tarifa.limiteEdadJoven ?? 35;
      const edadOk = p.edadComprador !== undefined && p.edadComprador <= limiteEdad;
      tipoAJD = edadOk ? tarifa.tipoReducido : tarifa.tipoGeneral;
      if (!edadOk) advertencias.push(`Reducción joven: requiere edad ≤${limiteEdad} años. Se aplica tipo general.`);
    } else {
      tipoAJD = tarifa.tipoReducido;
    }
  } else {
    tipoAJD = tarifa.tipoGeneral;
  }

  const cuotaAJD = r(p.baseImponible * tipoAJD / 100);

  // Advertencias
  if (p.tipoDocumento === 'compraventa_vivienda_nueva') {
    advertencias.push('Compraventa de vivienda nueva (1.ª transmisión): el comprador paga IVA (10% general o 4% VPO) + AJD. La base del AJD es el precio de compraventa sin IVA.');
  } else if (p.tipoDocumento === 'prestamo_hipotecario_banco') {
    advertencias.push('Préstamo hipotecario: desde la Ley 5/2019 (LCCI), el sujeto pasivo del AJD es el BANCO (prestamista). El prestatario/comprador NO paga AJD por la hipoteca. La base es el total garantizado (capital + intereses ordinarios + demora + costas).');
  } else {
    advertencias.push('Otros documentos notariales inscribibles con contenido económico: base imponible = valor declarado del acto o contrato.');
  }
  advertencias.push('El AJD se declara mediante el modelo 600 (junto con ITP) en la CCAA donde se inscribe el documento (generalmente la CCAA de ubicación del inmueble o del domicilio social para sociedades).');
  if (p.comunidadAutonoma === 'pais_vasco') advertencias.push('País Vasco: verificar tipo exacto con el territorio histórico concreto.');
  if (p.comunidadAutonoma === 'navarra') advertencias.push('Navarra: régimen foral propio — verificar con Hacienda Foral de Navarra.');

  return {
    comunidadAutonoma: p.comunidadAutonoma,
    tipoDocumento: p.tipoDocumento,
    baseImponible: r(p.baseImponible),
    tipoAJD,
    reduccion,
    cuotaAJD,
    notasReduccion: tarifa.notasReduccion ?? 'Sin notas específicas.',
    advertencias,
    fuenteDatos: 'TRLITP arts. 27-32 (RDL 1/1993) + Normativas autonómicas — vigente 2025',
  };
}
