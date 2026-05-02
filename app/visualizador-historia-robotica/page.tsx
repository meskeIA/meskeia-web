'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaRobotica.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type Categoria =
  | 'concepto'
  | 'industrial'
  | 'ia_simbolica'
  | 'medico'
  | 'espacial'
  | 'servicio'
  | 'drone'
  | 'cobot'
  | 'humanoide'
  | 'ia_moderna';

type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoRobotica {
  id: string;
  nombre: string;
  anioInicio: number;
  anioFin: number;
  categoria: Categoria;
  tipo: string;
  inventores: string[];
  hitos: string[];
  obra: string;
  pregunta: string;
  contexto: string;
  color: string;
}

interface EventoHistorico {
  anio: number;
  evento: string;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const PERIODOS: PeriodoRobotica[] = [
  {
    id: 'robot_concepto',
    nombre: 'El Robot Nace en la Ficción',
    anioInicio: 1920,
    anioFin: 1942,
    categoria: 'concepto',
    tipo: 'Robot de ciencia ficción',
    inventores: ['Karel Čapek', 'Isaac Asimov', 'Fritz Lang'],
    hitos: [
      'Karel Čapek acuña la palabra "robot" (1920)',
      'R.U.R. — Robots Universales Rossum (obra de teatro, 1920)',
      'Metropolis de Fritz Lang — robot Maria (1927)',
      'Asimov publica las Tres Leyes de la Robótica (1942)',
      'El robot como metáfora de la alienación industrial',
    ],
    obra: 'R.U.R. (Robots Universales Rossum) — Karel Čapek (1920): la obra de teatro que inventó la palabra "robot" (del checo "robota" = trabajo forzado)',
    pregunta: '¿Por qué Karel Čapek eligió la palabra "robota" y qué decía esa elección sobre la sociedad industrial de los años 20?',
    contexto:
      'Karel Čapek escribió en 1920 "R.U.R.", una obra sobre robots que se rebelan contra sus creadores. La palabra "robot" viene del checo "robota" (trabajo servil, servidumbre). Fritz Lang llevó el robot a la pantalla en Metropolis (1927): el robot Maria como amenaza para la clase obrera. Isaac Asimov formuló las Tres Leyes de la Robótica en 1942 para resolver el dilema ético que Čapek había planteado.',
    color: '#8B4513',
  },
  {
    id: 'cibernetica',
    nombre: 'Cibernética y Primeros Autómatas',
    anioInicio: 1942,
    anioFin: 1956,
    categoria: 'concepto',
    tipo: 'Autómata cibernético',
    inventores: ['Norbert Wiener', 'Alan Turing', 'William Grey Walter'],
    hitos: [
      'Norbert Wiener publica Cibernética (1948)',
      'Tortugas de Grey Walter — primeros robots con comportamiento emergente (1948)',
      'Alan Turing propone el Test de Turing (1950)',
      'Cerebros electrónicos en la prensa popular',
      'Bases teóricas del control y la comunicación en sistemas',
    ],
    obra: '"Cibernética" de Norbert Wiener (1948) — el libro fundacional de la ciencia del control y la comunicación en máquinas y animales',
    pregunta: '¿Qué tienen en común el cerebro humano y una máquina según Norbert Wiener, y por qué esa idea fue revolucionaria?',
    contexto:
      'Norbert Wiener publicó en 1948 "Cibernética", estableciendo que el comportamiento de máquinas y organismos podía analizarse en términos de control y retroalimentación. William Grey Walter construyó en 1948 las "tortugas" Elsie y Elmer: pequeños robots con comportamiento emergente complejo a partir de reglas simples. Alan Turing propuso en 1950 el test de inteligencia de máquinas. La cibernética sentó las bases teóricas de la robótica moderna.',
    color: '#4A4A4A',
  },
  {
    id: 'unimate',
    nombre: 'Unimate: El Primer Robot Industrial',
    anioInicio: 1954,
    anioFin: 1970,
    categoria: 'industrial',
    tipo: 'Brazo robot industrial',
    inventores: ['George Devol', 'Joseph Engelberger', 'General Motors'],
    hitos: [
      'George Devol patenta el primer robot programable (1954)',
      'Unimate #001 instalado en GM Ewing Township, Nueva Jersey (1961)',
      'Unimate en The Tonight Show de Johnny Carson (1966)',
      'PUMA robot de Unimation (1978)',
      'Japan adopta la robótica industrial masivamente (1969)',
    ],
    obra: 'Unimate #001 en la cadena de montaje de General Motors (1961) — el primer robot industrial del mundo, soldando piezas de carrocería a 450°C',
    pregunta: '¿Por qué Japón adoptó la robótica industrial 15 años antes que Europa y qué consecuencias tuvo para la industria global?',
    contexto:
      'George Devol patentó el "Programmed Article Transfer" en 1954. Con Joe Engelberger fundaron Unimation. El Unimate #001 comenzó a trabajar en GM en 1961: soldaba y transfería piezas calientes de la fundición. Johnny Carson le mostró al mundo en 1966 haciendo golf y bebiendo cerveza. Japón vio el potencial antes que nadie: en 1969 Kawasaki licenció la tecnología. En 1980, Japón tenía más robots que EE.UU. y Europa juntos.',
    color: '#8B6914',
  },
  {
    id: 'ia_simbolica',
    nombre: 'Robótica e IA Simbólica',
    anioInicio: 1966,
    anioFin: 1985,
    categoria: 'ia_simbolica',
    tipo: 'Robot con IA simbólica',
    inventores: ['Victor Scheinman (Stanford Arm)', 'SRI International (Shakey)', 'Hiroshi Makino'],
    hitos: [
      'Stanford Arm — primer robot controlado por computador (1969)',
      'Shakey — primer robot con razonamiento (SRI, 1966-1972)',
      'SCARA robot (1978)',
      'Programas de IA para planificación de movimientos',
      'Visión por computador primitiva',
    ],
    obra: 'Shakey (SRI International, 1966-1972) — el primer robot que razonaba sobre su entorno, planificaba acciones y ejecutaba tareas complejas de forma autónoma',
    pregunta: '¿Por qué Shakey tardó 6 años en completar tareas simples que un humano hace en segundos, y qué nos enseñó sobre la dificultad de la IA?',
    contexto:
      'Shakey fue el primer robot verdaderamente autónomo: usaba cámaras, planificaba rutas y movía cajas en un entorno controlado. Tardaba horas en completar tareas simples. El Stanford Arm (1969) de Victor Scheinman fue el primer manipulador robótico controlado por computador. Estos robots demostraron que la IA era mucho más difícil de lo esperado: la "paradoja de Moravec" (lo fácil para humanos es difícil para máquinas, y viceversa).',
    color: '#2E8B57',
  },
  {
    id: 'robotica_medica',
    nombre: 'Robótica Médica y Quirúrgica',
    anioInicio: 1985,
    anioFin: 2005,
    categoria: 'medico',
    tipo: 'Robot médico y quirúrgico',
    inventores: ['Intuitive Surgical (Da Vinci)', 'ROBODOC', 'NASA Ames'],
    hitos: [
      'PUMA 560 en biopsia cerebral (1985)',
      'ROBODOC — primer robot en cirugía ortopédica (1992)',
      'Da Vinci Surgical System aprobado FDA (2000)',
      'Robot para cirugía laparoscópica',
      'Telemedicina y cirugía a distancia',
    ],
    obra: 'Da Vinci Surgical System (Intuitive Surgical, 2000) — el robot quirúrgico más vendido del mundo: más de 7 millones de operaciones realizadas',
    pregunta: '¿Supera el robot Da Vinci al cirujano humano en precisión, y bajo qué condiciones es mejor o peor?',
    contexto:
      'El PUMA 560 realizó la primera cirugía asistida por robot en 1985 (biopsia cerebral). ROBODOC (1992) hacía cirugías ortopédicas con mayor precisión que el cirujano. El Da Vinci (2000) es el sistema más extendido: brazos con 7 grados de libertad, movimientos escalados y mano estable. Más de 7 millones de operaciones. La cirugía robótica reduce el temblor humano y permite operaciones mínimamente invasivas. Limitación: el robot no tiene retroalimentación táctil.',
    color: '#DC143C',
  },
  {
    id: 'robotica_espacial',
    nombre: 'Robots en el Espacio',
    anioInicio: 1997,
    anioFin: 2015,
    categoria: 'espacial',
    tipo: 'Robot explorador espacial',
    inventores: ['NASA JPL', 'ESA', 'Sojourner', 'Curiosity'],
    hitos: [
      'Sojourner en Marte (1997)',
      'Spirit y Opportunity (2004)',
      'Curiosity Mars Science Laboratory (2012)',
      'Brazo robótico Canadarm en la ISS',
      'Rover Perseverance (2021)',
    ],
    obra: 'Curiosity Mars Science Laboratory (NASA JPL, 2012) — 900 kg, 2,75 metros, analiza rocas, atmósfera y busca condiciones habitables en Marte',
    pregunta: '¿Qué ha aprendido la humanidad sobre ingeniería robótica de los rovers en Marte, donde un fallo implica el fin de la misión?',
    contexto:
      'Sojourner (1997) fue el primer rover en Marte: 11,5 kg, duró 83 días. Spirit y Opportunity (2004) estaban diseñados para 90 días; Opportunity duró 15 años. Curiosity (2012) usa energía nuclear y tiene 10 instrumentos científicos. La NASA ha aprendido que los robots deben ser ultra-fiables (no hay reparaciones en Marte), autónomos (la señal tarda 20 minutos en llegar) y robustos ante temperaturas de -80°C.',
    color: '#FF8C00',
  },
  {
    id: 'robotica_servicio',
    nombre: 'Robots de Servicio y ASIMO',
    anioInicio: 1996,
    anioFin: 2015,
    categoria: 'servicio',
    tipo: 'Robot humanoide de servicio',
    inventores: ['Honda (ASIMO)', 'Sony (AIBO)', 'iRobot (Roomba)'],
    hitos: [
      'AIBO — robot mascota de Sony (1999)',
      'ASIMO de Honda camina escaleras (2000)',
      'Roomba — aspiradora robot (2002)',
      'NAO de Aldebaran Robotics (2006)',
      'Baxter de Rethink Robotics (2012)',
    ],
    obra: 'ASIMO (Honda, 2000) — el robot humanoide más avanzado de su época: camina, sube escaleras, sirve bebidas y reconoce caras',
    pregunta: '¿Por qué Honda invirtió 20 años y miles de millones en ASIMO si nunca fue un producto comercial rentable?',
    contexto:
      'Honda comenzó el proyecto ASIMO en secreto en 1986 para entender la locomoción bípeda. En 2000 presentó ASIMO: podía caminar, subir escaleras y servir bebidas. Sony lanzó AIBO en 1999 (el primer robot mascota de consumo masivo). La Roomba de iRobot (2002) fue el primer robot de hogar de éxito comercial real. ASIMO fue más una declaración de intenciones de Honda que un producto: demostró que los humanoides eran posibles.',
    color: '#4169E1',
  },
  {
    id: 'drones',
    nombre: 'Drones y Vehículos Aéreos No Tripulados',
    anioInicio: 2006,
    anioFin: 2020,
    categoria: 'drone',
    tipo: 'Drone y UAV',
    inventores: ['DJI', 'Amazon Prime Air', 'Parrot'],
    hitos: [
      'Predator — dron militar (2001)',
      'DJI Phantom — drone civil masivo (2013)',
      'Amazon anuncia Prime Air (2013)',
      'DJI Mavic Pro — plegable (2016)',
      'Drones en logística, fotografía y agricultura',
    ],
    obra: 'DJI Phantom (2013) — el drone que democratizó la fotografía aérea y creó un mercado de consumo masivo valorado en miles de millones',
    pregunta: '¿Cómo pasó el drone de ser un arma militar clasificada a un juguete de 400€ que compra cualquiera?',
    contexto:
      'Los drones militares (Predator, Global Hawk) llevaban décadas en uso secreto. DJI fundada en 2006 por Frank Wang democratizó los drones civiles. El Phantom (2013) con cámara GoPro abrió el mercado: cualquiera podía hacer fotografía aérea. El Mavic Pro (2016) era plegable y cabía en una mochila. Amazon, UPS y Wing (Google) testean entregas por drone. En la guerra de Ucrania (2022), drones baratos cambiaron la táctica militar.',
    color: '#32CD32',
  },
  {
    id: 'cobots',
    nombre: 'Cobots: Robots Colaborativos',
    anioInicio: 2008,
    anioFin: 2022,
    categoria: 'cobot',
    tipo: 'Robot colaborativo (cobot)',
    inventores: ['Universal Robots (UR)', 'Rethink Robotics', 'KUKA'],
    hitos: [
      'Universal Robots UR5 (2008) — primer cobot comercial',
      'Baxter de Rethink Robotics (2012)',
      'Cobots en pymes con presupuesto bajo',
      'ISO/TS 15066 — estándar de seguridad cobots',
      'Cobots en ensamblaje junto a humanos sin vallas',
    ],
    obra: 'Universal Robots UR5 (2008) — el primer cobot comercial: programable en minutos sin ingenieros, trabaja junto a humanos sin vallas de seguridad',
    pregunta: '¿Qué diferencia a un cobot de un robot industrial tradicional y por qué son la puerta de entrada de las pymes a la automatización?',
    contexto:
      'Los robots industriales tradicionales son rápidos, grandes y peligrosos: necesitan jaulas de seguridad. Universal Robots (2008) inventó el cobot: lento, ligero, fácil de programar y seguro para trabajar junto a humanos. Las pymes podían permitírselo (desde 20.000€). Baxter de Rethink Robotics (2012) llevó la colaboración humano-robot a nuevos extremos. Los cobots hoy son el segmento de mayor crecimiento en robótica industrial.',
    color: '#FF6B35',
  },
  {
    id: 'boston_dynamics',
    nombre: 'Boston Dynamics y Robots Ágiles',
    anioInicio: 2013,
    anioFin: 2023,
    categoria: 'humanoide',
    tipo: 'Robot de alta movilidad',
    inventores: ['Marc Raibert (Boston Dynamics)', 'DARPA', 'Spot y Atlas'],
    hitos: [
      'BigDog DARPA (2005)',
      'Spot — perro robot comercial (2019)',
      'Atlas — acrobacias y parkour (2016-2023)',
      'Google compra Boston Dynamics (2013), luego SoftBank (2017), luego Hyundai (2020)',
      'Spot en obras, minas y zonas de peligro',
    ],
    obra: 'Atlas (Boston Dynamics, 2016-2023) — el robot humanoide que hace parkour, saltos mortales y baile: el mejor robot de movilidad del mundo',
    pregunta: '¿Por qué Boston Dynamics vendió Atlas en 2023 para centrarse en Spot, el perro-robot que sí genera ingresos?',
    contexto:
      'BigDog (2005) fue el primer robot cuadrúpedo estable que no caía al empujarlo. Atlas (2016) sorprendió al mundo con parkour y saltos mortales. Spot se convirtió en el primer robot de BD en venderse comercialmente (2019): 74.500$, usado en construcción, minería y zonas de desastre. Atlas era impresionante pero no rentable. Hyundai (propietario desde 2020) decidió en 2023 discontinuar el Atlas original para lanzar uno nuevo más orientado a industria.',
    color: '#FF0000',
  },
  {
    id: 'tesla_optimus',
    nombre: 'Tesla Optimus y la Nueva Ola Humanoide',
    anioInicio: 2021,
    anioFin: 2027,
    categoria: 'humanoide',
    tipo: 'Humanoide de nueva generación',
    inventores: ['Elon Musk (Tesla Optimus)', 'Figure AI', 'Agility Robotics (Digit)', '1X Technologies'],
    hitos: [
      'Tesla Optimus presentado (2021)',
      'Figure 01 con OpenAI (2024)',
      'Agility Robotics Digit en Amazon (2023)',
      '1X Technologies — funding de OpenAI',
      'Humanoides en fábricas de Tesla para 2025',
    ],
    obra: 'Figure 01 con OpenAI (2024) — el primer robot humanoide que mantiene una conversación coherente mientras realiza tareas físicas complejas',
    pregunta: '¿Están los humanoides de 2024 realmente listos para trabajar en fábricas, o seguimos en el territorio del marketing y la promesa?',
    contexto:
      'Elon Musk presentó Optimus en 2021 prometiendo millones de unidades y robots domésticos por 20.000$. Figure AI firmó con OpenAI para dotar a sus robots de LLMs. Agility Robotics envió Digit a almacenes de Amazon. 1X Technologies recibió financiación de OpenAI. La realidad de 2024: los humanoides hacen tareas muy específicas en entornos controlados, no el trabajo doméstico general que prometen los vídeos de marketing. El salto a uso real está más lejos de lo que los inversores esperan.',
    color: '#E50914',
  },
  {
    id: 'ia_robotica',
    nombre: 'IA Encarnada: Robots que Aprenden',
    anioInicio: 2022,
    anioFin: 2028,
    categoria: 'ia_moderna',
    tipo: 'Robot con IA de aprendizaje',
    inventores: ['Google DeepMind (RT-2)', 'Stanford (Mobile ALOHA)', 'Carnegie Mellon'],
    hitos: [
      'RT-2 de Google (2023) — robot que entiende lenguaje natural',
      'Mobile ALOHA — aprendizaje por demostración (2024)',
      'Foundation Models para robots',
      'RL de última generación para manipulación',
      'Robots que aprenden de YouTube',
    ],
    obra: 'RT-2 de Google DeepMind (2023) — el primer modelo de robot que transfiere conocimiento de internet para ejecutar tareas físicas no entrenadas',
    pregunta: '¿Por qué entrenar un robot con vídeos de YouTube puede ser más eficiente que programarlo explícitamente para cada tarea?',
    contexto:
      'RT-2 (Robotic Transformer 2) de Google entrenó un robot con texto e imágenes de internet: el robot puede ejecutar instrucciones en lenguaje natural aunque nunca haya sido entrenado específicamente en esa tarea. Mobile ALOHA (Stanford, 2024) aprendió a cocinar, lavar platos y limpiar en 20 horas de demostración humana. Los "foundation models" para robots son el equivalente a los LLMs: modelos preentrenados masivamente que luego se ajustan a tareas específicas.',
    color: '#9932CC',
  },
  {
    id: 'nanorobotica',
    nombre: 'Nanorobótica y Robótica Biomédica',
    anioInicio: 2015,
    anioFin: 2035,
    categoria: 'medico',
    tipo: 'Nanorobot y microrrobot',
    inventores: ['Metin Sitti (Max Planck)', 'Samuel Sanchez (IBEC Barcelona)', 'ETH Zürich'],
    hitos: [
      'Microrobots guiados magnéticamente en arterias',
      'Nanopartículas dirigidas para quimioterapia',
      'Enjambres de microdrones para polinización',
      'Nanobots en ensayos clínicos (fase I)',
      'IBEC Barcelona — líder europeo en microrrobótica',
    ],
    obra: 'Los microrobots magnéticos de Metin Sitti (Max Planck, 2017) — navegando por el ojo de un cerdo in vivo con precisión micrométrica',
    pregunta: '¿Cuándo podrán los nanorobots navegar por nuestras arterias y entregar fármacos directamente a tumores?',
    contexto:
      'La nanorobótica ya no es ciencia ficción: existen microrrobots de 100 micrómetros que navegan en fluidos biológicos guiados por campos magnéticos. El IBEC de Barcelona (Samuel Sanchez) es referencia mundial en microrrobótica biomédica. Metin Sitti en el Max Planck demostró navegación en el ojo. Las nanopartículas ya se usan en oncología para liberar fármacos. Los ensayos en humanos están en curso. El reto: la complejidad del cuerpo humano y la biocompatibilidad de los materiales.',
    color: '#20B2AA',
  },
  {
    id: 'futuro_robotica',
    nombre: 'Robótica del Futuro: AGI Encarnada',
    anioInicio: 2028,
    anioFin: 2040,
    categoria: 'ia_moderna',
    tipo: 'AGI embodied y enjambres',
    inventores: ['OpenAI', 'Anthropic', 'investigadores de robótica general'],
    hitos: [
      'AGI embodied: robots con inteligencia general',
      'Enjambres de robots coordinados por IA',
      'Robótica blanda (soft robotics) inspirada en biología',
      'Marcos éticos para robots autónomos',
      'Robots que se auto-reparan y auto-replican',
    ],
    obra: 'La propuesta de "World Models" de Yann LeCun — cómo un robot podría entender el mundo físico con la misma profundidad que lo hace un niño de 2 años',
    pregunta: '¿Llegará un robot a entender el mundo físico con la intuición de un niño humano, y qué significa si lo logra?',
    contexto:
      'Yann LeCun (Meta AI) propone que el verdadero reto de la robótica es el "common sense": entender el mundo físico de forma intuitiva. Los LLMs saben mucho sobre texto pero fallan en física básica. La soft robotics crea robots con materiales blandos inspirados en pulpos y gusanos: seguros, adaptables. Los enjambres de drones coordinados por IA ya realizan espectáculos de luz. La mayor pregunta ética: si un robot tiene AGI, ¿tiene derechos?',
    color: '#FF1493',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: 1920, evento: 'Karel Čapek acuña "robot" en R.U.R. — nace la palabra y el concepto moderno de robot' },
  { anio: 1942, evento: 'Isaac Asimov formula las Tres Leyes de la Robótica en el cuento "Runaround"' },
  { anio: 1961, evento: 'Unimate #001 en GM — primer robot industrial del mundo en una cadena de montaje' },
  { anio: 1969, evento: 'Kawasaki licencia Unimate: Japón inicia su camino hacia el liderazgo en robótica industrial' },
  { anio: 1997, evento: 'Sojourner llega a Marte — la robótica espacial demuestra que los robots pueden explorar otros planetas' },
  { anio: 2000, evento: 'ASIMO de Honda y Da Vinci de Intuitive Surgical — el año en que los robots entran en hospitales y escenarios' },
  { anio: 2008, evento: 'Universal Robots lanza el primer cobot comercial — democratización de la automatización para pymes' },
  { anio: 2013, evento: 'DJI Phantom y Google compra Boston Dynamics — los drones civiles y los robots ágiles estallan' },
  { anio: 2024, evento: 'Figure 01 con OpenAI y RT-2 de Google — los LLMs se encarnan en robots físicos' },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  concepto: 'Concepto/Ficción',
  industrial: 'Industrial',
  ia_simbolica: 'IA Simbólica',
  medico: 'Médico',
  espacial: 'Espacial',
  servicio: 'Servicio',
  drone: 'Drone/UAV',
  cobot: 'Cobot',
  humanoide: 'Humanoide',
  ia_moderna: 'IA Moderna',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  concepto: '#8B4513',
  industrial: '#8B6914',
  ia_simbolica: '#2E8B57',
  medico: '#DC143C',
  espacial: '#FF8C00',
  servicio: '#4169E1',
  drone: '#32CD32',
  cobot: '#FF6B35',
  humanoide: '#FF0000',
  ia_moderna: '#9932CC',
};

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function PanelDetalle({ periodo }: { periodo: PeriodoRobotica }) {
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: periodo.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: periodo.color }}>{periodo.nombre}</h3>
      <p className={styles.detallePeriodo}>{periodo.anioInicio} – {periodo.anioFin}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Hitos clave</h4>
          <ul className={styles.caracteristicasList}>
            {periodo.hitos.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className={styles.detalleSubtitulo}>Inventores / Organizaciones</h4>
          <ul className={styles.artistasList}>
            {periodo.inventores.map((inv) => (
              <li key={inv}>{inv}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.obraIconica}>
        <span className={styles.obraIconicaLabel}>Obra o hito icónico</span>
        <p>{periodo.obra}</p>
      </div>

      <div className={styles.preguntaBox}>
        <span className={styles.preguntaLabel}>Pregunta central</span>
        <p className={styles.preguntaTexto}>{periodo.pregunta}</p>
      </div>

      <div className={styles.contextoBox}>
        <span className={styles.contextoLabel}>Contexto histórico</span>
        <p>{periodo.contexto}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Línea del Tiempo
// ─────────────────────────────────────────────

const AÑO_MIN = 1920;
const AÑO_MAX = 2040;
const SVG_ANCHO = 1100;
const MARGEN_IZQ = 40;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * AREA_ANCHO;
}

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<PeriodoRobotica | null>(null);

  const filas: PeriodoRobotica[][] = [[], [], [], [], []];
  const ordenados = [...PERIODOS].sort((a, b) => a.anioInicio - b.anioInicio);

  for (const per of ordenados) {
    let filaAsignada = false;
    for (let f = 0; f < filas.length; f++) {
      const ultimoEnFila = filas[f][filas[f].length - 1];
      if (!ultimoEnFila || anioAX(ultimoEnFila.anioFin) + 4 <= anioAX(per.anioInicio)) {
        filas[f].push(per);
        filaAsignada = true;
        break;
      }
    }
    if (!filaAsignada) filas[0].push(per);
  }

  const FILA_ALTO = 36;
  const FILA_OFFSET_Y = 24;
  const svgAlto = FILA_OFFSET_Y + filas.length * (FILA_ALTO + 8) + 30;

  const marcadores: number[] = [1930, 1950, 1970, 1990, 2000, 2010, 2020, 2030, 2040];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>Haz clic en un período para ver sus detalles. La línea abarca desde 1920 hasta 2040.</p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia de la robótica"
        >
          <line x1={MARGEN_IZQ} y1={svgAlto - 16} x2={SVG_ANCHO - MARGEN_DER} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={1} />

          {marcadores.map((m) => (
            <g key={m}>
              <line x1={anioAX(m)} y1={FILA_OFFSET_Y} x2={anioAX(m)} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={0.5} strokeDasharray="3,4" />
              <text x={anioAX(m)} y={svgAlto - 4} fontSize={10} fill="var(--text-muted)" textAnchor="middle">{m}</text>
            </g>
          ))}

          {filas.map((fila, fi) =>
            fila.map((per) => {
              const x = anioAX(per.anioInicio);
              const w = Math.max(anioAX(per.anioFin) - x, 10);
              const y = FILA_OFFSET_Y + fi * (FILA_ALTO + 8);
              const esSeleccionado = seleccionado?.id === per.id;

              return (
                <g key={per.id} onClick={() => setSeleccionado(esSeleccionado ? null : per)} style={{ cursor: 'pointer' }}>
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={FILA_ALTO}
                    rx={4}
                    fill={per.color}
                    opacity={esSeleccionado ? 1 : 0.8}
                    stroke={esSeleccionado ? '#fff' : 'none'}
                    strokeWidth={2}
                  />
                  {w > 50 && (
                    <text
                      x={x + w / 2}
                      y={y + FILA_ALTO / 2 + 4}
                      fontSize={9}
                      fill="#fff"
                      textAnchor="middle"
                      fontWeight={600}
                      style={{ pointerEvents: 'none' }}
                    >
                      {per.nombre.length > 18 ? per.nombre.substring(0, 16) + '…' : per.nombre}
                    </text>
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>

      <div className={styles.leyendaCategorias}>
        {(Object.keys(ETIQUETAS_CATEGORIA) as Categoria[]).map((cat) => (
          <span key={cat} className={styles.leyendaItem}>
            <span className={styles.leyendaColor} style={{ background: COLORES_CATEGORIA[cat] }} aria-hidden="true" />
            {ETIQUETAS_CATEGORIA[cat]}
          </span>
        ))}
      </div>

      {seleccionado && <PanelDetalle periodo={seleccionado} />}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2: Período en Detalle
// ─────────────────────────────────────────────

function TabDetalle() {
  const [indice, setIndice] = useState(0);
  const periodo = PERIODOS[indice];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Período en Detalle</h2>

      <div className={styles.movimientoSelector}>
        {PERIODOS.map((per, i) => (
          <button
            key={per.id}
            className={`${styles.movimientoBtn} ${i === indice ? styles.movimientoBtnActivo : ''}`}
            onClick={() => setIndice(i)}
            style={i === indice ? { background: per.color, borderColor: per.color } : {}}
          >
            {per.nombre}
          </button>
        ))}
      </div>

      <div className={styles.detalleTarjeta} style={{ borderTopColor: periodo.color }}>
        <div className={styles.detalleTarjetaHeader} style={{ background: periodo.color }}>
          <h3>{periodo.nombre}</h3>
          <p>{periodo.anioInicio} – {periodo.anioFin}</p>
          <span>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>
        </div>

        <div className={styles.detalleTarjetaBody}>
          <div className={styles.preguntaDestacada}>
            <span className={styles.preguntaIcono} aria-hidden="true">?</span>
            <p>{periodo.pregunta}</p>
          </div>

          <div className={styles.detalleGrid}>
            <div>
              <h4 className={styles.detalleSubtitulo}>Hitos principales</h4>
              <ul className={styles.caracteristicasList}>
                {periodo.hitos.map((h) => <li key={h}>{h}</li>)}
              </ul>
            </div>
            <div>
              <h4 className={styles.detalleSubtitulo}>Inventores / Organizaciones</h4>
              <ul className={styles.artistasList}>
                {periodo.inventores.map((inv) => <li key={inv}>{inv}</li>)}
              </ul>
            </div>
          </div>

          <div className={styles.obraIconica}>
            <span className={styles.obraIconicaLabel}>Obra o hito icónico</span>
            <p>{periodo.obra}</p>
          </div>

          <div className={styles.contextoBox}>
            <span className={styles.contextoLabel}>Contexto histórico</span>
            <p>{periodo.contexto}</p>
          </div>
        </div>
      </div>

      <div className={styles.navBtns}>
        <button
          className={styles.btnAnterior}
          onClick={() => setIndice((i) => Math.max(0, i - 1))}
          disabled={indice === 0}
          aria-label="Período anterior"
        >
          ← Anterior
        </button>
        <span className={styles.navCounter}>{indice + 1} / {PERIODOS.length}</span>
        <button
          className={styles.btnSiguiente}
          onClick={() => setIndice((i) => Math.min(PERIODOS.length - 1, i + 1))}
          disabled={indice === PERIODOS.length - 1}
          aria-label="Período siguiente"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 3: Comparativa
// ─────────────────────────────────────────────

function TabComparativa() {
  const [categoriaFiltro, setCategoriaFiltro] = useState<Categoria | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState('');

  const periodosFiltrados = useMemo(() => {
    return PERIODOS.filter((per) => {
      const coincideCategoria = categoriaFiltro === 'todos' || per.categoria === categoriaFiltro;
      const termino = busqueda.toLowerCase();
      const coincideBusqueda =
        !termino ||
        per.nombre.toLowerCase().includes(termino) ||
        per.inventores.some((inv) => inv.toLowerCase().includes(termino));
      return coincideCategoria && coincideBusqueda;
    });
  }, [categoriaFiltro, busqueda]);

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Comparativa</h2>

      <div className={styles.filtroCategoria}>
        <button
          className={`${styles.filtroCatBtn} ${categoriaFiltro === 'todos' ? styles.filtroCatBtnActivo : ''}`}
          onClick={() => setCategoriaFiltro('todos')}
        >
          Todos
        </button>
        {(Object.keys(ETIQUETAS_CATEGORIA) as Categoria[]).map((cat) => (
          <button
            key={cat}
            className={`${styles.filtroCatBtn} ${categoriaFiltro === cat ? styles.filtroCatBtnActivo : ''}`}
            onClick={() => setCategoriaFiltro(cat)}
            style={categoriaFiltro === cat ? { background: COLORES_CATEGORIA[cat], borderColor: COLORES_CATEGORIA[cat] } : {}}
          >
            {ETIQUETAS_CATEGORIA[cat]}
          </button>
        ))}
      </div>

      <input
        type="search"
        className={styles.buscadorInput}
        placeholder="Buscar por período o inventor..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período de robótica"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Rango</th>
              <th>Tipo</th>
              <th>Inventor / Org.</th>
              <th>Hito icónico</th>
            </tr>
          </thead>
          <tbody>
            {periodosFiltrados.map((per, i) => (
              <tr key={per.id} style={i % 2 === 0 ? { background: `${per.color}18` } : {}}>
                <td><strong style={{ color: per.color }}>{per.nombre}</strong></td>
                <td>{per.anioInicio}–{per.anioFin}</td>
                <td>
                  <span className={styles.badgeCategoria} style={{ background: `${COLORES_CATEGORIA[per.categoria]}22`, color: COLORES_CATEGORIA[per.categoria] }}>
                    {ETIQUETAS_CATEGORIA[per.categoria]}
                  </span>
                </td>
                <td>{per.inventores[0]}</td>
                <td className={styles.peliculaCell}>{per.obra}</td>
              </tr>
            ))}
            {periodosFiltrados.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.sinResultados}>Sin resultados para la búsqueda actual.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 4: Contexto Histórico — vista por eras
// ─────────────────────────────────────────────

interface Era {
  nombre: string;
  desde: number;
  hasta: number;
  icono: string;
  descripcion: string;
}

const ERAS: Era[] = [
  { nombre: 'Robot como Idea', desde: 1920, hasta: 1960, icono: '📖', descripcion: 'Čapek inventa la palabra; Asimov define las leyes; la cibernética de Wiener sienta las bases teóricas' },
  { nombre: 'Robótica Industrial', desde: 1960, hasta: 1985, icono: '🏭', descripcion: 'Unimate en GM inaugura la era industrial; Japón lidera; los brazos robóticos transforman la manufactura' },
  { nombre: 'IA y Movilidad', desde: 1985, hasta: 2005, icono: '🤖', descripcion: 'Da Vinci opera en hospitales; Sojourner explora Marte; ASIMO demuestra que los humanoides son posibles' },
  { nombre: 'Drones y Cobots', desde: 2005, hasta: 2018, icono: '🚁', descripcion: 'DJI democratiza los drones; Universal Robots acerca la automatización a las pymes con cobots asequibles' },
  { nombre: 'Humanoides y IA Moderna', desde: 2018, hasta: 2025, icono: '🦾', descripcion: 'Boston Dynamics hace parkour; Tesla Optimus promete fábricas con robots; RT-2 aprende de internet' },
  { nombre: 'AGI Encarnada y Nanorobótica', desde: 2025, hasta: 2040, icono: '🔬', descripcion: 'Nanorobots en arterias, enjambres coordinados por IA y la gran pregunta: ¿inteligencia general en un cuerpo?' },
];

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Períodos de la robótica y eventos clave organizados por eras.
      </p>

      <div className={styles.erasGrid}>
        {ERAS.map((era) => {
          const periodosEra = PERIODOS.filter(
            (p) => p.anioInicio < era.hasta && p.anioFin > era.desde
          );
          const eventosEra = EVENTOS_HISTORICOS.filter(
            (ev) => ev.anio >= era.desde && ev.anio < era.hasta
          );

          return (
            <div key={era.nombre} className={styles.eraCard}>
              <div className={styles.eraHeader}>
                <span className={styles.eraIcono} aria-hidden="true">{era.icono}</span>
                <div>
                  <h3 className={styles.eraNombre}>{era.nombre}</h3>
                  <span className={styles.eraRango}>{era.desde} – {era.hasta === 2040 ? 'hoy' : era.hasta}</span>
                </div>
              </div>

              <p className={styles.eraDescripcion}>{era.descripcion}</p>

              {periodosEra.length > 0 && (
                <div className={styles.eraEstilos}>
                  {periodosEra.map((p) => (
                    <span
                      key={p.id}
                      className={styles.eraEstiloBadge}
                      style={{ background: `${p.color}1A`, color: p.color, borderColor: `${p.color}55` }}
                    >
                      {p.nombre}
                    </span>
                  ))}
                </div>
              )}

              {eventosEra.length > 0 && (
                <ul className={styles.eraEventos}>
                  {eventosEra.map((ev) => (
                    <li key={ev.anio} className={styles.eraEvento}>
                      <span className={styles.eraEventoAnio}>{ev.anio}</span>
                      <span className={styles.eraEventoTexto}>{ev.evento}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorHistoriaRobotica() {
  const [tabActiva, setTabActiva] = useState<TabActiva>('timeline');

  const tabs: { id: TabActiva; label: string }[] = [
    { id: 'timeline', label: 'Línea del Tiempo' },
    { id: 'detalle', label: 'Período en Detalle' },
    { id: 'comparativa', label: 'Comparativa' },
    { id: 'contexto', label: 'Contexto Histórico' },
  ];

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Historia de la Robótica</h1>
        <p className={styles.heroSubtitle}>
          De Karel Čapek y Unimate a Boston Dynamics, Tesla Optimus y nanorobots — 14 períodos con los inventores, hitos y preguntas que definen 100 años de robots
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <nav className={styles.tabNav} role="tablist" aria-label="Secciones del visualizador">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={tabActiva === tab.id}
              className={`${styles.tabBtn} ${tabActiva === tab.id ? styles.tabBtnActivo : ''}`}
              onClick={() => setTabActiva(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className={styles.tabContent} role="tabpanel">
          {tabActiva === 'timeline' && <TabTimeline />}
          {tabActiva === 'detalle' && <TabDetalle />}
          {tabActiva === 'comparativa' && <TabComparativa />}
          {tabActiva === 'contexto' && <TabContexto />}
        </div>
      </main>

      <EducationalSection
        title="Guía completa sobre la historia de la robótica"
        subtitle="Cómo los robots pasaron de la ciencia ficción a las fábricas, los hospitales y el espacio"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 5 tipos de robots clave</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Origen</th>
                <th>Capacidad clave</th>
                <th>Uso principal</th>
                <th>Precio aproximado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Robot industrial</strong></td>
                <td>1961 (Unimate)</td>
                <td>Velocidad y precisión repetitiva</td>
                <td>Soldadura, ensamblaje, pintura</td>
                <td>50.000–500.000 €</td>
              </tr>
              <tr>
                <td><strong>Cobot</strong></td>
                <td>2008 (Universal Robots)</td>
                <td>Colaboración segura con humanos</td>
                <td>Pymes, laboratorios, logística</td>
                <td>20.000–60.000 €</td>
              </tr>
              <tr>
                <td><strong>Robot médico</strong></td>
                <td>2000 (Da Vinci)</td>
                <td>Precisión micrométrica, sin temblor</td>
                <td>Cirugía mínimamente invasiva</td>
                <td>1–2 millones € (arrendamiento)</td>
              </tr>
              <tr>
                <td><strong>Drone</strong></td>
                <td>2013 (DJI Phantom)</td>
                <td>Vuelo autónomo, cámara aérea</td>
                <td>Fotografía, logística, agricultura</td>
                <td>400–10.000 €</td>
              </tr>
              <tr>
                <td><strong>Humanoide</strong></td>
                <td>2000 (ASIMO) / 2019 (Spot)</td>
                <td>Movilidad bípeda / cuadrúpeda</td>
                <td>Investigación, industria, inspección</td>
                <td>74.500 € (Spot) / 20.000 € est. (Optimus)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Escenarios */}
        <h3>Grandes preguntas del futuro robótico</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🏭</span>
            <div>
              <strong>Humanoides en fábricas en 2030</strong>
              <p>Tesla, Figure AI y Agility prometen humanoides en cadenas de montaje antes de 2030. ¿Podrán adaptarse a entornos no estructurados sin un año de entrenamiento específico por tarea?</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">💉</span>
            <div>
              <strong>Nanorobots médicos en humanos</strong>
              <p>Los primeros ensayos clínicos de microrrobots en humanos están en curso. Si funcionan, abrirán una era de terapias de precisión imposibles hoy: quimioterapia dirigida a tumor sin afectar células sanas.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🐝</span>
            <div>
              <strong>Enjambres autónomos</strong>
              <p>Cientos de drones coordinados por IA ya hacen espectáculos de luz sincronizados. El siguiente paso: enjambres para polinización artificial, búsqueda y rescate, o construcción colaborativa.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">⚠️</span>
            <div>
              <strong>Crisis laboral por automatización</strong>
              <p>McKinsey estima que el 30% de los trabajos actuales son automatizables con tecnología existente. Los cobots ya desplazan empleos en manufactura. La pregunta no es si ocurrirá, sino a qué velocidad y qué harán los gobiernos.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes sobre robótica e historia</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Cuál fue el primer robot real de la historia?</strong>
            <p>Depende de cómo definamos "robot". Si buscamos autómatas mecánicos, los hay desde la Antigüedad (el pájaro mecánico de Arquitas, siglo IV a.C.). Pero el primer robot programable moderno fue el Unimate #001, instalado en General Motors en 1961. Si hablamos del primer robot con comportamiento emergente y cierta "autonomía", las tortugas de Grey Walter (1948) tienen argumentos históricos sólidos.</p>
            <span className={styles.faqTip}>El término "robot" tiene solo 100 años. La tecnología tiene milenios. La distinción es importante: no toda máquina automática es un robot.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué Japón lidera la robótica industrial desde hace décadas?</strong>
            <p>Japón adoptó Unimate en 1969 (Kawasaki licenció la tecnología) mientras Estados Unidos miraba hacia otro lado. En los años 70, las empresas japonesas desarrollaron sus propios robots y los exportaron al mundo. La combinación de escasez de mano de obra, cultura de mejora continua (kaizen) e industria manufacturera fuerte creó el ecosistema perfecto. En 2023, Japón sigue siendo el mayor exportador de robots industriales del mundo.</p>
            <span className={styles.faqTip}>Paradoja: el país que más robots tiene per cápita (en manufactura) es también uno de los más reticentes a la inmigración. Los robots resolvieron el problema demográfico que la política migratoria no quiso abordar.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué diferencia a un robot de un cobot?</strong>
            <p>Un robot industrial tradicional trabaja a máxima velocidad dentro de una jaula de seguridad: si un humano entra, el robot se detiene (o el humano resulta gravemente herido). Un cobot (robot colaborativo) está diseñado para trabajar junto a humanos sin barreras físicas: tiene sensores de fuerza que lo detienen si detecta resistencia inesperada, velocidades más lentas y materiales más seguros. Universal Robots UR5 (2008) fue el primero de este tipo.</p>
            <span className={styles.faqTip}>El cobot no es "un robot más pequeño". Es una filosofía de diseño diferente: prioriza la interacción segura sobre la velocidad y potencia máximas.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Está la IA realmente cambiando la robótica o es marketing?</strong>
            <p>Ambas cosas. Los "foundation models" para robots (RT-2, OpenVLA) son genuinamente nuevos: permiten que un robot generalice a tareas no vistas en entrenamiento. Esto no era posible con programación clásica. Pero los vídeos de marketing de humanoides muestran tareas muy concretas en entornos perfectamente controlados. La brecha entre el vídeo de marketing y el robot en un entorno real y desordenado sigue siendo enorme en 2024.</p>
            <span className={styles.faqTip}>Regla práctica: si el vídeo no muestra fallos, desconfía. Los mejores laboratorios de robótica publican también sus fracasos — es la señal de que están trabajando en el problema real.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué son las Tres Leyes de la Robótica de Asimov y siguen siendo relevantes?</strong>
            <p>Isaac Asimov formuló en 1942 tres reglas para robots: (1) no dañar a un humano, (2) obedecer órdenes humanas salvo si contradicen la primera, (3) protegerse a sí mismo salvo si contradice las dos primeras. Son narrativamente elegantes pero técnicamente insuficientes: ¿cómo define el robot "daño"? ¿Qué pasa si obedecer causa daño indirecto? Los debates actuales de ética de IA son descendientes directos de los dilemas que Asimov planteó en sus cuentos.</p>
            <span className={styles.faqTip}>Asimov escribió décadas de cuentos mostrando cómo sus propias leyes fallaban en casos extremos. Él mismo sabía que eran un punto de partida, no una solución.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía paso a paso */}
        <h3>Guía para entender la revolución robótica</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Distingue entre automatización y autonomía</strong>
              <p>Un robot industrial repite exactamente lo que se programó: es automatización. Un robot autónomo adapta su comportamiento al entorno: es autonomía. La mayor parte de los robots en uso hoy son automatización. La autonomía real (sin intervención humana en tiempo real) es mucho más difícil y está en sus inicios.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Comprende la paradoja de Moravec</strong>
              <p>Lo que es fácil para un humano (coger un objeto desordenado del suelo, reconocer una cara, caminar por terreno irregular) es extremadamente difícil para un robot. Lo que es difícil para un humano (calcular millones de números, ensamblar 10.000 piezas idénticas sin error) es trivial para un robot. Esta paradoja explica por qué los robots llevan décadas en fábricas pero aún no hacen la limpieza doméstica.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Sigue el dinero para entender el estado real del sector</strong>
              <p>Las empresas que anuncian "millones de humanoides en 2025" buscan inversión. Las que publican datos de ventas reales, casos de uso en producción y fallos documentados están en el negocio real. Boston Dynamics tardó 30 años en vender su primer robot. Universal Robots lleva 15 años vendiendo cobots con éxito discreto pero real.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Distingue el laboratorio del producto</strong>
              <p>Un robot que hace parkour en un vídeo de Boston Dynamics funciona en condiciones perfectas, con semanas de preparación del entorno y múltiples tomas. Un robot que "opera" en una fábrica lo hace en un entorno estrictamente controlado y para tareas muy específicas. La distancia entre ambos es el trabajo real de la robótica.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Lee sobre ética antes de los avances técnicos</strong>
              <p>Cada avance robótico trae dilemas que la tecnología no resuelve: ¿Quién es responsable si un robot autónomo causa daños? ¿Puede un robot tener derechos? ¿Cómo compensamos a los trabajadores desplazados? Asimov planteó estas preguntas en 1942. Seguimos sin respuestas definitivas y las decisiones del presente serán más urgentes que las del futuro.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Tips */}
        <h3>Para entender el impacto de los robots en el mercado laboral</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📊</span>
            <p>La automatización no "destruye empleos" de forma uniforme: elimina tareas repetitivas y crea demanda de nuevas habilidades. Los operarios que trabajaron con Unimate en 1961 pasaron a programar y mantener robots — aunque ese proceso de reconversión no fue fácil ni automático.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌍</span>
            <p>El impacto de los robots es geográfico: las regiones manufactureras con industria tradicional (cinturón del óxido americano, regiones mineras europeas) son las más vulnerables. Las ciudades tecnológicas y los trabajos de alta cualificación se benefician más. La robotización amplifica las desigualdades existentes si no hay políticas activas.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⏱️</span>
            <p>La velocidad importa. Las primeras Revoluciones Industriales destruyeron empleos en décadas, dando tiempo a la adaptación generacional. Los robots e IA pueden hacerlo en años. La rapidez del cambio tecnológico superará la capacidad natural de adaptación del mercado laboral si no se interviene activamente.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔬</span>
            <p>Los trabajos más seguros ante la automatización combinan destreza física variable (carpintero, fontanero, enfermero) con creatividad o juicio social (terapeuta, maestro, negociador). La paradoja de Moravec garantiza que estas habilidades humanas seguirán siendo difíciles de replicar para los robots en el horizonte próximo.</p>
          </div>
        </div>

        {/* Sección 6 — warningBox */}
        <div className={styles.warningBox}>
          <strong>Sobre los datos técnicos y proyecciones de este visualizador</strong>
          <ul>
            <li>Los datos técnicos y de precio de robots son <strong>aproximaciones</strong> basadas en anuncios de fabricantes y análisis de mercado. Los precios varían significativamente según configuración, región y condiciones comerciales.</li>
            <li>Las <strong>proyecciones futuras</strong> (humanoides en fábricas, nanorobots en humanos, AGI encarnada) son estimaciones de investigadores y analistas sujetas a revisión. El historial de predicciones en robótica es de retrasos sistemáticos respecto a las promesas iniciales.</li>
            <li>Los períodos de este visualizador se <strong>solapan intencionalmente</strong>: la robótica médica y la robótica espacial se desarrollaron en paralelo, no de forma secuencial. Las fechas son orientativas.</li>
            <li>Las <strong>atribuciones de "primer robot"</strong> dependen de la definición empleada. La historia de la robótica tiene múltiples hitos simultáneos en diferentes países y laboratorios que merecen reconocimiento independiente.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-robotica')} />
      <ShareCard appName="visualizador-historia-robotica" />
      <Footer appName="visualizador-historia-robotica" />
    </div>
  );
}
