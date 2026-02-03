'use client';

import { LegalNotice } from '@/components';
import Link from 'next/link';
import styles from '../../GuiaCuidadoMascota.module.css';
import ChapterPage from '../../ChapterPage';

export default function EdadYCuidadosPage() {
  return (
    <ChapterPage chapterId="edad-y-cuidados">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>👋</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>¿Te has preguntado cuántos años 'humanos' tiene tu peludo amigo? Tu perrito de 5 años podría ser como un treintañero, o tu gatito de 2 años como un adolescente. Cada etapa de su vida es especial y tiene sus propias necesidades. ¡Vamos a descubrir cómo cuidar mejor a tu compañero según su edad!</p>
      </section>

      {/* Secciones */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📌</span>
          <h2 className={styles.sectionTitleText}>Las Etapas de tu Mascota: Como Nosotros, Pero en Versión Acelerada</h2>
        </div>
        <p>Imagínate que la vida de tu mascota es como una película en cámara rápida. Los bebés (cachorros y gatitos) son pura energía: corren, juegan, se meten en problemas y aprenden todo súper rápido. Como un niño de 2 años, necesitan sus vacunas al día, comida especial para crecer y conocer el mundo poco a poco. Los adultos jóvenes (1-7 años en perros chicos, 1-5 en perros grandes, 1-7 en gatos) están en su mejor momento: son como esa persona de 25-40 años que tiene todo bajo control. Finalmente, nuestros seniors (desde los 7-8 años) son como nuestros abuelos: más tranquilos, necesitan más cuidados médicos y una dieta más suave. Aquí viene lo curioso: un Chihuahua de 10 años apenas está entrando a la tercera edad, pero un Gran Danés de la misma edad ya es un abuelito.</p>
        <div className={styles.tipBox}>
          <p>💡 Fíjate si tu mascota duerme más, tiene el pelaje más opaco o le cuesta subir escalones. Son señales de que está cambiando de etapa</p>
        </div>
      </section>

      {/* Tips Rápidos */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>✅</span>
          <h2 className={styles.sectionTitleText}>Tips Rápidos</h2>
        </div>
        <div className={styles.quickTipsGrid}>
          <div className={styles.quickTip}>
            <p>La regla de '7 años humanos = 1 año de perro' no es real, cada raza envejece diferente</p>
          </div>
          <div className={styles.quickTip}>
            <p>Cambia su comida según su edad: cachorro, adulto o senior (viene marcado en las bolsas)</p>
          </div>
          <div className={styles.quickTip}>
            <p>Lleva a tu mascota al veterinario cada 6 meses después de los 7 años</p>
          </div>
          <div className={styles.quickTip}>
            <p>Un Golden Retriever envejece más rápido que un Poodle pequeño, aunque tengan la misma edad</p>
          </div>
        </div>
      </section>

      {/* Consejos para Perros y Gatos */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🐾</span>
          <h2 className={styles.sectionTitleText}>Consejos Específicos</h2>
        </div>
        <div className={styles.petTips}>
          <div className={`${styles.petTip} ${styles.dog}`}>
            <div className={styles.petTipHeader}>
              <span>🐕</span> Para Perros
            </div>
            <p>Si tienes un perro grande (como un Labrador o Pastor Alemán), considera que a los 6 años ya necesita cuidados de senior. Los pequeñitos pueden esperar hasta los 8-9 años</p>
          </div>
          <div className={`${styles.petTip} ${styles.cat}`}>
            <div className={styles.petTipHeader}>
              <span>🐈</span> Para Gatos
            </div>
            <p>Los gatos son actores profesionales escondiendo que se sienten mal. Aunque tu gato parezca igual de juguetón, agenda chequeos regulares después de los 7 años</p>
          </div>
        </div>
      </section>

      {/* Herramienta Relacionada */}
      <Link href="/calculadora-edad-mascotas/" className={styles.relatedTool}>
        <div className={styles.relatedToolHeader}>
          <span className={styles.relatedToolIcon}>🧰</span>
          <span className={styles.relatedToolName}>Calculadora de Edad</span>
        </div>
        <p>¿Cuántos años humanos tiene realmente tu peludo? Averígualo en segundos con nuestra calculadora súper fácil</p>
      </Link>
    </ChapterPage>
  );
}
