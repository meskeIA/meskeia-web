// Azúcares y endulzantes — datos curados
//
// Más allá del azúcar blanco hay muchas formas de endulzar, cada una con su sabor,
// humedad y poder endulzante. Aquí se recogen las más habituales clasificadas en
// azúcares (de caña/remolacha), endulzantes naturales líquidos y edulcorantes.
// Verificado: 2026-06.

export type TipoAzucar = 'azucar' | 'natural' | 'edulcorante';

export const ETIQUETA_TIPO_AZUCAR: Record<TipoAzucar, string> = {
  azucar: 'Azúcar', natural: 'Endulzante natural', edulcorante: 'Edulcorante',
};

export interface Azucar {
  nombre: string;
  emoji: string;
  tipo: TipoAzucar;
  poder: string; // poder endulzante relativo al azúcar
  uso: string;
  nota: string;
}

export const AZUCARES: Azucar[] = [
  { nombre: 'Azúcar blanco (sacarosa)', emoji: '🍬', tipo: 'azucar', poder: '1× (referencia)', uso: 'Uso general en repostería y bebidas.', nota: 'Refinado; neutro y limpio de sabor.' },
  { nombre: 'Azúcar moreno', emoji: '🟤', tipo: 'azucar', poder: '~1×', uso: 'Galletas, bizcochos con sabor a melaza.', nota: 'Lleva melaza: más húmedo y aromático.' },
  { nombre: 'Azúcar glas (impalpable)', emoji: '❄️', tipo: 'azucar', poder: '~1×', uso: 'Glaseados, decorar, merengues lisos.', nota: 'Molido fino con algo de almidón.' },
  { nombre: 'Panela / piloncillo', emoji: '🟫', tipo: 'azucar', poder: '~0,9×', uso: 'Dulces latinoamericanos, infusiones.', nota: 'Jugo de caña sin refinar; muy aromático.' },
  { nombre: 'Miel', emoji: '🍯', tipo: 'natural', poder: '~1,2×', uso: 'Repostería húmeda, salsas, infusiones.', nota: 'Líquida: reduce otros líquidos y baja el horno.' },
  { nombre: 'Sirope de arce', emoji: '🍁', tipo: 'natural', poder: '~1×', uso: 'Tortitas, glaseados, repostería.', nota: 'Sabor característico; líquido.' },
  { nombre: 'Sirope de agave', emoji: '🌵', tipo: 'natural', poder: '~1,3×', uso: 'Endulzar bebidas y postres.', nota: 'Muy dulce y de bajo índice glucémico aparente.' },
  { nombre: 'Melaza', emoji: '🫙', tipo: 'natural', poder: '~0,7×', uso: 'Pan de jengibre, salsas oscuras.', nota: 'Subproducto de la caña; sabor intenso y amargo.' },
  { nombre: 'Azúcar invertido', emoji: '🧪', tipo: 'azucar', poder: '~1,25×', uso: 'Heladería y bollería: más jugosidad.', nota: 'Evita cristalización y reseca menos.' },
  { nombre: 'Eritritol', emoji: '⚪', tipo: 'edulcorante', poder: '~0,7×', uso: 'Reducir azúcar; no carameliza igual.', nota: 'Polialcohol; apenas aporta calorías.' },
  { nombre: 'Estevia', emoji: '🌿', tipo: 'edulcorante', poder: '200–300×', uso: 'Endulzar con muy poca cantidad.', nota: 'De origen vegetal; deja un punto regaliz.' },
  { nombre: 'Sucralosa', emoji: '⚪', tipo: 'edulcorante', poder: '~600×', uso: 'Bebidas y postres sin azúcar.', nota: 'Edulcorante intenso; estable al calor.' },
];
