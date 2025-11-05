// Dashboard meskeIA Analytics - Script Principal
// Configuración de la API
const API_BASE_URL = 'https://meskeia.com/api/v1';

// Variables globales para los gráficos
let chartTopAplicaciones = null;
let chartTendenciaTemporal = null;
let chartTopPaises = null;
let chartNavegadores = null;
let chartSistemasOperativos = null;
let chartResoluciones = null;

// Cargar datos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
});

// Función principal para cargar todos los datos
async function cargarDatos() {
    actualizarEstado('loading', 'Cargando datos...');

    try {
        // Cargar datos de las aplicaciones
        const aplicaciones = await fetch(`${API_BASE_URL}/aplicaciones.php`)
            .then(res => res.json());

        // Cargar estadísticas generales (últimos 1000 registros para análisis completo)
        const estadisticas = await fetch(`${API_BASE_URL}/estadisticas.php?limite=1000`)
            .then(res => res.json());

        // Actualizar estadísticas generales
        actualizarEstadisticasGenerales(aplicaciones, estadisticas);

        // Generar gráficos
        generarGraficoTopAplicaciones(aplicaciones.data);
        generarGraficoTendenciaTemporal(estadisticas.data);
        generarGraficoTopPaises(aplicaciones.top_paises || []);
        generarGraficoNavegadores(estadisticas.data);
        generarGraficoSistemasOperativos(estadisticas.data);
        generarGraficoResoluciones(estadisticas.data);

        // Cargar últimos 50 registros para la tabla
        const ultimosRegistros = await fetch(`${API_BASE_URL}/estadisticas.php?limite=50`)
            .then(res => res.json());

        actualizarTablaUltimosUsos(ultimosRegistros.data);

        actualizarEstado('success', 'Datos actualizados correctamente');
        actualizarUltimaActualizacion();

    } catch (error) {
        console.error('Error al cargar datos:', error);
        actualizarEstado('error', 'Error al cargar datos');
    }
}

// Actualizar estadísticas generales
function actualizarEstadisticasGenerales(aplicaciones, estadisticas) {
    document.getElementById('total-usos').textContent = aplicaciones.resumen.total_usos_global.toLocaleString('es-ES');
    document.getElementById('total-aplicaciones').textContent = aplicaciones.resumen.total_aplicaciones.toLocaleString('es-ES');

    // Calcular países únicos desde los datos de estadísticas
    const paisesUnicos = new Set();
    estadisticas.data.forEach(registro => {
        if (registro.pais && registro.pais !== '' && registro.pais !== 'Local') {
            paisesUnicos.add(registro.pais);
        }
    });
    document.getElementById('total-paises').textContent = paisesUnicos.size.toLocaleString('es-ES');

    // Calcular primer y último uso de todos los datos
    if (aplicaciones.data.length > 0) {
        const primerosUsos = aplicaciones.data.map(app => app.primer_uso).filter(Boolean);
        const ultimosUsos = aplicaciones.data.map(app => app.ultimo_uso).filter(Boolean);

        if (primerosUsos.length > 0) {
            const primerUsoGlobal = primerosUsos.sort()[0];
            document.getElementById('primer-uso').textContent = formatearFecha(primerUsoGlobal);
        }

        if (ultimosUsos.length > 0) {
            const ultimoUsoGlobal = ultimosUsos.sort().reverse()[0];
            document.getElementById('ultimo-uso').textContent = formatearFecha(ultimoUsoGlobal);
        }
    }
}

