'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Dafo.module.css';
import { MeskeiaLogo, Footer, LegalNotice } from '@/components';

interface DafoData {
  debilidades: string[];
  amenazas: string[];
  fortalezas: string[];
  oportunidades: string[];
}

const STORAGE_KEY = 'meskeia-dafo-analysis';

const EXAMPLE_DATA: DafoData = {
  fortalezas: [
    'Equipo con experiencia en el sector',
    'Tecnología propia y patentable',
    'Red de contactos establecida',
    'Marca personal reconocida',
  ],
  debilidades: [
    'Recursos financieros limitados',
    'Falta de experiencia en ventas',
    'Dependencia de un solo canal',
    'Equipo pequeño',
  ],
  oportunidades: [
    'Mercado en crecimiento del 20% anual',
    'Regulación favorable próximamente',
    'Posibles alianzas con grandes empresas',
    'Tendencia hacia la digitalización',
  ],
  amenazas: [
    'Competidores con más recursos',
    'Cambios regulatorios inciertos',
    'Crisis económica potencial',
    'Nuevos entrantes en el mercado',
  ],
};

type QuadrantKey = 'fortalezas' | 'debilidades' | 'oportunidades' | 'amenazas';

const QUADRANTS: Array<{
  key: QuadrantKey;
  label: string;
  icon: string;
  type: 'interno' | 'externo';
  nature: 'positivo' | 'negativo';
  color: string;
  hint: string;
}> = [
  {
    key: 'fortalezas',
    label: 'Fortalezas',
    icon: '💪',
    type: 'interno',
    nature: 'positivo',
    color: '#10B981',
    hint: 'Aspectos internos positivos que te dan ventaja',
  },
  {
    key: 'debilidades',
    label: 'Debilidades',
    icon: '⚠️',
    type: 'interno',
    nature: 'negativo',
    color: '#EF4444',
    hint: 'Aspectos internos que necesitas mejorar',
  },
  {
    key: 'oportunidades',
    label: 'Oportunidades',
    icon: '🌟',
    type: 'externo',
    nature: 'positivo',
    color: '#2E86AB',
    hint: 'Factores externos que puedes aprovechar',
  },
  {
    key: 'amenazas',
    label: 'Amenazas',
    icon: '🔥',
    type: 'externo',
    nature: 'negativo',
    color: '#F59E0B',
    hint: 'Factores externos que pueden perjudicarte',
  },
];

