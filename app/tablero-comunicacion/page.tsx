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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('tablero-comunicacion')} />
      <Footer appName="tablero-comunicacion" />
    </div>
  );
}
