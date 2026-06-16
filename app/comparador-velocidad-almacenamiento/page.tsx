'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './ComparadorVelocidadAlmacenamiento.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// =========================================================
// TIPOS Y DATOS
// =========================================================
type Categoria = 'interno' | 'usb' | 'movil' | 'tarjeta';
type Modo = 'lectura' | 'escritura';

interface Tecnologia {
  id: string;
  nombre: string;
  categoria: Categoria;
  velocidadLectura: number;  // MB/s
  velocidadEscritura: number; // MB/s
  icono: string;
  color: string;
  descripcion: string;
  tipico: string;
}

const TECNOLOGIAS: Tecnologia[] = [
  {
    id: 'hdd',
    nombre: 'HDD Mecánico',
    categoria: 'interno',
    velocidadLectura: 120,
    velocidadEscritura: 110,
    icono: '💿',
    color: '#6B7280',
    descripcion: 'Disco duro tradicional con platos magnéticos giratorios (7200 rpm)',
    tipico: 'PCs de sobremesa, almacenamiento masivo, NAS, portátiles antiguos',
  },
  {
    id: 'ssd-sata',
    nombre: 'SSD SATA',
    categoria: 'interno',
    velocidadLectura: 550,
    velocidadEscritura: 520,
    icono: '🗂️',
    color: '#0284C7',
    descripcion: 'SSD con interfaz SATA (6 Gb/s). Límite físico del bus SATA',
    tipico: 'Portátiles y PCs de gama media, sustituto directo del HDD',
  },
  {
    id: 'nvme-gen3',
    nombre: 'SSD NVMe Gen 3',
    categoria: 'interno',
    velocidadLectura: 3500,
    velocidadEscritura: 3000,
    icono: '⚡',
    color: '#2E86AB',
    descripcion: 'SSD NVMe PCIe 3.0 × 4, formato M.2 2280',
    tipico: 'PCs de gama alta (2017–2021), portátiles premium',
  },
  {
    id: 'nvme-gen4',
    nombre: 'SSD NVMe Gen 4',
    categoria: 'interno',
    velocidadLectura: 7000,
    velocidadEscritura: 6500,
    icono: '🚀',
    color: '#1a5278',
    descripcion: 'SSD NVMe PCIe 4.0, estándar actual de alto rendimiento',
    tipico: 'PCs gaming y creación (2021–presente), PS5, portátiles premium',
  },
  {
    id: 'usb-20',
    nombre: 'USB 2.0',
    categoria: 'usb',
    velocidadLectura: 35,
    velocidadEscritura: 25,
    icono: '🔌',
    color: '#D97706',
    descripcion: '480 Mb/s teórico → ~35 MB/s real. Puerto negro o blanco',
    tipico: 'Pendrives básicos, teclados, ratones, cargadores, accesorios',
  },
  {
    id: 'usb-30',
    nombre: 'USB 3.0 / 3.2 Gen 1',
    categoria: 'usb',
    velocidadLectura: 380,
    velocidadEscritura: 300,
    icono: '🔵',
    color: '#0369A1',
    descripcion: '5 Gb/s teórico → ~380 MB/s real. Puerto azul',
    tipico: 'Pendrives rápidos, discos duros externos, hubs USB',
  },
  {
    id: 'usb-32gen2',
    nombre: 'USB 3.2 Gen 2',
    categoria: 'usb',
    velocidadLectura: 900,
    velocidadEscritura: 800,
    icono: '🟢',
    color: '#16A34A',
    descripcion: '10 Gb/s teórico → ~900 MB/s real. USB-C o USB-A',
    tipico: 'SSD externos de alto rendimiento, NVMe en caja externa',
  },
  {
    id: 'usb4',
    nombre: 'USB4 / Thunderbolt 3/4',
    categoria: 'usb',
    velocidadLectura: 3500,
    velocidadEscritura: 3000,
    icono: '⚡',
    color: '#7C3AED',
    descripcion: '40 Gb/s teórico → ~3.500 MB/s real. Solo conector USB-C',
    tipico: 'SSD NVMe externos, MacBook, ultrabooks premium (2020–presente)',
  },
  {
    id: 'ufs-40',
    nombre: 'UFS 4.0 (móvil)',
    categoria: 'movil',
    velocidadLectura: 4200,
    velocidadEscritura: 2800,
    icono: '📱',
    color: '#B91C1C',
    descripcion: 'Universal Flash Storage 4.0 — almacenamiento interno de móviles de gama alta',
    tipico: 'Flagships Android 2023+ (Samsung Galaxy S24, Pixel 9, OnePlus 12…)',
  },
  {
    id: 'sd-uhsi',
    nombre: 'Tarjeta SD UHS-I',
    categoria: 'tarjeta',
    velocidadLectura: 95,
    velocidadEscritura: 50,
    icono: '💳',
    color: '#92400E',
    descripcion: '104 MB/s teórico → ~95 MB/s real en lectura',
    tipico: 'Cámaras de fotos, drones, Raspberry Pi, dashcams, microSD en móvil',
  },
];

