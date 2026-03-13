'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './TableroComunicacion.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  DisclaimerCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
type CategoriaId = 'necesidades' | 'emociones' | 'comida' | 'acciones' | 'personas' | 'lugares';

interface Simbolo {
  id: string;
  emoji: string;
  texto: string;
  categoria: CategoriaId;
}

interface Categoria {
  id: CategoriaId;
  nombre: string;
  icono: string;
  color: string;
  colorFondo: string;
}

// Categorías con colores diferenciados
const CATEGORIAS: Categoria[] = [
  { id: 'necesidades', nombre: 'Necesidades', icono: '❗', color: '#DC2626', colorFondo: '#FEF2F2' },
  { id: 'emociones',  nombre: 'Emociones',  icono: '😊', color: '#D97706', colorFondo: '#FFFBEB' },
  { id: 'comida',     nombre: 'Comida',      icono: '🍎', color: '#16A34A', colorFondo: '#F0FDF4' },
  { id: 'acciones',   nombre: 'Acciones',    icono: '👋', color: '#2E86AB', colorFondo: '#EFF6FF' },
  { id: 'personas',   nombre: 'Personas',    icono: '👨‍👩‍👧', color: '#7C3AED', colorFondo: '#F5F3FF' },
  { id: 'lugares',    nombre: 'Lugares',     icono: '🏠', color: '#0D9488', colorFondo: '#F0FDFA' },
];

