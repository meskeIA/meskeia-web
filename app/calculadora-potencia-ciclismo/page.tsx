'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './CalculadoraPotenciaCiclismo.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
  DisclaimerCard,
} from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  calcularPotenciaCiclismo,
  calcularVatiosPorFuerzas,
  CDA,
  CRR,
  FTP_MAX_W,
  RENDIMIENTO_TRANSMISION,
  type ResultadoPotenciaCiclismo,
  type ResultadoVatios,
} from '@/lib/calculadoras/deporte';

// ── Mapa de colores por nivel ─────────────────────────────────────────────────

const NIVEL_CLASE: Record<string, string> = {
  'Principiante':          styles.nivelPrincipiante,
  'Cicloturista':          styles.nivelCicloturista,
  'Amateur':               styles.nivelAmateur,
  'Amateur competitivo':   styles.nivelAmateur,
  'Semiprofesional':       styles.nivelSemiPro,
  'Profesional / Élite':   styles.nivelElite,
};

const NIVEL_VAM_CLASE: Record<string, string> = {
  'Principiante':          styles.nivelPrincipiante,
  'Cicloturista':          styles.nivelCicloturista,
  'Amateur':               styles.nivelAmateur,
  'Amateur fuerte':        styles.nivelAmateur,
  'Semiprofesional':       styles.nivelSemiPro,
  'Élite / Profesional':   styles.nivelElite,
};

// Fondos de las insignias de zona, con texto blanco encima: es texto pequeño y exige 4,5:1.
// Los tonos de antes (#48A9A6, #27AE60, #F39C12, #E07B39, #E74C3C) daban 2,19-3,82:1
// (hallazgo 2495); estos conservan el matiz y pasan de 5:1. Iguales en los dos temas, porque
// el contraste es entre el blanco y el fondo de la propia insignia.
const ZONA_COLORES: Record<string, string> = {
  Z1: 'var(--secondary-boton)', // #327874 · 5,15:1
  Z2: '#1D7A43',                // 5,36:1
  Z3: '#8A5A00',                // 5,93:1
  Z4: '#A84D14',                // 5,62:1
  Z5: '#B03A2E',                // 6,02:1
  Z6: '#8E44AD',                // 5,87:1
  Z7: '#444444',                // 9,74:1
};

/** Lleva a la vista lo que acaba de producir un botón, sin animar si se pide movimiento reducido. */
function llevarALaVista(el: HTMLElement | null): void {
  if (!el) return;
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ block: 'nearest', behavior: reducido ? 'auto' : 'smooth' });
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Los campos guardan el TEXTO tecleado y el número se deriva con parseSpanishNumber.
 *
 * Hasta el 30/09/2026 eran `type="number"` con `setX(Number(e.target.value))`: al teclear un
 * estado intermedio que todavía no es un número («-» suelto, «14.») el navegador entrega '',
 * Number('') vale 0 y React reescribía «0» en el campo, así que el signo o el punto
 * desaparecían y «-7» quedaba en «07» (una subida en vez de una bajada) y «14.5» en «05»
 * (hallazgo 2491). Y el desnivel, también `type="number"`, leía «1.500» con el punto como
 * decimal: metro y medio en vez de mil quinientos (hallazgo 2492). Con texto, el campo
 * muestra lo que se escribe y «1.500» son 1500, el criterio del catálogo.
 */
