'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './Termodinamica.module.css';
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

type Seccion = 'formas' | 'conductividad' | 'conveccion' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'formas', titulo: 'Las 3 Formas', icono: '🔥', subtitulo: 'Conducción, convección y radiación' },
  { id: 'conductividad', titulo: 'Conductividad', icono: '🧊', subtitulo: 'Por qué el metal se siente frío' },
  { id: 'conveccion', titulo: 'En la Naturaleza', icono: '🌊', subtitulo: 'Convección a escala planetaria' },
  { id: 'datos', titulo: 'Datos Fascinantes', icono: '💡', subtitulo: 'Curiosidades de la termodinámica' },
];

// ─────────────────────────────────────────────
// Datos: 3 Formas de transferir calor
// ─────────────────────────────────────────────

type TipoTransferencia = 'conduccion' | 'conveccion' | 'radiacion';

interface FormaCalor {
  id: TipoTransferencia;
  nombre: string;
  icono: string;
  descripcionCorta: string;
  mecanismo: string;
  necesitaMateria: boolean;
  velocidad: string;
  ejemplo: string;
  ejemplos: string[];
  color: string;
}

const FORMAS: FormaCalor[] = [
  {
    id: 'conduccion',
    nombre: 'Conducción',
    icono: '🍳',
    descripcionCorta: 'Calor por contacto directo, molécula a molécula',
    mecanismo: 'Las moléculas del extremo caliente vibran más rápido y transmiten esa vibración a sus vecinas, como fichas de dominó energéticas. No hay movimiento neto de materia.',
    necesitaMateria: true,
    velocidad: 'Depende del material (rápida en metales, lenta en aislantes)',
    ejemplo: 'Una cuchara metálica en sopa caliente se calienta por el mango',
    ejemplos: ['Cuchara en sopa caliente', 'Sartén en el fuego', 'Caminar descalzo sobre arena caliente', 'Hielo enfriando una bebida'],
    color: '#EF4444',
  },
  {
    id: 'conveccion',
    nombre: 'Convección',
    icono: '🌬️',
    descripcionCorta: 'Calor por movimiento de fluido (líquido o gas)',
    mecanismo: 'El fluido caliente se expande, pierde densidad y sube. El fluido frío, más denso, baja a ocupar su lugar. Se forman corrientes circulares que transportan calor.',
    necesitaMateria: true,
    velocidad: 'Media — depende de la diferencia de temperatura y viscosidad',
    ejemplo: 'Un radiador calienta una habitación: el aire caliente sube y el frío baja',
    ejemplos: ['Radiador calentando habitación', 'Agua hirviendo en una olla', 'Brisa marina día/noche', 'Corrientes de lava'],
    color: '#3B82F6',
  },
  {
    id: 'radiacion',
    nombre: 'Radiación',
    icono: '☀️',
    descripcionCorta: 'Calor por ondas electromagnéticas, sin necesitar materia',
    mecanismo: 'Todo cuerpo a temperatura superior a 0 K emite radiación electromagnética (infrarroja). Estas ondas viajan a la velocidad de la luz y no necesitan ningún medio material.',
    necesitaMateria: false,
    velocidad: 'Velocidad de la luz — 300.000 km/s',
    ejemplo: 'El Sol calienta la Tierra a través de 150 millones de km de vacío',
    ejemplos: ['El Sol calentando la Tierra', 'Brasas de una hoguera', 'Lámpara infrarroja', 'Calor de un horno al abrir la puerta'],
    color: '#F59E0B',
  },
];

// ─────────────────────────────────────────────
// Datos: Conductividad térmica
// ─────────────────────────────────────────────

interface MaterialConductividad {
  nombre: string;
  conductividad: number; // W/m·K
  icono: string;
  nota: string;
  color: string;
}

