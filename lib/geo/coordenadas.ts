/**
 * Conversión de coordenadas geográficas — lógica pura sin React ni DOM
 * Usada por: app/conversor-coordenadas
 *
 * Convierte entre los formatos con los que la gente se encuentra de verdad:
 *
 *   DD    grados decimales            40,416775  ·  -3,703790
 *   DMS   grados, minutos, segundos   40°25'00,4"N  3°42'13,6"O
 *   DDM   grados y minutos decimales  40°25,006'N  3°42,227'O   (náutica y aviación)
 *   UTM   proyección transversa       30 T 440252 4474202
 *   MGRS  cuadrícula militar          30T VK 40252 74202        (montaña y rescate)
 *
 * ELIPSOIDE: WGS84. Para España, ETRS89 (el datum oficial desde el RD 1071/2007)
 * es compatible con WGS84 a efectos prácticos: la diferencia entre ambos es
 * centimétrica y queda muy por debajo de la precisión de cualquier GPS de consumo.
 *
 * LO QUE NO HACE, dicho en vez de aproximado: NO transforma desde ED50, el datum
 * de la cartografía española anterior a 2007. Esa transformación necesita los siete
 * parámetros de Helmert oficiales del IGN, y aplicarla con parámetros aproximados
 * introduciría un error mayor que no hacerla. Confundir ED50 con ETRS89 desplaza
 * el punto unos 200 m en la Península, así que conviene comprobar el datum de
 * origen antes de convertir.
 *
 * La proyección UTM usa las series de Krüger de sexto orden (Karney, 2011), con
 * error submilimétrico dentro de la zona. La distancia y el rumbo usan la fórmula
 * inversa de Vincenty sobre el elipsoide, con caída a la del semiverseno en los
 * casos antipodales donde Vincenty no converge.
 *
 * Fuentes:
 *   - Krüger/Karney: "Transverse Mercator with an accuracy of a few nanometers" (J. Geodesy 85, 2011)
 *   - Vincenty: "Direct and inverse solutions of geodesics on the ellipsoid" (Survey Review 23, 1975)
 *   - ETRS89 como sistema oficial en España: RD 1071/2007
 */

// ─── Elipsoide WGS84 ───────────────────────────────────────────────────────────

const A_WGS84 = 6378137;                 // semieje mayor (m)
const F_WGS84 = 1 / 298.257223563;       // achatamiento
const B_WGS84 = A_WGS84 * (1 - F_WGS84); // semieje menor (m)
const K0 = 0.9996;                       // factor de escala UTM en el meridiano central
const FALSO_ESTE = 500e3;
const FALSO_NORTE = 10000e3;             // solo hemisferio sur

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type Hemisferio = 'N' | 'S';

export interface PuntoGeografico {
  /** Latitud en grados decimales (positiva al norte) */
  latitud: number;
  /** Longitud en grados decimales (positiva al este) */
  longitud: number;
}

export interface CoordenadaUTM {
  zona: number;
  /** Banda de latitud MGRS (C..X, sin I ni O) */
  banda: string;
  hemisferio: Hemisferio;
  este: number;
  norte: number;
}

export interface ComponentesSexagesimales {
  grados: number;
  minutos: number;
  segundos: number;
  /** N/S para latitud, E/O para longitud */
  hemisferio: string;
}

export interface ResultadoDistancia {
  /** Distancia sobre el elipsoide (m) */
  distancia: number;
  /** Rumbo inicial desde el punto 1 hacia el punto 2 (grados, 0 = norte) */
  rumboInicial: number;
  /** Rumbo de llegada al punto 2 (grados) */
  rumboFinal: number;
  /** Método realmente empleado */
  metodo: 'vincenty' | 'semiverseno';
}

// ─── Utilidades ────────────────────────────────────────────────────────────────

const gradosARadianes = (g: number) => (g * Math.PI) / 180;
const radianesAGrados = (r: number) => (r * 180) / Math.PI;

/** Normaliza una longitud al intervalo [-180, 180) */
export function normalizarLongitud(longitud: number): number {
  return ((((longitud + 180) % 360) + 360) % 360) - 180;
}

export function esLatitudValida(latitud: number): boolean {
  return Number.isFinite(latitud) && latitud >= -90 && latitud <= 90;
}

