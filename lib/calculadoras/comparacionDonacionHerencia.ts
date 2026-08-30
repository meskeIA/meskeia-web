/**
 * Comparador Donación vs Herencia de un inmueble — lógica pura sin React ni DOM
 * Usada por: MCP Delegum (comparar_donacion_vs_herencia)
 *
 * Responde a la pregunta clásica "¿es mejor donar el piso en vida a mi hijo o
 * esperar a la herencia?" con UNA sola entrada de datos, orquestando las
 * calculadoras ya existentes y, sobre todo, capturando la diferencia
 * estructural que las tools sueltas no cruzan:
 *
 *   ┌─────────────────────────┬──────────────────────┬───────────────────────┐
 *   │ Coste                   │ DONACIÓN (en vida)   │ HERENCIA (mortis causa)│
 *   ├─────────────────────────┼──────────────────────┼───────────────────────┤
 *   │ ISD (lo paga el hijo)   │ Imp. Donaciones      │ Imp. Sucesiones        │
 *   │ IRPF ganancia transmit. │ SÍ tributa el donante│ EXENTO (art. 33.3.b)   │
 *   │ Plusvalía municipal     │ la paga el hijo      │ la paga el hijo*       │
 *   └─────────────────────────┴──────────────────────┴───────────────────────┘
 *   * En transmisiones mortis causa muchos ayuntamientos bonifican el IIVTNU
 *     hasta el 95 % para vivienda habitual a descendientes; en donación no.
 *
 * El factor que normalmente decide NO es el ISD, sino el IRPF de la ganancia
 * patrimonial del DONANTE (valor actual − valor de adquisición), que solo
 * existe al donar en vida. En la herencia, la "plusvalía del muerto" está
 * exenta de IRPF desde 1992.
 *
 * ALCANCE v1 (acordado): compara el coste de TRANSMITIR AHORA por ambas vías,
 * para un único receptor. No modela la venta futura del receptor (el "step-up"
 * de valor que favorece a la herencia se indica como nota cualitativa). Los
 * pactos sucesorios de algunas CCAA se señalan como nota, no se calculan.
 *
 * Fuente: Ley 29/1987 ISD + LIRPF (arts. 33-35) + TRLHL (IIVTNU) + normativa
 *         autonómica 2025. Reutiliza data/fiscal a través de las calculadoras.
 */

import { calcularDonacion, type GrupoParentesco, type NivelDiscapacidad, type IndicePatrimonio } from './donaciones';
import { calcularSucesion, type GrupoParentescoIS, type NivelDiscapacidadIS, type IndicePatrimonioIS } from './sucesiones';
import { calcularPlusvaliasIRPF } from './plusvaliasIRPF';
import { calcularIIVTNU } from './iivtnuPlusvaliaMunicipal';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

/** CCAA con pactos sucesorios que transmiten en vida sin IRPF del transmitente */
const CCAA_CON_PACTO_SUCESORIO = new Set(['galicia', 'baleares', 'pais-vasco', 'cataluna', 'aragon', 'navarra']);