const MATERIALES: MaterialConductividad[] = [
  { nombre: 'Diamante', conductividad: 2200, icono: '💎', nota: '¡El mejor conductor natural!', color: '#60A5FA' },
  { nombre: 'Cobre', conductividad: 401, icono: '🟤', nota: 'Por eso se usa en cables y sartenes', color: '#B45309' },
  { nombre: 'Aluminio', conductividad: 237, icono: '🪙', nota: 'Ligero y buen conductor', color: '#94A3B8' },
  { nombre: 'Hierro', conductividad: 80, icono: '⚙️', nota: '5x peor que el cobre', color: '#64748B' },
  { nombre: 'Agua', conductividad: 0.6, icono: '💧', nota: 'Mal conductor, buen almacén de calor', color: '#3B82F6' },
  { nombre: 'Madera', conductividad: 0.15, icono: '🪵', nota: 'Por eso no quema tocar un mango de madera', color: '#A16207' },
  { nombre: 'Aire (quieto)', conductividad: 0.025, icono: '🌬️', nota: 'Clave del aislamiento: atrapar aire', color: '#93C5FD' },
  { nombre: 'Aerogel', conductividad: 0.013, icono: '🧪', nota: 'El mejor aislante artificial', color: '#C4B5FD' },
];

// ─────────────────────────────────────────────
// Datos: Convección en la naturaleza
// ─────────────────────────────────────────────

interface EjemploConveccion {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
  detalle: string;
  color: string;
}

const EJEMPLOS_CONVECCION: EjemploConveccion[] = [
  {
    id: 'brisa',
    nombre: 'Brisa Marina',
    icono: '🏖️',
    descripcion: 'De día la tierra se calienta más que el mar → aire sube sobre tierra → entra brisa fresca del mar. De noche se invierte.',
    detalle: 'La tierra tiene menor capacidad calorífica que el agua: se calienta y enfría más rápido. Esto crea diferencias de presión que generan vientos costeros predecibles. Los pescadores lo saben desde hace milenios.',
    color: '#0EA5E9',
  },
  {
    id: 'oceanicas',
    nombre: 'Corrientes Oceánicas',
    icono: '🌊',
    descripcion: 'El agua fría polar se hunde (más densa) y fluye por el fondo del océano → circulación termohalina global.',
    detalle: 'La corriente del Golfo transporta calor del Caribe a Europa, haciendo que Londres (51°N) sea habitable mientras que Labrador (misma latitud) es gélido. Un ciclo completo tarda ~1.000 años.',
    color: '#2563EB',
  },
  {
    id: 'manto',
    nombre: 'Manto Terrestre',
    icono: '🌋',
    descripcion: 'La convección del magma en el manto mueve las placas tectónicas a ~2 cm/año.',
    detalle: 'El núcleo terrestre a ~5.000°C calienta el manto inferior. La roca caliente (menos densa) asciende lentamente, se enfría en la superficie y vuelve a hundirse. Este ciclo es el motor de la tectónica de placas, terremotos y volcanes.',
    color: '#DC2626',
  },
  {
    id: 'meteorologia',
    nombre: 'Meteorología',
    icono: '⛅',
    descripcion: 'Aire caliente sube → se enfría → vapor se condensa → nubes → lluvia.',
    detalle: 'El aire caliente del suelo asciende, se expande (menor presión a mayor altitud) y se enfría. Al enfriarse, el vapor de agua se condensa en gotas diminutas formando nubes. Si las gotas crecen lo suficiente, caen como lluvia. Todo el ciclo del agua depende de la convección.',
    color: '#6366F1',
  },
];

// ─────────────────────────────────────────────
// Datos: Curiosidades
// ─────────────────────────────────────────────

interface DatoCurioso {
  icono: string;
  titulo: string;
  descripcion: string;
}

const DATOS_CURIOSOS: DatoCurioso[] = [
  { icono: '🌡️', titulo: 'El cero absoluto: -273,15 °C (0 K)', descripcion: 'Las partículas dejarían de moverse (teóricamente). Nunca se ha alcanzado, pero se ha llegado a millonésimas de grado.' },
  { icono: '🍳', titulo: 'Cobre vs hierro: 5x más rápido', descripcion: 'Una sartén de cobre calienta 5 veces más rápido que una de hierro por su conductividad térmica (401 vs 80 W/m·K).' },
  { icono: '🧊', titulo: 'Los iglúes son aislantes', descripcion: 'El hielo conduce mal el calor (2,2 W/m·K) y el aire atrapado en la nieve aún peor. Dentro de un iglú puede haber 15-20 °C más que fuera.' },
  { icono: '☕', titulo: 'El termo combate las 3 formas', descripcion: 'Vacío entre paredes (elimina conducción y convección), superficies reflectantes (reduce radiación). Un diseño genial de 1892.' },
  { icono: '🌍', titulo: 'Sin efecto invernadero: -18 °C', descripcion: 'La atmósfera atrapa radiación infrarroja. Sin este efecto, la temperatura media de la Tierra sería -18 °C en vez de +15 °C.' },
  { icono: '🐧', titulo: 'Pingüinos: ingeniería térmica', descripcion: 'Se apiñan para reducir superficie expuesta, perdiendo menos calor por radiación y convección. Los del centro rotan con los del borde.' },
  { icono: '🔥', titulo: 'Color de llama = temperatura', descripcion: 'Rojo ~800 °C, naranja ~1.100 °C, amarillo ~1.200 °C, azul ~1.400 °C. La radiación emitida cambia de color con la temperatura.' },
];

