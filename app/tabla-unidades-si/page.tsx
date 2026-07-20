'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import styles from './TablaUnidadesSi.module.css';
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
   Normaliza texto para buscar sin acentos ni mayúsculas.
──────────────────────────────────────────────────────────────── */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/* ────────────────────────────────────────────────────────────────
   Modelo de datos
──────────────────────────────────────────────────────────────── */

type CategoriaId = 'basicas' | 'derivadas' | 'prefijos' | 'aceptadas';

interface Categoria {
  id: CategoriaId;
  nombre: string;
  icono: string;
}

interface EntradaUnidad {
  id: string;
  categoria: CategoriaId;
  /** Nombre de la unidad o del prefijo */
  nombre: string;
  /** Magnitud que mide (o «factor» en los prefijos) */
  magnitud: string;
  /** Símbolo */
  simbolo: ReactNode;
  /** Expresión resumida que se muestra en la fila (en SI o factor) */
  expr?: ReactNode;
  /** Texto plano para el buscador: nombre, magnitud y sinónimos */
  busqueda: string;
  /** Definición formal (unidades básicas: por constante fijada) */
  definicion?: string;
  /** Expresión en otras unidades del SI (derivadas) */
  otrasSI?: ReactNode;
  /** Descomposición paso a paso hasta unidades básicas (derivadas) */
  descomposicionTitulo?: string;
  descomposicion?: ReactNode[];
  /** Ejemplo de orden de magnitud */
  magnitudTitulo: string;
  magnitudEjemplo: ReactNode;
}

const CATEGORIAS: Categoria[] = [
  { id: 'basicas', nombre: 'Unidades básicas', icono: '🧱' },
  { id: 'derivadas', nombre: 'Unidades derivadas', icono: '🔧' },
  { id: 'prefijos', nombre: 'Prefijos', icono: '🔢' },
  { id: 'aceptadas', nombre: 'Unidades aceptadas', icono: '✅' },
];

const NOMBRE_CATEGORIA: Record<CategoriaId, string> = {
  basicas: 'Unidad básica',
  derivadas: 'Unidad derivada con nombre propio',
  prefijos: 'Prefijo del SI',
  aceptadas: 'Unidad aceptada para uso con el SI',
};

/* ────────────────────────────────────────────────────────────────
   TABLA DE UNIDADES DEL SI
   Definiciones según la 9ª edición del Folleto SI (BIPM, 2019),
   con las constantes fijadas en la redefinición del 20 de mayo de 2019.
──────────────────────────────────────────────────────────────── */

