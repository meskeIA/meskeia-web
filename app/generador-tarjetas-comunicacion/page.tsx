'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './GeneradorTarjetas.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// Tipos
// ============================================

interface Tarjeta {
  id: string;
  emoji: string;
  texto: string;
  color: string;
  categoria: string;
}

interface Mazo {
  id: string;
  nombre: string;
  tarjetas: Tarjeta[];
}

type TamanoTarjeta = 'pequena' | 'mediana' | 'grande';
type Vista = 'editor' | 'imprimir';

// ============================================
// Constantes
// ============================================

const COLORES_CATEGORIA: Record<string, { bg: string; label: string; emoji: string }> = {
  rojo:    { bg: '#FECACA', label: 'Necesidades',  emoji: '❤️' },
  amarillo:{ bg: '#FEF08A', label: 'Emociones',    emoji: '😊' },
  verde:   { bg: '#BBF7D0', label: 'Comida',        emoji: '🍎' },
  azul:    { bg: '#BAE6FD', label: 'Acciones',      emoji: '🏃' },
  morado:  { bg: '#E9D5FF', label: 'Personas',      emoji: '👤' },
  teal:    { bg: '#99F6E4', label: 'Lugares',        emoji: '🏠' },
  gris:    { bg: '#F3F4F6', label: 'General',        emoji: '⭐' },
};

const EMOJIS_POR_CATEGORIA: Record<string, string[]> = {
  rojo:    ['🚽','💊','😴','🤒','🥤','❤️','🆘','😣','🛑','😰','🔥','🩺'],
  amarillo:['😊','😢','😡','😨','😍','🥰','😤','😮','🤗','😐','😴','🎉'],
  verde:   ['🍎','🍞','🥛','🍳','🥗','🍲','🍫','🍕','🥪','🍌','☕','🥣'],
  azul:    ['🏃','✏️','🚿','👕','🛁','🎨','📚','🎮','🧹','🚶','⬆️','🎵'],
  morado:  ['👤','👨','👩','👧','👦','👴','👵','🧑','👨‍⚕️','🐕','🐈','👫'],
  teal:    ['🏠','🏫','🏥','🛒','🌳','🏞️','🚌','🚗','🏖️','🛏️','🚿','🍽️'],
  gris:    ['⭐','✅','❌','⏰','📅','🔔','🆗','💬','🎁','🏆','🔑','📱'],
};

const MAZO_EJEMPLO: Mazo = {
  id: 'ejemplo',
  nombre: 'Necesidades básicas',
  tarjetas: [
    { id: '1', emoji: '🚽', texto: 'Baño',       color: 'rojo',    categoria: 'rojo' },
    { id: '2', emoji: '🥤', texto: 'Agua',        color: 'azul',    categoria: 'azul' },
    { id: '3', emoji: '🍎', texto: 'Comida',      color: 'verde',   categoria: 'verde' },
    { id: '4', emoji: '😴', texto: 'Dormir',      color: 'morado',  categoria: 'morado' },
    { id: '5', emoji: '😊', texto: 'Feliz',       color: 'amarillo',categoria: 'amarillo' },
    { id: '6', emoji: '😢', texto: 'Triste',      color: 'amarillo',categoria: 'amarillo' },
    { id: '7', emoji: '🏠', texto: 'Casa',        color: 'teal',    categoria: 'teal' },
    { id: '8', emoji: '👩', texto: 'Mamá',        color: 'morado',  categoria: 'morado' },
    { id: '9', emoji: '👨', texto: 'Papá',        color: 'morado',  categoria: 'morado' },
    { id: '10',emoji: '❌', texto: 'No',          color: 'gris',    categoria: 'gris' },
    { id: '11',emoji: '✅', texto: 'Sí',          color: 'gris',    categoria: 'gris' },
    { id: '12',emoji: '🆘', texto: 'Ayuda',       color: 'rojo',    categoria: 'rojo' },
  ],
};

const STORAGE_KEY = 'meskeia-tarjetas-v1';
const generarId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ============================================
// Componente
// ============================================

