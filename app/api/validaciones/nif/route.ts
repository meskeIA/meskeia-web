/**
 * API Route: Validación de NIF/NIE/CIF españoles
 * Endpoint: POST /api/validaciones/nif
 *
 * Valida documentos de identidad españoles:
 * - NIF (DNI + letra): 8 dígitos + letra
 * - NIE (extranjeros): X/Y/Z + 7 dígitos + letra
 * - CIF (empresas): letra + 7 dígitos + dígito/letra control
 *
 * Body: { "documento": "12345678Z" }
 * Response: { valido: boolean, tipo: string, mensaje: string, documento_formateado: string }
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

// Letras para cálculo de NIF/NIE
const LETRAS_NIF = 'TRWAGMYFPDXBNJZSQVHLCKE';

// Letras válidas para CIF
const LETRAS_CIF_INICIO = 'ABCDEFGHJNPQRSUVW';
const LETRAS_CIF_CONTROL = 'JABCDEFGHI';

interface ValidacionResult {
  valido: boolean;
  tipo: 'NIF' | 'NIE' | 'CIF' | 'DESCONOCIDO';
  mensaje: string;
  documento_formateado: string | null;
  detalles?: {
    letra_esperada?: string;
    letra_recibida?: string;
    tipo_entidad?: string;
  };
}

/**
 * Valida un NIF (DNI español)
 * Formato: 8 dígitos + 1 letra
 */
function validarNIF(documento: string): ValidacionResult {
  const nifRegex = /^(\d{8})([A-Z])$/;
  const match = documento.match(nifRegex);

  if (!match) {
    return {
      valido: false,
      tipo: 'NIF',
      mensaje: 'Formato de NIF inválido. Debe ser 8 dígitos seguidos de una letra.',
      documento_formateado: null,
    };
  }

  const numero = parseInt(match[1], 10);
  const letraRecibida = match[2];
  const letraEsperada = LETRAS_NIF[numero % 23];

  if (letraRecibida !== letraEsperada) {
    return {
      valido: false,
      tipo: 'NIF',
      mensaje: `La letra del NIF es incorrecta. Se esperaba "${letraEsperada}".`,
      documento_formateado: null,
      detalles: {
        letra_esperada: letraEsperada,
        letra_recibida: letraRecibida,
      },
    };
  }

  return {
    valido: true,
    tipo: 'NIF',
    mensaje: 'NIF válido.',
    documento_formateado: `${match[1]}-${letraRecibida}`,
  };
}

/**
 * Valida un NIE (Número de Identidad de Extranjero)
 * Formato: X/Y/Z + 7 dígitos + 1 letra
 */
function validarNIE(documento: string): ValidacionResult {
  const nieRegex = /^([XYZ])(\d{7})([A-Z])$/;
  const match = documento.match(nieRegex);

  if (!match) {
    return {
      valido: false,
      tipo: 'NIE',
      mensaje: 'Formato de NIE inválido. Debe ser X/Y/Z seguido de 7 dígitos y una letra.',
      documento_formateado: null,
    };
  }

  const letraInicio = match[1];
  const numeros = match[2];
  const letraRecibida = match[3];

  // Convertir la letra inicial a número para el cálculo
  const prefijos: Record<string, string> = { X: '0', Y: '1', Z: '2' };
  const numeroCompleto = parseInt(prefijos[letraInicio] + numeros, 10);
  const letraEsperada = LETRAS_NIF[numeroCompleto % 23];

  if (letraRecibida !== letraEsperada) {
    return {
      valido: false,
      tipo: 'NIE',
      mensaje: `La letra del NIE es incorrecta. Se esperaba "${letraEsperada}".`,
      documento_formateado: null,
      detalles: {
        letra_esperada: letraEsperada,
        letra_recibida: letraRecibida,
      },
    };
  }

  return {
    valido: true,
    tipo: 'NIE',
    mensaje: 'NIE válido.',
    documento_formateado: `${letraInicio}-${numeros}-${letraRecibida}`,
  };
}

/**
 * Valida un CIF (Código de Identificación Fiscal)
 * Formato: letra + 7 dígitos + dígito/letra control
 */
