'use client';

import { useState } from 'react';
import styles from './EstimadorPlusvaliaMunicipal.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  NumberInput,
  ResultCard,
  EducationalSection,
  DisclaimerCard,
  ShareCard,
  DataReference,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import {
  COEFICIENTES_IIVTNU_2025,
  PLUSVALIA_MUNICIPAL_META,
  FISCAL_INMUEBLES_META,
} from '@/data/fiscal';

interface ResultadoMetodo {
  baseImponible: number;
  cuota: number;
  valido: boolean;
  motivo?: string;
}

interface Resultado {
  objetivo: ResultadoMetodo;
  real: ResultadoMetodo | null;
  metodoRecomendado: 'objetivo' | 'real' | null;
  tieneIncrementoReal: boolean;
}

export default function EstimadorPlusvaliaMunicipalPage() {
  // Datos comunes
  const [vcSuelo, setVcSuelo] = useState('');
  const [aniosTenencia, setAniosTenencia] = useState('');
  const [tipoMunicipal, setTipoMunicipal] = useState('25');

  // Datos método real (opcionales)
  const [usarMetodoReal, setUsarMetodoReal] = useState(false);
  const [precioAdquisicion, setPrecioAdquisicion] = useState('');
  const [precioTransmision, setPrecioTransmision] = useState('');
  const [vcTotal, setVcTotal] = useState('');

  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [errores, setErrores] = useState<string[]>([]);

  const obtenerCoeficiente = (anios: number): number => {
    const aniosClamp = Math.min(Math.max(0, Math.floor(anios)), 20);
    const entrada = COEFICIENTES_IIVTNU_2025.find(c => c.anios === aniosClamp);
    return entrada?.coeficiente ?? COEFICIENTES_IIVTNU_2025[COEFICIENTES_IIVTNU_2025.length - 1].coeficiente;
  };

  const calcular = () => {
    const nuevosErrores: string[] = [];

    const vcSueloNum = parseSpanishNumber(vcSuelo);
    const aniosNum = parseSpanishNumber(aniosTenencia);
    const tipoNum = parseSpanishNumber(tipoMunicipal);

    if (!vcSuelo || isNaN(vcSueloNum) || vcSueloNum <= 0) {
      nuevosErrores.push('Introduce el valor catastral del suelo (mayor que 0).');
    }
    if (!aniosTenencia || isNaN(aniosNum) || aniosNum < 0) {
      nuevosErrores.push('Introduce los años de tenencia (0 o más).');
    }
    if (!tipoMunicipal || isNaN(tipoNum) || tipoNum <= 0 || tipoNum > 30) {
      nuevosErrores.push('El tipo impositivo municipal debe estar entre 0,01% y 30%.');
    }

    if (nuevosErrores.length > 0) {
      setErrores(nuevosErrores);
      setResultado(null);
      return;
    }

    setErrores([]);

    // Método objetivo
    const coef = obtenerCoeficiente(aniosNum);
    const baseObjetivo = vcSueloNum * coef;
    const cuotaObjetivo = baseObjetivo * (tipoNum / 100);

    const objetivo: ResultadoMetodo = {
      baseImponible: baseObjetivo,
      cuota: cuotaObjetivo,
      valido: true,
    };

    // Método real (si el usuario proporciona datos)
    let real: ResultadoMetodo | null = null;
    let tieneIncrementoReal = false;

    if (usarMetodoReal) {
      const precioAdqNum = parseSpanishNumber(precioAdquisicion);
      const precioTransNum = parseSpanishNumber(precioTransmision);
      const vcTotalNum = parseSpanishNumber(vcTotal);

      if (
        !isNaN(precioAdqNum) && precioAdqNum > 0 &&
        !isNaN(precioTransNum) && precioTransNum > 0 &&
        !isNaN(vcTotalNum) && vcTotalNum > 0 &&
        vcTotalNum >= vcSueloNum
      ) {
        // Incremento real proporcional al suelo
        const incrementoTotal = precioTransNum - precioAdqNum;
        if (incrementoTotal <= 0) {
          // Sin ganancia → no hay IIVTNU
          real = { baseImponible: 0, cuota: 0, valido: true, motivo: 'sin-ganancia' };
          tieneIncrementoReal = false;
        } else {
          // Prorratear por la parte del suelo sobre el total catastral
          const proporcionSuelo = vcSueloNum / vcTotalNum;
          const baseReal = incrementoTotal * proporcionSuelo;
          const cuotaReal = baseReal * (tipoNum / 100);
          real = { baseImponible: baseReal, cuota: cuotaReal, valido: true };
          tieneIncrementoReal = true;
        }
      } else {
        real = { baseImponible: 0, cuota: 0, valido: false, motivo: 'datos-incompletos' };
      }
    }

    // Determinar método recomendado (el que da menor cuota para el contribuyente)
    let metodoRecomendado: 'objetivo' | 'real' | null = null;
    if (real?.valido && tieneIncrementoReal) {
      metodoRecomendado = real.cuota < objetivo.cuota ? 'real' : 'objetivo';
    }

    setResultado({ objetivo, real, metodoRecomendado, tieneIncrementoReal });
  };

  const resetear = () => {
    setVcSuelo('');
    setAniosTenencia('');
    setTipoMunicipal('25');
    setPrecioAdquisicion('');
    setPrecioTransmision('');
    setVcTotal('');
    setUsarMetodoReal(false);
    setResultado(null);
    setErrores([]);
  };

  const aniosSeleccionados = parseSpanishNumber(aniosTenencia);
  const coefMostrar = !isNaN(aniosSeleccionados) && aniosSeleccionados >= 0
    ? obtenerCoeficiente(aniosSeleccionados)
    : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon}>🏙️</div>
        <h1 className={styles.title}>Estimador de Plusvalía Municipal</h1>
        <p className={styles.subtitle}>
          Oriéntate sobre el IIVTNU al vender o heredar un inmueble urbano.<br />
          Método objetivo y método real según RDL 26/2021.
        </p>
      </header>

      <LegalNotice />

      {/* Aviso metodológico prominente */}
      <div className={styles.avisoMetodologico}>
        <span className={styles.avisoIcon}>ℹ️</span>
        <p>
          Desde la sentencia del Tribunal Constitucional de noviembre de 2021, puedes elegir entre
          el <strong>método objetivo</strong> (basado en coeficientes legales) o el <strong>método real</strong>
          (basado en el incremento de valor real). Puedes aplicar el que resulte <em>más favorable</em> para ti.
        </p>
      </div>

      <div className={styles.mainContent}>

        {/* Panel de datos comunes */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>📋 Datos del inmueble</h2>

          <NumberInput
            value={vcSuelo}
            onChange={setVcSuelo}
            label="Valor catastral del suelo (€)"
            placeholder="50000"
            helperText="Figura en el recibo del IBI, en la parte de 'valor del suelo'"
            min={0}
          />

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Años de tenencia
              {coefMostrar !== null && (
                <span className={styles.coefBadge}>
                  Coeficiente: {formatNumber(coefMostrar, 2)}
                </span>
              )}
            </label>
            <select
              className={styles.select}
              value={aniosTenencia}
              onChange={e => setAniosTenencia(e.target.value)}
              aria-label="Años de tenencia del inmueble"
            >
              <option value="">Selecciona los años</option>
              {COEFICIENTES_IIVTNU_2025.map(c => (
                <option key={c.anios} value={c.anios}>
                  {c.label} (coef. {formatNumber(c.coeficiente, 2)})
                </option>
              ))}
            </select>
            <p className={styles.helperText}>Tiempo transcurrido desde la adquisición hasta la transmisión</p>
          </div>

          <NumberInput
            value={tipoMunicipal}
            onChange={setTipoMunicipal}
            label="Tipo impositivo municipal (%)"
            placeholder="25"
            helperText="Consulta el tipo exacto en tu Ayuntamiento. El máximo legal es el 30%."
            min={0}
          />

          {/* Toggle método real */}
          <div className={styles.toggleSection}>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={usarMetodoReal}
                onChange={e => setUsarMetodoReal(e.target.checked)}
                className={styles.toggleInput}
                aria-label="Activar comparación con método real"
              />
              <span className={styles.toggleText}>
                Comparar también con el <strong>método real</strong>
              </span>
            </label>
            <p className={styles.helperText}>
              Requiere los precios de adquisición y transmisión del inmueble completo.
            </p>
          </div>

          {usarMetodoReal && (
            <div className={styles.metodorealPanel}>
              <h3 className={styles.subPanelTitle}>📊 Datos para el método real</h3>
              <NumberInput
                value={precioAdquisicion}
                onChange={setPrecioAdquisicion}
                label="Precio de adquisición (€)"
                placeholder="150000"
                helperText="Precio al que compraste o valor declarado en herencia/donación"
                min={0}
              />
              <NumberInput
                value={precioTransmision}
                onChange={setPrecioTransmision}
                label="Precio de transmisión (€)"
                placeholder="220000"
                helperText="Precio al que vendes o valor en la escritura"
                min={0}
              />
              <NumberInput
                value={vcTotal}
                onChange={setVcTotal}
                label="Valor catastral total del inmueble (€)"
                placeholder="80000"
                helperText="Valor catastral completo (suelo + construcción), del recibo IBI"
                min={0}
              />
            </div>
          )}

          {errores.length > 0 && (
            <div className={styles.errores} role="alert">
              {errores.map((e, i) => (
                <p key={i} className={styles.errorItem}>⚠️ {e}</p>
              ))}
            </div>
          )}

          <div className={styles.btnRow}>
            <button
              type="button"
              onClick={calcular}
              className={styles.btnPrimary}
              aria-label="Obtener estimación orientativa"
            >
              Obtener orientación
            </button>
            {resultado && (
              <button type="button" onClick={resetear} className={styles.btnSecondary} aria-label="Reiniciar formulario">
                Reiniciar
              </button>
            )}
          </div>
        </div>

        {/* Panel de resultados */}
        {resultado && (
          <div className={styles.resultsPanel}>
            <h2 className={styles.panelTitle}>📊 Estimación orientativa</h2>

            {/* Método objetivo */}
            <div className={styles.metodoSection}>
              <h3 className={styles.metodoTitle}>
                Método objetivo
                {resultado.metodoRecomendado === 'objetivo' && (
                  <span className={styles.recomendadoBadge}>✓ Más favorable</span>
                )}
              </h3>
              <div className={styles.resultadoGrid}>
                <ResultCard
                  title="Base imponible estimada"
                  value={formatCurrency(resultado.objetivo.baseImponible)}
                  variant="info"
                  icon="📐"
                  description="Valor catastral del suelo × coeficiente"
                />
                <ResultCard
                  title="Cuota orientativa"
                  value={formatCurrency(resultado.objetivo.cuota)}
                  variant={resultado.metodoRecomendado === 'objetivo' ? 'highlight' : 'default'}
                  icon="🏙️"
                  description="Base imponible × tipo municipal"
                />
              </div>
            </div>

            {/* Método real (si disponible) */}
            {resultado.real && resultado.real.valido && (
              <div className={styles.metodoSection}>
                <h3 className={styles.metodoTitle}>
                  Método real
                  {resultado.metodoRecomendado === 'real' && (
                    <span className={styles.recomendadoBadge}>✓ Más favorable</span>
                  )}
                </h3>
                {resultado.real.motivo === 'sin-ganancia' ? (
                  <div className={styles.sinGanancia} role="alert">
                    <span className={styles.sinGananciaIcon}>✅</span>
                    <div>
                      <strong>Sin incremento real de valor</strong>
                      <p>Con el método real, el precio de transmisión no supera al de adquisición. En este caso, <strong>no se devenga el impuesto</strong>. Consulta con el Ayuntamiento para confirmarlo.</p>
                    </div>
                  </div>
                ) : (
                  <div className={styles.resultadoGrid}>
                    <ResultCard
                      title="Base imponible estimada"
                      value={formatCurrency(resultado.real.baseImponible)}
                      variant="info"
                      icon="📐"
                      description="Incremento real × proporción del suelo"
                    />
                    <ResultCard
                      title="Cuota orientativa"
                      value={formatCurrency(resultado.real.cuota)}
                      variant={resultado.metodoRecomendado === 'real' ? 'highlight' : 'default'}
                      icon="🏙️"
                      description="Base imponible × tipo municipal"
                    />
                  </div>
                )}
              </div>
            )}

            {resultado.real?.motivo === 'datos-incompletos' && (
              <p className={styles.avisoIncompleto}>
                ℹ️ Rellena todos los datos del método real para comparar ambas opciones.
              </p>
            )}

            {/* Nota de coeficiente aplicado */}
            {coefMostrar !== null && (
              <div className={styles.notaCalculo}>
                <p>
                  <strong>Coeficiente aplicado:</strong> {formatNumber(coefMostrar, 2)}&nbsp;
                  (según tabla IIVTNU 2025, RDL 26/2021)
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DisclaimerCard — siempre visible, fuera de cualquier toggle */}
      <DisclaimerCard variant="financial" severity="critical" />

      <DataReference
        normativa={FISCAL_INMUEBLES_META.fuente}
        fuente={FISCAL_INMUEBLES_META.fuente}
        verificado={FISCAL_INMUEBLES_META.verificado}
        urlOficial={PLUSVALIA_MUNICIPAL_META.urlReferencia}
      />

      {/* Aviso adicional específico IIVTNU */}
      <div className={styles.avisoEspecifico}>
        <h3 className={styles.avisoEspecificoTitle}>⚠️ Aspectos que esta orientación NO contempla</h3>
        <ul className={styles.avisoLista}>
          <li>El tipo impositivo exacto de <strong>tu municipio</strong> (puede ser inferior al 30% que fijamos por defecto).</li>
          <li>Posibles <strong>bonificaciones municipales</strong> por herencia entre familiares directos (algunos Ayuntamientos las aplican).</li>
          <li>Situaciones de <strong>inmuebles adquiridos antes de 1997</strong> con coeficientes de actualización diferentes.</li>
          <li>La posible <strong>exención por reinversión</strong> en vivienda habitual o mayores de 65 años (afecta al IRPF, no a la plusvalía municipal).</li>
          <li>Casos de <strong>transmisiones parciales</strong> o proindivisos.</li>
        </ul>
        <p className={styles.avisoConclusion}>
          Siempre contrasta el resultado con la liquidación del Ayuntamiento o con un asesor fiscal.
          El plazo para liquidar el impuesto es de <strong>30 días hábiles</strong> desde la transmisión (6 meses en herencias).
        </p>
      </div>

      <EducationalSection
        title="📚 ¿Qué es la Plusvalía Municipal y cómo funciona?"
        subtitle="Conceptos clave para entender el IIVTNU"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué es el IIVTNU?</h2>
          <p>
            El Impuesto sobre el Incremento de Valor de los Terrenos de Naturaleza Urbana (IIVTNU),
            conocido como &ldquo;plusvalía municipal&rdquo;, grava el aumento de valor que experimenta
            el suelo urbano desde que se adquirió hasta que se transmite (venta, herencia o donación).
            Lo gestiona y recauda cada Ayuntamiento.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>¿Quién lo paga?</h2>
          <ul>
            <li><strong>Venta:</strong> el vendedor (quien transmite).</li>
            <li><strong>Herencia:</strong> el heredero o legatario.</li>
            <li><strong>Donación:</strong> el donatario (quien recibe).</li>
          </ul>
          <p>
            En ventas entre particulares, las partes pueden pactar que lo pague el comprador,
            pero ante el Ayuntamiento, el responsable legal sigue siendo el vendedor.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>La sentencia del TC de 2021</h2>
          <p>
            En octubre de 2021, el Tribunal Constitucional declaró inconstitucional el método de cálculo
            anterior. El Real Decreto-Ley 26/2021 reformó el impuesto introduciendo dos métodos
            alternativos: el <strong>método objetivo</strong> (basado en coeficientes sobre el valor
            catastral) y el <strong>método real</strong> (basado en el incremento de valor efectivo).
            El contribuyente puede elegir el que resulte más favorable.
          </p>
          <p>
            Además, si no hay incremento real de valor (vendes por menos de lo que compraste),
            no se devenga el impuesto.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>¿Cuándo se liquida?</h2>
          <ul>
            <li><strong>Ventas y donaciones:</strong> 30 días hábiles desde la transmisión.</li>
            <li><strong>Herencias:</strong> 6 meses desde el fallecimiento (prorrogable 6 meses más).</li>
          </ul>
        </section>

        <section className={styles.guideSection}>
          <h2>Coeficientes 2025 (máximos legales)</h2>
          <div className={styles.tablaScroll}>
            <table className={styles.tablaCoeficientes}>
              <thead>
                <tr>
                  <th>Años de tenencia</th>
                  <th>Coeficiente máximo</th>
                </tr>
              </thead>
              <tbody>
                {COEFICIENTES_IIVTNU_2025.map(c => (
                  <tr key={c.anios}>
                    <td>{c.label}</td>
                    <td>{formatNumber(c.coeficiente, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.tablaNote}>
            Fuente: RDL 26/2021 + actualización Ley de Presupuestos.
            Los Ayuntamientos pueden aplicar coeficientes inferiores a estos máximos.
          </p>
        </section>

        {/* ── 1. Tabla comparativa Método Objetivo vs Método Real ── */}
        <section className={styles.guideSection}>
          <h2>Método Objetivo vs Método Real: comparativa</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>Método Objetivo</th>
                  <th>Método Real</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Cómo se calcula</strong></td>
                  <td>Valor catastral del suelo × coeficiente (según años de tenencia) × tipo municipal</td>
                  <td>Incremento real (precio venta − precio compra) × proporción del suelo sobre el valor catastral total × tipo municipal</td>
                </tr>
                <tr>
                  <td><strong>Cuándo suele ser más favorable</strong></td>
                  <td>Cuando el incremento real ha sido moderado o cuando el valor catastral está muy por debajo del valor de mercado</td>
                  <td>Cuando el valor de adquisición fue alto (ej. comprado en 2006-2007) o el suelo representa un porcentaje pequeño del catastral total</td>
                </tr>
                <tr>
                  <td><strong>Datos necesarios</strong></td>
                  <td>Valor catastral del suelo (recibo IBI) + años de tenencia + tipo municipal</td>
                  <td>Precio escriturado de compra y venta + valor catastral total + valor catastral del suelo + tipo municipal</td>
                </tr>
                <tr>
                  <td><strong>Complejidad</strong></td>
                  <td>Baja — todos los datos en el IBI y en la ordenanza municipal</td>
                  <td>Media — requiere conservar escrituras y solicitar porcentaje de suelo en Catastro</td>
                </tr>
                <tr>
                  <td><strong>Posibilidad de impugnar si resultado es injusto</strong></td>
                  <td>Limitada — los coeficientes los fija la ley</td>
                  <td>Alta — si se acredita pérdida real, la cuota es cero</td>
                </tr>
                <tr>
                  <td><strong>Obligación de tributar si hay pérdida</strong></td>
                  <td>Sí, salvo que se opte por el método real y se acredite</td>
                  <td>No — si no hay incremento real, no nace el hecho imponible</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 2. Casos de uso ── */}
        <section className={styles.guideSection}>
          <h2>Casos de uso frecuentes</h2>
          <div className={styles.escenariosGrid}>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏠</span>
                <strong>Venta de piso con ganancia</strong>
              </div>
              <p className={styles.escenarioExample}>
                Piso comprado en 2009 por <strong>120.000 €</strong>, vendido en 2024 por <strong>220.000 €</strong>.
                Valor catastral total: <strong>90.000 €</strong>; suelo: <strong>50.000 €</strong> (55,6%).
                Tipo municipal: <strong>25 %</strong>.
              </p>
              <ul>
                <li><strong>Método objetivo:</strong> 50.000 × 0,45 × 25% = <strong>5.625 €</strong></li>
                <li><strong>Método real:</strong> (220.000 − 120.000) × 55,6% × 25% = <strong>13.900 €</strong></li>
              </ul>
              <p className={styles.escenarioTip}>
                Aquí el método objetivo es más favorable. Siempre calcula ambos antes de autoliquidar.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📋</span>
                <strong>Herencia de piso</strong>
              </div>
              <p className={styles.escenarioExample}>
                Heredero recibe un piso con valor catastral <strong>80.000 €</strong>; suelo: <strong>48.000 €</strong> (60%).
                Plazo para liquidar: <strong>6 meses</strong> desde el fallecimiento.
              </p>
              <ul>
                <li>El heredero es siempre el sujeto pasivo, aunque no haya vendido nada.</li>
                <li>Puede solicitar prórroga de otros 6 meses al Ayuntamiento antes de que venza el plazo inicial.</li>
                <li>El IS (Impuesto de Sucesiones) y el IIVTNU tienen plazos independientes pero coincidentes: tramítalos juntos.</li>
              </ul>
              <p className={styles.escenarioTip}>
                Si el piso se heredó a valor de mercado inferior al catastral, el método real puede acreditar pérdida y exonerar el impuesto.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📉</span>
                <strong>Venta con pérdida (crisis 2008)</strong>
              </div>
              <p className={styles.escenarioExample}>
                Piso comprado en 2007 por <strong>180.000 €</strong>, vendido en 2015 por <strong>130.000 €</strong>.
                Pérdida real: <strong>50.000 €</strong>.
              </p>
              <ul>
                <li>Con el método real, el incremento es negativo → <strong>cuota cero</strong>, no se devengó el impuesto.</li>
                <li>Si ya lo pagaste antes de 2021, tienes hasta <strong>4 años</strong> para reclamar la devolución (prescripción).</li>
                <li>Necesitas conservar la escritura de compra para acreditar el valor de adquisición.</li>
              </ul>
              <p className={styles.escenarioTip}>
                La sentencia TC 182/2021 abrió la vía para reclamar plusvalías pagadas con pérdida real. Consulta a un asesor para el procedimiento de devolución.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏢</span>
                <strong>Donación de local comercial</strong>
              </div>
              <p className={styles.escenarioExample}>
                Padre dona a hijo un local comercial. Valor catastral del suelo: <strong>70.000 €</strong>.
                Tipo municipal: <strong>30 %</strong>. Plazo: <strong>30 días hábiles</strong>.
              </p>
              <ul>
                <li>El <strong>donatario</strong> (quien recibe) es el sujeto pasivo, no el donante.</li>
                <li>El valor de adquisición a efectos del método real es el valor en escritura de donación.</li>
                <li>Los locales comerciales no tienen bonificaciones familiares habituales (a diferencia de vivienda habitual en algunos municipios).</li>
              </ul>
              <p className={styles.escenarioTip}>
                Comprueba si el Ayuntamiento aplica el tipo máximo (30%) o uno inferior. Un punto porcentual de diferencia puede suponer cientos de euros.
              </p>
            </div>

          </div>
        </section>

        {/* ── 3. FAQ ── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes (FAQ)</h2>
          <dl className={styles.faqList}>

            <div className={styles.faqItem}>
              <dt>¿Puedo elegir el método que más me convenga?</dt>
              <dd>
                Sí. Desde el RDL 26/2021 el contribuyente puede optar por el método objetivo o el método real
                en el momento de autoliquidar. El Ayuntamiento no puede imponerte el método menos favorable.
                Calcula ambos y declara por el que resulte menor.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Qué pasa si vendí con pérdida durante la crisis de 2008?</dt>
              <dd>
                Si vendiste por menos de lo que pagaste y el Ayuntamiento te cobró la plusvalía antes de 2021,
                puedes reclamar la devolución. El plazo de prescripción es de <strong>4 años</strong> desde el
                ingreso indebido. Necesitas la escritura de compra original para acreditar el valor de adquisición.
                Presenta un escrito de rectificación de autoliquidación ante el Ayuntamiento.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Cuánto es el porcentaje del suelo en el valor catastral?</dt>
              <dd>
                Varía por inmueble y municipio. Puede consultarse en la sede del Catastro (sedecatastro.gob.es)
                buscando el inmueble y accediendo a la consulta descriptiva y gráfica. En pisos urbanos de ciudades
                grandes suele oscilar entre el <strong>30% y el 60%</strong> del valor catastral total.
                Nunca uses una estimación genérica: el dato exacto puede cambiar el resultado en miles de euros.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Quién paga la plusvalía cuando comprador y vendedor pactan que la pague el comprador?</dt>
              <dd>
                El pacto privado es válido entre las partes, pero <strong>ante el Ayuntamiento el responsable
                legal sigue siendo siempre el vendedor</strong>. Si el comprador no paga, el Ayuntamiento
                reclamará al vendedor. En caso de impago, el vendedor puede reclamar al comprador por la vía civil,
                pero el riesgo fiscal lo asume el transmitente.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Cómo se calcula si tengo el inmueble menos de 1 año?</dt>
              <dd>
                Si la tenencia es inferior a 12 meses, se aplica el coeficiente correspondiente a <strong>menos
                de 1 año</strong> (0,14 según la tabla 2025). El cálculo es proporcional a los meses completos
                transcurridos. En el método real, el incremento también puede ser muy elevado en poco tiempo,
                por lo que conviene comparar ambos métodos igualmente.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Puedo aplazar el pago si heredo y no tengo liquidez?</dt>
              <dd>
                Algunos Ayuntamientos permiten el aplazamiento o fraccionamiento por razones de liquidez,
                especialmente en herencias. Debes solicitarlo expresamente antes de que venza el plazo de
                6 meses. Si el plazo vence sin liquidar ni solicitar prórroga, se generan recargos del
                <strong>5% (1-3 meses), 10% (3-6 meses) o 15% (6-12 meses)</strong>, más intereses de demora
                a partir de 12 meses.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Qué pasa si el Ayuntamiento tiene coeficientes inferiores a los máximos legales?</dt>
              <dd>
                Los coeficientes de la tabla (RDL 26/2021) son <strong>máximos legales</strong>. Cada Ayuntamiento
                puede aprobar en ordenanza fiscal unos coeficientes iguales o inferiores. Si tu municipio
                aplica coeficientes menores, la cuota por el método objetivo será más baja que la estimada
                aquí. Siempre consulta la ordenanza fiscal de tu Ayuntamiento antes de autoliquidar.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Puedo reclamar una plusvalía pagada cuando en realidad hubo pérdida?</dt>
              <dd>
                Sí, mediante un escrito de <strong>rectificación de autoliquidación con solicitud de devolución
                de ingresos indebidos</strong>. El plazo es de 4 años desde el pago. Debes aportar las escrituras
                de compra y venta para demostrar que el precio de transmisión fue inferior al de adquisición.
                La sentencia TC 182/2021 (octubre 2021) respalda estas reclamaciones.
              </dd>
            </div>

          </dl>
        </section>

        {/* ── 4. Guía paso a paso ── */}
        <section className={styles.guideSection}>
          <h2>Cómo autoliquidar el IIVTNU: guía paso a paso</h2>
          <ol className={styles.stepGuide}>

            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Reúne las escrituras de compra y de venta</strong>
                <p>
                  Necesitas el precio escriturado de adquisición y el de transmisión para poder calcular
                  por el método real. Si es herencia, el valor declarado en el Impuesto de Sucesiones.
                  Guarda también recibos de obras de mejora: en algunas interpretaciones aumentan el valor
                  de adquisición en el método real.
                </p>
              </div>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Obtén el valor catastral y el porcentaje de suelo</strong>
                <p>
                  Accede a <strong>sedecatastro.gob.es</strong> o revisa el recibo del IBI. Necesitas
                  el valor catastral total del inmueble y el valor catastral del suelo (son diferentes).
                  Si no aparece desglosado en el IBI, solicítalo en la Gerencia de Catastro o en la
                  sede electrónica con certificado digital.
                </p>
              </div>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Calcula por el método objetivo</strong>
                <p>
                  Fórmula: <em>Valor catastral del suelo × coeficiente (tabla 2025 según años) × tipo municipal</em>.
                  El tipo municipal máximo es el 30%; consulta la ordenanza de tu municipio para el tipo real aplicado.
                </p>
              </div>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Calcula por el método real</strong>
                <p>
                  Fórmula: <em>(Precio transmisión − Precio adquisición) × (VC suelo / VC total) × tipo municipal</em>.
                  Si el resultado es negativo o cero, no existe hecho imponible y la cuota es 0 €.
                  En ese caso, puedes acreditarlo ante el Ayuntamiento con las escrituras.
                </p>
              </div>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Elige el método más favorable y autoliquida</strong>
                <p>
                  Presenta la autoliquidación en el Ayuntamiento correspondiente (donde está ubicado el
                  inmueble, no donde resides). La mayoría de grandes municipios disponen de sede electrónica.
                  Indica expresamente el método elegido en el formulario de autoliquidación.
                </p>
              </div>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Presenta en plazo</strong>
                <p>
                  <strong>Ventas y donaciones:</strong> 30 días hábiles desde la firma de la escritura.
                  <strong> Herencias:</strong> 6 meses desde el fallecimiento (prorrogables otros 6 meses
                  si se solicita antes del vencimiento). El incumplimiento genera recargos automáticos
                  desde el 5% hasta el 20%, sin necesidad de que el Ayuntamiento inicie expediente.
                </p>
              </div>
            </li>

          </ol>
        </section>

        {/* ── 5. Mejores prácticas ── */}
        <section className={styles.guideSection}>
          <h2>6 prácticas para optimizar tu plusvalía municipal</h2>
          <div className={styles.tipsGrid}>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⚖️</span>
              <div>
                <strong>Calcula siempre los dos métodos</strong>
                <p>Nunca autoliquides sin comparar método objetivo y real. La diferencia puede superar los 3.000 € en transmisiones habituales.</p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📁</span>
              <div>
                <strong>Conserva escrituras y recibos de obras</strong>
                <p>Las obras de mejora (no de conservación) pueden sumarse al precio de adquisición en el método real, reduciendo la base imponible.</p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⏱️</span>
              <div>
                <strong>En herencias, solicita prórroga a la vez que el IS</strong>
                <p>El plazo para el IIVTNU (6 meses) y para el Impuesto de Sucesiones son coincidentes. Tramita ambas prórrogas simultáneamente ante el Ayuntamiento y la CCAA.</p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏛️</span>
              <div>
                <strong>Consulta el tipo real de tu Ayuntamiento</strong>
                <p>El tipo máximo es el 30%, pero muchos municipios aplican tipos inferiores. Un municipio con tipo del 20% supone un 33% menos de cuota que el máximo.</p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📊</span>
              <div>
                <strong>Compara también los coeficientes municipales</strong>
                <p>Los Ayuntamientos pueden aprobar coeficientes inferiores a los máximos legales. Si tu municipio aplica uno menor, el método objetivo resulta aún más ventajoso.</p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔍</span>
              <div>
                <strong>Solicita el porcentaje de suelo exacto en Catastro</strong>
                <p>El recibo del IBI a veces muestra el porcentaje redondeado. El dato preciso de la sede catastral puede diferir del estimado y alterar el resultado del método real.</p>
              </div>
            </div>

          </div>
        </section>

        {/* ── 6. Warning box: errores comunes ── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <strong>6 errores frecuentes que conviene evitar</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>No autoliquidar en plazo.</strong> Si presentas voluntariamente fuera de plazo,
                el recargo es del <strong>5% (hasta 3 meses tarde), 10% (hasta 6 meses), 15% (hasta 12 meses)
                o 20% (más de 12 meses)</strong>, sin contar posibles intereses de demora.
              </li>
              <li>
                <strong>Calcular solo por un método sin comparar.</strong> Elegir únicamente el método
                objetivo puede suponer pagar miles de euros de más si el método real resulta más favorable.
                La comparación no tiene coste y puede ahorrarte dinero significativo.
              </li>
              <li>
                <strong>Olvidar el IIVTNU en herencias.</strong> El plazo de 6 meses empieza desde el
                fallecimiento, no desde la aceptación de la herencia. Es habitual descuidarlo mientras
                se tramita el IS, lo que genera recargos automáticos.
              </li>
              <li>
                <strong>No reclamar plusvalías pagadas antes de 2021 con pérdida demostrable.</strong> Si
                vendiste con pérdida antes de la sentencia TC de octubre de 2021 y pagaste el impuesto,
                tienes hasta <strong>4 años desde el pago</strong> para solicitar la devolución. El plazo
                prescribe: no lo dejes para después.
              </li>
              <li>
                <strong>Confundir valor catastral total con valor catastral del suelo.</strong> Son importes
                distintos. El valor catastral total incluye suelo y construcción. Para el método objetivo
                y para el método real solo se usa el del suelo. Usar el total en lugar del suelo puede
                duplicar o triplicar artificialmente la cuota.
              </li>
              <li>
                <strong>Dejar que el comprador asuma la plusvalía por pacto privado sin precaución.</strong>
                El pacto entre partes no vincula al Ayuntamiento. Si el comprador incumple, el vendedor
                responde ante la Administración. Para protegerte, incluye una cláusula de garantía en
                la escritura y asegúrate de que el comprador dispone de liquidez antes de firmsr.
              </li>
            </ul>
          </div>
        </section>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-plusvalia-municipal')} />
      <ShareCard appName="estimador-plusvalia-municipal" />
      <Footer appName="estimador-plusvalia-municipal" />
    </div>
  );
}
