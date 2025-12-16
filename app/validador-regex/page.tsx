'use client';

import { useState, useCallback, useMemo } from 'react';
import styles from './ValidadorRegex.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

interface Match {
  text: string;
  index: number;
  groups?: { [key: string]: string };
}

interface PatternExample {
  name: string;
  pattern: string;
  description: string;
  example: string;
}

const PATTERN_LIBRARY: PatternExample[] = [
  { name: 'Email', pattern: '^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$', description: 'Valida direcciones de email', example: 'usuario@ejemplo.com' },
  { name: 'Teléfono España', pattern: '^(\\+34)?[6789]\\d{8}$', description: 'Móviles y fijos españoles', example: '+34612345678' },
  { name: 'URL', pattern: '^https?:\\/\\/[\\w.-]+\\.[a-zA-Z]{2,}.*$', description: 'URLs con http/https', example: 'https://ejemplo.com/pagina' },
  { name: 'DNI/NIE', pattern: '^[0-9XYZ]\\d{7}[A-Z]$', description: 'DNI o NIE español', example: '12345678A' },
  { name: 'Código Postal', pattern: '^\\d{5}$', description: 'Código postal español (5 dígitos)', example: '28001' },
  { name: 'IBAN España', pattern: '^ES\\d{22}$', description: 'IBAN español', example: 'ES9121000418450200051332' },
  { name: 'Fecha DD/MM/YYYY', pattern: '^\\d{2}\\/\\d{2}\\/\\d{4}$', description: 'Formato de fecha español', example: '25/12/2024' },
  { name: 'Hora HH:MM', pattern: '^([01]\\d|2[0-3]):[0-5]\\d$', description: 'Hora en formato 24h', example: '14:30' },
  { name: 'IPv4', pattern: '^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$', description: 'Dirección IP v4', example: '192.168.1.1' },
  { name: 'Hexadecimal', pattern: '^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$', description: 'Color hexadecimal', example: '#FF5733' },
  { name: 'Solo letras', pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s]+$', description: 'Solo letras y espacios', example: 'Juan García' },
  { name: 'Solo números', pattern: '^\\d+$', description: 'Solo dígitos', example: '12345' },
];

