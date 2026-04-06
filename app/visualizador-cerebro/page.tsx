'use client';

import { useState } from 'react';
import styles from './VisualizadorCerebro.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'maquina' | 'recuerdo' | 'plasticidad' | 'ilusiones';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'maquina', titulo: 'La máquina', icono: '🧠', subtitulo: 'La máquina más compleja del universo' },
  { id: 'recuerdo', titulo: 'Recuerdos', icono: '💾', subtitulo: 'Cómo se forma un recuerdo' },
  { id: 'plasticidad', titulo: 'Neuroplasticidad', icono: '🔄', subtitulo: 'Tu cerebro se recablea' },
  { id: 'ilusiones', titulo: 'Ilusiones', icono: '👁️', subtitulo: 'Trucos que te engañan' },
];

// ─────────────────────────────────────────────
// Sección 1: La máquina
// ─────────────────────────────────────────────

interface LobuloInfo {
  id: string;
  nombre: string;
  color: string;
  colorDark: string;
  funciones: string[];
  dato: string;
  posicion: string;
}

const LOBULOS: LobuloInfo[] = [
  {
    id: 'frontal',
    nombre: 'Lóbulo frontal',
    color: '#E74C3C',
    colorDark: '#C0392B',
    funciones: ['Planificación', 'Toma de decisiones', 'Personalidad', 'Control de impulsos', 'Habla (área de Broca)'],
    dato: 'Es el más grande. Se desarrolla completamente hacia los 25 años.',
    posicion: 'top: 10%; left: 18%; width: 42%; height: 35%;',
  },
  {
    id: 'parietal',
    nombre: 'Lóbulo parietal',
    color: '#3498DB',
    colorDark: '#2980B9',
    funciones: ['Tacto y dolor', 'Orientación espacial', 'Cálculo matemático', 'Integración sensorial'],
    dato: 'Crea tu mapa corporal: sabe dónde está cada parte de tu cuerpo.',
    posicion: 'top: 8%; left: 55%; width: 30%; height: 30%;',
  },
  {
    id: 'temporal',
    nombre: 'Lóbulo temporal',
    color: '#27AE60',
    colorDark: '#1E8449',
    funciones: ['Audición', 'Comprensión del lenguaje (Wernicke)', 'Memoria a largo plazo', 'Reconocimiento facial'],
    dato: 'Contiene el hipocampo, esencial para formar nuevos recuerdos.',
    posicion: 'top: 50%; left: 12%; width: 35%; height: 30%;',
  },
  {
    id: 'occipital',
    nombre: 'Lóbulo occipital',
    color: '#9B59B6',
    colorDark: '#7D3C98',
    funciones: ['Visión', 'Procesamiento de color', 'Reconocimiento de formas', 'Percepción de movimiento'],
    dato: 'Aunque está atrás, procesa todo lo que ves. Un golpe aquí puede causar ceguera.',
    posicion: 'top: 42%; left: 68%; width: 22%; height: 28%;',
  },
];

