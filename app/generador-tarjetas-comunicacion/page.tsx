'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './GeneradorTarjetas.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
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
        <h1 className={styles.title}>🃏 Generador de Tarjetas de Comunicación</h1>
        <p className={styles.subtitle}>
          Crea e imprime tarjetas pictográficas personalizadas para comunicación aumentativa.
          Elige emojis, colores y texto para cada tarjeta.
        </p>
      </header>

      <div className={`noPrint`}>
        <LegalNotice />
      </div>

      {/* Selector de vista */}
      <div className={`${styles.vistaTabs} noPrint`} role="tablist" aria-label="Vista de la herramienta">
        <button
          className={`${styles.vistaTab} ${vista === 'editor' ? styles.vistaTabActiva : ''}`}
          onClick={() => setVista('editor')}
          role="tab"
          aria-selected={vista === 'editor'}
        >
          ✏️ Editor
        </button>
        <button
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
              <button className={styles.btnNuevoMazo} onClick={crearMazo} aria-label="Crear nuevo mazo">+</button>
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
                      <button className={styles.btnGuardarNombre} onClick={renombrarMazo}>✓</button>
                      <button className={styles.btnCancelarNombre} onClick={() => setEditandoMazo(false)}>✕</button>
                    </div>
                  ) : (
                    <div className={styles.mazoTituloRow}>
                      <h2 className={styles.mazoNombreH2}>{mazoActual.nombre}</h2>
                      <button
                        className={styles.btnEditarNombre}
                        onClick={() => { setNombreMazo(mazoActual.nombre); setEditandoMazo(true); }}
                        aria-label="Renombrar mazo"
                      >✏️</button>
                      {mazos.length > 1 && (
                        <button
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
          title="📚 Sobre las tarjetas de comunicación"
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
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('generador-tarjetas-comunicacion')} />
        <Footer appName="generador-tarjetas-comunicacion" />
      </div>
    </div>
  );
}
