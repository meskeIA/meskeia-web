'use client';

import { useState, useEffect } from 'react';
import styles from './Notas.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection, DisclaimerCard } from '@/components';
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

      <LegalNotice />

      <DisclaimerCard
        variant="general"
        severity="medium"
        collapsible={true}
        context="notas-disclaimer"
      />

      <div className={styles.mainContent}>
        {/* Panel de crear/editar nota */}
        <div className={styles.editorPanel}>
          <h2 className={styles.panelTitle}>
            {notaEditando ? <><span aria-hidden="true">✏️</span> Editar Nota</> : <><span aria-hidden="true">➕</span> Nueva Nota</>}
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
              type="button"
              onClick={guardarNota}
              className={styles.btnPrimary}
              disabled={!titulo.trim() || !contenido.trim()}
            >
              {notaEditando ? 'Guardar Cambios' : 'Crear Nota'}
            </button>
            {notaEditando && (
              <button type="button" onClick={cancelarEdicion} className={styles.btnSecondary}>
                Cancelar
              </button>
            )}
          </div>
        </div>

        {/* Panel de notas guardadas */}
        <div className={styles.notasPanel}>
          <div className={styles.notasHeader}>
            <h2 className={styles.panelTitle}>
              <span aria-hidden="true">📋</span> Mis Notas ({notasFiltradas.length})
            </h2>

            <div className={styles.notasActions}>
              <button type="button" onClick={exportarNotas} className={styles.btnSmall} disabled={notas.length === 0}>
                <span aria-hidden="true">💾</span> Exportar
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
                <button type="button" onClick={() => setBusqueda('')} className={styles.clearSearch}>
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
                              type="button"
                              onClick={() => editarNota(nota)}
                              className={styles.btnEdit}
                            >
                              <span aria-hidden="true">✏️</span> Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => eliminarNota(nota.id)}
                              className={styles.btnDelete}
                            >
                              <span aria-hidden="true">🗑️</span> Eliminar
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
            <span className={styles.infoIcon} aria-hidden="true">💾</span>
            <div>
              <strong>Guardado automático</strong>
              <p>Tus notas se guardan localmente en tu navegador</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon} aria-hidden="true">🏷️</span>
            <div>
              <strong>8 categorías</strong>
              <p>Organiza tus notas por tipo: trabajo, personal, ideas...</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon} aria-hidden="true">📤</span>
            <div>
              <strong>Exportar/Importar</strong>
              <p>Haz backup de tus notas en formato JSON</p>
            </div>
          </div>
        </div>
      </div>

      <EducationalSection
        title="¿Quieres sacar más partido a tus notas?"
        subtitle="Métodos, casos de uso y buenas prácticas para tomar notas digitales de forma efectiva"
      >
        {/* ── SECCIÓN 1: Tabla Comparativa ── */}
        <section>
          <h2>Métodos de toma de notas: comparativa</h2>
          <p>Cada método tiene sus puntos fuertes según el contexto. Elige el que mejor se adapte a tu forma de trabajar.</p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Método</th>
                  <th>Organización</th>
                  <th>Velocidad</th>
                  <th>Recuperación</th>
                  <th>Ideal para</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>📝 Notas libres</td>
                  <td>Baja</td>
                  <td>Muy alta</td>
                  <td>Difícil</td>
                  <td>Captura rápida, lluvia de ideas</td>
                </tr>
                <tr>
                  <td>📋 Lista estructurada</td>
                  <td>Media</td>
                  <td>Alta</td>
                  <td>Fácil</td>
                  <td>Tareas, recordatorios, listas de compra</td>
                </tr>
                <tr>
                  <td>🗒️ Método Cornell</td>
                  <td>Alta</td>
                  <td>Media</td>
                  <td>Muy fácil</td>
                  <td>Estudio, clases, conferencias</td>
                </tr>
                <tr>
                  <td>🗺️ Mapas mentales</td>
                  <td>Alta</td>
                  <td>Media</td>
                  <td>Visual e intuitiva</td>
                  <td>Planificación, relaciones entre ideas</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <section>
          <h2>Quién usa esta herramienta y cómo</h2>
          <p>Ejemplos reales de personas que sacan partido a las notas digitales en su día a día.</p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
                <h4>Estudiante en clase o lectura</h4>
              </div>
              <p className={styles.escenarioExample}>
                Ana apunta las ideas clave mientras lee un artículo. Crea una nota por capítulo con título descriptivo para localizarla después al repasar.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: usa la categoría «Estudio» y un título con la asignatura y el tema para encontrarlas rápido.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💼</span>
                <h4>Profesional con tareas y recordatorios</h4>
              </div>
              <p className={styles.escenarioExample}>
                Carlos captura tareas pendientes y recordatorios rápidos durante reuniones. Exporta el JSON al final de la semana como respaldo.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: usa la categoría «Trabajo» y revisa tus notas cada mañana antes de empezar.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">✨</span>
                <h4>Persona creativa con ideas y fragmentos</h4>
              </div>
              <p className={styles.escenarioExample}>
                Marta guarda fragmentos de texto, frases inspiradoras y bocetos de proyectos. Usa la categoría «Ideas» para no perder ningún chispazo creativo.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: una idea por nota, aunque sea corta. Es más fácil buscar y combinar ideas separadas que extraerlas de un bloque largo.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ── */}
        <section>
          <h2>Preguntas frecuentes</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Se guardan mis notas automáticamente?</summary>
                <p>
                  Sí. Cada vez que pulsas «Crear Nota» o «Guardar Cambios», la nota queda guardada en el almacenamiento local de tu navegador (localStorage). No necesitas hacer nada adicional: si cierras la pestaña y la vuelves a abrir, tus notas seguirán ahí.
                </p>
                <p className={styles.faqTip}>
                  Importante: el guardado es por dispositivo y navegador. Si cambias de navegador o borras los datos del sitio, las notas desaparecen.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Puedo exportar mis notas?</summary>
                <p>
                  Sí. Pulsa el botón «Exportar» en el panel de notas. Se descargará un archivo JSON con todas tus notas que podrás guardar como copia de seguridad o importar en otro dispositivo con el botón «Importar».
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Qué pasa si cierro el navegador?</summary>
                <p>
                  Tus notas ya guardadas permanecen intactas: están almacenadas localmente en tu dispositivo. Lo único que se pierde es el texto que estuvieras escribiendo en el formulario si aún no habías pulsado «Crear Nota».
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Hay límite de longitud en una nota?</summary>
                <p>
                  No hay un límite estricto establecido por la herramienta. El título admite hasta 100 caracteres. El contenido puede ser tan largo como necesites, aunque para notas muy extensas puede ser más práctico dividirlas en varias notas temáticas.
                </p>
              </details>
            </li>
          </ul>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <section>
          <h2>Cómo crear y gestionar una nota: 4 pasos</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Abre una nota nueva</strong>
                <p>El formulario de la izquierda está siempre listo para escribir. Si tienes una nota en edición, pulsa «Cancelar» primero para empezar desde cero.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Escribe un título descriptivo</strong>
                <p>El título es lo primero que ves en la lista. Que sea concreto: «Reunión lunes — puntos a tratar» es mucho más útil que «Reunión».</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Añade el contenido y elige categoría</strong>
                <p>Escribe o pega el texto en el área de contenido. Selecciona la categoría que mejor describa el tipo de nota para poder filtrarla después.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Guarda o exporta cuando termines</strong>
                <p>Pulsa «Crear Nota» para guardarla al instante. Si quieres un respaldo fuera del navegador, usa el botón «Exportar» para descargar todas tus notas en formato JSON.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <section>
          <h2>4 buenas prácticas para tomar notas digitales</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏷️</span>
              <h4>Usa títulos descriptivos</h4>
              <p>Un buen título te permite localizar la nota en segundos. Incluye el contexto: fecha, proyecto o tema concreto.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🗂️</span>
              <h4>Una idea por nota</h4>
              <p>Las notas cortas y enfocadas son mucho más fáciles de encontrar y reutilizar que un bloque largo con todo mezclado.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔄</span>
              <h4>Revisa al final del día</h4>
              <p>Dedica 5 minutos al cierre de la jornada a repasar las notas del día. Elimina las que ya no sirvan y completa las que quedaron a medias.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💾</span>
              <h4>Exporta notas importantes</h4>
              <p>Las notas importantes merecen un respaldo fuera del navegador. Exporta el JSON periódicamente y guárdalo en un lugar seguro.</p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box ── */}
        <section>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>4 errores habituales al tomar notas digitales</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Cerrar el navegador sin guardar.</strong> El texto del formulario que aún no has guardado como nota se pierde al cerrar la pestaña. Pulsa siempre «Crear Nota» antes de salir.
              </li>
              <li>
                <strong>Acumular notas sin revisar.</strong> Las notas sin revisar se vuelven inútiles rápidamente. Programa una revisión periódica para eliminar lo obsoleto y actualizar lo que sigue vigente.
              </li>
              <li>
                <strong>Guardar datos sensibles sin cifrado.</strong> Esta herramienta almacena en localStorage sin cifrar. No guardes contraseñas, datos bancarios ni información personal sensible aquí.
              </li>
              <li>
                <strong>Una nota gigante con todo mezclado.</strong> Una nota muy larga con temas variados es casi imposible de usar después. Divide el contenido en notas más pequeñas y específicas.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('notas')} />

      <ShareCard appName="notas" />
      <Footer appName="notas" />
    </div>
  );
}
