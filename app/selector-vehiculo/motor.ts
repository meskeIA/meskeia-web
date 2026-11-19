/**
 * Motor del selector de vehículo — sin React. Lo leen la página y su spec
 * (tests/apps/selector-vehiculo.spec.ts), que lo prueba también sin navegador.
 *
 * Extraído de page.tsx el 19/11/2026 al reparar los hallazgos del Inspector del mismo día. Hasta
 * entonces el PHEV no existía como motor: era el eléctrico con otro rótulo (motorPrincipal
 * 'electrico' + esPhev), así que su fila de costes era la del eléctrico puro —sin gasolina y con
 * 200 € de mantenimiento—, la fila del eléctrico desaparecía y heredaba sus razones (hallazgos
 * 5234 y 5237). Ahora 'phev' es un motor más, con su propio coste.
 *
 * MODELO DE COSTES (valores orientativos, los de la nota de la tabla)
 *   combustible/año = km/100 × consumo × precio
 *     gasolina 7,5 L × 1,65 € · diésel 5,5 L × 1,55 € · HEV 5,2 L × 1,65 €
 *     eléctrico 16 kWh × precio del kWh: 0,22 € con carga en casa o en el trabajo, 0,38 € solo en
 *       cargadores públicos y 0,45 € sin punto de carga propio
 *     PHEV: la mitad de los km en eléctrico (16 kWh/100 km) y la otra mitad con el consumo del HEV
 *       (con la batería agotada funciona como un híbrido), con el mantenimiento del HEV porque
 *       lleva motor de combustión. La mitad es un supuesto declarado en la nota, no un dato.
 *   mantenimiento: gasolina 400 · diésel 450 · HEV 350 · PHEV 350 · eléctrico 200
 *   fijos: seguro 650 + ITV 35 + impuesto de circulación 120 = 805
 */

import { formatCurrency, formatNumber } from '@/lib/formatters';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

export type TipoMotor = 'gasolina' | 'diesel' | 'hibrido' | 'phev' | 'electrico';
export type SegmentoKey =
  | 'urbano'
  | 'compacto-bc'
  | 'compacto-c'
  | 'suv-compacto'
  | 'suv-familiar'
  | 'suv-mediano'
  | 'berlina-familiar'
  | 'monovolumen';
export type ColorDGT = 'cero' | 'eco' | 'c' | 'b';

export interface Opcion {
  valor: string;
  etiqueta: string;
  desc: string;
}

export interface Pregunta {
  id: number;
  categoria: string;
  pregunta: string;
  icon: string;
  opciones: Opcion[];
}

export interface CostesMotorizacion {
  combustible: number;
  mantenimiento: number;
  total: number;
  total5: number;
}

export interface Resultado {
  segmentoKey: SegmentoKey;
  motorPrincipal: TipoMotor;
  descripcionMotor: string;
  costes: Record<TipoMotor, CostesMotorizacion>;
  kmAnuales: number;
  /** Precio del kWh que usa la cifra del eléctrico, y de dónde sale: lo dice la nota (5240). */
  precioKwh: number;
  origenKwh: string;
  alertas: string[];
  razones: string[];
  mostrarSegundaMano: boolean;
}

// ─────────────────────────────────────────────
// Segmentos
// ─────────────────────────────────────────────

export interface SegmentoInfo {
  nombre: string;
  icon: string;
  descripcion: string;
  precioNuevo: string;
  precioSegundaMano: string;
}

