'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './GuiaRespiracion.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  DisclaimerCard,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Fases del ciclo de respiración
type Fase = 'parado' | 'inhala' | 'reten1' | 'exhala' | 'reten2';

// Configuración de una técnica
interface Tecnica {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  inhala: number;   // segundos
  reten1: number;   // retención tras inhalar
  exhala: number;
  reten2: number;   // retención tras exhalar
  usos: string;
}

// Colores y escalas por fase
const FASE_CONFIG: Record<Fase, { texto: string; color: string; escala: number; colorTexto: string }> = {
  parado:  { texto: 'Preparado', color: '#E8F4F8', escala: 0.55, colorTexto: '#2E86AB' },
  inhala:  { texto: 'Inhala...', color: '#2E86AB', escala: 1.0,  colorTexto: '#FFFFFF' },
  reten1:  { texto: 'Retén',    color: '#48A9A6', escala: 1.0,  colorTexto: '#FFFFFF' },
  exhala:  { texto: 'Exhala...', color: '#7FB3D3', escala: 0.45, colorTexto: '#1A1A1A' },
  reten2:  { texto: 'Retén',    color: '#B0DDD9', escala: 0.45, colorTexto: '#1A1A1A' },
};

// Técnicas de respiración disponibles
const TECNICAS: Tecnica[] = [
  {
    id: 'diafragmatica',
    nombre: 'Diafragmática',
    descripcion: 'Básica y natural',
    icono: '🌬️',
    inhala: 4, reten1: 0, exhala: 6, reten2: 0,
    usos: 'Principiantes, EPOC, relajación general',
  },
  {
    id: 'cuadrada',
    nombre: 'Cuadrada',
    descripcion: '4 fases iguales',
    icono: '⬜',
    inhala: 4, reten1: 4, exhala: 4, reten2: 4,
    usos: 'Concentración, calma ante el estrés',
  },
  {
    id: 'cuatro-siete-ocho',
    nombre: '4-7-8',
    descripcion: 'Para ansiedad',
    icono: '💤',
    inhala: 4, reten1: 7, exhala: 8, reten2: 0,
    usos: 'Ansiedad, insomnio, ataques de pánico',
  },
  {
    id: 'coherente',
    nombre: 'Coherente',
    descripcion: 'Ritmo constante',
    icono: '💙',
    inhala: 5, reten1: 0, exhala: 5, reten2: 0,
    usos: 'Equilibrio emocional, meditación',
  },
];

// Secuencia de fases según la técnica
function getFases(t: Tecnica): Fase[] {
  const fases: Fase[] = ['inhala'];
  if (t.reten1 > 0) fases.push('reten1');
  fases.push('exhala');
  if (t.reten2 > 0) fases.push('reten2');
  return fases;
}

// Duración de cada fase
function getDuracion(t: Tecnica, fase: Fase): number {
  switch (fase) {
    case 'inhala':  return t.inhala;
    case 'reten1':  return t.reten1;
    case 'exhala':  return t.exhala;
    case 'reten2':  return t.reten2;
    default: return 0;
  }
}

