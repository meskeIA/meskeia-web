'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './ConjugadorVerbos.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  conjugarVerbo,
  esVerboValido,
  esIrregular,
  buscarVerbos,
  obtenerVerbosIrregulares,
  PRONOMBRES,
  TIEMPOS,
  ConjugacionCompleta,
} from './motorConjugacion';

type ModoVista = 'indicativo' | 'subjuntivo' | 'imperativo';

export default function ConjugadorVerbosPage() {
  const [busqueda, setBusqueda] = useState('');
  const [conjugacion, setConjugacion] = useState<ConjugacionCompleta | null>(null);
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [modoVista, setModoVista] = useState<ModoVista>('indicativo');
  const [error, setError] = useState('');
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  const handleBusquedaChange = useCallback((valor: string) => {
    setBusqueda(valor);
    setError('');

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

    if (!esVerboValido(verboLimpio)) {
      setError('Por favor, introduce un verbo válido en infinitivo (terminado en -ar, -er o -ir)');
      setConjugacion(null);
      return;
    }

    const resultado = conjugarVerbo(verboLimpio);
    if (resultado) {
      setConjugacion(resultado);
      setError('');
    } else {
      setError('No se pudo conjugar el verbo');
      setConjugacion(null);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    conjugar(busqueda);
  };

  const handleSugerenciaClick = (verbo: string) => {
    conjugar(verbo);
  };

  const verbosPopulares = ['ser', 'estar', 'tener', 'hacer', 'ir', 'poder', 'decir', 'ver', 'querer', 'saber'];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">📖</span>
        <h1 className={styles.title}>Conjugador de Verbos Español</h1>
        <p className={styles.subtitle}>
          Conjuga cualquier verbo en español. Incluye todos los tiempos verbales
          y más de 60 verbos irregulares completamente conjugados.
        </p>
      </header>

      <LegalNotice />

      {/* Buscador */}
      <div className={styles.searchSection}>
        <form onSubmit={handleSubmit} className={styles.searchForm}>
          <div className={styles.searchWrapper}>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => handleBusquedaChange(e.target.value)}
              onFocus={() => sugerencias.length > 0 && setMostrarSugerencias(true)}
              onBlur={() => setTimeout(() => setMostrarSugerencias(false), 200)}
              placeholder="Escribe un verbo en infinitivo..."
              className={styles.searchInput}
              autoComplete="off"
            />
            <button type="submit" className={styles.searchButton}>
              Conjugar
            </button>

            {/* Sugerencias */}
            {mostrarSugerencias && sugerencias.length > 0 && (
              <ul className={styles.sugerencias}>
                {sugerencias.map((verbo) => (
                  <li
                    key={verbo}
                    onClick={() => handleSugerenciaClick(verbo)}
                    className={styles.sugerenciaItem}
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

        {error && <p className={styles.error}>{error}</p>}

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
            <h2 className={styles.verbTitle}>
              {conjugacion.infinitivo}
              {esIrregular(conjugacion.infinitivo) && (
                <span className={styles.badgeIrregularLarge}>Irregular</span>
              )}
            </h2>
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
              setBusqueda('');
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
            Más de 60 verbos irregulares con conjugación completa verificada
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
                  <td>Presente, pretérito perfecto, indefinido, imperfecto, futuro, condicional</td>
                  <td>Enuncia realidades objetivas</td>
                </tr>
                <tr>
                  <td><strong>Subjuntivo</strong></td>
                  <td>Deseos, dudas, hipótesis, emociones, posibilidades</td>
                  <td><em>Quiero que comas, ojalá comiera</em></td>
                  <td>Presente subjuntivo, imperfecto subjuntivo</td>
                  <td>Casi siempre aparece en cláusula subordinada con &quot;que&quot;</td>
                </tr>
                <tr>
                  <td><strong>Imperativo</strong></td>
                  <td>Órdenes, instrucciones, consejos, ruegos</td>
                  <td><em>¡Come! / ¡No comas!</em></td>
                  <td>Imperativo afirmativo, imperativo negativo</td>
                  <td>Solo tiene formas de tú, vosotros, usted, ustedes</td>
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
              <span className={styles.casoIcon}>📖</span>
              <div className={styles.casoTitle}>Estudiante de español</div>
              <div className={styles.casoSubtitle}>ESO / Bachillerato</div>
              <p className={styles.casoDesc}>
                Verificar conjugaciones para redacciones, ejercicios y exámenes. Repasar
                los tiempos irregulares antes de un examen de lengua.
              </p>
            </div>
            <div className={styles.casoCard}>
              <span className={styles.casoIcon}>🌍</span>
              <div className={styles.casoTitle}>Estudiante extranjero</div>
              <div className={styles.casoSubtitle}>Aprendizaje de español (ELE)</div>
              <p className={styles.casoDesc}>
                Aprender los patrones de conjugación del español, entender cuándo usar
                ser vs estar y dominar los verbos irregulares más comunes.
              </p>
            </div>
            <div className={styles.casoCard}>
              <span className={styles.casoIcon}>🎓</span>
              <div className={styles.casoTitle}>Profesor de español</div>
              <div className={styles.casoSubtitle}>Educación / ELE</div>
              <p className={styles.casoDesc}>
                Preparar ejercicios y fichas de clase, verificar formas correctas,
                mostrar conjugaciones completas con todos los tiempos verbales.
              </p>
            </div>
            <div className={styles.casoCard}>
              <span className={styles.casoIcon}>✍️</span>
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
                E→IE (pensar→pienso), O→UE (contar→cuento), E→I (pedir→pido).
                Afectan solo a formas tónicas (yo, tú, él, ellos) en presente.
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
              <div className={styles.tipItem}>El pretérito indefinido y el presente de subjuntivo suelen compartir la misma raíz irregular.</div>
              <div className={styles.tipItem}>El gerundio siempre termina en -ando (1ª conj.) o -iendo (2ª y 3ª).</div>
              <div className={styles.tipItem}>El futuro y el condicional de verbos regulares comparten la misma raíz (el infinitivo completo).</div>
              <div className={styles.tipItem}>Los verbos reflexivos llevan pronombres: me, te, se, nos, os, se — antes del verbo conjugado.</div>
              <div className={styles.tipItem}>Practica los tiempos compuestos: haber + participio (he comido, había hecho, habrá visto).</div>
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
            <li><strong>❌ Diccionario limitado (~600 verbos):</strong> Este conjugador incluye los verbos más frecuentes del español, pero el diccionario de la RAE recoge más de 10.000 verbos. Si no encuentras un verbo muy específico o técnico, prueba a buscar su forma base en el diccionario oficial.</li>
            <li><strong>❌ No incluye variantes dialectales:</strong> El español tiene variantes regionales significativas: el voseo (vos tenés, vos sos) de Argentina, Uruguay y zonas de Centroamérica no está representado. Las conjugaciones corresponden al español estándar peninsular.</li>
            <li><strong>❌ Los tiempos verbales tienen usos contextuales complejos:</strong> Saber conjugar un verbo no equivale a saber cuándo usarlo. El pretérito indefinido vs. el pretérito imperfecto, o el presente de subjuntivo, requieren comprensión del contexto. La conjugación es la forma; la sintaxis dicta cuándo.</li>
            <li><strong>❌ El imperativo negativo usa subjuntivo:</strong> Un error frecuente es usar el imperativo positivo para negar. &quot;No habla&quot; (incorrecto) vs &quot;No hables&quot; (correcto). El imperativo negativo en español siempre usa la forma de subjuntivo presente.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('conjugador-verbos')} />
      <ShareCard appName="conjugador-verbos" />
      <Footer appName="conjugador-verbos" />
    </div>
  );
}
