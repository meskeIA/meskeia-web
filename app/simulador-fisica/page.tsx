'use client';

import { useState, useCallback } from 'react';
import styles from './SimuladorFisica.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

import { CaidaLibre, PenduloSimple, Proyectil, Ondas, Resorte } from './components';

type SimuladorTipo = 'caida' | 'pendulo' | 'proyectil' | 'ondas' | 'resorte';

interface SimuladorInfo {
  id: SimuladorTipo;
  nombre: string;
  icono: string;
  descripcion: string;
}

const SIMULADORES: SimuladorInfo[] = [
  {
    id: 'caida',
    nombre: 'Caída Libre',
    icono: '⬇️',
    descripcion: 'Simula la caída de objetos bajo la influencia de la gravedad, con o sin resistencia del aire.',
  },
  {
    id: 'pendulo',
    nombre: 'Péndulo',
    icono: '🔔',
    descripcion: 'Observa el movimiento oscilatorio de un péndulo simple con visualización de energías.',
  },
  {
    id: 'proyectil',
    nombre: 'Proyectil',
    icono: '🎯',
    descripcion: 'Lanza proyectiles y observa su trayectoria parabólica con vectores de velocidad.',
  },
  {
    id: 'ondas',
    nombre: 'Ondas',
    icono: '〰️',
    descripcion: 'Visualiza ondas viajeras, estacionarias y fenómenos de interferencia.',
  },
  {
    id: 'resorte',
    nombre: 'Resorte',
    icono: '🔧',
    descripcion: 'Explora el movimiento armónico simple de un sistema masa-resorte.',
  },
];

