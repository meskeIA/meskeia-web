'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './OidoEquilibrio.module.css';
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

type Seccion = 'anatomia' | 'vibracion' | 'equilibrio' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'anatomia', titulo: 'Anatomía del oído', icono: '👂', subtitulo: 'Externo, medio e interno' },
  { id: 'vibracion', titulo: 'De vibración a sonido', icono: '🔊', subtitulo: 'Proceso paso a paso' },
  { id: 'equilibrio', titulo: 'Equilibrio', icono: '⚖️', subtitulo: 'Canales semicirculares' },
  { id: 'datos', titulo: 'Datos y pérdida', icono: '📊', subtitulo: 'Audición y tinnitus' },
];

// ─── Datos sección 1: Anatomía ───

type ZonaOido = 'externo' | 'medio' | 'interno';

interface ParteOido {
  nombre: string;
  icono: string;
  descripcion: string;
  detalle: string;
}

interface ZonaInfo {
  id: ZonaOido;
  titulo: string;
  color: string;
  partes: ParteOido[];
}

const ZONAS_OIDO: ZonaInfo[] = [
  {
    id: 'externo',
    titulo: 'Oído externo',
    color: '#2E86AB',
    partes: [
      { nombre: 'Pabellón auricular (oreja)', icono: '👂', descripcion: 'Recoge las ondas sonoras del entorno y las canaliza hacia el interior.', detalle: 'Su forma irregular ayuda a localizar la dirección del sonido' },
      { nombre: 'Canal auditivo', icono: '🕳️', descripcion: 'Tubo de unos 2,5 cm que conduce el sonido hasta el tímpano.', detalle: 'Produce cerumen que protege contra polvo, insectos y bacterias' },
      { nombre: 'Membrana timpánica (tímpano)', icono: '🥁', descripcion: 'Membrana fina que vibra al recibir las ondas sonoras.', detalle: 'Tiene solo 0,1 mm de grosor y vibra con presiones mínimas' },
    ],
  },
  {
    id: 'medio',
    titulo: 'Oído medio',
    color: '#48A9A6',
    partes: [
      { nombre: 'Martillo (malleus)', icono: '🔨', descripcion: 'Primer huesecillo, conectado directamente al tímpano.', detalle: 'Recibe la vibración del tímpano y la transmite al yunque' },
      { nombre: 'Yunque (incus)', icono: '⚒️', descripcion: 'Segundo huesecillo, eslabón intermedio de la cadena.', detalle: 'Conecta el martillo con el estribo' },
      { nombre: 'Estribo (stapes)', icono: '🦴', descripcion: 'El hueso más pequeño del cuerpo humano: solo 3 mm.', detalle: 'Empuja la ventana oval, transmitiendo vibración al oído interno' },
      { nombre: 'Trompa de Eustaquio', icono: '🫁', descripcion: 'Conecta el oído medio con la garganta para igualar presión.', detalle: 'Por eso al tragar se "destapan" los oídos en un avión' },
    ],
  },
  {
    id: 'interno',
    titulo: 'Oído interno',
    color: '#E67E22',
    partes: [
      { nombre: 'Cóclea (caracol)', icono: '🐚', descripcion: 'Estructura en espiral de 2,5 vueltas llena de líquido.', detalle: 'Contiene unas 15.000 células ciliadas que detectan el sonido' },
      { nombre: 'Canales semicirculares', icono: '🔄', descripcion: 'Tres canales en tres planos del espacio que detectan rotación.', detalle: 'Forman parte del sistema vestibular (equilibrio)' },
      { nombre: 'Nervio auditivo/vestibular', icono: '⚡', descripcion: 'Transmite las señales eléctricas al cerebro.', detalle: 'Se bifurca en rama auditiva (sonido) y vestibular (equilibrio)' },
    ],
  },
];

const AMPLIFICACION_HUESECILLOS = 22; // factor de amplificación

// ─── Datos sección 2: Vibración a sonido ───

interface PasoTransduccion {
  numero: number;
  titulo: string;
  descripcion: string;
  detalle: string;
  icono: string;
}

