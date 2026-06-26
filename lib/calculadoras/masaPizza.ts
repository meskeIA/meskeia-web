// Calculadora de masa de pizza — lógica pura (porcentaje del panadero)
//
// Todo se calcula sobre el peso de la harina (100%). El peso total de masa se
// reparte entre harina, agua, sal, levadura y aceite según sus porcentajes.
// Los estilos traen porcentajes y peso de bola típicos como punto de partida.
// Verificado: 2026-06.

export interface EstiloPizza {
  id: string;
  nombre: string;
  descripcion: string;
  pesoBola: number; // g por bola
  hidratacion: number; // % sobre harina
  sal: number; // %
  levadura: number; // % (levadura seca)
  aceite: number; // %
}

export const ESTILOS_PIZZA: EstiloPizza[] = [
  {
    id: 'napolitana',
    nombre: 'Napolitana',
    descripcion: 'Borde alto y aireado, horno muy caliente. Sin aceite, hidratación media.',
    pesoBola: 250,
    hidratacion: 62,
    sal: 2.8,
    levadura: 0.3,
    aceite: 0,
  },
  {
    id: 'romana',
    nombre: 'Romana fina',
    descripcion: 'Base crujiente y muy fina, estirada con rodillo. Lleva algo de aceite.',
    pesoBola: 200,
    hidratacion: 58,
    sal: 2.5,
    levadura: 0.4,
    aceite: 3,
  },
  {
    id: 'americana',
    nombre: 'Americana (NY)',
    descripcion: 'Masa flexible que se dobla, base media. Aceite y un punto de azúcar opcional.',
    pesoBola: 280,
    hidratacion: 63,
    sal: 2,
    levadura: 0.5,
    aceite: 3,
  },
  {
    id: 'pan',
    nombre: 'Al estilo pan / focaccia',
    descripcion: 'Muy hidratada y esponjosa, en molde. Generosa en aceite.',
    pesoBola: 350,
    hidratacion: 75,
    sal: 2.2,
    levadura: 0.6,
    aceite: 4,
  },
];

export const ESTILO_POR_ID: Record<string, EstiloPizza> = ESTILOS_PIZZA.reduce<
  Record<string, EstiloPizza>
>((acc, e) => {
  acc[e.id] = e;
  return acc;
}, {});

export interface IngredienteMasa {
  nombre: string;
  gramos: number;
  porcentaje: number; // sobre harina (100% = harina)
}

export interface ResultadoMasaPizza {
  numBolas: number;
  pesoBola: number;
  pesoTotal: number;
  harina: number;
  ingredientes: IngredienteMasa[];
}

export interface ParametrosMasa {
  numBolas: number;
  pesoBola: number;
  hidratacion: number;
  sal: number;
  levadura: number;
  aceite: number;
}

/**
 * Calcula los gramos de cada ingrediente a partir del número de bolas, su peso y
 * los porcentajes del panadero. La harina se obtiene despejando el total.
 */
export function calcularMasaPizza(p: ParametrosMasa): ResultadoMasaPizza | null {
  if (!(p.numBolas > 0) || !(p.pesoBola > 0)) return null;

  const pesoTotal = p.numBolas * p.pesoBola;
  // total = harina × (1 + hid + sal + lev + aceite) / 100… con harina = 100%.
  const sumaPct = 100 + p.hidratacion + p.sal + p.levadura + p.aceite;
  const harina = (pesoTotal * 100) / sumaPct;

  const mk = (nombre: string, pct: number): IngredienteMasa => ({
    nombre,
    porcentaje: pct,
    gramos: Math.round((harina * pct) / 100 * 10) / 10,
  });

  const ingredientes: IngredienteMasa[] = [
    { nombre: 'Harina', porcentaje: 100, gramos: Math.round(harina) },
    mk('Agua', p.hidratacion),
    mk('Sal', p.sal),
    mk('Levadura seca', p.levadura),
  ];
  if (p.aceite > 0) ingredientes.push(mk('Aceite de oliva', p.aceite));

  return {
    numBolas: p.numBolas,
    pesoBola: p.pesoBola,
    pesoTotal,
    harina: Math.round(harina),
    ingredientes,
  };
}
