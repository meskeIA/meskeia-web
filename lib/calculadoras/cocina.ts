// Calculadoras de Cocina Técnica — lógica pura

import { formatNumber } from '@/lib/formatters';

// ─── 1. Baker's Percentage (porcentaje del panadero) ─────────────────────────

export interface IngredienteBaker {
  nombre: string;
  gramos: number;
  porcentajePanadero: number;
}

export interface ResultadoBakersPercentage {
  harina_g: number;
  ingredientes: IngredienteBaker[];
  hidratacion_pct: number;
  pesoMasa_g: number;
  rendimiento_porciones?: number;
}

export function calcularBakersPercentage(
  harina_g: number,
  otros: { nombre: string; gramos: number }[],
  peso_porcion_g?: number,
): ResultadoBakersPercentage {
  const ingredientes: IngredienteBaker[] = otros.map(i => ({
    nombre: i.nombre,
    gramos: i.gramos,
    porcentajePanadero: Math.round((i.gramos / harina_g) * 1000) / 10,
  }));

  const agua = otros.find(i =>
    /agua|water|h2o/i.test(i.nombre),
  );
  const hidratacion_pct = agua
    ? Math.round((agua.gramos / harina_g) * 1000) / 10
    : 0;

  const pesoMasa_g = harina_g + otros.reduce((s, i) => s + i.gramos, 0);
  const rendimiento_porciones = peso_porcion_g
    ? Math.floor(pesoMasa_g / peso_porcion_g)
    : undefined;

  return { harina_g, ingredientes, hidratacion_pct, pesoMasa_g, rendimiento_porciones };
}

// Modo inverso: en vez de partir de gramos por ingrediente, se fija el peso final de la masa
// (el molde, la bandeja) y los porcentajes de cada ingrediente sobre la harina, y se resuelve
// cuánta harina hace falta. harina = pesoMasaTotal / (1 + Σporcentajes/100).
export function calcularBakersPercentageDesdePeso(
  pesoMasaTotal_g: number,
  otros: { nombre: string; porcentaje: number }[],
  peso_porcion_g?: number,
): ResultadoBakersPercentage {
  const sumaPorcentajes = otros.reduce((s, i) => s + i.porcentaje, 0);
  const harina_g = Math.round(pesoMasaTotal_g / (1 + sumaPorcentajes / 100));

  const ingredientes: IngredienteBaker[] = otros.map(i => ({
    nombre: i.nombre,
    gramos: Math.round((harina_g * i.porcentaje) / 100),
    porcentajePanadero: i.porcentaje,
  }));

  const agua = otros.find(i => /agua|water|h2o/i.test(i.nombre));
  const hidratacion_pct = agua ? agua.porcentaje : 0;

  // El peso real puede diferir en 1-2 g del objetivo por el redondeo a gramos enteros.
  const pesoMasa_g = harina_g + ingredientes.reduce((s, i) => s + i.gramos, 0);
  const rendimiento_porciones = peso_porcion_g
    ? Math.floor(pesoMasa_g / peso_porcion_g)
    : undefined;

  return { harina_g, ingredientes, hidratacion_pct, pesoMasa_g, rendimiento_porciones };
}

// ─── 2. Hidratación del pan (bidireccional) ───────────────────────────────────

export interface ResultadoHidratacionPan {
  harina_g: number;
  agua_g: number;
  hidratacion_pct: number;
  clasificacion: string;
  descripcion: string;
  ejemplos: string[];
}

export type ModoHidratacion = 'calcular_porcentaje' | 'calcular_agua';

