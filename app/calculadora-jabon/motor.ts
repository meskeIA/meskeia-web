// Motor de la calculadora de jabón — sin dependencias de presentación.
//
// Álcali necesario = Σ (gramos de cada aceite × su índice de saponificación), menos el
// sobreengrase (la parte de aceite que se deja sin saponificar a propósito, como margen de
// seguridad y para que el jabón no reseque), dividido entre la pureza del álcali.
//
// Agua: o por concentración de la lejía (álcali ÷ (álcali + agua)) o por proporción
// agua:álcali. Las dos se calculan sobre el álcali que se PESA.
//
// Propiedades (método SoapCalc): suma ponderada por el peso de cada aceite de los ácidos grasos
//   dureza          = láurico + mirístico + palmítico + esteárico
//   limpieza        = láurico + mirístico
//   acondicionamiento = oleico + linoleico + linolénico + ricinoleico
//   burbuja         = láurico + mirístico + ricinoleico
//   cremosidad      = palmítico + esteárico + ricinoleico
//   yodo e INS      = media ponderada de los de cada aceite

import type { Aceite } from './aceites';

export type Alcali = 'NaOH' | 'KOH';
export type MetodoAgua = 'concentracion' | 'proporcion';

export interface LineaEntrada {
  id: string;
  gramos: number;
}

export interface Entrada {
  lineas: LineaEntrada[];
  alcali: Alcali;
  /** % de pureza del álcali (NaOH comercial ~100, KOH en escamas ~90) */
  pureza: number;
  /** % de sobreengrase */
  sobreengrase: number;
  metodoAgua: MetodoAgua;
  /** % de concentración de la lejía, o partes de agua por parte de álcali */
  valorAgua: number;
}

export interface LineaResultado {
  aceite: Aceite;
  gramos: number;
  porcentaje: number;
  /** álcali puro que saponificaría por completo este aceite (sin sobreengrase) */
  alcaliTotal: number;
}

export interface Propiedades {
  dureza: number;
  limpieza: number;
  acondicionamiento: number;
  burbuja: number;
  cremosidad: number;
  yodo: number;
  ins: number;
}

export type Aviso = 'koh-sobreengrase-alto' | 'concentracion-baja' | 'concentracion-alta' | 'sobreengrase-alto';

export interface Resultado {
  totalAceites: number;
  lineas: LineaResultado[];
  /** álcali puro sin descontar sobreengrase */
  alcaliSinDescuento: number;
  /** álcali puro tras el sobreengrase */
  alcaliPuro: number;
  /** álcali que hay que pesar (corregido por pureza) */
  alcaliPesar: number;
  agua: number;
  concentracion: number;
  proporcion: number;
  masaTotal: number;
  propiedades: Propiedades;
  avisos: Aviso[];
}

/** Rangos orientativos de SoapCalc para jabón en pastilla. */
export const RANGOS: Record<keyof Propiedades, [number, number]> = {
  dureza: [29, 54],
  limpieza: [12, 22],
  acondicionamiento: [44, 69],
  burbuja: [14, 46],
  cremosidad: [16, 48],
  yodo: [41, 70],
  ins: [136, 165],
};

export function validar(e: Entrada, catalogo: Aceite[]): string | null {
  const validas = e.lineas.filter((l) => l.gramos > 0);
  if (e.lineas.some((l) => !Number.isFinite(l.gramos) || l.gramos < 0)) return 'Revisa los gramos: tiene que ser un número mayor o igual que cero.';
  if (validas.length === 0) return 'Añade al menos un aceite con su peso en gramos.';
  if (validas.some((l) => !catalogo.some((a) => a.id === l.id))) return 'Hay un aceite que no está en la tabla.';
  if (!Number.isFinite(e.sobreengrase) || e.sobreengrase < 0) return 'El sobreengrase no puede ser negativo: significaría echar más álcali del que los aceites pueden neutralizar.';
  if (e.sobreengrase >= 100) return 'El sobreengrase tiene que ser menor que el 100 %.';
  if (!Number.isFinite(e.pureza) || e.pureza <= 0 || e.pureza > 100) return 'La pureza del álcali tiene que estar entre 1 y 100 %.';
  if (e.metodoAgua === 'concentracion' && (!Number.isFinite(e.valorAgua) || e.valorAgua <= 0 || e.valorAgua >= 100)) return 'La concentración de la lejía tiene que estar entre 1 y 99 %.';
  if (e.metodoAgua === 'proporcion' && (!Number.isFinite(e.valorAgua) || e.valorAgua <= 0)) return 'La proporción de agua tiene que ser mayor que cero.';
  return null;
}

