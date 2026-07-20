'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect } from 'react';
import styles from './TablaConstantesFisicas.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

/* ────────────────────────────────────────────────────────────────
   Utilidades
──────────────────────────────────────────────────────────────── */

/** Normaliza texto para buscar sin acentos ni mayúsculas. */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/* ────────────────────────────────────────────────────────────────
   Modelo de datos
──────────────────────────────────────────────────────────────── */

type CategoriaId =
  | 'definidas'
  | 'universales'
  | 'electromagneticas'
  | 'atomicas'
  | 'fisicoquimicas'
  | 'adoptadas';

interface Categoria {
  id: CategoriaId;
  nombre: string;
  icono: string;
}

interface Constante {
  id: string;
  categoria: CategoriaId;
  nombre: string;
  /** Símbolo habitual */
  simbolo: string;
  /** Valor en formato español: punto de miles, coma decimal, ×10ⁿ */
  valor: string;
  /** Unidad SI */
  unidad: string;
  /** true = exacta por definición (sin incertidumbre) */
  exacta: boolean;
  /** Incertidumbre estándar relativa, solo si es medida */
  incertidumbre?: string;
  /** Motivo de la exactitud o comentario sobre la medida */
  notaPrecision: string;
  /** Equivalencias en unidades prácticas */
  otrasUnidades?: string[];
  /** Qué significa físicamente, en una frase llana */
  significado: string;
  /** Nombre de la ley o relación donde aparece */
  formulaNombre: string;
  /** La fórmula escrita explícitamente */
  formula: string;
  /** Un orden de magnitud comparable que la haga tangible */
  tangible: string;
  /** Texto plano para el buscador: sinónimos y variantes que la gente teclea */
  busqueda: string;
}

const CATEGORIAS: Categoria[] = [
  { id: 'definidas', nombre: 'Definidas (SI 2019)', icono: '📏' },
  { id: 'universales', nombre: 'Universales', icono: '🌌' },
  { id: 'electromagneticas', nombre: 'Electromagnéticas', icono: '⚡' },
  { id: 'atomicas', nombre: 'Atómicas y nucleares', icono: '⚛️' },
  { id: 'fisicoquimicas', nombre: 'Fisicoquímicas', icono: '🧪' },
  { id: 'adoptadas', nombre: 'Adoptadas por convenio', icono: '📐' },
];

const NOMBRE_CATEGORIA: Record<CategoriaId, string> = {
  definidas: 'Definidas (SI 2019)',
  universales: 'Universales',
  electromagneticas: 'Electromagnéticas',
  atomicas: 'Atómicas y nucleares',
  fisicoquimicas: 'Fisicoquímicas',
  adoptadas: 'Adoptadas por convenio',
};

/* ────────────────────────────────────────────────────────────────
   TABLA DE CONSTANTES — valores del ajuste CODATA 2022 (NIST).
   Las siete primeras tienen valor fijado por definición desde la
   revisión del SI que entró en vigor el 20 de mayo de 2019.
──────────────────────────────────────────────────────────────── */

