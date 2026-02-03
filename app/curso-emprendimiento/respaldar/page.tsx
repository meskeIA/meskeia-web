'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../ChapterPage';
import styles from '../CursoEmprendimiento.module.css';

const sections = [
  {
    title: 'El Equipo: Tu Recurso Más Importante',
    icon: '👥',
    content: (
      <>
        <div className={styles.highlightBox}>
          <p><strong>La clave del éxito no es el dinero, es el equipo.</strong> Ideas grandiosas han sido destruidas por equipos malos, mientras ideas mediocres han tenido éxito brutal con equipos excelentes.</p>
        </div>

        <div className={styles.exampleGrid}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>🪞</div>
            <div className={styles.exampleName}>Autoevaluación Honesta</div>
            <div className={styles.exampleDesc}>Mírate al espejo y reconoce que no puedes hacerlo todo.</div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>🤝</div>
            <div className={styles.exampleName}>Complementar Habilidades</div>
            <div className={styles.exampleDesc}>Refuerza fortalezas, apuntala debilidades del equipo.</div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>⚖️</div>
            <div className={styles.exampleName}>Control vs. Ejecución</div>
            <div className={styles.exampleDesc}>Es mejor 50% de algo real que 100% de nada.</div>
          </div>
        </div>
      </>
    ),
  },
  {
    title: 'Habilidades Esenciales en Fase Inicial',
    icon: '🎯',
    content: (
      <>
        <h3>1. Interacción con Clientes</h3>
        <p>Sentirse cómodo hablando con clientes, organizando reuniones, entendiendo necesidades.</p>

        <h3>2. Promoción de la Idea</h3>
        <p>Buscar dinero, saber a quién pedirlo, cómo pedirlo. Si no te gusta pedir, tendrás obstáculos rápidamente.</p>

        <h3>3. Experiencia Emprendedora</h3>
        <p>Conoce peligros, entiende cultura emprendedora, tiene contactos. Primer criterio de VCs: ¿Alguien del equipo ha emprendido antes?</p>
      </>
    ),
  },
  {
    title: 'Estrategia de Financiación por Etapas',
    icon: '💰',
    content: (
      <>
        <div className={styles.exampleGrid}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>1️⃣</div>
            <div className={styles.exampleName}>Autofinanciación</div>
            <div className={styles.exampleDesc}>Ahorros, tarjetas de crédito. Capital más barato en etapas iniciales.</div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>2️⃣</div>
            <div className={styles.exampleName}>Familia y Amigos</div>
            <div className={styles.exampleDesc}>Validación externa. Si no invierten, revisa tu modelo.</div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>3️⃣</div>
            <div className={styles.exampleName}>Crowdfunding</div>
            <div className={styles.exampleDesc}>Kickstarter, Indiegogo. No renuncias a control.</div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>4️⃣</div>
            <div className={styles.exampleName}>Clientes</div>
            <div className={styles.exampleDesc}>Pagos adelantados = financiación + validación.</div>
          </div>
        </div>

        <h3>Financiación Profesional</h3>
        <ul>
          <li><strong>Bancos:</strong> Préstamos + intereses (negocio familiar de largo plazo)</li>
          <li><strong>Inversores ángeles:</strong> Capital + experiencia + red de contactos</li>
          <li><strong>VCs:</strong> Grandes cantidades + expertise + estrategia de salida obligatoria</li>
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
          <li>Haz una autoevaluación honesta: ¿qué necesitas que no tienes?</li>
          <li>Lista 10 personas que podrían ayudarte (amigos, familia, excompañeros)</li>
          <li>Calcula cuánto dinero necesitas para los próximos 6 meses</li>
        </ul>

        <h3>Esta semana</h3>
        <ul>
          <li>Contacta a 5 personas de tu lista para explicar tu idea</li>
          <li>Pregunta qué les parece y si conocen a alguien que pueda ayudar</li>
          <li>Investiga 3 fuentes de financiación para tu etapa</li>
        </ul>

        <h3>Este mes</h3>
        <ul>
          <li>Forma tu "grupo de apoyo": 2-3 personas que creen en ti</li>
          <li>Define cuánto dinero necesitas y cómo lo conseguirás</li>
          <li>Si es posible, consigue tus primeros 1.000 € (de clientes, familia, ahorros)</li>
        </ul>
      </>
    ),
  },
];

export default function RespaldarPage() {
  return <ChapterPage slug="respaldar" sections={sections} />;
}
