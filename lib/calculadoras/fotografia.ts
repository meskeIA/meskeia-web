// Calculadoras de fotografía técnica — lógica pura extraída de las apps

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type TipoSensor = 'ff' | 'apsc15' | 'apsc16' | 'm43';

export interface SensorInfo {
  nombre: string;
  factor: number;
  anchoMM: number;
  altoMM: number;
  coc: number;
}

export const SENSORES: Record<TipoSensor, SensorInfo> = {
  ff:      { nombre: 'Full Frame',              factor: 1.0, anchoMM: 36.0, altoMM: 24.0, coc: 0.030 },
  apsc15:  { nombre: 'APS-C Nikon/Sony (×1,5)', factor: 1.5, anchoMM: 23.5, altoMM: 15.6, coc: 0.020 },
  apsc16:  { nombre: 'APS-C Canon (×1,6)',       factor: 1.6, anchoMM: 22.3, altoMM: 14.9, coc: 0.019 },
  m43:     { nombre: 'Micro 4/3 (×2,0)',         factor: 2.0, anchoMM: 17.3, altoMM: 13.0, coc: 0.015 },
};

// ─── Profundidad de campo ─────────────────────────────────────────────────────

export interface ResultadoDoF {
  hiperfocalM: number;
  dnM: number;
  dfM: number | null;       // null = infinito
  dofM: number | null;      // null = infinito
  dfEsInfinito: boolean;
  clasificacion: string;
}

export function calcularProfundidadCampo(
  focalMM: number,
  apertura: number,
  distanciaM: number,
  sensor: TipoSensor,
): ResultadoDoF {
  const { coc } = SENSORES[sensor];
  const f = focalMM;
  const N = apertura;
  const c = coc;
  const sMM = distanciaM * 1000;

  const H = (f * f) / (N * c) + f;
  const hiperfocalM = H / 1000;
  const dfEsInfinito = sMM >= H;

  const dnMM = (H * sMM) / (H + (sMM - f));
  const dfMM = dfEsInfinito ? null : (H * sMM) / (H - (sMM - f));
  const dofMM = dfEsInfinito ? null : dfMM! - dnMM;
  const dofM = dofMM === null ? null : dofMM / 1000;

  let clasificacion: string;
  if (dfEsInfinito)      clasificacion = 'Profundidad infinita (más allá de la hiperfocal)';
  else if (dofM! < 0.05) clasificacion = 'Muy reducida — macro extremo';
  else if (dofM! < 0.3)  clasificacion = 'Reducida — bokeh notable';
  else if (dofM! < 1.5)  clasificacion = 'Media';
  else if (dofM! < 5)    clasificacion = 'Amplia';
  else                   clasificacion = 'Muy amplia';

  return {
    hiperfocalM,
    dnM: dnMM / 1000,
    dfM: dfMM === null ? null : dfMM / 1000,
    dofM,
    dfEsInfinito,
    clasificacion,
  };
}

// ─── Regla 500 / NPF (astrofotografía) ───────────────────────────────────────

export interface ResultadoAstrofoto {
  tiempoNPF_s: number | null;    // null si declinación >= 89°
  tiempo500_s: number;
  tiempo300_s: number;
  pixelPitchUm: number;
  focalEquivalenteFF: number;
  veredicto: 'puntuales' | 'microestelas' | 'estelas_visibles' | 'star_trails';
  descripcionVeredicto: string;
}

