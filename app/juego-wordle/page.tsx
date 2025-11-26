'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './JuegoWordle.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';

// Palabras de 5 letras en español (sin tildes para simplificar)
const PALABRAS = [
  'ABRIL', 'ACTOR', 'ADIOS', 'AGUAS', 'AIRES', 'ALBUM', 'ALDEA', 'ALGAS',
  'ALMAS', 'ALTAR', 'AMIGO', 'ANEXO', 'ANGEL', 'ANIMO', 'ANTES', 'ANZOL',
  'ARBOL', 'ARMAS', 'AROMA', 'ARROZ', 'ATLAS', 'AVION', 'AYUDA', 'AZOTE',
  'AZUCAR', 'BAILE', 'BARCO', 'BARRO', 'BELLO', 'BICHO', 'BINGO', 'BLUSA',
  'BOCAS', 'BOLSA', 'BONUS', 'BRAZO', 'BRISA', 'BROMA', 'BUENO', 'BURRO',
  'CABLE', 'CACAO', 'CAJAS', 'CALOR', 'CAMAS', 'CAMPO', 'CANAL', 'CARAS',
  'CARNE', 'CARTA', 'CASAS', 'CASOS', 'CAZAR', 'CELOS', 'CERCA', 'CERDO',
  'CEROS', 'CHICA', 'CHILE', 'CHINA', 'CINCO', 'CITAS', 'CLASE', 'CLAVE',
  'CLIMA', 'COBRE', 'COCHE', 'COCOA', 'CODOS', 'COFRE', 'COLAS', 'COLOR',
  'COMER', 'COPAS', 'CORAL', 'CORTO', 'COSTA', 'CREMA', 'CRUEL', 'CUERO',
  'DATOS', 'DEBER', 'DEBUT', 'DEDOS', 'DELTA', 'DEUDA', 'DISCO', 'DOLOR',
  'DONAR', 'DOSIS', 'DRAMA', 'DUCHA', 'DUELO', 'DULCE', 'DURAR', 'EFECTO',
  'ELITE', 'EMAIL', 'ENERO', 'ENVIO', 'EPOCA', 'ERROR', 'EUROS', 'EXITO',
  'FALDA', 'FALLA', 'FALSO', 'FAMAS', 'FANGO', 'FAVOR', 'FECHA', 'FERIA',
  'FIBRA', 'FICHA', 'FICUS', 'FIESTA', 'FINAL', 'FIRMA', 'FLACO', 'FLASH',
  'FLORA', 'FLUJO', 'FOCOS', 'FONDO', 'FORMA', 'FORRO', 'FORTE', 'FRASE',
  'FRENO', 'FRESA', 'FRUTA', 'FUEGO', 'FUERA', 'FUNDA', 'GAFAS', 'GALLO',
  'GANAS', 'GANGA', 'GASES', 'GASTO', 'GATAS', 'GATOS', 'GENIO', 'GENTE',
  'GLOBO', 'GOLFO', 'GOLPE', 'GOMAS', 'GORDO', 'GORRO', 'GOTAS', 'GRADO',
  'GRANO', 'GRAVE', 'GREMIO', 'GRIPE', 'GRISES', 'GRUPO', 'GUAPO', 'GUIAS',
  'HABER', 'HABLA', 'HACER', 'HACIA', 'HALLAR', 'HASTA', 'HIELO', 'HIERRO',
  'HOGAR', 'HOJAS', 'HONGO', 'HONOR', 'HORAS', 'HOTEL', 'HUECO', 'HUESO',
  'HUEVO', 'HUMOR', 'IDEAL', 'IDEAS', 'IGUAL', 'INDIO', 'ISLAS', 'JABON',
  'JAMON', 'JARRA', 'JEFES', 'JESUS', 'JOKER', 'JOVEN', 'JOYAS', 'JUEGO',
  'JUEVES', 'JUGAR', 'JUGOS', 'JULIO', 'JUNIO', 'JUNTO', 'JURAR', 'LABOR',
  'LADOS', 'LAGO', 'LAPIZ', 'LARGO', 'LASER', 'LATIN', 'LATIR', 'LAVAR',
  'LAZOS', 'LECHE', 'LEER', 'LEGAL', 'LEJOS', 'LEMAS', 'LENTO', 'LETRA',
  'LEYES', 'LIBRE', 'LICOR', 'LIMON', 'LINEA', 'LISTA', 'LITRO', 'LLAMA',
  'LLAVE', 'LLENO', 'LLUVIA', 'LOCAL', 'LOCOS', 'LOGRO', 'LOTES', 'LUCES',
  'LUGAR', 'LUJOS', 'LUNAR', 'LUNES', 'MADRE', 'MAFIA', 'MAGIA', 'MALOS',
  'MANGO', 'MANOS', 'MANTO', 'MAPAS', 'MARCA', 'MARCO', 'MAREA', 'MARES',
  'MARZO', 'MASAS', 'MAYOR', 'MEDIA', 'MEDIO', 'MEJOR', 'MELON', 'MENOS',
  'MENTE', 'MENUS', 'MESAS', 'METAL', 'METRO', 'MEZCLA', 'MICRO', 'MIEDO',
  'MINAS', 'MISION', 'MISMO', 'MITOS', 'MODA', 'MODELO', 'MOLER', 'MONOS',
  'MONTE', 'MORAL', 'MORRO', 'MOTOS', 'MOTOR', 'MOVIL', 'MUCHO', 'MUELA',
  'MUNDO', 'MUSAS', 'MUSEO', 'NACER', 'NACIO', 'NADAR', 'NADIE', 'NARIZ',
  'NAVES', 'NEGRO', 'NENES', 'NIEVE', 'NIVEL', 'NOBLE', 'NOCHE', 'NOTAS',
  'NOVIO', 'NUBES', 'NUEVA', 'NUEVO', 'NUEVE', 'NUNCA', 'OBRAS', 'OCASO',
  'OCIOS', 'ODIAR', 'OESTE', 'OJALA', 'OLIVO', 'ONDAS', 'OPERA', 'ORDEN',
  'OTROS', 'PADRE', 'PAGAR', 'PAGOS', 'PALAS', 'PALCO', 'PANES', 'PAPEL',
  'PARDO', 'PARES', 'PARTE', 'PASAR', 'PASTA', 'PATAS', 'PATIO', 'PAUSA',
  'PECHO', 'PELOS', 'PENAS', 'PERRO', 'PESAS', 'PESOS', 'PIANO', 'PICAR',
  'PICOS', 'PIEZA', 'PILAS', 'PINOS', 'PINTA', 'PISAR', 'PISOS', 'PISTA',
  'PIZZA', 'PLANO', 'PLATA', 'PLATO', 'PLAYA', 'PLAZA', 'PLENO', 'PLOMO',
  'PLUMA', 'POBRES', 'PODER', 'POEMA', 'POETA', 'POKER', 'POLAR', 'POLLO',
  'POLVO', 'PONER', 'PORTA', 'POSAR', 'PRADO', 'PRECIO', 'PRESA', 'PRIMA',
  'PRIMO', 'PRISA', 'PROBAR', 'PROPIA', 'PRUEBA', 'PUNTO', 'QUESO', 'QUIEN',
  'QUINTO', 'RADAR', 'RADIO', 'RAROS', 'RATON', 'RAYAS', 'RAYOS', 'RAZAS',
  'RAZON', 'REAL', 'REDES', 'REINA', 'REJAS', 'RELOJ', 'REMOS', 'RENTA',
  'RESTO', 'RETOS', 'REYES', 'REZAR', 'RICOS', 'RIEGO', 'RIESGO', 'RITMO',
  'RIVAL', 'ROCAS', 'RODAR', 'RODEO', 'ROJAS', 'ROJOS', 'ROLES', 'ROLLO',
  'ROMAN', 'RONDA', 'ROPAS', 'ROSAS', 'RUBIO', 'RUEDA', 'RUIDO', 'RUMBO',
  'RURAL', 'RUSAS', 'RUTAS', 'SABER', 'SABOR', 'SACAR', 'SALIR', 'SALON',
  'SALSA', 'SALTO', 'SALUD', 'SANTO', 'SAUCE', 'SAUNA', 'SAVIA', 'SECAS',
  'SECOS', 'SEDES', 'SELVA', 'SEÑAL', 'SEÑOR', 'SERIA', 'SERIO', 'SEXTO',
  'SILBA', 'SILLA', 'SOBRE', 'SOCIA', 'SOCIO', 'SOLAR', 'SOLOS', 'SOLTAR',
  'SONAR', 'SOÑAR', 'SOPAS', 'SORDO', 'SUAVE', 'SUBIR', 'SUCIO', 'SUDAR',
  'SUELO', 'SUEÑO', 'SUITE', 'SUIZA', 'SUMA', 'SUPER', 'SURCO', 'SURGIR',
  'TABLA', 'TACOS', 'TALLA', 'TANGO', 'TAPAR', 'TAPAS', 'TARDA', 'TARDE',
  'TAREA', 'TARRO', 'TAXIS', 'TAZAS', 'TECHO', 'TELAS', 'TEMAS', 'TEMOR',
  'TEMPO', 'TENIS', 'TENOR', 'TENSA', 'TENSO', 'TERCO', 'TEXTO', 'TIBIA',
  'TIBIO', 'TIGRE', 'TINTA', 'TIPOS', 'TIRAR', 'TIROS', 'TITAN', 'TOCAR',
  'TODOS', 'TOMAR', 'TONAL', 'TONOS', 'TONTO', 'TOPES', 'TOQUE', 'TOROS',
  'TORRE', 'TORTA', 'TOTAL', 'TOXICO', 'TRAER', 'TRAJE', 'TRAMO', 'TRECE',
  'TREN', 'TRIGO', 'TRIPA', 'TRISTE', 'TROZO', 'TRUCO', 'TUMBA', 'TUNEL',
  'TURCO', 'TURNO', 'ULTRA', 'UNION', 'UNIR', 'USAR', 'USTED', 'UVAS',
  'VACAS', 'VACIO', 'VALER', 'VALOR', 'VAPOR', 'VARIA', 'VARIO', 'VARON',
  'VASOS', 'VECINO', 'VELAS', 'VENAS', 'VENTA', 'VERDE', 'VERSO', 'VIDEO',
  'VIEJO', 'VINO', 'VIRAL', 'VIRUS', 'VISTA', 'VITAL', 'VIUDA', 'VIVIR',
  'VOLAR', 'VOTAR', 'VOTOS', 'VUELO', 'YATES', 'YOGUR', 'ZANJA', 'ZARPA',
  'ZONAS', 'ZORRO',
].filter(p => p.length === 5);

