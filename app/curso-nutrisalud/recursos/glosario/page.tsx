'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import styles from '../../CursoNutrisalud.module.css';
import { MeskeiaLogo, Footer, LegalNotice } from '@/components';

interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
  relatedChapter?: string;
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  // Macronutrientes
  {
    term: 'Carbohidratos',
    definition: 'Macronutriente principal fuente de energía (4 kcal/g). Incluyen azúcares simples, almidones y fibra. Los complejos (integrales) son preferibles a los refinados.',
    category: 'Macronutrientes',
    relatedChapter: 'fundamentos/macronutrientes',
  },
  {
    term: 'Proteínas',
    definition: 'Macronutrientes formados por aminoácidos (4 kcal/g). Esenciales para síntesis muscular, enzimas, hormonas y función inmune. Pueden ser completas (animales) o incompletas (vegetales).',
    category: 'Macronutrientes',
    relatedChapter: 'fundamentos/macronutrientes',
  },
  {
    term: 'Grasas',
    definition: 'Macronutriente más calórico (9 kcal/g). Incluyen saturadas, monoinsaturadas (saludables) y poliinsaturadas (omega-3, omega-6). Esenciales para hormonas y absorción de vitaminas.',
    category: 'Macronutrientes',
    relatedChapter: 'fundamentos/macronutrientes',
  },
  {
    term: 'Fibra',
    definition: 'Carbohidrato no digerible que alimenta la microbiota intestinal. Soluble (avena, legumbres) e insoluble (cereales integrales). Mejora tránsito intestinal y control glucémico.',
    category: 'Macronutrientes',
    relatedChapter: 'fundamentos/macronutrientes',
  },
  {
    term: 'Aminoácidos esenciales',
    definition: 'Los 9 aminoácidos que el cuerpo no puede sintetizar y debe obtener de la dieta: leucina, isoleucina, valina, lisina, metionina, fenilalanina, treonina, triptófano e histidina.',
    category: 'Macronutrientes',
    relatedChapter: 'fundamentos/macronutrientes',
  },
  {
    term: 'Omega-3',
    definition: 'Ácidos grasos poliinsaturados antiinflamatorios. Incluyen EPA y DHA (pescado) y ALA (plantas). Esenciales para cerebro, corazón y control de inflamación.',
    category: 'Macronutrientes',
    relatedChapter: 'organos/cerebro',
  },
  {
    term: 'Índice glucémico (IG)',
    definition: 'Medida de la velocidad con que un alimento eleva la glucosa en sangre (0-100). Bajo (<55), medio (55-70), alto (>70). No considera cantidad real consumida.',
    category: 'Macronutrientes',
    relatedChapter: 'fundamentos/macronutrientes',
  },
  {
    term: 'Carga glucémica',
    definition: 'Índice glucémico × gramos de carbohidratos / 100. Medida más práctica que el IG porque considera la porción real consumida.',
    category: 'Macronutrientes',
    relatedChapter: 'fundamentos/macronutrientes',
  },

  // Micronutrientes
  {
    term: 'Vitaminas liposolubles',
    definition: 'Vitaminas A, D, E y K. Se almacenan en tejido graso, requieren grasa para su absorción. El exceso puede acumularse y causar toxicidad.',
    category: 'Micronutrientes',
    relatedChapter: 'fundamentos/micronutrientes',
  },
  {
    term: 'Vitaminas hidrosolubles',
    definition: 'Vitaminas del grupo B y C. Se disuelven en agua, no se almacenan significativamente, el exceso se excreta. Requieren ingesta regular.',
    category: 'Micronutrientes',
    relatedChapter: 'fundamentos/micronutrientes',
  },
  {
    term: 'Antioxidantes',
    definition: 'Compuestos que neutralizan radicales libres. Incluyen vitaminas C y E, selenio, polifenoles. Protegen células del daño oxidativo.',
    category: 'Micronutrientes',
    relatedChapter: 'fundamentos/micronutrientes',
  },
  {
    term: 'Polifenoles',
    definition: 'Compuestos vegetales con propiedades antioxidantes y antiinflamatorias. Incluyen flavonoides, antocianinas, resveratrol. Presentes en frutas, verduras, té, cacao.',
    category: 'Micronutrientes',
    relatedChapter: 'fundamentos/micronutrientes',
  },
  {
    term: 'Biodisponibilidad',
    definition: 'Porcentaje de un nutriente que realmente se absorbe y utiliza. Varía según forma química, matriz alimentaria e interacciones con otros nutrientes.',
    category: 'Micronutrientes',
    relatedChapter: 'interacciones/combinaciones-positivas',
  },

  // Sistema digestivo
  {
    term: 'Microbiota intestinal',
    definition: 'Comunidad de billones de microorganismos en el intestino. Influye en digestión, inmunidad, metabolismo y salud mental. Se nutre principalmente de fibra.',
    category: 'Digestivo',
    relatedChapter: 'organos/intestino',
  },
  {
    term: 'Prebióticos',
    definition: 'Fibras fermentables que alimentan bacterias beneficiosas. Incluyen inulina, FOS, almidón resistente. Presentes en ajo, cebolla, plátano, legumbres.',
    category: 'Digestivo',
    relatedChapter: 'organos/intestino',
  },
  {
    term: 'Probióticos',
    definition: 'Microorganismos vivos que, ingeridos en cantidad adecuada, confieren beneficios a la salud. Presentes en yogur, kéfir, chucrut, kimchi.',
    category: 'Digestivo',
    relatedChapter: 'organos/intestino',
  },
  {
    term: 'Permeabilidad intestinal',
    definition: 'Capacidad de la barrera intestinal para regular qué pasa a la sangre. Cuando aumenta ("intestino permeable"), pueden pasar sustancias no deseadas.',
    category: 'Digestivo',
    relatedChapter: 'organos/intestino',
  },
  {
    term: 'Enzimas digestivas',
    definition: 'Proteínas que descomponen nutrientes: amilasa (carbohidratos), proteasa (proteínas), lipasa (grasas). Secretadas por páncreas, estómago e intestino.',
    category: 'Digestivo',
    relatedChapter: 'fundamentos/sistema-digestivo',
  },
  {
    term: 'Ácidos biliares',
    definition: 'Sustancias producidas por el hígado que emulsionan grasas para facilitar su digestión. Se almacenan en vesícula biliar.',
    category: 'Digestivo',
    relatedChapter: 'organos/higado',
  },

  // Hígado y metabolismo
  {
    term: 'Gluconeogénesis',
    definition: 'Proceso hepático de producción de glucosa a partir de fuentes no glucídicas (aminoácidos, glicerol). Mantiene glucemia en ayuno.',
    category: 'Metabolismo',
    relatedChapter: 'organos/higado',
  },
  {
    term: 'Glucógeno',
    definition: 'Forma de almacenamiento de glucosa en hígado (~100g) y músculos (~400g). Reserva energética de acceso rápido.',
    category: 'Metabolismo',
    relatedChapter: 'organos/higado',
  },
  {
    term: 'Cetosis',
    definition: 'Estado metabólico donde el cuerpo usa cetonas (de grasas) como combustible principal. Ocurre en ayuno prolongado o dietas muy bajas en carbohidratos.',
    category: 'Metabolismo',
    relatedChapter: 'organos/cerebro',
  },
  {
    term: 'Resistencia a la insulina',
    definition: 'Reducción de la respuesta celular a la insulina, requiriendo más insulina para el mismo efecto. Precursor de diabetes tipo 2.',
    category: 'Metabolismo',
    relatedChapter: 'organos/higado',
  },
  {
    term: 'Esteatosis hepática',
    definition: 'Acumulación de grasa en el hígado ("hígado graso"). Causada principalmente por exceso de fructosa, alcohol y sedentarismo.',
    category: 'Metabolismo',
    relatedChapter: 'organos/higado',
  },

  // Cerebro y neurotransmisores
  {
    term: 'Neurotransmisores',
    definition: 'Mensajeros químicos cerebrales: serotonina (ánimo), dopamina (motivación), GABA (calma), acetilcolina (memoria). Se sintetizan a partir de aminoácidos.',
    category: 'Cerebro',
    relatedChapter: 'organos/cerebro',
  },
  {
    term: 'DHA',
    definition: 'Ácido docosahexaenoico, omega-3 que constituye 30-40% de los ácidos grasos de la corteza cerebral. Esencial para función cognitiva.',
    category: 'Cerebro',
    relatedChapter: 'organos/cerebro',
  },
  {
    term: 'Barrera hematoencefálica',
    definition: 'Barrera selectiva que protege el cerebro, regulando qué sustancias pasan de la sangre al tejido cerebral.',
    category: 'Cerebro',
    relatedChapter: 'organos/cerebro',
  },
  {
    term: 'Nootrópicos',
    definition: 'Sustancias que mejoran función cognitiva. Naturales incluyen cafeína+L-teanina, curcumina, omega-3, flavonoides del cacao.',
    category: 'Cerebro',
    relatedChapter: 'organos/cerebro',
  },

  // Cardiovascular
  {
    term: 'LDL y HDL',
    definition: 'Lipoproteínas que transportan colesterol. LDL ("malo") lleva colesterol a tejidos; HDL ("bueno") lo recoge y lleva al hígado para excreción.',
    category: 'Cardiovascular',
    relatedChapter: 'organos/cardiovascular',
  },
  {
    term: 'Triglicéridos',
    definition: 'Principal forma de almacenamiento de grasa. Niveles elevados en sangre se asocian a riesgo cardiovascular. Se elevan con exceso de azúcar y alcohol.',
    category: 'Cardiovascular',
    relatedChapter: 'organos/cardiovascular',
  },
  {
    term: 'Aterosclerosis',
    definition: 'Acumulación de placas (grasa, colesterol, calcio) en arterias. Proceso inflamatorio crónico que puede causar infartos y ACV.',
    category: 'Cardiovascular',
    relatedChapter: 'organos/cardiovascular',
  },
  {
    term: 'Óxido nítrico',
    definition: 'Molécula que dilata vasos sanguíneos, mejorando flujo sanguíneo. Se produce a partir de nitratos (remolacha, verduras de hoja) y arginina.',
    category: 'Cardiovascular',
    relatedChapter: 'organos/cardiovascular',
  },

  // Interacciones
  {
    term: 'Quelantes',
    definition: 'Sustancias que se unen a minerales impidiendo su absorción. Ejemplos: fitatos, oxalatos, taninos, calcio con hierro.',
    category: 'Interacciones',
    relatedChapter: 'interacciones/combinaciones-negativas',
  },
  {
    term: 'Fitatos',
    definition: 'Antinutrientes en cereales y legumbres que reducen absorción de minerales. Se reducen con remojo, germinación y fermentación.',
    category: 'Interacciones',
    relatedChapter: 'interacciones/combinaciones-negativas',
  },
  {
    term: 'Matriz alimentaria',
    definition: 'Estructura física del alimento que afecta digestión y absorción de nutrientes. Un nutriente aislado no es igual que en su alimento original.',
    category: 'Interacciones',
    relatedChapter: 'interacciones/matriz-alimentaria',
  },
  {
    term: 'Cronoautrición',
    definition: 'Estudio de cómo el momento de ingesta afecta el metabolismo. Los ritmos circadianos influyen en digestión, absorción y utilización de nutrientes.',
    category: 'Interacciones',
    relatedChapter: 'interacciones/timing-nutricional',
  },

  // Aplicación práctica
  {
    term: 'Ultraprocesados',
    definition: 'Productos industriales con ingredientes que no usarías en cocina casera (aditivos, emulsionantes, potenciadores). Asociados a peores resultados de salud.',
    category: 'Práctica',
    relatedChapter: 'aplicacion/lectura-etiquetas',
  },
  {
    term: 'NOVA',
    definition: 'Sistema de clasificación de alimentos según grado de procesamiento: 1) No procesados, 2) Ingredientes culinarios, 3) Procesados, 4) Ultraprocesados.',
    category: 'Práctica',
    relatedChapter: 'aplicacion/lectura-etiquetas',
  },
  {
    term: 'Densidad nutricional',
    definition: 'Cantidad de nutrientes por caloría. Alimentos con alta densidad nutricional (verduras, huevos) vs. "calorías vacías" (refrescos, bollería).',
    category: 'Práctica',
    relatedChapter: 'fundamentos/comer-vs-nutrirse',
  },
  {
    term: 'Batch cooking',
    definition: 'Técnica de cocinar en lotes para toda la semana. Permite mantener alimentación saludable con poco tiempo diario.',
    category: 'Práctica',
    relatedChapter: 'aplicacion/planificacion',
  },
  {
    term: 'Regla 80/20',
    definition: 'Principio de flexibilidad: si el 80% de tu alimentación es nutritiva, el 20% puede ser más flexible sin impacto significativo en salud.',
    category: 'Práctica',
    relatedChapter: 'aplicacion/planificacion',
  },
];

