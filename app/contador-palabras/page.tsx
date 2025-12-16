'use client';

import { useState, useMemo } from 'react';
import styles from './ContadorPalabras.module.css';
import { MeskeiaLogo, Footer, RelatedApps} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ==================== TIPOS ====================

interface EstadisticasTexto {
  caracteres: number;
  caracteresSinEspacios: number;
  palabras: number;
  frases: number;
  parrafos: number;
  lineas: number;
  tiempoLectura: string;
  tiempoHablado: string;
}

interface PalabraFrecuencia {
  palabra: string;
  frecuencia: number;
  porcentaje: number;
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function ContadorPalabrasPage() {
  const [texto, setTexto] = useState('');
  const [mostrarDensidad, setMostrarDensidad] = useState(false);

  // Calcular estadísticas
  const estadisticas = useMemo((): EstadisticasTexto => {
    if (!texto.trim()) {
      return {
        caracteres: 0,
        caracteresSinEspacios: 0,
        palabras: 0,
        frases: 0,
        parrafos: 0,
        lineas: 0,
        tiempoLectura: '0 seg',
        tiempoHablado: '0 seg',
      };
    }

    // Caracteres
    const caracteres = texto.length;
    const caracteresSinEspacios = texto.replace(/\s/g, '').length;

    // Palabras (separadas por espacios, ignorando múltiples espacios)
    const palabrasArray = texto.trim().split(/\s+/).filter(p => p.length > 0);
    const palabras = palabrasArray.length;

    // Frases (terminan en . ! ? ... considerando abreviaturas comunes)
    const frases = (texto.match(/[.!?]+(?:\s|$)/g) || []).length || (texto.trim() ? 1 : 0);

    // Párrafos (separados por líneas en blanco)
    const parrafos = texto.split(/\n\s*\n/).filter(p => p.trim().length > 0).length || (texto.trim() ? 1 : 0);

    // Líneas
    const lineas = texto.split('\n').length;

    // Tiempo de lectura (200 palabras/minuto promedio)
    const minutosLectura = palabras / 200;
    let tiempoLectura: string;
    if (minutosLectura < 1) {
      tiempoLectura = `${Math.ceil(minutosLectura * 60)} seg`;
    } else if (minutosLectura < 60) {
      const mins = Math.floor(minutosLectura);
      const segs = Math.round((minutosLectura - mins) * 60);
      tiempoLectura = segs > 0 ? `${mins} min ${segs} seg` : `${mins} min`;
    } else {
      const horas = Math.floor(minutosLectura / 60);
      const mins = Math.round(minutosLectura % 60);
      tiempoLectura = `${horas} h ${mins} min`;
    }

    // Tiempo hablado (150 palabras/minuto promedio)
    const minutosHablado = palabras / 150;
    let tiempoHablado: string;
    if (minutosHablado < 1) {
      tiempoHablado = `${Math.ceil(minutosHablado * 60)} seg`;
    } else if (minutosHablado < 60) {
      const mins = Math.floor(minutosHablado);
      const segs = Math.round((minutosHablado - mins) * 60);
      tiempoHablado = segs > 0 ? `${mins} min ${segs} seg` : `${mins} min`;
    } else {
      const horas = Math.floor(minutosHablado / 60);
      const mins = Math.round(minutosHablado % 60);
      tiempoHablado = `${horas} h ${mins} min`;
    }

    return {
      caracteres,
      caracteresSinEspacios,
      palabras,
      frases,
      parrafos,
      lineas,
      tiempoLectura,
      tiempoHablado,
    };
  }, [texto]);

  // Calcular densidad de palabras (top 10)
  const densidadPalabras = useMemo((): PalabraFrecuencia[] => {
    if (!texto.trim()) return [];

    // Palabras a ignorar (stopwords en español)
    const stopwords = new Set([
      'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
      'de', 'del', 'al', 'a', 'en', 'con', 'por', 'para',
      'y', 'e', 'o', 'u', 'que', 'se', 'es', 'son', 'fue',
      'lo', 'le', 'les', 'su', 'sus', 'mi', 'tu', 'nos',
      'como', 'pero', 'si', 'no', 'más', 'ya', 'muy',
      'este', 'esta', 'estos', 'estas', 'ese', 'esa',
      'hay', 'ha', 'han', 'he', 'ser', 'estar', 'tiene',
    ]);

    // Contar frecuencia de palabras
    const palabras = texto
      .toLowerCase()
      .replace(/[^\wáéíóúüñ\s]/g, '')
      .split(/\s+/)
      .filter(p => p.length > 2 && !stopwords.has(p));

    const frecuencias: Record<string, number> = {};
    palabras.forEach(p => {
      frecuencias[p] = (frecuencias[p] || 0) + 1;
    });

    const totalPalabras = palabras.length;

    // Ordenar por frecuencia y tomar top 10
    return Object.entries(frecuencias)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([palabra, frecuencia]) => ({
        palabra,
        frecuencia,
        porcentaje: totalPalabras > 0 ? (frecuencia / totalPalabras) * 100 : 0,
      }));
  }, [texto]);

  // Limpiar texto
  const limpiarTexto = () => {
    setTexto('');
  };

