import { test, expect, type Page } from '@playwright/test';
import { activarTemaOscuro, desplegarTodo, prepararParaMedir } from './_contraste';

/**
 * El texto de un SVG contra lo que tiene detrás — cabo C0297 (parte de los `fill` de SVG).
 *
 * Ni los candados de contraste ni los testigos por píxel miran el `<text>` de un SVG: el color
 * va en `fill`, no en `color`, y el fondo no es el `background` de un antepasado sino las formas
 * que el propio SVG pinta debajo (el tinte de una zona del diagrama de fases, la caja de un
 * bloque). Aquí se mide lo que se ve: se ocultan los `<text>`, se fotografía cada SVG visible y,
 * para cada texto, el fondo es el color MÁS FRECUENTE dentro de su caja (una línea que lo cruce no
 * cuenta como fondo). Se compone el `fill-opacity` sobre ese fondo, y el umbral es 4,5:1, o 3:1
 * si el texto se pinta a 24 px o más (18,66 en negrita) tras la escala del viewBox.
 *
 * Fuera, a propósito: un `fill` con degradado o patrón (`url(…)`), el texto de opacidad 0 y el
 * que no tiene caja. Las apps salen de la nota del 08/11/2026 del cabo (candidatas con caso).
 */

interface App {
  slug: string;
  /** Botones que cambian de sección; sin él, solo la carga */
  secciones?: string;
  /** Además, en cada sección, cada deslizador a su mínimo y a su máximo (otros regímenes) */
  extremos?: boolean;
  /**
   * Ancho de la ventana para una app cuyo SVG es más ancho que la página y va en un contenedor
   * con scroll (las cronologías de 1.100-1.400 px): la foto del SVG solo trae lo visible, y lo
   * recortado sale blanco, así que un rótulo blanco fuera de la vista se mediría contra blanco.
   */
  ancho?: number;
  /**
   * Botones que cambian el SVG DENTRO de una sección (la falla normal, inversa y de desgarre de
   * visualizador-terremotos-tsunamis): en cada sección donde se vean, se pulsan uno a uno y se mide.
   */
  subestados?: string;
}

const SECCIONES = "nav[aria-label*='ecciones'] button";

/**
 * Una fila por app REPARADA (las cinco candidatas de la nota del 08/11/2026 del cabo C0297, más
 * las que se añadan). Control: sin la reparación, cada una cae con los textos de su comentario.
 * Mide el estado de carga de cada sección: los rótulos que cambian con un deslizador (otro
 * régimen, otra fase) se cubren porque toman el tono de la misma tabla que los medidos.
 */
