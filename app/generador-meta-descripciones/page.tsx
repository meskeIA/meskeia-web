'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import styles from './GeneradorMetaDescripciones.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard,
  DisclaimerCard,
} from '@/components';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';

const PLANTILLAS = {
  producto: {
    nombre: 'Producto/Servicio',
    icono: '🛍️',
    plantilla: 'Descubre [PRODUCTO] de alta calidad. [BENEFICIO PRINCIPAL]. ✓ Envío gratis ✓ Garantía incluida. ¡Compra ahora!',
    ejemplo: 'Descubre zapatillas running Nike Air Max. Máxima amortiguación y comodidad. ✓ Envío gratis ✓ Garantía 2 años. ¡Compra ahora!',
  },
  blog: {
    nombre: 'Artículo/Blog',
    icono: '📝',
    plantilla: '[TÍTULO DEL ARTÍCULO]: Aprende [QUÉ APRENDERÁ]. Guía completa con [NÚMERO] consejos prácticos. ¡Lee ahora!',
    ejemplo: 'Cómo ahorrar dinero en 2025: Aprende técnicas probadas para reducir gastos. Guía completa con 15 consejos prácticos. ¡Lee ahora!',
  },
  landing: {
    nombre: 'Landing Page',
    icono: '🎯',
    plantilla: '[PROPUESTA DE VALOR ÚNICA]. [BENEFICIO CLAVE] en [TIEMPO/CONDICIÓN]. Únete a [NÚMERO]+ usuarios satisfechos.',
    ejemplo: 'Automatiza tu marketing digital sin código. Ahorra 10 horas/semana con nuestra plataforma. Únete a 50.000+ usuarios satisfechos.',
  },
  local: {
    nombre: 'Negocio Local',
    icono: '📍',
    plantilla: '[SERVICIO] en [CIUDAD]. [AÑOS] años de experiencia. ⭐ Valoración 5 estrellas. Presupuesto sin compromiso. ☎️ Llámanos',
    ejemplo: 'Fontanero urgente en Madrid. 20 años de experiencia. ⭐ Valoración 5 estrellas. Presupuesto sin compromiso. ☎️ Llámanos',
  },
  ecommerce: {
    nombre: 'Categoría E-commerce',
    icono: '🏪',
    plantilla: 'Compra [CATEGORÍA] online. [NÚMERO]+ productos ✓ Mejores marcas ✓ Precios competitivos ✓ Devolución fácil. ¡Entra ya!',
    ejemplo: 'Compra móviles libres online. 500+ productos ✓ Mejores marcas ✓ Precios competitivos ✓ Devolución 30 días. ¡Entra ya!',
  },
  comparativa: {
    nombre: 'Comparativa/Review',
    icono: '⚖️',
    plantilla: '[PRODUCTO A] vs [PRODUCTO B]: Comparativa [AÑO]. Analizamos [ASPECTOS]. Descubre cuál es mejor para ti.',
    ejemplo: 'iPhone 15 vs Samsung S24: Comparativa 2025. Analizamos cámara, batería y rendimiento. Descubre cuál es mejor para ti.',
  },
};

const LIMITE_CARACTERES = {
  minimo: 120,
  optimo: 155,
  maximo: 160,
};