export function calcularHidratacionPan(
  modo: ModoHidratacion,
  harina_g: number,
  agua_o_porcentaje: number,
): ResultadoHidratacionPan {
  const agua_g = modo === 'calcular_porcentaje'
    ? agua_o_porcentaje
    : Math.round(harina_g * agua_o_porcentaje / 100);
  const hidratacion_pct = modo === 'calcular_porcentaje'
    ? Math.round((agua_o_porcentaje / harina_g) * 1000) / 10
    : agua_o_porcentaje;

  let clasificacion: string;
  let descripcion: string;
  let ejemplos: string[];

  if (hidratacion_pct < 60) {
    clasificacion = 'Masa seca';
    descripcion = 'Fácil de trabajar, estructura compacta, corteza gruesa.';
    ejemplos = ['Bagels', 'Pretzel', 'Ciabatta tradicional densa'];
  } else if (hidratacion_pct < 70) {
    clasificacion = 'Hidratación estándar';
    descripcion = 'Masa manejable, buen equilibrio textura-corteza. La más usada en masas caseras.';
    ejemplos = ['Pan de molde', 'Baguette clásica', 'Chapata media'];
  } else if (hidratacion_pct < 80) {
    clasificacion = 'Hidratación alta';
    descripcion = 'Masa pegajosa, miga muy abierta y alveolada, corteza fina y crujiente.';
    ejemplos = ['Ciabatta', 'Pain de campagne', 'Masa madre artesana'];
  } else if (hidratacion_pct < 90) {
    clasificacion = 'Hidratación muy alta';
    descripcion = 'Requiere técnicas de plegado (stretch & fold), masa difícil de modelar.';
    ejemplos = ['Focaccia', 'Pan de cristal (80%+)', 'Bread hydration artisan'];
  } else {
    clasificacion = 'Hidratación extrema';
    descripcion = 'Masa casi líquida. Técnicas avanzadas o cocción en molde. Miga muy irregular.';
    ejemplos = ['Pan de molde de hidratación total', 'Panes artesanos experimentales'];
  }

  return {
    harina_g,
    agua_g: modo === 'calcular_porcentaje' ? Math.round(agua_g) : agua_g,
    hidratacion_pct,
    clasificacion,
    descripcion,
    ejemplos,
  };
}

// ─── 3. Sustitución de levadura por masa madre ────────────────────────────────

export type TipoLevaduraOrigen = 'fresca' | 'seca' | 'instantanea';

export interface ResultadoSustitucionMasaMadre {
  levadura_original_tipo: TipoLevaduraOrigen;
  levadura_original_g: number;
  masa_madre_g: number;
  harina_adicional_g: number;
  agua_adicional_g: number;
  harina_restar_g: number;
  agua_restar_g: number;
  hidratacion_mm_pct: number;
  nota: string;
  tiempo_fermentacion: string;
}

export function calcularSustitucionMasaMadre(
  tipo_levadura: TipoLevaduraOrigen,
  levadura_g: number,
  hidratacion_mm_pct: number = 100,
): ResultadoSustitucionMasaMadre {
  // Equivalencia: 1g levadura seca ≈ 3g levadura fresca ≈ 20–25g de masa madre activa al 100%
  // Para levadura instantánea: 1g ≈ 3g levadura fresca
  // Factor de sustitución: 20g de masa madre (100% hidratación) por cada 1g levadura seca

  let levadura_seca_equivalente_g: number;
  switch (tipo_levadura) {
    case 'fresca':       levadura_seca_equivalente_g = levadura_g / 3; break;
    case 'instantanea':  levadura_seca_equivalente_g = levadura_g; break;
    case 'seca':         levadura_seca_equivalente_g = levadura_g; break;
  }

  // 20 g de masa madre AL 100 % por cada gramo de levadura seca. De esos 20 g, la mitad es
  // harina: la hidratación del panadero es agua/harina, así que al 100 % hay tanta agua como
  // harina. Esos 10 g son la HARINA PREFERMENTADA, que es lo que de verdad gobierna la
  // fermentación — la levadura y las bacterias viven en ella, no en el agua.
  const factor_mm_al_100 = 20;
  const harina_prefermentada_g = levadura_seca_equivalente_g * factor_mm_al_100 / 2;

  // Y de ahí sale cuánta masa madre hace falta A LA HIDRATACIÓN QUE TENGA la del panadero.
  //
  // Hasta el 25/08/2026 la dosis era `levadura × 20` fija, y el deslizador de hidratación solo
  // cambiaba el reparto harina/agua a restar de la receta. Consecuencia: la harina
  // prefermentada que de verdad entraba en la masa se desviaba del ancla que la propia app
  // declara — 40 g al 50 % (+33 %) y 24 g al 150 % (−20 %) frente a los 30 g del 100 %—, así
  // que dos panaderos con la misma receta y fermentos de distinta hidratación obtenían
  // fermentaciones distintas creyendo hacer lo mismo (hallazgo 288).
  const masa_madre_g = Math.round(harina_prefermentada_g * (100 + hidratacion_mm_pct) / 100);

  // Lo que la masa madre aporta a la receta, para restarlo de la harina y el agua originales.
  // hidratacion_mm_pct = agua/harina × 100  →  harina = masa_madre × 100/(100 + hid)
  // (el comentario que había aquí decía «agua/(agua+harina)», que es la definición de otra
  // cosa y NO la que implementa esta línea: una trampa para quien viniera a «corregirlo»
  // hacia el comentario y rompiera de golpe la app, la Action de ChatGPT y la tool del MCP.)
  const harina_en_mm_g = Math.round(masa_madre_g * 100 / (100 + hidratacion_mm_pct));
  const agua_en_mm_g   = masa_madre_g - harina_en_mm_g;

  return {
    levadura_original_tipo: tipo_levadura,
    levadura_original_g: levadura_g,
    masa_madre_g,
    hidratacion_mm_pct,
    harina_restar_g: harina_en_mm_g,
    agua_restar_g: agua_en_mm_g,
    // Para informar al usuario cuánto aporta la MM en términos de receta ajustada
    harina_adicional_g: 0,
    agua_adicional_g: 0,
    // Formato español: separador de millar y ESPACIO antes de la unidad. Escribía «50g»
    // pegado mientras las dos fichas visibles de la app sí ponen «- 50 g» (hallazgo 289).
    nota: `Resta ${formatNumber(harina_en_mm_g, 0)} g de harina y ${formatNumber(agua_en_mm_g, 0)} g de agua de tu receta original para compensar lo que aporta la masa madre.`,
    tiempo_fermentacion: 'Con masa madre activa: 4–6h en bloque a temperatura ambiente + 1–2h en frío. Ajusta según la actividad de tu fermento.',
  };
}

