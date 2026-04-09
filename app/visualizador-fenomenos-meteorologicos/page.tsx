'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './FenomenosMeteorologicos.module.css';
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
// Tipos y datos
// ─────────────────────────────────────────────

type Seccion = 'nubes' | 'precipitaciones' | 'extremos' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'nubes', titulo: 'Tipos de Nubes', icono: '\u2601\uFE0F', subtitulo: 'Clasificacion por altitud y forma — que anuncia cada nube' },
  { id: 'precipitaciones', titulo: 'Precipitaciones', icono: '\uD83C\uDF27\uFE0F', subtitulo: 'Como se forma la lluvia, la nieve, el granizo y la niebla' },
  { id: 'extremos', titulo: 'Fenomenos Extremos', icono: '\u26A1', subtitulo: 'Rayos, huracanes, tornados y DANA — la fuerza de la atmosfera' },
  { id: 'datos', titulo: 'Datos y Curiosidades', icono: '\uD83D\uDCA1', subtitulo: 'Cifras fascinantes sobre el tiempo y el clima' },
];

// ── Nubes ──

type NivelAltitud = 'alta' | 'media' | 'baja' | 'vertical';

interface TipoNube {
  nombre: string;
  nivel: NivelAltitud;
  altitudKm: string;
  forma: string;
  tiempo: string;
  descripcion: string;
  icono: string;
  svgY: number;
}

const NUBES: TipoNube[] = [
  { nombre: 'Cirrus', nivel: 'alta', altitudKm: '6-13', forma: 'Rizos finos', tiempo: 'Buen tiempo (puede anunciar cambio)', descripcion: 'Filamentos de cristales de hielo a gran altitud. Parecen pinceladas blancas en el cielo.', icono: '\uD83C\uDF2C\uFE0F', svgY: 40 },
  { nombre: 'Cirrocumulus', nivel: 'alta', altitudKm: '6-12', forma: 'Cielo empedrado', tiempo: 'Buen tiempo, posible cambio', descripcion: 'Pequenas bolitas blancas formando un patron regular. El clasico cielo empedrado o aborregado.', icono: '\u2601\uFE0F', svgY: 60 },
  { nombre: 'Cirrostratus', nivel: 'alta', altitudKm: '6-12', forma: 'Velo transparente', tiempo: 'Lluvia en 12-24h (halo solar/lunar)', descripcion: 'Capa fina y uniforme que cubre todo el cielo. Produce halos alrededor del Sol o la Luna.', icono: '\uD83C\uDF19', svgY: 80 },
  { nombre: 'Altocumulus', nivel: 'media', altitudKm: '2-6', forma: 'Bolas de algodon', tiempo: 'Estable, posible tormenta vespertina', descripcion: 'Masas redondeadas en grupo, como bolas de algodon gris-blanco. Tipicas de mananas de verano.', icono: '\u2601\uFE0F', svgY: 140 },
  { nombre: 'Altostratus', nivel: 'media', altitudKm: '2-6', forma: 'Velo gris uniforme', tiempo: 'Lluvia proxima', descripcion: 'Capa gris que cubre el cielo y difumina el sol sin eliminarlo del todo. Anuncia lluvia.', icono: '\uD83C\uDF25\uFE0F', svgY: 165 },
  { nombre: 'Stratus', nivel: 'baja', altitudKm: '0-2', forma: 'Capa uniforme baja', tiempo: 'Llovizna o cielo gris', descripcion: 'Niebla elevada. Capa gris continua y uniforme. Produce llovizna fina.', icono: '\uD83C\uDF2B\uFE0F', svgY: 240 },
  { nombre: 'Stratocumulus', nivel: 'baja', altitudKm: '0-2', forma: 'Capas con ondulaciones', tiempo: 'Cielo gris con claros, sin lluvia fuerte', descripcion: 'Masas grises y blancas con huecos. La nube mas comun del planeta.', icono: '\u2601\uFE0F', svgY: 220 },
  { nombre: 'Nimbostratus', nivel: 'baja', altitudKm: '0-4', forma: 'Capa oscura y densa', tiempo: 'Lluvia o nieve continua', descripcion: 'Capa espesa y oscura que cubre todo el cielo. Produce precipitacion continua y persistente.', icono: '\uD83C\uDF27\uFE0F', svgY: 260 },
  { nombre: 'Cumulus', nivel: 'vertical', altitudKm: '0.5-6', forma: 'Montones algodonosos', tiempo: 'Buen tiempo (si pequenos)', descripcion: 'Las tipicas nubes blancas con forma de coliflor. Si crecen mucho, pueden dar tormenta.', icono: '\u2601\uFE0F', svgY: 180 },
  { nombre: 'Cumulonimbus', nivel: 'vertical', altitudKm: '0.5-15', forma: 'Torre con yunque', tiempo: 'Tormentas, granizo, rayos', descripcion: 'El "rey de las nubes". Torre gigante que puede alcanzar 15 km. Produce tormentas, rayos y granizo.', icono: '\u26C8\uFE0F', svgY: 130 },
];

