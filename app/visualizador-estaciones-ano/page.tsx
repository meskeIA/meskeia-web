'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
import styles from './EstacionesAno.module.css';
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

type Seccion = 'orbita' | 'horas-luz' | 'solsticios' | 'mitos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'orbita', titulo: 'La órbita', icono: '🌍', subtitulo: 'Por qué el eje inclinado lo cambia todo' },
  { id: 'horas-luz', titulo: 'Horas de luz', icono: '☀️', subtitulo: 'Cuánta luz recibe cada latitud' },
  { id: 'solsticios', titulo: 'Solsticios y equinoccios', icono: '📅', subtitulo: 'Las 4 fechas clave del año' },
  { id: 'mitos', titulo: 'Mitos y datos', icono: '🔍', subtitulo: 'Lo que crees saber (y es falso)' },
];

// Posiciones orbitales
interface PosicionOrbital {
  id: string;
  nombre: string;
  fecha: string;
  hemisferioNorte: string;
  hemisferioSur: string;
  explicacion: string;
  icono: string;
  angulo: number; // grados en la órbita (0 = arriba)
}

const POSICIONES: PosicionOrbital[] = [
  {
    id: 'solsticio-verano',
    nombre: 'Solsticio de junio',
    fecha: '~21 de junio',
    hemisferioNorte: 'Verano',
    hemisferioSur: 'Invierno',
    explicacion: 'El polo norte se inclina hacia el Sol. El hemisferio norte recibe rayos más directos y más horas de luz. Es el día más largo del año en el norte.',
    icono: '☀️',
    angulo: 270,
  },
  {
    id: 'equinoccio-otono',
    nombre: 'Equinoccio de septiembre',
    fecha: '~23 de septiembre',
    hemisferioNorte: 'Otoño',
    hemisferioSur: 'Primavera',
    explicacion: 'Ningún polo se inclina hacia el Sol. Ambos hemisferios reciben la misma cantidad de luz. Día y noche duran casi lo mismo (~12h).',
    icono: '🍂',
    angulo: 0,
  },
  {
    id: 'solsticio-invierno',
    nombre: 'Solsticio de diciembre',
    fecha: '~21 de diciembre',
    hemisferioNorte: 'Invierno',
    hemisferioSur: 'Verano',
    explicacion: 'El polo norte se aleja del Sol. El hemisferio norte recibe rayos más oblicuos y menos horas de luz. Es el día más corto del año en el norte.',
    icono: '❄️',
    angulo: 90,
  },
  {
    id: 'equinoccio-primavera',
    nombre: 'Equinoccio de marzo',
    fecha: '~20 de marzo',
    hemisferioNorte: 'Primavera',
    hemisferioSur: 'Otoño',
    explicacion: 'Ningún polo se inclina hacia el Sol. De nuevo día y noche iguales. Marca el inicio de la primavera en el norte y otoño en el sur.',
    icono: '🌸',
    angulo: 180,
  },
];

// Datos de horas de luz por latitud y estación
interface DatosLuz {
  latitud: number;
  nombre: string;
  primavera: number;
  verano: number;
  otono: number;
  invierno: number;
}

const DATOS_LUZ_REFERENCIA: DatosLuz[] = [
  { latitud: 0, nombre: 'Ecuador', primavera: 12, verano: 12, otono: 12, invierno: 12 },
  { latitud: 10, nombre: '10°N', primavera: 12.1, verano: 12.6, otono: 12.1, invierno: 11.4 },
  { latitud: 20, nombre: '20°N (Trópicos)', primavera: 12.2, verano: 13.2, otono: 12.2, invierno: 10.9 },
  { latitud: 30, nombre: '30°N', primavera: 12.3, verano: 14.0, otono: 12.3, invierno: 10.1 },
  { latitud: 40, nombre: '40°N (Madrid)', primavera: 12.5, verano: 15.0, otono: 12.5, invierno: 9.2 },
  { latitud: 50, nombre: '50°N (Londres)', primavera: 12.7, verano: 16.3, otono: 12.7, invierno: 8.0 },
  { latitud: 60, nombre: '60°N (Estocolmo)', primavera: 13.1, verano: 18.5, otono: 13.1, invierno: 5.8 },
  { latitud: 66.5, nombre: '66,5°N (C. Polar)', primavera: 13.5, verano: 24, otono: 13.5, invierno: 0 },
  { latitud: 70, nombre: '70°N', primavera: 14.0, verano: 24, otono: 14.0, invierno: 0 },
  { latitud: 80, nombre: '80°N', primavera: 16.0, verano: 24, otono: 16.0, invierno: 0 },
  { latitud: 90, nombre: '90°N (Polo Norte)', primavera: 24, verano: 24, otono: 0, invierno: 0 },
];

