'use client';
// @disclaimer: exempt

import { useCallback, useRef, useState } from 'react';
import styles from './NormalizacionBasesDatos.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  analizar,
  cierreExplicado,
  formatearDF,
  parsearAtributos,
  parsearDependencias,
  MAX_ATRIBUTOS,
  type AnalisisRelacion,
  type DependenciaFuncional,
  type FormaNormal,
  type PasoCierre,
  type Violacion,
} from './motor';

/** Un ejemplo precargado, con el resultado que el motor debe dar (viene de los casos resueltos a mano). */
interface Ejemplo {
  id: string;
  nombre: string;
  pista: string;
  atributos: string;
  dependencias: string;
}

const EJEMPLOS: Ejemplo[] = [
  {
    id: 'parcial',
    nombre: 'Dependencia parcial',
    pista: 'Se queda en 1FN: un dato depende solo de PARTE de la clave.',
    atributos: 'Pedido, Producto, Cantidad, NombreProducto',
    dependencias: 'Pedido,Producto → Cantidad\nProducto → NombreProducto',
  },
  {
    id: 'transitiva',
    nombre: 'Dependencia transitiva',
    pista: 'Llega a 2FN pero no a 3FN: un dato depende de otro dato que no es clave.',
    atributos: 'Empleado, Departamento, Ciudad',
    dependencias: 'Empleado → Departamento\nDepartamento → Ciudad',
  },
  {
    id: 'bcnf',
    nombre: '3FN pero no BCNF',
    pista: 'El caso que más cuesta: todos los atributos son primos y aun así falla BCNF.',
    atributos: 'Estudiante, Asignatura, Profesor',
    dependencias: 'Estudiante,Asignatura → Profesor\nProfesor → Asignatura',
  },
  {
    id: 'bcnf-ok',
    nombre: 'Ya está en BCNF',
    pista: 'Una relación sana: toda dependencia arranca de una superclave.',
    atributos: 'Factura, Cliente, Fecha, Total',
    dependencias: 'Factura → Cliente, Fecha, Total',
  },
];

/** Los cuatro peldaños de la escalera, en orden. */
const ESCALERA: { forma: FormaNormal; titulo: string; regla: string }[] = [
  {
    forma: '1FN',
    titulo: 'Primera forma normal',
    regla: 'Cada celda guarda un solo valor atómico: nada de listas ni de campos repetidos.',
  },
  {
    forma: '2FN',
    titulo: 'Segunda forma normal',
    regla: 'Ningún atributo no primo depende solo de una PARTE de una clave candidata.',
  },
  {
    forma: '3FN',
    titulo: 'Tercera forma normal',
    regla: 'Ningún atributo no primo depende de otro atributo que no sea superclave.',
  },
  {
    forma: 'BCNF',
    titulo: 'Forma normal de Boyce-Codd',
    regla: 'TODA dependencia no trivial arranca de una superclave, sin excepciones.',
  },
];

/** Resultado de la calculadora de cierre, ya listo para pintar. */
interface ResultadoCierre {
  conjunto: string[];
  resultado: string[];
  pasos: PasoCierre[];
  esSuperclave: boolean;
}

const enMinusculas = (lista: string[]) => new Set(lista.map((a) => a.trim().toLowerCase()));

