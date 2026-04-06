'use client';

import { useState } from 'react';
import styles from './VisualizadorPantallas.module.css';
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
// Secciones del explicador
// ─────────────────────────────────────────────

type Seccion = 'evolucion' | 'pixel' | 'resoluciones' | 'salud';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'evolucion', titulo: 'La evolución', icono: '📺', subtitulo: 'De los tubos de rayos catódicos al MicroLED' },
  { id: 'pixel', titulo: 'Dentro del píxel', icono: '🔴', subtitulo: 'Tres diminutas luces que crean todo lo que ves' },
  { id: 'resoluciones', titulo: 'Resoluciones', icono: '📐', subtitulo: 'Cuántos píxeles caben en tu pantalla' },
  { id: 'salud', titulo: 'Salud visual', icono: '👁️', subtitulo: 'Lo que la ciencia dice sobre pantallas y ojos' },
];

// ─────────────────────────────────────────────
// Sección 1: La evolución
// ─────────────────────────────────────────────

interface TecnologiaDisplay {
  id: string;
  nombre: string;
  anio: string;
  icono: string;
  color: string;
  principio: string;
  descripcion: string;
  ventajas: string;
  desventajas: string;
}

const TECNOLOGIAS: TecnologiaDisplay[] = [
  {
    id: 'crt',
    nombre: 'CRT',
    anio: '1897',
    icono: '📺',
    color: '#6B7280',
    principio: 'Tubo de rayos catódicos',
    descripcion: 'Un cañón de electrones dispara contra una capa de fósforo en una pantalla de cristal. Los electrones se desvían con imanes para dibujar línea a línea.',
    ventajas: 'Negro perfecto, sin retardo, ángulos de visión amplios',
    desventajas: 'Enorme, pesado (30+ kg), consume mucha energía',
  },
  {
    id: 'lcd',
    nombre: 'LCD',
    anio: '1970s',
    icono: '💡',
    color: '#3B82F6',
    principio: 'Cristales líquidos + retroiluminación',
    descripcion: 'Una retroiluminación LED ilumina cristales líquidos que rotan para bloquear o dejar pasar la luz. Filtros de color separan rojo, verde y azul.',
    ventajas: 'Delgado, bajo consumo, económico de fabricar',
    desventajas: 'Negros grisáceos (la retroiluminación siempre está encendida), ángulos limitados en TN',
  },
  {
    id: 'plasma',
    nombre: 'Plasma',
    anio: '1990s',
    icono: '✨',
    color: '#8B5CF6',
    principio: 'Gas ionizado (plasma)',
    descripcion: 'Cada celda contiene gas noble (neón/xenón) que al electrificarse emite luz ultravioleta, excitando fósforos de color. Cada píxel es autoemisivo.',
    ventajas: 'Negros profundos, excelente movimiento, colores naturales',
    desventajas: 'Alto consumo, riesgo de burn-in, ya no se fabrica',
  },
  {
    id: 'oled',
    nombre: 'OLED',
    anio: '2013',
    icono: '🌟',
    color: '#F59E0B',
    principio: 'Diodos orgánicos autoemisivos',
    descripcion: 'Cada píxel contiene compuestos orgánicos que emiten luz propia al recibir corriente. No necesita retroiluminación: cada píxel se enciende o apaga individualmente.',
    ventajas: 'Negro absoluto, ultra-delgado, contraste infinito, flexible',
    desventajas: 'Más caro, burn-in posible, brillo máximo inferior a LCD de gama alta',
  },
  {
    id: 'microled',
    nombre: 'MicroLED',
    anio: 'Futuro',
    icono: '🔮',
    color: '#10B981',
    principio: 'LEDs inorgánicos microscópicos',
    descripcion: 'Millones de LEDs inorgánicos diminutos (< 50 μm), uno por subpíxel. Combina las ventajas de OLED (autoemisivo) sin sus inconvenientes (materiales orgánicos que degradan).',
    ventajas: 'Sin burn-in, brillo extremo, vida útil muy larga, modular',
    desventajas: 'Extremadamente caro, fabricación muy compleja, no disponible masivamente',
  },
];

