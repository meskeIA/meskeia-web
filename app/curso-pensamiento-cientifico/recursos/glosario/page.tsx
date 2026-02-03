'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import styles from '../../CursoPensamientoCientifico.module.css';
import { MeskeiaLogo, Footer, LegalNotice } from '@/components';

interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  // Fundamentos
  { term: 'Ciencia', definition: 'Sistema organizado de conocimientos sobre el mundo, obtenido mediante métodos que buscan objetividad, verificabilidad y reproducibilidad.', category: 'Fundamentos' },
  { term: 'Empirismo', definition: 'Corriente filosófica que sostiene que el conocimiento proviene principalmente de la experiencia sensorial y la observación.', category: 'Fundamentos' },
  { term: 'Racionalismo', definition: 'Corriente filosófica que enfatiza el papel de la razón y la lógica como fuentes principales del conocimiento.', category: 'Fundamentos' },
  { term: 'Conocimiento', definition: 'Información justificada y verdadera que un sujeto posee sobre algo, distinguiéndose de la mera creencia u opinión.', category: 'Fundamentos' },

  // Método científico
  { term: 'Hipótesis', definition: 'Proposición tentativa que se formula como posible explicación de un fenómeno y que debe ser sometida a verificación experimental.', category: 'Método' },
  { term: 'Experimento', definition: 'Procedimiento controlado diseñado para probar una hipótesis, aislando variables para establecer relaciones causales.', category: 'Método' },
  { term: 'Variable independiente', definition: 'Factor que el investigador manipula deliberadamente para observar su efecto sobre otras variables.', category: 'Método' },
  { term: 'Variable dependiente', definition: 'Factor que se mide o observa y que se espera cambie como resultado de la manipulación de la variable independiente.', category: 'Método' },
  { term: 'Grupo de control', definition: 'Grupo de referencia que no recibe el tratamiento experimental, permitiendo comparar los resultados.', category: 'Método' },
  { term: 'Falsabilidad', definition: 'Criterio propuesto por Karl Popper según el cual una teoría es científica si puede, en principio, ser refutada mediante observación o experimento.', category: 'Método' },
  { term: 'Reproducibilidad', definition: 'Capacidad de que los resultados de un experimento puedan ser replicados por otros investigadores siguiendo el mismo procedimiento.', category: 'Método' },

  // Paradigmas
  { term: 'Paradigma', definition: 'Marco conceptual compartido por una comunidad científica que define los problemas legítimos, métodos aceptables y estándares de solución.', category: 'Paradigmas' },
  { term: 'Revolución científica', definition: 'Cambio fundamental en los conceptos básicos y prácticas experimentales de una disciplina científica, según Thomas Kuhn.', category: 'Paradigmas' },
  { term: 'Ciencia normal', definition: 'Período de investigación científica basada en logros previos reconocidos, resolviendo problemas dentro del paradigma establecido.', category: 'Paradigmas' },
  { term: 'Anomalía', definition: 'Observación o resultado experimental que no puede explicarse satisfactoriamente dentro del paradigma vigente.', category: 'Paradigmas' },
  { term: 'Reduccionismo', definition: 'Enfoque que busca explicar fenómenos complejos reduciéndolos a sus componentes más simples y fundamentales.', category: 'Paradigmas' },
  { term: 'Holismo', definition: 'Perspectiva que considera los sistemas como totalidades cuyas propiedades no pueden explicarse solo por sus partes.', category: 'Paradigmas' },

  // Verdad y lógica
  { term: 'Verdad', definition: 'Correspondencia entre una proposición y los hechos de la realidad, o coherencia dentro de un sistema de creencias.', category: 'Lógica' },
  { term: 'Falacia', definition: 'Error en el razonamiento que invalida la lógica de un argumento, aunque pueda parecer convincente superficialmente.', category: 'Lógica' },
  { term: 'Ad hominem', definition: 'Falacia que ataca a la persona que presenta un argumento en lugar de refutar el argumento mismo.', category: 'Lógica' },
  { term: 'Hombre de paja', definition: 'Falacia que consiste en distorsionar o exagerar la posición del oponente para que sea más fácil de atacar.', category: 'Lógica' },
  { term: 'Falsa dicotomía', definition: 'Falacia que presenta solo dos opciones como si fueran las únicas posibles, ignorando alternativas.', category: 'Lógica' },
  { term: 'Pendiente resbaladiza', definition: 'Falacia que sugiere que un evento llevará inevitablemente a una cadena de consecuencias negativas extremas.', category: 'Lógica' },
  { term: 'Correlación vs causación', definition: 'Distinción crucial: que dos eventos ocurran juntos no implica que uno cause el otro.', category: 'Lógica' },

  // Sesgos cognitivos
  { term: 'Sesgo cognitivo', definition: 'Patrón sistemático de desviación del pensamiento racional que afecta nuestros juicios y decisiones.', category: 'Sesgos' },
  { term: 'Sesgo de confirmación', definition: 'Tendencia a buscar, interpretar y recordar información que confirma nuestras creencias preexistentes.', category: 'Sesgos' },
  { term: 'Efecto halo', definition: 'Sesgo por el cual la impresión general de una persona influye en cómo juzgamos sus características específicas.', category: 'Sesgos' },
  { term: 'Anclaje', definition: 'Tendencia a depender excesivamente de la primera información recibida al tomar decisiones.', category: 'Sesgos' },
  { term: 'Aversión a la pérdida', definition: 'Tendencia a preferir evitar pérdidas antes que obtener ganancias equivalentes.', category: 'Sesgos' },
  { term: 'Sesgo de disponibilidad', definition: 'Tendencia a sobreestimar la probabilidad de eventos que recordamos fácilmente.', category: 'Sesgos' },

  // Pseudociencia
  { term: 'Pseudociencia', definition: 'Conjunto de creencias o prácticas que se presentan como científicas pero carecen del rigor metodológico y la evidencia requerida.', category: 'Pseudociencia' },
  { term: 'Efecto placebo', definition: 'Mejora percibida o real en la salud que ocurre sin tratamiento activo, debido a las expectativas del paciente.', category: 'Pseudociencia' },
  { term: 'Cherry picking', definition: 'Selección sesgada de datos que apoyan una conclusión, ignorando los que la contradicen.', category: 'Pseudociencia' },
  { term: 'Cámara de eco', definition: 'Entorno donde las personas solo encuentran información que refuerza sus creencias existentes.', category: 'Pseudociencia' },
  { term: 'Teoría conspirativa', definition: 'Explicación de eventos que atribuye su causa a un complot secreto, generalmente resistente a la evidencia contraria.', category: 'Pseudociencia' },

  // Ética científica
  { term: 'Ética científica', definition: 'Conjunto de principios que guían la conducta responsable en la investigación y aplicación del conocimiento.', category: 'Ética' },
  { term: 'Consentimiento informado', definition: 'Proceso por el cual los participantes de investigación aceptan participar tras comprender los riesgos y beneficios.', category: 'Ética' },
  { term: 'Conflicto de intereses', definition: 'Situación donde intereses personales o financieros pueden influir en la objetividad de la investigación.', category: 'Ética' },
  { term: 'Principio de precaución', definition: 'Enfoque que favorece tomar medidas preventivas ante posibles daños, incluso sin certeza científica completa.', category: 'Ética' },
];

