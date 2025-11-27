'use client';

import Link from 'next/link';
import ChapterPage from '../ChapterPage';
import styles from '../CursoEmprendimiento.module.css';

const sections = [
  {
    title: '¿Qué es Estrategia?',
    icon: '🎯',
    content: (
      <>
        <div className={styles.highlightBox}>
          <p><strong>Estrategia es ser diferente de manera defendible.</strong> Como en el tai chi, es la pausa antes de la acción para ganar energía, concentrar recursos y avanzar efectivamente.</p>
        </div>

        <h3>Claves estratégicas</h3>
        <ul>
          <li><strong>Ser Diferente:</strong> Esculpir una posición identificando actividades que permitan ventaja competitiva sostenible.</li>
          <li><strong>Lo Más Difícil:</strong> Decidir qué NO hacer. Crecimiento no es estrategia.</li>
        </ul>

        <div className={styles.highlightBox}>
          <p><strong>Ejemplo Mercadona:</strong> Estrategia de calidad-precio. Si se enfocara en lujo premium como El Corte Inglés, tendría que subir precios y perdería su ventaja competitiva.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Las 5 Fuerzas de Porter',
    icon: '⚔️',
    content: (
      <>
        <h3>1. Amenaza de Entrada (Barreras)</h3>
        <ul>
          <li><strong>Economías de escala:</strong> Amazon con centros automatizados</li>
          <li><strong>Diferenciación de producto:</strong> IKEA con proceso patentado + diseño + ubicaciones</li>
          <li><strong>Requisitos de capital:</strong> Forzar grandes inversiones para competir</li>
          <li><strong>Costos de cambio:</strong> Hacer difícil cambiar a competencia</li>
        </ul>

        <h3>2. Poder de Negociación de Compradores</h3>
        <p>Riesgo: Uno o dos clientes grandes pueden dictar términos. Factores: Clientes con alto costo estructural, producto como commodity.</p>

        <h3>3. Poder de Negociación de Proveedores</h3>
        <p>Riesgo: Proveedores pueden subir precios y limitar opciones estratégicas.</p>

        <h3>4. Amenaza de Sustitutos</h3>
        <p><strong>Ejemplo:</strong> Bebidas no carbonatadas vs. refrescos (misma función: saben bien y quitan sed)</p>

        <h3>5. Rivalidad entre Competidores</h3>
        <p>Evitar: Numerosos competidores de tamaño similar, producto como commodity, poco crecimiento industrial.</p>
      </>
    ),
  },
  {
    title: 'Análisis DAFO para Emprendedores',
    icon: '📊',
    content: (
      <>
        <div className={styles.exampleGrid}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>💪</div>
            <div className={styles.exampleName}>Fortalezas (Internas)</div>
            <div className={styles.exampleDesc}>Barreras de entrada que impones a competidores. Ejemplo Zara: rapidez al mercado, diseño propio.</div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>⚠️</div>
            <div className={styles.exampleName}>Debilidades (Internas)</div>
            <div className={styles.exampleDesc}>Usar escritura anónima para honestidad. Ejemplo Zara: dependencia de tiendas físicas.</div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>🌟</div>
            <div className={styles.exampleName}>Oportunidades (Externas)</div>
            <div className={styles.exampleDesc}>No todas las oportunidades encajan en tu modelo. Requiere liderazgo para decir no.</div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>🔥</div>
            <div className={styles.exampleName}>Amenazas (Externas)</div>
            <div className={styles.exampleDesc}>Shein y marcas asiáticas copian diseños instantáneamente. Vinted vs. fast fashion.</div>
          </div>
        </div>

        <p style={{ marginTop: '1rem' }}>
          <Link href="/curso-emprendimiento/herramientas/dafo" className={styles.ctaButton} style={{ display: 'inline-flex' }}>
            🎯 Crear mi Análisis DAFO
          </Link>
        </p>
      </>
    ),
  },
  {
    title: 'Caso de Estudio: IKEA',
    icon: '🏠',
    content: (
      <>
        <div className={styles.highlightBox}>
          <p><strong>Estrategia:</strong> Muebles con estilo a precios razonables para jóvenes profesionales</p>
        </div>

        <h3>Elementos Integrados</h3>
        <ul>
          <li><strong>Pocos empleados:</strong> Clientes se pasean solos → precios bajos</li>
          <li><strong>Diseño propio:</strong> Satisface tendencias de moda</li>
          <li><strong>Muebles modulares:</strong> Diferentes gustos, fácil transporte</li>
          <li><strong>Tiendas grandes:</strong> Acomodan variedad</li>
          <li><strong>Circulación forzada:</strong> Ven todas las opciones</li>
          <li><strong>Cafeterías/guarderías:</strong> Experiencia total</li>
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
          <li>Haz una lista honestísima: 3 fortalezas y 3 debilidades tuyas</li>
          <li>Investiga a tus 3 competidores principales en 30 minutos cada uno</li>
          <li>Describe en 1 frase qué te hace diferente</li>
        </ul>

        <h3>Esta semana</h3>
        <ul>
          <li>Aplica las 5 fuerzas: ¿quién puede hundirte y cómo?</li>
          <li>Identifica 2-3 barreras que puedes crear para competidores</li>
          <li>Decide: ¿en qué NO vas a competir? (¡igual de importante!)</li>
        </ul>

        <h3>Este mes</h3>
        <ul>
          <li>Define tu estrategia en 1 página: qué haces diferente y por qué es defendible</li>
          <li>Valídala con 3 personas que conozcan tu sector</li>
          <li>Ajusta según feedback y prepárate para el siguiente paso</li>
        </ul>
      </>
    ),
  },
];

export default function PlanearPage() {
  return <ChapterPage slug="planear" sections={sections} />;
}
