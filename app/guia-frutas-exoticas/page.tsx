'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './GuiaFrutasExoticas.module.css';

type RegionFruta =
  | 'Sudeste Asiático'
  | 'América Tropical'
  | 'África'
  | 'Oceanía'
  | 'Mediterráneo'
  | 'Asia';

type TemporadaFruta =
  | 'Primavera'
  | 'Verano'
  | 'Otoño'
  | 'Invierno'
  | 'Todo el año';

type PerfilSabor =
  | 'Dulce'
  | 'Ácido'
  | 'Dulce-ácido'
  | 'Tropical'
  | 'Cremoso'
  | 'Aromático'
  | 'Astringente';

type Disponibilidad = 'Común' | 'Especialidades' | 'Rara';

interface FrutaExotica {
  nombre: string;
  nombreCientifico: string;
  region: RegionFruta;
  paisesOrigen: string[];
  temporada: TemporadaFruta;
  sabor: PerfilSabor;
  disponibilidad: Disponibilidad;
  comoComer: string;
  beneficios: string[];
  formaConsumo: string[];
  descripcion: string;
  curiosidad: string;
}

const frutas: FrutaExotica[] = [
  // SUDESTE ASIÁTICO
  {
    nombre: 'Durian',
    nombreCientifico: 'Durio zibethinus',
    region: 'Sudeste Asiático',
    paisesOrigen: ['Tailandia', 'Malasia', 'Indonesia'],
    temporada: 'Verano',
    sabor: 'Cremoso',
    disponibilidad: 'Especialidades',
    comoComer: 'Abrir la corteza espinosa y comer la pulpa amarilla',
    beneficios: ['Rico en triptófano', 'Energético', 'Vitamina C'],
    formaConsumo: ['Crudo', 'Helado', 'Pasta de durian'],
    descripcion:
      "El 'rey de las frutas' en el sudeste asiático. Olor extremadamente intenso y polarizante. Pulpa cremosa y dulce con notas a almendra y queso azul.",
    curiosidad:
      'Está prohibido en hoteles, transporte público y aviones de Singapur por su olor',
  },
  {
    nombre: 'Mangostán',
    nombreCientifico: 'Garcinia mangostana',
    region: 'Sudeste Asiático',
    paisesOrigen: ['Indonesia', 'Tailandia', 'Malasia'],
    temporada: 'Verano',
    sabor: 'Dulce-ácido',
    disponibilidad: 'Especialidades',
    comoComer: 'Cortar la corteza púrpura por la mitad y extraer los gajos blancos',
    beneficios: ['Antioxidantes', 'Antiinflamatorio', 'Vitamina C'],
    formaConsumo: ['Cruda', 'Zumo', 'Postre'],
    descripcion:
      "Conocida como la 'reina de las frutas'. Pulpa blanca y jugosa con sabor a litchi mezclado con melocotón. Su corteza es difícil de abrir y mancha permanentemente.",
    curiosidad:
      'La reina Victoria ofreció 100 libras (de la época) a quien le trajera una fresca a Inglaterra',
  },
  {
    nombre: 'Rambután',
    nombreCientifico: 'Nephelium lappaceum',
    region: 'Sudeste Asiático',
    paisesOrigen: ['Malasia', 'Indonesia', 'Filipinas'],
    temporada: 'Verano',
    sabor: 'Dulce-ácido',
    disponibilidad: 'Especialidades',
    comoComer: 'Pelar la cáscara peluda y comer la pulpa traslúcida',
    beneficios: ['Vitamina C', 'Hierro', 'Antioxidantes'],
    formaConsumo: ['Cruda', 'Almíbar', 'Ensalada'],
    descripcion:
      "Fruta peluda con cáscara roja y pelos verdes. Su nombre significa 'pelo' en malayo. Pulpa similar al lichi pero más jugosa.",
    curiosidad:
      "Los rambutanes 'pelados' parecen ojos humanos — los chefs los usan en platos divertidos",
  },
  {
    nombre: 'Lichi',
    nombreCientifico: 'Litchi chinensis',
    region: 'Sudeste Asiático',
    paisesOrigen: ['China', 'Vietnam', 'Tailandia'],
    temporada: 'Verano',
    sabor: 'Dulce',
    disponibilidad: 'Común',
    comoComer: 'Pelar la cáscara rosada y comer la pulpa blanca',
    beneficios: ['Vitamina C', 'Cobre', 'Antioxidantes'],
    formaConsumo: ['Cruda', 'Almíbar', 'Cócteles'],
    descripcion:
      'Fruta china milenaria con cáscara rojiza áspera y pulpa blanca cristalina. Sabor floral y perfumado, único en el mundo.',
    curiosidad:
      'El emperador Tang Xuanzong establecía relés a caballo desde Cantón a Xian para que su concubina la comiera fresca',
  },
  {
    nombre: 'Longan / Ojo de dragón',
    nombreCientifico: 'Dimocarpus longan',
    region: 'Sudeste Asiático',
    paisesOrigen: ['China', 'Tailandia', 'Vietnam'],
    temporada: 'Verano',
    sabor: 'Dulce',
    disponibilidad: 'Especialidades',
    comoComer: 'Pelar la cáscara marrón y comer la pulpa traslúcida',
    beneficios: ['Hierro', 'Vitamina C', 'Antioxidantes'],
    formaConsumo: ['Cruda', 'Té chino', 'Sopa china'],
    descripcion:
      "Pariente del lichi pero más pequeño y menos perfumado. Su nombre chino 'long yan' significa 'ojo de dragón' por la apariencia de la pulpa con la semilla negra dentro.",
    curiosidad:
      'Es ingrediente de la medicina tradicional china — se cree que tonifica el corazón y calma la mente',
  },
  {
    nombre: 'Pitaya / Fruta del dragón',
    nombreCientifico: 'Hylocereus undatus',
    region: 'América Tropical',
    paisesOrigen: ['México', 'Vietnam', 'Centroamérica'],
    temporada: 'Todo el año',
    sabor: 'Dulce',
    disponibilidad: 'Común',
    comoComer: 'Cortar por la mitad y comer con cuchara, o pelar y trocear',
    beneficios: ['Antioxidantes', 'Fibra', 'Hierro'],
    formaConsumo: ['Cruda', 'Smoothie bowl', 'Ensalada'],
    descripcion:
      'Fruta de cactus con piel rosa intenso y pulpa blanca o roja con semillas negras. Sabor suave entre kiwi y pera.',
    curiosidad:
      'Originaria de México pero Vietnam es hoy el mayor productor mundial: 1 millón de toneladas al año',
  },
  {
    nombre: 'Carambola / Star fruit',
    nombreCientifico: 'Averrhoa carambola',
    region: 'Sudeste Asiático',
    paisesOrigen: ['Indonesia', 'Malasia', 'Filipinas'],
    temporada: 'Otoño',
    sabor: 'Dulce-ácido',
    disponibilidad: 'Común',
    comoComer: 'Lavar y cortar en rodajas en forma de estrella',
    beneficios: ['Vitamina C', 'Antioxidantes', 'Bajo calorías'],
    formaConsumo: ['Cruda', 'Decorativa', 'Zumo'],
    descripcion:
      'Fruta amarilla con cinco aristas que al cortarla forma estrellas perfectas. Sabor entre manzana, pera y uva.',
    curiosidad:
      'Está contraindicada para personas con problemas renales — contiene neurotoxinas que solo afectan en insuficiencia renal',
  },
  {
    nombre: 'Salak / Fruta serpiente',
    nombreCientifico: 'Salacca zalacca',
    region: 'Sudeste Asiático',
    paisesOrigen: ['Indonesia', 'Malasia'],
    temporada: 'Verano',
    sabor: 'Dulce-ácido',
    disponibilidad: 'Especialidades',
    comoComer: 'Pelar la cáscara escamosa y comer los segmentos blancos',
    beneficios: ['Antioxidantes', 'Hierro', 'Calcio'],
    formaConsumo: ['Cruda', 'Encurtida', 'Almíbar'],
    descripcion:
      'Fruta indonesia con cáscara escamosa similar a piel de serpiente. Pulpa blanca y crujiente con sabor entre piña, manzana y plátano.',
    curiosidad:
      "Bali tiene una variedad especial llamada 'salak gula pasir' que se considera la mejor del mundo",
  },
  {
    nombre: 'Jackfruit / Yaca',
    nombreCientifico: 'Artocarpus heterophyllus',
    region: 'Sudeste Asiático',
    paisesOrigen: ['India', 'Bangladesh', 'Sri Lanka'],
    temporada: 'Verano',
    sabor: 'Dulce',
    disponibilidad: 'Especialidades',
    comoComer: 'Madura: comer los gajos. Verde: cocinar como sustituto de carne',
    beneficios: ['Vitamina C', 'Potasio', 'Fibra'],
    formaConsumo: ['Cruda madura', 'Cocinada (verde)', 'Sustituto de carne'],
    descripcion:
      'La fruta más grande del mundo (puede pesar 35 kg). Sabor a piña-plátano-mango. Verde se usa como sustituto de carne en platos vegetarianos.',
    curiosidad:
      'Es la fruta nacional de Bangladesh — un solo árbol puede producir 250 frutas al año',
  },
  {
    nombre: 'Mangostino blanco',
    nombreCientifico: 'Garcinia mangostana',
    region: 'Sudeste Asiático',
    paisesOrigen: ['Indonesia', 'Tailandia'],
    temporada: 'Verano',
    sabor: 'Dulce-ácido',
    disponibilidad: 'Rara',
    comoComer: 'Abrir la corteza dura y comer los gajos blancos',
    beneficios: ['Antioxidantes', 'Vitamina C', 'Manganeso'],
    formaConsumo: ['Cruda', 'Postre', 'Zumo'],
    descripcion:
      'Variedad clara del mangostán tradicional. Pulpa más jugosa y dulce, con menos acidez. Muy difícil de encontrar fuera del sudeste asiático.',
    curiosidad:
      'Solo se cultiva en pequeñas plantaciones de Java — menos de 100 toneladas al año',
  },
  {
    nombre: 'Pomelo / Pummelo',
    nombreCientifico: 'Citrus maxima',
    region: 'Sudeste Asiático',
    paisesOrigen: ['Tailandia', 'Vietnam', 'China'],
    temporada: 'Invierno',
    sabor: 'Dulce-ácido',
    disponibilidad: 'Común',
    comoComer: 'Pelar la corteza gruesa y separar los gajos como pomelo',
    beneficios: ['Vitamina C', 'Fibra', 'Potasio'],
    formaConsumo: ['Cruda', 'Ensalada thai', 'Zumo'],
    descripcion:
      "El 'abuelo' del pomelo y la naranja. Frutas de hasta 2 kg con cáscara muy gruesa y pulpa rosada o blanca menos ácida que el pomelo común.",
    curiosidad:
      'Es uno de los antepasados naturales del pomelo moderno y la mandarina dulce',
  },
  {
    nombre: 'Cherimoya',
    nombreCientifico: 'Annona cherimola',
    region: 'América Tropical',
    paisesOrigen: ['Perú', 'Ecuador', 'Chile'],
    temporada: 'Invierno',
    sabor: 'Cremoso',
    disponibilidad: 'Especialidades',
    comoComer: 'Cortar por la mitad y comer con cuchara la pulpa cremosa',
    beneficios: ['Vitamina C', 'Vitamina B6', 'Magnesio'],
    formaConsumo: ['Cruda', 'Helado', 'Smoothie'],
    descripcion:
      "Fruta cremosa con piel verde escamosa y pulpa blanca dulce. Sabor entre piña, plátano y vainilla. Mark Twain la llamó 'la fruta más deliciosa conocida por el hombre'.",
    curiosidad:
      'España es el mayor productor europeo y mundial fuera de los Andes — Granada y Málaga la cultivan desde el siglo XVI',
  },

  // AMÉRICA TROPICAL
  {
    nombre: 'Maracuyá / Fruta de la pasión',
    nombreCientifico: 'Passiflora edulis',
    region: 'América Tropical',
    paisesOrigen: ['Brasil', 'Colombia', 'Perú'],
    temporada: 'Todo el año',
    sabor: 'Ácido',
    disponibilidad: 'Común',
    comoComer: 'Cortar por la mitad y extraer la pulpa con semillas con cuchara',
    beneficios: ['Vitamina C', 'Antioxidantes', 'Fibra'],
    formaConsumo: ['Pulpa cruda', 'Zumo', 'Mousse'],
    descripcion:
      'Fruta tropical con piel arrugada y pulpa amarillenta llena de semillas crujientes. Sabor intenso ácido-dulce muy aromático.',
    curiosidad:
      'Recibió ese nombre de los misioneros jesuitas: la flor de pasiflora les recordaba la Pasión de Cristo',
  },
  {
    nombre: 'Guayaba',
    nombreCientifico: 'Psidium guajava',
    region: 'América Tropical',
    paisesOrigen: ['México', 'Colombia', 'Brasil'],
    temporada: 'Otoño',
    sabor: 'Dulce',
    disponibilidad: 'Común',
    comoComer: 'Lavar y comer entera (con piel y semillas)',
    beneficios: ['Vitamina C 4x naranja', 'Fibra', 'Antioxidantes'],
    formaConsumo: ['Cruda', 'Zumo', 'Pasta de guayaba'],
    descripcion:
      'Fruta tropical con cáscara verde-amarilla y pulpa blanca, rosa o roja. Sabor dulce-ácido con notas a fresa y pera. Aroma muy característico.',
    curiosidad:
      'Tiene 4 veces más vitamina C que una naranja — 200 mg por 100g',
  },
  {
    nombre: 'Papaya',
    nombreCientifico: 'Carica papaya',
    region: 'América Tropical',
    paisesOrigen: ['México', 'India', 'Brasil'],
    temporada: 'Todo el año',
    sabor: 'Dulce',
    disponibilidad: 'Común',
    comoComer:
      'Cortar por la mitad, retirar semillas y comer con cuchara o trocear',
    beneficios: ['Papaína (digestiva)', 'Vitamina C', 'Vitamina A'],
    formaConsumo: ['Cruda', 'Smoothie', 'Ensalada thai'],
    descripcion:
      'Fruta tropical con cáscara naranja y pulpa naranja-rosada con muchas semillas negras comestibles. Sabor suave y dulce, ligeramente terroso.',
    curiosidad:
      "Cristóbal Colón la llamó 'la fruta de los ángeles' al probarla por primera vez en el Caribe",
  },
  {
    nombre: 'Chirimoya peruana',
    nombreCientifico: 'Annona muricata',
    region: 'América Tropical',
    paisesOrigen: ['Perú', 'Brasil', 'Colombia'],
    temporada: 'Verano',
    sabor: 'Cremoso',
    disponibilidad: 'Especialidades',
    comoComer: 'Cortar por la mitad y comer con cuchara la pulpa blanca',
    beneficios: ['Vitamina C', 'Vitamina B1', 'Hierro'],
    formaConsumo: ['Cruda', 'Helado', 'Zumo'],
    descripcion:
      'Fruta de la familia de las anonáceas, similar a la cherimoya pero más grande y con sabor más intenso. Usada en repostería peruana.',
    curiosidad:
      "Los incas llamaban a esta familia 'mama-mocha', considerándola fruta sagrada de los Andes",
  },
  {
    nombre: 'Guanábana / Soursop',
    nombreCientifico: 'Annona muricata',
    region: 'América Tropical',
    paisesOrigen: ['México', 'Centroamérica', 'Caribe'],
    temporada: 'Verano',
    sabor: 'Dulce-ácido',
    disponibilidad: 'Especialidades',
    comoComer: 'Pelar y comer la pulpa blanca evitando las semillas',
    beneficios: ['Vitamina C', 'Antioxidantes', 'Fibra'],
    formaConsumo: ['Cruda', 'Zumo', 'Helado'],
    descripcion:
      'Fruta grande con cáscara verde espinosa y pulpa blanca jugosa. Sabor ácido entre piña, fresa y cítricos. Muy aromática.',
    curiosidad:
      'Investigaciones preliminares sugieren propiedades anticancerígenas — pero falta evidencia clínica',
  },
  {
    nombre: 'Pitahaya amarilla',
    nombreCientifico: 'Selenicereus megalanthus',
    region: 'América Tropical',
    paisesOrigen: ['Colombia', 'Ecuador', 'Perú'],
    temporada: 'Otoño',
    sabor: 'Dulce',
    disponibilidad: 'Especialidades',
    comoComer: 'Cortar por la mitad y comer con cuchara la pulpa blanca',
    beneficios: ['Antioxidantes', 'Fibra', 'Vitamina C'],
    formaConsumo: ['Cruda', 'Smoothie', 'Ensalada'],
    descripcion:
      'Variedad amarilla de la pitahaya con piel rugosa amarilla y pulpa blanca con semillas negras. Más dulce que la pitahaya rosa común.',
    curiosidad:
      'Crece en cactus epífitos que solo florecen una noche al año en Colombia y Ecuador',
  },
  {
    nombre: 'Granadilla',
    nombreCientifico: 'Passiflora ligularis',
    region: 'América Tropical',
    paisesOrigen: ['Colombia', 'Perú', 'Bolivia'],
    temporada: 'Otoño',
    sabor: 'Dulce',
    disponibilidad: 'Especialidades',
    comoComer: 'Cascar la cáscara dura y sorber la pulpa con semillas',
    beneficios: ['Vitamina A', 'Vitamina C', 'Hierro'],
    formaConsumo: ['Cruda', 'Zumo', 'Postres'],
    descripcion:
      'Pariente del maracuyá pero más dulce. Cáscara dura naranja y pulpa traslúcida llena de semillas negras crujientes. Sabor a néctar floral.',
    curiosidad:
      "Es la 'fruta favorita de los niños' en Colombia — se vende en las puertas de los colegios",
  },
  {
    nombre: 'Tamarindo',
    nombreCientifico: 'Tamarindus indica',
    region: 'América Tropical',
    paisesOrigen: ['México', 'India', 'Tailandia'],
    temporada: 'Invierno',
    sabor: 'Ácido',
    disponibilidad: 'Común',
    comoComer: 'Pelar la vaina y chupar/comer la pulpa marrón',
    beneficios: ['Magnesio', 'Hierro', 'Vitamina B'],
    formaConsumo: ['Pulpa', 'Pasta', 'Salsa'],
    descripcion:
      'Vaina marrón con pulpa pegajosa marrón oscura. Sabor agrio-dulce intenso, base de salsas asiáticas, latinas y africanas.',
    curiosidad:
      "El nombre viene del árabe 'tamr hindi' (dátil indio) — los árabes lo llevaron de Asia a África y América",
  },
  {
    nombre: 'Lulo / Naranjilla',
    nombreCientifico: 'Solanum quitoense',
    region: 'América Tropical',
    paisesOrigen: ['Colombia', 'Ecuador'],
    temporada: 'Otoño',
    sabor: 'Ácido',
    disponibilidad: 'Especialidades',
    comoComer: 'Cortar por la mitad y exprimir la pulpa para zumo',
    beneficios: ['Vitamina C', 'Hierro', 'Calcio'],
    formaConsumo: ['Zumo', 'Helado', 'Postre'],
    descripcion:
      'Fruta colombiana con cáscara naranja peluda y pulpa verde gelatinosa. Sabor entre piña, fresa y kiwi. Casi siempre se consume en zumo.',
    curiosidad:
      'El zumo de lulo es la bebida más popular de Colombia — más que la limonada',
  },
  {
    nombre: 'Capulí / Cereza andina',
    nombreCientifico: 'Prunus serotina',
    region: 'América Tropical',
    paisesOrigen: ['Perú', 'Ecuador', 'Colombia'],
    temporada: 'Verano',
    sabor: 'Dulce',
    disponibilidad: 'Rara',
    comoComer: 'Lavar y comer enteras (escupir el hueso)',
    beneficios: ['Antioxidantes', 'Vitamina C', 'Hierro'],
    formaConsumo: ['Cruda', 'Mermelada', 'Licor'],
    descripcion:
      'Cereza andina autóctona con sabor entre cereza y ciruela. Crece en los Andes desde antes de los Incas. Considerada fruta nativa por excelencia.',
    curiosidad:
      'Los Incas la fermentaban para obtener una chicha especial reservada para ceremonias religiosas',
  },

  // ÁFRICA Y MEDITERRÁNEO
  {
    nombre: 'Marula',
    nombreCientifico: 'Sclerocarya birrea',
    region: 'África',
    paisesOrigen: ['Sudáfrica', 'Mozambique', 'Botsuana'],
    temporada: 'Verano',
    sabor: 'Dulce-ácido',
    disponibilidad: 'Rara',
    comoComer: 'Pelar y comer cruda o usar para licor (Amarula)',
    beneficios: [
      'Vitamina C 4x naranja',
      'Antioxidantes',
      'Aceite cosmético',
    ],
    formaConsumo: ['Cruda', 'Licor Amarula', 'Aceite'],
    descripcion:
      "Fruta africana sagrada con piel amarilla y pulpa blanca aromática. Famosa como base del licor crema Amarula. Los elefantes se 'emborrachan' al comerla fermentada.",
    curiosidad:
      'Los elefantes pueden detectar marulas maduras a 7 km de distancia — caminan días para encontrarlas',
  },
  {
    nombre: 'Baobab',
    nombreCientifico: 'Adansonia digitata',
    region: 'África',
    paisesOrigen: ['Senegal', 'Malí', 'Sudán'],
    temporada: 'Otoño',
    sabor: 'Ácido',
    disponibilidad: 'Rara',
    comoComer: 'Pulpa seca: triturar o disolver en agua',
    beneficios: ['Vitamina C 6x naranja', 'Calcio 2x leche', 'Fibra prebiótica'],
    formaConsumo: ['Polvo', 'Bebidas', 'Smoothies'],
    descripcion:
      "Fruta del 'árbol de la vida' africano. Pulpa naturalmente seca y polvo blanco con sabor ácido a sorbete de cítrico. Superalimento emergente en Europa.",
    curiosidad:
      'El árbol del baobab puede vivir 6.000 años — los más antiguos son contemporáneos de las pirámides',
  },
  {
    nombre: 'Kiwano / Melón cornudo',
    nombreCientifico: 'Cucumis metuliferus',
    region: 'África',
    paisesOrigen: ['Kenia', 'Sudáfrica', 'Nueva Zelanda'],
    temporada: 'Verano',
    sabor: 'Ácido',
    disponibilidad: 'Especialidades',
    comoComer:
      'Cortar por la mitad y sorber/cucharear la pulpa verde gelatinosa',
    beneficios: ['Vitamina C', 'Hierro', 'Magnesio'],
    formaConsumo: ['Cruda', 'Decoración', 'Cocteles'],
    descripcion:
      'Fruta africana con piel naranja con cuernos. Pulpa verde gelatinosa con sabor entre pepino, plátano y kiwi. Muy decorativa.',
    curiosidad:
      'Los marineros africanos la llevaban en sus barcos por su alta hidratación y vitamina C',
  },
  {
    nombre: 'Persimón / Caqui',
    nombreCientifico: 'Diospyros kaki',
    region: 'Mediterráneo',
    paisesOrigen: ['China', 'Japón', 'España'],
    temporada: 'Otoño',
    sabor: 'Dulce',
    disponibilidad: 'Común',
    comoComer: 'Madura: comer entera con piel. Verde: dejar madurar',
    beneficios: ['Vitamina A', 'Vitamina C', 'Fibra'],
    formaConsumo: ['Cruda', 'Postres', 'Ensaladas'],
    descripcion:
      "Fruta naranja brillante similar a un tomate. La variedad española 'persimón' (DOP Ribera del Xúquer) es no astringente y se come dura como manzana.",
    curiosidad:
      'España es el principal productor europeo de persimón — la DOP Ribera del Xúquer marcó el cambio en 1998',
  },
  {
    nombre: 'Higo chumbo / Tuna',
    nombreCientifico: 'Opuntia ficus-indica',
    region: 'Mediterráneo',
    paisesOrigen: ['México', 'España', 'Italia'],
    temporada: 'Verano',
    sabor: 'Dulce',
    disponibilidad: 'Común',
    comoComer:
      'Pelar con cuidado de las espinas y comer la pulpa con semillas',
    beneficios: ['Antioxidantes', 'Fibra', 'Magnesio'],
    formaConsumo: ['Cruda', 'Mermelada', 'Licor'],
    descripcion:
      'Fruta del nopal mexicano. Cáscara espinosa y pulpa naranja, roja o blanca llena de semillas comestibles. Originario de México pero icono del Mediterráneo.',
    curiosidad:
      'Aparece en el escudo nacional de México sobre un águila comiéndose una serpiente',
  },
  {
    nombre: 'Níspero japonés',
    nombreCientifico: 'Eriobotrya japonica',
    region: 'Asia',
    paisesOrigen: ['China', 'Japón', 'España'],
    temporada: 'Primavera',
    sabor: 'Dulce-ácido',
    disponibilidad: 'Común',
    comoComer:
      'Lavar y comer la pulpa amarilla (escupir las semillas grandes)',
    beneficios: ['Vitamina A', 'Potasio', 'Pectina'],
    formaConsumo: ['Cruda', 'Mermelada', 'Licor'],
    descripcion:
      "Fruta amarilla pequeña con pulpa jugosa y semillas grandes y oscuras. España (Callosa d'en Sarrià) tiene una de las mayores producciones del mundo.",
    curiosidad:
      'El loquat (níspero) llegó a España desde Japón a finales del siglo XVIII — antes solo se conocía el níspero europeo',
  },
  {
    nombre: 'Granada',
    nombreCientifico: 'Punica granatum',
    region: 'Mediterráneo',
    paisesOrigen: ['Irán', 'España', 'Turquía'],
    temporada: 'Otoño',
    sabor: 'Ácido',
    disponibilidad: 'Común',
    comoComer: 'Cortar la corona, romper en gajos y desgranar bajo agua',
    beneficios: ['Antioxidantes', 'Vitamina K', 'Polifenoles'],
    formaConsumo: ['Granos', 'Zumo', 'Salsas'],
    descripcion:
      'Fruta del Mediterráneo con cáscara roja-amarilla y cientos de granos jugosos en el interior. Sabor agridulce, símbolo de fertilidad y abundancia.',
    curiosidad:
      'La granada da nombre a la ciudad española Granada — y aparece en su escudo desde 1492',
  },
  {
    nombre: 'Membrillo',
    nombreCientifico: 'Cydonia oblonga',
    region: 'Mediterráneo',
    paisesOrigen: ['España', 'Portugal', 'Turquía'],
    temporada: 'Otoño',
    sabor: 'Astringente',
    disponibilidad: 'Común',
    comoComer: 'No se come crudo — siempre cocinado en dulce',
    beneficios: ['Pectina', 'Vitamina C', 'Antioxidantes'],
    formaConsumo: ['Dulce de membrillo', 'Mermelada', 'Compota'],
    descripcion:
      'Fruta amarilla con piel pelusa y pulpa muy astringente cruda. Cocida con azúcar se transforma en el famoso dulce de membrillo. Clásico mediterráneo.',
    curiosidad:
      "El dulce de membrillo se inventó en Portugal — el nombre 'marmalade' deriva de 'marmelo' (membrillo en portugués)",
  },

  // ASIA EXTRA Y OCEANÍA
  {
    nombre: 'Yuzu',
    nombreCientifico: 'Citrus junos',
    region: 'Asia',
    paisesOrigen: ['Japón', 'Corea', 'China'],
    temporada: 'Invierno',
    sabor: 'Ácido',
    disponibilidad: 'Especialidades',
    comoComer: 'No se come en gajos — solo zumo y ralladura',
    beneficios: ['Vitamina C 3x limón', 'Antioxidantes', 'Aceites esenciales'],
    formaConsumo: ['Zumo', 'Ralladura', 'Salsa ponzu'],
    descripcion:
      'Cítrico japonés extremadamente aromático. Cruce natural entre mandarina y limón ichang. Solo se usan zumo y piel — la pulpa es demasiado ácida para comer.',
    curiosidad:
      'Una pequeña botella de yuzu fresco puede costar 50€ en restaurantes japoneses europeos',
  },
  {
    nombre: 'Kumquat',
    nombreCientifico: 'Citrus japonica',
    region: 'Asia',
    paisesOrigen: ['China', 'Japón'],
    temporada: 'Invierno',
    sabor: 'Ácido',
    disponibilidad: 'Común',
    comoComer: 'Lavar y comer entera (con piel)',
    beneficios: ['Vitamina C', 'Fibra', 'Antioxidantes'],
    formaConsumo: ['Cruda', 'Confitada', 'Licor'],
    descripcion:
      'Cítrico chino del tamaño de una uva. Característica única: la piel es dulce y la pulpa es ácida, así que se come al revés que las naranjas.',
    curiosidad:
      "Su nombre en chino 'jin ju' (金橘) significa 'naranja de oro' — se regala en Año Nuevo chino para atraer prosperidad",
  },
  {
    nombre: 'Mango Alphonso',
    nombreCientifico: 'Mangifera indica',
    region: 'Asia',
    paisesOrigen: ['India (Maharashtra)'],
    temporada: 'Verano',
    sabor: 'Dulce',
    disponibilidad: 'Especialidades',
    comoComer: 'Pelar y comer en rodajas o cortar en cubos',
    beneficios: ['Vitamina A', 'Vitamina C', 'Fibra'],
    formaConsumo: ['Cruda', 'Lassi', 'Postres indios'],
    descripcion:
      "El 'rey de los mangos' indio. Variedad Alphonso (Hapus) cultivada en Maharashtra. Pulpa cremosa, dulce intensa y aromática. Temporada muy corta (abril-junio).",
    curiosidad:
      'Está protegido por IGP india — solo el mango cultivado en zonas específicas puede llamarse Alphonso auténtico',
  },
  {
    nombre: 'Sapote negro',
    nombreCientifico: 'Diospyros nigra',
    region: 'América Tropical',
    paisesOrigen: ['México', 'Centroamérica'],
    temporada: 'Otoño',
    sabor: 'Cremoso',
    disponibilidad: 'Rara',
    comoComer:
      'Cortar y comer con cuchara la pulpa negra cuando está blanda',
    beneficios: ['Vitamina C', 'Potasio', 'Hierro'],
    formaConsumo: ['Cruda', 'Postre', 'Smoothie'],
    descripcion:
      "Fruta mexicana con cáscara verde y pulpa que se vuelve negra y cremosa al madurar. Sabor a chocolate-vainilla — se llama 'fruta del chocolate'.",
    curiosidad:
      'Cuando está madura su textura es idéntica a una mousse de chocolate',
  },
  {
    nombre: 'Feijoa',
    nombreCientifico: 'Acca sellowiana',
    region: 'Oceanía',
    paisesOrigen: ['Brasil', 'Nueva Zelanda', 'Australia'],
    temporada: 'Otoño',
    sabor: 'Tropical',
    disponibilidad: 'Especialidades',
    comoComer: 'Cortar por la mitad y comer con cuchara la pulpa',
    beneficios: ['Vitamina C', 'Yodo', 'Fibra'],
    formaConsumo: ['Cruda', 'Mermelada', 'Smoothie'],
    descripcion:
      'Fruta verde-amarilla con pulpa cristalina aromática. Sabor entre piña, guayaba y menta. Originaria de Sudamérica pero adoptada como fruta nacional en Nueva Zelanda.',
    curiosidad:
      "Los neozelandeses la consideran 'su fruta nacional' aunque sea originaria de Brasil",
  },
  {
    nombre: 'Quenepa / Mamoncillo',
    nombreCientifico: 'Melicoccus bijugatus',
    region: 'América Tropical',
    paisesOrigen: ['Caribe', 'Venezuela', 'Colombia'],
    temporada: 'Verano',
    sabor: 'Dulce-ácido',
    disponibilidad: 'Rara',
    comoComer: 'Cascar la piel y chupar la pulpa alrededor del hueso',
    beneficios: ['Vitamina C', 'Hierro', 'Calcio'],
    formaConsumo: ['Cruda'],
    descripcion:
      'Fruta del Caribe con piel verde dura y pulpa naranja gelatinosa alrededor de un gran hueso. Se chupa en lugar de comerla. Refrescante en climas tropicales.',
    curiosidad:
      'En Cuba se vende en racimos como uvas en los puestos callejeros — fruta de verano por excelencia',
  },
  {
    nombre: 'Higos brevas',
    nombreCientifico: 'Ficus carica',
    region: 'Mediterráneo',
    paisesOrigen: ['España', 'Italia', 'Grecia'],
    temporada: 'Verano',
    sabor: 'Dulce',
    disponibilidad: 'Común',
    comoComer: 'Lavar y comer enteros con piel',
    beneficios: ['Fibra', 'Calcio', 'Magnesio'],
    formaConsumo: ['Cruda', 'Pasos', 'Mermelada'],
    descripcion:
      'Brevas son la primera cosecha (junio) y los higos la segunda (agosto-octubre). Misma especie pero las brevas son más grandes y menos dulces.',
    curiosidad:
      'Los romanos consideraban los higos sagrados — Rómulo y Remo fueron amamantados bajo una higuera',
  },
  {
    nombre: 'Mamey',
    nombreCientifico: 'Pouteria sapota',
    region: 'América Tropical',
    paisesOrigen: ['México', 'Centroamérica', 'Caribe'],
    temporada: 'Verano',
    sabor: 'Dulce',
    disponibilidad: 'Especialidades',
    comoComer: 'Cortar por la mitad y comer con cuchara la pulpa naranja',
    beneficios: ['Vitamina A', 'Vitamina C', 'Hierro'],
    formaConsumo: ['Cruda', 'Smoothie', 'Helado'],
    descripcion:
      'Fruta mexicana con cáscara marrón áspera y pulpa naranja brillante muy cremosa. Sabor entre boniato, almendra y caqui. Muy nutritiva.',
    curiosidad:
      'Los mayas la usaban como dulce ceremonial — sigue siendo el sabor preferido del helado en Cuba y Yucatán',
  },
  {
    nombre: 'Carambolo / Bilimbí',
    nombreCientifico: 'Averrhoa bilimbi',
    region: 'Sudeste Asiático',
    paisesOrigen: ['Indonesia', 'Malasia', 'Filipinas'],
    temporada: 'Todo el año',
    sabor: 'Ácido',
    disponibilidad: 'Rara',
    comoComer: 'Solo cocinado o encurtido — extremadamente ácido crudo',
    beneficios: ['Vitamina C', 'Antioxidantes', 'Fibra'],
    formaConsumo: ['Encurtido', 'Curry', 'Mermelada'],
    descripcion:
      'Pariente de la carambola pero alargado y mucho más ácido. Casi imposible de comer crudo. Se usa en curries asiáticos y conservas agridulces.',
    curiosidad:
      'En Indonesia se usa como sustituto del vinagre en muchos platos tradicionales',
  },
];

