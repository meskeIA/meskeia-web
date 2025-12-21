// Tipos para el Playground SQL

export interface Dataset {
  id: string;
  name: string;
  icon: string;
  description: string;
  tables: TableDefinition[];
  sampleQueries: SampleQuery[];
}

export interface TableDefinition {
  name: string;
  columns: ColumnDefinition[];
  data: Record<string, unknown>[];
}

export interface ColumnDefinition {
  name: string;
  type: 'INTEGER' | 'TEXT' | 'REAL' | 'DATE';
  primaryKey?: boolean;
  foreignKey?: {
    table: string;
    column: string;
  };
}

export interface SampleQuery {
  name: string;
  query: string;
  description: string;
}

export interface Exercise {
  id: number;
  title: string;
  difficulty: 'basico' | 'intermedio' | 'avanzado';
  description: string;
  hint: string;
  expectedQuery: string; // Para validar (simplificado)
  expectedColumns: string[]; // Columnas que debe tener el resultado
  expectedRowCount?: number; // Número esperado de filas (opcional)
  dataset: string; // ID del dataset a usar
}

export interface QueryResult {
  columns: string[];
  values: unknown[][];
  rowCount: number;
  executionTime: number;
  error?: string;
}

export interface ExerciseProgress {
  exerciseId: number;
  completed: boolean;
  userQuery?: string;
  completedAt?: string;
}

export type EditorTheme = 'light' | 'dark';

export interface PlaygroundState {
  currentDataset: string;
  currentQuery: string;
  queryResult: QueryResult | null;
  isExecuting: boolean;
  activeTab: 'editor' | 'exercises' | 'schema';
  exerciseProgress: ExerciseProgress[];
  selectedExercise: Exercise | null;
}