// ─── 4. DDT — Desired Dough Temperature (temperatura de la masa) ──────────────

export type TipoAmasadora = 'manual' | 'amasadora_espiral' | 'kitchen_aid' | 'thermomix';

export interface ResultadoDDT {
  temperatura_agua_c: number;
  temperatura_agua_f: number;
  ddt_objetivo_c: number;
  t_ambiente_c: number;
  t_harina_c: number;
  t_friccion_c: number;
  factorFricion_descripcion: string;
  interpretacion: string;
  advertencia: string | null;
}

export function calcularDDT(
  ddt_objetivo_c: number,
  t_ambiente_c: number,
  t_harina_c: number,
  tipo_amasadora: TipoAmasadora = 'manual',
  t_preferment_c?: number,
): ResultadoDDT {
  const friccionPorTipo: Record<TipoAmasadora, { grados: number; desc: string }> = {
    manual:            { grados: 0,  desc: 'Amasado manual (sin fricción significativa)' },
    kitchen_aid:       { grados: 8,  desc: 'Amasadora de pie tipo KitchenAid' },
    amasadora_espiral: { grados: 5,  desc: 'Amasadora espiral profesional' },
    thermomix:         { grados: 12, desc: 'Thermomix u olla de cocción' },
  };

  const { grados: t_friccion_c, desc: factorFricion_descripcion } = friccionPorTipo[tipo_amasadora];

  // Fórmula base (3 factores): T_agua = DDT × 3 − T_ambiente − T_harina − T_friccion
  // Con preferment (4 factores): T_agua = DDT × 4 − T_ambiente − T_harina − T_friccion − T_preferment
  let temperatura_agua_c: number;
  if (t_preferment_c !== undefined) {
    temperatura_agua_c = ddt_objetivo_c * 4 - t_ambiente_c - t_harina_c - t_friccion_c - t_preferment_c;
  } else {
    temperatura_agua_c = ddt_objetivo_c * 3 - t_ambiente_c - t_harina_c - t_friccion_c;
  }

  temperatura_agua_c = Math.round(temperatura_agua_c * 10) / 10;
  const temperatura_agua_f = Math.round((temperatura_agua_c * 9 / 5 + 32) * 10) / 10;

  let interpretacion: string;
  if (temperatura_agua_c < 0) {
    interpretacion = 'El agua necesaria estaría congelada. Tu cocina está muy caliente o el DDT es muy bajo. Considera refrigerar la harina o reducir el DDT objetivo.';
  } else if (temperatura_agua_c < 5) {
    interpretacion = 'Agua muy fría (casi con hielo). Usa agua de nevera o añade cubitos de hielo y mide la temperatura resultante.';
  } else if (temperatura_agua_c < 15) {
    interpretacion = 'Agua fría de nevera. Extrae el agua unas horas antes y controla la temperatura.';
  } else if (temperatura_agua_c < 25) {
    interpretacion = 'Agua a temperatura ambiente normal. Fácil de conseguir.';
  } else if (temperatura_agua_c < 35) {
    interpretacion = 'Agua ligeramente tibia. Usa agua del grifo caliente o mezcla fría con caliente.';
  } else {
    interpretacion = 'Agua caliente. Úsala directamente del grifo caliente y mide la temperatura antes de añadir.';
  }

  let advertencia: string | null = null;
  if (temperatura_agua_c > 40) {
    advertencia = 'Por encima de 40°C el agua puede empezar a dañar la levadura. Verifica la temperatura con termómetro.';
  }
  if (temperatura_agua_c > 60) {
    advertencia = 'Temperatura muy alta: matará la levadura. Revisa los inputs — puede haber un error en los datos.';
  }

  return {
    temperatura_agua_c,
    temperatura_agua_f,
    ddt_objetivo_c,
    t_ambiente_c,
    t_harina_c,
    t_friccion_c,
    factorFricion_descripcion,
    interpretacion,
    advertencia,
  };
}