const REGIONES: (RegionFruta | 'Todas')[] = [
  'Todas',
  'Sudeste Asiático',
  'América Tropical',
  'África',
  'Oceanía',
  'Mediterráneo',
  'Asia',
];

const TEMPORADAS: (TemporadaFruta | 'Todas')[] = [
  'Todas',
  'Primavera',
  'Verano',
  'Otoño',
  'Invierno',
  'Todo el año',
];

const SABORES: (PerfilSabor | 'Todos')[] = [
  'Todos',
  'Dulce',
  'Ácido',
  'Dulce-ácido',
  'Tropical',
  'Cremoso',
  'Aromático',
  'Astringente',
];

const DISPONIBILIDADES: (Disponibilidad | 'Todas')[] = [
  'Todas',
  'Común',
  'Especialidades',
  'Rara',
];

export default function GuiaFrutasExoticasPage() {
  const [busqueda, setBusqueda] = useState('');
  const [region, setRegion] = useState<RegionFruta | 'Todas'>('Todas');
  const [temporada, setTemporada] = useState<TemporadaFruta | 'Todas'>('Todas');
  const [sabor, setSabor] = useState<PerfilSabor | 'Todos'>('Todos');
  const [disponibilidad, setDisponibilidad] = useState<
    Disponibilidad | 'Todas'
  >('Todas');

  const frutasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return frutas.filter((f) => {
      if (termino) {
        const enNombre = f.nombre.toLowerCase().includes(termino);
        const enCientifico = f.nombreCientifico
          .toLowerCase()
          .includes(termino);
        const enPaises = f.paisesOrigen.some((p) =>
          p.toLowerCase().includes(termino)
        );
        if (!enNombre && !enCientifico && !enPaises) return false;
      }
      if (region !== 'Todas' && f.region !== region) return false;
      if (temporada !== 'Todas' && f.temporada !== temporada) return false;
      if (sabor !== 'Todos' && f.sabor !== sabor) return false;
      if (disponibilidad !== 'Todas' && f.disponibilidad !== disponibilidad)
        return false;
      return true;
    });
  }, [busqueda, region, temporada, sabor, disponibilidad]);

  const limpiarFiltros = () => {
    setBusqueda('');
    setRegion('Todas');
    setTemporada('Todas');
    setSabor('Todos');
    setDisponibilidad('Todas');
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Guía de Frutas Exóticas del Mundo</h1>
        <p>
          40 frutas tropicales y raras: origen, temporada, sabor, beneficios y
          formas de consumo
        </p>
      </header>

      <LegalNotice />

      <section className={styles.filtersCard}>
        <div className={styles.searchRow}>
          <input
            type="text"
            placeholder="Buscar por nombre, nombre científico o país de origen..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={styles.searchInput}
            aria-label="Buscar fruta exótica"
          />
          <button
            type="button"
            onClick={limpiarFiltros}
            className={styles.btnLimpiar}
          >
            Limpiar filtros
          </button>
        </div>

        <div className={styles.filtersGrid}>
          <div className={styles.filterGroup}>
            <label htmlFor="region">Región</label>
            <select
              id="region"
              value={region}
              onChange={(e) =>
                setRegion(e.target.value as RegionFruta | 'Todas')
              }
            >
              {REGIONES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="temporada">Temporada</label>
            <select
              id="temporada"
              value={temporada}
              onChange={(e) =>
                setTemporada(e.target.value as TemporadaFruta | 'Todas')
              }
            >
              {TEMPORADAS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="sabor">Sabor</label>
            <select
              id="sabor"
              value={sabor}
              onChange={(e) =>
                setSabor(e.target.value as PerfilSabor | 'Todos')
              }
            >
              {SABORES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="disponibilidad">Disponibilidad</label>
            <select
              id="disponibilidad"
              value={disponibilidad}
              onChange={(e) =>
                setDisponibilidad(
                  e.target.value as Disponibilidad | 'Todas'
                )
              }
            >
              {DISPONIBILIDADES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.contador} role="status" aria-live="polite">
          Mostrando <strong>{frutasFiltradas.length}</strong> de{' '}
          <strong>{frutas.length}</strong> frutas
        </div>
      </section>

      <section className={styles.grid}>
        {frutasFiltradas.length === 0 ? (
          <div className={styles.sinResultados}>
            <p>
              No se han encontrado frutas con esos filtros. Prueba a limpiar
              los filtros o cambiar la búsqueda.
            </p>
          </div>
        ) : (
          frutasFiltradas.map((f) => (
            <article key={f.nombre} className={styles.card}>
              <header className={styles.cardHeader}>
                <h2>{f.nombre}</h2>
                <p className={styles.cientifico}>
                  <em>{f.nombreCientifico}</em>
                </p>
              </header>

              <div className={styles.badges}>
                <span className={`${styles.badge} ${styles.badgeRegion}`}>
                  {f.region}
                </span>
                <span className={`${styles.badge} ${styles.badgeSabor}`}>
                  {f.sabor}
                </span>
                <span
                  className={`${styles.badge} ${styles.badgeDisponibilidad}`}
                >
                  {f.disponibilidad}
                </span>
              </div>

              <div className={styles.cardSection}>
                <strong>Temporada:</strong> {f.temporada}
              </div>

              <div className={styles.cardSection}>
                <strong>Origen:</strong> {f.paisesOrigen.join(', ')}
              </div>

              <p className={styles.descripcion}>{f.descripcion}</p>

              <div className={styles.cardSection}>
                <strong>Cómo comerla:</strong> {f.comoComer}
              </div>

              <div className={styles.cardSection}>
                <strong>Beneficios:</strong>
                <div className={styles.pills}>
                  {f.beneficios.map((b) => (
                    <span key={b} className={styles.pill}>
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.cardSection}>
                <strong>Formas de consumo:</strong>
                <ul className={styles.lista}>
                  {f.formaConsumo.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.curiosidad}>
                <strong>Curiosidad:</strong> {f.curiosidad}
              </div>
            </article>
          ))
        )}
      </section>

      <EducationalSection
        title="Guía de Frutas Exóticas del Mundo"
        subtitle="Descubre 40 frutas tropicales y raras: origen, temporada, beneficios y cómo disfrutarlas"
      >
        <h3>Introducción</h3>
        <p>
          Las frutas exóticas son ventanas a otros climas, culturas y
          biodiversidades. Desde el durian malayo, prohibido en aviones, hasta
          el yuzu japonés que perfuma la alta cocina, cada una tiene una
          historia botánica, cultural y nutricional propia. Esta guía reúne 40
          frutas representativas de seis grandes regiones del mundo, con
          información práctica para identificarlas, comprarlas y disfrutarlas.
        </p>

        <h3>Tabla comparativa por región</h3>
        <div className={styles.tablaWrapper}>
          <table className={styles.tablaComparativa}>
            <thead>
              <tr>
                <th>Región</th>
                <th>Frutas representativas</th>
                <th>Sabor predominante</th>
                <th>Disponibilidad en Europa</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sudeste Asiático</td>
                <td>Durian, mangostán, rambután, lichi</td>
                <td>Cremoso y dulce-ácido</td>
                <td>Especialidades / Rara</td>
              </tr>
              <tr>
                <td>América Tropical</td>
                <td>Maracuyá, guayaba, papaya, cherimoya</td>
                <td>Dulce y ácido</td>
                <td>Común / Especialidades</td>
              </tr>
              <tr>
                <td>África</td>
                <td>Marula, baobab, kiwano</td>
                <td>Ácido y aromático</td>
                <td>Rara</td>
              </tr>
              <tr>
                <td>Mediterráneo</td>
                <td>Granada, higo chumbo, persimón, membrillo</td>
                <td>Dulce y astringente</td>
                <td>Común</td>
              </tr>
              <tr>
                <td>Asia (extra)</td>
                <td>Yuzu, kumquat, mango Alphonso, níspero</td>
                <td>Ácido y dulce</td>
                <td>Común / Especialidades</td>
              </tr>
              <tr>
                <td>Oceanía</td>
                <td>Feijoa</td>
                <td>Tropical aromático</td>
                <td>Especialidades</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Casos de uso</h3>
        <ol>
          <li>
            <strong>Curiosos gastronómicos:</strong> Quien quiere explorar
            sabores nuevos sin moverse de Europa puede empezar por las
            disponibles en grandes superficies (pitaya, lichi, maracuyá,
            persimón) y avanzar después a especialidades (mangostán, rambután,
            cherimoya).
          </li>
          <li>
            <strong>Viajeros:</strong> Antes de viajar al sudeste asiático,
            Sudamérica o África vale la pena conocer las frutas locales para
            poder pedirlas en mercados, identificar las maduras y saber cómo se
            comen.
          </li>
          <li>
            <strong>Smoothies y bowls:</strong> Frutas como pitaya, maracuyá,
            mango, papaya o cherimoya son la base perfecta de smoothies y
            bowls saludables.
          </li>
          <li>
            <strong>Postres exóticos:</strong> Yuzu, lichi, granadilla, mamey o
            sapote negro permiten elevar postres caseros con sabores únicos
            difíciles de igualar con frutas comunes.
          </li>
        </ol>

        <h3>5 pasos para identificar una fruta exótica madura</h3>
        <ol>
          <li>
            <strong>Mira el color:</strong> La mayoría de frutas tropicales
            avisan con un cambio de tono (verde a amarillo en mango, rosa
            intenso en pitaya, púrpura oscuro en mangostán).
          </li>
          <li>
            <strong>Toca la piel:</strong> Una ligera presión debe ceder pero
            no hundirse. Si la fruta está dura como una piedra, le faltan
            días; si se hunde, está pasada.
          </li>
          <li>
            <strong>Huele cerca del tallo:</strong> Una fruta madura tiene
            aroma intenso en la zona del pedúnculo. Sin olor = sin sabor.
          </li>
          <li>
            <strong>Observa el peso:</strong> A igualdad de tamaño, las frutas
            jugosas pesan más. Maracuyá ligero = seco por dentro.
          </li>
          <li>
            <strong>Confía en el contexto:</strong> Pregunta al frutero o
            consulta la temporada local. Una fruta fuera de temporada casi
            nunca llega en su mejor estado.
          </li>
        </ol>

        <h3>5 tips de conservación</h3>
        <ul>
          <li>
            Las frutas tropicales <strong>no maduras</strong> (mango, papaya,
            cherimoya, aguacate, plátano) deben dejarse a temperatura ambiente
            hasta madurar; nunca en la nevera.
          </li>
          <li>
            Una vez maduras, se prolongan 2-3 días en la nevera. Para más
            tiempo, congela la pulpa en cubitos.
          </li>
          <li>
            La <strong>pitaya, lichi y rambután</strong> aguantan hasta 1
            semana en frío. Cómelos pronto: pierden aroma rápidamente.
          </li>
          <li>
            El <strong>durian</strong> debe consumirse el mismo día de la
            apertura — su olor se vuelve insoportable y la pulpa se oxida.
          </li>
          <li>
            Frutas con piel (granada, kumquat, kiwano) se conservan 2-3 semanas
            en la frutera fuera de la nevera.
          </li>
        </ul>

        <h3>4 tips para disfrutarlas mejor</h3>
        <ul>
          <li>
            <strong>Acompaña con notas suaves:</strong> Yogurt griego, leche de
            coco, hojas de menta o limón realzan los sabores tropicales sin
            taparlos.
          </li>
          <li>
            <strong>Refresca antes de servir:</strong> Casi todas las frutas
            tropicales saben mejor frescas (no congeladas) — 1 hora en nevera
            antes.
          </li>
          <li>
            <strong>Mezcla texturas:</strong> Frutas cremosas (cherimoya,
            mamey, sapote) maridan bien con frutas crujientes (carambola,
            kumquat, granada).
          </li>
          <li>
            <strong>No descartes la curiosidad:</strong> Pruébalas en su forma
            tradicional antes de aplicarlas a recetas occidentales — entender
            el sabor original ayuda a usarlas creativamente.
          </li>
        </ul>

        <h3>Preguntas frecuentes</h3>
        <details>
          <summary>¿Dónde compro frutas exóticas en España?</summary>
          <p>
            Las grandes superficies (Carrefour, El Corte Inglés, Mercadona)
            tienen las más comunes (pitaya, lichi, maracuyá, mango, papaya).
            Para especialidades hay que buscar en mercados étnicos asiáticos,
            tiendas latinas/africanas, o servicios de venta online
            especializados.
          </p>
        </details>
        <details>
          <summary>¿Las frutas exóticas son más nutritivas?</summary>
          <p>
            No necesariamente más, pero sí <strong>diferentes</strong>. La
            guayaba tiene 4× más vitamina C que la naranja; el baobab tiene 6×
            más vitamina C y 2× más calcio que la leche. Sin embargo, una
            manzana o una naranja españolas siguen siendo perfectamente sanas.
          </p>
        </details>
        <details>
          <summary>¿Hay frutas exóticas peligrosas?</summary>
          <p>
            La <strong>carambola</strong> está contraindicada en personas con
            insuficiencia renal (contiene neurotoxinas). El <strong>ackee</strong>{' '}
            jamaicano sin madurar es tóxico. Algunas anonáceas (chirimoya,
            guanábana) tienen alcaloides en semillas que no deben masticarse.
          </p>
        </details>
        <details>
          <summary>¿Por qué algunas frutas son tan caras en Europa?</summary>
          <p>
            Por logística (frutas como mangostán o durian son delicadas y
            pierden calidad rápido), por baja oferta (mango Alphonso solo
            existe 2-3 meses al año), o por restricciones fitosanitarias
            europeas que limitan importaciones desde ciertos países.
          </p>
        </details>
        <details>
          <summary>¿Puedo cultivar frutas exóticas en España?</summary>
          <p>
            Sí, varias. España es uno de los principales productores europeos
            de cherimoya (Granada-Málaga), persimón (Valencia), aguacate y
            mango (Costa Tropical). En Canarias se cultiva piña, papaya y
            guayaba. Pitaya y feijoa empiezan a producirse en zonas cálidas.
          </p>
        </details>

        <div className={styles.warningBox}>
          <h4>Errores frecuentes a evitar</h4>
          <ul>
            <li>
              <strong>Llevar durian en avión o tren:</strong> Su olor es tan
              intenso que está prohibido en transporte público de Singapur,
              Tailandia y la mayoría de aerolíneas asiáticas.
            </li>
            <li>
              <strong>Comer carambola con problemas renales:</strong> Contiene
              caramboxina, neurotóxica solo en personas con insuficiencia
              renal. Puede provocar convulsiones e incluso la muerte.
            </li>
            <li>
              <strong>Ignorar alergias cruzadas:</strong> Personas alérgicas al
              látex pueden reaccionar al mango, plátano, kiwi, papaya o
              aguacate (síndrome látex-fruta).
            </li>
            <li>
              <strong>Comprar frutas tropicales fuera de temporada:</strong>{' '}
              Suelen estar verdes, sin sabor o demasiado caras. Mejor seguir el
              calendario natural (mangostán y durian solo en verano asiático).
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('guia-frutas-exoticas')} />

      <ShareCard appName="guia-frutas-exoticas" />

      <Footer appName="guia-frutas-exoticas" />
    </div>
  );
}