const APPS: App[] = [
  // Sólido, Líquido y Gas en el color de su zona sobre el tinte de la propia zona (2,01-2,52:1 en
  // claro), Punto triple (3,40 en claro, 2,12 en oscuro) y Punto crítico (2,28 en oscuro)
  { slug: 'visualizador-estados-materia', secciones: SECCIONES, extremos: true },
  // Los rótulos del esquema en el color de su zona sobre el tinte de la zona: la marca 3,19-3,62:1
  // en claro y 2,59-3,03 en oscuro, el teal 2,76 y el naranja 2,74 en claro, y «Ventana oval» en
  // #666 a 2,39 en oscuro
  { slug: 'visualizador-oido-equilibrio', secciones: SECCIONES, extremos: true },
  // Blanco sobre el Sol (1,96:1 en claro, 2,51 en oscuro), las moléculas sobre su círculo al 40 %
  // (1,06-2,30 en oscuro), la superficie sobre su franja (1,34-1,53 en oscuro), los rojos y el
  // ámbar como texto con opacidad (1,86-3,81) y la leyenda en #666 a 1,90 en oscuro
  { slug: 'visualizador-efecto-invernadero', secciones: SECCIONES, extremos: true },
  // El rótulo de Reynolds, las presiones de Magnus, las velocidades del perfil, el aviso del mito y
  // el régimen de Mach en su color de datos sobre el tinte de ese color: 1,87-3,60:1 en claro y
  // 2,40-3,04 en oscuro
  { slug: 'visualizador-mecanica-fluidos', secciones: SECCIONES, extremos: true },
  // Blanco sobre el color de cada bloque al 80 % (2,36-2,97:1 en claro, 3,16-4,27 en oscuro), el
  // pie en #aaa (2,30) y el bloque del bus en NEGRO por un fill inválido ('#666CC'), con su rótulo
  // desbordado tapando «Buses»
  { slug: 'visualizador-arquitectura-computador', secciones: SECCIONES, extremos: true },
  // Los rótulos del eje en #666 (2,37:1 en oscuro), «Alto» y «Bajo» en #999 (2,82 en claro) y
  // «Ovulación» en naranja F39C12 (2,17 en claro)
  { slug: 'visualizador-ciclo-menstrual' },
  // Los rótulos de los cuatro diagramas en el color de su rayo o de su medio: el verde 2ECC71 1,93:1,
  // el naranja F39C12 2,09, el gris 999 2,72 y el agua 2,89 en claro; la fórmula en #666 a 2,26 en
  // oscuro, y los nombres del espectro en su color puro (amarillo y verde casi invisibles en claro)
  { slug: 'visualizador-optica', secciones: "[role='tablist'][aria-label*='ecciones'] [role='tab']", extremos: true },
  // Las cronologías de movimientos, una familia (C0297, 08/11/2026): rótulo blanco a 9-10 px sobre
  // la barra de su color al 80 % (1,90-4,49:1 en claro: Griega Clásica sobre goldenrod 1,90,
  // Epicureísmo 2,18, la marca 4,11-4,18), el «año 0» en gris o rojo con opacidad (2,96-3,83) y,
  // en revoluciones-industriales, barras sin hueco montadas en la fila 0 encima de otra.
  { slug: 'visualizador-filosofia', ancho: 1800 },
  { slug: 'visualizador-literatura-movimientos', ancho: 1800 },
  { slug: 'visualizador-arte-movimientos', ancho: 1800 },
  { slug: 'visualizador-musica-movimientos', ancho: 1800 },
  { slug: 'visualizador-derechos-humanos', ancho: 1800 },
  { slug: 'visualizador-revoluciones-industriales', ancho: 1800 },
  { slug: 'visualizador-arquitectura-estilos', ancho: 1800 },
  { slug: 'visualizador-historia/revolucion-francesa', ancho: 1800 },
  { slug: 'visualizador-historia/china-dinastias', ancho: 1800 },
  // De la tanda del censo del 08/11/2026 (C0297), reparada el 10/11/2026: blanco sobre la arena de
  // las fallas (1,50:1), «Corteza» en marrón sobre su franja (2,81 en claro, 1,22 en oscuro), los
  // rótulos de la subducción en azul claro, trigo, rojo o ámbar sobre el agua y las placas
  // (1,06-2,71 en claro), el azul claro de la ola del tsunami como texto (2,24) y el trigo sobre
  // el fondo marino (1,82). Las tres fallas se miden como subestados de la primera sección.
  {
    slug: 'visualizador-terremotos-tsunamis',
    secciones: "[role='tablist'][aria-label*='ecciones'] [role='tab']",
    extremos: true,
    subestados: "button[class*='fallaCard']",
  },
  // Del censo del 08/11/2026 (C0297), reparada el 10/11/2026: las fases del ciclo en su color sobre
  // el tinte del arco (2,46-3,47:1 en claro, 2,18-3,99 en oscuro), blanco sobre los pedales verde
  // y rojo y sobre PD-1 y PD-L1 al 85 % (2,47-3,80), la flecha del acelerador montada sobre su
  // pedal (1,00) y los rótulos de las células en su color (2,31-4,07). Los tres estados de la
  // inmunoterapia, como subestados.
  { slug: 'visualizador-cancer', secciones: SECCIONES, extremos: true, subestados: "button[class*='estadoBtn']" },
  // Del censo del 08/11/2026 (C0297), reparada el 10/11/2026: rótulos sobre la tarjeta en #1A1A1A,
  // #666 y #999 fijos (1,28-2,37:1 en oscuro, 2,82 en claro), el espermatozoide y el notocordio
  // en la marca y el teal (2,78-4,07), y blanco sobre el teal y la marca translúcidos (2,42-2,77)
  { slug: 'visualizador-embriogenesis', secciones: SECCIONES, extremos: true },
  // Del censo del 08/11/2026 (C0297), reparada el 10/11/2026: los extremos 5' y 3' de cada hebra en
  // la marca y el teal, la hebra líder en el acento y los fragmentos de Okazaki en naranja sobre la
  // tarjeta, y el blanco sobre las bases, la helicasa gris, la polimerasa y la ligasa translúcidas.
  // Los cinco pasos de la horquilla, como secciones
  { slug: 'visualizador-adn-polimerasa', secciones: "button[class*='indicadorPunto']" },
  // Del censo del 08/11/2026 (C0297), reparada el 10/11/2026: blanco sobre las células β y α, la
  // insulina, GLUT4, Hb y HbA1c en su color translúcido (1,83-4,11:1), #888 sobre las células
  // inactivas (2,25), los rótulos en rojo, naranja, teal y marca puros (2,41-3,93 en claro,
  // 1,54-3,80 en oscuro) y las leyendas en #555 y #888 fijos (1,82 en oscuro). Los tres tipos, como
  // secciones, y los dos estados del páncreas, como subestados
  { slug: 'visualizador-diabetes-mecanismo', secciones: "[role='tab']", subestados: "button[class*='toggleBtn']" },
  // Del censo del 08/11/2026 (C0297), reparada el 10/11/2026: rótulos sobre la tarjeta en rojo,
  // azul, ámbar y verde puros o en grises fijos (#374151 a 1,39:1 en oscuro, «Cátodo» #93C5FD a
  // 1,79 en claro), los iones con opacidad (2,50-3,70), y la cubeta y el electrolito translúcidos,
  // que en oscuro dejaban sus rótulos a 1,03-2,65. Descarga y carga, y las dos pestañas de la
  // electrólisis, como subestados
  {
    slug: 'visualizador-electroquimica',
    secciones: SECCIONES,
    extremos: true,
    subestados: "button[class*='bateriaBtn'], button[class*='electroTab']",
  },
  // Del censo del 08/11/2026 (C0297), reparada el 10/11/2026: átomos y enlaces en #333/#444 fijos
  // (1,07-1,79:1 en oscuro), rótulos en #666, #888 y #aaa (2,23-3,40 en claro, 2,37-3,03 en
  // oscuro) y el grupo funcional en su color puro (NH₂ 1,88, COO 2,04, CHO 2,46 en claro; C=O de
  // la cetona 2,42 en oscuro). Las cuatro pestañas, y los botones de cada una como subestados
  {
    slug: 'visualizador-quimica-organica',
    secciones: "[role='tablist'][aria-label*='ecciones'] [role='tab']",
    subestados: "section[class*='content'] button[aria-pressed]",
  },
  // Del censo del 08/11/2026 (C0297), reparada el 10/11/2026: rótulos sobre la tarjeta en #555 y
  // #666 fijos (1,93-3,03:1 en oscuro) o en el color puro de su dato (dominios, fases de la curva,
  // Gram, pilus: 1,47-4,24 en oscuro, 3,42-4,05 en claro), los de la bacteria apagados al 25 %
  // (1,30-1,53) y el blanco sobre bacterias y peptidoglicano translúcidos (2,24-3,82). Las cuatro
  // pestañas, y sus botones (partes, procesos, Gram) como subestados
  {
    slug: 'visualizador-microbiologia',
    secciones: SECCIONES,
    extremos: true,
    subestados: "section[aria-label] button[aria-pressed]",
  },
  // Del censo del 08/11/2026 (C0297), reparada el 10/11/2026: los rótulos de sus cinco diagramas en
  // el color puro de su dato (verde 2,46-2,87:1 y rojo 3,18-3,82 en claro sobre su tinte; violetas
  // 1,15-2,45 en oscuro), el blanco sobre la kinesina, el ovillo y el núcleo del cuerpo de Lewy
  // translúcidos (2,17-4,34) y la marca sobre el soma (2,49). Las dos enfermedades, y la vía
  // elegida y el estado del circuito como subestados
  {
    slug: 'visualizador-alzheimer-parkinson',
    secciones: "nav[aria-label*='nfermedad'] button",
    subestados: "button[aria-pressed]:not(nav button)",
  },
  // Del censo del 10/11/2026 (C0297): blanco sobre el componente activo en su color puro (la marca
  // 4,11:1, el diferencial 3,80, los magnetotérmicos en teal 2,77, la tierra en verde, el PIA en
  // naranja 2,17), «Luz, Ench., Cocina…» en #999 (2,64), el título con opacidad (3,33), «Fase» y
  // «Neutro» en marrón y azul sobre la tarjeta oscura (2,02 y 2,58) y el verde y el rojo como texto
  // (OK 2,58, Fuga 3,31, SALTA! 3,76). Las tarjetas del cuadro y los tres flujos, como subestados
  {
    slug: 'visualizador-electricidad-domestica',
    secciones: SECCIONES,
    subestados: "button[class*='componenteCard'], button[class*='animacionBtn']",
  },
  // Del censo del 10/11/2026 (C0297): blanco sobre las histonas y el octámero al 85 % (3,17:1),
  // sobre el violeta del metilo (4,3), sobre el naranja del grupo •CH₃ (2,17) y sobre el amarillo de
  // la marca Ac de las colas (1,4); #7d5a00 sobre el amarillo (3,55-3,86), #999 sobre el gris de la
  // citosina sin metilar (2,12), la marca y el teal sobre su tinte en el imprinting (2,5-3,6) y el
  // blanco sobre el gen apagado en #ddd. Los dos toggles, las cuatro marcas (botones nuevos) y los
  // dos alelos, como subestados
  { slug: 'visualizador-epigenetica', subestados: 'button[aria-pressed]' },
  // Del censo del 10/11/2026 (C0297): los rótulos de sus cinco gráficos, sobre la tarjeta, en el color
  // puro de su curva (la marca 4,11:1 en claro y 3,3 en oscuro, el teal 2,80, el naranja del
  // catalizador y del orden 2 2,9, el rojo del punto actual 3,8 y 3,6) y los ejes en #999 y #aaa
  // (2,85 y 2,32 en claro). Los ejemplos y el catalizador como subestados, y los deslizadores en
  // sus extremos
  { slug: 'visualizador-cinetica-quimica', extremos: true, subestados: 'button[aria-pressed]' },
  // Del censo del 10/11/2026 (C0297): los rótulos de la pila de combustible en la marca, el teal, el
  // ámbar y el verde puros sobre el tinte de su zona (en oscuro: ÁNODO 2,84:1, la membrana 1,19-1,69,
  // CÁTODO 3,96) y sobre la tarjeta («H₂ (comb.)» 3,31, «⚡ e⁻» 3,61), el rojo sobre el círculo
  // blanco del motor (3,73) y el gris de --text-muted sobre los tintes (3,99-4,20)
  { slug: 'visualizador-hidrogeno', subestados: 'button[aria-pressed]' },
  // Del censo del 10/11/2026 (C0297): los rótulos de cada régimen sobre el centro de su degradado
  // radial (en oscuro: Autocracia 1,07:1, Autoritarismo 1,01, Totalitarismo 1,16, Democracia liberal
  // 1,84-2,29; en claro la marca 2,23-2,81 y Monarquía 4,28), los ejes en #999 y #888 (2,82-3,83) y
  // la tipología aristotélica en #666 sobre su tinte en oscuro (2,26)
  { slug: 'visualizador-regimenes-politicos' },
  // Del censo del 10/11/2026 (C0297): el blanco de «Africana» sobre su placa naranja al 70 % (4,01:1),
  // «Manto» en rojo sobre su tinte en oscuro (2,13), «Magma», «Fosa» y «SUBDUCCIÓN» en rojo puro
  // (3,73-3,81), «DORSAL OCEÁNICA» en verde (2,26) y «FALLA TRANSFORMANTE» en ámbar (2,13). Las
  // placas y los tres bordes, como subestados
  {
    slug: 'visualizador-tectonica-placas',
    secciones: SECCIONES,
    subestados: "button[aria-pressed]:not(nav button)",
  },
  // Del censo del 10/11/2026 (C0297): blanco sobre las cajas de los diagramas del feedback y del eje
  // HPA en su color al 85 % (verde 2,45:1, naranja 2,42, la marca 3,16, rojo 3,21, violeta 3,56 en
  // claro; verde 3,59 y naranja 3,53 en oscuro) y «FEEDBACK NEGATIVO» y «Feedback (frena)» en
  // currentColor al 50 % (3,33 en claro, 4,10 en oscuro). Las glándulas, como subestados
  { slug: 'visualizador-sistema-endocrino', secciones: SECCIONES, extremos: true, subestados: "button[aria-pressed]:not(nav button)" },
  // Del censo del 10/11/2026 (C0297): los rótulos del gráfico de demanda en el color de su curva
  // (el teal de la oferta 2,78:1, la marca 4,07 y el rojo 3,79 en claro; 3,50-3,76 en oscuro) y el
  // blanco sobre las cajas de la espiral salarios-precios en su color al 90 % (el acento 2,07, el
  // teal 2,50, el verde del BCE 2,58 en claro). Las causas, como subestados
  { slug: 'visualizador-inflacion', secciones: SECCIONES, extremos: true, subestados: "button[aria-pressed]:not(nav button)" },
  // Del censo del 10/11/2026 (C0297): el blanco y el #ddd sobre la batería, el inversor y las cajas
  // del frenado regenerativo en la marca y el teal al 90 % (1,84-3,51:1 en claro, 1,93-3,18 en
  // oscuro), el blanco de las fases sobre sus bobinas al 85 % (1,98-3,16), las etiquetas U, V y W en
  // la marca, el teal y el acento puros (2,24-4,07) y la tracción en verde (2,08) y la regeneración
  // en rojo (3,79 en claro, 3,55 en oscuro)
  { slug: 'visualizador-motor-electrico', secciones: SECCIONES, extremos: true },
  // Del censo del 10/11/2026 (C0297): los rótulos de las gráficas en el color de su curva (el acento
  // de IM 2,17:1, el teal 2,68, la marca 3,93 y el rosa 3,75 en claro; la marca 3,31 y el rosa 3,47
  // en oscuro) y los ejes y los valores de equilibrio en #666 y #555 fijos (1,82-2,37 en oscuro).
  // Los deslizadores en sus extremos y las estructuras y estrategias como subestados
  { slug: 'visualizador-estructuras-mercado', secciones: SECCIONES, extremos: true, subestados: "button[aria-pressed]:not(nav button)" },
  // Del censo del 10/11/2026 (C0297): los rótulos del ciclo en el color puro de su dato, sobre su
  // reservorio teñido o sobre una placa blanca al 85 % (el amarillo 1,59-1,95:1, el agua 1,90-2,93,
  // el teal 2,07-2,78, el naranja 2,95 en claro), y en oscuro las franjas en pastel al 35-40 %, que
  // quedaban en un gris medio y dejaban encima todo a 1,03-2,11, y las placas blancas, con los
  // rótulos de proceso a 1,64-4,26. Los procesos, como subestados
  {
    slug: 'visualizador-ciclo-nitrogeno',
    secciones: "[role='tablist'][aria-label*='ecciones'] [role='tab']",
    extremos: true,
    subestados: 'button[aria-pressed]',
  },
  // Del censo del 10/11/2026 (C0297): las letras de los aminoácidos y las subunidades en el color de
  // su círculo sobre su propio tinte (el amarillo 1,54:1, el teal 2,45, el verde 2,46, el naranja
  // 2,49, la marca 3,47 en claro), los rótulos de la terciaria sobre sus tintes (2,25-3,49), los
  // grises #999 y #888 (2,82-3,24) y, en el embudo, «cadena desplegada», «intermedios» y «nativa»
  // sobre el degradado (2,19-2,58). Las cuatro pestañas de estructura
  { slug: 'visualizador-proteinas-plegamiento', secciones: "[role='tab']", extremos: true },
  // 13/11/2026: 5' y gRNA en la marca sobre el fondo claro fijo del diagrama (3,89:1), 3' en teal
  // (2,65), el blanco sobre el gRNA translúcido (3,51) y sobre el indicador de paso (4,11), y en los
  // pasos 2-6 el blanco sobre Cas9 y el indicador en el color de cada paso. Los seis pasos
  { slug: 'visualizador-crispr-cas9', subestados: "button[class*='pasoBtn']" },
  // 13/11/2026: los rótulos del corte del ojo en el color de su parte (el cristalino en #F1C40F
  // 1,59:1 y la luz en oro 1,39 en claro; el nervio óptico en morado 2,45 en oscuro), y en los
  // defectos los focos de color, «Corrección…» en la marca y el blanco sobre los conos al 80 %.
  // Las dos secciones con diagrama; cada parte del ojo y cada defecto abierto
  {
    slug: 'visualizador-ojo-humano-vision',
    secciones: "[role='tablist'] [role='tab']",
    subestados: "button[class*='parteCard'], button[class*='defectoCard']",
  },
  // 13/11/2026: «Selecciona un tipo de radiación» en #999 encima de los materiales (1,39:1), y los
  // rótulos de materiales, espesores y ejes en grises fijos, 1,8-2,5 en oscuro. Cada pestaña y cada
  // tipo de radiación (el rayo cambia lo que hay detrás)
  { slug: 'visualizador-radioactividad', secciones: SECCIONES, subestados: "button[aria-pressed]:not(nav button)" },
  // 13/11/2026: el centro del donut en el color del componente (el ámbar de la energía oscura 2,20:1
  // en claro) y «haz click» en #888 (3,51); en la historia, los eventos en #666 (3,03 en oscuro) y
  // el elegido, t=0 y 13.800 Ma en la marca (3,93 en claro); los ejes en #888, «hoy» en teal y
  // «Energía oscura domina» en ámbar al 80 %; las geometrías en su color (morado 1,51 en oscuro).
  // Cada componente, cada evento de la historia y cada geometría, como subestados
  {
    slug: 'visualizador-cosmologia',
    secciones: SECCIONES,
    extremos: true,
    subestados: "button[aria-pressed]:not(nav button), svg circle[role='button']",
  },
  // 13/11/2026: en claro, los títulos de las cajas de reparto y capitalización en la marca y el teal
  // puros sobre el tinte de su caja (2,53-3,75:1) y «flujo», «Sin fondo propio» e «invertido en
  // mercados» en #888 (3,21-3,51). En oscuro ya mandaba #E5E5E5. Los dos modelos, como secciones
  { slug: 'visualizador-sistema-pensiones', secciones: "[role='tablist'] [role='tab']", extremos: true },
  // 13/11/2026: sobre los mapas, claros en los dos temas, «~1.000 años por circuito» en la marca
  // (3,92:1), «Corriente del Golfo» en #c0390a (4,01), las latitudes en #666 (4,20) y el aviso «Sin
  // corriente» en #c0392b sobre su tinte (3,27). Los escenarios del AMOC y del Golfo, como subestados
  { slug: 'visualizador-oceanos-corrientes', secciones: SECCIONES, extremos: true, subestados: "button[aria-pressed]:not(nav button)" },
  // 13/11/2026: en el ciclo de las rocas, cada tipo en su color sobre el tinte de su nodo (el ámbar
  // de las sedimentarias 2,78:1 y el rojo de las ígneas 3,08-3,92 en claro; el violeta de las
  // metamórficas 2,27 y el rojo 2,72 en oscuro), los procesos en la marca (4,07 y 3,50) y los atajos
  // en #999 (2,82). Los procesos, como subestados
  { slug: 'visualizador-tipos-rocas', secciones: SECCIONES, subestados: "button[aria-pressed]:not(nav button)" },
  // 13/11/2026: el rótulo de cada tiempo del ciclo Otto en su color (el teal del escape 2,78:1 y el
  // ámbar 3,16 en claro, el rojo 2,81 en oscuro), las válvulas en #6B7280 (2,81 en oscuro) y, en el
  // diagrama de pérdidas, el blanco sobre la marca (4,11), el verde (3,33) y el naranja (2,85), y
  // «Otto 4T» en #9CA3AF sobre el motor (4,02). Los cuatro tiempos, como subestados
  { slug: 'visualizador-motor-combustion', secciones: SECCIONES, extremos: true, subestados: "button[aria-pressed]:not(nav button)" },
  // 13/11/2026: los rótulos del diagrama de nubes en blanco directamente sobre el degradado del cielo
  // y sobre las nubes (Stratus 1,42:1, «Suelo» 1,35, Altostratus 1,96, Cirrostratus 3,75), igual en
  // los dos temas. Cada nube, como subestado
  { slug: 'visualizador-fenomenos-meteorologicos', secciones: SECCIONES, subestados: "button[aria-pressed]:not(nav button)" },
  // 13/11/2026: el blanco sobre las cámaras del corazón en su color al 85 % (el ámbar 1,91:1, el
  // verde 2,03, el azul 2,95, el rojo 3,13) y sobre el nodo elegido del árbol en la marca (4,11).
  // Cada clase y cada filo, como subestados
  { slug: 'visualizador-reino-animal', secciones: SECCIONES, subestados: "button[aria-pressed]:not(nav button)" },
  // 13/11/2026: las cifras de las barras, las curvas de SNR, «Tú», los bits de las aristas del árbol
  // y los tamaños de la compresión en el color puro de su dato (el ámbar 2,06:1, el teal 2,58-2,78,
  // el rojo 3,73 y la marca 4,07 en claro; la marca 3,50 y el rojo 3,81 en oscuro), los ejes en
  // #999 (2,62-2,82) y los nombres en #666 (2,50 en oscuro), el blanco sobre las hojas de Huffman en
  // la marca (4,11) y, con una barra alta, su cifra encima de la propia barra (1,24-1,37)
  { slug: 'visualizador-teoria-informacion', secciones: SECCIONES, extremos: true },
  // 13/11/2026: los ejes de sus cuatro gráficos en #999 (2,64:1 sobre el fondo del gráfico en claro),
  // la D de la demanda en rojo puro (3,54 en claro, 3,36 en oscuro), O y P₂ en la marca (3,80 y
  // 3,12) y la E del equilibrio en teal (2,59). Los botones de elasticidad y estructura, como subestados
  { slug: 'visualizador-microeconomia', extremos: true, subestados: 'button[aria-pressed]' },
  // 13/11/2026: los ejes de sus cinco gráficos en #888 (3,40:1 en claro, 4,49 en oscuro) y Tamb y τ en
  // teal puro (2,68 en claro). Las cuatro pestañas, y Newton y RC como subestados
  {
    slug: 'visualizador-ecuaciones-diferenciales',
    secciones: "[role='tablist'][aria-label*='ecciones'] [role='tab']",
    extremos: true,
    subestados: "[role='tablist'][aria-label='Aplicaciones'] [role='tab']",
  },
  // 13/11/2026: los rótulos de los árboles filogenéticos en la marca pura (4,07:1 en claro, 3,50 en
  // oscuro), en teal (2,78), el pie en #999 (2,82) y las especies lejanas en #666 (2,50 en oscuro).
  // Los conjuntos de especies, como subestados (cada uno dibuja su árbol)
  { slug: 'visualizador-evolucion-molecular', secciones: SECCIONES, extremos: true, subestados: "button[class*='conjuntoBtn']" },
  // 13/11/2026: en claro, z₁ en la marca pura (4,07:1), z₂ y cos en teal (2,78), el resultado y sin
  // en naranja E67E22 (2,82), Re e Im en #888 (3,51) y las marcas de los ejes en #aaa y #bbb
  // (1,90-2,30). Las cuatro operaciones, como subestados, y los deslizadores en sus extremos
  { slug: 'visualizador-numeros-complejos', extremos: true, subestados: 'button[aria-pressed]' },
  // 13/11/2026: los rótulos de la neurona en el color de su parte (Dendritas en verde 2,85:1, la
  // mielina en ámbar 2,17, el terminal en teal 2,78, Ranvier en rojo 3,79 y el axón en la marca 4,07
  // en claro; 3,50-3,76 en oscuro), «Soma» en blanco sobre su violeta al 85 % (4,40) y, en el
  // potencial de acción, umbral, Despol., Repol. y Refract. en su color (2,17-3,79). Las partes de la
  // neurona, como subestados
  { slug: 'visualizador-sistema-nervioso', secciones: SECCIONES, subestados: "button[aria-pressed]:not(nav button)" },
  // 13/11/2026: el blanco sobre el estado activo del diagrama (NUEVO en teal, 2,77:1) y sobre los
  // bloques del Gantt en el color de cada proceso (el ámbar 2,04, el acento 2,29, el teal 2,77, la
  // marca 4,11), las transiciones y los tiempos en #666 (2,37 en oscuro), los ejes de page faults en
  // #999 (2,82) y cada curva en su color (FIFO 2,06, LRU 2,78, OPT 4,07 en claro y 3,31 en oscuro)
  {
    slug: 'visualizador-sistemas-operativos',
    secciones: "[role='tablist'][aria-label*='ecciones'] [role='tab']",
    extremos: true,
    subestados: "button[class*='btnTransicion']",
  },
  // 13/11/2026: en el routing BGP, AS 1, AS 2 y AS 3 en su color sobre el tinte de su sistema (la
  // marca 3,78:1, el teal 2,64, el acento 2,05), los costes en naranja F4A261 (1,90-2,04) y #999
  // (2,62), el blanco sobre los routers del camino (2,05) y del teal (2,77), y «Origen» y «Destino» en
  // #555 (1,73 en oscuro); en la CDN, el blanco sobre los nodos rojos (3,80) y naranjas (2,05) y
  // «España» en #ddd sobre la marca (3,03)
  { slug: 'visualizador-redes-computadoras', secciones: SECCIONES, extremos: true },
  // 13/11/2026: el blanco sobre el oro del núcleo interno (1,45:1) y sobre el manto (3,61); la Onda P
  // en la marca (3,93), la S en teal sobre el tinte del manto (1,88), «Se detiene» en rojo sobre el
  // del núcleo (1,57), «Zona de sombra» en --text-muted (3,43), el viento solar en ámbar (2,06) y
  // las auroras en teal (2,46) en claro; en oscuro, la Onda P 4,24 y la S 4,10
  { slug: 'visualizador-capas-tierra', secciones: SECCIONES, subestados: "button[aria-pressed]:not(nav button)" },
  // 13/11/2026: el blanco de los rótulos del hígado sobre las zonas no elegidas en pastel al 85-90 %
  // (la vesícula 1,59-1,85:1, la arteria 1,73-2,14, el lóbulo izquierdo 2,02-2,83, el caudado 2,28-2,57,
  // la vena porta 2,21-2,79) y sobre el rojo elegido al 85 % (4,25). Cada zona, como subestado
  { slug: 'visualizador-higado', secciones: SECCIONES, subestados: "button[aria-pressed]:not(nav button)" },
  // 13/11/2026: los rótulos del sarcómero y de la palanca en el color puro de su dato (Línea Z y
  // Fuerza en la marca 4,07:1 en claro y 3,50 en oscuro, Banda I en teal 2,78, Banda H, Línea M y
  // Fulcro en rojo 3,79 y 3,76, Banda A en violeta 2,45 en oscuro, Carga sobre su tinte 4,40 y 2,13)
  // y «(bíceps)» encima de la punta de la flecha (4,23 y 3,26)
  { slug: 'visualizador-musculos-movimiento', secciones: SECCIONES },
];