// ─── 5. Puntos del azúcar (fases de cocción) ─────────────────────────────────

export interface FaseAzucar {
  nombre: string;
  nombre_en: string;
  temp_min_c: number;
  temp_max_c: number;
  brix_aprox: number;
  descripcion: string;
  usosTipicos: string[];
  prueba_agua_fria: string;
}

export interface ResultadoPuntosAzucar {
  temperatura_c: number;
  temperatura_f: number;
  fase: FaseAzucar | null;
  fase_anterior: FaseAzucar | null;
  fase_siguiente: FaseAzucar | null;
  advertencia: string | null;
}

const FASES_AZUCAR: FaseAzucar[] = [
  {
    nombre: 'Almíbar ligero',
    nombre_en: 'Thread stage',
    temp_min_c: 100, temp_max_c: 106, brix_aprox: 80,
    descripcion: 'El azúcar forma un hilo fino al coger con dos dedos.',
    usosTipicos: ['Frutas en almíbar', 'Sorbetes', 'Glaseados fluidos'],
    prueba_agua_fria: 'Forma un hilo que se rompe al tocar',
  },
  {
    nombre: 'Bola blanda',
    nombre_en: 'Soft ball stage',
    temp_min_c: 112, temp_max_c: 116, brix_aprox: 85,
    descripcion: 'Forma una bola blanda y flexible en agua fría.',
    usosTipicos: ['Fondant', 'Fudge', 'Mazapán', 'Caramelos blandos'],
    prueba_agua_fria: 'Se puede moldear en bola blanda que se aplana sola',
  },
  {
    nombre: 'Bola firme',
    nombre_en: 'Firm ball stage',
    temp_min_c: 118, temp_max_c: 121, brix_aprox: 87,
    descripcion: 'Bola firme que mantiene su forma pero aún flexible.',
    usosTipicos: ['Caramelos de leche', 'Nougat blando', 'Turrón blando'],
    prueba_agua_fria: 'Bola que mantiene forma pero puede aplastarse',
  },
  {
    nombre: 'Bola dura',
    nombre_en: 'Hard ball stage',
    temp_min_c: 122, temp_max_c: 130, brix_aprox: 90,
    descripcion: 'Bola dura que mantiene su forma con dificultad para aplastar.',
    usosTipicos: ['Caramelos duros rellenos', 'Turrón duro ligero', 'Nougat duro'],
    prueba_agua_fria: 'Bola dura que mantiene forma al sacarla',
  },
  {
    nombre: 'Caramelo blando',
    nombre_en: 'Soft crack stage',
    temp_min_c: 132, temp_max_c: 143, brix_aprox: 95,
    descripcion: 'Forma hilos blandos que se doblan antes de romperse.',
    usosTipicos: ['Toffee', 'Butterscotch', 'Algunos pirulís'],
    prueba_agua_fria: 'Hilos blandos que se doblan pero no se rompen',
  },
  {
    nombre: 'Caramelo duro',
    nombre_en: 'Hard crack stage',
    temp_min_c: 149, temp_max_c: 155, brix_aprox: 99,
    descripcion: 'Hilos rígidos que se rompen limpiamente.',
    usosTipicos: ['Piruletas', 'Caramelos duros', 'Decoraciones de azúcar soplado', 'Manzanas caramelizadas'],
    prueba_agua_fria: 'Hilos rígidos que se rompen y crujen',
  },
  {
    nombre: 'Caramelo rubio',
    nombre_en: 'Light caramel',
    temp_min_c: 160, temp_max_c: 170, brix_aprox: 100,
    descripcion: 'El azúcar empieza a caramelizarse, color amarillo dorado.',
    usosTipicos: ['Crème brûlée', 'Pralinés', 'Nougatine', 'Flan cubano'],
    prueba_agua_fria: 'No aplicable — ya no hay fase acuosa',
  },
  {
    nombre: 'Caramelo oscuro / ámbar',
    nombre_en: 'Dark caramel',
    temp_min_c: 171, temp_max_c: 182, brix_aprox: 100,
    descripcion: 'Caramelo ámbar intenso, sabor más amargo y complejo.',
    usosTipicos: ['Salsa de caramelo salado', 'Tarta Tatin', 'Coulant de caramelo'],
    prueba_agua_fria: 'No aplicable',
  },
  {
    nombre: 'Caramelo quemado',
    nombre_en: 'Burnt caramel',
    temp_min_c: 183, temp_max_c: 200, brix_aprox: 100,
    descripcion: 'Color negro, sabor amargo pronunciado. Límite de uso en repostería.',
    usosTipicos: ['Colorante caramelo E150', 'Sabor a quemado buscado en cocina de autor'],
    prueba_agua_fria: 'No aplicable',
  },
];

