// Tubérculos y raíces de Latinoamérica — datos curados
//
// Más allá de la patata, América aporta una gran despensa de tubérculos y raíces
// con texturas y usos propios. Aquí se recogen los más habituales con su origen,
// su carácter y su uso. Importante: la yuca (mandioca) se consume SIEMPRE cocida;
// cruda contiene compuestos que liberan cianuro. Verificado: 2026-06.

export interface Tuberculo {
  nombre: string;
  emoji: string;
  origen: string;
  caracter: string;
  uso: string;
  nota: string;
}

export const TUBERCULOS: Tuberculo[] = [
  { nombre: 'Yuca / mandioca', emoji: '🥔', origen: 'Amazonía', caracter: 'Almidonosa, fibrosa, sabor neutro', uso: 'Hervida, frita, en puré, casabe y harina (tapioca).', nota: 'Cómela siempre cocida; cruda es tóxica. Retira la fibra central.' },
  { nombre: 'Batata / boniato / camote', emoji: '🍠', origen: 'América tropical', caracter: 'Dulce, suave, anaranjada o blanca', uso: 'Asada, en puré, frita, en dulces.', nota: 'Más dulce que la patata; combina bien con especias.' },
  { nombre: 'Malanga / yautía', emoji: '🥔', origen: 'Caribe / trópico', caracter: 'Cremosa, terrosa', uso: 'Sopas, sancochos, frituras, purés.', nota: 'Espesa caldos; pélala bajo el grifo, su savia irrita.' },
  { nombre: 'Ñame', emoji: '🥔', origen: 'África y América', caracter: 'Firme, almidonosa', uso: 'Hervido, en puré, en guisos.', nota: 'No confundir con el boniato; piel rugosa y gran tamaño.' },
  { nombre: 'Papa andina (papas nativas)', emoji: '🥔', origen: 'Andes', caracter: 'Muchísimas variedades y colores', uso: 'Hervidas, en causa, papa a la huancaína.', nota: 'Cuna de la patata: miles de variedades autóctonas.' },
  { nombre: 'Oca', emoji: '🥔', origen: 'Andes', caracter: 'Pequeña, dulce-ácida al sol', uso: 'Hervida o asada; se asolea para endulzar.', nota: 'Colores vivos; muy popular en Perú y Bolivia.' },
  { nombre: 'Olluco / melloco', emoji: '🥔', origen: 'Andes', caracter: 'Crujiente, mucilaginoso', uso: 'Guisos (olluquito), ensaladas.', nota: 'Mantiene su textura firme tras la cocción.' },
  { nombre: 'Jícama', emoji: '🥗', origen: 'México', caracter: 'Crujiente, jugosa, ligeramente dulce', uso: 'Cruda en ensaladas y con chile y limón.', nota: 'Se come cruda; refrescante. Solo el bulbo es comestible.' },
  { nombre: 'Plátano macho (verde)', emoji: '🍌', origen: 'Trópico', caracter: 'Almidonoso, nada dulce en verde', uso: 'Tostones, patacones, mofongo; maduro, frito dulce.', nota: 'Se cocina como un tubérculo aunque sea fruta.' },
];
