'use client';
// @disclaimer: exempt
import { useState, useMemo } from 'react';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection } from '@/components';
import ShareCard from '@/components/ShareCard';
import { getRelatedApps } from '@/data/app-relations';
import styles from './GuiaPlantasInterior.module.css';

// ==============================
// TIPOS
// ==============================

type NivelLuz = 'Plena luz' | 'Luz indirecta' | 'Semisombra' | 'Sombra';
type Dificultad = 'Muy fácil' | 'Fácil' | 'Moderada' | 'Difícil';
type FrecuenciaRiego = 'Semanal' | 'Cada 10 días' | 'Quincenal' | 'Mensual' | 'Mínimo';
type ToxicidadMascotas = 'No tóxica' | 'Tóxica leve' | 'Tóxica moderada' | 'Muy tóxica';

interface PlantaInterior {
  nombre: string;
  nombreCientifico: string;
  origen: string;
  luz: NivelLuz;
  riego: FrecuenciaRiego;
  humedad: 'Baja' | 'Media' | 'Alta';
  temperatura: string;
  dificultad: Dificultad;
  toxicidadMascotas: ToxicidadMascotas;
  tamano: string;
  beneficios: string[];
  cuidados: string;
  descripcion: string;
  curiosidad: string;
}

// ==============================
// DATOS
// ==============================