const NIVELES_COLOR: Record<NivelAltitud, string> = {
  alta: '#7FB3D3',
  media: '#2E86AB',
  baja: '#48A9A6',
  vertical: '#E67E22',
};

const NIVELES_NOMBRE: Record<NivelAltitud, string> = {
  alta: 'Alta (>6 km)',
  media: 'Media (2-6 km)',
  baja: 'Baja (<2 km)',
  vertical: 'Desarrollo vertical',
};

// ── Precipitaciones ──

interface TipoPrecipitacion {
  nombre: string;
  icono: string;
  proceso: string[];
  datosClave: string;
  color: string;
}

const PRECIPITACIONES: TipoPrecipitacion[] = [
  {
    nombre: 'Lluvia',
    icono: '\uD83C\uDF27\uFE0F',
    proceso: [
      'El sol calienta el agua de oceanos, rios y lagos \u2192 evaporacion',
      'El vapor asciende y se enfria \u2192 se condensa alrededor de particulas (polvo, sal, polen)',
      'Las gotas microscipicas crecen al chocar entre si dentro de la nube',
      'Cuando pesan lo suficiente (gravedad > flotacion) \u2192 caen como lluvia',
    ],
    datosClave: 'Las gotas miden 0,5-5 mm. Una gota tipica cae a unos 20 km/h y tarda ~2 minutos en llegar al suelo desde 500 m.',
    color: '#3498db',
  },
  {
    nombre: 'Nieve',
    icono: '\u2744\uFE0F',
    proceso: [
      'El vapor de agua se cristaliza directamente en hielo a temperaturas bajo 0 grados C',
      'Los cristales crecen formando estructuras hexagonales (por la estructura molecular del hielo)',
      'Se agrupan en copos al chocar entre si durante la caida',
      'Cada copo es unico: su forma depende de la temperatura y humedad exactas durante su formacion',
    ],
    datosClave: 'Un copo de nieve puede tener hasta 200 cristales individuales. La temperatura ideal para copos grandes es entre -10 y -15 grados C.',
    color: '#85c1e9',
  },
  {
    nombre: 'Granizo',
    icono: '\uD83E\uDDCA',
    proceso: [
      'Solo se forma dentro de cumulonimbus con fuertes corrientes ascendentes',
      'Una gota de lluvia es lanzada hacia arriba por la corriente \u2192 se congela al subir',
      'Cae de nuevo, recoge mas agua \u2192 sube otra vez \u2192 nueva capa de hielo',
      'El ciclo se repite (como una cebolla de hielo) hasta que pesa demasiado para subir de nuevo',
    ],
    datosClave: 'El granizo mas grande registrado: 20 cm de diametro (Dakota del Sur, 2010). El mas pesado: 1,02 kg (Bangladesh, 1986). Puede caer a mas de 150 km/h.',
    color: '#bdc3c7',
  },
  {
    nombre: 'Niebla',
    icono: '\uD83C\uDF2B\uFE0F',
    proceso: [
      'Es literalmente una nube a nivel del suelo',
      'Se forma cuando el aire se enfria por debajo de su punto de rocio',
      'El vapor se condensa en diminutas gotas suspendidas cerca del suelo',
      'Tipos principales: niebla de radiacion (noches claras) y niebla de adveccion (aire calido sobre superficie fria)',
    ],
    datosClave: 'La visibilidad se reduce a menos de 1 km. En San Francisco, la niebla puede reducir la temperatura 10 grados C en minutos.',
    color: '#95a5a6',
  },
];

// ── Fenomenos extremos ──

interface FenomenoExtremo {
  nombre: string;
  icono: string;
  descripcionCorta: string;
  detalle: string;
  datos: string[];
  color: string;
}

