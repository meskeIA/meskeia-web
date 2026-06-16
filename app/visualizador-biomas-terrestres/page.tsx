'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './BiomasTerrestres.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { generateJsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface Bioma {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  latitud: string;
  tempMedia: string;
  precipitacion: string;
  estacion: string;
  suelo: string;
  biodiversidad: string;
  fauna: string[];
  flora: string[];
  amenazas: string[];
  ubicacion: string;
}

interface DatoClimatico {
  mes: string;
  temp: number;
  precip: number;
}

interface DatoConservacion {
  bioma: string;
  icono: string;
  superficie: string;
  porcentajeProtegida: number;
}

// ─────────────────────────────────────────────
// Datos de biomas
// ─────────────────────────────────────────────

const BIOMAS: Bioma[] = [
  {
    id: 'tropical',
    nombre: 'Bosque Tropical Húmedo',
    icono: '🌴',
    color: '#27AE60',
    latitud: '0°–10° N/S',
    tempMedia: '25–30 °C',
    precipitacion: '2000–4000 mm/año',
    estacion: 'Sin estación seca definida',
    suelo: 'Laterita (pobre en nutrientes; nutrientes concentrados en biomasa viva)',
    biodiversidad:
      'Más alta del planeta: ~50 % de especies terrestres en <6 % de la superficie',
    fauna: ['Jaguar', 'Tucán', 'Boa constrictora', 'Anaconda', 'Orangután'],
    flora: ['Ficus', 'Orquídeas epífitas', 'Lianas', 'Caoba', 'Ceiba'],
    amenazas: [
      'Deforestación (1,5 M ha/año solo en Amazonia)',
      'Minería ilegal',
      'Ganadería extensiva',
      'Cambio climático (sequías prolongadas)',
    ],
    ubicacion: 'Amazonia, Congo, Asia Sudoriental (Borneo, Sumatra)',
  },
  {
    id: 'templado',
    nombre: 'Bosque Templado',
    icono: '🌳',
    color: '#8BC34A',
    latitud: '30°–60° N/S',
    tempMedia: '5–20 °C',
    precipitacion: '500–1500 mm/año',
    estacion: '4 estaciones bien definidas',
    suelo: 'Tierra parda forestal (rica en humus)',
    biodiversidad: 'Media-alta; hojas caducas en invierno',
    fauna: ['Ciervo rojo', 'Jabalí', 'Zorro rojo', 'Búho real', 'Salamandra'],
    flora: ['Roble', 'Haya', 'Arce', 'Castaño', 'Pino (bosque mixto)'],
    amenazas: [
      'Fragmentación por agricultura',
      'Especies invasoras',
      'Incendios forestales',
    ],
    ubicacion:
      'Europa Central, Este de EE. UU., China oriental, Chile/Argentina del sur',
  },
  {
    id: 'taiga',
    nombre: 'Taiga / Bosque Boreal',
    icono: '🌲',
    color: '#2E7D32',
    latitud: '50°–70° N',
    tempMedia: '−5 a 5 °C',
    precipitacion: '300–900 mm/año',
    estacion: 'Invierno largo; verano corto (2–3 meses)',
    suelo: 'Podzol (ácido, pobre; permafrost parcial)',
    biodiversidad: 'Baja diversidad de especies pero biomasa enorme',
    fauna: ['Oso pardo', 'Lince boreal', 'Alce', 'Lobo gris', 'Águila real'],
    flora: [
      'Abeto',
      'Pino silvestre',
      'Alerce (única conífera caducifolia)',
      'Abedul',
    ],
    amenazas: [
      'Deshielo del permafrost (libera CH₄)',
      'Explotación maderera',
      'Incendios récord',
      'Minería',
    ],
    ubicacion: 'Rusia (Siberia), Canadá, Escandinavia',
  },
  {
    id: 'tundra',
    nombre: 'Tundra Ártica',
    icono: '🏔️',
    color: '#B0BEC5',
    latitud: '70°–90° N/S',
    tempMedia: '−20 a 5 °C',
    precipitacion: '150–250 mm/año (muy seco)',
    estacion: 'Permafrost permanente; verano polar de 24 h de luz',
    suelo: 'Permafrost: capa congelada permanentemente; suelo activo solo 30–50 cm en verano',
    biodiversidad: 'Muy baja; pocas especies altamente adaptadas',
    fauna: [
      'Oso polar',
      'Caribú / Reno',
      'Buey almizclero',
      'Zorro ártico',
      'Lemming',
    ],
    flora: [
      'Musgos',
      'Líquenes',
      'Hierba de algodón',
      'Sauce ártico (enano)',
      'Saxífragas',
    ],
    amenazas: [
      'Deshielo permafrost (libera CO₂ y CH₄ atrapados)',
      'Pérdida de hielo marino',
      'Explotación de hidrocarburos',
    ],
    ubicacion: 'Ártico (Groenlandia, norte de Canadá, Siberia), Antártica',
  },
  {
    id: 'desierto',
    nombre: 'Desierto',
    icono: '🏜️',
    color: '#FFC107',
    latitud: '15°–35° N/S',
    tempMedia: '20–50 °C (día) / −10 °C (noche)',
    precipitacion: '<250 mm/año',
    estacion: 'Sin estación húmeda; oscilación térmica extrema día/noche',
    suelo: 'Arenosol o Regosol (pobre en materia orgánica, sin estructura)',
    biodiversidad: 'Baja pero con alta endemicidad y adaptaciones extremas',
    fauna: [
      'Dromedario',
      'Fennec',
      'Escorpión',
      'Serpiente de cascabel',
      'Jerbo',
    ],
    flora: [
      'Cactus (desiertos americanos)',
      'Efedra',
      'Tamarisco',
      'Arbustos xerofíticos',
    ],
    amenazas: [
      'Desertificación por sobrepastoreo',
      'Extracción de agua subterránea',
      'Energía solar a gran escala',
    ],
    ubicacion: 'Sahara, Arabia, Gobi, Atacama, Mojave, Namib',
  },
  {
    id: 'sabana',
    nombre: 'Sabana',
    icono: '🦁',
    color: '#F39C12',
    latitud: '10°–20° N/S',
    tempMedia: '20–30 °C',
    precipitacion: '500–1500 mm/año (estacional)',
    estacion: 'Estación seca 5–8 meses + estación lluviosa explosiva',
    suelo: 'Ferralítico (rojo, laterítico) o vertisol (arcilloso expansivo)',
    biodiversidad: 'Alta fauna de grandes herbívoros y carnívoros',
    fauna: [
      'León',
      'Elefante africano',
      'Jirafa',
      'Cebra',
      'Guepardo',
      'Ñu',
    ],
    flora: [
      'Acacia',
      'Baobab',
      'Hierba de elefante',
      'Combretum',
      'Euphorbia arbórea',
    ],
    amenazas: [
      'Fragmentación por agricultura',
      'Caza furtiva',
      'Cambio climático (irregularidad lluvias)',
    ],
    ubicacion:
      'África subsahariana, Brasil (Cerrado), India (Deccan), Australia',
  },
  {
    id: 'mediterraneo',
    nombre: 'Mediterráneo',
    icono: '🌿',
    color: '#48A9A6',
    latitud: '30°–40° N/S',
    tempMedia: '15–25 °C',
    precipitacion: '300–900 mm/año (solo en invierno)',
    estacion: 'Verano seco y caluroso; invierno suave y lluvioso',
    suelo: 'Terra rossa (rojo, pobre, calcáreo; muy erosionable)',
    biodiversidad: 'Alta endemicidad; hotspot de biodiversidad global',
    fauna: [
      'Lince ibérico (endémico)',
      'Buitre leonado',
      'Cabra montés',
      'Tortuga mediterránea',
    ],
    flora: [
      'Encina',
      'Alcornoque',
      'Olivo',
      'Lavanda',
      'Jara',
      'Romero',
      'Pino mediterráneo',
    ],
    amenazas: [
      'Incendios forestales (empeoran con el cambio climático)',
      'Sequía intensa',
      'Urbanización costera',
      'Sobrepastoreo',
    ],
    ubicacion:
      'Cuenca mediterránea, California, Chile central, SO Australia, Sudáfrica (fynbos)',
  },
];

// ─────────────────────────────────────────────
// Datos climáticos mensuales (representativos)
// ─────────────────────────────────────────────

const MESES = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

const CLIMA_POR_BIOMA: Record<string, DatoClimatico[]> = {
  tropical: [
    { mes: 'E', temp: 26, precip: 260 },
    { mes: 'F', temp: 26, precip: 240 },
    { mes: 'M', temp: 27, precip: 300 },
    { mes: 'A', temp: 27, precip: 320 },
    { mes: 'M', temp: 27, precip: 300 },
    { mes: 'J', temp: 26, precip: 280 },
    { mes: 'J', temp: 26, precip: 270 },
    { mes: 'A', temp: 26, precip: 280 },
    { mes: 'S', temp: 27, precip: 310 },
    { mes: 'O', temp: 27, precip: 330 },
    { mes: 'N', temp: 27, precip: 290 },
    { mes: 'D', temp: 26, precip: 260 },
  ],
  templado: [
    { mes: 'E', temp: 2, precip: 55 },
    { mes: 'F', temp: 3, precip: 50 },
    { mes: 'M', temp: 7, precip: 60 },
    { mes: 'A', temp: 12, precip: 65 },
    { mes: 'M', temp: 16, precip: 70 },
    { mes: 'J', temp: 19, precip: 75 },
    { mes: 'J', temp: 21, precip: 70 },
    { mes: 'A', temp: 20, precip: 70 },
    { mes: 'S', temp: 16, precip: 65 },
    { mes: 'O', temp: 11, precip: 65 },
    { mes: 'N', temp: 6, precip: 60 },
    { mes: 'D', temp: 3, precip: 55 },
  ],
  taiga: [
    { mes: 'E', temp: -20, precip: 25 },
    { mes: 'F', temp: -18, precip: 22 },
    { mes: 'M', temp: -10, precip: 28 },
    { mes: 'A', temp: 0, precip: 35 },
    { mes: 'M', temp: 8, precip: 45 },
    { mes: 'J', temp: 15, precip: 60 },
    { mes: 'J', temp: 18, precip: 65 },
    { mes: 'A', temp: 16, precip: 60 },
    { mes: 'S', temp: 9, precip: 50 },
    { mes: 'O', temp: 0, precip: 40 },
    { mes: 'N', temp: -10, precip: 30 },
    { mes: 'D', temp: -17, precip: 25 },
  ],
  tundra: [
    { mes: 'E', temp: -28, precip: 12 },
    { mes: 'F', temp: -26, precip: 11 },
    { mes: 'M', temp: -22, precip: 13 },
    { mes: 'A', temp: -12, precip: 14 },
    { mes: 'M', temp: -2, precip: 16 },
    { mes: 'J', temp: 5, precip: 20 },
    { mes: 'J', temp: 8, precip: 25 },
    { mes: 'A', temp: 7, precip: 22 },
    { mes: 'S', temp: 1, precip: 18 },
    { mes: 'O', temp: -10, precip: 16 },
    { mes: 'N', temp: -20, precip: 13 },
    { mes: 'D', temp: -26, precip: 12 },
  ],
  desierto: [
    { mes: 'E', temp: 15, precip: 3 },
    { mes: 'F', temp: 18, precip: 3 },
    { mes: 'M', temp: 23, precip: 3 },
    { mes: 'A', temp: 28, precip: 2 },
    { mes: 'M', temp: 33, precip: 1 },
    { mes: 'J', temp: 38, precip: 1 },
    { mes: 'J', temp: 41, precip: 1 },
    { mes: 'A', temp: 40, precip: 2 },
    { mes: 'S', temp: 36, precip: 2 },
    { mes: 'O', temp: 29, precip: 3 },
    { mes: 'N', temp: 22, precip: 3 },
    { mes: 'D', temp: 16, precip: 3 },
  ],
  sabana: [
    { mes: 'E', temp: 23, precip: 10 },
    { mes: 'F', temp: 24, precip: 15 },
    { mes: 'M', temp: 25, precip: 30 },
    { mes: 'A', temp: 25, precip: 80 },
    { mes: 'M', temp: 24, precip: 140 },
    { mes: 'J', temp: 22, precip: 180 },
    { mes: 'J', temp: 21, precip: 200 },
    { mes: 'A', temp: 22, precip: 190 },
    { mes: 'S', temp: 23, precip: 150 },
    { mes: 'O', temp: 24, precip: 80 },
    { mes: 'N', temp: 24, precip: 30 },
    { mes: 'D', temp: 23, precip: 12 },
  ],
  mediterraneo: [
    { mes: 'E', temp: 10, precip: 80 },
    { mes: 'F', temp: 11, precip: 70 },
    { mes: 'M', temp: 13, precip: 55 },
    { mes: 'A', temp: 16, precip: 40 },
    { mes: 'M', temp: 20, precip: 25 },
    { mes: 'J', temp: 25, precip: 10 },
    { mes: 'J', temp: 28, precip: 5 },
    { mes: 'A', temp: 28, precip: 8 },
    { mes: 'S', temp: 24, precip: 30 },
    { mes: 'O', temp: 19, precip: 60 },
    { mes: 'N', temp: 14, precip: 75 },
    { mes: 'D', temp: 10, precip: 85 },
  ],
};

// ─────────────────────────────────────────────
// Datos de conservación
// ─────────────────────────────────────────────

const CONSERVACION: DatoConservacion[] = [
  {
    bioma: 'Bosque Tropical',
    icono: '🌴',
    superficie: '15 M km²',
    porcentajeProtegida: 18,
  },
  {
    bioma: 'Bosque Templado',
    icono: '🌳',
    superficie: '7 M km²',
    porcentajeProtegida: 14,
  },
  {
    bioma: 'Taiga',
    icono: '🌲',
    superficie: '17 M km²',
    porcentajeProtegida: 12,
  },
  {
    bioma: 'Tundra',
    icono: '🏔️',
    superficie: '8 M km²',
    porcentajeProtegida: 22,
  },
  {
    bioma: 'Desierto',
    icono: '🏜️',
    superficie: '33 M km²',
    porcentajeProtegida: 8,
  },
  {
    bioma: 'Sabana',
    icono: '🦁',
    superficie: '25 M km²',
    porcentajeProtegida: 15,
  },
  {
    bioma: 'Mediterráneo',
    icono: '🌿',
    superficie: '2 M km²',
    porcentajeProtegida: 5,
  },
];

// ─────────────────────────────────────────────
// Componente: Climograma de Walter-Lieth
// ─────────────────────────────────────────────

function Climograma({ biomaId }: { biomaId: string }) {
  const datos = CLIMA_POR_BIOMA[biomaId] ?? CLIMA_POR_BIOMA['tropical'];
  const ancho = 520;
  const alto = 200;
  const margenIzq = 48;
  const margenDer = 48;
  const margenSup = 16;
  const margenInf = 32;
  const anchoGrafico = ancho - margenIzq - margenDer;
  const altoGrafico = alto - margenSup - margenInf;

  const tempMin = Math.min(...datos.map((d) => d.temp));
  const tempMax = Math.max(...datos.map((d) => d.temp));
  const precipMax = Math.max(...datos.map((d) => d.precip));

  // Walter-Lieth dual scale: ≤100mm → p/2 as °C equiv; >100mm → compressed (50 + (p-100)/10)
  const precipToTempEq = (p: number): number =>
    p <= 100 ? p / 2 : 50 + (p - 100) / 10;

  // Expand y-axis to fit both temperature values and precipitation equivalents
  const precipMaxEq = precipToTempEq(precipMax);
  const axisMin = Math.min(tempMin, 0) - 5;
  const axisMax = Math.max(tempMax, precipMaxEq) + 5;
  const axisRange = axisMax - axisMin;

  const xMes = (i: number) =>
    margenIzq + (i * anchoGrafico) / 11 + anchoGrafico / 22;

  const yPos = (value: number) =>
    margenSup + altoGrafico * (1 - (value - axisMin) / axisRange);

  const yTemp = (t: number) => yPos(t);

  // Precipitation as bars from 0-baseline up
  const yBaseline = yPos(Math.max(axisMin, 0));
  const yPrecTop = (p: number) => Math.max(margenSup, yPos(precipToTempEq(p)));

  const puntosTemp = datos
    .map((d, i) => `${xMes(i)},${yTemp(d.temp)}`)
    .join(' ');

  const tempAnual =
    datos.reduce((s, d) => s + d.temp, 0) / datos.length;
  const precipAnual = datos.reduce((s, d) => s + d.precip, 0);

  return (
    <div className={styles.climogramaBox}>
      <div className={styles.climogramaMetadata}>
        <span>
          T. media anual: <strong>{tempAnual.toFixed(1)} °C</strong>
        </span>
        <span>
          Precip. anual: <strong>{precipAnual.toFixed(0)} mm</strong>
        </span>
        <span>
          T. mín mes frío:{' '}
          <strong>{Math.min(...datos.map((d) => d.temp)).toFixed(0)} °C</strong>
        </span>
        <span>
          T. máx mes cálido:{' '}
          <strong>{Math.max(...datos.map((d) => d.temp)).toFixed(0)} °C</strong>
        </span>
      </div>
      <div className={styles.climogramaSvg}>
        <svg
          viewBox={`0 0 ${ancho} ${alto}`}
          aria-label="Climograma de Walter-Lieth"
          role="img"
        >
          {/* Ejes */}
          <line
            x1={margenIzq}
            y1={margenSup}
            x2={margenIzq}
            y2={margenSup + altoGrafico}
            stroke="#ccc"
            strokeWidth="1"
          />
          <line
            x1={margenIzq}
            y1={margenSup + altoGrafico}
            x2={ancho - margenDer}
            y2={margenSup + altoGrafico}
            stroke="#ccc"
            strokeWidth="1"
          />
          <line
            x1={ancho - margenDer}
            y1={margenSup}
            x2={ancho - margenDer}
            y2={margenSup + altoGrafico}
            stroke="#ccc"
            strokeWidth="1"
          />

          {/* Etiquetas meses */}
          {MESES.map((m, i) => (
            <text
              key={i}
              x={xMes(i)}
              y={margenSup + altoGrafico + 14}
              textAnchor="middle"
              fontSize="9"
              fill="#888"
            >
              {m}
            </text>
          ))}

          {/* Barras precipitación (azul) — Walter-Lieth */}
          {datos.map((d, i) => {
            const barWidth = (anchoGrafico / 12) * 0.65;
            const top = yPrecTop(d.precip);
            const bottom = Math.min(yBaseline, margenSup + altoGrafico);
            return (
              <rect
                key={i}
                x={xMes(i) - barWidth / 2}
                y={top}
                width={barWidth}
                height={Math.max(0, bottom - top)}
                fill="#2E86AB"
                opacity="0.55"
              />
            );
          })}

          {/* Línea temperatura (rojo) */}
          <polyline
            points={puntosTemp}
            fill="none"
            stroke="#E74C3C"
            strokeWidth="2"
          />

          {/* Leyenda */}
          <rect x={margenIzq + 4} y={margenSup + 4} width="10" height="4" fill="#E74C3C" />
          <text x={margenIzq + 18} y={margenSup + 9} fontSize="8" fill="#888">
            Temperatura (°C)
          </text>
          <rect x={margenIzq + 4} y={margenSup + 12} width="10" height="8" fill="#2E86AB" opacity="0.55" />
          <text x={margenIzq + 18} y={margenSup + 19} fontSize="8" fill="#888">
            Precipitación (mm)
          </text>
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente: Diagrama de latitudes
// ─────────────────────────────────────────────

function DiagramaLatitudes({
  biomaActivo,
  onSelectBioma,
}: {
  biomaActivo: string;
  onSelectBioma: (id: string) => void;
}) {
  const franjas = [
    { lat: '90°–70°', biomas: ['tundra'], label: 'Polar / Subpolar' },
    { lat: '70°–50°', biomas: ['taiga'], label: 'Subártico / Boreal' },
    { lat: '50°–40°', biomas: ['templado'], label: 'Templado' },
    {
      lat: '40°–30°',
      biomas: ['mediterraneo', 'templado'],
      label: 'Subtemplado / Mediterráneo',
    },
    {
      lat: '30°–15°',
      biomas: ['desierto', 'sabana'],
      label: 'Subtropical',
    },
    { lat: '15°–0°', biomas: ['tropical', 'sabana'], label: 'Tropical' },
  ];

  return (
    <div className={styles.mapaBox}>
      <p className={styles.mapaDescripcion}>
        Distribución latitudinal de los biomas terrestres — haz clic para
        seleccionar un bioma.
      </p>
      <div className={styles.latitudDiagrama}>
        <div className={styles.latitudEjeY}>
          <span>Norte</span>
          <span>Sur</span>
        </div>
        <div className={styles.latitudFranjas}>
          {franjas.map((franja) => (
            <div key={franja.lat} className={styles.latitudFranja}>
              <span className={styles.latitudLabel}>{franja.lat}</span>
              <div className={styles.latitudBiomasRow}>
                {franja.biomas.map((bid) => {
                  const bioma = BIOMAS.find((b) => b.id === bid);
                  if (!bioma) return null;
                  return (
                    <button
                      key={bid}
                      type="button"
                      className={[
                        styles.latitudBiomaBtn,
                        biomaActivo === bid
                          ? styles.latitudBiomaBtnActivo
                          : '',
                      ].join(' ')}
                      style={
                        {
                          '--bioma-color': bioma.color,
                        } as React.CSSProperties
                      }
                      onClick={() => onSelectBioma(bid)}
                      aria-label={`Seleccionar bioma: ${bioma.nombre}`}
                      aria-pressed={biomaActivo === bid}
                    >
                      <span aria-hidden="true">{bioma.icono}</span> {bioma.nombre}
                    </button>
                  );
                })}
              </div>
              <span className={styles.latitudZona}>{franja.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.leyendaMap}>
        {BIOMAS.map((b) => (
          <button
            key={b.id}
            type="button"
            className={[
              styles.leyendaItem,
              biomaActivo === b.id ? styles.leyendaItemActivo : '',
            ].join(' ')}
            style={{ '--bioma-color': b.color } as React.CSSProperties}
            onClick={() => onSelectBioma(b.id)}
            aria-label={`Ver bioma: ${b.nombre}`}
            aria-pressed={biomaActivo === b.id}
          >
            <span
              className={styles.leyendaColor}
              style={{ background: b.color }}
            />
            <span aria-hidden="true">{b.icono}</span> {b.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorBiomasTerrestres() {
  const jsonLd = generateJsonLd();
  const [tab, setTab] = useState<
    'selector' | 'clima' | 'mapa' | 'amenazas'
  >('selector');
  const [biomaActivo, setBiomaActivo] = useState<string>('tropical');

  const biomaSeleccionado =
    BIOMAS.find((b) => b.id === biomaActivo) ?? BIOMAS[0];

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcono} aria-hidden="true">
          🌍
        </div>
        <h1 className={styles.titulo}>Biomas Terrestres</h1>
        <p className={styles.subtitulo}>
          Clima, biodiversidad y amenazas de los 7 grandes ecosistemas del
          planeta
        </p>
        <p className={styles.heroNota}>
          Selecciona un bioma para explorar su clima, fauna, flora y estado de
          conservación
        </p>
      </header>

      <LegalNotice />

      {/* Pestañas */}
      <nav className={styles.tabBar} aria-label="Secciones del visualizador">
        {(
          [
            { id: 'selector', label: '🌿 Biomas' },
            { id: 'clima', label: '🌡️ Clima' },
            { id: 'mapa', label: '🗺️ Distribución' },
            { id: 'amenazas', label: '⚠️ Conservación' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            className={[
              styles.tab,
              tab === t.id ? styles.tabActivo : '',
            ].join(' ')}
            onClick={() => setTab(t.id)}
            aria-selected={tab === t.id}
            role="tab"
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Tab 1: Selector de bioma */}
      {tab === 'selector' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>
            <span aria-hidden="true">🌿</span> Selecciona un bioma
          </h2>
          <p className={styles.seccionSubtitulo}>
            Los 7 biomas terrestres principales, organizados por latitud y
            clima
          </p>

          <div className={styles.biomasGrid}>
            {BIOMAS.map((b) => (
              <button
                key={b.id}
                type="button"
                className={[
                  styles.biomaCard,
                  biomaActivo === b.id ? styles.biomaCardActivo : '',
                ].join(' ')}
                style={{ '--bioma-color': b.color } as React.CSSProperties}
                onClick={() => setBiomaActivo(b.id)}
                aria-pressed={biomaActivo === b.id}
              >
                <span className={styles.biomaIcono} aria-hidden="true">
                  {b.icono}
                </span>
                <span className={styles.biomaNombre}>{b.nombre}</span>
                <span className={styles.biomaLatitud}>{b.latitud}</span>
              </button>
            ))}
          </div>

          {/* Panel de detalle */}
          <div
            className={styles.biomaDetalle}
            style={
              {
                '--bioma-color': biomaSeleccionado.color,
              } as React.CSSProperties
            }
          >
            <div className={styles.biomaDetalleHeader}>
              <span
                className={styles.biomaDetalleIcono}
                aria-hidden="true"
              >
                {biomaSeleccionado.icono}
              </span>
              <div>
                <h3 className={styles.biomaDetalleNombre}>
                  {biomaSeleccionado.nombre}
                </h3>
                <p className={styles.biomaDetalleUbicacion}>
                  <span aria-hidden="true">📍</span> {biomaSeleccionado.ubicacion}
                </p>
              </div>
            </div>

            <div className={styles.biomaDetalleGrid}>
              <div className={styles.biomaDetalleCelda}>
                <span className={styles.biomaDetalleLabel}>
                  <span aria-hidden="true">🌡️</span> Temperatura
                </span>
                <span className={styles.biomaDetalleValor}>
                  {biomaSeleccionado.tempMedia}
                </span>
              </div>
              <div className={styles.biomaDetalleCelda}>
                <span className={styles.biomaDetalleLabel}>
                  <span aria-hidden="true">🌧️</span> Precipitación
                </span>
                <span className={styles.biomaDetalleValor}>
                  {biomaSeleccionado.precipitacion}
                </span>
              </div>
              <div className={styles.biomaDetalleCelda}>
                <span className={styles.biomaDetalleLabel}>
                  <span aria-hidden="true">📍</span> Latitud
                </span>
                <span className={styles.biomaDetalleValor}>
                  {biomaSeleccionado.latitud}
                </span>
              </div>
              <div className={styles.biomaDetalleCelda}>
                <span className={styles.biomaDetalleLabel}>
                  <span aria-hidden="true">🌀</span> Estación
                </span>
                <span className={styles.biomaDetalleValor}>
                  {biomaSeleccionado.estacion}
                </span>
              </div>
            </div>

            <div className={styles.biomaDetalleSuelo}>
              <strong>Suelo:</strong> {biomaSeleccionado.suelo}
            </div>
            <div className={styles.biomaDetalleBiodiversidad}>
              <strong>Biodiversidad:</strong>{' '}
              {biomaSeleccionado.biodiversidad}
            </div>

            <div className={styles.biomaDetalleListasGrid}>
              <div>
                <p className={styles.biomaDetalleListaTitulo}>
                  <span aria-hidden="true">🦎</span> Fauna representativa
                </p>
                <ul className={styles.biomaDetalleList}>
                  {biomaSeleccionado.fauna.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className={styles.biomaDetalleListaTitulo}>
                  <span aria-hidden="true">🌱</span> Flora característica
                </p>
                <ul className={styles.biomaDetalleList}>
                  {biomaSeleccionado.flora.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className={styles.biomaDetalleListaTitulo}>
                  <span aria-hidden="true">⚠️</span> Principales amenazas
                </p>
                <ul className={styles.biomaDetalleList}>
                  {biomaSeleccionado.amenazas.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab 2: Climograma */}
      {tab === 'clima' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>
            <span aria-hidden="true">🌡️</span> Diagrama de Walter-Lieth
          </h2>
          <p className={styles.seccionSubtitulo}>
            Temperatura media mensual (rojo) y precipitación mensual (azul)
            para el bioma seleccionado. Selecciona un bioma:
          </p>

          <div className={styles.biomasSelectorHorizontal}>
            {BIOMAS.map((b) => (
              <button
                key={b.id}
                type="button"
                className={[
                  styles.biomaChip,
                  biomaActivo === b.id ? styles.biomaChipActivo : '',
                ].join(' ')}
                style={{ '--bioma-color': b.color } as React.CSSProperties}
                onClick={() => setBiomaActivo(b.id)}
                aria-pressed={biomaActivo === b.id}
              >
                <span aria-hidden="true">{b.icono}</span> {b.nombre}
              </button>
            ))}
          </div>

          <Climograma biomaId={biomaActivo} />

          <div className={styles.climaInfo}>
            <div className={styles.climaInfoCard}>
              <span className={styles.climaInfoLabel}>Bioma actual</span>
              <span className={styles.climaInfoValor}>
                <span aria-hidden="true">{biomaSeleccionado.icono}</span> {biomaSeleccionado.nombre}
              </span>
            </div>
            <div className={styles.climaInfoCard}>
              <span className={styles.climaInfoLabel}>Precipitación</span>
              <span className={styles.climaInfoValor}>
                {biomaSeleccionado.precipitacion}
              </span>
            </div>
            <div className={styles.climaInfoCard}>
              <span className={styles.climaInfoLabel}>Temperatura</span>
              <span className={styles.climaInfoValor}>
                {biomaSeleccionado.tempMedia}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Tab 3: Distribución */}
      {tab === 'mapa' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>
            <span aria-hidden="true">🗺️</span> Distribución por latitud
          </h2>
          <p className={styles.seccionSubtitulo}>
            Los biomas se distribuyen en cinturones latitudinales determinados
            por el clima. Selecciona un bioma en el diagrama o en la leyenda.
          </p>
          <DiagramaLatitudes
            biomaActivo={biomaActivo}
            onSelectBioma={setBiomaActivo}
          />
          <div className={styles.biomaDetalleMinimo}>
            <strong>
              <span aria-hidden="true">{biomaSeleccionado.icono}</span> {biomaSeleccionado.nombre}
            </strong>
            : {biomaSeleccionado.ubicacion}
          </div>
        </section>
      )}

      {/* Tab 4: Amenazas y conservación */}
      {tab === 'amenazas' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>
            <span aria-hidden="true">⚠️</span> Amenazas globales y conservación
          </h2>
          <p className={styles.seccionSubtitulo}>
            Principales presiones sobre los biomas terrestres y estado de
            protección actual
          </p>

          <div className={styles.amenazasGrid}>
            {[
              {
                titulo: 'Deforestación',
                icono: '🪵',
                severidad: 90,
                color: '#C0392B',
                texto:
                  '10 millones de ha/año a escala global (bosques tropicales los más afectados). Causas: ganadería (45 %), agricultura comercial (25 %), leña (9 %).',
              },
              {
                titulo: 'Cambio climático',
                icono: '🌡️',
                severidad: 85,
                color: '#E67E22',
                texto:
                  'Temperatura global +1,2 °C ya superado. Desplazamiento de biomas hacia los polos ~6 km/año. Más amenazados: tundra (permafrost), mediterráneo (sequía).',
              },
              {
                titulo: 'Fragmentación',
                icono: '🔀',
                severidad: 75,
                color: '#8E44AD',
                texto:
                  'Más del 70 % de los bosques mundiales están a menos de 1 km de un borde antrópico → efecto de borde, invasión de especies, reducción de poblaciones viables.',
              },
              {
                titulo: 'Especies invasoras',
                icono: '🦟',
                severidad: 65,
                color: '#2980B9',
                texto:
                  '2.ª causa de extinción tras la pérdida de hábitat. Ejemplos: eucalipto en zonas mediterráneas, rata noruega en islas, Caulerpa taxifolia en el Mediterráneo.',
              },
            ].map((a) => (
              <div key={a.titulo} className={styles.amenazaCard}>
                <div className={styles.amenazaHeader}>
                  <span className={styles.amenazaIcono} aria-hidden="true">
                    {a.icono}
                  </span>
                  <h3 className={styles.amenazaTitulo}>{a.titulo}</h3>
                </div>
                <div className={styles.severidadContainer}>
                  <div
                    className={styles.severidadBar}
                    role="progressbar"
                    aria-valuenow={a.severidad}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Severidad: ${a.severidad}%`}
                  >
                    <div
                      className={styles.severidadRelleno}
                      style={{
                        width: `${a.severidad}%`,
                        background: a.color,
                      }}
                    />
                  </div>
                  <span
                    className={styles.severidadValor}
                    style={{ color: a.color }}
                  >
                    {a.severidad}/100
                  </span>
                </div>
                <p className={styles.amenazaTexto}>{a.texto}</p>
              </div>
            ))}
          </div>

          <h3 className={styles.subseccionTitulo}>
            Estado de conservación por bioma
          </h3>
          <div className={styles.proteccionTableWrapper}>
            <table className={styles.proteccionTable}>
              <thead>
                <tr>
                  <th>Bioma</th>
                  <th>Superficie global</th>
                  <th>% protegida</th>
                  <th>Barra</th>
                </tr>
              </thead>
              <tbody>
                {CONSERVACION.map((row) => (
                  <tr key={row.bioma}>
                    <td>
                      <span aria-hidden="true">{row.icono}</span> {row.bioma}
                    </td>
                    <td>{row.superficie}</td>
                    <td>
                      <strong
                        style={{
                          color:
                            row.porcentajeProtegida < 10
                              ? '#C0392B'
                              : row.porcentajeProtegida < 20
                              ? '#E67E22'
                              : '#27AE60',
                        }}
                      >
                        {row.porcentajeProtegida} %
                      </strong>
                    </td>
                    <td className={styles.barraCell}>
                      <div className={styles.barraFondo}>
                        <div
                          className={styles.barraRelleno}
                          style={{
                            width: `${row.porcentajeProtegida * 3}%`,
                            background:
                              row.porcentajeProtegida < 10
                                ? '#C0392B'
                                : row.porcentajeProtegida < 20
                                ? '#E67E22'
                                : '#27AE60',
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.tablaNota}>
            Objetivo internacional: 30 % de superficie terrestre protegida
            para 2030 (acuerdo Kunming-Montreal, COP15).
          </p>
        </section>
      )}

      <EducationalSection
        title="Biomas terrestres: los grandes ecosistemas del planeta"
        subtitle="El clima dicta la vida: de la tundra ártica a la selva ecuatorial"
      >
        <p>
          Un bioma es una región climática con comunidades de plantas y animales
          adaptadas a sus condiciones. No los definen fronteras políticas, sino
          el clima: temperatura media y distribución de precipitaciones a lo
          largo del año. El mismo tipo de bioma —por ejemplo, el bosque
          mediterráneo— aparece en 5 continentes en las mismas latitudes y
          condiciones.
        </p>
        <p>
          Los biomas están distribuidos en cinturones latitudinales porque la
          radiación solar determina la temperatura, y los sistemas de presión y
          circulación atmosférica determinan las precipitaciones. Los desiertos
          subtropicales (Sahara, Arabia) se forman bajo las células de Hadley de
          alta presión que bloquean la lluvia. Las selvas ecuatoriales prosperan
          donde la ITCZ (Zona de Convergencia Intertropical) aporta lluvia todo
          el año.
        </p>
        <p>
          El cambio climático está desplazando los biomas hacia los polos y en
          altitud. La taiga avanza sobre la tundra, el Mediterráneo avanza sobre
          el bosque templado, los desiertos se expanden. Entender los biomas es
          entender cómo el planeta organiza la vida y por qué su perturbación
          tiene consecuencias globales.
        </p>

        {/* ── 1. TABLA COMPARATIVA ── */}
        <h3 className={styles.eduSubtitulo}>Comparativa de los 7 biomas principales</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Bioma</th>
                <th>Temperatura media</th>
                <th>Precipitación anual</th>
                <th>Biodiversidad</th>
                <th>Amenaza principal</th>
                <th>% protegido</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span aria-hidden="true">🌴</span> Tropical húmedo</td>
                <td>25–30 °C</td>
                <td>2.000–4.000 mm</td>
                <td>Muy alta (50 % especies)</td>
                <td>Deforestación</td>
                <td><strong style={{ color: '#E67E22' }}>18 %</strong></td>
              </tr>
              <tr>
                <td><span aria-hidden="true">🌳</span> Templado</td>
                <td>5–20 °C</td>
                <td>500–1.500 mm</td>
                <td>Media-alta</td>
                <td>Fragmentación</td>
                <td><strong style={{ color: '#E67E22' }}>14 %</strong></td>
              </tr>
              <tr>
                <td><span aria-hidden="true">🌲</span> Taiga / Boreal</td>
                <td>−5 a 5 °C</td>
                <td>300–900 mm</td>
                <td>Baja diversidad</td>
                <td>Deshielo permafrost</td>
                <td><strong style={{ color: '#E67E22' }}>12 %</strong></td>
              </tr>
              <tr>
                <td><span aria-hidden="true">🏔️</span> Tundra ártica</td>
                <td>−20 a 5 °C</td>
                <td>150–250 mm</td>
                <td>Muy baja</td>
                <td>Cambio climático</td>
                <td><strong style={{ color: '#27AE60' }}>22 %</strong></td>
              </tr>
              <tr>
                <td><span aria-hidden="true">🏜️</span> Desierto</td>
                <td>20–50 °C (día)</td>
                <td>&lt; 250 mm</td>
                <td>Baja, alta endemicidad</td>
                <td>Desertificación</td>
                <td><strong style={{ color: '#C0392B' }}>8 %</strong></td>
              </tr>
              <tr>
                <td><span aria-hidden="true">🦁</span> Sabana</td>
                <td>20–30 °C</td>
                <td>500–1.500 mm estacionales</td>
                <td>Alta (grandes herbívoros)</td>
                <td>Caza furtiva</td>
                <td><strong style={{ color: '#E67E22' }}>15 %</strong></td>
              </tr>
              <tr>
                <td><span aria-hidden="true">🌿</span> Mediterráneo</td>
                <td>15–25 °C</td>
                <td>300–900 mm (invierno)</td>
                <td>Alta endemicidad</td>
                <td>Incendios forestales</td>
                <td><strong style={{ color: '#C0392B' }}>5 %</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── 2. CASOS DE USO ── */}
        <h3 className={styles.eduSubtitulo}>¿Para quién es útil este visualizador?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcono} aria-hidden="true">🎓</span>
            <h4>Estudiante de Bachillerato</h4>
            <p>
              Prepara el examen de ecología o Biología de 2.º de Bachillerato con los climogramas
              de Walter-Lieth, la distribución latitudinal y las características de cada bioma.
              El visualizador cubre exactamente los contenidos del currículo LOMLOE.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcono} aria-hidden="true">🌍</span>
            <h4>Viajero o naturalista</h4>
            <p>
              Planifica un safari en la sabana africana, una expedición a la taiga siberiana o
              un trekking por la tundra ártica. Conoce de antemano el clima, la fauna y las
              épocas del año más favorables para cada bioma.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcono} aria-hidden="true">♻️</span>
            <h4>Ciudadano preocupado por el clima</h4>
            <p>
              Entiende qué ecosistemas están en mayor peligro y por qué el cambio climático
              desplaza los biomas hacia los polos. Comprende el impacto real de la deforestación
              y la pérdida del permafrost en el sistema climático global.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcono} aria-hidden="true">📋</span>
            <h4>Opositor a ciencias naturales</h4>
            <p>
              Prepara oposiciones de Biología, Geografía o Ciencias de la Naturaleza con datos
              verificados: superficies, porcentajes de protección, suelos, biodiversidad y
              amenazas de cada bioma. Todo en una sola referencia visual.
            </p>
          </div>
        </div>

        {/* ── 3. FAQ ── */}
        <h3 className={styles.eduSubtitulo}>Preguntas frecuentes sobre biomas</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Cuántos biomas existen en la Tierra?</h4>
            <p>
              Depende del sistema de clasificación. El más usado en ecología reconoce entre 6 y 9
              biomas terrestres principales. Este visualizador trabaja con los 7 más aceptados en
              la educación española: tropical, templado, taiga, tundra, desierto, sabana y
              mediterráneo. Algunos sistemas añaden praderas templadas, manglares o bioma de
              alta montaña como categorías independientes.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> La clasificación de Whittaker (1975) basada en temperatura y precipitación es la referencia estándar.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué bioma tiene mayor biodiversidad?</h4>
            <p>
              El bosque tropical húmedo (selva ecuatorial). Ocupa menos del 6 % de la superficie
              terrestre pero alberga aproximadamente el 50 % de todas las especies conocidas de
              plantas y animales. La Amazonia, la cuenca del Congo y las selvas de Borneo/Sumatra
              son los tres grandes repositorios de biodiversidad tropical.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cómo afecta el cambio climático a los biomas?</h4>
            <p>
              El calentamiento global está desplazando los biomas hacia los polos y en altitud a
              una velocidad de 6–11 km por década. La tundra retrocede ante la taiga, que avanza
              hacia el norte. El bioma mediterráneo se expande hacia el norte de Europa. Los
              desiertos subtropicales se amplían. El impacto más grave es el deshielo del
              permafrost, que libera metano (CH₄) y CO₂ almacenados durante miles de años,
              creando un bucle de retroalimentación positiva.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué diferencia hay entre bioma y ecosistema?</h4>
            <p>
              Un bioma es una categoría climática y geográfica amplia que agrupa ecosistemas con
              características similares en cualquier parte del mundo. Un ecosistema es una unidad
              más concreta: incluye los seres vivos y el medio físico de un lugar concreto, junto
              con sus interacciones. Dentro del bioma mediterráneo hay ecosistemas muy diferentes:
              dehesa, matorral, ribera, laguna costera. El bioma es la escala regional; el
              ecosistema, la escala local.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Regla rápida: varios ecosistemas distintos pueden compartir el mismo bioma.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿España tiene varios biomas?</h4>
            <p>
              Sí. España es uno de los países europeos con mayor diversidad de biomas, lo que
              explica su riqueza en biodiversidad. La mayor parte de la Península es bioma
              mediterráneo, pero el norte atlántico (Galicia, Cantabria, País Vasco) tiene
              características de bosque templado oceánico. Los Pirineos y Sierra Nevada presentan
              bioma de alta montaña. Las islas Canarias tienen zonas de bioma seco y laurisilva,
              un relicto de bosque subtropical que ya no existe en el continente.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué bioma está en mayor peligro de extinción?</h4>
            <p>
              El bioma mediterráneo es el más amenazado en términos relativos: solo el 5 % de su
              superficie está protegida y ha perdido más del 70 % de su vegetación original. Es
              uno de los 36 hotspots de biodiversidad global reconocidos por Conservation
              International. A escala absoluta, el bosque tropical húmedo pierde más superficie
              por año (1,5 millones de ha solo en la Amazonia), pero el mediterráneo cuenta con
              mucho menos territorio para perder.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Solo el 5 % del bioma mediterráneo está protegido frente al objetivo del 30 % para 2030.
            </p>
          </div>
        </div>

        {/* ── 4. GUÍA PASO A PASO ── */}
        <h3 className={styles.eduSubtitulo}>Cómo identificar un bioma por sus características climáticas</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h4>Observa la temperatura media anual</h4>
              <p>
                Si supera los 20 °C durante todo el año → probable tropical o desierto.
                Si oscila entre 5 y 20 °C con estaciones marcadas → templado.
                Si es sistemáticamente negativa o próxima a 0 °C → taiga o tundra.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h4>Analiza la precipitación total y su distribución</h4>
              <p>
                Menos de 250 mm anuales → desierto. Entre 500 y 1.500 mm repartidos
                uniformemente → templado o taiga. Entre 500 y 1.500 mm muy estacionales
                (seca + lluviosa) → sabana. Más de 2.000 mm sin estación seca → tropical.
                300–900 mm concentrados en invierno → mediterráneo.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h4>Consulta la latitud geográfica</h4>
              <p>
                0°–10°: tropical o sabana. 10°–30°: desierto o sabana. 30°–40°: mediterráneo
                o desierto. 40°–60°: templado. 60°–70°: taiga. 70°–90°: tundra. La altitud
                puede comprimir estos rangos: en los Andes o el Himalaya se atraviesan todos
                los biomas en pocos kilómetros verticales.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h4>Usa el climograma de Walter-Lieth como confirmación</h4>
              <p>
                Dibuja los datos mensuales de temperatura (línea roja) y precipitación (barras
                azules). Si la línea roja supera sistemáticamente a las barras → período seco.
                Si las barras superan a la línea → período húmedo. El patrón de cruce y la
                escala (1 °C = 2 mm en Walter-Lieth estándar) confirma el bioma.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h4>Verifica con la vegetación dominante y el tipo de suelo</h4>
              <p>
                Cada bioma tiene un suelo característico: laterita (tropical), tierra parda
                (templado), podzol (taiga), permafrost (tundra), arenosol (desierto), ferralítico
                (sabana), terra rossa (mediterráneo). La vegetación dominante —árboles perennes,
                caducifolios, coníferas, matorrales o gramíneas— confirma el diagnóstico.
              </p>
            </div>
          </div>
        </div>

        {/* ── 5. MEJORES PRÁCTICAS ── */}
        <h3 className={styles.eduSubtitulo}>Consejos para estudiar la distribución bioclimática</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
            <h4>Aprende los cinturones latitudinales</h4>
            <p>
              Memoriza la secuencia polar → boreal → templado → mediterráneo → desierto
              → sabana → tropical de polos al ecuador. Esta regla general funciona en ambos
              hemisferios y facilita recordar la distribución sin memorizar mapas complejos.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
            <h4>Practica con climogramas reales</h4>
            <p>
              Descarga datos climáticos de ciudades como Manaus (tropical), París (templado),
              Yakutsk (taiga), Nuuk (tundra), El Cairo (desierto), Nairobi (sabana) y Valencia
              (mediterráneo). Dibujar los climogramas a mano refuerza la comprensión más que
              cualquier teoría.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔗</span>
            <h4>Relaciona clima, suelo y vegetación</h4>
            <p>
              No estudies el bioma como una lista de características independientes. La clave
              es entender la cadena causal: el clima determina el suelo, el suelo determina
              la vegetación posible, y la vegetación determina la fauna. Esta lógica permite
              deducir características que no hayas memorizado.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🏔️</span>
            <h4>No olvides la zonación altitudinal</h4>
            <p>
              En montañas elevadas se reproducen los biomas en vertical: de los pies a la cima
              se pasa de mediterráneo a templado, taiga y tundra alpina. El Teide (Canarias)
              o el Kilimanjaro (Tanzania) son ejemplos clásicos de este fenómeno en el currículo
              de Bachillerato.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📊</span>
            <h4>Memoriza los datos clave de conservación</h4>
            <p>
              Para exámenes y oposiciones: el objetivo Kunming-Montreal es proteger el 30 % de
              la superficie terrestre para 2030. Solo tundra (22 %) lo supera actualmente.
              El mediterráneo (5 %) y el desierto (8 %) están muy por debajo. El bosque tropical
              pierde 10 M ha/año a escala global.
            </p>
          </div>
        </div>

        {/* ── 6. WARNING BOX ── */}
        <div className={styles.warningBoxEdu}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes al estudiar biomas</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Confundir bioma con clima:</strong> el bioma incluye el clima pero también
              el suelo, la vegetación y la fauna. Dos lugares con el mismo clima pueden tener
              ecosistemas distintos por su historia biogeográfica.
            </li>
            <li>
              <strong>Pensar que los desiertos son siempre calientes:</strong> la tundra ártica
              y la Antártica son técnicamente desiertos fríos (menos de 250 mm anuales). El
              frío extremo puede ser tan limitante para la vida como la aridez tropical.
            </li>
            <li>
              <strong>Asumir que la taiga es el bosque más grande:</strong> en superficie sí
              (17 M km²), pero el desierto como categoría amplia ocupa aún más (33 M km²
              incluyendo desiertos cálidos y fríos). La taiga es el bosque continuo más extenso.
            </li>
            <li>
              <strong>Ignorar los biomas de transición (ecotonos):</strong> entre la sabana y el
              tropical existe el bosque seco tropical; entre taiga y tundra, la zona de transición
              o ecotono forestal. Estos no son "mezclas" sino biomas con características propias.
            </li>
            <li>
              <strong>Suponer que más precipitación siempre significa más biodiversidad:</strong>
              la sabana es más seca que el templado pero tiene mayor diversidad de megafauna. La
              biodiversidad depende también de la estabilidad climática histórica, no solo de
              la lluvia actual.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-biomas-terrestres')} />
      <ShareCard appName="visualizador-biomas-terrestres" />
      <Footer appName="visualizador-biomas-terrestres" />
    </div>
  );
}
