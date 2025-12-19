/**
 * API Route: Validación de IBAN
 * Endpoint: POST /api/validaciones/iban
 *
 * Valida códigos IBAN (International Bank Account Number)
 * - Verifica formato por país
 * - Calcula y valida dígitos de control
 * - Extrae información del banco (para IBAN españoles)
 *
 * Body: { "iban": "ES9121000418450200051332" }
 * Response: { valido: boolean, pais: string, banco: string, mensaje: string }
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

// Longitudes de IBAN por país (ISO 13616)
const LONGITUDES_IBAN: Record<string, number> = {
  AD: 24, // Andorra
  AE: 23, // Emiratos Árabes Unidos
  AL: 28, // Albania
  AT: 20, // Austria
  AZ: 28, // Azerbaiyán
  BA: 20, // Bosnia y Herzegovina
  BE: 16, // Bélgica
  BG: 22, // Bulgaria
  BH: 22, // Bahréin
  BR: 29, // Brasil
  BY: 28, // Bielorrusia
  CH: 21, // Suiza
  CR: 22, // Costa Rica
  CY: 28, // Chipre
  CZ: 24, // República Checa
  DE: 22, // Alemania
  DK: 18, // Dinamarca
  DO: 28, // República Dominicana
  EE: 20, // Estonia
  EG: 29, // Egipto
  ES: 24, // España
  FI: 18, // Finlandia
  FO: 18, // Islas Feroe
  FR: 27, // Francia
  GB: 22, // Reino Unido
  GE: 22, // Georgia
  GI: 23, // Gibraltar
  GL: 18, // Groenlandia
  GR: 27, // Grecia
  GT: 28, // Guatemala
  HR: 21, // Croacia
  HU: 28, // Hungría
  IE: 22, // Irlanda
  IL: 23, // Israel
  IQ: 23, // Irak
  IS: 26, // Islandia
  IT: 27, // Italia
  JO: 30, // Jordania
  KW: 30, // Kuwait
  KZ: 20, // Kazajistán
  LB: 28, // Líbano
  LC: 32, // Santa Lucía
  LI: 21, // Liechtenstein
  LT: 20, // Lituania
  LU: 20, // Luxemburgo
  LV: 21, // Letonia
  MC: 27, // Mónaco
  MD: 24, // Moldavia
  ME: 22, // Montenegro
  MK: 19, // Macedonia del Norte
  MR: 27, // Mauritania
  MT: 31, // Malta
  MU: 30, // Mauricio
  NL: 18, // Países Bajos
  NO: 15, // Noruega
  PK: 24, // Pakistán
  PL: 28, // Polonia
  PS: 29, // Palestina
  PT: 25, // Portugal
  QA: 29, // Catar
  RO: 24, // Rumania
  RS: 22, // Serbia
  SA: 24, // Arabia Saudita
  SC: 31, // Seychelles
  SE: 24, // Suecia
  SI: 19, // Eslovenia
  SK: 24, // Eslovaquia
  SM: 27, // San Marino
  ST: 25, // Santo Tomé y Príncipe
  SV: 28, // El Salvador
  TL: 23, // Timor Oriental
  TN: 24, // Túnez
  TR: 26, // Turquía
  UA: 29, // Ucrania
  VA: 22, // Ciudad del Vaticano
  VG: 24, // Islas Vírgenes Británicas
  XK: 20, // Kosovo
};

// Nombres de países
const NOMBRES_PAISES: Record<string, string> = {
  AD: 'Andorra',
  AE: 'Emiratos Árabes Unidos',
  AL: 'Albania',
  AT: 'Austria',
  AZ: 'Azerbaiyán',
  BA: 'Bosnia y Herzegovina',
  BE: 'Bélgica',
  BG: 'Bulgaria',
  BH: 'Bahréin',
  BR: 'Brasil',
  BY: 'Bielorrusia',
  CH: 'Suiza',
  CR: 'Costa Rica',
  CY: 'Chipre',
  CZ: 'República Checa',
  DE: 'Alemania',
  DK: 'Dinamarca',
  DO: 'República Dominicana',
  EE: 'Estonia',
  EG: 'Egipto',
  ES: 'España',
  FI: 'Finlandia',
  FO: 'Islas Feroe',
  FR: 'Francia',
  GB: 'Reino Unido',
  GE: 'Georgia',
  GI: 'Gibraltar',
  GL: 'Groenlandia',
  GR: 'Grecia',
  GT: 'Guatemala',
  HR: 'Croacia',
  HU: 'Hungría',
  IE: 'Irlanda',
  IL: 'Israel',
  IQ: 'Irak',
  IS: 'Islandia',
  IT: 'Italia',
  JO: 'Jordania',
  KW: 'Kuwait',
  KZ: 'Kazajistán',
  LB: 'Líbano',
  LC: 'Santa Lucía',
  LI: 'Liechtenstein',
  LT: 'Lituania',
  LU: 'Luxemburgo',
  LV: 'Letonia',
  MC: 'Mónaco',
  MD: 'Moldavia',
  ME: 'Montenegro',
  MK: 'Macedonia del Norte',
  MR: 'Mauritania',
  MT: 'Malta',
  MU: 'Mauricio',
  NL: 'Países Bajos',
  NO: 'Noruega',
  PK: 'Pakistán',
  PL: 'Polonia',
  PS: 'Palestina',
  PT: 'Portugal',
  QA: 'Catar',
  RO: 'Rumania',
  RS: 'Serbia',
  SA: 'Arabia Saudita',
  SC: 'Seychelles',
  SE: 'Suecia',
  SI: 'Eslovenia',
  SK: 'Eslovaquia',
  SM: 'San Marino',
  ST: 'Santo Tomé y Príncipe',
  SV: 'El Salvador',
  TL: 'Timor Oriental',
  TN: 'Túnez',
  TR: 'Turquía',
  UA: 'Ucrania',
  VA: 'Ciudad del Vaticano',
  VG: 'Islas Vírgenes Británicas',
  XK: 'Kosovo',
};

// Bancos españoles (primeros 4 dígitos del código de entidad)
const BANCOS_ESPANOLES: Record<string, string> = {
  '0049': 'Banco Santander',
  '0075': 'Banco Popular (ahora Santander)',
  '0081': 'Banco Sabadell',
  '0128': 'Bankinter',
  '0182': 'BBVA',
  '2038': 'Bankia (ahora CaixaBank)',
  '2100': 'CaixaBank',
  '0030': 'Banco Español de Crédito (Banesto)',
  '0019': 'Deutsche Bank',
  '0073': 'Open Bank (Santander)',
  '0061': 'Banca March',
  '0065': 'Barclays Bank',
  '0131': 'Banco Espirito Santo',
  '0136': 'Aresbank',
  '0138': 'Bankoa',
  '0151': 'BBVA Privanza Banco',
  '0154': 'Banco de Crédito Social Cooperativo',
  '0155': 'Banco do Brasil',
  '0156': 'Banco Cetelem',
  '0159': 'Commerzbank',
  '0162': 'Crédit Lyonnais',
  '0167': 'Banco Mediolanum',
  '0169': 'Banco de la Nación Argentina',
  '0182': 'BBVA',
  '0186': 'Banco de Finanzas e Inversiones (Fibanc)',
  '0188': 'Banco Alcalá',
  '0198': 'Banco Cooperativo Español',
  '0211': 'EBN Banco de Negocios',
  '0216': 'Targobank (antes Banco Popular Hipotecario)',
  '0219': 'Banesco',
  '0220': 'Banco Finantia Sofinloc',
  '0224': 'Santander Consumer Finance',
  '0225': 'Banco Cetelem',
  '0229': 'Wizink Bank (antes Bancopopular-e)',
  '0232': 'Banco Inversis',
  '0233': 'Banca Pueyo',
  '0234': 'Banco Caminos',
  '0235': 'Banco Pichincha España',
  '0236': 'Banco EVO (ahora EVO Banco)',
  '0237': 'Cajasur Banco',
  '0238': 'Nuevo Micro Bank',
  '0239': 'EVO Banco',
  '0240': 'Banco Finantia',
  '0241': 'ING Direct (ING)',
  '1465': 'ING Direct (ING)',
  '1491': 'Triodos Bank',
  '2000': 'CECABANK',
  '2013': 'Catalana Occidente',
  '2024': 'Caja de Arquitectos',
  '2031': 'Caja de Ingenieros',
  '2045': 'Caixa Ontinyent',
  '2048': 'Liberbank (ahora Unicaja)',
  '2056': 'Colonya Caixa Pollença',
  '2080': 'Abanca',
  '2085': 'Ibercaja',
  '2095': 'Kutxabank',
  '2096': 'Caja España Duero (ahora Unicaja)',
  '2103': 'Unicaja',
  '3001': 'Caja Rural de Almendralejo',
  '3007': 'Caja Rural de Aragón',
  '3008': 'Caja Rural de Asturias',
  '3017': 'Caja Rural de Burgos',
  '3020': 'Caja Rural de Castilla-La Mancha',
  '3023': 'Caja Rural de Granada',
  '3025': 'Caixa Rural Galega',
  '3029': 'Caja Rural de Jaén',
  '3035': 'Caja Laboral Popular (Kutxa)',
  '3058': 'Cajamar',
  '3059': 'Caja Rural de Navarra',
  '3060': 'Caja Rural de Salamanca',
  '3067': 'Caja Rural del Sur',
  '3070': 'Caja Rural de Soria',
  '3076': 'Globalcaja',
  '3080': 'Caja Rural de Teruel',
  '3081': 'Caja Rural de Toledo',
  '3085': 'Caja Rural de Zamora',
  '3089': 'Caja Rural de Extremadura',
  '3096': 'Caja Rural de Albacete',
  '3104': 'Caixa Popular',
  '3112': 'Ruralvía (Grupo Cajas Rurales)',
  '3121': 'Caja Rural de Gijón',
  '3127': 'Caja Rural de Utrera',
  '3130': 'Caja Rural de Villamalea',
  '3140': 'Caja de Crédito de Petrel',
  '3159': 'Caixa Rural de Callosa d\'En Sarrià',
  '3162': 'Caja Rural de Cheste',
  '3166': 'Caja Rural de Turis',
  '3174': 'Eurobank (Grecia en España)',
  '3179': 'Arquia (Caja de Arquitectos)',
  '3183': 'Caja Rural de Guissona',
  '3186': 'Caixa Benicarló',
  '3187': 'Caja Rural de Alginet',
  '3190': 'Caixa Rural Vila-real',
  '3191': 'Caixa Rural Torrent',
};

interface ValidacionResult {
  valido: boolean;
  pais: string | null;
  codigo_pais: string | null;
  banco: string | null;
  codigo_banco: string | null;
  mensaje: string;
  iban_formateado: string | null;
  detalles?: {
    digitos_control: string;
    codigo_entidad?: string;
    codigo_oficina?: string;
    digitos_control_cuenta?: string;
    numero_cuenta?: string;
  };
}

/**
 * Convierte letras a números para el cálculo del módulo 97
 * A=10, B=11, ..., Z=35
 */