type Estado = 'correcto' | 'presente' | 'ausente' | 'vacio';

interface Letra {
  char: string;
  estado: Estado;
}

// Obtener palabra del día (basada en fecha)
const getPalabraDelDia = (): string => {
  const inicio = new Date('2024-01-01').getTime();
  const hoy = new Date().setHours(0, 0, 0, 0);
  const dias = Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24));
  return PALABRAS[dias % PALABRAS.length];
};

// Evaluar intento
const evaluarIntento = (intento: string, palabra: string): Letra[] => {
  const resultado: Letra[] = [];
  const palabraArray = palabra.split('');
  const intentoArray = intento.split('');
  const usadas = new Array(5).fill(false);

  // Primero marcar correctos
  for (let i = 0; i < 5; i++) {
    if (intentoArray[i] === palabraArray[i]) {
      resultado[i] = { char: intentoArray[i], estado: 'correcto' };
      usadas[i] = true;
    }
  }

  // Luego marcar presentes y ausentes
  for (let i = 0; i < 5; i++) {
    if (resultado[i]) continue;

    const char = intentoArray[i];
    let encontrado = false;

    for (let j = 0; j < 5; j++) {
      if (!usadas[j] && palabraArray[j] === char) {
        resultado[i] = { char, estado: 'presente' };
        usadas[j] = true;
        encontrado = true;
        break;
      }
    }

    if (!encontrado) {
      resultado[i] = { char, estado: 'ausente' };
    }
  }

  return resultado;
};

