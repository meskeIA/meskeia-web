'use client';
// @disclaimer: exempt

import { useState, useCallback, useEffect, useRef } from 'react';
import styles from './ConjugadorVerbos.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { enfocarALaVista } from '@/lib';
import {
  analizarEntrada,
  esIrregular,
  buscarVerbos,
  obtenerVerbosIrregulares,
  PRONOMBRES,
  TIEMPOS,
  NOTAS_TIEMPO,
  ConjugacionConCompuestos,
} from './motorConjugacion';

type ModoVista = 'indicativo' | 'subjuntivo' | 'imperativo';

const ID_LISTA_SUGERENCIAS = 'conjugador-sugerencias';

export default function ConjugadorVerbosPage() {
  const [busqueda, setBusqueda] = useState('');
  const [conjugacion, setConjugacion] = useState<ConjugacionConCompuestos | null>(null);
  const [irregular, setIrregular] = useState(false);
  const [nota, setNota] = useState<string | null>(null);
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [activa, setActiva] = useState(-1);
  const [modoVista, setModoVista] = useState<ModoVista>('indicativo');
  const [error, setError] = useState('');
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  // Cada conjugación (aunque sea del mismo verbo) y cada «Buscar otro verbo» piden mover el foco:
  // en móvil el resultado se pintaba bajo el borde de la pantalla y nada lo traía (hallazgo 4421).
  const [destinoFoco, setDestinoFoco] = useState<{ a: 'resultado' | 'buscador'; n: number } | null>(null);
  const cabeceraRef = useRef<HTMLHeadingElement>(null);
  const entradaRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!destinoFoco) return;
    enfocarALaVista(destinoFoco.a === 'resultado' ? cabeceraRef.current : entradaRef.current);
  }, [destinoFoco]);

  const handleBusquedaChange = useCallback((valor: string) => {
    setBusqueda(valor);
    setError('');
    setActiva(-1);

    if (valor.length >= 2) {
      const resultados = buscarVerbos(valor);
      setSugerencias(resultados);
      setMostrarSugerencias(true);
    } else {
      setSugerencias([]);
      setMostrarSugerencias(false);
    }
  }, []);

  const conjugar = useCallback((verbo: string) => {
    const verboLimpio = verbo.toLowerCase().trim();
    setBusqueda(verboLimpio);
    setMostrarSugerencias(false);
    setSugerencias([]);
    setActiva(-1);

    const resultado = analizarEntrada(verboLimpio);
    if (!resultado.ok) {
      setError(resultado.error);
      setConjugacion(null);
      setNota(null);
      return;
    }
    setConjugacion(resultado.conjugacion);
    setIrregular(resultado.irregular);
    setNota(resultado.nota);
    setError('');
    setDestinoFoco((previo) => ({ a: 'resultado', n: (previo?.n ?? 0) + 1 }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    conjugar(busqueda);
  };

  const handleSugerenciaClick = (verbo: string) => {
    conjugar(verbo);
  };

  /** Patrón combobox: flechas para recorrer las sugerencias, Intro para elegir, Escape para cerrar. */
  const handleTeclaBuscador = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const abiertas = mostrarSugerencias && sugerencias.length > 0;
    if (e.key === 'ArrowDown' && sugerencias.length > 0) {
      e.preventDefault();
      setMostrarSugerencias(true);
      setActiva((i) => (i + 1) % sugerencias.length);
    } else if (e.key === 'ArrowUp' && abiertas) {
      e.preventDefault();
      setActiva((i) => (i <= 0 ? sugerencias.length - 1 : i - 1));
    } else if (e.key === 'Enter' && abiertas && activa >= 0) {
      e.preventDefault();
      conjugar(sugerencias[activa]);
    } else if (e.key === 'Escape' && abiertas) {
      e.preventDefault();
      setMostrarSugerencias(false);
      setActiva(-1);
    }
  };

  const verbosPopulares = ['ser', 'estar', 'tener', 'hacer', 'ir', 'poder', 'decir', 'ver', 'querer', 'saber'];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">📖</span>
        <h1 className={styles.title}>Conjugador de Verbos Español</h1>
        <p className={styles.subtitle}>
          Conjuga verbos en español con todos los tiempos verbales: más de 60 irregulares
          en tabla, sus derivados, los grupos de irregularidad más comunes y los regulares por regla.
        </p>
      </header>

      <LegalNotice />

      {/* Buscador */}
      <div className={styles.searchSection}>
        <form onSubmit={handleSubmit} className={styles.searchForm}>
          <div className={styles.searchWrapper}>
            <input
              ref={entradaRef}
              type="text"
              value={busqueda}
              onChange={(e) => handleBusquedaChange(e.target.value)}
              onKeyDown={handleTeclaBuscador}
              onFocus={() => sugerencias.length > 0 && setMostrarSugerencias(true)}
              onBlur={() => setTimeout(() => setMostrarSugerencias(false), 200)}
              placeholder="Escribe un verbo en infinitivo..."
              aria-label="Verbo en infinitivo"
              className={styles.searchInput}
              autoComplete="off"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={mostrarSugerencias && sugerencias.length > 0}
              aria-controls={ID_LISTA_SUGERENCIAS}
              aria-activedescendant={
                mostrarSugerencias && activa >= 0 ? `${ID_LISTA_SUGERENCIAS}-${activa}` : undefined
              }
            />
            <button type="submit" className={styles.searchButton}>
              Conjugar
            </button>

            {/* Sugerencias */}
            {mostrarSugerencias && sugerencias.length > 0 && (
              <ul className={styles.sugerencias} role="listbox" id={ID_LISTA_SUGERENCIAS} aria-label="Sugerencias">
                {sugerencias.map((verbo, i) => (
                  <li
                    key={verbo}
                    id={`${ID_LISTA_SUGERENCIAS}-${i}`}
                    role="option"
                    aria-selected={i === activa}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSugerenciaClick(verbo)}
                    className={`${styles.sugerenciaItem} ${i === activa ? styles.sugerenciaActiva : ''}`}
                  >
                    {verbo}
                    {esIrregular(verbo) && (
                      <span className={styles.badgeIrregular}>irregular</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </form>

        {error && <p className={styles.error} role="alert">{error}</p>}

        {/* Verbos populares */}
        {!conjugacion && (
          <div className={styles.popularSection}>
            <p className={styles.popularLabel}>Verbos populares:</p>
            <div className={styles.popularGrid}>
              {verbosPopulares.map((verbo) => (
                <button
                  key={verbo}
                  type="button"
                  onClick={() => conjugar(verbo)}
                  className={styles.popularButton}
                >
                  {verbo}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resultado de conjugación */}
      {conjugacion && (
        <div className={styles.resultSection}>
          {/* Cabecera del verbo */}
          <div className={styles.verbHeader}>
            <h2 className={styles.verbTitle} ref={cabeceraRef} tabIndex={-1}>
              <span>{conjugacion.infinitivo}</span>
              <span className={irregular ? styles.badgeIrregularLarge : styles.oculto}>
                {irregular ? 'Irregular' : ''}
              </span>
            </h2>
            <p className={styles.notaModelo}>{nota ?? ''}</p>
            <div className={styles.formasNoPersonales}>
              <div className={styles.formaNP}>
                <span className={styles.formaNPLabel}>Gerundio:</span>
                <span className={styles.formaNPValue}>{conjugacion.gerundio}</span>
              </div>
              <div className={styles.formaNP}>
                <span className={styles.formaNPLabel}>Participio:</span>
                <span className={styles.formaNPValue}>{conjugacion.participio}</span>
              </div>
            </div>
          </div>

          {/* Tabs de modos */}
          <div className={styles.modeTabs}>
            <button
              type="button"
              onClick={() => setModoVista('indicativo')}
              aria-pressed={modoVista === 'indicativo'}
              className={`${styles.modeTab} ${modoVista === 'indicativo' ? styles.modeTabActive : ''}`}
            >
              Indicativo
            </button>
            <button
              type="button"
              onClick={() => setModoVista('subjuntivo')}
              aria-pressed={modoVista === 'subjuntivo'}
              className={`${styles.modeTab} ${modoVista === 'subjuntivo' ? styles.modeTabActive : ''}`}
            >
              Subjuntivo
            </button>
            <button
              type="button"
              onClick={() => setModoVista('imperativo')}
              aria-pressed={modoVista === 'imperativo'}
              className={`${styles.modeTab} ${modoVista === 'imperativo' ? styles.modeTabActive : ''}`}
            >
              Imperativo
            </button>
          </div>

          {/* Tablas de conjugación */}
          <div className={styles.conjugationGrid}>
            {modoVista === 'indicativo' && (
              <>
                {Object.entries(TIEMPOS.indicativo).map(([tiempo, nombre]) => (
                  <div key={tiempo} className={styles.tiempoCard}>
                    <h3 className={styles.tiempoTitle}>{nombre}</h3>
                    <table className={styles.conjugationTable}>
                      <tbody>
                        {PRONOMBRES.map((pronombre, idx) => (
                          <tr key={pronombre}>
                            <td className={styles.pronombre}>{pronombre}</td>
                            <td className={styles.forma}>
                              {conjugacion.indicativo[tiempo as keyof typeof conjugacion.indicativo][idx]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {NOTAS_TIEMPO.indicativo[tiempo] && (
                      <p className={styles.tiempoNota}>{NOTAS_TIEMPO.indicativo[tiempo]}</p>
                    )}
                  </div>
                ))}
              </>
            )}

            {modoVista === 'subjuntivo' && (
              <>
                {Object.entries(TIEMPOS.subjuntivo).map(([tiempo, nombre]) => (
                  <div key={tiempo} className={styles.tiempoCard}>
                    <h3 className={styles.tiempoTitle}>{nombre}</h3>
                    <table className={styles.conjugationTable}>
                      <tbody>
                        {PRONOMBRES.map((pronombre, idx) => (
                          <tr key={pronombre}>
                            <td className={styles.pronombre}>{pronombre}</td>
                            <td className={styles.forma}>
                              {conjugacion.subjuntivo[tiempo as keyof typeof conjugacion.subjuntivo][idx]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {NOTAS_TIEMPO.subjuntivo[tiempo] && (
                      <p className={styles.tiempoNota}>{NOTAS_TIEMPO.subjuntivo[tiempo]}</p>
                    )}
                  </div>
                ))}
              </>
            )}

            {modoVista === 'imperativo' && (
              <>
                {Object.entries(TIEMPOS.imperativo).map(([tipo, nombre]) => (
                  <div key={tipo} className={styles.tiempoCard}>
                    <h3 className={styles.tiempoTitle}>{nombre}</h3>
                    <table className={styles.conjugationTable}>
                      <tbody>
                        {PRONOMBRES.map((pronombre, idx) => (
                          <tr key={pronombre}>
                            <td className={styles.pronombre}>{pronombre}</td>
                            <td className={styles.forma}>
                              {conjugacion.imperativo[tipo as keyof typeof conjugacion.imperativo][idx]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Botón para nueva búsqueda */}
          <button
            type="button"
            onClick={() => {
              setConjugacion(null);
              setNota(null);
              setBusqueda('');
              setDestinoFoco((previo) => ({ a: 'buscador', n: (previo?.n ?? 0) + 1 }));
            }}
            className={styles.newSearchButton}
          >
            Buscar otro verbo
          </button>
        </div>
      )}

      {/* Lista de verbos irregulares */}
      {!conjugacion && (
        <div className={styles.irregularSection}>
          <h2 className={styles.sectionTitle}><span aria-hidden="true">📚</span> Verbos irregulares disponibles</h2>
          <p className={styles.sectionSubtitle}>
            {obtenerVerbosIrregulares().length} verbos irregulares con conjugación verificada; los regulares se conjugan solos
          </p>
          <div className={styles.irregularGrid}>
            {obtenerVerbosIrregulares().map((verbo) => (
              <button
                key={verbo}
                type="button"
                onClick={() => conjugar(verbo)}
                className={styles.irregularButton}
              >
                {verbo}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres aprender más sobre conjugación verbal?"
        subtitle="Descubre los tiempos verbales, modos y particularidades del español"
        icon="📚"
      >
        {/* Conceptos fundamentales */}
        <section className={styles.guideSection}>
          <h2>Los tres modos verbales del español</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">🔹</span> Indicativo</h4>
              <p>
                Expresa acciones reales y objetivas. Incluye presente, pretéritos,
                futuro y condicional. Es el modo más utilizado en español.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">🔹</span> Subjuntivo</h4>
              <p>
                Expresa deseos, dudas, posibilidades o situaciones hipotéticas.
                Se usa con expresiones como &quot;ojalá&quot;, &quot;quiero que&quot;, &quot;dudo que&quot;.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">🔹</span> Imperativo</h4>
              <p>
                Se usa para dar órdenes, instrucciones o consejos.
                Tiene formas afirmativas y negativas distintas.
              </p>
            </div>
          </div>
        </section>

        {/* Tabla comparativa */}
        <section className={styles.guideSection}>
          <h2>Tabla Comparativa: Los 3 modos verbales</h2>
          <div className={styles.tablaWrapper}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th>Modo</th>
                  <th>¿Para qué se usa?</th>
                  <th>Ejemplo (comer)</th>
                  <th>Tiempos principales</th>
                  <th>Clave para reconocerlo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Indicativo</strong></td>
                  <td>Expresar hechos, acciones reales y certezas</td>
                  <td><em>Yo como, comí, comeré</em></td>
                  <td>Diez: cinco simples (presente, imperfecto, indefinido, futuro, condicional) y sus cinco compuestos</td>
                  <td>Enuncia realidades objetivas</td>
                </tr>
                <tr>
                  <td><strong>Subjuntivo</strong></td>
                  <td>Deseos, dudas, hipótesis, emociones, posibilidades</td>
                  <td><em>Quiero que comas, ojalá comiera</em></td>
                  <td>Seis: presente, imperfecto y futuro, cada uno con su compuesto</td>
                  <td>Casi siempre aparece en cláusula subordinada con &quot;que&quot;</td>
                </tr>
                <tr>
                  <td><strong>Imperativo</strong></td>
                  <td>Órdenes, instrucciones, consejos, ruegos</td>
                  <td><em>¡Come! / ¡No comas!</em></td>
                  <td>Imperativo afirmativo, imperativo negativo</td>
                  <td>Formas propias solo de tú y vosotros (come, comed); usted, ustedes y nosotros (coma, coman, comamos) y todo el negativo las toman del presente de subjuntivo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de uso */}
        <section className={styles.guideSection}>
          <h2>¿Quién usa el conjugador de verbos?</h2>
          <p className={styles.introParagraph}>
            La conjugación correcta es esencial en múltiples contextos. Estos son los
            perfiles que más se benefician de esta herramienta:
          </p>
          <div className={styles.casosUsoGrid}>
            <div className={styles.casoCard}>
              <span className={styles.casoIcon} aria-hidden="true">📖</span>
              <div className={styles.casoTitle}>Estudiante de español</div>
              <div className={styles.casoSubtitle}>Secundaria / preparatoria</div>
              <p className={styles.casoDesc}>
                Verificar conjugaciones para redacciones, ejercicios y exámenes. Repasar
                los tiempos irregulares antes de un examen de lengua.
              </p>
            </div>
            <div className={styles.casoCard}>
              <span className={styles.casoIcon} aria-hidden="true">🌍</span>
              <div className={styles.casoTitle}>Estudiante extranjero</div>
              <div className={styles.casoSubtitle}>Aprendizaje de español (ELE)</div>
              <p className={styles.casoDesc}>
                Aprender los patrones de conjugación del español, entender cuándo usar
                ser vs estar y dominar los verbos irregulares más comunes.
              </p>
            </div>
            <div className={styles.casoCard}>
              <span className={styles.casoIcon} aria-hidden="true">🎓</span>
              <div className={styles.casoTitle}>Profesor de español</div>
              <div className={styles.casoSubtitle}>Educación / ELE</div>
              <p className={styles.casoDesc}>
                Preparar ejercicios y fichas de clase, verificar formas correctas,
                mostrar conjugaciones completas con todos los tiempos verbales.
              </p>
            </div>
            <div className={styles.casoCard}>
              <span className={styles.casoIcon} aria-hidden="true">✍️</span>
              <div className={styles.casoTitle}>Escritor / Corrector</div>
              <div className={styles.casoSubtitle}>Creación de contenido</div>
              <p className={styles.casoDesc}>
                Verificar el uso correcto de tiempos verbales en textos, resolver dudas
                sobre subjuntivo o formas poco frecuentes en redacción profesional.
              </p>
            </div>
          </div>
        </section>

        {/* Tipos de irregularidades */}
        <section className={styles.guideSection}>
          <h2>Tipos de irregularidades verbales</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Cambios vocálicos (diptongación)</h4>
              <p>
                E→IE (pensar→pienso) y O→UE (contar→cuento) solo en las formas con el acento
                en la raíz: yo, tú, él y ellos del presente de indicativo y de subjuntivo, y el
                imperativo de tú. Los de -ir cierran además la vocal en otras formas: E→I
                (pedir→pido, pidió, pidamos, pidiendo) y O→U (dormir→durmió, durmamos, durmiendo).
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Cambios consonánticos</h4>
              <p>
                C→ZC (conocer→conozco), añadir G (tener→tengo, salir→salgo),
                cambios en pretérito indefinido (hacer→hice, decir→dije).
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Participios irregulares</h4>
              <p>
                Abrir→abierto, escribir→escrito, hacer→hecho, ver→visto,
                volver→vuelto, poner→puesto, romper→roto, decir→dicho.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Verbos totalmente irregulares</h4>
              <p>
                Verbos como <em>ir</em> (voy, fui, iba) o <em>ser</em> (soy, fui, era)
                tienen formas que no derivan visualmente de su infinitivo.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes sobre Conjugación Verbal</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cuál es la diferencia entre ser y estar?</div>
              <div className={styles.faqRespuesta}>
                Ambos equivalen a &quot;to be&quot; en inglés, pero con usos distintos. <strong>Ser</strong> expresa identidad,
                origen, profesión, características permanentes y tiempo: &quot;Soy médico&quot;, &quot;Es de Madrid&quot;, &quot;Son las 3&quot;.
                <strong> Estar</strong> expresa estados, ubicación, condiciones temporales y resultado de acción:
                &quot;Estoy cansado&quot;, &quot;Está en casa&quot;, &quot;La puerta está abierta&quot;.
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cuándo se usa el subjuntivo?</div>
              <div className={styles.faqRespuesta}>
                El subjuntivo aparece en cláusulas subordinadas introducidas por &quot;que&quot; cuando la oración principal
                expresa: deseo (<em>quiero que vengas</em>), duda (<em>dudo que sea verdad</em>), emoción
                (<em>me alegra que estés bien</em>), posibilidad (<em>puede que llueva</em>) u orden negativa
                (<em>no hagas eso</em>). La clave es que el sujeto de ambas cláusulas sea diferente.
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cómo distingo el pretérito perfecto del indefinido?</div>
              <div className={styles.faqRespuesta}>
                El <strong>pretérito perfecto</strong> (he comido) se usa con acciones pasadas vinculadas al presente
                o al hoy: &quot;Esta mañana he desayunado&quot;. El <strong>indefinido</strong> (comí) se usa con acciones
                pasadas en un tiempo cerrado: &quot;Ayer desayuné a las 8&quot;. En Latinoamérica, el indefinido
                suele usarse en ambos casos.
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué son los verbos reflexivos y cómo se conjugan?</div>
              <div className={styles.faqRespuesta}>
                Los verbos reflexivos indican que el sujeto realiza la acción sobre sí mismo. Se conjugan
                añadiendo pronombres reflexivos: <em>me, te, se, nos, os, se</em>. Ejemplo con <em>levantarse</em>:
                yo <em>me levanto</em>, tú <em>te levantas</em>, él <em>se levanta</em>, nosotros <em>nos levantamos</em>...
                El pronombre precede al verbo conjugado pero se une al infinitivo, gerundio e imperativo.
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Para qué sirven el participio y el gerundio?</div>
              <div className={styles.faqRespuesta}>
                El <strong>participio</strong> (comido, hecho, visto) se usa para formar los tiempos compuestos
                con <em>haber</em> (he comido, había hecho) y la voz pasiva (fue visto). El <strong>gerundio</strong>
                (comiendo, haciendo) expresa una acción simultánea o en progreso: &quot;Está comiendo&quot;,
                &quot;Llegó corriendo&quot;. Nunca se usa como sujeto en español (&ast;El fumando es malo → Fumar es malo).
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cuándo se usa el condicional simple?</div>
              <div className={styles.faqRespuesta}>
                El condicional (<em>comería, haría, iría</em>) expresa: hipótesis futuras (&quot;Si tuviera dinero,
                viajaría&quot;), peticiones educadas (&quot;¿Podrías ayudarme?&quot;), probabilidad en el pasado
                (&quot;Serían las 3 cuando llegó&quot;) y el futuro en el pasado (&quot;Dijo que vendría&quot;).
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cómo se forma el futuro de indicativo?</div>
              <div className={styles.faqRespuesta}>
                En verbos regulares, el futuro se forma añadiendo al infinitivo completo las terminaciones:
                <em>-é, -ás, -á, -emos, -éis, -án</em>. Ejemplo: comer → comeré, comerás, comerá...
                Los irregulares cambian la raíz: <em>tener→tendré, hacer→haré, poder→podré, decir→diré,
                saber→sabré, venir→vendré</em>.
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué verbos tienen participio irregular?</div>
              <div className={styles.faqRespuesta}>
                Los participios irregulares más importantes: <em>abrir→abierto, cubrir→cubierto,
                decir→dicho, escribir→escrito, hacer→hecho, morir→muerto, poner→puesto,
                resolver→resuelto, romper→roto, ver→visto, volver→vuelto</em>. Sus compuestos
                también los heredan (describir→descrito, componer→compuesto, devolver→devuelto).
              </div>
            </li>
          </ul>
        </section>

        {/* Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Guía para conjugar cualquier verbo correctamente (6 pasos)</h2>
          <ol className={styles.pasosList}>
            <li className={styles.paso}>
              <span className={styles.pasoNum}>1</span>
              <div className={styles.pasoContent}>
                <div className={styles.pasoTitle}>Identifica el infinitivo</div>
                <p className={styles.pasoDesc}>
                  Determina la terminación del verbo: <strong>-ar</strong> (hablar), <strong>-er</strong> (comer)
                  o <strong>-ir</strong> (vivir). Esto te indica a qué conjugación pertenece.
                </p>
              </div>
            </li>
            <li className={styles.paso}>
              <span className={styles.pasoNum}>2</span>
              <div className={styles.pasoContent}>
                <div className={styles.pasoTitle}>Comprueba si es regular o irregular</div>
                <p className={styles.pasoDesc}>
                  Los verbos regulares siguen siempre el mismo patrón. Si el verbo tiene
                  cambios vocálicos (e→ie, o→ue) o consonánticos, es irregular.
                </p>
              </div>
            </li>
            <li className={styles.paso}>
              <span className={styles.pasoNum}>3</span>
              <div className={styles.pasoContent}>
                <div className={styles.pasoTitle}>Elige el modo verbal</div>
                <p className={styles.pasoDesc}>
                  ¿Expresas un hecho real? → Indicativo. ¿Un deseo, duda o hipótesis? → Subjuntivo.
                  ¿Una orden o consejo? → Imperativo.
                </p>
              </div>
            </li>
            <li className={styles.paso}>
              <span className={styles.pasoNum}>4</span>
              <div className={styles.pasoContent}>
                <div className={styles.pasoTitle}>Selecciona el tiempo verbal</div>
                <p className={styles.pasoDesc}>
                  Dentro del modo elegido, determina si la acción es presente, pasada (y qué tipo)
                  o futura. El pretérito tiene varias formas en español con matices distintos.
                </p>
              </div>
            </li>
            <li className={styles.paso}>
              <span className={styles.pasoNum}>5</span>
              <div className={styles.pasoContent}>
                <div className={styles.pasoTitle}>Aplica las terminaciones correctas</div>
                <p className={styles.pasoDesc}>
                  Extrae la raíz del verbo (quitar -ar/-er/-ir) y añade las terminaciones correspondientes
                  para cada persona gramatical. En verbos irregulares, la raíz puede cambiar.
                </p>
              </div>
            </li>
            <li className={styles.paso}>
              <span className={styles.pasoNum}>6</span>
              <div className={styles.pasoContent}>
                <div className={styles.pasoTitle}>Verifica la concordancia con el sujeto</div>
                <p className={styles.pasoDesc}>
                  Asegúrate de que el verbo concuerda en número (singular/plural) y persona
                  (1ª/2ª/3ª) con el sujeto de la oración. Este es el error más frecuente.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* Tips y Errores */}
        <section className={styles.guideSection}>
          <h2>Tips y errores frecuentes en conjugación</h2>
          <div className={styles.tipsErrorsSection}>
            <div className={styles.tipsColumn}>
              <div className={styles.tipsHeader}>✓ Buenas prácticas</div>
              <div className={styles.tipItem}>Aprende primero los 10 verbos irregulares más comunes: ser, estar, ir, tener, hacer, poder, decir, ver, querer, saber.</div>
              <div className={styles.tipItem}>El pretérito indefinido y el imperfecto de subjuntivo comparten siempre la raíz (tuvieron → tuviera); el presente de subjuntivo sale de la 1.ª persona del presente (tengo → tenga).</div>
              <div className={styles.tipItem}>El gerundio termina en -ando (1.ª conjugación) o -iendo (2.ª y 3.ª); tras vocal, la i pasa a y: leyendo, cayendo, yendo.</div>
              <div className={styles.tipItem}>El futuro y el condicional de verbos regulares comparten la misma raíz (el infinitivo completo).</div>
              <div className={styles.tipItem}>Los verbos reflexivos llevan pronombres: me, te, se, nos, os, se — antes del verbo conjugado.</div>
              <div className={styles.tipItem}>Los tiempos compuestos son siempre haber + participio, y el participio no cambia nunca: «las cartas que he escrito», no «escritas».</div>
            </div>
            <div className={styles.errorsColumn}>
              <div className={styles.errorsHeader}>✗ Errores comunes</div>
              <div className={styles.errorItem}>Usar indicativo donde corresponde subjuntivo: &quot;Quiero que <em>vas</em>&quot; → debe ser &quot;Quiero que <em>vayas</em>&quot;.</div>
              <div className={styles.errorItem}>No reconocer los verbos de cambio vocálico: &quot;yo podo&quot; (incorrecto) → &quot;yo puedo&quot;.</div>
              <div className={styles.errorItem}>Confundir el pretérito perfecto (he comido) con el indefinido (comí) sin atender al contexto temporal.</div>
              <div className={styles.errorItem}>Ignorar la concordancia de número con el sujeto: &quot;Los niños <em>juega</em>&quot; → &quot;Los niños <em>juegan</em>&quot;.</div>
              <div className={styles.errorItem}>Usar el gerundio como modificador de sustantivo: &quot;una caja <em>conteniendo</em>&quot; → &quot;una caja <em>que contiene</em>&quot;.</div>
              <div className={styles.errorItem}>Añadir &quot;-s&quot; a la 2ª persona del imperativo afirmativo: &quot;<em>comes</em>!&quot; → ¡<em>Come</em>!&quot;</div>
            </div>
          </div>
        </section>

        {/* Verbos irregulares clave */}
        <section className={styles.guideSection}>
          <h2>Verbos irregulares más utilizados</h2>
          <p className={styles.introParagraph}>
            Memorizar estos verbos te dará una base sólida, ya que sus patrones se repiten
            en muchos verbos similares:
          </p>
          <ul className={styles.usesList}>
            <li><strong>Ser y estar:</strong> Los dos verbos &quot;to be&quot; del español, completamente irregulares</li>
            <li><strong>Ir:</strong> Completamente irregular — voy, fui, iba (raíces distintas en cada tiempo)</li>
            <li><strong>Haber:</strong> Auxiliar esencial para tiempos compuestos (he, has, ha, hemos, habéis, han)</li>
            <li><strong>Tener y hacer:</strong> Irregulares en presente, pretérito y futuro</li>
            <li><strong>Poder, querer:</strong> Cambio O→UE y E→IE en presente; raíz irregular en pretérito</li>
            <li><strong>Decir y venir:</strong> Irregulares en presente, futuro (diré, vendré) y pretérito</li>
          </ul>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3>Limitaciones del Conjugador y Errores Comunes</h3>
          </div>
          <ul className={styles.warningList}>
            <li><strong><span aria-hidden="true">❌</span> No lleva diccionario:</strong> conjuga de tabla los {obtenerVerbosIrregulares().length} irregulares de la lista y sus derivados (mantener, suponer, prever…), y el resto por regla, según su terminación y los grupos de irregularidad más comunes (pensar, contar, pedir, conocer, construir…). Bajo la cabecera dice con qué modelo ha conjugado cada verbo. Un irregular poco frecuente que no esté en sus grupos saldría como regular, y una palabra inventada acabada en -ar, -er o -ir se conjugaría igual: si dudas de que un verbo exista o de una forma rara, consulta el diccionario de la RAE.</li>
            <li><strong><span aria-hidden="true">❌</span> No incluye variantes dialectales:</strong> El español tiene variantes regionales significativas: el voseo (vos tenés, vos sos) de Argentina, Uruguay y zonas de Centroamérica no está representado. Las conjugaciones corresponden al español estándar peninsular.</li>
            <li><strong><span aria-hidden="true">❌</span> Los tiempos verbales tienen usos contextuales complejos:</strong> Saber conjugar un verbo no equivale a saber cuándo usarlo. El pretérito indefinido vs. el pretérito imperfecto, o el presente de subjuntivo, requieren comprensión del contexto. La conjugación es la forma; la sintaxis dicta cuándo.</li>
            <li><strong><span aria-hidden="true">❌</span> El imperativo negativo usa subjuntivo:</strong> Un error frecuente es usar el imperativo positivo para negar. &quot;No habla&quot; (incorrecto) vs &quot;No hables&quot; (correcto). El imperativo negativo en español siempre usa la forma de subjuntivo presente.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="conjugador-verbos" />
      <Footer appName="conjugador-verbos" />
    </div>
  );
}
