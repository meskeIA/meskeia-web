'use client';

import { useState } from 'react';
import styles from './Cronobiologia.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { generateJsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type Tab = 'reloj' | 'sincronizadores' | 'cronotipos' | 'cronofarmacologia';

interface TabInfo {
  id: Tab;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const TABS: TabInfo[] = [
  { id: 'reloj', titulo: 'Reloj Molecular', icono: '⚙️', subtitulo: 'El bucle CLOCK/BMAL1/PER/CRY en ~24 horas' },
  { id: 'sincronizadores', titulo: 'Sincronizadores', icono: '🌞', subtitulo: 'Zeitgebers: los relojes exteriores que afinan el interno' },
  { id: 'cronotipos', titulo: 'Cronotipos', icono: '🦉', subtitulo: 'Alondra, Colibrí y Búho: curvas fisiológicas' },
  { id: 'cronofarmacologia', titulo: 'Cronofarmacología', icono: '💊', subtitulo: 'El momento óptimo para cada medicamento' },
];

// ─────────────────────────────────────────────
// Datos: fases del reloj molecular
// ─────────────────────────────────────────────

interface FaseReloj {
  hora: string;
  nombre: string;
  proteinas: string[];
  colorProteinas: string[];
  descripcion: string;
  color: string;
  angulo: number; // grados en el círculo
}

const FASES_RELOJ: FaseReloj[] = [
  {
    hora: '6-10h',
    nombre: 'Activación',
    proteinas: ['CLOCK', 'BMAL1'],
    colorProteinas: ['#2E86AB', '#48A9A6'],
    descripcion: 'El heterodímero CLOCK+BMAL1 se une al promotor E-box y activa la transcripción de los genes PER1, PER2, CRY1 y CRY2.',
    color: '#2E86AB',
    angulo: 0,
  },
  {
    hora: '12-16h',
    nombre: 'Acumulación',
    proteinas: ['PER', 'CRY'],
    colorProteinas: ['#E67E22', '#F1C40F'],
    descripcion: 'Las proteínas PER y CRY se acumulan en el citoplasma. La caseína kinasa 1ε (CK1ε) las fosforila gradualmente.',
    color: '#E67E22',
    angulo: 90,
  },
  {
    hora: '20-24h',
    nombre: 'Inhibición',
    proteinas: ['PER+CRY'],
    colorProteinas: ['#E74C3C'],
    descripcion: 'El complejo PER+CRY transloca al núcleo e inhibe directamente a CLOCK+BMAL1, deteniendo su propia síntesis.',
    color: '#E74C3C',
    angulo: 180,
  },
  {
    hora: '2-6h',
    nombre: 'Degradación',
    proteinas: ['CK1ε', 'SCFβ-TrCP'],
    colorProteinas: ['#9B59B6', '#8E44AD'],
    descripcion: 'La fosforilación por CK1ε marca PER y CRY para su ubiquitinación y degradación proteasomal. CLOCK+BMAL1 queda libre de nuevo.',
    color: '#9B59B6',
    angulo: 270,
  },
];

// ─────────────────────────────────────────────
// Datos: efectos fisiológicos por hora
// ─────────────────────────────────────────────

interface EfectoFisiologico {
  nombre: string;
  picoHora: number; // hora del pico (0-24)
  valor: string;
  color: string;
  descripcion: string;
}

const EFECTOS_FISIOLOGICOS: EfectoFisiologico[] = [
  { nombre: 'Cortisol', picoHora: 8, valor: 'Pico 8h', color: '#F39C12', descripcion: 'El «despertador hormonal». Promueve alerta, moviliza glucosa. Mínimo a medianoche.' },
  { nombre: 'Temperatura', picoHora: 17, valor: 'Máximo 17h', color: '#E74C3C', descripcion: 'La temperatura corporal central fluctúa ~1°C a lo largo del día. El descenso vesperal es señal para el inicio del sueño.' },
  { nombre: 'Rendimiento cognitivo', picoHora: 11, valor: 'Pico 10-12h', color: '#2E86AB', descripcion: 'Atención sostenida, memoria de trabajo y velocidad de procesamiento. Influenciado por cronotipo.' },
  { nombre: 'Fuerza muscular', picoHora: 17, valor: 'Pico 17h', color: '#27AE60', descripcion: 'La fuerza muscular y la capacidad aeróbica alcanzan su máximo a media tarde. Ideal para entrenamiento de fuerza.' },
  { nombre: 'Melatonina', picoHora: 2, valor: 'Pico 2-3h', color: '#8E44AD', descripcion: 'La «hormona de la oscuridad». Producción inicia ~21h, pico 2-3h, suprimida por luz azul.' },
  { nombre: 'Presión arterial', picoHora: 10, valor: 'Máximo 10-18h', color: '#C0392B', descripcion: 'La PA es más baja en la madrugada y sube bruscamente al despertar («morning surge»). Mayor riesgo cardiovascular matutino.' },
];

// ─────────────────────────────────────────────
// Datos: sincronizadores (Zeitgebers)
// ─────────────────────────────────────────────

interface Zeitgeber {
  nombre: string;
  icono: string;
  potencia: number; // 1-5
  color: string;
  mecanismo: string;
  efectoAdelanta: string;
  efectoRetrasa: string;
}

const ZEITGEBERS: Zeitgeber[] = [
  {
    nombre: 'Luz',
    icono: '☀️',
    potencia: 5,
    color: '#F39C12',
    mecanismo: 'Fotorreceptores de melanopsina (células ipRGC de la retina) → tracto retinohipotalámico → núcleo supraquiasmático (NSQ) → glándula pineal. La luz azul (460-480 nm) suprime melatonina hasta 3 horas.',
    efectoAdelanta: 'Luz matutina (6-8h) → adelanta la fase del reloj',
    efectoRetrasa: 'Luz nocturna (pantallas, LEDs) → retrasa el inicio del sueño',
  },
  {
    nombre: 'Alimentación',
    icono: '🍽️',
    potencia: 4,
    color: '#27AE60',
    mecanismo: 'El hígado tiene un reloj periférico propio. Comer activa AMPK y otras kinasas que ajustan los genes reloj hepáticos. El ayuno nocturno sincroniza el reloj hepático con el NSQ.',
    efectoAdelanta: 'Desayuno temprano y cena temprana → adelanta el reloj periférico',
    efectoRetrasa: 'Cenas muy tardías → desincronía entre NSQ (luz) y reloj hepático (comida)',
  },
  {
    nombre: 'Ejercicio',
    icono: '🏃',
    potencia: 3,
    color: '#2E86AB',
    mecanismo: 'AMPK fosforila CRY1 → acelera su degradación → ajusta la fase del reloj. El ejercicio también eleva la temperatura y el cortisol, que son señales circadianas.',
    efectoAdelanta: 'Ejercicio matutino → leve adelanto de fase',
    efectoRetrasa: 'Ejercicio nocturno (>21h) → retraso de fase, mayor tiempo para conciliar el sueño',
  },
  {
    nombre: 'Temperatura',
    icono: '🌡️',
    potencia: 3,
    color: '#E74C3C',
    mecanismo: 'El NSQ controla la temperatura corporal (oscilación ~1°C/día), pero la temperatura ambiental también puede sincronizar clocks periféricos musculares y dérmicos.',
    efectoAdelanta: 'Exposición al frío matutino → leve adelanto de fase',
    efectoRetrasa: 'Temperatura ambiental alta nocturna → interfiere con el descenso de temperatura corporal necesario para el sueño',
  },
  {
    nombre: 'Contacto social',
    icono: '👥',
    potencia: 2,
    color: '#9B59B6',
    mecanismo: 'Los horarios sociales (trabajo, reuniones, comidas compartidas) regulan indirectamente la exposición a luz y la actividad física. Son sincronizadores secundarios mediados por los anteriores.',
    efectoAdelanta: 'Horarios de trabajo matutinos regulares → fuerzan exposición a luz matutina',
    efectoRetrasa: 'Vida social nocturna, exposición a pantallas tardía → jet lag social crónico',
  },
];

// ─────────────────────────────────────────────
// Datos: cronotipos
// ─────────────────────────────────────────────

interface Cronotipo {
  id: string;
  nombre: string;
  icono: string;
  porcentaje: number;
  color: string;
  horaDormir: string;
  horaDespertar: string;
  picoCognitivo: string;
  descripcion: string;
  baseMolecular: string;
  // Curva de alerta a lo largo del día (24 puntos, 0-100)
  curvaAlerta: number[];
}

const CRONOTIPOS: Cronotipo[] = [
  {
    id: 'alondra',
    nombre: 'Alondra',
    icono: '🐦',
    porcentaje: 25,
    color: '#F39C12',
    horaDormir: '21:30-22:00h',
    horaDespertar: '5:30-6:00h',
    picoCognitivo: '9-12h',
    descripcion: 'Cronotipos matutinos. Se despiertan naturalmente temprano con energía alta. El rendimiento declina por la tarde. Prefieren reuniones y trabajo complejo en la mañana.',
    baseMolecular: 'Variante de 4 repeticiones en PER3 (PER3⁴) y SNPs en CRY1. El NSQ tiene una oscilación intrínseca más corta (~23,5h), por lo que se adelanta naturalmente.',
    curvaAlerta: [10, 5, 3, 2, 5, 30, 65, 85, 95, 100, 95, 88, 75, 60, 50, 40, 30, 22, 15, 10, 8, 6, 5, 8],
  },
  {
    id: 'colibri',
    nombre: 'Colibrí',
    icono: '🐦‍⬛',
    porcentaje: 50,
    color: '#2E86AB',
    horaDormir: '23:00-23:30h',
    horaDespertar: '7:00-7:30h',
    picoCognitivo: '11-15h',
    descripcion: 'Cronotipos intermedios. La mayoría de la población. Se adaptan con relativa facilidad a distintos horarios. Rinden bien de mañana y de tarde temprana.',
    baseMolecular: 'Combinación heterocigota de variantes PER3. Oscilación del NSQ ~24h, bien sincronizado con el ciclo luz-oscuridad ambiental estándar.',
    curvaAlerta: [5, 3, 2, 2, 4, 15, 40, 65, 80, 90, 95, 100, 95, 88, 80, 70, 55, 40, 28, 18, 12, 8, 6, 5],
  },
  {
    id: 'buho',
    nombre: 'Búho',
    icono: '🦉',
    porcentaje: 25,
    color: '#8E44AD',
    horaDormir: '1:00-2:00h',
    horaDespertar: '9:00-10:00h',
    picoCognitivo: '15-20h',
    descripcion: 'Cronotipos vespertinos. Rinden mejor en la tarde y noche. Tienen dificultad para madrugar. El jet lag social (madrugar entre semana) es un problema de salud real, no de pereza.',
    baseMolecular: 'Variante de 5 repeticiones en PER3 (PER3⁵) o SNPs en CRY1 que alargan el período. El NSQ tiene oscilación intrínseca más larga (~24,5h), por lo que se retrasa naturalmente.',
    curvaAlerta: [15, 12, 8, 5, 3, 5, 15, 28, 40, 55, 65, 72, 78, 82, 88, 95, 100, 98, 90, 78, 60, 45, 30, 20],
  },
];

// ─────────────────────────────────────────────
// Datos: cronofarmacología
// ─────────────────────────────────────────────

interface FarmacoInfo {
  nombre: string;
  ejemplos: string;
  mejorMomento: 'mañana' | 'noche' | 'flexible';
  horaIdeal: string;
  razon: string;
  efecto: string;
}

const FARMACOS: FarmacoInfo[] = [
  {
    nombre: 'Antihipertensivos (ARA-II, IECAs)',
    ejemplos: 'losartán, ramipril, enalapril',
    mejorMomento: 'noche',
    horaIdeal: '21-22h',
    razon: 'La presión arterial tiene su pico máximo en las primeras horas de la mañana (6-10h, «morning surge»). La cobertura nocturna reduce el riesgo del pico matutino asociado a eventos cardiovasculares.',
    efecto: 'Administración nocturna reduce un 33% el riesgo cardiovascular vs administración matutina (estudio Hygia, 2019).',
  },
  {
    nombre: 'Estatinas (simvastatina, lovastatina)',
    ejemplos: 'simvastatina, lovastatina (no atorvastatina)',
    mejorMomento: 'noche',
    horaIdeal: '21h',
    razon: 'La enzima HMG-CoA reductasa (diana de las estatinas) alcanza su máxima actividad en la madrugada. Las estatinas de vida media corta son más eficaces si se toman por la noche.',
    efecto: 'Las estatinas de acción prolongada (atorvastatina, rosuvastatina) pueden tomarse en cualquier momento. Las de vida media corta (simvastatina) son más eficaces de noche.',
  },
  {
    nombre: 'Corticoides (prednisona, prednisolona)',
    ejemplos: 'prednisona, prednisolona, dexametasona',
    mejorMomento: 'mañana',
    horaIdeal: '7-8h',
    razon: 'El cortisol endógeno tiene su pico natural a las 8h. Tomar corticoides por la mañana imita este patrón fisiológico y minimiza la supresión del eje hipotálamo-hipófisis-adrenal (HHA).',
    efecto: 'Tomar corticoides por la noche puede suprimir el eje HHA con el triple de intensidad, causando insuficiencia suprarrenal con uso crónico.',
  },
  {
    nombre: 'Aspirina (dosis preventiva)',
    ejemplos: 'ácido acetilsalicílico 100mg',
    mejorMomento: 'noche',
    horaIdeal: '21-22h',
    razon: 'La agregación plaquetaria es máxima en las primeras horas de la mañana (período de mayor riesgo de infarto y ACV). La aspirina nocturna cubre este período de alto riesgo.',
    efecto: 'La aspirina nocturna reduce la agregación plaquetaria matutina mejor que la matutina. Algunos estudios muestran mejor control de la PA en hipertensos.',
  },
  {
    nombre: 'Antihistamínicos (cetirizina, loratadina)',
    ejemplos: 'cetirizina, loratadina, fexofenadina',
    mejorMomento: 'noche',
    horaIdeal: '21h',
    razon: 'Los síntomas alérgicos (rinitis, urticaria) son más intensos entre las 4-6h de la madrugada por el pico de histamina y la caída del cortisol. La toma nocturna mantiene niveles durante ese período.',
    efecto: 'Mejor control de síntomas nocturnos y matutinos. Además, la sedación de cetirizina resulta beneficiosa si se toma por la noche en lugar de durante el día.',
  },
  {
    nombre: 'AINEs (ibuprofeno, naproxeno)',
    ejemplos: 'ibuprofeno, naproxeno, diclofenaco',
    mejorMomento: 'mañana',
    horaIdeal: '8-10h',
    razon: 'La absorción y biodisponibilidad de los AINEs es mayor por la mañana. También, la percepción del dolor es más intensa en la tarde, pero la protección gástrica de la mucosa es mejor a media mañana.',
    efecto: 'Mayor biodisponibilidad matutina. La irritación gástrica es menor si se toman con comida durante el día. Excepción: artritis reumatoide tiene síntomas peores al despertar → el naproxeno por la noche puede ser más adecuado.',
  },
];

// ─────────────────────────────────────────────
// Tab 1: El Reloj Molecular
// ─────────────────────────────────────────────

function TabReloj() {
  const [horaSeleccionada, setHoraSeleccionada] = useState<number>(8);

  // Determinar qué fase está activa según la hora
  function getFaseActiva(hora: number): number {
    if (hora >= 6 && hora < 12) return 0; // Activación
    if (hora >= 12 && hora < 18) return 1; // Acumulación
    if (hora >= 18 && hora < 24) return 2; // Inhibición
    return 3; // Degradación (0-6h)
  }

  const faseActiva = getFaseActiva(horaSeleccionada);

  // Calcular posición de cada fase en el círculo SVG
  const cx = 160;
  const cy = 160;
  const radio = 110;

  function posCirculo(angulo: number, r: number) {
    const rad = ((angulo - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  return (
    <div className={styles.tabContent}>
      <div className={styles.contexto}>
        <p>El reloj molecular es un <strong>bucle de retroalimentación negativa</strong> que dura ~24 horas. Dos transcriptores activan su propio inhibidor, que los apaga, hasta que se degrada y el ciclo comienza de nuevo.</p>
      </div>

      <div className={styles.relojLayout}>
        {/* SVG del reloj circular */}
        <div className={styles.relojSvgWrapper}>
          <svg
            viewBox="0 0 320 320"
            className={styles.relojSvg}
            aria-label="Bucle de retroalimentación circadiano CLOCK/BMAL1/PER/CRY"
          >
            {/* Círculo central */}
            <circle cx={cx} cy={cy} r={radio} fill="none" stroke="var(--border-color)" strokeWidth="2" strokeDasharray="6 4" />

            {/* Arcos de cada fase */}
            {FASES_RELOJ.map((fase, i) => {
              const inicio = fase.angulo;
              const fin = inicio + 90;
              const r = radio;
              const p1 = posCirculo(inicio + 5, r);
              const p2 = posCirculo(fin - 5, r);
              const largeArc = 0;
              return (
                <path
                  key={fase.nombre}
                  d={`M ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArc} 1 ${p2.x} ${p2.y}`}
                  fill="none"
                  stroke={fase.color}
                  strokeWidth={i === faseActiva ? 8 : 4}
                  strokeLinecap="round"
                  opacity={i === faseActiva ? 1 : 0.35}
                />
              );
            })}

            {/* Nodos de proteínas */}
            {FASES_RELOJ.map((fase, i) => {
              const pos = posCirculo(fase.angulo + 45, radio);
              const activa = i === faseActiva;
              return (
                <g key={`nodo-${i}`}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={activa ? 22 : 16}
                    fill={fase.color}
                    opacity={activa ? 1 : 0.4}
                  />
                  <text
                    x={pos.x}
                    y={pos.y - 3}
                    textAnchor="middle"
                    fontSize="7"
                    fill="white"
                    fontWeight="bold"
                  >
                    {fase.proteinas[0]}
                  </text>
                  {fase.proteinas[1] && (
                    <text
                      x={pos.x}
                      y={pos.y + 7}
                      textAnchor="middle"
                      fontSize="7"
                      fill="white"
                      fontWeight="bold"
                    >
                      {fase.proteinas[1]}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Flechas de activación/inhibición */}
            <defs>
              <marker id="arrow-act" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M 0 0 L 6 3 L 0 6 Z" fill="#2E86AB" />
              </marker>
              <marker id="arrow-inh" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M 0 0 L 6 3 L 0 6 Z" fill="#E74C3C" />
              </marker>
            </defs>

            {/* Flecha activación CLOCK+BMAL1 → PER/CRY */}
            <path
              d={`M ${posCirculo(55, radio - 10).x} ${posCirculo(55, radio - 10).y} Q ${cx} ${cy - 50} ${posCirculo(130, radio - 10).x} ${posCirculo(130, radio - 10).y}`}
              fill="none"
              stroke="#2E86AB"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              markerEnd="url(#arrow-act)"
              opacity={0.6}
            />

            {/* Flecha inhibición PER+CRY → CLOCK+BMAL1 */}
            <path
              d={`M ${posCirculo(215, radio - 10).x} ${posCirculo(215, radio - 10).y} Q ${cx} ${cy + 50} ${posCirculo(335, radio - 10).x} ${posCirculo(335, radio - 10).y}`}
              fill="none"
              stroke="#E74C3C"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              markerEnd="url(#arrow-inh)"
              opacity={0.6}
            />

            {/* Etiquetas horas en los cuadrantes */}
            {FASES_RELOJ.map((fase) => {
              const pos = posCirculo(fase.angulo, radio + 28);
              return (
                <text key={`hora-${fase.hora}`} x={pos.x} y={pos.y} textAnchor="middle" fontSize="9" fill="var(--text-secondary)" fontWeight="600">
                  {fase.hora}
                </text>
              );
            })}

            {/* Texto central */}
            <text x={cx} y={cy - 8} textAnchor="middle" fontSize="11" fill="var(--text-primary)" fontWeight="700">~24h</text>
            <text x={cx} y={cy + 8} textAnchor="middle" fontSize="9" fill="var(--text-secondary)">Ritmo</text>
            <text x={cx} y={cy + 20} textAnchor="middle" fontSize="9" fill="var(--text-secondary)">circadiano</text>
          </svg>
        </div>

        {/* Panel de fase activa */}
        <div className={styles.faseInfo}>
          <h3 className={styles.faseInfoTitulo}>Fase activa a las {horaSeleccionada}:00h</h3>
          <div className={styles.faseInfoFase} style={{ borderLeftColor: FASES_RELOJ[faseActiva].color }}>
            <span className={styles.faseInfoNombre} style={{ color: FASES_RELOJ[faseActiva].color }}>
              {FASES_RELOJ[faseActiva].nombre}
            </span>
            <div className={styles.faseInfoProteinas}>
              {FASES_RELOJ[faseActiva].proteinas.map((p, i) => (
                <span
                  key={p}
                  className={styles.proteinaTag}
                  style={{ background: FASES_RELOJ[faseActiva].colorProteinas[i] }}
                >
                  {p}
                </span>
              ))}
            </div>
            <p className={styles.faseInfoDesc}>{FASES_RELOJ[faseActiva].descripcion}</p>
          </div>

          {/* Slider hora */}
          <div className={styles.sliderContainer}>
            <label className={styles.sliderLabel} htmlFor="hora-slider">
              Hora del día: <strong>{horaSeleccionada}:00h</strong>
            </label>
            <input
              id="hora-slider"
              type="range"
              min={0}
              max={23}
              value={horaSeleccionada}
              onChange={(e) => setHoraSeleccionada(Number(e.target.value))}
              className={styles.slider}
              aria-label="Seleccionar hora del día"
            />
            <div className={styles.sliderTicks}>
              <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Efectos fisiológicos */}
      <h3 className={styles.subtituloSeccion}>Efectos fisiológicos controlados por el reloj</h3>
      <div className={styles.efectosGrid}>
        {EFECTOS_FISIOLOGICOS.map((ef) => (
          <div key={ef.nombre} className={styles.efectoCard}>
            <div className={styles.efectoHeader}>
              <span className={styles.efectoNombre}>{ef.nombre}</span>
              <span className={styles.efectoPico} style={{ background: ef.color }}>{ef.valor}</span>
            </div>
            <div className={styles.efectoBarra}>
              {Array.from({ length: 24 }, (_, h) => {
                // Simular curva simplificada
                const distancia = Math.min(Math.abs(h - ef.picoHora), 24 - Math.abs(h - ef.picoHora));
                const intensidad = Math.max(0, 1 - distancia / 10);
                return (
                  <div
                    key={h}
                    className={styles.efectoBarraCol}
                    style={{
                      height: `${20 + intensidad * 40}px`,
                      background: h === horaSeleccionada ? ef.color : `${ef.color}55`,
                    }}
                    title={`${h}:00h`}
                  />
                );
              })}
            </div>
            <p className={styles.efectoDesc}>{ef.descripcion}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2: Sincronizadores (Zeitgebers)
// ─────────────────────────────────────────────

function TabSincronizadores() {
  const [zeitgeberActivo, setZeitgeberActivo] = useState<number | null>(null);

  return (
    <div className={styles.tabContent}>
      <div className={styles.contexto}>
        <p>Los <strong>Zeitgebers</strong> (del alemán, «dadores de tiempo») son señales externas que sincronizan el reloj interno con el entorno. Sin ellos, el ritmo circadiano deriva unos minutos cada día hasta desincronizarse completamente.</p>
      </div>

      <div className={styles.zeitgebersGrid}>
        {ZEITGEBERS.map((z, i) => {
          const activo = zeitgeberActivo === i;
          return (
            <button
              key={z.nombre}
              type="button"
              className={`${styles.zeitgeberCard} ${activo ? styles.zeitgeberCardActivo : ''}`}
              style={{ borderColor: activo ? z.color : undefined }}
              onClick={() => setZeitgeberActivo(activo ? null : i)}
              aria-expanded={activo}
            >
              <div className={styles.zeitgeberHeader}>
                <span className={styles.zeitgeberIcono} aria-hidden="true">{z.icono}</span>
                <div className={styles.zeitgeberTituloZona}>
                  <span className={styles.zeitgeberNombre}>{z.nombre}</span>
                  <div className={styles.potenciaMedidor} aria-label={`Potencia: ${z.potencia} de 5`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className={styles.potenciaBarra}
                        style={{ background: n <= z.potencia ? z.color : 'var(--border-color)' }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {activo && (
                <div className={styles.zeitgeberDetalle}>
                  <p className={styles.zeitgeberMecanismo}>{z.mecanismo}</p>
                  <div className={styles.zeitgeberEfectos}>
                    <div className={styles.zeitgeberEfecto} style={{ borderLeftColor: '#27AE60' }}>
                      <span className={styles.zeitgeberEfectoLabel} style={{ color: '#27AE60' }}>Adelanta el reloj</span>
                      <span>{z.efectoAdelanta}</span>
                    </div>
                    <div className={styles.zeitgeberEfecto} style={{ borderLeftColor: '#E74C3C' }}>
                      <span className={styles.zeitgeberEfectoLabel} style={{ color: '#E74C3C' }}>Retrasa el reloj</span>
                      <span>{z.efectoRetrasa}</span>
                    </div>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className={styles.insight}>
        <p>
          El NSQ (núcleo supraquiasmático) coordina más de <strong>20.000 neuronas</strong> y sincroniza todos los relojes periféricos del cuerpo. Cuando los Zeitgebers son inconsistentes (ej: luz nocturna + horarios irregulares), se produce una <strong>desincronía interna</strong> entre órganos, asociada con mayor riesgo metabólico e inflamación crónica.
        </p>
      </div>

      <div className={styles.diagramaNsq}>
        <h4 className={styles.diagramaNsqTitulo}>La jerarquía circadiana</h4>
        <div className={styles.diagramaNsqFlow}>
          <div className={styles.diagramaBox} style={{ background: '#F39C12' }}>
            <span className={styles.diagramaBoxIcono} aria-hidden="true">☀️</span>
            <span>Luz (retina)</span>
          </div>
          <div className={styles.diagramaFlecha} aria-hidden="true">→</div>
          <div className={styles.diagramaBox} style={{ background: '#2E86AB' }}>
            <span className={styles.diagramaBoxIcono} aria-hidden="true">🧠</span>
            <span>NSQ</span>
          </div>
          <div className={styles.diagramaFlecha} aria-hidden="true">→</div>
          <div className={styles.diagramaRelojes}>
            <div className={styles.diagramaBox} style={{ background: '#27AE60', fontSize: '0.8rem' }}>🫀 Corazón</div>
            <div className={styles.diagramaBox} style={{ background: '#8E44AD', fontSize: '0.8rem' }}>🫁 Pulmón</div>
            <div className={styles.diagramaBox} style={{ background: '#E74C3C', fontSize: '0.8rem' }}>🫀 Hígado</div>
            <div className={styles.diagramaBox} style={{ background: '#E67E22', fontSize: '0.8rem' }}>🧫 Páncreas</div>
          </div>
        </div>
        <p className={styles.diagramaNsqNota}>Los relojes periféricos también responden directamente a la alimentación y el ejercicio, pudiendo desincronizarse del NSQ.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 3: Cronotipos
// ─────────────────────────────────────────────

function TabCronotipos() {
  const [cronotipoActivo, setCronotipoActivo] = useState<string>('colibri');

  const cronotipo = CRONOTIPOS.find((c) => c.id === cronotipoActivo) ?? CRONOTIPOS[1];
  const horas = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className={styles.tabContent}>
      <div className={styles.contexto}>
        <p>El cronotipo es la preferencia individual de fase circadiana. Tiene una base genética real y cambia con la edad. <strong>El búho crónico que madruga por obligación sufre un jet lag social permanente</strong> con consecuencias metabólicas documentadas.</p>
      </div>

      {/* Selector de cronotipos */}
      <div className={styles.cronotiposSelector}>
        {CRONOTIPOS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`${styles.cronotipoBtn} ${cronotipoActivo === c.id ? styles.cronotipoActivo : ''}`}
            style={cronotipoActivo === c.id ? { borderColor: c.color, background: `${c.color}15` } : {}}
            onClick={() => setCronotipoActivo(c.id)}
            aria-pressed={cronotipoActivo === c.id}
          >
            <span className={styles.cronotipoIcono} aria-hidden="true">{c.icono}</span>
            <span className={styles.cronotipoNombre}>{c.nombre}</span>
            <span className={styles.cronotipoPct}>{c.porcentaje}%</span>
          </button>
        ))}
      </div>

      {/* Info del cronotipo */}
      <div className={styles.cronotipoInfo}>
        <div className={styles.cronotipoHorarios}>
          <div className={styles.cronotipoHorario}>
            <span className={styles.cronotipoHorarioLabel}>Duerme</span>
            <span className={styles.cronotipoHorarioValor}>{cronotipo.horaDormir}</span>
          </div>
          <div className={styles.cronotipoHorario}>
            <span className={styles.cronotipoHorarioLabel}>Despierta</span>
            <span className={styles.cronotipoHorarioValor}>{cronotipo.horaDespertar}</span>
          </div>
          <div className={styles.cronotipoHorario}>
            <span className={styles.cronotipoHorarioLabel}>Pico cognitivo</span>
            <span className={styles.cronotipoHorarioValor}>{cronotipo.picoCognitivo}</span>
          </div>
        </div>
        <p className={styles.cronotipoDescripcion}>{cronotipo.descripcion}</p>
        <p className={styles.cronotipoMolecular}><strong>Base molecular:</strong> {cronotipo.baseMolecular}</p>
      </div>

      {/* Gráfica de curva de alerta */}
      <h3 className={styles.subtituloSeccion}>Curva de alerta y rendimiento a lo largo del día</h3>
      <div className={styles.curvaFisiologica}>
        <svg
          viewBox={`0 0 ${24 * 20} 120`}
          className={styles.curvaSvg}
          aria-label={`Curva de alerta para cronotipo ${cronotipo.nombre}`}
        >
          {/* Fondo zonas */}
          <rect x={0} y={0} width={24 * 20} height={120} fill="var(--bg-card)" />
          {/* Zona nocturna */}
          <rect x={0} y={0} width={6 * 20} height={120} fill="#1a1a2e22" />
          <rect x={22 * 20} y={0} width={2 * 20} height={120} fill="#1a1a2e22" />

          {/* Líneas de guía */}
          {[25, 50, 75, 100].map((v) => (
            <line key={v} x1={0} y1={120 - v * 1.1} x2={24 * 20} y2={120 - v * 1.1} stroke="var(--border-color)" strokeWidth="0.5" />
          ))}

          {/* Curva de alerta */}
          <polyline
            points={cronotipo.curvaAlerta.map((v, h) => `${h * 20 + 10},${120 - v * 1.1}`).join(' ')}
            fill="none"
            stroke={cronotipo.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Área bajo la curva */}
          <polygon
            points={[
              ...cronotipo.curvaAlerta.map((v, h) => `${h * 20 + 10},${120 - v * 1.1}`),
              `${23 * 20 + 10},120`,
              `10,120`,
            ].join(' ')}
            fill={`${cronotipo.color}22`}
          />

          {/* Etiquetas de hora */}
          {horas.filter((h) => h % 4 === 0).map((h) => (
            <text key={h} x={h * 20 + 10} y={118} textAnchor="middle" fontSize="8" fill="var(--text-muted)">
              {h}h
            </text>
          ))}
        </svg>
        <div className={styles.curvaLeyenda}>
          <span className={styles.curvaLeyendaItem} style={{ color: cronotipo.color }}>— Alerta ({cronotipo.nombre})</span>
        </div>
      </div>

      {/* Jet lag social */}
      <div className={styles.jetlagCard}>
        <h4 className={styles.jetlagTitulo}>Jet lag social: un problema de salud real</h4>
        <p className={styles.jetlagTexto}>
          El jet lag social ocurre cuando el horario social (trabajo, escuela) obliga a un cronotipo vespertino a madrugar sistemáticamente. El resultado es equivalente a cruzar 1-3 husos horarios cada lunes.
        </p>
        <div className={styles.jetlagEfectos}>
          <div className={styles.jetlagEfecto}>Mayor riesgo de síndrome metabólico</div>
          <div className={styles.jetlagEfecto}>Peor rendimiento cognitivo crónico</div>
          <div className={styles.jetlagEfecto}>Mayor riesgo de depresión</div>
          <div className={styles.jetlagEfecto}>Sistema inmune comprometido</div>
        </div>
        <p className={styles.jetlagNota}>
          <strong>Cambio de edad:</strong> Los adolescentes experimentan un retraso natural de fase de 2-3 horas durante la pubertad (mediado por cambios hormonales). No es pereza. Las personas mayores de 60 años suelen adelantar su fase, volviéndose más «alondra».
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 4: Cronofarmacología
// ─────────────────────────────────────────────

function TabCronofarmacologia() {
  const [filaActiva, setFilaActiva] = useState<number | null>(null);

  return (
    <div className={styles.tabContent}>
      <div className={styles.contexto}>
        <p>La <strong>cronofarmacología</strong> estudia cómo el momento de la administración afecta a la eficacia y seguridad de los fármacos. Muchos medicamentos tienen una ventana óptima de 2-4 horas con diferencias clínicas significativas.</p>
      </div>

      <div className={styles.farmaTable}>
        <div className={styles.farmaTableHeader}>
          <span>Fármaco / Grupo</span>
          <span>Mejor horario</span>
          <span className={styles.farmaTableHeaderHora}>Hora ideal</span>
        </div>
        {FARMACOS.map((f, i) => {
          const activa = filaActiva === i;
          return (
            <div key={f.nombre} className={styles.farmaRowWrapper}>
              <button
                type="button"
                className={`${styles.farmaRow} ${f.mejorMomento === 'mañana' ? styles.farmaRowManana : f.mejorMomento === 'noche' ? styles.farmaRowNoche : styles.farmaRowFlexible}`}
                onClick={() => setFilaActiva(activa ? null : i)}
                aria-expanded={activa}
              >
                <div className={styles.farmaRowNombreZona}>
                  <span className={styles.farmaRowNombre}>{f.nombre}</span>
                  <span className={styles.farmaRowEjemplos}>{f.ejemplos}</span>
                </div>
                <span className={`${styles.farmaBadge} ${f.mejorMomento === 'mañana' ? styles.farmaBadgeManana : styles.farmaBadgeNoche}`}>
                  {f.mejorMomento === 'mañana' ? '🌅 Mañana' : f.mejorMomento === 'noche' ? '🌙 Noche' : '🔄 Flexible'}
                </span>
                <span className={styles.farmaHoraIdeal}>{f.horaIdeal}</span>
              </button>
              {activa && (
                <div className={styles.farmaDetalle}>
                  <div className={styles.farmaRazon}>
                    <span className={styles.farmaRazonLabel}>Por qué</span>
                    <p>{f.razon}</p>
                  </div>
                  <div className={styles.farmaEfecto}>
                    <span className={styles.farmaEfectoLabel}>Evidencia clínica</span>
                    <p>{f.efecto}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.farmaAviso}>
        <span className={styles.farmaAvisoIcono} aria-hidden="true">⚠️</span>
        <p>
          <strong>Nota importante:</strong> La cronofarmacología está en desarrollo activo. Estas recomendaciones son orientativas y pueden variar según el fármaco concreto, su formulación (liberación inmediata vs prolongada) y el estado individual del paciente. <strong>Consulte siempre a su médico o farmacéutico</strong> antes de cambiar el horario de su medicación.
        </p>
      </div>

      <div className={styles.insight}>
        <p>
          La cronofarmacología tiene mayor impacto en <strong>fármacos con vida media corta</strong> y en <strong>procesos con ritmo circadiano marcado</strong> (PA, colesterol, inflamación alérgica). Los fármacos de liberación prolongada o con vida media larga son menos sensibles al horario de administración.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorCronobiologiaPage() {
  const [tabActiva, setTabActiva] = useState<Tab>('reloj');

  function renderTab() {
    switch (tabActiva) {
      case 'reloj': return <TabReloj />;
      case 'sincronizadores': return <TabSincronizadores />;
      case 'cronotipos': return <TabCronotipos />;
      case 'cronofarmacologia': return <TabCronofarmacologia />;
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateJsonLd()) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Cronobiología</h1>
          <p className={styles.subtitle}>Ritmos circadianos, cronotipos y cronofarmacología — tu cuerpo tiene un reloj molecular preciso</p>
        </header>

        <LegalNotice />

        {/* Barra de pestañas */}
        <nav className={styles.tabBar} aria-label="Secciones de cronobiología">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`${styles.tab} ${tabActiva === tab.id ? styles.tabActive : ''}`}
              onClick={() => setTabActiva(tab.id)}
              aria-pressed={tabActiva === tab.id}
            >
              <span className={styles.tabIcono} aria-hidden="true">{tab.icono}</span>
              <span className={styles.tabTexto}>{tab.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera de la pestaña activa */}
        <div className={styles.tabHeader}>
          <h2 className={styles.tabTitulo}>
            {TABS.find((t) => t.id === tabActiva)?.icono}{' '}
            {TABS.find((t) => t.id === tabActiva)?.titulo}
          </h2>
          <p className={styles.tabSubtitulo}>{TABS.find((t) => t.id === tabActiva)?.subtitulo}</p>
        </div>

        {renderTab()}

        <DisclaimerCard
          variant="medical"
          severity="high"
          collapsible={false}
        />

        <EducationalSection
          title="Cronobiología: el tiempo es parte de la fisiología"
          subtitle="Tu cuerpo tiene un reloj de 24 horas — ignorarlo tiene consecuencias metabólicas"
          defaultOpen={false}
        >
          <p>La cronobiología estudia los ritmos biológicos. El ritmo circadiano (~24h) es el más importante: prácticamente todos los procesos fisiológicos —temperatura, presión arterial, producción de hormonas, rendimiento cognitivo, eficacia inmune— siguen un patrón temporal preciso coordinado por el reloj molecular.</p>
          <p>El reloj maestro está en el núcleo supraquiasmático del hipotálamo, un grupo de ~20.000 neuronas que reciben luz directamente de la retina. Pero cada célula del organismo tiene su propio reloj periférico: el corazón, el hígado, el páncreas y los riñones mantienen sus propios ritmos de ~24h que el NSQ coordina.</p>
          <p>El jet lag, el trabajo nocturno crónico y el «jet lag social» (dormirse tarde el fin de semana) son perturbaciones del ritmo circadiano asociadas con mayor riesgo de síndrome metabólico, enfermedad cardiovascular, depresión y ciertos tipos de cáncer. Entender la cronobiología es entender cómo el tiempo biológico afecta a la salud.</p>

          {/* 1. TABLA COMPARATIVA DE CRONOTIPOS */}
          <h3 className={styles.eduSubtitulo}>Comparativa de los tres cronotipos</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Cronotipo</th>
                  <th>Hora despertar</th>
                  <th>Pico rendimiento</th>
                  <th>Gen asociado</th>
                  <th>% población</th>
                  <th>Mejor actividad</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>🐦 Alondra</strong></td>
                  <td>5:30–6:00h</td>
                  <td>9–12h</td>
                  <td>PER3⁴ / CRY1</td>
                  <td>~25%</td>
                  <td>Trabajo cognitivo matutino</td>
                </tr>
                <tr>
                  <td><strong>🐦‍⬛ Colibrí</strong></td>
                  <td>7:00–7:30h</td>
                  <td>11–15h</td>
                  <td>PER3 heterocigoto</td>
                  <td>~50%</td>
                  <td>Flexible; mañana y tarde</td>
                </tr>
                <tr>
                  <td><strong>🦉 Búho</strong></td>
                  <td>9:00–10:00h</td>
                  <td>15–20h</td>
                  <td>PER3⁵ / CRY1-ext</td>
                  <td>~25%</td>
                  <td>Creatividad y análisis vespertino</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. CASOS DE USO */}
          <h3 className={styles.eduSubtitulo}>Casos de uso reales</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">✈️</span>
              <h4>Persona con jet lag</h4>
              <p>Tras un vuelo transatlántico, exponer los ojos a luz solar intensa a primera hora del destino y cenar a la hora local acelera la resincronización del NSQ. Cada día de viaje requiere aproximadamente un día de adaptación.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">🌙</span>
              <h4>Trabajador nocturno</h4>
              <p>Los turnos nocturnos desacoplan el NSQ (que sigue la luz) del reloj hepático (que sigue la comida). Comer solo durante el turno activo y usar gafas de bloqueo de luz azul al volver a casa reduce el impacto metabólico.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">🏋️</span>
              <h4>Deportista optimizando rendimiento</h4>
              <p>La fuerza muscular y la capacidad aeróbica alcanzan su pico a las 17h. Un cronotipo búho que entrene a las 7h rinde un 10–15% menos que a las 17h. Ajustar el horario de entrenamiento al cronotipo mejora el rendimiento sin cambiar el volumen.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">💊</span>
              <h4>Paciente con medicación cronodependiente</h4>
              <p>Un hipertenso que toma su losartán por la mañana puede tener peor control del pico matutino de PA (6–10h). Pasarlo a las 21–22h, bajo supervisión médica, puede reducir el riesgo cardiovascular un 33% según el estudio Hygia.</p>
            </div>
          </div>

          {/* 3. FAQ */}
          <h3 className={styles.eduSubtitulo}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Qué es exactamente el ritmo circadiano?</h4>
              <p>Es un oscilador bioquímico endógeno de ~24 horas presente en prácticamente todas las células del organismo. Está generado por un bucle de retroalimentación negativa de genes (CLOCK, BMAL1, PER, CRY) que se activan e inhiben mutuamente con una periodicidad casi exacta de 24 horas, independientemente de señales externas.</p>
              <div className={styles.faqTip}>El ritmo circadiano persiste incluso en oscuridad total o ausencia de señales de tiempo externas (demostrado en experimentos de aislamiento temporal).</div>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Puedo cambiar mi cronotipo con el tiempo?</h4>
              <p>Parcialmente. El cronotipo tiene una base genética sólida, pero la edad lo modifica: los adolescentes son más búho (retraso de fase puberal), y los mayores de 60 años tienden a ser más alondra. Los hábitos de exposición a luz, horarios de comida y ejercicio pueden adelantar o retrasar la fase hasta 1–2 horas, pero no cambiar un búho extremo en alondra.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué la luz azul del móvil afecta al sueño?</h4>
              <p>Las células ipRGC de la retina contienen melanopsina, un fotopigmento especialmente sensible a la longitud de onda 460–480 nm (luz azul). Cuando la detectan, envían señal al NSQ, que suprime la secreción de melatonina por la glándula pineal. Una hora de pantalla antes de dormir puede retrasar el inicio del sueño entre 30 y 60 minutos.</p>
              <div className={styles.faqTip}>Los filtros «noche» de los dispositivos (que calientan los tonos) reducen pero no eliminan el efecto. La mejor solución es reducir el brillo total.</div>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es el jet lag social?</h4>
              <p>Es la discrepancia entre el reloj biológico y los horarios sociales (trabajo, escuela). Un búho que madruga entre semana y duerme hasta tarde el fin de semana sufre el equivalente a cruzar 1–3 husos horarios cada lunes. Está asociado con mayor riesgo de síndrome metabólico, obesidad, depresión y peor rendimiento cognitivo crónico.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿La cronofarmacología es algo real o un mito?</h4>
              <p>Es una disciplina científica consolidada con evidencia clínica sólida. El ensayo Hygia (2019, n=19.084) demostró que los antihipertensivos nocturnos reducen el riesgo cardiovascular un 33% respecto a los matutinos. La FDA y la EMA reconocen la cronofarmacología como factor relevante en el diseño de ensayos clínicos. No es alternativa ni pseudociencia.</p>
              <div className={styles.faqTip}>El efecto cronofarmacológico es mayor en fármacos con vida media corta y en procesos con ritmo circadiano marcado (PA, colesterol, inflamación alérgica).</div>
            </div>
          </div>

          {/* 4. GUÍA PASO A PASO */}
          <h3 className={styles.eduSubtitulo}>Cómo sincronizar mejor tu ritmo circadiano</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Fija tu hora de despertar (y mantenla)</h4>
                <p>El anclaje más potente del ritmo circadiano es una hora de despertar constante, incluso los fines de semana. Elige la hora según tu cronotipo real, no la impuesta socialmente. La variabilidad de más de 1 hora entre días hábiles y festivos ya genera jet lag social.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Exposición a luz solar en los primeros 30 minutos</h4>
                <p>Sal a la calle o abre ventanas nada más despertar. La luz solar de mañana (aunque sea nublada) tiene una intensidad de 10.000–50.000 lux frente a los 300–500 lux de la iluminación interior. Esto envía la señal de «es de día» más potente posible al NSQ y suprime la melatonina residual.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Mantén horarios de comida regulares</h4>
                <p>El hígado, el páncreas y el intestino tienen relojes periféricos que se sincronizan principalmente por la alimentación, no por la luz. Desayuna dentro de la hora posterior al despertar y cierra la ventana de ingesta 3 horas antes de dormir. El ayuno nocturno de 12 horas sincroniza el reloj metabólico.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Reduce la luz azul a partir de las 20:00h</h4>
                <p>Dos horas antes de tu hora habitual de dormir, baja el brillo de pantallas al mínimo y activa modos noche. Si es posible, sustitúyelos por luz cálida (velas, bombillas &lt;2700K). La oscuridad nocturna es la señal de «es de noche» que permite iniciar la secreción de melatonina.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Alinea las actividades de alto rendimiento con tu cronotipo</h4>
                <p>Identifica tu ventana de máxima alerta (ver la pestaña Cronotipos) y bloquea ese tiempo para el trabajo cognitivo más exigente. Deja reuniones rutinarias, correos y tareas administrativas para las horas de menor pico. En 2–3 semanas notarás mejora real de productividad sin cambiar horas trabajadas.</p>
              </div>
            </div>
          </div>

          {/* 5. MEJORES PRÁCTICAS */}
          <h3 className={styles.eduSubtitulo}>Mejores prácticas para un ritmo circadiano saludable</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌅</span>
              <h4>Luz matutina diaria</h4>
              <p>10–20 minutos de exposición solar antes de las 10h es el sincronizador más eficaz. En invierno o latitudes altas, considera una lámpara de fototerapia de 10.000 lux.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🍽️</span>
              <h4>Ventana de ingesta de 8–12 horas</h4>
              <p>Concentrar todas las comidas en una ventana diurna de 8–12 horas (alimentación restringida en el tiempo) mejora la sincronía entre el NSQ y los relojes metabólicos periféricos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏃</span>
              <h4>Ejercicio en tu ventana de pico</h4>
              <p>Entrena entre las 15h–19h para la mayoría de cronotipos. El ejercicio matutino también es válido, pero rinde mejor y tiene menor riesgo de lesión en la tarde para la mayoría de la población.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
              <h4>Habitación fresca para dormir</h4>
              <p>La temperatura ideal para dormir es 16–19°C. El descenso de temperatura corporal de ~1°C es una señal circadiana crítica para iniciar el sueño. Una habitación cálida lo dificulta.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📱</span>
              <h4>Pausa digital nocturna</h4>
              <p>Establece un límite de pantallas 90 minutos antes de dormir. Si no es posible, usa gafas de bloqueo de luz azul y reduce el brillo al mínimo. La notificación constante también activa el sistema de alerta, dificultando la relajación.</p>
            </div>
          </div>

          {/* 6. WARNING BOX — ERRORES COMUNES */}
          <div className={styles.warningBoxEdu}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>Errores frecuentes que dañan tu ritmo circadiano</strong>
            </div>
            <ul className={styles.warningList}>
              <li><strong>Compensar el sueño el fin de semana:</strong> dormir 2–3 horas más los sábados y domingos no recupera la deuda de sueño semanal y genera jet lag social que empeora el lunes.</li>
              <li><strong>Siestas largas o tardías:</strong> una siesta de más de 30 minutos o después de las 15h reduce la presión de sueño nocturna y retrasa el inicio del sueño. Si necesitas siesta, limítala a 20 minutos antes de las 14h.</li>
              <li><strong>Ejercicio intenso después de las 21h:</strong> eleva el cortisol y la temperatura corporal durante 2–3 horas, lo que retrasa el inicio del sueño y reduce las fases de sueño profundo.</li>
              <li><strong>Desayuno tardío o saltarse el desayuno:</strong> retrasa la señal de «inicio del día» para el reloj metabólico hepático, generando desincronía interna aunque te levantes temprano.</li>
              <li><strong>Ignorar el cronotipo en el diseño de la jornada:</strong> forzar trabajo cognitivo intenso en horas de baja alerta para tu cronotipo reduce la calidad del output. No es falta de voluntad, es fisiología.</li>
            </ul>
          </div>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> Este visualizador tiene fines exclusivamente educativos. La información sobre cronofarmacología es orientativa y no reemplaza el criterio médico individualizado. Consulte siempre a un profesional sanitario antes de modificar horarios de medicación.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-cronobiologia')} />
        <ShareCard appName="visualizador-cronobiologia" />
        <Footer appName="visualizador-cronobiologia" />
      </div>
    </>
  );
}