const UNIDADES: EntradaUnidad[] = [
  /* ── 7 unidades básicas ───────────────────────────────────── */
  {
    id: 'segundo',
    categoria: 'basicas',
    nombre: 'Segundo',
    magnitud: 'Tiempo',
    simbolo: <>s</>,
    busqueda: 'segundo s tiempo cesio 133 frecuencia de transicion hiperfina reloj atomico duracion',
    definicion:
      'Se define fijando el valor numérico de la frecuencia de transición hiperfina del estado fundamental del átomo de cesio-133 en ΔνCs = 9 192 631 770 Hz. Un segundo equivale, por tanto, a 9 192 631 770 periodos de esa radiación. Es la unidad medida con más precisión de todo el SI, y de ella dependen indirectamente el metro, el amperio, la candela y el kelvin.',
    magnitudTitulo: 'Orden de magnitud',
    magnitudEjemplo:
      'Un parpadeo dura ≈ 0,1 s; un latido en reposo ≈ 1 s. Un reloj atómico de cesio se desvía menos de 1 s en 30 millones de años.',
  },
  {
    id: 'metro',
    categoria: 'basicas',
    nombre: 'Metro',
    magnitud: 'Longitud',
    simbolo: <>m</>,
    busqueda: 'metro m longitud distancia velocidad de la luz c 299792458 espacio',
    definicion:
      'Se define fijando la velocidad de la luz en el vacío en c = 299 792 458 m/s. Como el segundo ya está definido, el metro es la distancia que recorre la luz en el vacío durante 1/299 792 458 de segundo. Desde 1983 el metro dejó de depender de un patrón físico y quedó ligado a una constante universal.',
    magnitudTitulo: 'Orden de magnitud',
    magnitudEjemplo:
      'La altura de una puerta ≈ 2 m. La luz recorre 1 m en unos 3,3 nanosegundos; en un segundo da siete vueltas y media a la Tierra.',
  },
  {
    id: 'kilogramo',
    categoria: 'basicas',
    nombre: 'Kilogramo',
    magnitud: 'Masa',
    simbolo: <>kg</>,
    busqueda:
      'kilogramo kg masa constante de planck h balanza de kibble peso cilindro de platino iridio redefinicion 2019',
    definicion:
      'Se define fijando la constante de Planck en h = 6,626 070 15 × 10⁻³⁴ J·s (equivalente a kg·m²·s⁻¹). Con el metro y el segundo ya definidos, esa relación fija el kilogramo. Desde 2019 dejó de ser la masa del cilindro de platino e iridio guardado en Sèvres, que había derivado unas decenas de microgramos: hoy cualquier laboratorio puede realizarlo con una balanza de Kibble. Es la única unidad básica cuyo nombre lleva un prefijo (kilo).',
    magnitudTitulo: 'Orden de magnitud',
    magnitudEjemplo:
      'Un litro de agua tiene una masa de ≈ 1 kg. Una manzana ≈ 0,15 kg; una persona adulta ≈ 70 kg.',
  },
  {
    id: 'amperio',
    categoria: 'basicas',
    nombre: 'Amperio',
    magnitud: 'Corriente eléctrica',
    simbolo: <>A</>,
    busqueda:
      'amperio ampere a corriente electrica carga elemental e intensidad electrones por segundo',
    definicion:
      'Se define fijando la carga elemental en e = 1,602 176 634 × 10⁻¹⁹ C, y como el culombio es A·s, esto fija el amperio. Un amperio equivale al paso de 1/(1,602 176 634 × 10⁻¹⁹) ≈ 6,24 × 10¹⁸ cargas elementales por segundo. Sustituyó a la antigua definición basada en la fuerza entre dos conductores paralelos.',
    magnitudTitulo: 'Orden de magnitud',
    magnitudEjemplo:
      'El cargador de un móvil entrega ≈ 2 A; un horno eléctrico ≈ 10 A. Un rayo puede alcanzar los 30 000 A durante microsegundos.',
  },
  {
    id: 'kelvin',
    categoria: 'basicas',
    nombre: 'Kelvin',
    magnitud: 'Temperatura termodinámica',
    simbolo: <>K</>,
    busqueda:
      'kelvin k temperatura termodinamica constante de boltzmann cero absoluto grados celsius punto triple del agua',
    definicion:
      'Se define fijando la constante de Boltzmann en k = 1,380 649 × 10⁻²³ J/K. La escala arranca en el cero absoluto (0 K = −273,15 °C), la temperatura a la que cesa la agitación térmica. Un incremento de 1 K es exactamente igual a un incremento de 1 °C; solo cambia el origen. Desde 2019 ya no depende del punto triple del agua.',
    magnitudTitulo: 'Orden de magnitud',
    magnitudEjemplo:
      'El agua se congela a 273,15 K (0 °C) y hierve a 373,15 K (100 °C). La superficie del Sol ronda los 5 800 K.',
  },
  {
    id: 'mol',
    categoria: 'basicas',
    nombre: 'Mol',
    magnitud: 'Cantidad de sustancia',
    simbolo: <>mol</>,
    busqueda:
      'mol cantidad de sustancia numero de avogadro NA 6.022 particulas atomos moleculas quimica',
    definicion:
      'Se define fijando el número de Avogadro en NA = 6,022 140 76 × 10²³ mol⁻¹. Un mol contiene exactamente ese número de entidades elementales (átomos, moléculas, iones…), que deben especificarse siempre. Desde 2019 quedó desligado del kilogramo: ya no se define a partir de los gramos de carbono-12, sino como un recuento fijo de partículas.',
    magnitudTitulo: 'Orden de magnitud',
    magnitudEjemplo:
      'Un mol de agua son 18 g; un mol de carbono, 12 g. Si repartieras un mol de granos de arroz por toda la Tierra, la cubrirían con una capa de kilómetros de espesor.',
  },
  {
    id: 'candela',
    categoria: 'basicas',
    nombre: 'Candela',
    magnitud: 'Intensidad luminosa',
    simbolo: <>cd</>,
    busqueda:
      'candela cd intensidad luminosa eficacia luminosa Kcd 683 vela luz fotometria lumen',
    definicion:
      'Se define fijando la eficacia luminosa de una radiación monocromática de frecuencia 540 × 10¹² Hz (luz verde-amarilla, a la que el ojo humano es más sensible) en Kcd = 683 lm/W. Es la única unidad básica que incorpora la respuesta del ojo humano, así que no es puramente física: pondera la energía por cómo la percibimos.',
    magnitudTitulo: 'Orden de magnitud',
    magnitudEjemplo:
      'Una vela emite ≈ 1 cd (de ahí su nombre). Una bombilla LED doméstica ronda las 100-150 cd según el ángulo.',
  },

  /* ── 22 unidades derivadas con nombre propio ──────────────── */
  {
    id: 'radian',
    categoria: 'derivadas',
    nombre: 'Radián',
    magnitud: 'Ángulo plano',
    simbolo: <>rad</>,
    expr: <>m/m</>,
    busqueda: 'radian rad angulo plano arco circunferencia adimensional grados pi',
    otrasSI: <>rad = m·m⁻¹ = 1</>,
    descomposicionTitulo: 'Por qué es adimensional',
    descomposicion: [
      <>Un ángulo en radianes es el cociente entre la longitud del arco y el radio: θ = s/r</>,
      <>Ambas son longitudes (m), así que rad = m/m = 1</>,
      <>Se conserva el nombre «rad» para dejar claro que se habla de un ángulo, no de un número puro</>,
    ],
    magnitudTitulo: 'Referencia útil',
    magnitudEjemplo:
      'Una vuelta completa son 2π rad ≈ 6,283 rad = 360°. Un radián ≈ 57,30°, el ángulo cuyo arco mide justo un radio.',
  },
  {
    id: 'estereorradian',
    categoria: 'derivadas',
    nombre: 'Estereorradián',
    magnitud: 'Ángulo sólido',
    simbolo: <>sr</>,
    expr: <>m²/m²</>,
    busqueda: 'estereorradian sr angulo solido esfera cono adimensional superficie',
    otrasSI: <>sr = m²·m⁻² = 1</>,
    descomposicionTitulo: 'Por qué es adimensional',
    descomposicion: [
      <>Es el análogo tridimensional del radián: Ω = A/r², área sobre radio al cuadrado</>,
      <>Área (m²) entre radio al cuadrado (m²): sr = m²/m² = 1</>,
    ],
    magnitudTitulo: 'Referencia útil',
    magnitudEjemplo:
      'Toda la esfera abarca 4π sr ≈ 12,566 sr. El flujo luminoso (lumen) es la intensidad (candela) integrada sobre los estereorradianes.',
  },
  {
    id: 'hercio',
    categoria: 'derivadas',
    nombre: 'Hercio',
    magnitud: 'Frecuencia',
    simbolo: <>Hz</>,
    expr: <>s⁻¹</>,
    busqueda: 'hercio hertz hz frecuencia ciclos por segundo oscilaciones periodo ondas',
    otrasSI: <>Hz = s⁻¹</>,
    descomposicionTitulo: 'En unidades básicas',
    descomposicion: [
      <>La frecuencia es el número de ciclos por segundo: f = 1/T</>,
      <>Al ser «cuentas» adimensionales por segundo, Hz = 1/s = s⁻¹</>,
      <>Se reserva el hercio para fenómenos periódicos; el becquerel (también s⁻¹) para sucesos aleatorios</>,
    ],
    magnitudTitulo: 'Orden de magnitud',
    magnitudEjemplo:
      'La corriente eléctrica en Europa es de 50 Hz. El oído humano percibe de 20 Hz a 20 000 Hz. Un procesador moderno trabaja a varios GHz (miles de millones de Hz).',
  },
  {
    id: 'newton',
    categoria: 'derivadas',
    nombre: 'Newton',
    magnitud: 'Fuerza',
    simbolo: <>N</>,
    expr: <>kg·m·s⁻²</>,
    busqueda: 'newton n fuerza masa por aceleracion segunda ley peso empuje dinamica',
    otrasSI: <>N = kg·m/s²</>,
    descomposicionTitulo: 'Desde la segunda ley de Newton',
    descomposicion: [
      <>F = m·a: masa (kg) por aceleración (m/s²)</>,
      <>Por tanto N = kg · m/s² = kg·m·s⁻²</>,
      <>Un newton es la fuerza que da a 1 kg una aceleración de 1 m/s²</>,
    ],
    magnitudTitulo: 'Orden de magnitud',
    magnitudEjemplo:
      'El peso de una manzana (≈ 100 g) es de ≈ 1 N. El peso de una persona de 70 kg es de ≈ 686 N (70 × 9,81).',
  },
  {
    id: 'pascal',
    categoria: 'derivadas',
    nombre: 'Pascal',
    magnitud: 'Presión, tensión mecánica',
    simbolo: <>Pa</>,
    expr: <>kg·m⁻¹·s⁻²</>,
    busqueda: 'pascal pa presion tension fuerza por superficie bar atmosfera hectopascal neumaticos',
    otrasSI: <>Pa = N/m² = kg·m⁻¹·s⁻²</>,
    descomposicionTitulo: 'Desde fuerza entre superficie',
    descomposicion: [
      <>Presión = fuerza / área: Pa = N/m²</>,
      <>Sustituyendo N = kg·m·s⁻²: Pa = kg·m·s⁻² / m² = kg·m⁻¹·s⁻²</>,
    ],
    magnitudTitulo: 'Orden de magnitud',
    magnitudEjemplo:
      'La presión atmosférica al nivel del mar ≈ 101 325 Pa ≈ 1013 hPa. Los neumáticos de un coche van a ≈ 220 000 Pa (2,2 bar). Un pascal es una presión pequeñísima.',
  },
  {
    id: 'julio',
    categoria: 'derivadas',
    nombre: 'Julio',
    magnitud: 'Energía, trabajo, calor',
    simbolo: <>J</>,
    expr: <>kg·m²·s⁻²</>,
    busqueda: 'julio joule j energia trabajo calor fuerza por distancia caloria kilovatio hora electronvoltio',
    otrasSI: <>J = N·m = kg·m²/s²</>,
    descomposicionTitulo: 'Desde trabajo = fuerza × distancia',
    descomposicion: [
      <>Trabajo = fuerza · distancia: J = N·m</>,
      <>Sustituyendo N = kg·m·s⁻²: J = kg·m·s⁻² · m = kg·m²·s⁻²</>,
      <>Un julio es el trabajo de una fuerza de 1 N a lo largo de 1 m</>,
    ],
    magnitudTitulo: 'Orden de magnitud',
    magnitudEjemplo:
      'Levantar una manzana 1 m consume ≈ 1 J. Una caloría alimentaria (kcal) son 4184 J. Un kWh son 3,6 millones de J.',
  },
  {
    id: 'vatio',
    categoria: 'derivadas',
    nombre: 'Vatio',
    magnitud: 'Potencia, flujo de energía',
    simbolo: <>W</>,
    expr: <>kg·m²·s⁻³</>,
    busqueda: 'vatio watt w potencia energia por segundo caballos de vapor consumo electrico bombilla',
    otrasSI: <>W = J/s = kg·m²/s³</>,
    descomposicionTitulo: 'Desde energía por segundo',
    descomposicion: [
      <>Potencia = energía / tiempo: W = J/s</>,
      <>Sustituyendo J = kg·m²·s⁻²: W = kg·m²·s⁻² / s = kg·m²·s⁻³</>,
    ],
    magnitudTitulo: 'Orden de magnitud',
    magnitudEjemplo:
      'Una bombilla LED consume ≈ 10 W; un microondas ≈ 800 W. El cuerpo humano en reposo disipa ≈ 100 W. Un caballo de vapor equivale a 735,5 W.',
  },
  {
    id: 'culombio',
    categoria: 'derivadas',
    nombre: 'Culombio',
    magnitud: 'Carga eléctrica',
    simbolo: <>C</>,
    expr: <>A·s</>,
    busqueda: 'culombio coulomb c carga electrica amperio por segundo electrones faradio',
    otrasSI: <>C = A·s</>,
    descomposicionTitulo: 'Desde corriente por tiempo',
    descomposicion: [
      <>Carga = corriente · tiempo: C = A·s</>,
      <>Un culombio es la carga que atraviesa una sección cuando circula 1 A durante 1 s</>,
    ],
    magnitudTitulo: 'Orden de magnitud',
    magnitudEjemplo:
      'Un culombio equivale a ≈ 6,24 × 10¹⁸ electrones. La carga elemental es minúscula: e = 1,602 × 10⁻¹⁹ C.',
  },
  {
    id: 'voltio',
    categoria: 'derivadas',
    nombre: 'Voltio',
    magnitud: 'Potencial y tensión eléctrica',
    simbolo: <>V</>,
    expr: <>kg·m²·s⁻³·A⁻¹</>,
    busqueda: 'voltio volt v potencial tension diferencia de potencial fuerza electromotriz pila enchufe',
    otrasSI: <>V = W/A = J/C = kg·m²·s⁻³·A⁻¹</>,
    descomposicionTitulo: 'Desde potencia entre corriente',
    descomposicion: [
      <>Tensión = potencia / corriente: V = W/A</>,
      <>Sustituyendo W = kg·m²·s⁻³: V = kg·m²·s⁻³ / A = kg·m²·s⁻³·A⁻¹</>,
      <>Equivale también a energía por carga: V = J/C</>,
    ],
    magnitudTitulo: 'Orden de magnitud',
    magnitudEjemplo:
      'Una pila AA da 1,5 V; el enchufe doméstico en Europa, 230 V. Una línea de alta tensión puede superar los 400 000 V.',
  },
  {
    id: 'faradio',
    categoria: 'derivadas',
    nombre: 'Faradio',
    magnitud: 'Capacidad eléctrica',
    simbolo: <>F</>,
    expr: <>kg⁻¹·m⁻²·s⁴·A²</>,
    busqueda: 'faradio farad f capacidad electrica condensador carga por voltaje microfaradio picofaradio',
    otrasSI: <>F = C/V = A²·s⁴·kg⁻¹·m⁻²</>,
    descomposicionTitulo: 'Desde carga entre tensión',
    descomposicion: [
      <>Capacidad = carga / tensión: F = C/V</>,
      <>Sustituyendo C = A·s y V = kg·m²·s⁻³·A⁻¹:</>,
      <>F = (A·s) / (kg·m²·s⁻³·A⁻¹) = kg⁻¹·m⁻²·s⁴·A²</>,
    ],
    magnitudTitulo: 'Orden de magnitud',
    magnitudEjemplo:
      'El faradio es enorme: los condensadores habituales van en microfaradios (µF) o picofaradios (pF). Un supercondensador de varios faradios ya es un componente notable.',
  },
  {
    id: 'ohmio',
    categoria: 'derivadas',
    nombre: 'Ohmio',
    magnitud: 'Resistencia eléctrica',
    simbolo: <>Ω</>,
    expr: <>kg·m²·s⁻³·A⁻²</>,
    busqueda: 'ohmio ohm resistencia electrica ley de ohm tension entre corriente kiloohmio megaohmio resistor',
    otrasSI: <>Ω = V/A = kg·m²·s⁻³·A⁻²</>,
    descomposicionTitulo: 'Desde la ley de Ohm',
    descomposicion: [
      <>Resistencia = tensión / corriente: Ω = V/A</>,
      <>Sustituyendo V = kg·m²·s⁻³·A⁻¹: Ω = kg·m²·s⁻³·A⁻¹ / A = kg·m²·s⁻³·A⁻²</>,
    ],
    magnitudTitulo: 'Orden de magnitud',
    magnitudEjemplo:
      'Un cable de cobre tiene una resistencia casi nula; una resistencia de circuito ronda cientos o miles de Ω. El cuerpo humano seco: cientos de miles de Ω.',
  },
  {
    id: 'siemens',
    categoria: 'derivadas',
    nombre: 'Siemens',
    magnitud: 'Conductancia eléctrica',
    simbolo: <>S</>,
    expr: <>kg⁻¹·m⁻²·s³·A²</>,
    busqueda: 'siemens s conductancia electrica inverso del ohmio mho conductividad',
    otrasSI: <>S = A/V = Ω⁻¹ = kg⁻¹·m⁻²·s³·A²</>,
    descomposicionTitulo: 'Es el inverso del ohmio',
    descomposicion: [
      <>Conductancia = 1 / resistencia: S = 1/Ω = A/V</>,
      <>Invirtiendo Ω = kg·m²·s⁻³·A⁻²: S = kg⁻¹·m⁻²·s³·A²</>,
    ],
    magnitudTitulo: 'Referencia útil',
    magnitudEjemplo:
      'Una resistencia de 10 Ω tiene una conductancia de 0,1 S. Se usa sobre todo al hablar de conductividad de disoluciones (S/m).',
  },
  {
    id: 'weber',
    categoria: 'derivadas',
    nombre: 'Weber',
    magnitud: 'Flujo magnético',
    simbolo: <>Wb</>,
    expr: <>kg·m²·s⁻²·A⁻¹</>,
    busqueda: 'weber wb flujo magnetico induccion faraday espira bobina tesla',
    otrasSI: <>Wb = V·s = kg·m²·s⁻²·A⁻¹</>,
    descomposicionTitulo: 'Desde la ley de Faraday',
    descomposicion: [
      <>Una variación de flujo de 1 Wb en 1 s induce 1 V: Wb = V·s</>,
      <>Sustituyendo V = kg·m²·s⁻³·A⁻¹: Wb = kg·m²·s⁻³·A⁻¹ · s = kg·m²·s⁻²·A⁻¹</>,
    ],
    magnitudTitulo: 'Referencia útil',
    magnitudEjemplo:
      'El flujo magnético mide cuántas «líneas de campo» atraviesan una superficie. Un weber sobre un metro cuadrado equivale a un tesla.',
  },
  {
    id: 'tesla',
    categoria: 'derivadas',
    nombre: 'Tesla',
    magnitud: 'Densidad de flujo magnético',
    simbolo: <>T</>,
    expr: <>kg·s⁻²·A⁻¹</>,
    busqueda: 'tesla t campo magnetico densidad de flujo induccion magnetica gauss resonancia iman',
    otrasSI: <>T = Wb/m² = kg·s⁻²·A⁻¹</>,
    descomposicionTitulo: 'Desde flujo entre superficie',
    descomposicion: [
      <>Densidad de flujo = flujo / área: T = Wb/m²</>,
      <>Sustituyendo Wb = kg·m²·s⁻²·A⁻¹: T = kg·m²·s⁻²·A⁻¹ / m² = kg·s⁻²·A⁻¹</>,
    ],
    magnitudTitulo: 'Orden de magnitud',
    magnitudEjemplo:
      'El campo magnético terrestre ≈ 0,00005 T (50 µT). Un imán de nevera ≈ 0,01 T. Una resonancia magnética hospitalaria: de 1,5 a 3 T.',
  },
  {
    id: 'henrio',
    categoria: 'derivadas',
    nombre: 'Henrio',
    magnitud: 'Inductancia',
    simbolo: <>H</>,
    expr: <>kg·m²·s⁻²·A⁻²</>,
    busqueda: 'henrio henry h inductancia bobina inductor autoinduccion milihenrio',
    otrasSI: <>H = Wb/A = V·s/A = kg·m²·s⁻²·A⁻²</>,
    descomposicionTitulo: 'Desde flujo entre corriente',
    descomposicion: [
      <>Inductancia = flujo / corriente: H = Wb/A</>,
      <>Sustituyendo Wb = kg·m²·s⁻²·A⁻¹: H = kg·m²·s⁻²·A⁻¹ / A = kg·m²·s⁻²·A⁻²</>,
    ],
    magnitudTitulo: 'Referencia útil',
    magnitudEjemplo:
      'Una bobina de un henrio induce 1 V cuando la corriente que la atraviesa varía a razón de 1 A/s. Las bobinas de un circuito suelen medirse en milihenrios (mH).',
  },
  {
    id: 'grado-celsius',
    categoria: 'derivadas',
    nombre: 'Grado Celsius',
    magnitud: 'Temperatura Celsius',
    simbolo: <>°C</>,
    expr: <>K</>,
    busqueda: 'grado celsius centigrado temperatura kelvin 273.15 agua congela hierve termometro',
    otrasSI: <>t (°C) = T (K) − 273,15</>,
    descomposicionTitulo: 'Relación con el kelvin',
    descomposicion: [
      <>Un incremento de 1 °C es idéntico a un incremento de 1 K: solo cambia el origen</>,
      <>El cero de la escala Celsius está en 273,15 K (punto de congelación del agua)</>,
      <>Por eso las diferencias de temperatura son iguales en ambas escalas, pero los valores absolutos no</>,
    ],
    magnitudTitulo: 'Orden de magnitud',
    magnitudEjemplo:
      'El agua se congela a 0 °C y hierve a 100 °C (a nivel del mar). La temperatura corporal ronda los 37 °C. El cero absoluto está en −273,15 °C.',
  },
  {
    id: 'lumen',
    categoria: 'derivadas',
    nombre: 'Lumen',
    magnitud: 'Flujo luminoso',
    simbolo: <>lm</>,
    expr: <>cd</>,
    busqueda: 'lumen lm flujo luminoso candela estereorradian bombilla brillo iluminacion',
    otrasSI: <>lm = cd·sr = cd (sr es adimensional)</>,
    descomposicionTitulo: 'Desde intensidad por ángulo sólido',
    descomposicion: [
      <>Flujo luminoso = intensidad · ángulo sólido: lm = cd·sr</>,
      <>Como el estereorradián es adimensional, en unidades básicas lm = cd</>,
      <>El lumen mide la luz total emitida; la candela, la que sale en una dirección</>,
    ],
    magnitudTitulo: 'Orden de magnitud',
    magnitudEjemplo:
      'Una bombilla LED de 10 W emite ≈ 800-1000 lm. Es la cifra que hoy figura en las cajas de las bombillas, en lugar de los vatios.',
  },
  {
    id: 'lux',
    categoria: 'derivadas',
    nombre: 'Lux',
    magnitud: 'Iluminancia',
    simbolo: <>lx</>,
    expr: <>cd·m⁻²</>,
    busqueda: 'lux lx iluminancia luz por superficie lumen por metro cuadrado luxometro fotografia',
    otrasSI: <>lx = lm/m² = cd·m⁻²</>,
    descomposicionTitulo: 'Desde flujo entre superficie',
    descomposicion: [
      <>Iluminancia = flujo luminoso / área: lx = lm/m²</>,
      <>Como lm = cd en básicas: lx = cd/m² = cd·m⁻²</>,
    ],
    magnitudTitulo: 'Orden de magnitud',
    magnitudEjemplo:
      'Un día soleado ≈ 100 000 lx; una oficina bien iluminada, 500 lx; la luz de la luna llena, ≈ 0,25 lx. Se mide con un luxómetro.',
  },
  {
    id: 'becquerel',
    categoria: 'derivadas',
    nombre: 'Becquerel',
    magnitud: 'Actividad de un radionúclido',
    simbolo: <>Bq</>,
    expr: <>s⁻¹</>,
    busqueda: 'becquerel bq actividad radiactiva desintegraciones por segundo curie radioactividad nuclear',
    otrasSI: <>Bq = s⁻¹</>,
    descomposicionTitulo: 'En unidades básicas',
    descomposicion: [
      <>Una desintegración nuclear por segundo es 1 Bq</>,
      <>Al ser sucesos por segundo, Bq = s⁻¹</>,
      <>Comparte unidad con el hercio, pero el becquerel describe sucesos aleatorios, no ciclos periódicos</>,
    ],
    magnitudTitulo: 'Orden de magnitud',
    magnitudEjemplo:
      'El cuerpo humano tiene una actividad de ≈ 4000 Bq (sobre todo por el potasio-40). La antigua unidad, el curie (Ci), equivale a 3,7 × 10¹⁰ Bq.',
  },
  {
    id: 'gray',
    categoria: 'derivadas',
    nombre: 'Gray',
    magnitud: 'Dosis absorbida de radiación',
    simbolo: <>Gy</>,
    expr: <>m²·s⁻²</>,
    busqueda: 'gray gy dosis absorbida radiacion energia por masa radioterapia rad',
    otrasSI: <>Gy = J/kg = m²·s⁻²</>,
    descomposicionTitulo: 'Desde energía por masa',
    descomposicion: [
      <>Dosis absorbida = energía depositada / masa: Gy = J/kg</>,
      <>Sustituyendo J = kg·m²·s⁻²: Gy = kg·m²·s⁻² / kg = m²·s⁻²</>,
    ],
    magnitudTitulo: 'Orden de magnitud',
    magnitudEjemplo:
      'Una radiografía deposita ≈ 0,001 Gy. Una sesión de radioterapia, ≈ 2 Gy dirigidos al tumor. Una dosis corporal de 5 Gy sin tratamiento puede ser mortal.',
  },
  {
    id: 'sievert',
    categoria: 'derivadas',
    nombre: 'Sievert',
    magnitud: 'Dosis equivalente y efectiva',
    simbolo: <>Sv</>,
    expr: <>m²·s⁻²</>,
    busqueda: 'sievert sv dosis equivalente efectiva radiacion biologica milisievert riesgo rem',
    otrasSI: <>Sv = J/kg = m²·s⁻²</>,
    descomposicionTitulo: 'Mismas básicas que el gray, distinto significado',
    descomposicion: [
      <>Dimensionalmente Sv = J/kg = m²·s⁻², idéntico al gray</>,
      <>Pero pondera la dosis por el daño biológico según el tipo de radiación</>,
      <>1 Gy de partículas alfa cuenta como ≈ 20 Sv; 1 Gy de rayos X, como 1 Sv. Por eso el SI les da nombres distintos</>,
    ],
    magnitudTitulo: 'Orden de magnitud',
    magnitudEjemplo:
      'La radiación natural de fondo aporta ≈ 0,003 Sv al año. Un vuelo transatlántico, ≈ 0,00005 Sv. El límite anual para trabajadores expuestos es de 0,02 Sv.',
  },
  {
    id: 'katal',
    categoria: 'derivadas',
    nombre: 'Katal',
    magnitud: 'Actividad catalítica',
    simbolo: <>kat</>,
    expr: <>mol·s⁻¹</>,
    busqueda: 'katal kat actividad catalitica enzima mol por segundo bioquimica velocidad de reaccion',
    otrasSI: <>kat = mol/s</>,
    descomposicionTitulo: 'Desde sustancia por tiempo',
    descomposicion: [
      <>Actividad catalítica = cantidad de sustancia transformada / tiempo: kat = mol/s</>,
      <>Un katal es la actividad que convierte un mol de sustrato por segundo</>,
    ],
    magnitudTitulo: 'Referencia útil',
    magnitudEjemplo:
      'Es la unidad más reciente (añadida en 1999). Se usa en bioquímica para expresar la actividad de las enzimas, casi siempre en nanokatal o microkatal.',
  },

  /* ── 24 prefijos del SI ───────────────────────────────────── */
  { id: 'quetta', categoria: 'prefijos', nombre: 'quetta', magnitud: 'Multiplicador', simbolo: <>Q</>, expr: <>10³⁰</>, busqueda: 'quetta Q 10^30 quintillon multiplicador 2022 prefijo mas grande', magnitudTitulo: 'Escala', magnitudEjemplo: 'Añadido en 2022. La masa de la Tierra es de unos 6 Qg (6 × 10²⁷ kg = 6000 Yg). Es el prefijo más grande del SI.' },
  { id: 'ronna', categoria: 'prefijos', nombre: 'ronna', magnitud: 'Multiplicador', simbolo: <>R</>, expr: <>10²⁷</>, busqueda: 'ronna R 10^27 multiplicador 2022 prefijo grande', magnitudTitulo: 'Escala', magnitudEjemplo: 'Añadido en 2022. La masa de Júpiter ronda los 1,9 Rg (1,9 × 10²⁷ kg).' },
  { id: 'yotta', categoria: 'prefijos', nombre: 'yotta', magnitud: 'Multiplicador', simbolo: <>Y</>, expr: <>10²⁴</>, busqueda: 'yotta Y 10^24 multiplicador prefijo grande', magnitudTitulo: 'Escala', magnitudEjemplo: 'La masa de los océanos de la Tierra ≈ 1,4 Yg (1,4 × 10²¹ kg).' },
  { id: 'zetta', categoria: 'prefijos', nombre: 'zetta', magnitud: 'Multiplicador', simbolo: <>Z</>, expr: <>10²¹</>, busqueda: 'zetta Z 10^21 multiplicador datos zettabyte', magnitudTitulo: 'Escala', magnitudEjemplo: 'El volumen mundial de datos digitales ya se mide en zettabytes (10²¹ bytes).' },
  { id: 'exa', categoria: 'prefijos', nombre: 'exa', magnitud: 'Multiplicador', simbolo: <>E</>, expr: <>10¹⁸</>, busqueda: 'exa E 10^18 trillon multiplicador exabyte exaflop', magnitudTitulo: 'Escala', magnitudEjemplo: 'Los superordenadores más potentes ya superan el exaflop: 10¹⁸ operaciones por segundo.' },
  { id: 'peta', categoria: 'prefijos', nombre: 'peta', magnitud: 'Multiplicador', simbolo: <>P</>, expr: <>10¹⁵</>, busqueda: 'peta P 10^15 multiplicador petabyte', magnitudTitulo: 'Escala', magnitudEjemplo: 'Un petabyte (10¹⁵ bytes) equivale a unos 500 000 millones de páginas de texto.' },
  { id: 'tera', categoria: 'prefijos', nombre: 'tera', magnitud: 'Multiplicador', simbolo: <>T</>, expr: <>10¹²</>, busqueda: 'tera T 10^12 billon multiplicador terabyte terahercio', magnitudTitulo: 'Escala', magnitudEjemplo: 'Un disco duro doméstico almacena varios terabytes (10¹² bytes).' },
  { id: 'giga', categoria: 'prefijos', nombre: 'giga', magnitud: 'Multiplicador', simbolo: <>G</>, expr: <>10⁹</>, busqueda: 'giga G 10^9 mil millones multiplicador gigabyte gigahercio', magnitudTitulo: 'Escala', magnitudEjemplo: 'Un procesador trabaja a varios GHz; una conexión de fibra, a cientos de Gb/s.' },
  { id: 'mega', categoria: 'prefijos', nombre: 'mega', magnitud: 'Multiplicador', simbolo: <>M</>, expr: <>10⁶</>, busqueda: 'mega M 10^6 millon multiplicador megabyte megavatio megahercio', magnitudTitulo: 'Escala', magnitudEjemplo: 'Una central eléctrica genera cientos de megavatios (10⁶ W).' },
  { id: 'kilo', categoria: 'prefijos', nombre: 'kilo', magnitud: 'Multiplicador', simbolo: <>k</>, expr: <>10³</>, busqueda: 'kilo k 10^3 mil multiplicador kilogramo kilometro kilovatio', magnitudTitulo: 'Escala', magnitudEjemplo: 'Se escribe con k minúscula: la K mayúscula es el kelvin. Un kilómetro son 1000 m.' },
  { id: 'hecto', categoria: 'prefijos', nombre: 'hecto', magnitud: 'Multiplicador', simbolo: <>h</>, expr: <>10²</>, busqueda: 'hecto h 10^2 cien multiplicador hectopascal hectarea', magnitudTitulo: 'Escala', magnitudEjemplo: 'La presión atmosférica se da en hectopascales: 1013 hPa. Una hectárea son 100 áreas.' },
  { id: 'deca', categoria: 'prefijos', nombre: 'deca', magnitud: 'Multiplicador', simbolo: <>da</>, expr: <>10¹</>, busqueda: 'deca da 10^1 diez multiplicador decametro', magnitudTitulo: 'Escala', magnitudEjemplo: 'Poco usado. Es el único prefijo con símbolo de dos letras: «da».' },
  { id: 'deci', categoria: 'prefijos', nombre: 'deci', magnitud: 'Submúltiplo', simbolo: <>d</>, expr: <>10⁻¹</>, busqueda: 'deci d 10^-1 decima submultiplo decimetro decibelio decilitro', magnitudTitulo: 'Escala', magnitudEjemplo: 'Un decímetro son 10 cm. El decibelio (dB) es una décima de belio.' },
  { id: 'centi', categoria: 'prefijos', nombre: 'centi', magnitud: 'Submúltiplo', simbolo: <>c</>, expr: <>10⁻²</>, busqueda: 'centi c 10^-2 centesima submultiplo centimetro centilitro', magnitudTitulo: 'Escala', magnitudEjemplo: 'Un centímetro es 1/100 de metro. Muy común en la vida diaria pese a no ser potencia de mil.' },
  { id: 'mili', categoria: 'prefijos', nombre: 'mili', magnitud: 'Submúltiplo', simbolo: <>m</>, expr: <>10⁻³</>, busqueda: 'mili m 10^-3 milesima submultiplo milimetro mililitro miligramo milisegundo', magnitudTitulo: 'Escala', magnitudEjemplo: 'Un milímetro es 1/1000 de metro. El grosor de una tarjeta bancaria ≈ 0,8 mm.' },
  { id: 'micro', categoria: 'prefijos', nombre: 'micro', magnitud: 'Submúltiplo', simbolo: <>µ</>, expr: <>10⁻⁶</>, busqueda: 'micro µ u 10^-6 millonesima submultiplo micrometro micra microsegundo microgramo', magnitudTitulo: 'Escala', magnitudEjemplo: 'Un glóbulo rojo mide ≈ 7 µm. El símbolo es la letra griega mu (µ); si no está disponible se admite «u».' },
  { id: 'nano', categoria: 'prefijos', nombre: 'nano', magnitud: 'Submúltiplo', simbolo: <>n</>, expr: <>10⁻⁹</>, busqueda: 'nano n 10^-9 milmillonesima submultiplo nanometro nanotecnologia', magnitudTitulo: 'Escala', magnitudEjemplo: 'Un transistor moderno mide unos pocos nanómetros. La luz visible tiene longitudes de onda de 400-700 nm.' },
  { id: 'pico', categoria: 'prefijos', nombre: 'pico', magnitud: 'Submúltiplo', simbolo: <>p</>, expr: <>10⁻¹²</>, busqueda: 'pico p 10^-12 submultiplo picometro picofaradio picosegundo', magnitudTitulo: 'Escala', magnitudEjemplo: 'El radio de un átomo se mide en picómetros (≈ 100 pm).' },
  { id: 'femto', categoria: 'prefijos', nombre: 'femto', magnitud: 'Submúltiplo', simbolo: <>f</>, expr: <>10⁻¹⁵</>, busqueda: 'femto f 10^-15 submultiplo femtometro fermi femtosegundo', magnitudTitulo: 'Escala', magnitudEjemplo: 'El diámetro de un núcleo atómico ronda los femtómetros (también llamados «fermi»).' },
  { id: 'atto', categoria: 'prefijos', nombre: 'atto', magnitud: 'Submúltiplo', simbolo: <>a</>, expr: <>10⁻¹⁸</>, busqueda: 'atto a 10^-18 submultiplo attosegundo', magnitudTitulo: 'Escala', magnitudEjemplo: 'Los pulsos láser más breves duran unos attosegundos; en ese tiempo la luz apenas recorre el ancho de un átomo.' },
  { id: 'zepto', categoria: 'prefijos', nombre: 'zepto', magnitud: 'Submúltiplo', simbolo: <>z</>, expr: <>10⁻²¹</>, busqueda: 'zepto z 10^-21 submultiplo zeptogramo', magnitudTitulo: 'Escala', magnitudEjemplo: 'Un zeptogramo (10⁻²¹ g) es del orden de la masa de unas pocas moléculas pequeñas.' },
  { id: 'yocto', categoria: 'prefijos', nombre: 'yocto', magnitud: 'Submúltiplo', simbolo: <>y</>, expr: <>10⁻²⁴</>, busqueda: 'yocto y 10^-24 submultiplo yoctogramo', magnitudTitulo: 'Escala', magnitudEjemplo: 'La masa de un protón es de ≈ 1,67 yg (1,67 × 10⁻²⁴ g).' },
  { id: 'ronto', categoria: 'prefijos', nombre: 'ronto', magnitud: 'Submúltiplo', simbolo: <>r</>, expr: <>10⁻²⁷</>, busqueda: 'ronto r 10^-27 submultiplo 2022 prefijo pequeño', magnitudTitulo: 'Escala', magnitudEjemplo: 'Añadido en 2022. La masa de un electrón ≈ 0,9 rg (9 × 10⁻²⁸ g).' },
  { id: 'quecto', categoria: 'prefijos', nombre: 'quecto', magnitud: 'Submúltiplo', simbolo: <>q</>, expr: <>10⁻³⁰</>, busqueda: 'quecto q 10^-30 submultiplo 2022 prefijo mas pequeño', magnitudTitulo: 'Escala', magnitudEjemplo: 'Añadido en 2022, es el prefijo más pequeño del SI. Sirve para masas subatómicas medidas en gramos.' },

  /* ── Unidades aceptadas para uso con el SI ────────────────── */
  { id: 'minuto', categoria: 'aceptadas', nombre: 'Minuto', magnitud: 'Tiempo', simbolo: <>min</>, expr: <>60 s</>, busqueda: 'minuto min tiempo 60 segundos aceptada', magnitudTitulo: 'Equivalencia exacta', magnitudEjemplo: '1 min = 60 s. No es una unidad del SI, pero se admite su uso por su arraigo cotidiano.' },
  { id: 'hora', categoria: 'aceptadas', nombre: 'Hora', magnitud: 'Tiempo', simbolo: <>h</>, expr: <>3600 s</>, busqueda: 'hora h tiempo 3600 segundos 60 minutos aceptada', magnitudTitulo: 'Equivalencia exacta', magnitudEjemplo: '1 h = 60 min = 3600 s. El símbolo es «h», que no debe confundirse con el prefijo hecto.' },
  { id: 'dia', categoria: 'aceptadas', nombre: 'Día', magnitud: 'Tiempo', simbolo: <>d</>, expr: <>86 400 s</>, busqueda: 'dia d tiempo 86400 segundos 24 horas aceptada', magnitudTitulo: 'Equivalencia exacta', magnitudEjemplo: '1 d = 24 h = 86 400 s.' },
  { id: 'grado-angulo', categoria: 'aceptadas', nombre: 'Grado (de ángulo)', magnitud: 'Ángulo plano', simbolo: <>°</>, expr: <>π/180 rad</>, busqueda: 'grado angulo sexagesimal grados pi 180 radianes aceptada', magnitudTitulo: 'Equivalencia', magnitudEjemplo: '1° = π/180 rad ≈ 0,01745 rad. Una circunferencia completa son 360°.' },
  { id: 'minuto-arco', categoria: 'aceptadas', nombre: 'Minuto de arco', magnitud: 'Ángulo plano', simbolo: <>′</>, expr: <>(1/60)°</>, busqueda: 'minuto de arco angulo prima grados aceptada astronomia', magnitudTitulo: 'Equivalencia', magnitudEjemplo: "1′ = 1/60 de grado = π/10 800 rad. Se usa en astronomía y navegación." },
  { id: 'segundo-arco', categoria: 'aceptadas', nombre: 'Segundo de arco', magnitud: 'Ángulo plano', simbolo: <>″</>, expr: <>(1/3600)°</>, busqueda: 'segundo de arco angulo doble prima grados aceptada astronomia parsec', magnitudTitulo: 'Equivalencia', magnitudEjemplo: "1″ = 1/3600 de grado. El parsec se define a partir del segundo de arco de paralaje." },
  { id: 'hectarea', categoria: 'aceptadas', nombre: 'Hectárea', magnitud: 'Superficie', simbolo: <>ha</>, expr: <>10⁴ m²</>, busqueda: 'hectarea ha superficie area terreno 10000 metros cuadrados aceptada agricultura', magnitudTitulo: 'Equivalencia exacta', magnitudEjemplo: '1 ha = 10 000 m² = un cuadrado de 100 m de lado. Se usa para medir terrenos.' },
  { id: 'litro', categoria: 'aceptadas', nombre: 'Litro', magnitud: 'Volumen', simbolo: <>l, L</>, expr: <>10⁻³ m³</>, busqueda: 'litro l L volumen decimetro cubico mililitros capacidad aceptada', magnitudTitulo: 'Equivalencia exacta', magnitudEjemplo: '1 L = 1 dm³ = 10⁻³ m³ = 1000 mL. Se admiten los símbolos «l» y «L» para evitar confundirlo con el número 1.' },
  { id: 'tonelada', categoria: 'aceptadas', nombre: 'Tonelada', magnitud: 'Masa', simbolo: <>t</>, expr: <>10³ kg</>, busqueda: 'tonelada t masa 1000 kilogramos megagramo aceptada', magnitudTitulo: 'Equivalencia exacta', magnitudEjemplo: '1 t = 1000 kg = 1 Mg (megagramo). También se llama tonelada métrica.' },
  { id: 'electronvoltio', categoria: 'aceptadas', nombre: 'Electronvoltio', magnitud: 'Energía', simbolo: <>eV</>, expr: <>1,602 176 634 × 10⁻¹⁹ J</>, busqueda: 'electronvoltio ev energia fisica de particulas atomica nuclear aceptada', magnitudTitulo: 'Equivalencia', magnitudEjemplo: '1 eV = 1,602 176 634 × 10⁻¹⁹ J: la energía que gana un electrón al atravesar una diferencia de potencial de 1 V. Es la unidad natural en física de partículas.' },
  { id: 'dalton', categoria: 'aceptadas', nombre: 'Dalton (unidad de masa atómica)', magnitud: 'Masa', simbolo: <>Da, u</>, expr: <>≈ 1,660 539 × 10⁻²⁷ kg</>, busqueda: 'dalton da unidad de masa atomica uma u carbono 12 quimica aceptada', magnitudTitulo: 'Equivalencia', magnitudEjemplo: '1 Da = 1/12 de la masa de un átomo de carbono-12 ≈ 1,66 × 10⁻²⁷ kg. Se usa para masas de átomos y moléculas.' },
  { id: 'unidad-astronomica', categoria: 'aceptadas', nombre: 'Unidad astronómica', magnitud: 'Longitud', simbolo: <>au</>, expr: <>149 597 870 700 m</>, busqueda: 'unidad astronomica au ua longitud distancia tierra sol sistema solar aceptada', magnitudTitulo: 'Equivalencia exacta', magnitudEjemplo: '1 au = 149 597 870 700 m ≈ 150 millones de km, la distancia media Tierra-Sol. La luz la recorre en algo más de 8 minutos.' },
];

