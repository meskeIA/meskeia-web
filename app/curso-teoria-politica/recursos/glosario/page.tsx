'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import styles from '../../CursoTeoriaPolitica.module.css';
import { MeskeiaLogo, Footer } from '@/components';

// Definición del glosario
const GLOSSARY_TERMS = [
  {
    term: 'Alienación',
    definition: 'En Marx, proceso por el cual el trabajador se separa del producto de su trabajo, del proceso productivo, de sí mismo y de los demás. El trabajo deja de ser expresión de la esencia humana.',
    category: 'Marx',
  },
  {
    term: 'Amor propio (amour propre)',
    definition: 'En Rousseau, deseo corrupto de ser reconocido como superior a los demás. Se distingue del legítimo amor de sí (amour de soi), que es el instinto de autoconservación.',
    category: 'Rousseau',
  },
  {
    term: 'Aristocracia',
    definition: 'Gobierno de los mejores (áristos = mejor). En la clasificación aristotélica, régimen recto en que gobiernan pocos en beneficio del bien común.',
    category: 'General',
  },
  {
    term: 'Autarkeia',
    definition: 'Autosuficiencia. Para Aristóteles, capacidad de la polis de bastarse a sí misma para satisfacer las necesidades de la vida buena.',
    category: 'Aristóteles',
  },
  {
    term: 'Base y superestructura',
    definition: 'Conceptos marxistas. La base es la estructura económica (fuerzas y relaciones de producción); la superestructura incluye el Estado, derecho, ideología, que reflejan y legitiman la base.',
    category: 'Marx',
  },
  {
    term: 'Burguesía',
    definition: 'En el análisis marxista, clase propietaria de los medios de producción bajo el capitalismo. Se opone al proletariado.',
    category: 'Marx',
  },
  {
    term: 'Ciudadano (polités)',
    definition: 'Para Aristóteles, quien participa en la administración de justicia y en el gobierno. Debe poder gobernar y ser gobernado.',
    category: 'Aristóteles',
  },
  {
    term: 'Contrato social',
    definition: 'Acuerdo (real o hipotético) mediante el cual los individuos crean la sociedad política y el Estado. Concepto central en Hobbes, Locke, Rousseau y Rawls.',
    category: 'General',
  },
  {
    term: 'Democracia',
    definition: 'Gobierno del pueblo (demos = pueblo, kratos = poder). En Aristóteles, forma desviada en que los pobres gobiernan en su propio interés. En sentido moderno, régimen basado en la soberanía popular.',
    category: 'General',
  },
  {
    term: 'Derechos naturales',
    definition: 'Derechos que poseen los individuos por naturaleza, antes de toda convención social. En Locke: vida, libertad y propiedad.',
    category: 'Locke',
  },
  {
    term: 'Despotismo',
    definition: 'En Montesquieu, gobierno de uno solo sin leyes ni reglas, basado únicamente en el temor. Forma corrupta de poder.',
    category: 'Montesquieu',
  },
  {
    term: 'División de poderes',
    definition: 'Principio según el cual el poder político debe dividirse en ramas separadas (legislativo, ejecutivo, judicial) para evitar el abuso. Desarrollado por Montesquieu.',
    category: 'Montesquieu',
  },
  {
    term: 'Estado de naturaleza',
    definition: 'Situación hipotética de los seres humanos antes de la existencia del Estado. En Hobbes es guerra de todos contra todos; en Locke, paz relativa gobernada por la ley natural.',
    category: 'General',
  },
  {
    term: 'Filósofo-rey',
    definition: 'En Platón, gobernante ideal que combina el poder político con el conocimiento filosófico del Bien. Solo los filósofos deben gobernar.',
    category: 'Platón',
  },
  {
    term: 'Fortuna',
    definition: 'En Maquiavelo, el azar, las circunstancias cambiantes. Gobierna la mitad de nuestras acciones, pero la virtù puede domarla.',
    category: 'Maquiavelo',
  },
  {
    term: 'Ideología',
    definition: 'En Marx, sistema de ideas que legitima los intereses de la clase dominante presentándolos como universales. Falsa conciencia.',
    category: 'Marx',
  },
  {
    term: 'Isonomía',
    definition: 'Igualdad ante la ley. Principio fundamental de la democracia ateniense.',
    category: 'General',
  },
  {
    term: 'Justicia',
    definition: 'En Platón, armonía entre las partes del alma y de la ciudad: cada uno hace lo que le corresponde. En Rawls, equidad: los principios que elegirían personas racionales tras un velo de ignorancia.',
    category: 'General',
  },
  {
    term: 'Leviatán',
    definition: 'Monstruo bíblico que Hobbes usa como metáfora del Estado: un poder artificial todopoderoso creado por los hombres para garantizar la paz.',
    category: 'Hobbes',
  },
  {
    term: 'Liberalismo',
    definition: 'Tradición política que enfatiza los derechos individuales, el gobierno limitado, el Estado de derecho y la libertad económica. Locke es considerado su fundador.',
    category: 'General',
  },
  {
    term: 'Logos',
    definition: 'Razón, lenguaje, discurso. Para Aristóteles, lo que distingue al hombre de otros animales gregarios y permite la vida política.',
    category: 'Aristóteles',
  },
  {
    term: 'Lucha de clases',
    definition: 'En Marx, motor de la historia. El conflicto entre clases con intereses antagónicos impulsa el cambio social.',
    category: 'Marx',
  },
  {
    term: 'Materialismo histórico',
    definition: 'Teoría marxista según la cual las condiciones materiales de producción determinan la vida social, política e ideológica.',
    category: 'Marx',
  },
  {
    term: 'Monarquía',
    definition: 'Gobierno de uno solo. En Aristóteles, forma recta cuando gobierna en beneficio del bien común; tiranía cuando gobierna en su propio interés.',
    category: 'General',
  },
  {
    term: 'Noble mentira',
    definition: 'En Platón, mito de los metales que justifica la división de clases: los dioses habrían mezclado oro, plata o bronce en la composición de cada persona.',
    category: 'Platón',
  },
  {
    term: 'Oligarquía',
    definition: 'Gobierno de pocos (oligos = pocos). En Aristóteles, forma desviada en que los ricos gobiernan en su propio interés.',
    category: 'General',
  },
  {
    term: 'Plusvalía',
    definition: 'En Marx, diferencia entre el valor producido por el trabajador y el salario que recibe. Es apropiada por el capitalista y constituye la fuente de su ganancia.',
    category: 'Marx',
  },
  {
    term: 'Polis',
    definition: 'Ciudad-Estado griega. Para Aristóteles, comunidad política perfecta que permite alcanzar la vida buena.',
    category: 'General',
  },
  {
    term: 'Politeia',
    definition: 'Constitución, régimen político. También nombre del régimen mixto que Aristóteles considera más viable: combinación de oligarquía y democracia.',
    category: 'Aristóteles',
  },
  {
    term: 'Posición original',
    definition: 'En Rawls, situación hipotética desde la cual las partes eligen los principios de justicia tras un velo de ignorancia.',
    category: 'Rawls',
  },
  {
    term: 'Principio de diferencia',
    definition: 'En Rawls, las desigualdades económicas solo son justas si benefician a los miembros menos aventajados de la sociedad.',
    category: 'Rawls',
  },
  {
    term: 'Proletariado',
    definition: 'En Marx, clase desposeída que solo tiene su fuerza de trabajo para vender. Clase revolucionaria llamada a abolir el capitalismo.',
    category: 'Marx',
  },
  {
    term: 'Propiedad',
    definition: 'En Locke, derecho natural adquirido al mezclar el trabajo con los recursos de la naturaleza. El Estado existe para protegerla.',
    category: 'Locke',
  },
  {
    term: 'Razón de Estado',
    definition: 'Concepto asociado a Maquiavelo. La lógica propia de la política, que puede requerir acciones contrarias a la moral convencional.',
    category: 'Maquiavelo',
  },
  {
    term: 'República',
    definition: 'Forma de gobierno sin monarca, basada en la participación ciudadana. En la clasificación aristotélica, incluye democracia y aristocracia.',
    category: 'General',
  },
  {
    term: 'Separación de poderes',
    definition: 'Véase División de poderes.',
    category: 'Montesquieu',
  },
  {
    term: 'Soberanía',
    definition: 'Poder supremo dentro de un territorio. En Hobbes, es absoluto e indivisible. En Rousseau, reside siempre en el pueblo.',
    category: 'General',
  },
  {
    term: 'Tiranía',
    definition: 'Gobierno despótico de uno solo en su propio beneficio. Forma corrupta de la monarquía.',
    category: 'General',
  },
  {
    term: 'Utilitarismo',
    definition: 'Doctrina ética según la cual la acción correcta es la que produce la mayor felicidad para el mayor número. Asociada a Bentham y Mill.',
    category: 'General',
  },
  {
    term: 'Velo de ignorancia',
    definition: 'En Rawls, dispositivo metodológico que garantiza la imparcialidad: las partes en la posición original desconocen su posición social, talentos y concepciones del bien.',
    category: 'Rawls',
  },
  {
    term: 'Virtù',
    definition: 'En Maquiavelo, energía, capacidad de acción, audacia política. No es la virtud moral, sino la habilidad para conquistar y mantener el poder.',
    category: 'Maquiavelo',
  },
  {
    term: 'Voluntad general',
    definition: 'En Rousseau, voluntad del cuerpo político que busca el bien común. Se distingue de la voluntad de todos, que es mera suma de intereses particulares.',
    category: 'Rousseau',
  },
  {
    term: 'Zoon politikon',
    definition: 'Animal político. Definición aristotélica del ser humano: naturalmente inclinado a vivir en comunidad política.',
    category: 'Aristóteles',
  },
];