  // Copiar estadísticas
  const copiarEstadisticas = async () => {
    const stats = `Estadísticas del texto:
- Palabras: ${formatNumber(estadisticas.palabras, 0)}
- Caracteres: ${formatNumber(estadisticas.caracteres, 0)}
- Caracteres (sin espacios): ${formatNumber(estadisticas.caracteresSinEspacios, 0)}
- Frases: ${formatNumber(estadisticas.frases, 0)}
- Párrafos: ${formatNumber(estadisticas.parrafos, 0)}
- Líneas: ${formatNumber(estadisticas.lineas, 0)}
- Tiempo de lectura: ${estadisticas.tiempoLectura}
- Tiempo hablado: ${estadisticas.tiempoHablado}`;

    try {
      await navigator.clipboard.writeText(stats);
      alert('Estadísticas copiadas al portapapeles');
    } catch {
      alert('No se pudieron copiar las estadísticas');
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Contador de Palabras</h1>
        <p className={styles.subtitle}>
          Analiza tu texto: palabras, caracteres, tiempo de lectura y más
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <section className={styles.inputPanel}>
          <div className={styles.inputHeader}>
            <h2 className={styles.sectionTitle}>Tu texto</h2>
            <div className={styles.inputActions}>
              <button onClick={limpiarTexto} className={styles.btnSecundario}>
                Limpiar
              </button>
            </div>
          </div>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe o pega tu texto aquí para analizar..."
            className={styles.textArea}
            rows={12}
          />
        </section>

        {/* Panel de resultados */}
        <section className={styles.resultsPanel}>
          <div className={styles.resultsHeader}>
            <h2 className={styles.sectionTitle}>Estadísticas</h2>
            <button onClick={copiarEstadisticas} className={styles.btnSecundario}>
              Copiar
            </button>
          </div>

          {/* Estadísticas principales */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{formatNumber(estadisticas.palabras, 0)}</span>
              <span className={styles.statLabel}>Palabras</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{formatNumber(estadisticas.caracteres, 0)}</span>
              <span className={styles.statLabel}>Caracteres</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{formatNumber(estadisticas.caracteresSinEspacios, 0)}</span>
              <span className={styles.statLabel}>Sin espacios</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{formatNumber(estadisticas.frases, 0)}</span>
              <span className={styles.statLabel}>Frases</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{formatNumber(estadisticas.parrafos, 0)}</span>
              <span className={styles.statLabel}>Párrafos</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{formatNumber(estadisticas.lineas, 0)}</span>
              <span className={styles.statLabel}>Líneas</span>
            </div>
          </div>

          {/* Tiempos */}
          <div className={styles.tiemposGrid}>
            <div className={styles.tiempoCard}>
              <span className={styles.tiempoIcon}>📖</span>
              <div className={styles.tiempoInfo}>
                <span className={styles.tiempoLabel}>Tiempo de lectura</span>
                <span className={styles.tiempoValue}>{estadisticas.tiempoLectura}</span>
              </div>
            </div>
            <div className={styles.tiempoCard}>
              <span className={styles.tiempoIcon}>🎤</span>
              <div className={styles.tiempoInfo}>
                <span className={styles.tiempoLabel}>Tiempo hablado</span>
                <span className={styles.tiempoValue}>{estadisticas.tiempoHablado}</span>
              </div>
            </div>
          </div>

          {/* Toggle densidad */}
          <button
            onClick={() => setMostrarDensidad(!mostrarDensidad)}
            className={styles.btnDensidad}
          >
            {mostrarDensidad ? '▼' : '▶'} Densidad de palabras clave
          </button>

          {/* Densidad de palabras */}
          {mostrarDensidad && (
            <div className={styles.densidadPanel}>
              {densidadPalabras.length > 0 ? (
                <div className={styles.densidadLista}>
                  {densidadPalabras.map((item, index) => (
                    <div key={item.palabra} className={styles.densidadItem}>
                      <span className={styles.densidadRank}>{index + 1}</span>
                      <span className={styles.densidadPalabra}>{item.palabra}</span>
                      <span className={styles.densidadFrecuencia}>{item.frecuencia}x</span>
                      <div className={styles.densidadBarContainer}>
                        <div
                          className={styles.densidadBar}
                          style={{ width: `${Math.min(item.porcentaje * 5, 100)}%` }}
                        />
                      </div>
                      <span className={styles.densidadPorcentaje}>
                        {formatNumber(item.porcentaje, 1)}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.densidadVacia}>
                  Escribe texto para ver la densidad de palabras clave
                </p>
              )}
              <p className={styles.densidadNota}>
                * Se excluyen palabras comunes (artículos, preposiciones, etc.)
              </p>
            </div>
          )}
        </section>
      </div>

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
              <p>Resultados instantáneos mientras escribes</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>📊</span>
            <div>
              <strong>Análisis SEO</strong>
              <p>Densidad de palabras clave para optimización</p>
            </div>
          </div>
        </div>
      </section>

      <RelatedApps apps={getRelatedApps('contador-palabras')} />

      <Footer appName="contador-palabras" />
    </div>
  );
}
