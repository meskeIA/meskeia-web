'use client';

import { useState } from 'react';
import styles from './EficienciaEnergetica.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

type TabType = 'aislamiento' | 'ventanas' | 'calefaccion';

interface ResultadoEnergia {
  etiqueta: string;
  valor: string;
  tipo?: 'normal' | 'destacado' | 'bueno';
}

function parseNum(v: string): number {
  return parseSpanishNumber(v) || 0;
}

// CO₂ factor: promedio España (mezcla eléctrica + gas natural)
// Gas: 0,205 kgCO2/kWh; Electricidad: 0,27 kgCO2/kWh
function calcularAislamiento(
  m2Tejado: number,
  m2Paredes: number,
  costeAnualCalefaccion: number,
  porcentajeAhorro: number,
  inversionTotal: number
): ResultadoEnergia[] {
  const ahorroAnual = (costeAnualCalefaccion * porcentajeAhorro) / 100;
  const payback = inversionTotal > 0 && ahorroAnual > 0 ? inversionTotal / ahorroAnual : 0;
  const ahorro10años = ahorroAnual * 10;
  const kwhAhorrados = ahorroAnual / 0.12; // precio ref. gas
  const co2Reducido = kwhAhorrados * 0.205; // kgCO₂

  return [
    { etiqueta: 'Superficie total a aislar', valor: `${formatNumber(m2Tejado + m2Paredes, 0)} m²` },
    { etiqueta: 'Ahorro anual estimado', valor: `${formatNumber(ahorroAnual, 2)} €/año`, tipo: 'bueno' },
    { etiqueta: 'Reducción de CO₂', valor: `${formatNumber(co2Reducido, 0)} kg/año` },
    { etiqueta: 'Amortización (payback)', valor: payback > 0 ? `${formatNumber(payback, 1)} años` : '—', tipo: 'destacado' },
    { etiqueta: 'Ahorro acumulado a 10 años', valor: `${formatNumber(ahorro10años, 2)} €`, tipo: 'bueno' },
    ...(inversionTotal > 0 ? [{ etiqueta: 'Beneficio neto a 10 años', valor: `${formatNumber(ahorro10años - inversionTotal, 2)} €`, tipo: ahorro10años > inversionTotal ? 'bueno' as const : 'normal' as const }] : []),
  ];
}

function calcularVentanas(
  numVentanas: number,
  m2PorVentana: number,
  costeAnualCalefaccion: number,
  tipoActual: string,
  tipoNuevo: string,
  precioM2Instalado: number
): ResultadoEnergia[] {
  // Valores de transmitancia U (W/m²K) y pérdida estimada (%) por tipos
  const perdidaCalor: Record<string, number> = {
    'simple': 30,
    'doble': 20,
    'doble-low-e': 12,
    'triple': 8,
  };
  const costeInstalacion = numVentanas * m2PorVentana * precioM2Instalado;
  const perdidaActual = perdidaCalor[tipoActual] || 25;
  const perdidaNueva = perdidaCalor[tipoNuevo] || 12;
  const mejora = (perdidaActual - perdidaNueva) / 100;
  const ahorroAnual = costeAnualCalefaccion * mejora;
  const payback = costeInstalacion > 0 && ahorroAnual > 0 ? costeInstalacion / ahorroAnual : 0;

  return [
    { etiqueta: 'Superficie de ventanas', valor: `${formatNumber(numVentanas * m2PorVentana, 2)} m²` },
    { etiqueta: 'Coste estimado instalación', valor: `${formatNumber(costeInstalacion, 2)} €` },
    { etiqueta: 'Ahorro anual estimado', valor: `${formatNumber(ahorroAnual, 2)} €/año`, tipo: 'bueno' },
    { etiqueta: 'Amortización (payback)', valor: payback > 0 ? `${formatNumber(payback, 1)} años` : '—', tipo: 'destacado' },
    { etiqueta: 'Ahorro acumulado a 15 años', valor: `${formatNumber(ahorroAnual * 15, 2)} €`, tipo: 'bueno' },
    ...(costeInstalacion > 0 ? [{ etiqueta: 'Beneficio neto a 15 años', valor: `${formatNumber(ahorroAnual * 15 - costeInstalacion, 2)} €`, tipo: ahorroAnual * 15 > costeInstalacion ? 'bueno' as const : 'normal' as const }] : []),
  ];
}

