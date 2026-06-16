'use client';

import React, { useState } from 'react';
import styles from './SelectorMascota.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard, DisclaimerCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type MascotaKey = 'perro-pequeno' | 'perro-mediano' | 'perro-grande' | 'gato' | 'roedor' | 'pez' | 'pajaro' | 'reptil';

interface Opcion { valor: string; etiqueta: string; desc: string; }
interface Pregunta { id: number; categoria: string; pregunta: string; icon: string; opciones: Opcion[]; }

interface MascotaInfo {
  nombre: string;
  perfil: string;
  icon: string;
  costeInicial: string;
  costeMensual: string;
  esperanzaVida: string;
  descripcion: string;
  pros: string[];
  contras: string[];
}

interface Resultado {
  mascota: MascotaKey;
  razones: string[];
  consejos: string[];
}

// ─────────────────────────────────────────────
// Datos de mascotas
// ─────────────────────────────────────────────

const MASCOTAS: Record<MascotaKey, MascotaInfo> = {
  'perro-pequeno': {
    nombre: 'Perro pequeño',
    perfil: 'Razas toy o miniatura (Chihuahua, Yorkshire, Bichón…)',
    icon: '🐕',
    costeInicial: '500 – 2.000 €',
    costeMensual: '80 – 150 €',
    esperanzaVida: '12 – 18 años',
    descripcion: 'Compañero muy afectivo y adaptable a espacios pequeños. Necesita paseos diarios aunque cortos. Muy longevo comparado con razas grandes.',
    pros: ['Adaptado a piso sin jardín', 'Muy longevo (hasta 18 años)', 'Fácil de transportar', 'Poco consumo de comida'],
    contras: ['Necesita paseos diarios', 'Muy dependiente del dueño', 'Veterinario y peluquería regulares', 'Puede ser más nervioso/ladrador'],
  },
  'perro-mediano': {
    nombre: 'Perro mediano',
    perfil: 'Spaniel, Beagle, Border Collie, mestizos…',
    icon: '🐶',
    costeInicial: '300 – 1.500 €',
    costeMensual: '100 – 200 €',
    esperanzaVida: '10 – 14 años',
    descripcion: 'El equilibrio entre compañía, ejercicio y espacio. Versátil para ciudad y campo. Ideal para familias activas.',
    pros: ['Muy versátil', 'Ideal para familias con niños', 'Gran variedad de carácter', 'Adopción muy disponible'],
    contras: ['Requiere ejercicio diario (30-60 min)', 'No apto para ausencias largas', 'Coste veterinario relevante', 'Necesita adiestramiento básico'],
  },
  'perro-grande': {
    nombre: 'Perro grande',
    perfil: 'Labrador, Pastor Alemán, Golden, Mastín…',
    icon: '🦮',
    costeInicial: '400 – 2.000 €',
    costeMensual: '150 – 280 €',
    esperanzaVida: '8 – 12 años',
    descripcion: 'Compañero fiel y protector. Requiere espacio, ejercicio abundante y compromiso económico mayor. Ideal con jardín o acceso fácil a zonas verdes.',
    pros: ['Fidelidad y vínculo muy profundo', 'Excelente con niños', 'Buen perro guardián', 'Temperamento generalmente tranquilo'],
    contras: ['Necesita mucho espacio y ejercicio', 'Coste alimentación elevado', 'Veterinario más caro', 'Menor esperanza de vida'],
  },
  gato: {
    nombre: 'Gato',
    perfil: 'Europeo común, Siamés, Persa, Maine Coon…',
    icon: '🐱',
    costeInicial: '100 – 1.500 €',
    costeMensual: '50 – 120 €',
    esperanzaVida: '12 – 20 años',
    descripcion: 'Independiente pero afectivo en sus propios términos. No necesita paseos, tolera bien las ausencias de un día. Ideal para personas con ritmo de vida ocupado.',
    pros: ['Muy independiente', 'Sin paseos obligatorios', 'Coste mensual moderado', 'Longevo y adaptable a piso'],
    contras: ['Puede ser difícil de "entrenar"', 'Pelo y alergias frecuentes', 'Arañazos en muebles', 'Necesita bandeja de arena limpia'],
  },
  roedor: {
    nombre: 'Roedor',
    perfil: 'Hámster, cobaya, conejo, chinchilla, rata…',
    icon: '🐹',
    costeInicial: '30 – 150 €',
    costeMensual: '15 – 40 €',
    esperanzaVida: '2 – 10 años (según especie)',
    descripcion: 'Mascotas de bajo coste y mantenimiento limitado. Ideales como primera mascota o para niños. Vida relativamente corta (salvo conejos y chinchillas).',
    pros: ['Coste muy bajo', 'Sin paseos', 'Ocupan poco espacio', 'Buena primera mascota para niños'],
    contras: ['Corta esperanza de vida (excepto conejos)', 'Interacción limitada', 'Activos de noche (hámster)', 'Pérdida puede ser dura para niños pequeños'],
  },
  pez: {
    nombre: 'Peces',
    perfil: 'Goldfish, tropicales, betta, marino…',
    icon: '🐠',
    costeInicial: '50 – 500 €',
    costeMensual: '10 – 30 €',
    esperanzaVida: '1 – 15 años (según especie)',
    descripcion: 'La mascota más silenciosa y de menor interacción. Muy decorativa y relajante. El acuario requiere mantenimiento periódico pero no afecta a la vida diaria.',
    pros: ['Sin ruido ni alérgenos', 'Sin paseos ni atención constante', 'Decorativos y relajantes', 'Compatible con alergias'],
    contras: ['Interacción prácticamente nula', 'Acuario requiere mantenimiento semanal', 'Sensibles a cambios de agua', 'No te reconocen'],
  },
  pajaro: {
    nombre: 'Pájaro',
    perfil: 'Periquito, canario, agapornis, loro…',
    icon: '🦜',
    costeInicial: '30 – 800 €',
    costeMensual: '20 – 60 €',
    esperanzaVida: '5 – 30 años (según especie)',
    descripcion: 'Animados y musicales. Los periquitos y canarios son económicos y relativamente fáciles. Los loros son muy inteligentes pero exigen mucha atención y estimulación.',
    pros: ['Alegran el ambiente con sonidos', 'Bajo coste (periquitos/canarios)', 'Muy longevos (loros)', 'Sin paseos ni jardín'],
    contras: ['Ruido puede ser molesto', 'Plumas y alérgenos en el ambiente', 'Jaula requiere limpieza frecuente', 'Loros necesitan mucha interacción'],
  },
  reptil: {
    nombre: 'Reptil',
    perfil: 'Gecko, tortuga, camaleón, serpiente…',
    icon: '🦎',
    costeInicial: '100 – 600 €',
    costeMensual: '20 – 70 €',
    esperanzaVida: '10 – 50 años (según especie)',
    descripcion: 'Mascotas únicas para perfiles específicos. Requieren instalaciones especiales (terrario, luz UV, temperatura). Muy longevas, especialmente las tortugas.',
    pros: ['Sin alérgenos (piel/pelo)', 'Sin ruido', 'Fascinantes para entusiastas', 'Muy longevos (tortugas)'],
    contras: ['Interacción muy limitada', 'Instalación cara y específica', 'Alimentación viva en algunos casos', 'Nicho, no apto para todos'],
  },
};

