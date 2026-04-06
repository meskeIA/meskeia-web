'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './GlosarioProgramacion.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  TERMINOS,
  CATEGORIAS,
  getLetrasDisponibles,
  buscarTerminos,
  type Termino,
  type Categoria,
} from './data/terminos';

// Alfabeto completo para mostrar todas las letras
const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function GlosarioProgramacionPage() {
  const [letraSeleccionada, setLetraSeleccionada] = useState<string | null>(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [terminoExpandido, setTerminoExpandido] = useState<string | null>(null);

  const letrasDisponibles = useMemo(() => getLetrasDisponibles(), []);

  // Filtrar términos según criterios
  const terminosFiltrados = useMemo(() => {
    let resultado = TERMINOS;

    // Filtro por búsqueda
    if (busqueda.trim()) {
      resultado = buscarTerminos(busqueda);
    }
    // Filtro por letra
    else if (letraSeleccionada) {
      resultado = resultado.filter(t =>
        t.termino[0].toUpperCase() === letraSeleccionada
      );
    }

    // Filtro por categoría (se aplica siempre)
    if (categoriaSeleccionada) {
      resultado = resultado.filter(t => t.categoria === categoriaSeleccionada);
    }

    return resultado;
  }, [busqueda, letraSeleccionada, categoriaSeleccionada]);

  // Limpiar filtros
  const limpiarFiltros = () => {
    setLetraSeleccionada(null);
    setCategoriaSeleccionada(null);
    setBusqueda('');
  };

  // Toggle expandir/colapsar término
  const toggleTermino = (id: string) => {
    setTerminoExpandido(prev => prev === id ? null : id);
  };

  // Buscar término por nombre (para los relacionados)
  const buscarTerminoPorNombre = (nombre: string): Termino | undefined => {
    return TERMINOS.find(t =>
      t.termino.toLowerCase() === nombre.toLowerCase()
    );
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>📖</span>
        <h1 className={styles.title}>Glosario de Programación</h1>
        <p className={styles.subtitle}>
          Más de {TERMINOS.length} términos esenciales de desarrollo web explicados en español
        </p>
      </header>

      <LegalNotice />

      {/* Buscador */}
      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setLetraSeleccionada(null);
            }}
            placeholder="Buscar término, traducción o definición..."
            className={styles.searchInput}
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className={styles.clearSearch}
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filtro alfabético */}
      <div className={styles.alfabetoSection}>
        <div className={styles.alfabetoWrapper}>
          <button
            onClick={() => {
              setLetraSeleccionada(null);
              setBusqueda('');
            }}
            className={`${styles.letraBtn} ${!letraSeleccionada && !busqueda ? styles.letraActiva : ''}`}
          >
            Todos
          </button>
          {ALFABETO.map(letra => {
            const disponible = letrasDisponibles.includes(letra);
            return (
              <button
                key={letra}
                onClick={() => {
                  if (disponible) {
                    setLetraSeleccionada(letra);
                    setBusqueda('');
                  }
                }}
                className={`${styles.letraBtn} ${letraSeleccionada === letra ? styles.letraActiva : ''} ${!disponible ? styles.letraDisabled : ''}`}
                disabled={!disponible}
              >
                {letra}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtro por categorías */}
      <div className={styles.categoriasSection}>
        <div className={styles.categoriasWrapper}>
          <button
            onClick={() => setCategoriaSeleccionada(null)}
            className={`${styles.categoriaBtn} ${!categoriaSeleccionada ? styles.categoriaActiva : ''}`}
          >
            📚 Todas
          </button>
          {Object.entries(CATEGORIAS).map(([key, { nombre, icono }]) => (
            <button
              key={key}
              onClick={() => setCategoriaSeleccionada(key as Categoria)}
              className={`${styles.categoriaBtn} ${categoriaSeleccionada === key ? styles.categoriaActiva : ''}`}
            >
              {icono} {nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Contador de resultados */}
      <div className={styles.resultadosInfo}>
        <span className={styles.contador}>
          {terminosFiltrados.length} {terminosFiltrados.length === 1 ? 'término encontrado' : 'términos encontrados'}
        </span>
        {(letraSeleccionada || categoriaSeleccionada || busqueda) && (
          <button onClick={limpiarFiltros} className={styles.limpiarBtn}>
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Lista de términos */}
      <div className={styles.terminosSection}>
        {terminosFiltrados.length === 0 ? (
          <div className={styles.sinResultados}>
            <span className={styles.sinResultadosIcon}>🔍</span>
            <p>No se encontraron términos con esos criterios</p>
            <button onClick={limpiarFiltros} className={styles.btnSecondary}>
              Ver todos los términos
            </button>
          </div>
        ) : (
          <div className={styles.terminosGrid}>
            {terminosFiltrados.map(termino => (
              <article
                key={termino.id}
                className={`${styles.terminoCard} ${terminoExpandido === termino.id ? styles.terminoExpandido : ''}`}
              >
                <button
                  className={styles.terminoHeader}
                  onClick={() => toggleTermino(termino.id)}
                  aria-expanded={terminoExpandido === termino.id}
                >
                  <div className={styles.terminoTitulo}>
                    <span className={styles.categoriaIcon}>
                      {CATEGORIAS[termino.categoria].icono}
                    </span>
                    <h3 className={styles.terminoNombre}>{termino.termino}</h3>
                    {termino.traduccion && (
                      <span className={styles.traduccion}>({termino.traduccion})</span>
                    )}
                  </div>
                  <span className={styles.expandIcon}>
                    {terminoExpandido === termino.id ? '−' : '+'}
                  </span>
                </button>

                <div className={styles.terminoBody}>
                  <p className={styles.definicion}>{termino.definicion}</p>

                  {terminoExpandido === termino.id && (
                    <div className={styles.detalles}>
                      {termino.ejemplo && (
                        <div className={styles.ejemplo}>
                          <span className={styles.ejemploLabel}>💡 Ejemplo:</span>
                          <code className={styles.ejemploCodigo}>{termino.ejemplo}</code>
                        </div>
                      )}

                      {termino.relacionados && termino.relacionados.length > 0 && (
                        <div className={styles.relacionados}>
                          <span className={styles.relacionadosLabel}>🔗 Relacionados:</span>
                          <div className={styles.relacionadosLista}>
                            {termino.relacionados.map(rel => {
                              const terminoRelacionado = buscarTerminoPorNombre(rel);
                              return terminoRelacionado ? (
                                <button
                                  key={rel}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setBusqueda(rel);
                                    setLetraSeleccionada(null);
                                    setTerminoExpandido(terminoRelacionado.id);
                                  }}
                                  className={styles.relacionadoLink}
                                >
                                  {rel}
                                </button>
                              ) : (
                                <span key={rel} className={styles.relacionadoTag}>
                                  {rel}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className={styles.categoriaBadge}>
                        {CATEGORIAS[termino.categoria].icono} {CATEGORIAS[termino.categoria].nombre}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Sección informativa */}
      <div className={styles.infoSection}>
        <h2 className={styles.infoTitle}>📚 Sobre este glosario</h2>
        <p className={styles.infoText}>
          Este glosario está diseñado para ayudar a quienes están aprendiendo programación
          a entender los términos técnicos que se usan habitualmente en desarrollo web.
          Cada término incluye su traducción al español, una definición clara y ejemplos prácticos.
        </p>
        <div className={styles.categoriasSummary}>
          <h3>Categorías disponibles:</h3>
          <ul className={styles.categoriasLista}>
            {Object.entries(CATEGORIAS).map(([key, { nombre, icono }]) => {
              const count = TERMINOS.filter(t => t.categoria === key).length;
              return (
                <li key={key}>
                  <span className={styles.categoriaItem}>
                    {icono} <strong>{nombre}</strong>: {count} términos
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Sección Educativa - Profesionalización */}
      <EducationalSection
        title="¿Quieres profundizar en los conceptos de programación?"
        subtitle="Guías prácticas, comparativas de paradigmas y errores conceptuales que frenan a los desarrolladores"
        icon="💻"
      >
        {/* Tabla Comparativa: Paradigmas de Programación */}
        <section className={styles.guideSection}>
          <h2>⚖️ Comparativa de Paradigmas de Programación</h2>
          <p className={styles.introParagraph}>
            Elegir el paradigma adecuado es una de las decisiones más importantes en cualquier proyecto. Esta tabla te ayuda a entender cuándo usar cada uno.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>Procedural</th>
                  <th>OOP (Orientada a Objetos)</th>
                  <th>Funcional</th>
                  <th>Reactiva/Eventos</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Organización del código</strong></td>
                  <td>Funciones y procedimientos secuenciales</td>
                  <td>Clases y objetos con estado</td>
                  <td>Funciones puras sin efectos secundarios</td>
                  <td>Flujos de datos y eventos asíncronos</td>
                </tr>
                <tr>
                  <td><strong>Estado del programa</strong></td>
                  <td>Variables mutables globales/locales</td>
                  <td>Encapsulado en objetos</td>
                  <td>Inmutable (sin mutación)</td>
                  <td>Reactivo a cambios de estado</td>
                </tr>
                <tr>
                  <td><strong>Reutilización</strong></td>
                  <td>Funciones reutilizables</td>
                  <td>Herencia y composición</td>
                  <td>Composición de funciones</td>
                  <td>Operadores y streams reutilizables</td>
                </tr>
                <tr>
                  <td><strong>Dificultad inicial</strong></td>
                  <td>Baja (intuitivo)</td>
                  <td>Media (abstracción de clases)</td>
                  <td>Alta (cambio de mentalidad)</td>
                  <td>Alta (asincronía y backpressure)</td>
                </tr>
                <tr>
                  <td><strong>Lenguajes típicos</strong></td>
                  <td>C, Pascal, scripts Bash</td>
                  <td>Java, C#, Python, Ruby</td>
                  <td>Haskell, Erlang, Clojure, Scala</td>
                  <td>RxJS, Akka, Reactor</td>
                </tr>
                <tr>
                  <td><strong>Ideal para</strong></td>
                  <td>Scripts, automatización, inicio</td>
                  <td>Aplicaciones de negocio medianas-grandes</td>
                  <td>Procesamiento de datos, concurrencia</td>
                  <td>Sistemas en tiempo real, UIs reactivas</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de Uso Prácticos */}
        <section className={styles.guideSection}>
          <h2>💼 ¿Para quién es útil este glosario?</h2>
          <p className={styles.introParagraph}>
            Según tu nivel y objetivo, usarás el glosario de forma diferente. Aquí te explicamos cómo sacarle el máximo partido a cada perfil.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🌱</span>
                <h3>Principiante que empieza a programar</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Uso recomendado:</strong></p>
                <code>Filtrar por categoría "Fundamentos" → leer variable, función, bucle, condicional → no pasar a otra categoría hasta dominar estos 20 términos básicos</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Los primeros 20 términos (variable, función, bucle, array, objeto, condicional, tipo de dato, scope, callback, promise) cubren el 80% de lo que necesitas para entender cualquier tutorial de programación web.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💼</span>
                <h3>Desarrollador junior en su primer empleo</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Uso recomendado:</strong></p>
                <code>Buscar término que aparece en code review → leer definición + ejemplo → buscar los "relacionados" para entender el contexto completo</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> En un entorno profesional, los seniors usan términos como "refactoring", "CI/CD", "deuda técnica" o "SOLID" en reuniones. Tener la referencia rápida evita la vergüenza de preguntar por conceptos básicos y acelera la integración en el equipo.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🔄</span>
                <h3>Programador de otro stack aprendiendo web</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Uso recomendado:</strong></p>
                <code>Filtrar categoría "Frontend" o "Backend" → mapear términos conocidos en tu stack (ej: "DOM" si vienes de móvil, "REST" si vienes de desktop)</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Los conceptos son similares entre stacks pero el vocabulario cambia. Un dev de Android conoce "activity" pero no "componente React". Mapear conceptos conocidos a vocabulario web acelera la transición.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🧪</span>
                <h3>QA / Tester técnico</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Uso recomendado:</strong></p>
                <code>Filtrar "Testing" → revisar unit test, integration test, mock, stub, CI/CD → entender qué reportar en cada tipo de bug y qué términos usar con el equipo de desarrollo</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Un QA que habla el mismo lenguaje técnico que los devs reduce el tiempo de resolución de bugs en un 40%. Los términos exactos (null pointer, race condition, memory leak) evitan ambigüedad en los tickets.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Ampliado */}
        <section className={styles.guideSection}>
          <h2>❓ Dudas Frecuentes sobre Programación</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cuál es la diferencia real entre frontend y backend?</h4>
              <p>
                El frontend es todo lo que el usuario ve y con lo que interactúa directamente: HTML (estructura), CSS (estilo) y JavaScript (comportamiento) que se ejecutan en el navegador. El backend es el servidor: recibe peticiones del frontend, procesa la lógica de negocio, accede a la base de datos y devuelve respuestas. Un sistema de login: el frontend muestra el formulario, el backend verifica las credenciales contra la base de datos.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Analogía práctica:</strong> El frontend es el salón de un restaurante (lo que ve el cliente), el backend es la cocina (donde se prepara la comida), y la base de datos es la despensa (donde se guardan los ingredientes).
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué diferencia hay entre null y undefined en JavaScript?</h4>
              <p>
                <code>undefined</code> significa que una variable existe pero no se le ha asignado ningún valor. <code>null</code> es un valor intencionalmente asignado que representa "sin valor". <code>typeof null === 'object'</code> (bug histórico de JS). <code>typeof undefined === 'undefined'</code>. En comparación laxa: <code>null == undefined</code> es <code>true</code>. En estricta: <code>null === undefined</code> es <code>false</code>.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Regla práctica:</strong> Usa <code>null</code> cuando tú quieres decir "no hay valor aquí" (p.ej: usuario no encontrado). <code>undefined</code> aparece automáticamente cuando olvidas inicializar una variable. Comprueba siempre con <code>=== null</code> o <code>=== undefined</code>, nunca con <code>== null</code>.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cuándo usar var, let o const en JavaScript?</h4>
              <p>
                <strong>var</strong>: scope de función, hoisting, evitar en código moderno. <strong>let</strong>: scope de bloque, valor puede cambiar. <strong>const</strong>: scope de bloque, referencia no puede reasignarse (pero el objeto interno sí puede mutarse). Regla de oro: usa <code>const</code> por defecto. Cambia a <code>let</code> solo si necesitas reasignar. Nunca uses <code>var</code> en código nuevo (ES6+).
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Truco para entrevistar:</strong> <code>const obj = &#123;&#125;; obj.name = 'Juan';</code> es válido. <code>const</code> prohíbe reasignar la variable (<code>obj = otro</code>), no mutar el objeto. Este matiz se pregunta frecuentemente en entrevistas técnicas junior.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué es una API REST y cómo funciona?</h4>
              <p>
                REST (Representational State Transfer) es un estilo arquitectónico para APIs web. Una API REST usa HTTP con los verbos GET (leer), POST (crear), PUT/PATCH (actualizar), DELETE (eliminar). Cada recurso tiene una URL única: <code>GET /usuarios/123</code> devuelve el usuario 123. Las respuestas son típicamente JSON. "Stateless" significa que cada petición es independiente: el servidor no guarda estado de sesión.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Alternativas modernas:</strong> GraphQL permite pedir exactamente los campos que necesitas (evita over-fetching). tRPC ofrece type-safety end-to-end entre frontend y backend TypeScript sin definir contratos manualmente.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué es Git y por qué es imprescindible?</h4>
              <p>
                Git es un sistema de control de versiones distribuido. Guarda instantáneas del código (commits) que permiten ver la historia completa, revertir cambios, trabajar en ramas paralelas (branches) sin interferir con el código principal y fusionar cambios (merge). GitHub/GitLab son plataformas que alojan repositorios Git en la nube y añaden colaboración, CI/CD y revisión de código. Sin Git, perder código por error o conflictos entre compañeros es inevitable.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Los 5 comandos que usas el 90% del tiempo:</strong> <code>git add</code>, <code>git commit</code>, <code>git push</code>, <code>git pull</code>, <code>git checkout -b nueva-rama</code>. Domínalos antes de memorizar el resto.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cuándo usar SQL (relacional) vs NoSQL?</h4>
              <p>
                <strong>SQL</strong> (PostgreSQL, MySQL): datos estructurados con relaciones complejas, transacciones ACID, integridad de datos crítica (banking, e-commerce). <strong>NoSQL</strong> (MongoDB, Redis, Cassandra): datos semiestructurados o sin esquema fijo, escala horizontal masiva, lecturas/escrituras de alta velocidad (sesiones, caché, tiempo real). El 80% de proyectos funciona perfectamente con PostgreSQL. NoSQL no es "mejor" sino diferente: úsalo cuando tengas un problema concreto que SQL no resuelva eficientemente.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Mito derribado:</strong> "NoSQL es más rápido que SQL" es falso en términos generales. PostgreSQL con índices correctos supera a MongoDB en la mayoría de queries de lectura. La velocidad depende del diseño, no del tipo de base de datos.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué es Docker y cuándo lo necesito?</h4>
              <p>
                Docker empaqueta una aplicación con todas sus dependencias en un contenedor: un entorno aislado y reproducible. Resuelve el clásico "en mi máquina funciona": si funciona en el contenedor, funciona en cualquier entorno (desarrollo, CI, producción). Un contenedor es más ligero que una máquina virtual porque comparte el kernel del sistema operativo. Lo necesitas cuando: diferentes devs tienen distintas versiones de Node/Python, el servidor de producción difiere del entorno local, o tienes múltiples microservicios.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Por dónde empezar:</strong> Aprende a escribir un Dockerfile básico para tu app y usa <code>docker-compose</code> para orquestar tu app + base de datos. Esto cubre el 90% de los casos de uso en proyectos de equipo pequeño.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué diferencia hay entre proceso síncrono y asíncrono?</h4>
              <p>
                <strong>Síncrono</strong>: el código espera a que cada operación termine antes de continuar. Si leer un archivo tarda 2 segundos, el hilo se bloquea 2 segundos. <strong>Asíncrono</strong>: la operación lenta se inicia, el código sigue ejecutándose, y cuando termina se procesa el resultado (callback, Promise, async/await). JavaScript es single-threaded: la asincronía es fundamental para no bloquear la UI. Una petición a una API siempre debe ser asíncrona.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Orden de aprendizaje:</strong> Callbacks → Promises → async/await. Empieza directamente con <code>async/await</code> para el código nuevo (es la forma más legible), pero entiende Promises para manejar errores correctamente con <code>try/catch</code>.
              </p>
            </div>
          </div>
        </section>

        {/* Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>📋 Ruta de Aprendizaje para Desarrollador Web Junior</h2>
          <p className={styles.introParagraph}>
            Esta guía te muestra el orden óptimo para aprender programación web desde cero hasta conseguir tu primer empleo como desarrollador.
          </p>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Fundamentos de HTML, CSS y JavaScript básico (4-8 semanas)</h4>
                <p>
                  Aprende la estructura de una página web (HTML semántico), cómo estilizarla (CSS: box model, flexbox, grid) y JavaScript básico (variables, funciones, bucles, DOM manipulation). Términos clave del glosario: elemento, etiqueta, selector, propiedad CSS, variable, función, bucle, array. No avances hasta poder hacer una página estática responsive desde cero.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>JavaScript intermedio y asincronía (4-6 semanas)</h4>
                <p>
                  Profundiza en JavaScript: ES6+ (arrow functions, destructuring, spread), Promises, async/await, fetch API, scope y closures. Términos clave: Promise, async/await, callback, closure, scope, API, JSON, fetch. Este es el mayor salto de dificultad para principiantes: dedícale el tiempo necesario antes de pasar a frameworks.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Control de versiones con Git (1-2 semanas)</h4>
                <p>
                  Aprende Git desde el primer día. Commit, branch, merge, pull request, resolución de conflictos. Crea una cuenta en GitHub y sube todos tus proyectos, aunque sean pequeños. Los empleadores valoran el historial de commits: demuestra consistencia y progreso. Términos clave: repositorio, commit, branch, merge, pull request, fork.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Un framework frontend (6-10 semanas): React recomendado</h4>
                <p>
                  Con JavaScript sólido, aprende React (el más demandado en España: 60% de ofertas junior). Componentes, props, state, hooks (useState, useEffect), routing. Términos clave: componente, props, state, hook, renderizado, virtual DOM, SPA. Construye 2-3 proyectos completos antes de buscar empleo.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Backend básico: Node.js + Express o Next.js API Routes (4-6 semanas)</h4>
                <p>
                  Aprende a crear APIs REST básicas con Node.js. Peticiones HTTP (GET, POST, PUT, DELETE), middleware, variables de entorno, conexión a base de datos (PostgreSQL con Prisma es la combinación más moderna y empleable). Términos clave: servidor, API REST, middleware, CRUD, ORM, variable de entorno, endpoint.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Prepara tu portfolio y empieza a buscar empleo</h4>
                <p>
                  Construye 3 proyectos que muestren: un CRUD completo (frontend + backend + base de datos), un proyecto con API externa, y algo personal que demuestre motivación. Escribe README.md explicando cada proyecto. LinkedIn actualizado, CV con proyectos con links a GitHub y demos en vivo. Los bootcamps de 6 meses aceleran este proceso pero no son imprescindibles si eres autodidacta disciplinado.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>✅ Mejores Prácticas para Aprender Programación</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏗️</span>
              <h4>Aprende construyendo, no solo leyendo</h4>
              <p>Por cada hora de tutorial, pasa 2 horas escribiendo código. Leer sobre programación sin practicar es como leer sobre natación sin entrar al agua. El error es parte del aprendizaje.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔗</span>
              <h4>Entiende el "por qué", no solo el "cómo"</h4>
              <p>Entender por qué existe un patrón (ej: por qué los closures resuelven el problema de scope) te permite aplicarlo en contextos nuevos. Memorizar sintaxis sin comprensión no escala.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📖</span>
              <h4>Lee documentación oficial, no solo tutoriales</h4>
              <p>MDN Web Docs (JavaScript/HTML/CSS), documentación de React, PostgreSQL y Node.js son fuentes autoritativas. Los tutoriales pueden estar desactualizados; la doc oficial siempre refleja la versión actual.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🐛</span>
              <h4>Aprende a depurar antes de pedir ayuda</h4>
              <p>Antes de preguntar: lee el error completo, busca en Google el mensaje exacto, usa <code>console.log</code> estratégicamente, revisa la documentación. El 90% de errores tienen solución en Stack Overflow.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <h4>Un lenguaje bien, no cinco a medias</h4>
              <p>Domina JavaScript antes de aprender Python o Go. Los conceptos (funciones, bucles, objetos, async) son transferibles entre lenguajes. La profundidad en uno facilita aprender el siguiente.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📦</span>
              <h4>Versiona todo en Git desde el primer día</h4>
              <p>Aunque el proyecto sea pequeño, crea un repositorio. El historial de commits en GitHub es tu portafolio en tiempo real. Los empleadores lo revisan antes de la entrevista técnica.</p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Errores Conceptuales Frecuentes que Frenan el Aprendizaje</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>❌ Confundir Java con JavaScript:</strong> Son lenguajes completamente distintos. Java es compilado, tipado estático, orientado a objetos (Android, backend empresarial). JavaScript es interpretado, dinámico, multiparadigma (web, Node.js). El nombre es coincidencia histórica de marketing. No tienen relación técnica.
              </li>
              <li>
                <strong>❌ Creer que CSS es "fácil" porque no es un lenguaje de programación:</strong> CSS moderno (Grid, Custom Properties, animaciones, Container Queries) es complejo. Las cascada, especificidad y herencia generan bugs difíciles de depurar. Los devs senior dedican tiempo serio a dominar CSS. Subestimarlo retrasa el desarrollo frontend.
              </li>
              <li>
                <strong>❌ Empezar con frameworks antes de dominar JavaScript:</strong> React, Vue o Angular son abstracciones sobre JavaScript. Sin bases sólidas (async, closures, prototypes, DOM), los errores del framework son incomprensibles. Aprende JavaScript puro durante 2-3 meses antes de tocar cualquier framework.
              </li>
              <li>
                <strong>❌ Confundir librería y framework:</strong> Una librería (jQuery, Lodash, Axios) es un conjunto de funciones que tú llamas cuando quieres. Un framework (Angular, Django, Spring) invierte el control: el framework llama a tu código siguiendo su estructura. React es técnicamente una librería, aunque en la práctica se usa como framework con ecosistema propio.
              </li>
              <li>
                <strong>❌ Pensar que más líneas de código = mejor código:</strong> Un buen programador escribe el mínimo código necesario para resolver el problema. Código largo es más difícil de leer, probar y mantener. La refactorización que reduce un componente de 200 a 50 líneas sin perder funcionalidad es una mejora, no una simplificación peligrosa.
              </li>
              <li>
                <strong>❌ Ignorar el manejo de errores:</strong> Código sin try/catch, sin validación de inputs o sin manejo de casos extremos (null, array vacío, timeout de red) funciona en desarrollo y falla en producción. El 40% de los bugs reportados vienen de casos no contemplados. Siempre pregúntate: "¿Qué pasa si esto es null/undefined/vacío?"
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('glosario-programacion')} />
      <ShareCard appName="glosario-programacion" />
      <Footer appName="glosario-programacion" />
    </div>
  );
}