const CONSTANTES: Constante[] = [
  /* ── Definidas por el SI (2019) ─────────────────────────────── */
  {
    id: 'delta-nu-cs',
    categoria: 'definidas',
    nombre: 'Frecuencia de transición del cesio 133',
    simbolo: 'ΔνCs',
    valor: '9.192.631.770',
    unidad: 'Hz',
    exacta: true,
    notaPrecision:
      'Es la constante que define el segundo: un segundo son exactamente 9.192.631.770 oscilaciones de la radiación de la transición hiperfina del estado fundamental del átomo de cesio 133 en reposo y a 0 K.',
    significado:
      'La frecuencia del «tic» atómico con el que se mide el tiempo en todo el mundo: es el latido de los relojes de cesio.',
    formulaNombre: 'Definición del segundo',
    formula: '1 s = 9.192.631.770 / ΔνCs',
    tangible:
      'Un reloj de cesio se desviaría menos de un segundo en varios millones de años; los relojes ópticos experimentales de estroncio o iterbio ya son mil veces más estables, y por eso se debate redefinir el segundo hacia 2030.',
    busqueda:
      'frecuencia cesio 133 hiperfina segundo definicion reloj atomico delta nu cs tiempo patron 9192631770',
  },
  {
    id: 'c',
    categoria: 'definidas',
    nombre: 'Velocidad de la luz en el vacío',
    simbolo: 'c',
    valor: '299.792.458',
    unidad: 'm/s',
    exacta: true,
    notaPrecision:
      'Exacta desde 1983: el metro se define como la distancia que recorre la luz en el vacío en 1/299.792.458 de segundo. Medir c con más precisión ya no cambia el número, solo afina la realización práctica del metro.',
    otrasUnidades: ['≈ 3×10⁸ m/s (aproximación de cálculo)', '≈ 1.079.252.848,8 km/h'],
    significado:
      'El límite de velocidad del universo: ninguna señal, materia ni información puede superarlo.',
    formulaNombre: 'Equivalencia masa-energía y relación onda-frecuencia',
    formula: 'E = m·c²   ·   c = λ·ν',
    tangible:
      'La luz da unas 7,5 vueltas a la Tierra en un solo segundo, tarda 1,3 segundos en llegar a la Luna y 8 minutos y 20 segundos en llegar desde el Sol.',
    busqueda:
      'velocidad de la luz c vacio luz celeridad e igual mc2 relatividad 299792458 rapidez luminica',
  },
  {
    id: 'h',
    categoria: 'definidas',
    nombre: 'Constante de Planck',
    simbolo: 'h',
    valor: '6,62607015×10⁻³⁴',
    unidad: 'J·s',
    exacta: true,
    notaPrecision:
      'Exacta desde 2019: su valor se fijó por definición y con ella quedó definido el kilogramo, que dejó de depender del cilindro de platino-iridio guardado en Sèvres.',
    otrasUnidades: ['4,135667696×10⁻¹⁵ eV·s', 'ħ = h/2π = 1,054571817×10⁻³⁴ J·s'],
    significado:
      'El tamaño del «grano» de la energía: la energía de la luz no se emite de forma continua, sino en paquetes proporcionales a h.',
    formulaNombre: 'Relación de Planck-Einstein',
    formula: 'E = h·ν = h·c/λ',
    tangible:
      'Es tan pequeña que la cuantización pasa desapercibida a escala humana: un solo fotón de luz verde transporta unos 4×10⁻¹⁹ J, así que una bombilla de 10 W emite del orden de 10¹⁹ fotones por segundo.',
    busqueda:
      'constante de planck h cuanto de accion cuantica foton energia hbar h barra reducida 6626 kilogramo',
  },
  {
    id: 'e',
    categoria: 'definidas',
    nombre: 'Carga elemental',
    simbolo: 'e',
    valor: '1,602176634×10⁻¹⁹',
    unidad: 'C',
    exacta: true,
    notaPrecision:
      'Exacta desde 2019: al fijar su valor quedó definido el amperio. El electrón tiene carga −e y el protón +e.',
    otrasUnidades: ['1 eV = 1,602176634×10⁻¹⁹ J (mismo número)'],
    significado:
      'La unidad mínima de carga eléctrica libre: toda carga observable es un múltiplo entero de e.',
    formulaNombre: 'Fuerza eléctrica y definición del amperio',
    formula: 'F = q·E   ·   1 A = 1 C/s con 1 C = 1/1,602176634×10⁻¹⁹ cargas elementales',
    tangible:
      'Hacen falta unos 6,24×10¹⁸ electrones para acumular un culombio, y por un cable con 1 amperio pasa exactamente esa cantidad de carga cada segundo.',
    busqueda:
      'carga elemental carga del electron e culombio amperio carga proton electricidad 1602 electronvoltio',
  },
  {
    id: 'k-boltzmann',
    categoria: 'definidas',
    nombre: 'Constante de Boltzmann',
    simbolo: 'k_B',
    valor: '1,380649×10⁻²³',
    unidad: 'J/K',
    exacta: true,
    notaPrecision:
      'Exacta desde 2019: al fijar su valor quedó definido el kelvin, que ya no depende del punto triple del agua.',
    otrasUnidades: ['8,617333262×10⁻⁵ eV/K', 'k_B·T ≈ 0,025852 eV a 300 K'],
    significado:
      'El puente entre temperatura y energía: dice cuánta energía cinética corresponde a cada grado de libertad de una partícula por cada kelvin.',
    formulaNombre: 'Energía térmica y entropía de Boltzmann',
    formula: 'E_cin media = (3/2)·k_B·T   ·   S = k_B·ln W',
    tangible:
      'A temperatura ambiente k_B·T ronda 1/40 de electronvoltio: por eso los enlaces químicos (varios eV) no se rompen solos, pero los puentes de hidrógeno (décimas de eV) se hacen y deshacen sin parar.',
    busqueda:
      'constante de boltzmann kb k temperatura energia termica kelvin entropia gas ideal 138 estadistica',
  },
  {
    id: 'avogadro',
    categoria: 'definidas',
    nombre: 'Número de Avogadro',
    simbolo: 'N_A',
    valor: '6,02214076×10²³',
    unidad: 'mol⁻¹',
    exacta: true,
    notaPrecision:
      'Exacta desde 2019: el mol se define como la cantidad de sustancia que contiene exactamente 6,02214076×10²³ entidades elementales. Ya no se define a partir de 12 gramos de carbono-12.',
    significado:
      'Cuántas partículas hay en un mol: el factor de conversión entre el mundo de los átomos y el de la balanza de laboratorio.',
    formulaNombre: 'Cantidad de sustancia',
    formula: 'N = n·N_A   ·   M = m_partícula·N_A',
    tangible:
      'Si repartieras un mol de granos de arroz sobre toda la superficie terrestre, la capa tendría varios kilómetros de espesor. Contando mil millones de partículas por segundo tardarías unos 19 millones de años en contar un mol.',
    busqueda:
      'numero de avogadro constante de avogadro na mol cantidad de sustancia particulas quimica 6022 6.022e23',
  },
  {
    id: 'kcd',
    categoria: 'definidas',
    nombre: 'Eficacia luminosa de la radiación de 540 THz',
    simbolo: 'K_cd',
    valor: '683',
    unidad: 'lm/W',
    exacta: true,
    notaPrecision:
      'Exacta por definición: fija la candela conectando una magnitud física (el vatio) con una magnitud perceptiva (el lumen), para radiación monocromática de frecuencia 540×10¹² Hz.',
    significado:
      'Cuánta luz «ve» el ojo humano por cada vatio de radiación verde: traduce potencia física en brillo percibido.',
    formulaNombre: 'Definición de la candela',
    formula: 'Φ_v = K_cd · Φ_e (para ν = 540×10¹² Hz)',
    tangible:
      'Ninguna lámpara real alcanza 683 lm/W porque emite en muchas longitudes de onda y no solo en el verde donde el ojo es más sensible: un LED doméstico eficiente ronda los 100-150 lm/W.',
    busqueda:
      'eficacia luminosa kcd candela lumen vatio fotometria luz verde 540 thz 683 iluminacion',
  },

  /* ── Universales ───────────────────────────────────────────── */
  {
    id: 'g-gravitacion',
    categoria: 'universales',
    nombre: 'Constante de gravitación universal',
    simbolo: 'G',
    valor: '6,67430×10⁻¹¹',
    unidad: 'm³·kg⁻¹·s⁻²',
    exacta: false,
    incertidumbre: '2,2×10⁻⁵ (relativa)',
    notaPrecision:
      'Es con diferencia la peor conocida de las constantes fundamentales: solo unas cinco cifras fiables. La gravedad es tan débil que hay que medir fuerzas minúsculas entre masas de laboratorio, y experimentos de máxima calidad siguen sin coincidir del todo entre sí.',
    significado:
      'La intensidad de la atracción gravitatoria: cuánta fuerza se ejercen dos masas separadas una distancia dada.',
    formulaNombre: 'Ley de gravitación universal de Newton',
    formula: 'F = G·m₁·m₂ / r²',
    tangible:
      'Dos personas de 70 kg separadas un metro se atraen con unos 3×10⁻⁷ newtons, el peso de una mota de polvo. Solo cuando una de las masas es planetaria la gravedad se vuelve dominante.',
    busqueda:
      'constante de gravitacion universal g newton gravedad atraccion masas cavendish 667430 gravitatoria',
  },
  {
    id: 'h-barra',
    categoria: 'universales',
    nombre: 'Constante de Planck reducida',
    simbolo: 'ħ',
    valor: '1,054571817×10⁻³⁴',
    unidad: 'J·s',
    exacta: true,
    notaPrecision:
      'Exacta por ser h/2π con h exacta; el valor mostrado está truncado porque π es irracional y la expansión decimal no termina.',
    otrasUnidades: ['6,582119569×10⁻¹⁶ eV·s', 'ħ·c = 197,3269804 MeV·fm'],
    significado:
      'La misma constante de Planck expresada por radián en vez de por ciclo: es la unidad natural del momento angular cuántico.',
    formulaNombre: 'Principio de indeterminación de Heisenberg',
    formula: 'Δx·Δp ≥ ħ/2   ·   ΔE·Δt ≥ ħ/2',
    tangible:
      'El espín del electrón vale ħ/2, el momento angular más pequeño posible. Como ħ es diminuta, la indeterminación cuántica es irrelevante para una pelota, pero domina el comportamiento de un electrón.',
    busqueda:
      'constante de planck reducida hbar h barra dirac momento angular espin heisenberg incertidumbre',
  },
  {
    id: 'epsilon-0',
    categoria: 'universales',
    nombre: 'Permitividad eléctrica del vacío',
    simbolo: 'ε₀',
    valor: '8,854187818×10⁻¹²',
    unidad: 'F/m',
    exacta: false,
    incertidumbre: '1,6×10⁻¹⁰ (relativa)',
    notaPrecision:
      'Antes de 2019 era exacta por definición. Hoy se deduce de la constante de estructura fina, así que hereda su incertidumbre, aunque siga siendo conocida con diez cifras.',
    otrasUnidades: ['1/(4πε₀) ≈ 8,9875517862×10⁹ N·m²/C²'],
    significado:
      'Cuánto se «opone» el vacío a que exista un campo eléctrico: aparece como factor de escala en toda la electrostática.',
    formulaNombre: 'Ley de Coulomb',
    formula: 'F = (1/4πε₀)·q₁·q₂ / r²',
    tangible:
      'Dos cargas de un culombio a un metro se repelerían con casi 9.000 millones de newtons: la fuerza eléctrica es unos 10³⁶ veces más intensa que la gravitatoria entre dos protones.',
    busqueda:
      'permitividad del vacio epsilon cero constante dielectrica coulomb electrostatica campo electrico',
  },
  {
    id: 'mu-0',
    categoria: 'universales',
    nombre: 'Permeabilidad magnética del vacío',
    simbolo: 'μ₀',
    valor: '1,25663706127×10⁻⁶',
    unidad: 'N/A²',
    exacta: false,
    incertidumbre: '1,6×10⁻¹⁰ (relativa)',
    notaPrecision:
      'Hasta 2019 valía exactamente 4π×10⁻⁷ N/A² por definición del amperio. Tras la revisión del SI se mide, y hoy es 4π×10⁻⁷ multiplicado por 1,00000000077, una diferencia que solo importa en metrología de precisión.',
    otrasUnidades: ['≈ 4π×10⁻⁷ N/A² (valor clásico, hoy aproximado)'],
    significado:
      'La respuesta magnética del vacío: relaciona la corriente que circula con el campo magnético que genera.',
    formulaNombre: 'Ley de Ampère y relación con la velocidad de la luz',
    formula: 'B = μ₀·I / (2πr)   ·   c = 1/√(ε₀·μ₀)',
    tangible:
      'Que ε₀ y μ₀ determinen la velocidad de la luz fue la pista de Maxwell para concluir que la luz es una onda electromagnética, décadas antes de que existiera la relatividad.',
    busqueda:
      'permeabilidad magnetica del vacio mu cero campo magnetico ampere maxwell 4 pi 10-7 electromagnetismo',
  },
  {
    id: 'impedancia-vacio',
    categoria: 'universales',
    nombre: 'Impedancia característica del vacío',
    simbolo: 'Z₀',
    valor: '376,730313412',
    unidad: 'Ω',
    exacta: false,
    incertidumbre: '1,6×10⁻¹⁰ (relativa)',
    notaPrecision:
      'Se obtiene como μ₀·c, así que arrastra la misma incertidumbre relativa que μ₀. Antes de 2019 era exacta.',
    otrasUnidades: ['≈ 120π Ω ≈ 377 Ω (regla práctica en antenas)'],
    significado:
      'La relación entre el campo eléctrico y el magnético de una onda electromagnética que viaja por el vacío.',
    formulaNombre: 'Onda plana en el vacío',
    formula: 'Z₀ = E/H = μ₀·c = √(μ₀/ε₀)',
    tangible:
      'Los 377 ohmios del vacío explican por qué las antenas se diseñan buscando adaptación de impedancias: si el cable de 50 Ω no se adapta bien al espacio libre, parte de la energía se refleja en vez de radiarse.',
    busqueda:
      'impedancia del vacio z0 377 ohmios antena onda electromagnetica espacio libre radiofrecuencia',
  },
  {
    id: 'stefan-boltzmann',
    categoria: 'universales',
    nombre: 'Constante de Stefan-Boltzmann',
    simbolo: 'σ',
    valor: '5,670374419×10⁻⁸',
    unidad: 'W·m⁻²·K⁻⁴',
    exacta: true,
    notaPrecision:
      'Exacta porque se calcula a partir de h, c y k_B, las tres fijadas por definición: σ = 2π⁵k_B⁴/(15h³c²). El valor mostrado está truncado.',
    significado:
      'Cuánta energía irradia por segundo cada metro cuadrado de un cuerpo caliente, según su temperatura.',
    formulaNombre: 'Ley de Stefan-Boltzmann',
    formula: 'P/A = σ·T⁴ (cuerpo negro)   ·   P/A = ε·σ·T⁴ (cuerpo real)',
    tangible:
      'La cuarta potencia lo cambia todo: duplicar la temperatura absoluta multiplica por 16 la radiación emitida. La superficie del Sol, a unos 5.772 K, irradia unos 63 MW por metro cuadrado.',
    busqueda:
      'constante de stefan boltzmann sigma radiacion cuerpo negro emision termica t4 radiancia',
  },
  {
    id: 'wien',
    categoria: 'universales',
    nombre: 'Constante de desplazamiento de Wien',
    simbolo: 'b',
    valor: '2,897771955×10⁻³',
    unidad: 'm·K',
    exacta: true,
    notaPrecision:
      'Exacta porque se deriva de h, c y k_B, todas fijadas por definición. El valor mostrado está truncado.',
    otrasUnidades: ['2.897,771955 μm·K (forma habitual en óptica)'],
    significado:
      'Indica en qué color emite más un cuerpo caliente: cuanto mayor es la temperatura, más corta es la longitud de onda dominante.',
    formulaNombre: 'Ley del desplazamiento de Wien',
    formula: 'λ_máx = b / T',
    tangible:
      'El cuerpo humano, a unos 310 K, emite sobre todo en el infrarrojo a unos 9,3 μm, y por eso lo detectan las cámaras térmicas. El Sol, a 5.772 K, emite su máximo a unos 500 nm, en pleno verde visible.',
    busqueda:
      'ley de wien desplazamiento constante b color temperatura cuerpo negro longitud de onda maxima termografia',
  },
  {
    id: 'longitud-planck',
    categoria: 'universales',
    nombre: 'Longitud de Planck',
    simbolo: 'l_P',
    valor: '1,616255×10⁻³⁵',
    unidad: 'm',
    exacta: false,
    incertidumbre: '1,1×10⁻⁵ (relativa)',
    notaPrecision:
      'Su incertidumbre procede casi por completo de G, que aparece bajo raíz cuadrada. No es una longitud medida: es una combinación de constantes con dimensiones de longitud.',
    significado:
      'La escala de distancia donde se espera que la gravedad deje de describirse con el espacio-tiempo liso de la relatividad general.',
    formulaNombre: 'Unidades naturales de Planck',
    formula: 'l_P = √(ħ·G/c³)',
    tangible:
      'Un protón es unas 10²⁰ veces mayor que la longitud de Planck: la misma proporción que hay entre un protón y una distancia de varios kilómetros. Ningún experimento se acerca a esa escala.',
    busqueda:
      'longitud de planck escala de planck gravedad cuantica unidades naturales espacio tiempo 10-35',
  },
  {
    id: 'tiempo-planck',
    categoria: 'universales',
    nombre: 'Tiempo de Planck',
    simbolo: 't_P',
    valor: '5,391247×10⁻⁴⁴',
    unidad: 's',
    exacta: false,
    incertidumbre: '1,1×10⁻⁵ (relativa)',
    notaPrecision:
      'Combinación de ħ, G y c; la incertidumbre viene de G. Es el tiempo que tarda la luz en recorrer una longitud de Planck.',
    significado:
      'El intervalo temporal más corto con sentido dentro de la física conocida, sin una teoría cuántica de la gravedad.',
    formulaNombre: 'Unidades naturales de Planck',
    formula: 't_P = √(ħ·G/c⁵) = l_P/c',
    tangible:
      'La cosmología habla de la «era de Planck» como el instante inicial anterior a 10⁻⁴³ segundos tras el Big Bang: antes de ese momento no hay modelo capaz de describir el universo.',
    busqueda: 'tiempo de planck era de planck big bang instante minimo cosmologia unidades naturales',
  },
  {
    id: 'masa-planck',
    categoria: 'universales',
    nombre: 'Masa de Planck',
    simbolo: 'm_P',
    valor: '2,176434×10⁻⁸',
    unidad: 'kg',
    exacta: false,
    incertidumbre: '1,1×10⁻⁵ (relativa)',
    notaPrecision:
      'Combinación de ħ, c y G; la incertidumbre procede de G. A diferencia de las otras magnitudes de Planck, esta no es diminuta a escala humana.',
    otrasUnidades: ['≈ 1,22×10¹⁹ GeV/c²'],
    significado:
      'La masa a la que los efectos cuánticos y los gravitatorios tendrían una intensidad comparable.',
    formulaNombre: 'Unidades naturales de Planck',
    formula: 'm_P = √(ħ·c/G)',
    tangible:
      'Son unos 22 microgramos, aproximadamente la masa de un grano de polen o de una pulga muy pequeña. Es la única magnitud de Planck que cae en el rango de lo cotidiano, y eso desconcierta a mucha gente.',
    busqueda: 'masa de planck microgramo gravedad cuantica unidades naturales escala de planck',
  },
  {
    id: 'temperatura-planck',
    categoria: 'universales',
    nombre: 'Temperatura de Planck',
    simbolo: 'T_P',
    valor: '1,416784×10³²',
    unidad: 'K',
    exacta: false,
    incertidumbre: '1,1×10⁻⁵ (relativa)',
    notaPrecision:
      'Se obtiene dividiendo la energía de Planck entre k_B; la incertidumbre viene de G. Es una escala teórica, no una temperatura alcanzable.',
    significado:
      'La temperatura a la que la energía térmica típica de una partícula igualaría la energía de Planck.',
    formulaNombre: 'Unidades naturales de Planck',
    formula: 'T_P = m_P·c²/k_B = √(ħ·c⁵/(G·k_B²))',
    tangible:
      'Es unos 10²⁸ veces la temperatura del núcleo solar (unos 15 millones de K). La colisión más energética lograda en un acelerador queda veinte órdenes de magnitud por debajo.',
    busqueda: 'temperatura de planck kelvin maxima big bang unidades naturales escala de planck',
  },

  /* ── Electromagnéticas ─────────────────────────────────────── */
  {
    id: 'estructura-fina',
    categoria: 'electromagneticas',
    nombre: 'Constante de estructura fina',
    simbolo: 'α',
    valor: '7,2973525643×10⁻³',
    unidad: '(adimensional)',
    exacta: false,
    incertidumbre: '1,6×10⁻¹⁰ (relativa)',
    notaPrecision:
      'Es un número puro: vale lo mismo en cualquier sistema de unidades. Su medida, comparada con la predicción de la electrodinámica cuántica, es una de las pruebas más severas de la física teórica.',
    otrasUnidades: ['1/α = 137,035999177', 'α = e²/(4πε₀·ħ·c)'],
    significado:
      'Mide la intensidad de la interacción electromagnética: cuánto se acoplan la luz y la materia cargada.',
    formulaNombre: 'Acoplamiento electromagnético',
    formula: 'α = e² / (4πε₀·ħ·c) ≈ 1/137',
    tangible:
      'α ≈ 1/137 fija el tamaño de los átomos y la energía de los enlaces: si valiera bastante distinto, la química que conocemos —y con ella las estrellas y la vida— no sería la misma. Su nombre viene de la estructura fina de las líneas espectrales.',
    busqueda:
      'constante de estructura fina alfa alpha 137 acoplamiento electromagnetico numero puro adimensional qed',
  },
  {
    id: 'magneton-bohr',
    categoria: 'electromagneticas',
    nombre: 'Magnetón de Bohr',
    simbolo: 'μ_B',
    valor: '9,2740100657×10⁻²⁴',
    unidad: 'J/T',
    exacta: false,
    incertidumbre: '3,1×10⁻¹⁰ (relativa)',
    notaPrecision:
      'Se calcula como eħ/2mₑ; su incertidumbre procede de la masa del electrón.',
    otrasUnidades: ['5,7883817982×10⁻⁵ eV/T'],
    significado:
      'La unidad natural del momento magnético de un electrón: el «imán» elemental que aporta cada electrón.',
    formulaNombre: 'Momento magnético del electrón',
    formula: 'μ_B = e·ħ / (2·mₑ)   ·   E = −μ·B',
    tangible:
      'El magnetismo del hierro, de las brújulas y de los discos duros nace de la suma coherente de miles de millones de momentos del tamaño de un magnetón de Bohr.',
    busqueda:
      'magneton de bohr momento magnetico electron mu b espin magnetismo resonancia teslas',
  },
  {
    id: 'magneton-nuclear',
    categoria: 'electromagneticas',
    nombre: 'Magnetón nuclear',
    simbolo: 'μ_N',
    valor: '5,0507837393×10⁻²⁷',
    unidad: 'J/T',
    exacta: false,
    incertidumbre: '3,1×10⁻¹⁰ (relativa)',
    notaPrecision: 'Se calcula como eħ/2m_p; su incertidumbre procede de la masa del protón.',
    otrasUnidades: ['3,15245125417×10⁻⁸ eV/T'],
    significado:
      'La unidad natural del momento magnético de los núcleos atómicos, unas 1.836 veces menor que la del electrón.',
    formulaNombre: 'Momento magnético nuclear',
    formula: 'μ_N = e·ħ / (2·m_p)',
    tangible:
      'Que el momento magnético nuclear sea casi dos mil veces menor explica por qué la resonancia magnética necesita campos de varios teslas y antenas muy sensibles para detectar los protones del cuerpo.',
    busqueda:
      'magneton nuclear mu n momento magnetico proton nucleo resonancia magnetica rmn nmr',
  },
  {
    id: 'flujo-magnetico',
    categoria: 'electromagneticas',
    nombre: 'Cuanto de flujo magnético',
    simbolo: 'Φ₀',
    valor: '2,067833848×10⁻¹⁵',
    unidad: 'Wb',
    exacta: true,
    notaPrecision:
      'Exacta por ser h/2e con h y e fijadas por definición. El valor mostrado está truncado.',
    significado:
      'La cantidad mínima de flujo magnético que puede atravesar un anillo superconductor: el flujo también está cuantizado.',
    formulaNombre: 'Cuantización del flujo en superconductores',
    formula: 'Φ₀ = h / (2·e)',
    tangible:
      'Los SQUID, magnetómetros basados en esta cuantización, detectan campos mil millones de veces más débiles que el terrestre y permiten registrar la actividad magnética del cerebro.',
    busqueda:
      'cuanto de flujo magnetico fluxon phi cero superconductor squid weber cuantizacion',
  },
  {
    id: 'conductancia',
    categoria: 'electromagneticas',
    nombre: 'Cuanto de conductancia',
    simbolo: 'G₀',
    valor: '7,748091729×10⁻⁵',
    unidad: 'S',
    exacta: true,
    notaPrecision: 'Exacta por ser 2e²/h con e y h fijadas por definición. Valor truncado.',
    otrasUnidades: ['1/G₀ = 12.906,40372 Ω'],
    significado:
      'La conductancia máxima que puede transportar un único canal cuántico de conducción.',
    formulaNombre: 'Conducción balística (fórmula de Landauer)',
    formula: 'G₀ = 2·e² / h',
    tangible:
      'Al estirar un hilo de oro hasta dejarlo de un solo átomo de grosor, la conductancia no baja de forma continua: cae a saltos múltiplos de G₀, y ese escalón se ve en el osciloscopio.',
    busqueda:
      'cuanto de conductancia g0 landauer nanohilo conduccion balistica siemens nanoelectronica',
  },
  {
    id: 'josephson',
    categoria: 'electromagneticas',
    nombre: 'Constante de Josephson',
    simbolo: 'K_J',
    valor: '4,835978484×10¹⁴',
    unidad: 'Hz/V',
    exacta: true,
    notaPrecision:
      'Exacta por ser 2e/h con e y h fijadas por definición. Valor truncado. Es la base del patrón primario de voltio.',
    otrasUnidades: ['483.597,8484 GHz/V'],
    significado:
      'Convierte una frecuencia en una tensión con precisión extrema, usando el efecto Josephson en uniones superconductoras.',
    formulaNombre: 'Efecto Josephson alterno',
    formula: 'K_J = 2·e / h   ·   V = f / K_J',
    tangible:
      'Gracias a esta relación, cualquier laboratorio de metrología puede reproducir el voltio a partir de una frecuencia de microondas, sin necesidad de transportar pilas patrón.',
    busqueda:
      'constante de josephson kj voltio patron efecto josephson superconductor metrologia tension',
  },
  {
    id: 'von-klitzing',
    categoria: 'electromagneticas',
    nombre: 'Constante de von Klitzing',
    simbolo: 'R_K',
    valor: '25.812,80745',
    unidad: 'Ω',
    exacta: true,
    notaPrecision:
      'Exacta por ser h/e² con h y e fijadas por definición. Es el patrón primario de resistencia.',
    significado:
      'La resistencia que aparece en los escalones del efecto Hall cuántico, siempre la misma con independencia del material.',
    formulaNombre: 'Efecto Hall cuántico',
    formula: 'R_K = h / e²   ·   R_H = R_K / ν',
    tangible:
      'La reproducibilidad de esta resistencia es tan buena (mejor que una parte en mil millones) que sustituyó a las resistencias patrón materiales, que envejecían y derivaban con el tiempo.',
    busqueda:
      'constante de von klitzing rk efecto hall cuantico ohmio patron resistencia metrologia 25812',
  },
  {
    id: 'radio-electron',
    categoria: 'electromagneticas',
    nombre: 'Radio clásico del electrón',
    simbolo: 'r_e',
    valor: '2,8179403205×10⁻¹⁵',
    unidad: 'm',
    exacta: false,
    incertidumbre: '4,7×10⁻¹⁰ (relativa)',
    notaPrecision:
      'No es un tamaño real: el electrón se comporta como puntual en todos los experimentos. Es la distancia a la que la energía electrostática igualaría a mₑc².',
    otrasUnidades: ['2,8179403205 fm'],
    significado:
      'Una longitud de referencia que aparece al describir cómo dispersa la luz un electrón libre.',
    formulaNombre: 'Sección eficaz de dispersión Thomson',
    formula: 'r_e = e²/(4πε₀·mₑ·c²)   ·   σ_T = (8π/3)·r_e²',
    tangible:
      'Es del orden del tamaño de un núcleo atómico, aunque el electrón no ocupe ese espacio: la coincidencia de escala es lo que hizo popular el nombre.',
    busqueda:
      'radio clasico del electron re thomson dispersion seccion eficaz femtometro lorentz',
  },
  {
    id: 'factor-g-electron',
    categoria: 'electromagneticas',
    nombre: 'Factor g del electrón',
    simbolo: 'g_e',
    valor: '−2,00231930436',
    unidad: '(adimensional)',
    exacta: false,
    incertidumbre: '1,8×10⁻¹³ (relativa)',
    notaPrecision:
      'Es la magnitud medida con mayor precisión de toda la física, y su acuerdo con la predicción de la electrodinámica cuántica alcanza doce cifras significativas.',
    significado:
      'Relaciona el espín del electrón con su momento magnético; la teoría simple predice exactamente 2 y la realidad se desvía muy poco.',
    formulaNombre: 'Momento magnético anómalo',
    formula: 'μ_e = g_e·(μ_B/ħ)·S   ·   a_e = (|g_e| − 2)/2',
    tangible:
      'Esa desviación de una milésima respecto a 2 no es ruido experimental: son las partículas virtuales del vacío cuántico dejando su huella, y calcularla exigió décadas de trabajo teórico.',
    busqueda:
      'factor g del electron momento magnetico anomalo g-2 qed espin electrodinamica cuantica',
  },

  /* ── Atómicas y nucleares ──────────────────────────────────── */
  {
    id: 'masa-electron',
    categoria: 'atomicas',
    nombre: 'Masa del electrón',
    simbolo: 'mₑ',
    valor: '9,1093837139×10⁻³¹',
    unidad: 'kg',
    exacta: false,
    incertidumbre: '3,1×10⁻¹⁰ (relativa)',
    notaPrecision:
      'Se determina con trampas de Penning que comparan frecuencias de ciclotrón; la incertidumbre es de unas tres partes en diez mil millones.',
    otrasUnidades: ['5,485799090441×10⁻⁴ u', '0,51099895069 MeV/c²'],
    significado:
      'La masa de la partícula cargada más ligera de la materia ordinaria, responsable de los enlaces químicos.',
    formulaNombre: 'Energía en reposo y niveles atómicos',
    formula: 'E₀ = mₑ·c² = 0,51099895069 MeV',
    tangible:
      'Un protón pesa unas 1.836 veces más que un electrón: prácticamente toda la masa de un átomo está en el núcleo, mientras que casi todo su volumen lo ocupan los electrones.',
    busqueda:
      'masa del electron me kilogramo mev electron masa en reposo 9109 particula 511 kev',
  },
  {
    id: 'masa-proton',
    categoria: 'atomicas',
    nombre: 'Masa del protón',
    simbolo: 'm_p',
    valor: '1,67262192595×10⁻²⁷',
    unidad: 'kg',
    exacta: false,
    incertidumbre: '3,1×10⁻¹⁰ (relativa)',
    notaPrecision:
      'Medida con espectrometría de masas de altísima precisión en trampas de iones.',
    otrasUnidades: ['1,00727646578 u', '938,27208943 MeV/c²'],
    significado:
      'La masa del núcleo de hidrógeno y del componente positivo de todos los núcleos atómicos.',
    formulaNombre: 'Energía en reposo del protón',
    formula: 'E₀ = m_p·c² = 938,27208943 MeV',
    tangible:
      'Solo un 1% de esa masa procede de los quarks; el resto es energía del campo fuerte que los mantiene unidos. Es decir, casi toda tu masa es energía de ligadura, no «materia» en el sentido intuitivo.',
    busqueda:
      'masa del proton mp kilogramo mev nucleo hidrogeno particula 938 uma unidad de masa atomica',
  },
  {
    id: 'masa-neutron',
    categoria: 'atomicas',
    nombre: 'Masa del neutrón',
    simbolo: 'm_n',
    valor: '1,67492750056×10⁻²⁷',
    unidad: 'kg',
    exacta: false,
    incertidumbre: '5,1×10⁻¹⁰ (relativa)',
    notaPrecision:
      'Ligeramente peor conocida que la del protón porque el neutrón, al no tener carga, no puede confinarse igual de bien en trampas electromagnéticas.',
    otrasUnidades: ['1,00866491606 u', '939,56542194 MeV/c²'],
    significado: 'La masa de la partícula neutra que acompaña a los protones en el núcleo.',
    formulaNombre: 'Energía en reposo del neutrón',
    formula: 'E₀ = m_n·c² = 939,56542194 MeV',
    tangible:
      'El neutrón es apenas un 0,14% más pesado que el protón, pero ese pequeño exceso basta para que decaiga en unos 15 minutos cuando está libre: si fuera al revés, el hidrógeno no sería estable.',
    busqueda:
      'masa del neutron mn kilogramo mev nucleo particula neutra 939 decaimiento beta',
  },
  {
    id: 'uma',
    categoria: 'atomicas',
    nombre: 'Unidad de masa atómica unificada',
    simbolo: 'u (Da)',
    valor: '1,66053906892×10⁻²⁷',
    unidad: 'kg',
    exacta: false,
    incertidumbre: '3,1×10⁻¹⁰ (relativa)',
    notaPrecision:
      'Se define como la doceava parte de la masa de un átomo neutro de carbono-12 en reposo y en su estado fundamental. Desde 2019 esa definición ya no fija el mol, así que u pasó a ser una magnitud medida.',
    otrasUnidades: ['931,49410372 MeV/c²', '1 u ≈ 1 g/mol'],
    significado:
      'La unidad práctica para pesar átomos y moléculas, elegida para que el número casi coincida con el número másico.',
    formulaNombre: 'Masa molar',
    formula: 'M ≈ (masa en u) g/mol',
    tangible:
      'Una molécula de agua pesa unas 18 u, y un mol de agua pesa unos 18 gramos: esa coincidencia numérica es lo que hace tan cómodo el sistema de unidades de la química.',
    busqueda:
      'unidad de masa atomica uma dalton da u carbono 12 masa molecular peso atomico gramo mol',
  },
  {
    id: 'radio-bohr',
    categoria: 'atomicas',
    nombre: 'Radio de Bohr',
    simbolo: 'a₀',
    valor: '5,29177210544×10⁻¹¹',
    unidad: 'm',
    exacta: false,
    incertidumbre: '1,6×10⁻¹⁰ (relativa)',
    notaPrecision:
      'Su incertidumbre viene esencialmente de la constante de estructura fina y de la masa del electrón.',
    otrasUnidades: ['0,529177210544 Å', '52,9177210544 pm'],
    significado:
      'La distancia más probable entre el electrón y el núcleo en un átomo de hidrógeno en su estado fundamental.',
    formulaNombre: 'Modelo atómico y unidades atómicas',
    formula: 'a₀ = 4πε₀·ħ² / (mₑ·e²) = ħ/(mₑ·c·α)',
    tangible:
      'Es la referencia del tamaño de los átomos: prácticamente todos miden entre 0,5 y 3 ångströms, así que caben unos cien millones de átomos en un centímetro.',
    busqueda:
      'radio de bohr a0 angstrom tamano del atomo hidrogeno unidades atomicas 0529 picometro',
  },
  {
    id: 'rydberg',
    categoria: 'atomicas',
    nombre: 'Constante de Rydberg',
    simbolo: 'R∞',
    valor: '10.973.731,568157',
    unidad: 'm⁻¹',
    exacta: false,
    incertidumbre: '1,1×10⁻¹² (relativa)',
    notaPrecision:
      'Es una de las constantes medidas con mayor precisión, gracias a la espectroscopia láser de las transiciones del hidrógeno.',
    significado:
      'Fija las longitudes de onda de las líneas espectrales del hidrógeno: el «código de barras» de la luz atómica.',
    formulaNombre: 'Fórmula de Rydberg',
    formula: '1/λ = R∞·(1/n₁² − 1/n₂²)',
    tangible:
      'De ella salen las rayas rojas, verde-azuladas y violetas que se ven al mirar un tubo de hidrógeno con un espectroscopio, y también la línea roja Hα con la que se fotografía el Sol.',
    busqueda:
      'constante de rydberg r infinito espectro hidrogeno lineas espectrales balmer lyman espectroscopia',
  },
  {
    id: 'energia-rydberg',
    categoria: 'atomicas',
    nombre: 'Energía de Rydberg',
    simbolo: 'h·c·R∞',
    valor: '13,60569312',
    unidad: 'eV',
    exacta: false,
    incertidumbre: '1,1×10⁻¹² (relativa)',
    notaPrecision:
      'Se obtiene multiplicando R∞ por h y c, ambas exactas, así que hereda la precisión de R∞.',
    otrasUnidades: ['2,1798723611×10⁻¹⁸ J'],
    significado:
      'La energía que hay que dar a un electrón para arrancarlo de un átomo de hidrógeno en su estado fundamental.',
    formulaNombre: 'Niveles de energía del hidrógeno',
    formula: 'Eₙ = −13,6 eV / n²',
    tangible:
      'Esos 13,6 eV marcan la frontera de la química: los enlaces típicos rondan unos pocos eV, así que la luz visible los agita pero rara vez ioniza, mientras que el ultravioleta lejano ya arranca electrones.',
    busqueda:
      'energia de rydberg 136 ev ionizacion hidrogeno niveles de energia potencial de ionizacion',
  },
  {
    id: 'hartree',
    categoria: 'atomicas',
    nombre: 'Energía de Hartree',
    simbolo: 'E_h',
    valor: '4,3597447222060×10⁻¹⁸',
    unidad: 'J',
    exacta: false,
    incertidumbre: '1,1×10⁻¹² (relativa)',
    notaPrecision: 'Vale exactamente el doble de la energía de Rydberg y hereda su precisión.',
    otrasUnidades: ['27,211386245981 eV', '2.625,4996 kJ/mol'],
    significado:
      'La unidad de energía del sistema de unidades atómicas, el que usan internamente los programas de química cuántica.',
    formulaNombre: 'Unidades atómicas',
    formula: 'E_h = 2·h·c·R∞ = ħ²/(mₑ·a₀²)',
    tangible:
      'Cuando un cálculo de química computacional devuelve energías del orden de −76 hartree para una molécula de agua, está usando esta unidad: multiplicando por 27,2 se pasa a electronvoltios.',
    busqueda:
      'energia de hartree unidades atomicas quimica computacional 27211 ev dft orbitales',
  },
  {
    id: 'compton',
    categoria: 'atomicas',
    nombre: 'Longitud de onda de Compton del electrón',
    simbolo: 'λ_C',
    valor: '2,42631023538×10⁻¹²',
    unidad: 'm',
    exacta: false,
    incertidumbre: '3,1×10⁻¹⁰ (relativa)',
    notaPrecision: 'Se calcula como h/(mₑ·c); su incertidumbre viene de la masa del electrón.',
    otrasUnidades: ['2,42631023538 pm'],
    significado:
      'Cuánto cambia la longitud de onda de un fotón al rebotar en un electrón: la prueba de que la luz también transporta momento.',
    formulaNombre: 'Efecto Compton',
    formula: 'Δλ = λ_C·(1 − cos θ)',
    tangible:
      'El experimento de Compton, en 1923, convenció a los escépticos de que el fotón es una partícula con momento: la luz no solo se difracta, también choca.',
    busqueda:
      'longitud de onda de compton lambda c efecto compton dispersion fotones rayos x picometro',
  },
  {
    id: 'razon-mp-me',
    categoria: 'atomicas',
    nombre: 'Razón de masas protón-electrón',
    simbolo: 'm_p/mₑ',
    valor: '1.836,152673426',
    unidad: '(adimensional)',
    exacta: false,
    incertidumbre: '1,6×10⁻¹¹ (relativa)',
    notaPrecision:
      'Al ser un cociente, muchas incertidumbres se cancelan y el valor se conoce mejor que cada masa por separado.',
    significado:
      'Cuántas veces más pesado es un protón que un electrón: un número puro que fija buena parte de la estructura de la materia.',
    formulaNombre: 'Masa reducida del átomo de hidrógeno',
    formula: 'μ = mₑ·m_p / (mₑ + m_p) ≈ mₑ·(1 − mₑ/m_p)',
    tangible:
      'Como el núcleo es casi dos mil veces más pesado, apenas se mueve mientras los electrones giran: esa asimetría es la que permite tratar las moléculas como núcleos casi quietos rodeados de nubes electrónicas.',
    busqueda:
      'razon de masas proton electron 1836 cociente adimensional masa reducida hidrogeno',
  },
  {
    id: 'energia-electron',
    categoria: 'atomicas',
    nombre: 'Energía en reposo del electrón',
    simbolo: 'mₑ·c²',
    valor: '0,51099895069',
    unidad: 'MeV',
    exacta: false,
    incertidumbre: '3,1×10⁻¹⁰ (relativa)',
    notaPrecision: 'Deriva directamente de la masa del electrón, con c exacta.',
    otrasUnidades: ['510,99895069 keV', '8,1871057880×10⁻¹⁴ J'],
    significado:
      'La energía que se libera si un electrón se aniquila con su antipartícula: media MeV por cada uno.',
    formulaNombre: 'Aniquilación electrón-positrón',
    formula: 'e⁻ + e⁺ → 2γ, cada fotón de 511 keV',
    tangible:
      'Los 511 keV son la firma de la tomografía PET: el escáner detecta pares de fotones de esa energía exacta emitidos en direcciones opuestas y reconstruye de dónde salieron.',
    busqueda:
      'energia en reposo del electron 511 kev mev pet aniquilacion positron emc2 tomografia',
  },
  {
    id: 'energia-proton',
    categoria: 'atomicas',
    nombre: 'Energía en reposo del protón',
    simbolo: 'm_p·c²',
    valor: '938,27208943',
    unidad: 'MeV',
    exacta: false,
    incertidumbre: '3,1×10⁻¹⁰ (relativa)',
    notaPrecision: 'Deriva directamente de la masa del protón, con c exacta.',
    otrasUnidades: ['0,93827208943 GeV', '1,50327761×10⁻¹⁰ J'],
    significado:
      'La escala de energía de la física nuclear y de partículas: casi mil MeV por nucleón.',
    formulaNombre: 'Equivalencia masa-energía',
    formula: 'E₀ = m_p·c²',
    tangible:
      'Por eso los aceleradores hablan en GeV: crear un solo protón a partir de energía pura cuesta casi 1 GeV, y colisiones de varios TeV pueden generar cientos de partículas.',
    busqueda:
      'energia en reposo del proton 938 mev gev acelerador fisica de particulas nuclear',
  },
  {
    id: 'energia-neutron',
    categoria: 'atomicas',
    nombre: 'Energía en reposo del neutrón',
    simbolo: 'm_n·c²',
    valor: '939,56542194',
    unidad: 'MeV',
    exacta: false,
    incertidumbre: '5,1×10⁻¹⁰ (relativa)',
    notaPrecision: 'Deriva directamente de la masa del neutrón, con c exacta.',
    otrasUnidades: ['diferencia con el protón: 1,29333251 MeV'],
    significado:
      'La energía equivalente a la masa del neutrón, ligeramente superior a la del protón.',
    formulaNombre: 'Decaimiento beta del neutrón libre',
    formula: 'n → p + e⁻ + ν̄ₑ, con 0,782 MeV disponibles',
    tangible:
      'La diferencia de 1,29 MeV entre neutrón y protón supera los 0,511 MeV del electrón, y por eso el neutrón libre puede decaer. Ese margen tan justo es una de las condiciones que hicieron posible la nucleosíntesis primordial.',
    busqueda:
      'energia en reposo del neutron 939 mev decaimiento beta neutron libre vida media nuclear',
  },

  /* ── Fisicoquímicas ────────────────────────────────────────── */
  {
    id: 'constante-gases',
    categoria: 'fisicoquimicas',
    nombre: 'Constante de los gases ideales',
    simbolo: 'R',
    valor: '8,314462618',
    unidad: 'J·mol⁻¹·K⁻¹',
    exacta: true,
    notaPrecision:
      'Exacta desde 2019 por ser el producto N_A·k_B, ambas fijadas por definición. El valor mostrado está truncado.',
    otrasUnidades: ['0,082057366 L·atm·mol⁻¹·K⁻¹', '1,987204 cal·mol⁻¹·K⁻¹'],
    significado:
      'La versión «por mol» de la constante de Boltzmann: relaciona presión, volumen y temperatura de un gas.',
    formulaNombre: 'Ecuación de los gases ideales',
    formula: 'P·V = n·R·T   ·   R = N_A·k_B',
    tangible:
      'Con ella se comprueba en un minuto por qué un mol de cualquier gas ocupa unos 22,4 litros a 0 °C y una atmósfera: el volumen apenas depende de qué gas sea.',
    busqueda:
      'constante de los gases ideales r 8314 pv nrt gas ideal termodinamica quimica atmosfera litros',
  },
  {
    id: 'faraday',
    categoria: 'fisicoquimicas',
    nombre: 'Constante de Faraday',
    simbolo: 'F',
    valor: '96.485,33212',
    unidad: 'C/mol',
    exacta: true,
    notaPrecision:
      'Exacta desde 2019 por ser el producto N_A·e, ambas fijadas por definición. Valor truncado.',
    significado:
      'La carga eléctrica que transporta un mol de electrones: el puente entre la electricidad y la química.',
    formulaNombre: 'Leyes de la electrólisis de Faraday',
    formula: 'm = (Q·M) / (n·F)   ·   ΔG = −n·F·E',
    tangible:
      'Para depositar por electrólisis los 63,5 gramos de un mol de cobre (que necesita 2 electrones por átomo) hacen falta casi 193.000 culombios: unas 54 amperios-hora.',
    busqueda:
      'constante de faraday f 96485 electrolisis culombios por mol electroquimica galvanizado pila',
  },
  {
    id: 'boltzmann-ev',
    categoria: 'fisicoquimicas',
    nombre: 'Constante de Boltzmann en electronvoltios',
    simbolo: 'k_B',
    valor: '8,617333262×10⁻⁵',
    unidad: 'eV/K',
    exacta: true,
    notaPrecision:
      'Exacta: es k_B dividida entre la carga elemental, ambas fijadas por definición. Valor truncado.',
    otrasUnidades: ['k_B·T = 0,025852 eV a 300 K', 'k_B·T = 0,08617 eV a 1.000 K'],
    significado:
      'La misma constante de Boltzmann en la unidad de energía habitual en física del estado sólido y de semiconductores.',
    formulaNombre: 'Distribución de Boltzmann',
    formula: 'n ∝ exp(−E / k_B·T)',
    tangible:
      'La regla de oro del laboratorio es «k_B·T ≈ 26 meV a temperatura ambiente»: con ella se estima al vuelo si un nivel de energía estará poblado o si un semiconductor conducirá.',
    busqueda:
      'boltzmann en ev kt 26 mev temperatura ambiente semiconductores estado solido distribucion',
  },
  {
    id: 'volumen-molar-100',
    categoria: 'fisicoquimicas',
    nombre: 'Volumen molar del gas ideal (273,15 K y 100 kPa)',
    simbolo: 'V_m',
    valor: '22,71195464',
    unidad: 'L/mol',
    exacta: true,
    notaPrecision:
      'Exacto por derivarse de R, que es exacta, en unas condiciones de referencia también fijadas por convenio. Este es el valor con la definición actual de STP de la IUPAC (100 kPa).',
    otrasUnidades: ['22,71195464×10⁻³ m³/mol'],
    significado: 'El volumen que ocupa un mol de cualquier gas ideal en condiciones normales.',
    formulaNombre: 'Gas ideal en condiciones de referencia',
    formula: 'V_m = R·T / P',
    tangible:
      'Casi 23 litros por mol, algo más que un cubo de 28 cm de lado: los gases son unas mil veces menos densos que los líquidos, y de ahí que un mol de agua quepa en un vaso pero un mol de vapor no.',
    busqueda:
      'volumen molar gas ideal 22 4 litros 22 71 condiciones normales stp iupac mol quimica',
  },
  {
    id: 'volumen-molar-atm',
    categoria: 'fisicoquimicas',
    nombre: 'Volumen molar del gas ideal (273,15 K y 1 atm)',
    simbolo: 'V_m',
    valor: '22,41396954',
    unidad: 'L/mol',
    exacta: true,
    notaPrecision:
      'Exacto por derivarse de R y de una presión de referencia definida (101.325 Pa). Es el clásico «22,4 litros» de los libros de texto, con la definición antigua de condiciones normales.',
    otrasUnidades: ['22,41396954×10⁻³ m³/mol'],
    significado:
      'El volumen de un mol de gas ideal en las condiciones normales tradicionales, a una atmósfera.',
    formulaNombre: 'Gas ideal en condiciones normales clásicas',
    formula: 'V_m = R·T / P con P = 101.325 Pa',
    tangible:
      'Los famosos 22,4 L/mol siguen apareciendo en muchos problemas, pero conviene indicar siempre a qué presión: con la referencia moderna de 100 kPa el número correcto es 22,7 L/mol.',
    busqueda:
      'volumen molar 22 4 litros mol atmosfera condiciones normales cnpt gas ideal quimica bachillerato',
  },
  {
    id: 'loschmidt',
    categoria: 'fisicoquimicas',
    nombre: 'Constante de Loschmidt (273,15 K y 101,325 kPa)',
    simbolo: 'n₀',
    valor: '2,686780111×10²⁵',
    unidad: 'm⁻³',
    exacta: true,
    notaPrecision:
      'Exacta por derivarse de N_A y R en condiciones de referencia definidas. Valor truncado.',
    significado:
      'Cuántas moléculas hay en un metro cúbico de gas ideal en condiciones normales.',
    formulaNombre: 'Densidad numérica de un gas',
    formula: 'n₀ = N_A / V_m = P / (k_B·T)',
    tangible:
      'Son unos 27 trillones de moléculas por centímetro cúbico. Incluso el mejor vacío de laboratorio, mil billones de veces más enrarecido, sigue conteniendo miles de moléculas por centímetro cúbico.',
    busqueda:
      'constante de loschmidt n0 densidad numerica moleculas por metro cubico gas condiciones normales vacio',
  },
  {
    id: 'segunda-radiacion',
    categoria: 'fisicoquimicas',
    nombre: 'Segunda constante de radiación',
    simbolo: 'c₂',
    valor: '1,438776877×10⁻²',
    unidad: 'm·K',
    exacta: true,
    notaPrecision:
      'Exacta por derivarse de h, c y k_B, todas fijadas por definición: c₂ = h·c/k_B. Valor truncado.',
    otrasUnidades: ['14.387,76877 μm·K'],
    significado:
      'Controla la forma del espectro de un cuerpo negro: dice a qué ritmo cae la emisión hacia longitudes de onda cortas.',
    formulaNombre: 'Ley de Planck de la radiación',
    formula: 'B(λ,T) ∝ 1 / [exp(c₂/(λ·T)) − 1]',
    tangible:
      'Los pirómetros ópticos y las cámaras termográficas convierten brillo en temperatura usando esta constante: es la que traduce «cuánto brilla en el infrarrojo» a «cuántos grados tiene».',
    busqueda:
      'segunda constante de radiacion c2 ley de planck cuerpo negro pirometro termografia espectro',
  },

  /* ── Adoptadas por convenio ────────────────────────────────── */
  {
    id: 'gravedad-estandar',
    categoria: 'adoptadas',
    nombre: 'Aceleración de la gravedad estándar',
    simbolo: 'g_n',
    valor: '9,80665',
    unidad: 'm/s²',
    exacta: true,
    notaPrecision:
      'Exacta por convenio internacional desde 1901: es un valor de referencia acordado, no una medida. La gravedad real varía entre unos 9,78 m/s² en el ecuador y 9,83 m/s² en los polos.',
    otrasUnidades: ['1 kgf = 9,80665 N (exacto)'],
    significado:
      'El valor convenido de la aceleración de caída libre en la superficie terrestre, usado para definir unidades técnicas.',
    formulaNombre: 'Peso y caída libre',
    formula: 'P = m·g   ·   h = ½·g·t²',
    tangible:
      'Cada segundo de caída libre añade casi 10 m/s de velocidad: tras dos segundos ya se va a unos 70 km/h. La altitud influye poco, y en la cima del Everest la gravedad solo baja un 0,3%.',
    busqueda:
      'gravedad estandar g 9 8 981 aceleracion caida libre peso kilogramo fuerza newton',
  },
  {
    id: 'atmosfera',
    categoria: 'adoptadas',
    nombre: 'Atmósfera estándar',
    simbolo: 'atm',
    valor: '101.325',
    unidad: 'Pa',
    exacta: true,
    notaPrecision:
      'Exacta por definición desde 1954. No es la presión de ningún lugar concreto, sino una referencia convenida.',
    otrasUnidades: ['1.013,25 hPa (mbar)', '760 mmHg exactos', '≈ 14,6959 psi'],
    significado: 'La presión de referencia que ejerce la columna de aire en condiciones típicas.',
    formulaNombre: 'Presión hidrostática',
    formula: 'P = ρ·g·h',
    tangible:
      'Una atmósfera equivale al peso de unos 10 metros de agua: por eso a 10 m de profundidad en una piscina la presión total ya se ha duplicado, y una bomba de aspiración no puede subir agua más de esa altura.',
    busqueda:
      'atmosfera estandar presion 101325 pascal bar hectopascal mmhg psi presion atmosferica',
  },
  {
    id: 'electronvoltio',
    categoria: 'adoptadas',
    nombre: 'Electronvoltio',
    simbolo: 'eV',
    valor: '1,602176634×10⁻¹⁹',
    unidad: 'J',
    exacta: true,
    notaPrecision:
      'Exacto desde 2019, porque coincide numéricamente con la carga elemental, que está fijada por definición.',
    otrasUnidades: ['1 MeV = 1,602176634×10⁻¹³ J', '1 eV/partícula ≈ 96,485 kJ/mol'],
    significado:
      'La energía que gana un electrón al atravesar una diferencia de potencial de un voltio.',
    formulaNombre: 'Trabajo eléctrico',
    formula: 'E = q·V   ·   1 eV = e × 1 V',
    tangible:
      'Un enlace químico ronda unos pocos eV, un fotón visible entre 1,6 y 3,3 eV, una radiografía decenas de keV y las colisiones del LHC llegan a los TeV: la misma unidad cubre catorce órdenes de magnitud.',
    busqueda:
      'electronvoltio ev julios energia mev kev gev tev fotones particulas conversion energia',
  },
  {
    id: 'hbarc',
    categoria: 'adoptadas',
    nombre: 'Producto ħ·c (factor de conversión)',
    simbolo: 'ħ·c',
    valor: '197,3269804',
    unidad: 'MeV·fm',
    exacta: true,
    notaPrecision:
      'Exacto por ser producto de ħ (exacta salvo truncamiento de π) y c. Valor truncado.',
    otrasUnidades: ['197,3269804 eV·nm', '1.239,84198 eV·nm para h·c'],
    significado:
      'El factor que convierte energías en longitudes y viceversa en física de partículas y en óptica.',
    formulaNombre: 'Relación energía-longitud de onda',
    formula: 'E(eV) = 1.239,84 / λ(nm)   ·   E(MeV) ≈ 197,3 / r(fm)',
    tangible:
      'Con la regla «1.240 dividido entre nanómetros da electronvoltios» se calcula de cabeza que la luz roja de 620 nm son 2 eV: es el atajo más usado en optoelectrónica y fotovoltaica.',
    busqueda:
      'hbar c 197 mev fm 1240 ev nm conversion energia longitud de onda fotones optica particulas',
  },
  {
    id: 'cero-absoluto',
    categoria: 'adoptadas',
    nombre: 'Cero de la escala Celsius en kelvin',
    simbolo: 'T₀',
    valor: '273,15',
    unidad: 'K',
    exacta: true,
    notaPrecision:
      'Exacto por definición: la escala Celsius se define hoy como la escala Kelvin desplazada exactamente 273,15 unidades.',
    otrasUnidades: ['0 K = −273,15 °C', 'punto triple del agua ≈ 273,16 K'],
    significado:
      'El desplazamiento entre la escala de temperatura cotidiana y la escala absoluta que usa la física.',
    formulaNombre: 'Conversión de temperaturas',
    formula: 'T(K) = T(°C) + 273,15',
    tangible:
      'El cero absoluto no es «mucho frío» sino la ausencia total de energía térmica extraíble, y es inalcanzable: los laboratorios han llegado a milmillonésimas de kelvin, nunca a cero.',
    busqueda:
      'cero absoluto 273 15 kelvin celsius conversion temperatura escala absoluta grados',
  },
];