export function calcularAstrofoto(
  focalMM: number,
  apertura: number,
  sensor: TipoSensor,
  megapixeles: number,
  declinacionGrados: number,
  tiempoElegido_s: number,
): ResultadoAstrofoto {
  const s = SENSORES[sensor];

  const areaMM2 = s.anchoMM * s.altoMM;
  const pixelPitchUm = Math.sqrt(areaMM2 / (megapixeles * 1e6)) * 1000;

  const focalEqFF = focalMM * s.factor;
  const tiempo500_s = 500 / focalEqFF;
  const tiempo300_s = 300 / focalEqFF;

  const declinacionRad = (declinacionGrados * Math.PI) / 180;
  const cosD = Math.cos(declinacionRad);
  const tiempoNPF_s = cosD < 0.001
    ? null
    : (35 * apertura + 30 * pixelPitchUm) / (focalMM * cosD);

  let veredicto: ResultadoAstrofoto['veredicto'];
  let descripcionVeredicto: string;

  const npfRef = tiempoNPF_s ?? tiempo500_s;
  if (tiempoElegido_s <= npfRef) {
    veredicto = 'puntuales';
    descripcionVeredicto = 'Estrellas como puntos limpios. Resultado ideal.';
  } else if (tiempoElegido_s <= tiempo500_s) {
    veredicto = 'microestelas';
    descripcionVeredicto = 'Microestelas a 100%, imperceptibles a tamaño web o impresión moderada.';
  } else if (tiempoElegido_s <= tiempo500_s * 1.5) {
    veredicto = 'estelas_visibles';
    descripcionVeredicto = 'Estelas visibles. Útil solo para look "soft" o time-lapse.';
  } else {
    veredicto = 'star_trails';
    descripcionVeredicto = 'Star trails marcados. Si es intencionado, perfecto. Para Vía Láctea, reduce el tiempo.';
  }

  return {
    tiempoNPF_s,
    tiempo500_s,
    tiempo300_s,
    pixelPitchUm,
    focalEquivalenteFF: focalEqFF,
    veredicto,
    descripcionVeredicto,
  };
}

// ─── Triángulo de exposición — exposición equivalente ─────────────────────────

export type ParametroFijo = 'iso' | 'apertura' | 'obturador';

export interface ResultadoExposicion {
  iso: number;
  apertura: number;
  obturador_s: number;
  obturador_fraccion: string;
  vp_iso: number;
  vp_apertura: number;
  vp_obturador: number;
  ev: number;
}

function aperturaStops(f: number): number {
  return 2 * Math.log2(f);
}

function obturadorStops(t: number): number {
  return -Math.log2(t);
}

function isoStops(iso: number): number {
  return Math.log2(iso / 100);
}

function formatObturador(t: number): string {
  if (t >= 1) return `${Math.round(t)} s`;
  const den = Math.round(1 / t);
  return `1/${den}`;
}

export function calcularExposicionEquivalente(
  isoBase: number,
  aperturaBase: number,
  obturadorBase_s: number,
  parametroFijo: ParametroFijo,
  nuevoValor: number,
): ResultadoExposicion {
  const evBase =
    isoStops(isoBase) - aperturaStops(aperturaBase) + obturadorStops(obturadorBase_s);

  let iso = isoBase;
  let apertura = aperturaBase;
  let obturador = obturadorBase_s;

  if (parametroFijo === 'iso') {
    iso = nuevoValor;
    // Ajustar apertura manteniendo EV con el obturador base
    const deltaISO = isoStops(iso) - isoStops(isoBase);
    apertura = aperturaBase * Math.pow(2, deltaISO / 2);
    obturador = obturadorBase_s;
  } else if (parametroFijo === 'apertura') {
    apertura = nuevoValor;
    const deltaApertura = aperturaStops(apertura) - aperturaStops(aperturaBase);
    obturador = obturadorBase_s * Math.pow(2, deltaApertura);
    iso = isoBase;
  } else {
    obturador = nuevoValor;
    const deltaObturador = obturadorStops(obturador) - obturadorStops(obturadorBase_s);
    iso = isoBase * Math.pow(2, deltaObturador);
    apertura = aperturaBase;
  }

  const ev = isoStops(iso) - aperturaStops(apertura) + obturadorStops(obturador);

  return {
    iso: Math.round(iso),
    apertura: Math.round(apertura * 10) / 10,
    obturador_s: Math.round(obturador * 10000) / 10000,
    obturador_fraccion: formatObturador(obturador),
    vp_iso: Math.round(isoStops(iso) * 10) / 10,
    vp_apertura: Math.round(aperturaStops(apertura) * 10) / 10,
    vp_obturador: Math.round(obturadorStops(obturador) * 10) / 10,
    ev: Math.round(ev * 10) / 10,
  };
}