const FENOMENOS_EXTREMOS: FenomenoExtremo[] = [
  {
    nombre: 'Rayos',
    icono: '\u26A1',
    descripcionCorta: '300 millones de voltios en 0,3 segundos',
    detalle: 'Dentro de un cumulonimbus, las particulas de hielo chocan y separan cargas electricas: positivas arriba, negativas abajo. Cuando la diferencia de potencial es suficiente, un lider escalonado (invisible) baja hacia el suelo. Al conectar, una descarga de retorno sube a un tercio de la velocidad de la luz, generando el destello visible.',
    datos: [
      'Temperatura del rayo: 30.000 grados C (5 veces la superficie del Sol)',
      'Duracion del destello: ~0,3 segundos',
      'El trueno: el aire se expande a velocidad supersonica por el calentamiento instantaneo',
      'Caen ~100 rayos por segundo en la Tierra (~8 millones al dia)',
    ],
    color: '#f1c40f',
  },
  {
    nombre: 'Huracanes',
    icono: '\uD83C\uDF00',
    descripcionCorta: 'Motor termico alimentado por oceanos calidos',
    detalle: 'Nacen sobre oceanos con temperatura superior a 26 grados C. El agua calida evapora masivamente, el aire caliente asciende en espiral y el efecto Coriolis (rotacion terrestre) hace girar el sistema. Se forma un ojo central de calma rodeado por la pared del ojo, donde estan los vientos mas fuertes.',
    datos: [
      'Categorias Saffir-Simpson: 1 (119-153 km/h) a 5 (>252 km/h)',
      'El ojo del huracan: zona de calma de 30-65 km de diametro',
      'Un huracan libera la energia de 10.000 bombas nucleares al dia (en calor)',
      'Temporada atlantica: junio-noviembre. Pico: agosto-octubre',
    ],
    color: '#e74c3c',
  },
  {
    nombre: 'Tornados',
    icono: '\uD83C\uDF2A\uFE0F',
    descripcionCorta: 'Columna de aire a mas de 400 km/h',
    detalle: 'Se forman cuando corrientes de aire calido y humedo chocan con aire frio y seco, creando una rotacion horizontal que las corrientes ascendentes inclinan hasta hacerla vertical. La columna de aire rotando (mesociclon) se estrecha y acelera, formando el embudo visible al succionar polvo y escombros.',
    datos: [
      'Escala Fujita mejorada: EF0 (105-137 km/h) a EF5 (>322 km/h)',
      'Un EF5 puede arrancar edificios de sus cimientos',
      'Duran entre segundos y mas de una hora (media: ~10 minutos)',
      'Tornado Alley (EE.UU.): la zona con mas tornados del mundo (~1.200/ano)',
    ],
    color: '#8e44ad',
  },
  {
    nombre: 'DANA / Gota Fria',
    icono: '\uD83C\uDF0A',
    descripcionCorta: 'Lluvias torrenciales sobre el Mediterraneo',
    detalle: 'DANA (Depresion Aislada en Niveles Altos): una masa de aire muy frio queda aislada en altura sobre el Mediterraneo, cuyas aguas estan calidas (>24 grados C). El contraste termico genera inestabilidad extrema. El aire calido y humedo asciende violentamente, produciendo lluvias torrenciales que pueden descargar en horas lo que normalmente cae en meses.',
    datos: [
      'En Espana afecta especialmente a Levante, Murcia, Andalucia y Baleares',
      'Temporada principal: septiembre-octubre (mar calido + primeras masas frias)',
      'Puede descargar mas de 300 litros/m2 en 24 horas (media anual de Madrid: ~440 litros/m2)',
      'La DANA de 2024 en Valencia: una de las mas destructivas de la historia reciente',
    ],
    color: '#2980b9',
  },
];

// ── Datos y curiosidades ──

interface DatoCurioso {
  icono: string;
  texto: string;
  categoria: string;
}

