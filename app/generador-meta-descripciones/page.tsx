'use client';

import { useState, useMemo } from 'react';
import styles from './GeneradorMetaDescripciones.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import EducationalSection from '@/components/EducationalSection';

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

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🔍 Generador de Meta Descripciones</h1>
        <p className={styles.subtitle}>
          Crea meta descripciones optimizadas para SEO con vista previa de Google
        </p>
      </header>

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

          {/* Código HTML */}
          {descripcion && (
            <div className={styles.codeSection}>
              <h3 className={styles.codeTitle}>📄 Código HTML</h3>
              <pre className={styles.codeBlock}>
                {`<meta name="description" content="${descripcion.replace(/"/g, '&quot;')}">`}
              </pre>
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

          <section className={styles.eduSection}>
            <h2>Errores comunes a evitar</h2>
            <ul className={styles.errorsList}>
              <li>❌ Dejar la meta descripción vacía (Google usará texto aleatorio)</li>
              <li>❌ Copiar el primer párrafo de la página</li>
              <li>❌ Keyword stuffing (repetir palabras clave excesivamente)</li>
              <li>❌ Descripciones genéricas que no aportan valor</li>
              <li>❌ Promesas falsas o clickbait engañoso</li>
            </ul>
          </section>
        </div>
      </EducationalSection>

      <Footer appName="generador-meta-descripciones" />
    </div>
  );
}
