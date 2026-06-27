// Fermentados vegetales (lacto-fermentación) — lógica pura
//
// En la lacto-fermentación, la sal crea un entorno donde prosperan las bacterias
// lácticas buenas y se frenan las dañinas. La cantidad de sal es la clave de la
// seguridad: poca sal es arriesgado, demasiada frena la fermentación. Hay dos
// métodos: en seco (la sal se mezcla con la verdura rallada, como el chucrut) y en
// salmuera (la verdura se sumerge en agua salada, como pepinillos o kimchi).
// Verificado: 2026-06.

export interface MetodoFermento {
  id: string;
  nombre: string;
  emoji: string;
  // % de sal: en seco, sobre el peso de la verdura; en salmuera, sobre el agua.
  porcentaje: number;
  sobre: 'verdura' | 'agua';
  ejemplo: string;
  nota: string;
}

export const METODOS_FERMENTO: MetodoFermento[] = [
  { id: 'seco', nombre: 'En seco (chucrut)', emoji: '🥬', porcentaje: 2, sobre: 'verdura', ejemplo: 'Chucrut, kimchi de col rallada', nota: 'Mezcla la sal con la verdura rallada y masajea hasta que suelte su propio jugo, que la debe cubrir.' },
  { id: 'salmuera', nombre: 'En salmuera', emoji: '🥒', porcentaje: 3, sobre: 'agua', ejemplo: 'Pepinillos, zanahoria, judía verde', nota: 'Sumerge la verdura entera o en trozos en agua con sal; mantenla bajo el líquido con un peso.' },
];

export const METODO_FERMENTO_POR_ID: Record<string, MetodoFermento> = METODOS_FERMENTO.reduce<
  Record<string, MetodoFermento>
>((acc, m) => { acc[m.id] = m; return acc; }, {});

export interface ResultadoFermento {
  sal_g: number;
  sobre: 'verdura' | 'agua';
  porcentaje: number;
}

/**
 * @param pesoG peso de la verdura (método seco) o del agua (método salmuera)
 */
export function calcularFermento(metodoId: string, pesoG: number): ResultadoFermento | null {
  const m = METODO_FERMENTO_POR_ID[metodoId];
  if (!m || !(pesoG > 0)) return null;
  return {
    sal_g: Math.round((pesoG * m.porcentaje) / 100 * 10) / 10,
    sobre: m.sobre,
    porcentaje: m.porcentaje,
  };
}