// Datos de solsticios y equinoccios
interface EventoSolar {
  nombre: string;
  fecha: string;
  icono: string;
  descripcion: string;
  fenomeno: string;
  datos: string[];
}

const EVENTOS_SOLARES: EventoSolar[] = [
  {
    nombre: 'Equinoccio de primavera',
    fecha: '~20 de marzo',
    icono: '🌸',
    descripcion: 'El Sol cruza el ecuador celeste de sur a norte. Día y noche duran casi exactamente lo mismo en todo el planeta.',
    fenomeno: 'Marca el inicio de la primavera en el hemisferio norte y del otoño en el sur.',
    datos: [
      'Duración del día: ~12 horas en todas las latitudes',
      'El Sol sale exactamente por el este y se pone por el oeste',
      'Punto vernal: referencia para medir las coordenadas celestes',
    ],
  },
  {
    nombre: 'Solsticio de verano',
    fecha: '~21 de junio',
    icono: '☀️',
    descripcion: 'El polo norte alcanza su máxima inclinación hacia el Sol. Es el día más largo del año en el hemisferio norte.',
    fenomeno: 'Sol de medianoche en el Ártico: el Sol no se pone durante semanas. Noche polar en la Antártida.',
    datos: [
      'Madrid: ~15 horas de luz',
      'Círculo Polar Ártico: 24 horas de Sol',
      'Trópico de Cáncer: el Sol pasa justo por el cénit (encima)',
      'Inclinación máxima del polo norte hacia el Sol: 23,5°',
    ],
  },
  {
    nombre: 'Equinoccio de otoño',
    fecha: '~23 de septiembre',
    icono: '🍂',
    descripcion: 'El Sol cruza de nuevo el ecuador celeste, ahora de norte a sur. Otra vez día y noche iguales.',
    fenomeno: 'Marca el inicio del otoño en el norte y la primavera en el sur.',
    datos: [
      'Duración del día: ~12 horas en todas las latitudes',
      'El Sol sale exactamente por el este y se pone por el oeste',
      'Los días empiezan a acortarse rápidamente en latitudes altas',
    ],
  },
  {
    nombre: 'Solsticio de invierno',
    fecha: '~21 de diciembre',
    icono: '❄️',
    descripcion: 'El polo norte alcanza su máxima inclinación alejándose del Sol. Es el día más corto del año en el hemisferio norte.',
    fenomeno: 'Noche polar en el Ártico: el Sol no sale durante semanas. Sol de medianoche en la Antártida.',
    datos: [
      'Madrid: ~9 horas de luz',
      'Círculo Polar Ártico: 0 horas de Sol (noche polar)',
      'Trópico de Capricornio: el Sol pasa justo por el cénit',
      'Paradoja: es cuando la Tierra está MÁS CERCA del Sol (perihelio en enero)',
    ],
  },
];

// Mitos y datos
interface Mito {
  afirmacion: string;
  verdad: boolean;
  explicacion: string;
  dato: string;
}

