'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './GuiaRazasPerros.module.css';

type GrupoFCI =
  | 'Pastoreo'
  | 'Pinscher-Schnauzer'
  | 'Terrier'
  | 'Teckel'
  | 'Spitz'
  | 'Sabueso'
  | 'Perros de muestra'
  | 'Cobrador-Levantador'
  | 'Compañía'
  | 'Lebrel';

type Tamano = 'Mini' | 'Pequeño' | 'Mediano' | 'Grande' | 'Gigante';
type NivelEnergia = 'Muy alta' | 'Alta' | 'Media' | 'Baja';
type NivelMantenimiento = 'Alto' | 'Medio' | 'Bajo';
type TipoPelo = 'Corto' | 'Medio' | 'Largo' | 'Rizado' | 'Sin pelo';

interface RazaPerro {
  id: string;
  nombre: string;
  nombreIngles: string;
  grupo: GrupoFCI;
  origen: string;
  tamano: Tamano;
  pesoMin: number;
  pesoMax: number;
  alturaMin: number;
  alturaMax: number;
  pelo: TipoPelo;
  temperamento: string[];
  energia: NivelEnergia;
  mantenimiento: NivelMantenimiento;
  aptoNinos: boolean;
  aptoApartamento: boolean;
  esperanzaVida: string;
  descripcion: string;
  curiosidad: string;
}

