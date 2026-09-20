'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './CalculadoraPintura.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection, DataReference } from '@/components';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type TipoSuperficie = 'lisa' | 'gotele' | 'rugosa' | 'porosa';

interface Resultado {
  /** Foto de las entradas con las que se calculó: si cambian, el resultado queda caducado. */
  firma: string;
  superficie: number;
  paredes: number;
  techo: number;
  huecos: number;
  rendimiento: number;
  /** Extremo BAJO del rango del soporte, cuando el rendimiento aplicado es más optimista. */
  rendimientoBajo: number | null;
  litrosSiRindeMenos: number;
  litrosNecesarios: number;
  litrosConMargen: number;
  botesPequenos: number;
  botesGrandes: number;
  litrosBotesPequenos: number;
  litrosBotesGrandes: number;
  costeBotesPequenos: number;
  costeBotesGrandes: number;
  costeEstimado: number;
  envaseElegido: number;
  botesElegidos: number;
  precio: number;
}

interface Soporte {
  descripcion: string;
  /** m²/L por mano que la calculadora aplica por defecto. Es el extremo FAVORABLE del rango. */
  tipico: number;
  min: number;
  max: number;
}

/**
 * Rendimiento por mano según el SOPORTE, en m²/L.
 *
 * No hay norma que fije el rendimiento de una pintura: lo declara cada fabricante en la ficha
 * técnica del envase, y por eso el campo «Rendimiento de la pintura» es editable. Estos valores
 * son el punto de partida, no un dato normativo:
 *
 *   · El rango de la pared LISA (10–12 m²/L) es el que publica la propia tabla de esta página
 *     para una pintura plástica mate, que es el producto habitual de interior.
 *   · Los otros tres aplican a ese mismo rango el consumo extra del soporte: el gotelé
 *     consume alrededor de un 50 % más (12 → 8 m²/L) y una superficie muy porosa llega a
 *     duplicar el consumo (12 → 6 m²/L). La FAQ y la guía de abajo dicen exactamente esto.
 *   · `tipico` es el extremo FAVORABLE del rango, que es el lado por el que uno se queda
 *     corto: el panel de resultados publica también los litros con el extremo bajo.
 */
const SOPORTES: Record<TipoSuperficie, Soporte> = {
  lisa: { descripcion: 'Pared lisa, yeso o pladur', tipico: 12, min: 10, max: 12 },
  gotele: { descripcion: 'Gotelé o textura media', tipico: 8, min: 7, max: 8 },
  rugosa: { descripcion: 'Ladrillo visto o estuco', tipico: 7, min: 6, max: 7 },
  porosa: { descripcion: 'Hormigón o superficie muy absorbente', tipico: 6, min: 5, max: 6 },
};

/** Tamaños de envase habituales en tienda, en litros. La pintura no se vende a granel. */
const ENVASE_PEQUENO = 4;
const ENVASE_GRANDE = 15;

/** Redondeo AL ALZA a la décima: quedarse corto a mitad de pared no es una opción. */
const alAlzaDecima = (litros: number) => Math.ceil(litros * 10) / 10;

