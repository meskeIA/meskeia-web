/**
 * Expansión de formas verbales flexionadas (gerundio, participio) para el
 * índice de rimas.
 *
 * El diccionario base (86.972 palabras) es un listado de LEMAS: solo 48
 * palabras terminan en «-ando» y 4 en «-iendo», así que el gerundio —el
 * final de verso más frecuente en canciones y rap («cantando», «llorando»,
 * «soñando»)— prácticamente no existe en el índice. De 5 gerundios de uso
 * corriente probados a mano, solo «volando» aparecía.
 *
 * La lista de verbos está CURADA a mano, no derivada del propio diccionario:
 * el español tiene muchísimos adjetivos y sustantivos terminados en
 * «-ar/-er/-ir» que NO son verbos (lugar, hogar, azúcar, familiar, popular,
 * mujer, carácter...), así que tratarlos todos como infinitivos generaría
 * formas inventadas («lugarando»).
 *
 * Cada verbo que rompe la regla general (`raíz + ando/iendo`, `raíz +
 * ado/ido`) tiene su forma irregular escrita a mano; el resto se deriva. Un
 * verbo puede tener el gerundio irregular y el participio regular, o al
 * revés (p.ej. «poner» → gerundio regular «poniendo», participio irregular
 * «puesto»): por eso son dos mapas independientes, no una lista de verbos
 * «irregulares» en bloque.
 */

/** Verbos totalmente regulares en gerundio y participio: no necesitan mapa. */
const VERBOS_REGULARES = [
  // -ar (afectivo/narrativo: el vocabulario típico de canción y poesía)
  'cantar', 'bailar', 'llorar', 'amar', 'besar', 'mirar', 'pensar', 'esperar',
  'caminar', 'brillar', 'callar', 'hablar', 'gritar', 'saltar', 'tocar',
  'pasar', 'quedar', 'dejar', 'tomar', 'ganar', 'terminar', 'cambiar',
  'buscar', 'olvidar', 'abrazar', 'acariciar', 'respirar', 'gozar',
  'disfrutar', 'luchar', 'alejar', 'acercar', 'aceptar', 'negar', 'rezar',
  'confiar', 'entregar', 'regalar', 'ayudar', 'marchar', 'viajar', 'navegar',
  'danzar', 'volar', 'soñar', 'temblar', 'jugar', 'cerrar', 'empezar',
  'encontrar', 'recordar', 'mostrar', 'despertar', 'llegar', 'llevar',
  'curar', 'sanar', 'crear', 'robar', 'matar', 'salvar', 'pintar', 'cortar',
  'lavar', 'limpiar', 'cocinar', 'estudiar', 'trabajar', 'descansar',
  'celebrar', 'festejar', 'imaginar', 'desear', 'anhelar', 'extrañar',
  'añorar', 'odiar', 'perdonar', 'disculpar', 'castigar', 'premiar',
  'ordenar', 'mandar', 'sonar', 'tirar', 'lanzar', 'guardar', 'cuidar',
  'cargar', 'colgar', 'secar', 'mojar', 'quemar', 'helar', 'nevar',
  'iluminar', 'apagar', 'enamorar', 'ilusionar', 'engañar', 'acompañar',
  'escuchar', 'gustar', 'importar', 'interesar', 'alcanzar', 'superar',
  'intentar', 'lograr', 'fallar', 'triunfar', 'arriesgar', 'apostar',
  'estar', 'reventar', 'estallar', 'flotar', 'nadar', 'girar', 'rodar',
  'resbalar', 'chocar', 'estrellar', 'quebrar', 'separar', 'juntar',
  'mezclar', 'enredar', 'atar', 'soltar', 'liberar', 'encerrar', 'abandonar',
  // -er
  'correr', 'comer', 'beber', 'temer', 'aprender', 'comprender', 'esconder',
  'vender', 'deber', 'meter', 'prometer', 'sorprender', 'encender',
  'entender', 'perder', 'suceder', 'coser', 'nacer', 'crecer', 'conocer',
  'parecer', 'ofrecer', 'merecer', 'establecer', 'pertenecer', 'obedecer',
  'agradecer', 'padecer', 'tener', 'querer', 'saber', 'ser', 'haber',
  // -ir
  'vivir', 'partir', 'sufrir', 'existir', 'insistir', 'resistir', 'permitir',
  'subir', 'compartir', 'cumplir', 'recibir', 'definir', 'unir', 'dividir',
  'añadir', 'discutir', 'admitir', 'transmitir', 'decidir', 'asistir',
  'salir', 'latir',
];

