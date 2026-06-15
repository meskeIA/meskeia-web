'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './EfectoInvernadero.module.css';
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

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'mecanismo' | 'gases' | 'natural-vs-exceso' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'mecanismo', titulo: 'El mecanismo', icono: '☀️', subtitulo: 'Cómo funciona paso a paso' },
  { id: 'gases', titulo: 'Los gases', icono: '🌡️', subtitulo: 'CO₂, metano, N₂O y vapor de agua' },
  { id: 'natural-vs-exceso', titulo: 'Natural vs exceso', icono: '⚖️', subtitulo: 'Del equilibrio al problema' },
  { id: 'datos', titulo: 'Datos y soluciones', icono: '📊', subtitulo: 'Acuerdos, cifras y salidas' },
];

// ─────────────────────────────────────────────
// Datos de los gases
// ─────────────────────────────────────────────

interface GasInvernadero {
  nombre: string;
  formula: string;
  icono: string;
  concentracion: string;
  gwp: number;
  gwpLabel: string;
  permanencia: string;
  fuentes: string;
  contribucion: number;
  color: string;
}

const GASES: GasInvernadero[] = [
  {
    nombre: 'Dióxido de carbono',
    formula: 'CO₂',
    icono: '🏭',
    concentracion: '~425 ppm (2024)',
    gwp: 1,
    gwpLabel: '1 (referencia)',
    permanencia: '300-1.000 años',
    fuentes: 'Combustibles fósiles, deforestación, cemento',
    contribucion: 76,
    color: '#EF4444',
  },
  {
    nombre: 'Metano',
    formula: 'CH₄',
    icono: '🐄',
    concentracion: '~1.925 ppb',
    gwp: 25,
    gwpLabel: '25× más potente que CO₂',
    permanencia: '~12 años',
    fuentes: 'Ganadería, arrozales, vertederos, gas natural',
    contribucion: 16,
    color: '#F59E0B',
  },
  {
    nombre: 'Óxido nitroso',
    formula: 'N₂O',
    icono: '🌾',
    concentracion: '~336 ppb',
    gwp: 298,
    gwpLabel: '298× más potente que CO₂',
    permanencia: '~114 años',
    fuentes: 'Fertilizantes, industria química, combustión',
    contribucion: 6,
    color: '#8B5CF6',
  },
  {
    nombre: 'Vapor de agua',
    formula: 'H₂O',
    icono: '💧',
    concentracion: 'Variable (0-4%)',
    gwp: 0,
    gwpLabel: 'Se autorregula',
    permanencia: '~9 días',
    fuentes: 'Evaporación natural (océanos, ríos, suelo)',
    contribucion: 0,
    color: '#3B82F6',
  },
];

// ─────────────────────────────────────────────
// Datos CO₂ histórico
// ─────────────────────────────────────────────

interface CO2Dato {
  anio: string;
  ppm: number;
  contexto: string;
}

const CO2_HISTORICO: CO2Dato[] = [
  { anio: '1750', ppm: 280, contexto: 'Preindustrial' },
  { anio: '1850', ppm: 285, contexto: 'Inicio era industrial' },
  { anio: '1900', ppm: 296, contexto: 'Revolución industrial' },
  { anio: '1950', ppm: 311, contexto: 'Posguerra' },
  { anio: '1980', ppm: 339, contexto: 'Primeras alertas' },
  { anio: '2000', ppm: 369, contexto: 'Protocolo de Kioto' },
  { anio: '2015', ppm: 400, contexto: 'Acuerdo de París' },
  { anio: '2024', ppm: 425, contexto: 'Actualidad' },
];

// ─────────────────────────────────────────────
// Datos fuentes antropogénicas
// ─────────────────────────────────────────────

interface FuenteEmision {
  nombre: string;
  porcentaje: number;
  icono: string;
  color: string;
}

const FUENTES_ANTROPOGENICAS: FuenteEmision[] = [
  { nombre: 'Combustibles fósiles', porcentaje: 73, icono: '⛽', color: '#EF4444' },
  { nombre: 'Agricultura', porcentaje: 12, icono: '🌾', color: '#22C55E' },
  { nombre: 'Industria', porcentaje: 6, icono: '🏭', color: '#F59E0B' },
  { nombre: 'Deforestación', porcentaje: 6, icono: '🌲', color: '#8B5CF6' },
  { nombre: 'Otros', porcentaje: 3, icono: '📦', color: '#6B7280' },
];

