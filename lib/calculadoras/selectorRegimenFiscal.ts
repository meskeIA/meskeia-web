// lib/calculadoras/selectorRegimenFiscal.ts
// Lógica del selector de régimen fiscal para autónomos — tools ChatGPT / MCP
// Basada en los mismos pesos del selector web: app/selector-regimen-fiscal-autonomo/page.tsx

export type RegimenFiscalKey = 'modulos' | 'directa_simplificada' | 'directa_normal' | 'sociedad_limitada';

export interface PerfilRegimenFiscal {
  /** ¿La actividad está incluida en módulos (estimación objetiva)? */
  actividad_en_modulos: 'si' | 'no' | 'no_sabe';
  /** Facturación anual estimada */
  facturacion_anual: 'menos_150k' | '150k_600k' | 'mas_600k';
  /** Nivel de gastos reales respecto a los ingresos */
  nivel_gastos: 'pocos' | 'moderados' | 'muchos';
  /** Tipo de clientes predominante */
  clientes_con_retencion: 'empresas' | 'particulares' | 'mixto';
  /** Empleados actuales o previstos */
  empleados: 'ninguno' | 'uno_a_cinco' | 'mas_cinco';
  /** Crecimiento previsto del negocio */
  crecimiento_previsto: 'estable' | 'moderado' | 'rapido';
  /** Importancia de proteger el patrimonio personal */
  proteccion_patrimonio: 'no_importante' | 'deseable' | 'muy_importante';
  /** Actividad con clientes internacionales */
  clientes_internacionales: 'no' | 'ocasional' | 'importante';
  /** Complejidad administrativa que el autónomo puede asumir */
  complejidad_aceptable: 'minima' | 'basica' | 'completa';
  /** Situación respecto a los límites de módulos */
  limite_modulos: 'lejos' | 'cerca' | 'superado';
}

interface ResultadoSelectorRegimen {
  regimen_recomendado: RegimenFiscalKey;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  ventajas: string[];
  consideraciones: string[];
  puntuaciones: Record<RegimenFiscalKey, number>;
  segunda_opcion: RegimenFiscalKey | null;
}

