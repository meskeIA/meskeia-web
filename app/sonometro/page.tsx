'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Sonometro.module.css';
import { MeskeiaLogo, Footer, RelatedApps, EducationalSection, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber, formatDate } from '@/lib';

// Niveles de referencia en dB
const NOISE_LEVELS = [
  { min: 0, max: 30, label: 'Muy silencioso', color: '#10b981', icon: '🤫', examples: 'Respiración, susurro' },
  { min: 30, max: 50, label: 'Silencioso', color: '#22c55e', icon: '🌙', examples: 'Biblioteca, habitación tranquila' },
  { min: 50, max: 60, label: 'Moderado', color: '#84cc16', icon: '🏠', examples: 'Conversación normal, oficina' },
  { min: 60, max: 70, label: 'Algo ruidoso', color: '#eab308', icon: '📢', examples: 'Restaurante, TV alta' },
  { min: 70, max: 85, label: 'Ruidoso', color: '#f97316', icon: '🚗', examples: 'Tráfico, aspiradora' },
  { min: 85, max: 100, label: 'Muy ruidoso', color: '#ef4444', icon: '⚠️', examples: 'Moto, concierto cercano' },
  { min: 100, max: 130, label: 'Peligroso', color: '#dc2626', icon: '🔴', examples: 'Sirena, taladro, avión' },
];

/** Fondo de escala del medidor: 0-130 dB(A) repartidos en el semicírculo. */
const DB_MAXIMO_ESCALA = 130;

/** Ángulo de la aguja para un nivel, en grados: −90° (0 dB) a +90° (130 dB). */
const anguloDe = (db: number): number => (db / DB_MAXIMO_ESCALA) * 180 - 90;

/**
 * Las bandas de color, como SECTORES del semicírculo y no como columnas verticales.
 *
 * La aguja gira linealmente en dB, así que la posición horizontal de su punta va con el
 * SENO del ángulo; las bandas se repartían con anchuras lineales en dB, de modo que las dos
 * escalas solo coincidían en el centro. En los extremos la aguja señalaba una banda distinta
 * de la que la propia app declaraba: con 3,0 dB(A) («Muy silencioso 0-30») la punta caía
 * sobre el verde de «Silencioso 30-50», y con 111,0 dB(A) («Peligroso»), sobre «Muy
 * ruidoso». Era el hallazgo 279 del Inspector, que la reparación del suelo de 8 bits destapó
 * al permitir por fin lecturas por debajo de 44,9 dB.
 *
 * Con un `conic-gradient` centrado en el pivote de la aguja, banda y aguja comparten escala
 * por construcción: el ángulo del sector ES el ángulo de la aguja.
 */
const FONDO_ESCALA = `conic-gradient(from 270deg at 50% 100%, ${NOISE_LEVELS.map(
  (level) =>
    `${level.color} ${(level.min / DB_MAXIMO_ESCALA) * 180}deg ${(level.max / DB_MAXIMO_ESCALA) * 180}deg`,
).join(', ')})`;

/** Los valores rotulados en el arco: los bordes de las siete bandas. */
const MARCAS_ESCALA = [0, 30, 50, 70, 85, 100, 130];

/**
 * Coloca cada rótulo en SU ángulo, no a distancias iguales. Con `justify-content:
 * space-between` los siete números se repartían por igual aunque sus valores no lo estén
 * (de 70 a 85 hay 15 dB y de 100 a 130, treinta), y se desalineaban de los bordes de color
 * hasta 25 px.
 *
 * El contenedor tiene proporción 2:1, así que su alto es el radio del arco: un mismo factor
 * vale como porcentaje de medio ancho y como porcentaje del alto, y el resultado es
 * circular sin necesidad de píxeles.
 */
const RADIO_MARCAS = 0.72; // fracción del radio del arco

const posicionDeMarca = (db: number): { left: string; bottom: string } => {
  const radianes = (anguloDe(db) * Math.PI) / 180;
  return {
    left: `${50 + RADIO_MARCAS * 50 * Math.sin(radianes)}%`,
    bottom: `${RADIO_MARCAS * 100 * Math.cos(radianes)}%`,
  };
};

// Obtener nivel actual
function getNoiseLevel(db: number) {
  return NOISE_LEVELS.find(level => db >= level.min && db < level.max) || NOISE_LEVELS[NOISE_LEVELS.length - 1];
}

// Calibración: desplazamiento en dB que se suma al nivel medido por el micrófono.
// 90 es la referencia por defecto (el valor con el que la app nació) y funciona
// razonablemente en portátiles y móviles de gama media, pero NINGÚN micrófono
// integrado viene calibrado de fábrica: por eso es ajustable y se recuerda.
const CALIBRACION_DEFECTO = 90;
const CALIBRACION_MIN = 60;
const CALIBRACION_MAX = 120;
const CLAVE_CALIBRACION = 'sonometro-calibracion';

/**
 * Registro de mediciones — el diario de sesiones que la propia app pedía llevar.
 *
 * Su bloque educativo instruye a «registrar el nivel durante varias sesiones en distintos
 * días y horarios» para documentar una molestia, pero hasta ahora lo único que sobrevivía a
 * cerrar la pestaña era la calibración: el LAeq de la sesión, que es el dato que piden las
 * ordenanzas, se perdía en cuanto se soltaba la pantalla. La guía sorteaba el problema
 * mandando hacer capturas de pantalla.
 *
 * Todo queda en ESTE navegador: no hay servidor, ni cuenta, ni sincronización. Es la misma
 * promesa que hace el resto de la app con el audio, y por eso el registro se guarda en
 * localStorage y no en ningún otro sitio.
 */
const CLAVE_SESIONES = 'sonometro-sesiones';

/** Tope del registro: las más antiguas se descartan al superarlo. */
const MAX_SESIONES = 60;

/**
 * Duración mínima para que una medición entre en el registro.
 *
 * Sin este suelo, cada pulsación accidental de «Iniciar / Detener» dejaría una fila, y un
 * parte lleno de sesiones de dos segundos no documenta nada. Tres segundos es además el
 * mínimo por debajo del cual el LAeq todavía arrastra el arranque del micrófono.
 */
const SEGUNDOS_MINIMOS_REGISTRO = 3;

interface SesionRegistrada {
  /** Momento de FIN de la medición, en ISO. La fecha y la hora se derivan de aquí. */
  id: string;
  duracionSegundos: number;
  laeq: number;
  minDb: number;
  maxDb: number;
  /** El desplazamiento con el que se midió: sin él, dos filas de días distintos no son comparables. */
  calibracion: number;
  /** Anotación del usuario: dónde y en qué condiciones se midió. */
  nota: string;
}

/** ¿Es una sesión guardada y no cualquier cosa que haya en localStorage? */
function esSesionValida(valor: unknown): valor is SesionRegistrada {
  if (typeof valor !== 'object' || valor === null) return false;
  const s = valor as Record<string, unknown>;
  return (
    typeof s.id === 'string' &&
    Number.isFinite(s.duracionSegundos) &&
    Number.isFinite(s.laeq) &&
    Number.isFinite(s.minDb) &&
    Number.isFinite(s.maxDb) &&
    Number.isFinite(s.calibracion) &&
    typeof s.nota === 'string'
  );
}

/**
 * Fotogramas que el instrumento se da para estabilizarse antes de empezar a acumular
 * estadísticas de sesión.
 *
 * Se cuenta en FOTOGRAMAS y no en milisegundos porque lo que tiene que asentarse depende de
 * cuántas veces se ha leído el analizador, no del reloj: la ventana temporal son 2048
 * muestras (~46 ms, tres fotogramas a 60 fps) y el `smoothingTimeConstant` de 0,3 promedia
 * lecturas consecutivas, así que su error decae 0,3^n por LECTURA. Con diez, es de 6·10⁻⁶.
 * Una guarda por tiempo funcionaba con el equipo desahogado y fallaba con él cargado, que es
 * justo cuando llegan menos fotogramas por segundo.
 */
