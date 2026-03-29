// lib/calculadoras/selectorHipoteca.ts
// Lógica del selector de tipo de hipoteca para tools ChatGPT / MCP
// Basada en los mismos pesos del selector web: app/selector-tipo-hipoteca/page.tsx

export type TipoHipotecaKey = 'fija' | 'variable' | 'mixta' | 'verde';

export interface PerfilHipoteca {
  /** Cómo reaccionaría si la cuota sube 150-200 €/mes */
  tolerancia_euribor: 'baja' | 'media' | 'alta';
  /** Plazo previsto en años */
  plazo_anos: number;
  /** Situación laboral principal */
  situacion_laboral: 'indefinido_estable' | 'autonomo_variable' | 'doble_nomina' | 'temporal';
  /** La vivienda tiene certificado energético A o B */
  vivienda_eficiente: boolean;
  /** Tiene capacidad para amortizar anticipadamente de forma regular */
  puede_amortizar_regularmente: boolean;
  /** Planea vender o cambiar de vivienda antes de 10 años */
  vende_antes_10_anos: boolean | null;
  /** Preferencia de cuota: fija siempre, fija al inicio, o variable si es más barata */
  preferencia_cuota: 'siempre_fija' | 'fija_inicio' | 'acepta_variable';
  /** Préstamo respecto a ingresos anuales brutos */
  ratio_prestamo_ingresos: 'alto' | 'medio' | 'bajo';
  /** Tipo de vivienda */
  tipo_vivienda: 'primera' | 'segunda_vacacional' | 'inversion';
  /** Número de titulares con ingresos estables */
  titulares_con_ingresos: 1 | 2;
}

interface ResultadoSelector {
  tipo_recomendado: TipoHipotecaKey;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  caracteristicas: string[];
  alertas: string[];
  puntuaciones: Record<TipoHipotecaKey, number>;
  segunda_opcion: TipoHipotecaKey | null;
}

const DESCRIPCIONES: Record<TipoHipotecaKey, { titulo: string; subtitulo: string; descripcion: string; caracteristicas: string[]; alertas: string[] }> = {
  fija: {
    titulo: 'Hipoteca a Tipo Fijo',
    subtitulo: 'Cuota estable durante toda la vida del préstamo',
    descripcion: 'La hipoteca a tipo fijo mantiene el mismo interés —y la misma cuota— durante todos los años del préstamo, independientemente de cómo evolucione el euríbor. Es la opción preferida por quienes valoran la certeza en su planificación financiera. Aunque el tipo inicial suele ser algo más alto que el variable, elimina completamente el riesgo de subidas futuras.',
    caracteristicas: [
      'Cuota mensual invariable siempre',
      'Tipo no referenciado al euríbor',
      'Ideal para plazos largos (20-30 años)',
      'TIN fijo de referencia: 3 % – 4,5 %',
    ],
    alertas: [
      'El tipo fijo inicial suele ser superior al variable; compara el coste total',
      'Si los tipos bajan significativamente, no te beneficiarás',
      'Comisión por amortización anticipada: máx. 2 % primeros 10 años (Ley 5/2019)',
      'Compara el TAE entre entidades, no solo el TIN',
    ],
  },
  variable: {
    titulo: 'Hipoteca a Tipo Variable',
    subtitulo: 'Referenciada al euríbor; puede ser más barata si los tipos bajan',
    descripcion: 'La hipoteca variable está referenciada al euríbor a 12 meses más un diferencial fijo. La cuota se revisa cada 6 o 12 meses, por lo que puede subir o bajar. Históricamente más barata en ciclos de tipos bajos, pero implica asumir el riesgo de incrementos.',
    caracteristicas: [
      'Cuota revisada cada 6 o 12 meses',
      'Índice de referencia: euríbor + diferencial fijo',
      'Tipo inicial más bajo que el fijo',
      'Beneficia si el euríbor baja',
    ],
    alertas: [
      'Simula tu cuota con euríbor al 4-5 % para evaluar el peor escenario',
      'Las revisiones pueden implicar variaciones de cientos de euros al mes',
      'El banco debe entregarte la FEIN y la FIAE antes de firmar',
    ],
  },
  mixta: {
    titulo: 'Hipoteca Mixta',
    subtitulo: 'Tipo fijo los primeros 5-10 años, variable el resto',
    descripcion: 'La hipoteca mixta combina un período inicial a tipo fijo con el resto a tipo variable referenciado al euríbor. Ofrece estabilidad inicial cuando el capital es mayor, y mayor flexibilidad después. Es una opción equilibrada para quienes no quieren renunciar del todo a la seguridad ni al ahorro potencial.',
    caracteristicas: [
      'Fase fija inicial: habitualmente 5, 7 o 10 años',
      'Fase variable: euríbor + diferencial',
      'Buena opción si planeas amortizar al inicio',
      'Menor cuota inicial que la pura fija',
    ],
    alertas: [
      'Verifica exactamente cuántos años dura la fase fija',
      'Si vendes antes de que termine el período fijo, habrás pagado más sin aprovecharlo',
      'Compara el coste total (TAE) con fija y variable puras',
    ],
  },
  verde: {
    titulo: 'Hipoteca Verde',
    subtitulo: 'Bonificación en el tipo si la vivienda tiene certificado energético A o B',
    descripcion: 'La hipoteca verde ofrece condiciones especiales —tipo bonificado o mejores diferenciales— a quienes compran viviendas con certificado de eficiencia energética A o B. Disponible como variante fija, variable o mixta con descuento adicional.',
    caracteristicas: [
      'Bonificación sobre el tipo por eficiencia energética',
      'Requiere certificado energético A o B',
      'Aplica en obra nueva y grandes rehabilitaciones',
      'Disponible como fija, variable o mixta',
    ],
    alertas: [
      'Verifica que la bonificación verde compensa frente a la hipoteca estándar equivalente',
      'El certificado debe estar inscrito en el registro autonómico',
      'Comprueba si la bonificación es permanente o solo durante los primeros años',
    ],
  },
};