const DATOS_CURIOSOS: DatoCurioso[] = [
  { icono: '\u2601\uFE0F', texto: 'Una nube cumulus tipica pesa unas 500 toneladas de agua, pero repartida en gotitas tan pequenas (0,01 mm) que flotan en el aire.', categoria: 'Nubes' },
  { icono: '\u26A1', texto: 'Caen unos 100 rayos por segundo en todo el planeta — unos 8 millones al dia. Ahora mismo estan cayendo unos 1.800.', categoria: 'Rayos' },
  { icono: '\u23F1\uFE0F', texto: 'Un rayo visible dura solo 0,3 segundos, pero su temperatura alcanza 30.000 grados C — cinco veces la superficie del Sol.', categoria: 'Rayos' },
  { icono: '\uD83E\uDDCA', texto: 'El granizo mas grande jamas registrado peso 1,02 kg (Bangladesh, 1986). En diametro, el record es de 20 cm (Dakota del Sur, 2010).', categoria: 'Granizo' },
  { icono: '\uD83C\uDF21\uFE0F', texto: 'Meteorologia (del griego meteoros = alto en el cielo) estudia el tiempo a corto plazo (dias). Climatologia estudia patrones a largo plazo (decadas).', categoria: 'Conceptos' },
  { icono: '\uD83D\uDCCF', texto: 'Instrumentos clave: barometro (presion), anemometro (viento), pluviometro (lluvia), higrometro (humedad) y radar Doppler (precipitacion en movimiento).', categoria: 'Instrumentos' },
  { icono: '\uD83C\uDDEA\uD83C\uDDF8', texto: 'Espana tiene 4 tipos de clima: mediterraneo (la mayoria), atlantico (norte), continental (meseta interior) y subtropical (Canarias).', categoria: 'Espana' },
  { icono: '\uD83C\uDF0D', texto: 'El lugar mas lluvioso del mundo: Mawsynram, India (11.871 mm/ano). El mas seco: desierto de Atacama, Chile (menos de 1 mm/ano en algunas zonas).', categoria: 'Records' },
  { icono: '\uD83C\uDF2A\uFE0F', texto: 'El viento mas rapido registrado en un tornado: 484 km/h (Oklahoma, 1999). En superficie, el record es de 408 km/h en el monte Washington (1934).', categoria: 'Viento' },
  { icono: '\u2744\uFE0F', texto: 'No existen dos copos de nieve iguales. Cada uno tiene una estructura hexagonal unica determinada por las condiciones exactas de temperatura y humedad durante su formacion.', categoria: 'Nieve' },
];

// ─────────────────────────────────────────────
// Seccion 1: Tipos de Nubes
// ─────────────────────────────────────────────