export function calcular(e: Entrada, catalogo: Aceite[]): Resultado {
  // Un mismo aceite en dos filas se suma
  const porId = new Map<string, number>();
  for (const l of e.lineas) {
    if (l.gramos > 0) porId.set(l.id, (porId.get(l.id) ?? 0) + l.gramos);
  }
  const totalAceites = [...porId.values()].reduce((s, g) => s + g, 0);
  const sap = (a: Aceite) => (e.alcali === 'NaOH' ? a.sapNaOH : a.sapKOH);

  const lineas: LineaResultado[] = [...porId.entries()].map(([id, gramos]) => {
    const aceite = catalogo.find((a) => a.id === id) as Aceite;
    return { aceite, gramos, porcentaje: (gramos / totalAceites) * 100, alcaliTotal: gramos * sap(aceite) };
  });

  const alcaliSinDescuento = lineas.reduce((s, l) => s + l.alcaliTotal, 0);
  const alcaliPuro = alcaliSinDescuento * (1 - e.sobreengrase / 100);
  const alcaliPesar = alcaliPuro / (e.pureza / 100);
  const agua =
    e.metodoAgua === 'concentracion' ? (alcaliPesar * (100 - e.valorAgua)) / e.valorAgua : alcaliPesar * e.valorAgua;

  const pond = (f: (a: Aceite) => number) => lineas.reduce((s, l) => s + (l.gramos / totalAceites) * f(l.aceite), 0);
  const propiedades: Propiedades = {
    dureza: pond((a) => a.acidos.laurico + a.acidos.miristico + a.acidos.palmitico + a.acidos.estearico),
    limpieza: pond((a) => a.acidos.laurico + a.acidos.miristico),
    acondicionamiento: pond((a) => a.acidos.oleico + a.acidos.linoleico + a.acidos.linolenico + a.acidos.ricinoleico),
    burbuja: pond((a) => a.acidos.laurico + a.acidos.miristico + a.acidos.ricinoleico),
    cremosidad: pond((a) => a.acidos.palmitico + a.acidos.estearico + a.acidos.ricinoleico),
    yodo: pond((a) => a.yodo),
    ins: pond((a) => a.ins),
  };

  const concentracion = (alcaliPesar / (alcaliPesar + agua)) * 100;
  const avisos: Aviso[] = [];
  if (e.alcali === 'KOH' && e.sobreengrase > 3) avisos.push('koh-sobreengrase-alto');
  if (e.alcali === 'NaOH' && e.sobreengrase > 10) avisos.push('sobreengrase-alto');
  if (concentracion < 25) avisos.push('concentracion-baja');
  if (concentracion > 40) avisos.push('concentracion-alta');

  return {
    totalAceites,
    lineas,
    alcaliSinDescuento,
    alcaliPuro,
    alcaliPesar,
    agua,
    concentracion,
    proporcion: agua / alcaliPesar,
    masaTotal: totalAceites + alcaliPesar + agua,
    propiedades,
    avisos,
  };
}

/** Reescala las cantidades para que los aceites sumen `objetivo` gramos, manteniendo los %. */
export function escalar(lineas: LineaEntrada[], objetivo: number): LineaEntrada[] {
  const total = lineas.reduce((s, l) => s + (l.gramos > 0 ? l.gramos : 0), 0);
  if (total <= 0 || !(objetivo > 0)) return lineas;
  return lineas.map((l) => ({ ...l, gramos: l.gramos > 0 ? (l.gramos * objetivo) / total : l.gramos }));
}
