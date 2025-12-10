'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../HerenciasPasoPaso.module.css';

export default function ExisteTestamentoPage() {
  return (
    <ChapterPage chapterId="existe-testamento">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Una de las primeras dudas que surge cuando fallece un familiar es si dejó testamento o no. Esta información es fundamental porque determinará cómo se reparte la herencia y qué pasos debemos seguir. La buena noticia es que averiguarlo es más sencillo de lo que parece.</p>
      </section>

      {/* Sección: Cómo averiguar si hay testamento */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📌</span>
          <h2 className={styles.sectionTitleText}>Cómo averiguar si hay testamento</h2>
        </div>
        <p>Para saber si el fallecido hizo testamento, debes solicitar el Certificado de Últimas Voluntades en el Registro General de Actos de Última Voluntad. Este registro centraliza información sobre todos los testamentos otorgados en España desde 1944. Puedes pedirlo en cualquier Gerencia Territorial del Ministerio de Justicia, por correo postal o de forma online si tienes certificado digital. Necesitarás el certificado de defunción, tu DNI y pagar una tasa de unos 4 euros. Es importante esperar al menos 15 días desde el fallecimiento, ya que los notarios tienen ese plazo para comunicar al registro si se ha otorgado testamento. El certificado te dirá si existe testamento y ante qué notario se hizo, pero no el contenido del mismo. Si aparece testamento, deberás acudir a esa notaría con el certificado de defunción para obtener una copia autorizada y conocer las disposiciones del fallecido.</p>
        <div className={styles.tipBox}>
          <p><strong>💡 Consejo:</strong> Guarda siempre el certificado de últimas voluntades original, incluso si no hay testamento, ya que lo necesitarás para tramitar la herencia intestada</p>
        </div>
      </section>

      {/* Sección: Tipos de testamento: entendiendo las diferencias */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔍</span>
          <h2 className={styles.sectionTitleText}>Tipos de testamento: entendiendo las diferencias</h2>
        </div>
        <p>En España existen tres tipos principales de testamento. El testamento abierto es el más común y sencillo: el testador declara su voluntad ante notario, quien redacta el documento y lo firma junto con el testador. Es como una conversación formal donde expresas tus deseos y el notario se encarga de darles forma legal. El testamento cerrado es menos frecuente: el testador entrega un sobre cerrado al notario declarando que contiene su testamento, pero el notario no conoce el contenido hasta el momento de la apertura tras el fallecimiento. Por último, el testamento ológrafo debe escribirse completamente a mano por el testador, fecharse y firmarse. Tras el fallecimiento, los herederos deben protocolizarlo ante notario en un plazo de cinco años. Este tipo genera más complicaciones porque hay que demostrar que la letra y firma son auténticas del fallecido, lo que puede requerir peritajes caligráficos y generar conflictos familiares.</p>
        <div className={styles.tipBox}>
          <p><strong>💡 Consejo:</strong> Si encuentras un testamento manuscrito en casa, no lo manipules demasiado y acude cuanto antes a un notario para protocolizarlo, ya que tienes un plazo de 5 años que no se puede prorrogar</p>
        </div>
      </section>

      {/* Sección: Qué pasa si no hay testamento: la herencia intestada */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>💡</span>
          <h2 className={styles.sectionTitleText}>Qué pasa si no hay testamento: la herencia intestada</h2>
        </div>
        <p>Cuando no existe testamento, se abre lo que se llama sucesión intestada o abintestato. En este caso, la ley determina quién hereda y en qué proporción, siguiendo un orden estricto. Primero heredan los hijos a partes iguales (y sus descendientes si algún hijo ha fallecido antes). Si no hay hijos, heredan los padres, y si no viven, los hermanos. El cónyuge superviviente tiene derecho a usufructo: puede usar y disfrutar los bienes pero no disponer libremente de ellos. Por ejemplo, si Juan fallece sin testamento dejando esposa e hijos, los hijos heredarán la propiedad pero la esposa tendrá derecho a vivir en la casa y usar los bienes hasta su fallecimiento. Si no hay familia directa, pueden heredar abuelos, tíos, primos, y en último caso, el Estado. El proceso es más complejo que cuando hay testamento porque requiere declaración de herederos abintestato ante notario, aportando documentos que prueben el parentesco y la inexistencia de otros herederos con mejor derecho.</p>
        <div className={styles.warningBox}>
          <p><strong>⚠️ Importante:</strong> La herencia intestada puede generar sorpresas: si no hay testamento, los hijos extramatrimoniales no reconocidos legalmente no heredan, pero sí pueden reclamar si demuestran la filiación</p>
        </div>
      </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul className={styles.keyIdeasList}>
          <li>El Certificado de Últimas Voluntades te dice si hay testamento y dónde se hizo</li>
          <li>Hay tres tipos de testamento: abierto (ante notario), cerrado (sobre sellado) y ológrafo (manuscrito)</li>
          <li>Si no hay testamento, la ley decide quién hereda siguiendo un orden: hijos, padres, hermanos...</li>
          <li>El cónyuge superviviente tiene derecho a usufructo aunque no herede la propiedad</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas para Reflexionar</h2>
        </div>
        <ol className={styles.reflectionList}>
          <li>¿Has solicitado ya el certificado de últimas voluntades del fallecido?</li>
          <li>Si hay testamento manuscrito en casa, ¿sabes que tienes 5 años para protocolizarlo ante notario?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> En España, hasta 1944 no existía un registro centralizado de testamentos. Antes, cada notaría guardaba sus propios archivos, lo que hacía muy difícil localizar un testamento si no se sabía exactamente dónde se había hecho.</p>
      </div>

    </ChapterPage>
  );
}
