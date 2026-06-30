'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './ComparadorElectrico.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  DisclaimerCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency, formatNumber } from '@/lib';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface FormData {
  precioElectrico: number;      // Precio del EV (€)
  precioGasolina: number;       // Precio del gasolina equivalente (€)
  moves: number;                // Subsidio MOVES III: 0 / 4500 / 7000
  kmAnuales: number;            // Km anuales
  consumoElectrico: number;     // kWh/100km
  consumoGasolina: number;      // L/100km
  precioLuz: number;            // €/kWh
  precioGasolinaLitro: number;  // €/L
  cargador: number;             // Coste cargador doméstico
  anios: number;                // Horizonte temporal
}

interface FilaAnual {
  anio: number;
  costeAcumEV: number;
  costeAcumGas: number;
  diferenciaAcum: number;  // positivo = EV ha ahorrado X€
}

interface Resultado {
  costePorKmEV: number;
  costePorKmGas: number;
  ahorroAnual: number;
  breakEvenAnio: number | null;  // null si no hay break-even en el horizonte
  tabla: FilaAnual[];
  inversionNetaEV: number;       // precioElectrico - precioGasolina - moves
}

// ─────────────────────────────────────────────
// Valores por defecto
// ─────────────────────────────────────────────

const FORM_INICIAL: FormData = {
  precioElectrico: 35000,
  precioGasolina: 25000,
  moves: 4500,
  kmAnuales: 15000,
  consumoElectrico: 16,
  consumoGasolina: 7,
  precioLuz: 0.18,
  precioGasolinaLitro: 1.65,
  cargador: 800,
  anios: 10,
};

// ─────────────────────────────────────────────
// Lógica de cálculo
// ─────────────────────────────────────────────