// Base de símbolos
const SIMBOLOS: Simbolo[] = [
  // Necesidades
  { id: 'si',       emoji: '✅', texto: 'Sí',         categoria: 'necesidades' },
  { id: 'no',       emoji: '❌', texto: 'No',         categoria: 'necesidades' },
  { id: 'ayuda',    emoji: '🆘', texto: 'Ayuda',      categoria: 'necesidades' },
  { id: 'agua',     emoji: '💧', texto: 'Agua',       categoria: 'necesidades' },
  { id: 'hambre',   emoji: '🍽️', texto: 'Hambre',     categoria: 'necesidades' },
  { id: 'bano',     emoji: '🚽', texto: 'Baño',       categoria: 'necesidades' },
  { id: 'cansado',  emoji: '😴', texto: 'Cansado',    categoria: 'necesidades' },
  { id: 'dolor',    emoji: '🤕', texto: 'Me duele',   categoria: 'necesidades' },
  { id: 'frio',     emoji: '🥶', texto: 'Frío',       categoria: 'necesidades' },
  { id: 'calor',    emoji: '🥵', texto: 'Calor',      categoria: 'necesidades' },
  { id: 'mas',      emoji: '➕', texto: 'Más',        categoria: 'necesidades' },
  { id: 'termino',  emoji: '🔚', texto: 'Terminé',    categoria: 'necesidades' },

  // Emociones
  { id: 'feliz',      emoji: '😊', texto: 'Feliz',       categoria: 'emociones' },
  { id: 'triste',     emoji: '😢', texto: 'Triste',      categoria: 'emociones' },
  { id: 'enfadado',   emoji: '😡', texto: 'Enfadado',    categoria: 'emociones' },
  { id: 'asustado',   emoji: '😰', texto: 'Asustado',    categoria: 'emociones' },
  { id: 'tranquilo',  emoji: '😌', texto: 'Tranquilo',   categoria: 'emociones' },
  { id: 'confundido', emoji: '😕', texto: 'Confundido',  categoria: 'emociones' },
  { id: 'emocionado', emoji: '🤩', texto: 'Emocionado',  categoria: 'emociones' },
  { id: 'frustrado',  emoji: '😤', texto: 'Frustrado',   categoria: 'emociones' },
  { id: 'aburrido',   emoji: '😑', texto: 'Aburrido',    categoria: 'emociones' },
  { id: 'amor',       emoji: '🥰', texto: 'Te quiero',   categoria: 'emociones' },
  { id: 'sorpresa',   emoji: '😲', texto: 'Sorpresa',    categoria: 'emociones' },
  { id: 'bien',       emoji: '👍', texto: 'Bien',        categoria: 'emociones' },

  // Comida
  { id: 'fruta',      emoji: '🍎', texto: 'Fruta',      categoria: 'comida' },
  { id: 'platano',    emoji: '🍌', texto: 'Plátano',    categoria: 'comida' },
  { id: 'bocadillo',  emoji: '🥪', texto: 'Bocadillo',  categoria: 'comida' },
  { id: 'leche',      emoji: '🥛', texto: 'Leche',      categoria: 'comida' },
  { id: 'zumo',       emoji: '🧃', texto: 'Zumo',       categoria: 'comida' },
  { id: 'galleta',    emoji: '🍪', texto: 'Galleta',    categoria: 'comida' },
  { id: 'pizza',      emoji: '🍕', texto: 'Pizza',      categoria: 'comida' },
  { id: 'arroz',      emoji: '🍚', texto: 'Arroz',      categoria: 'comida' },
  { id: 'chocolate',  emoji: '🍫', texto: 'Chocolate',  categoria: 'comida' },
  { id: 'yogur',      emoji: '🥣', texto: 'Yogur',      categoria: 'comida' },
  { id: 'pasta',      emoji: '🍝', texto: 'Pasta',      categoria: 'comida' },
  { id: 'helado',     emoji: '🍦', texto: 'Helado',     categoria: 'comida' },

  // Acciones
  { id: 'ir',        emoji: '🚶', texto: 'Ir',           categoria: 'acciones' },
  { id: 'volver',    emoji: '↩️', texto: 'Volver',       categoria: 'acciones' },
  { id: 'parar',     emoji: '🛑', texto: 'Para',         categoria: 'acciones' },
  { id: 'repetir',   emoji: '🔄', texto: 'Otra vez',     categoria: 'acciones' },
  { id: 'hola',      emoji: '👋', texto: 'Hola',         categoria: 'acciones' },
  { id: 'gracias',   emoji: '🙏', texto: 'Gracias',      categoria: 'acciones' },
  { id: 'jugar',     emoji: '🎮', texto: 'Jugar',        categoria: 'acciones' },
  { id: 'ver',       emoji: '📺', texto: 'Ver tele',     categoria: 'acciones' },
  { id: 'leer',      emoji: '📖', texto: 'Leer',         categoria: 'acciones' },
  { id: 'escuchar',  emoji: '🎵', texto: 'Música',       categoria: 'acciones' },
  { id: 'salir',     emoji: '🚪', texto: 'Salir',        categoria: 'acciones' },
  { id: 'dormir',    emoji: '🛏️', texto: 'Dormir',       categoria: 'acciones' },

  // Personas
  { id: 'yo',      emoji: '🙋', texto: 'Yo',       categoria: 'personas' },
  { id: 'papa',    emoji: '👨', texto: 'Papá',     categoria: 'personas' },
  { id: 'mama',    emoji: '👩', texto: 'Mamá',     categoria: 'personas' },
  { id: 'hermano', emoji: '👦', texto: 'Hermano',  categoria: 'personas' },
  { id: 'hermana', emoji: '👧', texto: 'Hermana',  categoria: 'personas' },
  { id: 'abuelo',  emoji: '👴', texto: 'Abuelo',   categoria: 'personas' },
  { id: 'abuela',  emoji: '👵', texto: 'Abuela',   categoria: 'personas' },
  { id: 'amigo',   emoji: '🤝', texto: 'Amigo',    categoria: 'personas' },
  { id: 'profe',   emoji: '👩‍🏫', texto: 'Profe',    categoria: 'personas' },
  { id: 'doctor',  emoji: '👨‍⚕️', texto: 'Doctor',   categoria: 'personas' },
  { id: 'todos',   emoji: '👨‍👩‍👧‍👦', texto: 'Todos',    categoria: 'personas' },
  { id: 'nadie',   emoji: '🚫', texto: 'Nadie',    categoria: 'personas' },

  // Lugares
  { id: 'casa',     emoji: '🏠', texto: 'Casa',      categoria: 'lugares' },
  { id: 'cole',     emoji: '🏫', texto: 'Colegio',   categoria: 'lugares' },
  { id: 'hospital', emoji: '🏥', texto: 'Hospital',  categoria: 'lugares' },
  { id: 'tienda',   emoji: '🛒', texto: 'Tienda',    categoria: 'lugares' },
  { id: 'parque',   emoji: '🌳', texto: 'Parque',    categoria: 'lugares' },
  { id: 'coche',    emoji: '🚗', texto: 'Coche',     categoria: 'lugares' },
  { id: 'dormit',   emoji: '🛏️', texto: 'Dormitorio', categoria: 'lugares' },
  { id: 'cocina',   emoji: '🍳', texto: 'Cocina',    categoria: 'lugares' },
  { id: 'salon',    emoji: '🛋️', texto: 'Salón',     categoria: 'lugares' },
  { id: 'playa',    emoji: '🏖️', texto: 'Playa',     categoria: 'lugares' },
  { id: 'piscina',  emoji: '🏊', texto: 'Piscina',   categoria: 'lugares' },
  { id: 'farmacia', emoji: '💊', texto: 'Farmacia',  categoria: 'lugares' },
];

