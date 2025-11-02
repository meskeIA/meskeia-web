<?php
/**
 * Endpoint: Estadísticas de Uso - meskeIA API
 * Archivo: api/v1/estadisticas.php
 *
 * Método: GET
 *
 * Parámetros opcionales (query string):
 * - aplicacion: Filtrar por nombre de aplicación
 * - desde: Fecha inicio (formato: DD/MM/YYYY)
 * - hasta: Fecha fin (formato: DD/MM/YYYY)
 * - limite: Número máximo de registros (default: 100)
 *
 * Ejemplos:
 * - /api/v1/estadisticas.php
 * - /api/v1/estadisticas.php?aplicacion=generador-gradientes
 * - /api/v1/estadisticas.php?desde=01/01/2025&hasta=31/01/2025
 * - /api/v1/estadisticas.php?limite=50
 */

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Responder a peticiones OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Solo permitir método GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Método no permitido. Usa GET.'
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

// Incluir inicializador de base de datos
require_once __DIR__ . '/db-init.php';

try {
    // Obtener conexión a la base de datos
    $pdo = obtenerConexion();

    // Obtener parámetros de consulta
    $aplicacion = $_GET['aplicacion'] ?? null;
    $desde = $_GET['desde'] ?? null;
    $hasta = $_GET['hasta'] ?? null;
    $limite = isset($_GET['limite']) ? (int)$_GET['limite'] : 100;

    // Construir query SQL con filtros opcionales
    $sql = "SELECT * FROM uso_aplicaciones WHERE 1=1";
    $parametros = [];

    // Filtro por aplicación
    if ($aplicacion) {
        $sql .= " AND aplicacion = :aplicacion";
        $parametros[':aplicacion'] = $aplicacion;
    }

    // Filtro por fecha desde
    if ($desde) {
        $sql .= " AND timestamp >= :desde";
        $parametros[':desde'] = $desde;
    }

    // Filtro por fecha hasta
    if ($hasta) {
        $sql .= " AND timestamp <= :hasta";
        $parametros[':hasta'] = $hasta;
    }

    // Ordenar por más reciente primero
    $sql .= " ORDER BY id DESC LIMIT :limite";

    // Ejecutar consulta
    $stmt = $pdo->prepare($sql);

    // Bind de parámetros
    foreach ($parametros as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limite', $limite, PDO::PARAM_INT);

    $stmt->execute();
    $registros = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Decodificar datos_adicionales de JSON a objeto
    foreach ($registros as &$registro) {
        if ($registro['datos_adicionales']) {
            $registro['datos_adicionales'] = json_decode($registro['datos_adicionales'], true);
        }
    }

    // Obtener estadísticas agregadas
    $sql_stats = "SELECT
                    COUNT(*) as total_usos,
                    COUNT(DISTINCT aplicacion) as total_aplicaciones,
                    MIN(timestamp) as primer_uso,
                    MAX(timestamp) as ultimo_uso
                  FROM uso_aplicaciones";

    $where_stats = [];
    if ($aplicacion) {
        $where_stats[] = "aplicacion = :aplicacion";
    }
    if ($desde) {
        $where_stats[] = "timestamp >= :desde";
    }
    if ($hasta) {
        $where_stats[] = "timestamp <= :hasta";
    }

    if (!empty($where_stats)) {
        $sql_stats .= " WHERE " . implode(" AND ", $where_stats);
    }

    $stmt_stats = $pdo->prepare($sql_stats);
    foreach ($parametros as $key => $value) {
        if ($key !== ':limite') {
            $stmt_stats->bindValue($key, $value);
        }
    }
    $stmt_stats->execute();
    $estadisticas = $stmt_stats->fetch(PDO::FETCH_ASSOC);

    // Respuesta exitosa
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'filtros' => [
            'aplicacion' => $aplicacion,
            'desde' => $desde,
            'hasta' => $hasta,
            'limite' => $limite
        ],
        'estadisticas' => [
            'total_usos' => (int)$estadisticas['total_usos'],
            'total_aplicaciones' => (int)$estadisticas['total_aplicaciones'],
            'primer_uso' => $estadisticas['primer_uso'],
            'ultimo_uso' => $estadisticas['ultimo_uso']
        ],
        'registros_mostrados' => count($registros),
        'data' => $registros
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    // Error en la operación
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

    // Log del error
    error_log("Error en estadisticas.php: " . $e->getMessage());
}
?>