export default function NormalizacionBasesDatosPage() {
  const [textoAtributos, setTextoAtributos] = useState('');
  const [textoDependencias, setTextoDependencias] = useState('');
  const [ejemploActivo, setEjemploActivo] = useState<string | null>(null);

  // Instantánea analizada: la calculadora de cierre trabaja sobre ESTO, no sobre lo que
  // haya a medio escribir en los campos, para que las dos mitades nunca se contradigan.
  const [atributos, setAtributos] = useState<string[]>([]);
  const [dependencias, setDependencias] = useState<DependenciaFuncional[]>([]);
  const [descartadas, setDescartadas] = useState<string[]>([]);
  const [analisis, setAnalisis] = useState<AnalisisRelacion | null>(null);

  const [textoCierre, setTextoCierre] = useState('');
  const [errorCierre, setErrorCierre] = useState('');
  const [resultadoCierre, setResultadoCierre] = useState<ResultadoCierre | null>(null);

  const refDependencias = useRef<HTMLTextAreaElement>(null);

  const ejecutarAnalisis = useCallback((entradaAtributos: string, entradaDependencias: string) => {
    const listaAtributos = parsearAtributos(entradaAtributos);
    const leidas = parsearDependencias(entradaDependencias);

    setAtributos(listaAtributos);
    setDependencias(leidas.dependencias);
    setDescartadas(leidas.descartadas);
    setAnalisis(analizar(listaAtributos, leidas.dependencias));

    // Un análisis nuevo invalida el cierre anterior: hablaba de otra relación.
    setResultadoCierre(null);
    setErrorCierre('');
  }, []);

  const cargarEjemplo = (ejemplo: Ejemplo) => {
    setTextoAtributos(ejemplo.atributos);
    setTextoDependencias(ejemplo.dependencias);
    setEjemploActivo(ejemplo.id);
    setTextoCierre('');
    ejecutarAnalisis(ejemplo.atributos, ejemplo.dependencias);
  };

  const insertarFlecha = () => {
    const campo = refDependencias.current;
    setEjemploActivo(null);
    if (!campo) {
      setTextoDependencias((texto) => `${texto} → `);
      return;
    }
    const inicio = campo.selectionStart;
    const fin = campo.selectionEnd;
    const nuevo = `${textoDependencias.slice(0, inicio)} → ${textoDependencias.slice(fin)}`;
    setTextoDependencias(nuevo);
    const posicion = inicio + 3;
    requestAnimationFrame(() => {
      campo.focus();
      campo.setSelectionRange(posicion, posicion);
    });
  };

  const limpiar = () => {
    setTextoAtributos('');
    setTextoDependencias('');
    setEjemploActivo(null);
    setAtributos([]);
    setDependencias([]);
    setDescartadas([]);
    setAnalisis(null);
    setTextoCierre('');
    setErrorCierre('');
    setResultadoCierre(null);
  };

  const calcularCierre = () => {
    const conjunto = parsearAtributos(textoCierre);
    setResultadoCierre(null);

    if (atributos.length === 0) {
      setErrorCierre('Antes analiza una relación: el cierre se calcula con SUS dependencias.');
      return;
    }
    if (conjunto.length === 0) {
      setErrorCierre('Escribe al menos un atributo, por ejemplo «Pedido» o «Pedido, Producto».');
      return;
    }
    const conocidos = enMinusculas(atributos);
    const desconocido = conjunto.find((a) => !conocidos.has(a.trim().toLowerCase()));
    if (desconocido) {
      setErrorCierre(`El atributo «${desconocido}» no está en la relación analizada.`);
      return;
    }

    const { resultado, pasos } = cierreExplicado(conjunto, dependencias, atributos);
    const alcanzados = enMinusculas(resultado);
    const esSuperclave = atributos.every((a) => alcanzados.has(a.trim().toLowerCase()));

    setErrorCierre('');
    setResultadoCierre({ conjunto, resultado, pasos, esSuperclave });
  };

  const indiceAlcanzado = analisis ? ESCALERA.findIndex((peldano) => peldano.forma === analisis.formaNormal) : -1;
  const noPrimos = analisis ? analisis.atributos.filter((a) => !enMinusculas(analisis.primos).has(a.toLowerCase())) : [];

  const violacionesDe = (forma: FormaNormal): Violacion[] => {
    if (!analisis) return [];
    if (forma === '2FN') return analisis.violaciones2FN;
    if (forma === '3FN') return analisis.violaciones3FN;
    if (forma === 'BCNF') return analisis.violacionesBCNF;
    return [];
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">🗂️</span> Normalización de Bases de Datos
        </h1>
        <p className={styles.subtitle}>
          Escribe los atributos de una tabla y sus dependencias funcionales: te dice en qué forma normal está
          (1FN, 2FN, 3FN o BCNF), cuáles son sus claves candidatas y, sobre todo, POR QUÉ no sube más.
        </p>
      </header>

      <LegalNotice lastUpdated="2026-09-05" />

      {/* ── Ejemplos ─────────────────────────────────────────────── */}
      <section className={styles.panel} aria-labelledby="titulo-ejemplos">
        <h2 id="titulo-ejemplos" className={styles.panelTitulo}>
          <span aria-hidden="true">🎯</span> Empieza por un ejemplo resuelto
        </h2>
        <p className={styles.panelAyuda}>
          Cuatro relaciones clásicas de clase, cada una con un defecto distinto. Cárgalas y mira el diagnóstico.
        </p>
        <div className={styles.ejemplos}>
          {EJEMPLOS.map((ejemplo) => (
            <button
              key={ejemplo.id}
              type="button"
              className={`${styles.ejemploBtn} ${ejemploActivo === ejemplo.id ? styles.ejemploActivo : ''}`}
              aria-pressed={ejemploActivo === ejemplo.id}
              onClick={() => cargarEjemplo(ejemplo)}
            >
              <span className={styles.ejemploNombre}>{ejemplo.nombre}</span>
              <span className={styles.ejemploPista}>{ejemplo.pista}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Entrada ──────────────────────────────────────────────── */}
      <section className={styles.panel} aria-labelledby="titulo-entrada">
        <h2 id="titulo-entrada" className={styles.panelTitulo}>
          <span aria-hidden="true">✍️</span> 1. Describe la relación
        </h2>

        <div className={styles.campo}>
          <label className={styles.etiqueta} htmlFor="campo-atributos">
            Atributos de la relación
          </label>
          <input
            id="campo-atributos"
            type="text"
            className={styles.input}
            value={textoAtributos}
            placeholder="Pedido, Producto, Cantidad, NombreProducto"
            autoComplete="off"
            onChange={(e) => {
              setTextoAtributos(e.target.value);
              setEjemploActivo(null);
            }}
          />
          <p className={styles.pistaCampo}>
            Separados por coma, punto y coma o espacio. Máximo {MAX_ATRIBUTOS}: las claves se buscan por
            subconjuntos y su número crece en 2ⁿ.
          </p>
        </div>

        <div className={styles.campo}>
          <div className={styles.etiquetaFila}>
            <label className={styles.etiqueta} htmlFor="campo-dependencias">
              Dependencias funcionales (una por línea)
            </label>
            <button type="button" className={styles.btnFlecha} onClick={insertarFlecha}>
              Insertar →
            </button>
          </div>
          <textarea
            id="campo-dependencias"
            ref={refDependencias}
            className={styles.textarea}
            rows={5}
            value={textoDependencias}
            placeholder={'Pedido,Producto → Cantidad\nProducto → NombreProducto'}
            spellCheck={false}
            onChange={(e) => {
              setTextoDependencias(e.target.value);
              setEjemploActivo(null);
            }}
          />
          <p className={styles.pistaCampo}>
            Vale escribir la flecha como <code>-&gt;</code>, <code>--&gt;</code> o <code>→</code>. A la izquierda,
            los atributos que determinan; a la derecha, los determinados.
          </p>
        </div>

        <div className={styles.acciones}>
          <button type="button" className={styles.btnPrimario} onClick={() => ejecutarAnalisis(textoAtributos, textoDependencias)}>
            Analizar relación
          </button>
          <button type="button" className={styles.btnSecundario} onClick={limpiar}>
            Limpiar
          </button>
        </div>
      </section>

      {/* ── Líneas no entendidas ─────────────────────────────────── */}
      {descartadas.length > 0 && (
        <div className={styles.descartadas} role="alert">
          <p className={styles.descartadasTitulo}>
            <span aria-hidden="true">⚠️</span>{' '}
            {descartadas.length === 1
              ? 'Hay 1 línea que no he sabido leer y NO se ha tenido en cuenta:'
              : `Hay ${descartadas.length} líneas que no he sabido leer y NO se han tenido en cuenta:`}
          </p>
          <ul className={styles.descartadasLista}>
            {descartadas.map((linea, i) => (
              <li key={`${linea}-${i}`}>
                <code>{linea}</code>
              </li>
            ))}
          </ul>
          <p className={styles.descartadasPie}>
            A una dependencia le hace falta una flecha y algo a cada lado: <code>Pedido,Producto → Cantidad</code>.
          </p>
        </div>
      )}

      {/* ── Error de la relación ─────────────────────────────────── */}
      {analisis && !analisis.ok && (
        <div className={styles.errorBox} role="alert">
          <p className={styles.errorTitulo}>
            <span aria-hidden="true">🚫</span> No se puede analizar la relación
          </p>
          <p className={styles.errorTexto}>{analisis.error}</p>
        </div>
      )}

      {/* ── Resultados ───────────────────────────────────────────── */}
      {analisis !== null && analisis.ok && (
        <section className={styles.panel} aria-labelledby="titulo-resultado">
          <h2 id="titulo-resultado" className={styles.panelTitulo}>
            <span aria-hidden="true">📋</span> 2. Diagnóstico
          </h2>

          <div className={styles.veredicto} data-forma={analisis.formaNormal}>
            <span className={styles.veredictoEtiqueta}>Forma normal alcanzada</span>
            <span className={styles.veredictoValor}>{analisis.formaNormal}</span>
            <p className={styles.veredictoExplicacion}>{analisis.explicacion}</p>
          </div>

          <div className={styles.rejillaClaves}>
            <div className={styles.tarjetaClaves}>
              <h3 className={styles.subtitulo}>
                {analisis.claves.length === 1 ? 'Clave candidata' : `Claves candidatas (${analisis.claves.length})`}
              </h3>
              <ul className={styles.listaClaves}>
                {analisis.claves.map((clave) => (
                  <li key={clave.join(',')} className={styles.clave}>
                    {clave.map((atributo) => (
                      <span key={atributo} className={styles.chipClave}>
                        {atributo}
                      </span>
                    ))}
                  </li>
                ))}
              </ul>
              <p className={styles.pistaCampo}>
                Conjuntos mínimos que determinan toda la fila. Quitarles un atributo los deja sin determinar todo.
              </p>
            </div>

            <div className={styles.tarjetaClaves}>
              <h3 className={styles.subtitulo}>Atributos primos y no primos</h3>
              <p className={styles.grupoAtributos}>
                <span className={styles.grupoEtiqueta}>Primos (están en alguna clave):</span>{' '}
                {analisis.primos.length > 0 ? (
                  analisis.primos.map((atributo) => (
                    <span key={atributo} className={styles.chipPrimo}>
                      {atributo}
                    </span>
                  ))
                ) : (
                  <span className={styles.sinDatos}>ninguno</span>
                )}
              </p>
              <p className={styles.grupoAtributos}>
                <span className={styles.grupoEtiqueta}>No primos:</span>{' '}
                {noPrimos.length > 0 ? (
                  noPrimos.map((atributo) => (
                    <span key={atributo} className={styles.chipNoPrimo}>
                      {atributo}
                    </span>
                  ))
                ) : (
                  <span className={styles.sinDatos}>ninguno: todos los atributos son primos</span>
                )}
              </p>
              <p className={styles.pistaCampo}>
                2FN y 3FN solo hablan de los NO primos. Si no hay ninguno, las dos se cumplen por definición.
              </p>
            </div>
          </div>

          {dependencias.length > 0 && (
            <div className={styles.tarjetaClaves}>
              <h3 className={styles.subtitulo}>Así he leído las dependencias</h3>
              <ul className={styles.listaDependencias}>
                {dependencias.map((df, i) => (
                  <li key={`${formatearDF(df)}-${i}`}>
                    <code>{formatearDF(df)}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <h3 className={styles.subtituloEscalera}>La escalera, peldaño a peldaño</h3>
          <ol className={styles.escalera}>
            {ESCALERA.map((peldano, indice) => {
              const cumple = indice <= indiceAlcanzado;
              const esElQueFalla = indice === indiceAlcanzado + 1;
              const estado = cumple ? 'cumple' : esElQueFalla ? 'falla' : 'arrastre';
              const violaciones = violacionesDe(peldano.forma);
              return (
                <li key={peldano.forma} className={styles.peldano} data-estado={estado}>
                  <div className={styles.peldanoCabecera}>
                    <span className={styles.peldanoMarca} aria-hidden="true">
                      {cumple ? '✔' : esElQueFalla ? '✘' : '·'}
                    </span>
                    <span className={styles.peldanoForma}>{peldano.forma}</span>
                    <span className={styles.peldanoTitulo}>{peldano.titulo}</span>
                    <span className={styles.peldanoEstado}>
                      {cumple ? 'Se cumple' : esElQueFalla ? 'Aquí se rompe' : 'No se alcanza (falla una anterior)'}
                    </span>
                  </div>
                  <p className={styles.peldanoRegla}>{peldano.regla}</p>
                  {peldano.forma === '1FN' && (
                    <p className={styles.peldanoNota}>
                      Se da por supuesta: que los valores sean atómicos no se deduce de las dependencias, es una
                      decisión del diseño de las columnas que hay que revisar mirando la tabla.
                    </p>
                  )}
                  {violaciones.length > 0 && (
                    <ul className={styles.violaciones}>
                      {violaciones.map((violacion, i) => (
                        <li key={`${violacion.dependencia}-${i}`} className={styles.violacion}>
                          <code className={styles.violacionDf}>{violacion.dependencia}</code>
                          <span className={styles.violacionMotivo}>{violacion.motivo}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* ── Calculadora de cierre ────────────────────────────────── */}
      <section className={styles.panel} aria-labelledby="titulo-cierre">
        <h2 id="titulo-cierre" className={styles.panelTitulo}>
          <span aria-hidden="true">🧮</span> 3. Calculadora de cierre de atributos
        </h2>
        <p className={styles.panelAyuda}>
          Escribe un conjunto de atributos y verás paso a paso todo lo que se deduce de él con las dependencias de
          la relación analizada. Es la herramienta con la que se comprueba si algo es superclave.
        </p>

        <div className={styles.filaCierre}>
          <div className={styles.campoCierre}>
            <label className={styles.etiqueta} htmlFor="campo-cierre">
              Conjunto de partida
            </label>
            <input
              id="campo-cierre"
              type="text"
              className={styles.input}
              value={textoCierre}
              placeholder={atributos.length > 0 ? atributos.slice(0, 2).join(', ') : 'Analiza primero una relación'}
              autoComplete="off"
              onChange={(e) => setTextoCierre(e.target.value)}
            />
          </div>
          <button type="button" className={styles.btnPrimario} onClick={calcularCierre}>
            Calcular cierre
          </button>
        </div>

        {errorCierre !== '' && (
          <p className={styles.errorLinea} role="alert">
            <span aria-hidden="true">⚠️</span> {errorCierre}
          </p>
        )}

        {resultadoCierre && (
          <div className={styles.resultadoCierre}>
            <p className={styles.cierreFormula}>
              <code>
                {'{'}
                {resultadoCierre.conjunto.join(', ')}
                {'}'}
                <sup>+</sup> = {'{'}
                {resultadoCierre.resultado.join(', ')}
                {'}'}
              </code>
            </p>

            {resultadoCierre.pasos.length === 0 ? (
              <p className={styles.cierreSinPasos}>
                Ninguna dependencia se puede aplicar a este conjunto: el cierre se queda igual que la entrada.
              </p>
            ) : (
              <ol className={styles.pasos}>
                {resultadoCierre.pasos.map((paso, i) => (
                  <li key={`${paso.dependencia}-${i}`} className={styles.paso}>
                    <span className={styles.pasoDf}>
                      <code>{paso.dependencia}</code>
                    </span>
                    <span className={styles.pasoAnadidos}>
                      añade {paso.anadidos.map((a) => <span key={a} className={styles.chipAnadido}>{a}</span>)}
                    </span>
                    <span className={styles.pasoAcumulado}>
                      ahora tenemos {'{'}
                      {paso.acumulado.join(', ')}
                      {'}'}
                    </span>
                  </li>
                ))}
              </ol>
            )}

            <p className={styles.veredictoCierre} data-superclave={resultadoCierre.esSuperclave ? 'si' : 'no'}>
              {resultadoCierre.esSuperclave ? (
                <>
                  <span aria-hidden="true">✔</span> Su cierre llega a TODOS los atributos, así que{' '}
                  <strong>
                    {'{'}
                    {resultadoCierre.conjunto.join(', ')}
                    {'}'} es superclave
                  </strong>
                  . Será además clave candidata si ningún subconjunto suyo lo consigue también.
                </>
              ) : (
                <>
                  <span aria-hidden="true">✘</span> Su cierre NO llega a todos los atributos, así que{' '}
                  <strong>
                    {'{'}
                    {resultadoCierre.conjunto.join(', ')}
                    {'}'} no es superclave
                  </strong>
                  . Le faltan:{' '}
                  {atributos
                    .filter((a) => !enMinusculas(resultadoCierre.resultado).has(a.toLowerCase()))
                    .join(', ')}
                  .
                </>
              )}
            </p>
          </div>
        )}
      </section>

      {/* ── Guía educativa ──────────────────────────────────────── */}
      <EducationalSection
        title="Guía completa de normalización relacional"
        subtitle="Dependencias funcionales, cierres, claves y las cuatro formas normales, con ejemplos"
      >
        <section className={styles.guia}>
          <h2>Qué es una dependencia funcional</h2>
          <p>
            Una dependencia funcional <code>X → Y</code> dice que si dos filas coinciden en los atributos de{' '}
            <code>X</code>, forzosamente coinciden en los de <code>Y</code>. No es una observación sobre los datos
            que hoy hay en la tabla: es una <strong>regla del negocio</strong> que debe cumplirse siempre.
          </p>
          <p>
            En una tabla de matrículas, <code>CodigoAlumno → NombreAlumno</code> se cumple porque un código
            identifica a una persona. Al revés no: dos personas pueden llamarse igual, así que{' '}
            <code>NombreAlumno → CodigoAlumno</code> sería falso. Toda la normalización se apoya en esta lista de
            reglas; si están mal escritas, el diagnóstico saldrá mal por muy bien que se calcule.
          </p>
          <p>
            Una dependencia es <strong>trivial</strong> cuando la parte derecha ya está dentro de la izquierda
            (<code>A,B → A</code>). Se cumple siempre y no viola ninguna forma normal, así que el análisis la
            ignora.
          </p>

          <h2>El cierre de atributos y para qué sirve</h2>
          <p>
            El cierre de un conjunto <code>X</code>, escrito <code>X⁺</code>, es todo lo que se puede deducir a
            partir de <code>X</code> aplicando las dependencias una y otra vez hasta que deja de crecer. Es el
            cálculo central: con él se responde a casi todo lo demás.
          </p>
          <div className={styles.ejemploGuia}>
            <p className={styles.ejemploGuiaTitulo}>Ejemplo trazado a mano</p>
            <p>
              Relación <code>R(A, B, C, D, E)</code> con <code>A → B</code>, <code>B → C</code> y{' '}
              <code>C,D → E</code>.
            </p>
            <ul>
              <li>
                Partimos de <code>{'{A}'}</code>.
              </li>
              <li>
                <code>A → B</code> se puede aplicar: ahora <code>{'{A, B}'}</code>.
              </li>
              <li>
                <code>B → C</code> se puede aplicar: ahora <code>{'{A, B, C}'}</code>.
              </li>
              <li>
                <code>C,D → E</code> NO se puede aplicar: falta <code>D</code>. Y ya no crece más.
              </li>
            </ul>
            <p>
              Resultado: <code>{'{A}'}⁺ = {'{A, B, C}'}</code>. En cambio <code>{'{A, D}'}⁺</code> sí llega a los
              cinco atributos, porque con <code>D</code> dentro ya se dispara <code>C,D → E</code>.
            </p>
          </div>
          <p>
            Con el cierre se comprueba si <code>X → Y</code> se deduce de las demás (basta con que <code>Y</code>{' '}
            esté en <code>X⁺</code>) y si <code>X</code> es superclave (que <code>X⁺</code> contenga todos los
            atributos). Fíjate en un detalle del ejemplo: las dependencias se aplican <strong>en cadena</strong>,
            no en una sola pasada, y por eso el orden en que están escritas no cambia el resultado.
          </p>

          <h2>Clave candidata frente a superclave</h2>
          <p>
            Una <strong>superclave</strong> es cualquier conjunto de atributos cuyo cierre da toda la fila. Una{' '}
            <strong>clave candidata</strong> es una superclave <strong>mínima</strong>: si le quitas un atributo,
            deja de determinarlo todo. Toda clave candidata es superclave; casi ninguna superclave es clave
            candidata.
          </p>
          <p>
            En <code>R(Factura, Cliente, Fecha, Total)</code> con <code>Factura → Cliente, Fecha, Total</code>, el
            conjunto <code>{'{Factura, Cliente}'}</code> es superclave pero no clave candidata: le sobra{' '}
            <code>Cliente</code>. La única clave candidata es <code>{'{Factura}'}</code>.
          </p>
          <p>
            Una relación puede tener <strong>varias</strong> claves candidatas, y ahí es donde el análisis a ojo
            empieza a fallar. Los atributos que aparecen en alguna de ellas se llaman <strong>primos</strong>; los
            demás, <strong>no primos</strong>. Esa distinción es la que usan 2FN y 3FN: solo hablan de los no
            primos.
          </p>

          <h2>Las cuatro formas normales, con un ejemplo de cada una</h2>
          <p>
            Están encajadas: BCNF implica 3FN, que implica 2FN, que implica 1FN. Por eso, cuando una falla, todas
            las de arriba fallan también.
          </p>

          <div className={styles.fichaForma}>
            <h3>1FN — Primera forma normal</h3>
            <p>
              Cada celda contiene un valor atómico. Nada de <code>&quot;lápiz, goma, cuaderno&quot;</code> en una
              sola columna ni de columnas <code>Telefono1</code>, <code>Telefono2</code>, <code>Telefono3</code>.
            </p>
            <p className={styles.fichaComo}>
              <strong>Cómo se arregla:</strong> sacar los valores repetidos a filas propias, normalmente en una
              tabla aparte con la clave de la original.
            </p>
            <p className={styles.fichaNota}>
              Esta herramienta la da por supuesta: la atomicidad no se deduce de las dependencias funcionales, se
              ve mirando las columnas.
            </p>
          </div>

          <div className={styles.fichaForma}>
            <h3>2FN — Segunda forma normal</h3>
            <p>
              Cumple 1FN y ningún atributo no primo depende solo de <strong>parte</strong> de una clave candidata.
              Solo puede fallar cuando alguna clave tiene dos o más atributos.
            </p>
            <p>
              <strong>Ejemplo que falla:</strong> <code>R(Pedido, Producto, Cantidad, NombreProducto)</code> con{' '}
              <code>Pedido,Producto → Cantidad</code> y <code>Producto → NombreProducto</code>. La clave es{' '}
              <code>{'{Pedido, Producto}'}</code>, pero el nombre del producto depende solo de{' '}
              <code>Producto</code>: media clave.
            </p>
            <p className={styles.fichaComo}>
              <strong>Cómo se arregla:</strong> partir en <code>LineaPedido(Pedido, Producto, Cantidad)</code> y{' '}
              <code>Producto(Producto, NombreProducto)</code>.
            </p>
          </div>

          <div className={styles.fichaForma}>
            <h3>3FN — Tercera forma normal</h3>
            <p>
              Cumple 2FN y ningún atributo no primo depende de otro que no sea superclave. Es la que corta las
              dependencias <strong>transitivas</strong>: <code>clave → X → Y</code>.
            </p>
            <p>
              <strong>Ejemplo que falla:</strong> <code>R(Empleado, Departamento, Ciudad)</code> con{' '}
              <code>Empleado → Departamento</code> y <code>Departamento → Ciudad</code>. La clave es{' '}
              <code>{'{Empleado}'}</code>, así que 2FN se cumple sin esfuerzo, pero la ciudad cuelga del
              departamento, no de la persona.
            </p>
            <p className={styles.fichaComo}>
              <strong>Cómo se arregla:</strong> <code>Empleado(Empleado, Departamento)</code> y{' '}
              <code>Departamento(Departamento, Ciudad)</code>.
            </p>
          </div>

          <div className={styles.fichaForma}>
            <h3>BCNF — Forma normal de Boyce-Codd</h3>
            <p>
              Más estricta que 3FN: <strong>toda</strong> dependencia no trivial debe arrancar de una superclave,
              sin la excepción que 3FN concede cuando la parte derecha es un atributo primo.
            </p>
            <p>
              <strong>Ejemplo que falla:</strong> <code>R(Estudiante, Asignatura, Profesor)</code>, donde cada
              profesor imparte una sola asignatura y cada estudiante tiene un profesor por asignatura:{' '}
              <code>Estudiante,Asignatura → Profesor</code> y <code>Profesor → Asignatura</code>. Hay dos claves
              candidatas, <code>{'{Estudiante, Asignatura}'}</code> y <code>{'{Estudiante, Profesor}'}</code>, y
              los tres atributos son primos: 2FN y 3FN se cumplen sin nada que objetar. Pero{' '}
              <code>Profesor</code> no es superclave, así que BCNF falla.
            </p>
            <p className={styles.fichaComo}>
              <strong>Cómo se arregla:</strong> <code>Profesor(Profesor, Asignatura)</code> y{' '}
              <code>Matricula(Estudiante, Profesor)</code>. Ojo: esta descomposición conserva los datos pero{' '}
              <strong>pierde</strong> la dependencia <code>Estudiante,Asignatura → Profesor</code>, que ya no se
              puede comprobar en una sola tabla. A veces se acepta quedarse en 3FN precisamente por esto.
            </p>
          </div>

          <h2>Qué anomalías evita cada paso</h2>
          <p>
            Normalizar no es un ejercicio de estética: cada forma normal elimina un tipo concreto de problema con
            los datos. Con la tabla{' '}
            <code>R(Empleado, Departamento, Ciudad)</code> del ejemplo transitivo se ven las tres.
          </p>
          <div className={styles.tablaWrapper}>
            <table className={styles.tablaGuia}>
              <thead>
                <tr>
                  <th scope="col">Anomalía</th>
                  <th scope="col">Qué ocurre</th>
                  <th scope="col">Ejemplo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>De inserción</strong>
                  </td>
                  <td>No se puede registrar un hecho sin inventarse otro que no toca.</td>
                  <td>No puedes anotar que Logística está en Rosario hasta que contrates a alguien.</td>
                </tr>
                <tr>
                  <td>
                    <strong>De borrado</strong>
                  </td>
                  <td>Al borrar una fila se pierde información que nada tenía que ver.</td>
                  <td>Si se va el único empleado de Logística, desaparece también su ciudad.</td>
                </tr>
                <tr>
                  <td>
                    <strong>De actualización</strong>
                  </td>
                  <td>El mismo dato está repetido en muchas filas y se corrige a medias.</td>
                  <td>
                    Logística se muda: hay que tocar 40 filas y basta con olvidar una para que la base se
                    contradiga a sí misma.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Dicho corto: <strong>2FN</strong> quita la redundancia que provoca depender de media clave;{' '}
            <strong>3FN</strong> quita la que provoca depender de un dato que tampoco es clave; y{' '}
            <strong>BCNF</strong> quita la que sobrevive cuando hay claves candidatas solapadas.
          </p>

          <h2>Cuándo NO conviene normalizar del todo</h2>
          <p>
            La normalización optimiza la <strong>escritura</strong>: cada dato en un solo sitio, sin
            contradicciones posibles. Pero lo paga la <strong>lectura</strong>, porque recomponer la información
            exige más uniones entre tablas. En sistemas donde se lee mucho más de lo que se escribe, esa cuenta
            puede no salir.
          </p>
          <p>
            La <strong>desnormalización deliberada</strong> consiste en volver a duplicar datos a propósito,
            sabiendo lo que se pierde y con un plan para mantenerlos coherentes. Casos habituales:
          </p>
          <ul className={styles.listaGuia}>
            <li>
              <strong>Almacenes analíticos.</strong> Un esquema en estrella junta dimensiones enteras en una tabla
              para evitar cadenas de uniones en informes que se lanzan miles de veces al día.
            </li>
            <li>
              <strong>Valores históricos.</strong> El precio de una línea de factura se guarda en la propia línea,
              no se consulta en el producto: no es redundancia, es que el precio de venta de aquel día es un dato
              distinto del precio actual.
            </li>
            <li>
              <strong>Totales precalculados.</strong> Guardar el número de comentarios de una publicación evita un
              recuento en cada visita. A cambio, ese contador puede desviarse de la realidad y necesita
              mantenimiento.
            </li>
            <li>
              <strong>Bases de datos documentales.</strong> Muchos motores no relacionales incrustan a propósito
              los datos que se leen juntos, aceptando la duplicación como parte del diseño.
            </li>
          </ul>
          <div className={styles.warningBox}>
            <p className={styles.warningHeader}>
              <span aria-hidden="true">💡</span> El orden importa
            </p>
            <p>
              El criterio habitual es <strong>normalizar primero</strong> hasta 3FN o BCNF y desnormalizar después,
              solo donde una medición demuestre que hace falta, dejando escrito por qué. Desnormalizar antes de
              medir es duplicar datos a ciegas: se pagan las anomalías sin cobrar el rendimiento.
            </p>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('normalizacion-bases-datos')} />
      <ShareCard appName="normalizacion-bases-datos" />
      <Footer appName="normalizacion-bases-datos" />
    </div>
  );
}
