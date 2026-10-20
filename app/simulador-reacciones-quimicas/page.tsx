'use client';
// @disclaimer: exempt

import { useState, useRef } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import ZonaHerramienta from '@/components/ZonaHerramienta';
import { formatNumber } from '@/lib';
import styles from './SimuladorReaccionesQuimicas.module.css';
import {
  REACCIONES,
  calcularEstequiometria,
  calcularLimitante,
  sobrante,
  type FilaResultado,
  type ResultadoLimitante,
  type TipoReaccion,
  type Unidad,
} from './motor';
import CasosAula from './CasosAula';
import type { ConfiguracionCalculadora } from './casos';

type Tab = 'catalogo' | 'estequiometria' | 'limitante';

const TIPOS_INFO: Record<TipoReaccion, { icono: string; patron: string; descripcion: string }> = {
  'síntesis': { icono: '🔗', patron: 'A + B → AB', descripcion: 'Dos o más sustancias se combinan para formar una sola más compleja.' },
  'descomposición': { icono: '🔀', patron: 'AB → A + B', descripcion: 'Una sustancia se divide en dos o más sustancias más simples.' },
  'desplazamiento-simple': { icono: '🔄', patron: 'A + BC → AC + B', descripcion: 'Un elemento desplaza a otro elemento de un compuesto.' },
  'desplazamiento-doble': { icono: '⇄', patron: 'AB + CD → AD + CB', descripcion: 'Los cationes de dos compuestos iónicos intercambian sus aniones.' },
  'combustión': { icono: '🔥', patron: 'CₓHᵧ + O₂ → CO₂ + H₂O', descripcion: 'Un combustible reacciona con oxígeno liberando energía calórica.' },
  'redox': { icono: '⚡', patron: 'Oxidante + Reductor → ...', descripcion: 'Transferencia de electrones: un reactivo se oxida y otro se reduce.' },
};

const BADGE_TIPO: Record<TipoReaccion, string> = {
  'síntesis': styles.badgeSintesis,
  'descomposición': styles.badgeDescomposicion,
  'desplazamiento-simple': styles.badgeDesplSimple,
  'desplazamiento-doble': styles.badgeDesplDoble,
  'combustión': styles.badgeCombustion,
  'redox': styles.badgeRedox,
};

const LABEL_TIPO: Record<TipoReaccion, string> = {
  'síntesis': 'Síntesis',
  'descomposición': 'Descomposición',
  'desplazamiento-simple': 'Despl. Simple',
  'desplazamiento-doble': 'Despl. Doble',
  'combustión': 'Combustión',
  'redox': 'Redox / Á-B',
};

