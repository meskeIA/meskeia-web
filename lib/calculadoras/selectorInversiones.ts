// lib/calculadoras/selectorInversiones.ts
// Lógica del selector de tipo de inversión — tools ChatGPT / MCP
// Basada en los mismos pesos del selector web: app/selector-inversiones/page.tsx

export type InversionKey = 'indexados' | 'acciones' | 'renta_fija' | 'inmobiliario' | 'pensiones';

export interface PerfilInversion {
  /** ¿Cuándo podría necesitar el dinero? */
  horizonte_temporal: 'menos_2_anos' | '2_a_5_anos' | '5_a_15_anos' | 'mas_15_anos';
  /** Reacción ante una caída del 40% */
  reaccion_caida: 'vendo_todo' | 'aguanto_preocupado' | 'acepto_recuperacion' | 'compro_mas';
  /** Nivel de conocimiento financiero */
  conocimiento_financiero: 'muy_basico' | 'conceptos_basicos' | 'sigo_mercados' | 'avanzado';
  /** Capital disponible para invertir */
  capital_disponible: 'menos_5k' | '5k_20k' | '20k_100k' | 'mas_100k';
  /** Importancia de la liquidez */
  importancia_liquidez: 'muy_alta' | 'alta' | 'media' | 'baja';
  /** Ventaja fiscal que aprovechar */
  ventaja_fiscal: 'tramo_alto' | 'autonomo' | 'situacion_normal' | 'empresa_sociedad';
  /** Preferencia de gestión activa o pasiva */
  gestion_activa: 'no_automatizar' | 'revisar_anual' | 'seguir_habitualmente' | 'intensiva';
  /** Interés en inversión inmobiliaria */
  interes_inmobiliario: 'objetivo_principal' | 'si_capital_suficiente' | 'prefiero_financiero' | 'no_iliquidez';
  /** Preocupación por la inflación a largo plazo */
  preocupacion_inflacion: 'mucho' | 'bastante' | 'moderado' | 'poco';
  /** ¿Tiene fondo de emergencia cubierto? */
  fondo_emergencia: 'no_todo_ahorro' | 'algo_incompleto' | 'si_separado' | 'si_y_otros_activos';
}

interface ResultadoSelectorInversion {
  inversion_recomendada: InversionKey;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  ventajas: string[];
  riesgos: string[];
  perfil: string;
  puntuaciones: Record<InversionKey, number>;
  segunda_opcion: InversionKey | null;
}

