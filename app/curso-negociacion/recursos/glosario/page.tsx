'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '../../CursoNegociacion.module.css';
import { MeskeiaLogo, Footer } from '@/components';

interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  // Conceptos Fundamentales
  {
    term: 'BATNA',
    definition: 'Best Alternative to a Negotiated Agreement. Tu mejor alternativa si la negociación actual fracasa. Es la fuente principal de poder negociador.',
    category: 'Fundamentos'
  },
  {
    term: 'ZOPA',
    definition: 'Zone of Possible Agreement. El rango donde los precios de reserva de ambas partes se solapan, permitiendo un acuerdo mutuamente beneficioso.',
    category: 'Fundamentos'
  },
  {
    term: 'Precio de Reserva',
    definition: 'El punto mínimo (o máximo) en el que estás dispuesto a cerrar un acuerdo. Por debajo (o encima) de este límite, prefieres no cerrar.',
    category: 'Fundamentos'
  },
  {
    term: 'Negociación Distributiva',
    definition: 'Tipo de negociación donde el beneficio de una parte implica pérdida para la otra. También llamada "ganar-perder" o "suma cero".',
    category: 'Fundamentos'
  },
  {
    term: 'Negociación Integrativa',
    definition: 'Enfoque que busca expandir el valor total disponible antes de distribuirlo. También llamada "ganar-ganar" o "crear valor".',
    category: 'Fundamentos'
  },
  {
    term: 'El Pastel Fijo',
    definition: 'Creencia errónea de que hay una cantidad fija de valor a repartir. Los buenos negociadores expanden el pastel antes de dividirlo.',
    category: 'Fundamentos'
  },

  // Sesgos y Psicología
  {
    term: 'Anclaje',
    definition: 'Sesgo cognitivo por el cual la primera cifra mencionada influye desproporcionadamente en todo el proceso de negociación.',
    category: 'Psicología'
  },
  {
    term: 'Aversión a la Pérdida',
    definition: 'Tendencia a sentir las pérdidas 2.5 veces más intensamente que las ganancias equivalentes. Influye en cómo se perciben las propuestas.',
    category: 'Psicología'
  },
  {
    term: 'Encuadre (Framing)',
    definition: 'Técnica de presentar la misma información de diferentes maneras para influir en la percepción (como ganancia o como evitar pérdida).',
    category: 'Psicología'
  },
  {
    term: 'Escalada de Compromiso',
    definition: 'Tendencia a seguir invirtiendo en una negociación fallida porque ya se ha invertido mucho, ignorando las probabilidades reales de éxito.',
    category: 'Psicología'
  },
  {
    term: 'Heurística de Disponibilidad',
    definition: 'Sesgo que hace dar más peso a información fácil de recordar (reciente, emocional o repetitiva) sobre datos más representativos.',
    category: 'Psicología'
  },
  {
    term: 'Reciprocidad',
    definition: 'Tendencia humana a devolver favores. En negociación, pequeñas concesiones iniciales pueden generar contrapartidas desproporcionadas.',
    category: 'Psicología'
  },

  // Tácticas y Persuasión
  {
    term: 'Principios de Cialdini',
    definition: 'Seis principios de influencia: Reciprocidad, Compromiso/Coherencia, Validación Social, Autoridad, Simpatía y Escasez.',
    category: 'Tácticas'
  },
  {
    term: 'Escucha Activa',
    definition: 'Técnica de comunicación que implica captar emociones, preocupaciones no expresadas y motivaciones ocultas, más allá de las palabras.',
    category: 'Tácticas'
  },
  {
    term: 'Concesión Condicional',
    definition: 'Ofrecer algo a cambio de algo ("Si ustedes..., nosotros podríamos..."). Crea interdependencia y compromiso mutuo.',
    category: 'Tácticas'
  },
  {
    term: 'Paquete de Concesiones',
    definition: 'Agrupar varios elementos en una propuesta conjunta, dificultando que la contraparte rechace todo el paquete.',
    category: 'Tácticas'
  },
  {
    term: 'Primera Oferta',
    definition: 'Propuesta inicial que actúa como ancla. Quien hace la primera oferta generalmente obtiene resultados más favorables.',
    category: 'Tácticas'
  },

  // Cierre y Contratos
  {
    term: 'Cierre de Resumen',
    definition: 'Técnica de cierre que recapitula todos los puntos acordados para crear momentum hacia el acuerdo final.',
    category: 'Cierre'
  },
  {
    term: 'Cierre Alternativo',
    definition: 'Ofrecer dos opciones, ambas favorables, asumiendo que la decisión ya está tomada ("¿Prefieres el plan A o el plan B?").',
    category: 'Cierre'
  },
  {
    term: 'Cierre por Urgencia',
    definition: 'Crear presión temporal legítima para acelerar la decisión. Debe ser auténtica para mantener credibilidad.',
    category: 'Cierre'
  },
  {
    term: 'Contrato',
    definition: 'Acuerdo legalmente vinculante entre partes que establece derechos, obligaciones y consecuencias por incumplimiento.',
    category: 'Cierre'
  },
  {
    term: 'Cláusula de Resolución',
    definition: 'Disposición contractual que establece el procedimiento a seguir en caso de disputas (mediación, arbitraje, jurisdicción).',
    category: 'Cierre'
  },

  // Conflictos y Resolución
  {
    term: 'RAC',
    definition: 'Resolución Alternativa de Conflictos. Métodos como mediación y arbitraje que evitan los tribunales tradicionales.',
    category: 'Conflictos'
  },
  {
    term: 'Mediación',
    definition: 'Proceso donde un tercero neutral facilita la comunicación entre las partes para que lleguen a un acuerdo voluntario.',
    category: 'Conflictos'
  },
  {
    term: 'Arbitraje',
    definition: 'Proceso donde un árbitro escucha a ambas partes y emite una decisión vinculante. Más formal que la mediación.',
    category: 'Conflictos'
  },
  {
    term: 'Juego Infinito',
    definition: 'Concepto de Simon Sinek aplicado a negociación: priorizar relaciones a largo plazo sobre victorias puntuales.',
    category: 'Conflictos'
  },

  // Cultural
  {
    term: 'Alta Contexto',
    definition: 'Culturas donde la comunicación es indirecta y depende del contexto (ej: Japón, España). Importante en negociación internacional.',
    category: 'Cultural'
  },
  {
    term: 'Bajo Contexto',
    definition: 'Culturas con comunicación directa y explícita (ej: EEUU, Alemania). Los mensajes se transmiten principalmente con palabras.',
    category: 'Cultural'
  },
  {
    term: 'Monocrónico',
    definition: 'Culturas que valoran la puntualidad y enfoque en una tarea a la vez (ej: Norte de Europa, EEUU).',
    category: 'Cultural'
  },
  {
    term: 'Policrónico',
    definition: 'Culturas más flexibles con el tiempo, donde las relaciones tienen prioridad sobre horarios (ej: Latinoamérica, Medio Oriente).',
    category: 'Cultural'
  }
];