const DESCRIPCIONES: Record<RegimenFiscalKey, {
  titulo: string;
  subtitulo: string;
  descripcion: string;
  ventajas: string[];
  consideraciones: string[];
}> = {
  modulos: {
    titulo: 'Estimación Objetiva (Módulos)',
    subtitulo: 'Tributas por parámetros fijos, no por ingresos reales',
    descripcion: 'Tu perfil sugiere que la estimación objetiva (módulos) podría ser una opción favorable. Este régimen calcula el rendimiento neto mediante parámetros objetivos (personal, superficie, potencia instalada...) independientemente de tus ingresos reales. Es especialmente ventajoso si tus ingresos reales superan significativamente lo que dicta el módulo. Solo disponible para actividades específicas incluidas en la Orden ministerial anual, y con límites de facturación y compras.',
    ventajas: [
      'Gestión administrativa muy sencilla',
      'Tributación predecible y estable',
      'Ventajoso si ingresos reales > módulos',
      'No obligatorio llevar libros de ingresos y gastos (salvo excepciones)',
    ],
    consideraciones: [
      'Solo disponible para actividades específicas',
      'Límites: 150.000 € ingresos y 150.000 € compras',
      'Puede ser desventajoso si el negocio va mal',
      'Exclusión automática si superas los límites',
    ],
  },
  directa_simplificada: {
    titulo: 'Estimación Directa Simplificada',
    subtitulo: 'Tributas por ingresos reales menos gastos deducibles',
    descripcion: 'Tu perfil apunta a la estimación directa simplificada como régimen más adecuado. Tributas por la diferencia real entre ingresos y gastos deducibles. La versión simplificada aplica una reducción adicional del 5% en concepto de gastos de difícil justificación (máximo 2.000 €). Es la opción más habitual para profesionales y autónomos con facturación inferior a 600.000 €/año que no puedan o no quieran acogerse a módulos.',
    ventajas: [
      'Deduces gastos reales del negocio',
      'Reducción 5% gastos de difícil justificación (máx. 2.000 €)',
      'Gestión relativamente sencilla',
      'Válida para cualquier actividad (profesional o empresarial)',
    ],
    consideraciones: [
      'Obligatorio llevar libros de ingresos, gastos e inversiones',
      'Pagos fraccionados trimestrales (modelo 130 o 131)',
      'Si superas 600.000 €, pasas a directa normal',
      'Declaración de IVA trimestral (si corresponde)',
    ],
  },
  directa_normal: {
    titulo: 'Estimación Directa Normal',
    subtitulo: 'Contabilidad completa según el Plan General Contable',
    descripcion: 'Tu perfil sugiere la estimación directa normal, bien por necesidad (facturación superior a 600.000 €/año o renuncia voluntaria a la simplificada) o por conveniencia dado el volumen y complejidad de tu negocio. Requiere llevar contabilidad completa ajustada al Plan General Contable (PGC). Permite deducir todo tipo de gastos y provisiones. A estos niveles de facturación, puede ser útil valorar la constitución de una SL.',
    ventajas: [
      'Deduces todos los gastos y provisiones',
      'Mayor precisión fiscal',
      'Sin límites de facturación',
      'Permite contabilidad analítica avanzada',
    ],
    consideraciones: [
      'Obligatorio llevar contabilidad completa (PGC)',
      'Mayor complejidad y coste de gestoría',
      'Obligatorio si facturas > 600.000 €/año',
      'Valorar si una SL sería más eficiente fiscalmente',
    ],
  },
  sociedad_limitada: {
    titulo: 'Constituir una Sociedad Limitada (SL)',
    subtitulo: 'Tributación por Impuesto de Sociedades (IS) al 25%',
    descripcion: 'Tu perfil indica que podrías beneficiarte de constituir una Sociedad Limitada. A partir de ciertos niveles de beneficio (generalmente a partir de 40.000–60.000 € netos anuales), tributar al tipo del Impuesto de Sociedades (25%, o 15% los dos primeros años para nuevas entidades) puede ser más eficiente que el IRPF como autónomo, que puede llegar al 47%. Además, la SL separa el patrimonio personal del empresarial, facilita la captación de socios e inversores y da una imagen más profesional.',
    ventajas: [
      'Tipo IS 25% (o 15% nuevas empresas los 2 primeros años)',
      'Separación patrimonio personal del empresarial',
      'Facilita incorporación de socios e inversores',
      'Mayor imagen corporativa y credibilidad',
    ],
    consideraciones: [
      'Costes de constitución: ~1.000–3.000 €',
      'Obligatorio gestoría/asesor: mayor coste mensual',
      'Contabilidad completa obligatoria (depósito de cuentas)',
      'El dinero de la empresa no es tuyo directamente (vía nómina o dividendos)',
    ],
  },
};