const PLANTAS: PlantaInterior[] = [
  { nombre: 'Pothos', nombreCientifico: 'Epipremnum aureum', origen: 'Islas Salomón', luz: 'Luz indirecta', riego: 'Semanal', humedad: 'Media', temperatura: '15–30 °C', dificultad: 'Muy fácil', toxicidadMascotas: 'Tóxica moderada', tamano: '1–3 m (trepadora)', beneficios: ['Purifica el aire', 'Elimina formaldehído', 'Resistente a descuidos'], cuidados: 'Tolera el olvido de riego. Evitar sol directo que quema las hojas.', descripcion: 'Una de las plantas de interior más populares del mundo por su facilidad de cultivo. Sus hojas verde brillante con marcas amarillas son inconfundibles. Crece en prácticamente cualquier condición de luz y sobrevive sin riego varios días. Ideal para principiantes o espacios de oficina.', curiosidad: 'El pothos puede sobrevivir en agua indefinidamente, sin tierra. Basta con mantener el tallo en un vaso de agua con algo de fertilizante líquido diluido. Es también una de las plantas con mayor capacidad probada para filtrar toxinas del aire interior.' },
  { nombre: 'Monstera', nombreCientifico: 'Monstera deliciosa', origen: 'México y América Central', luz: 'Luz indirecta', riego: 'Cada 10 días', humedad: 'Media', temperatura: '18–27 °C', dificultad: 'Fácil', toxicidadMascotas: 'Tóxica moderada', tamano: '60–180 cm', beneficios: ['Purifica el aire', 'Efecto decorativo potente', 'Crecimiento vistoso'], cuidados: 'Limpiar las hojas con paño húmedo. Necesita tutor para crecer erguida.', descripcion: 'Icono del diseño de interiores contemporáneo. Sus enormes hojas perforadas le dan un aspecto tropical inconfundible. Crece con rapidez en condiciones de luz indirecta brillante y agradece riegos moderados. Es tolerante a cierta negligencia pero detesta el encharcamiento.', curiosidad: 'Los agujeros y cortes en las hojas de la monstera no son decorativos al azar: evolucionaron para resistir el viento y permitir que la luz llegue a las hojas inferiores en la selva. El fruto de la monstera en estado silvestre es comestible y tiene sabor a piña.' },
  { nombre: 'Sansevieria', nombreCientifico: 'Dracaena trifasciata', origen: 'África Occidental', luz: 'Semisombra', riego: 'Mensual', humedad: 'Baja', temperatura: '15–35 °C', dificultad: 'Muy fácil', toxicidadMascotas: 'Tóxica leve', tamano: '30–120 cm', beneficios: ['Purifica el aire', 'Produce O₂ de noche', 'Muy resistente'], cuidados: 'El exceso de agua es su principal enemigo. Regar muy poco en invierno.', descripcion: 'Conocida popularmente como "lengua de suegra" o "espada de San Jorge". Es una de las plantas más resistentes que existen: tolera la sequía, la escasa luz y el descuido total. La NASA la identificó como una de las mejores plantas purificadoras de aire en espacios cerrados.', curiosidad: 'A diferencia de la mayoría de plantas, la sansevieria realiza la fotosíntesis de noche (metabolismo CAM), lo que la convierte en una opción ideal para dormitorios: libera oxígeno mientras dormimos.' },
  { nombre: 'Aloe vera', nombreCientifico: 'Aloe barbadensis', origen: 'Península Arábiga', luz: 'Plena luz', riego: 'Mensual', humedad: 'Baja', temperatura: '18–28 °C', dificultad: 'Muy fácil', toxicidadMascotas: 'Tóxica leve', tamano: '30–60 cm', beneficios: ['Gel medicinal', 'Purifica el aire', 'Bajo mantenimiento'], cuidados: 'Sustrato muy drenante (arena + tierra). Nunca encharcada.', descripcion: 'Planta suculenta con gel interior de múltiples usos: calmante para quemaduras leves, hidratante y cicatrizante. Requiere mucha luz y muy poco riego. En verano agradece el exterior. Una de las pocas plantas con reconocidos usos cosméticos y medicinales verificados.', curiosidad: 'El aloe vera lleva más de 6.000 años siendo usado por los humanos. Aparece documentado en tablillas sumerias, papiros egipcios y en el libro de Marco Polo. Cleopatra supuestamente lo usaba en su rutina de belleza diaria.' },
  { nombre: 'Ficus lyrata', nombreCientifico: 'Ficus lyrata', origen: 'África Tropical Occidental', luz: 'Luz indirecta', riego: 'Cada 10 días', humedad: 'Media', temperatura: '16–24 °C', dificultad: 'Moderada', toxicidadMascotas: 'Tóxica moderada', tamano: '100–200 cm', beneficios: ['Efecto árbol en interior', 'Purifica el aire', 'Tendencia decorativa'], cuidados: 'Odia los cambios de lugar. Una vez colocado, no moverlo. Pierde hojas al cambiar de ambiente.', descripcion: 'El árbol favorito del diseño de interiores actual. Sus enormes hojas en forma de violín le dan un porte imponente. Requiere cuidados más específicos que otras ficus: no tolera corrientes de aire, cambios de temperatura ni cambios de ubicación frecuentes.', curiosidad: 'En la naturaleza, el ficus lyrata puede alcanzar 12 metros de altura. Es una planta de selva tropical acostumbrada a competir por la luz, lo que explica su crecimiento agresivo hacia arriba y su intolerancia a las sombras prolongadas.' },
  { nombre: 'Pothos Neon', nombreCientifico: 'Epipremnum aureum Neon', origen: 'Islas Salomón (cultivar)', luz: 'Luz indirecta', riego: 'Semanal', humedad: 'Media', temperatura: '15–30 °C', dificultad: 'Muy fácil', toxicidadMascotas: 'Tóxica moderada', tamano: '1–2 m (trepadora)', beneficios: ['Color llamativo', 'Muy resistente', 'Fácil propagación'], cuidados: 'El color neón se mantiene mejor con luz indirecta brillante. En poca luz, las hojas verdean.', descripcion: 'Variedad de pothos con hojas de un amarillo-verde neón intenso que aporta un toque de color vibrante a cualquier espacio. Tan fácil de cuidar como el pothos estándar pero con un aspecto más llamativo. Perfecta para estanterías y columnas.', curiosidad: 'El color neón de sus hojas no es clorofila extra, sino que se debe a la distribución desigual de pigmentos. Las plantas con hojas más amarillas tienen algo menos de clorofila, pero compensan con superficies foliares más grandes.' },
  { nombre: 'Calathea orbifolia', nombreCientifico: 'Goeppertia orbifolia', origen: 'Bolivia', luz: 'Semisombra', riego: 'Semanal', humedad: 'Alta', temperatura: '18–24 °C', dificultad: 'Difícil', toxicidadMascotas: 'No tóxica', tamano: '30–60 cm', beneficios: ['Apta para mascotas', 'Hojas decorativas únicas', 'Planta de sombra'], cuidados: 'Usar agua sin cloro (reposada o filtrada). Alta humedad: pulverizar frecuentemente o usar bandeja con grava y agua.', descripcion: 'La reina de las plantas de hoja decorativa. Sus hojas grandes con rayas plateadas son extraordinariamente elegantes. Es difícil de cuidar: exige agua sin cloro, alta humedad y temperatura estable. Pero es completamente segura para gatos y perros.', curiosidad: 'Las calatheas son conocidas como "plantas que rezan" porque sus hojas se mueven durante el día siguiendo un ritmo circadiano: se abren de día y se cierran de noche, un movimiento llamado nictinastia que pueden producir hasta un sonido audible.' },
  { nombre: 'Zamioculca', nombreCientifico: 'Zamioculcas zamiifolia', origen: 'África Oriental', luz: 'Semisombra', riego: 'Mensual', humedad: 'Baja', temperatura: '15–26 °C', dificultad: 'Muy fácil', toxicidadMascotas: 'Tóxica moderada', tamano: '60–100 cm', beneficios: ['Muy resistente', 'Tolera la oscuridad', 'Bajo mantenimiento'], cuidados: 'Almacena agua en sus raíces tipo bulbo. Regar muy poco. Tolera semanas sin agua.', descripcion: 'Una de las plantas más robustas para interiores con poca luz. Sus hojas cerosas y brillantes le dan un aspecto siempre impecable. Perfecta para pasillos o baños sin ventana. Sus rizomas actúan como reserva de agua, permitiéndole sobrevivir al olvido total.', curiosidad: 'La zamioculca era prácticamente desconocida fuera de África hasta 1996, cuando los cultivadores holandeses empezaron a comercializarla en masa. En menos de 10 años se convirtió en una de las 5 plantas de interior más vendidas en Europa.' },
  { nombre: 'Planta araña', nombreCientifico: 'Chlorophytum comosum', origen: 'Sudáfrica', luz: 'Luz indirecta', riego: 'Semanal', humedad: 'Media', temperatura: '13–27 °C', dificultad: 'Muy fácil', toxicidadMascotas: 'No tóxica', tamano: '30–60 cm + colgantes', beneficios: ['Apta para mascotas', 'Purifica el aire', 'Fácil propagación'], cuidados: 'Produce estolones (plantitas colgantes) que se pueden enraizar fácilmente.', descripcion: 'Planta clásica de interior con hojas verdes y blancas en arco. Sus estolones colgantes con plantitas en la punta le dan un aspecto muy decorativo en macetas colgantes. Completamente segura para mascotas y una de las mejores purificadoras de monóxido de carbono.', curiosidad: 'Según el estudio de la NASA sobre purificación de aire, la planta araña fue capaz de eliminar el 95% del monóxido de carbono de una cámara sellada en 24 horas. Es una de las pocas plantas efectivas contra este gas inodoro e incoloro.' },
  { nombre: 'Suculenta Echeveria', nombreCientifico: 'Echeveria spp.', origen: 'México y América Central', luz: 'Plena luz', riego: 'Cada 10 días', humedad: 'Baja', temperatura: '10–30 °C', dificultad: 'Fácil', toxicidadMascotas: 'No tóxica', tamano: '5–20 cm', beneficios: ['Apta para mascotas', 'Decorativa', 'Bajo mantenimiento'], cuidados: 'Necesita al menos 6 horas de luz directa. Sin ella, pierde la roseta compacta y "etioliza" (se alarga fea).', descripcion: 'Las echeverias son las suculentas "roseta" más populares. Sus formas geométricas perfectas en tonos verdes, azulados, rosados o rojos son irresistibles. Necesitan mucha luz para mantener su forma compacta. Perfectas en alféizares soleados.', curiosidad: 'El género Echeveria lleva el nombre del botánico y artista mexicano Atanasio Echeverría, que ilustró la Flora Mexicana en el siglo XVIII. Muchas de sus ilustraciones fueron tan precisas que siguen siendo referencias taxonómicas hoy.' },
  { nombre: 'Helecho de Boston', nombreCientifico: 'Nephrolepis exaltata', origen: 'América Tropical', luz: 'Luz indirecta', riego: 'Semanal', humedad: 'Alta', temperatura: '16–24 °C', dificultad: 'Moderada', toxicidadMascotas: 'No tóxica', tamano: '40–80 cm', beneficios: ['Apta para mascotas', 'Humidificador natural', 'Purifica el aire'], cuidados: 'Alta humedad imprescindible. Pulverizar las frondas diariamente o colocar en baño con buena luz.', descripcion: 'El helecho más popular para interiores. Sus largas frondas arqueadas y brillantes crean una cascada de vegetación perfecta para estanterías o macetas colgantes. Requiere humedad constante —ideal para cuartos de baño o cocinas con luz— y es completamente inofensivo para mascotas.', curiosidad: 'Los helechos son plantas sin flores que llevan más de 360 millones de años en la Tierra, mucho antes que los dinosaurios. Se reproducen por esporas, visibles como pequeños puntos marrones en el reverso de las frondas.' },
  { nombre: 'Crotón', nombreCientifico: 'Codiaeum variegatum', origen: 'Asia tropical y Pacífico', luz: 'Plena luz', riego: 'Semanal', humedad: 'Media', temperatura: '18–27 °C', dificultad: 'Moderada', toxicidadMascotas: 'Tóxica moderada', tamano: '60–150 cm', beneficios: ['Colores espectaculares', 'Gran decorativo', 'Variedad de formas'], cuidados: 'Necesita mucha luz para mantener sus colores. Sin sol, las hojas se vuelven verdes.', descripcion: 'Ninguna planta iguala al crotón en variedad de colores: hojas rojas, amarillas, verdes, naranjas, púrpuras y multicolores en una misma planta. Requiere luz brillante para mantener sus colores intensos. Es dramático y exuberante, perfecto como punto focal decorativo.', curiosidad: 'Los colores del crotón son producidos por antocianinas y carotenoides, los mismos pigmentos que dan color a las frutas y a las hojas otoñales. Con poca luz, la planta prioriza la producción de clorofila (verde) sobre estos pigmentos secundarios.' },
  { nombre: 'Filodendro corazón', nombreCientifico: 'Philodendron hederaceum', origen: 'América tropical', luz: 'Luz indirecta', riego: 'Semanal', humedad: 'Media', temperatura: '16–26 °C', dificultad: 'Muy fácil', toxicidadMascotas: 'Tóxica moderada', tamano: '1–3 m (trepadora)', beneficios: ['Crece rápido', 'Tolera descuidos', 'Muy decorativo'], cuidados: 'Fácil de propagar en agua. Pinzar los brotes para que ramifique más.', descripcion: 'El filodendro trepador de hojas en corazón es una planta enérgica y agradecida. Crece con rapidez en una amplia variedad de condiciones lumínicas y tolera el descuido mejor que la mayoría. Se distingue del pothos por sus hojas más mates y de verde más intenso.', curiosidad: 'Los filodendros son nativos de los bosques tropicales de América, donde trepan por los troncos de los árboles usando raíces aéreas. En interiores, esa misma tendencia los hace perfectos para crecer en espalderas, estanterías o tutores de musgo.' },
  { nombre: 'Lengua de tigre variegada', nombreCientifico: 'Dracaena trifasciata "Laurentii"', origen: 'África (cultivar)', luz: 'Semisombra', riego: 'Mensual', humedad: 'Baja', temperatura: '15–30 °C', dificultad: 'Muy fácil', toxicidadMascotas: 'Tóxica leve', tamano: '60–90 cm', beneficios: ['Borde dorado decorativo', 'Produce O₂ de noche', 'Muy resistente'], cuidados: 'El borde amarillo se pierde si se propaga por hoja (hay que propagar por división de rizomas).', descripcion: 'La variedad más popular de sansevieria, con un borde dorado que añade elegancia a las hojas verdes con motivo de tigre. Igual de resistente que la especie base pero con un punto estético extra. Perfecta para dormitorios por su producción nocturna de oxígeno.', curiosidad: 'La variante amarilla del borde no se transmite genéticamente por semilla ni por corte de hoja, solo por división del rizoma. Si cortas una hoja para propagar, obtendrás la variedad base sin borde dorado.' },
  { nombre: 'Begonia rex', nombreCientifico: 'Begonia rex-cultorum', origen: 'Assam, India (cultivares)', luz: 'Luz indirecta', riego: 'Cada 10 días', humedad: 'Media', temperatura: '18–25 °C', dificultad: 'Moderada', toxicidadMascotas: 'Tóxica leve', tamano: '30–50 cm', beneficios: ['Hojas ornamentales únicas', 'Gran variedad de colores', 'Compacta'], cuidados: 'No pulverizar las hojas directamente: se manchan. Regar por la base.', descripcion: 'Las begonias rex son famosas por sus hojas increíblemente decorativas: plateadas, rojas, verdes, rosadas, con espirales y patrones metálicos. Su follaje supera en espectacularidad a sus modestas flores. Requieren humedad media pero sin mojar el follaje.', curiosidad: 'El nombre Begonia honra a Michel Bégon, gobernador de Saint-Domingue (actual Haití) y mecenas de la botánica en el siglo XVII. El género Begonia es uno de los más grandes del reino vegetal, con más de 2.000 especies.' },
  { nombre: 'Cactus de Navidad', nombreCientifico: 'Schlumbergera bridgesii', origen: 'Brasil', luz: 'Luz indirecta', riego: 'Cada 10 días', humedad: 'Media', temperatura: '15–24 °C', dificultad: 'Fácil', toxicidadMascotas: 'No tóxica', tamano: '30–50 cm', beneficios: ['Floración espectacular', 'Apta para mascotas', 'Planta de larga vida'], cuidados: 'Para florecer necesita noches largas y frías en otoño. Reducir el riego en septiembre-octubre.', descripcion: 'No es un cactus del desierto sino de la selva tropical brasileña. Florece espectacularmente en invierno con flores tubulares en rojo, rosa, blanco o salmón. Puede vivir décadas y se convierte en una planta familiar. Las flores duran varias semanas.', curiosidad: 'Los schlumbergeras se heredan de generación en generación: hay ejemplares documentados con más de 100 años de antigüedad que siguen floreciendo anualmente en casas familiares europeas. Se les da el cuidado preciso y se transmiten como objetos de valor.' },
  { nombre: 'Palmera kentia', nombreCientifico: 'Howea forsteriana', origen: 'Isla Lord Howe (Australia)', luz: 'Semisombra', riego: 'Cada 10 días', humedad: 'Media', temperatura: '15–24 °C', dificultad: 'Fácil', toxicidadMascotas: 'No tóxica', tamano: '100–200 cm', beneficios: ['Efecto palmera en interior', 'Apta para mascotas', 'Tolerante a baja luz'], cuidados: 'Crece muy lentamente. No necesita trasplante frecuente. Evitar corrientes de aire frío.', descripcion: 'La palmera de interior por excelencia. Sus elegantes palmas arqueadas aportan un ambiente tropical y sofisticado. Tolera niveles de luz relativamente bajos para una palmera, lo que la hace ideal para salones. Crece lenta pero vive décadas.', curiosidad: 'La palmera kentia solo puede reproducirse en su isla nativa, la isla Lord Howe en el Pacífico, donde está protegida. Toda la producción comercial mundial parte de semillas exportadas desde esta pequeña isla de apenas 11 km² de superficie.' },
  { nombre: 'Orquídea Phalaenopsis', nombreCientifico: 'Phalaenopsis spp.', origen: 'Asia tropical', luz: 'Luz indirecta', riego: 'Cada 10 días', humedad: 'Media', temperatura: '18–25 °C', dificultad: 'Moderada', toxicidadMascotas: 'No tóxica', tamano: '40–70 cm', beneficios: ['Floración duradera', 'Apta para mascotas', 'Planta de regalo clásica'], cuidados: 'Regar sumergiéndola en agua 1 vez/semana, nunca encharcada. Corteza de pino como sustrato. Necesita diferencia de temperatura día/noche para volver a florecer.', descripcion: 'La orquídea de interior más popular del mundo. Sus flores pueden durar de 3 a 6 meses. Aunque tiene fama de difícil, con los cuidados correctos es bastante agradecida. El sustrato debe ser permeable (corteza de pino) y nunca tierra convencional.', curiosidad: 'En Asia, las phalaenopsis son símbolo de prosperidad y longevidad. El nombre "Phalaenopsis" significa "parecida a una polilla" en griego, en referencia a la similitud de sus flores con mariposas en vuelo.' },
  { nombre: 'Hoya kerrii', nombreCientifico: 'Hoya kerrii', origen: 'Asia tropical', luz: 'Luz indirecta', riego: 'Cada 10 días', humedad: 'Baja', temperatura: '16–25 °C', dificultad: 'Fácil', toxicidadMascotas: 'No tóxica', tamano: '2–4 m (trepadora) o hoja única', beneficios: ['Apta para mascotas', 'Hoja en corazón única', 'Muy resistente'], cuidados: 'Atención: la hoja de corazón solitaria vendida como planta nunca crecerá. Comprar plantas con tallo para que desarrollen más hojas.', descripcion: 'Conocida como "planta corazón" por sus hojas gruesas y cerosas en forma de corazón. En su versión completa, trepa y produce flores aromáticas. Es suculenta y tolera el olvido del riego. Muy longeva y cada vez más popular como planta de interior.', curiosidad: 'La moda de vender una única hoja de hoya kerrii como planta decorativa de San Valentín es un engaño botánico: sin yema de crecimiento, la hoja sobrevive años pero nunca produce más hojas. Solo las plantas con tallo pueden desarrollarse completamente.' },
  { nombre: 'Dracena marginata', nombreCientifico: 'Dracaena marginata', origen: 'Madagascar', luz: 'Luz indirecta', riego: 'Cada 10 días', humedad: 'Baja', temperatura: '15–25 °C', dificultad: 'Fácil', toxicidadMascotas: 'Tóxica moderada', tamano: '100–300 cm', beneficios: ['Porte arbustivo elegante', 'Muy resistente', 'Purifica el aire'], cuidados: 'Sensible al flúor del agua del grifo: puede causar puntas marrones. Usar agua reposada.', descripcion: 'Una de las plantas de interior con más porte. Sus tallos leñosos rematados en coronas de hojas estrechas con borde rojo crean un aspecto tropical y elegante. Muy resistente y longeva. Puede alcanzar el techo en interiores con buenas condiciones.', curiosidad: 'La dracaena marginata de Madagascar produce una resina rojiza llamada "sangre de dragón" que se ha usado durante siglos como tinte, barniz y medicina tradicional. La resina era ya conocida por los romanos en el siglo I d.C.' },
  { nombre: 'Lavanda', nombreCientifico: 'Lavandula angustifolia', origen: 'Cuenca mediterránea', luz: 'Plena luz', riego: 'Cada 10 días', humedad: 'Baja', temperatura: '10–25 °C', dificultad: 'Moderada', toxicidadMascotas: 'Tóxica leve', tamano: '30–60 cm', beneficios: ['Aroma relajante', 'Repele insectos', 'Flores para secar'], cuidados: 'Necesita al menos 6 horas de sol. En interior, solo funciona en balcones o alféizares muy soleados.', descripcion: 'La planta aromática mediterránea por excelencia. Aunque su hábitat natural es el exterior, puede cultivarse en interior si recibe suficiente sol directo. Su fragancia reduce el estrés según estudios de aromaterapia. Las flores se pueden secar conservando el aroma meses.', curiosidad: 'El nombre lavanda viene del latín "lavare" (lavar): los romanos la usaban en sus baños y como aromatizante de ropa. La lavanda de la Provenza francesa, cultivada para la industria de la perfumería, ocupa más de 20.000 hectáreas.' },
  { nombre: 'Pilea peperomioides', nombreCientifico: 'Pilea peperomioides', origen: 'Yunnan, China', luz: 'Luz indirecta', riego: 'Semanal', humedad: 'Media', temperatura: '15–25 °C', dificultad: 'Fácil', toxicidadMascotas: 'No tóxica', tamano: '20–40 cm', beneficios: ['Apta para mascotas', 'Fácil propagación', 'Muy decorativa'], cuidados: 'Girar la maceta cada semana para que las hojas crezcan uniformes hacia todos lados.', descripcion: 'La "planta del dinero" o "planta del misionero". Sus hojas circulares perfectas sobre tallos erectos son inconfundibles. Se propaga fácilmente produciendo hijuelos que se pueden regalar. Es sociable y colaborativa: tradicionalmente se compartía entre vecinos y amigos.', curiosidad: 'La pilea era desconocida en Occidente hasta que un misionero noruego llamado Agnar Espegren la llevó consigo desde China en los años 1940. La planta se fue propagando de mano en mano durante décadas antes de ser identificada científicamente en 1978.' },
  { nombre: 'Árbol del caucho', nombreCientifico: 'Ficus elastica', origen: 'India y Asia tropical', luz: 'Luz indirecta', riego: 'Cada 10 días', humedad: 'Media', temperatura: '15–25 °C', dificultad: 'Fácil', toxicidadMascotas: 'Tóxica moderada', tamano: '100–300 cm', beneficios: ['Gran purificador de aire', 'Crece rápido', 'Hojas grandes decorativas'], cuidados: 'Limpiar las hojas con paño húmedo para que brillen. No moverlo de lugar frecuentemente.', descripcion: 'Un árbol de selva tropical en versión interior. Sus hojas grandes, gruesas y brillantes —verdes oscuras o burdeos según la variedad— crean una presencia vegetal imponente. Crece rápido y puede llegar al techo. El látex que exuda es irritante para la piel.', curiosidad: 'El látex del ficus elastica fue la primera fuente comercial de caucho del mundo antes de que se desarrollara la industria del caucho amazónico. Los árboles de los Assam (India) se sangraban sistemáticamente en el siglo XIX para extraer el látex.' },
  { nombre: 'Tradescantia', nombreCientifico: 'Tradescantia zebrina', origen: 'México y América Central', luz: 'Luz indirecta', riego: 'Semanal', humedad: 'Media', temperatura: '15–25 °C', dificultad: 'Muy fácil', toxicidadMascotas: 'Tóxica leve', tamano: '30–100 cm (rastrera)', beneficios: ['Colores vistosos', 'Crece muy rápido', 'Fácil propagación'], cuidados: 'Pinzar los brotes para que ramifique. Un tallo en agua enraíza en días.', descripcion: 'Planta colgante de crecimiento rapidísimo con hojas bicolores: verde-plata en el haz y púrpura en el envés. Perfecta para macetas colgantes o baldas altas desde las que cae en cascada. Es tan fácil de propagar que una sola planta puede multiplicarse indefinidamente.', curiosidad: 'En algunas regiones de México, la tradescantia se usa como indicador biológico de contaminación nuclear: sus estambres florales mutan y cambian de color azul a rosa en presencia de radiación ionizante, y se ha usado en estudios de monitoreo ambiental.' },
  { nombre: 'Aglaonema', nombreCientifico: 'Aglaonema commutatum', origen: 'Asia tropical', luz: 'Semisombra', riego: 'Cada 10 días', humedad: 'Media', temperatura: '18–27 °C', dificultad: 'Fácil', toxicidadMascotas: 'Tóxica moderada', tamano: '30–90 cm', beneficios: ['Colores intensos', 'Tolera la sombra', 'Muy resistente'], cuidados: 'Las variedades con más rojo necesitan algo más de luz. Las verdes son las más tolerantes a la sombra.', descripcion: 'El aglaonema, o "planta china de hoja perenne", tiene variedades en rojo, rosa, verde, plateado y tricolor. Es una de las pocas plantas decorativas que tolera espacios con poca luz y exhibe colores brillantes. Muy popular en oficinas y espacios con luz artificial.', curiosidad: 'El aglaonema figura en el Feng Shui como "planta de la buena suerte" y se coloca a la entrada de tiendas y negocios en toda Asia. En Tailandia, los agricultores plantan aglaonemas en los bordes de los arrozales para ahuyentar plagas.' },
  { nombre: 'Clivia', nombreCientifico: 'Clivia miniata', origen: 'Sudáfrica', luz: 'Semisombra', riego: 'Cada 10 días', humedad: 'Baja', temperatura: '10–22 °C', dificultad: 'Moderada', toxicidadMascotas: 'Muy tóxica', tamano: '45–60 cm', beneficios: ['Floración invernal espectacular', 'Larga vida', 'Resistente'], cuidados: 'Necesita período de frío y sequía en invierno (5–10 °C, sin regar) para florecer la siguiente temporada.', descripcion: 'Una de las pocas plantas con flores espectaculares que tolera la semisombra. En invierno-primavera produce umbelas de flores naranja o amarillo intenso sobre hojas verde oscuro brillante. Muy longeva: puede vivir 50 años en maceta pasando de generación en generación.', curiosidad: 'La clivia lleva el nombre de Lady Charlotte Florentine Clive, duquesa de Northumberland, que la cultivó por primera vez en Europa en 1854. En China, donde es símbolo de nobleza y longevidad, ejemplares raros de clivia variegada se han vendido por más de 20.000 euros.' },
  { nombre: 'Peperomia obtusifolia', nombreCientifico: 'Peperomia obtusifolia', origen: 'América tropical', luz: 'Luz indirecta', riego: 'Cada 10 días', humedad: 'Baja', temperatura: '15–27 °C', dificultad: 'Muy fácil', toxicidadMascotas: 'No tóxica', tamano: '20–35 cm', beneficios: ['Apta para mascotas', 'Muy resistente', 'Compacta y decorativa'], cuidados: 'No necesita tierra rica: tolera sustratos pobres con buen drenaje.', descripcion: 'La peperomia de hoja redonda y brillante es una planta compacta y sin exigencias. Sus hojas verdes y cerosas acumulan agua, haciéndola tolerante al olvido del riego. El género peperomia tiene más de 1.000 especies, todas seguras para mascotas.', curiosidad: 'El género Peperomia, con más de 1.500 especies, es el segundo más grande de la familia Piperaceae (la misma de la pimienta). Pese a la enorme variedad de formas, todas las peperomias comparten la misma característica: no necesitan mucha agua.' },
  { nombre: 'Bambú de la suerte', nombreCientifico: 'Dracaena sanderiana', origen: 'Camerún, África Central', luz: 'Luz indirecta', riego: 'Semanal', humedad: 'Media', temperatura: '18–27 °C', dificultad: 'Fácil', toxicidadMascotas: 'Tóxica leve', tamano: '30–100 cm', beneficios: ['Feng Shui', 'Crece en agua', 'Regalo simbólico'], cuidados: 'Si se cultiva en agua, cambiar el agua cada 2 semanas y usar agua sin cloro. Añadir una gota de fertilizante líquido mensualmente.', descripcion: 'A pesar de llamarse "bambú", no es un bambú sino una dracena. Crece en agua o tierra y se moldea en espirales y formas decorativas. En la cultura china y el Feng Shui, el número de tallos tiene significados específicos: 3 tallos = felicidad, 5 = riqueza, 7 = salud.', curiosidad: 'El tallado y curvado de los tallos se consigue exponiendo un lado de la planta a la luz y el otro a la oscuridad repetidamente. El tallo crece hacia la luz de forma natural (fototropismo), creando la espiral característica.' },
  { nombre: 'Planta del dinero', nombreCientifico: 'Pachira aquatica', origen: 'América Central y del Sur', luz: 'Luz indirecta', riego: 'Cada 10 días', humedad: 'Media', temperatura: '16–26 °C', dificultad: 'Fácil', toxicidadMascotas: 'No tóxica', tamano: '60–180 cm', beneficios: ['Apta para mascotas', 'Feng Shui', 'Resistente'], cuidados: 'El tronco trenzado de los ejemplares vendidos es artificial. Regar en profundidad pero esperar a que el sustrato seque entre riegos.', descripcion: 'El "árbol de la fortuna" del Feng Shui. Su tronco trenzado (varias plantas unidas) es inconfundible. Muy resistente y tolerante. Sus hojas digitadas en verde brillante le dan un aspecto exótico. En su hábitat natural crece en pantanos y orillas de ríos tropicales.', curiosidad: 'La moda de la pachira como planta del Feng Shui empezó en los años 1980 en Taiwán. Según la leyenda, un camionero taiwanés empobrecido encontró una sola planta de pachira, multiplicó varias en una misma maceta y se hizo rico vendiéndolas. De ahí el nombre de "árbol de la fortuna".' },
  { nombre: 'Aspidistra', nombreCientifico: 'Aspidistra elatior', origen: 'China y Japón', luz: 'Sombra', riego: 'Cada 10 días', humedad: 'Baja', temperatura: '7–27 °C', dificultad: 'Muy fácil', toxicidadMascotas: 'No tóxica', tamano: '50–80 cm', beneficios: ['Apta para mascotas', 'Tolera la oscuridad', 'Muy resistente'], cuidados: 'La planta más resistente de interior: tolera frío, oscuridad, sequía y descuido. Solo muere por exceso de agua.', descripcion: 'La "planta de hierro fundido" —su apodo anglosajón— es la planta más indestructible para interiores. Toleran oscuridad casi total, riegos escasísimos, temperaturas entre 7 y 27 °C y semanas de abandono. Sus hojas largas y oscuras añaden elegancia sobria a cualquier espacio.', curiosidad: 'La aspidistra fue la planta de interior favorita de la era victoriana en Reino Unido. Era tan omnipresente en casas y fondas de la época que George Orwell la mencionó en varias novelas como símbolo de la mediocridad burguesa de la clase media victoriana.' },
  { nombre: 'Begonia de flor', nombreCientifico: 'Begonia × hiemalis', origen: 'Cultivar (origen Sudamérica)', luz: 'Luz indirecta', riego: 'Semanal', humedad: 'Media', temperatura: '16–21 °C', dificultad: 'Moderada', toxicidadMascotas: 'Tóxica leve', tamano: '25–40 cm', beneficios: ['Floración prolongada', 'Muchos colores', 'Compacta'], cuidados: 'Regar siempre por la base: las flores se manchan con el agua. Eliminar flores marchitas para prolongar la floración.', descripcion: 'La begonia de flor produce abundantes flores en blanco, rosa, rojo, naranja o amarillo durante meses. Su floración es continua si se cuida bien. Es una planta de temporada que dura varios meses en interior con buena iluminación. Muy popular como regalo o planta de balcón.', curiosidad: 'Existen más de 2.000 especies de begonias, lo que la convierte en uno de los géneros más diversos de plantas con flor. Se cultivan en jardines desde el siglo XVII y la industria horticultural produce cientos de nuevos híbridos cada año.' },
  { nombre: 'Gardenia', nombreCientifico: 'Gardenia jasminoides', origen: 'China, Japón, Vietnam', luz: 'Luz indirecta', riego: 'Semanal', humedad: 'Alta', temperatura: '16–21 °C', dificultad: 'Difícil', toxicidadMascotas: 'Tóxica leve', tamano: '40–120 cm', beneficios: ['Fragancia extraordinaria', 'Flores elegantes', 'Decorativa'], cuidados: 'Exige agua sin cal (lluvia o filtrada), alta humedad y temperatura estable. No moverla cuando está en flor. La más difícil de las populares.', descripcion: 'La gardenia es considerada la reina de las plantas de interior aromáticas. Sus flores blancas y cremosas tienen una fragancia dulce e intensa que perfuma toda una habitación. Pero es exigente: necesita agua sin cal, alta humedad, temperatura estable y no tolera ser movida.', curiosidad: 'La gardenia fue durante décadas la flor favorita de los compositores de jazz: Billie Holiday la llevaba siempre puesta en el pelo. Duke Ellington la mencionó como "la flor más bella del mundo". El perfume Chanel N°22 está basado en su fragancia.' },
  { nombre: 'Schefflera', nombreCientifico: 'Schefflera actinophylla', origen: 'Australia y Nueva Guinea', luz: 'Luz indirecta', riego: 'Cada 10 días', humedad: 'Media', temperatura: '15–25 °C', dificultad: 'Fácil', toxicidadMascotas: 'Tóxica moderada', tamano: '100–300 cm', beneficios: ['Porte arbóreo elegante', 'Crece rápido', 'Muy decorativa'], cuidados: 'Girar la planta regularmente para un crecimiento uniforme. Limpiar las hojas para maximizar fotosíntesis.', descripcion: 'El "árbol paraguas" por sus hojas digitadas que se despliegan como un paraguas. Crece hasta el techo en interiores con buenas condiciones. Sus hojas compuestas de 7–16 folíolos le dan un aspecto tropical vigoroso. Muy resistente a condiciones imperfectas.', curiosidad: 'En la selva tropical australiana, la schefflera actinophylla es considerada una planta invasora problemática: su sistema de raíces aéreas puede dañar tuberías, alcantarillas y cimientos de edificios. En interior, este ímpetu se convierte en crecimiento vigoroso inofensivo.' },
  { nombre: 'Bromelia guzmania', nombreCientifico: 'Guzmania lingulata', origen: 'América tropical', luz: 'Luz indirecta', riego: 'Semanal', humedad: 'Alta', temperatura: '18–27 °C', dificultad: 'Moderada', toxicidadMascotas: 'No tóxica', tamano: '30–50 cm', beneficios: ['Apta para mascotas', 'Floración tropical', 'Bajo mantenimiento'], cuidados: 'Llenar el "vaso" central con agua y cambiarla semanalmente para evitar mosquitos. No regar el sustrato casi nunca.', descripcion: 'Las guzmanias son bromelias de interior con brácteas de colores espectaculares: rojo, naranja, amarillo, rosa. Su sistema único de riego —llenar el vaso central— las hace fáciles de mantener una vez entendido. Después de florecer, producen hijuelos que reemplazan la planta madre.', curiosidad: 'Las bromelias son epífitas en su hábitat natural: crecen sobre los troncos de los árboles sin parasitarlos, obteniendo agua y nutrientes exclusivamente de la lluvia y del aire. El "vaso" central que forman sus hojas crea un microhábitat donde viven ranas, insectos y microorganismos.' },
  { nombre: 'Cactus columnar', nombreCientifico: 'Cereus repandus', origen: 'América del Sur', luz: 'Plena luz', riego: 'Mensual', humedad: 'Baja', temperatura: '10–30 °C', dificultad: 'Muy fácil', toxicidadMascotas: 'No tóxica', tamano: '30–300 cm', beneficios: ['Mínimo mantenimiento', 'Muy longevo', 'Decorativo geométrico'], cuidados: 'Solo necesita luz directa y riegos escasísimos. En invierno, nada de agua si la temperatura baja de 15 °C.', descripcion: 'El cactus columnar es uno de los más elegantes: crecimiento vertical limpio con costillas prominentes y espinas. En interior necesita la ventana más soleada disponible. Es extraordinariamente resistente a la sequía y puede vivir décadas sin trasplante. Su crecimiento es muy lento.', curiosidad: 'Los cactus columnares pueden vivir entre 150 y 200 años. El saguaro del desierto de Sonora (EEUU-México) no comienza a producir sus brazos característicos hasta los 75 años de edad. Algunos ejemplares en los desiertos americanos tienen más de 150 años.' },
  { nombre: 'Maranta leuconeura', nombreCientifico: 'Maranta leuconeura', origen: 'Brasil', luz: 'Semisombra', riego: 'Semanal', humedad: 'Alta', temperatura: '18–27 °C', dificultad: 'Moderada', toxicidadMascotas: 'No tóxica', tamano: '20–35 cm', beneficios: ['Apta para mascotas', 'Hojas únicas de colores', 'Planta de sombra'], cuidados: 'Alta humedad obligatoria. Usar agua sin cloro. No tolera la cal del agua del grifo.', descripcion: 'La "planta de la oración", prima de las calatheas. Sus hojas con patrones bicolores —verde oscuro con marcas claras y envés rojizo— son extraordinarias. Como las calatheas, sus hojas se mueven siguiendo un ritmo circadiano: se alzan de noche como en posición de rezo.', curiosidad: 'El movimiento de las hojas de la maranta (nictinastia) no es solo estético: se cree que sirve para dirigir la lluvia hacia las raíces y para regular la temperatura de la hoja evitando la pérdida de humedad durante las noches más frías.' },
  { nombre: 'Alocasia', nombreCientifico: 'Alocasia amazonica', origen: 'Híbrido asiático (origen incierto)', luz: 'Luz indirecta', riego: 'Cada 10 días', humedad: 'Alta', temperatura: '18–27 °C', dificultad: 'Difícil', toxicidadMascotas: 'Muy tóxica', tamano: '50–100 cm', beneficios: ['Hojas espectaculares', 'Impacto visual máximo', 'Tendencia actual'], cuidados: 'Alta humedad obligatoria. En seco entra en letargo. Tóxica para personas y mascotas por cristales de oxalato de calcio.', descripcion: 'La alocasia "Amazonica" no es amazónica: es un híbrido creado en vivero. Sus hojas flechadas de un verde casi negro con nervios blancos son de las más espectaculares del mundo vegetal. Exige cuidados: alta humedad, temperatura estable y agua sin cloro. Muy en tendencia.', curiosidad: 'A pesar de llamarse "Amazonica", esta alocasia fue creada en los años 1950 por el vivero Salvadore D\'Amato en Miami (EEUU). Nunca ha existido en la naturaleza. El nombre comercial "Amazonica" fue un reclamo de marketing que se quedó como nombre botánico de facto.' },
];