const MITOS: Mito[] = [
  {
    afirmacion: 'En verano estamos más cerca del Sol',
    verdad: false,
    explicacion: 'En el hemisferio norte, el verano ocurre cuando la Tierra está MÁS LEJOS del Sol (afelio, ~152 millones de km en julio). El invierno coincide con el punto MÁS CERCANO (perihelio, ~147 millones de km en enero).',
    dato: 'Diferencia perihelio-afelio: solo 5 millones de km (3,3%). Demasiado poco para afectar el clima.',
  },
  {
    afirmacion: 'Las estaciones se deben a la distancia al Sol',
    verdad: false,
    explicacion: 'Si fuera por la distancia, ambos hemisferios tendrían la misma estación al mismo tiempo. La clave es la INCLINACIÓN del eje: 23,5° hacen que los rayos lleguen más directos o más oblicuos según la época.',
    dato: 'Rayos directos calientan más porque concentran la energía en menos superficie.',
  },
  {
    afirmacion: 'En el ecuador no hay estaciones',
    verdad: true,
    explicacion: 'Correcto: en el ecuador las temperaturas son bastante constantes todo el año. Las horas de luz varían muy poco (~12h siempre). En cambio, tienen estaciones húmedas y secas.',
    dato: 'El ecuador recibe aproximadamente la misma radiación solar todo el año.',
  },
  {
    afirmacion: 'Todos los planetas tienen estaciones',
    verdad: false,
    explicacion: 'Solo los planetas con inclinación axial significativa tienen estaciones marcadas. Júpiter (3,1°) apenas tiene estaciones. Urano (97,7°) rueda prácticamente de lado, con estaciones extremas.',
    dato: 'En Urano, un polo mira al Sol durante 42 años seguidos, y luego el otro polo otros 42 años.',
  },
  {
    afirmacion: 'El día más caluroso es el solsticio de verano',
    verdad: false,
    explicacion: 'El solsticio de verano (~21 junio) es el día con más horas de sol, pero NO el más caluroso. Los océanos y la tierra tardan semanas en calentarse. Los días más calurosos suelen ser en julio-agosto.',
    dato: 'Este retraso se llama "inercia térmica". Los océanos actúan como un enorme regulador térmico.',
  },
];

// Planetas con inclinaciones
interface InclinacionPlaneta {
  nombre: string;
  inclinacion: number;
  estaciones: string;
  icono: string;
}

const INCLINACIONES: InclinacionPlaneta[] = [
  { nombre: 'Mercurio', inclinacion: 0.03, estaciones: 'Sin estaciones', icono: '☿' },
  { nombre: 'Venus', inclinacion: 177.4, estaciones: 'Gira al revés, sin estaciones reales', icono: '♀' },
  { nombre: 'Tierra', inclinacion: 23.5, estaciones: 'Estaciones marcadas', icono: '🌍' },
  { nombre: 'Marte', inclinacion: 25.2, estaciones: 'Estaciones similares (más largas)', icono: '♂' },
  { nombre: 'Júpiter', inclinacion: 3.1, estaciones: 'Casi sin estaciones', icono: '♃' },
  { nombre: 'Saturno', inclinacion: 26.7, estaciones: 'Estaciones marcadas (29 años)', icono: '♄' },
  { nombre: 'Urano', inclinacion: 97.7, estaciones: 'Extremas — rueda de lado', icono: '⛢' },
  { nombre: 'Neptuno', inclinacion: 28.3, estaciones: 'Estaciones (165 años de órbita)', icono: '♆' },
];

// ─────────────────────────────────────────────
// Función para interpolar horas de luz
// ─────────────────────────────────────────────

function getHorasLuz(latitud: number): { primavera: number; verano: number; otono: number; invierno: number } {
  const datos = DATOS_LUZ_REFERENCIA;
  // Encontrar los dos puntos de referencia entre los que cae la latitud
  for (let i = 0; i < datos.length - 1; i++) {
    if (latitud >= datos[i].latitud && latitud <= datos[i + 1].latitud) {
      const t = (latitud - datos[i].latitud) / (datos[i + 1].latitud - datos[i].latitud);
      return {
        primavera: datos[i].primavera + t * (datos[i + 1].primavera - datos[i].primavera),
        verano: Math.min(24, datos[i].verano + t * (datos[i + 1].verano - datos[i].verano)),
        otono: datos[i].otono + t * (datos[i + 1].otono - datos[i].otono),
        invierno: Math.max(0, datos[i].invierno + t * (datos[i + 1].invierno - datos[i].invierno)),
      };
    }
  }
  // Si es mayor que 90 (no debería pasar)
  return { primavera: 24, verano: 24, otono: 0, invierno: 0 };
}

