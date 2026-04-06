'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
import 'flag-icons/css/flag-icons.min.css';
import styles from './QuizPaisesCapitales.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { countries, Country } from '@/data/countries';
import EducationalSection from '@/components/EducationalSection';

type ModoJuego = 'capital' | 'pais' | 'bandera';
type Dificultad = 'facil' | 'normal' | 'dificil' | 'experto' | 'maestro';

interface PreguntaQuiz {
  pais: Country;
  opciones: string[]; // 4 opciones de respuesta (texto)
  respuestaCorrecta: string;
}

const DIFICULTAD_CONFIG: Record<Dificultad, { label: string; preguntas: number; continentes: string[] }> = {
  facil:   { label: '🟢 Fácil',   preguntas: 10, continentes: ['Europa'] },
  normal:  { label: '🟡 Normal',  preguntas: 15, continentes: ['Europa', 'América'] },
  dificil: { label: '🟠 Difícil', preguntas: 20, continentes: ['Europa', 'América', 'Asia'] },
  experto: { label: '🔴 Experto', preguntas: 25, continentes: ['Europa', 'América', 'Asia', 'África'] },
  maestro: { label: '⭐ Maestro', preguntas: 30, continentes: [] }, // todos los continentes
};

const MODO_CONFIG: Record<ModoJuego, { label: string; icon: string; desc: string }> = {
  capital: { label: 'Capital', icon: '🏛️', desc: '¿Cuál es la capital de...?' },
  pais:    { label: 'País',    icon: '🌍', desc: '¿A qué país pertenece esta capital?' },
  bandera: { label: 'Bandera', icon: '🚩', desc: 'Identifica el país por su bandera' },
};

const LETRAS = ['A', 'B', 'C', 'D'];

function mezclar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generarOpciones(correcto: string, pool: string[], total = 4): string[] {
  const incorrectos = mezclar(pool.filter(o => o !== correcto)).slice(0, total - 1);
  return mezclar([correcto, ...incorrectos]);
}

function generarPreguntas(modo: ModoJuego, dificultad: Dificultad): PreguntaQuiz[] {
  const cfg = DIFICULTAD_CONFIG[dificultad];
  const pool = cfg.continentes.length > 0
    ? countries.filter(c => cfg.continentes.includes(c.continent))
    : countries;

  const seleccionados = mezclar(pool).slice(0, cfg.preguntas);

  return seleccionados.map(pais => {
    let respuestaCorrecta: string;
    let poolRespuestas: string[];

    if (modo === 'capital') {
      respuestaCorrecta = pais.capital;
      poolRespuestas = pool.map(c => c.capital);
    } else {
      // modo 'pais' o 'bandera' → respuesta es el nombre del país
      respuestaCorrecta = pais.name;
      poolRespuestas = pool.map(c => c.name);
    }

    const opciones = generarOpciones(respuestaCorrecta, poolRespuestas);
    return { pais, opciones, respuestaCorrecta };
  });
}

function calcularPuntuacion(correctas: number, total: number): number {
  const pct = correctas / total;
  if (pct >= 0.9) return 100;
  if (pct >= 0.7) return Math.round(60 + (pct - 0.7) / 0.2 * 40);
  if (pct >= 0.5) return Math.round(40 + (pct - 0.5) / 0.2 * 20);
  return Math.round(pct * 80);
}

function getResultadoTexto(pct: number): { emoji: string; titulo: string } {
  if (pct >= 0.9) return { emoji: '🏆', titulo: '¡Geógrafo experto!' };
  if (pct >= 0.7) return { emoji: '⭐', titulo: '¡Muy buena puntuación!' };
  if (pct >= 0.5) return { emoji: '👍', titulo: 'Buen intento' };
  return { emoji: '📚', titulo: 'Sigue practicando' };
}

type Pantalla = 'config' | 'quiz' | 'resultado';