// ==============================
// HELPERS
// ==============================

function luzBadgeClass(luz: NivelLuz, s: typeof styles): string {
  if (luz === 'Plena luz') return `${s.luzBadge} ${s.luzPlena}`;
  if (luz === 'Luz indirecta') return `${s.luzBadge} ${s.luzIndirecta}`;
  if (luz === 'Semisombra') return `${s.luzBadge} ${s.luzSemisombra}`;
  return `${s.luzBadge} ${s.luzSombra}`;
}

function luzIcono(luz: NivelLuz): string {
  if (luz === 'Plena luz') return '☀️';
  if (luz === 'Luz indirecta') return '🌤️';
  if (luz === 'Semisombra') return '⛅';
  return '🌑';
}

function dificultadClass(d: Dificultad, s: typeof styles): string {
  if (d === 'Muy fácil') return `${s.dificultadBadge} ${s.difMuyFacil}`;
  if (d === 'Fácil') return `${s.dificultadBadge} ${s.difFacil}`;
  if (d === 'Moderada') return `${s.dificultadBadge} ${s.difModerada}`;
  return `${s.dificultadBadge} ${s.difDificil}`;
}

function toxClass(t: ToxicidadMascotas, s: typeof styles): string {
  if (t === 'No tóxica') return `${s.toxBadge} ${s.toxNo}`;
  if (t === 'Tóxica leve') return `${s.toxBadge} ${s.toxLeve}`;
  if (t === 'Tóxica moderada') return `${s.toxBadge} ${s.toxModerada}`;
  return `${s.toxBadge} ${s.toxMuy}`;
}