function SeccionEvolucion() {
  const [activa, setActiva] = useState<string>('crt');
  const seleccionada = TECNOLOGIAS.find(t => t.id === activa);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>En 130 años hemos pasado de <strong>tubos de cristal de 30 kg</strong> a <strong>láminas flexibles de 3 mm</strong>. Cada salto tecnológico resolvió un problema del anterior.</p>
      </div>

      {/* Timeline */}
      <div className={styles.timeline}>
        {TECNOLOGIAS.map((t, i) => (
          <button
            key={t.id}
            type="button"
            className={`${styles.timelineBtn} ${activa === t.id ? styles.timelineActivo : ''}`}
            onClick={() => setActiva(t.id)}
            aria-pressed={activa === t.id}
            style={{ '--tech-color': t.color } as React.CSSProperties}
          >
            <span className={styles.timelineAnio}>{t.anio}</span>
            <span className={styles.timelineDot} />
            {i < TECNOLOGIAS.length - 1 && <span className={styles.timelineLine} />}
            <span className={styles.timelineIcono} aria-hidden="true">{t.icono}</span>
            <span className={styles.timelineNombre}>{t.nombre}</span>
          </button>
        ))}
      </div>

      {/* Detalle */}
      {seleccionada && (
        <div className={styles.techDetalle} style={{ '--tech-color': seleccionada.color } as React.CSSProperties}>
          <div className={styles.techHeader}>
            <span className={styles.techIcono} aria-hidden="true">{seleccionada.icono}</span>
            <div>
              <strong className={styles.techNombre}>{seleccionada.nombre}</strong>
              <span className={styles.techPrincipio}>{seleccionada.principio}</span>
            </div>
            <span className={styles.techAnio}>{seleccionada.anio}</span>
          </div>
          <p className={styles.techDesc}>{seleccionada.descripcion}</p>
          <div className={styles.techProsContras}>
            <div className={styles.techPros}>
              <span className={styles.techLabel}>✅ Ventajas</span>
              <p>{seleccionada.ventajas}</p>
            </div>
            <div className={styles.techContras}>
              <span className={styles.techLabel}>❌ Desventajas</span>
              <p>{seleccionada.desventajas}</p>
            </div>
          </div>
        </div>
      )}

      <div className={styles.insight}>
        <p>
          La tendencia es clara: <strong>cada generación elimina la retroiluminación</strong>. CRT y Plasma eran autoemisivos,
          LCD fue un paso atrás (necesita backlight), y OLED volvió al ideal. MicroLED promete ser el punto final:
          autoemisivo, inorgánico y prácticamente eterno.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Dentro de un píxel
// ─────────────────────────────────────────────

interface MezclaColor {
  nombre: string;
  r: boolean;
  g: boolean;
  b: boolean;
  hex: string;
}

const MEZCLAS: MezclaColor[] = [
  { nombre: 'Rojo', r: true, g: false, b: false, hex: '#FF0000' },
  { nombre: 'Verde', r: false, g: true, b: false, hex: '#00FF00' },
  { nombre: 'Azul', r: false, g: false, b: true, hex: '#0000FF' },
  { nombre: 'Amarillo', r: true, g: true, b: false, hex: '#FFFF00' },
  { nombre: 'Magenta', r: true, g: false, b: true, hex: '#FF00FF' },
  { nombre: 'Cian', r: false, g: true, b: true, hex: '#00FFFF' },
  { nombre: 'Blanco', r: true, g: true, b: true, hex: '#FFFFFF' },
];

function SeccionPixel() {
  const [rActivo, setRActivo] = useState(true);
  const [gActivo, setGActivo] = useState(true);
  const [bActivo, setBActivo] = useState(true);

  const colorResultante = `rgb(${rActivo ? 255 : 0}, ${gActivo ? 255 : 0}, ${bActivo ? 255 : 0})`;
  const nombreColor = MEZCLAS.find(m => m.r === rActivo && m.g === gActivo && m.b === bActivo)?.nombre ?? 'Negro';

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Cada píxel de tu pantalla está formado por <strong>3 subpíxeles</strong> — uno rojo, uno verde y uno azul. Combinándolos a distintas intensidades se crea cualquier color visible.</p>
      </div>

      {/* Mezcla interactiva */}
      <div className={styles.pixelLab}>
        <div className={styles.subpixelControles}>
          <button
            type="button"
            className={`${styles.subpixelBtn} ${rActivo ? styles.subpixelActivo : ''}`}
            onClick={() => setRActivo(!rActivo)}
            aria-pressed={rActivo}
            style={{ '--sp-color': '#FF0000' } as React.CSSProperties}
          >
            <span className={styles.subpixelLed} />
            <span>Rojo (R)</span>
          </button>
          <button
            type="button"
            className={`${styles.subpixelBtn} ${gActivo ? styles.subpixelActivo : ''}`}
            onClick={() => setGActivo(!gActivo)}
            aria-pressed={gActivo}
            style={{ '--sp-color': '#00CC00' } as React.CSSProperties}
          >
            <span className={styles.subpixelLed} />
            <span>Verde (G)</span>
          </button>
          <button
            type="button"
            className={`${styles.subpixelBtn} ${bActivo ? styles.subpixelActivo : ''}`}
            onClick={() => setBActivo(!bActivo)}
            aria-pressed={bActivo}
            style={{ '--sp-color': '#0066FF' } as React.CSSProperties}
          >
            <span className={styles.subpixelLed} />
            <span>Azul (B)</span>
          </button>
        </div>

        <div className={styles.pixelResultado}>
          <div className={styles.pixelMuestra} style={{ backgroundColor: colorResultante }}>
            <div className={styles.pixelSubpixeles}>
              <div className={`${styles.subpixelStripe} ${rActivo ? styles.stripeR : styles.stripeOff}`} />
              <div className={`${styles.subpixelStripe} ${gActivo ? styles.stripeG : styles.stripeOff}`} />
              <div className={`${styles.subpixelStripe} ${bActivo ? styles.stripeB : styles.stripeOff}`} />
            </div>
          </div>
          <span className={styles.pixelNombreColor}>{nombreColor}</span>
          <span className={styles.pixelCodigoColor}>{colorResultante}</span>
        </div>
      </div>

      {/* Tabla de combinaciones rápidas */}
      <div className={styles.mezclaGrid}>
        {MEZCLAS.map(m => (
          <button
            key={m.nombre}
            type="button"
            className={styles.mezclaBtn}
            onClick={() => { setRActivo(m.r); setGActivo(m.g); setBActivo(m.b); }}
          >
            <span className={styles.mezclaColor} style={{ backgroundColor: m.hex }} />
            <span className={styles.mezclaNombre}>{m.nombre}</span>
            <span className={styles.mezclaFormula}>
              {m.r ? 'R' : '·'} + {m.g ? 'G' : '·'} + {m.b ? 'B' : '·'}
            </span>
          </button>
        ))}
      </div>

      {/* LCD vs OLED */}
      <div className={styles.comparativa}>
        <h3 className={styles.comparativaTitulo}>LCD vs OLED: estructura del píxel</h3>
        <div className={styles.comparativaGrid}>
          <div className={styles.comparativaCard}>
            <strong className={styles.comparativaNombre}>LCD</strong>
            <div className={styles.pixelDiagrama}>
              <div className={styles.diagramaCapa} style={{ backgroundColor: '#FDE68A' }}>
                <span>💡 Retroiluminación</span>
              </div>
              <div className={styles.diagramaCapa} style={{ backgroundColor: '#DBEAFE' }}>
                <span>🔄 Cristal líquido</span>
              </div>
              <div className={styles.diagramaCapa} style={{ backgroundColor: '#F3E8FF' }}>
                <span>🎨 Filtro de color</span>
              </div>
            </div>
            <p className={styles.comparativaDesc}>La retroiluminación siempre está encendida. Los cristales líquidos bloquean la luz para crear negro — pero nunca al 100%.</p>
          </div>
          <div className={styles.comparativaCard}>
            <strong className={styles.comparativaNombre}>OLED</strong>
            <div className={styles.pixelDiagrama}>
              <div className={styles.diagramaCapa} style={{ backgroundColor: '#D1FAE5' }}>
                <span>💡 Emisión propia</span>
              </div>
              <div className={styles.diagramaCapa} style={{ backgroundColor: '#FEE2E2' }}>
                <span>🔴🟢🔵 Subpíxel orgánico</span>
              </div>
            </div>
            <p className={styles.comparativaDesc}>Cada subpíxel genera su propia luz. Para mostrar negro, simplemente se apaga. Por eso el contraste es &quot;infinito&quot;.</p>
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Un televisor 4K tiene <strong>{formatNumber(3840 * 2160 * 3, 0)} subpíxeles</strong> ({formatNumber(3840 * 2160, 0)} píxeles × 3 colores).
          Tu cerebro fusiona esos puntos diminutos en una imagen continua gracias a la <strong>resolución angular</strong>: a
          distancia normal, no puedes distinguir un punto de otro.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Resoluciones
// ─────────────────────────────────────────────

interface Resolucion {
  nombre: string;
  ancho: number;
  alto: number;
  pixeles: number;
  color: string;
  ejemplo: string;
}

const RESOLUCIONES: Resolucion[] = [
  { nombre: 'HD 720p', ancho: 1280, alto: 720, pixeles: 921600, color: '#6B7280', ejemplo: 'TV pequeños, streaming básico' },
  { nombre: 'Full HD 1080p', ancho: 1920, alto: 1080, pixeles: 2073600, color: '#3B82F6', ejemplo: 'El estándar actual, la mayoría de monitores' },
  { nombre: '2K (QHD)', ancho: 2560, alto: 1440, pixeles: 3686400, color: '#8B5CF6', ejemplo: 'Monitores gaming, portátiles premium' },
  { nombre: '4K (UHD)', ancho: 3840, alto: 2160, pixeles: 8294400, color: '#2E86AB', ejemplo: 'TV modernos, streaming premium' },
  { nombre: '8K (UHD)', ancho: 7680, alto: 4320, pixeles: 33177600, color: '#10B981', ejemplo: 'Cine profesional, TV de gama ultra-alta' },
];

const maxPixeles = RESOLUCIONES[RESOLUCIONES.length - 1].pixeles;

interface DispositivoPPI {
  nombre: string;
  icono: string;
  ppi: number;
  distancia: string;
  detalle: string;
}

const DISPOSITIVOS_PPI: DispositivoPPI[] = [
  { nombre: 'Móvil', icono: '📱', ppi: 460, distancia: '25-35 cm', detalle: 'iPhone 15 Pro: 460 PPI — imposible ver píxeles a ojo' },
  { nombre: 'Tablet', icono: '📲', ppi: 264, distancia: '35-45 cm', detalle: 'iPad Pro: 264 PPI — «Retina» desde 2012' },
  { nombre: 'Portátil', icono: '💻', ppi: 220, distancia: '45-60 cm', detalle: 'MacBook Pro 14": 254 PPI, Dell XPS 13: 220 PPI' },
  { nombre: 'Monitor', icono: '🖥️', ppi: 109, distancia: '60-80 cm', detalle: '27" 4K: 163 PPI, 27" 1080p: 82 PPI' },
  { nombre: 'TV 55"', icono: '📺', ppi: 80, distancia: '2-4 m', detalle: '55" 4K: 80 PPI — pero a 3m no notas la diferencia con 1080p' },
];

function SeccionResoluciones() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La resolución es <strong>el número de píxeles</strong> que cabe en la pantalla. Más píxeles = más detalle, pero solo si la pantalla es lo bastante pequeña o tú estás lo bastante cerca.</p>
      </div>

      {/* Comparativa resoluciones */}
      <div className={styles.resolucionesGrid}>
        {RESOLUCIONES.map(r => (
          <div key={r.nombre} className={styles.resolucionCard} style={{ '--res-color': r.color } as React.CSSProperties}>
            <div className={styles.resHeader}>
              <strong className={styles.resNombre}>{r.nombre}</strong>
              <span className={styles.resDims}>{formatNumber(r.ancho, 0)} × {formatNumber(r.alto, 0)}</span>
            </div>
            <div className={styles.resPixeles}>
              <span className={styles.resNumero}>{formatNumber(r.pixeles, 0)}</span>
              <span className={styles.resLabel}>píxeles</span>
            </div>
            <div className={styles.resBarra}>
              <div
                className={styles.resRelleno}
                style={{
                  width: `${(r.pixeles / maxPixeles) * 100}%`,
                  backgroundColor: r.color,
                }}
              />
            </div>
            <span className={styles.resEjemplo}>{r.ejemplo}</span>
          </div>
        ))}
      </div>

      {/* Escala visual: 4K = 4× Full HD */}
      <div className={styles.escalaVisual}>
        <h3 className={styles.escalaTitle}>Escala: ¿cuántos Full HD caben?</h3>
        <div className={styles.escalaGrid}>
          <div className={styles.escalaItem}>
            <div className={styles.escalaBloque} style={{ width: '25%', paddingBottom: '14%', backgroundColor: '#6B7280' }} />
            <span>720p (0,4×)</span>
          </div>
          <div className={styles.escalaItem}>
            <div className={styles.escalaBloque} style={{ width: '50%', paddingBottom: '28%', backgroundColor: '#3B82F6' }} />
            <span>1080p (1×)</span>
          </div>
          <div className={styles.escalaItem}>
            <div className={styles.escalaBloque} style={{ width: '70%', paddingBottom: '39%', backgroundColor: '#8B5CF6' }} />
            <span>2K (1,8×)</span>
          </div>
          <div className={styles.escalaItem}>
            <div className={styles.escalaBloque} style={{ width: '100%', paddingBottom: '56%', backgroundColor: '#2E86AB' }} />
            <span>4K (4×)</span>
          </div>
        </div>
      </div>

      {/* PPI por dispositivo */}
      <h3 className={styles.subSeccionTitulo}>PPI: píxeles por pulgada</h3>
      <div className={styles.ppiGrid}>
        {DISPOSITIVOS_PPI.map(d => (
          <div key={d.nombre} className={styles.ppiCard}>
            <div className={styles.ppiHeader}>
              <span className={styles.ppiIcono} aria-hidden="true">{d.icono}</span>
              <div>
                <strong className={styles.ppiNombre}>{d.nombre}</strong>
                <span className={styles.ppiDistancia}>a {d.distancia}</span>
              </div>
              <span className={styles.ppiValor}>{formatNumber(d.ppi, 0)} PPI</span>
            </div>
            <p className={styles.ppiDetalle}>{d.detalle}</p>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          A <strong>3 metros de distancia</strong>, el ojo humano no distingue entre 1080p y 4K en un TV de 55&quot;.
          La resolución angular (≈1 minuto de arco por píxel) marca el límite. Por eso un móvil de 460 PPI
          y un TV de 80 PPI pueden parecer <strong>igual de nítidos</strong> — la distancia lo compensa todo.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Salud visual
// ─────────────────────────────────────────────

interface DatoSalud {
  icono: string;
  titulo: string;
  valor: string;
  descripcion: string;
  color: string;
}

const DATOS_SALUD: DatoSalud[] = [
  { icono: '📱', titulo: 'Tiempo frente a pantalla', valor: '7 h/día', descripcion: 'Media en España para adultos (INE 2024). Incluye trabajo, ocio y móvil.', color: '#EF4444' },
  { icono: '💡', titulo: 'Luz azul emitida', valor: '380-500 nm', descripcion: 'Las pantallas emiten más proporción de luz azul que la luz solar. El pico está en ~450 nm.', color: '#3B82F6' },
  { icono: '😣', titulo: 'Fatiga visual digital', valor: '65% la sufren', descripcion: 'Síntomas: ojos secos, visión borrosa, dolor de cabeza. Causado por menor parpadeo (de 15 a 7 veces/min).', color: '#F59E0B' },
  { icono: '🔄', titulo: 'Parpadeo con pantalla', valor: '7 veces/min', descripcion: 'Lo normal son 15 veces/min. Al mirar una pantalla parpadeas la mitad, lo que reseca los ojos.', color: '#8B5CF6' },
  { icono: '🌙', titulo: 'Impacto en el sueño', valor: '-30 min', descripcion: 'Usar pantallas 1h antes de dormir retrasa el sueño ~30 min al suprimir melatonina (Harvard Medical School).', color: '#6B7280' },
  { icono: '💥', titulo: 'PWM flicker (OLED)', valor: '≤240 Hz', descripcion: 'Muchos OLED regulan brillo apagando y encendiendo rápido (PWM). Puede causar fatiga en personas sensibles.', color: '#EC4899' },
];

interface ConsejoSalud {
  icono: string;
  titulo: string;
  detalle: string;
}

const CONSEJOS: ConsejoSalud[] = [
  { icono: '👀', titulo: 'Regla 20-20-20', detalle: 'Cada 20 minutos, mira algo a 20 pies (6 metros) durante 20 segundos. Relaja los músculos del enfoque.' },
  { icono: '💧', titulo: 'Parpadea conscientemente', detalle: 'Fuerza el parpadeo completo cada pocos minutos. Usa lágrimas artificiales si notas sequedad.' },
  { icono: '🌅', titulo: 'Modo noche después de las 20:00', detalle: 'Reduce la luz azul con filtros de pantalla (modo noche/Night Shift). Evita pantallas 1h antes de dormir.' },
  { icono: '📏', titulo: 'Distancia y posición', detalle: 'Pantalla a 50-70 cm, ligeramente por debajo de los ojos. La mirada hacia abajo reduce la superficie expuesta del ojo.' },
  { icono: '💡', titulo: 'Iluminación ambiental', detalle: 'Evita usar pantallas en oscuridad total. La diferencia de brillo entre pantalla y entorno aumenta la fatiga.' },
  { icono: '🔆', titulo: 'Brillo y contraste', detalle: 'Ajusta el brillo al nivel del entorno. Demasiado brillo = más fatiga. Activa brillo automático si tu dispositivo lo tiene.' },
];

function SeccionSalud() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Pasamos de media <strong>7 horas al día</strong> frente a pantallas. Estos son los datos que la ciencia conoce sobre su impacto visual — y lo que funciona para reducirlo.</p>
      </div>

      {/* Datos impacto */}
      <div className={styles.saludGrid}>
        {DATOS_SALUD.map(d => (
          <div key={d.titulo} className={styles.saludCard} style={{ '--salud-color': d.color } as React.CSSProperties}>
            <div className={styles.saludHeader}>
              <span className={styles.saludIcono} aria-hidden="true">{d.icono}</span>
              <strong className={styles.saludTitulo}>{d.titulo}</strong>
            </div>
            <span className={styles.saludValor}>{d.valor}</span>
            <p className={styles.saludDesc}>{d.descripcion}</p>
          </div>
        ))}
      </div>

      {/* Espectro luz azul */}
      <div className={styles.espectroCard}>
        <h3 className={styles.espectroTitulo}>Espectro visible y luz azul</h3>
        <div className={styles.espectro}>
          <div className={styles.espectroFranja} style={{ background: 'linear-gradient(90deg, #8B00FF, #4400FF, #0066FF, #00CCFF, #00FF00, #FFFF00, #FF8800, #FF0000)' }} />
          <div className={styles.espectroMarkers}>
            <span>380 nm</span>
            <span className={styles.espectroAzul}>← Luz azul (380-500 nm) →</span>
            <span>780 nm</span>
          </div>
        </div>
        <p className={styles.espectroDesc}>
          La <strong>luz azul de alta energía</strong> (380-450 nm) es la que más preocupa. Las pantallas LED/OLED
          tienen un pico de emisión en ~450 nm. A dosis normales no daña la retina, pero sí puede alterar
          el ritmo circadiano si se usa de noche.
        </p>
      </div>

      {/* Consejos */}
      <h3 className={styles.subSeccionTitulo}>Consejos basados en evidencia</h3>
      <div className={styles.consejosGrid}>
        {CONSEJOS.map(c => (
          <div key={c.titulo} className={styles.consejoCard}>
            <div className={styles.consejoHeader}>
              <span className={styles.consejoIcono} aria-hidden="true">{c.icono}</span>
              <strong className={styles.consejoTitulo}>{c.titulo}</strong>
            </div>
            <p className={styles.consejoDetalle}>{c.detalle}</p>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          La evidencia científica es clara: <strong>la luz azul de las pantallas no daña la retina</strong> a intensidades
          normales (AAO, 2023). El problema real es la <strong>fatiga visual por falta de parpadeo</strong> y el
          <strong> impacto en el sueño</strong> por supresión de melatonina. Solución: parpadear más, descansar cada 20 min
          y no usar pantallas 1 hora antes de dormir.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorPantallasPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('evolucion');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'evolucion': return <SeccionEvolucion />;
      case 'pixel': return <SeccionPixel />;
      case 'resoluciones': return <SeccionResoluciones />;
      case 'salud': return <SeccionSalud />;
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
          <h1 className={styles.title}>Cómo Funciona una Pantalla</h1>
          <p className={styles.subtitle}>Píxeles, colores, resolución y salud visual — todo lo que hay detrás del cristal</p>
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
          title="Más sobre pantallas y visión"
          subtitle="Conceptos clave sobre tecnología de displays"
          defaultOpen={false}
        >
          <h3>¿Por qué los OLED tienen burn-in?</h3>
          <p>
            Los compuestos orgánicos de cada subpíxel OLED degradan con el uso. Los píxeles que muestran
            contenido estático (logos de canal, barras de navegación) se desgastan más rápido que el resto,
            dejando una &quot;marca fantasma&quot; permanente. Los fabricantes mitigan esto con desplazamiento
            automático de píxeles y detectores de contenido estático.
          </p>

          <h3>¿Es real el daño de la luz azul?</h3>
          <p>
            La Academia Americana de Oftalmología (AAO) concluyó en 2023 que <strong>no hay evidencia</strong> de
            que la luz azul de pantallas dañe la retina humana a intensidades normales. El verdadero problema
            es la fatiga visual digital causada por la reducción del parpadeo y la alteración del ciclo
            circadiano cuando se usan pantallas de noche.
          </p>

          <h3>¿Qué es la frecuencia de refresco?</h3>
          <p>
            Es cuántas veces por segundo se actualiza la imagen. Un TV normal funciona a 60 Hz (60 imágenes/s),
            los monitores gaming llegan a 240 Hz y algunos móviles a 120 Hz. Más Hz = movimiento más fluido,
            pero por encima de 120 Hz la diferencia es difícil de percibir para la mayoría.
          </p>

          <h3>HDR: más allá de la resolución</h3>
          <p>
            HDR (High Dynamic Range) no añade píxeles sino <strong>más niveles de brillo y color</strong>.
            Un panel HDR puede mostrar desde negro absoluto hasta 1.000+ nits de brillo, con miles de
            millones de colores. Es un salto mayor en calidad percibida que pasar de 1080p a 4K.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> los datos de este explicador son orientativos y se basan en especificaciones
            técnicas generales y estudios científicos publicados. Las características reales varían según
            fabricante, modelo y condiciones de uso.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-pantallas')} />
        <ShareCard appName="visualizador-pantallas" />
        <Footer appName="visualizador-pantallas" />
      </div>
    </>
  );
}
