// Base de datos de plazos legales en España
// Información orientativa - Verificar siempre con fuentes oficiales

export type PlazoCategory =
  | 'consumo'
  | 'deudas'
  | 'laboral'
  | 'fiscal'
  | 'civil'
  | 'trafico'
  | 'penal'
  | 'administrativo';

export interface PlazoLegal {
  id: string;
  title: string;
  plazo: string;
  plazoValue: number; // En días, para ordenar
  category: PlazoCategory;
  description: string;
  details: string;
  legalReference: string;
  important?: boolean;
  keywords: string[];
}

export interface CategoryInfo {
  id: PlazoCategory;
  name: string;
  icon: string;
  description: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'consumo', name: 'Consumo', icon: '🛒', description: 'Garantías, devoluciones, reclamaciones' },
  { id: 'deudas', name: 'Deudas', icon: '💳', description: 'Prescripción de deudas y obligaciones' },
  { id: 'laboral', name: 'Laboral', icon: '💼', description: 'Despidos, salarios, prestaciones' },
  { id: 'fiscal', name: 'Fiscal', icon: '🏛️', description: 'Impuestos, declaraciones, sanciones' },
  { id: 'civil', name: 'Civil', icon: '⚖️', description: 'Contratos, herencias, familia' },
  { id: 'trafico', name: 'Tráfico', icon: '🚗', description: 'Multas, puntos, recursos' },
  { id: 'penal', name: 'Penal', icon: '🔒', description: 'Prescripción de delitos y faltas' },
  { id: 'administrativo', name: 'Administrativo', icon: '📋', description: 'Recursos, reclamaciones a la administración' },
];

