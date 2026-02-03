'use client';

import { useState } from 'react';
import styles from './ConversorBinario.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type ModoType = 'texto-binario' | 'binario-texto';

interface Conversiones {
  binario: string;
  hexadecimal: string;
  octal: string;
  decimal: string;
}

export default function ConversorBinarioPage() {
  const [modo, setModo] = useState<ModoType>('texto-binario');
  const [entrada, setEntrada] = useState('');
  const [resultado, setResultado] = useState('');
  const [conversiones, setConversiones] = useState<Conversiones | null>(null);
  const [error, setError] = useState('');

  const textoABinario = (texto: string): string => {
    return texto
      .split('')
      .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join(' ');
  };

  const binarioATexto = (binario: string): string => {
    const bytes = binario.replace(/\s+/g, '').match(/.{1,8}/g);
    if (!bytes) return '';

    return bytes
      .map(byte => {
        const num = parseInt(byte, 2);
        if (isNaN(num)) throw new Error('Binario inválido');
        return String.fromCharCode(num);
      })
      .join('');
  };

  const calcularConversiones = (texto: string): Conversiones => {
    const binario = textoABinario(texto);
    const hexadecimal = texto
      .split('')
      .map(char => char.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase())
      .join(' ');
    const octal = texto
      .split('')
      .map(char => char.charCodeAt(0).toString(8).padStart(3, '0'))
      .join(' ');
    const decimal = texto
      .split('')
      .map(char => char.charCodeAt(0).toString())
      .join(' ');

    return { binario, hexadecimal, octal, decimal };
  };

  const convertir = () => {
    setError('');
    setConversiones(null);

    try {
      if (modo === 'texto-binario') {
        if (!entrada.trim()) return;
        const binario = textoABinario(entrada);
        setResultado(binario);
        setConversiones(calcularConversiones(entrada));
      } else {
        if (!entrada.trim()) return;
        const texto = binarioATexto(entrada);
        setResultado(texto);
        setConversiones(calcularConversiones(texto));
      }
    } catch {
      setError('Error en la conversión. Verifica que el formato sea correcto.');
    }
  };

  const intercambiar = () => {
    setModo(modo === 'texto-binario' ? 'binario-texto' : 'texto-binario');
    setEntrada('');
    setResultado('');
    setConversiones(null);
    setError('');
  };

  const limpiar = () => {
    setEntrada('');
    setResultado('');
    setConversiones(null);
    setError('');
  };

  const copiarResultado = async () => {
    if (resultado) {
      await navigator.clipboard.writeText(resultado);
    }
  };

  const cargarEjemplo = (texto: string) => {
    if (modo === 'texto-binario') {
      setEntrada(texto);
    } else {
      setEntrada(textoABinario(texto));
    }
    setResultado('');
    setConversiones(null);
    setError('');
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Conversor Binario</h1>
        <p className={styles.subtitle}>
          Convierte texto a código binario (0 y 1) y viceversa
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        <div className={styles.modeSelector}>
          <button
            className={`${styles.modeBtn} ${modo === 'texto-binario' ? styles.active : ''}`}
            onClick={() => { setModo('texto-binario'); setEntrada(''); setResultado(''); setConversiones(null); setError(''); }}
          >
            Texto → Binario
          </button>
          <button
            className={`${styles.modeBtn} ${modo === 'binario-texto' ? styles.active : ''}`}
            onClick={() => { setModo('binario-texto'); setEntrada(''); setResultado(''); setConversiones(null); setError(''); }}
          >
            Binario → Texto
          </button>
        </div>

        <div className={styles.inputSection}>
          <label className={styles.label}>
            {modo === 'texto-binario' ? 'Texto' : 'Código binario'}
          </label>
          <textarea
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
            placeholder={modo === 'texto-binario'
              ? 'Escribe tu texto aquí...'
              : 'Introduce código binario (ej: 01001000 01101111 01101100 01100001)'}
            className={styles.textarea}
            rows={4}
          />
          <div className={styles.examples}>
            <span className={styles.exampleLabel}>Ejemplos:</span>
            <button onClick={() => cargarEjemplo('Hola')} className={styles.exampleBtn}>Hola</button>
            <button onClick={() => cargarEjemplo('ABC')} className={styles.exampleBtn}>ABC</button>
            <button onClick={() => cargarEjemplo('123')} className={styles.exampleBtn}>123</button>
            <button onClick={() => cargarEjemplo('meskeIA')} className={styles.exampleBtn}>meskeIA</button>
          </div>
        </div>

        {error && <div className={styles.errorMsg}>{error}</div>}

        <div className={styles.buttonRow}>
          <button onClick={convertir} className={styles.btnPrimary} disabled={!entrada.trim()}>
            Convertir
          </button>
          <button onClick={intercambiar} className={styles.btnSwap} title="Intercambiar">
            ⇄
          </button>
          <button onClick={limpiar} className={styles.btnSecondary}>
            Limpiar
          </button>
        </div>

        {resultado && (
          <div className={styles.resultSection}>
            <label className={styles.label}>
              {modo === 'texto-binario' ? 'Código binario:' : 'Texto:'}
            </label>
            <div className={styles.resultBox}>{resultado}</div>
            <button onClick={copiarResultado} className={styles.btnCopy}>
              📋 Copiar
            </button>
          </div>
        )}

        {conversiones && (
          <div className={styles.conversionGrid}>
            <div className={styles.conversionCard}>
              <h4>Binario (Base 2)</h4>
              <code>{conversiones.binario}</code>
            </div>
            <div className={styles.conversionCard}>
              <h4>Hexadecimal (Base 16)</h4>
              <code>{conversiones.hexadecimal}</code>
            </div>
            <div className={styles.conversionCard}>
              <h4>Octal (Base 8)</h4>
              <code>{conversiones.octal}</code>
            </div>
            <div className={styles.conversionCard}>
              <h4>Decimal / ASCII</h4>
              <code>{conversiones.decimal}</code>
            </div>
          </div>
        )}
      </div>

      <section className={styles.tableSection}>
        <h2>Tabla ASCII Básica</h2>
        <div className={styles.asciiTable}>
          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', '0', '1', '2', '3', '4', '5'].map(char => (
            <div key={char} className={styles.asciiItem}>
              <span className={styles.asciiChar}>{char}</span>
              <span className={styles.asciiBin}>{char.charCodeAt(0).toString(2).padStart(8, '0')}</span>
              <span className={styles.asciiDec}>{char.charCodeAt(0)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.infoSection}>
        <h2>¿Qué es el Código Binario?</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>💻 Base de la computación</h3>
            <p>
              Los ordenadores solo entienden 0 y 1 (apagado/encendido).
              Todo lo que ves en pantalla está representado en binario internamente.
            </p>
          </div>
          <div className={styles.infoCard}>
            <h3>📊 Sistema Base 2</h3>
            <p>
              Cada posición vale el doble que la anterior: 1, 2, 4, 8, 16, 32...
              Un byte (8 bits) puede representar valores del 0 al 255.
            </p>
          </div>
          <div className={styles.infoCard}>
            <h3>🔤 ASCII</h3>
            <p>
              Estándar que asigna números a caracteres. A=65, B=66, a=97...
              Cada carácter ocupa 8 bits (1 byte) en ASCII básico.
            </p>
          </div>
        </div>
      </section>

      <RelatedApps apps={getRelatedApps('conversor-binario')} />

      <Footer appName="conversor-binario" />
    </div>
  );
}