export function calcularPuntosAzucar(temperatura_c: number): ResultadoPuntosAzucar {
  const temperatura_f = Math.round((temperatura_c * 9 / 5 + 32) * 10) / 10;

  const faseIdx = FASES_AZUCAR.findIndex(
    f => temperatura_c >= f.temp_min_c && temperatura_c <= f.temp_max_c,
  );

  const fase = faseIdx >= 0 ? FASES_AZUCAR[faseIdx] : null;
  const fase_anterior = faseIdx > 0 ? FASES_AZUCAR[faseIdx - 1] : (faseIdx === -1 ? FASES_AZUCAR.filter(f => f.temp_max_c < temperatura_c).at(-1) ?? null : null);
  const fase_siguiente = faseIdx >= 0 && faseIdx < FASES_AZUCAR.length - 1 ? FASES_AZUCAR[faseIdx + 1] : (faseIdx === -1 ? FASES_AZUCAR.find(f => f.temp_min_c > temperatura_c) ?? null : null);

  let advertencia: string | null = null;
  if (temperatura_c < 100) {
    advertencia = 'Por debajo de 100°C el almíbar aún no ha alcanzado el punto de ebullición. El azúcar no estará en ninguna fase de caramelo.';
  }
  if (temperatura_c > 200) {
    advertencia = 'Por encima de 200°C el azúcar se carboniza completamente. No es apto para consumo.';
  }
  if (temperatura_c >= 107 && temperatura_c < 112) {
    advertencia = 'Zona de transición entre almíbar ligero y bola blanda. Controla con termómetro de precisión.';
  }

  return { temperatura_c, temperatura_f, fase, fase_anterior, fase_siguiente, advertencia };
}

export { FASES_AZUCAR };

// ─── 6. Sustitución de gelatina ───────────────────────────────────────────────

export type TipoGelatina =
  | 'hoja_bronce'      // 120 bloom, ~1.7g/hoja
  | 'hoja_plata'       // 160 bloom, ~2.3g/hoja
  | 'hoja_oro'         // 200 bloom, ~2.5g/hoja (estándar europeo)
  | 'hoja_platino'     // 250 bloom, ~1.7g/hoja
  | 'polvo_200'        // Polvo comercial 200 bloom
  | 'polvo_250'        // Polvo profesional 250 bloom
  | 'agar_agar';       // Gelificante vegetal (3-4× más fuerte que gelatina)

interface InfoGelatina {
  bloom: number;
  pesoHoja_g?: number;
  nombre: string;
  notas: string;
}

const INFO_GELATINA: Record<TipoGelatina, InfoGelatina> = {
  hoja_bronce:   { bloom: 120, pesoHoja_g: 1.7,  nombre: 'Hoja de bronce (120 bloom)',   notas: 'Gelatina de hojas más débil. Poco común en España.' },
  hoja_plata:    { bloom: 160, pesoHoja_g: 2.3,  nombre: 'Hoja de plata (160 bloom)',    notas: 'Usada en hostelería profesional.' },
  hoja_oro:      { bloom: 200, pesoHoja_g: 2.5,  nombre: 'Hoja de oro (200 bloom)',      notas: 'La más habitual en supermercados españoles. Referencia estándar.' },
  hoja_platino:  { bloom: 250, pesoHoja_g: 1.7,  nombre: 'Hoja de platino (250 bloom)',  notas: 'Alta resistencia, usada en mousses y gelatinas de presentación.' },
  polvo_200:     { bloom: 200, nombre: 'Gelatina en polvo 200 bloom',  notas: 'Equivalente a hoja de oro. 1 sobre comercial ≈ 10g.' },
  polvo_250:     { bloom: 250, nombre: 'Gelatina en polvo 250 bloom',  notas: 'Versión profesional de alto rendimiento.' },
  agar_agar:     { bloom: 0,   nombre: 'Agar-agar (polvo)',            notas: 'Gelificante vegetal. Comportamiento diferente: gelifica a temperatura ambiente, no se derrite en boca, miga más firme.' },
};