function validarCIF(documento: string): ValidacionResult {
  const cifRegex = /^([A-Z])(\d{7})([A-Z0-9])$/;
  const match = documento.match(cifRegex);

  if (!match) {
    return {
      valido: false,
      tipo: 'CIF',
      mensaje: 'Formato de CIF inválido. Debe ser una letra, 7 dígitos y un carácter de control.',
      documento_formateado: null,
    };
  }

  const letraInicio = match[1];
  const numeros = match[2];
  const control = match[3];

  // Verificar que la letra inicial es válida para CIF
  if (!LETRAS_CIF_INICIO.includes(letraInicio)) {
    return {
      valido: false,
      tipo: 'CIF',
      mensaje: `La letra inicial "${letraInicio}" no es válida para un CIF.`,
      documento_formateado: null,
    };
  }

  // Calcular dígito de control
  let sumaPares = 0;
  let sumaImpares = 0;

  for (let i = 0; i < 7; i++) {
    const digito = parseInt(numeros[i], 10);

    if (i % 2 === 0) {
      // Posiciones impares (0, 2, 4, 6) - multiplicar por 2
      const doble = digito * 2;
      sumaImpares += doble > 9 ? doble - 9 : doble;
    } else {
      // Posiciones pares (1, 3, 5)
      sumaPares += digito;
    }
  }

  const sumaTotal = sumaPares + sumaImpares;
  const digitoControl = (10 - (sumaTotal % 10)) % 10;
  const letraControl = LETRAS_CIF_CONTROL[digitoControl];

  // Tipos de entidad que usan letra como control
  const usaLetra = 'KPQRSNW'.includes(letraInicio);
  // Tipos de entidad que usan número como control
  const usaNumero = 'ABEH'.includes(letraInicio);

  let esValido = false;

  if (usaLetra) {
    esValido = control === letraControl;
  } else if (usaNumero) {
    esValido = control === digitoControl.toString();
  } else {
    // Puede ser letra o número
    esValido = control === letraControl || control === digitoControl.toString();
  }

  // Tipos de entidad
  const tiposEntidad: Record<string, string> = {
    A: 'Sociedad Anónima',
    B: 'Sociedad de Responsabilidad Limitada',
    C: 'Sociedad Colectiva',
    D: 'Sociedad Comanditaria',
    E: 'Comunidad de Bienes',
    F: 'Sociedad Cooperativa',
    G: 'Asociación',
    H: 'Comunidad de Propietarios',
    J: 'Sociedad Civil',
    N: 'Entidad Extranjera',
    P: 'Corporación Local',
    Q: 'Organismo Público',
    R: 'Congregación Religiosa',
    S: 'Órgano de la Administración del Estado',
    U: 'Unión Temporal de Empresas',
    V: 'Otros tipos',
    W: 'Establecimiento permanente de entidad no residente',
  };

  if (!esValido) {
    return {
      valido: false,
      tipo: 'CIF',
      mensaje: 'El dígito de control del CIF es incorrecto.',
      documento_formateado: null,
      detalles: {
        tipo_entidad: tiposEntidad[letraInicio] || 'Desconocido',
      },
    };
  }

  return {
    valido: true,
    tipo: 'CIF',
    mensaje: `CIF válido. ${tiposEntidad[letraInicio] || 'Entidad'}.`,
    documento_formateado: `${letraInicio}-${numeros}-${control}`,
    detalles: {
      tipo_entidad: tiposEntidad[letraInicio] || 'Desconocido',
    },
  };
}

/**
 * Detecta el tipo de documento y lo valida
 */
function validarDocumento(documento: string): ValidacionResult {
  // Limpiar y normalizar
  const doc = documento.toUpperCase().replace(/[\s\-\.]/g, '');

  if (!doc || doc.length < 8 || doc.length > 9) {
    return {
      valido: false,
      tipo: 'DESCONOCIDO',
      mensaje: 'El documento debe tener entre 8 y 9 caracteres.',
      documento_formateado: null,
    };
  }

  // Detectar tipo por el primer carácter
  const primerCaracter = doc[0];

  if (/\d/.test(primerCaracter)) {
    // Empieza con número → NIF
    return validarNIF(doc);
  } else if ('XYZ'.includes(primerCaracter)) {
    // Empieza con X, Y o Z → NIE
    return validarNIE(doc);
  } else if (LETRAS_CIF_INICIO.includes(primerCaracter)) {
    // Empieza con letra de CIF → CIF
    return validarCIF(doc);
  } else {
    return {
      valido: false,
      tipo: 'DESCONOCIDO',
      mensaje: `El carácter inicial "${primerCaracter}" no corresponde a ningún tipo de documento español conocido.`,
      documento_formateado: null,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documento } = body;

    if (!documento || typeof documento !== 'string') {
      return NextResponse.json(
        {
          status: 'error',
          mensaje: 'Se requiere el campo "documento" como string.',
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const resultado = validarDocumento(documento);

    return NextResponse.json(
      {
        status: 'success',
        ...resultado,
        documento_original: documento,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error en /api/validaciones/nif:', error);
    return NextResponse.json(
      {
        status: 'error',
        mensaje: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
