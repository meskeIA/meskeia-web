// lib/calculadoras/selectorAlquilerVsCompra.ts
// Selector perfil alquilar vs comprar — tools ChatGPT / MCP
// Decisión conceptual basada en perfil vital y financiero, sin necesidad de cifras exactas

export type AlquilerCompraKey = 'comprar' | 'alquilar' | 'valorar';

export interface PerfilAlquilerVsCompra {
  /** ¿Cuánto tiempo planeas vivir en esta ciudad o zona? */
  horizonte_ciudad: 'menos_3_anos' | '3_a_7_anos' | 'mas_7_anos' | 'indefinido';
  /** Situación laboral actual */
  estabilidad_laboral: 'inestable' | 'estable_privado' | 'funcionario' | 'autonomo_variable';
  /** ¿Tienes ahorrado aprox. el 20-25% del precio para entrada + gastos? */
  capital_entrada: 'no_tengo' | 'tengo_justo' | 'tengo_suficiente' | 'tengo_amplio';
  /** Cuota hipotecaria estimada sobre tus ingresos netos mensuales */
  esfuerzo_hipotecario: 'mas_40pct' | 'entre_30_40pct' | 'entre_20_30pct' | 'menos_20pct';
  /** Importancia de poder cambiarte de ciudad o país en los próximos años */
  flexibilidad_vital: 'muy_importante' | 'importante' | 'moderada' | 'poca';
  /** Alquiler mensual que pagarías vs cuota hipotecaria comparable en tu zona */
  ratio_coste: 'alquiler_mucho_mas_barato' | 'similar' | 'alquiler_mas_caro' | 'no_tengo_referencia';
  /** ¿Cómo te sientes ante una hipoteca a 25-30 años? */
  tolerancia_deuda: 'me_agobia' | 'algo_incomodo' | 'lo_acepto' | 'lo_veo_positivo';
  /** Perspectiva sobre el precio de la vivienda en tu zona */
  perspectiva_zona: 'va_a_bajar' | 'estable' | 'subira_moderado' | 'subira_mucho';
  /** Situación y planes familiares */
  situacion_familiar: 'solo_sin_plan' | 'pareja_sin_hijos_pronto' | 'familia_o_planes_claros' | 'necesito_estabilidad';
  /** ¿Qué valoras más en tu vivienda? */
  prioridad_vital: 'libertad_movilidad' | 'construir_patrimonio' | 'estabilidad_hogar' | 'indiferente';
}

interface ResultadoSelectorAlquilerVsCompra {
  decision: AlquilerCompraKey;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  argumentos_favor: string[];
  aspectos_a_considerar: string[];
  perfil: string;
  score: number;
}

