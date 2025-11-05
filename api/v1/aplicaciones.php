<?php
/**
 * Endpoint: Listado de Aplicaciones - meskeIA API
 * Archivo: api/v1/aplicaciones.php
 *
 * Método: GET
 *
 * Devuelve un resumen de todas las aplicaciones con sus estadísticas de uso.
 *
 * Ejemplo:
 * - /api/v1/aplicaciones.php
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

    // Consulta para obtener estadísticas por aplicación
    $sql = "SELECT
                aplicacion,
                COUNT(*) as total_usos,
                MIN(timestamp) as primer_uso,
                MAX(timestamp) as ultimo_uso,
                COUNT(DISTINCT navegador) as navegadores_diferentes,
                COUNT(DISTINCT sistema_operativo) as sistemas_operativos_diferentes,
                COUNT(DISTINCT pais) as paises_diferentes
            FROM uso_aplicaciones
            GROUP BY aplicacion
            ORDER BY total_usos DESC";

    $stmt = $pdo->query($sql);
    $aplicaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Convertir valores numéricos a enteros
    foreach ($aplicaciones as &$app) {
        $app['total_usos'] = (int)$app['total_usos'];
        $app['navegadores_diferentes'] = (int)$app['navegadores_diferentes'];
        $app['sistemas_operativos_diferentes'] = (int)$app['sistemas_operativos_diferentes'];
        $app['paises_diferentes'] = (int)$app['paises_diferentes'];
    }

    // Obtener total de usos en toda la plataforma
    $sql_total = "SELECT COUNT(*) as total FROM uso_aplicaciones";
    $total_global = $pdo->query($sql_total)->fetch(PDO::FETCH_ASSOC)['total'];

    // Obtener top de países
    $sql_paises = "SELECT
                        pais,
                        COUNT(*) as total_visitas,
                        COUNT(DISTINCT aplicacion) as aplicaciones_usadas
                   FROM uso_aplicaciones
                   WHERE pais IS NOT NULL AND pais != ''
                   GROUP BY pais
                   ORDER BY total_visitas DESC
                   LIMIT 10";
    $stmt_paises = $pdo->query($sql_paises);
    $top_paises = $stmt_paises->fetchAll(PDO::FETCH_ASSOC);

    // Convertir valores numéricos
    foreach ($top_paises as &$pais_data) {
        $pais_data['total_visitas'] = (int)$pais_data['total_visitas'];
        $pais_data['aplicaciones_usadas'] = (int)$pais_data['aplicaciones_usadas'];
    }

    // Respuesta exitosa
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'resumen' => [
            'total_aplicaciones' => count($aplicaciones),
            'total_usos_global' => (int)$total_global
        ],
        'top_paises' => $top_paises,
        'data' => $aplicaciones
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    // Error en la operación
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

    // Log del error
    error_log("Error en aplicaciones.php: " . $e->getMessage());
}
?>
