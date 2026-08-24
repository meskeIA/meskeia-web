'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
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
  ELEMENTOS,
  ORDEN_LLENADO,
  LETRA_L,
  NOMBRE_BLOQUE,
  analizar,
  cajasDeSubnivel,
  capacidad,
  desapareadosDe,
  numOrbitales,
  superindice,
  textoAbreviado,
  textoCompleto,
  textoEspecie,
  textoEspin,
  textoSubnivel,
  nombreEspecie,
  type Bloque,
  type Subnivel,
} from './motor';
import styles from './CalculadoraConfiguracionElectronica.module.css';

// ============================================================
// Posición de cada elemento en la parrilla (se calcula una vez)
// ============================================================

interface Casilla {
  z: number;
  simbolo: string;
  nombre: string;
  bloque: Bloque;
  fila: number;
  columna: number;
}

/**
 * La parrilla no lleva coordenadas escritas a mano: el grupo y el periodo salen
 * del propio motor, que los deduce de la configuración. Las dos series
 * interiores no tienen grupo y se colocan en sus dos filas de abajo.
 */
const CASILLAS: Casilla[] = ELEMENTOS.map((e) => {
  const r = analizar(e.z, 0);
  if (!r) return null;
  if (r.serie === 'lantanidos') {
    return { ...e, bloque: r.bloque, fila: 9, columna: 3 + (e.z - 57) };
  }
  if (r.serie === 'actinidos') {
    return { ...e, bloque: r.bloque, fila: 10, columna: 3 + (e.z - 89) };
  }
  return { ...e, bloque: r.bloque, fila: r.periodo, columna: r.grupo ?? 1 };
}).filter((c): c is Casilla => c !== null);

const EJEMPLOS: { z: number; carga: number; nota: string }[] = [
  { z: 26, carga: 3, nota: 'el ion que pierde antes el 4s que el 3d' },
  { z: 24, carga: 0, nota: 'la excepción más conocida' },
  { z: 29, carga: 2, nota: 'excepción y además ionizada' },
  { z: 8, carga: -2, nota: 'un anión' },
  { z: 46, carga: 0, nota: 'el único con la capa externa vacía' },
  { z: 79, carga: 0, nota: 'excepción por efectos relativistas' },
];

const CARGAS = [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7];

const NOMBRE_SERIE: Record<'lantanidos' | 'actinidos', string> = {
  lantanidos: 'serie de los lantánidos',
  actinidos: 'serie de los actínidos',
};

