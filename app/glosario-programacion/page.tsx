'use client';

import { useState, useMemo } from 'react';
import styles from './GlosarioProgramacion.module.css';
import { MeskeiaLogo, Footer, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  TERMINOS,
  CATEGORIAS,
  getLetrasDisponibles,
  buscarTerminos,
  type Termino,
  type Categoria,
} from './data/terminos';

// Alfabeto completo para mostrar todas las letras
const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function GlosarioProgramacionPage() {
  const [letraSeleccionada, setLetraSeleccionada] = useState<string | null>(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [terminoExpandido, setTerminoExpandido] = useState<string | null>(null);

  const letrasDisponibles = useMemo(() => getLetrasDisponibles(), []);

  // Filtrar términos según criterios
  const terminosFiltrados = useMemo(() => {
    let resultado = TERMINOS;

    // Filtro por búsqueda
    if (busqueda.trim()) {
      resultado = buscarTerminos(busqueda);
    }
    // Filtro por letra
    else if (letraSeleccionada) {
      resultado = resultado.filter(t =>
        t.termino[0].toUpperCase() === letraSeleccionada
      );
    }

    // Filtro por categoría (se aplica siempre)
    if (categoriaSeleccionada) {
      resultado = resultado.filter(t => t.categoria === categoriaSeleccionada);
    }

    return resultado;
  }, [busqueda, letraSeleccionada, categoriaSeleccionada]);

  // Limpiar filtros
  const limpiarFiltros = () => {
    setLetraSeleccionada(null);
    setCategoriaSeleccionada(null);
    setBusqueda('');
  };

  // Toggle expandir/colapsar término
  const toggleTermino = (id: string) => {
    setTerminoExpandido(prev => prev === id ? null : id);
  };

  // Buscar término por nombre (para los relacionados)
  const buscarTerminoPorNombre = (nombre: string): Termino | undefined => {
    return TERMINOS.find(t =>
      t.termino.toLowerCase() === nombre.toLowerCase()
    );
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>📖</span>
        <h1 className={styles.title}>Glosario de Programación</h1>
        <p className={styles.subtitle}>
          Más de {TERMINOS.length} términos esenciales de desarrollo web explicados en español
        </p>
      </header>

      {/* Buscador */}
      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setLetraSeleccionada(null);
            }}
            placeholder="Buscar término, traducción o definición..."
            className={styles.searchInput}
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className={styles.clearSearch}
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filtro alfabético */}
      <div className={styles.alfabetoSection}>
        <div className={styles.alfabetoWrapper}>
          <button
            onClick={() => {
              setLetraSeleccionada(null);
              setBusqueda('');
            }}
            className={`${styles.letraBtn} ${!letraSeleccionada && !busqueda ? styles.letraActiva : ''}`}
          >
            Todos
          </button>
          {ALFABETO.map(letra => {
            const disponible = letrasDisponibles.includes(letra);
            return (
              <button
                key={letra}
                onClick={() => {
                  if (disponible) {
                    setLetraSeleccionada(letra);
                    setBusqueda('');
                  }
                }}
                className={`${styles.letraBtn} ${letraSeleccionada === letra ? styles.letraActiva : ''} ${!disponible ? styles.letraDisabled : ''}`}
                disabled={!disponible}
              >
                {letra}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtro por categorías */}
      <div className={styles.categoriasSection}>
        <div className={styles.categoriasWrapper}>
          <button
            onClick={() => setCategoriaSeleccionada(null)}
            className={`${styles.categoriaBtn} ${!categoriaSeleccionada ? styles.categoriaActiva : ''}`}
          >
            📚 Todas
          </button>
          {Object.entries(CATEGORIAS).map(([key, { nombre, icono }]) => (
            <button
              key={key}
              onClick={() => setCategoriaSeleccionada(key as Categoria)}
              className={`${styles.categoriaBtn} ${categoriaSeleccionada === key ? styles.categoriaActiva : ''}`}
            >
              {icono} {nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Contador de resultados */}
      <div className={styles.resultadosInfo}>
        <span className={styles.contador}>
          {terminosFiltrados.length} {terminosFiltrados.length === 1 ? 'término encontrado' : 'términos encontrados'}
        </span>
        {(letraSeleccionada || categoriaSeleccionada || busqueda) && (
          <button onClick={limpiarFiltros} className={styles.limpiarBtn}>
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Lista de términos */}
      <div className={styles.terminosSection}>
        {terminosFiltrados.length === 0 ? (
          <div className={styles.sinResultados}>
            <span className={styles.sinResultadosIcon}>🔍</span>
            <p>No se encontraron términos con esos criterios</p>
            <button onClick={limpiarFiltros} className={styles.btnSecondary}>
              Ver todos los términos
            </button>
          </div>
        ) : (
          <div className={styles.terminosGrid}>
            {terminosFiltrados.map(termino => (
              <article
                key={termino.id}
                className={`${styles.terminoCard} ${terminoExpandido === termino.id ? styles.terminoExpandido : ''}`}
              >
                <button
                  className={styles.terminoHeader}
                  onClick={() => toggleTermino(termino.id)}
                  aria-expanded={terminoExpandido === termino.id}
                >
                  <div className={styles.terminoTitulo}>
                    <span className={styles.categoriaIcon}>
                      {CATEGORIAS[termino.categoria].icono}
                    </span>
                    <h3 className={styles.terminoNombre}>{termino.termino}</h3>
                    {termino.traduccion && (
                      <span className={styles.traduccion}>({termino.traduccion})</span>
                    )}
                  </div>
                  <span className={styles.expandIcon}>
                    {terminoExpandido === termino.id ? '−' : '+'}
                  </span>
                </button>

                <div className={styles.terminoBody}>
                  <p className={styles.definicion}>{termino.definicion}</p>

                  {terminoExpandido === termino.id && (
                    <div className={styles.detalles}>
                      {termino.ejemplo && (
                        <div className={styles.ejemplo}>
                          <span className={styles.ejemploLabel}>💡 Ejemplo:</span>
                          <code className={styles.ejemploCodigo}>{termino.ejemplo}</code>
                        </div>
                      )}

                      {termino.relacionados && termino.relacionados.length > 0 && (
                        <div className={styles.relacionados}>
                          <span className={styles.relacionadosLabel}>🔗 Relacionados:</span>
                          <div className={styles.relacionadosLista}>
                            {termino.relacionados.map(rel => {
                              const terminoRelacionado = buscarTerminoPorNombre(rel);
                              return terminoRelacionado ? (
                                <button
                                  key={rel}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setBusqueda(rel);
                                    setLetraSeleccionada(null);
                                    setTerminoExpandido(terminoRelacionado.id);
                                  }}
                                  className={styles.relacionadoLink}
                                >
                                  {rel}
                                </button>
                              ) : (
                                <span key={rel} className={styles.relacionadoTag}>
                                  {rel}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className={styles.categoriaBadge}>
                        {CATEGORIAS[termino.categoria].icono} {CATEGORIAS[termino.categoria].nombre}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Sección informativa */}
      <div className={styles.infoSection}>
        <h2 className={styles.infoTitle}>📚 Sobre este glosario</h2>
        <p className={styles.infoText}>
          Este glosario está diseñado para ayudar a quienes están aprendiendo programación
          a entender los términos técnicos que se usan habitualmente en desarrollo web.
          Cada término incluye su traducción al español, una definición clara y ejemplos prácticos.
        </p>
        <div className={styles.categoriasSummary}>
          <h3>Categorías disponibles:</h3>
          <ul className={styles.categoriasLista}>
            {Object.entries(CATEGORIAS).map(([key, { nombre, icono }]) => {
              const count = TERMINOS.filter(t => t.categoria === key).length;
              return (
                <li key={key}>
                  <span className={styles.categoriaItem}>
                    {icono} <strong>{nombre}</strong>: {count} términos
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <RelatedApps apps={getRelatedApps('glosario-programacion')} />
      <Footer appName="glosario-programacion" />
    </div>
  );
}
