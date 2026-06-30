'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';
import styles from './SimuladorDisoluciones.module.css';

// ============================================================
//  DATOS
// ============================================================

interface Soluto {
  id: string;
  nombre: string;
  formula: string;
  masaMolar: number; // g/mol
  color: [number, number, number]; // RGB base del soluto disuelto
  incoloro: boolean;
}

const SOLUTOS: Soluto[] = [
  { id: 'kmno4', nombre: 'Permanganato de potasio', formula: 'KMnO₄', masaMolar: 158.03, color: [123, 45, 142], incoloro: false },
  { id: 'cuso4', nombre: 'Sulfato de cobre(II)', formula: 'CuSO₄', masaMolar: 159.61, color: [30, 111, 191], incoloro: false },
  { id: 'k2cr2o7', nombre: 'Dicromato de potasio', formula: 'K₂Cr₂O₇', masaMolar: 294.18, color: [232, 115, 42], incoloro: false },
  { id: 'nicl2', nombre: 'Cloruro de níquel(II)', formula: 'NiCl₂', masaMolar: 129.60, color: [63, 163, 77], incoloro: false },
  { id: 'nacl', nombre: 'Sal común', formula: 'NaCl', masaMolar: 58.44, color: [200, 210, 220], incoloro: true },
  { id: 'glucosa', nombre: 'Glucosa', formula: 'C₆H₁₂O₆', masaMolar: 180.16, color: [205, 200, 190], incoloro: true },
];

const SOLUTO_PERSONALIZADO: Soluto = {
  id: 'custom',
  nombre: 'Personalizado',
  formula: '—',
  masaMolar: 100,
  color: [46, 134, 171],
  incoloro: false,
};

type Modo = 'preparar' | 'diluir';

// Concentración (mol/L) a la que el color se considera "saturado" visualmente
const M_SATURACION = 1.2;

// ============================================================
//  COMPONENTE
// ============================================================