/* ────────────────────────────────────────────────────────────────
   Componente principal
──────────────────────────────────────────────────────────────── */

export default function TablaConstantesFisicasPage() {
  const [consulta, setConsulta] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaId | 'todas'>('todas');
  const [abiertas, setAbiertas] = useState<string[]>([]);
  const buscadorRef = useRef<HTMLInputElement>(null);

  // Foco automático al cargar: quien llega buscando un valor concreto escribe directo
  useEffect(() => {
    buscadorRef.current?.focus({ preventScroll: true });
  }, []);

  const resultados = useMemo(() => {
    const termino = normalizar(consulta.trim());
    return CONSTANTES.filter((entrada) => {
      const coincideCategoria =
        categoriaActiva === 'todas' || entrada.categoria === categoriaActiva;
      if (!coincideCategoria) return false;
      if (termino === '') return true;
      return normalizar(
        `${entrada.nombre} ${entrada.simbolo} ${entrada.valor} ${entrada.busqueda}`,
      ).includes(termino);
    });
  }, [consulta, categoriaActiva]);

  const alternarFila = (id: string) => {
    setAbiertas((previas) =>
      previas.includes(id) ? previas.filter((item) => item !== id) : [...previas, id],
    );
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">🔬</span> Tabla de Constantes Físicas Fundamentales
        </h1>
        <p className={styles.subtitle}>
          {CONSTANTES.length} constantes con su valor, qué significan en una frase, la fórmula donde
          aparecen y una comparación que las hace tangibles. Cada una marcada como{' '}
          <strong>exacta por definición</strong> o <strong>medida con incertidumbre</strong>.
        </p>
        <span className={styles.fuenteHero}>
          <span aria-hidden="true">📚</span> Valores del ajuste CODATA 2022 (NIST)
        </span>
      </header>

      <LegalNotice />

      {/* Buscador + filtros */}
      <section className={styles.buscadorPanel} aria-label="Buscador de constantes físicas">
        <label className={styles.buscadorLabel} htmlFor="buscador-constantes">
          Busca una constante por nombre, símbolo o palabra suelta
        </label>
        <div className={styles.buscadorWrap}>
          <input
            id="buscador-constantes"
            ref={buscadorRef}
            type="search"
            className={styles.buscadorInput}
            value={consulta}
            onChange={(evento) => setConsulta(evento.target.value)}
            placeholder="avogadro, planck, velocidad de la luz, boltzmann, masa del proton…"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            className={styles.limpiarBtn}
            onClick={() => {
              setConsulta('');
              setCategoriaActiva('todas');
              buscadorRef.current?.focus({ preventScroll: true });
            }}
          >
            <span aria-hidden="true">✕</span> Limpiar
          </button>
        </div>
        <p className={styles.ayudaBusqueda}>
          Funciona con acentos o sin ellos y con sinónimos: <strong>carga del electron</strong>{' '}
          encuentra la carga elemental, <strong>gravedad</strong> encuentra G y{' '}
          <strong>137</strong> encuentra la constante de estructura fina.
        </p>

        <div className={styles.filtros}>
          <button
            type="button"
            className={`${styles.filtroBtn} ${
              categoriaActiva === 'todas' ? styles.filtroBtnActivo : ''
            }`}
            aria-pressed={categoriaActiva === 'todas'}
            onClick={() => setCategoriaActiva('todas')}
          >
            Todas
          </button>
          {CATEGORIAS.map((categoria) => (
            <button
              key={categoria.id}
              type="button"
              className={`${styles.filtroBtn} ${
                categoriaActiva === categoria.id ? styles.filtroBtnActivo : ''
              }`}
              aria-pressed={categoriaActiva === categoria.id}
              onClick={() => setCategoriaActiva(categoria.id)}
            >
              <span aria-hidden="true">{categoria.icono}</span> {categoria.nombre}
            </button>
          ))}
        </div>

        <div className={styles.leyenda}>
          <span className={styles.leyendaItem}>
            <span className={styles.badgeExacta}>Exacta</span> valor fijado por definición, sin
            incertidumbre
          </span>
          <span className={styles.leyendaItem}>
            <span className={styles.badgeMedida}>Medida</span> determinada experimentalmente, con
            incertidumbre
          </span>
        </div>

        <p className={styles.contador} role="status" aria-live="polite">
          {resultados.length} de {CONSTANTES.length} constantes
        </p>
      </section>

      {/* Tabla de constantes */}
      {resultados.length === 0 ? (
        <div className={styles.sinResultados}>
          <p>
            <span aria-hidden="true">🔍</span> No hay ninguna constante que coincida con «{consulta}
            ». Prueba con otro término (por ejemplo, <strong>avogadro</strong>,{' '}
            <strong>rydberg</strong>, <strong>faraday</strong> o <strong>estructura fina</strong>) o
            quita el filtro de categoría.
          </p>
        </div>
      ) : (
        <ul className={styles.lista}>
          {resultados.map((entrada) => {
            const abierta = abiertas.includes(entrada.id);
            return (
              <li key={entrada.id} className={styles.fila}>
                <button
                  type="button"
                  className={`${styles.filaBtn} ${entrada.exacta ? styles.filaBtnExacta : ''}`}
                  aria-expanded={abierta}
                  aria-controls={`detalle-${entrada.id}`}
                  onClick={() => alternarFila(entrada.id)}
                >
                  <span className={styles.filaNombre}>
                    <span className={styles.simbolo}>{entrada.simbolo}</span>
                    {entrada.nombre}
                    <span className={styles.filaCategoria}>
                      {NOMBRE_CATEGORIA[entrada.categoria]}
                    </span>
                    {entrada.exacta ? (
                      <span className={styles.badgeExacta}>Exacta por definición</span>
                    ) : (
                      <span className={styles.badgeMedida}>
                        Medida · u<sub>r</sub> = {entrada.incertidumbre}
                      </span>
                    )}
                  </span>
                  <span className={styles.filaValores}>
                    <span className={styles.valor}>
                      {entrada.valor}
                      <span className={styles.unidad}>{entrada.unidad}</span>
                    </span>
                    {entrada.otrasUnidades && entrada.otrasUnidades.length > 0 && (
                      <span className={styles.valorAlterno}>{entrada.otrasUnidades[0]}</span>
                    )}
                  </span>
                  <span className={styles.chevron} aria-hidden="true">
                    {abierta ? '▲' : '▼'}
                  </span>
                </button>

                {abierta && (
                  <div id={`detalle-${entrada.id}`} className={styles.detalle}>
                    <h3>Qué significa</h3>
                    <p>{entrada.significado}</p>

                    <div className={styles.formulaCaja}>
                      <h3>Dónde aparece: {entrada.formulaNombre}</h3>
                      <div className={styles.formulaExpr}>{entrada.formula}</div>
                    </div>

                    <div className={styles.tangible}>
                      <h3>
                        <span aria-hidden="true">🧭</span> Para hacerse una idea
                      </h3>
                      <p>{entrada.tangible}</p>
                    </div>

                    {entrada.otrasUnidades && entrada.otrasUnidades.length > 0 && (
                      <>
                        <h3>En otras unidades</h3>
                        <ul className={styles.listaUnidades}>
                          {entrada.otrasUnidades.map((unidad) => (
                            <li key={unidad}>{unidad}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    <div
                      className={`${styles.precisionCaja} ${
                        entrada.exacta ? styles.precisionExacta : styles.precisionMedida
                      }`}
                    >
                      <strong>
                        {entrada.exacta
                          ? 'Valor exacto por definición'
                          : `Valor medido · incertidumbre relativa ${entrada.incertidumbre}`}
                      </strong>
                      <br />
                      {entrada.notaPrecision}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Contenido educativo v2.0 */}
      <EducationalSection
        icon="📚"
        title="Entender las constantes, no solo copiar el número"
        subtitle="Qué significa que una constante sea exacta, cómo se leen las incertidumbres y cómo usar bien la tabla"
      >
        <section className={styles.guideSection}>
          <h2>El cambio de 2019: de patrones materiales a constantes fijadas</h2>
          <p>
            Durante más de un siglo, el kilogramo fue un cilindro de platino-iridio guardado en una
            caja fuerte cerca de París. Todas las balanzas del mundo dependían, en último término,
            de ese objeto. El problema es evidente: un objeto se raya, se contamina, cambia de masa
            con el tiempo, y no hay forma de saber si el que ha cambiado es el patrón o las copias.
          </p>
          <p>
            El 20 de mayo de 2019 entró en vigor una revisión del Sistema Internacional que da la
            vuelta al planteamiento. En lugar de definir las unidades con objetos y medir las
            constantes, se <strong>fija el valor de siete constantes</strong> y se deducen las
            unidades a partir de ellas. Un laboratorio de Nairobi, Bogotá o Seúl puede reconstruir el
            kilogramo desde cero con una balanza de Kibble, sin pedirle nada a nadie.
          </p>
          <div className={styles.formulaBox}>
            ΔνCs · c · h · e · k<sub>B</sub> · N<sub>A</sub> · K<sub>cd</sub> → segundo, metro,
            kilogramo, amperio, kelvin, mol y candela
          </div>
          <p>
            La consecuencia práctica es la que marca esta tabla: esas siete constantes{' '}
            <strong>ya no tienen incertidumbre</strong>, porque su valor es una decisión, no una
            medida. Y algunas que antes eran exactas, como la permeabilidad del vacío μ₀, pasaron a
            medirse. Los valores numéricos de todo lo demás proceden del ajuste{' '}
            <strong>CODATA 2022</strong>, la revisión periódica que publica el NIST combinando todos
            los experimentos disponibles con un análisis estadístico global.
          </p>

          <h2>Exactas, derivadas exactas y medidas: tres situaciones distintas</h2>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Por qué</th>
                  <th>¿Lleva incertidumbre?</th>
                  <th>Ejemplos</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Fijada por el SI</td>
                  <td>Su valor se decidió por convenio en 2019 para definir las unidades</td>
                  <td>No, nunca</td>
                  <td>c, h, e, k_B, N_A</td>
                </tr>
                <tr>
                  <td>Derivada exacta</td>
                  <td>Se calcula combinando solo constantes fijadas</td>
                  <td>No, aunque el decimal mostrado esté truncado</td>
                  <td>R, F, σ, R_K, Φ₀</td>
                </tr>
                <tr>
                  <td>Adoptada por convenio</td>
                  <td>Es una referencia acordada, no una propiedad de la naturaleza</td>
                  <td>No, pero el valor real varía</td>
                  <td>g_n, 1 atm, 273,15 K</td>
                </tr>
                <tr>
                  <td>Medida con alta precisión</td>
                  <td>Se determina en experimentos de metrología muy afinados</td>
                  <td>Sí, del orden de 10⁻¹⁰ a 10⁻¹²</td>
                  <td>α, R∞, mₑ, a₀</td>
                </tr>
                <tr>
                  <td>Medida con precisión limitada</td>
                  <td>El efecto es débil o difícil de aislar del entorno</td>
                  <td>Sí, del orden de 10⁻⁵</td>
                  <td>G y las magnitudes de Planck</td>
                </tr>
                <tr>
                  <td>Cociente adimensional</td>
                  <td>Muchas incertidumbres se cancelan al dividir</td>
                  <td>Sí, pero menor que la de cada factor</td>
                  <td>m_p/mₑ, 1/α, g_e</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Cuatro situaciones típicas</h2>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                📝
              </span>
              <strong>Resolver un problema de clase</strong>
              <p>
                Copia el valor con dos o tres cifras significativas más que el dato peor conocido
                del enunciado y redondea solo al final. Arrastrar cifras de más no da precisión
                falsa: redondear a mitad de camino sí introduce error.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                🧪
              </span>
              <strong>Programar un cálculo o una simulación</strong>
              <p>
                Copia el valor completo y guárdalo en una constante con nombre, nunca lo escribas
                inline en varias fórmulas. Comprueba también que las unidades son coherentes: la
                mayoría de errores numéricos son en realidad errores de unidades.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                🔍
              </span>
              <strong>Estimar un orden de magnitud</strong>
              <p>
                Aquí sobran los decimales: c ≈ 3×10⁸ m/s, h ≈ 6,6×10⁻³⁴ J·s, N_A ≈ 6×10²³. Lo que
                importa es el exponente. Una estimación con un factor 2 de error suele bastar para
                decidir si un efecto es relevante.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">
                🎓
              </span>
              <strong>Explicar de dónde sale un número</strong>
              <p>
                Despliega la constante y usa la fórmula y la comparación tangible. Decir «k_B·T son
                unos 26 meV a temperatura ambiente» explica más que recitar 1,380649×10⁻²³ J/K.
              </p>
            </div>
          </div>

          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Por qué unas constantes son exactas y otras no?</h4>
              <p>
                Porque desde 2019 las unidades del SI se definen fijando el valor de siete
                constantes. Ese valor no se mide: se decide, igual que se decidió que un metro fuera
                lo que fuera. Todo lo que se calcula únicamente a partir de esas siete (R, F, σ, la
                constante de Wien) hereda la exactitud.
              </p>
              <p className={styles.faqTip}>
                Regla práctica: si la constante aparece en la definición de una unidad, es exacta. Si
                describe una propiedad de la naturaleza que hay que ir a medir al laboratorio,
                lleva incertidumbre.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué significa exactamente «incertidumbre relativa 3,1×10⁻¹⁰»?</h4>
              <p>
                Que el margen de duda es de 3,1 partes por cada diez mil millones del propio valor.
                En la masa del electrón, eso afecta a la décima cifra significativa: las nueve
                primeras son firmes. La notación compacta 9,1093837139(28)×10⁻³¹ significa que la
                incertidumbre estándar vale 28 en las dos últimas cifras mostradas.
              </p>
              <p className={styles.faqTip}>
                Una incertidumbre estándar no es un límite máximo de error: es una desviación
                típica. El valor real cae dentro de ese margen con una probabilidad de en torno al
                68%.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cambian las constantes con el tiempo?</h4>
              <p>
                Lo que cambia es el conocimiento que tenemos de ellas, no las constantes mismas. Cada
                cuatro años aproximadamente, CODATA publica un ajuste que incorpora los experimentos
                nuevos y afina las cifras finales. Existe además una línea de investigación que
                busca variaciones reales de constantes como α a lo largo de la historia cósmica, y
                hasta hoy todas las observaciones son compatibles con que no varíen.
              </p>
              <p className={styles.faqTip}>
                Si un valor de un libro antiguo difiere del actual en la última cifra, no es un
                error del libro: es un ajuste posterior. Si difiere en la tercera, revisa las
                unidades.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué hay constantes que valen «1» en física teórica?</h4>
              <p>
                En unidades naturales se eligen escalas de medida en las que c = ħ = 1, lo que
                simplifica enormemente las ecuaciones: E = mc² se convierte en E = m. No es que
                cambie la física, cambia el sistema de unidades. Al final del cálculo hay que
                reintroducir los factores para volver a metros, segundos y kilogramos, y ahí es
                donde resulta útil el factor ħ·c ≈ 197,3 MeV·fm.
              </p>
              <p className={styles.faqTip}>
                Las constantes adimensionales, como α o m_p/mₑ, no se pueden hacer valer 1 con ningún
                truco de unidades: son números reales de la naturaleza y por eso se consideran las
                más fundamentales.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuántas cifras hay que usar en un examen o en un informe?</h4>
              <p>
                Tantas como permita el dato peor conocido del problema. Si mides una longitud con
                tres cifras, escribir el resultado con ocho es una precisión inventada. La regla
                habitual es conservar una o dos cifras extra en los pasos intermedios y redondear
                únicamente el resultado final.
              </p>
              <p className={styles.faqTip}>
                En un informe de laboratorio conviene indicar también la fuente y el año del ajuste
                («CODATA 2022»): es lo que permite a otra persona reproducir el cálculo años después.
              </p>
            </div>
          </div>

          <h2>Cómo usar bien esta tabla, paso a paso</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Busca por lo que tengas en la cabeza</strong>
                <p>
                  El buscador acepta el nombre, el símbolo y variantes coloquiales, con acentos o sin
                  ellos: «numero de avogadro», «carga del electron», «velocidad de la luz» o
                  directamente «137» llegan a la constante correcta.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Mira la etiqueta antes que el número</strong>
                <p>
                  Si pone «Exacta por definición», puedes usar todas las cifras sin pensar en
                  errores. Si pone «Medida», anota también la incertidumbre relativa: la necesitarás
                  si tienes que propagar errores.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Comprueba las unidades antes de sustituir</strong>
                <p>
                  Casi todos los errores graves de cálculo son errores de unidades. Antes de meter
                  el número en la fórmula, verifica que trabajas en SI o convierte de forma
                  explícita; la lista «En otras unidades» de cada ficha te da las equivalencias más
                  habituales.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Despliega para ver dónde aparece</strong>
                <p>
                  Cada ficha muestra la ley o relación concreta en la que interviene la constante.
                  Si el número no encaja en tu problema, quizá la constante que necesitas es otra
                  parecida: R en vez de k_B, o μ_N en vez de μ_B.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Redondea al final y cita la fuente</strong>
                <p>
                  Haz el cálculo completo con todas las cifras, redondea solo el resultado y, si es
                  un trabajo académico, indica que los valores proceden del ajuste CODATA 2022
                  publicado por el NIST.
                </p>
              </div>
            </div>
          </div>

          <h2>Trucos que ahorran tiempo</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                💡
              </span>
              <strong>1.240 dividido entre nanómetros</strong>
              <p>
                Para pasar longitud de onda a energía: E(eV) = 1.240/λ(nm). La luz roja de 620 nm son
                2 eV y la azul de 450 nm unos 2,75 eV. Sirve para LED, fotovoltaica y espectroscopia.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🌡️
              </span>
              <strong>k_B·T ≈ 26 meV a temperatura ambiente</strong>
              <p>
                Con este número decides de cabeza si un proceso térmico es viable: si la barrera es
                de varios eV, la agitación térmica no la supera; si es de décimas, sí.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ⚖️
              </span>
              <strong>1 u ≈ 1 g/mol</strong>
              <p>
                La masa de una molécula en unidades de masa atómica coincide numéricamente con los
                gramos por mol. Es el atajo que convierte cualquier fórmula química en una pesada de
                laboratorio.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔗
              </span>
              <strong>Guarda el enlace, no captures la pantalla</strong>
              <p>
                Los ajustes CODATA se revisan cada pocos años. Una captura envejece en silencio;
                volver a la fuente garantiza que trabajas con el ajuste vigente.
              </p>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">
                ⚠️
              </span>
              <h3>Errores frecuentes al usar constantes físicas</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Confundir h con ħ.</strong> Se diferencian en un factor 2π ≈ 6,28, así que
                el resultado sale mal por casi un orden de magnitud. Regla: si la fórmula habla de
                frecuencia ν en hercios, va h; si habla de frecuencia angular ω o de momento
                angular, va ħ.
              </li>
              <li>
                <strong>Mezclar R y k_B.</strong> Son la misma idea a distinta escala: R trabaja por
                mol y k_B por partícula, y se diferencian justamente en N_A. Usar R con el número de
                moléculas en vez de con los moles introduce un error de 10²³.
              </li>
              <li>
                <strong>Dar por bueno «22,4 litros por mol» sin mirar la presión.</strong> Ese valor
                corresponde a 273,15 K y 1 atmósfera. Con la referencia moderna de la IUPAC (100
                kPa) son 22,7 L/mol, casi un 1,3% de diferencia.
              </li>
              <li>
                <strong>Arrastrar decimales que el problema no soporta.</strong> Escribir un
                resultado con once cifras cuando el dato de partida tenía dos no aporta precisión:
                sugiere una fiabilidad que el cálculo no tiene, y en un informe de laboratorio se
                considera un error.
              </li>
              <li>
                <strong>Tratar la incertidumbre como un error máximo.</strong> La incertidumbre
                estándar es una desviación típica, no una cota. Un resultado que se aparta dos veces
                esa cantidad no está necesariamente equivocado.
              </li>
              <li>
                <strong>Usar 9,8 m/s² como si fuera una constante universal.</strong> La gravedad
                estándar es un valor convenido; la real varía con la latitud y la altitud entre unos
                9,78 y 9,83 m/s², y en la Luna es seis veces menor.
              </li>
              <li>
                <strong>Copiar constantes de fuentes sin fecha.</strong> Muchas páginas siguen
                mostrando valores anteriores a la revisión del SI de 2019, con μ₀ exacta y N_A
                incierta. Comprueba siempre a qué ajuste CODATA corresponden los números.
              </li>
            </ul>
          </div>

          <h2>Fuente de los datos</h2>
          <p>
            Todos los valores proceden del ajuste <strong>CODATA 2022</strong>, elaborado por el
            Committee on Data of the International Science Council y publicado por el NIST en su base
            de datos de constantes físicas fundamentales. Las definiciones de las unidades siguen la
            novena edición del folleto del SI, publicada por la Oficina Internacional de Pesas y
            Medidas tras la revisión que entró en vigor el 20 de mayo de 2019.
          </p>
          <p>
            Cuando una constante aparece con menos cifras que en la fuente original, es un
            truncamiento deliberado para evitar errores de transcripción: la precisión mostrada
            sobra ampliamente para cualquier uso docente o de ingeniería. Para trabajo de metrología
            de precisión, consulta siempre directamente la base del NIST.
          </p>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('tabla-constantes-fisicas')} />
      <ShareCard appName="tabla-constantes-fisicas" />
      <Footer appName="tabla-constantes-fisicas" />
    </div>
  );
}
