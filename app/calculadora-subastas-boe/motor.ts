/**
 * Motor de `calculadora-subastas-boe` — lógica pura, sin presentación.
 *
 * Calcula lo que una subasta de vivienda deja saber con certeza: el depósito para pujar, el resto
 * que hay que pagar y en qué plazo, el ITP y el Registro. Lo que depende del inmueble concreto
 * (cargas anteriores, deudas de comunidad e IBI, el impuesto si el deudor es una empresa) solo
 * entra en el total si el usuario escribe su importe: si no, el total sale INCOMPLETO y dice qué
 * le falta. Es la condición acordada con el usuario el 22/10/2026 para hacer la app: un aviso
 * debajo de una cifra falsa no protege (ficha `feedback_aviso_bajo_cifra_falsa`).
 *
 * Datos normativos: `data/fiscal/subastas.ts` (verificado en el BOE el 22/10/2026) y, para el ITP
 * y el Registro, `data/itp-ccaa.ts`, el mismo motor del clúster de compraventa.
 */

import {
  DEPOSITO_SUBASTA,
  PLAZO_PAGO_SUBASTA,
  PUJA_MINIMA_AEAT,
  POSTURA_VERBAL_MINIMA_SS,
  UMBRALES_REMATE_JUDICIAL,
  type PlazoPagoSubasta,
  type ReglaDepositoSubasta,
} from '@/data/fiscal/subastas';
import {
  calcularRegistro,
  elegirTipoITP,
  importeITP,
  type ComunidadAutonoma,
  type PerfilComprador,
  type TipoElegido,
} from '@/data/itp-ccaa';

export type RegimenSubasta = 'judicial' | 'aeat' | 'seguridad-social';
/** Cuándo empezó el procedimiento judicial: la LO 1/2025 solo rige en los incoados desde el
 * 03/04/2025 (DT 9.ª). Con «no lo sé» se toma el régimen nuevo, que pide MÁS depósito y da MENOS
 * plazo: equivocarse por ese lado es recuperable, por el otro no. */
export type InicioProcedimiento = 'desde-reforma' | 'antes-reforma' | 'no-lo-se';
export type ModalidadSeguridadSocial = 'sobre' | 'en-el-acto';
export type TipoDeudor = 'particular' | 'empresa' | 'no-lo-se';

/** Territorios forales: su ITP sigue su norma foral y el valor de referencia del Catastro estatal
 * (art. 10.2 TRLITPAJD) no rige allí, así que la base de una adjudicación en subasta no está
 * verificada y el ITP no se calcula. */
export const TERRITORIOS_FORALES_ITP: readonly ComunidadAutonoma[] = ['pais-vasco', 'navarra'];

export interface DatosSubasta {
  regimen: RegimenSubasta;
  inicio: InicioProcedimiento;
  modalidadSS: ModalidadSeguridadSocial;
  /** Valor de subasta (judicial) o tipo de subasta (AEAT, Seguridad Social), según el anuncio */
  valorSubasta: number;
  /** Lo que se piensa pujar */
  puja: number;
  ccaa: ComunidadAutonoma;
  perfil: PerfilComprador;
  /** Si será la vivienda habitual del comprador (lo exigen muchos tipos reducidos del ITP) */
  viviendaHabitual: boolean;
  /** Valor de referencia del Catastro; null si no se conoce */
  valorReferencia: number | null;
  deudor: TipoDeudor;
  /** Importes que dependen del inmueble; null = «no lo sé», 0 = no hay */
  cargasAnteriores: number | null;
  deudaComunidad: number | null;
  deudaIbi: number | null;
  /** Abogado, cerrajero, reformas… lo que el usuario prevea; 0 si nada */
  otrosGastos: number;
}

export interface ResultadoDeposito {
  importe: number;
  regla: ReglaDepositoSubasta;
  /** true si el mínimo de 1.000 € supera al porcentaje */
  minimoAplicado: boolean;
}

export type ResultadoITP =
  | {
      estado: 'calculado';
      base: number;
      /** true si la base es el valor de referencia y no la puja */
      baseEsValorReferencia: boolean;
      elegido: TipoElegido;
      importe: number;
    }
  | { estado: 'sin-valor-referencia' }
  | { estado: 'foral' }
  /** Deudor empresa: puede tocar IVA en vez de ITP. Sin cifra. */
  | { estado: 'deudor-empresa' };