export default function QuizPaisesCapitalesPage() {
  const [pantalla, setPantalla] = useState<Pantalla>('config');
  const [modo, setModo] = useState<ModoJuego>('capital');
  const [dificultad, setDificultad] = useState<Dificultad>('normal');
  const [preguntas, setPreguntas] = useState<PreguntaQuiz[]>([]);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [correctas, setCorrectas] = useState(0);
  const [tiempoInicio, setTiempoInicio] = useState<number>(0);
  const [tiempoTotal, setTiempoTotal] = useState<number>(0);

  const pregunta = preguntas[preguntaActual];
  const totalPreguntas = preguntas.length;
  const esUltima = preguntaActual === totalPreguntas - 1;

  const iniciarQuiz = useCallback(() => {
    const nuevasPreguntas = generarPreguntas(modo, dificultad);
    setPreguntas(nuevasPreguntas);
    setPreguntaActual(0);
    setSeleccionada(null);
    setCorrectas(0);
    setTiempoInicio(Date.now());
    setPantalla('quiz');
  }, [modo, dificultad]);

  const responder = useCallback((opcion: string) => {
    if (seleccionada !== null) return;
    setSeleccionada(opcion);
    if (opcion === pregunta.respuestaCorrecta) {
      setCorrectas(prev => prev + 1);
    }
  }, [seleccionada, pregunta]);

  const siguiente = useCallback(() => {
    if (esUltima) {
      setTiempoTotal(Math.round((Date.now() - tiempoInicio) / 1000));
      setPantalla('resultado');
    } else {
      setPreguntaActual(prev => prev + 1);
      setSeleccionada(null);
    }
  }, [esUltima, tiempoInicio]);

  const reiniciar = useCallback(() => {
    iniciarQuiz();
  }, [iniciarQuiz]);

  const volverConfig = useCallback(() => {
    setPantalla('config');
  }, []);

  const puntuacion = useMemo(
    () => calcularPuntuacion(correctas, totalPreguntas),
    [correctas, totalPreguntas]
  );

  const resultadoTexto = useMemo(
    () => getResultadoTexto(totalPreguntas > 0 ? correctas / totalPreguntas : 0),
    [correctas, totalPreguntas]
  );

  const formatTiempo = (seg: number): string => {
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Quiz Países y Capitales 🌍</h1>
        <p className={styles.subtitle}>
          Pon a prueba tus conocimientos de geografía mundial
        </p>
      </header>

      <LegalNotice />

      {/* ── PANTALLA CONFIGURACIÓN ── */}
      {pantalla === 'config' && (
        <div className={styles.configPanel}>
          <h2 className={styles.configTitle}>Elige tu modo de juego</h2>

          <div className={styles.modoGrid}>
            {(Object.entries(MODO_CONFIG) as [ModoJuego, typeof MODO_CONFIG[ModoJuego]][]).map(([key, cfg]) => (
              <button
                key={key}
                className={`${styles.modoBtn} ${modo === key ? styles.active : ''}`}
                onClick={() => setModo(key)}
                aria-pressed={modo === key}
              >
                <span className={styles.modoIcon} aria-hidden="true">{cfg.icon}</span>
                <span className={styles.modoNombre}>{cfg.label}</span>
                <span className={styles.modoDesc}>{cfg.desc}</span>
              </button>
            ))}
          </div>

          <div className={styles.dificultadRow} role="group" aria-label="Nivel de dificultad">
            {(Object.entries(DIFICULTAD_CONFIG) as [Dificultad, typeof DIFICULTAD_CONFIG[Dificultad]][]).map(([key, cfg]) => (
              <button
                key={key}
                className={`${styles.difBtn} ${dificultad === key ? styles.active : ''}`}
                onClick={() => setDificultad(key)}
                aria-pressed={dificultad === key}
              >
                {cfg.label}
              </button>
            ))}
          </div>

          <button className={styles.btnIniciar} onClick={iniciarQuiz}>
            Empezar Quiz — {DIFICULTAD_CONFIG[dificultad].preguntas} preguntas
          </button>
        </div>
      )}

      {/* ── PANTALLA QUIZ ── */}
      {pantalla === 'quiz' && pregunta && (
        <>
          {/* HUD */}
          <div className={styles.hudBar}>
            <div className={styles.hudItem}>
              <span className={styles.hudValor}>{preguntaActual + 1}/{totalPreguntas}</span>
              <span className={styles.hudLabel}>Pregunta</span>
            </div>
            <div className={styles.hudItem}>
              <span className={styles.hudValor}>{correctas}</span>
              <span className={styles.hudLabel}>Correctas</span>
            </div>
            <div className={styles.hudItem}>
              <span className={styles.hudValor}>
                {totalPreguntas > 0 ? Math.round((correctas / Math.max(preguntaActual, 1)) * 100) : 0}%
              </span>
              <span className={styles.hudLabel}>Precisión</span>
            </div>
          </div>

          <div className={styles.progresoBar}>
            <div
              className={styles.progresoFill}
              style={{ width: `${((preguntaActual) / totalPreguntas) * 100}%` }}
              role="progressbar"
              aria-valuenow={preguntaActual}
              aria-valuemin={0}
              aria-valuemax={totalPreguntas}
            />
          </div>

          {/* Pregunta */}
          <div className={styles.preguntaCard}>
            <p className={styles.preguntaNumero}>Pregunta {preguntaActual + 1} de {totalPreguntas}</p>

            {modo === 'bandera' && (
              <span
                className={`fi fi-${pregunta.pais.code} ${styles.preguntaBandera}`}
                role="img"
                aria-label={`Bandera de ${pregunta.pais.name}`}
              />
            )}

            {modo === 'capital' && (
              <p className={styles.preguntaTexto}>
                ¿Cuál es la capital de <strong>{pregunta.pais.name}</strong>?
              </p>
            )}

            {modo === 'pais' && (
              <p className={styles.preguntaTexto}>
                ¿A qué país pertenece la capital <strong>{pregunta.pais.capital}</strong>?
              </p>
            )}

            {modo === 'bandera' && (
              <p className={styles.preguntaTexto}>
                ¿De qué país es esta bandera?
              </p>
            )}
          </div>

          {/* Opciones */}
          <div className={styles.opcionesGrid}>
            {pregunta.opciones.map((opcion, i) => {
              let claseExtra = '';
              if (seleccionada !== null) {
                if (opcion === pregunta.respuestaCorrecta) claseExtra = styles.opcionCorrecta;
                else if (opcion === seleccionada) claseExtra = styles.opcionIncorrecta;
                else claseExtra = styles.opcionNeutral;
              }
              return (
                <button
                  key={opcion}
                  className={`${styles.opcion} ${claseExtra}`}
                  onClick={() => responder(opcion)}
                  disabled={seleccionada !== null}
                  aria-label={`Opción ${LETRAS[i]}: ${opcion}`}
                >
                  <span className={styles.opcionLetra}>{LETRAS[i]}</span>
                  {opcion}
                </button>
              );
            })}
          </div>

          {/* Feedback y botón siguiente */}
          {seleccionada !== null && (
            <>
              <div
                className={`${styles.feedbackBanner} ${seleccionada === pregunta.respuestaCorrecta ? styles.feedbackCorrecto : styles.feedbackIncorrecto}`}
                role="alert"
                aria-live="polite"
              >
                {seleccionada === pregunta.respuestaCorrecta
                  ? `✅ ¡Correcto! La respuesta es ${pregunta.respuestaCorrecta}.`
                  : `❌ Incorrecto. La respuesta correcta es ${pregunta.respuestaCorrecta}.`}
              </div>
              <button className={styles.btnSiguiente} onClick={siguiente}>
                {esUltima ? 'Ver resultados' : 'Siguiente pregunta →'}
              </button>
            </>
          )}
        </>
      )}

      {/* ── PANTALLA RESULTADO ── */}
      {pantalla === 'resultado' && (
        <div className={styles.resultadoPanel}>
          <span className={styles.resultadoEmoji} aria-hidden="true">{resultadoTexto.emoji}</span>
          <h2 className={styles.resultadoTitulo}>{resultadoTexto.titulo}</h2>
          <p className={styles.resultadoPuntos}>{puntuacion} pts</p>
          <p className={styles.resultadoSubtitulo}>
            {correctas} de {totalPreguntas} respuestas correctas
          </p>

          <div className={styles.statsResultado}>
            <div className={styles.statR}>
              <span className={styles.statRValor}>{correctas}/{totalPreguntas}</span>
              <p className={styles.statRLabel}>Correctas</p>
            </div>
            <div className={styles.statR}>
              <span className={styles.statRValor}>
                {Math.round((correctas / totalPreguntas) * 100)}%
              </span>
              <p className={styles.statRLabel}>Acierto</p>
            </div>
            <div className={styles.statR}>
              <span className={styles.statRValor}>{formatTiempo(tiempoTotal)}</span>
              <p className={styles.statRLabel}>Tiempo</p>
            </div>
          </div>

          <div className={styles.botonesResultado}>
            <button className={styles.btnRejugar} onClick={reiniciar}>
              🔄 Jugar de nuevo
            </button>
            <button className={styles.btnConfig} onClick={volverConfig}>
              ⚙️ Cambiar modo
            </button>
          </div>
        </div>
      )}

      {/* ── SECCIÓN EDUCATIVA ── */}
      <EducationalSection
        title="Guía de Países y Capitales del Mundo"
        subtitle="Todo lo que necesitas saber para dominar la geografía mundial: capitales confundidas, técnicas de memorización y curiosidades."
        icon="🌍"
      >
        {/* 1. TABLA COMPARATIVA */}
        <section aria-labelledby="edu-tabla">
          <h4 id="edu-tabla">Capitales que más se confunden por región</h4>
          <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Existen 195 países reconocidos por la ONU. Estas son las capitales que más fallos generan en los quizzes de geografía:
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>País</th>
                  <th>Capital correcta</th>
                  <th>Error frecuente</th>
                  <th>Motivo de confusión</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan={4} className={styles.tableRegion}>🇪🇺 Europa</td></tr>
                <tr>
                  <td>Países Bajos</td>
                  <td><strong>Ámsterdam</strong></td>
                  <td>La Haya</td>
                  <td>La Haya es sede del gobierno y parlamento, no la capital oficial</td>
                </tr>
                <tr>
                  <td>Suiza</td>
                  <td><strong>Berna</strong></td>
                  <td>Zúrich / Ginebra</td>
                  <td>Zúrich es la ciudad más grande; Ginebra tiene presencia internacional (ONU)</td>
                </tr>
                <tr>
                  <td>Mónaco</td>
                  <td><strong>Mónaco</strong></td>
                  <td>Monte Carlo</td>
                  <td>Monte Carlo es un barrio famoso, no la capital</td>
                </tr>
                <tr><td colSpan={4} className={styles.tableRegion}>🌏 Asia</td></tr>
                <tr>
                  <td>India</td>
                  <td><strong>Nueva Delhi</strong></td>
                  <td>Bombay (Mumbai)</td>
                  <td>Mumbai es la ciudad más poblada y el centro financiero del país</td>
                </tr>
                <tr>
                  <td>China</td>
                  <td><strong>Pekín (Beijing)</strong></td>
                  <td>Shanghái</td>
                  <td>Shanghái es la ciudad más poblada y el motor económico</td>
                </tr>
                <tr>
                  <td>Kazajistán</td>
                  <td><strong>Astana</strong></td>
                  <td>Almatý</td>
                  <td>Almatý fue la capital hasta 1997; Astana se llamó Nursultán entre 2019-2022</td>
                </tr>
                <tr><td colSpan={4} className={styles.tableRegion}>🌍 África</td></tr>
                <tr>
                  <td>Sudáfrica</td>
                  <td><strong>Pretoria (ejecutiva)</strong></td>
                  <td>Ciudad del Cabo / Johannesburgo</td>
                  <td>Sudáfrica tiene tres capitales: Pretoria, Ciudad del Cabo y Bloemfontein</td>
                </tr>
                <tr>
                  <td>Costa de Marfil</td>
                  <td><strong>Yamusukro</strong></td>
                  <td>Abiyán</td>
                  <td>Abiyán es la ciudad más grande y sede real del gobierno; Yamusukro es capital oficial desde 1983</td>
                </tr>
                <tr><td colSpan={4} className={styles.tableRegion}>🌎 América</td></tr>
                <tr>
                  <td>Canadá</td>
                  <td><strong>Ottawa</strong></td>
                  <td>Toronto / Montreal</td>
                  <td>Toronto es la ciudad más grande; Ottawa fue elegida capital precisamente por ser más neutra</td>
                </tr>
                <tr>
                  <td>Brasil</td>
                  <td><strong>Brasilia</strong></td>
                  <td>São Paulo / Río de Janeiro</td>
                  <td>Brasilia fue construida como capital nueva en 1960; Río fue capital hasta ese año</td>
                </tr>
                <tr>
                  <td>Australia</td>
                  <td><strong>Canberra</strong></td>
                  <td>Sídney / Melbourne</td>
                  <td>Sídney y Melbourne rivalizaban; Canberra fue elegida en 1913 como capital de compromiso</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. CASOS DE USO */}
        <section aria-labelledby="edu-escenarios">
          <h4 id="edu-escenarios">¿Para quién es este quiz?</h4>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
                <strong>Estudiante de ESO/Bachillerato</strong>
              </div>
              <p className={styles.escenarioExample}>
                <em>Situación:</em> Examen de geografía la próxima semana con 40 capitales europeas.
              </p>
              <p className={styles.escenarioTip}>
                Usa el modo <strong>Fácil</strong> para repasar Europa; después <strong>Normal</strong> para añadir América. Haz 3 rondas diarias durante 5 días.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🧠</span>
                <strong>Adulto de cultura general</strong>
              </div>
              <p className={styles.escenarioExample}>
                <em>Situación:</em> Quiere mejorar su conocimiento del mundo para conversaciones y viajes.
              </p>
              <p className={styles.escenarioTip}>
                Empieza en <strong>Normal</strong> y avanza a <strong>Difícil</strong>. Alterna entre modo Capital y modo Bandera para consolidar el aprendizaje.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📋</span>
                <strong>Opositor / Preparador de pruebas</strong>
              </div>
              <p className={styles.escenarioExample}>
                <em>Situación:</em> Necesita memorizar todas las capitales del mundo para una oposición de diplomatía, Cuerpo de Estado o similar.
              </p>
              <p className={styles.escenarioTip}>
                Trabaja directamente en <strong>Experto</strong> y <strong>Maestro</strong>. Enfócate en África y Asia, las regiones con mayor tasa de error.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎲</span>
                <strong>Aficionado al trivial y concursos</strong>
              </div>
              <p className={styles.escenarioExample}>
                <em>Situación:</em> Participa en noches de trivial y quiere destacar en la categoría de Geografía.
              </p>
              <p className={styles.escenarioTip}>
                Prueba el modo <strong>País</strong> (más difícil: te dan la capital y debes encontrar el país). Las capitales de África son las más preguntadas en trivial avanzado.
              </p>
            </div>
          </div>
        </section>

        {/* 3. FAQ */}
        <section aria-labelledby="edu-faq">
          <h4 id="edu-faq">Preguntas frecuentes sobre capitales del mundo</h4>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Cuántos países hay en el mundo?</dt>
              <dd>
                La ONU reconoce <strong>193 estados miembros</strong> más 2 estados observadores (Ciudad del Vaticano y Palestina), lo que da un total de 195 países ampliamente reconocidos. Otros organismos y fuentes pueden ofrecer cifras ligeramente distintas según qué territorios consideren.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Por qué la capital no siempre es la ciudad más grande?</dt>
              <dd>
                Las capitales se eligen por razones políticas, históricas o geográficas. Muchos países han creado capitales nuevas en zonas menos pobladas para equilibrar el desarrollo regional (Brasil → Brasilia), evitar rivalidades entre ciudades (Canadá → Ottawa) o por decisión de un nuevo gobierno (Kazajistán → Astana).
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cuáles son las capitales más recientes que han cambiado?</dt>
              <dd>
                Las más recientes: <strong>Naipyidó</strong> (Birmania/Myanmar, 2006), <strong>Astana</strong> (Kazajistán, recuperó el nombre original en 2022 tras llamarse Nursultán desde 2019), y <strong>Dodoma</strong> (Tanzania, traslado progresivo desde Dar es Salaam que sigue en proceso). Indonesia está construyendo <strong>Nusantara</strong> para sustituir a Yakarta.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué países tienen dos o más capitales?</dt>
              <dd>
                <strong>Sudáfrica</strong> tiene tres: Pretoria (ejecutiva), Ciudad del Cabo (legislativa) y Bloemfontein (judicial). <strong>Bolivia</strong> tiene dos: Sucre (constitucional y sede del Tribunal Supremo) y La Paz (sede del gobierno y legislativo). <strong>Costa de Marfil</strong> tiene capital oficial en Yamusukro, pero el gobierno opera en Abiyán.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cuál es la capital más alta del mundo?</dt>
              <dd>
                <strong>La Paz (Bolivia)</strong> es la sede de gobierno más alta del mundo, a <strong>3.640 metros</strong> sobre el nivel del mar. Le sigue Quito (Ecuador) a 2.850 m. La capital constitucional de Bolivia, Sucre, se sitúa a 2.750 m.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cuál es la capital más fría del mundo?</dt>
              <dd>
                <strong>Astana (Kazajistán)</strong> es la capital más fría del mundo, con temperaturas medias de −14 °C en enero y mínimas que pueden llegar a −35 °C. Le sigue <strong>Ulán Bator (Mongolia)</strong>, con medias de −22 °C en enero. Reykiavik (Islandia) es la capital más fría del hemisferio occidental.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Hay países sin capital oficial reconocida?</dt>
              <dd>
                <strong>Nauru</strong> (Oceanía) no tiene una capital legalmente designada, aunque Yaren actúa como ciudad principal donde se ubican las instituciones. <strong>Kosovo</strong> y algunos territorios en disputa tienen reconocimiento internacional limitado. <strong>Gibraltar, Puerto Rico y otros territorios</strong> tampoco son países independientes con capital.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cómo memorizar las capitales de África eficientemente?</dt>
              <dd>
                África tiene 54 países, lo que la convierte en el continente más difícil. El método más eficaz: <strong>divide el continente en 5 zonas</strong> (Norte, Oeste, Centro, Este, Sur) y aprende entre 10 y 12 países por zona. Usa la asociación fonética (Camerún → Yaundé suena a &quot;yaun-dé&quot;, fácil de imaginar). Practica con mapas en blanco señalando la ubicación y la capital simultáneamente.
              </dd>
            </div>
          </dl>
          <p className={styles.faqTip}>
            💡 <strong>Tip:</strong> Después de leer estas respuestas, pon a prueba tus conocimientos con el quiz en modo <strong>Maestro</strong>. Incluye preguntas de los 5 continentes.
          </p>
        </section>

        {/* 4. GUÍA PASO A PASO */}
        <section aria-labelledby="edu-guia">
          <h4 id="edu-guia">Cómo memorizar 195 capitales: método paso a paso</h4>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Empieza por tu continente (Europa o América)</strong>
                <p>No intentes aprender todo a la vez. Dedica la primera semana solo a Europa (44 países). La familiaridad con los nombres acelera la memorización inicial y te da confianza.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Agrupa países limítrofes en un mapa mental</strong>
                <p>Memoriza los países en grupos geográficos, no en orden alfabético. Por ejemplo, los países bálticos juntos (Estonia→Tallin, Letonia→Riga, Lituania→Vilna). La proximidad geográfica crea asociaciones más fuertes.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Usa asociaciones fonéticas o visuales</strong>
                <p>Para capitales poco intuitivas, inventa una historia absurda y memorable. Ejemplo: &quot;Burkina Faso → Uagadugú&quot; → imagina a un Papá Noel en África diciendo &quot;¡Ua-ga-du-gú!&quot;. Las historias disparatadas se recuerdan mejor.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Practica con mapas en blanco</strong>
                <p>Descarga o dibuja mapas mudos de cada región y escribe las capitales de memoria. La escritura a mano activa más áreas del cerebro que la lectura pasiva. Repite hasta completar el mapa sin errores.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <strong>Aplica el repaso espaciado (cada 3-7 días)</strong>
                <p>Tras aprender un bloque, repásalo a los 3 días, luego a los 7, luego a los 14. Este método (basado en la curva del olvido de Ebbinghaus) es el más eficiente para la retención a largo plazo. Los quizzes de esta app son perfectos para este propósito.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">6</span>
              <div className={styles.stepContent}>
                <strong>Añade el modo Bandera para consolidar</strong>
                <p>Una vez que dominas capital → país, entrena también el reconocimiento visual de banderas. El triple canal (nombre del país, capital, bandera) crea una red de recuerdos mucho más resistente.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">7</span>
              <div className={styles.stepContent}>
                <strong>Enfrenta tus puntos débiles con el nivel Maestro</strong>
                <p>El nivel Maestro mezcla los 195 países. Anota los errores recurrentes (suelen ser siempre los mismos) y dedícales una sesión específica con el método de asociación del paso 3. Tres fallos en la misma capital = crear una historia más exagerada.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* 5. MEJORES PRÁCTICAS */}
        <section aria-labelledby="edu-tips">
          <h4 id="edu-tips">6 hábitos de los expertos en geografía</h4>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
              <strong>Aprende por regiones, no por orden alfabético</strong>
              <p>El orden alfabético no tiene coherencia geográfica. Aprender por zonas (Magreb, Sahel, Cuerno de África…) te da contexto cultural y político que refuerza la memoria.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔗</span>
              <strong>Asocia capital con una característica memorable</strong>
              <p>Para cada capital difícil, encuentra un dato curioso: &quot;Naipyidó tiene más carriles de autopista que coches&quot; o &quot;Astana tiene una pirámide de cristal de 77 metros&quot;. El detalle insólito ancla el nombre.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📝</span>
              <strong>Escribe mapas en blanco a mano</strong>
              <p>El acto físico de escribir consolida la memoria motriz y visual simultáneamente. Completar un mapa mudo de África toma 20 minutos pero fija las capitales mejor que 2 horas de lectura.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔁</span>
              <strong>Repaso espaciado: 3, 7 y 14 días</strong>
              <p>No repases el mismo día que aprendes. El olvido parcial antes del repaso fortalece la memoria a largo plazo. Usa este quiz como herramienta de repaso programado.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌐</span>
              <strong>Practica con países limítrofes en grupo</strong>
              <p>Aprende los países del Cáucaso juntos (Georgia, Armenia, Azerbaiyán), los países bálticos juntos, los del Cono Sur juntos. La proximidad facilita la comparación y reduce los errores de confusión entre vecinos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📺</span>
              <strong>Consume noticias internacionales con un mapa cerca</strong>
              <p>Cuando escuches una capital en las noticias, búscala en el mapa mentalmente antes de buscarla en el teléfono. Esta práctica diaria de 5 minutos supera cualquier técnica de memorización activa.</p>
            </div>
          </div>
        </section>

        {/* 6. WARNING BOX */}
        <section aria-labelledby="edu-errores">
          <div className={styles.warningBox} role="note">
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h4 id="edu-errores">Las 6 capitales que más gente confunde</h4>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Nueva Zelanda → Wellington</strong> (no Auckland).
                Auckland es casi 3 veces más grande, pero Wellington es la capital desde 1865 por su posición central en el país.
              </li>
              <li>
                <strong>Australia → Canberra</strong> (no Sídney ni Melbourne).
                La rivalidad entre Sídney y Melbourne hizo elegir una ciudad neutral intermedia en 1913.
              </li>
              <li>
                <strong>India → Nueva Delhi</strong> (no Mumbai).
                Mumbai supera los 20 millones de habitantes frente a los ~4 millones de la capital. El gobierno está en Delhi desde 1912.
              </li>
              <li>
                <strong>Brasil → Brasilia</strong> (no Río de Janeiro ni São Paulo).
                Río fue capital hasta 1960. Brasilia fue construida desde cero en el interior para descentralizar el país.
              </li>
              <li>
                <strong>Sudáfrica → Pretoria</strong> como capital ejecutiva (no Johannesburgo).
                Johannesburgo es la ciudad más rica y poblada, pero Pretoria es donde reside el gobierno. Recuerda que Sudáfrica tiene tres capitales.
              </li>
              <li>
                <strong>Bolivia → Sucre</strong> como capital constitucional (muchos quizzes aceptan La Paz como sede de gobierno).
                La Paz alberga el gobierno y el parlamento, pero Sucre es la capital oficial según la Constitución boliviana.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('quiz-paises-capitales')} />

      <ShareCard appName="quiz-paises-capitales" />
      <Footer appName="quiz-paises-capitales" />
    </div>
  );
}
