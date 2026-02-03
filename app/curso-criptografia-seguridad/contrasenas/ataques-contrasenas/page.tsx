'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoCriptografiaSeguridad.module.css';

export default function AtaquesContrasenasPage() {
  return (
    <ChapterPage chapterId="ataques-contrasenas">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Imagina que tu contraseña fuera como la llave de tu casa, pero alguien pudiera copiarla sin que te dieras cuenta. En el mundo digital, los atacantes utilizan técnicas sofisticadas para 'robar' contraseñas, y en este capítulo descubrirás exactamente cómo lo hacen para que puedas protegerte mejor.</p>
      </section>

        {/* Sección: Ataques de Fuerza Bruta: El Método de Prueba y Error */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>Ataques de Fuerza Bruta: El Método de Prueba y Error</h2>
          </div>
          <p>Un ataque de fuerza bruta es como intentar abrir una caja fuerte probando todas las combinaciones posibles. Un programa informático prueba sistemáticamente miles de contraseñas por segundo, utilizando combinaciones de letras, números y símbolos. Cuanto más corta y simple es una contraseña, más rápido será el proceso de descubrirla. Un ordenador moderno puede probar millones de combinaciones en cuestión de minutos, lo que hace que las contraseñas cortas sean extremadamente vulnerables.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Una contraseña como 'hola123' podría ser descifrada en segundos, mientras que 'C@sa_Azul_2024_Perr0!' tomaría muchísimo más tiempo</p>
          </div>
        </section>

        {/* Sección: Ataques de Diccionario: Usando Palabras Predecibles */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>Ataques de Diccionario: Usando Palabras Predecibles</h2>
          </div>
          <p>Los ataques de diccionario funcionan como un ladrón que prueba llaves de un manojo, pero en lugar de llaves, usa palabras comunes en diferentes idiomas. Los atacantes utilizan listas enormes de palabras, incluyendo contraseñas filtradas de otras plataformas, para intentar adivinar tu contraseña. Incluyen variaciones como sustituir letras por números (como 'p@ssw0rd') o añadir números al final.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Contraseñas como 'futbol2022' o 'barcelona' son extremadamente predecibles</p>
          </div>
        </section>

        {/* Sección: Rainbow Tables y Salt: Defendiendo los Hashes */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Rainbow Tables y Salt: Defendiendo los Hashes</h2>
          </div>
          <p>Las rainbow tables son como enormes libros de códigos que relacionan contraseñas con sus versiones hasheadas. El 'salt' es un método de seguridad que añade información única a cada contraseña antes de hashearla, haciendo que las rainbow tables sean inútiles. Es como añadir un ingrediente secreto a una receta que hace que sea imposible de replicar exactamente.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Sin salt, dos usuarios con la contraseña 'perro123' tendrían el mismo hash. Con salt, cada hash sería completamente diferente</p>
          </div>
        </section>

        {/* Sección: Credential Stuffing: El Peligro de Reutilizar Contraseñas */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Credential Stuffing: El Peligro de Reutilizar Contraseñas</h2>
          </div>
          <p>Los atacantes aprovechan las filtraciones de datos para probar contraseñas en múltiples servicios. Si usas la misma contraseña en Facebook, Gmail y un servicio menos seguro, un solo hackeo podría comprometer todas tus cuentas. Es como usar la misma llave para tu casa, coche y oficina: si alguien copia una, está comprometido todo.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> En 2022, más de 15 millones de cuentas fueron comprometidas por ataques de credential stuffing</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>Contraseñas cortas son extremadamente vulnerables</li>
            <li>Nunca reutilices contraseñas entre servicios</li>
            <li>Usa contraseñas largas y complejas</li>
            <li>El salt es crucial para proteger hashes</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿Cuántas de tus contraseñas actuales podrían ser vulnerables?</li>
            <li>¿Usas la misma contraseña en diferentes servicios?</li>
            <li>¿Cómo podrías mejorar tu estrategia de contraseñas?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> El primer gusano informático de la historia, Creeper, fue creado en 1971 y se propagaba entre computadoras sin causar daño real</p>
      </div>
    </ChapterPage>
  );
}