/** Qué dice la ley de la puja, en la subasta judicial (arts. 670 y 671 LEC). */
export type TramoPujaJudicial = 'aprobacion-directa' | 'mejora-y-minimo' | 'bajo-minimo';

export type AvisoPuja =
  | { tipo: 'puja-bajo-deposito' }
  | { tipo: 'puja-minima-aeat'; minimo: number }
  | { tipo: 'postura-verbal-ss'; minimo: number };

export type PartidaPendiente = 'cargas' | 'comunidad' | 'ibi' | 'valor-referencia' | 'impuesto-deudor' | 'impuesto-foral';

export interface ResultadoSubasta {
  deposito: ResultadoDeposito;
  /** Lo que queda por pagar del precio tras descontar el depósito */
  resto: number;
  plazo: PlazoPagoSubasta;
  /** Se aplicó el régimen nuevo por no saber cuándo empezó el procedimiento */
  supuestoReforma: boolean;
  /** Puja sobre el valor o tipo de subasta, en porcentaje */
  porcentajePuja: number;
  tramoJudicial: TramoPujaJudicial | null;
  avisos: AvisoPuja[];
  itp: ResultadoITP;
  /** ITP orientativo cuando no se sabe si el deudor es empresa: solo si el deudor es particular */
  itpSiParticular: number | null;
  registro: number;
  /** Suma de lo conocido: puja + ITP + Registro + las partidas con importe + otros gastos */
  totalConocido: number;
  pendientes: PartidaPendiente[];
  completo: boolean;
}

const redondear = (n: number): number => Math.round(n * 100) / 100;

/** ¿Rige la LO 1/2025 en esta subasta judicial? */
export const rigeReforma = (inicio: InicioProcedimiento): boolean => inicio !== 'antes-reforma';

export function reglaDeposito(datos: Pick<DatosSubasta, 'regimen' | 'inicio' | 'modalidadSS'>): ReglaDepositoSubasta {
  if (datos.regimen === 'aeat') return DEPOSITO_SUBASTA.aeat;
  if (datos.regimen === 'seguridad-social') {
    return datos.modalidadSS === 'en-el-acto'
      ? DEPOSITO_SUBASTA.seguridadSocialEnElActo
      : DEPOSITO_SUBASTA.seguridadSocialSobre;
  }
  return rigeReforma(datos.inicio) ? DEPOSITO_SUBASTA.judicial : DEPOSITO_SUBASTA.judicialAnterior;
}

export function calcularDeposito(
  datos: Pick<DatosSubasta, 'regimen' | 'inicio' | 'modalidadSS' | 'valorSubasta'>
): ResultadoDeposito {
  const regla = reglaDeposito(datos);
  const porPorcentaje = (datos.valorSubasta * regla.porcentaje) / 100;
  const minimoAplicado = regla.minimo !== null && porPorcentaje < regla.minimo;
  return {
    importe: redondear(minimoAplicado && regla.minimo !== null ? regla.minimo : porPorcentaje),
    regla,
    minimoAplicado,
  };
}

export function plazoPago(datos: Pick<DatosSubasta, 'regimen' | 'inicio'>): PlazoPagoSubasta {
  if (datos.regimen === 'aeat') return PLAZO_PAGO_SUBASTA.aeat;
  if (datos.regimen === 'seguridad-social') return PLAZO_PAGO_SUBASTA.seguridadSocial;
  return rigeReforma(datos.inicio) ? PLAZO_PAGO_SUBASTA.judicial : PLAZO_PAGO_SUBASTA.judicialAnterior;
}

/** El tramo de la puja en la subasta judicial; los textos de cada régimen los compone la página. */
export function tramoPujaJudicial(porcentajePuja: number): TramoPujaJudicial {
  if (porcentajePuja >= UMBRALES_REMATE_JUDICIAL.aprobacionDirecta) return 'aprobacion-directa';
  if (porcentajePuja >= UMBRALES_REMATE_JUDICIAL.remateMinimoSiCubreCredito) return 'mejora-y-minimo';
  return 'bajo-minimo';
}

