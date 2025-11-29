'use client';

import { useState, useMemo } from 'react';
import styles from './GeneradorAnagramas.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';

// Diccionario español básico (palabras comunes de 2-8 letras)
// En producción se podría cargar un diccionario más extenso
const spanishWords = [
  // 2 letras
  'al', 'de', 'el', 'en', 'es', 'ha', 'ir', 'la', 'le', 'lo', 'me', 'mi', 'no', 'oh', 'os', 'se', 'si', 'su', 'te', 'tu', 'un', 'va', 'ya', 'yo',
  // 3 letras
  'ajo', 'ala', 'ama', 'ano', 'ara', 'asa', 'ave', 'bar', 'boa', 'bus', 'cal', 'can', 'col', 'dar', 'día', 'don', 'dos', 'eco', 'ego', 'eje', 'era', 'eso', 'fin', 'gas', 'gel', 'gol', 'hoy', 'ida', 'ira', 'ley', 'luz', 'mal', 'mar', 'mas', 'mes', 'mil', 'mis', 'muy', 'nao', 'ojo', 'ola', 'ora', 'oro', 'osa', 'oso', 'pan', 'par', 'paz', 'pie', 'por', 'pro', 'pus', 'que', 'red', 'res', 'rey', 'rio', 'rol', 'ron', 'ropa', 'sal', 'sed', 'ser', 'sin', 'sol', 'son', 'sos', 'sur', 'tan', 'tía', 'tío', 'tus', 'una', 'uno', 'uso', 'uva', 'van', 'ver', 'vez', 'vía', 'vid', 'ven', 'voz',
  // 4 letras
  'abre', 'acre', 'acto', 'agua', 'aire', 'algo', 'alma', 'alto', 'amor', 'anís', 'ante', 'arco', 'área', 'asco', 'aseo', 'asno', 'auto', 'azul', 'baja', 'bajo', 'bala', 'base', 'beso', 'bien', 'boca', 'boda', 'bola', 'bono', 'buey', 'cabo', 'cada', 'café', 'caja', 'cama', 'cana', 'caña', 'cara', 'casi', 'caso', 'cava', 'cebo', 'cena', 'cero', 'cine', 'cita', 'codo', 'cola', 'como', 'copa', 'coro', 'cosa', 'cubo', 'dado', 'dama', 'dato', 'dedo', 'dice', 'dios', 'duda', 'echa', 'edad', 'ella', 'ello', 'ellos', 'enea', 'ente', 'eres', 'esta', 'este', 'euro', 'fama', 'fase', 'fea', 'feo', 'fila', 'filo', 'fina', 'fino', 'foco', 'foto', 'gala', 'gana', 'gato', 'gema', 'giro', 'gota', 'gris', 'guía', 'haba', 'hace', 'hada', 'hago', 'hija', 'hijo', 'hilo', 'hora', 'idea', 'idos', 'isla', 'jefe', 'juez', 'joya', 'kilo', 'lado', 'lago', 'lana', 'lata', 'lava', 'leal', 'león', 'leva', 'lima', 'lino', 'liso', 'loba', 'lobo', 'loco', 'lodo', 'lomo', 'lona', 'losa', 'lote', 'luna', 'lujo', 'mago', 'malo', 'mama', 'mano', 'mapa', 'masa', 'mata', 'mayo', 'meco', 'mesa', 'meta', 'miel', 'mina', 'moda', 'modo', 'mono', 'moro', 'mudo', 'mula', 'muro', 'nabo', 'nada', 'nata', 'nave', 'niño', 'niña', 'nido', 'nodo', 'nube', 'obra', 'odio', 'once', 'onda', 'orar', 'orca', 'oso', 'otra', 'otro', 'paga', 'pago', 'pala', 'palo', 'papa', 'paro', 'pasa', 'paso', 'pata', 'pato', 'pavo', 'peca', 'pena', 'pero', 'pesa', 'peso', 'pico', 'piel', 'pino', 'pipa', 'piso', 'poco', 'polo', 'pone', 'poro', 'poza', 'pozo', 'puma', 'puro', 'rabo', 'raja', 'rama', 'rana', 'raro', 'rasa', 'rata', 'raza', 'real', 'reja', 'remo', 'rico', 'rima', 'rito', 'rizo', 'roca', 'rojo', 'roma', 'ropa', 'rosa', 'roto', 'rudo', 'ruta', 'saca', 'saco', 'sala', 'sano', 'sapo', 'seda', 'seis', 'seno', 'seta', 'sido', 'siga', 'silo', 'soga', 'sola', 'solo', 'sopa', 'subo', 'suma', 'sumo', 'taco', 'tajo', 'tapa', 'taza', 'tema', 'teme', 'tena', 'tics', 'tina', 'tino', 'tipo', 'tira', 'tiro', 'toda', 'todo', 'toma', 'tomo', 'tono', 'tope', 'toro', 'tres', 'tubo', 'tuya', 'tuyo', 'unas', 'unos', 'urna', 'vaca', 'vago', 'vale', 'vano', 'vaso', 'vela', 'vena', 'vera', 'veta', 'vida', 'vino', 'viva', 'vivo', 'yema', 'yoga', 'zona',
  // 5 letras
  'abajo', 'abeja', 'abril', 'abrir', 'acaba', 'acero', 'actúa', 'acude', 'adobe', 'afán', 'agrio', 'aguja', 'ahora', 'ajeno', 'aldea', 'algún', 'almas', 'almeja', 'altas', 'altos', 'amaba', 'amada', 'amado', 'amigo', 'ancho', 'andes', 'angel', 'antes', 'apoyo', 'arbol', 'arena', 'armas', 'arroz', 'asado', 'atado', 'atlas', 'atras', 'avena', 'aviso', 'ayuda', 'baila', 'baile', 'bajar', 'bajos', 'banca', 'banco', 'banda', 'bando', 'barba', 'barco', 'barra', 'barro', 'bases', 'basta', 'bella', 'bello', 'bicho', 'blusa', 'bocas', 'bolsa', 'bolso', 'bomba', 'borde', 'brasa', 'brazo', 'breve', 'brisa', 'bruja', 'bruto', 'buena', 'bueno', 'bufón', 'burla', 'burro', 'busca', 'busco', 'cabal', 'cable', 'cabra', 'cacho', 'caída', 'cajas', 'calle', 'calma', 'calor', 'calvo', 'camas', 'campo', 'canal', 'canto', 'cañón', 'capaz', 'carga', 'cargo', 'carne', 'carta', 'casas', 'casos', 'causa', 'cavar', 'cazar', 'ceder', 'celda', 'celos', 'cenas', 'cerca', 'cerdo', 'cerro', 'chica', 'chico', 'chile', 'china', 'chino', 'chivo', 'choza', 'ciega', 'ciego', 'cielo', 'cifra', 'cinco', 'cinta', 'circo', 'clara', 'claro', 'clase', 'clave', 'clavo', 'clima', 'cloro', 'cobra', 'cobre', 'cocer', 'coche', 'cocoa', 'cocos', 'colas', 'color', 'comer', 'comía', 'común', 'conde', 'conga', 'copia', 'coral', 'corre', 'corta', 'corte', 'corto', 'cosas', 'costa', 'crece', 'creen', 'crema', 'cría', 'cruce', 'cruda', 'crudo', 'cruel', 'cuadro', 'cuajo', 'cuál', 'cualquier', 'cubos', 'cubre', 'cuero', 'cueva', 'cuida', 'culpa', 'cumbre', 'cumplo', 'cuota', 'curas', 'curso', 'curva', 'damas', 'danza', 'datos', 'deber', 'decir', 'dedos', 'dejar', 'demos', 'denso', 'desde', 'deseo', 'dicho', 'diego', 'diente', 'dieta', 'digno', 'disco', 'dolor', 'donde', 'dorar', 'dosis', 'droga', 'ducha', 'dudas', 'dulce', 'duque', 'duras', 'duro', 'echar', 'echan', 'ellas', 'ellos', 'emite', 'enano', 'enero', 'enojo', 'entra', 'entre', 'envía', 'época', 'error', 'escala', 'esas', 'esos', 'español', 'espía', 'estar', 'estas', 'estos', 'etapa', 'evita', 'exacta', 'éxito', 'fácil', 'falda', 'falla', 'falsa', 'falso', 'falta', 'famas', 'fauna', 'favor', 'fecha', 'feliz', 'feria', 'fibra', 'fideo', 'fiesta', 'fiera', 'fiero', 'fijas', 'fijos', 'filas', 'finca', 'firma', 'firme', 'flaco', 'flama', 'flauta', 'flecha', 'floja', 'flojo', 'flora', 'flujo', 'fonda', 'fondo', 'forma', 'forro', 'fotos', 'frase', 'fresa', 'fresco', 'frío', 'fruta', 'fuego', 'fuera', 'fuerte', 'fuerza', 'fumar', 'funda', 'fusil', 'gafas', 'gallo', 'gamas', 'ganas', 'ganso', 'garza', 'gasto', 'gatos', 'gemir', 'genio', 'gente', 'gesto', 'globo', 'golfo', 'golpe', 'gomas', 'gorda', 'gordo', 'gorra', 'gorro', 'gotas', 'gozar', 'gramo', 'grano', 'grasa', 'grave', 'gripe', 'grita', 'grito', 'gruesa', 'grueso', 'grupo', 'guapo', 'gusto', 'había', 'habla', 'hacer', 'hacia', 'hacha', 'hadas', 'halcón', 'hambre', 'harto', 'hasta', 'hecho', 'hielo', 'hierba', 'hierro', 'hijas', 'hijos', 'hilos', 'hogar', 'hojas', 'holla', 'hombre', 'honor', 'horas', 'horno', 'hotel', 'hueco', 'hueso', 'huevo', 'huida', 'huir', 'humor', 'ideal', 'ideas', 'igual', 'imagen', 'imita', 'india', 'indio', 'infiel', 'inútil', 'invita', 'islas', 'jamás', 'jamón', 'jardín', 'jaula', 'jefes', 'joven', 'joyas', 'juega', 'juego', 'jueza', 'jugada', 'jugar', 'jugo', 'juicio', 'julio', 'junio', 'junta', 'junto', 'jurado', 'jurar', 'justo', 'labio', 'labor', 'ladra', 'ladrón', 'lagos', 'lámina', 'lanza', 'lapso', 'larga', 'largo', 'latas', 'latir', 'lavar', 'lazos', 'leche', 'lecho', 'legal', 'lejos', 'lento', 'leña', 'letra', 'libre', 'libro', 'líder', 'lidia', 'ligar', 'ligero', 'lima', 'limón', 'linea', 'lindo', 'lista', 'listo', 'litro', 'llama', 'llano', 'llanta', 'llave', 'llega', 'llena', 'lleno', 'lleva', 'llorar', 'llueve', 'lluvia', 'lobos', 'local', 'locos', 'lodos', 'logra', 'logro', 'lomas', 'lotes', 'lucha', 'lucir', 'lugar', 'lujos', 'lunar', 'lunes', 'macho', 'madre', 'magia', 'magos', 'maíz', 'manda', 'mando', 'manga', 'mango', 'manía', 'manos', 'manta', 'mañana', 'mapa', 'marca', 'marco', 'marea', 'mares', 'marte', 'marzo', 'masas', 'matar', 'mayor', 'media', 'medio', 'mejor', 'menos', 'menta', 'mente', 'menú', 'meras', 'meros', 'mesas', 'meses', 'metas', 'meter', 'metro', 'miedo', 'minas', 'misas', 'misma', 'mismo', 'mitos', 'modal', 'modas', 'molde', 'moler', 'molino', 'momia', 'monos', 'monte', 'moños', 'moral', 'moras', 'morir', 'mortal', 'mosca', 'motor', 'mover', 'móvil', 'muchas', 'mucho', 'muela', 'muere', 'mujer', 'mulas', 'mundo', 'muñeca', 'mural', 'muros', 'música', 'mutuo', 'nacer', 'nació', 'nadar', 'nadie', 'naipe', 'nalga', 'naranja', 'nariz', 'natas', 'naves', 'negro', 'nenes', 'nidos', 'nieta', 'nieto', 'nieva', 'niñas', 'niñez', 'niños', 'nivel', 'noble', 'noche', 'nombra', 'norma', 'norte', 'notas', 'novia', 'novio', 'nubes', 'nubla', 'nuera', 'nueva', 'nuevo', 'nunca', 'nutrir', 'obras', 'obvio', 'ocaso', 'océano', 'odiar', 'odios', 'oeste', 'oferta', 'oídos', 'ojalá', 'ondas', 'opción', 'opera', 'optar', 'oreja', 'orden', 'órgano', 'orilla', 'orina', 'otorga', 'otras', 'otros', 'pacer', 'padre', 'pagas', 'pagos', 'país', 'pajar', 'pájaro', 'palas', 'palos', 'palpa', 'panda', 'panel', 'panes', 'pantera', 'papas', 'papel', 'pared', 'pares', 'parte', 'parto', 'pasar', 'pasea', 'paseo', 'pasos', 'pasta', 'patas', 'patio', 'patos', 'pausa', 'pecho', 'pedal', 'pedir', 'pegar', 'peine', 'pelea', 'pelos', 'penas', 'pensar', 'peña', 'peón', 'peor', 'peras', 'perder', 'perla', 'perro', 'pesar', 'pesca', 'pesos', 'pican', 'picos', 'pieda', 'piedra', 'piensa', 'pierde', 'pies', 'pieza', 'pilas', 'pinos', 'pinta', 'piojo', 'pique', 'pisar', 'pisas', 'pisos', 'pista', 'pizza', 'placa', 'plana', 'plano', 'plata', 'plato', 'playa', 'plaza', 'plazo', 'pleno', 'plomo', 'pluma', 'pobre', 'pocas', 'pocos', 'poder', 'podía', 'poema', 'poeta', 'polar', 'polen', 'pollo', 'polvo', 'poner', 'pongo', 'ponme', 'poros', 'porta', 'posar', 'posee', 'poste', 'potro', 'pozos', 'prado', 'precio', 'prensa', 'presa', 'prima', 'primo', 'prisa', 'probar', 'pronto', 'propia', 'propio', 'prueba', 'puede', 'puerta', 'puerto', 'pulga', 'pulir', 'pulpo', 'pulso', 'punta', 'punto', 'puños', 'puras', 'puros', 'queda', 'queja', 'quema', 'queso', 'quien', 'quinto', 'quita', 'rabia', 'rabos', 'racha', 'radar', 'radio', 'raíz', 'rajas', 'ramas', 'ranas', 'rango', 'raras', 'raros', 'rasca', 'rasgo', 'raspa', 'ratas', 'ratón', 'ratos', 'rayas', 'rayos', 'razas', 'razón', 'reacción', 'reales', 'rebaja', 'recibe', 'recién', 'recta', 'recto', 'redes', 'refrán', 'regla', 'reina', 'reino', 'rejas', 'reloj', 'remas', 'remos', 'renal', 'renta', 'repasa', 'repite', 'repta', 'resta', 'resto', 'retar', 'reúne', 'rezar', 'ricos', 'riega', 'rigor', 'rimas', 'rinde', 'riñón', 'risas', 'ritmo', 'ritos', 'rizos', 'robar', 'robos', 'rocas', 'rodar', 'rodea', 'rodillas', 'rogar', 'rojas', 'rojos', 'rollos', 'rompe', 'ropas', 'rosas', 'rosca', 'rotar', 'rotos', 'rubio', 'rueda', 'ruega', 'ruido', 'ruina', 'rumbo', 'rumor', 'rural', 'rusas', 'rusos', 'rutas', 'saber', 'sabia', 'sabio', 'sabor', 'sacar', 'sacos', 'sagrado', 'salas', 'salgo', 'salir', 'salón', 'salsa', 'salta', 'salto', 'salud', 'salva', 'salvo', 'sanas', 'sanos', 'santa', 'santo', 'sapos', 'secas', 'secos', 'sedas', 'según', 'selva', 'señal', 'señas', 'señor', 'separa', 'serie', 'serlo', 'setas', 'sido', 'siega', 'siete', 'siglo', 'signo', 'sigue', 'silla', 'sirve', 'sitio', 'sobra', 'sobre', 'socia', 'socio', 'sofá', 'sogas', 'solas', 'solos', 'soltar', 'sombra', 'somos', 'sonar', 'sonido', 'sopas', 'sopla', 'soplo', 'sorda', 'sordo', 'sorna', 'suave', 'subir', 'sucio', 'sudar', 'sudor', 'suegra', 'suegro', 'suela', 'suelo', 'sueña', 'sueño', 'suero', 'suerte', 'suma', 'sumar', 'sumo', 'super', 'surco', 'surge', 'susto', 'suyas', 'suyos', 'tabaco', 'tabla', 'tacos', 'tales', 'talla', 'tallo', 'talón', 'tamal', 'tango', 'tanta', 'tanto', 'tapas', 'tapia', 'tapón', 'tarde', 'tarea', 'tazas', 'techo', 'tejado', 'tejer', 'telas', 'tema', 'temas', 'temer', 'temor', 'templo', 'tener', 'tengo', 'tenía', 'tenis', 'tenso', 'teoría', 'tercer', 'tercera', 'tercio', 'termina', 'terna', 'termo', 'tesoro', 'texto', 'tibio', 'tiempo', 'tienda', 'tiene', 'tierra', 'tigre', 'tinas', 'tinto', 'tipos', 'tirar', 'tiras', 'tiros', 'título', 'tocan', 'todas', 'todos', 'tomar', 'tomas', 'tomos', 'tonos', 'tonta', 'tonto', 'topes', 'toque', 'torcida', 'torneo', 'torno', 'toros', 'torre', 'torta', 'total', 'tóxico', 'traba', 'traer', 'traga', 'trago', 'traje', 'trama', 'tramo', 'trampa', 'trata', 'trato', 'traza', 'trazo', 'trece', 'trenza', 'trepar', 'tribu', 'trigo', 'tripa', 'triste', 'trono', 'tropa', 'trova', 'trozo', 'truco', 'trueno', 'tubo', 'tubos', 'tumba', 'tumor', 'túnel', 'turba', 'turno', 'tuyas', 'tuyos', 'unida', 'unido', 'unión', 'único', 'unir', 'uno', 'unos', 'urbes', 'urnas', 'usado', 'usar', 'usted', 'útil', 'uvas', 'vacas', 'vacía', 'vacío', 'vagos', 'valer', 'valga', 'valor', 'valsa', 'vamos', 'vapor', 'varas', 'varia', 'vario', 'varón', 'vasos', 'vasto', 'veces', 'vecino', 'velas', 'vello', 'venas', 'vence', 'venda', 'vendo', 'venga', 'vengo', 'venir', 'venta', 'venus', 'vera', 'verano', 'verde', 'verlo', 'verso', 'verte', 'vestir', 'viaje', 'vidas', 'video', 'vieja', 'viejo', 'viene', 'vigor', 'vimos', 'vinos', 'viola', 'virtud', 'virus', 'visa', 'visión', 'vista', 'visto', 'viuda', 'viudo', 'vivan', 'vivas', 'viven', 'vives', 'vivir', 'vivos', 'vocal', 'voces', 'volar', 'volcán', 'votar', 'votos', 'vuelo', 'vuelta', 'yegua', 'yemas', 'yerno', 'zanja', 'zonal', 'zonas', 'zorra', 'zorro',
  // 6+ letras comunes
  'abuela', 'abuelo', 'acabar', 'aceite', 'acerca', 'acercar', 'activo', 'actual', 'además', 'adentro', 'afecto', 'afuera', 'agosto', 'agrega', 'ahorro', 'ajuste', 'alarma', 'alcance', 'alegre', 'alerta', 'alguno', 'aliado', 'alimento', 'altura', 'amable', 'amante', 'amistad', 'amplio', 'animal', 'anoche', 'antiguo', 'anuncio', 'apenas', 'aplicar', 'aprender', 'aquel', 'aquella', 'aquello', 'arriba', 'asegurar', 'asiento', 'asunto', 'ataque', 'atender', 'atrás', 'aumentar', 'aunque', 'avance', 'barrio', 'bastante', 'blanco', 'bonito', 'brazo', 'brillar', 'buscar', 'caballo', 'cabeza', 'cadena', 'caer', 'calidad', 'caliente', 'cambia', 'cambiar', 'cambio', 'caminar', 'camino', 'campaña', 'canción', 'capital', 'captar', 'carrera', 'centavo', 'centro', 'cercano', 'cerrar', 'cierto', 'cliente', 'código', 'colegio', 'colocar', 'comenzar', 'comida', 'compañía', 'comprar', 'comprender', 'común', 'concierto', 'conducir', 'conocer', 'conseguir', 'consejo', 'construir', 'contar', 'contento', 'contra', 'control', 'convertir', 'corazón', 'correcto', 'correr', 'cortar', 'costumbre', 'crecer', 'creer', 'cuadro', 'cuenta', 'cuerpo', 'cuidar', 'cultura', 'cumplir', 'dar', 'debate', 'deber', 'decir', 'dejar', 'delante', 'demás', 'dentro', 'derecha', 'derecho', 'desde', 'desear', 'deseo', 'después', 'detalle', 'detener', 'día', 'difícil', 'dinero', 'directo', 'director', 'dirigir', 'diseño', 'distrito', 'doble', 'doctor', 'domingo', 'dormir', 'durante', 'economía', 'edificio', 'educar', 'efecto', 'ejemplo', 'ejercicio', 'elegir', 'elemento', 'empezar', 'empleo', 'empresa', 'encontrar', 'energía', 'enfermo', 'enorme', 'enseñar', 'entender', 'entonces', 'entrada', 'equipo', 'escalera', 'escapar', 'escribir', 'escuela', 'esfuerzo', 'espacio', 'especial', 'esperar', 'espíritu', 'estado', 'estilo', 'estrella', 'estudio', 'eterno', 'evento', 'evitar', 'exacto', 'exigir', 'existir', 'éxito', 'experiencia', 'explicar', 'expresar', 'familia', 'famoso', 'feliz', 'femenino', 'figura', 'fijar', 'final', 'firmar', 'física', 'fondo', 'formar', 'fortuna', 'francés', 'frente', 'fresco', 'frontera', 'fuerte', 'función', 'futuro', 'ganar', 'general', 'gente', 'gobierno', 'grande', 'gracias', 'grado', 'guerra', 'gustar', 'haber', 'hablar', 'hacer', 'hacia', 'hasta', 'hermano', 'hermana', 'hermoso', 'historia', 'hombre', 'hospital', 'humano', 'iglesia', 'imagen', 'imaginar', 'importante', 'incluir', 'indicar', 'industria', 'información', 'inglés', 'inicio', 'inmediato', 'interior', 'internacional', 'internet', 'invitar', 'izquierda', 'jardín', 'joven', 'juego', 'jueves', 'jugar', 'junto', 'justo', 'lanzar', 'largo', 'lejos', 'lengua', 'lento', 'letra', 'levantar', 'libre', 'libro', 'ligero', 'limpio', 'línea', 'lista', 'llamar', 'llegar', 'llenar', 'llevar', 'llover', 'local', 'lograr', 'luchar', 'lugar', 'lunes', 'madre', 'maestro', 'mañana', 'manera', 'mantener', 'máquina', 'marcar', 'marido', 'martes', 'materia', 'mayor', 'medicina', 'medida', 'medio', 'mejor', 'memoria', 'menor', 'menos', 'mensaje', 'mente', 'mercado', 'mes', 'método', 'miembro', 'mientras', 'militar', 'millón', 'ministro', 'minuto', 'mirar', 'mismo', 'modelo', 'moderno', 'momento', 'moneda', 'montaña', 'morir', 'mostrar', 'motivo', 'mover', 'mucho', 'muerte', 'mujer', 'mundo', 'música', 'nacional', 'natural', 'necesario', 'necesitar', 'negocio', 'negro', 'ninguno', 'niño', 'nivel', 'noche', 'nombre', 'normal', 'norte', 'noticia', 'noviembre', 'nuevo', 'número', 'nunca', 'objetivo', 'objeto', 'obligar', 'obtener', 'octubre', 'ocupar', 'ocurrir', 'oficial', 'ofrecer', 'opinión', 'oportunidad', 'orden', 'organizar', 'origen', 'oscuro', 'padre', 'pagar', 'página', 'país', 'palabra', 'papel', 'parecer', 'pareja', 'parte', 'partido', 'partir', 'pasado', 'pasar', 'paso', 'paz', 'película', 'peligro', 'pensar', 'pequeño', 'perder', 'perfecto', 'periódico', 'permitir', 'pero', 'perro', 'persona', 'peso', 'piedra', 'pierna', 'pieza', 'planta', 'plata', 'plaza', 'pleno', 'población', 'pobre', 'poco', 'poder', 'policía', 'política', 'político', 'poner', 'popular', 'porque', 'posible', 'posición', 'positivo', 'precio', 'preferir', 'pregunta', 'preguntar', 'preparar', 'presencia', 'presentar', 'presente', 'presidente', 'presión', 'primero', 'principal', 'principio', 'privado', 'problema', 'proceso', 'producir', 'producto', 'profesor', 'programa', 'prometer', 'pronto', 'propio', 'proponer', 'proteger', 'proyecto', 'prueba', 'público', 'pueblo', 'puerta', 'puesto', 'punto', 'quedar', 'querer', 'quien', 'quitar', 'rápido', 'razón', 'real', 'realidad', 'realizar', 'realmente', 'recibir', 'reconocer', 'recordar', 'recorrer', 'recurso', 'reducir', 'referir', 'régimen', 'región', 'regresar', 'relación', 'religión', 'repetir', 'representar', 'resolver', 'respecto', 'responder', 'respuesta', 'resto', 'resultado', 'reunir', 'rico', 'riesgo', 'romper', 'ropa', 'saber', 'sacar', 'salir', 'salud', 'sangre', 'secreto', 'sector', 'seguir', 'segundo', 'seguridad', 'seguro', 'semana', 'sentar', 'sentido', 'sentir', 'señalar', 'señor', 'separar', 'serie', 'servicio', 'servir', 'siempre', 'siguiente', 'simple', 'sino', 'sistema', 'sitio', 'situación', 'sobre', 'sociedad', 'soldado', 'solo', 'solución', 'sombra', 'sonar', 'sonreír', 'sostener', 'subir', 'suceder', 'suelo', 'sueño', 'sufrir', 'suponer', 'taller', 'también', 'tampoco', 'tanto', 'tarde', 'tarea', 'técnica', 'técnico', 'teléfono', 'televisión', 'tema', 'temer', 'temprano', 'tender', 'tener', 'teoría', 'tercero', 'terminar', 'término', 'tierra', 'tiempo', 'tienda', 'tipo', 'tirar', 'título', 'tocar', 'todavía', 'todo', 'tomar', 'tono', 'total', 'trabajar', 'trabajo', 'tradición', 'traer', 'tratar', 'través', 'tres', 'triste', 'único', 'unir', 'universidad', 'utilizar', 'vacación', 'valer', 'valor', 'varios', 'vecino', 'vender', 'venir', 'ventana', 'verde', 'verdad', 'verdadero', 'vestir', 'viaje', 'viejo', 'viento', 'viernes', 'violencia', 'visita', 'visitar', 'vista', 'vivir', 'volver', 'votar', 'vuelta', 'ya', 'zona'
];