// ─────────────────────────────────────────────
// Componente SVG de la órbita
// ─────────────────────────────────────────────

function OrbitaSVG({ posicionActiva, onClickPosicion }: {
  posicionActiva: string | null;
  onClickPosicion: (id: string) => void;
}) {
  const cx = 200;
  const cy = 200;
  const rx = 160;
  const ry = 140;

  // Posiciones de la Tierra en la elipse
  const posicionesXY = POSICIONES.map((p) => {
    const rad = (p.angulo * Math.PI) / 180;
    return {
      ...p,
      x: cx + rx * Math.cos(rad),
      y: cy + ry * Math.sin(rad),
    };
  });

  return (
    <svg viewBox="0 0 400 400" className={styles.orbitaSvg} role="img" aria-label="Diagrama de la órbita terrestre mostrando las 4 posiciones de los solsticios y equinoccios">
      {/* Fondo */}
      <rect x="0" y="0" width="400" height="400" fill="transparent" />

      {/* Órbita elíptica */}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="6 4" opacity={0.5} />

      {/* Sol en el centro */}
      <circle cx={cx} cy={cy} r="24" fill="#FFD700" />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="18" aria-hidden="true">☀️</text>

      {/* Línea de inclinación */}
      <line x1={cx - 8} y1={cy - ry - 30} x2={cx + 8} y2={cy - ry - 10} stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="3 2" opacity={0.4} />

      {/* Posiciones de la Tierra */}
      {posicionesXY.map((pos) => {
        const activa = posicionActiva === pos.id;
        return (
          <g key={pos.id}>
            {/* Línea Sol → Tierra */}
            <line x1={cx} y1={cy} x2={pos.x} y2={pos.y} stroke={activa ? 'var(--primary)' : 'var(--text-muted)'} strokeWidth={activa ? 1.5 : 0.5} opacity={activa ? 0.6 : 0.2} />

            {/* Tierra clickable */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={activa ? 20 : 16}
              fill={activa ? 'var(--primary)' : 'var(--bg-card)'}
              stroke={activa ? 'var(--primary)' : 'var(--text-muted)'}
              strokeWidth={activa ? 2.5 : 1.5}
              className={styles.orbitaPosicion}
              onClick={() => onClickPosicion(pos.id)}
              role="button"
              aria-label={`${pos.nombre} - ${pos.fecha}`}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClickPosicion(pos.id); } }}
            />
            <text
              x={pos.x}
              y={pos.y + 5}
              textAnchor="middle"
              fontSize="14"
              className={styles.orbitaIcono}
              pointerEvents="none"
              aria-hidden="true"
            >
              {pos.icono}
            </text>

            {/* Etiqueta */}
            <text
              x={pos.x + (pos.x > cx ? 24 : -24)}
              y={pos.y + (pos.y > cy ? 20 : -12)}
              textAnchor={pos.x > cx ? 'start' : 'end'}
              fontSize="10"
              fill={activa ? 'var(--primary)' : 'var(--text-secondary)'}
              fontWeight={activa ? 700 : 400}
              className={styles.orbitaLabel}
            >
              {pos.fecha}
            </text>
          </g>
        );
      })}

      {/* Indicador de inclinación 23,5° */}
      <text x={cx + rx + 8} y={cy - 10} fontSize="10" fill="var(--text-secondary)" textAnchor="start">
        Eje inclinado
      </text>
      <text x={cx + rx + 8} y={cy + 4} fontSize="12" fill="var(--primary)" fontWeight="700" textAnchor="start">
        23,5°
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorEstacionesAno() {
  const [seccion, setSeccion] = useState<Seccion>('orbita');
  const [posicionActiva, setPosicionActiva] = useState<string | null>(null);
  const [latitud, setLatitud] = useState(40); // Madrid por defecto

  const horasLuz = useMemo(() => getHorasLuz(latitud), [latitud]);

  const posicionInfo = useMemo(
    () => POSICIONES.find((p) => p.id === posicionActiva) ?? null,
    [posicionActiva]
  );

  const handleLatitud = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLatitud(Number(e.target.value));
  }, []);

  const maxHoras = 24;

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>
            <span aria-hidden="true">🌍</span> Las Estaciones del Año
          </h1>
          <p className={styles.subtitle}>Por qué 23,5° de inclinación lo cambian todo</p>
        </header>

        <LegalNotice />

        {/* Navegación de secciones */}
        <nav className={styles.nav} aria-label="Secciones del explicador">
          {SECCIONES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccion === s.id ? styles.navBtnActive : ''}`}
              onClick={() => setSeccion(s.id)}
              aria-current={seccion === s.id ? 'true' : undefined}
            >
              <span aria-hidden="true">{s.icono}</span>
              <span className={styles.navBtnText}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Subtítulo de sección */}
        <p className={styles.seccionSubtitulo}>
          {SECCIONES.find((s) => s.id === seccion)?.subtitulo}
        </p>

        {/* ── SECCIÓN 1: LA ÓRBITA ── */}
        {seccion === 'orbita' && (
          <section className={styles.mainContent} aria-label="La órbita terrestre">
            <div className={styles.orbitaContainer}>
              <OrbitaSVG
                posicionActiva={posicionActiva}
                onClickPosicion={(id) => setPosicionActiva(posicionActiva === id ? null : id)}
              />
              <p className={styles.instruccion}>Haz clic en cada posición de la Tierra para ver qué estación es</p>
            </div>

            {posicionInfo && (
              <div className={styles.posicionCard} role="alert" aria-live="polite">
                <h3 className={styles.posicionTitulo}>
                  <span aria-hidden="true">{posicionInfo.icono}</span> {posicionInfo.nombre}
                </h3>
                <p className={styles.posicionFecha}>{posicionInfo.fecha}</p>
                <div className={styles.hemisferiosGrid}>
                  <div className={styles.hemisferioCard}>
                    <span className={styles.hemisferioLabel}>Hemisferio Norte</span>
                    <span className={styles.hemisferioEstacion}>{posicionInfo.hemisferioNorte}</span>
                  </div>
                  <div className={styles.hemisferioCard}>
                    <span className={styles.hemisferioLabel}>Hemisferio Sur</span>
                    <span className={styles.hemisferioEstacion}>{posicionInfo.hemisferioSur}</span>
                  </div>
                </div>
                <p className={styles.posicionExplicacion}>{posicionInfo.explicacion}</p>
              </div>
            )}

            <div className={styles.conceptoCard}>
              <h3>La clave: la inclinación</h3>
              <p>
                El eje de la Tierra no es perpendicular a su órbita, sino que está inclinado <strong>23,5°</strong>. Esta
                inclinación se mantiene constante durante toda la órbita (apuntando siempre hacia la estrella Polar). Por
                eso, en distintos momentos del año, un hemisferio recibe los rayos del Sol más directamente que el otro.
              </p>
              <p>
                Rayos más directos = más energía por metro cuadrado = más calor. Rayos oblicuos = energía repartida en
                más superficie = menos calor. <strong>Eso es lo que causa las estaciones, NO la distancia al Sol.</strong>
              </p>
            </div>
          </section>
        )}

        {/* ── SECCIÓN 2: HORAS DE LUZ ── */}
        {seccion === 'horas-luz' && (
          <section className={styles.mainContent} aria-label="Horas de luz por latitud">
            <div className={styles.sliderContainer}>
              <label htmlFor="latitud-slider" className={styles.sliderLabel}>
                Latitud: <strong>{latitud}°N</strong>
                {latitud === 0 && ' (Ecuador)'}
                {latitud === 40 && ' (Madrid)'}
                {latitud === 50 && ' (Londres)'}
                {latitud === 60 && ' (Estocolmo)'}
                {Math.abs(latitud - 66.5) < 1 && ' (Círculo Polar)'}
                {latitud === 90 && ' (Polo Norte)'}
              </label>
              <input
                id="latitud-slider"
                type="range"
                min={0}
                max={90}
                step={1}
                value={latitud}
                onChange={handleLatitud}
                className={styles.slider}
                aria-valuemin={0}
                aria-valuemax={90}
                aria-valuenow={latitud}
                aria-valuetext={`${latitud} grados norte`}
              />
              <div className={styles.sliderMarks}>
                <span>0° Ecuador</span>
                <span>23,5° Trópico</span>
                <span>45°</span>
                <span>66,5° C. Polar</span>
                <span>90° Polo</span>
              </div>
            </div>

            {/* Gráfico de barras */}
            <div className={styles.barrasContainer}>
              {[
                { key: 'primavera' as const, label: 'Primavera', icono: '🌸', color: 'var(--secondary)' },
                { key: 'verano' as const, label: 'Verano', icono: '☀️', color: 'var(--primary)' },
                { key: 'otono' as const, label: 'Otoño', icono: '🍂', color: '#D4853E' },
                { key: 'invierno' as const, label: 'Invierno', icono: '❄️', color: '#5B9BD5' },
              ].map((est) => (
                <div key={est.key} className={styles.barraItem}>
                  <div className={styles.barraLabel}>
                    <span aria-hidden="true">{est.icono}</span> {est.label}
                  </div>
                  <div className={styles.barraTrack}>
                    <div
                      className={styles.barraFill}
                      style={{
                        width: `${(horasLuz[est.key] / maxHoras) * 100}%`,
                        backgroundColor: est.color,
                      }}
                    />
                  </div>
                  <div className={styles.barraValor}>
                    {formatNumber(horasLuz[est.key], 1)}h
                  </div>
                </div>
              ))}
            </div>

            {/* Dato contextual */}
            <div className={styles.datoContextual}>
              {latitud <= 23.5 && (
                <p><strong>En los trópicos</strong>, las horas de luz apenas varían durante el año. Las temperaturas son relativamente constantes, con estaciones húmedas y secas en lugar de frío/calor.</p>
              )}
              {latitud > 23.5 && latitud < 66.5 && (
                <p><strong>En latitudes medias</strong> (como España), la diferencia entre verano e invierno es muy notable: {formatNumber(horasLuz.verano - horasLuz.invierno, 1)} horas de diferencia. Esa diferencia de luz es la que marca las estaciones.</p>
              )}
              {latitud >= 66.5 && (
                <p><strong>Más allá del Círculo Polar</strong>, hay épocas del año con 24 horas de sol continuo (sol de medianoche) y épocas con 0 horas de luz (noche polar). Es uno de los fenómenos más extremos del planeta.</p>
              )}
            </div>

            {/* Tabla comparativa */}
            <div className={styles.tablaWrapper}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Latitud</th>
                    <th>Primavera</th>
                    <th>Verano</th>
                    <th>Otoño</th>
                    <th>Invierno</th>
                  </tr>
                </thead>
                <tbody>
                  {DATOS_LUZ_REFERENCIA.filter((_, i) => i % 2 === 0 || i === DATOS_LUZ_REFERENCIA.length - 1).map((d) => (
                    <tr key={d.latitud} className={d.latitud === latitud ? styles.tablaRowActiva : ''}>
                      <td className={styles.tablaCelda}><strong>{d.nombre}</strong></td>
                      <td>{formatNumber(d.primavera, 1)}h</td>
                      <td>{formatNumber(d.verano, 1)}h</td>
                      <td>{formatNumber(d.otono, 1)}h</td>
                      <td>{formatNumber(d.invierno, 1)}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── SECCIÓN 3: SOLSTICIOS Y EQUINOCCIOS ── */}
        {seccion === 'solsticios' && (
          <section className={styles.mainContent} aria-label="Solsticios y equinoccios">
            <div className={styles.eventosGrid}>
              {EVENTOS_SOLARES.map((evento) => (
                <div key={evento.nombre} className={styles.eventoCard}>
                  <div className={styles.eventoHeader}>
                    <span className={styles.eventoIcono} aria-hidden="true">{evento.icono}</span>
                    <div>
                      <h3 className={styles.eventoNombre}>{evento.nombre}</h3>
                      <span className={styles.eventoFecha}>{evento.fecha}</span>
                    </div>
                  </div>
                  <p className={styles.eventoDescripcion}>{evento.descripcion}</p>
                  <div className={styles.eventoFenomeno}>
                    <strong>Fenómeno:</strong> {evento.fenomeno}
                  </div>
                  <ul className={styles.eventoDatos}>
                    {evento.datos.map((dato, i) => (
                      <li key={i}>{dato}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className={styles.conceptoCard}>
              <h3>Líneas clave del planeta</h3>
              <ul className={styles.lineasLista}>
                <li><strong>Trópico de Cáncer (23,5°N)</strong>: Latitud máxima donde el Sol puede estar en el cénit (justo encima). Ocurre el solsticio de junio.</li>
                <li><strong>Trópico de Capricornio (23,5°S)</strong>: Equivalente en el sur. El Sol está en el cénit el solsticio de diciembre.</li>
                <li><strong>Círculo Polar Ártico (66,5°N)</strong>: Latitud mínima para experimentar sol de medianoche (verano) y noche polar (invierno).</li>
                <li><strong>Círculo Polar Antártico (66,5°S)</strong>: Equivalente en el hemisferio sur.</li>
              </ul>
            </div>
          </section>
        )}

        {/* ── SECCIÓN 4: MITOS Y DATOS ── */}
        {seccion === 'mitos' && (
          <section className={styles.mainContent} aria-label="Mitos y datos sobre las estaciones">
            <div className={styles.mitosGrid}>
              {MITOS.map((mito, i) => (
                <div key={i} className={`${styles.mitoCard} ${mito.verdad ? styles.mitoVerdadero : styles.mitoFalso}`}>
                  <div className={styles.mitoHeader}>
                    <span className={`${styles.mitoBadge} ${mito.verdad ? styles.mitoBadgeVerdadero : styles.mitoBadgeFalso}`}>
                      {mito.verdad ? '✅ VERDADERO' : '❌ FALSO'}
                    </span>
                  </div>
                  <p className={styles.mitoAfirmacion}>&ldquo;{mito.afirmacion}&rdquo;</p>
                  <p className={styles.mitoExplicacion}>{mito.explicacion}</p>
                  <div className={styles.mitoDato}>
                    <strong>Dato:</strong> {mito.dato}
                  </div>
                </div>
              ))}
            </div>

            {/* Distancias Sol */}
            <div className={styles.conceptoCard}>
              <h3>Perihelio vs Afelio</h3>
              <div className={styles.distanciasGrid}>
                <div className={styles.distanciaCard}>
                  <span className={styles.distanciaIcono} aria-hidden="true">🔴</span>
                  <strong>Perihelio</strong>
                  <span>~3 de enero</span>
                  <span className={styles.distanciaValor}>147,1 M km</span>
                  <span className={styles.distanciaDetalle}>Punto más CERCANO al Sol</span>
                </div>
                <div className={styles.distanciaCard}>
                  <span className={styles.distanciaIcono} aria-hidden="true">🔵</span>
                  <strong>Afelio</strong>
                  <span>~4 de julio</span>
                  <span className={styles.distanciaValor}>152,1 M km</span>
                  <span className={styles.distanciaDetalle}>Punto más LEJANO al Sol</span>
                </div>
              </div>
              <p className={styles.distanciaExplicacion}>
                Diferencia: solo 5 millones de km (3,3%). La órbita de la Tierra es casi circular.
                Por eso la distancia al Sol NO causa las estaciones.
              </p>
            </div>

            {/* Inclinaciones de otros planetas */}
            <div className={styles.conceptoCard}>
              <h3>Estaciones en otros planetas</h3>
              <div className={styles.planetasGrid}>
                {INCLINACIONES.map((p) => (
                  <div key={p.nombre} className={`${styles.planetaCard} ${p.nombre === 'Tierra' ? styles.planetaCardTierra : ''}`}>
                    <span className={styles.planetaIcono} aria-hidden="true">{p.icono}</span>
                    <strong>{p.nombre}</strong>
                    <span className={styles.planetaInclinacion}>{formatNumber(p.inclinacion, 1)}°</span>
                    <span className={styles.planetaEstaciones}>{p.estaciones}</span>
                  </div>
                ))}
              </div>
              <p className={styles.planetaExplicacion}>
                Urano es el caso más extremo: con 97,7° de inclinación, prácticamente &ldquo;rueda&rdquo; sobre su órbita.
                Un polo apunta al Sol durante medio año uraniano (~42 años terrestres), y luego el otro.
              </p>
            </div>
          </section>
        )}

        {/* Aviso hemisferio */}
        <div className={styles.warningBox}>
          <p>
            <strong>Nota:</strong> Todos los datos de esta página se refieren al <strong>hemisferio norte</strong> por
            defecto. En el <strong>hemisferio sur</strong>, las estaciones son opuestas: cuando es verano en el norte,
            es invierno en el sur, y viceversa. Las fechas de solsticios y equinoccios son las mismas, pero la estación
            asociada se invierte.
          </p>
        </div>

        {/* Contenido educativo */}
        <EducationalSection
          title="¿Quieres aprender más?"
          subtitle="Conceptos clave sobre la Tierra y sus estaciones"
        >
          <section className={styles.guideSection}>
            <h2>¿Por qué la inclinación es de exactamente 23,5°?</h2>
            <p>
              La inclinación axial de la Tierra (técnicamente llamada <strong>oblicuidad de la eclíptica</strong>) no es
              un valor fijo para siempre. Oscila entre 22,1° y 24,5° en un ciclo de ~41.000 años (ciclos de Milankovitch).
              Actualmente estamos en 23,44° y disminuyendo lentamente.
            </p>
            <p>
              Se cree que un impacto gigante hace ~4.500 millones de años (la misma colisión que formó la Luna) le dio
              a la Tierra su inclinación actual. Sin la Luna, la inclinación podría variar caóticamente, haciendo
              imposible un clima estable para la vida.
            </p>
          </section>

          <section className={styles.guideSection}>
            <h2>El efecto en la vida cotidiana</h2>
            <p>
              Las estaciones determinan los ciclos agrícolas, las migraciones animales, la duración de los días laborales,
              el consumo energético (calefacción/aire acondicionado) e incluso nuestro estado de ánimo (trastorno
              afectivo estacional en inviernos con poca luz).
            </p>
            <p>
              En latitudes altas como Escandinavia, la diferencia es dramática: más de 18 horas de luz en verano frente
              a menos de 6 en invierno. Esta variación extrema influye en la cultura, la arquitectura y los ritmos de
              vida de estas sociedades.
            </p>
          </section>

          <section className={styles.guideSection}>
            <h2>Precesión del eje terrestre</h2>
            <p>
              Además de estar inclinado, el eje terrestre &ldquo;tambalea&rdquo; como una peonza en un ciclo de ~26.000
              años. Esto significa que dentro de ~13.000 años, el verano en el hemisferio norte coincidirá con el
              perihelio (punto más cercano al Sol), haciendo los veranos más calurosos y los inviernos más fríos.
            </p>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-estaciones-ano')} />
        <ShareCard appName="visualizador-estaciones-ano" />
        <Footer appName="visualizador-estaciones-ano" />
    </div>
  );
}