export function recomendarTipoHipoteca(perfil: PerfilHipoteca): ResultadoSelector {
  const puntos: Record<TipoHipotecaKey, number> = { fija: 0, variable: 0, mixta: 0, verde: 0 };

  // P1 — Tolerancia a variación de cuota
  if (perfil.tolerancia_euribor === 'baja')  { puntos.fija += 5; }
  if (perfil.tolerancia_euribor === 'media') { puntos.mixta += 3; puntos.variable += 2; }
  if (perfil.tolerancia_euribor === 'alta')  { puntos.variable += 5; }

  // P2 — Plazo
  if (perfil.plazo_anos < 15)                    { puntos.fija += 3; puntos.variable += 2; }
  else if (perfil.plazo_anos <= 25)               { puntos.fija += 3; puntos.mixta += 2; }
  else                                            { puntos.variable += 3; puntos.mixta += 3; }

  // P3 — Situación laboral
  if (perfil.situacion_laboral === 'indefinido_estable') { puntos.fija += 3; puntos.mixta += 2; }
  if (perfil.situacion_laboral === 'autonomo_variable')  { puntos.variable += 3; puntos.mixta += 2; }
  if (perfil.situacion_laboral === 'doble_nomina')       { puntos.variable += 4; puntos.mixta += 2; }
  if (perfil.situacion_laboral === 'temporal')           { puntos.fija += 4; }

  // P4 — Eficiencia energética
  if (perfil.vivienda_eficiente) { puntos.verde += 6; }

  // P5 — Capacidad de amortización anticipada
  if (perfil.puede_amortizar_regularmente) { puntos.variable += 4; puntos.mixta += 2; }
  else                                      { puntos.fija += 4; }

  // P6 — Horizonte de venta
  if (perfil.vende_antes_10_anos === true)  { puntos.variable += 4; puntos.mixta += 2; }
  if (perfil.vende_antes_10_anos === null)  { puntos.mixta += 3; puntos.variable += 1; }
  if (perfil.vende_antes_10_anos === false) { puntos.fija += 4; puntos.mixta += 1; }

  // P7 — Preferencia de cuota
  if (perfil.preferencia_cuota === 'siempre_fija')      { puntos.fija += 5; }
  if (perfil.preferencia_cuota === 'fija_inicio')       { puntos.mixta += 5; }
  if (perfil.preferencia_cuota === 'acepta_variable')   { puntos.variable += 5; }

  // P8 — Ratio préstamo/ingresos
  if (perfil.ratio_prestamo_ingresos === 'alto')  { puntos.fija += 4; }
  if (perfil.ratio_prestamo_ingresos === 'medio') { puntos.fija += 2; puntos.mixta += 2; }
  if (perfil.ratio_prestamo_ingresos === 'bajo')  { puntos.variable += 3; puntos.mixta += 2; }

  // P9 — Tipo de vivienda
  if (perfil.tipo_vivienda === 'primera')           { puntos.fija += 3; puntos.mixta += 2; }
  if (perfil.tipo_vivienda === 'segunda_vacacional') { puntos.variable += 3; puntos.mixta += 2; }
  if (perfil.tipo_vivienda === 'inversion')          { puntos.variable += 4; puntos.mixta += 2; }

  // P10 — Titulares
  if (perfil.titulares_con_ingresos === 2) { puntos.variable += 3; puntos.mixta += 3; }
  if (perfil.titulares_con_ingresos === 1) { puntos.fija += 3; puntos.mixta += 1; }

  // Determinar ganador y segunda opción
  const ordenados = (Object.keys(puntos) as TipoHipotecaKey[])
    .sort((a, b) => puntos[b] - puntos[a]);
  const ganador = ordenados[0];
  const segundaOpcion = ordenados[1] !== ganador && puntos[ordenados[1]] > 0 ? ordenados[1] : null;

  return {
    tipo_recomendado: ganador,
    ...DESCRIPCIONES[ganador],
    puntuaciones: puntos,
    segunda_opcion: segundaOpcion,
  };
}
