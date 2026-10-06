/**
 * Motor del simulador de flotabilidad: principio de Arquímedes y densidad.
 *
 * Funciones puras, sin React ni dependencias, para poder probarlas contra casos resueltos a
 * mano (tests/flotabilidad-motor.spec.ts) antes de pintar nada.
 *
 * Un cuerpo de densidad ρc y volumen V, soltado en un líquido de densidad ρl:
 *
 *   Peso                      P = m·g = ρc·V·g
 *   Empuje si está entero     E_max = ρl·V·g        (el peso del líquido desalojado)
 *
 *   ρc < ρl  FLOTA            sube hasta que el empuje iguala al peso: E = P.
 *                             Sumergido solo V_s, con ρl·V_s·g = ρc·V·g → f = V_s/V = ρc/ρl.
 *                             Emerge 1 − f. Para hundirlo del todo hay que empujar E_max − P.
 *   ρc > ρl  SE HUNDE         E = E_max < P: va al fondo. Un dinamómetro del que colgase
 *                             marcaría el peso aparente P − E_max (el resto lo pone el fondo).
 *   ρc = ρl  INDIFERENTE      E_max = P en cualquier profundidad: se queda «entre dos aguas»
 *                             donde se le deje. Peso aparente 0.
 *
 * Nada depende de la forma del cuerpo ni de la profundidad (líquido incompresible): solo de
 * las dos densidades y del volumen.
 *
 * Validación: si alguna densidad o el volumen no son números positivos, devuelve null. La
 * vista dice entonces qué falta, en vez de publicar una cifra inventada.
 */

/** Gravedad estándar en la superficie terrestre (m/s²), la habitual en los problemas de clase. */
export const G = 9.81;

/** cm³ → m³: 1 m³ = 100 cm × 100 cm × 100 cm = 1.000.000 cm³. */
export const CM3_POR_M3 = 1_000_000;

/**
 * Banda relativa en la que dos densidades se consideran iguales. El equilibrio indiferente es
 * un punto de medida nula: sin banda, 1.000 frente a 1.000,0000000001 (un redondeo al teclear
 * con decimales) daría un veredicto que nadie pidió.
 */
const TOLERANCIA_IGUALES = 1e-9;

export type Veredicto = 'flota' | 'se-hunde' | 'indiferente';

export interface ResultadoFlotabilidad {
  /** Volumen del cuerpo en m³. */
  volumen: number;
  /** Masa del cuerpo: m = ρc·V (kg). */
  masa: number;
  /** Peso: P = ρc·V·g (N). */
  peso: number;
  /** Empuje con el cuerpo entero bajo el líquido: E_max = ρl·V·g (N). */
  empujeMaximo: number;
  /** Empuje que actúa de verdad en la situación final (N): P si flota, E_max si no. */
  empuje: number;
  veredicto: Veredicto;
  /** Fracción del volumen bajo el líquido (0-1): ρc/ρl si flota; 1 si se hunde o es indiferente. */
  fraccionSumergida: number;
  /** Fracción que sobresale: 1 − fracciónSumergida. */
  fraccionEmergida: number;
  /**
   * Peso aparente (N): lo que marcaría un dinamómetro con el cuerpo colgado y sumergido entero.
   * P − E_max si se hunde, 0 si es indiferente. Si flota, null: no hay nada que colgar,
   * el líquido lo sostiene solo.
   */
  pesoAparente: number | null;
  /** Fuerza hacia abajo que hay que hacer para sumergirlo entero (N): E_max − P. Solo si flota. */
  fuerzaParaHundir: number | null;
}

/** Un número que se puede usar como densidad o volumen: finito y estrictamente positivo. */
export function esPositivo(valor: number): boolean {
  return Number.isFinite(valor) && valor > 0;
}

/** ¿Flota, se hunde o queda en equilibrio indiferente? Solo depende de las densidades. */
export function veredictoPorDensidades(densidadCuerpo: number, densidadLiquido: number): Veredicto {
  const diferencia = densidadCuerpo - densidadLiquido;
  if (Math.abs(diferencia) <= TOLERANCIA_IGUALES * Math.max(densidadCuerpo, densidadLiquido)) {
    return 'indiferente';
  }
  return diferencia < 0 ? 'flota' : 'se-hunde';
}

/**
 * Resuelve el problema completo.
 *
 * @param densidadCuerpo  ρc en kg/m³
 * @param volumenCm3      V en cm³ (la unidad en que se mide en el laboratorio)
 * @param densidadLiquido ρl en kg/m³
 * @param g               gravedad en m/s² (por defecto 9,81)
 */
export function calcularFlotabilidad(
  densidadCuerpo: number,
  volumenCm3: number,
  densidadLiquido: number,
  g: number = G,
): ResultadoFlotabilidad | null {
  if (!esPositivo(densidadCuerpo) || !esPositivo(volumenCm3) || !esPositivo(densidadLiquido) || !esPositivo(g)) {
    return null;
  }

  const volumen = volumenCm3 / CM3_POR_M3;
  const masa = densidadCuerpo * volumen;
  const peso = masa * g;
  const empujeMaximo = densidadLiquido * volumen * g;
  const veredicto = veredictoPorDensidades(densidadCuerpo, densidadLiquido);

  if (veredicto === 'flota') {
    const fraccionSumergida = densidadCuerpo / densidadLiquido;
    return {
      volumen,
      masa,
      peso,
      empujeMaximo,
      // En el equilibrio de flotación el empuje iguala al peso, no al empuje máximo
      empuje: peso,
      veredicto,
      fraccionSumergida,
      fraccionEmergida: 1 - fraccionSumergida,
      pesoAparente: null,
      fuerzaParaHundir: empujeMaximo - peso,
    };
  }

  if (veredicto === 'se-hunde') {
    return {
      volumen,
      masa,
      peso,
      empujeMaximo,
      empuje: empujeMaximo,
      veredicto,
      fraccionSumergida: 1,
      fraccionEmergida: 0,
      pesoAparente: peso - empujeMaximo,
      fuerzaParaHundir: null,
    };
  }

  // Indiferente: E_max = P (salvo el redondeo que absorbe la tolerancia)
  return {
    volumen,
    masa,
    peso,
    empujeMaximo,
    empuje: empujeMaximo,
    veredicto,
    fraccionSumergida: 1,
    fraccionEmergida: 0,
    pesoAparente: 0,
    fuerzaParaHundir: null,
  };
}