export default function ValidadorRegexPage() {
  const [pattern, setPattern] = useState('');
  const [testText, setTestText] = useState('');
  const [flags, setFlags] = useState({ g: true, i: false, m: false });
  const [error, setError] = useState('');

  const toggleFlag = useCallback((flag: 'g' | 'i' | 'm') => {
    setFlags(prev => ({ ...prev, [flag]: !prev[flag] }));
  }, []);

  const loadPattern = useCallback((example: PatternExample) => {
    setPattern(example.pattern);
    setTestText(example.example);
    setError('');
  }, []);

  const flagString = useMemo(() => {
    return Object.entries(flags)
      .filter(([_, enabled]) => enabled)
      .map(([flag]) => flag)
      .join('');
  }, [flags]);

  const { matches, highlightedText, isValid } = useMemo(() => {
    if (!pattern) {
      return { matches: [], highlightedText: testText, isValid: true };
    }

    try {
      const regex = new RegExp(pattern, flagString);
      const foundMatches: Match[] = [];

      if (flags.g) {
        let match;
        while ((match = regex.exec(testText)) !== null) {
          foundMatches.push({
            text: match[0],
            index: match.index,
            groups: match.groups,
          });
          if (!match[0]) break; // Evitar loops infinitos con patrones vacíos
        }
      } else {
        const match = regex.exec(testText);
        if (match) {
          foundMatches.push({
            text: match[0],
            index: match.index,
            groups: match.groups,
          });
        }
      }

      // Generar texto resaltado
      let highlighted = testText;
      if (foundMatches.length > 0 && testText) {
        // Reemplazar de atrás hacia adelante para no afectar los índices
        const sortedMatches = [...foundMatches].sort((a, b) => b.index - a.index);
        for (const m of sortedMatches) {
          const before = highlighted.slice(0, m.index);
          const match = highlighted.slice(m.index, m.index + m.text.length);
          const after = highlighted.slice(m.index + m.text.length);
          highlighted = before + `<mark>${match}</mark>` + after;
        }
      }

      setError('');
      return { matches: foundMatches, highlightedText: highlighted, isValid: true };
    } catch (e) {
      setError((e as Error).message);
      return { matches: [], highlightedText: testText, isValid: false };
    }
  }, [pattern, testText, flagString, flags.g]);

  const handleClear = useCallback(() => {
    setPattern('');
    setTestText('');
    setError('');
  }, []);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Validador de Expresiones Regulares</h1>
        <p className={styles.subtitle}>Testa y valida regex con resaltado de coincidencias</p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Expresión Regular</h2>

          <div className={styles.patternInput}>
            <span className={styles.patternPrefix}>/</span>
            <input
              type="text"
              className={`${styles.patternField} ${error ? styles.patternError : ''}`}
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Escribe tu patrón regex..."
            />
            <span className={styles.patternSuffix}>/{flagString}</span>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <span>⚠️</span> {error}
            </div>
          )}

          <div className={styles.flagsSection}>
            <span className={styles.flagsLabel}>Flags:</span>
            <div className={styles.flagsButtons}>
              <button
                className={`${styles.flagBtn} ${flags.g ? styles.flagActive : ''}`}
                onClick={() => toggleFlag('g')}
                title="Global - Buscar todas las coincidencias"
              >
                g <span className={styles.flagDesc}>global</span>
              </button>
              <button
                className={`${styles.flagBtn} ${flags.i ? styles.flagActive : ''}`}
                onClick={() => toggleFlag('i')}
                title="Case Insensitive - Ignorar mayúsculas/minúsculas"
              >
                i <span className={styles.flagDesc}>insensible</span>
              </button>
              <button
                className={`${styles.flagBtn} ${flags.m ? styles.flagActive : ''}`}
                onClick={() => toggleFlag('m')}
                title="Multiline - ^ y $ aplican a cada línea"
              >
                m <span className={styles.flagDesc}>multilínea</span>
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Texto de prueba</label>
            <textarea
              className={styles.textarea}
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Escribe el texto donde buscar coincidencias..."
            />
          </div>

          <button onClick={handleClear} className={styles.btnSecondary}>
            Limpiar todo
          </button>
        </div>

        {/* Panel de resultados */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Resultados</h2>

          {testText && pattern && isValid ? (
            <>
              <div className={styles.matchCount}>
                <span className={styles.matchNumber}>{matches.length}</span>
                <span className={styles.matchLabel}>
                  {matches.length === 1 ? 'coincidencia' : 'coincidencias'}
                </span>
              </div>

              <div className={styles.highlightBox}>
                <h4>Texto con coincidencias resaltadas:</h4>
                <div
                  className={styles.highlightedText}
                  dangerouslySetInnerHTML={{ __html: highlightedText }}
                />
              </div>

              {matches.length > 0 && (
                <div className={styles.matchList}>
                  <h4>Detalle de coincidencias:</h4>
                  {matches.map((match, index) => (
                    <div key={index} className={styles.matchItem}>
                      <span className={styles.matchIndex}>#{index + 1}</span>
                      <code className={styles.matchText}>&quot;{match.text}&quot;</code>
                      <span className={styles.matchPosition}>posición {match.index}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🔍</span>
              <p>Escribe un patrón y texto para ver las coincidencias</p>
            </div>
          )}
        </div>
      </div>

      {/* Biblioteca de patrones */}
      <div className={styles.librarySection}>
        <h3>Biblioteca de Patrones Comunes</h3>
        <div className={styles.libraryGrid}>
          {PATTERN_LIBRARY.map((item, index) => (
            <button
              key={index}
              className={styles.libraryCard}
              onClick={() => loadPattern(item)}
            >
              <span className={styles.libraryName}>{item.name}</span>
              <code className={styles.libraryPattern}>{item.pattern}</code>
              <span className={styles.libraryDesc}>{item.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cheatsheet */}
      <div className={styles.cheatsheet}>
        <h3>Referencia Rápida</h3>
        <div className={styles.cheatGrid}>
          <div className={styles.cheatGroup}>
            <h4>Caracteres</h4>
            <div className={styles.cheatItem}><code>.</code> Cualquier carácter</div>
            <div className={styles.cheatItem}><code>\d</code> Dígito (0-9)</div>
            <div className={styles.cheatItem}><code>\w</code> Alfanumérico</div>
            <div className={styles.cheatItem}><code>\s</code> Espacio en blanco</div>
          </div>
          <div className={styles.cheatGroup}>
            <h4>Cuantificadores</h4>
            <div className={styles.cheatItem}><code>*</code> 0 o más</div>
            <div className={styles.cheatItem}><code>+</code> 1 o más</div>
            <div className={styles.cheatItem}><code>?</code> 0 o 1</div>
            <div className={styles.cheatItem}><code>{'{n}'}</code> Exactamente n</div>
          </div>
          <div className={styles.cheatGroup}>
            <h4>Anclas</h4>
            <div className={styles.cheatItem}><code>^</code> Inicio</div>
            <div className={styles.cheatItem}><code>$</code> Final</div>
            <div className={styles.cheatItem}><code>\b</code> Límite de palabra</div>
          </div>
          <div className={styles.cheatGroup}>
            <h4>Grupos</h4>
            <div className={styles.cheatItem}><code>(abc)</code> Grupo de captura</div>
            <div className={styles.cheatItem}><code>[abc]</code> Clase de caracteres</div>
            <div className={styles.cheatItem}><code>a|b</code> Alternancia</div>
          </div>
        </div>
      </div>

      <RelatedApps apps={getRelatedApps('validador-regex')} />

      <Footer appName="validador-regex" />
    </div>
  );
}