function SeccionMaquina() {
  const [lobuloActivo, setLobuloActivo] = useState<string | null>(null);
  const lobuloSeleccionado = LOBULOS.find(l => l.id === lobuloActivo);

  const cifras = [
    { valor: formatNumber(86000, 0), unidad: 'millones', label: 'Neuronas', icono: '⚡' },
    { valor: formatNumber(150, 0), unidad: 'billones', label: 'Sinapsis (conexiones)', icono: '🔗' },
    { valor: '2%', unidad: 'del peso corporal', label: 'Solo ~1,4 kg', icono: '⚖️' },
    { valor: '20%', unidad: 'de la energía', label: 'Consumo energético', icono: '🔋' },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Tu cerebro tiene <strong>{formatNumber(86000, 0)} millones de neuronas</strong> conectadas por <strong>150 billones de sinapsis</strong>. Pesa solo el 2% de tu cuerpo, pero consume el 20% de tu energía.</p>
      </div>

      {/* Cifras clave */}
      <div className={styles.cifrasGrid}>
        {cifras.map((c, i) => (
          <div key={i} className={styles.cifraCard}>
            <span className={styles.cifraIcono} aria-hidden="true">{c.icono}</span>
            <span className={styles.cifraValor}>{c.valor}</span>
            <span className={styles.cifraUnidad}>{c.unidad}</span>
            <span className={styles.cifraLabel}>{c.label}</span>
          </div>
        ))}
      </div>

      {/* Mapa cerebral clickable */}
      <div className={styles.cerebroMapa}>
        <h3 className={styles.cerebroMapaTitulo}>Toca un lóbulo para explorar</h3>
        <div className={styles.cerebroVisual}>
          {/* Silueta cerebral con regiones clickables */}
          <div className={styles.cerebroSilueta}>
            {LOBULOS.map(l => {
              const posObj: Record<string, string> = {};
              l.posicion.split(';').forEach(p => {
                const [key, val] = p.split(':').map(s => s.trim());
                if (key && val) posObj[key] = val;
              });
              return (
                <button
                  key={l.id}
                  type="button"
                  className={`${styles.lobuloBtn} ${lobuloActivo === l.id ? styles.lobuloActivo : ''}`}
                  style={{
                    ...posObj,
                    backgroundColor: lobuloActivo === l.id ? l.color : `${l.color}44`,
                    borderColor: l.color,
                  } as React.CSSProperties}
                  onClick={() => setLobuloActivo(lobuloActivo === l.id ? null : l.id)}
                  aria-pressed={lobuloActivo === l.id}
                  aria-label={`${l.nombre}: toca para ver funciones`}
                >
                  <span className={styles.lobuloNombre}>{l.nombre.replace('Lóbulo ', '')}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detalle del lóbulo seleccionado */}
        {lobuloSeleccionado && (
          <div className={styles.lobuloDetalle} style={{ borderLeftColor: lobuloSeleccionado.color }}>
            <h4 className={styles.lobuloDetalleTitulo} style={{ color: lobuloSeleccionado.color }}>
              {lobuloSeleccionado.nombre}
            </h4>
            <ul className={styles.lobuloFunciones}>
              {lobuloSeleccionado.funciones.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
            <p className={styles.lobuloDato}>{lobuloSeleccionado.dato}</p>
          </div>
        )}
      </div>

      {/* Comparaciones */}
      <div className={styles.comparacionesCard}>
        <h3 className={styles.comparacionesTitulo}>Tu cerebro vs. un ordenador</h3>
        <div className={styles.comparacionesGrid}>
          <div className={styles.comparacionItem}>
            <span className={styles.comparacionCategoria}>Velocidad</span>
            <div className={styles.comparacionDual}>
              <span className={styles.comparacionCerebro}><span aria-hidden="true">🧠</span> 120 m/s (señal nerviosa)</span>
              <span className={styles.comparacionPC}><span aria-hidden="true">💻</span> 300.000 km/s (eléctrica)</span>
            </div>
          </div>
          <div className={styles.comparacionItem}>
            <span className={styles.comparacionCategoria}>Consumo</span>
            <div className={styles.comparacionDual}>
              <span className={styles.comparacionCerebro}><span aria-hidden="true">🧠</span> 20 vatios (una bombilla)</span>
              <span className={styles.comparacionPC}><span aria-hidden="true">💻</span> 300+ vatios (GPU moderna)</span>
            </div>
          </div>
          <div className={styles.comparacionItem}>
            <span className={styles.comparacionCategoria}>Almacenamiento</span>
            <div className={styles.comparacionDual}>
              <span className={styles.comparacionCerebro}><span aria-hidden="true">🧠</span> ~2,5 petabytes estimados</span>
              <span className={styles.comparacionPC}><span aria-hidden="true">💻</span> ~1-4 TB (disco duro típico)</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Tu cerebro es <strong>más lento</strong> que un ordenador en cálculos puros, pero incomparablemente superior en <strong>reconocimiento de patrones, creatividad y eficiencia energética</strong>. Con solo 20 vatios hace lo que requiere centros de datos enteros.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Cómo se forma un recuerdo
// ─────────────────────────────────────────────

function SeccionRecuerdo() {
  const [faseActiva, setFaseActiva] = useState(0);

  const fases = [
    {
      icono: '📥',
      titulo: 'Codificación',
      descripcion: 'Tus sentidos captan información y la convierten en señales eléctricas. El hipocampo decide qué merece recordarse.',
      detalle: 'Factores que mejoran la codificación: atención (sin móvil), emoción (recuerdos emocionales se fijan mejor), repetición y conexión con conocimientos previos.',
      color: '#E74C3C',
    },
    {
      icono: '🗄️',
      titulo: 'Almacenamiento',
      descripcion: 'Las sinapsis se fortalecen por repetición (potenciación a largo plazo). El recuerdo pasa de corto a largo plazo, principalmente durante el sueño.',
      detalle: 'Durante el sueño profundo (ondas lentas), el hipocampo "reproduce" los eventos del día y los transfiere a la corteza cerebral. Por eso dormir después de estudiar funciona.',
      color: '#2E86AB',
    },
    {
      icono: '🔍',
      titulo: 'Recuperación',
      descripcion: 'Reactivar el patrón de sinapsis original. Cada vez que recuerdas algo, lo reconstruyes (no lo reproduces como un vídeo).',
      detalle: 'Por eso los recuerdos cambian con el tiempo: cada recuperación los modifica ligeramente. Los testigos oculares son menos fiables de lo que crees.',
      color: '#48A9A6',
    },
  ];

  const tiposMemoria = [
    {
      titulo: 'Memoria sensorial',
      duracion: '0,2 - 3 segundos',
      capacidad: 'Muy alta',
      ejemplo: 'La imagen residual al cerrar los ojos',
      icono: '👀',
    },
    {
      titulo: 'Memoria a corto plazo',
      duracion: '15 - 30 segundos',
      capacidad: '7 ± 2 elementos',
      ejemplo: 'Un número de teléfono que acabas de oír',
      icono: '📝',
    },
    {
      titulo: 'Memoria de trabajo',
      duracion: 'Mientras la uses',
      capacidad: '3 - 5 elementos activos',
      ejemplo: 'Hacer cálculos mentales, seguir una conversación',
      icono: '⚙️',
    },
    {
      titulo: 'Memoria a largo plazo',
      duracion: 'Días a toda la vida',
      capacidad: 'Prácticamente ilimitada',
      ejemplo: 'Tu nombre, montar en bici, el día de tu boda',
      icono: '🏛️',
    },
  ];

  const razonesOlvido = [
    { titulo: 'Decaimiento', desc: 'Las conexiones sinápticas se debilitan sin uso. Curva de Ebbinghaus: olvidas el 70% en 24 horas sin repaso.', icono: '📉' },
    { titulo: 'Interferencia', desc: 'Nuevos recuerdos compiten con los antiguos (proactiva) o los nuevos borran los viejos (retroactiva).', icono: '🔀' },
    { titulo: 'Fallo de recuperación', desc: 'El recuerdo está ahí, pero no encuentras la "pista" para acceder. Como un archivo sin nombre en tu ordenador.', icono: '🔐' },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Recordar no es como grabar un vídeo. Tu cerebro <strong>reconstruye</strong> cada recuerdo activamente, y el proceso tiene tres fases claras.</p>
      </div>

      {/* Diagrama de flujo de fases */}
      <div className={styles.fasesFlow}>
        {fases.map((f, i) => (
          <div key={i} className={styles.faseGroup}>
            <button
              type="button"
              className={`${styles.faseBtn} ${faseActiva === i ? styles.faseActiva : ''}`}
              style={{ borderColor: f.color, ...(faseActiva === i ? { backgroundColor: f.color, color: 'white' } : {}) }}
              onClick={() => setFaseActiva(i)}
              aria-pressed={faseActiva === i}
            >
              <span aria-hidden="true">{f.icono}</span>
              <span className={styles.faseTitulo}>{f.titulo}</span>
            </button>
            {i < fases.length - 1 && <span className={styles.faseFlecha} aria-hidden="true">→</span>}
          </div>
        ))}
      </div>

      {/* Detalle de la fase seleccionada */}
      <div className={styles.faseDetalle} style={{ borderLeftColor: fases[faseActiva].color }}>
        <h3 style={{ color: fases[faseActiva].color }}>{fases[faseActiva].titulo}</h3>
        <p className={styles.faseDesc}>{fases[faseActiva].descripcion}</p>
        <p className={styles.faseDetalleTexto}>{fases[faseActiva].detalle}</p>
      </div>

      {/* Tipos de memoria */}
      <h3 className={styles.subSeccionTitulo}>Tipos de memoria</h3>
      <div className={styles.memoriasGrid}>
        {tiposMemoria.map((m, i) => (
          <div key={i} className={styles.memoriaCard}>
            <div className={styles.memoriaHeader}>
              <span className={styles.memoriaIcono} aria-hidden="true">{m.icono}</span>
              <span className={styles.memoriaNombre}>{m.titulo}</span>
            </div>
            <div className={styles.memoriaStats}>
              <div className={styles.memoriaStat}>
                <span className={styles.memoriaStatLabel}>Duración</span>
                <span className={styles.memoriaStatValor}>{m.duracion}</span>
              </div>
              <div className={styles.memoriaStat}>
                <span className={styles.memoriaStatLabel}>Capacidad</span>
                <span className={styles.memoriaStatValor}>{m.capacidad}</span>
              </div>
            </div>
            <p className={styles.memoriaEjemplo}>{m.ejemplo}</p>
          </div>
        ))}
      </div>

      {/* Por qué olvidas */}
      <h3 className={styles.subSeccionTitulo}>¿Por qué olvidamos?</h3>
      <div className={styles.olvidoGrid}>
        {razonesOlvido.map((r, i) => (
          <div key={i} className={styles.olvidoCard}>
            <span className={styles.olvidoIcono} aria-hidden="true">{r.icono}</span>
            <h4 className={styles.olvidoTitulo}>{r.titulo}</h4>
            <p className={styles.olvidoDesc}>{r.desc}</p>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          <strong>El olvido no es un fallo</strong> — es una función esencial. Si recordaras absolutamente todo (hipertimesia), tu cerebro estaría saturado de información irrelevante. Olvidar te permite priorizar lo que importa.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Neuroplasticidad
// ─────────────────────────────────────────────

function SeccionPlasticidad() {
  const casos = [
    {
      titulo: 'Taxistas de Londres',
      icono: '🚕',
      antes: 'Hipocampo de tamaño normal',
      despues: 'Hipocampo posterior significativamente más grande',
      explicacion: 'Estudio de Maguire et al. (2000): los taxistas londinenses que memorizan 25.000 calles desarrollan un hipocampo posterior más grande. Cuantos más años conducen, mayor el efecto.',
      tipo: 'Navegación espacial',
      colorTipo: '#E74C3C',
    },
    {
      titulo: 'Músicos profesionales',
      icono: '🎹',
      antes: 'Cuerpo calloso de grosor estándar',
      despues: 'Cuerpo calloso más grueso y más conexiones interhemisféricas',
      explicacion: 'Los músicos que empiezan antes de los 7 años tienen un cuerpo calloso (puente entre hemisferios) hasta un 15% más grueso. Ambas manos trabajan coordinadamente, forzando más conexiones.',
      tipo: 'Coordinación motora',
      colorTipo: '#2E86AB',
    },
    {
      titulo: 'Recuperación tras ictus',
      icono: '🏥',
      antes: 'Área motora dañada, parálisis parcial',
      despues: 'Áreas adyacentes asumen las funciones perdidas',
      explicacion: 'Tras un ictus (accidente cerebrovascular), las áreas sanas del cerebro pueden "recablearse" para asumir funciones de las zonas dañadas. La rehabilitación intensa acelera este proceso.',
      tipo: 'Recuperación funcional',
      colorTipo: '#27AE60',
    },
  ];

  const principios = [
    { titulo: 'Úsalo o piérdelo', desc: 'Las conexiones que no usas se debilitan (poda sináptica).', icono: '✂️' },
    { titulo: 'Repetición dirigida', desc: 'Practicar una habilidad fortalece las sinapsis específicas.', icono: '🔁' },
    { titulo: 'Intensidad importa', desc: 'Un entrenamiento intenso genera más cambios que uno pasivo.', icono: '💪' },
    { titulo: 'Edad no es barrera', desc: 'El cerebro se adapta toda la vida, aunque más lento con la edad.', icono: '🌱' },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Tu cerebro se recablea constantemente. <strong>Cada vez que aprendes algo nuevo, se forman o fortalecen sinapsis</strong>. Esto se llama neuroplasticidad, y ocurre toda la vida.</p>
      </div>

      {/* Casos de neuroplasticidad */}
      <div className={styles.casosGrid}>
        {casos.map((c, i) => (
          <div key={i} className={styles.casoCard}>
            <div className={styles.casoHeader}>
              <span className={styles.casoIcono} aria-hidden="true">{c.icono}</span>
              <div>
                <h3 className={styles.casoTitulo}>{c.titulo}</h3>
                <span className={styles.casoTipo} style={{ backgroundColor: `${c.colorTipo}22`, color: c.colorTipo }}>{c.tipo}</span>
              </div>
            </div>

            {/* Antes / Después */}
            <div className={styles.antesDepuesGrid}>
              <div className={styles.antesCard}>
                <span className={styles.adLabel}>Antes</span>
                <p className={styles.adTexto}>{c.antes}</p>
              </div>
              <span className={styles.adFlecha} aria-hidden="true">→</span>
              <div className={styles.despuesCard}>
                <span className={styles.adLabel}>Después</span>
                <p className={styles.adTexto}>{c.despues}</p>
              </div>
            </div>

            <p className={styles.casoExplicacion}>{c.explicacion}</p>
          </div>
        ))}
      </div>

      {/* Principios */}
      <h3 className={styles.subSeccionTitulo}>Principios de la neuroplasticidad</h3>
      <div className={styles.principiosGrid}>
        {principios.map((p, i) => (
          <div key={i} className={styles.principioCard}>
            <span className={styles.principioIcono} aria-hidden="true">{p.icono}</span>
            <h4 className={styles.principioTitulo}>{p.titulo}</h4>
            <p className={styles.principioDesc}>{p.desc}</p>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          La neuroplasticidad significa que <strong>tu cerebro de mañana no tiene por qué ser como el de hoy</strong>. Aprender un idioma, tocar un instrumento, incluso cambiar de hábitos — todo deja huella física en tus neuronas.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Ilusiones y trucos
// ─────────────────────────────────────────────

function SeccionIlusiones() {
  const [ilusion, setIlusion] = useState(0);
  const [revelado, setRevelado] = useState(false);

  const ilusiones = [
    {
      titulo: 'Ilusión de Müller-Lyer',
      categoria: 'Ilusión visual',
      pregunta: '¿Qué línea es más larga?',
      respuesta: 'Ambas líneas miden exactamente lo mismo. Las flechas en los extremos engañan a tu cerebro sobre la longitud percibida.',
      explicacion: 'Tu cerebro interpreta las flechas como señales de profundidad (esquinas interiores vs exteriores de una habitación). Es un atajo evolutivo que normalmente funciona, pero aquí falla.',
      demo: 'muller-lyer',
    },
    {
      titulo: 'Sombra del tablero de ajedrez',
      categoria: 'Ilusión de brillo',
      pregunta: '¿Qué cuadrado es más oscuro, A o B?',
      respuesta: 'Son exactamente del mismo color. Tu cerebro "corrige" la sombra automáticamente, haciendo que B parezca más claro.',
      explicacion: 'Ilusión de Adelson (1995). Tu sistema visual compensa automáticamente las sombras para entender el "verdadero" color de los objetos. Normalmente es útil, pero aquí te engaña.',
      demo: 'checker-shadow',
    },
    {
      titulo: 'Efecto McGurk',
      categoria: 'Ilusión multisensorial',
      pregunta: '¿Puedes oír algo diferente según lo que ves?',
      respuesta: 'Cuando alguien dice "ba" pero mueve los labios como "ga", tu cerebro oye "da" — un sonido que no existe. La vista sobreescribe al oído.',
      explicacion: 'McGurk y MacDonald (1976). Tu cerebro fusiona información visual y auditiva. Cuando entran en conflicto, inventa un compromiso. Funciona incluso cuando sabes que es una ilusión.',
      demo: 'mcgurk',
    },
    {
      titulo: 'Miembro fantasma',
      categoria: 'Ilusión somatosensorial',
      pregunta: '¿Puedes sentir una parte del cuerpo que ya no existe?',
      respuesta: 'Sí. Hasta el 80% de personas que pierden una extremidad siguen sintiéndola — incluyendo dolor, picor o movimiento.',
      explicacion: 'El mapa corporal del cerebro (corteza somatosensorial) sigue "esperando" señales de la extremidad amputada. Las neuronas vecinas invaden esa zona, creando sensaciones cruzadas.',
      demo: 'phantom',
    },
    {
      titulo: 'Ceguera al cambio',
      categoria: 'Ilusión atencional',
      pregunta: '¿Puedes detectar cambios obvios en tu entorno?',
      respuesta: 'No siempre. Si un cambio ocurre durante una interrupción (parpadeo, movimiento de cámara), tu cerebro puede no detectarlo — incluso si es enorme.',
      explicacion: 'Simons y Chabris (1999) demostraron que un gorila puede cruzar una escena sin que el 50% de los observadores lo vean, si están concentrados en otra tarea. Tu atención tiene un "ancho de banda" limitado.',
      demo: 'change-blindness',
    },
  ];

  const actual = ilusiones[ilusion];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Tu cerebro no percibe la realidad tal como es — la <strong>interpreta</strong> usando atajos. Estos atajos funcionan casi siempre, pero a veces fallan de formas fascinantes.</p>
      </div>

      {/* Selector de ilusiones */}
      <div className={styles.ilusionesTabs}>
        {ilusiones.map((il, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.ilusionTab} ${ilusion === i ? styles.ilusionTabActiva : ''}`}
            onClick={() => { setIlusion(i); setRevelado(false); }}
            aria-pressed={ilusion === i}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Ilusión actual */}
      <div className={styles.ilusionCard}>
        <div className={styles.ilusionHeader}>
          <span className={styles.ilusionCategoria}>{actual.categoria}</span>
          <h3 className={styles.ilusionTitulo}>{actual.titulo}</h3>
        </div>

        {/* Demo visual */}
        <div className={styles.demoArea}>
          {actual.demo === 'muller-lyer' && (
            <div className={styles.mullerLyer}>
              <div className={styles.mullerLinea}>
                <span className={styles.mullerFlecha}>{'<'}</span>
                <div className={styles.mullerBarra} />
                <span className={styles.mullerFlecha}>{'>'}</span>
                {revelado && <span className={styles.mullerMedida}>100%</span>}
              </div>
              <div className={styles.mullerLinea}>
                <span className={styles.mullerFlechaInversa}>{'>'}</span>
                <div className={styles.mullerBarra} />
                <span className={styles.mullerFlechaInversa}>{'<'}</span>
                {revelado && <span className={styles.mullerMedida}>100%</span>}
              </div>
            </div>
          )}

          {actual.demo === 'checker-shadow' && (
            <div className={styles.checkerBoard}>
              <div className={styles.checkerGrid}>
                {Array.from({ length: 16 }, (_, i) => {
                  const row = Math.floor(i / 4);
                  const col = i % 4;
                  const isLight = (row + col) % 2 === 0;
                  const isA = row === 1 && col === 1;
                  const isB = row === 2 && col === 2;
                  const inShadow = row >= 2;
                  let bg: string;
                  if (revelado) {
                    bg = (isA || isB) ? '#787878' : isLight ? (inShadow ? '#969696' : '#c8c8c8') : (inShadow ? '#505050' : '#787878');
                  } else {
                    bg = isLight ? (inShadow ? '#969696' : '#c8c8c8') : (inShadow ? '#505050' : '#787878');
                  }
                  return (
                    <div
                      key={i}
                      className={`${styles.checkerCell} ${(isA || isB) ? styles.checkerHighlight : ''}`}
                      style={{ backgroundColor: bg }}
                    >
                      {isA && <span className={styles.checkerLabel}>A</span>}
                      {isB && <span className={styles.checkerLabel}>B</span>}
                    </div>
                  );
                })}
              </div>
              {!revelado && <div className={styles.checkerShadow} />}
            </div>
          )}

          {actual.demo === 'mcgurk' && (
            <div className={styles.mcgurkDemo}>
              <div className={styles.mcgurkGrid}>
                <div className={styles.mcgurkCard}>
                  <span className={styles.mcgurkIcono} aria-hidden="true">👂</span>
                  <span className={styles.mcgurkLabel}>Oyes</span>
                  <span className={styles.mcgurkValor}>&quot;ba&quot;</span>
                </div>
                <span className={styles.mcgurkPlus} aria-hidden="true">+</span>
                <div className={styles.mcgurkCard}>
                  <span className={styles.mcgurkIcono} aria-hidden="true">👄</span>
                  <span className={styles.mcgurkLabel}>Ves</span>
                  <span className={styles.mcgurkValor}>&quot;ga&quot;</span>
                </div>
                <span className={styles.mcgurkPlus} aria-hidden="true">=</span>
                <div className={`${styles.mcgurkCard} ${styles.mcgurkResultado}`}>
                  <span className={styles.mcgurkIcono} aria-hidden="true">🧠</span>
                  <span className={styles.mcgurkLabel}>Percibes</span>
                  <span className={styles.mcgurkValor}>{revelado ? '"da" (¡inventado!)' : '???'}</span>
                </div>
              </div>
            </div>
          )}

          {actual.demo === 'phantom' && (
            <div className={styles.phantomDemo}>
              <div className={styles.phantomGrid}>
                <div className={styles.phantomBefore}>
                  <div className={styles.phantomSilueta}>
                    <div className={styles.phantomBrazoIzq} />
                    <div className={styles.phantomCuerpo} />
                    <div className={styles.phantomBrazoDer} />
                  </div>
                  <span className={styles.phantomLabel}>Antes</span>
                </div>
                <span className={styles.phantomFlecha} aria-hidden="true">→</span>
                <div className={styles.phantomAfter}>
                  <div className={styles.phantomSilueta}>
                    <div className={styles.phantomBrazoIzq} />
                    <div className={styles.phantomCuerpo} />
                    <div className={`${styles.phantomBrazoDer} ${styles.phantomBrazoGhost}`} />
                    {revelado && <div className={styles.phantomSenal}>
                      <span>El cerebro sigue &quot;sintiendo&quot; el brazo</span>
                    </div>}
                  </div>
                  <span className={styles.phantomLabel}>Después</span>
                </div>
              </div>
            </div>
          )}

          {actual.demo === 'change-blindness' && (
            <div className={styles.changeDemo}>
              <div className={styles.changeEscena}>
                <div className={styles.changeObjeto} style={{ background: '#2E86AB', left: '10%', top: '20%' }} />
                <div className={styles.changeObjeto} style={{ background: '#E74C3C', left: '60%', top: '15%' }} />
                <div className={styles.changeObjeto} style={{ background: '#27AE60', left: '35%', top: '55%' }} />
                {!revelado && <div className={styles.changeObjeto} style={{ background: '#F39C12', left: '75%', top: '60%' }} />}
                {revelado && <div className={styles.changeObjeto} style={{ background: '#9B59B6', left: '75%', top: '60%' }} />}
              </div>
              <p className={styles.changePista}>
                {revelado ? 'El objeto naranja (abajo derecha) cambió a morado. ¿Lo viste?' : '¿Puedes ver qué cambiará cuando pulses "Revelar"?'}
              </p>
            </div>
          )}
        </div>

        {/* Pregunta */}
        <p className={styles.ilusionPregunta}>{actual.pregunta}</p>

        {/* Botón revelar */}
        <button
          type="button"
          className={styles.btnRevelar}
          onClick={() => setRevelado(!revelado)}
        >
          {revelado ? 'Ocultar respuesta' : 'Revelar'}
        </button>

        {/* Respuesta y explicación */}
        {revelado && (
          <div className={styles.ilusionRespuesta}>
            <p className={styles.respuestaTexto}><strong>Respuesta:</strong> {actual.respuesta}</p>
            <p className={styles.explicacionTexto}>{actual.explicacion}</p>
          </div>
        )}
      </div>

      <div className={styles.insight}>
        <p>
          Las ilusiones no son &quot;fallos&quot; del cerebro — son <strong>atajos evolutivos</strong> que normalmente funcionan perfectamente. Tu cerebro procesa millones de datos por segundo y necesita simplificar. Estas simplificaciones son correctas el 99% del tiempo.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorCerebroPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('maquina');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'maquina': return <SeccionMaquina />;
      case 'recuerdo': return <SeccionRecuerdo />;
      case 'plasticidad': return <SeccionPlasticidad />;
      case 'ilusiones': return <SeccionIlusiones />;
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Cómo Piensa tu Cerebro</h1>
          <p className={styles.subtitle}>Neuronas, memoria, neuroplasticidad e ilusiones — la máquina más compleja del universo</p>
        </header>

        <LegalNotice />

        {/* Navegación */}
        <nav className={styles.navSecciones} aria-label="Secciones del explicador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)}
              aria-pressed={seccionActiva === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera sección */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            {SECCIONES.find(s => s.id === seccionActiva)?.icono}{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Más sobre el cerebro humano"
          subtitle="Preguntas frecuentes sobre neurociencia"
          defaultOpen={false}
        >
          <h3>¿Usamos solo el 10% del cerebro?</h3>
          <p>
            <strong>No.</strong> Este es uno de los mitos más extendidos. Las imágenes de resonancia magnética
            funcional (fMRI) muestran que prácticamente todas las áreas del cerebro están activas a lo largo
            del día, aunque no todas simultáneamente. Cada región tiene funciones específicas y todas se usan.
          </p>

          <h3>¿Cuántas decisiones toma el cerebro al día?</h3>
          <p>
            Se estima que unas <strong>{formatNumber(35000, 0)} decisiones</strong> al día, la mayoría
            inconscientes. Desde la postura de tu cuerpo hasta qué palabra usar a continuación.
            Solo unas pocas (las difíciles) llegan a tu consciencia.
          </p>

          <h3>¿Puede el cerebro adulto generar nuevas neuronas?</h3>
          <p>
            Sí, pero de forma muy limitada. La <strong>neurogénesis adulta</strong> ocurre principalmente
            en el hipocampo (memoria) y el bulbo olfatorio. El ejercicio físico, el aprendizaje y el sueño
            adecuado favorecen la creación de nuevas neuronas.
          </p>

          <h3>¿Cerebro izquierdo vs. cerebro derecho?</h3>
          <p>
            Otro mito popular. Aunque algunas funciones se <strong>lateralizan</strong> (el habla suele estar
            en el hemisferio izquierdo), no existe gente &quot;de cerebro derecho&quot; o &quot;de cerebro
            izquierdo&quot;. Ambos hemisferios trabajan siempre juntos, conectados por el cuerpo calloso.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador simplifica conceptos de neurociencia con fines educativos.
            El cerebro humano es extraordinariamente complejo y muchos de sus mecanismos siguen siendo
            objeto de investigación activa. Los datos presentados reflejan el consenso científico actual.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-cerebro')} />
        <ShareCard appName="visualizador-cerebro" />
        <Footer appName="visualizador-cerebro" />
      </div>
    </>
  );
}
