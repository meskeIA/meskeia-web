'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoNegociacion.module.css';

export default function ContratosAcuerdosPage() {
  return (
    <ChapterPage chapterId="contratos-acuerdos">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>El momento del cierre es donde se define el éxito de cualquier negociación. Sin embargo, muchos profesionales brillantes en la mesa de negociación pierden ventajas decisivas al no formalizar correctamente los acuerdos alcanzados. En el contexto empresarial hispanohablante de 2024, donde las relaciones comerciales son cada vez más complejas y las disputas contractuales más costosas, dominar la transición de la negociación verbal al acuerdo escrito se ha vuelto una competencia crítica. Este módulo te proporcionará las herramientas legales y prácticas necesarias para proteger tus intereses y evitar los errores que pueden convertir una negociación exitosa en un problema legal costoso.</p>
      </section>

        {/* Sección 1: Elementos Esenciales de un Contrato Válido */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📋</span>
            <h2 className={styles.sectionTitleText}>Elementos Esenciales de un Contrato Válido</h2>
          </div>

          <p>Todo contrato válido debe cumplir con cuatro pilares fundamentales que determinarán su validez legal. El primer elemento es el consentimiento libre y consciente de todas las partes. Esto significa que cada parte debe entender claramente qué está acordando, sin presión indebida, error sustancial o engaño. En negociaciones complejas, es fundamental documentar que todas las partes han tenido tiempo suficiente para revisar y consultar los términos.</p>
          <p>El segundo elemento es el objeto del contrato, que debe ser lícito, posible y determinado. El objeto debe describirse con precisión suficiente para que cualquier tercero pueda entender exactamente qué se está acordando. Evita lenguaje vago como 'servicios de calidad' o 'entrega oportuna' sin definir estos conceptos.</p>
          <p>La causa o motivo del contrato constituye el tercer pilar. Debe existir una razón válida y legal para el acuerdo. En contratos comerciales, esto generalmente se satisface con el intercambio de prestaciones (dinero por servicios, productos por pagos, etc.).</p>
          <p>Finalmente, la capacidad legal de las partes es crucial. Todas las partes deben tener la autoridad legal para celebrar el contrato. En contextos empresariales, esto significa verificar que los representantes tengan poderes suficientes para comprometer a sus organizaciones. Un error común es asumir que cualquier ejecutivo puede firmar contratos por su empresa.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>María, directora de una consultora en Madrid, negoció un contrato de servicios con una multinacional. Durante la negociación verbal acordaron 'entregas mensuales de calidad'. Al redactar el contrato, María especificó: 'Entrega de informes ejecutivos de máximo 20 páginas, antes del día 25 de cada mes, incluyendo análisis cuantitativo y recomendaciones estratégicas'. También verificó que su contraparte tenía poder notarial para firmar contratos superiores a 50.000 euros. Esta precisión evitó futuras disputas sobre qué constituía una 'entrega de calidad'.</p>
          </div>
        </section>

        {/* Sección 2: De la Negociación Verbal al Acuerdo Escrito */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🎯</span>
            <h2 className={styles.sectionTitleText}>De la Negociación Verbal al Acuerdo Escrito</h2>
          </div>

          <p>La transición de acuerdos verbales a documentos escritos es donde muchas negociaciones exitosas se descarrilan. El primer paso crítico es crear un resumen inmediato de los puntos acordados. Inmediatamente después de la sesión de negociación, redacta un documento que capture todos los elementos discutidos, incluyendo aquellos puntos donde no hubo acuerdo completo.</p>
          <p>Utiliza la técnica del 'email de confirmación' dentro de las primeras 24 horas. Este email debe listar todos los puntos acordados, fechas tentativas, responsabilidades de cada parte y próximos pasos. Solicita confirmación explícita de la otra parte. Este documento, aunque informal, puede tener valor legal y demuestra buena fe.</p>
          <p>Al redactar el contrato formal, mantén un equilibrio entre precisión legal y claridad comercial. Cada cláusula debe servir a un propósito específico identificado durante la negociación. Evita copiar contratos genéricos sin adaptarlos a tu situación específica. Los contratos efectivos reflejan las particularidades de la negociación que los originó.</p>
          <p>Establece un proceso claro de revisión y aprobación. Define quién revisará el borrador, en qué plazo, y cómo se manejarán las modificaciones. En negociaciones complejas, considera crear borradores paralelos donde cada parte redacte las secciones de su expertise, luego integren ambos documentos.</p>
          <p>Finalmente, programa una reunión específica para revisar el borrador final antes de la firma. Esta reunión no es para renegociar, sino para asegurar que el documento refleje fielmente los acuerdos verbales alcanzados.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Después de negociar una joint venture entre su empresa mexicana y un socio español, Carlos envió este email: 'Confirmando nuestra reunión de ayer: Sociedad 60%-40%, inversión inicial \$2M USD, Carlos como CEO por 3 años, decisiones estratégicas requieren consenso. Borrador de contrato para el 15 de marzo, reunión de revisión el 20 de marzo, firma programada el 25 de marzo. Por favor confirma estos puntos.' Su socio respondió con una aclaración sobre el período de CEO, que se incorporó antes de redactar el contrato formal, evitando conflictos posteriores.</p>
          </div>
        </section>

        {/* Sección 3: Cláusulas Importantes que No Debes Olvidar */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Cláusulas Importantes que No Debes Olvidar</h2>
          </div>

          <p>Existen cláusulas específicas que, aunque no siempre se discuten durante la negociación principal, son fundamentales para proteger tus intereses. La cláusula de fuerza mayor ha adquirido nueva relevancia después de la experiencia de la pandemia. Define específicamente qué eventos constituyen fuerza mayor y cómo se manejará la suspensión, modificación o terminación del contrato en estos casos.</p>
          <p>La cláusula de confidencialidad debe ser bidireccional y específica sobre qué información se considera confidencial, por cuánto tiempo, y qué excepciones aplican. En la era digital, incluye protecciones específicas para datos digitales y propiedad intelectual.</p>
          <p>Las cláusulas de resolución de disputas son críticas en el contexto hispanohablante donde los sistemas judiciales pueden ser lentos. Establece un proceso escalonado: primero negociación directa, luego mediación, finalmente arbitraje. Define la jurisdicción aplicable, especialmente importante en contratos internacionales entre países hispanohablantes.</p>
          <p>Incluye cláusulas de modificación que requieran acuerdos escritos para cualquier cambio al contrato. Esto evita malentendidos sobre modificaciones verbales posteriores. También establece cláusulas de notificación que especifiquen cómo y cuándo las partes deben comunicarse sobre temas contractuales.</p>
          <p>Las cláusulas de terminación deben contemplar diferentes escenarios: terminación por conveniencia, por incumplimiento, por insolvencia, o por cambios regulatorios. Para cada escenario, define el proceso, los plazos de notificación, y cómo se manejarán las obligaciones pendientes.</p>
          <p>Finalmente, incluye una cláusula de 'contrato completo' que establezca que el documento escrito representa el acuerdo total entre las partes, reemplazando cualquier acuerdo verbal previo.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>En un contrato de distribución entre una empresa colombiana y una chilena, se incluyó esta cláusula de fuerza mayor específica: 'Se considerará fuerza mayor: desastres naturales, pandemias declaradas por la OMS, cambios regulatorios que prohíban la importación/exportación de los productos, y conflictos armados. La parte afectada debe notificar por escrito dentro de 48 horas, proporcionando evidencia del evento. El contrato se suspende automáticamente por 90 días, después de los cuales cualquier parte puede terminar sin penalidad.' Esta especificidad evitó disputas cuando las restricciones por COVID-19 afectaron las operaciones.</p>
          </div>
        </section>

        {/* Sección 4: Errores Legales Comunes en Negociaciones */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>⚡</span>
            <h2 className={styles.sectionTitleText}>Errores Legales Comunes en Negociaciones</h2>
          </div>

          <p>El error más costoso es asumir que las prácticas comerciales locales tienen validez legal universal. En el contexto hispanohablante, cada país tiene particularidades jurídicas significativas. Por ejemplo, en México los contratos laborales tienen protecciones específicas que no existen en otros países, mientras que en España las cláusulas abusivas en contratos comerciales tienen un marco regulatorio estricto.</p>
          <p>Otro error frecuente es la falta de verificación de capacidad legal y representación. Muchas disputas surgen porque quien negoció no tenía autoridad para comprometer a su organización. Siempre solicita documentación que acredite la representación legal, especialmente en sociedades familiares donde la estructura de poder puede no estar clara.</p>
          <p>La ambigüedad en fechas y plazos genera numerosos conflictos. Evita términos como 'pronto', 'razonable', o 'en tiempo oportuno'. Define si las fechas son días hábiles o calendario, qué zona horaria aplica en contratos internacionales, y cómo se calculan los plazos. En culturas donde la puntualidad tiene interpretaciones diferentes, la precisión es fundamental.</p>
          <p>Un error crítico es no considerar las implicaciones fiscales y regulatorias de los acuerdos. Un contrato puede ser perfectamente válido pero generar consecuencias fiscales no planificadas. Consulta con asesores fiscales antes de finalizar acuerdos significativos, especialmente en transacciones internacionales.</p>
          <p>La falta de cláusulas de actualización o revisión en contratos de largo plazo es problemática en economías con inflación variable. Incluye mecanismos de ajuste por inflación, cambios en costos de materias primas, o modificaciones regulatorias que afecten el cumplimiento.</p>
          <p>Finalmente, muchos negociadores olvidan documentar las conversaciones previas al contrato. Las comunicaciones por WhatsApp, emails, y mensajes de texto pueden tener valor legal para interpretar la intención de las partes si surge una disputa.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Una empresa argentina cerró un acuerdo de suministro con un proveedor peruano usando un contrato estándar español. El contrato establecía pagos en 'días hábiles' sin especificar qué calendario aplicaba. Cuando surgió una disputa, el proveedor peruano argumentó que los feriados peruanos no contaban como días hábiles, mientras que la empresa argentina aplicaba el calendario argentino. La diferencia resultó en 15 días de discrepancia en los pagos. El arbitraje duró 8 meses y costó más que la disputa original. Una simple cláusula especificando 'días hábiles según el calendario argentino' habría evitado todo el conflicto.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Ideas Clave</h4>
        <ul>
            <li>Todo contrato válido requiere consentimiento libre, objeto lícito, causa válida y capacidad legal de las partes</li>
            <li>La transición de acuerdos verbales a escritos debe documentarse inmediatamente con emails de confirmación</li>
            <li>Las cláusulas de fuerza mayor, confidencialidad y resolución de disputas son fundamentales en el contexto post-pandemia</li>
            <li>Los errores legales más costosos surgen de asumir que las prácticas locales tienen validez universal</li>
            <li>La precisión en fechas, plazos y términos técnicos evita el 80% de las disputas contractuales</li>
        </ul>
      </div>

      {/* Preguntas de Reflexión */}
      <div className={styles.reflectionQuestions}>
        <h4>🤔 Preguntas para Reflexionar</h4>
        <ol>
            <li>¿Qué elementos de tus negociaciones pasadas podrían haber generado problemas legales por falta de documentación adecuada?</li>
            <li>¿Cómo verificas actualmente la capacidad legal de las personas con quienes negocias contratos importantes?</li>
            <li>¿Qué cláusulas específicas incluirías en tus contratos considerando los riesgos particulares de tu industria y región?</li>
        </ol>
      </div>

      {/* Consejo Práctico */}
      <div className={styles.practicalTip}>
        <h4>🎯 Consejo Práctico</h4>
        <p>Crea un checklist de 'elementos imprescindibles' para tus contratos que incluya: verificación de capacidad legal, definición precisa de fechas y plazos, cláusulas de fuerza mayor actualizadas, mecanismos de resolución de disputas, y una cláusula de 'contrato completo'. Revisa este checklist antes de cada firma.</p>
      </div>

      {/* Curiosidad */}
      <div className={styles.curiosityBox}>
        <h4>🔍 Dato Curioso</h4>
        <p>Según un estudio de la Cámara de Comercio Internacional de 2024, el 67% de las disputas comerciales en países hispanohablantes se originan por ambigüedades en fechas y plazos, mientras que solo el 12% se debe a desacuerdos sobre precios o cantidades. La precisión en el lenguaje contractual es más importante que la complejidad de los términos comerciales.</p>
      </div>
    </ChapterPage>
  );
}