export function esLongitudValida(longitud: number): boolean {
  return Number.isFinite(longitud) && longitud >= -180 && longitud <= 180;
}

// ─── Grados decimales ↔ sexagesimales ──────────────────────────────────────────

/**
 * Descompone un valor decimal en grados, minutos y segundos.
 * El redondeo se hace ANTES de repartir, para que 59,9999" no se quede en 60".
 */
export function aSexagesimal(valor: number, tipo: 'lat' | 'lon', decimalesSegundo = 2): ComponentesSexagesimales {
  const hemisferio = tipo === 'lat' ? (valor < 0 ? 'S' : 'N') : valor < 0 ? 'O' : 'E';
  const absoluto = Math.abs(valor);

  const factor = Math.pow(10, decimalesSegundo);
  let segundosTotales = Math.round(absoluto * 3600 * factor) / factor;

  let grados = Math.floor(segundosTotales / 3600);
  segundosTotales -= grados * 3600;
  let minutos = Math.floor(segundosTotales / 60);
  let segundos = Math.round((segundosTotales - minutos * 60) * factor) / factor;

  // Arrastre por redondeo (59,999" → 60,000")
  if (segundos >= 60) { segundos -= 60; minutos += 1; }
  if (minutos >= 60) { minutos -= 60; grados += 1; }

  return { grados, minutos, segundos, hemisferio };
}

/** Grados y minutos decimales: el formato de las cartas náuticas y del plan de vuelo */
export function aGradosMinutosDecimales(valor: number, tipo: 'lat' | 'lon', decimalesMinuto = 3): { grados: number; minutos: number; hemisferio: string } {
  const hemisferio = tipo === 'lat' ? (valor < 0 ? 'S' : 'N') : valor < 0 ? 'O' : 'E';
  const absoluto = Math.abs(valor);

  const factor = Math.pow(10, decimalesMinuto);
  let minutosTotales = Math.round(absoluto * 60 * factor) / factor;
  let grados = Math.floor(minutosTotales / 60);
  let minutos = Math.round((minutosTotales - grados * 60) * factor) / factor;

  if (minutos >= 60) { minutos -= 60; grados += 1; }

  return { grados, minutos, hemisferio };
}

/** Recompone grados decimales a partir de sus componentes sexagesimales */
export function desdeSexagesimal(grados: number, minutos: number, segundos: number, hemisferio: string): number {
  const signo = /[SO W]/i.test(hemisferio.trim()) ? -1 : 1;
  return signo * (Math.abs(grados) + minutos / 60 + segundos / 3600);
}

// ─── Zona UTM ──────────────────────────────────────────────────────────────────

/**
 * Zona UTM de una longitud, con las dos excepciones del estándar:
 * el suroeste de Noruega (zona 32 ensanchada) y Svalbard (zonas 31/33/35/37).
 * Sin ellas, un punto en Bergen o en Longyearbyen sale en la zona equivocada.
 */
export function calcularZonaUTM(latitud: number, longitud: number): number {
  const lon = normalizarLongitud(longitud);
  let zona = Math.floor((lon + 180) / 6) + 1;

  // Suroeste de Noruega: la zona 32 se ensancha hacia el oeste
  if (latitud >= 56 && latitud < 64 && lon >= 3 && lon < 12) return 32;

  // Svalbard: solo zonas impares, ensanchadas
  if (latitud >= 72 && latitud < 84) {
    if (lon >= 0 && lon < 9) zona = 31;
    else if (lon >= 9 && lon < 21) zona = 33;
    else if (lon >= 21 && lon < 33) zona = 35;
    else if (lon >= 33 && lon < 42) zona = 37;
  }

  return zona;
}

const BANDAS_LATITUD = 'CDEFGHJKLMNPQRSTUVWX';

/** Banda de latitud MGRS. Cada banda cubre 8°, salvo la X que cubre 12° (72°N a 84°N) */
export function calcularBandaLatitud(latitud: number): string {
  if (latitud < -80 || latitud > 84) return '';
  if (latitud >= 72) return 'X';
  return BANDAS_LATITUD.charAt(Math.floor((latitud + 80) / 8));
}

// ─── Coeficientes de Krüger (sexto orden) ─────────────────────────────────────

const n = F_WGS84 / (2 - F_WGS84);
const n2 = n * n, n3 = n2 * n, n4 = n3 * n, n5 = n4 * n, n6 = n5 * n;

