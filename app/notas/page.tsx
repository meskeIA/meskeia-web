'use client';

import { useState, useEffect } from 'react';
import styles from './Notas.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Categorías disponibles
const CATEGORIAS = [
  { id: 'personal', nombre: 'Personal', emoji: '📝' },
  { id: 'trabajo', nombre: 'Trabajo', emoji: '💼' },
  { id: 'ideas', nombre: 'Ideas', emoji: '💡' },
  { id: 'recordatorios', nombre: 'Recordatorios', emoji: '⏰' },
  { id: 'estudio', nombre: 'Estudio', emoji: '📚' },
  { id: 'compras', nombre: 'Compras', emoji: '🛒' },
  { id: 'proyectos', nombre: 'Proyectos', emoji: '🎯' },
  { id: 'otros', nombre: 'Otros', emoji: '📌' },
];

interface Nota {
  id: string;
  titulo: string;
  contenido: string;
  categoria: string;
  fechaCreacion: string;
  fechaModificacion: string;
}

// Formatear fecha en español
const formatearFecha = (fechaISO: string): string => {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function NotasPage() {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [categoria, setCategoria] = useState('personal');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [notaEditando, setNotaEditando] = useState<string | null>(null);
  const [vistaExpandida, setVistaExpandida] = useState<string | null>(null);

  // Cargar notas de localStorage
  useEffect(() => {
    const saved = localStorage.getItem('meskeia-notas');
    if (saved) {
      try {
        setNotas(JSON.parse(saved));
      } catch {
        // Ignorar errores de parsing
      }
    }
  }, []);

  // Guardar notas en localStorage
  useEffect(() => {
    if (notas.length > 0) {
      localStorage.setItem('meskeia-notas', JSON.stringify(notas));
    }
  }, [notas]);

  // Generar ID único
  const generarId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Guardar nota (nueva o editada)
  const guardarNota = () => {
    if (!titulo.trim() || !contenido.trim()) return;

    const ahora = new Date().toISOString();

    if (notaEditando) {
      // Editar nota existente
      setNotas(notas.map(nota =>
        nota.id === notaEditando
          ? { ...nota, titulo, contenido, categoria, fechaModificacion: ahora }
          : nota
      ));
      setNotaEditando(null);
    } else {
      // Nueva nota
      const nuevaNota: Nota = {
        id: generarId(),
        titulo,
        contenido,
        categoria,
        fechaCreacion: ahora,
        fechaModificacion: ahora,
      };
      setNotas([nuevaNota, ...notas]);
    }

    // Limpiar formulario
    setTitulo('');
    setContenido('');
    setCategoria('personal');
  };

  // Editar nota
  const editarNota = (nota: Nota) => {
    setTitulo(nota.titulo);
    setContenido(nota.contenido);
    setCategoria(nota.categoria);
    setNotaEditando(nota.id);
    setVistaExpandida(null);
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Eliminar nota
  const eliminarNota = (id: string) => {
    if (confirm('¿Eliminar esta nota?')) {
      const nuevasNotas = notas.filter(nota => nota.id !== id);
      setNotas(nuevasNotas);
      if (nuevasNotas.length === 0) {
        localStorage.removeItem('meskeia-notas');
      }
      if (vistaExpandida === id) setVistaExpandida(null);
      if (notaEditando === id) {
        setNotaEditando(null);
        setTitulo('');
        setContenido('');
        setCategoria('personal');
      }
    }
  };

  // Cancelar edición
  const cancelarEdicion = () => {
    setNotaEditando(null);
    setTitulo('');
    setContenido('');
    setCategoria('personal');
  };

  // Obtener categoría por ID
  const getCategoriaInfo = (categoriaId: string) => {
    return CATEGORIAS.find(c => c.id === categoriaId) || CATEGORIAS[7];
  };

  // Filtrar notas
  const notasFiltradas = notas.filter(nota => {
    const coincideCategoria = filtroCategoria === 'todas' || nota.categoria === filtroCategoria;
    const coincideBusqueda = busqueda === '' ||
      nota.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      nota.contenido.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  // Exportar notas
  const exportarNotas = () => {
    const dataStr = JSON.stringify(notas, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notas-meskeia-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Importar notas
  const importarNotas = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importadas = JSON.parse(e.target?.result as string);
        if (Array.isArray(importadas)) {
          setNotas([...importadas, ...notas]);
        }
      } catch {
        alert('Error al importar el archivo');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Notas</h1>
        <p className={styles.subtitle}>
          Guarda tus ideas, apuntes y recordatorios organizados por categorías
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de crear/editar nota */}
        <div className={styles.editorPanel}>
          <h2 className={styles.panelTitle}>
            {notaEditando ? '✏️ Editar Nota' : '➕ Nueva Nota'}
          </h2>

          <div className={styles.formGroup}>
            <label className={styles.label}>Título</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título de la nota..."
              className={styles.input}
              maxLength={100}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className={styles.select}
            >
              {CATEGORIAS.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji} {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Contenido</label>
            <textarea
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Escribe o pega tu texto aquí..."
              className={styles.textarea}
              rows={8}
            />
            <span className={styles.charCount}>
              {contenido.length} caracteres
            </span>
          </div>

          <div className={styles.formActions}>
            <button
              onClick={guardarNota}
              className={styles.btnPrimary}
              disabled={!titulo.trim() || !contenido.trim()}
            >
              {notaEditando ? 'Guardar Cambios' : 'Crear Nota'}
            </button>
            {notaEditando && (
              <button onClick={cancelarEdicion} className={styles.btnSecondary}>
                Cancelar
              </button>
            )}
          </div>
        </div>

        {/* Panel de notas guardadas */}
        <div className={styles.notasPanel}>
          <div className={styles.notasHeader}>
            <h2 className={styles.panelTitle}>
              📋 Mis Notas ({notasFiltradas.length})
            </h2>

            <div className={styles.notasActions}>
              <button onClick={exportarNotas} className={styles.btnSmall} disabled={notas.length === 0}>
                💾 Exportar
              </button>
              <label className={styles.btnSmall}>
                📂 Importar
                <input
                  type="file"
                  accept=".json"
                  onChange={importarNotas}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {/* Filtros */}
          <div className={styles.filtros}>
            <div className={styles.filtroSearch}>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar en notas..."
                className={styles.searchInput}
              />
              {busqueda && (
                <button onClick={() => setBusqueda('')} className={styles.clearSearch}>
                  ✕
                </button>
              )}
            </div>

            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className={styles.filtroSelect}
            >
              <option value="todas">Todas las categorías</option>
              {CATEGORIAS.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji} {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Lista de notas */}
          {notasFiltradas.length === 0 ? (
            <div className={styles.emptyState}>
              {notas.length === 0 ? (
                <>
                  <span className={styles.emptyIcon}>📝</span>
                  <p>No tienes notas guardadas</p>
                  <p className={styles.emptyHint}>Crea tu primera nota arriba</p>
                </>
              ) : (
                <>
                  <span className={styles.emptyIcon}>🔍</span>
                  <p>No se encontraron notas</p>
                  <p className={styles.emptyHint}>Prueba con otros filtros</p>
                </>
              )}
            </div>
          ) : (
            <div className={styles.notasList}>
              {notasFiltradas.map((nota) => {
                const catInfo = getCategoriaInfo(nota.categoria);
                const isExpanded = vistaExpandida === nota.id;

                return (
                  <div
                    key={nota.id}
                    className={`${styles.notaCard} ${isExpanded ? styles.expanded : ''}`}
                  >
                    <div
                      className={styles.notaHeader}
                      onClick={() => setVistaExpandida(isExpanded ? null : nota.id)}
                    >
                      <div className={styles.notaTitleRow}>
                        <span className={styles.notaEmoji}>{catInfo.emoji}</span>
                        <h3 className={styles.notaTitulo}>{nota.titulo}</h3>
                      </div>
                      <div className={styles.notaMeta}>
                        <span className={styles.notaCategoria}>{catInfo.nombre}</span>
                        <span className={styles.notaFecha}>
                          {formatearFecha(nota.fechaModificacion)}
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className={styles.notaBody}>
                        <div className={styles.notaContenido}>
                          {nota.contenido}
                        </div>
                        <div className={styles.notaFooter}>
                          <span className={styles.notaCreacion}>
                            Creada: {formatearFecha(nota.fechaCreacion)}
                          </span>
                          <div className={styles.notaBtns}>
                            <button
                              onClick={() => editarNota(nota)}
                              className={styles.btnEdit}
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => eliminarNota(nota.id)}
                              className={styles.btnDelete}
                            >
                              🗑️ Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Panel informativo */}
      <div className={styles.infoPanel}>
        <h3>Sobre esta herramienta</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>💾</span>
            <div>
              <strong>Guardado automático</strong>
              <p>Tus notas se guardan localmente en tu navegador</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>🏷️</span>
            <div>
              <strong>8 categorías</strong>
              <p>Organiza tus notas por tipo: trabajo, personal, ideas...</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>📤</span>
            <div>
              <strong>Exportar/Importar</strong>
              <p>Haz backup de tus notas en formato JSON</p>
            </div>
          </div>
        </div>
      </div>

      <RelatedApps apps={getRelatedApps('notas')} />

      <Footer appName="notas" />
    </div>
  );
}
