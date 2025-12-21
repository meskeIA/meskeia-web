import { Exercise } from './types';

export const EXERCISES: Exercise[] = [
  // ============================================
  // NIVEL BÁSICO
  // ============================================
  {
    id: 1,
    title: 'Tu primera consulta SELECT',
    difficulty: 'basico',
    description: 'Selecciona todas las columnas de la tabla "productos". Usa SELECT * para obtener todos los campos.',
    hint: 'La sintaxis es: SELECT * FROM nombre_tabla;',
    expectedQuery: 'SELECT * FROM productos',
    expectedColumns: ['id', 'nombre', 'precio', 'stock', 'categoria_id'],
    dataset: 'tienda',
  },
  {
    id: 2,
    title: 'Seleccionar columnas específicas',
    difficulty: 'basico',
    description: 'Selecciona solo el nombre y precio de todos los productos.',
    hint: 'Especifica las columnas separadas por comas: SELECT columna1, columna2 FROM tabla;',
    expectedQuery: 'SELECT nombre, precio FROM productos',
    expectedColumns: ['nombre', 'precio'],
    dataset: 'tienda',
  },
  {
    id: 3,
    title: 'Filtrar con WHERE',
    difficulty: 'basico',
    description: 'Encuentra todos los productos que cuestan más de 100€.',
    hint: 'Usa WHERE para filtrar: SELECT * FROM tabla WHERE condicion;',
    expectedQuery: 'SELECT * FROM productos WHERE precio > 100',
    expectedColumns: ['id', 'nombre', 'precio', 'stock', 'categoria_id'],
    dataset: 'tienda',
  },
  {
    id: 4,
    title: 'Ordenar resultados',
    difficulty: 'basico',
    description: 'Muestra todos los productos ordenados por precio de mayor a menor.',
    hint: 'Usa ORDER BY columna DESC para orden descendente.',
    expectedQuery: 'SELECT * FROM productos ORDER BY precio DESC',
    expectedColumns: ['id', 'nombre', 'precio', 'stock', 'categoria_id'],
    dataset: 'tienda',
  },
  {
    id: 5,
    title: 'Limitar resultados',
    difficulty: 'basico',
    description: 'Muestra solo los 5 productos más caros.',
    hint: 'Combina ORDER BY con LIMIT para obtener los primeros N resultados.',
    expectedQuery: 'SELECT * FROM productos ORDER BY precio DESC LIMIT 5',
    expectedColumns: ['id', 'nombre', 'precio', 'stock', 'categoria_id'],
    expectedRowCount: 5,
    dataset: 'tienda',
  },

  // ============================================
  // NIVEL INTERMEDIO
  // ============================================
  {
    id: 6,
    title: 'Filtros múltiples con AND',
    difficulty: 'intermedio',
    description: 'Encuentra productos de la categoría 1 (Electrónica) que cuesten más de 500€.',
    hint: 'Combina condiciones con AND: WHERE condicion1 AND condicion2',
    expectedQuery: 'SELECT * FROM productos WHERE categoria_id = 1 AND precio > 500',
    expectedColumns: ['id', 'nombre', 'precio', 'stock', 'categoria_id'],
    dataset: 'tienda',
  },
  {
    id: 7,
    title: 'Búsqueda con LIKE',
    difficulty: 'intermedio',
    description: 'Busca todos los clientes cuyo nombre empiece por "M".',
    hint: 'Usa LIKE con el patrón: WHERE nombre LIKE "M%"',
    expectedQuery: "SELECT * FROM clientes WHERE nombre LIKE 'M%'",
    expectedColumns: ['id', 'nombre', 'email', 'ciudad', 'fecha_registro'],
    dataset: 'tienda',
  },
  {
    id: 8,
    title: 'Contar registros con COUNT',
    difficulty: 'intermedio',
    description: 'Cuenta cuántos productos hay en la tienda.',
    hint: 'Usa la función COUNT(*) para contar filas.',
    expectedQuery: 'SELECT COUNT(*) FROM productos',
    expectedColumns: ['COUNT(*)'],
    expectedRowCount: 1,
    dataset: 'tienda',
  },
  {
    id: 9,
    title: 'Tu primer JOIN',
    difficulty: 'intermedio',
    description: 'Muestra el nombre de cada producto junto con el nombre de su categoría.',
    hint: 'Une las tablas productos y categorias con JOIN usando la clave foránea categoria_id.',
    expectedQuery: 'SELECT p.nombre, c.nombre FROM productos p JOIN categorias c ON p.categoria_id = c.id',
    expectedColumns: ['nombre', 'nombre'],
    dataset: 'tienda',
  },
  {
    id: 10,
    title: 'Agrupar con GROUP BY',
    difficulty: 'intermedio',
    description: 'Cuenta cuántos productos hay en cada categoría.',
    hint: 'Usa GROUP BY para agrupar y COUNT para contar.',
    expectedQuery: 'SELECT categoria_id, COUNT(*) FROM productos GROUP BY categoria_id',
    expectedColumns: ['categoria_id', 'COUNT(*)'],
    dataset: 'tienda',
  },

  // ============================================
  // NIVEL AVANZADO
  // ============================================
  {
    id: 11,
    title: 'JOIN con agregación',
    difficulty: 'avanzado',
    description: 'Muestra cada categoría con el número de productos y el precio medio de sus productos.',
    hint: 'Combina JOIN, GROUP BY, COUNT y AVG.',
    expectedQuery: 'SELECT c.nombre, COUNT(p.id), AVG(p.precio) FROM categorias c LEFT JOIN productos p ON c.id = p.categoria_id GROUP BY c.id',
    expectedColumns: ['nombre', 'COUNT(p.id)', 'AVG(p.precio)'],
    dataset: 'tienda',
  },
  {
    id: 12,
    title: 'Filtrar grupos con HAVING',
    difficulty: 'avanzado',
    description: 'Muestra las ciudades que tienen más de 1 cliente.',
    hint: 'Usa HAVING después de GROUP BY para filtrar grupos.',
    expectedQuery: 'SELECT ciudad, COUNT(*) FROM clientes GROUP BY ciudad HAVING COUNT(*) > 1',
    expectedColumns: ['ciudad', 'COUNT(*)'],
    dataset: 'tienda',
  },
  {
    id: 13,
    title: 'Subconsulta básica',
    difficulty: 'avanzado',
    description: 'Encuentra los productos cuyo precio está por encima de la media.',
    hint: 'Usa una subconsulta para calcular el precio medio: WHERE precio > (SELECT AVG(precio) FROM productos)',
    expectedQuery: 'SELECT * FROM productos WHERE precio > (SELECT AVG(precio) FROM productos)',
    expectedColumns: ['id', 'nombre', 'precio', 'stock', 'categoria_id'],
    dataset: 'tienda',
  },
  {
    id: 14,
    title: 'Media de notas por estudiante',
    difficulty: 'avanzado',
    description: 'Calcula la nota media de cada estudiante ordenada de mayor a menor.',
    hint: 'Une estudiantes con matriculas, agrupa por estudiante y calcula AVG(nota).',
    expectedQuery: 'SELECT e.nombre, AVG(m.nota) FROM estudiantes e JOIN matriculas m ON e.id = m.estudiante_id GROUP BY e.id ORDER BY AVG(m.nota) DESC',
    expectedColumns: ['nombre', 'AVG(m.nota)'],
    dataset: 'universidad',
  },
  {
    id: 15,
    title: 'Self-JOIN: Empleados y jefes',
    difficulty: 'avanzado',
    description: 'Muestra cada empleado junto con el nombre de su jefe.',
    hint: 'Une la tabla empleados consigo misma: empleados e LEFT JOIN empleados j ON e.jefe_id = j.id',
    expectedQuery: 'SELECT e.nombre, j.nombre FROM empleados e LEFT JOIN empleados j ON e.jefe_id = j.id',
    expectedColumns: ['nombre', 'nombre'],
    dataset: 'empresa',
  },
];

export const getExercisesByDifficulty = (difficulty: 'basico' | 'intermedio' | 'avanzado'): Exercise[] => {
  return EXERCISES.filter(e => e.difficulty === difficulty);
};

export const getExerciseById = (id: number): Exercise | undefined => {
  return EXERCISES.find(e => e.id === id);
};

export const getExercisesByDataset = (datasetId: string): Exercise[] => {
  return EXERCISES.filter(e => e.dataset === datasetId);
};
