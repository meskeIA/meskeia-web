'use client';

import Link from 'next/link';
import styles from '../../GuiaCuidadoMascota.module.css';
import ChapterPage from '../../ChapterPage';

export default function CuandoIrVeterinarioPage() {
  return (
    <ChapterPage chapterId="cuando-ir-veterinario">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>👋</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Como veterinario, sé que a veces no es fácil saber cuándo una situación realmente requiere una visita urgente al consultorio. Te voy a explicar de manera sencilla cuáles son las verdaderas señales de alarma y qué puedes hacer en casa mientras decides si es necesario salir corriendo con tu peludo.</p>
      </section>

      {/* Secciones */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📌</span>
          <h2 className={styles.sectionTitleText}>🚨 Señales de Alarma: Cuándo Es Urgencia Real</h2>
        </div>
        <p>Hay 8 síntomas que NO debes ignorar nunca: vómitos que no paran (más de 3 en pocas horas), diarrea con sangre visible, letargia extrema (no responde a estímulos que normalmente le interesan), dificultad para respirar (jadeo excesivo sin causa), convulsiones, abdomen hinchado y duro, más de 24 horas sin comer, y fiebre superior a 39.5°C. Si notas cualquiera de estos síntomas, es momento de actuar rápido. No esperes 'a ver si se le pasa'. También presta atención a cambios súbitos de comportamiento: si tu mascota súbitamente se esconde, llora sin razón aparente, o camina de manera extraña, algo está pasando. La regla de oro es: si tu instinto te dice que algo no está bien, probablemente tengas razón. Es mejor una falsa alarma que lamentar haber esperado demasiado.</p>
        <div className={styles.tipBox}>
          <p>💡 Siempre ten a mano el número de tu veterinario y de una clínica de emergencias 24 horas.</p>
        </div>
      </section>

      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📋</span>
          <h2 className={styles.sectionTitleText}>🏠 Tu Botiquín de Emergencias en Casa</h2>
        </div>
        <p>Un botiquín básico puede salvarte en momentos críticos. Incluye: termómetro digital (¡fundamental para detectar fiebre!), gasas estériles y vendas elásticas para heridas, solución salina para limpiar, guantes desechables, jeringa sin aguja para dar medicamentos líquidos, manta térmica, y una linterna pequeña para examinar mejor. También ten carbón activado (solo úsalo si el veterinario te lo indica por teléfono), peróxido de hidrógeno al 3% para inducir vómito (nuevamente, solo bajo supervisión veterinaria), y los números de teléfono de emergencia pegados en la tapa del botiquín. Guarda todo en una caja fácil de encontrar y revisa las fechas de vencimiento cada 6 meses. No olvides incluir cualquier medicamento específico que tu mascota tome regularmente. La clave está en tener todo organizado y a mano, porque en una emergencia cada minuto cuenta y no querrás perder tiempo buscando cosas.</p>
        <div className={styles.tipBox}>
          <p>💡 Practica tomar la temperatura de tu mascota cuando esté sana, así sabrás hacerlo en una emergencia.</p>
        </div>
      </section>

      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>💡</span>
          <h2 className={styles.sectionTitleText}>⛑️ Primeros Auxilios que Sí Puedes Hacer</h2>
        </div>
        <p>Hay cosas simples pero efectivas que puedes hacer mientras vas camino al veterinario. Para heridas sangrantes: presión directa con gasa limpia, nunca quites el primer vendaje si se empapa, pon otro encima. Si hay algo clavado, NO lo saques, inmovilízalo. Para quemaduras: agua fría (nunca hielo) por 10-15 minutos. Si tu mascota se está ahogando: abre su boca, mira si puedes ver el objeto y retíralo con pinzas, nunca con los dedos porque puedes empujarlo más adentro. Para golpe de calor: llévala inmediatamente a la sombra, aplica paños húmedos y frescos (no helados) en patas, cuello y axilas, y ofrece agua en pequeñas cantidades si está consciente. En casos de convulsiones: mantén la calma, aleja objetos con los que pueda golpearse, NO metas nada en su boca, y cronometra cuánto dura la convulsión. Recuerda: estos son primeros auxilios, no reemplazan la atención veterinaria.</p>
        <div className={styles.tipBox}>
          <p>💡 Mantén la calma y habla con voz suave a tu mascota; tu tranquilidad la ayudará a estar más relajada.</p>
        </div>
      </section>

      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>☠️ Intoxicaciones: Qué Hacer Si Comió Algo Tóxico</h2>
        </div>
        <p>¡Tiempo récord! En intoxicaciones cada minuto es oro. Primero: identifica QUÉ comió, CUÁNTO y CUÁNDO (toma foto del envase si es posible). Llama inmediatamente a tu veterinario o centro de toxicología veterinaria. NUNCA induzcas vómito a menos que un profesional te lo indique, porque algunas sustancias (como lejía o derivados del petróleo) causan más daño al volver a pasar por el esófago. Los tóxicos más comunes son: chocolate, uvas, cebolla, ajo, xilitol (chicles sin azúcar), ibuprofeno, paracetamol, plantas como lirios, productos de limpieza y raticidas. Si el veterinario te dice que induzcas vómito, usa peróxido de hidrógeno al 3%: 1 ml por kilo de peso en perros (NUNCA en gatos). Mantén a tu mascota calmada y cálida mientras vas al veterinario. Si está inconsciente, colócala de lado para evitar que se ahogue con su propio vómito.</p>
        <div className={styles.tipBox}>
          <p>💡 Ten siempre el número del centro de intoxicaciones veterinarias en tu teléfono: pueden orientarte por teléfono.</p>
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
            <p>Confía en tu instinto: si algo te parece raro, consulta</p>
          </div>
          <div className={styles.quickTip}>
            <p>Nunca esperes 'a ver si mejora' con los 8 síntomas de alarma</p>
          </div>
          <div className={styles.quickTip}>
            <p>Ten siempre números de emergencia veterinaria a mano</p>
          </div>
          <div className={styles.quickTip}>
            <p>En intoxicaciones, llama antes de hacer cualquier cosa</p>
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
            <p>Los perros suelen mostrar dolor jadeando excesivamente o buscando lugares frescos para echarse. Si tu perro normalmente te recibe en la puerta y no lo hace, es una señal de que algo no está bien.</p>
          </div>
          <div className={`${styles.petTip} ${styles.cat}`}>
            <div className={styles.petTipHeader}>
              <span>🐈</span> Para Gatos
            </div>
            <p>Los gatos son maestros ocultando el dolor. Si tu gato deja de usar la caja de arena, se esconde en lugares inusuales, o deja de acicalarse, son señales claras de que necesita atención veterinaria.</p>
          </div>
        </div>
      </section>

      {/* Herramienta Relacionada */}
      <Link href="/calculadora-medicamentos-mascotas/" className={styles.relatedTool}>
        <div className={styles.relatedToolHeader}>
          <span className={styles.relatedToolIcon}>🧰</span>
          <span className={styles.relatedToolName}>Calculadora de Medicamentos</span>
        </div>
        <p>Calcula dosis exactas de medicamentos de emergencia según el peso de tu mascota</p>
      </Link>
    </ChapterPage>
  );
}
