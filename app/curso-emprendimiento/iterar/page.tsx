'use client';

import ChapterPage from '../ChapterPage';
import styles from '../CursoEmprendimiento.module.css';

const sections = [
  {
    title: 'La Metáfora de la Carrera de Obstáculos',
    icon: '🏃',
    content: (
      <>
        <p>Emprendimiento no es un maratón (donde puedes planificar todo), sino una carrera de obstáculos llena de sorpresas.</p>

        <div className={styles.exampleGrid}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>📋</div>
            <div className={styles.exampleName}>Competidor 1: El Planificador</div>
            <div className={styles.exampleDesc}>55 minutos planeando, 5 ejecutando. Cuando las condiciones no son las esperadas, su plan fracasa.</div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>🚀</div>
            <div className={styles.exampleName}>Competidor 2: El Emprendedor</div>
            <div className={styles.exampleDesc}>Idea básica, empieza y ve qué funciona. Descubre, se adapta, aprende.</div>
          </div>
        </div>

        <div className={styles.highlightBox}>
          <p><strong>Realidad Emprendedora:</strong> Nunca termina como esperabas. Dos pasos adelante, uno atrás. Tropezar no es fracasar, es aprender.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Producto Mínimo Viable (MVP)',
    icon: '🔧',
    content: (
      <>
        <div className={styles.highlightBox}>
          <p><strong>MVP:</strong> Producto más simple que puedes producir para probar rápida, frecuente y económicamente hasta tener algo que funciona.</p>
        </div>

        <h3>Estrategias de Desarrollo</h3>
        <ul>
          <li><strong>No empezar de cero:</strong> Usa algo que ya existe</li>
          <li><strong>Plataformas existentes:</strong> Facebook, Twitter, WordPress como base inicial</li>
          <li><strong>Automatización después:</strong> Procesos manuales inicialmente</li>
        </ul>

        <div className={styles.highlightBox}>
          <p><strong>Caso Wallapop:</strong> Inicio con app simple para vender cosas del garaje entre vecinos. Hoy: más de 15 millones usuarios en España.</p>
        </div>
      </>
    ),
  },
  {
    title: 'El Proceso de Lean Startup',
    icon: '🔄',
    content: (
      <>
        <h3>Ciclo Construir-Medir-Aprender</h3>
        <ol>
          <li><strong>Construir:</strong> MVP basado en hipótesis</li>
          <li><strong>Medir:</strong> Reacción de clientes, métricas clave</li>
          <li><strong>Aprender:</strong> ¿Valida o invalida hipótesis?</li>
          <li><strong>Decidir:</strong> Persistir o pivotar</li>
        </ol>

        <h3>Preguntas Fundamentales</h3>
        <ul>
          <li>¿Hemos resuelto un problema importante del cliente?</li>
          <li>¿Podemos repetir lo que hemos hecho?</li>
          <li>¿Podemos ampliar nuestro producto?</li>
          <li>¿Nuestra estrategia nos da ventaja competitiva?</li>
          <li>¿Funciona nuestra infraestructura?</li>
        </ul>

        <div className={styles.highlightBox}>
          <p><strong>El Arte del Pivot:</strong> Proceso doloroso. Enfrentar rechazo, admitir errores, mantener entusiasmo. Fallar rápido y barato no es fracaso, es camino al éxito.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Caso Glovo: Lean Startup en Acción',
    icon: '🛵',
    content: (
      <>
        <ul>
          <li><strong>2015:</strong> MVP solo en Barcelona para delivery de comida</li>
          <li><strong>4 años:</strong> Iteración constante, amplió a farmacia, supermercado, flores</li>
          <li><strong>Aprendizaje:</strong> Los usuarios querían "cualquier cosa en 30 minutos"</li>
          <li><strong>2019:</strong> Expansión a 25 países</li>
          <li><strong>Actualidad:</strong> Líder europeo en delivery on-demand</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Empezar Hoy',
    icon: '🚀',
    content: (
      <>
        <h3>Próximas 24 horas</h3>
        <ul>
          <li>Define tu MVP: ¿cuál es la versión más simple que puedes crear?</li>
          <li>¿Puedes hacerlo sin programar? ¿Con herramientas existentes?</li>
          <li>Identifica a tu primer cliente potencial y llámalo</li>
        </ul>

        <h3>Esta semana</h3>
        <ul>
          <li>Crea tu MVP (aunque sea con PowerPoint, WhatsApp o email)</li>
          <li>Ofrece tu servicio/producto a 3 personas</li>
          <li>Registra qué funciona y qué no</li>
        </ul>

        <h3>Este mes</h3>
        <ul>
          <li>Consigue tu primer cliente que pague (aunque sea 10 €)</li>
          <li>Itera: mejora según el feedback real</li>
          <li>Decide: ¿sigues por este camino o necesitas pivotar?</li>
        </ul>
      </>
    ),
  },
];

export default function IterarPage() {
  return <ChapterPage slug="iterar" sections={sections} />;
}