// ─────────────────────────────────────────────
// Sección 1: Las 3 Formas
// ─────────────────────────────────────────────

function AnimacionConduccion() {
  const particulas = Array.from({ length: 10 }, (_, i) => i);
  return (
    <div className={styles.animacionContainer}>
      <div className={styles.barraConduccion}>
        {particulas.map(i => (
          <div
            key={i}
            className={styles.particula}
            style={{
              animationDuration: `${0.15 + i * 0.08}s`,
              opacity: 1 - i * 0.06,
              background: `hsl(${10 + i * 10}, 90%, ${50 + i * 2}%)`,
            }}
          />
        ))}
      </div>
      <div className={styles.animacionLabels}>
        <span className={styles.animLabelCaliente}>🔥 Caliente</span>
        <span className={styles.animLabelFrio}>❄️ Frío</span>
      </div>
    </div>
  );
}

function AnimacionConveccion() {
  return (
    <div className={styles.animacionContainer}>
      <div className={styles.recipienteConveccion}>
        <div className={styles.corrienteIzq}>
          <span className={styles.flechaAbajo}>↓</span>
          <span className={styles.flechaAbajo}>↓</span>
        </div>
        <div className={styles.corrienteCentro}>
          <span className={styles.flechaArriba}>↑</span>
          <span className={styles.flechaArriba}>↑</span>
        </div>
        <div className={styles.corrienteDer}>
          <span className={styles.flechaAbajo}>↓</span>
          <span className={styles.flechaAbajo}>↓</span>
        </div>
        <div className={styles.fuenteCalor}>🔥</div>
      </div>
    </div>
  );
}

function AnimacionRadiacion() {
  return (
    <div className={styles.animacionContainer}>
      <div className={styles.radiacionContainer}>
        <div className={styles.fuenteRadiacion}>☀️</div>
        <div className={styles.onda} style={{ animationDelay: '0s' }} />
        <div className={styles.onda} style={{ animationDelay: '0.6s' }} />
        <div className={styles.onda} style={{ animationDelay: '1.2s' }} />
      </div>
      <p className={styles.animNota}>No necesita materia — viaja por el vacío</p>
    </div>
  );
}

