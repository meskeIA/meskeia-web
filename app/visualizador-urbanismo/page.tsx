'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './Urbanismo.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type TabActiva = 'modelos' | 'densidad' | 'movilidad' | 'sostenibilidad';
type ModeloUrbano = 'concentrico' | 'sectorial' | 'multinuclear';
type TipoDensidad = 'megadensa' | 'densa' | 'media' | 'baja' | 'dispersa';
type TipoCiudad = 'densa' | 'media' | 'dispersa';

interface ZonaModelo {
  id: string;
  nombre: string;
  descripcion: string;
}

interface Ciudad {
  nombre: string;
  densidad: number;
  tipo: TipoDensidad;
}

interface ModoTransporte {
  id: string;
  nombre: string;
  icono: string;
  velocidadDensa: number;
  velocidadMedia: number;
  velocidadDispersa: number;
  costePorKm: number;
  emisionesCO2: number;
  espacioM2: number;
  scoreEficiencia: number;
}

interface IndicadorSostenibilidad {
  id: string;
  nombre: string;
  min: number;
  max: number;
  unidad: string;
  peso: number;
}

// ─────────────────────────────────────────────
// Datos de modelos urbanos
// ─────────────────────────────────────────────

const ZONAS_CONCENTRICO: ZonaModelo[] = [
  { id: 'nucleo', nombre: 'Núcleo Central (CBD)', descripcion: 'Centro de negocios y comercio. Alta densidad de oficinas, bancos y tiendas. Tierra más cara de la ciudad.' },
  { id: 'transicion', nombre: 'Zona de Transición', descripcion: 'Área en cambio constante. Mezcla de industria ligera, vivienda deteriorada e inmigrantes recién llegados.' },
  { id: 'obreros', nombre: 'Zona Obrera', descripcion: 'Vivienda de trabajadores industriales. Barrios densos, bien comunicados con fábricas y el centro.' },
  { id: 'media', nombre: 'Zona Clase Media', descripcion: 'Residencias unifamiliares y apartamentos de calidad media. Buena calidad de vida y acceso a servicios.' },
  { id: 'commuters', nombre: 'Zona Commuters', descripcion: 'Suburbios y ciudades satélite. Residentes que viajan al centro a trabajar. Baja densidad y grandes viviendas.' },
];

const ZONAS_SECTORIAL: ZonaModelo[] = [
  { id: 'cbd', nombre: 'CBD (Centro)', descripcion: 'Centro de negocios y servicios. Punto de partida del desarrollo sectorial de la ciudad.' },
  { id: 'industria', nombre: 'Industria Pesada', descripcion: 'Sector industrial a lo largo de vías de ferrocarril o ríos. Se desarrolla radialmente desde el centro.' },
  { id: 'bajo', nombre: 'Residencial Bajo', descripcion: 'Vivienda obrera cercana a la industria. Alta densidad y servicios básicos.' },
  { id: 'medio', nombre: 'Residencial Medio', descripcion: 'Clase media asentada en sectores intermedios. Transición entre lo industrial y las áreas de élite.' },
  { id: 'alto', nombre: 'Residencial Alto', descripcion: 'Élites que se asientan en el sector más favorable: lejos de industria, cerca de zonas verdes y servicios.' },
];

const ZONAS_MULTINUCLEAR: ZonaModelo[] = [
  { id: 'cbd', nombre: 'CBD Principal', descripcion: 'Centro histórico y de negocios. Primer núcleo de la ciudad desde el que se organiza el crecimiento.' },
  { id: 'industria_ligera', nombre: 'Industria Ligera', descripcion: 'Manufacturas y almacenes cerca de ejes de transporte pero alejados del núcleo residencial.' },
  { id: 'industria_pesada', nombre: 'Industria Pesada', descripcion: 'Actividades contaminantes en la periferia, generalmente junto a ríos o vías de carga.' },
  { id: 'res_bajo', nombre: 'Residencial Bajo', descripcion: 'Barrios populares que se desarrollan cerca de industrias y con menor acceso a amenidades.' },
  { id: 'res_medio', nombre: 'Residencial Medio', descripcion: 'Barrios consolidados de clase media. Buen acceso a servicios y transporte público.' },
  { id: 'res_alto', nombre: 'Residencial Alto', descripcion: 'Urbanizaciones exclusivas alejadas de industrias, con acceso a zonas verdes y equipamientos de calidad.' },
  { id: 'suburbio', nombre: 'Suburbio Industrial', descripcion: 'Núcleo secundario especializado en industria o servicios. Atrae trabajadores de zonas próximas.' },
];

// ─────────────────────────────────────────────
// Datos de densidad
// ─────────────────────────────────────────────

const CIUDADES: Ciudad[] = ([
  { nombre: 'Manila (Filipinas)', densidad: 111000, tipo: 'megadensa' as TipoDensidad },
  { nombre: 'Dhaka (Bangladesh)', densidad: 44500, tipo: 'megadensa' as TipoDensidad },
  { nombre: 'París', densidad: 21000, tipo: 'densa' as TipoDensidad },
  { nombre: 'Mumbai (India)', densidad: 31700, tipo: 'densa' as TipoDensidad },
  { nombre: 'Barcelona', densidad: 16000, tipo: 'densa' as TipoDensidad },
  { nombre: 'Nueva York', densidad: 10900, tipo: 'media' as TipoDensidad },
  { nombre: 'Madrid', densidad: 5400, tipo: 'media' as TipoDensidad },
  { nombre: 'Los Ángeles', densidad: 3200, tipo: 'baja' as TipoDensidad },
  { nombre: 'Houston', densidad: 1500, tipo: 'baja' as TipoDensidad },
  { nombre: 'Canberra (Australia)', densidad: 450, tipo: 'dispersa' as TipoDensidad },
] as Ciudad[]).sort((a, b) => b.densidad - a.densidad);

