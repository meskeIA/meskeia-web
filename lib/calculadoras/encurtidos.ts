// Encurtidos rápidos en nevera — lógica pura
//
// Un encurtido rápido es verdura cubierta con un líquido de vinagre, agua, sal y
// algo de azúcar, que se guarda en la nevera. La proporción vinagre:agua define lo
// ácido, y la sal y el azúcar, el equilibrio. El vinagre debe tener al menos un 5%
// de acidez. Estos encurtidos de nevera duran semanas; no son conservas estériles
// de larga duración. Verificado: 2026-06.

export interface EstiloEncurtido {
  id: string;
  nombre: string;
  vinagre: number; // partes
  agua: number; // partes
  salPorLitro: number; // g por litro de líquido total
  azucarPorLitro: number; // g por litro
  nota: string;
}

export const ESTILOS_ENCURTIDO: EstiloEncurtido[] = [
  { id: 'agridulce', nombre: 'Agridulce clásico', vinagre: 1, agua: 1, salPorLitro: 30, azucarPorLitro: 50, nota: 'El equilibrio de uso general para pepinillos, cebolla y zanahoria.' },
  { id: 'acido', nombre: 'Ácido (más vinagre)', vinagre: 2, agua: 1, salPorLitro: 30, azucarPorLitro: 20, nota: 'Más punzante y de conservación algo mayor.' },
  { id: 'dulce', nombre: 'Dulce (agridulce americano)', vinagre: 1, agua: 1, salPorLitro: 25, azucarPorLitro: 120, nota: 'Muy dulce, típico de los pepinillos americanos.' },
];

export const ESTILO_ENCURTIDO_POR_ID: Record<string, EstiloEncurtido> = ESTILOS_ENCURTIDO.reduce<
  Record<string, EstiloEncurtido>
>((acc, e) => { acc[e.id] = e; return acc; }, {});

export interface ResultadoEncurtido {
  vinagre_ml: number;
  agua_ml: number;
  sal_g: number;
  azucar_g: number;
}

export function calcularEncurtido(estiloId: string, totalMl: number): ResultadoEncurtido | null {
  const e = ESTILO_ENCURTIDO_POR_ID[estiloId];
  if (!e || !(totalMl > 0)) return null;
  const suma = e.vinagre + e.agua;
  const litros = totalMl / 1000;
  return {
    vinagre_ml: Math.round((totalMl * e.vinagre) / suma),
    agua_ml: Math.round((totalMl * e.agua) / suma),
    sal_g: Math.round(e.salPorLitro * litros),
    azucar_g: Math.round(e.azucarPorLitro * litros),
  };
}