/* ────────────────────────────────────────────────────────────────
   Componente principal
──────────────────────────────────────────────────────────────── */

export default function TablaUnidadesSiPage() {
  const [consulta, setConsulta] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaId | 'todas'>('todas');
  const [abiertas, setAbiertas] = useState<string[]>([]);
  const buscadorRef = useRef<HTMLInputElement>(null);

  // Foco automático al cargar: quien llega a consultar escribe directo
  useEffect(() => {
    buscadorRef.current?.focus({ preventScroll: true });
  }, []);

  const resultados = useMemo(() => {
    const termino = normalizar(consulta.trim());
    return UNIDADES.filter((entrada) => {
      const coincideCategoria =
        categoriaActiva === 'todas' || entrada.categoria === categoriaActiva;
      if (!coincideCategoria) return false;
      if (termino === '') return true;
      return normalizar(`${entrada.nombre} ${entrada.magnitud} ${entrada.busqueda}`).includes(
        termino,
      );
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
          <span aria-hidden="true">📏</span> Tabla de Unidades del SI
        </h1>
        <p className={styles.subtitle}>
          Las 7 unidades básicas y su definición por constantes fijadas, las 22 unidades derivadas
          con nombre propio descompuestas paso a paso hasta unidades básicas, los 24 prefijos de
          quecto a quetta y las unidades aceptadas. Busca y encuentra en segundos.
        </p>
        <p className={styles.fuenteHero}>
          Definiciones según el Folleto SI (BIPM, 9.ª edición, 2019), con las constantes fijadas en
          la redefinición del 20 de mayo de 2019.
        </p>
      </header>

      <LegalNotice />

      {/* Buscador + filtros */}
      <section className={styles.buscadorPanel} aria-label="Buscador de unidades del SI">
        <label className={styles.buscadorLabel} htmlFor="buscador-unidades">
          Busca una unidad o prefijo por nombre, símbolo o magnitud
        </label>
        <div className={styles.buscadorWrap}>
          <input
            id="buscador-unidades"
            ref={buscadorRef}
            type="search"
            className={styles.buscadorInput}
            value={consulta}
            onChange={(evento) => setConsulta(evento.target.value)}
            placeholder="voltio, tesla, nano, presión, mol…"
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
          Funciona con acentos o sin ellos y con sinónimos: <strong>presión</strong> encuentra el
          pascal, <strong>fuerza</strong> el newton y <strong>micra</strong> el prefijo micro.
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

        <p className={styles.contador} role="status" aria-live="polite">
          {resultados.length} de {UNIDADES.length} entradas
        </p>
      </section>

      {/* Tabla de unidades */}
      {resultados.length === 0 ? (
        <div className={styles.sinResultados}>
          <p>
            <span aria-hidden="true">🔍</span> No hay ninguna entrada que coincida con «{consulta}».
            Prueba con otro término (por ejemplo, <strong>energía</strong>, <strong>giga</strong> o{' '}
            <strong>candela</strong>) o quita el filtro de categoría.
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
                  className={styles.filaBtn}
                  aria-expanded={abierta}
                  aria-controls={`detalle-${entrada.id}`}
                  onClick={() => alternarFila(entrada.id)}
                >
                  <span className={styles.filaNombre}>
                    {entrada.nombre}
                    <span className={styles.filaCategoria}>{NOMBRE_CATEGORIA[entrada.categoria]}</span>
                    <span className={styles.filaMagnitud}>{entrada.magnitud}</span>
                  </span>
                  <span className={styles.filaDatos}>
                    <span className={styles.par}>
                      <span className={styles.etq}>Símbolo</span>
                      <span className={styles.simbolo}>{entrada.simbolo}</span>
                    </span>
                    {entrada.expr && (
                      <span className={styles.par}>
                        <span className={styles.etq}>
                          {entrada.categoria === 'prefijos' ? 'Factor' : 'En SI'}
                        </span>
                        <span className={styles.expr}>{entrada.expr}</span>
                      </span>
                    )}
                  </span>
                  <span className={styles.chevron} aria-hidden="true">
                    {abierta ? '▲' : '▼'}
                  </span>
                </button>

                {abierta && (
                  <div id={`detalle-${entrada.id}`} className={styles.detalle}>
                    {entrada.definicion && (
                      <>
                        <h3>Definición oficial</h3>
                        <div className={styles.definicionBox}>
                          <p>{entrada.definicion}</p>
                        </div>
                      </>
                    )}

                    {entrada.otrasSI && (
                      <>
                        <h3>Expresión en otras unidades del SI</h3>
                        <div className={styles.otrasSI}>{entrada.otrasSI}</div>
                      </>
                    )}

                    {entrada.descomposicion && entrada.descomposicionTitulo && (
                      <div className={styles.descomposicion}>
                        <h3>{entrada.descomposicionTitulo}</h3>
                        <ol>
                          {entrada.descomposicion.map((paso, indice) => (
                            <li key={indice}>{paso}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    <div className={styles.magnitudBox}>
                      <h3>
                        <span aria-hidden="true">📐</span> {entrada.magnitudTitulo}
                      </h3>
                      <p>{entrada.magnitudEjemplo}</p>
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
        title="Entender el SI, no solo consultarlo"
        subtitle="De dónde salen las unidades, por qué se redefinieron en 2019 y cómo escribirlas bien"
      >
        <section className={styles.guideSection}>
          <h2>Qué es el Sistema Internacional</h2>
          <p>
            El Sistema Internacional de Unidades (SI) es el lenguaje común de la ciencia y el
            comercio: siete unidades básicas a partir de las cuales se construye cualquier otra como
            producto de sus potencias. Lo mantiene la Oficina Internacional de Pesas y Medidas
            (BIPM) y lo adopta prácticamente todo el mundo. Su gran virtud es la coherencia: al
            combinar unidades básicas nunca aparecen factores de conversión artificiales.
          </p>
          <p>
            Cualquier unidad derivada, por complicada que parezca, se reduce a las siete básicas. El
            voltio, el tesla o el faradio son solo abreviaturas cómodas de combinaciones de
            kilogramo, metro, segundo y amperio. En cada fila desplegada de la tabla tienes esa
            descomposición paso a paso.
          </p>
          <div className={styles.formulaBox}>
            [cualquier magnitud] = kg<sup>a</sup> · m<sup>b</sup> · s<sup>c</sup> · A<sup>d</sup> ·
            K<sup>e</sup> · mol<sup>f</sup> · cd<sup>g</sup>
          </div>

          <h2>Las 7 unidades básicas y su constante</h2>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Unidad</th>
                  <th>Símbolo</th>
                  <th>Magnitud</th>
                  <th>Constante fijada (2019)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>segundo</strong></td>
                  <td>s</td>
                  <td>Tiempo</td>
                  <td>ΔνCs = 9 192 631 770 Hz</td>
                </tr>
                <tr>
                  <td><strong>metro</strong></td>
                  <td>m</td>
                  <td>Longitud</td>
                  <td>c = 299 792 458 m/s</td>
                </tr>
                <tr>
                  <td><strong>kilogramo</strong></td>
                  <td>kg</td>
                  <td>Masa</td>
                  <td>h = 6,626 070 15 × 10⁻³⁴ J·s</td>
                </tr>
                <tr>
                  <td><strong>amperio</strong></td>
                  <td>A</td>
                  <td>Corriente eléctrica</td>
                  <td>e = 1,602 176 634 × 10⁻¹⁹ C</td>
                </tr>
                <tr>
                  <td><strong>kelvin</strong></td>
                  <td>K</td>
                  <td>Temperatura</td>
                  <td>k = 1,380 649 × 10⁻²³ J/K</td>
                </tr>
                <tr>
                  <td><strong>mol</strong></td>
                  <td>mol</td>
                  <td>Cantidad de sustancia</td>
                  <td>NA = 6,022 140 76 × 10²³ mol⁻¹</td>
                </tr>
                <tr>
                  <td><strong>candela</strong></td>
                  <td>cd</td>
                  <td>Intensidad luminosa</td>
                  <td>Kcd = 683 lm/W</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>La revolución silenciosa de 2019</h2>
          <p>
            El 20 de mayo de 2019 el SI dejó de depender de cualquier objeto físico. Hasta entonces
            el kilogramo era la masa de un cilindro de platino e iridio guardado cerca de París, y
            ese objeto había perdido unas decenas de microgramos respecto de sus copias oficiales.
            Un patrón que cambia es un problema serio para la ciencia.
          </p>
          <p>
            La solución fue elegante: fijar por convenio el valor de siete constantes de la
            naturaleza (la velocidad de la luz, la constante de Planck, la carga elemental…) y
            derivar las unidades de ellas. Las constantes no se desgastan ni derivan, así que
            cualquier laboratorio con el equipo adecuado puede realizar las unidades sin acudir a un
            patrón central.
          </p>

          <h2>Cómo usar bien esta tabla</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Escribe lo que buscas</strong>
                <p>
                  El nombre (voltio), el símbolo (V) o la magnitud (tensión). El buscador ignora los
                  acentos y entiende sinónimos habituales.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Filtra por categoría si quieres pasear</strong>
                <p>
                  Básicas, derivadas, prefijos o aceptadas. Útil para repasar todas las de un mismo
                  tipo antes de un examen.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Despliega la fila</strong>
                <p>
                  Verás la definición o la descomposición paso a paso hasta unidades básicas, y un
                  ejemplo de orden de magnitud que ancla la unidad a algo cotidiano.
                </p>
              </div>
            </div>
          </div>

          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Por qué el kilogramo lleva un prefijo si es una unidad básica?</h4>
              <p>
                Es una herencia histórica. Cuando se creó el sistema métrico, la unidad práctica de
                masa resultó ser el kilogramo y no el gramo. El SI mantuvo ese nombre por coherencia
                con la tradición, aunque rompa la regla de que las básicas no llevan prefijo. Los
                múltiplos y submúltiplos de masa se forman sobre el gramo (miligramo, tonelada), no
                sobre el kilogramo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Gray y sievert no son lo mismo si ambos son J/kg?</h4>
              <p>
                Dimensionalmente sí, pero miden cosas distintas. El gray es la energía que la
                radiación deposita por kilogramo, sin más. El sievert pondera esa energía por el
                daño biológico: un gray de partículas alfa hace mucho más daño que un gray de rayos
                X. Por eso el SI les da nombres separados aunque compartan unidades básicas.
              </p>
              <p className={styles.faqTip}>
                Misma idea con el hercio y el becquerel: ambos son s⁻¹, pero uno describe ciclos
                periódicos y el otro sucesos radiactivos aleatorios.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Se escribe «5 Kg» o «5 kg»?</h4>
              <p>
                Se escribe 5 kg, con k minúscula, porque la K mayúscula es el símbolo del kelvin.
                Los símbolos no llevan punto final (salvo al acabar una frase) ni forman plural: son
                5 kg, nunca «5 kgs». Y siempre va un espacio entre el número y el símbolo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuáles son los prefijos más nuevos?</h4>
              <p>
                Ronna (R, 10²⁷), quetta (Q, 10³⁰), ronto (r, 10⁻²⁷) y quecto (q, 10⁻³⁰), aprobados
                en noviembre de 2022. Se añadieron porque el volumen mundial de datos se acercaba a
                agotar el prefijo yotta y porque las masas subatómicas necesitaban nombres propios.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿El litro y la hora son unidades del SI?</h4>
              <p>
                No, pero están aceptadas para uso con el SI por su enorme arraigo. El litro es un
                nombre cómodo para el decímetro cúbico (10⁻³ m³) y la hora, para 3600 segundos.
                Conviven con las unidades del SI sin formar parte estricta de él.
              </p>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>Errores frecuentes al escribir unidades</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Mayúsculas y minúsculas importan:</strong> «m» es metro o mili, pero «M» es
                mega; «g» es gramo, «G» es giga. Un símbolo mal capitalizado cambia el significado.
              </li>
              <li>
                <strong>Nombres en minúscula, símbolos derivados de apellidos en mayúscula:</strong>{' '}
                se escribe «newton» y «pascal» en minúscula, pero sus símbolos son «N» y «Pa» con la
                primera en mayúscula.
              </li>
              <li>
                <strong>Nada de plural en los símbolos:</strong> 25 kg, no «25 kgs»; 100 m, no
                «100 ms» (eso serían milisegundos).
              </li>
              <li>
                <strong>Espacio entre número y símbolo:</strong> 20 °C y no «20°C»; 5 kg y no «5kg».
                La única excepción habitual son los símbolos de ángulo (°, ′, ″), que van pegados.
              </li>
              <li>
                <strong>No mezcles nombre y símbolo:</strong> «kilómetro por hora» o «km/h», pero no
                «km por hora».
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('tabla-unidades-si')} />
      <ShareCard appName="tabla-unidades-si" />
      <Footer appName="tabla-unidades-si" />
    </div>
  );
}
