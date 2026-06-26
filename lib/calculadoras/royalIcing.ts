// Glaseado real (royal icing) — lógica pura
//
// Glasa de azúcar glas y clara de huevo (o albúmina) que endurece al secar, para
// decorar galletas y montar figuras. La consistencia depende de cuánto azúcar
// lleve por clara: más azúcar = más rígida (contornos); menos = más fluida
// (relleno). 1 clara ≈ 30 g; o 5 g de albúmina + 30 ml de agua. Unas gotas de
// limón ayudan a que monte y blanquee. Verificado: 2026-06.

export const GRAMOS_POR_CLARA = 30;

export interface ConsistenciaIcing {
  id: string;
  nombre: string;
  glasPorClara: number; // g de azúcar glas por clara
  aguaExtra: string;
  nota: string;
}

export const CONSISTENCIAS_ICING: ConsistenciaIcing[] = [
  { id: 'rigida', nombre: 'Rígida — contornos y figuras', glasPorClara: 220, aguaExtra: 'Sin agua extra', nota: 'Mantiene la forma y el pico. Para bordes, letras, flores y pegar piezas.' },
  { id: 'media', nombre: 'Media — bordes que no se caen', glasPorClara: 190, aguaExtra: 'Unas gotas si hace falta', nota: 'El "punto pico blando": versátil para la mayoría de detalles.' },
  { id: 'relleno', nombre: 'Relleno (flood)', glasPorClara: 170, aguaExtra: 'Agua hasta punto 10–15 s', nota: 'Fluida: rellena superficies y se alisa sola. Se mide por segundos en cerrarse.' },
];

export const CONSISTENCIA_ICING_POR_ID: Record<string, ConsistenciaIcing> = CONSISTENCIAS_ICING.reduce<
  Record<string, ConsistenciaIcing>
>((acc, c) => { acc[c.id] = c; return acc; }, {});

export interface ResultadoIcing {
  glas_g: number;
  claras_g: number;
  limonGotas: number;
  aguaExtra: string;
}

export function calcularIcing(consistenciaId: string, numClaras: number): ResultadoIcing | null {
  const c = CONSISTENCIA_ICING_POR_ID[consistenciaId];
  if (!c || !(numClaras > 0)) return null;
  return {
    glas_g: Math.round(numClaras * c.glasPorClara),
    claras_g: Math.round(numClaras * GRAMOS_POR_CLARA),
    limonGotas: Math.max(2, Math.round(numClaras * 3)),
    aguaExtra: c.aguaExtra,
  };
}