export default function DafoPage() {
  const [dafo, setDafo] = useState<DafoData>({
    debilidades: [],
    amenazas: [],
    fortalezas: [],
    oportunidades: [],
  });
  const [inputs, setInputs] = useState<Record<QuadrantKey, string>>({
    fortalezas: '',
    debilidades: '',
    oportunidades: '',
    amenazas: '',
  });
  const [saved, setSaved] = useState(false);

  // Cargar datos guardados
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        setDafo(JSON.parse(savedData));
      } catch {
        // Ignorar errores
      }
    }
  }, []);

  // Guardar automáticamente
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dafo));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 500);

    return () => clearTimeout(timeout);
  }, [dafo]);

  const addItem = (quadrant: QuadrantKey) => {
    const value = inputs[quadrant].trim();
    if (value) {
      setDafo(prev => ({
        ...prev,
        [quadrant]: [...prev[quadrant], value],
      }));
      setInputs(prev => ({ ...prev, [quadrant]: '' }));
    }
  };

  const removeItem = (quadrant: QuadrantKey, index: number) => {
    setDafo(prev => ({
      ...prev,
      [quadrant]: prev[quadrant].filter((_, i) => i !== index),
    }));
  };

  const loadExample = () => {
    setDafo(EXAMPLE_DATA);
  };

  const clearAll = () => {
    if (confirm('¿Estás seguro de que quieres borrar todo el análisis?')) {
      setDafo({
        debilidades: [],
        amenazas: [],
        fortalezas: [],
        oportunidades: [],
      });
    }
  };

  const exportDafo = () => {
    const content = QUADRANTS.map(q => {
      const items = dafo[q.key];
      return `## ${q.icon} ${q.label}\n${items.length > 0 ? items.map(i => `- ${i}`).join('\n') : '(vacío)'}\n`;
    }).join('\n');

    const blob = new Blob([`# Análisis DAFO\nGenerado con meskeIA\n\n${content}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analisis-dafo.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calcular totales
  const totalItems = Object.values(dafo).flat().length;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroIcon}>⚖️</div>
        <h1 className={styles.title}>Análisis DAFO</h1>
        <p className={styles.subtitle}>
          Identifica tus Debilidades, Amenazas, Fortalezas y Oportunidades para tomar mejores decisiones estratégicas.
        </p>
      </header>

      <LegalNotice />

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.stats}>
          <span>{totalItems} elementos añadidos</span>
          {saved && <span className={styles.savedBadge}>✓ Guardado</span>}
        </div>
        <div className={styles.actions}>
          <button onClick={loadExample} className={styles.btnSecondary}>
            📋 Cargar ejemplo
          </button>
          <button onClick={exportDafo} className={styles.btnSecondary}>
            📥 Exportar
          </button>
          <button onClick={clearAll} className={styles.btnDanger}>
            🗑️ Limpiar
          </button>
        </div>
      </div>

      {/* DAFO Grid */}
      <div className={styles.dafoGrid}>
        {QUADRANTS.map((quadrant) => (
          <div
            key={quadrant.key}
            className={`${styles.quadrant} ${styles[quadrant.key]}`}
          >
            <div className={styles.quadrantHeader}>
              <span className={styles.quadrantIcon}>{quadrant.icon}</span>
              <div>
                <h3 className={styles.quadrantTitle}>{quadrant.label}</h3>
                <span className={styles.quadrantHint}>{quadrant.hint}</span>
              </div>
            </div>

            <div className={styles.itemsList}>
              {dafo[quadrant.key].map((item, idx) => (
                <div key={idx} className={styles.item}>
                  <span className={styles.itemText}>{item}</span>
                  <button
                    onClick={() => removeItem(quadrant.key, idx)}
                    className={styles.itemDelete}
                    title="Eliminar"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.inputGroup}>
              <input
                type="text"
                value={inputs[quadrant.key]}
                onChange={(e) => setInputs(prev => ({ ...prev, [quadrant.key]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && addItem(quadrant.key)}
                placeholder={`Añadir ${quadrant.label.toLowerCase()}...`}
                className={styles.input}
              />
              <button
                onClick={() => addItem(quadrant.key)}
                className={styles.btnAdd}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Leyenda */}
      <div className={styles.legend}>
        <div className={styles.legendSection}>
          <h4>Factores Internos</h4>
          <p>Fortalezas y Debilidades - Lo que controlas</p>
        </div>
        <div className={styles.legendSection}>
          <h4>Factores Externos</h4>
          <p>Oportunidades y Amenazas - Lo que no controlas</p>
        </div>
      </div>

      {/* Consejos */}
      <div className={styles.tips}>
        <h3>💡 Consejos para un buen análisis DAFO</h3>
        <ul>
          <li><strong>Sé honesto:</strong> El análisis solo es útil si refleja la realidad</li>
          <li><strong>Sé específico:</strong> "Tenemos buen equipo" es vago. "3 ingenieros con 10+ años en el sector" es específico</li>
          <li><strong>Conecta los puntos:</strong> ¿Cómo puedes usar tus fortalezas para aprovechar oportunidades?</li>
          <li><strong>Prioriza:</strong> No todos los puntos tienen el mismo impacto</li>
        </ul>
      </div>

      {/* Navegación */}
      <div className={styles.navigation}>
        <Link href="/curso-emprendimiento/herramientas/business-model-canvas" className={styles.navLink}>
          ← Business Model Canvas
        </Link>
        <Link href="/curso-emprendimiento/herramientas/elevator-pitch" className={styles.navLink}>
          Elevator Pitch →
        </Link>
      </div>

      <Footer appName="curso-emprendimiento" />
    </div>
  );
}