interface TextoSvg {
  texto: string;
  fill: number[];
  /** Caja relativa al SVG, en px CSS */
  x: number;
  y: number;
  w: number;
  h: number;
  px: number;
  negrita: boolean;
}

/** Los `<text>` visibles de cada SVG visible, con su color y su caja; marca cada SVG con un índice. */
async function textosDeSvgs(page: Page): Promise<TextoSvg[][]> {
  return page.evaluate(() => {
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
    const salida: TextoSvg[][] = [];
    const svgs = Array.from(document.querySelectorAll('svg')).filter((s) => {
      const r = s.getBoundingClientRect();
      return r.width > 40 && r.height > 40 && s.querySelector('text') && getComputedStyle(s).visibility !== 'hidden';
    });
    svgs.forEach((svg, i) => {
      svg.setAttribute('data-svg-medido', String(i));
      const caja = svg.getBoundingClientRect();
      const lista: TextoSvg[] = [];
      for (const t of Array.from(svg.querySelectorAll('text'))) {
        const cs = getComputedStyle(t);
        if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
        if (cs.fill.startsWith('url(') || cs.fill === 'none') continue;
        const contenido = (t.textContent ?? '').trim();
        // Un emoji suelto se pinta con sus propios colores, no con el fill
        if (!contenido || /^[\p{Extended_Pictographic}️‍\s]+$/u.test(contenido)) continue;
        const r = t.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        const fill = norm(cs.fill);
        fill[3] *= +cs.fillOpacity * +cs.opacity;
        const escala = (t.getScreenCTM()?.a ?? 1);
        lista.push({
          texto: contenido.slice(0, 40),
          fill,
          x: r.left - caja.left,
          y: r.top - caja.top,
          w: r.width,
          h: r.height,
          px: parseFloat(cs.fontSize) * escala,
          negrita: +cs.fontWeight >= 700 || cs.fontWeight === 'bold',
        });
      }
      salida.push(lista);
    });
    return salida;
  });
}

