'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './ContadorSilabas.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';

// La escansión (silabeo, sinalefas, acentuación) vive en metrica.ts y el análisis
// de rima y estrofas en rima.ts: son lógica pura y así pueden verificarse contra
// poemas reales sin arrancar el navegador.
import {
  type AnalisisVerso,
  analizarPoema,
  contarSilabasTexto,
  encuentrosVocalicos,
  nombreDelVerso,
} from './metrica';
import {
  type AnalisisRima,
  analizarRimas,
  esquemaLegible,
} from './rima';


/** Metros a los que se puede ajustar un verso en el modo composición */
const METROS_OBJETIVO = [7, 8, 11, 14] as const;

export default function ContadorSilabasPage() {
  const [texto, setTexto] = useState('');
  const [resultado, setResultado] = useState<{
    palabras: { palabra: string; silabas: string[]; total: number }[];
    totalSilabas: number;
    totalPalabras: number;
    versos: AnalisisVerso[];
    bloques: number[][];
    rima: AnalisisRima | null;
  } | null>(null);

  // Modo composición: mide en vivo mientras se escribe, contra un metro elegido
  const [metroObjetivo, setMetroObjetivo] = useState<number | null>(null);
  // Metro personalizado (letras de canciones: cualquier número de sílabas, no solo
  // los cuatro versos clásicos). Vacío hasta que el usuario escribe algo.
  const [metroPersonalizado, setMetroPersonalizado] = useState('');

  const analizar = () => {
    if (!texto.trim()) return;

    const palabrasAnalizadas = contarSilabasTexto(texto);
    const totalSilabas = palabrasAnalizadas.reduce((acc, p) => acc + p.total, 0);
    const { versos, bloques } = analizarPoema(texto);

    setResultado({
      palabras: palabrasAnalizadas,
      totalSilabas,
      totalPalabras: palabrasAnalizadas.length,
      versos,
      bloques,
      // La rima solo tiene sentido a partir de dos versos
      rima: versos.length >= 2 ? analizarRimas(versos, bloques) : null,
    });
  };

  const limpiar = () => {
    setTexto('');
    setResultado(null);
  };

  // Medición en vivo para el modo composición (no depende del botón «Analizar»)
  const versosEnVivo = metroObjetivo !== null ? analizarPoema(texto).versos : [];

  const ejemplos = [
    'murciélago',
    'electroencefalografista',
    'comunicación',
    'poesía',
    'aeropuerto',
  ];

  // Versos clásicos (dominio público) que muestran sinalefa y ajuste por acento final
  const ejemplosVerso = [
    { etiqueta: 'Endecasílabo (Bécquer)', texto: 'Volverán las oscuras golondrinas' },
    { etiqueta: 'Octosílabo agudo (Calderón)', texto: '¿Qué es la vida? Un frenesí' },
    { etiqueta: 'Alejandrino (Darío)', texto: 'La princesa está triste, ¿qué tendrá la princesa?' },
  ];

  // Estrofas completas (dominio público) para probar el análisis de rima
  const ejemplosEstrofa = [
    {
      etiqueta: 'Redondilla (Sor Juana)',
      texto: `Hombres necios que acusáis
a la mujer sin razón,
sin ver que sois la ocasión
de lo mismo que culpáis`,
    },
    {
      etiqueta: 'Romance viejo (grafía antigua)',
      // «faze» y no «hace»: es la grafía del romance del prisionero, y es ella la que evita
      // la sinalefa y sostiene el octosílabo. Con la forma modernizada, el segundo verso
      // salía heptasílabo dentro de un ejemplo rotulado «serie indefinida de octosílabos»
      // (hallazgo 262 del Inspector).
      texto: `Que por mayo era por mayo
cuando faze la calor
cuando los trigos encañan
y están los campos en flor
cuando canta la calandria
y responde el ruiseñor`,
    },
    {
      etiqueta: 'Lira (Fray Luis)',
      texto: `Qué descansada vida
la del que huye del mundanal ruido,
y sigue la escondida
senda por donde han ido
los pocos sabios que en el mundo han sido`,
    },
    {
      etiqueta: 'Soneto (Quevedo)',
      texto: `Érase un hombre a una nariz pegado,
érase una nariz superlativa,
érase una nariz sayón y escriba,
érase un peje espada muy barbado.

Era un reloj de sol mal encarado,
érase una alquitara pensativa,
érase un elefante boca arriba,
era Ovidio Nasón más narizado.

Érase el espolón de una galera,
érase una pirámide de Egipto,
las doce tribus de narices era.

Érase un naricísimo infinito,
frisón archinariz, caratulera,
sabañón garrafal, morado y frito.`,
    },
  ];

  const cargarEjemplo = (ejemplo: string) => {
    setTexto(ejemplo);
    setResultado(null);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Contador de Sílabas</h1>
        <p className={styles.subtitle}>
          Separa y cuenta las sílabas de cualquier texto en español
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Introduce tu texto</h2>

          <div className={styles.inputGroup}>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escribe una palabra, frase o texto completo..."
              className={styles.textarea}
              rows={6}
              lang="es"
            />
          </div>

          <div className={styles.ejemplos}>
            <span className={styles.ejemplosLabel}>Palabras:</span>
            {ejemplos.map((ej) => (
              <button
                key={ej}
                type="button"
                onClick={() => cargarEjemplo(ej)}
                className={styles.ejemploBtn}
                aria-label={`Cargar ejemplo: ${ej}`}
              >
                {ej}
              </button>
            ))}
          </div>

          <div className={styles.ejemplos}>
            <span className={styles.ejemplosLabel}>Versos:</span>
            {ejemplosVerso.map((ej) => (
              <button
                key={ej.texto}
                type="button"
                onClick={() => cargarEjemplo(ej.texto)}
                className={styles.ejemploBtn}
                aria-label={`Cargar verso de ejemplo: ${ej.etiqueta}`}
                title={ej.texto}
              >
                {ej.etiqueta}
              </button>
            ))}
          </div>

          <div className={styles.ejemplos}>
            <span className={styles.ejemplosLabel}>Estrofas:</span>
            {ejemplosEstrofa.map((ej) => (
              <button
                key={ej.etiqueta}
                type="button"
                onClick={() => cargarEjemplo(ej.texto)}
                className={styles.ejemploBtn}
                aria-label={`Cargar estrofa de ejemplo: ${ej.etiqueta}`}
              >
                {ej.etiqueta}
              </button>
            ))}
          </div>

          {/* Modo composición: mide mientras escribes contra un metro fijo */}
          <div className={styles.composicion}>
            <div className={styles.composicionCabecera}>
              <span className={styles.ejemplosLabel}>Escribiendo un poema:</span>
              {METROS_OBJETIVO.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`${styles.ejemploBtn} ${metroObjetivo === m ? styles.ejemploBtnActivo : ''}`}
                  aria-pressed={metroObjetivo === m}
                  onClick={() => {
                    setMetroPersonalizado('');
                    setMetroObjetivo(metroObjetivo === m ? null : m);
                  }}
                >
                  {nombreDelVerso(m)}
                </button>
              ))}

              {/* Metro personalizado: para letras de canciones, que no siempre encajan
                  en los cuatro versos clásicos (endecasílabo, alejandrino...) */}
              <form
                className={styles.metroLibre}
                onSubmit={(e) => {
                  e.preventDefault();
                  const n = Number(metroPersonalizado);
                  if (Number.isInteger(n) && n >= 2 && n <= 20) setMetroObjetivo(n);
                }}
              >
                <label htmlFor="metro-personalizado" className={styles.metroLibreLabel}>
                  o fija tus sílabas:
                </label>
                <input
                  id="metro-personalizado"
                  type="number"
                  min={2}
                  max={20}
                  inputMode="numeric"
                  value={metroPersonalizado}
                  onChange={(e) => setMetroPersonalizado(e.target.value)}
                  placeholder="ej. 6"
                  className={styles.metroLibreInput}
                />
                <button type="submit" className={styles.ejemploBtn}>
                  Fijar
                </button>
              </form>

              {metroObjetivo !== null && (
                <button
                  type="button"
                  className={styles.ejemploBtn}
                  onClick={() => {
                    setMetroPersonalizado('');
                    setMetroObjetivo(null);
                  }}
                >
                  Desactivar
                </button>
              )}
            </div>

            {metroObjetivo !== null && (
              <div className={styles.medidorVivo} role="status" aria-live="polite">
                {versosEnVivo.length === 0 ? (
                  <p className={styles.medidorPista}>
                    Escribe un verso por línea: te iré diciendo cuántas sílabas te faltan o te
                    sobran para el {nombreDelVerso(metroObjetivo)}.
                  </p>
                ) : (
                  versosEnVivo.map((v, i) => {
                    const diferencia = v.silabasMetricas - metroObjetivo;
                    const estado =
                      diferencia === 0 ? 'exacto' : diferencia > 0 ? 'sobra' : 'falta';
                    return (
                      <div key={i} className={`${styles.medidorFila} ${styles[`medidor_${estado}`]}`}>
                        <span className={styles.medidorBarra} aria-hidden="true">
                          <span
                            className={styles.medidorRelleno}
                            style={{
                              width: `${Math.min(100, (v.silabasMetricas / metroObjetivo) * 100)}%`,
                            }}
                          />
                        </span>
                        <span className={styles.medidorCuenta}>
                          {v.silabasMetricas}/{metroObjetivo}
                        </span>
                        <span className={styles.medidorMensaje}>
                          {diferencia === 0
                            ? '✓ justo'
                            : diferencia > 0
                              ? `sobran ${diferencia}`
                              : `faltan ${Math.abs(diferencia)}`}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <div className={styles.botones}>
            <button type="button" onClick={analizar} className={styles.btnPrimary}>
              Analizar Sílabas
            </button>
            <button type="button" onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel} role="status" aria-live="polite">
          {/* Una entrada sin ninguna letra («12345 €€€ --- 3,14») pintaba el panel con ceros y
              un «Análisis detallado» vacío, indistinguible de un análisis real. */}
          {resultado && resultado.totalPalabras === 0 ? (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">🔤</span>
              <p>
                No hay ninguna palabra que analizar: lo que has escrito son solo cifras o
                signos. Escribe al menos una palabra.
              </p>
            </div>
          ) : resultado ? (
            <>
              {/* Resumen */}
              <div className={styles.resumen}>
                <div className={styles.resumenItem}>
                  <span className={styles.resumenValor}>{resultado.totalSilabas}</span>
                  <span className={styles.resumenLabel}>Sílabas totales</span>
                </div>
                <div className={styles.resumenItem}>
                  <span className={styles.resumenValor}>{resultado.totalPalabras}</span>
                  <span className={styles.resumenLabel}>Palabras</span>
                </div>
                <div className={styles.resumenItem}>
                  <span className={styles.resumenValor}>
                    {resultado.totalPalabras > 0
                      ? formatNumber(resultado.totalSilabas / resultado.totalPalabras, 1)
                      : '0'}
                  </span>
                  <span className={styles.resumenLabel}>Media por palabra</span>
                </div>
              </div>

              {/* Métrica del verso: solo tiene sentido con más de una palabra */}
              {resultado.versos.some((v) => v.palabras.length > 1) && (
                <div className={styles.metricaBloque}>
                  <h3>
                    <span aria-hidden="true">🎼</span> Métrica del verso
                  </h3>
                  <p className={styles.metricaIntro}>
                    Sílabas fonéticas menos las sinalefas, más el ajuste por acento final.
                  </p>

                  {resultado.versos.map((v, index) => (
                    <div key={index} className={styles.versoCard}>
                      <div className={styles.versoTexto}>{v.texto}</div>

                      <div className={styles.versoResultado}>
                        <span className={styles.versoSilabas}>{v.silabasMetricas}</span>
                        <span className={styles.versoNombre}>
                          {v.nombre}
                          <span className={styles.versoArte}>
                            arte {v.arte}
                          </span>
                        </span>
                      </div>

                      <div className={styles.versoDesglose}>
                        <span className={styles.versoOperando}>
                          {v.silabasFoneticas} fonéticas
                        </span>
                        {v.sinalefas.length > 0 && (
                          <span className={styles.versoOperando}>
                            − {v.sinalefas.length}{' '}
                            {v.sinalefas.length === 1 ? 'sinalefa' : 'sinalefas'}
                          </span>
                        )}
                        <span className={styles.versoOperando}>
                          {v.ajuste > 0 ? '+ 1' : v.ajuste < 0 ? '− 1' : '± 0'} (última palabra{' '}
                          {v.acentuacion === 'esdrujula' ? 'esdrújula' : v.acentuacion})
                        </span>
                        <span className={styles.versoIgual}>= {v.silabasMetricas}</span>
                      </div>

                      {v.sinalefas.length > 0 && (
                        <div className={styles.sinalefasLista}>
                          {v.sinalefas.map((s, i) => (
                            <span
                              key={i}
                              className={`${styles.sinalefaTag} ${s.conPausa ? styles.sinalefaPausa : ''}`}
                              title={
                                s.conPausa
                                  ? 'Hay un signo de puntuación entre las dos palabras: el poeta puede deshacer esta fusión (dialefa)'
                                  : 'Fusión de la vocal final con la vocal inicial de la palabra siguiente'
                              }
                            >
                              {v.palabras[s.indice].palabra} <span aria-hidden="true">⌣</span>{' '}
                              {v.palabras[s.indice + 1].palabra}
                              {s.conPausa && <span className={styles.sinalefaAviso}> · con pausa</span>}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <p className={styles.metricaNota}>
                    <strong>Cómo leerlo:</strong> el cómputo aplica la norma general. El poeta puede
                    romper una sinalefa (dialefa) o unir vocales en hiato (sinéresis) cuando lo pide el
                    ritmo, sobre todo en las fusiones marcadas <em>con pausa</em>. Si el verso no te
                    cuadra, prueba a deshacer una de ellas.
                  </p>
                </div>
              )}

              {/* Rima y estrofa */}
              {resultado.rima && (
                <div className={styles.rimaBloque}>
                  <h3 className={styles.rimaTitulo}>Rima y estrofa</h3>

                  {resultado.rima.composicion && (
                    <div className={styles.estrofaDestacada}>
                      <span className={styles.estrofaNombre}>
                        {resultado.rima.composicion.nombre}
                      </span>
                      <span className={styles.estrofaDescripcion}>
                        {resultado.rima.composicion.descripcion}
                      </span>
                      {resultado.rima.composicion.confianza === 'aproximada' && (
                        <span className={styles.estrofaAproximada}>
                          Encaja en lo esencial, aunque algún verso se aparta del patrón.
                        </span>
                      )}
                    </div>
                  )}

                  <div className={styles.rimaResumen}>
                    <div className={styles.rimaDato}>
                      <span className={styles.rimaValor}>
                        {esquemaLegible(
                          resultado.rima.versos.map((v) => v.letra),
                          resultado.bloques
                        )}
                      </span>
                      <span className={styles.rimaEtiqueta}>Esquema de rima</span>
                    </div>
                    <div className={styles.rimaDato}>
                      <span className={styles.rimaValor}>
                        {resultado.rima.tipo === 'consonante'
                          ? 'Consonante'
                          : resultado.rima.tipo === 'asonante'
                            ? 'Asonante'
                            : 'Verso libre'}
                      </span>
                      <span className={styles.rimaEtiqueta}>
                        {resultado.rima.tipo === 'consonante'
                          ? 'Coinciden todos los sonidos'
                          : resultado.rima.tipo === 'asonante'
                            ? 'Coinciden solo las vocales'
                            : 'Sin rima reconocible'}
                      </span>
                    </div>
                  </div>

                  {/* Estrofas sueltas, solo cuando la detección es firme */}
                  {resultado.rima.estrofas.some((e) => e?.confianza === 'exacta') &&
                    !resultado.rima.composicion && (
                      <ul className={styles.estrofasLista}>
                        {resultado.rima.estrofas.map((e, i) =>
                          e && e.confianza === 'exacta' ? (
                            <li key={i}>
                              <strong>{e.nombre}</strong> ({e.esquema}) — {e.descripcion}
                            </li>
                          ) : null
                        )}
                      </ul>
                    )}

                  <div className={styles.rimaVersos}>
                    {resultado.rima.versos.map((v, i) => (
                      <div key={i} className={styles.rimaVerso}>
                        <span
                          className={`${styles.rimaLetra} ${
                            v.letra === '-' ? styles.rimaSuelto : ''
                          }`}
                          data-letra={v.letra.toUpperCase()}
                        >
                          {v.letra}
                        </span>
                        <span className={styles.rimaTexto}>
                          {resultado.versos[i].texto.replace(
                            new RegExp(`${v.terminacion}\\W*$`, 'i'),
                            ''
                          )}
                          <strong className={styles.rimaTerminacion}>{v.terminacion}</strong>
                        </span>
                        <span className={styles.rimaMedida}>{v.silabasMetricas}</span>
                      </div>
                    ))}
                  </div>

                  <p className={styles.metricaNota}>
                    <strong>Cómo se lee:</strong> cada letra marca una rima distinta;{' '}
                    <em>mayúscula</em> para los versos de arte mayor (nueve sílabas o más) y{' '}
                    <em>minúscula</em> para los de arte menor. Un guion señala un verso suelto,
                    que no rima con ningún otro. La rima empieza en la vocal acentuada de la
                    última palabra.
                  </p>
                </div>
              )}

              {/* Lista de palabras */}
              <div className={styles.palabrasLista}>
                <h3>Análisis detallado</h3>
                <div className={styles.palabrasGrid}>
                  {resultado.palabras.map((p, index) => (
                    <div key={index} className={styles.palabraCard}>
                      <div className={styles.palabraOriginal}>{p.palabra}</div>
                      <div className={styles.palabraSilabas}>
                        {p.silabas.map((s, i) => (
                          <span key={i} className={styles.silaba}>
                            {s}
                          </span>
                        ))}
                      </div>
                      <div className={styles.palabraTotal}>
                        {p.total} {p.total === 1 ? 'sílaba' : 'sílabas'}
                      </div>
                      {/* El JSON-LD y la tarjeta de Twitter prometían «identificación de
                          diptongos, hiatos y triptongos» y no se marcaba ninguno: solo se
                          explicaban en el texto educativo, que es lo que da cualquier apunte. */}
                      {(() => {
                        const enc = encuentrosVocalicos(p.palabra);
                        const etiquetas = [
                          ...enc.triptongos.map((v) => ({ tipo: 'Triptongo', valor: v })),
                          ...enc.diptongos.map((v) => ({ tipo: 'Diptongo', valor: v })),
                          ...enc.hiatos.map((v) => ({ tipo: 'Hiato', valor: v })),
                        ];
                        if (etiquetas.length === 0) return null;
                        return (
                          <div className={styles.palabraEncuentros}>
                            {etiquetas.map((e, i) => (
                              <span key={i} className={styles.encuentro}>
                                {e.tipo}: <strong>{e.valor}</strong>
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">📝</span>
              <p>Introduce un texto para analizar sus sílabas</p>
            </div>
          )}
        </div>
      </div>

      {/* Información sobre reglas */}
      <div className={styles.reglas}>
        <h3><span aria-hidden="true">📚</span> Reglas de División Silábica en Español</h3>
        <div className={styles.reglasGrid}>
          <div className={styles.reglaCard}>
            <h4>Diptongos</h4>
            <p>
              Vocal fuerte (a, e, o) + vocal débil (i, u), o dos débiles <strong>distintas</strong>, en la misma sílaba.
              <br />
              <em>Ejemplo: ai-re, cau-sa, pei-ne, ciu-dad</em>
              <br />
              Dos débiles <strong>iguales</strong> forman hiato: <em>chi-i-ta, an-ti-in-fla-ma-to-rio</em>.
            </p>
          </div>
          <div className={styles.reglaCard}>
            <h4>Hiatos</h4>
            <p>
              Dos vocales fuertes = sílabas separadas.
              <br />
              <em>Ejemplo: po-e-ta, a-é-re-o</em>
            </p>
          </div>
          <div className={styles.reglaCard}>
            <h4>Consonantes Dobles</h4>
            <p>
              bl, br, cl, cr, dr, fl, fr, gl, gr, pl, pr, tr van juntas.
              <br />
              <em>Ejemplo: a-brir, o-tro</em>
            </p>
          </div>
          <div className={styles.reglaCard}>
            <h4>Consonante entre Vocales</h4>
            <p>
              Una consonante entre vocales va con la siguiente sílaba.
              <br />
              <em>Ejemplo: ca-sa, pe-lo</em>
            </p>
          </div>
        </div>
      </div>

      <EducationalSection
        title="Métrica, Fonética y Poesía Española"
        subtitle="Domina las reglas de silabeo, diptongos e hiatos del español"
        icon="📝"
      >
        <section>
          <h3><span aria-hidden="true">📊</span> Fenómenos Fonéticos: Diptongos, Hiatos y Sinalefa</h3>
          <div className={styles.eduTablaWrapper}>
            <table className={styles.eduTabla}>
              <thead>
                <tr>
                  <th>Fenómeno</th>
                  <th>Definición</th>
                  <th>Regla</th>
                  <th>Ejemplos</th>
                  <th>Efecto en sílabas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Diptongo</strong></td>
                  <td>Dos vocales en la misma sílaba</td>
                  <td>Vocal fuerte (a,e,o) + débil (i,u) sin tilde, o dos débiles DISTINTAS</td>
                  <td>ai-re, cau-sa, cui-da</td>
                  <td>Reduce el número de sílabas</td>
                </tr>
                <tr>
                  <td><strong>Triptongo</strong></td>
                  <td>Tres vocales en la misma sílaba</td>
                  <td>Débil + fuerte + débil (i/u + a/e/o + i/u)</td>
                  <td>a-pre-ciáis, buey</td>
                  <td>Reduce aún más las sílabas</td>
                </tr>
                <tr>
                  <td><strong>Hiato</strong></td>
                  <td>Dos vocales en sílabas distintas</td>
                  <td>Dos vocales fuertes, dos débiles IGUALES, o débil tónica con tilde</td>
                  <td>po-e-ta, pa-ís, Ma-rí-a, chi-i-ta</td>
                  <td>Aumenta el número de sílabas</td>
                </tr>
                <tr>
                  <td><strong>Sinalefa</strong></td>
                  <td>Fusión de sílabas entre dos palabras</td>
                  <td>Vocal final de palabra + vocal inicial de la siguiente</td>
                  <td>&quot;la ena-mo-ra-da&quot; → &quot;lae-na-mo-ra-da&quot;</td>
                  <td>Reduce sílabas en verso</td>
                </tr>
                <tr>
                  <td><strong>Dialefa</strong></td>
                  <td>No se produce sinalefa (pausa)</td>
                  <td>Pausa por puntuación, énfasis o licencia poética</td>
                  <td>Uso estilístico en poesía</td>
                  <td>Mantiene sílabas separadas</td>
                </tr>
                <tr>
                  <td><strong>Sineresis</strong></td>
                  <td>Diptongo forzado en poesía</td>
                  <td>Hiato tratado como diptongo por licencia poética</td>
                  <td>po-eta → poe-ta (verso)</td>
                  <td>Reduce sílabas para la métrica</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3><span aria-hidden="true">🎯</span> Usos del Contador de Sílabas</h3>
          <div className={styles.eduEscenariosGrid}>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>🎭</span>
              <h4>Poesía y Métrica Española</h4>
              <p>La métrica española clasifica los versos por número de sílabas: heptasílabo (7), octosílabo (8), endecasílabo (11), alejandrino (14). El soneto usa endecasílabos. El romance usa octosílabos con rima asonante en los pares. Contar sílabas correctamente es fundamental para escribir o analizar poesía con rigor.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>📚</span>
              <h4>Lengua y Literatura (secundaria y preparatoria)</h4>
              <p>El análisis métrico es habitual en los exámenes de Lengua Castellana en secundaria y preparatoria. Incluye identificar el número de sílabas, el tipo de verso (tónico), las licencias poéticas (sinalefa, dialefa, sineresis, dieresis) y la rima (consonante o asonante). Esta herramienta ayuda a verificar cuentas antes de entregar trabajos.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>🎵</span>
              <h4>Composición de Letras Musicales</h4>
              <p>Las letras de canciones en español siguen patrones silábicos para encajar con la melodía. Una sílaba por nota es lo habitual; las melismas (varias notas por sílaba) son la excepción. Contar sílabas de tus letras te ayuda a saber cuándo una línea es demasiado larga o corta para la frase musical que tienes en mente.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>🌍</span>
              <h4>Aprendizaje del Español como LE</h4>
              <p>Para hablantes no nativos, el silabeo es uno de los aspectos más difíciles del español. Idiomas como el inglés no distinguen claramente sílabas en la escritura. Usar esta herramienta ayuda a interiorizar los patrones silábicos del español, mejorando la pronunciación, el acento y la comprensión de la acentuación ortográfica.</p>
            </div>
          </div>
        </section>

        <section>
          <h3><span aria-hidden="true">❓</span> Preguntas Frecuentes sobre Sílabas y Métrica</h3>
          <div className={styles.eduFaqList}>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Cómo se cuenta una sílaba tónica para la métrica?</summary>
              <p className={styles.eduFaqRespuesta}>En métrica española, la última sílaba tónica del verso determina si se suma o resta una sílaba. Verso <strong>agudo</strong> (última palabra aguda, como &quot;café&quot;): se suma +1. Verso <strong>llano</strong> (última palabra llana, como &quot;casa&quot;): no se modifica. Verso <strong>esdrújulo</strong> (última palabra esdrújula, como &quot;pájaro&quot;): se resta -1. Por eso el verso &quot;En el principio era el amor&quot; tiene 11 sílabas métricas aunque tenga 10 fonéticas (última palabra aguda: &quot;amor&quot;).</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Cuándo se produce hiato y cuándo diptongo?</summary>
              <p className={styles.eduFaqRespuesta}>La regla básica: las vocales <strong>fuertes</strong> son a, e, o; las <strong>débiles</strong> son i, u. Diptongo: fuerte + débil (sin tilde en la débil), débil + fuerte, o dos débiles <strong>distintas</strong> (ciu-dad). Hiato: fuerte + fuerte, dos débiles <strong>iguales</strong> (chi-i-ta, du-un-vi-ro), o débil TÓNICA (con tilde) + cualquier vocal. Por eso &quot;país&quot; es hiato (i tónica lleva tilde), pero &quot;paisaje&quot; es diptongo (i átona). La tilde sobre la vocal débil siempre rompe el diptongo.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿La sinalefa es siempre obligatoria en poesía?</summary>
              <p className={styles.eduFaqRespuesta}>No. La sinalefa es la norma general —se produce automáticamente cuando vocal final de palabra se encuentra con vocal inicial de la siguiente— pero el poeta puede romperla (dialefa) cuando lo necesita para la métrica o el ritmo. La dialefa suele marcarse con una coma o punto que introduce una pausa, o simplemente como licencia poética declarada. En el análisis de textos ya escritos, hay que intentar primero la sinalefa y solo si no cuadra la métrica considerar la dialefa.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Cuáles son los tipos de verso más comunes en español?</summary>
              <p className={styles.eduFaqRespuesta}>Por número de sílabas métricas: <strong>octosílabo (8)</strong> — el más tradicional, base del romance y la copla. <strong>Endecasílabo (11)</strong> — el más &quot;culto&quot;, base del soneto y la silva. <strong>Heptasílabo (7)</strong> — combinado con el endecasílabo en la lira. <strong>Alejandrino (14)</strong> — base del mester de clerecía medieval. <strong>Dodecasílabo (12)</strong> — usado en el modernismo. Los versos de menos de 8 sílabas se llaman &quot;de arte menor&quot;; los de 9 o más, &quot;de arte mayor&quot;.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Qué son las licencias poéticas de dieresis y sineresis?</summary>
              <p className={styles.eduFaqRespuesta}><strong>Sineresis</strong>: unir en una sola sílaba dos vocales que normalmente formarían hiato. Ejemplo: &quot;poeta&quot; normalmente es po-e-ta (3 sílabas), pero en verso puede tratarse como poe-ta (2 sílabas). <strong>Dieresis</strong>: separar en dos sílabas un diptongo que normalmente sería una. Ejemplo: &quot;suave&quot; normalmente es sua-ve, pero en verso puede leerse su-a-ve. Estas licencias permiten al poeta ajustar la métrica cuando necesita más o menos sílabas.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Por qué las palabras esdrújulas llevan tilde siempre?</summary>
              <p className={styles.eduFaqRespuesta}>Las reglas de acentuación ortográfica se basan directamente en la sílaba tónica. Las palabras <strong>agudas</strong> (tónica en la última sílaba) llevan tilde si terminan en vocal, n o s. Las <strong>llanas</strong> (tónica en la penúltima) llevan tilde si NO terminan en vocal, n o s. Las <strong>esdrújulas</strong> (tónica en la antepenúltima) llevan tilde SIEMPRE. Las <strong>sobresdrújulas</strong> (antes de la antepenúltima) también llevan tilde siempre. Entender bien la sílaba tónica es la clave de toda la ortografía de acentuación española.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Por qué los algoritmos de silabeo automático no son perfectos?</summary>
              <p className={styles.eduFaqRespuesta}>El silabeo español tiene excepciones y ambigüedades que requieren contexto. Los principales problemas: (1) palabras compuestas donde el prefijo termina en consonante del segundo elemento (&quot;sub-rayar&quot; vs &quot;su-bra-yar&quot;); (2) grupos consonánticos que pueden dividirse de formas distintas; (3) vocales en hiato vs diptongo cuando no hay tilde explícita (&quot;guion&quot; — la RAE admite ambas pronunciaciones); (4) nombres propios extranjeros. Ningún algoritmo tiene fiabilidad del 100% para todos los casos del español.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Cuántas sílabas tiene el español en promedio por palabra?</summary>
              <p className={styles.eduFaqRespuesta}>El español tiene una media de aproximadamente 2,3-2,5 sílabas por palabra en textos continuos. Es una lengua de sílabas abiertas (terminadas en vocal) con predominio: estructura preferida CV (consonante-vocal), como &quot;ca-sa&quot;, &quot;me-sa&quot;. El inglés, en contraste, tiene muchas más sílabas cerradas (CVC, CVCC). Esta diferencia explica por qué el español suena más &quot;musical&quot; y abierto al oído, y por qué los hispanohablantes tienen cierta dificultad con los grupos consonánticos del inglés.</p>
            </details>
          </div>
        </section>

        <section>
          <h3><span aria-hidden="true">📋</span> Cómo Analizar Métricamente un Poema: Guía Paso a Paso</h3>
          <ol className={styles.eduPasosList}>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>1</span>
              <div>
                <strong>Lee el poema en voz alta con naturalidad</strong>
                <p>Antes de contar, lee el poema como lo harías normalmente hablado. El ritmo natural del español te dará pistas sobre dónde van las sinalefas y cuáles son las sílabas tónicas. No intentes contar mientras lees; primero siente el ritmo.</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>2</span>
              <div>
                <strong>Pega el poema con un verso por línea</strong>
                <p>La herramienta analiza cada línea como un verso independiente, así que puedes pegar una estrofa entera de una vez. En el bloque «Métrica del verso» verás el cómputo de cada línea por separado.</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>3</span>
              <div>
                <strong>Revisa las sinalefas detectadas</strong>
                <p>El contador localiza automáticamente los contactos vocal-vocal entre palabras («la_era», «de_amor») y resta una sílaba por cada uno. Las fusiones marcadas <em>con pausa</em> —las que tienen una coma o un punto en medio— son las candidatas a deshacerse (dialefa) si el verso no te cuadra.</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>4</span>
              <div>
                <strong>Comprueba el ajuste por la sílaba final tónica</strong>
                <p>El cómputo aplica solo la regla del acento final: aguda (+1), llana (±0) o esdrújula (−1). La herramienta indica cuál ha detectado, para que puedas verificarlo si la última palabra es ambigua.</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>5</span>
              <div>
                <strong>Identifica el tipo de verso y la estrofa</strong>
                <p>Con el número de sílabas métricas, identifica el tipo de verso. Si todos tienen el mismo número, es un poema isométrico. Analiza también la rima: marca las vocales tónicas finales de cada verso (rima asonante) o la terminación completa (rima consonante).</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>6</span>
              <div>
                <strong>Reconoce la forma estrófica</strong>
                <p>Combina el número de sílabas y el esquema de rima para identificar la forma: soneto (ABBA ABBA CDC DCD, 14 endecasílabos), romance (octosílabos, rima asonante pares), décima espinela (10 octosílabos, ABBAACCDDC), lira (7-11-7-7-11, aBabB). Cada forma tiene sus propias reglas históricas y estéticas.</p>
              </div>
            </li>
          </ol>
        </section>

        <section>
          <h3><span aria-hidden="true">💡</span> Consejos para Dominar el Silabeo Español</h3>
          <div className={styles.eduTipsGrid}>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>🗣️</span>
              <h4>Pronuncia en voz alta siempre</h4>
              <p>El silabeo español es fonético: sigue cómo se pronuncia, no cómo se escribe. Si no estás seguro de dónde cae la división, pronúncialo lentamente golpeando la mesa con cada sílaba. Tu oído y tu boca saben la respuesta.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>🔤</span>
              <h4>Recuerda las vocales fuertes y débiles</h4>
              <p>Mnemotécnico: &quot;<strong>A</strong>-<strong>E</strong>-IO-U: las <strong>A</strong>plicadas <strong>E</strong>s los fuertes, IO-U los débiles&quot; (a, e, o = fuertes; i, u = débiles). Este es el dato más importante para resolver diptongos e hiatos.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>📌</span>
              <h4>La tilde sobre i/u siempre rompe el diptongo</h4>
              <p>Regla sin excepciones: si la i o la u llevan tilde (&iacute;, ú), siempre forman hiato con la vocal adyacente. &quot;Maíz&quot;: ma-íz (hiato porque í lleva tilde). &quot;Maiz&quot; hipotéticamente sería mai-z (diptongo). La tilde &quot;marca&quot; que esa vocal débil es tónica y por tanto autónoma.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>✍️</span>
              <h4>Para poesía: fíjate en las sílabas métricas, no en las fonéticas</h4>
              <p>Son dos cuentas distintas y la herramienta te da las dos. Las <strong>fonéticas</strong> salen de silabear cada palabra aislada; las <strong>métricas</strong> son las que cuentan en el verso, y resultan de restar las sinalefas y aplicar el ajuste por acento final. Un verso de 11 sílabas métricas puede tener 13 fonéticas.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>🎯</span>
              <h4>Los grupos bl, br, cl, cr, dr, fl, fr... van juntos</h4>
              <p>Estos grupos consonánticos (oclusiva + líquida) nunca se separan en el silabeo: a-brir, o-tros, a-gra-dar, a-fli-gir. En cambio, los que no pueden abrir sílaba se reparten entre las dos: cons-tar, ins-ti-tu-to, obs-tá-cu-lo, pers-pec-ti-va. La regla es esa: si el grupo puede iniciar una sílaba en español, viaja entero a la siguiente; si no, se parte.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>📖</span>
              <h4>Practica con poemas que ya conoces</h4>
              <p>Toma un poema conocido (Lorca, Machado, Neruda, Gustavo Adolfo Bécquer) cuya métrica sea conocida y verifica que tus cuentas coinciden. El Soneto XXIII de Garcilaso (&quot;En tanto que de rosa y azucena&quot;) tiene 11 sílabas por verso: es un banco de pruebas inmejorable.</p>
            </div>
          </div>
        </section>

        <section>
          <div className={styles.warningBox}>
            <span className={styles.warningIcono}>⚠️</span>
            <div>
              <strong>Limitaciones del algoritmo de silabeo automático</strong>
              <ul>
                <li><strong>Las sinalefas se detectan, pero la última palabra la tienes tú:</strong> el cómputo métrico aplica la norma general (toda sinalefa posible se realiza). El poeta puede romperla (dialefa) o unir un hiato (sinéresis) por motivos de ritmo; esas licencias no son predecibles por algoritmo. Las fusiones señaladas <em>con pausa</em> son las primeras candidatas a revisar si el verso no cuadra.</li>
                <li><strong>Sinéresis y diéresis no se aplican solas:</strong> el análisis parte del silabeo estándar de cada palabra. Si el poeta trató &quot;poeta&quot; como bisílabo (sinéresis) o &quot;suave&quot; como trisílabo (diéresis), el resultado diferirá en una sílaba.</li>
                <li><strong>Las sinalefas sí se encadenan:</strong> cuando tres o más vocales entran en contacto, se funden todas en una sílaba. «Érase un hombre a una nariz pegado» tiene 14 sílabas fonéticas y tres contactos vocálicos (se_un, bre_a, a_u): 14 − 3 = 11, el endecasílabo que Quevedo escribió. La excepción es la conjunción <em>y</em>, que funde por un solo lado —«de rosa y azucena» ahorra una sílaba, no dos—, porque entre vocales se lee [ro-sa-<em>ja</em>-zu-ce-na].</li>
                <li><strong>Palabras compuestas y prefijadas:</strong> En palabras como &quot;subrayar&quot;, &quot;deshacer&quot; o &quot;transatlántico&quot;, el silabeo puede variar según se considere la morfología o solo la fonética. La RAE y las distintas tradiciones gramaticales no siempre coinciden.</li>
                <li><strong>Nombres propios y extranjerismos:</strong> El algoritmo puede fallar con nombres como &quot;Shakespeare&quot;, &quot;Nietzsche&quot; o topónimos poco frecuentes cuya pronunciación en español no sigue las reglas estándar.</li>
                <li><strong>Siglas deletreadas:</strong> el silabeo trata cada palabra como una palabra española, no como una sigla. Las que se leen de corrido salen bien (ONU → o-nu, OTAN → o-tan), pero las que se deletrean se devuelven tal cual y cuentan una sola sílaba: &quot;DNI&quot; se lee <em>de-e-ne-i</em>, cuatro sílabas, y aquí aparece como una. Si tu verso lleva una sigla deletreada, cuenta sus letras aparte.</li>
                <li><strong>Secuencias &quot;ui&quot;/&quot;iu&quot; en verbos como &quot;construir&quot;:</strong> la RAE admite tanto el diptongo (cons-truir, 2 sílabas) como el hiato (cons-tru-ir, 3 sílabas) según la pronunciación. El algoritmo aplica siempre el criterio de diptongo.</li>
                <li><strong>No es árbitro de exámenes:</strong> Para dudas concretas en contexto académico, consulta la Nueva Gramática de la Lengua Española (RAE/ASALE, 2009) o el Diccionario panhispánico de dudas, que son las referencias normativas oficiales.</li>
              </ul>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('contador-silabas')} />

      <ShareCard appName="contador-silabas" />
      <Footer appName="contador-silabas" />
    </div>
  );
}
