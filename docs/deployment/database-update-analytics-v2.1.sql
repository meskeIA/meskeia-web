-- ========================================
-- Actualización Base de Datos
-- Analytics v2.1 - PWA Support
-- Fecha: 21 noviembre 2025
-- ========================================

-- IMPORTANTE: Ejecutar estos scripts en tu base de datos MySQL
-- para soportar los nuevos campos de Analytics v2.1

-- ========================================
-- 1. Actualizar tabla estadisticas_uso
-- ========================================

-- Añadir columna 'modo' (pwa/web)
ALTER TABLE estadisticas_uso
ADD COLUMN modo VARCHAR(10) DEFAULT 'web'
COMMENT 'Modo de acceso: pwa o web'
AFTER tipo_dispositivo;

-- Añadir columna 'sesion_id' (tracking de sesiones)
ALTER TABLE estadisticas_uso
ADD COLUMN sesion_id VARCHAR(50) NULL
COMMENT 'ID único de sesión para rastreo'
AFTER modo;

-- Añadir índices para mejor rendimiento
CREATE INDEX idx_modo ON estadisticas_uso(modo);
CREATE INDEX idx_sesion_id ON estadisticas_uso(sesion_id);
CREATE INDEX idx_fecha_modo ON estadisticas_uso(fecha_registro, modo);

-- ========================================
-- 2. Actualizar tabla duraciones
-- ========================================

-- Añadir columna 'modo' (pwa/web)
ALTER TABLE duraciones
ADD COLUMN modo VARCHAR(10) DEFAULT 'web'
COMMENT 'Modo de acceso: pwa o web'
AFTER tipo_dispositivo;

-- Añadir columna 'sesion_id' (relacionar con estadisticas_uso)
ALTER TABLE duraciones
ADD COLUMN sesion_id VARCHAR(50) NULL
COMMENT 'ID de sesión para vincular con estadisticas_uso'
AFTER modo;

-- Añadir índices
CREATE INDEX idx_duracion_modo ON duraciones(modo);
CREATE INDEX idx_duracion_sesion ON duraciones(sesion_id);
CREATE INDEX idx_duracion_fecha_modo ON duraciones(fecha_registro, modo);

-- ========================================
-- 3. Verificación de Estructura
-- ========================================

-- Ver estructura actualizada de estadisticas_uso
DESCRIBE estadisticas_uso;

-- Ver estructura actualizada de duraciones
DESCRIBE duraciones;

-- ========================================
-- 4. Consultas de Prueba
-- ========================================

-- Contar registros por modo
SELECT
    modo,
    COUNT(*) as total
FROM estadisticas_uso
GROUP BY modo;

-- Ver últimas sesiones registradas
SELECT
    aplicacion,
    modo,
    tipo_dispositivo,
    sesion_id,
    fecha_registro
FROM estadisticas_uso
ORDER BY fecha_registro DESC
LIMIT 10;

-- ========================================
-- 5. (OPCIONAL) Migrar Datos Antiguos
-- ========================================

-- Si tienes datos antiguos sin el campo 'modo',
-- puedes marcarlos como 'web' (ya es el default)

-- Actualizar registros NULL a 'web'
UPDATE estadisticas_uso
SET modo = 'web'
WHERE modo IS NULL;

UPDATE duraciones
SET modo = 'web'
WHERE modo IS NULL;

-- ========================================
-- 6. Permisos (si usas usuario específico)
-- ========================================

-- Asegurar que el usuario de la API puede escribir en las nuevas columnas
-- GRANT UPDATE ON database_name.estadisticas_uso TO 'api_user'@'localhost';
-- GRANT UPDATE ON database_name.duraciones TO 'api_user'@'localhost';
-- FLUSH PRIVILEGES;

-- ========================================
-- FIN DE ACTUALIZACIÓN
-- ========================================

-- Ejecuta este SQL en tu base de datos y los nuevos campos
-- estarán listos para recibir datos de Analytics v2.1

-- Notas:
-- - Los campos tienen DEFAULT para no romper registros existentes
-- - Los índices mejoran el rendimiento de consultas por modo/sesión
-- - El sesion_id permite tracking completo de user journeys