const TECLADO = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];

export default function JuegoWordlePage() {
  const [palabra] = useState(getPalabraDelDia);
  const [intentos, setIntentos] = useState<Letra[][]>([]);
  const [intentoActual, setIntentoActual] = useState('');
  const [ganado, setGanado] = useState(false);
  const [perdido, setPerdido] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [estadoTeclas, setEstadoTeclas] = useState<Record<string, Estado>>({});

  // Cargar estado guardado
  useEffect(() => {
    const hoy = new Date().toDateString();
    const saved = localStorage.getItem('wordle-state');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.fecha === hoy) {
        setIntentos(data.intentos);
        setGanado(data.ganado);
        setPerdido(data.perdido);
        setEstadoTeclas(data.estadoTeclas || {});
      }
    }
  }, []);

  // Guardar estado
  useEffect(() => {
    const hoy = new Date().toDateString();
    localStorage.setItem('wordle-state', JSON.stringify({
      fecha: hoy,
      intentos,
      ganado,
      perdido,
      estadoTeclas,
    }));
  }, [intentos, ganado, perdido, estadoTeclas]);

  // Mostrar mensaje temporal
  const mostrarMensaje = useCallback((msg: string) => {
    setMensaje(msg);
    setTimeout(() => setMensaje(''), 2000);
  }, []);

  // Enviar intento
  const enviarIntento = useCallback(() => {
    if (intentoActual.length !== 5) {
      mostrarMensaje('La palabra debe tener 5 letras');
      return;
    }

    const resultado = evaluarIntento(intentoActual, palabra);
    const nuevosIntentos = [...intentos, resultado];
    setIntentos(nuevosIntentos);

    // Actualizar estado de teclas
    const nuevoEstado = { ...estadoTeclas };
    resultado.forEach(({ char, estado }) => {
      const estadoActual = nuevoEstado[char];
      if (estado === 'correcto' || !estadoActual) {
        nuevoEstado[char] = estado;
      } else if (estado === 'presente' && estadoActual !== 'correcto') {
        nuevoEstado[char] = estado;
      }
    });
    setEstadoTeclas(nuevoEstado);

    if (intentoActual === palabra) {
      setGanado(true);
      mostrarMensaje('🎉 ¡Excelente!');
    } else if (nuevosIntentos.length >= 6) {
      setPerdido(true);
      mostrarMensaje(`La palabra era: ${palabra}`);
    }

    setIntentoActual('');
  }, [intentoActual, palabra, intentos, estadoTeclas, mostrarMensaje]);

  // Manejar tecla
  const handleTecla = useCallback((tecla: string) => {
    if (ganado || perdido) return;

    if (tecla === 'ENTER') {
      enviarIntento();
    } else if (tecla === '⌫' || tecla === 'BACKSPACE') {
      setIntentoActual(prev => prev.slice(0, -1));
    } else if (tecla.length === 1 && /[A-ZÑ]/.test(tecla) && intentoActual.length < 5) {
      setIntentoActual(prev => prev + tecla);
    }
  }, [ganado, perdido, enviarIntento, intentoActual]);

  // Teclado físico
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-ZÑ]$/.test(key)) {
        e.preventDefault();
        handleTecla(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTecla]);

  // Renderizar tablero
  const renderTablero = () => {
    const filas = [];
    for (let i = 0; i < 6; i++) {
      const celdas = [];
      for (let j = 0; j < 5; j++) {
        let contenido = '';
        let estado: Estado = 'vacio';

        if (i < intentos.length) {
          contenido = intentos[i][j].char;
          estado = intentos[i][j].estado;
        } else if (i === intentos.length && j < intentoActual.length) {
          contenido = intentoActual[j];
        }

        celdas.push(
          <div
            key={j}
            className={`${styles.celda} ${styles[estado]} ${contenido ? styles.llena : ''}`}
          >
            {contenido}
          </div>
        );
      }
      filas.push(
        <div key={i} className={styles.fila}>
          {celdas}
        </div>
      );
    }
    return filas;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Wordle</h1>
        <p className={styles.subtitle}>
          Adivina la palabra de 5 letras en 6 intentos
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Mensaje */}
        {mensaje && (
          <div className={styles.mensaje}>{mensaje}</div>
        )}

        {/* Tablero */}
        <div className={styles.tablero}>
          {renderTablero()}
        </div>

        {/* Teclado */}
        <div className={styles.teclado}>
          {TECLADO.map((fila, i) => (
            <div key={i} className={styles.tecladoFila}>
              {fila.map((tecla) => (
                <button
                  key={tecla}
                  onClick={() => handleTecla(tecla)}
                  className={`${styles.tecla} ${tecla.length > 1 ? styles.teclaEspecial : ''} ${estadoTeclas[tecla] ? styles[estadoTeclas[tecla]] : ''}`}
                  disabled={ganado || perdido}
                >
                  {tecla}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Leyenda */}
        <div className={styles.leyenda}>
          <div className={styles.leyendaItem}>
            <span className={`${styles.ejemplo} ${styles.correcto}`}>A</span>
            <span>Letra correcta</span>
          </div>
          <div className={styles.leyendaItem}>
            <span className={`${styles.ejemplo} ${styles.presente}`}>B</span>
            <span>Letra en otra posición</span>
          </div>
          <div className={styles.leyendaItem}>
            <span className={`${styles.ejemplo} ${styles.ausente}`}>C</span>
            <span>Letra no está</span>
          </div>
        </div>
      </div>

      <Footer appName="juego-wordle" />
    </div>
  );
}
