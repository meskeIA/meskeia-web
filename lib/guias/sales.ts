// Tipos de sal — datos curados
//
// Casi toda la sal es cloruro sódico; lo que cambia es el tamaño del cristal, la
// textura, los minerales y el momento de uso. Aquí se recogen las sales más
// habituales con su textura y su mejor uso en cocina. Verificado: 2026-06.

export interface Sal {
  nombre: string;
  emoji: string;
  textura: string;
  uso: string;
  nota: string;
}

export const SALES: Sal[] = [
  { nombre: 'Sal fina de mesa', emoji: '🧂', textura: 'Grano muy fino', uso: 'Cocinar y sazonar en general; salar el agua.', nota: 'Suele llevar antiaglomerante; a veces yodada.' },
  { nombre: 'Sal gorda / gruesa', emoji: '🧂', textura: 'Cristal grueso', uso: 'Salar a la sal (pescados, carnes), agua de cocción.', nota: 'Se disuelve más lento; ideal para costras.' },
  { nombre: 'Sal marina', emoji: '🌊', textura: 'Fina o gruesa', uso: 'Uso general; aporta minerales marinos.', nota: 'Procede de la evaporación del agua de mar.' },
  { nombre: 'Flor de sal', emoji: '✨', textura: 'Escamas finas y frágiles', uso: 'Acabado: se añade al final sobre el plato.', nota: 'Cristaliza en la superficie de las salinas; delicada.' },
  { nombre: 'Sal en escamas (tipo Maldon)', emoji: '❄️', textura: 'Escamas crujientes', uso: 'Toque final; aporta textura y crujido.', nota: 'Se deshace en la boca; muy usada en alta cocina.' },
  { nombre: 'Sal rosa del Himalaya', emoji: '🌸', textura: 'Cristal rosado', uso: 'Uso general y acabado; decorativa.', nota: 'Su color viene de trazas de hierro; sabor muy similar a la marina.' },
  { nombre: 'Sal negra (kala namak)', emoji: '🖤', textura: 'Fina, gris rosácea', uso: 'Cocina india; da sabor a "huevo" a platos veganos.', nota: 'Azufrada; aroma característico muy potente.' },
  { nombre: 'Sal ahumada', emoji: '🔥', textura: 'Fina o en escamas', uso: 'Aporta humo a carnes, verduras y salsas.', nota: 'Ahumada con maderas; intensa, úsala con tino.' },
  { nombre: 'Sal yodada', emoji: '🧂', textura: 'Fina', uso: 'Uso general con aporte de yodo.', nota: 'Enriquecida con yodo por motivos de salud pública.' },
];