function letraANumero(letra: string): string {
  const codigo = letra.charCodeAt(0);
  if (codigo >= 65 && codigo <= 90) {
    return (codigo - 55).toString();
  }
  return letra;
}

/**
 * Calcula el módulo 97 para un número grande (como string)
 */
function modulo97(numStr: string): number {
  let resto = 0;
  for (let i = 0; i < numStr.length; i++) {
    resto = (resto * 10 + parseInt(numStr[i], 10)) % 97;
  }
  return resto;
}

/**
 * Valida un IBAN
 */
function validarIBAN(iban: string): ValidacionResult {
  // Limpiar y normalizar
  const ibanLimpio = iban.toUpperCase().replace(/[\s\-]/g, '');

  // Verificar que solo contiene letras y números
  if (!/^[A-Z0-9]+$/.test(ibanLimpio)) {
    return {
      valido: false,
      pais: null,
      codigo_pais: null,
      banco: null,
      codigo_banco: null,
      mensaje: 'El IBAN solo puede contener letras y números.',
      iban_formateado: null,
    };
  }

  // Extraer código de país (primeros 2 caracteres)
  const codigoPais = ibanLimpio.substring(0, 2);

  // Verificar que el código de país son letras
  if (!/^[A-Z]{2}$/.test(codigoPais)) {
    return {
      valido: false,
      pais: null,
      codigo_pais: null,
      banco: null,
      codigo_banco: null,
      mensaje: 'El IBAN debe comenzar con un código de país de 2 letras.',
      iban_formateado: null,
    };
  }

  // Verificar si el país está soportado
  const longitudEsperada = LONGITUDES_IBAN[codigoPais];
  if (!longitudEsperada) {
    return {
      valido: false,
      pais: null,
      codigo_pais: codigoPais,
      banco: null,
      codigo_banco: null,
      mensaje: `El código de país "${codigoPais}" no es un país IBAN reconocido.`,
      iban_formateado: null,
    };
  }

  // Verificar longitud
  if (ibanLimpio.length !== longitudEsperada) {
    return {
      valido: false,
      pais: NOMBRES_PAISES[codigoPais] || codigoPais,
      codigo_pais: codigoPais,
      banco: null,
      codigo_banco: null,
      mensaje: `El IBAN de ${NOMBRES_PAISES[codigoPais] || codigoPais} debe tener ${longitudEsperada} caracteres. Recibido: ${ibanLimpio.length}.`,
      iban_formateado: null,
    };
  }

  // Extraer dígitos de control (posiciones 3-4)
  const digitosControl = ibanLimpio.substring(2, 4);
  if (!/^\d{2}$/.test(digitosControl)) {
    return {
      valido: false,
      pais: NOMBRES_PAISES[codigoPais] || codigoPais,
      codigo_pais: codigoPais,
      banco: null,
      codigo_banco: null,
      mensaje: 'Las posiciones 3 y 4 deben ser los dígitos de control (00-99).',
      iban_formateado: null,
    };
  }

  // Reorganizar para validación: mover 4 primeros caracteres al final
  const ibanReorganizado = ibanLimpio.substring(4) + ibanLimpio.substring(0, 4);

  // Convertir letras a números
  let ibanNumerico = '';
  for (const char of ibanReorganizado) {
    ibanNumerico += letraANumero(char);
  }

  // Calcular módulo 97
  const resto = modulo97(ibanNumerico);

  if (resto !== 1) {
    return {
      valido: false,
      pais: NOMBRES_PAISES[codigoPais] || codigoPais,
      codigo_pais: codigoPais,
      banco: null,
      codigo_banco: null,
      mensaje: 'Los dígitos de control del IBAN son incorrectos.',
      iban_formateado: null,
      detalles: {
        digitos_control: digitosControl,
      },
    };
  }

  // IBAN válido - extraer información adicional
  const bban = ibanLimpio.substring(4);

  // Formatear IBAN en grupos de 4
  const ibanFormateado = ibanLimpio.match(/.{1,4}/g)?.join(' ') || ibanLimpio;

  // Información específica para España
  let banco: string | null = null;
  let codigoBanco: string | null = null;
  let detalles: ValidacionResult['detalles'] = {
    digitos_control: digitosControl,
  };

  if (codigoPais === 'ES') {
    // Estructura IBAN España: ES + 2 DC + 4 entidad + 4 oficina + 2 DC cuenta + 10 cuenta
    codigoBanco = bban.substring(0, 4);
    const codigoOficina = bban.substring(4, 8);
    const dcCuenta = bban.substring(8, 10);
    const numeroCuenta = bban.substring(10);

    banco = BANCOS_ESPANOLES[codigoBanco] || null;

    detalles = {
      digitos_control: digitosControl,
      codigo_entidad: codigoBanco,
      codigo_oficina: codigoOficina,
      digitos_control_cuenta: dcCuenta,
      numero_cuenta: numeroCuenta,
    };
  }

  return {
    valido: true,
    pais: NOMBRES_PAISES[codigoPais] || codigoPais,
    codigo_pais: codigoPais,
    banco: banco,
    codigo_banco: codigoBanco,
    mensaje: `IBAN válido de ${NOMBRES_PAISES[codigoPais] || codigoPais}${banco ? ` - ${banco}` : ''}.`,
    iban_formateado: ibanFormateado,
    detalles,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { iban } = body;

    if (!iban || typeof iban !== 'string') {
      return NextResponse.json(
        {
          status: 'error',
          mensaje: 'Se requiere el campo "iban" como string.',
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const resultado = validarIBAN(iban);

    return NextResponse.json(
      {
        status: 'success',
        ...resultado,
        iban_original: iban,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error en /api/validaciones/iban:', error);
    return NextResponse.json(
      {
        status: 'error',
        mensaje: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
