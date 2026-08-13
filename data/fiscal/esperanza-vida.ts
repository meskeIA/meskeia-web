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
 * Básicos, año 2024 (nota de prensa de 19/11/2025)
 * Verificado: 2026-08-13 (ambas cifras leídas en la nota de prensa del INE)
 *
 * ⚠️ El INE republica estas cifras cada año, hacia noviembre. Al re-sellar,
 * comprobar si el año de referencia sigue siendo el último publicado.
 */

export const FISCAL_ESPERANZA_VIDA_META = {
  fuente: 'INE — Movimiento Natural de la Población / Indicadores Demográficos Básicos, año 2024',
  verificado: '2026-08-13',
  vigencia: '2024',
  urlOficial: 'https://www.ine.es/dyngs/Prensa/MNP2024.htm',
  nota: 'Esperanza de vida a los 65 años. Es una media poblacional del momento, no una previsión individual: no incorpora estado de salud, profesión ni antecedentes.',
};

/** Años que, de media, se viven a partir de los 65 (España, 2024) */
export const ESPERANZA_VIDA_65 = {
  hombres: 19.87,
  mujeres: 23.64,
  /**
   * Media aritmética de ambos sexos. Es una aproximación: el INE no publica el
   * valor conjunto en esta nota, y la media real estaría algo por encima porque
   * entre quienes llegan a los 65 hay más mujeres que hombres.
   */
  referencia: 21.76,
} as const;

export type SexoEsperanzaVida = keyof typeof ESPERANZA_VIDA_65;

/** Edad hasta la que hay que financiar la jubilación, según el supuesto de referencia */
export const EDAD_FINAL_ESTIMADA = 65 + ESPERANZA_VIDA_65.referencia; // 86,76

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