export interface ConversionGelatina {
  tipo: TipoGelatina;
  nombre: string;
  cantidad_g: number;
  hojas?: number;
  notas: string;
}

export interface ResultadoSustitucionGelatina {
  origen: ConversionGelatina;
  equivalentes: ConversionGelatina[];
  advertencia_agar: string | null;
}

export function calcularSustitucionGelatina(
  tipo_origen: TipoGelatina,
  cantidad: number,
  unidad: 'gramos' | 'hojas' = 'gramos',
): ResultadoSustitucionGelatina {
  const infoOrigen = INFO_GELATINA[tipo_origen];

  let gramos_origen: number;
  let hojas_origen: number | undefined;

  if (tipo_origen === 'agar_agar') {
    gramos_origen = cantidad;
  } else if (unidad === 'hojas' && infoOrigen.pesoHoja_g) {
    gramos_origen = cantidad * infoOrigen.pesoHoja_g;
    hojas_origen = cantidad;
  } else {
    gramos_origen = cantidad;
    hojas_origen = infoOrigen.pesoHoja_g ? Math.round(cantidad / infoOrigen.pesoHoja_g * 10) / 10 : undefined;
  }

  // Convertir a gelatina de referencia: hoja oro 200 bloom
  // Fórmula: g_equiv_200 = g_origen × bloom_origen / 200
  // Para agar-agar: 1g agar ≈ 5g gelatina polvo 200 bloom (factor 5)
  let gramos_eq_200: number;
  if (tipo_origen === 'agar_agar') {
    gramos_eq_200 = gramos_origen * 5;
  } else {
    gramos_eq_200 = gramos_origen * infoOrigen.bloom / 200;
  }

  const calcularEquivalente = (tipo: TipoGelatina): ConversionGelatina => {
    const info = INFO_GELATINA[tipo];
    let cantidad_g: number;
    if (tipo === 'agar_agar') {
      cantidad_g = Math.round(gramos_eq_200 / 5 * 10) / 10;
    } else {
      cantidad_g = Math.round(gramos_eq_200 * 200 / info.bloom * 10) / 10;
    }
    const hojas = info.pesoHoja_g ? Math.round(cantidad_g / info.pesoHoja_g * 10) / 10 : undefined;
    return { tipo, nombre: info.nombre, cantidad_g, hojas, notas: info.notas };
  };

  const otros: TipoGelatina[] = (Object.keys(INFO_GELATINA) as TipoGelatina[]).filter(t => t !== tipo_origen);
  const equivalentes = otros.map(calcularEquivalente);

  const origen: ConversionGelatina = {
    tipo: tipo_origen,
    nombre: infoOrigen.nombre,
    cantidad_g: gramos_origen,
    hojas: hojas_origen,
    notas: infoOrigen.notas,
  };

  const advertencia_agar =
    tipo_origen === 'agar_agar' || equivalentes.some(e => e.tipo === 'agar_agar')
      ? 'El agar-agar gelifica a temperatura ambiente (no necesita frío), no se funde en boca y produce una textura más firme y quebradiza. No es un sustituto 1:1 del comportamiento de la gelatina.'
      : null;

  return { origen, equivalentes, advertencia_agar };
}

// ─── 7. Ratio de ganache ──────────────────────────────────────────────────────

export type TexturaGanache = 'glaseado' | 'trufa' | 'firme';
export type TipoChocolate = 'negro_extra' | 'negro' | 'semi_fondant' | 'con_leche' | 'blanco';

export interface ResultadoGanache {
  tipo_chocolate: TipoChocolate;
  porcentaje_cacao: string;
  textura: TexturaGanache;
  chocolate_g: number;
  nata_g: number;
  total_g: number;
  ratio_texto: string;
  temperatura_trabajo_c: string;
  usos: string[];
  nota: string;
}

