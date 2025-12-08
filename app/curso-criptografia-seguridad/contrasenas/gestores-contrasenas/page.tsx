'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoCriptografiaSeguridad.module.css';

export default function GestoresContrasenasPage() {
  return (
    <ChapterPage chapterId="gestores-contrasenas">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>En la era digital, tus contraseñas son la llave maestra que protege tu identidad, finanzas y vida privada. Imagina tener un guardián personal que no solo recuerda todas tus claves, sino que las mantiene seguras y únicas: los gestores de contraseñas son ese aliado tecnológico que transformará tu seguridad online.</p>
      </section>

        {/* Sección: ¿Qué es un Gestor de Contraseñas? */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>¿Qué es un Gestor de Contraseñas?</h2>
          </div>
          <p>Un gestor de contraseñas es una herramienta digital que funciona como una caja fuerte electrónica para tus credenciales. Su principal misión es almacenar, generar y gestionar contraseñas complejas y únicas para cada una de tus cuentas online, utilizando un sistema de cifrado de alta seguridad. En lugar de memorizar decenas de contraseñas diferentes, solo necesitarás recordar una única contraseña maestra que desbloquea tu bóveda digital.</p>
          <p>El funcionamiento es similar a un administrador de llaves para tu mundo digital. Así como un conserje guarda las llaves de un edificio en un lugar seguro y organizado, un gestor de contraseñas mantiene tus credenciales protegidas, cifrándolas con algoritmos de última generación que hacen prácticamente imposible su acceso no autorizado.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> María, una profesional que maneja cuentas en redes sociales, servicios bancarios, plataformas de trabajo y aplicaciones diversas, solía usar 'MiCumple1985' en todas sus cuentas. Con un gestor de contraseñas, ahora tiene una contraseña única y compleja para cada servicio, sin necesidad de recordarlas todas.</p>
          </div>
        </section>

        {/* Sección: Ventajas de un Gestor de Contraseñas */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>Ventajas de un Gestor de Contraseñas</h2>
          </div>
          <p>Los gestores de contraseñas ofrecen múltiples beneficios que van más allá de simplificar la gestión de claves. Permiten generar contraseñas altamente complejas y aleatorias, con longitudes superiores a 20 caracteres, incluyendo símbolos, números y combinaciones de mayúsculas y minúsculas.</p>
          <p>Además, proporcionan herramientas de sincronización entre dispositivos, lo que significa que puedes acceder a tus contraseñas desde tu smartphone, computadora o tablet de manera segura. La mayoría incluyen funciones adicionales como alertas de contraseñas comprometidas, verificación de la fortaleza de tus credenciales y opciones de autenticación de doble factor.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Carlos, al usar un gestor de contraseñas, reemplazó su antigua contraseña 'perro2023' por 'X9\$mK2pL#qR7zN3jW' para su cuenta bancaria, reduciendo dramáticamente el riesgo de hackeo.</p>
          </div>
        </section>

        {/* Sección: Comparativa de Gestores Populares */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Comparativa de Gestores Populares</h2>
          </div>
          <p>Existen varias opciones en el mercado, cada una con características únicas. Bitwarden destaca por ser de código abierto y gratuito, ideal para usuarios técnicos. 1Password ofrece una interfaz intuitiva y opciones familiares. LastPass proporciona sincronización multiplataforma.</p>
          <p>La elección dependerá de tus necesidades específicas: presupuesto, número de dispositivos, facilidad de uso y características de seguridad adicionales. Lo importante es elegir un gestor reconocido y mantenerlo actualizado.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Una familia de 4 integrantes podría optar por LastPass para compartir credenciales de servicios comunes, mientras un desarrollador independiente preferiría Bitwarden por su transparencia y personalización.</p>
          </div>
        </section>

        {/* Sección: Buenas Prácticas de Uso */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Buenas Prácticas de Uso</h2>
          </div>
          <p>Usar un gestor de contraseñas requiere seguir ciertas recomendaciones. La contraseña maestra debe ser extremadamente robusta, evitando información personal predecible. Se recomienda usar frases de paso largas y complejas.</p>
          <p>Habilita siempre la autenticación de doble factor, mantén el gestor actualizado y realiza copias de seguridad periódicas. Evita usar gestores en dispositivos públicos o redes wifi abiertas.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Elena usa como contraseña maestra 'CorrerlentamenteenelParqueALasSeisdeLaMañana2023!', una frase personal pero impredecible para otros.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>Los gestores de contraseñas cifran y protegen tus credenciales digitales</li>
            <li>Una contraseña maestra reemplaza múltiples contraseñas</li>
            <li>Generan contraseñas aleatorias y seguras automáticamente</li>
            <li>Funcionan en múltiples dispositivos con sincronización segura</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿Cuántas contraseñas únicas usas actualmente?</li>
            <li>¿Podrías recordar contraseñas completamente aleatorias sin un gestor?</li>
            <li>¿Qué riesgos has identificado en tu actual gestión de contraseñas?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> El primer gestor de contraseñas fue desarrollado en 1991 por un grupo de investigadores en criptografía, mucho antes de la explosión de internet.</p>
      </div>
    </ChapterPage>
  );
}