const RAZAS: RazaPerro[] = [
  {
    id: 'labrador-retriever',
    nombre: 'Labrador Retriever',
    nombreIngles: 'Labrador Retriever',
    grupo: 'Cobrador-Levantador',
    origen: 'Reino Unido',
    tamano: 'Grande',
    pesoMin: 25,
    pesoMax: 36,
    alturaMin: 54,
    alturaMax: 57,
    pelo: 'Corto',
    temperamento: ['Amigable', 'Inteligente', 'Activo'],
    energia: 'Alta',
    mantenimiento: 'Bajo',
    aptoNinos: true,
    aptoApartamento: false,
    esperanzaVida: '10-12 años',
    descripcion: 'La raza más popular del mundo durante décadas. Su carácter afable, su facilidad de adiestramiento y su versatilidad le han convertido en perro de terapia, guía, rescate y familia. Disfruta especialmente del agua y la actividad al aire libre.',
    curiosidad: 'El Labrador Retriever originario no venía de Labrador (Canadá) sino de Terranova, donde ayudaba a pescadores a tirar de redes. Fue refinado en el siglo XIX por nobles ingleses hasta convertirse en la raza que conocemos hoy.',
  },
  {
    id: 'golden-retriever',
    nombre: 'Golden Retriever',
    nombreIngles: 'Golden Retriever',
    grupo: 'Cobrador-Levantador',
    origen: 'Reino Unido',
    tamano: 'Grande',
    pesoMin: 25,
    pesoMax: 34,
    alturaMin: 51,
    alturaMax: 61,
    pelo: 'Largo',
    temperamento: ['Afectuoso', 'Paciente', 'Leal'],
    energia: 'Alta',
    mantenimiento: 'Bajo',
    aptoNinos: true,
    aptoApartamento: false,
    esperanzaVida: '10-12 años',
    descripcion: 'Considerado uno de los perros más equilibrados emocionalmente. Su pelaje dorado ondulado y su expresión amable hacen que sea uno de los más fotografiados del mundo. Excelente como perro de asistencia para personas con discapacidad.',
    curiosidad: 'El primer Lord Tweedmouth cruzó en 1868 un Tweed Water Spaniel con un Retriever amarillo para crear la raza. Durante décadas se creyó que provenían de perros de circo rusos, un mito alimentado por el propio Lord.',
  },
  {
    id: 'pastor-aleman',
    nombre: 'Pastor Alemán',
    nombreIngles: 'German Shepherd',
    grupo: 'Pastoreo',
    origen: 'Alemania',
    tamano: 'Grande',
    pesoMin: 22,
    pesoMax: 40,
    alturaMin: 55,
    alturaMax: 65,
    pelo: 'Medio',
    temperamento: ['Inteligente', 'Leal', 'Protector'],
    energia: 'Alta',
    mantenimiento: 'Bajo',
    aptoNinos: true,
    aptoApartamento: false,
    esperanzaVida: '9-13 años',
    descripcion: 'Una de las razas más versátiles y utilizadas en el mundo: policía, ejército, rescate, guía, detección de drogas y explosivos. Su inteligencia excepcional y su capacidad de trabajo son incomparables. Requiere estimulación mental diaria.',
    curiosidad: 'El Pastor Alemán fue creado sistemáticamente por Max von Stephanitz a finales del siglo XIX con el objetivo específico de crear el perro de trabajo perfecto. Rin Tin Tin, el primer actor canino de Hollywood, era un Pastor Alemán rescatado de las trincheras de la Primera Guerra Mundial.',
  },
  {
    id: 'bulldog-frances',
    nombre: 'Bulldog Francés',
    nombreIngles: 'French Bulldog',
    grupo: 'Compañía',
    origen: 'Francia',
    tamano: 'Pequeño',
    pesoMin: 8,
    pesoMax: 14,
    alturaMin: 27,
    alturaMax: 35,
    pelo: 'Corto',
    temperamento: ['Adaptable', 'Juguetón', 'Sociable'],
    energia: 'Baja',
    mantenimiento: 'Bajo',
    aptoNinos: true,
    aptoApartamento: true,
    esperanzaVida: '10-12 años',
    descripcion: 'El bulldog compacto con orejas de murciélago que ha conquistado las ciudades del mundo. Muy adaptable al piso, no necesita mucho ejercicio y su carácter alegre lo hace ideal para personas mayores y familias. Atención: puede tener problemas respiratorios por su hocico chato.',
    curiosidad: 'El Bulldog Francés es resultado de cruzar Bulldogs ingleses con terriers de rata en el siglo XIX en Nottingham. Fueron los encajeros ingleses desplazados a Francia quienes llevaron la raza, convirtiéndola en símbolo parisino y luego mundial.',
  },
  {
    id: 'caniche',
    nombre: 'Caniche',
    nombreIngles: 'Poodle',
    grupo: 'Compañía',
    origen: 'Francia',
    tamano: 'Mediano',
    pesoMin: 2,
    pesoMax: 32,
    alturaMin: 25,
    alturaMax: 60,
    pelo: 'Rizado',
    temperamento: ['Inteligente', 'Activo', 'Elegante'],
    energia: 'Alta',
    mantenimiento: 'Alto',
    aptoNinos: true,
    aptoApartamento: true,
    esperanzaVida: '12-15 años',
    descripcion: 'Considerado sistemáticamente como el segundo perro más inteligente del mundo (tras el Border Collie), el Caniche existe en cuatro tamaños: Toy, Miniatura, Mediano y Grande. Su pelo rizado no suelta pelo, lo que lo hace más apto para personas con alergias.',
    curiosidad: 'El corte pompón tradicional del Caniche no era decorativo sino funcional: los cazadores de patos alemanes recortaban las patas y el cuerpo para facilitar el nado, dejando pelo en articulaciones y órganos vitales para protegerlos del agua fría.',
  },
  {
    id: 'beagle',
    nombre: 'Beagle',
    nombreIngles: 'Beagle',
    grupo: 'Sabueso',
    origen: 'Reino Unido',
    tamano: 'Mediano',
    pesoMin: 9,
    pesoMax: 11,
    alturaMin: 33,
    alturaMax: 41,
    pelo: 'Corto',
    temperamento: ['Curioso', 'Amigable', 'Determinado'],
    energia: 'Alta',
    mantenimiento: 'Bajo',
    aptoNinos: true,
    aptoApartamento: false,
    esperanzaVida: '12-15 años',
    descripcion: 'El sabueso compacto con nariz prodigiosa. Los Beagles son utilizados en aeropuertos de todo el mundo para detectar alimentos prohibidos. Su olfato tiene 220 millones de receptores olfativos (los humanos tenemos 5 millones). Muy sociables, sufren si están solos.',
    curiosidad: 'Snoopy, el perro de la tira cómica de Charles Schulz, es un Beagle. El nombre de la raza podría derivar del francés antiguo "beigh" (abierto) referido a su ladrido melodioso, o del gaélico "beag" (pequeño).',
  },
  {
    id: 'yorkshire-terrier',
    nombre: 'Yorkshire Terrier',
    nombreIngles: 'Yorkshire Terrier',
    grupo: 'Terrier',
    origen: 'Reino Unido',
    tamano: 'Mini',
    pesoMin: 2,
    pesoMax: 3,
    alturaMin: 18,
    alturaMax: 23,
    pelo: 'Largo',
    temperamento: ['Valiente', 'Curioso', 'Enérgico'],
    energia: 'Alta',
    mantenimiento: 'Alto',
    aptoNinos: true,
    aptoApartamento: true,
    esperanzaVida: '13-16 años',
    descripcion: 'Un terrier en cuerpo de perro de salón. Pese a su pequeño tamaño, el Yorkshire tiene el carácter impetuoso de los terriers: valiente, vivaz y con mucho que decir. Su largo pelaje sedoso necesita cepillado diario para mantenerlo en buen estado.',
    curiosidad: 'El Yorkshire fue creado en el siglo XIX por mineros del norte de Inglaterra para cazar ratas en las minas de carbón. De la rata a los salones de la alta sociedad victoriana: su transformación en perro de lujo fue tan rápida como su éxito social.',
  },
  {
    id: 'boxer',
    nombre: 'Boxer',
    nombreIngles: 'Boxer',
    grupo: 'Pinscher-Schnauzer',
    origen: 'Alemania',
    tamano: 'Grande',
    pesoMin: 25,
    pesoMax: 32,
    alturaMin: 53,
    alturaMax: 63,
    pelo: 'Corto',
    temperamento: ['Juguetón', 'Leal', 'Enérgico'],
    energia: 'Alta',
    mantenimiento: 'Bajo',
    aptoNinos: true,
    aptoApartamento: false,
    esperanzaVida: '10-12 años',
    descripcion: 'El eterno cachorro: los Boxers mantienen su carácter juguetón y exuberante durante toda su vida. Son perros muy expresivos, capaces de transmitir sus emociones con cada arruga de su cara aplastada. Excelentes con niños, aunque su energía puede tumbar a los más pequeños.',
    curiosidad: 'El nombre "Boxer" podría venir de su costumbre de pelear con las patas delanteras levantadas, como un boxeador. Fueron uno de los primeros perros adiestrados como policías en Alemania, a finales del siglo XIX.',
  },
  {
    id: 'schnauzer-mediano',
    nombre: 'Schnauzer Mediano',
    nombreIngles: 'Standard Schnauzer',
    grupo: 'Pinscher-Schnauzer',
    origen: 'Alemania',
    tamano: 'Mediano',
    pesoMin: 14,
    pesoMax: 20,
    alturaMin: 45,
    alturaMax: 50,
    pelo: 'Medio',
    temperamento: ['Inteligente', 'Alerta', 'Robusto'],
    energia: 'Alta',
    mantenimiento: 'Medio',
    aptoNinos: true,
    aptoApartamento: true,
    esperanzaVida: '13-16 años',
    descripcion: 'El Schnauzer original del que derivan el Miniatura y el Gigante. Su bigote característico y sus cejas pobladas le dan una expresión profunda e inteligente. Muy versátil: ha sido perro de granja, mensajero en la Primera Guerra Mundial y compañero de familia.',
    curiosidad: 'El Schnauzer es una de las razas más antiguas de Europa, presente en pinturas de Rembrandt y Lucas Cranach. Su nombre viene de "Schnauze" (hocico en alemán), por su característica barba y bigote.',
  },
  {
    id: 'chihuahua',
    nombre: 'Chihuahua',
    nombreIngles: 'Chihuahua',
    grupo: 'Compañía',
    origen: 'México',
    tamano: 'Mini',
    pesoMin: 1,
    pesoMax: 3,
    alturaMin: 15,
    alturaMax: 23,
    pelo: 'Corto',
    temperamento: ['Alerta', 'Valiente', 'Fiel'],
    energia: 'Media',
    mantenimiento: 'Bajo',
    aptoNinos: false,
    aptoApartamento: true,
    esperanzaVida: '14-16 años',
    descripcion: 'El perro más pequeño del mundo con el corazón más grande. El Chihuahua es profundamente leal a su persona de referencia y puede ser territorial. No se recomienda con niños pequeños por su fragilidad física. Sorprendentemente longevos: es habitual que superen los 15 años.',
    curiosidad: 'El Chihuahua es el descendiente del Techichi, perro sagrado de los aztecas que se creía tenía poderes espirituales para guiar a los muertos al más allá. La raza moderna fue "redescubierta" en el estado de Chihuahua (México) en el siglo XIX.',
  },
  {
    id: 'dalmata',
    nombre: 'Dálmata',
    nombreIngles: 'Dalmatian',
    grupo: 'Compañía',
    origen: 'Croacia',
    tamano: 'Grande',
    pesoMin: 24,
    pesoMax: 32,
    alturaMin: 54,
    alturaMax: 61,
    pelo: 'Corto',
    temperamento: ['Activo', 'Amigable', 'Independiente'],
    energia: 'Muy alta',
    mantenimiento: 'Bajo',
    aptoNinos: true,
    aptoApartamento: false,
    esperanzaVida: '11-13 años',
    descripcion: 'Inconfundible con sus manchas negras o marrones sobre fondo blanco. El Dálmata tiene una energía desbordante y necesita mucho ejercicio diario. Fue perro de carruajes (corría junto a los caballos) y luego de bomberos en EE.UU. No apto para personas sedentarias.',
    curiosidad: 'Los cachorros Dálmata nacen completamente blancos: las manchas aparecen gradualmente en las primeras semanas de vida. El 8% de los Dálmatas nace sordo por un gen ligado al gen blanco que también causa sus manchas.',
  },
  {
    id: 'shih-tzu',
    nombre: 'Shih Tzu',
    nombreIngles: 'Shih Tzu',
    grupo: 'Compañía',
    origen: 'China',
    tamano: 'Pequeño',
    pesoMin: 4,
    pesoMax: 7,
    alturaMin: 20,
    alturaMax: 28,
    pelo: 'Largo',
    temperamento: ['Afectuoso', 'Juguetón', 'Tranquilo'],
    energia: 'Baja',
    mantenimiento: 'Alto',
    aptoNinos: true,
    aptoApartamento: true,
    esperanzaVida: '10-16 años',
    descripcion: 'El "León pequeño" chino que vivía en los palacios de los emperadores de la dinastía Ming. Su carácter sereno y afectuoso, unido a su adaptabilidad al piso, lo hacen ideal para personas mayores. Su pelaje largo exige cepillado diario o corte regular.',
    curiosidad: 'El Shih Tzu fue raza exclusiva de la familia imperial china durante siglos: era ilegal vender, regalar o robar uno. Cuando los comunistas ocuparon el Palacio Imperial en 1949, la raza casi desapareció; los pies de cría actuales descienden de solo 14 perros.',
  },
  {
    id: 'border-collie',
    nombre: 'Border Collie',
    nombreIngles: 'Border Collie',
    grupo: 'Pastoreo',
    origen: 'Reino Unido',
    tamano: 'Mediano',
    pesoMin: 12,
    pesoMax: 20,
    alturaMin: 46,
    alturaMax: 56,
    pelo: 'Medio',
    temperamento: ['Inteligente', 'Enérgico', 'Sensible'],
    energia: 'Muy alta',
    mantenimiento: 'Medio',
    aptoNinos: true,
    aptoApartamento: false,
    esperanzaVida: '12-15 años',
    descripcion: 'Considerado sistemáticamente el perro más inteligente del mundo. Sin trabajo ni estimulación mental suficiente, puede desarrollar comportamientos compulsivos. Es capaz de aprender el nombre de cientos de objetos y resolver problemas complejos. Para dueños muy activos.',
    curiosidad: 'Chaser, un Border Collie de Carolina del Sur, aprendió el nombre de más de 1.022 juguetes individuales y podía recuperar el correcto de entre todos. Fue reconocido científicamente como el animal con el mayor vocabulario conocido de cualquier especie no humana.',
  },
  {
    id: 'husky-siberiano',
    nombre: 'Husky Siberiano',
    nombreIngles: 'Siberian Husky',
    grupo: 'Spitz',
    origen: 'Rusia',
    tamano: 'Grande',
    pesoMin: 16,
    pesoMax: 27,
    alturaMin: 50,
    alturaMax: 60,
    pelo: 'Medio',
    temperamento: ['Amigable', 'Activo', 'Independiente'],
    energia: 'Muy alta',
    mantenimiento: 'Medio',
    aptoNinos: true,
    aptoApartamento: false,
    esperanzaVida: '12-14 años',
    descripcion: 'El atleta de los perros nórdicos. El Husky puede correr más de 150 km en un día tirando de un trineo. Su doble capa de pelo lo protege de temperaturas de -50°C. Sociable e independiente a partes iguales: no es el guardián ideal pero sí un compañero de aventuras inigualable.',
    curiosidad: 'En 1925 el Husky Balto lideró el equipo de trineo que entregó el suero antidiftérico a Nome (Alaska) salvando a la ciudad de una epidemia. El viaje de 1.085 km en condiciones árticas extremas es conocido como "La Gran Carrera de la Misericordia".',
  },
  {
    id: 'rottweiler',
    nombre: 'Rottweiler',
    nombreIngles: 'Rottweiler',
    grupo: 'Pinscher-Schnauzer',
    origen: 'Alemania',
    tamano: 'Grande',
    pesoMin: 35,
    pesoMax: 60,
    alturaMin: 56,
    alturaMax: 69,
    pelo: 'Corto',
    temperamento: ['Leal', 'Confiante', 'Tranquilo'],
    energia: 'Alta',
    mantenimiento: 'Bajo',
    aptoNinos: true,
    aptoApartamento: false,
    esperanzaVida: '8-10 años',
    descripcion: 'Uno de los perros de trabajo más poderosos y equilibrados. Con la socialización adecuada desde cachorro, el Rottweiler es un perro sereno, confiable y muy leal a su familia. Desconfía de los extraños por naturaleza. Requiere dueño con experiencia.',
    curiosidad: 'El Rottweiler desciende de perros romanos que acompañaban a las legiones a través de los Alpes. En la ciudad de Rottweil (Alemania), se cruzaron con perros locales y fueron usados por los carniceros para tirar de carretas con carne, ganándose el apodo de "perro del carnicero de Rottweil".',
  },
  {
    id: 'dobermann',
    nombre: 'Dobermann',
    nombreIngles: 'Dobermann',
    grupo: 'Pinscher-Schnauzer',
    origen: 'Alemania',
    tamano: 'Grande',
    pesoMin: 32,
    pesoMax: 45,
    alturaMin: 61,
    alturaMax: 72,
    pelo: 'Corto',
    temperamento: ['Leal', 'Alerta', 'Enérgico'],
    energia: 'Alta',
    mantenimiento: 'Bajo',
    aptoNinos: false,
    aptoApartamento: false,
    esperanzaVida: '10-13 años',
    descripcion: 'Elegante, poderoso y extremadamente inteligente. El Dobermann fue creado como perro de protección personal y es uno de los perros de trabajo más capaces. Su lealtad a su familia es absoluta pero necesita socialización temprana intensa y dueño experimentado.',
    curiosidad: 'El Dobermann fue creado en la década de 1890 por Friedrich Louis Dobermann, un cobrador de impuestos de Apolda que quería un perro que le protegiera en sus rondas peligrosas. Nadie sabe exactamente qué razas combinó, aunque se especula con Rottweiler, Pinscher y Terrier negro y fuego.',
  },
  {
    id: 'cocker-spaniel-ingles',
    nombre: 'Cocker Spaniel Inglés',
    nombreIngles: 'English Cocker Spaniel',
    grupo: 'Cobrador-Levantador',
    origen: 'Reino Unido',
    tamano: 'Mediano',
    pesoMin: 12,
    pesoMax: 15,
    alturaMin: 38,
    alturaMax: 43,
    pelo: 'Largo',
    temperamento: ['Alegre', 'Afectuoso', 'Activo'],
    energia: 'Alta',
    mantenimiento: 'Alto',
    aptoNinos: true,
    aptoApartamento: true,
    esperanzaVida: '12-14 años',
    descripcion: 'El "merry Cocker" o Cocker alegre, como se le conoce en Gran Bretaña por su expresión perpetuamente feliz y su cola en constante movimiento. Su pelaje largo y sedoso necesita cuidado regular pero su carácter sociable y adaptable compensa el esfuerzo.',
    curiosidad: 'El nombre "Cocker" viene de su especialidad original: levantar becadas (woodcocks en inglés). Lady, la protagonista de "La Dama y el Vagabundo", es un Cocker Spaniel Inglés, contribuyendo enormemente a la popularidad de la raza en los años 1950.',
  },
  {
    id: 'bichon-frise',
    nombre: 'Bichón Frisé',
    nombreIngles: 'Bichon Frisé',
    grupo: 'Compañía',
    origen: 'Francia',
    tamano: 'Pequeño',
    pesoMin: 3,
    pesoMax: 5,
    alturaMin: 23,
    alturaMax: 30,
    pelo: 'Rizado',
    temperamento: ['Alegre', 'Juguetón', 'Sociable'],
    energia: 'Media',
    mantenimiento: 'Alto',
    aptoNinos: true,
    aptoApartamento: true,
    esperanzaVida: '14-15 años',
    descripcion: 'Una nube de pelo blanco rizado con una personalidad irresistiblemente alegre. El Bichón Frisé no suelta pelo significativo, lo que lo hace más apto para alérgicos. Muy sociable, se lleva bien con otros perros y gatos. Ideal para piso y personas mayores.',
    curiosidad: 'El Bichón Frisé fue favorito en la corte de Enrique III de Francia en el siglo XVI: el rey llegaba a llevar varios en una cesta especial colgada al cuello. La raza casi desapareció tras la Revolución Francesa cuando cayó en desgracia junto a la aristocracia.',
  },
  {
    id: 'maltes',
    nombre: 'Maltés',
    nombreIngles: 'Maltese',
    grupo: 'Compañía',
    origen: 'Malta',
    tamano: 'Mini',
    pesoMin: 2,
    pesoMax: 4,
    alturaMin: 20,
    alturaMax: 25,
    pelo: 'Largo',
    temperamento: ['Gentil', 'Afectuoso', 'Juguetón'],
    energia: 'Media',
    mantenimiento: 'Alto',
    aptoNinos: true,
    aptoApartamento: true,
    esperanzaVida: '12-15 años',
    descripcion: 'Una de las razas más antiguas del mundo, criada como perro de compañía de damas nobles durante milenios. Su pelo largo y sedoso blanco puro que llega al suelo es su rasgo más característico. Pese a su aspecto delicado, tiene un carácter vivaz y valiente.',
    curiosidad: 'El Maltés aparece mencionado por Aristóteles alrededor del año 350 a.C. y se han encontrado representaciones en cerámica griega y romana. Era tan apreciado que se le llamaba "el perro de los filósofos" por la costumbre de los pensadores griegos de tenerlos.',
  },
  {
    id: 'samoyedo',
    nombre: 'Samoyedo',
    nombreIngles: 'Samoyed',
    grupo: 'Spitz',
    origen: 'Rusia',
    tamano: 'Grande',
    pesoMin: 16,
    pesoMax: 30,
    alturaMin: 46,
    alturaMax: 60,
    pelo: 'Largo',
    temperamento: ['Amigable', 'Sociable', 'Gentil'],
    energia: 'Alta',
    mantenimiento: 'Alto',
    aptoNinos: true,
    aptoApartamento: false,
    esperanzaVida: '12-14 años',
    descripcion: 'La "sonrisa Samoyedo" es reconocible en todo el mundo: sus labios curvados hacia arriba impiden que se formen carámbanos. Su pelo blanco doble capa era tejido por los pueblos siberianos para hacer ropa. Un perro hermoso que necesita mucho ejercicio y cepillado frecuente.',
    curiosidad: 'El pueblo Samoyedo de Siberia vivía literalmente con estos perros: dormían con ellos para darse calor mutuamente en temperaturas de hasta -60°C. Esta convivencia íntima durante siglos explica su carácter excepcionalmente sociable y su necesidad de compañía humana.',
  },
  {
    id: 'san-bernardo',
    nombre: 'San Bernardo',
    nombreIngles: 'Saint Bernard',
    grupo: 'Pinscher-Schnauzer',
    origen: 'Suiza',
    tamano: 'Gigante',
    pesoMin: 64,
    pesoMax: 120,
    alturaMin: 65,
    alturaMax: 90,
    pelo: 'Corto',
    temperamento: ['Gentil', 'Paciente', 'Amigable'],
    energia: 'Media',
    mantenimiento: 'Medio',
    aptoNinos: true,
    aptoApartamento: false,
    esperanzaVida: '8-10 años',
    descripcion: 'El gigante gentil de los Alpes. El San Bernardo es uno de los perros más grandes del mundo, pero su temperamento es notablemente tranquilo y paciente. Famoso por sus labores de rescate en la nieve, aunque el famoso barril de coñac al cuello es un mito cinematográfico.',
    curiosidad: 'El San Bernardo más famoso, Barry, rescató entre 40 y 100 personas en el Paso del Gran San Bernardo entre 1800 y 1812. El barril de coñac que aparece en imágenes populares nunca existió: fue añadido por el artista Edwin Landseer en un cuadro de 1820.',
  },
  {
    id: 'gran-danes',
    nombre: 'Gran Danés',
    nombreIngles: 'Great Dane',
    grupo: 'Pinscher-Schnauzer',
    origen: 'Alemania',
    tamano: 'Gigante',
    pesoMin: 45,
    pesoMax: 90,
    alturaMin: 71,
    alturaMax: 86,
    pelo: 'Corto',
    temperamento: ['Amigable', 'Paciente', 'Confiante'],
    energia: 'Media',
    mantenimiento: 'Bajo',
    aptoNinos: true,
    aptoApartamento: false,
    esperanzaVida: '7-10 años',
    descripcion: 'El "Apolo de las razas". El Gran Danés es el perro más alto del mundo en altura a la cruz. Pese a su tamaño imponente, tiene un carácter dulce y equilibrado. Zeus, el Gran Danés más alto registrado, medía 111,8 cm a la cruz. Lamentablemente su esperanza de vida es corta.',
    curiosidad: 'El Gran Danés es alemán de origen, no danés: fue criado en Alemania para cazar jabalíes. El nombre "Great Dane" fue popularizado por el naturalista Buffon en el siglo XVIII al ver perros similares en Dinamarca. Scooby-Doo es el Gran Danés más famoso de la cultura popular.',
  },
  {
    id: 'whippet',
    nombre: 'Whippet',
    nombreIngles: 'Whippet',
    grupo: 'Lebrel',
    origen: 'Reino Unido',
    tamano: 'Mediano',
    pesoMin: 11,
    pesoMax: 18,
    alturaMin: 44,
    alturaMax: 51,
    pelo: 'Corto',
    temperamento: ['Gentil', 'Afectuoso', 'Veloz'],
    energia: 'Alta',
    mantenimiento: 'Bajo',
    aptoNinos: true,
    aptoApartamento: true,
    esperanzaVida: '12-15 años',
    descripcion: 'El deportista del sofá: el Whippet puede alcanzar 56 km/h en carrera pero en casa es un perro tranquilo y afectuoso que adora acurrucarse. Ideal para pisos si se le da suficiente ejercicio diario. Su pelo corto lo hace sensible al frío: necesita abrigo en invierno.',
    curiosidad: 'El Whippet fue criado por mineros del norte de Inglaterra en el siglo XIX para carreras de velocidad. Se le llamó "the poor man\'s racehorse" (el caballo de carreras del pobre) porque era más asequible de mantener que un galgo Greyhound pero igual de rápido sobre distancias cortas.',
  },
  {
    id: 'weimaraner',
    nombre: 'Weimaraner',
    nombreIngles: 'Weimaraner',
    grupo: 'Perros de muestra',
    origen: 'Alemania',
    tamano: 'Grande',
    pesoMin: 25,
    pesoMax: 40,
    alturaMin: 56,
    alturaMax: 69,
    pelo: 'Corto',
    temperamento: ['Enérgico', 'Amigable', 'Temerario'],
    energia: 'Muy alta',
    mantenimiento: 'Bajo',
    aptoNinos: true,
    aptoApartamento: false,
    esperanzaVida: '11-14 años',
    descripcion: 'El "Fantasma gris": su pelaje gris plateado único y sus ojos azules o dorados son inconfundibles. El Weimaraner necesita muchísimo ejercicio y estimulación mental. Fue perro exclusivo de la nobleza de Weimar en el siglo XIX, reservado para la caza mayor.',
    curiosidad: 'El fotógrafo William Wegman ha fotografiado a sus Weimaraners en situaciones humanas durante más de 40 años, creando un archivo iconográfico único. Sus fotos con los perros vestidos y en poses humanas son reconocidas en museos de todo el mundo.',
  },
  {
    id: 'dachshund',
    nombre: 'Dachshund',
    nombreIngles: 'Dachshund',
    grupo: 'Teckel',
    origen: 'Alemania',
    tamano: 'Pequeño',
    pesoMin: 7,
    pesoMax: 15,
    alturaMin: 20,
    alturaMax: 27,
    pelo: 'Corto',
    temperamento: ['Curioso', 'Valiente', 'Tenaz'],
    energia: 'Alta',
    mantenimiento: 'Bajo',
    aptoNinos: true,
    aptoApartamento: true,
    esperanzaVida: '12-16 años',
    descripcion: 'El "perro salchicha" es mucho más que un cliché: es un cazador testarudo y valiente en un cuerpo alargado diseñado para meterse en madrigueras de tejones. Su columna larga lo hace propenso a problemas de espalda: evitar escaleras y saltos frecuentes.',
    curiosidad: 'El Dachshund fue la mascota de las Olimpiadas de Munich 1972: Waldi, un Dachshund multicolor, fue la primera mascota oficial de la historia olímpica. El maratón olímpico siguió la forma de su cuerpo en el mapa de la ciudad.',
  },
  {
    id: 'west-highland-terrier',
    nombre: 'West Highland Terrier',
    nombreIngles: 'West Highland White Terrier',
    grupo: 'Terrier',
    origen: 'Escocia',
    tamano: 'Pequeño',
    pesoMin: 6,
    pesoMax: 10,
    alturaMin: 25,
    alturaMax: 28,
    pelo: 'Medio',
    temperamento: ['Activo', 'Amigable', 'Independiente'],
    energia: 'Alta',
    mantenimiento: 'Alto',
    aptoNinos: true,
    aptoApartamento: true,
    esperanzaVida: '12-16 años',
    descripcion: 'El terrier blanco escocés con carácter de mil metros. El Westie es independiente, activo y muy curioso: necesita ejercicio diario aunque se adapta bien al piso. Su doble capa de pelo blanco necesita stripping o corte profesional cada pocos meses.',
    curiosidad: 'El origen del West Highland Terrier está ligado a una tragedia: el coronel Malcolm de Poltalloch perdió accidentalmente uno de sus terriers marrones confundiéndolo con una presa. Decidió criar solo terriers blancos para evitar el error, creando la raza actual.',
  },
  {
    id: 'jack-russell-terrier',
    nombre: 'Jack Russell Terrier',
    nombreIngles: 'Jack Russell Terrier',
    grupo: 'Terrier',
    origen: 'Reino Unido',
    tamano: 'Pequeño',
    pesoMin: 5,
    pesoMax: 8,
    alturaMin: 25,
    alturaMax: 38,
    pelo: 'Corto',
    temperamento: ['Enérgico', 'Inteligente', 'Valiente'],
    energia: 'Muy alta',
    mantenimiento: 'Bajo',
    aptoNinos: true,
    aptoApartamento: false,
    esperanzaVida: '13-16 años',
    descripcion: 'Pura energía en formato compacto. El Jack Russell fue creado para cazar zorros y todavía tiene ese instinto cazador y esa energía imparable. No es un perro para principiantes: necesita ejercicio intenso diario, trabajo mental y dueño con paciencia y consistencia.',
    curiosidad: 'El Reverendo John Russell (1795-1883) creó esta raza para que el perro pudiera seguir al caballo en las cacerías de zorros y meterse en las madrigueras. Su frase más famosa: "Un terrier para cavar la tierra".',
  },
  {
    id: 'shiba-inu',
    nombre: 'Shiba Inu',
    nombreIngles: 'Shiba Inu',
    grupo: 'Spitz',
    origen: 'Japón',
    tamano: 'Mediano',
    pesoMin: 8,
    pesoMax: 11,
    alturaMin: 35,
    alturaMax: 43,
    pelo: 'Medio',
    temperamento: ['Alerta', 'Fiel', 'Independiente'],
    energia: 'Alta',
    mantenimiento: 'Medio',
    aptoNinos: false,
    aptoApartamento: true,
    esperanzaVida: '13-16 años',
    descripcion: 'El meme hecho perro, pero mucho más que eso. El Shiba Inu es una raza japonesa antigua de carácter independiente y casi felino. Extremadamente limpio, con instinto de escape muy desarrollado y tendencia a ignorar a su dueño cuando le conviene. Para dueños pacientes.',
    curiosidad: 'El "Shiba scream" es real: cuando no les gusta algo (baños, visitas al veterinario), los Shiba Inu emiten un grito agudísimo. La raza casi se extinguió durante los bombardeos de la Segunda Guerra Mundial; su recuperación fue posible gracias a tres líneas de cría supervivientes.',
  },
  {
    id: 'akita',
    nombre: 'Akita',
    nombreIngles: 'Akita',
    grupo: 'Spitz',
    origen: 'Japón',
    tamano: 'Grande',
    pesoMin: 32,
    pesoMax: 59,
    alturaMin: 58,
    alturaMax: 70,
    pelo: 'Medio',
    temperamento: ['Leal', 'Digno', 'Receptivo'],
    energia: 'Media',
    mantenimiento: 'Medio',
    aptoNinos: false,
    aptoApartamento: false,
    esperanzaVida: '10-13 años',
    descripcion: 'El perro nacional de Japón, símbolo de longevidad, salud y felicidad. El Akita es un perro poderoso, silencioso y profundamente leal. No suele ladrar sin motivo. Muy dominante con otros perros del mismo sexo. Requiere dueño experimentado y socialización desde cachorro.',
    curiosidad: 'Hachiko, el Akita más famoso de la historia, esperó a su dueño fallecido en la estación de Shibuya durante casi 10 años (1925-1935). Su estatua en la estación de Shibuya es el punto de encuentro más usado de Tokio. La historia fue llevada al cine en 2009 con Richard Gere.',
  },
  {
    id: 'cavalier-king-charles',
    nombre: 'Cavalier King Charles Spaniel',
    nombreIngles: 'Cavalier King Charles Spaniel',
    grupo: 'Compañía',
    origen: 'Reino Unido',
    tamano: 'Pequeño',
    pesoMin: 5,
    pesoMax: 8,
    alturaMin: 30,
    alturaMax: 33,
    pelo: 'Largo',
    temperamento: ['Afectuoso', 'Gentil', 'Adaptable'],
    energia: 'Media',
    mantenimiento: 'Alto',
    aptoNinos: true,
    aptoApartamento: true,
    esperanzaVida: '9-14 años',
    descripcion: 'El perro del Rey Carlos II de Inglaterra, que se dice no iba a ningún lugar sin ellos. El Cavalier es uno de los perros más dulces y adaptables: igual de cómodo en un piso pequeño que en una casa con jardín. Muy afectuoso con todos, nunca agresivo.',
    curiosidad: 'El Cavalier King Charles moderno fue "recreado" en los años 1920 por un americano llamado Roswell Eldridge, que ofreció premios en exposiciones caninas para quien criara perros similares a los de las pinturas del siglo XVII, antes de que el morro se volviera chato por la moda.',
  },
  {
    id: 'shar-pei',
    nombre: 'Shar Pei',
    nombreIngles: 'Shar Pei',
    grupo: 'Compañía',
    origen: 'China',
    tamano: 'Mediano',
    pesoMin: 18,
    pesoMax: 29,
    alturaMin: 44,
    alturaMax: 51,
    pelo: 'Corto',
    temperamento: ['Leal', 'Independiente', 'Calmado'],
    energia: 'Baja',
    mantenimiento: 'Medio',
    aptoNinos: false,
    aptoApartamento: true,
    esperanzaVida: '8-12 años',
    descripcion: 'El perro más arrugado del mundo. Sus pliegues de piel característicos lo hacen inconfundible. El Shar Pei es un perro sereno pero independiente, reservado con extraños y muy leal a su familia. Las arrugas necesitan limpieza regular para evitar infecciones cutáneas.',
    curiosidad: 'El Shar Pei estuvo en peligro crítico de extinción en los años 1970 cuando China comunista prohibió las mascotas. Un criador de Hong Kong publicó un artículo en una revista americana titulado "el perro más raro del mundo" y las donaciones internacionales salvaron la raza.',
  },
  {
    id: 'malinois-belga',
    nombre: 'Malinois Belga',
    nombreIngles: 'Belgian Malinois',
    grupo: 'Pastoreo',
    origen: 'Bélgica',
    tamano: 'Grande',
    pesoMin: 20,
    pesoMax: 30,
    alturaMin: 56,
    alturaMax: 66,
    pelo: 'Corto',
    temperamento: ['Inteligente', 'Activo', 'Protector'],
    energia: 'Muy alta',
    mantenimiento: 'Bajo',
    aptoNinos: false,
    aptoApartamento: false,
    esperanzaVida: '14-16 años',
    descripcion: 'El perro de trabajo por excelencia. El Malinois es utilizado por ejércitos, policías y servicios de inteligencia de todo el mundo por su combinación de velocidad, fuerza, inteligencia y capacidad de trabajo. Es absolutamente inadecuado como mascota de familia sin experiencia previa.',
    curiosidad: 'Un Malinois llamado Cairo acompañó al Equipo SEAL 6 en la misión que acabó con Bin Laden en 2011. Los Malinois del ejército americano llevan chalecos antibalas, son transportados en paracaídas y tienen sus propias máscaras de gas. Su salario consta en registros militares.',
  },
  {
    id: 'pomerania',
    nombre: 'Pomerania',
    nombreIngles: 'Pomeranian',
    grupo: 'Spitz',
    origen: 'Alemania',
    tamano: 'Mini',
    pesoMin: 1,
    pesoMax: 3,
    alturaMin: 18,
    alturaMax: 24,
    pelo: 'Largo',
    temperamento: ['Curioso', 'Extrovertido', 'Vivaz'],
    energia: 'Alta',
    mantenimiento: 'Alto',
    aptoNinos: true,
    aptoApartamento: true,
    esperanzaVida: '12-16 años',
    descripcion: 'Un Spitz nórdico en miniatura con actitud de gigante. El Pomerania desciende de perros de trineo grandes que fueron miniaturizados por la reina Victoria de Inglaterra. Muy vocal y alerta, puede ser un guardián efectivo pese a su tamaño diminuto.',
    curiosidad: 'Cuando el Titanic se hundió en 1912, dos de los tres únicos perros supervivientes eran Pomerianas. Sus dueñas los llevaron consigo a los botes salvavidas. La reina Victoria popularizó la raza en Gran Bretaña tras importar un ejemplar de Pomerania (actual Polonia) en 1888.',
  },
  {
    id: 'setter-irlandes',
    nombre: 'Setter Irlandés',
    nombreIngles: 'Irish Setter',
    grupo: 'Perros de muestra',
    origen: 'Irlanda',
    tamano: 'Grande',
    pesoMin: 24,
    pesoMax: 32,
    alturaMin: 58,
    alturaMax: 67,
    pelo: 'Largo',
    temperamento: ['Enérgico', 'Alegre', 'Afectuoso'],
    energia: 'Muy alta',
    mantenimiento: 'Alto',
    aptoNinos: true,
    aptoApartamento: false,
    esperanzaVida: '11-15 años',
    descripcion: 'El perro más elegante sobre el campo: su pelaje caoba sedoso brillando al sol es una imagen inigualable. El Setter Irlandés es la definición de entusiasmo canino: alegre, exuberante y lleno de energía. Necesita mucho ejercicio o puede volverse destructivo en casa.',
    curiosidad: 'El Setter Irlandés fue el perro favorito de varios presidentes americanos. Nixon tenía uno llamado King Timahoe. Richard Nixon lo mencionó en su famoso "Checkers Speech" de 1952, aunque Checkers era en realidad un Cocker Spaniel.',
  },
  {
    id: 'braco-aleman',
    nombre: 'Braco Alemán',
    nombreIngles: 'German Shorthaired Pointer',
    grupo: 'Perros de muestra',
    origen: 'Alemania',
    tamano: 'Grande',
    pesoMin: 20,
    pesoMax: 32,
    alturaMin: 53,
    alturaMax: 64,
    pelo: 'Corto',
    temperamento: ['Enérgico', 'Inteligente', 'Amigable'],
    energia: 'Muy alta',
    mantenimiento: 'Bajo',
    aptoNinos: true,
    aptoApartamento: false,
    esperanzaVida: '12-14 años',
    descripcion: 'El perro de caza polivalente por excelencia: muestra, cobra en agua y tierra, rastrea. También es un excelente perro de familia con el ejercicio adecuado. Su energía es comparable al Malinois: necesita al menos dos horas de ejercicio intenso al día.',
    curiosidad: 'El Braco Alemán fue creado en el siglo XIX para ser el "perro de caza perfecto": capaz de mostrar, cobrar y rastrear. Se cruzaron Braccos españoles, Foxhounds ingleses y Pointers para conseguir la combinación ideal de olfato, velocidad y versatilidad.',
  },
  {
    id: 'bull-terrier',
    nombre: 'Bull Terrier',
    nombreIngles: 'Bull Terrier',
    grupo: 'Terrier',
    origen: 'Reino Unido',
    tamano: 'Mediano',
    pesoMin: 22,
    pesoMax: 38,
    alturaMin: 45,
    alturaMax: 55,
    pelo: 'Corto',
    temperamento: ['Juguetón', 'Obstinado', 'Afectuoso'],
    energia: 'Alta',
    mantenimiento: 'Bajo',
    aptoNinos: false,
    aptoApartamento: false,
    esperanzaVida: '11-14 años',
    descripcion: 'La cabeza en forma de huevo es única en el mundo canino. El Bull Terrier es juguetón, obstinado y profundamente cómico en su comportamiento. Puede ser difícil de adiestrar por su terquedad. Requiere socialización temprana con otros animales y dueño con experiencia.',
    curiosidad: 'El Bull Terrier blanco fue creado por James Hinks en Birmingham en 1862 cruzando Bulldogs con White English Terriers extintos. La mascota de "Archie", el personaje de cómic, es un Bull Terrier. Spuds MacKenzie, la mascota de Bud Light en los años 1980, popularizó la raza mundialmente.',
  },
  {
    id: 'galgo-espanol',
    nombre: 'Galgo Español',
    nombreIngles: 'Spanish Greyhound',
    grupo: 'Lebrel',
    origen: 'España',
    tamano: 'Grande',
    pesoMin: 20,
    pesoMax: 30,
    alturaMin: 60,
    alturaMax: 70,
    pelo: 'Corto',
    temperamento: ['Gentil', 'Tranquilo', 'Sensible'],
    energia: 'Alta',
    mantenimiento: 'Bajo',
    aptoNinos: true,
    aptoApartamento: true,
    esperanzaVida: '12-15 años',
    descripcion: 'El lebrel de España: uno de los más rápidos del mundo, pero sorprendentemente tranquilo en casa. Fuera de la temporada de caza miles de galgos son abandonados en España cada año. Es un perro muy sensible, poco ladrón y adaptable al piso si recibe su ejercicio diario.',
    curiosidad: 'El Galgo Español aparece representado en pinturas rupestres de la Cueva de la Pileta (Málaga) de hace 25.000 años, lo que podría hacerlo una de las razas más antiguas del mundo. Era el único perro mencionado en el primer censo canino de España (siglo XV).',
  },
  {
    id: 'mastin-espanol',
    nombre: 'Mastín Español',
    nombreIngles: 'Spanish Mastiff',
    grupo: 'Pastoreo',
    origen: 'España',
    tamano: 'Gigante',
    pesoMin: 52,
    pesoMax: 100,
    alturaMin: 72,
    alturaMax: 88,
    pelo: 'Medio',
    temperamento: ['Leal', 'Tranquilo', 'Independiente'],
    energia: 'Baja',
    mantenimiento: 'Medio',
    aptoNinos: true,
    aptoApartamento: false,
    esperanzaVida: '10-12 años',
    descripcion: 'El guardián ancestral de los rebaños de la Mesta. El Mastín Español es uno de los perros más grandes del mundo y tiene una presencia imponente. Su función durante siglos ha sido proteger ovejas de lobos y otros depredadores. Carácter tranquilo pero decisivo cuando es necesario.',
    curiosidad: 'El Mastín Español acompañó a los rebaños de la Mesta en la trashumancia durante siglos, recorriendo miles de kilómetros al año entre Extremadura y las montañas del norte. Las Leyes de Mesta del siglo XIII ya mencionaban la obligación de proteger a estos perros.',
  },
  {
    id: 'cocker-americano',
    nombre: 'Cocker Spaniel Americano',
    nombreIngles: 'American Cocker Spaniel',
    grupo: 'Cobrador-Levantador',
    origen: 'EE.UU.',
    tamano: 'Mediano',
    pesoMin: 11,
    pesoMax: 14,
    alturaMin: 34,
    alturaMax: 39,
    pelo: 'Largo',
    temperamento: ['Alegre', 'Sociable', 'Gentil'],
    energia: 'Alta',
    mantenimiento: 'Alto',
    aptoNinos: true,
    aptoApartamento: true,
    esperanzaVida: '12-15 años',
    descripcion: 'Más compacto y con el pelaje más abundante que su primo inglés, el Cocker Americano fue el perro más popular de EE.UU. durante 16 años consecutivos. Su expresión melancólica y sus orejas largas son inconfundibles. El pelaje necesita peluquería profesional frecuente.',
    curiosidad: 'Lady, de "La Dama y el Vagabundo" de Disney (1955), es un Cocker Spaniel Americano. La película disparó la popularidad de la raza en los años siguientes. El Cocker Americano y el Inglés fueron reconocidos como razas separadas por el AKC en 1946.',
  },
  {
    id: 'basset-hound',
    nombre: 'Basset Hound',
    nombreIngles: 'Basset Hound',
    grupo: 'Sabueso',
    origen: 'Francia',
    tamano: 'Mediano',
    pesoMin: 20,
    pesoMax: 29,
    alturaMin: 28,
    alturaMax: 38,
    pelo: 'Corto',
    temperamento: ['Paciente', 'Amigable', 'Tranquilo'],
    energia: 'Baja',
    mantenimiento: 'Bajo',
    aptoNinos: true,
    aptoApartamento: true,
    esperanzaVida: '10-12 años',
    descripcion: 'El sabueso melancólico de orejas kilométricas. El Basset Hound es uno de los perros más tranquilos y buenos con los niños, aunque su olfato lo convierte en un escape artista cuando capta una pista interesante. Su expresión triste es permanente: no importa cuán feliz esté.',
    curiosidad: 'El nombre "Basset" viene del francés "bas" (bajo). Sus orejas largas tienen una función: al agitar la cabeza, atrapan partículas odoríferas del suelo y las acercan a su nariz. El Basset Hound tiene el segundo olfato más desarrollado de todas las razas, solo superado por el Bloodhound.',
  },
];

