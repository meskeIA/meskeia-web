'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './ConversorOnzas.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  PESO_UNIDADES,
  volUnidades,
  convertir,
  ONZAS_META,
  type SistemaLiquido,
} from '@/lib/calculadoras/onzas';
import { formatNumber } from '@/lib/formatters';

type Modo = 'peso' | 'volumen';

// Decimales según magnitud, para no mostrar «226,7959…» ni «0» de más.
function fmt(v: number): string {
  const abs = Math.abs(v);
  const dec = abs >= 100 ? 0 : abs >= 10 ? 1 : 2;
  return formatNumber(v, dec);
}

export default function ConversorOnzasPage() {
  const [modo, setModo] = useState<Modo>('peso');
  const [sistema, setSistema] = useState<SistemaLiquido>('us');

  const [pesoValor, setPesoValor] = useState('8');
  const [pesoFrom, setPesoFrom] = useState('oz');
  const [volValor, setVolValor] = useState('8');
  const [volFrom, setVolFrom] = useState('floz');

  const unidadesVol = useMemo(() => volUnidades(sistema), [sistema]);

  const resultadoPeso = useMemo(
    () => convertir(parseFloat(pesoValor.replace(',', '.')), pesoFrom, PESO_UNIDADES),
    [pesoValor, pesoFrom],
  );
  const resultadoVol = useMemo(
    () => convertir(parseFloat(volValor.replace(',', '.')), volFrom, unidadesVol),
    [volValor, volFrom, unidadesVol],
  );

  const resultado = modo === 'peso' ? resultadoPeso : resultadoVol;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Conversor de onzas</h1>
        <p className={styles.subtitle}>
          De onzas a gramos, mililitros, libras y tazas. La onza de peso y la onza líquida no son
          lo mismo: aquí las separamos para que no te líen las recetas
        </p>
      </header>

      <LegalNotice />

      <main className={styles.mainContent}>
        {/* Selector de ámbito */}
        <div className={styles.modoTabs} role="tablist" aria-label="Tipo de onza">
          <button
            type="button"
            role="tab"
            aria-selected={modo === 'peso'}
            className={`${styles.modoTab} ${modo === 'peso' ? styles.modoTabActivo : ''}`}
            onClick={() => setModo('peso')}
          >
            <span aria-hidden="true">⚖️</span> Onzas de peso
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={modo === 'volumen'}
            className={`${styles.modoTab} ${modo === 'volumen' ? styles.modoTabActivo : ''}`}
            onClick={() => setModo('volumen')}
          >
            <span aria-hidden="true">🥤</span> Onzas líquidas
          </button>
        </div>

        <section className={styles.panel} aria-label="Conversor de onzas">
          {modo === 'volumen' && (
            <div className={styles.campo}>
              <span className={styles.label} id="sistema-label">
                La onza líquida según el país
              </span>
              <div
                className={styles.sistemaToggle}
                role="group"
                aria-labelledby="sistema-label"
              >
                <button
                  type="button"
                  aria-pressed={sistema === 'us'}
                  className={`${styles.sistemaBtn} ${sistema === 'us' ? styles.sistemaBtnActivo : ''}`}
                  onClick={() => setSistema('us')}
                >
                  EE. UU. (29,57 ml)
                </button>
                <button
                  type="button"
                  aria-pressed={sistema === 'uk'}
                  className={`${styles.sistemaBtn} ${sistema === 'uk' ? styles.sistemaBtnActivo : ''}`}
                  onClick={() => setSistema('uk')}
                >
                  Reino Unido (28,41 ml)
                </button>
              </div>
            </div>
          )}

          <div className={styles.filaEntrada}>
            <div className={styles.campo}>
              <label htmlFor="cantidad" className={styles.label}>
                Cantidad
              </label>
              <input
                id="cantidad"
                type="text"
                inputMode="decimal"
                className={styles.input}
                value={modo === 'peso' ? pesoValor : volValor}
                onChange={(e) =>
                  modo === 'peso' ? setPesoValor(e.target.value) : setVolValor(e.target.value)
                }
                placeholder="8"
              />
            </div>
            <div className={styles.campo}>
              <label htmlFor="unidad" className={styles.label}>
                Unidad de partida
              </label>
              <select
                id="unidad"
                className={styles.select}
                value={modo === 'peso' ? pesoFrom : volFrom}
                onChange={(e) =>
                  modo === 'peso' ? setPesoFrom(e.target.value) : setVolFrom(e.target.value)
                }
              >
                {(modo === 'peso' ? PESO_UNIDADES : unidadesVol).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} ({u.abrev})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Resultado */}
          <div className={styles.resultado} role="status" aria-live="polite">
            {resultado.length ? (
              <div className={styles.resultadoGrid}>
                {resultado.map((r) => (
                  <div key={r.id} className={styles.resultadoItem}>
                    <span className={styles.resultadoItemValor}>{fmt(r.valor)}</span>
                    <span className={styles.resultadoItemUnidad}>{r.abrev}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className={styles.resultadoPlaceholder}>
                Introduce una cantidad para ver la conversión
              </span>
            )}
          </div>

          <p className={styles.fuenteNota}>
            Onza de peso (avoirdupois): 1 oz = 28,35 g. Onza líquida: 1 fl oz ={' '}
            {sistema === 'us' ? '29,57 ml (EE. UU.)' : '28,41 ml (Reino Unido)'}. Fuente:{' '}
            {ONZAS_META.fuente}. Verificado {ONZAS_META.verificado}.
          </p>
        </section>

        {/* Tabla de referencia */}
        <section className={styles.referenciaSection} aria-labelledby="ref-titulo">
          <h2 id="ref-titulo" className={styles.seccionTitulo}>
            <span aria-hidden="true">📋</span> Equivalencias más habituales
          </h2>
          <div className={styles.tableWrapper}>
            <table className={styles.tablaReferencia}>
              <thead>
                <tr>
                  <th scope="col">Onzas de peso</th>
                  <th scope="col">En gramos</th>
                  <th scope="col">Onzas líquidas (EE. UU.)</th>
                  <th scope="col">En mililitros</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.celNombre}>1 oz</td>
                  <td>28 g</td>
                  <td>1 fl oz</td>
                  <td>30 ml</td>
                </tr>
                <tr>
                  <td className={styles.celNombre}>4 oz</td>
                  <td>113 g</td>
                  <td>4 fl oz (½ taza)</td>
                  <td>118 ml</td>
                </tr>
                <tr>
                  <td className={styles.celNombre}>8 oz</td>
                  <td>227 g</td>
                  <td>8 fl oz (1 taza)</td>
                  <td>237 ml</td>
                </tr>
                <tr>
                  <td className={styles.celNombre}>12 oz</td>
                  <td>340 g</td>
                  <td>12 fl oz (1 lata)</td>
                  <td>355 ml</td>
                </tr>
                <tr>
                  <td className={styles.celNombre}>16 oz (1 libra)</td>
                  <td>454 g</td>
                  <td>16 fl oz (1 pinta)</td>
                  <td>473 ml</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Contenido educativo v2.0 */}
        <EducationalSection
          title="Entender las onzas"
          subtitle="Por qué la misma palabra mide peso y volumen, y en qué se diferencian EE. UU. y Reino Unido"
        >
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Una palabra, dos magnitudes</h2>
              <p>
                La onza es de las medidas más confusas porque el mismo nombre designa dos cosas que
                no tienen nada que ver. La <strong>onza de peso</strong> (la «avoirdupois») mide
                masa: 1 oz son 28,35 gramos, y 16 onzas hacen una libra. La{' '}
                <strong>onza líquida</strong> (la «fluid ounce») mide volumen, como los mililitros:
                1 fl oz son unos 30 ml. Por eso «8 onzas de harina» y «8 onzas de leche» no se
                convierten igual: unas son gramos y otras mililitros. Este conversor las mantiene
                separadas para que no las mezcles.
              </p>
            </div>

            <div className={styles.conceptoSection}>
              <h2>La onza líquida no es igual en EE. UU. y Reino Unido</h2>
              <p>
                Dentro de las onzas líquidas hay una segunda trampa: la estadounidense y la
                británica no miden lo mismo. La receta manda según de dónde venga:
              </p>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th scope="col">Onza líquida</th>
                    <th scope="col">Equivale a</th>
                    <th scope="col">Dónde se usa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>EE. UU. (US fl oz)</td>
                    <td>29,57 ml</td>
                    <td>Recetas de Estados Unidos y buena parte de Latinoamérica</td>
                  </tr>
                  <tr>
                    <td>Reino Unido (imperial fl oz)</td>
                    <td>28,41 ml</td>
                    <td>Recetas británicas y de la Commonwealth</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.conceptoSection}>
              <h2>Cuándo te toca convertir onzas</h2>
              <div className={styles.escenariosGrid}>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🥩</span>
                    <strong>Carne y pescado en peso</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    La receta pide «8 oz de pollo». Son onzas de peso: 227 g. Un filete de «6 oz»
                    ronda los 170 g.
                  </p>
                  <p className={styles.escenarioTip}>Aquí la onza es masa, no volumen.</p>
                </div>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🥛</span>
                    <strong>Líquidos y bebidas</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    «8 fl oz de leche» son 237 ml (una taza). Una lata de refresco de 12 fl oz son
                    355 ml.
                  </p>
                  <p className={styles.escenarioTip}>Aquí la onza es volumen: usa la pestaña líquida.</p>
                </div>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🍸</span>
                    <strong>Cócteles</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    La coctelería anglosajona mide en onzas líquidas: «2 oz de ron» son unos 59 ml,
                    lo que en España sería casi un doble.
                  </p>
                  <p className={styles.escenarioTip}>El jigger estándar es de 1½ oz (44 ml).</p>
                </div>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🍫</span>
                    <strong>Repostería</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    «4 oz de chocolate» son 113 g. Una barra estadounidense estándar suele traer 4 u
                    8 onzas de peso.
                  </p>
                  <p className={styles.escenarioTip}>16 oz = 1 libra = 454 g, la equivalencia clave.</p>
                </div>
              </div>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>Errores frecuentes con las onzas</strong>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>Confundir onza de peso con onza líquida.</strong> «8 oz de harina» son
                  gramos (227 g); «8 fl oz de agua» son mililitros (237 ml). Son magnitudes
                  distintas aunque el número se parezca.
                </li>
                <li>
                  <strong>Dar por hecho que una onza líquida son 30 ml exactos.</strong> Es una
                  buena aproximación mental, pero la de EE. UU. son 29,57 ml y la británica 28,41 ml.
                </li>
                <li>
                  <strong>Olvidar que 8 fl oz son una taza estadounidense.</strong> Muchas recetas en
                  onzas líquidas se leen mejor pasándolas a tazas (8 fl oz = 1 taza = 237 ml).
                </li>
                <li>
                  <strong>Mezclar la onza con la libra.</strong> 16 onzas de peso hacen 1 libra
                  (454 g), no 100 gramos ni un kilo. Un error de este tipo arruina las proporciones.
                </li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('conversor-onzas')} />
      <ShareCard appName="conversor-onzas" />
      <Footer appName="conversor-onzas" />
    </div>
  );
}
