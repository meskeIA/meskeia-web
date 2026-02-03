'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoCriptografiaSeguridad.module.css';

export default function Autenticacion2faPage() {
  return (
    <ChapterPage chapterId="autenticacion-2fa">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>En un mundo digital cada vez más complejo, proteger nuestras cuentas online se ha convertido en una necesidad crítica. La autenticación de dos factores (2FA) es como tener un guardaespaldas digital personal que bloquea a los ciberdelincuentes, añadiendo una capa extra de seguridad más allá de la simple contraseña.</p>
      </section>

        {/* Sección: Fundamentos de la Autenticación de Dos Factores */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>Fundamentos de la Autenticación de Dos Factores</h2>
          </div>
          <p>La autenticación de dos factores (2FA) es un método de seguridad que requiere dos formas diferentes de verificar tu identidad antes de permitir el acceso a una cuenta. Es como tener dos cerraduras en una puerta: aunque alguien tenga la llave de una, necesitará abrir también la segunda para entrar. Los tres factores principales de autenticación son:</p>
          <p>1. Algo que sabes (conocimiento): Tu contraseña tradicional o un PIN.\n2. Algo que tienes (posesión): Un dispositivo móvil, token o tarjeta física.\n3. Algo que eres (inherencia): Características biométricas como huella dactilar o reconocimiento facial.</p>
          <p>Este sistema reduce drásticamente las posibilidades de que un atacante acceda a tu cuenta, incluso si ha conseguido tu contraseña.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Imagina que tu cuenta de banco fuera como una caja fuerte. La contraseña es la primera llave, pero necesitas una segunda clave (como un código temporal en tu móvil) para abrirla completamente.</p>
          </div>
        </section>

        {/* Sección: Métodos de Implementación de 2FA */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>Métodos de Implementación de 2FA</h2>
          </div>
          <p>Existen varios métodos para implementar la autenticación de dos factores:</p>
          <p>1. SMS: Códigos enviados por mensaje de texto. Es el método más básico, pero también el menos seguro debido a la posibilidad de intercepción.</p>
          <p>2. Aplicaciones Autenticadoras: Apps como Google Authenticator o Authy que generan códigos temporales. Son más seguras que los SMS porque funcionan sin conexión y son más difíciles de interceptar.</p>
          <p>3. Llaves Físicas: Dispositivos como YubiKey que se conectan físicamente al dispositivo. Representan el método más robusto de autenticación.</p>
          <p>Cada método tiene sus pros y contras, pero todos son significativamente más seguros que depender solo de una contraseña.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Un usuario de home banking podría usar su app del banco (primera clave) y un código generado por Google Authenticator (segunda clave) para acceder a su cuenta.</p>
          </div>
        </section>

        {/* Sección: TOTP: La Magia de los Códigos Temporales */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>TOTP: La Magia de los Códigos Temporales</h2>
          </div>
          <p>TOTP (Time-Based One-Time Password) es la tecnología detrás de los códigos de 6 dígitos que cambian cada 30 segundos. Funciona mediante un algoritmo que genera códigos basados en:</p>
          <p>- Una clave secreta inicial\n- La hora actual\n- Un algoritmo de hash criptográfico</p>
          <p>Es como un código que se autodestruye después de un corto período, haciendo extremadamente difícil su reutilización por un atacante.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Cuando generas un código en Google Authenticator, este cambia cada 30 segundos, convirtiendo cada código en único e irrepetible.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>2FA añade una capa extra de seguridad</li>
            <li>Existen múltiples métodos de autenticación</li>
            <li>Los códigos TOTP son dinámicos y temporales</li>
            <li>Ningún método de 2FA es 100% infalible</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿Qué método de 2FA te parece más conveniente para tus cuentas personales?</li>
            <li>¿Cuáles son tus cuentas más críticas que deberías proteger primero?</li>
            <li>¿Cómo puedes educar a tu familia sobre la importancia de 2FA?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> En 2018, Google reportó que el 2FA por medio de llaves físicas bloqueó el 100% de los ataques de phishing automatizados en sus propios sistemas internos.</p>
      </div>
    </ChapterPage>
  );
}