const DENSIDAD_INFO: Record<TipoDensidad, { ventajas: string; inconvenientes: string }> = {
  megadensa: {
    ventajas: 'Máxima eficiencia de transporte público, servicios muy accesibles, menor huella por habitante.',
    inconvenientes: 'Hacinamiento, escasez de zonas verdes, calidad del aire reducida, alto coste de vivienda.',
  },
  densa: {
    ventajas: 'Buen transporte público, comercios accesibles a pie, vida de barrio activa.',
    inconvenientes: 'Espacio reducido por vivienda, ruido, presión sobre infraestructuras.',
  },
  media: {
    ventajas: 'Equilibrio entre acceso a servicios y espacio vital. Transporte público viable.',
    inconvenientes: 'Dependencia parcial del coche, sprawl incipiente.',
  },
  baja: {
    ventajas: 'Amplio espacio, zonas verdes, tranquilidad residencial.',
    inconvenientes: 'Alta dependencia del coche, servicios dispersos, mayor huella de carbono per cápita.',
  },
  dispersa: {
    ventajas: 'Máximo espacio vital, entornos naturales accesibles.',
    inconvenientes: 'Transporte público inviable, servicios muy lejanos, altísima dependencia del vehículo privado.',
  },
};

// ─────────────────────────────────────────────
// Datos de movilidad
// ─────────────────────────────────────────────

const MODOS_TRANSPORTE: ModoTransporte[] = [
  {
    id: 'coche',
    nombre: 'Coche privado',
    icono: '🚗',
    velocidadDensa: 18,
    velocidadMedia: 30,
    velocidadDispersa: 55,
    costePorKm: 0.32,
    emisionesCO2: 120,
    espacioM2: 30,
    scoreEficiencia: 3,
  },
  {
    id: 'transporte',
    nombre: 'Transporte público',
    icono: '🚌',
    velocidadDensa: 22,
    velocidadMedia: 28,
    velocidadDispersa: 35,
    costePorKm: 0.07,
    emisionesCO2: 14,
    espacioM2: 2,
    scoreEficiencia: 8,
  },
  {
    id: 'bicicleta',
    nombre: 'Bicicleta',
    icono: '🚲',
    velocidadDensa: 16,
    velocidadMedia: 18,
    velocidadDispersa: 20,
    costePorKm: 0.02,
    emisionesCO2: 0,
    espacioM2: 1.5,
    scoreEficiencia: 9,
  },
  {
    id: 'apie',
    nombre: 'A pie',
    icono: '🚶',
    velocidadDensa: 5,
    velocidadMedia: 5,
    velocidadDispersa: 5,
    costePorKm: 0,
    emisionesCO2: 0,
    espacioM2: 1,
    scoreEficiencia: 10,
  },
  {
    id: 'patinete',
    nombre: 'Micromovilidad',
    icono: '🛴',
    velocidadDensa: 14,
    velocidadMedia: 16,
    velocidadDispersa: 18,
    costePorKm: 0.15,
    emisionesCO2: 5,
    espacioM2: 1.2,
    scoreEficiencia: 7,
  },
];

// ─────────────────────────────────────────────
// Datos de sostenibilidad
// ─────────────────────────────────────────────

const INDICADORES: IndicadorSostenibilidad[] = [
  { id: 'movilidad', nombre: 'Movilidad sostenible', min: 0, max: 100, unidad: '%', peso: 1 },
  { id: 'zonas_verdes', nombre: 'Zonas verdes', min: 0, max: 50, unidad: 'm²/hab', peso: 1 },
  { id: 'energia', nombre: 'Eficiencia energética', min: 0, max: 100, unidad: '%', peso: 1 },
  { id: 'residuos', nombre: 'Residuos reciclados', min: 0, max: 100, unidad: '%', peso: 1 },
  { id: 'usos', nombre: 'Mezcla de usos', min: 0, max: 100, unidad: '%', peso: 1 },
  { id: 'participacion', nombre: 'Participación ciudadana', min: 0, max: 100, unidad: '%', peso: 1 },
];

const VALORES_INICIALES: Record<string, number> = {
  movilidad: 40,
  zonas_verdes: 15,
  energia: 45,
  residuos: 35,
  usos: 50,
  participacion: 30,
};

// ─────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────

function formatNum(n: number): string {
  return n.toLocaleString('es-ES');
}

// ─────────────────────────────────────────────
// Componente SVG Modelo Concéntrico
// ─────────────────────────────────────────────

const COLORES_CONCENTRICO = ['#c0392b', '#e67e22', '#f1c40f', '#27ae60', '#2980b9'];