export function recomendarRegimenFiscal(perfil: PerfilRegimenFiscal): ResultadoSelectorRegimen {
  const puntos: Record<RegimenFiscalKey, number> = {
    modulos: 0,
    directa_simplificada: 0,
    directa_normal: 0,
    sociedad_limitada: 0,
  };

  // P1 — Actividad en módulos
  if (perfil.actividad_en_modulos === 'si')       { puntos.modulos += 3; }
  if (perfil.actividad_en_modulos === 'no')        { puntos.directa_simplificada += 2; puntos.directa_normal += 1; }
  if (perfil.actividad_en_modulos === 'no_sabe')   { puntos.directa_simplificada += 1; }

  // P2 — Facturación anual
  if (perfil.facturacion_anual === 'menos_150k')   { puntos.modulos += 2; puntos.directa_simplificada += 2; }
  if (perfil.facturacion_anual === '150k_600k')    { puntos.directa_simplificada += 3; puntos.directa_normal += 1; }
  if (perfil.facturacion_anual === 'mas_600k')     { puntos.directa_normal += 4; puntos.sociedad_limitada += 2; }

  // P3 — Nivel de gastos
  if (perfil.nivel_gastos === 'pocos')             { puntos.modulos += 3; }
  if (perfil.nivel_gastos === 'moderados')         { puntos.directa_simplificada += 2; puntos.modulos += 1; }
  if (perfil.nivel_gastos === 'muchos')            { puntos.directa_simplificada += 2; puntos.directa_normal += 2; }

  // P4 — Clientes con retención
  if (perfil.clientes_con_retencion === 'empresas')     { puntos.directa_simplificada += 2; puntos.directa_normal += 1; }
  if (perfil.clientes_con_retencion === 'particulares') { puntos.modulos += 2; puntos.directa_simplificada += 1; }
  if (perfil.clientes_con_retencion === 'mixto')        { puntos.directa_simplificada += 2; }

  // P5 — Empleados
  if (perfil.empleados === 'ninguno')              { puntos.modulos += 1; puntos.directa_simplificada += 2; }
  if (perfil.empleados === 'uno_a_cinco')          { puntos.directa_simplificada += 2; puntos.directa_normal += 1; puntos.sociedad_limitada += 1; }
  if (perfil.empleados === 'mas_cinco')            { puntos.directa_normal += 2; puntos.sociedad_limitada += 3; }

  // P6 — Crecimiento previsto
  if (perfil.crecimiento_previsto === 'estable')   { puntos.modulos += 1; puntos.directa_simplificada += 2; }
  if (perfil.crecimiento_previsto === 'moderado')  { puntos.directa_simplificada += 1; puntos.directa_normal += 1; }
  if (perfil.crecimiento_previsto === 'rapido')    { puntos.sociedad_limitada += 4; puntos.directa_normal += 1; }

  // P7 — Protección patrimonio
  if (perfil.proteccion_patrimonio === 'no_importante') { puntos.modulos += 1; puntos.directa_simplificada += 2; }
  if (perfil.proteccion_patrimonio === 'deseable')      { puntos.directa_simplificada += 1; puntos.sociedad_limitada += 1; }
  if (perfil.proteccion_patrimonio === 'muy_importante'){ puntos.sociedad_limitada += 4; }

  // P8 — Clientes internacionales
  if (perfil.clientes_internacionales === 'no')         { puntos.modulos += 1; puntos.directa_simplificada += 1; }
  if (perfil.clientes_internacionales === 'ocasional')  { puntos.directa_simplificada += 2; }
  if (perfil.clientes_internacionales === 'importante') { puntos.directa_normal += 2; puntos.sociedad_limitada += 2; }

  // P9 — Complejidad aceptable
  if (perfil.complejidad_aceptable === 'minima')   { puntos.modulos += 3; }
  if (perfil.complejidad_aceptable === 'basica')   { puntos.directa_simplificada += 3; }
  if (perfil.complejidad_aceptable === 'completa') { puntos.directa_normal += 2; puntos.sociedad_limitada += 2; }

  // P10 — Límite módulos
  if (perfil.limite_modulos === 'lejos')           { puntos.modulos += 3; }
  if (perfil.limite_modulos === 'cerca')           { puntos.directa_simplificada += 3; puntos.modulos -= 2; }
  if (perfil.limite_modulos === 'superado')        { puntos.directa_simplificada += 3; puntos.directa_normal += 2; puntos.modulos -= 5; }

  // Determinar ganador y segunda opción
  const ordenados = (Object.keys(puntos) as RegimenFiscalKey[])
    .sort((a, b) => puntos[b] - puntos[a]);
  const ganador = ordenados[0];
  const segundaOpcion = ordenados[1] !== ganador && puntos[ordenados[1]] > 0 ? ordenados[1] : null;

  return {
    regimen_recomendado: ganador,
    ...DESCRIPCIONES[ganador],
    puntuaciones: puntos,
    segunda_opcion: segundaOpcion,
  };
}
