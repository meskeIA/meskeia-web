'use client';

import { useState, useCallback } from 'react';
import styles from './ConjugadorVerbos.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
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
        <span className={styles.heroIcon}>📖</span>
        <h1 className={styles.title}>Conjugador de Verbos Español</h1>
        <p className={styles.subtitle}>
          Conjuga cualquier verbo en español. Incluye todos los tiempos verbales
          y más de 60 verbos irregulares completamente conjugados.
        </p>
      </header>

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
              onClick={() => setModoVista('indicativo')}
              className={`${styles.modeTab} ${modoVista === 'indicativo' ? styles.modeTabActive : ''}`}
            >
              Indicativo
            </button>
            <button
              onClick={() => setModoVista('subjuntivo')}
              className={`${styles.modeTab} ${modoVista === 'subjuntivo' ? styles.modeTabActive : ''}`}
            >
              Subjuntivo
            </button>
            <button
              onClick={() => setModoVista('imperativo')}
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
          <h2 className={styles.sectionTitle}>📚 Verbos irregulares disponibles</h2>
          <p className={styles.sectionSubtitle}>
            Más de 60 verbos irregulares con conjugación completa verificada
          </p>
          <div className={styles.irregularGrid}>
            {obtenerVerbosIrregulares().map((verbo) => (
              <button
                key={verbo}
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
        <section className={styles.guideSection}>
          <h2>Los tres modos verbales del español</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🔹 Indicativo</h4>
              <p>
                Expresa acciones reales y objetivas. Incluye presente, pretéritos,
                futuro y condicional. Es el modo más utilizado en español.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🔹 Subjuntivo</h4>
              <p>
                Expresa deseos, dudas, posibilidades o situaciones hipotéticas.
                Se usa frecuentemente con expresiones como "ojalá", "quiero que", "dudo que".
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🔹 Imperativo</h4>
              <p>
                Se usa para dar órdenes, instrucciones o consejos.
                Tiene formas afirmativas y negativas diferentes.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Verbos irregulares más comunes</h2>
          <p className={styles.introParagraph}>
            Los verbos irregulares no siguen las reglas de conjugación estándar.
            Algunos de los más utilizados son:
          </p>
          <ul className={styles.usesList}>
            <li><strong>Ser y estar:</strong> Los dos verbos "to be" del español, cada uno con usos distintos</li>
            <li><strong>Ir:</strong> Completamente irregular en presente e imperfecto</li>
            <li><strong>Haber:</strong> Auxiliar para tiempos compuestos (he, has, ha...)</li>
            <li><strong>Tener y hacer:</strong> Irregulares en presente, pretérito y futuro</li>
            <li><strong>Poder, querer, saber:</strong> Cambios vocálicos (o→ue, e→ie)</li>
          </ul>
        </section>

        <section className={styles.guideSection}>
          <h2>Tipos de irregularidades</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Cambios vocálicos</h4>
              <p>
                E→IE (pensar→pienso), O→UE (contar→cuento), E→I (pedir→pido).
                Afectan solo a algunas personas gramaticales.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Cambios consonánticos</h4>
              <p>
                C→ZC (conocer→conozco), añadir G (tener→tengo),
                cambios en pretérito (hacer→hice).
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Participios irregulares</h4>
              <p>
                Algunos verbos tienen participios especiales: abrir→abierto,
                escribir→escrito, hacer→hecho, ver→visto.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Verbos totalmente irregulares</h4>
              <p>
                Verbos como "ir" o "ser" tienen formas que no derivan de su infinitivo
                (voy, fui, soy, era...).
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('conjugador-verbos')} />
      <Footer appName="conjugador-verbos" />
    </div>
  );
}