export default function CalculadoraPinturaPage() {
  const [modo, setModo] = useState<'metros' | 'habitacion'>('metros');
  const [metrosCuadrados, setMetrosCuadrados] = useState('');
  const [largo, setLargo] = useState('');
  const [ancho, setAncho] = useState('');
  const [alto, setAlto] = useState('2.5');
  const [huecos, setHuecos] = useState('');
  const [incluirTecho, setIncluirTecho] = useState(false);
  const [numCapas, setNumCapas] = useState('2');
  const [tipoSuperficie, setTipoSuperficie] = useState<TipoSuperficie>('lisa');
  const [rendimiento, setRendimiento] = useState(String(SOPORTES.lisa.tipico));
  const [precioPorLitro, setPrecioPorLitro] = useState('8');
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState('');

  /** Todo lo que entra en la cuenta. Sirve para saber si lo que se ve sigue correspondiendo. */
  const firmaEntradas = () =>
    JSON.stringify([
      modo,
      metrosCuadrados,
      largo,
      ancho,
      alto,
      huecos,
      incluirTecho,
      numCapas,
      tipoSuperficie,
      rendimiento,
      precioPorLitro,
    ]);

  /** El resultado en pantalla ya no corresponde a lo que hay en los campos. */
  const caducado = resultado !== null && resultado.firma !== firmaEntradas();

  const cambiarSuperficie = (tipo: TipoSuperficie) => {
    setTipoSuperficie(tipo);
    // El rendimiento sigue al soporte, y el usuario puede pisarlo con el de su ficha técnica.
    setRendimiento(String(SOPORTES[tipo].tipico));
  };

  const calcular = () => {
    const fallos: string[] = [];

    // ── Datos comunes a los dos modos ──────────────────────────────────────────
    const rend = parseSpanishNumber(rendimiento);
    if (!Number.isFinite(rend) || rend <= 0) {
      fallos.push('el rendimiento en m²/L tiene que ser un número mayor que cero');
    }

    const hayPrecio = precioPorLitro.trim() !== '';
    const precio = hayPrecio ? parseSpanishNumber(precioPorLitro) : 0;
    if (hayPrecio && (!Number.isFinite(precio) || precio < 0)) {
      fallos.push('el precio por litro tiene que ser un número de cero o más, o quedar vacío');
    }

    // ── Superficie ─────────────────────────────────────────────────────────────
    let paredes = 0;
    let techo = 0;
    let huecosM2 = 0;

    if (modo === 'metros') {
      const m2 = parseSpanishNumber(metrosCuadrados);
      if (!Number.isFinite(m2) || m2 <= 0) {
        fallos.push('la superficie a pintar tiene que ser un número mayor que cero (45 o 1.500)');
      } else {
        paredes = m2;
      }
    } else {
      // Cada medida por separado: sumar primero el perímetro deja que un largo negativo se
      // compense con el ancho y produzca una superficie positiva que no existe.
      const medidas = [
        { nombre: 'largo', texto: largo },
        { nombre: 'ancho', texto: ancho },
        { nombre: 'alto', texto: alto },
      ];
      const valores = medidas.map((m) => parseSpanishNumber(m.texto));
      const malas = medidas
        .filter((_, i) => !Number.isFinite(valores[i]) || valores[i] <= 0)
        .map((m) => m.nombre);

      if (malas.length > 0) {
        fallos.push(
          `${malas.join(', ')}: cada medida tiene que ser un número mayor que cero (una pared no mide −1 m)`,
        );
      } else {
        paredes = 2 * (valores[0] + valores[1]) * valores[2];
        techo = incluirTecho ? valores[0] * valores[1] : 0;
      }

      const hu = huecos.trim() === '' ? 0 : parseSpanishNumber(huecos);
      if (!Number.isFinite(hu) || hu < 0) {
        fallos.push('los huecos tienen que ser un número de cero o más, o quedar vacíos');
      } else if (paredes > 0 && hu >= paredes + techo) {
        fallos.push('los huecos no pueden sumar tanto como la superficie que se va a pintar');
      } else {
        huecosM2 = hu;
      }
    }

    if (fallos.length > 0) {
      setError(`Revisa ${fallos.length === 1 ? 'este dato' : 'estos datos'}: ${fallos.join('; ')}.`);
      // El panel se vacía: publicar la cifra anterior bajo una entrada nueva es peor que no
      // publicar nada, porque el usuario no tiene forma de saber que no se le ha hecho caso.
      setResultado(null);
      return;
    }

    const superficie = paredes + techo - huecosM2;
    const capas = Number(numCapas) || 2;

    const litrosNecesarios = alAlzaDecima((superficie * capas) / rend);
    const litrosConMargen = alAlzaDecima(litrosNecesarios * 1.1);

    // El extremo bajo del rango del soporte, que es por donde uno se queda corto.
    const bajo = SOPORTES[tipoSuperficie].min;
    const rendimientoBajo = rend > bajo ? bajo : null;
    const litrosSiRindeMenos =
      rendimientoBajo === null ? litrosNecesarios : alAlzaDecima((superficie * capas) / rendimientoBajo);

    const botesPequenos = Math.ceil(litrosNecesarios / ENVASE_PEQUENO);
    const botesGrandes = Math.ceil(litrosNecesarios / ENVASE_GRANDE);
    const litrosBotesPequenos = botesPequenos * ENVASE_PEQUENO;
    const litrosBotesGrandes = botesGrandes * ENVASE_GRANDE;

    // El coste se valora sobre lo que hay que COMPRAR, no sobre los litros sueltos que salen
    // de la cuenta: la pintura viene en envases cerrados y se paga entero el que se abre.
    const costeBotesPequenos = litrosBotesPequenos * precio;
    const costeBotesGrandes = litrosBotesGrandes * precio;
    const eligeBotesPequenos = litrosBotesPequenos <= litrosBotesGrandes;

    setError('');
    setResultado({
      firma: firmaEntradas(),
      superficie,
      paredes,
      techo,
      huecos: huecosM2,
      rendimiento: rend,
      rendimientoBajo,
      litrosSiRindeMenos,
      litrosNecesarios,
      litrosConMargen,
      botesPequenos,
      botesGrandes,
      litrosBotesPequenos,
      litrosBotesGrandes,
      costeBotesPequenos,
      costeBotesGrandes,
      costeEstimado: eligeBotesPequenos ? costeBotesPequenos : costeBotesGrandes,
      envaseElegido: eligeBotesPequenos ? ENVASE_PEQUENO : ENVASE_GRANDE,
      botesElegidos: eligeBotesPequenos ? botesPequenos : botesGrandes,
      precio,
    });
  };

  const limpiar = () => {
    setMetrosCuadrados('');
    setLargo('');
    setAncho('');
    setAlto('2.5');
    setHuecos('');
    setIncluirTecho(false);
    setNumCapas('2');
    setTipoSuperficie('lisa');
    setRendimiento(String(SOPORTES.lisa.tipico));
    setPrecioPorLitro('8');
    setResultado(null);
    setError('');
  };

  const soporte = SOPORTES[tipoSuperficie];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de Pintura</h1>
        <p className={styles.subtitle}>
          Calcula cuántos litros necesitas según superficie, capas y tipo de pared
        </p>
      </header>

      <LegalNotice />

      <DataReference
        normativa="Rendimiento de la pintura (m²/L por mano)"
        fuente="Fichas técnicas de fabricante — 10–12 m²/L en plástica mate sobre pared lisa, corregido por el consumo de cada soporte"
        verificado="2026-09-20"
        nota="Ninguna norma fija el rendimiento de una pintura: lo declara cada fabricante en el envase. Por eso el campo «Rendimiento de la pintura» es editable y trae el extremo favorable del rango del soporte elegido; el panel de resultados publica también los litros que harían falta con el extremo bajo."
      />

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          {/* Selector de modo */}
          <div className={styles.modoSelector}>
            <button
              type="button"
              className={`${styles.modoBtn} ${modo === 'metros' ? styles.active : ''}`}
              onClick={() => setModo('metros')}
              aria-pressed={modo === 'metros'}
            >
              Por m² directos
            </button>
            <button
              type="button"
              className={`${styles.modoBtn} ${modo === 'habitacion' ? styles.active : ''}`}
              onClick={() => setModo('habitacion')}
              aria-pressed={modo === 'habitacion'}
            >
              Por habitación
            </button>
          </div>

          {modo === 'metros' ? (
            <div className={styles.inputGroup}>
              <label htmlFor="metrosCuadradosInput">Metros cuadrados a pintar</label>
              <input
                id="metrosCuadradosInput"
                type="text"
                inputMode="decimal"
                value={metrosCuadrados}
                onChange={(e) => setMetrosCuadrados(e.target.value)}
                placeholder="Ej: 45"
                className={styles.input}
              />
            </div>
          ) : (
            <>
              <div className={styles.habitacionInputs}>
                <div className={styles.inputGroup}>
                  <label htmlFor="largoInput">Largo (m)</label>
                  <input
                    id="largoInput"
                    type="text"
                    inputMode="decimal"
                    value={largo}
                    onChange={(e) => setLargo(e.target.value)}
                    placeholder="4"
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="anchoInput">Ancho (m)</label>
                  <input
                    id="anchoInput"
                    type="text"
                    inputMode="decimal"
                    value={ancho}
                    onChange={(e) => setAncho(e.target.value)}
                    placeholder="3"
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="altoInput">Alto (m)</label>
                  <input
                    id="altoInput"
                    type="text"
                    inputMode="decimal"
                    value={alto}
                    onChange={(e) => setAlto(e.target.value)}
                    placeholder="2.5"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="huecosInput">Puertas y ventanas a descontar (m²)</label>
                <input
                  id="huecosInput"
                  type="text"
                  inputMode="decimal"
                  value={huecos}
                  onChange={(e) => setHuecos(e.target.value)}
                  placeholder="Ej: 3,3"
                  className={styles.input}
                  aria-describedby="huecosHint"
                />
                <p id="huecosHint" className={styles.hint}>
                  Una puerta ocupa alrededor de 1,8 m² y una ventana, de 1,2 a 2 m². Suelen ser
                  el 10-15 % de la pared. Déjalo vacío si vas a pintarlo todo.
                </p>
              </div>

              <div className={styles.checkboxGroup}>
                <input
                  id="techoInput"
                  type="checkbox"
                  checked={incluirTecho}
                  onChange={(e) => setIncluirTecho(e.target.checked)}
                  className={styles.checkbox}
                />
                <label htmlFor="techoInput">Incluir el techo (largo × ancho)</label>
              </div>
            </>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="numCapasSelect">Número de capas</label>
            <select
              id="numCapasSelect"
              value={numCapas}
              onChange={(e) => setNumCapas(e.target.value)}
              className={styles.select}
            >
              <option value="1">1 capa</option>
              <option value="2">2 capas (recomendado)</option>
              <option value="3">3 capas</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="tipoSuperficieSelect">Tipo de superficie</label>
            <select
              id="tipoSuperficieSelect"
              value={tipoSuperficie}
              onChange={(e) => cambiarSuperficie(e.target.value as TipoSuperficie)}
              className={styles.select}
            >
              {(Object.keys(SOPORTES) as TipoSuperficie[]).map((key) => (
                <option key={key} value={key}>
                  {SOPORTES[key].descripcion} ({SOPORTES[key].min}–{SOPORTES[key].max} m²/L)
                </option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="rendimientoInput">Rendimiento de la pintura (m²/L)</label>
            <input
              id="rendimientoInput"
              type="text"
              inputMode="decimal"
              value={rendimiento}
              onChange={(e) => setRendimiento(e.target.value)}
              placeholder={String(soporte.tipico)}
              className={styles.input}
              aria-describedby="rendimientoHint"
            />
            <p id="rendimientoHint" className={styles.hint}>
              Rango habitual sobre {soporte.descripcion.toLowerCase()}: {soporte.min}–
              {soporte.max} m²/L por mano. Viene relleno con el extremo favorable; si la ficha
              técnica de tu bote dice otra cosa, escríbela aquí.
            </p>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="precioLitroInput">Precio por litro (opcional)</label>
            <div className={styles.inputConUnidad}>
              <input
                id="precioLitroInput"
                type="text"
                inputMode="decimal"
                value={precioPorLitro}
                onChange={(e) => setPrecioPorLitro(e.target.value)}
                placeholder="8"
                className={styles.input}
              />
              <span className={styles.unidad}>€/L</span>
            </div>
          </div>

          {error && (
            <div className={styles.errorMsg} role="alert">
              {error}
            </div>
          )}

          <div className={styles.botones}>
            <button type="button" onClick={calcular} className={styles.btnPrimary}>
              Calcular
            </button>
            <button type="button" onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel} role="status" aria-live="polite" aria-atomic="true">
          {resultado ? (
            <>
              {caducado && (
                <p className={styles.avisoCaducado}>
                  <span aria-hidden="true">⚠️</span> Has cambiado los datos: estas cifras son del
                  cálculo anterior. Pulsa «Calcular» para recalcularlas.
                </p>
              )}

              <div className={caducado ? styles.contenidoCaducado : undefined}>
                <div className={styles.resultadoPrincipal}>
                  <span className={styles.resultadoIcon} aria-hidden="true">🎨</span>
                  <div className={styles.resultadoValor}>
                    {formatNumber(resultado.litrosNecesarios, 1)} L
                  </div>
                  <div className={styles.resultadoLabel}>
                    de pintura necesarios
                  </div>
                  <div className={styles.resultadoMargen}>
                    Con el 10 % de reserva para retoques:{' '}
                    <strong>{formatNumber(resultado.litrosConMargen, 1)} L</strong>
                  </div>
                </div>

                <div className={styles.detalles}>
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>Superficie total</span>
                    <span className={styles.detalleValor}>
                      {formatNumber(resultado.superficie, 1)} m²
                      {(resultado.techo > 0 || resultado.huecos > 0) && (
                        <span className={styles.detalleNota}>
                          paredes {formatNumber(resultado.paredes, 1)}
                          {resultado.techo > 0 && ` + techo ${formatNumber(resultado.techo, 1)}`}
                          {resultado.huecos > 0 && ` − huecos ${formatNumber(resultado.huecos, 1)}`}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>Rendimiento aplicado</span>
                    <span className={styles.detalleValor}>
                      {formatNumber(resultado.rendimiento, 1)} m²/L
                    </span>
                  </div>

                  {resultado.rendimientoBajo !== null && (
                    <div className={styles.detalleItem}>
                      <span className={styles.detalleLabel}>Si la pintura rinde menos</span>
                      <span className={styles.detalleValor}>
                        {formatNumber(resultado.litrosSiRindeMenos, 1)} L
                        <span className={styles.detalleNota}>
                          con {formatNumber(resultado.rendimientoBajo, 0)} m²/L, el extremo bajo
                          del rango
                        </span>
                      </span>
                    </div>
                  )}

                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>Botes de 4L</span>
                    <span className={styles.detalleValor}>
                      {resultado.botesPequenos} {resultado.botesPequenos === 1 ? 'bote' : 'botes'}
                      <span className={styles.detalleNota}>
                        {formatNumber(resultado.litrosBotesPequenos, 0)} L comprados
                        {resultado.precio > 0 &&
                          ` · ${formatCurrency(resultado.costeBotesPequenos)}`}
                      </span>
                    </span>
                  </div>

                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>Botes de 15L</span>
                    <span className={styles.detalleValor}>
                      {resultado.botesGrandes} {resultado.botesGrandes === 1 ? 'bote' : 'botes'}
                      <span className={styles.detalleNota}>
                        {formatNumber(resultado.litrosBotesGrandes, 0)} L comprados
                        {resultado.precio > 0 &&
                          ` · ${formatCurrency(resultado.costeBotesGrandes)}`}
                      </span>
                    </span>
                  </div>

                  {resultado.precio > 0 && (
                    <div className={styles.detalleItem}>
                      <span className={styles.detalleLabel}>Coste estimado</span>
                      <span className={styles.detalleValor}>
                        {formatCurrency(resultado.costeEstimado)}
                        <span className={styles.detalleNota}>
                          {resultado.botesElegidos}{' '}
                          {resultado.botesElegidos === 1 ? 'bote' : 'botes'} de{' '}
                          {resultado.envaseElegido} L, que es la compra con menos sobrante
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.consejos}>
                <h4><span aria-hidden="true">💡</span> Consejos</h4>
                <ul>
                  <li>
                    Los {formatNumber(resultado.litrosConMargen, 1)} L con reserva son la cifra a
                    comprar: cubren retoques y una tercera mano puntual.
                  </li>
                  <li>
                    El coste sale de los botes cerrados, no de los litros sueltos: la pintura
                    sobrante del envase se paga igual.
                  </li>
                  <li>
                    El rendimiento real varía según marca, color y técnica. Si tu ficha técnica da
                    otro dato, escríbelo en «Rendimiento de la pintura».
                  </li>
                  <li>
                    {resultado.huecos > 0
                      ? `Ya están descontados ${formatNumber(resultado.huecos, 1)} m² de puertas y ventanas.`
                      : 'Si no vas a pintar puertas y ventanas, indica sus metros cuadrados en el modo «Por habitación».'}
                  </li>
                  <li>Compra todos los botes del mismo lote: entre lotes el tono cambia.</li>
                </ul>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">🖌️</span>
              <p>Introduce los datos para calcular la cantidad de pintura</p>
            </div>
          )}
        </div>
      </div>

      <EducationalSection
        title="Guía de pintura interior y exterior"
        subtitle="Qué tipo de pintura elegir según la estancia, cómo preparar la superficie correctamente y cuándo necesitas imprimación"
      >
        <h3 className={styles.eduTitle}><span aria-hidden="true">🎨</span> Tipos de pintura y sus usos</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Acabado</th>
                <th>Ideal para</th>
                <th>Rendimiento aprox.</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Plástica mate</td>
                <td>Mate suave</td>
                <td>Dormitorios, salones</td>
                <td>10–12 m²/L</td>
              </tr>
              <tr>
                <td>Plástica satinada</td>
                <td>Ligero brillo</td>
                <td>Cocinas, zonas de paso</td>
                <td>8–10 m²/L</td>
              </tr>
              <tr>
                <td>Esmalte al agua</td>
                <td>Brillante, lavable</td>
                <td>Puertas, muebles, rodapiés</td>
                <td>12–14 m²/L</td>
              </tr>
              <tr>
                <td>Esmalte al aceite</td>
                <td>Muy brillante</td>
                <td>Exteriores, hierro, madera</td>
                <td>14–16 m²/L</td>
              </tr>
              <tr>
                <td>Imprimación</td>
                <td>Sin acabado visual</td>
                <td>Preparación de superficies</td>
                <td>6–8 m²/L</td>
              </tr>
              <tr>
                <td>Temple</td>
                <td>Mate calcáreo</td>
                <td>Techos, zonas con humedad</td>
                <td>8–10 m²/L</td>
              </tr>
            </tbody>
          </table>
          <p className={styles.tableNota}>
            Estos rangos son por mano y sobre pared lisa. La calculadora parte del rango del
            soporte que elijas y te deja escribir el rendimiento exacto de tu producto: el dato
            que manda es el de su ficha técnica.
          </p>
        </div>

        <h3 className={styles.eduTitle}><span aria-hidden="true">🏠</span> Situaciones habituales</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🛏️</span>
              <h4>Dormitorio o salón</h4>
            </div>
            <p className={styles.escenarioDesc}>Plástica mate en paredes lisas, 2 manos. Si cambias de color oscuro a claro, puede hacer falta una tercera mano.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🍳</span>
              <h4>Cocina o baño</h4>
            </div>
            <p className={styles.escenarioDesc}>Plástica satinada o esmalte lavable. Resisten la humedad y se limpian fácilmente. Evita la pintura mate en estas zonas.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🚪</span>
              <h4>Puertas y carpintería</h4>
            </div>
            <p className={styles.escenarioDesc}>Esmalte al agua (secado rápido, menos olor) o al aceite (más durable). Requiere lijar y limpiar antes de aplicar.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🌧️</span>
              <h4>Exterior o fachada</h4>
            </div>
            <p className={styles.escenarioDesc}>Pintura para fachadas con agentes antihumedad y flexibilidad. Verifica temperatura mínima de aplicación (más de 5 °C).</p>
          </div>
        </div>

        <h3 className={styles.eduTitle}><span aria-hidden="true">❓</span> Preguntas frecuentes sobre pintura</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>¿Cuántas manos de pintura necesito?</strong>
            <p>Lo habitual son 2 manos. Si cubres un color muy oscuro con uno claro, puede ser necesaria una tercera. La imprimación puede reducir el número de manos en superficies nuevas.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Necesito imprimación siempre?</strong>
            <p>No siempre. Es necesaria en superficies nuevas (pladur, yeso), porosas (cemento), con manchas de humedad o cuando el cambio de color es muy drástico.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Cómo calculo el gotelé correctamente?</strong>
            <p>El gotelé consume alrededor de un 50% más de pintura que la misma pared lisa: es el factor que aplica la calculadora al elegir el soporte &quot;gotelé&quot; (de 12 a 8 m²/L). Un gotelé muy grueso se acerca a la superficie porosa, que llega a duplicar el consumo (12 a 6 m²/L).</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Por qué comprar un 10% extra?</strong>
            <p>Para retoques futuros y zonas que necesitan una tercera mano. La calculadora publica esa cifra junto a los litros exactos. Es fundamental que sea de la misma partida (mismo número de lote) para garantizar igual tono de color.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Hay que lijar antes de pintar?</strong>
            <p>Sí, si hay irregularidades, burbujas o pintura antigua en mal estado. En paredes en buen estado basta con limpiar el polvo y desengrasarlas.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué pintura usar en baños con humedad?</strong>
            <p>Las pinturas específicas anti-hongos contienen agentes fungicidas. Busca pinturas &quot;anti-moho&quot; o &quot;para zonas húmedas&quot;. También ayuda mejorar la ventilación del baño.</p>
          </div>
        </div>

        <h3 className={styles.eduTitle}><span aria-hidden="true">📋</span> Cómo usar esta calculadora paso a paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Elige el modo de cálculo</strong>
              <p>Por metros cuadrados directos si ya sabes la superficie, o por habitación para que la calculadora la estime por ti a partir del largo, el ancho y el alto.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Descuenta los huecos y decide si entra el techo</strong>
              <p>En el modo por habitación, indica los metros cuadrados de puertas y ventanas que no vas a pintar (una puerta ronda los 1,8 m²; una ventana, de 1,2 a 2 m²) y marca la casilla del techo si también lo vas a pintar.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Selecciona el tipo de superficie</strong>
              <p>Lisa, gotelé, rugosa o porosa. El rendimiento varía notablemente: el gotelé consume alrededor de un 50% más que una pared lisa, y una superficie muy porosa llega a consumir el doble.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Ajusta el rendimiento y las capas</strong>
              <p>El campo de rendimiento viene relleno con el extremo favorable del rango del soporte; sustitúyelo por el de la ficha técnica de tu pintura si lo conoces. Normalmente son 2 manos, y 3 para cambios de color muy drásticos.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Compra la cifra con el 10% de reserva</strong>
              <p>La calculadora la publica junto a los litros exactos, y valora el coste sobre los botes cerrados que hay que comprar. Asegúrate de que sean del mismo lote para garantizar uniformidad de color.</p>
            </div>
          </div>
        </div>

        <h3 className={styles.eduTitle}><span aria-hidden="true">💡</span> Consejos para pintar mejor</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎨</span>
            <p>Compra toda la pintura del mismo lote. Pequeñas diferencias de tono entre lotes son visibles en la pared.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⬇️</span>
            <p>Pinta siempre de arriba abajo: primero el techo, luego las paredes y por último los rodapiés.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⏱️</span>
            <p>Deja secar completamente entre capas (mínimo 2–4 horas). No apliques la segunda mano con la primera aún húmeda.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">💧</span>
            <p>Humedece ligeramente el rodillo antes de empezar. Evitará que absorba demasiada pintura al inicio.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📏</span>
            <p>Cubre rodapiés, marcos y enchufes con cinta de carrocero. Es mucho más rápido que intentar limpiar después.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🫙</span>
            <p>Guarda el sobrante en un tarro hermético bien cerrado. Aguanta meses para pequeños retoques futuros.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes al calcular pintura</strong>
          </div>
          <ul className={styles.warningList}>
            <li>No restar puertas y ventanas: pueden representar el 10–15% de la superficie total de la pared. El modo por habitación tiene un campo para descontarlas.</li>
            <li>Dar por bueno el rendimiento más favorable: entre 10 y 12 m²/L hay más de un cuarto de bote de diferencia en una habitación normal.</li>
            <li>Presupuestar por litros sueltos: la pintura se vende en envases cerrados y se paga entero el que se abre.</li>
            <li>Mezclar pintura de distintos lotes: aunque sean el mismo color, pueden mostrar diferencia de tono visible.</li>
            <li>Pintar sin preparar la superficie: la pintura no adherirá bien sobre polvo, grasa o pintura antigua suelta.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-pintura')} />

      <ShareCard appName="calculadora-pintura" />
      <Footer appName="calculadora-pintura" />
    </div>
  );
}
