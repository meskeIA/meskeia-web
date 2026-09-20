/**
 * Motor de recomendación de selector-smartphone.
 *
 * Vive aparte porque sus tres defectos de cálculo no se veían en pantalla: el resultado era
 * coherente consigo mismo, solo que no respondía a lo que el usuario había declarado.
 *
 *  1. El presupuesto no acotaba nada salvo en sus dos extremos. El ajuste final solo
 *     contemplaba «Hasta 250 €» y «Más de 900 €»; en los tramos intermedios la gama la
 *     fijaba el recuento de puntos sin tope, así que la app podía proponer una gama entre
 *     dos y seis veces más cara que la declarada, y la pantalla de resultado no contenía ni
 *     una vez la palabra «presupuesto» (hallazgo 943). Ahora cada tramo tiene su TOPE.
 *
 *  2. El bloque «Por qué esta recomendación» se generaba a partir de la gama de SALIDA, no
 *     de las respuestas, así que atribuía al usuario un perfil que no había declarado: a
 *     quien pedía cámara y gaming con 250 € le decía «para un uso básico…» (hallazgo 944).
 *     Ahora se explica el recorte o la ampliación cuando los hay.
 *
 *  3. El pliego de características mezclaba líneas calculadas con las respuestas —que
 *     pedían cosas imposibles en la gama propuesta— con otras condicionadas a
 *     `gama !== 'basica'`, que desaparecían justo en el perfil que más las necesita
 *     (hallazgo 945). Ahora cada línea se escribe para la gama FINAL.
 *
 * Casos resueltos a mano en tests/selector-smartphone-motor.spec.ts.
 */

export type SistemaOS = 'ios' | 'android';
export type GamaKey = 'basica' | 'media' | 'alta' | 'pro';

export interface Resultado {
  os: SistemaOS;
  /** La gama que se recomienda, ya acotada por el presupuesto. */
  gama: GamaKey;
  /** La que pedirían las respuestas de uso, sin mirar el presupuesto. */
  gamaPorPerfil: GamaKey;
  /** El presupuesto ha recortado la recomendación por debajo de lo que pedía el uso. */
  recortadaPorPresupuesto: boolean;
  /** El presupuesto la ha subido por encima de lo que el uso necesita. */
  ampliadaPorPresupuesto: boolean;
  razones: string[];
  consejos: string[];
  caracteristicas: string[];
}

/** Orden de menor a mayor, para poder comparar gamas. */
export const ORDEN_GAMAS: GamaKey[] = ['basica', 'media', 'alta', 'pro'];

/**
 * Gama MÁXIMA que cabe en cada tramo de presupuesto, según las propias horquillas que la
 * app publica: básica 100-250 € · media 250-500 € · alta 500-900 € · pro 900-1.500+ €.
 */
export const TOPE_POR_PRESUPUESTO: Record<string, GamaKey> = {
  bajo: 'basica',
  medio: 'media',
  alto: 'alta',
  premium: 'pro',
};

/** Cómo se llama cada tramo en la pregunta, para poder nombrarlo en la explicación. */
export const ETIQUETA_PRESUPUESTO: Record<string, string> = {
  bajo: 'hasta 250 €',
  medio: 'de 250 a 500 €',
  alto: 'de 500 a 900 €',
  premium: 'de más de 900 €',
};

const NOMBRE_GAMA: Record<GamaKey, string> = {
  basica: 'básica',
  media: 'media',
  alta: 'alta',
  pro: 'pro o flagship',
};

const esMayor = (a: GamaKey, b: GamaKey) => ORDEN_GAMAS.indexOf(a) > ORDEN_GAMAS.indexOf(b);