// ─────────────────────────────────────────────
// Datos escenarios
// ─────────────────────────────────────────────

interface Escenario {
  grados: string;
  titulo: string;
  color: string;
  colorDark: string;
  consecuencias: string[];
}

const ESCENARIOS: Escenario[] = [
  {
    grados: '+1,5°C',
    titulo: 'Objetivo ideal (París)',
    color: '#F59E0B',
    colorDark: '#D97706',
    consecuencias: [
      'Olas de calor más frecuentes (+50%)',
      'Nivel del mar +0,3 m',
      '70-90% del coral tropical muere',
      'Ártico sin hielo 1 vez cada 100 años',
    ],
  },
  {
    grados: '+2°C',
    titulo: 'Límite máximo (París)',
    color: '#EF4444',
    colorDark: '#DC2626',
    consecuencias: [
      'Olas de calor extremas x3',
      'Nivel del mar +0,5 m',
      '99% del coral tropical desaparece',
      'Ártico sin hielo 1 vez cada 10 años',
    ],
  },
  {
    grados: '+4°C',
    titulo: 'Escenario catastrófico',
    color: '#991B1B',
    colorDark: '#7F1D1D',
    consecuencias: [
      'Zonas tropicales inhabitables',
      'Nivel del mar +1 m o más',
      'Colapso de ecosistemas masivo',
      'Migraciones de cientos de millones',
    ],
  },
];

// ─────────────────────────────────────────────
// Datos comparativa países
// ─────────────────────────────────────────────

interface PaisHuella {
  pais: string;
  bandera: string;
  toneladas: number;
}

const HUELLA_PAISES: PaisHuella[] = [
  { pais: 'Qatar', bandera: '🇶🇦', toneladas: 37.0 },
  { pais: 'EE.UU.', bandera: '🇺🇸', toneladas: 14.4 },
  { pais: 'Alemania', bandera: '🇩🇪', toneladas: 8.1 },
  { pais: 'China', bandera: '🇨🇳', toneladas: 7.7 },
  { pais: 'España', bandera: '🇪🇸', toneladas: 6.0 },
  { pais: 'Media mundial', bandera: '🌍', toneladas: 4.7 },
  { pais: 'India', bandera: '🇮🇳', toneladas: 1.9 },
];

// ─────────────────────────────────────────────
// Sección 1: El mecanismo
// ─────────────────────────────────────────────

