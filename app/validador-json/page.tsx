'use client';

import { useState, useCallback } from 'react';
import styles from './ValidadorJSON.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type TabType = 'json' | 'xml';

interface ValidationResult {
  valid: boolean;
  message: string;
  line?: number;
  column?: number;
}

const EJEMPLOS_JSON = {
  simple: '{\n  "nombre": "Juan",\n  "edad": 30,\n  "activo": true\n}',
  array: '[\n  {"id": 1, "producto": "Laptop"},\n  {"id": 2, "producto": "Mouse"},\n  {"id": 3, "producto": "Teclado"}\n]',
  complejo: '{\n  "empresa": "meskeIA",\n  "empleados": [\n    {"nombre": "Ana", "departamento": "Tech"},\n    {"nombre": "Luis", "departamento": "Marketing"}\n  ],\n  "activa": true,\n  "fundacion": 2024\n}',
};

const EJEMPLOS_XML = {
  simple: '<?xml version="1.0" encoding="UTF-8"?>\n<persona>\n  <nombre>Juan</nombre>\n  <edad>30</edad>\n</persona>',
  lista: '<?xml version="1.0" encoding="UTF-8"?>\n<productos>\n  <producto id="1">Laptop</producto>\n  <producto id="2">Mouse</producto>\n  <producto id="3">Teclado</producto>\n</productos>',
  complejo: '<?xml version="1.0" encoding="UTF-8"?>\n<empresa nombre="meskeIA">\n  <empleados>\n    <empleado dept="Tech">Ana</empleado>\n    <empleado dept="Marketing">Luis</empleado>\n  </empleados>\n  <activa>true</activa>\n</empresa>',
};

