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
  DataReference, RegionBadge
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import {
  COEFICIENTES_IIVTNU_2025,
  coeficienteIIVTNU,
  PLUSVALIA_MUNICIPAL_META,
  PLAZO_IIVTNU,
  PRESCRIPCION_DEVOLUCION_IIVTNU,
} from '@/data/fiscal';
import { ESCALA_RECARGO_EXTEMPORANEO } from '@/lib/calculadoras/recargoPresentacionTardia';

/*
 * Datos normativos, leídos de su módulo y no escritos a mano (hallazgo 1645 del Inspector,
 * 25/09/2026): el tipo máximo, el tipo con que arranca el campo y los plazos del art. 110.2
 * estaban como literales en una docena de sitios, junto a la importación que ya los traía.
 */
const TIPO_MAXIMO = PLUSVALIA_MUNICIPAL_META.tipoMaximoLegal;
const TIPO_POR_DEFECTO = String(PLUSVALIA_MUNICIPAL_META.tipoOrientativo);
const PLAZO_INTER_VIVOS = `${PLAZO_IIVTNU.diasHabilesInterVivos} días hábiles`;
const PLAZO_HERENCIAS = `${PLAZO_IIVTNU.mesesMortisCausa} meses`;
/*
 * La escala de recargo por presentación tardía del art. 27.2 LGT (Ley 11/2021), compuesta desde
 * el motor compartido. Hasta el 25/09/2026 la app servía en tres sitios la escala derogada
 * (5/10/15/20 %), y dos de ellos se contradecían entre sí (hallazgo 1640).
 */
const RECARGO = ESCALA_RECARGO_EXTEMPORANEO;
const TEXTO_RECARGO = `un ${RECARGO.porcentajeBase}% de partida más otro ${RECARGO.porcentajePorMes}% por cada mes completo de retraso, y el ${RECARGO.porcentajeMas12Meses}% más intereses de demora una vez transcurridos ${RECARGO.mesesEscalaProporcional} meses (${RECARGO.baseNormativa})`;

interface ResultadoMetodo {
  baseImponible: number;
  cuota: number;
  valido: boolean;
  motivo?: 'sin-ganancia' | 'datos-incompletos' | 'datos-incoherentes';
  /** Qué falta o qué no cuadra en los datos del método real, dicho por su nombre. */
  avisos?: string[];
}

interface Resultado {
  objetivo: ResultadoMetodo;
  real: ResultadoMetodo | null;
  metodoRecomendado: 'objetivo' | 'real' | null;
  tieneIncrementoReal: boolean;
  /**
   * El coeficiente CON EL QUE SE CALCULÓ. La nota «Coeficiente aplicado» salía del estado del
   * formulario, así que al cambiar los años sin recalcular decía 0,40 junto a una base hecha
   * con 0,20 (hallazgo 1643).
   */
  coeficiente: number;
  prorrateado: boolean;
}