/** Mide los SVG visibles ahora mismo y devuelve los textos por debajo de su umbral. */
async function suspensos(page: Page): Promise<string[]> {
  const porSvg = await textosDeSvgs(page);
  const fuera: string[] = [];
  const oculto = await page.addStyleTag({ content: '[data-svg-medido] text { visibility: hidden !important; }' });
  for (let i = 0; i < porSvg.length; i++) {
    if (!porSvg[i].length) continue;
    const svg = page.locator(`[data-svg-medido="${i}"]`);
    const png = await svg.screenshot({ animations: 'disabled' }).catch(() => null);
    if (!png) continue;
    const malos = await page.evaluate(
      async ({ b64, textos, indice }) => {
        const img = new Image();
        img.src = `data:image/png;base64,${b64}`;
        await img.decode();
        const lienzo = document.createElement('canvas');
        lienzo.width = img.width;
        lienzo.height = img.height;
        const c = lienzo.getContext('2d', { willReadFrequently: true })!;
        c.drawImage(img, 0, 0);
        const svgEl = document.querySelector(`[data-svg-medido="${indice}"]`);
        const anchoCss = (svgEl?.getBoundingClientRect().width ?? img.width) || img.width;
        const k = img.width / anchoCss;
        const can = (v: number) => {
          const s = v / 255;
          return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        };
        const lum = (p: number[]) => 0.2126 * can(p[0]) + 0.7152 * can(p[1]) + 0.0722 * can(p[2]);
        const ratio = (a: number[], b: number[]) => {
          const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
          return (x + 0.05) / (y + 0.05);
        };
        const res: string[] = [];
        for (const t of textos) {
          const x0 = Math.max(0, Math.floor(t.x * k));
          const y0 = Math.max(0, Math.floor(t.y * k));
          const w = Math.min(img.width - x0, Math.ceil(t.w * k));
          const h = Math.min(img.height - y0, Math.ceil(t.h * k));
          if (w < 1 || h < 1) continue;
          const d = c.getImageData(x0, y0, w, h).data;
          const cuenta = new Map<string, number>();
          for (let p = 0; p < d.length; p += 4) {
            const clave = `${d[p] >> 2},${d[p + 1] >> 2},${d[p + 2] >> 2}`;
            cuenta.set(clave, (cuenta.get(clave) ?? 0) + 1);
          }
          const [moda] = [...cuenta.entries()].sort((a, b) => b[1] - a[1])[0];
          const fondo = moda.split(',').map((v) => +v * 4 + 2);
          const a = t.fill[3];
          const tinta = [0, 1, 2].map((i) => t.fill[i] * a + fondo[i] * (1 - a));
          const umbral = t.px >= 24 || (t.px >= 18.66 && t.negrita) ? 3 : 4.5;
          const v = ratio(tinta, fondo);
          if (v < umbral) {
            res.push(`«${t.texto}» rgb(${tinta.map(Math.round)}) sobre rgb(${fondo}) a ${t.px.toFixed(1)} px: ${v.toFixed(2)}:1`);
          }
        }
        return res;
      },
      { b64: png.toString('base64'), textos: porSvg[i], indice: i },
    );
    fuera.push(...malos.map((m) => `svg ${i + 1}: ${m}`));
  }
  await oculto.evaluate((n) => (n as Element).remove());
  await page.evaluate(() => document.querySelectorAll('[data-svg-medido]').forEach((s) => s.removeAttribute('data-svg-medido')));
  return Array.from(new Set(fuera));
}