// ─────────────────────────────────────────────
// Preguntas del test (10)
// ─────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  {
    id: 1, categoria: 'Tu vida diaria', pregunta: '¿Cuánto tiempo libre tienes para dedicar a una mascota?', icon: '⏰',
    opciones: [
      { valor: 'mucho', etiqueta: 'Mucho — más de 2 h al día', desc: 'Trabajo desde casa o tengo horario flexible' },
      { valor: 'medio', etiqueta: 'Bastante — 1-2 h al día', desc: 'Jornada laboral estándar pero organizada' },
      { valor: 'poco', etiqueta: 'Poco — menos de 1 h al día', desc: 'Muy ocupado, viajes frecuentes' },
      { valor: 'minimo', etiqueta: 'Mínimo — solo fines de semana', desc: 'Apenas tengo tiempo entre semana' },
    ],
  },
  {
    id: 2, categoria: 'Tu vida diaria', pregunta: '¿Cuántas horas al día está la casa vacía habitualmente?', icon: '🏠',
    opciones: [
      { valor: 'siempre', etiqueta: 'Casi nunca está vacía', desc: 'Siempre hay alguien en casa' },
      { valor: 'pocas', etiqueta: '3 – 5 horas', desc: 'Salgo a trabajar y vuelvo pronto' },
      { valor: 'muchas', etiqueta: '6 – 10 horas', desc: 'Jornada laboral completa fuera' },
      { valor: 'viajes', etiqueta: 'Varios días seguidos', desc: 'Viajes de trabajo frecuentes' },
    ],
  },
  {
    id: 3, categoria: 'Tu vivienda', pregunta: '¿Qué espacio tienes en casa?', icon: '🏡',
    opciones: [
      { valor: 'jardin', etiqueta: 'Casa con jardín o patio', desc: 'Espacio exterior propio' },
      { valor: 'piso_grande', etiqueta: 'Piso amplio (más de 80 m²)', desc: 'Espacio interior generoso' },
      { valor: 'piso_normal', etiqueta: 'Piso normal (50-80 m²)', desc: 'Espacio suficiente pero limitado' },
      { valor: 'piso_pequeno', etiqueta: 'Piso pequeño (menos de 50 m²)', desc: 'Estudio o piso muy compacto' },
    ],
  },
  {
    id: 4, categoria: 'Tu vida diaria', pregunta: '¿Cuánto ejercicio y actividad al aire libre haces tú?', icon: '🏃',
    opciones: [
      { valor: 'mucho', etiqueta: 'Muy activo — salgo a correr o al campo', desc: 'Me encanta el exterior y el deporte' },
      { valor: 'medio', etiqueta: 'Moderado — paseos habituales', desc: 'Camino bastante pero sin deportes intensos' },
      { valor: 'poco', etiqueta: 'Sedentario — prefiero estar en casa', desc: 'No me apetece salir más de lo necesario' },
    ],
  },
  {
    id: 5, categoria: 'Tu situación', pregunta: '¿Hay niños menores de 12 años en casa?', icon: '👶',
    opciones: [
      { valor: 'si_pequenos', etiqueta: 'Sí, menores de 5 años', desc: 'Bebés o niños muy pequeños' },
      { valor: 'si_mayores', etiqueta: 'Sí, de 5 a 12 años', desc: 'Niños que pueden participar en el cuidado' },
      { valor: 'no', etiqueta: 'No, solo adultos', desc: 'Sin niños en el hogar' },
      { valor: 'adolescentes', etiqueta: 'Sí, adolescentes', desc: 'Mayores de 12 años' },
    ],
  },
  {
    id: 6, categoria: 'Tu situación', pregunta: '¿Hay alguna alergia o restricción en casa?', icon: '🤧',
    opciones: [
      { valor: 'alergia_pelo', etiqueta: 'Alergia al pelo animal', desc: 'Alguien en casa tiene alergia confirmada' },
      { valor: 'comunidad', etiqueta: 'La comunidad restringe ciertas mascotas', desc: 'Normas del edificio o alquiler con límites' },
      { valor: 'sin_ruido', etiqueta: 'Necesidad de silencio (trabajo en casa, bebé…)', desc: 'El ruido es un problema importante' },
      { valor: 'ninguna', etiqueta: 'Sin restricciones', desc: 'Total libertad para elegir' },
    ],
  },
  {
    id: 7, categoria: 'Tus expectativas', pregunta: '¿Qué tipo de vínculo buscas con tu mascota?', icon: '❤️',
    opciones: [
      { valor: 'compania', etiqueta: 'Compañía constante y afecto', desc: 'Quiero que siempre esté cerca de mí' },
      { valor: 'juego', etiqueta: 'Juego e interacción activa', desc: 'Me gusta jugar y entrenar a mi mascota' },
      { valor: 'tranquilidad', etiqueta: 'Presencia tranquila y relajante', desc: 'Quiero una mascota sin mucha demanda' },
      { valor: 'novedad', etiqueta: 'Algo diferente y fascinante', desc: 'Me interesan las mascotas poco convencionales' },
    ],
  },
  {
    id: 8, categoria: 'Tus expectativas', pregunta: '¿Cuánto tiempo planeas tener esta mascota?', icon: '📅',
    opciones: [
      { valor: 'largo', etiqueta: 'Para toda la vida', desc: 'Quiero un compromiso a largo plazo (10-20 años)' },
      { valor: 'medio', etiqueta: 'Varios años con posibilidad de cambio', desc: 'Situación vital puede cambiar' },
      { valor: 'corto', etiqueta: 'Quiero algo de ciclo de vida más corto', desc: 'Prefiero no compromisos muy largos' },
    ],
  },
  {
    id: 9, categoria: 'Tu presupuesto', pregunta: '¿Cuánto puedes invertir en la adquisición inicial?', icon: '💶',
    opciones: [
      { valor: 'minimo', etiqueta: 'Lo mínimo (adopción gratuita o muy barata)', desc: 'Prefiero adoptar sin coste' },
      { valor: 'bajo', etiqueta: 'Hasta 300 €', desc: 'Presupuesto ajustado' },
      { valor: 'medio', etiqueta: '300 – 1.000 €', desc: 'Inversión moderada' },
      { valor: 'alto', etiqueta: 'Sin límite especial', desc: 'El coste inicial no es un freno' },
    ],
  },
  {
    id: 10, categoria: 'Tu presupuesto', pregunta: '¿Cuánto puedes gastar mensualmente en el mantenimiento?', icon: '📊',
    opciones: [
      { valor: 'muy_bajo', etiqueta: 'Menos de 30 €/mes', desc: 'Presupuesto muy ajustado' },
      { valor: 'bajo', etiqueta: '30 – 80 €/mes', desc: 'Gasto moderado' },
      { valor: 'medio', etiqueta: '80 – 180 €/mes', desc: 'Dispuesto a invertir en su bienestar' },
      { valor: 'alto', etiqueta: 'Más de 180 €/mes', desc: 'El bienestar es la prioridad' },
    ],
  },
];

