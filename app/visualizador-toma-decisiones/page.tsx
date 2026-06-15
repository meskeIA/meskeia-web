'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './TomaDecisiones.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type TabId = 'sistemas' | 'fatiga' | 'heuristicos' | 'arquitectura';

interface EjercicioItem {
  id: string;
  pregunta: string;
  opcionIntuitiva: string;
  opcionRacional: string;
  explicacion: string;
  sistema1: string;
  heuristico: string;
}

// ─────────────────────────────────────────────
// Datos de ejercicios interactivos (heurísticos)
// ─────────────────────────────────────────────

const EJERCICIOS: EjercicioItem[] = [
  {
    id: 'disponibilidad',
    pregunta: '¿Cuál es más peligroso: volar en avión o conducir en coche?',
    opcionIntuitiva: 'Volar en avión',
    opcionRacional: 'Conducir en coche',
    explicacion: 'Los accidentes de avión son noticia mundial durante días. Los de coche, rutina local. Por eso el avión parece más peligroso. La realidad: mueres 95 veces más probablemente en un accidente de coche (por km recorrido). El Sistema 1 confundió "fácil de recordar" con "frecuente".',
    sistema1: 'Lo que recuerdo fácilmente me parece más probable',
    heuristico: 'Disponibilidad',
  },
  {
    id: 'representatividad',
    pregunta: 'Linda tiene 31 años, es activa socialmente y le preocupa la justicia. ¿Qué es más probable?',
    opcionIntuitiva: 'Linda es cajera de banco y activista feminista',
    opcionRacional: 'Linda es cajera de banco',
    explicacion: 'El 85% de las personas elige la primera opción aunque sea matemáticamente imposible: un subconjunto (cajera Y activista) nunca puede ser más probable que el conjunto (solo cajera). La descripción de Linda encaja con el estereotipo de "activista", y el Sistema 1 confunde el parecido con la probabilidad.',
    sistema1: 'Lo que se parece a X probablemente es X',
    heuristico: 'Representatividad',
  },
  {
    id: 'anclaje',
    pregunta: 'Un comercio te ofrece un abrigo rebajado "de 400 € a 160 €". ¿Lo comprarías?',
    opcionIntuitiva: 'Sí, es un 60% de descuento, gran oferta',
    opcionRacional: 'Investigaría el precio real en otros comercios primero',
    explicacion: 'Los 400 € son un ancla artificial. No sabes si ese precio existió nunca ni si 160 € es justo. El Sistema 1 calcula el "ahorro" desde el ancla y genera una sensación de ganga. Sin el ancla de 400 €, ¿pagarías 160 € por ese abrigo sin pensártelo?',
    sistema1: 'El primer número que veo define mi referencia',
    heuristico: 'Anclaje',
  },
  {
    id: 'framing',
    pregunta: 'Un médico dice: "Esta operación tiene una tasa de mortalidad del 10%". ¿La harías?',
    opcionIntuitiva: 'No, suena arriesgado',
    opcionRacional: 'Es idéntico a "90% de supervivencia", que suena mejor',
    explicacion: '"Tasa de mortalidad 10%" y "tasa de supervivencia 90%" son exactamente lo mismo. Estudios clínicos muestran que los pacientes aceptan significativamente más la operación con la segunda formulación. El Sistema 1 reacciona a la emoción de las palabras, no al número.',
    sistema1: 'La misma información con palabras distintas me parece diferente',
    heuristico: 'Encuadre (Framing)',
  },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function TomaDecisionesPage() {
  const [tabActiva, setTabActiva] = useState<TabId>('sistemas');
  const [ejercicioActivo, setEjercicioActivo] = useState<string | null>(null);
  const [respuestasElegidas, setRespuestasElegidas] = useState<Record<string, 'intuitiva' | 'racional'>>({});

  const elegirRespuesta = (ejercicioId: string, tipo: 'intuitiva' | 'racional') => {
    setRespuestasElegidas(prev => ({ ...prev, [ejercicioId]: tipo }));
    setEjercicioActivo(ejercicioId);
  };

  const tabs: { id: TabId; label: string; icono: string }[] = [
    { id: 'sistemas', label: 'Dos sistemas', icono: '🧠' },
    { id: 'fatiga', label: 'Fatiga decisional', icono: '⚡' },
    { id: 'heuristicos', label: 'Heurísticos', icono: '🎯' },
    { id: 'arquitectura', label: 'Arquitectura de elección', icono: '🏛️' },
  ];

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        {/* Hero */}
        <header className={styles.hero}>
          <h1 className={styles.title}>🧠 Toma de Decisiones</h1>
          <p className={styles.subtitle}>
            Cómo decide realmente el cerebro humano: dos sistemas, fatiga decisional,
            heurísticos y la ciencia del nudge
          </p>
        </header>

        <LegalNotice />

        {/* Tabs */}
        <nav className={styles.tabs} aria-label="Secciones del visualizador">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${tabActiva === tab.id ? styles.tabActive : ''}`}
              onClick={() => setTabActiva(tab.id)}
              aria-pressed={tabActiva === tab.id}
            >
              <span aria-hidden="true">{tab.icono}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* ──── TAB 1: DOS SISTEMAS ──── */}
        {tabActiva === 'sistemas' && (
          <div className={styles.content}>
            <p className={styles.intro}>
              Daniel Kahneman (Premio Nobel de Economía 2002) describió en <em>Pensar rápido, pensar despacio</em> los
              dos sistemas con los que el cerebro humano toma decisiones.
            </p>

            <div className={styles.sistemasGrid}>
              {/* Sistema 1 */}
              <div className={styles.sistema1Card}>
                <div className={styles.sistemaHeader}>
                  <span className={styles.sistemaNum}>Sistema 1</span>
                  <span className={styles.sistemaLabel}>Automático · Rápido · Intuitivo</span>
                </div>
                <div className={styles.sistemaBody}>
                  <p className={styles.sistemaDesc}>
                    Opera sin esfuerzo consciente, 24 horas al día. Responsable del
                    <strong> 95% de las decisiones cotidianas</strong>.
                  </p>
                  <div className={styles.sistemaLista}>
                    <div className={styles.sistemaItem}>
                      <span className={styles.proTag}>Ventaja</span>
                      <span>Rapidez extrema: evitar peligro, conducir, reconocer caras</span>
                    </div>
                    <div className={styles.sistemaItem}>
                      <span className={styles.contraTag}>Riesgo</span>
                      <span>Usa atajos heurísticos — susceptible a sesgos cognitivos</span>
                    </div>
                  </div>
                  <div className={styles.ejemplosBox}>
                    <p className={styles.ejemplosTitle}>Se activa con:</p>
                    <ul>
                      <li>Situaciones familiares y rutinarias</li>
                      <li>Señales emocionales (miedo, alegría, disgusto)</li>
                      <li>Patrones reconocidos previamente</li>
                      <li>Preguntas sencillas: «¿2+2?» → 4 al instante</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Sistema 2 */}
              <div className={styles.sistema2Card}>
                <div className={styles.sistemaHeader}>
                  <span className={styles.sistemaNum}>Sistema 2</span>
                  <span className={styles.sistemaLabel}>Deliberativo · Lento · Analítico</span>
                </div>
                <div className={styles.sistemaBody}>
                  <p className={styles.sistemaDesc}>
                    Requiere esfuerzo consciente y consume glucosa.
                    Solo puede procesar <strong>una cosa difícil a la vez</strong>.
                  </p>
                  <div className={styles.sistemaLista}>
                    <div className={styles.sistemaItem}>
                      <span className={styles.proTag}>Ventaja</span>
                      <span>Cálculo racional, planificación, auto-control, pensamiento crítico</span>
                    </div>
                    <div className={styles.sistemaItem}>
                      <span className={styles.contraTag}>Riesgo</span>
                      <span>Perezoso: delega al Sistema 1 cuando puede. Se agota.</span>
                    </div>
                  </div>
                  <div className={styles.ejemplosBox}>
                    <p className={styles.ejemplosTitle}>Se activa con:</p>
                    <ul>
                      <li>Situaciones nuevas o complejas</li>
                      <li>Alta incertidumbre o riesgo</li>
                      <li>Cuando se detecta un error del Sistema 1</li>
                      <li>Cálculos difíciles: «17 × 24» → esfuerzo real</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* La trampa clave */}
            <div className={styles.trampaBox}>
              <h2 className={styles.trampaTitle}>⚠️ La trampa más importante</h2>
              <p>
                El Sistema 2 cree que supervisa y controla al Sistema 1. En realidad, muchas veces
                solo <strong>racionaliza después</strong> la decisión que ya tomó el Sistema 1. Creemos
                que decidimos con lógica cuando en realidad el Sistema 1 ya eligió y el Sistema 2 construyó
                la justificación.
              </p>
            </div>

            {/* Trampas clásicas */}
            <h2 className={styles.seccionTitulo}>Trampas clásicas del Sistema 1 en decisiones importantes</h2>
            <div className={styles.trampaGrid}>
              <div className={styles.trampaCard}>
                <span className={styles.trampaIcono}>🔍</span>
                <h3>Disponibilidad</h3>
                <p>
                  Tomamos peores decisiones en base a lo que nos viene fácil a la mente.
                  Los accidentes de avión parecen más probables que los de coche porque aparecen
                  más en las noticias, aunque estadísticamente el coche es 95 veces más peligroso.
                </p>
              </div>
              <div className={styles.trampaCard}>
                <span className={styles.trampaIcono}>🎭</span>
                <h3>Representatividad</h3>
                <p>
                  Juzgamos probabilidades por parecido superficial con un prototipo mental, ignorando
                  la frecuencia base real. Si algo «parece» de un tipo, asumimos que lo es, aunque
                  las probabilidades digan lo contrario.
                </p>
              </div>
              <div className={styles.trampaCard}>
                <span className={styles.trampaIcono}>🖼️</span>
                <h3>Encuadre (Framing)</h3>
                <p>
                  «90% de supervivencia» se siente radicalmente diferente a «10% de mortalidad»,
                  aunque son exactamente lo mismo. El Sistema 1 reacciona a las palabras y
                  la emoción, no al número desnudo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ──── TAB 2: FATIGA DECISIONAL ──── */}
        {tabActiva === 'fatiga' && (
          <div className={styles.content}>
            <p className={styles.intro}>
              Cada decisión que tomas consume recursos cognitivos reales. Cuando esos recursos se agotan,
              tu cerebro recurre a atajos que empeoran la calidad de tus elecciones.
            </p>

            {/* Experimento de los jueces */}
            <h2 className={styles.seccionTitulo}>El experimento que lo demostró</h2>
            <div className={styles.juecesCard}>
              <div className={styles.juecesHeader}>
                <span className={styles.juecesIcono}>⚖️</span>
                <div>
                  <h3>Los jueces israelíes (2011)</h3>
                  <p className={styles.juecesRef}>Danziger, Levav & Avnaim-Pesso — Proceedings of the National Academy of Sciences</p>
                </div>
              </div>
              <p>
                Análisis de 1.112 decisiones de libertad condicional a lo largo de la jornada laboral.
                El resultado fue tan claro que parecía imposible:
              </p>

              {/* Visualización de barras */}
              <div className={styles.juecesChart}>
                <div className={styles.barItem}>
                  <span className={styles.barLabel}>Inicio de jornada</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: '65%', backgroundColor: '#27ae60' }} />
                  </div>
                  <span className={styles.barPct}>65% favorable</span>
                </div>
                <div className={styles.barItem}>
                  <span className={styles.barLabel}>Antes del descanso</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: '20%', backgroundColor: '#e74c3c' }} />
                  </div>
                  <span className={styles.barPct}>~20% favorable</span>
                </div>
                <div className={styles.barItem}>
                  <span className={styles.barLabel}>Tras el descanso</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: '65%', backgroundColor: '#27ae60' }} />
                  </div>
                  <span className={styles.barPct}>65% favorable</span>
                </div>
                <div className={styles.barItem}>
                  <span className={styles.barLabel}>Antes de la comida</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: '20%', backgroundColor: '#e74c3c' }} />
                  </div>
                  <span className={styles.barPct}>~20% favorable</span>
                </div>
                <div className={styles.barItem}>
                  <span className={styles.barLabel}>Tras la comida</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: '65%', backgroundColor: '#27ae60' }} />
                  </div>
                  <span className={styles.barPct}>65% favorable</span>
                </div>
              </div>

              <div className={styles.warningBox}>
                No es culpa de los jueces: el agotamiento decisional es biológico. El córtex prefrontal
                consume glucosa activamente. Al agotarse, el cerebro adopta dos estrategias de ahorro:
                (1) no decidir → mantener el statu quo (denegar siempre), o (2) decidir por regla
                simple. Ambas son malas decisiones en muchos contextos.
              </div>
            </div>

            {/* Manifestaciones cotidianas */}
            <h2 className={styles.seccionTitulo}>La fatiga en tu vida cotidiana</h2>
            <div className={styles.paradojaGrid}>
              <div className={styles.paradojaCard}>
                <span className={styles.paradojaIcono}>🛒</span>
                <h3>Compras impulsivas</h3>
                <p>
                  Los supermercados colocan los productos de impulso (golosinas, revistas) junto a la caja.
                  Llegas al final de la compra habiendo tomado decenas de decisiones — estás agotado
                  y tu resistencia al impulso es mínima.
                </p>
              </div>
              <div className={styles.paradojaCard}>
                <span className={styles.paradojaIcono}>📃</span>
                <h3>Firmar sin leer</h3>
                <p>
                  Al final de un proceso largo (comprar un coche, contratar un seguro) firmas cláusulas
                  sin leerlas. No es descuido: es fatiga decisional. La energía para el Sistema 2
                  está agotada.
                </p>
              </div>
              <div className={styles.paradojaCard}>
                <span className={styles.paradojaIcono}>📉</span>
                <h3>Inversiones al final del día</h3>
                <p>
                  Los traders profesionales toman peores decisiones de inversión en la última hora
                  de negociación. La fatiga acumulada erosiona el análisis racional y aumenta
                  las decisiones por impulso.
                </p>
              </div>
              <div className={styles.paradojaCard}>
                <span className={styles.paradojaIcono}>🤯</span>
                <h3>La paradoja de la elección</h3>
                <p>
                  Barry Schwartz (2004): más opciones generan más esfuerzo y más arrepentimiento.
                  Con 24 sabores de yogur se vende <em>menos</em> que con 6, porque la elección
                  paraliza o provoca mayor insatisfacción post-compra.
                </p>
              </div>
            </div>

            {/* Soluciones */}
            <h2 className={styles.seccionTitulo}>Cómo combatir la fatiga decisional</h2>
            <div className={styles.solucionesGrid}>
              <div className={styles.solucionItem}>
                <span className={styles.solucionNum}>01</span>
                <div>
                  <h3>Programar decisiones por la mañana</h3>
                  <p>Las decisiones importantes deben tomarse cuando el Sistema 2 tiene energía. Reserva las mañanas para lo estratégico.</p>
                </div>
              </div>
              <div className={styles.solucionItem}>
                <span className={styles.solucionNum}>02</span>
                <div>
                  <h3>Crear rutinas que eliminen opciones</h3>
                  <p>Obama y Zuckerberg usaban siempre la misma ropa para no gastar energía cognitiva en trivialidades y reservarla para decisiones reales.</p>
                </div>
              </div>
              <div className={styles.solucionItem}>
                <span className={styles.solucionNum}>03</span>
                <div>
                  <h3>Reducir el menú de opciones</h3>
                  <p>No tener más de 3-4 opciones en decisiones recurrentes. Los menús largos agotan; los cortos facilitan la elección sin sacrificar calidad.</p>
                </div>
              </div>
              <div className={styles.solucionItem}>
                <span className={styles.solucionNum}>04</span>
                <div>
                  <h3>Descanso y glucosa antes de decisiones críticas</h3>
                  <p>El experimento de los jueces lo demuestra: el descanso y la comida restauran el Sistema 2. No tomes decisiones importantes cuando estás cansado o hambriento.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──── TAB 3: HEURÍSTICOS ──── */}
        {tabActiva === 'heuristicos' && (
          <div className={styles.content}>
            <p className={styles.intro}>
              Los heurísticos son reglas mentales simplificadas que el Sistema 1 usa para decidir rápido.
              Son útiles en el 80% de los casos. Fallan en el 20% más importante.
            </p>

            <div className={styles.heuristicosGrid}>
              {EJERCICIOS.map((ej) => {
                const respuesta = respuestasElegidas[ej.id];
                const respondido = respuesta !== undefined;

                return (
                  <div key={ej.id} className={styles.heuristicoCard}>
                    <div className={styles.heuristicoHeader}>
                      <span className={styles.heuristicoBadge}>{ej.heuristico}</span>
                      <p className={styles.heuristicoSistema1}>
                        <em>Sistema 1 piensa: «{ej.sistema1}»</em>
                      </p>
                    </div>

                    <p className={styles.ejercicioPregunta}>{ej.pregunta}</p>

                    {!respondido ? (
                      <div className={styles.ejercicioOpciones}>
                        <button
                          className={styles.preguntaBtn}
                          onClick={() => elegirRespuesta(ej.id, 'intuitiva')}
                        >
                          {ej.opcionIntuitiva}
                        </button>
                        <button
                          className={styles.preguntaBtn}
                          onClick={() => elegirRespuesta(ej.id, 'racional')}
                        >
                          {ej.opcionRacional}
                        </button>
                      </div>
                    ) : (
                      <div className={`${styles.respuestaBox} ${respuesta === 'intuitiva' ? styles.respuestaSistema1 : styles.respuestaRacional}`}>
                        <p className={styles.respuestaElegida}>
                          {respuesta === 'intuitiva'
                            ? '🎯 Respuesta intuitiva — el Sistema 1 tomó el control'
                            : '✅ Respuesta analítica — el Sistema 2 intervino'}
                        </p>
                        <p className={styles.respuestaExplicacion}>{ej.explicacion}</p>
                        <button
                          className={styles.reiniciarBtn}
                          onClick={() => {
                            const copia = { ...respuestasElegidas };
                            delete copia[ej.id];
                            setRespuestasElegidas(copia);
                            setEjercicioActivo(null);
                          }}
                        >
                          Repetir pregunta
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Resumen tabla */}
            <div className={styles.tablaHeuristicos}>
              <h2 className={styles.seccionTitulo}>Los 4 heurísticos principales</h2>
              <div className={styles.tablaFila}>
                <span className={styles.tablaCabecera}>Heurístico</span>
                <span className={styles.tablaCabecera}>Lógica del Sistema 1</span>
                <span className={styles.tablaCabecera}>Cuándo falla</span>
              </div>
              <div className={styles.tablaFila}>
                <span><strong>Disponibilidad</strong></span>
                <span>Lo que recuerdo fácilmente es más frecuente</span>
                <span>Cuando los medios distorsionan la percepción de riesgo</span>
              </div>
              <div className={styles.tablaFila}>
                <span><strong>Representatividad</strong></span>
                <span>Lo que se parece a X probablemente es X</span>
                <span>Ignora la frecuencia base real (base rate neglect)</span>
              </div>
              <div className={styles.tablaFila}>
                <span><strong>Anclaje</strong></span>
                <span>El primer número visto define la referencia</span>
                <span>Precios artificialmente inflados, negociaciones</span>
              </div>
              <div className={styles.tablaFila}>
                <span><strong>Encuadre</strong></span>
                <span>La misma info en diferente formato parece diferente</span>
                <span>Comunicación médica, publicidad, política</span>
              </div>
            </div>
          </div>
        )}

        {/* ──── TAB 4: ARQUITECTURA DE ELECCIÓN ──── */}
        {tabActiva === 'arquitectura' && (
          <div className={styles.content}>
            <p className={styles.intro}>
              Richard Thaler y Cass Sunstein (libro <em>Nudge</em>, 2008; Thaler Premio Nobel 2017)
              demostraron que la <strong>forma en que se presentan las opciones</strong> influye
              dramáticamente en lo que se elige — sin prohibir nada ni cambiar los incentivos económicos.
            </p>

            <div className={styles.nudgeConcepto}>
              <span className={styles.nudgeIconoGrande} aria-hidden="true">👆</span>
              <div>
                <h2>El nudge (empujoncito)</h2>
                <p>
                  Un pequeño cambio en el diseño del entorno que guía la elección hacia mejores resultados
                  sin coacción. El nudge preserva la libertad total de elegir cualquier opción.
                </p>
              </div>
            </div>

            <div className={styles.nudgeGrid}>
              {/* Opción por defecto */}
              <div className={styles.nudgeCard}>
                <div className={styles.nudgeCardHeader}>
                  <span className={styles.nudgeNum}>01</span>
                  <h3>Opción por defecto (default)</h3>
                </div>
                <p className={styles.nudgePrincipio}>
                  <em>El default es lo que más influye en la elección final.</em>
                </p>
                <div className={styles.nudgeEjemplos}>
                  <div className={styles.nudgeEjemplo}>
                    <span className={styles.nudgeEjemploIcono}>🫀</span>
                    <div>
                      <strong>Donación de órganos</strong>
                      <p>
                        Países con <em>opt-out</em> (hay que pedir NO ser donante): 80-90% de donantes.
                        Países con <em>opt-in</em> (hay que pedir SER donante): 20-40%.
                        Misma ley — diferente default.
                      </p>
                    </div>
                  </div>
                  <div className={styles.nudgeEjemplo}>
                    <span className={styles.nudgeEjemploIcono}>💰</span>
                    <div>
                      <strong>Planes de pensiones</strong>
                      <p>
                        Si la empresa te inscribe por defecto: 90% continúa.
                        Si debes inscribirte activamente: solo el 40% lo hace.
                        La inercia es la fuerza más poderosa en economía del comportamiento.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Posición y orden */}
              <div className={styles.nudgeCard}>
                <div className={styles.nudgeCardHeader}>
                  <span className={styles.nudgeNum}>02</span>
                  <h3>Posición y orden</h3>
                </div>
                <p className={styles.nudgePrincipio}>
                  <em>Lo que está primero o a la vista se elige más.</em>
                </p>
                <div className={styles.nudgeEjemplos}>
                  <div className={styles.nudgeEjemplo}>
                    <span className={styles.nudgeEjemploIcono}>🍎</span>
                    <div>
                      <strong>Cafeterías escolares</strong>
                      <p>
                        Poner la fruta a la altura de los ojos aumenta su consumo un 35%
                        sin eliminar ningún otro producto. Solo cambió la posición.
                      </p>
                    </div>
                  </div>
                  <div className={styles.nudgeEjemplo}>
                    <span className={styles.nudgeEjemploIcono}>📋</span>
                    <div>
                      <strong>Listas de opciones</strong>
                      <p>
                        La primera opción de un listado se elige un 20% más que opciones
                        equivalentes en posición inferior, incluso cuando las personas creen
                        que leen toda la lista.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simplificación */}
              <div className={styles.nudgeCard}>
                <div className={styles.nudgeCardHeader}>
                  <span className={styles.nudgeNum}>03</span>
                  <h3>Simplificación</h3>
                </div>
                <p className={styles.nudgePrincipio}>
                  <em>Más simple = mejores decisiones.</em>
                </p>
                <div className={styles.nudgeEjemplos}>
                  <div className={styles.nudgeEjemplo}>
                    <span className={styles.nudgeEjemploIcono}>📊</span>
                    <div>
                      <strong>Declaraciones fiscales pre-rellenadas</strong>
                      <p>
                        Dinamarca y Suecia pre-rellenan la declaración del IRPF con los datos
                        conocidos. El cumplimiento fiscal aumentó drásticamente — solo hay que
                        confirmar o corregir.
                      </p>
                    </div>
                  </div>
                  <div className={styles.nudgeEjemplo}>
                    <span className={styles.nudgeEjemploIcono}>📱</span>
                    <div>
                      <strong>Recordatorios de citas</strong>
                      <p>
                        Mensajes de texto recordando citas médicas reducen el ausentismo un 30%.
                        Simplificar el «recordar» mejora el comportamiento sin cambiar motivación.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Norma social */}
              <div className={styles.nudgeCard}>
                <div className={styles.nudgeCardHeader}>
                  <span className={styles.nudgeNum}>04</span>
                  <h3>Norma social</h3>
                </div>
                <p className={styles.nudgePrincipio}>
                  <em>Comparar con los demás es el nudge más efectivo.</em>
                </p>
                <div className={styles.nudgeEjemplos}>
                  <div className={styles.nudgeEjemplo}>
                    <span className={styles.nudgeEjemploIcono}>💳</span>
                    <div>
                      <strong>Pago de impuestos</strong>
                      <p>
                        «El 87% de sus vecinos ya ha pagado a tiempo» aumenta el pago en plazo.
                        No hay amenaza ni beneficio económico — solo la comparación social.
                      </p>
                    </div>
                  </div>
                  <div className={styles.nudgeEjemplo}>
                    <span className={styles.nudgeEjemploIcono}>💡</span>
                    <div>
                      <strong>Consumo energético</strong>
                      <p>
                        «Su consumo eléctrico es un 12% mayor que el de sus vecinos» reduce
                        el consumo sin coste económico para el distribuidor. Solo información.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Aplicación personal */}
            <div className={styles.aplicacionPersonal}>
              <h2>Diseña tu propio entorno de elección</h2>
              <p>
                No tienes que esperar a que un gobierno o empresa diseñe nudges para ti.
                Puedes aplicar arquitectura de elección en tu vida cotidiana:
              </p>
              <div className={styles.aplicacionGrid}>
                <div className={styles.aplicacionItem}>
                  <span aria-hidden="true">🥦</span>
                  <p>Coloca la fruta en el frigorífico a la altura de los ojos, no el chocolate</p>
                </div>
                <div className={styles.aplicacionItem}>
                  <span aria-hidden="true">🏦</span>
                  <p>Automatiza el ahorro (default) en lugar de decidir cada mes qué transferir</p>
                </div>
                <div className={styles.aplicacionItem}>
                  <span aria-hidden="true">🛒</span>
                  <p>Elimina opciones tentadoras del entorno: si no hay galletas en casa, no las comes</p>
                </div>
                <div className={styles.aplicacionItem}>
                  <span aria-hidden="true">📝</span>
                  <p>Decide compras o inversiones en papel antes de abrir la web de compras</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenido educativo colapsable */}
        <EducationalSection
          title="📚 Profundiza: ética, ilusiones y ciencia"
          subtitle="Debates y matices sobre la psicología de la decisión"
        >
          <section>
            <h2>¿Es el nudge manipulación?</h2>
            <p>
              La crítica más común al nudge es que manipula sin que la persona sea consciente.
              Thaler y Sunstein responden con el concepto de <em>paternalismo libertario</em>:
              el nudge guía hacia opciones mejores preservando la plena libertad de elegir
              cualquier alternativa. A diferencia de un mandato o una prohibición, nadie está
              obligado. La pregunta inversa también es válida: si de todas formas hay que
              diseñar un default, ¿no es mejor que ese default sea el que beneficia más a la persona?
            </p>

            <h2>La ilusión de ser «objetivo»</h2>
            <p>
              Uno de los hallazgos más incómodos de la economía del comportamiento es que nadie
              está exento de sesgos, ni los expertos. Los jueces del experimento israelí son
              profesionales con años de formación; aun así, la glucosa y el descanso determinaron
              sus decisiones más que los méritos del caso. La conciencia de los sesgos no los elimina:
              reduce su impacto, pero no lo suprime completamente.
            </p>

            <h2>Sistema 1 vs. Sistema 2: una simplificación útil</h2>
            <p>
              El modelo de los dos sistemas es una metáfora poderosa, no una descripción neurológica
              exacta. El cerebro no tiene un «módulo Sistema 1» separado físicamente de un «módulo
              Sistema 2». Lo que Kahneman describe son dos modos de procesamiento que se solapan
              y compiten continuamente. La metáfora es útil porque hace visible algo que antes
              parecía opaco: que la mente tiene procesos automáticos e intencionales que no siempre
              están de acuerdo entre sí.
            </p>

            <h2>Por qué los jueces son menos racionales de lo que creemos</h2>
            <p>
              El experimento de los jueces israelíes no es un caso aislado. Estudios similares han
              encontrado el mismo patrón en médicos de urgencias (más errores de diagnóstico al final
              del turno), en comités de admisión universitaria y en decisiones de contratación. El
              hallazgo no es que «los jueces son injustos»: es que <em>todos somos más irracionales
              de lo que creemos</em> cuando el System 2 está agotado.
            </p>

            <div className={styles.warningBox}>
              <strong>Para saber más:</strong> «Pensar rápido, pensar despacio» (Daniel Kahneman, 2011),
              «Nudge» (Thaler y Sunstein, 2008), «La paradoja de la elección» (Barry Schwartz, 2004),
              «Misbehaving» (Richard Thaler, 2015). Todos en español con ediciones de bolsillo accesibles.
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-toma-decisiones')} />

        <ShareCard appName="visualizador-toma-decisiones" />

        <Footer appName="visualizador-toma-decisiones" />
    </div>
  );
}