export default function ValidadorJSONPage() {
  const [activeTab, setActiveTab] = useState<TabType>('json');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [copied, setCopied] = useState(false);

  const validateJSON = useCallback((text: string): ValidationResult => {
    if (!text.trim()) {
      return { valid: false, message: 'Introduce código JSON para validar' };
    }
    try {
      JSON.parse(text);
      return { valid: true, message: 'JSON válido' };
    } catch (e) {
      const error = e as SyntaxError;
      const match = error.message.match(/position (\d+)/);
      if (match) {
        const position = parseInt(match[1]);
        const lines = text.substring(0, position).split('\n');
        const line = lines.length;
        const column = lines[lines.length - 1].length + 1;
        return {
          valid: false,
          message: error.message,
          line,
          column
        };
      }
      return { valid: false, message: error.message };
    }
  }, []);

  const validateXML = useCallback((text: string): ValidationResult => {
    if (!text.trim()) {
      return { valid: false, message: 'Introduce código XML para validar' };
    }
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'application/xml');
      const errorNode = doc.querySelector('parsererror');
      if (errorNode) {
        const errorText = errorNode.textContent || 'Error de sintaxis XML';
        return { valid: false, message: errorText.split('\n')[0] };
      }
      return { valid: true, message: 'XML válido' };
    } catch {
      return { valid: false, message: 'Error al parsear XML' };
    }
  }, []);

  const handleValidate = useCallback(() => {
    const validation = activeTab === 'json' ? validateJSON(input) : validateXML(input);
    setResult(validation);
    if (validation.valid) {
      if (activeTab === 'json') {
        try {
          const parsed = JSON.parse(input);
          setOutput(JSON.stringify(parsed, null, 2));
        } catch {
          setOutput(input);
        }
      } else {
        setOutput(input);
      }
    } else {
      setOutput('');
    }
  }, [activeTab, input, validateJSON, validateXML]);

  const handleFormat = useCallback(() => {
    if (activeTab === 'json') {
      try {
        const parsed = JSON.parse(input);
        const formatted = JSON.stringify(parsed, null, 2);
        setInput(formatted);
        setOutput(formatted);
        setResult({ valid: true, message: 'JSON formateado correctamente' });
      } catch (e) {
        setResult({ valid: false, message: (e as Error).message });
      }
    } else {
      // Formatear XML básico
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(input, 'application/xml');
        const errorNode = doc.querySelector('parsererror');
        if (errorNode) {
          setResult({ valid: false, message: 'XML inválido, no se puede formatear' });
          return;
        }
        const serializer = new XMLSerializer();
        let formatted = serializer.serializeToString(doc);
        // Añadir indentación básica
        formatted = formatted.replace(/></g, '>\n<');
        setInput(formatted);
        setOutput(formatted);
        setResult({ valid: true, message: 'XML formateado correctamente' });
      } catch {
        setResult({ valid: false, message: 'Error al formatear XML' });
      }
    }
  }, [activeTab, input]);

  const handleMinify = useCallback(() => {
    if (activeTab === 'json') {
      try {
        const parsed = JSON.parse(input);
        const minified = JSON.stringify(parsed);
        setInput(minified);
        setOutput(minified);
        setResult({ valid: true, message: 'JSON minificado correctamente' });
      } catch (e) {
        setResult({ valid: false, message: (e as Error).message });
      }
    } else {
      try {
        const minified = input.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
        setInput(minified);
        setOutput(minified);
        setResult({ valid: true, message: 'XML minificado correctamente' });
      } catch {
        setResult({ valid: false, message: 'Error al minificar XML' });
      }
    }
  }, [activeTab, input]);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setResult(null);
  }, []);

  const handleCopy = useCallback(async () => {
    const textToCopy = output || input;
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [output, input]);

  const loadExample = useCallback((key: string) => {
    const ejemplos = activeTab === 'json' ? EJEMPLOS_JSON : EJEMPLOS_XML;
    const ejemplo = ejemplos[key as keyof typeof ejemplos];
    if (ejemplo) {
      setInput(ejemplo);
      setOutput('');
      setResult(null);
    }
  }, [activeTab]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    setInput('');
    setOutput('');
    setResult(null);
  }, []);

  const charCount = input.length;
  const lineCount = input ? input.split('\n').length : 0;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Validador JSON y XML</h1>
        <p className={styles.subtitle}>Valida, formatea y minifica código al instante</p>
      </header>

      <LegalNotice />

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'json' ? styles.tabActive : ''}`}
          onClick={() => handleTabChange('json')}
        >
          <span className={styles.tabIcon}>{ }</span>
          JSON
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'xml' ? styles.tabActive : ''}`}
          onClick={() => handleTabChange('xml')}
        >
          <span className={styles.tabIcon}>&lt;/&gt;</span>
          XML
        </button>
      </div>

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Entrada</h2>
            <div className={styles.stats}>
              <span>{lineCount} líneas</span>
              <span>{charCount} caracteres</span>
            </div>
          </div>

          <div className={styles.examples}>
            <span className={styles.examplesLabel}>Ejemplos:</span>
            <button onClick={() => loadExample('simple')} className={styles.exampleBtn}>
              Simple
            </button>
            <button onClick={() => loadExample('array')} className={styles.exampleBtn}>
              {activeTab === 'json' ? 'Array' : 'Lista'}
            </button>
            <button onClick={() => loadExample('complejo')} className={styles.exampleBtn}>
              Complejo
            </button>
          </div>

          <textarea
            className={styles.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Pega tu código ${activeTab.toUpperCase()} aquí...`}
            spellCheck={false}
          />

          <div className={styles.actions}>
            <button onClick={handleValidate} className={styles.btnPrimary}>
              Validar
            </button>
            <button onClick={handleFormat} className={styles.btnSecondary}>
              Formatear
            </button>
            <button onClick={handleMinify} className={styles.btnSecondary}>
              Minificar
            </button>
            <button onClick={handleClear} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </div>

        {/* Panel de salida */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Resultado</h2>
            <button
              onClick={handleCopy}
              className={styles.copyBtn}
              disabled={!output && !input}
            >
              {copied ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>

          {result && (
            <div className={`${styles.resultBanner} ${result.valid ? styles.success : styles.error}`}>
              <span className={styles.resultIcon}>{result.valid ? '✓' : '✗'}</span>
              <div className={styles.resultText}>
                <span className={styles.resultMessage}>{result.message}</span>
                {result.line && (
                  <span className={styles.resultPosition}>
                    Línea {result.line}, Columna {result.column}
                  </span>
                )}
              </div>
            </div>
          )}

          <textarea
            className={styles.textarea}
            value={output}
            readOnly
            placeholder="El resultado aparecerá aquí..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Contenido educativo profesional */}
      <EducationalSection
        title="📚 ¿Quieres dominar JSON y XML?"
        subtitle="Descubre cuándo usar cada formato, casos de uso reales y mejores prácticas profesionales"
        icon="📚"
      >
        {/* Introducción */}
        <section className={styles.guideSection}>
          <h2>¿Por qué validar y formatear tu código?</h2>
          <p className={styles.introParagraph}>
            Un archivo JSON o XML mal formado puede romper tu aplicación, causar errores difíciles
            de rastrear y perder horas de desarrollo. Esta herramienta te ayuda a detectar problemas
            al instante con ubicación exacta del error, formatear código para mejor legibilidad y
            minificar para producción.
          </p>
        </section>

        {/* Tabla Comparativa JSON vs XML */}
        <section className={styles.comparativaSection}>
          <h2>Tabla Comparativa: JSON vs XML</h2>
          <p className={styles.comparativaSubtitle}>
            ¿Cuándo usar JSON y cuándo XML? Conoce las diferencias clave.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>JSON</th>
                  <th>XML</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Legibilidad</strong></td>
                  <td>Alta - Sintaxis simple y concisa</td>
                  <td>Media - Más verbose con etiquetas de apertura/cierre</td>
                </tr>
                <tr>
                  <td><strong>Uso principal</strong></td>
                  <td>APIs REST, configuraciones modernas, almacenamiento de datos web</td>
                  <td>SOAP, sistemas legacy, RSS/Atom feeds, documentos complejos</td>
                </tr>
                <tr>
                  <td><strong>Datos anidados</strong></td>
                  <td>✅ Soporte nativo con objetos y arrays</td>
                  <td>✅ Soporte nativo con elementos anidados</td>
                </tr>
                <tr>
                  <td><strong>Comentarios</strong></td>
                  <td>❌ No soporta (requiere workarounds)</td>
                  <td>✅ Soporta comentarios <code>&lt;!-- así --&gt;</code></td>
                </tr>
                <tr>
                  <td><strong>Tamaño de archivo</strong></td>
                  <td>Compacto - ~30% más pequeño que XML equivalente</td>
                  <td>Más pesado - Etiquetas de cierre duplican caracteres</td>
                </tr>
                <tr>
                  <td><strong>Validación</strong></td>
                  <td>JSON Schema para validación estructural</td>
                  <td>XSD (XML Schema) o DTD para validación estricta</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de Uso Prácticos */}
        <section className={styles.escenariosSection}>
          <h2>Casos de Uso Reales</h2>
          <p className={styles.escenariosSubtitle}>
            Contextos profesionales donde JSON y XML son indispensables
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🔌</span>
                <h3>APIs REST: JSON para comunicación rápida</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong></p>
                <code>{`{
  "usuario": "ana_lopez",
  "pedidos": [
    {"id": 1, "total": 45.50},
    {"id": 2, "total": 122.00}
  ]
}`}</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> JSON es el estándar de facto para APIs REST
                porque es ligero, fácil de parsear en JavaScript y reduce latencia en transferencias.
                Casi todas las APIs modernas (Stripe, Twitter, GitHub) usan JSON.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>⚙️</span>
                <h3>Configuraciones: package.json, tsconfig.json</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong></p>
                <code>{`{
  "name": "mi-proyecto",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  }
}`}</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> JSON es perfecto para archivos de configuración
                porque es legible por humanos y parseado nativamente por Node.js sin librerías externas.
                Un error de sintaxis rompe tu build - valídalo aquí antes de commit.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📰</span>
                <h3>RSS Feeds: XML para sindicación de contenido</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong></p>
                <code>{`<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Blog meskeIA</title>
    <item>
      <title>Nuevo artículo</title>
      <link>https://meskeia.com/post</link>
    </item>
  </channel>