/** Excepciones de gerundio: aquí SOLO lo que la regla general no acierta. */
const GERUNDIOS_IRREGULARES: Record<string, string> = {
  // suppletivo / raíz irregular
  ir: 'yendo',
  poder: 'pudiendo',
  // raíz -ir que cambia e→i (pedir, decir, seguir...)
  decir: 'diciendo',
  pedir: 'pidiendo',
  medir: 'midiendo',
  servir: 'sirviendo',
  vestir: 'vistiendo',
  repetir: 'repitiendo',
  competir: 'compitiendo',
  despedir: 'despidiendo',
  impedir: 'impidiendo',
  elegir: 'eligiendo',
  corregir: 'corrigiendo',
  seguir: 'siguiendo',
  conseguir: 'consiguiendo',
  perseguir: 'persiguiendo',
  // raíz -ir que cambia e→ie en presente pero e→i en gerundio
  venir: 'viniendo',
  sentir: 'sintiendo',
  mentir: 'mintiendo',
  preferir: 'prefiriendo',
  sugerir: 'sugiriendo',
  divertir: 'divirtiendo',
  convertir: 'convirtiendo',
  advertir: 'advirtiendo',
  herir: 'hiriendo',
  hervir: 'hirviendo',
  invertir: 'invirtiendo',
  // raíz -ir que cambia o→u
  dormir: 'durmiendo',
  morir: 'muriendo',
  // raíz terminada en vocal fuerte: la «i» de -iendo se hace «y»
  leer: 'leyendo',
  creer: 'creyendo',
  poseer: 'poseyendo',
  proveer: 'proveyendo',
  caer: 'cayendo',
  traer: 'trayendo',
  oír: 'oyendo',
  huir: 'huyendo',
  construir: 'construyendo',
  destruir: 'destruyendo',
  incluir: 'incluyendo',
  concluir: 'concluyendo',
  influir: 'influyendo',
  sustituir: 'sustituyendo',
  distribuir: 'distribuyendo',
  contribuir: 'contribuyendo',
  fluir: 'fluyendo',
  atribuir: 'atribuyendo',
  restituir: 'restituyendo',
  // raíz en «-eír»: pierde la vocal propia ante la «i» del sufijo
  reír: 'riendo',
  sonreír: 'sonriendo',
  freír: 'friendo',
};

/** Excepciones de participio: aquí SOLO lo que la regla general no acierta. */
const PARTICIPIOS_IRREGULARES: Record<string, string> = {
  hacer: 'hecho',
  deshacer: 'deshecho',
  decir: 'dicho',
  escribir: 'escrito',
  describir: 'descrito',
  inscribir: 'inscrito',
  ver: 'visto',
  poner: 'puesto',
  volver: 'vuelto',
  devolver: 'devuelto',
  resolver: 'resuelto',
  disolver: 'disuelto',
  envolver: 'envuelto',
  morir: 'muerto',
  abrir: 'abierto',
  cubrir: 'cubierto',
  descubrir: 'descubierto',
  romper: 'roto',
  satisfacer: 'satisfecho',
  imprimir: 'impreso',
  freír: 'frito',
  // raíz terminada en vocal fuerte + «-ido»: hiato que exige tilde en la í
  leer: 'leído',
  creer: 'creído',
  poseer: 'poseído',
  caer: 'caído',
  traer: 'traído',
  oír: 'oído',
  reír: 'reído',
  sonreír: 'sonreído',
  // participio irregular tradicional, distinto del regular «proveído»
  proveer: 'provisto',
};

const generarGerundio = (infinitivo: string): string | null => {
  if (GERUNDIOS_IRREGULARES[infinitivo]) return GERUNDIOS_IRREGULARES[infinitivo];
  const raiz = infinitivo.slice(0, -2);
  if (infinitivo.endsWith('ar')) return `${raiz}ando`;
  if (infinitivo.endsWith('er') || infinitivo.endsWith('ir')) return `${raiz}iendo`;
  return null;
};

const generarParticipio = (infinitivo: string): string | null => {
  if (PARTICIPIOS_IRREGULARES[infinitivo]) return PARTICIPIOS_IRREGULARES[infinitivo];
  const raiz = infinitivo.slice(0, -2);
  if (infinitivo.endsWith('ar')) return `${raiz}ado`;
  if (infinitivo.endsWith('er') || infinitivo.endsWith('ir')) return `${raiz}ido`;
  return null;
};

/**
 * Genera el gerundio y el participio de todos los verbos curados.
 * Deduplicada: dos verbos distintos no pueden producir dos entradas iguales.
 */
export const formasVerbalesFlexionadas = (): string[] => {
  const verbos = new Set([
    ...VERBOS_REGULARES,
    ...Object.keys(GERUNDIOS_IRREGULARES),
    ...Object.keys(PARTICIPIOS_IRREGULARES),
  ]);

  const formas = new Set<string>();
  for (const verbo of verbos) {
    const gerundio = generarGerundio(verbo);
    const participio = generarParticipio(verbo);
    if (gerundio) formas.add(gerundio);
    if (participio) formas.add(participio);
  }
  return [...formas];
};
