'use client';
// @disclaimer: exempt

import { useState, useEffect, useCallback } from 'react';
import styles from './JuegoMemoria.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type Dificultad = 'facil' | 'medio' | 'dificil';

interface Carta {
  id: number;
  emoji: string;
  parejaId: number;
  volteada: boolean;
  encontrada: boolean;
}

interface MejorTiempo {
  facil: number | null;
  medio: number | null;
  dificil: number | null;
}

const EMOJIS = [
  '🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑',
  '🌸', '🌺', '🌻', '🌹', '🌷', '💐', '🌼', '🪻',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
  '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🎱', '🏓',
];

const CONFIGURACION: Record<Dificultad, { parejas: number; columnas: number }> = {
  facil: { parejas: 6, columnas: 4 },
  medio: { parejas: 8, columnas: 4 },
  dificil: { parejas: 12, columnas: 6 },
};

// Mezclar array
const mezclar = <T,>(array: T[]): T[] => {
  const mezclado = [...array];
  for (let i = mezclado.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mezclado[i], mezclado[j]] = [mezclado[j], mezclado[i]];
  }
  return mezclado;
};

// Generar cartas
const generarCartas = (dificultad: Dificultad): Carta[] => {
  const { parejas } = CONFIGURACION[dificultad];
  const emojisSeleccionados = mezclar(EMOJIS).slice(0, parejas);

  const cartas: Carta[] = [];
  emojisSeleccionados.forEach((emoji, index) => {
    cartas.push(
      { id: index * 2, emoji, parejaId: index, volteada: false, encontrada: false },
      { id: index * 2 + 1, emoji, parejaId: index, volteada: false, encontrada: false }
    );
  });

  return mezclar(cartas);
};

