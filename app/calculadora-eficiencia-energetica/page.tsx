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
          variant="financial"
          severity="critical"
          context="calculadora-eficiencia-energetica"
        />

        <EducationalSection
          title="📚 Guía de eficiencia energética en el hogar"
          subtitle="Qué mejoras tienen mayor impacto y cómo aprovechar las ayudas públicas"
        >
          <section className={styles.guideSection}>
            <h2>¿Cómo planificar una mejora de eficiencia energética en tu hogar?</h2>
            <p>
              Mejorar la eficiencia energética de tu vivienda puede reducir la factura entre un 20 y un 70%.
              Pero no todas las mejoras tienen el mismo retorno. Sigue este orden para maximizar el impacto.
            </p>

            {/* Guía paso a paso */}
            <h3>📋 Hoja de ruta para rehabilitar energéticamente tu vivienda</h3>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <strong>Obtén el Certificado de Eficiencia Energética actual</strong>
                  <p>Es obligatorio para acceder a la mayoría de subvenciones y permite comparar antes/después. El coste oscila entre 100 y 300 €. Un técnico certificado realiza la visita y emite el informe oficial. Las viviendas E, F o G son las que mayor ahorro potencial tienen.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <strong>Prioriza el aislamiento de cubierta y fachada</strong>
                  <p>El tejado es la mejora con mayor retorno en España: una cubierta mal aislada supone el 25–30% de las pérdidas caloríficas. El coste del aislamiento de cubierta (proyección de espuma o celulosa) está entre 20 y 40 €/m², con payback de 5–10 años.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <strong>Sustituye ventanas antiguas de vidrio simple</strong>
                  <p>Las ventanas de vidrio simple tienen una transmitancia U de 5–6 W/m²K; las Low-E bajan a 1,1–1,4 W/m²K. El cambio puede reducir las pérdidas por huecos hasta un 60%. Prioriza las orientadas al norte, que reciben menos sol y tienen más pérdidas en invierno.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <strong>Evalúa cambiar el sistema de calefacción</strong>
                  <p>Con aislamiento mejorado, la demanda de calor baja y una bomba de calor puede resultar rentable incluso en zonas frías. Calcula el SCOP de la bomba según tu zona climática (zona A–E según el RITE) antes de decidir.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <strong>Solicita las ayudas antes de contratar la obra</strong>
                  <p>Muchas subvenciones (PREE 5000, Next Generation EU, deducciones IRPF) requieren solicitar la ayuda antes de iniciar los trabajos. Contrata una empresa instaladora registrada con el certificado RITE o REE correspondiente.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>6</div>
                <div className={styles.stepContent}>
                  <strong>Certifica la mejora y conserva la documentación</strong>
                  <p>Tras la obra, emite el nuevo certificado energético. La mejora de letra (ej. de E a C) documenta el ahorro y aumenta el valor de tasación de la vivienda entre un 5 y un 15% según estudios del IDAE y el Banco de España.</p>
                </div>
              </div>
            </div>

            {/* Tabla comparativa sistemas de calefacción */}
            <h3>⚖️ Comparativa: sistemas de calefacción</h3>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Sistema</th>
                    <th>Eficiencia</th>
                    <th>Coste instalación</th>
                    <th>Coste operación</th>
                    <th>Ideal para</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Caldera gas (condensación)</strong></td>
                    <td>~105%</td>
                    <td>2.000 – 4.000 €</td>
                    <td>Medio (gas ~0,10 €/kWh)</td>
                    <td>Zonas frías, con gas de red</td>
                  </tr>
                  <tr>
                    <td><strong>Bomba calor aerotérmica</strong></td>
                    <td>COP 2,5 – 4,0</td>
                    <td>6.000 – 14.000 €</td>
                    <td>Bajo-Medio (luz ~0,18 €/kWh)</td>
                    <td>Zonas templadas, sin gas</td>
                  </tr>
                  <tr>
                    <td><strong>Caldera gasoil</strong></td>
                    <td>~90%</td>
                    <td>2.500 – 5.000 €</td>
                    <td>Alto (gasoil ~0,11 €/kWh)</td>
                    <td>Rural sin acceso a gas</td>
                  </tr>
                  <tr>
                    <td><strong>Bomba calor + suelo radiante</strong></td>
                    <td>COP 3,5 – 5,0</td>
                    <td>12.000 – 22.000 €</td>
                    <td>Muy bajo</td>
                    <td>Obra nueva, rehabilitación integral</td>
                  </tr>
                  <tr>
                    <td><strong>Radiadores eléctricos</strong></td>
                    <td>100%</td>
                    <td>200 – 800 €</td>
                    <td>Muy alto (luz tarifa plena)</td>
                    <td>Complemento o uso esporádico</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Casos de uso */}
            <h3>💼 Escenarios habituales</h3>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🏠</span>
                  <strong>Vivienda unifamiliar años 70–80</strong>
                </div>
                <div className={styles.escenarioExample}>
                  Casa 150 m², letra G, caldera gasoil 20 años.<br/>
                  Factura calefacción: 2.200 €/año.<br/>
                  Mejora: aislamiento fachada + cubierta + ventanas Low-E + bomba calor.<br/>
                  Ahorro estimado: ~1.400 €/año. Payback: 12–15 años.
                </div>
                <p className={styles.escenarioTip}><strong>Clave:</strong> Sin aislamiento previo, instalar solo la bomba de calor no es rentable. El orden correcto es primero aislar, luego cambiar el sistema.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🏢</span>
                  <strong>Piso en bloque de los 90</strong>
                </div>
                <div className={styles.escenarioExample}>
                  Piso 80 m², 4ª planta, letra D, calefacción central.<br/>
                  Mejora individual: ventanas Low-E (8 ventanas).<br/>
                  Inversión: ~5.600 €. Ahorro: ~250 €/año.<br/>
                  Payback: ~22 años.
                </div>
                <p className={styles.escenarioTip}><strong>Clave:</strong> En pisos intermedios, el aislamiento de ventanas es la única mejora individual posible. La fachada y cubierta requieren acuerdo de comunidad.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🌊</span>
                  <strong>Vivienda en zona costera (clima suave)</strong>
                </div>
                <div className={styles.escenarioExample}>
                  Casa 120 m², Mediterráneo, caldera gas 15 años.<br/>
                  SCOP bomba calor zona A: 4,0.<br/>
                  Ahorro vs caldera gas: ~400 €/año.<br/>
                  Inversión BC: 9.000 €. Payback: ~22 años.
                </div>
                <p className={styles.escenarioTip}><strong>Clave:</strong> En zonas cálidas el ahorro en calefacción es menor, pero la BC también refrigera en verano. Considera el ahorro anual total (calefacción + refrigeración).</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>❄️</span>
                  <strong>Vivienda en zona fría (meseta norte)</strong>
                </div>
                <div className={styles.escenarioExample}>
                  Casa 160 m², Castilla, letra E, gas natural.<br/>
                  Aislamiento cubierta (90 m²): 3.200 €.<br/>
                  Ahorro estimado: ~480 €/año (30% de 1.600 €).<br/>
                  Payback: 6,7 años. ✅ Muy rentable.
                </div>
                <p className={styles.escenarioTip}><strong>Clave:</strong> En zonas frías con mucha demanda de calefacción, el aislamiento de cubierta tiene el payback más corto (5–8 años). Es la primera mejora a realizar.</p>
              </div>
            </div>

            {/* Mejores prácticas */}
            <h3>✅ Claves para maximizar el retorno de tu inversión</h3>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📋</span>
                <strong>Solicita 3 presupuestos siempre</strong>
                <p>Los precios de instalación de aislamiento y ventanas varían hasta un 40% entre empresas. Compara siempre al menos 3 presupuestos con las mismas especificaciones técnicas.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🏛️</span>
                <strong>Aprovecha las deducciones IRPF</strong>
                <p>Las mejoras que reducen la demanda en ≥30% tienen deducción del 40% en IRPF (hasta 7.500 €). Necesitas certificado energético antes y después. No lo dejes para la declaración siguiente.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📊</span>
                <strong>Prioriza por payback, no por ahorro absoluto</strong>
                <p>Un aislamiento que ahorra 300 €/año con inversión de 2.000 € (payback 6,7 años) es mejor inversión que unas ventanas que ahorran 400 €/año con inversión de 8.000 € (payback 20 años).</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>⚡</span>
                <strong>Instala fotovoltaica después del aislamiento</strong>
                <p>Si instalas placas antes de aislar, las sobredimensionas para una demanda que luego va a bajar. Primero reduce el consumo, luego genera tu propia energía.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🌡️</span>
                <strong>Considera la refrigeración al calcular la BC</strong>
                <p>En España, la bomba de calor también sirve como aire acondicionado. Si actualmente tienes splits de refrigeración, el ahorro total de la BC incluye también la sustitución del coste de refrigeración.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🏘️</span>
                <strong>En comunidades, acuerda por mayoría simple</strong>
                <p>Desde 2022, la Ley de Propiedad Horizontal permite aprobar obras de mejora energética con mayoría simple (antes 3/5). Es más fácil que nunca coordinar mejoras de fachada o cubierta comunitaria.</p>
              </div>
            </div>

            {/* Warning box */}
            <div className={styles.warningBoxV2}>
              <div className={styles.warningHeader}>
                <span>⚠️</span>
                <span>Errores que reducen el retorno de tu inversión</span>
              </div>
              <ul className={styles.warningList}>
                <li><strong>❌ Instalar la bomba de calor sin aislar primero:</strong> Una BC eficiente en una vivienda mal aislada trabaja al límite de su capacidad en días fríos y consume más de lo esperado. El ahorro real puede ser un 40% menor que el calculado.</li>
                <li><strong>❌ No solicitar la subvención antes de comenzar la obra:</strong> La mayoría de ayudas PREE 5000 y Next Generation requieren resolución favorable antes de iniciar los trabajos. Comenzar sin ella implica perder la subvención por completo.</li>
                <li><strong>❌ Comparar solo el precio de la caldera, no el coste total:</strong> Una caldera de condensación puede ser 1.000 € más cara que una convencional, pero su mayor eficiencia amortiza la diferencia en 2–3 años en climas fríos.</li>
                <li><strong>❌ Ignorar los puentes térmicos al aislar:</strong> Aislar fachada y cubierta sin corregir puentes térmicos (pilares, forjados, dinteles) puede dejar un 15–20% de las pérdidas sin resolver y generar condensaciones locales.</li>
                <li><strong>❌ Elegir el triple acristalamiento siempre:</strong> El triple acristalamiento solo compensa en zonas muy frías (zona D–E del RITE). En clima mediterráneo, el doble Low-E ofrece un payback 2–3 veces mejor con prestaciones similares.</li>
              </ul>
            </div>

            {/* FAQ */}
            <h3>❓ Preguntas frecuentes</h3>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <strong>¿Cuánto cuesta aislar el tejado de una casa de 100 m²?</strong>
                <p>El aislamiento de cubierta plana o inclinada por proyección de poliuretano o celulosa oscila entre 2.000 y 4.000 € para 100 m² (20–40 €/m²). La proyección de celulosa suele ser más económica y tiene mejor comportamiento higrométrico. El ahorro anual en calefacción puede ser de 300–600 € según la zona climática.</p>
                <p className={styles.faqTip}>💡 <strong>Consejo:</strong> Si el tejado necesita renovación de impermeabilización, combina la obra: el sobrecoste del aislamiento se reduce al compartir andamiaje y mano de obra.</p>
              </div>
              <div className={styles.faqItem}>
                <strong>¿Es mejor bomba de calor aerotérmica o geotérmica?</strong>
                <p>La geotérmica tiene COP más alto (4–6) pero requiere perforaciones o zanjas (10.000–30.000 € adicionales). En viviendas unifamiliares con jardín y demanda alta, puede ser rentable a muy largo plazo. Para la mayoría de casos en España, la aerotérmica ofrece mejor relación coste-beneficio con COP 3–4 y instalación 3–4 veces más barata.</p>
              </div>
              <div className={styles.faqItem}>
                <strong>¿Las mejoras energéticas aumentan el valor de mi vivienda?</strong>
                <p>Sí. Según estudios del Banco de España y el IDAE, cada mejora de letra energética aumenta el valor de tasación entre un 3 y un 8%. Una vivienda que mejora de G a C puede incrementar su valor entre un 15 y un 25%, especialmente en el mercado de segunda mano donde los compradores ya incorporan el coste energético a su análisis.</p>
                <p className={styles.faqTip}>💡 <strong>Consejo:</strong> Si estás pensando en vender en los próximos años, una inversión en aislamiento puede ser más rentable que una reforma estética.</p>
              </div>
              <div className={styles.faqItem}>
                <strong>¿Qué zona climática tengo y cómo afecta al cálculo?</strong>
                <p>España tiene 6 zonas climáticas según el RITE (α, A, B, C, D, E), de más cálido a más frío. Madrid es zona D, Barcelona zona C, Sevilla zona B y Burgos zona E. En zonas D–E, el payback del aislamiento se reduce a la mitad respecto a zonas A–B, porque la demanda de calefacción es mucho mayor.</p>
              </div>
              <div className={styles.faqItem}>
                <strong>¿Puedo deducirme las mejoras energéticas en el IRPF?</strong>
                <p>Sí. La deducción por obras de mejora energética en vivienda habitual es del 20% (reducción demanda calefacción/refrigeración ≥7%), 40% (reducción ≥30%) o 60% (rehabilitación energética del edificio completo). El límite máximo es 7.500 € de deducción por contribuyente. Requiere certificado energético previo y posterior.</p>
                <p className={styles.faqTip}>💡 <strong>Consejo:</strong> Coordina la obra con tu gestor fiscal. Las obras de diciembre pueden deducirse en la declaración del año siguiente.</p>
              </div>
              <div className={styles.faqItem}>
                <strong>¿Cuánto tarda en amortizarse el cambio de ventanas?</strong>
                <p>Depende de la zona climática y el tipo de ventana actual. Cambiar de vidrio simple a doble Low-E en zona D (Madrid) tiene un payback de 12–18 años. En zona A (Canarias, costas) puede superar los 25 años. El mayor beneficio del cambio de ventanas en zonas cálidas es el confort en verano, no el ahorro económico.</p>
              </div>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('calculadora-eficiencia-energetica')} />
        <ShareCard appName="calculadora-eficiencia-energetica" />
        <Footer appName="calculadora-eficiencia-energetica" />
    </div>
  );
}