export default function EstimadorPlusvaliaMunicipalPage() {
  // Datos comunes
  const [vcSuelo, setVcSuelo] = useState('');
  const [aniosTenencia, setAniosTenencia] = useState('');
  // Solo con «Menos de 1 año»: el coeficiente anual se prorratea por meses completos
  // (art. 107.4 TRLRHL). Hasta el 24/09/2026 la FAQ lo prometía y el cálculo no lo hacía:
  // aplicaba el coeficiente entero a cualquier reventa dentro del año (hallazgo 1560).
  const [mesesTenencia, setMesesTenencia] = useState('');
  const [tipoMunicipal, setTipoMunicipal] = useState(TIPO_POR_DEFECTO);

  // Datos método real (opcionales)
  const [usarMetodoReal, setUsarMetodoReal] = useState(false);
  const [precioAdquisicion, setPrecioAdquisicion] = useState('');
  const [precioTransmision, setPrecioTransmision] = useState('');
  const [vcTotal, setVcTotal] = useState('');

  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [errores, setErrores] = useState<string[]>([]);

  const menosDeUnAnio = aniosTenencia === '0';
  const obtenerCoeficiente = (anios: number): number =>
    coeficienteIIVTNU(anios, menosDeUnAnio && mesesTenencia !== '' ? Number(mesesTenencia) : undefined).coeficiente;

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
    if (menosDeUnAnio && mesesTenencia === '') {
      nuevosErrores.push('Con menos de 1 año, indica los meses completos: el coeficiente se prorratea por ellos.');
    }
    if (!tipoMunicipal || isNaN(tipoNum) || tipoNum <= 0 || tipoNum > TIPO_MAXIMO) {
      nuevosErrores.push(`El tipo impositivo municipal debe estar entre 0,01% y ${formatNumber(TIPO_MAXIMO, 0)}%.`);
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
      /*
       * Cada motivo por su nombre (hallazgo 1644): hasta el 25/09/2026 un campo ilegible o un
       * suelo mayor que el total caían en «Rellena todos los datos del método real», que pedía
       * rellenar lo que ya estaba relleno.
       */
      const vacios: string[] = [];
      const avisosReal: string[] = [];
      const leer = (texto: string, nombre: string): number => {
        if (texto.trim() === '') {
          vacios.push(nombre);
          return NaN;
        }
        const n = parseSpanishNumber(texto);
        if (isNaN(n)) {
          avisosReal.push(`No se puede leer ${nombre} («${texto}»): escribe el importe con coma para los decimales, p. ej. 150.000,50.`);
        } else if (n <= 0) {
          avisosReal.push(`${nombre.charAt(0).toUpperCase()}${nombre.slice(1)} debe ser mayor que 0.`);
        }
        return n;
      };
      const precioAdqNum = leer(precioAdquisicion, 'el precio de adquisición');
      const precioTransNum = leer(precioTransmision, 'el precio de transmisión');
      const vcTotalNum = leer(vcTotal, 'el valor catastral total');

      if (vacios.length > 0) {
        avisosReal.push(`Para comparar con el método real, rellena también ${vacios.join(', ')}.`);
      }
      if (avisosReal.length === 0 && vcTotalNum < vcSueloNum) {
        avisosReal.push(
          `El valor catastral total (${formatCurrency(vcTotalNum)}) no puede ser menor que el del suelo (${formatCurrency(vcSueloNum)}): ` +
          'el total incluye el suelo y la construcción. Revisa los dos en el recibo del IBI.'
        );
      }

      if (avisosReal.length === 0) {
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
        real = {
          baseImponible: 0,
          cuota: 0,
          valido: false,
          motivo: vacios.length > 0 && avisosReal.length === 1 ? 'datos-incompletos' : 'datos-incoherentes',
          avisos: avisosReal,
        };
      }
    }

    // Determinar método recomendado (el que da menor cuota para el contribuyente).
    // Sin incremento real no hay sujeción (art. 104.5 TRLRHL): la cuota es 0 y el más favorable
    // es el real. Hasta el 25/09/2026 con pérdida no se marcaba ninguno y la única cuota a la
    // vista era la del objetivo (hallazgo 1642).
    let metodoRecomendado: 'objetivo' | 'real' | null = null;
    if (real?.valido) {
      metodoRecomendado = !tieneIncrementoReal || real.cuota < objetivo.cuota ? 'real' : 'objetivo';
    }

    setResultado({
      objetivo,
      real,
      metodoRecomendado,
      tieneIncrementoReal,
      coeficiente: coef,
      prorrateado: menosDeUnAnio,
    });
  };

  /** Cualquier cambio en los datos retira el resultado: ya no es el de lo que hay escrito (hallazgo 1643). */
  const alCambiar = (fijar: (v: string) => void) => (v: string): void => {
    fijar(v);
    setResultado(null);
  };

  const resetear = () => {
    setVcSuelo('');
    setAniosTenencia('');
    setMesesTenencia('');
    setTipoMunicipal(TIPO_POR_DEFECTO);
    setPrecioAdquisicion('');
    setPrecioTransmision('');
    setVcTotal('');
    setUsarMetodoReal(false);
    setResultado(null);
    setErrores([]);
  };

  const aniosSeleccionados = parseSpanishNumber(aniosTenencia);
  const coefMostrar = !isNaN(aniosSeleccionados) && aniosSeleccionados >= 0 && !(menosDeUnAnio && mesesTenencia === '')
    ? obtenerCoeficiente(aniosSeleccionados)
    : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">🏙️</div>
        <h1 className={styles.title}>Estimador de Plusvalía Municipal</h1>
        <p className={styles.subtitle}>
          Oriéntate sobre el IIVTNU al vender o heredar un inmueble urbano.<br />
          Método objetivo y método real según RDL 26/2021.
        </p>
      </header>

      <RegionBadge variant="es-only" />


      <LegalNotice />

      {/* Aviso metodológico prominente */}
      <div className={styles.avisoMetodologico}>
        <span className={styles.avisoIcon} aria-hidden="true">ℹ️</span>
        <p>
          Desde la sentencia del Tribunal Constitucional de octubre de 2021, puedes elegir entre
          el <strong>método objetivo</strong> (basado en coeficientes legales) o el <strong>método real</strong>{' '}
          (basado en el incremento de valor real). Puedes aplicar el que resulte en una cuota menor, según establece el RDL 26/2021.
        </p>
      </div>

      <div className={styles.mainContent}>

        {/* Panel de datos comunes */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}><span aria-hidden="true">📋</span> Datos del inmueble</h2>

          <NumberInput
            value={vcSuelo}
            onChange={alCambiar(setVcSuelo)}
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
                  Coeficiente: {formatNumber(coefMostrar, menosDeUnAnio ? 4 : 2)}
                </span>
              )}
            </label>
            <select
              className={styles.select}
              value={aniosTenencia}
              onChange={e => { setAniosTenencia(e.target.value); setMesesTenencia(''); setResultado(null); }}
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

          {menosDeUnAnio && (
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="meses-tenencia">
                Meses completos de tenencia
              </label>
              <select
                id="meses-tenencia"
                className={styles.select}
                value={mesesTenencia}
                onChange={e => alCambiar(setMesesTenencia)(e.target.value)}
              >
                <option value="">Selecciona los meses</option>
                {Array.from({ length: 12 }, (_, m) => (
                  <option key={m} value={m}>
                    {m === 1 ? '1 mes' : `${m} meses`}
                  </option>
                ))}
              </select>
              <p className={styles.helperText}>
                Por debajo del año, el coeficiente de {formatNumber(COEFICIENTES_IIVTNU_2025[0].coeficiente, 2)} se
                prorratea por los meses completos (art. 107.4 TRLRHL): con 6 meses, la mitad.
              </p>
            </div>
          )}

          <NumberInput
            value={tipoMunicipal}
            onChange={alCambiar(setTipoMunicipal)}
            label="Tipo impositivo municipal (%)"
            placeholder={TIPO_POR_DEFECTO}
            helperText={`Consulta el tipo exacto en tu Ayuntamiento. El máximo legal es el ${TIPO_MAXIMO}%.`}
            min={0}
          />

          {/* Toggle método real */}
          <div className={styles.toggleSection}>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={usarMetodoReal}
                onChange={e => { setUsarMetodoReal(e.target.checked); setResultado(null); }}
                className={styles.toggleInput}
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
              <h3 className={styles.subPanelTitle}><span aria-hidden="true">📊</span> Datos para el método real</h3>
              <NumberInput
                value={precioAdquisicion}
                onChange={alCambiar(setPrecioAdquisicion)}
                label="Precio de adquisición (€)"
                placeholder="150000"
                helperText="Precio al que compraste o valor declarado en herencia/donación"
                min={0}
              />
              <NumberInput
                value={precioTransmision}
                onChange={alCambiar(setPrecioTransmision)}
                label="Precio de transmisión (€)"
                placeholder="220000"
                helperText="Precio al que vendes o valor en la escritura"
                min={0}
              />
              <NumberInput
                value={vcTotal}
                onChange={alCambiar(setVcTotal)}
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
                <p key={i} className={styles.errorItem}><span aria-hidden="true">⚠️</span> {e}</p>
              ))}
            </div>
          )}

          <div className={styles.btnRow}>
            <button
              type="button"
              onClick={calcular}
              className={styles.btnPrimary}
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
            <h2 className={styles.panelTitle}><span aria-hidden="true">📊</span> Estimación orientativa</h2>

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
                  description={resultado.real?.motivo === 'sin-ganancia'
                    ? 'No se paga si acreditas ante el Ayuntamiento que no hubo incremento (art. 104.5 TRLRHL)'
                    : 'Base imponible × tipo municipal'}
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
                    <span className={styles.sinGananciaIcon} aria-hidden="true">✅</span>
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

            {resultado.real && !resultado.real.valido && resultado.real.avisos && (
              <div className={styles.avisoIncompleto} role="alert">
                {resultado.real.avisos.map((a, i) => (
                  <p key={i}><span aria-hidden="true">ℹ️</span> {a}</p>
                ))}
              </div>
            )}

            {/* Nota de coeficiente aplicado */}
            <div className={styles.notaCalculo}>
              <p>
                {/* Con prorrateo, cuatro decimales: con dos, 0,075 se leía «0,08» junto a una cuota
                    calculada con 0,075 (regresión del 24/09/2026, al introducir el prorrateo).
                    El coeficiente es el DEL CÁLCULO, no el del formulario (hallazgo 1643). */}
                <strong>Coeficiente aplicado:</strong> {formatNumber(resultado.coeficiente, resultado.prorrateado ? 4 : 2)}&nbsp;
                (máximos del art. 107.4 TRLRHL, redacción del RDL 8/2023)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* DisclaimerCard — siempre visible, fuera de cualquier toggle */}
      <DisclaimerCard variant="financial" severity="critical" />

      {/* El sello del IIVTNU, no el del módulo de inmuebles: FISCAL_INMUEBLES_META fecha una revisión
          del ITP y cita normas que esta app no aplica (misma forma que el hallazgo 610). */}
      <DataReference
        normativa="Plusvalía municipal (IIVTNU)"
        fuente={PLUSVALIA_MUNICIPAL_META.baseNormativa}
        verificado={PLUSVALIA_MUNICIPAL_META.verificado}
        urlOficial={PLUSVALIA_MUNICIPAL_META.urlReferencia}
      />

      {/* Aviso adicional específico IIVTNU */}
      <div className={styles.avisoEspecifico}>
        <h3 className={styles.avisoEspecificoTitle}><span aria-hidden="true">⚠️</span> Aspectos que esta orientación NO contempla</h3>
        <ul className={styles.avisoLista}>
          {/* El porcentaje es el valor con que arranca el campo: decía «30%» con el campo en 25 y
              presentaba la cifra como un techo, y no lo es (hallazgo 1641). */}
          <li>El tipo impositivo exacto de <strong>tu municipio</strong>: puede ser inferior o superior al {TIPO_POR_DEFECTO}% que fijamos por defecto, hasta el máximo legal del {TIPO_MAXIMO}%.</li>
          <li>Posibles <strong>bonificaciones municipales</strong> por herencia entre familiares directos (algunos Ayuntamientos las aplican).</li>
          {/* Decía «inmuebles adquiridos antes de 1997 con coeficientes de actualización diferentes»:
              eso es del IRPF. El art. 107.4 termina en «igual o superior a 20 años» y la app lo
              aplica (hallazgo 1647). Lo que de verdad no contempla son los coeficientes propios. */}
          <li>Los <strong>coeficientes propios de tu Ayuntamiento</strong>, si su ordenanza aprueba unos inferiores a los máximos legales que aplica esta orientación.</li>
          <li>La posible <strong>exención por reinversión</strong> en vivienda habitual o mayores de 65 años (afecta al IRPF, no a la plusvalía municipal).</li>
          <li>Casos de <strong>transmisiones parciales</strong> o proindivisos.</li>
        </ul>
        <p className={styles.avisoConclusion}>
          Siempre contrasta el resultado con la liquidación del Ayuntamiento o con un asesor fiscal.
          El plazo para liquidar el impuesto es de <strong>{PLAZO_INTER_VIVOS}</strong> desde la transmisión ({PLAZO_HERENCIAS} en herencias, {PLAZO_IIVTNU.baseNormativa}).
        </p>
      </div>

      <EducationalSection
        title="¿Qué es la Plusvalía Municipal y cómo funciona?"
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
            <li><strong>Ventas y donaciones:</strong> {PLAZO_INTER_VIVOS} desde la transmisión.</li>
            <li><strong>Herencias:</strong> {PLAZO_HERENCIAS} desde el fallecimiento, prorrogables hasta {PLAZO_IIVTNU.mesesMaximoConProrroga} meses en total a solicitud del sujeto pasivo ({PLAZO_IIVTNU.baseNormativa}).</li>
          </ul>
        </section>

        <section className={styles.guideSection}>
          <h2>Coeficientes máximos legales vigentes</h2>
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
            Fuente: art. 107.4 del TRLRHL, en la redacción del RDL 8/2023 (vigente desde 2024).
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
                  {/* Presentaba la no sujeción como una opción del método real (hallazgo 1642). El
                      art. 104.5 TRLRHL no la liga a ningún método: basta acreditar la pérdida. */}
                  <td><strong>Obligación de tributar si hay pérdida</strong></td>
                  <td>No: si acreditas con las escrituras que no hubo incremento, la transmisión no está sujeta, sea cual sea el método (art. 104.5 TRLRHL)</td>
                  <td>No — si no hay incremento real, no hay sujeción y la cuota es 0 €</td>
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
                <span className={styles.escenarioIcon} aria-hidden="true">🏠</span>
                <strong>Venta de piso con ganancia</strong>
              </div>
              <p className={styles.escenarioExample}>
                Piso comprado en 2009 por <strong>120.000 €</strong>, vendido en 2024 por <strong>220.000 €</strong>.
                Valor catastral total: <strong>90.000 €</strong>; suelo: <strong>50.000 €</strong> (55,6%).
                Tipo municipal: <strong>25 %</strong>.
              </p>
              <ul>
                {/* 2009 → 2024 son 15 años: coeficiente vigente de 15 años (hasta el 24/09/2026 ponía
                    0,45, que no era el de 15 años ni en la tabla caducada). */}
                <li><strong>Método objetivo:</strong> 50.000 × {formatNumber(coeficienteIIVTNU(15).coeficiente, 2)} × 25% = <strong>{formatNumber(50000 * coeficienteIIVTNU(15).coeficiente * 0.25, 0)} €</strong></li>
                <li><strong>Método real:</strong> (220.000 − 120.000) × 55,6% × 25% = <strong>13.900 €</strong></li>
              </ul>
              <p className={styles.escenarioTip}>
                Aquí el método objetivo es más favorable. Siempre calcula ambos antes de autoliquidar.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📋</span>
                <strong>Herencia de piso</strong>
              </div>
              <p className={styles.escenarioExample}>
                Heredero recibe un piso con valor catastral <strong>80.000 €</strong>; suelo: <strong>48.000 €</strong> (60%).
                Plazo para liquidar: <strong>{PLAZO_IIVTNU.mesesMortisCausa} meses</strong> desde el fallecimiento.
              </p>
              <ul>
                <li>El heredero es siempre el sujeto pasivo, aunque no haya vendido nada.</li>
                {/*
                  El plazo y su prórroga salen del módulo sellado desde el 15/09/2026: el
                  {' '}{PLAZO_IIVTNU.baseNormativa} los da «prorrogables hasta un año a solicitud del
                  sujeto pasivo», que es lo que ya decía esta app —y lo que `orientacion-tramitacion-
                  herencias` negaba en la misma fecha—. Se enuncia como lo hace la ley, por el TOPE,
                  y no como «otros 6 meses».
                */}
                <li>Puede solicitar prórroga al Ayuntamiento, hasta un máximo de {PLAZO_IIVTNU.mesesMaximoConProrroga} meses en total ({PLAZO_IIVTNU.baseNormativa}).</li>
                <li>El IS (Impuesto de Sucesiones) y el IIVTNU tienen plazos independientes pero coincidentes: tramítalos juntos.</li>
              </ul>
              <p className={styles.escenarioTip}>
                Si el piso se heredó a valor de mercado inferior al catastral, el método real puede acreditar pérdida y exonerar el impuesto.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📉</span>
                <strong>Venta con pérdida (crisis 2008)</strong>
              </div>
              <p className={styles.escenarioExample}>
                Piso comprado en 2007 por <strong>180.000 €</strong>, vendido en 2015 por <strong>130.000 €</strong>.
                Pérdida real: <strong>50.000 €</strong>.
              </p>
              <ul>
                <li>Con el método real, el incremento es negativo → <strong>cuota cero</strong>, no se devengó el impuesto.</li>
                {/* Ofrecía reclamar lo pagado «antes de 2021» con 4 años de plazo: por esa misma regla,
                    todo pago anterior a 2021 prescribió como muy tarde en 2024, y el del ejemplo
                    (2015) en 2019 (hallazgo 1646). */}
                <li>
                  La devolución de lo pagado de más solo se puede pedir durante <strong>{PRESCRIPCION_DEVOLUCION_IIVTNU.anios} años</strong> desde
                  {' '}{PRESCRIPCION_DEVOLUCION_IIVTNU.desde} ({PRESCRIPCION_DEVOLUCION_IIVTNU.baseNormativa}): un pago de 2015 prescribió en 2019 y ya no se puede reclamar.
                </li>
                <li>Necesitas conservar la escritura de compra para acreditar el valor de adquisición.</li>
              </ul>
              <p className={styles.escenarioTip}>
                La no sujeción con pérdida la estableció la sentencia TC 59/2017 y hoy la recoge el art. 104.5 TRLRHL. Si pagaste con pérdida dentro del plazo de prescripción, consulta a un asesor para el procedimiento de devolución.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏢</span>
                <strong>Donación de local comercial</strong>
              </div>
              <p className={styles.escenarioExample}>
                Padre dona a hijo un local comercial. Valor catastral del suelo: <strong>70.000 €</strong>.
                Tipo municipal: <strong>{TIPO_MAXIMO} %</strong>. Plazo: <strong>{PLAZO_INTER_VIVOS}</strong>.
              </p>
              <ul>
                <li>El <strong>donatario</strong> (quien recibe) es el sujeto pasivo, no el donante.</li>
                <li>El valor de adquisición a efectos del método real es el valor en escritura de donación.</li>
                <li>Los locales comerciales no tienen bonificaciones familiares habituales (a diferencia de vivienda habitual en algunos municipios).</li>
              </ul>
              <p className={styles.escenarioTip}>
                Comprueba si el Ayuntamiento aplica el tipo máximo ({TIPO_MAXIMO}%) o uno inferior. Un punto porcentual de diferencia puede suponer cientos de euros.
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
                en el momento de autoliquidar. La elección del método corresponde al contribuyente en la autoliquidación, no al Ayuntamiento.
                Calcula ambos y opta por el que resulte de menor cuota.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Qué pasa si vendí con pérdida durante la crisis de 2008?</dt>
              <dd>
                Sin incremento de valor la transmisión no está sujeta (STC 59/2017; hoy, art. 104.5 TRLRHL), pero
                el derecho a pedir la devolución prescribe a los <strong>{PRESCRIPCION_DEVOLUCION_IIVTNU.anios} años</strong> desde
                {' '}{PRESCRIPCION_DEVOLUCION_IIVTNU.desde} ({PRESCRIPCION_DEVOLUCION_IIVTNU.baseNormativa}).
                Una plusvalía pagada en plena crisis, hace más de {PRESCRIPCION_DEVOLUCION_IIVTNU.anios} años, ya no se puede
                reclamar. Si el pago es más reciente, necesitas la escritura de compra original para acreditar el
                valor de adquisición y presentar ante el Ayuntamiento la solicitud de rectificación de la autoliquidación.
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
                Si la tenencia es inferior a 12 meses, el coeficiente de <strong>menos de 1 año</strong>{' '}
                ({formatNumber(COEFICIENTES_IIVTNU_2025[0].coeficiente, 2)} como máximo estatal) se prorratea
                por los meses completos transcurridos (art. 107.4 TRLRHL): con 6 meses se aplica la mitad. En el método real, el incremento también puede ser muy elevado en poco tiempo,
                por lo que conviene comparar ambos métodos igualmente.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Puedo aplazar el pago si heredo y no tengo liquidez?</dt>
              <dd>
                Algunos Ayuntamientos permiten el aplazamiento o fraccionamiento por razones de liquidez,
                especialmente en herencias. Debes solicitarlo expresamente antes de que venza el plazo de
                {' '}{PLAZO_HERENCIAS}. Si el plazo vence sin liquidar ni solicitar prórroga y presentas tarde por
                tu cuenta, sin requerimiento del Ayuntamiento, el recargo es de <strong>{TEXTO_RECARGO}</strong>.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Qué pasa si el Ayuntamiento tiene coeficientes inferiores a los máximos legales?</dt>
              <dd>
                Los coeficientes de la tabla (art. 107.4 TRLRHL) son <strong>máximos legales</strong>. Cada Ayuntamiento
                puede aprobar en ordenanza fiscal unos coeficientes iguales o inferiores. Si tu municipio
                aplica coeficientes menores, la cuota por el método objetivo será más baja que la estimada
                aquí. Siempre consulta la ordenanza fiscal de tu Ayuntamiento antes de autoliquidar.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Puedo reclamar una plusvalía pagada cuando en realidad hubo pérdida?</dt>
              <dd>
                Sí, mediante un escrito de <strong>rectificación de autoliquidación con solicitud de devolución
                de ingresos indebidos</strong>. El plazo es de {PRESCRIPCION_DEVOLUCION_IIVTNU.anios} años desde
                {' '}{PRESCRIPCION_DEVOLUCION_IIVTNU.desde} ({PRESCRIPCION_DEVOLUCION_IIVTNU.baseNormativa}). Debes aportar las escrituras
                de compra y venta para demostrar que el precio de transmisión fue inferior al de adquisición.
                La no sujeción con pérdida la estableció la sentencia TC 59/2017 y hoy la recoge el art. 104.5 TRLRHL.
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
                  Fórmula: <em>Valor catastral del suelo × coeficiente (máximo legal según años) × tipo municipal</em>.
                  El tipo municipal máximo es el {TIPO_MAXIMO}%; consulta la ordenanza de tu municipio para el tipo real aplicado.
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
                  <strong>Ventas y donaciones:</strong> {PLAZO_INTER_VIVOS} desde la firma de la escritura.
                  <strong> Herencias:</strong> {PLAZO_HERENCIAS} desde el fallecimiento, prorrogables hasta
                  {' '}{PLAZO_IIVTNU.mesesMaximoConProrroga} meses en total a solicitud del sujeto pasivo ({PLAZO_IIVTNU.baseNormativa}).
                  Si presentas tarde por tu cuenta, sin requerimiento previo, el recargo es de {TEXTO_RECARGO}.
                  Si es el Ayuntamiento quien lo detecta y te requiere, ya no se aplica el recargo sino el régimen sancionador.
                </p>
              </div>
            </li>

          </ol>
        </section>

        {/* ── 5. Mejores prácticas ── */}
        <section className={styles.guideSection}>
          <h2>6 prácticas para calcular correctamente tu plusvalía municipal</h2>
          <div className={styles.tipsGrid}>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
              <div>
                <strong>Calcula siempre los dos métodos</strong>
                <p>Nunca autoliquides sin comparar método objetivo y real. La diferencia entre ambos métodos puede ser de varios miles de euros en transmisiones habituales.</p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📁</span>
              <div>
                <strong>Conserva escrituras y recibos de obras</strong>
                <p>Las obras de mejora (no de conservación) pueden sumarse al precio de adquisición en el método real, reduciendo la base imponible.</p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⏱️</span>
              <div>
                <strong>En herencias, solicita prórroga a la vez que el IS</strong>
                <p>El plazo para el IIVTNU ({PLAZO_HERENCIAS}) y para el Impuesto de Sucesiones son coincidentes. Tramita ambas prórrogas simultáneamente ante el Ayuntamiento y la CCAA.</p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏛️</span>
              <div>
                <strong>Consulta el tipo real de tu Ayuntamiento</strong>
                <p>El tipo máximo es el {TIPO_MAXIMO}%, pero muchos municipios aplican tipos inferiores. Un municipio con tipo del 20% supone un {formatNumber((1 - 20 / TIPO_MAXIMO) * 100, 0)}% menos de cuota que el máximo.</p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <div>
                <strong>Compara también los coeficientes municipales</strong>
                <p>Los Ayuntamientos pueden aprobar coeficientes inferiores a los máximos legales. Si tu municipio aplica uno menor, el método objetivo resulta aún más ventajoso.</p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
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
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>6 errores frecuentes que conviene evitar</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>No autoliquidar en plazo.</strong> Si presentas voluntariamente fuera de plazo,
                el recargo es de <strong>{TEXTO_RECARGO}</strong>. Aunque el retraso sea de pocos días, el
                {' '}{RECARGO.porcentajeBase}% de partida se debe desde el primero.
              </li>
              <li>
                <strong>Calcular solo por un método sin comparar.</strong> Elegir únicamente el método
                objetivo puede suponer pagar miles de euros de más si el método real resulta más favorable.
                La comparación no tiene coste y puede ahorrarte dinero significativo.
              </li>
              <li>
                <strong>Olvidar el IIVTNU en herencias.</strong> El plazo de {PLAZO_HERENCIAS} empieza desde el
                fallecimiento, no desde la aceptación de la herencia. Es habitual descuidarlo mientras
                se tramita el IS, lo que genera recargos automáticos.
              </li>
              <li>
                <strong>Dejar pasar el plazo para reclamar una plusvalía pagada con pérdida.</strong> Si
                vendiste con pérdida y pagaste el impuesto, tienes <strong>{PRESCRIPCION_DEVOLUCION_IIVTNU.anios} años
                desde el pago</strong> para solicitar la devolución ({PRESCRIPCION_DEVOLUCION_IIVTNU.baseNormativa}).
                Pasado ese plazo prescribe y ya no se puede reclamar.
              </li>
              <li>
                <strong>Confundir valor catastral total con valor catastral del suelo.</strong> Son importes
                distintos. El valor catastral total incluye suelo y construcción. Para el método objetivo
                y para el método real solo se usa el del suelo. Usar el total en lugar del suelo puede
                duplicar o triplicar artificialmente la cuota.
              </li>
              <li>
                <strong>Dejar que el comprador asuma la plusvalía por pacto privado sin precaución.</strong>{' '}
                El pacto entre partes no vincula al Ayuntamiento. Si el comprador incumple, el vendedor
                responde ante la Administración. Para protegerte, incluye una cláusula de garantía en
                la escritura y asegúrate de que el comprador dispone de liquidez antes de firmar.
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
