'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './ContadorManual.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

interface Contador {
  id: number;
  nombre: string;
  valor: number;
  color: string;
}

const COLORES = ['#2E86AB', '#48A9A6', '#E91E63', '#FF9800', '#4CAF50', '#9C27B0', '#00BCD4', '#795548'];

export default function ContadorManualPage() {
  const [contadores, setContadores] = useState<Contador[]>([
    { id: 1, nombre: 'Contador 1', valor: 0, color: '#2E86AB' }
  ]);
  const [sonidoActivo, setSonidoActivo] = useState(true);
  const [vibracionActiva, setVibracionActiva] = useState(true);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Inicializar AudioContext
  useEffect(() => {
    const ctx = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    setAudioContext(ctx);
    return () => {
      ctx.close();
    };
  }, []);

  // Cargar estado desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('contadorManual_v1');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.contadores) setContadores(data.contadores);
        if (data.sonidoActivo !== undefined) setSonidoActivo(data.sonidoActivo);
        if (data.vibracionActiva !== undefined) setVibracionActiva(data.vibracionActiva);
      } catch {
        // Ignorar errores de parsing
      }
    }
  }, []);

  // Guardar estado en localStorage
  useEffect(() => {
    localStorage.setItem('contadorManual_v1', JSON.stringify({
      contadores,
      sonidoActivo,
      vibracionActiva
    }));
  }, [contadores, sonidoActivo, vibracionActiva]);

  const reproducirSonido = useCallback((frecuencia: number = 800, duracion: number = 50) => {
    if (!sonidoActivo || !audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frecuencia;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duracion / 1000);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duracion / 1000);
  }, [sonidoActivo, audioContext]);

  const vibrar = useCallback((duracion: number = 30) => {
    if (!vibracionActiva || !navigator.vibrate) return;
    navigator.vibrate(duracion);
  }, [vibracionActiva]);

  const incrementar = (id: number) => {
    setContadores(prev => prev.map(c =>
      c.id === id ? { ...c, valor: c.valor + 1 } : c
    ));
    reproducirSonido(800, 50);
    vibrar(30);
  };

  const decrementar = (id: number) => {
    setContadores(prev => prev.map(c =>
      c.id === id ? { ...c, valor: Math.max(0, c.valor - 1) } : c
    ));
    reproducirSonido(400, 50);
    vibrar(20);
  };

  const resetear = (id: number) => {
    setContadores(prev => prev.map(c =>
      c.id === id ? { ...c, valor: 0 } : c
    ));
    reproducirSonido(300, 100);
    vibrar(50);
  };

  const agregarContador = () => {
    const nuevoId = Math.max(...contadores.map(c => c.id), 0) + 1;
    const colorIndex = contadores.length % COLORES.length;
    setContadores(prev => [...prev, {
      id: nuevoId,
      nombre: `Contador ${nuevoId}`,
      valor: 0,
      color: COLORES[colorIndex]
    }]);
  };

  const eliminarContador = (id: number) => {
    if (contadores.length <= 1) return;
    setContadores(prev => prev.filter(c => c.id !== id));
  };

  const cambiarNombre = (id: number, nombre: string) => {
    setContadores(prev => prev.map(c =>
      c.id === id ? { ...c, nombre } : c
    ));
  };

  const cambiarColor = (id: number) => {
    setContadores(prev => prev.map(c => {
      if (c.id !== id) return c;
      const currentIndex = COLORES.indexOf(c.color);
      const nextIndex = (currentIndex + 1) % COLORES.length;
      return { ...c, color: COLORES[nextIndex] };
    }));
  };

  const totalGeneral = contadores.reduce((sum, c) => sum + c.valor, 0);

  const resetearTodos = () => {
    setContadores(prev => prev.map(c => ({ ...c, valor: 0 })));
    reproducirSonido(300, 150);
    vibrar(100);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Contador Manual</h1>
        <p className={styles.subtitle}>
          Tally counter digital desde el móvil (celular) - Cuenta cualquier cosa con un clic
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="general"
        severity="medium"
        collapsible={true}
        context="contador-manual-disclaimer"
      />

      {/* Configuración */}
      <div className={styles.config}>
        <button
          type="button"
          className={`${styles.configBtn} ${sonidoActivo ? styles.activo : ''}`}
          onClick={() => setSonidoActivo(!sonidoActivo)}
          title={sonidoActivo ? 'Desactivar sonido' : 'Activar sonido'}
          aria-pressed={sonidoActivo}
        >
          <span aria-hidden="true">{sonidoActivo ? '🔊' : '🔇'}</span> Sonido
        </button>
        <button
          type="button"
          className={`${styles.configBtn} ${vibracionActiva ? styles.activo : ''}`}
          onClick={() => setVibracionActiva(!vibracionActiva)}
          title={vibracionActiva ? 'Desactivar vibración' : 'Activar vibración'}
          aria-pressed={vibracionActiva}
        >
          <span aria-hidden="true">{vibracionActiva ? '📳' : '📴'}</span> Vibración
        </button>
      </div>

      {/* Total general */}
      {contadores.length > 1 && (
        <div className={styles.totalGeneral}>
          <span className={styles.totalLabel}>Total general:</span>
          <span className={styles.totalValor}>{totalGeneral.toLocaleString('es-ES')}</span>
          <button type="button" className={styles.btnResetAll} onClick={resetearTodos}>
            Resetear todos
          </button>
        </div>
      )}

      {/* Contadores */}
      <div className={styles.contadoresGrid}>
        {contadores.map(contador => (
          <div
            key={contador.id}
            className={styles.contadorCard}
            style={{ '--contador-color': contador.color } as React.CSSProperties}
          >
            <div className={styles.contadorHeader}>
              <input
                type="text"
                value={contador.nombre}
                onChange={(e) => cambiarNombre(contador.id, e.target.value)}
                className={styles.nombreInput}
                maxLength={20}
              />
              <div className={styles.contadorActions}>
                <button
                  type="button"
                  className={styles.btnColor}
                  onClick={() => cambiarColor(contador.id)}
                  title="Cambiar color"
                  style={{ background: contador.color }}
                >
                  🎨
                </button>
                {contadores.length > 1 && (
                  <button
                    type="button"
                    className={styles.btnEliminar}
                    onClick={() => eliminarContador(contador.id)}
                    title="Eliminar contador"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className={styles.contadorBody}>
              <button
                type="button"
                className={styles.btnDecrementar}
                onClick={() => decrementar(contador.id)}
                disabled={contador.valor === 0}
              >
                −
              </button>

              <button
                type="button"
                className={styles.valorDisplay}
                onClick={() => incrementar(contador.id)}
                style={{ background: contador.color }}
              >
                <span className={styles.valorNumero}>
                  {contador.valor.toLocaleString('es-ES')}
                </span>
                <span className={styles.valorHint}>Toca para +1</span>
              </button>

              <button
                type="button"
                className={styles.btnIncrementar}
                onClick={() => incrementar(contador.id)}
              >
                +
              </button>
            </div>

            <button
              type="button"
              className={styles.btnReset}
              onClick={() => resetear(contador.id)}
              disabled={contador.valor === 0}
            >
              ↺ Resetear
            </button>
          </div>
        ))}

        {/* Botón agregar contador */}
        <button type="button" className={styles.btnAgregar} onClick={agregarContador}>
          <span className={styles.agregarIcon}>+</span>
          <span className={styles.agregarTexto}>Añadir contador</span>
        </button>
      </div>

      <EducationalSection
        title="Todo sobre el Contador Manual"
        subtitle="Cómo usar un tally counter digital para cualquier situación de conteo"
      >
        {/* Tabla comparativa */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Tipo de uso</th>
                <th>Contadores necesarios</th>
                <th>Rango habitual</th>
                <th>Recomendación</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Contar personas en aforo</td>
                <td>1 contador</td>
                <td>0 – 500</td>
                <td>Usar sonido activado</td>
              </tr>
              <tr>
                <td>Repeticiones de ejercicio</td>
                <td>1-3 contadores</td>
                <td>0 – 100</td>
                <td>Vibración activada</td>
              </tr>
              <tr>
                <td>Inventario multiproducto</td>
                <td>Varios contadores</td>
                <td>0 – 9.999</td>
                <td>Nombrar cada contador</td>
              </tr>
              <tr>
                <td>Puntuación de juego</td>
                <td>1 por jugador</td>
                <td>0 – 1.000</td>
                <td>Colores distintos por jugador</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Casos de uso */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🏋️</span>
              <strong>Deportistas y entrenadores</strong>
            </div>
            <p>Cuenta series, repeticiones o vueltas sin perder el ritmo ni mirar el móvil (celular).</p>
            <div className={styles.escenarioExample}>Ejemplo: 3 contadores para press banca, sentadillas y dominadas</div>
            <div className={styles.escenarioTip}>Activa la vibración para no distraerte con el sonido</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">📦</span>
              <strong>Almacén e inventario</strong>
            </div>
            <p>Cuenta unidades de distintos productos simultáneamente sin papel ni bolígrafo.</p>
            <div className={styles.escenarioExample}>Ejemplo: un contador por referencia de producto</div>
            <div className={styles.escenarioTip}>Pon el nombre del producto en cada contador para no confundirte</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎲</span>
              <strong>Juegos y competiciones</strong>
            </div>
            <p>Lleva la puntuación de varios jugadores al mismo tiempo con colores distintos.</p>
            <div className={styles.escenarioExample}>Ejemplo: 4 contadores de colores para partidas de cartas</div>
            <div className={styles.escenarioTip}>Usa el total general para ver la suma acumulada</div>
          </div>
        </div>

        {/* FAQ */}
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>¿Se guardan los contadores al cerrar la app?</strong>
            <p>Sí. Los valores y nombres se guardan automáticamente en el navegador y se recuperan al volver.</p>
            <span className={styles.faqTip}>Solo se pierden si borras los datos del navegador.</span>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Cuántos contadores puedo tener a la vez?</strong>
            <p>No hay límite técnico, pero para uso cómodo recomendamos un máximo de 6-8 contadores simultáneos.</p>
            <span className={styles.faqTip}>El total general aparece automáticamente cuando hay más de uno.</span>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Puedo bajar el valor por debajo de cero?</strong>
            <p>No. El valor mínimo es 0. Si necesitas decrementar desde cero, el botón queda desactivado automáticamente.</p>
            <span className={styles.faqTip}>Ideal para evitar conteos negativos accidentales.</span>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Funciona sin conexión a internet?</strong>
            <p>Sí. Una vez cargada la página, funciona sin conexión. Los datos se guardan localmente en tu dispositivo.</p>
            <span className={styles.faqTip}>Perfecto para zonas con cobertura limitada.</span>
          </div>
        </div>

        {/* Guía paso a paso */}
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Añade los contadores necesarios</strong>
              <p>Pulsa "Añadir contador" para crear tantos como necesites. Cada uno es independiente.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Personaliza nombre y color</strong>
              <p>Toca el nombre para editarlo y el ícono de paleta para cambiar el color identificativo.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Configura sonido y vibración</strong>
              <p>Activa o desactiva el feedback sonoro y táctil según tu entorno y preferencia.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Cuenta tocando el círculo</strong>
              <p>Toca el valor grande (o el botón +) para incrementar. El botón – decrementa sin bajar de 0.</p>
            </div>
          </div>
        </div>

        {/* Mejores prácticas */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎨</span>
            <strong>Usa colores distintos</strong>
            <p>Asigna un color único a cada contador para identificarlos de un vistazo.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🏷️</span>
            <strong>Nombra siempre los contadores</strong>
            <p>Un nombre descriptivo evita confusiones cuando tienes varios activos al mismo tiempo.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📱</span>
            <strong>Añade a pantalla de inicio</strong>
            <p>Guarda la página en tu móvil o celular como acceso directo para abrir el contador con un solo toque.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔄</span>
            <strong>Resetea por contador</strong>
            <p>Usa el botón "↺ Resetear" individual en vez del reseteo general para no perder otros conteos.</p>
          </div>
        </div>

        {/* Warning box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes al contar</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Contar sin resetear antes:</strong> Asegúrate de resetear el contador antes de empezar un nuevo conteo.</li>
            <li><strong>Borrar el navegador sin exportar:</strong> Si limpias el historial del navegador, perderás los valores guardados.</li>
            <li><strong>Usar el reseteo general por error:</strong> "Resetear todos" pone todos los contadores a 0. No hay deshacer.</li>
            <li><strong>Confundir contadores sin nombre:</strong> Siempre nombra los contadores cuando uses más de uno para evitar errores.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('contador-manual')} />
      <ShareCard appName="contador-manual" />
      <Footer appName="contador-manual" />
    </div>
  );
}
