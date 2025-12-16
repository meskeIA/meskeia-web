'use client';

import { useState, useMemo } from 'react';
import styles from './LimpiadorTexto.module.css';
import { MeskeiaLogo, Footer, RelatedApps} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ==================== TIPOS ====================

interface OpcionLimpieza {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function LimpiadorTextoPage() {
  const [textoEntrada, setTextoEntrada] = useState('');
  const [opciones, setOpciones] = useState<OpcionLimpieza[]>([
    { id: 'espaciosExtra', nombre: 'Espacios extra', descripcion: 'Reduce múltiples espacios a uno solo', activo: true },
    { id: 'espaciosInicio', nombre: 'Espacios inicio/fin', descripcion: 'Elimina espacios al inicio y fin de líneas', activo: true },
    { id: 'lineasVacias', nombre: 'Líneas vacías', descripcion: 'Elimina líneas en blanco', activo: false },
    { id: 'lineasDuplicadas', nombre: 'Líneas duplicadas', descripcion: 'Elimina líneas repetidas', activo: false },
    { id: 'saltosLinea', nombre: 'Saltos de línea', descripcion: 'Convierte a una sola línea', activo: false },
    { id: 'tabulaciones', nombre: 'Tabulaciones', descripcion: 'Elimina caracteres de tabulación', activo: false },
    { id: 'caracteresEspeciales', nombre: 'Caracteres especiales', descripcion: 'Elimina símbolos y caracteres especiales', activo: false },
    { id: 'numeros', nombre: 'Números', descripcion: 'Elimina todos los dígitos', activo: false },
    { id: 'puntuacion', nombre: 'Puntuación', descripcion: 'Elimina signos de puntuación', activo: false },
    { id: 'emojis', nombre: 'Emojis', descripcion: 'Elimina emojis y símbolos Unicode', activo: false },
    { id: 'html', nombre: 'Etiquetas HTML', descripcion: 'Elimina tags HTML/XML', activo: false },
    { id: 'urls', nombre: 'URLs', descripcion: 'Elimina enlaces http/https', activo: false },
    { id: 'emails', nombre: 'Emails', descripcion: 'Elimina direcciones de correo', activo: false },
  ]);

  // Toggle opción
  const toggleOpcion = (id: string) => {
    setOpciones(opciones.map(op =>
      op.id === id ? { ...op, activo: !op.activo } : op
    ));
  };

  // Seleccionar todas / ninguna
  const seleccionarTodas = () => {
    setOpciones(opciones.map(op => ({ ...op, activo: true })));
  };

  const seleccionarNinguna = () => {
    setOpciones(opciones.map(op => ({ ...op, activo: false })));
  };

