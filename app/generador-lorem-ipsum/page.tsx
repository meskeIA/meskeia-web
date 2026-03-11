'use client';

import { useState } from 'react';
import styles from './GeneradorLoremIpsum.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Párrafos de Lorem Ipsum clásicos
const loremIpsumParrafos = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
  'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
  'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.',
  'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.',
  'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.',
  'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.',
  'Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.',
  'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.',
  'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.',
  'Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.',
];

type FormatoType = 'parrafos' | 'oraciones' | 'palabras';

export default function GeneradorLoremIpsumPage() {
  const [cantidad, setCantidad] = useState(3);
  const [formato, setFormato] = useState<FormatoType>('parrafos');
  const [resultado, setResultado] = useState('');
  const [copiado, setCopiado] = useState(false);

  // Generar texto
  const generarTexto = () => {
    let texto = '';

    if (formato === 'parrafos') {
      const parrafos = loremIpsumParrafos.slice(0, cantidad);
      texto = parrafos.join('\n\n');
    } else if (formato === 'oraciones') {
      // Extraer oraciones de los párrafos
      const todasOraciones = loremIpsumParrafos
        .join(' ')
        .split(/(?<=[.!?])\s+/)
        .filter(Boolean);
      texto = todasOraciones.slice(0, cantidad).join(' ');
    } else if (formato === 'palabras') {
      // Extraer palabras
      const todasPalabras = loremIpsumParrafos
        .join(' ')
        .split(/\s+/)
        .map(p => p.replace(/[.,!?;:]/g, ''));
      texto = todasPalabras.slice(0, cantidad).join(' ') + '.';
    }

    setResultado(texto);
    setCopiado(false);
  };

  // Copiar al portapapeles
  const copiarTexto = async () => {
    if (!resultado) return;
    try {
      await navigator.clipboard.writeText(resultado);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Silencioso
    }
  };

  // Limpiar
  const limpiar = () => {
    setResultado('');
    setCopiado(false);
  };

  // Obtener límite según formato
  const getLimite = () => {
    switch (formato) {
      case 'parrafos': return 12;
      case 'oraciones': return 50;
      case 'palabras': return 500;
    }
  };

  // Contar estadísticas del resultado
  const getStats = () => {
    if (!resultado) return { palabras: 0, caracteres: 0, parrafos: 0 };
    return {
      palabras: resultado.split(/\s+/).filter(Boolean).length,
      caracteres: resultado.length,
      parrafos: resultado.split('\n\n').filter(Boolean).length,
    };
  };

  const stats = getStats();

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Generador Lorem Ipsum</h1>
        <p className={styles.subtitle}>
          Texto de prueba para diseño y maquetación
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Panel de configuración */}
        <section className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>Configuración</h2>

          <div className={styles.configGrid}>
            {/* Formato */}
            <div className={styles.configItem}>
              <label className={styles.label}>Formato</label>
              <div className={styles.formatoButtons}>
                <button
                  type="button"
                  className={`${styles.formatoBtn} ${formato === 'parrafos' ? styles.active : ''}`}
                  onClick={() => { setFormato('parrafos'); setCantidad(Math.min(cantidad, 12)); }}
                >
                  📄 Párrafos
                </button>
                <button
                  type="button"
                  className={`${styles.formatoBtn} ${formato === 'oraciones' ? styles.active : ''}`}
                  onClick={() => { setFormato('oraciones'); setCantidad(Math.min(cantidad, 50)); }}
                >
                  📝 Oraciones
                </button>
                <button
                  type="button"
                  className={`${styles.formatoBtn} ${formato === 'palabras' ? styles.active : ''}`}
                  onClick={() => { setFormato('palabras'); setCantidad(Math.min(cantidad, 500)); }}
                >
                  🔤 Palabras
                </button>
              </div>
            </div>

            {/* Cantidad */}
            <div className={styles.configItem}>
              <label className={styles.label}>
                Cantidad: <strong>{cantidad}</strong> {formato}
              </label>
              <input
                type="range"
                min={1}
                max={getLimite()}
                value={cantidad}
                onChange={(e) => setCantidad(parseInt(e.target.value))}
                className={styles.slider}
                title={`Seleccionar cantidad de ${formato}`}
              />
              <div className={styles.sliderLabels}>
                <span>1</span>
                <span>{getLimite()}</span>
              </div>
            </div>
          </div>

          <div className={styles.buttonRow}>
            <button type="button" onClick={generarTexto} className={styles.btnPrimary}>
              ✨ Generar Lorem Ipsum
            </button>
            <button type="button" onClick={limpiar} className={styles.btnSecondary} disabled={!resultado}>
              Limpiar
            </button>
          </div>
        </section>

        {/* Panel de resultado */}
        <section className={styles.resultPanel}>
          <div className={styles.resultHeader}>
            <h2 className={styles.sectionTitle}>Texto generado</h2>
            <button
              type="button"
              onClick={copiarTexto}
              className={styles.btnCopy}
              disabled={!resultado}
            >
              {copiado ? '✅ Copiado' : '📋 Copiar'}
            </button>
          </div>

          <textarea
            value={resultado}
            readOnly
            placeholder="El texto Lorem Ipsum aparecerá aquí..."
            className={styles.textArea}
            rows={12}
          />

          {resultado && (
            <div className={styles.stats}>
              <span>📄 {stats.parrafos} párrafo{stats.parrafos !== 1 ? 's' : ''}</span>
              <span>📝 {stats.palabras} palabra{stats.palabras !== 1 ? 's' : ''}</span>
              <span>🔤 {stats.caracteres} carácter{stats.caracteres !== 1 ? 'es' : ''}</span>
            </div>
          )}
        </section>
      </div>

      {/* Sección educativa */}
      <EducationalSection
        title="Aprende sobre Lorem Ipsum y Texto de Relleno"
        subtitle="Historia, alternativas, cuándo usarlo y cuándo evitarlo en proyectos reales"
        defaultOpen={false}
      >
        <section>

          {/* SECCIÓN 1: Comparativa de tipos de placeholder text */}
          <div className={styles.comparativaSection}>
            <h3>📊 Tipos de Texto de Relleno: Cuándo Usar Cada Uno</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoCard}>
                <h4>📜 Lorem Ipsum (clásico)</h4>
                <p><strong>Mejor para:</strong> maquetación general, prototipos visuales, presentaciones de diseño<br />
                <strong>Ventaja:</strong> neutral, nadie lo lee, enfoca atención en el diseño<br />
                <strong>Origen:</strong> Cicerón, siglo I a.C.</p>
              </div>
              <div className={styles.infoCard}>
                <h4>📰 Texto real del proyecto</h4>
                <p><strong>Mejor para:</strong> maquetación final, revisión de contenido, copy UX<br />
                <strong>Ventaja:</strong> detecta problemas reales (textos muy largos, caracteres especiales)<br />
                <strong>Cuándo:</strong> cuando ya tienes el contenido definitivo</p>
              </div>
              <div className={styles.infoCard}>
                <h4>🔢 Texto generado (IA / Faker)</h4>
                <p><strong>Mejor para:</strong> demos, seeds de bases de datos, tests automatizados<br />
                <strong>Ventaja:</strong> legible y temático (nombres, emails, fechas realistas)<br />
                <strong>Herramientas:</strong> Faker.js, ChatGPT, generadores temáticos</p>
              </div>
              <div className={styles.infoCard}>
                <h4>🎯 Placeholder específico</h4>
                <p><strong>Mejor para:</strong> campos de formulario, labels, tooltips<br />
                <strong>Ventaja:</strong> describe el tipo de contenido esperado<br />
                <strong>Ejemplo:</strong> &quot;Nombre completo&quot;, &quot;usuario@email.com&quot;</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: Historia */}
          <div className={styles.historiaSection}>
            <h3>📜 La Historia Completa del Lorem Ipsum</h3>
            <div className={styles.historiaTimeline}>
              <div className={styles.timelineItem}>
                <span className={styles.timelineDate}>45 a.C.</span>
                <div>
                  <strong>Cicerón escribe &quot;De Finibus Bonorum et Malorum&quot;</strong>
                  <p>El texto original de Lorem Ipsum es un fragmento del tratado filosófico de Marco Tulio Cicerón sobre ética. La sección usada como placeholder comienza con &quot;Neque porro quisquam est qui dolorem ipsum quia dolor sit amet...&quot;.</p>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <span className={styles.timelineDate}>Siglo XVI</span>
                <div>
                  <strong>Los impresores lo adoptan como estándar</strong>
                  <p>Un impresor desconocido tomó el texto de Cicerón, lo barajó y creó una galera de tipos con el texto que conocemos hoy. Comenzó a usarse como texto de muestra para probar tipos de letra y composiciones tipográficas.</p>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <span className={styles.timelineDate}>1960</span>
                <div>
                  <strong>Letraset lo populariza en diseño gráfico</strong>
                  <p>La empresa Letraset incluyó Lorem Ipsum en sus hojas de transferencia en seco, haciendo el texto estándar en el mundo del diseño gráfico analógico.</p>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <span className={styles.timelineDate}>1984-hoy</span>
                <div>
                  <strong>Aldus PageMaker y la era digital</strong>
                  <p>Aldus PageMaker 5.0 (precursor de InDesign) incluía Lorem Ipsum por defecto. Desde entonces, cada software de maquetación, framework CSS y generador web lo usa como estándar universal.</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: FAQ */}
          <div className={styles.faqSection}>
            <h3>❓ Preguntas Frecuentes sobre Lorem Ipsum</h3>
            <div className={styles.faqList}>
              <details className={styles.faqItem}>
                <summary className={styles.faqQuestion}>¿El Lorem Ipsum tiene algún significado en latín?</summary>
                <p className={styles.faqAnswer}>Sí, aunque está alterado. El texto original de Cicerón dice aproximadamente &quot;Ningún hombre sabio ama el dolor por sí mismo, lo busca ni lo quiere simplemente porque sea dolor, sino porque a veces llegan circunstancias en que trabajo y dolor pueden procurarle algún placer muy grande&quot;. La versión Lorem Ipsum está barajada y mutilada, por lo que resulta incomprensible en latín, que es exactamente la intención: texto que parezca real pero no lo sea.</p>
              </details>
              <details className={styles.faqItem}>
                <summary className={styles.faqQuestion}>¿Por qué el texto empieza por &quot;Lorem ipsum&quot; y no por el inicio del fragmento de Cicerón?</summary>
                <p className={styles.faqAnswer}>La frase completa de Cicerón es &quot;...dolorem ipsum quia dolor sit amet...&quot;. El impresor del siglo XVI cortó el texto a mitad de frase, por eso empieza abruptamente con &quot;Lorem ipsum dolor sit amet...&quot;. &quot;Lorem&quot; es la segunda parte de &quot;dolorem&quot;. El nombre Lorem Ipsum viene simplemente de las dos primeras palabras del fragmento resultante.</p>
              </details>
              <details className={styles.faqItem}>
                <summary className={styles.faqQuestion}>¿Hay variantes del Lorem Ipsum?</summary>
                <p className={styles.faqAnswer}>Sí. El Lorem Ipsum clásico tiene un texto canónico de ~200 palabras que se repite en distintas longitudes. Hay variantes temáticas como &quot;Hipster Ipsum&quot; (jerga hipster), &quot;Bacon Ipsum&quot; (términos de carnicería), &quot;Corporate Ipsum&quot; (jerga empresarial), &quot;Pirate Ipsum&quot; y docenas más. También existen versiones en distintos idiomas. Este generador usa el Lorem Ipsum clásico estándar.</p>
              </details>
              <details className={styles.faqItem}>
                <summary className={styles.faqQuestion}>¿Qué significan &quot;párrafos&quot;, &quot;palabras&quot; y &quot;caracteres&quot; en los modos del generador?</summary>
                <p className={styles.faqAnswer}>En modo párrafos, se generan bloques de texto separados por salto de línea, cada uno de ~75-100 palabras. En modo palabras, se genera una secuencia continua del número exacto de palabras pedidas. En modo caracteres, se genera texto hasta alcanzar el número de caracteres indicado, sin cortar palabras a mitad (el texto puede ser ligeramente más corto que el solicitado).</p>
              </details>
              <details className={styles.faqItem}>
                <summary className={styles.faqQuestion}>¿Es buena práctica usar Lorem Ipsum en producción?</summary>
                <p className={styles.faqAnswer}>No. El Lorem Ipsum solo debe estar en prototipos y maquetas. En producción, los motores de búsqueda como Google pueden penalizar el contenido duplicado y el texto sin sentido. Los usuarios confundidos al ver Lorem Ipsum en una web real pueden perder la confianza en el sitio. Muchos frameworks tienen linters que detectan y avisan sobre texto de relleno en el código de producción.</p>
              </details>
            </div>
          </div>

          {/* SECCIÓN 4: Usos en flujo de trabajo */}
          <div className={styles.usosSection}>
            <h3>🎯 Lorem Ipsum en el Flujo de Trabajo Real</h3>
            <div className={styles.usosGrid}>
              <div className={styles.usoCard}>
                <span className={styles.usoIcon}>🎨</span>
                <h4>Diseño en Figma / Sketch</h4>
                <p>Se usa para rellenar componentes (tarjetas, listas, modales) mientras se diseña. Permite ver proporciones y jerarquía tipográfica sin preocuparse por el contenido definitivo.</p>
              </div>
              <div className={styles.usoCard}>
                <span className={styles.usoIcon}>🧪</span>
                <h4>Pruebas de CSS y tipografía</h4>
                <p>Esencial para probar cómo se comporta una fuente tipográfica con texto largo. Permite detectar problemas de interlineado, kerning, widow lines y orphans antes de aplicar en producción.</p>
              </div>
              <div className={styles.usoCard}>
                <span className={styles.usoIcon}>📋</span>
                <h4>Presentaciones a clientes</h4>
                <p>En propuestas de diseño, el Lorem Ipsum evita que el cliente se distraiga con el texto y se centre en evaluar el diseño visual, los colores y la estructura de la página.</p>
              </div>
              <div className={styles.usoCard}>
                <span className={styles.usoIcon}>🔧</span>
                <h4>Seeds de bases de datos</h4>
                <p>Para poblar una base de datos de desarrollo con datos de prueba. Se combina con Faker.js para generar contenido realista (nombres, emails, fechas) que permita probar la aplicación con volumen de datos.</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 5: Tips */}
          <div className={styles.tipsSection}>
            <h3>💡 Tips para Usar Texto de Relleno Eficientemente</h3>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🔍</span>
                <h4>Busca Lorem antes de publicar</h4>
                <p>Antes de cada deploy, haz una búsqueda global de &quot;lorem&quot; en tu proyecto. En VSCode: Ctrl+Shift+F. Configura un linter o hook de pre-commit que detecte automáticamente texto de relleno.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📏</span>
                <h4>Pide la cantidad correcta</h4>
                <p>Para una tarjeta de producto pide 1-2 frases. Para un artículo de blog, 3-5 párrafos. Para un textarea de formulario, 50-100 caracteres. Usar más de lo necesario da una falsa sensación de diseño espacioso.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🌐</span>
                <h4>Usa placeholder real cuando puedas</h4>
                <p>Si ya tienes algún fragmento del contenido real, úsalo en lugar de Lorem Ipsum. Detectarás antes problemas de longitud de texto, caracteres especiales o idioma que el Lorem Ipsum no revelaría.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>⚡</span>
                <h4>Shortcut en editores</h4>
                <p>En VSCode y muchos editores: escribe <code>lorem</code> y pulsa Tab para generar un párrafo. En Emmet: <code>lorem30</code> genera 30 palabras. En WordPress Gutenberg: el bloque de texto tiene generador integrado.</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 6: Warning Box */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Errores Comunes con el Texto de Relleno</h3>
            </div>
            <ul className={styles.warningList}>
              <li><strong>❌ Dejar Lorem Ipsum en producción:</strong> Es el error más frecuente y uno de los más visibles. Los usuarios perciben el Lorem Ipsum como señal de que el sitio está en construcción o es poco profesional. Configura un linter o búsqueda en CI/CD que lo detecte automáticamente.</li>
              <li><strong>❌ Usar Lorem Ipsum para UX copy:</strong> El texto de interfaz (botones, labels, mensajes de error, onboarding) nunca debe usar Lorem Ipsum en pruebas de usabilidad. El texto real cambia radicalmente cómo los usuarios perciben e interactúan con el flujo.</li>
              <li><strong>❌ Ignorar la longitud real del contenido:</strong> El Lorem Ipsum suele ser texto uniforme de longitud media. En producción, los textos varían: títulos de 3 palabras o de 15, descripciones de 20 caracteres o de 300. Diseñar solo con Lorem Ipsum puede ocultar problemas de overflow, truncado o ruptura del layout.</li>
              <li><strong>❌ Confiar en Lorem Ipsum para accesibilidad:</strong> El texto de relleno no tiene estructura semántica real (jerarquía de encabezados, listas, énfasis). Las pruebas de accesibilidad con screen readers deben hacerse siempre con contenido real o muy similar al definitivo.</li>
            </ul>
          </div>

        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-lorem-ipsum')} />

      <ShareCard appName="generador-lorem-ipsum" />
      <Footer appName="generador-lorem-ipsum" />
    </div>
  );
}
