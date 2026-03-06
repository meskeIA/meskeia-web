'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './PlaygroundSQL.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
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

      <LegalNotice lastUpdated="2026-02-02" />

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
        {/* 1. Tabla comparativa de dialectos SQL */}
        <section className={styles.guideSection}>
          <h2>Dialectos SQL: Comparativa de los Principales Motores</h2>
          <p className={styles.introParagraph}>
            SQL es un estándar, pero cada motor de base de datos tiene sus propias particularidades. Esta tabla
            te ayuda a entender las diferencias clave para escribir código portable o adaptarte rápidamente
            al motor que uses en cada proyecto.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>SQLite</th>
                  <th>MySQL 8</th>
                  <th>PostgreSQL 16</th>
                  <th>SQL Server 2022</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Licencia</strong></td>
                  <td>Dominio público</td>
                  <td>GPL/Comercial</td>
                  <td>PostgreSQL (libre)</td>
                  <td>Propietario</td>
                </tr>
                <tr>
                  <td><strong>Instalación</strong></td>
                  <td>Sin servidor</td>
                  <td>Servidor dedicado</td>
                  <td>Servidor dedicado</td>
                  <td>Servidor dedicado</td>
                </tr>
                <tr>
                  <td><strong>Auto-increment</strong></td>
                  <td>INTEGER PRIMARY KEY</td>
                  <td>AUTO_INCREMENT</td>
                  <td>SERIAL / GENERATED</td>
                  <td>IDENTITY</td>
                </tr>
                <tr>
                  <td><strong>Tipo booleano</strong></td>
                  <td>INTEGER (0/1)</td>
                  <td>TINYINT(1) / BOOL</td>
                  <td>BOOLEAN nativo</td>
                  <td>BIT</td>
                </tr>
                <tr>
                  <td><strong>Concatenar strings</strong></td>
                  <td>||</td>
                  <td>CONCAT() o ||</td>
                  <td>|| o CONCAT()</td>
                  <td>+ o CONCAT()</td>
                </tr>
                <tr>
                  <td><strong>LIMIT/OFFSET</strong></td>
                  <td>LIMIT n OFFSET m</td>
                  <td>LIMIT n OFFSET m</td>
                  <td>LIMIT n OFFSET m</td>
                  <td>TOP n / FETCH NEXT</td>
                </tr>
                <tr>
                  <td><strong>JSON nativo</strong></td>
                  <td>Sí (básico)</td>
                  <td>Sí (JSON type)</td>
                  <td>Sí (JSONB avanzado)</td>
                  <td>Sí (JSON functions)</td>
                </tr>
                <tr>
                  <td><strong>Ideal para</strong></td>
                  <td>Aprendizaje, apps pequeñas</td>
                  <td>Web, WordPress, e-commerce</td>
                  <td>Sistemas complejos, BI</td>
                  <td>Empresas Microsoft</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Casos de uso prácticos */}
        <section className={styles.guideSection}>
          <h2>Casos de Uso Prácticos por Perfil Profesional</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👨‍💻</span>
                <strong>Desarrollador Backend</strong>
              </div>
              <p className={styles.escenarioExample}>
                Dominar JOINs para evitar N+1 queries. Un bucle que hace 1 query por fila = 1000 queries para 1000 filas.
                Un JOIN bien hecho = 1 query.
              </p>
              <pre className={styles.codeBlock}>{`SELECT u.nombre, COUNT(p.id)
FROM usuarios u
LEFT JOIN pedidos p
  ON u.id = p.usuario_id
GROUP BY u.id`}</pre>
              <span className={styles.escenarioTip}>Rendimiento crítico</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📊</span>
                <strong>Analista de Datos / BI</strong>
              </div>
              <p className={styles.escenarioExample}>
                GROUP BY + funciones de ventana (WINDOW FUNCTIONS) para KPIs. Reportes de cohortes, retención y LTV.
              </p>
              <pre className={styles.codeBlock}>{`ROW_NUMBER() OVER (
  PARTITION BY categoria
  ORDER BY ventas DESC
)`}</pre>
              <span className={styles.escenarioTip}>Ranking por categoría</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🗄️</span>
                <strong>DBA (Database Administrator)</strong>
              </div>
              <p className={styles.escenarioExample}>
                Optimización con índices. EXPLAIN ANALYZE en PostgreSQL o EXPLAIN en MySQL para ver el plan de ejecución.
                Un índice reduce de O(n×m) a O(log n).
              </p>
              <pre className={styles.codeBlock}>{`EXPLAIN ANALYZE
SELECT * FROM pedidos
WHERE cliente_id = 42;`}</pre>
              <span className={styles.escenarioTip}>Plan de ejecución</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎓</span>
                <strong>Estudiante de Informática</strong>
              </div>
              <p className={styles.escenarioExample}>
                Modelado entidad-relación. Normalización (1FN, 2FN, 3FN). Transacciones ACID. SQL es obligatorio
                en casi todos los currículos de CS e Ingeniería Informática.
              </p>
              <span className={styles.escenarioTip}>Base imprescindible</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🛒</span>
                <strong>E-commerce y aplicaciones web</strong>
              </div>
              <p className={styles.escenarioExample}>
                Consultas de inventario, pedidos y clientes. Calcular totales con JOINs y HAVING para filtrar resultados.
              </p>
              <pre className={styles.codeBlock}>{`SELECT p.nombre,
  SUM(dp.cantidad * dp.precio) AS total
FROM pedidos o
JOIN detalle_pedido dp
  ON o.id = dp.pedido_id
GROUP BY o.id
HAVING total > 100`}</pre>
              <span className={styles.escenarioTip}>Pedidos y facturación</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🔐</span>
                <strong>Seguridad y auditoría</strong>
              </div>
              <p className={styles.escenarioExample}>
                Logs de acceso y detección de anomalías. Detectar ataques de fuerza bruta con GROUP BY + HAVING.
              </p>
              <pre className={styles.codeBlock}>{`SELECT usuario_id, COUNT(*)
FROM logs_acceso
WHERE fecha > NOW() - INTERVAL '1 hour'
GROUP BY usuario_id
HAVING COUNT(*) > 100`}</pre>
              <span className={styles.escenarioTip}>Detección de ataques</span>
            </div>
          </div>
        </section>

        {/* 3. FAQ ampliado */}
        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes sobre SQL</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cuál es la diferencia entre WHERE y HAVING?</h4>
              <p>WHERE filtra filas ANTES de agrupar (afecta a datos originales). HAVING filtra grupos DESPUÉS de GROUP BY.
              Ejemplo: <code>WHERE precio &gt; 10</code> filtra productos antes de contar; <code>HAVING COUNT(*) &gt; 5</code> filtra categorías que tienen más de 5 productos.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cuándo usar INNER JOIN vs LEFT JOIN?</h4>
              <p>INNER JOIN devuelve solo filas con coincidencia en ambas tablas (descarta filas sin match). LEFT JOIN devuelve todas
              las filas de la tabla izquierda más coincidencias (NULL donde no hay match). Regla práctica: usa LEFT JOIN cuando
              quieras &quot;todos los X con sus Y opcionales&quot;.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué es una subconsulta y cuándo es mejor que un JOIN?</h4>
              <p>Una subconsulta es un SELECT dentro de otro SELECT. Es mejor para: filtrar con condiciones complejas, verificar
              existencia (EXISTS) o cuando el resultado es escalar. Un JOIN es más eficiente cuando necesitas columnas de ambas
              tablas y el optimizador puede usar índices.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Por qué mi consulta GROUP BY da error con columnas no agrupadas?</h4>
              <p>SQL estándar no permite SELECT de columnas que no estén en GROUP BY ni en funciones de agregación. MySQL en
              modo permisivo lo permite (elige valor arbitrario). PostgreSQL y SQLite son estrictos. Solución: añadir la columna
              al GROUP BY o usar <code>MAX(columna)</code>.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cómo funciona el índice y cuándo crearlo?</h4>
              <p>El índice es como el índice de un libro: evita leer toda la tabla. Créalo en: columnas usadas en WHERE frecuentemente,
              columnas de JOIN (claves foráneas) y columnas de ORDER BY con muchas filas. No lo crees en: tablas pequeñas,
              columnas con pocos valores distintos (booleanos) o columnas que se actualizan constantemente.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué diferencia hay entre DELETE, TRUNCATE y DROP?</h4>
              <p>DELETE elimina filas con WHERE, activa triggers y es más lento. TRUNCATE elimina TODAS las filas, es más rápido,
              sin triggers y no disponible en SQLite básico. DROP elimina la tabla completa con su estructura. DELETE es reversible
              en transacción; TRUNCATE/DROP pueden no serlo.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Para qué sirven las transacciones?</h4>
              <p>Garantizan ACID: Atomicidad (todo o nada), Consistencia, Aislamiento y Durabilidad. Ejemplo: en una transferencia
              bancaria, debitar cuenta A y acreditar cuenta B deben ocurrir juntos o ninguna.
              <code>BEGIN; UPDATE ...; UPDATE ...; COMMIT;</code></p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cómo evitar la inyección SQL?</h4>
              <p>NUNCA concatenar strings del usuario en queries. Usa prepared statements/parameterized queries:
              <code>SELECT * FROM usuarios WHERE email = ?</code> con el valor como parámetro separado. En ORMs (Sequelize,
              Hibernate) esto es automático. En SQL puro: siempre usa placeholders.</p>
            </div>
          </div>
        </section>

        {/* 4. Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Guía Paso a Paso: Diseñar una Consulta SQL Compleja</h2>
          <div className={styles.stepGuide}>
            <div className={styles.eduStep}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Define el resultado que necesitas</strong>
                <p>&quot;Quiero el top 5 de clientes con más gasto en el último mes&quot;. Escríbelo en palabras antes de escribir código.</p>
              </div>
            </div>
            <div className={styles.eduStep}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Identifica las tablas necesarias</strong>
                <p>Clientes, pedidos, detalle_pedido. Dibuja las relaciones o consulta el tab Esquema de este playground para visualizarlas.</p>
              </div>
            </div>
            <div className={styles.eduStep}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Escribe los JOINs</strong>
                <p>Conecta las tablas por sus claves foráneas. Empieza por la tabla principal y añade JOINs uno a uno hasta completar el grafo de relaciones.</p>
              </div>
            </div>
            <div className={styles.eduStep}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Añade los filtros WHERE</strong>
                <p>Solo las filas del último mes: <code>WHERE fecha_pedido &gt;= DATE(&apos;now&apos;, &apos;-30 days&apos;)</code></p>
              </div>
            </div>
            <div className={styles.eduStep}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Agrupa y calcula</strong>
                <p><code>GROUP BY cliente_id</code> + <code>SUM(cantidad * precio_unitario) AS total_gastado</code></p>
              </div>
            </div>
            <div className={styles.eduStep}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <strong>Ordena y limita</strong>
                <p><code>ORDER BY total_gastado DESC LIMIT 5</code></p>
              </div>
            </div>
            <div className={styles.eduStep}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <strong>Verifica con datos reales</strong>
                <p>Comprueba que el resultado tiene sentido. Prueba con LIMIT 1 primero para ver la estructura antes de expandir.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Mejores prácticas */}
        <section className={styles.guideSection}>
          <h2>Mejores Prácticas SQL</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <strong>Usa alias descriptivos</strong>
              <p><code>SELECT u.nombre AS cliente, COUNT(p.id) AS num_pedidos</code> mejora la legibilidad enormemente.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <strong>Especifica columnas en SELECT</strong>
              <p>Evita <code>SELECT *</code> en producción. Lista las columnas que necesitas, reduces datos transferidos y evitas errores si se añaden columnas nuevas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <strong>Índices en claves foráneas</strong>
              <p>Siempre crea índice en columnas usadas en JOINs. MySQL no lo hace automático (PostgreSQL sí en PKs). <code>CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id)</code></p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <strong>Usa LIMIT al explorar</strong>
              <p>Antes de ejecutar una query en tabla grande, añade <code>LIMIT 10</code>. Evita bloqueos y resultados interminables.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <strong>Comenta consultas complejas</strong>
              <p><code>-- Clientes activos con más de 5 pedidos en el último trimestre</code>. Los comentarios SQL sobreviven en logs y ayudan al siguiente desarrollador.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <strong>Prueba con EXPLAIN</strong>
              <p>En PostgreSQL: <code>EXPLAIN ANALYZE tu_query</code>. En MySQL: <code>EXPLAIN tu_query</code>. Muestra si usa índices o hace full table scan.</p>
            </div>
          </div>
        </section>

        {/* 6. Warning box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Errores SQL que Causan Problemas en Producción</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>SQL injection por concatenar strings:</strong> <code>{`"SELECT * FROM usuarios WHERE nombre = '" + input + "'"`}</code> permite destruir la base de datos. Usa prepared statements SIEMPRE.</li>
            <li><strong>DELETE sin WHERE:</strong> <code>DELETE FROM productos</code> elimina TODOS los productos. Siempre verifica con SELECT antes de DELETE. Haz backup en producción.</li>
            <li><strong>N+1 queries en bucles:</strong> Un bucle que ejecuta 1 query por iteración = 1000 queries para 1000 filas. Usa JOIN o consulta todo de una vez.</li>
            <li><strong>SELECT * en producción:</strong> Transfiere columnas innecesarias, rompe el código si se renombran columnas e impide optimizaciones del motor.</li>
            <li><strong>Olvidar índices en claves foráneas:</strong> Un JOIN sin índice = full table scan = segundos en vez de milisegundos para tablas grandes.</li>
            <li><strong>Transacciones sin COMMIT/ROLLBACK:</strong> Una transacción abierta bloquea filas. En producción puede paralizar la aplicación entera.</li>
          </ul>
        </div>

        {/* 7. Contenido original: Comandos SQL Básicos */}
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
      <ShareCard appName="playground-sql" />
      <Footer appName="playground-sql" />
    </div>
  );
}