export default function SimuladorReaccionesQuimicas() {
  // Se abre en la CALCULADORA, no en el catálogo: el <h1>, el title y la metadata prometen
  // «Calculadora de estequiometría y reactivo limitante», y se aterrizaba en una lista de 20
  // tarjetas — la primera cifra estaba a cinco interacciones y a ~600 px de scroll en móvil
  // (hallazgo 114 del Inspector).
  /**
   * Referencias a los dos bloques de resultado, para llevar la vista hasta ellos.
   *
   * La tabla se inserta DEBAJO del botón Calcular, que es el último elemento del panel. En
   * móvil —donde además el teclado virtual acaba de ocupar media pantalla— el resultado
   * nacía fuera de vista: pulsar parecía no hacer nada. Medido por el Inspector: de 246 px
   * de tabla quedaban visibles 6,9. Es el candidato directo a la estancia media de 21,8 s
   * de esta app (hallazgo 113).
   */
  const stoicResultadoRef = useRef<HTMLDivElement>(null);
  const limResultadoRef = useRef<HTMLDivElement>(null);

  /** Lleva la vista al resultado recién calculado, respetando a quien prefiere no animar. */
  const irAlResultado = (ref: React.RefObject<HTMLDivElement | null>) => {
    requestAnimationFrame(() => {
      const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      ref.current?.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: 'nearest' });
    });
  };

  const [tab, setTab] = useState<Tab>('estequiometria');

  // Catálogo
  const [filtro, setFiltro] = useState<TipoReaccion | 'todas'>('todas');
  const [expandida, setExpandida] = useState<string | null>(null);

  // Estequiometría
  const [stoicId, setStoicId] = useState(REACCIONES[0].id);
  const [stoicSustIdx, setStoicSustIdx] = useState(0);
  const [stoicCant, setStoicCant] = useState('');
  const [stoicUnidad, setStoicUnidad] = useState<Unidad>('gramos');
  const [stoicResultado, setStoicResultado] = useState<FilaResultado[] | null>(null);
  const [stoicError, setStoicError] = useState('');

  // Reactivo limitante
  const [limId, setLimId] = useState(REACCIONES[0].id);
  const [limUnidad, setLimUnidad] = useState<Unidad>('gramos');
  const [limCants, setLimCants] = useState<Record<number, string>>({});
  const [limResultado, setLimResultado] = useState<ResultadoLimitante | null>(null);
  const [limError, setLimError] = useState('');

  const stoicReaccion = REACCIONES.find(r => r.id === stoicId) ?? REACCIONES[0];
  const limReaccion = REACCIONES.find(r => r.id === limId) ?? REACCIONES[0];

  function calcStoic() {
    setStoicError('');
    setStoicResultado(null);
    const cant = parseFloat(stoicCant.replace(',', '.'));
    if (isNaN(cant) || cant <= 0) { setStoicError('Introduce una cantidad positiva.'); return; }
    setStoicResultado(calcularEstequiometria(stoicReaccion, stoicSustIdx, cant, stoicUnidad));
    irAlResultado(stoicResultadoRef);
  }

  function calcLimite() {
    setLimError('');
    setLimResultado(null);
    const reactivos = limReaccion.sustancias.filter(s => s.esReactivo);
    const cants = reactivos.map((_, i) => {
      const val = parseFloat((limCants[i] ?? '').replace(',', '.'));
      return val;
    });
    if (cants.some(v => isNaN(v) || v <= 0)) { setLimError('Introduce cantidades positivas para todos los reactivos.'); return; }
    setLimResultado(calcularLimitante(limReaccion, cants, limUnidad));
    irAlResultado(limResultadoRef);
  }

  /** Lleva las pestañas a la vista tras cargar un caso, que se elige más abajo en la página. */
  const pestanasRef = useRef<HTMLElement>(null);

  /**
   * «Cargar en la calculadora» de los Casos para clase: abre la pestaña del caso y escribe su
   * reacción y sus gramos. No calcula: pulsar Calcular es el paso con que el alumno comprueba.
   */
  function cargarCaso(c: ConfiguracionCalculadora) {
    if (c.pestana === 'estequiometria') {
      setStoicId(c.reaccionId);
      setStoicSustIdx(c.sustanciaIdx);
      setStoicUnidad('gramos');
      setStoicCant(String(c.gramos));
      setStoicResultado(null);
      setStoicError('');
    } else {
      setLimId(c.reaccionId);
      setLimUnidad('gramos');
      setLimCants(Object.fromEntries(c.gramosReactivos.map((g, i) => [i, String(g)])));
      setLimResultado(null);
      setLimError('');
    }
    setTab(c.pestana);
    requestAnimationFrame(() => {
      const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      pestanasRef.current?.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: 'start' });
    });
  }

  const reaccionesFiltradas = filtro === 'todas' ? REACCIONES : REACCIONES.filter(r => r.tipo === filtro);
  const TODOS_TIPOS = Object.keys(TIPOS_INFO) as TipoReaccion[];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Simulador de Reacciones Químicas</h1>
        <p>Estequiometría y reactivo limitante — 20 reacciones reales con cálculos numéricos</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <ZonaHerramienta app="simulador-reacciones-quimicas">
        <nav ref={pestanasRef} className={styles.tabBar} aria-label="Secciones del simulador" role="tablist">
          {(['catalogo', 'estequiometria', 'limitante'] as Tab[]).map(t => (
            <button
              type="button"
              key={t}
              role="tab"
              id={`tab-${t}`}
              aria-selected={tab === t}
              // Solo la activa: los paneles se montan bajo demanda, así que apuntar a los
              // otros dos dejaría un aria-controls colgando de un id que no existe.
              aria-controls={tab === t ? `panel-${t}` : undefined}
              // Solo la pestaña activa entra en el orden de tabulación: dentro de un tablist
              // se navega con las flechas, no con Tab (patrón ARIA de pestañas).
              tabIndex={tab === t ? 0 : -1}
              onKeyDown={e => {
                const orden: Tab[] = ['catalogo', 'estequiometria', 'limitante'];
                const i = orden.indexOf(t);
                if (e.key === 'ArrowRight') setTab(orden[(i + 1) % orden.length]);
                if (e.key === 'ArrowLeft') setTab(orden[(i - 1 + orden.length) % orden.length]);
                if (e.key === 'Home') setTab(orden[0]);
                if (e.key === 'End') setTab(orden[orden.length - 1]);
              }}
              className={`${styles.tabBtn} ${tab === t ? styles.tabActive : ''}`}
              onClick={() => setTab(t)}
            >
              <span aria-hidden="true">{t === 'catalogo' ? '📋' : t === 'estequiometria' ? '⚖️' : '🎯'}</span>{' '}
              {t === 'catalogo' ? 'Catálogo' : t === 'estequiometria' ? 'Estequiometría' : 'Reactivo Límite'}
            </button>
          ))}
        </nav>

        {/* TAB 1 — CATÁLOGO */}
        {tab === 'catalogo' && (
          <div role="tabpanel" id="panel-catalogo" aria-labelledby="tab-catalogo">
            <div className={styles.filtros}>
              <button type="button" className={`${styles.filtroBtn} ${filtro === 'todas' ? styles.filtroActivo : ''}`} onClick={() => setFiltro('todas')} aria-pressed={filtro === 'todas'}>
                Todas ({REACCIONES.length})
              </button>
              {TODOS_TIPOS.map(t => (
                <button
                  type="button"
                  key={t}
                  className={`${styles.filtroBtn} ${filtro === t ? styles.filtroActivo : ''}`}
                  onClick={() => setFiltro(t)}
                  aria-pressed={filtro === t}
                >
                  <span aria-hidden="true">{TIPOS_INFO[t].icono}</span>{' '}{LABEL_TIPO[t]} ({REACCIONES.filter(r => r.tipo === t).length})
                </button>
              ))}
            </div>

            <div className={styles.reaccionesGrid}>
              {reaccionesFiltradas.map(r => (
                <div key={r.id} className={styles.reaccionCard}>
                  <div
                    className={styles.reaccionHeader}
                    onClick={() => setExpandida(expandida === r.id ? null : r.id)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={expandida === r.id}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();   // el espacio, si no, hace scroll de página
                        setExpandida(expandida === r.id ? null : r.id);
                      }
                    }}
                  >
                    <div className={styles.reaccionHeaderLeft}>
                      <p className={styles.reaccionNombre}>
                        {r.nombre}
                        <span className={`${styles.energiaBadge} ${r.energia === 'exotérmica' ? styles.exotermica : r.energia === 'endotérmica' ? styles.endotermica : styles.variable}`}>
                          {r.energia === 'exotérmica' ? '🔥 Exotérmica' : r.energia === 'endotérmica' ? '❄️ Endotérmica' : '〜 Variable'}
                        </span>
                      </p>
                      <p className={styles.ecuacion}>{r.ecuacion}</p>
                      <span className={`${styles.tipoBadge} ${BADGE_TIPO[r.tipo]}`}>{LABEL_TIPO[r.tipo]}</span>
                    </div>
                    <span className={styles.chevron}>{expandida === r.id ? '▲' : '▼'}</span>
                  </div>
                  {expandida === r.id && (
                    <div className={styles.reaccionDetalle}>
                      <p>{r.descripcion}</p>
                      <p className={styles.aplicaciones}><span aria-hidden="true">💡</span> Aplicaciones: {r.aplicaciones}</p>
                      <table className={styles.resultTable} style={{ marginTop: '0.75rem' }}>
                        <thead>
                          <tr>
                            <th>Sustancia</th>
                            <th>Fórmula</th>
                            <th>Coef.</th>
                            <th>Masa molar</th>
                          </tr>
                        </thead>
                        <tbody>
                          {r.sustancias.map((s, i) => (
                            <tr key={i}>
                              <td>{s.nombre} <span className={s.esReactivo ? styles.tagR : styles.tagP}>{s.esReactivo ? 'R' : 'P'}</span></td>
                              <td style={{ fontFamily: 'monospace' }}>{s.formula}</td>
                              <td>{s.coef}</td>
                              <td>{formatNumber(s.masa, 3)} g/mol</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2 — ESTEQUIOMETRÍA */}
        {tab === 'estequiometria' && (
          <div role="tabpanel" id="panel-estequiometria" aria-labelledby="tab-estequiometria">
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>Calculadora Estequiométrica</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Selecciona una reacción y la sustancia conocida. Introduce su cantidad en gramos o moles y obtén las cantidades de todas las demás.
              </p>

              <div className={styles.selectGroup}>
                <label htmlFor="stoicReaccion">Reacción</label>
                <select id="stoicReaccion" value={stoicId} onChange={e => { setStoicId(e.target.value); setStoicSustIdx(0); setStoicResultado(null); setStoicError(''); }}>
                  {REACCIONES.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
              </div>

              <div className={styles.ecuacionDisplay}>{stoicReaccion.ecuacion}</div>

              <div className={styles.selectGroup}>
                <label htmlFor="stoicSustancia">Sustancia conocida</label>
                <select id="stoicSustancia" value={stoicSustIdx} onChange={e => { setStoicSustIdx(Number(e.target.value)); setStoicResultado(null); }}>
                  {stoicReaccion.sustancias.map((s, i) => (
                    <option key={i} value={i}>{s.formula} — {s.nombre} ({s.esReactivo ? 'reactivo' : 'producto'})</option>
                  ))}
                </select>
              </div>

              <div className={styles.unidadToggle}>
                <button type="button" className={`${styles.unidadBtn} ${stoicUnidad === 'gramos' ? styles.unidadBtnActivo : ''}`} onClick={() => { setStoicUnidad('gramos'); setStoicResultado(null); }} aria-pressed={stoicUnidad === 'gramos'}>Gramos</button>
                <button type="button" className={`${styles.unidadBtn} ${stoicUnidad === 'moles' ? styles.unidadBtnActivo : ''}`} onClick={() => { setStoicUnidad('moles'); setStoicResultado(null); }} aria-pressed={stoicUnidad === 'moles'}>Moles</button>
              </div>

              <div className={styles.selectGroup} style={{ maxWidth: '240px' }}>
                <label>Cantidad de {stoicReaccion.sustancias[stoicSustIdx].formula} ({stoicUnidad === 'gramos' ? 'g' : 'mol'})</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={stoicCant}
                  onChange={e => setStoicCant(e.target.value)}
                  placeholder={stoicUnidad === 'gramos' ? 'gramos' : 'moles'}
                />
              </div>

              {stoicError && <p role="alert" className={styles.errorMsg}>{stoicError}</p>}
              <button type="button" className={styles.calcBtn} onClick={calcStoic}>Calcular</button>

              {stoicResultado && (
                <div role="status" aria-live="polite" ref={stoicResultadoRef}>
                <table className={styles.resultTable}>
                  <thead>
                    <tr>
                      <th>Sustancia</th>
                      <th>Coef.</th>
                      <th>Moles</th>
                      <th>Gramos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stoicResultado.map((f, i) => (
                      <tr key={i} className={f.esBase ? styles.rowBase : ''}>
                        <td>
                          {f.formula} — {f.nombre}{' '}
                          <span className={f.esReactivo ? styles.tagR : styles.tagP}>{f.esReactivo ? 'R' : 'P'}</span>
                        </td>
                        <td>{f.coef}</td>
                        <td>{formatNumber(f.moles, 4)} mol</td>
                        <td>{formatNumber(f.gramos, 3)} g</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3 — REACTIVO LIMITANTE */}
        {tab === 'limitante' && (
          <div role="tabpanel" id="panel-limitante" aria-labelledby="tab-limitante">
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>Reactivo Limitante</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Introduce la cantidad disponible de <strong>cada reactivo</strong>. El simulador encontrará cuál agota primero y calculará el rendimiento teórico de los productos.
              </p>

              <div className={styles.selectGroup}>
                <label htmlFor="limReaccion">Reacción</label>
                <select id="limReaccion" value={limId} onChange={e => { setLimId(e.target.value); setLimCants({}); setLimResultado(null); setLimError(''); }}>
                  {REACCIONES.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
              </div>

              <div className={styles.ecuacionDisplay}>{limReaccion.ecuacion}</div>

              <div className={styles.unidadToggle}>
                <button type="button" className={`${styles.unidadBtn} ${limUnidad === 'gramos' ? styles.unidadBtnActivo : ''}`} onClick={() => { setLimUnidad('gramos'); setLimResultado(null); }} aria-pressed={limUnidad === 'gramos'}>Gramos</button>
                <button type="button" className={`${styles.unidadBtn} ${limUnidad === 'moles' ? styles.unidadBtnActivo : ''}`} onClick={() => { setLimUnidad('moles'); setLimResultado(null); }} aria-pressed={limUnidad === 'moles'}>Moles</button>
              </div>

              <div className={styles.reactivosGrid}>
                {limReaccion.sustancias.filter(s => s.esReactivo).map((s, i) => (
                  <div key={i} className={styles.reactivoInput}>
                    <span className={styles.reactivoFormula} aria-hidden="true">{s.formula}</span>
                    <span className={styles.reactivoNombre}>{s.nombre}</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      aria-label={`Cantidad de ${s.formula} (${s.nombre}) en ${limUnidad}`}
                      placeholder={limUnidad === 'gramos' ? 'gramos' : 'moles'}
                      value={limCants[i] ?? ''}
                      onChange={e => setLimCants(prev => ({ ...prev, [i]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>

              {limError && <p role="alert" className={styles.errorMsg}>{limError}</p>}
              <button type="button" className={styles.calcBtn} onClick={calcLimite}>Calcular reactivo limitante</button>

              {limResultado && (
                <div role="status" aria-live="polite" ref={limResultadoRef}>
                <table className={styles.resultTable}>
                    <thead>
                      <tr>
                        <th>Sustancia</th>
                        <th>Coef.</th>
                        <th>Moles teóricos</th>
                        <th>Gramos teóricos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {limResultado.filas.map((f, i) => (
                        <tr key={i}>
                          <td>
                            {f.formula} — {f.nombre}{' '}
                            <span className={f.esReactivo ? styles.tagR : styles.tagP}>{f.esReactivo ? 'R' : 'P'}</span>
                            {f.esLimite && <span className={styles.tagLimite}> <span aria-hidden="true">⚠️</span> LÍMITE</span>}
                          </td>
                          <td>{f.coef}</td>
                          <td>{formatNumber(f.moles, 4)} mol</td>
                          <td>{formatNumber(f.gramos, 3)} g</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className={styles.resumenLimite}>
                    {limResultado.limiteIdx >= 0 ? (
                      <h4>
                        <span aria-hidden="true">⚠️</span> Reactivo limitante:{' '}
                        {limReaccion.sustancias.filter(s => s.esReactivo)[limResultado.limiteIdx].formula}
                      </h4>
                    ) : (
                      <h4>
                        <span aria-hidden="true">⚖️</span> Proporción exacta: ninguno limita
                        <span className={styles.resumenNota}>
                          {' '}— los cocientes coinciden, así que todos los reactivos se consumen
                          íntegros y no sobra ninguno.
                        </span>
                      </h4>
                    )}
                    {limResultado.excesos.map((ex, i) => {
                      if (Math.abs(ex) < 1e-9) return null;
                      const s = limReaccion.sustancias.filter(r => r.esReactivo)[i];
                      const sobra = sobrante(limReaccion, limResultado, i);
                      return (
                        <div key={i} className={styles.resumenRow}>
                          <span className={styles.resumenLabel}>{s.formula} sobrante (exceso)</span>
                          <span className={styles.resumenVal}>{formatNumber(sobra.moles, 4)} mol — {formatNumber(sobra.gramos, 3)} g</span>
                        </div>
                      );
                    })}
                    <div className={styles.resumenRow}>
                      <span className={styles.resumenLabel}>Productos obtenidos (rendimiento 100%)</span>
                      <span className={styles.resumenVal}>
                        {limResultado.filas.filter(f => !f.esReactivo).map(f => `${formatNumber(f.gramos, 2)} g ${f.formula}`).join(' + ')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        </ZonaHerramienta>

        <CasosAula onCargarEnCalculadora={cargarCaso} />

        <EducationalSection
          title="Guía de Estequiometría y Reacciones Químicas"
          subtitle="Conceptos clave, cálculos y aplicaciones reales de la química cuantitativa"
        >
          {/* Tabla comparativa */}
          <h3>Tipos de Reacción Química</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Patrón</th>
                  <th>Ejemplo real</th>
                  <th>Energía</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Síntesis</strong></td>
                  <td>A + B → AB</td>
                  <td>N₂ + 3H₂ → 2NH₃ (Haber)</td>
                  <td>Generalmente exotérmica</td>
                </tr>
                <tr>
                  <td><strong>Descomposición</strong></td>
                  <td>AB → A + B</td>
                  <td>CaCO₃ → CaO + CO₂</td>
                  <td>Generalmente endotérmica</td>
                </tr>
                <tr>
                  <td><strong>Despl. Simple</strong></td>
                  <td>A + BC → AC + B</td>
                  <td>Zn + 2HCl → ZnCl₂ + H₂</td>
                  <td>Variable</td>
                </tr>
                <tr>
                  <td><strong>Despl. Doble</strong></td>
                  <td>AB + CD → AD + CB</td>
                  <td>HCl + NaOH → NaCl + H₂O</td>
                  <td>Variable</td>
                </tr>
                <tr>
                  <td><strong>Combustión</strong></td>
                  <td>CₓHᵧ + O₂ → CO₂ + H₂O</td>
                  <td>CH₄ + 2O₂ → CO₂ + 2H₂O</td>
                  <td>Siempre exotérmica</td>
                </tr>
                <tr>
                  <td><strong>Redox</strong></td>
                  <td>Ox + Red → ...</td>
                  <td>4Fe + 3O₂ → 2Fe₂O₃</td>
                  <td>Variable</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Casos de uso */}
          <h3>Casos de Uso Reales</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>Estudiante de Bachillerato</h4>
              <p>Verifica resultados de ejercicios de estequiometría: dado que tienes 10 g de zinc y exceso de HCl, ¿cuánto H₂ se obtiene? La tab de estequiometría responde en segundos.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Laboratorio de química</h4>
              <p>Antes de un experimento, calcula cuántos gramos de cada reactivo necesitas. Con reactivo limitante, maximiza el aprovechamiento del reactivo más caro.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Industria química</h4>
              <p>En la producción de amoniaco (Haber), optimizar la relación N₂/H₂ es crítico. El cálculo de reactivo limitante determina el coste y rendimiento industrial.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Docente de química</h4>
              <p>Genera ejemplos numéricos personalizados para clase. Modifica cantidades y muestra al alumnado cómo el reactivo limitante cambia según las proporciones iniciales.</p>
            </div>
          </div>

          {/* FAQ */}
          <h3>Preguntas Frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Qué es la masa molar y cómo se usa en estequiometría?</strong>
              <p>La masa molar es la masa en gramos de un mol de sustancia (6,022×10²³ partículas). Permite convertir entre gramos (lo que pesas) y moles (lo que reacciona). Gramos ÷ masa molar = moles.</p>
              <p className={styles.faqTip}>Ejemplo: 18 g de H₂O = 18 g ÷ 18 g/mol = 1 mol de agua = 6,022×10²³ moléculas.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cómo se identifica el reactivo limitante?</strong>
              <p>Divide los moles disponibles de cada reactivo entre su coeficiente estequiométrico. El reactivo con el cociente menor es el limitante: es el que se acaba primero y determina la cantidad máxima de producto.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué es el rendimiento teórico vs el rendimiento real?</strong>
              <p>El rendimiento teórico es la cantidad máxima de producto si la reacción fuera 100% eficiente. En la práctica, el rendimiento real es menor por reacciones secundarias, pérdidas físicas o equilibrios incompletos. % rendimiento = (real/teórico) × 100.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué las ecuaciones deben estar balanceadas?</strong>
              <p>Por la ley de conservación de la masa: los átomos no se crean ni se destruyen. La ecuación balanceada garantiza que el número de átomos de cada elemento es igual en reactivos y productos.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué diferencia hay entre exotérmica y endotérmica?</strong>
              <p>En una reacción exotérmica la energía se libera (la mezcla se calienta). En una endotérmica se absorbe energía del entorno (la mezcla se enfría). La variación de entalpía ΔH es negativa (exo) o positiva (endo).</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué es el mol y por qué se usa en química?</strong>
              <p>El mol es la unidad de cantidad de materia del SI: 6,022×10²³ entidades (Número de Avogadro). Se usa porque los átomos son demasiado pequeños para contarlos. Los coeficientes de una ecuación son relaciones entre moles, no entre gramos.</p>
            </div>
          </div>

          {/* Guía paso a paso */}
          <h3>Cómo Resolver un Problema de Estequiometría — Paso a Paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Escribe y balancea la ecuación química</strong>
                <p>Identifica reactivos y productos. Ajusta los coeficientes para que el número de átomos de cada elemento sea igual en ambos lados.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Convierte la cantidad conocida a moles</strong>
                <p>Si tienes gramos: moles = gramos ÷ masa molar. Si tienes volumen de gas (condiciones normales): moles = litros ÷ 22,4 L/mol.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Aplica la relación estequiométrica</strong>
                <p>Usa los coeficientes de la ecuación balanceada como factores de conversión. Si necesitas calcular B a partir de A: moles_B = moles_A × (coef_B / coef_A).</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Convierte el resultado a la unidad deseada</strong>
                <p>Si necesitas gramos: gramos = moles × masa molar. Si tienes varios productos, calcula cada uno independientemente.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Verifica con la ley de conservación de la masa</strong>
                <p>La suma de los gramos de reactivos debe igualar la suma de los gramos de productos. Si no cuadra, hay un error en el balanceo o en el cálculo.</p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <h3>Mejores Prácticas en Cálculos Estequiométricos</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
              <div>
                <strong>El mol siempre en el centro</strong>
                <p>Todo cálculo estequiométrico pasa por moles. Gramos → moles → relación → moles → gramos. No saltes este paso.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <div>
                <strong>Balancea antes de calcular</strong>
                <p>Los coeficientes de una ecuación no balanceada dan resultados completamente erróneos. Verifica siempre el balance primero.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <div>
                <strong>Identifica el limitante con dos reactivos</strong>
                <p>Cuando tengas cantidades de dos o más reactivos, siempre comprueba cuál limita. El exceso del otro no participa en la reacción.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📏</span>
              <div>
                <strong>Cuida las unidades en cada paso</strong>
                <p>Escribe las unidades en cada operación. Si no se cancelan correctamente, hay un error en el procedimiento.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔬</span>
              <div>
                <strong>Rendimiento real casi nunca es 100%</strong>
                <p>En laboratorio, asume un rendimiento del 70-90% para estimaciones. Factores: pureza de reactivos, equilibrio, pérdidas físicas.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💡</span>
              <div>
                <strong>Las proporciones son de moles, no de gramos</strong>
                <p>CH₄ + 2O₂ → ... no significa «1 g de metano con 2 g de O₂». Significa «1 mol de CH₄ con 2 mol de O₂».</p>
              </div>
            </div>
          </div>

          {/* Warning Box */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores Frecuentes en Estequiometría
            </div>
            <ul className={styles.warningList}>
              <li>Usar una ecuación no balanceada: los coeficientes incorrectos invalidan todos los cálculos.</li>
              <li>Confundir gramos con moles: 1 mol de CO₂ (44 g) no es lo mismo que 1 g de CO₂.</li>
              <li>Ignorar el reactivo limitante: calcular el rendimiento sin comprobar quién se agota primero da resultados imposibles.</li>
              <li>Usar la masa atómica en lugar de la molar para compuestos (H₂O tiene masa molar 18, no 1+8=9).</li>
              <li>Olvidar los coeficientes al calcular masas molares de iones o fórmulas complejas (ej: 2NaCl → sumar 2 × 58,44).</li>
              <li>Asumir rendimiento del 100% en experimentos reales sin verificar pureza de reactivos ni condiciones.</li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps />
        <ShareCard appName="simulador-reacciones-quimicas" />
      </main>

      <Footer appName="simulador-reacciones-quimicas" />
    </div>
  );
}
