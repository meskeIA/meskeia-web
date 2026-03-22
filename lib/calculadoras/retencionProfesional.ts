/**
 * Calculadora de Retención IRPF en Facturas de Profesionales — lógica pura
 * Usada por: MCP server (calcular_retencion_profesional)
 *
 * Calcula la retención de IRPF aplicable en facturas de autónomos profesionales
 * conforme al RIRPF art. 95 y LIRPF art. 101.
 *
 * Tipos de retención 2025:
 *   - Tipo general: 15% (autónomos profesionales con > 2 años de actividad)
 *   - Tipo reducido: 7% (primeros 3 años de actividad desde el inicio)
 *     Requisito: que en el año anterior no se hayan obtenido rendimientos
 *     de actividades profesionales (alta nueva en la actividad)
 *     Acreditar mediante comunicación a clientes (modelo de declaración)
 *
 * Actividades profesionales (RIRPF art. 95):
 *   Son actividades del art. 17.1 RIRPF (profesiones liberales, artísticas, deportivas,
 *   escritores, conferenciantes...). NO aplica a actividades empresariales (epígrafes IAE
 *   en sección primera), que no tienen retención obligatoria.
 *
 * Cuándo el cliente NO retiene (RIRPF art. 95.6):
 *   - Cliente particular (persona física sin actividad económica)
 *   - Factura total ≤ 3.005,06 € y el profesional tiene ≥ 70% ingresos con retención
 *     (exención parcial, no habitual)
 *   - El autónomo acredita que más del 70% de sus ingresos ya tienen retención
 *     (comunicación expresa)
 *
 * Fuente: LIRPF art. 101.5 + RIRPF art. 95 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_modelo_130, calcular_irpf, calcular_cuota_autonomo
 */

// ─── Constantes 2025 ────────────────────────────────────────────────────────────

const TIPO_RETENCION_GENERAL = 15;    // % — actividades profesionales generales
const TIPO_RETENCION_REDUCIDO = 7;    // % — primeros 3 años
const ANIOS_TIPO_REDUCIDO = 3;        // años desde el inicio de la actividad

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoActividadProfesional =
  | 'profesional_liberal'   // Abogados, médicos, arquitectos, economistas, etc.
  | 'artistica_deportiva'   // Artistas, deportistas
  | 'conferenciante_autor'  // Conferenciantes, escritores, colaboradores en medios
  | 'empresarial';          // Actividad empresarial (sin retención obligatoria)

export interface ParametrosRetencionProfesional {
  /** Tipo de actividad del autónomo */
  tipoActividad: TipoActividadProfesional;
  /** Base imponible de la factura (€) — sin IVA */
  baseImponibleFactura: number;
  /** ¿Está en los primeros 3 años de actividad? (tipo reducido 7%) */
  primerosAniosActividad?: boolean;
  /** Año de inicio de la actividad (para calcular automáticamente si aplica tipo reducido) */
  anioInicioActividad?: number;
  /** Año actual del ejercicio */
  anioActual?: number;
  /** Tipo de IVA aplicable (%) — para calcular el total de la factura */
  tipoIVA?: number;
}

