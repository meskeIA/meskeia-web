'use client';

import React, { useState } from 'react';
import styles from './AsesorVehiculo.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency } from '@/lib';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type TipoMotor = 'gasolina' | 'diesel' | 'hibrido' | 'electrico';
type SegmentoKey =
  | 'urbano'
  | 'compacto-bc'
  | 'compacto-c'
  | 'suv-compacto'
  | 'suv-familiar'
  | 'suv-mediano'
  | 'berlina-familiar'
  | 'monovolumen';
type ColorDGT = 'cero' | 'eco' | 'c' | 'b';

interface Opcion {
  valor: string;
  etiqueta: string;
  desc: string;
}

interface Pregunta {
  id: number;
  categoria: string;
  pregunta: string;
  icon: string;
  opciones: Opcion[];
}

interface CostesMotorizacion {
  combustible: number;
  mantenimiento: number;
  total: number;
  total5: number;
}

interface Resultado {
  segmentoKey: SegmentoKey;
  motorPrincipal: TipoMotor;
  esPhev: boolean;
  descripcionMotor: string;
  costes: Record<TipoMotor, CostesMotorizacion>;
  kmAnuales: number;
  alertas: string[];
  razones: string[];
  mostrarSegundaMano: boolean;
}

// ─────────────────────────────────────────────
// Tablas de datos de segmentos
// ─────────────────────────────────────────────

interface SegmentoInfo {
  nombre: string;
  icon: string;
  descripcion: string;
  precioNuevo: string;
  precioSegundaMano: string;
}

const SEGMENTOS: Record<SegmentoKey, SegmentoInfo> = {
  urbano: {
    nombre: 'Urbano o Compacto B',
    icon: '🏙️',
    descripcion:
      'Un coche pequeño y ágil es lo más práctico en ciudad: aparca fácil, bajo consumo y más económico en seguro y mantenimiento. La gama más amplia en segunda mano.',
    precioNuevo: '12.000 – 22.000 €',
    precioSegundaMano: '5.000 – 14.000 €',
  },
  'compacto-bc': {
    nombre: 'Compacto (tipo B/C)',
    icon: '🚗',
    descripcion:
      'El segmento más versátil del mercado. Sirve para todo: ciudad, carretera, 2-4 ocupantes. Mayor oferta tanto nuevo como de segunda mano en todos los rangos de precio.',
    precioNuevo: '14.000 – 28.000 €',
    precioSegundaMano: '7.000 – 18.000 €',
  },
  'compacto-c': {
    nombre: 'Compacto tipo C',
    icon: '🚗',
    descripcion:
      'Espacio para 4 personas con tamaño manejable en ciudad. Un compacto tipo Golf o 308 no renuncia a un maletero útil y ofrece buena habitabilidad para el día a día familiar.',
    precioNuevo: '18.000 – 32.000 €',
    precioSegundaMano: '10.000 – 22.000 €',
  },
  'suv-compacto': {
    nombre: 'SUV Compacto / Crossover',
    icon: '🚙',
    descripcion:
      'Alta posición de conducción, acceso cómodo y mayor altura libre al suelo. Misma huella exterior que un compacto B/C pero con las ventajas prácticas del SUV.',
    precioNuevo: '20.000 – 36.000 €',
    precioSegundaMano: '11.000 – 24.000 €',
  },
  'suv-familiar': {
    nombre: 'SUV Compacto o Familiar',
    icon: '🚙',
    descripcion:
      'El equilibrio entre espacio familiar y polivalencia en carretera. Maletero amplio y habitabilidad para 4-5 personas con buen comportamiento dinámico.',
    precioNuevo: '22.000 – 42.000 €',
    precioSegundaMano: '13.000 – 28.000 €',
  },
  'suv-mediano': {
    nombre: 'SUV Mediano / Todoterreno',
    icon: '🏔️',
    descripcion:
      'Mayor altura libre, tracción fiable en terrenos variados y capacidad para remolcar. Ideal para zonas rurales, viajes con mucho equipaje o uso mixto exigente.',
    precioNuevo: '28.000 – 55.000 €',
    precioSegundaMano: '15.000 – 38.000 €',
  },
  'berlina-familiar': {
    nombre: 'Berlina o Familiar',
    icon: '🛣️',
    descripcion:
      'Confort de crucero, eficiencia aerodinámica y maletero amplio. La opción más rentable para conductores que acumulan muchos kilómetros en carretera y autovía.',
    precioNuevo: '22.000 – 42.000 €',
    precioSegundaMano: '10.000 – 28.000 €',
  },
  monovolumen: {
    nombre: 'Monovolumen o SUV Grande 7 plazas',
    icon: '🚌',
    descripcion:
      'Espacio real para toda la familia numerosa. Un monovolumen (Touran, Scenic EV) o un SUV de 7 plazas (Kia Sorento, Peugeot 5008) son las opciones más cómodas.',
    precioNuevo: '30.000 – 60.000 €',
    precioSegundaMano: '14.000 – 38.000 €',
  },
};

// ─────────────────────────────────────────────
// Tablas de datos de motorizaciones
// ─────────────────────────────────────────────

interface MotorInfo {
  nombre: string;
  icon: string;
  etiquetaDGT: string;
  colorDGT: ColorDGT;
  descDGT: string;
}

const MOTORES: Record<TipoMotor, MotorInfo> = {
  electrico: {
    nombre: '100% Eléctrico',
    icon: '⚡',
    etiquetaDGT: 'CERO',
    colorDGT: 'cero',
    descDGT:
      'Acceso libre en ZBE, plazas ORA gratuitas o bonificadas, sin impuesto de matriculación y con deducción fiscal en IRPF.',
  },
  hibrido: {
    nombre: 'Híbrido (HEV)',
    icon: '♻️',
    etiquetaDGT: 'ECO',
    colorDGT: 'eco',
    descDGT:
      'Acceso en ZBE en días de restricción de tráfico. Bonificaciones en peajes de algunas comunidades. Descuentos en parking en varios municipios.',
  },
  gasolina: {
    nombre: 'Gasolina',
    icon: '⛽',
    etiquetaDGT: 'C',
    colorDGT: 'c',
    descDGT:
      'Acceso restringido en ZBE solo en episodios de contaminación de nivel 3 o superior. Sin restricciones en la mayoría de días. Aplica a vehículos Euro 6.',
  },
  diesel: {
    nombre: 'Diésel',
    icon: '🛢️',
    etiquetaDGT: 'C',
    colorDGT: 'c',
    descDGT:
      'Igual que gasolina Euro 6: restricciones ZBE solo en alta contaminación. Seguimiento a largo plazo recomendable si vives en gran ciudad.',
  },
};

