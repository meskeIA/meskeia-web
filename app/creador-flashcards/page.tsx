'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './CreadorFlashcards.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
interface Tarjeta {
  id: string;
  frente: string;
  reverso: string;
}

interface Mazo {
  id: string;
  nombre: string;
  categoria: string;
  color: string;
  tarjetas: Tarjeta[];
  fechaCreacion: string;
}

// Colores disponibles para mazos
const COLORES_MAZO = [
  '#2E86AB', // Azul meskeIA
  '#48A9A6', // Teal
  '#10B981', // Verde
  '#F59E0B', // Amarillo
  '#EF4444', // Rojo
  '#8B5CF6', // Violeta
  '#EC4899', // Rosa
  '#6366F1', // Índigo
  '#14B8A6', // Teal claro
  '#F97316', // Naranja
];

// Categorías predefinidas
const CATEGORIAS = [
  'Idiomas',
  'Medicina',
  'Derecho',
  'Programación',
  'Historia',
  'Ciencias',
  'Matemáticas',
  'Geografía',
  'Arte',
  'Música',
  'Otros',
];

// Mazo inicial de ejemplo
const MAZO_EJEMPLO: Mazo = {
  id: 'ejemplo',
  nombre: 'Ejemplo: Capitales de Europa',
  categoria: 'Geografía',
  color: '#2E86AB',
  fechaCreacion: new Date().toISOString(),
  tarjetas: [
    { id: '1', frente: '¿Cuál es la capital de Francia?', reverso: 'París' },
    { id: '2', frente: '¿Cuál es la capital de Alemania?', reverso: 'Berlín' },
    { id: '3', frente: '¿Cuál es la capital de Italia?', reverso: 'Roma' },
    { id: '4', frente: '¿Cuál es la capital de Portugal?', reverso: 'Lisboa' },
    { id: '5', frente: '¿Cuál es la capital de Países Bajos?', reverso: 'Ámsterdam' },
  ],
};

