'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './GuiaInsectosJardin.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================================
// TIPOS
// ============================================================

type RolJardin = 'Beneficioso' | 'Perjudicial' | 'Polinizador' | 'Neutro';
type OrdenInsecto =
  | 'Coleoptera'
  | 'Diptera'
  | 'Hymenoptera'
  | 'Lepidoptera'
  | 'Hemiptera'
  | 'Orthoptera'
  | 'Neuroptera'
  | 'Mantodea'
  | 'Dermaptera'
  | 'Thysanoptera'
  | 'Isoptera';
type Actividad = 'Diurno' | 'Nocturno' | 'Ambos';
type ZonaJardin = 'Suelo' | 'Plantas' | 'Flores' | 'Frutos' | 'Madera' | 'Raíces' | 'Vuelo';

interface InsectoJardin {
  id: string;
  nombre: string;
  nombreCientifico: string;
  orden: OrdenInsecto | string;
  rol: RolJardin;
  tamanoMm: string;
  zona: ZonaJardin[];
  actividad: Actividad;
  dieta: string;
  colorPrimario: string;
  descripcion: string;
  comoIdentificarlo: string;
  queHacer: string;
  curiosidad: string;
}

// ============================================================
// DATOS
// ============================================================

const INSECTOS: InsectoJardin[] = [
  // --- Beneficiosos/Depredadores ---
  {
    id: 'mariquita-7-puntos',
    nombre: 'Mariquita de 7 puntos',
    nombreCientifico: 'Coccinella septempunctata',
    orden: 'Coleoptera',
    rol: 'Beneficioso',
    tamanoMm: '5-8 mm',
    zona: ['Plantas', 'Flores'],
    actividad: 'Diurno',
    dieta: 'Pulgones y cochinillas',
    colorPrimario: '#FF0000',
    descripcion: 'Uno de los mejores aliados del jardín. Sus élitros rojos con siete puntos negros la hacen inconfundible. Tanto el adulto como la larva se alimentan vorazmente de pulgones.',
    comoIdentificarlo: 'Élitros rojos con exactamente 7 puntos negros. La larva es gris oscura con manchas anaranjadas y parece un cocodrilo en miniatura.',
    queHacer: '✅ Protégela: evita pesticidas en su zona y planta flores como hinojo, eneldo o caléndula para atraerla.',
    curiosidad: 'Una sola mariquita puede devorar hasta 5.000 pulgones a lo largo de su vida.',
  },
  {
    id: 'crisopa-verde',
    nombre: 'Crisopa verde',
    nombreCientifico: 'Chrysoperla carnea',
    orden: 'Neuroptera',
    rol: 'Beneficioso',
    tamanoMm: '12-20 mm',
    zona: ['Plantas', 'Flores'],
    actividad: 'Nocturno',
    dieta: 'Pulgones, mosca blanca, ácaros',
    colorPrimario: '#90EE90',
    descripcion: 'Insecto delicado con alas de encaje verde pálido. Sus larvas son las verdaderas cazadoras y pueden consumir enormes cantidades de plagas blandas.',
    comoIdentificarlo: 'Adulto de color verde pálido con ojos dorados y alas reticuladas transparentes. La larva es marrón con mandíbulas en forma de pinza.',
    queHacer: '✅ Protégela: planta flores nectaríferas para los adultos. Sus huevos en filamentos blancos son una señal de buena salud del jardín.',
    curiosidad: 'Sus larvas devoran hasta 500 pulgones en su desarrollo larvario de 2-3 semanas.',
  },
  {
    id: 'tijereta',
    nombre: 'Tijereta',
    nombreCientifico: 'Forficula auricularia',
    orden: 'Dermaptera',
    rol: 'Beneficioso',
    tamanoMm: '10-15 mm',
    zona: ['Suelo', 'Plantas'],
    actividad: 'Nocturno',
    dieta: 'Pulgones, orugas pequeñas, restos orgánicos',
    colorPrimario: '#8B4513',
    descripcion: 'Insecto alargado con el característico par de cercos en forma de pinza en el extremo del abdomen. Es omnívora y en el jardín actúa sobre todo como depredadora de plagas blandas.',
    comoIdentificarlo: 'Cuerpo marrón rojizo alargado de 10-15 mm con pinzas curvadas en la cola. Muy activa de noche.',
    queHacer: '✅ Protégela: instala refugios (macetas invertidas con paja) cerca de las plantas con pulgones. De día se esconde y de noche caza.',
    curiosidad: 'Cuida sus huevos con una dedicación maternal inusual en insectos, manteniéndolos limpios y húmedos hasta la eclosión.',
  },
  {
    id: 'sirfido',
    nombre: 'Sírfido',
    nombreCientifico: 'Episyrphus balteatus',
    orden: 'Diptera',
    rol: 'Beneficioso',
    tamanoMm: '8-12 mm',
    zona: ['Flores', 'Vuelo'],
    actividad: 'Diurno',
    dieta: 'Polen y néctar (adulto); pulgones (larva)',
    colorPrimario: '#FFD700',
    descripcion: 'Mosca que imita el patrón amarillo y negro de las avispas para protegerse de depredadores. El adulto poliniza flores y sus larvas se alimentan de pulgones.',
    comoIdentificarlo: 'Abdomen con bandas amarillas y negras alternadas, pero ojos enormes típicos de mosca y sin cintura de avispa. Vuelo estacionario muy característico.',
    queHacer: '✅ Atráelo: planta flores de la familia Apiaceae (zanahoria, hinojo, perejil). Su presencia indica un jardín equilibrado.',
    curiosidad: 'Imita las rayas de la avispa para protegerse de depredadores; es completamente inofensivo para los humanos.',
  },
  {
    id: 'carabido',
    nombre: 'Carábido (escarabajo del suelo)',
    nombreCientifico: 'Carabus granulatus',
    orden: 'Coleoptera',
    rol: 'Beneficioso',
    tamanoMm: '20-30 mm',
    zona: ['Suelo'],
    actividad: 'Nocturno',
    dieta: 'Babosas, caracoles, larvas, orugas',
    colorPrimario: '#2F4F4F',
    descripcion: 'Gran escarabajo de suelo con cuerpo metálico verde-cobrizo y élitros con costillas longitudinales. Depredador ágil que elimina babosas y orugas nocturnas.',
    comoIdentificarlo: 'Cuerpo oval alargado, patas largas para correr, color metálico verdoso o negruzco. Se esconde bajo piedras y madera.',
    queHacer: '✅ Protégelo: evita compactar el suelo, mantén zonas con hojarasca y no uses venenos para babosas (pellets de metaldehído lo matan).',
    curiosidad: 'Corre muy rápido para atrapar presas; sus alas están atrofiadas y casi nunca vuela.',
  },
  {
    id: 'avispa-parasita',
    nombre: 'Avispa parásita',
    nombreCientifico: 'Aphidius colemani',
    orden: 'Hymenoptera',
    rol: 'Beneficioso',
    tamanoMm: '2-3 mm',
    zona: ['Plantas', 'Vuelo'],
    actividad: 'Diurno',
    dieta: 'Parasita pulgones por dentro',
    colorPrimario: '#1C1C1C',
    descripcion: 'Microavispa parásita diminuta que no pica a los humanos. Utilizada en agricultura ecológica como agente de control biológico contra pulgones.',
    comoIdentificarlo: 'Muy pequeña (2-3 mm), negra, con antenas largas. Las "momias" doradas hinchadas en colonias de pulgones son la señal más visible de su actividad.',
    queHacer: '✅ Favorécela: si ves pulgones momificados (hinchados y dorados), ya está trabajando. No destruyas esas colonias, déjalas.',
    curiosidad: 'Pone sus huevos dentro del pulgón vivo. La larva lo devora desde dentro y emerge del pulgón momificado ya como adulto.',
  },
  {
    id: 'chinche-depredadora',
    nombre: 'Chinche depredadora',
    nombreCientifico: 'Orius laevigatus',
    orden: 'Hemiptera',
    rol: 'Beneficioso',
    tamanoMm: '2-3 mm',
    zona: ['Flores', 'Plantas'],
    actividad: 'Diurno',
    dieta: 'Trips, pulgones, ácaros, huevos de plagas',
    colorPrimario: '#8B0000',
    descripcion: 'Pequeña chinche negra y blanca, utilizada en biocontrol profesional de trips. A diferencia de muchas chinches, esta es depredadora y no daña plantas.',
    comoIdentificarlo: 'Muy pequeña, bicolor (negro y blanco), cuerpo ovalado. Se mueve rápido entre flores y brotes tiernos.',
    queHacer: '✅ Favorécela: planta flores (Calendula, Tagetes). Se puede comprar en tiendas de jardinería ecológica para sueltas preventivas.',
    curiosidad: 'Perfora a sus presas con el pico y les succiona el contenido. Es un depredador voraz pese a su tamaño diminuto.',
  },
  {
    id: 'mantis-religiosa',
    nombre: 'Mantis religiosa',
    nombreCientifico: 'Mantis religiosa',
    orden: 'Mantodea',
    rol: 'Beneficioso',
    tamanoMm: '40-75 mm',
    zona: ['Plantas', 'Flores'],
    actividad: 'Diurno',
    dieta: 'Insectos de todo tipo',
    colorPrimario: '#8FBC8F',
    descripcion: 'El depredador más icónico del jardín mediterráneo. Gracias a su coloración críptica, se mimetiza perfectamente con la vegetación para emboscar a sus presas.',
    comoIdentificarlo: 'Cuerpo verde o pardo alargado, cabeza triangular giratoria, patas delanteras raptoras en posición de "rezo". Inconfundible.',
    queHacer: '✅ Protégela: es una especie protegida en España. Simplemente obsérvala y déjala actuar. Su ooteca (puesta) es un signo excelente.',
    curiosidad: 'El macho es devorado por la hembra tras el apareamiento en un porcentaje de casos (no siempre), pero el fenómeno ocurre más en cautividad.',
  },
  {
    id: 'abejorro-tierra',
    nombre: 'Abejorro de tierra',
    nombreCientifico: 'Bombus terrestris',
    orden: 'Hymenoptera',
    rol: 'Polinizador',
    tamanoMm: '15-20 mm',
    zona: ['Flores', 'Vuelo'],
    actividad: 'Diurno',
    dieta: 'Polen y néctar',
    colorPrimario: '#FFA500',
    descripcion: 'Abejorro grande y peludo, fundamental en la polinización de cultivos y jardines. Más robusto que la abeja melífera y activo incluso con tiempo nublado.',
    comoIdentificarlo: 'Grande, peludo, con bandas amarillas y negras y el extremo del abdomen blanquecino. Zumbido grave y característico.',
    queHacer: '✅ Atráelo: planta lavanda, salvia, romero, trébol y flores con corola profunda. Mantén zonas de suelo sin cubrir para sus nidos subterráneos.',
    curiosidad: 'Puede polinizar incluso con lluvia fina y es clave en el cultivo de tomates, que necesitan la "polinización por vibración" que solo hace el abejorro.',
  },
  {
    id: 'escarabajo-rinoceronte',
    nombre: 'Escarabajo rinoceronte',
    nombreCientifico: 'Oryctes nasicornis',
    orden: 'Coleoptera',
    rol: 'Neutro',
    tamanoMm: '25-40 mm',
    zona: ['Suelo', 'Madera'],
    actividad: 'Nocturno',
    dieta: 'Madera podrida, humus (larva)',
    colorPrimario: '#8B6914',
    descripcion: 'Uno de los escarabajos más grandes de Europa. El macho tiene un cuerno frontal prominente que le da su nombre. Vive en compost y madera en descomposición.',
    comoIdentificarlo: 'Grande, marrón castaño brillante. El macho tiene un cuerno curvo en la cabeza. Vuelo nocturno torpe y ruidoso.',
    queHacer: '🔍 Déjalo: es un descomponedor beneficioso para el compost. Solo es problemático en cantidades muy grandes en palmas ornamentales (pariente invasor).',
    curiosidad: 'Sus larvas tardan 3-5 años en desarrollarse en el interior del compost o madera podrida antes de metamorfosearse.',
  },
  // --- Polinizadores ---
  {
    id: 'abeja-melifera',
    nombre: 'Abeja melífera',
    nombreCientifico: 'Apis mellifera',
    orden: 'Hymenoptera',
    rol: 'Polinizador',
    tamanoMm: '12-15 mm',
    zona: ['Flores', 'Vuelo'],
    actividad: 'Diurno',
    dieta: 'Néctar y polen',
    colorPrimario: '#FFD700',
    descripcion: 'El polinizador más conocido y crucial para la agricultura. Vive en colonias de hasta 60.000 individuos y produce miel y cera.',
    comoIdentificarlo: 'Cuerpo marrón con rayas amarillas, peluda, con cestillos de polen visibles en las patas traseras. Zumbido suave.',
    queHacer: '✅ Atráela: planta diversas flores nectaríferas durante todo el año. Nunca uses insecticidas sistémicos como neonicotinoides.',
    curiosidad: 'Cada abeja visita hasta 1.000 flores al día y recorre un radio de hasta 3 km desde la colmena.',
  },
  {
    id: 'mariposa-cola-golondrina',
    nombre: 'Mariposa cola de golondrina',
    nombreCientifico: 'Papilio machaon',
    orden: 'Lepidoptera',
    rol: 'Polinizador',
    tamanoMm: '65-86 mm envergadura',
    zona: ['Flores', 'Vuelo'],
    actividad: 'Diurno',
    dieta: 'Néctar',
    colorPrimario: '#FFFF00',
    descripcion: 'Una de las mariposas más llamativas de Europa, con alas amarillas y negras y colas alargadas. Sus orugas se alimentan de plantas de la familia Apiaceae.',
    comoIdentificarlo: 'Alas amarillo limón con dibujo negro, puntos azules y rojos, y apéndices posteriores en forma de cola. Inconfundible.',
    queHacer: '✅ Atráela: planta hinojo, zanahoria silvestre, perejil o eneldo para que ponga sus huevos. Tolera algunas orugas en esas plantas.',
    curiosidad: 'Su oruga imita los excrementos de pájaro en las primeras fases para evitar ser comida; después imita hojas verdes.',
  },
  {
    id: 'vanesa-cardos',
    nombre: 'Vanesa de los cardos',
    nombreCientifico: 'Vanessa cardui',
    orden: 'Lepidoptera',
    rol: 'Polinizador',
    tamanoMm: '45-60 mm envergadura',
    zona: ['Flores', 'Vuelo'],
    actividad: 'Diurno',
    dieta: 'Néctar',
    colorPrimario: '#FF8C00',
    descripcion: 'La mariposa con mayor área de distribución del mundo. Migra desde el norte de África cada primavera en grandes olas migratorias.',
    comoIdentificarlo: 'Alas naranja con manchas negras y blancas, borde posterior moteado. Tamaño mediano, vuelo rápido y errático.',
    queHacer: '✅ Atráela: planta cardos, malvas, lavanda y menta. Sus orugas viven en cardos y ortigas, que puedes mantener en un rincón del jardín.',
    curiosidad: 'Migra desde el Sahara hasta el norte de Europa; el viaje completo (varias generaciones) puede cubrir hasta 14.000 km.',
  },
  {
    id: 'mariposa-col',
    nombre: 'Mariposa de la col',
    nombreCientifico: 'Pieris brassicae',
    orden: 'Lepidoptera',
    rol: 'Perjudicial',
    tamanoMm: '50-65 mm envergadura',
    zona: ['Flores', 'Plantas'],
    actividad: 'Diurno',
    dieta: 'Néctar (adulto); hojas de col (larva)',
    colorPrimario: '#FFFFFF',
    descripcion: 'El adulto es un polinizador blanco con punta alar negra, pero sus orugas verde-amarillentas son una de las plagas más destructivas de las crucíferas.',
    comoIdentificarlo: 'Mariposa blanca con punto negro en el ala delantera. La oruga es verde con rayas amarillas y puntos negros, con pelillos. Siempre en coles, berzas y brócoli.',
    queHacer: '⚠️ Contrólala: coloca malla antiinsectos sobre crucíferas, aplasta los huevos amarillos en grupos bajo las hojas, recoge las orugas a mano.',
    curiosidad: 'El adulto poliniza flores, pero sus orugas pueden defoliar completamente una col en pocos días si no se controlan.',
  },
  {
    id: 'eristalis',
    nombre: 'Mosca de las flores (Eristalis)',
    nombreCientifico: 'Eristalis tenax',
    orden: 'Diptera',
    rol: 'Polinizador',
    tamanoMm: '10-15 mm',
    zona: ['Flores', 'Vuelo'],
    actividad: 'Diurno',
    dieta: 'Néctar y materia orgánica',
    colorPrimario: '#8B6914',
    descripcion: 'Sírfido grande que imita con gran fidelidad a la abeja melífera. Polinizador generalista que visita una enorme variedad de flores.',
    comoIdentificarlo: 'Aspecto de abeja (marrón y peluda), pero ojos de mosca grandes que casi se tocan en el macho. Sin cintura definida.',
    queHacer: '✅ Favorécela: planta flores compuestas (margaritas, caléndulas, girasoles). Es completamente inofensiva.',
    curiosidad: 'Su larva vive en aguas estancadas con materia orgánica; se llama "larva de rata" por su larga sifón respiratoria posterior.',
  },
  // --- Perjudiciales ---
  {
    id: 'pulgon-verde-melocotonero',
    nombre: 'Pulgón verde del melocotonero',
    nombreCientifico: 'Myzus persicae',
    orden: 'Hemiptera',
    rol: 'Perjudicial',
    tamanoMm: '1-3 mm',
    zona: ['Plantas', 'Raíces'],
    actividad: 'Ambos',
    dieta: 'Savia vegetal',
    colorPrimario: '#90EE90',
    descripcion: 'El pulgón más polífago del mundo. Afecta a cientos de especies vegetales y es el principal vector de más de 100 virus de plantas.',
    comoIdentificarlo: 'Verde pálido brillante, píriform (con forma de pera), tamaño muy pequeño. Colonias densas en brotes y envés de hojas. Produce melaza pegajosa.',
    queHacer: '⚠️ Contrólalo: aplica jabón potásico al 2% o aceite de neem. Favorece a sus depredadores naturales (mariquitas, crisopas). Evita exceso de nitrógeno.',
    curiosidad: 'Una sola hembra produce hasta 80 descendientes por semana; en condiciones favorables, una colonia puede explotar exponencialmente.',
  },
  {
    id: 'pulgon-negro-haba',
    nombre: 'Pulgón negro de la haba',
    nombreCientifico: 'Aphis fabae',
    orden: 'Hemiptera',
    rol: 'Perjudicial',
    tamanoMm: '1.5-3 mm',
    zona: ['Plantas'],
    actividad: 'Ambos',
    dieta: 'Savia vegetal',
    colorPrimario: '#1C1C1C',
    descripcion: 'Pulgón de color negro intenso que forma colonias masivas en habas, judías, remolacha y muchas otras plantas.',
    comoIdentificarlo: 'Negro brillante, muy pequeño, en colonias densas que pueden cubrir completamente los brotes tiernos. Suelen ir acompañados de hormigas.',
    queHacer: '⚠️ Contrólalo: quita los brotes más afectados, aplica jabón potásico. Controla también las hormigas que los protegen (cinta adhesiva en tallo).',
    curiosidad: 'Puede cubrir completamente los brotes tiernos en pocos días; las hormigas los "pastorean" para recolectar su melaza.',
  },
  {
    id: 'mosca-blanca',
    nombre: 'Mosca blanca',
    nombreCientifico: 'Trialeurodes vaporariorum',
    orden: 'Hemiptera',
    rol: 'Perjudicial',
    tamanoMm: '1-2 mm',
    zona: ['Plantas', 'Flores'],
    actividad: 'Diurno',
    dieta: 'Savia vegetal',
    colorPrimario: '#FFFFFF',
    descripcion: 'Diminuta mosca blanca que vive en el envés de las hojas. Muy común en tomates, pimientos y plantas ornamentales, especialmente en invernadero.',
    comoIdentificarlo: 'Al agitar la planta, vuela una nube blanca. En el envés de hojas se ven los adultos blancos y las larvas planas y transparentes.',
    queHacer: '⚠️ Contrólala: trampas cromáticas amarillas, jabón potásico, Beauveria bassiana (hongo entomopatógeno). Introduce Encarsia formosa en invernadero.',
    curiosidad: 'Produce melaza que cae sobre las hojas inferiores generando negrilla (hongo negro), que reduce la fotosíntesis.',
  },
  {
    id: 'trips',
    nombre: 'Trips',
    nombreCientifico: 'Frankliniella occidentalis',
    orden: 'Thysanoptera',
    rol: 'Perjudicial',
    tamanoMm: '1-2 mm',
    zona: ['Flores', 'Plantas'],
    actividad: 'Diurno',
    dieta: 'Savia y tejido vegetal',
    colorPrimario: '#D2691E',
    descripcion: 'Insecto diminuto de orden propio. Raspa y succiona el contenido de células vegetales, dejando decoloraciones plateadas en flores y hojas.',
    comoIdentificarlo: 'Prácticamente invisible a simple vista. Sus daños: manchas plateadas o pardas en flores y hojas, deformaciones en brotes. Trampas azules los capturan.',
    queHacer: '⚠️ Contrólalo: trampas cromáticas azules, jabón potásico, spinosad (biopesticida). Orius laevigatus es su depredador natural más eficaz.',
    curiosidad: 'Tan pequeño que es difícil de ver a simple vista; daña flores y transmite el virus del bronceado del tomate (TSWV).',
  },
  {
    id: 'cochinilla-algodonosa',
    nombre: 'Cochinilla algodonosa',
    nombreCientifico: 'Pseudococcus longispinus',
    orden: 'Hemiptera',
    rol: 'Perjudicial',
    tamanoMm: '2-5 mm',
    zona: ['Plantas', 'Raíces'],
    actividad: 'Ambos',
    dieta: 'Savia vegetal',
    colorPrimario: '#F5F5F5',
    descripcion: 'Cochinilla cubierta por una masa algodonosa blanca que le da su nombre. Afecta a una gran variedad de plantas de interior y exterior.',
    comoIdentificarlo: 'Masas blancas algodonosas en axilas de hojas, tallos y raíces. Al retirar el algodón se ve el insecto rosado debajo.',
    queHacer: '⚠️ Contrólala: aplica alcohol isopropílico con bastoncillo, jabón potásico, aceite de neem. Para raíces, baño del cepellón. En exterior, Cryptolaemus montrouzieri (mariquita depredadora).',
    curiosidad: 'Se protege con una capa cerosa blanca que la hace muy resistente a los sprays; hay que asegurarse de que el producto la penetre.',
  },
  {
    id: 'arana-roja',
    nombre: 'Araña roja',
    nombreCientifico: 'Tetranychus urticae',
    orden: 'Hemiptera',
    rol: 'Perjudicial',
    tamanoMm: '0.5 mm',
    zona: ['Plantas'],
    actividad: 'Ambos',
    dieta: 'Savia vegetal',
    colorPrimario: '#FF0000',
    descripcion: 'Ácaro (no insecto) de tamaño minúsculo. Chupa el contenido de las células del envés de las hojas, dejando un aspecto moteado y amarillento. Prolifera en calor y sequía.',
    comoIdentificarlo: 'Hojas con punteado fino amarillento en el haz. En el envés, con lupa, se ven los ácaros rojos diminutos y sus finísimas telarañas.',
    queHacer: '⚠️ Contrólala: aumenta la humedad ambiental (riegos frecuentes), aceite de neem, azufre mojable. El ácaro depredador Phytoseiulus persimilis es muy eficaz.',
    curiosidad: 'Técnicamente es un ácaro, no un insecto (tiene 8 patas); se multiplica de forma exponencial en ambiente caluroso y seco.',
  },
  {
    id: 'minador-hojas',
    nombre: 'Minador de hojas',
    nombreCientifico: 'Liriomyza trifolii',
    orden: 'Diptera',
    rol: 'Perjudicial',
    tamanoMm: '1.5-2 mm',
    zona: ['Plantas'],
    actividad: 'Diurno',
    dieta: 'Tejido entre capas de la hoja',
    colorPrimario: '#888888',
    descripcion: 'Mosca cuyas larvas excavan galerías sinuosas entre las capas de las hojas, dejando rastros visibles. Afecta a tomates, lechugas, apio y muchas plantas ornamentales.',
    comoIdentificarlo: 'Galerías blanquecinas sinuosas dentro de las hojas, que se ensanchan a medida que la larva crece. El adulto es muy pequeño y oscuro.',
    queHacer: '⚠️ Contrólalo: retira y destruye hojas muy afectadas. Trampas amarillas capturan adultos. Diglyphus isaea es su parasitoide natural.',
    curiosidad: 'Sus galerías sinuosas en las hojas son su firma inconfundible; la larva vive y se alimenta entre las dos epidermis de la hoja.',
  },
  {
    id: 'procesionaria-pino',
    nombre: 'Oruga procesionaria del pino',
    nombreCientifico: 'Thaumetopoea pityocampa',
    orden: 'Lepidoptera',
    rol: 'Perjudicial',
    tamanoMm: 'larva 35-40 mm',
    zona: ['Plantas', 'Madera'],
    actividad: 'Nocturno',
    dieta: 'Acículas de pino',
    colorPrimario: '#8B7355',
    descripcion: 'Oruga que vive en bolsones de seda en pinos y cedros. Sus pelos urticantes son urticaria intensa en humanos y pueden ser mortales para perros y gatos.',
    comoIdentificarlo: 'Bolsas de seda blanca en pinos en invierno. En primavera, filas de orugas marchando en procesión. NO tocar nunca.',
    queHacer: '⚠️ PELIGRO: nunca toques ni te acerques a las orugas en marcha. Coloca trampas con feromonas en verano para capturar mariposas. Llama a servicios de control de plagas.',
    curiosidad: 'Sus pelos urticantes pueden provocar reacciones alérgicas graves; son especialmente peligrosos para los perros que las olisquean.',
  },
  {
    id: 'escarabajo-patata',
    nombre: 'Escarabajo de la patata',
    nombreCientifico: 'Leptinotarsa decemlineata',
    orden: 'Coleoptera',
    rol: 'Perjudicial',
    tamanoMm: '10-12 mm',
    zona: ['Plantas', 'Raíces'],
    actividad: 'Diurno',
    dieta: 'Hojas de solanáceas',
    colorPrimario: '#FFFF00',
    descripcion: 'Escarabajo de rayas negras y amarillas que devasta cultivos de patata, tomate y berenjena. Tanto adultos como larvas rojas atacan las hojas.',
    comoIdentificarlo: 'Cuerpo ovalado amarillo-naranja con 10 rayas negras en los élitros. Las larvas son rojas con puntos negros laterales, en el envés de las hojas.',
    queHacer: '⚠️ Contrólalo: recoge adultos y larvas a mano, aplasta los huevos anaranjados en el envés. Bacillus thuringiensis var. tenebrionis para larvas. Rotación de cultivos.',
    curiosidad: 'Adulto y larva devoran las hojas; puede destruir un cultivo completo de patatas en pocos días sin control.',
  },
  {
    id: 'pulgon-lechuga',
    nombre: 'Pulgón de la lechuga',
    nombreCientifico: 'Nasonovia ribisnigri',
    orden: 'Hemiptera',
    rol: 'Perjudicial',
    tamanoMm: '1-3 mm',
    zona: ['Plantas'],
    actividad: 'Ambos',
    dieta: 'Savia vegetal',
    colorPrimario: '#6B8E23',
    descripcion: 'Pulgón verde oliva que se mete entre las hojas internas de la lechuga, donde es muy difícil de alcanzar con tratamientos. Muy común en lechugas de hoja.',
    comoIdentificarlo: 'Verde oliva, muy pequeño. Se encuentra dentro de la cabeza de lechuga, en las hojas más jóvenes y tiernas del centro.',
    queHacer: '⚠️ Contrólalo: sumerge la lechuga en agua con sal fina antes de consumirla. Preventivamente, usa variedades resistentes. Jabón potásico en fases tempranas.',
    curiosidad: 'Se mete entre las hojas internas donde es muy difícil de alcanzar con tratamientos; puede pasar desapercibido hasta la cosecha.',
  },
  {
    id: 'gusano-gris',
    nombre: 'Gusano gris (oruga de noctuidos)',
    nombreCientifico: 'Agrotis ipsilon',
    orden: 'Lepidoptera',
    rol: 'Perjudicial',
    tamanoMm: 'larva 40-50 mm',
    zona: ['Suelo', 'Raíces'],
    actividad: 'Nocturno',
    dieta: 'Tallo a nivel del suelo, raíces',
    colorPrimario: '#696969',
    descripcion: 'Oruga nocturna gris que corta los tallos de las plántulas a nivel del suelo durante la noche, dejándolas tumbadas. Es la pesadilla del semillero al aire libre.',
    comoIdentificarlo: 'Plántulas cortadas a ras del suelo amaneciendo; la oruga gris está enroscada en el suelo justo al lado si se escarba.',
    queHacer: '⚠️ Contrólalo: coloca collares de cartón alrededor de los tallos, riega de noche y busca las orugas con linterna, aplica nematodos (Steinernema carpocapsae) al suelo.',
    curiosidad: 'Corta los tallos de las plántulas a nivel del suelo de noche; de día se esconde enroscado bajo la tierra justo al pie de la planta.',
  },
  {
    id: 'cochylis',
    nombre: 'Cochylis (polilla del racimo)',
    nombreCientifico: 'Lobesia botrana',
    orden: 'Lepidoptera',
    rol: 'Perjudicial',
    tamanoMm: '5-7 mm',
    zona: ['Frutos', 'Flores'],
    actividad: 'Nocturno',
    dieta: 'Bayas de uva y frutos carnosos',
    colorPrimario: '#8B6914',
    descripcion: 'Principal plaga de la vid en España. Sus larvas atacan primero flores y luego bayas, favoreciendo la entrada de hongos como la Botrytis.',
    comoIdentificarlo: 'Mariposa nocturna de 5-7 mm con alas marmoleadas. Los racimos con bayas agujereadas y pegadas por seda son señal inequívoca.',
    queHacer: '⚠️ Contrólala: trampas con feromonas sexuales para monitoreo, Bacillus thuringiensis en eclosión de larvas, Trichogramma como parasitoide de huevos.',
    curiosidad: 'Principal plaga de la vid en España; puede tener hasta 3 generaciones por año, con daños distintos en cada una.',
  },
  {
    id: 'cotonet-palmito',
    nombre: 'Cotonet del palmito',
    nombreCientifico: 'Icerya purchasi',
    orden: 'Hemiptera',
    rol: 'Perjudicial',
    tamanoMm: '4-6 mm',
    zona: ['Plantas'],
    actividad: 'Ambos',
    dieta: 'Savia vegetal',
    colorPrimario: '#FFFFFF',
    descripcion: 'Cochinilla roja cubierta por grandes masas algodonosas blancas. Plaga invasora grave de cítricos y ornamentales, llegada de Australia.',
    comoIdentificarlo: 'Grandes masas blancas algodonosas en ramas y troncos de cítricos. Debilita gravemente las plantas y puede matar árboles jóvenes.',
    queHacer: '⚠️ Contrólala: la mariquita australiana Rodolia cardinalis es su depredador específico y muy eficaz. También aceite de verano + jabón potásico.',
    curiosidad: 'Plaga invasora de cítricos procedente de Australia; produce enormes masas algodonosas blancas donde oculta sus huevos.',
  },
  {
    id: 'mosca-fruta',
    nombre: 'Mosca de la fruta',
    nombreCientifico: 'Ceratitis capitata',
    orden: 'Diptera',
    rol: 'Perjudicial',
    tamanoMm: '4-5 mm',
    zona: ['Frutos', 'Vuelo'],
    actividad: 'Diurno',
    dieta: 'Frutas carnosas (larva en interior)',
    colorPrimario: '#FFD700',
    descripcion: 'La mosca de la fruta adulta es llamativa con abdomen amarillo y manchas. Sus larvas se desarrollan dentro de los frutos, que se pudren desde el interior.',
    comoIdentificarlo: 'Frutos maduros con pequeños orificios de entrada (1 mm), que se pudren rápidamente. En el interior, gusanos blancos (larvas).',
    queHacer: '⚠️ Contrólala: trampas con atrayente proteico + insecticida (método cebo), recoge fruta caída diariamente, red de malla fina sobre árboles.',
    curiosidad: 'Su picadura en el fruto introduce larvas que lo pudren desde dentro; afecta a melocotones, higos, naranjas, mandarinas y muchas más.',
  },
  {
    id: 'chinche-verde',
    nombre: 'Chinche verde',
    nombreCientifico: 'Nezara viridula',
    orden: 'Hemiptera',
    rol: 'Perjudicial',
    tamanoMm: '13-15 mm',
    zona: ['Plantas', 'Frutos'],
    actividad: 'Diurno',
    dieta: 'Frutos y semillas',
    colorPrimario: '#228B22',
    descripcion: 'Chinche grande de color verde brillante que pincha frutos y semillas para extraer su contenido, dejando zonas necróticas y deformaciones.',
    comoIdentificarlo: 'Grande, verde brillante uniforme, escudo triangular (escutelo) prominente. Desprende olor penetrante cuando se la molesta.',
    queHacer: '⚠️ Contrólala: recoge adultos y ninfas a mano (con guantes); destruye las puestas en hoja (agrupaciones de huevos verdes hexagonales). Kaolin como barrera en frutos.',
    curiosidad: 'Desprende un olor fuerte y desagradable cuando se la molesta; daña tomates, judías, legumbres y muchas frutas.',
  },
  // --- Neutros/Descomponedores ---
  {
    id: 'grillo-comun',
    nombre: 'Grillo común',
    nombreCientifico: 'Gryllus campestris',
    orden: 'Orthoptera',
    rol: 'Neutro',
    tamanoMm: '20-26 mm',
    zona: ['Suelo'],
    actividad: 'Nocturno',
    dieta: 'Plantas, invertebrados, restos',
    colorPrimario: '#1C1C1C',
    descripcion: 'Insecto negro de campo con élitros pardos. El macho produce el inconfundible canto nocturno frotando sus alas.',
    comoIdentificarlo: 'Negro, robusto, con fémures traseros grandes. El canto nocturno es rítmico y constante: "cri-cri". Vive en madrigueras en el suelo.',
    queHacer: '🔍 Déjalo: generalmente no supone amenaza real para el jardín. En cantidades muy altas puede dañar plántulas; pero suele ser inofensivo.',
    curiosidad: 'Solo los machos cantan para atraer a las hembras; pueden producir hasta 400 chirridos por minuto en noches cálidas.',
  },
  {
    id: 'saltamontes-comun',
    nombre: 'Saltamontes común',
    nombreCientifico: 'Chorthippus parallelus',
    orden: 'Orthoptera',
    rol: 'Neutro',
    tamanoMm: '15-25 mm',
    zona: ['Plantas', 'Suelo'],
    actividad: 'Diurno',
    dieta: 'Hierba y plantas',
    colorPrimario: '#8FBC8F',
    descripcion: 'Ortóptero verde o pardo muy común en prados y jardines. Se alimenta de gramíneas principalmente y rara vez supone una plaga en jardines ornamentales.',
    comoIdentificarlo: 'Verde o pardo con élitros cortos (el macho tiene alas cortas que no cubren el abdomen). Salto largo y característico. Estridulación con la pata trasera.',
    queHacer: '🔍 Déjalo: salvo en grandes plagas (langosta) no supone riesgo real. Forma parte del ecosistema del jardín y es alimento para pájaros.',
    curiosidad: 'Produce sonido frotando la pata trasera contra el ala (estridulación); es diferente al grillo que frota sus propias alas entre sí.',
  },
  {
    id: 'escarabajo-pelotero',
    nombre: 'Escarabajo pelotero',
    nombreCientifico: 'Scarabaeus sacer',
    orden: 'Coleoptera',
    rol: 'Neutro',
    tamanoMm: '25-30 mm',
    zona: ['Suelo'],
    actividad: 'Diurno',
    dieta: 'Estiércol y materia fecal',
    colorPrimario: '#1C1C1C',
    descripcion: 'El famoso escarabajo pelotero que rueda bolas de estiércol. Descomponedor esencial, recicla nutrientes e incorpora materia orgánica al suelo.',
    comoIdentificarlo: 'Negro brillante, robusto, con cabeza plana y patas delanteras adaptadas para excavar. Se le ve rodando bolas de estiércol en caminos de campo.',
    queHacer: '🔍 Déjalo: es un descomponedor valioso. Propio de zonas con animales. No es plaga y su presencia indica suelos saludables.',
    curiosidad: 'Fue considerado sagrado en el Antiguo Egipto como símbolo de la resurrección; los escarabeos (amuletos) representaban al escarabajo pelotero.',
  },
  {
    id: 'ciempies-jardin',
    nombre: 'Ciempiés de jardín',
    nombreCientifico: 'Lithobius forficatus',
    orden: 'Dermaptera',
    rol: 'Beneficioso',
    tamanoMm: '18-30 mm',
    zona: ['Suelo'],
    actividad: 'Nocturno',
    dieta: 'Insectos, arañas, pequeños invertebrados',
    colorPrimario: '#D2691E',
    descripcion: 'Miriápodo (no insecto, tiene 15 pares de patas) depredador activo del suelo que controla poblaciones de insectos perjudiciales, babosas y arañas.',
    comoIdentificarlo: 'Cuerpo segmentado marrón rojizo, muy rápido. 15 pares de patas (uno por segmento). Se encuentra bajo piedras, macetas y en el compost.',
    queHacer: '✅ Protégelo: aunque su aspecto asusta, es un valioso aliado del suelo. Mantén zonas con hojarasca y no uses pesticidas sistémicos en el suelo.',
    curiosidad: 'No es un insecto: tiene 15 pares de patas (un par por segmento); los insectos solo tienen 3 pares. Es un depredador activo del suelo.',
  },
  {
    id: 'carcoma-comun',
    nombre: 'Carcoma común',
    nombreCientifico: 'Anobium punctatum',
    orden: 'Coleoptera',
    rol: 'Perjudicial',
    tamanoMm: '2.5-5 mm',
    zona: ['Madera'],
    actividad: 'Nocturno',
    dieta: 'Madera seca (larva)',
    colorPrimario: '#8B6914',
    descripcion: 'Pequeño escarabajo cuyas larvas excavan galerías en la madera seca de muebles, marcos de ventana y estructuras de madera. Produce el característico polvo fino.',
    comoIdentificarlo: 'Pequeños orificios redondos de 1-2 mm en la madera con serrín fino alrededor. El adulto es marrón con aspecto capucha en el tórax.',
    queHacer: '⚠️ Contrólala: aplica insecticida específico para carcoma mediante inyección en las galerías. En muebles, tratamiento térmico o fumigación. Prevención: madera tratada.',
    curiosidad: 'Sus galerías en la madera producen el característico "polvo de serrín" (frass) que delata su presencia; las larvas pueden vivir años en la madera.',
  },
];

