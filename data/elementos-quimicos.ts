/**
 * Tabla periódica — datos para quiz de símbolos químicos
 * 85 elementos con nombre en español, símbolo y número atómico.
 * Categoría: 'comun' | 'conocido' | 'avanzado'
 */

export interface Elemento {
  simbolo: string;
  nombre: string;     // nombre en español
  z: number;          // número atómico
  categoria: 'comun' | 'conocido' | 'avanzado';
  grupo?: string;     // grupo de la tabla periódica (orientativo)
}

export const ELEMENTOS: Elemento[] = [
  // ── Comunes (presentes en nivel Fácil) ───────────────────────────────
  { simbolo: 'H',  nombre: 'Hidrógeno',  z: 1,   categoria: 'comun',    grupo: 'No metal' },
  { simbolo: 'He', nombre: 'Helio',      z: 2,   categoria: 'comun',    grupo: 'Gas noble' },
  { simbolo: 'C',  nombre: 'Carbono',    z: 6,   categoria: 'comun',    grupo: 'No metal' },
  { simbolo: 'N',  nombre: 'Nitrógeno',  z: 7,   categoria: 'comun',    grupo: 'No metal' },
  { simbolo: 'O',  nombre: 'Oxígeno',    z: 8,   categoria: 'comun',    grupo: 'No metal' },
  { simbolo: 'F',  nombre: 'Flúor',      z: 9,   categoria: 'comun',    grupo: 'Halógeno' },
  { simbolo: 'Ne', nombre: 'Neón',       z: 10,  categoria: 'comun',    grupo: 'Gas noble' },
  { simbolo: 'Na', nombre: 'Sodio',      z: 11,  categoria: 'comun',    grupo: 'Metal alcalino' },
  { simbolo: 'Mg', nombre: 'Magnesio',   z: 12,  categoria: 'comun',    grupo: 'Metal alcalinotérreo' },
  { simbolo: 'Al', nombre: 'Aluminio',   z: 13,  categoria: 'comun',    grupo: 'Metal' },
  { simbolo: 'Si', nombre: 'Silicio',    z: 14,  categoria: 'comun',    grupo: 'Metaloide' },
  { simbolo: 'P',  nombre: 'Fósforo',    z: 15,  categoria: 'comun',    grupo: 'No metal' },
  { simbolo: 'S',  nombre: 'Azufre',     z: 16,  categoria: 'comun',    grupo: 'No metal' },
  { simbolo: 'Cl', nombre: 'Cloro',      z: 17,  categoria: 'comun',    grupo: 'Halógeno' },
  { simbolo: 'Ar', nombre: 'Argón',      z: 18,  categoria: 'comun',    grupo: 'Gas noble' },
  { simbolo: 'K',  nombre: 'Potasio',    z: 19,  categoria: 'comun',    grupo: 'Metal alcalino' },
  { simbolo: 'Ca', nombre: 'Calcio',     z: 20,  categoria: 'comun',    grupo: 'Metal alcalinotérreo' },
  { simbolo: 'Fe', nombre: 'Hierro',     z: 26,  categoria: 'comun',    grupo: 'Metal de transición' },
  { simbolo: 'Cu', nombre: 'Cobre',      z: 29,  categoria: 'comun',    grupo: 'Metal de transición' },
  { simbolo: 'Zn', nombre: 'Zinc',       z: 30,  categoria: 'comun',    grupo: 'Metal de transición' },
  { simbolo: 'Br', nombre: 'Bromo',      z: 35,  categoria: 'comun',    grupo: 'Halógeno' },
  { simbolo: 'Ag', nombre: 'Plata',      z: 47,  categoria: 'comun',    grupo: 'Metal de transición' },
  { simbolo: 'I',  nombre: 'Yodo',       z: 53,  categoria: 'comun',    grupo: 'Halógeno' },
  { simbolo: 'Au', nombre: 'Oro',        z: 79,  categoria: 'comun',    grupo: 'Metal de transición' },
  { simbolo: 'Hg', nombre: 'Mercurio',   z: 80,  categoria: 'comun',    grupo: 'Metal de transición' },
  { simbolo: 'Pb', nombre: 'Plomo',      z: 82,  categoria: 'comun',    grupo: 'Metal' },

  // ── Conocidos (nivel Medio) ─────────────────────────────────────────
  { simbolo: 'Li', nombre: 'Litio',      z: 3,   categoria: 'conocido', grupo: 'Metal alcalino' },
  { simbolo: 'Be', nombre: 'Berilio',    z: 4,   categoria: 'conocido', grupo: 'Metal alcalinotérreo' },
  { simbolo: 'B',  nombre: 'Boro',       z: 5,   categoria: 'conocido', grupo: 'Metaloide' },
  { simbolo: 'Ti', nombre: 'Titanio',    z: 22,  categoria: 'conocido', grupo: 'Metal de transición' },
  { simbolo: 'V',  nombre: 'Vanadio',    z: 23,  categoria: 'conocido', grupo: 'Metal de transición' },
  { simbolo: 'Cr', nombre: 'Cromo',      z: 24,  categoria: 'conocido', grupo: 'Metal de transición' },
  { simbolo: 'Mn', nombre: 'Manganeso',  z: 25,  categoria: 'conocido', grupo: 'Metal de transición' },
  { simbolo: 'Co', nombre: 'Cobalto',    z: 27,  categoria: 'conocido', grupo: 'Metal de transición' },
  { simbolo: 'Ni', nombre: 'Níquel',     z: 28,  categoria: 'conocido', grupo: 'Metal de transición' },
  { simbolo: 'Ga', nombre: 'Galio',      z: 31,  categoria: 'conocido', grupo: 'Metal' },
  { simbolo: 'Ge', nombre: 'Germanio',   z: 32,  categoria: 'conocido', grupo: 'Metaloide' },
  { simbolo: 'As', nombre: 'Arsénico',   z: 33,  categoria: 'conocido', grupo: 'Metaloide' },
  { simbolo: 'Se', nombre: 'Selenio',    z: 34,  categoria: 'conocido', grupo: 'No metal' },
  { simbolo: 'Kr', nombre: 'Kriptón',    z: 36,  categoria: 'conocido', grupo: 'Gas noble' },
  { simbolo: 'Rb', nombre: 'Rubidio',    z: 37,  categoria: 'conocido', grupo: 'Metal alcalino' },
  { simbolo: 'Sr', nombre: 'Estroncio',  z: 38,  categoria: 'conocido', grupo: 'Metal alcalinotérreo' },
  { simbolo: 'Mo', nombre: 'Molibdeno',  z: 42,  categoria: 'conocido', grupo: 'Metal de transición' },
  { simbolo: 'Pd', nombre: 'Paladio',    z: 46,  categoria: 'conocido', grupo: 'Metal de transición' },
  { simbolo: 'Cd', nombre: 'Cadmio',     z: 48,  categoria: 'conocido', grupo: 'Metal de transición' },
  { simbolo: 'Sn', nombre: 'Estaño',     z: 50,  categoria: 'conocido', grupo: 'Metal' },
  { simbolo: 'Sb', nombre: 'Antimonio',  z: 51,  categoria: 'conocido', grupo: 'Metaloide' },
  { simbolo: 'Te', nombre: 'Telurio',    z: 52,  categoria: 'conocido', grupo: 'Metaloide' },
  { simbolo: 'Xe', nombre: 'Xenón',      z: 54,  categoria: 'conocido', grupo: 'Gas noble' },
  { simbolo: 'Cs', nombre: 'Cesio',      z: 55,  categoria: 'conocido', grupo: 'Metal alcalino' },
  { simbolo: 'Ba', nombre: 'Bario',      z: 56,  categoria: 'conocido', grupo: 'Metal alcalinotérreo' },
  { simbolo: 'W',  nombre: 'Wolframio',  z: 74,  categoria: 'conocido', grupo: 'Metal de transición' },
  { simbolo: 'Pt', nombre: 'Platino',    z: 78,  categoria: 'conocido', grupo: 'Metal de transición' },
  { simbolo: 'Bi', nombre: 'Bismuto',    z: 83,  categoria: 'conocido', grupo: 'Metal' },
  { simbolo: 'U',  nombre: 'Uranio',     z: 92,  categoria: 'conocido', grupo: 'Actínido' },

  // ── Avanzados (nivel Difícil) ────────────────────────────────────────
  { simbolo: 'Sc', nombre: 'Escandio',   z: 21,  categoria: 'avanzado', grupo: 'Metal de transición' },
  { simbolo: 'Y',  nombre: 'Itrio',      z: 39,  categoria: 'avanzado', grupo: 'Metal de transición' },
  { simbolo: 'Zr', nombre: 'Circonio',   z: 40,  categoria: 'avanzado', grupo: 'Metal de transición' },
  { simbolo: 'Nb', nombre: 'Niobio',     z: 41,  categoria: 'avanzado', grupo: 'Metal de transición' },
  { simbolo: 'Tc', nombre: 'Tecnecio',   z: 43,  categoria: 'avanzado', grupo: 'Metal de transición' },
  { simbolo: 'Ru', nombre: 'Rutenio',    z: 44,  categoria: 'avanzado', grupo: 'Metal de transición' },
  { simbolo: 'Rh', nombre: 'Rodio',      z: 45,  categoria: 'avanzado', grupo: 'Metal de transición' },
  { simbolo: 'In', nombre: 'Indio',      z: 49,  categoria: 'avanzado', grupo: 'Metal' },
  { simbolo: 'La', nombre: 'Lantano',    z: 57,  categoria: 'avanzado', grupo: 'Lantánido' },
  { simbolo: 'Ce', nombre: 'Cerio',      z: 58,  categoria: 'avanzado', grupo: 'Lantánido' },
  { simbolo: 'Pr', nombre: 'Praseodimio',z: 59,  categoria: 'avanzado', grupo: 'Lantánido' },
  { simbolo: 'Nd', nombre: 'Neodimio',   z: 60,  categoria: 'avanzado', grupo: 'Lantánido' },
  { simbolo: 'Sm', nombre: 'Samario',    z: 62,  categoria: 'avanzado', grupo: 'Lantánido' },
  { simbolo: 'Eu', nombre: 'Europio',    z: 63,  categoria: 'avanzado', grupo: 'Lantánido' },
  { simbolo: 'Gd', nombre: 'Gadolinio',  z: 64,  categoria: 'avanzado', grupo: 'Lantánido' },
  { simbolo: 'Tb', nombre: 'Terbio',     z: 65,  categoria: 'avanzado', grupo: 'Lantánido' },
  { simbolo: 'Dy', nombre: 'Disprosio',  z: 66,  categoria: 'avanzado', grupo: 'Lantánido' },
  { simbolo: 'Ho', nombre: 'Holmio',     z: 67,  categoria: 'avanzado', grupo: 'Lantánido' },
  { simbolo: 'Er', nombre: 'Erbio',      z: 68,  categoria: 'avanzado', grupo: 'Lantánido' },
  { simbolo: 'Tm', nombre: 'Tulio',      z: 69,  categoria: 'avanzado', grupo: 'Lantánido' },
  { simbolo: 'Yb', nombre: 'Iterbio',    z: 70,  categoria: 'avanzado', grupo: 'Lantánido' },
  { simbolo: 'Lu', nombre: 'Lutecio',    z: 71,  categoria: 'avanzado', grupo: 'Lantánido' },
  { simbolo: 'Hf', nombre: 'Hafnio',     z: 72,  categoria: 'avanzado', grupo: 'Metal de transición' },
  { simbolo: 'Ta', nombre: 'Tántalo',    z: 73,  categoria: 'avanzado', grupo: 'Metal de transición' },
  { simbolo: 'Re', nombre: 'Renio',      z: 75,  categoria: 'avanzado', grupo: 'Metal de transición' },
  { simbolo: 'Os', nombre: 'Osmio',      z: 76,  categoria: 'avanzado', grupo: 'Metal de transición' },
  { simbolo: 'Ir', nombre: 'Iridio',     z: 77,  categoria: 'avanzado', grupo: 'Metal de transición' },
  { simbolo: 'Tl', nombre: 'Talio',      z: 81,  categoria: 'avanzado', grupo: 'Metal' },
  { simbolo: 'Po', nombre: 'Polonio',    z: 84,  categoria: 'avanzado', grupo: 'Metaloide' },
  { simbolo: 'Rn', nombre: 'Radón',      z: 86,  categoria: 'avanzado', grupo: 'Gas noble' },
  { simbolo: 'Ra', nombre: 'Radio',      z: 88,  categoria: 'avanzado', grupo: 'Metal alcalinotérreo' },
  { simbolo: 'Th', nombre: 'Torio',      z: 90,  categoria: 'avanzado', grupo: 'Actínido' },
  { simbolo: 'Pu', nombre: 'Plutonio',   z: 94,  categoria: 'avanzado', grupo: 'Actínido' },
];