export interface ParametrosComparacionDonacionHerencia {
  /** Valor actual de mercado/referencia del inmueble (€) — base de ISD e IRPF */
  valorInmueble: number;
  /** Valor de adquisición original del transmitente, con gastos (€) — para la ganancia IRPF */
  valorAdquisicion: number;
  /** Año en que el transmitente adquirió el inmueble (p. ej. 2003) */
  anioAdquisicion: number;
  /** Comunidad autónoma (clave de data/fiscal: 'madrid', 'cataluna'...) */
  ccaa: string;
  /** Parentesco del receptor. Por defecto 'II' (hijo/a de 21 o más años). */
  grupo?: GrupoParentesco;
  /** Edad del transmitente — si ≥65 y es su vivienda habitual, la ganancia IRPF queda exenta */
  edadDonante?: number;
  /** ¿El inmueble es la vivienda habitual del transmitente/causante? */
  esViviendaHabitual?: boolean;
  /**
   * Edad del RECEPTOR. Solo hace falta cuando `grupo` es 'III' (colateral: hermano, tío,
   * sobrino), a quien la vía HERENCIA exige además tener 65 años o más para la reducción de
   * vivienda habitual (art. 20.2.c LISD) — ver `convivenciaDosAnios`. Sin este dato el motor
   * deniega la reducción por defecto, que es la lectura correcta cuando falta el dato: hasta
   * el hallazgo 501 el comparador ni siquiera podía recibirlo, así que un colateral con
   * vivienda habitual salía SIEMPRE sin reducción, se cumpliera el requisito o no.
   */
  edadHeredero?: number;
  /** ¿El receptor convivió con el transmitente los 2 años anteriores? Solo importa si `grupo` es 'III' */
  convivenciaDosAnios?: boolean;
  /** Índice de patrimonio preexistente del receptor (1–4). Por defecto 1. */
  patrimonioIdx?: IndicePatrimonio;
  /** Grado de discapacidad del receptor. Por defecto '0'. */
  discapacidad?: NivelDiscapacidad;
  /** Valor catastral del suelo (€) — opcional, para calcular la plusvalía municipal */
  valorCatastralSuelo?: number;
  /** Valor catastral total (€) — opcional, acompaña al del suelo */
  valorCatastralTotal?: number;
  /** Tipo impositivo municipal de la plusvalía (%) — opcional, por defecto máximo legal */
  tipoMunicipalIIVTNU?: number;
}

export interface DesgloseVia {
  /** Cuota del Impuesto sobre Donaciones/Sucesiones a pagar por el receptor (€) */
  isd: number;
  /** Detalle de la bonificación/reducción de ISD aplicada */
  detalleIsd: string;
  /** IRPF de la ganancia patrimonial del transmitente (€) — 0 en herencia */
  irpfTransmitente: number;
  /** Plusvalía municipal IIVTNU (€) — null si no se aportaron datos catastrales */
  plusvaliaMunicipal: number | null;
  /** Coste total de la vía (€) */
  total: number;
}

