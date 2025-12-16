'use client';

import { useState, useCallback } from 'react';
import styles from './ValidadorJSON.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps } from '@/components';
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

      {/* Info sobre JSON/XML */}
      <div className={styles.infoSection}>
        <h3>¿Qué puedes hacer?</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>✓</span>
            <h4>Validar</h4>
            <p>Comprueba si tu código es sintácticamente correcto y detecta errores con ubicación exacta</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>{ }</span>
            <h4>Formatear</h4>
            <p>Añade indentación y saltos de línea para que tu código sea más legible</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>⚡</span>
            <h4>Minificar</h4>
            <p>Elimina espacios y saltos de línea para reducir el tamaño del archivo</p>
          </div>
        </div>
      </div>

      <RelatedApps apps={getRelatedApps('validador-json')} />

      <Footer appName="validador-json" />
    </div>
  );
}
