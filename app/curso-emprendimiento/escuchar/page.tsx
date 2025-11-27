'use client';

import ChapterPage from '../ChapterPage';
import styles from '../CursoEmprendimiento.module.css';

const sections = [
  {
    title: 'El Propósito Real de un Negocio',
    icon: '🎯',
    content: (
      <>
        <div className={styles.quoteBox}>
          <p className={styles.quoteText}>"El propósito de un negocio es crear y mantener un cliente."</p>
          <p className={styles.quoteAuthor}>— Theodore Levitt</p>
        </div>
        <p>Hacer dinero es necesario, pero el propósito se centra en el cliente. Los clientes no compran productos, compran soluciones a problemas.</p>
      </>
    ),
  },
  {
    title: 'Usuarios vs. Clientes',
    icon: '👥',
    content: (
      <>
        <div className={styles.exampleGrid}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>👤</div>
            <div className={styles.exampleName}>Usuarios</div>
            <div className={styles.exampleDesc}>Personas que realmente usan tu producto.</div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>💰</div>
            <div className={styles.exampleName}>Clientes</div>
            <div className={styles.exampleDesc}>Personas que pagan por tu producto.</div>
          </div>
        </div>

        <div className={styles.highlightBox}>
          <p><strong>Caso Wallapop:</strong> Usuarios son personas que compran y venden. Clientes son empresas que pagan por visibilidad y servicios premium.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Metodología de Descubrimiento del Cliente',
    icon: '🔬',
    content: (
      <>
        <h3>1. Lista de 50+ Clientes Potenciales</h3>
        <p>Usa tu red social: contactos, cofundadores, empleados, redes sociales, eventos.</p>

        <h3>2. Desarrolla tu Pitch de 20 Segundos</h3>
        <p>Problema que resuelves + por qué es importante + tu solución. Pide consejo, no vendas.</p>

        <h3>3. Estructura de la Reunión</h3>
        <ul>
          <li><strong>Inicio:</strong> Explica tu idea brevemente</li>
          <li><strong>Escucha:</strong> "¿Qué problemas cree que son importantes?"</li>
          <li><strong>Profundiza:</strong> "¿Cuánto cuesta este problema?" "¿Cómo lo resuelven ahora?"</li>
          <li><strong>Cierra:</strong> "¿Con quién más debería hablar?" "¿Qué debería haber preguntado?"</li>
        </ul>

        <h3>4. Objetivo: 3+ Datos Nuevos</h3>
        <p>Información logística, problemas reales, propuesta de valor validada.</p>
      </>
    ),
  },
  {
    title: 'El Concepto de Producto Total',
    icon: '📦',
    content: (
      <>
        <p>Tu producto no es solo lo que produces, sino el valor total que ofreces al cliente.</p>

        <div className={styles.exampleGrid}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleName}>Producto Genérico</div>
            <div className={styles.exampleDesc}>Lo básico que necesitas para ser considerado en el mercado.</div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleName}>Producto Esperado</div>
            <div className={styles.exampleDesc}>Producto genérico + expectativas mínimas del cliente.</div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleName}>Producto Aumentado</div>
            <div className={styles.exampleDesc}>Producto esperado + diferenciación intencional.</div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleName}>Producto Potencial</div>
            <div className={styles.exampleDesc}>Todo lo que puedes hacer por el cliente en el futuro.</div>
          </div>
        </div>

        <div className={styles.highlightBox}>
          <p><strong>Ejemplo Spotify:</strong> No es solo música, sino playlists personalizadas, descubrimiento, experiencia sin interrupciones, disponibilidad offline.</p>
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
          <li>Haz una lista de 20 personas que podrían ser tus primeros clientes</li>
          <li>Escribe tu pitch de 20 segundos y prácticalo</li>
          <li>Contacta a 3 personas para pedirles una reunión de "consejo"</li>
        </ul>

        <h3>Esta semana</h3>
        <ul>
          <li>Programa 5 conversaciones de 20 minutos con clientes potenciales</li>
          <li>Prepara 5 preguntas clave sobre el problema que resuelves</li>
          <li>Crea un documento para registrar todas las respuestas</li>
        </ul>

        <h3>Este mes</h3>
        <ul>
          <li>Completa 15-20 entrevistas con clientes potenciales</li>
          <li>Identifica patrones: ¿qué problemas se repiten?</li>
          <li>Define tu "producto total": qué experiencia completa ofrecerás</li>
        </ul>
      </>
    ),
  },
];

export default function EscucharPage() {
  return <ChapterPage slug="escuchar" sections={sections} />;
}
