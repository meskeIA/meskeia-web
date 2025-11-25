// Funciones de localización española - meskeIA
// Insertar en el archivo JavaScript principal

/**
 * Formatea un número con el formato español (1.234,56)
 * @param {number} numero - Número a formatear
 * @param {number} decimales - Número de decimales (default: 2)
 * @returns {string} Número formateado
 */
function formatearNumero(numero, decimales = 2) {
    return numero.toLocaleString('es-ES', {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales
    });
}

/**
 * Formatea un número como moneda (1.234,56 €)
 * @param {number} numero - Cantidad a formatear
 * @returns {string} Moneda formateada
 */
function formatearMoneda(numero) {
    return numero.toLocaleString('es-ES', {
        style: 'currency',
        currency: 'EUR'
    });
}

/**
 * Formatea una fecha al formato español (DD/MM/YYYY)
 * @param {Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
function formatearFecha(fecha) {
    return fecha.toLocaleDateString('es-ES');
}

/**
 * Formatea una hora al formato español 24h (14:30)
 * @param {Date} fecha - Fecha con hora a formatear
 * @returns {string} Hora formateada
 */
function formatearHora(fecha) {
    return fecha.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Formatea una fecha completa (DD/MM/YYYY HH:MM)
 * @param {Date} fecha - Fecha a formatear
 * @returns {string} Fecha y hora formateadas
 */
function formatearFechaHora(fecha) {
    return `${formatearFecha(fecha)} ${formatearHora(fecha)}`;
}

/**
 * Convierte un número con punto decimal a formato español
 * @param {string} numeroStr - Número en formato US (1,234.56)
 * @returns {string} Número en formato español (1.234,56)
 */
function convertirAFormatoEspanol(numeroStr) {
    return numeroStr.replace(/,/g, 'TEMP')
                    .replace(/\./g, ',')
                    .replace(/TEMP/g, '.');
}