const CATEGORIAS: Record<Categoria, { nombre: string; color: string }> = {
  interno:  { nombre: 'Almacenamiento interno', color: '#2E86AB' },
  usb:      { nombre: 'USB / Externo',          color: '#16A34A' },
  movil:    { nombre: 'Móvil (interno)',         color: '#B91C1C' },
  tarjeta:  { nombre: 'Tarjeta SD/Flash',        color: '#92400E' },
};

interface Preset {
  nombre: string;
  emoji: string;
  mb: number;
}

const PRESETS: Preset[] = [
  { nombre: 'Foto',       emoji: '📷', mb: 5 },
  { nombre: 'Canción',    emoji: '🎵', mb: 10 },
  { nombre: 'Vídeo HD',   emoji: '🎬', mb: 500 },
  { nombre: 'Película 4K', emoji: '🎥', mb: 25000 },
  { nombre: 'Juego AAA',  emoji: '🎮', mb: 80000 },
  { nombre: 'Backup',     emoji: '💾', mb: 500000 },
];

// =========================================================
// HELPERS
// =========================================================

// Escala logarítmica: slider 0→100 mapea a 1 MB → 1.000.000 MB (1 TB)
function sliderToMB(val: number): number {
  return Math.pow(10, val * 6 / 100);
}

function mbToSlider(mb: number): number {
  return Math.log10(mb) * 100 / 6;
}

function formatTamano(mb: number): string {
  if (mb < 1000) return `${formatNumber(mb, mb < 10 ? 1 : 0)} MB`;
  if (mb < 1000000) {
    const gb = mb / 1000;
    return `${formatNumber(gb, gb < 10 ? 1 : 0)} GB`;
  }
  return `${formatNumber(mb / 1000000, 1)} TB`;
}

function formatTiempo(segundos: number): string {
  if (segundos < 0.001) return '< 1 ms';
  if (segundos < 1) return `${formatNumber(segundos * 1000, 0)} ms`;
  if (segundos < 60) return `${formatNumber(segundos, segundos < 10 ? 1 : 0)} s`;
  if (segundos < 3600) {
    const m = Math.floor(segundos / 60);
    const s = Math.floor(segundos % 60);
    return s > 0 ? `${m} min ${s} s` : `${m} min`;
  }
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}

