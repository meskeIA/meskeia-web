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

/**
 * Por debajo de esta proporción de azúcar el motor avisa de añadir pectina. La Ligera (0,5) ya
 * avisa. Exportado para que el FAQPage diga el mismo umbral (hallazgo 4646: decía «por debajo
 * del 50 %» y la app avisaba al 50 %).
 */
export const UMBRAL_PECTINA = 0.6;

// La Tradicional no «cuaja sola» con cualquier fruta: el gel lo hacen la acidez y la pectina, y la
// app no pregunta qué fruta es (hallazgo 4647, 14/11/2026).
export const NIVELES_MERMELADA: NivelMermelada[] = [
  { id: 'tradicional', nombre: 'Tradicional (1:1)', ratioAzucar: 1, nota: 'Mucho azúcar: se conserva más y cuaja con facilidad si la fruta tiene pectina. Muy dulce.' },
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
    necesitaPectina: n.ratioAzucar < UMBRAL_PECTINA,
  };
}
