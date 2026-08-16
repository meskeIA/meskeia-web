'use client';
// @disclaimer: exempt

import { useRef, useEffect, useState, useCallback } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './SimuladorBoids.module.css';

// ============== TIPOS Y CONSTANTES ==============

interface Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

// Parámetros que el bucle de animación lee en cada frame.
interface Parametros {
  numBoids: number;
  pesoSeparacion: number;
  pesoAlineacion: number;
  pesoCohesion: number;
  radioPercepcion: number;
  velocidadMax: number;
}

const ANCHO = 800;
const ALTO = 500;
const RADIO_SEPARACION_FACTOR = 0.5; // la separación actúa a la mitad del radio de percepción
const VELOCIDAD_MIN_FACTOR = 0.5; // velocidad mínima como fracción de la máxima

const PARAMS_INICIALES: Parametros = {
  numBoids: 90,
  pesoSeparacion: 1.4,
  pesoAlineacion: 1,
  pesoCohesion: 0.9,
  radioPercepcion: 60,
  velocidadMax: 3.5,
};

// ============== LÓGICA DE LA BANDADA ==============

function aleatorio(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Crea una bandada con posiciones y velocidades al azar.
function crearBoids(cantidad: number, velMax: number): Boid[] {
  const boids: Boid[] = [];
  for (let i = 0; i < cantidad; i++) {
    const angulo = aleatorio(0, Math.PI * 2);
    const velocidad = aleatorio(velMax * 0.5, velMax);
    boids.push({
      x: aleatorio(0, ANCHO),
      y: aleatorio(0, ALTO),
      vx: Math.cos(angulo) * velocidad,
      vy: Math.sin(angulo) * velocidad,
    });
  }
  return boids;
}

// Limita un vector (vx, vy) a una magnitud máxima.
function limitarVelocidad(b: Boid, velMax: number): void {
  const velMin = velMax * VELOCIDAD_MIN_FACTOR;
  const magnitud = Math.hypot(b.vx, b.vy);
  if (magnitud > velMax) {
    b.vx = (b.vx / magnitud) * velMax;
    b.vy = (b.vy / magnitud) * velMax;
  } else if (magnitud < velMin && magnitud > 0) {
    b.vx = (b.vx / magnitud) * velMin;
    b.vy = (b.vy / magnitud) * velMin;
  }
}

// Aplica las 3 reglas de Reynolds a toda la bandada y avanza un paso.
// Implementación O(n²): cada boid mira a todos los demás para hallar sus vecinos.
function actualizarBoids(boids: Boid[], p: Parametros): void {
  const radio = p.radioPercepcion;
  const radioSep = radio * RADIO_SEPARACION_FACTOR;
  const radio2 = radio * radio;
  const radioSep2 = radioSep * radioSep;

  // Acumuladores por boid (se calculan con el estado actual antes de mover).
  const ax = new Array<number>(boids.length).fill(0);
  const ay = new Array<number>(boids.length).fill(0);

  for (let i = 0; i < boids.length; i++) {
    const bi = boids[i];

    // Separación: alejarse de vecinos muy cercanos.
    let sepX = 0;
    let sepY = 0;
    // Alineación: media de la velocidad de los vecinos.
    let aliX = 0;
    let aliY = 0;
    // Cohesión: centro de masa de los vecinos.
    let cohX = 0;
    let cohY = 0;
    let vecinos = 0;

    for (let j = 0; j < boids.length; j++) {
      if (i === j) continue;
      const bj = boids[j];
      const dx = bi.x - bj.x;
      const dy = bi.y - bj.y;
      const dist2 = dx * dx + dy * dy;
      if (dist2 > radio2 || dist2 === 0) continue;

      vecinos++;
      aliX += bj.vx;
      aliY += bj.vy;
      cohX += bj.x;
      cohY += bj.y;

      if (dist2 < radioSep2) {
        // Empuje inversamente proporcional a la distancia: cuanto más cerca, más fuerte.
        const dist = Math.sqrt(dist2);
        sepX += dx / dist;
        sepY += dy / dist;
      }
    }

    if (vecinos === 0) continue;

    // Alineación: dirección hacia la velocidad media de los vecinos.
    aliX /= vecinos;
    aliY /= vecinos;
    const aliMag = Math.hypot(aliX, aliY);
    let dirAliX = 0;
    let dirAliY = 0;
    if (aliMag > 0) {
      dirAliX = aliX / aliMag - bi.vx / (Math.hypot(bi.vx, bi.vy) || 1);
      dirAliY = aliY / aliMag - bi.vy / (Math.hypot(bi.vx, bi.vy) || 1);
    }

    // Cohesión: dirección hacia el centro de masa de los vecinos.
    cohX = cohX / vecinos - bi.x;
    cohY = cohY / vecinos - bi.y;
    const cohMag = Math.hypot(cohX, cohY);
    if (cohMag > 0) {
      cohX /= cohMag;
      cohY /= cohMag;
    }

    // Separación: normalizada para que sea una dirección.
    const sepMag = Math.hypot(sepX, sepY);
    if (sepMag > 0) {
      sepX /= sepMag;
      sepY /= sepMag;
    }

    ax[i] = sepX * p.pesoSeparacion + dirAliX * p.pesoAlineacion + cohX * p.pesoCohesion;
    ay[i] = sepY * p.pesoSeparacion + dirAliY * p.pesoAlineacion + cohY * p.pesoCohesion;
  }

  // Aplicar la aceleración, limitar y mover (con envoltura por los bordes).
  for (let i = 0; i < boids.length; i++) {
    const b = boids[i];
    b.vx += ax[i];
    b.vy += ay[i];
    limitarVelocidad(b, p.velocidadMax);
    b.x += b.vx;
    b.y += b.vy;

    // Bordes envolventes (wrap): salir por un lado = entrar por el opuesto.
    if (b.x < 0) b.x += ANCHO;
    else if (b.x >= ANCHO) b.x -= ANCHO;
    if (b.y < 0) b.y += ALTO;
    else if (b.y >= ALTO) b.y -= ALTO;
  }
}

// Dibuja un boid como un triángulo orientado según su velocidad.
function dibujarBoid(ctx: CanvasRenderingContext2D, b: Boid, color: string): void {
  const angulo = Math.atan2(b.vy, b.vx);
  const tamano = 7;
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(angulo);
  ctx.beginPath();
  ctx.moveTo(tamano, 0);
  ctx.lineTo(-tamano * 0.6, tamano * 0.6);
  ctx.lineTo(-tamano * 0.6, -tamano * 0.6);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

// ============== COMPONENTE PRINCIPAL ==============

export default function SimuladorBoidsPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const boidsRef = useRef<Boid[]>([]);
  const paramsRef = useRef<Parametros>({ ...PARAMS_INICIALES });
  const animandoRef = useRef<boolean>(true);
  const rafRef = useRef<number | null>(null);

  const [params, setParams] = useState<Parametros>({ ...PARAMS_INICIALES });
  const [animando, setAnimando] = useState<boolean>(true);

  // Mantener paramsRef sincronizado con el estado, sin reiniciar el bucle.
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  useEffect(() => {
    animandoRef.current = animando;
  }, [animando]);

  // Recoloca la bandada al azar respetando el número actual de boids.
  const reiniciar = useCallback(() => {
    boidsRef.current = crearBoids(paramsRef.current.numBoids, paramsRef.current.velocidadMax);
  }, []);

  // Bucle de animación: se monta una sola vez y lee siempre los valores más recientes
  // desde las refs, de modo que mover un slider NO reinicia la simulación.
  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Si el usuario prefiere menos movimiento, arrancamos en pausa.
    if (reduceMotion) {
      animandoRef.current = false;
      setAnimando(false);
    }

    boidsRef.current = crearBoids(paramsRef.current.numBoids, paramsRef.current.velocidadMax);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colorBoid =
      typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-theme') === 'dark'
        ? '#7FB3D3'
        : '#2E86AB';

    const dibujarFotograma = (): void => {
      const p = paramsRef.current;

      // Ajustar el tamaño de la bandada si cambió el número de boids.
      if (boidsRef.current.length !== p.numBoids) {
        if (boidsRef.current.length < p.numBoids) {
          const faltan = p.numBoids - boidsRef.current.length;
          boidsRef.current = boidsRef.current.concat(crearBoids(faltan, p.velocidadMax));
        } else {
          boidsRef.current = boidsRef.current.slice(0, p.numBoids);
        }
      }

      if (animandoRef.current) {
        actualizarBoids(boidsRef.current, p);
      }

      // Estela sutil: rellenar con alpha bajo en vez de borrar del todo.
      const dark =
        typeof document !== 'undefined' &&
        document.documentElement.getAttribute('data-theme') === 'dark';
      ctx.fillStyle = dark ? 'rgba(26, 32, 44, 0.35)' : 'rgba(245, 249, 252, 0.35)';
      ctx.fillRect(0, 0, ANCHO, ALTO);

      const color = dark ? '#7FB3D3' : colorBoid;
      for (const b of boidsRef.current) {
        dibujarBoid(ctx, b, color);
      }

      rafRef.current = requestAnimationFrame(dibujarFotograma);
    };

    rafRef.current = requestAnimationFrame(dibujarFotograma);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // Se monta una sola vez: el bucle lee parámetros desde refs.
  }, []);

  const toggleAnimacion = useCallback(() => {
    setAnimando((prev) => !prev);
  }, []);

  // Helpers para actualizar un parámetro concreto.
  const actualizarParametro = useCallback(
    (clave: keyof Parametros, valor: number) => {
      setParams((prev) => ({ ...prev, [clave]: valor }));
    },
    [],
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Simulador de Boids</h1>
        <p className={styles.subtitle}>
          Comportamiento de bandada en tiempo real: tres reglas locales —separación, alineación y
          cohesión— de las que emerge un movimiento colectivo, sin ningún líder
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <div className={styles.simPanel}>
          <h2 className={styles.panelTitle}>La bandada</h2>
          <div className={styles.canvasWrapper}>
            <canvas
              ref={canvasRef}
              width={ANCHO}
              height={ALTO}
              className={styles.canvas}
              role="img"
              aria-label="Simulación animada de una bandada de boids: pequeños triángulos que se mueven en grupo aplicando las reglas de separación, alineación y cohesión."
            />
          </div>

          <div className={styles.controlBar}>
            <button
              type="button"
              className={styles.controlBtn}
              onClick={toggleAnimacion}
              aria-pressed={animando}
            >
              {animando ? (
                <>
                  <span aria-hidden="true">⏸</span> Pausar
                </>
              ) : (
                <>
                  <span aria-hidden="true">▶</span> Reanudar
                </>
              )}
            </button>
            <button
              type="button"
              className={`${styles.controlBtn} ${styles.secondaryBtn}`}
              onClick={reiniciar}
            >
              <span aria-hidden="true">↺</span> Reiniciar
            </button>
          </div>
        </div>

        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Parámetros de la bandada</h2>
          <div className={styles.controlsGrid}>
            <div className={styles.sliderControl}>
              <label htmlFor="num-boids">
                Nº de boids: <span className={styles.sliderValue}>{params.numBoids}</span>
              </label>
              <input
                id="num-boids"
                type="range"
                min={20}
                max={200}
                step={5}
                value={params.numBoids}
                onChange={(e) => actualizarParametro('numBoids', parseInt(e.target.value, 10))}
              />
            </div>

            <div className={styles.sliderControl}>
              <label htmlFor="peso-separacion">
                Separación: <span className={styles.sliderValue}>{params.pesoSeparacion.toFixed(1)}</span>
              </label>
              <input
                id="peso-separacion"
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={params.pesoSeparacion}
                onChange={(e) => actualizarParametro('pesoSeparacion', parseFloat(e.target.value))}
              />
            </div>

            <div className={styles.sliderControl}>
              <label htmlFor="peso-alineacion">
                Alineación: <span className={styles.sliderValue}>{params.pesoAlineacion.toFixed(1)}</span>
              </label>
              <input
                id="peso-alineacion"
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={params.pesoAlineacion}
                onChange={(e) => actualizarParametro('pesoAlineacion', parseFloat(e.target.value))}
              />
            </div>

            <div className={styles.sliderControl}>
              <label htmlFor="peso-cohesion">
                Cohesión: <span className={styles.sliderValue}>{params.pesoCohesion.toFixed(1)}</span>
              </label>
              <input
                id="peso-cohesion"
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={params.pesoCohesion}
                onChange={(e) => actualizarParametro('pesoCohesion', parseFloat(e.target.value))}
              />
            </div>

            <div className={styles.sliderControl}>
              <label htmlFor="radio-percepcion">
                Radio de percepción: <span className={styles.sliderValue}>{params.radioPercepcion} px</span>
              </label>
              <input
                id="radio-percepcion"
                type="range"
                min={20}
                max={150}
                step={5}
                value={params.radioPercepcion}
                onChange={(e) => actualizarParametro('radioPercepcion', parseInt(e.target.value, 10))}
              />
            </div>

            <div className={styles.sliderControl}>
              <label htmlFor="velocidad-max">
                Velocidad máxima: <span className={styles.sliderValue}>{params.velocidadMax.toFixed(1)}</span>
              </label>
              <input
                id="velocidad-max"
                type="range"
                min={1}
                max={7}
                step={0.5}
                value={params.velocidadMax}
                onChange={(e) => actualizarParametro('velocidadMax', parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className={styles.hint}>
            Mueve los sliders y observa el efecto <strong>en directo</strong>: sube la separación y la
            bandada se dispersa; sube la cohesión y los boids se apelotonan; sin alineación dejan de ir
            todos en la misma dirección. El movimiento del grupo no lo dirige nadie: emerge de estas
            reglas locales.
          </div>
        </div>
      </main>

      <EducationalSection
        title="Guía del comportamiento de bandada (boids)"
        subtitle="Separación, alineación y cohesión: las tres reglas de Craig Reynolds (1986)"
      >
        <h3>Las tres reglas y qué pasa si quitas cada una</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Regla</th>
                <th>Qué hace cada boid</th>
                <th>Qué pasa si la quitas</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Separación</strong></td>
                <td>Se aleja de los vecinos que tiene demasiado cerca para no chocar.</td>
                <td>Los boids se amontonan y se solapan en un mismo punto.</td>
              </tr>
              <tr>
                <td><strong>Alineación</strong></td>
                <td>Ajusta su velocidad hacia la media de la de sus vecinos.</td>
                <td>Cada uno va por su lado: no se forma una dirección común.</td>
              </tr>
              <tr>
                <td><strong>Cohesión</strong></td>
                <td>Se dirige hacia el centro de masa (la posición media) de sus vecinos.</td>
                <td>El grupo se disgrega y nunca llega a formar bandada.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Dónde se usa el modelo de boids</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎮</span>
              <strong>Bandadas y cardúmenes en videojuegos</strong>
            </div>
            <p className={styles.escenarioExample}>
              Aves de fondo, bancos de peces o grupos de criaturas que dan vida al escenario se animan
              con boids en lugar de mover a cada agente a mano. Es la base de la «IA de movimiento» o
              steering behaviors.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> Suelen añadirse reglas extra: huir del jugador, evitar obstáculos o buscar comida.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎬</span>
              <strong>Multitudes en el cine</strong>
            </div>
            <p className={styles.escenarioExample}>
              Los boids se usaron de forma pionera en los murciélagos y los pingüinos de <em>Batman
              Returns</em> (1992). Desde entonces, escenas con enjambres, manadas o multitudes apoyan su
              animación en variantes del mismo modelo.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> Para multitudes humanas se combinan con pathfinding y evitación de colisiones.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🤖</span>
              <strong>Drones y robótica de enjambre</strong>
            </div>
            <p className={styles.escenarioExample}>
              Los enjambres de drones coordinan su vuelo con reglas locales parecidas: mantener distancia,
              ir en la misma dirección y no separarse del grupo. No hay un dron «jefe»: cada uno decide
              mirando a sus vecinos.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> Trabajar con reglas locales hace al enjambre robusto: si falla un agente, el resto sigue.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🚶</span>
              <strong>Tráfico y peatones</strong>
            </div>
            <p className={styles.escenarioExample}>
              Modelos de simulación de tráfico y de flujo de peatones se inspiran en ideas similares para
              estudiar atascos, evacuaciones o el diseño de espacios públicos sin programar el recorrido
              exacto de cada persona.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> Aquí las reglas se afinan con datos reales de cómo se mueve la gente.
            </p>
          </div>
        </div>

        <h3>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Hay un boid que dirija a la bandada?</h4>
            <p>
              No. Ninguno manda ni conoce la forma del grupo. Cada boid solo reacciona a los vecinos que
              tiene dentro de su radio de percepción. El movimiento coordinado que ves es un ejemplo de
              comportamiento emergente: surge del conjunto de decisiones locales, no de un plan central.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Es lo mismo que pasa con los estorninos reales: no siguen a un líder, reaccionan a sus
              vecinos próximos.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué es el radio de percepción?</h4>
            <p>
              Es la distancia hasta la que un boid «ve» a sus compañeros. Solo tiene en cuenta a los
              vecinos dentro de ese radio para calcular las tres reglas. Con un radio pequeño se forman
              muchos grupitos independientes; con un radio grande tiende a salir una única bandada grande.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Aumentar el radio también encarece el cálculo: hay más vecinos que considerar.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué con muchos boids la simulación se ralentiza?</h4>
            <p>
              En la versión sencilla, cada boid comprueba la distancia a todos los demás para saber
              quiénes son sus vecinos. Eso es un coste O(n²): al doblar el número de agentes, el trabajo se
              cuadruplica. Por eso una bandada moderada va fluida y una enorme puede ir a tirones.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Para escalar se divide el espacio en una rejilla (spatial hashing) y solo se miran las
              celdas cercanas.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué hay que limitar la velocidad?</h4>
            <p>
              Las tres reglas suman pequeños empujes a la velocidad fotograma tras fotograma. Sin un tope,
              esos empujes se acumulan y los boids se acelerarían sin parar hasta volverse incontrolables.
              Por eso se recorta la velocidad a un máximo (y a veces se fija también un mínimo, para que no
              se queden quietos).
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Es uno de los detalles que más se olvidan al programar boids por primera vez.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cómo se equilibran los pesos de las reglas?</h4>
            <p>
              No hay valores «correctos» universales: se ajustan a ojo según el resultado que buscas. En
              general, la separación suele pesar algo más que la cohesión para evitar amontonamientos, y la
              alineación define cuán coordinada se mueve la bandada. Cambia los sliders y observa: es la
              mejor forma de entenderlo.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Si todo se apelotona, sube la separación; si se dispersa, sube la cohesión.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Sirven los boids solo para animar pájaros?</h4>
            <p>
              No. La idea de coordinar muchos agentes con reglas locales se aplica a bancos de peces,
              enjambres de insectos, multitudes, robótica de enjambre y simulaciones de tráfico. Los boids
              fueron el punto de partida de toda una familia de técnicas de comportamiento colectivo.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Reynolds amplió el modelo con más «steering behaviors»: perseguir, huir, evitar
              obstáculos, deambular…
            </p>
          </div>
        </div>

        <h3>Qué hace el algoritmo en cada fotograma</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Busca los vecinos de cada boid</strong>
              <p>
                Para cada boid, se identifican los demás que están dentro de su radio de percepción. Solo
                esos influyen en su próximo movimiento.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Calcula las tres reglas</strong>
              <p>
                Con esos vecinos se obtienen tres direcciones: separación (alejarse de los muy cercanos),
                alineación (igualar su velocidad media) y cohesión (ir hacia su centro de masa).
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Suma las reglas con sus pesos</strong>
              <p>
                Cada dirección se multiplica por su peso y se suman. El resultado es la aceleración que se
                añade a la velocidad actual del boid.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Limita la velocidad</strong>
              <p>
                Se recorta la velocidad a un máximo para que ningún boid se descontrole, manteniendo el
                movimiento estable.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Mueve y repite</strong>
              <p>
                Se actualiza la posición sumando la velocidad. Si un boid sale por un borde, reaparece por
                el lado opuesto (envoltura). Al fotograma siguiente, vuelta a empezar.
              </p>
            </div>
          </div>
        </div>

        <h3>Consejos al implementar boids</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Calcula con el estado anterior</strong>
            <p>
              Halla las tres reglas de todos los boids antes de mover ninguno. Si actualizas a la vez que
              calculas, unos influyen sobre otros dentro del mismo fotograma y el resultado se distorsiona.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Limita siempre la velocidad</strong>
            <p>
              Pon un tope (y opcionalmente un mínimo) a la magnitud de la velocidad. Es lo que evita que la
              bandada se acelere sin control con el paso de los fotogramas.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Normaliza antes de pesar</strong>
            <p>
              Convierte cada regla en una dirección de magnitud uno antes de multiplicarla por su peso. Así
              los pesos son comparables y fáciles de afinar.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Usa una rejilla espacial</strong>
            <p>
              Para muchos agentes, divide el espacio en celdas y busca vecinos solo en las cercanas. Pasas
              de O(n²) a algo mucho más manejable.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Decide cómo tratar los bordes</strong>
            <p>
              Envolver (salir por un lado y entrar por el otro), rebotar o empujar hacia el centro. Cada
              opción da una sensación distinta; elige según lo que quieras transmitir.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Ajusta los pesos a ojo</strong>
            <p>
              No busques valores «perfectos»: cambia un peso, observa y corrige. Un radio de separación
              menor que el de percepción suele dar bandadas más naturales.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠</span>
            <strong>Errores frecuentes al programar boids</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Comparar cada boid con todos los demás sin rejilla espacial → coste O(n²) y caída de FPS con muchos agentes.</li>
            <li>No limitar la velocidad → los boids se aceleran sin control y la bandada «explota».</li>
            <li>Pesos mal equilibrados → o todo se amontona (poca separación) o el grupo se disgrega (poca cohesión).</li>
            <li>Actualizar posiciones mientras se calculan las reglas → unos boids influyen sobre otros en el mismo fotograma.</li>
            <li>Radio de percepción demasiado grande → todo se vuelve una sola masa y, además, ralentiza el cálculo.</li>
            <li>Olvidar el tratamiento de bordes → boids que se pierden fuera de la pantalla para siempre.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-boids')} />
      <ShareCard appName="simulador-boids" />
      <Footer appName="simulador-boids" />
    </div>
  );
}