const FOTOGRAMAS_ESTABILIZACION = 10;

/**
 * Ganancia de la ponderación A a una frecuencia, en dB (IEC 61672-1).
 *
 * La app rotula su estadística principal «LAeq» y todo su bloque educativo remite a límites
 * en dB(A) —85 dB(A) laborales, 45 dB(A) nocturnos—, pero el motor era un RMS de banda
 * ancha sin ponderar: cometía exactamente el error del que ella misma avisa en su caja de
 * errores frecuentes. Dos senoides de la misma amplitud a 1 kHz y a 100 Hz salían iguales
 * (61,1 y 61,0 dB) cuando deben separarse 19,1 dB.
 *
 *   A(f) = 20·log₁₀( 12194²·f⁴ / [ (f²+20,6²)·√((f²+107,7²)(f²+737,9²))·(f²+12194²) ] ) + 2,00
 *
 * Por definición vale 0 dB a 1 kHz, que es lo que ancla la calibración del usuario.
 */
function ponderacionA(f: number): number {
  const f2 = f * f;
  const numerador = 12194 ** 2 * f2 * f2;
  const denominador =
    (f2 + 20.6 ** 2) *
    Math.sqrt((f2 + 107.7 ** 2) * (f2 + 737.9 ** 2)) *
    (f2 + 12194 ** 2);
  return 20 * Math.log10(numerador / denominador) + 2.0;
}

// Formatea una duración en segundos como "M min S s" (o "S s" si no llega al minuto)
function formatDuracion(segundos: number): string {
  const min = Math.floor(segundos / 60);
  const seg = Math.floor(segundos % 60);
  return min > 0 ? `${min} min ${seg} s` : `${seg} s`;
}

