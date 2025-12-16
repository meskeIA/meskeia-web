'use client';

import { useState } from 'react';
import styles from './ConversorTexto.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps} from '@/components';
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
        title="¿Quieres aprender más sobre conversión de texto?"
        subtitle="Descubre las diferentes transformaciones y cuándo usarlas"
      >
        <section className={styles.infoSection}>
          <h2>Tipos de conversión</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3>🔠 Mayúsculas y minúsculas</h3>
              <p>
                <strong>MAYÚSCULAS:</strong> Todo el texto en mayúsculas. Útil para títulos o énfasis.<br />
                <strong>minúsculas:</strong> Todo el texto en minúsculas. Ideal para normalizar texto.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>📝 Formatos de título</h3>
              <p>
                <strong>Capitalizar:</strong> Primera letra de cada palabra en mayúscula.<br />
                <strong>Formato Título:</strong> Similar pero respeta artículos y preposiciones.<br />
                <strong>Formato oración:</strong> Solo la primera letra de cada oración.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>🔄 Transformaciones</h3>
              <p>
                <strong>Alternar:</strong> Alterna mayúsculas y minúsculas (aLtErNaDo).<br />
                <strong>Invertir:</strong> Invierte el orden de los caracteres.<br />
                <strong>Sin acentos:</strong> Elimina tildes y diacríticos.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>💡 Consejos de uso</h3>
              <p>
                • Usa &quot;Formato Título&quot; para títulos de artículos en español<br />
                • &quot;Sin acentos&quot; es útil para URLs amigables<br />
                • &quot;Limpiar espacios&quot; elimina espacios duplicados
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('conversor-texto')} />

      <Footer appName="conversor-texto" />
    </div>
  );
}
