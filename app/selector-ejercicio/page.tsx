'use client';

import React, { useState } from 'react';
import styles from './SelectorEjercicio.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type EjercicioKey = 'gimnasio' | 'running' | 'natacion' | 'ciclismo' | 'yoga-pilates' | 'entrenamiento-casa';

type Pantalla = 'inicio' | 'test' | 'resultado';

interface PesosPorEjercicio {
  gimnasio: number;
  running: number;
  natacion: number;
  ciclismo: number;
  'yoga-pilates': number;
  'entrenamiento-casa': number;
}

interface OpcionPregunta {
  valor: string;
  etiqueta: string;
  descripcion: string;
  pesos: PesosPorEjercicio;
}

interface Pregunta {
  id: string;
  categoria: string;
  icono: string;
  texto: string;
  opciones: OpcionPregunta[];
}

interface EjercicioInfo {
  icono: string;
  nombre: string;
  perfil: string;
  descripcion: string;
  frecuencia: string;
  inicio: string;
  coste: string;
  beneficios: string[];
  equipo: string[];
  consejos: string[];
}

interface ResultadoCalculado {
  ejercicio: EjercicioKey;
  puntos: Record<EjercicioKey, number>;
}

// ─────────────────────────────────────────────
// Preguntas del test (10)
// ─────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  {
    id: 'objetivo',
    categoria: 'Objetivo Principal',
    icono: '🎯',
    texto: '¿Cuál es tu objetivo principal con el ejercicio?',
    opciones: [
      { valor: 'perder_peso', etiqueta: 'Perder peso y quemar grasa', descripcion: 'Déficit calórico y cardio prioritario', pesos: { gimnasio: 2, running: 3, natacion: 2, ciclismo: 3, 'yoga-pilates': 1, 'entrenamiento-casa': 2 } },
      { valor: 'musculo', etiqueta: 'Ganar músculo y fuerza', descripcion: 'Entrenamiento de resistencia', pesos: { gimnasio: 3, running: 0, natacion: 1, ciclismo: 1, 'yoga-pilates': 1, 'entrenamiento-casa': 2 } },
      { valor: 'cardio', etiqueta: 'Mejorar la resistencia cardiovascular', descripcion: 'Corazón y pulmones más fuertes', pesos: { gimnasio: 1, running: 3, natacion: 3, ciclismo: 3, 'yoga-pilates': 1, 'entrenamiento-casa': 1 } },
      { valor: 'bienestar', etiqueta: 'Reducir estrés y mejorar el bienestar mental', descripcion: 'Equilibrio mental y físico', pesos: { gimnasio: 1, running: 2, natacion: 2, ciclismo: 2, 'yoga-pilates': 3, 'entrenamiento-casa': 2 } },
      { valor: 'flexibilidad', etiqueta: 'Ganar flexibilidad y movilidad', descripcion: 'Articulaciones y músculos más ágiles', pesos: { gimnasio: 1, running: 0, natacion: 2, ciclismo: 0, 'yoga-pilates': 3, 'entrenamiento-casa': 2 } },
    ],
  },
  {
    id: 'tiempo',
    categoria: 'Disponibilidad',
    icono: '⏱️',
    texto: '¿Cuánto tiempo puedes dedicar al ejercicio por sesión?',
    opciones: [
      { valor: 'poco', etiqueta: 'Menos de 30 minutos', descripcion: 'Sesiones cortas pero frecuentes', pesos: { gimnasio: 1, running: 2, natacion: 1, ciclismo: 1, 'yoga-pilates': 2, 'entrenamiento-casa': 3 } },
      { valor: 'medio', etiqueta: 'Entre 30 y 60 minutos', descripcion: 'Tiempo razonable para una rutina', pesos: { gimnasio: 2, running: 3, natacion: 2, ciclismo: 2, 'yoga-pilates': 3, 'entrenamiento-casa': 3 } },
      { valor: 'bastante', etiqueta: 'Entre 1 y 2 horas', descripcion: 'Puedo dedicar tiempo de calidad', pesos: { gimnasio: 3, running: 2, natacion: 3, ciclismo: 3, 'yoga-pilates': 2, 'entrenamiento-casa': 2 } },
      { valor: 'mucho', etiqueta: 'Más de 2 horas', descripcion: 'El deporte es una prioridad en mi vida', pesos: { gimnasio: 3, running: 2, natacion: 3, ciclismo: 3, 'yoga-pilates': 2, 'entrenamiento-casa': 1 } },
    ],
  },
  {
    id: 'compania',
    categoria: 'Entorno Social',
    icono: '👥',
    texto: '¿Prefieres hacer ejercicio solo/a o con compañía?',
    opciones: [
      { valor: 'solo', etiqueta: 'Solo/a, a mi ritmo', descripcion: 'La soledad me ayuda a concentrarme', pesos: { gimnasio: 2, running: 3, natacion: 3, ciclismo: 2, 'yoga-pilates': 2, 'entrenamiento-casa': 3 } },
      { valor: 'acompanado', etiqueta: 'Con compañía, me motiva más', descripcion: 'El grupo me ayuda a mantener el ritmo', pesos: { gimnasio: 2, running: 2, natacion: 1, ciclismo: 2, 'yoga-pilates': 2, 'entrenamiento-casa': 1 } },
      { valor: 'indiferente', etiqueta: 'Me da igual, me adapto', descripcion: 'Flexible con el entorno', pesos: { gimnasio: 3, running: 2, natacion: 2, ciclismo: 2, 'yoga-pilates': 2, 'entrenamiento-casa': 2 } },
    ],
  },
  {
    id: 'lugar',
    categoria: 'Preferencia de Lugar',
    icono: '📍',
    texto: '¿Dónde prefieres hacer ejercicio?',
    opciones: [
      { valor: 'casa', etiqueta: 'En casa, sin salir', descripcion: 'Comodidad y ahorro de tiempo de desplazamiento', pesos: { gimnasio: 0, running: 0, natacion: 0, ciclismo: 0, 'yoga-pilates': 2, 'entrenamiento-casa': 3 } },
      { valor: 'exterior', etiqueta: 'Al aire libre', descripcion: 'Contacto con la naturaleza y el entorno', pesos: { gimnasio: 0, running: 3, natacion: 1, ciclismo: 3, 'yoga-pilates': 1, 'entrenamiento-casa': 0 } },
      { valor: 'instalacion', etiqueta: 'En instalación deportiva (gym, piscina...)', descripcion: 'Equipamiento profesional disponible', pesos: { gimnasio: 3, running: 0, natacion: 3, ciclismo: 1, 'yoga-pilates': 2, 'entrenamiento-casa': 0 } },
      { valor: 'cualquier', etiqueta: 'Donde sea, lo que importe es moverme', descripcion: 'Total flexibilidad', pesos: { gimnasio: 2, running: 2, natacion: 2, ciclismo: 2, 'yoga-pilates': 2, 'entrenamiento-casa': 2 } },
    ],
  },
  {
    id: 'presupuesto',
    categoria: 'Presupuesto',
    icono: '💶',
    texto: '¿Cuánto puedes invertir mensualmente en tu práctica deportiva?',
    opciones: [
      { valor: 'cero', etiqueta: 'Cero euros, sin gasto', descripcion: 'El deporte debe ser gratuito', pesos: { gimnasio: 0, running: 2, natacion: 0, ciclismo: 1, 'yoga-pilates': 1, 'entrenamiento-casa': 3 } },
      { valor: 'bajo', etiqueta: 'Hasta 20 €/mes', descripcion: 'Gasto mínimo aceptable', pesos: { gimnasio: 1, running: 3, natacion: 1, ciclismo: 2, 'yoga-pilates': 2, 'entrenamiento-casa': 3 } },
      { valor: 'medio', etiqueta: 'Entre 20 y 60 €/mes', descripcion: 'Cuota de gimnasio o actividad habitual', pesos: { gimnasio: 3, running: 2, natacion: 2, ciclismo: 2, 'yoga-pilates': 3, 'entrenamiento-casa': 2 } },
      { valor: 'alto', etiqueta: 'Más de 60 €/mes sin problema', descripcion: 'Inversión en salud sin restricciones', pesos: { gimnasio: 3, running: 2, natacion: 3, ciclismo: 3, 'yoga-pilates': 3, 'entrenamiento-casa': 2 } },
    ],
  },
  {
    id: 'condicion',
    categoria: 'Condición Física Actual',
    icono: '💪',
    texto: '¿Cómo describirías tu condición física actual?',
    opciones: [
      { valor: 'muy_baja', etiqueta: 'Muy sedentario/a, empiezo desde cero', descripcion: 'Poca o nula actividad hasta ahora', pesos: { gimnasio: 2, running: 1, natacion: 2, ciclismo: 2, 'yoga-pilates': 3, 'entrenamiento-casa': 3 } },
      { valor: 'baja', etiqueta: 'Regular, algo de actividad ocasional', descripcion: 'Me muevo algo pero sin rutina', pesos: { gimnasio: 2, running: 2, natacion: 2, ciclismo: 2, 'yoga-pilates': 2, 'entrenamiento-casa': 2 } },
      { valor: 'media', etiqueta: 'Buena, tengo base física', descripcion: 'Entrenamiento regular previo', pesos: { gimnasio: 3, running: 2, natacion: 2, ciclismo: 2, 'yoga-pilates': 2, 'entrenamiento-casa': 2 } },
      { valor: 'alta', etiqueta: 'Muy buena, busco un reto mayor', descripcion: 'Alto rendimiento o competición', pesos: { gimnasio: 3, running: 3, natacion: 3, ciclismo: 3, 'yoga-pilates': 2, 'entrenamiento-casa': 1 } },
    ],
  },
  {
    id: 'limitaciones',
    categoria: 'Limitaciones Físicas',
    icono: '🩺',
    texto: '¿Tienes alguna limitación física o lesión?',
    opciones: [
      { valor: 'ninguna', etiqueta: 'Ninguna, estoy bien físicamente', descripcion: 'Puedo hacer cualquier tipo de ejercicio', pesos: { gimnasio: 3, running: 3, natacion: 3, ciclismo: 3, 'yoga-pilates': 3, 'entrenamiento-casa': 3 } },
      { valor: 'rodillas', etiqueta: 'Problemas de rodillas o piernas', descripcion: 'Evito impactos', pesos: { gimnasio: 2, running: 0, natacion: 3, ciclismo: 2, 'yoga-pilates': 2, 'entrenamiento-casa': 2 } },
      { valor: 'espalda', etiqueta: 'Problemas de espalda o columna', descripcion: 'Necesito cuidado postural', pesos: { gimnasio: 1, running: 1, natacion: 3, ciclismo: 1, 'yoga-pilates': 3, 'entrenamiento-casa': 2 } },
      { valor: 'general', etiqueta: 'Problemas articulares generales', descripcion: 'Bajo impacto necesario', pesos: { gimnasio: 1, running: 0, natacion: 3, ciclismo: 2, 'yoga-pilates': 3, 'entrenamiento-casa': 2 } },
    ],
  },
  {
    id: 'motivacion',
    categoria: 'Factor de Motivación',
    icono: '🔥',
    texto: '¿Qué te motiva mejor para mantener la constancia?',
    opciones: [
      { valor: 'estructura', etiqueta: 'Rutinas estructuradas y planificadas', descripcion: 'Seguir un plan predefinido', pesos: { gimnasio: 3, running: 2, natacion: 2, ciclismo: 2, 'yoga-pilates': 2, 'entrenamiento-casa': 2 } },
      { valor: 'variedad', etiqueta: 'Variedad, me aburro con la rutina', descripcion: 'Necesito estímulos distintos', pesos: { gimnasio: 2, running: 1, natacion: 2, ciclismo: 2, 'yoga-pilates': 1, 'entrenamiento-casa': 1 } },
      { valor: 'progreso', etiqueta: 'Ver progreso medible (kilos, tiempos, récords)', descripcion: 'Los datos me enganchan', pesos: { gimnasio: 3, running: 3, natacion: 2, ciclismo: 3, 'yoga-pilates': 1, 'entrenamiento-casa': 2 } },
      { valor: 'social', etiqueta: 'El componente social o competitivo', descripcion: 'Otros me dan energía', pesos: { gimnasio: 2, running: 2, natacion: 1, ciclismo: 2, 'yoga-pilates': 2, 'entrenamiento-casa': 0 } },
    ],
  },
  {
    id: 'historial',
    categoria: 'Experiencia Previa',
    icono: '📋',
    texto: '¿Qué te ha funcionado mejor hasta ahora?',
    opciones: [
      { valor: 'ninguno', etiqueta: 'No he tenido rutina deportiva nunca', descripcion: 'Empiezo desde cero', pesos: { gimnasio: 2, running: 2, natacion: 2, ciclismo: 2, 'yoga-pilates': 3, 'entrenamiento-casa': 3 } },
      { valor: 'sala', etiqueta: 'Entrenamiento en sala o con máquinas', descripcion: 'Gimnasio o similar', pesos: { gimnasio: 3, running: 1, natacion: 1, ciclismo: 1, 'yoga-pilates': 1, 'entrenamiento-casa': 2 } },
      { valor: 'individual', etiqueta: 'Deporte individual a mi aire', descripcion: 'Running, bici, natación...', pesos: { gimnasio: 1, running: 3, natacion: 3, ciclismo: 3, 'yoga-pilates': 2, 'entrenamiento-casa': 2 } },
      { valor: 'equipo', etiqueta: 'Deporte de equipo o en grupo', descripcion: 'Fútbol, pádel, clases colectivas...', pesos: { gimnasio: 2, running: 1, natacion: 1, ciclismo: 1, 'yoga-pilates': 2, 'entrenamiento-casa': 0 } },
    ],
  },
  {
    id: 'prioridad',
    categoria: 'Prioridad Personal',
    icono: '⭐',
    texto: '¿Qué priorizas al elegir una actividad deportiva?',
    opciones: [
      { valor: 'comodidad', etiqueta: 'Comodidad y cercanía', descripcion: 'Que sea fácil de mantener sin desplazamientos', pesos: { gimnasio: 2, running: 2, natacion: 1, ciclismo: 1, 'yoga-pilates': 2, 'entrenamiento-casa': 3 } },
      { valor: 'eficacia', etiqueta: 'Eficacia y rapidez de resultados', descripcion: 'Máximo resultado en mínimo tiempo', pesos: { gimnasio: 3, running: 2, natacion: 2, ciclismo: 2, 'yoga-pilates': 1, 'entrenamiento-casa': 2 } },
      { valor: 'diversion', etiqueta: 'Diversión y disfrute', descripcion: 'Que sea un placer, no una obligación', pesos: { gimnasio: 1, running: 2, natacion: 2, ciclismo: 3, 'yoga-pilates': 2, 'entrenamiento-casa': 1 } },
      { valor: 'impacto', etiqueta: 'Bajo impacto para las articulaciones', descripcion: 'Que no me lastime a largo plazo', pesos: { gimnasio: 1, running: 0, natacion: 3, ciclismo: 2, 'yoga-pilates': 3, 'entrenamiento-casa': 2 } },
    ],
  },
];