export default function SimuladorFisicaPage() {
  const [simuladorActivo, setSimuladorActivo] = useState<SimuladorTipo>('caida');
  const [isPlaying, setIsPlaying] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setResetKey(prev => prev + 1);
  }, []);

  const handleSimuladorChange = (tipo: SimuladorTipo) => {
    setIsPlaying(false);
    setSimuladorActivo(tipo);
    setResetKey(prev => prev + 1);
  };

  const simuladorInfo = SIMULADORES.find(s => s.id === simuladorActivo)!;

  const renderSimulador = () => {
    const props = {
      key: resetKey,
      isPlaying,
      onReset: () => setIsPlaying(false),
    };

    switch (simuladorActivo) {
      case 'caida':
        return <CaidaLibre {...props} />;
      case 'pendulo':
        return <PenduloSimple {...props} />;
      case 'proyectil':
        return <Proyectil {...props} />;
      case 'ondas':
        return <Ondas {...props} />;
      case 'resorte':
        return <Resorte {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🔬 Simulador de Física</h1>
        <p className={styles.subtitle}>
          Experimenta con física en tiempo real: caída libre, péndulos, proyectiles, ondas y resortes
        </p>
      </header>

      {/* Selector de simuladores */}
      <div className={styles.simulatorSelector}>
        {SIMULADORES.map((sim) => (
          <button
            key={sim.id}
            className={`${styles.simBtn} ${simuladorActivo === sim.id ? styles.active : ''}`}
            onClick={() => handleSimuladorChange(sim.id)}
          >
            <span className={styles.simIcon}>{sim.icono}</span>
            <span className={styles.simName}>{sim.nombre}</span>
          </button>
        ))}
      </div>

      {/* Contenido principal */}
      <div className={styles.mainContent}>
        {/* Panel del canvas */}
        <div className={styles.canvasSection}>
          <div className={styles.canvasHeader}>
            <h2 className={styles.canvasTitle}>
              {simuladorInfo.icono} {simuladorInfo.nombre}
            </h2>
            <div className={styles.canvasControls}>
              {!isPlaying ? (
                <button
                  className={styles.controlBtn}
                  onClick={handlePlay}
                  title="Iniciar"
                >
                  ▶️
                </button>
              ) : (
                <button
                  className={`${styles.controlBtn} ${styles.active}`}
                  onClick={handlePause}
                  title="Pausar"
                >
                  ⏸️
                </button>
              )}
              <button
                className={styles.controlBtn}
                onClick={handleReset}
                title="Reiniciar"
              >
                🔄
              </button>
            </div>
          </div>

          {renderSimulador()}
        </div>
      </div>

      {/* Descripción del simulador */}
      <div className={styles.simDescription}>
        <h3 className={styles.descriptionTitle}>Acerca de {simuladorInfo.nombre}</h3>
        <div className={styles.descriptionText}>
          <p>{simuladorInfo.descripcion}</p>
          {simuladorActivo === 'caida' && (
            <p>
              La caída libre es un caso especial de movimiento rectilíneo uniformemente acelerado (MRUA)
              donde la única fuerza que actúa es la gravedad. En la Tierra, la aceleración es aproximadamente
              9,81 m/s². Puedes activar la resistencia del aire para ver cómo afecta a objetos de diferente masa.
            </p>
          )}
          {simuladorActivo === 'pendulo' && (
            <p>
              El péndulo simple es un sistema que oscila bajo la acción de la gravedad. Para ángulos pequeños,
              el período depende solo de la longitud y la gravedad, no de la masa. Observa cómo la energía
              se transforma continuamente entre cinética y potencial.
            </p>
          )}
          {simuladorActivo === 'proyectil' && (
            <p>
              El movimiento de proyectiles combina un movimiento horizontal uniforme (MRU) con una caída libre
              vertical (MRUA). El alcance máximo se obtiene con un ángulo de 45°. Los vectores muestran
              cómo la velocidad horizontal permanece constante mientras la vertical cambia.
            </p>
          )}
          {simuladorActivo === 'ondas' && (
            <p>
              Las ondas transportan energía sin transportar materia. Puedes explorar ondas viajeras,
              ondas estacionarias (que se forman cuando dos ondas viajan en direcciones opuestas), y
              fenómenos de interferencia cuando se superponen ondas de diferentes frecuencias.
            </p>
          )}
          {simuladorActivo === 'resorte' && (
            <p>
              El sistema masa-resorte es el ejemplo clásico de movimiento armónico simple (MAS).
              La frecuencia de oscilación depende de la constante del resorte (k) y la masa.
              La energía total se conserva, transformándose entre cinética y potencial elástica.
            </p>
          )}
        </div>
      </div>

      {/* Sección educativa */}
      <EducationalSection
        title="📚 ¿Quieres aprender más sobre Física?"
        subtitle="Conceptos fundamentales de mecánica y ondas"
      >
        <section className={styles.guideSection}>
          <h2>Conceptos de Física Simulados</h2>
          <p className={styles.introParagraph}>
            Este simulador cubre varios conceptos fundamentales de la física clásica. Cada simulación
            te permite experimentar con diferentes parámetros y observar cómo afectan al comportamiento
            del sistema en tiempo real.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Caída Libre y Gravedad</h4>
              <p>
                Todos los objetos caen con la misma aceleración (g ≈ 9,81 m/s²) en ausencia de
                resistencia del aire. Con resistencia, objetos más densos caen más rápido y
                pueden alcanzar una velocidad terminal.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Péndulo Simple</h4>
              <p>
                Un péndulo oscila con período T = 2π√(L/g), independiente de la masa para ángulos
                pequeños. Es un ejemplo de movimiento armónico simple con intercambio continuo
                entre energía cinética y potencial gravitatoria.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Tiro Parabólico</h4>
              <p>
                La trayectoria de un proyectil es una parábola. El alcance máximo (sin considerar
                aire) se logra a 45°. El tiempo de vuelo depende solo de la componente vertical
                de la velocidad inicial.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Ondas Mecánicas</h4>
              <p>
                Las ondas se caracterizan por su amplitud, frecuencia, longitud de onda y velocidad.
                La relación v = λf conecta estas propiedades. Las ondas estacionarias tienen nodos
                (puntos fijos) y antinodos (máxima amplitud).
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Movimiento Armónico Simple</h4>
              <p>
                El MAS ocurre cuando la fuerza restauradora es proporcional al desplazamiento (F = -kx).
                El período de un sistema masa-resorte es T = 2π√(m/k). La energía total se conserva
                si no hay amortiguamiento.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Conservación de Energía</h4>
              <p>
                En sistemas sin fricción, la energía mecánica total (cinética + potencial) se conserva.
                Puedes observar esto en el péndulo y el resorte, donde la energía oscila entre
                sus formas cinética y potencial.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-fisica')} />
      <Footer appName="simulador-fisica" />
    </div>
  );
}
