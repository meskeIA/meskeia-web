'use client';

import Link from 'next/link';
import styles from '../../CursoTeoriaPolitica.module.css';
import { MeskeiaLogo, Footer } from '@/components';

export default function DocumentoCompletoPage() {
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.chapterHero}>
        <span className={styles.chapterHeroIcon}>📚</span>
        <h1 className={styles.chapterHeroTitle}>Documento Completo</h1>
        <p className={styles.chapterHeroSubtitle}>
          Descarga el curso completo de Teoría Política con los 31 capítulos originales
        </p>
      </header>

      {/* PDF Section */}
      <section className={styles.pdfSection}>
        <span className={styles.pdfIcon}>📄</span>
        <h2 className={styles.pdfTitle}>Introducción a la Teoría Política</h2>
        <p className={styles.pdfDesc}>
          Este documento contiene el curso completo de Teoría Política: conceptos y
          grandes pensadores. Incluye análisis detallados de todos los pensadores desde
          la Grecia clásica hasta el pensamiento contemporáneo, con citas originales,
          contexto histórico y evaluaciones críticas.
        </p>

        <a
          href="/curso-teoria-politica/recursos/introduccion-teoria-politica.pdf"
          download
          className={styles.pdfButton}
        >
          📥 Descargar PDF completo
        </a>

        <p className={styles.pdfMeta}>
          Formato: PDF · 31 capítulos · ~300 páginas
        </p>
      </section>

      {/* Contenido del documento */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Contenido del documento</h2>
        </div>

        <p>
          El documento PDF incluye un análisis exhaustivo de los siguientes pensadores
          y periodos, agrupados en secciones temáticas:
        </p>

        <h3>Antigüedad Clásica</h3>
        <ul>
          <li>El Mundo Griego: la polis y el nacimiento del pensamiento político</li>
          <li>Platón: La República, el filósofo-rey y la justicia</li>
          <li>Aristóteles: La Política, el ciudadano y los regímenes</li>
          <li>Roma: Cicerón y el derecho natural</li>
        </ul>

        <h3>Edad Media</h3>
        <ul>
          <li>Agustín de Hipona: La Ciudad de Dios</li>
          <li>El pensamiento político medieval</li>
          <li>La recepción teológica de Aristóteles: Tomás de Aquino</li>
        </ul>

        <h3>Modernidad</h3>
        <ul>
          <li>Nicolás Maquiavelo: El Príncipe y los Discursos</li>
          <li>Thomas Hobbes: El Leviatán y la justificación del Estado</li>
          <li>John Locke: Liberalismo, propiedad y tolerancia</li>
          <li>Montesquieu: La división de poderes</li>
        </ul>

        <h3>Ilustración</h3>
        <ul>
          <li>La Ilustración escocesa</li>
          <li>Jean-Jacques Rousseau: El contrato social y la voluntad general</li>
          <li>Edmund Burke: El pensamiento conservador</li>
          <li>La retórica de la reacción</li>
        </ul>

        <h3>Siglo XIX</h3>
        <ul>
          <li>Alexis de Tocqueville: Democracia y libertad</li>
          <li>John Stuart Mill: Utilitarismo y libertad</li>
          <li>Karl Marx: Materialismo histórico y lucha de clases</li>
        </ul>

        <h3>Pensamiento Contemporáneo</h3>
        <ul>
          <li>John Rawls: Teoría de la justicia</li>
          <li>Jürgen Habermas: Democracia deliberativa</li>
        </ul>
      </section>

      {/* Nota de uso */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>ℹ️</span>
          <h2 className={styles.sectionTitleText}>Nota de uso</h2>
        </div>

        <p>
          Este material está pensado para profundizar en los temas introducidos en el
          curso interactivo. Te recomendamos:
        </p>

        <ul>
          <li>Completar primero el curso interactivo para tener una visión general</li>
          <li>Usar el PDF como material de consulta y ampliación</li>
          <li>Revisar las citas originales de cada pensador</li>
          <li>Explorar las conexiones entre diferentes autores y periodos</li>
        </ul>

        <div className={styles.highlightBox}>
          <p>
            <strong>Sugerencia:</strong> El documento incluye referencias bibliográficas
            y enlaces a recursos externos que te permitirán seguir profundizando en
            los autores que más te interesen.
          </p>
        </div>
      </section>

      {/* Navigation */}
      <div className={styles.bottomNavigation}>
        <Link href="/curso-teoria-politica" className={styles.bottomNavLink}>
          <div className={styles.bottomNavLabel}>← Volver</div>
          <div className={styles.bottomNavTitle}>🏛️ Índice del curso</div>
        </Link>
        <Link
          href="/curso-teoria-politica/recursos/glosario"
          className={`${styles.bottomNavLink} ${styles.next}`}
        >
          <div className={styles.bottomNavLabel}>Siguiente →</div>
          <div className={styles.bottomNavTitle}>📖 Glosario</div>
        </Link>
      </div>

      <Footer appName="curso-teoria-politica" />
    </div>
  );
}