const RATIOS_GANACHE: Record<TipoChocolate, Record<TexturaGanache, number>> = {
  // Ratio chocolate:nata
  negro_extra:   { glaseado: 1.0, trufa: 2.0, firme: 3.0 },
  negro:         { glaseado: 1.2, trufa: 2.2, firme: 3.0 },
  semi_fondant:  { glaseado: 1.5, trufa: 2.5, firme: 3.5 },
  con_leche:     { glaseado: 2.0, trufa: 3.0, firme: 4.0 },
  blanco:        { glaseado: 3.0, trufa: 4.0, firme: 5.0 },
};

const INFO_CHOCOLATE: Record<TipoChocolate, { rango: string; notas: string }> = {
  negro_extra:  { rango: '70–99% cacao', notas: 'Valrhona Guanaja, Lindt 70%+' },
  negro:        { rango: '55–70% cacao', notas: 'Callebaut 811, Nestlé Postres' },
  semi_fondant: { rango: '40–55% cacao', notas: 'Chocolates de cobertura medios' },
  con_leche:    { rango: '28–40% cacao', notas: 'Valrhona Jivara, Callebaut W2' },
  blanco:       { rango: '0% cacao (manteca)', notas: 'Callebaut W2, Valrhona Ivoire' },
};

const USOS_GANACHE: Record<TexturaGanache, string[]> = {
  glaseado: ['Glaseado de tartas', 'Cobertura de eclairs', 'Drip cake', 'Bombones con cobertura fina'],
  trufa:    ['Trufas de chocolate', 'Relleno de bombones', 'Relleno de tartas', 'Macarons'],
  firme:    ['Trufas para rebozar', 'Modelado de chocolate', 'Relleno de pralinés con cáscara muy fina'],
};

const TEMPERATURA_TRABAJO: Record<TexturaGanache, string> = {
  glaseado: '30–32°C para uso inmediato. Deja enfriar a temperatura ambiente si quieres efecto goteo.',
  trufa:    'Refrigerar 2–4h. Trabajar a 17–20°C para bolear las trufas.',
  firme:    'Refrigerar 4–6h. Trabajar a temperatura ambiente 5 min antes de manipular.',
};

export function calcularGanache(
  tipo_chocolate: TipoChocolate,
  textura: TexturaGanache,
  total_g: number,
): ResultadoGanache {
  const ratio = RATIOS_GANACHE[tipo_chocolate][textura];
  // ratio = chocolate/nata → total = chocolate + nata = chocolate + chocolate/ratio
  // total = chocolate × (1 + 1/ratio) → chocolate = total × ratio / (ratio + 1)
  const chocolate_g = Math.round(total_g * ratio / (ratio + 1));
  const nata_g = total_g - chocolate_g;

  const ratioSimplificado = ratio === Math.floor(ratio)
    ? `${ratio}:1`
    : `${ratio}:1`;

  return {
    tipo_chocolate,
    porcentaje_cacao: INFO_CHOCOLATE[tipo_chocolate].rango,
    textura,
    chocolate_g,
    nata_g,
    total_g,
    ratio_texto: `Chocolate:Nata = ${ratioSimplificado} (${ratio} partes chocolate : 1 parte nata)`,
    temperatura_trabajo_c: TEMPERATURA_TRABAJO[textura],
    usos: USOS_GANACHE[textura],
    nota: INFO_CHOCOLATE[tipo_chocolate].notas,
  };
}

// ─── 8. Escalador de recetas ──────────────────────────────────────────────────

export type CategoriaIngrediente =
  | 'normal'           // Escala linealmente
  | 'levadura'         // Levadura — no escala al 100%
  | 'impulsores'       // Polvo de hornear, bicarbonato
  | 'sal'              // La sal necesita menor proporción en lotes grandes
  | 'especias'         // Las especias suelen necesitar menos en grandes cantidades
  | 'tiempo_no_escalar'; // Temperatura, tiempos de horno — no se escalan

export interface IngredienteEscalado {
  nombre: string;
  cantidad_original: number;
  unidad: string;
  cantidad_nueva: number;
  cantidad_redondeada: string;
  categoria: CategoriaIngrediente;
  nota?: string;
}

export interface ResultadoEscaladoReceta {
  raciones_original: number;
  raciones_nueva: number;
  factor_escala: number;
  ingredientes: IngredienteEscalado[];
  nota_horno: string;
  advertencias: string[];
}

