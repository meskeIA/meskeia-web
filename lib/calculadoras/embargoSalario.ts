/**
 * Calculadora de Embargo de Salario — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_embargo_salario)
 *
 * Calcula el importe máximo embargable del salario conforme al art. 607 LEC,
 * aplicando la escala de tramos sobre el exceso del SMI.
 *
 * Escala art. 607.2 LEC (tramos sobre el exceso del SMI):
 *   - Tramo 1: De 1 × SMI a 2 × SMI → 30%
 *   - Tramo 2: De 2 × SMI a 3 × SMI → 50%
 *   - Tramo 3: De 3 × SMI a 4 × SMI → 60%
 *   - Tramo 4: De 4 × SMI a 5 × SMI → 75%
 *   - Tramo 5: Más de 5 × SMI       → 90%
 *
 * El salario mínimo interprofesional (SMI) actúa como cantidad inembargable.
 * Si el salario neto es ≤ SMI, NO es embargable (art. 607.1 LEC).
 *
 * SMI 2026: 1.221 €/mes (14 pagas) = 17.094 €/año (ver data/fiscal/smi.ts)
 * SMI mensual (12 pagas): 1.424,50 €/mes
 *
 * Reducción por cargas familiares (art. 607.3 LEC):
 * El juez puede reducir los porcentajes en 10-15 puntos si el deudor
 * tiene cargas familiares que lo justifiquen. Esta calculadora aplica
 * el porcentaje estándar y advierte de esta posibilidad.
 *
 * Fuente: LEC art. 607 + SMI 2026 (RD 126/2026) — ver data/fiscal/smi.ts
 * Verificado: 2026-06-11
 *
 * Encadenable con: calcular_sueldo_neto, calcular_finiquito
 */

import { SMI_2026 } from '@/data/fiscal/smi';

// ─── Constantes ────────────────────────────────────────────────────────────────

const SMI_MENSUAL_14_PAGAS = SMI_2026.mensual14; // 1.221 €/mes (14 pagas, RD 126/2026)
const SMI_MENSUAL_12_PAGAS = SMI_2026.mensual12; // 1.424,50 €/mes (equivalente 12 pagas)

// Tramos del art. 607.2 LEC: [límite superior en múltiplos de SMI, tipo %]
const TRAMOS_EMBARGO: Array<{ hastaSMI: number; tipo: number }> = [
  { hastaSMI: 2, tipo: 30 },
  { hastaSMI: 3, tipo: 50 },
  { hastaSMI: 4, tipo: 60 },
  { hastaSMI: 5, tipo: 75 },
  { hastaSMI: Infinity, tipo: 90 },
];

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface DetalleTramoEmbargo {
  tramo: string;
  desde: number;
  hasta: number;
  tipo: number;
  baseTramo: number;
  importeEmbargado: number;
}

export interface ParametrosEmbargoSalario {
  /** Salario neto mensual del deudor (€). Base para el cálculo del embargo. */
  salarioNetoMensual: number;
  /**
   * ¿Usar SMI en 12 pagas (1.424,50 €) o 14 pagas (1.221 €)?
   * Por defecto 14 pagas (official LEC). Si el salario se cobra en 12 pagas, usar 12.
   */
  pagas?: 12 | 14;
  /**
   * Porcentaje de reducción adicional por cargas familiares (0-15%).
   * Solo aplicable si el juez lo ha acordado expresamente (art. 607.3 LEC).
   */
  reduccionCargasFamiliares?: number;
}

