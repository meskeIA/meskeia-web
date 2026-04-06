'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './VisualizadorSistemaElectoral.module.css';
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
// Secciones del explicador
// ─────────────────────────────────────────────

type Seccion = 'votos' | 'dhondt' | 'sistemas' | 'circunscripciones';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'votos', titulo: 'Los votos', icono: '🗳️', subtitulo: 'Cómo se vota y qué pasa con tu papeleta' },
  { id: 'dhondt', titulo: 'D\'Hondt', icono: '📊', subtitulo: 'Cómo se reparten los escaños en España' },
  { id: 'sistemas', titulo: 'Otros sistemas', icono: '🌍', subtitulo: 'Mismos votos, resultados muy diferentes' },
  { id: 'circunscripciones', titulo: 'Circunscripciones', icono: '🗺️', subtitulo: 'Por qué la geografía importa tanto' },
];

// ─────────────────────────────────────────────
// Datos de ejemplo (4 partidos, 7 escaños)
// ─────────────────────────────────────────────

interface Partido {
  nombre: string;
  votos: number;
  color: string;
  siglas: string;
}

const PARTIDOS: Partido[] = [
  { nombre: 'Partido Azul', votos: 340000, color: '#2E86AB', siglas: 'PA' },
  { nombre: 'Partido Rojo', votos: 280000, color: '#e74c3c', siglas: 'PR' },
  { nombre: 'Partido Verde', votos: 160000, color: '#27ae60', siglas: 'PV' },
  { nombre: 'Partido Naranja', votos: 120000, color: '#f39c12', siglas: 'PN' },
];

const TOTAL_VOTOS = PARTIDOS.reduce((sum, p) => sum + p.votos, 0);
const ESCANOS = 7;

// ─────────────────────────────────────────────
// Sección 1: Los votos
// ─────────────────────────────────────────────