const MOTOR_PHEV: MotorInfo = {
  nombre: 'Híbrido Enchufable (PHEV)',
  icon: '🔋',
  etiquetaDGT: 'CERO',
  colorDGT: 'cero',
  descDGT:
    'Etiqueta CERO como los eléctricos puros: acceso libre en ZBE, plazas ORA bonificadas. Permite circular en modo eléctrico en ciudad y usar el motor térmico en viajes largos.',
};

// ─────────────────────────────────────────────
// Modelos de referencia por segmento y motor
// ─────────────────────────────────────────────

const MODELOS_REF: Record<SegmentoKey, Partial<Record<TipoMotor | 'phev', string[]>>> = {
  urbano: {
    gasolina: ['Seat Ibiza', 'VW Polo', 'Peugeot 208'],
    hibrido: ['Toyota Yaris Hybrid', 'Honda Jazz Hybrid'],
    electrico: ['Peugeot e-208', 'Renault Zoe', 'Fiat 500e'],
    diesel: ['Seat Ibiza TDI', 'Peugeot 208 BlueHDi'],
  },
  'compacto-bc': {
    gasolina: ['Renault Clio', 'Toyota Corolla', 'Seat Ibiza'],
    hibrido: ['Toyota Yaris Hybrid', 'Renault Clio E-Tech'],
    electrico: ['Peugeot e-208', 'VW ID.3', 'Renault Zoe'],
    diesel: ['Seat Ibiza TDI', 'Skoda Fabia TDI'],
  },
  'compacto-c': {
    gasolina: ['VW Golf', 'Seat León', 'Peugeot 308'],
    hibrido: ['Toyota Corolla Hybrid', 'Hyundai i30 Hybrid'],
    electrico: ['VW ID.3', 'BMW i3', 'Hyundai Ioniq 6'],
    diesel: ['VW Golf TDI', 'Peugeot 308 HDi', 'Skoda Octavia TDI'],
    phev: ['VW Golf GTE', 'Hyundai Ioniq PHEV'],
  },
  'suv-compacto': {
    gasolina: ['Seat Arona', 'Hyundai Kona', 'Opel Mokka'],
    hibrido: ['Toyota Yaris Cross', 'Renault Captur E-Tech', 'Ford Puma mHEV'],
    electrico: ['Hyundai Kona EV', 'Jeep Avenger EV', 'Opel Mokka-e'],
    diesel: ['Seat Arona TDI', 'Skoda Kamiq TDI'],
    phev: ['Renault Captur PHEV', 'Kia Niro PHEV'],
  },
  'suv-familiar': {
    gasolina: ['Seat Ateca', 'Peugeot 3008', 'Renault Austral'],
    hibrido: ['Renault Austral E-Tech', 'Kia Sportage Hybrid', 'Hyundai Tucson Hybrid'],
    electrico: ['VW ID.4', 'Hyundai Ioniq 5', 'Kia EV5'],
    diesel: ['Peugeot 3008 HDi', 'Seat Ateca TDI', 'Skoda Karoq TDI'],
    phev: ['Peugeot 3008 PHEV', 'Hyundai Tucson PHEV', 'Kia Sportage PHEV'],
  },
  'suv-mediano': {
    gasolina: ['VW Tiguan', 'Peugeot 5008', 'Ford Kuga'],
    hibrido: ['Toyota RAV4 Hybrid', 'Kia Sorento Hybrid', 'Mitsubishi Outlander PHEV'],
    electrico: ['Tesla Model Y', 'VW ID.4', 'BMW iX3'],
    diesel: ['VW Tiguan TDI', 'Peugeot 5008 HDi', 'Ford Kuga TDCi'],
    phev: ['Mitsubishi Outlander PHEV', 'Toyota RAV4 PHEV'],
  },
  'berlina-familiar': {
    gasolina: ['Seat León SW', 'Skoda Octavia Combi', 'Peugeot 508 SW'],
    hibrido: ['Toyota Corolla TS Hybrid', 'Skoda Octavia iV'],
    electrico: ['Peugeot e-308 SW', 'Tesla Model 3'],
    diesel: ['Skoda Octavia TDI Combi', 'Peugeot 508 HDi', 'VW Passat TDI'],
    phev: ['Skoda Octavia iV Combi', 'Peugeot 508 SW PHEV'],
  },
  monovolumen: {
    gasolina: ['VW Touran', 'Renault Scenic', 'Seat Alhambra'],
    hibrido: ['Kia Sorento Hybrid', 'Renault Scenic E-Tech'],
    electrico: ['Renault Scenic EV', 'VW ID. Buzz'],
    diesel: ['VW Touran TDI', 'Ford S-Max TDCi'],
  },
};