// Generar gráfico de Top 10 Aplicaciones
function generarGraficoTopAplicaciones(datos) {
    const top10 = datos.slice(0, 10);
    const labels = top10.map(app => app.aplicacion);
    const valores = top10.map(app => app.total_usos);

    const ctx = document.getElementById('chartTopAplicaciones').getContext('2d');

    if (chartTopAplicaciones) {
        chartTopAplicaciones.destroy();
    }

    chartTopAplicaciones = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Número de Usos',
                data: valores,
                backgroundColor: 'rgba(46, 134, 171, 0.7)',
                borderColor: '#2E86AB',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// Generar gráfico de Tendencia Temporal (últimos 30 días)
function generarGraficoTendenciaTemporal(datos) {
    // Agrupar por fecha (solo día)
    const usosPorDia = {};
    const hoy = new Date();
    const hace30Dias = new Date(hoy);
    hace30Dias.setDate(hoy.getDate() - 30);

    datos.forEach(registro => {
        const fecha = parsearFechaEspanola(registro.timestamp);
        if (fecha && fecha >= hace30Dias) {
            const dia = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
            usosPorDia[dia] = (usosPorDia[dia] || 0) + 1;
        }
    });

    // Generar array de últimos 30 días
    const labels = [];
    const valores = [];
    for (let i = 29; i >= 0; i--) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() - i);
        const dia = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
        labels.push(dia);
        valores.push(usosPorDia[dia] || 0);
    }

    const ctx = document.getElementById('chartTendenciaTemporal').getContext('2d');

    if (chartTendenciaTemporal) {
        chartTendenciaTemporal.destroy();
    }

    chartTendenciaTemporal = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Usos por Día',
                data: valores,
                borderColor: '#2E86AB',
                backgroundColor: 'rgba(46, 134, 171, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// Generar gráfico de Top 10 Países
