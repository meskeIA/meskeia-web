'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoRedaccionAcademica.module.css';

export default function FluirbienPage() {
  return (
    <ChapterPage chapterId="fluir-bien">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Imagina que tu lector es un detective siguiendo las pistas de tu argumentación. Si esas pistas no lo llevan claramente de un punto al siguiente, abandonará el caso. La coherencia es exactamente eso: el hilo conductor que permite que tus ideas fluyan de manera lógica y comprensible. En este módulo, no solo aprenderás qué es la coherencia, sino que dominarás las técnicas específicas para construir textos académicos que mantengan a tu lector enganchado desde la primera línea hasta la conclusión.</p>
      </section>

      {/* Sección: ¿Qué es la coherencia y cómo detectar cuando tu texto la pierde? */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>¿Qué es la coherencia y cómo detectar cuando tu texto la pierde?</h2>
        </div>
          <p>La coherencia es la cualidad que hace que tu texto se lea como una conversación inteligente, no como ideas sueltas pegadas con cinta adhesiva. Pero aquí está el problema: cuando escribes, tú sabes lo que quieres decir, así que tu cerebro 'rellena' automáticamente los vacíos lógicos. Por eso, muchos estudiantes entregan trabajos que para ellos tienen sentido, pero que para el profesor son un laberinto sin salida.</p>
          <p>¿Cómo detectar si tu texto pierde coherencia? Aplica la 'prueba del extraño': dale tu texto a alguien que no conozca el tema. Si se confunde o hace preguntas como '¿cómo llegaste a esa conclusión?' o '¿qué tiene que ver esto con lo anterior?', tu texto tiene problemas de coherencia.</p>
          <p>La coherencia opera en tres niveles que debes dominar:</p>
          <ol>
            <li><strong>Coherencia global</strong>: Tu texto completo debe responder a una pregunta central y cada capítulo debe contribuir a esa respuesta. Si tu TFG habla de marketing digital, no puedes dedicar tres páginas a la historia general del comercio sin conectarlo claramente con tu tema.</li>
          </ol>
          <ol>
            <li><strong>Coherencia local</strong>: Cada párrafo debe desarrollar una idea específica que se relacione lógicamente con el anterior y el siguiente. Piensa en cada párrafo como un escalón: debe estar firmemente conectado al anterior para que puedas subir al siguiente.</li>
          </ol>
          <ol>
            <li><strong>Coherencia lineal</strong>: Cada oración dentro del párrafo debe seguir naturalmente a la anterior. No saltes de idea en idea como un conejo asustado.</li>
          </ol>
          <p>Un truco práctico: lee tu texto en voz alta. Cuando encuentres un punto donde piensas '¿eh?, ¿cómo llegué aquí?', marca ese lugar. Ahí perdiste la coherencia.</p>
          <p>La coherencia también significa ser consistente con tu nivel de formalidad, tu terminología y tu perspectiva. Si empiezas escribiendo en tercera persona ('el investigador considera que...'), no cambies repentinamente a primera persona ('yo creo que...'). Si defines un término de una manera, úsalo consistentemente a lo largo del texto.</p>
        
        <div className={styles.exampleBox}>
          <p><strong>Ejemplo:</strong></p>
          <p><strong>Ejemplo de párrafo coherente en una introducción de TFG sobre redes sociales:</strong>

'La transformación de las redes sociales de espacios de interacción personal a plataformas de marketing empresarial ha generado nuevos desafíos en la gestión de la privacidad de los usuarios. Este cambio de paradigma no solo afecta la manera en que las empresas recolectan datos, sino que también modifica las expectativas de privacidad de los consumidores digitales. El presente estudio analiza cómo estas dinámicas contradictorias impactan en la confianza del usuario hacia las marcas en el entorno digital español durante el período 2020-2023.'

<strong>¿Por qué funciona?</strong> Cada oración conecta lógicamente con la siguiente: transformación → desafíos → cambio de paradigma → expectativas → estudio específico. No hay saltos temáticos ni información irrelevante.</p>
        </div>
      </section>

      {/* Sección: Técnicas infalibles para construir coherencia paso a paso */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>✍️</span>
          <h2 className={styles.sectionTitleText}>Técnicas infalibles para construir coherencia paso a paso</h2>
        </div>
          <p>Construir coherencia no es magia, es técnica. Aquí tienes el sistema que uso con mis estudiantes para transformar textos caóticos en argumentaciones sólidas:</p>
          <p><strong>Técnica 1: La regla de la cadena lógica</strong>
Antes de escribir cualquier párrafo, hazte estas tres preguntas: ¿Qué estableció el párrafo anterior? ¿Qué nueva información aporto aquí? ¿Cómo preparo el párrafo siguiente? Si no puedes responder claramente, tu párrafo será un huérfano en medio del texto.</p>
          <p><strong>Técnica 2: El mapeado de conectores</strong>
Los conectores no son decoración, son GPS para tu lector. Pero usar 'además' cuando deberías usar 'sin embargo' es como dar direcciones equivocadas. Aquí tienes la guía de uso real:
- 'Asimismo' / 'Del mismo modo': cuando das un ejemplo similar o refuerzas la idea anterior
- 'No obstante' / 'Sin embargo': cuando introduces una limitación o contraste
- 'Por consiguiente' / 'En consecuencia': cuando muestras resultado o efecto
- 'Cabe destacar que': cuando introduces información especialmente relevante</p>
          <p><strong>Técnica 3: La estructura de problema-desarrollo-cierre</strong>
Cada párrafo académico necesita esta estructura:
- <strong>Oración problema</strong>: Presenta la idea central del párrafo
- <strong>Oraciones desarrollo</strong>: Explican, ejemplifican o argumentan esa idea
- <strong>Oración cierre</strong>: Conecta con el siguiente párrafo o refuerza la idea central</p>
          <p><strong>Técnica 4: La revisión de 'palabras clave'</strong>
Identifica las 5-7 palabras clave de tu trabajo. Estas deben aparecer distribuidas a lo largo del texto, creando una red semántica que mantiene la unidad temática. Si en tu TFG sobre 'inteligencia artificial en educación' no aparecen consistentemente ambos términos, tu texto se dispersará.</p>
          <p><strong>Técnica 5: El test de los títulos</strong>
Escribe un título de 5-8 palabras para cada párrafo. Luego, léelos en secuencia. ¿Cuentan una historia lógica? ¿Hay saltos inexplicables? Esta técnica revela inmediatamente los problemas de coherencia global.</p>
          <p><strong>Técnica 6: La técnica del 'zoom'</strong>
Alterna entre párrafos de 'zoom out' (contexto general, panorama amplio) y 'zoom in' (detalles específicos, ejemplos concretos). Esta variación mantiene el interés y ayuda a la comprensión, pero siempre dentro de tu línea argumentativa principal.</p>
          <p>Recuerda: la coherencia se construye en la reescritura, no en el primer borrador. Tu primera versión será siempre caótica porque tu cerebro está explorando ideas. La coherencia aparece cuando revisas, reorganizas y pulés.</p>
        
        <div className={styles.exampleBox}>
          <p><strong>Ejemplo:</strong></p>
          <p><strong>Antes (sin coherencia):</strong>
'Las redes sociales tienen millones de usuarios. Facebook cambió sus políticas de privacidad en 2021. Los jóvenes prefieren Instagram. La privacidad es importante para las empresas. Los datos se venden a terceros.'

<strong>Después (con técnicas de coherencia):</strong>
'El crecimiento exponencial de usuarios en redes sociales ha intensificado las preocupaciones sobre privacidad digital. En este contexto, la modificación de las políticas de privacidad de Facebook en 2021 ejemplifica cómo las plataformas adaptan sus estrategias de recolección de datos. Sin embargo, esta adaptación genera una paradoja: mientras las empresas necesitan información de usuarios para personalizar servicios, los consumidores—especialmente los jóvenes usuarios de Instagram—demandan mayor control sobre sus datos personales.'

<strong>¿Qué cambió?</strong> Usé conectores específicos ('En este contexto', 'Sin embargo'), creé relaciones causales claras, y unifiqué toda la información bajo un tema central: la tensión entre uso de datos y privacidad.</p>
        </div>
      </section>

      {/* Pautas clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Pautas Clave</h4>
        <ul>
          <li>Aplica la 'prueba del extraño': si alguien ajeno al tema no entiende tu texto, tienes problemas de coherencia</li>
          <li>Usa la regla de tres preguntas por párrafo: ¿qué estableció el anterior?, ¿qué aporto aquí?, ¿cómo preparo el siguiente?</li>
          <li>Los conectores son GPS para tu lector: 'además' suma, 'sin embargo' contrasta, 'por tanto' concluye</li>
          <li>Cada párrafo necesita problema-desarrollo-cierre, no solo información suelta</li>
          <li>Identifica tus 5-7 palabras clave y distribúyelas consistentemente por todo el texto</li>
          <li>La coherencia se construye en la reescritura, no en el primer borrador</li>
        </ul>
      </div>

      {/* Errores comunes */}
      <div className={styles.warningBox}>
        <p><strong>⚠️ Errores comunes que debes evitar:</strong></p>
        <ul>
          <li>Usar conectores al azar ('además' cuando debería ser 'sin embargo')</li>
          <li>Escribir párrafos que no se conectan lógicamente con el anterior ni el siguiente</li>
          <li>Cambiar de registro (formal/informal) o perspectiva (primera/tercera persona) sin razón</li>
          <li>Incluir información relevante pero que no contribuye al argumento central</li>
          <li>No revisar si cada párrafo aporta algo nuevo o solo repite ideas anteriores</li>
          <li>Asumir que el lector conoce el contexto de tus ideas sin explicar las conexiones</li>
        </ul>
      </div>

      {/* Consejo del profesor */}
      <div className={styles.practicalTip}>
        <h4>👨‍🏫 Consejo de Profesor</h4>
        <p>Aquí tienes mi truco de 20 años corrigiendo tesis: imprime tu texto, recorta cada párrafo por separado y mézclalos. Luego intenta reordenarlos sin mirar el original. Si no puedes, tu texto no tiene coherencia suficiente. Los párrafos coherentes contienen pistas claras sobre su lugar en la argumentación general.</p>
      </div>

      {/* Aplica a tu trabajo */}
      <div className={styles.reflectionQuestions}>
        <h4>📝 Aplica esto a tu trabajo</h4>
        <p>Toma el capítulo que estás escribiendo ahora. Subraya la primera oración de cada párrafo y léelas en secuencia, ignorando el resto. ¿Cuentan una historia lógica? ¿Hay saltos que confundirían a tu lector? Donde encuentres un salto, ahí necesitas un párrafo de transición o mejor conexión. Este ejercicio te tomará 10 minutos y puede salvar tu calificación.</p>
      </div>
    </ChapterPage>
  );
}
