'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './PlaygroundSQL.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, DisclaimerCard, LastUpdated } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { DATASETS, getDatasetById, EXERCISES, getExerciseById } from './components';
import type { Dataset, QueryResult, Exercise, ExerciseProgress } from './components/types';

// Tipo para sql.js
type SqlJsDatabase = {
  run: (sql: string) => void;
  exec: (sql: string) => { columns: string[]; values: unknown[][] }[];
  close: () => void;
};

type SqlJsStatic = {
  Database: new () => SqlJsDatabase;
};

export default function PlaygroundSQLPage() {
  // Estados principales
  const [db, setDb] = useState<SqlJsDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDataset, setCurrentDataset] = useState<Dataset>(DATASETS[0]);
  const [query, setQuery] = useState('SELECT * FROM productos LIMIT 10;');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'exercises' | 'schema'>('editor');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cargar progreso desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sql-playground-progress');
    if (saved) {
      try {
        setExerciseProgress(JSON.parse(saved));
      } catch {
        // Ignorar errores de parsing
      }
    }
  }, []);

  // Guardar progreso en localStorage
  useEffect(() => {
    if (exerciseProgress.length > 0) {
      localStorage.setItem('sql-playground-progress', JSON.stringify(exerciseProgress));
    }
  }, [exerciseProgress]);

  // Inicializar sql.js y cargar dataset
  const initDatabase = useCallback(async (dataset: Dataset) => {
    setIsLoading(true);

    try {
      // Cargar sql.js dinámicamente
      const initSqlJs = (await import('sql.js')).default;
      const SQL: SqlJsStatic = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`
      });

      // Crear nueva base de datos
      const database = new SQL.Database();

      // Crear tablas e insertar datos
      for (const table of dataset.tables) {
        // Crear tabla
        const columns = table.columns.map(col => {
          let def = `${col.name} ${col.type}`;
          if (col.primaryKey) def += ' PRIMARY KEY';
          return def;
        }).join(', ');

        database.run(`CREATE TABLE ${table.name} (${columns});`);

        // Insertar datos
        for (const row of table.data) {
          const colNames = Object.keys(row).join(', ');
          const values = Object.values(row).map(v => {
            if (v === null) return 'NULL';
            if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
            return v;
          }).join(', ');

          database.run(`INSERT INTO ${table.name} (${colNames}) VALUES (${values});`);
        }
      }

      // Cerrar base de datos anterior si existe
      if (db) {
        db.close();
      }

      setDb(database);
      setResult(null);
    } catch (error) {
      console.error('Error inicializando SQL:', error);
      setResult({
        columns: [],
        values: [],
        rowCount: 0,
        executionTime: 0,
        error: 'Error al cargar la base de datos. Recarga la página.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  // Cargar dataset inicial
  useEffect(() => {
    initDatabase(currentDataset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cambiar dataset
  const handleDatasetChange = (datasetId: string) => {
    const dataset = getDatasetById(datasetId);
    if (dataset) {
      setCurrentDataset(dataset);
      setQuery(`SELECT * FROM ${dataset.tables[0].name} LIMIT 10;`);
      initDatabase(dataset);
      setSelectedExercise(null);
    }
  };

  // Ejecutar consulta
  const executeQuery = useCallback(() => {
    if (!db || !query.trim()) return;

    const startTime = performance.now();

    try {
      const results = db.exec(query);
      const endTime = performance.now();

      if (results.length > 0) {
        const firstResult = results[0];
        setResult({
          columns: firstResult.columns,
          values: firstResult.values,
          rowCount: firstResult.values.length,
          executionTime: endTime - startTime,
        });

        // Verificar si es un ejercicio completado
        if (selectedExercise) {
          const hasCorrectColumns = selectedExercise.expectedColumns.every(
            col => firstResult.columns.some(c => c.toLowerCase().includes(col.toLowerCase()))
          );

          const hasCorrectRows = selectedExercise.expectedRowCount === undefined ||
            firstResult.values.length === selectedExercise.expectedRowCount;

          if (hasCorrectColumns && hasCorrectRows && firstResult.values.length > 0) {
            // Marcar como completado
            setExerciseProgress(prev => {
              const existing = prev.find(p => p.exerciseId === selectedExercise.id);
              if (existing) {
                return prev.map(p =>
                  p.exerciseId === selectedExercise.id
                    ? { ...p, completed: true, userQuery: query, completedAt: new Date().toISOString() }
                    : p
                );
              }
              return [...prev, {
                exerciseId: selectedExercise.id,
                completed: true,
                userQuery: query,
                completedAt: new Date().toISOString(),
              }];
            });
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
          }
        }
      } else {
        setResult({
          columns: [],
          values: [],
          rowCount: 0,
          executionTime: endTime - startTime,
        });
      }
    } catch (error) {
      setResult({
        columns: [],
        values: [],
        rowCount: 0,
        executionTime: 0,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }, [db, query, selectedExercise]);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        executeQuery();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [executeQuery]);

  // Seleccionar ejercicio
  const handleExerciseSelect = (exercise: Exercise) => {
    // Cambiar al dataset del ejercicio si es necesario
    if (exercise.dataset !== currentDataset.id) {
      const dataset = getDatasetById(exercise.dataset);
      if (dataset) {
        setCurrentDataset(dataset);
        initDatabase(dataset);
      }
    }

    setSelectedExercise(exercise);
    setQuery('');
    setResult(null);
    setActiveTab('editor');

    // Enfocar el textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  // Cargar consulta de ejemplo
  const loadSampleQuery = (queryText: string) => {
    setQuery(queryText);
    setSelectedExercise(null);
  };

  // Formatear consulta
  const formatQuery = () => {
    const formatted = query
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*/g, ', ')
      .replace(/\bSELECT\b/gi, 'SELECT')
      .replace(/\bFROM\b/gi, '\nFROM')
      .replace(/\bWHERE\b/gi, '\nWHERE')
      .replace(/\bJOIN\b/gi, '\nJOIN')
      .replace(/\bLEFT JOIN\b/gi, '\nLEFT JOIN')
      .replace(/\bRIGHT JOIN\b/gi, '\nRIGHT JOIN')
      .replace(/\bINNER JOIN\b/gi, '\nINNER JOIN')
      .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
      .replace(/\bORDER BY\b/gi, '\nORDER BY')
      .replace(/\bHAVING\b/gi, '\nHAVING')
      .replace(/\bLIMIT\b/gi, '\nLIMIT')
      .trim();
    setQuery(formatted);
  };

  // Contar ejercicios completados
  const completedCount = exerciseProgress.filter(p => p.completed).length;
  const isExerciseCompleted = (id: number) => exerciseProgress.some(p => p.exerciseId === id && p.completed);

  // Formatear valor para mostrar
  const formatValue = (value: unknown): string => {
    if (value === null) return 'NULL';
    if (typeof value === 'number') {
      return value.toLocaleString('es-ES', { maximumFractionDigits: 2 });
    }
    return String(value);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🗃️ Playground SQL</h1>
        <p className={styles.subtitle}>
          Aprende SQL practicando en el navegador. Sin instalar nada, 100% privado.
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel izquierdo: Datasets y navegación */}
        <div className={styles.sidebar}>
          {/* Selector de dataset */}
          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>📦 Dataset</h3>
            <div className={styles.datasetSelector}>
              {DATASETS.map(dataset => (
                <button
                  key={dataset.id}
                  className={`${styles.datasetBtn} ${currentDataset.id === dataset.id ? styles.datasetActive : ''}`}
                  onClick={() => handleDatasetChange(dataset.id)}
                  disabled={isLoading}
                >
                  <span className={styles.datasetIcon}>{dataset.icon}</span>
                  <span className={styles.datasetName}>{dataset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'editor' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('editor')}
            >
              ✏️ Editor
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'exercises' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('exercises')}
            >
              📝 Ejercicios
              {completedCount > 0 && (
                <span className={styles.badge}>{completedCount}/{EXERCISES.length}</span>
              )}
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'schema' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('schema')}
            >
              📋 Esquema
            </button>
          </div>

          {/* Contenido del sidebar según tab */}
          {activeTab === 'editor' && (
            <div className={styles.sidebarSection}>
              <h3 className={styles.sidebarTitle}>💡 Consultas de ejemplo</h3>
              <div className={styles.sampleQueries}>
                {currentDataset.sampleQueries.map((sq, idx) => (
                  <button
                    key={idx}
                    className={styles.sampleQueryBtn}
                    onClick={() => loadSampleQuery(sq.query)}
                    title={sq.description}
                  >
                    {sq.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'exercises' && (
            <div className={styles.sidebarSection}>
              <h3 className={styles.sidebarTitle}>📚 Ejercicios guiados</h3>

              {['basico', 'intermedio', 'avanzado'].map(level => (
                <div key={level} className={styles.exerciseGroup}>
                  <h4 className={styles.exerciseLevel}>
                    {level === 'basico' && '🟢 Básico'}
                    {level === 'intermedio' && '🟡 Intermedio'}
                    {level === 'avanzado' && '🔴 Avanzado'}
                  </h4>
                  {EXERCISES.filter(e => e.difficulty === level).map(exercise => (
                    <button
                      key={exercise.id}
                      className={`${styles.exerciseBtn} ${selectedExercise?.id === exercise.id ? styles.exerciseActive : ''} ${isExerciseCompleted(exercise.id) ? styles.exerciseCompleted : ''}`}
                      onClick={() => handleExerciseSelect(exercise)}
                    >
                      <span className={styles.exerciseCheck}>
                        {isExerciseCompleted(exercise.id) ? '✅' : '○'}
                      </span>
                      <span className={styles.exerciseTitle}>{exercise.title}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'schema' && (
            <div className={styles.sidebarSection}>
              <h3 className={styles.sidebarTitle}>📊 Tablas en {currentDataset.name}</h3>
              {currentDataset.tables.map(table => (
                <div key={table.name} className={styles.schemaTable}>
                  <h4 className={styles.schemaTableName}>
                    📋 {table.name}
                    <span className={styles.schemaRowCount}>({table.data.length} filas)</span>
                  </h4>
                  <ul className={styles.schemaColumns}>
                    {table.columns.map(col => (
                      <li key={col.name} className={styles.schemaColumn}>
                        {col.primaryKey && '🔑 '}
                        {col.foreignKey && '🔗 '}
                        <span className={styles.schemaColName}>{col.name}</span>
                        <span className={styles.schemaColType}>{col.type}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel principal: Editor y resultados */}
        <div className={styles.mainPanel}>
          {/* Ejercicio seleccionado */}
          {selectedExercise && (
            <div className={styles.exerciseCard}>
              <div className={styles.exerciseHeader}>
                <span className={`${styles.difficultyBadge} ${styles[selectedExercise.difficulty]}`}>
                  {selectedExercise.difficulty}
                </span>
                <h3>{selectedExercise.title}</h3>
              </div>
              <p className={styles.exerciseDesc}>{selectedExercise.description}</p>
              <details className={styles.hintDetails}>
                <summary>💡 Ver pista</summary>
                <p>{selectedExercise.hint}</p>
              </details>
            </div>
          )}

          {/* Editor SQL */}
          <div className={styles.editorSection}>
            <div className={styles.editorHeader}>
              <span>Editor SQL</span>
              <div className={styles.editorActions}>
                <button
                  className={styles.editorBtn}
                  onClick={formatQuery}
                  title="Formatear consulta"
                >
                  🎨 Formatear
                </button>
                <button
                  className={styles.editorBtn}
                  onClick={() => setQuery('')}
                  title="Limpiar"
                >
                  🗑️ Limpiar
                </button>
              </div>
            </div>
            <textarea
              ref={textareaRef}
              className={styles.editor}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escribe tu consulta SQL aquí..."
              spellCheck={false}
            />
            <div className={styles.editorFooter}>
              <span className={styles.shortcutHint}>
                Ctrl + Enter para ejecutar
              </span>
              <button
                className={styles.executeBtn}
                onClick={executeQuery}
                disabled={isLoading || !query.trim()}
              >
                {isLoading ? '⏳ Cargando...' : '▶️ Ejecutar'}
              </button>
            </div>
          </div>

          {/* Mensaje de éxito */}
          {showSuccess && (
            <div className={styles.successMessage}>
              🎉 ¡Correcto! Has completado el ejercicio.
            </div>
          )}

          {/* Resultados */}
          <div className={styles.resultsSection}>
            <div className={styles.resultsHeader}>
              <span>Resultados</span>
              {result && !result.error && (
                <span className={styles.resultsMeta}>
                  {result.rowCount} {result.rowCount === 1 ? 'fila' : 'filas'} · {result.executionTime.toFixed(2)}ms
                </span>
              )}
            </div>

            {!result && !isLoading && (
              <div className={styles.resultsEmpty}>
                <p>Ejecuta una consulta para ver los resultados aquí.</p>
              </div>
            )}

            {isLoading && (
              <div className={styles.resultsLoading}>
                <p>⏳ Cargando base de datos...</p>
              </div>
            )}

            {result?.error && (
              <div className={styles.resultsError}>
                <p>❌ Error: {result.error}</p>
              </div>
            )}

            {result && !result.error && result.columns.length > 0 && (
              <div className={styles.resultsTable}>
                <table>
                  <thead>
                    <tr>
                      {result.columns.map((col, idx) => (
                        <th key={idx}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.values.slice(0, 100).map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        {row.map((value, colIdx) => (
                          <td key={colIdx}>{formatValue(value)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {result.values.length > 100 && (
                  <p className={styles.resultsNote}>
                    Mostrando 100 de {result.values.length} filas
                  </p>
                )}
              </div>
            )}

            {result && !result.error && result.columns.length === 0 && (
              <div className={styles.resultsEmpty}>
                <p>✅ Consulta ejecutada correctamente (sin resultados para mostrar).</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <LastUpdated lastUpdate="2 de febrero de 2026" />

      <DisclaimerCard variant="educational" severity="low" collapsible={true} context="playground-sql">
        <p>Este playground es una <strong>herramienta educativa</strong> para aprender SQL en el navegador:</p>
        <ul className={styles.disclaimerList}>
          <li><strong>Verifica sintaxis en proyectos reales</strong>: Los dialectos SQL varían (PostgreSQL, MySQL, SQL Server), consulta la documentación oficial</li>
          <li><strong>No uses datos sensibles</strong>: Todo se ejecuta localmente en tu navegador, pero evita copiar datos confidenciales</li>
        </ul>
      </DisclaimerCard>

      {/* Sección educativa */}
      <EducationalSection
        title="📚 ¿Quieres aprender más sobre SQL?"
        subtitle="Conceptos clave y referencia rápida"
      >
        <section className={styles.guideSection}>
          <h2>Comandos SQL Básicos</h2>
          <p className={styles.introParagraph}>
            SQL (Structured Query Language) es el lenguaje estándar para consultar y manipular bases de datos relacionales.
            Aquí tienes una referencia rápida de los comandos más utilizados.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>SELECT - Consultar datos</h4>
              <pre className={styles.codeBlock}>
{`SELECT columna1, columna2
FROM tabla
WHERE condicion
ORDER BY columna
LIMIT n;`}
              </pre>
            </div>

            <div className={styles.contentCard}>
              <h4>JOIN - Unir tablas</h4>
              <pre className={styles.codeBlock}>
{`SELECT a.*, b.columna
FROM tabla_a a
JOIN tabla_b b
  ON a.id = b.tabla_a_id;`}
              </pre>
            </div>

            <div className={styles.contentCard}>
              <h4>GROUP BY - Agrupar</h4>
              <pre className={styles.codeBlock}>
{`SELECT categoria, COUNT(*)
FROM productos
GROUP BY categoria
HAVING COUNT(*) > 5;`}
              </pre>
            </div>

            <div className={styles.contentCard}>
              <h4>Funciones de agregación</h4>
              <pre className={styles.codeBlock}>
{`COUNT(*) - Contar filas
SUM(col) - Sumar valores
AVG(col) - Promedio
MIN(col) - Mínimo
MAX(col) - Máximo`}
              </pre>
            </div>

            <div className={styles.contentCard}>
              <h4>Operadores WHERE</h4>
              <pre className={styles.codeBlock}>
{`=, !=, <, >, <=, >=
AND, OR, NOT
BETWEEN x AND y
IN (valor1, valor2)
LIKE 'patron%'
IS NULL, IS NOT NULL`}
              </pre>
            </div>

            <div className={styles.contentCard}>
              <h4>Subconsultas</h4>
              <pre className={styles.codeBlock}>
{`SELECT *
FROM productos
WHERE precio > (
  SELECT AVG(precio)
  FROM productos
);`}
              </pre>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Tipos de JOIN</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>INNER JOIN</h4>
              <p>Devuelve solo las filas que tienen coincidencia en ambas tablas.</p>
            </div>
            <div className={styles.contentCard}>
              <h4>LEFT JOIN</h4>
              <p>Devuelve todas las filas de la tabla izquierda y las coincidencias de la derecha (NULL si no hay).</p>
            </div>
            <div className={styles.contentCard}>
              <h4>RIGHT JOIN</h4>
              <p>Devuelve todas las filas de la tabla derecha y las coincidencias de la izquierda.</p>
            </div>
            <div className={styles.contentCard}>
              <h4>FULL OUTER JOIN</h4>
              <p>Devuelve todas las filas de ambas tablas, con NULL donde no hay coincidencia.</p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('playground-sql')} />
      <Footer appName="playground-sql" />
    </div>
  );
}
