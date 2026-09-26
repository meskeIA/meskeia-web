/**
 * Motor químico de `simulador-titulacion` — el pH de una valoración ácido-base, sin React ni
 * DOM.
 *
 * Vive aquí, y no en `page.tsx`, porque lo usan DOS consumidores que no pueden divergir: el
 * simulador (panel «Estado actual», curva y aviso del indicador) y la corrección de los
 * «Casos para clase» (`casos.ts`). Si cada uno calculase con su propia copia, la app podría
 * suspender un pH que ella misma acaba de mostrar, que es el peor fallo posible en algo que
 * corrige a un alumno.
 *
 * `calcularPH`, `phZonaTampon` y `phEnEquivalenciaAdBf` se trasladaron de `page.tsx` el
 * 26/09/2026 SIN cambiar una sola operación ni un comentario. Lo único nuevo es
 * `volumenEquivalencia`: la expresión C_a·V_a/C_t que `page.tsx` escribía en su `useMemo` y
 * `calcularPH` en su cuerpo, sacada tal cual —mismos factores, mismo orden— para que haya
 * una sola definición del volumen de equivalencia.
 *
 * Convenio (el de la app): siempre se valora un ÁCIDO (analito) con una BASE (titulante).
 * Volúmenes en mL, concentraciones en mol/L.
 */

export type TipoTitulacion = 'af-bf' | 'ad-bf' | 'af-bd' | 'ad-bd';

/**
 * Volumen de titulante (mL) que neutraliza exactamente el analito: n(ácido) = n(base), así
 * que V_eq = C_analito · V_analito / C_titulante. Con C_titulante = 0 devuelve Infinity, igual
 * que la expresión que sustituye.
 */
export function volumenEquivalencia(C_analito: number, V_analito: number, C_titulante: number): number {
  return (C_analito * V_analito) / C_titulante;
}

/**
 * pH de una mezcla ácido débil / base conjugada, resolviendo el balance de cargas.
 *
 * Con [HA] = C_HA − x y [A⁻] = C_A + x, la constante de acidez da una cuadrática:
 *
 *     x² + (Ka + C_A)·x − Ka·C_HA = 0
 *
 * y de sus dos raíces solo la positiva tiene sentido físico. Es la fórmula que Henderson y
 * Hasselbalch simplifican SUPONIENDO que x es despreciable frente a C_HA y a C_A; esa
 * suposición se cae justo al principio de la valoración, cuando C_A es minúsculo, y ahí H-H
 * da un pH MENOR que el del ácido puro. De ahí el valle del hallazgo 343.
 *
 * Casos resueltos a mano con acético 0,1 M · 25 mL (pKa 4,76), antes de escribir esto:
 *   V = 0,00 mL → 2,8829 (idéntico a la aproximación ½(pKa − log C) que había: 2,88)
 *   V = 0,10 mL → 2,9502 → 2,95, y SUBE, que es lo que tiene que hacer al echar base
 *   V = 12,50 mL (semiequivalencia) → 4,7605, contra el 4,7600 de H-H: ahí sí valía
 *
 * `techo` acota el resultado: la cuadrática ignora la autoionización del agua, así que con
 * el HA casi agotado el pH se dispararía por encima del de la propia equivalencia (10,16 a
 * dos microlitros de ella). El pH antes de la equivalencia nunca puede superar el de la
 * equivalencia, y ese tope solo llega a morder a partir de V = 24,998 mL de 25.
 */
function phZonaTampon(C_HA: number, C_A: number, pKa: number, techo: number): number {
  const Ka = Math.pow(10, -pKa);
  const b = Ka + C_A;
  const x = (-b + Math.sqrt(b * b + 4 * Ka * C_HA)) / 2;
  return Math.min(-Math.log10(Math.max(x, 1e-14)), techo);
}

/** pH en la equivalencia de ácido débil + base fuerte: hidrólisis de la sal. */
function phEnEquivalenciaAdBf(moles_analito: number, V_total_L: number, pKa: number): number {
  const C_sal = moles_analito / V_total_L;
  return 7 + 0.5 * (pKa + Math.log10(Math.max(C_sal, 1e-14)));
}

/**
 * Calcula pH a un volumen V (mL) de titulante añadido para un escenario dado.
 */
