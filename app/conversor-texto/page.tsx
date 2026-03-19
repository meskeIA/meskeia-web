'use client';

import { useState } from 'react';
import styles from './ConversorTexto.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

export default function ConversorTextoPage() {
  const [textoEntrada, setTextoEntrada] = useState('');
  const [textoSalida, setTextoSalida] = useState('');

  // ==================== FUNCIONES DE CONVERSIÓN ====================

  const convertirMayusculas = () => setTextoSalida(textoEntrada.toUpperCase());
  const convertirMinusculas = () => setTextoSalida(textoEntrada.toLowerCase());

  const convertirCapitalizar = () => {
    setTextoSalida(
      textoEntrada
        .toLowerCase()
        .replace(/(^|\s)\S/g, (letra) => letra.toUpperCase())
    );
  };

  const convertirTitulo = () => {
    // Capitaliza cada palabra excepto artículos y preposiciones cortas
    const excepciones = ['de', 'del', 'la', 'el', 'las', 'los', 'en', 'y', 'a', 'con', 'por', 'para'];
    setTextoSalida(
      textoEntrada
        .toLowerCase()
        .split(' ')
        .map((palabra, index) => {
          if (index === 0 || !excepciones.includes(palabra)) {
            return palabra.charAt(0).toUpperCase() + palabra.slice(1);
          }
          return palabra;
        })
        .join(' ')
    );
  };

  const convertirOracion = () => {
    // Primera letra de cada oración en mayúscula
    setTextoSalida(
      textoEntrada
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s*\w)/g, (letra) => letra.toUpperCase())
    );
  };

  const convertirAlternar = () => {
    setTextoSalida(
      textoEntrada
        .split('')
        .map((char, i) => (i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()))
        .join('')
    );
  };

  const convertirInvertir = () => {
    setTextoSalida(textoEntrada.split('').reverse().join(''));
  };

  const convertirInvertirPalabras = () => {
    setTextoSalida(textoEntrada.split(' ').reverse().join(' '));
  };

  const eliminarAcentos = () => {
    setTextoSalida(
      textoEntrada.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    );
  };

  const invertirMayusculas = () => {
    setTextoSalida(
      textoEntrada
        .split('')
        .map((char) => {
          if (char >= 'a' && char <= 'z') return char.toUpperCase();
          if (char >= 'A' && char <= 'Z') return char.toLowerCase();
          return char;
        })
        .join('')
    );
  };

  const eliminarEspaciosExtra = () => {
    setTextoSalida(textoEntrada.replace(/\s+/g, ' ').trim());
  };

  // ==================== FUNCIONES AUXILIARES ====================

  const copiarResultado = async () => {
    if (!textoSalida) return;
    try {
      await navigator.clipboard.writeText(textoSalida);
    } catch {
      // Silencioso
    }
  };

  const limpiarTodo = () => {
    setTextoEntrada('');
    setTextoSalida('');
  };

  const intercambiarTextos = () => {
    const temp = textoEntrada;
    setTextoEntrada(textoSalida);
    setTextoSalida(temp);
  };

  // ==================== RENDER ====================

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Conversor de Texto</h1>
        <p className={styles.subtitle}>
          Transforma tu texto: mayúsculas, minúsculas, invertir y más
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="general"
        severity="medium"
        collapsible={true}
        context="conversor-texto-disclaimer"
      />

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <section className={styles.inputPanel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.sectionTitle}>Texto de entrada</h2>
            <button type="button" onClick={limpiarTodo} className={styles.btnSecundario}>
              Limpiar
            </button>
          </div>
          <textarea
            value={textoEntrada}
            onChange={(e) => setTextoEntrada(e.target.value)}
            placeholder="Escribe o pega tu texto aquí..."
            className={styles.textArea}
            rows={6}
          />
          <div className={styles.stats}>
            <span>{textoEntrada.length} caracteres</span>
            <span>{textoEntrada.split(/\s+/).filter(Boolean).length} palabras</span>
          </div>
        </section>

        {/* Botones de acción */}
        <section className={styles.accionesPanel}>
          <h3 className={styles.accionesTitle}>Conversiones disponibles</h3>
          <div className={styles.botonesGrid}>
            <button type="button" onClick={convertirMayusculas} className={styles.btnAccion} disabled={!textoEntrada}>
              MAYÚSCULAS
            </button>
            <button type="button" onClick={convertirMinusculas} className={styles.btnAccion} disabled={!textoEntrada}>
              minúsculas
            </button>
            <button type="button" onClick={convertirCapitalizar} className={styles.btnAccion} disabled={!textoEntrada}>
              Capitalizar Palabras
            </button>
            <button type="button" onClick={convertirTitulo} className={styles.btnAccion} disabled={!textoEntrada}>
              Formato Título
            </button>
            <button type="button" onClick={convertirOracion} className={styles.btnAccion} disabled={!textoEntrada}>
              Formato oración
            </button>
            <button type="button" onClick={convertirAlternar} className={styles.btnAccion} disabled={!textoEntrada}>
              aLtErNaR
            </button>
            <button type="button" onClick={invertirMayusculas} className={styles.btnAccion} disabled={!textoEntrada}>
              iNVERTIR mAYÚS
            </button>
            <button type="button" onClick={convertirInvertir} className={styles.btnAccion} disabled={!textoEntrada}>
              Invertir ↔
            </button>
            <button type="button" onClick={convertirInvertirPalabras} className={styles.btnAccion} disabled={!textoEntrada}>
              Invertir palabras
            </button>
            <button type="button" onClick={eliminarAcentos} className={styles.btnAccion} disabled={!textoEntrada}>
              Sin acentos
            </button>
            <button type="button" onClick={eliminarEspaciosExtra} className={styles.btnAccion} disabled={!textoEntrada}>
              Limpiar espacios
            </button>
          </div>

          {/* Botón intercambiar */}
          {textoSalida && (
            <button type="button" onClick={intercambiarTextos} className={styles.btnIntercambiar}>
              ↕ Usar resultado como entrada
            </button>
          )}
        </section>

        {/* Panel de salida */}
        <section className={styles.outputPanel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.sectionTitle}>Resultado</h2>
            <button
              type="button"
              onClick={copiarResultado}
              className={styles.btnSecundario}
              disabled={!textoSalida}
            >
              📋 Copiar
            </button>
          </div>
          <textarea
            value={textoSalida}
            readOnly
            placeholder="El resultado aparecerá aquí..."
            className={styles.textArea}
            rows={6}
          />
          {textoSalida && (
            <div className={styles.stats}>
              <span>{textoSalida.length} caracteres</span>
              <span>{textoSalida.split(/\s+/).filter(Boolean).length} palabras</span>
            </div>
          )}
        </section>
      </div>

      {/* Sección educativa */}
      <EducationalSection
        title="Aprende sobre Transformaciones de Texto"
        subtitle="Casos de uso reales, convenciones profesionales y cómo aplicarlas correctamente"
      >
        <section>

          {/* SECCIÓN 1: Comparativa de conversiones */}
          <div className={styles.comparativaSection}>
            <h3>📊 Guía de Conversiones: Cuándo Usar Cada Una</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoCard}>
                <h4>🔠 Mayúsculas / minúsculas</h4>
                <p><strong>MAYÚSCULAS</strong> → énfasis, siglas, código de error<br />
                <strong>minúsculas</strong> → normalizar antes de comparar, slugs, emails<br />
                <strong>Invertir mayús</strong> → efecto visual, tipografía creativa</p>
              </div>
              <div className={styles.infoCard}>
                <h4>📝 Formatos de título</h4>
                <p><strong>Capitalizar</strong> → nombres propios, encabezados de tabla<br />
                <strong>Formato Título</strong> → títulos en español (respeta artículos)<br />
                <strong>Formato oración</strong> → inicio de párrafos, redes sociales</p>
              </div>
              <div className={styles.infoCard}>
                <h4>🔄 Transformaciones especiales</h4>
                <p><strong>Alternar (aLtErNaR)</strong> → memes, humor en redes<br />
                <strong>Invertir caracteres</strong> → efecto espejo, steganografía simple<br />
                <strong>Invertir palabras</strong> → ejercicios de comprensión lectora</p>
              </div>
              <div className={styles.infoCard}>
                <h4>🧹 Limpieza de texto</h4>
                <p><strong>Sin acentos</strong> → URLs, IDs de base de datos, nombres de archivo<br />
                <strong>Limpiar espacios</strong> → texto copiado de PDF o Word<br />
                <strong>Combinar ambas</strong> → generar slugs para URLs amigables SEO</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: Uso en programación */}
          <div className={styles.programacionSection}>
            <h3>💻 Convenciones de Texto en Programación</h3>
            <p className={styles.programacionIntro}>
              En desarrollo de software, el formato del texto no es solo estética — es convención técnica.
              Cada lenguaje y ecosistema tiene sus estándares.
            </p>
            <div className={styles.convencionesList}>
              <div className={styles.convencionItem}>
                <span className={styles.convencionBadge}>camelCase</span>
                <div>
                  <strong>nombreDeVariable, calcularImpuesto()</strong>
                  <p>JavaScript, Java, C#. Variables y funciones. Primera palabra en minúscula, siguientes capitalizadas.</p>
                </div>
              </div>
              <div className={styles.convencionItem}>
                <span className={styles.convencionBadge}>PascalCase</span>
                <div>
                  <strong>NombreDeClase, CalculadoraFire</strong>
                  <p>Clases y componentes React. Igual que camelCase pero con la primera letra en mayúscula.</p>
                </div>
              </div>
              <div className={styles.convencionItem}>
                <span className={styles.convencionBadge}>snake_case</span>
                <div>
                  <strong>nombre_de_variable, calcular_impuesto</strong>
                  <p>Python, Ruby, SQL. Todas las letras en minúscula separadas por guion bajo.</p>
                </div>
              </div>
              <div className={styles.convencionItem}>
                <span className={styles.convencionBadge}>kebab-case</span>
                <div>
                  <strong>nombre-de-clase, mi-componente</strong>
                  <p>CSS, URLs, nombres de archivos HTML. Palabras en minúscula separadas por guion.</p>
                </div>
              </div>
              <div className={styles.convencionItem}>
                <span className={styles.convencionBadge}>SCREAMING_SNAKE</span>
                <div>
                  <strong>MAX_INTENTOS, API_BASE_URL</strong>
                  <p>Constantes en casi todos los lenguajes. Todo en mayúsculas con guiones bajos.</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: FAQ */}
          <div className={styles.faqSection}>
            <h3>❓ Preguntas Frecuentes sobre Transformación de Texto</h3>
            <div className={styles.faqList}>
              <details className={styles.faqItem}>
                <summary className={styles.faqQuestion}>¿Por qué &quot;Sin acentos&quot; no elimina la ñ?</summary>
                <p className={styles.faqAnswer}>La función <code>normalize(&apos;NFD&apos;)</code> descompone caracteres con diacríticos (tildes) en su carácter base + modificador, y luego elimina los modificadores. La &quot;ñ&quot; en español es un carácter propio del Unicode (U+00F1), no una &quot;n&quot; con tilde, por lo que no se descompone con NFD estándar. Para eliminar la ñ habría que hacer una sustitución explícita (ñ→n), lo que cambiaría el significado de palabras como &quot;año&quot; (→ &quot;ano&quot;).</p>
              </details>
              <details className={styles.faqItem}>
                <summary className={styles.faqQuestion}>¿Cuál es la diferencia entre &quot;Capitalizar&quot; y &quot;Formato Título&quot;?</summary>
                <p className={styles.faqAnswer}>Ambos ponen en mayúscula la primera letra de cada palabra, pero &quot;Formato Título&quot; respeta las reglas tipográficas del español: no capitaliza artículos (el, la, los, las), preposiciones (de, en, con, por, para) ni conjunciones (y, a) cuando están en posición intermedia. Ejemplo: &quot;El perro de la vecina&quot; → &quot;El Perro de la Vecina&quot; (Formato Título) vs &quot;El Perro De La Vecina&quot; (Capitalizar).</p>
              </details>
              <details className={styles.faqItem}>
                <summary className={styles.faqQuestion}>¿Para qué sirve &quot;Invertir palabras&quot;?</summary>
                <p className={styles.faqAnswer}>&quot;Invertir palabras&quot; invierte el orden de las palabras (última primera, primera última) manteniendo cada palabra intacta. Se usa en ejercicios de comprensión lectora para aumentar la dificultad, en lingüística computacional para pruebas de modelos de lenguaje, y en algunos sistemas de indexación inversa para optimización de búsquedas. También se usa en juegos de palabras creativos.</p>
              </details>
              <details className={styles.faqItem}>
                <summary className={styles.faqQuestion}>¿Por qué &quot;Limpiar espacios&quot; no elimina los saltos de línea?</summary>
                <p className={styles.faqAnswer}>La función usa <code>/\s+/g</code> que coincide con uno o más caracteres de espacio en blanco, incluyendo espacios, tabulaciones Y saltos de línea. Si el texto tiene saltos de línea entre párrafos, la función los reemplaza por un único espacio, dejando el texto en una sola línea. Si necesitas preservar los saltos de línea, la operación correcta es <code>/[ \t]+/g</code> (solo espacios y tabulaciones, no saltos de línea).</p>
              </details>
              <details className={styles.faqItem}>
                <summary className={styles.faqQuestion}>¿El texto procesado se envía a algún servidor?</summary>
                <p className={styles.faqAnswer}>No. Todas las transformaciones ocurren completamente en tu navegador usando JavaScript del lado del cliente. Tu texto nunca sale de tu dispositivo ni se transmite por internet. Puedes usar esta herramienta con textos confidenciales (contratos, datos personales, código propietario) sin preocuparte por la privacidad.</p>
              </details>
            </div>
          </div>

          {/* SECCIÓN 4: Casos de uso reales */}
          <div className={styles.casosSection}>
            <h3>🎯 Casos de Uso Reales</h3>
            <div className={styles.casosGrid}>
              <div className={styles.casoCard}>
                <span className={styles.casoIcon}>🔗</span>
                <h4>Generar slugs para URLs</h4>
                <p>Proceso: <strong>minúsculas → sin acentos → limpiar espacios</strong> y reemplazar espacios por guiones. Resultado: &quot;Cómo Calcular el IVA&quot; → &quot;como-calcular-el-iva&quot;.</p>
              </div>
              <div className={styles.casoCard}>
                <span className={styles.casoIcon}>📧</span>
                <h4>Normalizar emails en bases de datos</h4>
                <p>Convertir siempre a <strong>minúsculas</strong> antes de guardar o comparar emails. &quot;Usuario@Gmail.COM&quot; y &quot;usuario@gmail.com&quot; son el mismo email pero JavaScript los trata como strings diferentes.</p>
              </div>
              <div className={styles.casoCard}>
                <span className={styles.casoIcon}>📄</span>
                <h4>Limpiar texto de PDFs</h4>
                <p>Los PDFs copiados suelen tener espacios dobles, triples y tabulaciones intercaladas. <strong>Limpiar espacios</strong> normaliza todo de una vez, ahorrando la edición manual.</p>
              </div>
              <div className={styles.casoCard}>
                <span className={styles.casoIcon}>📱</span>
                <h4>Formatear publicaciones en redes</h4>
                <p><strong>Formato oración</strong> es ideal para posts donde copiamos texto en minúsculas. <strong>Alternar mayúsculas</strong> para memes o humor. El inversor de caracteres da un efecto visual llamativo.</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 5: Tips */}
          <div className={styles.tipsSection}>
            <h3>💡 Flujos de Trabajo Eficientes</h3>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>⚡</span>
                <h4>Encadenar transformaciones</h4>
                <p>Usa el botón &quot;↕ Usar resultado como entrada&quot; para aplicar múltiples conversiones secuencialmente. Por ejemplo: minúsculas → sin acentos → (manualmente reemplaza espacios por guiones) = slug perfecto.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📋</span>
                <h4>Copiar al portapapeles</h4>
                <p>El botón &quot;📋 Copiar&quot; copia el resultado directamente al portapapeles del sistema. No necesitas seleccionar el texto manualmente. Funciona en todos los navegadores modernos sobre HTTPS.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🔤</span>
                <h4>Contar sin copiar</h4>
                <p>Los contadores de caracteres y palabras bajo los textareas se actualizan en tiempo real. Úsalos para verificar límites (Twitter: 280 chars, meta description: 155-160 chars, título SEO: 50-60 chars).</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🔁</span>
                <h4>Probar múltiples variantes</h4>
                <p>Escribe tu texto base, aplica una conversión, cópiala, y luego prueba otra. El campo de entrada no cambia al aplicar conversiones, así que puedes probar todas las variantes sin volver a escribir.</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 6: Warning Box */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Limitaciones y Comportamientos a Tener en Cuenta</h3>
            </div>
            <ul className={styles.warningList}>
              <li><strong>❌ El &quot;Formato Título&quot; no es perfecto para todos los idiomas:</strong> La lista de excepciones (artículos, preposiciones) está calibrada para el español. Textos en inglés siguen convenciones distintas (Title Case en inglés no excluye las mismas palabras). Para inglés, &quot;Capitalizar Palabras&quot; da resultados más predecibles.</li>
              <li><strong>❌ &quot;Sin acentos&quot; puede crear ambigüedades en español:</strong> Eliminar tildes cambia el significado en pares como &quot;sé/se&quot;, &quot;él/el&quot;, &quot;más/mas&quot;, &quot;sí/si&quot;, &quot;cómo/como&quot;. Usa esta función solo cuando el contexto técnico lo requiera (URLs, IDs), nunca en textos que se publicarán para lectura humana.</li>
              <li><strong>❌ La función &quot;Invertir&quot; trabaja sobre caracteres Unicode, no grafemas:</strong> Algunos emojis compuestos (como las banderas 🇪🇸) están formados por secuencias de puntos de código Unicode. Invertirlos puede romperlos visualmente porque los puntos de código quedan en orden incorrecto.</li>
              <li><strong>❌ El contador de palabras usa espacios como separador:</strong> El recuento usa <code>split(/\s+/).filter(Boolean)</code>, que divide por cualquier espacio en blanco. Signos de puntuación pegados a palabras se cuentan como parte de la palabra. &quot;hola, mundo!&quot; = 2 palabras, no 4 tokens.</li>
            </ul>
          </div>

        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('conversor-texto')} />

      <ShareCard appName="conversor-texto" />
      <Footer appName="conversor-texto" />
    </div>
  );
}
