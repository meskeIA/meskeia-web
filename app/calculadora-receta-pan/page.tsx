'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
import styles from './CalculadoraRecetaPan.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber, parseSpanishNumber } from '@/lib';
import {
  calcularRecetaPan,
  TIPOS_PAN,
  HARINAS_PAN,
  EXTRAS,
  RITMOS,
  TEMP_REFERENCIA_C,
  type IdTipoPan,
  type IdHarina,
  type TipoFermento,
  type RitmoFermentacion,
  type ExtraElegido,
  type FilaIngrediente,
} from '@/lib/calculadoras/recetaPan';

const PESOS_RAPIDOS = [250, 500, 1000];

const FERMENTOS: { id: TipoFermento; nombre: string; emoji: string; pie: string }[] = [
  { id: 'seca', nombre: 'Levadura seca', emoji: '🥄', pie: 'La del sobrecito' },
  { id: 'fresca', nombre: 'Levadura fresca', emoji: '🧊', pie: 'El taco refrigerado' },
  { id: 'masa_madre', nombre: 'Masa madre', emoji: '🫙', pie: 'Tu fermento natural' },
];

const HIDRATACIONES_MM = [50, 75, 100, 125];

/** Un campo vacío no es un cero: hay que poder borrarlo para escribir otra cosa. */
function leerGramos(valor: string): number {
  if (!valor.trim()) return 0;
  const n = parseSpanishNumber(valor);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export default function CalculadoraRecetaPanPage() {
  const [harinaStr, setHarinaStr] = useState('500');
  const [tipoPan, setTipoPan] = useState<IdTipoPan>('hogaza');
  const [harinaPrincipal, setHarinaPrincipal] = useState<IdHarina>('panificable');
  const [proporcion, setProporcion] = useState(100);
  const [fermento, setFermento] = useState<TipoFermento>('seca');
  const [ritmo, setRitmo] = useState<RitmoFermentacion>('normal');
  const [hidratacionMM, setHidratacionMM] = useState(100);
  const [extras, setExtras] = useState<ExtraElegido[]>([]);
  const [extrasAbierto, setExtrasAbierto] = useState(false);

  const esMasaMadre = fermento === 'masa_madre';

  const resultado = useMemo(
    () =>
      calcularRecetaPan({
        harinaPesada_g: leerGramos(harinaStr),
        tipoPan,
        harinaPrincipal,
        proporcionPrincipal: proporcion,
        fermento,
        ritmo,
        hidratacionMasaMadre: hidratacionMM,
        extras,
      }),
    [harinaStr, tipoPan, harinaPrincipal, proporcion, fermento, ritmo, hidratacionMM, extras],
  );

  // Al pasar a masa madre, el ritmo «lo antes posible» deja de existir. Si era el elegido, hay
  // que moverlo aquí: dejarlo puesto pero deshabilitado dejaba los cuatro botones sin ninguno
  // marcado, y el usuario veía una receta calculada con un ritmo que la pantalla no señalaba.
  const cambiarFermento = useCallback((nuevo: TipoFermento) => {
    setFermento(nuevo);
    if (nuevo === 'masa_madre') {
      setRitmo((actual) => (RITMOS.find((r) => r.id === actual)?.admiteMasaMadre ? actual : 'normal'));
    }
  }, []);

  const alternarExtra = useCallback((id: string, sugerido: number) => {
    setExtras((prev) =>
      prev.some((e) => e.id === id)
        ? prev.filter((e) => e.id !== id)
        : [...prev, { id, porcentaje: sugerido }],
    );
  }, []);

  const cambiarPorcentajeExtra = useCallback((id: string, porcentaje: number) => {
    setExtras((prev) => prev.map((e) => (e.id === id ? { ...e, porcentaje } : e)));
  }, []);

  const harinaSeleccionada = HARINAS_PAN.find((h) => h.id === harinaPrincipal)!;
  const panSeleccionado = TIPOS_PAN.find((t) => t.id === tipoPan)!;
  const esMezclable = harinaPrincipal !== 'panificable';

  const filaGramos = (fila: FilaIngrediente) => formatNumber(fila.gramos, fila.gramos < 10 ? 1 : 0);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">🍞</span> Calculadora de pan casero
        </h1>
        <p className={styles.subtitle}>
          Dinos cuánta harina vas a pesar, qué pan quieres y con qué fermento, y te damos los
          gramos de cada ingrediente. Sin necesidad de saberte ninguna fórmula.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.mainContent}>
        {/* ── Paso 1: la harina ── */}
        <section className={styles.panel} aria-labelledby="paso-harina">
          <h2 id="paso-harina" className={styles.seccionTitulo}>
            <span className={styles.pasoNum} aria-hidden="true">1</span> ¿Cuánta harina vas a pesar?
          </h2>
          <div className={styles.harinaFila}>
            <div className={styles.inputWrap}>
              <input
                id="harina-g"
                type="text"
                inputMode="decimal"
                className={styles.inputGrande}
                value={harinaStr}
                onChange={(e) => setHarinaStr(e.target.value)}
                aria-label="Gramos de harina que vas a pesar"
                placeholder="500"
              />
              <span className={styles.unidad}>g</span>
            </div>
            <div className={styles.rapidos} role="group" aria-label="Cantidades habituales">
              {PESOS_RAPIDOS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`${styles.chip} ${leerGramos(harinaStr) === p ? styles.chipActivo : ''}`}
                  aria-pressed={leerGramos(harinaStr) === p}
                  onClick={() => setHarinaStr(String(p))}
                >
                  {formatNumber(p, 0)} g
                </button>
              ))}
            </div>
          </div>
          <p className={styles.ayuda}>
            Es la harina que sacas del paquete y pones en la báscula. Si usas masa madre, la que
            va dentro del fermento la contamos nosotros.
          </p>
        </section>

        {/* ── Paso 2: el pan ── */}
        <section className={styles.panel} aria-labelledby="paso-pan">
          <h2 id="paso-pan" className={styles.seccionTitulo}>
            <span className={styles.pasoNum} aria-hidden="true">2</span> ¿Qué pan quieres hacer?
          </h2>
          <div className={styles.panesGrid} role="group" aria-label="Tipo de pan">
            {TIPOS_PAN.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`${styles.panBtn} ${tipoPan === t.id ? styles.panBtnActivo : ''}`}
                aria-pressed={tipoPan === t.id}
                onClick={() => setTipoPan(t.id)}
              >
                <span className={styles.panEmoji} aria-hidden="true">{t.emoji}</span>
                <span className={styles.panNombre}>{t.nombre}</span>
                <span className={styles.panAlias}>{t.alias}</span>
              </button>
            ))}
          </div>
          <p className={styles.ayuda}>{panSeleccionado.descripcion}</p>
        </section>

        {/* ── Paso 3: la harina ── */}
        <section className={styles.panel} aria-labelledby="paso-tipo-harina">
          <h2 id="paso-tipo-harina" className={styles.seccionTitulo}>
            <span className={styles.pasoNum} aria-hidden="true">3</span> ¿Con qué harina?
          </h2>
          <div className={styles.campo}>
            <label htmlFor="tipo-harina" className={styles.etiqueta}>Tipo de harina</label>
            <select
              id="tipo-harina"
              className={styles.select}
              value={harinaPrincipal}
              onChange={(e) => setHarinaPrincipal(e.target.value as IdHarina)}
            >
              {HARINAS_PAN.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.nombre} ({h.alias})
                </option>
              ))}
            </select>
            <p className={styles.ayuda}>{harinaSeleccionada.nota}</p>
          </div>

          {esMezclable && (
            <div className={styles.campo}>
              <label htmlFor="proporcion" className={styles.etiqueta}>
                ¿Qué parte del total es {harinaSeleccionada.nombre.toLowerCase()}?{' '}
                <strong className={styles.valorSlider}>{formatNumber(proporcion, 0)} %</strong>
              </label>
              <input
                id="proporcion"
                type="range"
                min={10}
                max={100}
                step={5}
                value={proporcion}
                className={styles.slider}
                onChange={(e) => setProporcion(Number(e.target.value))}
              />
              <p className={styles.ayuda}>
                El resto será trigo panificable. Lo recomendable con esta harina es no pasar del{' '}
                {formatNumber(harinaSeleccionada.maxRecomendado, 0)} %: es donde la masa deja de
                comportarse como el pan que has elegido.
              </p>
            </div>
          )}
        </section>

        {/* ── Paso 4: fermento y tiempo ── */}
        <section className={styles.panel} aria-labelledby="paso-fermento">
          <h2 id="paso-fermento" className={styles.seccionTitulo}>
            <span className={styles.pasoNum} aria-hidden="true">4</span> ¿Con qué lo fermentas y cuánto tiempo tienes?
          </h2>

          <div className={styles.fermentosGrid} role="group" aria-label="Tipo de fermento">
            {FERMENTOS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`${styles.fermentoBtn} ${fermento === f.id ? styles.fermentoBtnActivo : ''}`}
                aria-pressed={fermento === f.id}
                onClick={() => cambiarFermento(f.id)}
              >
                <span className={styles.fermentoEmoji} aria-hidden="true">{f.emoji}</span>
                <span className={styles.fermentoNombre}>{f.nombre}</span>
                <span className={styles.fermentoPie}>{f.pie}</span>
              </button>
            ))}
          </div>

          {esMasaMadre && (
            <div className={styles.campo}>
              <span className={styles.etiqueta} id="etq-hid-mm">
                Hidratación de tu masa madre
              </span>
              <div className={styles.rapidos} role="group" aria-labelledby="etq-hid-mm">
                {HIDRATACIONES_MM.map((h) => (
                  <button
                    key={h}
                    type="button"
                    className={`${styles.chip} ${hidratacionMM === h ? styles.chipActivo : ''}`}
                    aria-pressed={hidratacionMM === h}
                    onClick={() => setHidratacionMM(h)}
                  >
                    {formatNumber(h, 0)} %
                  </button>
                ))}
              </div>
              <p className={styles.ayuda}>
                Si la refrescas con la misma harina que agua, es del 100 %. Una madre firme va al
                50 %. Cambiarla altera los gramos de masa madre, pero no la fermentación: lo que
                manda es la harina que lleva dentro, y esa se mantiene.
              </p>
            </div>
          )}

          <div className={styles.campo}>
            <span className={styles.etiqueta} id="etq-ritmo">¿Para cuándo lo quieres?</span>
            <div className={styles.ritmosFila} role="group" aria-labelledby="etq-ritmo">
              {RITMOS.map((r) => {
                const vetado = esMasaMadre && !r.admiteMasaMadre;
                return (
                  <button
                    key={r.id}
                    type="button"
                    className={`${styles.ritmoBtn} ${ritmo === r.id && !vetado ? styles.ritmoBtnActivo : ''} ${vetado ? styles.ritmoBtnVetado : ''}`}
                    aria-pressed={ritmo === r.id && !vetado}
                    disabled={vetado}
                    onClick={() => setRitmo(r.id)}
                  >
                    <span className={styles.ritmoNombre}>{r.nombre}</span>
                    <span className={styles.ritmoPie}>
                      {vetado ? 'No con masa madre' : (esMasaMadre && r.tiempoMasaMadre ? r.tiempoMasaMadre : r.tiempo)}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className={styles.ayuda}>
              Los tiempos están medidos a {formatNumber(TEMP_REFERENCIA_C, 0)} °C. Cuanto menos
              fermento y más tiempo, más sabor tiene el pan.
            </p>
          </div>
        </section>

        {/* ── Paso 5: extras ── */}
        <section className={styles.panel} aria-labelledby="paso-extras">
          <h2 id="paso-extras" className={styles.seccionTitulo}>
            <span className={styles.pasoNum} aria-hidden="true">5</span> ¿Le pones algo más? <span className={styles.opcional}>(opcional)</span>
          </h2>
          <button
            id="toggle-extras"
            type="button"
            className={styles.desplegable}
            aria-expanded={extrasAbierto}
            onClick={() => setExtrasAbierto((v) => !v)}
          >
            {extrasAbierto ? 'Ocultar ingredientes' : 'Añadir miel, frutos secos, semillas…'}
            {extras.length > 0 && (
              <span className={styles.contador}>{formatNumber(extras.length, 0)}</span>
            )}
          </button>

          {extrasAbierto && (
            <div className={styles.extrasPanel}>
              <p className={styles.ayuda}>
                La cantidad la decides tú: lo que hacemos es decirte qué le pasa a tu masa cuando
                lo añades. Hay tres comportamientos distintos, y solo uno no cambia nada.
              </p>
              {(['liquido', 'remojo', 'seco'] as const).map((familia) => (
                <div key={familia} className={styles.familiaBloque}>
                  <h3 className={styles.familiaTitulo}>
                    {familia === 'liquido' && 'Traen agua, azúcar o grasa dentro → corrigen la fórmula'}
                    {familia === 'remojo' && 'Piden su propia agua → se remojan aparte'}
                    {familia === 'seco' && 'No tocan nada → solo se suman al peso'}
                  </h3>
                  <div className={styles.extrasGrid}>
                    {EXTRAS.filter((e) => e.familia === familia).map((e) => {
                      const elegido = extras.find((x) => x.id === e.id);
                      return (
                        <div key={e.id} className={styles.extraItem}>
                          <button
                            type="button"
                            className={`${styles.extraBtn} ${elegido ? styles.extraBtnActivo : ''}`}
                            aria-pressed={Boolean(elegido)}
                            onClick={() => alternarExtra(e.id, e.sugerido)}
                          >
                            <span className={styles.extraEmoji} aria-hidden="true">{e.emoji}</span>
                            <span>{e.nombre}</span>
                          </button>
                          {elegido && (
                            <div className={styles.extraControl}>
                              <label htmlFor={`pct-${e.id}`} className={styles.extraPctEtiqueta}>
                                {formatNumber(elegido.porcentaje, 0)} % de la harina
                              </label>
                              <input
                                id={`pct-${e.id}`}
                                type="range"
                                min={1}
                                max={e.familia === 'liquido' ? 60 : 40}
                                step={1}
                                value={elegido.porcentaje}
                                className={styles.sliderPequeno}
                                onChange={(ev) => cambiarPorcentajeExtra(e.id, Number(ev.target.value))}
                              />
                              <p className={styles.extraNota}>{e.nota}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Resultado ── */}
        {resultado ? (
          <section className={styles.resultado} aria-live="polite" aria-labelledby="titulo-resultado">
            <h2 id="titulo-resultado" className={styles.resultadoTitulo}>
              <span aria-hidden="true">{panSeleccionado.emoji}</span> Tu {panSeleccionado.nombre.toLowerCase()}
            </h2>

            <div className={styles.resumenFila}>
              <div className={styles.resumenDato}>
                <span className={styles.resumenValor}>{formatNumber(resultado.pesoMasa_g, 0)} g</span>
                <span className={styles.resumenEtiqueta}>de masa en total</span>
              </div>
              <div className={styles.resumenDato}>
                <span className={styles.resumenValor}>
                  {formatNumber(resultado.piezas.cantidad, 0)} × {formatNumber(resultado.piezas.peso_g, 0)} g
                </span>
                <span className={styles.resumenEtiqueta}>piezas orientativas</span>
              </div>
              <div className={styles.resumenDato}>
                <span className={styles.resumenValor}>{formatNumber(resultado.hidratacion_pct, 0)} %</span>
                <span className={styles.resumenEtiqueta}>de hidratación</span>
              </div>
            </div>

            <div className={styles.listaCompra}>
              <h3 className={styles.listaTitulo}>Lo que tienes que pesar</h3>
              <table className={styles.tablaIngredientes}>
                <caption className={styles.tablaCaption}>
                  Ingredientes de la receta, con su peso en gramos y su porcentaje sobre la harina
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Ingrediente</th>
                    <th scope="col" className={styles.colNum}>Gramos</th>
                    <th scope="col" className={styles.colNum}>% harina</th>
                  </tr>
                </thead>
                <tbody>
                  {[...resultado.harinas, ...resultado.ingredientes, ...resultado.extras].map((fila, i) => (
                    <tr key={`${fila.nombre}-${i}`}>
                      <td>
                        <strong>{fila.nombre}</strong>
                        {fila.nota && <span className={styles.filaNota}>{fila.nota}</span>}
                      </td>
                      <td className={styles.colNum}>
                        <strong>{filaGramos(fila)} g</strong>
                      </td>
                      <td className={styles.colNum}>{formatNumber(fila.porcentaje, 1)} %</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {resultado.aguaRemojo_g > 0 && (
                <p className={styles.aguaRemojo}>
                  <span aria-hidden="true">💧</span> Y aparte,{' '}
                  <strong>{formatNumber(resultado.aguaRemojo_g, 0)} g de agua</strong> para el
                  remojo, que no forman parte de la masa.
                </p>
              )}
            </div>

            <div className={styles.tiempoBloque}>
              <span className={styles.tiempoIcono} aria-hidden="true">⏱️</span>
              <div>
                <strong className={styles.tiempoTitulo}>Cuánto va a tardar</strong>
                <p className={styles.tiempoTexto}>
                  {resultado.tiempo}, a {formatNumber(TEMP_REFERENCIA_C, 0)} °C. Si tu cocina está
                  más fría, se alarga; si está más caliente, se acorta.
                </p>
              </div>
            </div>

            {resultado.avisos.length > 0 && (
              <div className={styles.avisos} role="note">
                <h3 className={styles.avisosTitulo}>
                  <span aria-hidden="true">⚠️</span> Antes de amasar
                </h3>
                <ul className={styles.avisosLista}>
                  {resultado.avisos.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className={styles.consejo}>
              <span aria-hidden="true">💡</span> {resultado.consejo}
            </p>

            {esMasaMadre && (
              <p className={styles.notaFormula}>
                La fórmula se calcula sobre{' '}
                <strong>{formatNumber(resultado.harinaTotal_g, 0)} g de harina total</strong>,
                porque los {formatNumber(resultado.fermento.harinaEnFermento_g, 0)} g que van dentro
                de la masa madre también son harina de esta receta. Tú solo pesas los{' '}
                {formatNumber(resultado.harinaPesada_g, 0)} g que pediste.
              </p>
            )}
          </section>
        ) : (
          <section className={styles.sinResultado} role="status">
            <p>Escribe cuántos gramos de harina vas a usar y te calculamos el resto.</p>
          </section>
        )}
      </main>

      <EducationalSection
        title="Cómo se construye una receta de pan"
        subtitle="Las cuatro decisiones que determinan cómo sale, y por qué el orden importa"
      >
        <div className={styles.educationalContent}>
          <h2>La harina manda, y todo lo demás se mide contra ella</h2>
          <p>
            En panadería nada se mide en tazas ni en cucharadas: todo se expresa como un
            porcentaje del peso de la harina, que siempre es el 100 %. Un pan al 70 % de
            hidratación lleva 700 g de agua por kilo de harina, tanto si haces una hogaza como
            veinte. Ese sistema —el porcentaje del panadero— es lo que permite que una receta
            funcione igual en una cocina que en un obrador, y es lo que esta calculadora
            construye por ti a partir de lo único que sabes de entrada: cuánta harina vas a pesar.
          </p>
          <p>
            La diferencia entre un pan y otro está casi toda en cuatro números: cuánta agua lleva,
            cuánta sal, cuánto fermento y cuánto tiempo se le da. La harina que elijas corrige el
            primero, el tiempo disponible determina el tercero, y el segundo es prácticamente
            siempre el mismo 2 %.
          </p>

          <h2>Cuánta agua lleva cada pan</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <caption>Hidratación de partida de cada tipo de pan, antes de corregir por la harina</caption>
              <thead>
                <tr>
                  <th scope="col">Pan</th>
                  <th scope="col">Agua sobre harina</th>
                  <th scope="col">Cómo se trabaja</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Pan dulce enriquecido</td><td>55 %</td><td>Masa firme; el líquido viene sobre todo del huevo y la leche</td></tr>
                <tr><td>Bollos y panecillos</td><td>58 %</td><td>Se amasa a mano sin dificultad</td></tr>
                <tr><td>Pan de molde</td><td>62 %</td><td>Dócil, se bolea y se mete en el molde</td></tr>
                <tr><td>Barra o baguette</td><td>66 %</td><td>Se amasa sobre la mesa, ligeramente pegajosa</td></tr>
                <tr><td>Hogaza rústica</td><td>72 %</td><td>Plegados en el bol en vez de amasado</td></tr>
                <tr><td>Chapata</td><td>78 %</td><td>No se amasa ni se bolea: se pliega y se corta</td></tr>
                <tr><td>Focaccia</td><td>80 %</td><td>Casi se vierte; se extiende con los dedos en la bandeja</td></tr>
              </tbody>
            </table>
          </div>
          <p>
            Sobre esa cifra, la harina corrige: la integral pide unos 6 puntos más y el centeno
            hasta 8, porque el salvado y las pentosanas retienen mucha agua. La espelta va al
            revés, 4 puntos menos, y además tiene el gluten más frágil. Por eso la misma hogaza
            al 72 % se convierte en 78 % si la haces integral y en 68 % si la haces de espelta.
          </p>

          <h2>Cuatro cocinas, cuatro recetas del mismo pan</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h3><span aria-hidden="true">🌅</span> Quiero pan para la cena</h3>
              <p>
                Son cinco o seis horas de margen. Levadura seca al 0,7 % —unos 3,5 g por medio
                kilo de harina— y una hogaza rústica. La masa madre aquí va justa: puede hacerse,
                pero conviene tenerla recién refrescada y muy activa.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h3><span aria-hidden="true">🌙</span> Amaso hoy y horneo mañana</h3>
              <p>
                El mejor pan con menos trabajo. Baja la dosis de fermento al mínimo, deja una
                hora fuera y mete la masa en la nevera hasta 24 horas. El frío alarga la
                fermentación y desarrolla el sabor; además, la masa fría se maneja mucho mejor.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h3><span aria-hidden="true">🌾</span> Quiero un pan más integral</h3>
              <p>
                Empieza mezclando: un 30-40 % de integral sobre panificable da sabor y fibra sin
                perder volumen. Súbele agua, porque el salvado la absorbe, y dale un reposo de
                media hora antes de añadir la sal para que la harina se hidrate del todo.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h3><span aria-hidden="true">🎉</span> Un pan dulce para una fecha</h3>
              <p>
                Roscón, pan de muerto o brioche piden harina de fuerza, mucha mantequilla y
                paciencia: el azúcar y la grasa frenan la levadura, así que estos panes fermentan
                bastante más despacio que uno salado con la misma dosis de fermento.
              </p>
            </div>
          </div>

          <h2>Del ingrediente a la masa, paso a paso</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <h3>Pesa la harina y mézclala con el agua</h3>
                <p>
                  Sin sal y sin fermento todavía. Deja reposar entre 20 y 40 minutos: la harina se
                  hidrata sola y el gluten empieza a formarse sin que amases. Es el paso que más
                  trabajo ahorra y el que más gente se salta.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <h3>Añade el fermento y, un poco después, la sal</h3>
                <p>
                  La sal no debe tocar directamente la levadura fresca, porque la deshidrata. Si
                  usas masa madre, incorpórala cuando esté en su punto más alto, justo antes de
                  que empiece a bajar.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <h3>Amasa o pliega, según lo húmeda que esté</h3>
                <p>
                  Hasta el 68 % se amasa sobre la mesa. Por encima, se trabaja con plegados dentro
                  del bol cada 30 minutos: tres o cuatro tandas bastan para que la masa pase de
                  sopa a tener cuerpo.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <h3>La grasa y las inclusiones, al final</h3>
                <p>
                  Mantequilla, aceite, frutos secos, semillas remojadas o chocolate entran cuando
                  la masa ya tiene gluten formado. Si entran al principio, engrasan la harina e
                  impiden que las hebras de gluten se unan.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <h3>Fermenta mirando la masa, no el reloj</h3>
                <p>
                  Los tiempos son a 24 °C. La levadura casi dobla su velocidad por cada 10 °C de
                  más, así que en verano puede ir al doble y en una cocina fría, a la mitad. La
                  masa está lista cuando ha crecido visiblemente y al presionarla vuelve despacio.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">6</span>
              <div className={styles.stepContent}>
                <h3>Hornea fuerte y con vapor al principio</h3>
                <p>
                  240 °C los primeros 15 minutos con una fuente de vapor —una bandeja con agua
                  hirviendo abajo, o la masa tapada con una olla—, y después baja a 200-210 °C sin
                  vapor para que la corteza se seque y quede crujiente.
                </p>
              </div>
            </div>
          </div>

          <h2>Lo que marca la diferencia</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
              <h3>Pesa, no midas en volumen</h3>
              <p>
                Una taza de harina puede variar 30 g según cómo se llene, y eso es un 6 % de
                hidratación de diferencia en una receta de medio kilo. Una báscula de cocina es
                la mejor inversión posible en panadería.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🕐</span>
              <h3>Menos fermento, más tiempo</h3>
              <p>
                El sabor del pan se hace durante la fermentación. Bajar la levadura a la mitad y
                doblar el tiempo no cuesta más trabajo y da un pan incomparablemente mejor y más
                digestivo.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
              <h3>Controla la temperatura del agua</h3>
              <p>
                Es la única variable de la masa que puedes fijar tú. En verano, agua fría; en
                invierno, templada. Apuntar a 24 °C de masa final hace que los tiempos de la
                receta se cumplan de verdad.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧂</span>
              <h3>No bajes la sal por debajo del 1,5 %</h3>
              <p>
                Además del sabor, la sal aprieta el gluten y regula la fermentación. Un pan sin
                sal suficiente queda soso, flojo y se pasa de fermentación antes de que te des
                cuenta.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🥣</span>
              <h3>Empieza mezclando harinas</h3>
              <p>
                El 100 % de una harina especial casi nunca es el mejor pan. Un 30-50 % de
                espelta, integral o centeno sobre panificable da su sabor conservando la
                estructura.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✂️</span>
              <h3>Deja que se enfríe antes de cortarlo</h3>
              <p>
                El pan sigue cociéndose por dentro al salir del horno. Cortarlo caliente apelmaza
                la miga. Dos horas sobre una rejilla, y en los panes de centeno, mejor al día
                siguiente.
              </p>
            </div>
          </div>

          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h3>¿Cuánta levadura hace falta para 500 gramos de harina?</h3>
              <p>
                Depende del tiempo, no solo del peso. Para un pan de tarde son unos 3,5 g de
                levadura seca o 10,5 g de fresca; si lo quieres en dos horas, el doble; y si lo
                dejas de un día para otro en la nevera, con 1 g de seca sobra.
              </p>
              <p className={styles.faqTip}>
                Regla práctica: la levadura fresca es el triple que la seca, siempre.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cuántos gramos de masa madre por kilo de harina?</h3>
              <p>
                Entre 20 y 250 g según el tiempo de que dispongas. Lo que gobierna la
                fermentación no son los gramos de masa madre, sino la harina que lleva dentro: por
                eso, si tu fermento está más o menos hidratado que el de la receta, cambian los
                gramos pero no el ritmo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Por qué la calculadora suma harina cuando elijo masa madre?</h3>
              <p>
                Porque la masa madre es harina y agua ya mezcladas, y las dos mitades cuentan en
                la fórmula. Si no se contasen, la hidratación real del pan saldría más alta que la
                prometida. Tú sigues pesando exactamente los gramos de harina que pediste; lo que
                cambia es la base sobre la que se calculan los porcentajes.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Puedo hacer pan de masa madre en dos horas?</h3>
              <p>
                No. Subir la dosis no lo arregla: la masa madre tiene menos células de levadura
                por gramo que la levadura comercial y además compite con las bacterias lácticas
                que le dan el sabor. Su fermentación más corta razonable son cinco o seis horas
                con un fermento muy activo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Se puede hacer pan solo con espelta o solo con centeno?</h3>
              <p>
                Con espelta sí, aceptando menos volumen y vigilando la fermentación, que se pasa
                antes. Con centeno al 100 % sale un pan denso y compacto —el tipo nórdico o
                alemán—, que es delicioso pero no se parece a una hogaza de trigo, y ahí la masa
                madre no es opcional.
              </p>
              <p className={styles.faqTip}>
                Si es tu primera vez con estas harinas, empieza por un 30 % y sube desde ahí.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cuánta miel o azúcar puedo añadir?</h3>
              <p>
                Hasta un 10 % sobre la harina, el azúcar acelera la fermentación porque alimenta a
                la levadura. Por encima la frena, porque le quita agua por ósmosis; y por encima
                del 20 % conviene contar con una fermentación bastante más larga. La miel, además,
                es casi un 20 % de agua, que hay que descontar del agua de la receta.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Por qué hay que remojar las semillas y las pasas?</h3>
              <p>
                Porque secas absorben agua, y la única que tienen a mano es la de la masa. El
                resultado es un pan más seco de lo que indica la fórmula y que se endurece antes.
                Media hora de remojo y un buen escurrido lo resuelven.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿En cuántas piezas debería dividir la masa?</h3>
              <p>
                La sugerencia que ves es orientativa y sale del peso típico de cada formato: 300 g
                una barra, 900 g una hogaza, 80 g un panecillo. Puedes dividirla como quieras
                teniendo en cuenta que las piezas pequeñas se hornean menos tiempo y a temperatura
                algo más baja.
              </p>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>Los errores que más panes estropean</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Añadir harina porque la masa se pega.</strong> A partir del 70 % se pega,
                y eso es normal. Cada puñado de harina extra baja la hidratación real y acerca el
                pan a un ladrillo. Mójate las manos en vez de enharinarlas.
              </li>
              <li>
                <strong>Medir en tazas o a ojo.</strong> Es la causa número uno de resultados que
                no se parecen entre dos días seguidos. Los gramos no mienten.
              </li>
              <li>
                <strong>Poner sal sobre la levadura fresca.</strong> El contacto directo la
                deshidrata. Van en momentos distintos, o al menos en lados distintos del bol.
              </li>
              <li>
                <strong>Fermentar por reloj y no por aspecto.</strong> Los tiempos son a 24 °C. En
                agosto la masa puede estar lista en la mitad de tiempo y pasarse sin que nadie la
                mire.
              </li>
              <li>
                <strong>Meter la mantequilla al principio de un pan enriquecido.</strong> La grasa
                envuelve la harina e impide que se forme el gluten. Primero la masa, después la
                grasa, poco a poco.
              </li>
              <li>
                <strong>Hornear sin vapor.</strong> Sin humedad los primeros minutos, la corteza
                se forma antes de que el pan haya acabado de subir, y se queda pequeño y con la
                corteza gruesa.
              </li>
            </ul>
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-receta-pan')} />
      <ShareCard appName="calculadora-receta-pan" />
      <Footer appName="calculadora-receta-pan" />
    </div>
  );
}