const CATEGORIES = [
  'Todos',
  'Macronutrientes',
  'Micronutrientes',
  'Digestivo',
  'Metabolismo',
  'Cerebro',
  'Cardiovascular',
  'Interacciones',
  'Práctica',
];

export default function GlosarioPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter((term) => {
      const matchesSearch =
        term.term.toLowerCase().includes(search.toLowerCase()) ||
        term.definition.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === 'Todos' || term.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => a.term.localeCompare(b.term, 'es'));
  }, [search, selectedCategory]);

  const groupedTerms = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {};
    filteredTerms.forEach((term) => {
      const letter = term.term[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(term);
    });
    return groups;
  }, [filteredTerms]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>📖</span>
        <h1 className={styles.title}>Glosario Nutricional</h1>
        <p className={styles.subtitle}>
          Términos clave del Curso de Nutrición ordenados alfabéticamente
        </p>
      </header>

      <LegalNotice />

      {/* Navegación */}
      <nav className={styles.navigation}>
        <Link href="/curso-nutrisalud" className={styles.navButton}>
          ← Volver al curso
        </Link>
        <div className={styles.navProgress}>
          <div className={styles.navProgressText}>{GLOSSARY_TERMS.length}</div>
          <div className={styles.navProgressLabel}>Términos</div>
        </div>
        <div className={styles.navProgress}>
          <div className={styles.navProgressText}>{filteredTerms.length}</div>
          <div className={styles.navProgressLabel}>Mostrando</div>
        </div>
      </nav>

      {/* Filtros */}
      <div className={styles.glossaryFilters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Buscar término..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.categoryFilters}>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`${styles.categoryButton} ${
                selectedCategory === category ? styles.categoryActive : ''
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Términos */}
      <div className={styles.glossaryContent}>
        {Object.keys(groupedTerms)
          .sort()
          .map((letter) => (
            <div key={letter} className={styles.glossarySection}>
              <h2 className={styles.glossaryLetter}>{letter}</h2>
              <div className={styles.glossaryTerms}>
                {groupedTerms[letter].map((item) => (
                  <div key={item.term} className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h3 className={styles.glossaryTerm}>{item.term}</h3>
                      <span className={styles.glossaryCategory}>
                        {item.category}
                      </span>
                    </div>
                    <p className={styles.glossaryDefinition}>{item.definition}</p>
                    {item.relatedChapter && (
                      <Link
                        href={`/curso-nutrisalud/${item.relatedChapter}`}
                        className={styles.glossaryLink}
                      >
                        Ver capítulo relacionado →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

        {filteredTerms.length === 0 && (
          <div className={styles.noResults}>
            <p>No se encontraron términos que coincidan con tu búsqueda.</p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('Todos');
              }}
              className={styles.resetButton}
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      <Footer appName="curso-nutrisalud" />
    </div>
  );
}