export default function GeneradorMetaDescripcionesPage() {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [url, setUrl] = useState('https://ejemplo.com/pagina');
  const [plantillaActiva, setPlantillaActiva] = useState<string | null>(null);
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [htmlExpanded, setHtmlExpanded] = useState(false);

  const analisis = useMemo(() => {
    const longitud = descripcion.length;
    let estado: 'corto' | 'optimo' | 'largo' | 'vacio' = 'vacio';
    let mensaje = '';
    let porcentaje = 0;

    if (longitud === 0) {
      estado = 'vacio';
      mensaje = 'Escribe tu meta descripción';
      porcentaje = 0;
    } else if (longitud < LIMITE_CARACTERES.minimo) {
      estado = 'corto';
      mensaje = `Muy corta. Añade ${LIMITE_CARACTERES.minimo - longitud} caracteres más`;
      porcentaje = (longitud / LIMITE_CARACTERES.optimo) * 100;
    } else if (longitud <= LIMITE_CARACTERES.maximo) {
      estado = 'optimo';
      mensaje = '¡Longitud perfecta!';
      porcentaje = (longitud / LIMITE_CARACTERES.maximo) * 100;
    } else {
      estado = 'largo';
      mensaje = `Demasiado larga. Elimina ${longitud - LIMITE_CARACTERES.maximo} caracteres`;
      porcentaje = 100;
    }

    // Análisis de contenido
    const tieneCallToAction = /compra|descubre|aprende|únete|entra|llama|obtén|prueba|empieza/i.test(descripcion);
    const tieneNumeros = /\d+/.test(descripcion);
    const tieneEmojis = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|✓|⭐|☎️/u.test(descripcion);
    const tieneBeneficios = /gratis|garantía|fácil|rápido|mejor|ahorro|descuento|oferta/i.test(descripcion);

    return {
      longitud,
      estado,
      mensaje,
      porcentaje,
      tieneCallToAction,
      tieneNumeros,
      tieneEmojis,
      tieneBeneficios,
    };
  }, [descripcion]);

  const aplicarPlantilla = (key: string) => {
    const plantilla = PLANTILLAS[key as keyof typeof PLANTILLAS];
    setDescripcion(plantilla.ejemplo);
    setPlantillaActiva(key);
  };

  const copiarDescripcion = async () => {
    try {
      await navigator.clipboard.writeText(descripcion);
      alert('✅ Meta descripción copiada al portapapeles');
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = descripcion;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('✅ Meta descripción copiada');
    }
  };

  const copiarHTML = async () => {
    const html = `<meta name="description" content="${descripcion.replace(/"/g, '&quot;')}">`;
    try {
      await navigator.clipboard.writeText(html);
      alert('✅ Código HTML copiado al portapapeles');
    } catch {
      alert('Error al copiar. Copia manualmente el código.');
    }
  };

  const generarCodigoHTML = useCallback(() => {
    if (!descripcion) {
      setHtmlCode('');
      return;
    }

    const escapedDescription = descripcion.replace(/"/g, '&quot;');
    const escapedTitle = titulo || 'Título de tu página';
    const escapedUrl = url || 'https://ejemplo.com';

    let codigo = '<!-- Meta descripción generada con meskeIA -->\n\n';
    codigo += '<!-- Implementación básica -->\n';
    codigo += '<head>\n';
    codigo += `  <title>${escapedTitle}</title>\n`;
    codigo += `  <meta name="description" content="${escapedDescription}">\n`;
    codigo += '  <meta charset="UTF-8">\n';
    codigo += '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
    codigo += '</head>\n\n';

    codigo += '<!-- Open Graph (Facebook, LinkedIn) -->\n';
    codigo += '<meta property="og:title" content="' + escapedTitle + '">\n';
    codigo += '<meta property="og:description" content="' + escapedDescription + '">\n';
    codigo += '<meta property="og:url" content="' + escapedUrl + '">\n';
    codigo += '<meta property="og:type" content="website">\n\n';

    codigo += '<!-- Twitter Card -->\n';
    codigo += '<meta name="twitter:card" content="summary_large_image">\n';
    codigo += '<meta name="twitter:title" content="' + escapedTitle + '">\n';
    codigo += '<meta name="twitter:description" content="' + escapedDescription + '">\n\n';

    codigo += '<!-- Next.js/React (metadata.ts) -->\n';
    codigo += 'export const metadata = {\n';
    codigo += '  title: "' + escapedTitle + '",\n';
    codigo += '  description: "' + escapedDescription + '",\n';
    codigo += '  openGraph: {\n';
    codigo += '    title: "' + escapedTitle + '",\n';
    codigo += '    description: "' + escapedDescription + '",\n';
    codigo += '    url: "' + escapedUrl + '",\n';
    codigo += '  },\n';
    codigo += '};';

    setHtmlCode(codigo);
  }, [descripcion, titulo, url]);

  const copiarCodigoHTML = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      alert('✅ Código HTML completo copiado al portapapeles');
    } catch {
      alert('Error al copiar. Copia manualmente el código.');
    }
  };

  // Auto-generar código HTML cuando cambie la descripción
  useEffect(() => {
    generarCodigoHTML();
  }, [generarCodigoHTML]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🔍 Generador de Meta Descripciones</h1>
        <p className={styles.subtitle}>
          Crea meta descripciones optimizadas para SEO con vista previa de Google
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="technical"
        severity="medium"
        collapsible={true}
        context="generador-meta-descripciones-disclaimer"
      />

      <div className={styles.mainContent}>
        {/* Panel de edición */}
        <div className={styles.editorPanel}>
          <h2 className={styles.panelTitle}>✏️ Editor</h2>

          {/* Plantillas */}
          <div className={styles.templatesSection}>
            <label className={styles.label}>Plantillas rápidas</label>
            <div className={styles.templatesGrid}>
              {Object.entries(PLANTILLAS).map(([key, plantilla]) => (
                <button
                  key={key}
                  onClick={() => aplicarPlantilla(key)}
                  className={`${styles.templateBtn} ${plantillaActiva === key ? styles.active : ''}`}
                >
                  <span className={styles.templateIcon}>{plantilla.icono}</span>
                  <span>{plantilla.nombre}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Título (opcional) */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Título de la página (para vista previa)
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Mi Página - Nombre del Sitio"
              className={styles.input}
              maxLength={60}
            />
            <span className={styles.charCount}>{titulo.length}/60</span>
          </div>

          {/* URL (opcional) */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>URL (para vista previa)</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://ejemplo.com/pagina"
              className={styles.input}
            />
          </div>

          {/* Meta descripción */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Meta Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => {
                setDescripcion(e.target.value);
                setPlantillaActiva(null);
              }}
              placeholder="Escribe aquí tu meta descripción optimizada para SEO..."
              className={styles.textarea}
              rows={4}
            />
            <div className={styles.charCountBar}>
              <div
                className={`${styles.charProgress} ${styles[analisis.estado]}`}
                style={{ width: `${Math.min(analisis.porcentaje, 100)}%` }}
              />
            </div>
            <div className={styles.charInfo}>
              <span className={`${styles.charStatus} ${styles[analisis.estado]}`}>
                {analisis.mensaje}
              </span>
              <span className={styles.charNumbers}>
                {analisis.longitud}/{LIMITE_CARACTERES.maximo}
              </span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className={styles.actions}>
            <button onClick={copiarDescripcion} className={styles.btnPrimary} disabled={!descripcion}>
              📋 Copiar descripción
            </button>
            <button onClick={copiarHTML} className={styles.btnSecondary} disabled={!descripcion}>
              {'<>'} Copiar HTML
            </button>
          </div>
        </div>

        {/* Panel de vista previa */}
        <div className={styles.previewPanel}>
          <h2 className={styles.panelTitle}>👁️ Vista Previa en Google</h2>

          {/* SERP Preview */}
          <div className={styles.serpPreview}>
            <div className={styles.serpTitle}>
              {titulo || 'Título de tu página - Nombre del sitio'}
            </div>
            <div className={styles.serpUrl}>
              {url || 'https://ejemplo.com/pagina'}
            </div>
            <div className={styles.serpDescription}>
              {descripcion || 'Tu meta descripción aparecerá aquí. Escribe un texto atractivo que invite al usuario a hacer clic...'}
              {analisis.longitud > LIMITE_CARACTERES.maximo && (
                <span className={styles.truncated}>...</span>
              )}
            </div>
          </div>

          {/* Checklist SEO */}
          <div className={styles.checklistSection}>
            <h3 className={styles.checklistTitle}>✅ Checklist SEO</h3>
            <div className={styles.checklist}>
              <div className={`${styles.checkItem} ${analisis.estado === 'optimo' ? styles.passed : styles.failed}`}>
                <span className={styles.checkIcon}>{analisis.estado === 'optimo' ? '✓' : '✗'}</span>
                <span>Longitud óptima (120-160 caracteres)</span>
              </div>
              <div className={`${styles.checkItem} ${analisis.tieneCallToAction ? styles.passed : styles.failed}`}>
                <span className={styles.checkIcon}>{analisis.tieneCallToAction ? '✓' : '✗'}</span>
                <span>Incluye llamada a la acción (CTA)</span>
              </div>
              <div className={`${styles.checkItem} ${analisis.tieneNumeros ? styles.passed : styles.failed}`}>
                <span className={styles.checkIcon}>{analisis.tieneNumeros ? '✓' : '✗'}</span>
                <span>Contiene números (mejora CTR)</span>
              </div>
              <div className={`${styles.checkItem} ${analisis.tieneBeneficios ? styles.passed : styles.failed}`}>
                <span className={styles.checkIcon}>{analisis.tieneBeneficios ? '✓' : '✗'}</span>
                <span>Menciona beneficios clave</span>
              </div>
              <div className={`${styles.checkItem} ${analisis.tieneEmojis ? styles.passed : styles.warning}`}>
                <span className={styles.checkIcon}>{analisis.tieneEmojis ? '✓' : '○'}</span>
                <span>Usa emojis/símbolos (opcional)</span>
              </div>
            </div>
          </div>

          {/* Código HTML colapsable */}
          {descripcion && htmlCode && (
            <div className={styles.codeSection}>
              <div className={styles.htmlHeader}>
                <h3 className={styles.codeTitle}>📄 Código HTML para implementar</h3>
                <button
                  type="button"
                  onClick={() => setHtmlExpanded(!htmlExpanded)}
                  className={styles.btnToggleCode}
                  aria-label={htmlExpanded ? 'Ocultar código' : 'Mostrar código'}
                >
                  {htmlExpanded ? '🔼 Ocultar código' : '🔽 Ver código completo'}
                </button>
              </div>
              {htmlExpanded && (
                <div className={styles.codeContainer}>
                  <pre className={styles.codeBlock}>
                    <code>{htmlCode}</code>
                  </pre>
                  <button type="button" onClick={copiarCodigoHTML} className={styles.btnCopyCode}>
                    📋 Copiar código completo
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="📚 Guía para Meta Descripciones Perfectas"
        subtitle="Mejores prácticas SEO para aumentar tu CTR en Google"
      >
        <div className={styles.educationalContent}>
          <section className={styles.eduSection}>
            <h2>¿Qué es una meta descripción?</h2>
            <p>
              La meta descripción es un fragmento de texto HTML que resume el contenido de una página web.
              Aunque no afecta directamente al ranking de Google, influye significativamente en el CTR
              (Click-Through Rate), ya que es lo que los usuarios leen en los resultados de búsqueda
              antes de decidir si hacen clic.
            </p>
          </section>

          {/* Tabla comparativa por tipo de página */}
          <section className={styles.eduSection}>
            <h2>📊 Comparativa: Estrategias por Tipo de Página</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Tipo de Página</th>
                    <th>Estrategia Recomendada</th>
                    <th>Elementos Clave</th>
                    <th>Evitar</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>🛍️ Producto/E-commerce</strong></td>
                    <td>Enfatizar beneficios y urgencia</td>
                    <td>Precio, descuento, envío gratis, garantía</td>
                    <td>Especificaciones técnicas excesivas</td>
                  </tr>
                  <tr>
                    <td><strong>📝 Blog/Artículo</strong></td>
                    <td>Destacar aprendizaje y valor</td>
                    <td>Número de consejos, guía completa, paso a paso</td>
                    <td>Clickbait engañoso</td>
                  </tr>
                  <tr>
                    <td><strong>🎯 Landing Page</strong></td>
                    <td>Propuesta de valor única (UVP)</td>
                    <td>Beneficio principal, número de usuarios, prueba social</td>
                    <td>Descripciones genéricas</td>
                  </tr>
                  <tr>
                    <td><strong>📍 Negocio Local</strong></td>
                    <td>Ubicación y confianza</td>
                    <td>Ciudad, años de experiencia, valoraciones, contacto</td>
                    <td>Información irrelevante para búsqueda local</td>
                  </tr>
                  <tr>
                    <td><strong>⚖️ Comparativa</strong></td>
                    <td>Análisis objetivo y actualización</td>
                    <td>Año actual, aspectos analizados, imparcialidad</td>
                    <td>Favorecer claramente una opción</td>
                  </tr>
                  <tr>
                    <td><strong>🏘️ Categoría</strong></td>
                    <td>Variedad y facilidad</td>
                    <td>Número de productos, marcas, devolución fácil</td>
                    <td>Mencionar productos específicos</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Casos de uso prácticos */}
          <section className={styles.eduSection}>
            <h2>💼 Casos de Uso Prácticos con Ejemplos</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🛍️</span>
                  <h3>E-commerce: Ficha de Producto</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p><strong>Ejemplo:</strong></p>
                  <code>
                    Descubre zapatillas running Nike Air Max 2024. Máxima amortiguación y comodidad.
                    ✓ Envío gratis ✓ Devolución 60 días ✓ Garantía 2 años. ¡Compra ahora!
                  </code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Por qué funciona:</strong> Incluye marca, beneficio principal, 3 garantías con checkmarks,
                  y CTA claro. Los emojis aumentan visibilidad en SERPs.
                </p>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>📝</span>
                  <h3>Blog: Artículo Educativo</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p><strong>Ejemplo:</strong></p>
                  <code>
                    Cómo ahorrar 500€/mes en 2026: Guía con 12 técnicas probadas para reducir gastos sin sacrificar
                    calidad de vida. Incluye plantilla gratuita. ¡Lee ahora!
                  </code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Por qué funciona:</strong> Promesa específica (500€/mes), año actual para SEO,
                  número concreto (12 técnicas), incentivo (plantilla gratuita).
                </p>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🎯</span>
                  <h3>SaaS: Landing Page</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p><strong>Ejemplo:</strong></p>
                  <code>
                    Automatiza tu email marketing sin código. Ahorra 10 horas/semana con segmentación IA.
                    Únete a 50.000+ empresas. Prueba gratuita 14 días.
                  </code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Por qué funciona:</strong> Beneficio claro (ahorro de tiempo), diferenciador (IA),
                  prueba social (50.000+ empresas), sin riesgo (prueba gratis).
                </p>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>📍</span>
                  <h3>Negocio Local: Servicio</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p><strong>Ejemplo:</strong></p>
                  <code>
                    Fontanero urgente 24h en Madrid Centro. 15 años de experiencia. ⭐ 4.9/5 (200+ reseñas).
                    Presupuesto sin compromiso. ☎️ Llámanos ahora: 900 123 456
                  </code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Por qué funciona:</strong> Ubicación específica (Madrid Centro), urgencia (24h),
                  valoraciones verificables, contacto directo visible.
                </p>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>⚖️</span>
                  <h3>Comparativa: Review</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p><strong>Ejemplo:</strong></p>
                  <code>
                    iPhone 15 Pro vs Samsung S24 Ultra: Comparativa 2026. Analizamos cámara, batería, rendimiento
                    y precio en 15 pruebas reales. Descubre cuál es mejor para ti.
                  </code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Por qué funciona:</strong> Año actualizado (2026), aspectos concretos analizados,
                  número de pruebas (credibilidad), enfoque imparcial ("cuál es mejor para ti").
                </p>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🏘️</span>
                  <h3>Categoría: E-commerce</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p><strong>Ejemplo:</strong></p>
                  <code>
                    Compra portátiles gaming online: 200+ modelos ✓ ASUS, MSI, Lenovo ✓ Desde 699€
                    ✓ Financiación 0% ✓ Devolución 30 días. ¡Encuentra el tuyo!
                  </code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Por qué funciona:</strong> Variedad (200+ modelos), marcas reconocidas,
                  rango de precio desde X€, facilidades de pago, sin riesgo (devolución).
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Ampliado */}
          <section className={styles.eduSection}>
            <h2>❓ Preguntas Frecuentes (FAQ)</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>¿Cuál es la longitud ideal de una meta descripción en 2026?</h4>
                <p>
                  Google muestra entre <strong>150-160 caracteres</strong> en desktop y aproximadamente
                  <strong>120 caracteres en móvil</strong>. Para máxima visibilidad cross-device, mantén
                  el mensaje clave en los primeros 120 caracteres. Google puede mostrar hasta 920 píxeles
                  de ancho, lo que equivale a aproximadamente 155-160 caracteres dependiendo del tipo de letra.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h4>¿Debo incluir mi palabra clave principal en la meta descripción?</h4>
                <p>
                  <strong>Sí, absolutamente.</strong> Google resalta en <strong>negrita</strong> las palabras
                  que coinciden con la búsqueda del usuario, haciendo tu resultado más visible. Sin embargo,
                  evita el "keyword stuffing" (repetir la palabra clave múltiples veces). Una mención natural
                  es suficiente.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h4>¿Qué pasa si no añado meta descripción?</h4>
                <p>
                  Google generará automáticamente un fragmento extrayendo texto de tu página, generalmente
                  del primer párrafo o de secciones que considera relevantes para la búsqueda. Esto puede
                  resultar en descripciones <strong>poco atractivas, incompletas o descontextualizadas</strong>,
                  reduciendo drásticamente tu CTR.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h4>¿Usar emojis en meta descripciones afecta al SEO?</h4>
                <p>
                  Los emojis <strong>NO afectan negativamente</strong> al ranking, pero pueden
                  <strong>aumentar significativamente el CTR</strong> (hasta 20% según estudios).
                  Google muestra emojis en SERPs, pero úsalos con moderación (1-3 por descripción) y
                  asegúrate de que sean relevantes para tu contenido. Evita emojis en sectores muy formales
                  (legal, médico, financiero).
                </p>
              </div>

              <div className={styles.faqItem}>
                <h4>¿Google siempre muestra la meta descripción que escribo?</h4>
                <p>
                  <strong>No siempre.</strong> Google puede ignorar tu meta descripción en hasta el 70% de los casos
                  si considera que otro fragmento de tu página es más relevante para la búsqueda específica del usuario.
                  Para minimizar esto, asegúrate de que tu meta descripción sea: (1) relevante para la página completa,
                  (2) incluya palabras clave principales, (3) no sea duplicada con otras páginas.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h4>¿Debo incluir llamadas a la acción (CTA)?</h4>
                <p>
                  <strong>Sí, absolutamente recomendado.</strong> Las CTAs aumentan el CTR al crear sensación
                  de urgencia y claridad. Ejemplos efectivos: "Descubre cómo", "Aprende gratis", "Compra ahora",
                  "Obtén tu guía", "Únete a 10.000+ usuarios". Coloca la CTA al final de la descripción para
                  que sea lo último que lee el usuario antes de decidir hacer clic.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h4>¿Puedo usar la misma meta descripción para páginas similares?</h4>
                <p>
                  <strong>No, nunca dupliques meta descripciones.</strong> Google penaliza contenido duplicado
                  y puede elegir no mostrar tu descripción. Cada página debe tener una meta descripción
                  <strong>única y específica</strong> para su contenido. Si tienes muchas páginas similares
                  (ej: fichas de productos), crea plantillas dinámicas que incluyan el nombre del producto,
                  características únicas, etc.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h4>¿Cómo mido la efectividad de mis meta descripciones?</h4>
                <p>
                  Usa <strong>Google Search Console</strong> → Rendimiento → filtra por página. Analiza:
                  (1) <strong>CTR (Click-Through Rate)</strong>: % de clics vs impresiones (objetivo: &gt;2-5%
                  dependiendo de la posición), (2) <strong>Impresiones</strong>: cuántas veces se muestra,
                  (3) <strong>Posición promedio</strong>: correlaciona CTR con ranking. Si tu CTR es bajo
                  a pesar de buena posición, considera reescribir la meta descripción.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.eduSection}>
            <h2>Mejores prácticas</h2>
            <div className={styles.practicesList}>
              <div className={styles.practiceCard}>
                <span className={styles.practiceIcon}>📏</span>
                <h4>Longitud ideal: 150-160 caracteres</h4>
                <p>Google trunca descripciones largas. Mantén el mensaje clave al principio.</p>
              </div>
              <div className={styles.practiceCard}>
                <span className={styles.practiceIcon}>🎯</span>
                <h4>Incluye la palabra clave principal</h4>
                <p>Google resalta en negrita las coincidencias con la búsqueda del usuario.</p>
              </div>
              <div className={styles.practiceCard}>
                <span className={styles.practiceIcon}>💡</span>
                <h4>Propuesta de valor clara</h4>
                <p>¿Por qué el usuario debería hacer clic? Responde esta pregunta.</p>
              </div>
              <div className={styles.practiceCard}>
                <span className={styles.practiceIcon}>🔥</span>
                <h4>Llamada a la acción (CTA)</h4>
                <p>Usa verbos de acción: Descubre, Aprende, Compra, Obtén...</p>
              </div>
              <div className={styles.practiceCard}>
                <span className={styles.practiceIcon}>🔢</span>
                <h4>Usa números y datos</h4>
                <p>Los números captan la atención: "15 consejos", "50% descuento", "2.000+ clientes"</p>
              </div>
              <div className={styles.practiceCard}>
                <span className={styles.practiceIcon}>✨</span>
                <h4>Única para cada página</h4>
                <p>Evita duplicar descripciones. Cada página debe tener la suya propia.</p>
              </div>
            </div>
          </section>

          {/* Guía paso a paso */}
          <section className={styles.eduSection}>
            <h2>📋 Guía Paso a Paso: Cómo Escribir la Meta Descripción Perfecta</h2>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h4>Identifica tu palabra clave principal</h4>
                  <p>
                    Revisa para qué keyword quieres rankear esta página. Usa herramientas como Google Search Console,
                    Ubersuggest o analiza la competencia. Esta keyword DEBE aparecer en tu meta descripción de forma natural.
                  </p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h4>Define tu propuesta de valor única (UVP)</h4>
                  <p>
                    ¿Qué hace tu página diferente de los otros 9 resultados de la primera página de Google?
                    ¿Por qué el usuario debería hacer clic en TU resultado? Enfoca aquí: beneficio principal,
                    ahorro de tiempo/dinero, exclusividad, actualización, credibilidad.
                  </p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h4>Estructura con la fórmula probada</h4>
                  <p>
                    Usa esta estructura de alto CTR:<br />
                    <strong>[Keyword principal] + [Beneficio claro] + [Diferenciador] + [CTA]</strong><br />
                    Ejemplo: "Zapatillas running (keyword) con amortiguación máxima (beneficio).
                    ✓ Envío gratis ✓ Devolución 60 días (diferenciador). ¡Compra ahora! (CTA)"
                  </p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h4>Optimiza la longitud (150-155 caracteres)</h4>
                  <p>
                    Escribe tu borrador inicial, luego edita para alcanzar 150-155 caracteres. Pon la información
                    MÁS IMPORTANTE en los primeros 120 caracteres (móvil). Elimina palabras de relleno como
                    "muy", "realmente", "increíble" sin significado concreto.
                  </p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <h4>Añade elementos de conversión</h4>
                  <p>
                    Refuerza con: <strong>números</strong> (estadísticas, precios, descuentos),
                    <strong>checkmarks</strong> (✓ Envío gratis ✓ Garantía), <strong>años</strong>
                    (actualidad SEO), <strong>emojis estratégicos</strong> (1-2 máximo), <strong>urgencia</strong>
                    (oferta limitada, stock reducido).
                  </p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>6</div>
                <div className={styles.stepContent}>
                  <h4>Testea en el simulador de SERP</h4>
                  <p>
                    Usa esta herramienta para ver cómo se verá tu meta descripción en Google. Verifica que:
                    (1) no se corta en móvil, (2) el mensaje clave es visible, (3) los emojis se muestran correctamente,
                    (4) el checklist SEO marca ✓ en todos los puntos críticos.
                  </p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>7</div>
                <div className={styles.stepContent}>
                  <h4>Monitoriza y ajusta según datos reales</h4>
                  <p>
                    Después de 2-4 semanas, revisa Google Search Console → Rendimiento → CTR por página.
                    Si tu CTR es &lt;2% en posiciones top 5, reescribe la meta descripción. Prueba A/B testing
                    cambiando un solo elemento a la vez (CTA, emojis, números, beneficios).
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Warning Box - Errores comunes */}
          <section className={styles.eduSection}>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon}>⚠️</span>
                <h3>Errores Comunes que Destruyen tu CTR</h3>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>❌ Dejar la meta descripción vacía:</strong> Google usará texto aleatorio de tu página,
                  generalmente el primer párrafo que puede ser poco atractivo o cortarse a mitad de frase.
                  Resultado: CTR reducido hasta 40%.
                </li>
                <li>
                  <strong>❌ Copiar el primer párrafo de la página:</strong> Los usuarios pueden leerlo completo
                  si hacen clic. No hay incentivo para el clic. Usa un resumen diferente con CTA.
                </li>
                <li>
                  <strong>❌ Keyword stuffing:</strong> "Comprar zapatos, zapatos baratos, tienda zapatos online"
                  se ve spam y Google puede penalizarte. Una mención natural de la keyword es suficiente.
                </li>
                <li>
                  <strong>❌ Descripciones genéricas sin diferenciador:</strong> "Ofrecemos los mejores productos
                  al mejor precio" no dice nada específico. ¿Qué productos? ¿Qué precio? ¿Por qué son mejores?
                </li>
                <li>
                  <strong>❌ Promesas falsas o clickbait engañoso:</strong> "¡Gana 10.000€ al mes sin trabajar!"
                  genera clics pero alta tasa de rebote. Google detecta esto y penaliza tu ranking.
                </li>
                <li>
                  <strong>❌ Duplicar meta descripciones entre páginas:</strong> Google puede ignorar todas tus
                  meta descripciones si detecta duplicación masiva. Cada página necesita su propia descripción única.
                </li>
                <li>
                  <strong>❌ Olvidar la intención de búsqueda:</strong> Si el usuario busca "cómo instalar WordPress"
                  (búsqueda informativa), una descripción de venta "Compra hosting WordPress" genera bajo CTR.
                  Adapta el tono a la intención.
                </li>
                <li>
                  <strong>❌ No optimizar para móvil:</strong> El 60% de búsquedas son desde móvil. Si tu mensaje
                  clave está después del carácter 120, se cortará en móvil y perderás impacto.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-meta-descripciones')} />

      <ShareCard appName="generador-meta-descripciones" />
      <Footer appName="generador-meta-descripciones" />
    </div>
  );
}
