// El huevo perfecto — lógica pura
//
// El tiempo de cocción de un huevo se cuenta desde que el agua hierve y depende
// del punto que busques, del tamaño del huevo y de si está a temperatura ambiente
// o recién sacado de la nevera (el frío añade tiempo). Verificado: 2026-06.

export interface PuntoHuevo {
  id: string;
  nombre: string;
  baseMin: number; // minutos para huevo M a temperatura ambiente
  descripcion: string;
}

export const PUNTOS_HUEVO: PuntoHuevo[] = [
  { id: 'pasado', nombre: 'Pasado por agua', baseMin: 4, descripcion: 'Clara apenas cuajada, yema líquida.' },
  { id: 'mollet', nombre: 'Mollet', baseMin: 6, descripcion: 'Clara firme, yema cremosa y brillante.' },
  { id: 'tierno', nombre: 'Duro de yema tierna', baseMin: 8, descripcion: 'Yema cuajada pero jugosa, aún anaranjada.' },
  { id: 'duro', nombre: 'Duro', baseMin: 11, descripcion: 'Yema totalmente cuajada y firme.' },
];

export const PUNTO_HUEVO_POR_ID: Record<string, PuntoHuevo> = PUNTOS_HUEVO.reduce<
  Record<string, PuntoHuevo>
>((acc, p) => { acc[p.id] = p; return acc; }, {});

// Ajuste por tamaño (minutos respecto al M).
export const TAMANOS_HUEVO: { id: string; nombre: string; ajuste: number }[] = [
  { id: 's', nombre: 'Pequeño (S)', ajuste: -0.5 },
  { id: 'm', nombre: 'Mediano (M)', ajuste: 0 },
  { id: 'l', nombre: 'Grande (L)', ajuste: 0.5 },
  { id: 'xl', nombre: 'Extra grande (XL)', ajuste: 1 },
];

export interface ResultadoHuevo {
  tiempoMin: number;
  descripcion: string;
}

export function calcularHuevo(
  puntoId: string,
  tamanoId: string,
  desdeNevera: boolean,
): ResultadoHuevo | null {
  const p = PUNTO_HUEVO_POR_ID[puntoId];
  const t = TAMANOS_HUEVO.find((x) => x.id === tamanoId);
  if (!p || !t) return null;
  const tiempo = p.baseMin + t.ajuste + (desdeNevera ? 1 : 0);
  return {
    tiempoMin: Math.round(tiempo * 2) / 2, // medio minuto
    descripcion: p.descripcion,
  };
}
