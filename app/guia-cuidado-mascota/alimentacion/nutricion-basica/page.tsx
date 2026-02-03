'use client';

import { LegalNotice } from '@/components';
import Link from 'next/link';
import styles from '../../GuiaCuidadoMascota.module.css';
import ChapterPage from '../../ChapterPage';

export default function NutricionBasicaPage() {
  return (
    <ChapterPage chapterId="nutricion-basica">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>👋</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Alimentar a tu peludo no es solo llenar su plato con comida. Es como ser su chef personal: cada bocado cuenta para que tenga una vida súper feliz y llena de energía. No te preocupes, no necesitas ser un experto. Te voy a enseñar todo lo que necesitas saber para convertirte en el mejor 'chef' de tu mascota.</p>
      </section>

      {/* Secciones */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📌</span>
          <h2 className={styles.sectionTitleText}>¿Cuánto debe comer tu mascota?</h2>
        </div>
        <p>Imagínate que tu mascota fuera tu mejor amigo: ¿le darías la misma cantidad de comida a un amigo que pesa 50 kg que a uno que pesa 80 kg? Pues con las mascotas es igual. Un Chihuahua de 3 kg necesita mucho menos que un Golden Retriever de 25 kg. Lo mejor es dividir su comida en 2-3 raciones al día (como nosotros con desayuno, almuerzo y cena). Aquí tienes un truco súper fácil: toca suavemente los costados de tu mascota. Si sientes las costillas sin presionar mucho, perfecto. Si no las sientes para nada, probablemente esté comiendo demasiado. Para perros pequeños, piensa en el tamaño de tu puño cerrado; para perros grandes, dos puños. Los gatos son más delicados: porciones pequeñas pero más seguido durante el día.</p>
        <div className={styles.tipBox}>
          <p>💡 Pesa a tu mascota cada mes y toma una foto de perfil - así verás mejor si está en su peso ideal</p>
        </div>
      </section>

      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📋</span>
          <h2 className={styles.sectionTitleText}>Alimentos prohibidos: ¡Alerta roja!</h2>
        </div>
        <p>Esto es súper importante: hay alimentos que para nosotros son ricos, pero para ellos son como veneno. El chocolate es el más conocido - ni una gotita, especialmente el chocolate negro. Las uvas (incluso una sola) pueden dañar sus riñones. La cebolla y el ajo que usamos para cocinar destruyen sus defensas. Y ojo con el aguacate, el café, las bebidas alcohólicas y los chicles sin azúcar (tienen xilitol que es tóxico). Mi regla de oro: si dudas aunque sea un poquito, mejor no se lo des. Es mejor un perro o gato un poco enojado que uno enfermo, ¿verdad?</p>
        <div className={styles.tipBox}>
          <p>💡 Pon una nota en el refrigerador con los alimentos prohibidos - así toda la familia lo recordará</p>
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
            <p>Al cambiar de comida, mezcla la nueva con la anterior durante una semana - así no le dará dolor de panza</p>
          </div>
          <div className={styles.quickTip}>
            <p>Su plato de agua debe estar siempre lleno y limpio, como si fuera tu vaso favorito</p>
          </div>
          <div className={styles.quickTip}>
            <p>Antes de cambiar completamente su dieta, habla con tu veterinario - es como consultar a un nutricionista</p>
          </div>
          <div className={styles.quickTip}>
            <p>Lee las etiquetas: el primer ingrediente debe ser carne real, no harinas raras que no entiendes</p>
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
            <p>Los perros son como nosotros en las barbacoas: aman la carne. Busca alimentos donde la carne sea el ingrediente principal</p>
          </div>
          <div className={`${styles.petTip} ${styles.cat}`}>
            <div className={styles.petTipHeader}>
              <span>🐈</span> Para Gatos
            </div>
            <p>Los gatos son súper carnívoros - necesitan mucha más proteína animal que los perros. Son como pequeños leones caseros</p>
          </div>
        </div>
      </section>

      {/* Herramienta Relacionada */}
      <Link href="/calculadora-alimentacion-mascotas/" className={styles.relatedTool}>
        <div className={styles.relatedToolHeader}>
          <span className={styles.relatedToolIcon}>🧰</span>
          <span className={styles.relatedToolName}>Calculadora de Alimentación</span>
        </div>
        <p>¿No sabes cuánto darle? Nuestra calculadora te dice exactamente la cantidad perfecta para tu mascota en 2 minutos</p>
      </Link>
    </ChapterPage>
  );
}
