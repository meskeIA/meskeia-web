/**
 * API Route: Validación de Teléfono
 * Endpoint: POST /api/validaciones/telefono
 *
 * Valida números de teléfono españoles e internacionales:
 * - Detecta móvil, fijo, números especiales
 * - Soporta formatos con/sin prefijo internacional
 * - Formatea el número correctamente
 *
 * Body: { "telefono": "+34 612 345 678" }
 * Response: { valido: boolean, tipo: string, pais: string, formato_internacional: string, formato_nacional: string }
 */

import { NextRequest, NextResponse } from 'next/server';

// Configuración para edge runtime
export const runtime = 'edge';

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Prefijos de países comunes
const PREFIJOS_PAISES: Record<string, { nombre: string; longitud: number[] }> = {
  '34': { nombre: 'España', longitud: [9] },
  '1': { nombre: 'Estados Unidos/Canadá', longitud: [10] },
  '44': { nombre: 'Reino Unido', longitud: [10, 11] },
  '33': { nombre: 'Francia', longitud: [9] },
  '49': { nombre: 'Alemania', longitud: [10, 11] },
  '39': { nombre: 'Italia', longitud: [9, 10] },
  '351': { nombre: 'Portugal', longitud: [9] },
  '52': { nombre: 'México', longitud: [10] },
  '54': { nombre: 'Argentina', longitud: [10] },
  '56': { nombre: 'Chile', longitud: [9] },
  '57': { nombre: 'Colombia', longitud: [10] },
  '51': { nombre: 'Perú', longitud: [9] },
  '58': { nombre: 'Venezuela', longitud: [10] },
  '593': { nombre: 'Ecuador', longitud: [9] },
  '591': { nombre: 'Bolivia', longitud: [8] },
  '598': { nombre: 'Uruguay', longitud: [8] },
  '595': { nombre: 'Paraguay', longitud: [9] },
  '506': { nombre: 'Costa Rica', longitud: [8] },
  '507': { nombre: 'Panamá', longitud: [8] },
  '502': { nombre: 'Guatemala', longitud: [8] },
  '503': { nombre: 'El Salvador', longitud: [8] },
  '504': { nombre: 'Honduras', longitud: [8] },
  '505': { nombre: 'Nicaragua', longitud: [8] },
  '509': { nombre: 'Haití', longitud: [8] },
  '53': { nombre: 'Cuba', longitud: [8] },
  '1809': { nombre: 'República Dominicana', longitud: [7] },
  '1787': { nombre: 'Puerto Rico', longitud: [7] },
};

// Prefijos de teléfono España
const PREFIJOS_ESPANA = {
  // Móviles
  movil: ['6', '7'],
  // Fijos por provincia (primeros dígitos después del 9)
  fijo: ['9'],
  // Números especiales
  emergencias: ['112'],
  informacion: ['010', '012'],
  atencion_ciudadano: ['060'],
  servicios_sociales: ['016'],
  // Números de tarificación especial
  numeros_900: ['900'], // Gratuitos
  numeros_901: ['901'], // Pago compartido
  numeros_902: ['902'], // Pago usuario
  numeros_803: ['803'], // Adultos
  numeros_806: ['806'], // Entretenimiento
  numeros_807: ['807'], // Profesionales
  numeros_905: ['905'], // Juegos/concursos
};