const GRUPOS_FCI: GrupoFCI[] = [
  'Pastoreo', 'Pinscher-Schnauzer', 'Terrier', 'Teckel', 'Spitz',
  'Sabueso', 'Perros de muestra', 'Cobrador-Levantador', 'Compañía', 'Lebrel',
];

const TAMANOS: Tamano[] = ['Mini', 'Pequeño', 'Mediano', 'Grande', 'Gigante'];
const ENERGIAS: NivelEnergia[] = ['Muy alta', 'Alta', 'Media', 'Baja'];

const COLOR_GRUPO: Record<GrupoFCI, string> = {
  'Pastoreo': '#2196F3',
  'Pinscher-Schnauzer': '#9C27B0',
  'Terrier': '#FF5722',
  'Teckel': '#8BC34A',
  'Spitz': '#607D8B',
  'Sabueso': '#FF9800',
  'Perros de muestra': '#00BCD4',
  'Cobrador-Levantador': '#4CAF50',
  'Compañía': '#E91E63',
  'Lebrel': '#795548',
};

const COLOR_ENERGIA: Record<NivelEnergia, string> = {
  'Muy alta': '#f44336',
  'Alta': '#FF9800',
  'Media': '#FFC107',
  'Baja': '#4CAF50',
};

const COLOR_MANTENIMIENTO: Record<NivelMantenimiento, string> = {
  'Alto': '#f44336',
  'Medio': '#FF9800',
  'Bajo': '#4CAF50',
};