/**
 * Formas con un `fill` que el navegador no entiende y pinta en NEGRO: visualizador-arquitectura-
 * computador le pegaba el alfa a '#666' y salía '#666CC' (cabo C0297, 08/11/2026).
 */
async function rellenosInvalidos(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const malos: string[] = [];
    for (const f of Array.from(document.querySelectorAll('svg [fill]'))) {
      const v = (f.getAttribute('fill') ?? '').trim();
      if (!v || /^(none|currentColor|url\(|var\(|transparent|inherit)/i.test(v)) continue;
      if (!CSS.supports('color', v)) malos.push(`<${f.tagName.toLowerCase()} fill="${v}">`);
    }
    return Array.from(new Set(malos));
  });
}

async function medirAqui(page: Page, etiqueta: string, extremos: boolean): Promise<string[]> {
  const todo = [
    ...(await suspensos(page)).map((s) => `${etiqueta}: ${s}`),
    ...(await rellenosInvalidos(page)).map((s) => `${etiqueta}: relleno inválido ${s}`),
  ];
  if (!extremos) return todo;
  const deslizadores = page.locator('input[type="range"]:visible');
  const n = await deslizadores.count();
  for (let i = 0; i < n; i++) {
    for (const tecla of ['End', 'Home'] as const) {
      await deslizadores.nth(i).press(tecla);
      todo.push(...(await suspensos(page)).map((s) => `${etiqueta}, deslizador ${i + 1} en ${tecla}: ${s}`));
    }
  }
  return todo;
}