function SeccionVotos() {
  const censo = 1200000;
  const participacion = 0.75;
  const votantes = censo * participacion;
  const blancos = 12000;
  const nulos = 8000;
  const validos = votantes - blancos - nulos;

  const etapas = [
    { icono: '📋', titulo: 'Censo electoral', valor: formatNumber(censo, 0), desc: 'Personas con derecho a voto en esta circunscripción' },
    { icono: '🚶', titulo: 'Van a votar', valor: `${formatNumber(votantes, 0)} (${formatNumber(participacion * 100, 0)}%)`, desc: 'No todo el censo vota — la abstención es un factor clave' },
    { icono: '✉️', titulo: 'Votos emitidos', valor: formatNumber(votantes, 0), desc: 'Incluye votos a partidos, en blanco y nulos' },
  ];

  const desglose = [
    { tipo: 'Votos a partidos', valor: validos, pct: (validos / votantes) * 100, color: '#2E86AB' },
    { tipo: 'Votos en blanco', valor: blancos, pct: (blancos / votantes) * 100, color: '#B0B0B0' },
    { tipo: 'Votos nulos', valor: nulos, pct: (nulos / votantes) * 100, color: '#e74c3c' },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Todo empieza con el <strong>censo electoral</strong>: la lista de personas con derecho a voto.
          El día de las elecciones, cada votante elige una papeleta y la introduce en la urna.</p>
      </div>

      {/* Flujo del voto */}
      <div className={styles.flujoVertical}>
        {etapas.map((e, i) => (
          <div key={i}>
            <div className={styles.flujoItem}>
              <span className={styles.flujoIcono} aria-hidden="true">{e.icono}</span>
              <div className={styles.flujoTexto}>
                <span className={styles.flujoTitulo}>{e.titulo}</span>
                <span className={styles.flujoValor}>{e.valor}</span>
                <span className={styles.flujoDesc}>{e.desc}</span>
              </div>
            </div>
            {i < etapas.length - 1 && <div className={styles.flujoFlecha} aria-hidden="true">↓</div>}
          </div>
        ))}
      </div>

      {/* Desglose */}
      <h3 className={styles.seccionSubtitulo}>¿Qué se cuenta?</h3>
      <div className={styles.desgloseGrid}>
        {desglose.map((d, i) => (
          <div key={i} className={styles.desgloseCard}>
            <div className={styles.desgloseBarra}>
              <div className={styles.desgloseRelleno} style={{ width: `${d.pct}%`, background: d.color }} />
            </div>
            <span className={styles.desgloseTipo}>{d.tipo}</span>
            <span className={styles.desgloseValor}>{formatNumber(d.valor, 0)}</span>
            <span className={styles.desglosePct}>{formatNumber(d.pct, 1)}%</span>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          Solo los <strong>votos válidos a candidaturas</strong> se usan para repartir escaños.
          Los votos en blanco cuentan como válidos pero no van a ningún partido.
          Los nulos (papeleta mal rellenada, varios votos en un sobre...) no se cuentan para nada.
        </p>
      </div>

      <div className={styles.preguntaCard}>
        <span className={styles.preguntaIcono} aria-hidden="true">🤔</span>
        <p>Pero tener más votos no garantiza más escaños. El <strong>método de reparto</strong> y
          la <strong>circunscripción</strong> donde votas importan tanto como el número de votos.
          Veamos cómo funciona.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: D'Hondt
// ─────────────────────────────────────────────

interface DhondtRonda {
  ronda: number;
  cocientes: number[];
  ganador: number;
  escanosPorPartido: number[];
}

function SeccionDhondt() {
  const [rondaActiva, setRondaActiva] = useState(ESCANOS);

  const rondas = useMemo((): DhondtRonda[] => {
    const resultado: DhondtRonda[] = [];
    const escanos = [0, 0, 0, 0];

    for (let r = 1; r <= ESCANOS; r++) {
      const cocientes = PARTIDOS.map((p, i) => p.votos / (escanos[i] + 1));
      const ganador = cocientes.indexOf(Math.max(...cocientes));
      escanos[ganador]++;
      resultado.push({
        ronda: r,
        cocientes: [...cocientes],
        ganador,
        escanosPorPartido: [...escanos],
      });
    }
    return resultado;
  }, []);

  const resultadoFinal = rondas[ESCANOS - 1].escanosPorPartido;

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>España usa la <strong>ley D&apos;Hondt</strong> para repartir escaños. ¿Cómo funciona?
          Se dividen los votos de cada partido entre 1, 2, 3... y se van asignando escaños al
          <strong> cociente más alto</strong> en cada ronda.</p>
      </div>

      {/* Votos iniciales */}
      <h3 className={styles.seccionSubtitulo}>Ejemplo: {formatNumber(TOTAL_VOTOS, 0)} votos → {ESCANOS} escaños</h3>
      <div className={styles.partidosGrid}>
        {PARTIDOS.map((p, i) => (
          <div key={i} className={styles.partidoCard}>
            <div className={styles.partidoColor} style={{ background: p.color }} />
            <span className={styles.partidoSiglas}>{p.siglas}</span>
            <span className={styles.partidoVotos}>{formatNumber(p.votos, 0)} votos</span>
            <span className={styles.partidoPct}>{formatNumber((p.votos / TOTAL_VOTOS) * 100, 1)}%</span>
          </div>
        ))}
      </div>

      {/* Selector de ronda */}
      <div className={styles.sliderZona}>
        <div className={styles.sliderHeader}>
          <label className={styles.sliderLabel}>Ronda de asignación</label>
          <span className={styles.sliderValor}>{rondaActiva} de {ESCANOS}</span>
        </div>
        <input
          type="range"
          className={styles.slider}
          min={1}
          max={ESCANOS}
          value={rondaActiva}
          onChange={(e) => setRondaActiva(parseInt(e.target.value))}
          aria-label={`Ronda de asignación: ${rondaActiva} de ${ESCANOS}`}
        />
      </div>

      {/* Tabla D'Hondt */}
      <div className={styles.tablaContainer}>
        <table className={styles.tablaDhondt} role="table">
          <thead>
            <tr>
              <th>Divisor</th>
              {PARTIDOS.map((p, i) => (
                <th key={i} style={{ color: p.color }}>{p.siglas}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.max(...rondas[rondaActiva - 1].escanosPorPartido) + 1 }, (_, d) => d + 1)
              .slice(0, 4)
              .map(divisor => {
                const cocientes = PARTIDOS.map(p => p.votos / divisor);
                // Determinar cuáles de estos cocientes ya fueron "usados" (asignaron escaño)
                const asignados = rondas.slice(0, rondaActiva).map(r => ({
                  ganador: r.ganador,
                  cociente: r.cocientes[r.ganador],
                }));

                return (
                  <tr key={divisor}>
                    <td className={styles.tablaDivisor}>÷ {divisor}</td>
                    {cocientes.map((c, i) => {
                      const esGanador = asignados.some(
                        a => a.ganador === i && Math.abs(a.cociente - c) < 1
                      );
                      return (
                        <td
                          key={i}
                          className={`${styles.tablaCociente} ${esGanador ? styles.tablaGanador : ''}`}
                          style={esGanador ? { borderColor: PARTIDOS[i].color } : undefined}
                        >
                          {formatNumber(c, 0)}
                          {esGanador && <span className={styles.tablaCheck} aria-hidden="true">✓</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Rondas paso a paso */}
      <div className={styles.rondasLista}>
        {rondas.slice(0, rondaActiva).map(r => (
          <div key={r.ronda} className={styles.rondaItem}>
            <span className={styles.rondaNum}>Ronda {r.ronda}</span>
            <div className={styles.rondaContenido}>
              <span className={styles.rondaGanador} style={{ color: PARTIDOS[r.ganador].color }}>
                → Escaño para {PARTIDOS[r.ganador].siglas}
              </span>
              <span className={styles.rondaCociente}>
                (cociente: {formatNumber(r.cocientes[r.ganador], 0)})
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Resultado final */}
      <h3 className={styles.seccionSubtitulo}>Resultado final</h3>
      <div className={styles.hemiciclo}>
        {PARTIDOS.map((p, i) => (
          <div
            key={i}
            className={styles.hemicicloSegmento}
            style={{
              width: `${(resultadoFinal[i] / ESCANOS) * 100}%`,
              background: p.color,
            }}
          >
            {resultadoFinal[i] > 0 && (
              <span className={styles.hemicicloTexto}>{p.siglas}: {resultadoFinal[i]}</span>
            )}
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          D&apos;Hondt <strong>favorece ligeramente a los partidos grandes</strong>. El Partido Azul tiene
          el {formatNumber((PARTIDOS[0].votos / TOTAL_VOTOS) * 100, 1)}% de los votos pero se lleva
          el {formatNumber((resultadoFinal[0] / ESCANOS) * 100, 1)}% de los escaños.
          Los partidos pequeños necesitan proporcionalmente más votos para obtener representación.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Otros sistemas
// ─────────────────────────────────────────────

interface SistemaElectoral {
  nombre: string;
  pais: string;
  bandera: string;
  descripcion: string;
  escanos: number[];
  explicacion: string;
}

function SeccionSistemas() {
  const sistemas: SistemaElectoral[] = [
    {
      nombre: 'Proporcional (D\'Hondt)',
      pais: 'España',
      bandera: '🇪🇸',
      descripcion: 'Los escaños se reparten proporcionalmente a los votos, con ligera ventaja para los partidos grandes.',
      escanos: [3, 2, 1, 1],
      explicacion: 'Azul y Rojo dominan, pero Verde y Naranja obtienen representación.',
    },
    {
      nombre: 'Mayoritario (FPTP)',
      pais: 'Reino Unido',
      bandera: '🇬🇧',
      descripcion: 'Gana el candidato con más votos en cada distrito. "El primero se lo lleva todo."',
      escanos: [5, 2, 0, 0],
      explicacion: 'Azul arrasa en distritos. Verde y Naranja se quedan sin escaños pese a tener el 31% de los votos.',
    },
    {
      nombre: 'Mixto (MMP)',
      pais: 'Alemania',
      bandera: '🇩🇪',
      descripcion: 'Mitad de escaños por distritos (mayoritario), mitad por lista (proporcional). Busca equilibrar ambos sistemas.',
      escanos: [3, 2, 1, 1],
      explicacion: 'Resultado similar al proporcional gracias a la compensación por listas.',
    },
    {
      nombre: 'Proporcional puro (Hare)',
      pais: 'Países Bajos',
      bandera: '🇳🇱',
      descripcion: 'Cada partido recibe escaños exactamente proporcionales a sus votos. Sin umbrales ni correcciones.',
      escanos: [3, 2, 1, 1],
      explicacion: 'El reparto más fiel a los votos. Partidos pequeños siempre obtienen representación.',
    },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Los mismos <strong>{formatNumber(TOTAL_VOTOS, 0)} votos</strong> pueden dar resultados
          muy diferentes según el sistema electoral. Veamos cómo se repartirían los <strong>{ESCANOS} escaños</strong>
          con cada método.</p>
      </div>

      <div className={styles.sistemasGrid}>
        {sistemas.map((s, idx) => (
          <div key={idx} className={styles.sistemaCard}>
            <div className={styles.sistemaHeader}>
              <span className={styles.sistemaBandera} aria-hidden="true">{s.bandera}</span>
              <div>
                <span className={styles.sistemaNombre}>{s.nombre}</span>
                <span className={styles.sistemaPais}>{s.pais}</span>
              </div>
            </div>
            <p className={styles.sistemaDesc}>{s.descripcion}</p>

            {/* Barra de escaños */}
            <div className={styles.hemiciclo}>
              {PARTIDOS.map((p, i) => (
                s.escanos[i] > 0 && (
                  <div
                    key={i}
                    className={styles.hemicicloSegmento}
                    style={{
                      width: `${(s.escanos[i] / ESCANOS) * 100}%`,
                      background: p.color,
                    }}
                  >
                    <span className={styles.hemicicloTexto}>{p.siglas}: {s.escanos[i]}</span>
                  </div>
                )
              ))}
            </div>

            <p className={styles.sistemaExplicacion}>{s.explicacion}</p>
          </div>
        ))}
      </div>

      {/* Comparativa resumen */}
      <div className={styles.comparativaResumen}>
        <h3 className={styles.seccionSubtitulo}>¿Quién gana y quién pierde?</h3>
        <div className={styles.comparativaGrid}>
          {PARTIDOS.map((p, i) => {
            const votoPct = (p.votos / TOTAL_VOTOS) * 100;
            const escanosDhondt = sistemas[0].escanos[i];
            const escanosFPTP = sistemas[1].escanos[i];
            return (
              <div key={i} className={styles.comparativaCard}>
                <div className={styles.comparativaColor} style={{ background: p.color }} />
                <span className={styles.comparativaSiglas}>{p.siglas}</span>
                <span className={styles.comparativaVoto}>{formatNumber(votoPct, 1)}% votos</span>
                <div className={styles.comparativaLinea}>
                  <span>D&apos;Hondt:</span>
                  <strong>{escanosDhondt} escaños ({formatNumber((escanosDhondt / ESCANOS) * 100, 1)}%)</strong>
                </div>
                <div className={styles.comparativaLinea}>
                  <span>FPTP:</span>
                  <strong>{escanosFPTP} escaños ({formatNumber((escanosFPTP / ESCANOS) * 100, 1)}%)</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          <strong>No existe un sistema electoral &quot;perfecto&quot;.</strong> El proporcional da voz a más partidos
          pero puede dificultar formar gobierno. El mayoritario produce mayorías claras pero
          deja sin representación a millones de votantes. Cada país elige según su historia y prioridades.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Circunscripciones
// ─────────────────────────────────────────────

interface Provincia {
  nombre: string;
  escanos: number;
  poblacion: number;
  tipo: 'grande' | 'media' | 'pequena';
}

function SeccionCircunscripciones() {
  const provincias: Provincia[] = [
    { nombre: 'Madrid', escanos: 37, poblacion: 6750000, tipo: 'grande' },
    { nombre: 'Barcelona', escanos: 32, poblacion: 5740000, tipo: 'grande' },
    { nombre: 'Valencia', escanos: 16, poblacion: 2570000, tipo: 'grande' },
    { nombre: 'Sevilla', escanos: 12, poblacion: 1950000, tipo: 'grande' },
    { nombre: 'Málaga', escanos: 11, poblacion: 1700000, tipo: 'media' },
    { nombre: 'Murcia', escanos: 10, poblacion: 1530000, tipo: 'media' },
    { nombre: 'Vizcaya', escanos: 8, poblacion: 1160000, tipo: 'media' },
    { nombre: 'Zaragoza', escanos: 7, poblacion: 980000, tipo: 'media' },
    { nombre: 'Ávila', escanos: 3, poblacion: 158000, tipo: 'pequena' },
    { nombre: 'Soria', escanos: 2, poblacion: 89000, tipo: 'pequena' },
    { nombre: 'Teruel', escanos: 3, poblacion: 134000, tipo: 'pequena' },
    { nombre: 'Segovia', escanos: 3, poblacion: 153000, tipo: 'pequena' },
  ];

  const costeMadrid = Math.round(6750000 / 37);
  const costeSoria = Math.round(89000 / 2);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>En España, los votos no se cuentan a nivel nacional. <strong>Cada provincia es una
          circunscripción</strong> con un número fijo de escaños. Esto tiene consecuencias enormes.</p>
      </div>

      {/* Regla de los 2 mínimos */}
      <div className={styles.reglaCard}>
        <span className={styles.reglaIcono} aria-hidden="true">📏</span>
        <div>
          <h4 className={styles.reglaTitulo}>La regla de los 2 mínimos</h4>
          <p className={styles.reglaTexto}>
            Cada provincia tiene garantizados <strong>al menos 2 escaños</strong>, independientemente de su
            población. Los restantes (hasta 350 en total para el Congreso) se reparten proporcionalmente
            a la población. Ceuta y Melilla: 1 escaño cada una.
          </p>
        </div>
      </div>

      {/* Grid de provincias */}
      <h3 className={styles.seccionSubtitulo}>Ejemplos: provincias grandes vs pequeñas</h3>
      <div className={styles.provinciaGrid}>
        {provincias.map((p, i) => {
          const costeEscano = Math.round(p.poblacion / p.escanos);
          return (
            <div
              key={i}
              className={`${styles.provinciaCard} ${styles[`provincia_${p.tipo}`]}`}
            >
              <span className={styles.provinciaNombre}>{p.nombre}</span>
              <div className={styles.provinciaDatos}>
                <span className={styles.provinciaEscanos}>{p.escanos} escaños</span>
                <span className={styles.provinciaPoblacion}>{formatNumber(p.poblacion, 0)} hab.</span>
              </div>
              <div className={styles.provinciaCoste}>
                <span className={styles.provinciaCosteLabel}>Coste por escaño</span>
                <span className={styles.provinciaCosteValor}>{formatNumber(costeEscano, 0)} hab.</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparativa dramática */}
      <div className={styles.comparativaDramatica}>
        <div className={styles.dramaticaItem}>
          <span className={styles.dramaticaIcono} aria-hidden="true">🏙️</span>
          <span className={styles.dramaticaLabel}>Madrid</span>
          <span className={styles.dramaticaValor}>{formatNumber(costeMadrid, 0)} hab/escaño</span>
        </div>
        <div className={styles.dramaticaVs}>vs</div>
        <div className={styles.dramaticaItem}>
          <span className={styles.dramaticaIcono} aria-hidden="true">🌾</span>
          <span className={styles.dramaticaLabel}>Soria</span>
          <span className={styles.dramaticaValor}>{formatNumber(costeSoria, 0)} hab/escaño</span>
        </div>
      </div>

      <div className={styles.preguntaCard}>
        <span className={styles.preguntaIcono} aria-hidden="true">🤔</span>
        <p>
          Un escaño en Soria &quot;cuesta&quot; <strong>{formatNumber(costeSoria, 0)} habitantes</strong>,
          mientras que en Madrid cuesta <strong>{formatNumber(costeMadrid, 0)}</strong>.
          Esto significa que <strong>el voto de un soriano &quot;pesa&quot; {formatNumber(costeMadrid / costeSoria, 1)} veces
          más</strong> que el de un madrileño en términos de representación.
        </p>
      </div>

      {/* Efecto en los resultados */}
      <div className={styles.efectoGrid}>
        <div className={styles.efectoCard}>
          <span className={styles.efectoIcono} aria-hidden="true">📈</span>
          <h4 className={styles.efectoTitulo}>Partidos grandes ganan</h4>
          <p className={styles.efectoTexto}>
            En provincias pequeñas (2-5 escaños), solo los partidos con más votos obtienen
            representación. Los pequeños se quedan fuera.
          </p>
        </div>
        <div className={styles.efectoCard}>
          <span className={styles.efectoIcono} aria-hidden="true">🎯</span>
          <h4 className={styles.efectoTitulo}>Partidos regionalistas ganan</h4>
          <p className={styles.efectoTexto}>
            Un partido que concentra todos sus votos en 2-3 provincias puede obtener más
            escaños que uno con votos dispersos por toda España.
          </p>
        </div>
        <div className={styles.efectoCard}>
          <span className={styles.efectoIcono} aria-hidden="true">❌</span>
          <h4 className={styles.efectoTitulo}>Partidos medianos pierden</h4>
          <p className={styles.efectoTexto}>
            Un partido con el 15% de los votos repartido uniformemente puede conseguir
            muchos menos escaños que los que le corresponderían proporcionalmente.
          </p>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          El sistema electoral español no es solo D&apos;Hondt — es <strong>D&apos;Hondt aplicado
          provincia a provincia</strong>. Esto crea un doble efecto: el método ya favorece a los
          grandes, y las circunscripciones pequeñas lo amplifican. El resultado es un sistema
          que tiende al bipartidismo, especialmente fuera de las grandes ciudades.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorSistemaElectoralPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('votos');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'votos': return <SeccionVotos />;
      case 'dhondt': return <SeccionDhondt />;
      case 'sistemas': return <SeccionSistemas />;
      case 'circunscripciones': return <SeccionCircunscripciones />;
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
          <h1 className={styles.title}>Cómo Funciona una Elección</h1>
          <p className={styles.subtitle}>De los votos a los escaños — paso a paso</p>
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
          title="Lo que no te cuentan sobre las elecciones"
          subtitle="Conceptos clave para entender el sistema electoral español"
          defaultOpen={false}
        >
          <h3>¿Por qué D&apos;Hondt y no otro sistema?</h3>
          <p>
            España adoptó el sistema D&apos;Hondt en la Transición (1977) como solución de compromiso.
            Los partidos grandes querían estabilidad (gobernar sin coaliciones complicadas) y los
            pequeños querían representación. D&apos;Hondt ofrece proporcionalidad con un sesgo hacia
            los grandes que facilita la gobernabilidad.
          </p>

          <h3>El umbral del 3%</h3>
          <p>
            En España, un partido necesita al menos el 3% de los votos válidos en una circunscripción
            para entrar en el reparto de escaños. En la práctica, en las provincias pequeñas el umbral
            &quot;real&quot; es mucho más alto — puede necesitar un 20-30% para obtener un solo escaño.
          </p>

          <h3>¿El Senado funciona igual?</h3>
          <p>
            No. El Senado español usa un sistema mayoritario: en cada provincia se eligen los 3-4
            candidatos más votados individualmente. Esto hace que el Senado tenga una composición
            muy diferente al Congreso, generalmente más favorable al partido que gana en más provincias.
          </p>

          <h3>¿Se puede cambiar el sistema?</h3>
          <p>
            Sí, pero es difícil. La LOREG (Ley Orgánica del Régimen Electoral General) de 1985
            regula el sistema. Cambiarla requiere mayoría absoluta en el Congreso. Propuestas como
            ampliar a 400 diputados, crear una circunscripción nacional, o cambiar a Sainte-Laguë
            se debaten periódicamente pero no han prosperado.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador simplifica el sistema electoral con fines educativos.
            El sistema real incluye barreras electorales, coaliciones, voto por correo, voto exterior
            (CERA), la Junta Electoral Central, y otros mecanismos que afectan al resultado final.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-sistema-electoral')} />
        <ShareCard appName="visualizador-sistema-electoral" />
        <Footer appName="visualizador-sistema-electoral" />
      </div>
    </>
  );
}
