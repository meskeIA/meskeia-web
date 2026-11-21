import { test, expect, type Page } from '@playwright/test';
import { activarTemaOscuro, desplegarTodo, MARCA, prepararParaMedir } from './_contraste';

/**
 * El color que llega por DATOS — cabo C0645 (06/11/2026).
 *
 * `style={{ color: x.color }}` o `style={{ background: item.color }}` con el color en un array
 * del mismo fichero: check:contraste-marca no lo ve (el literal no está en el style) y su
 * ampliación encendía 251 literales en 92 apps sin distinguir cuál llega a un texto. Aquí se mide
 * lo que se VE, por píxel y en los dos temas, recorriendo las secciones de la app: cada texto
 * pintado en un color de la marca (acento incluido) y cada texto BLANCO, contra su fondo compuesto.
 *
 * Lo que NO mide: texto de otros colores de datos (el amarillo de una base nitrogenada), salvo en
 * las filas con `todo`, el texto de un SVG o de un lienzo (tests/contraste-lienzo.spec.ts) ni un
 * fondo con degradado.
 */

interface App {
  slug: string;
  /** Botones que cambian de sección; sin él, solo la carga */
  secciones?: string;
  /**
   * Mide TODO el texto, de cualquier color, contra su fondo compuesto (y se salta el que tiene un
   * degradado o una imagen detrás, que no se compone). Para las apps que pintan como texto
   * colores de datos que no son la marca (/reparar 07/11/2026).
   */
  todo?: boolean;
}