/** Radio meridional rectificante */
const A_RECT = (A_WGS84 / (1 + n)) * (1 + n2 / 4 + n4 / 64 + n6 / 256);

// Directos: geodésicas → proyección
const ALFA = [
  null,
  1 / 2 * n - 2 / 3 * n2 + 5 / 16 * n3 + 41 / 180 * n4 - 127 / 288 * n5 + 7891 / 37800 * n6,
  13 / 48 * n2 - 3 / 5 * n3 + 557 / 1440 * n4 + 281 / 630 * n5 - 1983433 / 1935360 * n6,
  61 / 240 * n3 - 103 / 140 * n4 + 15061 / 26880 * n5 + 167603 / 181440 * n6,
  49561 / 161280 * n4 - 179 / 168 * n5 + 6601661 / 7257600 * n6,
  34729 / 80640 * n5 - 3418889 / 1995840 * n6,
  212378941 / 319334400 * n6,
] as const;

// Inversos: proyección → geodésicas
const BETA = [
  null,
  1 / 2 * n - 2 / 3 * n2 + 37 / 96 * n3 - 1 / 360 * n4 - 81 / 512 * n5 + 96199 / 604800 * n6,
  1 / 48 * n2 + 1 / 15 * n3 - 437 / 1440 * n4 + 46 / 105 * n5 - 1118711 / 3870720 * n6,
  17 / 480 * n3 - 37 / 840 * n4 - 209 / 4480 * n5 + 5569 / 90720 * n6,
  4397 / 161280 * n4 - 11 / 504 * n5 - 830251 / 7257600 * n6,
  4583 / 161280 * n5 - 108847 / 3991680 * n6,
  20648693 / 638668800 * n6,
] as const;

// ─── Geodésicas → UTM ──────────────────────────────────────────────────────────

export function aUTM(punto: PuntoGeografico, zonaForzada?: number): CoordenadaUTM {
  const { latitud } = punto;
  const longitud = normalizarLongitud(punto.longitud);

  if (latitud < -80 || latitud > 84) {
    throw new Error('La proyección UTM solo cubre de 80°S a 84°N. Fuera de esa franja se usan las cuadrículas polares UPS.');
  }

  const zona = zonaForzada ?? calcularZonaUTM(latitud, longitud);
  const lon0 = gradosARadianes((zona - 1) * 6 - 180 + 3); // meridiano central de la zona

  const phi = gradosARadianes(latitud);
  const lambda = gradosARadianes(longitud) - lon0;

  const cosLambda = Math.cos(lambda), sinLambda = Math.sin(lambda);
  const e = Math.sqrt(F_WGS84 * (2 - F_WGS84));

  const tau = Math.tan(phi);
  const sigma = Math.sinh(e * Math.atanh((e * tau) / Math.sqrt(1 + tau * tau)));
  const tauPrima = tau * Math.sqrt(1 + sigma * sigma) - sigma * Math.sqrt(1 + tau * tau);

  const xiPrima = Math.atan2(tauPrima, cosLambda);
  const etaPrima = Math.asinh(sinLambda / Math.sqrt(tauPrima * tauPrima + cosLambda * cosLambda));

  let xi = xiPrima;
  let eta = etaPrima;
  for (let j = 1; j <= 6; j++) {
    xi += (ALFA[j] as number) * Math.sin(2 * j * xiPrima) * Math.cosh(2 * j * etaPrima);
    eta += (ALFA[j] as number) * Math.cos(2 * j * xiPrima) * Math.sinh(2 * j * etaPrima);
  }

  const este = K0 * A_RECT * eta + FALSO_ESTE;
  let norte = K0 * A_RECT * xi;

  const hemisferio: Hemisferio = latitud >= 0 ? 'N' : 'S';
  if (hemisferio === 'S') norte += FALSO_NORTE;

  // Sin redondear: el redondeo es cosa de la presentación. Redondear aquí limitaría
  // la precisión de la ida y vuelta y de cualquier cálculo encadenado.
  return { zona, banda: calcularBandaLatitud(latitud), hemisferio, este, norte };
}

// ─── UTM → geodésicas ──────────────────────────────────────────────────────────