const PASOS_TRANSDUCCION: PasoTransduccion[] = [
  { numero: 1, titulo: 'Onda sonora', descripcion: 'El sonido viaja como onda de presión por el aire.', detalle: 'Las moléculas de aire se comprimen y expanden rítmicamente.', icono: '🌊' },
  { numero: 2, titulo: 'Tímpano vibra', descripcion: 'La membrana timpánica vibra al recibir las ondas.', detalle: 'Incluso presiones de 0,00002 Pa pueden moverla.', icono: '🥁' },
  { numero: 3, titulo: 'Huesecillos amplifican', descripcion: 'Martillo, yunque y estribo amplifican la vibración 22×.', detalle: 'Compensan la diferencia de impedancia entre aire y líquido.', icono: '🔨' },
  { numero: 4, titulo: 'Ventana oval', descripcion: 'El estribo empuja la ventana oval del oído interno.', detalle: 'Transmite la vibración mecánica al líquido de la cóclea.', icono: '🪟' },
  { numero: 5, titulo: 'Líquido de la cóclea se mueve', descripcion: 'La perilinfa y endolinfa transmiten la onda dentro de la cóclea.', detalle: 'El líquido es incompresible: la onda se propaga eficientemente.', icono: '💧' },
  { numero: 6, titulo: 'Membrana basilar ondula', descripcion: 'La onda hace vibrar zonas específicas de la membrana basilar.', detalle: 'Cada zona responde a una frecuencia concreta (tonotopía).', icono: '〰️' },
  { numero: 7, titulo: 'Células ciliadas se doblan', descripcion: 'Los estereocilios de las células ciliadas se inclinan.', detalle: 'Abren canales iónicos que generan una corriente eléctrica.', icono: '🌾' },
  { numero: 8, titulo: 'Señal eléctrica', descripcion: 'Las células ciliadas liberan neurotransmisores.', detalle: 'Convierten energía mecánica en impulsos eléctricos (transducción).', icono: '⚡' },
  { numero: 9, titulo: 'Nervio auditivo → Cerebro', descripcion: 'El nervio auditivo envía la señal a la corteza auditiva.', detalle: 'El cerebro interpreta frecuencia, volumen, dirección y significado.', icono: '🧠' },
];

// Tonotopía
interface ZonaTonotopia {
  zona: string;
  frecuencia: string;
  color: string;
  pct: number;
}

const TONOTOPIA: ZonaTonotopia[] = [
  { zona: 'Base (entrada)', frecuencia: 'Agudos (2-20 kHz)', color: '#e74c3c', pct: 100 },
  { zona: 'Zona media', frecuencia: 'Medios (500-2.000 Hz)', color: '#f1c40f', pct: 65 },
  { zona: 'Ápice (punta)', frecuencia: 'Graves (20-500 Hz)', color: '#2E86AB', pct: 30 },
];

// ─── Datos sección 3: Equilibrio ───

interface CanalSemicircular {
  nombre: string;
  plano: string;
  icono: string;
  movimiento: string;
  ejemplo: string;
}

const CANALES: CanalSemicircular[] = [
  { nombre: 'Horizontal (lateral)', plano: 'Plano horizontal', icono: '↔️', movimiento: 'Girar la cabeza a izquierda/derecha', ejemplo: 'Decir "no" con la cabeza' },
  { nombre: 'Anterior (superior)', plano: 'Plano sagital', icono: '↕️', movimiento: 'Inclinar la cabeza adelante/atrás', ejemplo: 'Decir "sí" con la cabeza' },
  { nombre: 'Posterior', plano: 'Plano coronal', icono: '🔃', movimiento: 'Ladear la cabeza a un lado', ejemplo: 'Tocar la oreja con el hombro' },
];

// ─── Datos sección 4: Pérdida auditiva y datos ───

interface CausaPerdida {
  nombre: string;
  icono: string;
  descripcion: string;
  poblacion: string;
}

const CAUSAS_PERDIDA: CausaPerdida[] = [
  { nombre: 'Ruido excesivo', icono: '🔊', descripcion: 'Principal causa en jóvenes. Auriculares a volumen alto, conciertos, fábricas.', poblacion: 'Causa #1 evitable' },
  { nombre: 'Edad (presbiacusia)', icono: '👴', descripcion: 'Deterioro progresivo natural. Empieza hacia los 40-50 años.', poblacion: '1 de 3 mayores de 65' },
  { nombre: 'Genética', icono: '🧬', descripcion: 'Más de 100 genes relacionados con pérdida auditiva hereditaria.', poblacion: '50-60% de los casos congénitos' },
  { nombre: 'Infecciones', icono: '🦠', descripcion: 'Otitis media, meningitis, sarampión, paperas. Pueden dañar las estructuras.', poblacion: 'Frecuente en niños' },
  { nombre: 'Medicamentos ototóxicos', icono: '💊', descripcion: 'Algunos antibióticos (aminoglucósidos), quimioterapia, dosis altas de aspirina.', poblacion: 'Reversible a veces' },
];

interface FrecuenciaPerdida {
  rango: string;
  vulnerabilidad: number;
  color: string;
  nota: string;
}