export default function SonometroPage() {
  const [isActive, setIsActive] = useState(false);
  const [currentDb, setCurrentDb] = useState(0);
  const [minDb, setMinDb] = useState(Infinity);
  const [maxDb, setMaxDb] = useState(0);
  const [laeq, setLaeq] = useState(0);
  const [duracion, setDuracion] = useState(0);
  const [calibracion, setCalibracion] = useState(CALIBRACION_DEFECTO);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  // Ha habido al menos una sesión de medición: mantiene el resumen en pantalla tras detener
  const [hayMedicion, setHayMedicion] = useState(false);
  // Registro de mediciones anteriores, recuperado de este navegador
  const [sesiones, setSesiones] = useState<SesionRegistrada[]>([]);
  // Qué ocurrió con la última medición al detenerla (se guardó o era demasiado corta)
  const [avisoRegistro, setAvisoRegistro] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  // Media incremental de la ENERGÍA acústica (no de los dB) y nº de muestras: es lo
  // que define el LAeq. Van en refs porque el bucle de medición corre a ~60 fps y no
  // debe provocar re-render por muestra.
  const energiaMediaRef = useRef(0);
  const muestrasRef = useRef(0);
  const inicioRef = useRef(0);
  // Fotogramas CON AUDIO ya leídos: los primeros no cuentan para las estadísticas
  const fotogramasRef = useRef(0);
  // La calibración se lee dentro del bucle sin recrearlo: si viviera en las
  // dependencias de calculateDb, cada ajuste del slider reiniciaría measureLoop.
  const calibracionRef = useRef(CALIBRACION_DEFECTO);
  // Ganancia lineal de la ponderación A por bin del analizador. Depende solo de la
  // frecuencia de muestreo y del fftSize, así que se tabula una vez al arrancar en vez de
  // evaluar el logaritmo 1.024 veces en cada fotograma.
  const gananciaARef = useRef<Float64Array | null>(null);

  // Limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      stopMeasuring();
    };
  }, []);

  // Recuperar la calibración guardada. Se hace en efecto (no en el estado inicial)
  // para no romper la hidratación: el servidor no tiene localStorage.
  useEffect(() => {
    const guardada = Number(window.localStorage.getItem(CLAVE_CALIBRACION));
    if (Number.isFinite(guardada) && guardada >= CALIBRACION_MIN && guardada <= CALIBRACION_MAX) {
      setCalibracion(guardada);
    }
  }, []);

  // Espejo de la calibración para el bucle de medición, que la lee por ref
  useEffect(() => {
    calibracionRef.current = calibracion;
  }, [calibracion]);

  // Recuperar el registro de mediciones. En efecto, por lo mismo que la calibración: el
  // servidor no tiene localStorage y el HTML servido debe coincidir con el primer render.
  useEffect(() => {
    try {
      const crudo = window.localStorage.getItem(CLAVE_SESIONES);
      if (!crudo) return;
      const leidas: unknown = JSON.parse(crudo);
      if (Array.isArray(leidas)) setSesiones(leidas.filter(esSesionValida));
    } catch {
      // JSON corrupto o localStorage bloqueado: se arranca con el registro vacío en vez de
      // reventar la página entera, que es lo único que el usuario no puede arreglar.
    }
  }, []);

  /**
   * Único punto por el que se escribe el registro, igual que `cambiarCalibracion` es el
   * único que escribe la calibración — y por la misma razón: persistir en un efecto sobre
   * `[sesiones]` crearía una carrera con el efecto que las RECUPERA, y en el primer commit
   * el array vacío inicial se escribiría encima de lo guardado.
   */
  const guardarSesiones = useCallback((nuevas: SesionRegistrada[]) => {
    setSesiones(nuevas);
    try {
      window.localStorage.setItem(CLAVE_SESIONES, JSON.stringify(nuevas));
    } catch {
      // Cuota agotada o almacenamiento denegado: el registro sigue en pantalla durante esta
      // visita, simplemente no sobrevivirá a cerrarla.
    }
  }, []);

  /**
   * Único punto por el que se cambia la calibración, y el único que la persiste.
   *
   * Persistirla en un efecto sobre `[calibracion]` creaba una carrera con el efecto que la
   * RECUPERA: en el primer commit se ejecutaban los dos, y el segundo escribía el valor por
   * defecto (90) sobre el que el primero acababa de leer. Con StrictMode —o sea, en todo el
   * desarrollo— la segunda pasada de efectos releía ese 90 y la calibración del usuario se
   * perdía en cada carga. Encontrado el 24/08/2026 al escribir el test de regresión del
   * hallazgo 279, que necesitaba arrancar con una calibración guardada de 60 dB.
   *
   * Guardar solo cuando alguien la cambia elimina la carrera: no hay ningún camino por el
   * que el valor por defecto llegue a escribirse encima del guardado.
   */
  const cambiarCalibracion = useCallback((valor: number) => {
    const acotada = Math.min(CALIBRACION_MAX, Math.max(CALIBRACION_MIN, valor));
    setCalibracion(acotada);
    calibracionRef.current = acotada;
    window.localStorage.setItem(CLAVE_CALIBRACION, String(acotada));
  }, []);

  /**
   * Calcular dB desde la onda del analizador.
   *
   * Se lee en coma flotante, no con `getByteTimeDomainData`. Con 8 bits la señal se
   * cuantiza en 256 escalones y por debajo de ~50 dB la lectura dejaba de seguirla: se
   * plantaba en un suelo de 44,9 dB, de modo que las dos franjas bajas de la tabla de la
   * propia app —«Muy silencioso 0-30» y «Silencioso 30-50»— eran inalcanzables, y son justo
   * las que su bloque educativo manda comparar con el límite nocturno y con los «menos de
   * 30 dB» de la OMS para el cuarto de un bebé. Leyendo la MISMA señal del MISMO analizador
   * en float salen los valores exactos, así que el suelo era de la resolución elegida.
   */
  const calculateDb = useCallback((dataArray: Float32Array): number => {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);

    // Convertir RMS a dB. El desplazamiento de calibración lo pone el usuario: los
    // micrófonos integrados no tienen sensibilidad conocida, así que sin un punto de
    // referencia externo el valor absoluto es una estimación.
    return 20 * Math.log10(Math.max(rms, 1e-7)) + calibracionRef.current;
  }, []);

  /**
   * Corrección de ponderación A del espectro actual, en dB.
   *
   * Es la diferencia entre el nivel ponderado A y el nivel sin ponderar para el contenido
   * espectral de este instante: 10·log₁₀(Σ pₖ·10^(A(fₖ)/10) / Σ pₖ). Al ser un cociente de
   * energías no depende de cómo esté normalizada la FFT, así que se puede sumar al RMS
   * temporal sin tocar la calibración que el usuario ya tenía guardada. Con un tono puro de
   * 1 kHz vale 0 dB; con uno de 100 Hz, −19,1 dB.
   */
  const correccionPonderacionA = useCallback((): number => {
    const analyser = analyserRef.current;
    const ganancias = gananciaARef.current;
    if (!analyser || !ganancias) return 0;

    const espectro = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(espectro);

    let energia = 0;
    let energiaA = 0;
    for (let k = 1; k < espectro.length; k++) {
      const p = Math.pow(10, espectro[k] / 10);   // −Infinity dB ⇒ 0, sin caso especial
      energia += p;
      energiaA += p * ganancias[k];
    }
    return energia > 0 ? 10 * Math.log10(energiaA / energia) : 0;
  }, []);

  // Bucle de medición
  const measureLoop = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Float32Array(analyserRef.current.fftSize);
    analyserRef.current.getFloatTimeDomainData(dataArray);

    /**
     * Los primeros fotogramas no son una medición: son el búfer del analizador antes de que
     * llegue el audio, con TODAS las muestras exactamente a cero. `startMeasuring` llama a
     * este bucle de forma síncrona nada más conectar el analizador, así que las tres o
     * cuatro primeras vueltas leían −140 dB (el suelo de `Math.max(rms, 1e-7)`), que el
     * recorte dejaba en 0, y `setMinDb(prev => Math.min(prev, 0))` clavaba el mínimo de la
     * sesión en 0,0 dB(A) para siempre — en cualquier medición y en cualquier dispositivo.
     * Contaminaba además el LAeq (60,9 en vez de 61,0 con señal constante). Era el hallazgo
     * 278 del Inspector, y también la causa de que su propio spec fallara de forma
     * intermitente según qué fotograma pillase.
     *
     * Un micrófono real nunca devuelve 2048 ceros exactos: siempre hay ruido de fondo,
     * aunque sea de un LSB. Un cero exacto significa «todavía no hay señal» (o el micrófono
     * está silenciado), y de eso no se sigue ningún nivel sonoro: se salta el fotograma sin
     * tocar ninguna estadística.
     */
    if (dataArray.every((muestra) => muestra === 0)) {
      animationRef.current = requestAnimationFrame(measureLoop);
      return;
    }

    // El instrumento entero trabaja en dB(A): es la magnitud que rotula («LAeq») y la que
    // usan los límites que su propio bloque educativo manda comparar.
    const db = Math.max(0, Math.min(130, calculateDb(dataArray) + correccionPonderacionA()));

    setCurrentDb(db);

    /**
     * Y todavía hay unos fotogramas más en los que la ventana de análisis está a MEDIO
     * llenar: el búfer trae ya audio al final y ceros de relleno al principio, así que su
     * RMS es menor que el de la señal. Con un tono constante de 61,0 dB(A) el mínimo salía
     * 39,5 solo por esas primeras ventanas.
     *
     * El reloj de la sesión arranca en el primer fotograma CON audio, y las estadísticas
     * —mínimo, máximo y LAeq— empiezan a acumular cuando la ventana ya está llena. La
     * lectura instantánea sí se muestra desde el principio: lo que no se hace es dejar que
     * un artefacto del arranque se quede grabado en el resumen de la sesión.
     */
    const ahora = performance.now();
    if (inicioRef.current === 0) inicioRef.current = ahora;
    if (fotogramasRef.current < FOTOGRAMAS_ESTABILIZACION) {
      fotogramasRef.current += 1;
      animationRef.current = requestAnimationFrame(measureLoop);
      return;
    }

    setMinDb(prev => Math.min(prev, db));
    setMaxDb(prev => Math.max(prev, db));

    // LAeq — nivel continuo equivalente. Es un promedio ENERGÉTICO, no aritmético:
    // hay que pasar cada lectura a energía (10^(dB/10)), promediar esas energías y
    // volver a dB. La media aritmética de decibelios subestima la exposición real
    // porque la escala es logarítmica: 80 dB y 100 dB no son "90 dB de media" sino
    // 97,03 — el pico domina la energía total, y es justo lo que mide la normativa.
    // El caso que lo deja claro: 99 muestras de 50 dB con un solo pico de 110 dan
    // LAeq 90,00 y media aritmética 50,60 — 39 dB de diferencia sobre los mismos
    // datos. Media incremental para no acumular una suma enorme ni guardar el
    // histórico completo en memoria; verificado idéntica al cálculo directo y
    // estable en 216.000 muestras (1 h a 60 fps).
    const energia = Math.pow(10, db / 10);
    muestrasRef.current += 1;
    energiaMediaRef.current += (energia - energiaMediaRef.current) / muestrasRef.current;
    setLaeq(10 * Math.log10(Math.max(energiaMediaRef.current, 1e-10)));
    setDuracion((performance.now() - inicioRef.current) / 1000);

    animationRef.current = requestAnimationFrame(measureLoop);
  }, [calculateDb, correccionPonderacionA]);

  // Iniciar medición
  const startMeasuring = async () => {
    try {
      setError(null);
      setAvisoRegistro(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      streamRef.current = stream;
      setPermissionState('granted');

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.3;

      source.connect(analyser);
      analyserRef.current = analyser;

      const hzPorBin = audioContext.sampleRate / analyser.fftSize;
      const ganancias = new Float64Array(analyser.frequencyBinCount);
      for (let k = 0; k < ganancias.length; k++) {
        ganancias[k] = Math.pow(10, ponderacionA(k * hzPorBin) / 10);
      }
      gananciaARef.current = ganancias;

      // Resetear estadísticas
      setMinDb(Infinity);
      setMaxDb(0);
      setLaeq(0);
      setDuracion(0);
      energiaMediaRef.current = 0;
      muestrasRef.current = 0;
      // 0 = «aún no ha llegado audio». Lo pone el bucle en su primer fotograma con señal,
      // para que la duración de la sesión no incluya la espera del micrófono.
      inicioRef.current = 0;
      fotogramasRef.current = 0;

      setIsActive(true);
      setHayMedicion(true);
      measureLoop();

    } catch (err) {
      console.error('Error al acceder al micrófono:', err);
      // Si el fallo llega DESPUÉS de conceder el permiso —un navegador sin AudioContext sin
      // prefijo, por ejemplo—, el stream se quedaba abierto: la app decía que no estaba
      // midiendo mientras el indicador de grabación del sistema seguía encendido, y su
      // argumento de venta es que el audio no se graba ni sale del dispositivo.
      stopMeasuring();
      setPermissionState('denied');
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError('Permiso de micrófono denegado. Permite el acceso en la configuración del navegador.');
      } else if (err instanceof Error && err.name === 'NotFoundError') {
        setError('No se encontró ningún micrófono. Conecta uno e intenta de nuevo.');
      } else {
        // Tercer fallo previsible y el único que salía en crudo: sin `navigator.mediaDevices`
        // (HTTP sin cifrar, WebView antiguo) al usuario le llegaba el TypeError del motor de
        // JavaScript. Ahora se le habla de su navegador, como en los otros dos casos.
        setError(
          'Este navegador no permite acceder al micrófono desde la página. ' +
          'Comprueba que la dirección empieza por https:// y usa un navegador actualizado.'
        );
      }
    }
  };

  // Detener medición
  const stopMeasuring = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setIsActive(false);
  };

  /**
   * Detener la medición y dejarla anotada en el registro.
   *
   * Es lo que hace el botón «Detener»; `stopMeasuring` a secas se reserva para los caminos
   * en los que no hay nada que anotar (el desmontaje del componente y el fallo al abrir el
   * micrófono). La duración se toma del reloj de alta resolución y no del estado, que se
   * refresca por fotograma y podría ir uno por detrás en el momento del clic.
   */
  const detenerYRegistrar = () => {
    const segundos = inicioRef.current === 0 ? 0 : (performance.now() - inicioRef.current) / 1000;
    stopMeasuring();

    if (muestrasRef.current === 0 || segundos < SEGUNDOS_MINIMOS_REGISTRO) {
      setAvisoRegistro(
        `Medición demasiado corta para registrarla: hacen falta al menos ${SEGUNDOS_MINIMOS_REGISTRO} segundos.`,
      );
      return;
    }

    const sesion: SesionRegistrada = {
      id: new Date().toISOString(),
      duracionSegundos: segundos,
      laeq,
      minDb: minDb === Infinity ? 0 : minDb,
      maxDb,
      calibracion,
      nota: '',
    };
    // Las más recientes arriba; el tope descarta por la cola, que es la parte vieja
    guardarSesiones([sesion, ...sesiones].slice(0, MAX_SESIONES));
    setAvisoRegistro('Medición guardada en el registro de este navegador.');
  };

  /** Anotación de una fila: dónde se midió, con qué ventanas, qué se oía. */
  const cambiarNota = (id: string, nota: string) => {
    guardarSesiones(sesiones.map((s) => (s.id === id ? { ...s, nota } : s)));
  };

  const borrarSesion = (id: string) => {
    guardarSesiones(sesiones.filter((s) => s.id !== id));
  };

  const borrarTodo = () => {
    if (!window.confirm('¿Borrar todas las mediciones registradas? No se pueden recuperar.')) return;
    guardarSesiones([]);
  };

  /**
   * Descarga del registro como CSV para Excel o LibreOffice en español: separador de punto y
   * coma (con la coma decimal, el separador de campo NO puede ser la coma) y BOM al frente,
   * sin el cual Excel abre el fichero en su página de códigos local y destroza las tildes.
   */
  const descargarCsv = () => {
    const cabecera = ['Fecha', 'Hora', 'Duración (s)', 'LAeq dB(A)', 'Mínimo dB(A)', 'Máximo dB(A)', 'Calibración (dB)', 'Nota'];
    const filas = sesiones.map((s) => {
      const fecha = new Date(s.id);
      return [
        formatDate(fecha),
        fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        formatNumber(s.duracionSegundos, 0),
        formatNumber(s.laeq, 1),
        formatNumber(s.minDb, 1),
        formatNumber(s.maxDb, 1),
        formatNumber(s.calibracion, 0),
        // Punto y coma y salto de línea dentro de una nota romperían la rejilla del CSV. Al
        // sustituirlos por un espacio se colapsan los blancos: «salón; con la tele» debe salir
        // con un espacio, no con dos.
        s.nota.replace(/[;\r\n]+/g, ' ').replace(/\s+/g, ' ').trim(),
      ];
    });
    const csv = '﻿' + [cabecera, ...filas].map((f) => f.join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `sonometro-registro-${new Date().toISOString().slice(0, 10)}.csv`;
    // Un enlace fuera del documento no dispara la descarga en todos los navegadores, y
    // revocar la URL en el mismo tick del clic corre una carrera con la lectura del blob:
    // se añade, se pulsa, se retira, y la revocación espera al siguiente ciclo del bucle.
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  // Resetear estadísticas (reinicia también la integración del LAeq)
  const resetStats = () => {
    setMinDb(Infinity);
    setMaxDb(0);
    setLaeq(0);
    setDuracion(0);
    energiaMediaRef.current = 0;
    muestrasRef.current = 0;
    inicioRef.current = performance.now();
    fotogramasRef.current = 0;
  };

  const currentLevel = getNoiseLevel(currentDb);

  // Rotación de la aguja: la MISMA función que reparte los sectores de color y coloca los
  // rótulos, para que las tres cosas no puedan volver a decir niveles distintos.
  const needleRotation = anguloDe(currentDb);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>🔊</span>
        <h1 className={styles.title}>Sonómetro</h1>
        <p className={styles.subtitle}>
          Sonómetro y decibelímetro online: mide el nivel de ruido en decibelios ponderados A —dB(A),
          los de la normativa— con tu micrófono.
          Ideal para documentar ruido, verificar ambientes de trabajo o medir contaminación acústica.
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      <main className={styles.mainContent}>
        {/* Panel principal del medidor */}
        <div className={styles.meterPanel}>
          {/* Medidor visual */}
          <div className={styles.meterContainer}>
            <div className={styles.meterBackground}>
              {/* Escala de colores — sectores ANGULARES, la misma escala que gira la aguja */}
              <div className={styles.meterScale} style={{ background: FONDO_ESCALA }} />

              {/* Marcas de escala, cada una en el ángulo que le corresponde */}
              <div className={styles.scaleMarks}>
                {MARCAS_ESCALA.map(mark => (
                  <span key={mark} className={styles.scaleMark} style={posicionDeMarca(mark)}>
                    {mark}
                  </span>
                ))}
              </div>

              {/* Aguja */}
              <div
                className={styles.needle}
                style={{ transform: `rotate(${needleRotation}deg)` }}
              />

              {/* Centro del medidor */}
              <div className={styles.meterCenter} />
            </div>
          </div>

          {/* Lectura digital */}
          <div className={styles.digitalDisplay}>
            <span className={styles.dbValue} style={{ color: currentLevel.color }}>
              {isActive ? formatNumber(currentDb, 1) : '--'}
            </span>
            <span className={styles.dbUnit}>dB(A)</span>
          </div>

          {/* Nivel actual */}
          <div
            className={styles.levelIndicator}
            style={{ background: isActive ? currentLevel.color : 'var(--text-muted)' }}
          >
            <span className={styles.levelIcon} aria-hidden="true">{isActive ? currentLevel.icon : '🎤'}</span>
            <span className={styles.levelLabel}>
              {isActive ? currentLevel.label : 'Esperando...'}
            </span>
          </div>

          {/* Botones de control */}
          <div className={styles.controls}>
            {!isActive ? (
              <button type="button" onClick={startMeasuring} className={styles.btnStart}>
                <span aria-hidden="true">🎤</span> Iniciar medición
              </button>
            ) : (
              <>
                <button type="button" onClick={detenerYRegistrar} className={styles.btnStop}>
                  <span aria-hidden="true">⏹️</span> Detener y guardar
                </button>
                <button type="button" onClick={resetStats} className={styles.btnReset}>
                  <span aria-hidden="true">🔄</span> Resetear
                </button>
              </>
            )}
          </div>

          {/* Error */}
          {/* Es la ÚNICA señal de que no se está midiendo: el botón no cambia, el foco no se
              mueve y la lectura sigue en «--». Sin role="alert" un lector de pantalla no
              anunciaba nada al denegarse el micrófono. */}
          {error && (
            <div className={styles.errorMessage} role="alert">
              <span aria-hidden="true">⚠️</span> {error}
            </div>
          )}

          {/* Mensaje de permiso */}
          {permissionState === 'prompt' && !isActive && !error && (
            <div className={styles.infoMessage}>
              <span aria-hidden="true">💡</span> Se solicitará permiso para acceder al micrófono
            </div>
          )}
        </div>

        {/* Estadísticas — visibles también DESPUÉS de detener: la app pide medir «al menos
            5 minutos seguidos» y compararlos con la ordenanza, y pulsar Detener borraba de
            la pantalla el mínimo, el máximo, el LAeq y la duración justo al terminar la
            sesión. La guía sorteaba el problema pidiendo la captura «mientras está midiendo». */}
        {(isActive || hayMedicion) && (
          <div className={styles.statsPanel}>
            <h2 className={styles.sectionTitle}>
              <span aria-hidden="true">📊</span> Estadísticas de sesión
            </h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>⬇️</span>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>
                    {minDb === Infinity ? '--' : formatNumber(minDb, 1)}
                  </span>
                  <span className={styles.statLabel}>Mínimo (dB(A))</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>⬆️</span>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{formatNumber(maxDb, 1)}</span>
                  <span className={styles.statLabel}>Máximo (dB(A))</span>
                </div>
              </div>
              <div className={`${styles.statCard} ${styles.statCardLaeq}`}>
                <span className={styles.statIcon} aria-hidden="true">📈</span>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{formatNumber(laeq, 1)}</span>
                  <span className={styles.statLabel}>LAeq (dB(A))</span>
                </div>
              </div>
            </div>
            <p className={styles.laeqNota}>
              <strong>LAeq</strong> = nivel continuo equivalente, en dB(A), de los últimos{' '}
              <strong>{formatDuracion(duracion)}</strong>. Es el promedio <em>energético</em>,
              el valor que utilizan las normativas de ruido: pondera los picos como
              realmente pesan, a diferencia de una media aritmética de decibelios. La «A» es la
              ponderación en frecuencia de la IEC 61672, la que exige la normativa: rebaja los
              graves igual que los rebaja el oído (−19,1 dB a 100 Hz) y deja el 1 kHz intacto.
              Para documentar una molestia, mide al menos 5 minutos seguidos.
            </p>
          </div>
        )}

        {/* Registro de mediciones — lo que convierte una lectura instantánea en un diario.
            Es también lo ÚNICO que se imprime: el @media print del módulo esconde todo lo
            demás para que del papel salga un parte y no una página web. */}
        {(sesiones.length > 0 || avisoRegistro) && (
          <div className={styles.registroPanel}>
            {/* Solo en papel: quien lea la hoja no tiene delante ni el título ni la web */}
            <div className={styles.parteCabecera}>
              <h2 className={styles.parteTitulo}>Parte de mediciones de ruido</h2>
              <p className={styles.parteSubtitulo}>
                Emitido el {formatDate(new Date())} · {sesiones.length}{' '}
                {sesiones.length === 1 ? 'medición registrada' : 'mediciones registradas'} ·
                Sonómetro de meskeia.com
              </p>
            </div>

            <h2 className={`${styles.sectionTitle} ${styles.noImprimir}`}>
              <span aria-hidden="true">📒</span> Registro de mediciones
            </h2>

            {avisoRegistro && (
              <p className={`${styles.avisoRegistro} ${styles.noImprimir}`} role="status">
                {avisoRegistro}
              </p>
            )}

            {sesiones.length > 0 && (
              <>
                <p className={`${styles.registroIntro} ${styles.noImprimir}`}>
                  Cada vez que pulsas <strong>Detener y guardar</strong> queda aquí una fila.
                  Anota junto a ella dónde mediste y en qué condiciones: una molestia se
                  documenta con varias sesiones en días y horarios distintos, no con una sola
                  lectura. El registro vive en este navegador y no se envía a ningún sitio.
                </p>

                <div className={styles.tablaScroll}>
                  <table className={styles.tablaRegistro}>
                    <caption className={styles.tablaCaption}>
                      Mediciones guardadas, de la más reciente a la más antigua
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Fecha</th>
                        <th scope="col">Hora</th>
                        <th scope="col">Duración</th>
                        <th scope="col">LAeq dB(A)</th>
                        <th scope="col">Mín.</th>
                        <th scope="col">Máx.</th>
                        <th scope="col">Calib.</th>
                        <th scope="col">Dónde y en qué condiciones</th>
                        <th scope="col" className={styles.noImprimir}>
                          <span className={styles.svo}>Acciones</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sesiones.map((s) => {
                        const momento = new Date(s.id);
                        return (
                          <tr key={s.id}>
                            <td>{formatDate(momento)}</td>
                            <td>
                              {momento.toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td>{formatDuracion(s.duracionSegundos)}</td>
                            <td className={styles.celdaLaeq}>{formatNumber(s.laeq, 1)}</td>
                            <td>{formatNumber(s.minDb, 1)}</td>
                            <td>{formatNumber(s.maxDb, 1)}</td>
                            <td>{formatNumber(s.calibracion, 0)} dB</td>
                            <td>
                              <input
                                type="text"
                                className={styles.notaInput}
                                value={s.nota}
                                onChange={(e) => cambiarNota(s.id, e.target.value)}
                                placeholder="Ej: dormitorio, ventana cerrada"
                                maxLength={80}
                                autoComplete="off"
                                aria-label={`Anotación de la medición del ${formatDate(momento)}`}
                              />
                            </td>
                            <td className={styles.noImprimir}>
                              <button
                                type="button"
                                className={styles.btnBorrarFila}
                                onClick={() => borrarSesion(s.id)}
                                aria-label={`Borrar la medición del ${formatDate(momento)}`}
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <p className={styles.parteAviso}>
                  <span aria-hidden="true">⚠️</span> Mediciones orientativas tomadas con el
                  micrófono de un dispositivo de consumo, sin homologar y calibrado a ojo por
                  el propio usuario: el margen frente a un sonómetro de clase 1 o 2 es de ±3 a
                  ±6 dB. <strong>No tienen validez legal ni metrológica</strong> y no sustituyen
                  al informe de un técnico acreditado. Sirven para documentar la persistencia y
                  el horario de una molestia, y para pedir una inspección oficial.
                </p>

                <div className={`${styles.registroAcciones} ${styles.noImprimir}`}>
                  <button
                    type="button"
                    className={styles.btnImprimir}
                    onClick={() => window.print()}
                  >
                    <span aria-hidden="true">🖨️</span> Imprimir el parte
                  </button>
                  <button type="button" className={styles.btnCsv} onClick={descargarCsv}>
                    <span aria-hidden="true">⬇️</span> Descargar CSV
                  </button>
                  <button type="button" className={styles.btnBorrarTodo} onClick={borrarTodo}>
                    <span aria-hidden="true">🗑️</span> Borrar el registro
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Calibración */}
        <div className={styles.calibracionPanel}>
          <h2 className={styles.sectionTitle}>
            <span aria-hidden="true">🎚️</span> Calibración del micrófono
          </h2>
          <p className={styles.calibracionIntro}>
            Los micrófonos de móviles y portátiles no traen una sensibilidad conocida de
            fábrica, así que el valor absoluto depende de tu equipo. Si tienes una
            referencia fiable (un sonómetro, otro dispositivo ya calibrado o una fuente
            de nivel conocido), ajusta aquí el desplazamiento hasta que las lecturas
            coincidan. Se recuerda en este navegador.
          </p>
          <div className={styles.calibracionControles}>
            <button
              type="button"
              className={styles.btnCalib}
              onClick={() => cambiarCalibracion(calibracion - 1)}
              disabled={calibracion <= CALIBRACION_MIN}
              aria-label="Reducir la calibración un decibelio"
            >
              −
            </button>
            <input
              type="range"
              className={styles.calibracionSlider}
              min={CALIBRACION_MIN}
              max={CALIBRACION_MAX}
              step={1}
              value={calibracion}
              onChange={(e) => cambiarCalibracion(Number(e.target.value))}
              id="calibracion"
              aria-describedby="calibracion-valor"
            />
            <button
              type="button"
              className={styles.btnCalib}
              onClick={() => cambiarCalibracion(calibracion + 1)}
              disabled={calibracion >= CALIBRACION_MAX}
              aria-label="Aumentar la calibración un decibelio"
            >
              +
            </button>
          </div>
          <div className={styles.calibracionEstado}>
            <label htmlFor="calibracion" id="calibracion-valor" className={styles.calibracionValor}>
              Desplazamiento: <strong>{formatNumber(calibracion, 0)} dB</strong>
            </label>
            {calibracion !== CALIBRACION_DEFECTO && (
              <button
                type="button"
                className={styles.btnCalibReset}
                onClick={() => cambiarCalibracion(CALIBRACION_DEFECTO)}
              >
                <span aria-hidden="true">↩️</span> Volver al valor por defecto ({CALIBRACION_DEFECTO} dB)
              </button>
            )}
          </div>
          <p className={styles.calibracionAviso}>
            <span aria-hidden="true">💡</span> Truco sin equipo de referencia: una
            habitación en silencio nocturno suele estar entre 25 y 35 dB, y una
            conversación normal a un metro, entre 55 y 65 dB. Si tus lecturas se salen
            mucho de esos rangos, mueve el desplazamiento hasta encajarlas. Sigue siendo
            una estimación, no una medición certificada.
          </p>
        </div>

        {/* Tabla de referencia */}
        <div className={styles.referencePanel}>
          <h2 className={styles.sectionTitle}>
            <span aria-hidden="true">📋</span> Niveles de referencia
          </h2>
          <div className={styles.referenceTable}>
            {NOISE_LEVELS.map((level, index) => (
              <div
                key={index}
                className={`${styles.referenceRow} ${isActive && currentDb >= level.min && currentDb < level.max ? styles.activeRow : ''}`}
              >
                <div className={styles.refLevel}>
                  <span
                    className={styles.refIndicator}
                    style={{ background: level.color }}
                  />
                  <span className={styles.refIcon} aria-hidden="true">{level.icon}</span>
                  <span className={styles.refLabel}>{level.label}</span>
                </div>
                <div className={styles.refRange}>
                  {level.min}-{level.max} dB
                </div>
                <div className={styles.refExamples}>
                  {level.examples}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <DisclaimerCard
        variant="technical"
        severity="low"
        context="sonometro"
        collapsible={true}
      />

      

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Cómo funciona un sonómetro?"
        subtitle="Aprende sobre el ruido, los decibelios y la salud auditiva"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué son los decibelios o decibeles (dB)?</h2>
          <p className={styles.introParagraph}>
            El <strong>decibelio (dB)</strong> es la unidad de medida del nivel de presión sonora.
            En América se usa habitualmente la forma <strong>decibel</strong> (plural{' '}
            <strong>decibeles</strong>) y al aparato que los mide se le llama{' '}
            <strong>decibelímetro</strong>, mientras que en España son más frecuentes
            «decibelio» y «sonómetro»: son las mismas magnitudes y el mismo instrumento.
            Es una escala logarítmica, lo que significa que un aumento de 10 dB representa
            aproximadamente el doble de volumen percibido. Por ejemplo, 70 dB suena el doble
            de fuerte que 60 dB.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">🔢</span> Escala logarítmica</h4>
              <ul>
                <li>0 dB: Umbral de audición</li>
                <li>+10 dB: 10x más intensidad</li>
                <li>+20 dB: 100x más intensidad</li>
                <li>+30 dB: 1.000x más intensidad</li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">👂</span> Salud auditiva</h4>
              <ul>
                <li>&lt;70 dB: Seguro indefinidamente</li>
                <li>85 dB: Máx. 8 horas/día</li>
                <li>100 dB: Máx. 15 minutos/día</li>
                <li>&gt;120 dB: Daño inmediato</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Normativa sobre ruido en España</h2>
          <p className={styles.introParagraph}>
            La <strong>Ley 37/2003 del Ruido</strong> establece límites de contaminación acústica.
            Los ayuntamientos tienen ordenanzas específicas, pero los límites habituales son:
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">🏠</span> Viviendas (interior)</h4>
              <ul>
                <li>Día (8:00-22:00): 35-40 dB</li>
                <li>Noche (22:00-8:00): 30-35 dB</li>
                <li>Zonas residenciales: 55-65 dB ext.</li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">🏢</span> Ambientes laborales</h4>
              <ul>
                <li>Oficinas: 50-55 dB</li>
                <li>Industria: máx. 85 dB (con protección)</li>
                <li>Obligación de EPIs &gt;80 dB</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Referencias internacionales: qué recomienda la OMS</h2>
          <p className={styles.introParagraph}>
            Los límites que obligan son siempre los de la normativa de tu país y, en la mayoría
            de ellos, los de la ordenanza de tu municipio, que es quien regula el ruido de
            vecindad. Como referencia de salud —no legal— estas son las cifras de la
            Organización Mundial de la Salud:
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">🌞</span> Durante el día</h4>
              <ul>
                <li>50 dB en exteriores: molestia moderada</li>
                <li>55 dB en exteriores: molestia seria</li>
                <li>Fuente: <em>Guidelines for Community Noise</em> (OMS, 1999)</li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">🌙</span> Durante la noche</h4>
              <ul>
                <li>40 dB en el exterior de la vivienda: objetivo de salud</li>
                <li>55 dB: efectos adversos documentados</li>
                <li>Fuente: <em>Night Noise Guidelines for Europe</em> (OMS, 2009)</li>
              </ul>
            </div>
          </div>

          <p className={styles.introParagraph}>
            En su revisión de 2018 para la Región Europea, la OMS bajó la recomendación para
            el ruido de tráfico rodado a 53 dB L<sub>den</sub> en el conjunto del día y 45 dB
            L<sub>night</sub> por la noche. Son objetivos de salud pública: para saber qué
            puedes reclamar y ante quién, consulta la ordenanza de tu municipio o el organismo
            de medio ambiente que corresponda en tu país.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>Consejos para medir correctamente</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">✅</span> Buenas prácticas</h4>
              <ul>
                <li>Mantén el móvil a 1-1,5 m de la fuente</li>
                <li>Evita cubrir el micrófono</li>
                <li>Mide durante al menos 30 segundos</li>
                <li>Usa el promedio, no picos aislados</li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">❌</span> Evitar</h4>
              <ul>
                <li>Viento directo sobre el micrófono</li>
                <li>Tocar el móvil durante la medición</li>
                <li>Otras fuentes de ruido cercanas</li>
                <li>Mediciones muy cortas (&lt;10s)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECCIÓN 1: Tabla Comparativa de niveles de ruido */}
        <section className={styles.guideSection}>
          <h2>Tabla comparativa: niveles de ruido y sus efectos</h2>
          <p className={styles.introParagraph}>
            La exposición al ruido afecta la salud de forma acumulativa. Conocer los rangos de decibelios
            y el tiempo de exposición seguro es clave para proteger la audición y actuar ante contaminación acústica.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Rango (dB)</th>
                  <th>Fuente típica</th>
                  <th>Exposición segura</th>
                  <th>Efectos en salud</th>
                  <th>Normativa española</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>0–30 dB</strong></td>
                  <td>Silencio, respiración, estudio nocturno</td>
                  <td>Ilimitada</td>
                  <td>Sin riesgo; favorece el descanso y la concentración</td>
                  <td>Límite interior nocturno recomendado: 30–35 dB</td>
                </tr>
                <tr>
                  <td><strong>30–60 dB</strong></td>
                  <td>Conversación normal, biblioteca, oficina tranquila</td>
                  <td>Ilimitada</td>
                  <td>Sin riesgo auditivo; puede dificultar el sueño cerca del límite superior</td>
                  <td>Límite interior diurno viviendas: 35–40 dB</td>
                </tr>
                <tr>
                  <td><strong>60–85 dB</strong></td>
                  <td>Tráfico urbano, restaurante animado, TV alta</td>
                  <td>Ilimitada (sin daño auditivo), aunque el estrés aumenta</td>
                  <td>Estrés, dificultad de concentración, posible aumento de tensión arterial</td>
                  <td>Zonas residenciales exteriores: 55–65 dB (Ley 37/2003)</td>
                </tr>
                <tr>
                  <td><strong>85–100 dB</strong></td>
                  <td>Maquinaria industrial, concierto, moto</td>
                  <td>Máx. 2 h/día a 100 dB; máx. 8 h/día a 85 dB</td>
                  <td>Daño auditivo progresivo; fatiga, irritabilidad, acúfenos</td>
                  <td>RD 286/2006: obligación de EPIs a partir de 85 dB(A)</td>
                </tr>
                <tr>
                  <td><strong>100–120 dB</strong></td>
                  <td>Taladro, sirena de ambulancia, avión despegando</td>
                  <td>Máx. 15 min/día a 100 dB; ninguna a 120 dB sin protección</td>
                  <td>Umbral del dolor; daño auditivo rápido; riesgo cardiovascular</td>
                  <td>Nivel de acción superior en el trabajo: 85 dB(A); límite exposición: 87 dB(A)</td>
                </tr>
                <tr>
                  <td><strong>&gt;120 dB</strong></td>
                  <td>Petardo, motor de avión a reacción</td>
                  <td>Daño inmediato incluso con exposición brevísima</td>
                  <td>Perforación del tímpano, pérdida auditiva permanente, barotrauma</td>
                  <td>Prohibido sin protección auditiva de alto rendimiento</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECCIÓN 2: Casos de Uso — 4 perfiles */}
        <section className={styles.guideSection}>
          <h2>¿Para qué sirve un sonómetro o decibelímetro? Casos de uso reales</h2>
          <p className={styles.introParagraph}>
            Medir el ruido no es solo cosa de ingenieros. Cualquier persona puede necesitar documentar
            niveles sonoros para reclamar, proteger su salud o simplemente tomar mejores decisiones.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏘️</span>
                <strong>Vecino afectado por local nocturno</strong>
              </div>
              <p className={styles.escenarioExample}>
                Quieres reclamar al ayuntamiento que el bar de abajo supera los límites de ruido nocturno.
                Usas el sonómetro para registrar el nivel en el interior de tu vivienda entre las 22:00 y las 2:00.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: documenta varias noches con capturas de pantalla con fecha y hora.
                El límite interior nocturno en zonas residenciales suele ser 30–35 dB según la ordenanza municipal.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👷</span>
                <strong>Trabajador que evalúa riesgo auditivo</strong>
              </div>
              <p className={styles.escenarioExample}>
                Trabajas en un taller o almacén y quieres saber si necesitas usar protección auditiva.
                Mides el nivel medio durante tu jornada para comprobarlo antes de hablar con tu empresa.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: si el nivel promedio supera los 80 dB(A), el RD 286/2006 obliga al empresario
                a informarte y evaluar el riesgo. Por encima de 85 dB(A), los tapones son obligatorios.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👶</span>
                <strong>Padre o madre que mide el cuarto del bebé</strong>
              </div>
              <p className={styles.escenarioExample}>
                Quieres asegurarte de que la habitación del bebé está por debajo de los 35 dB durante
                las horas de sueño, y verificar si el ruido exterior o el monitor de bebé interfieren.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: la OMS recomienda menos de 30 dB para un sueño saludable infantil.
                Coloca el móvil a 1 metro de la cuna y mide durante 5 minutos sin moverte por la habitación.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎸</span>
                <strong>Músico que controla el volumen en los ensayos</strong>
              </div>
              <p className={styles.escenarioExample}>
                Ensayas con tu banda en un local y quieres mantener el volumen por debajo de 95 dB
                para proteger tu audición a largo plazo sin usar tapones que te impidan escuchar bien.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: a 95 dB el tiempo de exposición seguro es de unos 50 minutos según la NIOSH.
                Toma descansos de 15 minutos cada hora y considera tapones de músico con atenuación plana.
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3: FAQ — 9 preguntas */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre ruido y decibelios</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <strong>¿A partir de cuántos dB es peligroso para el oído?</strong>
              <p>
                La exposición continuada a partir de 85 dB(A) puede provocar daño auditivo progresivo.
                A 100 dB el límite seguro es de unos 15 minutos al día, y por encima de 120 dB el daño
                puede ser inmediato incluso con exposiciones muy breves.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cuál es el límite legal de ruido nocturno en España?</strong>
              <p>
                Depende del municipio, pero la Ley 37/2003 del Ruido fija como referencia 45 dB(A) en
                el exterior de zonas residenciales durante la noche (22:00–7:00) y 30–35 dB en el interior
                de viviendas. Las ordenanzas municipales pueden ser más restrictivas.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cómo medir el ruido de un vecino para reclamar?</strong>
              <p>
                Mide desde el interior de tu vivienda con puertas y ventanas cerradas, en
                sesiones de al menos cinco minutos. Repítelo en <strong>distintos días y
                horarios</strong>: lo que sostiene una reclamación no es un pico aislado sino
                un patrón que se repite. Cada vez que pulses «Detener y guardar», la medición
                queda con su fecha, su hora y su LAeq en el registro de esta página, donde
                puedes anotar dónde mediste y descargarlo o imprimirlo como parte. Para una
                reclamación formal ante el ayuntamiento se recomienda además un informe
                pericial de un técnico acreditado.
              </p>
              <p className={styles.faqTip}>
                Importante: las mediciones de un sonómetro de móvil no tienen validez legal por sí solas,
                pero sirven para orientar la denuncia y solicitar una inspección oficial.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Es fiable un sonómetro de móvil comparado con uno profesional?</strong>
              <p>
                Un sonómetro de móvil tiene un margen de error de ±3 a ±6 dB respecto a un aparato
                de clase 1 o 2 homologado. Es útil para tener una orientación, detectar problemas evidentes
                y documentar tendencias, pero no tiene validez legal ni metrológica para procedimientos oficiales.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué es la escala dB(A)?</strong>
              <p>
                El dB(A) es una medida ponderada que aproxima la sensibilidad del oído humano,
                atenuando las frecuencias muy bajas y muy altas. Es el estándar para medir el ruido
                ambiental, laboral y de tráfico. La mayoría de límites legales en España se expresan en dB(A).
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cuánto tiempo se puede estar expuesto a 85 dB sin sufrir daño?</strong>
              <p>
                Según el RD 286/2006 y los criterios de la NIOSH, el límite es de 8 horas/día a 85 dB(A).
                Por cada 3 dB adicionales, el tiempo máximo se reduce a la mitad: 4 horas a 88 dB,
                2 horas a 91 dB, 1 hora a 94 dB, y así sucesivamente.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué nivel de ruido obliga a usar tapones en el trabajo?</strong>
              <p>
                El Real Decreto 286/2006 establece que a partir de 85 dB(A) de nivel de exposición
                diario o 137 dB(C) de pico, el uso de protección auditiva es obligatorio.
                Entre 80 y 85 dB(A) el empresario debe poner los EPIs a disposición del trabajador,
                que puede usarlos voluntariamente.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cómo afecta el ruido crónico a la salud?</strong>
              <p>
                La exposición crónica al ruido (aunque sea de baja intensidad) se asocia con estrés,
                insomnio, hipertensión, mayor riesgo cardiovascular, deterioro cognitivo y pérdida auditiva
                gradual. La OMS estima que el ruido ambiental es la segunda causa medioambiental de
                problemas de salud en Europa, después de la contaminación del aire.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Es lo mismo un decibelímetro que un sonómetro?</strong>
              <p>
                Sí: es el mismo instrumento con dos nombres. «Decibelímetro» (o medidor de
                decibeles) es la forma habitual en gran parte de América y «sonómetro» la más
                extendida en España. Si buscas un equipo profesional lo encontrarás casi siempre
                como «sonómetro de clase 1» o «clase 2», porque así lo denomina la norma
                internacional IEC 61672 que fija su precisión.
              </p>
            </li>
          </ul>
        </section>

        {/* SECCIÓN 4: Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>Cómo medir correctamente el ruido: guía paso a paso</h2>
          <p className={styles.introParagraph}>
            Tanto si quieres documentar una queja vecinal como evaluar el riesgo acústico en tu puesto
            de trabajo, seguir estos pasos te dará mediciones más fiables y útiles.
          </p>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Prepara el entorno</strong>
                <p>
                  Cierra puertas y ventanas si mides el interior. Asegúrate de que no hay otras fuentes
                  de ruido que no sean las que quieres medir (televisión encendida, extractor de cocina, etc.).
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Coloca el dispositivo correctamente</strong>
                <p>
                  Pon el móvil a 1 metro de altura respecto al suelo y a 1–1,5 metros de la fuente de ruido.
                  No lo cubras con la mano ni lo apoyes en superficies que puedan transmitir vibraciones.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Inicia la medición y espera</strong>
                <p>
                  Pulsa el botón de inicio y espera al menos 30–60 segundos antes de leer el resultado.
                  El promedio (LAeq) es más representativo que el valor pico. Para una queja formal,
                  realiza mediciones de al menos 5–10 minutos.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Toma mediciones en distintos momentos</strong>
                <p>
                  El ruido varía a lo largo del día. Para documentar correctamente, mide en el momento
                  en que el problema es más intenso (noche, hora punta de tráfico, funcionamiento de la maquinaria)
                  y también en horas tranquilas para poder comparar.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Registra el ruido de fondo</strong>
                <p>
                  Mide el nivel de ruido en ausencia de la fuente problemática (ruido de fondo o residual).
                  Esto permite calcular la diferencia real que genera la fuente de molestia, que es lo que
                  valoran las inspecciones municipales.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Documenta con capturas de pantalla</strong>
                <p>
                  Haz capturas de pantalla del sonómetro mientras está midiendo, asegurándote de que
                  se vea la fecha y la hora del dispositivo. Guarda también el nombre del lugar y la
                  distancia a la fuente de ruido en un documento o nota de voz.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>Interpreta el resultado y actúa</strong>
                <p>
                  Compara el valor promedio obtenido con los límites de tu ordenanza municipal
                  o con los valores de referencia laborales. Si supera los límites, considera presentar
                  una denuncia en el ayuntamiento o solicitar una medición oficial a un técnico acreditado.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* SECCIÓN 5: Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>Mejores prácticas para obtener mediciones fiables</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📏</span>
              <div>
                <strong>Mide siempre a 1 metro de la fuente</strong>
                <p>La distancia estándar internacional para comparar niveles sonoros es 1 metro. Cada vez que doblas la distancia, el nivel cae aproximadamente 6 dB.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🕐</span>
              <div>
                <strong>Toma mediciones en distintos momentos del día</strong>
                <p>El ruido del tráfico es muy diferente a las 8:00 que a las 14:00 o las 23:00. Para documentar un problema acústico real, necesitas al menos 3 franjas horarias distintas.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📊</span>
              <div>
                <strong>Usa el LAeq, no el valor pico</strong>
                <p>El nivel equivalente continuo (LAeq) es el promedio energético de la exposición sonora en el tiempo. Es el valor que utilizan las normativas y el que mejor refleja el impacto real en la salud. El panel de estadísticas de esta página lo calcula así —energéticamente, sobre toda la sesión— y muestra junto a él cuánto tiempo llevas midiendo, porque un LAeq sin su intervalo no significa nada.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎙️</span>
              <div>
                <strong>Calibra o verifica el micrófono del móvil</strong>
                <p>Los micrófonos de móvil no están calibrados de fábrica para mediciones acústicas. Si necesitas precisión, compara los resultados con una fuente sonora conocida y corrige la diferencia en el panel «Calibración del micrófono» de esta misma página: el desplazamiento que ajustes se recuerda en tu navegador para las siguientes mediciones.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📸</span>
              <div>
                <strong>Documenta con capturas de pantalla con fecha y hora</strong>
                <p>Las capturas de pantalla son tu única prueba documental. Asegúrate de que el reloj del dispositivo es visible y correcto. Anota la ubicación, distancia y condiciones de la medición.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🌬️</span>
              <div>
                <strong>Protege el micrófono del viento</strong>
                <p>El viento genera turbulencias en el micrófono que elevan artificialmente las lecturas. Si mides en exterior, usa una pantalla antiviento o realiza las mediciones en días calmados sin brisa directa.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 6: Warning Box — errores comunes */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <strong>Errores frecuentes al medir ruido con el móvil</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Tapar el micrófono con el dedo.</strong> El micrófono de los smartphones
                suele estar en el borde inferior o trasero. Comprueba su ubicación exacta antes de medir
                y sujeta el dispositivo por los laterales.
              </li>
              <li>
                <strong>Medir demasiado cerca de la fuente.</strong> A menos de 30 cm de la fuente las
                lecturas se disparan por reflexiones y efectos de campo cercano. La distancia mínima
                recomendada es 1 metro.
              </li>
              <li>
                <strong>Confundir dB con dB(A).</strong> Los decibelios sin ponderar (dB) y los ponderados
                en frecuencia dB(A) pueden diferir varios puntos. La normativa española usa siempre dB(A)
                para ruido ambiental y laboral.
              </li>
              <li>
                <strong>No tener en cuenta el ruido de fondo.</strong> Si el ruido de fondo ya es de 50 dB,
                una fuente que genera 52 dB apenas suma 2 dB al total medido. Sin restar el residual,
                la medición sobreestima el impacto de la fuente molesta.
              </li>
              <li>
                <strong>Usar el resultado del móvil como prueba legal directa.</strong> Las mediciones de apps
                de sonómetro no tienen validez metrológica ni legal por sí solas. Para reclamaciones
                formales se necesita un informe de un técnico acreditado con un equipo homologado (clase 1 o 2).
              </li>
              <li>
                <strong>Leer solo el valor pico y no el promedio.</strong> Un golpe puntual puede disparar
                la lectura a 90 dB un instante, pero si el nivel medio es de 55 dB, el problema es mucho menor
                de lo que parece. Siempre evalúa el promedio (LAeq) para comparar con normativa.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('sonometro')} />

      <ShareCard appName="sonometro" />
      <Footer appName="sonometro" />
    </div>
  );
}
