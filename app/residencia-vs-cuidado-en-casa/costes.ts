/**
 * Horquillas de MERCADO de residencia-vs-cuidado-en-casa — sin dependencias, sin React.
 *
 * Las leen la página y metadata.ts. Hasta el 04/10/2026 vivían dentro de page.tsx (un módulo
 * 'use client', que el metadata de servidor no puede importar), y el FAQPage conservaba a mano
 * 1.500-4.000 €/mes y 15-25 €/h, distintos de lo que pintaba la comparativa (hallazgo 2880).
 */

// ─── Referencias de MERCADO ──────────────────────────────────────────────────
//
// ⚠️ Estas cuatro cifras NO son datos normativos y no tienen sello: son horquillas de
//    mercado. Viven juntas y aquí arriba porque el 21/09/2026 el Inspector encontró
//    CUATRO rangos distintos para el coste de una residencia en la misma página —motor
//    1.600-3.200, tabla 1.500-4.500, FAQ 2.000-4.500 y JSON-LD 1.500-4.000— y la única
//    forma de que no vuelvan a divergir es que solo exista un sitio donde cambiarlas
//    (hallazgo 1126).
export const COSTES_MERCADO = {
  /** Plaza en residencia privada, €/mes, todo incluido y 24 h */
  residenciaMin: 1600,
  residenciaMax: 3200,
  /** Servicio de ayuda a domicilio privado de agencia, €/hora */
  sadHoraMin: 18,
  sadHoraMax: 22,
  /** Días de servicio al mes que se usan en LOS DOS extremos del rango del SAD */
  sadDiasMes: 26,
  /** Sobre el suelo legal, cuánto más se paga de hecho a un cuidador contratado */
  margenMercadoCuidador: 1.35,
};