export default function CalculadoraConfiguracionElectronica() {
  const [z, setZ] = useState(26);
  const [carga, setCarga] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [copiado, setCopiado] = useState('');

  const resultado = useMemo(() => analizar(z, carga), [z, carga]);

  const sugerencias = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return [];
    return ELEMENTOS.filter(
      (e) =>
        e.simbolo.toLowerCase() === q ||
        e.nombre.toLowerCase().startsWith(q) ||
        String(e.z) === q ||
        e.simbolo.toLowerCase().startsWith(q)
    ).slice(0, 8);
  }, [busqueda]);

  const copiar = useCallback(async (texto: string, etiqueta: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(etiqueta);
      window.setTimeout(() => setCopiado(''), 2000);
    } catch {
      setCopiado('');
    }
  }, []);

  const elegirElemento = (nuevoZ: number) => {
    setZ(nuevoZ);
    if (nuevoZ - carga < 1) setCarga(0);
    setBusqueda('');
  };

  if (!resultado) return null;

  const especie = textoEspecie(resultado.elemento.simbolo, carga);
  const nombreLargo = nombreEspecie(resultado.elemento.nombre, carga);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Configuración electrónica</h1>
        <p>
          El llenado de orbitales de cualquier elemento o ion, paso a paso: diagrama de Möller,
          cajas con la regla de Hund y las veinte excepciones que la regla no predice
        </p>
      </header>

      <main className={styles.main}>
        <LegalNotice />

        {/* ---------------- Elegir el elemento ---------------- */}
        <section className={styles.panel} aria-labelledby="titulo-elemento">
          <h2 className={styles.panelTitle} id="titulo-elemento">
            <span aria-hidden="true">🔍</span> Elige un elemento
          </h2>

          <div className={styles.buscadorWrap}>
            <label className={styles.label} htmlFor="buscador">
              Buscar por nombre, símbolo o número atómico
            </label>
            <input
              id="buscador"
              type="search"
              className={styles.buscador}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && sugerencias.length > 0) elegirElemento(sugerencias[0].z);
              }}
              placeholder="hierro, Fe, 26…"
              autoComplete="off"
              enterKeyHint="search"
            />
            {sugerencias.length > 0 && (
              <ul className={styles.sugerencias}>
                {sugerencias.map((s) => (
                  <li key={s.z}>
                    <button
                      type="button"
                      className={styles.sugerencia}
                      onClick={() => elegirElemento(s.z)}
                    >
                      <strong>{s.simbolo}</strong> {s.nombre}{' '}
                      <span className={styles.sugerenciaZ}>Z = {s.z}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.tablaScroll}>
            <div className={styles.tablaPeriodica} role="group" aria-label="Tabla periódica">
              {CASILLAS.map((c) => (
                <button
                  key={c.z}
                  type="button"
                  className={`${styles.casilla} ${styles[`bloque_${c.bloque}`]} ${
                    c.z === z ? styles.casillaActiva : ''
                  }`}
                  style={{ gridColumn: c.columna, gridRow: c.fila }}
                  aria-pressed={c.z === z}
                  aria-label={`${c.nombre}, símbolo ${c.simbolo}, número atómico ${c.z}`}
                  onClick={() => elegirElemento(c.z)}
                >
                  <span className={styles.casillaZ}>{c.z}</span>
                  <span className={styles.casillaSimbolo}>{c.simbolo}</span>
                </button>
              ))}
              <span className={styles.hueco} style={{ gridColumn: 3, gridRow: 6 }} aria-hidden="true">
                57-71
              </span>
              <span className={styles.hueco} style={{ gridColumn: 3, gridRow: 7 }} aria-hidden="true">
                89-103
              </span>
            </div>
          </div>

          <ul className={styles.leyenda}>
            {(['s', 'p', 'd', 'f'] as Bloque[]).map((b) => (
              <li key={b}>
                <span className={`${styles.leyendaColor} ${styles[`bloque_${b}`]}`} aria-hidden="true" />
                Bloque {b}
              </li>
            ))}
          </ul>
        </section>

        {/* ---------------- Carga del ion ---------------- */}
        <section className={styles.panel} aria-labelledby="titulo-carga">
          <h2 className={styles.panelTitle} id="titulo-carga">
            <span aria-hidden="true">⚡</span> ¿Átomo neutro o ion?
          </h2>
          <div className={styles.cargasGrid} role="group" aria-label="Carga del ion">
            {CARGAS.filter((c) => z - c >= 1).map((c) => (
              <button
                key={c}
                type="button"
                className={`${styles.cargaBtn} ${c === carga ? styles.cargaBtnActiva : ''}`}
                aria-pressed={c === carga}
                onClick={() => setCarga(c)}
              >
                {c === 0 ? 'Neutro' : textoEspecie(resultado.elemento.simbolo, c)}
              </button>
            ))}
          </div>
          <p className={styles.hint}>
            La calculadora resuelve la carga que le pidas, exista o no ese ion en la práctica. Los
            estados de oxidación que un elemento adopta de verdad son solo unos pocos.
          </p>
        </section>

        {/* ---------------- Resultado ---------------- */}
        <section className={styles.resultado} aria-labelledby="titulo-resultado">
          <div className={styles.especieCabecera}>
            <div className={`${styles.especieSimbolo} ${styles[`bloque_${resultado.bloque}`]}`}>
              <span className={styles.especieZ}>{z}</span>
              <span className={styles.especieTexto}>{especie}</span>
            </div>
            <div>
              <h2 className={styles.especieNombre} id="titulo-resultado">
                {nombreLargo.charAt(0).toUpperCase() + nombreLargo.slice(1)}
              </h2>
              <p className={styles.especieDatos}>
                {resultado.electrones} electrones · {NOMBRE_BLOQUE[resultado.bloque]} · periodo{' '}
                {resultado.periodo} ·{' '}
                {resultado.grupo !== null
                  ? `grupo ${resultado.grupo}`
                  : NOMBRE_SERIE[resultado.serie ?? 'lantanidos']}
              </p>
            </div>
          </div>

          {resultado.esPrediccion && (
            <p className={styles.avisoPrediccion} role="note">
              <span aria-hidden="true">⚠️</span> A partir del elemento 104 las configuraciones
              publicadas son predicciones teóricas: de estos elementos apenas se han producido unos
              pocos átomos, que además duran fracciones de segundo.
            </p>
          )}

          {/* Las tres formas de escribirla */}
          <div className={styles.configuraciones}>
            <ConfigLinea
              titulo="En orden de llenado"
              ayuda="Como se construye, siguiendo el diagrama de Möller"
              texto={textoCompleto(resultado.porLlenado)}
              copiar={copiar}
              copiado={copiado}
            />
            <ConfigLinea
              titulo="Ordenada por niveles"
              ayuda="Como suele escribirse en los libros y en la tabla periódica"
              texto={textoCompleto(resultado.porNivel)}
              copiar={copiar}
              copiado={copiado}
            />
            <ConfigLinea
              titulo="Abreviada con gas noble"
              ayuda="Los electrones internos, resumidos entre corchetes"
              texto={textoAbreviado(resultado)}
              destacada
              copiar={copiar}
              copiado={copiado}
            />
          </div>

          {/* Aviso de excepción */}
          {resultado.excepcion && resultado.segunMadelung && (
            <div className={styles.avisoExcepcion}>
              <h3 className={styles.avisoTitulo}>
                <span aria-hidden="true">🚩</span> Este elemento es una excepción a la regla
              </h3>
              <p>
                El diagrama de Möller predice{' '}
                <code className={styles.codigo}>{textoCompleto(resultado.segunMadelung)}</code>, pero
                lo que se mide en el laboratorio es{' '}
                <code className={styles.codigo}>{textoCompleto(resultado.porNivel)}</code>:{' '}
                {resultado.excepcion.cuantos === 1 ? 'un electrón pasa' : `${resultado.excepcion.cuantos} electrones pasan`}{' '}
                del {resultado.excepcion.desde.n}
                {LETRA_L[resultado.excepcion.desde.l]} al {resultado.excepcion.hacia.n}
                {LETRA_L[resultado.excepcion.hacia.l]}.
              </p>
              <p>{resultado.excepcion.motivo}</p>
            </div>
          )}

          {/* Aviso de ionización */}
          {carga !== 0 && resultado.cambiosIon.length > 0 && (
            <div className={styles.avisoIon}>
              <h3 className={styles.avisoTitulo}>
                <span aria-hidden="true">🔁</span>{' '}
                {carga > 0 ? 'De dónde salen los electrones' : 'Dónde entran los electrones'}
              </h3>
              <ul className={styles.listaCambios}>
                {resultado.cambiosIon.map((c, i) => (
                  <li key={`${c.n}-${c.l}-${i}`}>
                    {carga > 0 ? 'Salen' : 'Entran'} {c.cuantos}{' '}
                    {c.cuantos === 1 ? 'electrón' : 'electrones'} del{' '}
                    <strong>
                      {c.n}
                      {LETRA_L[c.l]}
                    </strong>
                  </li>
                ))}
              </ul>
              {carga > 0 && (
                <p className={styles.avisoNota}>
                  Los electrones salen del nivel n más alto, no del último subnivel escrito. Es el
                  error clásico con los metales de transición: el 4s se llena antes que el 3d, pero
                  se vacía antes también.
                </p>
              )}
            </div>
          )}

          {/* Cajas de orbitales */}
          <div className={styles.bloqueResultado}>
            <h3 className={styles.subTitulo}>
              <span aria-hidden="true">📦</span> Diagrama de cajas
            </h3>
            <p className={styles.subAyuda}>
              Cada caja es un orbital y cada flecha un electrón. Primero uno en cada caja con el
              mismo giro (regla de Hund) y solo después se emparejan en sentido contrario (principio
              de exclusión de Pauli).
            </p>
            <div className={styles.cajasLista}>
              {resultado.porLlenado.map((s) => (
                <FilaCajas key={`${s.n}-${s.l}`} subnivel={s} />
              ))}
            </div>
          </div>

          {/* Propiedades deducidas */}
          <div className={styles.bloqueResultado}>
            <h3 className={styles.subTitulo}>
              <span aria-hidden="true">🧭</span> Lo que dice esta configuración
            </h3>
            <div className={styles.fichaGrid}>
              <Dato
                etiqueta="Electrones de la capa de valencia"
                valor={String(resultado.capaValencia.electrones)}
                nota={`Los del nivel ${resultado.capaValencia.n}`}
              />
              {resultado.bloque === 'd' && (
                <Dato
                  etiqueta="Electrones de valencia (con el d interno)"
                  valor={String(resultado.electronesValencia)}
                  nota={`Incluye el subnivel ${resultado.periodo - 1}d, que también participa en el enlace`}
                />
              )}
              <Dato
                etiqueta="Electrones desapareados"
                valor={String(resultado.desapareados)}
                nota={resultado.desapareados === 0 ? 'Todos emparejados' : 'Sin pareja en su orbital'}
              />
              <Dato
                etiqueta="Comportamiento magnético"
                valor={resultado.paramagnetico ? 'Paramagnético' : 'Diamagnético'}
                nota={
                  resultado.paramagnetico
                    ? 'Es atraído por un campo magnético'
                    : 'No es atraído: no le quedan electrones sueltos'
                }
              />
              <Dato
                etiqueta="Bloque"
                valor={resultado.bloque}
                nota={`El electrón diferenciador entra en un subnivel ${resultado.bloque}`}
              />
              <Dato
                etiqueta="Periodo"
                valor={String(resultado.periodo)}
                nota="El nivel más externo que se ocupa"
              />
              <Dato
                etiqueta="Grupo"
                valor={resultado.grupo !== null ? String(resultado.grupo) : '—'}
                nota={
                  resultado.grupo !== null
                    ? 'Deducido de los electrones más externos'
                    : `Las dos series interiores no se numeran por grupo (${NOMBRE_SERIE[resultado.serie ?? 'lantanidos']})`
                }
              />
              {resultado.ultimoElectron && (
                <Dato
                  etiqueta="Números cuánticos del último electrón"
                  valor={`n=${resultado.ultimoElectron.n} · l=${resultado.ultimoElectron.l} · mₗ=${resultado.ultimoElectron.ml} · mₛ=${textoEspin(resultado.ultimoElectron.ms)}`}
                  nota={`El de mayor energía de los ocupados: ${resultado.ultimoElectron.n}${LETRA_L[resultado.ultimoElectron.l]}`}
                />
              )}
            </div>
          </div>

          {/* Paso a paso */}
          <div className={styles.bloqueResultado}>
            <h3 className={styles.subTitulo}>
              <span aria-hidden="true">🪜</span> El reparto, paso a paso
            </h3>
            <div className={styles.tableWrapper}>
              <table className={styles.pasoTable}>
                <thead>
                  <tr>
                    <th scope="col">Orden</th>
                    <th scope="col">Subnivel</th>
                    <th scope="col">Caben</th>
                    <th scope="col">Entran</th>
                    <th scope="col">Acumulado</th>
                    <th scope="col">Quedan</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.porLlenado.map((s, i) => {
                    const acumulado = resultado.porLlenado
                      .slice(0, i + 1)
                      .reduce((suma, x) => suma + x.electrones, 0);
                    return (
                      <tr key={`${s.n}-${s.l}`}>
                        <td>{i + 1}</td>
                        <td>
                          <strong>
                            {s.n}
                            {LETRA_L[s.l]}
                          </strong>
                        </td>
                        <td>{capacidad(s.l)}</td>
                        <td>{s.electrones}</td>
                        <td>{acumulado}</td>
                        <td>{resultado.electrones - acumulado}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Diagrama de Möller */}
          <div className={styles.bloqueResultado}>
            <h3 className={styles.subTitulo}>
              <span aria-hidden="true">📐</span> Diagrama de Möller
            </h3>
            <p className={styles.subAyuda}>
              Cada diagonal recorre los subniveles con la misma suma n+l. Se sigue una diagonal
              entera de arriba abajo y se pasa a la siguiente. En verde, los que este{' '}
              {carga === 0 ? 'átomo' : 'ion'} llega a ocupar.
            </p>
            <DiagramaMoller ocupados={resultado.porNivel} />
          </div>
        </section>

        {/* ---------------- Ejemplos ---------------- */}
        <section className={styles.panel} aria-labelledby="titulo-ejemplos">
          <h2 className={styles.panelTitle} id="titulo-ejemplos">
            <span aria-hidden="true">🎯</span> Casos que conviene mirar
          </h2>
          <div className={styles.ejemplosGrid}>
            {EJEMPLOS.map((ej) => {
              const el = ELEMENTOS.find((e) => e.z === ej.z);
              if (!el) return null;
              return (
                <button
                  key={`${ej.z}-${ej.carga}`}
                  type="button"
                  className={styles.ejemploBtn}
                  onClick={() => {
                    setZ(ej.z);
                    setCarga(ej.carga);
                  }}
                >
                  <span className={styles.ejemploEspecie}>{textoEspecie(el.simbolo, ej.carga)}</span>
                  <span className={styles.ejemploNota}>{ej.nota}</span>
                </button>
              );
            })}
          </div>
        </section>

        <EducationalSection
          title="Guía de configuración electrónica"
          subtitle="Del diagrama de Möller a los iones, con los errores que más puntos cuestan"
        >
          <p>
            La configuración electrónica dice en qué orbitales están los electrones de un átomo, y de
            ella se deduce casi todo lo demás: en qué lugar de la tabla periódica cae el elemento,
            cuántos enlaces puede formar, si lo atrae un imán y qué iones tiende a formar. Se
            construye con tres reglas que se aplican en este orden — el principio de Aufbau dice en
            qué subnivel entra cada electrón, el principio de exclusión de Pauli limita a dos
            electrones por orbital y con giros opuestos, y la regla de Hund decide cómo se reparten
            dentro de un mismo subnivel.
          </p>
          <p>
            La primera regla es la que se dibuja como diagrama de Möller: los subniveles se ordenan
            por la suma n+l, y cuando dos empatan va primero el de n más pequeño. De ahí sale la
            secuencia 1s, 2s, 2p, 3s, 3p, 4s, 3d… que sorprende siempre en el mismo punto, cuando el
            4s se cuela por delante del 3d. No es un capricho: 4+0 es menor que 3+2.
          </p>

          <h3 className={styles.eduSubtitle}>Las tres reglas y qué decide cada una</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th scope="col">Regla</th>
                  <th scope="col">Qué decide</th>
                  <th scope="col">En la práctica</th>
                  <th scope="col">Si se olvida</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Principio de Aufbau (orden n+l)</td>
                  <td>En qué subnivel entra el siguiente electrón</td>
                  <td>1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p…</td>
                  <td>Sale el 3d antes que el 4s y todo el periodo 4 queda mal</td>
                </tr>
                <tr>
                  <td>Exclusión de Pauli</td>
                  <td>Cuántos electrones caben en cada orbital</td>
                  <td>Dos como mucho, y con espines opuestos</td>
                  <td>Aparecen subniveles sobrellenos, como un p con 8 electrones</td>
                </tr>
                <tr>
                  <td>Regla de Hund</td>
                  <td>Cómo se reparten dentro de un subnivel</td>
                  <td>Uno en cada orbital antes de emparejar ninguno</td>
                  <td>Se cuentan mal los desapareados y falla el magnetismo</td>
                </tr>
                <tr>
                  <td>Orden de salida al ionizar</td>
                  <td>Qué electrones pierde un catión</td>
                  <td>Primero los del n más alto, aunque se llenaran antes</td>
                  <td>Fe³⁺ sale como [Ar] 3d⁴ 4s² en vez de [Ar] 3d⁵</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className={styles.eduSubtitle}>Cuánto cabe en cada subnivel</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th scope="col">Subnivel</th>
                  <th scope="col">Valor de l</th>
                  <th scope="col">Orbitales</th>
                  <th scope="col">Electrones</th>
                  <th scope="col">Dónde aparece</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>s</td>
                  <td>0</td>
                  <td>1</td>
                  <td>2</td>
                  <td>Desde el nivel 1</td>
                </tr>
                <tr>
                  <td>p</td>
                  <td>1</td>
                  <td>3</td>
                  <td>6</td>
                  <td>Desde el nivel 2</td>
                </tr>
                <tr>
                  <td>d</td>
                  <td>2</td>
                  <td>5</td>
                  <td>10</td>
                  <td>Desde el nivel 3</td>
                </tr>
                <tr>
                  <td>f</td>
                  <td>3</td>
                  <td>7</td>
                  <td>14</td>
                  <td>Desde el nivel 4</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className={styles.eduSubtitle}>Para qué se usa esto</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>Secundaria y preparatoria</h4>
              <p>
                El ejercicio típico pide la configuración de un elemento, su capa de valencia y su
                posición en la tabla. Lo que más se corrige mal es el orden n+l a partir del 4s y el
                recuento de electrones desapareados.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Química general universitaria</h4>
              <p>
                Aquí entran los iones de metales de transición y el magnetismo. Un examen habitual
                pide justificar por qué el Fe³⁺ es más estable de lo que su carga haría esperar: la
                respuesta está en el 3d⁵ semilleno.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Examen de admisión universitaria</h4>
              <p>
                Suelen pedir los cuatro números cuánticos del último electrón y deducir el grupo sin
                mirar la tabla. Las dos cosas salen de la configuración, que es exactamente lo que
                esta calculadora desglosa.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Repaso antes de un examen</h4>
              <p>
                Conviene practicar con las excepciones y con los aniones: son el 20 % de las
                preguntas y donde se pierden más puntos, porque la regla general no basta y hay que
                haberlas visto antes.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Cómo se hace, paso a paso</h3>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                1
              </span>
              <div className={styles.stepContent}>
                <strong>Cuenta los electrones.</strong> En un átomo neutro son tantos como el número
                atómico. En un catión, réstale la carga; en un anión, súmasela. El Fe³⁺ tiene 26 − 3
                = 23 electrones.
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                2
              </span>
              <div className={styles.stepContent}>
                <strong>Reparte siguiendo el orden n+l.</strong> Ve llenando 1s, 2s, 2p, 3s, 3p, 4s,
                3d… hasta agotarlos. Cada subnivel se llena entero antes de pasar al siguiente,
                salvo el último, que se queda a medias.
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                3
              </span>
              <div className={styles.stepContent}>
                <strong>Comprueba si es una excepción.</strong> Son veinte, y las dos que caen en
                todos los exámenes son el cromo y el cobre. Si el elemento está en la lista, un
                electrón del s ha subido al d.
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                4
              </span>
              <div className={styles.stepContent}>
                <strong>Si es un catión, quita los electrones del final.</strong> Del nivel n más
                alto hacia dentro, no del último subnivel que escribiste. Es el paso donde se
                concentran casi todos los errores con metales de transición.
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                5
              </span>
              <div className={styles.stepContent}>
                <strong>Reordena y abrevia.</strong> Para escribirla se suele ordenar por niveles
                (3d antes que 4s) y sustituir el bloque interior por el gas noble anterior entre
                corchetes.
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                6
              </span>
              <div className={styles.stepContent}>
                <strong>Dibuja las cajas si te piden desapareados.</strong> Un subnivel a medias es
                el único que aporta electrones sin pareja, y de ahí sale si la sustancia es
                paramagnética.
              </div>
            </li>
          </ol>

          <h3 className={styles.eduSubtitle}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Por qué unos libros escriben 4s² 3d⁶ y otros 3d⁶ 4s²?</h4>
              <p>
                Porque están respondiendo a dos preguntas distintas. El primero refleja el orden en
                que se llenaron los subniveles, que es como se construye; el segundo los ordena por
                nivel, que es como se leen en la tabla periódica y como se ve qué queda por fuera.
                Las dos son correctas y describen el mismo átomo. Esta calculadora muestra las dos
                para que se vea que no se contradicen.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Si el enunciado pide el orden de llenado, la
                primera; si pide la configuración del elemento, la segunda.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuántas excepciones hay realmente?</h4>
              <p>
                Veinte entre los elementos cuyo comportamiento se ha podido medir: cromo, cobre,
                niobio, molibdeno, rutenio, rodio, paladio, plata, lantano, cerio, gadolinio,
                platino, oro, actinio, torio, protactinio, uranio, neptunio, curio y laurencio. La
                más llamativa es el paladio, único elemento que deja su capa más externa vacía.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué el orden de llenado no sirve para ionizar?</h4>
              <p>
                Porque el orden de energías cambia cuando los orbitales ya están ocupados. El 4s está
                por debajo del 3d mientras ambos están vacíos, pero una vez llenos la situación se
                invierte y el 4s pasa a ser el más externo. Por eso entra antes y sale antes, que
                suena contradictorio hasta que se entiende que son dos momentos distintos.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Regla práctica para cationes: el electrón que sale
                es siempre el del número n más grande.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué significa que un elemento sea del bloque d?</h4>
              <p>
                Que el electrón que lo distingue del elemento anterior entra en un subnivel d. Los
                bloques s y p forman los elementos representativos, el d los metales de transición y
                el f los lantánidos y actínidos. El bloque coincide con la zona de la tabla
                periódica donde cae el elemento, y por eso la configuración permite situarlo sin
                mirar ninguna tabla.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Se puede saber el grupo a partir de la configuración?</h4>
              <p>
                Sí, y es una pregunta habitual. En el bloque s el grupo es el número de electrones
                del subnivel s más externo (1 o 2). En el bloque p se suman los del s y el p de ese
                nivel y se le añade 10. En el bloque d se suman los del s más externo y los del d
                anterior. Las dos series interiores, lantánidos y actínidos, no se numeran por grupo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Los aniones también tienen excepciones?</h4>
              <p>
                En la práctica no. Los aniones estables los forman los no metales de los bloques s y
                p, donde la regla general funciona sin sobresaltos: los electrones añadidos completan
                el subnivel p y el resultado es la configuración del gas noble siguiente. Las
                excepciones se concentran en los metales de transición y en las series interiores,
                que forman cationes, no aniones.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Cómo estudiarlo mejor</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ✍️
              </span>
              <div>
                <strong>Dibuja el diagrama antes de empezar</strong>
                <p>
                  Escribir las filas 1s / 2s 2p / 3s 3p 3d… y trazar las diagonales cuesta veinte
                  segundos y evita el error más caro del ejercicio. En un examen se puede rehacer de
                  memoria.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔢
              </span>
              <div>
                <strong>Comprueba la suma al final</strong>
                <p>
                  Los superíndices tienen que sumar exactamente el número de electrones de la
                  especie. Es una comprobación de cinco segundos que detecta la mayoría de los
                  fallos de reparto.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🧲
              </span>
              <div>
                <strong>Asocia desapareados y magnetismo</strong>
                <p>
                  Si queda algún electrón sin pareja, la sustancia es paramagnética. Recordarlo así
                  ahorra memorizar listas: el dato sale de las cajas que acabas de dibujar.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🎯
              </span>
              <div>
                <strong>Memoriza solo cromo y cobre</strong>
                <p>
                  De las veinte excepciones, esas dos son las que caen en la práctica totalidad de
                  los exámenes de secundaria. Las demás conviene reconocerlas, no aprenderlas de
                  memoria.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🧪
              </span>
              <div>
                <strong>Practica con iones desde el principio</strong>
                <p>
                  Casi nadie falla el hierro neutro y casi todo el mundo falla el Fe³⁺. Empezar por
                  los iones invierte el tiempo donde de verdad se pierden puntos.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                📋
              </span>
              <div>
                <strong>Escribe siempre las dos notaciones</strong>
                <p>
                  La completa demuestra que sabes construirla y la abreviada que entiendes qué parte
                  es la que reacciona. Muchos criterios de corrección puntúan las dos por separado.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.warningBox}>
            <h4 className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">
                ⚠️
              </span>
              Los errores que más se repiten
            </h4>
            <ul className={styles.warningList}>
              <li>
                <strong>Vaciar el 3d antes que el 4s al formar un catión.</strong> Es el error número
                uno con los metales de transición. El Fe²⁺ es [Ar] 3d⁶, no [Ar] 3d⁴ 4s².
              </li>
              <li>
                <strong>Aplicar la regla general al cromo y al cobre.</strong> Sus configuraciones
                reales son [Ar] 3d⁵ 4s¹ y [Ar] 3d¹⁰ 4s¹, con un solo electrón en el 4s.
              </li>
              <li>
                <strong>Emparejar electrones antes de tiempo.</strong> En un subnivel p con tres
                electrones hay tres desapareados, no uno emparejado y otro suelto.
              </li>
              <li>
                <strong>Abreviar con un elemento que no es gas noble.</strong> Los corchetes solo
                admiten He, Ne, Ar, Kr, Xe, Rn y Og; escribir [Fe] o [Ca] no significa nada.
              </li>
              <li>
                <strong>Contar el d interno como capa de valencia en el bloque p.</strong> En el
                bromo, el 3d¹⁰ ya es interior: sus electrones de valencia son los siete del nivel 4.
              </li>
              <li>
                <strong>Deducir el periodo del nivel más alto ocupado.</strong> El paladio deja su 5s
                vacío y aun así está en el periodo 5, no en el 4.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('calculadora-configuracion-electronica')} />
        <ShareCard appName="calculadora-configuracion-electronica" />
      </main>

      <Footer appName="calculadora-configuracion-electronica" />
    </div>
  );
}

// ============================================================
// Piezas de presentación
// ============================================================

function ConfigLinea({
  titulo,
  ayuda,
  texto,
  destacada,
  copiar,
  copiado,
}: {
  titulo: string;
  ayuda: string;
  texto: string;
  destacada?: boolean;
  copiar: (texto: string, etiqueta: string) => void;
  copiado: string;
}) {
  return (
    <div className={`${styles.configLinea} ${destacada ? styles.configDestacada : ''}`}>
      <div className={styles.configCabecera}>
        <h3 className={styles.configTitulo}>{titulo}</h3>
        <button
          type="button"
          className={styles.copiarBtn}
          onClick={() => copiar(texto, titulo)}
          aria-label={`Copiar la configuración en orden ${titulo.toLowerCase()}`}
        >
          {copiado === titulo ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <p className={styles.configTexto}>{texto}</p>
      <p className={styles.configAyuda}>{ayuda}</p>
      {copiado === titulo && (
        <span role="status" className={styles.visualmenteOculto}>
          Configuración copiada al portapapeles
        </span>
      )}
    </div>
  );
}

function FilaCajas({ subnivel }: { subnivel: Subnivel }) {
  const cajas = cajasDeSubnivel(subnivel.l, subnivel.electrones);
  const sueltos = desapareadosDe(subnivel.l, subnivel.electrones);
  return (
    <div className={styles.filaCajas}>
      <span className={styles.filaEtiqueta}>{textoSubnivel(subnivel)}</span>
      <span
        className={styles.cajasGrupo}
        role="img"
        aria-label={`${subnivel.n}${LETRA_L[subnivel.l]} con ${subnivel.electrones} ${
          subnivel.electrones === 1 ? 'electrón' : 'electrones'
        } en ${numOrbitales(subnivel.l)} ${numOrbitales(subnivel.l) === 1 ? 'orbital' : 'orbitales'}, ${sueltos} sin pareja`}
      >
        {cajas.map((n, i) => (
          <span key={i} className={styles.caja} aria-hidden="true">
            <span className={styles.flecha}>{n >= 1 ? '↑' : ''}</span>
            <span className={styles.flecha}>{n === 2 ? '↓' : ''}</span>
          </span>
        ))}
      </span>
      <span className={styles.filaNota}>
        {sueltos === 0 ? 'sin electrones sueltos' : `${sueltos} sin pareja`}
      </span>
    </div>
  );
}

function Dato({ etiqueta, valor, nota }: { etiqueta: string; valor: string; nota: string }) {
  return (
    <div className={styles.datoCard}>
      <span className={styles.datoEtiqueta}>{etiqueta}</span>
      <span className={styles.datoValor}>{valor}</span>
      <span className={styles.datoNota}>{nota}</span>
    </div>
  );
}

function DiagramaMoller({ ocupados }: { ocupados: Subnivel[] }) {
  const nMax = 7;
  const ocupado = (n: number, l: number) => ocupados.some((s) => s.n === n && s.l === l);
  const orden = (n: number, l: number) =>
    ORDEN_LLENADO.findIndex((o) => o.n === n && o.l === l) + 1;

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.mollerTable}>
        <caption className={styles.visualmenteOculto}>
          Diagrama de Möller: subniveles por nivel y tipo, numerados en su orden de llenado
        </caption>
        <thead>
          <tr>
            <th scope="col">Nivel</th>
            {LETRA_L.map((letra) => (
              <th scope="col" key={letra}>
                {letra}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: nMax }, (_, i) => i + 1).map((n) => (
            <tr key={n}>
              <th scope="row">{n}</th>
              {LETRA_L.map((letra, l) => {
                const existe = l < n && orden(n, l) > 0;
                if (!existe) return <td key={letra} className={styles.mollerVacia} />;
                return (
                  <td
                    key={letra}
                    className={`${styles.mollerCelda} ${ocupado(n, l) ? styles.mollerOcupada : ''}`}
                  >
                    <span className={styles.mollerSubnivel}>
                      {n}
                      {letra}
                    </span>
                    <span className={styles.mollerOrden}>
                      {orden(n, l)}.º · n+l = {n + l}
                    </span>
                    {ocupado(n, l) && (
                      <span className={styles.mollerElectrones}>
                        {superindice(ocupados.find((s) => s.n === n && s.l === l)?.electrones ?? 0)}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
