/**
 * Motor del orientador de grado de dependencia — puntuación BVD (RD 174/2011, anexo I).
 *
 * Reproduce la ARITMÉTICA del baremo oficial para personas de 18 años o más:
 *
 *   puntuación = Σ (peso de la tarea × peso de su actividad × coeficiente de apoyo)
 *
 * sumada solo sobre las tareas que la persona no puede hacer sin el apoyo indispensable de
 * otra persona, y redondeada al entero más cercano. Con una condición de salud que afecte a
 * las funciones mentales se calcula también la escala específica (anexo B, que añade «Tomar
 * decisiones» y reparte los pesos de otra forma) y vale la más alta de las dos.
 *
 * Lo que un cuestionario NO puede reproducir es el juicio del valorador sobre QUÉ tareas
 * cuentan y con qué tipo de apoyo. Por eso, si no se indica el tipo de apoyo, el motor
 * devuelve un INTERVALO: el extremo bajo supone supervisión o ayuda física parcial en todas
 * las tareas (0,90) y el alto, apoyo especial (1,00). Si el intervalo cruza un corte de grado
 * (25 / 50 / 75), la app lo dice en vez de elegir uno.
 *
 * Casos resueltos a mano (pesos del anexo A, columna «18 y más»):
 *   · Todas las tareas de comer (16,8), micción (14,8), lavarse (8,8), otros cuidados (2,9),
 *     vestirse (11,9), salud (2,9) y tareas domésticas (8,0) → 66,1
 *       intervalo 66,1 × 0,90 = 59,49 → 59 … 66,1 → 66 → Grado II en los dos extremos.
 *   · Todas las de comer (16,8) y tareas domésticas (8,0) → 24,8
 *       intervalo 22,32 → 22 … 24,8 → 25 → límite «sin grado / Grado I».
 *       Con sustitución máxima: 24,8 × 0,95 = 23,56 → 24 → sin grado.
 *   · Funciones mentales: todas las de tomar decisiones (—/15,4), salud (2,9/11,0),
 *     tareas domésticas (8,0/8,0) y desplazarse fuera (12,2/12,9)
 *       general 23,1 · específica 47,3 → vale 47,3 → 42,57 → 43 … 47 → Grado I.
 *       Sin marcar la condición: 23,1 → 20,79 → 21 … 23 → sin grado.
 */

import {
  BVD_ACTIVIDADES_18_MAS,
  BVD_COEFICIENTES_APOYO,
  GRADOS_DEPENDENCIA,
} from '@/data/fiscal/dependencia';

export type TipoApoyo = 'desconocido' | 'supervision' | 'sustitucion' | 'especial';

/** 0 = sin grado reconocido (0-24 puntos) */
export type GradoBVD = 0 | 1 | 2 | 3;

export interface EstimacionBVD {
  /** Suma ponderada de la escala general, antes del coeficiente de apoyo */
  sumaGeneral: number;
  /** Suma ponderada de la escala específica, o null si no aplica */
  sumaEspecifica: number | null;
  /** Escala que da la puntuación más alta (la que vale según el anexo I) */
  escala: 'general' | 'especifica';
  /** Puntuación final redondeada en el extremo bajo y en el alto del intervalo */
  minimo: number;
  maximo: number;
  gradoMinimo: GradoBVD;
  gradoMaximo: GradoBVD;
}

/** Rango de coeficientes (anexo C) que corresponde a cada respuesta sobre el tipo de apoyo */
const RANGO_POR_APOYO: Record<TipoApoyo, { bajo: number; alto: number }> = {
  // Supervisión y física parcial comparten coeficiente
  supervision: { bajo: BVD_COEFICIENTES_APOYO.supervision, alto: BVD_COEFICIENTES_APOYO.fisicaParcial },
  sustitucion: { bajo: BVD_COEFICIENTES_APOYO.sustitucionMaxima, alto: BVD_COEFICIENTES_APOYO.sustitucionMaxima },
  especial: { bajo: BVD_COEFICIENTES_APOYO.apoyoEspecial, alto: BVD_COEFICIENTES_APOYO.apoyoEspecial },
  // Sin saber el tipo de apoyo: del más bajo al más alto
  desconocido: { bajo: BVD_COEFICIENTES_APOYO.supervision, alto: BVD_COEFICIENTES_APOYO.apoyoEspecial },
};

export function coeficientesDeApoyo(tipo: TipoApoyo): { bajo: number; alto: number } {
  return RANGO_POR_APOYO[tipo];
}

/** Redondeo al entero más cercano, a salvo del ruido de coma flotante (24,5 no puede ser 24,4999…) */
function redondearPuntuacion(valor: number): number {
  return Math.round(Math.round(valor * 1e6) / 1e6);
}

export function gradoDePuntuacion(puntos: number): GradoBVD {
  const tramo = GRADOS_DEPENDENCIA.find(g => puntos >= g.puntuacionBVDDesde && puntos <= g.puntuacionBVDHasta);
  return tramo ? (tramo.grado as GradoBVD) : 0;
}

export function estimarBVD(
  marcadas: ReadonlySet<string>,
  funcionesMentales: boolean,
  tipoApoyo: TipoApoyo,
): EstimacionBVD {
  let sumaGeneral = 0;
  let sumaEspecifica = 0;

  for (const actividad of BVD_ACTIVIDADES_18_MAS) {
    const fraccion = actividad.tareas
      .filter(t => marcadas.has(t.id))
      .reduce((s, t) => s + t.peso, 0);
    if (fraccion === 0) continue;
    if (actividad.pesoGeneral !== null) sumaGeneral += fraccion * actividad.pesoGeneral;
    sumaEspecifica += fraccion * actividad.pesoEspecifico;
  }

  const aplicaEspecifica = funcionesMentales;
  const escala: 'general' | 'especifica' =
    aplicaEspecifica && sumaEspecifica > sumaGeneral ? 'especifica' : 'general';
  const base = escala === 'especifica' ? sumaEspecifica : sumaGeneral;

  const { bajo, alto } = coeficientesDeApoyo(tipoApoyo);
  const minimo = redondearPuntuacion(base * bajo);
  const maximo = redondearPuntuacion(base * alto);

  return {
    sumaGeneral,
    sumaEspecifica: aplicaEspecifica ? sumaEspecifica : null,
    escala,
    minimo,
    maximo,
    gradoMinimo: gradoDePuntuacion(minimo),
    gradoMaximo: gradoDePuntuacion(maximo),
  };
}
