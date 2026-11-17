'use client';
// @disclaimer: exempt

/**
 * Palabras agudas, llanas (graves) y esdrújulas — clasificador con tilde razonada.
 *
 * Toda la ortografía vive en `./motor.ts` (con su spec de casos a mano); aquí solo se pinta.
 * La pieza que distingue esta app de una tabla de reglas es el grupo de botones de sílabas:
 * sin tilde, la tónica solo se puede DEDUCIR suponiendo que la palabra está bien escrita, así
 * que el usuario puede tocar la sílaba que oye más fuerte y la app le dice cómo se escribe.
 */

import { useMemo, useRef, useState } from 'react';
import styles from './PalabrasAgudasLlanasEsdrujulas.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { traerALaVista } from '@/lib';
import { PREGUNTAS_FRECUENTES } from './metadata';
import {
  analizarPalabra,
  analizarTexto,
  MAX_PALABRAS_TEXTO,
  NOMBRE_TIPO,
  NOMBRE_TIPO_PLURAL,
  POSICION_TIPO,
  TIPOS,
  type TipoAcento,
} from './motor';
import CasosAula from './CasosAula';

const EJEMPLOS = ['murciélago', 'camión', 'lápiz', 'arbol', 'maíz', 'dígamelo', 'rápidamente', 'fué'];

const TEXTO_EJEMPLO =
  'El murciélago salió de su árbol al atardecer y voló sobre el camión del jardín. ' +
  'Mañana, cuando cante el colibrí, dormirá tranquilo en su rincón.';

const CLASE_CHIP: Record<TipoAcento, string> = {
  aguda: styles.chipAguda,
  llana: styles.chipLlana,
  esdrujula: styles.chipEsdrujula,
  sobresdrujula: styles.chipSobresdrujula,
  monosilaba: styles.chipMonosilaba,
};

const ABREVIATURA: Record<TipoAcento, string> = {
  aguda: 'ag.',
  llana: 'll.',
  esdrujula: 'esdr.',
  sobresdrujula: 'sobr.',
  monosilaba: 'mon.',
};

const TEXTO_TILDE = { si: 'Sí', no: 'No', depende: 'Depende del sentido' } as const;

type Filtro = TipoAcento | 'todas';