export interface ResultadoRetencionProfesional {
  /** Tipo de actividad */
  tipoActividad: TipoActividadProfesional;
  /** Base imponible (€) */
  baseImponibleFactura: number;
  /** ¿La actividad está sujeta a retención? */
  sujetaRetencion: boolean;
  /** Motivo de no sujeción (si aplica) */
  motivoNoSujecion?: string;
  /** Tipo de retención aplicable (%) */
  tipoRetencion: number;
  /** ¿Se aplica el tipo reducido del 7%? */
  tipoReducidoAplicado: boolean;
  /** Motivo del tipo reducido (si aplica) */
  motivoTipoReducido?: string;
  /** Importe de la retención (€) */
  importeRetencion: number;
  /** Base imponible neta tras retención (€) — lo que cobra el profesional */
  baseNetraTraRetencion: number;
  /** Importe IVA (€) */
  importeIVA: number;
  /** **Total factura (€) = base + IVA - retención** */
  totalFactura: number;
  /** Desglose de la factura */
  desgloseFactura: {
    baseImponible: number;
    ivaImporte: number;
    retencionImporte: number;
    totalACobrar: number;
  };
  /** Comunicación a incluir en la factura (texto modelo) */
  textoFactura: string;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularRetencionProfesional(p: ParametrosRetencionProfesional): ResultadoRetencionProfesional {
  if (p.baseImponibleFactura <= 0) throw new Error('La base imponible debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  // Actividades empresariales no sujetas a retención
  if (p.tipoActividad === 'empresarial') {
    const tipoIVA = p.tipoIVA ?? 21;
    const importeIVA = r(p.baseImponibleFactura * tipoIVA / 100);
    const totalFactura = r(p.baseImponibleFactura + importeIVA);
    return {
      tipoActividad: 'empresarial',
      baseImponibleFactura: r(p.baseImponibleFactura),
      sujetaRetencion: false,
      motivoNoSujecion: 'Las actividades empresariales (epígrafes IAE sección 1ª) no están sujetas a retención del IRPF en facturas. Solo se aplica retención a actividades profesionales (sección 2ª y 3ª del IAE).',
      tipoRetencion: 0,
      tipoReducidoAplicado: false,
      importeRetencion: 0,
      baseNetraTraRetencion: r(p.baseImponibleFactura),
      importeIVA,
      totalFactura,
      desgloseFactura: {
        baseImponible: r(p.baseImponibleFactura),
        ivaImporte: importeIVA,
        retencionImporte: 0,
        totalACobrar: totalFactura,
      },
      textoFactura: `Base imponible: ${r(p.baseImponibleFactura).toLocaleString('es-ES', { minimumFractionDigits: 2 })} € | IVA (${tipoIVA}%): ${importeIVA.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € | Total: ${totalFactura.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`,
      advertencias: ['Las actividades empresariales no están sujetas a retención IRPF. Si tu actividad está en la sección 1ª del IAE (actividades empresariales), no debes incluir retención en tus facturas.'],
      fuenteDatos: 'RIRPF art. 95 + LIRPF art. 101.5 — vigente 2025',
    };
  }

  // Determinar si aplica tipo reducido
  let tipoReducidoAplicado = p.primerosAniosActividad ?? false;
  let motivoTipoReducido: string | undefined;

  if (!tipoReducidoAplicado && p.anioInicioActividad && p.anioActual) {
    const aniosActividad = p.anioActual - p.anioInicioActividad;
    if (aniosActividad < ANIOS_TIPO_REDUCIDO) {
      tipoReducidoAplicado = true;
      motivoTipoReducido = `Actividad iniciada en ${p.anioInicioActividad} (${aniosActividad + 1}º año) — dentro de los primeros ${ANIOS_TIPO_REDUCIDO} años.`;
    }
  } else if (tipoReducidoAplicado) {
    motivoTipoReducido = `Primeros ${ANIOS_TIPO_REDUCIDO} años de actividad — tipo reducido acreditado mediante comunicación al pagador.`;
  }

  const tipoRetencion = tipoReducidoAplicado ? TIPO_RETENCION_REDUCIDO : TIPO_RETENCION_GENERAL;
  const importeRetencion = r(p.baseImponibleFactura * tipoRetencion / 100);
  const baseNetra = r(p.baseImponibleFactura - importeRetencion);
  const tipoIVA = p.tipoIVA ?? 21;
  const importeIVA = r(p.baseImponibleFactura * tipoIVA / 100);
  const totalFactura = r(p.baseImponibleFactura + importeIVA - importeRetencion);

  const textoFactura = [
    `Base imponible: ${r(p.baseImponibleFactura).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`,
    `IVA (${tipoIVA}%): ${importeIVA.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`,
    `Retención IRPF (${tipoRetencion}%): -${importeRetencion.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`,
    `**Total a cobrar: ${totalFactura.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €**`,
    tipoReducidoAplicado
      ? `Nota factura: "En virtud de lo dispuesto en el art. 95.1 RIRPF, comunico que en el año anterior no se obtuvieron rendimientos de actividades profesionales, por lo que procede aplicar el tipo de retención reducido del ${TIPO_RETENCION_REDUCIDO}%."`
      : '',
  ].filter(Boolean).join(' | ');

  advertencias.push(`Retención ${tipoRetencion}%: el pagador (cliente empresa/autónomo) está obligado a retener este importe e ingresarlo a Hacienda trimestralmente mediante el modelo 111.`);
  advertencias.push('Los clientes particulares (personas físicas sin actividad económica) NO practican retención. La retención solo la practican empresas, profesionales y entidades pagadoras.');

  if (tipoReducidoAplicado) {
    advertencias.push(`Tipo reducido 7%: el profesional debe comunicar expresamente al cliente que aplica el tipo reducido (primeros ${ANIOS_TIPO_REDUCIDO} años). Sin esta comunicación, el cliente debe aplicar el 15%.`);
  }

  advertencias.push('Si la actividad genera rendimientos tanto del trabajo (conferencias en entidades públicas) como de actividades profesionales, puede coexistir retención del 15% y del tipo marginal de trabajo. Consultar con asesor fiscal.');

  return {
    tipoActividad: p.tipoActividad,
    baseImponibleFactura: r(p.baseImponibleFactura),
    sujetaRetencion: true,
    tipoRetencion,
    tipoReducidoAplicado,
    motivoTipoReducido,
    importeRetencion,
    baseNetraTraRetencion: baseNetra,
    importeIVA,
    totalFactura,
    desgloseFactura: {
      baseImponible: r(p.baseImponibleFactura),
      ivaImporte: importeIVA,
      retencionImporte: importeRetencion,
      totalACobrar: totalFactura,
    },
    textoFactura,
    advertencias,
    fuenteDatos: 'LIRPF art. 101.5 + RIRPF art. 95 — vigente 2025',
  };
}