// Provincias españolas por prefijo
const PROVINCIAS_ESPANA: Record<string, string> = {
  '91': 'Madrid',
  '93': 'Barcelona',
  '94': 'Vizcaya',
  '95': 'Sevilla/Málaga',
  '96': 'Valencia/Alicante',
  '97': 'Baleares/Girona/Lleida/Tarragona',
  '98': 'Asturias/Cantabria/A Coruña/Pontevedra/Lugo/Ourense',
  '92': 'Málaga/Granada/Almería',
  '920': 'Ávila',
  '921': 'Segovia',
  '922': 'Santa Cruz de Tenerife',
  '923': 'Salamanca',
  '924': 'Badajoz',
  '925': 'Toledo',
  '926': 'Ciudad Real',
  '927': 'Cáceres',
  '928': 'Las Palmas',
  '941': 'La Rioja',
  '942': 'Cantabria',
  '943': 'Guipúzcoa',
  '944': 'Vizcaya',
  '945': 'Álava',
  '946': 'Vizcaya',
  '947': 'Burgos',
  '948': 'Navarra',
  '949': 'Guadalajara',
  '950': 'Almería',
  '951': 'Málaga',
  '952': 'Málaga',
  '953': 'Jaén',
  '954': 'Sevilla',
  '955': 'Sevilla',
  '956': 'Cádiz',
  '957': 'Córdoba',
  '958': 'Granada',
  '959': 'Huelva',
  '960': 'Valencia',
  '961': 'Valencia',
  '962': 'Valencia',
  '963': 'Valencia',
  '964': 'Castellón',
  '965': 'Alicante',
  '966': 'Alicante',
  '967': 'Albacete',
  '968': 'Murcia',
  '969': 'Cuenca',
  '971': 'Baleares',
  '972': 'Girona',
  '973': 'Lleida',
  '974': 'Huesca',
  '975': 'Soria',
  '976': 'Zaragoza',
  '977': 'Tarragona',
  '978': 'Teruel',
  '979': 'Palencia',
  '980': 'Zamora',
  '981': 'A Coruña',
  '982': 'Lugo',
  '983': 'Valladolid',
  '984': 'Asturias',
  '985': 'Asturias',
  '986': 'Pontevedra',
  '987': 'León',
  '988': 'Ourense',
};

interface ValidacionResult {
  valido: boolean;
  tipo: 'movil' | 'fijo' | 'especial' | 'tarificacion_especial' | 'emergencias' | 'internacional' | 'desconocido';
  subtipo?: string;
  pais: string;
  codigo_pais: string | null;
  provincia?: string;
  formato_internacional: string | null;
  formato_nacional: string | null;
  formato_e164: string | null;
  longitud_correcta: boolean;
  mensaje: string;
}

/**
 * Limpia un número de teléfono de caracteres no numéricos
 */
function limpiarNumero(telefono: string): { numero: string; tienePrefijo: boolean; prefijo: string | null } {
  // Eliminar espacios, guiones, paréntesis, puntos
  let limpio = telefono.replace(/[\s\-\(\)\.]/g, '');

  // Detectar prefijo internacional
  let tienePrefijo = false;
  let prefijo: string | null = null;

  if (limpio.startsWith('+')) {
    tienePrefijo = true;
    limpio = limpio.substring(1);
  } else if (limpio.startsWith('00')) {
    tienePrefijo = true;
    limpio = limpio.substring(2);
  }

  // Detectar el prefijo de país
  if (tienePrefijo) {
    // Buscar prefijos de 4, 3, 2 y 1 dígitos
    for (const longPrefijo of [4, 3, 2, 1]) {
      const posiblePrefijo = limpio.substring(0, longPrefijo);
      if (PREFIJOS_PAISES[posiblePrefijo]) {
        prefijo = posiblePrefijo;
        limpio = limpio.substring(longPrefijo);
        break;
      }
    }
  }

  return { numero: limpio, tienePrefijo, prefijo };
}

/**
 * Valida un número de teléfono español
 */