/**
 * Suelta el recorte de los contenedores con scroll que envuelven un SVG con texto, para que la foto
 * traiga el SVG entero y no blanco donde el contenedor lo corta (ver `ancho` en App).
 */
async function soltarScroll(page: Page): Promise<void> {
  await page.evaluate(() => {
    for (const svg of Array.from(document.querySelectorAll('svg'))) {
      if (!svg.querySelector('text')) continue;
      for (let p = svg.parentElement; p && p !== document.body; p = p.parentElement) {
        if (getComputedStyle(p).overflowX !== 'visible') p.style.overflow = 'visible';
      }
    }
  });
}

/** Mide la sección tal cual y, si tiene `subestados` visibles, cada uno de ellos. */
async function medirConSubestados(page: Page, donde: string, extremos: boolean, subestados?: string): Promise<string[]> {
  const todo = await medirAqui(page, donde, extremos);
  if (!subestados) return todo;
  const subs = page.locator(`${subestados}:visible`);
  const m = await subs.count();
  for (let j = 0; j < m; j++) {
    await subs.nth(j).click();
    todo.push(...(await medirAqui(page, `${donde}, subestado ${j + 1}`, extremos)));
  }
  return todo;
}

async function recorrer(page: Page, secciones?: string, extremos = false, soltar = false, subestados?: string): Promise<string[]> {
  const todo: string[] = [];
  const botones = secciones ? page.locator(secciones) : null;
  const n = botones ? await botones.count() : 0;
  await desplegarTodo(page);
  if (soltar) await soltarScroll(page);
  if (!n) return medirConSubestados(page, 'carga', extremos, subestados);
  for (let i = 0; i < n; i++) {
    await botones!.nth(i).click();
    await desplegarTodo(page);
    if (soltar) await soltarScroll(page);
    todo.push(...(await medirConSubestados(page, `sección ${i + 1}`, extremos, subestados)));
  }
  return Array.from(new Set(todo));
}

for (const { slug, secciones, extremos, ancho, subestados } of APPS) {
  test(`${slug}: el texto de sus SVG se lee contra lo que tiene detrás, en claro y en oscuro (C0297)`, async ({ page }) => {
    test.setTimeout(120_000);
    if (ancho) await page.setViewportSize({ width: ancho, height: 900 });
    await page.goto(`/${slug}/`);
    await prepararParaMedir(page);
    if (secciones) await expect(page.locator(secciones).first()).toBeVisible();
    expect.soft(await recorrer(page, secciones, extremos, Boolean(ancho), subestados), 'claro').toEqual([]);
    await activarTemaOscuro(page);
    expect.soft(await recorrer(page, secciones, extremos, Boolean(ancho), subestados), 'oscuro').toEqual([]);
  });
}