function SeccionNubes() {
  const [nubeIdx, setNubeIdx] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Las nubes se clasifican por <strong>altitud</strong> (altas, medias, bajas) y <strong>forma</strong>: los <em>estratos</em> son capas, los <em>cumulos</em> son montones, los <em>cirros</em> son rizos de hielo y los <em>nimbos</em> traen lluvia. Conocer las nubes te permite predecir el tiempo con solo mirar al cielo.</p>
      </div>

      {/* Diagrama SVG de altitudes */}
      <div className={styles.diagramaContainer}>
        <svg className={styles.diagramaSvg} viewBox="0 0 800 320" aria-label="Diagrama de tipos de nubes clasificados por altitud">
          {/* Fondo degradado de cielo */}
          <defs>
            <linearGradient id="cieloGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a237e" />
              <stop offset="30%" stopColor="#42a5f5" />
              <stop offset="70%" stopColor="#81d4fa" />
              <stop offset="100%" stopColor="#e0f7fa" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="800" height="320" fill="url(#cieloGrad)" />

          {/* Lineas de altitud */}
          <line x1="0" y1="95" x2="800" y2="95" stroke="white" strokeOpacity="0.3" strokeDasharray="8,4" />
          <line x1="0" y1="195" x2="800" y2="195" stroke="white" strokeOpacity="0.3" strokeDasharray="8,4" />
          <line x1="0" y1="280" x2="800" y2="280" stroke="white" strokeOpacity="0.2" strokeDasharray="4,4" />

          {/* Etiquetas de altitud */}
          <text x="10" y="35" fontSize="11" fill="white" opacity="0.7" fontWeight="600">Altas &gt;6 km</text>
          <text x="10" y="140" fontSize="11" fill="white" opacity="0.7" fontWeight="600">Medias 2-6 km</text>
          <text x="10" y="235" fontSize="11" fill="white" opacity="0.7" fontWeight="600">Bajas &lt;2 km</text>
          <text x="10" y="300" fontSize="11" fill="white" opacity="0.5" fontWeight="600">Suelo</text>

          {/* Nubes altas — Cirrus */}
          <g opacity="0.9">
            <path d="M180,42 Q200,38 220,42 Q230,36 250,40" fill="none" stroke="white" strokeWidth="2" />
            <path d="M200,48 Q220,44 240,48" fill="none" stroke="white" strokeWidth="1.5" />
            <text x="215" y="58" fontSize="10" fill="white" fontWeight="600" textAnchor="middle">Cirrus</text>
          </g>

          {/* Cirrocumulus */}
          <g opacity="0.9">
            {[370,385,400,415,430].map(x => (
              <circle key={x} cx={x} cy={55} r={6} fill="white" fillOpacity="0.85" />
            ))}
            {[378,393,408,423].map(x => (
              <circle key={x} cx={x} cy={66} r={5} fill="white" fillOpacity="0.8" />
            ))}
            <text x="400" y="82" fontSize="10" fill="white" fontWeight="600" textAnchor="middle">Cirrocumulus</text>
          </g>

          {/* Cirrostratus */}
          <g opacity="0.7">
            <rect x="530" y="50" width="200" height="18" rx="9" fill="white" fillOpacity="0.35" />
            <circle cx="630" cy="38" r="12" fill="#f1c40f" opacity="0.6" />
            <circle cx="630" cy="38" r="18" fill="none" stroke="white" strokeWidth="1" opacity="0.4" />
            <text x="630" y="82" fontSize="10" fill="white" fontWeight="600" textAnchor="middle">Cirrostratus</text>
          </g>

          {/* Nubes medias — Altocumulus */}
          <g opacity="0.9">
            <ellipse cx="220" cy="138" rx="25" ry="12" fill="white" fillOpacity="0.9" />
            <ellipse cx="260" cy="135" rx="22" ry="10" fill="white" fillOpacity="0.85" />
            <ellipse cx="195" cy="142" rx="18" ry="9" fill="white" fillOpacity="0.8" />
            <text x="225" y="162" fontSize="10" fill="white" fontWeight="600" textAnchor="middle">Altocumulus</text>
          </g>

          {/* Altostratus */}
          <g opacity="0.75">
            <rect x="400" y="148" width="250" height="22" rx="11" fill="#bdc3c7" fillOpacity="0.7" />
            <text x="525" y="185" fontSize="10" fill="white" fontWeight="600" textAnchor="middle">Altostratus</text>
          </g>

          {/* Nubes bajas — Stratocumulus */}
          <g opacity="0.9">
            <ellipse cx="160" cy="218" rx="35" ry="14" fill="#bdc3c7" fillOpacity="0.85" />
            <ellipse cx="210" cy="215" rx="30" ry="12" fill="#ccc" fillOpacity="0.8" />
            <ellipse cx="130" cy="222" rx="25" ry="10" fill="#bdc3c7" fillOpacity="0.75" />
            <text x="170" y="242" fontSize="10" fill="white" fontWeight="600" textAnchor="middle">Stratocumulus</text>
          </g>

          {/* Stratus */}
          <g opacity="0.7">
            <rect x="280" y="238" width="180" height="16" rx="8" fill="#aaa" fillOpacity="0.6" />
            <text x="370" y="266" fontSize="10" fill="white" fontWeight="600" textAnchor="middle">Stratus</text>
          </g>

          {/* Nimbostratus */}
          <g opacity="0.85">
            <rect x="510" y="228" width="160" height="30" rx="10" fill="#7f8c8d" fillOpacity="0.8" />
            {/* Gotas de lluvia */}
            <line x1="540" y1="260" x2="538" y2="275" stroke="#3498db" strokeWidth="1.5" opacity="0.7" />
            <line x1="570" y1="262" x2="568" y2="277" stroke="#3498db" strokeWidth="1.5" opacity="0.7" />
            <line x1="600" y1="258" x2="598" y2="273" stroke="#3498db" strokeWidth="1.5" opacity="0.7" />
            <line x1="630" y1="261" x2="628" y2="276" stroke="#3498db" strokeWidth="1.5" opacity="0.7" />
            <text x="590" y="295" fontSize="10" fill="white" fontWeight="600" textAnchor="middle">Nimbostratus</text>
          </g>

          {/* Desarrollo vertical — Cumulus */}
          <g opacity="0.95">
            <ellipse cx="700" cy="200" rx="30" ry="20" fill="white" />
            <ellipse cx="720" cy="190" rx="22" ry="16" fill="white" />
            <ellipse cx="685" cy="195" rx="18" ry="14" fill="white" />
            <ellipse cx="700" cy="212" rx="32" ry="10" fill="#f0f0f0" />
            <text x="700" y="234" fontSize="10" fill="white" fontWeight="600" textAnchor="middle">Cumulus</text>
          </g>

          {/* Cumulonimbus — torre gigante */}
          <g opacity="0.95">
            <rect x="50" y="95" width="60" height="185" rx="15" fill="#555" fillOpacity="0.7" />
            <ellipse cx="80" cy="100" rx="50" ry="18" fill="#777" fillOpacity="0.8" />
            <ellipse cx="80" cy="90" rx="35" ry="14" fill="#999" fillOpacity="0.7" />
            {/* Yunque */}
            <rect x="30" y="78" width="100" height="12" rx="6" fill="#888" fillOpacity="0.6" />
            {/* Rayo */}
            <polyline points="75,260 70,272 80,272 72,290" fill="none" stroke="#f1c40f" strokeWidth="2" />
            <text x="80" y="310" fontSize="10" fill="white" fontWeight="600" textAnchor="middle">Cumulonimbus</text>
          </g>

          {/* Superficie terrestre */}
          <rect x="0" y="280" width="800" height="40" fill="#4a7c59" opacity="0.3" />
        </svg>
      </div>

      {/* Leyenda de niveles */}
      <div className={styles.nivelesLeyenda}>
        {(['alta', 'media', 'baja', 'vertical'] as NivelAltitud[]).map(nivel => (
          <div key={nivel} className={styles.nivelTag} style={{ borderColor: NIVELES_COLOR[nivel] }}>
            <span className={styles.nivelDot} style={{ background: NIVELES_COLOR[nivel] }} />
            <span>{NIVELES_NOMBRE[nivel]}</span>
          </div>
        ))}
      </div>

      {/* Grid de nubes clickables */}
      <div className={styles.nubesGrid}>
        {NUBES.map((n, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.nubeCard} ${nubeIdx === i ? styles.nubeActiva : ''}`}
            onClick={() => setNubeIdx(nubeIdx === i ? null : i)}
            aria-pressed={nubeIdx === i}
            style={{ borderLeftColor: NIVELES_COLOR[n.nivel] }}
          >
            <span className={styles.nubeCardIcono} aria-hidden="true">{n.icono}</span>
            <div>
              <span className={styles.nubeCardNombre}>{n.nombre}</span>
              <span className={styles.nubeCardAltitud}>{n.altitudKm} km</span>
            </div>
          </button>
        ))}
      </div>

      {nubeIdx !== null && (
        <div className={styles.nubeDetalle} role="alert" aria-live="polite">
          <div className={styles.nubeDetalleHeader}>
            <span className={styles.nubeDetalleIcono} aria-hidden="true">{NUBES[nubeIdx].icono}</span>
            <div>
              <strong>{NUBES[nubeIdx].nombre}</strong>
              <span className={styles.nubeNivelBadge} style={{ background: NIVELES_COLOR[NUBES[nubeIdx].nivel] }}>
                {NIVELES_NOMBRE[NUBES[nubeIdx].nivel]}
              </span>
            </div>
          </div>
          <p>{NUBES[nubeIdx].descripcion}</p>
          <p><strong>Forma:</strong> {NUBES[nubeIdx].forma}</p>
          <p><strong>Anuncia:</strong> {NUBES[nubeIdx].tiempo}</p>
        </div>
      )}

      <div className={styles.insight}>
        <p>
          <strong>Truco para recordar:</strong> los prefijos te dicen la altitud (<em>cirro-</em> = alta, <em>alto-</em> = media) y los sufijos la forma (<em>-stratus</em> = capa, <em>-cumulus</em> = monton, <em>-nimbus</em> = lluvia). Asi, <em>cumulonimbus</em> = monton con lluvia, <em>cirrostratus</em> = capa alta.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Seccion 2: Precipitaciones
// ─────────────────────────────────────────────

function SeccionPrecipitaciones() {
  const [precipIdx, setPrecipIdx] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Toda precipitacion comienza igual: el vapor de agua asciende, se enfria y se condensa. Lo que cambia es la <strong>temperatura</strong> y las <strong>condiciones</strong> dentro de la nube, que determinan si cae lluvia, nieve, granizo o se forma niebla.</p>
      </div>

      <div className={styles.precipGrid}>
        {PRECIPITACIONES.map((p, i) => (
          <div key={i} className={styles.precipCard}>
            <button
              type="button"
              className={styles.precipHeader}
              onClick={() => setPrecipIdx(precipIdx === i ? null : i)}
              aria-expanded={precipIdx === i}
              style={{ borderLeftColor: p.color }}
            >
              <span className={styles.precipIcono} aria-hidden="true">{p.icono}</span>
              <span className={styles.precipNombre}>{p.nombre}</span>
              <span className={styles.precipToggle} aria-hidden="true">{precipIdx === i ? '\u25B2' : '\u25BC'}</span>
            </button>

            {precipIdx === i && (
              <div className={styles.precipDetalle}>
                <div className={styles.procesoLista}>
                  {p.proceso.map((paso, j) => (
                    <div key={j} className={styles.pasoItem}>
                      <span className={styles.pasoNumero}>{j + 1}</span>
                      <span className={styles.pasoTexto}>{paso}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.precipDato}>
                  <strong>Datos clave:</strong> {p.datosClave}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          La clave de toda precipitacion es el <strong>nucleo de condensacion</strong>: una particula microscopica (polvo, sal marina, polen) sobre la que el vapor se condensa. Sin estas particulas, el aire podria estar supersaturado de humedad y aun asi no formarse gotas. Por eso tras erupciones volcanicas aumentan las lluvias.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Seccion 3: Fenomenos Extremos
// ─────────────────────────────────────────────

function SeccionExtremos() {
  const [abiertoIdx, setAbiertoIdx] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La atmosfera es un motor termico gigante. Cuando la energia acumulada se libera de golpe, se producen los fenomenos mas espectaculares y destructivos del planeta.</p>
      </div>

      <div className={styles.extremosLista}>
        {FENOMENOS_EXTREMOS.map((f, i) => (
          <div key={i} className={styles.extremoCard}>
            <button
              type="button"
              className={styles.extremoHeader}
              onClick={() => setAbiertoIdx(abiertoIdx === i ? null : i)}
              aria-expanded={abiertoIdx === i}
            >
              <span className={styles.extremoIcono} aria-hidden="true">{f.icono}</span>
              <div className={styles.extremoTitulo}>
                <strong>{f.nombre}</strong>
                <span className={styles.extremoCorta}>{f.descripcionCorta}</span>
              </div>
              <span className={styles.extremoToggle} aria-hidden="true">{abiertoIdx === i ? '\u25B2' : '\u25BC'}</span>
            </button>

            {abiertoIdx === i && (
              <div className={styles.extremoDetalle}>
                <p className={styles.extremeExplicacion}>{f.detalle}</p>
                <div className={styles.extremoDatos}>
                  {f.datos.map((d, j) => (
                    <div key={j} className={styles.extremoDatoItem}>
                      <span className={styles.extremoDatoBullet} style={{ background: f.color }} />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          Todos estos fenomenos comparten una raiz comun: <strong>diferencias de temperatura</strong>. Los rayos nacen del choque de particulas frias y calientes. Los huracanes se alimentan del calor oceanico. Los tornados surgen del choque de masas de aire. La DANA es aire frio sobre mar calido. La atmosfera busca constantemente el equilibrio, y estos fenomenos son su manera de conseguirlo.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Seccion 4: Datos y Curiosidades
// ─────────────────────────────────────────────

function SeccionDatos() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Cifras que cambian tu perspectiva sobre lo que ocurre cada dia sobre nuestras cabezas. La atmosfera es mas espectacular de lo que parece a simple vista.</p>
      </div>

      <div className={styles.datosGrid}>
        {DATOS_CURIOSOS.map((d, i) => (
          <div key={i} className={styles.datoCard}>
            <span className={styles.datoIcono} aria-hidden="true">{d.icono}</span>
            <div>
              <span className={styles.datoCategoria}>{d.categoria}</span>
              <span className={styles.datoTexto}>{d.texto}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Escalas comparativas */}
      <div className={styles.comparativaCard}>
        <h3 className={styles.comparativaTitulo}>
          <span aria-hidden="true">{'\uD83C\uDF21\uFE0F'}</span> Escala de temperaturas atmosfericas
        </h3>
        <div className={styles.escalaItems}>
          {[
            { label: 'Niebla densa', valor: '~0 grados C', pct: 12 },
            { label: 'Interior de nube', valor: '-10 a -40 grados C', pct: 25 },
            { label: 'Cirrus (cristales de hielo)', valor: '-40 a -60 grados C', pct: 35 },
            { label: 'Superficie del Sol', valor: formatNumber(5500, 0) + ' grados C', pct: 65 },
            { label: 'Canal de un rayo', valor: formatNumber(30000, 0) + ' grados C', pct: 100 },
          ].map((item, i) => (
            <div key={i} className={styles.escalaItem}>
              <div className={styles.escalaInfo}>
                <span className={styles.escalaLabel}>{item.label}</span>
                <span className={styles.escalaValor}>{item.valor}</span>
              </div>
              <div className={styles.barraContainer}>
                <div className={styles.barraTemp} style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.climaCard}>
        <div className={styles.climaTitulo}>
          <span aria-hidden="true">{'\uD83C\uDDEA\uD83C\uDDF8'}</span> Climas de Espana
        </div>
        <p className={styles.climaTexto}>
          Espana tiene una diversidad climatica excepcional para su tamano: <strong>mediterraneo</strong> (centro y este: veranos secos y calurosos, inviernos suaves), <strong>atlantico</strong> (norte: lluvias frecuentes todo el ano), <strong>continental</strong> (meseta interior: grandes contrastes verano/invierno) y <strong>subtropical</strong> (Canarias: temperaturas estables todo el ano). Esta variedad explica por que Espana es especialmente vulnerable a fenomenos como la DANA.
        </p>
      </div>

      <div className={styles.insight}>
        <p>
          La meteorologia moderna puede predecir el tiempo con razonable precision hasta <strong>7-10 dias</strong> vista gracias a superordenadores que procesan millones de observaciones. Pero la atmosfera es un sistema caotico: pequenas variaciones pueden generar resultados muy distintos. Es lo que Edward Lorenz llamo el <strong>efecto mariposa</strong>.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorFenomenosMeteorologicosPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('nubes');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'nubes': return <SeccionNubes />;
      case 'precipitaciones': return <SeccionPrecipitaciones />;
      case 'extremos': return <SeccionExtremos />;
      case 'datos': return <SeccionDatos />;
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
          <h1 className={styles.title}>Fenomenos Meteorologicos</h1>
          <p className={styles.subtitle}>Nubes, precipitaciones, rayos y tormentas — lo que el cielo te cuenta</p>
        </header>

        <LegalNotice />

        {/* Navegacion */}
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

        {/* Cabecera seccion */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            {SECCIONES.find(s => s.id === seccionActiva)?.icono}{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Meteorologia basica"
          subtitle="Conceptos clave sobre el tiempo atmosferico y los fenomenos meteorologicos"
          defaultOpen={false}
        >
          <h3>La atmosfera como motor termico</h3>
          <p>
            La atmosfera terrestre es una capa de gases de unos 100 km de espesor (aunque el 99%
            de su masa esta en los primeros 30 km). El Sol calienta la superficie de forma desigual:
            mas en el ecuador que en los polos, mas sobre tierra que sobre mar. Estas diferencias de
            temperatura generan movimientos de aire (viento) y cambios de presion que producen todos
            los fenomenos meteorologicos.
          </p>

          <h3>Nubes: el semaforo del cielo</h3>
          <p>
            Las nubes son indicadores naturales del tiempo. Aprender a leerlas es la forma mas
            antigua de prevision meteorologica. La regla general es: cuanto mas oscura y vertical
            es una nube, mas probable es que traiga precipitacion intensa. Las nubes altas y finas
            (cirros) suelen indicar buen tiempo, aunque un velo de cirrostratus con halo solar
            puede anunciar lluvia en 12-24 horas.
          </p>

          <h3>El punto de rocio</h3>
          <p>
            El punto de rocio es la temperatura a la que el aire se satura de vapor y empieza a
            condensar. Cuando la temperatura del aire baja hasta el punto de rocio, se forman nubes
            (en altura) o niebla (a nivel del suelo). Es el concepto clave para entender toda la
            formacion de nubes y precipitaciones.
          </p>

          <h3>Fuentes y metodologia</h3>
          <p>
            Los datos de este explicador provienen de la AEMET (Agencia Estatal de Meteorologia),
            la NOAA (National Oceanic and Atmospheric Administration), la OMM (Organizacion Meteorologica
            Mundial) y el Atlas Internacional de Nubes. Las escalas Saffir-Simpson y Fujita son
            las referencias estandar para huracanes y tornados respectivamente.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador tiene fines educativos. Los datos sobre fenomenos
            extremos son valores tipicos o records historicos. Las condiciones meteorologicas reales
            varian segun la region, la estacion y multiples factores locales. Fuentes: AEMET, NOAA,
            OMM, Atlas Internacional de Nubes.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-fenomenos-meteorologicos')} />
        <ShareCard appName="visualizador-fenomenos-meteorologicos" />
        <Footer appName="visualizador-fenomenos-meteorologicos" />
      </div>
    </>
  );
}