// ─────────────────────────────────────────────
// Datos de ejercicios
// ─────────────────────────────────────────────

const EJERCICIOS: Record<EjercicioKey, EjercicioInfo> = {
  gimnasio: {
    icono: '🏋️',
    nombre: 'Gimnasio y Entrenamiento de Fuerza',
    perfil: 'Resultados medibles · Estructura · Equipamiento completo',
    descripcion: 'El gimnasio ofrece el entorno más versátil para trabajar todos los grupos musculares. Ideal si buscas resultados tangibles en fuerza, composición corporal o simplemente quieres una rutina estructurada.',
    frecuencia: '3-4 días/semana, sesiones de 45-75 min',
    inicio: 'Pide orientación inicial a un monitor para no lesionarte',
    coste: '25-50 €/mes según instalación',
    beneficios: ['Mejora de fuerza y masa muscular demostrable', 'Control total de cargas y progresión', 'Acceso a todos los grupos musculares', 'Protección articular a largo plazo si entrenas bien', 'Independiente del clima'],
    equipo: ['Zapatillas de entrenamiento (no de running)', 'Ropa cómoda y transpirable', 'Toalla y candado para taquilla', 'Botella de agua reutilizable', 'Opcional: guantes, cinturón, straps'],
    consejos: ['Empieza con pesos bajos para aprender la técnica', 'El descanso entre sesiones es tan importante como entrenar', 'La progresión debe ser gradual: no subas más del 10% de carga por semana', 'Come proteína suficiente (1,6-2g/kg de peso) si quieres ganar músculo'],
  },
  running: {
    icono: '🏃',
    nombre: 'Running y Carrera',
    perfil: 'Libertad · Bajo coste · Alta eficacia cardiovascular',
    descripcion: 'El running es la actividad aeróbica más accesible. Solo necesitas zapatillas y salir a la calle. Extraordinario para la salud cardiovascular, gestión del estrés y pérdida de grasa con constancia.',
    frecuencia: '3-4 días/semana, sesiones de 20-60 min',
    inicio: 'Método run-walk: empieza alternando 1 min corriendo / 2 min caminando',
    coste: 'Casi gratuito — solo zapatillas de calidad (~80-150€ que duran 500-800 km)',
    beneficios: ['Mejora cardiovascular muy rápida', 'Quema calórica alta por sesión', 'Libera endorfinas y reduce el estrés', 'Puedes hacerlo en cualquier lugar del mundo', 'Comunidad muy amplia y accesible'],
    equipo: ['Zapatillas de running específicas (imprescindible)', 'Ropa técnica transpirable', 'Reloj o app para medir ritmo y distancia', 'Sujetador deportivo de sujeción alta (imprescindible)', 'Opcional: auriculares inalámbricos'],
    consejos: ['El 80% de tu entrenamiento debe ser a ritmo conversacional (test: puedes hablar)', 'Descansa al menos un día entre sesiones al principio', 'Estira y fortalece el core para prevenir lesiones', 'El calzado inadecuado es la principal causa de lesión en runners'],
  },
  natacion: {
    icono: '🏊',
    nombre: 'Natación',
    perfil: 'Cero impacto · Cuerpo completo · Ideal para lesiones',
    descripcion: 'El ejercicio más completo y con menos riesgo de lesión. Trabaja todos los grupos musculares simultáneamente, mejora la capacidad pulmonar y es especialmente indicada para personas con problemas articulares.',
    frecuencia: '3-4 días/semana, sesiones de 30-60 min',
    inicio: 'Empieza con 20-30 min y aumenta el volumen progresivamente',
    coste: '20-40 €/mes en piscina municipal, más en centros privados',
    beneficios: ['Cero impacto articular', 'Trabaja todo el cuerpo en una sesión', 'Mejora capacidad pulmonar y cardiovascular', 'Indicada en embarazo, artritis, obesidad, rehabilitación', 'Refrescante en verano, climatizada en invierno'],
    equipo: ['Bañador/bañadora de lycra (no de playa)', 'Gafas de natación', 'Gorro de silicona', 'Chanclas para la zona de duchas', 'Opcional: tabla, pull buoy, aletas'],
    consejos: ['Si no tienes buena técnica, una clase inicial vale mucho la inversión', 'Aprende al menos 2 estilos para variar y evitar sobrecargas', 'El cloro reseca: hidrata la piel y el cabello después', 'Comer justo antes de nadar puede causar molestias — espera 1h'],
  },
  ciclismo: {
    icono: '🚴',
    nombre: 'Ciclismo (Ruta o MTB)',
    perfil: 'Libertad · Alta quema calórica · Bajo impacto',
    descripcion: 'El ciclismo combina ejercicio cardiovascular intenso con bajo impacto articular. Tanto en ruta como en montaña, ofrece paisajes, comunidad activa y una herramienta de transporte sostenible.',
    frecuencia: '2-4 días/semana, salidas de 1-3 horas',
    inicio: 'Empieza en terreno llano y ve aumentando la distancia gradualmente',
    coste: 'Inversión inicial en bici (300-1.500€) + mantenimiento anual',
    beneficios: ['Muy alta quema calórica en salidas largas', 'Bajo impacto en rodillas y articulaciones', 'Puede ser transporte y ejercicio a la vez', 'Comunidad muy activa y solidaria', 'Paisajes y naturaleza como motivación'],
    equipo: ['Bicicleta adecuada al uso (ruta, MTB, urbana)', 'Casco (obligatorio en carretera)', 'Culotte acolchado', 'Gafas de sol y guantes', 'Agua y gel energético para salidas largas'],
    consejos: ['Regula la altura del sillín: la rodilla debe quedar casi extendida abajo', 'En carretera, sé siempre visible (luces, chaleco en condiciones de poca visibilidad)', 'El mantenimiento básico (inflado, cadena) lo puedes aprender fácilmente', 'Empieza con distancias cortas: la resistencia ciclista se construye despacio'],
  },
  'yoga-pilates': {
    icono: '🧘',
    nombre: 'Yoga y Pilates',
    perfil: 'Mente-cuerpo · Flexibilidad · Bajo impacto',
    descripcion: 'Disciplinas que combinan movimiento consciente, respiración y fuerza postural. Ideales para reducir el estrés, ganar flexibilidad y mejorar la postura. Perfectas como complemento o como actividad principal.',
    frecuencia: '3-5 días/semana, sesiones de 30-60 min',
    inicio: 'Clases para principiantes presenciales o apps guiadas',
    coste: 'Gratis con apps o YouTube · 30-80 €/mes en estudio',
    beneficios: ['Reducción del estrés y la ansiedad demostrada', 'Mejora de postura y consciencia corporal', 'Flexibilidad y movilidad articular', 'Fortalecimiento del core y músculos estabilizadores', 'Puede practicarse en casa sin equipamiento'],
    equipo: ['Esterilla antideslizante (imprescindible)', 'Ropa cómoda y elástica', 'Opcional: bloque y correa de yoga', 'Espacio despejado de 2x1 metros'],
    consejos: ['No fuerces las posturas — el dolor es una señal, no un objetivo', 'La constancia importa más que la intensidad: 20 min diarios supera 90 min una vez/semana', 'Yoga y pilates son complementarios, no rivales — combínalos si puedes', 'El yoga online de calidad es excelente y gratuito en YouTube'],
  },
  'entrenamiento-casa': {
    icono: '🏠',
    nombre: 'Entrenamiento en Casa',
    perfil: 'Sin desplazamiento · Flexible · Económico',
    descripcion: 'El entrenamiento en casa ha ganado enorme popularidad. Con el peso corporal o mínimo equipamiento puedes conseguir resultados excelentes. La clave está en la planificación y la constancia.',
    frecuencia: '4-5 días/semana, sesiones de 20-45 min',
    inicio: 'Elige un programa estructurado (app, YouTube, entrenador online)',
    coste: 'Gratis o mínimo — opcional invertir en mancuernas o bandas elásticas',
    beneficios: ['Sin desplazamiento ni cuota de instalación', 'Horario totalmente libre', 'Ideal para empezar sin vergüenza social', 'Muy efectivo con programas bien diseñados', 'Puedes combinar distintos estilos (HIIT, fuerza, yoga...)'],
    equipo: ['Espacio despejado de al menos 2x2 metros', 'Esterilla', 'Opcional: mancuernas ajustables, bandas elásticas, barra de dominadas', 'Dispositivo para seguir el entrenamiento'],
    consejos: ['La autodisciplina es el mayor reto: fija un horario fijo como si fuera una cita', 'Sigue programas estructurados, no hagas ejercicios al azar', 'El HIIT de 20-30 min puede ser tan efectivo como 1h en el gym', 'La ventilación del espacio importa: evita sitios cerrados y sin aire'],
  },
};