function getMantenimientoClass(m: NivelMantenimiento, s: Record<string, string>): string {
  const map: Record<NivelMantenimiento, string> = {
    Alto: s.mantenimientoAlto,
    Medio: s.mantenimientoMedio,
    Bajo: s.mantenimientoBajo,
  };
  return map[m] ?? s.mantenimientoBajo;
}

function getEnergiaClass(e: NivelEnergia, s: Record<string, string>): string {
  const map: Record<NivelEnergia, string> = {
    'Muy alta': s.energiaMuyAlta,
    Alta: s.energiaAlta,
    Media: s.energiaMedia,
    Baja: s.energiaBaja,
  };
  return map[e] ?? s.energiaMedia;
}

export default function GuiaRazasPerrosPage() {
  const [busqueda, setBusqueda] = useState('');
  const [tamanoSelec, setTamanoSelec] = useState<Tamano | 'Todos'>('Todos');
  const [energiaSelec, setEnergiaSelec] = useState<NivelEnergia | 'Todos'>('Todos');
  const [soloApartamento, setSoloApartamento] = useState(false);
  const [soloNinos, setSoloNinos] = useState(false);

  const razasFiltradas = useMemo(() => {
    const t = busqueda.toLowerCase().trim();
    return RAZAS.filter((r) => {
      const matchTamano = tamanoSelec === 'Todos' || r.tamano === tamanoSelec;
      const matchEnergia = energiaSelec === 'Todos' || r.energia === energiaSelec;
      const matchApartamento = !soloApartamento || r.aptoApartamento;
      const matchNinos = !soloNinos || r.aptoNinos;
      const matchBusqueda =
        !t ||
        r.nombre.toLowerCase().includes(t) ||
        r.nombreIngles.toLowerCase().includes(t) ||
        r.origen.toLowerCase().includes(t) ||
        r.grupo.toLowerCase().includes(t);
      return matchTamano && matchEnergia && matchApartamento && matchNinos && matchBusqueda;
    });
  }, [busqueda, tamanoSelec, energiaSelec, soloApartamento, soloNinos]);

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.heroTitle}>🐶 Guía de Razas de Perros</h1>
          <p className={styles.heroSubtitle}>
            40 razas con temperamento, energía, mantenimiento y consejos para elegir la raza ideal
          </p>
        </header>

        <LegalNotice />

        <main className={styles.main}>
          {/* ── FILTROS Y BÚSQUEDA ──────────────────────────────────── */}
          <div className={styles.controles}>
            <input
              type="search"
              placeholder="Buscar por nombre, origen o grupo FCI..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={styles.buscador}
              aria-label="Buscar raza de perro"
            />

            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>Tamaño</span>
              <div className={styles.filtros} role="group" aria-label="Filtrar por tamaño">
                <button
                  className={`${styles.filtroBtn} ${tamanoSelec === 'Todos' ? styles.filtroActivo : ''}`}
                  onClick={() => setTamanoSelec('Todos')}
                >
                  Todos
                </button>
                {TAMANOS.map((t) => (
                  <button
                    key={t}
                    className={`${styles.filtroBtn} ${tamanoSelec === t ? styles.filtroActivo : ''}`}
                    onClick={() => setTamanoSelec(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>Nivel de energía</span>
              <div className={styles.filtros} role="group" aria-label="Filtrar por energía">
                <button
                  className={`${styles.filtroBtn} ${energiaSelec === 'Todos' ? styles.filtroActivo : ''}`}
                  onClick={() => setEnergiaSelec('Todos')}
                >
                  Todos
                </button>
                {ENERGIAS.map((e) => (
                  <button
                    key={e}
                    className={`${styles.filtroBtn} ${energiaSelec === e ? styles.filtroActivo : ''}`}
                    onClick={() => setEnergiaSelec(e)}
                    style={energiaSelec === e ? {} : { borderColor: COLOR_ENERGIA[e] }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.toggleRow}>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={soloApartamento}
                  onChange={(e) => setSoloApartamento(e.target.checked)}
                  className={styles.toggleInput}
                />
                <span className={styles.toggleText}>🏠 Solo apto apartamento</span>
              </label>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={soloNinos}
                  onChange={(e) => setSoloNinos(e.target.checked)}
                  className={styles.toggleInput}
                />
                <span className={styles.toggleText}>👦 Solo apto con niños</span>
              </label>
            </div>

            <p className={styles.contador} aria-live="polite">
              {razasFiltradas.length}{' '}
              {razasFiltradas.length === 1 ? 'raza encontrada' : 'razas encontradas'}
            </p>
          </div>

          {/* ── GRID DE RAZAS ─────────────────────────────────────────── */}
          <div className={styles.grid}>
            {razasFiltradas.map((raza) => (
              <article key={raza.id} className={styles.card}>
                {/* Barra de color del grupo FCI */}
                <div
                  className={styles.cardColorBar}
                  style={{ backgroundColor: COLOR_GRUPO[raza.grupo] }}
                />

                <div className={styles.cardHeader}>
                  <div
                    className={styles.razaCircle}
                    style={{ backgroundColor: COLOR_GRUPO[raza.grupo] + '22', border: `2px solid ${COLOR_GRUPO[raza.grupo]}` }}
                    aria-hidden="true"
                  >
                    🐶
                  </div>
                  <div className={styles.cardTitulo}>
                    <h2 className={styles.nombre}>{raza.nombre}</h2>
                    <span className={styles.nombreIngles}>{raza.nombreIngles}</span>
                    <span className={styles.origen}>🌍 {raza.origen}</span>
                  </div>
                </div>

                {/* Grupo FCI */}
                <div className={styles.grupoBadgeWrap}>
                  <span
                    className={styles.grupoBadge}
                    style={{ backgroundColor: COLOR_GRUPO[raza.grupo] + '20', color: COLOR_GRUPO[raza.grupo], borderColor: COLOR_GRUPO[raza.grupo] + '60' }}
                  >
                    {raza.grupo}
                  </span>
                </div>

                {/* Badges tamaño + energía */}
                <div className={styles.badges}>
                  <span className={styles.tamanoBadge}>{raza.tamano}</span>
                  <span
                    className={`${styles.energiaBadge} ${getEnergiaClass(raza.energia, styles)}`}
                  >
                    ⚡ {raza.energia}
                  </span>
                </div>

                {/* Iconos apto niños / apartamento */}
                <div className={styles.aptoRow}>
                  <span className={raza.aptoApartamento ? styles.aptoSi : styles.aptoNo}>
                    🏠 {raza.aptoApartamento ? 'Apto apartamento' : 'Necesita espacio'}
                  </span>
                  <span className={raza.aptoNinos ? styles.aptoSi : styles.aptoNo}>
                    👦 {raza.aptoNinos ? 'Apto con niños' : 'Precaución con niños'}
                  </span>
                </div>

                {/* Medidas */}
                <div className={styles.medidasRow}>
                  <span className={styles.medidaChip}>⚖️ {raza.pesoMin}–{raza.pesoMax} kg</span>
                  <span className={styles.medidaChip}>📏 {raza.alturaMin}–{raza.alturaMax} cm</span>
                  <span className={styles.medidaChip}>🦱 {raza.pelo}</span>
                  <span className={styles.medidaChip}>❤️ {raza.esperanzaVida}</span>
                </div>

                {/* Descripción */}
                <p className={styles.descripcion}>{raza.descripcion}</p>

                {/* Temperamento */}
                <div className={styles.temperamentoSection}>
                  <span className={styles.infoLabel}>Temperamento</span>
                  <div className={styles.temperamentoChips}>
                    {raza.temperamento.map((t) => (
                      <span key={t} className={styles.temperamentoChip}>{t}</span>
                    ))}
                  </div>
                </div>

                {/* Mantenimiento */}
                <div className={styles.mantenimientoSection}>
                  <span className={styles.infoLabel}>Mantenimiento</span>
                  <span
                    className={`${styles.mantenimientoBadge} ${getMantenimientoClass(raza.mantenimiento, styles)}`}
                    style={{ color: COLOR_MANTENIMIENTO[raza.mantenimiento] }}
                  >
                    {raza.mantenimiento}
                  </span>
                </div>

                {/* Curiosidad */}
                <div className={styles.curiosidadBox}>
                  <span className={styles.curiosidadIcon} aria-hidden="true">💡</span>
                  <p className={styles.curiosidadTexto}>{raza.curiosidad}</p>
                </div>
              </article>
            ))}

            {razasFiltradas.length === 0 && (
              <p className={styles.sinResultados} role="alert">
                No se encontraron razas con esos criterios. Prueba a cambiar los filtros.
              </p>
            )}
          </div>
        </main>

        {/* ── SECCIÓN EDUCATIVA v2.0 ──────────────────────────────────── */}
        <EducationalSection
          title="Cómo elegir tu raza de perro ideal"
          subtitle="Guía completa para encontrar el compañero perfecto"
        >
          {/* 1. Tabla comparativa */}
          <section className={styles.eduSection}>
            <h2 className={styles.eduTitle}>Comparativa de razas populares</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <caption>6 razas representativas por tamaño, energía, mantenimiento y aptitud</caption>
                <thead>
                  <tr>
                    <th>Raza</th>
                    <th>Tamaño</th>
                    <th>Energía</th>
                    <th>Mantenimiento</th>
                    <th>Apto niños</th>
                    <th>Apto piso</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Labrador Retriever</strong></td>
                    <td>Grande</td>
                    <td>Alta</td>
                    <td>Bajo</td>
                    <td className={styles.tdSi}>Sí</td>
                    <td className={styles.tdNo}>No</td>
                  </tr>
                  <tr>
                    <td><strong>Bulldog Francés</strong></td>
                    <td>Pequeño</td>
                    <td>Baja</td>
                    <td>Bajo</td>
                    <td className={styles.tdSi}>Sí</td>
                    <td className={styles.tdSi}>Sí</td>
                  </tr>
                  <tr>
                    <td><strong>Border Collie</strong></td>
                    <td>Mediano</td>
                    <td>Muy alta</td>
                    <td>Medio</td>
                    <td className={styles.tdSi}>Sí</td>
                    <td className={styles.tdNo}>No</td>
                  </tr>
                  <tr>
                    <td><strong>Caniche</strong></td>
                    <td>Variable</td>
                    <td>Alta</td>
                    <td>Alto</td>
                    <td className={styles.tdSi}>Sí</td>
                    <td className={styles.tdSi}>Sí</td>
                  </tr>
                  <tr>
                    <td><strong>Cavalier K.C.S.</strong></td>
                    <td>Pequeño</td>
                    <td>Media</td>
                    <td>Alto</td>
                    <td className={styles.tdSi}>Sí</td>
                    <td className={styles.tdSi}>Sí</td>
                  </tr>
                  <tr>
                    <td><strong>Malinois Belga</strong></td>
                    <td>Grande</td>
                    <td>Muy alta</td>
                    <td>Bajo</td>
                    <td className={styles.tdNo}>No</td>
                    <td className={styles.tdNo}>No</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. Perfiles de adopción (4 escenarios) */}
          <section className={styles.eduSection}>
            <h2 className={styles.eduTitle}>¿Qué raza se adapta a tu vida?</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <strong>👨‍👩‍👧‍👦 Familia con niños y jardín</strong>
                <p>
                  Labrador Retriever, Golden Retriever o Beagle. Estas razas combinan paciencia,
                  energía controlada y amor por los juegos. El Labrador aguanta los zarandeos de
                  los niños pequeños mejor que ninguna otra raza de tamaño grande.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <strong>🏙️ Persona en piso, ciudad</strong>
                <p>
                  Bulldog Francés, Shih Tzu, Bichón Frisé o Basset Hound. Razas de baja energía
                  que se conforman con paseos diarios moderados. El Bulldog Francés es el rey
                  de los pisos pequeños: duerme mucho y casi no ladra.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <strong>🏃 Deportista activo</strong>
                <p>
                  Border Collie, Husky Siberiano, Weimaraner o Braco Alemán. Estos perros
                  necesitan compañero de running, ciclismo o senderismo. Sin suficiente ejercicio
                  pueden volverse destructivos. Para personas que hacen deporte a diario.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <strong>👴 Persona mayor o tranquila</strong>
                <p>
                  Cavalier King Charles, Maltés, Shar Pei o Basset Hound. Razas de carácter
                  apacible que no requieren ejercicio intenso. El Cavalier es especialmente
                  bueno con personas mayores: adaptable, cariñoso y sin necesidad de grandes
                  caminatas.
                </p>
              </div>
            </div>
          </section>

          {/* 3. FAQ (6 preguntas) */}
          <section className={styles.eduSection}>
            <h2 className={styles.eduTitle}>Preguntas frecuentes</h2>
            <ul className={styles.faqList}>
              <li className={styles.faqItem}>
                <strong>¿Qué raza es mejor para un piso pequeño?</strong>
                <p>
                  Las razas más adaptadas son el Bulldog Francés, el Shih Tzu, el Chihuahua,
                  el Bichón Frisé y el Cavalier King Charles. Lo más importante no es el tamaño
                  del perro sino su nivel de energía: un Whippet grande puede vivir tranquilo
                  en un piso si recibe su ejercicio diario.
                </p>
              </li>
              <li className={styles.faqItem}>
                <strong>¿Existen razas hipoalergénicas?</strong>
                <p>
                  No existen razas 100% hipoalergénicas, pero sí razas que producen menos
                  alérgenos. El Caniche, el Bichón Frisé, el Maltés y el Yorkshire Terrier
                  sueltan muy poco pelo. La alergia no es al pelo sino a una proteína de la
                  saliva y la piel, pero reducir el pelo en casa ayuda significativamente.
                </p>
              </li>
              <li className={styles.faqItem}>
                <strong>¿Qué raza requiere menos ejercicio?</strong>
                <p>
                  El Basset Hound, el Shar Pei, el Bulldog Francés y el Shih Tzu son las razas
                  con menor necesidad de ejercicio intenso. Basta con paseos cortos y juego
                  tranquilo en casa. Sin embargo, incluso estas razas necesitan salir a la
                  calle al menos dos veces al día.
                </p>
              </li>
              <li className={styles.faqItem}>
                <strong>¿Cuál es la mejor raza para niños pequeños?</strong>
                <p>
                  El Labrador Retriever y el Golden Retriever son los más recomendados por
                  veterinarios para familias con niños. Son pacientes, casi nunca muerden por
                  accidente y disfrutan del juego activo. El Beagle y el Cavalier también son
                  excelentes opciones para familias con espacio.
                </p>
              </li>
              <li className={styles.faqItem}>
                <strong>¿Es mejor adoptar o comprar un perro?</strong>
                <p>
                  La adopción es siempre la primera opción recomendable: miles de perros
                  esperan en protectoras. Si se busca una raza concreta por razones de salud
                  o estilo de vida, es fundamental elegir criador responsable con pruebas
                  de salud genética, no granjas de cachorros ni tiendas de animales.
                </p>
              </li>
              <li className={styles.faqItem}>
                <strong>¿Cuánto cuesta mantener un perro al mes?</strong>
                <p>
                  Depende del tamaño y la raza, pero un presupuesto orientativo en España
                  es de 60-150€/mes para razas pequeñas (comida, veterinario, peluquería)
                  y 150-300€/mes para razas grandes. A esto hay que sumar el seguro de
                  responsabilidad civil (obligatorio en muchas comunidades) y los imprevistos
                  veterinarios.
                </p>
              </li>
            </ul>
          </section>

          {/* 4. Guía paso a paso (5 pasos) */}
          <section className={styles.eduSection}>
            <h2 className={styles.eduTitle}>Cómo elegir tu raza ideal: 5 pasos</h2>
            <ol className={styles.stepGuide}>
              <li className={styles.step}>
                <span className={styles.stepNumber}>1</span>
                <div className={styles.stepContent}>
                  <strong>Evalúa honestamente tu ritmo de vida</strong>
                  <p>
                    ¿Cuántas horas pasas en casa? ¿Tienes jardín? ¿Haces ejercicio a diario?
                    Una raza de alta energía con un dueño sedentario es una receta para el
                    fracaso. Sé realista: el perro que tienes que pasear aunque llueva a las
                    7 AM todos los días.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>2</span>
                <div className={styles.stepContent}>
                  <strong>Considera el espacio disponible</strong>
                  <p>
                    Un perro grande en un piso pequeño puede funcionar si se le ejercita
                    correctamente. Pero un perro de alta energía sin espacio ni ejercicio
                    suficiente se convertirá en un perro ansioso y destructivo. Elige raza
                    pensando en el ejercicio que puedes ofrecer, no solo en el espacio físico.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>3</span>
                <div className={styles.stepContent}>
                  <strong>Investiga la predisposición a enfermedades</strong>
                  <p>
                    Cada raza tiene sus problemas de salud típicos. Los Bulldogs tienen problemas
                    respiratorios; los perros grandes son propensos a displasia de cadera;
                    el Dachshund tiene problemas de columna. Infórmate sobre los costes
                    veterinarios esperados antes de elegir.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>4</span>
                <div className={styles.stepContent}>
                  <strong>Considera la experiencia previa con perros</strong>
                  <p>
                    Razas como el Border Collie, el Malinois, el Husky o el Akita no son
                    recomendables para dueños primerizos. Requieren adiestramiento consistente
                    y experiencia en el manejo canino. Si es tu primer perro, opta por razas
                    como el Labrador, el Golden o el Cavalier.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>5</span>
                <div className={styles.stepContent}>
                  <strong>Visita protectoras y criadores responsables</strong>
                  <p>
                    Antes de decidir definitivamente, visita protectoras: puede haber perros
                    de la raza que buscas o mestizos con el carácter que necesitas. Si optas
                    por criador, visita el criadero, conoce a los padres y pide pruebas de
                    salud genética. Nunca compres en tiendas de animales ni por internet
                    sin visitar antes.
                  </p>
                </div>
              </li>
            </ol>
          </section>

          {/* 5. Tips (5 mejores prácticas) */}
          <section className={styles.eduSection}>
            <h2 className={styles.eduTitle}>Mejores prácticas: adopción responsable</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🏥</span>
                <p>
                  <strong>Veterinario desde el primer día.</strong> La primera visita al
                  veterinario debe ser en las primeras 48 horas tras adoptar. El seguro
                  de salud canino puede ahorrar miles de euros en emergencias.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🤝</span>
                <p>
                  <strong>Socialización temprana.</strong> Entre las 3 y 14 semanas de vida
                  es el periodo crítico. El cachorro debe conocer personas, perros, ruidos
                  y situaciones variadas. Una mala socialización puede crear miedos de por vida.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📋</span>
                <p>
                  <strong>Chip, vacunas y licencia.</strong> El microchip es obligatorio
                  en España desde los 3 meses. La licencia de perro potencialmente peligroso
                  es obligatoria para algunas razas. Mantén el calendario vacunal al día.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🎓</span>
                <p>
                  <strong>Adiestramiento positivo.</strong> El adiestramiento basado en
                  refuerzo positivo es más efectivo y menos traumático que los métodos
                  coercitivos. Un curso básico de obediencia mejora enormemente la convivencia.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🛡️</span>
                <p>
                  <strong>Seguro de responsabilidad civil.</strong> Es obligatorio en varias
                  comunidades autónomas y recomendable en todo caso. Cubre daños a terceros
                  causados por tu perro. Los costes de un accidente pueden ser cuantiosos.
                </p>
              </div>
            </div>
          </section>

          {/* 6. Warning box (5 errores) */}
          <section className={styles.eduSection}>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>Errores frecuentes al elegir raza de perro</strong>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>Elegir por el aspecto físico, no por el carácter:</strong> un
                  Husky es precioso en fotos pero necesita correr 20 km al día. Un Malinois
                  parece manejable pero es un perro de trabajo de alto rendimiento. La
                  apariencia es el peor criterio de selección posible.
                </li>
                <li>
                  <strong>No considerar el espacio ni el ejercicio disponible:</strong> el
                  error más común. Un perro de alta energía en un piso sin ejercicio suficiente
                  desarrollará ansiedad, destructividad y problemas de comportamiento que
                  llevan a su abandono.
                </li>
                <li>
                  <strong>Comprar en tiendas de animales o por internet sin visitar:</strong> las
                  granjas de cachorros (puppy mills) producen animales con graves problemas
                  de salud y comportamiento. Nunca compres un cachorro sin visitar el criadero
                  y conocer a los padres en persona.
                </li>
                <li>
                  <strong>Elegir raza inadecuada para la edad de los niños:</strong> razas
                  muy pequeñas (Chihuahua, Yorkshire) pueden ser lastimadas por niños pequeños.
                  Razas de alta energía (Border Collie, Jack Russell) pueden ser demasiado
                  intensas. Consulta con un veterinario o educador canino antes de decidir.
                </li>
                <li>
                  <strong>Ignorar los costes de salud específicos de la raza:</strong> las
                  razas braquicéfalas (Bulldog, Pug, Boston Terrier) tienen altos costes
                  veterinarios por sus problemas respiratorios. Los perros gigantes viven
                  menos y las cirugías cuestan más. Los perros de pelo largo necesitan
                  peluquería profesional regular.
                </li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('guia-razas-perros')} />
        <ShareCard appName="guia-razas-perros" />
        <Footer appName="guia-razas-perros" />
    </div>
  );
}