function validarTelefonoEspanol(numero: string): ValidacionResult {
  // Verificar longitud (9 dígitos para España)
  if (numero.length !== 9) {
    return {
      valido: false,
      tipo: 'desconocido',
      pais: 'España',
      codigo_pais: '34',
      formato_internacional: null,
      formato_nacional: null,
      formato_e164: null,
      longitud_correcta: false,
      mensaje: `El número debe tener 9 dígitos. Tiene ${numero.length}.`,
    };
  }

  // Verificar que solo contenga dígitos
  if (!/^\d+$/.test(numero)) {
    return {
      valido: false,
      tipo: 'desconocido',
      pais: 'España',
      codigo_pais: '34',
      formato_internacional: null,
      formato_nacional: null,
      formato_e164: null,
      longitud_correcta: false,
      mensaje: 'El número solo puede contener dígitos.',
    };
  }

  const primerDigito = numero[0];
  const primerosTres = numero.substring(0, 3);
  const primerosDos = numero.substring(0, 2);

  // Formatear número
  const formatoNacional = `${numero.substring(0, 3)} ${numero.substring(3, 6)} ${numero.substring(6)}`;
  const formatoInternacional = `+34 ${formatoNacional}`;
  const formatoE164 = `+34${numero}`;

  // Números de emergencia
  if (PREFIJOS_ESPANA.emergencias.includes(primerosTres)) {
    return {
      valido: true,
      tipo: 'emergencias',
      pais: 'España',
      codigo_pais: '34',
      formato_internacional: formatoInternacional,
      formato_nacional: formatoNacional,
      formato_e164: formatoE164,
      longitud_correcta: true,
      mensaje: 'Número de emergencias válido.',
    };
  }

  // Números especiales (010, 012, 060, 016)
  if (PREFIJOS_ESPANA.informacion.includes(primerosTres) ||
      PREFIJOS_ESPANA.atencion_ciudadano.includes(primerosTres) ||
      PREFIJOS_ESPANA.servicios_sociales.includes(primerosTres)) {
    return {
      valido: true,
      tipo: 'especial',
      subtipo: 'informacion',
      pais: 'España',
      codigo_pais: '34',
      formato_internacional: formatoInternacional,
      formato_nacional: formatoNacional,
      formato_e164: formatoE164,
      longitud_correcta: true,
      mensaje: 'Número de información/atención ciudadana válido.',
    };
  }

  // Números de tarificación especial
  if (PREFIJOS_ESPANA.numeros_900.includes(primerosTres)) {
    return {
      valido: true,
      tipo: 'tarificacion_especial',
      subtipo: 'gratuito',
      pais: 'España',
      codigo_pais: '34',
      formato_internacional: formatoInternacional,
      formato_nacional: formatoNacional,
      formato_e164: formatoE164,
      longitud_correcta: true,
      mensaje: 'Número gratuito (900) válido.',
    };
  }

  if (PREFIJOS_ESPANA.numeros_901.includes(primerosTres) ||
      PREFIJOS_ESPANA.numeros_902.includes(primerosTres)) {
    return {
      valido: true,
      tipo: 'tarificacion_especial',
      subtipo: primerosTres === '901' ? 'pago_compartido' : 'pago_usuario',
      pais: 'España',
      codigo_pais: '34',
      formato_internacional: formatoInternacional,
      formato_nacional: formatoNacional,
      formato_e164: formatoE164,
      longitud_correcta: true,
      mensaje: `Número de tarificación especial (${primerosTres}) válido.`,
    };
  }

  if (PREFIJOS_ESPANA.numeros_803.includes(primerosTres) ||
      PREFIJOS_ESPANA.numeros_806.includes(primerosTres) ||
      PREFIJOS_ESPANA.numeros_807.includes(primerosTres) ||
      PREFIJOS_ESPANA.numeros_905.includes(primerosTres)) {
    return {
      valido: true,
      tipo: 'tarificacion_especial',
      subtipo: 'servicios_premium',
      pais: 'España',
      codigo_pais: '34',
      formato_internacional: formatoInternacional,
      formato_nacional: formatoNacional,
      formato_e164: formatoE164,
      longitud_correcta: true,
      mensaje: `Número de servicios premium (${primerosTres}) válido.`,
    };
  }

  // Móvil (empieza por 6 o 7)
  if (PREFIJOS_ESPANA.movil.includes(primerDigito)) {
    return {
      valido: true,
      tipo: 'movil',
      pais: 'España',
      codigo_pais: '34',
      formato_internacional: formatoInternacional,
      formato_nacional: formatoNacional,
      formato_e164: formatoE164,
      longitud_correcta: true,
      mensaje: 'Número de móvil español válido.',
    };
  }

  // Fijo (empieza por 9)
  if (primerDigito === '9') {
    // Buscar provincia
    let provincia: string | undefined;
    if (PROVINCIAS_ESPANA[primerosTres]) {
      provincia = PROVINCIAS_ESPANA[primerosTres];
    } else if (PROVINCIAS_ESPANA[primerosDos]) {
      provincia = PROVINCIAS_ESPANA[primerosDos];
    }

    return {
      valido: true,
      tipo: 'fijo',
      pais: 'España',
      codigo_pais: '34',
      provincia,
      formato_internacional: formatoInternacional,
      formato_nacional: formatoNacional,
      formato_e164: formatoE164,
      longitud_correcta: true,
      mensaje: provincia
        ? `Número fijo de ${provincia} válido.`
        : 'Número fijo español válido.',
    };
  }

  // Número que empieza por 8 (servicios especiales)
  if (primerDigito === '8') {
    return {
      valido: true,
      tipo: 'especial',
      subtipo: 'servicios',
      pais: 'España',
      codigo_pais: '34',
      formato_internacional: formatoInternacional,
      formato_nacional: formatoNacional,
      formato_e164: formatoE164,
      longitud_correcta: true,
      mensaje: 'Número de servicios especiales válido.',
    };
  }

  // Número no reconocido
  return {
    valido: false,
    tipo: 'desconocido',
    pais: 'España',
    codigo_pais: '34',
    formato_internacional: null,
    formato_nacional: null,
    formato_e164: null,
    longitud_correcta: true,
    mensaje: `El prefijo "${primerDigito}" no corresponde a un tipo de número español conocido.`,
  };
}