export function calcularITPSubasta(
  datos: Pick<DatosSubasta, 'puja' | 'ccaa' | 'perfil' | 'viviendaHabitual' | 'valorReferencia'>
): Exclude<ResultadoITP, { estado: 'deudor-empresa' }> {
  if (TERRITORIOS_FORALES_ITP.includes(datos.ccaa)) return { estado: 'foral' };
  if (datos.valorReferencia === null) return { estado: 'sin-valor-referencia' };
  // Art. 10.2 TRLITPAJD: el valor de referencia, salvo que el precio sea mayor
  const baseEsValorReferencia = datos.valorReferencia > datos.puja;
  const base = baseEsValorReferencia ? datos.valorReferencia : datos.puja;
  const elegido = elegirTipoITP(datos.ccaa, datos.perfil, base, {
    viviendaHabitual: datos.viviendaHabitual,
    objeto: 'vivienda',
  });
  return { estado: 'calculado', base, baseEsValorReferencia, elegido, importe: redondear(importeITP(base, datos.ccaa, elegido)) };
}

export function calcularSubasta(datos: DatosSubasta): ResultadoSubasta {
  const deposito = calcularDeposito(datos);
  const porcentajePuja = datos.valorSubasta > 0 ? (datos.puja / datos.valorSubasta) * 100 : 0;

  const avisos: AvisoPuja[] = [];
  if (datos.puja < deposito.importe) avisos.push({ tipo: 'puja-bajo-deposito' });
  if (datos.regimen === 'aeat' && porcentajePuja < PUJA_MINIMA_AEAT.porcentaje) {
    avisos.push({ tipo: 'puja-minima-aeat', minimo: redondear((datos.valorSubasta * PUJA_MINIMA_AEAT.porcentaje) / 100) });
  }
  if (datos.regimen === 'seguridad-social' && datos.modalidadSS === 'en-el-acto' && porcentajePuja < POSTURA_VERBAL_MINIMA_SS) {
    avisos.push({ tipo: 'postura-verbal-ss', minimo: redondear((datos.valorSubasta * POSTURA_VERBAL_MINIMA_SS) / 100) });
  }

  const pendientes: PartidaPendiente[] = [];

  // El impuesto: ITP si el deudor es particular; si es empresa puede ser IVA, y no se calcula
  const itpParticular = calcularITPSubasta(datos);
  let itp: ResultadoITP = itpParticular;
  let itpSiParticular: number | null = null;
  if (datos.deudor !== 'particular') {
    itp = { estado: 'deudor-empresa' };
    pendientes.push('impuesto-deudor');
    if (datos.deudor === 'no-lo-se' && itpParticular.estado === 'calculado') itpSiParticular = itpParticular.importe;
  }
  if (itpParticular.estado === 'foral') pendientes.push('impuesto-foral');
  if (itpParticular.estado === 'sin-valor-referencia') pendientes.push('valor-referencia');

  if (datos.cargasAnteriores === null) pendientes.push('cargas');
  if (datos.deudaComunidad === null) pendientes.push('comunidad');
  if (datos.deudaIbi === null) pendientes.push('ibi');

  // El arancel registral va sobre el precio de adjudicación
  const registro = redondear(calcularRegistro(datos.puja, datos.ccaa));
  const importeITPConocido = itp.estado === 'calculado' ? itp.importe : 0;

  const totalConocido = redondear(
    datos.puja +
      importeITPConocido +
      registro +
      (datos.cargasAnteriores ?? 0) +
      (datos.deudaComunidad ?? 0) +
      (datos.deudaIbi ?? 0) +
      datos.otrosGastos
  );

  return {
    deposito,
    resto: redondear(Math.max(0, datos.puja - deposito.importe)),
    plazo: plazoPago(datos),
    supuestoReforma: datos.regimen === 'judicial' && datos.inicio === 'no-lo-se',
    porcentajePuja,
    tramoJudicial: datos.regimen === 'judicial' ? tramoPujaJudicial(porcentajePuja) : null,
    avisos,
    itp,
    itpSiParticular,
    registro,
    totalConocido,
    pendientes,
    completo: pendientes.length === 0,
  };
}