// Formatear tiempo
const formatearTiempo = (segundos: number): string => {
  const mins = Math.floor(segundos / 60);
  const secs = segundos % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function JuegoMemoriaPage() {
  const [dificultad, setDificultad] = useState<Dificultad>('facil');
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<number[]>([]);
  const [movimientos, setMovimientos] = useState(0);
  const [tiempo, setTiempo] = useState(0);
  const [juegoActivo, setJuegoActivo] = useState(false);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [mejoresTiempos, setMejoresTiempos] = useState<MejorTiempo>({
    facil: null,
    medio: null,
    dificil: null,
  });

  // Cargar mejores tiempos
  useEffect(() => {
    const saved = localStorage.getItem('memory-best');
    if (saved) {
      try {
        setMejoresTiempos(JSON.parse(saved));
      } catch {
        // Ignorar
      }
    }
  }, []);

  // Iniciar juego
  const iniciarJuego = useCallback((dif: Dificultad) => {
    setDificultad(dif);
    setCartas(generarCartas(dif));
    setSeleccionadas([]);
    setMovimientos(0);
    setTiempo(0);
    setJuegoActivo(true);
    setJuegoTerminado(false);
  }, []);

  // Iniciar con dificultad actual al montar
  useEffect(() => {
    iniciarJuego(dificultad);
  }, []);

  // Temporizador
  useEffect(() => {
    let intervalo: NodeJS.Timeout;
    if (juegoActivo && !juegoTerminado) {
      intervalo = setInterval(() => {
        setTiempo(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [juegoActivo, juegoTerminado]);

  // Verificar si el juego terminó
  useEffect(() => {
    if (cartas.length > 0 && cartas.every(c => c.encontrada)) {
      setJuegoTerminado(true);
      setJuegoActivo(false);

      // Guardar mejor tiempo
      const mejorActual = mejoresTiempos[dificultad];
      if (mejorActual === null || tiempo < mejorActual) {
        const nuevosMejores = { ...mejoresTiempos, [dificultad]: tiempo };
        setMejoresTiempos(nuevosMejores);
        localStorage.setItem('memory-best', JSON.stringify(nuevosMejores));
      }
    }
  }, [cartas, tiempo, dificultad, mejoresTiempos]);

  // Click en carta
  const clickCarta = (id: number) => {
    if (!juegoActivo || juegoTerminado) return;
    if (seleccionadas.length >= 2) return;

    const carta = cartas.find(c => c.id === id);
    if (!carta || carta.volteada || carta.encontrada) return;

    const nuevasCartas = cartas.map(c =>
      c.id === id ? { ...c, volteada: true } : c
    );
    setCartas(nuevasCartas);

    const nuevasSeleccionadas = [...seleccionadas, id];
    setSeleccionadas(nuevasSeleccionadas);

    if (nuevasSeleccionadas.length === 2) {
      setMovimientos(m => m + 1);

      const [id1, id2] = nuevasSeleccionadas;
      const carta1 = nuevasCartas.find(c => c.id === id1)!;
      const carta2 = nuevasCartas.find(c => c.id === id2)!;

      if (carta1.parejaId === carta2.parejaId) {
        // ¡Pareja encontrada!
        setTimeout(() => {
          setCartas(prev => prev.map(c =>
            c.id === id1 || c.id === id2 ? { ...c, encontrada: true } : c
          ));
          setSeleccionadas([]);
        }, 300);
      } else {
        // No son pareja, voltear de nuevo
        setTimeout(() => {
          setCartas(prev => prev.map(c =>
            c.id === id1 || c.id === id2 ? { ...c, volteada: false } : c
          ));
          setSeleccionadas([]);
        }, 1000);
      }
    }
  };

  const { columnas } = CONFIGURACION[dificultad];
  const parejasEncontradas = cartas.filter(c => c.encontrada).length / 2;
  const totalParejas = CONFIGURACION[dificultad].parejas;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Juego de Memoria</h1>
        <p className={styles.subtitle}>
          Encuentra todas las parejas de cartas
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Panel de control */}
        <div className={styles.controlPanel}>
          <div className={styles.dificultadSelector}>
            {(['facil', 'medio', 'dificil'] as Dificultad[]).map((d) => (
              <button
                key={d}
                onClick={() => iniciarJuego(d)}
                className={`${styles.dificultadBtn} ${dificultad === d ? styles.active : ''}`}
              >
                {d === 'facil' && '😊 Fácil (6)'}
                {d === 'medio' && '🤔 Medio (8)'}
                {d === 'dificil' && '🧠 Difícil (12)'}
              </button>
            ))}
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statIcon}>⏱️</span>
              <span className={styles.statValor}>{formatearTiempo(tiempo)}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statIcon}>👆</span>
              <span className={styles.statValor}>{movimientos}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statIcon}>✅</span>
              <span className={styles.statValor}>{parejasEncontradas}/{totalParejas}</span>
            </div>
          </div>

          {mejoresTiempos[dificultad] !== null && (
            <div className={styles.mejorTiempo}>
              🏆 Mejor: {formatearTiempo(mejoresTiempos[dificultad]!)}
            </div>
          )}
        </div>

        {/* Tablero */}
        <div
          className={styles.tablero}
          style={{ gridTemplateColumns: `repeat(${columnas}, 1fr)` }}
        >
          {cartas.map((carta) => (
            <button
              key={carta.id}
              onClick={() => clickCarta(carta.id)}
              className={`${styles.carta} ${carta.volteada || carta.encontrada ? styles.volteada : ''} ${carta.encontrada ? styles.encontrada : ''}`}
              disabled={carta.volteada || carta.encontrada}
            >
              <div className={styles.cartaInner}>
                <div className={styles.cartaFront}>❓</div>
                <div className={styles.cartaBack}>{carta.emoji}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Modal de victoria */}
        {juegoTerminado && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2>🎉 ¡Felicidades!</h2>
              <p>Encontraste todas las parejas</p>
              <div className={styles.modalStats}>
                <div>⏱️ Tiempo: <strong>{formatearTiempo(tiempo)}</strong></div>
                <div>👆 Movimientos: <strong>{movimientos}</strong></div>
              </div>
              {mejoresTiempos[dificultad] === tiempo && (
                <p className={styles.nuevoRecord}>🏆 ¡Nuevo récord!</p>
              )}
              <button onClick={() => iniciarJuego(dificultad)} className={styles.playAgainBtn}>
                🔄 Jugar de nuevo
              </button>
            </div>
          </div>
        )}
      </div>

      <EducationalSection
        title="¿Quieres saber más sobre el juego de memoria?"
        subtitle="Descubre cómo entrenar la memoria visual, los beneficios cognitivos y técnicas para mejorar tu concentración"
      >
        {/* ── SECCIÓN 1: Tabla Comparativa ── */}
        <section>
          <h2>Niveles de dificultad comparados</h2>
          <p>
            Cada nivel supone un reto cognitivo diferente. Elige el adecuado según tu
            objetivo y avanza progresivamente para maximizar el beneficio.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Nivel</th>
                  <th>Pares de cartas</th>
                  <th>Tiempo promedio</th>
                  <th>Uso de memoria</th>
                  <th>Beneficio cognitivo</th>
                  <th>Edad recomendada</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>😊 Fácil (4×3)</td>
                  <td>6 pares</td>
                  <td>1-2 min</td>
                  <td>Bajo</td>
                  <td>Iniciación, coordinación visual</td>
                  <td>4-7 años / mayores con deterioro leve</td>
                </tr>
                <tr>
                  <td>🤔 Medio (4×4)</td>
                  <td>8 pares</td>
                  <td>2-4 min</td>
                  <td>Moderado</td>
                  <td>Atención sostenida, memoria a corto plazo</td>
                  <td>8-12 años / adultos principiantes</td>
                </tr>
                <tr>
                  <td>🧠 Difícil (6×4)</td>
                  <td>12 pares</td>
                  <td>5-9 min</td>
                  <td>Alto</td>
                  <td>Memoria de trabajo, concentración profunda</td>
                  <td>12+ años / adultos en entrenamiento</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <section>
          <h2>¿Quién se beneficia más de este juego?</h2>
          <p>
            El juego de memoria no es solo para niños. Cada perfil obtiene ventajas distintas
            según cómo y cuándo lo utilice.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎒</span>
                <h4>Niños en edad escolar</h4>
              </div>
              <p className={styles.escenarioExample}>
                Entre los 5 y los 12 años el cerebro está en pleno desarrollo. Jugar al
                memory refuerza la memoria visual episódica y mejora la capacidad de
                mantener atención en tareas escolares como lectura o matemáticas.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: empezar en nivel fácil y subir de dificultad una vez que completen
                el tablero en menos de 2 minutos de forma consistente.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👴</span>
                <h4>Adultos mayores</h4>
              </div>
              <p className={styles.escenarioExample}>
                El ejercicio cognitivo regular es uno de los factores más estudiados para
                retrasar el deterioro de la memoria asociado al envejecimiento. Jugar 10-15
                minutos al día activa circuitos de recuperación de información visual.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: sesiones cortas (10-15 min) diarias son más eficaces que una sesión
                larga semanal. La consistencia es la clave del beneficio preventivo.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💡</span>
                <h4>Entrenamiento de concentración</h4>
              </div>
              <p className={styles.escenarioExample}>
                Antes de tareas que requieren atención sostenida (estudio, reuniones
                importantes, trabajo creativo), una partida rápida actúa como &quot;calentamiento
                cognitivo&quot;, reduciendo el tiempo para alcanzar el estado de flujo.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: usar el nivel medio (8 pares) durante 5 minutos justo antes de
                empezar la tarea exigente. Evitar niveles muy largos que agoten antes de
                comenzar.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ── */}
        <section>
          <h2>Preguntas frecuentes sobre el juego de memoria</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Mejora realmente la memoria jugar a este juego?</summary>
                <p>
                  Sí, aunque con matices. Los estudios sobre entrenamiento cognitivo muestran
                  que el juego de memoria mejora la memoria de trabajo a corto plazo y la
                  capacidad de atención visual. La transferencia a otras habilidades cognitivas
                  (leer, resolver problemas) existe pero es modesta. Para maximizar el beneficio,
                  combínalo con otras actividades: lectura, ejercicio físico y sueño de calidad.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cuántas veces al día es recomendable jugar?</summary>
                <p>
                  Para beneficio cognitivo, 1-3 sesiones de 10-15 minutos al día es el rango
                  óptimo. Más de 30 minutos continuos produce fatiga cognitiva que anula los
                  beneficios y puede volverse contraproducente. La consistencia diaria es más
                  valiosa que sesiones esporádicas largas.
                </p>
                <p className={styles.faqTip}>
                  Referencia: la mayoría de protocolos de entrenamiento cognitivo usan sesiones
                  de 10-20 min, 5 días a la semana.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Qué tipo de memoria ejercita exactamente?</summary>
                <p>
                  Principalmente la memoria de trabajo visual-espacial: recordar dónde está
                  una carta que viste hace unos turnos mientras gestionas la información
                  del turno actual. También activa la memoria episódica (recuerdo de eventos
                  recientes) y la atención selectiva (ignorar las cartas que no son relevantes
                  en ese momento).
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Ayuda a prevenir el deterioro cognitivo?</summary>
                <p>
                  La evidencia científica sugiere que el entrenamiento cognitivo regular puede
                  retrasar o reducir síntomas de deterioro leve. No es una cura ni una garantía,
                  pero junto con ejercicio físico, dieta mediterránea y estimulación social,
                  forma parte de un estilo de vida asociado a mejor salud cerebral en la vejez.
                  Consulta siempre con un profesional sanitario para casos de deterioro cognitivo
                  diagnosticado.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Hay diferencia entre jugar en papel y en digital?</summary>
                <p>
                  Ambos formatos ejercitan la misma memoria visual. La versión digital ofrece
                  ventajas: medición de tiempo, dificultad ajustable, sin necesidad de preparar
                  material y acceso inmediato. La versión en papel puede ser más beneficiosa
                  para niños pequeños al trabajar también la motricidad fina y la manipulación
                  física. Para adultos, ambas son equivalentes en términos de beneficio cognitivo.
                </p>
              </details>
            </li>
          </ul>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <section>
          <h2>Estrategia paso a paso para mejorar tus resultados</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Empieza con dificultad baja</strong>
                <p>
                  Aunque creas que el nivel fácil es demasiado sencillo, comenzar ahí te
                  permite familiarizarte con el ritmo del juego y afinar tu técnica de
                  memorización antes de aumentar la carga cognitiva.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Memoriza la posición antes de voltear</strong>
                <p>
                  Cuando descubres una carta, no te centres solo en el emoji: registra
                  mentalmente su fila y columna en el tablero. Di internamente &quot;🍎 — fila 2,
                  columna 3&quot;. Este etiquetado posicional reduce los errores drásticamente.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Usa patrones visuales por zonas</strong>
                <p>
                  Divide mentalmente el tablero en cuadrantes (arriba-izquierda, arriba-derecha,
                  abajo-izquierda, abajo-derecha). Asocia las cartas que recuerdas a su zona.
                  Es más fácil recordar &quot;la manzana está en la zona superior izquierda&quot; que
                  una coordenada exacta.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Aumenta la dificultad progresivamente</strong>
                <p>
                  Sube de nivel solo cuando completes el tablero actual con menos de la mitad
                  del tiempo promedio para ese nivel (ver tabla). Saltar niveles sin consolidar
                  el anterior genera frustración y no aporta más beneficio cognitivo.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <strong>Juega en sesiones cortas de 10-15 minutos</strong>
                <p>
                  Cuando empieces a cometer errores frecuentes o notes que no recuerdas cartas
                  que acabas de ver, es señal de fatiga cognitiva. Para, descansa y retoma en
                  otra sesión. La calidad de la práctica supera a la cantidad.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <section>
          <h2>Técnicas para sacar el máximo partido</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
              <h4>Divide el tablero en zonas mentales</h4>
              <p>
                Antes de empezar, visualiza el tablero dividido en 4 cuadrantes. Cuando
                descubras una carta, asígnala a su zona. Esta agrupación espacial puede
                ayudar a reducir la carga de la memoria de trabajo durante la partida.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎨</span>
              <h4>Asocia cartas con imágenes memorables</h4>
              <p>
                La memoria asociativa es más potente que la memoria de posición. Cuando
                veas un emoji, crea una historia mental breve: &quot;la fresa está en la esquina
                donde suele estar la ventana&quot;. Las asociaciones absurdas o emocionales se
                recuerdan mejor.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <h4>Consistencia sobre intensidad</h4>
              <p>
                Jugar 10 minutos cada día durante un mes produce más mejora cognitiva que
                jugar 2 horas un solo día a la semana. El cerebro consolida la memoria
                durante el sueño, por lo que sesiones frecuentes dan más oportunidades de
                consolidación.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📈</span>
              <h4>Progresa de dificultad en dificultad</h4>
              <p>
                La mejora cognitiva ocurre en la zona de dificultad óptima: ni tan fácil
                que sea aburrido, ni tan difícil que produzca frustración. Aumenta el nivel
                solo cuando te sientas cómodo y tus tiempos mejoren consistentemente.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box ── */}
        <section>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>4 errores que reducen el beneficio cognitivo</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Jugar más de 30 minutos seguidos.</strong> La fatiga cognitiva
                revierte los beneficios del entrenamiento. Por encima de ese umbral, el
                cerebro empieza a cometer errores por agotamiento, no por falta de
                habilidad, y no aprende de esos errores.
              </li>
              <li>
                <strong>Saltarse niveles sin consolidar el anterior.</strong> Pasar
                directamente de fácil a difícil sin dominar el nivel medio genera
                frustración y no acelera la mejora. El progreso gradual es el único
                camino sostenible.
              </li>
              <li>
                <strong>Jugar con distracciones (música con letra, notificaciones, TV).</strong>{' '}
                El beneficio del juego de memoria depende directamente de la atención
                enfocada. Cada distracción interrumpe la codificación de la posición de
                las cartas y cancela parcialmente el ejercicio cognitivo.
              </li>
              <li>
                <strong>Esperar resultados inmediatos.</strong> La mejora cognitiva es
                gradual y no siempre perceptible a corto plazo. Los estudios sobre
                entrenamiento cognitivo sugieren que la práctica regular durante varias
                semanas puede producir mejoras perceptibles en la memoria cotidiana. La
                constancia, no la velocidad, es lo que produce resultados.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('juego-memoria')} />

      <ShareCard appName="juego-memoria" />
      <Footer appName="juego-memoria" />
    </div>
  );
}