export function calcularResultado(respuestas: Record<number, string>): Resultado {
  let puntosiOS = 0;
  let puntosGamaAlta = 0;
  const razones: string[] = [];
  const consejos: string[] = [];
  const caracteristicas: string[] = [];

  // ─ Sistema operativo ─
  if (respuestas[4] === 'si_muchos') puntosiOS += 3;
  if (respuestas[4] === 'si_alguno') puntosiOS += 1;
  if (respuestas[5] === 'mac') puntosiOS += 2;
  if (respuestas[5] === 'windows') puntosiOS -= 1;
  const os: SistemaOS = puntosiOS >= 3 ? 'ios' : 'android';

  // ─ Gama que pide el USO declarado, sin mirar el bolsillo ─
  if (respuestas[1] === 'foto') puntosGamaAlta += 2;
  if (respuestas[1] === 'trabajo') puntosGamaAlta += 1;
  if (respuestas[2] === 'intenso') puntosGamaAlta += 2;
  if (respuestas[2] === 'medio') puntosGamaAlta += 1;
  if (respuestas[3] === 'extremo') puntosGamaAlta += 2;
  if (respuestas[3] === 'mucho') puntosGamaAlta += 1;
  if (respuestas[6] === 'camara') puntosGamaAlta += 2;
  if (respuestas[6] === 'rendimiento') puntosGamaAlta += 1;
  if (respuestas[7] === 'largo') puntosGamaAlta += 2;

  let gamaPorPerfil: GamaKey;
  if (puntosGamaAlta >= 7) gamaPorPerfil = 'pro';
  else if (puntosGamaAlta >= 4) gamaPorPerfil = 'alta';
  else if (puntosGamaAlta >= 1) gamaPorPerfil = 'media';
  else gamaPorPerfil = 'basica';

  // ─ El presupuesto declarado manda, en los cuatro tramos ─
  const presupuesto = respuestas[9];
  const tope = TOPE_POR_PRESUPUESTO[presupuesto] ?? 'pro';
  let gama = gamaPorPerfil;
  const recortadaPorPresupuesto = esMayor(gamaPorPerfil, tope);
  if (recortadaPorPresupuesto) gama = tope;

  // Quien declara más de 900 € y un uso modesto sigue recibiendo el flagship que pide, pero
  // se le dice que su uso no lo exige.
  const ampliadaPorPresupuesto = presupuesto === 'premium' && gamaPorPerfil !== 'pro';
  if (ampliadaPorPresupuesto) gama = 'pro';

  // ─ Razones: explican LO QUE SE HA RESPONDIDO, no la gama de salida ─
  if (os === 'ios') {
    razones.push('Tienes otros dispositivos Apple: el ecosistema integrado (AirDrop, iMessage, Handoff) te aporta valor real.');
    razones.push('iOS recibe actualizaciones durante 6-7 años, lo que protege tu inversión a largo plazo.');
  } else {
    razones.push('Android ofrece más variedad de modelos, marcas y precios que se adaptan a cualquier necesidad.');
    razones.push('Mayor libertad de personalización y compatibilidad con ecosistemas no Apple (Google, Microsoft…).');
  }

  if (recortadaPorPresupuesto) {
    razones.push(
      `Tus respuestas sobre uso apuntaban a la gama ${NOMBRE_GAMA[gamaPorPerfil]}, pero has declarado un presupuesto ${ETIQUETA_PRESUPUESTO[presupuesto] ?? 'ajustado'}: manda el presupuesto, así que la recomendación se ajusta a lo que cabe en ese tramo.`,
    );
    razones.push(
      'Si alguna de esas exigencias es innegociable, subir de tramo es la única forma de cubrirla; si no, aquí van las mejores opciones dentro de tu presupuesto.',
    );
  } else if (ampliadaPorPresupuesto) {
    razones.push(
      `Tu uso declarado se cubriría de sobra con la gama ${NOMBRE_GAMA[gamaPorPerfil]}: el salto al flagship responde a tu presupuesto, no a una necesidad técnica. Gastar menos no te dejaría corto.`,
    );
  } else if (gama === 'pro') {
    razones.push('Tu perfil de uso intenso o de fotografía avanzada justifica la inversión en un flagship.');
    razones.push('Los móviles pro reciben soporte extendido (7 años en algunos fabricantes), amortizando el coste.');
  } else if (gama === 'alta') {
    razones.push('La gama alta te ofrece cámaras con teleobjetivo, pantallas de 120 Hz y rendimiento sólido sin llegar al precio máximo.');
  } else if (gama === 'media') {
    razones.push('La gama media actual es notable: procesadores rápidos, cámaras decentes y autonomía de todo el día.');
  } else {
    razones.push('Tu uso declarado —llamadas, mensajería y navegación— se cubre sin problema con la gama de entrada.');
  }

  if (respuestas[7] === 'largo') {
    razones.push('Buscar modelos con varios años de actualizaciones garantizadas prolonga la vida útil del dispositivo.');
  }

  // ─ Consejos ─
  if (respuestas[10] === 'si' || respuestas[10] === 'quizas') {
    consejos.push('💡 Un dispositivo reacondicionado certificado puede ahorrarte un 30-40 % con garantía incluida; comprueba el estado de la batería antes de comprar.');
  }
  if (recortadaPorPresupuesto && respuestas[10] === 'no') {
    consejos.push('♻️ Un reacondicionado certificado de la gama que pedía tu uso suele costar lo mismo que uno nuevo del tramo que has elegido: es la vía más directa para no renunciar a nada.');
  }
  if (respuestas[7] === 'largo') {
    consejos.push('📅 Comprueba en la ficha técnica exacta cuántos años de actualizaciones de SO garantiza el fabricante, no solo parches de seguridad.');
  }
  if (respuestas[8] === 'resistente') {
    consejos.push('💧 Verifica que el modelo elegido tenga certificación IP67 o IP68 antes de comprarlo.');
  }
  if (presupuesto === 'medio' || presupuesto === 'bajo') {
    consejos.push('🛒 Los mejores precios suelen aparecer tras el lanzamiento de la generación siguiente del modelo que te interesa.');
  }
  if (respuestas[6] === 'camara') {
    consejos.push('📷 El tamaño del sensor y la apertura importan más que los megapíxeles; busca comparativas de fotografía independientes.');
  }
  consejos.push('🔋 Comprueba siempre la capacidad de batería (mAh) y si admite carga rápida — muchos modelos de gama media superan a los flagship en autonomía.');

  // ─ Características: siempre escritas PARA LA GAMA FINAL ─
  const esEntrada = gama === 'basica';

  // Actualizaciones
  if (respuestas[7] === 'largo' && !esEntrada) {
    caracteristicas.push('🔄 Actualizaciones del sistema operativo garantizadas: mínimo 5 años desde la compra');
  } else if (respuestas[7] === 'largo') {
    caracteristicas.push('🔄 Actualizaciones garantizadas: pide al menos 3 años, que es lo máximo habitual en este tramo (si necesitas 5, no los encontrarás aquí)');
  } else if (gama === 'pro' || gama === 'alta') {
    caracteristicas.push('🔄 Actualizaciones del sistema operativo garantizadas: mínimo 4 años');
  } else {
    caracteristicas.push('🔄 Actualizaciones del sistema operativo garantizadas: mínimo 3 años');
  }

  // Batería
  if (respuestas[3] === 'extremo' || respuestas[6] === 'bateria') {
    caracteristicas.push('🔋 Batería ≥ 5.000 mAh con carga rápida ≥ 45 W');
  } else if (respuestas[3] === 'mucho') {
    caracteristicas.push('🔋 Batería ≥ 4.500 mAh con carga rápida ≥ 30 W');
  } else {
    caracteristicas.push('🔋 Batería ≥ 4.000 mAh (suficiente para un día completo de uso moderado)');
  }

  // Cámara
  if (respuestas[1] === 'foto' || respuestas[6] === 'camara') {
    if (gama === 'pro') {
      caracteristicas.push("📷 Sistema de triple cámara con teleobjetivo óptico (≥ 3×) y sensor principal de gran formato (≥ 1/1,3'')");
    } else if (gama === 'alta') {
      caracteristicas.push('📷 Doble o triple cámara con teleobjetivo óptico y modo noche avanzado');
    } else if (gama === 'media') {
      caracteristicas.push('📷 Cámara principal con apertura ≤ f/1,9 y modo noche incluido');
    } else {
      caracteristicas.push('📷 Cámara principal con estabilización óptica si la encuentras: en este tramo no hay teleobjetivo, y el zoom será digital');
    }
  }

  // Procesador y pantalla
  if (respuestas[2] === 'intenso' || respuestas[6] === 'rendimiento') {
    if (esEntrada) {
      caracteristicas.push('⚡ El procesador más potente que encuentres en este tramo; para juegos exigentes tendrás que bajar la calidad gráfica');
      caracteristicas.push('🖥️ Pantalla de 90 Hz si la hay: los 120 Hz empiezan en la gama media');
    } else {
      caracteristicas.push('⚡ Procesador de gama alta de la generación más reciente disponible');
      caracteristicas.push('🖥️ Pantalla con tasa de refresco ≥ 120 Hz');
      caracteristicas.push('💾 RAM ≥ 8 GB');
    }
  } else if (respuestas[2] === 'medio') {
    caracteristicas.push('⚡ Procesador de gama media-alta con pantalla a ≥ 90 Hz');
  }

  // Diseño y resistencia
  if (respuestas[8] === 'resistente') {
    caracteristicas.push(
      esEntrada
        ? '💧 Certificación IP67 como mínimo: en este tramo es lo que se encuentra, y muchos modelos solo declaran IP54'
        : '💧 Certificación de resistencia al agua y polvo: IP67 como mínimo, IP68 preferible',
    );
  }
  if (respuestas[8] === 'pequeno') {
    caracteristicas.push("📐 Formato compacto: pantalla ≤ 6,2'' (evita las variantes «Plus», «XL» o «Ultra»)");
  }
  if (respuestas[8] === 'grande') {
    caracteristicas.push("📐 Pantalla ≥ 6,5'' con tecnología AMOLED o equivalente");
  }

  // NFC y 5G: son requisitos del USUARIO, no privilegios de gama. Antes se reservaban a
  // `gama !== 'basica'`, así que desaparecían justo en el perfil que menos margen tiene
  // para equivocarse de compra.
  caracteristicas.push('📡 NFC para pagos sin contacto (verifica disponibilidad en tu región)');
  caracteristicas.push(
    esEntrada
      ? '📶 Conectividad 5G: en este tramo no está en todos los modelos, compruébalo en la ficha'
      : '📶 Conectividad 5G',
  );

  // Almacenamiento
  if (gama === 'pro' || gama === 'alta') {
    caracteristicas.push('💾 Almacenamiento interno ≥ 256 GB (o ≥ 128 GB con ranura microSD)');
  } else {
    caracteristicas.push('💾 Almacenamiento interno ≥ 128 GB');
  }

  return {
    os,
    gama,
    gamaPorPerfil,
    recortadaPorPresupuesto,
    ampliadaPorPresupuesto,
    razones,
    consejos,
    caracteristicas,
  };
}
