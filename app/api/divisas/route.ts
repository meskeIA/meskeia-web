/**
 * API Route: Tipos de cambio de divisas
 *
 * Fuente: Frankfurter API (api.frankfurter.app)
 * - Gratuita, sin API key, sin registro
 * - Basada en datos del Banco Central Europeo (BCE)
 * - Actualización diaria (días laborables)
 *
 * Cache: 24 horas (Next.js revalidate)
 */

import { NextResponse } from 'next/server';

// Divisas soportadas con sus nombres
const DIVISAS_NOMBRES: Record<string, string> = {
  EUR: 'Euro',
  USD: 'Dólar estadounidense',
  GBP: 'Libra esterlina',
  JPY: 'Yen japonés',
  CHF: 'Franco suizo',
  CAD: 'Dólar canadiense',
  AUD: 'Dólar australiano',
  CNY: 'Yuan chino',
  MXN: 'Peso mexicano',
  BRL: 'Real brasileño',
  ARS: 'Peso argentino',
  CLP: 'Peso chileno',
  COP: 'Peso colombiano',
  PEN: 'Sol peruano',
  SEK: 'Corona sueca',
  NOK: 'Corona noruega',
  DKK: 'Corona danesa',
  PLN: 'Esloti polaco',
  CZK: 'Corona checa',
  HUF: 'Forinto húngaro',
  RON: 'Leu rumano',
  BGN: 'Lev búlgaro',
  HRK: 'Kuna croata',
  TRY: 'Lira turca',
  RUB: 'Rublo ruso',
  INR: 'Rupia india',
  KRW: 'Won surcoreano',
  SGD: 'Dólar de Singapur',
  HKD: 'Dólar de Hong Kong',
  NZD: 'Dólar neozelandés',
  ZAR: 'Rand sudafricano',
  MAD: 'Dírham marroquí',
  EGP: 'Libra egipcia',
  THB: 'Baht tailandés',
  IDR: 'Rupia indonesia',
  MYR: 'Ringgit malayo',
};

// Divisas que Frankfurter soporta (subconjunto del BCE)
const DIVISAS_FRANKFURTER = [
  'EUR', 'USD', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'CNY',
  'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RON', 'BGN',
  'HRK', 'TRY', 'INR', 'KRW', 'SGD', 'HKD', 'NZD', 'ZAR',
  'BRL', 'MXN', 'IDR', 'MYR', 'THB',
];

export async function GET() {
  try {
    // Obtenemos tipos de cambio con base EUR desde Frankfurter
    const respuesta = await fetch('https://api.frankfurter.app/latest?from=EUR', {
      next: { revalidate: 86400 }, // Cache 24 horas
    });

    if (!respuesta.ok) {
      throw new Error(`Error Frankfurter: ${respuesta.status}`);
    }

    const datos = await respuesta.json();

    // Añadimos EUR=1 (base) y filtramos las divisas que tenemos con nombres
    const tasas: Record<string, number> = { EUR: 1, ...datos.rates };

    // Construimos respuesta con nombre de cada divisa
    const divisas = DIVISAS_FRANKFURTER
      .filter(codigo => tasas[codigo] !== undefined)
      .map(codigo => ({
        codigo,
        nombre: DIVISAS_NOMBRES[codigo] || codigo,
        tasa: tasas[codigo],
      }));

    return NextResponse.json({
      base: 'EUR',
      fecha: datos.date,
      divisas,
    });
  } catch (error) {
    console.error('Error al obtener divisas:', error);

    return NextResponse.json(
      { error: 'No se pudieron obtener las tasas de cambio. Inténtalo más tarde.' },
      { status: 503 }
    );
  }
}
