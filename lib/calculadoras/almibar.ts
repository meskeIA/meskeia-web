// Almíbar y sirope — lógica pura
//
// El almíbar es agua y azúcar disueltos. La proporción azúcar:agua define su
// densidad (°Brix) y su uso: ligero para emborrachar bizcochos, medio para
// sorbetes y macerar, denso para cócteles o conservar fruta. El °Brix es el
// porcentaje de azúcar sobre el peso total. (Los puntos de cocción por
// temperatura —hebra, bola, caramelo— están en la calculadora de puntos del
// azúcar.) Verificado: 2026-06.

export interface UsoAlmibar {
  id: string;
  nombre: string;
  azucar: number; // partes
  agua: number; // partes
  nota: string;
}

export const USOS_ALMIBAR: UsoAlmibar[] = [
  { id: 'ligero', nombre: 'Ligero — emborrachar bizcochos', azucar: 1, agua: 2, nota: 'Almíbar fluido para calar bizcochos y babás sin empalagar.' },
  { id: 'medio', nombre: 'Medio — sorbetes y macerar fruta', azucar: 1, agua: 1, nota: 'El más versátil: helados, sorbetes, macedonias y limonadas.' },
  { id: 'denso', nombre: 'Denso — cócteles y conservar', azucar: 2, agua: 1, nota: 'Sirope rico (gomme) para coctelería y para cubrir fruta en conserva.' },
];

export const USO_ALMIBAR_POR_ID: Record<string, UsoAlmibar> = USOS_ALMIBAR.reduce<
  Record<string, UsoAlmibar>
>((acc, u) => { acc[u.id] = u; return acc; }, {});

export interface ResultadoAlmibar {
  azucar_g: number;
  agua_g: number;
  brix: number;
  ratio: string;
}

/**
 * @param azucarPartes partes de azúcar
 * @param aguaPartes partes de agua
 * @param cantidadObjetivo gramos aproximados de almíbar a preparar
 */
export function calcularAlmibar(
  azucarPartes: number,
  aguaPartes: number,
  cantidadObjetivo: number,
): ResultadoAlmibar | null {
  const suma = azucarPartes + aguaPartes;
  if (!(suma > 0) || !(cantidadObjetivo > 0) || !(azucarPartes >= 0) || !(aguaPartes > 0)) return null;
  const azucar_g = (cantidadObjetivo * azucarPartes) / suma;
  const agua_g = (cantidadObjetivo * aguaPartes) / suma;
  const brix = (azucar_g / (azucar_g + agua_g)) * 100;
  return {
    azucar_g: Math.round(azucar_g),
    agua_g: Math.round(agua_g),
    brix: Math.round(brix),
    ratio: `${azucarPartes}:${aguaPartes}`,
  };
}