function calcular(form: FormData): Resultado {
  const {
    precioElectrico,
    precioGasolina,
    moves,
    kmAnuales,
    consumoElectrico,
    consumoGasolina,
    precioLuz,
    precioGasolinaLitro,
    cargador,
    anios,
  } = form;

  // Costes anuales de energía
  const costeEnergiaEV = (kmAnuales / 100) * consumoElectrico * precioLuz;
  const costeEnergiaGas = (kmAnuales / 100) * consumoGasolina * precioGasolinaLitro;

  // Ahorro de mantenimiento EV vs gasolina (~200€/año)
  const ahorroMantEV = 200;

  // Ahorro anual total
  const ahorroAnual = (costeEnergiaGas - costeEnergiaEV) + ahorroMantEV;

  // Inversión neta extra del EV (lo que cuesta más el EV tras subsidio)
  const inversionNetaEV = (precioElectrico - moves) - precioGasolina;

  // Coste cargador anualizado (amortizado en 10 años)
  const cargadorAnual = cargador / 10;

  // Mantenimiento anual estimado por tipo
  const mantEV = 800;         // €/año mantenimiento EV
  const mantGasolina = 1000;  // €/año mantenimiento gasolina

  // Tabla año a año
  const tabla: FilaAnual[] = [];
  let breakEvenAnio: number | null = null;

  for (let anio = 1; anio <= anios; anio++) {
    const costeAcumEV = inversionNetaEV + (costeEnergiaEV + cargadorAnual + mantEV) * anio;
    const costeAcumGas = (costeEnergiaGas + mantGasolina) * anio;
    const diferenciaAcum = costeAcumGas - costeAcumEV;

    tabla.push({ anio, costeAcumEV, costeAcumGas, diferenciaAcum });

    if (breakEvenAnio === null && diferenciaAcum >= 0) {
      breakEvenAnio = anio;
    }
  }

  // Coste por km
  const costePorKmEV = (costeEnergiaEV + cargadorAnual + mantEV) / kmAnuales;
  const costePorKmGas = (costeEnergiaGas + mantGasolina) / kmAnuales;

  return {
    costePorKmEV,
    costePorKmGas,
    ahorroAnual,
    breakEvenAnio,
    tabla,
    inversionNetaEV,
  };
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function ComparadorElectrico() {
  const [form, setForm] = useState<FormData>(FORM_INICIAL);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  // ── Actualizar campos del formulario
  function actualizarCampo(campo: keyof FormData, valor: string) {
    const num = parseFloat(valor.replace(',', '.'));
    setForm((prev) => ({
      ...prev,
      [campo]: isNaN(num) ? 0 : num,
    }));
  }

  // ── Calcular
  function handleCalcular() {
    setResultado(calcular(form));
  }

  // ── Verificar si el formulario tiene datos mínimos válidos
  const formularioValido =
    form.precioElectrico > 0 &&
    form.precioGasolina > 0 &&
    form.kmAnuales > 0 &&
    form.consumoElectrico > 0 &&
    form.consumoGasolina > 0 &&
    form.precioLuz > 0 &&
    form.precioGasolinaLitro > 0;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>
          ¿Cuándo compensa el coche, carro o auto eléctrico?
        </h1>
        <p className={styles.heroSubtitle}>
          Calcula el punto de equilibrio entre un coche (carro o auto) eléctrico y su equivalente
          de gasolina, incluyendo el subsidio MOVES III y el cargador doméstico.
        </p>
      </header>

      <main className={styles.main}>
        <LegalNotice />

        <DisclaimerCard variant="financial" severity="critical" />

        {/* ── Formulario ── */}
        <section className={styles.formSection} aria-label="Datos del comparador">

          {/* Grupo 1: Precios de compra */}
          <h2 className={styles.sectionDivider}>Precios de compra</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="precioElectrico" className={styles.label}>
                Precio del eléctrico (€)
              </label>
              <input
                id="precioElectrico"
                type="number"
                className={styles.input}
                value={form.precioElectrico}
                min={0}
                step={500}
                onChange={(e) => actualizarCampo('precioElectrico', e.target.value)}
                aria-label="Precio de compra del vehículo eléctrico en euros"
              />
              <span className={styles.inputHint}>Precio de venta al público (PVP)</span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="precioGasolina" className={styles.label}>
                Precio del gasolina equivalente (€)
              </label>
              <input
                id="precioGasolina"
                type="number"
                className={styles.input}
                value={form.precioGasolina}
                min={0}
                step={500}
                onChange={(e) => actualizarCampo('precioGasolina', e.target.value)}
                aria-label="Precio de compra del vehículo de gasolina equivalente en euros"
              />
              <span className={styles.inputHint}>Modelo comparable de gasolina</span>
            </div>

            <div className={styles.formGroupFull}>
              <label htmlFor="moves" className={styles.label}>
                Subsidio MOVES III
              </label>
              <select
                id="moves"
                className={styles.select}
                value={form.moves}
                onChange={(e) => actualizarCampo('moves', e.target.value)}
                aria-label="Selecciona el nivel de subsidio MOVES III"
              >
                <option value={0}>Sin subsidio (0 €)</option>
                <option value={4500}>Con MOVES III sin achatarramiento (4.500 €)</option>
                <option value={7000}>Con MOVES III + achatarramiento (7.000 €)</option>
              </select>
              <span className={styles.inputHint}>
                MOVES III: 4.500 € sin achatarramiento, 7.000 € con achatarramiento de vehículo antiguo
              </span>
            </div>
          </div>

          {/* Grupo 2: Consumos y energía */}
          <h2 className={styles.sectionDivider}>Consumos y energía</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="kmAnuales" className={styles.label}>
                Kilómetros anuales
              </label>
              <input
                id="kmAnuales"
                type="number"
                className={styles.input}
                value={form.kmAnuales}
                min={1000}
                step={1000}
                onChange={(e) => actualizarCampo('kmAnuales', e.target.value)}
                aria-label="Kilómetros que recorres al año"
              />
              <span className={styles.inputHint}>Media española: ~12.000 km/año</span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="consumoElectrico" className={styles.label}>
                Consumo eléctrico (kWh/100km)
              </label>
              <input
                id="consumoElectrico"
                type="number"
                className={styles.input}
                value={form.consumoElectrico}
                min={5}
                step={0.5}
                onChange={(e) => actualizarCampo('consumoElectrico', e.target.value)}
                aria-label="Consumo del vehículo eléctrico en kWh por cada 100 kilómetros"
              />
              <span className={styles.inputHint}>Consumo real (no WLTP). Típico: 14-20 kWh/100km</span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="consumoGasolina" className={styles.label}>
                Consumo gasolina (L/100km)
              </label>
              <input
                id="consumoGasolina"
                type="number"
                className={styles.input}
                value={form.consumoGasolina}
                min={3}
                step={0.5}
                onChange={(e) => actualizarCampo('consumoGasolina', e.target.value)}
                aria-label="Consumo del vehículo de gasolina en litros por cada 100 kilómetros"
              />
              <span className={styles.inputHint}>Consumo real en ciudad+carretera</span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="precioLuz" className={styles.label}>
                Precio electricidad doméstica (€/kWh)
              </label>
              <input
                id="precioLuz"
                type="number"
                className={styles.input}
                value={form.precioLuz}
                min={0.05}
                step={0.01}
                onChange={(e) => actualizarCampo('precioLuz', e.target.value)}
                aria-label="Precio del kilovatio-hora de electricidad en tu tarifa doméstica"
              />
              <span className={styles.inputHint}>Solo si cargas en casa. Tarifa media: ~0.18 €/kWh</span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="precioGasolinaLitro" className={styles.label}>
                Precio gasolina (€/L)
              </label>
              <input
                id="precioGasolinaLitro"
                type="number"
                className={styles.input}
                value={form.precioGasolinaLitro}
                min={0.5}
                step={0.05}
                onChange={(e) => actualizarCampo('precioGasolinaLitro', e.target.value)}
                aria-label="Precio del litro de gasolina"
              />
              <span className={styles.inputHint}>Precio medio de gasolina 95 en España</span>
            </div>
          </div>

          {/* Grupo 3: Otros costes */}
          <h2 className={styles.sectionDivider}>Otros costes</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="cargador" className={styles.label}>
                Cargador doméstico (€)
              </label>
              <input
                id="cargador"
                type="number"
                className={styles.input}
                value={form.cargador}
                min={0}
                step={100}
                onChange={(e) => actualizarCampo('cargador', e.target.value)}
                aria-label="Coste de instalación del cargador doméstico en euros"
              />
              <span className={styles.inputHint}>
                Instalación de wallbox en garaje. Rango habitual: 600-1.200 €. Pon 0 si no lo instalas.
              </span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="anios" className={styles.label}>
                Horizonte de análisis
              </label>
              <select
                id="anios"
                className={styles.select}
                value={form.anios}
                onChange={(e) => actualizarCampo('anios', e.target.value)}
                aria-label="Número de años para el análisis comparativo"
              >
                <option value={5}>5 años</option>
                <option value={8}>8 años</option>
                <option value={10}>10 años</option>
                <option value={15}>15 años</option>
              </select>
              <span className={styles.inputHint}>Cuántos años planeas quedarte el coche</span>
            </div>
          </div>

          <button
            type="button"
            className={styles.btnCalcular}
            onClick={handleCalcular}
            disabled={!formularioValido}
            aria-label="Calcular el punto de equilibrio entre el vehículo eléctrico y el de gasolina"
          >
            Calcular punto de equilibrio
          </button>
        </section>

        {/* ── Resultados ── */}
        {resultado !== null && (
          <section className={styles.resultadosSection} aria-label="Resultados del comparador">

            {/* Tarjeta principal: break-even */}
            <div className={styles.breakEvenCard} role="status" aria-live="polite">
              {resultado.breakEvenAnio !== null ? (
                <>
                  <div className={styles.breakEvenAnio} aria-label={`El eléctrico compensa en el año ${resultado.breakEvenAnio}`}>
                    Año {resultado.breakEvenAnio}
                  </div>
                  <p className={styles.breakEvenLabel}>
                    El eléctrico empieza a ser más barato en el año {resultado.breakEvenAnio}
                  </p>
                  <p className={styles.breakEvenSubLabel}>
                    A partir de ese punto, cada año adicional supone un ahorro neto acumulado mayor
                  </p>
                </>
              ) : (
                <>
                  <div className={styles.breakEvenNunca}>
                    No se alcanza el break-even en {form.anios} años
                  </div>
                  <p className={styles.breakEvenLabel}>
                    Con estos datos, el eléctrico no compensa en el horizonte analizado
                  </p>
                  <p className={styles.breakEvenSubLabel}>
                    Prueba a aumentar los km anuales o ajustar los precios de compra
                  </p>
                </>
              )}
            </div>

            {/* Métricas secundarias */}
            <div className={styles.statsGrid} aria-label="Resumen de métricas clave">
              <div className={styles.statCard}>
                <span className={styles.statValor}>
                  {formatCurrency(resultado.ahorroAnual)}
                </span>
                <span className={styles.statLabel}>Ahorro anual estimado*</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValor}>
                  {formatCurrency(resultado.inversionNetaEV)}
                </span>
                <span className={styles.statLabel}>
                  Inversión neta extra del EV
                  {resultado.inversionNetaEV <= 0 ? ' (ya es más barato)' : ''}
                </span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValor}>
                  {formatNumber(resultado.costePorKmEV * 100, 1)} ct/km
                </span>
                <span className={styles.statLabel}>
                  Coste por km: EV vs {formatNumber(resultado.costePorKmGas * 100, 1)} ct/km gasolina
                </span>
              </div>
            </div>

            {/* Tabla año a año */}
            <div className={styles.tablaSection}>
              <h3 className={styles.tablaTitle}>Evolución del coste acumulado año a año</h3>
              <div className={styles.tablaResponsive}>
                <table className={styles.tabla} aria-label="Tabla comparativa de costes acumulados por año">
                  <thead>
                    <tr>
                      <th scope="col">Año</th>
                      <th scope="col">Coste acum. EV</th>
                      <th scope="col">Coste acum. Gasolina</th>
                      <th scope="col">Diferencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.tabla.map((fila) => (
                      <tr
                        key={fila.anio}
                        className={
                          fila.anio === resultado.breakEvenAnio
                            ? styles.filaBreakEven
                            : styles.tablaFila
                        }
                      >
                        <td>{fila.anio}</td>
                        <td className={styles.celCosteEV}>
                          {formatCurrency(fila.costeAcumEV)}
                        </td>
                        <td>{formatCurrency(fila.costeAcumGas)}</td>
                        <td
                          className={fila.diferenciaAcum >= 0 ? styles.celAhorro : undefined}
                          aria-label={
                            fila.diferenciaAcum >= 0
                              ? `Ahorro de ${formatCurrency(fila.diferenciaAcum)}`
                              : `Coste adicional de ${formatCurrency(Math.abs(fila.diferenciaAcum))}`
                          }
                        >
                          {fila.diferenciaAcum >= 0 ? '+' : ''}
                          {formatCurrency(fila.diferenciaAcum)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={styles.celNota}>
                * No incluye depreciación diferencial ni seguro. El mantenimiento EV estimado es 200 €/año menos que el de gasolina.
                El coste de carga en puntos públicos (0,45-0,65 €/kWh) elevaría significativamente el coste del EV.
              </p>
            </div>

            {/* CTA a asesor-vehiculo */}
            <div className={styles.ctaBox} role="complementary" aria-label="Herramienta relacionada">
              <p className={styles.ctaText}>
                ¿Aún no tienes claro qué tipo de coche te conviene? El Asesor de Vehículo te
                orienta según tus necesidades reales antes de comparar precios.
              </p>
              <Link href="/selector-vehiculo/" className={styles.ctaLink}>
                Ir al Selector de Vehículo
              </Link>
            </div>
          </section>
        )}

        {/* ── Sección educativa v2.0 ── */}
        <EducationalSection
          title="¿Por qué el eléctrico no siempre compensa?"
          subtitle="Factores clave que determinan el punto de equilibrio real"
        >
          <h3>La trampa del precio de lista</h3>
          <p>
            El precio de compra es solo el punto de partida. Lo que realmente importa es la
            <strong> diferencia neta</strong> entre ambos vehículos una vez descontado el subsidio MOVES III.
            Un EV que cuesta 12.000 € más que su equivalente de gasolina, con MOVES III máximo (7.000 €),
            solo supone 5.000 € de inversión extra a recuperar vía ahorro en combustible y mantenimiento.
            Además, el valor residual del EV a 5-8 años puede ser inferior al de gasolina en muchas marcas,
            lo que no aparece en este cálculo de flujos.
          </p>

          <h3>El kWh doméstico vs público</h3>
          <p>
            Cargar en casa a 0,18 €/kWh es radicalmente distinto a hacerlo en un punto de carga rápida
            en autopista (0,45-0,65 €/kWh). Un conductor que realiza muchos desplazamientos largos sin
            cargador propio puede acabar pagando <strong>3 veces más por kilómetro</strong> que si cargara
            en casa. La calculadora asume carga doméstica: si tu caso es mayoritariamente carga pública,
            el break-even se alargará varios años respecto a lo mostrado.
          </p>

          <h3>MOVES III y el calendario de incentivos</h3>
          <p>
            El programa MOVES III sigue activo en 2025, pero los presupuestos son limitados y las
            convocatorias autonómicas pueden agotarse. La diferencia entre comprar con o sin MOVES III
            puede ser de hasta <strong>7.000 €</strong>, lo que representa entre 1 y 3 años adicionales
            de break-even. Si estás considerando la compra, revisar el estado de la convocatoria en tu
            comunidad autónoma puede marcar la diferencia.
          </p>

          <h3>Los km anuales son decisivos</h3>
          <p>
            El ahorro en energía es directamente proporcional a los kilómetros recorridos. Con
            <strong> menos de 8.000 km/año</strong>, raramente se alcanza el punto de equilibrio en 10 años,
            porque el ahorro acumulado no llega a cubrir la sobrecarga inicial del EV. Con
            <strong> más de 20.000 km/año</strong>, el eléctrico casi siempre compensa antes del año 6.
            Este es el factor más determinante: no el precio del coche (carro o auto), sino los kilómetros que vas a recorrer.
          </p>

          <div className={styles.warningBox} role="note">
            Este cálculo es orientativo. No incluye el coste del dinero (financiación), la depreciación
            diferencial entre modelos ni el coste de carga en puntos públicos. Los datos de consumo
            real pueden diferir significativamente del consumo WLTP. Consulta un asesor financiero
            para decisiones de compra relevantes.
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('comparador-electrico')} />
      <ShareCard appName="comparador-electrico" />
      <Footer appName="comparador-electrico" />
    </div>
  );
}