export interface ResultadoComparacionDonacionHerencia {
  /** Valor del inmueble considerado (€) */
  valorInmueble: number;
  /** Ganancia patrimonial del transmitente considerada (€) */
  gananciaPatrimonialTransmitente: number;
  /** ¿La ganancia del transmitente quedó exenta de IRPF (≥65 + vivienda habitual)? */
  irpfDonanteExento: boolean;
  /** Desglose de la vía DONACIÓN en vida */
  donacion: DesgloseVia;
  /** Desglose de la vía HERENCIA */
  herencia: DesgloseVia;
  /** Diferencia de coste total (herencia − donación). >0 ⇒ donar sale más barato. */
  diferenciaTotal: number;
  /** Ahorro estimado de la opción más barata (€) */
  ahorroEstimado: number;
  /** Opción recomendada por coste fiscal de transmitir ahora */
  opcionRecomendada: 'donacion' | 'herencia' | 'similar';
  /** ¿Se ha incluido la plusvalía municipal en los totales? */
  plusvaliaIncluida: boolean;
  /** Notas, matices y avisos (fiscales y no fiscales) */
  notas: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function compararDonacionHerencia(
  p: ParametrosComparacionDonacionHerencia,
): ResultadoComparacionDonacionHerencia {
  if (p.valorInmueble <= 0) throw new Error('El valor del inmueble debe ser mayor que cero.');
  if (p.valorAdquisicion < 0) throw new Error('El valor de adquisición no puede ser negativo.');

  const r2 = (n: number) => Math.round(n * 100) / 100;
  const grupo = p.grupo ?? 'II';
  const discapacidad = p.discapacidad ?? '0';
  const patrimonioIdx = p.patrimonioIdx ?? 1;
  const anioActual = new Date().getFullYear();
  const aniosTenencia = Math.max(0, anioActual - p.anioAdquisicion);
  const notas: string[] = [];

  // ── Vía DONACIÓN ────────────────────────────────────────────────────────────
  // 1) ISD del donatario (Impuesto sobre Donaciones)
  const donIsd = calcularDonacion({
    valorDonacion: p.valorInmueble,
    ccaa: p.ccaa,
    grupo,
    discapacidad,
    patrimonioIdx,
    escrituraPublica: true, // la donación de inmueble exige escritura pública notarial
  });

  // 2) IRPF de la ganancia patrimonial del DONANTE
  const exentoIrpf = !!p.esViviendaHabitual && (p.edadDonante ?? 0) >= 65;
  let irpfDonante = 0;
  let gananciaPatrimonial = 0;
  if (exentoIrpf) {
    gananciaPatrimonial = Math.max(0, r2(p.valorInmueble - p.valorAdquisicion));
    notas.push(
      'IRPF del donante EXENTO: la transmisión de la vivienda habitual por mayor de 65 años no genera ganancia gravable en IRPF (art. 33.4.b LIRPF). Es lo que más abarata donar en este caso.',
    );
  } else {
    const irpf = calcularPlusvaliasIRPF({
      precioCompra: p.valorAdquisicion,
      precioVenta: p.valorInmueble,
      fechaCompra: `${p.anioAdquisicion}-01-01`,
      fechaVenta: new Date().toISOString().slice(0, 10),
      tipoActivo: 'inmueble',
    });
    irpfDonante = r2(irpf.cuotaIRPF);
    gananciaPatrimonial = r2(irpf.gananciaNeta);
    if (irpfDonante > 0) {
      notas.push(
        `IRPF del donante: donar en vida hace tributar al transmitente por la ganancia patrimonial (${gananciaPatrimonial.toLocaleString('es-ES')} €), con una cuota de ${irpfDonante.toLocaleString('es-ES')} € en la base del ahorro (19–28 %). En la herencia este coste NO existe.`,
      );
    } else {
      notas.push('Sin ganancia patrimonial gravable en el transmitente (el valor actual no supera al de adquisición); en donaciones las pérdidas no son computables en IRPF.');
    }
  }

  // ── Vía HERENCIA ────────────────────────────────────────────────────────────
  // 1) ISD del heredero (Impuesto sobre Sucesiones), con reducción de vivienda habitual si aplica
  const herIsd = calcularSucesion({
    baseImponible: p.valorInmueble,
    ccaa: p.ccaa,
    grupo: grupo as unknown as GrupoParentescoIS,
    discapacidad: discapacidad as unknown as NivelDiscapacidadIS,
    patrimonioIdx: patrimonioIdx as unknown as IndicePatrimonioIS,
    viviendaHabitual: p.esViviendaHabitual ? p.valorInmueble : undefined,
    edadHeredero: p.edadHeredero,
    convivenciaDosAnios: p.convivenciaDosAnios,
  });
  // 2) IRPF del causante: SIEMPRE exento (no existe "plusvalía del muerto")
  const irpfCausante = 0;
  notas.push('En la herencia, la ganancia patrimonial del causante está exenta de IRPF (art. 33.3.b LIRPF): el heredero solo afronta el Impuesto de Sucesiones (y, en su caso, la plusvalía municipal).');
  if (herIsd.reduccionViviendaNoAplicada) {
    notas.push(`Reducción de vivienda habitual (95 %) NO aplicada en la vía herencia: ${herIsd.reduccionViviendaNoAplicada}.`);
  }

  // ── Plusvalía municipal (IIVTNU) — opcional, misma base en ambas vías ────────
  let plusvalia: number | null = null;
  const plusvaliaIncluida = Boolean(p.valorCatastralSuelo && p.valorCatastralTotal);
  if (plusvaliaIncluida) {
    const iiv = calcularIIVTNU({
      valorCatastralSuelo: p.valorCatastralSuelo!,
      valorCatastralTotal: p.valorCatastralTotal!,
      precioAdquisicion: p.valorAdquisicion,
      precioTransmision: p.valorInmueble,
      aniosTenencia,
      tipoImpositivo: p.tipoMunicipalIIVTNU,
    });
    plusvalia = r2(iiv.cuotaIIVTNU);
    notas.push(
      `Plusvalía municipal (IIVTNU) estimada: ${plusvalia.toLocaleString('es-ES')} €, incluida en ambas vías. AVISO: en transmisiones por herencia muchos ayuntamientos bonifican el IIVTNU hasta el 95 % para vivienda habitual a descendientes; en donación no suele haber bonificación. Verifica la ordenanza de tu municipio.`,
    );
  } else {
    notas.push('Plusvalía municipal (IIVTNU) no incluida: aporta el valor catastral del suelo para calcularla. Aplica en ambas vías sobre el mismo inmueble, pero en herencia el ayuntamiento puede bonificarla (hasta 95 % en vivienda habitual a descendientes).');
  }

  // ── Totales y comparación ─────────────────────────────────────────────────────
  const donacionTotal = r2(donIsd.cuotaFinal + irpfDonante + (plusvalia ?? 0));
  const herenciaTotal = r2(herIsd.cuotaFinal + irpfCausante + (plusvalia ?? 0));
  const diferenciaTotal = r2(herenciaTotal - donacionTotal); // >0 ⇒ donar más barato
  const ahorroEstimado = r2(Math.abs(diferenciaTotal));

  // Umbral de "similar": diferencias pequeñas no justifican una recomendación tajante
  const umbralSimilar = Math.max(100, r2(p.valorInmueble * 0.005)); // 0,5 % del valor o 100 €
  let opcionRecomendada: 'donacion' | 'herencia' | 'similar';
  if (ahorroEstimado < umbralSimilar) opcionRecomendada = 'similar';
  else opcionRecomendada = diferenciaTotal > 0 ? 'donacion' : 'herencia';

  // ── Notas de contexto (no fiscales y avisos) ──────────────────────────────────
  if (CCAA_CON_PACTO_SUCESORIO.has(p.ccaa)) {
    notas.push('Tu CCAA contempla PACTOS SUCESORIOS (p. ej. apartación o pacto de mejora en Galicia): permiten transmitir en vida tributando por Sucesiones —no por Donaciones— y sin IRPF para el transmitente. Suele ser la vía más eficiente, pero el receptor que venda antes de 5 años puede perder el "step-up" de valor (reforma 2022). Conviene valorarla con un asesor.');
  }
  notas.push('No se considera la venta futura por el receptor: si prevé vender, la herencia actualiza el valor de adquisición a la fecha del fallecimiento ("step-up") y reduce el IRPF de esa venta, lo que favorece a la herencia frente a la donación.');
  notas.push('Más allá del coste fiscal: la donación es irrevocable y adelanta el patrimonio; la herencia mantiene el control del inmueble en vida del titular. Decisión personal, no solo fiscal.');

  return {
    valorInmueble: r2(p.valorInmueble),
    gananciaPatrimonialTransmitente: gananciaPatrimonial,
    irpfDonanteExento: exentoIrpf,
    donacion: {
      isd: r2(donIsd.cuotaFinal),
      detalleIsd: donIsd.detalleBonificacion,
      irpfTransmitente: irpfDonante,
      plusvaliaMunicipal: plusvalia,
      total: donacionTotal,
    },
    herencia: {
      isd: r2(herIsd.cuotaFinal),
      detalleIsd: herIsd.detalleBonificacion,
      irpfTransmitente: irpfCausante,
      plusvaliaMunicipal: plusvalia,
      total: herenciaTotal,
    },
    diferenciaTotal,
    ahorroEstimado,
    opcionRecomendada,
    plusvaliaIncluida,
    notas,
    fuenteDatos: 'Ley 29/1987 ISD + LIRPF arts. 33-35 + TRLHL (IIVTNU) + normativa autonómica 2025',
  };
}
