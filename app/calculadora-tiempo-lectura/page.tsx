'use client';

import { useState, useEffect } from 'react';
import styles from './CalculadoraTiempoLectura.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Velocidades de lectura por defecto
const VELOCIDADES = {
  lento: 150,
  normal: 200,
  rapido: 250,
  experto: 300
};

// Velocidad de habla promedio
const VELOCIDAD_HABLA = 150; // palabras por minuto

export default function CalculadoraTiempoLecturaPage() {
  const [texto, setTexto] = useState('');
  const [velocidad, setVelocidad] = useState(200);
  const [analisis, setAnalisis] = useState<{
    palabras: number;
    caracteres: number;
    caracteresConEspacios: number;
    oraciones: number;
    parrafos: number;
    lineas: number;
    tiempoLectura: number;
    tiempoEscucha: number;
    promedioPalabrasOracion: number;
    promedioPalabrasParrafo: number;
    densidad: string;
  } | null>(null);

  useEffect(() => {
    if (texto.trim()) {
      analizarTexto();
    } else {
      setAnalisis(null);
    }
  }, [texto, velocidad]);

  const analizarTexto = () => {
    // Contar palabras
    const palabras = texto.trim().split(/\s+/).filter(p => p.length > 0).length;

    // Contar caracteres
    const caracteres = texto.replace(/\s/g, '').length;
    const caracteresConEspacios = texto.length;

    // Contar oraciones
    const oraciones = texto.split(/[.!?]+/).filter(o => o.trim().length > 0).length || 1;

    // Contar párrafos
    const parrafos = texto.split(/\n\s*\n/).filter(p => p.trim().length > 0).length || 1;

    // Contar líneas
    const lineas = texto.split('\n').filter(l => l.trim().length > 0).length;

    // Calcular tiempos
    const tiempoLectura = palabras / velocidad; // en minutos
    const tiempoEscucha = palabras / VELOCIDAD_HABLA; // en minutos

    // Promedios
    const promedioPalabrasOracion = palabras / oraciones;
    const promedioPalabrasParrafo = palabras / parrafos;

    // Densidad del texto
    let densidad = 'Normal';
    if (promedioPalabrasOracion > 25) densidad = 'Denso';
    else if (promedioPalabrasOracion < 12) densidad = 'Ligero';

    setAnalisis({
      palabras,
      caracteres,
      caracteresConEspacios,
      oraciones,
      parrafos,
      lineas,
      tiempoLectura,
      tiempoEscucha,
      promedioPalabrasOracion,
      promedioPalabrasParrafo,
      densidad
    });
  };

  const formatTiempo = (minutos: number): string => {
    if (minutos < 1) {
      const segundos = Math.round(minutos * 60);
      return `${segundos} seg`;
    } else if (minutos < 60) {
      const mins = Math.floor(minutos);
      const segs = Math.round((minutos - mins) * 60);
      if (segs > 0) {
        return `${mins} min ${segs} seg`;
      }
      return `${mins} min`;
    } else {
      const horas = Math.floor(minutos / 60);
      const mins = Math.round(minutos % 60);
      return `${horas}h ${mins}min`;
    }
  };

  const getTipoContenido = (palabras: number): { tipo: string; emoji: string; descripcion: string } => {
    if (palabras < 300) {
      return { tipo: 'Publicación corta', emoji: '📱', descripcion: 'Ideal para redes sociales o notas rápidas' };
    } else if (palabras < 800) {
      return { tipo: 'Artículo breve', emoji: '📰', descripcion: 'Perfecto para newsletters o posts de blog' };
    } else if (palabras < 1500) {
      return { tipo: 'Artículo estándar', emoji: '📝', descripcion: 'Longitud ideal para SEO y engagement' };
    } else if (palabras < 3000) {
      return { tipo: 'Artículo largo', emoji: '📚', descripcion: 'Contenido profundo, guías completas' };
    } else {
      return { tipo: 'Contenido extenso', emoji: '📖', descripcion: 'Ebooks, whitepapers, documentación' };
    }
  };

  const textoEjemplo = `El marketing de contenidos se ha convertido en una estrategia fundamental para las empresas que buscan conectar con su audiencia de manera significativa. A diferencia de la publicidad tradicional, el content marketing se centra en crear y distribuir contenido valioso, relevante y consistente.

Las estadísticas muestran que las empresas que mantienen un blog activo generan un 67% más de leads que aquellas que no lo hacen. Además, el contenido de calidad mejora significativamente el posicionamiento SEO y ayuda a construir autoridad en el sector.

Para implementar una estrategia efectiva, es crucial conocer a tu audiencia. Esto implica investigar sus necesidades, problemas y preferencias de consumo de contenido. Con esta información, puedes crear piezas que realmente aporten valor y generen engagement.

La consistencia es otro factor clave. Publicar regularmente no solo mantiene a tu audiencia comprometida, sino que también señala a los motores de búsqueda que tu sitio está activo y actualizado. Sin embargo, nunca sacrifiques calidad por cantidad.

Finalmente, medir los resultados es esencial. Analiza métricas como tiempo en página, tasa de rebote, compartidos sociales y conversiones para entender qué funciona y qué necesita mejoras. El marketing de contenidos es un proceso iterativo de mejora continua.`;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de Tiempo de Lectura</h1>
        <p className={styles.subtitle}>
          Estima cuánto tardarán tus lectores en consumir tu contenido
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Tu texto</h2>

          <div className={styles.inputGroup}>
            <textarea
              className={styles.textarea}
              placeholder="Pega aquí tu texto para calcular el tiempo de lectura..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={14}
            />
            <div className={styles.charInfo}>
              <span>{texto.length} caracteres</span>
              <button
                className={styles.ejemploBtn}
                onClick={() => setTexto(textoEjemplo)}
              >
                Cargar ejemplo
              </button>
            </div>
          </div>

          <div className={styles.velocidadSection}>
            <label className={styles.label}>Velocidad de lectura</label>
            <div className={styles.velocidadOptions}>
              {Object.entries(VELOCIDADES).map(([key, value]) => (
                <button
                  key={key}
                  className={`${styles.velocidadBtn} ${velocidad === value ? styles.active : ''}`}
                  onClick={() => setVelocidad(value)}
                >
                  <span className={styles.velocidadLabel}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                  <span className={styles.velocidadValue}>{value} ppm</span>
                </button>
              ))}
            </div>
            <div className={styles.customVelocidad}>
              <label>Personalizar:</label>
              <input
                type="number"
                min="50"
                max="500"
                value={velocidad}
                onChange={(e) => setVelocidad(Number(e.target.value))}
                className={styles.velocidadInput}
              />
              <span>palabras/min</span>
            </div>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.panelTitle}>Análisis</h2>

          {analisis ? (
            <>
              {/* Tiempo principal */}
              <div className={styles.tiempoCard}>
                <div className={styles.tiempoPrincipal}>
                  <span className={styles.tiempoIcon}>⏱️</span>
                  <div className={styles.tiempoInfo}>
                    <span className={styles.tiempoValor}>{formatTiempo(analisis.tiempoLectura)}</span>
                    <span className={styles.tiempoLabel}>tiempo de lectura</span>
                  </div>
                </div>
                <div className={styles.tiempoSecundario}>
                  <div className={styles.tiempoItem}>
                    <span className={styles.tiempoItemIcon}>🎧</span>
                    <span className={styles.tiempoItemValor}>{formatTiempo(analisis.tiempoEscucha)}</span>
                    <span className={styles.tiempoItemLabel}>escucha (audio)</span>
                  </div>
                </div>
              </div>

              {/* Tipo de contenido */}
              {(() => {
                const tipo = getTipoContenido(analisis.palabras);
                return (
                  <div className={styles.tipoCard}>
                    <span className={styles.tipoEmoji}>{tipo.emoji}</span>
                    <div className={styles.tipoInfo}>
                      <span className={styles.tipoNombre}>{tipo.tipo}</span>
                      <span className={styles.tipoDesc}>{tipo.descripcion}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Estadísticas */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{formatNumber(analisis.palabras, 0)}</span>
                  <span className={styles.statLabel}>Palabras</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{formatNumber(analisis.caracteres, 0)}</span>
                  <span className={styles.statLabel}>Caracteres</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{analisis.oraciones}</span>
                  <span className={styles.statLabel}>Oraciones</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{analisis.parrafos}</span>
                  <span className={styles.statLabel}>Párrafos</span>
                </div>
              </div>

              {/* Métricas adicionales */}
              <div className={styles.metricasSection}>
                <h3>Métricas de estructura</h3>
                <div className={styles.metricasList}>
                  <div className={styles.metricaItem}>
                    <span className={styles.metricaLabel}>Caracteres con espacios</span>
                    <span className={styles.metricaValue}>{formatNumber(analisis.caracteresConEspacios, 0)}</span>
                  </div>
                  <div className={styles.metricaItem}>
                    <span className={styles.metricaLabel}>Líneas</span>
                    <span className={styles.metricaValue}>{analisis.lineas}</span>
                  </div>
                  <div className={styles.metricaItem}>
                    <span className={styles.metricaLabel}>Palabras/oración (promedio)</span>
                    <span className={styles.metricaValue}>{formatNumber(analisis.promedioPalabrasOracion, 1)}</span>
                  </div>
                  <div className={styles.metricaItem}>
                    <span className={styles.metricaLabel}>Palabras/párrafo (promedio)</span>
                    <span className={styles.metricaValue}>{formatNumber(analisis.promedioPalabrasParrafo, 1)}</span>
                  </div>
                  <div className={styles.metricaItem}>
                    <span className={styles.metricaLabel}>Densidad del texto</span>
                    <span className={`${styles.metricaValue} ${styles[analisis.densidad.toLowerCase()]}`}>
                      {analisis.densidad}
                    </span>
                  </div>
                </div>
              </div>

              {/* Badge para copiar */}
              <div className={styles.badgeSection}>
                <h3>Badge para tu artículo</h3>
                <div className={styles.badgePreview}>
                  <span>⏱️ {Math.ceil(analisis.tiempoLectura)} min de lectura</span>
                </div>
                <button
                  className={styles.copyBtn}
                  onClick={() => {
                    navigator.clipboard.writeText(`⏱️ ${Math.ceil(analisis.tiempoLectura)} min de lectura`);
                  }}
                >
                  Copiar badge
                </button>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>⏱️</span>
              <p>Escribe o pega un texto para calcular el tiempo de lectura</p>
            </div>
          )}
        </div>
      </div>

      {/* Referencia de longitudes */}
      <div className={styles.referenciaSection}>
        <h3>Longitudes recomendadas por tipo de contenido</h3>
        <div className={styles.referenciaGrid}>
          <div className={styles.referenciaCard}>
            <span className={styles.referenciaIcon}>📱</span>
            <h4>Redes Sociales</h4>
            <span className={styles.referenciaPalabras}>50-150 palabras</span>
            <span className={styles.referenciaTiempo}>~30 seg</span>
          </div>
          <div className={styles.referenciaCard}>
            <span className={styles.referenciaIcon}>📧</span>
            <h4>Email / Newsletter</h4>
            <span className={styles.referenciaPalabras}>200-500 palabras</span>
            <span className={styles.referenciaTiempo}>1-2 min</span>
          </div>
          <div className={styles.referenciaCard}>
            <span className={styles.referenciaIcon}>📝</span>
            <h4>Blog Post</h4>
            <span className={styles.referenciaPalabras}>800-1500 palabras</span>
            <span className={styles.referenciaTiempo}>4-7 min</span>
          </div>
          <div className={styles.referenciaCard}>
            <span className={styles.referenciaIcon}>📚</span>
            <h4>Guía Completa</h4>
            <span className={styles.referenciaPalabras}>2000-3000 palabras</span>
            <span className={styles.referenciaTiempo}>10-15 min</span>
          </div>
          <div className={styles.referenciaCard}>
            <span className={styles.referenciaIcon}>📖</span>
            <h4>Ebook / Whitepaper</h4>
            <span className={styles.referenciaPalabras}>5000+ palabras</span>
            <span className={styles.referenciaTiempo}>25+ min</span>
          </div>
        </div>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="Optimiza la longitud de tu contenido"
        subtitle="Estrategias para mejorar el engagement según el tiempo de lectura"
      >
        <div className={styles.educationalContent}>

          {/* Sección original: Por qué importa */}
          <section className={styles.eduSection}>
            <h2>¿Por qué importa el tiempo de lectura?</h2>
            <p>
              El tiempo de lectura es una métrica crucial para el engagement. Estudios muestran
              que los artículos con indicador de tiempo visible tienen hasta un 40% más de
              lecturas completas. Los usuarios aprecian saber cuánto tiempo invertirán antes
              de empezar.
            </p>
            <div className={styles.factGrid}>
              <div className={styles.factCard}>
                <span className={styles.factValue}>238</span>
                <span className={styles.factLabel}>PPM promedio adulto español</span>
              </div>
              <div className={styles.factCard}>
                <span className={styles.factValue}>7 min</span>
                <span className={styles.factLabel}>Longitud óptima blog</span>
              </div>
              <div className={styles.factCard}>
                <span className={styles.factValue}>+40%</span>
                <span className={styles.factLabel}>Más engagement con badge</span>
              </div>
            </div>
          </section>

          {/* 1. Tabla Comparativa */}
          <section className={styles.eduSection}>
            <h2>Velocidades de lectura por perfil</h2>
            <p>
              La velocidad de lectura varía enormemente según la persona, el tipo de texto y el propósito. Conocer cada perfil ayuda a establecer estimaciones realistas para tu audiencia.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Perfil</th>
                    <th>Palabras/min</th>
                    <th>Comprensión est.</th>
                    <th>Cuándo se usa</th>
                    <th>Texto ideal</th>
                    <th>Técnica</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Lectura lenta</td>
                    <td>~150 ppm</td>
                    <td>90–100%</td>
                    <td>Estudio, oposiciones, contratos</td>
                    <td>Textos técnicos, legales, académicos</td>
                    <td>Subrayado activo</td>
                  </tr>
                  <tr>
                    <td>Lectura media</td>
                    <td>~238 ppm</td>
                    <td>75–90%</td>
                    <td>Lectura de ocio, blogs, noticias</td>
                    <td>Artículos, newsletters, novelas</td>
                    <td>Lectura lineal</td>
                  </tr>
                  <tr>
                    <td>Lectura rápida</td>
                    <td>~350 ppm</td>
                    <td>60–75%</td>
                    <td>Revisión de informes, scan de contenido</td>
                    <td>Informes estructurados, guías</td>
                    <td>Skimming (escaneo)</td>
                  </tr>
                  <tr>
                    <td>Speed reading</td>
                    <td>700+ ppm</td>
                    <td>40–60%</td>
                    <td>Selección de fuentes, investigación previa</td>
                    <td>Textos con estructura clara y bullets</td>
                    <td>Chunking visual</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. Casos de Uso */}
          <section className={styles.eduSection}>
            <h2>Quién usa esta calculadora y para qué</h2>
            <p>
              Desde bloggers hasta docentes, conocer el tiempo de lectura estimado permite adaptar el contenido a las expectativas del lector y mejorar métricas clave.
            </p>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>✍️</span>
                  <div>
                    <h4>Blogger y redactor de contenidos</h4>
                    <p>SEO y experiencia de usuario</p>
                  </div>
                </div>
                <p className={styles.escenarioExample}>
                  Antes de publicar un artículo, calcula el tiempo de lectura para incluirlo en el meta description y en el encabezado del post. Google valora el tiempo en página, y mostrar &quot;8 min de lectura&quot; atrae a lectores con intención real.
                </p>
                <p className={styles.escenarioTip}>
                  Artículos de 7-10 minutos tienen el mayor tiempo en página según estudios de Medium y HubSpot.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>📧</span>
                  <div>
                    <h4>Editor de newsletters</h4>
                    <p>Duración óptima del email</p>
                  </div>
                </div>
                <p className={styles.escenarioExample}>
                  Estima cuántos minutos tardará el suscriptor en leer el email completo. Los newsletters de entre 200 y 400 palabras (1-2 min) tienen tasas de apertura y clic superiores. Los más largos funcionan mejor en formato guía semanal.
                </p>
                <p className={styles.escenarioTip}>
                  Newsletters de menos de 3 minutos tienen un 20% más de tasa de clic en España según datos de Mailchimp.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🎓</span>
                  <div>
                    <h4>Docente y formador</h4>
                    <p>Planificación de lecturas de clase</p>
                  </div>
                </div>
                <p className={styles.escenarioExample}>
                  Asigna textos a estudiantes sabiendo de antemano cuánto tiempo necesitan para leerlos. Permite diseñar sesiones realistas: si un artículo tarda 12 minutos, no lo incluyas como tarea de 5 minutos en el aula.
                </p>
                <p className={styles.escenarioTip}>
                  Usa la velocidad &quot;lento&quot; (150 ppm) para alumnos de secundaria y &quot;normal&quot; (238 ppm) para universitarios.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>💼</span>
                  <div>
                    <h4>Profesional y directivo</h4>
                    <p>Informes y documentos largos</p>
                  </div>
                </div>
                <p className={styles.escenarioExample}>
                  Antes de enviar un informe de 15 páginas a tu equipo, estima el tiempo de lectura para programar la reunión de revisión adecuadamente. Un documento de 3.000 palabras requiere unos 13 minutos a velocidad normal.
                </p>
                <p className={styles.escenarioTip}>
                  Añadir &quot;Tiempo estimado: 12 min&quot; al encabezado de informes internos aumenta la tasa de lectura completa en equipos remotos.
                </p>
              </div>
            </div>
          </section>

          {/* 3. FAQ */}
          <section className={styles.eduSection}>
            <h2>Preguntas frecuentes sobre tiempo de lectura</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>¿Cuál es la velocidad media de lectura de un adulto español?</h4>
                <p>
                  Según estudios de lectura en castellano, la velocidad media de un adulto español en lectura silenciosa es de aproximadamente 238 palabras por minuto (ppm), con una comprensión del 75-80%. Esta cifra es ligeramente superior a la media global en inglés (200-250 ppm) debido a la fonética más regular del español.
                </p>
                <span className={styles.faqTip}>Dato: la velocidad baja un 25-30% en lectura en pantalla respecto al papel.</span>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Cómo afecta el tiempo de lectura al SEO?</h4>
                <p>
                  Google usa el tiempo en página como señal de calidad del contenido. Un artículo que muestra su tiempo de lectura estimado atrae a usuarios con intención real de leerlo, lo que reduce la tasa de rebote. Artículos con badge de tiempo tienen un 40% más de lecturas completas, señal que correlaciona con mejores posiciones orgánicas.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Cuándo merece la pena mostrar el tiempo de lectura en un artículo?</h4>
                <p>
                  Medium muestra el tiempo de lectura en todos sus artículos a partir de 2 minutos. La recomendación general para blogs es mostrarlo siempre que el artículo supere los 3 minutos (~700 palabras), ya que por debajo el indicador no aporta valor diferencial. Para artículos de 1-2 minutos, el usuario ya percibe que es breve.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Hay diferencia entre leer en papel y en pantalla?</h4>
                <p>
                  Sí, significativa. La lectura en pantalla es entre un 20-30% más lenta que en papel según estudios de la Universidad de Stavanger. El parpadeo de la pantalla, la luz azul y el scroll continuo aumentan la fatiga ocular. Para contenido en pantalla, reduce un 20-25% la estimación de velocidad respecto al papel.
                </p>
                <span className={styles.faqTip}>Consejo: fuentes sin serifa (Arial, Inter) y tamaño mínimo de 16px reducen la fatiga en pantalla.</span>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Qué técnicas existen para aumentar la velocidad de lectura?</h4>
                <p>
                  Las principales son: <strong>chunking</strong> (leer grupos de palabras en vez de una a una), <strong>fijación ocular</strong> (reducir regresiones volviendo al inicio de línea), <strong>skimming</strong> (escanear subtítulos y primera frase de cada párrafo) y <strong>eliminar la subvocalización</strong> (el hábito de &quot;decirse&quot; las palabras mentalmente). Con práctica constante se puede pasar de 238 a 350+ ppm sin perder comprensión.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿El tiempo de lectura influye en la tasa de rebote?</h4>
                <p>
                  Directamente. Usuarios que llegan a un artículo de 15 minutos esperando 3 abandonan rápido, disparando la tasa de rebote. Mostrar el tiempo de lectura en el encabezado filtra visitantes con poco tiempo y retiene a los que sí quieren profundizar. Blogs como Moz y Backlinko reportan reducciones del 15-20% en tasa de rebote tras añadir el indicador.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Cuántas palabras por minuto se leen en voz alta vs. en silencio?</h4>
                <p>
                  La lectura en voz alta (presentaciones, podcasts grabados, audiolibros) ronda las 130-160 ppm, muy cerca de la velocidad del habla natural. La lectura silenciosa duplica o triplica esa cifra: 200-350 ppm en adultos. Por eso el tiempo de escucha de un texto siempre es considerablemente mayor que el de lectura.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Cómo mejoran los subtítulos e imágenes el tiempo de lectura percibido?</h4>
                <p>
                  Los subtítulos (H2, H3) actúan como &quot;puntos de entrada&quot; que permiten al lector retomar el hilo tras una pausa, reduciendo el abandono. Las imágenes crean micro-descansos visuales que reducen la fatiga lectora. Un artículo de 2.000 palabras con 4 subtítulos y 3 imágenes se percibe subjetivamente como un 30% más corto que el mismo texto sin ellos.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Guía Paso a Paso */}
          <section className={styles.eduSection}>
            <h2>Cómo optimizar tu contenido según el tiempo de lectura estimado</h2>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <span className={styles.stepNumber}>1</span>
                <div className={styles.stepContent}>
                  <h4>Pega o escribe tu borrador completo</h4>
                  <p>Introduce todo el texto, incluyendo introducción, cuerpo y conclusión. No filtres nada todavía; necesitas la estimación real del borrador.</p>
                </div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>2</span>
                <div className={styles.stepContent}>
                  <h4>Selecciona la velocidad de tu audiencia objetivo</h4>
                  <p>Usa &quot;Lento&quot; (150 ppm) para textos técnicos o académicos, &quot;Normal&quot; (200 ppm) para blogs generalistas y &quot;Rápido&quot; (250 ppm) para contenido muy estructurado con bullets y subtítulos.</p>
                </div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>3</span>
                <div className={styles.stepContent}>
                  <h4>Compara el resultado con el objetivo del canal</h4>
                  <p>Redes sociales: menos de 1 min. Newsletter: 1-3 min. Blog post estándar: 5-8 min. Guía completa o pilar de SEO: 10-20 min. Si el tiempo no encaja, ajusta el contenido.</p>
                </div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>4</span>
                <div className={styles.stepContent}>
                  <h4>Revisa la densidad del texto</h4>
                  <p>Si la herramienta marca &quot;Denso&quot; (más de 25 palabras por oración), divide las oraciones largas. Textos densos ralentizan la lectura y aumentan la fatiga. Objetivo: 15-20 palabras por oración de media.</p>
                </div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>5</span>
                <div className={styles.stepContent}>
                  <h4>Añade o reduce contenido según la brecha</h4>
                  <p>Si te faltan 2 minutos para llegar al objetivo, añade ejemplos, datos o una sección de preguntas frecuentes. Si sobran, elimina la información redundante o divídelo en una serie de artículos.</p>
                </div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>6</span>
                <div className={styles.stepContent}>
                  <h4>Genera el badge y añádelo al encabezado</h4>
                  <p>Usa el botón &quot;Copiar badge&quot; para obtener el texto &quot;⏱️ X min de lectura&quot;. Colócalo en el encabezado del artículo, justo debajo del título o del autor. Mejora el CTR y reduce la tasa de rebote.</p>
                </div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>7</span>
                <div className={styles.stepContent}>
                  <h4>Mide el impacto en Google Analytics o Search Console</h4>
                  <p>Tras publicar, compara el tiempo en página antes y después de mostrar el badge. En la mayoría de blogs el tiempo medio en página aumenta entre un 15% y un 40% en los primeros 30 días.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Mejores Prácticas */}
          <section className={styles.eduSection}>
            <h2>Mejores prácticas para redactores y bloggers</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>⏱️</span>
                <h4>Muestra el tiempo en artículos largos</h4>
                <p>A partir de 3 minutos (~700 palabras) el badge aporta valor real. Por debajo, el usuario ya intuye que es breve y el indicador no mejora métricas.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📏</span>
                <h4>Párrafos cortos = tiempo percibido menor</h4>
                <p>Párrafos de 3-4 líneas hacen que el mismo contenido se perciba más rápido de leer. El lector ve &quot;espacio en blanco&quot; y avanza con menos resistencia.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🖼️</span>
                <h4>Imágenes que reducen la fatiga lectora</h4>
                <p>Una imagen cada 300-400 palabras crea pausas visuales naturales. Los lectores retoman el texto más descansados y leen más tiempo seguido.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🔤</span>
                <h4>Subtítulos para navegación y retención</h4>
                <p>Los H2 y H3 permiten al lector orientarse y retomar el artículo desde donde lo dejó. Cada 400-500 palabras debería haber un nuevo subtítulo descriptivo.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📱</span>
                <h4>Adapta la longitud al canal</h4>
                <p>El mismo contenido funciona diferente en LinkedIn (900 palabras óptimo), blog (1.500-2.500), newsletter (200-500) y Twitter/X (280 caracteres por tweet).</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🎯</span>
                <h4>Velocidad 238 ppm como referencia estándar</h4>
                <p>Para contenido generalista en España, usa 238 ppm (velocidad media adulto español) como base de cálculo. Ajusta a 150 ppm para textos técnicos o audiencias con menor fluidez lectora.</p>
              </div>
            </div>
          </section>

          {/* 6. Warning Box */}
          <section className={styles.eduSection}>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon}>⚠️</span>
                <h4>Errores comunes al calcular el tiempo de lectura</h4>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>No mostrar el tiempo en artículos largos.</strong> El 68% de los lectores abandona artículos de más de 10 minutos si no saben de antemano cuánto duran. El badge reduce este abandono prematuro.
                </li>
                <li>
                  <strong>Calcular mal por incluir código, tablas o listas muy largas.</strong> Los bloques de código y tablas de datos se leen mucho más despacio que el texto normal. Si tu artículo tiene mucho código, añade un 30-50% al tiempo calculado.
                </li>
                <li>
                  <strong>Ignorar la lectura en móvil.</strong> El 60% del tráfico en blogs españoles es móvil. En pantallas pequeñas la velocidad de lectura baja un 15-20% adicional por el scroll continuo y el tamaño de fuente.
                </li>
                <li>
                  <strong>Usar velocidades poco realistas (400-500 ppm como &quot;normal&quot;).</strong> Sobreestimar la velocidad da tiempos irrisorios que engañan al lector. Usa datos reales: 238 ppm para adultos en castellano.
                </li>
                <li>
                  <strong>No adaptar la longitud al canal de distribución.</strong> Un artículo de 3.000 palabras perfecto para SEO puede ser inadecuado para newsletter. Cada canal tiene su longitud óptima; no copies el mismo texto sin ajustar.
                </li>
                <li>
                  <strong>Confundir tiempo de lectura con tiempo en página.</strong> El tiempo en página de Analytics incluye tiempo inactivo (usuario ha dejado la pestaña abierta). El tiempo de lectura real calculado aquí es el tiempo de lectura activa, siempre menor que el tiempo en página promedio.
                </li>
              </ul>
            </div>
          </section>

          {/* Sección original: Consejos */}
          <section className={styles.eduSection}>
            <h2>Consejos adicionales para optimizar tu contenido</h2>
            <ul className={styles.tipsList}>
              <li><strong>Usa subtítulos:</strong> Permiten escanear el contenido rápidamente</li>
              <li><strong>Párrafos cortos:</strong> 3-4 oraciones máximo mejoran la legibilidad</li>
              <li><strong>Listas y viñetas:</strong> Facilitan la absorción de información</li>
              <li><strong>Imágenes relevantes:</strong> Rompen el texto y mantienen la atención</li>
              <li><strong>Resumen inicial:</strong> Da contexto antes de profundizar</li>
              <li><strong>CTA claro:</strong> Indica al lector qué hacer después</li>
            </ul>
          </section>

        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-tiempo-lectura')} />

      <ShareCard appName="calculadora-tiempo-lectura" />
      <Footer appName="calculadora-tiempo-lectura" />
    </div>
  );
}
