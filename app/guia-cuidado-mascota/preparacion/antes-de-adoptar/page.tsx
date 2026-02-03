'use client';

import { LegalNotice } from '@/components';
import Link from 'next/link';
import styles from '../../GuiaCuidadoMascota.module.css';
import ChapterPage from '../../ChapterPage';

export default function AntesDeAdoptarPage() {
  return (
    <ChapterPage chapterId="antes-de-adoptar">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>👋</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>¡Bienvenido al maravilloso mundo de tener mascota! Si estás pensando en adoptar un perrito cariñoso o un gatito mimoso, estás a punto de vivir algo increíble. Te ayudamos a prepararte para que tanto tú como tu nuevo amigo sean felices desde el primer día.</p>
      </section>

      {/* Secciones */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📌</span>
          <h2 className={styles.sectionTitleText}>¿Perro o Gato? Encuentra tu match perfecto</h2>
        </div>
        <p>Es como elegir entre salir de fiesta o una noche de Netflix. Los perros son como ese amigo extrovertido: necesitan salir, jugar y estar siempre contigo. Perfecto si te gusta caminar, tienes patio o eres de los que van al parque los domingos. Los gatos son más tipo 'amigo introvertido genial': cariñosos pero independientes, ideales si vives en un piso pequeño o trabajas todo el día. Un perro necesita salir al menos 3 veces al día (¡llueva o truene!), mientras que tu gato se las arregla solito con su arenero. ¿Viajas mucho por trabajo? Definitivamente, gato. ¿Te encanta hacer senderismo? Tu perro será tu mejor compañero de aventuras.</p>
        <div className={styles.tipBox}>
          <p>💡 Elige pensando en tu día a día real, no en el ideal de Instagram</p>
        </div>
      </section>

      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📋</span>
          <h2 className={styles.sectionTitleText}>Convierte tu casa en su hogar perfecto</h2>
        </div>
        <p>Imagínate llegar a una casa nueva: necesitas una cama cómoda, saber dónde comer y sentirte seguro. Tu mascota piensa igual. Lo básico: una camita (o transportín para perros pequeños), dos bowls (uno para agua, otro para comida), y juguetes para que no se aburra. Si adoptas un perro, necesitarás correa, collar con su nombre, y empapadores para los primeros meses. Para gatos: arenero, arena que no haga polvo, y un rascador (tu sofá te lo agradecerá). Un truco: coloca todo en un rincón tranquilo donde pueda relajarse cuando se sienta abrumado.</p>
        <div className={styles.tipBox}>
          <p>💡 Su rincón debe ser su 'zona de confort', respétala siempre</p>
        </div>
      </section>

      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>💡</span>
          <h2 className={styles.sectionTitleText}>Lo que realmente cuesta tener mascota</h2>
        </div>
        <p>Hablemos claro de dinero. Cuenta unos 40-70€ al mes en comida (más si adoptas un San Bernardo, menos si es un Chihuahua). Las vacunas y revisión anual rondan los 150€. Pero lo importante: ten siempre 400-600€ guardados para emergencias (como cuando tu perro se come un calcetín o tu gato decide que las plantas son deliciosas). Los perros suelen costar más: comen más, necesitan más accesorios y a veces clases de educación. Los gatos son más económicos día a día, pero no escatimes en su comida de calidad ni en sus revisiones anuales.</p>
        <div className={styles.tipBox}>
          <p>💡 Piénsalo como un 'capricho mensual' que vale oro en compañía</p>
        </div>
      </section>

      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Tu veterinario: más importante que tu médico</h2>
        </div>
        <p>Busca uno como buscarías pediatra para tu hijo. Pregunta a otros dueños de mascotas del barrio, mira reseñas en Google, pero sobre todo: visítalo antes de decidir. Fíjate si trata bien a los animales, si te explica las cosas con paciencia y si la clínica está limpia. Pregunta si atienden urgencias (tu gato no va a decidir ponerse malo solo en horario de oficina). Valora también que esté cerca de casa: cuando tengas una emergencia a las 2 AM, te importará mucho más que los 5€ que ahorres yendo al más barato.</p>
        <div className={styles.tipBox}>
          <p>💡 Una buena relación con tu veterinario vale más que el precio más barato</p>
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
            <p>Esteriliza: evita embarazos no deseados y problemas de salud futuros</p>
          </div>
          <div className={styles.quickTip}>
            <p>Socialízalo desde pequeño: que conozca gente, ruidos y otros animales</p>
          </div>
          <div className={styles.quickTip}>
            <p>Un seguro veterinario te puede salvar de sustos económicos enormes</p>
          </div>
          <div className={styles.quickTip}>
            <p>Rutinas fijas: misma hora de comida y paseos, les da seguridad</p>
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
            <p>Paciencia y premios: enséñale paso a paso con cariño, nunca con gritos</p>
          </div>
          <div className={`${styles.petTip} ${styles.cat}`}>
            <div className={styles.petTipHeader}>
              <span>🐈</span> Para Gatos
            </div>
            <p>Déjale explorar a su ritmo, los gatos necesitan tiempo para sentirse seguros</p>
          </div>
        </div>
      </section>

      {/* Herramienta Relacionada */}
      <Link href="/planificador-mascota/" className={styles.relatedTool}>
        <div className={styles.relatedToolHeader}>
          <span className={styles.relatedToolIcon}>🧰</span>
          <span className={styles.relatedToolName}>Planificador de Mascota</span>
        </div>
        <p>Te ayudamos a organizar todo lo que necesitas antes de que llegue tu nuevo amigo</p>
      </Link>
    </ChapterPage>
  );
}