export function calcularPH(
  tipo: TipoTitulacion,
  V_titulante: number,
  V_analito: number,
  C_analito: number,
  C_titulante: number,
  pKa: number,
  pKb: number
): number {
  const moles_analito = (C_analito * V_analito) / 1000;
  const moles_titulante = (C_titulante * V_titulante) / 1000;
  const V_total_L = (V_analito + V_titulante) / 1000;
  const V_eq = volumenEquivalencia(C_analito, V_analito, C_titulante);

  // En todos los casos, el analito es el ácido y el titulante la base (esto se podría invertir)
  // Para simplicidad: siempre titulamos un ácido con una base.

  if (tipo === 'af-bf') {
    if (V_titulante < V_eq) {
      // Exceso de ácido
      const moles_H = moles_analito - moles_titulante;
      const conc_H = moles_H / V_total_L;
      return -Math.log10(Math.max(conc_H, 1e-14));
    } else if (Math.abs(V_titulante - V_eq) < 0.001) {
      return 7;
    } else {
      // Exceso de base
      const moles_OH = moles_titulante - moles_analito;
      const conc_OH = moles_OH / V_total_L;
      const pOH = -Math.log10(Math.max(conc_OH, 1e-14));
      return 14 - pOH;
    }
  }

  if (tipo === 'ad-bf') {
    if (V_titulante < V_eq) {
      // Una sola fórmula para V = 0 y para toda la zona tampón, y por eso no hay salto:
      // hasta el 25/08/2026 V = 0 usaba ½(pKa − log C) y V > 0 saltaba a
      // Henderson-Hasselbalch puro, así que la PRIMERA GOTA de NaOH bajaba el pH de 2,88 a
      // 2,36 — añadir base acidificaba (hallazgo 343). H-H no vale cuando n(A⁻) es mucho
      // menor que n(HA): ahí el H⁺ que aporta el propio ácido no es despreciable frente al
      // A⁻ que hay, y hay que resolver el balance de cargas.
      const moles_HA = moles_analito - moles_titulante;
      const moles_A = moles_titulante;
      if (moles_HA <= 0) return 7;
      // El techo es el pH de la equivalencia, calculado con el volumen que HABRÁ allí.
      const techo = phEnEquivalenciaAdBf(moles_analito, (V_analito + V_eq) / 1000, pKa);
      return phZonaTampon(moles_HA / V_total_L, moles_A / V_total_L, pKa, techo);
    } else if (Math.abs(V_titulante - V_eq) < 0.001) {
      // Punto de equivalencia: hidrólisis de la sal
      return phEnEquivalenciaAdBf(moles_analito, V_total_L, pKa);
    } else {
      // Exceso de base fuerte
      const moles_OH = moles_titulante - moles_analito;
      const conc_OH = moles_OH / V_total_L;
      const pOH = -Math.log10(Math.max(conc_OH, 1e-14));
      return 14 - pOH;
    }
  }

  if (tipo === 'af-bd') {
    // Titulamos ácido fuerte con base débil. Curva en imagen especular.
    if (V_titulante <= 0) {
      // pH inicial de ácido fuerte: pH = -log(C)
      return -Math.log10(C_analito);
    }
    if (V_titulante < V_eq) {
      // Antes de equivalencia: domina exceso de ácido fuerte
      const moles_H = moles_analito - moles_titulante;
      const conc_H = moles_H / V_total_L;
      return -Math.log10(Math.max(conc_H, 1e-14));
    } else if (Math.abs(V_titulante - V_eq) < 0.001) {
      // Punto de equivalencia: solución de sal de base débil + ácido fuerte
      const C_sal = moles_analito / V_total_L;
      // pH = 7 - 0.5*(pKb + log C_sal)
      return 7 - 0.5 * (pKb + Math.log10(Math.max(C_sal, 1e-14)));
    } else {
      // Exceso de base débil tras la equivalencia: zona tampón inversa
      const moles_BH = moles_analito;
      const moles_B = moles_titulante - moles_analito;
      if (moles_B <= 0) return 7;
      // pOH = pKb + log([BH+]/[B]) → pH = 14 - pOH
      const pOH = pKb + Math.log10(moles_BH / moles_B);
      return 14 - pOH;
    }
  }

  // ad-bd: aproximación
  if (V_titulante < V_eq) {
    // Misma zona tampón que en ad-bf y, hasta el 25/08/2026, el mismo valle en la primera
    // gota: el acta solo lo describe en ad-bf, pero el código era idéntico. Aquí el techo es
    // el pH de la equivalencia de ácido débil + base débil, ½(pKa + 14 − pKb).
    const moles_HA = moles_analito - moles_titulante;
    const moles_A = moles_titulante;
    if (moles_HA <= 0) return 7;
    return phZonaTampon(moles_HA / V_total_L, moles_A / V_total_L, pKa, 0.5 * (pKa + 14 - pKb));
  } else if (Math.abs(V_titulante - V_eq) < 0.001) {
    // pH ≈ 0.5*(pKa + 14 - pKb)
    return 0.5 * (pKa + 14 - pKb);
  } else {
    // Exceso de base débil
    const moles_BH = moles_analito;
    const moles_B = moles_titulante - moles_analito;
    if (moles_B <= 0) return 7;
    const pOH = pKb + Math.log10(moles_BH / moles_B);
    return 14 - pOH;
  }
}
