'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorAnatomiaVuelo.module.css';
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

type Seccion = 'vuela' | 'fases' | 'madrid' | 'cabina';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'vuela', titulo: 'Por que vuela', icono: '✈️', subtitulo: 'Bernoulli, Newton y las 4 fuerzas' },
  { id: 'fases', titulo: 'Fases del vuelo', icono: '📈', subtitulo: '7 etapas de puerta a puerta' },
  { id: 'madrid', titulo: 'Madrid-Londres', icono: '🗺️', subtitulo: 'Un vuelo real en datos' },
  { id: 'cabina', titulo: 'La cabina', icono: '🎛️', subtitulo: 'Instrumentos y curiosidades' },
];

// ─────────────────────────────────────────────
// Seccion 1: Por que vuela
// ─────────────────────────────────────────────

function SeccionVuela() {
  const fuerzas = [
    {
      nombre: 'Sustentacion (Lift)',
      icono: '⬆️',
      color: '#27ae60',
      direccion: 'Hacia arriba',
      explicacion: 'Generada por las alas. El aire pasa mas rapido por encima del ala (forma curva) que por debajo (plana). Segun Bernoulli, mayor velocidad = menor presion. La diferencia de presion empuja el ala hacia arriba.',
    },
    {
      nombre: 'Peso (Weight)',
      icono: '⬇️',
      color: '#e74c3c',
      direccion: 'Hacia abajo',
      explicacion: 'La gravedad tira del avion hacia la Tierra. Un A320 pesa unas 78 toneladas al despegar. Para volar, la sustentacion debe ser igual o mayor que el peso.',
    },
    {
      nombre: 'Empuje (Thrust)',
      icono: '➡️',
      color: '#2E86AB',
      direccion: 'Hacia adelante',
      explicacion: 'Los motores generan empuje acelerando aire hacia atras (tercera ley de Newton: accion y reaccion). Un motor CFM56 produce unos 120 kN de empuje.',
    },
    {
      nombre: 'Resistencia (Drag)',
      icono: '⬅️',
      color: '#F39C12',
      direccion: 'Hacia atras',
      explicacion: 'El aire se opone al movimiento del avion. Incluye resistencia de forma (silueta) y resistencia inducida (consecuencia de generar sustentacion). El diseno aerodinamico la minimiza.',
    },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Un avion vuela gracias a un equilibrio de <strong>4 fuerzas</strong>. No es magia: es fisica aplicada desde hace mas de 120 anos.</p>
      </div>

      {/* Diagrama de fuerzas */}
      <div className={styles.diagramaFuerzas}>
        <div className={styles.avionCentral}>
          <span className={styles.avionEmoji} aria-hidden="true">✈️</span>
        </div>
        <div className={`${styles.fuerzaFlecha} ${styles.flechaArriba}`}>
          <span className={styles.flechaLabel} style={{ color: '#27ae60' }}>Sustentacion</span>
          <div className={styles.flechaLinea} style={{ background: '#27ae60' }} />
        </div>
        <div className={`${styles.fuerzaFlecha} ${styles.flechaAbajo}`}>
          <div className={styles.flechaLinea} style={{ background: '#e74c3c' }} />
          <span className={styles.flechaLabel} style={{ color: '#e74c3c' }}>Peso</span>
        </div>
        <div className={`${styles.fuerzaFlecha} ${styles.flechaDerecha}`}>
          <span className={styles.flechaLabel} style={{ color: '#2E86AB' }}>Empuje</span>
          <div className={styles.flechaLineaH} style={{ background: '#2E86AB' }} />
        </div>
        <div className={`${styles.fuerzaFlecha} ${styles.flechaIzquierda}`}>
          <div className={styles.flechaLineaH} style={{ background: '#F39C12' }} />
          <span className={styles.flechaLabel} style={{ color: '#F39C12' }}>Resistencia</span>
        </div>
      </div>

      {/* Perfil del ala */}
      <div className={styles.perfilAla}>
        <h3 className={styles.perfilTitulo}>Perfil del ala (seccion transversal)</h3>
        <div className={styles.alaVisual}>
          <div className={styles.alaForma}>
            <div className={styles.flujoSuperior}>
              <span className={styles.flujoFlecha}>→ → → → →</span>
              <span className={styles.flujoTexto}>Aire rapido = Baja presion</span>
            </div>
            <div className={styles.flujoInferior}>
              <span className={styles.flujoFlecha}>→ → →</span>
              <span className={styles.flujoTexto}>Aire lento = Alta presion</span>
            </div>
          </div>
        </div>
        <p className={styles.perfilExplicacion}>
          La forma del ala (perfil aerodinamico) obliga al aire de arriba a recorrer mas distancia en el mismo tiempo.
          Al ir mas rapido, su presion baja (principio de Bernoulli). La mayor presion de abajo <strong>empuja el ala hacia arriba</strong>.
        </p>
      </div>

      {/* Tarjetas de fuerzas */}
      <div className={styles.fuerzasGrid}>
        {fuerzas.map((f, i) => (
          <div key={i} className={styles.fuerzaCard} style={{ borderLeftColor: f.color }}>
            <div className={styles.fuerzaHeader}>
              <span aria-hidden="true">{f.icono}</span>
              <h3 className={styles.fuerzaNombre} style={{ color: f.color }}>{f.nombre}</h3>
            </div>
            <span className={styles.fuerzaDireccion}>{f.direccion}</span>
            <p className={styles.fuerzaDesc}>{f.explicacion}</p>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          En <strong>vuelo recto y nivelado</strong>, las 4 fuerzas estan en equilibrio:
          sustentacion = peso y empuje = resistencia. Para subir, se aumenta la sustentacion
          (mas angulo de ataque o mas velocidad). Para acelerar, se aumenta el empuje.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Seccion 2: Las fases del vuelo
// ─────────────────────────────────────────────

function SeccionFases() {
  const [faseActiva, setFaseActiva] = useState<number | null>(null);

  const fases = [
    {
      icono: '🔍',
      nombre: 'Revision preflight',
      altitud: '0 m',
      velocidad: '0 km/h',
      duracion: '30-45 min',
      descripcion: 'Los pilotos revisan sistemas, combustible, meteorologia y plan de vuelo. Los tecnicos inspeccionan el avion por fuera. Se calcula el peso y el centro de gravedad.',
      dato: 'Un A320 tiene mas de 300 items en su checklist prevuelo.',
    },
    {
      icono: '🛞',
      nombre: 'Rodaje (Taxi)',
      altitud: '0 m',
      velocidad: '20-30 km/h',
      duracion: '5-20 min',
      descripcion: 'El avion se desplaza por las calles de rodaje hasta la cabecera de pista. Los motores estan al minimo. El piloto sigue las instrucciones de la torre de control.',
      dato: 'En aeropuertos grandes como Madrid-Barajas, el rodaje puede durar 15 minutos.',
    },
    {
      icono: '🛫',
      nombre: 'Despegue',
      altitud: '0 → 300 m',
      velocidad: '250-280 km/h',
      descripcion: 'Motores a maxima potencia. Tres velocidades criticas: V1 (decision: ya no se puede abortar), VR (rotacion: se levanta el morro) y V2 (velocidad de seguridad con un motor parado).',
      duracion: '30-40 seg',
      dato: 'V1 de un A320: ~250 km/h. La carrera de despegue dura unos 1.500 metros.',
    },
    {
      icono: '📐',
      nombre: 'Ascenso',
      altitud: '300 → 11.000 m',
      velocidad: '450-600 km/h',
      duracion: '15-25 min',
      descripcion: 'El avion sube con un angulo de 10-15 grados. Se retraen flaps y slats progresivamente. Los pasajeros notan los oidos taponados por el cambio de presion.',
      dato: 'La cabina se presuriza al equivalente de 1.800-2.400 m de altitud.',
    },
    {
      icono: '✈️',
      nombre: 'Crucero',
      altitud: '10.000-12.000 m',
      velocidad: '~900 km/h',
      duracion: 'La mayor parte',
      descripcion: 'Altitud optima: el aire menos denso reduce la resistencia y el consumo de combustible. El piloto automatico gestiona el vuelo. La temperatura exterior es de -56 °C.',
      dato: 'A 11.000 m la presion es un cuarto de la del suelo. Sin presurizacion, perderiamos el conocimiento en segundos.',
    },
    {
      icono: '📉',
      nombre: 'Descenso',
      altitud: '11.000 → 900 m',
      velocidad: '400-600 km/h',
      duracion: '20-30 min',
      descripcion: 'Reduccion gradual de altitud. Los motores bajan a ralenti (se consume muy poco). Se despliegan spoilers para perder altura sin ganar velocidad.',
      dato: 'El descenso comienza a unos 200 km del aeropuerto de destino.',
    },
    {
      icono: '🛬',
      nombre: 'Aterrizaje',
      altitud: '900 → 0 m',
      velocidad: '250 → 0 km/h',
      duracion: '5-8 min',
      descripcion: 'Aproximacion final con flaps y tren de aterrizaje extendidos. El avion toca la pista a ~250 km/h. Inversores de empuje + frenos reducen la velocidad rapidamente.',
      dato: 'La velocidad de toque (touchdown) de un A320 es de unos 240 km/h. Se necesitan ~1.000 m para frenar.',
    },
  ];

  // Posiciones relativas de altitud para el perfil visual
  const altitudes = [0, 0, 2, 50, 100, 50, 0];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Un vuelo comercial tiene <strong>7 fases diferenciadas</strong>. Cada una con sus propias velocidades, procedimientos y sensaciones para el pasajero.</p>
      </div>

      {/* Perfil de altitud visual */}
      <div className={styles.perfilAltitud}>
        <h3 className={styles.perfilAltTitulo}>Perfil de altitud</h3>
        <div className={styles.altitudGrafico}>
          <div className={styles.altitudLinea}>
            {altitudes.map((alt, i) => (
              <div
                key={i}
                className={`${styles.altitudPunto} ${faseActiva === i ? styles.altitudPuntoActivo : ''}`}
                style={{ bottom: `${alt}%`, left: `${(i / (altitudes.length - 1)) * 100}%` }}
                onClick={() => setFaseActiva(faseActiva === i ? null : i)}
                role="button"
                tabIndex={0}
                aria-label={`Fase ${i + 1}: ${fases[i].nombre}`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setFaseActiva(faseActiva === i ? null : i); }}
              >
                <span className={styles.altitudIcono} aria-hidden="true">{fases[i].icono}</span>
              </div>
            ))}
            {/* Linea SVG del perfil */}
            <svg className={styles.altitudSvg} viewBox="0 0 600 200" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="var(--primary)"
                strokeWidth="3"
                points={altitudes.map((alt, i) => `${(i / (altitudes.length - 1)) * 600},${200 - alt * 2}`).join(' ')}
              />
              <polyline
                fill="url(#altGrad)"
                stroke="none"
                points={`0,200 ${altitudes.map((alt, i) => `${(i / (altitudes.length - 1)) * 600},${200 - alt * 2}`).join(' ')} 600,200`}
              />
              <defs>
                <linearGradient id="altGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className={styles.altitudEtiquetas}>
            <span>Salida</span>
            <span>Llegada</span>
          </div>
        </div>
      </div>

      {/* Timeline de fases */}
      <div className={styles.fasesTimeline}>
        {fases.map((fase, i) => (
          <div
            key={i}
            className={`${styles.faseCard} ${faseActiva === i ? styles.faseCardActiva : ''}`}
            onClick={() => setFaseActiva(faseActiva === i ? null : i)}
            role="button"
            tabIndex={0}
            aria-expanded={faseActiva === i}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setFaseActiva(faseActiva === i ? null : i); }}
          >
            <div className={styles.faseHeader}>
              <div className={styles.faseNumero}>{i + 1}</div>
              <span className={styles.faseIcono} aria-hidden="true">{fase.icono}</span>
              <div className={styles.faseInfo}>
                <h3 className={styles.faseNombre}>{fase.nombre}</h3>
                <div className={styles.faseMetas}>
                  <span className={styles.faseMeta}>
                    <span aria-hidden="true">📏</span> {fase.altitud}
                  </span>
                  <span className={styles.faseMeta}>
                    <span aria-hidden="true">💨</span> {fase.velocidad}
                  </span>
                  <span className={styles.faseMeta}>
                    <span aria-hidden="true">⏱️</span> {fase.duracion}
                  </span>
                </div>
              </div>
            </div>
            {faseActiva === i && (
              <div className={styles.faseDetalle}>
                <p className={styles.faseDesc}>{fase.descripcion}</p>
                <p className={styles.faseDato}>
                  <strong>Dato:</strong> {fase.dato}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          De las ~2,5 horas de un vuelo medio en Europa, el piloto controla manualmente solo unos <strong>3-5 minutos</strong>
          {' '}(despegue y aterrizaje). El resto lo gestiona el piloto automatico, aunque la tripulacion supervisa constantemente.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Seccion 3: Madrid-Londres en datos
// ─────────────────────────────────────────────

function SeccionMadridLondres() {
  const datos = [
    { icono: '📏', label: 'Distancia', valor: formatNumber(1264, 0) + ' km', comparacion: 'Como ir de Madrid a Paris por carretera' },
    { icono: '⏱️', label: 'Duracion', valor: '2 h 25 min', comparacion: 'En tren (Eurostar + AVE) serian unas 16 horas' },
    { icono: '⛽', label: 'Combustible', valor: formatNumber(5400, 0) + ' kg', comparacion: 'Unos 6.750 litros de queroseno (Jet A-1)' },
    { icono: '🏔️', label: 'Altitud crucero', valor: formatNumber(11000, 0) + ' m', comparacion: 'Mas alto que el Everest (8.849 m)' },
    { icono: '🌡️', label: 'Temp. exterior', valor: '-56 °C', comparacion: 'Mas frio que el polo norte en invierno (-40 °C)' },
    { icono: '🚀', label: 'Velocidad crucero', valor: '~900 km/h', comparacion: 'Mach 0,78 — el 78% de la velocidad del sonido' },
    { icono: '👥', label: 'Pasajeros', valor: '~180', comparacion: 'Configuracion tipica de un Airbus A320' },
    { icono: '🌍', label: 'CO2 por pasajero', valor: '~120 kg', comparacion: 'Un arbol absorbe ~22 kg de CO2 al ano' },
  ];

  const comparativaTransporte = [
    { medio: 'Avion', icono: '✈️', tiempo: '2 h 25 min', co2: 120, color: '#e74c3c' },
    { medio: 'Tren', icono: '🚆', tiempo: '~16 h', co2: 35, color: '#27ae60' },
    { medio: 'Coche', icono: '🚗', tiempo: '~14 h', co2: 170, color: '#F39C12' },
    { medio: 'Autobus', icono: '🚌', tiempo: '~18 h', co2: 40, color: '#48A9A6' },
  ];

  const maxCo2 = Math.max(...comparativaTransporte.map(c => c.co2));

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Datos reales de un vuelo <strong>Madrid (MAD) → Londres (LHR)</strong> en un Airbus A320. Uno de los trayectos mas populares de Europa.</p>
      </div>

      {/* Ruta visual */}
      <div className={styles.rutaVisual}>
        <div className={styles.rutaCiudad}>
          <span className={styles.rutaCode}>MAD</span>
          <span className={styles.rutaNombre}>Madrid Barajas</span>
        </div>
        <div className={styles.rutaLinea}>
          <span className={styles.rutaAvion} aria-hidden="true">✈️</span>
          <span className={styles.rutaDistancia}>{formatNumber(1264, 0)} km</span>
        </div>
        <div className={styles.rutaCiudad}>
          <span className={styles.rutaCode}>LHR</span>
          <span className={styles.rutaNombre}>Londres Heathrow</span>
        </div>
      </div>

      {/* Tarjetas de datos */}
      <div className={styles.datosGrid}>
        {datos.map((d, i) => (
          <div key={i} className={styles.datoCard}>
            <span className={styles.datoIcono} aria-hidden="true">{d.icono}</span>
            <span className={styles.datoLabel}>{d.label}</span>
            <span className={styles.datoValor}>{d.valor}</span>
            <span className={styles.datoComp}>{d.comparacion}</span>
          </div>
        ))}
      </div>

      {/* Comparativa CO2 */}
      <div className={styles.comparativaCard}>
        <h3 className={styles.comparativaTitulo}>Huella de CO2 por pasajero (Madrid → Londres)</h3>
        <div className={styles.barrasContainer}>
          {comparativaTransporte.map((c, i) => (
            <div key={i} className={styles.barraRow}>
              <div className={styles.barraMedio}>
                <span aria-hidden="true">{c.icono}</span>
                <span>{c.medio}</span>
              </div>
              <div className={styles.barraTrack}>
                <div
                  className={styles.barraFill}
                  style={{ width: `${(c.co2 / maxCo2) * 100}%`, background: c.color }}
                />
              </div>
              <div className={styles.barraValores}>
                <span className={styles.barraCo2}>{c.co2} kg CO2</span>
                <span className={styles.barraTiempo}>{c.tiempo}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          El avion es el <strong>mas rapido</strong> pero no el mas limpio. El tren emite un 70% menos de CO2,
          aunque tarda 7 veces mas. La eleccion depende de las prioridades de cada viajero: tiempo, coste o impacto ambiental.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Seccion 4: La cabina
// ─────────────────────────────────────────────

function SeccionCabina() {
  const [instrumentoActivo, setInstrumentoActivo] = useState<number | null>(null);

  const instrumentos = [
    {
      icono: '📏',
      nombre: 'Altimetro',
      funcion: 'Mide la altitud del avion sobre el nivel del mar.',
      detalle: 'Funciona por presion atmosferica. Al subir, la presion baja y el altimetro lo traduce a metros/pies. Precision: unos 10 metros. Existen tambien radioaltimetros que miden la distancia real al suelo con ondas de radio.',
    },
    {
      icono: '💨',
      nombre: 'Velocimetro (ASI)',
      funcion: 'Muestra la velocidad relativa al aire (no al suelo).',
      detalle: 'Mide la diferencia entre la presion total (tubo pitot, apunta hacia adelante) y la presion estatica. Con viento de cola, la velocidad respecto al suelo es mayor que la indicada. Por eso un vuelo de ida y vuelta no dura lo mismo.',
    },
    {
      icono: '⚖️',
      nombre: 'Horizonte artificial',
      funcion: 'Indica la posicion del avion respecto al horizonte.',
      detalle: 'Esencial para volar entre nubes o de noche, cuando el piloto no ve el horizonte real. Muestra si el avion esta inclinado, subiendo o bajando. Es el instrumento mas critico: sin el, el piloto puede desorientarse en segundos.',
    },
    {
      icono: '🧭',
      nombre: 'Navegacion (GPS/INS)',
      funcion: 'Indica la posicion exacta y la ruta a seguir.',
      detalle: 'Los aviones modernos combinan GPS (satelites) con INS (sistema inercial, giroscopos). El INS funciona sin senal externa: mide aceleraciones para calcular la posicion. Precision del GPS aeronautico: 1-2 metros.',
    },
  ];

  const curiosidades = [
    {
      icono: '👂',
      titulo: 'Por que se taponan los oidos',
      explicacion: 'Al subir, la presion exterior baja pero el aire en el oido medio tarda en igualarse. La trompa de Eustaquio debe abrirse para equilibrar. Trago, bostezo o maniobra de Valsalva ayudan. Los bebes lloran porque no saben compensar.',
    },
    {
      icono: '🍽️',
      titulo: 'Por que la comida sabe diferente',
      explicacion: 'A 11.000 m, la humedad en cabina baja al 10-15% (un desierto tiene 25%). La sequedad reduce la percepcion del sabor un 30%. Ademas, el ruido de fondo (80 dB) disminuye la sensibilidad al dulce y salado. Por eso las aerolineas anaden mas sal y especias.',
    },
    {
      icono: '🪟',
      titulo: 'Por que las ventanillas son redondas',
      explicacion: 'Las esquinas concentran la tension mecanica (presurizacion). En los anos 50, el De Havilland Comet tenia ventanas cuadradas y sufrio accidentes por fatiga del metal en las esquinas. Desde entonces, todas las ventanillas son ovaladas o redondas.',
    },
    {
      icono: '🤖',
      titulo: 'El piloto automatico',
      explicacion: 'El autopilot gestiona el 90% del vuelo: mantiene altitud, velocidad, rumbo y sigue la ruta programada. Puede incluso aterrizar (autoland ILS Cat III). Los pilotos supervisan, toman decisiones y manejan emergencias. No es prescindible: es un asistente.',
    },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La cabina de un avion moderno tiene miles de botones, pantallas y controles. Estos son los <strong>4 instrumentos basicos</strong> que todo piloto necesita.</p>
      </div>

      {/* Instrumentos */}
      <div className={styles.instrumentosGrid}>
        {instrumentos.map((inst, i) => (
          <div
            key={i}
            className={`${styles.instrumentoCard} ${instrumentoActivo === i ? styles.instrumentoActivo : ''}`}
            onClick={() => setInstrumentoActivo(instrumentoActivo === i ? null : i)}
            role="button"
            tabIndex={0}
            aria-expanded={instrumentoActivo === i}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setInstrumentoActivo(instrumentoActivo === i ? null : i); }}
          >
            <div className={styles.instrumentoHeader}>
              <span className={styles.instrumentoIcono} aria-hidden="true">{inst.icono}</span>
              <h3 className={styles.instrumentoNombre}>{inst.nombre}</h3>
            </div>
            <p className={styles.instrumentoFuncion}>{inst.funcion}</p>
            {instrumentoActivo === i && (
              <p className={styles.instrumentoDetalle}>{inst.detalle}</p>
            )}
            <span className={styles.instrumentoToggle} aria-hidden="true">
              {instrumentoActivo === i ? '▲' : '▼'}
            </span>
          </div>
        ))}
      </div>

      {/* Curiosidades */}
      <h3 className={styles.curiosidadesTitulo}>Curiosidades del vuelo</h3>
      <div className={styles.curiosidadesGrid}>
        {curiosidades.map((c, i) => (
          <div key={i} className={styles.curiosidadCard}>
            <span className={styles.curiosidadIcono} aria-hidden="true">{c.icono}</span>
            <h4 className={styles.curiosidadTitulo}>{c.titulo}</h4>
            <p className={styles.curiosidadTexto}>{c.explicacion}</p>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          Un piloto de linea aerea necesita mas de <strong>1.500 horas de vuelo</strong> para obtener la licencia ATPL.
          La formacion dura 2-3 anos e incluye teoria, simulador y vuelo real. Cada 6 meses se someten a examenes
          medicos y pruebas de competencia en simulador.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorAnatomiaVueloPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('vuela');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'vuela': return <SeccionVuela />;
      case 'fases': return <SeccionFases />;
      case 'madrid': return <SeccionMadridLondres />;
      case 'cabina': return <SeccionCabina />;
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
          <h1 className={styles.title}>Anatomia de un Vuelo</h1>
          <p className={styles.subtitle}>Como vuela un avion, las fases del vuelo y datos reales de un Madrid-Londres</p>
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
          title="Mas sobre aviacion"
          subtitle="Preguntas frecuentes sobre como vuelan los aviones"
          defaultOpen={false}
        >
          <h3>Es seguro volar?</h3>
          <p>
            El avion es el <strong>medio de transporte mas seguro</strong> del mundo por kilometro recorrido.
            La probabilidad de un accidente fatal es de 1 entre 11 millones de vuelos. Conduces un coche
            con un riesgo miles de veces mayor cada dia.
          </p>

          <h3>Que pasa si falla un motor?</h3>
          <p>
            Los aviones comerciales estan disenados para volar con un solo motor. De hecho, una de las pruebas
            de certificacion es demostrar que el avion puede despegar, volar y aterrizar con un motor inoperativo.
            Los pilotos practican esta situacion regularmente en simulador.
          </p>

          <h3>Por que hay turbulencias?</h3>
          <p>
            Las turbulencias son movimientos irregulares del aire causados por corrientes termicas, cambios de
            viento (jet stream) o el relieve del terreno. Son molestas pero rara vez peligrosas. El avion esta
            disenado para soportar fuerzas muy superiores a cualquier turbulencia normal.
          </p>

          <h3>Que es la caja negra?</h3>
          <p>
            En realidad son <strong>dos cajas naranjas</strong>: el FDR (Flight Data Recorder) graba
            parametros del vuelo (altitud, velocidad, posicion de controles) y el CVR (Cockpit Voice Recorder)
            graba las conversaciones en cabina. Resisten impactos de 3.400 G, fuego a 1.100 °C durante 1 hora
            y sumersion a 6.000 m de profundidad.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador simplifica conceptos de aerodinamica y aviacion con fines
            educativos. La fisica del vuelo real es mas compleja e incluye factores como la compresibilidad
            del aire, capas limite, efectos de sustentacion por angulo de ataque (Newton) ademas de Bernoulli, etc.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-anatomia-vuelo')} />
        <ShareCard appName="visualizador-anatomia-vuelo" />
        <Footer appName="visualizador-anatomia-vuelo" />
      </div>
    </>
  );
}
