'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
  DisclaimerCard,
  RegionBadge,
  DataReference,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber, formatCurrency } from '@/lib';
import { TRAMOS_IRPF_2025, FISCAL_IRPF_META } from '@/data/fiscal';
import styles from './SimuladorMitoTramoSuperior.module.css';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ResultadoTramo {
  bruto: number;
  cuotaIRPF: number;
  neto: number;
  tipoMarginal: number;
  tipoMedio: number;
}

interface CasoClasico {
  label: string;
  bruto: number;
  aumento: number;
  descripcion: string;
}

// ─── Lógica de cálculo ────────────────────────────────────────────────────────

function calcularResultado(bruto: number): ResultadoTramo {
  let cuota = 0;
  let baseRestante = Math.max(0, bruto);
  let limiteAnterior = 0;
  let tipoMarginal = 0;

  for (const tramo of TRAMOS_IRPF_2025) {
    const ancho = tramo.hasta - limiteAnterior;
    const aplicada = Math.min(baseRestante, ancho);
    if (aplicada > 0) tipoMarginal = tramo.tipo;
    cuota += aplicada * (tramo.tipo / 100);
    baseRestante -= aplicada;
    limiteAnterior = tramo.hasta;
    if (baseRestante <= 0) break;
  }

  return {
    bruto,
    cuotaIRPF: cuota,
    neto: bruto - cuota,
    tipoMarginal,
    tipoMedio: bruto > 0 ? (cuota / bruto) * 100 : 0,
  };
}

// Casos clásicos del mito: cada uno cruza una frontera de tramo
const CASOS_CLASICOS: CasoClasico[] = [
  {
    label: 'Cruzo el 24% → 30%',
    bruto: 19999,
    aumento: 501,
    descripcion: 'De 19.999 € a 20.500 € (entras al tramo del 30%)',
  },
  {
    label: 'Cruzo el 30% → 37%',
    bruto: 34500,
    aumento: 1500,
    descripcion: 'De 34.500 € a 36.000 € (entras al tramo del 37%)',
  },
  {
    label: 'Cruzo el 37% → 45%',
    bruto: 59000,
    aumento: 3000,
    descripcion: 'De 59.000 € a 62.000 € (entras al tramo del 45%)',
  },
  {
    label: 'Aumento típico 1.000 €',
    bruto: 30000,
    aumento: 1000,
    descripcion: 'Subida estándar sin cambio de tramo',
  },
];

// Marcadores de tramos para el gráfico (sin Infinity)
const LIMITES_TRAMOS_GRAFICO = TRAMOS_IRPF_2025
  .map(t => t.hasta)
  .filter(h => Number.isFinite(h));

// ─── Componente ───────────────────────────────────────────────────────────────