export const SEGMENTOS: Record<SegmentoKey, SegmentoInfo> = {
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
// Motorizaciones
// ─────────────────────────────────────────────

export interface MotorInfo {
  nombre: string;
  icon: string;
  etiquetaDGT: string;
  colorDGT: ColorDGT;
  descDGT: string;
}

export const MOTORES: Record<TipoMotor, MotorInfo> = {
  electrico: {
    nombre: '100% Eléctrico',
    icon: '⚡',
    etiquetaDGT: 'CERO',
    colorDGT: 'cero',
    descDGT:
      'Acceso libre en ZBE, plazas ORA gratuitas o bonificadas, sin impuesto de matriculación y con deducción fiscal en IRPF.',
  },
  phev: {
    nombre: 'Híbrido Enchufable (PHEV)',
    icon: '🔋',
    etiquetaDGT: 'CERO',
    colorDGT: 'cero',
    descDGT:
      'Etiqueta CERO como los eléctricos puros: acceso libre en ZBE, plazas ORA bonificadas. Permite circular en modo eléctrico en ciudad y usar el motor térmico en viajes largos.',
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

// ─────────────────────────────────────────────
// Modelos de referencia por segmento y motor
// ─────────────────────────────────────────────

/**
 * Sin lista para un motor, no hay ejemplos: hasta el 19/11/2026 se caía a la lista de gasolina y
 * bajo «Híbrido Enchufable (PHEV)» salían coches de combustión (hallazgo 5236). Las listas «hibrido»
 * son solo HEV: un enchufable con 40 km o más de autonomía lleva la etiqueta «0 emisiones», no la
 * ECO (Orden PCI/810/2018, BOE-A-2018-10856), y estaban el Outlander PHEV y el Octavia iV (5247).
 */
export const MODELOS_REF: Record<SegmentoKey, Partial<Record<TipoMotor, string[]>>> = {
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
    hibrido: ['Toyota RAV4 Hybrid', 'Kia Sorento Hybrid'],
    electrico: ['Tesla Model Y', 'VW ID.4', 'BMW iX3'],
    diesel: ['VW Tiguan TDI', 'Peugeot 5008 HDi', 'Ford Kuga TDCi'],
    phev: ['Mitsubishi Outlander PHEV', 'Toyota RAV4 PHEV'],
  },
  'berlina-familiar': {
    gasolina: ['Seat León SW', 'Skoda Octavia Combi', 'Peugeot 508 SW'],
    hibrido: ['Toyota Corolla TS Hybrid'],
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

const SEGMENTOS_SUV: SegmentoKey[] = ['suv-compacto', 'suv-familiar', 'suv-mediano'];
const SEGMENTOS_PEQUENOS: SegmentoKey[] = ['urbano', 'compacto-bc', 'compacto-c'];

/** Ejemplos del mercado del motor recomendado, o ninguno si su segmento no tiene lista. */
export function modelosDe(segmento: SegmentoKey, motor: TipoMotor): string[] {
  return MODELOS_REF[segmento][motor] ?? [];
}

// ─────────────────────────────────────────────
// Preguntas del test (13)
// ─────────────────────────────────────────────

export const PREGUNTAS: Pregunta[] = [
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

export const TOTAL = PREGUNTAS.length;

// ─────────────────────────────────────────────
// Modelo de costes
// ─────────────────────────────────────────────

export const PRECIO_GASOLINA = 1.65;
export const PRECIO_DIESEL = 1.55;
export const CONSUMO = { gasolina: 7.5, diesel: 5.5, hibrido: 5.2, electrico: 16 } as const;
/** Parte de los km de un PHEV que se hace en eléctrico: supuesto declarado en la nota. */
export const CUOTA_ELECTRICA_PHEV = 0.5;
export const MANTENIMIENTO: Record<TipoMotor, number> = {
  gasolina: 400,
  diesel: 450,
  hibrido: 350,
  phev: 350,
  electrico: 200,
};
export const FIJOS = 650 + 35 + 120;

function coste(combustible: number, mantenimiento: number): CostesMotorizacion {
  const total = combustible + mantenimiento + FIJOS;
  return { combustible, mantenimiento, total, total5: total * 5 };
}

/** Costes anuales y a 5 años de los cinco motores para unos km y un precio del kWh. */
export function calcularCostes(kmAnuales: number, precioKwh: number): Record<TipoMotor, CostesMotorizacion> {
  const cien = kmAnuales / 100;
  const litrosHev = CONSUMO.hibrido * PRECIO_GASOLINA;
  const kwh = CONSUMO.electrico * precioKwh;
  return {
    gasolina: coste(Math.round(cien * CONSUMO.gasolina * PRECIO_GASOLINA), MANTENIMIENTO.gasolina),
    diesel: coste(Math.round(cien * CONSUMO.diesel * PRECIO_DIESEL), MANTENIMIENTO.diesel),
    hibrido: coste(Math.round(cien * litrosHev), MANTENIMIENTO.hibrido),
    phev: coste(
      Math.round(cien * (CUOTA_ELECTRICA_PHEV * kwh + (1 - CUOTA_ELECTRICA_PHEV) * litrosHev)),
      MANTENIMIENTO.phev,
    ),
    electrico: coste(Math.round(cien * kwh), MANTENIMIENTO.electrico),
  };
}

// ─────────────────────────────────────────────
// Lógica de recomendación
// ─────────────────────────────────────────────

export function calcularRecomendacion(r: Record<number, string>): Resultado {
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
    // Familia + carretera → SUV familiar o berlina, con la regla de los km altos de más abajo: hasta
    // el 19/11/2026 las dos salidas eran 'suv-familiar' y la berlina no salía nunca (hallazgo 5249)
    segmentoKey = kmAltos && esCarretera && !accesoImportante ? 'berlina-familiar' : 'suv-familiar';
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
    motorPrincipal = 'phev';
    descripcionMotor =
      'Un Híbrido Enchufable (PHEV) es tu mejor opción: modo eléctrico en el día a día (50-80 km sin emitir) y motor térmico cuando se agota la batería o en los viajes largos, sin ansiedad de autonomía. Combina la etiqueta CERO con la flexibilidad total.';
  } else if (kmAltos && esCarretera && anyos !== 'corto' && presupuesto !== 'bajo' && prioridad !== 'ahorro') {
    // Con los consumos de la tabla el diésel no alcanza nunca al HEV (gasta 0,055 € menos cada
    // 100 km y paga 100 € más de mantenimiento: empatarían a 181.818 km/año), así que a quien
    // prioriza el coste de uso no se le recomienda, ni se dice que sea el más barato (hallazgo 5235)
    motorPrincipal = 'diesel';
    descripcionMotor =
      'Con muchos kilómetros en carretera y varios años de uso, el diésel gasta bastante menos combustible que la gasolina (5,5 L/100 km frente a 7,5 en la tabla) y tiene mucha autonomía. Si lo que más te importa es el coste de uso, mira la fila del híbrido: con estos consumos sale algo más barato.';
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
  const origenKwh = tieneCargaComoda
    ? 'carga en casa o en el trabajo'
    : soloPublico
      ? 'solo en cargadores públicos'
      : 'sin punto de carga propio, toda la recarga en cargadores rápidos';
  const costes = calcularCostes(kmAnuales, precioKwh);

  // ── ALERTAS CONTEXTUALES ──────────────────────

  const alertas: string[] = [];

  if (zona === 'gran-ciudad') {
    alertas.push(
      '🏙️ Verifica las restricciones ZBE de tu ciudad. Los vehículos sin etiqueta CERO o ECO tienen limitaciones en Madrid, Barcelona, Sevilla y otras ciudades.'
    );
  }
  if (motorPrincipal === 'electrico' && (soloPublico || sinCarga)) {
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
    // Las cifras salen de la tabla de al lado: hasta el 19/11/2026 era un rango fijo de 500-900 €
    // que se quedaba por debajo de lo que la tabla calculaba (1093 € a 27.500 km; hallazgo 5239)
    const ahorroHev = costes.gasolina.total - costes.hibrido.total;
    const ahorroDiesel = costes.gasolina.total - costes.diesel.total;
    alertas.push(
      `⛽ Con tus km anuales, según la tabla, un híbrido te ahorraría unos ${formatCurrency(ahorroHev)} al año de uso frente a la gasolina, y un diésel unos ${formatCurrency(ahorroDiesel)}. Compara ese ahorro con lo que cuestan de más al comprarlos.`
    );
  }
  if (anyos === 'largo' && motorPrincipal === 'diesel' && (zona === 'gran-ciudad' || zona === 'ciudad')) {
    alertas.push(
      '⚠️ Si piensas quedarte el coche 7+ años en ciudad, las restricciones ZBE al diésel podrían aumentar. Un híbrido tendría más vida útil en entorno urbano a medio plazo.'
    );
  }
  if (viajesLargosFrecuentes && motorPrincipal === 'electrico') {
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
  if (motorPrincipal === 'phev') {
    // Cada razón sale de una respuesta que de verdad lleva al PHEV (hallazgo 5237): antes decía
    // «viajes largos» a quien había contestado «Prácticamente nunca» y salía por los km.
    const dondeCarga = carga === 'casa' ? 'en casa' : 'en el trabajo';
    if (kmAltos) {
      razones.push(
        `${kmAnuales.toLocaleString('es-ES')} km/año con carga ${dondeCarga} → el PHEV hace en eléctrico los trayectos del día a día y usa el motor térmico cuando se agota la batería`
      );
    }
    if (viajesLargosFrecuentes) {
      razones.push('Viajes largos frecuentes → el motor térmico evita depender de los cargadores en ruta');
    }
    razones.push('Presupuesto de más de 25.000 € → cabe el sobreprecio de un híbrido enchufable');
  }
  if (motorPrincipal === 'diesel' && kmAltos && esCarretera) {
    razones.push(
      `${kmAnuales.toLocaleString('es-ES')} km/año en carretera → el diésel gasta menos combustible que la gasolina (${formatCurrency(costes.diesel.combustible)} frente a ${formatCurrency(costes.gasolina.combustible)} al año en la tabla)`
    );
  }
  if (motorPrincipal === 'hibrido' && (sinCarga || soloPublico)) {
    razones.push('Sin punto de carga propio → el híbrido convencional es la opción más eficiente disponible');
  }
  // Las razones de acceso, aparcamiento y medio ambiente solo salen si el resultado las cumple:
  // hasta el 19/11/2026 se añadían por la respuesta, y a un urbano se le decía que se priorizaba
  // el SUV, a un monovolumen que era compacto y a un diésel que maximizaba las cero emisiones (5238)
  const esSuv = SEGMENTOS_SUV.includes(segmentoKey);
  if (accesoMuyImportante && (esSuv || segmentoKey === 'monovolumen')) {
    razones.push(
      'Facilidad de entrada/salida muy importante → los SUV/crossover tienen 8-12 cm más de altura que los compactos'
    );
  } else if (acceso === 'algo' && esSuv) {
    razones.push('Facilidad de acceso relevante → se prioriza la altura de acceso del SUV frente al compacto');
  }
  if (aparcaCalle && SEGMENTOS_PEQUENOS.includes(segmentoKey)) {
    razones.push('Aparcar habitualmente en calle → tamaño compacto más manejable para maniobrar');
  }
  if (viajeros === '5+') {
    razones.push('5 o más ocupantes habituales → necesitas 7 plazas reales o maletero de gran capacidad');
  }
  if (zona === 'pueblo' && (segmentoKey === 'suv-compacto' || segmentoKey === 'suv-mediano')) {
    razones.push('Zona rural → mayor altura al suelo mejora el paso por carreteras secundarias y accesos');
  }
  if (prioridad === 'planeta') {
    const porMotor: Partial<Record<TipoMotor, string>> = {
      electrico: 'el eléctrico no emite gases por el tubo de escape',
      phev: 'el PHEV circula sin emisiones mientras le dura la batería',
      hibrido: 'el híbrido consume menos combustible que la gasolina y el diésel de la tabla',
    };
    const motivo = porMotor[motorPrincipal];
    if (motivo) razones.push(`Prioridad medioambiental → ${motivo}`);
  }

  return {
    segmentoKey,
    motorPrincipal,
    descripcionMotor,
    costes,
    kmAnuales,
    precioKwh,
    origenKwh,
    alertas,
    razones,
    mostrarSegundaMano: nuevoUsado === 'reciente' || nuevoUsado === 'indiferente',
  };
}

/**
 * Los precios de la nota de la tabla, con el del kWh que de verdad usa la cifra del eléctrico:
 * hasta el 19/11/2026 decía siempre «electricidad doméstica 0,22 €/kWh» aunque sin carga se
 * calculara con 0,45 y con solo carga pública con 0,38 (hallazgo 5240).
 */
export function textoPrecios(r: Pick<Resultado, 'precioKwh' | 'origenKwh'>): string {
  return `gasolina ${formatNumber(PRECIO_GASOLINA, 2)} €/L · diésel ${formatNumber(PRECIO_DIESEL, 2)} €/L · electricidad ${formatNumber(r.precioKwh, 2)} €/kWh (${r.origenKwh})`;
}

/** Motores de la tabla de costes: el PHEV solo cuando es el recomendado, junto al eléctrico. */
export function motoresDeLaTabla(recomendado: TipoMotor): TipoMotor[] {
  return recomendado === 'phev'
    ? ['electrico', 'phev', 'hibrido', 'gasolina', 'diesel']
    : ['electrico', 'hibrido', 'gasolina', 'diesel'];
}
