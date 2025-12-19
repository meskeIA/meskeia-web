/**
 * API Route: Validación de Email
 * Endpoint: POST /api/validaciones/email
 *
 * Valida direcciones de correo electrónico:
 * - Formato según RFC 5322 (simplificado)
 * - Detección de dominios comunes con typos
 * - Sugerencias de corrección
 *
 * Body: { "email": "usuario@ejemplo.com" }
 * Response: { valido: boolean, formato_valido: boolean, dominio: string, sugerencia: string | null }
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

// Dominios comunes para sugerencias de typos
const DOMINIOS_COMUNES: Record<string, string[]> = {
  'gmail.com': ['gmal.com', 'gmial.com', 'gmaill.com', 'gmail.es', 'gmail.co', 'gamil.com', 'gnail.com', 'gmaul.com', 'gmali.com'],
  'hotmail.com': ['hotmal.com', 'hotmial.com', 'hotmail.es', 'hotmall.com', 'hotmai.com', 'hotmil.com', 'hotamail.com'],
  'hotmail.es': ['hotmal.es', 'hotmial.es', 'hotmall.es', 'hotmai.es'],
  'outlook.com': ['outloo.com', 'outlok.com', 'outlook.es', 'outllook.com', 'oulook.com', 'outlookk.com'],
  'outlook.es': ['outloo.es', 'outlok.es', 'outllook.es', 'oulook.es'],
  'yahoo.com': ['yaho.com', 'yahooo.com', 'yahoo.es', 'yahho.com', 'yhaoo.com', 'yaoo.com'],
  'yahoo.es': ['yaho.es', 'yahooo.es', 'yahho.es', 'yhaoo.es'],
  'icloud.com': ['iclod.com', 'iclooud.com', 'icloud.es', 'icould.com', 'iclould.com'],
  'live.com': ['liv.com', 'livee.com', 'live.es', 'lve.com'],
  'protonmail.com': ['protonmal.com', 'protonmail.es', 'protonmial.com', 'protonmeil.com'],
  'telefonica.es': ['telefónica.es', 'telefonica.com', 'telfonica.es'],
  'movistar.es': ['movistar.com', 'moviestar.es', 'movista.es'],
  'orange.es': ['orange.com', 'orance.es', 'orangee.es'],
  'vodafone.es': ['vodafone.com', 'vodaphone.es', 'vodafon.es'],
};

// Dominios de email desechables (temporal emails) - lista parcial
const DOMINIOS_DESECHABLES = [
  'tempmail.com', 'throwaway.com', 'mailinator.com', 'guerrillamail.com',
  'temp-mail.org', '10minutemail.com', 'fakeinbox.com', 'trashmail.com',
  'yopmail.com', 'getnada.com', 'dispostable.com', 'maildrop.cc',
];

// TLDs válidos comunes (no exhaustivo, pero cubre la mayoría)
const TLDS_VALIDOS = [
  'com', 'es', 'org', 'net', 'edu', 'gov', 'info', 'biz', 'co', 'io',
  'me', 'tv', 'cc', 'eu', 'de', 'fr', 'it', 'uk', 'us', 'ca', 'au',
  'jp', 'cn', 'ru', 'br', 'mx', 'ar', 'cl', 'pe', 'co.uk', 'com.es',
  'org.es', 'nom.es', 'gob.es', 'edu.es', 'cat', 'eus', 'gal',
];

interface ValidacionResult {
  valido: boolean;
  formato_valido: boolean;
  dominio: string | null;
  usuario: string | null;
  sugerencia: string | null;
  es_desechable: boolean;
  advertencias: string[];
}

/**
 * Busca si hay un dominio similar al proporcionado
 */
function buscarSugerenciaDominio(dominio: string): string | null {
  const dominioLower = dominio.toLowerCase();

  // Buscar en la lista de typos conocidos
  for (const [dominioCorreto, typos] of Object.entries(DOMINIOS_COMUNES)) {
    if (typos.includes(dominioLower)) {
      return dominioCorreto;
    }
  }

  // Buscar similitud por distancia de Levenshtein simple
  const dominiosComunes = Object.keys(DOMINIOS_COMUNES);
  for (const dominioComun of dominiosComunes) {
    if (calcularSimilitud(dominioLower, dominioComun) >= 0.8) {
      if (dominioLower !== dominioComun) {
        return dominioComun;
      }
    }
  }

  return null;
}

/**
 * Calcula similitud entre dos strings (0-1)
 */
