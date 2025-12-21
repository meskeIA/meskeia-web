import { Dataset } from './types';

// ============================================
// DATASET 1: TIENDA ONLINE
// ============================================
export const tiendaDataset: Dataset = {
  id: 'tienda',
  name: 'Tienda Online',
  icon: '🛒',
  description: 'Base de datos de una tienda online con productos, clientes y pedidos',
  tables: [
    {
      name: 'categorias',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true },
        { name: 'nombre', type: 'TEXT' },
        { name: 'descripcion', type: 'TEXT' },
      ],
      data: [
        { id: 1, nombre: 'Electrónica', descripcion: 'Dispositivos electrónicos y gadgets' },
        { id: 2, nombre: 'Ropa', descripcion: 'Moda y complementos' },
        { id: 3, nombre: 'Hogar', descripcion: 'Artículos para el hogar' },
        { id: 4, nombre: 'Deportes', descripcion: 'Equipamiento deportivo' },
        { id: 5, nombre: 'Libros', descripcion: 'Libros y publicaciones' },
      ],
    },
    {
      name: 'productos',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true },
        { name: 'nombre', type: 'TEXT' },
        { name: 'precio', type: 'REAL' },
        { name: 'stock', type: 'INTEGER' },
        { name: 'categoria_id', type: 'INTEGER', foreignKey: { table: 'categorias', column: 'id' } },
      ],
      data: [
        { id: 1, nombre: 'iPhone 15 Pro', precio: 1319.00, stock: 25, categoria_id: 1 },
        { id: 2, nombre: 'MacBook Air M3', precio: 1299.00, stock: 15, categoria_id: 1 },
        { id: 3, nombre: 'AirPods Pro', precio: 279.00, stock: 50, categoria_id: 1 },
        { id: 4, nombre: 'Camiseta Básica', precio: 19.99, stock: 100, categoria_id: 2 },
        { id: 5, nombre: 'Pantalón Vaquero', precio: 49.99, stock: 75, categoria_id: 2 },
        { id: 6, nombre: 'Zapatillas Running', precio: 89.99, stock: 40, categoria_id: 4 },
        { id: 7, nombre: 'Lámpara LED', precio: 34.99, stock: 60, categoria_id: 3 },
        { id: 8, nombre: 'Silla Ergonómica', precio: 199.99, stock: 20, categoria_id: 3 },
        { id: 9, nombre: 'El Quijote', precio: 12.99, stock: 80, categoria_id: 5 },
        { id: 10, nombre: 'Balón Fútbol', precio: 29.99, stock: 45, categoria_id: 4 },
        { id: 11, nombre: 'Samsung Galaxy S24', precio: 899.00, stock: 30, categoria_id: 1 },
        { id: 12, nombre: 'Sudadera Capucha', precio: 39.99, stock: 55, categoria_id: 2 },
      ],
    },
    {
      name: 'clientes',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true },
        { name: 'nombre', type: 'TEXT' },
        { name: 'email', type: 'TEXT' },
        { name: 'ciudad', type: 'TEXT' },
        { name: 'fecha_registro', type: 'DATE' },
      ],
      data: [
        { id: 1, nombre: 'María García', email: 'maria@email.com', ciudad: 'Madrid', fecha_registro: '2023-01-15' },
        { id: 2, nombre: 'Carlos López', email: 'carlos@email.com', ciudad: 'Barcelona', fecha_registro: '2023-02-20' },
        { id: 3, nombre: 'Ana Martínez', email: 'ana@email.com', ciudad: 'Valencia', fecha_registro: '2023-03-10' },
        { id: 4, nombre: 'Pedro Sánchez', email: 'pedro@email.com', ciudad: 'Sevilla', fecha_registro: '2023-04-05' },
        { id: 5, nombre: 'Laura Fernández', email: 'laura@email.com', ciudad: 'Madrid', fecha_registro: '2023-05-12' },
        { id: 6, nombre: 'Javier Ruiz', email: 'javier@email.com', ciudad: 'Bilbao', fecha_registro: '2023-06-18' },
        { id: 7, nombre: 'Carmen Torres', email: 'carmen@email.com', ciudad: 'Barcelona', fecha_registro: '2023-07-22' },
        { id: 8, nombre: 'Miguel Díaz', email: 'miguel@email.com', ciudad: 'Zaragoza', fecha_registro: '2023-08-30' },
      ],
    },
    {
      name: 'pedidos',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true },
        { name: 'cliente_id', type: 'INTEGER', foreignKey: { table: 'clientes', column: 'id' } },
        { name: 'fecha', type: 'DATE' },
        { name: 'total', type: 'REAL' },
        { name: 'estado', type: 'TEXT' },
      ],
      data: [
        { id: 1, cliente_id: 1, fecha: '2024-01-10', total: 1598.00, estado: 'Entregado' },
        { id: 2, cliente_id: 2, fecha: '2024-01-15', total: 279.00, estado: 'Entregado' },
        { id: 3, cliente_id: 3, fecha: '2024-01-20', total: 69.98, estado: 'Enviado' },
        { id: 4, cliente_id: 1, fecha: '2024-02-01', total: 1299.00, estado: 'Entregado' },
        { id: 5, cliente_id: 4, fecha: '2024-02-10', total: 119.98, estado: 'Entregado' },
        { id: 6, cliente_id: 5, fecha: '2024-02-15', total: 899.00, estado: 'Enviado' },
        { id: 7, cliente_id: 6, fecha: '2024-02-20', total: 234.98, estado: 'Pendiente' },
        { id: 8, cliente_id: 7, fecha: '2024-03-01', total: 1319.00, estado: 'Entregado' },
        { id: 9, cliente_id: 2, fecha: '2024-03-05', total: 59.98, estado: 'Enviado' },
        { id: 10, cliente_id: 8, fecha: '2024-03-10', total: 199.99, estado: 'Pendiente' },
      ],
    },
    {
      name: 'detalle_pedidos',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true },
        { name: 'pedido_id', type: 'INTEGER', foreignKey: { table: 'pedidos', column: 'id' } },
        { name: 'producto_id', type: 'INTEGER', foreignKey: { table: 'productos', column: 'id' } },
        { name: 'cantidad', type: 'INTEGER' },
        { name: 'precio_unitario', type: 'REAL' },
      ],
      data: [
        { id: 1, pedido_id: 1, producto_id: 1, cantidad: 1, precio_unitario: 1319.00 },
        { id: 2, pedido_id: 1, producto_id: 3, cantidad: 1, precio_unitario: 279.00 },
        { id: 3, pedido_id: 2, producto_id: 3, cantidad: 1, precio_unitario: 279.00 },
        { id: 4, pedido_id: 3, producto_id: 4, cantidad: 2, precio_unitario: 19.99 },
        { id: 5, pedido_id: 3, producto_id: 10, cantidad: 1, precio_unitario: 29.99 },
        { id: 6, pedido_id: 4, producto_id: 2, cantidad: 1, precio_unitario: 1299.00 },
        { id: 7, pedido_id: 5, producto_id: 6, cantidad: 1, precio_unitario: 89.99 },
        { id: 8, pedido_id: 5, producto_id: 10, cantidad: 1, precio_unitario: 29.99 },
        { id: 9, pedido_id: 6, producto_id: 11, cantidad: 1, precio_unitario: 899.00 },
        { id: 10, pedido_id: 7, producto_id: 8, cantidad: 1, precio_unitario: 199.99 },
        { id: 11, pedido_id: 7, producto_id: 7, cantidad: 1, precio_unitario: 34.99 },
        { id: 12, pedido_id: 8, producto_id: 1, cantidad: 1, precio_unitario: 1319.00 },
        { id: 13, pedido_id: 9, producto_id: 4, cantidad: 2, precio_unitario: 19.99 },
        { id: 14, pedido_id: 9, producto_id: 12, cantidad: 1, precio_unitario: 39.99 },
        { id: 15, pedido_id: 10, producto_id: 8, cantidad: 1, precio_unitario: 199.99 },
      ],
    },
  ],
  sampleQueries: [
    {
      name: 'Todos los productos',
      query: 'SELECT * FROM productos;',
      description: 'Muestra todos los productos de la tienda',
    },
    {
      name: 'Productos caros',
      query: 'SELECT nombre, precio FROM productos WHERE precio > 100 ORDER BY precio DESC;',
      description: 'Productos con precio mayor a 100€',
    },
    {
      name: 'Productos por categoría',
      query: `SELECT p.nombre, p.precio, c.nombre as categoria
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
ORDER BY c.nombre, p.precio;`,
      description: 'Lista productos con su categoría usando JOIN',
    },
    {
      name: 'Total por cliente',
      query: `SELECT cl.nombre, COUNT(p.id) as num_pedidos, SUM(p.total) as total_gastado
FROM clientes cl
LEFT JOIN pedidos p ON cl.id = p.cliente_id
GROUP BY cl.id, cl.nombre
ORDER BY total_gastado DESC;`,
      description: 'Resumen de compras por cliente',
    },
  ],
};