const DESCRIPCIONES: Record<InversionKey, {
  titulo: string;
  subtitulo: string;
  descripcion: string;
  ventajas: string[];
  riesgos: string[];
  perfil: string;
}> = {
  indexados: {
    titulo: 'Fondos Indexados (Pasivos)',
    subtitulo: 'Diversificación global automática y bajo coste',
    descripcion: 'Los fondos indexados replican un índice de mercado (como el MSCI World o el S&P 500) sin gestión activa. Son el vehículo más recomendado por académicos y asesores independientes para la mayoría de perfiles de inversores particulares, gracias a sus comisiones reducidas y su capacidad de diversificación global.',
    ventajas: [
      'Comisiones muy bajas (0,1 %–0,3 % anual)',
      'Diversificación global automática',
      'Sin necesidad de analizar empresas',
      'Alta liquidez (se vende en días)',
      'Traspasables sin tributar (fondos)',
    ],
    riesgos: [
      'Volatilidad a corto plazo',
      'Rentabilidad ligada al mercado global',
      'No protegen en caídas bruscas',
    ],
    perfil: 'Perfil ideal: inversor con horizonte superior a 5 años, tolerancia media al riesgo y preferencia por la automatización.',
  },
  acciones: {
    titulo: 'Acciones Directas',
    subtitulo: 'Mayor potencial, mayor riesgo y control',
    descripcion: 'Invertir directamente en acciones de empresas permite obtener mayor rentabilidad potencial, pero exige conocimiento del análisis fundamental o técnico, tiempo para seguir el mercado y alta tolerancia a la volatilidad. Es el vehículo más exigente y el que más errores puede generar en manos de inversores sin experiencia.',
    ventajas: [
      'Potencial de rentabilidad superior al mercado',
      'Control total sobre qué empresas poseer',
      'Dividendos como ingreso recurrente',
      'Transparencia total sobre el activo',
    ],
    riesgos: [
      'Alta concentración si se tienen pocas empresas',
      'Requiere tiempo y conocimiento continuo',
      'Mayor riesgo de pérdidas permanentes',
      'Impacto emocional en mercados bajistas',
    ],
    perfil: 'Perfil ideal: inversor con conocimiento avanzado, horizonte largo, alta tolerancia al riesgo y disponibilidad para seguir el mercado.',
  },
  renta_fija: {
    titulo: 'Renta Fija (Bonos, Letras)',
    subtitulo: 'Preservación de capital y menor volatilidad',
    descripcion: 'La renta fija incluye letras del Tesoro, bonos del Estado, bonos corporativos y fondos de renta fija. Ofrece rentabilidades más predecibles y menor volatilidad que la renta variable, pero históricamente no supera a la inflación a largo plazo. Es la opción más adecuada para horizontes cortos o perfiles muy conservadores.',
    ventajas: [
      'Menor volatilidad que la renta variable',
      'Cupones periódicos predecibles',
      'Capital más protegido a corto plazo',
      'Alta liquidez (Letras del Tesoro)',
    ],
    riesgos: [
      'Históricamente no supera a la inflación',
      'Riesgo de tipo de interés (precio cae si suben tipos)',
      'Riesgo de crédito en bonos corporativos',
    ],
    perfil: 'Perfil ideal: inversor conservador, horizonte corto o medio, que prioriza la seguridad sobre la rentabilidad.',
  },
  inmobiliario: {
    titulo: 'Inversión Inmobiliaria',
    subtitulo: 'Activo tangible con ingresos por alquiler',
    descripcion: 'La inversión en inmuebles para alquiler o revalorización ofrece protección frente a la inflación y una fuente de ingresos recurrente. Sin embargo, implica una gestión activa (inquilinos, reparaciones, impuestos), alta iliquidez y necesita un capital inicial elevado. También es posible acceder de forma indirecta a través de SOCIMIs o REITs.',
    ventajas: [
      'Activo tangible con valor intrínseco',
      'Ingresos pasivos por alquiler',
      'Protección histórica frente a la inflación',
      'Apalancamiento con hipoteca',
    ],
    riesgos: [
      'Alta iliquidez (meses para vender)',
      'Gestión activa requerida',
      'Concentración geográfica y de activo',
      'Gastos: IBI, comunidad, mantenimiento',
    ],
    perfil: 'Perfil ideal: inversor con capital superior a 50.000–100.000 €, horizonte largo, baja necesidad de liquidez y disposición a gestionar el activo.',
  },
  pensiones: {
    titulo: 'Plan de Pensiones / PPI',
    subtitulo: 'Ventaja fiscal inmediata, iliquidez hasta la jubilación',
    descripcion: 'Los planes de pensiones individuales (PPI) ofrecen deducción en el IRPF por las aportaciones (hasta 1.500 € anuales desde 2022), lo que los hace especialmente atractivos para quienes tributan en tramos altos. Sin embargo, el capital está bloqueado hasta la jubilación (salvo supuestos excepcionales). No son excluyentes con otros vehículos.',
    ventajas: [
      'Reducción de la base imponible en IRPF',
      'Fiscalmente eficiente para tramos altos',
      'Gestión delegada y diversificada',
      'Compatible con otros vehículos de inversión',
    ],
    riesgos: [
      'Iliquidez hasta la jubilación',
      'Tributación en rescate como renta del trabajo',
      'Límite de aportación deducible (1.500 €/año)',
      'Gestión interna variable según entidad',
    ],
    perfil: 'Perfil ideal: asalariado o autónomo con IRPF medio-alto, horizonte hasta la jubilación, que busca reducir la factura fiscal anual.',
  },
};

