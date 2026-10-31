/**
 * Oficios del diccionario de la CNAE y la palabra con que las Tarifas del IAE nombran su
 * actividad (hito cnae-iae-sinonimos-oficio, 31/10/2026).
 *
 * Las Tarifas nombran ACTIVIDADES y no oficios: «peluquería» encuentra el 972.1, pero
 * «peluquero» y «peluquera» daban 0, porque el índice del IAE solo lleva el código, el título y
 * el del grupo. Medido sobre el catálogo sellado: de 294 formas de oficio de
 * `data/cnae-sinonimos.json` (con los dos géneros), 226 no encontraban nada en el IAE.
 *
 * ⚠️ Esto NO es una correspondencia CNAE→IAE, que no existe (`sinEquivalenciaOficial` en
 * `data/fiscal/cnae-iae.ts`; la `correspondencia` del catálogo es CNAE-2009→CNAE-2025). Es un
 * puente de VOCABULARIO: el oficio busca además su actividad y devuelve lo mismo que devolvería
 * escribirla, sin que nadie elija un epígrafe. Por eso entra solo una pareja de la MISMA FAMILIA
 * léxica (peluquero/peluquería) cuyos resultados nombran la actividad del oficio, y lo vigila el
 * CANDADO del spec de la app. Quedan fuera, aunque la familia exista en el literal:
 *   · enfermero → «enfermería» solo figura en el 839 «Auxiliares de enfermería», otra profesión:
 *     el literal llama a los enfermeros Ayudantes Técnicos Sanitarios (836).
 *   · agricultor → «agricultura» da productos químicos PARA la agricultura y profesionales
 *     relacionados con ella; yesero → «yeso», sobre todo su extracción y fabricación.
 *   · camionero → «camiones» (fabricación), jardinero → «jardines» (limpieza de calles,
 *     jardines botánicos), limpiadora → «limpieza» (máquinas, droguería), cristalero →
 *     «cristales» (solo la limpieza de cristales; el cristalero de la CNAE es 43.34,
 *     acristalamiento), afilador → «afilar» (fabricación de muelas), desarrollador →
 *     «desarrollo».
 * Los demás oficios del diccionario no tienen palabra de su familia en las Tarifas.
 *
 * Clave: el oficio en masculino singular y normalizado (sin tildes), tal como figura en el
 * diccionario; el femenino y el plural los resuelve la página. `buscar`, cuando la actividad sola
 * no basta: «pan» casaría por subcadena con «paneles» y «españoles».
 */
export interface ActividadIae {
  /** La actividad como se pinta en el aviso: «peluquería». */
  actividad: string;
  /** Lo que se busca en el literal, si no es la actividad misma. */
  buscar?: string[];
}

export const ACTIVIDAD_IAE_DE_OFICIO: Record<string, ActividadIae> = {
  carnicero: { actividad: 'carnicería' },
  carpintero: { actividad: 'carpintería' },
  cerrajero: { actividad: 'cerrajería' },
  fontanero: { actividad: 'fontanería' },
  joyero: { actividad: 'joyería' },
  panadero: { actividad: 'pan', buscar: ['del pan', 'de pan'] },
  pastelero: { actividad: 'pastelería' },
  peluquero: { actividad: 'peluquería' },
  pescadero: { actividad: 'pescados' },
  platero: { actividad: 'platería' },
  solador: { actividad: 'solados' },
  verdulero: { actividad: 'verduras' },
};