// ============================================
// DATASET 2: UNIVERSIDAD
// ============================================
export const universidadDataset: Dataset = {
  id: 'universidad',
  name: 'Universidad',
  icon: '🎓',
  description: 'Base de datos universitaria con estudiantes, asignaturas y calificaciones',
  tables: [
    {
      name: 'departamentos',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true },
        { name: 'nombre', type: 'TEXT' },
        { name: 'edificio', type: 'TEXT' },
      ],
      data: [
        { id: 1, nombre: 'Informática', edificio: 'Edificio A' },
        { id: 2, nombre: 'Matemáticas', edificio: 'Edificio B' },
        { id: 3, nombre: 'Física', edificio: 'Edificio B' },
        { id: 4, nombre: 'Historia', edificio: 'Edificio C' },
        { id: 5, nombre: 'Economía', edificio: 'Edificio D' },
      ],
    },
    {
      name: 'profesores',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true },
        { name: 'nombre', type: 'TEXT' },
        { name: 'departamento_id', type: 'INTEGER', foreignKey: { table: 'departamentos', column: 'id' } },
        { name: 'antiguedad', type: 'INTEGER' },
      ],
      data: [
        { id: 1, nombre: 'Dr. Álvarez', departamento_id: 1, antiguedad: 15 },
        { id: 2, nombre: 'Dra. Benítez', departamento_id: 2, antiguedad: 10 },
        { id: 3, nombre: 'Dr. Castillo', departamento_id: 3, antiguedad: 8 },
        { id: 4, nombre: 'Dra. Delgado', departamento_id: 1, antiguedad: 5 },
        { id: 5, nombre: 'Dr. Espinosa', departamento_id: 4, antiguedad: 20 },
        { id: 6, nombre: 'Dra. Flores', departamento_id: 5, antiguedad: 12 },
      ],
    },
    {
      name: 'asignaturas',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true },
        { name: 'nombre', type: 'TEXT' },
        { name: 'creditos', type: 'INTEGER' },
        { name: 'departamento_id', type: 'INTEGER', foreignKey: { table: 'departamentos', column: 'id' } },
        { name: 'profesor_id', type: 'INTEGER', foreignKey: { table: 'profesores', column: 'id' } },
      ],
      data: [
        { id: 1, nombre: 'Programación I', creditos: 6, departamento_id: 1, profesor_id: 1 },
        { id: 2, nombre: 'Bases de Datos', creditos: 6, departamento_id: 1, profesor_id: 4 },
        { id: 3, nombre: 'Cálculo', creditos: 9, departamento_id: 2, profesor_id: 2 },
        { id: 4, nombre: 'Álgebra', creditos: 6, departamento_id: 2, profesor_id: 2 },
        { id: 5, nombre: 'Física General', creditos: 6, departamento_id: 3, profesor_id: 3 },
        { id: 6, nombre: 'Historia Contemporánea', creditos: 4, departamento_id: 4, profesor_id: 5 },
        { id: 7, nombre: 'Microeconomía', creditos: 6, departamento_id: 5, profesor_id: 6 },
        { id: 8, nombre: 'Estructuras de Datos', creditos: 6, departamento_id: 1, profesor_id: 1 },
      ],
    },
    {
      name: 'estudiantes',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true },
        { name: 'nombre', type: 'TEXT' },
        { name: 'email', type: 'TEXT' },
        { name: 'carrera', type: 'TEXT' },
        { name: 'año_ingreso', type: 'INTEGER' },
      ],
      data: [
        { id: 1, nombre: 'Sofía Ramírez', email: 'sofia@uni.edu', carrera: 'Informática', año_ingreso: 2022 },
        { id: 2, nombre: 'Diego Moreno', email: 'diego@uni.edu', carrera: 'Informática', año_ingreso: 2021 },
        { id: 3, nombre: 'Lucía Herrera', email: 'lucia@uni.edu', carrera: 'Matemáticas', año_ingreso: 2023 },
        { id: 4, nombre: 'Pablo Navarro', email: 'pablo@uni.edu', carrera: 'Física', año_ingreso: 2022 },
        { id: 5, nombre: 'Elena Vega', email: 'elena@uni.edu', carrera: 'Economía', año_ingreso: 2021 },
        { id: 6, nombre: 'Adrián Molina', email: 'adrian@uni.edu', carrera: 'Informática', año_ingreso: 2023 },
        { id: 7, nombre: 'Claudia Ortega', email: 'claudia@uni.edu', carrera: 'Historia', año_ingreso: 2022 },
        { id: 8, nombre: 'Martín Campos', email: 'martin@uni.edu', carrera: 'Matemáticas', año_ingreso: 2021 },
      ],
    },
    {
      name: 'matriculas',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true },
        { name: 'estudiante_id', type: 'INTEGER', foreignKey: { table: 'estudiantes', column: 'id' } },
        { name: 'asignatura_id', type: 'INTEGER', foreignKey: { table: 'asignaturas', column: 'id' } },
        { name: 'nota', type: 'REAL' },
        { name: 'convocatoria', type: 'TEXT' },
      ],
      data: [
        { id: 1, estudiante_id: 1, asignatura_id: 1, nota: 8.5, convocatoria: 'Ordinaria' },
        { id: 2, estudiante_id: 1, asignatura_id: 2, nota: 9.0, convocatoria: 'Ordinaria' },
        { id: 3, estudiante_id: 1, asignatura_id: 3, nota: 7.5, convocatoria: 'Ordinaria' },
        { id: 4, estudiante_id: 2, asignatura_id: 1, nota: 6.0, convocatoria: 'Ordinaria' },
        { id: 5, estudiante_id: 2, asignatura_id: 2, nota: 7.0, convocatoria: 'Ordinaria' },
        { id: 6, estudiante_id: 2, asignatura_id: 8, nota: 8.0, convocatoria: 'Ordinaria' },
        { id: 7, estudiante_id: 3, asignatura_id: 3, nota: 9.5, convocatoria: 'Ordinaria' },
        { id: 8, estudiante_id: 3, asignatura_id: 4, nota: 10.0, convocatoria: 'Ordinaria' },
        { id: 9, estudiante_id: 4, asignatura_id: 5, nota: 7.0, convocatoria: 'Ordinaria' },
        { id: 10, estudiante_id: 4, asignatura_id: 3, nota: 6.5, convocatoria: 'Ordinaria' },
        { id: 11, estudiante_id: 5, asignatura_id: 7, nota: 8.5, convocatoria: 'Ordinaria' },
        { id: 12, estudiante_id: 6, asignatura_id: 1, nota: 9.0, convocatoria: 'Ordinaria' },
        { id: 13, estudiante_id: 6, asignatura_id: 2, nota: 8.5, convocatoria: 'Ordinaria' },
        { id: 14, estudiante_id: 7, asignatura_id: 6, nota: 9.0, convocatoria: 'Ordinaria' },
        { id: 15, estudiante_id: 8, asignatura_id: 3, nota: 4.5, convocatoria: 'Ordinaria' },
        { id: 16, estudiante_id: 8, asignatura_id: 3, nota: 6.0, convocatoria: 'Extraordinaria' },
        { id: 17, estudiante_id: 8, asignatura_id: 4, nota: 7.5, convocatoria: 'Ordinaria' },
      ],
    },
  ],
  sampleQueries: [
    {
      name: 'Todos los estudiantes',
      query: 'SELECT * FROM estudiantes ORDER BY nombre;',
      description: 'Lista completa de estudiantes',
    },
    {
      name: 'Notas por estudiante',
      query: `SELECT e.nombre, a.nombre as asignatura, m.nota
FROM estudiantes e
JOIN matriculas m ON e.id = m.estudiante_id
JOIN asignaturas a ON m.asignatura_id = a.id
ORDER BY e.nombre, a.nombre;`,
      description: 'Calificaciones de cada estudiante',
    },
    {
      name: 'Media por asignatura',
      query: `SELECT a.nombre, ROUND(AVG(m.nota), 2) as media, COUNT(*) as matriculados
FROM asignaturas a
JOIN matriculas m ON a.id = m.asignatura_id
GROUP BY a.id, a.nombre
ORDER BY media DESC;`,
      description: 'Nota media de cada asignatura',
    },
  ],
};