const CATEGORIES = ['Todos', 'Fundamentos', 'Psicología', 'Tácticas', 'Cierre', 'Conflictos', 'Cultural'];

export default function GlosarioPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');

  const filteredTerms = GLOSSARY_TERMS.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Todos' || term.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Agrupar por letra
  const groupedTerms = filteredTerms.reduce((acc, term) => {
    const letter = term.term[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(term);
    return acc;
  }, {} as Record<string, GlossaryTerm[]>);

  const sortedLetters = Object.keys(groupedTerms).sort();

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.chapterHero}>
        <span className={styles.chapterHeroIcon}>📖</span>
        <h1 className={styles.chapterHeroTitle}>Glosario de Negociación</h1>
        <p className={styles.chapterHeroSubtitle}>
          Términos clave para dominar el arte de negociar
        </p>
      </header>

      {/* Navegación */}
      <nav className={styles.navigation}>
        <Link href="/curso-negociacion" className={styles.navButton}>
          ← Volver al Curso
        </Link>
        <div className={styles.navProgress}>
          <div className={styles.navProgressText}>{GLOSSARY_TERMS.length}</div>
          <div className={styles.navProgressLabel}>términos</div>
        </div>
        <Link href="/curso-negociacion/recursos/ejercicios" className={styles.navButton}>
          Ejercicios →
        </Link>
      </nav>

      {/* Filtros */}
      <div className={styles.glossaryFilters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Buscar término o definición..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.categoryFilters}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`${styles.categoryButton} ${activeCategory === cat ? styles.categoryActive : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div className={styles.glossaryContent}>
        {sortedLetters.length > 0 ? (
          sortedLetters.map(letter => (
            <div key={letter} className={styles.glossarySection}>
              <h2 className={styles.glossaryLetter}>{letter}</h2>
              <div className={styles.glossaryTerms}>
                {groupedTerms[letter].map((item, idx) => (
                  <div key={idx} className={styles.glossaryCard}>
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
        ) : (
          <div className={styles.noResults}>
            <p>No se encontraron términos que coincidan con tu búsqueda.</p>
            <button
              onClick={() => { setSearchTerm(''); setActiveCategory('Todos'); }}
              className={styles.resetButton}
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      <Footer appName="curso-negociacion" />
    </div>
  );
}