function SeccionFormas() {
  const [tipoActivo, setTipoActivo] = useState<TipoTransferencia>('conduccion');
  const forma = FORMAS.find(f => f.id === tipoActivo)!;

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El calor siempre fluye de lo caliente a lo frío. Hay exactamente <strong>3 mecanismos</strong> para que eso ocurra.</p>
      </div>

      {/* 3 cards seleccionables */}
      <div className={styles.formasGrid}>
        {FORMAS.map(f => (
          <button
            key={f.id}
            type="button"
            className={`${styles.formaCard} ${tipoActivo === f.id ? styles.formaCardActiva : ''}`}
            onClick={() => setTipoActivo(f.id)}
            aria-pressed={tipoActivo === f.id}
            style={{ borderColor: tipoActivo === f.id ? f.color : undefined }}
          >
            <span className={styles.formaIcono} aria-hidden="true">{f.icono}</span>
            <span className={styles.formaNombre} style={{ color: tipoActivo === f.id ? f.color : undefined }}>{f.nombre}</span>
            <span className={styles.formaDesc}>{f.descripcionCorta}</span>
          </button>
        ))}
      </div>

      {/* Animación */}
      <div className={styles.animacionPanel}>
        {tipoActivo === 'conduccion' && <AnimacionConduccion />}
        {tipoActivo === 'conveccion' && <AnimacionConveccion />}
        {tipoActivo === 'radiacion' && <AnimacionRadiacion />}
      </div>

      {/* Panel de detalles */}
      <div className={styles.detallePanel} style={{ borderLeftColor: forma.color }}>
        <h3 className={styles.detalleTitulo} style={{ color: forma.color }}>
          {forma.icono} {forma.nombre}
        </h3>

        <div className={styles.detalleGrid}>
          <div className={styles.detalleItem}>
            <span className={styles.detalleLabel}>Mecanismo</span>
            <span className={styles.detalleValor}>{forma.mecanismo}</span>
          </div>
          <div className={styles.detalleItem}>
            <span className={styles.detalleLabel}>¿Necesita materia?</span>
            <span className={styles.detalleValor}>{forma.necesitaMateria ? 'Sí — necesita un medio material' : 'No — viaja por el vacío'}</span>
          </div>
          <div className={styles.detalleItem}>
            <span className={styles.detalleLabel}>Velocidad</span>
            <span className={styles.detalleValor}>{forma.velocidad}</span>
          </div>
          <div className={styles.detalleItem}>
            <span className={styles.detalleLabel}>Ejemplo cotidiano</span>
            <span className={styles.detalleValor}>{forma.ejemplo}</span>
          </div>
        </div>

        <div className={styles.ejemplosBadges}>
          {forma.ejemplos.map((e, i) => (
            <span key={i} className={styles.ejemploBadge} style={{ borderColor: forma.color }}>{e}</span>
          ))}
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          El Sol calienta la Tierra por <strong>radiación</strong> — los 150 millones de km de vacío no son problema.
          Las ondas electromagnéticas no necesitan materia para viajar.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Conductividad Térmica
// ─────────────────────────────────────────────

function SeccionConductividad() {
  const maxCond = Math.max(...MATERIALES.map(m => m.conductividad));

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p><strong>¿Por qué el metal se siente frío y la madera no?</strong> Ambos están a la misma temperatura (~20 °C).
        El metal conduce calor rápido → roba calor de tu mano rápido → se siente frío.
        La madera conduce mal → no roba calor → se siente templada.</p>
      </div>

      {/* Tabla de conductividad */}
      <div className={styles.conductividadContainer}>
        <h3 className={styles.conductividadTitulo}>Conductividad térmica (W/m·K)</h3>
        <div className={styles.conductividadLista}>
          {MATERIALES.map((m, i) => {
            // Escala logarítmica para visualización
            const logMax = Math.log10(maxCond);
            const logVal = Math.log10(m.conductividad);
            const porcentaje = (logVal / logMax) * 100;
            return (
              <div key={i} className={styles.conductividadItem}>
                <div className={styles.conductividadInfo}>
                  <span className={styles.conductividadIcono} aria-hidden="true">{m.icono}</span>
                  <span className={styles.conductividadNombre}>{m.nombre}</span>
                </div>
                <div className={styles.conductividadBarraContainer}>
                  <div
                    className={styles.conductividadBarra}
                    style={{
                      width: `${Math.max(porcentaje, 3)}%`,
                      background: m.color,
                    }}
                  />
                </div>
                <div className={styles.conductividadValores}>
                  <span className={styles.conductividadValor}>{formatNumber(m.conductividad, m.conductividad < 1 ? 3 : 0)}</span>
                  <span className={styles.conductividadNota}>{m.nota}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Aplicaciones */}
      <div className={styles.aplicacionesContainer}>
        <h3 className={styles.aplicacionesTitulo}>Aplicaciones: aislamiento térmico</h3>
        <div className={styles.aplicacionesGrid}>
          <div className={styles.aplicacionCard}>
            <span className={styles.aplicacionIcono} aria-hidden="true">🧶</span>
            <h4 className={styles.aplicacionNombre}>Lana mineral</h4>
            <p className={styles.aplicacionDesc}>Fibras que atrapan miles de bolsas de aire microscópicas. Cada bolsa es un mini-aislante.</p>
          </div>
          <div className={styles.aplicacionCard}>
            <span className={styles.aplicacionIcono} aria-hidden="true">🧱</span>
            <h4 className={styles.aplicacionNombre}>Poliestireno</h4>
            <p className={styles.aplicacionDesc}>98% aire y 2% plástico. Ligero, barato y excelente aislante para construcción.</p>
          </div>
          <div className={styles.aplicacionCard}>
            <span className={styles.aplicacionIcono} aria-hidden="true">🪟</span>
            <h4 className={styles.aplicacionNombre}>Doble acristalamiento</h4>
            <p className={styles.aplicacionDesc}>Capa de aire (o argón) entre dos cristales. El secreto: el aire quieto conduce fatal.</p>
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Los buenos aislantes atrapan <strong>aire</strong> — porque el aire quieto conduce fatal (0,025 W/m·K).
          Lana, plumas, poliestireno, doble cristal: todos usan el mismo principio.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Convección en la naturaleza
// ─────────────────────────────────────────────

function DiagramaBrisa({ esNoche }: { esNoche: boolean }) {
  return (
    <svg viewBox="0 0 400 200" className={styles.diagramaSvg} aria-label={esNoche ? 'Brisa terrestre nocturna' : 'Brisa marina diurna'}>
      {/* Cielo */}
      <rect x="0" y="0" width="400" height="130" fill={esNoche ? '#1E293B' : '#BFDBFE'} />
      {esNoche ? (
        <text x="350" y="25" fontSize="18">🌙</text>
      ) : (
        <text x="350" y="30" fontSize="22">☀️</text>
      )}

      {/* Mar */}
      <rect x="0" y="130" width="200" height="70" fill="#3B82F6" opacity="0.6" />
      <text x="100" y="170" fill="white" fontSize="12" textAnchor="middle" fontWeight="600">Mar</text>

      {/* Tierra */}
      <rect x="200" y="130" width="200" height="70" fill={esNoche ? '#374151' : '#92400E'} opacity="0.7" />
      <text x="300" y="170" fill="white" fontSize="12" textAnchor="middle" fontWeight="600">Tierra</text>

      {/* Flechas de convección */}
      {!esNoche ? (
        <>
          {/* Día: brisa del mar a tierra */}
          <line x1="280" y1="110" x2="280" y2="50" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrowUp)" className={styles.flechaAnimada} />
          <text x="280" y="42" fill="#EF4444" fontSize="8" textAnchor="middle">Sube</text>
          <line x1="160" y1="70" x2="250" y2="70" stroke="#0EA5E9" strokeWidth="2.5" markerEnd="url(#arrowRight)" className={styles.flechaAnimada} />
          <text x="205" y="64" fill="#0EA5E9" fontSize="9" textAnchor="middle" fontWeight="600">Brisa marina</text>
        </>
      ) : (
        <>
          {/* Noche: brisa de tierra a mar */}
          <line x1="120" y1="110" x2="120" y2="50" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrowUp)" className={styles.flechaAnimada} />
          <text x="120" y="42" fill="#EF4444" fontSize="8" textAnchor="middle">Sube</text>
          <line x1="240" y1="70" x2="150" y2="70" stroke="#0EA5E9" strokeWidth="2.5" markerEnd="url(#arrowRight)" className={styles.flechaAnimada} />
          <text x="195" y="64" fill="#0EA5E9" fontSize="9" textAnchor="middle" fontWeight="600">Brisa terrestre</text>
        </>
      )}

      <defs>
        <marker id="arrowUp" markerWidth="8" markerHeight="6" refX="4" refY="6" orient="auto">
          <polygon points="0 6, 4 0, 8 6" fill="#EF4444" />
        </marker>
        <marker id="arrowRight" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#0EA5E9" />
        </marker>
      </defs>
    </svg>
  );
}

function SeccionConveccionNaturaleza() {
  const [ejemploActivo, setEjemploActivo] = useState(0);
  const [brisaNoche, setBrisaNoche] = useState(false);
  const ej = EJEMPLOS_CONVECCION[ejemploActivo];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La convección no solo calienta habitaciones: es el motor de <strong>brisas, corrientes oceánicas, placas tectónicas y lluvia</strong>.</p>
      </div>

      {/* Selector de ejemplos */}
      <div className={styles.conveccionSelector}>
        {EJEMPLOS_CONVECCION.map((e, i) => (
          <button
            key={e.id}
            type="button"
            className={`${styles.conveccionBtn} ${ejemploActivo === i ? styles.conveccionBtnActivo : ''}`}
            onClick={() => setEjemploActivo(i)}
            aria-pressed={ejemploActivo === i}
            style={{ borderColor: ejemploActivo === i ? e.color : undefined }}
          >
            <span aria-hidden="true">{e.icono}</span>
            <span>{e.nombre}</span>
          </button>
        ))}
      </div>

      {/* Diagrama animado para brisa marina */}
      {ej.id === 'brisa' && (
        <div className={styles.diagramaContainer}>
          <DiagramaBrisa esNoche={brisaNoche} />
          <div className={styles.diagramaToggle}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${!brisaNoche ? styles.toggleBtnActivo : ''}`}
              onClick={() => setBrisaNoche(false)}
              aria-pressed={!brisaNoche}
            >
              ☀️ Día
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${brisaNoche ? styles.toggleBtnActivo : ''}`}
              onClick={() => setBrisaNoche(true)}
              aria-pressed={brisaNoche}
            >
              🌙 Noche
            </button>
          </div>
        </div>
      )}

      {/* Diagrama genérico con flechas circulares para otros ejemplos */}
      {ej.id !== 'brisa' && (
        <div className={styles.diagramaContainer}>
          <svg viewBox="0 0 400 200" className={styles.diagramaSvg} aria-label={`Diagrama de convección: ${ej.nombre}`}>
            <rect x="0" y="0" width="400" height="200" fill={ej.id === 'manto' ? '#7F1D1D' : ej.id === 'oceanicas' ? '#1E3A5F' : '#E0F2FE'} rx="8" opacity="0.3" />

            {/* Flechas circulares de convección */}
            <path
              d="M120,150 C120,60 200,40 200,40 C200,40 280,60 280,150"
              fill="none" stroke={ej.color} strokeWidth="3" strokeDasharray="8,4"
              className={styles.corrienteAnimada}
            />
            <polygon points="280,145 285,155 275,155" fill={ej.color} className={styles.flechaAnimada} />

            <path
              d="M80,160 C80,160 120,170 120,150"
              fill="none" stroke={ej.color} strokeWidth="2" opacity="0.6"
            />
            <path
              d="M280,150 C280,170 320,160 320,160"
              fill="none" stroke={ej.color} strokeWidth="2" opacity="0.6"
            />

            {/* Flecha subida central */}
            <line x1="200" y1="160" x2="200" y2="50" stroke={ej.color} strokeWidth="3" markerEnd="url(#arrowConv)" className={styles.flechaAnimada} />

            {/* Labels */}
            <text x="200" y="180" fill={ej.color} fontSize="11" textAnchor="middle" fontWeight="700">
              {ej.id === 'manto' ? '🔥 Calor del núcleo' : ej.id === 'oceanicas' ? '🌊 Agua densa se hunde' : '☀️ Suelo caliente'}
            </text>
            <text x="200" y="30" fill={ej.color} fontSize="10" textAnchor="middle" fontWeight="600">
              {ej.id === 'manto' ? 'Roca caliente sube' : ej.id === 'oceanicas' ? 'Agua caliente en superficie' : 'Aire caliente sube'}
            </text>
            <text x="100" y="100" fill={ej.color} fontSize="9" textAnchor="middle" opacity="0.7">Frío ↓</text>
            <text x="300" y="100" fill={ej.color} fontSize="9" textAnchor="middle" opacity="0.7">Frío ↓</text>

            <defs>
              <marker id="arrowConv" markerWidth="8" markerHeight="6" refX="4" refY="6" orient="auto">
                <polygon points="0 6, 4 0, 8 6" fill={ej.color} />
              </marker>
            </defs>
          </svg>
        </div>
      )}

      {/* Detalle del ejemplo */}
      <div className={styles.detallePanel} style={{ borderLeftColor: ej.color }}>
        <h3 className={styles.detalleTitulo} style={{ color: ej.color }}>
          {ej.icono} {ej.nombre}
        </h3>
        <p className={styles.detalleDesc}>{ej.descripcion}</p>
        <p className={styles.detalleDetalle}>{ej.detalle}</p>
      </div>

      <div className={styles.insight}>
        <p>
          La convección del manto mueve los continentes a <strong>~2 cm/año</strong> — transferencia de calor a escala planetaria.
          El mismo mecanismo que calienta tu habitación remodela la superficie de la Tierra.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Datos Fascinantes
// ─────────────────────────────────────────────

function SeccionDatos() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La termodinámica está en todas partes: desde tu café matutino hasta el funcionamiento del universo. Estos datos muestran lo <strong>fascinante</strong> que es el calor.</p>
      </div>

      <div className={styles.curiososGrid}>
        {DATOS_CURIOSOS.map((d, i) => (
          <div key={i} className={styles.curiosoCard}>
            <span className={styles.curiosoIcono} aria-hidden="true">{d.icono}</span>
            <h4 className={styles.curiosoTitulo}>{d.titulo}</h4>
            <p className={styles.curiosoDesc}>{d.descripcion}</p>
          </div>
        ))}
      </div>

      {/* El termo como ejemplo perfecto */}
      <div className={styles.termoContainer}>
        <h3 className={styles.termoTitulo}>☕ El termo: combate las 3 formas</h3>
        <div className={styles.termoGrid}>
          <div className={styles.termoItem}>
            <span className={styles.termoForma} style={{ color: '#EF4444' }}>Anti-conducción</span>
            <p className={styles.termoDesc}>Vacío entre paredes dobles — sin materia, no hay conducción</p>
          </div>
          <div className={styles.termoItem}>
            <span className={styles.termoForma} style={{ color: '#3B82F6' }}>Anti-convección</span>
            <p className={styles.termoDesc}>El vacío también impide corrientes de aire — sin fluido, no hay convección</p>
          </div>
          <div className={styles.termoItem}>
            <span className={styles.termoForma} style={{ color: '#F59E0B' }}>Anti-radiación</span>
            <p className={styles.termoDesc}>Paredes internas reflectantes (espejo) — devuelven la radiación infrarroja</p>
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          James Dewar inventó el termo en <strong>1892</strong> para guardar gases licuados.
          No patentó su diseño doméstico — y Thermos GmbH lo comercializó en 1904.
          A veces la mejor ciencia es aplicar principios simples con elegancia.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorTermodinamicaPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('formas');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'formas': return <SeccionFormas />;
      case 'conductividad': return <SeccionConductividad />;
      case 'conveccion': return <SeccionConveccionNaturaleza />;
      case 'datos': return <SeccionDatos />;
    }
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Cómo se Mueve el Calor</h1>
          <p className={styles.subtitle}>Conducción, convección y radiación — las 3 formas de transferir energía térmica</p>
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
          title="Más sobre transferencia de calor"
          subtitle="Conceptos clave y preguntas frecuentes"
          defaultOpen={false}
        >
          <h3>¿Qué es la temperatura realmente?</h3>
          <p>
            La temperatura es una medida de la <strong>energía cinética media</strong> de las partículas
            de un cuerpo. Cuanto más rápido vibran, mayor es la temperatura. Por eso el cero absoluto
            (-273,15 °C) es el límite: las partículas dejarían de moverse.
          </p>

          <h3>¿Calor y temperatura son lo mismo?</h3>
          <p>
            No. La <strong>temperatura</strong> mide la agitación de las partículas. El <strong>calor</strong> es
            la energía que se transfiere entre cuerpos a diferente temperatura. Un iceberg tiene más
            energía térmica total que una taza de café, aunque el café esté más caliente.
          </p>

          <h3>¿Por qué el agua tarda tanto en hervir?</h3>
          <p>
            El agua tiene una <strong>capacidad calorífica muy alta</strong> (4.186 J/kg·K). Necesita
            mucha energía para subir de temperatura. Esto también explica por qué el mar modera el
            clima costero: absorbe calor de día y lo libera de noche.
          </p>

          <h3>¿Qué es el equilibrio térmico?</h3>
          <p>
            Cuando dos cuerpos en contacto alcanzan la misma temperatura y dejan de intercambiar calor.
            Es inevitable: la segunda ley de la termodinámica dice que el calor siempre fluye de lo
            caliente a lo frío, nunca al revés (sin aportar trabajo externo).
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador usa datos de fuentes científicas con fines divulgativos.
            Los valores de conductividad térmica y otros parámetros son aproximaciones estándar que pueden
            variar según la fuente, las condiciones de temperatura y presión.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-termodinamica')} />
        <ShareCard appName="visualizador-termodinamica" />
        <Footer appName="visualizador-termodinamica" />
    </div>
  );
}
