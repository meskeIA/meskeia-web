'use client';

import Link from 'next/link';
import styles from '../../GuiaCuidadoMascota.module.css';
import ChapterPage from '../../ChapterPage';

export default function HerramientasPage() {
  return (
    <ChapterPage chapterId="herramientas">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎉</span>
          <h2 className={styles.sectionTitleText}>¡Felicidades!</h2>
        </div>
        <p>¡Felicidades! Has completado esta guía completa para el cuidado de mascotas. Ahora tienes todos los conocimientos fundamentales y las herramientas necesarias para brindar a tu compañero peludo una vida plena, saludable y feliz. Es momento de poner en práctica todo lo aprendido.</p>
      </section>

      {/* Herramientas */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🧰</span>
          <h2 className={styles.sectionTitleText}>Nuestras Herramientas</h2>
        </div>
        <div className={styles.toolsGrid}>
          <Link href="/planificador-mascota/" className={styles.toolCard}>
            <div className={styles.toolHeader}>
              <span className={styles.toolIcon}>📋</span>
              <span className={styles.toolName}>Planificador de Mascota</span>
            </div>
            <p className={styles.toolDesc}>Checklist completo con todo lo que necesitas antes de adoptar una mascota</p>
            <p className={styles.toolWhen}>📅 Antes de adoptar tu primera mascota o cuando quieras agregar una nueva a la familia</p>
          </Link>
          <Link href="/calculadora-alimentacion-mascotas/" className={styles.toolCard}>
            <div className={styles.toolHeader}>
              <span className={styles.toolIcon}>🍽️</span>
              <span className={styles.toolName}>Calculadora de Alimentación</span>
            </div>
            <p className={styles.toolDesc}>Calcula la cantidad exacta de comida que necesita tu mascota diariamente</p>
            <p className={styles.toolWhen}>📅 Al cambiar de alimento, cuando tu mascota gana o pierde peso, o cada 6 meses para ajustar porciones</p>
          </Link>
          <Link href="/calculadora-medicamentos-mascotas/" className={styles.toolCard}>
            <div className={styles.toolHeader}>
              <span className={styles.toolIcon}>💊</span>
              <span className={styles.toolName}>Calculadora de Medicamentos</span>
            </div>
            <p className={styles.toolDesc}>Determina la dosis correcta de antiparasitarios según el peso de tu mascota</p>
            <p className={styles.toolWhen}>📅 Antes de administrar cualquier medicamento antiparasitario o cuando el veterinario lo indique</p>
          </Link>
          <Link href="/calculadora-tamano-adulto-perro/" className={styles.toolCard}>
            <div className={styles.toolHeader}>
              <span className={styles.toolIcon}>📏</span>
              <span className={styles.toolName}>Calculadora de Tamaño Adulto</span>
            </div>
            <p className={styles.toolDesc}>Predice el peso y tamaño que alcanzará tu cachorro cuando sea adulto</p>
            <p className={styles.toolWhen}>📅 Con cachorros de 8-16 semanas para planificar espacio, alimentación y accesorios futuros</p>
          </Link>
          <Link href="/calculadora-edad-mascotas/" className={styles.toolCard}>
            <div className={styles.toolHeader}>
              <span className={styles.toolIcon}>🎂</span>
              <span className={styles.toolName}>Calculadora de Edad</span>
            </div>
            <p className={styles.toolDesc}>Convierte la edad de tu mascota a años humanos equivalentes</p>
            <p className={styles.toolWhen}>📅 Para entender la etapa de vida de tu mascota y adaptar sus cuidados según su edad</p>
          </Link>
        </div>
      </section>

      {/* Checklist */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>✅</span>
          <h2 className={styles.sectionTitleText}>Checklist del Buen Dueño</h2>
        </div>
        <div className={styles.checklistSection}>
          <h4>📋 Responsabilidades del dueño responsable</h4>
          <ul>
            <li>Proporciona alimentación balanceada y agua fresca diariamente</li>
            <li>Mantiene al día las vacunas y desparasitaciones</li>
            <li>Programa revisiones veterinarias preventivas regulares</li>
            <li>Dedica tiempo diario al ejercicio y estimulación mental</li>
            <li>Mantiene un ambiente seguro y cómodo para su mascota</li>
            <li>Socializa adecuadamente a su mascota con otros animales y personas</li>
            <li>Practica el entrenamiento positivo y establece rutinas consistentes</li>
            <li>Demuestra amor, paciencia y compromiso incondicional hacia su compañero</li>
          </ul>
        </div>
      </section>

      {/* Calendario */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📅</span>
          <h2 className={styles.sectionTitleText}>Calendario de Cuidados</h2>
        </div>
        <div className={styles.calendarGrid}>
          <div className={styles.calendarCard}>
            <h4>📆 Cada Mes</h4>
            <ul>
              <li>Revisión de peso corporal y condición física</li>
              <li>Inspección de orejas, ojos y dientes</li>
              <li>Control de pulgas y garrapatas</li>
              <li>Mantenimiento de higiene básica</li>
            </ul>
          </div>
          <div className={styles.calendarCard}>
            <h4>📆 Cada 3 Meses</h4>
            <ul>
              <li>Desparasitación interna según protocolo veterinario</li>
              <li>Revisión y actualización del botiquín de primeros auxilios</li>
              <li>Evaluación del comportamiento y necesidades de entrenamiento</li>
              <li>Limpieza profunda de accesorios y área de descanso</li>
            </ul>
          </div>
          <div className={styles.calendarCard}>
            <h4>📆 Cada Año</h4>
            <ul>
              <li>Examen veterinario completo con análisis de sangre</li>
              <li>Actualización del calendario de vacunación</li>
              <li>Evaluación dental profesional</li>
              <li>Revisión del plan de alimentación y ejercicio</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Resumen */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📝</span>
          <h2 className={styles.sectionTitleText}>Resumen de la Guía</h2>
        </div>
        <div className={styles.summaryList}>
          <ol>
            <li>La preparación previa a la adopción es crucial: evalúa tu estilo de vida, presupuesto y espacio disponible antes de elegir la mascota ideal</li>
            <li>Una alimentación balanceada, ejercicio regular y cuidados veterinarios preventivos son los pilares de una vida saludable para tu mascota</li>
            <li>El entrenamiento temprano con refuerzo positivo y la socialización adecuada previenen problemas de comportamiento futuros</li>
            <li>Reconocer señales de alarma y tener un plan de emergencia puede salvar la vida de tu mascota en situaciones críticas</li>
            <li>El amor, la paciencia y el compromiso a largo plazo son tan importantes como los cuidados físicos para el bienestar integral de tu compañero</li>
          </ol>
        </div>
      </section>

      {/* Mensaje Final */}
      <div className={styles.finalMessage}>
        <p>Ser un dueño responsable es un viaje de aprendizaje constante lleno de momentos únicos y gratificantes. Con las herramientas y conocimientos que ahora posees, estás completamente preparado para brindar a tu mascota una vida extraordinaria. Recuerda: cada día es una oportunidad para fortalecer ese vínculo especial que los une. ¡Disfruta cada momento junto a tu fiel compañero!</p>
      </div>
    </ChapterPage>
  );
}
