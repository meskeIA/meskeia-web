'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoNutrisalud.module.css';

export default function PlanificacionPage() {
  const sections = [
    {
      title: 'Principios de una Alimentación Personalizada',
      icon: '🎯',
      content: (
        <>
          <p>
            No existe una dieta perfecta universal. Lo que funciona para una persona
            puede no funcionar para otra. La clave está en entender los principios
            generales y adaptarlos a tu contexto: tus gustos, tu cultura, tu
            presupuesto, tu tiempo y tus objetivos.
          </p>
          <p>
            Después de todo lo aprendido en este curso, es momento de aplicarlo.
            Este capítulo te guía para crear tu propio plan alimentario sostenible,
            sin dietas restrictivas ni reglas absurdas.
          </p>

          <div className={styles.highlightBox}>
            <p>
              <strong>🎯 Objetivo:</strong> Una alimentación que puedas mantener
              de por vida, que te haga sentir bien, que respete tus preferencias
              y que se adapte a tu ritmo de vida. No una dieta temporal de 30 días.
            </p>
          </div>

          <h3>Los 5 pilares de la alimentación sostenible:</h3>
          <ol>
            <li><strong>Variedad:</strong> Cuantos más alimentos diferentes, mejor perfil nutricional</li>
            <li><strong>Predominio de alimentos reales:</strong> Minimizar ultraprocesados</li>
            <li><strong>Flexibilidad:</strong> Permitir excepciones sin culpa</li>
            <li><strong>Disfrute:</strong> Si no te gusta, no lo mantendrás</li>
            <li><strong>Practicidad:</strong> Adaptado a tu vida real, no idealizada</li>
          </ol>
        </>
      ),
    },
    {
      title: 'Estructura de Comidas: Sin Rigidez',
      icon: '🍽️',
      content: (
        <>
          <p>
            La estructura de comidas debe adaptarse a ti, no al revés. No hay
            un número mágico de comidas ni horarios obligatorios.
          </p>

          <h3>Opciones válidas:</h3>
          <div className={styles.exampleGrid}>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🌅</span>
              <h4 className={styles.exampleTitle}>3 comidas tradicionales</h4>
              <p className={styles.exampleDesc}>
                Desayuno, comida, cena. Estructura clásica
                que funciona para muchos.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>☀️</span>
              <h4 className={styles.exampleTitle}>2 comidas + snack</h4>
              <p className={styles.exampleDesc}>
                Ayuno matutino, comida principal
                por la tarde. Popular y válido.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🕐</span>
              <h4 className={styles.exampleTitle}>5-6 comidas pequeñas</h4>
              <p className={styles.exampleDesc}>
                Para quienes prefieren comer
                poco y frecuente. Igualmente válido.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>⏰</span>
              <h4 className={styles.exampleTitle}>Ayuno intermitente</h4>
              <p className={styles.exampleDesc}>
                Ventana de alimentación reducida.
                Funciona si se adapta a tu vida.
              </p>
            </div>
          </div>

          <h3>El plato equilibrado:</h3>
          <p>
            Una guía visual simple para cada comida principal:
          </p>
          <ul>
            <li><strong>50% verduras/hortalizas:</strong> La base de cada comida</li>
            <li><strong>25% proteína:</strong> Animal o vegetal</li>
            <li><strong>25% carbohidratos:</strong> Preferiblemente integrales</li>
            <li><strong>+ Grasas saludables:</strong> Aceite de oliva, aguacate, frutos secos</li>
          </ul>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 Flexibilidad:</strong> Estas proporciones son orientativas.
              No necesitas medir ni pesar. Con el tiempo desarrollas intuición
              para saber si una comida está equilibrada.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Lista de la Compra Inteligente',
      icon: '🛒',
      content: (
        <>
          <p>
            Una buena alimentación empieza en el supermercado. Si en casa solo
            hay alimentos nutritivos, comerás nutritivo. Aquí tienes una lista
            base adaptable.
          </p>

          <h3>Alimentos base para tener siempre:</h3>

          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Ejemplos</th>
                <th>Frecuencia de compra</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Verduras</td>
                <td>Brócoli, espinacas, zanahorias, tomate, cebolla, ajo</td>
                <td>Semanal (frescas)</td>
              </tr>
              <tr>
                <td>Frutas</td>
                <td>Manzanas, plátanos, naranjas, frutos rojos (congelados)</td>
                <td>Semanal</td>
              </tr>
              <tr>
                <td>Proteínas</td>
                <td>Huevos, pollo, pescado, legumbres, tofu</td>
                <td>Semanal</td>
              </tr>
              <tr>
                <td>Carbohidratos</td>
                <td>Arroz integral, avena, pan integral, patatas</td>
                <td>Quincenal</td>
              </tr>
              <tr>
                <td>Grasas</td>
                <td>Aceite de oliva virgen extra, aguacates, frutos secos</td>
                <td>Mensual</td>
              </tr>
              <tr>
                <td>Lácteos/alternativas</td>
                <td>Yogur natural, queso, bebida vegetal sin azúcar</td>
                <td>Semanal</td>
              </tr>
              <tr>
                <td>Despensa</td>
                <td>Especias, vinagre, mostaza, conservas de pescado</td>
                <td>Mensual</td>
              </tr>
            </tbody>
          </table>

          <h3>Estrategias de compra:</h3>
          <ul>
            <li><strong>Perímetro del supermercado:</strong> Los frescos están en los bordes, los ultraprocesados en el centro</li>
            <li><strong>Lista previa:</strong> Evita compras impulsivas</li>
            <li><strong>No comprar con hambre:</strong> Reduce compras emocionales</li>
            <li><strong>Leer etiquetas:</strong> Aplica lo aprendido en el capítulo anterior</li>
            <li><strong>Productos de temporada:</strong> Más baratos, más frescos, más nutritivos</li>
          </ul>

          <div className={styles.warningBox}>
            <p>
              <strong>⚠️ Trampa del marketing:</strong> &quot;Light&quot;, &quot;fitness&quot;,
              &quot;natural&quot;, &quot;sin azúcar añadido&quot; no garantizan que sea saludable.
              Siempre lee los ingredientes, no solo el frente del paquete.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Batch Cooking: Cocinar para la Semana',
      icon: '👨‍🍳',
      content: (
        <>
          <p>
            El <strong>batch cooking</strong> (cocinar en lotes) es la estrategia
            más efectiva para mantener una alimentación saludable cuando tienes
            poco tiempo. Dedicas 2-3 horas un día para tener comida lista toda
            la semana.
          </p>

          <h3>Cómo organizar tu sesión de batch cooking:</h3>
          <ol>
            <li><strong>Planifica el menú semanal</strong> (15 min el día anterior)</li>
            <li><strong>Haz la compra</strong> con lista en mano</li>
            <li><strong>Prepara bases</strong> que se combinan de múltiples formas</li>
            <li><strong>Almacena correctamente</strong> en tuppers de cristal</li>
          </ol>

          <h3>Bases versátiles para preparar:</h3>
          <div className={styles.exampleGrid}>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🍚</span>
              <h4 className={styles.exampleTitle}>Cereales cocidos</h4>
              <p className={styles.exampleDesc}>
                Arroz, quinoa, cuscús. Base para
                bowls, ensaladas, guarniciones.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🥗</span>
              <h4 className={styles.exampleTitle}>Verduras asadas</h4>
              <p className={styles.exampleDesc}>
                Calabacín, pimiento, berenjena.
                Sirven para todo tipo de platos.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🍗</span>
              <h4 className={styles.exampleTitle}>Proteína cocida</h4>
              <p className={styles.exampleDesc}>
                Pollo a la plancha, legumbres,
                huevos cocidos. Listos para añadir.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🥫</span>
              <h4 className={styles.exampleTitle}>Salsas caseras</h4>
              <p className={styles.exampleDesc}>
                Hummus, pesto, vinagreta.
                Transforman cualquier plato simple.
              </p>
            </div>
          </div>

          <h3>Ejemplo de menú semanal simple:</h3>
          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th>Día</th>
                <th>Comida</th>
                <th>Cena</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Lunes</td>
                <td>Bowl: arroz + pollo + verduras asadas</td>
                <td>Ensalada + huevo cocido + aguacate</td>
              </tr>
              <tr>
                <td>Martes</td>
                <td>Lentejas con verduras</td>
                <td>Tortilla + ensalada</td>
              </tr>
              <tr>
                <td>Miércoles</td>
                <td>Pasta integral + atún + tomate</td>
                <td>Salmón + brócoli al vapor</td>
              </tr>
              <tr>
                <td>Jueves</td>
                <td>Garbanzos + espinacas</td>
                <td>Revuelto de verduras + pan integral</td>
              </tr>
              <tr>
                <td>Viernes</td>
                <td>Bowl: quinoa + legumbres + verduras</td>
                <td>Pescado blanco + patata asada</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 Duración:</strong> Los cereales y legumbres cocidos duran
              4-5 días en nevera. Las proteínas 3-4 días. Las verduras asadas
              5-6 días. Congela lo que no vayas a usar en 3 días.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Sostenibilidad a Largo Plazo',
      icon: '🌱',
      content: (
        <>
          <p>
            El objetivo final no es seguir una dieta, sino desarrollar hábitos
            alimentarios que se mantengan sin esfuerzo consciente. Esto requiere
            paciencia y una mentalidad de proceso, no de resultado inmediato.
          </p>

          <h3>Claves para mantener los cambios:</h3>
          <ul>
            <li><strong>Cambios pequeños y graduales:</strong> Un hábito nuevo cada 2-3 semanas</li>
            <li><strong>Identidad, no fuerza de voluntad:</strong> &quot;Soy alguien que come bien&quot; vs. &quot;Estoy a dieta&quot;</li>
            <li><strong>Entorno facilitador:</strong> Ten opciones saludables accesibles</li>
            <li><strong>Flexibilidad sin culpa:</strong> Un 80% bueno es excelente</li>
            <li><strong>Conexión con el &quot;por qué&quot;:</strong> Recuerda tus motivaciones profundas</li>
          </ul>

          <h3>Regla del 80/20:</h3>
          <div className={styles.highlightBox}>
            <p>
              <strong>🎯 Principio práctico:</strong> Si el 80% de tu alimentación
              está basada en alimentos nutritivos y poco procesados, el 20% restante
              puede ser lo que quieras sin impacto significativo en tu salud.
              Esto permite disfrutar de la vida social, celebraciones y antojos
              ocasionales sin culpa.
            </p>
          </div>

          <h3>Señales de una relación sana con la comida:</h3>
          <ul>
            <li>✅ Comes cuando tienes hambre, paras cuando estás satisfecho</li>
            <li>✅ Disfrutas tanto una ensalada como una pizza ocasional</li>
            <li>✅ No te castigas después de &quot;comer mal&quot;</li>
            <li>✅ No piensas constantemente en comida</li>
            <li>✅ Puedes adaptar tu alimentación a situaciones sociales</li>
            <li>✅ La comida es una parte de tu vida, no tu vida entera</li>
          </ul>

          <div className={styles.warningBox}>
            <p>
              <strong>⚠️ Atención:</strong> Si te obsesionas con comer &quot;perfecto&quot;,
              evitas situaciones sociales por la comida, o te angustias por cada
              elección alimentaria, podrías estar desarrollando una relación
              problemática con la comida. Considera hablar con un profesional.
            </p>
          </div>

          <h3>Tu plan de acción:</h3>
          <ol>
            <li><strong>Esta semana:</strong> Elige UN hábito pequeño para implementar</li>
            <li><strong>Este mes:</strong> Practica batch cooking al menos 2 veces</li>
            <li><strong>Estos 3 meses:</strong> Observa cómo te sientes, ajusta según necesites</li>
            <li><strong>A largo plazo:</strong> Los buenos hábitos se convierten en automáticos</li>
          </ol>

          <div className={styles.infoBox}>
            <p>
              <strong>🎓 Felicidades:</strong> Has completado NutriSalud. Ahora tienes
              los conocimientos para tomar decisiones alimentarias informadas.
              Recuerda: el mejor plan es el que puedes mantener. La perfección
              no existe, pero la mejora continua sí. ¡Buen viaje nutricional!
            </p>
          </div>
        </>
      ),
    },
  ];

  return <ChapterPage slug="planificacion" sections={sections} />;
}
