// Chocolate y cacao — datos curados
//
// El porcentaje de un chocolate indica la proporción de pasta y manteca de cacao;
// el resto es sobre todo azúcar (y leche en el con leche). A más porcentaje, más
// intenso y menos dulce. Aquí se recogen los tipos habituales y sus usos.
// Verificado: 2026-06.

export interface Chocolate {
  nombre: string;
  emoji: string;
  cacao: string;
  uso: string;
  nota: string;
}

export const CHOCOLATES: Chocolate[] = [
  { nombre: 'Cacao puro 100%', emoji: '🍫', cacao: '100%', uso: 'Intensificar postres; nada dulce.', nota: 'Amargo puro; casi nunca se come solo.' },
  { nombre: 'Negro intenso', emoji: '🍫', cacao: '80–90%', uso: 'Para paladares intensos; ganaches potentes.', nota: 'Muy poco azúcar; sabor profundo y amargo.' },
  { nombre: 'Negro', emoji: '🍫', cacao: '70–75%', uso: 'El más versátil en repostería: ganache, mousse, cobertura.', nota: 'Buen equilibrio entre intensidad y dulzor.' },
  { nombre: 'Negro suave / semiamargo', emoji: '🍫', cacao: '55–65%', uso: 'Galletas con chips, postres menos intensos.', nota: 'Más dulce; gusta a más público.' },
  { nombre: 'Con leche', emoji: '🍫', cacao: '30–40%', uso: 'Tabletas, bombones, repostería dulce.', nota: 'Lleva leche en polvo; cremoso y dulce.' },
  { nombre: 'Blanco', emoji: '🤍', cacao: '0% pasta (solo manteca)', uso: 'Coberturas, ganache blanca, decoración.', nota: 'No lleva pasta de cacao, solo manteca, leche y azúcar.' },
  { nombre: 'De cobertura', emoji: '🍫', cacao: 'Variable, alta manteca', uso: 'Atemperar para bombones y bañar; brillo y "crac".', nota: 'Más manteca de cacao: más fluido al fundir.' },
  { nombre: 'Cacao en polvo natural', emoji: '🥣', cacao: 'Desgrasado, ácido', uso: 'Bizcochos con levadura química; sabor afrutado.', nota: 'Ácido; reacciona con el bicarbonato.' },
  { nombre: 'Cacao alcalinizado (dutch)', emoji: '🥣', cacao: 'Desgrasado, neutro', uso: 'Color oscuro y sabor suave; bebidas.', nota: 'Tratado para reducir acidez; más oscuro.' },
  { nombre: 'Nibs de cacao', emoji: '🫘', cacao: 'Grano troceado', uso: 'Toque crujiente y amargo en postres.', nota: 'Cacao puro en trozos; sin azúcar.' },
];