function redondearPractico(valor: number, unidad: string): string {
  const u = unidad.toLowerCase();

  if (['g', 'gr', 'gramos'].includes(u)) {
    if (valor < 5)  return `${Math.round(valor * 10) / 10}g`;
    if (valor < 50) return `${Math.round(valor)}g`;
    return `${Math.round(valor / 5) * 5}g`;
  }
  if (['kg', 'kilos'].includes(u)) {
    return `${Math.round(valor * 100) / 100}kg`;
  }
  if (['ml', 'mililitros'].includes(u)) {
    if (valor < 10) return `${Math.round(valor * 10) / 10}ml`;
    return `${Math.round(valor)}ml`;
  }
  if (['l', 'litros'].includes(u)) {
    return `${Math.round(valor * 100) / 100}l`;
  }
  if (['cucharada', 'cucharadas', 'tbsp'].includes(u)) {
    return `${Math.round(valor * 4) / 4} ${unidad}`;
  }
  if (['cucharadita', 'cucharaditas', 'tsp'].includes(u)) {
    return `${Math.round(valor * 4) / 4} ${unidad}`;
  }

  return `${Math.round(valor * 100) / 100} ${unidad}`;
}

function factorAjustado(categoria: CategoriaIngrediente, factor: number): number {
  switch (categoria) {
    case 'levadura':
      // No escala linealmente — regla práctica: √factor para lotes pequeños, ×0.75 para grandes
      if (factor > 2) return Math.sqrt(factor) * 0.9;
      return factor * 0.9;
    case 'impulsores':
      // Similar a levadura pero ligeramente diferente
      if (factor > 2) return Math.sqrt(factor);
      return factor * 0.95;
    case 'sal':
      // En grandes cantidades, la percepción del sabor es logarítmica
      if (factor > 3) return factor * 0.85;
      return factor;
    case 'especias':
      // Las especias en grandes cantidades suelen necesitar menos
      if (factor > 2) return factor * 0.80;
      return factor;
    default:
      return factor;
  }
}

export function escalarReceta(
  raciones_original: number,
  raciones_nueva: number,
  ingredientes: { nombre: string; cantidad: number; unidad: string; categoria?: CategoriaIngrediente }[],
): ResultadoEscaladoReceta {
  const factor_escala = raciones_nueva / raciones_original;
  const advertencias: string[] = [];

  if (factor_escala > 4) {
    advertencias.push('Factor de escala mayor de 4×: la levadura, impulsores y especias se han ajustado por la regla de la raíz cuadrada, no de forma lineal.');
  }
  if (factor_escala < 0.25) {
    advertencias.push('Factor de escala inferior a 1/4: en cantidades muy pequeñas, medir ingredientes como sal y levadura puede ser difícil. Usa una báscula de precisión (0,1g).');
  }

  const ingredientesEscalados: IngredienteEscalado[] = ingredientes.map(ing => {
    const cat = ing.categoria ?? 'normal';
    const fajustado = factorAjustado(cat, factor_escala);
    const cantidad_nueva = ing.cantidad * fajustado;

    let nota: string | undefined;
    if (cat === 'levadura' && Math.abs(fajustado - factor_escala) > 0.05) {
      nota = `Ajustada (no lineal). Original: ${ing.cantidad}${ing.unidad} × ${Math.round(fajustado * 100) / 100} (no × ${Math.round(factor_escala * 100) / 100})`;
    }
    if (cat === 'impulsores' && factor_escala > 2) {
      nota = 'Polvo de hornear / bicarbonato ajustado (escala sublineal para evitar sabor metálico).';
    }

    return {
      nombre: ing.nombre,
      cantidad_original: ing.cantidad,
      unidad: ing.unidad,
      cantidad_nueva: Math.round(cantidad_nueva * 100) / 100,
      cantidad_redondeada: redondearPractico(cantidad_nueva, ing.unidad),
      categoria: cat,
      nota,
    };
  });

  const nota_horno = factor_escala !== 1
    ? `La temperatura del horno NO cambia. El tiempo puede variar: +10–15% si escalas ×2 en moldes más profundos; −5–10% en piezas más pequeñas. Usa el test del palillo/temperatura interna como referencia.`
    : 'Sin cambios necesarios.';

  return {
    raciones_original,
    raciones_nueva,
    factor_escala: Math.round(factor_escala * 100) / 100,
    ingredientes: ingredientesEscalados,
    nota_horno,
    advertencias,
  };
}
