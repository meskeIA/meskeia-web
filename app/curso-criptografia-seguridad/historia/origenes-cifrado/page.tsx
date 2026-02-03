'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoCriptografiaSeguridad.module.css';

export default function OrigenesCifradoPage() {
  return (
    <ChapterPage chapterId="origenes-cifrado">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Imagina por un momento que pudieras enviar un mensaje secreto que solo tu destinatario pudiera descifrar. La criptografía hace exactamente eso: convertir información para que solo quien tenga la clave pueda entenderla. Desde tiempos antiguos, los humanos han buscado formas de proteger sus comunicaciones más importantes.</p>
      </section>

        {/* Sección: ¿Qué es la Criptografía? */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>¿Qué es la Criptografía?</h2>
          </div>
          <p>La criptografía es el arte y ciencia de proteger información mediante técnicas que la transforman de un formato legible a otro ilegible para cualquier persona que no tenga la clave secreta. Su origen se remonta miles de años, cuando los ejércitos y gobiernos necesitaban comunicarse sin que el enemigo pudiera entender sus mensajes. Es como tener un código secreto que solo tú y tu mejor amigo conocen.</p>
          <p>Los objetivos principales de la criptografía son preservar la confidencialidad, garantizar la integridad de los datos, autenticar la identidad del emisor y prevenir la negación de un mensaje enviado. En el mundo digital actual, se ha convertido en una herramienta fundamental para proteger información sensible en comunicaciones electrónicas, transacciones bancarias y sistemas de seguridad.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Imagina que escribes una carta a tu mejor amigo sobre un secreto, pero temes que alguien más pueda leerla. Con criptografía, podrías transformar tu mensaje de modo que solo tu amigo pueda descifrarlo usando una clave especial.</p>
          </div>
        </section>

        {/* Sección: La Escítala Espartana: El Primer Método de Cifrado */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>La Escítala Espartana: El Primer Método de Cifrado</h2>
          </div>
          <p>Los espartanos desarrollaron un ingenioso método de cifrado utilizando una vara de madera llamada escítala. Consistía en enrollar una tira de cuero o pergamino alrededor de un bastón cilíndrico de un diámetro específico. Al escribir el mensaje longitudinalmente, cuando se desenrollaba la tira, el texto parecía ser un conjunto de letras sin sentido.</p>
          <p>Solo quien tuviera un bastón exactamente igual podría volver a enrollar la tira y leer el mensaje original. Este método demuestra que la criptografía surge de la necesidad de comunicarse de manera segura en contextos militares y diplomáticos.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Un general espartano podía enviar instrucciones secretas a otro comandante sin riesgo de que el mensaje fuera comprendido si caía en manos enemigas.</p>
          </div>
        </section>

        {/* Sección: El Cifrado César: Secretos Imperiales */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>El Cifrado César: Secretos Imperiales</h2>
          </div>
          <p>Julio César fue pionero en desarrollar un método de cifrado que hoy lleva su nombre. Consistía en desplazar cada letra del alfabeto un número determinado de posiciones. Por ejemplo, con un desplazamiento de 3 posiciones, 'A' se convertiría en 'D', 'B' en 'E', y así sucesivamente.</p>
          <p>Este método permitía que César enviara órdenes militares codificadas que solo sus generales más cercanos podían descifrar. Aunque hoy parece simple, en su época representó un avance significativo en técnicas de comunicación segura.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Un mensaje como 'ATACAR' se transformaría en 'DWDFDU' utilizando un desplazamiento de 3 posiciones.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>La criptografía busca proteger información</li>
            <li>Surgió de necesidades militares y diplomáticas</li>
            <li>Cada método histórico representa una solución creativa</li>
            <li>La seguridad de la información ha sido importante desde siempre</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿Por qué crees que proteger la información es importante?</li>
            <li>¿Qué otros métodos de comunicación secreta conoces?</li>
            <li>¿Cómo imaginas la criptografía en el futuro?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> Durante la Segunda Guerra Mundial, los estadounidenses utilizaron a soldados nativos Navajo como &apos;code talkers&apos; que transmitían mensajes en su lengua nativa, creando un código imposible de descifrar para los enemigos.</p>
      </div>

      {/* Herramienta Vinculada */}
      <div className={styles.toolLinkBox}>
        <h4>🛠️ Practica lo aprendido</h4>
        <p>Experimenta con el cifrado César y otros métodos clásicos en nuestra herramienta interactiva.</p>
        <a href="/cifrado-clasico/" className={styles.toolLinkButton}>
          Abrir Cifrado Clásico →
        </a>
      </div>
    </ChapterPage>
  );
}
