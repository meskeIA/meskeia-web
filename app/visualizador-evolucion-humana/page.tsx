'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './VisualizadorEvolucionHumana.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type SeccionId = 'timeline' | 'anatomia' | 'migraciones' | 'cognitiva';

interface NavSeccion {
  id: SeccionId;
  icono: string;
  titulo: string;
  subtitulo: string;
}

interface Especie {
  id: string;
  nombre: string;
  icono: string;
  periodoMa: string;
  descripcion: string;
  cerebro: string;
  herramientas: string;
  region: string;
  extincion: string;
  xPct: number; // posición porcentual en timeline (0=7Ma, 100=hoy)
}

interface CaracteristicaAnatomica {
  id: string;
  nombre: string;
  valorAustra: string;
  valorSapiens: string;
  porcentaje: number;
  descripcion: string;
  unidad: string;
}

interface DestinoMigracion {
  id: string;
  nombre: string;
  fecha: string;
  arqueologia: string;
  cx: number;
  cy: number;
}

interface HitoCognitivo {
  id: string;
  aniosAtras: number;
  anioTexto: string;
  icono: string;
  titulo: string;
  descripcion: string;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const NAV_SECCIONES: NavSeccion[] = [
  { id: 'timeline', icono: '🦴', titulo: 'Linaje Humano', subtitulo: 'De 7 Ma a hoy' },
  { id: 'anatomia', icono: '🧬', titulo: 'Anatomía', subtitulo: 'Comparación visual' },
  { id: 'migraciones', icono: '🗺️', titulo: 'Migraciones', subtitulo: 'Out of Africa' },
  { id: 'cognitiva', icono: '🎨', titulo: 'Revolución', subtitulo: 'Cognitiva' },
];

const ESPECIES: Especie[] = [
  {
    id: 'sahelanthropus',
    nombre: 'Sahelanthropus tchadensis',
    icono: '🦴',
    periodoMa: 'Hace ~7 millones de años',
    descripcion: 'El posible ancestro más antiguo conocido de los humanos. Vivió en lo que hoy es Chad, en el Sahel africano. Tenía el cerebro pequeño (350 cc), similar al de un chimpancé, pero su foramen magnum sugiere postura erguida parcial.',
    cerebro: '~350 cc',
    herramientas: 'Sin herramientas líticas conocidas',
    region: 'Chad (África central)',
    extincion: 'Línea evolutiva que condujo al género Homo tras millones de años',
    xPct: 0,
  },
  {
    id: 'afarensis',
    nombre: 'Australopithecus afarensis',
    icono: '🦶',
    periodoMa: 'Hace 3,9 – 2,9 millones de años',
    descripcion: 'Conocido como "Lucy" (AL 288-1), encontrado en Etiopía en 1974. Fue el primer homínido confirmado como bípedo, aunque trepaba árboles. Cerebro similar al de los chimpancés actuales, pero con capacidad de marcha erguida.',
    cerebro: '~430 cc',
    herramientas: 'Sin herramientas líticas asociadas',
    region: 'África oriental (Etiopía, Tanzania)',
    extincion: 'Se extinguió hace ~2,9 Ma; dio lugar a varias especies de Australopithecus y posiblemente al género Homo',
    xPct: 14,
  },
  {
    id: 'habilis',
    nombre: 'Homo habilis',
    icono: '🪨',
    periodoMa: 'Hace 2,4 – 1,4 millones de años',
    descripcion: 'El primer miembro definitivo del género Homo. "El hombre hábil" por ser el primero en fabricar herramientas de piedra (industria olduvayense). Tenía piernas cortas y brazos largos, a medio camino entre Australopithecus y erectus.',
    cerebro: '~600 cc',
    herramientas: 'Olduvayense: lascas y choppers simples',
    region: 'África oriental y meridional',
    extincion: 'Posiblemente coexistió con Homo erectus hasta hace ~1,4 Ma, cuando desapareció',
    xPct: 27,
  },
  {
    id: 'erectus',
    nombre: 'Homo erectus',
    icono: '🔥',
    periodoMa: 'Hace 1,9 millones – 110.000 años',
    descripcion: 'El primer homínido en salir de África. Dominó el fuego (lo que transformó la dieta y extendió el día), construyó herramientas achelenses y fue el primer colonizador de Asia y el Cáucaso. Tuvo un cerebro que creció a lo largo de su existencia.',
    cerebro: '~900 cc (800–1.100)',
    herramientas: 'Achelense: bifaces, hendedores',
    region: 'África, Oriente Medio, Asia (Java, Pekín)',
    extincion: 'Desapareció hace ~110 ka; algunas poblaciones aisladas sobrevivieron más tiempo (Java ~50 ka)',
    xPct: 45,
  },
  {
    id: 'heidelbergensis',
    nombre: 'Homo heidelbergensis',
    icono: '🏠',
    periodoMa: 'Hace 700.000 – 200.000 años',
    descripcion: 'Posiblemente el ancestro común de sapiens y neandertales. Construyó los primeros refugios documentados (Bilzingsleben, Alemania) y organizó cacerías coordinadas de grandes presas. Su cerebro casi alcanzaba el de sapiens.',
    cerebro: '~1.200 cc',
    herramientas: 'Musteriense temprano, lanzas de madera (Schöningen, 400 ka)',
    region: 'África, Europa, posiblemente Asia occidental',
    extincion: 'Se escindió en dos linajes: uno que daría sapiens (en África) y otro que daría neandertales (en Europa)',
    xPct: 60,
  },
  {
    id: 'neanderthal',
    nombre: 'Homo neanderthalensis',
    icono: '❄️',
    periodoMa: 'Hace 400.000 – 40.000 años',
    descripcion: 'Los neandertales eran robustos, adaptados al frío europeo. Practicaban enterramientos rituales, usaban pigmentos, fabricaban joyas y en ocasiones crearon arte rupestre. Se hibridaron con sapiens: los europeos y asiáticos actuales llevamos un 1–4% de ADN neandertal.',
    cerebro: '~1.400–1.600 cc (¡mayor que sapiens!)',
    herramientas: 'Musteriense: raederas, puntas levallois',
    region: 'Europa, Asia occidental y central',
    extincion: 'Desaparecieron hace ~40 ka, probablemente por competencia con sapiens, cambio climático e hibridación parcial',
    xPct: 75,
  },
  {
    id: 'sapiens-arcaico',
    nombre: 'Homo sapiens arcaico',
    icono: '🧠',
    periodoMa: 'Hace ~300.000 años',
    descripcion: 'Los restos de Jebel Irhoud (Marruecos, 2017) muestran que sapiens tiene al menos 300.000 años. Anatómicamente moderno en la cara, pero con caja craneana algo más achatada que los sapiens modernos. Comparte el mundo con heidelbergensis y neandertales.',
    cerebro: '~1.350 cc',
    herramientas: 'Transición a útiles más pequeños y especializados',
    region: 'Norte de África (Marruecos)',
    extincion: 'Continuó evolucionando hacia Homo sapiens moderno cognitivamente pleno hace ~70 ka',
    xPct: 85,
  },
  {
    id: 'sapiens-moderno',
    nombre: 'Homo sapiens moderno',
    icono: '🎨',
    periodoMa: 'Hace 70.000 años – Presente',
    descripcion: 'La revolución cognitiva hace ~70 ka activó capacidades únicas: lenguaje complejo, pensamiento abstracto, mitos y creencias. Este salto permitió cooperar en grandes grupos, colonizar todos los continentes e inventar la agricultura, las ciudades y la escritura.',
    cerebro: '~1.350 cc',
    herramientas: 'Paleolítico superior: microlitos, agujas, instrumentos musicales, arte rupestre',
    region: 'Todos los continentes (colonización completa en ~15 ka)',
    extincion: 'En plena expansión. Única especie humana viva actualmente',
    xPct: 99,
  },
];

const CARACTERISTICAS_ANATOMICAS: CaracteristicaAnatomica[] = [
  {
    id: 'cerebro',
    nombre: 'Volumen cerebral',
    valorAustra: '430 cc',
    valorSapiens: '1.350 cc',
    porcentaje: 32, // 430/1350 expresado como %
    descripcion: 'El cerebro humano se triplicó en ~3 millones de años: el proceso más rápido de expansión cerebral conocido en la evolución de los mamíferos. El coste energético es alto: el cerebro consume el 20% de nuestra energía.',
    unidad: 'centímetros cúbicos',
  },
  {
    id: 'postura',
    nombre: 'Bipedalismo',
    valorAustra: 'Bípedo parcial',
    valorSapiens: 'Bípedo completo',
    porcentaje: 50,
    descripcion: 'Australopithecus afarensis caminaba erguido pero también trepaba. La pelvis corta y ancha, el foramen magnum centrado y el pie arqueado son las tres claves anatómicas del bipedalismo completo en sapiens, que permitió liberar las manos para usar herramientas.',
    unidad: 'grado de adaptación',
  },
  {
    id: 'cara',
    nombre: 'Prognatismo facial',
    valorAustra: 'Mandíbula muy saliente',
    valorSapiens: 'Cara plana y vertical',
    porcentaje: 20,
    descripcion: 'Los Australopithecus tenían mandíbulas grandes y prominentes para triturar vegetales duros. La cocción de los alimentos con fuego (Homo erectus) redujo la necesidad de dientes grandes, permitiendo que la cara se "retreara" y el cráneo se expandiera hacia arriba.',
    unidad: 'aplanamiento facial',
  },
  {
    id: 'herramientas',
    nombre: 'Complejidad tecnológica',
    valorAustra: 'Sin herramientas',
    valorSapiens: 'Paleolítico superior',
    porcentaje: 100,
    descripcion: 'La tecnología lítica evolucionó en etapas: Olduvayense (choppers simples, Homo habilis) → Achelense (bifaces, Homo erectus) → Musteriense (Neandertales) → Paleolítico Superior (herramientas compuestas, agujas, arte). Cada salto refleja un aumento cognitivo.',
    unidad: 'nivel tecnológico',
  },
];

const DESTINOS_MIGRACION: DestinoMigracion[] = [
  { id: 'africa-origen', nombre: 'África Oriental (origen)', fecha: 'Hace 300.000+ años', arqueologia: 'Jebel Irhoud (Marruecos, 300 ka), Omo Kibish (Etiopía, 195 ka)', cx: 49, cy: 55 },
  { id: 'caucaso', nombre: 'Cáucaso (Homo erectus)', fecha: 'Hace ~1,8 millones de años', arqueologia: 'Dmanisi (Georgia, 1,8 Ma): los fósiles de Homo más tempranos fuera de África', cx: 55, cy: 36 },
  { id: 'asia-sur', nombre: 'Sur de Asia', fecha: 'Hace ~65.000–70.000 años', arqueologia: 'Homo sapiens llegó siguiendo la costa del Índico; arte en cuevas de Indonesia (~44 ka)', cx: 72, cy: 50 },
  { id: 'australia', nombre: 'Australia', fecha: 'Hace ~65.000 años', arqueologia: 'Los primeros habitantes de Australia son la migración marina más antigua documentada. Lago Mungo (~40 ka)', cx: 86, cy: 68 },
  { id: 'europa', nombre: 'Europa', fecha: 'Hace ~45.000 años', arqueologia: 'Arte de Cueva de El Castillo (España, ~40,8 ka). Neandertales desaparecen ~40 ka', cx: 47, cy: 30 },
  { id: 'america', nombre: 'América', fecha: 'Hace ~15.000–20.000 años', arqueologia: 'Cruce de Beringia (tierra emergida durante glaciación). Monte Verde (Chile, ~14,5 ka)', cx: 18, cy: 45 },
];

const HITOS_COGNITIVOS: HitoCognitivo[] = [
  { id: 'revolucion', aniosAtras: 70000, anioTexto: 'Hace 70.000 años', icono: '💡', titulo: 'Revolución Cognitiva', descripcion: 'El momento en que Homo sapiens adquirió capacidad de lenguaje complejo, pensamiento abstracto y transmisión cultural acumulativa. Permitió crear mitos, religión y cooperación entre desconocidos.' },
  { id: 'australia-coloniz', aniosAtras: 60000, anioTexto: 'Hace 60.000 años', icono: '🚣', titulo: 'Colonización de Australia', descripcion: 'Primera migración marítima documentada: sapiens cruzó 80 km de mar abierto para llegar a Australia/Nueva Guinea. Requería planificación, embarcaciones y cooperación en grupo.' },
  { id: 'arte', aniosAtras: 40000, anioTexto: 'Hace 40.000 años', icono: '🖼️', titulo: 'Arte rupestre', descripcion: 'La cueva de El Castillo (Cantabria, España) alberga los signos más antiguos conocidos: un disco rojo datado en 40.800 años. El arte es evidencia de pensamiento simbólico pleno.' },
  { id: 'arco', aniosAtras: 20000, anioTexto: 'Hace 20.000 años', icono: '🏹', titulo: 'Arco y flecha', descripcion: 'La caza a distancia transformó la economía de caza-recolección: mayor seguridad, mayor rendimiento y posibilidad de cazar especies que antes no podían abordarse cuerpo a cuerpo.' },
  { id: 'agricultura', aniosAtras: 12000, anioTexto: 'Hace 12.000 años', icono: '🌾', titulo: 'Revolución Neolítica', descripcion: 'Agricultura y ganadería en el Creciente Fértil (actual Iraq-Siria-Turquía). Permitió poblaciones sedentarias, excedente de alimento, especialización y primeras ciudades.' },
  { id: 'escritura', aniosAtras: 6000, anioTexto: 'Hace 6.000 años', icono: '📝', titulo: 'Escritura cuneiforme', descripcion: 'Inventada en Sumeria (Mesopotamia) para registros comerciales. La escritura permitió transmitir información con precisión entre generaciones y a distancia: el nacimiento de la Historia.' },
  { id: 'ciudades', aniosAtras: 5000, anioTexto: 'Hace 5.000 años', icono: '🏛️', titulo: 'Primeras ciudades', descripcion: 'Ur y Uruk (Mesopotamia) alcanzaron decenas de miles de habitantes. Surgieron la ley, el comercio a larga distancia, la moneda, la religión organizada y el Estado como estructura política.' },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorEvolucionHumana() {
  const [seccionActiva, setSeccionActiva] = useState<SeccionId>('timeline');
  const [especieSeleccionada, setEspecieSeleccionada] = useState<string>('afarensis');
  const [caracteristicaActiva, setCaracteristicaActiva] = useState<string>('cerebro');
  const [destinoSeleccionado, setDestinoSeleccionado] = useState<string | null>(null);
  const [hitoActivo, setHitoActivo] = useState<string | null>(null);
  const [sliderAnios, setSliderAnios] = useState<number>(70000);

  const handleEspecie = useCallback((id: string) => {
    setEspecieSeleccionada(id);
  }, []);

  const handleDestino = useCallback((id: string) => {
    setDestinoSeleccionado(prev => prev === id ? null : id);
  }, []);

  const handleHito = useCallback((id: string) => {
    setHitoActivo(prev => prev === id ? null : id);
  }, []);

  const handleSlider = useCallback((valor: number) => {
    setSliderAnios(valor);
    // Encontrar el hito más cercano al slider
    const masProximo = HITOS_COGNITIVOS.reduce((prev, curr) =>
      Math.abs(curr.aniosAtras - valor) < Math.abs(prev.aniosAtras - valor) ? curr : prev
    );
    setHitoActivo(masProximo.id);
  }, []);

  const especieActual = ESPECIES.find(e => e.id === especieSeleccionada) ?? ESPECIES[1];
  const caracteristicaActual = CARACTERISTICAS_ANATOMICAS.find(c => c.id === caracteristicaActiva) ?? CARACTERISTICAS_ANATOMICAS[0];
  const destinoActual = DESTINOS_MIGRACION.find(d => d.id === destinoSeleccionado);

  const appsRelacionadas = getRelatedApps('visualizador-evolucion-humana');

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge} aria-hidden="true">Paleoantropología</span>
          <h1 className={styles.heroTitle}>Evolución Humana</h1>
          <p className={styles.heroSubtitle}>De Lucy a Homo sapiens: 7 millones de años de historia</p>
          <p className={styles.heroDesc}>
            Explora el linaje humano, las migraciones Out of Africa y la revolución cognitiva que nos convirtió en la especie que somos.
          </p>
        </div>
      </header>

      <LegalNotice />

      {/* Navegación de secciones */}
      <nav aria-label="Secciones del visualizador">
        <div className={styles.navSecciones}>
          {NAV_SECCIONES.map(sec => (
            <button
              key={sec.id}
              className={`${styles.navBtn} ${seccionActiva === sec.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(sec.id)}
              aria-pressed={seccionActiva === sec.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{sec.icono}</span>
              <span className={styles.navTexto}>{sec.titulo}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ─── SECCIÓN 1: LINAJE HUMANO ─── */}
      {seccionActiva === 'timeline' && (
        <section className={styles.section} aria-label="Linaje humano — timeline">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon} aria-hidden="true">🦴</div>
            <h2 className={styles.sectionTitle}>Linaje Humano</h2>
            <p className={styles.sectionSubtitle}>8 especies clave en 7 millones de años de evolución</p>
          </div>

          {/* Timeline SVG */}
          <div className={styles.timelineWrap}>
            <svg
              className={styles.timelineSvg}
              viewBox="0 0 700 160"
              aria-label="Timeline del linaje humano de 7 millones de años atrás hasta hoy"
            >
              {/* Línea base */}
              <line x1="30" y1="100" x2="680" y2="100" stroke="#2E86AB" strokeWidth="3" strokeLinecap="round" />
              {/* Etiquetas de escala */}
              <text x="30" y="130" fontSize="9" fill="#999">7 Ma</text>
              <text x="175" y="130" fontSize="9" fill="#999">5 Ma</text>
              <text x="320" y="130" fontSize="9" fill="#999">3 Ma</text>
              <text x="465" y="130" fontSize="9" fill="#999">1 Ma</text>
              <text x="630" y="130" fontSize="9" fill="#999">Hoy</text>
              {/* Marcas de escala */}
              {[30, 175, 320, 465, 640].map(x => (
                <line key={x} x1={x} y1="95" x2={x} y2="107" stroke="#999" strokeWidth="1" />
              ))}
              {/* Puntos de especie */}
              {ESPECIES.map((esp) => {
                const cx = 30 + (esp.xPct / 100) * 650;
                const isActive = esp.id === especieSeleccionada;
                return (
                  <g key={esp.id}>
                    <circle
                      cx={cx}
                      cy={100}
                      r={isActive ? 12 : 8}
                      fill={isActive ? '#2E86AB' : '#48A9A6'}
                      stroke="white"
                      strokeWidth="2"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleEspecie(esp.id)}
                      role="button"
                      tabIndex={0}
                      aria-label={`${esp.nombre}: ${esp.periodoMa}`}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleEspecie(esp.id); }}
                    />
                    <text
                      x={cx}
                      y={isActive ? 78 : 82}
                      textAnchor="middle"
                      fontSize={isActive ? '14' : '11'}
                      style={{ userSelect: 'none', pointerEvents: 'none' }}
                    >
                      {esp.icono}
                    </text>
                    {isActive && (
                      <text x={cx} y={125} textAnchor="middle" fontSize="8" fill="#2E86AB" fontWeight="bold" style={{ userSelect: 'none', pointerEvents: 'none' }}>
                        ▲
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Grid de selección de especie */}
          <div className={styles.especiesGrid} role="list">
            {ESPECIES.map(esp => (
              <button
                key={esp.id}
                className={`${styles.especieCard} ${esp.id === especieSeleccionada ? styles.especieCardActiva : ''}`}
                onClick={() => handleEspecie(esp.id)}
                role="listitem"
                aria-pressed={esp.id === especieSeleccionada}
              >
                <div className={styles.especieIcono} aria-hidden="true">{esp.icono}</div>
                <div className={styles.especieNombre}>{esp.nombre.split(' ').slice(0, 2).join(' ')}</div>
                <div className={styles.especieFecha}>{esp.periodoMa.split(' ').slice(1, 3).join(' ')}</div>
              </button>
            ))}
          </div>

          {/* Panel de detalle */}
          <div className={styles.especieDetalle} aria-live="polite" aria-atomic="true">
            <div className={styles.especieDetalleHeader}>
              <span className={styles.especieDetalleIcono} aria-hidden="true">{especieActual.icono}</span>
              <div>
                <h3 className={styles.especieDetalleTitulo}>{especieActual.nombre}</h3>
                <p className={styles.especieDetallePeriodo}>{especieActual.periodoMa}</p>
              </div>
            </div>
            <p className={styles.especieDetalleDesc}>{especieActual.descripcion}</p>
            <div className={styles.especieDetalleGrid}>
              <div className={styles.especieDetalleDato}>
                <div className={styles.especieDetalleDatoLabel}>Volumen cerebral</div>
                <div className={styles.especieDetalleDatoValor}>{especieActual.cerebro}</div>
              </div>
              <div className={styles.especieDetalleDato}>
                <div className={styles.especieDetalleDatoLabel}>Tecnología</div>
                <div className={styles.especieDetalleDatoValor}>{especieActual.herramientas}</div>
              </div>
              <div className={styles.especieDetalleDato}>
                <div className={styles.especieDetalleDatoLabel}>Región geográfica</div>
                <div className={styles.especieDetalleDatoValor}>{especieActual.region}</div>
              </div>
              <div className={styles.especieDetalleDato}>
                <div className={styles.especieDetalleDatoLabel}>Extinción o continuidad</div>
                <div className={styles.especieDetalleDatoValor}>{especieActual.extincion}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── SECCIÓN 2: ANATOMÍA COMPARATIVA ─── */}
      {seccionActiva === 'anatomia' && (
        <section className={styles.section} aria-label="Anatomía comparativa">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon} aria-hidden="true">🧬</div>
            <h2 className={styles.sectionTitle}>Anatomía Comparativa</h2>
            <p className={styles.sectionSubtitle}>Australopithecus afarensis vs Homo sapiens</p>
          </div>

          <nav aria-label="Características anatómicas" className={styles.anatomiaNav}>
            {CARACTERISTICAS_ANATOMICAS.map(c => (
              <button
                key={c.id}
                className={`${styles.anatomiaNavBtn} ${caracteristicaActiva === c.id ? styles.anatomiaNavBtnActivo : ''}`}
                onClick={() => setCaracteristicaActiva(c.id)}
                aria-pressed={caracteristicaActiva === c.id}
              >
                {c.nombre}
              </button>
            ))}
          </nav>

          <div className={styles.anatomiaCard} aria-live="polite">
            <h3 className={styles.anatomiaCardTitulo}>{caracteristicaActual.nombre}</h3>
            <div className={styles.anatomiaCompara}>
              <div className={styles.anatomiaEspecie}>
                <div className={styles.anatomiaEspecieName}>Australopithecus</div>
                <div className={styles.anatomiaValor}>{caracteristicaActual.valorAustra}</div>
              </div>
              <div className={styles.anatomiaFlecha} aria-hidden="true">→</div>
              <div className={styles.anatomiaEspecie}>
                <div className={styles.anatomiaEspecieName}>Homo sapiens</div>
                <div className={styles.anatomiaValor}>{caracteristicaActual.valorSapiens}</div>
              </div>
            </div>
            <div className={styles.anatomiaBarraWrap}>
              <div className={styles.anatomiaBarraLabel}>
                <span>Australopithecus (base)</span>
                <span>Homo sapiens (actual)</span>
              </div>
              <div
                className={styles.anatomiaBarraFondo}
                role="progressbar"
                aria-valuenow={caracteristicaActual.porcentaje}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${caracteristicaActual.nombre}: ${caracteristicaActual.porcentaje}% del valor de Homo sapiens en Australopithecus`}
              >
                <div
                  className={styles.anatomiaBarraRelleno}
                  style={{ width: `${caracteristicaActual.porcentaje}%` }}
                />
              </div>
            </div>
            <p className={styles.anatomiaDesc}>{caracteristicaActual.descripcion}</p>
          </div>
        </section>
      )}

      {/* ─── SECCIÓN 3: MIGRACIONES ─── */}
      {seccionActiva === 'migraciones' && (
        <section className={styles.section} aria-label="Migraciones Out of Africa">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon} aria-hidden="true">🗺️</div>
            <h2 className={styles.sectionTitle}>Migraciones Out of Africa</h2>
            <p className={styles.sectionSubtitle}>Cómo los humanos colonizaron el mundo</p>
          </div>

          <div className={styles.migracionWrap}>
            {/* Mapa SVG simplificado */}
            <svg
              className={styles.migracionSvg}
              viewBox="0 0 100 75"
              aria-label="Mapa del mundo con rutas de migración humana"
              role="img"
            >
              {/* Fondo agua */}
              <rect width="100" height="75" fill="#c8e6f5" />

              {/* Continentes simplificados */}
              {/* América del Norte */}
              <path d="M5,15 L22,12 L25,25 L20,40 L15,45 L8,40 L5,30 Z" fill="#d4c5a0" stroke="#b0a080" strokeWidth="0.3" />
              {/* América del Sur */}
              <path d="M15,45 L25,42 L28,55 L22,68 L15,65 L12,55 Z" fill="#d4c5a0" stroke="#b0a080" strokeWidth="0.3" />
              {/* Europa */}
              <path d="M40,15 L55,12 L58,22 L50,28 L42,26 Z" fill="#d4c5a0" stroke="#b0a080" strokeWidth="0.3" />
              {/* África */}
              <path d="M40,28 L58,25 L62,42 L56,58 L48,62 L40,55 L36,42 Z" fill="#d4c5a0" stroke="#b0a080" strokeWidth="0.3" />
              {/* Asia */}
              <path d="M55,12 L90,10 L92,30 L80,35 L65,38 L55,35 L52,22 Z" fill="#d4c5a0" stroke="#b0a080" strokeWidth="0.3" />
              {/* Oriente Medio */}
              <path d="M55,28 L68,26 L70,38 L58,40 Z" fill="#d4c5a0" stroke="#b0a080" strokeWidth="0.3" />
              {/* Australia */}
              <path d="M80,50 L95,48 L96,62 L84,65 L78,60 Z" fill="#d4c5a0" stroke="#b0a080" strokeWidth="0.3" />

              {/* ── Rutas de migración ── */}
              {/* Primera salida Homo erectus (naranja) */}
              <path d="M49,50 Q56,38 55,30 Q60,28 68,30" fill="none" stroke="#E67E22" strokeWidth="1.2" strokeDasharray="2,1" opacity="0.8" />
              <path d="M68,30 Q80,25 88,22" fill="none" stroke="#E67E22" strokeWidth="1.2" strokeDasharray="2,1" opacity="0.8" />

              {/* Segunda salida sapiens: sur Asia / Australia (azul) */}
              <path d="M49,50 Q56,44 65,42 Q73,44 80,52" fill="none" stroke="#2E86AB" strokeWidth="1.5" opacity="0.9" />

              {/* Sapiens a Europa (verde) */}
              <path d="M49,50 Q50,38 47,25" fill="none" stroke="#48A9A6" strokeWidth="1.5" opacity="0.9" />

              {/* Sapiens a América (morado) */}
              <path d="M25,18 Q20,25 18,35" fill="none" stroke="#8E44AD" strokeWidth="1.5" opacity="0.9" />

              {/* Puente Bering */}
              <path d="M88,14 Q92,12 95,16 Q98,19 25,18" fill="none" stroke="#8E44AD" strokeWidth="1" strokeDasharray="2,1" opacity="0.7" />

              {/* Puntos de destino */}
              {DESTINOS_MIGRACION.map(dest => (
                <g key={dest.id} onClick={() => handleDestino(dest.id)} style={{ cursor: 'pointer' }}>
                  <circle
                    cx={dest.cx}
                    cy={dest.cy}
                    r={destinoSeleccionado === dest.id ? 3.5 : 2.5}
                    fill={destinoSeleccionado === dest.id ? '#2E86AB' : '#E74C3C'}
                    stroke="white"
                    strokeWidth="0.5"
                  />
                  <circle cx={dest.cx} cy={dest.cy} r={6} fill="transparent" />
                </g>
              ))}
            </svg>

            {/* Leyenda */}
            <div className={styles.migracionLeyenda}>
              <div className={styles.migracionLeyendaItem}>
                <div className={styles.migracionLeyendaDot} style={{ background: '#E67E22' }} />
                <span>Homo erectus (~1,8 Ma)</span>
              </div>
              <div className={styles.migracionLeyendaItem}>
                <div className={styles.migracionLeyendaDot} style={{ background: '#2E86AB' }} />
                <span>Sapiens Asia/Australia (~70–65 ka)</span>
              </div>
              <div className={styles.migracionLeyendaItem}>
                <div className={styles.migracionLeyendaDot} style={{ background: '#48A9A6' }} />
                <span>Sapiens Europa (~45 ka)</span>
              </div>
              <div className={styles.migracionLeyendaItem}>
                <div className={styles.migracionLeyendaDot} style={{ background: '#8E44AD' }} />
                <span>Sapiens América (~15 ka)</span>
              </div>
            </div>

            <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Toca los puntos rojos del mapa para ver detalles arqueológicos
            </p>
          </div>

          {/* Panel de destino seleccionado */}
          {destinoActual && (
            <div className={styles.migracionDestinoInfo} aria-live="polite">
              <h3 className={styles.migracionDestinoTitulo}>{destinoActual.nombre}</h3>
              <p className={styles.migracionDestinoDesc}>
                <strong>{destinoActual.fecha}</strong> — {destinoActual.arqueologia}
              </p>
            </div>
          )}
        </section>
      )}

      {/* ─── SECCIÓN 4: REVOLUCIÓN COGNITIVA ─── */}
      {seccionActiva === 'cognitiva' && (
        <section className={styles.section} aria-label="Revolución cognitiva">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon} aria-hidden="true">🎨</div>
            <h2 className={styles.sectionTitle}>La Revolución Cognitiva</h2>
            <p className={styles.sectionSubtitle}>70.000 años de saltos culturales de Homo sapiens</p>
          </div>

          {/* Slider de años */}
          <div className={styles.sliderWrap}>
            <div className={styles.sliderLabel}>
              <span>Hace {sliderAnios.toLocaleString('es-ES')} años</span>
              <span>Mueve para explorar hitos</span>
            </div>
            <input
              type="range"
              className={styles.sliderInput}
              min={5000}
              max={70000}
              step={1000}
              value={sliderAnios}
              onChange={e => handleSlider(Number(e.target.value))}
              aria-label="Selecciona el período de la revolución cognitiva"
            />
            <div className={styles.sliderLabel}>
              <span>Hace 5.000 años (ciudades)</span>
              <span>Hace 70.000 años (revolución cognitiva)</span>
            </div>
          </div>

          {/* Timeline de hitos */}
          <div className={styles.hitosTimeline}>
            {HITOS_COGNITIVOS.map(hito => (
              <div
                key={hito.id}
                className={`${styles.hitoCard} ${hitoActivo === hito.id ? styles.hitoCardActivo : ''}`}
                onClick={() => handleHito(hito.id)}
                role="button"
                tabIndex={0}
                aria-expanded={hitoActivo === hito.id}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleHito(hito.id); }}
              >
                <div className={styles.hitoHeader}>
                  <span className={styles.hitoIcono} aria-hidden="true">{hito.icono}</span>
                  <div className={styles.hitoMeta}>
                    <div className={styles.hitoAnio}>{hito.anioTexto}</div>
                    <h3 className={styles.hitoTitulo}>{hito.titulo}</h3>
                  </div>
                </div>
                {hitoActivo === hito.id && (
                  <p className={styles.hitoDesc}>{hito.descripcion}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── SECCIÓN EDUCATIVA ─── */}
      <EducationalSection title="¿Qué nos dice la paleoantropología?" subtitle="Evolución, Neandertales, ADN y métodos de datación">
        <h3>Evolución biológica vs. evolución cultural</h3>
        <p>
          La evolución biológica (cambios en el ADN por selección natural) opera en miles de generaciones. La evolución cultural (transmisión de conocimiento, tecnología y normas sociales) opera en una sola vida. Desde hace ~70.000 años, la evolución cultural de sapiens avanza mucho más rápido que la biológica: nuestro ADN apenas ha cambiado desde entonces, pero hemos pasado de lanzas a satélites.
        </p>

        <h3>¿Por qué se extinguieron los Neandertales?</h3>
        <p>
          No hay una respuesta definitiva. Las hipótesis más aceptadas son: (1) competencia con sapiens por recursos, (2) reducción de su hábitat por el cambio climático (período frío), y (3) hibridación gradual: los neandertales no desaparecieron del todo; sus genes sobreviven en el 1–4% del genoma de europeos y asiáticos actuales. Algunos genes neandertales relacionados con el sistema inmune siguen siendo beneficiosos hoy.
        </p>

        <h3>El ADN neandertal en ti</h3>
        <p>
          Los europeos y asiáticos llevamos un 1–4% de ADN neandertal. Este ADN afecta rasgos reales: mayor resistencia a ciertas enfermedades (variantes inmunes), metabolismo lipídico, y algunos aspectos del pelo y la piel. Sin embargo, también se asocia con mayor susceptibilidad a la depresión y a la nicotina. Los africanos subsaharianos, cuya línea nunca se cruzó con neandertales fuera de África, tienen menos de este ADN.
        </p>

        <h3>El "eslabón perdido" que ya no es perdido</h3>
        <p>
          Durante el siglo XIX se usó el término "eslabón perdido" para describir la brecha entre simios y humanos. Hoy esa brecha está cubierta por decenas de fósiles: Sahelanthropus (7 Ma), Orrorin (6 Ma), Ardipithecus (5,6 Ma), Australopithecus (4–2 Ma), Homo habilis, Homo ergaster, Homo erectus... El árbol evolutivo humano es complejo, ramificado y bien documentado.
        </p>

        <h3>¿Cómo sabemos la antigüedad de los fósiles?</h3>
        <p>
          Los métodos principales son: <strong>Carbono-14</strong> (C-14): útil hasta ~50.000 años, basado en la desintegración radiactiva del carbono orgánico. <strong>Potasio-argón</strong> (K-Ar): para fósiles en estratos volcánicos, valioso hasta millones de años. <strong>Paleomagnetismo</strong>: el campo magnético terrestre se invierte periódicamente; los estratos quedan "marcados" con la polaridad del momento. <strong>Estratigrafía</strong>: los estratos más profundos son más antiguos (principio de superposición).
        </p>

        <div className={styles.warningBox}>
          <strong>Conexiones:</strong> Para explorar los mecanismos evolutivos que impulsaron estos cambios, visita el Visualizador de Selección Natural. Para entender cómo el ADN codifica la información genética que distingue a cada especie, visita el Visualizador de ADN y Código Genético.
        </div>
      </EducationalSection>

      <RelatedApps apps={appsRelacionadas} />
      <ShareCard appName="visualizador-evolucion-humana" />
      <Footer appName="visualizador-evolucion-humana" />
    </div>
  );
}