export function recomendarInversion(perfil: PerfilInversion): ResultadoSelectorInversion {
  const puntos: Record<InversionKey, number> = {
    indexados: 0, acciones: 0, renta_fija: 0, inmobiliario: 0, pensiones: 0,
  };

  // P1 — Horizonte temporal
  if (perfil.horizonte_temporal === 'menos_2_anos')  { puntos.renta_fija += 4; puntos.pensiones += 1; }
  if (perfil.horizonte_temporal === '2_a_5_anos')    { puntos.renta_fija += 3; puntos.indexados += 2; }
  if (perfil.horizonte_temporal === '5_a_15_anos')   { puntos.indexados += 4; puntos.acciones += 2; }
  if (perfil.horizonte_temporal === 'mas_15_anos')   { puntos.indexados += 4; puntos.acciones += 3; puntos.pensiones += 3; }

  // P2 — Reacción ante caída del 40%
  if (perfil.reaccion_caida === 'vendo_todo')           { puntos.renta_fija += 4; }
  if (perfil.reaccion_caida === 'aguanto_preocupado')   { puntos.renta_fija += 2; puntos.indexados += 1; }
  if (perfil.reaccion_caida === 'acepto_recuperacion')  { puntos.indexados += 3; puntos.acciones += 2; }
  if (perfil.reaccion_caida === 'compro_mas')           { puntos.acciones += 4; }

  // P3 — Conocimiento financiero
  if (perfil.conocimiento_financiero === 'muy_basico')        { puntos.indexados += 3; puntos.pensiones += 3; }
  if (perfil.conocimiento_financiero === 'conceptos_basicos') { puntos.indexados += 2; puntos.renta_fija += 2; }
  if (perfil.conocimiento_financiero === 'sigo_mercados')     { puntos.acciones += 3; puntos.indexados += 2; }
  if (perfil.conocimiento_financiero === 'avanzado')          { puntos.acciones += 4; }

  // P4 — Capital disponible
  if (perfil.capital_disponible === 'menos_5k')    { puntos.indexados += 3; puntos.pensiones += 2; }
  if (perfil.capital_disponible === '5k_20k')      { puntos.indexados += 3; puntos.renta_fija += 2; }
  if (perfil.capital_disponible === '20k_100k')    { puntos.indexados += 3; puntos.acciones += 2; puntos.inmobiliario += 1; }
  if (perfil.capital_disponible === 'mas_100k')    { puntos.inmobiliario += 3; puntos.acciones += 2; puntos.indexados += 2; }

  // P5 — Importancia de la liquidez
  if (perfil.importancia_liquidez === 'muy_alta') { puntos.renta_fija += 3; puntos.indexados += 2; }
  if (perfil.importancia_liquidez === 'alta')     { puntos.indexados += 3; puntos.acciones += 2; }
  if (perfil.importancia_liquidez === 'media')    { puntos.acciones += 2; puntos.inmobiliario += 1; }
  if (perfil.importancia_liquidez === 'baja')     { puntos.inmobiliario += 3; puntos.pensiones += 3; }

  // P6 — Ventaja fiscal
  if (perfil.ventaja_fiscal === 'tramo_alto')       { puntos.pensiones += 4; }
  if (perfil.ventaja_fiscal === 'autonomo')          { puntos.pensiones += 3; puntos.renta_fija += 2; }
  if (perfil.ventaja_fiscal === 'situacion_normal')  { puntos.indexados += 2; puntos.acciones += 2; }
  if (perfil.ventaja_fiscal === 'empresa_sociedad')  { puntos.acciones += 2; puntos.inmobiliario += 2; }

  // P7 — Gestión activa
  if (perfil.gestion_activa === 'no_automatizar')       { puntos.indexados += 4; puntos.pensiones += 3; }
  if (perfil.gestion_activa === 'revisar_anual')        { puntos.indexados += 2; puntos.acciones += 1; }
  if (perfil.gestion_activa === 'seguir_habitualmente') { puntos.acciones += 3; }
  if (perfil.gestion_activa === 'intensiva')            { puntos.acciones += 4; }

  // P8 — Interés inmobiliario
  if (perfil.interes_inmobiliario === 'objetivo_principal')   { puntos.inmobiliario += 5; }
  if (perfil.interes_inmobiliario === 'si_capital_suficiente'){ puntos.inmobiliario += 3; }
  if (perfil.interes_inmobiliario === 'prefiero_financiero')  { puntos.indexados += 3; puntos.acciones += 2; }
  if (perfil.interes_inmobiliario === 'no_iliquidez')         { puntos.indexados += 3; puntos.renta_fija += 2; }

  // P9 — Preocupación inflación
  if (perfil.preocupacion_inflacion === 'mucho')    { puntos.acciones += 3; puntos.indexados += 3; puntos.inmobiliario += 2; }
  if (perfil.preocupacion_inflacion === 'bastante') { puntos.indexados += 3; puntos.inmobiliario += 2; }
  if (perfil.preocupacion_inflacion === 'moderado') { puntos.renta_fija += 3; }
  if (perfil.preocupacion_inflacion === 'poco')     { puntos.renta_fija += 4; puntos.pensiones += 2; }

  // P10 — Fondo de emergencia
  if (perfil.fondo_emergencia === 'no_todo_ahorro')     { puntos.renta_fija += 3; puntos.pensiones += 2; }
  if (perfil.fondo_emergencia === 'algo_incompleto')    { puntos.renta_fija += 2; puntos.indexados += 1; }
  if (perfil.fondo_emergencia === 'si_separado')        { puntos.indexados += 3; puntos.acciones += 2; }
  if (perfil.fondo_emergencia === 'si_y_otros_activos') { puntos.acciones += 3; puntos.inmobiliario += 2; }

  // Determinar ganador y segunda opción
  const ordenados = (Object.keys(puntos) as InversionKey[])
    .sort((a, b) => puntos[b] - puntos[a]);
  const ganador = ordenados[0];
  const segundaOpcion = ordenados[1] !== ganador && puntos[ordenados[1]] > 0 ? ordenados[1] : null;

  return {
    inversion_recomendada: ganador,
    ...DESCRIPCIONES[ganador],
    puntuaciones: puntos,
    segunda_opcion: segundaOpcion,
  };
}
