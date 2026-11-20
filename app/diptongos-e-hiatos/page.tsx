'use client';
// @disclaimer: exempt

/**
 * Diptongos, triptongos e hiatos — detector con la regla de cada encuentro.
 *
 * Toda la ortografía vive en `./motor.ts` (con su spec de casos a mano), que a su vez toma el
 * silabeo de `contador-silabas`; aquí solo se pinta. Lo que distingue esta app de un apunte es
 * que analiza las palabras de quien la usa: marca dentro de la palabra cada encuentro de
 * vocales, le pone nombre y dice qué regla lo decide.
 */

import { useMemo, useRef, useState } from 'react';
import styles from './DiptongosHiatos.module.css';
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
  FAMILIAS,
  MAX_PALABRAS_TEXTO,
  NOMBRE_FAMILIA,
  NOMBRE_TIPO,
  TIPOS,
  type Encuentro,
  type Familia,
  type TipoEncuentro,
} from './motor';
import CasosAula from './CasosAula';

const EJEMPLOS = ['cielo', 'aire', 'ciudad', 'buey', 'país', 'poeta', 'búho', 'ahumado', 'pingüino', 'guion'];

const TEXTO_EJEMPLO =
  'El poeta miraba el cielo desde su ventana. Un búho voló sobre el río y se posó en el viejo ' +
  'baúl del jardín, junto a la fuente, mientras un buey pastaba tranquilo.';

const CLASE_FAMILIA_CHIP: Record<Familia, string> = {
  diptongo: styles.chipDiptongo,
  triptongo: styles.chipTriptongo,
  hiato: styles.chipHiato,
};

const CLASE_FAMILIA_TARJETA: Record<Familia, string> = {
  diptongo: styles.encuentroDiptongo,
  triptongo: styles.encuentroTriptongo,
  hiato: styles.encuentroHiato,
};

const ABREVIATURA: Record<Familia, string> = {
  diptongo: 'dipt.',
  triptongo: 'tript.',
  hiato: 'hiato',
};

const PLURAL_FAMILIA: Record<Familia, string> = {
  diptongo: 'Diptongos',
  triptongo: 'Triptongos',
  hiato: 'Hiatos',
};

const PLURAL_TIPO: Record<TipoEncuentro, string> = {
  'diptongo-creciente': 'diptongos crecientes',
  'diptongo-decreciente': 'diptongos decrecientes',
  'diptongo-homogeneo': 'diptongos homogéneos',
  triptongo: 'triptongos',
  'hiato-simple': 'hiatos simples',
  'hiato-acentual': 'hiatos acentuales',
};

type Filtro = Familia | 'todas';

const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

interface Trozo {
  texto: string;
  marcado: boolean;
}

/** Parte la palabra en trozos marcados y sin marcar. Los rangos que se solapan se funden. */
function trozos(palabra: string, rangos: { desde: number; hasta: number }[]): Trozo[] {
  const ordenados = [...rangos].sort((a, b) => a.desde - b.desde);
  const fundidos: { desde: number; hasta: number }[] = [];
  for (const r of ordenados) {
    const ultimo = fundidos[fundidos.length - 1];
    if (ultimo && r.desde <= ultimo.hasta) ultimo.hasta = Math.max(ultimo.hasta, r.hasta);
    else fundidos.push({ ...r });
  }
  const salida: Trozo[] = [];
  let cursor = 0;
  for (const r of fundidos) {
    if (r.desde > cursor) salida.push({ texto: palabra.slice(cursor, r.desde), marcado: false });
    salida.push({ texto: palabra.slice(r.desde, r.hasta), marcado: true });
    cursor = r.hasta;
  }
  if (cursor < palabra.length) salida.push({ texto: palabra.slice(cursor), marcado: false });
  return salida;
}

function PalabraMarcada({ palabra, rangos }: { palabra: string; rangos: Encuentro[] }) {
  return (
    <>
      {trozos(palabra, rangos).map((t, i) =>
        t.marcado ? (
          <mark key={i} className={styles.marca}>
            {t.texto}
          </mark>
        ) : (
          <span key={i}>{t.texto}</span>
        )
      )}
    </>
  );
}

function cuentaEncuentros(porTipo: Record<TipoEncuentro, number>): string {
  const partes = TIPOS.filter((t) => porTipo[t] > 0).map((t) =>
    porTipo[t] === 1 ? `1 ${NOMBRE_TIPO[t]}` : `${porTipo[t]} ${PLURAL_TIPO[t]}`
  );
  if (partes.length === 0) return 'Ninguna palabra con vocales en contacto.';
  return `Encontrados: ${partes.join(', ')}.`;
}