// ─────────────────────────────────────────────
// Lógica de resultado
// ─────────────────────────────────────────────

function calcularResultado(respuestas: Record<string, string>): ResultadoCalculado {
  const puntos: Record<EjercicioKey, number> = {
    gimnasio: 0, running: 0, natacion: 0, ciclismo: 0, 'yoga-pilates': 0, 'entrenamiento-casa': 0,
  };

  PREGUNTAS.forEach(p => {
    const respuesta = respuestas[p.id];
    const opcion = p.opciones.find(o => o.valor === respuesta);
    if (opcion) {
      (Object.keys(opcion.pesos) as EjercicioKey[]).forEach(ej => {
        puntos[ej] += opcion.pesos[ej];
      });
    }
  });

  const ganador = (Object.entries(puntos) as [EjercicioKey, number][])
    .sort(([, a], [, b]) => b - a)[0][0];

  return { ejercicio: ganador, puntos };
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function SelectorEjercicio() {
  const [pantalla, setPantalla] = useState<Pantalla>('inicio');
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [resultado, setResultado] = useState<ResultadoCalculado | null>(null);

  const totalPreguntas = PREGUNTAS.length;
  const preguntaActual = PREGUNTAS[paso];
  const progreso = (paso / totalPreguntas) * 100;

  function seleccionarOpcion(valor: string) {
    setRespuestas(prev => ({ ...prev, [preguntaActual.id]: valor }));
  }

  function avanzar() {
    if (paso < totalPreguntas - 1) {
      setPaso(p => p + 1);
    } else {
      const res = calcularResultado(respuestas);
      setResultado(res);
      setPantalla('resultado');
    }
  }

  function retroceder() {
    if (paso > 0) setPaso(p => p - 1);
  }

  function reiniciar() {
    setPantalla('inicio');
    setPaso(0);
    setRespuestas({});
    setResultado(null);
  }

  const ejercicioActual = resultado ? EJERCICIOS[resultado.ejercicio] : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {pantalla !== 'resultado' ? (
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}>¿Qué ejercicio te conviene?</h1>
          <p className={styles.heroSubtitle}>
            {pantalla === 'inicio'
              ? 'Encuentra el deporte que encaja con tu cuerpo, tiempo y motivación'
              : `Pregunta ${paso + 1} de ${totalPreguntas} · ${preguntaActual.categoria}`}
          </p>
        </header>
      ) : (
        <header className={styles.heroResultados}>
          <h1 className={styles.heroTitleSm}>Tu ejercicio recomendado</h1>
          <p className={styles.heroSubtitleSm}>{ejercicioActual?.nombre ?? ''}</p>
        </header>
      )}

      <LegalNotice />

      {/* ── Pantalla de inicio ── */}
      {pantalla === 'inicio' && (
        <div className={styles.introContainer}>
          <div className={styles.introCard}>
            <div className={styles.introIconGrid} aria-hidden="true">
              <span className={styles.introIcon}>🏃</span>
              <span className={styles.introIcon}>🏋️</span>
              <span className={styles.introIcon}>🏊</span>
              <span className={styles.introIcon}>🚴</span>
            </div>
            <h2 className={styles.introTitulo}>Encuentra tu deporte ideal</h2>
            <p className={styles.introDesc}>
              El que encaja con tu cuerpo, tu tiempo y tu motivación. Este test analiza tus objetivos,
              disponibilidad, condición física y presupuesto para orientarte hacia el ejercicio
              que puedas mantener a largo plazo, no solo el que suena bien en teoría.
            </p>
            <ul className={styles.introFeatures} aria-label="Qué obtendrás">
              <li><span aria-hidden="true">✅</span> Tipo de ejercicio recomendado con perfil concreto</li>
              <li><span aria-hidden="true">✅</span> Frecuencia, coste y cómo empezar</li>
              <li><span aria-hidden="true">✅</span> Beneficios clave y equipamiento necesario</li>
              <li><span aria-hidden="true">✅</span> Consejos prácticos para mantener la constancia</li>
            </ul>
            <button type="button" className={styles.btnStart} onClick={() => setPantalla('test')}>
              Empezar el test →
            </button>
          </div>
        </div>
      )}

      {/* ── Pantalla de test ── */}
      {pantalla === 'test' && (
        <div className={styles.testContainer}>
          <div className={styles.progresoWrap}>
            <div className={styles.progresoInfo}>
              <span className={styles.progresoPaso}>Pregunta {paso + 1} de {totalPreguntas}</span>
              <span className={styles.progresoCategoria}>{preguntaActual.categoria}</span>
            </div>
            <div
              className={styles.progresoBar}
              role="progressbar"
              aria-label={`Progreso del test: pregunta ${paso + 1} de ${totalPreguntas}`}
              aria-valuenow={paso + 1}
              aria-valuemin={1}
              aria-valuemax={totalPreguntas}
            >
              <div className={styles.progresoRelleno} style={{ width: `${progreso}%` }} />
            </div>
          </div>

          <div className={styles.preguntaCard}>
            <span className={styles.preguntaIcon} aria-hidden="true">{preguntaActual.icono}</span>
            <h2 className={styles.preguntaTexto}>{preguntaActual.texto}</h2>
            <div className={styles.opcionesGrid} role="radiogroup" aria-label={preguntaActual.texto}>
              {preguntaActual.opciones.map(op => (
                <button
                  key={op.valor}
                  type="button"
                  className={`${styles.opcionBtn} ${respuestas[preguntaActual.id] === op.valor ? styles.opcionSeleccionada : ''}`}
                  onClick={() => seleccionarOpcion(op.valor)}
                  aria-pressed={respuestas[preguntaActual.id] === op.valor ? true : false}
                >
                  <span className={styles.opcionEtiqueta}>{op.etiqueta}</span>
                  <span className={styles.opcionDesc}>{op.descripcion}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.navegacion}>
            <button
              type="button"
              className={styles.btnAnterior}
              onClick={retroceder}
              disabled={paso === 0}
              aria-label="Pregunta anterior"
            >
              ← Anterior
            </button>
            <button
              type="button"
              className={styles.btnSiguiente}
              onClick={avanzar}
              disabled={!respuestas[preguntaActual.id]}
              aria-label={paso === totalPreguntas - 1 ? 'Ver resultado' : 'Siguiente pregunta'}
            >
              {paso === totalPreguntas - 1 ? 'Ver resultado →' : 'Siguiente →'}
            </button>
          </div>
        </div>
      )}

      {/* ── Pantalla de resultado ── */}
      {pantalla === 'resultado' && resultado && ejercicioActual && (
        <div className={styles.resultadosContainer}>

          {/* Tarjeta principal */}
          <div className={styles.recomendacionCard}>
            <span className={styles.recomendacionIcon} aria-hidden="true">{ejercicioActual.icono}</span>
            <p className={styles.recomendacionLabel}>Tu ejercicio recomendado</p>
            <p className={styles.recomendacionValor}>{ejercicioActual.nombre}</p>
            <p className={styles.recomendacionPerfil}>{ejercicioActual.perfil}</p>
            <p className={styles.recomendacionDesc}>{ejercicioActual.descripcion}</p>
          </div>

          {/* Stats grid: frecuencia, inicio, coste */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Frecuencia</p>
              <p className={styles.statValor}>{ejercicioActual.frecuencia}</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Cómo empezar</p>
              <p className={styles.statValor}>{ejercicioActual.inicio}</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Coste estimado</p>
              <p className={styles.statValor}>{ejercicioActual.coste}</p>
            </div>
          </div>

          {/* Sección de beneficios */}
          <div className={styles.beneficiosSection}>
            <p className={styles.beneficiosTitulo}>Beneficios clave</p>
            {ejercicioActual.beneficios.map((b, i) => (
              <p key={i} className={styles.beneficioItem}>{b}</p>
            ))}
          </div>

          {/* Sección de equipamiento */}
          <div className={styles.equipoSection}>
            <p className={styles.equipoTitulo}>Equipamiento necesario</p>
            {ejercicioActual.equipo.map((e, i) => (
              <p key={i} className={styles.equipoItem}>{e}</p>
            ))}
          </div>

          {/* Sección de consejos */}
          <div className={styles.consejosSection}>
            <p className={styles.consejosTitulo}>Consejos para empezar bien</p>
            {ejercicioActual.consejos.map((c, i) => (
              <p key={i} className={styles.consejoItem}>{c}</p>
            ))}
          </div>

          <button type="button" className={styles.btnRepetir} onClick={reiniciar} aria-label="Repetir el test">
            ← Repetir el test
          </button>

          {/* Aviso legal orientativo */}
          <div className={styles.warningBox}>
            Esta herramienta es orientativa. Si tienes condiciones de salud, lesiones previas o llevas tiempo
            sin hacer ejercicio, consulta con un médico o fisioterapeuta antes de iniciar cualquier programa deportivo.
          </div>

          {/* Sección educativa v2.0 */}
          <EducationalSection
            title="Guía completa: ejercicio físico para adultos en España"
            subtitle="Beneficios, hábito deportivo, constancia y cuándo consultar con un profesional"
            defaultOpen={false}
          >
            <h3>Beneficios del ejercicio regular para la salud</h3>
            <p>
              La actividad física regular reduce significativamente el riesgo de enfermedades cardiovasculares,
              diabetes tipo 2, obesidad, ciertos tipos de cáncer y problemas de salud mental. La OMS recomienda
              al menos 150-300 minutos de actividad moderada a la semana para adultos. No es necesario llegar
              al rendimiento de un atleta: cualquier movimiento regular aporta beneficios demostrados.
            </p>

            <h3>Cómo crear el hábito deportivo</h3>
            <p>
              El mayor obstáculo no es la falta de tiempo ni de dinero: es la formación del hábito. Las investigaciones
              sobre cambio de comportamiento señalan que un hábito deportivo se consolida en 60-90 días de práctica
              regular, no en 21 días como se creía. La clave es el encadenamiento: vincular el ejercicio a algo que
              ya haces automáticamente (después de despertarte, antes de ducharte, al volver del trabajo).
            </p>
            <p>
              Empieza con sesiones más cortas de lo que crees necesario. Es mejor entrenar 15 minutos todos los días
              que planificar 1 hora y no presentarte. El objetivo en los primeros 3 meses es instalar el hábito, no
              obtener el máximo rendimiento.
            </p>

            <h3>Por qué la constancia importa más que la intensidad</h3>
            <p>
              El cuerpo humano responde mucho mejor a estímulos regulares y moderados que a esfuerzos esporádicos
              y extremos. Entrenar al 70% de tu capacidad cinco días a la semana produce adaptaciones fisiológicas
              superiores a entrenar al 100% una vez por semana. Además, la sobreexigencia al inicio es la principal
              causa de abandono y lesión.
            </p>
            <p>
              El descanso forma parte del entrenamiento: es durante la recuperación cuando el músculo crece y el
              sistema cardiovascular se adapta. Respetar los días de descanso no es pereza, es entrenamiento inteligente.
            </p>

            <h3>Combinaciones de ejercicio recomendadas</h3>
            <p>
              Los profesionales de la salud recomiendan combinar tres tipos de actividad: ejercicio cardiovascular
              (mejora corazón y resistencia), entrenamiento de fuerza (masa muscular y metabolismo basal) y
              trabajo de flexibilidad/movilidad (prevención de lesiones y calidad de vida). No es necesario
              practicar tres deportes distintos: muchas actividades cubren varios aspectos a la vez, como la
              natación o el entrenamiento funcional.
            </p>
            <p>
              Una combinación práctica para la mayoría de adultos: 2-3 sesiones de cardio + 2 sesiones de fuerza
              + estiramientos al acabar cada sesión. Esto cabe en 4-5 horas semanales y cubre prácticamente todas
              las recomendaciones de salud.
            </p>

            <h3>Cuándo consultar con un médico antes de empezar</h3>
            <div className={styles.warningBox}>
              <strong>Consulta con un médico antes de iniciar ejercicio si:</strong> llevas más de 2 años
              sin actividad física regular, tienes más de 45 años y no has hecho ejercicio recientemente,
              tienes diagnóstico de hipertensión, diabetes, problemas cardíacos o articulares, has sufrido
              una lesión en el último año, o sientes dolores en el pecho, mareos o falta de aliento durante
              actividades cotidianas.
            </div>
            <p>
              Un médico puede indicarte qué tipos de ejercicio son adecuados para tu situación, establecer
              límites de frecuencia cardíaca y derivarte a un fisioterapeuta o preparador físico especializado
              si lo necesitas. Esta inversión inicial previene lesiones graves y te permite progresar con seguridad.
            </p>
          </EducationalSection>

          <ShareCard appName="selector-ejercicio" />
          <RelatedApps apps={getRelatedApps('selector-ejercicio')} />
        </div>
      )}

      <Footer appName="selector-ejercicio" />
    </div>
  );
}
