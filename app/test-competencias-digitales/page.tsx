'use client';
// @disclaimer: exempt

import { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './TestCompetenciasDigitales.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatDate } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  AREAS,
  COMPETENCIAS,
  TRAMOS,
  TRAMO_VALOR,
  PERFILES,
  ORDEN_TRAMOS,
  competenciasDeArea,
  tramoDesdeValor,
  valorATramo,
  nombreTramo,
  type TramoId,
} from './digcomp';

const KEY_RESP = 'meskeia-digcomp-respuestas';
const KEY_PERFIL = 'meskeia-digcomp-perfil';
const KEY_HIST = 'meskeia-digcomp-historial';

interface Medicion {
  fecha: string; // ISO
  perfilId: string;
  media: number;
  respondidas: number;
}

// Etiqueta de la opción "todavía no" (valor 0)
const OPCION_CERO = 'Todavía no lo hago por mi cuenta';

export default function TestCompetenciasDigitalesPage() {
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [perfilId, setPerfilId] = useState<string>('general');
  const [historial, setHistorial] = useState<Medicion[]>([]);
  const [cargado, setCargado] = useState(false);

  const [areaActiva, setAreaActiva] = useState(0);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [aviso, setAviso] = useState('');

  // Cargar estado desde localStorage
  useEffect(() => {
    try {
      const r = localStorage.getItem(KEY_RESP);
      if (r) {
        const parsed: unknown = JSON.parse(r);
        if (parsed && typeof parsed === 'object') setRespuestas(parsed as Record<string, number>);
      }
      const p = localStorage.getItem(KEY_PERFIL);
      if (p) setPerfilId(p);
      const h = localStorage.getItem(KEY_HIST);
      if (h) {
        const parsed: unknown = JSON.parse(h);
        if (Array.isArray(parsed)) setHistorial(parsed as Medicion[]);
      }
    } catch {
      // datos corruptos: se ignoran
    }
    setCargado(true);
  }, []);

  // Persistir respuestas y perfil
  useEffect(() => {
    if (!cargado) return;
    try {
      localStorage.setItem(KEY_RESP, JSON.stringify(respuestas));
      localStorage.setItem(KEY_PERFIL, perfilId);
    } catch {
      /* almacenamiento no disponible */
    }
  }, [respuestas, perfilId, cargado]);

  const perfil = useMemo(() => PERFILES.find((p) => p.id === perfilId) ?? PERFILES[0], [perfilId]);

  const responder = (competenciaId: string, valor: number) => {
    setRespuestas((prev) => ({ ...prev, [competenciaId]: valor }));
  };

  const respondidas = Object.keys(respuestas).length;
  const total = COMPETENCIAS.length;
  const progreso = Math.round((respondidas / total) * 100);

  // Media global sobre competencias respondidas
  const mediaGlobal = useMemo(() => {
    const valores = COMPETENCIAS.filter((c) => respuestas[c.id] !== undefined).map(
      (c) => respuestas[c.id],
    );
    if (valores.length === 0) return null;
    return valores.reduce((s, v) => s + v, 0) / valores.length;
  }, [respuestas]);

  // Estadísticas por área
  const areaStats = useMemo(() => {
    return AREAS.map((area) => {
      const comps = competenciasDeArea(area.id);
      const answered = comps.filter((c) => respuestas[c.id] !== undefined);
      const media = answered.length
        ? answered.reduce((s, c) => s + respuestas[c.id], 0) / answered.length
        : null;
      const objetivo = perfil.objetivoPorArea[area.id];
      return {
        area,
        comps,
        answeredLen: answered.length,
        media,
        objetivo,
        objetivoValor: TRAMO_VALOR[objetivo],
      };
    });
  }, [respuestas, perfil]);

  // Gaps priorizados (competencias respondidas por debajo del objetivo)
  const gaps = useMemo(() => {
    return COMPETENCIAS.filter((c) => respuestas[c.id] !== undefined)
      .map((c) => {
        const v = respuestas[c.id];
        const objetivo = perfil.objetivoPorArea[c.areaId];
        const objV = TRAMO_VALOR[objetivo];
        return { c, v, objetivo, objV, gap: objV - v };
      })
      .filter((x) => x.gap > 0)
      .sort((a, b) => b.gap - a.gap);
  }, [respuestas, perfil]);

  const irAResultados = () => {
    if (respondidas === 0) {
      setAviso('Responde al menos una competencia para ver tus resultados.');
      return;
    }
    setMostrarResultados(true);
    setAviso('');
    if (typeof window !== 'undefined') {
      // Deja que React pinte el panel antes de desplazar
      requestAnimationFrame(() => {
        document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  };

  const guardarMedicion = () => {
    if (mediaGlobal === null) return;
    const nueva: Medicion = {
      fecha: new Date().toISOString(),
      perfilId,
      media: mediaGlobal,
      respondidas,
    };
    setHistorial((prev) => {
      const actualizado = [...prev, nueva];
      try {
        localStorage.setItem(KEY_HIST, JSON.stringify(actualizado));
      } catch {
        /* almacenamiento no disponible */
      }
      return actualizado;
    });
    setAviso('Medición guardada. Vuelve dentro de unas semanas para ver tu progreso.');
  };

  const reiniciar = () => {
    setRespuestas({});
    setMostrarResultados(false);
    setAreaActiva(0);
    setAviso('Respuestas reiniciadas. Tu historial de mediciones se conserva.');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Construir Markdown del perfil
  const construirMarkdown = useCallback(() => {
    let md = '# Mi perfil de competencias digitales (DigComp)\n\n';
    md += `_Perfil objetivo: ${perfil.nombre} · ${respondidas}/${total} competencias evaluadas_\n\n`;
    if (mediaGlobal !== null) {
      const t = valorATramo(mediaGlobal);
      md += `**Nivel global aproximado:** ${t ? nombreTramo(t) : '—'}\n\n`;
    }
    areaStats.forEach((s) => {
      const t = s.media !== null ? valorATramo(s.media) : null;
      md += `## ${s.area.nombre}\n\n`;
      md += `- Nivel: ${t ? nombreTramo(t) : 'sin evaluar'} · Objetivo: ${nombreTramo(s.objetivo)}\n`;
      s.comps.forEach((c) => {
        const v = respuestas[c.id];
        if (v === undefined) return;
        const tc = tramoDesdeValor(v);
        md += `  - ${c.id} ${c.nombre}: ${v === 0 ? 'Todavía no' : nombreTramo(tc as TramoId)}\n`;
      });
      md += '\n';
    });
    if (gaps.length > 0) {
      md += `## Plan de desarrollo (prioridades)\n\n`;
      gaps.slice(0, 6).forEach((g) => {
        const nextValor = Math.min(4, g.v + 1);
        const nextTramo = tramoDesdeValor(nextValor) as TramoId;
        md += `### ${g.c.nombre}\n`;
        md += `- Siguiente paso (${nombreTramo(nextTramo)}): ${g.c.canDo[nextTramo]}\n`;
        md += `- Cómo: ${g.c.pista}\n\n`;
      });
    }
    return md;
  }, [perfil, respondidas, total, mediaGlobal, areaStats, respuestas, gaps]);

  const copiarPerfil = async () => {
    try {
      await navigator.clipboard.writeText(construirMarkdown());
      setAviso('Perfil copiado al portapapeles en formato Markdown.');
    } catch {
      setAviso('No se pudo copiar. Prueba a descargar el perfil.');
    }
  };

  const descargarPerfil = () => {
    const blob = new Blob([construirMarkdown()], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'perfil-competencias-digitales.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setAviso('Perfil descargado como perfil-competencias-digitales.md');
  };

  const areaCurrent = areaStats[areaActiva];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">📊</span> Test de Competencias Digitales
        </h1>
        <p className={styles.subtitle}>
          Autoevaluación formativa basada en el marco europeo <strong>DigComp</strong>. Descubre tu
          nivel en las 21 competencias, tus lagunas y un plan para mejorar.
        </p>
      </header>

      <LegalNotice />

      {/* Intro */}
      <section className={styles.intro}>
        <p>
          A diferencia de otros test que solo te preguntan «¿cómo de bueno eres?», aquí eliges en
          cada competencia la afirmación de <strong>«sé hacer esto»</strong> que mejor te describe
          hoy. Así calibramos mejor tu nivel real y, sobre él, te devolvemos <strong>tus lagunas y
          un plan de desarrollo</strong>. No es una credencial: es una herramienta para mejorar.
        </p>
        <p className={styles.fuente}>
          <span aria-hidden="true">📘</span> Basado en <em>DigComp 2.2</em> (Comisión Europea, JRC,
          2022). Tus respuestas se guardan solo en tu navegador.
        </p>
      </section>

      {/* Perfil objetivo */}
      <section className={styles.panel} aria-labelledby="titulo-perfil">
        <h2 id="titulo-perfil" className={styles.panelTitle}>
          <span aria-hidden="true">🎯</span> ¿Con qué objetivo te evalúas?
        </h2>
        <p className={styles.panelHint}>
          Fija el nivel objetivo de cada área según tu contexto. Compararemos tu nivel con él.
        </p>
        <div className={styles.perfilGrid} role="group" aria-label="Perfiles objetivo">
          {PERFILES.map((p) => (
            <button
              type="button"
              key={p.id}
              className={`${styles.perfilBtn} ${perfilId === p.id ? styles.perfilBtnActivo : ''}`}
              aria-pressed={perfilId === p.id}
              onClick={() => setPerfilId(p.id)}
            >
              <span className={styles.perfilIcono} aria-hidden="true">
                {p.icono}
              </span>
              <span className={styles.perfilNombre}>{p.nombre}</span>
              <span className={styles.perfilDesc}>{p.descripcion}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Instrumento por áreas */}
      <section className={styles.panel} aria-labelledby="titulo-instrumento">
        <h2 id="titulo-instrumento" className={styles.panelTitle}>
          <span aria-hidden="true">📝</span> Autoevaluación por áreas
        </h2>

        {/* Progreso */}
        <div className={styles.progreso}>
          <div className={styles.progresoBarraFondo}>
            <div className={styles.progresoBarra} style={{ width: `${progreso}%` }} />
          </div>
          <span className={styles.progresoTexto}>
            {respondidas} / {total} competencias evaluadas
          </span>
        </div>

        {/* Pestañas de área */}
        <div className={styles.areaTabs} role="group" aria-label="Áreas de competencia">
          {areaStats.map((s, i) => (
            <button
              type="button"
              key={s.area.id}
              className={`${styles.areaTab} ${areaActiva === i ? styles.areaTabActiva : ''}`}
              aria-pressed={areaActiva === i}
              onClick={() => setAreaActiva(i)}
            >
              <span aria-hidden="true">{s.area.icono}</span>
              <span className={styles.areaTabNum}>
                {s.answeredLen}/{s.comps.length}
              </span>
            </button>
          ))}
        </div>

        {/* Área activa */}
        <div className={styles.areaActual}>
          <h3 className={styles.areaNombre}>
            <span aria-hidden="true">{areaCurrent.area.icono}</span> Área {areaCurrent.area.id}.{' '}
            {areaCurrent.area.nombre}
          </h3>
          <p className={styles.areaDesc}>{areaCurrent.area.descripcion}</p>

          {areaCurrent.comps.map((c) => (
            <fieldset key={c.id} className={styles.competencia}>
              <legend className={styles.competenciaLegend}>
                {c.id} · {c.nombre}
              </legend>
              <p className={styles.competenciaDesc}>{c.descripcion}</p>
              <div className={styles.opciones}>
                <label
                  className={`${styles.opcion} ${respuestas[c.id] === 0 ? styles.opcionSel : ''}`}
                >
                  <input
                    type="radio"
                    name={`comp-${c.id}`}
                    checked={respuestas[c.id] === 0}
                    onChange={() => responder(c.id, 0)}
                  />
                  <span className={styles.opcionTexto}>
                    <span className={styles.opcionTramo}>—</span> {OPCION_CERO}
                  </span>
                </label>
                {ORDEN_TRAMOS.map((tramoId) => {
                  const valor = TRAMO_VALOR[tramoId];
                  return (
                    <label
                      key={tramoId}
                      className={`${styles.opcion} ${
                        respuestas[c.id] === valor ? styles.opcionSel : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name={`comp-${c.id}`}
                        checked={respuestas[c.id] === valor}
                        onChange={() => responder(c.id, valor)}
                      />
                      <span className={styles.opcionTexto}>
                        <span className={styles.opcionTramo}>{nombreTramo(tramoId)}</span>{' '}
                        {c.canDo[tramoId]}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}

          {/* Navegación entre áreas */}
          <div className={styles.areaNav}>
            <button
              type="button"
              className={styles.btnSecondary}
              disabled={areaActiva === 0}
              onClick={() => setAreaActiva((i) => Math.max(0, i - 1))}
            >
              <span aria-hidden="true">←</span> Área anterior
            </button>
            {areaActiva < AREAS.length - 1 ? (
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => setAreaActiva((i) => Math.min(AREAS.length - 1, i + 1))}
              >
                Siguiente área <span aria-hidden="true">→</span>
              </button>
            ) : (
              <button type="button" className={styles.btnPrimary} onClick={irAResultados}>
                <span aria-hidden="true">📊</span> Ver mis resultados
              </button>
            )}
          </div>
        </div>

        {aviso && (
          <p className={styles.aviso} role="status" aria-live="polite">
            {aviso}
          </p>
        )}

        <div className={styles.accionesGlobales}>
          <button type="button" className={styles.btnGhost} onClick={irAResultados}>
            <span aria-hidden="true">📊</span> Ver resultados
          </button>
          <button type="button" className={styles.btnGhostDanger} onClick={reiniciar}>
            <span aria-hidden="true">🔄</span> Reiniciar respuestas
          </button>
        </div>
      </section>

      {/* Resultados */}
      {mostrarResultados && mediaGlobal !== null && (
        <section id="resultados" className={styles.panel} aria-labelledby="titulo-resultados">
          <div className={styles.resultadosHeader}>
            <h2 id="titulo-resultados" className={styles.panelTitle}>
              <span aria-hidden="true">📈</span> Tus resultados
            </h2>
            <div className={styles.exportBtns}>
              <button type="button" className={styles.btnExport} onClick={copiarPerfil}>
                <span aria-hidden="true">📋</span> Copiar
              </button>
              <button type="button" className={styles.btnExport} onClick={descargarPerfil}>
                <span aria-hidden="true">⬇️</span> Descargar .md
              </button>
            </div>
          </div>

          {/* Nivel global */}
          <div className={styles.nivelGlobal}>
            <span className={styles.nivelGlobalLabel}>Nivel global aproximado</span>
            <span className={styles.nivelGlobalValor}>
              {valorATramo(mediaGlobal) ? nombreTramo(valorATramo(mediaGlobal) as TramoId) : '—'}
            </span>
            <span className={styles.nivelGlobalNota}>
              Media de {respondidas} de {total} competencias · perfil {perfil.nombre}
            </span>
          </div>

          {/* Barras por área */}
          <h3 className={styles.eduH3}>
            <span aria-hidden="true">🗂️</span> Nivel por área (vs objetivo)
          </h3>
          <div className={styles.barras}>
            {areaStats.map((s) => {
              const pct = s.media !== null ? (s.media / 4) * 100 : 0;
              const objPct = (s.objetivoValor / 4) * 100;
              const cumple = s.media !== null && s.media >= s.objetivoValor;
              return (
                <div key={s.area.id} className={styles.barraFila}>
                  <div className={styles.barraLabel}>
                    <span aria-hidden="true">{s.area.icono}</span> {s.area.nombre}
                  </div>
                  <div className={styles.barraPista}>
                    <div
                      className={`${styles.barraNivel} ${cumple ? styles.barraCumple : ''}`}
                      style={{ width: `${pct}%` }}
                    />
                    <div className={styles.barraObjetivo} style={{ left: `${objPct}%` }} aria-hidden="true" />
                  </div>
                  <div className={styles.barraValor}>
                    {s.media !== null ? nombreTramo(valorATramo(s.media) as TramoId) : 'sin evaluar'}
                    <span className={styles.barraObjetivoTxt}>· obj: {nombreTramo(s.objetivo)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Plan de desarrollo (gaps) */}
          <h3 className={styles.eduH3}>
            <span aria-hidden="true">🚀</span> Tu plan de desarrollo
          </h3>
          {gaps.length === 0 ? (
            <p className={styles.sinGaps}>
              <span aria-hidden="true">🎉</span> Todas las competencias evaluadas alcanzan tu
              objetivo. Sube de perfil o marca un objetivo más exigente para seguir creciendo.
            </p>
          ) : (
            <>
              <p className={styles.panelHint}>
                Ordenado por distancia hasta tu objetivo. Empieza por lo de arriba.
              </p>
              <div className={styles.gapsLista}>
                {gaps.slice(0, 8).map((g) => {
                  const nextValor = Math.min(4, g.v + 1);
                  const nextTramo = tramoDesdeValor(nextValor) as TramoId;
                  return (
                    <div key={g.c.id} className={styles.gapCard}>
                      <div className={styles.gapTop}>
                        <span className={styles.gapNombre}>{g.c.nombre}</span>
                        <span className={styles.gapNivel}>
                          {g.v === 0 ? 'Todavía no' : nombreTramo(tramoDesdeValor(g.v) as TramoId)}{' '}
                          <span aria-hidden="true">→</span> {nombreTramo(g.objetivo)}
                        </span>
                      </div>
                      <p className={styles.gapPaso}>
                        <strong>Siguiente paso ({nombreTramo(nextTramo)}):</strong>{' '}
                        {g.c.canDo[nextTramo]}
                      </p>
                      <p className={styles.gapPista}>
                        <span aria-hidden="true">💡</span> {g.c.pista}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Re-medición / progreso */}
          <h3 className={styles.eduH3}>
            <span aria-hidden="true">📅</span> Seguimiento de tu progreso
          </h3>
          <div className={styles.seguimiento}>
            <button type="button" className={styles.btnPrimary} onClick={guardarMedicion}>
              <span aria-hidden="true">💾</span> Guardar esta medición
            </button>
            {historial.length > 0 && (
              <ul className={styles.historialLista}>
                {historial
                  .slice()
                  .reverse()
                  .slice(0, 5)
                  .map((m, i, arr) => {
                    const anterior = arr[i + 1];
                    const delta = anterior ? m.media - anterior.media : null;
                    const t = valorATramo(m.media);
                    return (
                      <li key={m.fecha} className={styles.historialItem}>
                        <span>{formatDate(new Date(m.fecha))}</span>
                        <span>{t ? nombreTramo(t) : '—'}</span>
                        {delta !== null && (
                          <span
                            className={
                              delta > 0
                                ? styles.deltaUp
                                : delta < 0
                                  ? styles.deltaDown
                                  : styles.deltaFlat
                            }
                          >
                            {delta > 0 ? '▲' : delta < 0 ? '▼' : '='} {delta > 0 ? '+' : ''}
                            {delta.toFixed(1)}
                          </span>
                        )}
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* ── Contenido educativo v2.0 ── */}
      <EducationalSection
        icon="🎓"
        title="Guía completa: DigComp y las competencias digitales"
        subtitle="Qué es el marco, las 5 áreas, cómo interpretar tu nivel y cómo mejorar"
      >
        <section className={styles.guideSection}>
          <p>
            <strong>DigComp</strong> es el Marco Europeo de Competencias Digitales para la Ciudadanía,
            elaborado por la Comisión Europea. Su función es dar un lenguaje común para describir qué
            significa «ser competente digitalmente», más allá de saber usar un programa concreto. Su
            versión 2.2 (2022) organiza la competencia digital en <strong>5 áreas</strong> y{' '}
            <strong>21 competencias</strong>, con 8 niveles de dominio que aquí agrupamos en 4 tramos:
            Fundamental, Intermedio, Avanzado y Altamente especializado.
          </p>

          {/* 1. Tabla comparativa: las 5 áreas */}
          <h3 className={styles.eduH3}>
            <span aria-hidden="true">🗂️</span> Las 5 áreas de competencia digital
          </h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Área</th>
                  <th>De qué trata</th>
                  <th>Competencias</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>1. Información y datos</strong>
                  </td>
                  <td>Buscar, evaluar y organizar información fiable</td>
                  <td>3</td>
                </tr>
                <tr>
                  <td>
                    <strong>2. Comunicación y colaboración</strong>
                  </td>
                  <td>Interactuar, compartir, colaborar, identidad y netiqueta</td>
                  <td>6</td>
                </tr>
                <tr>
                  <td>
                    <strong>3. Creación de contenidos</strong>
                  </td>
                  <td>Crear, reelaborar, derechos de autor y programación</td>
                  <td>4</td>
                </tr>
                <tr>
                  <td>
                    <strong>4. Seguridad</strong>
                  </td>
                  <td>Proteger dispositivos, datos, salud y medioambiente</td>
                  <td>4</td>
                </tr>
                <tr>
                  <td>
                    <strong>5. Resolución de problemas</strong>
                  </td>
                  <td>Resolver fallos, elegir herramientas y usar la tecnología con creatividad</td>
                  <td>4</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. Casos de uso / perfiles */}
          <h3 className={styles.eduH3}>
            <span aria-hidden="true">💼</span> ¿Para quién es útil?
          </h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  💼
                </span>
                <h4>Quien busca empleo</h4>
              </div>
              <p className={styles.escenarioTip}>
                Detecta qué competencias digitales reforzar antes de una candidatura y prepara
                argumentos concretos para el CV y la entrevista.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  🎓
                </span>
                <h4>Estudiantes y docentes</h4>
              </div>
              <p className={styles.escenarioTip}>
                Sitúa tu punto de partida, guía tu aprendizaje y mide el progreso a lo largo del
                curso con un marco reconocido.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  🚀
                </span>
                <h4>Autónomos y emprendedores</h4>
              </div>
              <p className={styles.escenarioTip}>
                Identifica lagunas que frenan tu proyecto (crear contenido, seguridad, herramientas)
                y prioriza qué aprender primero.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  🌱
                </span>
                <h4>Iniciación digital</h4>
              </div>
              <p className={styles.escenarioTip}>
                Si empiezas o te reincorporas, el objetivo «Fundamental» te da metas alcanzables y una
                ruta clara para ganar autonomía.
              </p>
            </div>
          </div>

          {/* 3. FAQ */}
          <h3 className={styles.eduH3}>
            <span aria-hidden="true">❓</span> Preguntas frecuentes
          </h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Esto es un título o certificado oficial?</h4>
              <p>
                No. Es una herramienta formativa de autoconocimiento y desarrollo. Te ayuda a situarte
                en el marco DigComp y a saber qué mejorar, pero no expide ninguna acreditación. Para
                credenciales oficiales existen entidades y pruebas específicas.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿En qué se diferencia de la autoevaluación de Europass?</h4>
              <p>
                Europass te sitúa de forma general en 5 áreas y genera un resultado para el CV. Aquí
                bajamos al detalle de las 21 competencias, usamos afirmaciones concretas de «sé hacer
                esto» para calibrar mejor y te devolvemos un plan de desarrollo por lagunas, con
                seguimiento de tu progreso.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> <strong>Consejo:</strong> puedes usar ambas: esta
                para trabajar tus lagunas y Europass para el badge del CV.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué elegir la afirmación en lugar de una nota?</h4>
              <p>
                Porque preguntar «¿del 1 al 10, cómo de bueno eres?» invita a sobreestimarse. Elegir
                la acción concreta que sabes hacer de forma autónoma calibra mucho mejor tu nivel real
                y hace el resultado más útil.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es un «tramo» y cómo se relaciona con los 8 niveles?</h4>
              <p>
                DigComp define 8 niveles de dominio. Para que la autoevaluación sea manejable, los
                agrupamos en los 4 tramos con nombre del propio marco: Fundamental (1-2), Intermedio
                (3-4), Avanzado (5-6) y Altamente especializado (7-8).
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Tengo que llegar a «Altamente especializado» en todo?</h4>
              <p>
                No. El nivel adecuado depende de tu contexto. Para el uso general, Intermedio suele
                bastar. Por eso eliges un perfil objetivo: el plan se calcula frente a ese objetivo, no
                frente al máximo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cada cuánto conviene repetir la autoevaluación?</h4>
              <p>
                Cada 3-6 meses es un buen ritmo, o después de un periodo de aprendizaje. Guarda tus
                mediciones para ver la evolución: la mejora continua es el objetivo, no una foto
                puntual.
              </p>
            </div>
          </div>

          {/* 4. Guía paso a paso */}
          <h3 className={styles.eduH3}>
            <span aria-hidden="true">📋</span> Cómo sacarle partido paso a paso
          </h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Elige tu perfil objetivo</h4>
                <p>
                  Selecciona el contexto que mejor te representa (empleo, estudiante, teletrabajo…).
                  Fija los niveles objetivo por área con los que te compararás.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Responde con sinceridad</h4>
                <p>
                  En cada competencia elige la afirmación más alta que hoy haces por tu cuenta. Si
                  dudas, elige la inferior: el objetivo es calibrar, no aprobar.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Revisa tu radar por áreas</h4>
                <p>
                  Observa dónde superas tu objetivo y dónde te quedas corto. Las áreas por debajo del
                  objetivo son tus focos de mejora.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Prioriza con el plan de desarrollo</h4>
                <p>
                  Empieza por las competencias con mayor distancia hasta el objetivo. Cada una te dice
                  el siguiente paso concreto y cómo practicarlo.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Exporta y ponte metas</h4>
                <p>
                  Descarga tu perfil en Markdown, elige 2-3 competencias para los próximos meses y
                  busca formación o práctica para ellas.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Vuelve a medirte</h4>
                <p>
                  Pasados unos meses, repite la autoevaluación y guarda la medición. Verás tu progreso
                  y podrás ajustar el objetivo.
                </p>
              </div>
            </div>
          </div>

          {/* 5. Mejores prácticas */}
          <h3 className={styles.eduH3}>
            <span aria-hidden="true">✅</span> Buenas prácticas
          </h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🎯
              </span>
              <h4>Objetivo antes que máximo</h4>
              <p>Busca el nivel que tu contexto necesita, no el más alto en todo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔍
              </span>
              <h4>Sé honesto contigo</h4>
              <p>«Sé hacerlo por mi cuenta» es la clave: si necesitas ayuda, aún no es tu nivel.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🧩
              </span>
              <h4>Enfócate en pocas</h4>
              <p>Trabajar 2-3 competencias a la vez rinde más que dispersarte.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🛡️
              </span>
              <h4>No descuides seguridad</h4>
              <p>Es el área que más se olvida y la que más problemas evita.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                📈
              </span>
              <h4>Mide tu progreso</h4>
              <p>Guarda mediciones periódicas: ver la mejora motiva a seguir.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🤝
              </span>
              <h4>Aprende ayudando</h4>
              <p>Enseñar a otra persona una competencia consolida tu propio nivel.</p>
            </div>
          </div>

          {/* 6. Warning box */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">
                ⚠️
              </span>
              <h3>Errores al interpretar tu resultado</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong><span aria-hidden="true">❌</span> Tomarlo como una nota o un examen:</strong> es una foto orientativa para
                mejorar, no una calificación ni una credencial.
              </li>
              <li>
                <strong><span aria-hidden="true">❌</span> Sobreestimarte:</strong> marcar «Avanzado» porque «más o menos me
                defiendo». Si necesitas ayuda para hacerlo, tu tramo es el inferior.
              </li>
              <li>
                <strong><span aria-hidden="true">❌</span> Querer el máximo en todo:</strong> agota y desmotiva. El objetivo por
                contexto existe precisamente para evitarlo.
              </li>
              <li>
                <strong><span aria-hidden="true">❌</span> Confundir usar mucho con ser competente:</strong> pasar horas en redes no
                implica saber proteger tus datos o evaluar información.
              </li>
              <li>
                <strong><span aria-hidden="true">❌</span> Hacerlo una vez y olvidarlo:</strong> el valor está en repetir y ver el
                progreso, no en la primera foto.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('test-competencias-digitales')} />
      <ShareCard appName="test-competencias-digitales" />
      <Footer appName="test-competencias-digitales" />
    </div>
  );
}
