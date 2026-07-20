/**
 * Datos normativos: CNAE-2009 ⇄ IAE (epígrafes)
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento fiscal.
 * El alta censal (modelo 036/037) exige declarar el epígrafe de IAE, y el alta
 * en el RETA exige el código CNAE. Elegir mal el epígrafe puede afectar a
 * obligaciones de IVA, retenciones y cuotas: contrasta siempre con la AEAT o
 * con un asesor antes de presentar el alta.
 *
 * ❗ SUBCONJUNTO CURADO. Esto NO es el catálogo completo. La CNAE-2009 tiene
 * ~700 clases y el IAE varios miles de epígrafes. Aquí solo están las
 * actividades más frecuentes en altas de autónomo en España, y únicamente
 * las correspondencias de las que hay certeza razonable. Cuando no la hay,
 * la entrada se deja SIN epígrafe de IAE (array vacío) y se explica en `notas`:
 * una entrada incompleta es preferible a una correspondencia inventada.
 *
 * 🎚️ NIVEL DE CONFIANZA POR EPÍGRAFE. Cada epígrafe declara su `confianza`:
 *   - 'alta'  → correspondencia y denominación contrastadas y estables.
 *   - 'media' → orienta bien, pero algo no está verificado (el número del
 *               epígrafe, su literal exacto o el encaje de la actividad).
 *               El campo `notaConfianza` dice qué es lo dudoso en cada caso.
 * El sesgo de clasificación es conservador: ante la duda entre un nivel y otro,
 * se declara 'media'. La app DEBE mostrar esta distinción a quien la consulte;
 * un epígrafe 'media' no debe presentarse como dato cierto.
 *
 * Fuente CNAE: RD 475/2007, clasificación CNAE-2009 (INE)
 * Fuente IAE: RD Legislativo 1175/1990, tarifas e instrucción del IAE (AEAT)
 * Verificado: 2026-07-20
 */

export const CNAE_IAE_META = {
  fuente:
    'CNAE-2009 (RD 475/2007, INE) + Tarifas del IAE (RD Legislativo 1175/1990, AEAT)',
  descripcion:
    'Catálogo curado de correspondencias orientativas entre códigos CNAE-2009 y epígrafes del IAE para las actividades más habituales en altas de autónomo en España',
  verificado: '2026-07-20',
  vigencia: '2026',
  urlOficialCnae: 'https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736177032',
  urlOficialIae: 'https://sede.agenciatributaria.gob.es/Sede/impuesto-actividades-economicas-iae.html',
  // Compatibilidad con la convención del resto de módulos de data/fiscal/
  urlOficial: 'https://sede.agenciatributaria.gob.es/Sede/impuesto-actividades-economicas-iae.html',
  esSubconjuntoCurado: true,
  // El reparto de epígrafes por nivel de confianza NO se hardcodea aquí: vive en
  // COBERTURA_CATALOGO (final del módulo), que lo calcula sobre los datos reales.
  // Duplicar la cifra garantiza que un día divergirá del dataset.
  escalaConfianza:
    "'alta' = correspondencia y denominación contrastadas; 'media' = orientativa, con el número del epígrafe, su literal o su encaje sin verificar (detalle en notaConfianza). No hay nivel 'baja': lo que no alcanza 'media' no se incluye.",
  cobertura:
    'Subconjunto curado, NO el catálogo completo. Cubre las actividades más frecuentes en altas de autónomo; no incluye las ~700 clases CNAE ni los miles de epígrafes del IAE.',
  nota:
    'La correspondencia CNAE⇄IAE no es oficial ni biunívoca: no existe tabla oficial de equivalencia. Una misma actividad puede admitir varios epígrafes según se ejerza de forma empresarial (Sección 1ª) o profesional (Sección 2ª). Las entradas sin epígrafe indican falta de certeza, no ausencia de epígrafe.',
} as const;

// ─── Tipos ──────────────────────────────────────────────────────────────────

/** Secciones de las Tarifas del IAE */
export type SeccionIAE = '1ª' | '2ª' | '3ª';

/**
 * Grado de certeza de la correspondencia declarada.
 * - 'alta': número, literal y encaje contrastados.
 * - 'media': orienta bien, pero algo no está verificado (ver `notaConfianza`).
 */
export type ConfianzaEpigrafe = 'alta' | 'media';

/** Epígrafe (o grupo) de las Tarifas del IAE */
export interface EpigrafeIAE {
  /** Código del epígrafe o grupo, tal y como figura en las Tarifas (p. ej. '722', '505.6') */
  epigrafe: string;
  /** Denominación del epígrafe */
  descripcion: string;
  /** Sección de las Tarifas a la que pertenece */
  seccion: SeccionIAE;
  /** Grado de certeza de esta correspondencia. Obligatorio: no hay epígrafes sin declarar */
  confianza: ConfianzaEpigrafe;
  /** Solo en los 'media': qué es exactamente lo que no está verificado */
  notaConfianza?: string;
}

/** Actividad económica: código CNAE-2009 + epígrafes IAE orientativos */
export interface ActividadCnaeIae {
  /** Código CNAE-2009 de clase (4 dígitos) */
  cnae: string;
  /** Denominación oficial de la clase según el INE */
  descripcionCnae: string;
  /** Epígrafes IAE orientativos. Vacío = sin certeza suficiente (ver `notas`) */
  iae: EpigrafeIAE[];
  /** Términos coloquiales con los que la gente describe la actividad al buscarla */
  sinonimos: string[];
  /** Matices relevantes: empresarial vs. profesional, confusiones habituales, no sujeción... */
  notas?: string;
}

// ─── Secciones del IAE explicadas ───────────────────────────────────────────

export interface DescripcionSeccionIAE {
  seccion: SeccionIAE;
  nombre: string;
  quienes: string;
  implicacion: string;
}

export const SECCIONES_IAE: DescripcionSeccionIAE[] = [
  {
    seccion: '1ª',
    nombre: 'Actividades empresariales',
    quienes:
      'Actividades ganaderas independientes, mineras, industriales, comerciales y de servicios ejercidas de forma empresarial (con local, medios materiales o personal organizado).',
    implicacion:
      'Las facturas emitidas por actividades empresariales no llevan, con carácter general, retención de IRPF.',
  },
  {
    seccion: '2ª',
    nombre: 'Actividades profesionales',
    quienes:
      'Ejercicio individual de una profesión (abogacía, medicina, programación, economía, docencia...) por cuenta propia, sin estructura empresarial.',
    implicacion:
      'Las facturas a empresas y a otros profesionales llevan retención de IRPF (15 %, o 7 % los tres primeros años de actividad).',
  },
  {
    seccion: '3ª',
    nombre: 'Actividades artísticas',
    quienes:
      'Cine, teatro, circo, baile, música, deporte y espectáculos taurinos ejercidos por cuenta propia.',
    implicacion:
      'Tratamiento análogo al de las actividades profesionales a efectos de retención de IRPF.',
  },
];

// ─── Catálogo curado ────────────────────────────────────────────────────────

/**
 * Actividades más frecuentes en altas de autónomo, ordenadas por código CNAE.
 * Las entradas con `iae: []` son deliberadas: se conoce el CNAE pero no hay
 * certeza sobre el epígrafe, y no se rellena por simetría.
 */