// Leer texto con Web Speech API
function leerTexto(texto: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(texto);
  utt.lang = 'es-ES';
  utt.rate = 0.9;
  utt.pitch = 1.1;
  // Preferir voz española si hay
  const voces = window.speechSynthesis.getVoices();
  const vozEs = voces.find(v => v.lang.startsWith('es'));
  if (vozEs) utt.voice = vozEs;
  window.speechSynthesis.speak(utt);
}

export default function TableroComunicacionPage() {
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaId>('necesidades');
  const [frase, setFrase] = useState<Simbolo[]>([]);
  const [ultimoClick, setUltimoClick] = useState('');

  // Cargar voces al montar
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  const simbolosCategoria = SIMBOLOS.filter(s => s.categoria === categoriaActiva);
  const categoriaInfo = CATEGORIAS.find(c => c.id === categoriaActiva)!;

  const agregarSimbolo = useCallback((simbolo: Simbolo) => {
    setFrase(prev => [...prev, simbolo]);
    setUltimoClick(simbolo.id);
    // Leer el símbolo al pulsarlo
    leerTexto(simbolo.texto);
    setTimeout(() => setUltimoClick(''), 300);
  }, []);

  const borrarUltimo = () => setFrase(prev => prev.slice(0, -1));
  const borrarTodo = () => { setFrase([]); window.speechSynthesis?.cancel(); };

  const leerFrase = () => {
    if (frase.length === 0) return;
    leerTexto(frase.map(s => s.texto).join('. '));
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>💬 Tablero de Comunicación</h1>
        <p className={styles.subtitle}>
          Pulsa los símbolos para construir una frase.
          El botón verde la leerá en voz alta.
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="general"
        severity="medium"
        title="Herramienta de apoyo a la comunicación"
      >
        Este tablero es un recurso de apoyo digital y no sustituye a los sistemas AAC
        personalizados, los logopedas ni los profesionales de comunicación aumentativa.
        Para un programa de comunicación adaptado, consulta con un especialista.
      </DisclaimerCard>

      {/* ---- BARRA DE FRASE ---- */}
      <section className={styles.barraFrase} aria-label="Frase construida">
        <div
          className={styles.fraseContenido}
          role="region"
          aria-live="polite"
          aria-label={frase.length > 0
            ? `Frase: ${frase.map(s => s.texto).join(', ')}`
            : 'Frase vacía'}
        >
          {frase.length === 0 ? (
            <span className={styles.frasePlaceholder}>
              Pulsa los símbolos para construir tu frase...
            </span>
          ) : (
            frase.map((s, i) => (
              <span key={`${s.id}-${i}`} className={styles.fraseToken}>
                <span className={styles.fraseEmoji} aria-hidden="true">{s.emoji}</span>
                <span className={styles.frasetexto}>{s.texto}</span>
              </span>
            ))
          )}
        </div>

        {/* Acciones de la frase */}
        <div className={styles.fraseAcciones}>
          <button
            className={styles.btnLeer}
            onClick={leerFrase}
            disabled={frase.length === 0}
            aria-label="Leer frase en voz alta"
            title="Leer frase"
          >
            🔊 Leer
          </button>
          <button
            className={styles.btnBorrar}
            onClick={borrarUltimo}
            disabled={frase.length === 0}
            aria-label="Borrar último símbolo"
            title="Borrar último"
          >
            ⌫
          </button>
          <button
            className={styles.btnLimpiar}
            onClick={borrarTodo}
            disabled={frase.length === 0}
            aria-label="Borrar toda la frase"
            title="Borrar todo"
          >
            🗑️
          </button>
        </div>
      </section>

      {/* ---- CATEGORÍAS ---- */}
      <div
        className={styles.categoriasTabs}
        role="tablist"
        aria-label="Categorías de símbolos"
      >
        {CATEGORIAS.map(cat => (
          <button
            key={cat.id}
            className={`${styles.categoriaTab} ${categoriaActiva === cat.id ? styles.categoriaActiva : ''}`}
            onClick={() => setCategoriaActiva(cat.id)}
            role="tab"
            aria-selected={categoriaActiva === cat.id}
            aria-controls={`panel-${cat.id}`}
            style={categoriaActiva === cat.id
              ? { borderBottomColor: cat.color, color: cat.color }
              : {}}
          >
            <span aria-hidden="true">{cat.icono}</span>
            <span>{cat.nombre}</span>
          </button>
        ))}
      </div>

      {/* ---- GRID DE SÍMBOLOS ---- */}
      <section
        id={`panel-${categoriaActiva}`}
        className={styles.simbolosPanel}
        role="tabpanel"
        aria-label={`Símbolos de ${categoriaInfo.nombre}`}
        style={{ borderColor: categoriaInfo.color }}
      >
        <div className={styles.simbolosGrid}>
          {simbolosCategoria.map(simbolo => (
            <button
              key={simbolo.id}
              className={`${styles.simboloBtn} ${ultimoClick === simbolo.id ? styles.simboloPulsado : ''}`}
              onClick={() => agregarSimbolo(simbolo)}
              aria-label={simbolo.texto}
              style={{
                borderColor: categoriaInfo.color,
                backgroundColor: categoriaInfo.colorFondo,
              }}
            >
              <span className={styles.simboloEmoji} aria-hidden="true">
                {simbolo.emoji}
              </span>
              <span className={styles.simboloTexto}>{simbolo.texto}</span>
            </button>
          ))}
        </div>
      </section>

      <EducationalSection
        title="📚 ¿Qué es la Comunicación Aumentativa y Alternativa (AAC)?"
        subtitle="Información sobre tableros de comunicación y sistemas AAC"
      >
        <section className={styles.guiaSeccion}>
          <h2>¿Qué es la AAC?</h2>
          <p>
            La Comunicación Aumentativa y Alternativa (AAC) engloba todos los métodos
            que complementan o sustituyen el habla cuando una persona no puede comunicarse
            de forma oral. Los tableros de pictogramas son una de las herramientas más
            utilizadas porque combinan imagen y texto, facilitando la comprensión.
          </p>

          <h2>¿A quién ayuda?</h2>
          <ul>
            <li><strong>Autismo</strong>: Muchas personas con TEA son no verbales o tienen lenguaje limitado</li>
            <li><strong>Parálisis cerebral</strong>: Dificultades motoras que afectan al habla</li>
            <li><strong>Afasia</strong>: Pérdida del habla por ictus u otras causas neurológicas</li>
            <li><strong>Síndrome de Down</strong>: Apoyo visual al lenguaje en desarrollo</li>
            <li><strong>Enfermedades degenerativas</strong>: ELA, Parkinson avanzado, esclerosis múltiple</li>
            <li><strong>Situaciones temporales</strong>: Postoperatorio, intubación, recuperación</li>
          </ul>

          <h2>¿Cómo usar este tablero?</h2>
          <ul>
            <li>Pulsa los símbolos para ir construyendo la frase en la barra superior</li>
            <li>Cada símbolo también se lee en voz alta al pulsarlo (retroalimentación inmediata)</li>
            <li>El botón <strong>🔊 Leer</strong> lee la frase completa</li>
            <li>El botón <strong>⌫</strong> borra el último símbolo</li>
            <li>El botón <strong>🗑️</strong> limpia toda la frase</li>
            <li>Las categorías con color ayudan a localizar rápidamente los símbolos</li>
          </ul>

          <h2>Recomendaciones importantes</h2>
          <ul>
            <li>Este tablero es un recurso de inicio y apoyo puntual</li>
            <li>Los sistemas AAC personalizados (PECS, GRID, Proloquo) son más completos</li>
            <li>Un logopeda especializado en AAC puede diseñar un sistema adaptado a cada persona</li>
            <li>La constancia y la práctica diaria son clave para el éxito comunicativo</li>
          </ul>
        </section>

        {/* TABLA COMPARATIVA */}
        <section className={styles.guiaSeccion}>
          <h2>Comparativa: tipos de sistemas AAC</h2>
          <p>Existen varios enfoques de comunicación aumentativa. Esta tabla muestra cuándo es adecuado cada uno:</p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Sistema AAC</th>
                  <th>Sin instalación</th>
                  <th>Personalizable</th>
                  <th>Voz sintética</th>
                  <th>Ideal para</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>💬 Este tablero (meskeIA)</td>
                  <td className={styles.celdaDestacada}>Sí</td>
                  <td>Básica</td>
                  <td className={styles.celdaDestacada}>Sí (navegador)</td>
                  <td>Primer contacto, situaciones puntuales</td>
                </tr>
                <tr>
                  <td>PECS (fotos físicas)</td>
                  <td className={styles.celdaDestacada}>No requiere tech.</td>
                  <td>Alta</td>
                  <td>No</td>
                  <td>TEA, primeras fases de comunicación</td>
                </tr>
                <tr>
                  <td>GRID / Proloquo2Go</td>
                  <td>No (licencia)</td>
                  <td>Muy alta</td>
                  <td className={styles.celdaDestacada}>Sí (calidad alta)</td>
                  <td>Usuarios con AAC como principal vía</td>
                </tr>
                <tr>
                  <td>Tablero en papel impreso</td>
                  <td className={styles.celdaDestacada}>Sí (imprimir)</td>
                  <td>Media</td>
                  <td>No</td>
                  <td>Sin dispositivo disponible, portabilidad</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CASOS DE USO */}
        <section className={styles.guiaSeccion}>
          <h2>¿Para quién y cuándo usar este tablero?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono}>🧒</span>
              <h3>Niño con TEA no verbal</h3>
              <p>Apoyo visual en el hogar para necesidades básicas (agua, baño, hambre) mientras se trabaja con el logopeda en un sistema AAC personalizado. La retroalimentación de voz refuerza la asociación emoji-palabra.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono}>🏥</span>
              <h3>Paciente postoperatorio o intubado</h3>
              <p>Comunicación temporal cuando el habla no es posible. El personal sanitario puede mostrar el tablero en un móvil o tablet para que el paciente señale o pulse los símbolos que necesita.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono}>🧓</span>
              <h3>Persona con afasia progresiva</h3>
              <p>Apoyo para mantener la autonomía comunicativa en etapas en las que el lenguaje oral se deteriora. Las categorías de color facilitan la localización rápida de símbolos con menor esfuerzo cognitivo.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono}>👩‍🏫</span>
              <h3>Educador o logopeda en sesión</h3>
              <p>Demostrar el concepto de comunicación con pictogramas en una sesión inicial, antes de invertir en un sistema comercial. Permite evaluar qué categorías son más relevantes para ese usuario específico.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.guiaSeccion}>
          <h2>Preguntas frecuentes</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Por qué los emojis y no pictogramas especializados?</dt>
              <dd>Los emojis son universales, están disponibles en todos los dispositivos sin descargas, y muchas personas ya los reconocen de WhatsApp. Para pictogramas especializados (ARASAAC, Mulberry), los sistemas GRID o Proloquo ofrecen bibliotecas más completas.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Puedo añadir mis propios símbolos?</dt>
              <dd>Este tablero no permite personalización profunda. Si necesitas símbolos propios o vocabulario específico, usa el Generador de Tarjetas de Comunicación de meskeIA, que sí permite crear mazos personalizados con cualquier emoji y texto.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿La frase se guarda entre sesiones?</dt>
              <dd>No. La frase construida se borra al cerrar o recargar la página. El tablero está pensado para uso en tiempo real. Si necesitas frases frecuentes guardadas, consulta con tu logopeda sobre sistemas AAC con memoria de frases.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Funciona sin conexión a internet?</dt>
              <dd>Sí, una vez que la página está cargada. La síntesis de voz usa el motor del navegador, que funciona localmente. Útil en entornos con conectividad limitada como centros de día o domicilios rurales.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Los símbolos se pueden usar con un pulsador o teclado?</dt>
              <dd>Actualmente los botones son accesibles por teclado (Tab + Enter), pero no hay modo de barrido automático para usuarios con acceso motor muy reducido. Para estos perfiles, se recomienda un sistema AAC especializado con soporte de pulsador.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cuántos símbolos tiene el tablero?</dt>
              <dd>Incluye 72 símbolos organizados en 6 categorías: Necesidades (12), Emociones (12), Comida (12), Acciones (12), Personas (12) y Lugares (12). El vocabulario está seleccionado para cubrir las necesidades básicas más comunes.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Es adecuado para el SAAC de mi hijo si tiene TEA?</dt>
              <dd>Puede ser un punto de partida o un complemento, pero un SAAC completo (Sistema Aumentativo y Alternativo de Comunicación) debe diseñarlo un logopeda especializado, adaptado al nivel cognitivo, motor y comunicativo específico del niño.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿En qué se diferencia de hacer una frase en WhatsApp con emojis?</dt>
              <dd>El tablero lee la frase en voz alta automáticamente, tiene categorías organizadas para encontrar símbolos rápido, y está pensado para personas que no pueden escribir texto. WhatsApp requiere escritura y no tiene voz automatizada integrada.</dd>
            </div>
          </dl>
        </section>

        {/* GUÍA PASO A PASO */}
        <section className={styles.guiaSeccion}>
          <h2>Cómo introducir el tablero con un usuario por primera vez</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div>
                <strong>Explica el tablero con lenguaje sencillo</strong>
                <p>Muestra el tablero y señala los botones mientras dices: &quot;Aquí puedes decir lo que necesitas. Pulsa un dibujo y el ordenador hablará por ti.&quot;</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div>
                <strong>Empieza por la categoría Necesidades</strong>
                <p>Es la más relevante y la que más motivación genera. Practica con &quot;Agua&quot;, &quot;Baño&quot; y &quot;Sí / No&quot; en primeras sesiones.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div>
                <strong>Refuerza cada pulsación con contacto visual</strong>
                <p>Cuando el usuario pulse un símbolo y el tablero lo diga en voz alta, refuerza con &quot;Muy bien, has dicho [palabra]&quot; y satisface la necesidad inmediatamente.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div>
                <strong>No corrijas, amplía</strong>
                <p>Si el usuario pulsa &quot;Agua&quot; añade tú &quot;Agua, quieres agua, aquí tienes.&quot; Modela el uso de frases completas sin corregir ni presionar.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div>
                <strong>Introduce Emociones en la segunda sesión</strong>
                <p>Las emociones son fundamentales para la autorregulación. Practica &quot;Feliz&quot;, &quot;Triste&quot; y &quot;Asustado&quot; en contextos naturales a lo largo del día.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div>
                <strong>Usa el tablero tú también (modelado AAC)</strong>
                <p>Señala los símbolos mientras hablas con el usuario. Si dices &quot;¿quieres zumo?&quot; pulsa también &quot;Zumo&quot; en el tablero. El modelado es esencial para el aprendizaje.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div>
                <strong>Consulta con el logopeda para el siguiente paso</strong>
                <p>Comparte qué símbolos usa más, cuáles ignora y en qué contextos lo usa. Esto ayuda al especialista a diseñar el sistema AAC personalizado más adecuado.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* MEJORES PRÁCTICAS */}
        <section className={styles.guiaSeccion}>
          <h2>Buenas prácticas para comunicadores AAC</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono}>⏱️</span>
              <p><strong>Dale tiempo para responder.</strong> Las personas con AAC necesitan más tiempo para formular su respuesta. Espera al menos 20-30 segundos antes de repetir la pregunta o cambiar de tema.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono}>🔊</span>
              <p><strong>Nunca hables &quot;por&quot; el usuario.</strong> Aunque sepas lo que quiere decir, deja que el tablero hable por él. La independencia comunicativa es el objetivo, no la eficiencia.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono}>🌍</span>
              <p><strong>Usa el tablero en todos los entornos.</strong> Casa, cole, consulta médica. La generalización del uso del tablero a diferentes contextos acelera la adquisición comunicativa.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono}>📲</span>
              <p><strong>Prueba en diferentes dispositivos.</strong> Un tablet con pantalla grande puede ser más accesible para usuarios con motricidad fina reducida. El tamaño de los botones hace una diferencia importante.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono}>🎯</span>
              <p><strong>Practica en situaciones reales, no solo en ejercicios.</strong> El tablero debe usarse cuando el usuario realmente quiere comunicar algo, no solo en sesiones de práctica estructuradas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono}>📚</span>
              <p><strong>Informa al equipo de todos los entornos.</strong> Asegúrate de que familia, profesores y sanitarios sepan cómo funciona el tablero y cómo responder cuando el usuario lo use.</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <section className={styles.guiaSeccion}>
          <div className={styles.warningBox}>
            <h3>⚠️ Lo que este tablero no puede hacer (y es importante saber)</h3>
            <ul>
              <li><strong>No es un sistema AAC completo:</strong> Un SAAC personalizado incluye vocabulario específico del usuario, acceso adaptado (pulsador, mirada), frases preprogramadas y un plan de intervención. Este tablero es un recurso de apoyo de acceso rápido.</li>
              <li><strong>No sustituye al logopeda:</strong> La implementación de AAC con personas con discapacidad comunicativa requiere evaluación especializada, seguimiento y ajuste continuo. Un logopeda especializado en AAC es imprescindible para un programa efectivo.</li>
              <li><strong>La voz puede sonar robótica en algunos dispositivos:</strong> La calidad de la síntesis de voz varía mucho según el navegador y el sistema operativo. En dispositivos móviles de gama baja o navegadores sin voces instaladas, el resultado puede ser poco natural.</li>
              <li><strong>Sin acceso motor adaptado:</strong> Para usuarios con parálisis cerebral u otras condiciones que dificultan señalar o pulsar, este tablero puede no ser accesible sin adaptaciones. Los sistemas con barrido o control ocular son más adecuados en esos casos.</li>
              <li><strong>El vocabulario preinstalado es general:</strong> Los 72 símbolos cubren necesidades básicas. Personas con vocabulario específico por su profesión, afición o contexto familiar necesitarán un sistema con vocabulario personalizado más amplio.</li>
              <li><strong>No almacena frases ni historial:</strong> Cada sesión empieza desde cero. Para usuarios que necesitan frases frecuentes guardadas o historial de comunicación, se recomienda un sistema AAC con memoria persistente.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('tablero-comunicacion')} />
      <Footer appName="tablero-comunicacion" />
    </div>
  );
}
