'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './SimuladorMultiplicadorGasto.module.css';
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
import { jsonLd } from './metadata';

// ============================================================
// TIPOS
// ============================================================
interface Ronda {
  numero: number;
  impulso: number;
  consumoInducido: number;
  acumulado: number;
}

// ============================================================
// FUNCIONES DE CÁLCULO
// ============================================================
function calcularMultiplicador(pmc: number, t: number, m: number): number {
  const denominador = 1 - pmc * (1 - t) + m;
  return denominador > 0 ? 1 / denominador : 999;
}

function calcularMultiplicadorSimple(pmc: number): number {
  const denominador = 1 - pmc;
  return denominador > 0 ? 1 / denominador : 999;
}

function calcularRondas(deltaG: number, pmc: number, t: number, m: number): Ronda[] {
  const rondas: Ronda[] = [];
  let impulso = deltaG;
  let acumulado = 0;
  const propConsumo = pmc * (1 - t);

  for (let n = 0; n <= 15 && impulso >= 0.5; n++) {
    acumulado += impulso;
    rondas.push({
      numero: n,
      impulso,
      consumoInducido: impulso * propConsumo,
      acumulado,
    });
    impulso = impulso * propConsumo;
  }
  return rondas;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function SimuladorMultiplicadorGastoPage() {
  const [pmc, setPmc] = useState<number>(0.75);
  const [deltaG, setDeltaG] = useState<number>(1000);
  const [t, setT] = useState<number>(0.20);
  const [m, setM] = useState<number>(0.10);
  const [verSimple, setVerSimple] = useState<boolean>(true);

  // --------------------------------------------------------
  // CÁLCULOS (useMemo)
  // --------------------------------------------------------
  const calculo = useMemo(() => {
    const kSimple = calcularMultiplicadorSimple(pmc);
    const kConT = 1 / Math.max(0.001, 1 - pmc * (1 - t));
    const kCompleto = calcularMultiplicador(pmc, t, m);
    const deltaY = kCompleto * deltaG;
    const rondas = calcularRondas(deltaG, pmc, t, m);

    // Barras comparativas: max es kSimple para escala
    const maxK = Math.max(kSimple, 0.1);

    return { kSimple, kConT, kCompleto, deltaY, rondas, maxK };
  }, [pmc, deltaG, t, m]);

  // --------------------------------------------------------
  // RONDAS VISIBLES
  // --------------------------------------------------------
  const rondasVisibles = calculo.rondas.slice(0, 10);
  const rondasExtra = calculo.rondas.length - rondasVisibles.length;
  const maxImpulso = calculo.rondas[0]?.impulso ?? 1;
  const tablaRondas = calculo.rondas.slice(0, 8);

  // --------------------------------------------------------
  // FORMATEO
  // --------------------------------------------------------
  function fmtK(k: number): string {
    if (k >= 999) return '∞';
    return formatNumber(k, 2);
  }

  function fmtEuros(v: number): string {
    return formatNumber(v, 0) + ' €';
  }

  function pctDeltaY(impulso: number): string {
    if (calculo.deltaY <= 0) return '—';
    return formatNumber((impulso / calculo.deltaY) * 100, 1) + ' %';
  }

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        {/* Hero */}
        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">💰</span> Simulador del Multiplicador del Gasto</h1>
          <p className={styles.subtitle}>
            Descubre por qué 1 € de gasto público puede generar más de 1 € de PIB.
            Ajusta la propensión marginal a consumir, los impuestos y las importaciones
            para ver el efecto keynesiano ronda a ronda.
          </p>
        </header>

        <LegalNotice />

        {/* ============================================================
            PARÁMETROS — 4 sliders
            ============================================================ */}
        <section className={styles.slidersGrid} aria-label="Parámetros del modelo">
          {/* PMC */}
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabelRow}>
              <label className={styles.sliderLabel} htmlFor="slider-pmc">
                Propensión marginal a consumir (PMC)
              </label>
              <span className={styles.sliderValue}>{formatNumber(pmc, 2)}</span>
            </div>
            <input
              id="slider-pmc"
              type="range"
              min={0.10}
              max={0.99}
              step={0.01}
              value={pmc}
              onChange={e => setPmc(parseFloat(e.target.value))}
              className={styles.slider}
              aria-label="Propensión marginal a consumir"
            />
            <div className={styles.sliderHints}>
              <span>0,10 (ahorradores)</span>
              <span>0,99 (consumidores)</span>
            </div>
          </div>

          {/* ΔG */}
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabelRow}>
              <label className={styles.sliderLabel} htmlFor="slider-deltag">
                Estímulo inicial ΔG
              </label>
              <span className={styles.sliderValue}>{fmtEuros(deltaG)}</span>
            </div>
            <input
              id="slider-deltag"
              type="range"
              min={100}
              max={10000}
              step={100}
              value={deltaG}
              onChange={e => setDeltaG(parseFloat(e.target.value))}
              className={styles.slider}
              aria-label="Gasto público inicial"
            />
            <div className={styles.sliderHints}>
              <span>100 €</span>
              <span>10.000 €</span>
            </div>
          </div>

          {/* t — tipo impositivo */}
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabelRow}>
              <label className={styles.sliderLabel} htmlFor="slider-t">
                Tipo impositivo (t)
              </label>
              <span className={styles.sliderValue}>{formatNumber(t * 100, 0)} %</span>
            </div>
            <input
              id="slider-t"
              type="range"
              min={0}
              max={0.50}
              step={0.01}
              value={t}
              onChange={e => setT(parseFloat(e.target.value))}
              className={styles.slider}
              aria-label="Tipo impositivo"
            />
            <div className={styles.sliderHints}>
              <span>0 % (sin impuestos)</span>
              <span>50 %</span>
            </div>
          </div>

          {/* m — propensión a importar */}
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabelRow}>
              <label className={styles.sliderLabel} htmlFor="slider-m">
                Propensión marginal a importar (m)
              </label>
              <span className={styles.sliderValue}>{formatNumber(m, 2)}</span>
            </div>
            <input
              id="slider-m"
              type="range"
              min={0}
              max={0.50}
              step={0.01}
              value={m}
              onChange={e => setM(parseFloat(e.target.value))}
              className={styles.slider}
              aria-label="Propensión marginal a importar"
            />
            <div className={styles.sliderHints}>
              <span>0 (sin importaciones)</span>
              <span>0,50</span>
            </div>
          </div>
        </section>

        {/* Toggle multiplicador simple */}
        <div className={styles.toggleSimple}>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={verSimple}
              onChange={e => setVerSimple(e.target.checked)}
              className={styles.toggleCheckbox}
              aria-label="Mostrar también multiplicador simple"
            />
            <span className={styles.toggleText}>
              Mostrar también el multiplicador simple (solo PMC, economía cerrada)
            </span>
          </label>
        </div>

        {/* ============================================================
            PANEL RESULTADOS (prominente)
            ============================================================ */}
        <section className={styles.resultadosPanel} aria-label="Resultados del multiplicador">
          {verSimple && (
            <div className={styles.kCard}>
              <span className={styles.kLabel}>k simple</span>
              <span className={styles.kDisplay} style={{ color: 'var(--accent)' }}>
                {fmtK(calculo.kSimple)}
              </span>
              <span className={styles.kFormula}>
                k = 1 / (1 − PMC)
              </span>
            </div>
          )}

          {t > 0 && verSimple && (
            <div className={styles.kCard}>
              <span className={styles.kLabel}>k con impuestos</span>
              <span className={styles.kDisplay} style={{ color: 'var(--secondary)' }}>
                {fmtK(calculo.kConT)}
              </span>
              <span className={styles.kFormula}>
                k = 1 / (1 − PMC·(1 − t))
              </span>
            </div>
          )}

          <div className={styles.kCardMain}>
            <span className={styles.kLabel}>k completo (t + importaciones)</span>
            <span className={styles.kDisplay}>
              {fmtK(calculo.kCompleto)}
            </span>
            <span className={styles.kFormula}>
              k = 1 / (1 − PMC·(1 − t) + m)
            </span>
          </div>

          <div className={styles.deltaYCard}>
            <span className={styles.deltaYLabel}>Variación del PIB (ΔY)</span>
            <span className={styles.deltaYDisplay}>
              {fmtEuros(calculo.deltaY)}
            </span>
            <span className={styles.deltaYSub}>
              ΔY = {fmtK(calculo.kCompleto)} × {fmtEuros(deltaG)}
            </span>
          </div>
        </section>

        {/* ============================================================
            MINI-GRÁFICA COMPARATIVA — 3 barras verticales
            ============================================================ */}
        <section className={styles.compSection} aria-label="Comparativa de multiplicadores">
          <h2 className={styles.sectionTitle}>Comparativa de multiplicadores</h2>
          <p className={styles.sectionSubtitle}>
            Los impuestos y las importaciones reducen progresivamente el efecto multiplicador.
          </p>
          <div className={styles.compBarras}>
            {/* Barra 1: solo PMC */}
            <div className={styles.compBarraCol}>
              <div className={styles.compBarraTrackV}>
                <div
                  className={styles.compBarraFillV}
                  style={{
                    height: `${Math.min(100, (calculo.kSimple / calculo.maxK) * 100)}%`,
                    background: 'var(--accent)',
                  }}
                  aria-label={`Multiplicador simple: ${fmtK(calculo.kSimple)}`}
                />
              </div>
              <span className={styles.compBarraValor}>{fmtK(calculo.kSimple)}</span>
              <span className={styles.compBarraLabel}>Solo PMC</span>
            </div>

            {/* Barra 2: con impuestos */}
            <div className={styles.compBarraCol}>
              <div className={styles.compBarraTrackV}>
                <div
                  className={styles.compBarraFillV}
                  style={{
                    height: `${Math.min(100, (calculo.kConT / calculo.maxK) * 100)}%`,
                    background: 'var(--secondary)',
                  }}
                  aria-label={`Multiplicador con impuestos: ${fmtK(calculo.kConT)}`}
                />
              </div>
              <span className={styles.compBarraValor}>{fmtK(calculo.kConT)}</span>
              <span className={styles.compBarraLabel}>Con impuestos</span>
            </div>

            {/* Barra 3: con t + importaciones */}
            <div className={styles.compBarraCol}>
              <div className={styles.compBarraTrackV}>
                <div
                  className={styles.compBarraFillV}
                  style={{
                    height: `${Math.min(100, (calculo.kCompleto / calculo.maxK) * 100)}%`,
                    background: 'var(--primary)',
                  }}
                  aria-label={`Multiplicador completo: ${fmtK(calculo.kCompleto)}`}
                />
              </div>
              <span className={styles.compBarraValor}>{fmtK(calculo.kCompleto)}</span>
              <span className={styles.compBarraLabel}>Con t + imp.</span>
            </div>
          </div>
        </section>

        {/* ============================================================
            DIAGRAMA DE RONDAS
            ============================================================ */}
        <section className={styles.rondasSection} aria-label="Diagrama de rondas de gasto">
          <h2 className={styles.sectionTitle}>Rondas de gasto</h2>
          <p className={styles.sectionSubtitle}>
            Cada ronda representa el consumo inducido por la anterior.
            La barra se achica progresivamente hasta agotarse.
          </p>

          <div className={styles.rondasDiagrama}>
            {rondasVisibles.map((ronda) => {
              const pct = maxImpulso > 0 ? (ronda.impulso / maxImpulso) * 100 : 0;
              const isRonda0 = ronda.numero === 0;
              const colorFill = isRonda0
                ? '#E07A1F'
                : ronda.numero % 2 === 0
                ? 'var(--primary)'
                : 'var(--secondary)';

              return (
                <div key={ronda.numero} className={styles.rondaFila}>
                  <span className={styles.rondaLabel}>
                    {ronda.numero === 0 ? 'Impulso inicial' : `Ronda ${ronda.numero}`}
                  </span>
                  <div className={styles.rondaBarraTrack} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
                    <div
                      className={styles.rondaBarraFill}
                      style={{ width: `${pct}%`, background: colorFill }}
                    />
                  </div>
                  <span className={styles.rondaValor}>{fmtEuros(ronda.impulso)}</span>
                </div>
              );
            })}

            {rondasExtra > 0 && (
              <p className={styles.rondasExtra}>
                … {rondasExtra} ronda{rondasExtra === 1 ? '' : 's'} más (impulso &lt; 0,50 €)
              </p>
            )}
          </div>
        </section>

        {/* ============================================================
            TABLA DE RONDAS
            ============================================================ */}
        <section className={styles.tablaSection} aria-label="Tabla de primeras rondas">
          <h2 className={styles.sectionTitle}>Primeras {tablaRondas.length} rondas detalladas</h2>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th scope="col">Ronda</th>
                  <th scope="col">Impulso (€)</th>
                  <th scope="col">Consumo inducido (€)</th>
                  <th scope="col">Acumulado (€)</th>
                  <th scope="col">% del ΔY total</th>
                </tr>
              </thead>
              <tbody>
                {tablaRondas.map((ronda) => (
                  <tr key={ronda.numero} className={ronda.numero === 0 ? styles.tablaRowDestacada : ''}>
                    <td>{ronda.numero === 0 ? 'ΔG' : ronda.numero}</td>
                    <td>{fmtEuros(ronda.impulso)}</td>
                    <td>{fmtEuros(ronda.consumoInducido)}</td>
                    <td>{fmtEuros(ronda.acumulado)}</td>
                    <td>{pctDeltaY(ronda.impulso)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ============================================================
            BLOQUE EDUCATIVO v2.0
            ============================================================ */}
        <EducationalSection
          title="📚 El multiplicador keynesiano: teoría y aplicación"
          subtitle="Por qué 1 € de gasto público puede generar más de 1 € de actividad económica"
        >
          {/* INTRO */}
          <section>
            <h3>¿Qué es el multiplicador keynesiano?</h3>
            <p>
              El <strong>multiplicador keynesiano</strong> (también llamado multiplicador del gasto) es
              uno de los conceptos centrales de la macroeconomía. Describe cómo un incremento
              inicial del gasto público (ΔG) genera un aumento <em>mayor</em> en la renta nacional (ΔY)
              gracias a las sucesivas rondas de consumo que desencadena.
            </p>
            <p>
              La idea es intuitiva: si el Estado construye una carretera por valor de 1.000 €, esos
              1.000 € se convierten en renta para los trabajadores y empresas que participan.
              Si tienen una PMC de 0,75, gastarán 750 € en otros bienes y servicios, cuyos
              receptores gastarán a su vez 562,50 € y así sucesivamente. La suma de todas las
              rondas supera con creces el estímulo inicial.
            </p>
            <div className={styles.formulaBox}>
              k = 1 / (1 − PMC·(1 − t) + m) &nbsp;→&nbsp; ΔY = k · ΔG
            </div>
            <p>
              En una economía cerrada sin impuestos, el multiplicador se simplifica a{' '}
              <strong>k = 1 / (1 − PMC)</strong>. Con PMC = 0,75 obtenemos k = 4: cada euro de gasto
              público genera cuatro euros de PIB adicional. Los impuestos y las importaciones
              reducen este efecto porque una parte de la renta «se escapa» del ciclo de consumo doméstico.
            </p>
          </section>

          {/* TABLA COMPARATIVA */}
          <section>
            <h3>Multiplicadores en distintos escenarios</h3>
            <div className={styles.tablaWrapper}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th scope="col">Escenario</th>
                    <th scope="col">PMC</th>
                    <th scope="col">t</th>
                    <th scope="col">m</th>
                    <th scope="col">k</th>
                    <th scope="col">ΔY por 1.000 €</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Economía cerrada, PMC alta</td>
                    <td>0,80</td>
                    <td>0 %</td>
                    <td>0</td>
                    <td>5,00</td>
                    <td>5.000 €</td>
                  </tr>
                  <tr>
                    <td>PMC alta + impuestos moderados</td>
                    <td>0,80</td>
                    <td>25 %</td>
                    <td>0</td>
                    <td>2,50</td>
                    <td>2.500 €</td>
                  </tr>
                  <tr>
                    <td>Economía muy abierta</td>
                    <td>0,75</td>
                    <td>20 %</td>
                    <td>0,30</td>
                    <td>1,49</td>
                    <td>1.490 €</td>
                  </tr>
                  <tr>
                    <td>Crisis financiera (PMC baja)</td>
                    <td>0,40</td>
                    <td>30 %</td>
                    <td>0,10</td>
                    <td>1,19</td>
                    <td>1.190 €</td>
                  </tr>
                  <tr>
                    <td>Austeridad fiscal (t alta)</td>
                    <td>0,75</td>
                    <td>45 %</td>
                    <td>0,10</td>
                    <td>1,27</td>
                    <td>1.270 €</td>
                  </tr>
                  <tr>
                    <td>Estímulo en recesión profunda</td>
                    <td>0,90</td>
                    <td>15 %</td>
                    <td>0,05</td>
                    <td>4,65</td>
                    <td>4.650 €</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ESCENARIOS HISTÓRICOS */}
          <section>
            <h3>Casos históricos del multiplicador</h3>
            <div className={styles.scenariosGrid}>
              <div className={styles.scenarioCard}>
                <span className={styles.scenarioIcon} aria-hidden="true">🏗️</span>
                <h4>New Deal de Roosevelt (EEUU, 1933)</h4>
                <p>
                  Tras la Gran Depresión, Roosevelt lanzó un programa masivo de obras públicas
                  (carreteras, presas, edificios). Los estudios posteriores estiman un multiplicador
                  fiscal de entre 1,5 y 2,5 para ese período. La economía de EEUU era relativamente
                  cerrada, lo que maximizó el efecto multiplicador interno.
                </p>
              </div>
              <div className={styles.scenarioCard}>
                <span className={styles.scenarioIcon} aria-hidden="true">🇪🇸</span>
                <h4>Plan E de Zapatero (España, 2009)</h4>
                <p>
                  El Fondo Estatal de Inversión Local (8.000 M€ en obras municipales) fue el mayor
                  paquete de estímulo fiscal de la historia española hasta entonces. El multiplicador
                  real fue relativamente bajo (≈0,8–1,2) porque España es una economía muy abierta
                  (m elevada) y una parte significativa del estímulo se «filtró» hacia importaciones.
                </p>
              </div>
              <div className={styles.scenarioCard}>
                <span className={styles.scenarioIcon} aria-hidden="true">📉</span>
                <h4>Multiplicador en recesión vs. expansión</h4>
                <p>
                  El FMI revisó en 2012 sus estimaciones: los multiplicadores son claramente
                  superiores en recesión (1,5–2,0) que en expansión (0,5–1,0). En recesión hay
                  recursos ociosos (desempleo, capacidad industrial sin usar), por lo que el gasto
                  público no «desplaza» al privado sino que moviliza recursos que de otra forma
                  permanecerían inactivos.
                </p>
              </div>
              <div className={styles.scenarioCard}>
                <span className={styles.scenarioIcon} aria-hidden="true">⚖️</span>
                <h4>Gasto público vs. reducción de impuestos</h4>
                <p>
                  Reducir impuestos también tiene un efecto multiplicador, pero generalmente menor
                  que el gasto directo, porque no todo el dinero devuelto se consume: una parte va
                  al ahorro. El multiplicador del impuesto se estima en torno a PMC/(1−PMC) en el
                  modelo simple, siempre inferior al multiplicador del gasto.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h3>Preguntas frecuentes</h3>
            <dl className={styles.faqList}>
              <div className={styles.faqItem}>
                <dt>¿Por qué el multiplicador es mayor en recesión?</dt>
                <dd>
                  En recesión hay recursos ociosos: trabajadores en paro, maquinaria sin usar. El
                  gasto público los moviliza sin desplazar actividad privada existente. En expansión,
                  el efecto <em>crowding out</em> reduce el multiplicador porque compite con la
                  inversión privada por recursos escasos.
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Qué reduce el multiplicador (crowding out)?</dt>
                <dd>
                  El <strong>efecto expulsión</strong> (crowding out) ocurre cuando el gasto público
                  aumenta los tipos de interés (al incrementar la demanda de fondos prestables),
                  lo que reduce la inversión privada. También puede darse una expulsión de importaciones
                  si la mayor renta se gasta en bienes extranjeros.
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Puede el multiplicador ser menor que 1?</dt>
                <dd>
                  Sí. En economías muy abiertas con alta propensión a importar, o con PMC baja (alta
                  propensión al ahorro), el multiplicador puede ser inferior a 1. Esto significa que
                  1 € de gasto público genera menos de 1 € de PIB adicional, lo que cuestiona la
                  eficacia del estímulo fiscal.
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Qué diferencia hay entre el multiplicador del gasto y el del impuesto?</dt>
                <dd>
                  El multiplicador del gasto (k<sub>G</sub>) es siempre mayor que el del impuesto
                  (k<sub>T</sub>). En el modelo simple: k<sub>G</sub> = 1/(1−PMC) y
                  k<sub>T</sub> = −PMC/(1−PMC). La diferencia radica en que una rebaja fiscal entrega
                  renta al ciudadano, parte de la cual va al ahorro, mientras que el gasto directo
                  inyecta la totalidad en la economía.
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Qué es la paradoja del ahorro de Keynes?</dt>
                <dd>
                  La <strong>paradoja del ahorro</strong> señala que si todos los individuos intentan
                  ahorrar más al mismo tiempo (PMC cae), el gasto total cae, lo que reduce la renta y
                  paradójicamente puede hacer que el ahorro total <em>no aumente</em> o incluso
                  disminuya. Es un ejemplo de la falacia de composición: lo racional para el individuo
                  puede ser ruinoso para el conjunto.
                </dd>
              </div>
            </dl>
          </section>

          {/* PASOS */}
          <section>
            <h3>Cómo calcular el efecto total de un paquete de estímulo</h3>
            <ol className={styles.stepGuide}>
              <li className={styles.step}>
                <span className={styles.stepNumber}>1</span>
                <div className={styles.stepContent}>
                  <strong>Estima la PMC del país o sector objetivo.</strong> Para economías desarrolladas
                  suele estar entre 0,60 y 0,85. Economías con más desigualdad tienden a PMC más alta
                  (los hogares de renta baja consumen casi todo su ingreso).
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>2</span>
                <div className={styles.stepContent}>
                  <strong>Identifica el tipo impositivo efectivo medio (t).</strong> No el marginal,
                  sino el que efectivamente reduce la renta disponible para consumo doméstico.
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>3</span>
                <div className={styles.stepContent}>
                  <strong>Determina la propensión marginal a importar (m).</strong> Se puede aproximar
                  dividiendo las importaciones entre la renta nacional. Economías pequeñas y abiertas
                  tienen m más alta.
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>4</span>
                <div className={styles.stepContent}>
                  <strong>Aplica la fórmula del multiplicador completo:</strong>{' '}
                  k = 1 / (1 − PMC·(1 − t) + m). Multiplica por ΔG para obtener ΔY estimado.
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>5</span>
                <div className={styles.stepContent}>
                  <strong>Ajusta por el ciclo económico.</strong> Multiplica el resultado por 1,3–1,5
                  en recesión o por 0,5–0,8 en expansión plena para una estimación más realista
                  basada en los estudios del FMI y el BM.
                </div>
              </li>
            </ol>
          </section>

          {/* TIPS */}
          <section>
            <h3>Consejos para interpretar el multiplicador</h3>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">💡</span>
                <p>
                  <strong>Regla rápida:</strong> si PMC ≈ 0,75, t ≈ 20 % y m ≈ 0,10, el multiplicador
                  completo es aproximadamente <strong>1,67</strong>. Es un buen punto de partida para
                  una economía europea típica en situación normal.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🎯</span>
                <p>
                  <strong>El gasto focalizado amplifica el efecto.</strong> Si el estímulo va dirigido
                  a hogares con renta baja (PMC alta) y a sectores con poca penetración de importaciones,
                  el multiplicador efectivo puede ser significativamente mayor.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">⏱️</span>
                <p>
                  <strong>El multiplicador tarda en materializarse.</strong> Las rondas de gasto
                  se producen a lo largo de meses o incluso años. Los modelos estáticos asumen
                  un horizonte temporal infinito; en la práctica, el 80 % del efecto suele producirse
                  en los primeros 2–3 años.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🌍</span>
                <p>
                  <strong>La apertura comercial importa mucho.</strong> Un país con alta propensión
                  a importar «exporta» buena parte del estímulo fiscal al exterior. Por eso los
                  paquetes de estímulo coordinados internacionalmente son más eficaces que los
                  unilaterales.
                </p>
              </div>
            </div>
          </section>

          {/* WARNING BOX — errores frecuentes */}
          <section>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>5 errores frecuentes al interpretar el multiplicador</strong>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>Confundir PMC con PMA (propensión marginal al ahorro):</strong> PMC + PMA = 1.
                  Si la PMC es 0,75, la PMA es 0,25. Son complementarios, no intercambiables.
                </li>
                <li>
                  <strong>Olvidar las importaciones en economías abiertas:</strong> El modelo simple
                  solo con PMC sobreestima enormemente el multiplicador real. En España (economía
                  abierta), ignorar m puede duplicar el valor estimado.
                </li>
                <li>
                  <strong>Creer que el multiplicador siempre es mayor que 1:</strong> Con PMC baja
                  y m alta puede ser inferior a 1. En ese caso, el estímulo fiscal «se pierde»
                  parcialmente en ahorro e importaciones.
                </li>
                <li>
                  <strong>Ignorar el efecto crowding out:</strong> El gasto público puede elevar los
                  tipos de interés si se financia con deuda, reduciendo la inversión privada y
                  compensando parte del efecto positivo.
                </li>
                <li>
                  <strong>Confundir el multiplicador del gasto con el multiplicador del dinero:</strong>
                  Son conceptos distintos. El multiplicador del dinero (bancario) describe cómo los
                  depósitos se multiplican en el sistema financiero; el multiplicador keynesiano describe
                  el efecto del gasto en la renta nacional.
                </li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-multiplicador-gasto')} />
        <ShareCard appName="simulador-multiplicador-gasto" />
        <Footer appName="simulador-multiplicador-gasto" />
      </div>
    </>
  );
}