export const ACTIVIDADES_CNAE_IAE: ActividadCnaeIae[] = [
  // ── A. Agricultura, ganadería, silvicultura ──────────────────────────────
  {
    cnae: '0111',
    descripcionCnae: 'Cultivo de cereales (excepto arroz), leguminosas y semillas oleaginosas',
    iae: [],
    sinonimos: ['agricultor', 'agricultura', 'cereal', 'trigo', 'cebada', 'girasol', 'labrador', 'campo', 'finca', 'secano', 'chacarero'],
    notas: 'Las actividades agrícolas, forestales y ganaderas dependientes NO están sujetas al IAE: no hay epígrafe que declarar, aunque el alta censal (036/037) sí exige el CNAE.',
  },
  {
    cnae: '0113',
    descripcionCnae: 'Cultivo de hortalizas, raíces y tubérculos',
    iae: [],
    sinonimos: ['horticultor', 'huerta', 'hortalizas', 'verduras', 'tomate', 'patata', 'invernadero', 'agricultura ecológica'],
    notas: 'Actividad agrícola: no sujeta al IAE.',
  },
  {
    cnae: '0121',
    descripcionCnae: 'Cultivo de la vid',
    iae: [],
    sinonimos: ['viticultor', 'viñedo', 'uva', 'bodega de uva', 'vendimia', 'viña'],
    notas: 'El cultivo de la vid no está sujeto al IAE. La elaboración y venta de vino sí es actividad industrial/comercial sujeta.',
  },
  {
    cnae: '0145',
    descripcionCnae: 'Explotación de ganado ovino y caprino',
    iae: [],
    sinonimos: ['ganadero', 'ovejas', 'cabras', 'rebaño', 'pastor', 'ganadería', 'leche de oveja'],
    notas: 'La ganadería DEPENDIENTE (vinculada a explotación agrícola propia) no está sujeta al IAE; la ganadería INDEPENDIENTE sí lo está, en la División 0 de la Sección 1ª. Verificar cuál es el caso antes del alta.',
  },
  {
    cnae: '0161',
    descripcionCnae: 'Actividades de apoyo a la agricultura',
    iae: [],
    sinonimos: ['servicios agrícolas', 'trabajos con tractor', 'poda', 'recolección para terceros', 'fumigación', 'maquinaria agrícola a terceros'],
    notas: 'A diferencia del cultivo propio, prestar servicios agrícolas a terceros SÍ suele estar sujeto al IAE. Verificar el epígrafe concreto en la Agrupación 91 de la Sección 1ª.',
  },

  // ── C. Industria manufacturera ───────────────────────────────────────────
  {
    cnae: '1071',
    descripcionCnae: 'Fabricación de pan y de productos frescos de panadería y pastelería',
    iae: [
      {
        epigrafe: '419.1',
        descripcion: 'Industrias del pan y de la bollería',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto y el reparto interno del grupo 419 (pan, bollería, pastelería y masas fritas van en epígrafes distintos).',
      },
    ],
    sinonimos: ['panadero', 'obrador', 'panadería', 'hacer pan', 'masa madre', 'bollería', 'pastelero', 'repostería artesanal', 'horno'],
    notas: 'Fabricar es distinto de solo vender: si únicamente vendes pan comprado a un obrador ajeno, la actividad es comercio al por menor (CNAE 4724).',
  },
  {
    cnae: '1413',
    descripcionCnae: 'Confección de otras prendas de vestir exteriores',
    iae: [],
    sinonimos: ['costurera', 'modista', 'confección', 'ropa', 'taller de costura', 'diseño de moda', 'sastre', 'coser', 'marca de ropa propia'],
    notas: 'Sin certeza sobre el epígrafe (Agrupación 45 de la Sección 1ª, confección en serie o a medida). Consultar tarifas antes del alta.',
  },
  {
    cnae: '3109',
    descripcionCnae: 'Fabricación de otros muebles',
    iae: [],
    sinonimos: ['ebanista', 'carpintero de muebles', 'muebles a medida', 'taller de madera', 'mobiliario', 'restaurar muebles'],
    notas: 'No confundir con la carpintería de obra (instalación en edificios), que es CNAE 4332.',
  },
  {
    cnae: '3212',
    descripcionCnae: 'Fabricación de artículos de joyería y artículos similares',
    iae: [],
    sinonimos: ['joyero', 'joyería artesanal', 'orfebre', 'hacer anillos', 'plata', 'bisutería artesanal', 'platero'],
    notas: 'Fabricar joyas y venderlas al por menor son dos actividades distintas: puede ser necesario darse de alta en ambas.',
  },

  // ── F. Construcción ──────────────────────────────────────────────────────
  {
    cnae: '4121',
    descripcionCnae: 'Construcción de edificios residenciales',
    iae: [
      { epigrafe: '501.1', descripcion: 'Construcción completa, reparación y conservación de edificaciones', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['constructor', 'constructora', 'obra nueva', 'hacer casas', 'promotor de obra', 'edificación', 'reformas integrales'],
  },
  {
    cnae: '4311',
    descripcionCnae: 'Demolición',
    iae: [
      {
        epigrafe: '502.1',
        descripcion: 'Demoliciones y derribos en general',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto del epígrafe dentro del grupo 502 (preparación de terrenos y derribos).',
      },
    ],
    sinonimos: ['derribos', 'demoler', 'tirar tabiques', 'demolición', 'desescombro'],
  },
  {
    cnae: '4321',
    descripcionCnae: 'Instalaciones eléctricas',
    iae: [
      { epigrafe: '504.1', descripcion: 'Instalaciones eléctricas en general', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['electricista', 'instalador eléctrico', 'boletín eléctrico', 'cuadro eléctrico', 'domótica', 'instalaciones de luz', 'poner enchufes'],
  },
  {
    cnae: '4322',
    descripcionCnae: 'Fontanería, instalaciones de sistemas de calefacción y aire acondicionado',
    iae: [
      { epigrafe: '504.2', descripcion: 'Instalaciones de fontanería', seccion: '1ª', confianza: 'alta' },
      { epigrafe: '504.3', descripcion: 'Instalaciones de frío, calor y acondicionamiento de aire', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['fontanero', 'plomero', 'gasista', 'calefacción', 'aire acondicionado', 'climatización', 'calderas', 'instalador de gas', 'arreglar tuberías'],
    notas: 'La fontanería y la climatización tienen epígrafes distintos: si haces ambas, procede alta en los dos.',
  },
  {
    cnae: '4329',
    descripcionCnae: 'Otras instalaciones en obras de construcción',
    iae: [
      {
        epigrafe: '504.8',
        descripcion: 'Montajes metálicos e instalaciones industriales completas',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar la numeración interna del grupo 504 más allá de los tres primeros epígrafes.',
      },
    ],
    sinonimos: ['instalaciones industriales', 'montaje de maquinaria', 'aislamientos', 'instalador industrial'],
  },
  {
    cnae: '4331',
    descripcionCnae: 'Revocamiento',
    iae: [
      {
        epigrafe: '505.1',
        descripcion: 'Revestimientos exteriores e interiores',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar la numeración interna del grupo 505: es el grupo de construcción cuyo orden de epígrafes ofrece menos certeza.',
      },
    ],
    sinonimos: ['enfoscado', 'revoco', 'yesero', 'enlucido', 'estucado', 'monocapa'],
  },
  {
    cnae: '4332',
    descripcionCnae: 'Instalación de carpintería',
    iae: [
      {
        epigrafe: '505.5',
        descripcion: 'Carpintería y cerrajería',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar la numeración interna del grupo 505: es el grupo de construcción cuyo orden de epígrafes ofrece menos certeza.',
      },
    ],
    sinonimos: ['carpintero', 'cerrajero', 'puertas', 'ventanas', 'armarios empotrados', 'aluminio', 'PVC', 'instalar tarima', 'montador de muebles'],
  },
  {
    cnae: '4333',
    descripcionCnae: 'Revestimiento de suelos y paredes',
    iae: [
      {
        epigrafe: '505.2',
        descripcion: 'Solados y pavimentos',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar la numeración interna del grupo 505: es el grupo de construcción cuyo orden de epígrafes ofrece menos certeza.',
      },
    ],
    sinonimos: ['alicatador', 'solador', 'poner baldosas', 'azulejos', 'parquet', 'gres', 'suelos', 'embaldosar'],
  },
  {
    cnae: '4334',
    descripcionCnae: 'Pintura y acristalamiento',
    iae: [
      {
        epigrafe: '505.6',
        descripcion: 'Pintura de cualquier tipo y clase y revestimientos con papel, tejidos o plásticos y terminación y decoración de edificios y locales',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar la numeración interna del grupo 505: es el grupo de construcción cuyo orden de epígrafes ofrece menos certeza.',
      },
    ],
    sinonimos: ['pintor', 'pintar pisos', 'pintura de fachadas', 'empapelar', 'decorador de interiores', 'cristalero'],
  },
  {
    cnae: '4339',
    descripcionCnae: 'Otro acabado de edificios',
    iae: [
      {
        epigrafe: '505.7',
        descripcion: 'Trabajos en yeso y escayola y decoración de edificios y locales',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar la numeración interna del grupo 505: es el grupo de construcción cuyo orden de epígrafes ofrece menos certeza.',
      },
    ],
    sinonimos: ['escayolista', 'pladur', 'falso techo', 'yeso', 'molduras', 'tabiquería seca'],
  },
  {
    cnae: '4399',
    descripcionCnae: 'Otras actividades de construcción especializada n.c.o.p.',
    iae: [
      { epigrafe: '501.3', descripcion: 'Albañilería y pequeños trabajos de construcción en general', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['albañil', 'reformas', 'manitas', 'pequeñas obras', 'chapuzas', 'obrero', 'maestro de obra', 'reformista'],
    notas: 'El epígrafe 501.3 es el habitual del albañil autónomo que hace reformas y trabajos menores por cuenta propia.',
  },

  // ── G. Comercio ──────────────────────────────────────────────────────────
  {
    cnae: '4520',
    descripcionCnae: 'Mantenimiento y reparación de vehículos de motor',
    iae: [
      { epigrafe: '691.2', descripcion: 'Reparación de vehículos automóviles, bicicletas y otros vehículos', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['taller mecánico', 'mecánico', 'chapa y pintura', 'arreglar coches', 'taller de coches', 'electricidad del automóvil', 'neumáticos'],
  },
  {
    cnae: '4532',
    descripcionCnae: 'Comercio al por menor de repuestos y accesorios de vehículos de motor',
    iae: [
      { epigrafe: '654.2', descripcion: 'Comercio al por menor de accesorios y piezas de recambio para vehículos terrestres', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['recambios', 'repuestos', 'accesorios de coche', 'tienda de piezas', 'autopartes'],
  },
  {
    cnae: '4540',
    descripcionCnae: 'Venta, mantenimiento y reparación de motocicletas y de sus repuestos y accesorios',
    iae: [
      { epigrafe: '691.2', descripcion: 'Reparación de vehículos automóviles, bicicletas y otros vehículos', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['taller de motos', 'motos', 'reparar bicicletas', 'ciclos', 'tienda de motos', 'bicicletería'],
  },
  {
    cnae: '4711',
    descripcionCnae: 'Comercio al por menor en establecimientos no especializados, con predominio en productos alimenticios, bebidas y tabaco',
    iae: [
      {
        epigrafe: '647.1',
        descripcion: 'Comercio al por menor de productos alimenticios y bebidas en general, en establecimientos con vendedor',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Duda documental y normativa: el reparto de los epígrafes 647.x depende de la superficie del local y del régimen de venta, y los umbrales citados (120 m², 400 m²) no están verificados contra las Tarifas. Elegir mal el tramo altera la cuota.',
      },
      {
        epigrafe: '647.2',
        descripcion: 'Comercio al por menor de productos alimenticios y bebidas en general, en régimen de autoservicio o mixto, en establecimientos de hasta 120 m²',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Duda documental y normativa: el reparto de los epígrafes 647.x depende de la superficie del local y del régimen de venta, y los umbrales citados (120 m², 400 m²) no están verificados contra las Tarifas. Elegir mal el tramo altera la cuota.',
      },
    ],
    sinonimos: ['tienda de alimentación', 'ultramarinos', 'supermercado', 'colmado', 'abarrotes', 'minimarket', 'tienda de barrio', 'autoservicio'],
    notas: 'El epígrafe depende de la superficie del local y de si hay vendedor o autoservicio (647.1 a 647.4).',
  },
  {
    cnae: '4721',
    descripcionCnae: 'Comercio al por menor de frutas y hortalizas en establecimientos especializados',
    iae: [
      { epigrafe: '641', descripcion: 'Comercio al por menor de frutas, verduras, hortalizas y tubérculos', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['frutería', 'verdulería', 'vender fruta', 'puesto de fruta', 'verdulero'],
  },
  {
    cnae: '4722',
    descripcionCnae: 'Comercio al por menor de carne y productos cárnicos en establecimientos especializados',
    iae: [
      { epigrafe: '642', descripcion: 'Comercio al por menor de carnes y despojos; de productos y derivados cárnicos elaborados', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['carnicería', 'carnicero', 'charcutería', 'pollería', 'vender carne'],
  },
  {
    cnae: '4723',
    descripcionCnae: 'Comercio al por menor de pescados y mariscos en establecimientos especializados',
    iae: [
      { epigrafe: '643', descripcion: 'Comercio al por menor de pescados y otros productos de la pesca y de la acuicultura y de caracoles', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['pescadería', 'pescadero', 'marisco', 'vender pescado'],
  },
  {
    cnae: '4724',
    descripcionCnae: 'Comercio al por menor de pan y productos de panadería, confitería y pastelería en establecimientos especializados',
    iae: [
      { epigrafe: '644', descripcion: 'Comercio al por menor de pan, pastelería, confitería y similares y de leche y productos lácteos', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['panadería', 'despacho de pan', 'pastelería', 'confitería', 'bombonería', 'vender pan'],
    notas: 'Solo venta. Si además elaboras el pan, la actividad de fabricación es CNAE 1071.',
  },
  {
    cnae: '4725',
    descripcionCnae: 'Comercio al por menor de bebidas en establecimientos especializados',
    iae: [
      { epigrafe: '645', descripcion: 'Comercio al por menor de vinos y bebidas de todas clases', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['tienda de vinos', 'vinoteca', 'bodega', 'distribuidora de bebidas', 'cerveza artesana', 'licorería'],
  },
  {
    cnae: '4741',
    descripcionCnae: 'Comercio al por menor de ordenadores, equipos periféricos y programas informáticos en establecimientos especializados',
    iae: [
      {
        epigrafe: '659.2',
        descripcion: 'Comercio al por menor de muebles de oficina y de máquinas y equipos de oficina',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Encaje discutible: el epígrafe se refiere a equipos de oficina y su aplicación a la venta de informática de consumo no está verificada.',
      },
    ],
    sinonimos: ['tienda de informática', 'vender ordenadores', 'material informático', 'computación', 'venta de PCs'],
    notas: 'Si además reparas equipos, la reparación es actividad distinta (CNAE 9511).',
  },
  {
    cnae: '4751',
    descripcionCnae: 'Comercio al por menor de textiles en establecimientos especializados',
    iae: [
      { epigrafe: '651.1', descripcion: 'Comercio al por menor de productos textiles, confecciones para el hogar, alfombras y similares y artículos de tapicería', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['tienda de telas', 'mercería', 'textil hogar', 'ropa de cama', 'cortinas', 'tapicería'],
  },
  {
    cnae: '4752',
    descripcionCnae: 'Comercio al por menor de ferretería, pintura y vidrio en establecimientos especializados',
    iae: [
      {
        epigrafe: '653.3',
        descripcion: 'Comercio al por menor de artículos de menaje, ferretería, adorno, regalo o reclamo (incluyendo bisutería y pequeños electrodomésticos)',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto, que en las Tarifas es una enumeración larga y puede diferir del recogido aquí.',
      },
      { epigrafe: '653.4', descripcion: 'Comercio al por menor de materiales de construcción y de artículos y mobiliario de saneamiento', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['ferretería', 'tienda de bricolaje', 'pinturas', 'herramientas', 'materiales de construcción', 'droguería de pinturas'],
  },
  {
    cnae: '4754',
    descripcionCnae: 'Comercio al por menor de aparatos electrodomésticos en establecimientos especializados',
    iae: [
      {
        epigrafe: '653.2',
        descripcion: 'Comercio al por menor de material y aparatos eléctricos, electrónicos, electrodomésticos y otros aparatos de uso doméstico accionados por otro tipo de energía distinta de la eléctrica, así como de muebles de cocina',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto, que en las Tarifas es una enumeración larga y puede diferir del recogido aquí.',
      },
    ],
    sinonimos: ['electrodomésticos', 'tienda de electro', 'lavadoras', 'línea blanca', 'pequeño electrodoméstico'],
  },
  {
    cnae: '4759',
    descripcionCnae: 'Comercio al por menor de muebles, aparatos de iluminación y otros artículos de uso doméstico en establecimientos especializados',
    iae: [
      { epigrafe: '653.1', descripcion: 'Comercio al por menor de muebles (excepto los de oficina)', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['tienda de muebles', 'mueblería', 'lámparas', 'iluminación', 'decoración del hogar', 'menaje'],
  },
  {
    cnae: '4762',
    descripcionCnae: 'Comercio al por menor de periódicos y artículos de papelería en establecimientos especializados',
    iae: [
      { epigrafe: '659.4', descripcion: 'Comercio al por menor de libros, periódicos, artículos de papelería y escritorio y artículos de dibujo y bellas artes', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['papelería', 'quiosco', 'prensa', 'material escolar', 'librería-papelería', 'copistería y papelería'],
  },
  {
    cnae: '4764',
    descripcionCnae: 'Comercio al por menor de artículos deportivos en establecimientos especializados',
    iae: [
      { epigrafe: '659.6', descripcion: 'Comercio al por menor de juguetes, artículos de deporte, prendas deportivas de vestido, calzado y tocado', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['tienda de deportes', 'ropa deportiva', 'material deportivo', 'suplementos y deporte', 'bicis y deporte'],
  },
  {
    cnae: '4771',
    descripcionCnae: 'Comercio al por menor de prendas de vestir en establecimientos especializados',
    iae: [
      { epigrafe: '651.2', descripcion: 'Comercio al por menor de toda clase de prendas para el vestido y tocado', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['tienda de ropa', 'boutique', 'moda', 'vender ropa', 'ropa infantil', 'multimarca'],
  },
  {
    cnae: '4772',
    descripcionCnae: 'Comercio al por menor de calzado y artículos de cuero en establecimientos especializados',
    iae: [
      { epigrafe: '651.6', descripcion: 'Comercio al por menor de calzado, artículos de piel e imitación o productos sustitutivos, cinturones, carteras, bolsos, maletas y artículos de viaje en general', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['zapatería', 'vender zapatos', 'bolsos', 'marroquinería', 'calzado', 'artículos de viaje'],
  },
  {
    cnae: '4773',
    descripcionCnae: 'Comercio al por menor de productos farmacéuticos en establecimientos especializados',
    iae: [
      { epigrafe: '652.1', descripcion: 'Farmacias: comercio al por menor de medicamentos, productos sanitarios y de higiene personal', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['farmacia', 'farmacéutico', 'botica', 'oficina de farmacia'],
    notas: 'Actividad con requisitos de titulación y autorización sanitaria; el epígrafe es solo un trámite censal más.',
  },
  {
    cnae: '4775',
    descripcionCnae: 'Comercio al por menor de productos cosméticos e higiénicos en establecimientos especializados',
    iae: [
      { epigrafe: '652.2', descripcion: 'Comercio al por menor de productos de droguería, perfumería y cosmética, limpieza, pinturas, barnices, disolventes, papeles y otros productos para la decoración y de productos químicos', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['perfumería', 'droguería', 'cosmética', 'vender cremas', 'productos de belleza', 'parafarmacia'],
  },
  {
    cnae: '4776',
    descripcionCnae: 'Comercio al por menor de flores, plantas, semillas, fertilizantes, animales de compañía y alimentos para los mismos en establecimientos especializados',
    iae: [
      { epigrafe: '659.7', descripcion: 'Comercio al por menor de semillas, abonos, flores y plantas y pequeños animales', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['floristería', 'florista', 'vivero', 'tienda de plantas', 'tienda de mascotas', 'pet shop', 'jardinería venta', 'semillas'],
  },
  {
    cnae: '4777',
    descripcionCnae: 'Comercio al por menor de artículos de relojería y joyería en establecimientos especializados',
    iae: [
      { epigrafe: '659.5', descripcion: 'Comercio al por menor de artículos de joyería, relojería, platería y bisutería', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['joyería', 'relojería', 'bisutería', 'vender joyas', 'plata y relojes'],
  },
  {
    cnae: '4779',
    descripcionCnae: 'Comercio al por menor de artículos de segunda mano en establecimientos',
    iae: [
      { epigrafe: '656', descripcion: 'Comercio al por menor de bienes usados tales como muebles, prendas y enseres ordinarios de uso doméstico', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['segunda mano', 'compraventa', 'antigüedades', 'ropa usada', 'vintage', 'reventa', 'usados'],
  },
  {
    cnae: '4781',
    descripcionCnae: 'Comercio al por menor de productos alimenticios, bebidas y tabaco en puestos de venta y en mercadillos',
    iae: [
      { epigrafe: '663.1', descripcion: 'Comercio al por menor fuera de un establecimiento comercial permanente de productos alimenticios, incluso bebidas y helados', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['mercadillo', 'puesto de mercado', 'venta ambulante', 'food truck', 'feriante', 'mercado de abastos'],
  },
  {
    cnae: '4782',
    descripcionCnae: 'Comercio al por menor de productos textiles, prendas de vestir y calzado en puestos de venta y en mercadillos',
    iae: [
      { epigrafe: '663.2', descripcion: 'Comercio al por menor fuera de un establecimiento comercial permanente de artículos textiles y de confección', seccion: '1ª', confianza: 'alta' },
      { epigrafe: '663.3', descripcion: 'Comercio al por menor fuera de un establecimiento comercial permanente de calzado, pieles y artículos de cuero', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['mercadillo de ropa', 'venta ambulante de ropa', 'puesto de ropa', 'rastro'],
  },
  {
    cnae: '4789',
    descripcionCnae: 'Comercio al por menor de otros productos en puestos de venta y en mercadillos',
    iae: [
      { epigrafe: '663.9', descripcion: 'Comercio al por menor fuera de un establecimiento comercial permanente de otras mercancías n.c.o.p.', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['venta ambulante', 'mercadillo artesanía', 'puesto de feria', 'rastrillo', 'stand en ferias'],
  },
  {
    cnae: '4791',
    descripcionCnae: 'Comercio al por menor por correspondencia o Internet',
    iae: [
      { epigrafe: '665', descripcion: 'Comercio al por menor por correo o por catálogo de productos diversos', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['ecommerce', 'e-commerce', 'tienda online', 'vender por internet', 'dropshipping', 'venta online', 'shopify', 'amazon fba', 'marketplace', 'tienda virtual'],
    notas: 'El 665 es el epígrafe habitual del comercio electrónico. Si también vendes en local físico, procede alta adicional en el epígrafe del comercio correspondiente.',
  },

  // ── H. Transporte y almacenamiento ───────────────────────────────────────
  {
    cnae: '4932',
    descripcionCnae: 'Transporte por taxi',
    iae: [
      { epigrafe: '721.2', descripcion: 'Transporte por autotaxis', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['taxi', 'taxista', 'licencia de taxi', 'auto taxi'],
  },
  {
    cnae: '4939',
    descripcionCnae: 'Tipos de transporte terrestre de pasajeros n.c.o.p.',
    iae: [
      { epigrafe: '721.3', descripcion: 'Transporte de viajeros por carretera', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['autobús', 'transporte de viajeros', 'microbús', 'transporte escolar', 'autocar', 'furgoneta de pasajeros'],
  },
  {
    cnae: '4941',
    descripcionCnae: 'Transporte de mercancías por carretera',
    iae: [
      { epigrafe: '722', descripcion: 'Transporte de mercancías por carretera', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['transportista', 'camionero', 'furgoneta', 'reparto', 'paquetería', 'trailero', 'fletes', 'transporte de mercancías', 'última milla'],
    notas: 'El transporte de mercancías por carretera tributa en IVA por el régimen general, pero el IRPF puede ir por módulos (estimación objetiva) si se cumplen los límites.',
  },
  {
    cnae: '4942',
    descripcionCnae: 'Servicios de mudanza',
    iae: [
      { epigrafe: '722', descripcion: 'Transporte de mercancías por carretera', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['mudanzas', 'portes', 'vaciado de pisos', 'traslados', 'empresa de mudanzas'],
    notas: 'Existe también un epígrafe específico de mudanzas en la Agrupación 75 de la Sección 1ª; verificar en las Tarifas cuál encaja mejor con el servicio prestado.',
  },
  {
    cnae: '5320',
    descripcionCnae: 'Otras actividades postales y de correos',
    iae: [
      { epigrafe: '849.5', descripcion: 'Servicios de mensajería, recadería, reparto y manipulación de correspondencia', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['mensajería', 'repartidor', 'rider', 'courier', 'reparto de paquetes', 'recadería', 'delivery'],
    notas: 'El reparto en moto o bicicleta para plataformas suele encuadrarse aquí; el reparto con vehículo de más de 2 t se acerca más al epígrafe 722.',
  },

  // ── I. Hostelería ────────────────────────────────────────────────────────
  {
    cnae: '5510',
    descripcionCnae: 'Hoteles y alojamientos similares',
    iae: [
      { epigrafe: '681', descripcion: 'Servicio de hospedaje en hoteles y moteles', seccion: '1ª', confianza: 'alta' },
      { epigrafe: '682', descripcion: 'Servicio de hospedaje en hostales y pensiones', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['hotel', 'hostal', 'pensión', 'alojamiento', 'casa rural con servicios', 'motel'],
  },
  {
    cnae: '5520',
    descripcionCnae: 'Alojamientos turísticos y otros alojamientos de corta estancia',
    iae: [
      { epigrafe: '685', descripcion: 'Alojamientos turísticos extrahoteleros', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['apartamento turístico', 'airbnb', 'vivienda de uso turístico', 'alquiler vacacional', 'casa rural', 'VUT', 'alquiler por días'],
    notas: 'Clave: si se prestan servicios propios de la industria hotelera (limpieza durante la estancia, cambio de ropa, restauración) es actividad económica sujeta al 685 y con IVA al 10 %. Si solo se cede la vivienda, suele ser rendimiento del capital inmobiliario y no procede alta en el 685.',
  },
  {
    cnae: '5610',
    descripcionCnae: 'Restaurantes y puestos de comidas',
    iae: [
      { epigrafe: '671.4', descripcion: 'Restaurantes de dos tenedores', seccion: '1ª', confianza: 'alta' },
      { epigrafe: '671.5', descripcion: 'Restaurantes de un tenedor', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['restaurante', 'comidas', 'menú del día', 'cocina', 'hostelería', 'bar restaurante', 'take away', 'comida para llevar', 'dark kitchen'],
    notas: 'El epígrafe concreto depende de la categoría oficial del restaurante (de uno a cinco tenedores: 671.5 a 671.1).',
  },
  {
    cnae: '5621',
    descripcionCnae: 'Provisión de comidas preparadas para eventos',
    iae: [
      {
        epigrafe: '677.9',
        descripcion: 'Otros servicios de alimentación propios de la restauración',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto del epígrafe; el número es el que se cita habitualmente para el catering.',
      },
    ],
    sinonimos: ['catering', 'cáterin', 'comidas para eventos', 'bodas', 'servicio de comidas a domicilio', 'chef a domicilio', 'banquetes'],
  },
  {
    cnae: '5630',
    descripcionCnae: 'Establecimientos de bebidas',
    iae: [
      { epigrafe: '673.2', descripcion: 'Otros cafés y bares', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['bar', 'cafetería', 'pub', 'cervecería', 'taberna', 'poner un bar', 'coctelería', 'chiringuito', 'café'],
    notas: 'Los cafés y bares de categoría especial van al 673.1; las cafeterías propiamente dichas al grupo 672.',
  },

  // ── J. Información y comunicaciones ──────────────────────────────────────
  {
    cnae: '5821',
    descripcionCnae: 'Edición de videojuegos',
    iae: [],
    sinonimos: ['videojuegos', 'game dev', 'desarrollo de juegos', 'indie', 'unity', 'unreal', 'estudio de videojuegos'],
    notas: 'Sin certeza sobre el epígrafe. En la práctica se usan los epígrafes de informática (programación) o los de edición, según el modelo de negocio.',
  },
  {
    cnae: '5911',
    descripcionCnae: 'Actividades de producción cinematográfica, de vídeo y de programas de televisión',
    iae: [],
    sinonimos: ['productora', 'vídeo', 'videógrafo', 'grabar bodas', 'cine', 'audiovisual', 'realizador', 'cámara', 'contenido para redes', 'youtuber'],
    notas: 'Sin certeza sobre el epígrafe concreto (Agrupación 96 de la Sección 1ª para la producción empresarial; Sección 3ª para el ejercicio artístico individual). Verificar en las Tarifas.',
  },
  {
    cnae: '5920',
    descripcionCnae: 'Actividades de grabación de sonido y edición musical',
    iae: [],
    sinonimos: ['estudio de grabación', 'productor musical', 'podcast', 'sonido', 'mezcla y master', 'locución', 'doblaje'],
    notas: 'Sin certeza sobre el epígrafe. El intérprete individual va a la Sección 3ª (actividades artísticas); el estudio como negocio, a la Sección 1ª.',
  },
  {
    cnae: '6201',
    descripcionCnae: 'Actividades de programación informática',
    iae: [
      { epigrafe: '763', descripcion: 'Programadores y analistas de informática', seccion: '2ª', confianza: 'alta' },
      { epigrafe: '845', descripcion: 'Explotación electrónica por cuenta de terceros', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['programador', 'desarrollador', 'desarrollador web', 'hago páginas web', 'freelance informático', 'developer', 'full stack', 'backend', 'frontend', 'apps móviles', 'software a medida', 'devops', 'ingeniero de software', 'codear'],
    notas: 'Caso clásico de doble opción: como profesional individual, Sección 2ª epígrafe 763 (facturas con retención de IRPF); con estructura empresarial (local, empleados), Sección 1ª epígrafe 845 (sin retención). La elección tiene efectos reales en la facturación.',
  },
  {
    cnae: '6202',
    descripcionCnae: 'Actividades de consultoría informática',
    iae: [
      { epigrafe: '763', descripcion: 'Programadores y analistas de informática', seccion: '2ª', confianza: 'alta' },
      { epigrafe: '845', descripcion: 'Explotación electrónica por cuenta de terceros', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['consultor informático', 'consultoría IT', 'analista', 'arquitecto de software', 'asesor tecnológico', 'implantación de software', 'ERP', 'CRM'],
  },
  {
    cnae: '6209',
    descripcionCnae: 'Otros servicios relacionados con las tecnologías de la información y la informática',
    iae: [
      { epigrafe: '845', descripcion: 'Explotación electrónica por cuenta de terceros', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['soporte informático', 'técnico de sistemas', 'administrador de sistemas', 'help desk', 'mantenimiento informático', 'redes', 'ciberseguridad', 'informático a domicilio'],
  },
  {
    cnae: '6311',
    descripcionCnae: 'Proceso de datos, hosting y actividades relacionadas',
    iae: [
      { epigrafe: '845', descripcion: 'Explotación electrónica por cuenta de terceros', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['hosting', 'alojamiento web', 'servidores', 'cloud', 'nube', 'centro de datos', 'procesamiento de datos', 'data'],
  },
  {
    cnae: '6312',
    descripcionCnae: 'Portales web',
    iae: [],
    sinonimos: ['portal web', 'blog', 'web de contenidos', 'buscador', 'marketplace propio', 'directorio online', 'monetizar una web', 'adsense'],
    notas: 'Sin certeza sobre el epígrafe. Según el modelo de ingresos (publicidad, suscripción, comisión) se usan epígrafes distintos: publicidad (844), servicios informáticos (845) o comercio (665).',
  },
  {
    cnae: '6391',
    descripcionCnae: 'Actividades de las agencias de noticias',
    iae: [],
    sinonimos: ['periodista', 'redactor', 'corresponsal', 'agencia de noticias', 'reportero', 'redacción freelance', 'copywriter periodístico'],
    notas: 'Sin certeza sobre el epígrafe del periodista autónomo (Sección 2ª). Consultar las Tarifas o a un asesor: es una de las actividades donde más varía el criterio.',
  },

  // ── K/L. Seguros e inmobiliaria ──────────────────────────────────────────
  {
    cnae: '6622',
    descripcionCnae: 'Actividades de agentes y corredores de seguros',
    iae: [],
    sinonimos: ['agente de seguros', 'corredor de seguros', 'mediador de seguros', 'vender seguros', 'correduría'],
    notas: 'Sin certeza sobre el epígrafe (Sección 2ª para el ejercicio individual). Actividad además sujeta a registro en la DGSFP.',
  },
  {
    cnae: '6820',
    descripcionCnae: 'Alquiler de bienes inmobiliarios por cuenta propia',
    iae: [
      {
        epigrafe: '861.1',
        descripcion: 'Alquiler de viviendas',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto ni el desglose del grupo 861 de la Sección 1ª (alquiler de inmuebles).',
      },
      {
        epigrafe: '861.2',
        descripcion: 'Alquiler de locales industriales y otros alquileres n.c.o.p.',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto ni el desglose del grupo 861 de la Sección 1ª (alquiler de inmuebles).',
      },
    ],
    sinonimos: ['alquilar pisos', 'arrendador', 'casero', 'alquiler de locales', 'rentista inmobiliario', 'poner en alquiler'],
    notas: 'Alta censal habitual del arrendador aunque exista exención de cuota por debajo de determinado importe: el alta en el epígrafe y el pago de cuota son cosas distintas.',
  },
  {
    cnae: '6831',
    descripcionCnae: 'Agentes de la propiedad inmobiliaria',
    iae: [
      {
        epigrafe: '834',
        descripcion: 'Servicios relativos a la propiedad inmobiliaria y a la propiedad industrial',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto; el epígrafe agrupa propiedad inmobiliaria e industrial y su encaje para cada servicio concreto puede variar.',
      },
    ],
    sinonimos: ['inmobiliaria', 'agente inmobiliario', 'API', 'vender pisos', 'intermediación inmobiliaria', 'personal shopper inmobiliario', 'corredor de propiedades'],
  },
  {
    cnae: '6832',
    descripcionCnae: 'Gestión y administración de la propiedad inmobiliaria',
    iae: [
      {
        epigrafe: '834',
        descripcion: 'Servicios relativos a la propiedad inmobiliaria y a la propiedad industrial',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto; el epígrafe agrupa propiedad inmobiliaria e industrial y su encaje para cada servicio concreto puede variar.',
      },
    ],
    sinonimos: ['administrador de fincas', 'gestión de comunidades', 'administrar alquileres', 'property manager', 'gestión de pisos turísticos'],
  },

  // ── M. Actividades profesionales, científicas y técnicas ─────────────────
  {
    cnae: '6910',
    descripcionCnae: 'Actividades jurídicas',
    iae: [
      { epigrafe: '731', descripcion: 'Abogados', seccion: '2ª', confianza: 'alta' },
      {
        epigrafe: '841',
        descripcion: 'Servicios jurídicos',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto de los servicios profesionales de la Sección 1ª (grupos 841 a 843).',
      },
    ],
    sinonimos: ['abogado', 'despacho de abogados', 'letrado', 'asesoría jurídica', 'procurador', 'jurista', 'abogada', 'consultoría legal'],
    notas: 'El ejercicio individual de la abogacía va a la Sección 2ª (epígrafe 731, con retención en factura); el despacho organizado como empresa, a la Sección 1ª (epígrafe 841).',
  },
  {
    cnae: '6920',
    descripcionCnae: 'Actividades de contabilidad, teneduría de libros, auditoría y asesoría fiscal',
    iae: [
      { epigrafe: '741', descripcion: 'Economistas', seccion: '2ª', confianza: 'alta' },
      {
        epigrafe: '842',
        descripcion: 'Servicios financieros y contables',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto de los servicios profesionales de la Sección 1ª (grupos 841 a 843).',
      },
    ],
    sinonimos: ['asesor fiscal', 'gestoría', 'contable', 'llevar contabilidades', 'asesoría', 'economista', 'auditor', 'contador', 'declaraciones de renta'],
    notas: 'La gestoría administrativa propiamente dicha (trámites ante organismos) tiene epígrafe propio: 849.7 Servicios de gestión administrativa.',
  },
  {
    cnae: '7021',
    descripcionCnae: 'Relaciones públicas y comunicación',
    iae: [
      { epigrafe: '844', descripcion: 'Servicios de publicidad, relaciones públicas y similares', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['relaciones públicas', 'comunicación', 'gabinete de prensa', 'community manager', 'redes sociales', 'social media', 'influencer', 'marketing de contenidos'],
  },
  {
    cnae: '7022',
    descripcionCnae: 'Otras actividades de consultoría de gestión empresarial',
    iae: [
      {
        epigrafe: '849.9',
        descripcion: 'Otros servicios independientes n.c.o.p.',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto; además, por ser un epígrafe residual, su encaje depende de que no exista otro más específico para la actividad.',
      },
    ],
    sinonimos: ['consultor', 'consultoría', 'asesor de empresas', 'coach de negocio', 'business consultant', 'mentor de empresas', 'consultoría estratégica', 'recursos humanos'],
    notas: 'Epígrafe cajón de sastre muy utilizado. Si la consultoría es claramente el ejercicio de una profesión titulada (economista, ingeniero), suele proceder la Sección 2ª.',
  },
  {
    cnae: '7111',
    descripcionCnae: 'Servicios técnicos de arquitectura',
    iae: [
      {
        epigrafe: '021',
        descripcion: 'Arquitectos',
        seccion: '2ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto ni el orden de la Agrupación 02 de la Sección 2ª (arquitectos e ingenieros superiores).',
      },
      {
        epigrafe: '843.2',
        descripcion: 'Servicios técnicos de arquitectura',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar los sufijos del grupo 843: el desglose por especialidad técnica es la parte menos contrastada.',
      },
    ],
    sinonimos: ['arquitecto', 'estudio de arquitectura', 'proyectos', 'licencia de obra', 'certificado energético', 'arquitecta', 'diseño de edificios'],
    notas: 'El arquitecto técnico o aparejador tiene epígrafe distinto dentro de la Agrupación 03 de la Sección 2ª.',
  },
  {
    cnae: '7112',
    descripcionCnae: 'Servicios técnicos de ingeniería y otras actividades relacionadas con el asesoramiento técnico',
    iae: [
      {
        epigrafe: '843.1',
        descripcion: 'Servicios técnicos de ingeniería',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar los sufijos del grupo 843: el desglose por especialidad técnica es la parte menos contrastada.',
      },
    ],
    sinonimos: ['ingeniero', 'ingeniería', 'proyectos técnicos', 'delineante', 'perito', 'ingeniero industrial', 'topógrafo', 'cálculo de estructuras', 'ingeniera'],
    notas: 'El ejercicio individual va a la Sección 2ª, con epígrafe distinto según la titulación (Agrupación 02 para ingenieros superiores, Agrupación 03 para ingenieros técnicos). Verificar el epígrafe exacto de tu titulación en las Tarifas: no se incluye aquí por no haber certeza suficiente.',
  },
  {
    cnae: '7311',
    descripcionCnae: 'Agencias de publicidad',
    iae: [
      { epigrafe: '844', descripcion: 'Servicios de publicidad, relaciones públicas y similares', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['publicidad', 'agencia de publicidad', 'marketing', 'marketing digital', 'SEO', 'SEM', 'campañas', 'anuncios', 'publicista', 'growth'],
  },
  {
    cnae: '7410',
    descripcionCnae: 'Actividades de diseño especializado',
    iae: [],
    sinonimos: ['diseñador gráfico', 'diseño gráfico', 'diseño web', 'branding', 'logotipos', 'UX', 'UI', 'ilustrador', 'diseñador de producto', 'interiorismo', 'diseñadora', 'maquetación', 'artes gráficas'],
    notas: 'No existe un epígrafe de "diseñador gráfico" claramente identificado en las Tarifas. En la práctica se usan los de publicidad (844) o los profesionales de la Sección 2ª según el caso; conviene confirmarlo con un asesor antes del alta, porque determina si tus facturas llevan retención.',
  },
  {
    cnae: '7420',
    descripcionCnae: 'Actividades de fotografía',
    iae: [
      { epigrafe: '973.1', descripcion: 'Servicios fotográficos', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['fotógrafo', 'fotografía', 'bodas', 'estudio fotográfico', 'reportaje', 'fotógrafa', 'retrato', 'fotografía de producto', 'book de fotos'],
  },
  {
    cnae: '7430',
    descripcionCnae: 'Actividades de traducción e interpretación',
    iae: [
      { epigrafe: '849.3', descripcion: 'Servicios de traducción y similares', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['traductor', 'traducción', 'intérprete', 'traductor jurado', 'subtitulado', 'localización', 'traductora', 'traducir textos'],
  },
  {
    cnae: '7490',
    descripcionCnae: 'Otras actividades profesionales, científicas y técnicas n.c.o.p.',
    iae: [
      {
        epigrafe: '849.9',
        descripcion: 'Otros servicios independientes n.c.o.p.',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto; además, por ser un epígrafe residual, su encaje depende de que no exista otro más específico para la actividad.',
      },
    ],
    sinonimos: ['servicios profesionales varios', 'no encuentro mi actividad', 'otras actividades', 'perito tasador', 'gestor de proyectos', 'freelance'],
    notas: 'Cajón de sastre. Úsalo solo cuando ninguna clase específica describa tu actividad: un CNAE genérico da menos información al INE y a la AEAT, pero es preferible a uno incorrecto.',
  },
  {
    cnae: '7500',
    descripcionCnae: 'Actividades veterinarias',
    iae: [],
    sinonimos: ['veterinario', 'clínica veterinaria', 'veterinaria', 'mascotas', 'animales', 'consulta veterinaria'],
    notas: 'Sin certeza sobre el epígrafe: el ejercicio individual va a la Sección 2ª y la clínica como empresa a la Sección 1ª. Verificar en las Tarifas.',
  },

  // ── N. Actividades administrativas y servicios auxiliares ────────────────
  {
    cnae: '7711',
    descripcionCnae: 'Alquiler de automóviles y vehículos de motor ligeros',
    iae: [
      {
        epigrafe: '855',
        descripcion: 'Alquiler de automóviles sin conductor',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto del epígrafe de alquiler de vehículos sin conductor.',
      },
    ],
    sinonimos: ['rent a car', 'alquiler de coches', 'alquilar furgonetas', 'car sharing', 'renting'],
  },
  {
    cnae: '7911',
    descripcionCnae: 'Actividades de las agencias de viajes',
    iae: [
      {
        epigrafe: '755.2',
        descripcion: 'Servicios prestados al público por las agencias de viajes',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto ni la distinción entre agencias mayoristas y minoristas dentro del grupo 755.',
      },
    ],
    sinonimos: ['agencia de viajes', 'viajes', 'vender vuelos', 'paquetes turísticos', 'agente de viajes', 'travel planner'],
  },
  {
    cnae: '8121',
    descripcionCnae: 'Limpieza general de edificios',
    iae: [
      {
        epigrafe: '922',
        descripcion: 'Servicios de limpieza',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar si el código corresponde a grupo o a epígrafe con sufijo dentro de la Agrupación 92.',
      },
    ],
    sinonimos: ['limpieza', 'empresa de limpieza', 'limpiar oficinas', 'limpieza de comunidades', 'limpiadora', 'servicio de limpieza', 'limpieza de pisos turísticos', 'aseo'],
  },
  {
    cnae: '8129',
    descripcionCnae: 'Otras actividades de limpieza',
    iae: [
      {
        epigrafe: '922',
        descripcion: 'Servicios de limpieza',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar si el código corresponde a grupo o a epígrafe con sufijo dentro de la Agrupación 92.',
      },
    ],
    sinonimos: ['limpieza de cristales', 'limpieza industrial', 'desinfección', 'limpieza de coches', 'limpieza fin de obra', 'desatascos'],
  },
  {
    cnae: '8130',
    descripcionCnae: 'Actividades de jardinería',
    iae: [],
    sinonimos: ['jardinero', 'jardinería', 'mantenimiento de jardines', 'podar', 'césped', 'paisajismo', 'cuidar jardines'],
    notas: 'Sin certeza sobre el epígrafe. Suele encuadrarse entre los servicios agrícolas prestados a terceros (Agrupación 91 de la Sección 1ª) o en construcción cuando incluye obra. Verificar antes del alta.',
  },
  {
    cnae: '8219',
    descripcionCnae: 'Actividades de fotocopiado, preparación de documentos y otras actividades especializadas de oficina',
    iae: [
      {
        epigrafe: '849.9',
        descripcion: 'Otros servicios independientes n.c.o.p.',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto; además, por ser un epígrafe residual, su encaje depende de que no exista otro más específico para la actividad.',
      },
    ],
    sinonimos: ['copistería', 'reprografía', 'imprenta digital', 'secretaria virtual', 'asistente virtual', 'transcripción', 'servicios de oficina'],
  },
  {
    cnae: '8230',
    descripcionCnae: 'Organización de convenciones y ferias de muestras',
    iae: [
      {
        epigrafe: '849.9',
        descripcion: 'Otros servicios independientes n.c.o.p.',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto; además, por ser un epígrafe residual, su encaje depende de que no exista otro más específico para la actividad.',
      },
    ],
    sinonimos: ['organizador de eventos', 'wedding planner', 'eventos', 'congresos', 'ferias', 'bodas y eventos', 'event planner'],
  },
  {
    cnae: '8299',
    descripcionCnae: 'Otras actividades de apoyo a las empresas n.c.o.p.',
    iae: [
      {
        epigrafe: '849.7',
        descripcion: 'Servicios de gestión administrativa',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto dentro del grupo 849.',
      },
      {
        epigrafe: '849.9',
        descripcion: 'Otros servicios independientes n.c.o.p.',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto; además, por ser un epígrafe residual, su encaje depende de que no exista otro más específico para la actividad.',
      },
    ],
    sinonimos: ['gestión administrativa', 'trámites', 'back office', 'apoyo a empresas', 'externalización', 'servicios auxiliares'],
  },

  // ── P. Educación ─────────────────────────────────────────────────────────
  {
    cnae: '8541',
    descripcionCnae: 'Educación postsecundaria no terciaria',
    iae: [
      {
        epigrafe: '932.1',
        descripcion: 'Enseñanza de formación y perfeccionamiento profesional, no superior',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto ni la frontera con la enseñanza superior del grupo 932.',
      },
    ],
    sinonimos: ['formación profesional', 'academia de FP', 'cursos profesionales', 'certificados de profesionalidad', 'formación para el empleo'],
  },
  {
    cnae: '8551',
    descripcionCnae: 'Educación deportiva y recreativa',
    iae: [
      {
        epigrafe: '967.2',
        descripcion: 'Escuelas y servicios de perfeccionamiento del deporte',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto del epígrafe dentro del grupo 967.',
      },
    ],
    sinonimos: ['entrenador personal', 'monitor deportivo', 'clases de yoga', 'pilates', 'escuela de natación', 'personal trainer', 'clases de tenis', 'profesor de padel', 'preparador físico'],
  },
  {
    cnae: '8552',
    descripcionCnae: 'Educación cultural',
    iae: [],
    sinonimos: ['clases de música', 'academia de baile', 'clases de pintura', 'escuela de arte', 'profesor de guitarra', 'teatro para niños', 'talleres creativos'],
    notas: 'Sin certeza sobre el epígrafe exacto. Suele encuadrarse en la enseñanza no reglada (grupo 933 de la Sección 1ª) o en la docencia individual de la Sección 2ª.',
  },
  {
    cnae: '8553',
    descripcionCnae: 'Actividades de las escuelas de conducción y pilotaje',
    iae: [
      { epigrafe: '933.1', descripcion: 'Enseñanza de conducción de vehículos terrestres, acuáticos, aeronáuticos, etc.', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['autoescuela', 'profesor de autoescuela', 'clases de conducir', 'carnet de conducir', 'escuela náutica'],
  },
  {
    cnae: '8559',
    descripcionCnae: 'Otra educación n.c.o.p.',
    iae: [
      { epigrafe: '933.9', descripcion: 'Otras actividades de enseñanza, tales como idiomas, corte y confección, mecanografía, taquigrafía, preparación de exámenes y oposiciones y similares n.c.o.p.', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['academia', 'clases particulares', 'profesor de inglés', 'dar clases', 'preparador de oposiciones', 'formación online', 'infoproductos', 'cursos online', 'tutor', 'repaso escolar', 'profe particular'],
    notas: 'Distinción clave: la academia con local es actividad empresarial (933.9, Sección 1ª); el profesor que da clases por cuenta propia sin estructura empresarial encaja mejor en la Sección 2ª (personal docente), y entonces sus facturas a empresas llevan retención.',
  },

  // ── Q. Sanidad y servicios sociales ──────────────────────────────────────
  {
    cnae: '8621',
    descripcionCnae: 'Actividades de medicina general',
    iae: [
      { epigrafe: '041', descripcion: 'Médicos de medicina general', seccion: '2ª', confianza: 'alta' },
    ],
    sinonimos: ['médico', 'médico de familia', 'consulta médica', 'medicina general', 'doctora', 'pasar consulta'],
    notas: 'Los servicios sanitarios de asistencia a personas físicas están exentos de IVA (art. 20.Uno.3º LIVA), lo que condiciona todo el alta censal.',
  },
  {
    cnae: '8622',
    descripcionCnae: 'Actividades de medicina especializada',
    iae: [
      {
        epigrafe: '042',
        descripcion: 'Médicos especialistas',
        seccion: '2ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto, que en las Tarifas podría incluir una salvedad expresa sobre estomatólogos y odontólogos.',
      },
    ],
    sinonimos: ['especialista', 'dermatólogo', 'psiquiatra', 'traumatólogo', 'ginecólogo', 'consulta privada', 'médico especialista'],
  },
  {
    cnae: '8623',
    descripcionCnae: 'Actividades odontológicas',
    iae: [],
    sinonimos: ['dentista', 'odontólogo', 'clínica dental', 'ortodoncia', 'higienista dental', 'estomatólogo'],
    notas: 'Sin certeza sobre el epígrafe exacto (Agrupación 04 de la Sección 2ª: estomatólogos y odontólogos tienen epígrafes diferenciados). Verificar en las Tarifas antes del alta.',
  },
  {
    cnae: '8690',
    descripcionCnae: 'Otras actividades sanitarias',
    iae: [],
    sinonimos: ['fisioterapeuta', 'fisioterapia', 'enfermera', 'podólogo', 'logopeda', 'nutricionista', 'psicólogo', 'óptico', 'terapeuta', 'osteópata', 'matrona'],
    notas: 'Sin certeza sobre los epígrafes concretos: cada profesión sanitaria tiene el suyo en la Sección 2ª. Ojo con la frontera entre sanitario (exento de IVA) y no sanitario (con IVA): el quiromasaje o el coaching de bienestar no son actividades sanitarias.',
  },
  {
    cnae: '8891',
    descripcionCnae: 'Actividades de cuidado diurno de niños',
    iae: [],
    sinonimos: ['guardería', 'ludoteca', 'canguro', 'cuidado de niños', 'escuela infantil', 'niñera', 'centro infantil'],
    notas: 'Sin certeza sobre el epígrafe. Actividad además sujeta a autorización educativa autonómica en la mayoría de los casos.',
  },

  // ── R. Actividades artísticas, recreativas y de entretenimiento ──────────
  {
    cnae: '9001',
    descripcionCnae: 'Artes escénicas',
    iae: [],
    sinonimos: ['actor', 'actriz', 'músico', 'cantante', 'bailarín', 'artista', 'teatro', 'espectáculos', 'humorista', 'mago', 'animador de fiestas', 'DJ'],
    notas: 'Sin epígrafe asignado aquí por prudencia: las actividades artísticas van a la Sección 3ª de las Tarifas, con epígrafes muy específicos por disciplina (cine y teatro, baile, música, deporte, espectáculos taurinos). Consultar la Sección 3ª para el epígrafe exacto.',
  },
  {
    cnae: '9003',
    descripcionCnae: 'Creación artística y literaria',
    iae: [
      {
        epigrafe: '861',
        descripcion: 'Pintores, escultores, ceramistas, artesanos, grabadores y artistas similares',
        seccion: '2ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto ni el alcance del epígrafe dentro de la Agrupación 86 de la Sección 2ª.',
      },
    ],
    sinonimos: ['artista', 'pintor', 'escultor', 'ceramista', 'artesano', 'ilustrador', 'escritor', 'grabador', 'vender arte', 'obra propia', 'artesanía'],
    notas: 'El epígrafe 861 cubre artes plásticas y artesanía. Escritores y guionistas tienen epígrafes propios dentro de la Sección 2ª que no se incluyen aquí por falta de certeza.',
  },
  {
    cnae: '9313',
    descripcionCnae: 'Actividades de los gimnasios',
    iae: [
      {
        epigrafe: '967.1',
        descripcion: 'Instalaciones deportivas',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto ni la frontera con los epígrafes de espectáculos deportivos.',
      },
    ],
    sinonimos: ['gimnasio', 'box de crossfit', 'sala de fitness', 'centro deportivo', 'estudio de pilates', 'gym'],
    notas: 'Si además das clases o entrenamiento personal, procede considerar el 967.2 (escuelas y perfeccionamiento del deporte).',
  },

  // ── S. Otros servicios ───────────────────────────────────────────────────
  {
    cnae: '9511',
    descripcionCnae: 'Reparación de ordenadores y equipos periféricos',
    iae: [
      {
        epigrafe: '691.9',
        descripcion: 'Reparación de otros bienes de consumo n.c.o.p.',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Duda documental y normativa: además de no estar verificado el literal, es discutible que la reparación de equipos informáticos deba encuadrarse en un epígrafe residual de bienes de consumo en lugar de en uno de reparación de maquinaria.',
      },
    ],
    sinonimos: ['reparar ordenadores', 'servicio técnico', 'arreglar móviles', 'reparación de portátiles', 'técnico informático', 'reparar impresoras'],
  },
  {
    cnae: '9521',
    descripcionCnae: 'Reparación de aparatos electrónicos de audio y vídeo de uso doméstico',
    iae: [
      {
        epigrafe: '691.1',
        descripcion: 'Reparación de artículos eléctricos para el hogar',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto del epígrafe dentro del grupo 691.',
      },
    ],
    sinonimos: ['reparar televisores', 'servicio técnico de electrónica', 'arreglar equipos de sonido'],
  },
  {
    cnae: '9522',
    descripcionCnae: 'Reparación de aparatos electrodomésticos y de equipos para el hogar y el jardín',
    iae: [
      {
        epigrafe: '691.1',
        descripcion: 'Reparación de artículos eléctricos para el hogar',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto del epígrafe dentro del grupo 691.',
      },
    ],
    sinonimos: ['reparar lavadoras', 'técnico de electrodomésticos', 'arreglar neveras', 'servicio técnico a domicilio', 'reparar cortacésped'],
  },
  {
    cnae: '9529',
    descripcionCnae: 'Reparación de otros efectos personales y artículos de uso doméstico',
    iae: [
      {
        epigrafe: '691.9',
        descripcion: 'Reparación de otros bienes de consumo n.c.o.p.',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Duda documental y normativa: además de no estar verificado el literal, es discutible que la reparación de equipos informáticos deba encuadrarse en un epígrafe residual de bienes de consumo en lugar de en uno de reparación de maquinaria.',
      },
    ],
    sinonimos: ['arreglos de ropa', 'zapatero remendón', 'reparar bicicletas', 'afilador', 'restaurar objetos', 'arreglos varios'],
  },
  {
    cnae: '9601',
    descripcionCnae: 'Lavado y limpieza de prendas textiles y de piel',
    iae: [
      { epigrafe: '971.1', descripcion: 'Tinte, limpieza en seco, lavado y planchado de ropas hechas y de prendas y artículos del hogar usados', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['tintorería', 'lavandería', 'lavar ropa', 'planchado', 'limpieza en seco', 'autoservicio de lavandería'],
  },
  {
    cnae: '9602',
    descripcionCnae: 'Peluquería y otros tratamientos de belleza',
    iae: [
      { epigrafe: '972.1', descripcion: 'Servicios de peluquería de señora y caballero', seccion: '1ª', confianza: 'alta' },
      { epigrafe: '972.2', descripcion: 'Salones e institutos de belleza y gabinetes de estética', seccion: '1ª', confianza: 'alta' },
    ],
    sinonimos: ['peluquería', 'peluquero', 'barbería', 'estética', 'esteticista', 'uñas', 'manicura', 'depilación', 'centro de belleza', 'maquilladora', 'barbero', 'salón de belleza'],
    notas: 'Peluquería y estética son epígrafes distintos: si prestas ambos servicios, procede alta en los dos (972.1 y 972.2).',
  },
  {
    cnae: '9609',
    descripcionCnae: 'Otros servicios personales n.c.o.p.',
    iae: [
      {
        epigrafe: '979.9',
        descripcion: 'Otros servicios personales n.c.o.p.',
        seccion: '1ª',
        confianza: 'media',
        notaConfianza: 'Sin verificar el literal exacto; al ser un epígrafe residual, su encaje depende de que no exista otro más específico.',
      },
    ],
    sinonimos: ['servicios personales', 'tatuador', 'paseador de perros', 'peluquería canina', 'organizador de armarios', 'acompañamiento', 'servicios varios'],
    notas: 'Cajón de sastre de los servicios a particulares. Antes de usarlo, comprueba que no exista un epígrafe específico para tu actividad.',
  },
];

// ─── Helpers de búsqueda ────────────────────────────────────────────────────

/** Normaliza texto para búsqueda: minúsculas y sin acentos */
export function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Busca actividades por código CNAE, denominación oficial, epígrafe IAE
 * o sinónimo en lenguaje natural.
 * @param termino Texto libre introducido por la persona usuaria
 * @returns Actividades coincidentes (vacío si el término tiene menos de 2 caracteres)
 */
export function buscarActividades(termino: string): ActividadCnaeIae[] {
  const consulta = normalizarTexto(termino);
  if (consulta.length < 2) return [];

  return ACTIVIDADES_CNAE_IAE.filter((actividad) => {
    if (actividad.cnae.includes(consulta)) return true;
    if (normalizarTexto(actividad.descripcionCnae).includes(consulta)) return true;
    if (actividad.sinonimos.some((s) => normalizarTexto(s).includes(consulta))) return true;
    return actividad.iae.some(
      (e) => e.epigrafe.includes(consulta) || normalizarTexto(e.descripcion).includes(consulta)
    );
  });
}

/** Devuelve la actividad con un código CNAE exacto, o undefined si no está en el catálogo */
export function buscarPorCnae(cnae: string): ActividadCnaeIae | undefined {
  return ACTIVIDADES_CNAE_IAE.find((a) => a.cnae === cnae.trim());
}

/** Devuelve las actividades que incluyen un epígrafe IAE concreto */
export function buscarPorEpigrafeIae(epigrafe: string): ActividadCnaeIae[] {
  const buscado = epigrafe.trim();
  return ACTIVIDADES_CNAE_IAE.filter((a) => a.iae.some((e) => e.epigrafe === buscado));
}

/** Estadísticas de cobertura del catálogo (útil para mostrar transparencia en la app) */
export const COBERTURA_CATALOGO = {
  totalActividades: ACTIVIDADES_CNAE_IAE.length,
  conEpigrafeIae: ACTIVIDADES_CNAE_IAE.filter((a) => a.iae.length > 0).length,
  sinEpigrafeIae: ACTIVIDADES_CNAE_IAE.filter((a) => a.iae.length === 0).length,
  totalEpigrafes: ACTIVIDADES_CNAE_IAE.reduce((n, a) => n + a.iae.length, 0),
  epigrafesAltaConfianza: ACTIVIDADES_CNAE_IAE.reduce(
    (n, a) => n + a.iae.filter((e) => e.confianza === 'alta').length,
    0
  ),
  epigrafesMediaConfianza: ACTIVIDADES_CNAE_IAE.reduce(
    (n, a) => n + a.iae.filter((e) => e.confianza === 'media').length,
    0
  ),
};

// NOTA DELIBERADA: no existe un helper que devuelva "solo los epígrafes fiables".
// Filtrar los de confianza 'media' los ocultaría al usuario, que es justo lo
// contrario de lo que debe hacer una app con este dataset: mostrarlos señalados
// con su `notaConfianza`. Un epígrafe 'media' no es un dato malo, es un dato que
// hay que verificar — y esa verificación la hace la persona, no un filtro.
