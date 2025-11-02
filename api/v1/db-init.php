<?php
/**
 * Inicializador de Base de Datos SQLite - meskeIA API
 * Archivo: api/v1/db-init.php
 *
 * Este archivo crea la base de datos SQLite y las tablas necesarias
 * si no existen previamente.
 */

// Ruta de la base de datos (misma carpeta que este archivo)
define('DB_PATH', __DIR__ . '/meskeia-analytics.db');

/**
 * Inicializa la base de datos y crea las tablas necesarias
 *
 * @return PDO Conexión a la base de datos
 * @throws PDOException Si hay error de conexión
 */
function inicializarBaseDatos() {
    try {
        // Crear conexión PDO con SQLite
        $pdo = new PDO('sqlite:' . DB_PATH);

        // Configurar PDO para lanzar excepciones en errores
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Crear tabla de uso de aplicaciones si no existe
        $sql_uso = "
        CREATE TABLE IF NOT EXISTS uso_aplicaciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            aplicacion TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            navegador TEXT,
            sistema_operativo TEXT,
            resolucion TEXT,
            datos_adicionales TEXT,
            created_at TEXT DEFAULT (datetime('now', 'localtime'))
        )";

        $pdo->exec($sql_uso);

        // Crear índices para mejorar rendimiento de consultas
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_aplicacion ON uso_aplicaciones(aplicacion)");
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_timestamp ON uso_aplicaciones(timestamp)");
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_created_at ON uso_aplicaciones(created_at)");

        return $pdo;

    } catch (PDOException $e) {
        // Log del error
        error_log("Error al inicializar base de datos: " . $e->getMessage());
        throw $e;
    }
}

/**
 * Obtiene una conexión a la base de datos
 * Si no existe, la crea
 *
 * @return PDO Conexión a la base de datos
 */
function obtenerConexion() {
    return inicializarBaseDatos();
}

// Si se ejecuta directamente (para testing)
if (php_sapi_name() === 'cli' || basename($_SERVER['PHP_SELF']) === basename(__FILE__)) {
    try {
        $pdo = inicializarBaseDatos();
        echo "✅ Base de datos inicializada correctamente en: " . DB_PATH . "\n";

        // Mostrar tablas creadas
        $tablas = $pdo->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll(PDO::FETCH_COLUMN);
        echo "📋 Tablas creadas: " . implode(', ', $tablas) . "\n";

        // Mostrar índices creados
        $indices = $pdo->query("SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'")->fetchAll(PDO::FETCH_COLUMN);
        echo "🔍 Índices creados: " . implode(', ', $indices) . "\n";

    } catch (Exception $e) {
        echo "❌ Error: " . $e->getMessage() . "\n";
        exit(1);
    }
}
?>