export function desdeUTM(utm: CoordenadaUTM): PuntoGeografico {
  const { zona, hemisferio } = utm;
  if (!Number.isInteger(zona) || zona < 1 || zona > 60) {
    throw new Error('La zona UTM debe ser un número entero entre 1 y 60.');
  }

  const x = utm.este - FALSO_ESTE;
  const y = hemisferio === 'S' ? utm.norte - FALSO_NORTE : utm.norte;

  const e = Math.sqrt(F_WGS84 * (2 - F_WGS84));
  const eta = x / (K0 * A_RECT);
  const xi = y / (K0 * A_RECT);

  let xiPrima = xi;
  let etaPrima = eta;
  for (let j = 1; j <= 6; j++) {
    xiPrima -= (BETA[j] as number) * Math.sin(2 * j * xi) * Math.cosh(2 * j * eta);
    etaPrima -= (BETA[j] as number) * Math.cos(2 * j * xi) * Math.sinh(2 * j * eta);
  }

  const sinhEta = Math.sinh(etaPrima);
  const sinXi = Math.sin(xiPrima), cosXi = Math.cos(xiPrima);
  const tauPrima = sinXi / Math.sqrt(sinhEta * sinhEta + cosXi * cosXi);

  // Newton-Raphson sobre τ: converge en 2-3 vueltas
  let tau = tauPrima;
  for (let i = 0; i < 100; i++) {
    const sigma = Math.sinh(e * Math.atanh((e * tau) / Math.sqrt(1 + tau * tau)));
    const tauAprox = tau * Math.sqrt(1 + sigma * sigma) - sigma * Math.sqrt(1 + tau * tau);
    const delta =
      ((tauPrima - tauAprox) / Math.sqrt(1 + tauAprox * tauAprox)) *
      ((1 + (1 - F_WGS84 * (2 - F_WGS84)) * tau * tau) /
        ((1 - F_WGS84 * (2 - F_WGS84)) * Math.sqrt(1 + tau * tau)));
    tau += delta;
    if (Math.abs(delta) < 1e-12) break;
  }

  const lon0 = gradosARadianes((zona - 1) * 6 - 180 + 3);
  const latitud = radianesAGrados(Math.atan(tau));
  const longitud = radianesAGrados(Math.atan2(sinhEta, cosXi) + lon0);

  return { latitud, longitud: normalizarLongitud(longitud) };
}

// ─── MGRS ──────────────────────────────────────────────────────────────────────

// Sin I ni O: se confunden con 1 y 0 al dictarlas por radio
const COLUMNAS_100K = ['ABCDEFGH', 'JKLMNPQR', 'STUVWXYZ'];
const FILAS_100K = ['ABCDEFGHJKLMNPQRSTUV', 'FGHJKLMNPQRSTUVABCDE'];

/**
 * Referencia MGRS a partir de una coordenada UTM.
 * @param digitos precisión por eje: 5 = 1 m, 4 = 10 m, 3 = 100 m, 2 = 1 km
 */
export function aMGRS(utm: CoordenadaUTM, digitos: 1 | 2 | 3 | 4 | 5 = 5): string {
  if (!utm.banda) throw new Error('MGRS no cubre las regiones polares (fuera de 80°S a 84°N).');

  const columna = Math.floor(utm.este / 100000);
  const letraColumna = COLUMNAS_100K[(utm.zona - 1) % 3].charAt(columna - 1);

  const fila = Math.floor(utm.norte / 100000) % 20;
  const letraFila = FILAS_100K[(utm.zona - 1) % 2].charAt(fila);

  const divisor = Math.pow(10, 5 - digitos);
  const este = Math.floor((utm.este % 100000) / divisor);
  const norte = Math.floor((utm.norte % 100000) / divisor);

  const pad = (v: number) => String(v).padStart(digitos, '0');
  return `${utm.zona}${utm.banda} ${letraColumna}${letraFila} ${pad(este)} ${pad(norte)}`;
}

