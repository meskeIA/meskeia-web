// Cocción sous-vide (al vacío a baja temperatura) — datos curados (orientativos)
//
// En sous-vide el alimento se cocina sumergido en agua a una temperatura
// constante y controlada. La temperatura define el punto final; el tiempo depende
// del grosor (para que el centro llegue) y, en aves y cerdo, de la pasteurización
// (seguridad). Son referencias ORIENTATIVAS: la seguridad alimentaria del sous-vide
// depende de respetar temperatura Y tiempo. Verificado: 2026-06.

export interface PuntoSousVide {
  nombre: string;
  tempC: number;
  tempF: number;
}

export interface AlimentoSousVide {
  id: string;
  nombre: string;
  emoji: string;
  puntos: PuntoSousVide[];
  tiempo: string; // rango típico para grosor estándar (~2-3 cm)
  nota: string;
}

export const ALIMENTOS_SOUSVIDE: AlimentoSousVide[] = [
  {
    id: 'vacuno', nombre: 'Vacuno (filete, solomillo)', emoji: '🥩',
    puntos: [
      { nombre: 'Poco hecho', tempC: 54, tempF: 129 },
      { nombre: 'Al punto', tempC: 57, tempF: 135 },
      { nombre: 'Al punto más', tempC: 60, tempF: 140 },
    ],
    tiempo: '1–2 h', nota: 'Sella en sartén muy caliente al sacarlo. Piezas gruesas, más tiempo.',
  },
  {
    id: 'cerdo', nombre: 'Cerdo (lomo, solomillo)', emoji: '🐖',
    puntos: [
      { nombre: 'Jugoso', tempC: 60, tempF: 140 },
      { nombre: 'Al punto', tempC: 63, tempF: 145 },
    ],
    tiempo: '1–3 h', nota: 'A partir de 60 °C con tiempo suficiente queda seguro y muy jugoso.',
  },
  {
    id: 'pollo', nombre: 'Pollo (pechuga)', emoji: '🍗',
    puntos: [
      { nombre: 'Jugoso seguro', tempC: 63, tempF: 145 },
      { nombre: 'Textura firme', tempC: 65, tempF: 149 },
    ],
    tiempo: '1–2 h', nota: 'El tiempo a 63–65 °C pasteuriza: queda seguro sin resecarse.',
  },
  {
    id: 'pescado', nombre: 'Pescado (salmón, bacalao)', emoji: '🐟',
    puntos: [
      { nombre: 'Meloso', tempC: 50, tempF: 122 },
      { nombre: 'Al punto', tempC: 54, tempF: 129 },
    ],
    tiempo: '30–45 min', nota: 'Muy delicado: vigila el tiempo para que no se deshaga.',
  },
  {
    id: 'huevo', nombre: 'Huevo', emoji: '🥚',
    puntos: [
      { nombre: 'Yema cremosa', tempC: 63, tempF: 145 },
      { nombre: 'Onsen / escalfado', tempC: 64, tempF: 147 },
    ],
    tiempo: '45–60 min', nota: 'El clásico huevo a baja temperatura, de yema sedosa.',
  },
  {
    id: 'verduras', nombre: 'Verduras (zanahoria, espárrago)', emoji: '🥕',
    puntos: [{ nombre: 'Tiernas', tempC: 84, tempF: 183 }],
    tiempo: '30–60 min', nota: 'Necesitan más temperatura que la carne para ablandar la fibra.',
  },
];

export const ALIMENTO_SOUSVIDE_POR_ID: Record<string, AlimentoSousVide> = ALIMENTOS_SOUSVIDE.reduce<
  Record<string, AlimentoSousVide>
>((acc, a) => { acc[a.id] = a; return acc; }, {});