export interface ResultadoEmbargoSalario {
  /** Salario neto mensual (€) */
  salarioNetoMensual: number;
  /** SMI mensual aplicado (€) */
  smiMensual: number;
  /** Cantidad inembargable (€) = SMI */
  cantidadInembargable: number;
  /** Exceso sobre el SMI (€) */
  excesoSobreSMI: number;
  /** Desglose por tramos (art. 607.2 LEC) */
  tramos: DetalleTramoEmbargo[];
  /** Importe bruto embargable antes de reducción por cargas (€) */
  importeEmbargableBruto: number;
  /** Reducción por cargas familiares aplicada (€) */
  reduccionCargasFamiliaresImporte: number;
  /** **Importe máximo embargable mensual (€)** */
  importeMaximoEmbargable: number;
  /** Importe que queda libre al deudor (€) */
  importeLibreDeudor: number;
  /** Porcentaje efectivo embargado sobre salario neto (%) */
  pctEfectivoEmbargado: number;
  /** ¿El salario es embargable? */
  esEmbargable: boolean;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularEmbargoSalario(p: ParametrosEmbargoSalario): ResultadoEmbargoSalario {
  if (p.salarioNetoMensual < 0) throw new Error('El salario neto mensual no puede ser negativo.');
  const reduccionPct = p.reduccionCargasFamiliares ?? 0;
  if (reduccionPct < 0 || reduccionPct > 15) throw new Error('La reducción por cargas familiares debe estar entre 0 y 15%.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const smiMensual = p.pagas === 12 ? SMI_MENSUAL_12_PAGAS : SMI_MENSUAL_14_PAGAS;

  if (p.salarioNetoMensual <= smiMensual) {
    return {
      salarioNetoMensual: r(p.salarioNetoMensual),
      smiMensual,
      cantidadInembargable: r(p.salarioNetoMensual),
      excesoSobreSMI: 0,
      tramos: [],
      importeEmbargableBruto: 0,
      reduccionCargasFamiliaresImporte: 0,
      importeMaximoEmbargable: 0,
      importeLibreDeudor: r(p.salarioNetoMensual),
      pctEfectivoEmbargado: 0,
      esEmbargable: false,
      advertencias: [
        `El salario neto (${r(p.salarioNetoMensual).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €) es igual o inferior al SMI (${smiMensual.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €) y NO es embargable (art. 607.1 LEC).`,
        'Solo son embargables los salarios que superen el SMI. El exceso tributa según la escala del art. 607.2 LEC.',
      ],
      fuenteDatos: 'LEC art. 607 + SMI 2026 (RD 126/2026) — vigente 2026',
    };
  }

  const excesoSobreSMI = r(p.salarioNetoMensual - smiMensual);
  const tramos: DetalleTramoEmbargo[] = [];
  let importeEmbargableBruto = 0;
  let acumulado = 0;

  for (let i = 0; i < TRAMOS_EMBARGO.length; i++) {
    const tramoAnteriorSMI = i === 0 ? 1 : TRAMOS_EMBARGO[i - 1].hastaSMI;
    const tramoActualSMI = TRAMOS_EMBARGO[i].hastaSMI;
    const tipo = TRAMOS_EMBARGO[i].tipo;

    const desde = r(tramoAnteriorSMI * smiMensual);
    const hasta = tramoActualSMI === Infinity ? p.salarioNetoMensual : r(tramoActualSMI * smiMensual);

    if (p.salarioNetoMensual <= desde) break;

    const hastaEfectivo = Math.min(hasta, p.salarioNetoMensual);
    const baseTramo = r(hastaEfectivo - desde);
    if (baseTramo <= 0) continue;

    const importeEmbargado = r(baseTramo * tipo / 100);
    acumulado += importeEmbargado;

    tramos.push({
      tramo: tramoActualSMI === Infinity
        ? `Más de ${tramoAnteriorSMI} × SMI`
        : `De ${tramoAnteriorSMI} × SMI a ${tramoActualSMI} × SMI`,
      desde,
      hasta: hastaEfectivo,
      tipo,
      baseTramo,
      importeEmbargado,
    });

    if (p.salarioNetoMensual <= hasta) break;
  }

  importeEmbargableBruto = r(acumulado);
  const reduccionImporte = reduccionPct > 0 ? r(importeEmbargableBruto * reduccionPct / 100) : 0;
  const importeMaximoEmbargable = r(importeEmbargableBruto - reduccionImporte);
  const importeLibreDeudor = r(p.salarioNetoMensual - importeMaximoEmbargable);
  const pctEfectivoEmbargado = r(importeMaximoEmbargable / p.salarioNetoMensual * 100);

  const advertencias: string[] = [
    'El importe calculado es el MÁXIMO embargable. El juzgado puede reducirlo si el deudor acredita cargas familiares (art. 607.3 LEC).',
    'El embargo se practica sobre el salario NETO (tras IRPF y SS). No sobre el bruto.',
    'Si el deudor tiene más de un embargo acumulado, los importes se suman respetando siempre el límite del SMI como inembargable.',
    'Las pagas extraordinarias también son embargables aplicando la misma escala sobre su importe.',
  ];

  if (reduccionPct > 0) {
    advertencias.unshift(`Se ha aplicado una reducción del ${reduccionPct}% por cargas familiares acordada judicialmente. Solo aplicable si el juez lo ha autorizado expresamente.`);
  }

  return {
    salarioNetoMensual: r(p.salarioNetoMensual),
    smiMensual,
    cantidadInembargable: smiMensual,
    excesoSobreSMI,
    tramos,
    importeEmbargableBruto,
    reduccionCargasFamiliaresImporte: reduccionImporte,
    importeMaximoEmbargable,
    importeLibreDeudor,
    pctEfectivoEmbargado,
    esEmbargable: true,
    advertencias,
    fuenteDatos: 'LEC art. 607 + SMI 2026 (RD 126/2026) — vigente 2026',
  };
}