const CATEGORIES = ['Todos', 'Fundamentos', 'Método', 'Paradigmas', 'Lógica', 'Sesgos', 'Pseudociencia', 'Ética'];

export default function GlosarioPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter(item => {
      const matchesSearch = item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.definition.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // Agrupar por letra
  const groupedTerms = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {};
    filteredTerms.forEach(term => {
      const letter = term.term[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(term);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredTerms]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <LegalNotice />

      {/* Hero */}
      <header className={styles.chapterHero}>
        <span className={styles.chapterHeroIcon}>📖</span>
        <h1 className={styles.chapterHeroTitle}>Glosario de Pensamiento Científico</h1>
        <p className={styles.chapterHeroSubtitle}>
          {GLOSSARY_TERMS.length} términos esenciales para comprender el método científico y el pensamiento crítico
        </p>
      </header>

      {/* Filtros */}
      <div className={styles.glossaryFilters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="🔍 Buscar término o definición..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.categoryFilters}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`${styles.categoryButton} ${selectedCategory === cat ? styles.categoryActive : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido del glosario */}
      <div className={styles.glossaryContent}>
        {groupedTerms.length === 0 ? (
          <div className={styles.noResults}>
            <p>No se encontraron términos con los filtros seleccionados.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('Todos'); }}
              className={styles.resetButton}
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          groupedTerms.map(([letter, terms]) => (
            <div key={letter} className={styles.glossarySection}>
              <h2 className={styles.glossaryLetter}>{letter}</h2>
              <div className={styles.glossaryTerms}>
                {terms.map(item => (
                  <div key={item.term} className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h3 className={styles.glossaryTerm}>{item.term}</h3>
                      <span className={styles.glossaryCategory}>{item.category}</span>
                    </div>
                    <p className={styles.glossaryDefinition}>{item.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Navegación */}
      <div className={styles.bottomNavigation}>
        <Link href="/curso-pensamiento-cientifico" className={styles.bottomNavLink}>
          <div className={styles.bottomNavLabel}>← Volver</div>
          <div className={styles.bottomNavTitle}>Índice del Curso</div>
        </Link>
        <Link href="/curso-pensamiento-cientifico/recursos/ejercicios" className={`${styles.bottomNavLink} ${styles.next}`}>
          <div className={styles.bottomNavLabel}>Siguiente →</div>
          <div className={styles.bottomNavTitle}>Ejercicios Prácticos</div>
        </Link>
      </div>

      <Footer appName="curso-pensamiento-cientifico" />
    </div>
  );
}
