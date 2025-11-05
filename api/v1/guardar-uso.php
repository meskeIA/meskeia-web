<?php
/**
 * Endpoint: Guardar Uso de Aplicación - meskeIA API
 * Archivo: api/v1/guardar-uso.php
 *
 * Método: POST
 * Content-Type: application/json
 *
 * Body de ejemplo:
 * {
 *   "aplicacion": "generador-gradientes",
 *   "navegador": "Chrome 119.0",
 *   "sistema_operativo": "Windows 10",
 *   "resolucion": "1920x1080",
 *   "datos_adicionales": {"accion": "exportar_css"}
 * }
 */

// Headers CORS para permitir peticiones desde cualquier origen
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Responder a peticiones OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Solo permitir método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Método no permitido. Usa POST.'
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

// Incluir inicializador de base de datos
require_once __DIR__ . '/db-init.php';

// Incluir módulo de geolocalización
require_once __DIR__ . '/geolocation.php';

try {
    // Obtener datos del POST
    $input = file_get_contents('php://input');
    $datos = json_decode($input, true);

    // Validar que se recibió JSON válido
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON inválido: ' . json_last_error_msg());
    }

    // Validar campo obligatorio: aplicacion
    if (empty($datos['aplicacion'])) {
        throw new Exception('El campo "aplicacion" es obligatorio');
    }

    // Obtener conexión a la base de datos
    $pdo = obtenerConexion();

    // Obtener geolocalización
    $geolocalizacion = obtenerDatosGeolocalizacion();

    // Preparar datos para insertar
    $aplicacion = $datos['aplicacion'];
    $timestamp = date('d/m/Y H:i:s'); // Formato español
    $navegador = $datos['navegador'] ?? null;
    $sistema_operativo = $datos['sistema_operativo'] ?? null;
    $resolucion = $datos['resolucion'] ?? null;
    $ip_address = $geolocalizacion['ip'];
    $pais = $geolocalizacion['pais'];
    $ciudad = $geolocalizacion['ciudad'];

    // Convertir datos adicionales a JSON si existen
    $datos_adicionales = null;
    if (isset($datos['datos_adicionales'])) {
        $datos_adicionales = json_encode($datos['datos_adicionales'], JSON_UNESCAPED_UNICODE);
    }

    // Insertar registro en la base de datos
    $sql = "INSERT INTO uso_aplicaciones
            (aplicacion, timestamp, navegador, sistema_operativo, resolucion, ip_address, pais, ciudad, datos_adicionales)
            VALUES (:aplicacion, :timestamp, :navegador, :sistema_operativo, :resolucion, :ip_address, :pais, :ciudad, :datos_adicionales)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':aplicacion' => $aplicacion,
        ':timestamp' => $timestamp,
        ':navegador' => $navegador,
        ':sistema_operativo' => $sistema_operativo,
        ':resolucion' => $resolucion,
        ':ip_address' => $ip_address,
        ':pais' => $pais,
        ':ciudad' => $ciudad,
        ':datos_adicionales' => $datos_adicionales
    ]);

    // Obtener ID del registro insertado
    $id_insertado = $pdo->lastInsertId();

    // Respuesta exitosa
    http_response_code(201);
    echo json_encode([
        'status' => 'success',
        'message' => 'Uso registrado correctamente',
        'data' => [
            'id' => $id_insertado,
            'aplicacion' => $aplicacion,
            'timestamp' => $timestamp,
            'ip_address' => $ip_address,
            'pais' => $pais,
            'ciudad' => $ciudad
        ]
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    // Error en la operación
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

    // Log del error
    error_log("Error en guardar-uso.php: " . $e->getMessage());
}
?>