export default function CreadorFlashcardsPage() {
  // Estado principal
  const [mazos, setMazos] = useState<Mazo[]>([MAZO_EJEMPLO]);
  const [mazoActivo, setMazoActivo] = useState<string>('ejemplo');
  const [modoEstudio, setModoEstudio] = useState(false);

  // Estado del modal
  const [modalAbierto, setModalAbierto] = useState<'mazo' | 'tarjeta' | null>(null);
  const [editandoMazo, setEditandoMazo] = useState<Mazo | null>(null);
  const [editandoTarjeta, setEditandoTarjeta] = useState<Tarjeta | null>(null);

  // Estado del formulario de mazo
  const [formMazo, setFormMazo] = useState({
    nombre: '',
    categoria: 'Otros',
    color: COLORES_MAZO[0],
  });

  // Estado del formulario de tarjeta
  const [formTarjeta, setFormTarjeta] = useState({
    frente: '',
    reverso: '',
  });

  // Estado modo estudio
  const [tarjetaActual, setTarjetaActual] = useState(0);
  const [volteada, setVolteada] = useState(false);
  const [tarjetasMezcladas, setTarjetasMezcladas] = useState<Tarjeta[]>([]);

  // Ref para input de archivo
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar datos de localStorage
  useEffect(() => {
    const saved = localStorage.getItem('meskeia-flashcards');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.mazos && data.mazos.length > 0) {
          setMazos(data.mazos);
          setMazoActivo(data.mazoActivo || data.mazos[0].id);
        }
      } catch (e) {
        console.error('Error cargando flashcards:', e);
      }
    }
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem('meskeia-flashcards', JSON.stringify({ mazos, mazoActivo }));
  }, [mazos, mazoActivo]);

  // Obtener mazo activo
  const getMazoActivo = useCallback(() => {
    return mazos.find(m => m.id === mazoActivo);
  }, [mazos, mazoActivo]);

  // Funciones para mazos
  const abrirModalMazo = (mazo?: Mazo) => {
    if (mazo) {
      setEditandoMazo(mazo);
      setFormMazo({
        nombre: mazo.nombre,
        categoria: mazo.categoria,
        color: mazo.color,
      });
    } else {
      setEditandoMazo(null);
      setFormMazo({
        nombre: '',
        categoria: 'Otros',
        color: COLORES_MAZO[0],
      });
    }
    setModalAbierto('mazo');
  };

  const guardarMazo = () => {
    if (!formMazo.nombre.trim()) return;

    if (editandoMazo) {
      setMazos(mazos.map(m =>
        m.id === editandoMazo.id
          ? { ...m, nombre: formMazo.nombre, categoria: formMazo.categoria, color: formMazo.color }
          : m
      ));
    } else {
      const nuevoMazo: Mazo = {
        id: Date.now().toString(),
        nombre: formMazo.nombre,
        categoria: formMazo.categoria,
        color: formMazo.color,
        tarjetas: [],
        fechaCreacion: new Date().toISOString(),
      };
      setMazos([...mazos, nuevoMazo]);
      setMazoActivo(nuevoMazo.id);
    }
    setModalAbierto(null);
  };

  const eliminarMazo = (id: string) => {
    if (mazos.length <= 1) {
      alert('Debe haber al menos un mazo');
      return;
    }
    if (confirm('¿Eliminar este mazo y todas sus tarjetas?')) {
      setMazos(mazos.filter(m => m.id !== id));
      if (mazoActivo === id) {
        const restantes = mazos.filter(m => m.id !== id);
        setMazoActivo(restantes[0]?.id || '');
      }
    }
  };

  // Funciones para tarjetas
  const abrirModalTarjeta = (tarjeta?: Tarjeta) => {
    if (tarjeta) {
      setEditandoTarjeta(tarjeta);
      setFormTarjeta({
        frente: tarjeta.frente,
        reverso: tarjeta.reverso,
      });
    } else {
      setEditandoTarjeta(null);
      setFormTarjeta({
        frente: '',
        reverso: '',
      });
    }
    setModalAbierto('tarjeta');
  };

  const guardarTarjeta = () => {
    if (!formTarjeta.frente.trim() || !formTarjeta.reverso.trim()) return;

    if (editandoTarjeta) {
      setMazos(mazos.map(m =>
        m.id === mazoActivo
          ? {
              ...m,
              tarjetas: m.tarjetas.map(t =>
                t.id === editandoTarjeta.id
                  ? { ...t, frente: formTarjeta.frente, reverso: formTarjeta.reverso }
                  : t
              ),
            }
          : m
      ));
    } else {
      const nuevaTarjeta: Tarjeta = {
        id: Date.now().toString(),
        frente: formTarjeta.frente,
        reverso: formTarjeta.reverso,
      };
      setMazos(mazos.map(m =>
        m.id === mazoActivo
          ? { ...m, tarjetas: [...m.tarjetas, nuevaTarjeta] }
          : m
      ));
    }
    setModalAbierto(null);
  };

  const eliminarTarjeta = (tarjetaId: string) => {
    setMazos(mazos.map(m =>
      m.id === mazoActivo
        ? { ...m, tarjetas: m.tarjetas.filter(t => t.id !== tarjetaId) }
        : m
    ));
  };

  // Funciones modo estudio
  const iniciarEstudio = () => {
    const mazo = getMazoActivo();
    if (!mazo || mazo.tarjetas.length === 0) {
      alert('Este mazo no tiene tarjetas');
      return;
    }
    setTarjetasMezcladas([...mazo.tarjetas]);
    setTarjetaActual(0);
    setVolteada(false);
    setModoEstudio(true);
  };

  const mezclarTarjetas = () => {
    const mezcladas = [...tarjetasMezcladas].sort(() => Math.random() - 0.5);
    setTarjetasMezcladas(mezcladas);
    setTarjetaActual(0);
    setVolteada(false);
  };

  const siguienteTarjeta = () => {
    if (tarjetaActual < tarjetasMezcladas.length - 1) {
      setTarjetaActual(tarjetaActual + 1);
      setVolteada(false);
    }
  };

  const anteriorTarjeta = () => {
    if (tarjetaActual > 0) {
      setTarjetaActual(tarjetaActual - 1);
      setVolteada(false);
    }
  };

  // Funciones de exportar/importar
  const exportarJSON = () => {
    const mazo = getMazoActivo();
    if (!mazo) return;

    const dataStr = JSON.stringify(mazo, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mazo.nombre.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportarCSV = () => {
    const mazo = getMazoActivo();
    if (!mazo) return;

    const csv = ['Frente,Reverso'];
    mazo.tarjetas.forEach(t => {
      const frente = t.frente.replace(/"/g, '""');
      const reverso = t.reverso.replace(/"/g, '""');
      csv.push(`"${frente}","${reverso}"`);
    });

    const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mazo.nombre.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importarJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.nombre && data.tarjetas) {
          const nuevoMazo: Mazo = {
            id: Date.now().toString(),
            nombre: data.nombre + ' (importado)',
            categoria: data.categoria || 'Otros',
            color: data.color || COLORES_MAZO[0],
            tarjetas: data.tarjetas.map((t: Tarjeta, i: number) => ({
              id: `imported-${i}`,
              frente: t.frente,
              reverso: t.reverso,
            })),
            fechaCreacion: new Date().toISOString(),
          };
          setMazos([...mazos, nuevoMazo]);
          setMazoActivo(nuevoMazo.id);
          alert(`Mazo importado con ${nuevoMazo.tarjetas.length} tarjetas`);
        }
      } catch {
        alert('Error al importar el archivo');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const mazoActivoData = getMazoActivo();
  const totalTarjetas = mazos.reduce((acc, m) => acc + m.tarjetas.length, 0);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Creador de Flashcards</h1>
        <p className={styles.subtitle}>
          Crea mazos, añade tarjetas y estudia con animaciones flip
        </p>
      </header>

      <LegalNotice />

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <button className={styles.btnPrimary} onClick={() => abrirModalMazo()}>
            <span>+</span> Nuevo Mazo
          </button>
          {mazoActivoData && mazoActivoData.tarjetas.length > 0 && (
            <button className={styles.btnSuccess} onClick={iniciarEstudio}>
              <span>▶</span> Estudiar
            </button>
          )}
        </div>
        <div className={styles.toolbarRight}>
          <button className={styles.btnSecondary} onClick={exportarJSON}>
            <span>📥</span> JSON
          </button>
          <button className={styles.btnSecondary} onClick={exportarCSV}>
            <span>📊</span> CSV
          </button>
          <button className={styles.btnSecondary} onClick={() => fileInputRef.current?.click()}>
            <span>📤</span> Importar
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={importarJSON}
            className={styles.hiddenInput}
          />
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <span className={styles.statIcon}>📚</span>
          <span className={styles.statValue}>{mazos.length}</span>
          <span className={styles.statLabel}>mazos</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statIcon}>🃏</span>
          <span className={styles.statValue}>{totalTarjetas}</span>
          <span className={styles.statLabel}>tarjetas</span>
        </div>
        {mazoActivoData && (
          <div className={styles.statItem}>
            <span className={styles.statIcon}>🎯</span>
            <span className={styles.statValue}>{mazoActivoData.tarjetas.length}</span>
            <span className={styles.statLabel}>en este mazo</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      {!modoEstudio ? (
        <div className={styles.mainContent}>
          {/* Sidebar - Mazos */}
          <aside className={styles.sidebar}>
            <h2 className={styles.sidebarTitle}>
              <span>📚</span> Mis Mazos
            </h2>

            <div className={styles.mazosList}>
              {mazos.map(mazo => (
                <div
                  key={mazo.id}
                  className={`${styles.mazoItem} ${mazoActivo === mazo.id ? styles.activo : ''}`}
                  onClick={() => setMazoActivo(mazo.id)}
                >
                  <div className={styles.mazoColor} style={{ background: mazo.color }} />
                  <div className={styles.mazoInfo}>
                    <span className={styles.mazoNombre}>{mazo.nombre}</span>
                    <span className={styles.mazoContador}>{mazo.tarjetas.length} tarjetas</span>
                  </div>
                  <div className={styles.mazoActions}>
                    <button
                      className={styles.btnIcono}
                      onClick={(e) => { e.stopPropagation(); abrirModalMazo(mazo); }}
                      title="Editar mazo"
                    >
                      ✏️
                    </button>
                    <button
                      className={`${styles.btnIcono} ${styles.danger}`}
                      onClick={(e) => { e.stopPropagation(); eliminarMazo(mazo.id); }}
                      title="Eliminar mazo"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className={styles.btnAnadirMazo} onClick={() => abrirModalMazo()}>
              + Añadir mazo
            </button>
          </aside>

          {/* Content Panel - Tarjetas */}
          <div className={styles.contentPanel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>
                <span style={{ color: mazoActivoData?.color }}>●</span>
                {mazoActivoData?.nombre || 'Selecciona un mazo'}
              </h2>
              {mazoActivoData && (
                <div className={styles.panelActions}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {mazoActivoData.categoria}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.tarjetasGrid}>
              {mazoActivoData?.tarjetas.map(tarjeta => (
                <div
                  key={tarjeta.id}
                  className={styles.tarjetaCard}
                  onClick={() => abrirModalTarjeta(tarjeta)}
                >
                  <div className={styles.tarjetaFront}>{tarjeta.frente}</div>
                  <div className={styles.tarjetaBack}>{tarjeta.reverso}</div>
                  <div className={styles.tarjetaActions}>
                    <button
                      className={styles.btnIcono}
                      onClick={(e) => { e.stopPropagation(); abrirModalTarjeta(tarjeta); }}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className={`${styles.btnIcono} ${styles.danger}`}
                      onClick={(e) => { e.stopPropagation(); eliminarTarjeta(tarjeta.id); }}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}

              {/* Botón añadir tarjeta */}
              <button className={styles.btnAnadirTarjeta} onClick={() => abrirModalTarjeta()}>
                <span>+</span>
                <span>Nueva tarjeta</span>
              </button>
            </div>

            {mazoActivoData?.tarjetas.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🃏</div>
                <p className={styles.emptyTitle}>Este mazo está vacío</p>
                <p className={styles.emptyText}>Añade tarjetas para empezar a estudiar</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Modo Estudio */
        <div className={styles.modoEstudio}>
          <button
            className={styles.btnSecondary}
            onClick={() => setModoEstudio(false)}
            style={{ alignSelf: 'flex-start', marginBottom: 'var(--spacing-lg)' }}
          >
            ← Volver al editor
          </button>

          <div className={styles.estudioProgreso}>
            <p className={styles.progresoTexto}>
              Tarjeta {tarjetaActual + 1} de {tarjetasMezcladas.length}
            </p>
            <div className={styles.progresoBarra}>
              <div
                className={styles.progresoRelleno}
                style={{ width: `${((tarjetaActual + 1) / tarjetasMezcladas.length) * 100}%` }}
              />
            </div>
          </div>

          <div className={styles.flashcardContainer} onClick={() => setVolteada(!volteada)}>
            <div className={`${styles.flashcard} ${volteada ? styles.flipped : ''}`}>
              <div className={`${styles.flashcardFace} ${styles.flashcardFront}`}>
                <span className={styles.flashcardLabel}>Pregunta</span>
                <span className={styles.flashcardTexto}>
                  {tarjetasMezcladas[tarjetaActual]?.frente}
                </span>
                <span className={styles.flashcardHint}>Clic para ver respuesta</span>
              </div>
              <div className={`${styles.flashcardFace} ${styles.flashcardBack}`}>
                <span className={styles.flashcardLabel}>Respuesta</span>
                <span className={styles.flashcardTexto}>
                  {tarjetasMezcladas[tarjetaActual]?.reverso}
                </span>
                <span className={styles.flashcardHint}>Clic para ver pregunta</span>
              </div>
            </div>
          </div>

          <div className={styles.estudioControles}>
            <button
              className={styles.btnAnterior}
              onClick={anteriorTarjeta}
              disabled={tarjetaActual === 0}
            >
              ← Anterior
            </button>
            <button className={styles.btnMezclar} onClick={mezclarTarjetas}>
              🔀 Mezclar
            </button>
            <button
              className={styles.btnSiguiente}
              onClick={siguienteTarjeta}
              disabled={tarjetaActual === tarjetasMezcladas.length - 1}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* Modal Mazo */}
      {modalAbierto === 'mazo' && (
        <div className={styles.modalOverlay} onClick={() => setModalAbierto(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              {editandoMazo ? 'Editar Mazo' : 'Nuevo Mazo'}
            </h3>

            <div className={styles.formGroup}>
              <label className={styles.label}>Nombre del mazo</label>
              <input
                type="text"
                className={styles.input}
                value={formMazo.nombre}
                onChange={e => setFormMazo({ ...formMazo, nombre: e.target.value })}
                placeholder="Ej: Vocabulario inglés"
                autoFocus
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Categoría</label>
              <select
                className={styles.select}
                value={formMazo.categoria}
                onChange={e => setFormMazo({ ...formMazo, categoria: e.target.value })}
              >
                {CATEGORIAS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Color</label>
              <div className={styles.colorPicker}>
                {COLORES_MAZO.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`${styles.colorOption} ${formMazo.color === color ? styles.selected : ''}`}
                    style={{ background: color }}
                    onClick={() => setFormMazo({ ...formMazo, color })}
                  />
                ))}
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnSecondary} onClick={() => setModalAbierto(null)}>
                Cancelar
              </button>
              <button className={styles.btnPrimary} onClick={guardarMazo}>
                {editandoMazo ? 'Guardar cambios' : 'Crear mazo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tarjeta */}
      {modalAbierto === 'tarjeta' && (
        <div className={styles.modalOverlay} onClick={() => setModalAbierto(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              {editandoTarjeta ? 'Editar Tarjeta' : 'Nueva Tarjeta'}
            </h3>

            <div className={styles.formGroup}>
              <label className={styles.label}>Frente (Pregunta)</label>
              <textarea
                className={styles.textarea}
                value={formTarjeta.frente}
                onChange={e => setFormTarjeta({ ...formTarjeta, frente: e.target.value })}
                placeholder="Escribe la pregunta o concepto..."
                autoFocus
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Reverso (Respuesta)</label>
              <textarea
                className={styles.textarea}
                value={formTarjeta.reverso}
                onChange={e => setFormTarjeta({ ...formTarjeta, reverso: e.target.value })}
                placeholder="Escribe la respuesta o definición..."
              />
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnSecondary} onClick={() => setModalAbierto(null)}>
                Cancelar
              </button>
              <button className={styles.btnPrimary} onClick={guardarTarjeta}>
                {editandoTarjeta ? 'Guardar cambios' : 'Añadir tarjeta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres aprender técnicas de memorización?"
        subtitle="Descubre cómo las flashcards pueden mejorar tu aprendizaje"
      >
        <section className={styles.guideSection}>
          <h2>El Poder de las Flashcards</h2>
          <p className={styles.introParagraph}>
            Las tarjetas de estudio o flashcards son una de las técnicas de memorización
            más efectivas respaldadas por la ciencia cognitiva. Su efectividad se basa en
            principios como la recuperación activa y la repetición espaciada.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Recuperación Activa</h4>
              <p>
                En lugar de releer pasivamente, las flashcards te obligan a recuperar
                información de tu memoria. Este esfuerzo mental fortalece las conexiones
                neuronales y mejora la retención a largo plazo.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Repetición Espaciada</h4>
              <p>
                Revisar las tarjetas en intervalos crecientes optimiza el aprendizaje.
                Las tarjetas que dominas se revisan menos frecuentemente, mientras que
                las difíciles aparecen más a menudo.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Fragmentación</h4>
              <p>
                Dividir la información en pequeñas unidades (una tarjeta = un concepto)
                reduce la carga cognitiva y facilita la asimilación de temas complejos.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Consejos para Crear Flashcards Efectivas</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Una idea por tarjeta</h4>
              <p>
                Evita sobrecargar las tarjetas. Cada una debe contener una sola
                pregunta o concepto claro y conciso.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Usa tus propias palabras</h4>
              <p>
                Reformular la información con tu vocabulario mejora la comprensión
                y hace que el contenido sea más personal y memorable.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Incluye ejemplos</h4>
              <p>
                Los ejemplos concretos ayudan a anclar conceptos abstractos.
                Conecta la teoría con situaciones reales o aplicaciones prácticas.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Sé específico</h4>
              <p>
                Preguntas vagas generan respuestas vagas. Formula preguntas
                precisas que tengan una respuesta clara y verificable.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Organización por Categorías</h2>
          <p className={styles.introParagraph}>
            Agrupar tus flashcards por temas o categorías facilita las sesiones de estudio
            enfocadas y te permite identificar áreas que necesitan más trabajo.
          </p>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Idiomas</h4>
              <p>
                Vocabulario, conjugaciones verbales, expresiones idiomáticas,
                reglas gramaticales y frases útiles.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Ciencias</h4>
              <p>
                Fórmulas, definiciones, procesos biológicos, elementos químicos,
                leyes físicas y terminología científica.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Historia y Geografía</h4>
              <p>
                Fechas importantes, personajes históricos, capitales, países,
                eventos y movimientos culturales.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps
        apps={getRelatedApps('creador-flashcards')}
        title="Más herramientas para estudiar"
        icon="📚"
      />

      <Footer appName="creador-flashcards" />
    </div>
  );
}