/**
 * Valida un número de teléfono
 */
function validarTelefono(telefono: string): ValidacionResult {
  const { numero, tienePrefijo, prefijo } = limpiarNumero(telefono);

  // Si no tiene prefijo, asumir España
  if (!tienePrefijo || prefijo === '34') {
    return validarTelefonoEspanol(numero);
  }

  // Número internacional
  if (prefijo && PREFIJOS_PAISES[prefijo]) {
    const infoPais = PREFIJOS_PAISES[prefijo];
    const longitudValida = infoPais.longitud.includes(numero.length);

    const formatoE164 = `+${prefijo}${numero}`;
    const formatoInternacional = `+${prefijo} ${numero}`;

    return {
      valido: longitudValida,
      tipo: 'internacional',
      pais: infoPais.nombre,
      codigo_pais: prefijo,
      formato_internacional: formatoInternacional,
      formato_nacional: numero,
      formato_e164: formatoE164,
      longitud_correcta: longitudValida,
      mensaje: longitudValida
        ? `Número de ${infoPais.nombre} válido.`
        : `El número de ${infoPais.nombre} debería tener ${infoPais.longitud.join(' o ')} dígitos.`,
    };
  }

  // Prefijo no reconocido
  return {
    valido: false,
    tipo: 'desconocido',
    pais: 'Desconocido',
    codigo_pais: prefijo,
    formato_internacional: null,
    formato_nacional: null,
    formato_e164: null,
    longitud_correcta: false,
    mensaje: prefijo
      ? `El prefijo de país "+${prefijo}" no está reconocido.`
      : 'No se pudo identificar el país del número.',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telefono } = body;

    if (!telefono || typeof telefono !== 'string') {
      return NextResponse.json(
        {
          status: 'error',
          mensaje: 'Se requiere el campo "telefono" como string.',
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const resultado = validarTelefono(telefono);

    return NextResponse.json(
      {
        status: 'success',
        ...resultado,
        telefono_original: telefono,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error en /api/validaciones/telefono:', error);
    return NextResponse.json(
      {
        status: 'error',
        mensaje: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