// ─────────────────────────────────────────────
// Preguntas del test (13)
// ─────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  // ── Tu uso ──────────────────────────────────
  {
    id: 1,
    categoria: 'Tu uso',
    pregunta: '¿Cuántos kilómetros haces aproximadamente al año?',
    icon: '📍',
    opciones: [
      { valor: 'bajo', etiqueta: 'Menos de 10.000 km', desc: 'Uso muy ocasional' },
      { valor: 'medio', etiqueta: '10.000 – 20.000 km', desc: 'Conductor habitual' },
      { valor: 'alto', etiqueta: '20.000 – 35.000 km', desc: 'Conductor frecuente' },
      { valor: 'mucho', etiqueta: 'Más de 35.000 km', desc: 'Gran viajero' },
    ],
  },
  {
    id: 2,
    categoria: 'Tu uso',
    pregunta: '¿Cómo es principalmente tu conducción?',
    icon: '🛣️',
    opciones: [
      { valor: 'ciudad', etiqueta: 'Ciudad', desc: 'Tráfico urbano, distancias cortas' },
      { valor: 'mixto', etiqueta: 'Mixto', desc: 'Ciudad y carretera a partes iguales' },
      { valor: 'carretera', etiqueta: 'Carretera', desc: 'Principalmente vías rápidas' },
      { valor: 'autopista', etiqueta: 'Autopista / viajes largos', desc: 'Muchos km en autovía' },
    ],
  },
  {
    id: 3,
    categoria: 'Tu uso',
    pregunta: '¿Haces viajes largos ocasionales (300+ km de ida)?',
    icon: '🗺️',
    opciones: [
      { valor: 'frecuente', etiqueta: 'Sí, bastante a menudo', desc: 'Vacaciones, trabajo… viajes largos frecuentes' },
      { valor: 'alguno', etiqueta: 'Alguno al año', desc: 'Un par de viajes largos anuales' },
      { valor: 'nunca', etiqueta: 'Prácticamente nunca', desc: 'Siempre distancias cortas o medias' },
    ],
  },
  // ── Tu situación ─────────────────────────────
  {
    id: 4,
    categoria: 'Tu situación',
    pregunta: '¿Cuántas personas viajan habitualmente en el coche?',
    icon: '👥',
    opciones: [
      { valor: '1', etiqueta: 'Solo yo (o en pareja)', desc: '1-2 personas' },
      { valor: '3-4', etiqueta: 'Familia pequeña', desc: '3-4 personas' },
      { valor: '5+', etiqueta: 'Familia numerosa', desc: '5 o más personas' },
    ],
  },
  {
    id: 5,
    categoria: 'Tu situación',
    pregunta: '¿Tienes acceso a punto de carga eléctrica?',
    icon: '⚡',
    opciones: [
      { valor: 'casa', etiqueta: 'Sí, en casa (garaje propio)', desc: 'Carga cómoda nocturna' },
      { valor: 'trabajo', etiqueta: 'Sí, en el trabajo', desc: 'Carga durante la jornada' },
      { valor: 'publico', etiqueta: 'Solo en cargadores públicos', desc: 'Dependo de la red pública' },
      { valor: 'no', etiqueta: 'No tengo acceso a carga', desc: 'Sin posibilidad de cargar' },
    ],
  },
  {
    id: 6,
    categoria: 'Tu situación',
    pregunta: '¿Cuál es tu presupuesto orientativo para el coche?',
    icon: '💶',
    opciones: [
      { valor: 'bajo', etiqueta: 'Hasta 15.000 €', desc: 'Entrada / segunda mano' },
      { valor: 'medio', etiqueta: '15.000 – 25.000 €', desc: 'Gama media' },
      { valor: 'alto', etiqueta: '25.000 – 40.000 €', desc: 'Gama media-alta' },
      { valor: 'premium', etiqueta: 'Más de 40.000 €', desc: 'Gama alta / premium' },
    ],
  },
  {
    id: 7,
    categoria: 'Tu situación',
    pregunta: '¿En qué tipo de zona vives principalmente?',
    icon: '🏙️',
    opciones: [
      { valor: 'gran-ciudad', etiqueta: 'Gran ciudad (Madrid, Barcelona…)', desc: 'ZBE, aparcamiento limitado' },
      { valor: 'ciudad', etiqueta: 'Ciudad media', desc: 'Núcleo urbano habitual' },
      { valor: 'pueblo', etiqueta: 'Pueblo o zona rural', desc: 'Carreteras secundarias, naturaleza' },
    ],
  },
  {
    id: 8,
    categoria: 'Tu situación',
    pregunta: '¿Dónde aparcas habitualmente el coche?',
    icon: '🅿️',
    opciones: [
      { valor: 'garaje', etiqueta: 'Garaje propio o comunitario', desc: 'Sin restricción de tamaño' },
      { valor: 'calle', etiqueta: 'Calle o zona azul/verde', desc: 'El tamaño importa para aparcar' },
      { valor: 'parking', etiqueta: 'Parking público de pago', desc: 'Moderada restricción de tamaño' },
    ],
  },
  // ── Tus prioridades ──────────────────────────
  {
    id: 9,
    categoria: 'Tus prioridades',
    pregunta: '¿Necesitas llevar muchos bultos, remolcar o salir a zonas difíciles (nieve, tierra)?',
    icon: '🏔️',
    opciones: [
      { valor: 'frecuente', etiqueta: 'Sí, frecuentemente', desc: 'Es parte habitual de mi uso' },
      { valor: 'ocasional', etiqueta: 'A veces', desc: 'Ocasionalmente lo necesito' },
      { valor: 'nunca', etiqueta: 'Prácticamente nunca', desc: 'No es un requisito' },
    ],
  },
  {
    id: 10,
    categoria: 'Tus prioridades',
    pregunta: '¿Qué importancia tiene para ti la facilidad de entrada y salida del coche?',
    icon: '🦽',
    opciones: [
      { valor: 'muy-importante', etiqueta: 'Muy importante', desc: 'Me cuesta agacharme o levantarme de coches bajos' },
      { valor: 'algo', etiqueta: 'Algo importante', desc: 'Prefiero no tener que agacharme demasiado' },
      { valor: 'indiferente', etiqueta: 'Indiferente', desc: 'No es un factor para mí' },
    ],
  },
  {
    id: 11,
    categoria: 'Tus prioridades',
    pregunta: '¿Prefieres coche nuevo o de segunda mano?',
    icon: '🔑',
    opciones: [
      { valor: 'nuevo', etiqueta: 'Nuevo (0 km)', desc: 'Garantía de fábrica y últimas tecnologías' },
      { valor: 'reciente', etiqueta: 'Segunda mano reciente (2-5 años)', desc: 'Menor precio, ya probado en el mercado' },
      { valor: 'indiferente', etiqueta: 'Me da igual', desc: 'Lo que mejor encaje con mi presupuesto' },
    ],
  },
  {
    id: 12,
    categoria: 'Tus prioridades',
    pregunta: '¿Qué priorizas más en tu próximo coche?',
    icon: '🎯',
    opciones: [
      { valor: 'precio', etiqueta: 'Precio inicial bajo', desc: 'Pagar lo menos posible por el coche' },
      { valor: 'ahorro', etiqueta: 'Bajo coste de uso', desc: 'Ahorrar en combustible y mantenimiento' },
      { valor: 'espacio', etiqueta: 'Espacio y practicidad', desc: 'Maletero grande, muchas plazas' },
      { valor: 'planeta', etiqueta: 'Impacto medioambiental', desc: 'Reducir emisiones' },
      { valor: 'tecnologia', etiqueta: 'Tecnología y equipamiento', desc: 'Lo último en conectividad' },
    ],
  },
  {
    id: 13,
    categoria: 'Tus prioridades',
    pregunta: '¿Cuántos años piensas quedarte con este coche?',
    icon: '📅',
    opciones: [
      { valor: 'corto', etiqueta: '1-3 años', desc: 'Cambio frecuente de coche' },
      { valor: 'medio', etiqueta: '3-7 años', desc: 'Uso durante unos años' },
      { valor: 'largo', etiqueta: 'Más de 7 años', desc: 'Lo quiero para mucho tiempo' },
    ],
  },
];