function calcularSimilitud(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1.0;

  const distancia = calcularDistanciaLevenshtein(longer, shorter);
  return (longer.length - distancia) / longer.length;
}

/**
 * Distancia de Levenshtein
 */
function calcularDistanciaLevenshtein(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Valida el formato de un email
 */
function validarEmail(email: string): ValidacionResult {
  const advertencias: string[] = [];

  // Limpiar espacios
  const emailLimpio = email.trim().toLowerCase();

  // Verificar que no esté vacío
  if (!emailLimpio) {
    return {
      valido: false,
      formato_valido: false,
      dominio: null,
      usuario: null,
      sugerencia: null,
      es_desechable: false,
      advertencias: ['El email no puede estar vacío.'],
    };
  }

  // Regex para validación de formato (RFC 5322 simplificado)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(emailLimpio)) {
    // Detectar problemas específicos
    if (!emailLimpio.includes('@')) {
      return {
        valido: false,
        formato_valido: false,
        dominio: null,
        usuario: null,
        sugerencia: null,
        es_desechable: false,
        advertencias: ['Falta el símbolo @ en el email.'],
      };
    }

    const partes = emailLimpio.split('@');
    if (partes.length > 2) {
      return {
        valido: false,
        formato_valido: false,
        dominio: null,
        usuario: null,
        sugerencia: null,
        es_desechable: false,
        advertencias: ['El email contiene más de un símbolo @.'],
      };
    }

    if (partes[0].length === 0) {
      return {
        valido: false,
        formato_valido: false,
        dominio: partes[1] || null,
        usuario: null,
        sugerencia: null,
        es_desechable: false,
        advertencias: ['Falta el nombre de usuario antes del @.'],
      };
    }

    if (partes[1].length === 0) {
      return {
        valido: false,
        formato_valido: false,
        dominio: null,
        usuario: partes[0],
        sugerencia: null,
        es_desechable: false,
        advertencias: ['Falta el dominio después del @.'],
      };
    }

    return {
      valido: false,
      formato_valido: false,
      dominio: partes[1],
      usuario: partes[0],
      sugerencia: null,
      es_desechable: false,
      advertencias: ['El formato del email no es válido.'],
    };
  }

  // Separar usuario y dominio
  const [usuario, dominio] = emailLimpio.split('@');

  // Verificar TLD
  const partesDominio = dominio.split('.');
  const tld = partesDominio.slice(-1)[0];
  const tldCompleto = partesDominio.length >= 2 ? partesDominio.slice(-2).join('.') : tld;

  if (!TLDS_VALIDOS.includes(tld) && !TLDS_VALIDOS.includes(tldCompleto)) {
    advertencias.push(`El TLD ".${tld}" es poco común.`);
  }

  // Verificar si es email desechable
  const esDesechable = DOMINIOS_DESECHABLES.some(d => dominio.includes(d));
  if (esDesechable) {
    advertencias.push('Este dominio parece ser un servicio de email temporal/desechable.');
  }

  // Buscar sugerencia de dominio
  const sugerenciaDominio = buscarSugerenciaDominio(dominio);
  let sugerencia: string | null = null;
  if (sugerenciaDominio) {
    sugerencia = `${usuario}@${sugerenciaDominio}`;
    advertencias.push(`¿Quisiste decir "${sugerenciaDominio}"?`);
  }

  // Advertencias adicionales
  if (usuario.length < 2) {
    advertencias.push('El nombre de usuario es muy corto.');
  }

  if (usuario.startsWith('.') || usuario.endsWith('.')) {
    advertencias.push('El nombre de usuario no debe empezar ni terminar con punto.');
  }

  if (usuario.includes('..')) {
    advertencias.push('El nombre de usuario no debe contener puntos consecutivos.');
  }

  // El email es válido si el formato es correcto
  const formatoValido = emailRegex.test(emailLimpio);
  const valido = formatoValido && !sugerenciaDominio && !esDesechable;

  return {
    valido,
    formato_valido: formatoValido,
    dominio,
    usuario,
    sugerencia,
    es_desechable: esDesechable,
    advertencias,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        {
          status: 'error',
          mensaje: 'Se requiere el campo "email" como string.',
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const resultado = validarEmail(email);

    return NextResponse.json(
      {
        status: 'success',
        ...resultado,
        email_original: email,
        email_normalizado: email.trim().toLowerCase(),
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error en /api/validaciones/email:', error);
    return NextResponse.json(
      {
        status: 'error',
        mensaje: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