export default function GeneradorTarjetasPage() {
  const [mazos, setMazos] = useState<Mazo[]>([]);
  const [mazoActivo, setMazoActivo] = useState<string>('');
  const [vista, setVista] = useState<Vista>('editor');
  const [tamano, setTamano] = useState<TamanoTarjeta>('mediana');

  // Editor de tarjeta
  const [nuevoEmoji, setNuevoEmoji] = useState('⭐');
  const [nuevoTexto, setNuevoTexto] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('gris');
  const [mostrarEmojisPara, setMostrarEmojisPara] = useState<string | null>(null);

  // Editor de mazo
  const [editandoMazo, setEditandoMazo] = useState(false);
  const [nombreMazo, setNombreMazo] = useState('');

  // Cargar datos
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const datos: Mazo[] = raw ? JSON.parse(raw) : [MAZO_EJEMPLO];
      setMazos(datos);
      setMazoActivo(datos[0]?.id ?? '');
    } catch {
      setMazos([MAZO_EJEMPLO]);
      setMazoActivo(MAZO_EJEMPLO.id);
    }
  }, []);

  const guardar = useCallback((nuevosMazos: Mazo[]) => {
    setMazos(nuevosMazos);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevosMazos)); } catch { /* ignorar */ }
  }, []);

  const mazoActual = mazos.find(m => m.id === mazoActivo) ?? null;

  // ——— MAZOS ———

  const crearMazo = () => {
    const nuevo: Mazo = { id: generarId(), nombre: 'Nuevo mazo', tarjetas: [] };
    const nuevos = [...mazos, nuevo];
    guardar(nuevos);
    setMazoActivo(nuevo.id);
  };

  const eliminarMazo = (id: string) => {
    if (mazos.length <= 1) return;
    const nuevos = mazos.filter(m => m.id !== id);
    guardar(nuevos);
    setMazoActivo(nuevos[0].id);
  };

  const renombrarMazo = () => {
    if (!nombreMazo.trim() || !mazoActual) return;
    guardar(mazos.map(m => m.id === mazoActivo ? { ...m, nombre: nombreMazo.trim() } : m));
    setEditandoMazo(false);
  };

  // ——— TARJETAS ———

  const agregarTarjeta = () => {
    if (!nuevoTexto.trim() || !mazoActual) return;
    const nueva: Tarjeta = {
      id: generarId(),
      emoji: nuevoEmoji,
      texto: nuevoTexto.trim(),
      color: nuevaCategoria,
      categoria: nuevaCategoria,
    };
    guardar(mazos.map(m =>
      m.id === mazoActivo ? { ...m, tarjetas: [...m.tarjetas, nueva] } : m
    ));
    setNuevoTexto('');
    setMostrarEmojisPara(null);
  };

  const eliminarTarjeta = (tarjetaId: string) => {
    guardar(mazos.map(m =>
      m.id === mazoActivo
        ? { ...m, tarjetas: m.tarjetas.filter(t => t.id !== tarjetaId) }
        : m
    ));
  };

  // ——— IMPRIMIR ———

  const imprimir = () => {
    window.print();
  };

  // ——— RENDER ———

  const tarjetasActuales = mazoActual?.tarjetas ?? [];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={`${styles.hero} noPrint`}>
        <h1 className={styles.title}><span aria-hidden="true">🃏</span> Generador de Tarjetas de Comunicación</h1>
        <p className={styles.subtitle}>
          Crea e imprime tarjetas pictográficas personalizadas para comunicación aumentativa.
          Elige emojis, colores y texto para cada tarjeta.
        </p>
      </header>

      <div className={`noPrint`}>
        <LegalNotice />
      </div>

      <DisclaimerCard
        variant="medical"
        severity="high"
        collapsible={false}
      />

      {/* Selector de vista */}
      <div className={`${styles.vistaTabs} noPrint`} role="tablist" aria-label="Vista de la herramienta">
        <button
          type="button"
          className={`${styles.vistaTab} ${vista === 'editor' ? styles.vistaTabActiva : ''}`}
          onClick={() => setVista('editor')}
          role="tab"
          aria-selected={vista === 'editor'}
        >
          ✏️ Editor
        </button>
        <button
          type="button"
          className={`${styles.vistaTab} ${vista === 'imprimir' ? styles.vistaTabActiva : ''}`}
          onClick={() => setVista('imprimir')}
          role="tab"
          aria-selected={vista === 'imprimir'}
        >
          🖨️ Previsualizar e imprimir
        </button>
      </div>

      {/* ——— VISTA EDITOR ——— */}
      {vista === 'editor' && (
        <div className={`${styles.editorPanel} noPrint`} role="tabpanel">
          {/* Selector de mazo */}
          <div className={styles.mazosSidebar}>
            <div className={styles.mazosHeader}>
              <h2 className={styles.mazosTitulo}>Mazos</h2>
              <button type="button" className={styles.btnNuevoMazo} onClick={crearMazo} aria-label="Crear nuevo mazo">+</button>
            </div>
            <div className={styles.mazosList}>
              {mazos.map(m => (
                <button
                  key={m.id}
                  className={`${styles.mazoItem} ${m.id === mazoActivo ? styles.mazoItemActivo : ''}`}
                  onClick={() => setMazoActivo(m.id)}
                  aria-pressed={m.id === mazoActivo}
                >
                  <span className={styles.mazoItemNombre}>{m.nombre}</span>
                  <span className={styles.mazoItemCount}>{m.tarjetas.length}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Panel principal */}
          <div className={styles.editorMain}>
            {mazoActual && (
              <>
                {/* Cabecera del mazo */}
                <div className={styles.mazoHeader}>
                  {editandoMazo ? (
                    <div className={styles.mazoRenombrar}>
                      <input
                        className={styles.inputMazoNombre}
                        value={nombreMazo}
                        onChange={e => setNombreMazo(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') renombrarMazo(); }}
                        autoFocus
                        maxLength={40}
                      />
                      <button type="button" className={styles.btnGuardarNombre} onClick={renombrarMazo}>✓</button>
                      <button type="button" className={styles.btnCancelarNombre} onClick={() => setEditandoMazo(false)}>✕</button>
                    </div>
                  ) : (
                    <div className={styles.mazoTituloRow}>
                      <h2 className={styles.mazoNombreH2}>{mazoActual.nombre}</h2>
                      <button
                        type="button"
                        className={styles.btnEditarNombre}
                        onClick={() => { setNombreMazo(mazoActual.nombre); setEditandoMazo(true); }}
                        aria-label="Renombrar mazo"
                      >✏️</button>
                      {mazos.length > 1 && (
                        <button
                          type="button"
                          className={styles.btnEliminarMazo}
                          onClick={() => eliminarMazo(mazoActual.id)}
                          aria-label="Eliminar mazo"
                        >🗑️</button>
                      )}
                    </div>
                  )}
                </div>

                {/* Formulario nueva tarjeta */}
                <div className={styles.nuevaTarjetaForm}>
                  <h3 className={styles.formTitulo}>Añadir tarjeta</h3>

                  {/* Selector de categoría/color */}
                  <div className={styles.categoriaSelector}>
                    {Object.entries(COLORES_CATEGORIA).map(([key, val]) => (
                      <button
                        key={key}
                        className={`${styles.categoriaBtnColor} ${nuevaCategoria === key ? styles.categoriaActiva : ''}`}
                        style={{ backgroundColor: val.bg }}
                        onClick={() => {
                          setNuevaCategoria(key);
                          if (EMOJIS_POR_CATEGORIA[key]?.[0]) {
                            setNuevoEmoji(EMOJIS_POR_CATEGORIA[key][0]);
                          }
                          setMostrarEmojisPara(null);
                        }}
                        aria-label={val.label}
                        title={val.label}
                        aria-pressed={nuevaCategoria === key}
                      >
                        {val.emoji}
                      </button>
                    ))}
                  </div>

                  <div className={styles.formRow}>
                    {/* Selector de emoji */}
                    <div className={styles.emojiCol}>
                      <button
                        type="button"
                        className={styles.btnEmojiGrande}
                        onClick={() => setMostrarEmojisPara(mostrarEmojisPara === 'nuevo' ? null : 'nuevo')}
                        aria-label={`Emoji: ${nuevoEmoji}. Pulsa para cambiar`}
                        aria-expanded={mostrarEmojisPara === 'nuevo'}
                      >
                        {nuevoEmoji}
                      </button>
                      {mostrarEmojisPara === 'nuevo' && (
                        <div className={styles.emojiDropdown} role="listbox">
                          {EMOJIS_POR_CATEGORIA[nuevaCategoria]?.map(e => (
                            <button
                              key={e}
                              className={`${styles.emojiOpt} ${e === nuevoEmoji ? styles.emojiOptActivo : ''}`}
                              onClick={() => { setNuevoEmoji(e); setMostrarEmojisPara(null); }}
                              role="option"
                              aria-selected={e === nuevoEmoji}
                            >{e}</button>
                          ))}
                          {/* Emojis extra de otras categorías */}
                          {['😀','🌟','🔴','🟢','🔵','🟡','🟠','⬛','⬜','🔶','🔷','💡',
                            '🎯','🎪','🎭','🏅','🎀','🌈','🍀','🌸','🦋','🐣','🌻','🎸'].map(e => (
                            <button
                              key={e}
                              className={`${styles.emojiOpt} ${e === nuevoEmoji ? styles.emojiOptActivo : ''}`}
                              onClick={() => { setNuevoEmoji(e); setMostrarEmojisPara(null); }}
                              role="option"
                              aria-selected={e === nuevoEmoji}
                            >{e}</button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Input texto */}
                    <div className={styles.textoCol}>
                      <label className={styles.inputLabel} htmlFor="nueva-tarjeta-texto">
                        Texto de la tarjeta
                      </label>
                      <input
                        id="nueva-tarjeta-texto"
                        className={styles.inputTexto}
                        type="text"
                        value={nuevoTexto}
                        onChange={e => setNuevoTexto(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') agregarTarjeta(); }}
                        placeholder="Ej: Agua, Baño, Ayuda..."
                        maxLength={20}
                      />
                    </div>

                    <button
                      type="button"
                      className={styles.btnAgregarTarjeta}
                      onClick={agregarTarjeta}
                      disabled={!nuevoTexto.trim()}
                      aria-label="Añadir tarjeta"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Grid de tarjetas */}
                {tarjetasActuales.length === 0 ? (
                  <div className={styles.sinTarjetas}>
                    <p>Este mazo está vacío. Añade tarjetas con el formulario de arriba.</p>
                  </div>
                ) : (
                  <div className={styles.tarjetasEditorGrid}>
                    {tarjetasActuales.map(t => (
                      <div
                        key={t.id}
                        className={styles.tarjetaEditorItem}
                        style={{ backgroundColor: COLORES_CATEGORIA[t.color]?.bg ?? '#F3F4F6' }}
                      >
                        <span className={styles.tarjetaEditorEmoji}>{t.emoji}</span>
                        <span className={styles.tarjetaEditorTexto}>{t.texto}</span>
                        <button
                          type="button"
                          className={styles.btnEliminarT}
                          onClick={() => eliminarTarjeta(t.id)}
                          aria-label={`Eliminar tarjeta ${t.texto}`}
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ——— VISTA IMPRIMIR ——— */}
      {vista === 'imprimir' && (
        <div className={`${styles.imprimirPanel} noPrint`} role="tabpanel">
          {/* Controles de impresión */}
          <div className={styles.imprimirControles}>
            <div className={styles.controlGrupo}>
              <label className={styles.controlLabel}>Mazo a imprimir</label>
              <select
                className={styles.controlSelect}
                value={mazoActivo}
                onChange={e => setMazoActivo(e.target.value)}
                aria-label="Seleccionar mazo"
              >
                {mazos.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre} ({m.tarjetas.length} tarjetas)</option>
                ))}
              </select>
            </div>

            <div className={styles.controlGrupo}>
              <label className={styles.controlLabel}>Tamaño de tarjeta</label>
              <div className={styles.tamanoOpciones} role="group" aria-label="Tamaño de tarjeta">
                {([
                  { key: 'pequena', label: 'Pequeña', sub: '5×5 cm' },
                  { key: 'mediana', label: 'Mediana', sub: '7×7 cm' },
                  { key: 'grande',  label: 'Grande',  sub: '10×10 cm' },
                ] as { key: TamanoTarjeta; label: string; sub: string }[]).map(op => (
                  <button
                    key={op.key}
                    type="button"
                    className={`${styles.tamanoBtn} ${tamano === op.key ? styles.tamanoBtnActivo : ''}`}
                    onClick={() => setTamano(op.key)}
                    aria-pressed={tamano === op.key}
                  >
                    <span className={styles.tamanoLabel}>{op.label}</span>
                    <span className={styles.tamanoSub}>{op.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className={styles.btnImprimir}
              onClick={imprimir}
              aria-label="Imprimir tarjetas"
            >
              🖨️ Imprimir
            </button>
          </div>

          <p className={styles.imprimirInfo}>
            Vista previa de {tarjetasActuales.length} tarjetas del mazo <strong>{mazoActual?.nombre}</strong>.
            Usa papel grueso o cartulina para mejores resultados.
          </p>
        </div>
      )}

      {/* ——— GRID DE IMPRESIÓN (visible en ambas vistas en pantalla, siempre en impresión) ——— */}
      <div
        className={`${styles.printArea} ${vista === 'editor' ? styles.printAreaHidden : ''}`}
        aria-label={`Tarjetas de ${mazoActual?.nombre}`}
        id="area-impresion"
      >
        {/* Cabecera del mazo solo en impresión */}
        <div className={`${styles.printHeader} soloImpresion`}>
          <strong>{mazoActual?.nombre}</strong>
        </div>

        <div className={`${styles.tarjetasGrid} ${styles[`grid-${tamano}`]}`}>
          {tarjetasActuales.map(t => (
            <div
              key={t.id}
              className={`${styles.tarjetaImpresion} ${styles[`tarjeta-${tamano}`]}`}
              style={{ backgroundColor: COLORES_CATEGORIA[t.color]?.bg ?? '#F3F4F6' }}
              role="img"
              aria-label={`${t.emoji} ${t.texto}`}
            >
              <span className={styles.tarjetaImpEmoji}>{t.emoji}</span>
              <span className={styles.tarjetaImpTexto}>{t.texto}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="noPrint">
        <EducationalSection
          title="Sobre las tarjetas de comunicación"
          subtitle="Pictogramas y comunicación aumentativa y alternativa"
        >
          <section className={styles.guiaSeccion}>
            <h2>¿Qué son las tarjetas de comunicación?</h2>
            <p>
              Las tarjetas de comunicación son pictogramas físicos que representan palabras, objetos,
              acciones o conceptos. Se utilizan como soporte de comunicación aumentativa y alternativa
              (AAC) para personas con dificultades del habla o el lenguaje.
            </p>

            <h2>¿Cuándo se usan?</h2>
            <ul>
              <li><strong>Autismo (TEA)</strong>: Apoyan la comunicación funcional y reducen la frustración cuando el lenguaje verbal es limitado.</li>
              <li><strong>PECS</strong>: El Sistema de Comunicación por Intercambio de Imágenes usa tarjetas para enseñar a iniciar la comunicación.</li>
              <li><strong>Logopedia</strong>: Como material de trabajo en sesiones para trabajar vocabulario y comprensión.</li>
              <li><strong>Parálisis cerebral</strong>: Cuando las dificultades motoras limitan el habla pero la comprensión es buena.</li>
              <li><strong>Afasia</strong>: Personas adultas con dificultades del lenguaje tras un ictus.</li>
            </ul>

            <h2>Consejos para imprimir y usar las tarjetas</h2>
            <ul>
              <li>Imprime en <strong>papel grueso o cartulina</strong> (160-200 gr) para mayor durabilidad</li>
              <li>Plastifica las tarjetas para que sean más resistentes al uso diario</li>
              <li>Usa velcro en la parte trasera para fijarlas en tableros de comunicación</li>
              <li>El código de colores por categoría ayuda a localizar las tarjetas más rápidamente</li>
              <li>Empieza con <strong>pocas tarjetas</strong> (6-12) y amplía gradualmente</li>
              <li>Adapta el tamaño: pequeño para tableros grandes, grande para usuarios con dificultades motoras</li>
            </ul>
          </section>

          {/* TABLA COMPARATIVA */}
          <section className={styles.guiaSeccion}>
            <h2>Comparativa de tamaños de tarjeta</h2>
            <p>El tamaño de las tarjetas debe adaptarse al usuario y al contexto de uso. Esta tabla resume las diferencias prácticas:</p>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Tamaño</th>
                    <th>Dimensión</th>
                    <th>Tarjetas por A4</th>
                    <th>Motor fino necesario</th>
                    <th>Ideal para</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Pequeño</td>
                    <td>5 × 5 cm</td>
                    <td>~16</td>
                    <td>Fino</td>
                    <td>Tableros grandes, adultos sin dificultades motoras</td>
                  </tr>
                  <tr>
                    <td>Mediano</td>
                    <td>7 × 7 cm</td>
                    <td>~9</td>
                    <td>Medio</td>
                    <td>Uso general, niños en edad escolar</td>
                  </tr>
                  <tr>
                    <td>Grande</td>
                    <td className={styles.celdaDestacada}>10 × 10 cm</td>
                    <td>~4</td>
                    <td className={styles.celdaDestacada}>Grueso (motor reducido)</td>
                    <td>Baja visión, parálisis cerebral, primeros usos</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* CASOS DE USO */}
          <section className={styles.guiaSeccion}>
            <h2>¿Para quién es este generador de tarjetas?</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <span aria-hidden="true" className={styles.escenarioIcono}>🏥</span>
                <h3>Logopeda en sesión</h3>
                <p>Genera y personaliza mazos para trabajar vocabulario funcional con cada paciente. El código de color por categoría facilita la organización temática del material impreso.</p>
              </div>
              <div className={styles.escenarioCard}>
                <span aria-hidden="true" className={styles.escenarioIcono}>🏠</span>
                <h3>Familia en casa</h3>
                <p>Crea tarjetas de las cosas importantes en el hogar: comidas preferidas, rutinas, personas. Usar emojis familiares aumenta el reconocimiento y la velocidad de comunicación.</p>
              </div>
              <div className={styles.escenarioCard}>
                <span aria-hidden="true" className={styles.escenarioIcono}>🎒</span>
                <h3>Maestro de apoyo en el aula</h3>
                <p>Prepara tarjetas de vocabulario del aula, normas de clase o secuencias de actividad. El tamaño grande es idóneo para usuarios con dificultades visuales o motoras en el aula.</p>
              </div>
              <div className={styles.escenarioCard}>
                <span aria-hidden="true" className={styles.escenarioIcono}>🧑</span>
                <h3>Adulto con afasia o ELA</h3>
                <p>Genera un mazo personalizado con las expresiones que más usa en su vida cotidiana. Las tarjetas grandes y plastificadas son más fáciles de manejar con movilidad reducida.</p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className={styles.guiaSeccion}>
            <h2>Preguntas frecuentes</h2>
            <dl className={styles.faqList}>
              <div className={styles.faqItem}>
                <dt>¿Cómo se imprimen las tarjetas?</dt>
                <dd>Pulsa el botón &quot;Imprimir&quot; en la vista de edición. El navegador abrirá el diálogo de impresión. Asegúrate de activar &quot;Imprimir colores de fondo&quot; o &quot;Gráficos de fondo&quot; en las opciones avanzadas para que los colores de categoría se impriman correctamente.</dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Los mazos se guardan si cierro el navegador?</dt>
                <dd>Sí. Todos los mazos y tarjetas se guardan en el almacenamiento local del navegador. La próxima vez que accedas a la app en el mismo dispositivo y navegador, encontrarás tus mazos guardados.</dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Cuántas tarjetas puede tener un mazo?</dt>
                <dd>No hay límite técnico. Sin embargo, para uso en comunicación, los mazos de 12-24 tarjetas bien seleccionadas son más funcionales que mazos de 100 tarjetas poco relevantes. La calidad del vocabulario importa más que la cantidad.</dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Puedo usar fotos reales en lugar de emojis?</dt>
                <dd>Esta versión usa exclusivamente emojis del sistema, que tienen la ventaja de ser reconocibles universalmente y no requieren subir archivos. Para tarjetas con fotos reales, existen herramientas como ARASAAC o Pictoapp especializadas en ello.</dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Es mejor imprimir en color o en blanco y negro?</dt>
                <dd>En color siempre que sea posible: el código de color por categoría (rojo=necesidades, verde=comida, etc.) es una clave visual importante para la búsqueda rápida. En blanco y negro, las tarjetas funcionan pero se pierde esa distinción rápida.</dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Qué papel se recomienda para imprimir?</dt>
                <dd>Papel normal (80 gr) funciona pero se desgasta rápido. Lo ideal es papel fotográfico o cartulina (160-200 gr) y luego plastificar. Para uso intensivo (mano, bolso), la plastificación y un refuerzo de cartón en la parte trasera mejoran mucho la durabilidad.</dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Cómo se usa el velcro con las tarjetas?</dt>
                <dd>Plastifica las tarjetas y pega un trozo pequeño de velcro (parte suave) en la parte trasera. En el tablero, pega la parte rugosa. Así las tarjetas se colocan y se retiran fácilmente, lo que es fundamental en sistemas como PECS.</dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Las tarjetas son adecuadas para el sistema PECS?</dt>
                <dd>Pueden usarse como punto de partida, pero PECS requiere tarjetas con vocabulario específico determinado por el evaluador, y el proceso de entrenamiento debe llevarlo un especialista. Estas tarjetas son un recurso flexible, no un protocolo PECS certificado.</dd>
              </div>
            </dl>
          </section>

          {/* GUÍA PASO A PASO */}
          <section className={styles.guiaSeccion}>
            <h2>Cómo crear e imprimir tu primer mazo</h2>
            <ol className={styles.stepGuide}>
              <li className={styles.step}>
                <span className={styles.stepNumber}>1</span>
                <div>
                  <strong>Define el vocabulario con el logopeda</strong>
                  <p>Antes de crear las tarjetas, identifica con el especialista qué palabras son más funcionales para el usuario en su vida cotidiana (necesidades básicas, personas del entorno, actividades preferidas).</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>2</span>
                <div>
                  <strong>Crea un nuevo mazo</strong>
                  <p>Pulsa &quot;Nuevo mazo&quot; y dale un nombre descriptivo: &quot;Casa&quot;, &quot;Cole&quot;, &quot;Emociones&quot;. Puedes tener varios mazos temáticos.</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>3</span>
                <div>
                  <strong>Añade las tarjetas</strong>
                  <p>Selecciona la categoría de color, elige el emoji más representativo y escribe el texto. El texto debe ser corto (1-2 palabras) para que quede legible en la tarjeta impresa.</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>4</span>
                <div>
                  <strong>Elige el tamaño de impresión</strong>
                  <p>Selecciona Pequeño, Mediano o Grande según las necesidades del usuario. Puedes cambiar el tamaño antes de imprimir sin perder las tarjetas.</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>5</span>
                <div>
                  <strong>Imprime con colores de fondo activados</strong>
                  <p>En el diálogo de impresión, ve a &quot;Más opciones&quot; o &quot;Configuración&quot; y activa &quot;Imprimir colores de fondo&quot;. Sin esta opción, los fondos de color no se imprimirán.</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>6</span>
                <div>
                  <strong>Recorta y plastifica</strong>
                  <p>Recorta cada tarjeta por las líneas (hay espacio entre tarjetas para facilitar el corte). Plastifica para mayor durabilidad. Añade velcro si las vas a usar en un tablero.</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>7</span>
                <div>
                  <strong>Introduce las tarjetas gradualmente</strong>
                  <p>No presentes todas las tarjetas a la vez. Empieza con 3-5 tarjetas del vocabulario más motivador para el usuario y añade nuevas cuando las anteriores estén bien reconocidas.</p>
                </div>
              </li>
            </ol>
          </section>

          {/* MEJORES PRÁCTICAS */}
          <section className={styles.guiaSeccion}>
            <h2>Buenas prácticas para el uso de tarjetas físicas</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span aria-hidden="true" className={styles.tipIcono}>🎯</span>
                <p><strong>Prioriza el vocabulario funcional.</strong> &quot;Agua&quot;, &quot;Baño&quot;, &quot;Más&quot; y &quot;No&quot; tienen más impacto en la calidad de vida que un vocabulario temático extenso. Empieza siempre por lo que el usuario necesita comunicar cada día.</p>
              </div>
              <div className={styles.tipCard}>
                <span aria-hidden="true" className={styles.tipIcono}>📦</span>
                <p><strong>Organiza las tarjetas en un sistema predecible.</strong> Separadores por categoría de color, carpetas con velcro o tableros etiquetados. El usuario debe poder localizar cualquier tarjeta en menos de 5 segundos.</p>
              </div>
              <div className={styles.tipCard}>
                <span aria-hidden="true" className={styles.tipIcono}>🔄</span>
                <p><strong>Reemplaza las tarjetas dañadas inmediatamente.</strong> Una tarjeta borrosa, rota o con el emoji deformado puede causar confusión. Imprime siempre un set de repuesto para sustituir rápidamente las que se deterioren.</p>
              </div>
              <div className={styles.tipCard}>
                <span aria-hidden="true" className={styles.tipIcono}>👁️</span>
                <p><strong>Comprueba que los emojis se reconocen antes de imprimir.</strong> Muestra el mazo en pantalla al usuario y verifica que reconoce el emoji antes de gastar papel y tinta. Algunos emojis pueden ser ambiguos para ciertos usuarios.</p>
              </div>
              <div className={styles.tipCard}>
                <span aria-hidden="true" className={styles.tipIcono}>🤲</span>
                <p><strong>Usa el modelado para enseñar el uso.</strong> Señala o usa tú las tarjetas durante la comunicación con el usuario. El modelado (ver a otros usar el sistema) acelera el aprendizaje más que la instrucción directa.</p>
              </div>
              <div className={styles.tipCard}>
                <span aria-hidden="true" className={styles.tipIcono}>📋</span>
                <p><strong>Documenta qué tarjetas usa y cuáles ignora.</strong> Esta información es valiosa para el logopeda en la revisión del vocabulario. Un mazo que nadie usa necesita rediseño, no más tarjetas.</p>
              </div>
            </div>
          </section>

          {/* WARNING BOX */}
          <section className={styles.guiaSeccion}>
            <div className={styles.warningBox}>
              <h3><span aria-hidden="true">⚠️</span> Errores frecuentes en la creación de materiales AAC</h3>
              <ul>
                <li><strong>Crear mazos muy grandes desde el inicio:</strong> 50 tarjetas desde el primer día es agotador para el usuario y difícil de gestionar. Empieza con 6-12 y amplía en función del uso real.</li>
                <li><strong>Usar emojis que el usuario no reconoce:</strong> Algunos emojis son culturalmente específicos o ambiguos. Verifica siempre la comprensión antes de incluirlos. Un emoji que no se entiende es ruido, no comunicación.</li>
                <li><strong>No activar &quot;colores de fondo&quot; al imprimir:</strong> Sin esta opción, las tarjetas saldrán en blanco y negro, perdiendo el código de color por categoría que facilita la búsqueda rápida.</li>
                <li><strong>No laminar las tarjetas:</strong> Las tarjetas sin plastificar duran pocas semanas de uso intensivo. La humedad, el sudor y los dobleces las deterioran rápidamente. El coste de plastificar es mínimo comparado con reimprimir continuamente.</li>
                <li><strong>Sustituir el habla en lugar de aumentarla:</strong> El objetivo de las tarjetas AAC es aumentar y apoyar la comunicación, no sustituir la voz cuando existe. Si el usuario puede hablar, usa las tarjetas como complemento, no como reemplazo.</li>
                <li><strong>No involucrar al logopeda en el diseño del mazo:</strong> El vocabulario de un sistema AAC debe responder a las necesidades comunicativas reales del usuario, no a lo que el adulto cree que necesita. El especialista tiene las herramientas para identificar ese vocabulario.</li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('generador-tarjetas-comunicacion')} />
        <ShareCard appName="generador-tarjetas-comunicacion" />
        <Footer appName="generador-tarjetas-comunicacion" />
      </div>
    </div>
  );
}