// ============================================================
// CONFIGURACIÓN DE ROLES (COLORES Y ETIQUETAS)
// ============================================================

const ROL_CONFIG: Record<RolJardin, { color: string; darkColor: string; label: string; icono: string }> = {
  Beneficioso: { color: '#166534', darkColor: '#4ade80', label: 'Beneficioso', icono: '✅' },
  Perjudicial: { color: '#991b1b', darkColor: '#f87171', label: 'Perjudicial', icono: '⚠️' },
  Polinizador: { color: '#854d0e', darkColor: '#fde047', label: 'Polinizador', icono: '🌸' },
  Neutro: { color: '#374151', darkColor: '#9ca3af', label: 'Neutro', icono: '🔍' },
};

const ROL_COLORES_BG: Record<RolJardin, string> = {
  Beneficioso: 'rgba(34,197,94,0.15)',
  Perjudicial: 'rgba(220,38,38,0.15)',
  Polinizador: 'rgba(234,179,8,0.15)',
  Neutro: 'rgba(107,114,128,0.15)',
};

const TODAS_ZONAS: ZonaJardin[] = ['Suelo', 'Plantas', 'Flores', 'Frutos', 'Madera', 'Raíces', 'Vuelo'];
const TODOS_ROLES: RolJardin[] = ['Beneficioso', 'Perjudicial', 'Polinizador', 'Neutro'];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function GuiaInsectosJardinPage() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState<RolJardin | 'Todos'>('Todos');
  const [filtroZona, setFiltroZona] = useState<ZonaJardin | 'Todas'>('Todas');

  const insectosFiltrados = useMemo(() => {
    return INSECTOS.filter((insecto) => {
      const coincideBusqueda =
        busqueda.trim() === '' ||
        insecto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        insecto.nombreCientifico.toLowerCase().includes(busqueda.toLowerCase());

      const coincideRol = filtroRol === 'Todos' || insecto.rol === filtroRol;
      const coincideZona = filtroZona === 'Todas' || insecto.zona.includes(filtroZona as ZonaJardin);

      return coincideBusqueda && coincideRol && coincideZona;
    });
  }, [busqueda, filtroRol, filtroZona]);

  const contadorPorRol = useMemo(() => {
    return TODOS_ROLES.reduce<Record<RolJardin, number>>((acc, rol) => {
      acc[rol] = INSECTOS.filter((i) => i.rol === rol).length;
      return acc;
    }, { Beneficioso: 0, Perjudicial: 0, Polinizador: 0, Neutro: 0 });
  }, []);

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        {/* Hero */}
        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">🪲</span> Guía de Insectos del Jardín</h1>
          <p className={styles.subtitle}>
            35 insectos del jardín y huerto: identifica aliados y plagas, y sabe exactamente qué hacer con cada uno
          </p>
          <div className={styles.heroStats}>
            <span className={styles.stat}><span aria-hidden="true">🟢</span> {contadorPorRol.Beneficioso} beneficiosos</span>
            <span className={styles.statDivider}>·</span>
            <span className={styles.stat}><span aria-hidden="true">🔴</span> {contadorPorRol.Perjudicial} perjudiciales</span>
            <span className={styles.statDivider}>·</span>
            <span className={styles.stat}><span aria-hidden="true">🌸</span> {contadorPorRol.Polinizador} polinizadores</span>
            <span className={styles.statDivider}>·</span>
            <span className={styles.stat}><span aria-hidden="true">⚪</span> {contadorPorRol.Neutro} neutros</span>
          </div>
        </header>

        <LegalNotice />

        {/* Controles */}
        <section className={styles.controlsSection} aria-label="Filtros y buscador">
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon} aria-hidden="true">🔍</span>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Buscar por nombre o nombre científico..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar insecto"
            />
            {busqueda && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => setBusqueda('')}
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtros por rol */}
          <div className={styles.filtrosRow} role="group" aria-label="Filtrar por rol">
            <button
              type="button"
              className={`${styles.filtroBtn} ${filtroRol === 'Todos' ? styles.filtroActivo : ''}`}
              onClick={() => setFiltroRol('Todos')}
              aria-pressed={filtroRol === 'Todos'}
            >
              Todos ({INSECTOS.length})
            </button>
            {TODOS_ROLES.map((rol) => (
              <button
                key={rol}
                type="button"
                className={`${styles.filtroBtn} ${filtroRol === rol ? styles.filtroActivo : ''} ${styles[`filtroRol${rol}`]}`}
                onClick={() => setFiltroRol(filtroRol === rol ? 'Todos' : rol)}
                aria-pressed={filtroRol === rol}
              >
                <span aria-hidden="true">{ROL_CONFIG[rol].icono}</span> {rol} ({contadorPorRol[rol]})
              </button>
            ))}
          </div>

          {/* Filtros por zona */}
          <div className={styles.filtrosRow} role="group" aria-label="Filtrar por zona del jardín">
            <button
              type="button"
              className={`${styles.filtroBtn} ${filtroZona === 'Todas' ? styles.filtroActivo : ''}`}
              onClick={() => setFiltroZona('Todas')}
              aria-pressed={filtroZona === 'Todas'}
            >
              Todas las zonas
            </button>
            {TODAS_ZONAS.map((zona) => (
              <button
                key={zona}
                type="button"
                className={`${styles.filtroBtn} ${filtroZona === zona ? styles.filtroActivo : ''}`}
                onClick={() => setFiltroZona(filtroZona === zona ? 'Todas' : zona)}
                aria-pressed={filtroZona === zona}
              >
                {zona}
              </button>
            ))}
          </div>
        </section>

        {/* Contador de resultados */}
        <div className={styles.resultadosHeader} aria-live="polite">
          <p className={styles.contadorResultados}>
            {insectosFiltrados.length === INSECTOS.length
              ? `Mostrando los ${INSECTOS.length} insectos`
              : `${insectosFiltrados.length} insecto${insectosFiltrados.length !== 1 ? 's' : ''} encontrado${insectosFiltrados.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Grid de tarjetas */}
        {insectosFiltrados.length === 0 ? (
          <p className={styles.sinResultados}>
            No se encontraron insectos con esos filtros. Prueba con otros criterios.
          </p>
        ) : (
          <div className={styles.insectosGrid}>
            {insectosFiltrados.map((insecto) => (
              <article key={insecto.id} className={styles.insectoCard}>
                {/* Cabecera de tarjeta */}
                <div className={styles.cardHeader}>
                  {/* Círculo de color primario */}
                  <div
                    className={styles.colorCircle}
                    style={{ backgroundColor: insecto.colorPrimario }}
                    aria-hidden="true"
                  />
                  <div className={styles.cardNombres}>
                    <p className={styles.nombreComun}>{insecto.nombre}</p>
                    <p className={styles.nombreCientifico}>{insecto.nombreCientifico}</p>
                  </div>
                  <span
                    className={styles.rolBadge}
                    style={{
                      backgroundColor: ROL_COLORES_BG[insecto.rol],
                      color: ROL_CONFIG[insecto.rol].color,
                    }}
                  >
                    <span aria-hidden="true">{ROL_CONFIG[insecto.rol].icono}</span> {insecto.rol}
                  </span>
                </div>

                {/* Orden taxonómico */}
                <p className={styles.ordenTag}>{insecto.orden}</p>

                {/* Descripción */}
                <p className={styles.descripcion}>{insecto.descripcion}</p>

                {/* Meta grid */}
                <div className={styles.metaGrid}>
                  <div className={styles.metaItem}>
                    <p className={styles.metaLabel}>Tamaño</p>
                    <p className={styles.metaValor}>{insecto.tamanoMm}</p>
                  </div>
                  <div className={styles.metaItem}>
                    <p className={styles.metaLabel}>Actividad</p>
                    <p className={styles.metaValor}>{insecto.actividad}</p>
                  </div>
                  <div className={styles.metaItem}>
                    <p className={styles.metaLabel}>Dieta</p>
                    <p className={styles.metaValor}>{insecto.dieta}</p>
                  </div>
                  <div className={styles.metaItem}>
                    <p className={styles.metaLabel}>Zonas</p>
                    <div className={styles.chipsRow}>
                      {insecto.zona.map((z) => (
                        <span key={z} className={styles.chip}>{z}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cómo identificarlo */}
                <div className={styles.identificacionBox}>
                  <p className={styles.identificacionLabel}><span aria-hidden="true">🔍</span> Cómo identificarlo</p>
                  <p className={styles.identificacionTexto}>{insecto.comoIdentificarlo}</p>
                </div>

                {/* Qué hacer */}
                <div
                  className={styles.queHacerBox}
                  style={{ borderLeftColor: ROL_CONFIG[insecto.rol].color }}
                >
                  <p className={styles.queHacerTexto}>{insecto.queHacer}</p>
                </div>

                {/* Curiosidad */}
                <div className={styles.curiosidadBox}>
                  <span className={styles.curiosidadLabel}><span aria-hidden="true">💡</span> Curiosidad: </span>
                  {insecto.curiosidad}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Contenido educativo v2.0 */}
        <EducationalSection
          title="Guía del jardinero: control biológico y más"
          subtitle="Todo lo que necesitas saber para gestionar insectos en tu jardín de forma ecológica"
        >
          {/* 1. Tabla comparativa */}
          <section className={styles.guideSection}>
            <h2>Tabla comparativa de 6 insectos clave</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Insecto</th>
                    <th>Rol</th>
                    <th>Orden</th>
                    <th>Tamaño</th>
                    <th>Zona</th>
                    <th>Actividad</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Mariquita de 7 puntos</strong></td>
                    <td>Beneficioso</td>
                    <td>Coleoptera</td>
                    <td>5-8 mm</td>
                    <td>Plantas, Flores</td>
                    <td>Diurno</td>
                  </tr>
                  <tr>
                    <td><strong>Abeja melífera</strong></td>
                    <td>Polinizador</td>
                    <td>Hymenoptera</td>
                    <td>12-15 mm</td>
                    <td>Flores, Vuelo</td>
                    <td>Diurno</td>
                  </tr>
                  <tr>
                    <td><strong>Pulgón verde</strong></td>
                    <td>Perjudicial</td>
                    <td>Hemiptera</td>
                    <td>1-3 mm</td>
                    <td>Plantas, Raíces</td>
                    <td>Ambos</td>
                  </tr>
                  <tr>
                    <td><strong>Mosca blanca</strong></td>
                    <td>Perjudicial</td>
                    <td>Hemiptera</td>
                    <td>1-2 mm</td>
                    <td>Plantas, Flores</td>
                    <td>Diurno</td>
                  </tr>
                  <tr>
                    <td><strong>Crisopa verde</strong></td>
                    <td>Beneficioso</td>
                    <td>Neuroptera</td>
                    <td>12-20 mm</td>
                    <td>Plantas, Flores</td>
                    <td>Nocturno</td>
                  </tr>
                  <tr>
                    <td><strong>Mantis religiosa</strong></td>
                    <td>Beneficioso</td>
                    <td>Mantodea</td>
                    <td>40-75 mm</td>
                    <td>Plantas, Flores</td>
                    <td>Diurno</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. Casos de uso */}
          <section className={styles.guideSection}>
            <h2>¿Cuál es tu situación?</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <h4><span aria-hidden="true">🥕</span> Huerto urbano</h4>
                <p>Las principales amenazas son pulgones en tomates y pimientos, mosca blanca en cucurbitáceas y escarabajo de la patata. Prioriza el jabón potásico y atrae mariquitas.</p>
                <div className={styles.escenarioExample}>Aliados clave: mariquita, crisopa, avispa parásita</div>
              </div>
              <div className={styles.escenarioCard}>
                <h4><span aria-hidden="true">🌹</span> Jardín ornamental</h4>
                <p>Los pulgones atacan rosas, los trips dañan flores y las cochinillas se instalan en plantas de hoja. Un jardín con diversidad de flora atrae depredadores naturales.</p>
                <div className={styles.escenarioExample}>Aliados clave: sírfidos, crisopa, chinche Orius</div>
              </div>
              <div className={styles.escenarioCard}>
                <h4><span aria-hidden="true">🪴</span> Terraza con macetas</h4>
                <p>En macetas la araña roja y la cochinilla algodonosa son las plagas más frecuentes. La falta de enemigos naturales hace más necesario el tratamiento manual.</p>
                <div className={styles.escenarioExample}>Control: alcohol isopropílico, aceite de neem, ducha de agua</div>
              </div>
              <div className={styles.escenarioCard}>
                <h4><span aria-hidden="true">👶</span> Jardín con niños y mascotas</h4>
                <p>Evita cualquier pesticida. Usa control manual, barreras físicas (mallas, collares) y atrae depredadores. Ojo especial con la procesionaria del pino: peligrosa para mascotas.</p>
                <div className={styles.escenarioExample}>Prioridad: identificación correcta antes de actuar</div>
              </div>
            </div>
          </section>

          {/* 3. FAQ */}
          <section className={styles.guideSection}>
            <h2>Preguntas frecuentes del jardinero</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>¿Cómo sé si tengo plaga o si es algo normal?</h4>
                <p>Una plaga implica una población tan alta que está causando daño visible: hojas comidas, deformadas, amarillentas o con galerías. Si ves uno o dos insectos, probablemente no es plaga. Busca los síntomas: melaza pegajosa (pulgones), manchas plateadas (trips), orificios en hojas (orugas). Usa esta guía para identificar primero y actuar después.</p>
                <div className={styles.faqTip}>Regla: identifica primero, actúa después.</div>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Qué hago si tengo pulgones por todas partes?</h4>
                <p>Primero, controla las hormigas que los protegen (cinta adhesiva en el tallo). Luego aplica jabón potásico al 2% (2 gramos por litro de agua) en el envés de las hojas por la tarde. Repite cada 5-7 días. Paralelamente, atrae o compra mariquitas y crisopas. Evita el exceso de nitrógeno en el abonado, que produce brotes muy tiernos que los pulgones adoran.</p>
                <div className={styles.faqTip}>Aplicación de jabón potásico: siempre por la tarde y en envés de hojas.</div>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Los insecticidas normales matan también a las mariquitas?</h4>
                <p>Sí. La mayoría de insecticidas de amplio espectro (piretrinas, malatión, imidacloprid) matan indiscriminadamente tanto a plagas como a depredadores y polinizadores. Si usas un insecticida, eliminas también a tus aliados y el problema reaparece con más fuerza porque ya no hay quién lo controle. Usa siempre los tratamientos más específicos y los métodos de control biológico primero.</p>
                <div className={styles.faqTip}>Nunca uses insecticidas sistémicos en plantas en flor: matan a las abejas.</div>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Cómo atraigo polinizadores a mi jardín?</h4>
                <p>Planta flores de distintas formas y colores para diferentes especies: lavanda, salvia, caléndula, hinojo, borraja, girasol, cebollino en flor. Pon flores desde principios de primavera hasta el otoño para ofrecer alimento continuado. Deja un rincón sin segar para flores silvestres. Instala un "hotel de insectos" con cañas y tubos para abejas solitarias. Nunca uses insecticidas sistémicos.</p>
                <div className={styles.faqTip}>Diversidad de flores = diversidad de polinizadores = jardín sano.</div>
              </div>
              <div className={styles.faqItem}>
                <h4>¿La tijereta daña mis plantas?</h4>
                <p>La tijereta es omnívora y en condiciones normales es aliada del jardín: come pulgones, orugas pequeñas y restos. Solo puede dañar plantas en condiciones de superpoblación o cuando escasea otra comida, atacando flores delicadas o brotes tiernos. En general, el balance es positivo. Si estás cultivando fresas o flores delicadas, puedes poner trampas (maceta con paja invertida) para controlar su número.</p>
                <div className={styles.faqTip}>Si hay tijeretas y pulgones, las tijeretas hacen su trabajo: déjalas.</div>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Qué es el control biológico y cómo lo aplico?</h4>
                <p>Es el uso de organismos vivos (depredadores, parásitos, patógenos) para controlar plagas, sin químicos. En la práctica: atraer y proteger depredadores naturales (mariquitas, crisopas, sírfidos), soltar insectos beneficiosos comerciales (Encarsia formosa contra mosca blanca, Phytoseiulus persimilis contra araña roja), y usar microorganismos como Bacillus thuringiensis contra orugas.</p>
                <div className={styles.faqTip}>Los insectos auxiliares se pueden comprar en tiendas de jardinería ecológica online.</div>
              </div>
            </div>
          </section>

          {/* 4. Guía paso a paso */}
          <section className={styles.guideSection}>
            <h2>Cómo diagnosticar y actuar ante una plaga</h2>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h4>Observa sin actuar todavía</h4>
                  <p>Antes de tratar nada, dedica 5 minutos a examinar la planta con calma. Mira el envés de las hojas, los brotes, el suelo alrededor. Cuantifica: ¿hay 5 insectos o 500? ¿Es un daño estético o la planta está en peligro real? La premura lleva a tratar sin necesidad y a eliminar aliados.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h4>Identifica correctamente al culpable</h4>
                  <p>Usa esta guía para identificar el insecto. Busca los síntomas en las hojas (manchas, galerías, melaza) y luego al insecto que los causa. Recuerda que puede haber un depredador junto a la plaga: no los confundas. Un error frecuente es matar a la crisopa pensando que es la plaga.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h4>Elige el método más suave primero</h4>
                  <p>Sigue la jerarquía: 1) control manual (aplasta, recoge, corta la parte afectada); 2) barreras físicas (mallas, collares, kaolin); 3) jabón potásico o aceite de neem; 4) microorganismos (Bacillus thuringiensis, Beauveria bassiana); 5) depredadores comerciales; 6) solo como último recurso, insecticidas de bajo impacto (azadiractina, piretrina natural).</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h4>Aplica el tratamiento correctamente</h4>
                  <p>El jabón potásico actúa solo por contacto directo: moja bien el envés de las hojas donde están los insectos. Aplica al atardecer para evitar quemaduras del sol. Repite cada 5-7 días al menos 3 veces. Si usas Bacillus thuringiensis, aplícalo cuando las larvas son pequeñas: es cuando mejor funciona.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <h4>Actúa en prevención para la próxima temporada</h4>
                  <p>Tras controlar la plaga, actúa preventivamente: planta flores para atraer depredadores, usa mallas antiinsectos en cultivos sensibles, rota los cultivos, evita el exceso de abonado nitrogenado (que produce brotes tiernos muy apetecibles), y revisa las plantas regularmente para actuar antes de que la plaga explote.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Mejores prácticas */}
          <section className={styles.guideSection}>
            <h2>5 mejores prácticas del jardinero ecológico</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🌼</span>
                <h4>Planta flores entre los cultivos</h4>
                <p>Las flores de hinojo, caléndula, tagetes, borraja e hinojo atraen y mantienen a los insectos depredadores. Esta práctica se llama "agricultura sinergética" y es la base del control biológico preventivo.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔄</span>
                <h4>Rota los cultivos cada año</h4>
                <p>No cultives la misma familia botánica en el mismo lugar dos años seguidos. La rotación interrumpe los ciclos de vida de plagas específicas (como el escarabajo de la patata) que hibernan en el suelo esperando el mismo cultivo.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🌿</span>
                <h4>Usa plantas repelentes</h4>
                <p>La menta, el tomillo, la lavanda, el ajo y el tagetes repelen algunos insectos plaga. Plántalas cerca de los cultivos sensibles. La albahaca junto al tomate repele trips y pulgones. El ajo repele a la mosca de la zanahoria.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🐛</span>
                <h4>Tolera pequeñas poblaciones</h4>
                <p>Un jardín sin ningún insecto "malo" es un jardín sin depredadores naturales. Las pequeñas colonias de pulgones son la "nevera" de las mariquitas. Si eliminas todo, eliminas también a los controladores naturales.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🚫</span>
                <h4>Evita insecticidas sistémicos</h4>
                <p>Los insecticidas sistémicos (como el imidacloprid o el tiametoxam) son absorbidos por la planta entera, incluido el néctar y el polen. Matan a las abejas y abejorros que visitan las flores. Están prohibidos en exterior en muchos países de la UE.</p>
              </div>
            </div>
          </section>

          {/* 6. Warning Box — errores del jardinero */}
          <section className={styles.guideSection}>
            <h2>Errores que cometen los jardineros</h2>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <h3>5 errores graves que debes evitar</h3>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>Matar a las mariquitas por error:</strong> Las larvas de mariquita son grises con manchas naranja y nada tienen que ver con el adulto rojo. Muchos jardineros las eliminan pensando que son una plaga. Aprende a reconocerlas; son tus mejores aliadas.
                </li>
                <li>
                  <strong>Fumigar durante la floración:</strong> Aplicar insecticidas (aunque sean ecológicos como piretrina o jabón potásico) cuando las flores están abiertas mata a las abejas y abejorros que las visitan. Aplica siempre al atardecer y nunca en plantas en flor salvo urgencia extrema.
                </li>
                <li>
                  <strong>No identificar bien la plaga antes de tratar:</strong> El daño en las hojas puede tener muchos causantes distintos: hongo, carencia nutricional, riego inadecuado o insecto. Tratar sin identificar correctamente supone un gasto inútil y puede dañar el ecosistema del jardín sin resolver el problema.
                </li>
                <li>
                  <strong>Acercarse a la procesionaria del pino:</strong> Las orugas de procesionaria en marcha o sus pelos sueltos en el suelo pueden causar reacciones alérgicas graves en humanos y son potencialmente mortales para perros y gatos. Nunca las toques y aleja a tus mascotas. Llama a servicios de control de plagas.
                </li>
                <li>
                  <strong>Abonar en exceso con nitrógeno:</strong> El exceso de fertilizante nitrogenado produce brotes muy tiernos y jugosos que son el alimento favorito de pulgones y trips. Un abonado equilibrado hace plantas más sanas y resistentes a las plagas. Menos es más.
                </li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('guia-insectos-jardin')} />
        <ShareCard appName="guia-insectos-jardin" />
        <Footer appName="guia-insectos-jardin" />
    </div>
  );
}
