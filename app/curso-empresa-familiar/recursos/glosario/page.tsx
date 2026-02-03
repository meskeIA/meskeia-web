'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import styles from '../../CursoEmpresaFamiliar.module.css';
import { MeskeiaLogo, Footer, LegalNotice } from '@/components';

interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  // Fundamentos
  { term: 'Empresa Familiar', definition: 'Organización donde una o más familias ejercen control sobre la propiedad, participan en la gestión y tienen intención de transmitir el negocio a las siguientes generaciones.', category: 'Fundamentos' },
  { term: 'Modelo de los Tres Círculos', definition: 'Marco conceptual que representa los tres subsistemas de una empresa familiar: Familia, Propiedad y Empresa, y sus intersecciones.', category: 'Fundamentos' },
  { term: 'Familia Empresaria', definition: 'Conjunto de miembros de una familia que comparten la propiedad y/o gestión de una o más empresas, con visión de continuidad generacional.', category: 'Fundamentos' },
  { term: 'Patrimonio Familiar', definition: 'Conjunto de bienes, derechos y obligaciones pertenecientes a la familia empresaria, incluyendo activos empresariales y personales.', category: 'Fundamentos' },

  // Gobierno
  { term: 'Consejo de Familia', definition: 'Órgano de gobierno familiar que regula las relaciones entre la familia y la empresa, define políticas familiares y preserva los valores y la unidad familiar.', category: 'Gobierno' },
  { term: 'Consejo de Administración', definition: 'Órgano de gobierno corporativo encargado de supervisar la gestión de la empresa, definir la estrategia y velar por los intereses de los accionistas.', category: 'Gobierno' },
  { term: 'Asamblea Familiar', definition: 'Reunión periódica de todos los miembros de la familia empresaria para informar, debatir y tomar decisiones sobre asuntos que afectan al conjunto.', category: 'Gobierno' },
  { term: 'Junta de Accionistas', definition: 'Órgano supremo de la sociedad donde los propietarios ejercen su derecho de voto en proporción a su participación en el capital.', category: 'Gobierno' },
  { term: 'Comité de Dirección', definition: 'Grupo de directivos responsables de la gestión operativa de la empresa, que reporta al Consejo de Administración.', category: 'Gobierno' },
  { term: 'Consejero Independiente', definition: 'Miembro del Consejo de Administración sin vinculación familiar ni ejecutiva, que aporta objetividad y experiencia externa.', category: 'Gobierno' },

  // Protocolo
  { term: 'Protocolo Familiar', definition: 'Documento que recoge los acuerdos, valores, reglas y procedimientos que regulan las relaciones entre la familia y la empresa.', category: 'Protocolo' },
  { term: 'Pacto de Socios', definition: 'Acuerdo privado entre accionistas que regula aspectos no recogidos en los estatutos sociales, como transmisión de acciones o derechos de tanteo.', category: 'Protocolo' },
  { term: 'Política de Empleo Familiar', definition: 'Normas establecidas en el protocolo que definen las condiciones de acceso, promoción y remuneración de familiares en la empresa.', category: 'Protocolo' },
  { term: 'Política de Dividendos', definition: 'Criterios establecidos para la distribución de beneficios entre los accionistas, equilibrando reinversión y retribución.', category: 'Protocolo' },

  // Profesionalización
  { term: 'Profesionalización', definition: 'Proceso de incorporación de prácticas de gestión profesional, sistemas de información y talento externo a la empresa familiar.', category: 'Profesionalización' },
  { term: 'Diferenciación Laboral', definition: 'Separación clara entre el rol familiar y el profesional, aplicando criterios de mérito y desempeño a los familiares que trabajan en la empresa.', category: 'Profesionalización' },
  { term: 'Director General Externo', definition: 'Profesional no familiar contratado para gestionar la empresa, permitiendo separar propiedad de gestión.', category: 'Profesionalización' },
  { term: 'Meritocracia', definition: 'Sistema de promoción y reconocimiento basado en el mérito, las competencias y los resultados, independientemente del vínculo familiar.', category: 'Profesionalización' },

  // Modelos
  { term: 'Modelo Capitán', definition: 'Empresa familiar liderada por un fundador emprendedor que centraliza las decisiones, típica de primera generación y PYMES.', category: 'Modelos' },
  { term: 'Modelo Emperador', definition: 'Empresa familiar con un líder carismático que ejerce un control absoluto, similar al Capitán pero a mayor escala y con más poder concentrado.', category: 'Modelos' },
  { term: 'Modelo Equipo Familiar', definition: 'Empresa donde varios miembros de la familia trabajan juntos y toman decisiones de forma conjunta, típica de hermanos en segunda generación.', category: 'Modelos' },
  { term: 'Familia Profesional', definition: 'Modelo donde la familia mantiene el control pero aplica criterios profesionales rigurosos en la gestión y gobierno de la empresa.', category: 'Modelos' },
  { term: 'Modelo Corporación', definition: 'Empresa familiar donde la gestión está completamente profesionalizada y la familia ejerce el rol de propietaria responsable.', category: 'Modelos' },
  { term: 'Grupo de Inversión Familiar', definition: 'Estructura donde la familia diversifica sus inversiones en múltiples negocios, gestionados de forma independiente bajo un holding familiar.', category: 'Modelos' },
  { term: 'Modelo Mental', definition: 'Conjunto de creencias, valores y supuestos que determinan cómo la familia entiende y gestiona su empresa.', category: 'Modelos' },

  // Sucesión
  { term: 'Sucesión', definition: 'Proceso de transferencia del liderazgo, la propiedad y el control de la empresa de una generación a la siguiente.', category: 'Sucesión' },
  { term: 'Plan de Sucesión', definition: 'Documento estratégico que define los criterios, fases y calendario para la transición generacional en la empresa familiar.', category: 'Sucesión' },
  { term: 'Sucesor', definition: 'Miembro de la familia seleccionado para asumir el liderazgo de la empresa en la siguiente generación.', category: 'Sucesión' },
  { term: 'Sucedido', definition: 'Líder actual de la empresa familiar que debe prepararse para ceder el control a la siguiente generación.', category: 'Sucesión' },
  { term: 'Transición Generacional', definition: 'Período durante el cual se transfiere el poder, la propiedad y el conocimiento de una generación a otra.', category: 'Sucesión' },
  { term: 'Legado Familiar', definition: 'Conjunto de valores, tradiciones, reputación y activos tangibles e intangibles que se transmiten entre generaciones.', category: 'Sucesión' },

  // Conflictos
  { term: 'Conflicto Familia-Empresa', definition: 'Tensiones que surgen cuando los intereses familiares (emocionales, relacionales) chocan con los empresariales (eficiencia, rentabilidad).', category: 'Conflictos' },
  { term: 'Nepotismo', definition: 'Práctica de favorecer a familiares en contratación o promoción sin considerar sus méritos profesionales.', category: 'Conflictos' },
  { term: 'Rivalidad entre Hermanos', definition: 'Competencia y conflictos que pueden surgir entre hermanos propietarios o directivos de la empresa familiar.', category: 'Conflictos' },
  { term: 'Mediación Familiar', definition: 'Proceso de resolución de conflictos mediante un tercero neutral que facilita el diálogo y la búsqueda de acuerdos.', category: 'Conflictos' },

  // Términos adicionales
  { term: 'Family Office', definition: 'Estructura dedicada a gestionar el patrimonio de una familia empresaria, incluyendo inversiones, fiscalidad y servicios personales.', category: 'Estructuras' },
  { term: 'Holding Familiar', definition: 'Sociedad matriz que agrupa las participaciones de la familia en diferentes empresas y activos.', category: 'Estructuras' },
  { term: 'Fundación Familiar', definition: 'Entidad sin ánimo de lucro creada por la familia para canalizar su actividad filantrópica y preservar su legado.', category: 'Estructuras' },
  { term: 'Generación', definition: 'Cada uno de los niveles de descendencia en una familia empresaria (1ª generación = fundadores, 2ª = hijos, etc.).', category: 'Generaciones' },
  { term: 'Primera Generación', definition: 'Fundadores de la empresa familiar, caracterizados por emprendimiento, visión y control centralizado.', category: 'Generaciones' },
  { term: 'Segunda Generación', definition: 'Hijos del fundador que heredan la empresa, enfrentando desafíos de profesionalización y gestión entre hermanos.', category: 'Generaciones' },
  { term: 'Tercera Generación', definition: 'Nietos del fundador que gestionan una empresa con múltiples ramas familiares y mayor complejidad accionarial.', category: 'Generaciones' },
];

const CATEGORIES = ['Todos', 'Fundamentos', 'Gobierno', 'Protocolo', 'Profesionalización', 'Modelos', 'Sucesión', 'Conflictos', 'Estructuras', 'Generaciones'];

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
        <h1 className={styles.chapterHeroTitle}>Glosario de Empresa Familiar</h1>
        <p className={styles.chapterHeroSubtitle}>
          {GLOSSARY_TERMS.length} términos esenciales para comprender la gestión de empresas familiares
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
        <Link href="/curso-empresa-familiar" className={styles.bottomNavLink}>
          <div className={styles.bottomNavLabel}>← Volver</div>
          <div className={styles.bottomNavTitle}>Índice del Curso</div>
        </Link>
        <Link href="/curso-empresa-familiar/recursos/ejercicios" className={`${styles.bottomNavLink} ${styles.next}`}>
          <div className={styles.bottomNavLabel}>Siguiente →</div>
          <div className={styles.bottomNavTitle}>Ejercicios Prácticos</div>
        </Link>
      </div>

      <Footer appName="curso-empresa-familiar" />
    </div>
  );
}