// Obtener categorías únicas
const CATEGORIES = ['Todos', ...new Set(GLOSSARY_TERMS.map(t => t.category))].sort();

export default function GlosarioPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');

  // Filtrar términos
  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter(item => {
      const matchesSearch = item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.definition.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'Todos' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  // Agrupar por letra
  const groupedTerms = useMemo(() => {
    const groups: { [key: string]: typeof GLOSSARY_TERMS } = {};
    filteredTerms.forEach(term => {
      const letter = term.term[0].toUpperCase();
      if (!groups[letter]) {
        groups[letter] = [];
      }
      groups[letter].push(term);
    });
    return groups;
  }, [filteredTerms]);

  const handleReset = () => {
    setSearchTerm('');
    setActiveCategory('Todos');
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.chapterHero}>
        <span className={styles.chapterHeroIcon}>📖</span>
        <h1 className={styles.chapterHeroTitle}>Glosario de Teoría Política</h1>
        <p className={styles.chapterHeroSubtitle}>
          Términos y conceptos clave del pensamiento político occidental
        </p>
      </header>

      {/* Filtros */}
      <div className={styles.glossaryFilters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Buscar término o concepto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.categoryFilters}>
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`${styles.categoryButton} ${activeCategory === category ? styles.categoryActive : ''}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido del glosario */}
      <div className={styles.glossaryContent}>
        {Object.keys(groupedTerms).length > 0 ? (
          Object.keys(groupedTerms).sort().map(letter => (
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
            <button onClick={handleReset} className={styles.resetButton}>
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className={styles.bottomNavigation}>
        <Link href="/curso-teoria-politica" className={styles.bottomNavLink}>
          <div className={styles.bottomNavLabel}>← Volver</div>
          <div className={styles.bottomNavTitle}>🏛️ Índice del curso</div>
        </Link>
        <Link
          href="/curso-teoria-politica/recursos/documento-completo"
          className={`${styles.bottomNavLink} ${styles.next}`}
        >
          <div className={styles.bottomNavLabel}>Ver también →</div>
          <div className={styles.bottomNavTitle}>📚 Documento completo</div>
        </Link>
      </div>

      <Footer appName="curso-teoria-politica" />
    </div>
  );
}