export default function GuiaRespiracionPage() {
  const [tecnicaId, setTecnicaId] = useState<string>('diafragmatica');
  const [corriendo, setCorriendo] = useState(false);
  const [fase, setFase] = useState<Fase>('parado');
  const [cuenta, setCuenta] = useState(0);
  const [ciclos, setCiclos] = useState(0);
  const [vozActiva, setVozActiva] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const faseIndexRef = useRef(0);
  const cuentaIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tecnica = TECNICAS.find(t => t.id === tecnicaId) ?? TECNICAS[0];
  const fasesSecuencia = getFases(tecnica);
  const configFase = FASE_CONFIG[fase];

  // Limpiar todo al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (cuentaIntervalRef.current) clearInterval(cuentaIntervalRef.current);
    };
  }, []);

  // Hablar la fase con síntesis de voz
  const hablar = useCallback((texto: string) => {
    if (!vozActiva || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(texto);
    utt.lang = 'es-ES';
    utt.rate = 0.85;
    utt.pitch = 1;
    window.speechSynthesis.speak(utt);
  }, [vozActiva]);

  // Avanzar a la siguiente fase
  const avanzarFase = useCallback((
    t: Tecnica,
    fases: Fase[],
    indexActual: number,
    ciclosActuales: number
  ) => {
    const siguienteIndex = (indexActual + 1) % fases.length;
    const esPrimeraCiclo = siguienteIndex === 0;
    const nuevaFase = fases[siguienteIndex];
    const duracion = getDuracion(t, nuevaFase);

    faseIndexRef.current = siguienteIndex;

    if (esPrimeraCiclo) {
      setCiclos(prev => prev + 1);
    }

    setFase(nuevaFase);
    setCuenta(duracion);

    // Voz guiada
    const textoVoz = nuevaFase === 'inhala' ? 'Inhala'
      : nuevaFase === 'reten1' || nuevaFase === 'reten2' ? 'Retén'
      : 'Exhala';
    hablar(textoVoz);

    // Cuenta regresiva
    if (cuentaIntervalRef.current) clearInterval(cuentaIntervalRef.current);
    let c = duracion;
    cuentaIntervalRef.current = setInterval(() => {
      c -= 1;
      setCuenta(c);
    }, 1000);

    // Programar siguiente fase
    timeoutRef.current = setTimeout(() => {
      clearInterval(cuentaIntervalRef.current!);
      avanzarFase(t, fases, siguienteIndex, esPrimeraCiclo ? ciclosActuales + 1 : ciclosActuales);
    }, duracion * 1000);
  }, [hablar]);

  // Iniciar sesión
  const iniciar = useCallback(() => {
    faseIndexRef.current = -1;
    setCiclos(0);
    setCorriendo(true);

    const fases = getFases(tecnica);
    // Arrancar con la primera fase (inhala)
    const primeraFase = fases[0];
    const duracion = getDuracion(tecnica, primeraFase);
    faseIndexRef.current = 0;
    setFase(primeraFase);
    setCuenta(duracion);
    hablar('Inhala');

    if (cuentaIntervalRef.current) clearInterval(cuentaIntervalRef.current);
    let c = duracion;
    cuentaIntervalRef.current = setInterval(() => {
      c -= 1;
      setCuenta(c);
    }, 1000);

    timeoutRef.current = setTimeout(() => {
      clearInterval(cuentaIntervalRef.current!);
      avanzarFase(tecnica, fases, 0, 0);
    }, duracion * 1000);
  }, [tecnica, avanzarFase, hablar]);

  // Detener sesión
  const detener = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (cuentaIntervalRef.current) clearInterval(cuentaIntervalRef.current);
    if (vozActiva && typeof window !== 'undefined') window.speechSynthesis?.cancel();
    setCorriendo(false);
    setFase('parado');
    setCuenta(0);
  }, [vozActiva]);

  // Cambiar técnica (detiene si está corriendo)
  const cambiarTecnica = (id: string) => {
    if (corriendo) detener();
    setTecnicaId(id);
  };

  // Etiqueta del botón principal
  const descripcionFase =
    fase === 'inhala' ? `Inhala durante ${tecnica.inhala} segundos`
    : fase === 'reten1' ? `Retén ${tecnica.reten1} segundos`
    : fase === 'exhala' ? `Exhala durante ${tecnica.exhala} segundos`
    : fase === 'reten2' ? `Retén ${tecnica.reten2} segundos`
    : 'Pulsa Iniciar para comenzar';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🫁 Guía de Respiración Consciente</h1>
        <p className={styles.subtitle}>
          Elige una técnica, pulsa Iniciar y deja que el círculo te guíe.
          Respira con calma y a tu ritmo.
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="medical"
        severity="medium"
        title="Herramienta de bienestar"
      >
        Estas técnicas son ejercicios de bienestar general. Si tienes una condición
        respiratoria (asma, EPOC, SAOS) o cardiovascular, consulta a tu médico antes
        de practicar ejercicios de retención de respiración.
      </DisclaimerCard>

      {/* Selección de técnica */}
      <section className={styles.tecnicas} aria-label="Selección de técnica de respiración">
        <h2 className={styles.seccionTitulo}>Elige tu técnica</h2>
        <div className={styles.tecnicaGrid} role="group" aria-label="Técnicas disponibles">
          {TECNICAS.map(t => (
            <button
              key={t.id}
              className={`${styles.tecnicaCard} ${tecnicaId === t.id ? styles.tecnicaActiva : ''}`}
              onClick={() => cambiarTecnica(t.id)}
              aria-pressed={tecnicaId === t.id}
              aria-label={`${t.nombre}: ${t.descripcion}`}
            >
              <span className={styles.tecnicaIcono} aria-hidden="true">{t.icono}</span>
              <span className={styles.tecnicaNombre}>{t.nombre}</span>
              <span className={styles.tecnicaDesc}>{t.descripcion}</span>
              <span className={styles.tecnicaRitmo}>
                {[t.inhala, t.reten1, t.exhala, t.reten2]
                  .filter(n => n > 0)
                  .join(' - ')}s
              </span>
            </button>
          ))}
        </div>
        <p className={styles.tecnicaUsos}>
          <strong>Ideal para:</strong> {tecnica.usos}
        </p>
      </section>

      {/* Círculo animado */}
      <section className={styles.ejercicioSection} aria-label="Ejercicio de respiración">
        {/* Contador de ciclos */}
        <div className={styles.ciclosInfo} aria-live="polite" aria-atomic="true">
          <span className={styles.ciclosNum}>{ciclos}</span>
          <span className={styles.ciclosLabel}>{ciclos === 1 ? 'ciclo' : 'ciclos'}</span>
        </div>

        {/* Círculo principal */}
        <div
          className={styles.circuloWrapper}
          role="img"
          aria-label={`${configFase.texto}. ${descripcionFase}`}
        >
          <div
            className={styles.circuloExterno}
            style={{
              transform: `scale(${configFase.escala})`,
              backgroundColor: configFase.color,
              transition: fase === 'parado' ? 'none'
                : fase === 'inhala' ? `transform ${tecnica.inhala}s ease-in-out, background-color 0.5s ease`
                : fase === 'exhala' ? `transform ${tecnica.exhala}s ease-in-out, background-color 0.5s ease`
                : 'background-color 0.5s ease',
            }}
          >
            <div className={styles.circuloInterno}>
              {corriendo && cuenta > 0 && (
                <span className={styles.cuentaNum} style={{ color: configFase.colorTexto }}>
                  {cuenta}
                </span>
              )}
              {!corriendo && (
                <span className={styles.iconoEspera} aria-hidden="true">🫁</span>
              )}
            </div>
          </div>
        </div>

        {/* Texto de fase */}
        <div className={styles.faseInfo} aria-live="assertive" aria-atomic="true">
          <p className={styles.faseTitulo} style={{ color: corriendo ? configFase.color : '#2E86AB' }}>
            {corriendo ? configFase.texto : 'Preparado'}
          </p>
          <p className={styles.faseDesc}>{descripcionFase}</p>
        </div>

        {/* Botones */}
        <div className={styles.controles}>
          {!corriendo ? (
            <button
              className={styles.btnIniciar}
              onClick={iniciar}
              aria-label="Iniciar ejercicio de respiración"
            >
              ▶ Iniciar
            </button>
          ) : (
            <button
              className={styles.btnDetener}
              onClick={detener}
              aria-label="Detener ejercicio de respiración"
            >
              ⏹ Detener
            </button>
          )}

          <button
            className={`${styles.btnVoz} ${vozActiva ? styles.vozOn : styles.vozOff}`}
            onClick={() => setVozActiva(prev => !prev)}
            aria-pressed={vozActiva}
            aria-label={vozActiva ? 'Voz guiada activada, pulsar para desactivar' : 'Voz guiada desactivada, pulsar para activar'}
          >
            {vozActiva ? '🔊 Voz activada' : '🔇 Voz desactivada'}
          </button>
        </div>
      </section>

      <EducationalSection
        title="📚 ¿Por qué funciona la respiración consciente?"
        subtitle="Ciencia y beneficios de las técnicas de respiración"
      >
        <section className={styles.guiaSeccion}>
          <h2>El poder de la respiración</h2>
          <p>
            La respiración es la única función vital que podemos controlar conscientemente.
            Al hacerlo, activamos el sistema nervioso parasimpático (el &quot;freno&quot; del estrés)
            y reducimos la respuesta de lucha o huida del cuerpo. En pocos minutos, se puede
            notar una reducción real de la ansiedad y la tensión muscular.
          </p>

          <h2>Las 4 técnicas en detalle</h2>
          <ul>
            <li>
              <strong>🌬️ Diafragmática (4-6)</strong>: La respiración natural y profunda.
              Activa el diafragma en lugar del pecho. La exhalación más larga que la inhalación
              estimula el nervio vago y reduce la frecuencia cardíaca. Ideal para principiantes y EPOC.
            </li>
            <li>
              <strong>⬜ Cuadrada (4-4-4-4)</strong>: Usada por fuerzas especiales y meditadores.
              Las retenciones equilibran el CO₂ en sangre y mejoran la concentración.
              Excelente para prepararse antes de una situación estresante.
            </li>
            <li>
              <strong>💤 4-7-8</strong>: Desarrollada por el Dr. Andrew Weil.
              La retención larga (7s) actúa como sedante natural del sistema nervioso.
              Especialmente eficaz para reducir la ansiedad aguda y facilitar el sueño.
            </li>
            <li>
              <strong>💙 Coherente (5-5)</strong>: Crea coherencia entre el ritmo cardíaco
              y la respiración. Mejora el equilibrio emocional y la variabilidad de la
              frecuencia cardíaca (HRV), un indicador de salud cardiovascular.
            </li>
          </ul>

          <h2>¿Cuándo practicar?</h2>
          <ul>
            <li><strong>Por la mañana</strong>: 5 minutos de respiración cuadrada para arrancar enfocado</li>
            <li><strong>Antes de dormir</strong>: 4-7-8 para desconectar y conciliar el sueño</li>
            <li><strong>En momentos de estrés</strong>: Diafragmática para una calma rápida</li>
            <li><strong>En meditación</strong>: Coherente para un estado de equilibrio profundo</li>
          </ul>

          <h2>Para personas con necesidades especiales</h2>
          <ul>
            <li><strong>Autismo</strong>: El ritmo visual predecible del círculo ayuda a la regulación sensorial</li>
            <li><strong>TDAH</strong>: 2-3 minutos de respiración mejoran la concentración antes de una tarea</li>
            <li><strong>Ansiedad</strong>: La técnica 4-7-8 puede interrumpir un ciclo de ansiedad en pocos ciclos</li>
            <li><strong>EPOC</strong>: La respiración diafragmática mejora la eficiencia respiratoria. Siempre con supervisión médica.</li>
          </ul>
        </section>

        {/* TABLA COMPARATIVA */}
        <section className={styles.guiaSeccion}>
          <h2>Comparativa de las 4 técnicas</h2>
          <p>Elige la técnica según tu objetivo y nivel. Esta tabla resume los aspectos clave de cada una:</p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Técnica</th>
                  <th>Dificultad</th>
                  <th>Duración ciclo</th>
                  <th>Beneficio principal</th>
                  <th>Con retención</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🌬️ Diafragmática</td>
                  <td className={styles.celdaDestacada}>Principiante</td>
                  <td>10 s</td>
                  <td>Relajación general</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td>⬜ Cuadrada</td>
                  <td>Intermedia</td>
                  <td>16 s</td>
                  <td>Concentración</td>
                  <td>Sí</td>
                </tr>
                <tr>
                  <td>💤 4-7-8</td>
                  <td>Intermedia</td>
                  <td>19 s</td>
                  <td>Ansiedad / sueño</td>
                  <td>Sí (7 s)</td>
                </tr>
                <tr>
                  <td>💙 Coherente</td>
                  <td className={styles.celdaDestacada}>Fácil</td>
                  <td>10 s</td>
                  <td>Equilibrio emocional</td>
                  <td>No</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CASOS DE USO */}
        <section className={styles.guiaSeccion}>
          <h2>¿Para quién es esta guía de respiración?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono}>😰</span>
              <h3>Persona con ansiedad situacional</h3>
              <p>Antes de una reunión difícil, un examen o una situación social, 3-5 ciclos de 4-7-8 pueden reducir la respuesta de estrés en menos de 2 minutos.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono}>🫁</span>
              <h3>Paciente en rehabilitación respiratoria</h3>
              <p>La técnica Diafragmática refuerza el trabajo del diafragma, complementando la fisioterapia respiratoria en EPOC o recuperación postoperatoria. Siempre con supervisión médica.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono}>📚</span>
              <h3>Estudiante antes de un examen</h3>
              <p>2-3 minutos de respiración Cuadrada antes de entrar en el aula mejoran la concentración y reducen el estrés previo, sin necesidad de equipo ni espacio especial.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono}>🧩</span>
              <h3>Terapeuta con pacientes autistas</h3>
              <p>El círculo visual predecible y el ritmo constante hacen esta app ideal como herramienta de regulación sensorial. La Diafragmática sin retención es el punto de partida más seguro.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.guiaSeccion}>
          <h2>Preguntas frecuentes</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Cuántos ciclos debo hacer en cada sesión?</dt>
              <dd>Entre 3 y 10 ciclos es suficiente para la mayoría de personas. Más importante que la cantidad es la regularidad: 5 minutos al día tienen más impacto que 30 minutos una vez a la semana.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Puedo usar la app si tengo asma o EPOC?</dt>
              <dd>La técnica Diafragmática (sin retenciones) suele ser compatible con estas condiciones, pero consulta siempre con tu médico antes de practicar ejercicios de retención de aire. La retención puede no ser adecuada para ti.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Por qué el círculo cambia de tamaño?</dt>
              <dd>El círculo se expande durante la inhalación y se contrae durante la exhalación, imitando visualmente el movimiento del pulmón. Este biofeedback visual facilita sincronizar la respiración con la guía, especialmente útil para personas con TDAH o autismo.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué hace exactamente la voz guiada?</dt>
              <dd>Usa la API de síntesis de voz del navegador para pronunciar &quot;Inhala&quot;, &quot;Retén&quot; o &quot;Exhala&quot; al inicio de cada fase. No requiere conexión a internet ni archivos de audio externos. Funciona en todos los navegadores modernos.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Es normal sentir mareo durante las retenciones?</dt>
              <dd>Un ligero mareo puede ocurrir si es tu primera vez practicando retenciones. Si el mareo es intenso o persiste, detén el ejercicio inmediatamente. Si se repite, evita las técnicas con retención y consulta a tu médico.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Puedo usar 4-7-8 si tengo ansiedad severa?</dt>
              <dd>Durante un ataque de pánico activo, la técnica 4-7-8 puede no ser apropiada porque la retención prolongada puede aumentar la sensación de ahogo. En ese momento, la Diafragmática simple es más segura y manejable.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cuánto tiempo tarda en notarse el efecto?</dt>
              <dd>La mayoría de personas notan una reducción del estrés ya en la primera sesión, incluso con solo 3 ciclos. Los beneficios a largo plazo (mejor manejo del estrés, mejor sueño) se desarrollan con práctica diaria durante 2-4 semanas.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Sirve para enseñar a niños a regularse emocionalmente?</dt>
              <dd>Sí, especialmente desde los 6-7 años. La guía visual del círculo hace que sea intuitivo para niños. La Diafragmática es el mejor punto de partida, sin retenciones, y con sesiones cortas de 3-5 ciclos.</dd>
            </div>
          </dl>
        </section>

        {/* GUÍA PASO A PASO */}
        <section className={styles.guiaSeccion}>
          <h2>Cómo realizar tu primera sesión</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div>
                <strong>Elige un lugar tranquilo</strong>
                <p>Siéntate o túmbate cómodamente. No es necesario ningún equipo especial. Asegúrate de que la pantalla sea visible sin tensión en el cuello.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div>
                <strong>Selecciona la técnica adecuada</strong>
                <p>Para tu primera vez, elige Diafragmática o Coherente. Son las más sencillas y no incluyen retenciones.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div>
                <strong>Activa la voz guiada si quieres apoyo auditivo</strong>
                <p>Pulsa el botón de voz para activarla. Así podrás cerrar los ojos y seguir el ritmo solo con el audio.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div>
                <strong>Pulsa Iniciar y sigue el círculo</strong>
                <p>Inhala cuando el círculo crece, exhala cuando se encoge. No fuerces el ritmo; la app va a tu ritmo, no al revés.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div>
                <strong>Respira de forma natural, no forzada</strong>
                <p>Si no llegas al tiempo indicado, no pasa nada. Con la práctica, los tiempos se vuelven cómodos. Lo importante es mantener la calma.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div>
                <strong>Realiza al menos 3-5 ciclos completos</strong>
                <p>Es el mínimo para notar un efecto de relajación. Puedes continuar hasta 10 ciclos si lo deseas.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div>
                <strong>Termina con calma</strong>
                <p>Al pulsar Detener, haz 2 respiraciones naturales antes de levantarte. Evita ponerte de pie bruscamente, especialmente si practicaste retenciones.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* MEJORES PRÁCTICAS */}
        <section className={styles.guiaSeccion}>
          <h2>Buenas prácticas para aprovechar al máximo la app</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono}>📅</span>
              <p><strong>Practica a la misma hora cada día.</strong> La consistencia horaria refuerza el hábito y el sistema nervioso aprende a anticipar la relajación en ese momento.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono}>⏰</span>
              <p><strong>Actúa al notar los primeros síntomas.</strong> Para la ansiedad, practica 4-7-8 en cuanto notes la tensión, no cuando ya estés desbordado. La efectividad es mayor en las primeras señales.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono}>🧩</span>
              <p><strong>Para niños y autismo: sin retenciones al principio.</strong> Empieza siempre con Diafragmática o Coherente. Introduce retenciones solo cuando el niño esté completamente cómodo con el ritmo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono}>🧘</span>
              <p><strong>Combina con relajación muscular progresiva.</strong> La respiración consciente + tensión-relajación muscular multiplica los beneficios para la ansiedad y el insomnio.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono}>📝</span>
              <p><strong>Lleva un registro de qué técnica te funciona mejor.</strong> Anota cuándo practicaste, qué técnica y cómo te sentiste después. Esto ayuda a identificar qué funciona para tu caso específico.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono}>🚗</span>
              <p><strong>Nunca practiques al conducir o manejar maquinaria.</strong> Las técnicas con retención pueden causar mareos transitorios. Reserva la práctica para cuando estés sentado o tumbado en un entorno seguro.</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <section className={styles.guiaSeccion}>
          <div className={styles.warningBox}>
            <h3>⚠️ Señales de alarma: cuándo parar y consultar al médico</h3>
            <ul>
              <li><strong>Hipertensión arterial no controlada:</strong> las técnicas con retención (Cuadrada, 4-7-8) pueden aumentar transitoriamente la presión. Consulta a tu médico antes de practicarlas.</li>
              <li><strong>Mareo intenso, palpitaciones o malestar:</strong> detén el ejercicio inmediatamente si experimentas cualquiera de estos síntomas. Son señales de que la técnica no es adecuada para ti en ese momento.</li>
              <li><strong>La técnica 4-7-8 en ataques de pánico activos:</strong> durante un ataque de pánico, la retención de 7 segundos puede aumentar la sensación de ahogo. Usa Diafragmática simple en su lugar.</li>
              <li><strong>Más de 4 ciclos consecutivos de 4-7-8:</strong> el Dr. Weil, creador de esta técnica, recomienda no superar 4 repeticiones seguidas, especialmente al principio. Aumenta gradualmente con el tiempo.</li>
              <li><strong>Asma activa o EPOC descompensada:</strong> en crisis agudas, no practiques sin indicación médica. La respiración guiada es una herramienta de bienestar, no un tratamiento de urgencia.</li>
              <li><strong>Esta app no sustituye la fisioterapia respiratoria:</strong> si tienes una condición respiratoria diagnosticada, la guía de respiración puede complementar, pero nunca reemplazar, el plan de tratamiento de tu equipo médico.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('guia-respiracion')} />
      <ShareCard appName="guia-respiracion" />
      <Footer appName="guia-respiracion" />
    </div>
  );
}
