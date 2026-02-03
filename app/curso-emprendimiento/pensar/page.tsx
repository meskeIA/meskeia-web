'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../ChapterPage';
import styles from '../CursoEmprendimiento.module.css';

const sections = [
  {
    title: 'La Mentalidad Emprendedora',
    icon: '🧠',
    content: (
      <>
        <p>El emprendimiento requiere dos características esenciales: <strong>pasión por el cambio</strong> y <strong>capacidad de actuar</strong>. Los emprendedores no crean el cambio, lo explotan. Siempre que hay cambios rápidos, hay oportunidades.</p>
        <div className={styles.highlightBox}>
          <p><strong>Pasión por el Cambio:</strong> Los emprendedores se sienten atraídos por el cambio como las polillas por la luz. Es lo que los impulsa.</p>
        </div>
        <div className={styles.highlightBox}>
          <p><strong>Capacidad de Actuar:</strong> Actuar en ambientes inciertos, tomando riesgos calculados y aprendiendo del fracaso.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Las 7 Fuentes de Innovación según Drucker',
    icon: '💡',
    content: (
      <>
        <p>Peter Drucker identificó siete fuentes sistemáticas de oportunidades innovadoras, ordenadas por confiabilidad:</p>

        <h3>1. Lo Inesperado</h3>
        <ul>
          <li><strong>Éxitos inesperados:</strong> Como Mercado Libre que empezó vendiendo solo libros y terminó siendo el Amazon de Latinoamérica</li>
          <li><strong>Fracasos inesperados:</strong> La crisis del 2008 creó oportunidades como N26 y Revolut en banca digital</li>
          <li><strong>Eventos externos:</strong> La pandemia disparó el teletrabajo y plataformas como Zoom o Teams</li>
        </ul>

        <h3>2. Incongruencias</h3>
        <ul>
          <li><strong>Realidad económica:</strong> España tiene uno de los mejores sistemas sanitarios pero largas listas de espera (oportunidad para DocPlanner)</li>
          <li><strong>Realidad vs. suposiciones:</strong> Todo el mundo dice usar transporte público pero las ciudades siguen colapsadas (oportunidad para BlaBlaCar)</li>
          <li><strong>Percepción vs. realidad:</strong> "No tengo tiempo" pero pasamos 3h en redes sociales (oportunidades en productividad)</li>
        </ul>

        <h3>3. Necesidades de Proceso</h3>
        <p>Mejorar procesos existentes identificando eslabones débiles o faltantes. Ejemplo: digitalización de historiales médicos.</p>

        <h3>4. Cambios en Estructura Industrial</h3>
        <ul>
          <li><strong>Crecimiento rápido:</strong> El boom del delivery con Glovo, Just Eat, Uber Eats tras la pandemia</li>
          <li><strong>Maduración:</strong> Los bancos tradicionales vs. neobancos como N26, Revolut</li>
          <li><strong>Convergencia tecnológica:</strong> Móvil + pagos = Bizum, Apple Pay, Google Pay</li>
        </ul>

        <h3>5. Cambios Demográficos</h3>
        <p>Envejecimiento de la población europea → boom de servicios para mayores (como Cuideo en España). Cambios predecibles pero más lentos.</p>

        <h3>6. Cambios de Percepción</h3>
        <p>Los videojuegos pasaron de "cosa de niños" a industria que factura más que el cine en Europa. Las criptomonedas de "estafa" a reserva de valor.</p>

        <h3>7. Nuevo Conocimiento</h3>
        <p>La fuente más arriesgada. Toma décadas, requiere mucho capital y hay mucha competencia. Ejemplo: la inteligencia artificial o las energías renovables.</p>
      </>
    ),
  },
  {
    title: 'Los 6 Principios para la Búsqueda Sistemática',
    icon: '🔍',
    content: (
      <>
        <div className={styles.exampleGrid}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>1️⃣</div>
            <div className={styles.exampleName}>Analizar Oportunidades</div>
            <div className={styles.exampleDesc}>Busca ideas que abarquen múltiples fuentes de innovación.</div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>2️⃣</div>
            <div className={styles.exampleName}>Sal y Escucha</div>
            <div className={styles.exampleDesc}>Habla con clientes y proveedores. Si no tienes conexiones, recluta a alguien que las tenga.</div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>3️⃣</div>
            <div className={styles.exampleName}>Simple y Enfocado</div>
            <div className={styles.exampleDesc}>No cambies demasiado al mismo tiempo. Los clientes resisten grandes disrupciones.</div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>4️⃣</div>
            <div className={styles.exampleName}>Inicia Pequeño</div>
            <div className={styles.exampleDesc}>Proyectos grandes requieren más tiempo y dinero para ajustes necesarios.</div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>5️⃣</div>
            <div className={styles.exampleName}>Innova para Hoy</div>
            <div className={styles.exampleDesc}>Debe tener aplicación inmediata, no depender de adopción masiva futura.</div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>6️⃣</div>
            <div className={styles.exampleName}>Implementable</div>
            <div className={styles.exampleDesc}>Asegúrate de poder visualizar un segmento donde tu idea pueda liderar.</div>
          </div>
        </div>
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
          <li>Haz una lista de 10 cosas que te molestan en tu día a día</li>
          <li>Pregunta a 3 amigos: "¿Qué te molesta más en tu trabajo?"</li>
          <li>Apunta 5 cosas que cambiarías de tu ciudad/barrio</li>
        </ul>

        <h3>Esta semana</h3>
        <ul>
          <li>Lee las noticias buscando "problemas no resueltos"</li>
          <li>Observa cómo la gente hace colas, espera, se frustra</li>
          <li>Busca 3 empresas que hayan pivotado (cambiado completamente)</li>
        </ul>

        <h3>Este mes</h3>
        <ul>
          <li>Elige 2-3 ideas y pregunta a 10 personas si las pagarían</li>
          <li>Investiga quién ya está intentando resolver estos problemas</li>
          <li>Decide cuál es tu "área de expertise" donde puedes encontrar oportunidades</li>
        </ul>
      </>
    ),
  },
];

export default function PensarPage() {
  return <ChapterPage slug="pensar" sections={sections} />;
}