// ============================================
// DATASET 3: EMPRESA
// ============================================
export const empresaDataset: Dataset = {
  id: 'empresa',
  name: 'Empresa',
  icon: '🏢',
  description: 'Base de datos empresarial con empleados, departamentos y proyectos',
  tables: [
    {
      name: 'departamentos',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true },
        { name: 'nombre', type: 'TEXT' },
        { name: 'presupuesto', type: 'REAL' },
        { name: 'ubicacion', type: 'TEXT' },
      ],
      data: [
        { id: 1, nombre: 'Tecnología', presupuesto: 500000, ubicacion: 'Planta 3' },
        { id: 2, nombre: 'Marketing', presupuesto: 200000, ubicacion: 'Planta 2' },
        { id: 3, nombre: 'Recursos Humanos', presupuesto: 150000, ubicacion: 'Planta 1' },
        { id: 4, nombre: 'Ventas', presupuesto: 300000, ubicacion: 'Planta 2' },
        { id: 5, nombre: 'Finanzas', presupuesto: 250000, ubicacion: 'Planta 4' },
      ],
    },
    {
      name: 'empleados',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true },
        { name: 'nombre', type: 'TEXT' },
        { name: 'puesto', type: 'TEXT' },
        { name: 'salario', type: 'REAL' },
        { name: 'departamento_id', type: 'INTEGER', foreignKey: { table: 'departamentos', column: 'id' } },
        { name: 'fecha_contratacion', type: 'DATE' },
        { name: 'jefe_id', type: 'INTEGER', foreignKey: { table: 'empleados', column: 'id' } },
      ],
      data: [
        { id: 1, nombre: 'Roberto Gómez', puesto: 'Director General', salario: 85000, departamento_id: null, fecha_contratacion: '2015-01-10', jefe_id: null },
        { id: 2, nombre: 'Isabel Muñoz', puesto: 'Director Tecnología', salario: 65000, departamento_id: 1, fecha_contratacion: '2016-03-15', jefe_id: 1 },
        { id: 3, nombre: 'Fernando Reyes', puesto: 'Director Marketing', salario: 55000, departamento_id: 2, fecha_contratacion: '2017-06-20', jefe_id: 1 },
        { id: 4, nombre: 'Patricia Luna', puesto: 'Desarrollador Senior', salario: 45000, departamento_id: 1, fecha_contratacion: '2018-09-01', jefe_id: 2 },
        { id: 5, nombre: 'Andrés Silva', puesto: 'Desarrollador Junior', salario: 28000, departamento_id: 1, fecha_contratacion: '2022-01-15', jefe_id: 2 },
        { id: 6, nombre: 'Carolina Peña', puesto: 'Diseñadora UX', salario: 38000, departamento_id: 1, fecha_contratacion: '2020-04-10', jefe_id: 2 },
        { id: 7, nombre: 'Ricardo Vargas', puesto: 'Especialista SEO', salario: 32000, departamento_id: 2, fecha_contratacion: '2021-07-22', jefe_id: 3 },
        { id: 8, nombre: 'Mónica Ibáñez', puesto: 'Community Manager', salario: 28000, departamento_id: 2, fecha_contratacion: '2022-03-05', jefe_id: 3 },
        { id: 9, nombre: 'Héctor Paredes', puesto: 'Director RRHH', salario: 52000, departamento_id: 3, fecha_contratacion: '2017-11-12', jefe_id: 1 },
        { id: 10, nombre: 'Natalia Ríos', puesto: 'Técnico Selección', salario: 30000, departamento_id: 3, fecha_contratacion: '2020-08-18', jefe_id: 9 },
        { id: 11, nombre: 'Óscar Mendoza', puesto: 'Director Ventas', salario: 58000, departamento_id: 4, fecha_contratacion: '2016-05-25', jefe_id: 1 },
        { id: 12, nombre: 'Beatriz Cordero', puesto: 'Ejecutiva Ventas', salario: 35000, departamento_id: 4, fecha_contratacion: '2019-02-14', jefe_id: 11 },
      ],
    },
    {
      name: 'proyectos',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true },
        { name: 'nombre', type: 'TEXT' },
        { name: 'presupuesto', type: 'REAL' },
        { name: 'fecha_inicio', type: 'DATE' },
        { name: 'fecha_fin', type: 'DATE' },
        { name: 'estado', type: 'TEXT' },
        { name: 'departamento_id', type: 'INTEGER', foreignKey: { table: 'departamentos', column: 'id' } },
      ],
      data: [
        { id: 1, nombre: 'App Móvil v2', presupuesto: 80000, fecha_inicio: '2024-01-01', fecha_fin: '2024-06-30', estado: 'En progreso', departamento_id: 1 },
        { id: 2, nombre: 'Rediseño Web', presupuesto: 45000, fecha_inicio: '2024-02-15', fecha_fin: '2024-05-15', estado: 'En progreso', departamento_id: 1 },
        { id: 3, nombre: 'Campaña Verano', presupuesto: 30000, fecha_inicio: '2024-04-01', fecha_fin: '2024-08-31', estado: 'Planificado', departamento_id: 2 },
        { id: 4, nombre: 'CRM Interno', presupuesto: 60000, fecha_inicio: '2023-06-01', fecha_fin: '2024-01-31', estado: 'Completado', departamento_id: 1 },
        { id: 5, nombre: 'Expansión Norte', presupuesto: 120000, fecha_inicio: '2024-03-01', fecha_fin: '2024-12-31', estado: 'En progreso', departamento_id: 4 },
      ],
    },
    {
      name: 'asignaciones',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true },
        { name: 'empleado_id', type: 'INTEGER', foreignKey: { table: 'empleados', column: 'id' } },
        { name: 'proyecto_id', type: 'INTEGER', foreignKey: { table: 'proyectos', column: 'id' } },
        { name: 'horas_semana', type: 'INTEGER' },
        { name: 'rol', type: 'TEXT' },
      ],
      data: [
        { id: 1, empleado_id: 2, proyecto_id: 1, horas_semana: 10, rol: 'Líder técnico' },
        { id: 2, empleado_id: 4, proyecto_id: 1, horas_semana: 30, rol: 'Desarrollador' },
        { id: 3, empleado_id: 5, proyecto_id: 1, horas_semana: 40, rol: 'Desarrollador' },
        { id: 4, empleado_id: 6, proyecto_id: 2, horas_semana: 40, rol: 'Diseñadora principal' },
        { id: 5, empleado_id: 4, proyecto_id: 2, horas_semana: 10, rol: 'Desarrollador' },
        { id: 6, empleado_id: 7, proyecto_id: 3, horas_semana: 20, rol: 'SEO' },
        { id: 7, empleado_id: 8, proyecto_id: 3, horas_semana: 30, rol: 'Community' },
        { id: 8, empleado_id: 4, proyecto_id: 4, horas_semana: 20, rol: 'Desarrollador' },
        { id: 9, empleado_id: 12, proyecto_id: 5, horas_semana: 35, rol: 'Ejecutiva' },
      ],
    },
  ],
  sampleQueries: [
    {
      name: 'Empleados por departamento',
      query: `SELECT d.nombre as departamento, COUNT(e.id) as empleados, ROUND(AVG(e.salario), 2) as salario_medio
FROM departamentos d
LEFT JOIN empleados e ON d.id = e.departamento_id
GROUP BY d.id, d.nombre
ORDER BY empleados DESC;`,
      description: 'Estadísticas por departamento',
    },
    {
      name: 'Empleados y sus jefes',
      query: `SELECT e.nombre as empleado, e.puesto, j.nombre as jefe
FROM empleados e
LEFT JOIN empleados j ON e.jefe_id = j.id
ORDER BY j.nombre, e.nombre;`,
      description: 'Jerarquía organizacional (self-join)',
    },
    {
      name: 'Proyectos activos',
      query: `SELECT p.nombre, p.estado, d.nombre as departamento, COUNT(a.id) as equipo
FROM proyectos p
JOIN departamentos d ON p.departamento_id = d.id
LEFT JOIN asignaciones a ON p.id = a.proyecto_id
WHERE p.estado != 'Completado'
GROUP BY p.id, p.nombre, p.estado, d.nombre;`,
      description: 'Proyectos en curso con tamaño de equipo',
    },
  ],
};

// Exportar todos los datasets
export const DATASETS: Dataset[] = [tiendaDataset, universidadDataset, empresaDataset];

export const getDatasetById = (id: string): Dataset | undefined => {
  return DATASETS.find(d => d.id === id);
};