export default function CalculadoraPotenciaCiclismoPage() {
  const [peso, setPeso] = useState<string>('70');
  const [ftp, setFtp] = useState<string>('200');
  const [desnivel, setDesnivel] = useState<string>('');
  const [tiempoMin, setTiempoMin] = useState<string>('');
  const [resultado, setResultado] = useState<ResultadoPotenciaCiclismo | null>(null);
  const [mostrarVam, setMostrarVam] = useState<boolean>(false);
  // Un aviso por formulario, cada uno junto a su botón (hallazgo 2738): era uno solo y se pintaba
  // detrás del panel del estimador, así que con él abierto el aviso de «Calcular potencia» quedaba
  // a más de 1000 px del botón y pulsarlo no cambiaba nada a la vista.
  const [error, setError] = useState<string | null>(null);
  const [errorEstimador, setErrorEstimador] = useState<string | null>(null);

  // Estimador de vatios sin potenciómetro (modelo de fuerzas)
  const [mostrarEstimador, setMostrarEstimador] = useState<boolean>(false);
  const [masaTotal, setMasaTotal] = useState<string>('78');
  const [velocidad, setVelocidad] = useState<string>('20');
  const [pendiente, setPendiente] = useState<string>('0');
  const [vatios, setVatios] = useState<ResultadoVatios | null>(null);

  // Lo que produce cada botón se lleva a la vista al aparecer (hallazgo 2738). El contador
  // dispara el desplazamiento también cuando el aviso repite texto y React no re-renderiza.
  const salidaPrincipal = useRef<HTMLDivElement>(null);
  const salidaEstimador = useRef<HTMLDivElement>(null);
  const [pulsadoPrincipal, setPulsadoPrincipal] = useState(0);
  const [pulsadoEstimador, setPulsadoEstimador] = useState(0);
  useEffect(() => {
    if (pulsadoPrincipal > 0) llevarALaVista(salidaPrincipal.current);
  }, [pulsadoPrincipal]);
  useEffect(() => {
    if (pulsadoEstimador > 0) llevarALaVista(salidaEstimador.current);
  }, [pulsadoEstimador]);

  // Lo tecleado, ya leído como número (NaN si no lo es: el motor lo rechaza con su aviso)
  const pesoNum = parseSpanishNumber(peso);
  const ftpNum = parseSpanishNumber(ftp);

  const calcular = () => {
    setPulsadoPrincipal(n => n + 1);
    setErrorEstimador(null);
    // Con el plegable cerrado la VAM no participa: sus campos guardan lo escrito para cuando se
    // vuelva a abrir, pero ni bloquean el W/kg ni sacan una VAM que el usuario plegó (hallazgo 2739).
    const des = mostrarVam && desnivel.trim() !== '' ? parseSpanishNumber(desnivel) : undefined;
    const tMin = mostrarVam && tiempoMin.trim() !== '' ? parseSpanishNumber(tiempoMin) : undefined;
    // Un desnivel o un tiempo que no son un número se avisan aquí: el motor solo sabe de
    // «falta» o «≤ 0», y un NaN caería en el aviso equivocado.
    if ((des !== undefined && !Number.isFinite(des)) || (tMin !== undefined && !Number.isFinite(tMin))) {
      setResultado(null);
      setError('El desnivel y el tiempo deben ser números (por ejemplo, 850 m y 45 min).');
      return;
    }
    try {
      // El motor valida: un peso de 0 kg daba Infinity, que la app rotulaba «∞ W/kg» con el
      // veredicto MÁS favorable de su escala, y uno negativo, con el más desfavorable.
      setResultado(calcularPotenciaCiclismo(pesoNum, ftpNum, des, tMin));
      setError(null);
    } catch (e) {
      setResultado(null);
      setError(e instanceof Error ? e.message : 'No se ha podido calcular.');
    }
  };

  const estimarVatios = () => {
    setPulsadoEstimador(n => n + 1);
    setError(null);
    try {
      const r = calcularVatiosPorFuerzas({
        masaTotal_kg: parseSpanishNumber(masaTotal),
        velocidad_kmh: parseSpanishNumber(velocidad),
        pendiente_pct: parseSpanishNumber(pendiente),
      });
      setVatios(r);
      setErrorEstimador(null);
    } catch (e) {
      setVatios(null);
      setErrorEstimador(e instanceof Error ? e.message : 'No se ha podido estimar.');
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🚴</span> Calculadora de Vatios en Ciclismo</h1>
        <p className={styles.subtitle}>
          Cuántos vatios (watts) mueves y qué significan: FTP, W/kg y VAM para conocer tu nivel como ciclista
        </p>
      </header>

      {/* La app está en la suite salud y pauta entrenamiento personalizado a partir del FTP
          (intervalos en Z4, trabajo en Z5-Z6), que la política sitúa en Nivel 2 ALTO. Estaba
          declarada como exenta de disclaimer, que se reserva a lo educativo puro. */}
      <DisclaimerCard variant="medical" severity="high" collapsible={false} />

      <LegalNotice />

      <main className={styles.main}>

        {/* ── Sección 1: Datos obligatorios ── */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Datos de rendimiento</h2>
          <div className={styles.inputGrid}>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="peso">
                Peso corporal
                <span className={styles.inputHint}>Entre 30 y 150 kg</span>
              </label>
              <div className={styles.inputRow}>
                <input
                  id="peso"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={peso}
                  onChange={e => { setPeso(e.target.value); setResultado(null); }}
                  className={styles.inputNumber}
                  aria-label="Peso en kilogramos"
                />
                <span className={styles.inputUnidad}>kg</span>
              </div>
              <input
                type="range" min={30} max={150} value={Number.isFinite(pesoNum) ? pesoNum : 30}
                onChange={e => { setPeso(e.target.value); setResultado(null); }}
                className={styles.slider}
                aria-hidden="true"
                tabIndex={-1}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="ftp">
                FTP (Umbral de Potencia Funcional)
                <span className={styles.inputHint}>Potencia sostenible durante 1 hora (50-600 W)</span>
              </label>
              <div className={styles.inputRow}>
                <input
                  id="ftp"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={ftp}
                  onChange={e => { setFtp(e.target.value); setResultado(null); }}
                  className={styles.inputNumber}
                  aria-label="FTP en vatios"
                />
                <span className={styles.inputUnidad}>W</span>
              </div>
              <input
                type="range" min={50} max={600} value={Number.isFinite(ftpNum) ? ftpNum : 50}
                onChange={e => { setFtp(e.target.value); setResultado(null); }}
                className={styles.slider}
                aria-hidden="true"
                tabIndex={-1}
              />
            </div>
          </div>

          {/* ── Sección 2: VAM opcional ── */}
          <div className={styles.vamToggle}>
            <button
              type="button"
              className={styles.vamToggleBtn}
              onClick={() => { setMostrarVam(v => !v); setResultado(null); }}
              aria-expanded={mostrarVam}
            >
              <span aria-hidden="true">{mostrarVam ? '▲' : '▼'}</span> Calcular VAM para subida cronometrada (opcional)
            </button>
          </div>

          {mostrarVam && (
            <div className={styles.vamGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel} htmlFor="desnivel">
                  Desnivel positivo
                  <span className={styles.inputHint}>Entre 1 y 3000 m</span>
                </label>
                <div className={styles.inputRow}>
                  <input
                    id="desnivel"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={desnivel}
                    placeholder="850"
                    onChange={e => { setDesnivel(e.target.value); setResultado(null); }}
                    className={styles.inputNumber}
                    aria-label="Desnivel en metros"
                  />
                  <span className={styles.inputUnidad}>m</span>
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel} htmlFor="tiempoMin">
                  Tiempo empleado
                  <span className={styles.inputHint}>Entre 1 y 600 min</span>
                </label>
                <div className={styles.inputRow}>
                  <input
                    id="tiempoMin"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={tiempoMin}
                    placeholder="45"
                    onChange={e => { setTiempoMin(e.target.value); setResultado(null); }}
                    className={styles.inputNumber}
                    aria-label="Tiempo en minutos"
                  />
                  <span className={styles.inputUnidad}>min</span>
                </div>
              </div>
            </div>
          )}

          <div className={styles.btnWrapper}>
            <button type="button" onClick={calcular} className={styles.btnCalcular}>
              Calcular potencia →
            </button>
          </div>
        </div>

        {/* Lo que produce «Calcular potencia» va justo detrás de su panel, antes del estimador:
            detrás de él quedaba fuera de la pantalla con el estimador abierto (hallazgo 2738). */}
        {(error || resultado) && (
          <div ref={salidaPrincipal} className={styles.salida}>
            {error && (
              <p className={styles.avisoError} role="alert">{error}</p>
            )}

            {/* ── Resultados ── */}
            {resultado && (
              <div className={styles.resultados} role="region" aria-label="Resultados de potencia">

                {/* W/kg */}
                <div className={styles.resultCard}>
                  <div className={styles.resultHeader}>
                    <span className={styles.resultLabel}>Ratio W/kg</span>
                    <span className={`${styles.nivelBadge} ${NIVEL_CLASE[resultado.nivelWattsKg] ?? styles.nivelPrincipiante}`}>
                      {resultado.nivelWattsKg}
                    </span>
                  </div>
                  <div className={styles.resultValor}>
                    {formatNumber(resultado.wattsKg, 2)} <span className={styles.resultUnidad}>W/kg</span>
                  </div>
                  <p className={styles.resultDesc}>{resultado.descripcionNivel}</p>
                </div>

                {/* VAM (si se calculó) */}
                {resultado.vam !== null && resultado.nivelVam !== null && (
                  <div className={styles.resultCard}>
                    <div className={styles.resultHeader}>
                      <span className={styles.resultLabel}>VAM (Velocidad Ascensional Media)</span>
                      <span className={`${styles.nivelBadge} ${NIVEL_VAM_CLASE[resultado.nivelVam] ?? styles.nivelPrincipiante}`}>
                        {resultado.nivelVam}
                      </span>
                    </div>
                    <div className={styles.resultValor}>
                      {formatNumber(resultado.vam, 0)} <span className={styles.resultUnidad}>m/h</span>
                    </div>
                    <p className={styles.resultDesc}>
                      Desnivel ganado por hora de esfuerzo sostenido en subida
                    </p>
                  </div>
                )}

                {resultado.avisoVam && (
                  <p className={styles.avisoVam}>{resultado.avisoVam}</p>
                )}

                {/* Tabla de zonas */}
                <div className={styles.zonasCard}>
                  <h3 className={styles.zonasTitle}>
                    Zonas de Potencia de Coggan (basadas en tu FTP: {formatNumber(ftpNum, 0)} W)
                  </h3>
                  <div className={styles.tableWrapper}>
                    <table className={styles.zonasTable}>
                      <thead>
                        <tr>
                          <th>Zona</th>
                          <th>Nombre</th>
                          <th>% FTP</th>
                          <th>Rango (W)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultado.zonasPotencia.map(z => (
                          <tr key={z.zona}>
                            <td>
                              <span
                                className={styles.zonaBadge}
                                style={{ backgroundColor: ZONA_COLORES[z.zona] ?? '#999' }}
                              >
                                {z.zona}
                              </span>
                            </td>
                            <td className={styles.zonaNombre}>{z.nombre}</td>
                            <td className={styles.zonaPorc}>{z.porcentajeFTP}</td>
                            <td className={styles.zonaRango}>
                              {z.wattsMax === null
                                ? `desde ${formatNumber(z.wattsMin, 0)} W`
                                : `${formatNumber(z.wattsMin, 0)} – ${formatNumber(z.wattsMax, 0)} W`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Las zonas no nombraban su modelo y les faltaba la Z7 (hallazgo 2745). */}
                  <p className={styles.tableNote}>
                    Son los siete niveles de entrenamiento por potencia que propuso Andrew Coggan
                    (Allen y Coggan, <cite>Training and Racing with a Power Meter</cite>, 2006).
                    Coggan define la Z6 como más del 120&nbsp;% del FTP y deja la Z7 sin porcentaje,
                    porque son sprints de pocos segundos: el corte en el 150&nbsp;% es una convención
                    práctica para poder dar vatios, no parte del modelo original.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}


        {/* ── Sección 1.bis: estimar los vatios sin potenciómetro ──
            El h1 promete «calcular tus vatios» y el resto de la app pide el FTP en vatios como
            ENTRADA: quien buscaba «cuántos vatios muevo» se encontraba un formulario que le
            exigía justo el dato que venía a buscar. Aquí se estiman con el modelo de fuerzas a
            partir de lo que sí tiene sin potenciómetro (hallazgo 240 del Inspector). */}
        <div className={styles.panel}>
          <div className={styles.vamToggle}>
            <button
              type="button"
              className={styles.vamToggleBtn}
              onClick={() => setMostrarEstimador(v => !v)}
              aria-expanded={mostrarEstimador}
            >
              <span aria-hidden="true">{mostrarEstimador ? '▲' : '▼'}</span> ¿No tienes
              potenciómetro? Estima tus vatios a partir de la velocidad
            </button>
          </div>

          {mostrarEstimador && (
            <>
              <div className={styles.vamGrid}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel} htmlFor="masaTotal">
                    Peso total en movimiento
                    <span className={styles.inputHint}>Tú + la bici + lo que lleves (30-200 kg)</span>
                  </label>
                  <div className={styles.inputRow}>
                    <input
                      id="masaTotal"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={masaTotal}
                      onChange={e => { setMasaTotal(e.target.value); setVatios(null); }}
                      className={styles.inputNumber}
                      aria-label="Peso total en kilogramos"
                    />
                    <span className={styles.inputUnidad}>kg</span>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel} htmlFor="velocidad">
                    Velocidad media sostenida
                    <span className={styles.inputHint}>Entre 1 y 80 km/h</span>
                  </label>
                  <div className={styles.inputRow}>
                    <input
                      id="velocidad"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={velocidad}
                      onChange={e => { setVelocidad(e.target.value); setVatios(null); }}
                      className={styles.inputNumber}
                      aria-label="Velocidad en kilómetros por hora"
                    />
                    <span className={styles.inputUnidad}>km/h</span>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel} htmlFor="pendiente">
                    Pendiente media
                    <span className={styles.inputHint}>0 en llano; negativa en bajada (−15 a 25)</span>
                  </label>
                  <div className={styles.inputRow}>
                    <input
                      id="pendiente"
                      type="text"
                      // Teclado de texto y no «decimal»: el teclado decimal de iOS no trae el
                      // signo menos, y la pendiente de bajada lo necesita.
                      inputMode="text"
                      autoComplete="off"
                      value={pendiente}
                      onChange={e => { setPendiente(e.target.value); setVatios(null); }}
                      className={styles.inputNumber}
                      aria-label="Pendiente en porcentaje"
                    />
                    <span className={styles.inputUnidad}>%</span>
                  </div>
                </div>
              </div>

              <div className={styles.btnWrapper}>
                <button type="button" onClick={estimarVatios} className={styles.btnCalcular}>
                  Estimar vatios →
                </button>
              </div>

              {(vatios || errorEstimador) && (
                <div ref={salidaEstimador} className={styles.salida}>
                  {errorEstimador && (
                    <p className={styles.avisoError} role="alert">{errorEstimador}</p>
                  )}
                  {vatios && (
                    <div className={styles.resultCard} role="status">
                      <div className={styles.resultHeader}>
                        <span className={styles.resultLabel}>
                          {vatios.sinPedalear ? 'No hace falta pedalear' : 'Potencia estimada'}
                        </span>
                      </div>
                      <div className={styles.resultValor}>
                        {formatNumber(vatios.vatios, 0)} <span className={styles.resultUnidad}>W</span>
                      </div>
                      {/* En bajada el balance de fuerzas puede dar un número negativo. Es correcto
                          como balance, pero no es la potencia del ciclista: a esa velocidad no
                          pedalea, frena. Se dice, en vez de publicar «−178 W» como si fuera su
                          esfuerzo (hallazgo 252). */}
                      {vatios.sinPedalear ? (
                        <p className={styles.resultDesc}>
                          Con esa pendiente, la gravedad sostiene esa velocidad de sobra: el ciclista
                          no aporta potencia, y aún le sobran{' '}
                          <strong>{formatNumber(vatios.potenciaSobrante, 0)} W</strong> que tiene que
                          disipar frenando o dejando subir la velocidad. Para estimar tus vatios en
                          bajada haría falta saber cuánto frenas, que no es un dato que se tenga.
                        </p>
                      ) : vatios.desglose.gravedad < 0 ? (
                        /* Bajada en la que aún se pedalea: la gravedad APORTA potencia. Publicarla como
                           «-153 W contra la gravedad» era rotular una ayuda como un esfuerzo negativo
                           (hallazgo 2743). Rodadura + aire − ayuda = lo que pone el ciclista. */
                        <p className={styles.resultDesc}>
                          Reparto del esfuerzo: {formatNumber(vatios.desglose.rodadura, 0)} W de
                          rodadura · {formatNumber(vatios.desglose.aerodinamica, 0)} W contra el aire.
                          La bajada te ayuda: la gravedad aporta{' '}
                          <strong>{formatNumber(-vatios.desglose.gravedad, 0)} W</strong> a favor, y tú
                          pones el resto.
                        </p>
                      ) : (
                        <p className={styles.resultDesc}>
                          Reparto del esfuerzo: {formatNumber(vatios.desglose.gravedad, 0)} W contra la
                          gravedad · {formatNumber(vatios.desglose.rodadura, 0)} W de rodadura ·{' '}
                          {formatNumber(vatios.desglose.aerodinamica, 0)} W contra el aire.
                          {vatios.vam !== null && (
                            <> Esa subida son {formatNumber(vatios.vam, 0)} m/h de VAM.</>
                          )}
                        </p>
                      )}
                      {/* La potencia a esa velocidad NO es el FTP salvo en un caso concreto, y la guía
                          y el FAQ la presentaban como si lo fuera (hallazgo 2498). */}
                      {!vatios.sinPedalear && vatios.vatios > FTP_MAX_W && (
                        /* Por encima del FTP máximo que admite el formulario no se invita a usarla
                           como FTP: el formulario la rechazaría (hallazgo 2740). */
                        <p className={styles.resultDesc}>
                          Es la potencia que exige <strong>esa velocidad</strong>, no tu FTP: pasa de
                          los {formatNumber(FTP_MAX_W, 0)} W, el FTP más alto que admite la
                          calculadora, así que es un esfuerzo que solo se sostiene unos minutos, no
                          alrededor de una hora. No la uses como FTP.
                        </p>
                      )}
                      {!vatios.sinPedalear && vatios.vatios <= FTP_MAX_W && (
                        <p className={styles.resultDesc}>
                          Es la potencia que exige <strong>esa velocidad</strong>, no tu FTP. Solo se
                          le parece si fue tu esfuerzo máximo sostenido durante alrededor de una hora
                          (una subida larga o una contrarreloj a tope); en ese caso puedes escribirla
                          como FTP arriba, con tu peso corporal sin la bici, para ver el W/kg y las zonas.
                        </p>
                      )}
                      {/* Los supuestos, completos y con la fuente del modelo (hallazgo 2744). La
                          transmisión no se declaraba y la cifra solo cuadra contándola. Crr y CdA no
                          tienen una fuente única: se presentan como lo que son, supuestos típicos. */}
                      <p className={styles.resultDesc}>
                        Es una <strong>estimación</strong> con el modelo de potencia en carretera de
                        Martin y colaboradores (1998, <cite>Journal of Applied Biomechanics</cite>), que
                        lo validaron contra un potenciómetro. Los coeficientes no son tuyos ni de ese
                        estudio, sino supuestos típicos de carretera: asfalto en buen estado (Crr{' '}
                        {formatNumber(CRR, 3)}), posición sobre las manetas (CdA{' '}
                        {formatNumber(CDA, 2)} m²), una transmisión que pierde el{' '}
                        {formatNumber((1 - RENDIMIENTO_TRANSMISION) * 100, 1)}&nbsp;% de la potencia
                        (rendimiento {formatNumber(RENDIMIENTO_TRANSMISION, 3)}) y aire a nivel del mar,
                        sin viento. Con viento, otra postura o ruedas distintas cambia, y no sustituye a
                        un potenciómetro.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Sección educativa ── */}
        <EducationalSection
          title="Guía de Potencia en Ciclismo"
          subtitle="FTP, W/kg, VAM y zonas de entrenamiento explicados"
          icon="🚴"
        >
          <section className={styles.guideSection}>
            <h2>¿Qué es el FTP y cómo medirlo?</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">⚡</span>
                  <h3>Qué es el FTP</h3>
                </div>
                <p className={styles.escenarioTip}>
                  El FTP (Functional Threshold Power) es la potencia máxima sostenible durante aproximadamente 1 hora de esfuerzo máximo. Es el indicador de referencia del entrenamiento por potencia: de él salen las zonas de intensidad, y permite comparar rendimientos entre ciclistas.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🧪</span>
                  <h3>Test de 20 minutos</h3>
                </div>
                <p className={styles.escenarioTip}>
                  Es el protocolo que propusieron Hunter Allen y Andrew Coggan en su libro <cite>Training and Racing with a Power Meter</cite>: calienta a ritmo suave, luego da el máximo esfuerzo sostenible durante 20 minutos continuos, y la potencia media de esos 20 minutos multiplicada por 0,95 es tu FTP estimado. El factor 0,95 descuenta que 20 minutos se aguantan a algo más de intensidad que una hora; es una aproximación, y en cada persona la diferencia real varía.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🔁</span>
                  <h3>¿Cada cuánto actualizarlo?</h3>
                </div>
                <p className={styles.escenarioTip}>
                  Es costumbre entre entrenadores repetir el test cada 6–8 semanas de entrenamiento estructurado, o cuando las sesiones empiezan a resultar claramente más fáciles; no es un plazo validado por estudios, sino una pauta práctica. Quien empieza suele mejorar el FTP más deprisa que un ciclista con años de entrenamiento, pero no hay una cifra de mejora que valga para todos.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">📱</span>
                  <h3>Sin potenciómetro</h3>
                </div>
                <p className={styles.escenarioTip}>
                  Esta misma página estima tus vatios: en «¿No tienes potenciómetro? Estima tus vatios a partir de la velocidad», arriba, con tu peso total, la velocidad que sostuviste y la pendiente. Da la potencia que exige esa velocidad, que solo se parece a tu FTP si fue tu esfuerzo máximo sostenido durante alrededor de una hora (una subida larga o una contrarreloj a tope). Sale del modelo de fuerzas (gravedad, rodadura y aire), así que es orientativo y supone coeficientes típicos de carretera. También hay aplicaciones de entrenamiento (Zwift, TrainerRoad, Garmin Connect) que estiman el FTP con la frecuencia cardíaca y la velocidad en rodillos calibrados. Un potenciómetro físico sigue siendo la medición más precisa.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>¿Qué es el W/kg y para qué sirve?</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Nivel</th>
                    <th>W/kg</th>
                    <th>Perfil típico</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong className={styles.nivelTxtPrincipiante}>Principiante</strong></td>
                    <td>&lt; 1,5</td>
                    <td>Inicio en la bicicleta, salidas cortas</td>
                  </tr>
                  <tr>
                    <td><strong className={styles.nivelTxtCicloturista}>Cicloturista</strong></td>
                    <td>1,5 – 2,5</td>
                    <td>Salidas regulares en grupo, fondo recreativo</td>
                  </tr>
                  <tr>
                    <td><strong className={styles.nivelTxtAmateur}>Amateur</strong></td>
                    <td>2,5 – 3,5</td>
                    <td>Entrenamiento estructurado, marchas populares</td>
                  </tr>
                  <tr>
                    <td><strong className={styles.nivelTxtCompetitivo}>Amateur competitivo</strong></td>
                    <td>3,5 – 4,5</td>
                    <td>Competición federada, escapadas en carrera</td>
                  </tr>
                  <tr>
                    <td><strong className={styles.nivelTxtSemiPro}>Semiprofesional</strong></td>
                    <td>4,5 – 5,5</td>
                    <td>Ciclismo de élite regional o nacional</td>
                  </tr>
                  <tr>
                    <td><strong className={styles.nivelTxtElite}>Profesional / Élite</strong></td>
                    <td>&gt; 5,5</td>
                    <td>Nivel World Tour</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className={styles.tableNote}>
              Escala orientativa de esta calculadora, sin fuente oficial: no existe una clasificación de niveles por W/kg aceptada por todos, y otras (como el perfil de potencia de Allen y Coggan) usan cortes y nombres distintos. El ratio W/kg es especialmente relevante en terreno montañoso, donde el peso del ciclista penaliza directamente la velocidad de ascenso. En llano, la potencia absoluta (W) tiene más peso que el ratio.
            </p>
          </section>

          <section className={styles.guideSection}>
            <h2>¿Qué es la VAM?</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4><span aria-hidden="true">📐</span> Definición y fórmula</h4>
                <p>
                  VAM son las siglas de Velocidad Ascensional Media (en italiano, <i lang="it">velocità ascensionale media</i>): los metros de desnivel que se suben por hora. La popularizó como indicador del rendimiento en subida el médico italiano Michele Ferrari, el mismo al que la agencia antidopaje de Estados Unidos (USADA) inhabilitó de por vida en 2012 por el caso del equipo US Postal; la medida es solo aritmética y no depende de quién la difundiera. Se calcula: VAM (m/h) = Desnivel (m) × 60 / Tiempo (min).
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4><span aria-hidden="true">📊</span> Valores de referencia en subida</h4>
                <p>
                  Es la misma escala con la que esta calculadora te clasifica: por debajo de 800 m/h, principiante; 800–1.000, cicloturista; 1.000–1.200, amateur; 1.200–1.400, amateur fuerte; 1.400–1.600, semiprofesional; y por encima de 1.600 m/h, élite. Es una escala orientativa de esta calculadora, sin fuente oficial: no hay una clasificación de la VAM aceptada por todos, y la cifra depende mucho de la pendiente y de la duración de la subida.
                </p>
                <p className={styles.faqTip}>
                  La VAM varía según la pendiente: a mayor pendiente, mayor VAM para el mismo W/kg. Comparar la VAM de subidas con pendientes muy distintas puede inducir a error.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4><span aria-hidden="true">🔗</span> Relación VAM y W/kg</h4>
                <p>
                  Existe una relación aproximada entre VAM y W/kg que depende de la pendiente media. Una regla empírica que difundió el propio Ferrari es <strong>VAM ≈ W/kg × (2 + %pendiente/10) × 100</strong>: al 8&nbsp;% sale el factor 280, no 255 —ese corresponde a una pendiente del 5,5&nbsp;%—, y resolver la subida con el modelo de fuerzas da 288 para un ciclista de 70 kg con una bici de 8. Es decir, al 8&nbsp;% de pendiente, <strong>W/kg ≈ VAM / 280</strong>. La relación varía con la resistencia aerodinámica, el peso de la bici, la temperatura y la altitud: úsala como estimación orientativa, no como fórmula exacta.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Cómo entrenar por zonas de potencia</h2>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h4>Mide tu FTP de partida</h4>
                  <p>Realiza el test de 20 minutos en condiciones controladas (sin subidas ni semáforos, preferiblemente en rodillo). Este valor es tu punto de partida para definir todas las zonas.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h4>Haz la mayor parte del volumen a intensidad baja (base aeróbica)</h4>
                  <p>En deportistas de resistencia bien entrenados se ha descrito que la mayoría de las sesiones son de intensidad baja: en esquiadores de fondo júnior, Seiler y Kjerland (2006) midieron en torno al 75&nbsp;% por debajo del primer umbral, que en las zonas de Coggan corresponde sobre todo a Z1 y Z2. Es un patrón observado en un grupo concreto, no una cuota exacta para cada ciclista.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h4>Introduce intervalos en Z4 (umbral)</h4>
                  <p>1–2 sesiones por semana con bloques de 10–20 minutos en Z4 elevan el FTP progresivamente. Ejemplos: 3 × 10 min Z4 con 5 min recuperación, o 2 × 20 min Z4. Este trabajo es la clave para mejorar el umbral de lactato.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h4>Reserva Z5–Z6 para trabajo de alta calidad</h4>
                  <p>Los intervalos VO2max (Z5, 3–5 min) y anaeróbicos (Z6, 30–90 seg) generan las mayores adaptaciones de potencia pico, pero requieren mayor recuperación. Ideal para preparar sprints, ataques y finales de carrera.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <h4>Repite el test FTP de vez en cuando</h4>
                  <p>El FTP es una forma objetiva de seguir la mejora; la costumbre habitual es repetir el test cada 6–8 semanas. A medida que sube el FTP, todas las zonas se desplazan hacia arriba. Sin actualizar las zonas, entrenarías por debajo de tu nivel real.</p>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Claves para mejorar el W/kg</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">⚡</span>
                <h4>Aumenta el FTP con consistencia</h4>
                <p>El FTP mejora con entrenamiento regular y progresivo, no con esfuerzos esporádicos máximos. La consistencia durante semanas y meses es más efectiva que picos de intensidad aislados.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
                <h4>El peso importa especialmente en subidas</h4>
                <p>Reducir 2–3 kg de peso corporal mejora el W/kg sin cambiar el FTP. En terreno llano este efecto es menor; en subidas largas puede suponer 1–2 min de diferencia por cada 500 m de desnivel.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🌬️</span>
                <h4>La aerodinámica importa más en llano</h4>
                <p>En llano, la resistencia aerodinámica se lleva la mayor parte del esfuerzo: con el estimador de esta página, a 30&nbsp;km/h y 78&nbsp;kg son 116 de los 149&nbsp;W, casi cuatro de cada cinco. Una postura más agresiva sobre la bici o componentes aerodinámicos pueden ser más rentables que mejorar el FTP para reducir tiempos en terreno plano.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">😴</span>
                <h4>El descanso es parte del entrenamiento</h4>
                <p>El FTP no mejora durante el esfuerzo, sino en la recuperación. Dormir 7–9 horas, incluir semanas de descarga cada 3–4 semanas y gestionar el estrés general son factores que afectan al rendimiento tanto como las sesiones de calidad.</p>
              </div>
            </div>
          </section>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>Errores Frecuentes en el Entrenamiento por Potencia</h3>
            </div>
            <ul className={styles.warningList}>
              <li><strong><span aria-hidden="true">❌</span> Usar el FTP de otra persona como referencia propia:</strong> El FTP es individual. Compararse con valores de referencia de ciclistas profesionales o de amigos puede llevar a entrenar en zonas incorrectas.</li>
              <li><strong><span aria-hidden="true">❌</span> Hacer el test FTP sin preparación adecuada:</strong> Un test realizado tras días de fatiga acumulada, enfermedad o sin un buen calentamiento dará un FTP subestimado y zonas demasiado conservadoras.</li>
              <li><strong><span aria-hidden="true">❌</span> Entrenar siempre en Z4-Z5 creyendo que "más intensidad = más mejora":</strong> Sin base aeróbica sólida (Z2), los intervalos de alta intensidad tienen efecto limitado y aumentan el riesgo de sobreentrenamiento.</li>
              <li><strong><span aria-hidden="true">❌</span> No actualizar las zonas al mejorar:</strong> Cuando el FTP sube, las zonas anteriores quedan obsoletas. Entrenar con zonas desfasadas significa hacerlo por debajo del estímulo necesario para seguir progresando.</li>
            </ul>
          </div>
        </EducationalSection>

      </main>

      <RelatedApps apps={getRelatedApps('calculadora-potencia-ciclismo')} />
      <ShareCard appName="calculadora-potencia-ciclismo" />
      <Footer appName="calculadora-potencia-ciclismo" />
    </div>
  );
}