// ─────────────────────────────────────────────
// Lógica de recomendación
// ─────────────────────────────────────────────

function calcularResultado(r: Record<number, string>): Resultado {
  const razones: string[] = [];
  const consejos: string[] = [];

  // Puntos por mascota
  const p: Record<MascotaKey, number> = {
    'perro-pequeno': 0, 'perro-mediano': 0, 'perro-grande': 0,
    gato: 0, roedor: 0, pez: 0, pajaro: 0, reptil: 0,
  };

  // Tiempo disponible
  if (r[1] === 'mucho') { p['perro-mediano'] += 3; p['perro-grande'] += 3; p['perro-pequeno'] += 2; p.gato += 1; }
  if (r[1] === 'medio') { p['perro-pequeno'] += 2; p.gato += 3; p['perro-mediano'] += 1; }
  if (r[1] === 'poco') { p.gato += 3; p.pez += 2; p.pajaro += 1; }
  if (r[1] === 'minimo') { p.pez += 3; p.reptil += 2; p.roedor += 1; }

  // Horas solo
  if (r[2] === 'siempre') { p['perro-grande'] += 2; p['perro-mediano'] += 2; }
  if (r[2] === 'pocas') { p['perro-pequeno'] += 1; p.gato += 1; }
  if (r[2] === 'muchas') { p.gato += 3; p.pez += 2; p.pajaro += 1; }
  if (r[2] === 'viajes') { p.pez += 3; p.reptil += 2; p.roedor += 1; p.gato -= 1; }

  // Espacio
  if (r[3] === 'jardin') { p['perro-grande'] += 3; p['perro-mediano'] += 2; }
  if (r[3] === 'piso_grande') { p['perro-mediano'] += 2; p['perro-pequeno'] += 1; p.gato += 2; }
  if (r[3] === 'piso_normal') { p['perro-pequeno'] += 2; p.gato += 2; }
  if (r[3] === 'piso_pequeno') { p.gato += 3; p.pez += 2; p.roedor += 2; p.pajaro += 1; }

  // Actividad física
  if (r[4] === 'mucho') { p['perro-grande'] += 2; p['perro-mediano'] += 2; }
  if (r[4] === 'medio') { p['perro-mediano'] += 1; p['perro-pequeno'] += 1; }
  if (r[4] === 'poco') { p.gato += 2; p.pez += 2; p.reptil += 1; }

  // Niños
  if (r[5] === 'si_pequenos') { p['perro-mediano'] += 1; p.roedor -= 1; p.reptil -= 2; }
  if (r[5] === 'si_mayores') { p['perro-mediano'] += 2; p.gato += 1; p.roedor += 1; }
  if (r[5] === 'adolescentes') { p['perro-mediano'] += 1; p.gato += 1; }

  // Alergias / restricciones
  if (r[6] === 'alergia_pelo') { p.pez += 4; p.reptil += 3; p.pajaro += 1; p.gato -= 3; p['perro-pequeno'] -= 3; p['perro-mediano'] -= 3; p['perro-grande'] -= 3; }
  if (r[6] === 'sin_ruido') { p.pez += 3; p.reptil += 2; p.gato += 1; p.pajaro -= 2; p['perro-pequeno'] -= 1; }
  if (r[6] === 'comunidad') { p.pez += 2; p.roedor += 1; p.gato += 1; p['perro-grande'] -= 2; }

  // Vínculo buscado
  if (r[7] === 'compania') { p['perro-pequeno'] += 2; p['perro-mediano'] += 2; p.gato += 1; }
  if (r[7] === 'juego') { p['perro-mediano'] += 2; p.gato += 1; p.roedor += 1; }
  if (r[7] === 'tranquilidad') { p.pez += 2; p.gato += 2; p.reptil += 1; }
  if (r[7] === 'novedad') { p.reptil += 3; p.pajaro += 2; }

  // Duración compromiso
  if (r[8] === 'largo') { p['perro-pequeno'] += 1; p.gato += 2; p.reptil += 1; }
  if (r[8] === 'corto') { p.roedor += 3; p.pez += 1; }

  // Presupuesto inicial
  if (r[9] === 'minimo') { p.gato += 2; p['perro-mediano'] += 1; p.roedor += 2; }
  if (r[9] === 'muy_bajo' || r[9] === 'bajo') { p.roedor += 1; p.pez += 1; p['perro-grande'] -= 1; }

  // Presupuesto mensual
  if (r[10] === 'muy_bajo') { p.pez += 3; p.roedor += 2; p.pajaro += 1; p['perro-grande'] -= 3; p['perro-mediano'] -= 1; }
  if (r[10] === 'bajo') { p.gato += 1; p.pajaro += 1; p['perro-pequeno'] += 1; p['perro-grande'] -= 2; }
  if (r[10] === 'alto') { p['perro-grande'] += 2; p['perro-mediano'] += 1; }

  // Determinar ganadora
  const sorted = (Object.entries(p) as [MascotaKey, number][]).sort((a, b) => b[1] - a[1]);
  const mascota = sorted[0][0];

  // Razones
  const info = MASCOTAS[mascota];
  if (mascota === 'gato') {
    razones.push('El gato encaja perfectamente con un estilo de vida ocupado: es independiente, no necesita paseos y tolera bien las ausencias.');
    if (r[3] === 'piso_pequeno' || r[3] === 'piso_normal') razones.push('Tu espacio es ideal para un gato: se adaptan perfectamente a pisos sin necesitar jardín.');
  }
  if (mascota === 'perro-pequeno' || mascota === 'perro-mediano' || mascota === 'perro-grande') {
    razones.push('Tu perfil activo y el tiempo que puedes dedicarle hace del perro tu mascota natural.');
    if (r[5] === 'si_mayores') razones.push('Con niños de 5 a 12 años, un perro es una elección excelente: fomenta la responsabilidad y el vínculo emocional.');
  }
  if (mascota === 'pez') {
    razones.push('Dado tu ritmo de vida y las restricciones existentes, los peces son la opción más compatible: sin alérgenos, sin ruido y sin paseos.');
  }
  if (mascota === 'roedor') {
    razones.push('Para tu presupuesto y disponibilidad, un roedor es la mascota más práctica: bajo coste, sin paseos y cuidados sencillos.');
  }
  if (mascota === 'reptil') {
    razones.push('Tu interés por algo diferente y las restricciones de alérgenos apuntan a un reptil: fascinantes, silenciosos y sin pelo.');
  }
  if (mascota === 'pajaro') {
    razones.push('Un pájaro aporta alegría y compañía sin necesidad de paseos ni espacio extra, encajando bien con tu situación.');
  }
  razones.push(`Coste mensual estimado para ${info.nombre}: ${info.costeMensual}. Esperanza de vida: ${info.esperanzaVida}.`);

  // Consejos
  consejos.push('🏥 Antes de decidir, visita una protectora o refugio: adoptar es más económico y salvas una vida.');
  if (mascota === 'perro-pequeno' || mascota === 'perro-mediano' || mascota === 'perro-grande') {
    consejos.push('💉 Presupuesta seguro de salud para mascotas: una operación puede costar entre 500 y 3.000 €. Hay seguros desde 15 €/mes.');
    consejos.push('📋 Chip, vacunas, esterilización y licencia PPP (si aplica) son gastos obligatorios los primeros meses.');
  }
  if (mascota === 'gato') {
    consejos.push('✂️ La esterilización reduce problemas de salud y comportamiento: entre 100 y 250 € dependiendo del sexo y la clínica.');
  }
  consejos.push('⏳ Una mascota es un compromiso de años. Asegúrate de tener plan B para vacaciones, enfermedad o cambios de vida.');

  return { mascota, razones, consejos };
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

type Pantalla = 'intro' | 'test' | 'resultado';

export default function SelectorMascota() {
  const [pantalla, setPantalla] = useState<Pantalla>('intro');
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const preguntaActual = PREGUNTAS[paso];
  const totalPreguntas = PREGUNTAS.length;
  const progreso = (paso / totalPreguntas) * 100;

  function seleccionarOpcion(valor: string) { setRespuestas(prev => ({ ...prev, [preguntaActual.id]: valor })); }
  function avanzar() {
    if (paso < totalPreguntas - 1) { setPaso(p => p + 1); }
    else { setResultado(calcularResultado(respuestas)); setPantalla('resultado'); }
  }
  function retroceder() { if (paso > 0) setPaso(p => p - 1); }
  function reiniciar() { setPantalla('intro'); setPaso(0); setRespuestas({}); setResultado(null); }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {pantalla !== 'resultado' ? (
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}><span aria-hidden="true">🐾</span> Asesor de Mascota</h1>
          <p className={styles.heroSubtitle}>
            {pantalla === 'intro' ? '10 preguntas para saber qué mascota se adapta a tu vida real'
              : `Pregunta ${paso + 1} de ${totalPreguntas} · ${preguntaActual.categoria}`}
          </p>
        </header>
      ) : (
        <header className={styles.heroResultados}>
          <h1 className={styles.heroTitleSm}>Tu mascota ideal</h1>
          <p className={styles.heroSubtitleSm}>Resultado personalizado basado en tu estilo de vida</p>
        </header>
      )}

      <LegalNotice />
      <DisclaimerCard variant="general" severity="high" />

      {pantalla === 'intro' && (
        <div className={styles.introContainer}>
          <div className={styles.introCard}>
            <div className={styles.introIconGrid} aria-hidden="true">
              <span className={styles.introIcon}>🐕</span>
              <span className={styles.introIcon}>🐱</span>
              <span className={styles.introIcon}>🐹</span>
              <span className={styles.introIcon}>🐠</span>
            </div>
            <h2 className={styles.introTitulo}>¿Perro, gato, o algo diferente?</h2>
            <p className={styles.introDesc}>
              Elegir una mascota es un compromiso de años que afecta a tu día a día, tu economía y tu espacio.
              Este test analiza tu estilo de vida real — no el que te gustaría tener — para orientarte hacia
              la mascota que mejor encaja contigo sin romanticismos.
            </p>
            <ul className={styles.introFeatures} aria-label="Qué obtendrás">
              <li><span aria-hidden="true">✅</span> Tipo de mascota recomendada con perfil concreto</li>
              <li><span aria-hidden="true">✅</span> Coste inicial y mensual orientativo</li>
              <li><span aria-hidden="true">✅</span> Pros y contras adaptados a tu situación</li>
              <li><span aria-hidden="true">✅</span> Consejos antes de adoptar o comprar</li>
              <li><span aria-hidden="true">✅</span> Sin juicios, solo tu realidad</li>
            </ul>
            <button type="button" className={styles.btnStart} onClick={() => setPantalla('test')}>
              Empezar el test →
            </button>
          </div>
        </div>
      )}

      {pantalla === 'test' && (
        <div className={styles.testContainer}>
          <div className={styles.progresoWrap}>
            <div className={styles.progresoInfo}>
              <span className={styles.progresoPaso}>Pregunta {paso + 1} de {totalPreguntas}</span>
              <span className={styles.progresoCategoria}>{preguntaActual.categoria}</span>
            </div>
            <div className={styles.progresoBar} role="progressbar" aria-label={`Pregunta ${paso + 1} de ${totalPreguntas}`} aria-valuenow={paso + 1} aria-valuemin={1} aria-valuemax={totalPreguntas}>
              <div className={styles.progresoRelleno} style={{ width: `${progreso}%` }} />
            </div>
          </div>
          <div className={styles.preguntaCard}>
            <span className={styles.preguntaIcon} aria-hidden="true">{preguntaActual.icon}</span>
            <h2 className={styles.preguntaTexto}>{preguntaActual.pregunta}</h2>
            <div className={styles.opcionesGrid} role="radiogroup" aria-label={preguntaActual.pregunta}>
              {preguntaActual.opciones.map(op => (
                <button key={op.valor} type="button"
                  className={`${styles.opcionBtn} ${respuestas[preguntaActual.id] === op.valor ? styles.opcionSeleccionada : ''}`}
                  onClick={() => seleccionarOpcion(op.valor)}
                  aria-pressed={respuestas[preguntaActual.id] === op.valor ? true : false}
                >
                  <span className={styles.opcionEtiqueta}>{op.etiqueta}</span>
                  <span className={styles.opcionDesc}>{op.desc}</span>
                </button>
              ))}
            </div>
          </div>
          <div className={styles.navegacion}>
            <button type="button" className={styles.btnAnterior} onClick={retroceder} disabled={paso === 0} aria-label="Pregunta anterior">← Anterior</button>
            <button type="button" className={styles.btnSiguiente} onClick={avanzar} disabled={!respuestas[preguntaActual.id]} aria-label={paso === totalPreguntas - 1 ? 'Ver resultado' : 'Siguiente pregunta'}>
              {paso === totalPreguntas - 1 ? 'Ver resultado →' : 'Siguiente →'}
            </button>
          </div>
        </div>
      )}

      {pantalla === 'resultado' && resultado && (
        <div className={styles.resultadosContainer}>
          <div className={styles.recomendacionCard}>
            <span className={styles.recomendacionIcon} aria-hidden="true">{MASCOTAS[resultado.mascota].icon}</span>
            <p className={styles.recomendacionLabel}>Tu mascota ideal</p>
            <p className={styles.recomendacionValor}>{MASCOTAS[resultado.mascota].nombre}</p>
            <p className={styles.recomendacionPerfil}>{MASCOTAS[resultado.mascota].perfil}</p>
            <p className={styles.recomendacionDesc}>{MASCOTAS[resultado.mascota].descripcion}</p>
          </div>

          <div className={styles.costesGrid}>
            <div className={styles.costeCard}>
              <p className={styles.costeLabel}>Coste inicial</p>
              <p className={styles.costeValor}>{MASCOTAS[resultado.mascota].costeInicial}</p>
            </div>
            <div className={styles.costeCard}>
              <p className={styles.costeLabel}>Coste mensual</p>
              <p className={styles.costeValor}>{MASCOTAS[resultado.mascota].costeMensual}</p>
            </div>
            <div className={styles.costeCard}>
              <p className={styles.costeLabel}>Esperanza de vida</p>
              <p className={styles.costeValor}>{MASCOTAS[resultado.mascota].esperanzaVida}</p>
            </div>
          </div>

          <div className={styles.prosContrasGrid}>
            <div className={styles.prosCard}>
              <p className={styles.prosTitulo}>Puntos a favor</p>
              {MASCOTAS[resultado.mascota].pros.map((p, i) => <p key={i} className={styles.prosItem}>{p}</p>)}
            </div>
            <div className={styles.contrasCard}>
              <p className={styles.contrasTitulo}>A tener en cuenta</p>
              {MASCOTAS[resultado.mascota].contras.map((c, i) => <p key={i} className={styles.contrasItem}>{c}</p>)}
            </div>
          </div>

          <div className={styles.consejosSection}>
            <p className={styles.consejosTitulo}>Antes de decidirte</p>
            {resultado.razones.map((r, i) => <p key={i} className={styles.consejoItem}>{r}</p>)}
            {resultado.consejos.map((c, i) => <p key={i} className={styles.consejoItem}>{c}</p>)}
          </div>

          <button type="button" className={styles.btnRepetir} onClick={reiniciar} aria-label="Repetir el test">← Repetir el test</button>

          <EducationalSection title="Guía completa: elegir mascota en España" subtitle="Costes reales, derechos, obligaciones y consejos prácticos" defaultOpen={false}>
            <h3>El coste real de tener una mascota</h3>
            <p>Muchas personas subestiman el coste de mantener una mascota. Además del coste mensual visible (comida, arena, accesorios), hay gastos ocultos importantes: veterinario de urgencias, vacunas anuales, peluquería, guardería en vacaciones y posibles operaciones.</p>
            <div className={styles.warningBox}>
              <strong>Coste veterinario de urgencia:</strong> una operación de urgencia en un perro o gato puede costar entre 500 y 4.000 € según el problema. Un seguro de salud para mascotas desde ~15-25 €/mes puede evitar una situación económica difícil.
            </div>

            <h3>Adopción vs compra</h3>
            <p>España tiene uno de los índices de abandono animal más altos de Europa. Las protectoras y refugios tienen miles de perros y gatos de todas las edades esperando familia. Adoptar es gratuito o tiene coste mínimo, los animales llegan ya vacunados, desparasitados y a menudo esterilizados, y el proceso incluye un filtro de idoneidad.</p>
            <p>Comprar a un criador registrado tiene sentido si buscas una raza específica por razones concretas (alergias a ciertos pelos, tamaño muy específico, perro de trabajo). Evita siempre los anuncios de particulares sin garantías.</p>

            <h3>Obligaciones legales en España (2023)</h3>
            <p>La Ley de Bienestar Animal (5/2023) establece obligaciones relevantes: esterilización obligatoria de perros y gatos en plazo (salvo reproducción controlada), licencia para razas PPP, chip identificativo obligatorio, inscripción en el Registro de Animales de Compañía de tu comunidad y prohibición del abandono con penas de hasta 18 meses de prisión.</p>

            <h3>Mascotas y alquiler</h3>
            <p>Desde la Ley de Arrendamientos Urbanos reformada, el propietario no puede prohibir mascotas de compañía en contratos nuevos, aunque puede exigir depósito adicional. Consulta siempre tu contrato específico y habla con el propietario antes de adoptar.</p>
          </EducationalSection>
        </div>
      )}

      <RelatedApps apps={getRelatedApps('selector-mascota')} />
      <ShareCard appName="selector-mascota" />
      <Footer appName="selector-mascota" />
    </div>
  );
}