</rss>`}</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> XML sigue siendo el estándar para RSS/Atom porque
                soporta namespaces (extensiones), comentarios y validación estricta. Los lectores RSS
                esperan este formato específico.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🗄️</span>
                <h3>Logs y trazabilidad: JSON Lines (.jsonl)</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong></p>
                <code>{`{"timestamp": "2026-02-07T10:30:00", "level": "ERROR", "msg": "Conexión fallida"}
{"timestamp": "2026-02-07T10:31:15", "level": "INFO", "msg": "Reintento exitoso"}`}</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> JSON Lines (un JSON por línea) es ideal para logs
                porque cada línea es independiente - puedes procesar archivos enormes sin cargar
                todo en memoria. Herramientas como ElasticSearch lo usan.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏢</span>
                <h3>Sistemas legacy: SOAP con XML</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong></p>
                <code>{`<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetPrice>
      <ProductID>12345</ProductID>
    </GetPrice>
  </soap:Body>
</soap:Envelope>`}</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Sistemas bancarios, gubernamentales y empresariales
                antiguos usan SOAP por su validación estricta, transacciones y seguridad WS-Security.
                Si integras con bancos o SAP, probablemente uses XML.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🌐</span>
                <h3>Sitemaps SEO: XML para indexación Google</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong></p>
                <code>{`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://meskeia.com/</loc>
    <priority>1.0</priority>
  </url>