function SeccionMecanismo() {
  const [pasoActivo, setPasoActivo] = useState<number | null>(null);

  const pasos = [
    {
      num: 1,
      icono: '☀️',
      titulo: 'El Sol emite radiación',
      descripcion: 'El Sol envía energía en forma de luz visible y ultravioleta. Esta radiación de onda corta atraviesa la atmósfera con relativa facilidad.',
      colorFlecha: '#F59E0B',
    },
    {
      num: 2,
      icono: '🌍',
      titulo: 'La superficie absorbe',
      descripcion: 'La tierra, los océanos y la vegetación absorben la radiación solar y se calientan. La superficie terrestre absorbe aproximadamente el 49% de la energía solar entrante.',
      colorFlecha: '#22C55E',
    },
    {
      num: 3,
      icono: '🔴',
      titulo: 'Reemisión infrarroja',
      descripcion: 'La superficie caliente reemite energía como radiación infrarroja (calor), de onda larga. Esta radiación intenta escapar al espacio.',
      colorFlecha: '#EF4444',
    },
    {
      num: 4,
      icono: '🛡️',
      titulo: 'Los gases la atrapan',
      descripcion: 'CO₂, metano, N₂O y vapor de agua absorben parte del infrarrojo y lo reemiten en todas direcciones, incluyendo de vuelta hacia la superficie. Esto calienta la Tierra.',
      colorFlecha: '#8B5CF6',
    },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El efecto invernadero funciona como una manta térmica: deja pasar la luz del Sol (onda corta) pero atrapa el calor que la Tierra reemite (onda larga, infrarrojo). Sin él, la temperatura media sería <strong>-18°C</strong> en vez de <strong>+15°C</strong>.</p>
      </div>

      {/* Diagrama SVG grande */}
      <div className={styles.diagramaContainer}>
        <svg
          viewBox="0 0 600 400"
          className={styles.diagramaSvg}
          role="img"
          aria-label="Diagrama del efecto invernadero: el Sol emite radiación visible que atraviesa la atmósfera, la superficie la absorbe y reemite como infrarrojo, y los gases de efecto invernadero atrapan parte de esa radiación"
        >
          {/* Sol */}
          <circle cx="80" cy="50" r="35" fill="#F59E0B" opacity="0.9" />
          <text x="80" y="55" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">Sol</text>

          {/* Flechas solares (amarillas) — hacia la superficie */}
          <line x1="115" y1="70" x2="250" y2="210" stroke="#F59E0B" strokeWidth="3" strokeDasharray="8,4" />
          <line x1="115" y1="65" x2="300" y2="210" stroke="#F59E0B" strokeWidth="3" strokeDasharray="8,4" />
          <line x1="115" y1="60" x2="350" y2="210" stroke="#F59E0B" strokeWidth="3" strokeDasharray="8,4" />
          <polygon points="248,205 258,215 243,213" fill="#F59E0B" />
          <polygon points="298,205 308,215 293,213" fill="#F59E0B" />
          <polygon points="348,205 358,215 343,213" fill="#F59E0B" />

          {/* Etiqueta radiación solar */}
          <text x="140" y="120" fill="#F59E0B" fontSize="11" fontWeight="600" transform="rotate(-30, 140, 120)">Radiación visible</text>

          {/* Atmósfera (franja semitransparente) */}
          <rect x="0" y="150" width="600" height="70" fill="#3B82F6" opacity="0.08" rx="4" />
          <text x="540" y="190" textAnchor="end" fill="#3B82F6" fontSize="10" fontWeight="600" opacity="0.7">ATMÓSFERA</text>

          {/* Moléculas de gas en la atmósfera */}
          <circle cx="150" cy="175" r="8" fill="#EF4444" opacity="0.4" />
          <text x="150" y="178" textAnchor="middle" fill="#EF4444" fontSize="6" fontWeight="bold">CO₂</text>
          <circle cx="300" cy="165" r="8" fill="#F59E0B" opacity="0.4" />
          <text x="300" y="168" textAnchor="middle" fill="#92400E" fontSize="6" fontWeight="bold">CH₄</text>
          <circle cx="420" cy="180" r="8" fill="#3B82F6" opacity="0.4" />
          <text x="420" y="183" textAnchor="middle" fill="#1E40AF" fontSize="6" fontWeight="bold">H₂O</text>
          <circle cx="500" cy="170" r="8" fill="#8B5CF6" opacity="0.4" />
          <text x="500" y="173" textAnchor="middle" fill="#5B21B6" fontSize="6" fontWeight="bold">N₂O</text>

          {/* Superficie terrestre */}
          <rect x="0" y="280" width="600" height="120" fill="#22C55E" opacity="0.15" rx="4" />
          <rect x="0" y="280" width="600" height="6" fill="#22C55E" opacity="0.4" rx="2" />
          <text x="300" y="320" textAnchor="middle" fill="#166534" fontSize="13" fontWeight="600">Superficie terrestre</text>
          <text x="300" y="340" textAnchor="middle" fill="#166534" fontSize="10" opacity="0.7">Absorbe radiación solar y se calienta</text>

          {/* Flechas infrarrojas (rojas) — desde superficie hacia arriba */}
          <line x1="200" y1="278" x2="200" y2="175" stroke="#EF4444" strokeWidth="3" />
          <polygon points="195,178 205,178 200,165" fill="#EF4444" />
          <line x1="350" y1="278" x2="350" y2="175" stroke="#EF4444" strokeWidth="3" />
          <polygon points="345,178 355,178 350,165" fill="#EF4444" />
          <line x1="480" y1="278" x2="480" y2="175" stroke="#EF4444" strokeWidth="3" />
          <polygon points="475,178 485,178 480,165" fill="#EF4444" />

          {/* Etiqueta infrarrojo */}
          <text x="210" y="250" fill="#EF4444" fontSize="11" fontWeight="600">Infrarrojo ↑</text>

          {/* Flechas atrapadas — reemitidas hacia abajo */}
          <line x1="170" y1="185" x2="170" y2="270" stroke="#EF4444" strokeWidth="2" strokeDasharray="5,3" opacity="0.7" />
          <polygon points="165,267 175,267 170,278" fill="#EF4444" opacity="0.7" />
          <line x1="370" y1="185" x2="370" y2="270" stroke="#EF4444" strokeWidth="2" strokeDasharray="5,3" opacity="0.7" />
          <polygon points="365,267 375,267 370,278" fill="#EF4444" opacity="0.7" />

          {/* Etiqueta reemisión */}
          <text x="400" y="245" fill="#EF4444" fontSize="10" fontWeight="600" opacity="0.7">↓ Reemitido</text>

          {/* Algo escapa al espacio */}
          <line x1="200" y1="155" x2="200" y2="30" stroke="#EF4444" strokeWidth="2" opacity="0.4" />
          <polygon points="195,35 205,35 200,22" fill="#EF4444" opacity="0.4" />
          <line x1="480" y1="155" x2="480" y2="30" stroke="#EF4444" strokeWidth="2" opacity="0.4" />
          <polygon points="475,35 485,35 480,22" fill="#EF4444" opacity="0.4" />
          <text x="340" y="25" textAnchor="middle" fill="#EF4444" fontSize="10" opacity="0.5">Parte escapa al espacio</text>

          {/* Leyenda */}
          <rect x="10" y="365" width="12" height="12" fill="#F59E0B" rx="2" />
          <text x="28" y="376" fill="#666" fontSize="10">Radiación solar (onda corta)</text>
          <rect x="220" y="365" width="12" height="12" fill="#EF4444" rx="2" />
          <text x="238" y="376" fill="#666" fontSize="10">Radiación infrarroja (onda larga)</text>
          <rect x="440" y="365" width="12" height="12" fill="#EF4444" rx="2" opacity="0.4" />
          <text x="458" y="376" fill="#666" fontSize="10">Escapa al espacio</text>
        </svg>
      </div>

      {/* Cards clickables del proceso */}
      <h3 className={styles.subtituloSeccion}>El proceso paso a paso</h3>
      <div className={styles.pasosGrid}>
        {pasos.map((p) => (
          <button
            key={p.num}
            type="button"
            className={`${styles.pasoCard} ${pasoActivo === p.num ? styles.pasoActivo : ''}`}
            onClick={() => setPasoActivo(pasoActivo === p.num ? null : p.num)}
            aria-expanded={pasoActivo === p.num}
          >
            <div className={styles.pasoNumero} style={{ background: p.colorFlecha }}>{p.num}</div>
            <span className={styles.pasoIcono} aria-hidden="true">{p.icono}</span>
            <h4 className={styles.pasoTitulo}>{p.titulo}</h4>
            {pasoActivo === p.num && (
              <p className={styles.pasoDesc}>{p.descripcion}</p>
            )}
            {pasoActivo !== p.num && (
              <p className={styles.pasoHint}>Toca para ver detalle</p>
            )}
          </button>
        ))}
      </div>

      {/* Comparación con/sin efecto invernadero */}
      <div className={styles.tempComparacion}>
        <div className={styles.tempCard}>
          <span className={styles.tempIcono} aria-hidden="true">❄️</span>
          <span className={styles.tempValor} style={{ color: '#3B82F6' }}>-18°C</span>
          <span className={styles.tempLabel}>Sin efecto invernadero</span>
          <span className={styles.tempDetalle}>Tierra congelada, sin vida</span>
        </div>
        <div className={styles.tempFlecha}>
          <span>Gases invernadero</span>
          <span className={styles.tempFlechaIcono} aria-hidden="true">+33°C</span>
        </div>
        <div className={styles.tempCard}>
          <span className={styles.tempIcono} aria-hidden="true">🌍</span>
          <span className={styles.tempValor} style={{ color: '#22C55E' }}>+15°C</span>
          <span className={styles.tempLabel}>Con efecto natural</span>
          <span className={styles.tempDetalle}>Habitable y equilibrado</span>
        </div>
        <div className={styles.tempFlecha}>
          <span>Exceso antropogénico</span>
          <span className={styles.tempFlechaIcono} style={{ color: '#EF4444' }} aria-hidden="true">↑</span>
        </div>
        <div className={styles.tempCard}>
          <span className={styles.tempIcono} aria-hidden="true">🔥</span>
          <span className={styles.tempValor} style={{ color: '#EF4444' }}>+1,2°C</span>
          <span className={styles.tempLabel}>Calentamiento actual</span>
          <span className={styles.tempDetalle}>Y subiendo</span>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          La clave es entender que el efecto invernadero es <strong>necesario</strong>: sin él no existiría la vida. El problema no es el mecanismo en sí, sino la cantidad extra de gases que hemos añadido en 200 años, engrosando la &ldquo;manta térmica&rdquo; más rápido de lo que el planeta puede adaptarse.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Los gases
// ─────────────────────────────────────────────

function SeccionGases() {
  const [gasActivo, setGasActivo] = useState<number | null>(null);
  const maxGWP = 298;

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>No todos los gases de efecto invernadero son iguales. Cada uno tiene una <strong>potencia</strong> (GWP), una <strong>permanencia</strong> en la atmósfera y unas <strong>fuentes</strong> distintas. El CO₂ domina por cantidad, pero el metano es 25 veces más potente molécula a molécula.</p>
      </div>

      {/* Cards de gases */}
      <div className={styles.gasesGrid}>
        {GASES.map((g, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.gasCard} ${gasActivo === i ? styles.gasActivo : ''}`}
            style={{ borderTopColor: g.color }}
            onClick={() => setGasActivo(gasActivo === i ? null : i)}
            aria-expanded={gasActivo === i}
          >
            <div className={styles.gasHeader}>
              <span className={styles.gasIcono} aria-hidden="true">{g.icono}</span>
              <div>
                <h3 className={styles.gasNombre}>{g.nombre}</h3>
                <span className={styles.gasFormula} style={{ color: g.color }}>{g.formula}</span>
              </div>
            </div>
            {gasActivo === i ? (
              <div className={styles.gasDetalle}>
                <div className={styles.gasInfo}>
                  <span className={styles.gasInfoLabel}>Concentración:</span>
                  <span className={styles.gasInfoValor}>{g.concentracion}</span>
                </div>
                <div className={styles.gasInfo}>
                  <span className={styles.gasInfoLabel}>GWP (potencia):</span>
                  <span className={styles.gasInfoValor}>{g.gwpLabel}</span>
                </div>
                <div className={styles.gasInfo}>
                  <span className={styles.gasInfoLabel}>Permanencia:</span>
                  <span className={styles.gasInfoValor}>{g.permanencia}</span>
                </div>
                <div className={styles.gasInfo}>
                  <span className={styles.gasInfoLabel}>Fuentes:</span>
                  <span className={styles.gasInfoValor}>{g.fuentes}</span>
                </div>
              </div>
            ) : (
              <p className={styles.pasoHint}>Toca para ver detalles</p>
            )}
          </button>
        ))}
      </div>

      {/* GWP comparativo */}
      <div className={styles.gwpCard}>
        <h3 className={styles.gwpTitulo}>GWP: Potencial de Calentamiento Global</h3>
        <p className={styles.gwpSubtitulo}>Cuánto calienta cada gas respecto al CO₂ (en 100 años)</p>
        <div className={styles.gwpBarras}>
          {GASES.filter(g => g.gwp > 0).map((g, i) => (
            <div key={i} className={styles.gwpBarraItem}>
              <span className={styles.gwpBarraLabel}>{g.formula}</span>
              <div className={styles.gwpBarraContainer}>
                <div
                  className={styles.gwpBarra}
                  style={{
                    width: `${Math.max((g.gwp / maxGWP) * 100, 2)}%`,
                    background: g.color,
                  }}
                />
              </div>
              <span className={styles.gwpBarraValor} style={{ color: g.color }}>{g.gwp}×</span>
            </div>
          ))}
        </div>
        <p className={styles.gwpNota}>El N₂O es 298 veces más potente que el CO₂, pero hay mucho menos en la atmósfera</p>
      </div>

      {/* Contribución porcentual */}
      <div className={styles.contribucionCard}>
        <h3 className={styles.contribucionTitulo}>Contribución al efecto invernadero antropogénico</h3>
        <p className={styles.contribucionSubtitulo}>Porcentaje de cada gas en el total de emisiones humanas</p>
        <div className={styles.contribucionBarras}>
          {GASES.filter(g => g.contribucion > 0).map((g, i) => (
            <div key={i} className={styles.contribucionItem}>
              <div className={styles.contribucionHeader}>
                <span>{g.formula}</span>
                <span className={styles.contribucionPct}>{g.contribucion}%</span>
              </div>
              <div className={styles.contribucionBarraContainer}>
                <div
                  className={styles.contribucionBarra}
                  style={{
                    width: `${g.contribucion}%`,
                    background: g.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className={styles.contribucionNota}>
          <span aria-hidden="true">💧</span> El vapor de agua no se incluye: es el gas invernadero más abundante, pero su concentración se <strong>autorregula</strong> con la temperatura (más calor → más evaporación → más vapor → más calor: bucle de retroalimentación).
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          El CO₂ es el principal objetivo de reducción porque es el que más contribuye y permanece siglos en la atmósfera. Pero reducir el metano (ganadería, vertederos, fugas de gas) tendría un efecto <strong>rápido</strong> gracias a su corta vida: solo 12 años frente a los siglos del CO₂.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Natural vs exceso
// ─────────────────────────────────────────────

function SeccionNaturalVsExceso() {
  const maxPpm = Math.max(...CO2_HISTORICO.map(d => d.ppm));

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Sin el efecto invernadero natural, <strong>la vida en la Tierra no existiría</strong>. El problema no es el mecanismo, sino el exceso: hemos aumentado el CO₂ un 52% en solo 270 años (de 280 a 425 ppm), algo que en ciclos naturales tarda decenas de miles de años.</p>
      </div>

      {/* Gráfico temporal CO₂ */}
      <div className={styles.co2Card}>
        <h3 className={styles.co2Titulo}>CO₂ atmosférico: de 280 a 425 ppm</h3>
        <p className={styles.co2Subtitulo}>En {formatNumber(800000, 0)} años de registros de hielo, el CO₂ nunca superó 300 ppm. Hasta ahora.</p>
        <div className={styles.co2Barras}>
          {CO2_HISTORICO.map((d, i) => (
            <div key={i} className={styles.co2BarraItem}>
              <span className={styles.co2BarraValor}>{formatNumber(d.ppm, 0)}</span>
              <div className={styles.co2BarraContainer}>
                <div
                  className={styles.co2Barra}
                  style={{
                    height: `${(d.ppm / maxPpm) * 100}%`,
                    background: d.ppm > 370 ? '#EF4444' : d.ppm > 310 ? '#F59E0B' : '#22C55E',
                  }}
                />
              </div>
              <span className={styles.co2BarraAnio}>{d.anio}</span>
              <span className={styles.co2BarraContexto}>{d.contexto}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Fuentes antropogénicas */}
      <div className={styles.fuentesCard}>
        <h3 className={styles.fuentesTitulo}>Fuentes de emisión antropogénica</h3>
        <p className={styles.fuentesSubtitulo}>De dónde vienen los gases de efecto invernadero extra</p>
        <div className={styles.fuentesBarras}>
          {FUENTES_ANTROPOGENICAS.map((f, i) => (
            <div key={i} className={styles.fuenteItem}>
              <div className={styles.fuenteHeader}>
                <span aria-hidden="true">{f.icono}</span>
                <span className={styles.fuenteNombre}>{f.nombre}</span>
                <span className={styles.fuentePct} style={{ color: f.color }}>{f.porcentaje}%</span>
              </div>
              <div className={styles.fuenteBarraContainer}>
                <div
                  className={styles.fuenteBarra}
                  style={{ width: `${f.porcentaje}%`, background: f.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Escenarios de calentamiento */}
      <h3 className={styles.subtituloSeccion}>Escenarios de calentamiento</h3>
      <div className={styles.escenariosGrid}>
        {ESCENARIOS.map((esc, i) => (
          <div
            key={i}
            className={styles.escenarioCard}
            style={{ borderTopColor: esc.color }}
          >
            <span className={styles.escenarioGrados} style={{ color: esc.color }}>{esc.grados}</span>
            <h4 className={styles.escenarioTitulo}>{esc.titulo}</h4>
            <ul className={styles.escenarioLista}>
              {esc.consecuencias.map((c, j) => (
                <li key={j}>{c}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          La diferencia entre +1,5°C y +2°C parece mínima, pero significa un mundo con el 70% del coral muerto frente a un mundo con el 99% muerto. Cada décima de grado importa. La velocidad del cambio es lo que hace imposible que los ecosistemas se adapten.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Datos y soluciones
// ─────────────────────────────────────────────

function SeccionDatos() {
  const maxToneladas = Math.max(...HUELLA_PAISES.map(p => p.toneladas));

  const feedbackLoops = [
    {
      icono: '🧊',
      titulo: 'Albedo del hielo',
      descripcion: 'El hielo refleja el 80% de la radiación. Al derretirse, el agua oscura absorbe más calor → más deshielo → más absorción.',
    },
    {
      icono: '🌿',
      titulo: 'Permafrost',
      descripcion: 'El suelo congelado del Ártico contiene el doble de CO₂ que toda la atmósfera. Al calentarse, se libera metano y CO₂.',
    },
    {
      icono: '💧',
      titulo: 'Vapor de agua',
      descripcion: 'Más calor → más evaporación → más vapor (gas invernadero) → más calor. Es el amplificador más potente.',
    },
  ];

  const soluciones = [
    { icono: '⚡', titulo: 'Energías renovables', descripcion: 'Solar y eólica ya son más baratas que los combustibles fósiles en la mayoría de países.' },
    { icono: '🏠', titulo: 'Eficiencia energética', descripcion: 'Edificios, transporte e industria pueden reducir un 40% su consumo con tecnología actual.' },
    { icono: '🌳', titulo: 'Reforestación', descripcion: 'Los bosques absorben ~2.600 millones de toneladas de CO₂ al año. Reforestar amplifica esto.' },
    { icono: '🔬', titulo: 'Captura de carbono', descripcion: 'Tecnologías que extraen CO₂ directamente del aire. Aún caras, pero mejorando rápidamente.' },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El Acuerdo de París (2015) fijó el objetivo de limitar el calentamiento a <strong>+1,5°C</strong> (máximo +2°C). Para lograrlo, las emisiones globales deben reducirse a la mitad antes de 2030 y llegar a cero neto antes de 2050.</p>
      </div>

      {/* Huella de carbono por países */}
      <div className={styles.huellaCard}>
        <h3 className={styles.huellaTitulo}>Huella de carbono per cápita</h3>
        <p className={styles.huellaSubtitulo}>Toneladas de CO₂ equivalente por persona y año</p>
        <div className={styles.huellaBarras}>
          {HUELLA_PAISES.map((p, i) => (
            <div key={i} className={`${styles.huellaItem} ${p.pais === 'España' ? styles.huellaDestacado : ''}`}>
              <div className={styles.huellaItemHeader}>
                <span aria-hidden="true">{p.bandera}</span>
                <span className={styles.huellaItemPais}>{p.pais}</span>
                <span className={styles.huellaItemValor}>{formatNumber(p.toneladas, 1)} t</span>
              </div>
              <div className={styles.huellaBarraContainer}>
                <div
                  className={styles.huellaBarra}
                  style={{
                    width: `${(p.toneladas / maxToneladas) * 100}%`,
                    background: p.pais === 'España' ? 'var(--primary)' : p.toneladas > 10 ? '#EF4444' : p.toneladas > 5 ? '#F59E0B' : '#22C55E',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className={styles.huellaNota}>La media en España es ~{formatNumber(6, 0)} t CO₂/año por persona. El objetivo sostenible es ~2 t/año.</p>
      </div>

      {/* Curva Keeling */}
      <div className={styles.keelingCard}>
        <h3 className={styles.keelingTitulo}>Curva de Keeling (Mauna Loa, Hawái)</h3>
        <p className={styles.keelingDesc}>
          Desde 1958, el observatorio de Mauna Loa registra ininterrumpidamente el CO₂ atmosférico. La curva muestra un ascenso continuo con oscilaciones estacionales (las plantas del hemisferio norte absorben CO₂ en verano). Es la prueba más directa del aumento.
        </p>
        <div className={styles.keelingDatos}>
          <div className={styles.keelingDato}>
            <span className={styles.keelingDatoValor}>315 ppm</span>
            <span className={styles.keelingDatoLabel}>1958 (inicio medición)</span>
          </div>
          <div className={styles.keelingFlecha} aria-hidden="true">→</div>
          <div className={styles.keelingDato}>
            <span className={styles.keelingDatoValor} style={{ color: '#EF4444' }}>425 ppm</span>
            <span className={styles.keelingDatoLabel}>2024 (actual)</span>
          </div>
          <div className={styles.keelingDato}>
            <span className={styles.keelingDatoValor} style={{ color: '#EF4444' }}>+35%</span>
            <span className={styles.keelingDatoLabel}>en 66 años</span>
          </div>
        </div>
      </div>

      {/* Feedback loops */}
      <h3 className={styles.subtituloSeccion}>Bucles de retroalimentación</h3>
      <p className={styles.feedbackIntro}>Procesos que se amplifican a sí mismos, acelerando el calentamiento</p>
      <div className={styles.feedbackGrid}>
        {feedbackLoops.map((f, i) => (
          <div key={i} className={styles.feedbackCard}>
            <span className={styles.feedbackIcono} aria-hidden="true">{f.icono}</span>
            <h4 className={styles.feedbackTitulo}>{f.titulo}</h4>
            <p className={styles.feedbackDesc}>{f.descripcion}</p>
          </div>
        ))}
      </div>

      {/* Soluciones */}
      <h3 className={styles.subtituloSeccion}>Soluciones</h3>
      <div className={styles.solucionesGrid}>
        {soluciones.map((s, i) => (
          <div key={i} className={styles.solucionCard}>
            <span className={styles.solucionIcono} aria-hidden="true">{s.icono}</span>
            <h4 className={styles.solucionTitulo}>{s.titulo}</h4>
            <p className={styles.solucionDesc}>{s.descripcion}</p>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          La buena noticia: ya tenemos las tecnologías necesarias. La solar ha bajado un 89% de precio desde 2010. Lo que falta es <strong>velocidad de implementación</strong> y voluntad política. Cada año de retraso hace el problema más caro y difícil de resolver.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorEfectoInvernaderoPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('mecanismo');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'mecanismo': return <SeccionMecanismo />;
      case 'gases': return <SeccionGases />;
      case 'natural-vs-exceso': return <SeccionNaturalVsExceso />;
      case 'datos': return <SeccionDatos />;
    }
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>El Efecto Invernadero</h1>
          <p className={styles.subtitle}>El mecanismo que hace habitable la Tierra — y qué pasa cuando se desequilibra</p>
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
            <span aria-hidden="true">{SECCIONES.find(s => s.id === seccionActiva)?.icono}</span>{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Más sobre el efecto invernadero"
          subtitle="Preguntas frecuentes y conceptos clave"
          defaultOpen={false}
        >
          <h3>¿El efecto invernadero es malo?</h3>
          <p>
            No. El efecto invernadero <strong>natural</strong> es esencial para la vida: sin él, la Tierra estaría a -18°C.
            Lo que es perjudicial es el <strong>efecto invernadero intensificado</strong> por las emisiones humanas de CO₂,
            metano y otros gases desde la revolución industrial. Es la diferencia entre una manta que te abriga y tres mantas
            encima en pleno agosto.
          </p>

          <h3>¿El vapor de agua no es el gas invernadero más importante?</h3>
          <p>
            El vapor de agua es, efectivamente, el gas invernadero más abundante y responsable de la mayor parte del efecto
            natural. Pero su concentración se <strong>autorregula</strong>: depende de la temperatura (más calor → más
            evaporación). No podemos añadirlo directamente a la atmósfera de forma duradera. En cambio, al añadir CO₂,
            calentamos el planeta, lo que genera más vapor de agua y amplifica el calentamiento. El CO₂ es el
            &ldquo;termostato&rdquo;; el vapor de agua es el &ldquo;amplificador&rdquo;.
          </p>

          <h3>¿Cuánto CO₂ es &ldquo;normal&rdquo;?</h3>
          <p>
            Durante los últimos {formatNumber(800000, 0)} años, el CO₂ osciló entre 180 ppm (glaciaciones) y 280 ppm
            (periodos cálidos). Nunca superó 300 ppm. En 2024 estamos en ~425 ppm, un nivel no visto en al menos
            3 millones de años. Y sigue subiendo ~2,5 ppm/año.
          </p>

          <h3>¿Qué es la Curva de Keeling?</h3>
          <p>
            Es el registro continuo de CO₂ atmosférico medido desde 1958 en el observatorio de Mauna Loa (Hawái),
            iniciado por Charles David Keeling. Muestra un ascenso ininterrumpido con un patrón de &ldquo;dientes de sierra&rdquo;
            (las estaciones: los bosques del hemisferio norte absorben CO₂ en verano y lo liberan en invierno).
            Es la prueba más directa y visual del aumento de CO₂ causado por los humanos.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> los datos de este explicador provienen del consenso científico internacional (IPCC AR6, 2021-2023),
            la NOAA (Curva de Keeling) y la Agencia Internacional de Energía (emisiones por sector). Los escenarios de calentamiento
            son proyecciones basadas en modelos climáticos. Las cifras de GWP corresponden al horizonte de 100 años (GWP-100).
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-efecto-invernadero')} />
        <ShareCard appName="visualizador-efecto-invernadero" />
        <Footer appName="visualizador-efecto-invernadero" />
    </div>
  );
}
