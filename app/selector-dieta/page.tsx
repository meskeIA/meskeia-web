'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './SelectorDieta.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard, DisclaimerCard, RegionBadge } from '@/components';
import { calcularResultado, DIETAS, PREGUNTAS, type ResultadoCalculo } from './motor';

// Las preguntas con sus pesos, las fichas y el cálculo viven en ./motor.ts.

type Pantalla = 'inicio' | 'test' | 'resultado';

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function SelectorDieta() {
  const [pantalla, setPantalla] = useState<Pantalla>('inicio');
  const [indicePregunta, setIndicePregunta] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);
  const enunciado = useRef<HTMLHeadingElement>(null);
  const nombreResultado = useRef<HTMLHeadingElement>(null);

  // Al cambiar de pantalla o de pregunta se desmonta o se desactiva el botón que tenía el foco
  // («Comenzar», «Siguiente» sin respuesta aún, «Ver resultado»), y el foco caía a <body>: el
  // siguiente Tab salía del cuestionario (3150), el enunciado nuevo quedaba fuera de la vista o
  // bajo la barra del logo (3149) y el resultado, dos mil píxeles por encima (3148). Se lleva al
  // enunciado de la pregunta nueva o al nombre del patrón recomendado, que con su
  // scroll-margin-top quedan a la vista (receta de selector-smartphone, 1680 y 2657).
  useEffect(() => {
    if (pantalla === 'resultado') nombreResultado.current?.focus();
    else if (pantalla === 'test') enunciado.current?.focus();
  }, [pantalla, indicePregunta]);

  const preguntaActual = PREGUNTAS[indicePregunta];
  const totalPreguntas = PREGUNTAS.length;
  const porcentajeProgreso = ((indicePregunta + 1) / totalPreguntas) * 100;

  /**
   * Doble clic y dos toques seguidos (hallazgos 3141 y 3147; receta `clicDeMas` de la familia,
   * 2659 de selector-smartphone). El primer clic cambia la pantalla y el segundo caía sobre lo que
   * hubiera debajo en la nueva: «Comenzar» marcaba la primera respuesta, «Siguiente» de la P6
   * marcaba «Como fuera o con horarios muy irregulares» y «Ver resultado» pulsaba «Repetir el
   * test», que devolvía a la intro con las 10 respuestas borradas. Un clic se ignora cuando es el
   * 2.º de una ráfaga (`detail` > 1, que el teclado no produce) Y el anterior cambió de pantalla.
   */
  const ultimoCambioPantallaRef = useRef(false);
  const clicDeMas = (e: React.MouseEvent<HTMLButtonElement>): boolean =>
    e.detail > 1 && ultimoCambioPantallaRef.current;
  const registrarClic = (cambiaPantalla: boolean) => {
    ultimoCambioPantallaRef.current = cambiaPantalla;
  };

  // Lo que el segundo toque pisa no siempre es de esta app (Apps relacionadas, el aviso legal), y
  // `clicDeMas` no alcanza un enlace ajeno. La misma regla, en fase de captura sobre window
  // (selector-alquiler-vs-compra, 7cc1064e). Un clic suelto (detail 1) cierra la ráfaga.
  useEffect(() => {
    function filtrar(e: MouseEvent) {
      if (e.detail > 1 && ultimoCambioPantallaRef.current) {
        e.preventDefault();
        e.stopPropagation();
      } else if (e.detail <= 1) {
        ultimoCambioPantallaRef.current = false;
      }
    }
    window.addEventListener('click', filtrar, true);
    return () => window.removeEventListener('click', filtrar, true);
  }, []);

  const handleEmpezar = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (clicDeMas(e)) return;
    registrarClic(true);
    setPantalla('test');
    setIndicePregunta(0);
    setRespuestas({});
    setResultado(null);
  };

  const seleccionarOpcion = (valor: string) => {
    registrarClic(false);
    setRespuestas((prev) => ({ ...prev, [preguntaActual.id]: valor }));
  };

  const handleSeleccionarOpcion = (e: React.MouseEvent<HTMLButtonElement>, valor: string) => {
    if (clicDeMas(e)) return;
    seleccionarOpcion(valor);
  };

  /**
   * Teclado del patrón de radios (WAI-ARIA APG, hallazgo 3151; 1681 de selector-smartphone): las
   * flechas mueven el foco a la opción vecina y la marcan, con vuelta al principio, e Inicio/Fin
   * van a los extremos. El grupo es UNA parada de Tab (tabindex itinerante).
   */
  const teclaEnOpcion = (e: React.KeyboardEvent<HTMLButtonElement>, indice: number) => {
    const total = preguntaActual.opciones.length;
    let destino: number;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') destino = (indice + 1) % total;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') destino = (indice - 1 + total) % total;
    else if (e.key === 'Home') destino = 0;
    else if (e.key === 'End') destino = total - 1;
    else return;
    e.preventDefault();
    seleccionarOpcion(preguntaActual.opciones[destino].valor);
    const radios = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    radios?.[destino]?.focus();
  };

  // Avanza a la pregunta SIGUIENTE A LA PULSADA (`indicePregunta + 1` del render, no `i => i + 1`):
  // dos clics antes de repintar no saltan una pregunta. Y solo con la pregunta respondida: el
  // `disabled` lo pone el render, y un clic que llega antes de repintar no lo ve.
  const handleSiguiente = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (clicDeMas(e) || !respuestas[preguntaActual.id]) return;
    registrarClic(true);
    if (indicePregunta < totalPreguntas - 1) {
      setIndicePregunta(indicePregunta + 1);
    } else {
      setResultado(calcularResultado(respuestas));
      setPantalla('resultado');
    }
  };

  const handleAnterior = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (clicDeMas(e)) return;
    registrarClic(true);
    if (indicePregunta > 0) {
      setIndicePregunta(indicePregunta - 1);
    } else {
      setPantalla('inicio');
    }
  };

  const handleRepetir = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (clicDeMas(e)) return;
    registrarClic(true);
    setPantalla('inicio');
    setIndicePregunta(0);
    setRespuestas({});
    setResultado(null);
  };

  const dietaInfo = resultado ? DIETAS[resultado.dieta] : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* ── Hero ─────────────────────────────────── */}
      {pantalla !== 'resultado' ? (
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}>¿Qué alimentación te conviene?</h1>
          <p className={styles.heroSubtitle}>Más allá de las modas: el patrón que encaja con tu vida real</p>
        </header>
      ) : (
        // El resultado no tenía <h1>: el hero eran dos <p> (hallazgo 3153).
        <header className={styles.heroResultados}>
          <h1 className={styles.heroTitleSm}>Tu patrón alimentario</h1>
          <p className={styles.heroSubtitleSm}>{dietaInfo?.nombre ?? ''}</p>
        </header>
      )}

      {/* Presupuestos en €/mes, contexto culinario español y el colegio profesional de España; la
          orientación vale en cualquier país (hallazgo 3163; 949 de selector-smartphone). */}
      <RegionBadge variant="es-data" />

      <LegalNotice />
      <DisclaimerCard variant="medical" severity="high" />

      {/* ── Pantalla inicio ──────────────────────── */}
      {pantalla === 'inicio' && (
        <main className={styles.introContainer}>
          <div className={styles.introCard}>
            <div className={styles.introIconGrid} aria-hidden="true">
              <span className={styles.introIcon}>🥗</span>
              <span className={styles.introIcon}>🥑</span>
              <span className={styles.introIcon}>🐟</span>
              <span className={styles.introIcon}>🌿</span>
            </div>
            <h2 className={styles.introTitulo}>Encuentra tu patrón alimentario ideal</h2>
            <p className={styles.introDesc}>
              10 preguntas sobre tus objetivos, salud, estilo de vida y valores para descubrir qué dieta
              se adapta realmente a ti — no a las tendencias del momento.
            </p>
            <ul className={styles.introFeatures}>
              <li><span aria-hidden="true">🎯</span> 6 patrones alimentarios analizados</li>
              <li><span aria-hidden="true">⏱️</span> Solo 2-3 minutos</li>
              <li><span aria-hidden="true">🔒</span> Sin registro ni datos personales</li>
              <li><span aria-hidden="true">🇪🇸</span> Adaptado al contexto español</li>
            </ul>
            <button type="button" className={styles.btnStart} onClick={handleEmpezar}>
              Comenzar el test
            </button>
          </div>
        </main>
      )}

      {/* ── Pantalla test ────────────────────────── */}
      {pantalla === 'test' && (
        <main className={styles.testContainer}>
          <div className={styles.progresoWrap}>
            <div className={styles.progresoInfo}>
              <span className={styles.progresoPaso}>
                Pregunta {indicePregunta + 1} de {totalPreguntas}
              </span>
              <span className={styles.progresoCategoria}>{preguntaActual.categoria}</span>
            </div>
            <div
              className={styles.progresoBar}
              role="progressbar"
              // Lo anunciado y lo pintado van sobre la misma escala: el relleno es n / 10, y con
              // mínimo 1 se anunciaba (n − 1) / 9 (hallazgo 3152; forma del 951 de la familia).
              aria-valuenow={indicePregunta + 1}
              aria-valuemin={0}
              aria-valuemax={totalPreguntas}
              aria-valuetext={`Pregunta ${indicePregunta + 1} de ${totalPreguntas}`}
              aria-label={`Progreso del test: pregunta ${indicePregunta + 1} de ${totalPreguntas}`}
            >
              <div
                className={styles.progresoRelleno}
                style={{ width: `${porcentajeProgreso}%` }}
              />
            </div>
          </div>

          <div className={styles.preguntaCard}>
            <span className={styles.preguntaIcon} aria-hidden="true">{preguntaActual.icono}</span>
            <h2 className={styles.preguntaTexto} ref={enunciado} tabIndex={-1}>{preguntaActual.texto}</h2>
            {/* Elección ÚNICA: radiogroup con radios y aria-checked, no conmutadores aria-pressed
                (hallazgo 3151; 950 de la familia). */}
            <div className={styles.opcionesGrid} role="radiogroup" aria-label={preguntaActual.texto}>
              {preguntaActual.opciones.map((op, indice) => (
                <button
                  key={op.valor}
                  type="button"
                  className={`${styles.opcionBtn} ${respuestas[preguntaActual.id] === op.valor ? styles.opcionSeleccionada : ''}`}
                  onClick={(e) => handleSeleccionarOpcion(e, op.valor)}
                  role="radio"
                  aria-checked={respuestas[preguntaActual.id] === op.valor}
                  // Tabindex itinerante: la marcada, o la primera si no hay ninguna.
                  tabIndex={
                    respuestas[preguntaActual.id]
                      ? respuestas[preguntaActual.id] === op.valor ? 0 : -1
                      : indice === 0 ? 0 : -1
                  }
                  onKeyDown={(e) => teclaEnOpcion(e, indice)}
                >
                  <span className={styles.opcionEtiqueta}>{op.etiqueta}</span>
                  <span className={styles.opcionDesc}>{op.descripcion}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.navegacion}>
            <button type="button" className={styles.btnAnterior} onClick={handleAnterior}>
              ← Anterior
            </button>
            <button
              type="button"
              className={styles.btnSiguiente}
              onClick={handleSiguiente}
              disabled={!respuestas[preguntaActual.id]}
            >
              {indicePregunta < totalPreguntas - 1 ? 'Siguiente →' : 'Ver resultado'}
            </button>
          </div>
        </main>
      )}

      {/* ── Pantalla resultado ───────────────────── */}
      {pantalla === 'resultado' && resultado && dietaInfo && (
        <main className={styles.resultadosContainer}>
          {/* Tarjeta principal */}
          <div className={styles.recomendacionCard}>
            <span className={styles.recomendacionIcon} aria-hidden="true">{dietaInfo.icono}</span>
            <p className={styles.recomendacionLabel}>Tu patrón recomendado</p>
            <h2 className={styles.recomendacionValor} ref={nombreResultado} tabIndex={-1}>{dietaInfo.nombre}</h2>
            <p className={styles.recomendacionPerfil}>{dietaInfo.perfil}</p>
            <p className={styles.recomendacionDesc}>{dietaInfo.descripcion}</p>
          </div>

          {/* Un empate en cabeza lo deshace el orden de declaración: se dice (hallazgo 3145). */}
          {resultado.empatadas.length > 0 && (
            <p className={styles.nota} role="note">
              <span aria-hidden="true">⚖️</span> Empate: con tus respuestas,{' '}
              {resultado.empatadas.map((d) => `«${DIETAS[d].nombre}»`).join(' y ')}{' '}
              {resultado.empatadas.length === 1 ? 'tiene' : 'tienen'} los mismos puntos ({resultado.puntos[resultado.dieta]})
              que «{dietaInfo.nombre}». Aparece en primer lugar solo por el orden de la lista, no por encajar
              mejor: mira también {resultado.empatadas.length === 1 ? 'la otra' : 'las otras'}.
            </p>
          )}

          {/* Lo declarado que este patrón no recoge, a la vista (hallazgos 3142-3146). */}
          {resultado.notas.map((nota) => (
            <p key={nota} className={styles.nota} role="note">
              <span aria-hidden="true">⚠️</span> {nota}
            </p>
          ))}

          {/* Stats: macros / dificultad / coste */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Macros orientativos</p>
              <p className={styles.statValor}>{dietaInfo.macros}</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Dificultad de transición</p>
              <p className={styles.statValor}>{dietaInfo.dificultad}</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Coste estimado</p>
              <p className={styles.statValor}>{dietaInfo.coste}</p>
            </div>
          </div>

          {/* Alimentos clave */}
          <section className={styles.alimentosSection} aria-label="Alimentos clave de esta dieta">
            <p className={styles.alimentosTitulo}><span aria-hidden="true">✅</span> Alimentos clave</p>
            {dietaInfo.alimentosClave.map((alimento) => (
              <p key={alimento} className={styles.alimentoItem}>{alimento}</p>
            ))}
          </section>

          {/* Alimentos a limitar */}
          <section className={styles.limitarSection} aria-label="Alimentos a limitar en esta dieta">
            <p className={styles.limitarTitulo}>↓ Reducir o evitar</p>
            {dietaInfo.aLimitar.map((alimento) => (
              <p key={alimento} className={styles.limitarItem}>{alimento}</p>
            ))}
          </section>

          {/* Consejos prácticos */}
          <section className={styles.consejosSection} aria-label="Consejos prácticos de transición">
            <p className={styles.consejosTitulo}><span aria-hidden="true">💡</span> Consejos para empezar</p>
            {dietaInfo.consejos.map((consejo) => (
              <p key={consejo} className={styles.consejoItem}>{consejo}</p>
            ))}
          </section>

          {/* Aviso: los perfiles de riesgo vivían solo en la guía plegada, y una advertencia de
              salud no va dentro de <EducationalSection> (hallazgo 3156). */}
          <div className={styles.warningBox} role="note">
            <strong>Aviso importante:</strong> Esta herramienta es orientativa y no sustituye el consejo de
            un dietista-nutricionista o médico. Si tienes condiciones de salud diagnosticadas, consulta siempre
            con un profesional antes de cambiar tu alimentación. Hazlo también antes de empezar si estás
            embarazada o en período de lactancia, si tienes menos de 18 o más de 70 años, si tienes una
            enfermedad renal, o si vas a seguir una dieta vegana, cetogénica o un ayuno de forma estricta.
          </div>

          {/* Repetir test */}
          <button type="button" className={styles.btnRepetir} onClick={handleRepetir}>
            <span aria-hidden="true">🔄</span> Repetir el test
          </button>

        </main>
      )}

      {/* Guía educativa, en TODAS las pantallas (hallazgo 3157; 2663 de selector-smartphone). Vivía
          dentro de la rama del resultado: el HTML servido no traía ni una línea de ella, y quien no
          terminaba las 10 preguntas no podía abrirla. */}
      <div className={styles.guiaContainer}>
        <EducationalSection
          title="¿Qué debes saber sobre los patrones alimentarios?"
          subtitle="Claves para entender la nutrición más allá de las modas"
          defaultOpen={false}
        >
          <h3>Diferencia entre dieta y patrón alimentario</h3>
          <p>
            Una <strong>dieta</strong> suele asociarse a restricciones temporales con un objetivo puntual (perder
            peso para el verano). Un <strong>patrón alimentario</strong> es la forma habitual de comer a largo
            plazo: qué alimentos predominan, en qué proporciones y con qué frecuencia. La evidencia científica
            apoya los patrones sostenibles sobre las dietas restrictivas de corta duración.
          </p>

          <h3>Por qué la mediterránea es la más respaldada</h3>
          <p>
            La dieta mediterránea cuenta con décadas de investigación y es el patrón más recomendado por
            organismos como la OMS y la EFSA. El estudio PREDIMED (realizado en España) demostró una reducción
            del 30&nbsp;% en eventos cardiovasculares mayores. Su ventaja clave: es sostenible culturalmente en
            España, variada y sin prohibiciones absolutas.
          </p>

          <h3>Cómo hacer la transición sin fracasar</h3>
          {/* Decía «El cerebro necesita entre 3 y 8 semanas para consolidar un nuevo hábito», sin
              fuente y contra el estudio que cita el catálogo (hallazgo 3160). */}
          <p>
            Los cambios drásticos e inmediatos suelen revertirse. La estrategia más eficaz es la <strong>
            sustitución gradual</strong>: en lugar de eliminar, sustituye un alimento cada semana. Ejemplo:
            pan blanco → integral en semana 1; leche entera → semidesnatada en semana 2. Ten paciencia: en el
            estudio más citado sobre hábitos (Lally y colaboradores, European Journal of Social Psychology,
            2010), una conducta nueva tardó una mediana de 66 días en volverse automática, con un rango de 18
            a 254 días según la persona y el hábito.
          </p>

          <h3>La importancia de la adherencia a largo plazo</h3>
          <p>
            La mejor dieta es la que puedes mantener. Un patrón razonable que sigues durante años, aunque no
            sea perfecto, suele llevar más lejos que una dieta estricta que se abandona a los pocos meses. Por
            eso, la flexibilidad y el placer al comer no son enemigos de la salud: son aliados de la
            consistencia.
          </p>

          <h3>Cuándo consultar con un dietista-nutricionista</h3>
          <p>
            Esta herramienta es orientativa. Consulta con un profesional colegiado si: tienes una condición
            de salud diagnosticada (diabetes, enfermedad renal, cardiovascular), estás embarazada o en período
            de lactancia, tienes menos de 18 o más de 70 años, o si quieres adoptar una dieta vegana o
            cetogénica estricta. El Colegio Oficial de Dietistas-Nutricionistas de España (CODINUA) ofrece
            un buscador de profesionales en su web oficial.
          </p>
        </EducationalSection>
      </div>

      <ShareCard appName="selector-dieta" />
      <RelatedApps />
      <Footer appName="selector-dieta" />
    </div>
  );
}