export default function SimuladorDisoluciones() {
  const [modo, setModo] = useState<Modo>('preparar');

  // --- Preparar ---
  const [solutoId, setSolutoId] = useState<string>('kmno4');
  const [masaMolarCustom, setMasaMolarCustom] = useState<number>(100);
  const [masa, setMasa] = useState<number>(10); // g
  const [volumen, setVolumen] = useState<number>(500); // mL

  // --- Diluir ---
  const [c1, setC1] = useState<number>(2); // mol/L (madre)
  const [c2, setC2] = useState<number>(0.5); // mol/L (deseada)
  const [v2, setV2] = useState<number>(250); // mL (final)

  const soluto = useMemo<Soluto>(() => {
    if (solutoId === 'custom') return { ...SOLUTO_PERSONALIZADO, masaMolar: masaMolarCustom };
    return SOLUTOS.find((s) => s.id === solutoId) ?? SOLUTOS[0];
  }, [solutoId, masaMolarCustom]);

  // Cálculos del modo preparar
  const prep = useMemo(() => {
    const litros = volumen / 1000;
    const moles = soluto.masaMolar > 0 ? masa / soluto.masaMolar : 0;
    const molaridad = litros > 0 ? moles / litros : 0;
    const gPorLitro = litros > 0 ? masa / litros : 0;
    const porcentajeMV = volumen > 0 ? (masa / volumen) * 100 : 0; // % m/v = g por 100 mL
    const ppm = litros > 0 ? (masa * 1000) / litros : 0; // mg/L
    return { litros, moles, molaridad, gPorLitro, porcentajeMV, ppm };
  }, [masa, volumen, soluto]);

  // Cálculos del modo diluir
  const dilucion = useMemo(() => {
    const valido = c1 > 0 && c2 > 0 && v2 > 0 && c2 <= c1;
    const v1 = valido ? (c2 * v2) / c1 : 0; // mL de madre
    const disolvente = valido ? v2 - v1 : 0; // mL a añadir
    const factor = c2 > 0 ? c1 / c2 : 0;
    return { valido, v1, disolvente, factor };
  }, [c1, c2, v2]);

  const handleSoluto = useCallback((id: string) => setSolutoId(id), []);

  // Opacidad del líquido en función de la concentración (mol/L)
  const opacidadPara = (molL: number): number => {
    if (soluto.incoloro) return Math.min(0.18, 0.04 + molL * 0.08);
    return Math.max(0.08, Math.min(0.92, molL / M_SATURACION));
  };

  const rgb = soluto.color;
  const colorLiquido = (molL: number) =>
    `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacidadPara(molL)})`;

  // Nivel de líquido en el vaso (0-100% de altura), cap a 1000 mL
  const nivelPrep = Math.max(8, Math.min(100, (volumen / 1000) * 100));

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Simulador de Disoluciones</h1>
        <p className={styles.subtitle}>
          Prepara una disolución ajustando el soluto y el volumen y observa cómo cambian la
          molaridad, los g/L, el % m/v y las ppm — con el color del vaso variando en tiempo real.
          Incluye el modo dilución (C₁·V₁ = C₂·V₂).
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Selector de modo */}
        <section className={styles.panel}>
          <div className={styles.modoSelector}>
            <button
              type="button"
              className={`${styles.modoBtn} ${modo === 'preparar' ? styles.modoActivo : ''}`}
              onClick={() => setModo('preparar')}
              aria-pressed={modo === 'preparar'}
            >
              <span className={styles.modoNombre}>Preparar disolución</span>
              <span className={styles.modoDesc}>Soluto + volumen → concentración</span>
            </button>
            <button
              type="button"
              className={`${styles.modoBtn} ${modo === 'diluir' ? styles.modoActivo : ''}`}
              onClick={() => setModo('diluir')}
              aria-pressed={modo === 'diluir'}
            >
              <span className={styles.modoNombre}>Diluir (C₁·V₁ = C₂·V₂)</span>
              <span className={styles.modoDesc}>De una madre a una concentración menor</span>
            </button>
          </div>
        </section>

        {/* ===== MODO PREPARAR ===== */}
        {modo === 'preparar' && (
          <>
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Soluto</h2>
              <div className={styles.solutoSelector}>
                {SOLUTOS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`${styles.solutoBtn} ${solutoId === s.id ? styles.solutoActivo : ''}`}
                    onClick={() => handleSoluto(s.id)}
                    aria-pressed={solutoId === s.id}
                  >
                    <span
                      className={styles.solutoPunto}
                      style={{ background: s.incoloro ? 'transparent' : `rgb(${s.color[0]},${s.color[1]},${s.color[2]})`, borderColor: `rgb(${s.color[0]},${s.color[1]},${s.color[2]})` }}
                      aria-hidden="true"
                    />
                    <span className={styles.solutoFormula}>{s.formula}</span>
                    <span className={styles.solutoNombre}>{s.nombre}</span>
                  </button>
                ))}
                <button
                  type="button"
                  className={`${styles.solutoBtn} ${solutoId === 'custom' ? styles.solutoActivo : ''}`}
                  onClick={() => handleSoluto('custom')}
                  aria-pressed={solutoId === 'custom'}
                >
                  <span className={styles.solutoPunto} style={{ background: 'rgb(46,134,171)', borderColor: 'rgb(46,134,171)' }} aria-hidden="true" />
                  <span className={styles.solutoFormula}>M·M</span>
                  <span className={styles.solutoNombre}>Personalizado</span>
                </button>
              </div>
              <p className={styles.masaMolarNota}>
                Masa molar: <strong>{formatNumber(soluto.masaMolar, 2)} g/mol</strong>
                {solutoId === 'custom' && (
                  <input
                    type="number"
                    className={styles.inlineInput}
                    value={masaMolarCustom}
                    min={1}
                    max={1000}
                    onChange={(e) => setMasaMolarCustom(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
                    aria-label="Masa molar personalizada en g/mol"
                  />
                )}
              </p>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Cantidades</h2>
              <div className={styles.sliderFila}>
                <label htmlFor="masa-input">
                  Masa de soluto: <strong>{formatNumber(masa, 1)} g</strong>
                </label>
                <input
                  id="masa-input"
                  type="range"
                  min={0.5}
                  max={100}
                  step={0.5}
                  value={masa}
                  onChange={(e) => setMasa(Number(e.target.value))}
                />
              </div>
              <div className={styles.sliderFila}>
                <label htmlFor="vol-input">
                  Volumen de disolución: <strong>{formatNumber(volumen, 0)} mL</strong>
                </label>
                <input
                  id="vol-input"
                  type="range"
                  min={50}
                  max={1000}
                  step={10}
                  value={volumen}
                  onChange={(e) => setVolumen(Number(e.target.value))}
                />
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.vasoLayout}>
                {/* Vaso */}
                <div className={styles.vasoWrap}>
                  <svg viewBox="0 0 120 160" className={styles.vasoSvg} role="img" aria-label="Vaso de precipitados con la disolución">
                    <path d="M20 10 L20 140 Q20 150 30 150 L90 150 Q100 150 100 140 L100 10" fill="none" stroke="var(--text-secondary)" strokeWidth="3" />
                    <rect
                      x="22"
                      y={148 - (nivelPrep / 100) * 130}
                      width="76"
                      height={(nivelPrep / 100) * 130}
                      rx="2"
                      fill={colorLiquido(prep.molaridad)}
                    />
                    <line x1="20" y1="10" x2="14" y2="10" stroke="var(--text-secondary)" strokeWidth="2" />
                  </svg>
                </div>
                {/* Resultados */}
                <div className={styles.resultadosGrid}>
                  <div className={`${styles.resultCard} ${styles.resultDestacado}`}>
                    <span className={styles.resultLabel}>Molaridad</span>
                    <span className={styles.resultValor}>{formatNumber(prep.molaridad, 3)} <small>mol/L</small></span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Moles de soluto</span>
                    <span className={styles.resultValor}>{formatNumber(prep.moles, 4)} <small>mol</small></span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Concentración másica</span>
                    <span className={styles.resultValor}>{formatNumber(prep.gPorLitro, 2)} <small>g/L</small></span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>% masa / volumen</span>
                    <span className={styles.resultValor}>{formatNumber(prep.porcentajeMV, 2)} <small>% m/v</small></span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>ppm (≈ mg/L)</span>
                    <span className={styles.resultValor}>{formatNumber(prep.ppm, 0)} <small>ppm</small></span>
                  </div>
                </div>
              </div>
              <div className={styles.formulaNota}>
                <strong>M</strong> = moles / litros = ({formatNumber(masa, 1)} g ÷ {formatNumber(soluto.masaMolar, 2)} g/mol) ÷ {formatNumber(prep.litros, 3)} L = <strong>{formatNumber(prep.molaridad, 3)} mol/L</strong>
              </div>
            </section>
          </>
        )}

        {/* ===== MODO DILUIR ===== */}
        {modo === 'diluir' && (
          <>
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Datos de la dilución</h2>
              <div className={styles.sliderFila}>
                <label htmlFor="c1-input">
                  Concentración de la disolución madre (C₁): <strong>{formatNumber(c1, 2)} mol/L</strong>
                </label>
                <input id="c1-input" type="range" min={0.1} max={5} step={0.1} value={c1} onChange={(e) => setC1(Number(e.target.value))} />
              </div>
              <div className={styles.sliderFila}>
                <label htmlFor="c2-input">
                  Concentración deseada (C₂): <strong>{formatNumber(c2, 2)} mol/L</strong>
                </label>
                <input id="c2-input" type="range" min={0.05} max={5} step={0.05} value={c2} onChange={(e) => setC2(Number(e.target.value))} />
              </div>
              <div className={styles.sliderFila}>
                <label htmlFor="v2-input">
                  Volumen final deseado (V₂): <strong>{formatNumber(v2, 0)} mL</strong>
                </label>
                <input id="v2-input" type="range" min={50} max={1000} step={10} value={v2} onChange={(e) => setV2(Number(e.target.value))} />
              </div>
            </section>

            <section className={styles.panel}>
              {dilucion.valido ? (
                <>
                  <div className={styles.dilucionFila}>
                    <div className={styles.dilucionVaso}>
                      <div className={styles.dilucionEtiqueta}>Madre · {formatNumber(c1, 2)} M</div>
                      <div className={styles.miniVaso} style={{ background: `rgba(46,134,171,${Math.min(0.9, c1 / 5)})` }} />
                      <div className={styles.dilucionDato}>Tomar <strong>{formatNumber(dilucion.v1, 1)} mL</strong></div>
                    </div>
                    <div className={styles.dilucionFlecha} aria-hidden="true">+ disolvente →</div>
                    <div className={styles.dilucionVaso}>
                      <div className={styles.dilucionEtiqueta}>Diluida · {formatNumber(c2, 2)} M</div>
                      <div className={styles.miniVaso} style={{ background: `rgba(46,134,171,${Math.min(0.9, c2 / 5)})` }} />
                      <div className={styles.dilucionDato}>Volumen final <strong>{formatNumber(v2, 0)} mL</strong></div>
                    </div>
                  </div>
                  <div className={styles.resultadosGrid}>
                    <div className={`${styles.resultCard} ${styles.resultDestacado}`}>
                      <span className={styles.resultLabel}>Volumen de madre (V₁)</span>
                      <span className={styles.resultValor}>{formatNumber(dilucion.v1, 1)} <small>mL</small></span>
                    </div>
                    <div className={styles.resultCard}>
                      <span className={styles.resultLabel}>Disolvente a añadir</span>
                      <span className={styles.resultValor}>{formatNumber(dilucion.disolvente, 1)} <small>mL</small></span>
                    </div>
                    <div className={styles.resultCard}>
                      <span className={styles.resultLabel}>Factor de dilución</span>
                      <span className={styles.resultValor}>{formatNumber(dilucion.factor, 1)}×</span>
                    </div>
                  </div>
                  <div className={styles.formulaNota}>
                    V₁ = C₂·V₂ / C₁ = ({formatNumber(c2, 2)} × {formatNumber(v2, 0)}) ÷ {formatNumber(c1, 2)} = <strong>{formatNumber(dilucion.v1, 1)} mL</strong> de madre, completados con disolvente hasta {formatNumber(v2, 0)} mL.
                  </div>
                </>
              ) : (
                <div className={styles.errorBox} role="alert">
                  La concentración deseada (C₂) debe ser <strong>menor o igual</strong> que la de la
                  disolución madre (C₁): diluyendo no se puede aumentar la concentración. Ajusta los valores.
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <EducationalSection
        title="Guía de Disoluciones"
        subtitle="Molaridad, formas de expresar la concentración y dilución"
      >
        <h3>Formas de expresar la concentración</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Unidad</th>
                <th>Qué mide</th>
                <th>Fórmula</th>
                <th>Cuándo se usa</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Molaridad (M)</td><td>Moles por litro</td><td>moles / L</td><td>Reacciones químicas (cuenta partículas)</td></tr>
              <tr><td>Concentración másica</td><td>Gramos por litro</td><td>g / L</td><td>Cuando no importan los moles</td></tr>
              <tr><td>% masa/volumen</td><td>Gramos por 100 mL</td><td>(g / mL) × 100</td><td>Disoluciones de laboratorio y farmacia</td></tr>
              <tr><td>ppm</td><td>Partes por millón (≈ mg/L)</td><td>mg soluto / L</td><td>Concentraciones muy bajas (agua, aire)</td></tr>
              <tr><td>Molalidad (m)</td><td>Moles por kg de disolvente</td><td>moles / kg</td><td>Propiedades coligativas (no depende de T)</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Casos de Uso Reales</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🧪</span>
              <strong>Laboratorio de química</strong>
            </div>
            <div className={styles.escenarioExample}>
              Preparar reactivos a una molaridad exacta es la operación más básica del laboratorio:
              casi todo experimento empieza por una disolución bien preparada y, a menudo, una dilución.
            </div>
            <div className={styles.escenarioTip}>Tip: se enrasa al final en un matraz aforado, nunca antes.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">💊</span>
              <strong>Farmacia y medicina</strong>
            </div>
            <div className={styles.escenarioExample}>
              Los sueros, las dosis intravenosas y los jarabes se expresan en % m/v o mg/mL, y muchas
              veces se preparan diluyendo un concentrado con suero fisiológico.
            </div>
            <div className={styles.escenarioTip}>Tip: un suero glucosado al 5 % m/v lleva 5 g de glucosa por 100 mL.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">💧</span>
              <strong>Calidad del agua</strong>
            </div>
            <div className={styles.escenarioExample}>
              El cloro de una piscina, el flúor del agua potable o los nitratos se miden en ppm porque
              son concentraciones muy pequeñas. Las ppm hacen manejables esos números diminutos.
            </div>
            <div className={styles.escenarioTip}>Tip: 1 ppm ≈ 1 mg por litro en agua.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🔬</span>
              <strong>Ley de Beer y colorimetría</strong>
            </div>
            <div className={styles.escenarioExample}>
              Cuanto más concentrada está una disolución coloreada, más luz absorbe. Midiendo esa
              absorción (espectrofotómetro) se determina la concentración de una muestra desconocida.
            </div>
            <div className={styles.escenarioTip}>Tip: por eso el vaso del simulador se ve más intenso al subir la molaridad.</div>
          </div>
        </div>

        <h3>Preguntas Frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Molaridad o molalidad?</h4>
            <p>
              La molaridad usa el volumen de disolución (moles/L) y es la más común, pero cambia con la
              temperatura porque el volumen se dilata. La molalidad usa la masa de disolvente (moles/kg)
              y no depende de la temperatura, por eso se prefiere en propiedades coligativas (punto de
              ebullición, congelación).
            </p>
            <p className={styles.faqTip}>En el día a día del laboratorio casi siempre se trabaja en molaridad.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué se enrasa al final y no al principio?</h4>
            <p>
              Porque al disolver el soluto el volumen total puede cambiar ligeramente. Si añades primero
              todo el disolvente y luego el soluto, no tendrás el volumen exacto. Lo correcto es disolver
              en algo menos de disolvente y después completar (enrasar) hasta la marca del aforo.
            </p>
            <p className={styles.faqTip}>Por eso se usan matraces aforados y no vasos de precipitados para medir volumen exacto.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué pasa con los moles al diluir?</h4>
            <p>
              No cambian: diluir solo añade disolvente, no soluto. Como los moles se conservan, la
              concentración baja en proporción al aumento de volumen. Esa conservación es justo lo que
              expresa C₁·V₁ = C₂·V₂ (moles antes = moles después).
            </p>
            <p className={styles.faqTip}>Si doblas el volumen, la concentración se reduce a la mitad.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Puedo concentrar una disolución añadiendo disolvente?</h4>
            <p>
              No. Añadir disolvente solo diluye (baja la concentración). Para concentrar hay que evaporar
              disolvente o añadir más soluto. Por eso el simulador no permite poner una C₂ mayor que C₁ en
              el modo dilución: sería físicamente imposible.
            </p>
            <p className={styles.faqTip}>Concentrar = quitar disolvente o añadir soluto; diluir = añadir disolvente.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cómo paso de g/L a molaridad?</h4>
            <p>
              Dividiendo entre la masa molar: molaridad (mol/L) = concentración (g/L) / masa molar (g/mol).
              Por ejemplo, 58,44 g/L de NaCl (masa molar 58,44) equivalen a 1 mol/L. Es el mismo cálculo
              que hace el simulador en el modo preparar.
            </p>
            <p className={styles.faqTip}>La masa molar es el puente entre la masa (g) y la cantidad de sustancia (mol).</p>
          </div>
        </div>

        <h3>Cómo Preparar una Disolución — Paso a Paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Calcula la masa de soluto</strong>
              <p>masa = molaridad × volumen (L) × masa molar. Es lo que necesitas pesar.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Pesa el soluto con precisión</strong>
              <p>Usa una balanza analítica. Un error al pesar se arrastra a toda la concentración.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Disuelve en poco disolvente</strong>
              <p>Añade el soluto a un vaso con algo menos del volumen final y remueve hasta disolver del todo.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Traspasa al matraz aforado y enrasa</strong>
              <p>Vierte en el matraz del volumen deseado y completa con disolvente hasta la marca de aforo.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Homogeneiza</strong>
              <p>Tapa y agita por inversión varias veces para que la concentración sea uniforme.</p>
            </div>
          </div>
        </div>

        <h3>Claves Prácticas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
            <strong>La masa molar es la clave</strong>
            <p>Convierte gramos en moles. Sin ella no puedes pasar de masa a molaridad.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧪</span>
            <strong>Enrasa al final</strong>
            <p>El volumen es el de la disolución completa, no solo el del disolvente añadido.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">➗</span>
            <strong>Recuerda C₁V₁ = C₂V₂</strong>
            <p>Sirve para cualquier dilución mientras uses las mismas unidades de concentración y volumen.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">💧</span>
            <strong>Añade ácido al agua, no al revés</strong>
            <p>Al diluir ácidos concentrados, vierte el ácido sobre el agua para evitar salpicaduras peligrosas.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔢</span>
            <strong>Vigila las unidades</strong>
            <p>mL y L, g y mg: la mayoría de errores vienen de mezclar unidades. Pasa todo a L y g primero.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎨</span>
            <strong>El color delata la concentración</strong>
            <p>En disoluciones coloreadas, más intensidad = más concentración (ley de Beer).</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes con disoluciones</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Usar el volumen de disolvente en lugar del volumen de disolución para la molaridad.</li>
            <li>Olvidar dividir la masa entre la masa molar (confundir gramos con moles).</li>
            <li>Mezclar unidades: mL con L, o g con mg, sin convertir.</li>
            <li>Enrasar antes de disolver el soluto, falseando el volumen final.</li>
            <li>Creer que añadiendo agua se puede aumentar la concentración.</li>
            <li>Añadir agua sobre ácido concentrado (peligroso): siempre el ácido sobre el agua.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-disoluciones')} />
      <ShareCard appName="simulador-disoluciones" />
      <Footer appName="simulador-disoluciones" />
    </div>
  );
}