export const PLAZOS_LEGALES: PlazoLegal[] = [
  // ==========================================
  // CONSUMO
  // ==========================================
  {
    id: 'garantia-productos',
    title: 'Garantía legal de productos',
    plazo: '3 años',
    plazoValue: 1095,
    category: 'consumo',
    description: 'Plazo para reclamar defectos en productos nuevos comprados a partir de enero 2022.',
    details: 'Se cuenta desde la entrega del producto. Durante los primeros 2 años, se presume que el defecto ya existía (inversión de la carga de la prueba). Para productos de segunda mano, el plazo mínimo es de 1 año.',
    legalReference: 'Art. 120 TRLGDCU (RD 1/2007, modificado por RD-ley 7/2021)',
    important: true,
    keywords: ['garantia', 'producto defectuoso', 'reparacion', 'sustitucion', 'devolucion'],
  },
  {
    id: 'desistimiento-online',
    title: 'Derecho de desistimiento (compras online)',
    plazo: '14 días',
    plazoValue: 14,
    category: 'consumo',
    description: 'Plazo para devolver una compra online sin dar explicaciones.',
    details: 'Se cuenta desde la recepción del producto (o desde la contratación en servicios). No aplica a productos personalizados, perecederos, o contenido digital descargado. El vendedor tiene 14 días para devolver el dinero.',
    legalReference: 'Art. 102-108 TRLGDCU',
    important: true,
    keywords: ['devolucion', 'desistimiento', 'online', 'internet', 'ecommerce', '14 dias'],
  },
  {
    id: 'respuesta-reclamacion',
    title: 'Respuesta a reclamación de consumo',
    plazo: '30 días',
    plazoValue: 30,
    category: 'consumo',
    description: 'Plazo máximo para que una empresa responda a tu reclamación.',
    details: 'Si no responden, puedes acudir directamente a organismos de consumo o arbitraje.',
    legalReference: 'Art. 21 TRLGDCU',
    keywords: ['reclamacion', 'respuesta', 'consumidor', 'queja'],
  },
  {
    id: 'entrega-producto',
    title: 'Entrega de productos comprados',
    plazo: '30 días',
    plazoValue: 30,
    category: 'consumo',
    description: 'Plazo máximo de entrega si no se acordó otro.',
    details: 'Si no entregan en plazo, puedes dar un plazo adicional razonable. Si sigue sin cumplirse, puedes resolver el contrato y recuperar el dinero.',
    legalReference: 'Art. 66 bis TRLGDCU',
    keywords: ['entrega', 'envio', 'retraso', 'pedido'],
  },
  {
    id: 'devolucion-dinero-desistimiento',
    title: 'Devolución del dinero tras desistimiento',
    plazo: '14 días',
    plazoValue: 14,
    category: 'consumo',
    description: 'Plazo para que el vendedor devuelva el dinero tras ejercer desistimiento.',
    details: 'El vendedor puede esperar a recibir el producto de vuelta o prueba de envío. Si no devuelve en plazo, debe pagar el doble.',
    legalReference: 'Art. 107 TRLGDCU',
    keywords: ['devolucion', 'reembolso', 'dinero', 'desistimiento'],
  },
  {
    id: 'reclamacion-aerea',
    title: 'Reclamación a aerolínea (retraso/cancelación)',
    plazo: '5 años',
    plazoValue: 1825,
    category: 'consumo',
    description: 'Plazo para reclamar compensación por retraso o cancelación de vuelo.',
    details: 'Según el Reglamento 261/2004 de la UE: compensación de 250-600€ según distancia. Aplica prescripción general de acciones personales del Código Civil español.',
    legalReference: 'Reglamento CE 261/2004 + Art. 1964 CC',
    keywords: ['vuelo', 'avion', 'retraso', 'cancelacion', 'aerolinea', 'compensacion'],
  },

  // ==========================================
  // DEUDAS Y PRESCRIPCIÓN
  // ==========================================
  {
    id: 'prescripcion-deudas-general',
    title: 'Prescripción de deudas (general)',
    plazo: '5 años',
    plazoValue: 1825,
    category: 'deudas',
    description: 'Plazo general de prescripción para la mayoría de deudas.',
    details: 'Aplica a préstamos personales, tarjetas de crédito, facturas impagadas, etc. La prescripción se interrumpe si el acreedor reclama judicialmente o el deudor reconoce la deuda. Antes de octubre 2015 eran 15 años.',
    legalReference: 'Art. 1964 Código Civil (modificado por Ley 42/2015)',
    important: true,
    keywords: ['deuda', 'prescripcion', 'prestamo', 'tarjeta', 'impago', 'factura'],
  },
  {
    id: 'prescripcion-hipoteca',
    title: 'Prescripción acción hipotecaria',
    plazo: '20 años',
    plazoValue: 7300,
    category: 'deudas',
    description: 'Plazo para que el banco ejecute una hipoteca impagada.',
    details: 'Se cuenta desde el vencimiento de la obligación (impago). El banco puede ejecutar la hipoteca durante este tiempo.',
    legalReference: 'Art. 1964 Código Civil',
    keywords: ['hipoteca', 'ejecucion', 'impago', 'vivienda', 'banco'],
  },
  {
    id: 'prescripcion-suministros',
    title: 'Deudas de suministros (luz, gas, agua)',
    plazo: '5 años',
    plazoValue: 1825,
    category: 'deudas',
    description: 'Prescripción de facturas impagadas de suministros.',
    details: 'Antes de octubre 2015, el plazo era de 3 años para suministros. Ahora aplica el plazo general de 5 años.',
    legalReference: 'Art. 1964 CC (antes Art. 1967 CC)',
    keywords: ['luz', 'gas', 'agua', 'suministro', 'factura', 'recibo'],
  },
  {
    id: 'prescripcion-telefonia',
    title: 'Deudas de telefonía',
    plazo: '5 años',
    plazoValue: 1825,
    category: 'deudas',
    description: 'Prescripción de facturas de móvil, internet, TV.',
    details: 'Aplica el plazo general de prescripción. Los ficheros de morosos (ASNEF, etc.) deben eliminar los datos a los 5 años desde el vencimiento.',
    legalReference: 'Art. 1964 CC',
    keywords: ['telefono', 'movil', 'internet', 'fibra', 'operadora', 'asnef'],
  },
  {
    id: 'reclamacion-bancaria',
    title: 'Reclamación a entidad bancaria',
    plazo: '2 años',
    plazoValue: 730,
    category: 'deudas',
    description: 'Plazo para reclamar al Banco de España tras queja al banco.',
    details: 'Primero debes reclamar al Servicio de Atención al Cliente del banco. Si no responden en 2 meses o no estás conforme, puedes acudir al Banco de España. El plazo de 2 años es desde que detectas el problema.',
    legalReference: 'Orden ECC/2502/2012',
    keywords: ['banco', 'comision', 'reclamacion', 'banco espana', 'hipoteca', 'clausula'],
  },

  // ==========================================
  // LABORAL
  // ==========================================
  {
    id: 'impugnacion-despido',
    title: 'Impugnar despido',
    plazo: '20 días hábiles',
    plazoValue: 28,
    category: 'laboral',
    description: 'Plazo para demandar por despido improcedente o nulo.',
    details: 'Se cuentan días hábiles (no sábados, domingos ni festivos). Comienza desde el día siguiente al despido efectivo. Antes de demandar hay que intentar conciliación en el SMAC.',
    legalReference: 'Art. 59.3 Estatuto de los Trabajadores',
    important: true,
    keywords: ['despido', 'impugnar', 'demanda', 'laboral', 'finiquito'],
  },
  {
    id: 'reclamacion-salarios',
    title: 'Reclamar salarios impagados',
    plazo: '1 año',
    plazoValue: 365,
    category: 'laboral',
    description: 'Plazo para reclamar nóminas no pagadas.',
    details: 'Se cuenta desde el día en que debió pagarse el salario. Aplica también a pagas extras, comisiones, etc.',
    legalReference: 'Art. 59.2 Estatuto de los Trabajadores',
    keywords: ['salario', 'nomina', 'impago', 'sueldo', 'paga'],
  },
  {
    id: 'solicitar-prestacion-desempleo',
    title: 'Solicitar prestación por desempleo',
    plazo: '15 días hábiles',
    plazoValue: 21,
    category: 'laboral',
    description: 'Plazo para solicitar el paro tras perder el empleo.',
    details: 'Si lo solicitas después, pierdes días de prestación por cada día de retraso. Debes inscribirte primero como demandante de empleo en el SEPE.',
    legalReference: 'Art. 268 LGSS',
    important: true,
    keywords: ['paro', 'desempleo', 'prestacion', 'sepe', 'inem'],
  },
  {
    id: 'reclamacion-accidente-trabajo',
    title: 'Reclamar por accidente de trabajo',
    plazo: '1 año',
    plazoValue: 365,
    category: 'laboral',
    description: 'Plazo para reclamar indemnización por accidente laboral.',
    details: 'Se cuenta desde que se estabilizan las secuelas o se determina la incapacidad.',
    legalReference: 'Art. 59 ET',
    keywords: ['accidente', 'trabajo', 'indemnizacion', 'lesion', 'secuelas'],
  },

  // ==========================================
  // FISCAL
  // ==========================================
  {
    id: 'prescripcion-deuda-hacienda',
    title: 'Prescripción deuda con Hacienda',
    plazo: '4 años',
    plazoValue: 1460,
    category: 'fiscal',
    description: 'Plazo para que Hacienda reclame impuestos no pagados.',
    details: 'Se cuenta desde el día siguiente al fin del plazo de declaración voluntaria. Se interrumpe con cualquier actuación de Hacienda o del contribuyente.',
    legalReference: 'Art. 66 Ley General Tributaria',
    important: true,
    keywords: ['hacienda', 'impuestos', 'irpf', 'iva', 'deuda', 'agencia tributaria'],
  },
  {
    id: 'solicitar-devolucion-irpf',
    title: 'Solicitar devolución IRPF',
    plazo: '4 años',
    plazoValue: 1460,
    category: 'fiscal',
    description: 'Plazo para pedir la devolución de impuestos pagados de más.',
    details: 'Puedes solicitar rectificación de autoliquidación si pagaste más de lo debido.',
    legalReference: 'Art. 66 LGT',
    keywords: ['devolucion', 'irpf', 'renta', 'declaracion', 'rectificacion'],
  },
  {
    id: 'recurso-sancion-hacienda',
    title: 'Recurrir sanción de Hacienda',
    plazo: '1 mes',
    plazoValue: 30,
    category: 'fiscal',
    description: 'Plazo para recurrir una sanción o liquidación tributaria.',
    details: 'Recurso de reposición (1 mes) o reclamación económico-administrativa (1 mes). Los plazos son independientes.',
    legalReference: 'Art. 223-235 LGT',
    keywords: ['recurso', 'sancion', 'hacienda', 'liquidacion', 'multa'],
  },
  {
    id: 'presentar-declaracion-renta',
    title: 'Presentar declaración de la renta',
    plazo: 'Abril-Junio (anual)',
    plazoValue: 180,
    category: 'fiscal',
    description: 'Plazo para presentar la declaración del IRPF.',
    details: 'Normalmente del 2 de abril al 30 de junio. Si sale a pagar y se domicilia, el plazo acaba unos días antes.',
    legalReference: 'Orden Ministerial anual',
    keywords: ['renta', 'declaracion', 'irpf', 'campaña', 'abril', 'junio'],
  },

  // ==========================================
  // CIVIL
  // ==========================================
  {
    id: 'aceptar-herencia',
    title: 'Aceptar o renunciar herencia',
    plazo: '30 años',
    plazoValue: 10950,
    category: 'civil',
    description: 'Plazo máximo para aceptar una herencia.',
    details: 'No hay plazo mínimo, pero Hacienda puede reclamar el impuesto de sucesiones a los 4 años y 6 meses del fallecimiento si no se ha liquidado.',
    legalReference: 'Art. 1016 Código Civil',
    keywords: ['herencia', 'aceptar', 'renunciar', 'sucesion', 'testamento'],
  },
  {
    id: 'impuesto-sucesiones',
    title: 'Pagar impuesto de sucesiones',
    plazo: '6 meses',
    plazoValue: 180,
    category: 'civil',
    description: 'Plazo para liquidar el impuesto de sucesiones.',
    details: 'Desde el fallecimiento. Se puede pedir prórroga de 6 meses más dentro de los primeros 5 meses. Con prórroga se pagan intereses de demora.',
    legalReference: 'Art. 67.1 Reglamento ISD',
    important: true,
    keywords: ['sucesiones', 'herencia', 'impuesto', 'fallecimiento', 'hacienda'],
  },
  {
    id: 'reclamacion-danos',
    title: 'Reclamar daños y perjuicios',
    plazo: '1 año (extracontractual) / 5 años (contractual)',
    plazoValue: 365,
    category: 'civil',
    description: 'Plazo para reclamar indemnización por daños.',
    details: 'Responsabilidad extracontractual (accidentes, negligencias): 1 año desde que se conoce el daño. Responsabilidad contractual: 5 años.',
    legalReference: 'Art. 1968.2 CC (extracontractual) / Art. 1964 CC (contractual)',
    keywords: ['daños', 'perjuicios', 'indemnizacion', 'responsabilidad', 'accidente'],
  },
  {
    id: 'divorcio-mutuo-acuerdo',
    title: 'Divorciarse de mutuo acuerdo',
    plazo: '3 meses de matrimonio',
    plazoValue: 90,
    category: 'civil',
    description: 'Tiempo mínimo de matrimonio para poder divorciarse.',
    details: 'No se exige separación previa. El divorcio puede ser de mutuo acuerdo (notarial si no hay hijos menores) o contencioso.',
    legalReference: 'Art. 86 Código Civil',
    keywords: ['divorcio', 'separacion', 'matrimonio', 'mutuo acuerdo'],
  },

  // ==========================================
  // TRÁFICO
  // ==========================================
  {
    id: 'prescripcion-multa-trafico',
    title: 'Prescripción multa de tráfico',
    plazo: '3 meses (leve) / 6 meses (grave) / 1 año (muy grave)',
    plazoValue: 365,
    category: 'trafico',
    description: 'Plazo para que prescriba una infracción de tráfico.',
    details: 'Se cuenta desde la fecha de la infracción. La notificación interrumpe la prescripción. Las multas de radar son graves (6 meses).',
    legalReference: 'Art. 112 Ley de Tráfico',
    keywords: ['multa', 'trafico', 'radar', 'velocidad', 'dgt', 'prescripcion'],
  },
  {
    id: 'recurso-multa-trafico',
    title: 'Recurrir multa de tráfico',
    plazo: '20 días naturales',
    plazoValue: 20,
    category: 'trafico',
    description: 'Plazo para presentar alegaciones o recurso contra multa.',
    details: 'Desde la notificación. Si pagas en 20 días tienes 50% de descuento pero renuncias a recurrir.',
    legalReference: 'Art. 94 Ley de Tráfico',
    important: true,
    keywords: ['multa', 'recurso', 'alegaciones', 'trafico', 'dgt'],
  },
  {
    id: 'recuperar-puntos-carnet',
    title: 'Recuperar puntos del carnet',
    plazo: '2-3 años',
    plazoValue: 730,
    category: 'trafico',
    description: 'Plazo para recuperar puntos automáticamente.',
    details: 'Sin infracciones graves: recuperas todos los puntos a los 2 años. Sin infracciones muy graves: a los 3 años. También puedes hacer cursos de recuperación.',
    legalReference: 'Art. 66 Ley de Tráfico',
    keywords: ['puntos', 'carnet', 'recuperar', 'conducir', 'permiso'],
  },
  {
    id: 'caducidad-permiso-conducir',
    title: 'Renovar permiso de conducir',
    plazo: '10 años (< 65 años) / 5 años (≥ 65 años)',
    plazoValue: 3650,
    category: 'trafico',
    description: 'Vigencia del permiso de conducir.',
    details: 'Puedes renovar hasta 3 meses antes del vencimiento. Si lo renuevas después, necesitas un nuevo reconocimiento médico.',
    legalReference: 'Art. 12 Reglamento General de Conductores',
    keywords: ['renovar', 'carnet', 'conducir', 'permiso', 'caducidad'],
  },

  // ==========================================
  // PENAL
  // ==========================================
  {
    id: 'prescripcion-delito-leve',
    title: 'Prescripción delito leve',
    plazo: '1 año',
    plazoValue: 365,
    category: 'penal',
    description: 'Plazo de prescripción para delitos leves (antes faltas).',
    details: 'Hurtos menores de 400€, amenazas leves, etc. Se cuenta desde la comisión del delito.',
    legalReference: 'Art. 131 Código Penal',
    keywords: ['delito leve', 'falta', 'prescripcion', 'penal', 'denuncia'],
  },
  {
    id: 'prescripcion-delito-menos-grave',
    title: 'Prescripción delito menos grave',
    plazo: '5 años',
    plazoValue: 1825,
    category: 'penal',
    description: 'Delitos con pena de 3 meses a 5 años de prisión.',
    details: 'Estafas, robos con fuerza, lesiones, etc.',
    legalReference: 'Art. 131 Código Penal',
    keywords: ['delito', 'prescripcion', 'robo', 'estafa', 'lesiones'],
  },
  {
    id: 'prescripcion-delito-grave',
    title: 'Prescripción delito grave',
    plazo: '10-20 años',
    plazoValue: 3650,
    category: 'penal',
    description: 'Delitos con penas de más de 5 años de prisión.',
    details: 'Homicidio: 15 años. Asesinato: 20 años. Terrorismo con resultado de muerte: no prescribe.',
    legalReference: 'Art. 131 Código Penal',
    keywords: ['delito grave', 'homicidio', 'prescripcion', 'penal'],
  },
  {
    id: 'plazo-denuncia',
    title: 'Plazo para denunciar',
    plazo: 'Sin límite (mientras no prescriba el delito)',
    plazoValue: 36500,
    category: 'penal',
    description: 'No hay plazo para interponer denuncia.',
    details: 'Puedes denunciar mientras el delito no haya prescrito. Para delitos privados (injurias, calumnias) el plazo es de 6 meses.',
    legalReference: 'Art. 131-132 Código Penal',
    keywords: ['denuncia', 'plazo', 'delito', 'policia', 'juzgado'],
  },

  // ==========================================
  // ADMINISTRATIVO
  // ==========================================
  {
    id: 'recurso-alzada',
    title: 'Recurso de alzada',
    plazo: '1 mes',
    plazoValue: 30,
    category: 'administrativo',
    description: 'Plazo para recurrir actos administrativos ante el superior.',
    details: 'Contra resoluciones que no agotan la vía administrativa. Se presenta ante el órgano que dictó el acto o ante el superior jerárquico.',
    legalReference: 'Art. 122 Ley 39/2015 LPACAP',
    keywords: ['recurso', 'alzada', 'administracion', 'resolucion'],
  },
  {
    id: 'recurso-reposicion-admin',
    title: 'Recurso de reposición administrativo',
    plazo: '1 mes',
    plazoValue: 30,
    category: 'administrativo',
    description: 'Recurso potestativo contra actos que agotan vía administrativa.',
    details: 'Es opcional: puedes ir directamente a contencioso-administrativo. Se presenta ante el mismo órgano que dictó el acto.',
    legalReference: 'Art. 123-124 Ley 39/2015',
    keywords: ['recurso', 'reposicion', 'administracion', 'potestativo'],
  },
  {
    id: 'recurso-contencioso',
    title: 'Recurso contencioso-administrativo',
    plazo: '2 meses',
    plazoValue: 60,
    category: 'administrativo',
    description: 'Plazo para acudir a los tribunales contra la Administración.',
    details: 'Se cuenta desde la notificación del acto o la publicación en boletín oficial. Si hubo silencio administrativo, el plazo es de 6 meses.',
    legalReference: 'Art. 46 Ley 29/1998 LJCA',
    keywords: ['contencioso', 'administrativo', 'tribunal', 'demanda', 'administracion'],
  },
  {
    id: 'silencio-administrativo',
    title: 'Silencio administrativo',
    plazo: '3 meses (general)',
    plazoValue: 90,
    category: 'administrativo',
    description: 'Plazo máximo para que la Administración resuelva.',
    details: 'Si no resuelven, generalmente se entiende desestimado (silencio negativo). En algunos casos específicos el silencio es positivo.',
    legalReference: 'Art. 24 Ley 39/2015',
    keywords: ['silencio', 'administrativo', 'resolucion', 'plazo', 'solicitud'],
  },
  {
    id: 'reclamacion-patrimonial',
    title: 'Reclamación patrimonial a la Administración',
    plazo: '1 año',
    plazoValue: 365,
    category: 'administrativo',
    description: 'Plazo para reclamar daños causados por la Administración.',
    details: 'Desde que se produce el daño o se manifiestan sus efectos. Bache en la carretera, negligencia sanitaria en hospital público, etc.',
    legalReference: 'Art. 67 Ley 39/2015',
    keywords: ['reclamacion', 'patrimonial', 'administracion', 'daños', 'indemnizacion'],
  },
];

// Función para buscar plazos
export function searchPlazos(query: string, category?: PlazoCategory): PlazoLegal[] {
  const normalizedQuery = query.toLowerCase().trim();

  let results = PLAZOS_LEGALES;

  if (category) {
    results = results.filter(p => p.category === category);
  }

  if (normalizedQuery) {
    results = results.filter(p =>
      p.title.toLowerCase().includes(normalizedQuery) ||
      p.description.toLowerCase().includes(normalizedQuery) ||
      p.keywords.some(k => k.toLowerCase().includes(normalizedQuery))
    );
  }

  return results;
}

// Función para obtener plazos por categoría
export function getPlazosByCategory(category: PlazoCategory): PlazoLegal[] {
  return PLAZOS_LEGALES.filter(p => p.category === category);
}

// Función para obtener plazos importantes
export function getImportantPlazos(): PlazoLegal[] {
  return PLAZOS_LEGALES.filter(p => p.important);
}
