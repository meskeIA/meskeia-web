'use client';

import { useState } from 'react';
import styles from './CalculadoraMateriales.module.css';
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

type TabType = 'azulejos' | 'pintura' | 'tarima' | 'mortero';

interface ResultadoMaterial {
  etiqueta: string;
  valor: string;
  destacado?: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function parseNum(v: string): number {
  return parseSpanishNumber(v) || 0;
}

function calcularAzulejos(
  largo: number,
  ancho: number,
  desperdicio: number,
  coberturasCaja: number,
  precioCaja: number
): ResultadoMaterial[] {
  const m2brutos = largo * ancho;
  const factor = 1 + desperdicio / 100;
  const m2necesarios = m2brutos * factor;
  const cajas = Math.ceil(m2necesarios / coberturasCaja);
  const coste = cajas * precioCaja;
  return [
    { etiqueta: 'Superficie a cubrir', valor: `${formatNumber(m2brutos, 2)} m²` },
    { etiqueta: `Superficie + desperdicio (${desperdicio}%)`, valor: `${formatNumber(m2necesarios, 2)} m²` },
    { etiqueta: 'Cajas necesarias', valor: `${cajas} cajas`, destacado: true },
    { etiqueta: 'Piezas de margen', valor: `${formatNumber((cajas * coberturasCaja - m2necesarios), 2)} m² extra` },
    ...(precioCaja > 0 ? [{ etiqueta: 'Coste estimado', valor: `${formatNumber(coste, 2)} €`, destacado: true }] : []),
  ];
}

function calcularPintura(
  largo: number,
  ancho: number,
  alto: number,
  puertas: number,
  ventanas: number,
  manos: number,
  rendimiento: number,
  litrosBote: number,
  precioBote: number
): ResultadoMaterial[] {
  const perimetro = 2 * (largo + ancho);
  const m2paredes = perimetro * alto;
  const techo = largo * ancho;
  const huecosDescontados = puertas * 1.9 + ventanas * 1.2; // m² aprox
  const m2neto = Math.max(0, m2paredes + techo - huecosDescontados);
  const litros = (m2neto * manos) / rendimiento;
  const botes = Math.ceil(litros / litrosBote);
  const coste = botes * precioBote;
  return [
    { etiqueta: 'Área paredes + techo', valor: `${formatNumber(m2paredes + techo, 2)} m²` },
    { etiqueta: 'Área neta (descontando huecos)', valor: `${formatNumber(m2neto, 2)} m²`, destacado: true },
    { etiqueta: `Litros necesarios (${manos} manos)`, valor: `${formatNumber(litros, 1)} L` },
    { etiqueta: 'Botes necesarios', valor: `${botes} botes de ${formatNumber(litrosBote, 0)} L`, destacado: true },
    ...(precioBote > 0 ? [{ etiqueta: 'Coste estimado', valor: `${formatNumber(coste, 2)} €`, destacado: true }] : []),
  ];
}

function calcularTarima(
  largo: number,
  ancho: number,
  desperdicio: number,
  m2Paquete: number,
  precioPaquete: number
): ResultadoMaterial[] {
  const m2brutos = largo * ancho;
  const factor = 1 + desperdicio / 100;
  const m2necesarios = m2brutos * factor;
  const paquetes = Math.ceil(m2necesarios / m2Paquete);
  const coste = paquetes * precioPaquete;
  return [
    { etiqueta: 'Superficie a cubrir', valor: `${formatNumber(m2brutos, 2)} m²` },
    { etiqueta: `Superficie + cortes (${desperdicio}%)`, valor: `${formatNumber(m2necesarios, 2)} m²` },
    { etiqueta: 'Paquetes necesarios', valor: `${paquetes} paquetes`, destacado: true },
    { etiqueta: 'Excedente', valor: `${formatNumber((paquetes * m2Paquete - m2necesarios), 2)} m² extra` },
    ...(precioPaquete > 0 ? [{ etiqueta: 'Coste estimado', valor: `${formatNumber(coste, 2)} €`, destacado: true }] : []),
  ];
}

function calcularMortero(
  m2: number,
  tipoMortero: string,
  precioBolsa: number
): ResultadoMaterial[] {
  // kg por m² según tipo (aprox)
  const kgPorM2: Record<string, number> = {
    'flexible': 4.5,
    'rapido': 4,
    'estandar': 5,
    'autonivelante': 3.5,
  };
  const kg = m2 * (kgPorM2[tipoMortero] || 4.5);
  const bolsas25 = Math.ceil(kg / 25);
  const bolsas20 = Math.ceil(kg / 20);
  const coste = bolsas25 * precioBolsa;
  return [
    { etiqueta: 'Consumo estimado', valor: `${formatNumber(kg, 1)} kg` },
    { etiqueta: 'Bolsas de 25 kg', valor: `${bolsas25} bolsas`, destacado: true },
    { etiqueta: 'Bolsas de 20 kg (alternativa)', valor: `${bolsas20} bolsas` },
    ...(precioBolsa > 0 ? [{ etiqueta: 'Coste estimado (bolsas 25 kg)', valor: `${formatNumber(coste, 2)} €`, destacado: true }] : []),
  ];
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function CalculadoraMaterialesPage() {
  const [tabActiva, setTabActiva] = useState<TabType>('azulejos');
  const [resultados, setResultados] = useState<ResultadoMaterial[] | null>(null);

  // Campos azulejos
  const [azLargo, setAzLargo] = useState('');
  const [azAncho, setAzAncho] = useState('');
  const [azDesperdicio, setAzDesperdicio] = useState('10');
  const [azCaja, setAzCaja] = useState('1');
  const [azPrecio, setAzPrecio] = useState('');

  // Campos pintura
  const [pLargo, setPLargo] = useState('');
  const [pAncho, setPAncho] = useState('');
  const [pAlto, setPAlto] = useState('2,5');
  const [pPuertas, setPPuertas] = useState('1');
  const [pVentanas, setPVentanas] = useState('1');
  const [pManos, setPManos] = useState('2');
  const [pRendimiento, setPRendimiento] = useState('10');
  const [pLitrosBote, setPLitrosBote] = useState('5');
  const [pPrecio, setPPrecio] = useState('');

  // Campos tarima
  const [tLargo, setTLargo] = useState('');
  const [tAncho, setTAncho] = useState('');
  const [tDesperdicio, setTDesperdicio] = useState('10');
  const [tPaquete, setTPaquete] = useState('2,13');
  const [tPrecio, setTPrecio] = useState('');

  // Campos mortero
  const [mM2, setMM2] = useState('');
  const [mTipo, setMTipo] = useState('flexible');
  const [mPrecio, setMPrecio] = useState('');

  const calcular = () => {
    setResultados(null);
    if (tabActiva === 'azulejos') {
      const largo = parseNum(azLargo);
      const ancho = parseNum(azAncho);
      const desperdicio = parseNum(azDesperdicio);
      const cobCaja = parseNum(azCaja);
      const precio = parseNum(azPrecio);
      if (!largo || !ancho || !cobCaja) return;
      setResultados(calcularAzulejos(largo, ancho, desperdicio, cobCaja, precio));
    } else if (tabActiva === 'pintura') {
      const largo = parseNum(pLargo);
      const ancho = parseNum(pAncho);
      const alto = parseNum(pAlto);
      const puertas = parseNum(pPuertas);
      const ventanas = parseNum(pVentanas);
      const manos = parseNum(pManos);
      const rendimiento = parseNum(pRendimiento);
      const litrosBote = parseNum(pLitrosBote);
      const precio = parseNum(pPrecio);
      if (!largo || !ancho || !alto || !manos || !rendimiento || !litrosBote) return;
      setResultados(calcularPintura(largo, ancho, alto, puertas, ventanas, manos, rendimiento, litrosBote, precio));
    } else if (tabActiva === 'tarima') {
      const largo = parseNum(tLargo);
      const ancho = parseNum(tAncho);
      const desperdicio = parseNum(tDesperdicio);
      const paquete = parseNum(tPaquete);
      const precio = parseNum(tPrecio);
      if (!largo || !ancho || !paquete) return;
      setResultados(calcularTarima(largo, ancho, desperdicio, paquete, precio));
    } else if (tabActiva === 'mortero') {
      const m2 = parseNum(mM2);
      const precio = parseNum(mPrecio);
      if (!m2) return;
      setResultados(calcularMortero(m2, mTipo, precio));
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
          <h1 className={styles.title}>🧱 Calculadora de Materiales de Construcción</h1>
          <p className={styles.subtitle}>
            Calcula azulejos, pintura, tarima y mortero con desperdicio incluido
          </p>
        </header>

        <LegalNotice />

        {/* Tabs */}
        <div className={styles.tabs} role="tablist" aria-label="Tipo de material">
          {([
            { id: 'azulejos', label: 'Azulejos / Suelo', emoji: '⬛' },
            { id: 'pintura', label: 'Pintura', emoji: '🎨' },
            { id: 'tarima', label: 'Tarima / Parquet', emoji: '🪵' },
            { id: 'mortero', label: 'Mortero', emoji: '🏗️' },
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

        {/* Contenido por tab */}
        <div className={styles.grid}>
          {/* PANEL IZQUIERDO: Inputs */}
          <div className={styles.panel}>
            {tabActiva === 'azulejos' && (
              <>
                <p className={styles.panelTitle}><span aria-hidden="true">⬛</span> Datos de azulejos o baldosas</p>
                <div className={styles.inputRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="az-largo">Largo de la zona (m)</label>
                    <input id="az-largo" type="text" inputMode="decimal" className={styles.input} placeholder="4" value={azLargo} onChange={e => setAzLargo(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="az-ancho">Ancho de la zona (m)</label>
                    <input id="az-ancho" type="text" inputMode="decimal" className={styles.input} placeholder="3" value={azAncho} onChange={e => setAzAncho(e.target.value)} />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="az-desperdicio">Porcentaje de desperdicio (%)</label>
                  <select id="az-desperdicio" className={styles.select} value={azDesperdicio} onChange={e => setAzDesperdicio(e.target.value)}>
                    <option value="5">5% — Instalación recta sencilla</option>
                    <option value="10">10% — Instalación estándar (recomendado)</option>
                    <option value="15">15% — Cortes en diagonal o zonas irregulares</option>
                    <option value="20">20% — Diseños complejos o muchas piezas pequeñas</option>
                  </select>
                  <p className={styles.hint}>Incluye cortes, roturas y piezas defectuosas</p>
                </div>
                <div className={styles.inputRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="az-caja">Cobertura por caja (m²)</label>
                    <input id="az-caja" type="text" inputMode="decimal" className={styles.input} placeholder="1,00" value={azCaja} onChange={e => setAzCaja(e.target.value)} />
                    <p className={styles.hint}>Ver dato en el embalaje</p>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="az-precio">Precio por caja (€, opcional)</label>
                    <input id="az-precio" type="text" inputMode="decimal" className={styles.input} placeholder="25,00" value={azPrecio} onChange={e => setAzPrecio(e.target.value)} />
                  </div>
                </div>
              </>
            )}

            {tabActiva === 'pintura' && (
              <>
                <p className={styles.panelTitle}><span aria-hidden="true">🎨</span> Datos de la habitación y pintura</p>
                <div className={styles.inputRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="p-largo">Largo (m)</label>
                    <input id="p-largo" type="text" inputMode="decimal" className={styles.input} placeholder="5" value={pLargo} onChange={e => setPLargo(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="p-ancho">Ancho (m)</label>
                    <input id="p-ancho" type="text" inputMode="decimal" className={styles.input} placeholder="4" value={pAncho} onChange={e => setPAncho(e.target.value)} />
                  </div>
                </div>
                <div className={styles.inputRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="p-alto">Altura (m)</label>
                    <input id="p-alto" type="text" inputMode="decimal" className={styles.input} placeholder="2,5" value={pAlto} onChange={e => setPAlto(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="p-manos">Número de manos</label>
                    <select id="p-manos" className={styles.select} value={pManos} onChange={e => setPManos(e.target.value)}>
                      <option value="1">1 mano</option>
                      <option value="2">2 manos (recomendado)</option>
                      <option value="3">3 manos</option>
                    </select>
                  </div>
                </div>
                <div className={styles.inputRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="p-puertas">Puertas (nº)</label>
                    <input id="p-puertas" type="text" inputMode="numeric" className={styles.input} placeholder="1" value={pPuertas} onChange={e => setPPuertas(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="p-ventanas">Ventanas (nº)</label>
                    <input id="p-ventanas" type="text" inputMode="numeric" className={styles.input} placeholder="1" value={pVentanas} onChange={e => setPVentanas(e.target.value)} />
                  </div>
                </div>
                <div className={styles.inputRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="p-rendimiento">Rendimiento (m²/L)</label>
                    <input id="p-rendimiento" type="text" inputMode="decimal" className={styles.input} placeholder="10" value={pRendimiento} onChange={e => setPRendimiento(e.target.value)} />
                    <p className={styles.hint}>Ver etiqueta del bote</p>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="p-litros">Litros por bote</label>
                    <input id="p-litros" type="text" inputMode="decimal" className={styles.input} placeholder="5" value={pLitrosBote} onChange={e => setPLitrosBote(e.target.value)} />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="p-precio">Precio por bote (€, opcional)</label>
                  <input id="p-precio" type="text" inputMode="decimal" className={styles.input} placeholder="18,00" value={pPrecio} onChange={e => setPPrecio(e.target.value)} />
                </div>
              </>
            )}

            {tabActiva === 'tarima' && (
              <>
                <p className={styles.panelTitle}><span aria-hidden="true">🪵</span> Datos de tarima o parquet</p>
                <div className={styles.inputRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="t-largo">Largo de la zona (m)</label>
                    <input id="t-largo" type="text" inputMode="decimal" className={styles.input} placeholder="4" value={tLargo} onChange={e => setTLargo(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="t-ancho">Ancho de la zona (m)</label>
                    <input id="t-ancho" type="text" inputMode="decimal" className={styles.input} placeholder="3" value={tAncho} onChange={e => setTAncho(e.target.value)} />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="t-desperdicio">Porcentaje de cortes (%)</label>
                  <select id="t-desperdicio" className={styles.select} value={tDesperdicio} onChange={e => setTDesperdicio(e.target.value)}>
                    <option value="5">5% — Instalación recta</option>
                    <option value="10">10% — Instalación estándar (recomendado)</option>
                    <option value="15">15% — Instalación en diagonal (45°)</option>
                    <option value="20">20% — Espiga o diseños complejos</option>
                  </select>
                </div>
                <div className={styles.inputRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="t-paquete">m² por paquete</label>
                    <input id="t-paquete" type="text" inputMode="decimal" className={styles.input} placeholder="2,13" value={tPaquete} onChange={e => setTPaquete(e.target.value)} />
                    <p className={styles.hint}>Ver dato en el embalaje</p>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="t-precio">Precio por paquete (€, opcional)</label>
                    <input id="t-precio" type="text" inputMode="decimal" className={styles.input} placeholder="45,00" value={tPrecio} onChange={e => setTPrecio(e.target.value)} />
                  </div>
                </div>
              </>
            )}

            {tabActiva === 'mortero' && (
              <>
                <p className={styles.panelTitle}><span aria-hidden="true">🏗️</span> Datos de mortero o adhesivo</p>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="m-m2">Superficie a alicatar (m²)</label>
                  <input id="m-m2" type="text" inputMode="decimal" className={styles.input} placeholder="12" value={mM2} onChange={e => setMM2(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="m-tipo">Tipo de mortero</label>
                  <select id="m-tipo" className={styles.select} value={mTipo} onChange={e => setMTipo(e.target.value)}>
                    <option value="flexible">Adhesivo flexible (recomendado general) — 4,5 kg/m²</option>
                    <option value="estandar">Adhesivo estándar (suelos interiores) — 5 kg/m²</option>
                    <option value="rapido">Adhesivo rápido (fraguado rápido) — 4 kg/m²</option>
                    <option value="autonivelante">Autonivelante (nivelación de suelos) — 3,5 kg/m²</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="m-precio">Precio por bolsa de 25 kg (€, opcional)</label>
                  <input id="m-precio" type="text" inputMode="decimal" className={styles.input} placeholder="12,00" value={mPrecio} onChange={e => setMPrecio(e.target.value)} />
                </div>
                <div className={styles.warningBox} role="note">
                  💡 El consumo real puede variar según la planitud del soporte y el grosor de aplicación.
                </div>
              </>
            )}

            <button onClick={calcular} className={styles.btnPrimary} aria-label="Calcular materiales necesarios">
              Calcular materiales
            </button>
          </div>

          {/* PANEL DERECHO: Resultados */}
          <div className={styles.panel}>
            <p className={styles.panelTitle}><span aria-hidden="true">📊</span> Resultado</p>
            {resultados ? (
              <div role="region" aria-label="Resultados del cálculo">
                {resultados.map((r, i) => (
                  <div key={i} className={`${styles.resultItem} ${r.destacado ? styles.resultHighlight : ''}`}>
                    <span className={styles.resultLabel}>{r.etiqueta}</span>
                    <span className={styles.resultValue}>{r.valor}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState} aria-label="Sin resultados aún">
                <p>🧮 Introduce los datos y pulsa <strong>Calcular materiales</strong></p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Los resultados incluirán desperdicio y coste opcional.</p>
              </div>
            )}
          </div>
        </div>

        <DisclaimerCard
          variant="financial"
          severity="critical"
          context="calculadora-materiales-construccion"
        />

        {/* Sección educativa */}
        <EducationalSection
          title="📚 Guía de materiales para reformas"
          subtitle="Consejos y referencias para calcular bien antes de ir a la tienda"
        >
          <section className={styles.guideSection}>
            <h2>¿Cómo calcular bien los materiales antes de ir a la tienda?</h2>
            <p>
              Un error de cálculo puede obligarte a volver a la tienda y arriesgar que el lote o color no coincida.
              Sigue estos pasos para no quedarte corto ni comprar de más.
            </p>

            {/* Guía paso a paso */}
            <h3>📋 Guía paso a paso para calcular materiales</h3>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <strong>Mide con precisión y añade los huecos</strong>
                  <p>Mide el largo y ancho de la zona a cubrir. Para pintura, mide también la altura y cuenta puertas y ventanas para descontarlas. Un error de 10 cm en 4 m es solo el 2,5%, pero puede costarte una caja extra.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <strong>Elige el porcentaje de desperdicio adecuado</strong>
                  <p>Instalación recta: 5–8%. Estándar: 10%. En diagonal: 12–15%. Diseño complejo o espiga: 15–20%. Si el material tiene variación de tono, suma otro 5% y guarda piezas para reparaciones.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <strong>Consulta la cobertura exacta del embalaje</strong>
                  <p>El dato de m² por caja o paquete está en el embalaje físico, no siempre en la web. Asegúrate de usar el dato del lote exacto que vas a comprar, ya que puede variar entre modelos del mismo fabricante.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <strong>Compra todo del mismo lote de fabricación</strong>
                  <p>El número de lote (o &quot;shade number&quot;) garantiza que el tono es idéntico. Dos lotes distintos del mismo modelo pueden tener variaciones visibles de color o textura. Compra todo de una vez.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <strong>Calcula el mortero o adhesivo aparte</strong>
                  <p>El consumo de mortero es independiente de los azulejos: depende de la planitud del soporte y el tipo de adhesivo. Para suelos interiores en buen estado, cuenta 4–5 kg/m²; en exteriores irregulares, 6–8 kg/m².</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>6</div>
                <div className={styles.stepContent}>
                  <strong>Guarda material sobrante para futuras reparaciones</strong>
                  <p>Aunque sobre alguna caja, guárdala. Si necesitas reparar en el futuro, el modelo puede estar descatalogado o con variación de tono. 1–2 cajas guardadas pueden evitar una reforma parcial completa.</p>
                </div>
              </div>
            </div>

            {/* Tabla comparativa de desperdicios */}
            <h3>⚖️ Comparativa: ¿qué porcentaje de desperdicio usar?</h3>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Tipo de instalación</th>
                    <th>Desperdicio</th>
                    <th>Cuándo usar</th>
                    <th>Material más afectado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Recta básica</strong></td>
                    <td>5 – 8%</td>
                    <td>Habitaciones cuadradas, pocas paredes</td>
                    <td>Tarima, grandes formatos</td>
                  </tr>
                  <tr>
                    <td><strong>Estándar</strong> ✅ Recomendado</td>
                    <td>10%</td>
                    <td>La mayoría de reformas</td>
                    <td>Azulejos, tarima, mortero</td>
                  </tr>
                  <tr>
                    <td><strong>En diagonal (45°)</strong></td>
                    <td>12 – 15%</td>
                    <td>Suelos con diseño en diagonal</td>
                    <td>Azulejos, tarima</td>
                  </tr>
                  <tr>
                    <td><strong>Espiga / Herringbone</strong></td>
                    <td>15 – 20%</td>
                    <td>Tarima en espiga, mosaicos pequeños</td>
                    <td>Tarima estrecha, mosaico</td>
                  </tr>
                  <tr>
                    <td><strong>Zonas muy irregulares</strong></td>
                    <td>20%+</td>
                    <td>Muchos recortes, columnas, escaleras</td>
                    <td>Todos los materiales</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Casos de uso */}
            <h3>💼 Casos de uso habituales</h3>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🛁</span>
                  <strong>Reformar un baño completo</strong>
                </div>
                <div className={styles.escenarioExample}>
                  Baño 2×2 m: ~4 m² suelo + ~20 m² paredes.<br/>
                  Azulejo 30×60 cm: ~7 cajas suelo + ~35 cajas paredes.<br/>
                  Adhesivo flexible: ~2 + ~9 bolsas 25 kg.
                </div>
                <p className={styles.escenarioTip}><strong>Consejo:</strong> En baños, usa siempre adhesivo flexible (C2) porque soporta mejor la humedad y las dilataciones térmicas que el estándar.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🛋️</span>
                  <strong>Pintar un salón-cocina abierto</strong>
                </div>
                <div className={styles.escenarioExample}>
                  Salón 5×4×2,5 m: ~40 m² paredes netas + 20 m² techo.<br/>
                  Pintura mate (10 m²/L, 2 manos): ~12 L → 3 botes de 4 L.
                </div>
                <p className={styles.escenarioTip}><strong>Consejo:</strong> Si cambias de color oscuro a claro, añade una mano de imprimación. Te ahorrará una tercera mano de pintura y mejora la cobertura.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🪵</span>
                  <strong>Tarima flotante en toda la planta</strong>
                </div>
                <div className={styles.escenarioExample}>
                  Planta 80 m² con obstáculos (columnas, escalera).<br/>
                  Tarima 2,13 m²/paquete + 15% desperdicio: ~44 paquetes.
                </div>
                <p className={styles.escenarioTip}><strong>Consejo:</strong> Con columnas y obstáculos, aumenta el desperdicio al 12–15%. Cada corte alrededor de un obstáculo genera más sobrante que una pared recta.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🏡</span>
                  <strong>Terrazas y exteriores</strong>
                </div>
                <div className={styles.escenarioExample}>
                  Terraza 6×3 m: 18 m² + 10% desperdicio = 19,8 m².<br/>
                  Porcelánico 60×60: ~18 cajas. Mortero exterior: ~9 bolsas.
                </div>
                <p className={styles.escenarioTip}><strong>Consejo:</strong> En exterior usa mortero de cemento cola para exteriores (clasificación C2TE o mejor). El adhesivo estándar no resiste ciclos hielo-deshielo.</p>
              </div>
            </div>

            {/* Mejores prácticas */}
            <h3>✅ Mejores prácticas de compra</h3>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🔢</span>
                <strong>Redondea siempre hacia arriba</strong>
                <p>Si necesitas 7,3 cajas, compra 8. Nunca redondees hacia abajo: quedarte sin material a mitad de obra es mucho más caro que tener una caja de sobra.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🏷️</span>
                <strong>Verifica el número de lote</strong>
                <p>El lote (shade/calibre) garantiza tono uniforme. Pide al vendedor que compruebe que todas las cajas son del mismo lote antes de facturar.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📦</span>
                <strong>Compra el mortero al final</strong>
                <p>El consumo real de mortero depende de la obra. Compra el 80% inicial y el resto al avanzar. Los sacos abiertos absorben humedad y pierden resistencia.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🎨</span>
                <strong>Pide muestra física de pintura</strong>
                <p>El color en pantalla puede diferir hasta un 20% del real. Pide una muestra o compra el bote más pequeño disponible antes de pintar toda la habitación.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📏</span>
                <strong>Mide dos veces, compra una</strong>
                <p>Mide la habitación en al menos 2 puntos distintos. Las habitaciones raramente son perfectamente cuadradas y la diferencia puede ser de 5–10 cm.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🏪</span>
                <strong>Consulta la política de devolución</strong>
                <p>Muchas tiendas de materiales aceptan devolución de material no abierto. Si compras 1-2 cajas extra y sobran, puedes devolverlas sin coste.</p>
              </div>
            </div>

            {/* Warning box */}
            <div className={styles.warningBoxV2}>
              <div className={styles.warningHeader}>
                <span>⚠️</span>
                <span>Errores comunes que encarecen la reforma</span>
              </div>
              <ul className={styles.warningList}>
                <li><strong>❌ Calcular sin desperdicio:</strong> Olvidar los cortes puede suponer quedarte corto en un 8–20%. Comprar material adicional de otra partida puede no coincidir en tono o calibre.</li>
                <li><strong>❌ Comprar de distintos lotes:</strong> Aunque el modelo sea idéntico, lotes distintos pueden tener variaciones de color visibles. Pide siempre el mismo número de lote.</li>
                <li><strong>❌ Usar adhesivo estándar en exteriores:</strong> El adhesivo C1 no está diseñado para ciclos de temperatura extremos. En terrazas y exteriores usa siempre C2TE o superior.</li>
                <li><strong>❌ Pintar sobre superficie sin preparar:</strong> Pintar sobre humedad, polvo o paredes desconchadas reduce la vida útil a menos de 2 años. Imprimación y saneado previo son imprescindibles.</li>
                <li><strong>❌ Comprar la tarima sin aclimatarla:</strong> La tarima debe reposar 48 h en la habitación donde se va a instalar para adaptarse a la temperatura y humedad del ambiente.</li>
              </ul>
            </div>

            {/* FAQ */}
            <h3>❓ Preguntas frecuentes</h3>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <strong>¿Cuántas cajas de azulejos necesito para un baño estándar?</strong>
                <p>Un baño de 4–6 m² de suelo y 20–25 m² de pared necesita aproximadamente 5–8 cajas para el suelo y 35–45 cajas para las paredes, dependiendo del formato del azulejo y el porcentaje de desperdicio. Usa la calculadora introduciendo las dimensiones exactas para un cálculo preciso.</p>
                <p className={styles.faqTip}>💡 <strong>Consejo:</strong> Para baños pequeños con muchos recortes alrededor de sanitarios, añade un 15% de desperdicio en lugar del 10% estándar.</p>
              </div>
              <div className={styles.faqItem}>
                <strong>¿Cuántos litros de pintura necesito para una habitación de 12 m²?</strong>
                <p>Una habitación de 3×4 m con 2,5 m de altura tiene aproximadamente 35 m² de paredes netas (descontando puerta y ventana) más 12 m² de techo. Con 2 manos y rendimiento de 10 m²/L, necesitas unos 9,4 L → 2 botes de 5 L.</p>
                <p className={styles.faqTip}>💡 <strong>Consejo:</strong> Si pintas sobre un color oscuro, aplica primero una mano de pintura de imprimación o selladora para evitar que el color anterior traspase.</p>
              </div>
              <div className={styles.faqItem}>
                <strong>¿Qué es el &quot;calibre&quot; de los azulejos y cómo afecta al cálculo?</strong>
                <p>El calibre indica las dimensiones reales del azulejo, que pueden variar ±2–3 mm respecto al tamaño nominal. Si mezclas distintos calibres, el resultado es visible en las juntas. Al calcular, usa el m² del embalaje (que ya incluye la junta estándar de 1,5–3 mm).</p>
              </div>
              <div className={styles.faqItem}>
                <strong>¿Cuántos sacos de mortero necesito para alicatar 20 m²?</strong>
                <p>Para azulejos cerámicos en interiores con adhesivo flexible (C2): aproximadamente 4,5 kg/m² × 20 m² = 90 kg → 4 sacos de 25 kg. En exteriores o con soportes irregulares, puede subir a 6 kg/m² → 5 sacos.</p>
                <p className={styles.faqTip}>💡 <strong>Consejo:</strong> Compra 1 saco extra. El mortero sobrante sellado en bolsa puede conservarse 3–6 meses en lugar seco.</p>
              </div>
              <div className={styles.faqItem}>
                <strong>¿Puedo instalar tarima sobre tarima existente?</strong>
                <p>Sí, si la tarima existente está bien fijada, sin crujidos y con menos de 3 mm de desnivel. Pero aumenta el desperdicio al 12–15% por las adaptaciones a la tarima existente, y necesitarás umbral de transición si hay diferencia de nivel con otras estancias.</p>
              </div>
              <div className={styles.faqItem}>
                <strong>¿Qué ocurre si me faltan 2–3 cajas después de empezar la obra?</strong>
                <p>Si el modelo sigue disponible, pide el mismo número de lote. Si no hay stock del mismo lote, existe riesgo de variación de tono. En ese caso, usa las cajas nuevas en las zonas menos visibles (traseras, dentro de armarios) y las originales en zonas nobles.</p>
              </div>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('calculadora-materiales-construccion')} />
        <ShareCard appName="calculadora-materiales-construccion" />
        <Footer appName="calculadora-materiales-construccion" />
    </div>
  );
}
