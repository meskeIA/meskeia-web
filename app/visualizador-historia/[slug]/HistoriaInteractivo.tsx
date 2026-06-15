'use client';

import { useState, useMemo } from 'react';
import styles from './Historia.module.css';
import type { HistoriaData, HitoHistoria } from '@/data/historias/types';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function formatAnio(anio: number): string {
  if (anio <= -9000) return '';
  if (anio < 0) return `${Math.abs(anio)} a.C.`;
  if (anio >= 9999) return 'Presente';
  return String(anio);
}

// ─────────────────────────────────────────
// SVG config
// ─────────────────────────────────────────

const SVG_ANCHO = 1100;
const MARGEN_IZQ = 40;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;
const FILA_ALTO = 36;
const FILA_OFFSET_Y = 24;

interface HitoEnFila extends HitoHistoria {
  fila: number;
  xI: number;
  xF: number;
  idxOriginal: number;
}

type Tab = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

// ─────────────────────────────────────────
// PanelDetalle — panel inline bajo el SVG
// ─────────────────────────────────────────

function PanelDetalle({
  hito,
  categorias,
  colores,
}: {
  hito: HitoHistoria;
  categorias: Record<string, string>;
  colores: Record<string, string>;
}) {
  const color = colores[hito.categoria] ?? hito.color;
  const catLabel = categorias[hito.categoria] ?? hito.categoria;

  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: color }}>
      <h3 className={styles.detalleTitulo} style={{ color }}>
        {hito.nombre}
      </h3>
      <p className={styles.detallePeriodo}>
        {formatAnio(hito.anioInicio)} – {formatAnio(hito.anioFin)}
      </p>
      <span className={styles.detalleCategoria} style={{ background: color }}>
        {catLabel}
      </span>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Obra icónica</h4>
          <ul className={styles.datosList}>
            {hito.obraIconica.split(', ').map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className={styles.detalleSubtitulo}>Ámbito geográfico</h4>
          <ul className={styles.infoList}>
            {hito.paises.map(p => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.contextoBox}>
        <span className={styles.contextoLabel}>Descripción completa</span>
        <p style={{ fontStyle: 'normal' }}>{hito.descripcion}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────

export default function HistoriaInteractivo({ data }: { data: HistoriaData }) {
  const [tab, setTab] = useState<Tab>('timeline');
  const [seleccionado, setSeleccionado] = useState<HitoHistoria | null>(null);
  const [detalleIdx, setDetalleIdx] = useState(0);
  const [catFiltro, setCatFiltro] = useState('todas');
  const [busqueda, setBusqueda] = useState('');

  // Para apps con períodos "hasta el presente" (anioFin = 9999), usar el año actual + 2
  // como límite visual del SVG, evitando que el eje se estire hasta el año 9999.
  const anioFinSVG = data.anioFin >= 9999 ? new Date().getFullYear() + 2 : data.anioFin;

  const calcX = (anio: number) =>
    MARGEN_IZQ + ((anio - data.anioInicio) / (anioFinSVG - data.anioInicio)) * AREA_ANCHO;

  const hitosEnFila: HitoEnFila[] = useMemo(() => {
    const finFila: number[] = [];
    return [...data.hitos]
      .map((h, i) => ({ ...h, idxOriginal: i }))
      .sort((a, b) => a.anioInicio - b.anioInicio)
      .map(h => {
        const xI = calcX(h.anioInicio);
        const xF = calcX(h.anioFin >= 9999 ? anioFinSVG : Math.min(h.anioFin, anioFinSVG));
        let fila = 0;
        while (finFila[fila] !== undefined && finFila[fila] > xI + 4) fila++;
        finFila[fila] = xF;
        return { ...h, fila, xI, xF };
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const numFilas = useMemo(
    () => Math.max(...hitosEnFila.map(h => h.fila)) + 1,
    [hitosEnFila]
  );

  const svgAlto = FILA_OFFSET_Y + numFilas * (FILA_ALTO + 8) + 30;

  const marcadores = useMemo(() => {
    const rango = anioFinSVG - data.anioInicio;
    const step = rango <= 300 ? 25 : rango <= 600 ? 50 : rango <= 1500 ? 100 : 200;
    const result: number[] = [];
    let t = Math.ceil(data.anioInicio / step) * step;
    while (t <= anioFinSVG) {
      result.push(t);
      t += step;
    }
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const hitoDetalle = data.hitos[detalleIdx];

  const hitosFiltrados = useMemo(
    () =>
      data.hitos.filter(
        h =>
          (catFiltro === 'todas' || h.categoria === catFiltro) &&
          (busqueda === '' ||
            h.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            h.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
      ),
    [data.hitos, catFiltro, busqueda]
  );

  const appKey = `visualizador-historia-${data.slug}`;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'timeline', label: 'Línea del Tiempo' },
    { id: 'detalle', label: 'Período en Detalle' },
    { id: 'comparativa', label: 'Comparativa' },
    { id: 'contexto', label: 'Contexto Histórico' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>{data.titulo}</h1>
        <p className={styles.heroSubtitle}>{data.subtitulo}</p>
        <div className={styles.heroBadge}>
          {formatAnio(data.anioInicio)} — {formatAnio(data.anioFin)}
        </div>
      </header>

      <LegalNotice />

      <div className={styles.main}>

        {/* ── Tabs nav ── */}
        <div className={styles.tabNav} role="tablist" aria-label="Secciones de la cronología">
          {tabs.map(t => (
            <button
              type="button"
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={`${styles.tabBtn} ${tab === t.id ? styles.tabBtnActivo : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ──────────────────────────────────────
            TAB 1: Línea del Tiempo
        ────────────────────────────────────── */}
        {tab === 'timeline' && (
          <div className={styles.tabContent}>
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
              <p className={styles.sectionDesc}>
                Haz clic en un período para ver sus detalles. La línea abarca de{' '}
                {formatAnio(data.anioInicio)} a {formatAnio(data.anioFin)}.
              </p>

              <div className={styles.timelineScrollWrapper}>
                <svg
                  className={styles.timelineSvg}
                  width={SVG_ANCHO}
                  height={svgAlto}
                  role="img"
                  aria-label={`Línea del tiempo: ${data.titulo}`}
                >
                  {/* Eje horizontal */}
                  <line
                    x1={MARGEN_IZQ} y1={svgAlto - 16}
                    x2={SVG_ANCHO - MARGEN_DER} y2={svgAlto - 16}
                    stroke="var(--text-muted)" strokeWidth={1}
                  />

                  {/* Marcadores de años */}
                  {marcadores.map(m => (
                    <g key={m}>
                      <line
                        x1={calcX(m)} y1={FILA_OFFSET_Y}
                        x2={calcX(m)} y2={svgAlto - 16}
                        stroke="var(--text-muted)" strokeWidth={0.5} strokeDasharray="3,4"
                      />
                      <text
                        x={calcX(m)} y={svgAlto - 4}
                        fontSize={10} fill="var(--text-muted)" textAnchor="middle"
                      >
                        {formatAnio(m)}
                      </text>
                    </g>
                  ))}

                  {/* Rectángulos de períodos */}
                  {hitosEnFila.map(h => {
                    const y = FILA_OFFSET_Y + h.fila * (FILA_ALTO + 8);
                    const w = Math.max(h.xF - h.xI, 10);
                    const esSeleccionado = seleccionado?.id === h.id;
                    const color = data.colores[h.categoria] ?? h.color;
                    return (
                      <g
                        key={h.id}
                        onClick={() =>
                          setSeleccionado(esSeleccionado ? null : data.hitos[h.idxOriginal])
                        }
                        style={{ cursor: 'pointer' }}
                        role="button"
                        aria-label={`Ver detalle: ${h.nombre}`}
                      >
                        <rect
                          x={h.xI} y={y}
                          width={w} height={FILA_ALTO}
                          rx={4}
                          fill={color}
                          opacity={esSeleccionado ? 1 : 0.8}
                          stroke={esSeleccionado ? '#fff' : 'none'}
                          strokeWidth={2}
                        />
                        {w > 50 && (
                          <text
                            x={h.xI + w / 2} y={y + FILA_ALTO / 2 + 4}
                            fontSize={9} fill="#fff" textAnchor="middle" fontWeight={600}
                            style={{ pointerEvents: 'none' }}
                          >
                            {h.nombre.length > 20 ? h.nombre.substring(0, 18) + '…' : h.nombre}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Leyenda de categorías */}
              <div className={styles.leyendaCategorias}>
                {Object.entries(data.categorias).map(([id, label]) => (
                  <span key={id} className={styles.leyendaItem}>
                    <span
                      className={styles.leyendaColor}
                      style={{ background: data.colores[id] ?? 'var(--primary)' }}
                      aria-hidden="true"
                    />
                    {label}
                  </span>
                ))}
              </div>

              {/* Panel inline al hacer clic */}
              {seleccionado && (
                <PanelDetalle
                  hito={seleccionado}
                  categorias={data.categorias}
                  colores={data.colores}
                />
              )}
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────
            TAB 2: Período en Detalle
        ────────────────────────────────────── */}
        {tab === 'detalle' && (
          <div className={styles.tabContent}>
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Período en Detalle</h2>

              <div className={styles.periodoSelector}>
                {data.hitos.map((h, i) => (
                  <button
                    type="button"
                    key={h.id}
                    className={`${styles.periodoBtn} ${i === detalleIdx ? styles.periodoBtnActivo : ''}`}
                    onClick={() => setDetalleIdx(i)}
                    style={
                      i === detalleIdx
                        ? {
                            background: data.colores[h.categoria] ?? h.color,
                            borderColor: data.colores[h.categoria] ?? h.color,
                          }
                        : {}
                    }
                    aria-label={h.nombre}
                  >
                    {formatAnio(h.anioInicio)}
                  </button>
                ))}
              </div>

              {hitoDetalle && (
                <div
                  className={styles.detalleTarjeta}
                  style={{ borderTopColor: data.colores[hitoDetalle.categoria] ?? hitoDetalle.color }}
                >
                  <div
                    className={styles.detalleTarjetaHeader}
                    style={{ background: data.colores[hitoDetalle.categoria] ?? hitoDetalle.color }}
                  >
                    <h3>{hitoDetalle.nombre}</h3>
                    <p>
                      {formatAnio(hitoDetalle.anioInicio)} –{' '}
                      {formatAnio(hitoDetalle.anioFin >= 9999 ? data.anioFin : hitoDetalle.anioFin)}
                    </p>
                    <span>{data.categorias[hitoDetalle.categoria] ?? hitoDetalle.categoria}</span>
                  </div>

                  <div className={styles.detalleTarjetaBody}>
                    <div className={styles.statsRow}>
                      <div className={styles.statBox}>
                        <span className={styles.statLabel}>Obra icónica</span>
                        <span className={styles.statValue}>
                          {hitoDetalle.obraIconica.split(',')[0].trim()}
                        </span>
                      </div>
                      <div className={styles.statBox}>
                        <span className={styles.statLabel}>Ámbito</span>
                        <span className={styles.statValue}>{hitoDetalle.paises[0]}</span>
                      </div>
                      <div className={styles.statBox}>
                        <span className={styles.statLabel}>Categoría</span>
                        <span className={styles.statValue}>
                          {data.categorias[hitoDetalle.categoria] ?? hitoDetalle.categoria}
                        </span>
                      </div>
                    </div>

                    <div className={styles.contextoBox}>
                      <span className={styles.contextoLabel}>Descripción del período</span>
                      <p style={{ fontStyle: 'normal' }}>{hitoDetalle.descripcion}</p>
                    </div>

                    <div className={styles.lineaIconica}>
                      <span className={styles.lineaIconicaLabel}>Hito o obra icónica</span>
                      <p>{hitoDetalle.obraIconica}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.navBtns}>
                <button
                  type="button"
                  className={styles.btnAnterior}
                  onClick={() => setDetalleIdx(i => Math.max(0, i - 1))}
                  disabled={detalleIdx === 0}
                  aria-label="Período anterior"
                >
                  ← Anterior
                </button>
                <span className={styles.navCounter}>{detalleIdx + 1} / {data.hitos.length}</span>
                <button
                  type="button"
                  className={styles.btnSiguiente}
                  onClick={() => setDetalleIdx(i => Math.min(data.hitos.length - 1, i + 1))}
                  disabled={detalleIdx === data.hitos.length - 1}
                  aria-label="Período siguiente"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────
            TAB 3: Comparativa
        ────────────────────────────────────── */}
        {tab === 'comparativa' && (
          <div className={styles.tabContent}>
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Comparativa</h2>

              <div className={styles.filtroCategoria}>
                <button
                  className={`${styles.filtroCatBtn} ${catFiltro === 'todas' ? styles.filtroCatBtnActivo : ''}`}
                  onClick={() => setCatFiltro('todas')}
                  style={
                    catFiltro === 'todas'
                      ? { background: 'var(--primary)', borderColor: 'var(--primary)', color: '#fff' }
                      : {}
                  }
                >
                  Todos
                </button>
                {Object.entries(data.categorias).map(([id, label]) => (
                  <button
                    type="button"
                    key={id}
                    className={`${styles.filtroCatBtn} ${catFiltro === id ? styles.filtroCatBtnActivo : ''}`}
                    onClick={() => setCatFiltro(id)}
                    style={
                      catFiltro === id
                        ? {
                            background: data.colores[id] ?? 'var(--primary)',
                            borderColor: data.colores[id] ?? 'var(--primary)',
                            color: '#fff',
                          }
                        : {}
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>

              <input
                type="search"
                className={styles.buscadorInput}
                placeholder="Buscar por período, obra icónica o descripción..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                aria-label={`Buscar en ${data.titulo}`}
              />

              <div className={styles.tableWrapper}>
                <table className={styles.comparativaTable}>
                  <thead>
                    <tr>
                      <th>Período</th>
                      <th>Rango</th>
                      <th>Categoría</th>
                      <th>Obra icónica</th>
                      <th>Ámbito</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hitosFiltrados.map((h, i) => (
                      <tr
                        key={h.id}
                        style={i % 2 === 0 ? { background: `${data.colores[h.categoria] ?? h.color}18` } : {}}
                      >
                        <td>
                          <strong style={{ color: data.colores[h.categoria] ?? h.color }}>
                            {h.nombre}
                          </strong>
                        </td>
                        <td>
                          {formatAnio(h.anioInicio)} — {formatAnio(h.anioFin >= 9999 ? data.anioFin : h.anioFin)}
                        </td>
                        <td>
                          <span
                            className={styles.badgeCategoria}
                            style={{
                              background: `${data.colores[h.categoria] ?? h.color}22`,
                              color: data.colores[h.categoria] ?? h.color,
                            }}
                          >
                            {data.categorias[h.categoria] ?? h.categoria}
                          </span>
                        </td>
                        <td>{h.obraIconica.split(',')[0].trim()}</td>
                        <td>{h.paises.join(', ')}</td>
                      </tr>
                    ))}
                    {hitosFiltrados.length === 0 && (
                      <tr>
                        <td colSpan={5} className={styles.sinResultados}>
                          Sin resultados para la búsqueda actual.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────
            TAB 4: Contexto Histórico
        ────────────────────────────────────── */}
        {tab === 'contexto' && (
          <div className={styles.tabContent}>
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
              <p className={styles.sectionDesc}>
                Períodos e hitos organizados en {data.eras.length} grandes eras históricas.
              </p>

              <div className={styles.erasGrid}>
                {data.eras.map((era, i) => {
                  const hitosEra = era.hitosDestacados
                    .map(nombre => data.hitos.find(h => h.nombre === nombre))
                    .filter(Boolean) as HitoHistoria[];

                  return (
                    <div key={i} className={styles.eraCard}>
                      <div className={styles.eraHeader}>
                        <span className={styles.eraIcono} aria-hidden="true">{era.icono}</span>
                        <div>
                          <h3 className={styles.eraNombre}>{era.nombre}</h3>
                          <span className={styles.eraRango}>
                            {formatAnio(era.desde)} – {era.hasta === 9999 ? 'hoy' : formatAnio(era.hasta)}
                          </span>
                        </div>
                      </div>

                      {hitosEra.length > 0 && (
                        <div className={styles.eraEstilos}>
                          {hitosEra.map(h => (
                            <span
                              key={h.id}
                              className={styles.eraEstiloBadge}
                              style={{
                                background: `${data.colores[h.categoria] ?? h.color}1A`,
                                color: data.colores[h.categoria] ?? h.color,
                                borderColor: `${data.colores[h.categoria] ?? h.color}55`,
                              }}
                            >
                              {h.nombre}
                            </span>
                          ))}
                        </div>
                      )}

                      {era.eventos.length > 0 && (
                        <ul className={styles.eraEventos}>
                          {era.eventos.map((ev, j) => (
                            <li key={j} className={styles.eraEvento}>
                              <span className={styles.eraEventoTexto}>{ev}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Sección educativa ── */}
        <EducationalSection title={`Guía completa: ${data.titulo}`} subtitle={data.subtitulo}>
          <p>{data.educativo.intro}</p>

          {data.educativo.tablaComparativa.length > 0 && (
            <>
              <h3>Períodos clave en perspectiva</h3>
              <div className={styles.tableWrapper}>
                <table className={styles.comparativaTable}>
                  <thead>
                    <tr>
                      <th>Período</th>
                      <th>Fecha</th>
                      <th>Categoría</th>
                      <th>Figura clave</th>
                      <th>Aportación principal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.educativo.tablaComparativa.map((row, i) => (
                      <tr key={i}>
                        <td><strong>{row.hito}</strong></td>
                        <td>{row.periodo}</td>
                        <td>{row.categoria}</td>
                        <td>{row.personaje}</td>
                        <td>{row.aportacion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {data.educativo.escenarios.length > 0 && (
            <>
              <h3>¿Para quién es útil esta cronología?</h3>
              <div className={styles.escenariosGrid}>
                {data.educativo.escenarios.map((esc, i) => (
                  <div key={i} className={styles.escenarioCard}>
                    <span className={styles.escenarioIcon} aria-hidden="true">{esc.icono}</span>
                    <div>
                      <strong>{esc.titulo}</strong>
                      <em style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {esc.perfil}
                      </em>
                      <p>{esc.texto}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <h3>Preguntas frecuentes</h3>
          <ul className={styles.faqList}>
            {data.educativo.faq.map((item, i) => (
              <li key={i} className={styles.faqItem}>
                <strong>{item.pregunta}</strong>
                <p>{item.respuesta}</p>
                {item.tip && <span className={styles.faqTip}>{item.tip}</span>}
              </li>
            ))}
          </ul>

          <h3>Cómo explorar esta cronología paso a paso</h3>
          <ol className={styles.stepGuide}>
            {data.educativo.pasos.map((paso, i) => (
              <li key={i} className={styles.step}>
                <span className={styles.stepNumber}>{i + 1}</span>
                <div className={styles.stepContent}>
                  <strong>{paso.titulo}</strong>
                  <p>{paso.cuerpo}</p>
                </div>
              </li>
            ))}
          </ol>

          <h3>Consejos para sacar más partido a la cronología</h3>
          <div className={styles.tipsGrid}>
            {data.educativo.tips.map((tip, i) => (
              <div key={i} className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">{tip.icono}</span>
                <p>{tip.texto}</p>
              </div>
            ))}
          </div>

          <div className={styles.warningBox}>
            <strong><span aria-hidden="true">⚠️</span> Errores comunes al entender {data.titulo}</strong>
            <ul>
              {data.educativo.errores.map((err, i) => (
                <li key={i}>
                  <strong>{err.titulo}</strong> — {err.cuerpo}
                </li>
              ))}
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps(appKey)} />
        <ShareCard appName={appKey} />
        <Footer appName={appKey} />
      </div>
    </div>
  );
}