function formatVelocidad(mbs: number): string {
  if (mbs >= 1000) return `${formatNumber(mbs / 1000, 1)} GB/s`;
  return `${formatNumber(mbs, 0)} MB/s`;
}

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================
export default function ComparadorVelocidadAlmacenamientoPage() {
  const [sliderVal, setSliderVal] = useState(mbToSlider(25000)); // 25 GB por defecto
  const [modo, setModo] = useState<Modo>('lectura');
  const [presetActivo, setPresetActivo] = useState<string>('Película 4K');

  const tamanoMB = useMemo(() => sliderToMB(sliderVal), [sliderVal]);

  const resultados = useMemo(() => {
    return TECNOLOGIAS.map((t) => {
      const velocidad = modo === 'lectura' ? t.velocidadLectura : t.velocidadEscritura;
      const segundos = tamanoMB / velocidad;
      return { ...t, velocidad, segundos };
    }).sort((a, b) => a.segundos - b.segundos);
  }, [tamanoMB, modo]);

  // Barras en escala logarítmica
  const barWidths = useMemo(() => {
    const logMin = Math.log10(resultados[0].segundos + 0.0001);
    const logMax = Math.log10(resultados[resultados.length - 1].segundos + 0.0001);
    return resultados.map((r) => {
      if (logMax === logMin) return 50;
      const logT = Math.log10(r.segundos + 0.0001);
      return 4 + ((logT - logMin) / (logMax - logMin)) * 92;
    });
  }, [resultados]);

  function handlePreset(p: Preset) {
    setPresetActivo(p.nombre);
    setSliderVal(mbToSlider(p.mb));
  }

  function handleSlider(val: number) {
    setSliderVal(val);
    setPresetActivo('');
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">⚡</span> Comparador de Velocidad de Almacenamiento</h1>
        <p className={styles.subtitle}>
          Mueve el slider para ver cuánto tarda en transferirse tu archivo en cada tecnología de almacenamiento
        </p>
      </header>

      <LegalNotice />

      {/* ---- CONTROLES ---- */}
      <section className={styles.controlsSection}>
        {/* Presets */}
        <div className={styles.presetsRow}>
          <span className={styles.presetsLabel}>Tipo de archivo:</span>
          <div className={styles.presetsBtns}>
            {PRESETS.map((p) => (
              <button
                key={p.nombre}
                type="button"
                onClick={() => handlePreset(p)}
                className={`${styles.presetBtn} ${presetActivo === p.nombre ? styles.presetBtnActivo : ''}`}
                aria-pressed={presetActivo === p.nombre}
              >
                <span aria-hidden="true">{p.emoji}</span>
                {p.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Slider */}
        <div className={styles.sliderSection}>
          <div className={styles.sliderHeader}>
            <span className={styles.sliderLabel}>Tamaño del archivo</span>
            <span className={styles.sliderValor}>{formatTamano(tamanoMB)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={sliderVal}
            onChange={(e) => handleSlider(Number(e.target.value))}
            className={styles.sliderRange}
            aria-label={`Tamaño del archivo: ${formatTamano(tamanoMB)}`}
          />
          <div className={styles.sliderLimits}>
            <span>1 MB</span>
            <span>1 GB</span>
            <span>1 TB</span>
          </div>
        </div>

        {/* Modo lectura / escritura */}
        <div className={styles.modoRow}>
          <span className={styles.modoLabel}>Operación:</span>
          <div className={styles.modoBtns} role="group" aria-label="Modo de operación">
            <button
              type="button"
              onClick={() => setModo('lectura')}
              className={`${styles.modoBtn} ${modo === 'lectura' ? styles.modoBtnActivo : ''}`}
              aria-pressed={modo === 'lectura'}
            >
              <span aria-hidden="true">📖</span> Lectura
            </button>
            <button
              type="button"
              onClick={() => setModo('escritura')}
              className={`${styles.modoBtn} ${modo === 'escritura' ? styles.modoBtnActivo : ''}`}
              aria-pressed={modo === 'escritura'}
            >
              <span aria-hidden="true">✍️</span> Escritura
            </button>
          </div>
        </div>
      </section>

      {/* ---- GRÁFICO DE BARRAS ---- */}
      <section className={styles.chartSection} aria-label="Comparativa de tiempos de transferencia">
        <div className={styles.chartHeader}>
          <span className={styles.chartTitulo}>Tiempo de transferencia</span>
          <span className={styles.chartSubtitulo}>
            {formatTamano(tamanoMB)} — {modo === 'lectura' ? 'Lectura' : 'Escritura'} — escala logarítmica
          </span>
        </div>

        <div className={styles.chartRows}>
          {resultados.map((r, i) => (
            <div key={r.id} className={styles.chartRow}>
              <div className={styles.chartRowLabel}>
                <span className={styles.chartIcono} aria-hidden="true">{r.icono}</span>
                <div className={styles.chartNombreWrap}>
                  <span className={styles.chartNombre}>{r.nombre}</span>
                  <span
                    className={styles.chartCategoria}
                    style={{ color: CATEGORIAS[r.categoria].color }}
                  >
                    {CATEGORIAS[r.categoria].nombre}
                  </span>
                </div>
              </div>
              <div className={styles.chartBarWrap}>
                <div
                  className={styles.chartBar}
                  style={{
                    width: `${barWidths[i]}%`,
                    backgroundColor: r.color,
                  }}
                  role="meter"
                  aria-valuenow={r.segundos}
                  aria-label={`${r.nombre}: ${formatTiempo(r.segundos)}`}
                />
              </div>
              <div className={styles.chartValores}>
                <span className={styles.chartTiempo}>{formatTiempo(r.segundos)}</span>
                <span className={styles.chartVelocidad}>{formatVelocidad(r.velocidad)}</span>
              </div>
            </div>
          ))}
        </div>

        <p className={styles.chartNota}>
          ⓘ Velocidades reales medias — los valores teóricos pueden ser hasta un 30% más altos.
          Los tiempos incluyen solo la transferencia pura, sin latencias de inicio.
        </p>
      </section>

      {/* ---- LEYENDA DE CATEGORÍAS ---- */}
      <div className={styles.leyenda}>
        {Object.entries(CATEGORIAS).map(([id, cfg]) => (
          <span key={id} className={styles.leyendaItem}>
            <span
              className={styles.leyendaDot}
              style={{ backgroundColor: cfg.color }}
              aria-hidden="true"
            />
            {cfg.nombre}
          </span>
        ))}
      </div>

      {/* ---- SECCIÓN EDUCATIVA v2.0 ---- */}
      <EducationalSection
        title="📚 Guía completa de tecnologías de almacenamiento"
        subtitle="Por qué hay tanta diferencia de velocidad y cómo elegir la tecnología adecuada"
      >
        {/* 1. TABLA COMPARATIVA */}
        <section className={styles.guideSection}>
          <h2>Comparativa técnica de las 10 tecnologías</h2>
          <p>Velocidades reales medias (no teóricas), interfaz, año de introducción y caso de uso principal.</p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tecnología</th>
                  <th>Lectura real</th>
                  <th>Escritura real</th>
                  <th>Interfaz</th>
                  <th>Introducción</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>💿 HDD Mecánico</strong></td>
                  <td>~120 MB/s</td>
                  <td>~110 MB/s</td>
                  <td>SATA 6 Gb/s</td>
                  <td>1956 (SATA 2003)</td>
                </tr>
                <tr>
                  <td><strong>🗂️ SSD SATA</strong></td>
                  <td>~550 MB/s</td>
                  <td>~520 MB/s</td>
                  <td>SATA 6 Gb/s</td>
                  <td>2007</td>
                </tr>
                <tr>
                  <td><strong>⚡ SSD NVMe Gen 3</strong></td>
                  <td>~3.500 MB/s</td>
                  <td>~3.000 MB/s</td>
                  <td>PCIe 3.0 × 4</td>
                  <td>2015</td>
                </tr>
                <tr>
                  <td><strong>🚀 SSD NVMe Gen 4</strong></td>
                  <td>~7.000 MB/s</td>
                  <td>~6.500 MB/s</td>
                  <td>PCIe 4.0 × 4</td>
                  <td>2019</td>
                </tr>
                <tr>
                  <td><strong>🔌 USB 2.0</strong></td>
                  <td>~35 MB/s</td>
                  <td>~25 MB/s</td>
                  <td>USB 2.0</td>
                  <td>2000</td>
                </tr>
                <tr>
                  <td><strong>🔵 USB 3.0</strong></td>
                  <td>~380 MB/s</td>
                  <td>~300 MB/s</td>
                  <td>USB 3.2 Gen 1</td>
                  <td>2008</td>
                </tr>
                <tr>
                  <td><strong>🟢 USB 3.2 Gen 2</strong></td>
                  <td>~900 MB/s</td>
                  <td>~800 MB/s</td>
                  <td>USB 3.2 Gen 2</td>
                  <td>2017</td>
                </tr>
                <tr>
                  <td><strong>⚡ USB4 / TB4</strong></td>
                  <td>~3.500 MB/s</td>
                  <td>~3.000 MB/s</td>
                  <td>USB4 / TB3/4 (USB-C)</td>
                  <td>2019 / 2015</td>
                </tr>
                <tr>
                  <td><strong>📱 UFS 4.0 (móvil)</strong></td>
                  <td>~4.200 MB/s</td>
                  <td>~2.800 MB/s</td>
                  <td>MIPI M-PHY HS-G4</td>
                  <td>2022</td>
                </tr>
                <tr>
                  <td><strong>💳 SD UHS-I</strong></td>
                  <td>~95 MB/s</td>
                  <td>~50 MB/s</td>
                  <td>SD UHS-I (104 MB/s)</td>
                  <td>2010</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. CASOS DE USO */}
        <section className={styles.guideSection}>
          <h2>¿Qué tecnología necesitas para cada uso?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcono} aria-hidden="true">🎮</span>
                <h3>Gaming y aplicaciones</h3>
              </div>
              <div className={styles.escenarioEjemplo}>
                <p><strong>Mínimo aceptable:</strong> SSD SATA (550 MB/s)</p>
                <p><strong>Recomendado:</strong> NVMe Gen 4 — DirectStorage en juegos AAA</p>
                <p><strong>Diferencia real:</strong> tiempos de carga un 50-70% menores vs SATA</p>
              </div>
              <p className={styles.escenarioTip}>
                La PS5 usa NVMe Gen 4 precisamente para eliminar los tiempos de carga.
                Un HDD puede tardar 30-60s en cargar lo que un NVMe hace en 2-5s.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcono} aria-hidden="true">📸</span>
                <h3>Fotografía y vídeo profesional</h3>
              </div>
              <div className={styles.escenarioEjemplo}>
                <p><strong>Volcado de tarjeta SD:</strong> lector UHS-II o USB 3.2 Gen 2</p>
                <p><strong>Edición RAW / 4K:</strong> NVMe Gen 3 o 4 en el equipo</p>
                <p><strong>Archivo en frío:</strong> HDD mecánico (barato por GB)</p>
              </div>
              <p className={styles.escenarioTip}>
                Un lector de tarjetas UHS-II conectado por USB 3.2 puede triplicar la velocidad de volcado frente al lector integrado de muchos portátiles (USB 3.0).
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcono} aria-hidden="true">💾</span>
                <h3>Copias de seguridad regulares</h3>
              </div>
              <div className={styles.escenarioEjemplo}>
                <p><strong>Backup mensual (~500 GB):</strong> USB 3.0 basta (22 min)</p>
                <p><strong>Backup diario (~100 GB):</strong> USB 3.2 Gen 2 recomendado</p>
                <p><strong>Backup completo de trabajo:</strong> NVMe externo USB4/TB</p>
              </div>
              <p className={styles.escenarioTip}>
                Para NAS doméstico, un HDD de 7200 rpm conectado por Ethernet Gigabit está limitado a ~125 MB/s por la red, no por el disco.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcono} aria-hidden="true">🔄</span>
                <h3>Transferencias cotidianas</h3>
              </div>
              <div className={styles.escenarioEjemplo}>
                <p><strong>Películas / series (10-25 GB):</strong> USB 3.0 suficiente</p>
                <p><strong>Fotos de vacaciones (~5 GB):</strong> hasta USB 2.0 es aceptable</p>
                <p><strong>Instalar sistema operativo:</strong> USB 3.0 (reduce 5→1 min)</p>
              </div>
              <p className={styles.escenarioTip}>
                Para archivos pequeños frecuentes, la latencia importa más que el ancho de banda. El NVMe gana aquí también: 0,1 ms vs los 5-10 ms del HDD.
              </p>
            </div>
          </div>
        </section>

        {/* 3. FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>❓ ¿Por qué los SSD son tan más rápidos que los HDD?</h4>
              <p>
                Los HDD almacenan datos en platos magnéticos giratorios que necesitan que el cabezal
                lector se desplace físicamente hasta la posición correcta. Esto introduce una latencia
                mecánica de 5-10 ms por operación. Los SSD usan memoria flash NAND, sin partes móviles,
                con latencias de 0,05-0,1 ms. Para archivos secuenciales la diferencia es de 4-5×,
                pero para operaciones de acceso aleatorio (cargar un sistema operativo) puede ser de 100× o más.
              </p>
              <p className={styles.faqTip}>
                💡 Para hacer acceso aleatorio (el patrón típico del arranque del SO), un SSD SATA básico ya supera a cualquier HDD. El NVMe solo añade ventaja extra en cargas de trabajo muy intensas.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué significa «velocidad real» vs «velocidad teórica»?</h4>
              <p>
                La velocidad teórica (o ancho de banda máximo) es el límite físico del bus de comunicación:
                USB 3.0 tiene 5 Gb/s = 625 MB/s teórico. La velocidad real es lo que se logra en la práctica
                tras descontar el overhead del protocolo (~20% en USB), las limitaciones del controlador,
                la velocidad de la memoria flash del dispositivo, la calidad del cable y el comportamiento
                de escritura aleatorio vs secuencial. El USB 3.0 raramente supera 380-400 MB/s en condiciones ideales.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Por qué el NVMe Gen 4 es casi tan rápido como USB4/Thunderbolt conectado externamente?</h4>
              <p>
                USB4 y Thunderbolt 4 tienen 40 Gb/s de ancho de banda, lo que permite ~5.000 MB/s teórico.
                Pero los SSD externos más rápidos del mercado están limitados por sus propios controladores
                a ~3.000-4.000 MB/s. Además, en la práctica hay overhead de encapsulamiento USB4 sobre
                el protocolo NVMe. El resultado es que un buen NVMe externo TB4 se aproxima pero no supera
                a un NVMe Gen 4 interno directo en PCIe.
              </p>
              <p className={styles.faqTip}>
                💡 Para portátiles sin ranura M.2 libre, un NVMe externo Thunderbolt es la forma de obtener velocidades cercanas al NVMe interno.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Tiene sentido actualizar de NVMe Gen 3 a Gen 4?</h4>
              <p>
                Para uso general (ofimática, navegación, edición de documentos): no se nota. Para edición
                de vídeo 4K/RAW, desarrollo con compilaciones frecuentes o gaming de alto rendimiento:
                la diferencia puede ser perceptible. El coste por GB de Gen 4 ya es muy similar a Gen 3,
                así que en una compra nueva siempre conviene elegir Gen 4 si la placa lo soporta
                (AMD Ryzen 5000+, Intel 12ª gen+).
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Merece la pena un pendrive USB 3.2 Gen 2 frente a uno USB 3.0?</h4>
              <p>
                Depende del uso. Si solo mueves archivos de vez en cuando y el origen/destino también
                es rápido, sí puede notarse. Pero muchos pendrives etiquetados como "USB 3.2 Gen 2"
                tienen memoria flash interna lenta que los limita a 200-300 MB/s en escritura real,
                lejos de los 800 MB/s teóricos. Para obtener el máximo, busca pendrives con chips TLC
                de calidad o mejor aún una caja NVMe externa con USB 3.2 Gen 2.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué es UFS y por qué los móviles de gama alta son tan rápidos?</h4>
              <p>
                UFS (Universal Flash Storage) es el estándar de almacenamiento para smartphones. UFS 4.0,
                presente en flagships desde 2023, alcanza 4.200 MB/s de lectura, superando a muchos SSD
                NVMe Gen 3 para PC. Usa un protocolo de comandos paralelos sobre un bus MIPI M-PHY de
                alta velocidad. La clave es que opera en modo Full Duplex (lectura y escritura simultáneas),
                lo que mejora el rendimiento en las multitareas típicas de un smartphone.
              </p>
            </div>
          </div>
        </section>

        {/* 4. GUÍA PASO A PASO */}
        <section className={styles.guideSection}>
          <h2>Cómo interpretar los resultados</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <h3>Selecciona un preset o ajusta el slider</h3>
                <p>Elige el tipo de archivo más parecido al tuyo (foto, película, juego…) o usa el slider para un tamaño personalizado entre 1 MB y 1 TB. La escala es logarítmica: cada cuarto del slider multiplica el tamaño por ~1.000.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <h3>Elige el modo: lectura o escritura</h3>
                <p>Lectura = copiar desde el dispositivo a tu PC (ej: importar fotos desde SD). Escritura = copiar al dispositivo (ej: guardar una película en un pendrive). La escritura suele ser 10-30% más lenta que la lectura en la mayoría de tecnologías.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <h3>Lee las barras (escala logarítmica)</h3>
                <p>Una barra más larga significa más tiempo = tecnología más lenta. La escala es logarítmica: si una barra es el doble de larga que otra, la diferencia real de tiempo puede ser de 10× o 100×. Mira siempre el valor de tiempo numérico para la diferencia exacta.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <h3>Compara el tiempo con tu caso real</h3>
                <p>Los tiempos mostrados son para la transferencia pura. En la práctica, factores como fragmentación del archivo, velocidad del dispositivo origen, temperatura del SSD y carga del sistema pueden añadir un 10-30% de tiempo adicional.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <h3>Toma una decisión de compra informada</h3>
                <p>Si la diferencia entre la tecnología que tienes y la mejor disponible es de pocos segundos para tu caso de uso habitual, quizá la actualización no justifica el coste. Si la diferencia es de minutos u horas para operaciones frecuentes, puede tener mucho sentido invertir.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. MEJORES PRÁCTICAS */}
        <section className={styles.guideSection}>
          <h2>Consejos para maximizar la velocidad real</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">🔌</span>
              <h3>Verifica el puerto, no solo el cable</h3>
              <p>Un cable USB 3.2 Gen 2 conectado a un puerto USB 2.0 operará a USB 2.0. El puerto del ordenador limita la velocidad máxima, independientemente del dispositivo o cable que uses.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">🌡️</span>
              <h3>Los SSD NVMe se calientan</h3>
              <p>En transferencias prolongadas ({'>'} 10 GB), los NVMe Gen 4 pueden alcanzar 70-80°C y activar el throttling térmico, reduciendo la velocidad a la mitad. Un disipador o una carcasa con ventilación mejora la consistencia.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">📁</span>
              <h3>Archivos grandes vs muchos pequeños</h3>
              <p>Las velocidades mostradas son para transferencia secuencial. 1.000 archivos de 1 MB cada uno tardarán mucho más que un único archivo de 1 GB del mismo tamaño total, especialmente en HDD y pendrives baratos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">💾</span>
              <h3>Comprueba el caché del SSD</h3>
              <p>Muchos SSD económicos usan SLC caché dinámica: son muy rápidos los primeros GB pero caen a velocidades de HDD cuando el caché se llena. En transferencias largas, el rendimiento real puede ser 5-10× peor que el anunciado.</p>
            </div>
          </div>
        </section>

        {/* 6. WARNING BOX */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcono} aria-hidden="true">⚠️</span>
              <h2>Errores frecuentes al comparar velocidades</h2>
            </div>
            <ul className={styles.warningList}>
              <li><strong>Comparar velocidades teóricas con reales:</strong> "USB 3.0 tiene 5 Gbps" equivale a 625 MB/s, pero la velocidad real es ~380 MB/s. Siempre busca benchmarks reales, no la velocidad del bus.</li>
              <li><strong>Creer que más MB/s siempre se nota:</strong> Pasar de SSD SATA (550 MB/s) a NVMe Gen 4 (7.000 MB/s) no mejora la velocidad de navegación web ni la apertura de documentos. Solo se nota en cargas de trabajo con archivos muy grandes o I/O intensivo.</li>
              <li><strong>No verificar la generación de NVMe:</strong> Una placa con ranura M.2 no garantiza PCIe 4.0. Muchos portátiles con ranura M.2 solo soportan PCIe 3.0 o incluso SATA. Un NVMe Gen 4 en una ranura PCIe 3.0 operará a velocidades Gen 3.</li>
              <li><strong>Confundir velocidad de lectura del SSD con velocidad de copia:</strong> Al copiar de un SSD a otro, el cuello de botella está en el más lento y en el bus de conexión. Copiar de un NVMe a un USB 2.0 está limitado por el USB 2.0, no por el NVMe.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('comparador-velocidad-almacenamiento')} />
      <ShareCard appName="comparador-velocidad-almacenamiento" />
      <Footer appName="comparador-velocidad-almacenamiento" />
    </div>
  );
}