const TOTAL = PREGUNTAS.length;

// ─────────────────────────────────────────────
// Lógica de recomendación
// ─────────────────────────────────────────────

function calcularRecomendacion(r: Record<number, string>): Resultado {
  const km = r[1];
  const conduccion = r[2];
  const viajesLargos = r[3];
  const viajeros = r[4];
  const carga = r[5];
  const presupuesto = r[6];
  const zona = r[7];
  const aparcamiento = r[8];
  const terreno = r[9];
  const acceso = r[10];
  const nuevoUsado = r[11];
  const prioridad = r[12];
  const anyos = r[13];

  // — Helpers —
  const tieneCargaComoda = carga === 'casa' || carga === 'trabajo';
  const soloPublico = carga === 'publico';
  const sinCarga = carga === 'no';
  const esCarretera = conduccion === 'carretera' || conduccion === 'autopista';
  const esCiudad = conduccion === 'ciudad';
  const kmAltos = km === 'alto' || km === 'mucho';
  const kmBajos = km === 'bajo' || km === 'medio';
  const presupuestoAlto = presupuesto === 'alto' || presupuesto === 'premium';
  const accesoImportante = acceso === 'muy-importante' || acceso === 'algo';
  const accesoMuyImportante = acceso === 'muy-importante';
  const aparcaCalle = aparcamiento === 'calle';
  const viajesLargosFrecuentes = viajesLargos === 'frecuente';
  const sinViajesLargos = viajesLargos === 'nunca';

  // ── SEGMENTO ──────────────────────────────

  let segmentoKey: SegmentoKey;

  if (viajeros === '5+') {
    segmentoKey = 'monovolumen';
  } else if (terreno === 'frecuente') {
    segmentoKey = 'suv-mediano';
  } else if (accesoMuyImportante) {
    // Facilidad de acceso máxima → crossover/SUV como mínimo
    if (viajeros === '3-4' && (esCarretera || conduccion === 'mixto')) {
      segmentoKey = 'suv-familiar';
    } else {
      segmentoKey = 'suv-compacto';
    }
  } else if (viajeros === '3-4' && (esCarretera || conduccion === 'mixto')) {
    // Familia + carretera → SUV familiar o berlina
    segmentoKey = accesoImportante ? 'suv-familiar' : 'suv-familiar';
  } else if (viajeros === '3-4' && esCiudad) {
    // Familia ciudad → compacto C si aparca en calle, SUV si garaje y acceso importa
    segmentoKey = aparcaCalle ? 'compacto-c' : accesoImportante ? 'suv-familiar' : 'compacto-c';
  } else if (zona === 'gran-ciudad' && kmBajos && viajeros === '1') {
    segmentoKey = aparcaCalle ? 'urbano' : 'compacto-bc';
  } else if (kmAltos && esCarretera) {
    // Muchos km carretera: berlina o SUV según acceso
    segmentoKey = accesoImportante ? 'suv-familiar' : 'berlina-familiar';
  } else if (terreno === 'ocasional' || zona === 'pueblo') {
    segmentoKey = 'suv-compacto';
  } else if (aparcaCalle && zona === 'ciudad') {
    // Ciudad + calle → pequeño, pero si acceso importa → SUV compacto
    segmentoKey = accesoImportante ? 'suv-compacto' : 'compacto-bc';
  } else {
    // Perfil general: acceso importante → SUV compacto
    segmentoKey = accesoImportante ? 'suv-compacto' : 'compacto-bc';
  }

  // ── MOTORIZACIÓN ──────────────────────────

  let motorPrincipal: TipoMotor;
  let esPhev = false;
  let descripcionMotor: string;

  const evViable = tieneCargaComoda && !viajesLargosFrecuentes && presupuesto !== 'bajo';

  if (
    evViable &&
    (esCiudad || conduccion === 'mixto') &&
    kmBajos &&
    (prioridad === 'ahorro' || prioridad === 'planeta' || prioridad === 'tecnologia')
  ) {
    motorPrincipal = 'electrico';
    descripcionMotor = sinViajesLargos
      ? 'Tu perfil encaja perfectamente con un eléctrico: carga cómoda en casa/trabajo, km moderados y conducción en ciudad o mixto. Coste por km mínimo (2-4 cts/km) y mantenimiento reducido a la mitad.'
      : 'Buen perfil para eléctrico. Los viajes largos ocasionales son manejables planificando paradas en cargadores rápidos (30 min para recuperar 200+ km).';
  } else if (tieneCargaComoda && presupuestoAlto && (kmAltos || viajesLargosFrecuentes)) {
    motorPrincipal = 'electrico';
    esPhev = true;
    descripcionMotor =
      'Un Híbrido Enchufable (PHEV) es tu mejor opción: modo eléctrico en ciudad (50-80 km sin emitir) y motor térmico para los viajes largos sin ansiedad de autonomía. Combina la etiqueta CERO con la flexibilidad total.';
  } else if (kmAltos && esCarretera && anyos !== 'corto' && presupuesto !== 'bajo') {
    motorPrincipal = 'diesel';
    descripcionMotor =
      'Con muchos kilómetros en carretera y varios años de uso, el diésel tiene el menor coste por km en autovía (4,5-6 L/100km), mayor autonomía y se amortiza bien a largo plazo.';
  } else if ((esCiudad || conduccion === 'mixto') && kmBajos && (sinCarga || soloPublico)) {
    motorPrincipal = 'hibrido';
    descripcionMotor =
      'Sin punto de carga propio, el híbrido convencional es la opción más eficiente en ciudad y uso mixto: recupera energía al frenar y reduce el consumo un 25-30% sin complicaciones de carga.';
  } else if (presupuesto === 'bajo' || anyos === 'corto' || prioridad === 'precio') {
    motorPrincipal = 'gasolina';
    descripcionMotor =
      'Para presupuesto ajustado o rotación frecuente, la gasolina tiene el menor precio inicial, la mayor oferta en segunda mano y mantenimiento simple. La opción más flexible y con mejor liquidez al vender.';
  } else {
    motorPrincipal = 'hibrido';
    descripcionMotor =
      'El híbrido convencional es la opción más equilibrada: buena eficiencia en ciudad y carretera, sin infraestructura de carga, fiable a largo plazo y con creciente oferta de segunda mano competitiva.';
  }

  // ── COSTES ANUALES ──────────────────────────

  const kmAnuales =
    km === 'bajo' ? 8000 : km === 'medio' ? 15000 : km === 'alto' ? 27500 : 42000;

  const precioKwh = tieneCargaComoda ? 0.22 : soloPublico ? 0.38 : 0.45;

  const cG = Math.round((kmAnuales / 100) * 7.5 * 1.65);
  const cD = Math.round((kmAnuales / 100) * 5.5 * 1.55);
  const cH = Math.round((kmAnuales / 100) * 5.2 * 1.65);
  const cE = Math.round((kmAnuales / 100) * 16 * precioKwh);

  const fijos = 650 + 35 + 120;
  const mant = { gasolina: 400, diesel: 450, hibrido: 350, electrico: 200 };

  const costes: Record<TipoMotor, CostesMotorizacion> = {
    gasolina: {
      combustible: cG,
      mantenimiento: mant.gasolina,
      total: cG + mant.gasolina + fijos,
      total5: (cG + mant.gasolina + fijos) * 5,
    },
    diesel: {
      combustible: cD,
      mantenimiento: mant.diesel,
      total: cD + mant.diesel + fijos,
      total5: (cD + mant.diesel + fijos) * 5,
    },
    hibrido: {
      combustible: cH,
      mantenimiento: mant.hibrido,
      total: cH + mant.hibrido + fijos,
      total5: (cH + mant.hibrido + fijos) * 5,
    },
    electrico: {
      combustible: cE,
      mantenimiento: mant.electrico,
      total: cE + mant.electrico + fijos,
      total5: (cE + mant.electrico + fijos) * 5,
    },
  };

  // ── ALERTAS CONTEXTUALES ──────────────────────

  const alertas: string[] = [];

  if (zona === 'gran-ciudad') {
    alertas.push(
      '🏙️ Verifica las restricciones ZBE de tu ciudad. Los vehículos sin etiqueta CERO o ECO tienen limitaciones en Madrid, Barcelona, Sevilla y otras ciudades.'
    );
  }
  if (motorPrincipal === 'electrico' && !esPhev && (soloPublico || sinCarga)) {
    alertas.push(
      '⚡ Cargar solo en puntos públicos es más caro y menos conveniente. Valora instalar un wallbox en casa (500-1.200 €) antes de decidirte por un eléctrico puro.'
    );
  }
  if (presupuesto === 'bajo' && motorPrincipal === 'electrico') {
    alertas.push(
      '💶 Los eléctricos nuevos parten de 25.000-30.000 €. Con tu presupuesto, considera un híbrido de segunda mano (Toyota Yaris, Honda Jazz) como alternativa eficiente.'
    );
  }
  if (kmAltos && motorPrincipal === 'gasolina') {
    alertas.push(
      '⛽ Con tus km anuales, la diferencia entre gasolina e híbrido/diésel puede suponer 500-900 € de ahorro al año. Compara el extra del precio inicial con el ahorro acumulado.'
    );
  }
  if (anyos === 'largo' && motorPrincipal === 'diesel' && (zona === 'gran-ciudad' || zona === 'ciudad')) {
    alertas.push(
      '⚠️ Si piensas quedarte el coche 7+ años en ciudad, las restricciones ZBE al diésel podrían aumentar. Un híbrido tendría más vida útil en entorno urbano a medio plazo.'
    );
  }
  if (viajesLargosFrecuentes && motorPrincipal === 'electrico' && !esPhev) {
    alertas.push(
      '🗺️ Con viajes largos frecuentes en eléctrico puro, deberás planificar paradas de recarga. Comprueba que tu recorrido habitual tiene cargadores rápidos. Un PHEV elimina esta limitación.'
    );
  }
  if (accesoMuyImportante && (segmentoKey === 'compacto-bc' || segmentoKey === 'compacto-c')) {
    alertas.push(
      '🦽 Si la facilidad de acceso es muy importante, considera un SUV/crossover aunque el presupuesto sea ajustado: hay opciones desde 12.000-15.000 € en segunda mano reciente.'
    );
  }

  // ── RAZONES (por qué) ──────────────────────────

  const razones: string[] = [];

  if (tieneCargaComoda && sinViajesLargos && motorPrincipal === 'electrico') {
    razones.push(
      `Tienes punto de carga en casa o trabajo y no haces viajes largos → eléctrico totalmente viable`
    );
  }
  if (esPhev) {
    razones.push(
      'Presupuesto alto + carga disponible + viajes largos → PHEV ideal: eléctrico en ciudad, térmico en viajes'
    );
  }
  if (motorPrincipal === 'diesel' && kmAltos && esCarretera) {
    razones.push(
      `${kmAnuales.toLocaleString('es-ES')} km/año en carretera → el diésel amortiza su coste inicial en 2-3 años`
    );
  }
  if (motorPrincipal === 'hibrido' && (sinCarga || soloPublico)) {
    razones.push('Sin punto de carga propio → el híbrido convencional es la opción más eficiente disponible');
  }
  if (accesoMuyImportante) {
    razones.push(
      'Facilidad de entrada/salida muy importante → los SUV/crossover tienen 8-12 cm más de altura que los compactos'
    );
  } else if (acceso === 'algo') {
    razones.push('Facilidad de acceso relevante → se prioriza la altura de acceso del SUV frente al compacto');
  }
  if (aparcaCalle) {
    razones.push('Aparcar habitualmente en calle → tamaño compacto más manejable para maniobrar');
  }
  if (viajeros === '5+') {
    razones.push('5 o más ocupantes habituales → necesitas 7 plazas reales o maletero de gran capacidad');
  }
  if (zona === 'pueblo' && (segmentoKey === 'suv-compacto' || segmentoKey === 'suv-mediano')) {
    razones.push('Zona rural → mayor altura al suelo mejora el paso por carreteras secundarias y accesos');
  }
  if (prioridad === 'planeta') {
    razones.push('Prioridad medioambiental → se maximiza la eficiencia y/o cero emisiones en el uso cotidiano');
  }

  return {
    segmentoKey,
    motorPrincipal,
    esPhev,
    descripcionMotor,
    costes,
    kmAnuales,
    alertas,
    razones,
    mostrarSegundaMano: nuevoUsado === 'reciente' || nuevoUsado === 'indiferente',
  };
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function AsesorVehiculo() {
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const preguntaActual = paso >= 1 && paso <= TOTAL ? PREGUNTAS[paso - 1] : null;
  const progreso = paso >= 1 && paso <= TOTAL ? ((paso - 1) / TOTAL) * 100 : 0;
  const respuestaActual = paso >= 1 ? respuestas[paso] : undefined;

  function seleccionar(valor: string) {
    setRespuestas((prev) => ({ ...prev, [paso]: valor }));
  }

  function siguiente() {
    if (paso < TOTAL) {
      setPaso((p) => p + 1);
    } else {
      setResultado(calcularRecomendacion(respuestas));
      setPaso(TOTAL + 1);
    }
  }

  function anterior() {
    setPaso((p) => Math.max(0, p - 1));
  }

  function reiniciar() {
    setPaso(0);
    setRespuestas({});
    setResultado(null);
  }

  // ── Intro ──────────────────────────────────

  if (paso === 0) {
    return (
      <div className={styles.container}>
        <MeskeiaLogo />
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}>¿Qué coche te conviene?</h1>
          <p className={styles.heroSubtitle}>
            Gasolina o eléctrico. Compacto o SUV. Grande o pequeño.
            <br />
            13 preguntas para dar con el coche que realmente se adapta a ti.
          </p>
        </header>

        <LegalNotice />

        <main className={styles.introContainer}>
          <div className={styles.introCard}>
            <div className={styles.introIconGrid}>
              <span className={styles.introIcon}>🚗</span>
              <span className={styles.introIcon}>🚙</span>
              <span className={styles.introIcon}>⚡</span>
              <span className={styles.introIcon}>🏔️</span>
            </div>
            <h2 className={styles.introTitulo}>El test de orientación de vehículo</h2>
            <p className={styles.introDesc}>
              Con tantas opciones en el mercado, elegir el tipo de coche se ha vuelto complejo.
              Este test analiza tu perfil real y te recomienda el segmento y la motorización más
              adecuados, con comparativa de costes anuales y a 5 años.
            </p>
            <ul className={styles.introFeatures}>
              <li><span aria-hidden="true">📍</span> 13 preguntas sobre tu uso y perfil real</li>
              <li><span aria-hidden="true">🎯</span> Recomendación de segmento y motorización</li>
              <li><span aria-hidden="true">🏷️</span> Etiqueta DGT y modelos de referencia</li>
              <li><span aria-hidden="true">💶</span> Comparativa de costes anuales y a 5 años</li>
              <li><span aria-hidden="true">⏱️</span> Solo 3 minutos</li>
            </ul>
            <button type="button" className={styles.btnStart} onClick={() => setPaso(1)}>
              Empezar el test
            </button>
          </div>
        </main>

        <RelatedApps apps={getRelatedApps('asesor-vehiculo')} />
        <ShareCard appName="asesor-vehiculo" />
        <Footer appName="asesor-vehiculo" />
      </div>
    );
  }

  // ── Preguntas ──────────────────────────────

  if (paso >= 1 && paso <= TOTAL && preguntaActual) {
    return (
      <div className={styles.container}>
        <MeskeiaLogo />

        <main className={styles.testContainer}>
          <div className={styles.progresoWrap}>
            <div className={styles.progresoInfo}>
              <span className={styles.progresoPaso}>
                Pregunta {paso} de {TOTAL}
              </span>
              <span className={styles.progresoCategoria}>{preguntaActual.categoria}</span>
            </div>
            <div
              className={styles.progresoBar}
              role="progressbar"
              aria-label={`Progreso: pregunta ${paso} de ${TOTAL}`}
              aria-valuenow={paso}
              aria-valuemin={1}
              aria-valuemax={TOTAL}
            >
              <div className={styles.progresoRelleno} style={{ width: `${progreso}%` } as React.CSSProperties} />
            </div>
          </div>

          <div className={styles.preguntaCard}>
            <div className={styles.preguntaIcon} aria-hidden="true">
              {preguntaActual.icon}
            </div>
            <h2 className={styles.preguntaTexto}>{preguntaActual.pregunta}</h2>

            <div className={styles.opcionesGrid}>
              {preguntaActual.opciones.map((opcion) => (
                <button
                  type="button"
                  key={opcion.valor}
                  className={`${styles.opcionBtn} ${
                    respuestaActual === opcion.valor ? styles.opcionSeleccionada : ''
                  }`}
                  onClick={() => seleccionar(opcion.valor)}
                  aria-pressed={respuestaActual === opcion.valor ? true : false}
                >
                  <span className={styles.opcionEtiqueta}>{opcion.etiqueta}</span>
                  <span className={styles.opcionDesc}>{opcion.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.navegacion}>
            <button
              type="button"
              className={styles.btnAnterior}
              onClick={anterior}
              aria-label="Pregunta anterior"
            >
              ← Anterior
            </button>
            <button
              type="button"
              className={styles.btnSiguiente}
              onClick={siguiente}
              disabled={!respuestaActual}
              aria-label={paso < TOTAL ? 'Siguiente pregunta' : 'Ver mi recomendación'}
            >
              {paso < TOTAL ? 'Siguiente →' : 'Ver mi recomendación ✓'}
            </button>
          </div>
        </main>

        <Footer appName="asesor-vehiculo" />
      </div>
    );
  }

  // ── Resultados ──────────────────────────────

  if (paso > TOTAL && resultado) {
    const segInfo = SEGMENTOS[resultado.segmentoKey];
    const motorInfo = resultado.esPhev ? MOTOR_PHEV : MOTORES[resultado.motorPrincipal];
    const modelosDisponibles =
      MODELOS_REF[resultado.segmentoKey][resultado.esPhev ? 'phev' : resultado.motorPrincipal] ??
      MODELOS_REF[resultado.segmentoKey]['gasolina'] ??
      [];

    const motores: { tipo: TipoMotor; info: MotorInfo }[] = [
      { tipo: 'electrico', info: MOTORES.electrico },
      { tipo: 'hibrido', info: MOTORES.hibrido },
      { tipo: 'gasolina', info: MOTORES.gasolina },
      { tipo: 'diesel', info: MOTORES.diesel },
    ];

    const minimoTotal = Math.min(
      ...Object.values(resultado.costes).map((c) => c.total)
    );

    return (
      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.heroResultados}>
          <h1 className={styles.heroTitleSm}>Tu recomendación personalizada</h1>
          <p className={styles.heroSubtitleSm}>
            Basada en tu perfil de {resultado.kmAnuales.toLocaleString('es-ES')} km/año
          </p>
        </header>

        <main className={styles.resultadosContainer}>

          {/* Tarjetas principales */}
          <div className={styles.recomendacionGrid}>

            {/* Segmento */}
            <div className={styles.recomendacionCard}>
              <div className={styles.recomendacionIcon} aria-hidden="true">
                {segInfo.icon}
              </div>
              <div className={styles.recomendacionLabel}>Segmento recomendado</div>
              <div className={styles.recomendacionValor}>{segInfo.nombre}</div>
              <p className={styles.recomendacionDesc}>{segInfo.descripcion}</p>

              {/* Rango de precio */}
              <div className={styles.rangoPrecio}>
                <div className={styles.rangoPrecioItem}>
                  <span className={styles.rangoPrecioLabel}>Nuevo</span>
                  <span className={styles.rangoPrecioValor}>{segInfo.precioNuevo}</span>
                </div>
                {resultado.mostrarSegundaMano && (
                  <div className={styles.rangoPrecioItem}>
                    <span className={styles.rangoPrecioLabel}>2ª mano (2-5 años)</span>
                    <span className={styles.rangoPrecioValorSm}>{segInfo.precioSegundaMano}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Motorización */}
            <div className={`${styles.recomendacionCard} ${styles.recomendacionCardMotor}`}>
              <div className={styles.recomendacionIcon} aria-hidden="true">
                {motorInfo.icon}
              </div>
              <div className={styles.recomendacionLabel}>Motorización recomendada</div>
              <div className={styles.recomendacionValor}>{motorInfo.nombre}</div>

              {/* Etiqueta DGT */}
              <div className={styles.dgtWrap}>
                <span className={`${styles.etiquetaDGT} ${styles[`dgt_${motorInfo.colorDGT}`]}`}>
                  {motorInfo.etiquetaDGT}
                </span>
                <span className={styles.dgtDesc}>{motorInfo.descDGT}</span>
              </div>

              <p className={styles.recomendacionDesc}>{resultado.descripcionMotor}</p>

              {/* Modelos de referencia */}
              {modelosDisponibles.length > 0 && (
                <div className={styles.modelosWrap}>
                  <span className={styles.modelosLabel}>Ejemplos del mercado:</span>
                  <div className={styles.modelosList}>
                    {modelosDisponibles.map((m) => (
                      <span key={m} className={styles.modeloBadge}>{m}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Por qué esta recomendación */}
          {resultado.razones.length > 0 && (
            <div className={styles.razonesSection}>
              <h3 className={styles.razonesTitulo}>Por qué esta recomendación</h3>
              <ul className={styles.razonesList}>
                {resultado.razones.map((r, i) => (
                  <li key={i} className={styles.razonItem}>
                    <span className={styles.razonCheck} aria-hidden="true">✓</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Alertas contextuales */}
          {resultado.alertas.length > 0 && (
            <div className={styles.alertasSection} role="alert" aria-live="polite">
              <h3 className={styles.alertasTitulo}>Ten en cuenta</h3>
              {resultado.alertas.map((alerta, i) => (
                <div key={i} className={styles.alertaItem}>
                  {alerta}
                </div>
              ))}
            </div>
          )}

          {/* Tabla comparativa de costes */}
          <div className={styles.tablaSection}>
            <h3 className={styles.tablaTitulo}>
              Coste estimado por tipo de motor
              <span className={styles.tablaSublabel}>
                Para {resultado.kmAnuales.toLocaleString('es-ES')} km/año — Valores orientativos 2025
              </span>
            </h3>
            <div className={styles.tablaResponsive}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th scope="col">Motor</th>
                    <th scope="col">Combustible</th>
                    <th scope="col">Mant.</th>
                    <th scope="col">Fijos*</th>
                    <th scope="col">Año</th>
                    <th scope="col">5 años</th>
                  </tr>
                </thead>
                <tbody>
                  {motores.map(({ tipo, info }) => {
                    const c = resultado.costes[tipo];
                    const esRecomendado = tipo === resultado.motorPrincipal;
                    const esMasBarato = c.total === minimoTotal;
                    return (
                      <tr
                        key={tipo}
                        className={`${styles.tablaFila} ${styles[`fila_${tipo}`]} ${
                          esRecomendado ? styles.filaRecomendada : ''
                        }`}
                      >
                        <td className={styles.celMotor}>
                          <span aria-hidden="true">{info.icon}</span>{' '}
                          {resultado.esPhev && esRecomendado ? 'PHEV' : info.nombre}
                          {esRecomendado && (
                            <span className={styles.badgeRecomendado}>✓ Recomendado</span>
                          )}
                          {esMasBarato && !esRecomendado && (
                            <span className={styles.badgeMasBarato}>Más barato</span>
                          )}
                        </td>
                        <td>{formatCurrency(c.combustible)}</td>
                        <td>{formatCurrency(c.mantenimiento)}</td>
                        <td className={styles.celFijos}>{formatCurrency(805)}</td>
                        <td className={styles.celTotal}>{formatCurrency(c.total)}</td>
                        <td className={styles.celTotal5}>{formatCurrency(c.total5)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className={styles.tablaNota}>
              * Fijos: seguro medio 650 € + ITV amortizada 35 € + impuesto circulación 120 €. El
              seguro varía según perfil y zona. Precios: gasolina 1,65 €/L · diésel 1,55 €/L ·
              electricidad doméstica 0,22 €/kWh. La columna «5 años» proyecta el coste operativo
              acumulado sin incluir el precio de compra del vehículo.
            </p>
          </div>

          {/* CTA siguiente paso */}
          <div className={styles.siguientePaso}>
            <h3 className={styles.siguientePasoTitulo}>¿Ya sabes qué tipo de coche quieres?</h3>
            <p className={styles.siguientePasoDesc}>
              Ahora compara si te conviene más comprarlo al contado, financiarlo, hacer renting o
              leasing con el coste total real de cada opción.
            </p>
            <a href="/comparador-vehiculos/" className={styles.btnCta}>
              Comparar formas de compra →
            </a>
          </div>

          {/* Reiniciar */}
          <div className={styles.reiniciarWrap}>
            <button type="button" className={styles.btnReiniciar} onClick={reiniciar}>
              ↺ Repetir el test
            </button>
          </div>

          <DisclaimerCard
            variant="educational"
            severity="medium"
            collapsible
            context="asesor-vehiculo"
          />

          <EducationalSection
            title="Guía de tipos de coche y motorizaciones"
            subtitle="Aprende a elegir el segmento y la motorización que realmente te conviene"
            defaultOpen={false}
          >
            <h3>¿Cómo elegir el segmento correcto?</h3>
            <p>
              El segmento del vehículo depende principalmente de tres factores: el número de
              ocupantes habitual, el tipo de conducción y las necesidades especiales de espacio o
              terreno. Un vehículo sobredimensionado es más caro de comprar, consumir y aparcar;
              uno demasiado pequeño generará frustración diaria.
            </p>
            <h3>El factor accesibilidad: por qué el SUV/crossover crece tanto</h3>
            <p>
              Los SUV y crossovers tienen una altura de acceso de 450-500 mm frente a los 380-420
              mm de un compacto. Esos 8-12 cm marcan una diferencia notable para personas con
              problemas de cadera, rodilla o espalda, mayores de 60 años, padres con silletas de
              bebé o cualquiera que cargue con frecuencia. El B-SUV (Arona, Kona, Captur) ofrece
              todas estas ventajas con el mismo tamaño exterior que un compacto B.
            </p>
            <h3>Gasolina vs. diésel: la regla de los km</h3>
            <p>
              El diésel compensa si haces más de 15.000-20.000 km anuales principalmente por
              carretera. Con km bajos o conducción urbana, el precio inicial más alto nunca se
              recupera. Con km altos en autovía y un horizonte de 5+ años, el diésel puede
              ahorrar 3.000-5.000 € respecto a la gasolina.
            </p>
            <h3>El híbrido convencional (HEV): la opción más equilibrada</h3>
            <p>
              Sin necesidad de enchufarse, el HEV recupera energía frenando y la usa para asistir
              al motor. En ciudad y uso mixto reduce el consumo un 20-35%. Toyota (Yaris, Corolla,
              RAV4), Honda (Jazz, HR-V) y Hyundai/Kia tienen modelos HEV con fiabilidad
              contrastada y excelente oferta de segunda mano.
            </p>
            <h3>El eléctrico: cuándo tiene sentido real</h3>
            <p>
              Un eléctrico tiene el menor coste por km (2-4 cts/km vs. 8-12 cts del gasolina) y
              el mantenimiento más reducido. Sin embargo, el precio inicial es mayor y la
              infraestructura de carga es determinante: sin garaje propio la ecuación cambia mucho.
              El PHEV resuelve la ansiedad de autonomía manteniendo la etiqueta CERO.
            </p>
            <h3>¿Nuevo o de segunda mano?</h3>
            <p>
              Un vehículo de 2-5 años es la mejor relación coste-valor: ha perdido el 30-40% de
              depreciación (que paga el primer dueño) pero conserva garantía y tecnología reciente.
              Los híbridos enchufables y eléctricos de segunda mano están abaratándose
              notablemente, con revisión de batería incluida en muchos concesionarios.
            </p>
            <div className={styles.warningBox}>
              <strong>Importante:</strong> Los costes son estimaciones orientativas basadas en
              medias de mercado 2025. El coste real depende del modelo concreto, tu forma de
              conducir y el seguro que contrates. Úsalos como referencia comparativa.
            </div>
          </EducationalSection>

          <RelatedApps apps={getRelatedApps('asesor-vehiculo')} />
          <ShareCard appName="asesor-vehiculo" />
        </main>

        <Footer appName="asesor-vehiculo" />
      </div>
    );
  }

  return null;
}