</urlset>`}</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Google requiere XML para sitemaps porque es
                un formato estándar que robots pueden parsear fácilmente. Un sitemap válido mejora
                tu SEO - valídalo antes de subirlo a Google Search Console.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Ampliado */}
        <section className={styles.faqSection}>
          <h2>Preguntas Frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>❓ ¿Por qué mi JSON válido no funciona en JavaScript?</h4>
              <p>
                Aunque tu JSON sea sintácticamente correcto, puede tener problemas de compatibilidad.
                El error más común es usar <strong>comillas simples</strong> en lugar de dobles
                (JSON solo acepta dobles). Otro problema: <strong>comas finales</strong> en arrays
                u objetos - JavaScript las tolera, JSON estándar no.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Solución:</strong> Siempre valida en esta herramienta antes de usar
                <code>JSON.parse()</code>. Si falla aquí, fallará en producción. También evita copiar
                JSON desde consolas de navegador - pueden añadir sintaxis no estándar.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Cuándo usar formatear vs minificar?</h4>
              <p>
                <strong>Formatear (pretty print):</strong> Úsalo en desarrollo para leer y debuggear.
                Añade indentación, saltos de línea y espacios. Perfecto para archivos de configuración
                que otros desarrolladores leerán.
              </p>
              <p>
                <strong>Minificar:</strong> Úsalo en producción para reducir tamaño (~20-40% más pequeño).
                Elimina espacios, saltos y comentarios. Ideal para APIs que envían JSON a clientes -
                reduce latencia y costes de bandwidth.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Regla práctica:</strong> Formateado para humanos, minificado para máquinas.
                En Next.js, tus builds automáticamente minifican JSON en producción.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Cómo encuentro el error si el mensaje es confuso?</h4>
              <p>
                Esta herramienta te da línea y columna exactas del error. <strong>Errores comunes:</strong>
                (1) Falta una coma entre elementos de array, (2) Coma extra al final de objeto,
                (3) Comillas sin cerrar, (4) Llaves/corchetes desbalanceados.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Estrategia de debugging:</strong> Si el error no es obvio, <strong>divide
                el JSON a la mitad</strong> - prueba la primera mitad, si pasa, el error está en la
                segunda. Repite hasta localizar la línea exacta. También usa un editor con syntax
                highlighting como VS Code - colorea errores automáticamente.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Puedo validar archivos JSON muy grandes?</h4>
              <p>
                Sí, esta herramienta procesa todo en tu navegador (sin enviar datos a servidor).
                Archivos de <strong>hasta 50 MB funcionan bien</strong> en navegadores modernos.
                Para archivos mayores (más de 100 MB), puede ralentizarse o causar out of memory.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Para archivos gigantes:</strong> Usa herramientas de línea de comandos
                como <code>jq</code> (Linux/Mac) o divide el archivo en chunks más pequeños.
                También considera: ¿realmente necesitas un JSON tan grande? Quizás una base de
                datos o formato binario (Parquet, MessagePack) sea más eficiente.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿XML es más lento que JSON?</h4>
              <p>
                Sí, en general. XML requiere más bytes (etiquetas de cierre) y más tiempo de parseo.
                Tests muestran que <strong>JSON es ~2-3x más rápido</strong> de parsear en JavaScript
                y ~30% más compacto. Por eso las APIs modernas prefieren JSON.
              </p>
              <p>
                <strong>Pero XML tiene ventajas:</strong> Validación estricta con schemas, soporte
                para comentarios, namespaces para extensiones y mejor para documentos complejos
                (HTML, SVG, Office docs).
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Cuándo usar XML:</strong> Si necesitas validación estricta (contratos
                financieros), compatibilidad con sistemas legacy (SOAP) o trabajas con formatos
                basados en XML (RSS, SVG). Para APIs nuevas, siempre JSON.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Cómo convertir JSON a XML (o viceversa)?</h4>
              <p>
                Esta herramienta solo valida - no convierte entre formatos. La conversión requiere
                decisiones: ¿los arrays JSON se convierten a elementos XML repetidos? ¿Los atributos
                XML se mapean a propiedades JSON?
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Herramienta recomendada:</strong> Usa la app <strong>Conversor de Formatos</strong>
                de meskeIA (en Apps Relacionadas abajo) - convierte JSON ↔ XML ↔ CSV ↔ YAML con
                opciones configurables. Para casos complejos, usa librerías como <code>xml2js</code>
                (Node.js) o <code>dicttoxml</code> (Python).
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Esta herramienta envía mis datos a un servidor?</h4>
              <p>
                <strong>No, 100% privado.</strong> Todo el procesamiento ocurre en tu navegador
                usando JavaScript. Tus archivos JSON/XML nunca salen de tu dispositivo. Ni siquiera
                tenemos servidor backend para procesar esto - es imposible que veamos tus datos.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Ventaja extra:</strong> Funciona sin internet después de cargar la página
                (gracias a service workers). Puedes validar datos sensibles (tokens API, configs de
                producción) sin preocuparte por seguridad.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Qué hago si mi XML tiene un namespace?</h4>
              <p>
                Los namespaces XML (xmlns) son comunes en SOAP, RSS y SVG. Esta herramienta los valida
                correctamente - el parser DOMParser de navegadores soporta namespaces estándar.
                Si ves error de "namespace no declarado", verifica que <code>xmlns="URL"</code>
                esté en el elemento raíz.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Ejemplo correcto:</strong> <code>&lt;rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"&gt;</code>.
                El prefijo <code>atom:</code> requiere la declaración xmlns. Para debugging, usa
                un validador XML online específico (W3C Validator) si esta herramienta no es suficiente.
              </p>
            </div>
          </div>
        </section>

        {/* Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>Guía Paso a Paso: Validar y Formatear como un Pro</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Pega o carga tu código JSON/XML</h4>
                <p>
                  Selecciona el tab correcto (JSON o XML) y pega tu código en el panel de entrada.
                  También puedes cargar un ejemplo predefinido para practicar. <strong>No elimines
                  espacios ni indentación todavía</strong> - la herramienta maneja todo tipo de formato.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Valida primero - detecta errores de sintaxis</h4>
                <p>
                  Haz clic en <strong>"Validar"</strong>. Si hay errores, verás un banner rojo con
                  la ubicación exacta (línea y columna). Los errores típicos: comas faltantes, comillas
                  sin cerrar, llaves desbalanceadas. <strong>Corrige el error en el panel de entrada</strong>
                  y vuelve a validar hasta que veas ✓ verde.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Formatea para legibilidad (desarrollo)</h4>
                <p>
                  Una vez válido, haz clic en <strong>"Formatear"</strong>. Esto añade indentación
                  (2 espacios por nivel), saltos de línea y espacios. Perfecto para archivos de
                  configuración, código que compartirás con el equipo o debugging. El resultado
                  aparece en el panel derecho - <strong>copia y pega en tu editor</strong>.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Minifica para producción (opcional)</h4>
                <p>
                  Si vas a usar el código en una API o archivo de producción, haz clic en <strong>"Minificar"</strong>.
                  Esto elimina TODOS los espacios, saltos de línea y comentarios XML. Reduce tamaño
                  ~20-40%, mejora latencia y ahorra bandwidth. <strong>Úsalo solo para producción</strong>
                  - código minificado es ilegible para humanos.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Copia el resultado al portapapeles</h4>
                <p>
                  Haz clic en <strong>"Copiar"</strong> en el panel derecho para copiar el resultado.
                  Ahora puedes pegarlo en tu editor (VS Code, Sublime), archivo de configuración
                  (package.json, .eslintrc) o enviar via API. <strong>Verifica que copiaste del panel
                  derecho</strong> (resultado), no del izquierdo (entrada).
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Integra en tu flujo de desarrollo</h4>
                <p>
                  <strong>Workflow recomendado:</strong> (1) Edita JSON en tu editor, (2) Antes de
                  commit, valida aquí para catch errores, (3) Formatea para consistencia con el equipo,
                  (4) Commit solo código validado. Esto evita romper builds por JSON inválido.
                  <strong>Tip pro:</strong> Usa extensiones de VS Code (Prettier) para formatear
                  automáticamente al guardar.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Debugging avanzado: divide y conquista</h4>
                <p>
                  Si tienes un JSON enorme con error difícil de encontrar, <strong>divide el archivo
                  a la mitad</strong> - pega la primera mitad aquí y valida. Si pasa, el error está
                  en la segunda mitad. Repite hasta aislar la sección problemática. Esto es mucho
                  más rápido que revisar 500 líneas línea por línea. <strong>Guarda versiones incrementales</strong>
                  mientras debuggeas - si rompes algo, vuelve atrás.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mejores Prácticas */}
        <section className={styles.tipsSection}>
          <h2>Mejores Prácticas Profesionales</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Valida ANTES de commit a Git</h4>
              <p>
                Un JSON inválido rompe builds y frustra al equipo. Valida siempre antes de push -
                evita CI/CD fallidos y rollbacks de emergencia.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Usa JSON Schema para validación estructural</h4>
              <p>
                Esta herramienta valida sintaxis, pero JSON Schema valida estructura (campos requeridos,
                tipos de datos). Combina ambas para APIs robustas.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Minifica solo en build, nunca en source</h4>
              <p>
                Mantén código fuente formateado (legible) y minifica automáticamente en tu pipeline
                de build. Nunca commitees JSON minificado a Git.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Evita JSON anidado más de 3 niveles</h4>
              <p>
                JSON con 5+ niveles de anidación es difícil de mantener y debuggear. Aplana la
                estructura o divide en múltiples archivos.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Prefiere JSON sobre XML para APIs nuevas</h4>
              <p>
                JSON es más rápido, más compacto y parseado nativamente en JavaScript. Usa XML solo
                si tienes requisitos específicos (SOAP, namespaces, comentarios).
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Automatiza validación con pre-commit hooks</h4>
              <p>
                Usa herramientas como Husky para validar JSON automáticamente antes de cada commit.
                Esto garantiza que solo código válido llegue al repo.
              </p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <h3>Errores Comunes que Rompen Producción</h3>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>❌ Usar comillas simples en JSON:</strong> JSON estándar SOLO acepta comillas
              dobles. JavaScript tolera simples, pero <code>JSON.parse()</code> falla. Esto rompe
              APIs y causa errores 500.
              <br/>
              <strong>Solución:</strong> Siempre usa <code>"clave": "valor"</code>, nunca <code>'clave': 'valor'</code>.
            </li>

            <li>
              <strong>❌ Coma final en último elemento de array/objeto:</strong> <code>{`{"a": 1,}`}</code>
              es inválido en JSON estándar (aunque JavaScript lo acepta). Causa errores en parsers
              estrictos y validadores.
              <br/>
              <strong>Solución:</strong> Elimina comas finales. Usa ESLint con regla <code>comma-dangle: "never"</code>
              para detectarlas automáticamente.
            </li>

            <li>
              <strong>❌ Comillas sin cerrar en strings largos:</strong> Si tu string contiene
              saltos de línea o caracteres especiales, fácilmente olvidas cerrar comillas. El error
              aparece 100 líneas después del problema real.
              <br/>
              <strong>Solución:</strong> Usa un editor con syntax highlighting (VS Code) que colorea
              strings - comillas sin cerrar se ven de inmediato. Para strings multilínea, usa <code>\n</code>.
            </li>

            <li>
              <strong>❌ Mezclar tabs y espacios en indentación:</strong> JSON no tiene regla
              oficial de indentación, pero mezclar tabs y espacios confunde a humanos y algunos
              parsers. Causa diffs enormes en Git sin cambios reales.
              <br/>
              <strong>Solución:</strong> Usa solo espacios (2 o 4, consistente). Configura tu editor
              para convertir tabs a espacios automáticamente.
            </li>

            <li>
              <strong>❌ Caracteres especiales sin escapar:</strong> Si tu string JSON contiene
              comillas dobles, barras invertidas o saltos de línea, debes escaparlas. <code>"texto con \"comillas\""</code>
              es válido, <code>"texto con "comillas""</code> rompe.
              <br/>
              <strong>Solución:</strong> Escapa <code>"</code> como <code>\"</code>, <code>\</code> como <code>\\</code>,
              saltos de línea como <code>\n</code>. Usa <code>JSON.stringify()</code> en JavaScript
              para escapar automáticamente.
            </li>

            <li>
              <strong>❌ Números con ceros a la izquierda:</strong> <code>{`{"edad": 007}`}</code> es
              inválido en JSON (interpretado como octal en JavaScript). Causa errores en parsers estrictos.
              <br/>
              <strong>Solución:</strong> Escribe números sin ceros a la izquierda: <code>7</code>, no <code>007</code>.
              Si necesitas mantener formato (códigos postales), usa strings: <code>"00700"</code>.
            </li>

            <li>
              <strong>❌ XML sin declaración de encoding:</strong> Si tu XML contiene caracteres
              especiales (ñ, á, €) y omites <code>&lt;?xml version="1.0" encoding="UTF-8"?&gt;</code>,
              parsers pueden malinterpretar caracteres. Causa text corruption.
              <br/>
              <strong>Solución:</strong> SIEMPRE incluye la declaración XML en la primera línea con
              <code>encoding="UTF-8"</code>. Esto garantiza compatibilidad internacional.
            </li>

            <li>
              <strong>❌ Confiar en JSON de APIs externas sin validar:</strong> APIs de terceros
              pueden devolver JSON malformado, campos faltantes o tipos incorrectos. Si haces
              <code>JSON.parse()</code> directamente, tu app crashea.
              <br/>
              <strong>Solución:</strong> Siempre valida JSON de APIs externas con try-catch y JSON
              Schema. Loggea errores en lugar de crashear. Usa librerías como <code>zod</code> o
              <code>ajv</code> para validación runtime.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('validador-json')} />

      <ShareCard appName="validador-json" />
      <Footer appName="validador-json" />
    </div>
  );
}
