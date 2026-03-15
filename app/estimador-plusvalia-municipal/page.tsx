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
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import {
  COEFICIENTES_IIVTNU_2025,
  PLUSVALIA_MUNICIPAL_META,
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
      <DisclaimerCard variant="financial" />

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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-plusvalia-municipal')} />
      <ShareCard appName="estimador-plusvalia-municipal" />
      <Footer appName="estimador-plusvalia-municipal" />
    </div>
  );
}