const DESCRIPCIONES: Record<AlquilerCompraKey, {
  titulo: string;
  subtitulo: string;
  descripcion: string;
  argumentos_favor: string[];
  aspectos_a_considerar: string[];
  perfil: string;
}> = {
  comprar: {
    titulo: 'Tu perfil apunta a comprar',
    subtitulo: 'Las condiciones de tu situación vital y financiera favorecen la compra',
    descripcion: 'Según tus respuestas, comprar tiene más sentido para ti en este momento: tienes estabilidad laboral y familiar, horizonte largo en la zona, capacidad financiera para afrontar la hipoteca y baja necesidad de movilidad. Comprar te permite construir patrimonio, fijar un coste mensual y no depender de subidas de alquiler.',
    argumentos_favor: [
      'Construyes patrimonio con cada cuota pagada',
      'Fijas el coste mensual (hipoteca fija) frente a alquileres al alza',
      'Estabilidad y personalización del hogar a largo plazo',
      'Protección frente a la inflación: el inmueble tiende a revalorizarse',
      'Beneficio fiscal en algunos casos (deducción autonómica vivienda habitual)',
    ],
    aspectos_a_considerar: [
      'Comprueba que la cuota no supere el 30-35% de tus ingresos netos',
      'Reserva 10-12% adicional sobre el precio para gastos (ITP/IVA, notaría, registro)',
      'Mantén un fondo de emergencia separado de la entrada',
      'Valora si la zona tiene liquidez suficiente por si necesitas vender',
    ],
    perfil: 'Perfil ideal: persona con estabilidad laboral consolidada, horizonte en la zona superior a 7-10 años, capital para la entrada y cuota asumible.',
  },
  alquilar: {
    titulo: 'Tu perfil apunta a seguir alquilando',
    subtitulo: 'Ahora mismo alquilar te da más ventajas que asumir una hipoteca',
    descripcion: 'Tus respuestas muestran factores que hacen más aconsejable el alquiler en esta etapa: horizonte incierto en la zona, situación laboral o financiera con margen de mejora, o alta valoración de la flexibilidad. Alquilar no es "tirar el dinero" — es pagar por flexibilidad, liquidez y no asumir riesgos que aún no encajan con tu momento vital.',
    argumentos_favor: [
      'Libertad para cambiar de ciudad o país sin ataduras',
      'Sin riesgo de depreciación del inmueble ni gastos de mantenimiento inesperados',
      'Capital disponible para invertir con mayor rentabilidad potencial',
      'Sin endeudamiento a largo plazo en una etapa incierta',
      'Adaptabilidad a cambios de empleo, pareja o familia',
    ],
    aspectos_a_considerar: [
      'Invierte el ahorro de la entrada en fondos indexados o productos de bajo coste',
      'Aprovecha este período para consolidar los ingresos y ahorrar la entrada',
      'Revisa tu situación cada 2-3 años: cuando cambie el horizonte, la decisión puede cambiar',
      'Negocia cláusulas de estabilidad en el contrato de alquiler',
    ],
    perfil: 'Perfil ideal: persona con horizonte vital incierto, alta movilidad laboral o geográfica, capital insuficiente para la entrada, o en una etapa de transición personal o profesional.',
  },
  valorar: {
    titulo: 'Tu caso merece análisis más detallado',
    subtitulo: 'Tienes factores a favor de ambas opciones — necesitas hacer números con tu situación concreta',
    descripcion: 'Tu perfil presenta equilibrio entre factores que favorecen la compra y el alquiler. La decisión final depende de cifras concretas que no son universales: precio de compra, alquiler de mercado, tipo hipotecario, y tu horizonte real. Te recomendamos usar la calculadora alquiler vs compra con tus datos reales para comparar el patrimonio acumulado en cada escenario a 10-15 años.',
    argumentos_favor: [
      'La calculadora alquiler vs compra de meskeIA puede darte números exactos',
      'Consulta con un asesor hipotecario (gratuito en la mayoría de brokers)',
      'Compara la cuota hipotecaria con el alquiler equivalente en tu zona',
      'Valora si el precio por metro cuadrado en tu zona tiene recorrido de revalorización',
    ],
    aspectos_a_considerar: [
      'No decidas solo por presión social o miedo a "perder el tren"',
      'Evalúa tu estabilidad laboral a 3-5 años vista antes de firmar',
      'La regla del 30% (cuota < 30% ingresos) es un buen punto de partida',
      'Una hipoteca es un compromiso de 25-30 años — la urgencia raramente está justificada',
    ],
    perfil: 'Perfil con factores mixtos: hay elementos favorables a la compra pero también incertidumbres relevantes. Recomendable análisis cuantitativo personalizado.',
  },
};

const PUNTOS: Record<keyof PerfilAlquilerVsCompra, Record<string, number>> = {
  horizonte_ciudad:     { menos_3_anos: -4, '3_a_7_anos': -1, mas_7_anos: 3, indefinido: 4 },
  estabilidad_laboral:  { inestable: -4, estable_privado: 2, funcionario: 4, autonomo_variable: -2 },
  capital_entrada:      { no_tengo: -4, tengo_justo: -1, tengo_suficiente: 2, tengo_amplio: 3 },
  esfuerzo_hipotecario: { mas_40pct: -4, entre_30_40pct: -1, entre_20_30pct: 2, menos_20pct: 3 },
  flexibilidad_vital:   { muy_importante: -3, importante: -1, moderada: 0, poca: 2 },
  ratio_coste:          { alquiler_mucho_mas_barato: -3, similar: 0, alquiler_mas_caro: 2, no_tengo_referencia: 0 },
  tolerancia_deuda:     { me_agobia: -3, algo_incomodo: -1, lo_acepto: 1, lo_veo_positivo: 2 },
  perspectiva_zona:     { va_a_bajar: -3, estable: 0, subira_moderado: 2, subira_mucho: 3 },
  situacion_familiar:   { solo_sin_plan: -2, pareja_sin_hijos_pronto: 0, familia_o_planes_claros: 3, necesito_estabilidad: 3 },
  prioridad_vital:      { libertad_movilidad: -3, construir_patrimonio: 3, estabilidad_hogar: 2, indiferente: 0 },
};

export function recomendarAlquilerVsCompra(perfil: PerfilAlquilerVsCompra): ResultadoSelectorAlquilerVsCompra {
  let score = 0;

  (Object.keys(PUNTOS) as (keyof PerfilAlquilerVsCompra)[]).forEach((campo) => {
    const valor = perfil[campo] as string;
    score += PUNTOS[campo][valor] ?? 0;
  });

  let decision: AlquilerCompraKey;
  if (score >= 8)       decision = 'comprar';
  else if (score <= -8) decision = 'alquilar';
  else                  decision = 'valorar';

  return {
    decision,
    ...DESCRIPCIONES[decision],
    score,
  };
}