// Crear Set para búsqueda rápida
const wordSet = new Set(spanishWords.map(w => w.toLowerCase()));

export default function GeneradorAnagramasPage() {
  const [letters, setLetters] = useState('');
  const [minLength, setMinLength] = useState(2);
  const [maxLength, setMaxLength] = useState(10);
  const [mustContain, setMustContain] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Función para verificar si una palabra puede formarse con las letras disponibles
  const canFormWord = (word: string, availableLetters: string): boolean => {
    const letterCount: { [key: string]: number } = {};

    // Contar letras disponibles
    for (const letter of availableLetters.toLowerCase()) {
      letterCount[letter] = (letterCount[letter] || 0) + 1;
    }

    // Verificar cada letra de la palabra
    for (const letter of word.toLowerCase()) {
      if (!letterCount[letter] || letterCount[letter] === 0) {
        return false;
      }
      letterCount[letter]--;
    }

    return true;
  };

  const findAnagrams = () => {
    setIsSearching(true);

    setTimeout(() => {
      const normalizedLetters = letters.toLowerCase().replace(/[^a-záéíóúüñ]/g, '');

      if (normalizedLetters.length < 2) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      const found: string[] = [];
      const mustContainLower = mustContain.toLowerCase();

      for (const word of spanishWords) {
        // Filtrar por longitud
        if (word.length < minLength || word.length > maxLength) continue;

        // Filtrar por letra obligatoria
        if (mustContainLower && !word.includes(mustContainLower)) continue;

        // Verificar si la palabra puede formarse
        if (canFormWord(word, normalizedLetters)) {
          found.push(word);
        }
      }

      // Ordenar por longitud (más largas primero) y luego alfabéticamente
      found.sort((a, b) => {
        if (b.length !== a.length) return b.length - a.length;
        return a.localeCompare(b);
      });

      setResults(found);
      setIsSearching(false);
    }, 100);
  };

  const handleClear = () => {
    setLetters('');
    setMustContain('');
    setResults([]);
  };

  // Agrupar resultados por longitud
  const groupedResults = useMemo(() => {
    const groups: { [key: number]: string[] } = {};
    for (const word of results) {
      const len = word.length;
      if (!groups[len]) groups[len] = [];
      groups[len].push(word);
    }
    return groups;
  }, [results]);

  const examples = [
    { letters: 'amor', label: 'amor' },
    { letters: 'mesa', label: 'mesa' },
    { letters: 'palabra', label: 'palabra' },
    { letters: 'corazon', label: 'corazon' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Generador de Anagramas</h1>
        <p className={styles.subtitle}>
          Encuentra todas las palabras que puedes formar con tus letras
        </p>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.inputSection}>
          <label className={styles.label}>Introduce tus letras:</label>
          <input
            type="text"
            className={styles.input}
            value={letters}
            onChange={(e) => setLetters(e.target.value)}
            placeholder="Ej: amorpls"
            maxLength={15}
          />
          <div className={styles.examples}>
            <span className={styles.exampleLabel}>Probar:</span>
            {examples.map((ex) => (
              <button
                key={ex.letters}
                className={styles.exampleBtn}
                onClick={() => setLetters(ex.letters)}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filtersSection}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Longitud mínima:</label>
            <select
              className={styles.select}
              value={minLength}
              onChange={(e) => setMinLength(Number(e.target.value))}
            >
              {[2, 3, 4, 5, 6, 7].map(n => (
                <option key={n} value={n}>{n} letras</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Longitud máxima:</label>
            <select
              className={styles.select}
              value={maxLength}
              onChange={(e) => setMaxLength(Number(e.target.value))}
            >
              {[4, 5, 6, 7, 8, 9, 10, 12, 15].map(n => (
                <option key={n} value={n}>{n} letras</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Debe contener:</label>
            <input
              type="text"
              className={styles.filterInput}
              value={mustContain}
              onChange={(e) => setMustContain(e.target.value)}
              placeholder="Opcional"
              maxLength={3}
            />
          </div>
        </div>

        <div className={styles.buttonRow}>
          <button
            onClick={findAnagrams}
            className={styles.btnPrimary}
            disabled={letters.length < 2 || isSearching}
          >
            {isSearching ? 'Buscando...' : 'Buscar palabras'}
          </button>
          <button onClick={handleClear} className={styles.btnSecondary}>
            Limpiar
          </button>
        </div>

        {results.length > 0 && (
          <div className={styles.resultsSection}>
            <div className={styles.resultsHeader}>
              <h3>Palabras encontradas: {results.length}</h3>
            </div>

            {Object.keys(groupedResults)
              .sort((a, b) => Number(b) - Number(a))
              .map(len => (
                <div key={len} className={styles.resultGroup}>
                  <h4 className={styles.groupTitle}>
                    {len} letras ({groupedResults[Number(len)].length})
                  </h4>
                  <div className={styles.wordsGrid}>
                    {groupedResults[Number(len)].map(word => (
                      <span key={word} className={styles.wordChip}>
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {results.length === 0 && letters.length >= 2 && !isSearching && (
          <div className={styles.noResults}>
            <p>No se encontraron palabras con esas letras.</p>
            <p className={styles.hint}>Prueba añadiendo más letras o reduciendo los filtros.</p>
          </div>
        )}
      </div>

      <div className={styles.tipsSection}>
        <h2>Consejos para Wordle y Scrabble</h2>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <h3>Para Wordle</h3>
            <ul>
              <li>Usa palabras de 5 letras</li>
              <li>Filtra por letra obligatoria (las verdes)</li>
              <li>Prueba con las vocales más comunes: A, E, O</li>
            </ul>
          </div>
          <div className={styles.tipCard}>
            <h3>Para Scrabble</h3>
            <ul>
              <li>Busca palabras largas para más puntos</li>
              <li>Las letras Q, X, Z valen más puntos</li>
              <li>Memoriza palabras de 2-3 letras</li>
            </ul>
          </div>
          <div className={styles.tipCard}>
            <h3>Diccionario</h3>
            <ul>
              <li>+5.000 palabras en español</li>
              <li>Incluye palabras comunes</li>
              <li>Vocales acentuadas soportadas</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer appName="generador-anagramas" />
    </div>
  );
}
