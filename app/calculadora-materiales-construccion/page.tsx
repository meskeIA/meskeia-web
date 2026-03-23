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
import { jsonLd } from './metadata';

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
          variant="general"
          severity="medium"
          context="calculadora-materiales-construccion"
          collapsible={true}
        />

        {/* Sección educativa */}
        <EducationalSection
          title="📚 Guía de materiales para reformas"
          subtitle="Consejos y referencias para calcular bien antes de ir a la tienda"
        >
          <section className={styles.guideSection}>
            <h2>¿Por qué es importante calcular bien los materiales?</h2>
            <p>
              Comprar de menos obliga a volver a la tienda y arriesga que el lote o color no coincida exactamente.
              Comprar de más genera gasto innecesario. Un cálculo preciso con el porcentaje de desperdicio adecuado
              es la base de cualquier reforma bien planificada.
            </p>

            <h3>Azulejos y baldosas: ¿cuánto desperdicio añadir?</h3>
            <table className={styles.tipTable}>
              <thead>
                <tr><th>Tipo de instalación</th><th>Desperdicio recomendado</th></tr>
              </thead>
              <tbody>
                <tr><td>Instalación recta (paralela a las paredes)</td><td>5 – 8%</td></tr>
                <tr><td>Estándar (la más habitual)</td><td>10%</td></tr>
                <tr><td>En diagonal (45°) o juntas de corte</td><td>12 – 15%</td></tr>
                <tr><td>Espiga, mosaico pequeño o diseño complejo</td><td>15 – 20%</td></tr>
              </tbody>
            </table>
            <p>
              Recuerda que si la cerámica tiene <strong>variación de tono</strong>, es recomendable comprar un 5%
              adicional y guardar algunas piezas para futuras reparaciones.
            </p>

            <h3>Pintura: claves del rendimiento</h3>
            <p>
              El rendimiento de la pintura (m²/litro) que indica el fabricante se mide normalmente en una sola mano
              sobre superficie preparada. Para paredes con imprimación previa, usa el dato del envase. Sin imprimación
              o sobre colores oscuros, necesitarás una mano extra.
            </p>
            <ul>
              <li>Pintura mate interior: 8 – 12 m²/L</li>
              <li>Pintura satinada o esmalte: 10 – 14 m²/L</li>
              <li>Pintura de techo (blanca): 8 – 10 m²/L</li>
            </ul>

            <h3>Tarima flotante: el porcentaje de corte</h3>
            <p>
              La tarima se vende en paquetes con una cantidad de m² determinada. Al instalarla, los cortes al final
              de cada fila generan desperdicio. Si instalas en diagonal, el desperdicio se duplica aproximadamente.
              Consulta siempre el dato del fabricante sobre m² por paquete antes de calcular.
            </p>

            <h3>Mortero y adhesivo cerámico</h3>
            <p>
              El consumo de mortero depende del grosor de la capa de adhesivo y de la planitud del soporte.
              En suelos interiores con buena base, 4 – 5 kg/m² es habitual. En exteriores o sobre soportes
              irregulares, puede subir a 6 – 8 kg/m². Revisa siempre las instrucciones del fabricante.
            </p>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('calculadora-materiales-construccion')} />
        <ShareCard appName="calculadora-materiales-construccion" />
        <Footer appName="calculadora-materiales-construccion" />
      </div>
    </>
  );
}
