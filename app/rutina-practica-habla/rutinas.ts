/**
 * Datos de las rutinas de práctica.
 *
 * Cada bloque encadena una herramienta que YA existe en meskeIA con los ajustes
 * que esa misma herramienta propone por defecto. Aquí no se inventan pautas
 * clínicas ni dosis: esto organiza el tiempo de una sesión, no la prescribe.
 */

export type AreaId = 'fluidez' | 'voz' | 'articulacion' | 'lectura';

export interface Herramienta {
  url: string;
  nombre: string;
  /** Cómo llegar a ella con los ajustes útiles para este bloque. */
  ajuste: string;
}

export interface BloqueRutina {
  id: string;
  titulo: string;
  /** Qué hacer durante el bloque, en lenguaje llano. */
  descripcion: string;
  /** Peso relativo para repartir los minutos de la sesión. */
  peso: number;
  herramienta?: Herramienta;
}

export interface Area {
  id: AreaId;
  nombre: string;
  icono: string;
  descripcion: string;
  bloques: BloqueRutina[];
}

export const DURACIONES = [10, 20, 30] as const;
export type Duracion = (typeof DURACIONES)[number];

export const AREAS: Area[] = [
  {
    id: 'fluidez',
    nombre: 'Fluidez del habla',
    icono: '🌊',
    descripcion: 'Hablar con menos bloqueos, apoyándote en el ritmo y en oír tu propia voz.',
    bloques: [
      {
        id: 'fluidez-respiracion',
        titulo: 'Respiración y arranque',
        descripcion:
          'Siéntate cómodo y respira de forma diafragmática, notando cómo se mueve el abdomen y no el pecho. Es la preparación: no hables todavía.',
        peso: 1,
        herramienta: {
          url: '/guia-respiracion/',
          nombre: 'Guía de Respiración Consciente',
          ajuste: 'Elige la técnica «Diafragmática» y sigue el círculo animado.',
        },
      },
      {
        id: 'fluidez-daf',
        titulo: 'Lectura oyendo tu voz con retardo',
        descripcion:
          'Con auriculares, lee un texto en voz alta mientras te oyes con un pequeño retardo. Empieza por el valor que trae la herramienta y muévelo hasta que hablar te resulte cómodo.',
        peso: 3,
        herramienta: {
          url: '/daf-retroalimentacion-auditiva/',
          nombre: 'DAF: Retroalimentación Auditiva Retardada',
          ajuste: 'Arranca con el retardo por defecto (120 ms) y ajústalo dentro del rango disponible.',
        },
      },
      {
        id: 'fluidez-ritmo',
        titulo: 'Habla marcando el ritmo',
        descripcion:
          'Lee o improvisa siguiendo un pulso lento y regular, una sílaba o una palabra por golpe. Prioriza mantener el ritmo por encima de la velocidad.',
        peso: 2,
        herramienta: {
          url: '/metronomo/',
          nombre: 'Metrónomo Online',
          ajuste: 'Empieza por un tempo lento y cómodo; súbelo solo si el ritmo se sostiene sin esfuerzo.',
        },
      },
      {
        id: 'fluidez-libre',
        titulo: 'Habla libre, sin apoyos',
        descripcion:
          'Quita los auriculares y el pulso, y cuenta en voz alta algo cotidiano: qué has hecho hoy, qué vas a cenar. El objetivo es trasladar la sensación del bloque anterior al habla normal.',
        peso: 1,
      },
    ],
  },
  {
    id: 'voz',
    nombre: 'Voz y proyección',
    icono: '🔊',
    descripcion: 'Sostener la voz, ganar volumen y terminar las frases sin quedarte sin aire.',
    bloques: [
      {
        id: 'voz-respiracion',
        titulo: 'Apoyo respiratorio',
        descripcion:
          'Respiración diafragmática con espiración larga y controlada. La voz se sostiene sobre el aire: sin este apoyo, el resto del trabajo cansa la garganta.',
        peso: 1,
        herramienta: {
          url: '/guia-respiracion/',
          nombre: 'Guía de Respiración Consciente',
          ajuste: 'Técnica «Diafragmática» o «Coherente», la que te resulte más natural.',
        },
      },
      {
        id: 'voz-vocales',
        titulo: 'Vocales sostenidas',
        descripcion:
          'Mantén cada vocal el mayor tiempo posible con un volumen estable, sin forzar. La herramienta cronometra cuánto aguantas y te deja ver la evolución.',
        peso: 3,
        herramienta: {
          url: '/ejercicios-vocalizacion/',
          nombre: 'Ejercicios de Vocalización',
          ajuste: 'Empieza por las vocales sostenidas antes de pasar a las frases.',
        },
      },
      {
        id: 'voz-observar',
        titulo: 'Escúchate mientras hablas',
        descripcion:
          'Habla o sostén una vocal frente al micrófono y observa la señal en pantalla. Ver la voz ayuda a notar cuándo se apaga al final de la frase.',
        peso: 2,
        herramienta: {
          url: '/analizador-espectro/',
          nombre: 'Analizador de Espectro',
          ajuste: 'Fíjate en si la señal se mantiene o decae en las últimas palabras.',
        },
      },
      {
        id: 'voz-lectura',
        titulo: 'Lectura proyectada',
        descripcion:
          'Lee un párrafo en voz alta imaginando que alguien te escucha al fondo de la habitación. Termina cada frase con la misma energía con la que la empezaste.',
        peso: 2,
        herramienta: {
          url: '/lector-texto-voz/',
          nombre: 'Lector de Texto en Voz Alta',
          ajuste: 'Puedes escuchar antes el párrafo leído para tener una referencia de ritmo.',
        },
      },
    ],
  },
  {
    id: 'articulacion',
    nombre: 'Articulación y dicción',
    icono: '👄',
    descripcion: 'Que se te entienda mejor: precisión en cada sílaba, sin comerte finales.',
    bloques: [
      {
        id: 'articulacion-calentamiento',
        titulo: 'Calentamiento de boca',
        descripcion:
          'Vocales exageradas, articulando de más: abre y cierra la boca más de lo que te pide el cuerpo. Después, repite la serie a volumen normal.',
        peso: 1,
        herramienta: {
          url: '/ejercicios-vocalizacion/',
          nombre: 'Ejercicios de Vocalización',
          ajuste: 'Usa la serie de vocales como calentamiento, sin buscar marca de tiempo.',
        },
      },
      {
        id: 'articulacion-silabas',
        titulo: 'Palabras difíciles, sílaba a sílaba',
        descripcion:
          'Elige las palabras que se te atragantan y sepáralas en sílabas. Dilas despacio marcando cada una y luego únelas a velocidad normal.',
        peso: 3,
        herramienta: {
          url: '/contador-silabas/',
          nombre: 'Contador de Sílabas',
          ajuste: 'Pega la palabra o la frase y trabaja con la separación silábica que devuelve.',
        },
      },
      {
        id: 'articulacion-ritmo',
        titulo: 'Precisión con pulso',
        descripcion:
          'Repite esas mismas palabras siguiendo un pulso regular, una sílaba por golpe. Si te comes una sílaba, baja el tempo en vez de acelerar.',
        peso: 2,
        herramienta: {
          url: '/metronomo/',
          nombre: 'Metrónomo Online',
          ajuste: 'Tempo lento al principio; la meta es no perder ninguna sílaba.',
        },
      },
      {
        id: 'articulacion-cierre',
        titulo: 'Frase completa',
        descripcion:
          'Di en voz alta tres o cuatro frases largas cuidando especialmente los finales de palabra, que son los primeros en perderse cuando hablamos rápido.',
        peso: 1,
      },
    ],
  },
  {
    id: 'lectura',
    nombre: 'Lectura en voz alta',
    icono: '📖',
    descripcion: 'Leer en alto con soltura, sin trabarte ni perder el hilo del texto.',
    bloques: [
      {
        id: 'lectura-preparar',
        titulo: 'Prepara el texto',
        descripcion:
          'Elige un fragmento corto y ajústalo para que se lea sin esfuerzo: tipografía amplia, más espacio entre líneas y entre letras. Un texto cómodo evita la mitad de los tropiezos.',
        peso: 1,
        herramienta: {
          url: '/adaptador-dislexia/',
          nombre: 'Adaptador de Lectura',
          ajuste: 'Sube el tamaño y el interlineado hasta que el texto te resulte cómodo.',
        },
      },
      {
        id: 'lectura-modelo',
        titulo: 'Escucha el fragmento',
        descripcion:
          'Oye el texto leído una vez, prestando atención a las pausas y a dónde cae el énfasis. No leas a la vez: solo escucha.',
        peso: 2,
        herramienta: {
          url: '/lector-texto-voz/',
          nombre: 'Lector de Texto en Voz Alta',
          ajuste: 'Baja la velocidad si te cuesta seguir las pausas.',
        },
      },
      {
        id: 'lectura-propia',
        titulo: 'Tu lectura',
        descripcion:
          'Lee tú el fragmento en voz alta, sin prisa. Si te trabas, no vuelvas al principio: sigue hasta el final y marca mentalmente dónde ha pasado.',
        peso: 3,
        herramienta: {
          url: '/temporizador-visual/',
          nombre: 'Temporizador Visual',
          ajuste: 'Útil si prefieres ver el tiempo restante en grande mientras lees.',
        },
      },
      {
        id: 'lectura-repaso',
        titulo: 'Repaso de lo que se atascó',
        descripcion:
          'Vuelve solo a las dos o tres frases que se te resistieron y léelas un par de veces más. Terminar por una frase que sale bien deja mejor sensación.',
        peso: 2,
      },
    ],
  },
];