function toxIcono(t: ToxicidadMascotas): string {
  if (t === 'No tóxica') return '🐾✅';
  if (t === 'Tóxica leve') return '⚠️';
  if (t === 'Tóxica moderada') return '🔶';
  return '🚫';
}

// ==============================
// COMPONENTE PRINCIPAL
// ==============================

export default function GuiaPlantas() {
  const [luz, setLuz] = useState<NivelLuz | 'Todas'>('Todas');
  const [dificultad, setDificultad] = useState<Dificultad | 'Todas'>('Todas');
  const [soloAptas, setSoloAptas] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const NIVELES_LUZ: Array<NivelLuz | 'Todas'> = ['Todas', 'Plena luz', 'Luz indirecta', 'Semisombra', 'Sombra'];
  const NIVELES_DIF: Array<Dificultad | 'Todas'> = ['Todas', 'Muy fácil', 'Fácil', 'Moderada', 'Difícil'];

  const plantasFiltradas = useMemo(() => {
    return PLANTAS.filter(p => {
      const matchLuz = luz === 'Todas' || p.luz === luz;
      const matchDif = dificultad === 'Todas' || p.dificultad === dificultad;
      const matchAptas = !soloAptas || p.toxicidadMascotas === 'No tóxica';
      const matchBusqueda =
        busqueda === '' ||
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.nombreCientifico.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.origen.toLowerCase().includes(busqueda.toLowerCase());
      return matchLuz && matchDif && matchAptas && matchBusqueda;
    });
  }, [luz, dificultad, soloAptas, busqueda]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Guía de Plantas de Interior</h1>
        <p>
          40 plantas con nivel de luz, frecuencia de riego, humedad, toxicidad para mascotas
          y consejos de cuidado específicos. Filtra por lo que necesitas.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Controles */}
        <div className={styles.controles}>
          <input
            type="search"
            placeholder="Buscar por nombre, nombre científico u origen…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className={styles.buscador}
            aria-label="Buscar planta"
          />

          <div className={styles.filtrosRow}>
            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>Nivel de luz</span>
              <div className={styles.filtros} role="group" aria-label="Filtrar por nivel de luz">
                {NIVELES_LUZ.map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setLuz(n)}
                    className={`${styles.filtroBtn} ${luz === n ? styles.filtroActivo : ''}`}
                    aria-pressed={luz === n}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>Dificultad</span>
              <div className={styles.filtros} role="group" aria-label="Filtrar por dificultad">
                {NIVELES_DIF.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDificultad(d)}
                    className={`${styles.filtroBtn} ${dificultad === d ? styles.filtroActivo : ''}`}
                    aria-pressed={dificultad === d}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={soloAptas}
              onChange={e => setSoloAptas(e.target.checked)}
            />
            Solo aptas para mascotas <span aria-hidden="true">🐾</span>
          </label>
        </div>

        {/* Contador */}
        <p className={styles.contador}>
          <strong>{plantasFiltradas.length}</strong> plantas encontradas de {PLANTAS.length}
        </p>

        {/* Grid de tarjetas */}
        <div className={styles.grid}>
          {plantasFiltradas.length === 0 ? (
            <div className={styles.sinResultados}>
              <p>No hay plantas que coincidan con los filtros actuales.</p>
              <p>Prueba a ampliar la búsqueda o a quitar algún filtro.</p>
            </div>
          ) : (
            plantasFiltradas.map(planta => (
              <article key={planta.nombre} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitulo}>
                    <div>
                      <div className={styles.nombre}>{planta.nombre}</div>
                      <div className={styles.nombreCientifico}>{planta.nombreCientifico}</div>
                    </div>
                    <span className={luzBadgeClass(planta.luz, styles)}>
                      <span aria-hidden="true">{luzIcono(planta.luz)}</span>
                      {planta.luz}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span className={dificultadClass(planta.dificultad, styles)}>
                      {planta.dificultad}
                    </span>
                    <span className={toxClass(planta.toxicidadMascotas, styles)}>
                      <span aria-hidden="true">{toxIcono(planta.toxicidadMascotas)}</span>
                      {planta.toxicidadMascotas}
                    </span>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <p className={styles.descripcion}>{planta.descripcion}</p>

                  <div className={styles.metaGrid}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Riego</span>
                      <span className={styles.metaValor}><span aria-hidden="true">💧</span> {planta.riego}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Humedad</span>
                      <span className={styles.metaValor}><span aria-hidden="true">💨</span> {planta.humedad}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Temperatura</span>
                      <span className={styles.metaValor}><span aria-hidden="true">🌡️</span> {planta.temperatura}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Tamaño</span>
                      <span className={styles.metaValor}><span aria-hidden="true">📏</span> {planta.tamano}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Origen</span>
                      <span className={styles.metaValor}><span aria-hidden="true">🌍</span> {planta.origen}</span>
                    </div>
                  </div>

                  <div className={styles.beneficiosSection}>
                    <span className={styles.metaLabel}>Beneficios</span>
                    <div className={styles.beneficiosTags}>
                      {planta.beneficios.map(b => (
                        <span key={b} className={styles.beneficiosTag}>{b}</span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.cuidadosBox}>
                    <strong>Cuidados clave:</strong> {planta.cuidados}
                  </div>

                  <div className={styles.curiosidadBox}>
                    <span className={styles.curiosidadIcon} aria-hidden="true">💡</span>
                    <span className={styles.curiosidadText}>{planta.curiosidad}</span>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Sección educativa v2.0 */}
        <EducationalSection
          title="Todo sobre el cultivo de plantas de interior"
          subtitle="De los cuidados básicos a los secretos de las plantas más exigentes"
        >
          {/* Tabla comparativa */}
          <h3 className={styles.sectionTitle}>Comparativa por nivel de dificultad</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Dificultad</th>
                  <th>Plantas típicas</th>
                  <th>Riego</th>
                  <th>Humedad</th>
                  <th>Perfil de usuario</th>
                  <th>Error frecuente</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Muy fácil</strong></td>
                  <td>Pothos, Sansevieria, ZZ, Aspidistra</td>
                  <td>Mensual o semanal</td>
                  <td>Baja o media</td>
                  <td>Principiantes, viajeros</td>
                  <td>Regar demasiado</td>
                </tr>
                <tr>
                  <td><strong>Fácil</strong></td>
                  <td>Monstera, Ficus elastica, Kentia</td>
                  <td>Cada 10 días</td>
                  <td>Media</td>
                  <td>Aficionados con algo de experiencia</td>
                  <td>Cambiar de lugar frecuentemente</td>
                </tr>
                <tr>
                  <td><strong>Moderada</strong></td>
                  <td>Ficus lyrata, Helecho Boston, Crotón</td>
                  <td>Semanal o cada 10 días</td>
                  <td>Media o alta</td>
                  <td>Entusiastas dedicados</td>
                  <td>Ignorar la humedad ambiental</td>
                </tr>
                <tr>
                  <td><strong>Difícil</strong></td>
                  <td>Calathea, Gardenia, Alocasia</td>
                  <td>Semanal con agua sin cloro</td>
                  <td>Alta (humidificador)</td>
                  <td>Expertos apasionados</td>
                  <td>Agua del grifo con cal o flúor</td>
                </tr>
                <tr>
                  <td><strong>Mascotas</strong></td>
                  <td>Calathea, Pilea, Helecho, Kentia</td>
                  <td>Variable</td>
                  <td>Variable</td>
                  <td>Familias con animales</td>
                  <td>Comprar sin revisar toxicidad</td>
                </tr>
                <tr>
                  <td><strong>Poca luz</strong></td>
                  <td>Aspidistra, ZZ, Sansevieria, Aglaonema</td>
                  <td>Escaso</td>
                  <td>Baja o media</td>
                  <td>Pasillos, baños sin ventana</td>
                  <td>Esperar crecimiento rápido</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Escenarios */}
          <h3 className={styles.sectionTitle} style={{ marginTop: '1.5rem' }}>Escenarios habituales</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>Piso con poca luz</h4>
              <p>Opta por aspidistra, sansevieria, zamioculca o aglaonema. Toleran luz artificial y sobreviven con riegos mínimos. Evita suculentas y cactus.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Tengo mascotas</h4>
              <p>Filtra siempre por "Solo aptas para mascotas". Las más seguras y vistosas: pilea, helecho de Boston, calathea y palmera kentia.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Primera planta</h4>
              <p>Pothos, planta araña o sansevieria. Son prácticamente indestructibles y te enseñan los ritmos básicos sin consecuencias si fallas.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Quiero flores en casa</h4>
              <p>Orquídea phalaenopsis (dura meses), cactus de Navidad (floración invernal), clivia (primavera) o begonia de flor (meses continuos).</p>
            </div>
          </div>

          {/* FAQ */}
          <h3 className={styles.sectionTitle} style={{ marginTop: '1.5rem' }}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Por qué se me mueren las plantas si las riego bien?</h4>
              <p>El exceso de riego mata más plantas que la sequía. La mayoría prefiere que el sustrato seque entre riegos. Comprueba siempre la humedad del sustrato antes de regar: introduce el dedo 2 cm y riega solo si está seco.</p>
              <span className={styles.faqTip}>Regla de oro: más sequía que encharcamiento</span>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué plantas aguantan la calefacción central?</h4>
              <p>La calefacción reseca el aire. Las plantas más tolerantes: pothos, sansevieria, zamioculca, ficus elastica y schefflera. Evita calatheas, marantas y helechos sin un humidificador cerca.</p>
              <span className={styles.faqTip}>Solución rápida: bandeja con grava y agua bajo la maceta</span>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué el ficus lyrata pierde hojas?</h4>
              <p>Es la planta más sensible a los cambios de ubicación. Una vez colocada en su sitio, no la muevas aunque cambie la estación. La pérdida de hojas al principio es normal: está adaptándose a la nueva ubicación.</p>
              <span className={styles.faqTip}>Elige su lugar definitivo antes de comprarla</span>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo sé si mi planta necesita un macetero más grande?</h4>
              <p>Señales de raíces saturadas: raíces que salen por el agujero de drenaje, la planta necesita riego diario, o el cepellón se ha solidificado. Trasplanta en primavera a un macetero 2–3 cm más grande.</p>
              <span className={styles.faqTip}>Trasplanta siempre en primavera</span>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué fertilizante uso y cuándo?</h4>
              <p>Fertilizante líquido equilibrado (N-P-K similar) cada 2–4 semanas en primavera y verano. En otoño e invierno, la mayoría de plantas descansa: no fertilizar. Las orquídeas y bromelias necesitan fertilizante específico.</p>
              <span className={styles.faqTip}>Solo fertilizar en la época de crecimiento activo</span>
            </div>
          </div>

          {/* Pasos para empezar */}
          <h3 className={styles.sectionTitle} style={{ marginTop: '1.5rem' }}>5 pasos para empezar con plantas de interior</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Analiza la luz disponible</h4>
                <p>Observa qué ventanas tiene tu casa y en qué orientación (sur = más luz, norte = menos). La luz es el factor más limitante: ningún cuidado compensa la falta de luz adecuada.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Elige plantas para tu nivel de luz real</h4>
                <p>Usa el filtro de luz de esta guía. Sé honesto: "algo de luz" no es suficiente para un ficus lyrata, pero sí para una zamioculca.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Compra en vivero, no en supermercado</h4>
                <p>Las plantas de vivero están mejor cuidadas, tienen raíces más sanas y vienen con etiqueta de cuidados verificada. El precio extra vale la pena.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Aprende el ritmo de riego correcto</h4>
                <p>Pon recordatorios en el calendario o usa una app. Mejor regar poco con frecuencia controlada que mucho de forma aleatoria. Comprueba siempre el sustrato antes de regar.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Fertiliza en primavera y verano</h4>
                <p>Empieza a fertilizar cuando la planta lleve al menos 1 mes en casa y sea temporada de crecimiento. Nunca fertilices una planta recién trasplantada o enferma.</p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <h3 className={styles.sectionTitle} style={{ marginTop: '1.5rem' }}>Tips de cuidado</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">💧</div>
              <h4>Agua sin cloro</h4>
              <p>Para calatheas, marantas y gardenias, deja reposar el agua del grifo 24 horas o usa agua filtrada. El cloro y el flúor dañan sus raíces.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">🌫️</div>
              <h4>Humedad en invierno</h4>
              <p>Un humidificador de ambiente en invierno mejora notablemente el crecimiento de plantas tropicales. Alternativa: bandeja con piedras y agua bajo la maceta.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">🧹</div>
              <h4>Limpia las hojas</h4>
              <p>El polvo en las hojas bloquea la fotosíntesis. Limpia con paño húmedo una vez al mes. Las plantas brillarán más y crecerán mejor.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">🔄</div>
              <h4>Gira la maceta</h4>
              <p>Las plantas crecen hacia la luz. Girar la maceta 90° cada semana evita que crezcan torcidas y asegura un desarrollo uniforme.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">🔍</div>
              <h4>Vigila las plagas</h4>
              <p>Revisa el envés de las hojas semanalmente. Las cochinillas (puntos blancos algodonosos) y la araña roja (tela fina) son las más comunes. Actúa al primer signo.</p>
            </div>
          </div>

          {/* Warning box de errores */}
          <div className={styles.warningBox} style={{ marginTop: '1.5rem' }}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores más comunes que matan plantas de interior
            </div>
            <ul className={styles.warningList}>
              <li><strong>Regar con horario fijo:</strong> el riego depende de la planta, el tamaño del macetero, la temperatura y la estación. Siempre comprobar antes de regar.</li>
              <li><strong>Macetero sin agujero de drenaje:</strong> el agua acumulada pudre las raíces en días. Si el macetero es decorativo sin agujero, usa uno interior con agujero dentro.</li>
              <li><strong>Mover la planta constantemente:</strong> las plantas se estresan con los cambios de luz. Define su ubicación definitiva desde el principio.</li>
              <li><strong>Comprar sin revisar toxicidad:</strong> pothos, monstera, ficus y dracenas son tóxicas para gatos y perros. Verificar siempre antes de comprar si hay mascotas en casa.</li>
              <li><strong>Ignorar el período de adaptación:</strong> es normal que una planta pierda hojas o parezca triste durante las primeras 2–4 semanas. Está adaptándose al nuevo ambiente.</li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('guia-plantas-interior')} />
        <ShareCard appName="guia-plantas-interior" />
      </main>

      <Footer appName="guia-plantas-interior" />
    </div>
  );
}
