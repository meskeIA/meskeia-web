'use client';

import { useState, useMemo } from 'react';
import styles from './ComparadorTextos.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice } from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ==================== TIPOS ====================

type TipoDiferencia = 'igual' | 'agregado' | 'eliminado' | 'modificado';

interface LineaDiff {
  numeroIzq: number | null;
  numeroDer: number | null;
  contenidoIzq: string;
  contenidoDer: string;
  tipo: TipoDiferencia;
}

interface EstadisticasDiff {
  lineasIguales: number;
  lineasAgregadas: number;
  lineasEliminadas: number;
  lineasModificadas: number;
  porcentajeSimilitud: number;
}

// ==================== ALGORITMO DIFF ====================

function calcularLCS(arr1: string[], arr2: string[]): number[][] {
  const m = arr1.length;
  const n = arr2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (arr1[i - 1] === arr2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

function generarDiff(texto1: string, texto2: string): LineaDiff[] {
  const lineas1 = texto1.split('\n');
  const lineas2 = texto2.split('\n');
  const dp = calcularLCS(lineas1, lineas2);
  const resultado: LineaDiff[] = [];

  let i = lineas1.length;
  let j = lineas2.length;

  const tempResultado: LineaDiff[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && lineas1[i - 1] === lineas2[j - 1]) {
      tempResultado.push({
        numeroIzq: i,
        numeroDer: j,
        contenidoIzq: lineas1[i - 1],
        contenidoDer: lineas2[j - 1],
        tipo: 'igual',
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      tempResultado.push({
        numeroIzq: null,
        numeroDer: j,
        contenidoIzq: '',
        contenidoDer: lineas2[j - 1],
        tipo: 'agregado',
      });
      j--;
    } else {
      tempResultado.push({
        numeroIzq: i,
        numeroDer: null,
        contenidoIzq: lineas1[i - 1],
        contenidoDer: '',
        tipo: 'eliminado',
      });
      i--;
    }
  }

  // Invertir para orden correcto
  for (let k = tempResultado.length - 1; k >= 0; k--) {
    resultado.push(tempResultado[k]);
  }

  return resultado;
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function ComparadorTextosPage() {
  const [texto1, setTexto1] = useState('');
  const [texto2, setTexto2] = useState('');
  const [ignorarEspacios, setIgnorarEspacios] = useState(false);
  const [ignorarMayusculas, setIgnorarMayusculas] = useState(false);

  // Calcular diff
  const diff = useMemo(() => {
    let t1 = texto1;
    let t2 = texto2;

    if (ignorarEspacios) {
      t1 = t1.replace(/\s+/g, ' ').trim();
      t2 = t2.replace(/\s+/g, ' ').trim();
    }

    if (ignorarMayusculas) {
      t1 = t1.toLowerCase();
      t2 = t2.toLowerCase();
    }

    return generarDiff(t1, t2);
  }, [texto1, texto2, ignorarEspacios, ignorarMayusculas]);

  // Estadísticas
  const estadisticas = useMemo((): EstadisticasDiff => {
    const lineasIguales = diff.filter(d => d.tipo === 'igual').length;
    const lineasAgregadas = diff.filter(d => d.tipo === 'agregado').length;
    const lineasEliminadas = diff.filter(d => d.tipo === 'eliminado').length;
    const lineasModificadas = 0; // En este algoritmo simple no detectamos modificaciones

    const totalLineas = diff.length;
    const porcentajeSimilitud = totalLineas > 0
      ? (lineasIguales / totalLineas) * 100
      : 100;

    return {
      lineasIguales,
      lineasAgregadas,
      lineasEliminadas,
      lineasModificadas,
      porcentajeSimilitud,
    };
  }, [diff]);

  // Limpiar todo
  const limpiarTodo = () => {
    setTexto1('');
    setTexto2('');
  };

  // Intercambiar textos
  const intercambiarTextos = () => {
    const temp = texto1;
    setTexto1(texto2);
    setTexto2(temp);
  };

  // Cargar ejemplo
  const cargarEjemplo = () => {
    setTexto1(`Hola mundo
Este es un texto de ejemplo
Línea tres del original
Última línea`);
    setTexto2(`Hola mundo
Este es un texto modificado
Nueva línea agregada
Última línea`);
  };

  const hayTexto = texto1.trim() || texto2.trim();
  const hayDiferencias = diff.some(d => d.tipo !== 'igual');

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Comparador de Textos</h1>
        <p className={styles.subtitle}>
          Encuentra las diferencias entre dos textos (estilo Diff)
        </p>
      </header>

      <LegalNotice />

      {/* Opciones */}
      <div className={styles.opcionesBar}>
        <div className={styles.opcionesGrupo}>
          <label className={styles.opcionCheck}>
            <input
              type="checkbox"
              checked={ignorarEspacios}
              onChange={(e) => setIgnorarEspacios(e.target.checked)}
            />
            Ignorar espacios extra
          </label>
          <label className={styles.opcionCheck}>
            <input
              type="checkbox"
              checked={ignorarMayusculas}
              onChange={(e) => setIgnorarMayusculas(e.target.checked)}
            />
            Ignorar mayúsculas/minúsculas
          </label>
        </div>
        <div className={styles.opcionesBotones}>
          <button onClick={cargarEjemplo} className={styles.btnSecundario}>
            Cargar ejemplo
          </button>
          <button onClick={intercambiarTextos} className={styles.btnSecundario}>
            ↔ Intercambiar
          </button>
          <button onClick={limpiarTodo} className={styles.btnSecundario}>
            Limpiar
          </button>
        </div>
      </div>

      {/* Paneles de texto */}
      <div className={styles.textosGrid}>
        <section className={styles.textoPanel}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.labelOriginal}>Texto original</span>
          </h2>
          <textarea
            value={texto1}
            onChange={(e) => setTexto1(e.target.value)}
            placeholder="Pega o escribe el texto original..."
            className={styles.textArea}
            rows={10}
          />
        </section>

        <section className={styles.textoPanel}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.labelModificado}>Texto modificado</span>
          </h2>
          <textarea
            value={texto2}
            onChange={(e) => setTexto2(e.target.value)}
            placeholder="Pega o escribe el texto modificado..."
            className={styles.textArea}
            rows={10}
          />
        </section>
      </div>

      {/* Estadísticas */}
      {hayTexto && (
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statDot} data-tipo="igual"></span>
            <span>{formatNumber(estadisticas.lineasIguales, 0)} iguales</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statDot} data-tipo="agregado"></span>
            <span>{formatNumber(estadisticas.lineasAgregadas, 0)} añadidas</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statDot} data-tipo="eliminado"></span>
            <span>{formatNumber(estadisticas.lineasEliminadas, 0)} eliminadas</span>
          </div>
          <div className={styles.statSimilitud}>
            <strong>{formatNumber(estadisticas.porcentajeSimilitud, 1)}%</strong>
            <span>similitud</span>
          </div>
        </div>
      )}

      {/* Resultado Diff */}
      {hayTexto && (
        <section className={styles.diffPanel}>
          <h2 className={styles.sectionTitle}>Comparación línea a línea</h2>

          {!hayDiferencias ? (
            <div className={styles.sinDiferencias}>
              <span className={styles.checkIcon}>✓</span>
              <p>Los textos son idénticos</p>
            </div>
          ) : (
            <div className={styles.diffContainer}>
              <div className={styles.diffHeader}>
                <span className={styles.diffHeaderCol}>#</span>
                <span className={styles.diffHeaderCol}>Original</span>
                <span className={styles.diffHeaderCol}>#</span>
                <span className={styles.diffHeaderCol}>Modificado</span>
              </div>
              <div className={styles.diffBody}>
                {diff.map((linea, index) => (
                  <div
                    key={index}
                    className={`${styles.diffRow} ${styles[`diff${linea.tipo.charAt(0).toUpperCase() + linea.tipo.slice(1)}`]}`}
                  >
                    <span className={styles.diffNum}>
                      {linea.numeroIzq || ''}
                    </span>
                    <span className={styles.diffContent}>
                      {linea.tipo === 'eliminado' && <span className={styles.diffMark}>-</span>}
                      {linea.contenidoIzq || '\u00A0'}
                    </span>
                    <span className={styles.diffNum}>
                      {linea.numeroDer || ''}
                    </span>
                    <span className={styles.diffContent}>
                      {linea.tipo === 'agregado' && <span className={styles.diffMark}>+</span>}
                      {linea.contenidoDer || '\u00A0'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Leyenda */}
      {hayTexto && hayDiferencias && (
        <div className={styles.leyenda}>
          <span className={styles.leyendaItem}>
            <span className={styles.leyendaColor} data-tipo="igual"></span>
            Sin cambios
          </span>
          <span className={styles.leyendaItem}>
            <span className={styles.leyendaColor} data-tipo="agregado"></span>
            Línea añadida
          </span>
          <span className={styles.leyendaItem}>
            <span className={styles.leyendaColor} data-tipo="eliminado"></span>
            Línea eliminada
          </span>
        </div>
      )}

      {/* Info panel */}
      <section className={styles.infoPanel}>
        <h3>Sobre esta herramienta</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>🔒</span>
            <div>
              <strong>100% Privado</strong>
              <p>Tu texto nunca sale de tu navegador</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>⚡</span>
            <div>
              <strong>Tiempo real</strong>
              <p>Comparación instantánea mientras escribes</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>📊</span>
            <div>
              <strong>Estadísticas</strong>
              <p>Porcentaje de similitud y conteo de cambios</p>
            </div>
          </div>
        </div>
      </section>

      <RelatedApps apps={getRelatedApps('comparador-textos')} />

      <Footer appName="comparador-textos" />
    </div>
  );
}
