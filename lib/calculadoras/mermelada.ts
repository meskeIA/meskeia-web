// Mermelada y confitura — lógica pura
//
// La proporción de azúcar respecto a la fruta define el dulzor, la textura y la
// conservación: más azúcar conserva mejor pero empalaga; menos azúcar necesita
// pectina añadida y dura menos. El zumo de limón aporta acidez y pectina natural,
// que ayudan a que cuaje. El azúcar se calcula sobre el peso de la fruta ya
// limpia. Verificado: 2026-06.

export interface NivelMermelada {
  id: string;
  nombre: string;
  ratioAzucar: number; // g de azúcar por g de fruta
  nota: string;
}

export const NIVELES_MERMELADA: NivelMermelada[] = [
  { id: 'tradicional', nombre: 'Tradicional (1:1)', ratioAzucar: 1, nota: 'Mucho azúcar: cuaja sola y se conserva más. Muy dulce.' },
  { id: 'equilibrada', nombre: 'Equilibrada (1:0,7)', ratioAzucar: 0.7, nota: 'El punto más usado hoy: sabor a fruta sin empalagar.' },
  { id: 'ligera', nombre: 'Ligera (1:0,5)', ratioAzucar: 0.5, nota: 'Poco azúcar: necesita pectina añadida y se conserva menos.' },
];

export const NIVEL_MERMELADA_POR_ID: Record<string, NivelMermelada> = NIVELES_MERMELADA.reduce<
  Record<string, NivelMermelada>
>((acc, n) => { acc[n.id] = n; return acc; }, {});

export interface ResultadoMermelada {
  fruta_g: number;
  azucar_g: number;
  limon_ml: number;
  necesitaPectina: boolean;
}

export function calcularMermelada(nivelId: string, frutaG: number): ResultadoMermelada | null {
  const n = NIVEL_MERMELADA_POR_ID[nivelId];
  if (!n || !(frutaG > 0)) return null;
  return {
    fruta_g: Math.round(frutaG),
    azucar_g: Math.round(frutaG * n.ratioAzucar),
    // ~el zumo de medio limón (≈ 15 ml) por cada 500 g de fruta.
    limon_ml: Math.round((frutaG / 500) * 15),
    necesitaPectina: n.ratioAzucar < 0.6,
  };
}
