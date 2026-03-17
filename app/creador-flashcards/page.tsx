'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './CreadorFlashcards.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
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

        {/* Sección 1: Tabla Comparativa de Técnicas de Estudio */}
        <section className={styles.guideSection}>
          <h2>Comparativa de Técnicas de Estudio</h2>
          <p className={styles.introParagraph}>
            No todas las técnicas de estudio son igual de eficaces. La evidencia científica muestra
            diferencias significativas en la retención a largo plazo según el método utilizado.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Técnica</th>
                  <th>Eficacia científica</th>
                  <th>Preparación</th>
                  <th>Repaso</th>
                  <th>Ideal para</th>
                  <th>Retención largo plazo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Flashcards + repetición espaciada</strong></td>
                  <td>⭐⭐⭐⭐⭐ Muy alta</td>
                  <td>Media (30-60 min)</td>
                  <td>Baja (15-20 min/día)</td>
                  <td>Vocabulario, conceptos, datos</td>
                  <td>85-95% al mes</td>
                </tr>
                <tr>
                  <td>Mapas mentales</td>
                  <td>⭐⭐⭐⭐ Alta</td>
                  <td>Alta (60-90 min)</td>
                  <td>Media (30 min)</td>
                  <td>Conceptos interconectados</td>
                  <td>70-80% al mes</td>
                </tr>
                <tr>
                  <td>Resúmenes propios</td>
                  <td>⭐⭐⭐ Media</td>
                  <td>Alta (45-90 min)</td>
                  <td>Alta (releer todo)</td>
                  <td>Comprensión global</td>
                  <td>50-65% al mes</td>
                </tr>
                <tr>
                  <td>Subrayado</td>
                  <td>⭐⭐ Baja</td>
                  <td>Baja (10-15 min)</td>
                  <td>Alta (releer)</td>
                  <td>Primera lectura</td>
                  <td>30-45% al mes</td>
                </tr>
                <tr>
                  <td>Relectura</td>
                  <td>⭐ Muy baja</td>
                  <td>Ninguna</td>
                  <td>Muy alta</td>
                  <td>Familiarización inicial</td>
                  <td>20-30% al mes</td>
                </tr>
                <tr>
                  <td>Método Pomodoro</td>
                  <td>⭐⭐⭐ Media</td>
                  <td>Ninguna</td>
                  <td>Variable</td>
                  <td>Gestión del tiempo</td>
                  <td>Depende del método combinado</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Sección 2: Casos de Uso */}
        <section className={styles.guideSection}>
          <h2>¿Quién usa flashcards y para qué?</h2>
          <p className={styles.introParagraph}>
            Las flashcards son una herramienta versátil que se adapta a perfiles de estudio muy distintos.
            Aquí algunos ejemplos reales de uso eficaz.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>⚖️</span>
                <h4>Opositor</h4>
              </div>
              <p>Memoriza conceptos legales, artículos de ley, procedimientos administrativos y temarios extensos de acceso a la función pública.</p>
              <p className={styles.escenarioExample}><strong>Ejemplo:</strong> «Artículo 47 CE» → «Derecho a una vivienda digna y adecuada»</p>
              <p className={styles.escenarioTip}>Crea un mazo por tema del temario y repasa 20 tarjetas cada mañana.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🌍</span>
                <h4>Aprendiz de idiomas</h4>
              </div>
              <p>Amplía vocabulario, estudia conjugaciones verbales, aprende expresiones idiomáticas y reglas gramaticales de cualquier idioma.</p>
              <p className={styles.escenarioExample}><strong>Ejemplo:</strong> «to procrastinate» → «postergar, dejar para después»</p>
              <p className={styles.escenarioTip}>Añade 10 palabras nuevas al día y repasa las anteriores antes de dormir.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🩺</span>
                <h4>Estudiante universitario</h4>
              </div>
              <p>Domina la terminología médica, jurídica o científica de carreras con alta carga memorística como Medicina, Derecho o Farmacia.</p>
              <p className={styles.escenarioExample}><strong>Ejemplo:</strong> «Hipertensión arterial» → «PA sistólica ≥ 140 mmHg o diastólica ≥ 90 mmHg»</p>
              <p className={styles.escenarioTip}>Combina flashcards con esquemas para preparar exámenes tipo test.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💼</span>
                <h4>Profesional en formación</h4>
              </div>
              <p>Aprende terminología técnica de nuevas áreas, acrónimos del sector, protocolos de empresa o conceptos de certificaciones profesionales.</p>
              <p className={styles.escenarioExample}><strong>Ejemplo:</strong> «KPI» → «Key Performance Indicator — indicador clave de rendimiento»</p>
              <p className={styles.escenarioTip}>Dedica 10 minutos durante el desplazamiento al trabajo para repasar.</p>
            </div>
          </div>
        </section>

        {/* Sección 3: FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre flashcards</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Qué es la repetición espaciada y por qué funciona?</h4>
              <p>
                La repetición espaciada es una técnica que consiste en revisar la información en intervalos crecientes
                justo antes de que la olvides. Se basa en la curva del olvido de Ebbinghaus (1885): sin repaso,
                olvidamos el 70% de lo aprendido en 24 horas. Al repasar en el momento óptimo, el cerebro consolida
                la información en la memoria a largo plazo de forma mucho más eficiente que la relectura repetida.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuántas flashcards debo estudiar al día?</h4>
              <p>
                Para principiantes, entre 15 y 30 tarjetas al día es un ritmo sostenible. Lo más importante es la
                constancia: es mejor 20 tarjetas cada día que 200 tarjetas el fin de semana. A medida que tu colección
                crezca, el sistema de repetición espaciada distribuirá los repasos automáticamente para que no te
                sobrepases.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Es mejor crear tus propias flashcards o usar las de otros?</h4>
              <p>
                Crear las tuyas propias es significativamente más efectivo. El proceso de formular la pregunta y
                escribir la respuesta ya es en sí mismo un acto de aprendizaje (efecto de generación). Las tarjetas
                propias además están redactadas en tu vocabulario y conectadas a tus experiencias, lo que facilita
                la recuperación posterior.
              </p>
              <p className={styles.faqTip}>Si usas tarjetas de otros, edítalas para adaptarlas a tu lenguaje.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuánto texto debe tener cada flashcard?</h4>
              <p>
                Lo mínimo posible. La regla general es: una pregunta concreta en el frente, una respuesta de 1 a 3
                frases en el reverso. Si necesitas más texto, divide la tarjeta en dos. Tarjetas largas son difíciles
                de recordar y desmotivan el repaso.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Las imágenes mejoran la memorización en flashcards?</h4>
              <p>
                Sí. El principio de codificación dual de Paivio indica que la información procesada tanto visualmente
                como verbalmente se recuerda mejor. Si puedes añadir un diagrama, una fotografía o incluso un dibujo
                esquemático al frente de la tarjeta, la retención mejora notablemente, especialmente para conceptos
                espaciales o procesos.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuándo debo repasar una flashcard «difícil»?</h4>
              <p>
                En sistemas de repetición espaciada, las tarjetas marcadas como «difícil» se programan para revisarse
                al día siguiente o en pocas horas. Las marcadas como «fácil» pueden esperar varios días o semanas.
                Si no usas un sistema automatizado, repasa manualmente las tarjetas difíciles al menos cada 1-2 días
                hasta dominarlas.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Es mejor estudiar en papel o en digital?</h4>
              <p>
                Ambos formatos son eficaces. El papel favorece la escritura a mano (que mejora la codificación) y
                elimina las distracciones digitales. El formato digital permite mayor volumen de tarjetas, búsqueda
                rápida, copias de seguridad y estudio en cualquier lugar desde el móvil. Para la mayoría de los
                estudiantes, lo digital resulta más práctico a largo plazo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo organizo las flashcards por materia?</h4>
              <p>
                Crea un mazo por asignatura o tema principal. Dentro de cada mazo, puedes añadir el contexto en la
                propia tarjeta (ej: «[Farmacología] Mecanismo de acción del ibuprofeno»). Evita mezclar materias muy
                distintas en el mismo mazo: la interferencia entre temas puede dificultar la recuperación. Un mazo
                bien delimitado de 50-150 tarjetas es más manejable que uno de 500.
              </p>
            </div>
          </div>
        </section>

        {/* Sección 4: Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>Cómo crear flashcards efectivas: guía paso a paso</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Identifica el concepto clave (1 idea por tarjeta)</h4>
                <p>Antes de crear una tarjeta, pregúntate: ¿qué es exactamente lo que quiero recordar? Si el concepto tiene varias partes, divide en múltiples tarjetas. Una tarjeta bien enfocada es más efectiva que una tarjeta completa.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Formula una pregunta clara y concreta</h4>
                <p>El frente de la tarjeta debe ser una pregunta que tenga una respuesta precisa y verificable. Evita preguntas ambiguas como «¿Qué es la fotosíntesis?» y prefiere «¿Cuál es la ecuación global de la fotosíntesis?»</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Escribe la respuesta breve (1-3 frases máximo)</h4>
                <p>El reverso debe responder directamente a la pregunta del frente. Si necesitas más de 3 frases para responder, es señal de que la tarjeta cubre demasiado contenido y debes dividirla.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Añade imagen o ejemplo si ayuda</h4>
                <p>Para conceptos abstractos, incluir un ejemplo concreto en el reverso mejora enormemente la memorización. Los ejemplos conectan la teoría con situaciones reales y facilitan la recuperación posterior.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Organiza por categorías y temas</h4>
                <p>Agrupa las tarjetas en mazos temáticos. Una buena organización permite sesiones de estudio enfocadas, facilita identificar las áreas más débiles y hace más manejable el volumen total de tarjetas.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Establece sesiones de repaso diarias (15-20 min)</h4>
                <p>La constancia es más importante que la duración. Sesiones cortas y frecuentes son mucho más efectivas que maratones de estudio ocasionales. Elige un momento fijo del día para repasar tus tarjetas.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Usa sistema de calificación (fácil/difícil) para repetición espaciada</h4>
                <p>Al repasar, clasifica cada tarjeta según tu dificultad. Las tarjetas fáciles las revisarás con menos frecuencia; las difíciles, más a menudo. Este mecanismo de retroalimentación es el núcleo de la repetición espaciada.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 5: Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>Mejores prácticas para maximizar tu aprendizaje</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <h4>Una sola idea por tarjeta (regla de oro)</h4>
              <p>La regla más importante del método flashcard. Cada tarjeta debe cubrir exactamente un concepto, un dato o una relación. Si intentas meter más, la tarjeta se vuelve difícil de responder y la memorización falla.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>❓</span>
              <h4>Preguntas activas, no definiciones pasivas</h4>
              <p>En lugar de «Fotosíntesis: proceso por el cual...», escribe «¿Qué proceso usan las plantas para convertir luz en energía?». La formulación activa obliga al cerebro a recuperar la información, no solo a reconocerla.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📈</span>
              <h4>Repasar justo antes de olvidar (curva de Ebbinghaus)</h4>
              <p>El momento óptimo de repaso es justo antes de que empieces a olvidar la información. Repasar demasiado pronto desperdicia tiempo; repasar demasiado tarde obliga a reaprender desde cero.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✍️</span>
              <h4>Crear las tarjetas tú mismo (el proceso enseña)</h4>
              <p>El acto de formular una pregunta, sintetizar la respuesta y escribirla ya es aprendizaje activo. Cuando creas tus propias tarjetas, procesas la información con más profundidad que al releer un apunte.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⏱️</span>
              <h4>Sesiones cortas y frecuentes mejor que largas y espaciadas</h4>
              <p>20 minutos al día durante 7 días es mucho más eficaz que 2 horas y media el domingo. La distribución temporal del aprendizaje (efecto de espaciado) es uno de los hallazgos más sólidos de la psicología cognitiva.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔄</span>
              <h4>Revisar las tarjetas «difíciles» más a menudo</h4>
              <p>No todas las tarjetas son igual de difíciles. Presta atención especial a las que te cuestan más: son las que necesitan más repeticiones para consolidarse. No pases página sin haber respondido correctamente.</p>
            </div>
          </div>
        </section>

        {/* Sección 6: Warning Box — Errores comunes */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Errores frecuentes que reducen la efectividad</h3>
            </div>
            <ul className={styles.warningList}>
              <li>Poner demasiada información en una sola tarjeta — la sobrecarga cognitiva impide la memorización eficiente.</li>
              <li>Estudiar siempre en el mismo orden — el cerebro memoriza la secuencia, no el contenido. Mezcla las tarjetas antes de cada sesión.</li>
              <li>No repasar hasta el día del examen — la repetición espaciada requiere semanas o meses, no horas de preparación.</li>
              <li>Usar solo definiciones sin aplicación práctica — añade ejemplos y contextos reales para anclar los conceptos.</li>
              <li>Crear demasiadas tarjetas sin repasar las anteriores — acumular tarjetas sin repasar genera estrés y no produce aprendizaje.</li>
              <li>Confundir reconocimiento con recuerdo activo — sentir que «reconoces» la respuesta al verla no significa que podrás recuperarla en un examen.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps
        apps={getRelatedApps('creador-flashcards')}
        title="Más herramientas para estudiar"
        icon="📚"
      />

      <ShareCard appName="creador-flashcards" />
      <Footer appName="creador-flashcards" />
    </div>
  );
}
