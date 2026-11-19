/**
 * Esperanza de vida a los 65 años (España)
 *
 * Único supuesto de longevidad del catálogo. Existe porque hasta el 13/08/2026
 * el mismo parámetro estaba escrito cuatro veces con cuatro valores distintos y
 * ninguna fuente: 20 años en `brechaJubilacion.ts`, esperanza de vida 85 en
 * `pensionComplementaria.ts`, «recomendado 20-25 años» en el formulario de
 * `planificador-ahorro-jubilacion` y «planificar para 25-30 años» en la FAQ de
 * esa misma página. Las cuatro alimentaban cálculos que se publican en la web,
 * en el MCP de Delegum y en las Actions de ChatGPT.
 *
 * NO es una tabla de mortalidad. Solo recoge la esperanza de vida a los 65 años,
 * que es el dato que necesitan las calculadoras de jubilación. Si algún día hace
 * falta la tabla completa por edad y sexo, es otro módulo.
 *
 * Fuente: INE — Movimiento Natural de la Población / Indicadores Demográficos
 * Básicos, año 2025 (nota de prensa de 18/11/2026)
 * Verificado: 2026-11-19. Hombres y mujeres, en el texto de la nota («19,88 años
 * más si era hombre y 23,62 años más si era mujer»); ambos sexos, en su tabla
 * «Esperanza de Vida de la población residente en España (2015-2025)», columna
 * «A los 65 años · Ambos sexos». La tabla da las tres cifras y coincide con el texto.
 *
 * Hasta el 19/11/2026 `referencia` era la media aritmética de hombres y mujeres
 * (21,76 con los datos de 2024), con un comentario que decía que el INE no
 * publicaba el valor conjunto. Sí lo publicaba, en la misma tabla (21,87 en 2024):
 * la media se quedaba una décima corta porque a los 65 hay más mujeres que hombres.
 *
 * ⚠️ El INE republica estas cifras cada año, hacia noviembre (nota MNP<año>.htm).
 * Al re-sellar: las tres cifras de la tabla, y que el año de referencia sea el
 * último publicado. Cambiar `referencia` mueve el golden GOLDEN-BO.
 */

export const FISCAL_ESPERANZA_VIDA_META = {
  fuente: 'INE — Movimiento Natural de la Población / Indicadores Demográficos Básicos, año 2025',
  verificado: '2026-11-19',
  vigencia: '2025',
  urlOficial: 'https://www.ine.es/dyngs/Prensa/MNP2025.htm',
  nota: 'Esperanza de vida a los 65 años. Es una media poblacional del momento, no una previsión individual: no incorpora estado de salud, profesión ni antecedentes.',
};

/** Años que, de media, se viven a partir de los 65 (España, 2025) */
export const ESPERANZA_VIDA_65 = {
  hombres: 19.88,
  mujeres: 23.62,
  /** Ambos sexos, tal como lo publica el INE (no la media de las dos cifras de arriba) */
  referencia: 21.86,
} as const;

export type SexoEsperanzaVida = keyof typeof ESPERANZA_VIDA_65;

/** Edad hasta la que hay que financiar la jubilación, según el supuesto de referencia */
export const EDAD_FINAL_ESTIMADA = 65 + ESPERANZA_VIDA_65.referencia; // 86,86

/**
 * Años de pensión a cubrir según la edad a la que se acceda a la jubilación.
 *
 * Aproxima manteniendo constante la edad final estimada, así que se desvía a
 * medida que uno se aleja de los 65: sobreestima un poco los años a cubrir en
 * jubilaciones anticipadas (el lado prudente al planificar, porque pide más
 * capital) y los infraestima en las demoradas, ya que la esperanza de vida
 * restante crece con la edad que se llega a alcanzar.
 */
export function aniosCobroEstimados(
  edadJubilacion: number,
  sexo: SexoEsperanzaVida = 'referencia'
): number {
  const edadFinal = 65 + ESPERANZA_VIDA_65[sexo];
  return Math.max(1, Math.round((edadFinal - edadJubilacion) * 10) / 10);
}
