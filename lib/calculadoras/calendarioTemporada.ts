// Calendario de frutas y verduras de temporada — datos curados
//
// Comer de temporada es más sabroso, barato y sostenible. Este calendario está
// pensado para el hemisferio norte (España y latitudes similares); en el hemisferio
// sur las estaciones van al revés. Son referencias orientativas: el clima y la zona
// adelantan o retrasan cada producto. Verificado: 2026-06.

export interface MesTemporada {
  id: number;
  nombre: string;
  frutas: string[];
  verduras: string[];
}

export const MESES_TEMPORADA: MesTemporada[] = [
  { id: 1, nombre: 'Enero', frutas: ['Naranja', 'Mandarina', 'Pomelo', 'Kiwi', 'Manzana', 'Pera'], verduras: ['Alcachofa', 'Acelga', 'Brócoli', 'Coliflor', 'Puerro', 'Col', 'Espinaca'] },
  { id: 2, nombre: 'Febrero', frutas: ['Naranja', 'Mandarina', 'Kiwi', 'Manzana', 'Plátano'], verduras: ['Alcachofa', 'Acelga', 'Brócoli', 'Coliflor', 'Puerro', 'Espinaca', 'Guisante'] },
  { id: 3, nombre: 'Marzo', frutas: ['Naranja', 'Fresa', 'Kiwi', 'Manzana'], verduras: ['Alcachofa', 'Acelga', 'Espárrago', 'Guisante', 'Habas', 'Espinaca', 'Rábano'] },
  { id: 4, nombre: 'Abril', frutas: ['Fresa', 'Níspero', 'Naranja', 'Plátano'], verduras: ['Espárrago', 'Guisante', 'Habas', 'Acelga', 'Ajo tierno', 'Rábano', 'Lechuga'] },
  { id: 5, nombre: 'Mayo', frutas: ['Fresa', 'Níspero', 'Cereza', 'Albaricoque'], verduras: ['Espárrago', 'Guisante', 'Habas', 'Pepino', 'Calabacín', 'Lechuga', 'Acelga'] },
  { id: 6, nombre: 'Junio', frutas: ['Cereza', 'Albaricoque', 'Melocotón', 'Ciruela', 'Sandía'], verduras: ['Calabacín', 'Pepino', 'Pimiento', 'Tomate', 'Judía verde', 'Berenjena'] },
  { id: 7, nombre: 'Julio', frutas: ['Melocotón', 'Sandía', 'Melón', 'Ciruela', 'Higo', 'Nectarina'], verduras: ['Tomate', 'Pimiento', 'Berenjena', 'Calabacín', 'Judía verde', 'Pepino', 'Maíz'] },
  { id: 8, nombre: 'Agosto', frutas: ['Melón', 'Sandía', 'Higo', 'Melocotón', 'Uva', 'Ciruela'], verduras: ['Tomate', 'Pimiento', 'Berenjena', 'Calabacín', 'Judía verde', 'Maíz'] },
  { id: 9, nombre: 'Septiembre', frutas: ['Uva', 'Higo', 'Granada', 'Membrillo', 'Melón', 'Pera'], verduras: ['Tomate', 'Pimiento', 'Berenjena', 'Calabaza', 'Acelga', 'Brócoli'] },
  { id: 10, nombre: 'Octubre', frutas: ['Granada', 'Membrillo', 'Caqui', 'Uva', 'Mandarina', 'Manzana'], verduras: ['Calabaza', 'Acelga', 'Brócoli', 'Coliflor', 'Espinaca', 'Puerro', 'Boniato'] },
  { id: 11, nombre: 'Noviembre', frutas: ['Caqui', 'Mandarina', 'Naranja', 'Kiwi', 'Granada', 'Chirimoya'], verduras: ['Calabaza', 'Brócoli', 'Coliflor', 'Acelga', 'Puerro', 'Alcachofa', 'Espinaca'] },
  { id: 12, nombre: 'Diciembre', frutas: ['Naranja', 'Mandarina', 'Kiwi', 'Chirimoya', 'Caqui', 'Pomelo'], verduras: ['Alcachofa', 'Brócoli', 'Coliflor', 'Acelga', 'Puerro', 'Col', 'Cardo'] },
];

export const MES_TEMPORADA_POR_ID: Record<number, MesTemporada> = MESES_TEMPORADA.reduce<
  Record<number, MesTemporada>
>((acc, m) => { acc[m.id] = m; return acc; }, {});
