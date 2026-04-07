'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './ComoFuncionaWifi.module.css';
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
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'ondas' | 'propagacion' | 'canales' | 'consejos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'ondas', titulo: 'Ondas y Frecuencias', icono: '📡', subtitulo: 'Qué es una onda WiFi y cómo viaja' },
  { id: 'propagacion', titulo: 'Propagación', icono: '🏠', subtitulo: 'Cómo se degrada la señal en tu casa' },
  { id: 'canales', titulo: 'Canales', icono: '📊', subtitulo: 'Solapamiento y congestión de señal' },
  { id: 'consejos', titulo: 'Consejos y Datos', icono: '💡', subtitulo: 'Mejora tu WiFi y curiosidades' },
];

// ─────────────────────────────────────────────
// Sección 1: Ondas y Frecuencias
// ─────────────────────────────────────────────

function SeccionOndas() {
  const [frecuenciaActiva, setFrecuenciaActiva] = useState<'2.4' | '5'>('2.4');

  const comparativa = {
    '2.4': {
      frecuencia: '2,4 GHz',
      velocidadTipica: '50 – 150 Mbps',
      alcance: '~45 metros',
      penetracion: 'Alta',
      canales: '14 (3 sin solape)',
      color: '#2E86AB',
      descripcion: 'Ondas más largas que atraviesan paredes mejor, pero con menos velocidad y más interferencias (microondas, Bluetooth, vecinos).',
    },
    '5': {
      frecuencia: '5 GHz',
      velocidadTipica: '200 – 800 Mbps',
      alcance: '~15 metros',
      penetracion: 'Baja',
      canales: '25+ (sin solape)',
      color: '#48A9A6',
      descripcion: 'Ondas más cortas y rápidas, pero se debilitan más con los obstáculos. Ideal para la misma habitación del router.',
    },
  };

  const activa = comparativa[frecuenciaActiva];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El WiFi transmite datos mediante <strong>ondas electromagnéticas</strong>, igual que la radio o la luz visible. Tu router convierte datos digitales en ondas de radio que viajan a la velocidad de la luz hasta tus dispositivos.</p>
      </div>

      {/* SVG de onda senoidal */}
      <div className={styles.ondaContainer}>
        <svg viewBox="0 0 400 120" className={styles.ondaSvg} aria-label="Representación de onda electromagnética">
          {/* Onda 2.4 GHz - longitud de onda más larga */}
          <path
            d={frecuenciaActiva === '2.4'
              ? 'M 0 60 Q 50 0, 100 60 Q 150 120, 200 60 Q 250 0, 300 60 Q 350 120, 400 60'
              : 'M 0 60 Q 25 0, 50 60 Q 75 120, 100 60 Q 125 0, 150 60 Q 175 120, 200 60 Q 225 0, 250 60 Q 275 120, 300 60 Q 325 0, 350 60 Q 375 120, 400 60'
            }
            fill="none"
            stroke={activa.color}
            strokeWidth="3"
            className={styles.ondaPath}
          />
          <text x="200" y="110" textAnchor="middle" fill={activa.color} fontSize="12" fontWeight="600">
            {frecuenciaActiva === '2.4' ? 'λ ≈ 12,5 cm (onda más larga)' : 'λ ≈ 6 cm (onda más corta)'}
          </text>
        </svg>

        <div className={styles.frecuenciaBotones}>
          <button
            type="button"
            className={`${styles.frecuenciaBtn} ${frecuenciaActiva === '2.4' ? styles.frecuenciaBtnActivo : ''}`}
            onClick={() => setFrecuenciaActiva('2.4')}
            aria-pressed={frecuenciaActiva === '2.4'}
            style={frecuenciaActiva === '2.4' ? { background: '#2E86AB', borderColor: '#2E86AB' } : {}}
          >
            2,4 GHz
          </button>
          <button
            type="button"
            className={`${styles.frecuenciaBtn} ${frecuenciaActiva === '5' ? styles.frecuenciaBtnActivo : ''}`}
            onClick={() => setFrecuenciaActiva('5')}
            aria-pressed={frecuenciaActiva === '5'}
            style={frecuenciaActiva === '5' ? { background: '#48A9A6', borderColor: '#48A9A6' } : {}}
          >
            5 GHz
          </button>
        </div>
      </div>

      {/* Tarjeta de info de la frecuencia activa */}
      <div className={styles.frecuenciaInfo} style={{ borderLeftColor: activa.color }}>
        <p className={styles.frecuenciaDesc}>{activa.descripcion}</p>
      </div>

      {/* Tabla comparativa */}
      <div className={styles.tablaContainer}>
        <h3 className={styles.tablaTitulo}>Comparativa 2,4 GHz vs 5 GHz</h3>
        <div className={styles.tablaResponsive}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Característica</th>
                <th style={{ color: '#2E86AB' }}>2,4 GHz</th>
                <th style={{ color: '#48A9A6' }}>5 GHz</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Velocidad típica</td><td>50 – 150 Mbps</td><td>200 – 800 Mbps</td></tr>
              <tr><td>Alcance</td><td>~45 m</td><td>~15 m</td></tr>
              <tr><td>Penetración</td><td>Alta</td><td>Baja</td></tr>
              <tr><td>Canales sin solape</td><td>3</td><td>25+</td></tr>
              <tr><td>Interferencias</td><td>Muchas (microondas, BT)</td><td>Pocas</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          <strong>¿Por qué existen dos frecuencias?</strong> Es un compromiso entre alcance y velocidad. La banda de 2,4 GHz llega más lejos pero es más lenta y congestionada. La de 5 GHz es rápida pero no atraviesa bien las paredes. Los routers modernos (dual-band) usan ambas simultáneamente.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Propagación en el Hogar
// ─────────────────────────────────────────────

interface MaterialInfo {
  nombre: string;
  perdida: string;
  db: number;
  icono: string;
  ejemplo: string;
}

function SeccionPropagacion() {
  const [materialActivo, setMaterialActivo] = useState<number | null>(null);

  const materiales: MaterialInfo[] = [
    { nombre: 'Cristal', perdida: '-3 dB', db: 3, icono: '🪟', ejemplo: 'Ventanas, mamparas de ducha' },
    { nombre: 'Madera', perdida: '-2 dB', db: 2, icono: '🪵', ejemplo: 'Puertas, muebles, estanterías' },
    { nombre: 'Ladrillo', perdida: '-6 dB', db: 6, icono: '🧱', ejemplo: 'Paredes interiores, tabiques' },
    { nombre: 'Hormigón', perdida: '-12 dB', db: 12, icono: '🏗️', ejemplo: 'Muros de carga, forjados entre pisos' },
    { nombre: 'Metal', perdida: '-20 dB', db: 20, icono: '🔩', ejemplo: 'Puertas blindadas, electrodomésticos' },
    { nombre: 'Agua', perdida: '-15 dB', db: 15, icono: '💧', ejemplo: 'Acuarios, piscinas, el propio cuerpo humano' },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La señal WiFi pierde fuerza al atravesar obstáculos. Cada material absorbe parte de la energía de la onda. La diferencia entre una pared de madera (-2 dB) y una de hormigón (-12 dB) puede ser la diferencia entre tener WiFi o no.</p>
      </div>

      {/* SVG plano de casa con señal */}
      <div className={styles.plantaContainer}>
        <svg viewBox="0 0 400 300" className={styles.plantaSvg} aria-label="Plano de casa con propagación WiFi">
          {/* Paredes externas */}
          <rect x="20" y="20" width="360" height="260" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.3" rx="4" />

          {/* Paredes internas */}
          <line x1="200" y1="20" x2="200" y2="160" stroke="currentColor" strokeWidth="3" opacity="0.3" />
          <line x1="20" y1="160" x2="280" y2="160" stroke="currentColor" strokeWidth="3" opacity="0.3" />
          <line x1="280" y1="160" x2="280" y2="280" stroke="currentColor" strokeWidth="3" opacity="0.3" />

          {/* Etiquetas de habitaciones */}
          <text x="100" y="95" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.5">Salón</text>
          <text x="300" y="95" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.5">Dormitorio</text>
          <text x="140" y="225" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.5">Cocina</text>
          <text x="340" y="225" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.5">Baño</text>

          {/* Círculos de señal - degradándose */}
          <circle cx="200" cy="150" r="40" fill="none" stroke="#27ae60" strokeWidth="2" opacity="0.7" />
          <circle cx="200" cy="150" r="80" fill="none" stroke="#f39c12" strokeWidth="2" opacity="0.5" />
          <circle cx="200" cy="150" r="130" fill="none" stroke="#e74c3c" strokeWidth="2" opacity="0.3" />
          <circle cx="200" cy="150" r="180" fill="none" stroke="#e74c3c" strokeWidth="1" opacity="0.15" />

          {/* Router */}
          <circle cx="200" cy="150" r="10" fill="#2E86AB" />
          <text x="200" y="140" textAnchor="middle" fontSize="16">📡</text>

          {/* Leyenda de fuerza */}
          <circle cx="40" cy="292" r="5" fill="#27ae60" />
          <text x="52" y="296" fontSize="9" fill="currentColor" opacity="0.7">Fuerte</text>
          <circle cx="100" cy="292" r="5" fill="#f39c12" />
          <text x="112" y="296" fontSize="9" fill="currentColor" opacity="0.7">Media</text>
          <circle cx="155" cy="292" r="5" fill="#e74c3c" />
          <text x="167" y="296" fontSize="9" fill="currentColor" opacity="0.7">Débil</text>
        </svg>
      </div>

      {/* Materiales clickables */}
      <h3 className={styles.materialesTitulo}>Pérdida de señal por material</h3>
      <div className={styles.materialesGrid}>
        {materiales.map((m, i) => (
          <button
            key={m.nombre}
            type="button"
            className={`${styles.materialCard} ${materialActivo === i ? styles.materialActivo : ''}`}
            onClick={() => setMaterialActivo(materialActivo === i ? null : i)}
            aria-expanded={materialActivo === i}
          >
            <span className={styles.materialIcono} aria-hidden="true">{m.icono}</span>
            <span className={styles.materialNombre}>{m.nombre}</span>
            <span className={styles.materialPerdida}>{m.perdida}</span>
            <div className={styles.materialBarra}>
              <div
                className={styles.materialBarraFill}
                style={{
                  width: `${Math.min((m.db / 20) * 100, 100)}%`,
                  background: m.db <= 3 ? '#27ae60' : m.db <= 6 ? '#f39c12' : '#e74c3c',
                }}
              />
            </div>
            {materialActivo === i && (
              <span className={styles.materialEjemplo}>{m.ejemplo}</span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          Cada <strong>-3 dB</strong> la señal pierde la mitad de su potencia. Una pared de hormigón (-12 dB) reduce la señal a solo un <strong>6%</strong> de la original. Por eso el WiFi no llega igual al baño que al salón, aunque estén a la misma distancia.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Canales y Congestión
// ─────────────────────────────────────────────

function SeccionCanales() {
  const [mostrarSolape, setMostrarSolape] = useState(true);

  const canales24 = Array.from({ length: 13 }, (_, i) => ({
    numero: i + 1,
    recomendado: [1, 6, 11].includes(i + 1),
    frecuencia: 2412 + i * 5,
  }));

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Los canales WiFi son como <strong>carriles de una autopista</strong>. Si todos los vecinos usan el mismo canal, la señal se congestiona. Elegir el canal correcto puede duplicar tu velocidad.</p>
      </div>

      {/* Visualización canales 2.4 GHz */}
      <div className={styles.canalesCard}>
        <h3 className={styles.canalesTitulo}>Canales 2,4 GHz</h3>
        <p className={styles.canalesSubtitulo}>Cada canal ocupa 22 MHz — se solapan con los adyacentes</p>

        <div className={styles.canalesSvgContainer}>
          <svg viewBox="0 0 400 140" className={styles.canalesSvg} aria-label="Canales WiFi 2.4 GHz con solapamiento">
            {/* Bloques de solape si activo */}
            {mostrarSolape && (
              <>
                <ellipse cx="70" cy="70" rx="65" ry="35" fill="#2E86AB" opacity="0.12" />
                <ellipse cx="170" cy="70" rx="65" ry="35" fill="#48A9A6" opacity="0.12" />
                <ellipse cx="270" cy="70" rx="65" ry="35" fill="#E67E22" opacity="0.12" />
              </>
            )}

            {/* Barras de canales */}
            {canales24.map((c, i) => {
              const x = 25 + i * 28;
              const esRecomendado = c.recomendado;
              return (
                <g key={c.numero}>
                  <rect
                    x={x}
                    y={esRecomendado ? 25 : 45}
                    width="20"
                    height={esRecomendado ? 70 : 50}
                    rx="3"
                    fill={esRecomendado ? '#2E86AB' : '#ccc'}
                    opacity={esRecomendado ? 0.85 : 0.4}
                  />
                  <text
                    x={x + 10}
                    y={120}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight={esRecomendado ? '700' : '400'}
                    fill={esRecomendado ? '#2E86AB' : 'currentColor'}
                    opacity={esRecomendado ? 1 : 0.5}
                  >
                    {c.numero}
                  </text>
                </g>
              );
            })}

            {/* Etiquetas recomendados */}
            <text x="53" y="18" textAnchor="middle" fontSize="9" fill="#2E86AB" fontWeight="600">CH 1</text>
            <text x="165" y="18" textAnchor="middle" fontSize="9" fill="#2E86AB" fontWeight="600">CH 6</text>
            <text x="277" y="18" textAnchor="middle" fontSize="9" fill="#2E86AB" fontWeight="600">CH 11</text>
          </svg>
        </div>

        <div className={styles.canalesToggle}>
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => setMostrarSolape(!mostrarSolape)}
            aria-pressed={mostrarSolape}
          >
            {mostrarSolape ? 'Ocultar solapamiento' : 'Mostrar solapamiento'}
          </button>
        </div>
      </div>

      {/* 5 GHz */}
      <div className={styles.explicacionCard}>
        <h3 className={styles.explicacionTitulo}>¿Y los 5 GHz?</h3>
        <div className={styles.comparativaCanales}>
          <div className={styles.canalComparativa}>
            <span className={styles.canalBanda}>2,4 GHz</span>
            <span className={styles.canalDato}>3 canales sin solape</span>
            <span className={styles.canalDetalle}>Solo caben 3 redes sin interferirse (1, 6, 11)</span>
          </div>
          <div className={styles.canalComparativa}>
            <span className={styles.canalBanda} style={{ color: '#48A9A6' }}>5 GHz</span>
            <span className={styles.canalDato}>25+ canales sin solape</span>
            <span className={styles.canalDetalle}>Canales más anchos (40/80/160 MHz) y sin solape</span>
          </div>
        </div>
      </div>

      {/* Insight congestión */}
      <div className={styles.congestionCard}>
        <h3 className={styles.congestionTitulo}><span aria-hidden="true">🕘</span> ¿Por qué tu WiFi va lento a las 21h?</h3>
        <div className={styles.congestionGrid}>
          <div className={styles.congestionItem}>
            <span className={styles.congestionNumero}>10-20</span>
            <span className={styles.congestionLabel}>redes WiFi típicas en un bloque de pisos</span>
          </div>
          <div className={styles.congestionItem}>
            <span className={styles.congestionNumero}>3</span>
            <span className={styles.congestionLabel}>canales disponibles sin solape en 2,4 GHz</span>
          </div>
          <div className={styles.congestionItem}>
            <span className={styles.congestionNumero}>21:00</span>
            <span className={styles.congestionLabel}>hora pico: streaming, videojuegos, videollamadas</span>
          </div>
        </div>
        <p className={styles.congestionExplicacion}>
          Resultado: múltiples routers compiten por los mismos 3 canales. Es como si 20 personas intentaran hablar a la vez en una sala con solo 3 megáfonos.
        </p>
      </div>

      <div className={styles.insight}>
        <p>
          <strong>Consejo rápido:</strong> si vives en un piso con muchos vecinos, conecta tus dispositivos cercanos al router por la banda de <strong>5 GHz</strong>. Tiene muchos más canales y menos interferencias.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Consejos y Datos
// ─────────────────────────────────────────────

function SeccionConsejos() {
  const consejos = [
    { icono: '📍', titulo: 'Ubicación central', desc: 'Coloca el router en el centro de la casa, elevado, sin obstáculos grandes delante.' },
    { icono: '📶', titulo: 'Repetidores WiFi', desc: 'Extienden la cobertura pero reducen la velocidad a la mitad. Solución intermedia.' },
    { icono: '🕸️', titulo: 'Sistemas mesh', desc: 'Varios puntos de acceso coordinados. La mejor solución para casas grandes (+100 m²).' },
    { icono: '🔌', titulo: 'Cable Ethernet', desc: 'Para dispositivos fijos (TV, PC, consola), el cable siempre será más rápido y estable.' },
    { icono: '🔄', titulo: 'Actualiza el firmware', desc: 'Los routers reciben actualizaciones de rendimiento y seguridad. Revisa cada pocos meses.' },
    { icono: '📱', titulo: 'Limita dispositivos', desc: 'Un router doméstico gestiona bien 15-20 dispositivos. Más allá, el rendimiento cae.' },
  ];

  const curiosidades = [
    { dato: '299.792 km/s', desc: 'Velocidad de las ondas WiFi (velocidad de la luz)' },
    { dato: '~250', desc: 'Dispositivos conectados al WiFi en un hogar medio para 2030 (estimación IoT)' },
    { dato: '9,6 Gbps', desc: 'Velocidad máxima teórica del WiFi 6 (802.11ax)' },
    { dato: '46 Gbps', desc: 'Velocidad máxima teórica del WiFi 7 (802.11be)' },
  ];

  const timeline = [
    { anio: '1997', nombre: '802.11', velocidad: '2 Mbps', nota: 'El primer WiFi' },
    { anio: '1999', nombre: '802.11b', velocidad: '11 Mbps', nota: 'WiFi se populariza' },
    { anio: '2003', nombre: '802.11g', velocidad: '54 Mbps', nota: 'Llegó a los hogares' },
    { anio: '2009', nombre: 'WiFi 4', velocidad: '600 Mbps', nota: '802.11n — dual band' },
    { anio: '2014', nombre: 'WiFi 5', velocidad: '3,5 Gbps', nota: '802.11ac — 5 GHz' },
    { anio: '2020', nombre: 'WiFi 6', velocidad: '9,6 Gbps', nota: '802.11ax — eficiencia' },
    { anio: '2021', nombre: 'WiFi 6E', velocidad: '9,6 Gbps', nota: 'Banda 6 GHz nueva' },
    { anio: '2024', nombre: 'WiFi 7', velocidad: '46 Gbps', nota: '802.11be — multilink' },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Consejos prácticos para mejorar tu WiFi, datos curiosos sobre la tecnología inalámbrica y la evolución del estándar desde 1997 hasta WiFi 7.</p>
      </div>

      {/* Grid de consejos */}
      <h3 className={styles.consejosGridTitulo}>Mejora tu WiFi</h3>
      <div className={styles.consejosGrid}>
        {consejos.map((c, i) => (
          <div key={i} className={styles.consejoCard}>
            <span className={styles.consejoIcono} aria-hidden="true">{c.icono}</span>
            <div className={styles.consejoTexto}>
              <strong>{c.titulo}</strong>
              <span>{c.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Datos curiosos */}
      <div className={styles.curiosidadesCard}>
        <h3 className={styles.curiosidadesTitulo}>Datos curiosos</h3>
        <div className={styles.curiosidadesGrid}>
          {curiosidades.map((c, i) => (
            <div key={i} className={styles.curiosidadItem}>
              <span className={styles.curiosidadDato}>{c.dato}</span>
              <span className={styles.curiosidadDesc}>{c.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline evolución WiFi */}
      <div className={styles.timelineCard}>
        <h3 className={styles.timelineTitulo}>Evolución del WiFi</h3>
        <div className={styles.timeline}>
          {timeline.map((t, i) => (
            <div key={i} className={styles.timelineItem}>
              <div className={styles.timelineDot} />
              <div className={styles.timelineContent}>
                <span className={styles.timelineAnio}>{t.anio}</span>
                <span className={styles.timelineNombre}>{t.nombre}</span>
                <span className={styles.timelineVelocidad}>{t.velocidad}</span>
                <span className={styles.timelineNota}>{t.nota}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          En 27 años, la velocidad del WiFi se ha multiplicado por <strong>23.000</strong> (de 2 Mbps a 46 Gbps teóricos). La tendencia es clara: más velocidad, más frecuencias, más dispositivos simultáneos y mejor eficiencia energética.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorComoFuncionaWifiPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('ondas');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'ondas': return <SeccionOndas />;
      case 'propagacion': return <SeccionPropagacion />;
      case 'canales': return <SeccionCanales />;
      case 'consejos': return <SeccionConsejos />;
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
          <h1 className={styles.title}>Cómo Funciona el WiFi</h1>
          <p className={styles.subtitle}>De las ondas electromagnéticas a tu pantalla, paso a paso</p>
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
          title="Más sobre el WiFi"
          subtitle="Preguntas frecuentes y conceptos clave"
          defaultOpen={false}
        >
          <h3>¿WiFi y Internet son lo mismo?</h3>
          <p>
            No. <strong>Internet</strong> es la red global de servidores y cables. <strong>WiFi</strong> es solo
            la conexión inalámbrica entre tu dispositivo y el router. El router es el puente: recibe Internet
            por cable (fibra óptica) y lo distribuye por WiFi en tu casa. Sin Internet, el WiFi funciona
            (puedes conectar dispositivos entre sí), pero no puedes navegar.
          </p>

          <h3>¿Qué significa dB en la señal WiFi?</h3>
          <p>
            El decibelio (dB) es una escala logarítmica para medir la potencia de la señal. Una señal WiFi
            típica oscila entre <strong>-30 dBm</strong> (excelente, junto al router) y <strong>-80 dBm</strong>
            (muy débil, apenas funciona). Cada -3 dB reduce la potencia a la mitad. Una señal de -70 dBm
            es 10.000 veces más débil que una de -30 dBm.
          </p>

          <h3>¿WiFi 6E y WiFi 7 merecen la pena?</h3>
          <p>
            WiFi 6E añade la <strong>banda de 6 GHz</strong>, con muchos más canales y menos congestión.
            WiFi 7 introduce <strong>Multi-Link Operation (MLO)</strong>: el dispositivo usa varias bandas
            simultáneamente para más velocidad y menor latencia. En 2026, WiFi 6 es la opción madura;
            WiFi 7 empieza a llegar a routers de gama alta.
          </p>

          <h3>¿Es seguro el WiFi para la salud?</h3>
          <p>
            Las ondas WiFi operan a potencias muy bajas (típicamente 0,1 W), muy por debajo de los límites
            establecidos por la OMS y la ICNIRP. La evidencia científica no ha encontrado efectos adversos
            para la salud a estos niveles de potencia. Un microondas emite a la misma frecuencia (2,4 GHz)
            pero con 1.000 W, y está blindado para que no salga radiación.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador simplifica conceptos de telecomunicaciones y física de ondas
            con fines educativos. Los valores de velocidad, alcance y atenuación son aproximados y dependen
            del router específico, entorno, firmware y estándar utilizado.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-como-funciona-wifi')} />
        <ShareCard appName="visualizador-como-funciona-wifi" />
        <Footer appName="visualizador-como-funciona-wifi" />
      </div>
    </>
  );
}