/** Interpreta una referencia MGRS y devuelve su UTM equivalente (esquina suroeste del cuadro) */
export function desdeMGRS(mgrs: string): CoordenadaUTM {
  const limpio = mgrs.toUpperCase().replace(/\s+/g, '');
  const m = limpio.match(/^(\d{1,2})([C-HJ-NP-X])([A-HJ-NP-Z])([A-HJ-NP-V])(\d*)$/);
  if (!m) throw new Error('Referencia MGRS no reconocida. Formato esperado: 30T VK 40252 74202');

  const zona = parseInt(m[1], 10);
  const banda = m[2];
  const letraColumna = m[3];
  const letraFila = m[4];
  const digitos = m[5];

  if (zona < 1 || zona > 60) throw new Error('La zona MGRS debe estar entre 1 y 60.');
  if (digitos.length % 2 !== 0) throw new Error('La parte numérica del MGRS debe tener un número par de dígitos (2, 4, 6, 8 o 10).');

  const indiceColumna = COLUMNAS_100K[(zona - 1) % 3].indexOf(letraColumna);
  if (indiceColumna < 0) throw new Error(`La letra de columna "${letraColumna}" no existe en la zona ${zona}.`);
  const indiceFila = FILAS_100K[(zona - 1) % 2].indexOf(letraFila);
  if (indiceFila < 0) throw new Error(`La letra de fila "${letraFila}" no es válida en la zona ${zona}.`);

  const este100k = (indiceColumna + 1) * 100000;
  const norte100k = indiceFila * 100000;

  const mitad = digitos.length / 2;
  const factor = mitad > 0 ? Math.pow(10, 5 - mitad) : 0;
  const esteResto = mitad > 0 ? parseInt(digitos.slice(0, mitad), 10) * factor : 0;
  const norteResto = mitad > 0 ? parseInt(digitos.slice(mitad), 10) * factor : 0;

  // El norte del MGRS solo guarda el resto de dividir entre 2.000 km, así que hay
  // varios nortes posibles. El que vale es el que cae dentro de la banda de latitud
  // declarada: por eso la banda no es decorativa, es lo que deshace la ambigüedad.
  // Ojo con el sur, donde el norte UTM ya lleva incorporado el falso norte de
  // 10.000 km: sumárselo otra vez desplazaba el punto 6.000 km.
  const hemisferio: Hemisferio = banda >= 'N' ? 'N' : 'S';
  const este = este100k + esteResto;
  const norteBase = norte100k + norteResto;

  const indiceBanda = BANDAS_LATITUD.indexOf(banda);
  const latitudMinima = indiceBanda * 8 - 80;
  const latitudMaxima = banda === 'X' ? 84 : latitudMinima + 8;
  const centroBanda = (latitudMinima + latitudMaxima) / 2;

  let mejorNorte = hemisferio === 'S' ? norteBase + FALSO_NORTE - 2000000 * 5 : norteBase;
  let mejorDistancia = Infinity;

  for (let ciclo = 0; ciclo <= 5; ciclo++) {
    const candidato = norteBase + ciclo * 2000000;
    if (candidato > FALSO_NORTE) break;
    try {
      const { latitud } = desdeUTM({ zona, banda, hemisferio, este, norte: candidato });
      // Dentro de la banda declarada: es el candidato bueno, no hace falta seguir
      if (latitud >= latitudMinima && latitud < latitudMaxima) {
        return { zona, banda, hemisferio, este, norte: candidato };
      }
      const distancia = Math.abs(latitud - centroBanda);
      if (distancia < mejorDistancia) { mejorDistancia = distancia; mejorNorte = candidato; }
    } catch {
      // Candidato fuera del dominio de la proyección: se descarta
    }
  }

  return { zona, banda, hemisferio, este, norte: mejorNorte };
}

// ─── Distancia y rumbo sobre el elipsoide ─────────────────────────────────────

/**
 * Fórmula inversa de Vincenty: distancia y rumbos entre dos puntos sobre el
 * elipsoide, con precisión milimétrica. En puntos casi antipodales no converge,
 * y ahí se cae a la del semiverseno sobre una esfera de radio medio, que da un
 * error del orden del 0,5 % pero siempre da un resultado.
 */
