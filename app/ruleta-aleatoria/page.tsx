'use client';
// @disclaimer: exempt

import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './RuletaAleatoria.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

interface WheelItem {
  id: string;
  text: string;
  color: string;
}

const DEFAULT_COLORS = [
  '#2E86AB', '#48A9A6', '#E94F37', '#F77F00', '#FCBF49',
  '#7B2CBF', '#3A86FF', '#06D6A0', '#EF476F', '#FFD166'
];

const PRESETS = {
  siNo: ['Sí', 'No'],
  numeros: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  diasSemana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
  comida: ['Pizza', 'Sushi', 'Hamburguesa', 'Ensalada', 'Pasta', 'Tacos', 'Pollo', 'Paella'],
  colores: ['Rojo', 'Azul', 'Verde', 'Amarillo', 'Naranja', 'Morado', 'Rosa', 'Negro'],
};

export default function RuletaAleatoriaPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [items, setItems] = useState<WheelItem[]>([
    { id: '1', text: 'Opción 1', color: DEFAULT_COLORS[0] },
    { id: '2', text: 'Opción 2', color: DEFAULT_COLORS[1] },
    { id: '3', text: 'Opción 3', color: DEFAULT_COLORS[2] },
    { id: '4', text: 'Opción 4', color: DEFAULT_COLORS[3] },
  ]);
  const [newItemText, setNewItemText] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Dibujar ruleta
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || items.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;
    const sliceAngle = (2 * Math.PI) / items.length;

    // Limpiar
    ctx.clearRect(0, 0, size, size);

    // Dibujar segmentos
    items.forEach((item, index) => {
      const startAngle = index * sliceAngle + (rotation * Math.PI) / 180;
      const endAngle = startAngle + sliceAngle;

      // Segmento
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Texto
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.min(16, 200 / items.length)}px sans-serif`;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 3;

      const text = item.text.length > 15 ? item.text.substring(0, 12) + '...' : item.text;
      ctx.fillText(text, radius - 20, 5);
      ctx.restore();
    });

    // Centro
    ctx.beginPath();
    ctx.arc(center, center, 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#2E86AB';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Borde exterior
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#2E86AB';
    ctx.lineWidth = 4;
    ctx.stroke();
  }, [items, rotation]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  // Reproducir sonido
  const playSound = useCallback((type: 'spin' | 'win') => {
    if (!soundEnabled) return;

    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'spin') {
      oscillator.frequency.value = 200;
      gainNode.gain.value = 0.1;
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.05);
    } else {
      oscillator.frequency.value = 523.25; // C5
      gainNode.gain.value = 0.2;
      oscillator.start();
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      oscillator.stop(audioContext.currentTime + 0.4);
    }
  }, [soundEnabled]);

  // Girar ruleta
  const spinWheel = useCallback(() => {
    if (isSpinning || items.length < 2) return;

    setIsSpinning(true);
    setWinner(null);
    setShowConfetti(false);

    // Calcular rotación aleatoria (mínimo 5 vueltas + ángulo aleatorio)
    const spins = 5 + Math.random() * 3;
    const randomAngle = Math.random() * 360;
    const totalRotation = spins * 360 + randomAngle;

    // Animación
    const duration = 4000;
    const startTime = Date.now();
    const startRotation = rotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing: ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + totalRotation * easeOut;

      setRotation(currentRotation % 360);

      // Sonido de tick durante el giro
      if (progress < 0.9 && Math.random() > 0.7) {
        playSound('spin');
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Determinar ganador
        const finalRotation = (currentRotation % 360 + 360) % 360;
        const sliceAngle = 360 / items.length;
        // El puntero está arriba (270 grados en coordenadas de canvas)
        const adjustedAngle = (270 - finalRotation + 360) % 360;
        const winnerIndex = Math.floor(adjustedAngle / sliceAngle) % items.length;

        const winnerItem = items[winnerIndex];
        setWinner(winnerItem.text);
        setHistory(prev => [winnerItem.text, ...prev].slice(0, 20));
        setIsSpinning(false);
        setShowConfetti(true);
        playSound('win');

        // Ocultar confetti después de 3 segundos
        setTimeout(() => setShowConfetti(false), 3000);
      }
    };

    requestAnimationFrame(animate);
  }, [isSpinning, items, rotation, playSound]);

  // Añadir item
  const addItem = useCallback(() => {
    if (!newItemText.trim()) return;

    const newItem: WheelItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      color: DEFAULT_COLORS[items.length % DEFAULT_COLORS.length]
    };

    setItems(prev => [...prev, newItem]);
    setNewItemText('');
  }, [newItemText, items.length]);

  // Eliminar item
  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // Cargar preset
  const loadPreset = useCallback((preset: string[]) => {
    const newItems = preset.map((text, index) => ({
      id: Date.now().toString() + index,
      text,
      color: DEFAULT_COLORS[index % DEFAULT_COLORS.length]
    }));
    setItems(newItems);
    setWinner(null);
  }, []);

  // Limpiar todo
  const clearAll = useCallback(() => {
    setItems([]);
    setWinner(null);
    setHistory([]);
  }, []);

  // Añadir con Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addItem();
    }
  };

  // Eliminar ganador y girar de nuevo
  const removeWinnerAndSpin = useCallback(() => {
    if (!winner) return;
    const winnerItem = items.find(item => item.text === winner);
    if (winnerItem) {
      setItems(prev => prev.filter(item => item.id !== winnerItem.id));
      setWinner(null);
      setTimeout(() => spinWheel(), 300);
    }
  }, [winner, items, spinWheel]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>🎡</span>
        <h1 className={styles.title}>Ruleta Aleatoria</h1>
        <p className={styles.subtitle}>
          Crea tu ruleta personalizada para sorteos, decisiones o simplemente divertirte. Sin registro, sin límites.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.mainContent}>
        <div className={styles.wheelSection}>
          {/* Ruleta */}
          <div className={styles.wheelContainer}>
            {/* Puntero */}
            <div className={styles.pointer}>▼</div>

            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className={`${styles.wheel} ${isSpinning ? styles.spinning : ''}`}
            />

            {/* Confetti */}
            {showConfetti && (
              <div className={styles.confetti}>
                {[...Array(50)].map((_, i) => (
                  <div
                    key={i}
                    className={styles.confettiPiece}
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 0.5}s`,
                      backgroundColor: DEFAULT_COLORS[i % DEFAULT_COLORS.length]
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Resultado */}
          {winner && (
            <div className={styles.resultCard}>
              <span className={styles.resultIcon}>🎉</span>
              <h2 className={styles.resultText}>{winner}</h2>
              <div className={styles.resultActions}>
                <button onClick={spinWheel} className={styles.btnPrimary} disabled={isSpinning}>
                  🔄 Girar otra vez
                </button>
                <button onClick={removeWinnerAndSpin} className={styles.btnSecondary} disabled={isSpinning || items.length < 2}>
                  ❌ Eliminar y girar
                </button>
              </div>
            </div>
          )}

          {/* Botón girar */}
          {!winner && (
            <button
              onClick={spinWheel}
              className={styles.spinButton}
              disabled={isSpinning || items.length < 2}
            >
              {isSpinning ? '🎡 Girando...' : '🎯 ¡Girar!'}
            </button>
          )}

          {items.length < 2 && (
            <p className={styles.hint}>Añade al menos 2 opciones para girar</p>
          )}
        </div>

        {/* Panel de opciones */}
        <div className={styles.optionsPanel}>
          <h2 className={styles.panelTitle}>📝 Opciones de la ruleta</h2>

          {/* Añadir nueva opción */}
          <div className={styles.addForm}>
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe una opción..."
              className={styles.input}
              maxLength={50}
            />
            <button onClick={addItem} className={styles.btnAdd} disabled={!newItemText.trim()}>
              + Añadir
            </button>
          </div>

          {/* Lista de opciones */}
          <div className={styles.itemsList}>
            {items.map((item, index) => (
              <div key={item.id} className={styles.itemRow}>
                <span
                  className={styles.itemColor}
                  style={{ backgroundColor: item.color }}
                />
                <span className={styles.itemText}>{item.text}</span>
                <button
                  onClick={() => removeItem(item.id)}
                  className={styles.btnRemove}
                  title="Eliminar"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Presets */}
          <div className={styles.presetsSection}>
            <h3>⚡ Cargar plantilla</h3>
            <div className={styles.presetButtons}>
              <button onClick={() => loadPreset(PRESETS.siNo)} className={styles.btnPreset}>
                Sí/No
              </button>
              <button onClick={() => loadPreset(PRESETS.numeros)} className={styles.btnPreset}>
                Números 1-10
              </button>
              <button onClick={() => loadPreset(PRESETS.diasSemana)} className={styles.btnPreset}>
                Días semana
              </button>
              <button onClick={() => loadPreset(PRESETS.comida)} className={styles.btnPreset}>
                Comida
              </button>
              <button onClick={() => loadPreset(PRESETS.colores)} className={styles.btnPreset}>
                Colores
              </button>
            </div>
          </div>

          {/* Controles */}
          <div className={styles.controlsRow}>
            <button onClick={clearAll} className={styles.btnDanger}>
              🗑️ Limpiar todo
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`${styles.btnToggle} ${soundEnabled ? styles.active : ''}`}
            >
              {soundEnabled ? '🔊 Sonido' : '🔇 Silencio'}
            </button>
          </div>
        </div>
      </main>

      {/* Historial */}
      {history.length > 0 && (
        <div className={styles.historySection}>
          <h3>📜 Historial de resultados</h3>
          <div className={styles.historyList}>
            {history.map((result, index) => (
              <span key={index} className={styles.historyItem}>
                {index === 0 && '🏆'} {result}
              </span>
            ))}
          </div>
          <button onClick={() => setHistory([])} className={styles.btnSmall}>
            Limpiar historial
          </button>
        </div>
      )}

      {/* Usos */}
      <div className={styles.usesSection}>
        <h3>💡 Ideas de uso</h3>
        <div className={styles.usesGrid}>
          <div className={styles.useCard}>
            <span className={styles.useIcon}>👩‍🏫</span>
            <h4>Profesores</h4>
            <p>Selecciona alumnos al azar para participar en clase.</p>
          </div>
          <div className={styles.useCard}>
            <span className={styles.useIcon}>🎁</span>
            <h4>Sorteos</h4>
            <p>Realiza sorteos justos entre participantes.</p>
          </div>
          <div className={styles.useCard}>
            <span className={styles.useIcon}>🤔</span>
            <h4>Decisiones</h4>
            <p>¿No sabes qué cenar? Deja que la ruleta decida.</p>
          </div>
          <div className={styles.useCard}>
            <span className={styles.useIcon}>🎮</span>
            <h4>Juegos</h4>
            <p>Añade retos o pruebas para fiestas y reuniones.</p>
          </div>
        </div>
      </div>

      <EducationalSection
        title="¿Quieres saber más sobre sorteos y selección aleatoria?"
        subtitle="Descubre cómo funciona la aleatoriedad, cuándo usar cada método y cómo hacer sorteos justos"
      >
        {/* ── SECCIÓN 1: Tabla Comparativa ── */}
        <section className={styles.guideSection}>
          <h2>Métodos de selección aleatoria: comparativa</h2>
          <p>
            Existen distintas formas de elegir al azar. Cada método tiene sus ventajas según el número
            de opciones y el contexto de uso.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Método</th>
                  <th>N.º de opciones</th>
                  <th>Equidad</th>
                  <th>Velocidad</th>
                  <th>Ideal para</th>
                  <th>Limitación principal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🎡 Ruleta digital</td>
                  <td>2 – 100+</td>
                  <td>Alta</td>
                  <td>Inmediata</td>
                  <td>Sorteos en grupo, clase, streaming</td>
                  <td>No válida legalmente sin certificación</td>
                </tr>
                <tr>
                  <td>🎲 Dados</td>
                  <td>2 – 6 (o múltiplos)</td>
                  <td>Alta</td>
                  <td>Inmediata</td>
                  <td>Juegos de mesa, decisiones rápidas</td>
                  <td>Limitado a 6 opciones por dado</td>
                </tr>
                <tr>
                  <td>📋 Lista aleatoria</td>
                  <td>Ilimitadas</td>
                  <td>Muy alta</td>
                  <td>Rápida</td>
                  <td>Sorteos formales, listas de nombres</td>
                  <td>Necesita herramienta o app adicional</td>
                </tr>
                <tr>
                  <td>🪙 Moneda (cara/cruz)</td>
                  <td>2 exactamente</td>
                  <td>Alta</td>
                  <td>Inmediata</td>
                  <td>Decisiones binarias rápidas</td>
                  <td>Solo sirve para 2 opciones</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <section className={styles.guideSection}>
          <h2>Cuándo usar la ruleta aleatoria</h2>
          <p>
            La ruleta digital encaja perfectamente en situaciones cotidianas donde se necesita
            imparcialidad y rapidez.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👩‍🏫</span>
                <h4>Profesor en clase</h4>
              </div>
              <p className={styles.escenarioExample}>
                Un docente tiene 30 alumnos y necesita elegir quién responde la siguiente pregunta.
                Introduce todos los nombres en la ruleta y la gira frente a la clase.
              </p>
              <p className={styles.escenarioTip}>
                Ventaja: ningún alumno puede alegar favoritismo. El resultado es visible para todos
                en tiempo real.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🍕</span>
                <h4>Grupo eligiendo restaurante</h4>
              </div>
              <p className={styles.escenarioExample}>
                Cinco amigos no se ponen de acuerdo sobre dónde cenar. Cada uno propone un
                restaurante, se añaden a la ruleta y se gira: decisión tomada sin discusión.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: también sirve para decidir quién paga la ronda o elige la película
                del viernes por la noche.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎁</span>
                <h4>Organizador de sorteos online</h4>
              </div>
              <p className={styles.escenarioExample}>
                Un creador de contenido sortea un producto entre sus seguidores. Añade los nombres
                de los participantes, gira la ruleta en directo y anuncia el ganador al momento.
              </p>
              <p className={styles.escenarioTip}>
                Recomendación: captura la pantalla o graba el giro como prueba de que el sorteo
                fue transparente. Para sorteos con implicaciones legales, usa sistemas certificados.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Es realmente aleatoria la ruleta digital?</summary>
                <p>
                  La ruleta usa el generador de números pseudoaleatorios del navegador
                  (<code>Math.random()</code>), que es suficientemente impredecible para uso cotidiano.
                  No es criptográficamente seguro, pero para decidir quién responde en clase o elegir
                  restaurante es completamente válido.
                </p>
                <p className={styles.faqTip}>
                  Para sorteos con premios económicos o compromisos legales, lo más adecuado es
                  un sistema de sorteo certificado por notario o plataforma acreditada.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Puede repetirse el mismo resultado seguido?</summary>
                <p>
                  Sí. La aleatoriedad auténtica no garantiza alternancia. Si tienes 4 opciones y
                  giras tres veces, es posible obtener la misma opción dos o tres veces consecutivas.
                  Esto es señal de que el sistema es realmente aleatorio, no de que esté roto.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cómo añado opciones con diferentes probabilidades?</summary>
                <p>
                  La ruleta asigna el mismo sector a cada opción, por lo que todas tienen
                  la misma probabilidad. Si quieres que una opción tenga el doble de probabilidad,
                  añádela dos veces a la lista. El tamaño del sector se calcula automáticamente
                  proporcional al número de entradas.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Puedo usar la ruleta para sorteos legales en España?</summary>
                <p>
                  Depende del tipo de sorteo. Para usos informales o lúdicos (elegir turno,
                  asignar tareas, dinámicas entre amigos, en clase o en redes sociales) esta
                  herramienta es perfectamente válida. Para concursos o sorteos con premios de
                  valor económico significativo o un número elevado de participantes, la
                  normativa de juegos y sorteos puede exigir requisitos adicionales según el
                  país o región.
                </p>
                <p className={styles.faqTip}>
                  Si tu sorteo implica premios de valor relevante o muchos participantes,
                  consulta la normativa de juegos y sorteos aplicable en tu país y, si es
                  necesario, a un profesional o a la autoridad competente (en España, la
                  Dirección General de Ordenación del Juego).
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Qué diferencia hay entre aleatorio y pseudoaleatorio?</summary>
                <p>
                  Un número verdaderamente aleatorio requiere una fuente de entropía física
                  (ruido térmico, radioactividad). Los ordenadores generan números
                  <em> pseudoaleatorios</em>: secuencias deterministas que parecen aleatorias
                  pero parten de una semilla inicial. Para el 99 % de los usos cotidianos,
                  la diferencia es irrelevante.
                </p>
              </details>
            </li>
          </ul>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <section className={styles.guideSection}>
          <h2>Cómo hacer un sorteo justo: 5 pasos</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Añade todas las opciones antes de girar</strong>
                <p>
                  Introduce la lista completa de participantes u opciones antes de hacer girar
                  la ruleta. Añadir o eliminar opciones después del primer giro puede sesgar
                  el resultado.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Verifica que todas tienen la misma probabilidad deseada</strong>
                <p>
                  Comprueba visualmente que los sectores de la ruleta son iguales. Si quieres
                  ponderar alguna opción, añádela varias veces antes de girar.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Gira y acepta el resultado sin excusas</strong>
                <p>
                  El compromiso previo al giro es lo que da validez al sorteo. Si ya acordasteis
                  respetar la ruleta, el resultado es inapelable.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Documenta el resultado si es un sorteo formal</strong>
                <p>
                  Para sorteos públicos o con participantes que no están presentes, haz una
                  captura de pantalla o graba el giro. Así tienes prueba del proceso.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <strong>Para sorteos legales, usa sistemas certificados</strong>
                <p>
                  Si el sorteo tiene implicaciones económicas o legales (premios, herencias,
                  adjudicaciones), recurre a plataformas acreditadas, notario o servicios
                  de sorteo con certificado digital.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <section className={styles.guideSection}>
          <h2>4 buenas prácticas para sorteos justos</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <h4>Confirma las opciones antes de girar</h4>
              <p>
                Muestra la lista a todos los participantes antes del giro. La transparencia
                previa elimina dudas sobre si se incluyeron o excluyeron opciones de forma
                malintencionada.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🤝</span>
              <h4>Acepta el primer resultado</h4>
              <p>
                El &quot;mejor de tres&quot; o repetir hasta obtener el resultado deseado anula por
                completo la aleatoriedad. Un sorteo es válido con un único giro acordado
                de antemano.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📸</span>
              <h4>Captura pantalla en sorteos públicos</h4>
              <p>
                Si el sorteo es en directo o ante varios testigos, guarda una captura con
                la lista de participantes visible y el resultado. Es la prueba más sencilla
                de transparencia.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔤</span>
              <h4>Usa opciones claras y sin ambigüedades</h4>
              <p>
                Escribe los nombres completos o las opciones de forma inequívoca. Evita
                abreviaturas confusas que puedan generar discusión sobre a quién o qué
                correspondía el resultado ganador.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box ── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>4 errores que invalidan un sorteo</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Usar la ruleta para decisiones importantes e irreversibles.</strong> Elegir
                quién conduce de vuelta o asignar responsabilidades críticas de forma aleatoria
                sin considerar aptitudes o circunstancias puede ser imprudente.
              </li>
              <li>
                <strong>Repetir el giro hasta obtener el resultado deseado.</strong> Si alguien
                sigue girando hasta que salga su opción favorita, el sorteo deja de ser aleatorio
                y pierde toda validez moral y práctica.
              </li>
              <li>
                <strong>Presentarlo como sorteo legal sin sistema certificado.</strong> Usar esta
                ruleta para concursos con premios económicos sin cumplir la normativa vigente
                puede acarrear sanciones administrativas.
              </li>
              <li>
                <strong>No informar a los participantes del método usado en concursos.</strong> En
                sorteos públicos, los participantes tienen derecho a conocer el sistema de selección.
                La opacidad genera desconfianza y puede derivar en reclamaciones.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('ruleta-aleatoria')} />

      <ShareCard appName="ruleta-aleatoria" />
      <Footer appName="ruleta-aleatoria" />
    </div>
  );
}
