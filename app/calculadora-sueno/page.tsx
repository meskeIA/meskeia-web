'use client';

import { useState } from 'react';
import styles from './CalculadoraSueno.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type ModoCalculo = 'despertar' | 'dormir';

interface HoraSueno {
  hora: string;
  ciclos: number;
  duracion: string;
  calidad: 'optima' | 'buena' | 'aceptable';
}

const DURACION_CICLO = 90; // minutos
const TIEMPO_DORMIRSE = 15; // minutos promedio para quedarse dormido

function formatearHora(fecha: Date): string {
  return fecha.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function calcularDuracion(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (mins === 0) {
    return `${horas}h`;
  }
  return `${horas}h ${mins}min`;
}

function obtenerCalidad(ciclos: number): 'optima' | 'buena' | 'aceptable' {
  if (ciclos >= 5 && ciclos <= 6) return 'optima';
  if (ciclos === 4) return 'buena';
  return 'aceptable';
}

export default function CalculadoraSuenoPage() {
  const [modo, setModo] = useState<ModoCalculo>('despertar');
  const [hora, setHora] = useState('07:00');
  const [resultados, setResultados] = useState<HoraSueno[] | null>(null);

  const calcular = () => {
    const [horaNum, minNum] = hora.split(':').map(Number);
    const fechaBase = new Date();
    fechaBase.setHours(horaNum, minNum, 0, 0);

    const horas: HoraSueno[] = [];

    if (modo === 'despertar') {
      // Calcular horas para ir a dormir (hacia atrás desde la hora de despertar)
      for (let ciclos = 6; ciclos >= 3; ciclos--) {
        const minutosAtras = (ciclos * DURACION_CICLO) + TIEMPO_DORMIRSE;
        const horaDormir = new Date(fechaBase.getTime() - minutosAtras * 60000);

        horas.push({
          hora: formatearHora(horaDormir),
          ciclos,
          duracion: calcularDuracion(ciclos * DURACION_CICLO),
          calidad: obtenerCalidad(ciclos),
        });
      }
    } else {
      // Calcular horas para despertar (hacia adelante desde la hora de dormir)
      const horaRealDormir = new Date(fechaBase.getTime() + TIEMPO_DORMIRSE * 60000);

      for (let ciclos = 3; ciclos <= 6; ciclos++) {
        const minutosAdelante = ciclos * DURACION_CICLO;
        const horaDespertar = new Date(horaRealDormir.getTime() + minutosAdelante * 60000);

        horas.push({
          hora: formatearHora(horaDespertar),
          ciclos,
          duracion: calcularDuracion(ciclos * DURACION_CICLO),
          calidad: obtenerCalidad(ciclos),
        });
      }
    }

    setResultados(horas);
  };

  const getCalidadClase = (calidad: string) => {
    switch (calidad) {
      case 'optima': return styles.calidadOptima;
      case 'buena': return styles.calidadBuena;
      default: return styles.calidadAceptable;
    }
  };

  const getCalidadTexto = (calidad: string) => {
    switch (calidad) {
      case 'optima': return '⭐ Óptimo';
      case 'buena': return '✅ Bueno';
      default: return '👍 Aceptable';
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🌙 Calculadora de Sueño</h1>
        <p className={styles.subtitle}>
          Calcula la hora ideal para dormir o despertar respetando los ciclos de sueño de 90 minutos
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>¿Qué quieres calcular?</h2>

          <div className={styles.modoSelector}>
            <button
              type="button"
              aria-pressed={modo === 'despertar'}
              className={`${styles.modoBtn} ${modo === 'despertar' ? styles.activo : ''}`}
              onClick={() => { setModo('despertar'); setResultados(null); }}
            >
              <span aria-hidden="true" className={styles.modoIcono}>⏰</span>
              <span className={styles.modoTexto}>Sé a qué hora quiero despertar</span>
              <span className={styles.modoDesc}>Calcular hora para ir a dormir</span>
            </button>
            <button
              type="button"
              aria-pressed={modo === 'dormir'}
              className={`${styles.modoBtn} ${modo === 'dormir' ? styles.activo : ''}`}
              onClick={() => { setModo('dormir'); setResultados(null); }}
            >
              <span aria-hidden="true" className={styles.modoIcono}>🛏️</span>
              <span className={styles.modoTexto}>Sé a qué hora me voy a dormir</span>
              <span className={styles.modoDesc}>Calcular hora para despertar</span>
            </button>
          </div>

          <div className={styles.horaSection}>
            <label className={styles.label}>
              {modo === 'despertar' ? '¿A qué hora quieres despertar?' : '¿A qué hora te vas a dormir?'}
            </label>
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className={styles.horaInput}
            />
          </div>

          <button type="button" onClick={calcular} className={styles.btnPrimary}>
            Calcular Horas Óptimas
          </button>

          <div className={styles.infoBox}>
            <h3>💡 ¿Por qué 90 minutos?</h3>
            <p>
              Un ciclo de sueño dura entre 80 y 110 minutos (promedio: 90). Esta calculadora usa el
              promedio como aproximación, pero tu ciclo real puede diferir. Despertar entre ciclos
              suele asociarse con menor inercia del sueño, aunque la calidad global importa más que
              el momento exacto del despertar.
            </p>
          </div>
        </div>

        <div className={styles.resultsPanel}>
          {resultados ? (
            <>
              <h2 className={styles.resultsTitulo}>
                {modo === 'despertar'
                  ? '🌙 Horas recomendadas para ir a dormir'
                  : '☀️ Horas recomendadas para despertar'}
              </h2>
              <p className={styles.resultsSubtitulo}>
                {modo === 'despertar'
                  ? `Para despertar a las ${hora}, intenta dormirte a una de estas horas:`
                  : `Si te duermes a las ${hora}, despierta a una de estas horas:`}
              </p>

              <div className={styles.horasGrid}>
                {resultados.map((resultado, index) => (
                  <div
                    key={index}
                    className={`${styles.horaCard} ${getCalidadClase(resultado.calidad)}`}
                  >
                    <span className={styles.horaValor}>{resultado.hora}</span>
                    <span className={styles.horaCiclos}>{resultado.ciclos} ciclos</span>
                    <span className={styles.horaDuracion}>{resultado.duracion} de sueño</span>
                    <span className={styles.horaCalidad}>{getCalidadTexto(resultado.calidad)}</span>
                  </div>
                ))}
              </div>

              <div className={styles.recomendacion}>
                <h3>💤 Recomendación</h3>
                <p>
                  Los adultos necesitan entre <strong>7-9 horas de sueño</strong> (4-6 ciclos).
                  Lo ideal es completar <strong>5-6 ciclos</strong> para un descanso óptimo.
                  El tiempo para quedarse dormido (≈15 min) ya está incluido en el cálculo.
                </p>
              </div>

              <div className={styles.fasesSection}>
                <h3>🧠 Fases de un ciclo de sueño</h3>
                <div className={styles.fasesGrid}>
                  <div className={styles.faseCard}>
                    <span className={styles.faseNum}>1</span>
                    <span className={styles.faseNombre}>Adormecimiento</span>
                    <span className={styles.faseDuracion}>5-10 min</span>
                  </div>
                  <div className={styles.faseCard}>
                    <span className={styles.faseNum}>2</span>
                    <span className={styles.faseNombre}>Sueño ligero</span>
                    <span className={styles.faseDuracion}>20 min</span>
                  </div>
                  <div className={styles.faseCard}>
                    <span className={styles.faseNum}>3</span>
                    <span className={styles.faseNombre}>Sueño profundo</span>
                    <span className={styles.faseDuracion}>30-40 min</span>
                  </div>
                  <div className={styles.faseCard}>
                    <span className={styles.faseNum}>4</span>
                    <span className={styles.faseNombre}>REM (Sueños)</span>
                    <span className={styles.faseDuracion}>20-25 min</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🌙</span>
              <p>Selecciona un modo y una hora para calcular tus ciclos de sueño óptimos</p>
            </div>
          )}
        </div>
      </div>

      <div className={styles.tipsSection}>
        <h3>🌟 Consejos para dormir mejor</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>📱</span>
            <h4>Evita pantallas</h4>
            <p>Deja el móvil 1 hora antes de dormir. La luz azul afecta la melatonina.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🌡️</span>
            <h4>Temperatura ideal</h4>
            <p>Mantén la habitación entre 18-21°C para un sueño reparador.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>☕</span>
            <h4>Limita cafeína</h4>
            <p>Evita café, té y refrescos con cafeína 6 horas antes de dormir.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🕐</span>
            <h4>Horario regular</h4>
            <p>Acuéstate y levántate a la misma hora, incluso fines de semana.</p>
          </div>
        </div>
      </div>

      

      <DisclaimerCard variant="medical" severity="high" collapsible={false} context="calculadora-sueno">
        <p>Esta calculadora usa ciclos promedio de 90 minutos. <strong>Limitaciones importantes:</strong></p>
        <ul className={styles.disclaimerList}>
          <li><strong>Los ciclos varían individualmente</strong>: Pueden durar 80-110 minutos según edad, genética y estado de salud</li>
          <li><strong>No detecta trastornos del sueño</strong>: Insomnio, apnea, síndrome piernas inquietas o narcolepsia requieren estudio médico</li>
          <li><strong>Calidad vs cantidad</strong>: Dormir 8 horas con despertares frecuentes es peor que 6 horas continuas</li>
        </ul>
        <p className={styles.highlight}><strong>⚕️ Si tienes insomnio crónico, somnolencia diurna excesiva o ronquidos intensos, consulta con un médico especialista en sueño.</strong></p>
        <p>meskeIA no asume ninguna responsabilidad por decisiones tomadas en base a los resultados de esta herramienta, ni por un uso inadecuado de la misma.</p>
      </DisclaimerCard>

      <EducationalSection
        title="¿Quieres aprender más sobre el sueño?"
        subtitle="Ciencia del sueño, perfiles, consejos prácticos y errores comunes"
        defaultOpen={false}
      >
        <div className={styles.eduComparativa}>
          <h2>Las fases del sueño: qué pasa mientras duermes</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr><th>Fase</th><th>Duración por ciclo</th><th>Qué ocurre</th><th>Función principal</th><th>Si se interrumpe</th></tr>
              </thead>
              <tbody>
                <tr><td>NREM 1 (adormecimiento)</td><td>1-7 min</td><td>Transición vigilia-sueño, ralentización cardíaca</td><td>Inicio del descanso</td><td>Te despiertas sin saber que dormías</td></tr>
                <tr><td>NREM 2 (sueño ligero)</td><td>10-25 min</td><td>Husos de sueño, consolidación de memoria</td><td>Aprendizaje procedimental</td><td>Sensación de no haber descansado</td></tr>
                <tr><td>NREM 3 (sueño profundo)</td><td>20-40 min</td><td>Ondas delta, reparación tisular, hormonas</td><td>Recuperación física</td><td>Confusión, somnolencia diurna severa</td></tr>
                <tr><td>REM</td><td>10-60 min (aumenta con ciclos)</td><td>Movimientos oculares, sueños vívidos, parálisis muscular</td><td>Consolidación emocional y memoria</td><td>Irritabilidad, deterioro cognitivo</td></tr>
                <tr><td>Ciclo completo</td><td>~90 min</td><td>Secuencia NREM1→2→3→REM repetida 4-6 veces</td><td>Restauración integral</td><td>Deuda de sueño acumulada</td></tr>
                <tr><td>Sueño recomendado adultos</td><td>7-9 horas (4-6 ciclos)</td><td>Los primeros ciclos tienen más NREM3; los últimos más REM</td><td>Equilibrio físico-mental</td><td>Mayor riesgo cardiovascular y metabólico</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.eduEscenarios}>
          <h2>Patrones de sueño según perfil y situación</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>🎓</span><h3>Estudiante en época de exámenes</h3></div>
              <p className={styles.escenarioExample}>Estudia hasta las 2h, despertador a las 7h. Solo 5h de sueño: pierde la mayor parte del REM (última parte de la noche), clave para consolidar lo aprendido. Contraproducente.</p>
              <span className={styles.escenarioTip}>Dormir 7h consolida mejor que estudiar 2h más</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>🏋️</span><h3>Deportista de alto rendimiento</h3></div>
              <p className={styles.escenarioExample}>Necesita 8-10h. En NREM 3 se libera hormona del crecimiento, clave para reparación muscular. Muchos atletas de élite añaden siesta de 20 min para recuperación sin entrar en sueño profundo.</p>
              <span className={styles.escenarioTip}>La siesta de 20 min mejora rendimiento un 34%</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>👶</span><h3>Padre/madre con bebé</h3></div>
              <p className={styles.escenarioExample}>Interrupciones cada 2-3h destruyen los ciclos. La fragmentación es más dañina que pocas horas seguidas. Estrategia: dormir en fases de 90 min mínimo cuando sea posible y compartir turnos.</p>
              <span className={styles.escenarioTip}>90 min mínimos = un ciclo completo</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>✈️</span><h3>Viajero con jet lag</h3></div>
              <p className={styles.escenarioExample}>Cambio de zona horaria desincroniza el ritmo circadiano. Hacia el este es más difícil (adelantar el sueño). Regla: 1 día de adaptación por cada hora de diferencia. Exposición a luz natural por la mañana acelera el ajuste.</p>
              <span className={styles.escenarioTip}>Luz solar por la mañana = reset del ritmo</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>👴</span><h3>Persona mayor de 65 años</h3></div>
              <p className={styles.escenarioExample}>Producción de melatonina disminuye. Los ciclos se acortan y hay más despertares nocturnos. Es normal adelantar el horario de sueño 1-2h. La calidad importa más que la cantidad (necesitan menos NREM 3).</p>
              <span className={styles.escenarioTip}>7h de calidad &gt; 9h fragmentadas</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>🌙</span><h3>Trabajador nocturno o en turnos</h3></div>
              <p className={styles.escenarioExample}>Dormir de día reduce la calidad hasta un 30%: la luz y el ruido interrumpen el sueño profundo. Persianas blackout, tapones y temperatura fresca son esenciales. Los turnos rotativos son más perjudiciales que el nocturno fijo.</p>
              <span className={styles.escenarioTip}>Turno fijo nocturno &gt; turnos rotativos</span>
            </div>
          </div>
        </div>

        <div className={styles.eduFaq}>
          <h2>Preguntas frecuentes sobre el sueño</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}><h4>¿Cuántas horas de sueño necesito realmente?</h4><p>Los adultos necesitan entre 7 y 9 horas (National Sleep Foundation). Menos de 6h de forma crónica aumenta el riesgo de obesidad, diabetes, enfermedades cardiovasculares y deterioro cognitivo. Solo un 3% de la población tiene mutación genética que les permite funcionar bien con 6h.</p></div>
            <div className={styles.faqItem}><h4>¿Qué es un ciclo de sueño y por qué importa?</h4><p>Un ciclo dura ~90 minutos y pasa por NREM 1, 2, 3 y REM. Despertarse a mitad de ciclo (especialmente en NREM 3) produce la inercia del sueño: atontamiento y confusión. Programar el despertador en múltiplos de 90 min minimiza este efecto.</p></div>
            <div className={styles.faqItem}><h4>¿La siesta es buena o mala?</h4><p>Una siesta de 10-20 min ("power nap") mejora el rendimiento cognitivo un 34% y el estado de alerta un 100% según la NASA. Más de 30 min puede provocar inercia del sueño y dificultar el sueño nocturno. Lo ideal: antes de las 15h para no alterar el ritmo circadiano.</p></div>
            <div className={styles.faqItem}><h4>¿El alcohol ayuda a dormir?</h4><p>El alcohol ayuda a conciliar el sueño pero fragmenta la segunda mitad de la noche, especialmente la fase REM. Aunque te duermes más rápido, la calidad del sueño se reduce significativamente. Incluso una copa altera la arquitectura del sueño esa noche.</p></div>
            <div className={styles.faqItem}><h4>¿A qué hora debería acostarme?</h4><p>Depende de tu cronotipo. Los "alondras" tienen pico de rendimiento por la mañana (acostarse 22-23h); los "búhos" funcionan mejor por la noche (acostarse 0-1h). Ignorar tu cronotipo crea "jet lag social" crónico. Lo más importante es ser consistente, incluyendo fines de semana.</p></div>
            <div className={styles.faqItem}><h4>¿Por qué me despierto siempre a la misma hora?</h4><p>El ritmo circadiano es un reloj biológico de 24h controlado por la luz y el cortisol. Despertarse a la misma hora (incluso sin alarma) es señal de que tu ritmo está bien sincronizado. Si te despiertas muy temprano con ansiedad, puede indicar estrés crónico o depresión.</p></div>
            <div className={styles.faqItem}><h4>¿Las pantallas afectan realmente al sueño?</h4><p>Sí. La luz azul de pantallas suprime la melatonina hasta 3 horas. Además, el contenido estimulante activa el sistema nervioso. La recomendación es evitar pantallas 1h antes de dormir. Modo nocturno/naranja reduce pero no elimina el efecto.</p></div>
            <div className={styles.faqItem}><h4>¿Puedo recuperar el sueño perdido el fin de semana?</h4><p>Parcialmente. Se puede recuperar algo de la deuda de sueño aguda, pero el sueño crónico insuficiente tiene efectos metabólicos y cognitivos que no se revierten completamente. Además, "dormir de más" el fin de semana desincroniza el ritmo circadiano para el lunes (social jet lag).</p></div>
          </div>
        </div>

        <div className={styles.eduGuia}>
          <h2>Cómo mejorar tu sueño en 7 pasos</h2>
          <div className={styles.stepGuide}>
            <div className={styles.eduStep}><div className={styles.stepNumber}>1</div><div className={styles.stepContent}><strong>Fija un horario consistente</strong><p>Acuéstate y levántate a la misma hora cada día, incluyendo fines de semana. Es el hábito más poderoso para sincronizar el ritmo circadiano. La variación de más de 1h entre días laborables y fin de semana ya produce "jet lag social".</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>2</div><div className={styles.stepContent}><strong>Crea una rutina de relajación 30-60 min antes</strong><p>Señala a tu cerebro que es hora de dormir: luz tenue, temperatura bajando (~18-20°C), actividades relajantes (lectura física, estiramientos suaves, meditación). Evita conversaciones estresantes o decisiones importantes.</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>3</div><div className={styles.stepContent}><strong>Optimiza el entorno del dormitorio</strong><p>Oscuridad total (blackout), temperatura fresca (18-20°C), silencio o ruido blanco. El dormitorio debe asociarse solo con dormir y sexo — no con trabajo o pantallas. Hasta una pequeña luz LED altera la melatonina.</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>4</div><div className={styles.stepContent}><strong>Controla la cafeína y el alcohol</strong><p>La cafeína tiene una vida media de 5-7 horas: un café a las 15h todavía tiene el 50% de efecto a las 20h. Último café antes de las 14h. El alcohol puede parecer que ayuda pero fragmenta el sueño en la segunda mitad de la noche.</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>5</div><div className={styles.stepContent}><strong>Gestiona la exposición a la luz</strong><p>Luz brillante por la mañana (idealmente solar) activa el cortisol y fija el reloj biológico. Luz tenue por la tarde-noche permite que suba la melatonina. Gafas de luz azul o modo nocturno desde las 20h.</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>6</div><div className={styles.stepContent}><strong>Haz ejercicio, pero no demasiado tarde</strong><p>El ejercicio regular mejora significativamente la calidad del sueño profundo. Sin embargo, ejercicio intenso menos de 3h antes de dormir puede retrasar el inicio del sueño por la activación simpática y el aumento de temperatura corporal.</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>7</div><div className={styles.stepContent}><strong>Si no puedes dormir, levántate</strong><p>Quedarse en la cama despierto asocia el dormitorio con la vigilia (condicionamiento negativo). Si llevas más de 20 min sin dormir, levántate, haz algo tranquilo con luz tenue y vuelve cuando tengas sueño. La restricción de sueño es la base de la Terapia Cognitivo-Conductual para el insomnio (TCC-I).</p></div></div>
          </div>
        </div>

        <div className={styles.eduTips}>
          <h2>Hábitos de los que duermen bien</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}><span className={styles.tipIcon}>🌡️</span><strong>Temperatura ideal: 18-20°C</strong><p>El cuerpo necesita bajar su temperatura central para iniciar el sueño. Una habitación fresca facilita este proceso de forma natural.</p></div>
            <div className={styles.tipCard}><span className={styles.tipIcon}>⏰</span><strong>Despertador en múltiplo de 90 min</strong><p>Algunas personas notan menos inercia del sueño si se despiertan al final de un ciclo aproximado de 90 minutos, aunque la evidencia es mixta. La regularidad del horario tiene mayor respaldo científico.</p></div>
            <div className={styles.tipCard}><span className={styles.tipIcon}>📵</span><strong>Sin pantallas 1h antes</strong><p>Sustituye por lectura física, podcast relajante o meditación. El cerebro no distingue entre contenido relajante e intenso en pantalla — la luz azul siempre suprime melatonina.</p></div>
            <div className={styles.tipCard}><span className={styles.tipIcon}>🧘</span><strong>Técnica 4-7-8 para conciliar</strong><p>Inhala 4 seg, retén 7 seg, exhala 8 seg. Activa el sistema parasimpático y reduce la frecuencia cardíaca, facilitando la transición al sueño.</p></div>
            <div className={styles.tipCard}><span className={styles.tipIcon}>☀️</span><strong>Luz solar al despertar</strong><p>10-15 min de luz natural nada más levantarte sincroniza el ritmo circadiano, mejora el estado de ánimo y facilita dormir mejor esa noche.</p></div>
            <div className={styles.tipCard}><span className={styles.tipIcon}>📓</span><strong>Escribe tus preocupaciones antes de dormir</strong><p>El "journaling" de 5 min — listar tareas pendientes y preocupaciones — descarga la mente y reduce la activación cognitiva que impide conciliar el sueño.</p></div>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Errores que arruinan la calidad de tu sueño</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Compensar la falta de sueño solo el fin de semana — crea "jet lag social" y no repara el daño cognitivo acumulado</li>
            <li>Tomar melatonina como somnífero (dosis altas) — la melatonina es un regulador de horario, no un inductor del sueño; dosis de 0.5-1mg son suficientes</li>
            <li>Usar el móvil en la cama "solo un momento" — el scroll activa el sistema de recompensa dopaminérgico, incompatible con el sueño</li>
            <li>Hacer ejercicio intenso menos de 3h antes de dormir — eleva la temperatura corporal y el cortisol justo cuando deberían bajar</li>
            <li>Beber alcohol para "relajarse" antes de dormir — fragmenta la fase REM y empeora la calidad global del sueño esa noche</li>
            <li>Quedarse en la cama dando vueltas durante horas — refuerza la asociación cama-ansiedad; es mejor levantarse</li>
            <li>Ignorar el ronquido crónico o las apneas — la apnea del sueño no tratada causa hipertensión, deterioro cognitivo y aumenta el riesgo cardiovascular</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-sueno')} />

      <ShareCard appName="calculadora-sueno" />
      <Footer appName="calculadora-sueno" />
    </div>
  );
}