const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function PalabrasAgudasLlanasEsdrujulasPage() {
  const [palabra, setPalabra] = useState('murciélago');
  const [elegido, setElegido] = useState<number | undefined>(undefined);
  const [texto, setTexto] = useState(TEXTO_EJEMPLO);
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const analizadorRef = useRef<HTMLElement>(null);

  const analisis = useMemo(() => analizarPalabra(palabra, elegido), [palabra, elegido]);
  const delTexto = useMemo(() => analizarTexto(texto), [texto]);
  const visibles = useMemo(
    () => (filtro === 'todas' ? delTexto.palabras : delTexto.palabras.filter((p) => p.analisis.tipo === filtro)),
    [delTexto, filtro]
  );

  function cambiarPalabra(nueva: string) {
    setPalabra(nueva);
    setElegido(undefined);
  }

  function analizarDelTexto(p: string) {
    cambiarPalabra(p);
    traerALaVista(analizadorRef.current, analizadorRef.current);
  }

  const hayError = !analisis && palabra.trim() !== '';

  return (
    <>
      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Palabras agudas, llanas (graves) y esdrújulas</h1>
          <p className={styles.subtitle}>
            Escribe una palabra: te dice su sílaba tónica, si es aguda, llana, esdrújula o sobresdrújula,
            si lleva tilde y por qué.
          </p>
        </header>

        <LegalNotice />

        <main className={styles.mainContent}>
          {/* ── Una palabra ─────────────────────────────────────────────────────── */}
          <section
            className={styles.panel}
            ref={analizadorRef}
            aria-labelledby="titulo-analizador"
            tabIndex={-1}
          >
            <h2 className={styles.panelTitle} id="titulo-analizador">
              <span aria-hidden="true">🔎</span> Analiza una palabra
            </h2>

            <label className={styles.label} htmlFor="palabra">
              Palabra
            </label>
            <input
              id="palabra"
              type="text"
              className={styles.inputPalabra}
              value={palabra}
              onChange={(e) => cambiarPalabra(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="Por ejemplo: árbol"
              aria-describedby="palabra-ayuda"
            />
            <p className={styles.ayuda} id="palabra-ayuda">
              Una sola palabra, con sus tildes si las tiene. Se analiza tal como la escribes:
              no comprueba si existe ni corrige más faltas que las de tilde.
            </p>

            <div className={styles.ejemplos} role="group" aria-label="Ejemplos">
              <span className={styles.ejemplosLabel}>Prueba con:</span>
              {EJEMPLOS.map((e) => (
                <button key={e} type="button" className={styles.ejemploBtn} onClick={() => cambiarPalabra(e)}>
                  {e}
                </button>
              ))}
            </div>

            {hayError && (
              <p className={styles.error} role="status">
                Escribe una sola palabra, solo con letras y con alguna vocal.
              </p>
            )}

            {analisis && (
              <div className={styles.resultado}>
                <p className={styles.label} id="silabas-etiqueta">
                  <span>
                    {analisis.tonicaFija
                      ? 'Sílabas (la tónica está fijada)'
                      : 'Sílabas: toca la que suena más fuerte'}
                  </span>
                </p>
                <div className={styles.silabas} role="group" aria-labelledby="silabas-etiqueta">
                  {analisis.silabas.map((s, i) => (
                    <button
                      key={`${analisis.escrita}-${i}`}
                      type="button"
                      className={`${styles.silaba} ${i === analisis.indiceTonica ? styles.silabaTonica : ''}`}
                      aria-pressed={i === analisis.indiceTonica}
                      aria-label={`${s}, sílaba ${i + 1} de ${analisis.silabas.length}`}
                      disabled={analisis.tonicaFija}
                      onClick={() => setElegido(i)}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <p className={styles.nota}>
                  <span>
                    {analisis.tonicaFija
                      ? analisis.adverbioMente
                        ? 'En los adverbios en -mente la voz cae al final en «men», y la tilde del adjetivo se conserva.'
                        : analisis.silabas.length === 1
                          ? 'Una sola sílaba: es la tónica.'
                          : 'La tilde sobre la i o la u marca un hiato y fija la sílaba tónica.'
                      : analisis.tonicaElegida
                        ? 'Has elegido la sílaba tónica: abajo ves cómo se escribe la palabra con ella.'
                        : 'La tónica marcada sale de cómo está escrita. Si al decirla en voz alta suena más fuerte otra sílaba, tócala.'}
                  </span>
                </p>
                {analisis.tonicaElegida && (
                  <button type="button" className={styles.botonSecundario} onClick={() => setElegido(undefined)}>
                    Volver a la tónica de la escritura
                  </button>
                )}

                <div className={styles.tarjetas}>
                  <div className={styles.tarjeta}>
                    <span className={styles.tarjetaEtiqueta}>Tipo</span>
                    <span className={styles.tarjetaValor}>{mayuscula(NOMBRE_TIPO[analisis.tipo])}</span>
                    <span className={styles.tarjetaDetalle}>{`Tónica en ${POSICION_TIPO[analisis.tipo]}`}</span>
                  </div>
                  <div className={styles.tarjeta}>
                    <span className={styles.tarjetaEtiqueta}>¿Lleva tilde?</span>
                    <span className={styles.tarjetaValor}>{TEXTO_TILDE[analisis.tilde]}</span>
                    <span className={styles.tarjetaDetalle}>
                      {analisis.hiato ? 'Por la ley del hiato' : 'Por la regla general'}
                    </span>
                  </div>
                  <div className={`${styles.tarjeta} ${analisis.bienEscrita ? '' : styles.tarjetaCorrige}`}>
                    <span className={styles.tarjetaEtiqueta}>Se escribe</span>
                    <span className={styles.tarjetaValor} lang="es">
                      {analisis.formaCorrecta}
                    </span>
                    <span className={styles.tarjetaDetalle}>
                      {analisis.bienEscrita
                        ? 'Como la escribiste'
                        : analisis.tildeQueSobra
                          ? `Tú escribiste «${analisis.escrita}»: esa tilde no va`
                          : `Tú escribiste «${analisis.escrita}»`}
                    </span>
                  </div>
                </div>

                <p className={styles.regla}>
                  <strong>Por qué:</strong> <span>{analisis.regla}</span>
                </p>

                {analisis.avisos.length > 0 && (
                  <ul className={styles.avisos}>
                    {analisis.avisos.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>

          {/* ── Un texto ────────────────────────────────────────────────────────── */}
          <section className={styles.panel} aria-labelledby="titulo-texto">
            <h2 className={styles.panelTitle} id="titulo-texto">
              <span aria-hidden="true">📄</span> Clasifica las palabras de un texto
            </h2>
            <label className={styles.label} htmlFor="texto">
              Texto
            </label>
            <textarea
              id="texto"
              className={styles.textarea}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={4}
              spellCheck={false}
            />
            <p className={styles.nota}>
              Cada palabra se clasifica por cómo está escrita. La app avisa de las tildes que sobran;
              las que faltan no puede verlas: toca una palabra para analizarla y elegir su sílaba fuerte.
            </p>

            <div className={styles.filtros} role="group" aria-label="Filtrar por tipo">
              <button
                type="button"
                className={`${styles.filtro} ${filtro === 'todas' ? styles.filtroActivo : ''}`}
                aria-pressed={filtro === 'todas'}
                onClick={() => setFiltro('todas')}
              >
                {`Todas (${delTexto.palabras.length})`}
              </button>
              {TIPOS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`${styles.filtro} ${filtro === t ? styles.filtroActivo : ''}`}
                  aria-pressed={filtro === t}
                  onClick={() => setFiltro(t)}
                >
                  {`${NOMBRE_TIPO_PLURAL[t]} (${delTexto.recuento[t]})`}
                </button>
              ))}
            </div>

            <p className={styles.resumenTexto} aria-live="polite">
              <span>
                {delTexto.tildesQueSobran === 0
                  ? 'Ninguna tilde que sobre.'
                  : `Tildes que sobran: ${delTexto.tildesQueSobran}. Están marcadas.`}
              </span>
            </p>

            <ul className={styles.listaPalabras}>
              {visibles.map(({ orden, analisis: a }) => (
                <li key={orden}>
                  {/* La clase condicional solo marca la tilde que sobra.
                      a11y-ok: acción que carga la palabra en el analizador, no conmutador */}
                  <button
                    type="button"
                    className={`${styles.chip} ${CLASE_CHIP[a.tipo]} ${a.tildeQueSobra ? styles.chipSobra : ''}`}
                    onClick={() => analizarDelTexto(a.escrita)}
                    aria-label={`${a.escrita}: ${NOMBRE_TIPO[a.tipo]}${a.tildeQueSobra ? ', la tilde sobra' : ''}. Analizarla`}
                  >
                    <span>{a.escrita}</span>
                    <span className={styles.chipTipo} aria-hidden="true">
                      {ABREVIATURA[a.tipo]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {delTexto.recortado && (
              <p className={styles.nota}>Se analizan las primeras {MAX_PALABRAS_TEXTO} palabras.</p>
            )}
          </section>

          <CasosAula />
        </main>

        <EducationalSection
          icon="📚"
          title="Cómo se clasifican las palabras y cuándo llevan tilde"
          subtitle="Reglas, ejemplos, errores frecuentes y preguntas"
        >
          <section className={styles.guideSection}>
            <h2>Agudas, llanas, esdrújulas y sobresdrújulas</h2>
            <p>
              Toda palabra de más de una sílaba tiene una que se pronuncia con más fuerza: la sílaba
              tónica. Según dónde caiga, contando desde el final, la palabra es aguda, llana (también
              llamada grave), esdrújula o sobresdrújula. La tilde no marca todas las tónicas: solo las
              que no siguen la pronunciación «por defecto» del español, y por eso hay reglas.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th scope="col">Tipo</th>
                    <th scope="col">Sílaba tónica</th>
                    <th scope="col">Lleva tilde cuando…</th>
                    <th scope="col">Con tilde</th>
                    <th scope="col">Sin tilde</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Aguda</td>
                    <td>La última</td>
                    <td>Acaba en vocal, n o s</td>
                    <td>sofá, canción, compás</td>
                    <td>reloj, pared, feliz</td>
                  </tr>
                  <tr>
                    <td>Llana o grave</td>
                    <td>La penúltima</td>
                    <td>NO acaba en vocal, n o s</td>
                    <td>árbol, lápiz, carácter</td>
                    <td>casa, joven, lunes</td>
                  </tr>
                  <tr>
                    <td>Esdrújula</td>
                    <td>La antepenúltima</td>
                    <td>Siempre</td>
                    <td>música, pájaro, teléfono</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td>Sobresdrújula</td>
                    <td>Antes de la antepenúltima</td>
                    <td>Siempre (salvo los adverbios en -mente)</td>
                    <td>dígamelo, cómpratelo</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td>Hiato con i o u tónica</td>
                    <td>La de la i o la u</td>
                    <td>Siempre, diga lo que diga la regla anterior</td>
                    <td>maíz, búho, país, día</td>
                    <td>—</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Hay palabras que se pronuncian distinto según el país, y entonces cambia también la tilde:
              vídeo y video, chófer y chofer, fútbol y futbol, período y periodo. Las dos formas son
              correctas. Por eso esta app deja elegir la sílaba que suena más fuerte: la regla es la
              misma en todas partes, lo que cambia es la pronunciación.
            </p>
          </section>

          <section className={styles.guideSection}>
            <h2>Para quién es útil</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎒</span>
                <h3>Estudiante que repasa</h3>
                <p>
                  Comprueba su clasificación y, sobre todo, el porqué: la terminación que decide la tilde
                  en cada caso.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <span className={styles.escenarioIcon} aria-hidden="true">🧑‍🏫</span>
                <h3>Profesor de Lengua</h3>
                <p>
                  Asigna los casos numerados, que son siempre los mismos, o pega un texto de la lectura
                  de clase para clasificar todas sus palabras.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <span className={styles.escenarioIcon} aria-hidden="true">✍️</span>
                <h3>Quien escribe y duda</h3>
                <p>
                  ¿Carácter o caracter? ¿Fue o fué? Toca la sílaba que oye más fuerte y sale la palabra
                  bien escrita.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <span className={styles.escenarioIcon} aria-hidden="true">🌎</span>
                <h3>Quien aprende español</h3>
                <p>
                  La tilde dice cómo se pronuncia una palabra que no ha oído nunca: aquí ve la sílaba
                  marcada y la regla que la explica.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Paso a paso: clasificar una palabra y decidir su tilde</h2>
            <ol className={styles.stepGuide}>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">1</span>
                <div className={styles.stepContent}>
                  <h3>Sepárala en sílabas</h3>
                  <p>Pa-la-bra, mur-cié-la-go, ca-mión. Cada sílaba lleva al menos una vocal.</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">2</span>
                <div className={styles.stepContent}>
                  <h3>Busca la sílaba tónica</h3>
                  <p>
                    Dila en voz alta como si llamaras a alguien de lejos: la sílaba que se alarga es la
                    tónica. Si lleva tilde, la tilde ya te lo dice.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">3</span>
                <div className={styles.stepContent}>
                  <h3>Cuenta desde el final</h3>
                  <p>Última: aguda. Penúltima: llana. Antepenúltima: esdrújula. Antes: sobresdrújula.</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">4</span>
                <div className={styles.stepContent}>
                  <h3>Mira cómo acaba</h3>
                  <p>
                    Vocal, n o s, o cualquier otra letra. La n y la s detrás de otra consonante cuentan
                    como «otra letra» (robots, bíceps), y la y final, como consonante (rey, póney).
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">5</span>
                <div className={styles.stepContent}>
                  <h3>Aplica la regla</h3>
                  <p>Agudas en vocal, n o s; llanas en lo demás; esdrújulas y sobresdrújulas, siempre.</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">6</span>
                <div className={styles.stepContent}>
                  <h3>Revisa las excepciones</h3>
                  <p>El hiato con i o u tónica, la tilde diacrítica de los monosílabos y los interrogativos.</p>
                </div>
              </li>
            </ol>
          </section>

          <section className={styles.guideSection}>
            <h2>Buenas prácticas</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🗣️</span>
                <p>
                  <strong>Pronuncia antes de escribir.</strong> La regla se aplica sobre cómo suena la
                  palabra, no sobre cómo crees que se escribe.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔁</span>
                <p>
                  <strong>El plural puede cambiar la tilde.</strong> Joven da jóvenes, examen da exámenes
                  y carácter da caracteres: la tónica se queda donde estaba, pero la palabra crece.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔠</span>
                <p>
                  <strong>Las mayúsculas también llevan tilde.</strong> ÁRBOL, Álvaro, MURCIÉLAGO: no
                  hay excepción para las mayúsculas.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🧩</span>
                <p>
                  <strong>Con -mente, mira el adjetivo.</strong> Si el adjetivo lleva tilde (rápido,
                  fácil), el adverbio también (rápidamente, fácilmente).
                </p>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <h2>Errores frecuentes</h2>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>Tildar por si acaso.</strong> Reloj, joven o examen no la llevan: la regla dice
                  cuándo sí, y el resto de las veces no.
                </li>
                <li>
                  <strong>Olvidar el hiato.</strong> Maíz y búho llevan tilde aunque la regla general diga
                  que no.
                </li>
                <li>
                  <strong>Tildar monosílabos.</strong> Fue, dio, vio, ti y guion se escriben sin tilde
                  desde la Ortografía de 2010.
                </li>
                <li>
                  <strong>Contar desde el principio.</strong> La clasificación se hace desde el final:
                  la penúltima de «camino» es «mi», no «ca».
                </li>
                <li>
                  <strong>Olvidar la tilde diacrítica.</strong> «Tú vienes» frente a «tu casa», «¿qué
                  quieres?» frente a «que vengas»: ahí decide el sentido, no la sílaba.
                </li>
              </ul>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Preguntas frecuentes</h2>
            <div className={styles.faqList}>
              {PREGUNTAS_FRECUENTES.map((f) => (
                <div key={f.question} className={styles.faqItem}>
                  <h3>{f.question}</h3>
                  <p>{f.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </EducationalSection>

        <RelatedApps />

        <ShareCard appName="palabras-agudas-llanas-esdrujulas" />

        <Footer appName="palabras-agudas-llanas-esdrujulas" />
      </div>
    </>
  );
}