const APPS: App[] = [
  // Estado del reactor en la marca que elige el factor k (4,11:1 en claro, 3,35 en oscuro),
  // blanco sobre la marca y sobre la paleta INES (2,03-3,91), «Baja actividad» en el teal (2,67)
  // y «U-235» sobre el tinte del núcleo en oscuro (4,32)
  { slug: 'visualizador-energia-nuclear', secciones: 'nav[aria-label*="ecciones"] button' },
  // El nombre de la vía ganadora del veredicto en el color de su barra: «Préstamo bancario» en la
  // marca (4,11:1 en claro, 3,50 en oscuro) y «Ampliación de capital» en #C0392B (2,64 en oscuro)
  { slug: 'simulador-financiacion-empresarial', todo: true },
  // El nombre, la fórmula y la «sorpresa» de cada fuerza en su color de datos: 2,54-4,11:1 en
  // claro (tensión superficial, gravedad, fricción, presión) y 3,07-4,40 en oscuro (inercia,
  // gravedad, tensión). Las cinco fuerzas del acordeón, abiertas una a una
  { slug: 'visualizador-fuerzas-invisibles', todo: true, secciones: "button[class*='fuerzaCabecera']" },
  // Reservorios, balance, destinos y potencial de cada solución en su color de datos (2,19-4,20:1
  // en claro, 2,39-3,96 en oscuro), el «Punto crítico» en #C0392B (2,88 en oscuro) y las
  // «Limitaciones» en --text-muted sobre su velo oscuro (4,40). Las cuatro pestañas
  { slug: 'visualizador-ciclo-carbono-completo', todo: true, secciones: "[role='tab']" },
  // Blanco sobre el color del estado activo (2,0-4,0:1), cabeceras de la tabla, nombres de las
  // transiciones, estado del agua y cifras de la escala en su color de datos (1,08-4,35:1 en los
  // dos temas). Las cuatro secciones
  { slug: 'visualizador-estados-materia', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // Nombre de cada signo y de cada célula, campos y títulos de la comparativa y tiempos de la
  // cronología en su color de datos (2,45-3,93:1), y blanco sobre el verde, el rojo, el naranja y
  // el gris de los botones activos y la cabecera (2,85-3,82). Las secciones
  { slug: 'visualizador-inflamacion', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // Título de la zona, rótulo de cada barra de la tonotopía y nota de cada frecuencia en su color
  // de datos: 1,52-4,11:1 en claro (el amarillo f1c40f, 1,52) y 3,08-4,44 en oscuro
  { slug: 'visualizador-oido-equilibrio', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // Títulos de función, órgano, paso y patología y el dato del órgano en su color de datos
  // (2,19-4,11:1), blanco sobre la marca y el rojo de insignias y pasos (3,82-4,11) y el botón del
  // órgano activo con texto blanco sobre la tarjeta blanca (1,00)
  { slug: 'visualizador-sistema-linfatico', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // El régimen de cada resultado, las tarjetas de la sustentación y los cuatro regímenes de Mach en
  // su color de datos (2,06-4,11:1 en claro, 1,84-3,81 en oscuro) y el blanco del Modo Realidad
  // sobre el verde (2,87). Las cuatro pestañas
  { slug: 'visualizador-mecanica-fluidos', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // La pestaña activa con el ratón encima (el :hover pintaba el texto en su propio fondo, 1,00:1),
  // siglas de la CPU y latencias en su color de datos (1,59-4,11:1 en claro, 1,99-3,60 en oscuro)
  // y blanco sobre las barras de memoria y la insignia de fase (1,66-4,11)
  { slug: 'visualizador-arquitectura-computador', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // Blanco sobre el número de cada paso (2,15-4,23:1), y las temperaturas, las fórmulas y el GWP
  // de cada gas, el porcentaje de cada fuente y los grados de cada escenario en su color de datos
  // (2,15-4,23 en claro, 1,73-3,90 en oscuro)
  { slug: 'visualizador-efecto-invernadero', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // Blanco sobre el ámbar y el rojo de las flechas del balance (2,15-3,76:1), y temperaturas,
  // corrientes, el nivel del deslizador y la escala de grados en su color de datos (2,06-3,90 en
  // claro, 2,09-3,90 en oscuro)
  { slug: 'visualizador-clima', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // El precio y el nombre de cada asistente en su color de marca (2,81-4,49:1 en claro, 3,17-4,49
  // en oscuro), y la empresa y las etiquetas «mejor para» sobre el tinte de la fila desplegada
  // (4,47-4,49, forma de C0278). Las pestañas de la recomendación
  { slug: 'comparador-asistentes-codigo', todo: true, secciones: "[role='tab']" },
  { slug: 'visualizador-terremotos-tsunamis', todo: true, secciones: "[role='tablist'][aria-label*='ecciones'] [role='tab']" },
  // Hallazgo 4339: las cifras de los bloques de Estructura y de las barras de Sistemas en el color
  // de cada dato, igual en los dos temas («206» en #E8D8C4 a 1,40:1, «78» en el teal 2,80, saliva
  // 2,10, pensamientos 2,19 en claro; latidos 3,76, sangre 2,64, parpadeos 3,07 en oscuro), y los
  // porcentajes de la composición por peso en negro al 70 % sobre cada segmento (3,97-4,49)
  { slug: 'visualizador-cuerpo-numeros', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // Del resto del censo de C0645 (10/11/2026): la cifra de cada tarjeta de fidelidad en su color de
  // datos, igual en los dos temas, y el blanco sobre las barras naranja, teal y verde de las tres
  // capas de protección. Los cinco pasos de la horquilla, como secciones
  { slug: 'visualizador-adn-polimerasa', todo: true, secciones: "button[class*='indicadorPunto']" },
  // Del resto del censo de C0645 (10/11/2026): el blanco sobre los números de paso en su color de
  // datos (2,80-4,11:1), el nombre de la complicación abierta en su color sobre su tinte (3,65 en
  // claro, 3,99 en oscuro), y en oscuro la insignia «Glucosa elevada» (4,32) y los títulos de la
  // guía (4,19). Los dos estados del páncreas y los tres tipos, como secciones
  { slug: 'visualizador-diabetes-mecanismo', todo: true, secciones: "button[class*='toggleBtn'], [role='tab']" },
  // Del resto del censo de C0645 (10/11/2026): «Cátodo — Reducción» en #3B82F6 sobre su tinte (3,36:1
  // en claro, 3,57 en oscuro), y en oscuro los potenciales positivos en #2563EB (2,44-2,56) y la
  // reserva de la receta -texto en #EF4444 y #16A34A (3,36-3,82)
  { slug: 'visualizador-electroquimica', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // Del resto del censo de C0645 (10/11/2026): el blanco sobre la etiqueta de cada grupo en su color
  // puro (−NH₂ 1,96:1, −COO− 2,13, −CHO 2,57) y el título del detalle en el color del grupo
  // («Alcoholes» 3,06 en oscuro). Las ocho tarjetas de grupo, como secciones (la pestaña de grupos
  // es la de carga)
  { slug: 'visualizador-quimica-organica', todo: true, secciones: "button[class*='grupoCard']" },
  // Del resto del censo de C0645 (10/11/2026): en oscuro, el texto claro del tema sobre el pastel
  // de cada parte bacteriana (1,04-1,18:1), los nombres de dominio y tipos de la comparativa en el
  // color del dato con style (1,21-2,25), las marcas ✓ ± ✗ (2,25-3,39) y los valores de los
  // deslizadores (4,29)
  { slug: 'visualizador-microbiologia', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // Del resto del censo de C0645 (10/11/2026): títulos de tarjeta, de la comparativa y del detalle
  // en el color puro del dato con style (verde 2,87:1 y rojo 3,82 en claro, violetas 2,03-2,45 en
  // oscuro) y el blanco sobre los botones activos en verde y rojo (2,87-3,82)
  { slug: 'visualizador-alzheimer-parkinson', todo: true, secciones: "nav[aria-label*='nfermedad'] button, button[aria-pressed]:not(nav button)" },
  // Del censo de C0297 (10/11/2026): las insignias de estado en teal sobre su tinte teal (3,80-4,32:1
  // en claro, 3,66-4,25 en oscuro), «Silenciado ahora» en gris sobre su tinte (4,19 y 3,16-3,36), las
  // de evidencia en #e74c3c sobre su tinte en oscuro (3,25) y los avisos en #777 en oscuro (3,08)
  { slug: 'visualizador-epigenetica', todo: true, secciones: 'button[aria-pressed]' },
  // Del censo de C0297 (10/11/2026): «Orden 0, 1, 2» de la comparativa de vidas medias en
  // --text-muted sobre su tinte (4,48:1 en claro) y la vida media del orden 2 en #E67E22 con style
  { slug: 'visualizador-cinetica-quimica', todo: true, secciones: 'button[aria-pressed]' },
  // Del censo de C0297 (10/11/2026): el nombre de cada color del hidrógeno en su color puro con style
  // sobre su tinte (amarillo 1,94:1, verde 2,03, gris 2,29, azul 3,15 en claro), el CO₂ en verde y
  // rojo puros (2,28 y 3,76), el blanco sobre la insignia verde (2,28) y, en oscuro, el texto claro
  // del tema sobre el botón activo de la densidad (4,46)
  { slug: 'visualizador-hidrogeno', todo: true, secciones: 'button[aria-pressed]' },
  // Del censo de C0297 (10/11/2026): «Mecanismo político» en --primary-texto sobre el tinte de marca
  // al 10 % en oscuro (4,40:1)
  { slug: 'visualizador-regimenes-politicos', todo: true },
  // Del censo de C0297 (10/11/2026): el borde activo en su color puro con style (verde 2,28:1), el
  // blanco sobre las barras de Richter (1,98-3,76) y las magnitudes históricas en su color (naranja
  // 2,67 en claro, granate 1,73 en oscuro)
  { slug: 'visualizador-tectonica-placas', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // Del censo de C0297 (10/11/2026): el nivel del glucagón en el naranja #e67e22 de su barra con
  // style (2,85:1 en claro)
  { slug: 'visualizador-sistema-endocrino', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // Del censo de C0297 (10/11/2026): el nombre y la tasa de cada tipo de inflación en su color con
  // style (verde 2,28:1, ámbar 2,15, rojo 3,76, índigo 4,47 en claro; la hiperinflación #7f1d1d
  // 1,43 y el índigo 3,21 en oscuro) y «↑ Por encima» en la reserva roja de la receta en oscuro (3,76)
  { slug: 'visualizador-inflacion', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // Del censo de C0297 (10/11/2026): el blanco de «Par EV» sobre la marca (4,11:1 en claro, 2,79 en
  // oscuro) y el de «Par ICE» sobre --text-muted en oscuro (2,78), y en oscuro los títulos de los
  // recuadros y los rótulos del eje sobre el tinte de marca al 10 % (4,24-4,26, forma de C0278)
  { slug: 'visualizador-motor-electrico', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // Del censo de C0297 (10/11/2026): la cantidad y las pistas de la FAQ en #2e8a87 sobre su tinte
  // teal (3,58-3,74:1 en claro), y en oscuro la pestaña activa con el ratón encima en el acento sobre
  // --primary-boton (2,42), el precio y los pagos en #f06090 sobre su tinte rosa (4,07) y la cifra
  // de Nash en --primary-texto sobre el tinte al 10 % (4,40)
  { slug: 'visualizador-estructuras-mercado', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // Del censo de C0297 (10/11/2026): el nombre de cada proceso en su color con style (el amarillo
  // 1,89:1, el teal 2,68, el naranja 2,85, el gris 3,40 en claro; el marrón 2,66, el rojo 3,10 y el
  // verde 3,39 en oscuro), los títulos de los impactos en rojo y verde sobre la tarjeta oscura
  // (2,45-2,69), el blanco sobre las insignias naranja y amarilla de alteración humana (1,97-2,97)
  // y en oscuro los títulos sobre el tinte de marca al 9-12 % (4,30-4,32, forma de C0278). El
  // proceso elegido toma su fondo de rellenoConTinta, que garantiza 4,5:1 por construcción
  { slug: 'visualizador-ciclo-nitrogeno', todo: true, secciones: "[role='tablist'][aria-label*='ecciones'] [role='tab']" },
  // 13/11/2026 (C0297, C0645): los porcentajes de la leyenda en el color de su componente (el ámbar
  // 2,22:1 en claro, el morado 1,51 en oscuro), «73,0 km/s/Mpc» en ámbar, la nota de la historia en
  // #999 (2,73), las insignias de los destinos en su color sobre su tinte (2,00-3,22 en claro,
  // 3,28-4,12 en oscuro) y el strong del aviso en la reserva roja de la receta en oscuro (3,21)
  { slug: 'visualizador-cosmologia', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // 13/11/2026 (C0645): el año de cada reforma en el color de su punto (la marca 4,11:1, el teal 2,80
  // y el acento 2,26 en claro; la marca 3,50 en oscuro)
  { slug: 'visualizador-sistema-pensiones', todo: true, secciones: "[role='tablist'] [role='tab']" },
  // 13/11/2026 (C0645, C0278): en oscuro, el estado de la circulación y el porcentaje del AMOC en
  // --primary-texto y las marcas del deslizador en --text-muted sobre el tinte de marca al 10-12 %
  // (4,32-4,42:1), y el enfriamiento «-1.5°C» en #c0392b fijo (2,26)
  { slug: 'visualizador-oceanos-corrientes', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // 13/11/2026 (C0645): el nombre de cada tipo de roca en su color con style (Sedimentarias 3,19:1 en
  // claro; Ígneas 2,97 y Metamórficas 2,52 en oscuro) y el blanco sobre las barras verdes y ámbar de
  // la escala de Mohs (1,28-3,76)
  { slug: 'visualizador-tipos-rocas', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // 13/11/2026 (C0645): el número del tiempo elegido en su color sobre su tinte, la eficiencia real en
  // #16A34A (3,3:1) y los porcentajes de las pérdidas en su color (el naranja 2,85 en claro)
  { slug: 'visualizador-motor-combustion', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // 13/11/2026 (C0278, C0681): «Clase» en --primary-texto sobre el tinte al 12 % (4,36:1 en claro) y,
  // en oscuro, las especies en --text-muted sobre la tarjeta elegida (4,29) y «Endotermo» en la
  // reserva roja de la receta (3,93)
  { slug: 'visualizador-reino-animal', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // 13/11/2026 (C0645): las probabilidades de los deslizadores y las cifras de las comparativas y de
  // la eficiencia de Huffman en el color de su dato (el ámbar 1,99-2,08:1, el teal 2,80, el rojo
  // 3,61-3,77, la marca 4,11 y #999 2,73 en claro; la marca 3,50 y el rojo 3,81 en oscuro)
  { slug: 'visualizador-teoria-informacion', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // 13/11/2026 (C0645): «demanda» en #e74c3c (3,50:1 en claro, 3,31 en oscuro) y la caída de la
  // cantidad y el poder de mercado en #27ae60 con style (2,87 en claro)
  { slug: 'visualizador-microeconomia', todo: true, secciones: 'button[aria-pressed]' },
  // 13/11/2026 (C0278, C0645): los aminoácidos y las bases del alineamiento en --primary-texto sobre
  // el tinte de marca al 10 % (4,48:1 en claro) y los distintos en #C62828 sobre su tinte rojo
  // (4,43); en oscuro, T y C sobre su fondo (3,79 y 4,23)
  { slug: 'visualizador-evolucion-molecular', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // 13/11/2026 (C0278): en oscuro, «Nota:» en --primary-texto sobre el tinte de marca al 8 % (4,33:1)
  { slug: 'visualizador-numeros-complejos', todo: true, secciones: 'button[aria-pressed]' },
  // 13/11/2026 (C0645): la fase del potencial de acción en su color con style (el título «Reposo» en
  // #3498db, 3,15:1) y el blanco encima en el botón activo y en el voltaje (3,15 en los dos temas)
  { slug: 'visualizador-sistema-nervioso', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // 13/11/2026 (C0645): el blanco sobre la insignia del estado (NUEVO en teal, 2,80:1) y sobre los
  // segmentos del mapa de memoria en su color (la marca 4,11, el teal 2,80, el acento 2,26), «→ LISTO»
  // en la marca (3,93 en claro), el segmento libre en #999 y #666 (2,61 en claro, 2,80 en oscuro) y,
  // en oscuro, el «–» de los permisos en --text-muted sobre su tinte (3,94)
  { slug: 'visualizador-sistemas-operativos', todo: true, secciones: "[role='tablist'][aria-label*='ecciones'] [role='tab']" },
  // 13/11/2026 (C0645): la pestaña activa con el ratón encima (su texto en --primary-texto sobre su
  // propio fondo, 1,00:1), el blanco sobre el color de cada capa TCP/IP, de cada paso DNS y de las
  // insignias de registro (el verde claro 1,63, el acento 2,26, el teal 2,80, la marca 4,11)
  { slug: 'visualizador-redes-computadoras', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // 20/11/2026 (C0798): las cifras de cada nivel y las insignias de grupo en su color puro con style
  // (el verde 2,87:1, el naranja 2,85, el teal 3,32 en claro) y el blanco sobre las insignias de
  // nivel y el filtro de grupo activo (2,19-4,11). Los filtros de grupo como secciones: los de
  // nivel cambian cuántos grupos quedan, y sus colores ya salen en las insignias de cada tarjeta
  { slug: 'visualizador-recursos-literarios', todo: true, secciones: "[class*='filtrosBox'] > div:last-of-type button" },
  // 20/11/2026 (C0798): las celdas del tipo de matriz elegido en su color puro con style (la marca
  // 3,77:1 en claro y 3,08 en oscuro sobre el gris de la celda; el acento y el gris aún menos) y el
  // blanco del tipo activo sobre la marca (4,11). Los cuatro tipos como secciones. El naranja del
  // determinante, en tests/apps/visualizador-matrices.spec.ts
  { slug: 'visualizador-matrices', todo: true, secciones: "[class*='tiposGrid'] button" },
  // 20/11/2026 (C0798): el nombre de la fase en la marca (4,11:1 en claro, 3,35 en oscuro), «Adelanta
  // el reloj» en verde (2,75) y «Retrasa» en rojo (3,60-3,66), la leyenda de la curva en el color del
  // cronotipo, el blanco de las proteínas, los picos, las cajas del diagrama y la insignia «Mañana»
  // sobre el color puro (2,19-4,11), el porcentaje del cronotipo activo en --text-muted sobre su tinte
  // (4,44) y en oscuro la pestaña activa sobre su tinte (4,25)
  { slug: 'visualizador-cronobiologia', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // 20/11/2026 (C0798): las cifras de las fuerzas y del foso, el veredicto, el riesgo de cada celda
  // de Ansoff y la letra del VRIO en el verde, naranja o rojo puro del semáforo con style. Los seis
  // módulos como secciones (cada uno con su visual en su estado inicial)
  { slug: 'visualizador-estrategia-empresarial', todo: true, secciones: "button[role='listitem']" },
  // 20/11/2026 (C0798): el porcentaje de cada celda de la matriz de atención en blanco sobre el tono
  // de su intensidad (1,52-3,57:1) o sobre un tinte casi blanco en las filas no destacadas (1,03-1,31);
  // en oscuro, cada token en su color puro sobre su tinte (1,95-4,49), el blanco de los botones
  // activos pisado por el gris del botón (2,52 y 4,46) y --primary-texto sobre el tinte (4,18-4,32)
  { slug: 'visualizador-llm-funcionamiento', todo: true },
  // 20/11/2026 (C0858): la longitud de onda elegida escrita en el color de esa luz con style (el
  // verde-amarillo de 550 nm sobre la tarjeta clara, 1,2:1), «Siempre brillante» en 27AE60 (2,87) y la
  // intensidad transmitida en verde, naranja o rojo puros con style (el naranja de 45°, 2,19)
  { slug: 'visualizador-optica-ondulatoria', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // 20/11/2026 (C0857): alfa, beta y la potencia en rojo, naranja y verde puros con style (2,9-3,9:1
  // en claro) y la potencia del cuarto bloque igual; en oscuro, «Verdadero negativo» en 4A5568 fijo
  { slug: 'visualizador-estadistica-inferencial', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // 20/11/2026 (C0297): el nombre de cada componente y la leyenda del lienzo en el color de su onda
  // con style (la marca 4,11:1, el teal 2,80, el ámbar 2,1 en claro) y «● Suma» en #1A1A1A fijo, negro
  // sobre negro en oscuro
  { slug: 'visualizador-transformada-fourier', todo: true },
  // 20/11/2026 (C0297): el botón de la frecuencia activa, blanco sobre la marca (4,11:1) o el teal
  // (2,80) puestos con style
  { slug: 'visualizador-como-funciona-wifi', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // 20/11/2026 (C0798): en D'Hondt y en los otros sistemas, las siglas de la tabla y «→ Escaño para…»
  // en el color puro del partido con style (el naranja 2,01:1, el verde 2,64 en claro; la marca 3,08
  // en oscuro) y el blanco de las barras de escaños sobre ese color (2,19-4,11)
  { slug: 'visualizador-sistema-electoral', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // 20/11/2026 (C0798): la vida de la estrella en #27ae60 con style (2,87:1 en claro) y los símbolos de
  // la tabla periódica en el color de su origen (el oro del Big Bang 1,50, el teal 2,80 en claro)
  { slug: 'visualizador-vida-estrella', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // 13/11/2026: el título del panel de la capa en su color con style (el núcleo interno en oro, 1,73:1)
  { slug: 'visualizador-capas-tierra', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // 13/11/2026: «Producción de bilis» en amarillo (1,52:1), «FASE 2» en verde (2,56-2,75) y el título del
  // ciclo en naranja (2,19) en claro; «Lóbulo derecho» en rojo (3,20) y «FASE 1» en violeta (2,81-2,97)
  // en oscuro; el blanco sobre el naranja de la glucosa en el botón elegido y los pasos (2,19)
  { slug: 'visualizador-higado', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // 13/11/2026: el blanco de las etiquetas de cada tipo de músculo sobre su color puro (la marca
  // 4,11:1, el teal 2,80, el rojo 3,82) y la viñeta en rojo (3,82 en claro, 3,76 en oscuro)
  { slug: 'visualizador-musculos-movimiento', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // 13/11/2026: la pestaña activa con el ratón encima ponía --primary-texto sobre su propio fondo (1,00:1
  // en claro, 1,96 en oscuro), los pasos del ciclo de entrenamiento en su color con style (el acento
  // 2,26, el teal 2,80, el naranja 2,97, la marca 4,11 y 3,35), el loss en naranja (2,85) y, en
  // oscuro, el rango de la función elegida sobre el tinte de marca al 10 % (4,42)
  { slug: 'visualizador-ia-redes-neuronales', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // 13/11/2026: el título de la fuerza elegida en su color con style (la sustentación en verde, 3,30:1
  // en claro y 4,18 en oscuro) y, en oscuro, «El mito» y la respuesta de los casos cayendo a la
  // reserva de su receta (#DC2626 a 2,85, #16A34A a 4,18)
  { slug: 'visualizador-vuelo-avion', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // 13/11/2026: el nombre y el título de cada forma de calor y las tres «anti-» del termo en su color
  // con style (la conducción en rojo 3,76:1, la convección en azul 3,68, la radiación en ámbar 2,15, la
  // brisa en azul cielo 2,77 en claro; 3,81-3,90 en oscuro) y «Caliente» y «Frío» de la animación
  { slug: 'visualizador-termodinamica', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // 13/11/2026: en oscuro, «Nota importante» en --primary-texto sobre el fondo aclarado del aviso (3,70:1)
  { slug: 'visualizador-insulina-glucosa', todo: true },
  // 13/11/2026: en oscuro, el R₀ alto sobre su tinte rojo caía a la reserva #e74c3c de su receta (4,03:1)
  { slug: 'visualizador-modelos-epidemiologicos', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // 17/11/2026 (de paso por C0297): el botón activo del estado de la curva de rendimientos, blanco
  // sobre el color puro del estado con style (Normal en 22c55e, 2,28:1)
  { slug: 'visualizador-ciclo-economico', todo: true },
  // 20/11/2026 (de paso por C0297): el título del panel de cada región en su color con style (África
  // 2,85:1 y América del Norte 2,87 en claro; América Latina 2,35 y Oriente Medio 2,53 en oscuro). Cada
  // región del mapa, abierta una a una
  { slug: 'visualizador-migracion-global', todo: true, secciones: "svg g[role='button']" },
  // 20/11/2026 (de paso por C0297): el resultado de cada ejemplo y la predicción en el color de su clase
  // con style (el verde 27AE60 a 2,87:1 sobre blanco), y en oscuro los atributos activos en --primary-
  // texto sobre su tinte azul (4,50). Cada conjunto de datos, como sección
  { slug: 'arbol-decision-ia', todo: true, secciones: "button[class*='dsPill']" },
  // 20/11/2026 (cabo C0798, color de texto tomado de una tabla): títulos de los instrumentos en su
  // color de dato (teal 2,80 y acento 2,26 en claro) y, en oscuro, --primary-texto sobre el tinte
  // de las chips y de los consejos (3,71 y 3,92:1)
  { slug: 'visualizador-deuda-publica', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // 20/11/2026 (C0798): «Riesgo» en el color de cada etapa sobre su pastel (1,98-3,99), en oscuro el
  // pastel sin cambiar de tema bajo el texto claro (1,06-1,17) y el blanco sobre la fase en rojo (3,82).
  // Las etapas, fases y órganos ELEGIDOS los mide tests/apps/visualizador-hipertension.spec.ts
  { slug: 'visualizador-hipertension', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // 21/11/2026 (C0645): el título de la fase y la pestaña del tipo de dolor en el color del dato con
  // style (Transducción y Dolor agudo en #E67E22 sobre su tinte, 2,52:1 en claro y 4,23 en oscuro) y los
  // literales de las fibras C, la puerta y el sistema límbico. Las fases y los tipos como secciones
  // 21/11/2026 (C0645): en oscuro, el blanco de la etiqueta del hueco vacío sobre --text-muted (2,78:1),
  // y con dos autores elegidos el movimiento y las obras en el color del autor con style (#1A3A4A,
  // #2C3E50, #6C3483 sobre la tarjeta oscura) y el blanco sobre los colores medios (#16A085, 3,3).
  // Cada botón «+ A» y «+ B» de los diez autores, como sección: recorre todos los colores
  // 21/11/2026 (C0645): «Por qué funciona» de los escenarios en --primary-texto sobre el tinte de marca
  // encima de la tarjeta gris (4,48:1 en claro, 3,65 en oscuro). El contador de los cuadrantes, que
  // sale al añadir tareas, en tests/apps/matriz-eisenhower.spec.ts
  { slug: 'matriz-eisenhower', todo: true },
  // 21/11/2026 (C0645): el nombre de cada macronutriente en su color con style (Grasas en #F39C12 a 2,01:1,
  // Proteínas 3,82 y Carbohidratos 4,11 en claro; 3,50-3,76 en oscuro) y el porcentaje blanco sobre cada
  // segmento de la barra de proporciones (2,19-4,11). Las secciones del explicador
  // 21/11/2026 (C0645): la rentabilidad de cada clase en su color sobre su insignia teñida (#C9A84C y
  // #F7931A a 2,06:1, el teal 2,48 en claro; la marca 2,68 en oscuro) y, en la pestaña de correlación,
  // la leyenda en texto claro sobre sus pasteles fijos en oscuro y blanco sobre el gris de la
  // diagonal. Las cuatro pestañas; el nombre de cada clase en su detalle, en
  // tests/apps/visualizador-tipos-activos.spec.ts
  // 21/11/2026 (C0645): el precio y las etiquetas «mejor para» en el color de cada IDE con style
  // («Gratis» en #06B6D4 a 2,33:1 y el rosa de JetBrains a 3,04-3,17 en claro; #084C61 a 1,84 en
  // oscuro, además del violeta prohibido de Cursor) y --text-muted sobre la fila desplegada (4,49).
  // Las cuatro pestañas, con todas las filas de la tabla desplegadas
  // 21/11/2026 (C0645): la tinta de cada tipo de cobertura sobre su pastel fijo, igual en los dos temas
  // («Muy recomendable» en #d97706 a 2,86:1, «Obligatorio» 3,95, «Recomendable» 4,24, «Opcional» 4,39),
  // «❌ No» en --text-muted sobre su gris translúcido (3,70-4,11) y en oscuro los casos en
  // --primary-texto sobre su tinte (4,32)
  { slug: 'checklist-coberturas-seguros', todo: true },
  // 21/11/2026 (C0645): el nombre de cada madera en blanco sobre su color (Álamo #FFFACD 1,06:1, Arce
  // 1,17, Haya 1,97, Alerce 2,99…) y el blanco de las insignias de tipo, dificultad y sostenibilidad
  // sobre su color (2,65-4,12). Igual en los dos temas
  { slug: 'guia-maderas', todo: true },
  { slug: 'comparador-ides-ia', todo: true, secciones: "[role='tablist'][aria-label='Secciones del comparador de IDEs'] [role='tab']" },
  { slug: 'visualizador-tipos-activos', todo: true, secciones: "[role='tablist'][aria-label='Secciones del visualizador'] [role='tab']" },
  { slug: 'visualizador-digestion-nutrientes', todo: true, secciones: "nav[aria-label='Secciones del explicador'] button" },
  { slug: 'comparador-voces-narrativas', todo: true, secciones: "[class*='autorBotones'] button" },
  { slug: 'visualizador-como-funciona-el-dolor', todo: true, secciones: "nav[aria-label='Fases de la nocicepción'] button, [role='tablist'][aria-label='Tipos de dolor'] [role='tab']" },
  // 21/11/2026 (C0645): la pestaña activa y los subtítulos del panel en el color de cada tipo con style
  // (la marca 4,11:1, el teal 2,80 y el acento 2,26 en claro), el blanco sobre el número de cada paso
  // en ese color (2,26-4,11) y el valor de referencia de cada monitor en su color sobre su tinte (rojo,
  // teal y ámbar, 1,90-3,07 en claro); en oscuro, el autor de cada teoría en #888 (4,05). Los tres tipos
  { slug: 'visualizador-anestesia', todo: true, secciones: "[role='tablist'][aria-label='Tipos de anestesia'] [role='tab']" },
  // 21/11/2026 (C0645), familia de las cronologías de movimientos: el nombre de cada corriente y su
  // categoría en su color con style sobre un tinte de ese color (comparativa y eras: Presocráticos
  // #8B4513 a 1,54-2,05:1 en oscuro, Existencialismo #2F4F4F 1,54, Medieval #8B008B 1,59; en claro el
  // oro de la arquitectura griega a 1,90-2,09) y el blanco sobre el color de la corriente elegida en
  // el botón y la cabecera (2,24-3,99), con el botón en --text-secondary sobre su color en oscuro
  // (1,03-3,27) y «Todas» en blanco sobre la página (1,04). Las cuatro pestañas
  { slug: 'visualizador-filosofia', todo: true, secciones: "[role='tablist'] [role='tab']" },
  { slug: 'visualizador-arte-movimientos', todo: true, secciones: "[role='tablist'] [role='tab']" },
  { slug: 'visualizador-arquitectura-estilos', todo: true, secciones: "[role='tablist'] [role='tab']" },
  { slug: 'visualizador-literatura-movimientos', todo: true, secciones: "[role='tablist'] [role='tab']" },
  { slug: 'visualizador-musica-movimientos', todo: true, secciones: "[role='tablist'] [role='tab']" },
  { slug: 'visualizador-revoluciones-industriales', todo: true, secciones: "[role='tablist'] [role='tab']" },
  { slug: 'visualizador-derechos-humanos', todo: true, secciones: "[role='tablist'] [role='tab']" },
  // 21/11/2026 (C0645): la plantilla de todas las cronologías de Cronicum (HistoriaInteractivo), la
  // misma forma; «Todos» además en blanco sobre --primary (4,11 en claro, 2,79 en oscuro). Dos
  // cronologías con paletas distintas
  { slug: 'visualizador-historia/revolucion-francesa', todo: true, secciones: "[role='tablist'] [role='tab']" },
  { slug: 'visualizador-historia/china-dinastias', todo: true, secciones: "[role='tablist'] [role='tab']" },
  // 21/11/2026 (C0645): blanco sobre el color de cada bioma en los botones de latitud y los chips del
  // comparador (Desierto #FFC107 a 1,63:1, Tundra 1,91, Templado 2,10, Sabana 2,19, Tropical 2,87),
  // el % protegido en rojo, naranja y verde puros (2,85-2,87 en claro, el rojo 2,64 en oscuro) y la
  // severidad de cada amenaza en su color (naranja 2,85 en claro, violeta 2,45 en oscuro). Las pestañas
  { slug: 'visualizador-biomas-terrestres', todo: true, secciones: "nav[aria-label='Secciones del visualizador'] [role='tab']" },];

async function suspensos(page: Page, todo = false): Promise<string[]> {
  return page.evaluate(({ marca, todo }) => {
    const lz = document.createElement('canvas');
    lz.width = lz.height = 1;
    const ctx = lz.getContext('2d', { willReadFrequently: true })!;
    const norm = (css: string): number[] => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = '#000';
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    };
    const can = (c: number) => {
      const s = c / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    const lum = (p: number[]) => 0.2126 * can(p[0]) + 0.7152 * can(p[1]) + 0.0722 * can(p[2]);
    const ratio = (a: number[], b: number[]) => {
      const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
      return (x + 0.05) / (y + 0.05);
    };
    const M = marca.map(norm);
    const deMarca = (p: number[]) => M.some((m) => Math.abs(m[0] - p[0]) + Math.abs(m[1] - p[1]) + Math.abs(m[2] - p[2]) < 24);
    const fondo = (el: Element): number[] | null => {
      const capas: number[][] = [];
      for (let e: Element | null = el; e; e = e.parentElement) {
        if (todo && getComputedStyle(e).backgroundImage !== 'none') return null;
        const c = norm(getComputedStyle(e).backgroundColor);
        if (c[3] > 0) capas.push(c);
        if (c[3] >= 1) break;
      }
      let b = [255, 255, 255];
      for (let i = capas.length - 1; i >= 0; i--) b = [0, 1, 2].map((k) => capas[i][k] * capas[i][3] + b[k] * (1 - capas[i][3]));
      return b;
    };
    const fuera: string[] = [];
    for (const el of Array.from(document.querySelectorAll('body *'))) {
      if (el.closest('nextjs-portal, canvas, svg')) continue;
      if (!Array.from(el.childNodes).some((x) => x.nodeType === 3 && (x.textContent ?? '').trim())) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
      const r = (el as HTMLElement).getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const fg = norm(cs.color);
      const blanco = fg[0] > 249 && fg[1] > 249 && fg[2] > 249;
      if (fg[3] < 1 || !(todo || deMarca(fg) || blanco)) continue;
      if (todo && el.closest('[aria-hidden="true"], input, textarea, select, [disabled]')) continue;
      const px = parseFloat(cs.fontSize);
      const umbral = px >= 24 || (px >= 18.66 && +cs.fontWeight >= 700) ? 3 : 4.5;
      const f = fondo(el);
      if (!f) continue;
      const v = ratio(fg, f);
      if (v < umbral) fuera.push(`«${(el.textContent ?? '').trim().slice(0, 40)}» rgb(${fg.slice(0, 3)}) sobre rgb(${f.map(Math.round)}): ${v.toFixed(2)}:1`);
    }
    return Array.from(new Set(fuera));
  }, { marca: MARCA, todo });
}

async function recorrer(page: Page, secciones?: string, todoElTexto = false): Promise<string[]> {
  const todo: string[] = [];
  const botones = secciones ? page.locator(secciones) : null;
  const n = botones ? await botones.count() : 0;
  if (!n) {
    await desplegarTodo(page);
    return suspensos(page, todoElTexto);
  }
  await desplegarTodo(page);
  for (let i = 0; i < n; i++) {
    const boton = botones!.nth(i);
    // Un acordeón (aria-expanded) se abre sección a sección sin volver a desplegarlo todo, que
    // cerraría la que se mide; un botón de sección sin aria-expanded, como antes
    if ((await boton.getAttribute('aria-expanded')) !== 'true') await boton.click();
    if ((await boton.getAttribute('aria-expanded')) === null) await desplegarTodo(page);
    else await expect(boton).toHaveAttribute('aria-expanded', 'true');
    todo.push(...(await suspensos(page, todoElTexto)).map((s) => `sección ${i + 1}: ${s}`));
  }
  return todo;
}

for (const { slug, secciones, todo } of APPS) {
  test(`${slug}: el texto de marca y el blanco sobre colores de datos se leen en claro y en oscuro (C0645)`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(`/${slug}/`);
    await prepararParaMedir(page);
    if (secciones) await expect(page.locator(secciones).first()).toBeVisible();
    expect.soft(await recorrer(page, secciones, todo), 'claro').toEqual([]);
    await activarTemaOscuro(page);
    expect.soft(await recorrer(page, secciones, todo), 'oscuro').toEqual([]);
  });
}