export default function SimuladorMitoTramoSuperiorPage() {
  const [bruto, setBruto] = useState<number>(19000);
  const [aumento, setAumento] = useState<number>(3000);

  const aplicarCaso = useCallback((caso: CasoClasico) => {
    setBruto(caso.bruto);
    setAumento(caso.aumento);
  }, []);

  const antes = useMemo(() => calcularResultado(bruto), [bruto]);
  const despues = useMemo(() => calcularResultado(bruto + aumento), [bruto, aumento]);

  const deltaBruto = aumento;
  const deltaIRPF = despues.cuotaIRPF - antes.cuotaIRPF;
  const deltaNeto = despues.neto - antes.neto;
  const porcentajeAlIRPF = deltaBruto > 0 ? (deltaIRPF / deltaBruto) * 100 : 0;
  const porcentajeAlBolsillo = 100 - porcentajeAlIRPF;

  // Gráfico SVG: muestrear 100 puntos entre 0 y 100k
  const grafico = useMemo(() => {
    const puntos = 100;
    const xMax = 100000;
    const yMax = 75000;
    const samples: { x: number; y: number }[] = [];
    for (let i = 0; i <= puntos; i++) {
      const x = (i / puntos) * xMax;
      const y = calcularResultado(x).neto;
      samples.push({ x, y });
    }
    const ancho = 760;
    const alto = 320;
    const padX = 50;
    const padY = 30;
    const innerW = ancho - 2 * padX;
    const innerH = alto - 2 * padY;
    const sx = (x: number) => padX + (x / xMax) * innerW;
    const sy = (y: number) => padY + innerH - (y / yMax) * innerH;
    const polyline = samples.map(p => `${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');
    return { ancho, alto, padX, padY, innerW, innerH, sx, sy, polyline, xMax, yMax };
  }, []);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">🎯</span>
        <h1 className={styles.title}>¿Subir de tramo IRPF te quita MÁS?</h1>
        <p className={styles.subtitle}>
          El mito popular desmontado con números reales — IRPF España 2025
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <DisclaimerCard variant="financial" severity="critical" />

      <DataReference
        normativa="IRPF 2025"
        fuente={FISCAL_IRPF_META.fuente}
        verificado={FISCAL_IRPF_META.verificado}
        urlOficial={FISCAL_IRPF_META.urlOficial}
      />

      <LegalNotice />

      <main className={styles.main}>
        {/* Inputs: sliders */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Tu situación</h2>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="bruto">
              Bruto anual: <strong>{formatCurrency(bruto)}</strong>
              <span className={styles.tipoMarginal}>
                Tipo marginal actual: {antes.tipoMarginal}%
              </span>
            </label>
            <input
              id="bruto"
              type="range"
              min={12000}
              max={200000}
              step={100}
              value={bruto}
              onChange={(e) => setBruto(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderRange}>
              <span>12.000 €</span>
              <span>200.000 €</span>
            </div>
          </div>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="aumento">
              Aumento de sueldo: <strong>{formatCurrency(aumento)}</strong>
              <span className={styles.tipoMarginal}>
                Tipo marginal después: {despues.tipoMarginal}%
              </span>
            </label>
            <input
              id="aumento"
              type="range"
              min={100}
              max={20000}
              step={50}
              value={aumento}
              onChange={(e) => setAumento(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderRange}>
              <span>100 €</span>
              <span>20.000 €</span>
            </div>
          </div>

          <div className={styles.casosGrid}>
            <p className={styles.casosTitle}>Casos clásicos del mito:</p>
            {CASOS_CLASICOS.map((caso) => (
              <button
                key={caso.label}
                type="button"
                onClick={() => aplicarCaso(caso)}
                className={styles.casoBtn}
                aria-label={caso.descripcion}
              >
                <span className={styles.casoLabel}>{caso.label}</span>
                <span className={styles.casoDesc}>{caso.descripcion}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Mito vs Realidad */}
        <section className={styles.mitoVsRealidad}>
          <div className={styles.mitoCol}>
            <div className={styles.mitoHeader}>
              <span aria-hidden="true">❌</span> LO QUE CREES (mito)
            </div>
            <p className={styles.mitoTexto}>
              «Si subo a un tramo más alto, me aplican ese tipo a TODO mi sueldo y al final{' '}
              <strong>me quitan más en total</strong>».
            </p>
            <p className={styles.mitoEjemplo}>
              «Mejor no aceptar el ascenso, que entro al 30% y se lo quedan todo».
            </p>
          </div>

          <div className={styles.realidadCol}>
            <div className={styles.realidadHeader}>
              <span aria-hidden="true">✅</span> LO QUE PASA DE VERDAD
            </div>
            <p className={styles.realidadTexto}>
              El IRPF es <strong>progresivo por tramos</strong>: solo la parte que entra en el tramo nuevo
              tributa al tipo más alto. Tu neto <strong>SIEMPRE</strong> sube cuando sube tu bruto.
            </p>
            <p className={styles.realidadEjemplo}>
              Subir de tramo nunca te empobrece. Es matemáticamente imposible.
            </p>
          </div>
        </section>

        {/* Tres cards comparativas */}
        <section className={styles.cardsComparativa}>
          <div className={styles.cardAntes}>
            <h3 className={styles.cardTitle}>Antes del aumento</h3>
            <div className={styles.cardRow}>
              <span>Bruto</span>
              <strong>{formatCurrency(antes.bruto)}</strong>
            </div>
            <div className={styles.cardRow}>
              <span>IRPF</span>
              <strong className={styles.valorIRPF}>−{formatCurrency(antes.cuotaIRPF)}</strong>
            </div>
            <div className={styles.cardRowFinal}>
              <span>Neto</span>
              <strong className={styles.valorNeto}>{formatCurrency(antes.neto)}</strong>
            </div>
            <div className={styles.cardMeta}>
              Tipo medio: {formatNumber(antes.tipoMedio, 2)}% · Marginal: {antes.tipoMarginal}%
            </div>
          </div>

          <div className={styles.cardDespues}>
            <h3 className={styles.cardTitle}>Después del aumento</h3>
            <div className={styles.cardRow}>
              <span>Bruto</span>
              <strong>{formatCurrency(despues.bruto)}</strong>
            </div>
            <div className={styles.cardRow}>
              <span>IRPF</span>
              <strong className={styles.valorIRPF}>−{formatCurrency(despues.cuotaIRPF)}</strong>
            </div>
            <div className={styles.cardRowFinal}>
              <span>Neto</span>
              <strong className={styles.valorNeto}>{formatCurrency(despues.neto)}</strong>
            </div>
            <div className={styles.cardMeta}>
              Tipo medio: {formatNumber(despues.tipoMedio, 2)}% · Marginal: {despues.tipoMarginal}%
            </div>
          </div>

          <div className={styles.cardDiferencia}>
            <h3 className={styles.cardTitle}>Diferencia (la prueba)</h3>
            <div className={styles.cardRow}>
              <span>Δ Bruto</span>
              <strong className={styles.valorPositivo}>+{formatCurrency(deltaBruto)}</strong>
            </div>
            <div className={styles.cardRow}>
              <span>Δ IRPF</span>
              <strong className={styles.valorIRPFExtra}>+{formatCurrency(deltaIRPF)}</strong>
            </div>
            <div className={styles.cardRowFinal}>
              <span>Δ Neto</span>
              <strong className={styles.valorPositivoGrande}>+{formatCurrency(deltaNeto)}</strong>
            </div>
            <div className={styles.cardMeta}>
              Δ marginal: {antes.tipoMarginal}% → {despues.tipoMarginal}%
            </div>
          </div>
        </section>

        {/* Mensaje positivo grande */}
        <section className={styles.mensajePositivo} role="status" aria-live="polite">
          <span className={styles.mensajeIcon} aria-hidden="true">💰</span>
          <p className={styles.mensajeTexto}>
            Sí, te quitan más impuestos del aumento, pero{' '}
            <strong className={styles.mensajeDestacado}>tu neto sube +{formatCurrency(deltaNeto)}</strong>
            {antes.tipoMarginal !== despues.tipoMarginal && (
              <span className={styles.mensajeNota}>
                {' '}(¡y eso aunque hayas cruzado al tramo del {despues.tipoMarginal}%!)
              </span>
            )}
          </p>
        </section>

        {/* Desglose del aumento */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Cómo se desglosa tu aumento de {formatCurrency(deltaBruto)}</h2>
          <p className={styles.panelDesc}>
            De cada euro que sube tu bruto, una parte va al IRPF y el resto a tu bolsillo:
          </p>

          <div className={styles.barProgreso}>
            <div
              className={styles.barIRPF}
              style={{ width: `${porcentajeAlIRPF.toFixed(2)}%` }}
              title={`IRPF: ${formatNumber(porcentajeAlIRPF, 1)}%`}
            >
              {porcentajeAlIRPF >= 12 && (
                <span>IRPF {formatNumber(porcentajeAlIRPF, 1)}%</span>
              )}
            </div>
            <div
              className={styles.barNeto}
              style={{ width: `${porcentajeAlBolsillo.toFixed(2)}%` }}
              title={`A tu bolsillo: ${formatNumber(porcentajeAlBolsillo, 1)}%`}
            >
              {porcentajeAlBolsillo >= 12 && (
                <span>A tu bolsillo {formatNumber(porcentajeAlBolsillo, 1)}%</span>
              )}
            </div>
          </div>

          <div className={styles.desgloseGrid}>
            <div className={styles.desgloseItem}>
              <span className={styles.desgloseLabel}>Va al IRPF</span>
              <strong className={styles.desgloseIRPF}>{formatCurrency(deltaIRPF)}</strong>
              <span className={styles.desgloseSub}>{formatNumber(porcentajeAlIRPF, 1)}% del aumento</span>
            </div>
            <div className={styles.desgloseItem}>
              <span className={styles.desgloseLabel}>A tu bolsillo</span>
              <strong className={styles.desgloseBolsillo}>{formatCurrency(deltaNeto)}</strong>
              <span className={styles.desgloseSub}>{formatNumber(porcentajeAlBolsillo, 1)}% del aumento</span>
            </div>
          </div>
        </section>

        {/* Gráfico SVG: neto vs bruto */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Tu neto siempre sube cuando sube tu bruto</h2>
          <p className={styles.panelDesc}>
            La pendiente de la línea baja al cruzar cada tramo (las barras verticales), pero{' '}
            <strong>nunca es negativa</strong>. El punto rojo es tu situación actual; el verde, después del aumento.
          </p>

          <div className={styles.graficoContainer}>
            <svg
              viewBox={`0 0 ${grafico.ancho} ${grafico.alto}`}
              className={styles.graficoSvg}
              role="img"
              aria-label="Gráfico de neto en función del bruto, mostrando que el neto siempre crece"
            >
              {/* Ejes */}
              <line
                x1={grafico.padX}
                y1={grafico.padY}
                x2={grafico.padX}
                y2={grafico.padY + grafico.innerH}
                stroke="#9ca3af"
                strokeWidth={1.5}
              />
              <line
                x1={grafico.padX}
                y1={grafico.padY + grafico.innerH}
                x2={grafico.padX + grafico.innerW}
                y2={grafico.padY + grafico.innerH}
                stroke="#9ca3af"
                strokeWidth={1.5}
              />

              {/* Marcadores de tramos */}
              {LIMITES_TRAMOS_GRAFICO.map((limite, i) => {
                if (limite > grafico.xMax) return null;
                const x = grafico.sx(limite);
                const colores = ['#fbbf24', '#fb923c', '#f87171', '#a78bfa', '#ec4899'];
                const color = colores[i % colores.length];
                return (
                  <g key={limite}>
                    <line
                      x1={x}
                      y1={grafico.padY}
                      x2={x}
                      y2={grafico.padY + grafico.innerH}
                      stroke={color}
                      strokeWidth={1}
                      strokeDasharray="4 3"
                      opacity={0.6}
                      className={styles.tramoMarker}
                    />
                    <text
                      x={x}
                      y={grafico.padY - 8}
                      fontSize={10}
                      fill={color}
                      textAnchor="middle"
                      fontWeight={600}
                    >
                      {(limite / 1000).toFixed(0)}k
                    </text>
                  </g>
                );
              })}

              {/* Línea neto vs bruto */}
              <polyline
                points={grafico.polyline}
                fill="none"
                stroke="var(--primary, #2E86AB)"
                strokeWidth={2.5}
              />

              {/* Punto antes (rojo) */}
              {bruto <= grafico.xMax && (
                <g>
                  <circle
                    cx={grafico.sx(antes.bruto)}
                    cy={grafico.sy(antes.neto)}
                    r={6}
                    fill="#dc2626"
                    stroke="white"
                    strokeWidth={2}
                  />
                  <text
                    x={grafico.sx(antes.bruto)}
                    y={grafico.sy(antes.neto) - 12}
                    fontSize={10}
                    fill="#dc2626"
                    textAnchor="middle"
                    fontWeight={700}
                  >
                    Antes
                  </text>
                </g>
              )}

              {/* Punto después (verde) */}
              {despues.bruto <= grafico.xMax && (
                <g>
                  <circle
                    cx={grafico.sx(despues.bruto)}
                    cy={grafico.sy(despues.neto)}
                    r={6}
                    fill="#16a34a"
                    stroke="white"
                    strokeWidth={2}
                  />
                  <text
                    x={grafico.sx(despues.bruto)}
                    y={grafico.sy(despues.neto) - 12}
                    fontSize={10}
                    fill="#16a34a"
                    textAnchor="middle"
                    fontWeight={700}
                  >
                    Después
                  </text>
                </g>
              )}

              {/* Etiquetas ejes */}
              <text
                x={grafico.padX + grafico.innerW / 2}
                y={grafico.alto - 4}
                fontSize={11}
                fill="#6b7280"
                textAnchor="middle"
              >
                Bruto anual (€)
              </text>
              <text
                x={12}
                y={grafico.padY + grafico.innerH / 2}
                fontSize={11}
                fill="#6b7280"
                textAnchor="middle"
                transform={`rotate(-90 12 ${grafico.padY + grafico.innerH / 2})`}
              >
                Neto (€)
              </text>
            </svg>
          </div>

          <p className={styles.graficoLeyenda}>
            <span className={styles.leyendaItem}>
              <span className={styles.leyendaPunto} style={{ background: '#dc2626' }} />
              Tu situación actual
            </span>
            <span className={styles.leyendaItem}>
              <span className={styles.leyendaPunto} style={{ background: '#16a34a' }} />
              Después del aumento
            </span>
            <span className={styles.leyendaItem}>
              <span className={styles.leyendaPunto} style={{ background: '#fb923c' }} />
              Frontera entre tramos
            </span>
          </p>
        </section>

        {/* Sección "El mito explicado" */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>El mito explicado en una frase</h2>
          <div className={styles.explicacionGrid}>
            <div className={styles.explicacionCard}>
              <h4>El razonamiento erróneo</h4>
              <p>
                «Si entro al tramo del 30%, me quitan el 30% de TODO mi sueldo, no solo del aumento.
                Mejor que no me suban demasiado para no cruzar la frontera».
              </p>
            </div>
            <div className={styles.explicacionCard}>
              <h4>La realidad matemática</h4>
              <p>
                Solo se aplica el 30% a la <strong>PARTE que entra</strong> en ese tramo. Si tu bruto era
                20.199 € (último euro al 24%) y sube a 20.201 € (cruzas al tramo 30%), del aumento de 2 €,
                solo <strong>0,60 € van al IRPF</strong>. Tu neto sube 1,40 €.
              </p>
            </div>
          </div>
        </section>
      </main>

      <EducationalSection
        title="Por Qué el Mito Está Equivocado"
        subtitle="Sistema progresivo por tramos del IRPF español"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h3>Tabla de Tramos IRPF 2025</h3>
          <p>
            Cada tramo se aplica solo a la <strong>porción de tu base liquidable</strong> que cae en ese
            rango. Es matemáticamente imposible que subir el bruto haga bajar el neto:
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Desde</th>
                  <th>Hasta</th>
                  <th>Tipo marginal</th>
                  <th>Qué significa</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>0 €</td>
                  <td>12.450 €</td>
                  <td>19%</td>
                  <td>Los primeros 12.450 € siempre tributan al 19%, aunque ganes 200.000 €</td>
                </tr>
                <tr>
                  <td>12.450 €</td>
                  <td>20.200 €</td>
                  <td>24%</td>
                  <td>Solo los 7.750 € que caen aquí pagan al 24%</td>
                </tr>
                <tr>
                  <td>20.200 €</td>
                  <td>35.200 €</td>
                  <td>30%</td>
                  <td>Solo los 15.000 € que caen aquí pagan al 30%</td>
                </tr>
                <tr>
                  <td>35.200 €</td>
                  <td>60.000 €</td>
                  <td>37%</td>
                  <td>Solo los 24.800 € que caen aquí pagan al 37%</td>
                </tr>
                <tr>
                  <td>60.000 €</td>
                  <td>300.000 €</td>
                  <td>45%</td>
                  <td>Solo los hasta 240.000 € que caen aquí pagan al 45%</td>
                </tr>
                <tr>
                  <td>300.000 €</td>
                  <td>En adelante</td>
                  <td>47%</td>
                  <td>Solo lo que excede 300.000 € paga al 47%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={styles.notaTabla}>
            * Tipos orientativos que combinan tarifa estatal + autonómica media. Cada CCAA puede variar
            ligeramente. Verifica con tu Agencia Tributaria autonómica.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h3>Casos de Uso Reales</h3>
          <p>Cuatro situaciones típicas donde el mito aparece y por qué la realidad lo desmonta:</p>
          <div className={styles.escenariosGrid}>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📈</span>
                <h4>Subida pequeña que cruza tramo (24% → 30%)</h4>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Antes:</strong> 19.999 € brutos · IRPF aprox. 4.198 € · Neto ~15.801 €</p>
                <p><strong>Después:</strong> 20.500 € brutos · IRPF aprox. 4.288 € · Neto ~16.212 €</p>
                <p><strong>Δ Neto:</strong> +411 € de los 501 € de aumento (82% al bolsillo)</p>
              </div>
              <div className={styles.escenarioTip}>
                Aunque cruzas el tramo, solo 300 € del aumento entran al 30%. El resto (201 €) sigue al 24%.
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💼</span>
                <h4>Ascenso importante (30% → 37%)</h4>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Antes:</strong> 34.500 € brutos · IRPF aprox. 7.683 € · Neto ~26.817 €</p>
                <p><strong>Después:</strong> 36.000 € brutos · IRPF aprox. 8.176 € · Neto ~27.824 €</p>
                <p><strong>Δ Neto:</strong> +1.007 € de los 1.500 € de aumento (67% al bolsillo)</p>
              </div>
              <div className={styles.escenarioTip}>
                Cruzar al tramo del 37% suena duro, pero solo 800 € del aumento tributan a esa tasa.
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🚀</span>
                <h4>Sueldo alto cruzando 37% → 45%</h4>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Antes:</strong> 59.000 € brutos · IRPF aprox. 16.198 € · Neto ~42.802 €</p>
                <p><strong>Después:</strong> 62.000 € brutos · IRPF aprox. 17.388 € · Neto ~44.612 €</p>
                <p><strong>Δ Neto:</strong> +1.810 € de los 3.000 € de aumento (60% al bolsillo)</p>
              </div>
              <div className={styles.escenarioTip}>
                Incluso al saltar al tramo del 45%, te quedas con más del 60% del aumento.
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📊</span>
                <h4>Aumento típico de 1.000 € sin cruzar tramo</h4>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Antes:</strong> 30.000 € brutos · IRPF aprox. 6.333 € · Neto ~23.667 €</p>
                <p><strong>Después:</strong> 31.000 € brutos · IRPF aprox. 6.633 € · Neto ~24.367 €</p>
                <p><strong>Δ Neto:</strong> +700 € de los 1.000 € de aumento (70% al bolsillo)</p>
              </div>
              <div className={styles.escenarioTip}>
                Sin cambio de tramo, el porcentaje al bolsillo es exactamente <em>(1 − tipo marginal)</em>.
              </div>
            </div>

          </div>
        </section>

        <section className={styles.guideSection}>
          <h3>Preguntas Frecuentes</h3>
          <div className={styles.faqList}>

            <div className={styles.faqItem}>
              <h4>¿Cuál es exactamente el mito del tramo superior?</h4>
              <p>
                El mito popular dice que «si subes a un tramo más alto, ese tipo se aplica a TODO tu sueldo
                y al final pierdes dinero». Por eso mucha gente rechaza ascensos pensando que «no compensa».
                Es <strong>matemáticamente falso</strong>: el sistema español es progresivo por tramos, no
                progresivo total.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Por qué tanta gente cree el mito?</h4>
              <p>
                Hay tres razones: (1) la palabra «tramo» sugiere intuitivamente que «caes» en una zona y
                te aplican un único tipo, (2) en bruto vemos que «al 30%» suena peor que «al 24%», sin pensar
                que solo afecta a una parte, (3) errores en nóminas mensuales (como retenciones puntuales
                tras subidas) confirman el sesgo aunque la realidad anual sea favorable.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué diferencia hay entre tipo marginal y tipo medio?</h4>
              <p>
                El <strong>tipo marginal</strong> es el porcentaje que se aplica al último euro que ganas
                (el del tramo más alto donde caes). El <strong>tipo medio</strong> (o efectivo) es el
                porcentaje real de IRPF sobre tu base total. Ejemplo: con 35.200 € tu marginal es 30%, pero
                tu tipo medio rondará el 16-18%, porque los primeros tramos tributan menos.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Hay alguna situación donde subir el bruto me perjudique?</h4>
              <p>
                <strong>Por tramos IRPF: no, jamás.</strong> Pero pueden existir <em>efectos colaterales</em>
                en bonificaciones específicas: pérdida de la deducción por rentas bajas (umbral 18.276 €),
                pérdida de ayudas autonómicas con tope de renta, pérdida del bono social eléctrico, o
                cambio de tramo en becas universitarias. Estos casos son puntuales y no se deben al IRPF
                en sí, sino a otros umbrales independientes.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué pasa con bonus puntuales (paga extra, variable)?</h4>
              <p>
                Las pagas variables se suman a la base imponible anual y tributan según los tramos como
                cualquier otro rendimiento. El efecto puede ser que el mes del bonus la <strong>retención</strong>
                en nómina sea mayor (porque la empresa actualiza el cálculo), pero al final del año se
                regulariza con tu tipo medio real. No te preocupes por la retención puntual, sino por la
                cuota íntegra anual.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Las CCAA pueden cambiar este sistema progresivo?</h4>
              <p>
                Las comunidades autónomas pueden modificar la <strong>tarifa autonómica</strong> (la mitad
                del IRPF que les corresponde), pero el principio progresivo por tramos es estructural y
                aplicable en toda España. Madrid, La Rioja o Andalucía han bajado los tipos en sus tarifas;
                Cataluña o Asturias los han subido. En todos los casos, sigue siendo cierto que subir el
                bruto siempre incrementa el neto.
              </p>
            </div>

          </div>
        </section>

        <section className={styles.guideSection}>
          <h3>Cómo Calcular el Aumento Neto — Paso a Paso</h3>
          <div className={styles.stepGuide}>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">1</div>
              <div className={styles.stepContent}>
                <h4>Identifica tu bruto antes y después</h4>
                <p>
                  Suma tu bruto anual actual y el aumento. Por ejemplo: si ganas 30.000 € y te suben 2.000 €,
                  pasarás a 32.000 €. Trabaja siempre con cifras anuales (multiplica por 14 pagas si tu
                  contrato es así).
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">2</div>
              <div className={styles.stepContent}>
                <h4>Calcula la cuota IRPF de cada situación</h4>
                <p>
                  Aplica los tramos: los primeros 12.450 € al 19%, los siguientes hasta 20.200 € al 24%,
                  etc. Suma los importes parciales para obtener la cuota íntegra total. Esto se hace
                  automáticamente en este simulador, pero conviene entender el mecanismo.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">3</div>
              <div className={styles.stepContent}>
                <h4>Resta cuota al bruto: tu neto</h4>
                <p>
                  Neto = Bruto − Cuota IRPF (orientativo, sin descontar SS ni considerar mínimos
                  personales y familiares, que también <strong>aumentan</strong> el neto).
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">4</div>
              <div className={styles.stepContent}>
                <h4>Calcula la diferencia entre antes y después</h4>
                <p>
                  Δ Neto = Neto después − Neto antes. <strong>Este número siempre será positivo</strong>
                  cuando Δ Bruto sea positivo. Es matemáticamente imposible que sea negativo en un
                  sistema progresivo por tramos.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">5</div>
              <div className={styles.stepContent}>
                <h4>Compara con tu tipo marginal nuevo</h4>
                <p>
                  El porcentaje del aumento que va al IRPF nunca supera el tipo marginal nuevo. Si subes
                  al tramo del 37%, lo peor que te puede pasar es que el 37% del aumento vaya a Hacienda
                  y tú te quedes con el 63%. Y casi siempre es mejor, porque parte del aumento aún
                  tributa al tramo anterior.
                </p>
              </div>
            </div>

          </div>
        </section>

        <section className={styles.guideSection}>
          <h3>Mejores Prácticas</h3>
          <div className={styles.tipsGrid}>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <div>
                <h4>Acepta siempre el ascenso (por IRPF)</h4>
                <p>
                  Nunca rechaces un aumento por miedo al «tramo siguiente». Tu neto siempre subirá. Si
                  rechazas, lo único que evitas es ganar más dinero.
                </p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧠</span>
              <div>
                <h4>Diferencia tipo marginal de tipo medio</h4>
                <p>
                  Cuando alguien dice «pago el 30% de IRPF», pregunta si es marginal o medio. El medio es
                  lo que realmente pagas. Suele ser 10-15 puntos menos que el marginal.
                </p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <div>
                <h4>Aporta al plan de pensiones para reducir base</h4>
                <p>
                  Si quieres reducir la cuota anual, aporta a un plan de pensiones (hasta 1.500 €/año
                  reducen la base imponible directamente). El ahorro real depende de tu tipo marginal.
                </p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📋</span>
              <div>
                <h4>Comprueba la retención mensual tras un aumento</h4>
                <p>
                  Tras una subida, la empresa recalcula la retención. Algunos meses puede parecer que
                  cobras menos por una regularización, pero anualmente cobrarás más. Mira siempre el
                  acumulado anual.
                </p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏛️</span>
              <div>
                <h4>Conoce la tarifa autonómica de tu CCAA</h4>
                <p>
                  Madrid, Andalucía o La Rioja tienen tarifas autonómicas más bajas. Cataluña, Asturias
                  o Comunidad Valenciana, más altas. La tarifa estatal es común a todas, pero la
                  autonómica varía hasta 3-4 puntos en tramos altos.
                </p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💡</span>
              <div>
                <h4>Habla con un asesor si dudas</h4>
                <p>
                  Para situaciones complejas (ingresos por varias fuentes, autónomo + asalariado,
                  rentas en el extranjero), un asesor fiscal puede explicarte el efecto exacto de cada
                  euro adicional sobre tu cuota total.
                </p>
              </div>
            </div>

          </div>
        </section>

        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>6 errores frecuentes al razonar sobre tramos</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Creer que cambiar de tramo aplica el tipo nuevo a TODO tu sueldo.</strong> Falso:
                el tipo nuevo solo se aplica a la <em>porción</em> que entra en ese tramo. Los primeros
                12.450 € siempre tributan al 19%, ganes lo que ganes.
              </li>
              <li>
                <strong>Confundir tipo marginal con tipo medio.</strong> El marginal es lo que paga el
                último euro; el medio es lo que pagas en promedio. Pueden diferir en 10-15 puntos. La gente
                suele citar el marginal pensando en el medio.
              </li>
              <li>
                <strong>Ignorar que los mínimos personales y familiares reducen base.</strong> Los 5.550 €
                de mínimo personal (más adicionales por hijos, cónyuge, ascendientes) se restan antes de
                aplicar tramos. Reducen aún más la cuota real.
              </li>
              <li>
                <strong>No contar la cotización a la Seguridad Social.</strong> La SS son ~6,4% sobre el
                bruto y se descuenta antes del IRPF. Tu neto real es bruto − SS − IRPF, no solo bruto − IRPF.
                Este simulador trabaja sobre base liquidable simplificada.
              </li>
              <li>
                <strong>No actualizar las cifras cuando cambia la LPGE.</strong> Cada Ley de Presupuestos
                puede ajustar tramos, mínimos y tarifas. Los datos de este simulador son los vigentes en
                2025; revisa la Agencia Tributaria si lees esto en otro ejercicio.
              </li>
              <li>
                <strong>Asumir que todas las CCAA aplican los mismos tramos.</strong> La tarifa estatal es
                la misma, pero cada CCAA fija su tarifa autonómica. La diferencia puede ser de hasta 3-4
                puntos en los tramos altos. Verifica con tu agencia tributaria autonómica.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-mito-tramo-superior')} />
      <ShareCard appName="simulador-mito-tramo-superior" />
      <Footer appName="simulador-mito-tramo-superior" />
    </div>
  );
}
