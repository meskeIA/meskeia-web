'use client';
// @disclaimer: exempt

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import styles from './DiccionarioRimas.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';

// El motor de rima (núcleo tónico, fonemas, asonancia) vive en rimas.ts: es
// lógica pura y se verifica con tests/rimas.spec.ts contra pares clásicos.
import {
  type Acentuacion,
  type EntradaRima,
  type IndiceRimas,
  type TipoBusqueda,
  buscarRimas,
  indexarBloque,
  indiceVacio,
} from './rimas';

const DICCIONARIO_URL = '/data/diccionario-es.txt';

/** Se indexa por bloques para no congelar la interfaz mientras se prepara */
const TAMANO_BLOQUE = 8000;

/** Resultados que se pintan de golpe; el resto, bajo petición */
const LIMITE_VISIBLE = 300;

const EJEMPLOS = ['corazón', 'cielo', 'vida', 'camino', 'silencio', 'mar'];

const ETIQUETA_ACENTUACION: Record<Acentuacion, string> = {
  aguda: 'aguda',
  llana: 'llana',
  esdrujula: 'esdrújula',
};

type EstadoCarga = 'cargando' | 'indexando' | 'listo' | 'error';

export default function DiccionarioRimasPage() {
  const [consulta, setConsulta] = useState('');
  const [tipo, setTipo] = useState<TipoBusqueda>('consonante');
  const [seseo, setSeseo] = useState(false);
  const [filtroSilabas, setFiltroSilabas] = useState<number | null>(null);
  const [filtroAcentuacion, setFiltroAcentuacion] = useState<Acentuacion | null>(null);
  const [verTodas, setVerTodas] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const [indice, setIndice] = useState<IndiceRimas | null>(null);
  const [estado, setEstado] = useState<EstadoCarga>('cargando');
  const [progreso, setProgreso] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // ── Carga e indexado del diccionario ──────────────────────────────────────
  useEffect(() => {
    let cancelado = false;

    const preparar = async () => {
      try {
        const respuesta = await fetch(DICCIONARIO_URL);
        if (!respuesta.ok) throw new Error('No se pudo descargar el diccionario');
        const texto = await respuesta.text();
        if (cancelado) return;

        const palabras = texto
          .split('\n')
          .map((p) => p.trim())
          .filter(Boolean);

        setEstado('indexando');
        const nuevo = indiceVacio();
        let i = 0;

        // Trocear el trabajo devuelve el hilo al navegador entre bloques:
        // sin esto, indexar 87.000 palabras deja la página sin responder.
        const siguienteBloque = () => {
          if (cancelado) return;
          indexarBloque(nuevo, palabras.slice(i, i + TAMANO_BLOQUE));
          i += TAMANO_BLOQUE;
          setProgreso(Math.min(100, Math.round((i / palabras.length) * 100)));

          if (i < palabras.length) {
            setTimeout(siguienteBloque, 0);
          } else {
            setIndice(nuevo);
            setEstado('listo');
            inputRef.current?.focus();
          }
        };
        setTimeout(siguienteBloque, 0);
      } catch {
        if (!cancelado) setEstado('error');
      }
    };

    preparar();
    return () => {
      cancelado = true;
    };
  }, []);

  // ── Búsqueda ──────────────────────────────────────────────────────────────
  const resultado = useMemo(() => {
    if (!indice || !consulta.trim()) return null;
    return buscarRimas(indice, consulta, tipo, seseo, {
      silabas: filtroSilabas,
      acentuacion: filtroAcentuacion,
    });
  }, [indice, consulta, tipo, seseo, filtroSilabas, filtroAcentuacion]);

  /** Recuentos de sílabas presentes en el resultado, para no ofrecer filtros vacíos */
  const silabasDisponibles = useMemo(() => {
    if (!indice || !consulta.trim()) return [];
    const sinFiltroSilabas = buscarRimas(indice, consulta, tipo, seseo, {
      silabas: null,
      acentuacion: filtroAcentuacion,
    });
    if (!sinFiltroSilabas) return [];
    const cuenta = new Map<number, number>();
    for (const p of sinFiltroSilabas.palabras) {
      cuenta.set(p.silabas, (cuenta.get(p.silabas) ?? 0) + 1);
    }
    return [...cuenta.entries()].sort((a, b) => a[0] - b[0]);
  }, [indice, consulta, tipo, seseo, filtroAcentuacion]);

  // Lista plana: el orden ya viene por calidad de rima desde el motor, y
  // agruparlo por sílabas enterraría las mejores debajo de los monosílabos.
  const visibles = useMemo<EntradaRima[]>(() => {
    if (!resultado) return [];
    return verTodas ? resultado.palabras : resultado.palabras.slice(0, LIMITE_VISIBLE);
  }, [resultado, verTodas]);

  // Cada búsqueda nueva empieza sin filtros heredados ni lista desplegada
  const cambiarConsulta = useCallback((valor: string) => {
    setConsulta(valor);
    setFiltroSilabas(null);
    setFiltroAcentuacion(null);
    setVerTodas(false);
    setCopiado(false);
  }, []);

  const copiarLista = async () => {
    if (!resultado) return;
    try {
      await navigator.clipboard.writeText(resultado.palabras.map((p) => p.palabra).join(', '));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  };

  const relatedApps = getRelatedApps('diccionario-rimas');
  const truncado = resultado ? resultado.palabras.length > LIMITE_VISIBLE && !verTodas : false;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>
          <span aria-hidden="true">🎵</span> Diccionario de Rimas
        </h1>
        <p>
          Escribe una palabra y encuentra con qué rima. Rima consonante y asonante calculadas por
          sonido, no por letras, sobre 87.000 palabras del español.
        </p>
      </header>

      <LegalNotice />

      {/* ── Buscador ────────────────────────────────────────────────────── */}
      <section className={styles.buscador} aria-labelledby="titulo-buscador">
        <h2 id="titulo-buscador" className={styles.visualmenteOculto}>
          Buscar rimas
        </h2>

        <div className={styles.campoFila}>
          <label htmlFor="palabra" className={styles.etiqueta}>
            Palabra con la que quieres rimar
          </label>
          <input
            id="palabra"
            ref={inputRef}
            type="text"
            className={styles.campo}
            value={consulta}
            onChange={(e) => cambiarConsulta(e.target.value)}
            placeholder="corazón"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            disabled={estado !== 'listo'}
            aria-describedby="estado-diccionario"
          />
        </div>

        <div className={styles.ejemplos}>
          <span className={styles.ejemplosLabel}>Prueba con:</span>
          {EJEMPLOS.map((ej) => (
            <button
              key={ej}
              type="button"
              className={styles.chipEjemplo}
              onClick={() => cambiarConsulta(ej)}
              disabled={estado !== 'listo'}
            >
              {ej}
            </button>
          ))}
        </div>

        <p id="estado-diccionario" className={styles.estado} role="status" aria-live="polite">
          {estado === 'cargando' && 'Descargando el diccionario…'}
          {estado === 'indexando' && `Preparando las rimas… ${progreso}%`}
          {estado === 'listo' &&
            indice &&
            `Listo: ${formatNumber(indice.entradas.length, 0)} palabras indexadas`}
          {estado === 'error' &&
            'No se pudo cargar el diccionario. Recarga la página para reintentar.'}
        </p>

        {/* Tipo de rima */}
        <div className={styles.tabs} role="tablist" aria-label="Tipo de rima">
          <button
            type="button"
            role="tab"
            aria-selected={tipo === 'consonante'}
            className={`${styles.tab} ${tipo === 'consonante' ? styles.tabActiva : ''}`}
            onClick={() => {
              setTipo('consonante');
              setVerTodas(false);
            }}
          >
            Rima consonante
            <span className={styles.tabPista}>coinciden todos los sonidos</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tipo === 'asonante'}
            className={`${styles.tab} ${tipo === 'asonante' ? styles.tabActiva : ''}`}
            onClick={() => {
              setTipo('asonante');
              setVerTodas(false);
            }}
          >
            Rima asonante
            <span className={styles.tabPista}>coinciden solo las vocales</span>
          </button>
        </div>

        {/* Pronunciación */}
        <div className={styles.opcionSeseo}>
          <label className={styles.switchEtiqueta} htmlFor="seseo">
            <input
              id="seseo"
              type="checkbox"
              checked={seseo}
              onChange={(e) => setSeseo(e.target.checked)}
            />
            <span>
              Sesear la <strong>z</strong> y la <strong>c</strong> (Latinoamérica, Canarias y parte
              de Andalucía)
            </span>
          </label>
          <p className={styles.opcionAyuda}>
            Con el seseo activado, <em>taza</em> rima con <em>casa</em>. Sin él, no.
          </p>
        </div>
      </section>

      {/* ── Resultado ───────────────────────────────────────────────────── */}
      {resultado && (
        <section className={styles.resultado} aria-live="polite">
          <div className={styles.fichaConsulta}>
            <div className={styles.fichaPalabra}>
              {resultado.consulta.silabas.map((s, i) => (
                <span
                  key={`${s}-${i}`}
                  className={i === resultado.consulta.indiceTonica ? styles.silabaTonica : styles.silaba}
                >
                  {s}
                </span>
              ))}
            </div>
            <p className={styles.fichaDatos}>
              {resultado.consulta.silabas.length}{' '}
              {resultado.consulta.silabas.length === 1 ? 'sílaba' : 'sílabas'} ·{' '}
              {ETIQUETA_ACENTUACION[resultado.consulta.acentuacion]} · rima desde{' '}
              <strong>-{resultado.consulta.nucleo}</strong>
            </p>
          </div>

          {/* Filtros */}
          {resultado.totalSinFiltrar > 0 && (
            <div className={styles.filtros}>
              {silabasDisponibles.length > 1 && (
                <div className={styles.grupoFiltro}>
                  <span className={styles.filtroTitulo}>Sílabas</span>
                  <div className={styles.chips}>
                    <button
                      type="button"
                      className={`${styles.chip} ${filtroSilabas === null ? styles.chipActivo : ''}`}
                      aria-pressed={filtroSilabas === null}
                      onClick={() => setFiltroSilabas(null)}
                    >
                      Todas
                    </button>
                    {silabasDisponibles.map(([n, cuantas]) => (
                      <button
                        key={n}
                        type="button"
                        className={`${styles.chip} ${filtroSilabas === n ? styles.chipActivo : ''}`}
                        aria-pressed={filtroSilabas === n}
                        onClick={() => setFiltroSilabas(filtroSilabas === n ? null : n)}
                      >
                        {n} <span className={styles.chipCuenta}>({cuantas})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.grupoFiltro}>
                <span className={styles.filtroTitulo}>Acentuación</span>
                <div className={styles.chips}>
                  <button
                    type="button"
                    className={`${styles.chip} ${filtroAcentuacion === null ? styles.chipActivo : ''}`}
                    aria-pressed={filtroAcentuacion === null}
                    onClick={() => setFiltroAcentuacion(null)}
                  >
                    Todas
                  </button>
                  {(['aguda', 'llana', 'esdrujula'] as Acentuacion[]).map((a) => (
                    <button
                      key={a}
                      type="button"
                      className={`${styles.chip} ${filtroAcentuacion === a ? styles.chipActivo : ''}`}
                      aria-pressed={filtroAcentuacion === a}
                      onClick={() => setFiltroAcentuacion(filtroAcentuacion === a ? null : a)}
                    >
                      {ETIQUETA_ACENTUACION[a]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Lista */}
          {resultado.palabras.length === 0 ? (
            <p className={styles.vacio}>
              {resultado.totalSinFiltrar === 0 ? (
                <>
                  No hay ninguna palabra que rime en {tipo} con{' '}
                  <strong>{resultado.consulta.palabra}</strong> en este diccionario. Prueba con la
                  otra pestaña: la rima asonante es mucho menos exigente.
                </>
              ) : (
                <>
                  Los filtros dejan fuera las {formatNumber(resultado.totalSinFiltrar, 0)} palabras
                  encontradas. Quita alguno para verlas.
                </>
              )}
            </p>
          ) : (
            <>
              <div className={styles.cabeceraLista}>
                <p className={styles.recuento}>
                  <strong>{formatNumber(resultado.palabras.length, 0)}</strong>{' '}
                  {resultado.palabras.length === 1 ? 'palabra' : 'palabras'} que riman en {tipo} con{' '}
                  <strong>{resultado.consulta.palabra}</strong>
                </p>
                <button type="button" className={styles.btnCopiar} onClick={copiarLista}>
                  <span aria-hidden="true">📋</span> {copiado ? 'Copiado' : 'Copiar lista'}
                </button>
              </div>

              <p className={styles.notaOrden}>
                Ordenadas de rima más rica a más pobre: primero las que comparten más sonido.
              </p>

              <ul className={styles.listaPalabras}>
                {visibles.map((p) => (
                  <li key={p.palabra} className={styles.palabra}>
                    <span className={styles.palabraInicio}>
                      {p.palabra.slice(0, p.palabra.length - p.nucleo.length)}
                    </span>
                    <span className={styles.palabraRima}>{p.nucleo}</span>
                    <span className={styles.palabraSilabas} aria-hidden="true">
                      {p.silabas}
                    </span>
                    <span className={styles.visualmenteOculto}>
                      , {p.silabas} {p.silabas === 1 ? 'sílaba' : 'sílabas'}
                    </span>
                  </li>
                ))}
              </ul>

              {truncado && (
                <div className={styles.masResultados}>
                  <p>
                    Se muestran las primeras {formatNumber(LIMITE_VISIBLE, 0)} de{' '}
                    {formatNumber(resultado.palabras.length, 0)}. Filtra por sílabas para acotar, o
                    míralas todas.
                  </p>
                  <button
                    type="button"
                    className={styles.btnSecundario}
                    onClick={() => setVerTodas(true)}
                  >
                    Ver las {formatNumber(resultado.palabras.length, 0)}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* ── Contenido educativo ─────────────────────────────────────────── */}
      <EducationalSection
        title="Cómo funciona la rima en español"
        subtitle="Consonante, asonante y por qué el oído manda sobre la ortografía"
        icon="🎼"
      >
        <section>
          <h3>
            <span aria-hidden="true">📖</span> La rima empieza en la vocal tónica
          </h3>
          <p>
            Dos palabras riman cuando suenan igual <strong>a partir de su vocal tónica</strong>, la
            de la sílaba que se pronuncia con más fuerza. No a partir de las últimas letras: eso
            haría rimar <em>corazón</em> con <em>bombón</em> (bien) pero también <em>casa</em> con{' '}
            <em>melaza</em> (mal, porque la tónica de una es la <em>a</em> de <em>ca-</em> y la de la
            otra la <em>a</em> de <em>-la-</em>).
          </p>
          <p>
            Por eso el buscador primero divide la palabra en sílabas, localiza cuál lleva el acento
            y solo entonces compara. En <em>corazón</em> rima desde <em>-ón</em>; en <em>cabeza</em>,
            desde <em>-eza</em>; en <em>pájaro</em>, desde <em>-ájaro</em>.
          </p>
        </section>

        <section>
          <h3>
            <span aria-hidden="true">📊</span> Consonante y asonante: qué tiene que coincidir
          </h3>
          <div className={styles.eduTablaWrapper}>
            <table className={styles.eduTabla}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Qué coincide</th>
                  <th>Ejemplo</th>
                  <th>Dificultad</th>
                  <th>Dónde se usa</th>
                  <th>Efecto</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Consonante</strong>
                  </td>
                  <td>Todos los sonidos desde la vocal tónica</td>
                  <td>cielo / vuelo</td>
                  <td>Alta</td>
                  <td>Soneto, décima, cuarteto</td>
                  <td>Sonoridad marcada, muy audible</td>
                </tr>
                <tr>
                  <td>
                    <strong>Asonante</strong>
                  </td>
                  <td>Solo las vocales desde la tónica</td>
                  <td>campo / pájaro</td>
                  <td>Baja</td>
                  <td>Romance, copla, canción popular</td>
                  <td>Musicalidad suave, mucha libertad</td>
                </tr>
                <tr>
                  <td>
                    <strong>Verso libre</strong>
                  </td>
                  <td>Nada: no hay rima</td>
                  <td>— </td>
                  <td>—</td>
                  <td>Poesía contemporánea</td>
                  <td>El ritmo lo dan otros recursos</td>
                </tr>
                <tr>
                  <td>
                    <strong>Rima interna</strong>
                  </td>
                  <td>Igual que las anteriores, dentro del verso</td>
                  <td>«y la <em>mano</em> del <em>hermano</em>»</td>
                  <td>Media</td>
                  <td>Letras de canción, publicidad</td>
                  <td>Engancha sin cerrar el verso</td>
                </tr>
                <tr>
                  <td>
                    <strong>Rima pobre</strong>
                  </td>
                  <td>Terminación gramatical repetida</td>
                  <td>cantaba / bailaba</td>
                  <td>Muy baja</td>
                  <td>Se evita en poesía culta</td>
                  <td>Suena previsible</td>
                </tr>
                <tr>
                  <td>
                    <strong>Rima rica</strong>
                  </td>
                  <td>Coincidencia amplia entre palabras de clase distinta</td>
                  <td>orilla / mejilla</td>
                  <td>Alta</td>
                  <td>Poesía culta</td>
                  <td>Sorprende y sostiene el verso</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3>
            <span aria-hidden="true">🎯</span> Cuatro situaciones típicas
          </h3>
          <ul>
            <li>
              <strong>Escribes un soneto y necesitas cerrar el cuarteto.</strong> Busca en
              consonante y filtra por el número de sílabas que te quedan libres en el endecasílabo.
            </li>
            <li>
              <strong>Escribes una canción y la consonante te suena forzada.</strong> Pasa a
              asonante: te da decenas de opciones y es lo que usa la copla y el romance.
            </li>
            <li>
              <strong>Preparas un ejercicio de clase sobre tipos de rima.</strong> Compara las dos
              pestañas con la misma palabra: se ve de un vistazo cuánto se abre el abanico.
            </li>
            <li>
              <strong>Escribes para público de otro país.</strong> Activa o desactiva el seseo y
              comprueba si tu pareja de rimas funciona en ambas orillas.
            </li>
          </ul>
        </section>

        <section>
          <h3>
            <span aria-hidden="true">🔢</span> Cómo sacarle partido en cinco pasos
          </h3>
          <ol>
            <li>Escribe la palabra que ya tienes fijada al final del verso.</li>
            <li>Empieza por la pestaña de rima consonante: es la más exigente y la más sonora.</li>
            <li>
              Filtra por número de sílabas según lo que te quede libre en el verso; el contador de
              cada botón te dice cuántas opciones hay antes de pulsarlo.
            </li>
            <li>
              Si el filtro deja pocas opciones o todas suenan forzadas, cambia a asonante en lugar
              de retorcer la frase.
            </li>
            <li>
              Con el verso ya escrito, mide su métrica completa en el contador de sílabas para
              confirmar el cómputo con sinalefas.
            </li>
          </ol>
        </section>

        <section>
          <h3>
            <span aria-hidden="true">💡</span> Cuatro trucos que mejoran el resultado
          </h3>
          <ul>
            <li>
              <strong>Rima con palabras de clase distinta.</strong> Un verbo con un sustantivo
              (<em>mirilla</em> / <em>brilla</em>) suena mucho mejor que dos verbos en el mismo
              tiempo.
            </li>
            <li>
              <strong>Huye de las terminaciones gramaticales.</strong> <em>-ando</em>, <em>-aba</em>,{' '}
              <em>-mente</em> o <em>-ción</em> dan miles de rimas, y precisamente por eso suenan
              baratas.
            </li>
            <li>
              <strong>Elige la rima antes de terminar la frase.</strong> Es más fácil construir el
              verso hacia la palabra elegida que buscar una que encaje en lo ya escrito.
            </li>
            <li>
              <strong>Lee en voz alta.</strong> El oído detecta en un segundo lo que una lista no
              puede decirte: si la pareja de rimas suena natural o suena a relleno.
            </li>
          </ul>
        </section>

        <section>
          <h3>
            <span aria-hidden="true">⚠️</span> Cuatro errores frecuentes
          </h3>
          <div className={styles.warningBox}>
            <ul>
              <li>
                <strong>Confundir rima con terminación escrita.</strong> <em>Vaca</em> rima con{' '}
                <em>flaca</em> aunque no compartan ni una consonante; <em>carro</em> no rima con{' '}
                <em>caro</em> aunque solo cambie una letra.
              </li>
              <li>
                <strong>Rimar una palabra consigo misma o con su derivada.</strong> <em>Amor</em> con{' '}
                <em>desamor</em> se considera rima pobre en casi cualquier tradición.
              </li>
              <li>
                <strong>Olvidar el acento final al medir el verso.</strong> Un verso acabado en
                palabra aguda suma una sílaba y uno acabado en esdrújula resta una; la rima puede
                estar bien y el verso cojear igualmente.
              </li>
              <li>
                <strong>Dar por universal la propia pronunciación.</strong> Con distinción,{' '}
                <em>casa</em> y <em>taza</em> no riman; con seseo, sí. Ninguna de las dos variedades
                es la correcta: son distintas.
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h3>
            <span aria-hidden="true">❓</span> Preguntas frecuentes
          </h3>
          <details className={styles.faq}>
            <summary>¿De dónde salen las palabras?</summary>
            <p>
              De un listado de unas 87.000 palabras del español, el mismo que usa el buscador de
              palabras por patrón. Contiene formas de diccionario, así que verás{' '}
              <em>cantar</em> pero no todas sus formas conjugadas. Si buscas una rima que sabes que
              existe y no aparece, es muy probable que sea una forma flexionada.
            </p>
          </details>
          <details className={styles.faq}>
            <summary>¿Por qué la rima asonante no incluye las consonantes?</summary>
            <p>
              Porque toda rima consonante es también asonante, y repetirla en las dos listas solo
              alargaría la segunda. Las que aparecen en la pestaña asonante son las que{' '}
              <em>únicamente</em> asuenan, que es lo que buscas cuando la consonante se te ha
              quedado corta.
            </p>
          </details>
          <details className={styles.faq}>
            <summary>¿La ll y la y riman?</summary>
            <p>
              Sí. El yeísmo (pronunciar <em>ll</em> como <em>y</em>) es hoy mayoritario en casi todo
              el mundo hispanohablante, así que <em>calló</em> y <em>cayó</em> aparecen como rima
              consonante. En las zonas que aún distinguen ambos sonidos, la pareja sonaría como una
              rima muy próxima pero no idéntica.
            </p>
          </details>
          <details className={styles.faq}>
            <summary>¿Sirve para escribir rap o letras de canción?</summary>
            <p>
              Sí, y el filtro por sílabas es especialmente útil ahí: en una letra cantada el número
              de sílabas tiene que encajar con el compás. Ten en cuenta que el rap usa mucho la rima
              asonante y la rima interna, así que la segunda pestaña suele dar más juego que la
              primera.
            </p>
          </details>
          <details className={styles.faq}>
            <summary>¿Se guarda lo que escribo?</summary>
            <p>
              No. Todo el proceso ocurre en tu navegador: el diccionario se descarga una vez y las
              búsquedas se resuelven en tu propio dispositivo. Ninguna palabra que escribas sale de
              él.
            </p>
          </details>
        </section>
      </EducationalSection>

      <RelatedApps apps={relatedApps} />
      <ShareCard appName="diccionario-rimas" />
      <Footer appName="diccionario-rimas" />
    </div>
  );
}