const FREQ_PERDIDA: FrecuenciaPerdida[] = [
  { rango: '4-6 kHz', vulnerabilidad: 100, color: '#e74c3c', nota: 'Primeras en perderse' },
  { rango: '2-4 kHz', vulnerabilidad: 75, color: '#e67e22', nota: 'Consonantes s, f, t' },
  { rango: '6-8 kHz', vulnerabilidad: 60, color: '#f1c40f', nota: 'Agudos altos' },
  { rango: '1-2 kHz', vulnerabilidad: 35, color: '#2E86AB', nota: 'Frecuencias del habla' },
  { rango: '250-1.000 Hz', vulnerabilidad: 15, color: '#48A9A6', nota: 'Graves (las últimas)' },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function OidoEquilibrioPage() {
  const [seccion, setSeccion] = useState<Seccion>('anatomia');
  const [zonaActiva, setZonaActiva] = useState<ZonaOido>('externo');
  const [pasoActivo, setPasoActivo] = useState(0);
  const [canalActivo, setCanalActivo] = useState(0);

  // ─── Sección 1: Anatomía ───

  function renderAnatomia() {
    const zona = ZONAS_OIDO.find(z => z.id === zonaActiva) ?? ZONAS_OIDO[0];

    return (
      <>
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>Anatomía del oído humano</h2>
          <p className={styles.seccionSubtitulo}>Pulsa cada zona para explorar sus estructuras</p>
        </div>

        {/* SVG corte del oído */}
        <div className={styles.svgContainer}>
          <svg viewBox="0 0 800 400" aria-label="Corte transversal del oído humano con tres zonas: externo, medio e interno">
            {/* Fondo */}
            <rect x="0" y="0" width="800" height="400" fill="none" />

            {/* Líneas de separación */}
            <line x1="280" y1="30" x2="280" y2="370" stroke="#ccc" strokeWidth="1" strokeDasharray="6 4" />
            <line x1="520" y1="30" x2="520" y2="370" stroke="#ccc" strokeWidth="1" strokeDasharray="6 4" />

            {/* Zona: Oído externo */}
            <g
              className={styles.zonaOido}
              onClick={() => setZonaActiva('externo')}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setZonaActiva('externo')}
              aria-label="Oído externo: pabellón auricular, canal auditivo, tímpano"
            >
              <rect x="10" y="30" width="260" height="340" rx="12" fill={zonaActiva === 'externo' ? 'rgba(46,134,171,0.12)' : 'rgba(46,134,171,0.04)'} stroke={zonaActiva === 'externo' ? '#2E86AB' : 'transparent'} strokeWidth="2" />
              {/* Pabellón auricular (forma de oreja simplificada) */}
              <ellipse cx="80" cy="180" rx="45" ry="80" fill="none" stroke="#2E86AB" strokeWidth="3" />
              <ellipse cx="80" cy="180" rx="28" ry="55" fill="none" stroke="#2E86AB" strokeWidth="2" opacity="0.6" />
              {/* Canal auditivo */}
              <rect x="125" y="168" width="120" height="24" rx="12" fill="rgba(46,134,171,0.15)" stroke="#2E86AB" strokeWidth="2" />
              <text x="165" y="185" fill="#2E86AB" fontSize="10" fontWeight="600" textAnchor="middle">Canal (2,5 cm)</text>
              {/* Tímpano */}
              <ellipse cx="255" cy="180" rx="8" ry="35" fill="rgba(46,134,171,0.25)" stroke="#2E86AB" strokeWidth="2.5" />
              <text x="255" y="230" fill="#2E86AB" fontSize="10" fontWeight="700" textAnchor="middle">Tímpano</text>
              {/* Flechas de sonido */}
              <path d="M 20,170 L 55,175" fill="none" stroke="#2E86AB" strokeWidth="1.5" markerEnd="url(#arrowBlue)" opacity="0.5" />
              <path d="M 20,190 L 55,185" fill="none" stroke="#2E86AB" strokeWidth="1.5" markerEnd="url(#arrowBlue)" opacity="0.5" />
              <text x="140" y="60" fill="#2E86AB" fontSize="14" fontWeight="700" textAnchor="middle" className={styles.zonaLabel}>OÍDO EXTERNO</text>
            </g>

            {/* Zona: Oído medio */}
            <g
              className={styles.zonaOido}
              onClick={() => setZonaActiva('medio')}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setZonaActiva('medio')}
              aria-label="Oído medio: martillo, yunque, estribo, trompa de Eustaquio"
            >
              <rect x="290" y="30" width="220" height="340" rx="12" fill={zonaActiva === 'medio' ? 'rgba(72,169,166,0.12)' : 'rgba(72,169,166,0.04)'} stroke={zonaActiva === 'medio' ? '#48A9A6' : 'transparent'} strokeWidth="2" />
              {/* Huesecillos */}
              {/* Martillo */}
              <circle cx="320" cy="160" r="10" fill="rgba(72,169,166,0.3)" stroke="#48A9A6" strokeWidth="2.5" />
              <line x1="320" y1="170" x2="320" y2="210" stroke="#48A9A6" strokeWidth="3" />
              <text x="320" y="230" fill="#48A9A6" fontSize="9" fontWeight="600" textAnchor="middle">Martillo</text>
              {/* Yunque */}
              <circle cx="380" cy="145" r="12" fill="rgba(72,169,166,0.3)" stroke="#48A9A6" strokeWidth="2.5" />
              <line x1="330" y1="160" x2="370" y2="148" stroke="#48A9A6" strokeWidth="2.5" />
              <text x="380" y="175" fill="#48A9A6" fontSize="9" fontWeight="600" textAnchor="middle">Yunque</text>
              {/* Estribo */}
              <ellipse cx="440" cy="160" rx="12" ry="8" fill="rgba(72,169,166,0.3)" stroke="#48A9A6" strokeWidth="2.5" />
              <line x1="392" y1="148" x2="428" y2="158" stroke="#48A9A6" strokeWidth="2.5" />
              <text x="440" y="185" fill="#48A9A6" fontSize="9" fontWeight="600" textAnchor="middle">Estribo (3 mm)</text>
              {/* Amplificación */}
              <text x="380" y="120" fill="#48A9A6" fontSize="11" fontWeight="800" textAnchor="middle">×22 amplificación</text>
              {/* Trompa de Eustaquio */}
              <path d="M 350,280 Q 380,320 430,340" fill="none" stroke="#48A9A6" strokeWidth="2" strokeDasharray="4 3" />
              <text x="400" y="355" fill="#48A9A6" fontSize="9" fontWeight="600" textAnchor="middle">Trompa de Eustaquio</text>
              <text x="400" y="60" fill="#48A9A6" fontSize="14" fontWeight="700" textAnchor="middle" className={styles.zonaLabel}>OÍDO MEDIO</text>
            </g>

            {/* Zona: Oído interno */}
            <g
              className={styles.zonaOido}
              onClick={() => setZonaActiva('interno')}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setZonaActiva('interno')}
              aria-label="Oído interno: cóclea, canales semicirculares, nervio auditivo"
            >
              <rect x="530" y="30" width="260" height="340" rx="12" fill={zonaActiva === 'interno' ? 'rgba(230,126,34,0.12)' : 'rgba(230,126,34,0.04)'} stroke={zonaActiva === 'interno' ? '#E67E22' : 'transparent'} strokeWidth="2" />
              {/* Cóclea (espiral) */}
              <path d="M 620,220 Q 620,180 650,180 Q 680,180 680,210 Q 680,240 650,240 Q 635,240 635,225 Q 635,210 650,210" fill="none" stroke="#E67E22" strokeWidth="3" />
              <text x="655" y="260" fill="#E67E22" fontSize="10" fontWeight="700" textAnchor="middle">Cóclea</text>
              <text x="655" y="274" fill="#E67E22" fontSize="8" textAnchor="middle">(2,5 vueltas)</text>
              {/* Canales semicirculares */}
              <ellipse cx="640" cy="110" rx="40" ry="25" fill="none" stroke="#E67E22" strokeWidth="2.5" transform="rotate(-15 640 110)" />
              <ellipse cx="680" cy="130" rx="25" ry="35" fill="none" stroke="#E67E22" strokeWidth="2" opacity="0.7" transform="rotate(10 680 130)" />
              <ellipse cx="610" cy="130" rx="20" ry="30" fill="none" stroke="#E67E22" strokeWidth="2" opacity="0.7" transform="rotate(-20 610 130)" />
              <text x="640" y="80" fill="#E67E22" fontSize="9" fontWeight="600" textAnchor="middle">Canales semicirculares</text>
              {/* Nervio */}
              <line x1="680" y1="230" x2="760" y2="200" stroke="#E67E22" strokeWidth="4" strokeLinecap="round" />
              <text x="755" y="190" fill="#E67E22" fontSize="9" fontWeight="600" textAnchor="middle">Nervio</text>
              <circle cx="770" cy="185" r="14" fill="rgba(230,126,34,0.15)" stroke="#E67E22" strokeWidth="2" />
              <text x="770" y="189" fill="#E67E22" fontSize="12" textAnchor="middle">🧠</text>
              <text x="660" y="60" fill="#E67E22" fontSize="14" fontWeight="700" textAnchor="middle" className={styles.zonaLabel}>OÍDO INTERNO</text>
            </g>

            {/* Ventana oval (conexión medio→interno) */}
            <ellipse cx="515" cy="160" rx="6" ry="18" fill="rgba(230,126,34,0.3)" stroke="#E67E22" strokeWidth="2" />
            <text x="515" y="200" fill="#666" fontSize="8" fontWeight="600" textAnchor="middle">Ventana oval</text>

            {/* Defs */}
            <defs>
              <marker id="arrowBlue" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#2E86AB" />
              </marker>
            </defs>
          </svg>
        </div>

        {/* Panel info zona seleccionada */}
        <div className={styles.zonaInfoPanel} style={{ borderColor: zona.color }}>
          <h3 className={styles.zonaInfoTitulo} style={{ color: zona.color }}>
            <span aria-hidden="true">{zona.id === 'externo' ? '👂' : zona.id === 'medio' ? '🔨' : '🐚'}</span>
            {zona.titulo}
          </h3>
          <div className={styles.zonaInfoGrid}>
            {zona.partes.map(parte => (
              <div key={parte.nombre} className={styles.etiquetaCard} style={{ borderLeftColor: zona.color }}>
                <div className={styles.etiquetaHeader}>
                  <span className={styles.etiquetaIcono} aria-hidden="true">{parte.icono}</span>
                  <h4 className={styles.etiquetaNombre}>{parte.nombre}</h4>
                </div>
                <p className={styles.etiquetaDesc}>{parte.descripcion} <em>{parte.detalle}</em></p>
              </div>
            ))}
          </div>
        </div>

        {/* Dato amplificación */}
        <div className={styles.datoDestacado}>
          <div>
            <span className={styles.datoNumero}>×{AMPLIFICACION_HUESECILLOS}</span>
            <span className={styles.datoUnidad}> amplificación</span>
          </div>
          <p className={styles.datoTexto}>
            Los 3 huesecillos más pequeños del cuerpo humano (martillo, yunque y estribo) amplifican la vibración del tímpano 22 veces antes de transmitirla al oído interno. Compensan la pérdida de energía al pasar de un medio aéreo a uno líquido.
          </p>
        </div>

        <div className={styles.insight}>
          <p>
            <strong>¿Sabías que...</strong> el estribo (stapes) mide solo 3 mm y pesa 3 mg? Es el hueso más pequeño del cuerpo humano. A pesar de su tamaño, es esencial: sin él, perderíamos unos 30 dB de audición.
          </p>
        </div>
      </>
    );
  }

  // ─── Sección 2: De vibración a sonido ───

  function renderVibracion() {
    return (
      <>
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>De vibración a sonido</h2>
          <p className={styles.seccionSubtitulo}>9 pasos desde la onda sonora hasta la percepción</p>
        </div>

        <div className={styles.contexto}>
          Todo el proceso ocurre en milisegundos: una vibración en el aire se convierte en señal eléctrica que el cerebro interpreta como sonido.
        </div>

        {/* Pasos del proceso */}
        <div className={styles.pasoGrid}>
          {PASOS_TRANSDUCCION.map((paso, i) => (
            <div key={paso.numero}>
              <div
                className={`${styles.pasoCard} ${pasoActivo === i ? styles.pasoActivo : ''}`}
                onClick={() => setPasoActivo(i)}
                onKeyDown={e => e.key === 'Enter' && setPasoActivo(i)}
                role="button"
                tabIndex={0}
                aria-pressed={pasoActivo === i}
              >
                <div className={`${styles.pasoNumero} ${pasoActivo === i ? styles.pasoActivoNumero : ''}`}>
                  <span aria-hidden="true">{paso.icono}</span>
                </div>
                <div className={styles.pasoContenido}>
                  <h3 className={styles.pasoTitulo}>{paso.numero}. {paso.titulo}</h3>
                  <p className={styles.pasoDesc}>{paso.descripcion}</p>
                  {pasoActivo === i && (
                    <p className={styles.pasoDetalle}>{paso.detalle}</p>
                  )}
                </div>
              </div>
              {i < PASOS_TRANSDUCCION.length - 1 && (
                <div className={styles.pasoFlecha} aria-hidden="true">↓</div>
              )}
            </div>
          ))}
        </div>

        {/* Tonotopía */}
        <div className={styles.card}>
          <h3 className={styles.cardTitulo}>Tonotopía de la cóclea</h3>
          <p className={styles.cardSubtitulo}>Como un piano desenrollado: cada zona detecta una frecuencia</p>
          <div className={styles.barraComparativa}>
            {TONOTOPIA.map(z => (
              <div key={z.zona} className={styles.barraRow}>
                <span className={styles.barraNombre}>{z.zona}</span>
                <div className={styles.barraContainer}>
                  <div className={styles.barraFill} style={{ width: `${z.pct}%`, background: z.color }} />
                </div>
                <span className={styles.barraValor} style={{ color: z.color }}>{z.frecuencia}</span>
              </div>
            ))}
          </div>
          <div className={styles.insight}>
            <p>
              <strong>Base = agudos, ápice = graves.</strong> La membrana basilar es más estrecha y rígida en la base (responde a frecuencias altas) y más ancha y flexible en el ápice (frecuencias bajas). Es un espectrómetro natural.
            </p>
          </div>
        </div>

        <div className={styles.datoDestacado}>
          <div>
            <span className={styles.datoNumero}>{formatNumber(15000, 0)}</span>
            <span className={styles.datoUnidad}> células ciliadas</span>
          </div>
          <p className={styles.datoTexto}>
            Nacemos con unas {formatNumber(15000, 0)} células ciliadas en cada cóclea. <strong>No se regeneran:</strong> cada célula que muere es una pérdida permanente de audición. Los reptiles y las aves sí pueden regenerarlas, los mamíferos no.
          </p>
        </div>

        <div className={styles.warningBox}>
          <span aria-hidden="true">⚠️</span> Las células ciliadas son <strong>irreemplazables</strong> en humanos. La exposición prolongada a ruido fuerte las destruye gradualmente. Por eso la pérdida auditiva por ruido es acumulativa y permanente.
        </div>
      </>
    );
  }

  // ─── Sección 3: Equilibrio ───

  function renderEquilibrio() {
    const canal = CANALES[canalActivo];

    return (
      <>
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>Sistema vestibular: el equilibrio</h2>
          <p className={styles.seccionSubtitulo}>Tres canales semicirculares detectan rotación en los 3 planos del espacio</p>
        </div>

        {/* 3 canales */}
        <div className={styles.canalesGrid}>
          {CANALES.map((c, i) => (
            <div
              key={c.nombre}
              className={`${styles.canalCard} ${canalActivo === i ? styles.canalActivo : ''}`}
              onClick={() => setCanalActivo(i)}
              onKeyDown={e => e.key === 'Enter' && setCanalActivo(i)}
              role="button"
              tabIndex={0}
              aria-pressed={canalActivo === i}
            >
              <div className={styles.canalIcono} aria-hidden="true">{c.icono}</div>
              <h3 className={styles.canalNombre}>{c.nombre}</h3>
              <p className={styles.canalPlano}>{c.plano}</p>
              <p className={styles.canalDesc}>{c.movimiento}</p>
            </div>
          ))}
        </div>

        <div className={styles.insight}>
          <p>
            <strong>{canal.nombre}:</strong> detecta cuando {canal.movimiento.toLowerCase()}.
            Ejemplo: {canal.ejemplo.toLowerCase()}.
          </p>
        </div>

        {/* Cómo funciona */}
        <div className={styles.card}>
          <h3 className={styles.cardTitulo}>¿Cómo detectan el movimiento?</h3>
          <p className={styles.cardSubtitulo}>Endolinfa + células ciliadas = sensor de rotación</p>
          <div className={styles.etiquetasGrid}>
            <div className={styles.etiquetaCard}>
              <div className={styles.etiquetaHeader}>
                <span className={styles.etiquetaIcono} aria-hidden="true">💧</span>
                <h4 className={styles.etiquetaNombre}>Endolinfa</h4>
              </div>
              <p className={styles.etiquetaDesc}>
                Líquido que llena los canales semicirculares. Al girar la cabeza, la inercia hace que el líquido se mueva en dirección opuesta, como el agua en un vaso al girarlo.
              </p>
            </div>
            <div className={styles.etiquetaCard}>
              <div className={styles.etiquetaHeader}>
                <span className={styles.etiquetaIcono} aria-hidden="true">🌾</span>
                <h4 className={styles.etiquetaNombre}>Cúpula y células ciliadas</h4>
              </div>
              <p className={styles.etiquetaDesc}>
                El movimiento de la endolinfa empuja la cúpula gelatinosa (como una puerta batiente), que dobla los cilios de las células sensoriales. Esto genera una señal eléctrica que el cerebro interpreta como rotación.
              </p>
            </div>
          </div>
        </div>

        {/* Otolitos */}
        <div className={styles.card}>
          <h3 className={styles.cardTitulo}>Otolitos: gravedad y aceleración lineal</h3>
          <p className={styles.cardSubtitulo}>Cristales de carbonato de calcio que detectan la posición de la cabeza</p>
          <div className={styles.etiquetasGrid}>
            <div className={styles.etiquetaCard}>
              <div className={styles.etiquetaHeader}>
                <span className={styles.etiquetaIcono} aria-hidden="true">💎</span>
                <h4 className={styles.etiquetaNombre}>Utrículo y sáculo</h4>
              </div>
              <p className={styles.etiquetaDesc}>
                Dos cavidades con una capa de cristales de calcio (otolitos u otoconia) sobre células ciliadas. La gravedad tira de los cristales, indicando si la cabeza está inclinada, y la aceleración lineal los desplaza (ej. al frenar en un coche).
              </p>
            </div>
          </div>
        </div>

        {/* Mareo y vértigo */}
        <div className={styles.fenomenoCard}>
          <h3 className={styles.fenomenoTitulo}>
            <span aria-hidden="true">🤢</span> Mareo por movimiento (cinetosis)
          </h3>
          <p className={styles.fenomenoDesc}>
            Ocurre cuando hay conflicto sensorial: los ojos ven algo estable (ej. el interior de un coche) pero el oído interno detecta movimiento. El cerebro no puede reconciliar las dos señales y produce náuseas. Mirar al horizonte ayuda porque alinea la información visual con la vestibular.
          </p>
        </div>

        <div className={styles.fenomenoCard}>
          <h3 className={styles.fenomenoTitulo}>
            <span aria-hidden="true">🌀</span> Vértigo posicional (VPPB)
          </h3>
          <p className={styles.fenomenoDesc}>
            Vértigo Posicional Paroxístico Benigno: pequeños otolitos se desprenden y flotan libremente en un canal semicircular. Al mover la cabeza, causan señales falsas de rotación intensa. Es la causa más común de vértigo y se trata con maniobras de reposicionamiento (Epley).
          </p>
        </div>

        <div className={styles.datoDestacado}>
          <div>
            <span className={styles.datoNumero}>3</span>
            <span className={styles.datoUnidad}> planos</span>
          </div>
          <p className={styles.datoTexto}>
            Los 3 canales semicirculares están orientados en ángulos casi perpendiculares entre sí. Juntos, detectan rotación en cualquier dirección: horizontal, vertical y lateral. Es como tener un giroscopio biológico.
          </p>
        </div>
      </>
    );
  }

  // ─── Sección 4: Datos y pérdida auditiva ───

  function renderDatos() {
    return (
      <>
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>Datos y pérdida auditiva</h2>
          <p className={styles.seccionSubtitulo}>Números, causas, tinnitus e implante coclear</p>
        </div>

        {/* Comparativa numérica */}
        <div className={styles.datosGrid}>
          <div className={styles.datoCard}>
            <div className={styles.datoValor}>{formatNumber(15000, 0)}</div>
            <p className={styles.datoEtiqueta}>Células ciliadas (oído)</p>
          </div>
          <div className={styles.datoCard}>
            <div className={styles.datoValor}>{formatNumber(120000000, 0)}</div>
            <p className={styles.datoEtiqueta}>Fotorreceptores (retina)</p>
          </div>
          <div className={styles.datoCard}>
            <div className={styles.datoValor}>20 – {formatNumber(20000, 0)} Hz</div>
            <p className={styles.datoEtiqueta}>Rango audible humano</p>
          </div>
          <div className={styles.datoCard}>
            <div className={styles.datoValor}>10-15%</div>
            <p className={styles.datoEtiqueta}>Población con tinnitus</p>
          </div>
        </div>

        {/* Frecuencias que se pierden primero */}
        <div className={styles.card}>
          <h3 className={styles.cardTitulo}>Orden de pérdida auditiva por frecuencia</h3>
          <p className={styles.cardSubtitulo}>Primero se pierden los agudos (4-6 kHz)</p>
          <div className={styles.freqGrid}>
            {FREQ_PERDIDA.map(f => (
              <div key={f.rango} className={styles.freqRow}>
                <span className={styles.freqLabel}>{f.rango}</span>
                <div className={styles.freqBarContainer}>
                  <div className={styles.freqBar} style={{ width: `${f.vulnerabilidad}%`, background: f.color }} />
                </div>
                <span className={styles.freqPct} style={{ color: f.color }}>{f.nota}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Causas de pérdida */}
        <div className={styles.card}>
          <h3 className={styles.cardTitulo}>Principales causas de pérdida auditiva</h3>
          <div className={styles.causasGrid}>
            {CAUSAS_PERDIDA.map(c => (
              <div key={c.nombre} className={styles.causaRow}>
                <span className={styles.causaIcono} aria-hidden="true">{c.icono}</span>
                <div className={styles.causaInfo}>
                  <span className={styles.causaNombre}>{c.nombre} — <em>{c.poblacion}</em></span>
                  <span className={styles.causaDesc}>{c.descripcion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tinnitus */}
        <div className={styles.fenomenoCard}>
          <h3 className={styles.fenomenoTitulo}>
            <span aria-hidden="true">🔔</span> Tinnitus (acúfenos)
          </h3>
          <p className={styles.fenomenoDesc}>
            Percepción de un sonido &quot;fantasma&quot; (pitido, zumbido, silbido) sin fuente externa. Afecta al 10-15% de la población mundial.
            Ocurre porque las células ciliadas dañadas envían señales erróneas al cerebro, que las interpreta como sonido real.
            No tiene cura definitiva, pero existen terapias de habituación, enmascaramiento y terapia cognitivo-conductual.
          </p>
        </div>

        {/* Implante coclear */}
        <div className={styles.fenomenoCard}>
          <h3 className={styles.fenomenoTitulo}>
            <span aria-hidden="true">🦻</span> Implante coclear
          </h3>
          <p className={styles.fenomenoDesc}>
            Dispositivo electrónico que sustituye la función de las células ciliadas dañadas.
            Un micrófono externo capta el sonido, lo procesa y envía señales eléctricas directamente al nervio auditivo a través de electrodos implantados en la cóclea.
            Más de 1 millón de personas en el mundo llevan uno. No restaura la audición normal, pero permite reconocer habla y sonidos del entorno.
          </p>
        </div>

        {/* Regla 60/60 */}
        <div className={styles.card}>
          <h3 className={styles.cardTitulo}>Regla 60/60</h3>
          <p className={styles.cardSubtitulo}>La recomendación de la OMS para auriculares</p>
          <div className={styles.datosGrid}>
            <div className={styles.datoCard}>
              <div className={styles.datoValor}>60%</div>
              <p className={styles.datoEtiqueta}>Volumen máximo</p>
            </div>
            <div className={styles.datoCard}>
              <div className={styles.datoValor}>60 min</div>
              <p className={styles.datoEtiqueta}>Tiempo máximo seguido</p>
            </div>
          </div>
          <div className={styles.warningBox}>
            <span aria-hidden="true">⚠️</span> La OMS estima que {formatNumber(1100, 0)} millones de jóvenes (12-35 años) están en riesgo de pérdida auditiva por exposición a música alta. Los auriculares intraauriculares concentran el sonido directamente en el tímpano.
          </div>
        </div>

        {/* Dato curioso */}
        <div className={styles.insight}>
          <p>
            <strong>Curiosidad:</strong> las orejas nunca dejan de crecer. Están hechas de cartílago, no de hueso, y el cartílago sigue creciendo lentamente toda la vida. Por eso los ancianos suelen tener orejas más grandes — crecen unos 0,22 mm al año.
          </p>
        </div>

        <div className={styles.datoDestacado}>
          <div>
            <span className={styles.datoNumero}>{formatNumber(15000, 0)}</span>
            <span className={styles.datoUnidad}> vs {formatNumber(120000000, 0)}</span>
          </div>
          <p className={styles.datoTexto}>
            El oído tiene {formatNumber(15000, 0)} células ciliadas frente a los {formatNumber(120000000, 0)} de fotorreceptores en la retina. A pesar de esta diferencia de 8.000×, el oído discrimina más de {formatNumber(340000, 0)} tonos diferentes.
          </p>
        </div>
      </>
    );
  }

  // ─── Render principal ───

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">👂</span> Oído y Equilibrio</h1>
          <p className={styles.subtitle}>Anatomía, audición, sistema vestibular y pérdida auditiva</p>
        </header>

        <LegalNotice />

        {/* Navegación */}
        <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccion === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccion(s.id)}
              aria-pressed={seccion === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Contenido de sección activa */}
        {seccion === 'anatomia' && renderAnatomia()}
        {seccion === 'vibracion' && renderVibracion()}
        {seccion === 'equilibrio' && renderEquilibrio()}
        {seccion === 'datos' && renderDatos()}

        {/* Contenido educativo */}
        <EducationalSection
          title="📚 ¿Quieres profundizar?"
          subtitle="Conceptos avanzados sobre audición y equilibrio"
        >
          <section>
            <h2>El oído como prodigio de ingeniería</h2>
            <p>
              El oído humano puede detectar vibraciones del tímpano de apenas 0,01 nanómetros (la décima parte
              del diámetro de un átomo de hidrógeno). Es tan sensible que si fuera un poco más, oiríamos el
              movimiento browniano de las moléculas de aire — un ruido constante.
            </p>
            <p>
              El rango dinámico (desde el sonido más suave al más fuerte) abarca 12 órdenes de magnitud
              de presión. Ningún micrófono artificial iguala esta hazaña.
            </p>

            <h2>Ototopografía: un mapa de frecuencias en el cerebro</h2>
            <p>
              La organización tonotópica de la cóclea se preserva en el nervio auditivo y en la corteza auditiva.
              Las neuronas corticales están organizadas por frecuencia, de grave a agudo, como un teclado de piano
              proyectado sobre la superficie del cerebro.
            </p>

            <h2>Localización del sonido</h2>
            <p>
              El cerebro determina de dónde viene un sonido comparando dos señales: la diferencia de tiempo
              interaural (ITD, hasta 0,6 ms de diferencia entre oídos) y la diferencia de intensidad interaural
              (ILD, las frecuencias altas se atenúan por la sombra acústica de la cabeza). Con ambas pistas,
              localizamos la fuente con precisión de 1-2 grados.
            </p>

            <h2>Investigación en regeneración de células ciliadas</h2>
            <p>
              Las aves y los reptiles regeneran células ciliadas de forma natural. En 2024, varios ensayos
              clínicos investigan terapias génicas (como la activación del gen Atoh1) y moléculas pequeñas
              para inducir la regeneración en mamíferos. Si tienen éxito, podrían revertir la pérdida auditiva
              neurosensorial por primera vez en la historia.
            </p>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-oido-equilibrio')} />
        <ShareCard appName="visualizador-oido-equilibrio" />
        <Footer appName="visualizador-oido-equilibrio" />
      </div>
    </>
  );
}