function calcularCalefaccion(
  consumoAnualKwh: number,
  precioActualKwh: number,
  eficienciaSistemaActual: number,
  eficienciaBombaCalor: number,
  inversionBombaCalor: number
): ResultadoEnergia[] {
  const costeActual = consumoAnualKwh * precioActualKwh;
  // COP/SCOP bomba de calor (el calor generado / electricidad consumida)
  const electricidadBC = consumoAnualKwh / (eficienciaBombaCalor / 100);
  const precioElectricidad = 0.18; // €/kWh ref. España
  const costeBC = electricidadBC * precioElectricidad;
  const ahorroAnual = costeActual - costeBC;
  const payback = inversionBombaCalor > 0 && ahorroAnual > 0 ? inversionBombaCalor / ahorroAnual : 0;
  // CO₂ gas: 0.205 kg/kWh; electricidad: 0.27 kg/kWh
  const co2Actual = (consumoAnualKwh / (eficienciaSistemaActual / 100)) * 0.205;
  const co2BC = electricidadBC * 0.27;
  const reduccionCO2 = co2Actual - co2BC;

  return [
    { etiqueta: 'Coste anual sistema actual', valor: `${formatNumber(costeActual, 2)} €` },
    { etiqueta: 'Coste anual bomba de calor', valor: `${formatNumber(costeBC, 2)} €` },
    { etiqueta: 'Ahorro anual estimado', valor: `${formatNumber(ahorroAnual, 2)} €/año`, tipo: ahorroAnual > 0 ? 'bueno' : 'normal' },
    { etiqueta: 'Reducción de CO₂', valor: `${formatNumber(reduccionCO2, 0)} kg/año` },
    { etiqueta: 'Amortización (payback)', valor: payback > 0 ? `${formatNumber(payback, 1)} años` : '—', tipo: 'destacado' },
    ...(inversionBombaCalor > 0 ? [{ etiqueta: 'Beneficio neto a 20 años', valor: `${formatNumber(ahorroAnual * 20 - inversionBombaCalor, 2)} €`, tipo: ahorroAnual * 20 > inversionBombaCalor ? 'bueno' as const : 'normal' as const }] : []),
  ];
}

