// Maridaje de comida con vino y cerveza — datos curados (orientativos)
//
// El maridaje busca que la bebida y el plato se realcen. Aquí se ofrecen
// sugerencias por tipo de plato; son orientaciones, no reglas: el mejor maridaje
// es el que te gusta. El consumo de alcohol debe ser siempre responsable y de
// adultos. Verificado: 2026-06.

export interface Maridaje {
  id: string;
  plato: string;
  emoji: string;
  vino: string;
  cerveza: string;
  porque: string;
}

export const MARIDAJES: Maridaje[] = [
  { id: 'carne-roja', plato: 'Carnes rojas y asados', emoji: '🥩', vino: 'Tinto con cuerpo (Rioja, Ribera, Malbec)', cerveza: 'Tostada o negra (brown ale, stout)', porque: 'Los taninos del tinto cortan la grasa y aguantan el sabor intenso de la carne.' },
  { id: 'aves', plato: 'Aves y carnes blancas', emoji: '🍗', vino: 'Tinto joven o blanco con cuerpo', cerveza: 'Rubia tipo lager o amber ale', porque: 'Sabores más suaves piden vinos y cervezas que no tapen la carne.' },
  { id: 'pescado', plato: 'Pescado blanco', emoji: '🐟', vino: 'Blanco seco (Albariño, Verdejo)', cerveza: 'Rubia ligera o pilsner', porque: 'La acidez y frescura limpian el paladar sin pisar el sabor delicado.' },
  { id: 'marisco', plato: 'Marisco', emoji: '🦐', vino: 'Blanco fresco o cava brut', cerveza: 'Pilsner o blanca de trigo', porque: 'Las burbujas y la acidez realzan el yodo y el dulzor del marisco.' },
  { id: 'pasta', plato: 'Pasta y pizza', emoji: '🍝', vino: 'Tinto italiano (Chianti) o rosado', cerveza: 'Lager o amber ale', porque: 'La acidez del tinto casa con el tomate; el rosado, con salsas cremosas.' },
  { id: 'picante', plato: 'Comida picante', emoji: '🌶️', vino: 'Blanco semidulce o rosado afrutado', cerveza: 'Rubia muy fría o IPA suave', porque: 'Un toque dulce y mucho frío calman el picante mejor que un tinto potente.' },
  { id: 'queso', plato: 'Tabla de quesos', emoji: '🧀', vino: 'Según el queso: blanco, tinto o dulce', cerveza: 'Trapense o de abadía', porque: 'Quesos curados piden tintos o dulces; frescos, blancos y cervezas suaves.' },
  { id: 'postre', plato: 'Postres', emoji: '🍰', vino: 'Dulce o espumoso (moscatel, cava semi)', cerveza: 'Negra dulce o de frutas', porque: 'El maridaje dulce con dulce evita que el postre apague la bebida.' },
  { id: 'verdura', plato: 'Verduras y ensaladas', emoji: '🥗', vino: 'Blanco seco o rosado', cerveza: 'Blanca de trigo o rubia ligera', porque: 'Frescura con frescura; evita bebidas pesadas que tapen el verde.' },
];

export const MARIDAJE_POR_ID: Record<string, Maridaje> = MARIDAJES.reduce<Record<string, Maridaje>>(
  (acc, m) => { acc[m.id] = m; return acc; }, {});