  // Aplicar limpieza
  const textoLimpio = useMemo(() => {
    if (!textoEntrada) return '';

    let resultado = textoEntrada;

    opciones.forEach(op => {
      if (!op.activo) return;

      switch (op.id) {
        case 'espaciosExtra':
          resultado = resultado.replace(/ {2,}/g, ' ');
          break;
        case 'espaciosInicio':
          resultado = resultado.split('\n').map(linea => linea.trim()).join('\n');
          break;
        case 'lineasVacias':
          resultado = resultado.split('\n').filter(linea => linea.trim() !== '').join('\n');
          break;
        case 'lineasDuplicadas':
          const lineas = resultado.split('\n');
          const lineasUnicas: string[] = [];
          const vistas = new Set<string>();
          lineas.forEach(linea => {
            const lineaNormalizada = linea.trim().toLowerCase();
            if (!vistas.has(lineaNormalizada)) {
              vistas.add(lineaNormalizada);
              lineasUnicas.push(linea);
            }
          });
          resultado = lineasUnicas.join('\n');
          break;
        case 'saltosLinea':
          resultado = resultado.replace(/\n+/g, ' ').replace(/ {2,}/g, ' ').trim();
          break;
        case 'tabulaciones':
          resultado = resultado.replace(/\t/g, ' ');
          break;
        case 'caracteresEspeciales':
          resultado = resultado.replace(/[^\w\sáéíóúüñÁÉÍÓÚÜÑ.,;:!?¿¡'"()-]/g, '');
          break;
        case 'numeros':
          resultado = resultado.replace(/\d/g, '');
          break;
        case 'puntuacion':
          resultado = resultado.replace(/[.,;:!?¿¡'"()\-–—…]/g, '');
          break;
        case 'emojis':
          resultado = resultado.replace(/[\u{1F600}-\u{1F6FF}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]/gu, '');
          break;
        case 'html':
          resultado = resultado.replace(/<[^>]*>/g, '');
          break;
        case 'urls':
          resultado = resultado.replace(/https?:\/\/[^\s]+/g, '');
          break;
        case 'emails':
          resultado = resultado.replace(/[\w.-]+@[\w.-]+\.\w+/g, '');
          break;
      }
    });

    return resultado;
  }, [textoEntrada, opciones]);

  // Estadísticas
  const estadisticas = useMemo(() => {
    const caracteresAntes = textoEntrada.length;
    const caracteresDespues = textoLimpio.length;
    const diferencia = caracteresAntes - caracteresDespues;
    const porcentaje = caracteresAntes > 0 ? (diferencia / caracteresAntes) * 100 : 0;

    return {
      caracteresAntes,
      caracteresDespues,
      diferencia,
      porcentaje,
    };
  }, [textoEntrada, textoLimpio]);

  // Copiar resultado
  const copiarResultado = async () => {
    if (!textoLimpio) return;
    try {
      await navigator.clipboard.writeText(textoLimpio);
      alert('Texto copiado al portapapeles');
    } catch {
      alert('No se pudo copiar el texto');
    }
  };

  // Limpiar todo
  const limpiarTodo = () => {
    setTextoEntrada('');
  };

  // Usar resultado como entrada
  const usarResultado = () => {
    setTextoEntrada(textoLimpio);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Limpiador de Texto</h1>
        <p className={styles.subtitle}>
          Elimina espacios extra, líneas duplicadas, caracteres especiales y más
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de opciones */}
        <section className={styles.opcionesPanel}>
          <div className={styles.opcionesHeader}>
            <h2 className={styles.sectionTitle}>Opciones de limpieza</h2>
            <div className={styles.opcionesAcciones}>
              <button onClick={seleccionarTodas} className={styles.btnMini}>
                Todas
              </button>
              <button onClick={seleccionarNinguna} className={styles.btnMini}>
                Ninguna
              </button>
            </div>
          </div>
          <div className={styles.opcionesGrid}>
            {opciones.map(op => (
              <label key={op.id} className={styles.opcionItem}>
                <input
                  type="checkbox"
                  checked={op.activo}
                  onChange={() => toggleOpcion(op.id)}
                  className={styles.opcionCheckbox}
                />
                <div className={styles.opcionInfo}>
                  <span className={styles.opcionNombre}>{op.nombre}</span>
                  <span className={styles.opcionDesc}>{op.descripcion}</span>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Panel de texto */}
        <div className={styles.textosContainer}>
          {/* Entrada */}
          <section className={styles.textoPanel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.sectionTitle}>Texto original</h2>
              <button onClick={limpiarTodo} className={styles.btnSecundario}>
                Limpiar
              </button>
            </div>
            <textarea
              value={textoEntrada}
              onChange={(e) => setTextoEntrada(e.target.value)}
              placeholder="Pega o escribe tu texto aquí..."
              className={styles.textArea}
              rows={10}
            />
          </section>

          {/* Estadísticas */}
          {textoEntrada && (
            <div className={styles.statsBar}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Antes:</span>
                <span className={styles.statValue}>{formatNumber(estadisticas.caracteresAntes, 0)}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Después:</span>
                <span className={styles.statValue}>{formatNumber(estadisticas.caracteresDespues, 0)}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Eliminados:</span>
                <span className={`${styles.statValue} ${styles.statHighlight}`}>
                  {formatNumber(estadisticas.diferencia, 0)} ({formatNumber(estadisticas.porcentaje, 1)}%)
                </span>
              </div>
              <button onClick={usarResultado} className={styles.btnUsar} title="Usar resultado como entrada">
                ↓ Aplicar
              </button>
            </div>
          )}

          {/* Salida */}
          <section className={styles.textoPanel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.sectionTitle}>Texto limpio</h2>
              <button
                onClick={copiarResultado}
                className={styles.btnSecundario}
                disabled={!textoLimpio}
              >
                Copiar
              </button>
            </div>
            <textarea
              value={textoLimpio}
              readOnly
              placeholder="El resultado aparecerá aquí..."
              className={styles.textArea}
              rows={10}
            />
          </section>
        </div>
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
              <p>Ve los cambios mientras escribes</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>🔄</span>
            <div>
              <strong>Múltiples pasadas</strong>
              <p>Aplica el resultado como entrada</p>
            </div>
          </div>
        </div>
      </section>

      <RelatedApps apps={getRelatedApps('limpiador-texto')} />

      <Footer appName="limpiador-texto" />
    </div>
  );
}