function SvgConcentrico({
  zonaSeleccionada,
  onZonaClick,
}: {
  zonaSeleccionada: string | null;
  onZonaClick: (id: string) => void;
}) {
  const cx = 160;
  const cy = 160;
  const radios = [30, 60, 90, 120, 150];
  const ids = ['nucleo', 'transicion', 'obreros', 'media', 'commuters'];

  return (
    <svg viewBox="0 0 320 320" width="320" height="320" aria-label="Modelo urbano concéntrico de Burgess">
      {ids.map((id, i) => (
        <circle
          key={id}
          cx={cx}
          cy={cy}
          r={radios[ids.length - 1 - i]}
          fill={COLORES_CONCENTRICO[ids.length - 1 - i]}
          stroke={zonaSeleccionada === ids[ids.length - 1 - i] ? '#1A1A1A' : 'white'}
          strokeWidth={zonaSeleccionada === ids[ids.length - 1 - i] ? 3 : 1}
          style={{ cursor: 'pointer', opacity: zonaSeleccionada && zonaSeleccionada !== ids[ids.length - 1 - i] ? 0.7 : 1 }}
          onClick={() => onZonaClick(ids[ids.length - 1 - i])}
          aria-label={ZONAS_CONCENTRICO[ids.length - 1 - i].nombre}
        />
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────
// Componente SVG Modelo Sectorial
// ─────────────────────────────────────────────

const COLORES_SECTORIAL = ['#c0392b', '#e67e22', '#f1c40f', '#27ae60', '#2980b9'];
const SECTORES_IDS = ['cbd', 'industria', 'bajo', 'medio', 'alto'];
const ANGULOS = [72, 144, 216, 288, 360];

function sectorPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startDeg - 90));
  const y1 = cy + r * Math.sin(toRad(startDeg - 90));
  const x2 = cx + r * Math.cos(toRad(endDeg - 90));
  const y2 = cy + r * Math.sin(toRad(endDeg - 90));
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

function SvgSectorial({
  zonaSeleccionada,
  onZonaClick,
}: {
  zonaSeleccionada: string | null;
  onZonaClick: (id: string) => void;
}) {
  const cx = 160;
  const cy = 160;
  const r = 145;

  return (
    <svg viewBox="0 0 320 320" width="320" height="320" aria-label="Modelo urbano sectorial de Hoyt">
      {SECTORES_IDS.map((id, i) => {
        const start = i === 0 ? 0 : ANGULOS[i - 1];
        const end = ANGULOS[i];
        return (
          <path
            key={id}
            d={sectorPath(cx, cy, r, start, end)}
            fill={COLORES_SECTORIAL[i]}
            stroke={zonaSeleccionada === id ? '#1A1A1A' : 'white'}
            strokeWidth={zonaSeleccionada === id ? 3 : 1}
            style={{ cursor: 'pointer', opacity: zonaSeleccionada && zonaSeleccionada !== id ? 0.7 : 1 }}
            onClick={() => onZonaClick(id)}
            aria-label={ZONAS_SECTORIAL[i].nombre}
          />
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────
// Componente SVG Modelo Multinuclear
// ─────────────────────────────────────────────

interface Nucleo {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  label: string;
}

const NUCLEOS: Nucleo[] = [
  { id: 'cbd', x: 120, y: 100, w: 80, h: 60, color: '#c0392b', label: 'CBD' },
  { id: 'industria_ligera', x: 30, y: 80, w: 70, h: 40, color: '#e67e22', label: 'Ind. Ligera' },
  { id: 'industria_pesada', x: 220, y: 230, w: 70, h: 50, color: '#7f8c8d', label: 'Ind. Pesada' },
  { id: 'res_bajo', x: 30, y: 160, w: 80, h: 50, color: '#f39c12', label: 'Res. Bajo' },
  { id: 'res_medio', x: 30, y: 240, w: 90, h: 50, color: '#27ae60', label: 'Res. Medio' },
  { id: 'res_alto', x: 200, y: 70, w: 80, h: 60, color: '#2980b9', label: 'Res. Alto' },
  { id: 'suburbio', x: 130, y: 220, w: 70, h: 50, color: '#8e44ad', label: 'Suburbio' },
];

function SvgMultinuclear({
  zonaSeleccionada,
  onZonaClick,
}: {
  zonaSeleccionada: string | null;
  onZonaClick: (id: string) => void;
}) {
  return (
    <svg viewBox="0 0 320 320" width="320" height="320" aria-label="Modelo urbano multinuclear de Harris y Ullman">
      {NUCLEOS.map((n) => (
        <g key={n.id} onClick={() => onZonaClick(n.id)} style={{ cursor: 'pointer' }}>
          <rect
            x={n.x}
            y={n.y}
            width={n.w}
            height={n.h}
            rx={6}
            fill={n.color}
            stroke={zonaSeleccionada === n.id ? '#1A1A1A' : 'rgba(255,255,255,0.6)'}
            strokeWidth={zonaSeleccionada === n.id ? 3 : 1}
            opacity={zonaSeleccionada && zonaSeleccionada !== n.id ? 0.65 : 1}
          />
          <text
            x={n.x + n.w / 2}
            y={n.y + n.h / 2 + 5}
            textAnchor="middle"
            fontSize="10"
            fill="white"
            fontWeight="600"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Modelos Urbanos
// ─────────────────────────────────────────────

function TabModelos() {
  const [modelo, setModelo] = useState<ModeloUrbano>('concentrico');
  const [zonaId, setZonaId] = useState<string | null>(null);

  const modelos: { id: ModeloUrbano; label: string; autor: string }[] = [
    { id: 'concentrico', label: 'Concéntrico', autor: 'Burgess, 1925' },
    { id: 'sectorial', label: 'Sectorial', autor: 'Hoyt, 1939' },
    { id: 'multinuclear', label: 'Multinuclear', autor: 'Harris & Ullman, 1945' },
  ];

  const zonas =
    modelo === 'concentrico'
      ? ZONAS_CONCENTRICO
      : modelo === 'sectorial'
      ? ZONAS_SECTORIAL
      : ZONAS_MULTINUCLEAR;

  const zonaInfo = zonaId ? zonas.find((z) => z.id === zonaId) : null;

  function handleModelo(m: ModeloUrbano) {
    setModelo(m);
    setZonaId(null);
  }

  return (
    <div>
      <div className={styles.modelosBtns} role="group" aria-label="Selección de modelo urbano">
        {modelos.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`${styles.modeloBtn} ${modelo === m.id ? styles.modeloBtnActivo : ''}`}
            onClick={() => handleModelo(m.id)}
            aria-pressed={modelo === m.id}
          >
            <span className={styles.modeloBtnNombre}>{m.label}</span>
            <span className={styles.modeloBtnAutor}>{m.autor}</span>
          </button>
        ))}
      </div>

      <p className={styles.instruccion}>Haz clic en una zona del mapa para ver su descripción.</p>

      <div className={styles.svgWrapper}>
        {modelo === 'concentrico' && (
          <SvgConcentrico zonaSeleccionada={zonaId} onZonaClick={setZonaId} />
        )}
        {modelo === 'sectorial' && (
          <SvgSectorial zonaSeleccionada={zonaId} onZonaClick={setZonaId} />
        )}
        {modelo === 'multinuclear' && (
          <SvgMultinuclear zonaSeleccionada={zonaId} onZonaClick={setZonaId} />
        )}
      </div>

      {zonaInfo ? (
        <div className={styles.detallePanel} role="region" aria-live="polite">
          <div className={styles.detalleTitulo}>{zonaInfo.nombre}</div>
          <div className={styles.detalleDesc}>{zonaInfo.descripcion}</div>
        </div>
      ) : (
        <div className={styles.detallePanelVacio} aria-live="polite">
          Selecciona una zona del mapa para ver su descripción.
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2: Densidad Urbana
// ─────────────────────────────────────────────

function TabDensidad() {
  const [ciudadSel, setCiudadSel] = useState<string | null>(null);
  const maxDensidad = CIUDADES[0].densidad;
  const svgAncho = 400;
  const barAltura = 26;
  const barGap = 6;
  const labelAncho = 170;
  const barMaxAncho = svgAncho - labelAncho - 60;
  const svgAlto = CIUDADES.length * (barAltura + barGap) + 10;

  const colorClase: Record<TipoDensidad, string> = {
    megadensa: styles.megadensa,
    densa: styles.densa,
    media: styles.media,
    baja: styles.baja,
    dispersa: styles.dispersa,
  };

  const ciudadInfo = ciudadSel ? CIUDADES.find((c) => c.nombre === ciudadSel) : null;

  return (
    <div>
      <p className={styles.instruccion}>Haz clic en una barra para ver las características del tipo de densidad.</p>
      <div className={styles.ciudadesWrapper}>
        <svg
          viewBox={`0 0 ${svgAncho} ${svgAlto}`}
          width="100%"
          style={{ maxWidth: svgAncho, display: 'block', margin: '0 auto' }}
          aria-label="Gráfico de densidad de ciudades del mundo"
        >
          {CIUDADES.map((ciudad, i) => {
            const barAncho = (ciudad.densidad / maxDensidad) * barMaxAncho;
            const y = i * (barAltura + barGap) + 5;
            const seleccionada = ciudadSel === ciudad.nombre;
            return (
              <g
                key={ciudad.nombre}
                onClick={() => setCiudadSel(seleccionada ? null : ciudad.nombre)}
                style={{ cursor: 'pointer' }}
                aria-label={`${ciudad.nombre}: ${formatNum(ciudad.densidad)} hab/km²`}
              >
                <text
                  x={labelAncho - 5}
                  y={y + barAltura / 2 + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="currentColor"
                  fontWeight={seleccionada ? '700' : '400'}
                  className={styles.barraLabel}
                >
                  {ciudad.nombre}
                </text>
                <rect
                  x={labelAncho}
                  y={y}
                  width={barAncho}
                  height={barAltura}
                  rx={4}
                  className={colorClase[ciudad.tipo]}
                  opacity={ciudadSel && !seleccionada ? 0.55 : 1}
                  stroke={seleccionada ? '#1A1A1A' : 'none'}
                  strokeWidth={seleccionada ? 2 : 0}
                />
                <text
                  x={labelAncho + barAncho + 6}
                  y={y + barAltura / 2 + 4}
                  fontSize="10"
                  fill="currentColor"
                  className={styles.barraValor}
                >
                  {formatNum(ciudad.densidad)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className={styles.leyendaDensidad}>
        {(['megadensa', 'densa', 'media', 'baja', 'dispersa'] as TipoDensidad[]).map((t) => (
          <span key={t} className={`${styles.leyendaItem} ${colorClase[t]}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </span>
        ))}
      </div>

      {ciudadInfo && (
        <div className={styles.detallePanel} role="region" aria-live="polite">
          <div className={styles.detalleTitulo}>
            {ciudadInfo.nombre} — {formatNum(ciudadInfo.densidad)} hab/km²
            <span className={`${styles.tipoBadge} ${colorClase[ciudadInfo.tipo]}`}>
              {ciudadInfo.tipo}
            </span>
          </div>
          <div className={styles.densidadInfo}>
            <div>
              <strong>Ventajas:</strong> {DENSIDAD_INFO[ciudadInfo.tipo].ventajas}
            </div>
            <div>
              <strong>Inconvenientes:</strong> {DENSIDAD_INFO[ciudadInfo.tipo].inconvenientes}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Radar SVG movilidad (3 dimensiones)
// ─────────────────────────────────────────────

function radarPoint(cx: number, cy: number, r: number, angle: number): [number, number] {
  const rad = ((angle - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function RadarMovilidad({
  modo,
  tipoCiudad,
}: {
  modo: ModoTransporte;
  tipoCiudad: TipoCiudad;
}) {
  const coche = MODOS_TRANSPORTE[0];
  const cx = 140;
  const cy = 140;
  const R = 110;
  const ejes = ['Velocidad', 'Económico', 'Sostenible'];
  const angles = [0, 120, 240];

  function getVelocidad(m: ModoTransporte): number {
    const v =
      tipoCiudad === 'densa'
        ? m.velocidadDensa
        : tipoCiudad === 'media'
        ? m.velocidadMedia
        : m.velocidadDispersa;
    return Math.min(v / 60, 1);
  }

  function getEconomico(m: ModoTransporte): number {
    return Math.max(0, 1 - m.costePorKm / 0.35);
  }

  function getSostenible(m: ModoTransporte): number {
    return Math.max(0, 1 - m.emisionesCO2 / 130);
  }

  function puntos(m: ModoTransporte): string {
    const vals = [getVelocidad(m), getEconomico(m), getSostenible(m)];
    return angles
      .map((a, i) => {
        const [x, y] = radarPoint(cx, cy, vals[i] * R, a);
        return `${x},${y}`;
      })
      .join(' ');
  }

  const ejesPoints = angles.map((a) => radarPoint(cx, cy, R, a));

  return (
    <svg viewBox="0 0 280 280" width="280" height="280" aria-label="Radar comparativo de movilidad">
      {[0.25, 0.5, 0.75, 1].map((frac) => (
        <polygon
          key={frac}
          points={angles.map((a) => {
            const [x, y] = radarPoint(cx, cy, frac * R, a);
            return `${x},${y}`;
          }).join(' ')}
          fill="none"
          stroke="#ccc"
          strokeWidth="1"
          opacity="0.6"
        />
      ))}
      {ejesPoints.map(([x, y], i) => (
        <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#ccc" strokeWidth="1" />
      ))}
      <polygon points={puntos(coche)} fill="rgba(192,57,43,0.2)" stroke="#c0392b" strokeWidth="2" />
      <polygon points={puntos(modo)} fill="rgba(46,134,171,0.25)" stroke="#2E86AB" strokeWidth="2.5" />
      {ejesPoints.map(([x, y], i) => {
        const offsetX = i === 0 ? 0 : i === 1 ? -10 : 10;
        const offsetY = i === 0 ? -10 : 12;
        return (
          <text key={i} x={x + offsetX} y={y + offsetY} textAnchor="middle" fontSize="11" fill="currentColor" fontWeight="600">
            {ejes[i]}
          </text>
        );
      })}
      <circle cx={cx} cy={cy} r={3} fill="#2E86AB" />
    </svg>
  );
}

// ─────────────────────────────────────────────
// Tab 3: Movilidad Urbana
// ─────────────────────────────────────────────

function TabMovilidad() {
  const [modoId, setModoId] = useState<string>('transporte');
  const [tipoCiudad, setTipoCiudad] = useState<TipoCiudad>('densa');

  const modoActual = MODOS_TRANSPORTE.find((m) => m.id === modoId) ?? MODOS_TRANSPORTE[1];

  const velocidad =
    tipoCiudad === 'densa'
      ? modoActual.velocidadDensa
      : tipoCiudad === 'media'
      ? modoActual.velocidadMedia
      : modoActual.velocidadDispersa;

  const tiposCiudad: { id: TipoCiudad; label: string }[] = [
    { id: 'densa', label: 'Ciudad densa' },
    { id: 'media', label: 'Ciudad media' },
    { id: 'dispersa', label: 'Ciudad dispersa' },
  ];

  return (
    <div>
      <div className={styles.tipoCiudadSelector} role="group" aria-label="Tipo de ciudad">
        {tiposCiudad.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`${styles.modeloBtn} ${tipoCiudad === t.id ? styles.modeloBtnActivo : ''}`}
            onClick={() => setTipoCiudad(t.id)}
            aria-pressed={tipoCiudad === t.id}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.movilidadGrid} role="list">
        {MODOS_TRANSPORTE.map((m) => (
          <button
            key={m.id}
            type="button"
            role="listitem"
            className={`${styles.movilidadCard} ${modoId === m.id ? styles.movilidadCardActivo : ''}`}
            onClick={() => setModoId(m.id)}
            aria-pressed={modoId === m.id}
          >
            <div className={styles.movilidadIcon} aria-hidden="true">{m.icono}</div>
            <div className={styles.movilidadNombre}>{m.nombre}</div>
            <div className={styles.movilidadMetrica}>
              <span className={styles.metricaLabel}>Velocidad</span>
              <span className={styles.metricaValor}>
                {tipoCiudad === 'densa' ? m.velocidadDensa : tipoCiudad === 'media' ? m.velocidadMedia : m.velocidadDispersa} km/h
              </span>
            </div>
            <div className={styles.movilidadMetrica}>
              <span className={styles.metricaLabel}>Score</span>
              <span className={styles.metricaValor}>{m.scoreEficiencia}/10</span>
            </div>
          </button>
        ))}
      </div>

      <div className={styles.movilidadDetalle}>
        <div className={styles.radarWrapper}>
          <RadarMovilidad modo={modoActual} tipoCiudad={tipoCiudad} />
          <p className={styles.radarLeyenda}>
            <span className={styles.radarAzul}>■</span> {modoActual.nombre} &nbsp;
            <span className={styles.radarRojo}>■</span> Coche privado (referencia)
          </p>
        </div>
        <div className={styles.movilidadStats}>
          <h3 className={styles.sectionTitle}><span aria-hidden="true">{modoActual.icono}</span> {modoActual.nombre}</h3>
          <div className={styles.statRow}><span>Velocidad en ciudad {tipoCiudad}</span><strong>{velocidad} km/h</strong></div>
          <div className={styles.statRow}><span>Coste por km</span><strong>{modoActual.costePorKm === 0 ? 'Gratuito' : `${modoActual.costePorKm.toFixed(2).replace('.', ',')} €`}</strong></div>
          <div className={styles.statRow}><span>Emisiones CO₂</span><strong>{modoActual.emisionesCO2} g/km</strong></div>
          <div className={styles.statRow}><span>Espacio por usuario</span><strong>{modoActual.espacioM2} m²</strong></div>
          <div className={styles.statRow}><span>Eficiencia urbana</span><strong>{modoActual.scoreEficiencia}/10</strong></div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Hexágono SVG sostenibilidad (spider chart)
// ─────────────────────────────────────────────

function HexSpider({ valores }: { valores: Record<string, number> }) {
  const cx = 150;
  const cy = 150;
  const R = 120;
  const n = INDICADORES.length;
  const angles = INDICADORES.map((_, i) => (i * 360) / n);

  function normalizar(ind: IndicadorSostenibilidad): number {
    const v = valores[ind.id] ?? ind.min;
    return (v - ind.min) / (ind.max - ind.min);
  }

  function puntoEje(angle: number, frac: number): [number, number] {
    const rad = ((angle - 90) * Math.PI) / 180;
    return [cx + frac * R * Math.cos(rad), cy + frac * R * Math.sin(rad)];
  }

  const puntosData = INDICADORES.map((ind, i) => puntoEje(angles[i], normalizar(ind)));
  const polyData = puntosData.map(([x, y]) => `${x},${y}`).join(' ');

  const rejillas = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox="0 0 300 300" width="300" height="300" aria-label="Spider chart de sostenibilidad urbana">
      {rejillas.map((frac) => (
        <polygon
          key={frac}
          points={angles.map((a) => {
            const [x, y] = puntoEje(a, frac);
            return `${x},${y}`;
          }).join(' ')}
          fill={frac === 1 ? 'rgba(46,134,171,0.04)' : 'none'}
          stroke="#ccc"
          strokeWidth="1"
          opacity="0.7"
        />
      ))}
      {angles.map((a, i) => {
        const [x, y] = puntoEje(a, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#ccc" strokeWidth="1" />;
      })}
      <polygon points={polyData} fill="rgba(46,134,171,0.25)" stroke="#2E86AB" strokeWidth="2.5" />
      {INDICADORES.map((ind, i) => {
        const [x, y] = puntoEje(angles[i], 1.18);
        return (
          <text key={ind.id} x={x} y={y} textAnchor="middle" fontSize="9.5" fill="currentColor" fontWeight="600">
            {ind.nombre.split(' ').map((w, j) => (
              <tspan key={j} x={x} dy={j === 0 ? 0 : 11}>{w}</tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────
// Tab 4: Ciudad Sostenible
// ─────────────────────────────────────────────

function TabSostenibilidad() {
  const [valores, setValores] = useState<Record<string, number>>(VALORES_INICIALES);

  function cambiarValor(id: string, valor: number) {
    setValores((prev) => ({ ...prev, [id]: valor }));
  }

  function calcularScore(): number {
    let suma = 0;
    let totalPeso = 0;
    for (const ind of INDICADORES) {
      const v = valores[ind.id] ?? ind.min;
      const norm = ((v - ind.min) / (ind.max - ind.min)) * 100;
      suma += norm * ind.peso;
      totalPeso += ind.peso;
    }
    return Math.round(suma / totalPeso);
  }

  const score = calcularScore();

  function clasificacion(): { texto: string; clase: string } {
    if (score > 80) return { texto: 'Ciudad Ejemplar', clase: styles.scoreEjemplar };
    if (score > 60) return { texto: 'Ciudad Sostenible', clase: styles.scoreSostenible };
    if (score > 40) return { texto: 'En Transición', clase: styles.scoreTransicion };
    return { texto: 'Ciudad Convencional', clase: styles.scoreConvencional };
  }

  const clas = clasificacion();

  return (
    <div>
      <div className={styles.sostenibilidadLayout}>
        <div className={styles.sostenibilidadGrid}>
          {INDICADORES.map((ind) => (
            <div key={ind.id} className={styles.sliderGroup}>
              <div className={styles.sliderLabelRow}>
                <label htmlFor={`slider-${ind.id}`} className={styles.sliderLabel}>{ind.nombre}</label>
                <span className={styles.sliderValue}>
                  {ind.id === 'zonas_verdes'
                    ? `${valores[ind.id]} m²/hab`
                    : `${valores[ind.id]}%`}
                </span>
              </div>
              <input
                id={`slider-${ind.id}`}
                type="range"
                min={ind.min}
                max={ind.max}
                step={ind.id === 'zonas_verdes' ? 1 : 5}
                value={valores[ind.id]}
                onChange={(e) => cambiarValor(ind.id, Number(e.target.value))}
                className={styles.slider}
                aria-label={`${ind.nombre}: ${valores[ind.id]} ${ind.unidad}`}
              />
            </div>
          ))}
        </div>

        <div className={styles.hexWrapper}>
          <HexSpider valores={valores} />
        </div>
      </div>

      <div className={`${styles.scoreBox} ${clas.clase}`}>
        <div className={styles.scoreValor}>{score}</div>
        <div className={styles.scoreClasificacion}>{clas.texto}</div>
        <div className={styles.scoreSub}>Score de sostenibilidad urbana (0–100)</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorUrbanismo() {
  const [tabActiva, setTabActiva] = useState<TabActiva>('modelos');

  const tabs: { id: TabActiva; label: string; icono: string }[] = [
    { id: 'modelos', label: 'Modelos Urbanos', icono: '🏙️' },
    { id: 'densidad', label: 'Densidad Urbana', icono: '📊' },
    { id: 'movilidad', label: 'Movilidad', icono: '🚌' },
    { id: 'sostenibilidad', label: 'Ciudad Sostenible', icono: '🌱' },
  ];

  return (
    <div className={styles.container}>

      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Urbanismo y Planificación Urbana</h1>
        <p className={styles.heroSubtitle}>
          Modelos de ciudad, densidad urbana, movilidad sostenible e indicadores de ciudad sostenible
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <nav className={styles.tabNav} role="tablist" aria-label="Secciones del visualizador">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={tabActiva === tab.id}
              className={`${styles.tabBtn} ${tabActiva === tab.id ? styles.tabBtnActivo : ''}`}
              onClick={() => setTabActiva(tab.id)}
            >
              <span aria-hidden="true">{tab.icono}</span> {tab.label}
            </button>
          ))}
        </nav>

        <div className={styles.tabContent} role="tabpanel">
          {tabActiva === 'modelos' && (
            <section className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Modelos clásicos de estructura urbana</h2>
              <TabModelos />
            </section>
          )}
          {tabActiva === 'densidad' && (
            <section className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Densidad de población urbana mundial</h2>
              <TabDensidad />
            </section>
          )}
          {tabActiva === 'movilidad' && (
            <section className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Comparativa de modos de transporte urbano</h2>
              <TabMovilidad />
            </section>
          )}
          {tabActiva === 'sostenibilidad' && (
            <section className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Indicadores de ciudad sostenible</h2>
              <TabSostenibilidad />
            </section>
          )}
        </div>

        <EducationalSection
          title="Fundamentos del urbanismo moderno"
          subtitle="Planificación urbana, modelos de ciudad y sostenibilidad"
        >
          {/* ── Sección 1: Tabla Comparativa ── */}
          <h3>Modelos de estructura urbana comparados</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Modelo urbano</th>
                  <th>Autor</th>
                  <th>Año</th>
                  <th>Forma</th>
                  <th>Concepto clave</th>
                  <th>Ciudad ejemplo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Concéntrico</strong></td>
                  <td>Burgess</td>
                  <td>1925</td>
                  <td>Anillos concéntricos</td>
                  <td>El CBD en el centro y usos que se alejan por estratos sociales</td>
                  <td>Chicago (años 20)</td>
                </tr>
                <tr>
                  <td><strong>Sectorial</strong></td>
                  <td>Hoyt</td>
                  <td>1939</td>
                  <td>Sectores radiales</td>
                  <td>El crecimiento sigue ejes de transporte desde el centro</td>
                  <td>Boston, Seattle</td>
                </tr>
                <tr>
                  <td><strong>Multinuclear</strong></td>
                  <td>Harris y Ullman</td>
                  <td>1945</td>
                  <td>Núcleos dispersos</td>
                  <td>Varios centros especializados sin jerarquía única</td>
                  <td>Los Ángeles</td>
                </tr>
                <tr>
                  <td><strong>Ciudad compacta</strong></td>
                  <td>Contemporáneo</td>
                  <td>Siglo XXI</td>
                  <td>Densa y mixta</td>
                  <td>Mezcla de usos en radio caminable, transporte público como eje</td>
                  <td>Barcelona, Ámsterdam</td>
                </tr>
                <tr>
                  <td><strong>Ciudad difusa</strong></td>
                  <td>Suburbana</td>
                  <td>Siglo XX</td>
                  <td>Sprawl horizontal</td>
                  <td>Baja densidad, zonificación estricta, dependencia del coche</td>
                  <td>Houston, Phoenix</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── Sección 2: Casos de Uso ── */}
          <h3>¿Quién usa este visualizador?</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcon} aria-hidden="true">🎓</div>
              <div>
                <strong>Estudiante de geografía</strong>
                <p>Usa los modelos para analizar la estructura de una ciudad real en un trabajo académico, identificando el CBD, los anillos residenciales y los sectores según cada teoría.</p>
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcon} aria-hidden="true">🏗️</div>
              <div>
                <strong>Arquitecto urbanista</strong>
                <p>Aplica los indicadores de ciudad sostenible para proponer mejoras en el PGOU de un municipio, argumentando con datos de densidad y movilidad ante el ayuntamiento.</p>
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcon} aria-hidden="true">🚲</div>
              <div>
                <strong>Activista de movilidad sostenible</strong>
                <p>Compara el espacio por usuario del coche (30 m²) frente a la bicicleta (1,5 m²) para argumentar la reforma viaria y la ampliación de carriles bici en el centro.</p>
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcon} aria-hidden="true">🏛️</div>
              <div>
                <strong>Concejal de urbanismo</strong>
                <p>Evalúa si la densidad del barrio permite implantar comercio de proximidad sin nueva infraestructura, utilizando los datos de densidad comparada y mezcla de usos.</p>
              </div>
            </div>
          </div>

          {/* ── Sección 3: FAQ ── */}
          <h3>Preguntas frecuentes</h3>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <strong>¿Por qué Barcelona es más densa que Madrid si tiene menos superficie?</strong>
              <p>Barcelona (16.000 hab/km²) está construida de manera más compacta en una llanura rodeada de montañas y mar que limita su expansión. Madrid (5.400 hab/km²) ha podido crecer horizontalmente hacia la periferia con urbanizaciones y polígonos de baja densidad. La densidad depende tanto del volumen edificado como de los límites geográficos e históricos.</p>
              <span className={styles.faqTip}>Tip: En el visualizador puedes ver ambas ciudades en la pestaña Densidad Urbana.</span>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué es la gentrificación y cómo afecta la estructura urbana?</strong>
              <p>La gentrificación es el proceso por el que un barrio degradado es renovado y revalorizado, desplazando a los vecinos originales de renta baja y atrayendo a residentes de mayor poder adquisitivo. Altera la estructura urbana clásica: zonas de transición del modelo de Burgess (vivienda obrera deteriorada) se convierten en zonas residenciales de élite, rompiendo el patrón concéntrico.</p>
              <span className={styles.faqTip}>Tip: El modelo de Burgess predecía este movimiento centrífugo de la renta alta, pero no la posterior atracción hacia el centro.</span>
            </li>
            <li className={styles.faqItem}>
              <strong>¿La ciudad compacta o la ciudad dispersa es más sostenible?</strong>
              <p>La ciudad compacta consume menos energía per cápita, genera menos emisiones de transporte y usa el suelo más eficientemente. Sin embargo, puede crear problemas de accesibilidad, hacinamiento y presión sobre el verde urbano. La clave no es la densidad en abstracto, sino la mixticidad de usos, la calidad del transporte público y la equidad de acceso a servicios.</p>
              <span className={styles.faqTip}>Tip: En el visualizador puedes ajustar el slider de "Mezcla de usos" en Ciudad Sostenible para ver su impacto en el score.</span>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué es el "derecho a la ciudad" y por qué es tan debatido?</strong>
              <p>El concepto, formulado por Henri Lefebvre en 1968, plantea que todos los ciudadanos tienen derecho a participar en la producción del espacio urbano, no solo en consumirlo. Es debatido porque choca con los intereses del mercado inmobiliario, el derecho de propiedad y la gestión tecnocrática del urbanismo. Hoy resurge en debates sobre alquiler asequible, turistificación y privatización del espacio público.</p>
              <span className={styles.faqTip}>Tip: El indicador de "Participación ciudadana" en el spider chart recoge esta dimensión democrática.</span>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cómo afecta el teletrabajo a la estructura urbana?</strong>
              <p>El teletrabajo reduce los flujos diarios al CBD y puede descongestionar el modelo concéntrico clásico. Favorece la valorización de municipios periurbanos y rurales (efecto "huida del centro"), redistribuye la demanda de oficinas hacia espacios flexibles de barrio (coworking), y puede reactivar zonas de transición deterioradas con nuevas actividades mixtas.</p>
              <span className={styles.faqTip}>Tip: Este cambio encaja mejor en el modelo multinuclear, donde los núcleos secundarios ganan importancia relativa.</span>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Por qué Houston (sin zonificación) tiene una estructura tan diferente a París?</strong>
              <p>Houston es la única gran ciudad norteamericana sin un código de zonificación formal, lo que permite mezclar usos en el mismo terreno sin restricciones legales. El resultado es un sprawl de baja densidad extrema (1.500 hab/km²) con dependencia absoluta del coche. París, con un planeamiento estricto desde Haussmann, tiene 21.000 hab/km² y transporte público denso que hace prescindible el vehículo privado en el día a día.</p>
              <span className={styles.faqTip}>Tip: Compara ambas ciudades en la pestaña de Densidad Urbana del visualizador.</span>
            </li>
          </ul>

          {/* ── Sección 4: Guía Paso a Paso ── */}
          <h3>Cómo leer y analizar la estructura de una ciudad</h3>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Identifica el CBD (centro de negocios)</strong>
                <p>Localiza dónde están los edificios más altos, las oficinas corporativas, los bancos y el suelo más caro. En ciudades europeas suele coincidir con el centro histórico; en ciudades norteamericanas puede estar separado del casco antiguo.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Localiza los anillos o sectores residenciales</strong>
                <p>Analiza el gradiente de renta desde el centro hacia la periferia. En el modelo concéntrico, la renta aumenta con la distancia al centro; en el sectorial, sigue ejes radiales. Observa dónde viven las clases trabajadoras y dónde las élites.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Busca los núcleos secundarios</strong>
                <p>Identifica centros comerciales, campus universitarios, aeropuertos, hospitales o polígonos industriales que actúan como imanes de actividad. Cuantos más núcleos secundarios autónomos, más se aproxima la ciudad al modelo multinuclear de Harris y Ullman.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Analiza los ejes de transporte</strong>
                <p>Metro, AVE, autovías y rondas de circunvalación no son solo infraestructura: estructuran el crecimiento urbano. El suelo cerca de estaciones de metro sube de precio y atrae densidad; la autovía periférica fomenta el sprawl industrial y comercial.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Evalúa los vacíos y degradaciones</strong>
                <p>Las zonas industriales obsoletas, los solares sin edificar y los barrios en declive revelan la historia económica de la ciudad y sus oportunidades de reconversión. Son los espacios donde se decide el urbanismo del futuro: vivienda asequible, zonas verdes o nuevos núcleos de actividad.</p>
              </div>
            </li>
          </ol>

          {/* ── Sección 5: Mejores Prácticas ── */}
          <h3>Claves para entender el urbanismo contemporáneo</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <div>
                <strong>La densidad alta no implica hacinamiento</strong>
                <p>El Eixample de Barcelona (36.000 hab/km²) tiene más calidad de vida que muchos suburbios dispersos. Lo que importa es la calidad de la vivienda, el espacio público y el acceso a servicios, no el número de personas por km².</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔢</span>
              <div>
                <strong>El espacio público por habitante es justicia urbana</strong>
                <p>El estándar de la OMS recomienda 9 m² de zona verde por habitante. La distribución de ese espacio determina quién disfruta de la ciudad: los barrios más desfavorecidos suelen tener menos verde, más ruido y peor transporte.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
              <div>
                <strong>La mezcla de usos reduce los viajes motorizados</strong>
                <p>Cuando vivienda, comercio, trabajo y equipamiento conviven en el mismo barrio, los desplazamientos en coche caen drásticamente. Es el principio de la "ciudad de los 15 minutos" y del urbanismo orientado al peatón.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <div>
                <strong>La participación ciudadana mejora los resultados</strong>
                <p>Los planes urbanísticos elaborados con participación real de los vecinos tienen mayor aceptación social, se ejecutan con menos conflictos y generan espacios más adaptados a las necesidades reales del barrio.</p>
              </div>
            </div>
          </div>

          {/* ── Sección 6: Warning Box ── */}
          <div className={styles.warningBox} role="alert">
            <strong>⚠️ Errores frecuentes al interpretar datos urbanos</strong>
            <ul>
              <li><strong>Confundir densidad con masificación:</strong> la densidad se mide en hab/km², no en la percepción subjetiva de agobio. Una ciudad puede tener alta densidad y mucho espacio público de calidad.</li>
              <li><strong>Creer que la zonificación estricta es siempre la mejor solución:</strong> separar usos (residencial, industrial, comercial) puede crear ciudades dormitorio sin vida propia ni comercio de proximidad.</li>
              <li><strong>Ignorar la escala temporal:</strong> las ciudades tardan décadas en adaptarse a los cambios de movilidad. Un carril bici nuevo o una línea de metro necesitan años para cambiar los hábitos de desplazamiento.</li>
              <li><strong>Sobrevalorar los grandes proyectos de "nueva ciudad":</strong> la mayoría fracasan por falta de masa crítica inicial de habitantes. Una ciudad funciona cuando tiene gente, y la gente llega si hay servicios: es un huevo y la gallina urbanístico.</li>
              <li><strong>Olvidar la dimensión social del espacio público:</strong> un parque seguro y bien iluminado lo usan todos; uno percibido como peligroso o degradado, nadie. La seguridad percibida determina quién tiene acceso real a la ciudad.</li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-urbanismo')} />
        <ShareCard appName="visualizador-urbanismo" />
      </main>

      <Footer appName="visualizador-urbanismo" />
    </div>
  );
}