export function distanciaYRumbo(p1: PuntoGeografico, p2: PuntoGeografico): ResultadoDistancia {
  const phi1 = gradosARadianes(p1.latitud);
  const phi2 = gradosARadianes(p2.latitud);
  const L = gradosARadianes(normalizarLongitud(p2.longitud - p1.longitud));

  const U1 = Math.atan((1 - F_WGS84) * Math.tan(phi1));
  const U2 = Math.atan((1 - F_WGS84) * Math.tan(phi2));
  const sinU1 = Math.sin(U1), cosU1 = Math.cos(U1);
  const sinU2 = Math.sin(U2), cosU2 = Math.cos(U2);

  let lambda = L, lambdaAnterior = 0, iteraciones = 0;
  let sinSigma = 0, cosSigma = 0, sigma = 0, sinAlfa = 0, cos2Alfa = 0, cos2SigmaM = 0;

  do {
    const sinLambda = Math.sin(lambda), cosLambda = Math.cos(lambda);
    sinSigma = Math.sqrt(
      (cosU2 * sinLambda) ** 2 + (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) ** 2,
    );

    if (sinSigma === 0) {
      // Puntos coincidentes
      return { distancia: 0, rumboInicial: 0, rumboFinal: 0, metodo: 'vincenty' };
    }

    cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
    sigma = Math.atan2(sinSigma, cosSigma);
    sinAlfa = (cosU1 * cosU2 * sinLambda) / sinSigma;
    cos2Alfa = 1 - sinAlfa * sinAlfa;
    cos2SigmaM = cos2Alfa !== 0 ? cosSigma - (2 * sinU1 * sinU2) / cos2Alfa : 0;

    const C = (F_WGS84 / 16) * cos2Alfa * (4 + F_WGS84 * (4 - 3 * cos2Alfa));
    lambdaAnterior = lambda;
    lambda =
      L +
      (1 - C) * F_WGS84 * sinAlfa *
        (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
  } while (Math.abs(lambda - lambdaAnterior) > 1e-12 && ++iteraciones < 200);

  if (iteraciones >= 200) return distanciaSemiverseno(p1, p2);

  const uCuadrado = (cos2Alfa * (A_WGS84 * A_WGS84 - B_WGS84 * B_WGS84)) / (B_WGS84 * B_WGS84);
  const A = 1 + (uCuadrado / 16384) * (4096 + uCuadrado * (-768 + uCuadrado * (320 - 175 * uCuadrado)));
  const B = (uCuadrado / 1024) * (256 + uCuadrado * (-128 + uCuadrado * (74 - 47 * uCuadrado)));
  const deltaSigma =
    B * sinSigma *
    (cos2SigmaM +
      (B / 4) *
        (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
          (B / 6) * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));

  const distancia = B_WGS84 * A * (sigma - deltaSigma);

  const sinLambda = Math.sin(lambda), cosLambda = Math.cos(lambda);
  const rumboInicial = Math.atan2(cosU2 * sinLambda, cosU1 * sinU2 - sinU1 * cosU2 * cosLambda);
  const rumboFinal = Math.atan2(cosU1 * sinLambda, -sinU1 * cosU2 + cosU1 * sinU2 * cosLambda);

  return {
    distancia,
    rumboInicial: (radianesAGrados(rumboInicial) + 360) % 360,
    rumboFinal: (radianesAGrados(rumboFinal) + 360) % 360,
    metodo: 'vincenty',
  };
}

function distanciaSemiverseno(p1: PuntoGeografico, p2: PuntoGeografico): ResultadoDistancia {
  const R = 6371008.8; // radio medio terrestre (m)
  const phi1 = gradosARadianes(p1.latitud), phi2 = gradosARadianes(p2.latitud);
  const dPhi = phi2 - phi1;
  const dLambda = gradosARadianes(normalizarLongitud(p2.longitud - p1.longitud));

  const a = Math.sin(dPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;
  const distancia = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const y = Math.sin(dLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);
  const rumbo = (radianesAGrados(Math.atan2(y, x)) + 360) % 360;

  return { distancia, rumboInicial: rumbo, rumboFinal: rumbo, metodo: 'semiverseno' };
}

/** Punto cardinal de un rumbo, en la rosa de 16 vientos */
export function rumboACardinal(rumbo: number): string {
  const puntos = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
  return puntos[Math.round((((rumbo % 360) + 360) % 360) / 22.5) % 16];
}

// ─── Interpretación de texto pegado ────────────────────────────────────────────

export interface ResultadoInterpretacion {
  punto: PuntoGeografico;
  /** Formato reconocido, para explicarle al usuario qué se ha entendido */
  formato: 'decimal' | 'sexagesimal' | 'grados-minutos' | 'utm' | 'mgrs';
}

/** Acepta la coma decimal española y la anglosajona, y los símbolos de grado de cada teclado */
function normalizarTexto(texto: string): string {
  return texto
    .trim()
    .replace(/[º°˚]/g, '°')
    .replace(/[´`’′]/g, "'")
    .replace(/[“”″]/g, '"')
    .replace(/\s+/g, ' ');
}

/**
 * Interpreta una coordenada escrita de cualquiera de las formas habituales.
 * Devuelve null si no reconoce nada, para que la interfaz pueda decirlo sin romperse.
 */
export function interpretarCoordenada(entrada: string): ResultadoInterpretacion | null {
  const texto = normalizarTexto(entrada);
  if (!texto) return null;

  // MGRS: 30T VK 40291 74254 — se compacta primero, porque cada fuente lo espacia
  // a su manera (con espacios, sin ellos, o separando solo el par de letras)
  if (/^\d{1,2}[C-HJ-NP-X][A-HJ-NP-Z][A-HJ-NP-V]\d*$/i.test(texto.replace(/\s+/g, ''))) {
    try {
      return { punto: desdeUTM(desdeMGRS(texto)), formato: 'mgrs' };
    } catch {
      return null;
    }
  }

  // UTM: 30 T 440252 4474202  ·  30N 440252 4474202
  const utm = texto.match(/^(\d{1,2})\s*([C-HJ-NP-XNS])?\s+(-?[\d.,]+)\s*[,;\s]\s*(-?[\d.,]+)$/i);
  if (utm) {
    const zona = parseInt(utm[1], 10);
    const letra = (utm[2] ?? 'N').toUpperCase();
    const este = parseFloat(utm[3].replace(/\./g, '').replace(',', '.'));
    const norte = parseFloat(utm[4].replace(/\./g, '').replace(',', '.'));
    if (Number.isFinite(este) && Number.isFinite(norte) && zona >= 1 && zona <= 60) {
      const banda = /^[C-HJ-NP-X]$/.test(letra) ? letra : '';
      const hemisferio: Hemisferio = banda ? (banda >= 'N' ? 'N' : 'S') : letra === 'S' ? 'S' : 'N';
      try {
        return { punto: desdeUTM({ zona, banda, hemisferio, este, norte }), formato: 'utm' };
      } catch {
        return null;
      }
    }
  }

  // Sexagesimal: 40°25'00.4"N 3°42'13.6"O  ·  40 25 00.4 N, -3 42 13.6
  const sexagesimal = texto.match(
    /^(-?\d+(?:[.,]\d+)?)\s*°?\s*(\d+(?:[.,]\d+)?)?\s*'?\s*(\d+(?:[.,]\d+)?)?\s*"?\s*([NSns])?\s*[,;\s]\s*(-?\d+(?:[.,]\d+)?)\s*°?\s*(\d+(?:[.,]\d+)?)?\s*'?\s*(\d+(?:[.,]\d+)?)?\s*"?\s*([EOWeow])?$/,
  );
  if (sexagesimal) {
    const num = (v: string | undefined) => (v === undefined ? 0 : parseFloat(v.replace(',', '.')));
    const gLat = num(sexagesimal[1]), mLat = num(sexagesimal[2]), sLat = num(sexagesimal[3]);
    const gLon = num(sexagesimal[5]), mLon = num(sexagesimal[6]), sLon = num(sexagesimal[7]);
    const hLat = sexagesimal[4] ?? (gLat < 0 ? 'S' : 'N');
    const hLon = sexagesimal[8] ?? (gLon < 0 ? 'O' : 'E');

    const latitud = desdeSexagesimal(gLat, mLat, sLat, hLat) * (gLat < 0 && !sexagesimal[4] ? 1 : 1);
    const longitud = desdeSexagesimal(gLon, mLon, sLon, hLon);

    if (!esLatitudValida(latitud) || !esLongitudValida(longitud)) return null;
    if (mLat >= 60 || mLon >= 60 || sLat >= 60 || sLon >= 60) return null;

    const soloGrados = !sexagesimal[2] && !sexagesimal[3] && !sexagesimal[6] && !sexagesimal[7];
    const sinSegundos = !sexagesimal[3] && !sexagesimal[7];

    return {
      punto: { latitud, longitud },
      formato: soloGrados ? 'decimal' : sinSegundos ? 'grados-minutos' : 'sexagesimal',
    };
  }

  return null;
}
