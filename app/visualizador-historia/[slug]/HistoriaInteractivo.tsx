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

const SVG_ANCHO = 900;
const MARGEN_IZQ = 90;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;
const FILA_ALTO = 46;
const FILA_PADDING = 6;

interface HitoEnFila extends HitoHistoria {
  fila: number;
  xI: number;
  xF: number;
  idxOriginal: number;
}

type Tab = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

// ─────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────

export default function HistoriaInteractivo({ data }: { data: HistoriaData }) {
  const [tab, setTab] = useState<Tab>('timeline');
  const [hitoIdx, setHitoIdx] = useState(0);
  const [catFiltro, setCatFiltro] = useState('todas');
  const [busqueda, setBusqueda] = useState('');

  const calcX = (anio: number) =>
    MARGEN_IZQ + ((anio - data.anioInicio) / (data.anioFin - data.anioInicio)) * AREA_ANCHO;

  const hitosEnFila: HitoEnFila[] = useMemo(() => {
    const finFila: number[] = [];
    return [...data.hitos]
      .map((h, i) => ({ ...h, idxOriginal: i }))
      .sort((a, b) => a.anioInicio - b.anioInicio)
      .map(h => {
        const xI = calcX(h.anioInicio);
        const xF = calcX(Math.min(h.anioFin >= 9999 ? data.anioFin : h.anioFin, data.anioFin));
        let fila = 0;
        while (finFila[fila] !== undefined && finFila[fila] > xI + 2) fila++;
        finFila[fila] = xF;
        return { ...h, fila, xI, xF };
      });
  }, [data]);

  const numFilas = useMemo(
    () => Math.max(...hitosEnFila.map(h => h.fila)) + 1,
    [hitosEnFila]
  );

  const SVG_ALTO = 50 + numFilas * FILA_ALTO + 44;

  const ticks = useMemo(() => {
    const rango = data.anioFin - data.anioInicio;
    const step = rango <= 300 ? 25 : rango <= 600 ? 50 : rango <= 1500 ? 100 : 200;
    const ticks: number[] = [];
    let t = Math.ceil(data.anioInicio / step) * step;
    while (t <= data.anioFin) {
      ticks.push(t);
      t += step;
    }
    return ticks;
  }, [data]);

  const hitoActual = data.hitos[hitoIdx];

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

  // ─── Render ─────────────────────────────

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

      {/* Tabs */}
      <div className={styles.tabsContainer} role="tablist" aria-label="Secciones de la cronología">
        {(['timeline', 'detalle', 'comparativa', 'contexto'] as Tab[]).map(t => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={`${styles.tabBtn} ${tab === t ? styles.tabBtnActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'timeline' && '📅 Línea del Tiempo'}
            {t === 'detalle' && '🔍 Detalle'}
            {t === 'comparativa' && '📊 Comparativa'}
            {t === 'contexto' && '🏛️ Contexto'}
          </button>
        ))}
      </div>

      {/* ── TAB: TIMELINE ── */}
      {tab === 'timeline' && (
        <div className={styles.tabContent}>
          <p className={styles.tabHint}>
            Haz clic en un período para ver su detalle ·{' '}
            <strong>{data.hitos.length} períodos</strong> ·{' '}
            {Math.abs(data.anioFin - data.anioInicio)} años
          </p>
          <div className={styles.svgWrapper}>
            <svg
              viewBox={`0 0 ${SVG_ANCHO} ${SVG_ALTO}`}
              className={styles.svgTimeline}
              aria-label={`Línea del tiempo: ${data.titulo}`}
              role="img"
            >
              {/* Eje X */}
              <line
                x1={MARGEN_IZQ} y1={SVG_ALTO - 32}
                x2={SVG_ANCHO - MARGEN_DER} y2={SVG_ALTO - 32}
                stroke="var(--text-muted)" strokeWidth="1"
              />

              {/* Ticks */}
              {ticks.map(anio => {
                const x = calcX(anio);
                return (
                  <g key={anio}>
                    <line
                      x1={x} y1={SVG_ALTO - 37}
                      x2={x} y2={SVG_ALTO - 27}
                      stroke="var(--text-muted)" strokeWidth="1"
                    />
                    <text
                      x={x} y={SVG_ALTO - 12}
                      textAnchor="middle" fontSize="10" fill="var(--text-muted)"
                    >
                      {formatAnio(anio)}
                    </text>
                  </g>
                );
              })}

              {/* Hitos */}
              {hitosEnFila.map(h => {
                const y = 20 + h.fila * FILA_ALTO;
                const ancho = Math.max(h.xF - h.xI, 8);
                const seleccionado = h.idxOriginal === hitoIdx;
                return (
                  <g
                    key={h.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => { setHitoIdx(h.idxOriginal); setTab('detalle'); }}
                    role="button"
                    aria-label={`Ver detalle: ${h.nombre}`}
                  >
                    <rect
                      x={h.xI}
                      y={y}
                      width={ancho}
                      height={FILA_ALTO - FILA_PADDING * 2}
                      rx={4}
                      fill={h.color}
                      opacity={seleccionado ? 1 : 0.82}
                      stroke={seleccionado ? '#ffffff' : 'transparent'}
                      strokeWidth={seleccionado ? 2 : 0}
                    />
                    {ancho > 55 && (
                      <text
                        x={h.xI + ancho / 2}
                        y={y + (FILA_ALTO - FILA_PADDING * 2) / 2 + 4}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#ffffff"
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                      >
                        {h.nombre.length > 20 ? h.nombre.substring(0, 18) + '…' : h.nombre}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* ── TAB: DETALLE ── */}
      {tab === 'detalle' && (
        <div className={styles.tabContent}>
          <div className={styles.detalleSelector}>
            <button
              className={styles.navBtn}
              onClick={() => setHitoIdx(i => Math.max(0, i - 1))}
              disabled={hitoIdx === 0}
              aria-label="Período anterior"
            >
              ←
            </button>
            <select
              value={hitoIdx}
              onChange={e => setHitoIdx(Number(e.target.value))}
              className={styles.hitoSelect}
              aria-label="Seleccionar período"
            >
              {data.hitos.map((h, i) => (
                <option key={h.id} value={i}>
                  {formatAnio(h.anioInicio)} · {h.nombre}
                </option>
              ))}
            </select>
            <button
              className={styles.navBtn}
              onClick={() => setHitoIdx(i => Math.min(data.hitos.length - 1, i + 1))}
              disabled={hitoIdx === data.hitos.length - 1}
              aria-label="Período siguiente"
            >
              →
            </button>
          </div>

          {hitoActual && (
            <div className={styles.detalleCard} style={{ borderLeftColor: hitoActual.color }}>
              <div className={styles.detalleHeader} style={{ backgroundColor: hitoActual.color }}>
                <h2 className={styles.detalleNombre}>{hitoActual.nombre}</h2>
                <span className={styles.detallePeriodo}>
                  {formatAnio(hitoActual.anioInicio)} —{' '}
                  {formatAnio(hitoActual.anioFin >= 9999 ? data.anioFin : hitoActual.anioFin)}
                </span>
              </div>
              <div className={styles.detalleBody}>
                <p className={styles.detalleDescripcion}>{hitoActual.descripcion}</p>
                <div className={styles.detalleGrid}>
                  <div className={styles.detalleMetaItem}>
                    <span className={styles.detalleMetaLabel}>🏆 Hito o obra icónica</span>
                    <span className={styles.detalleMetaValor}>{hitoActual.obraIconica}</span>
                  </div>
                  <div className={styles.detalleMetaItem}>
                    <span className={styles.detalleMetaLabel}>🌍 Ámbito geográfico</span>
                    <span className={styles.detalleMetaValor}>{hitoActual.paises.join(', ')}</span>
                  </div>
                  <div className={styles.detalleMetaItem}>
                    <span className={styles.detalleMetaLabel}>📂 Categoría</span>
                    <span
                      className={styles.detalleMetaValor}
                      style={{ color: data.colores[hitoActual.categoria] ?? hitoActual.color }}
                    >
                      {data.categorias[hitoActual.categoria] ?? hitoActual.categoria}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: COMPARATIVA ── */}
      {tab === 'comparativa' && (
        <div className={styles.tabContent}>
          <div className={styles.filterRow}>
            <input
              type="search"
              placeholder="Buscar período…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className={styles.searchInput}
              aria-label="Buscar períodos históricos"
            />
            <select
              value={catFiltro}
              onChange={e => setCatFiltro(e.target.value)}
              className={styles.categoryFilter}
              aria-label="Filtrar por categoría"
            >
              <option value="todas">Todas las categorías</option>
              {Object.entries(data.categorias).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          </div>

          <div className={styles.comparativaGrid}>
            {hitosFiltrados.map(h => (
              <div
                key={h.id}
                className={styles.comparativaCard}
                style={{ borderTopColor: h.color }}
                onClick={() => {
                  setHitoIdx(data.hitos.findIndex(x => x.id === h.id));
                  setTab('detalle');
                }}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setHitoIdx(data.hitos.findIndex(x => x.id === h.id));
                    setTab('detalle');
                  }
                }}
              >
                <div className={styles.compCardHeader}>
                  <span className={styles.compCardNombre}>{h.nombre}</span>
                  <span className={styles.compCardPeriodo}>
                    {formatAnio(h.anioInicio)} — {formatAnio(h.anioFin >= 9999 ? data.anioFin : h.anioFin)}
                  </span>
                </div>
                <p className={styles.compCardDesc}>
                  {h.descripcion.length > 130 ? h.descripcion.substring(0, 128) + '…' : h.descripcion}
                </p>
                <div className={styles.compCardMeta}>
                  <span
                    className={styles.compCat}
                    style={{
                      backgroundColor: (data.colores[h.categoria] ?? h.color) + '22',
                      color: data.colores[h.categoria] ?? h.color,
                    }}
                  >
                    {data.categorias[h.categoria] ?? h.categoria}
                  </span>
                  <span className={styles.compPaises}>{h.paises.slice(0, 2).join(', ')}</span>
                </div>
              </div>
            ))}
            {hitosFiltrados.length === 0 && (
              <p className={styles.sinResultados}>No hay períodos que coincidan con la búsqueda.</p>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: CONTEXTO ── */}
      {tab === 'contexto' && (
        <div className={styles.tabContent}>
          <div className={styles.erasGrid}>
            {data.eras.map((era, i) => (
              <div key={i} className={styles.eraCard}>
                <div className={styles.eraHeader}>
                  <span className={styles.eraIcono} aria-hidden="true">{era.icono}</span>
                  <div>
                    <h3 className={styles.eraNombre}>{era.nombre}</h3>
                    <span className={styles.eraPeriodo}>
                      {formatAnio(era.desde)} — {formatAnio(era.hasta)}
                    </span>
                  </div>
                </div>
                {era.hitosDestacados.length > 0 && (
                  <div className={styles.eraHitos}>
                    {era.hitosDestacados.map((nombre, j) => (
                      <span key={j} className={styles.eraHitoBadge}>{nombre}</span>
                    ))}
                  </div>
                )}
                {era.eventos.length > 0 && (
                  <ul className={styles.eraEventos}>
                    {era.eventos.map((ev, j) => <li key={j}>{ev}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECCIÓN EDUCATIVA ── */}
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
                  <span className={styles.escenarioIcono} aria-hidden="true">{esc.icono}</span>
                  <strong>{esc.titulo}</strong>
                  <em>{esc.perfil}</em>
                  <p>{esc.texto}</p>
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
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores comunes al entender {data.titulo}</strong>
          </div>
          <ul className={styles.warningList}>
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
  );
}