export interface BloqueConMinutos extends BloqueRutina {
  minutos: number;
}

/**
 * Reparte los minutos de la sesión entre los bloques según su peso,
 * garantizando al menos 1 minuto por bloque y que la suma cuadre exacta.
 */
export function repartirMinutos(bloques: BloqueRutina[], total: number): BloqueConMinutos[] {
  const pesoTotal = bloques.reduce((suma, b) => suma + b.peso, 0);
  const minimoNecesario = bloques.length;
  const repartible = Math.max(0, total - minimoNecesario);

  // Reparto proporcional del tiempo que sobra tras dar 1 minuto a cada bloque.
  const brutos = bloques.map((b) => (repartible * b.peso) / pesoTotal);
  const enteros = brutos.map((n) => Math.floor(n));
  let restante = repartible - enteros.reduce((suma, n) => suma + n, 0);

  // Los minutos sueltos van a los bloques con mayor parte decimal perdida.
  const orden = brutos
    .map((bruto, i) => ({ i, resto: bruto - enteros[i] }))
    .sort((a, b) => b.resto - a.resto);

  for (const { i } of orden) {
    if (restante <= 0) break;
    enteros[i]++;
    restante--;
  }

  return bloques.map((b, i) => ({ ...b, minutos: 1 + enteros[i] }));
}
