<?php
/**
 * Módulo de Geolocalización por IP - meskeIA API
 * Archivo: api/v1/geolocation.php
 *
 * Funciones para obtener información geográfica basada en la dirección IP
 * Utiliza el servicio gratuito ip-api.com
 */

/**
 * Obtiene la dirección IP real del visitante
 * Considera proxies, CDNs y balanceadores de carga
 *
 * @return string Dirección IP del visitante
 */
function obtenerIPReal() {
    // Lista de headers donde puede venir la IP real
    $headers = [
        'HTTP_CF_CONNECTING_IP',    // Cloudflare
        'HTTP_X_FORWARDED_FOR',     // Proxy estándar
        'HTTP_X_REAL_IP',           // Nginx proxy
        'HTTP_CLIENT_IP',           // Proxy
        'HTTP_X_FORWARDED',
        'HTTP_FORWARDED_FOR',
        'HTTP_FORWARDED',
        'REMOTE_ADDR'               // IP directa (fallback)
    ];

    foreach ($headers as $header) {
        if (!empty($_SERVER[$header])) {
            // Si hay múltiples IPs separadas por coma, tomar la primera
            $ip = trim(explode(',', $_SERVER[$header])[0]);

            // Validar que sea una IP válida
            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return $ip;
            }
        }
    }

    // Fallback: devolver REMOTE_ADDR aunque sea IP privada
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

/**
 * Obtiene información de geolocalización desde ip-api.com
 *
 * @param string $ip Dirección IP a consultar
 * @return array|null Array con datos de geolocalización o null si falla
 */
function obtenerGeolocalizacion($ip) {
    // No geolocalizar IPs locales/privadas
    if (esIPLocal($ip)) {
        return [
            'status' => 'local',
            'ip' => $ip,
            'pais' => 'Local',
            'ciudad' => 'Localhost',
            'codigo_pais' => 'XX',
            'region' => null,
            'latitud' => null,
            'longitud' => null,
            'zona_horaria' => null,
            'isp' => null
        ];
    }

    try {
        // Construir URL del API (campos específicos para optimizar)
        $campos = 'status,message,country,countryCode,region,city,lat,lon,timezone,isp,query';
        $url = "http://ip-api.com/json/{$ip}?fields={$campos}&lang=es";

        // Configurar contexto para timeout
        $contexto = stream_context_create([
            'http' => [
                'timeout' => 3, // 3 segundos de timeout
                'user_agent' => 'meskeIA-Analytics/1.0'
            ]
        ]);

        // Realizar petición al API
        $respuesta = @file_get_contents($url, false, $contexto);

        if ($respuesta === false) {
            error_log("Error al consultar ip-api.com para IP: {$ip}");
            return null;
        }

        $datos = json_decode($respuesta, true);

        // Verificar si la respuesta fue exitosa
        if ($datos['status'] !== 'success') {
            error_log("ip-api.com devolvió error: " . ($datos['message'] ?? 'desconocido'));
            return null;
        }

        // Normalizar datos
        return [
            'status' => 'success',
            'ip' => $datos['query'],
            'pais' => $datos['country'] ?? null,
            'codigo_pais' => $datos['countryCode'] ?? null,
            'region' => $datos['region'] ?? null,
            'ciudad' => $datos['city'] ?? null,
            'latitud' => $datos['lat'] ?? null,
            'longitud' => $datos['lon'] ?? null,
            'zona_horaria' => $datos['timezone'] ?? null,
            'isp' => $datos['isp'] ?? null
        ];

    } catch (Exception $e) {
        error_log("Excepción en geolocalización: " . $e->getMessage());
        return null;
    }
}

/**
 * Verifica si una IP es local o privada
 *
 * @param string $ip Dirección IP
 * @return bool True si es IP local/privada
 */
function esIPLocal($ip) {
    // IPs locales comunes
    $ips_locales = ['127.0.0.1', '::1', '0.0.0.0', 'localhost'];

    if (in_array($ip, $ips_locales)) {
        return true;
    }

    // Validar si es IP privada o reservada
    if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
        return true;
    }

    return false;
}

/**
 * Obtiene datos completos de geolocalización del visitante actual
 * Función principal para usar en otros scripts
 *
 * @return array Array con IP, país y ciudad
 */
function obtenerDatosGeolocalizacion() {
    $ip = obtenerIPReal();
    $geo = obtenerGeolocalizacion($ip);

    if ($geo === null) {
        // Si falla la geolocalización, devolver datos básicos
        return [
            'ip' => $ip,
            'pais' => null,
            'ciudad' => null,
            'datos_completos' => null
        ];
    }

    return [
        'ip' => $ip,
        'pais' => $geo['pais'],
        'ciudad' => $geo['ciudad'],
        'datos_completos' => $geo // Información adicional disponible
    ];
}

// Testing si se ejecuta directamente
if (php_sapi_name() === 'cli' || basename($_SERVER['PHP_SELF']) === basename(__FILE__)) {
    // Test con IP pública de ejemplo (Google DNS)
    $test_ip = '8.8.8.8';
    echo "🧪 Probando geolocalización con IP: {$test_ip}\n";
    $resultado = obtenerGeolocalizacion($test_ip);
    print_r($resultado);

    echo "\n📍 Probando con IP local\n";
    $resultado_local = obtenerGeolocalizacion('127.0.0.1');
    print_r($resultado_local);
}
?>
