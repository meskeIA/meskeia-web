/**
 * Apps STEM-afines a Stemum que NO son simuladores del portal (no entran en las
 * 110 de STEMUM_APP_DISCIPLINA) pero cuyo público es el de Stemum: quizzes,
 * calculadoras, tablas, conversores, cifrados y visualizadores "clic-revelar"
 * (sin la mecánica slider→gráfica que define el catálogo).
 *
 * Las consume DescubreVertical (Fase 2) para mostrar la banda de descubrimiento
 * hacia la DISCIPLINA correspondiente en stemum.com, induciendo tráfico al
 * portal sin meter estas apps en él.
 *
 * CURADO MANUAL (no hay señal autodeclarada como el RegionBadge de Delegum).
 * Excluida a propósito la temática médica/fisiológica (Stemum no tiene contenido
 * de medicina; iría a una futura vertical de Salud) y el ruido no-STEM.
 * Worksheet de selección: STEMUM-ADYACENTES.md (local). Revisión periódica.
 */
export const STEMUM_ADYACENTES: Record<string, string> = {
  // ── Química ──
  'tabla-periodica': 'quimica',
  'quiz-tabla-periodica': 'quimica',
  'quiz-simbolos-quimicos': 'quimica',
  'glosario-fisica-quimica': 'quimica',
  'simulador-reacciones-quimicas': 'quimica',
  'visualizador-reacciones-quimicas': 'quimica',
  'visualizador-enlaces-quimicos': 'quimica',
  'visualizador-estructura-atomo': 'quimica',
  'visualizador-quimica-organica': 'quimica',
  'visualizador-oro': 'quimica',
  // ── Física ──
  'calculadora-movimiento': 'fisica',
  'calculadora-electricidad': 'fisica',
  'calculadora-resistencias-led': 'fisica',
  'conversor-unidades-rf': 'fisica',
  'generador-ondas': 'fisica',
  'generador-tonos': 'fisica',
  'analizador-espectro': 'fisica',
  'simulador-fisica': 'fisica',
  // ── Matemáticas ──
  'calculadora-matematica': 'matematicas',
  'calculadora-calculo': 'matematicas',
  'algebra-ecuaciones': 'matematicas',
  'calculadora-algebra-abstracta': 'matematicas',
  'calculadora-algebra-booleana': 'matematicas',
  'calculadora-geometria': 'matematicas',
  'calculadora-trigonometria': 'matematicas',
  'calculadora-probabilidad': 'matematicas',
  'calculadora-distribuciones': 'matematicas',
  'calculadora-estadistica': 'matematicas',
  'estadistica-avanzada': 'matematicas',
  'inferencia-bayesiana': 'matematicas',
  'calculadora-teoria-numeros': 'matematicas',
  'calculadora-mcd-mcm': 'matematicas',
  'calculadora-regla-de-tres': 'matematicas',
  'tablas-multiplicar': 'matematicas',
  'juego-puzzle-matematico': 'matematicas',
  'visualizador-probabilidad': 'matematicas',
  'visualizador-matematicas-musica': 'matematicas',
  'visualizador-matrices': 'matematicas',
  // ── Biología ──
  'quiz-biologia-molecular': 'biologia',
  'quiz-reinos-naturaleza': 'biologia',
  'quiz-tipos-plantas': 'biologia',
  'visualizador-adn-numeros': 'biologia',
  'simulador-genetica': 'biologia',
  'visualizador-celula': 'biologia',
  'visualizador-fotosintesis': 'biologia',
  'visualizador-mitosis-meiosis': 'biologia',
  'visualizador-arbol-vida': 'biologia',
  'visualizador-respiracion-celular': 'biologia',
  'visualizador-ecosistema': 'biologia',
  'visualizador-biomoleculas': 'biologia',
  'visualizador-reino-vegetal': 'biologia',
  'visualizador-reino-fungi': 'biologia',
  'visualizador-seleccion-natural': 'biologia',
  'visualizador-adn-codigo-genetico': 'biologia',
  'visualizador-reino-animal': 'biologia',
  'visualizador-biomas-terrestres': 'biologia',
  'visualizador-adn-polimerasa': 'biologia',
  'visualizador-proteinas-plegamiento': 'biologia',
  // ── Computación ──
  'conversor-binario': 'computacion',
  'calculadora-sistemas-numericos': 'computacion',
  'conversor-ieee754': 'computacion',
  'conversor-morse': 'computacion',
  'codificador-base64': 'computacion',
  'generador-hashes': 'computacion',
  'cifrado-clasico': 'computacion',
  'cifrado-aes': 'computacion',
  'cifrado-vigenere': 'computacion',
  'cifrado-playfair': 'computacion',
  'cifrado-transposicion': 'computacion',
  'quiz-complejidad-algoritmos': 'computacion',
  'visualizador-criptografia': 'computacion',
  'visualizador-teoria-grafos': 'computacion',
  // ── Tierra y Espacio ──
  'constelaciones-del-cielo': 'tierra-espacio',
  'minerales-del-mundo': 'tierra-espacio',
  'calculadora-regla-500-npf-astrofoto': 'tierra-espacio',
  'visualizador-tectonica-placas': 'tierra-espacio',
  'visualizador-fosiles-tiempo-geologico': 'tierra-espacio',
  'visualizador-fenomenos-meteorologicos': 'tierra-espacio',
  'visualizador-cambio-climatico-tipping-points': 'tierra-espacio',
};