function generarGraficoTopPaises(topPaises) {
    if (!topPaises || topPaises.length === 0) {
        console.warn('No hay datos de países para mostrar');
        return;
    }

    const top10 = topPaises.slice(0, 10);
    const labels = top10.map(pais => pais.pais || 'Desconocido');
    const valores = top10.map(pais => pais.total_visitas || 0);

    const ctx = document.getElementById('chartTopPaises').getContext('2d');

    if (chartTopPaises) {
        chartTopPaises.destroy();
    }

    chartTopPaises = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Número de Visitas',
                data: valores,
                backgroundColor: 'rgba(72, 169, 166, 0.7)',
                borderColor: '#48A9A6',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y', // Barras horizontales
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const index = context.dataIndex;
                            const apps = top10[index].aplicaciones_usadas || 0;
                            return `Apps usadas: ${apps}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// Generar gráfico de Navegadores
function generarGraficoNavegadores(datos) {
    const navegadores = {};
    datos.forEach(registro => {
        if (registro.navegador) {
            const navegador = extraerNavegador(registro.navegador);
            navegadores[navegador] = (navegadores[navegador] || 0) + 1;
        }
    });

    const navegadoresOrdenados = Object.entries(navegadores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const labels = navegadoresOrdenados.map(([nombre]) => nombre);
    const valores = navegadoresOrdenados.map(([, count]) => count);

    const ctx = document.getElementById('chartNavegadores').getContext('2d');

    if (chartNavegadores) {
        chartNavegadores.destroy();
    }

    chartNavegadores = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: [
                    '#2E86AB',
                    '#48A9A6',
                    '#7FB3D3',
                    '#A6D4E0',
                    '#C6E5ED'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Generar gráfico de Sistemas Operativos
function generarGraficoSistemasOperativos(datos) {
    const sistemas = {};
    datos.forEach(registro => {
        if (registro.sistema_operativo) {
            const sistema = extraerSistemaOperativo(registro.sistema_operativo);
            sistemas[sistema] = (sistemas[sistema] || 0) + 1;
        }
    });

    const sistemasOrdenados = Object.entries(sistemas)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const labels = sistemasOrdenados.map(([nombre]) => nombre);
    const valores = sistemasOrdenados.map(([, count]) => count);

    const ctx = document.getElementById('chartSistemasOperativos').getContext('2d');

    if (chartSistemasOperativos) {
        chartSistemasOperativos.destroy();
    }

    chartSistemasOperativos = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: [
                    '#2E86AB',
                    '#48A9A6',
                    '#7FB3D3',
                    '#A6D4E0',
                    '#C6E5ED'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Generar gráfico de Resoluciones
function generarGraficoResoluciones(datos) {
    const resoluciones = {};
    datos.forEach(registro => {
        if (registro.resolucion) {
            resoluciones[registro.resolucion] = (resoluciones[registro.resolucion] || 0) + 1;
        }
    });

    const resolucionesOrdenadas = Object.entries(resoluciones)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const labels = resolucionesOrdenadas.map(([res]) => res);
    const valores = resolucionesOrdenadas.map(([, count]) => count);

    const ctx = document.getElementById('chartResoluciones').getContext('2d');

    if (chartResoluciones) {
        chartResoluciones.destroy();
    }

    chartResoluciones = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Número de Usos',
                data: valores,
                backgroundColor: 'rgba(72, 169, 166, 0.7)',
                borderColor: '#48A9A6',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// Actualizar tabla de últimos usos
function actualizarTablaUltimosUsos(datos) {
    const tbody = document.getElementById('tablaBody');
    tbody.innerHTML = '';

    if (datos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading">No hay registros disponibles</td></tr>';
        return;
    }

    datos.forEach(registro => {
        const fila = document.createElement('tr');

        // Formatear país y ciudad con banderas
        const pais = registro.pais || '-';
        const ciudad = registro.ciudad || '-';
        const paisFormateado = pais !== '-' ? `🌍 ${pais}` : '-';
        const ciudadFormateada = ciudad !== '-' ? `📍 ${ciudad}` : '-';

        fila.innerHTML = `
            <td>${registro.id}</td>
            <td><strong>${registro.aplicacion}</strong></td>
            <td>${registro.timestamp}</td>
            <td>${paisFormateado}</td>
            <td>${ciudadFormateada}</td>
            <td>${extraerNavegador(registro.navegador || '-')}</td>
            <td>${extraerSistemaOperativo(registro.sistema_operativo || '-')}</td>
            <td>${registro.resolucion || '-'}</td>
        `;
        tbody.appendChild(fila);
    });
}

// Utilidades: Extraer nombre del navegador del User Agent
function extraerNavegador(userAgent) {
    if (!userAgent || userAgent === '-') return 'Desconocido';

    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
    if (userAgent.includes('Edg')) return 'Edge';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';

    return 'Otro';
}

// Utilidades: Extraer nombre del Sistema Operativo
function extraerSistemaOperativo(platform) {
    if (!platform || platform === '-') return 'Desconocido';

    if (platform.includes('Win')) return 'Windows';
    if (platform.includes('Mac')) return 'macOS';
    if (platform.includes('Linux')) return 'Linux';
    if (platform.includes('Android')) return 'Android';
    if (platform.includes('iPhone') || platform.includes('iPad')) return 'iOS';

    return 'Otro';
}

// Utilidades: Parsear fecha española (DD/MM/YYYY HH:MM:SS)
function parsearFechaEspanola(fechaStr) {
    if (!fechaStr) return null;

    const partes = fechaStr.split(' ');
    if (partes.length !== 2) return null;

    const [fecha, hora] = partes;
    const [dia, mes, año] = fecha.split('/');

    if (!dia || !mes || !año) return null;

    return new Date(`${año}-${mes}-${dia}T${hora}`);
}

// Utilidades: Formatear fecha para mostrar
function formatearFecha(fechaStr) {
    if (!fechaStr) return '-';

    const partes = fechaStr.split(' ');
    if (partes.length === 2) {
        return partes[0]; // Solo mostrar DD/MM/YYYY
    }

    return fechaStr;
}

// Actualizar estado de conexión
function actualizarEstado(tipo, mensaje) {
    const indicator = document.getElementById('status-indicator');
    indicator.className = `status-${tipo}`;

    const iconos = {
        loading: '⏳',
        success: '✅',
        error: '❌'
    };

    indicator.textContent = `${iconos[tipo]} ${mensaje}`;
}

// Actualizar última actualización
function actualizarUltimaActualizacion() {
    const ahora = new Date();
    const horaFormateada = ahora.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    document.getElementById('ultima-actualizacion').textContent =
        `Última actualización: ${horaFormateada}`;
}