export default function DiptongosHiatosPage() {
  const [palabra, setPalabra] = useState('ciudad');
  const [texto, setTexto] = useState(TEXTO_EJEMPLO);
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const analizadorRef = useRef<HTMLElement>(null);

  const analisis = useMemo(() => analizarPalabra(palabra), [palabra]);
  const delTexto = useMemo(() => analizarTexto(texto), [texto]);
  const visibles = useMemo(
    () => (filtro === 'todas' ? delTexto.palabras : delTexto.palabras.filter((p) => p.familias.includes(filtro))),
    [delTexto, filtro]
  );

  function analizarDelTexto(p: string) {
    setPalabra(p);
    traerALaVista(analizadorRef.current, analizadorRef.current);
  }

  const hayError = !analisis && palabra.trim() !== '';
  const porFamilia = (f: Familia) => analisis?.encuentros.filter((e) => e.familia === f).length ?? 0;

  return (
    <>
      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Diptongos, triptongos e hiatos</h1>
          <p className={styles.subtitle}>
            Escribe una palabra o pega un texto: te marca cada diptongo, triptongo e hiato, te dice de
            qué tipo es y qué regla de vocales abiertas y cerradas lo decide.
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
              onChange={(e) => setPalabra(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="Por ejemplo: ciudad"
              aria-describedby="palabra-ayuda"
            />
            <p className={styles.ayuda} id="palabra-ayuda">
              Una sola palabra, con sus tildes: la tilde decide si dos vocales van juntas o separadas
              (dia, una sílaba; día, dos). No comprueba si la palabra existe.
            </p>

            <div className={styles.ejemplos} role="group" aria-label="Ejemplos">
              <span className={styles.ejemplosLabel}>Prueba con:</span>
              {EJEMPLOS.map((e) => (
                <button key={e} type="button" className={styles.ejemploBtn} onClick={() => setPalabra(e)}>
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
                <p className={styles.palabraGrande} lang="es">
                  <PalabraMarcada palabra={analisis.escrita} rangos={analisis.encuentros} />
                </p>

                <p className={styles.label} id="silabas-etiqueta">
                  <span>{`Sílabas (${analisis.silabas.length})`}</span>
                </p>
                <ul className={styles.silabas} aria-labelledby="silabas-etiqueta">
                  {analisis.silabas.map((s, i) => (
                    <li key={`${analisis.escrita}-${i}`} className={styles.silaba}>
                      {s}
                    </li>
                  ))}
                </ul>

                <div className={styles.tarjetas}>
                  {FAMILIAS.map((f) => (
                    <div key={f} className={styles.tarjeta}>
                      <span className={styles.tarjetaEtiqueta}>{PLURAL_FAMILIA[f]}</span>
                      <span className={styles.tarjetaValor}>{porFamilia(f)}</span>
                    </div>
                  ))}
                </div>

                {analisis.encuentros.length === 0 ? (
                  <p className={styles.sinEncuentros} key="sin">
                    <span>
                      No hay vocales en contacto: ni diptongo, ni triptongo, ni hiato. Cada vocal va en
                      su propia sílaba.
                    </span>
                  </p>
                ) : (
                  <ul className={styles.encuentros} key="con">
                    {analisis.encuentros.map((e) => (
                      <li key={`${e.desde}-${e.tipo}`} className={`${styles.encuentro} ${CLASE_FAMILIA_TARJETA[e.familia]}`}>
                        <div className={styles.encuentroCabecera}>
                          <h3 className={styles.encuentroTipo}>{mayuscula(NOMBRE_TIPO[e.tipo])}</h3>
                          <span className={styles.encuentroPalabra} lang="es">
                            <PalabraMarcada palabra={analisis.escrita} rangos={[e]} />
                          </span>
                        </div>
                        <p className={styles.regla}>{e.regla}</p>
                      </li>
                    ))}
                  </ul>
                )}

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
              <span aria-hidden="true">📄</span> Busca diptongos e hiatos en un texto
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
              Salen solo las palabras con vocales en contacto. Toca una para ver sus sílabas y la regla
              de cada encuentro.
            </p>

            <div className={styles.filtros} role="group" aria-label="Filtrar por tipo de encuentro">
              <button
                type="button"
                className={`${styles.filtro} ${filtro === 'todas' ? styles.filtroActivo : ''}`}
                aria-pressed={filtro === 'todas'}
                onClick={() => setFiltro('todas')}
              >
                {`Todas (${delTexto.palabras.length})`}
              </button>
              {FAMILIAS.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`${styles.filtro} ${filtro === f ? styles.filtroActivo : ''}`}
                  aria-pressed={filtro === f}
                  onClick={() => setFiltro(f)}
                >
                  {`Con ${NOMBRE_FAMILIA[f]} (${delTexto.porFamilia[f]})`}
                </button>
              ))}
            </div>

            <p className={styles.resumenTexto} aria-live="polite">
              <span>{cuentaEncuentros(delTexto.porTipo)}</span>
            </p>

            <ul className={styles.listaPalabras}>
              {visibles.map(({ orden, analisis: a, familias }) => (
                <li key={orden}>
                  {/* a11y-ok: acción que carga la palabra en el analizador, no conmutador */}
                  <button
                    type="button"
                    className={`${styles.chip} ${CLASE_FAMILIA_CHIP[familias[0]]}`}
                    onClick={() => analizarDelTexto(a.escrita)}
                    aria-label={`${a.escrita}: ${familias.map((f) => NOMBRE_FAMILIA[f]).join(' y ')}. Analizarla`}
                  >
                    <span>
                      <PalabraMarcada palabra={a.escrita} rangos={a.encuentros} />
                    </span>
                    <span className={styles.chipTipo} aria-hidden="true">
                      {familias.map((f) => ABREVIATURA[f]).join(' + ')}
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
          title="Diptongos, triptongos e hiatos: reglas y ejemplos"
          subtitle="Vocales abiertas y cerradas, tipos, errores frecuentes y preguntas"
        >
          <section className={styles.guideSection}>
            <h2>Vocales abiertas y cerradas: la regla que lo decide todo</h2>
            <p>
              Cuando dos vocales van seguidas, pueden pronunciarse en la misma sílaba (diptongo) o en
              sílabas distintas (hiato). Lo decide el tipo de vocal: las abiertas son a, e y o, y las
              cerradas, i y u. La y al final de palabra suena como i y cuenta como cerrada (rey, hoy).
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th scope="col">Encuentro</th>
                    <th scope="col">Vocales</th>
                    <th scope="col">Sílaba</th>
                    <th scope="col">Ejemplos</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Diptongo creciente</td>
                    <td>Cerrada + abierta</td>
                    <td>La misma</td>
                    <td>cie-lo, nue-vo, a-gua</td>
                  </tr>
                  <tr>
                    <td>Diptongo decreciente</td>
                    <td>Abierta + cerrada</td>
                    <td>La misma</td>
                    <td>ai-re, pei-ne, rey</td>
                  </tr>
                  <tr>
                    <td>Diptongo homogéneo</td>
                    <td>Dos cerradas distintas</td>
                    <td>La misma</td>
                    <td>ciu-dad, rui-do, cuí-da-te</td>
                  </tr>
                  <tr>
                    <td>Triptongo</td>
                    <td>Cerrada + abierta + cerrada</td>
                    <td>La misma</td>
                    <td>buey, miau, guau</td>
                  </tr>
                  <tr>
                    <td>Hiato simple</td>
                    <td>Dos abiertas, o dos vocales iguales</td>
                    <td>Distintas</td>
                    <td>po-e-ta, le-er, chi-i-ta</td>
                  </tr>
                  <tr>
                    <td>Hiato acentual</td>
                    <td>Cerrada tónica (í, ú) + abierta</td>
                    <td>Distintas, con tilde siempre</td>
                    <td>pa-ís, rí-o, bú-ho</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Hay palabras que en unas zonas se dicen con diptongo y en otras con hiato: pi-a-no o
              pia-no, cru-el o cruel, gui-on o guion. La Ortografía de 2010 las escribe todas como
              diptongo, para que la tilde no dependa de cómo pronuncie cada uno, y esta app sigue esa
              norma.
            </p>
          </section>

          <section className={styles.guideSection}>
            <h2>Para quién es útil</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎒</span>
                <h3>Estudiante que repasa</h3>
                <p>
                  Comprueba su ejercicio y, sobre todo, el porqué: qué vocales hay y qué regla las une o
                  las separa.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <span className={styles.escenarioIcon} aria-hidden="true">🧑‍🏫</span>
                <h3>Profesor de Lengua</h3>
                <p>
                  Asigna los casos numerados, que son siempre los mismos, o pega la lectura de clase y
                  saca de un vistazo todas sus palabras con diptongo o con hiato.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <span className={styles.escenarioIcon} aria-hidden="true">✍️</span>
                <h3>Quien duda con la tilde</h3>
                <p>
                  ¿Rio o río? ¿Guion o guión? Ve si las vocales forman hiato, que es lo que pide la tilde,
                  o diptongo.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <span className={styles.escenarioIcon} aria-hidden="true">🌎</span>
                <h3>Quien aprende español</h3>
                <p>
                  Saber qué vocales van juntas dice cuántas sílabas tiene una palabra que no ha oído
                  nunca y dónde cortarla.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Paso a paso: ¿diptongo, triptongo o hiato?</h2>
            <ol className={styles.stepGuide}>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">1</span>
                <div className={styles.stepContent}>
                  <h3>Busca vocales seguidas</h3>
                  <p>Sin consonante en medio. La h no cuenta: en bú-ho la ú y la o están en contacto.</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">2</span>
                <div className={styles.stepContent}>
                  <h3>Descarta la u que no suena</h3>
                  <p>En que, qui, gue y gui la u es parte de la consonante. Con diéresis (güe, güi) sí suena.</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">3</span>
                <div className={styles.stepContent}>
                  <h3>Clasifica cada vocal</h3>
                  <p>Abierta (a, e, o) o cerrada (i, u, y final). Fíjate si la cerrada lleva tilde.</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">4</span>
                <div className={styles.stepContent}>
                  <h3>Aplica la regla</h3>
                  <p>
                    Cerrada sin tilde + abierta, o dos cerradas distintas: diptongo. Dos abiertas, dos
                    iguales o una cerrada con tilde junto a una abierta: hiato.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">5</span>
                <div className={styles.stepContent}>
                  <h3>Cuenta si son tres</h3>
                  <p>Cerrada + abierta + cerrada en la misma sílaba es un triptongo: buey, miau.</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">6</span>
                <div className={styles.stepContent}>
                  <h3>Separa en sílabas</h3>
                  <p>El diptongo y el triptongo van enteros en una sílaba; el hiato se corta entre sus vocales.</p>
                </div>
              </li>
            </ol>
          </section>

          <section className={styles.guideSection}>
            <h2>Buenas prácticas</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔤</span>
                <p>
                  <strong>Escribe la palabra con sus tildes.</strong> «dia» y «día» no son la misma
                  palabra para la regla: la tilde convierte el diptongo en hiato.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">👂</span>
                <p>
                  <strong>Comprueba de oído.</strong> Si al decirla despacio la i o la u se separan y
                  suenan fuertes (rí-o, re-ír), hay hiato acentual y falta la tilde.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">✂️</span>
                <p>
                  <strong>Nunca partas un diptongo al final de línea.</strong> Se corta por sílabas, y
                  «ci-udad» o «a-ire» no lo son.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🧩</span>
                <p>
                  <strong>Una palabra puede tener varios.</strong> Aéreo tiene dos hiatos (a-é-re-o) y
                  leíais, dos hiatos y un diptongo: mira cada pareja de vocales por separado.
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
                  <strong>Creer que la h separa.</strong> Ahumado tiene diptongo (ahu-ma-do) y búho tiene
                  hiato por la tilde, no por la h.
                </li>
                <li>
                  <strong>Ver diptongo en «que» o «gui».</strong> Esa u no suena: queso tiene dos sílabas
                  sin ningún encuentro de vocales.
                </li>
                <li>
                  <strong>Tomar dos cerradas iguales por diptongo.</strong> Chiita y duunviro tienen hiato:
                  el diptongo homogéneo exige dos cerradas distintas.
                </li>
                <li>
                  <strong>Pensar que la tilde siempre separa.</strong> En cuídate o lingüística la tilde
                  va sobre una cerrada junto a otra cerrada, y siguen en diptongo.
                </li>
                <li>
                  <strong>Tildar guion, truhan o fie.</strong> Desde 2010 se escriben sin tilde: son
                  diptongos a efectos ortográficos y, por tanto, monosílabos.
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

        <ShareCard appName="diptongos-e-hiatos" />

        <Footer appName="diptongos-e-hiatos" />
      </div>
    </>
  );
}