export default function EficienciaEnergeticaPage() {
  const [tabActiva, setTabActiva] = useState<TabType>('aislamiento');
  const [resultados, setResultados] = useState<ResultadoEnergia[] | null>(null);

  // Aislamiento
  const [aisTejado, setAisTejado] = useState('');
  const [aisParedes, setAisParedes] = useState('');
  const [aisCoste, setAisCoste] = useState('');
  const [aisPorcentaje, setAisPorcentaje] = useState('30');
  const [aisInversion, setAisInversion] = useState('');

  // Ventanas
  const [venNum, setVenNum] = useState('');
  const [venM2, setVenM2] = useState('1,5');
  const [venCoste, setVenCoste] = useState('');
  const [venActual, setVenActual] = useState('simple');
  const [venNuevo, setVenNuevo] = useState('doble-low-e');
  const [venPrecioM2, setVenPrecioM2] = useState('350');

  // Calefacción
  const [calKwh, setCalKwh] = useState('');
  const [calPrecio, setCalPrecio] = useState('0,12');
  const [calEfActual, setCalEfActual] = useState('90');
  const [calEfBC, setCalEfBC] = useState('300');
  const [calInversion, setCalInversion] = useState('');

  const calcular = () => {
    setResultados(null);
    if (tabActiva === 'aislamiento') {
      const tejado = parseNum(aisTejado);
      const paredes = parseNum(aisParedes);
      const coste = parseNum(aisCoste);
      const pct = parseNum(aisPorcentaje);
      const inv = parseNum(aisInversion);
      if (!coste || !pct) return;
      setResultados(calcularAislamiento(tejado, paredes, coste, pct, inv));
    } else if (tabActiva === 'ventanas') {
      const num = parseNum(venNum);
      const m2 = parseNum(venM2);
      const coste = parseNum(venCoste);
      const precioM2 = parseNum(venPrecioM2);
      if (!num || !m2 || (!coste && !precioM2)) return;
      const costefinal = coste || 0;
      const precioM2Final = precioM2 || 0;
      setResultados(calcularVentanas(num, m2, costefinal || 1200, venActual, venNuevo, precioM2Final));
    } else if (tabActiva === 'calefaccion') {
      const kwh = parseNum(calKwh);
      const precio = parseNum(calPrecio);
      const efActual = parseNum(calEfActual);
      const efBC = parseNum(calEfBC);
      const inv = parseNum(calInversion);
      if (!kwh || !precio || !efActual || !efBC) return;
      setResultados(calcularCalefaccion(kwh, precio, efActual, efBC, inv));
    }
  };

  const cambiarTab = (tab: TabType) => {
    setTabActiva(tab);
    setResultados(null);
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
          <h1 className={styles.title}>⚡ Calculadora de Eficiencia Energética</h1>
          <p className={styles.subtitle}>
            Calcula el ahorro y la amortización de mejoras en aislamiento, ventanas y calefacción
          </p>
        </header>

        <LegalNotice />

        {/* Tabs */}
        <div className={styles.tabs} role="tablist" aria-label="Tipo de mejora energética">
          {([
            { id: 'aislamiento', label: 'Aislamiento', emoji: '🏠' },
            { id: 'ventanas', label: 'Ventanas', emoji: '🪟' },
            { id: 'calefaccion', label: 'Calefacción / BC', emoji: '🌡️' },
          ] as { id: TabType; label: string; emoji: string }[]).map(t => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tabActiva === t.id}
              className={`${styles.tab} ${tabActiva === t.id ? styles.tabActive : ''}`}
              onClick={() => cambiarTab(t.id)}
            >
              <span aria-hidden="true">{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {/* Panel inputs */}
          <div className={styles.panel}>
            {tabActiva === 'aislamiento' && (
              <>
                <p className={styles.panelTitle}><span aria-hidden="true">🏠</span> Mejora de aislamiento</p>
                <div className={styles.inputRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="ais-tejado">Superficie tejado (m²)</label>
                    <input id="ais-tejado" type="text" inputMode="decimal" className={styles.input} placeholder="80" value={aisTejado} onChange={e => setAisTejado(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="ais-paredes">Superficie paredes (m²)</label>
                    <input id="ais-paredes" type="text" inputMode="decimal" className={styles.input} placeholder="120" value={aisParedes} onChange={e => setAisParedes(e.target.value)} />
                    <p className={styles.hint}>Opcional — solo lo que se va a aislar</p>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="ais-coste">Gasto anual actual en calefacción (€)</label>
                  <input id="ais-coste" type="text" inputMode="decimal" className={styles.input} placeholder="800" value={aisCoste} onChange={e => setAisCoste(e.target.value)} />
                  <p className={styles.hint}>Mira tus facturas de gas o gasoil del año pasado</p>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="ais-pct">Ahorro estimado con el aislamiento</label>
                  <select id="ais-pct" className={styles.select} value={aisPorcentaje} onChange={e => setAisPorcentaje(e.target.value)}>
                    <option value="20">20% — Mejora leve (solo paredes)</option>
                    <option value="30">30% — Mejora media (paredes + forjado)</option>
                    <option value="40">40% — Aislamiento completo (tejado + paredes)</option>
                    <option value="50">50% — Rehabilitación energética integral</option>
                  </select>
                  <p className={styles.hint}>Referencia IDAE para viviendas en España</p>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="ais-inversion">Inversión total en el aislamiento (€)</label>
                  <input id="ais-inversion" type="text" inputMode="decimal" className={styles.input} placeholder="6000" value={aisInversion} onChange={e => setAisInversion(e.target.value)} />
                  <p className={styles.hint}>Opcional — para calcular el payback</p>
                </div>
              </>
            )}

            {tabActiva === 'ventanas' && (
              <>
                <p className={styles.panelTitle}><span aria-hidden="true">🪟</span> Cambio de ventanas</p>
                <div className={styles.inputRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="ven-num">Número de ventanas</label>
                    <input id="ven-num" type="text" inputMode="numeric" className={styles.input} placeholder="8" value={venNum} onChange={e => setVenNum(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="ven-m2">m² por ventana</label>
                    <input id="ven-m2" type="text" inputMode="decimal" className={styles.input} placeholder="1,5" value={venM2} onChange={e => setVenM2(e.target.value)} />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="ven-actual">Tipo de ventana actual</label>
                  <select id="ven-actual" className={styles.select} value={venActual} onChange={e => setVenActual(e.target.value)}>
                    <option value="simple">Vidrio simple (1 luna)</option>
                    <option value="doble">Doble acristalamiento básico</option>
                    <option value="doble-low-e">Doble acristalamiento Low-E</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="ven-nuevo">Tipo de ventana nueva</label>
                  <select id="ven-nuevo" className={styles.select} value={venNuevo} onChange={e => setVenNuevo(e.target.value)}>
                    <option value="doble">Doble acristalamiento básico</option>
                    <option value="doble-low-e">Doble acristalamiento Low-E (recomendado)</option>
                    <option value="triple">Triple acristalamiento</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="ven-coste">Gasto anual en calefacción / refrigeración (€)</label>
                  <input id="ven-coste" type="text" inputMode="decimal" className={styles.input} placeholder="900" value={venCoste} onChange={e => setVenCoste(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="ven-precioM2">Precio instalación (€/m² ventana)</label>
                  <input id="ven-precioM2" type="text" inputMode="decimal" className={styles.input} placeholder="350" value={venPrecioM2} onChange={e => setVenPrecioM2(e.target.value)} />
                  <p className={styles.hint}>Marco PVC: 250-400 €/m²; Aluminio RPT: 350-500 €/m²</p>
                </div>
              </>
            )}

            {tabActiva === 'calefaccion' && (
              <>
                <p className={styles.panelTitle}><span aria-hidden="true">🌡️</span> Comparativa caldera vs bomba de calor</p>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="cal-kwh">Consumo anual de calefacción (kWh)</label>
                  <input id="cal-kwh" type="text" inputMode="decimal" className={styles.input} placeholder="10000" value={calKwh} onChange={e => setCalKwh(e.target.value)} />
                  <p className={styles.hint}>Mira el consumo en tu factura de gas o gasoil</p>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="cal-precio">Precio actual combustible (€/kWh)</label>
                  <input id="cal-precio" type="text" inputMode="decimal" className={styles.input} placeholder="0,12" value={calPrecio} onChange={e => setCalPrecio(e.target.value)} />
                  <p className={styles.hint}>Gas natural ~0,10-0,13 €/kWh; Gasoil ~0,11 €/kWh</p>
                </div>
                <div className={styles.inputRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="cal-ef-actual">Rendimiento caldera actual (%)</label>
                    <select id="cal-ef-actual" className={styles.select} value={calEfActual} onChange={e => setCalEfActual(e.target.value)}>
                      <option value="70">70% — Caldera antigua</option>
                      <option value="85">85% — Caldera convencional</option>
                      <option value="90">90% — Caldera eficiente</option>
                      <option value="105">105% — Caldera de condensación</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="cal-ef-bc">SCOP bomba de calor (%)</label>
                    <select id="cal-ef-bc" className={styles.select} value={calEfBC} onChange={e => setCalEfBC(e.target.value)}>
                      <option value="250">250% (COP 2,5) — Zona fría</option>
                      <option value="300">300% (COP 3,0) — Media España</option>
                      <option value="350">350% (COP 3,5) — Zona templada</option>
                      <option value="400">400% (COP 4,0) — Zona cálida / costera</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="cal-inversion">Inversión bomba de calor (€)</label>
                  <input id="cal-inversion" type="text" inputMode="decimal" className={styles.input} placeholder="8000" value={calInversion} onChange={e => setCalInversion(e.target.value)} />
                  <p className={styles.hint}>Bomba de calor + instalación: 5.000 – 15.000 €</p>
                </div>
                <div className={styles.warningBox} role="note">
                  💡 El cálculo asume precio eléctrico de referencia de 0,18 €/kWh. El ahorro real depende de la tarifa contratada y el uso.
                </div>
              </>
            )}

            <button onClick={calcular} className={styles.btnPrimary}>
              Calcular ahorro y amortización
            </button>
          </div>

          {/* Panel resultados */}
          <div className={styles.panel}>
            <p className={styles.panelTitle}><span aria-hidden="true">📊</span> Resultado</p>
            {resultados ? (
              <div role="region" aria-label="Resultados del cálculo energético">
                {resultados.map((r, i) => (
                  <div
                    key={i}
                    className={`${styles.resultItem} ${r.tipo === 'destacado' ? styles.resultHighlight : ''} ${r.tipo === 'bueno' ? styles.resultGood : ''}`}
                  >
                    <span className={styles.resultLabel}>{r.etiqueta}</span>
                    <span className={styles.resultValue}>{r.valor}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>⚡ Introduce los datos y pulsa <strong>Calcular</strong></p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Obtendrás el ahorro anual estimado y el plazo de amortización de tu inversión.</p>
              </div>
            )}
          </div>
        </div>

        <DisclaimerCard
          variant="general"
          severity="medium"
          context="calculadora-eficiencia-energetica"
          collapsible={true}
        />

        <EducationalSection
          title="📚 Guía de eficiencia energética en el hogar"
          subtitle="Qué mejoras tienen mayor impacto y cómo aprovechar las ayudas públicas"
        >
          <section className={styles.guideSection}>
            <h2>¿Por dónde se escapa el calor de tu casa?</h2>
            <p>
              Según el IDAE (Instituto para la Diversificación y Ahorro de la Energía), una vivienda sin aislamiento
              pierde calor principalmente por:
            </p>
            <table className={styles.tipTable}>
              <thead>
                <tr><th>Zona</th><th>Pérdida estimada</th></tr>
              </thead>
              <tbody>
                <tr><td>Tejado / cubierta</td><td>25 – 30%</td></tr>
                <tr><td>Paredes</td><td>20 – 25%</td></tr>
                <tr><td>Ventanas y puertas</td><td>15 – 20%</td></tr>
                <tr><td>Suelo / forjado</td><td>10 – 15%</td></tr>
                <tr><td>Puentes térmicos</td><td>10 – 15%</td></tr>
              </tbody>
            </table>

            <h3>Aislamiento: prioridad por rentabilidad</h3>
            <p>
              El tejado es la mejora más rentable en la mayoría de viviendas unifamiliares españolas.
              Un buen aislamiento de cubierta puede reducir la factura de calefacción entre un 25 y un 35%.
              El coste orientativo del aislamiento por proyección de poliuretano o celulosa está entre 20 y 40 €/m².
            </p>

            <h3>Ventanas: cuándo merece la pena cambiarlas</h3>
            <p>
              Si tienes ventanas de vidrio simple o doble acristalamiento básico anterior a 2000,
              el cambio a ventanas Low-E o triple puede reducir las pérdidas por huecos entre un 40 y un 60%.
              El payback típico en España es de 10-20 años según la zona climática.
            </p>

            <h3>Bomba de calor: la alternativa al gas</h3>
            <p>
              Una bomba de calor aerotérmica con SCOP 3,0 produce 3 kWh de calor por cada 1 kWh de electricidad consumido.
              Frente a una caldera de gas natural, el ahorro depende de la diferencia de precio entre gas y electricidad.
              Con los precios actuales en España, el ahorro puede ser del 20-40% en zonas templadas.
            </p>

            <h3>Ayudas y subvenciones (2025-2026)</h3>
            <ul>
              <li><strong>Plan de Recuperación (PERTE)</strong>: hasta el 40-80% para rehabilitación energética</li>
              <li><strong>Programa PREE 5000</strong>: edificios con calificación E, F o G</li>
              <li><strong>Deducción IRPF</strong>: hasta el 20-40% sobre la inversión en mejoras energéticas</li>
              <li><strong>Comunidades Autónomas</strong>: consulta las ayudas específicas de tu región en el Portal de Financiación del IDAE</li>
            </ul>
            <p>
              Recuerda que para muchas ayudas necesitarás el <strong>Certificado de Eficiencia Energética</strong>
              antes y después de la reforma. El coste del certificado está entre 100 y 300 €.
            </p>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('calculadora-eficiencia-energetica')} />
        <ShareCard appName="calculadora-eficiencia-energetica" />
        <Footer appName="calculadora-eficiencia-energetica" />
      </div>
    </>
  );
}
