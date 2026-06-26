// Merengue — lógica pura
//
// El merengue es claras de huevo montadas con azúcar. La proporción habitual es
// 1:2 en peso (el doble de azúcar que de claras) para un merengue firme. Hay tres
// tipos: francés (claras y azúcar en crudo), suizo (calentado al baño maría) e
// italiano (con almíbar a 118 °C vertido sobre las claras). 1 clara ≈ 33 g.
// Verificado: 2026-06.

export const GRAMOS_POR_CLARA = 33;

export interface TipoMerengue {
  id: string;
  nombre: string;
  ratioAzucar: number; // gramos de azúcar por gramo de clara
  llevaAlmibar: boolean;
  nota: string;
}

export const TIPOS_MERENGUE: TipoMerengue[] = [
  { id: 'frances', nombre: 'Francés (en crudo)', ratioAzucar: 2, llevaAlmibar: false, nota: 'El más sencillo. Para hornear: merengues secos, suspiros, base de macarons.' },
  { id: 'suizo', nombre: 'Suizo (al baño maría)', ratioAzucar: 2, llevaAlmibar: false, nota: 'Claras y azúcar calentados a 50–55 °C antes de montar. Denso y brillante, para coberturas.' },
  { id: 'italiano', nombre: 'Italiano (con almíbar)', ratioAzucar: 2, llevaAlmibar: true, nota: 'Almíbar a 118 °C vertido sobre las claras. El más estable: mousses, tartas, decoración.' },
];

export const TIPO_MERENGUE_POR_ID: Record<string, TipoMerengue> = TIPOS_MERENGUE.reduce<
  Record<string, TipoMerengue>
>((acc, t) => { acc[t.id] = t; return acc; }, {});

export interface ResultadoMerengue {
  claras_g: number;
  azucar_g: number;
  // Solo para el italiano: agua del almíbar (~25% del peso del azúcar).
  aguaAlmibar_g: number | null;
  cremaTartaro_g: number; // estabilizante opcional (~0,5 g por clara)
}

export function calcularMerengue(
  tipoId: string,
  numClaras: number,
): ResultadoMerengue | null {
  const tipo = TIPO_MERENGUE_POR_ID[tipoId];
  if (!tipo || !(numClaras > 0)) return null;
  const claras_g = numClaras * GRAMOS_POR_CLARA;
  const azucar_g = claras_g * tipo.ratioAzucar;
  return {
    claras_g: Math.round(claras_g),
    azucar_g: Math.round(azucar_g),
    aguaAlmibar_g: tipo.llevaAlmibar ? Math.round(azucar_g * 0.25) : null,
    cremaTartaro_g: Math.round(numClaras * 0.5 * 10) / 10,
  };
}
