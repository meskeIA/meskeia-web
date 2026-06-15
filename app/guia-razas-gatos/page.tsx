'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './GuiaRazasGatos.module.css';

// ── Tipos ──────────────────────────────────────────────────────────────────

type TipoPeloGato = 'Corto' | 'Medio' | 'Largo' | 'Sin pelo' | 'Rizado';
type NivelEnergia = 'Alta' | 'Media' | 'Baja';
type NivelMantenimiento = 'Alto' | 'Medio' | 'Bajo';
type Tamano = 'Pequeño' | 'Mediano' | 'Grande';
type OrigenGeografico = 'Europa' | 'Asia' | 'América' | 'Oriente Medio' | 'África' | 'Oceanía';

interface RazaGato {
  id: string;
  nombre: string;
  nombreIngles: string;
  origen: string;
  origenGeo: OrigenGeografico;
  tamano: Tamano;
  pesoMin: number;
  pesoMax: number;
  pelo: TipoPeloGato;
  temperamento: string[];
  energia: NivelEnergia;
  mantenimiento: NivelMantenimiento;
  vocal: boolean;
  aptoNinos: boolean;
  aptoConPerros: boolean;
  aptoInteriores: boolean;
  esperanzaVida: string;
  descripcion: string;
  curiosidad: string;
}

// ── Datos ──────────────────────────────────────────────────────────────────

const RAZAS: RazaGato[] = [
  {
    id: 'europeo-comun',
    nombre: 'Europeo Común',
    nombreIngles: 'European Shorthair',
    origen: 'España / Europa',
    origenGeo: 'Europa',
    tamano: 'Mediano',
    pesoMin: 3.5,
    pesoMax: 7,
    pelo: 'Corto',
    temperamento: ['Independiente', 'Adaptable', 'Cazador'],
    energia: 'Media',
    mantenimiento: 'Bajo',
    vocal: false,
    aptoNinos: true,
    aptoConPerros: false,
    aptoInteriores: true,
    esperanzaVida: '15-20 años',
    descripcion: 'El gato más común de España y Europa.',
    curiosidad: 'No es una raza creada por el hombre; es el resultado de siglos de evolución natural en el continente europeo.',
  },
  {
    id: 'maine-coon',
    nombre: 'Maine Coon',
    nombreIngles: 'Maine Coon',
    origen: 'EE.UU.',
    origenGeo: 'América',
    tamano: 'Grande',
    pesoMin: 4,
    pesoMax: 10,
    pelo: 'Largo',
    temperamento: ['Sociable', 'Juguetón', 'Inteligente'],
    energia: 'Alta',
    mantenimiento: 'Alto',
    vocal: false,
    aptoNinos: true,
    aptoConPerros: true,
    aptoInteriores: true,
    esperanzaVida: '12-15 años',
    descripcion: 'Una de las razas más grandes del mundo; puede pesar tanto como un perro pequeño.',
    curiosidad: 'Es la raza oficial del estado de Maine (EE.UU.) y es conocida como el "perro de los gatos" por su carácter social.',
  },
  {
    id: 'persa',
    nombre: 'Persa',
    nombreIngles: 'Persian',
    origen: 'Irán / Persia',
    origenGeo: 'Oriente Medio',
    tamano: 'Grande',
    pesoMin: 3.5,
    pesoMax: 7,
    pelo: 'Largo',
    temperamento: ['Tranquilo', 'Afectuoso', 'Reservado'],
    energia: 'Baja',
    mantenimiento: 'Alto',
    vocal: false,
    aptoNinos: true,
    aptoConPerros: false,
    aptoInteriores: true,
    esperanzaVida: '12-17 años',
    descripcion: 'Gato aristocrático de pelo largo y cara aplanada.',
    curiosidad: 'Su pelo requiere cepillado diario para evitar nudos; sin él, puede sufrir enredos dolorosos.',
  },
  {
    id: 'siames',
    nombre: 'Siamés',
    nombreIngles: 'Siamese',
    origen: 'Tailandia',
    origenGeo: 'Asia',
    tamano: 'Mediano',
    pesoMin: 3,
    pesoMax: 5,
    pelo: 'Corto',
    temperamento: ['Vocal', 'Inteligente', 'Sociable'],
    energia: 'Alta',
    mantenimiento: 'Bajo',
    vocal: true,
    aptoNinos: true,
    aptoConPerros: true,
    aptoInteriores: true,
    esperanzaVida: '15-20 años',
    descripcion: 'Una de las razas más antiguas; muy comunicativo con su familia.',
    curiosidad: 'Los gatos siameses son extremadamente vocales y pueden "conversar" con sus dueños durante horas.',
  },
  {
    id: 'ragdoll',
    nombre: 'Ragdoll',
    nombreIngles: 'Ragdoll',
    origen: 'EE.UU.',
    origenGeo: 'América',
    tamano: 'Grande',
    pesoMin: 5,
    pesoMax: 9,
    pelo: 'Largo',
    temperamento: ['Dócil', 'Afectuoso', 'Tranquilo'],
    energia: 'Baja',
    mantenimiento: 'Alto',
    vocal: false,
    aptoNinos: true,
    aptoConPerros: true,
    aptoInteriores: true,
    esperanzaVida: '12-17 años',
    descripcion: 'Se llama Ragdoll porque se relaja completamente al cogerlo en brazos, como una muñeca de trapo.',
    curiosidad: 'Es uno de los gatos más grandes del mundo y también uno de los más tranquilos, ideal para familias.',
  },
  {
    id: 'bengal',
    nombre: 'Bengal',
    nombreIngles: 'Bengal',
    origen: 'EE.UU.',
    origenGeo: 'América',
    tamano: 'Mediano',
    pesoMin: 3.5,
    pesoMax: 7,
    pelo: 'Corto',
    temperamento: ['Activo', 'Curioso', 'Juguetón'],
    energia: 'Alta',
    mantenimiento: 'Bajo',
    vocal: false,
    aptoNinos: false,
    aptoConPerros: false,
    aptoInteriores: false,
    esperanzaVida: '12-16 años',
    descripcion: 'Sus patrones imitan al leopardo; desciende del gato leopardo asiático.',
    curiosidad: 'El Bengal disfruta del agua y puede aprender a abrir grifos. Necesita mucha estimulación o se vuelve destructivo.',
  },
  {
    id: 'british-shorthair',
    nombre: 'British Shorthair',
    nombreIngles: 'British Shorthair',
    origen: 'Reino Unido',
    origenGeo: 'Europa',
    tamano: 'Grande',
    pesoMin: 4,
    pesoMax: 8,
    pelo: 'Corto',
    temperamento: ['Calmado', 'Independiente', 'Leal'],
    energia: 'Baja',
    mantenimiento: 'Bajo',
    vocal: false,
    aptoNinos: true,
    aptoConPerros: true,
    aptoInteriores: true,
    esperanzaVida: '14-20 años',
    descripcion: 'Gato robusto de carácter tranquilo y muy longevo.',
    curiosidad: 'El gato de Cheshire de Alicia en el País de las Maravillas está basado en el British Shorthair.',
  },
  {
    id: 'abisinio',
    nombre: 'Abisinio',
    nombreIngles: 'Abyssinian',
    origen: 'Etiopía',
    origenGeo: 'África',
    tamano: 'Mediano',
    pesoMin: 3,
    pesoMax: 5.5,
    pelo: 'Corto',
    temperamento: ['Activo', 'Curioso', 'Inteligente'],
    energia: 'Alta',
    mantenimiento: 'Bajo',
    vocal: false,
    aptoNinos: true,
    aptoConPerros: false,
    aptoInteriores: true,
    esperanzaVida: '12-15 años',
    descripcion: 'Una de las razas más antiguas; sus grabados aparecen en el Antiguo Egipto.',
    curiosidad: 'El Abisinio tiene un pelaje "ticked" único donde cada pelo tiene múltiples bandas de color.',
  },
  {
    id: 'ruso-azul',
    nombre: 'Ruso Azul',
    nombreIngles: 'Russian Blue',
    origen: 'Rusia',
    origenGeo: 'Europa',
    tamano: 'Mediano',
    pesoMin: 3,
    pesoMax: 7,
    pelo: 'Corto',
    temperamento: ['Tranquilo', 'Tímido', 'Leal'],
    energia: 'Media',
    mantenimiento: 'Bajo',
    vocal: false,
    aptoNinos: true,
    aptoConPerros: false,
    aptoInteriores: true,
    esperanzaVida: '15-20 años',
    descripcion: 'Gato elegante de pelaje plateado-azulado y ojos verdes intensos.',
    curiosidad: 'Su pelaje tiene tres capas que le dan un efecto plateado-azulado único y lo hacen hipoalergénico.',
  },
  {
    id: 'scottish-fold',
    nombre: 'Scottish Fold',
    nombreIngles: 'Scottish Fold',
    origen: 'Escocia',
    origenGeo: 'Europa',
    tamano: 'Mediano',
    pesoMin: 3,
    pesoMax: 6,
    pelo: 'Corto',
    temperamento: ['Tranquilo', 'Adaptable', 'Juguetón'],
    energia: 'Media',
    mantenimiento: 'Medio',
    vocal: false,
    aptoNinos: true,
    aptoConPerros: true,
    aptoInteriores: true,
    esperanzaVida: '12-15 años',
    descripcion: 'Sus orejas dobladas hacia adelante son resultado de una mutación genética espontánea.',
    curiosidad: 'La primera Scottish Fold fue una gata llamada Susie, encontrada en una granja escocesa en 1961.',
  },
  {
    id: 'norwegian-forest',
    nombre: 'Bosque de Noruega',
    nombreIngles: 'Norwegian Forest Cat',
    origen: 'Noruega',
    origenGeo: 'Europa',
    tamano: 'Grande',
    pesoMin: 4,
    pesoMax: 9,
    pelo: 'Largo',
    temperamento: ['Independiente', 'Cazador', 'Afectuoso'],
    energia: 'Alta',
    mantenimiento: 'Alto',
    vocal: false,
    aptoNinos: true,
    aptoConPerros: true,
    aptoInteriores: true,
    esperanzaVida: '14-16 años',
    descripcion: 'Gato nórdico de pelo doble impermeable, adaptado a climas fríos extremos.',
    curiosidad: 'Aparece en la mitología nórdica; según la leyenda, tiraba del carro de la diosa Freya.',
  },
  {
    id: 'sphynx',
    nombre: 'Sphynx',
    nombreIngles: 'Sphynx',
    origen: 'Canadá',
    origenGeo: 'América',
    tamano: 'Mediano',
    pesoMin: 3,
    pesoMax: 6,
    pelo: 'Sin pelo',
    temperamento: ['Sociable', 'Activo', 'Cariñoso'],
    energia: 'Alta',
    mantenimiento: 'Medio',
    vocal: true,
    aptoNinos: true,
    aptoConPerros: true,
    aptoInteriores: true,
    esperanzaVida: '13-15 años',
    descripcion: 'No es completamente sin pelo; tiene una fina pelusa de gamuza al tacto.',
    curiosidad: 'Al no tener pelo que absorba el sebo, necesita baños semanales para mantener la piel limpia.',
  },
  {
    id: 'birmano',
    nombre: 'Birmano',
    nombreIngles: 'Birman',
    origen: 'Birmania (Myanmar)',
    origenGeo: 'Asia',
    tamano: 'Grande',
    pesoMin: 4,
    pesoMax: 7,
    pelo: 'Largo',
    temperamento: ['Gentil', 'Sociable', 'Tranquilo'],
    energia: 'Media',
    mantenimiento: 'Alto',
    vocal: false,
    aptoNinos: true,
    aptoConPerros: true,
    aptoInteriores: true,
    esperanzaVida: '12-16 años',
    descripcion: 'Tiene los cuatro pies blancos, símbolo de pureza en la leyenda birmana.',
    curiosidad: 'Según la leyenda, sus pies blancos son el resultado de un gato que fue tocado por el alma de un sacerdote budista moribundo.',
  },
  {
    id: 'devon-rex',
    nombre: 'Devon Rex',
    nombreIngles: 'Devon Rex',
    origen: 'Reino Unido',
    origenGeo: 'Europa',
    tamano: 'Pequeño',
    pesoMin: 2.5,
    pesoMax: 4.5,
    pelo: 'Rizado',
    temperamento: ['Sociable', 'Travieso', 'Afectuoso'],
    energia: 'Alta',
    mantenimiento: 'Bajo',
    vocal: true,
    aptoNinos: true,
    aptoConPerros: true,
    aptoInteriores: true,
    esperanzaVida: '12-15 años',
    descripcion: 'Sus orejas enormes y su pelo rizado le dan el apodo de "gato alienígena".',
    curiosidad: 'El Devon Rex solo tiene capa interna de pelo (undercoat), sin pelo de guardia ni pelo medio, lo que lo hace muy suave.',
  },
  {
    id: 'cornish-rex',
    nombre: 'Cornish Rex',
    nombreIngles: 'Cornish Rex',
    origen: 'Reino Unido',
    origenGeo: 'Europa',
    tamano: 'Pequeño',
    pesoMin: 2.5,
    pesoMax: 4,
    pelo: 'Rizado',
    temperamento: ['Activo', 'Juguetón', 'Social'],
    energia: 'Alta',
    mantenimiento: 'Bajo',
    vocal: true,
    aptoNinos: true,
    aptoConPerros: true,
    aptoInteriores: true,
    esperanzaVida: '11-15 años',
    descripcion: 'Solo tiene capa de pelo interno (pelusa), sin pelo de guardia.',
    curiosidad: 'Su cuerpo en forma de arco y sus patas largas lo hacen extremadamente ágil; es como el galgo del mundo felino.',
  },
  {
    id: 'angora-turco',
    nombre: 'Angora Turco',
    nombreIngles: 'Turkish Angora',
    origen: 'Turquía',
    origenGeo: 'Oriente Medio',
    tamano: 'Mediano',
    pesoMin: 2.5,
    pesoMax: 5,
    pelo: 'Largo',
    temperamento: ['Inteligente', 'Activo', 'Jugón'],
    energia: 'Alta',
    mantenimiento: 'Alto',
    vocal: true,
    aptoNinos: true,
    aptoConPerros: false,
    aptoInteriores: true,
    esperanzaVida: '12-18 años',
    descripcion: 'Es una raza natural, no creada por el hombre; lleva siglos en Turquía.',
    curiosidad: 'Los Angoras blancos con ojos de distintos colores (heterocromía) son considerados sagrados en Turquía.',
  },
  {
    id: 'turco-van',
    nombre: 'Turco Van',
    nombreIngles: 'Turkish Van',
    origen: 'Turquía',
    origenGeo: 'Oriente Medio',
    tamano: 'Grande',
    pesoMin: 4,
    pesoMax: 8,
    pelo: 'Largo',
    temperamento: ['Activo', 'Independiente', 'Atlético'],
    energia: 'Alta',
    mantenimiento: 'Medio',
    vocal: false,
    aptoNinos: false,
    aptoConPerros: false,
    aptoInteriores: false,
    esperanzaVida: '12-17 años',
    descripcion: 'Le encanta el agua y nadar, a diferencia de la mayoría de gatos.',
    curiosidad: 'Es conocido como "el gato nadador" y su pelaje semilargo es resistente al agua, similar al de un pato.',
  },
  {
    id: 'somali',
    nombre: 'Somalí',
    nombreIngles: 'Somali',
    origen: 'Etiopía / Canadá',
    origenGeo: 'África',
    tamano: 'Mediano',
    pesoMin: 3,
    pesoMax: 5.5,
    pelo: 'Largo',
    temperamento: ['Activo', 'Curioso', 'Sociable'],
    energia: 'Alta',
    mantenimiento: 'Alto',
    vocal: false,
    aptoNinos: true,
    aptoConPerros: false,
    aptoInteriores: true,
    esperanzaVida: '12-14 años',
    descripcion: 'Es un Abisinio de pelo largo; surgió por una mutación recesiva.',
    curiosidad: 'Su cola esponjosa y su pelo atigrado le dan el aspecto de un zorro pequeño muy elegante.',
  },
  {
    id: 'burmes',
    nombre: 'Burmés',
    nombreIngles: 'Burmese',
    origen: 'Birmania (Myanmar)',
    origenGeo: 'Asia',
    tamano: 'Mediano',
    pesoMin: 3,
    pesoMax: 6,
    pelo: 'Corto',
    temperamento: ['Afectuoso', 'Vocal', 'Activo'],
    energia: 'Alta',
    mantenimiento: 'Bajo',
    vocal: true,
    aptoNinos: true,
    aptoConPerros: true,
    aptoInteriores: true,
    esperanzaVida: '16-18 años',
    descripcion: 'Extremadamente orientado a las personas; sigue a su dueño como un perro.',
    curiosidad: 'Todos los Burmeses modernos descienden de una sola hembra llamada Wong Mau, traída a EE.UU. en 1930.',
  },
  {
    id: 'chartreux',
    nombre: 'Chartreux',
    nombreIngles: 'Chartreux',
    origen: 'Francia',
    origenGeo: 'Europa',
    tamano: 'Mediano',
    pesoMin: 3.5,
    pesoMax: 7.5,
    pelo: 'Corto',
    temperamento: ['Tranquilo', 'Leal', 'Adaptable'],
    energia: 'Media',
    mantenimiento: 'Bajo',
    vocal: false,
    aptoNinos: true,
    aptoConPerros: true,
    aptoInteriores: true,
    esperanzaVida: '12-15 años',
    descripcion: 'Raza francesa; los monjes cartujos los criaban para controlar roedores.',
    curiosidad: 'El Chartreux es casi mudo: rara vez maúlla, aunque puede hacer pequeños trinos y chirridos.',
  },
  {
    id: 'exotic-shorthair',
    nombre: 'Exotic Shorthair',
    nombreIngles: 'Exotic Shorthair',
    origen: 'EE.UU.',
    origenGeo: 'América',
    tamano: 'Mediano',
    pesoMin: 3,
    pesoMax: 6,
    pelo: 'Corto',
    temperamento: ['Tranquilo', 'Afectuoso', 'Juguetón'],
    energia: 'Baja',
    mantenimiento: 'Bajo',
    vocal: false,
    aptoNinos: true,
    aptoConPerros: true,
    aptoInteriores: true,
    esperanzaVida: '12-15 años',
    descripcion: 'Se le llama "el Persa perezoso" porque tiene el mismo carácter sin el pelo largo.',
    curiosidad: 'Comparte el mismo temperamento tranquilo que el Persa, pero su pelo corto requiere mucho menos mantenimiento.',
  },
  {
    id: 'himalayo',
    nombre: 'Himalayo',
    nombreIngles: 'Himalayan',
    origen: 'Asia / EE.UU.',
    origenGeo: 'Asia',
    tamano: 'Grande',
    pesoMin: 3.5,
    pesoMax: 7,
    pelo: 'Largo',
    temperamento: ['Tranquilo', 'Dulce', 'Dependiente'],
    energia: 'Baja',
    mantenimiento: 'Alto',
    vocal: false,
    aptoNinos: true,
    aptoConPerros: false,
    aptoInteriores: true,
    esperanzaVida: '12-15 años',
    descripcion: 'Cruce entre Persa y Siamés; tiene el punto de color del Siamés y el pelo del Persa.',
    curiosidad: 'Sus manchas de color (puntos) solo aparecen en las zonas más frías del cuerpo, como orejas, cara, patas y cola.',
  },
  {
    id: 'ocicat',
    nombre: 'Ocicat',
    nombreIngles: 'Ocicat',
    origen: 'EE.UU.',
    origenGeo: 'América',
    tamano: 'Mediano',
    pesoMin: 3.5,
    pesoMax: 7,
    pelo: 'Corto',
    temperamento: ['Activo', 'Sociable', 'Curioso'],
    energia: 'Alta',
    mantenimiento: 'Bajo',
    vocal: false,
    aptoNinos: true,
    aptoConPerros: true,
    aptoInteriores: true,
    esperanzaVida: '12-14 años',
    descripcion: 'Parece salvaje pero es 100% doméstico; ningún gato salvaje en su genealogía.',
    curiosidad: 'Surgió por accidente en 1964, cuando una criadora intentaba crear un Siamés con marcas abisinias.',
  },
  {
    id: 'munchkin',
    nombre: 'Munchkin',
    nombreIngles: 'Munchkin',
    origen: 'EE.UU.',
    origenGeo: 'América',
    tamano: 'Pequeño',
    pesoMin: 2.5,
    pesoMax: 4,
    pelo: 'Corto',
    temperamento: ['Activo', 'Sociable', 'Juguetón'],
    energia: 'Alta',
    mantenimiento: 'Bajo',
    vocal: false,
    aptoNinos: true,
    aptoConPerros: true,
    aptoInteriores: true,
    esperanzaVida: '12-15 años',
    descripcion: 'Sus patas cortas son por una mutación genética; corre igual de rápido que otros gatos.',
    curiosidad: 'A pesar de sus patas cortas, los Munchkin son sorprendentemente ágiles y pueden saltar, aunque no tan alto como otras razas.',
  },
  {
    id: 'selkirk-rex',
    nombre: 'Selkirk Rex',
    nombreIngles: 'Selkirk Rex',
    origen: 'EE.UU.',
    origenGeo: 'América',
    tamano: 'Grande',
    pesoMin: 4,
    pesoMax: 7,
    pelo: 'Rizado',
    temperamento: ['Paciente', 'Tolerante', 'Afectuoso'],
    energia: 'Media',
    mantenimiento: 'Medio',
    vocal: false,
    aptoNinos: true,
    aptoConPerros: true,
    aptoInteriores: true,
    esperanzaVida: '12-15 años',
    descripcion: 'A diferencia del Cornish y Devon Rex, su rizado proviene de una mutación dominante.',
    curiosidad: 'Es el único Rex cuya mutación es dominante: basta con un gen para que el cachorro tenga pelo rizado.',
  },
  {
    id: 'tonkines',
    nombre: 'Tonkinés',
    nombreIngles: 'Tonkinese',
    origen: 'Canadá',
    origenGeo: 'América',
    tamano: 'Mediano',
    pesoMin: 3.5,
    pesoMax: 5.5,
    pelo: 'Corto',
    temperamento: ['Vocal', 'Activo', 'Sociable'],
    energia: 'Alta',
    mantenimiento: 'Bajo',
    vocal: true,
    aptoNinos: true,
    aptoConPerros: true,
    aptoInteriores: true,
    esperanzaVida: '14-16 años',
    descripcion: 'Cruce entre Siamés y Burmés; hereda lo mejor de ambas razas.',
    curiosidad: 'Tiene tres patrones de color posibles: punta (como el Siamés), sólido (como el Burmés) o visón (mezcla).',
  },
  {
    id: 'egyptian-mau',
    nombre: 'Egyptian Mau',
    nombreIngles: 'Egyptian Mau',
    origen: 'Egipto',
    origenGeo: 'África',
    tamano: 'Mediano',
    pesoMin: 3,
    pesoMax: 5,
    pelo: 'Corto',
    temperamento: ['Activo', 'Leal', 'Reservado'],
    energia: 'Alta',
    mantenimiento: 'Bajo',
    vocal: false,
    aptoNinos: false,
    aptoConPerros: false,
    aptoInteriores: true,
    esperanzaVida: '13-16 años',
    descripcion: 'Es la raza doméstica más rápida; puede alcanzar los 48 km/h.',
    curiosidad: 'Es el único gato doméstico con manchas que aparecen de forma natural, no por cruce selectivo.',
  },
  {
    id: 'laperm',
    nombre: 'LaPerm',
    nombreIngles: 'LaPerm',
    origen: 'EE.UU.',
    origenGeo: 'América',
    tamano: 'Mediano',
    pesoMin: 3,
    pesoMax: 5,
    pelo: 'Rizado',
    temperamento: ['Activo', 'Afectuoso', 'Curioso'],
    energia: 'Alta',
    mantenimiento: 'Medio',
    vocal: false,
    aptoNinos: true,
    aptoConPerros: true,
    aptoInteriores: true,
    esperanzaVida: '12-15 años',
    descripcion: 'Nació calvo y desarrolló su pelo rizado como resultado de una mutación espontánea.',
    curiosidad: 'La primera LaPerm nació en un granero de Oregón en 1982 y su aspecto rizado surgió completamente por sorpresa.',
  },
  {
    id: 'savannah',
    nombre: 'Savannah',
    nombreIngles: 'Savannah',
    origen: 'EE.UU.',
    origenGeo: 'América',
    tamano: 'Grande',
    pesoMin: 5,
    pesoMax: 11,
    pelo: 'Corto',
    temperamento: ['Activo', 'Leal', 'Curioso'],
    energia: 'Alta',
    mantenimiento: 'Bajo',
    vocal: false,
    aptoNinos: false,
    aptoConPerros: false,
    aptoInteriores: false,
    esperanzaVida: '12-20 años',
    descripcion: 'Cruce con serval africano; es el gato doméstico más grande del mundo.',
    curiosidad: 'Los Savannah de primera generación (F1) pueden requerir permisos especiales en algunos países europeos.',
  },
  {
    id: 'bombay',
    nombre: 'Bombay',
    nombreIngles: 'Bombay',
    origen: 'EE.UU.',
    origenGeo: 'América',
    tamano: 'Mediano',
    pesoMin: 3.5,
    pesoMax: 6,
    pelo: 'Corto',
    temperamento: ['Sociable', 'Afectuoso', 'Vocal'],
    energia: 'Alta',
    mantenimiento: 'Bajo',
    vocal: true,
    aptoNinos: true,
    aptoConPerros: true,
    aptoInteriores: true,
    esperanzaVida: '15-20 años',
    descripcion: 'Fue criado para parecerse a un pequeño pantera negra.',
    curiosidad: 'A pesar de su apariencia intimidante, el Bombay es uno de los gatos más amigables y orientados a las personas.',
  },
  {
    id: 'highlander',
    nombre: 'Highlander',
    nombreIngles: 'Highlander',
    origen: 'EE.UU.',
    origenGeo: 'América',
    tamano: 'Grande',
    pesoMin: 4,
    pesoMax: 9,
    pelo: 'Corto',
    temperamento: ['Activo', 'Sociable', 'Juguetón'],
    energia: 'Alta',
    mantenimiento: 'Medio',
    vocal: false,
    aptoNinos: true,
    aptoConPerros: true,
    aptoInteriores: true,
    esperanzaVida: '12-15 años',
    descripcion: 'Tiene orejas rizadas hacia atrás (al revés que el Scottish Fold) y cola corta natural.',
    curiosidad: 'Sus orejas se rizan al revés que las del Scottish Fold y su cola corta es completamente natural, sin selección artificial.',
  },
  {
    id: 'chausie',
    nombre: 'Chausie',
    nombreIngles: 'Chausie',
    origen: 'Egipto / EE.UU.',
    origenGeo: 'África',
    tamano: 'Grande',
    pesoMin: 6,
    pesoMax: 9,
    pelo: 'Corto',
    temperamento: ['Activo', 'Leal', 'Atlético'],
    energia: 'Alta',
    mantenimiento: 'Bajo',
    vocal: false,
    aptoNinos: false,
    aptoConPerros: false,
    aptoInteriores: false,
    esperanzaVida: '12-14 años',
    descripcion: 'Desciende del gato de la jungla (Felis chaus); necesita mucho espacio.',
    curiosidad: 'Es una de las razas más atléticas y necesita compañía constante; sufre mucho si se queda solo.',
  },
  {
    id: 'havana',
    nombre: 'Havana',
    nombreIngles: 'Havana Brown',
    origen: 'Reino Unido',
    origenGeo: 'Europa',
    tamano: 'Mediano',
    pesoMin: 3,
    pesoMax: 5,
    pelo: 'Corto',
    temperamento: ['Activo', 'Curioso', 'Afectuoso'],
    energia: 'Alta',
    mantenimiento: 'Bajo',
    vocal: true,
    aptoNinos: true,
    aptoConPerros: true,
    aptoInteriores: true,
    esperanzaVida: '12-15 años',
    descripcion: 'El único gato completamente marrón reconocido; su color recuerda al tabaco habano.',
    curiosidad: 'El Havana fue criado en el Reino Unido en los años 50 cruzando Siamés con gatos negros domésticos.',
  },
  {
    id: 'oriental',
    nombre: 'Oriental',
    nombreIngles: 'Oriental Shorthair',
    origen: 'Tailandia / Reino Unido',
    origenGeo: 'Asia',
    tamano: 'Mediano',
    pesoMin: 3,
    pesoMax: 5,
    pelo: 'Corto',
    temperamento: ['Vocal', 'Activo', 'Inteligente'],
    energia: 'Alta',
    mantenimiento: 'Bajo',
    vocal: true,
    aptoNinos: true,
    aptoConPerros: true,
    aptoInteriores: true,
    esperanzaVida: '12-15 años',
    descripcion: 'Pariente del Siamés pero sin el patrón de puntos; existe en más de 300 colores.',
    curiosidad: 'El Oriental es tan comunicativo como el Siamés pero viene en una paleta de colores y patrones casi infinita.',
  },
  {
    id: 'pixiebob',
    nombre: 'Pixiebob',
    nombreIngles: 'Pixiebob',
    origen: 'EE.UU.',
    origenGeo: 'América',
    tamano: 'Grande',
    pesoMin: 4,
    pesoMax: 8,
    pelo: 'Corto',
    temperamento: ['Tranquilo', 'Leal', 'Perro-gato'],
    energia: 'Media',
    mantenimiento: 'Bajo',
    vocal: false,
    aptoNinos: true,
    aptoConPerros: true,
    aptoInteriores: true,
    esperanzaVida: '12-15 años',
    descripcion: 'Se le llama "el perro de los gatos" porque aprende a pasear con correa.',
    curiosidad: 'Algunos Pixiebob nacen con polidactilia (patas con dedos extra), lo que se considera un rasgo positivo en la raza.',
  },
];

// ── Colores por origen geográfico ──────────────────────────────────────────

const COLORES_ORIGEN: Record<OrigenGeografico, string> = {
  Europa: '#2196F3',
  Asia: '#FF9800',
  América: '#4CAF50',
  'Oriente Medio': '#9C27B0',
  África: '#FF5722',
  Oceanía: '#00BCD4',
};

// ── Opciones de filtro ─────────────────────────────────────────────────────

const OPCIONES_PELO: TipoPeloGato[] = ['Corto', 'Largo', 'Medio', 'Rizado', 'Sin pelo'];
const OPCIONES_ENERGIA: NivelEnergia[] = ['Alta', 'Media', 'Baja'];
const OPCIONES_TAMANO: Tamano[] = ['Pequeño', 'Mediano', 'Grande'];

// ── Estado de filtros ──────────────────────────────────────────────────────

interface FiltrosEstado {
  busqueda: string;
  pelo: TipoPeloGato[];
  energia: NivelEnergia[];
  tamano: Tamano[];
  soloBuenosNinos: boolean;
  soloBuenosPerros: boolean;
  soloVocales: boolean;
}

const FILTROS_INICIALES: FiltrosEstado = {
  busqueda: '',
  pelo: [],
  energia: [],
  tamano: [],
  soloBuenosNinos: false,
  soloBuenosPerros: false,
  soloVocales: false,
};

// ── Componente de tarjeta de raza ─────────────────────────────────────────

function TarjetaRaza({ raza }: { raza: RazaGato }) {
  const colorOrigen = COLORES_ORIGEN[raza.origenGeo];

  const claseMant =
    raza.mantenimiento === 'Bajo'
      ? styles.mantBajo
      : raza.mantenimiento === 'Medio'
        ? styles.mantMedio
        : styles.mantAlto;

  return (
    <article className={styles.card} aria-label={`Ficha de raza: ${raza.nombre}`}>
      <div className={styles.cardHeader} style={{ backgroundColor: colorOrigen }}>
        <div>
          <h2 className={styles.cardNombre}>{raza.nombre}</h2>
          <p className={styles.cardNombreIngles}>{raza.nombreIngles}</p>
        </div>
        <span className={styles.cardOrigen}>{raza.origenGeo}</span>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.badgesRow}>
          <span className={styles.badge}>{raza.tamano}</span>
          <span className={styles.badge}>{raza.pelo}</span>
          <span className={styles.badge}>{raza.energia} energía</span>
        </div>

        <div className={styles.infoRow}>
          <div className={styles.infoItem}>
            <span className={styles.infoEtiqueta}>Peso</span>
            <span className={styles.infoValor}>{raza.pesoMin}-{raza.pesoMax} kg</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoEtiqueta}>Vida</span>
            <span className={styles.infoValor}>{raza.esperanzaVida}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoEtiqueta}>Origen</span>
            <span className={styles.infoValor}>{raza.origen}</span>
          </div>
        </div>

        <div className={styles.temperamentoRow}>
          {raza.temperamento.map((t) => (
            <span key={t} className={styles.tempChip}>{t}</span>
          ))}
        </div>

        <div className={styles.compatRow}>
          <div className={styles.compatItem}>
            <span className={raza.aptoNinos ? styles.iconSi : styles.iconNo} aria-hidden="true">
              {raza.aptoNinos ? '✓' : '✗'}
            </span>
            <span>Niños</span>
          </div>
          <div className={styles.compatItem}>
            <span className={raza.aptoConPerros ? styles.iconSi : styles.iconNo} aria-hidden="true">
              {raza.aptoConPerros ? '✓' : '✗'}
            </span>
            <span>Perros</span>
          </div>
          <div className={styles.compatItem}>
            <span className={raza.vocal ? styles.iconSi : styles.iconNo} aria-hidden="true">
              {raza.vocal ? '✓' : '✗'}
            </span>
            <span>Vocal</span>
          </div>
          <div className={styles.compatItem}>
            <span className={raza.aptoInteriores ? styles.iconSi : styles.iconNo} aria-hidden="true">
              {raza.aptoInteriores ? '✓' : '✗'}
            </span>
            <span>Interior</span>
          </div>
        </div>

        <div className={styles.mantenimientoRow}>
          <span className={styles.mantLabel}>Mantenimiento:</span>
          <span className={`${styles.mantBadge} ${claseMant}`}>{raza.mantenimiento}</span>
        </div>

        <p className={styles.curiosidad}>
          <span aria-hidden="true">💡</span> {raza.curiosidad}
        </p>
      </div>
    </article>
  );
}

// ── Componente principal ───────────────────────────────────────────────────

export default function GuiaRazasGatosPage() {
  const [filtros, setFiltros] = useState<FiltrosEstado>(FILTROS_INICIALES);

  // Toggle para chips multi-selección
  function toggleFiltroArray<T>(campo: 'pelo' | 'energia' | 'tamano', valor: T) {
    setFiltros((prev) => {
      const actual = prev[campo] as T[];
      const nuevo = actual.includes(valor)
        ? actual.filter((v) => v !== valor)
        : [...actual, valor];
      return { ...prev, [campo]: nuevo };
    });
  }

  function resetFiltros() {
    setFiltros(FILTROS_INICIALES);
  }

  const hayFiltrosActivos =
    filtros.busqueda !== '' ||
    filtros.pelo.length > 0 ||
    filtros.energia.length > 0 ||
    filtros.tamano.length > 0 ||
    filtros.soloBuenosNinos ||
    filtros.soloBuenosPerros ||
    filtros.soloVocales;

  const razasFiltradas = useMemo(() => {
    return RAZAS.filter((r) => {
      if (
        filtros.busqueda &&
        !r.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) &&
        !r.nombreIngles.toLowerCase().includes(filtros.busqueda.toLowerCase())
      ) {
        return false;
      }
      if (filtros.pelo.length > 0 && !filtros.pelo.includes(r.pelo)) return false;
      if (filtros.energia.length > 0 && !filtros.energia.includes(r.energia)) return false;
      if (filtros.tamano.length > 0 && !filtros.tamano.includes(r.tamano)) return false;
      if (filtros.soloBuenosNinos && !r.aptoNinos) return false;
      if (filtros.soloBuenosPerros && !r.aptoConPerros) return false;
      if (filtros.soloVocales && !r.vocal) return false;
      return true;
    });
  }, [filtros]);

  return (
    <div className={styles.container}>

      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Directorio de Razas de Gatos</h1>
        <p className={styles.heroSubtitle}>
          Explora 35 razas con filtros interactivos. Encuentra el gato perfecto para tu hogar,
          familia y estilo de vida.
        </p>
      </header>

      <LegalNotice />

      {/* Filtros */}
      <section className={styles.filtrosSection} aria-label="Filtros de búsqueda">
        <div className={styles.filtrosGrid}>
          {/* Buscador */}
          <div className={styles.filtroGrupo}>
            <span className={styles.filtroLabel}>Buscar</span>
            <div className={styles.buscadorWrap}>
              <span className={styles.buscadorIcono} aria-hidden="true">🔍</span>
              <input
                type="search"
                className={styles.buscador}
                placeholder="Nombre de raza..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros((p) => ({ ...p, busqueda: e.target.value }))}
                aria-label="Buscar raza por nombre"
              />
            </div>
          </div>

          {/* Tipo de pelo */}
          <div className={styles.filtroGrupo}>
            <span className={styles.filtroLabel}>Tipo de pelo</span>
            <div className={styles.filtroChips}>
              {OPCIONES_PELO.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`${styles.chip} ${filtros.pelo.includes(p) ? styles.chipActivo : ''}`}
                  onClick={() => toggleFiltroArray<TipoPeloGato>('pelo', p)}
                  aria-pressed={filtros.pelo.includes(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Energía */}
          <div className={styles.filtroGrupo}>
            <span className={styles.filtroLabel}>Nivel de energía</span>
            <div className={styles.filtroChips}>
              {OPCIONES_ENERGIA.map((e) => (
                <button
                  key={e}
                  type="button"
                  className={`${styles.chip} ${filtros.energia.includes(e) ? styles.chipActivo : ''}`}
                  onClick={() => toggleFiltroArray<NivelEnergia>('energia', e)}
                  aria-pressed={filtros.energia.includes(e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Tamaño */}
          <div className={styles.filtroGrupo}>
            <span className={styles.filtroLabel}>Tamaño</span>
            <div className={styles.filtroChips}>
              {OPCIONES_TAMANO.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`${styles.chip} ${filtros.tamano.includes(t) ? styles.chipActivo : ''}`}
                  onClick={() => toggleFiltroArray<Tamano>('tamano', t)}
                  aria-pressed={filtros.tamano.includes(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles de compatibilidad */}
          <div className={styles.filtroGrupo}>
            <span className={styles.filtroLabel}>Compatibilidad</span>
            <div className={styles.filtroChips}>
              <button
                type="button"
                className={`${styles.toggleChip} ${filtros.soloBuenosNinos ? styles.toggleActivo : ''}`}
                onClick={() => setFiltros((p) => ({ ...p, soloBuenosNinos: !p.soloBuenosNinos }))}
                aria-pressed={filtros.soloBuenosNinos}
              >
                <span aria-hidden="true">👦</span> Niños
              </button>
              <button
                type="button"
                className={`${styles.toggleChip} ${filtros.soloBuenosPerros ? styles.toggleActivo : ''}`}
                onClick={() => setFiltros((p) => ({ ...p, soloBuenosPerros: !p.soloBuenosPerros }))}
                aria-pressed={filtros.soloBuenosPerros}
              >
                <span aria-hidden="true">🐕</span> Perros
              </button>
              <button
                type="button"
                className={`${styles.toggleChip} ${filtros.soloVocales ? styles.toggleActivo : ''}`}
                onClick={() => setFiltros((p) => ({ ...p, soloVocales: !p.soloVocales }))}
                aria-pressed={filtros.soloVocales}
              >
                <span aria-hidden="true">🔊</span> Vocales
              </button>
            </div>
          </div>
        </div>

        {hayFiltrosActivos && (
          <button type="button" className={styles.btnReset} onClick={resetFiltros}>
            Limpiar filtros
          </button>
        )}
      </section>

      {/* Contador */}
      <p className={styles.contadorResultados}>
        <span className={styles.contadorNumero}>{razasFiltradas.length}</span> de{' '}
        {RAZAS.length} razas
        {hayFiltrosActivos ? ' coinciden con los filtros' : ' en el directorio'}
      </p>

      {/* Grid de razas */}
      <section
        className={styles.razasGrid}
        aria-label="Directorio de razas de gatos"
        aria-live="polite"
        aria-atomic="false"
      >
        {razasFiltradas.length === 0 ? (
          <div className={styles.sinResultados}>
            <p className={styles.sinResultadosTitulo}>
              No se encontraron razas con los filtros seleccionados
            </p>
            <p>Prueba a reducir los filtros o borra la búsqueda.</p>
          </div>
        ) : (
          razasFiltradas.map((raza) => <TarjetaRaza key={raza.id} raza={raza} />)
        )}
      </section>

      {/* Sección educativa v2.0 */}
      <EducationalSection
        title="Guía Completa para Elegir tu Raza de Gato"
        subtitle="Todo lo que necesitas saber antes de adoptar o comprar un gato"
        icon="🐱"
      >
        <div className={styles.guideSection}>

          {/* 1. Tabla comparativa */}
          <h2>Comparativa de Razas Representativas</h2>
          <div className={styles.tablaWrap}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th>Raza</th>
                  <th>Tamaño</th>
                  <th>Pelo</th>
                  <th>Energía</th>
                  <th>Mantenimiento</th>
                  <th>Vocal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Maine Coon</td>
                  <td>Grande</td>
                  <td>Largo</td>
                  <td>Alta</td>
                  <td>Alto</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td>Persa</td>
                  <td>Grande</td>
                  <td>Largo</td>
                  <td>Baja</td>
                  <td>Alto</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td>Siamés</td>
                  <td>Mediano</td>
                  <td>Corto</td>
                  <td>Alta</td>
                  <td>Bajo</td>
                  <td>Sí</td>
                </tr>
                <tr>
                  <td>British Shorthair</td>
                  <td>Grande</td>
                  <td>Corto</td>
                  <td>Baja</td>
                  <td>Bajo</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td>Ragdoll</td>
                  <td>Grande</td>
                  <td>Largo</td>
                  <td>Baja</td>
                  <td>Alto</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td>Sphynx</td>
                  <td>Mediano</td>
                  <td>Sin pelo</td>
                  <td>Alta</td>
                  <td>Medio</td>
                  <td>Sí</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. Perfiles de uso */}
          <h2>¿Qué raza se adapta a tu situación?</h2>
          <div className={styles.perfilesList}>
            <div className={styles.perfilCard}>
              <h3>Familia con niños pequeños</h3>
              <p>
                Elige razas <strong>dóciles y pacientes</strong> como el{' '}
                <strong>Ragdoll, Maine Coon o British Shorthair</strong>. Evita razas
                muy independientes o de alta energía que puedan frustrarse.
              </p>
            </div>
            <div className={styles.perfilCard}>
              <h3>Piso pequeño</h3>
              <p>
                Razas de <strong>baja o media energía</strong> son ideales:{' '}
                <strong>Persa, Exotic Shorthair, British Shorthair</strong>. Evita
                el Bengal, Savannah o Chausie, que necesitan mucho espacio.
              </p>
            </div>
            <div className={styles.perfilCard}>
              <h3>Persona que trabaja fuera</h3>
              <p>
                Razas más <strong>independientes</strong> como el <strong>Ruso Azul,
                Europeo Común o Chartreux</strong>. Evita el Burmés o el Tonkinés, que
                sufren mucho la soledad.
              </p>
            </div>
            <div className={styles.perfilCard}>
              <h3>Hogar con perros</h3>
              <p>
                Elige razas naturalmente sociables con otras especies:{' '}
                <strong>Maine Coon, Ragdoll, Bombay o Selkirk Rex</strong>. Las razas
                muy territoriales o de alta energía predatoria suelen llevarse peor.
              </p>
            </div>
          </div>

          {/* 3. FAQ */}
          <h2>Preguntas Frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Cuál es la mejor raza para vivir en un piso?</p>
              <p className={styles.faqRespuesta}>
                Las razas de baja energía como el Persa, British Shorthair o Ragdoll son las
                más adecuadas para pisos. También el Exotic Shorthair o el Ruso Azul, que son
                tranquilos y se adaptan bien a espacios reducidos.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Existen razas hipoalergénicas?</p>
              <p className={styles.faqRespuesta}>
                No existe ninguna raza 100% hipoalergénica, ya que la alergia se produce ante
                la proteína Fel d 1, no el pelo. Sin embargo, razas como el Ruso Azul, Sphynx,
                Devon Rex o Cornish Rex producen menos alérgenos y suelen tolerarse mejor.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Qué razas son más cariñosas?</p>
              <p className={styles.faqRespuesta}>
                El Ragdoll, Burmés y Birmano son conocidos por ser extremadamente afectuosos y
                buscar el contacto humano constantemente. El Maine Coon y el Tonkinés también
                destacan por su vínculo estrecho con sus dueños.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Qué raza vive más años?</p>
              <p className={styles.faqRespuesta}>
                El Europeo Común, Siamés y Burmés tienen esperanzas de vida de 15-20 años con
                buena alimentación y cuidados veterinarios. El Ruso Azul también es muy longevo.
                Las razas con cara aplanada (braquicéfalas) como el Persa suelen vivir menos.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Cuánto cuesta mantener un gato?</p>
              <p className={styles.faqRespuesta}>
                Un gato de bajo mantenimiento cuesta entre 50-80 €/mes (comida, arena, veterinario).
                Las razas de pelo largo (Persa, Ragdoll, Maine Coon) necesitan sesiones de
                peluquería que pueden añadir 30-50 €/mes. Hay que reservar también para
                imprevistos veterinarios.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Es mejor adoptar o comprar un gato?</p>
              <p className={styles.faqRespuesta}>
                La adopción siempre es la primera opción recomendada: salvas una vida y reduces
                la demanda de cría intensiva. Si buscas una raza específica por motivos de salud
                (alergias, convivencia con perros), busca criadores certificados y responsables.
              </p>
            </div>
          </div>

          {/* 4. Pasos para elegir */}
          <h2>Cómo Elegir tu Raza Ideal: 5 Pasos</h2>
          <div className={styles.pasosList}>
            <div className={styles.pasoItem}>
              <div className={styles.pasoNumero}>1</div>
              <div className={styles.pasoTexto}>
                <strong>Evalúa tu espacio y estilo de vida</strong>
                <p>
                  ¿Tienes un piso o una casa con jardín? ¿Trabajas fuera muchas horas?
                  ¿Tienes otros animales o niños pequeños? Las respuestas determinan qué grupo
                  de razas es compatible.
                </p>
              </div>
            </div>
            <div className={styles.pasoItem}>
              <div className={styles.pasoNumero}>2</div>
              <div className={styles.pasoTexto}>
                <strong>Define tu tolerancia al mantenimiento</strong>
                <p>
                  Un gato de pelo largo necesita cepillado diario. Un gato sin pelo necesita
                  baños semanales. Sé honesto sobre el tiempo que puedes dedicar cada día.
                </p>
              </div>
            </div>
            <div className={styles.pasoItem}>
              <div className={styles.pasoNumero}>3</div>
              <div className={styles.pasoTexto}>
                <strong>Considera el nivel de energía</strong>
                <p>
                  Un Bengal o Savannah sin estímulos suficientes puede volverse destructivo.
                  Un Persa o Ragdoll en un ambiente muy activo puede estresarse. El match
                  de energía es crucial para el bienestar del animal.
                </p>
              </div>
            </div>
            <div className={styles.pasoItem}>
              <div className={styles.pasoNumero}>4</div>
              <div className={styles.pasoTexto}>
                <strong>Infórmate sobre predisposiciones de salud</strong>
                <p>
                  Algunas razas tienen problemas específicos: los braquicéfalos (Persa,
                  Himalayo) tienen dificultades respiratorias; el Scottish Fold puede
                  desarrollar osteoartritis. Busca información sobre las enfermedades
                  hereditarias de la raza.
                </p>
              </div>
            </div>
            <div className={styles.pasoItem}>
              <div className={styles.pasoNumero}>5</div>
              <div className={styles.pasoTexto}>
                <strong>Contacta refugios y criadores antes de decidir</strong>
                <p>
                  Visita el animal antes de adoptarlo o comprarlo. Observa su carácter real.
                  Un buen criador te dejará ver las condiciones de vida y los padres del animal.
                  Un refugio te podrá orientar sobre la personalidad individual de cada gato.
                </p>
              </div>
            </div>
          </div>

          {/* 5. Tips */}
          <h2>5 Mejores Prácticas del Dueño Responsable</h2>
          <div className={styles.tipsList}>
            <div className={styles.tipItem}>
              <span className={styles.tipIcono} aria-hidden="true">✓</span>
              <span>
                <strong>Esteriliza siempre:</strong> reduce el riesgo de cáncer,
                infecciones uterinas y comportamientos indeseados. Es la decisión más
                importante que tomarás por tu gato.
              </span>
            </div>
            <div className={styles.tipItem}>
              <span className={styles.tipIcono} aria-hidden="true">✓</span>
              <span>
                <strong>Alimentación de calidad:</strong> elige pienso o comida húmeda con
                alto contenido en proteína animal (mínimo 30%). Los gatos son carnívoros
                obligados; no procesan bien los cereales.
              </span>
            </div>
            <div className={styles.tipItem}>
              <span className={styles.tipIcono} aria-hidden="true">✓</span>
              <span>
                <strong>Enriquecimiento ambiental:</strong> rascadores, juegos de caza,
                ventanas desde las que observar. Un gato aburrido puede desarrollar ansiedad
                o problemas de comportamiento.
              </span>
            </div>
            <div className={styles.tipItem}>
              <span className={styles.tipIcono} aria-hidden="true">✓</span>
              <span>
                <strong>Visitas veterinarias anuales:</strong> vacunas, desparasitación y
                revisión general. Los gatos ocultan bien el dolor; la detección temprana
                marca la diferencia.
              </span>
            </div>
            <div className={styles.tipItem}>
              <span className={styles.tipIcono} aria-hidden="true">✓</span>
              <span>
                <strong>Microchip y contrato de adopción:</strong> el microchip es
                obligatorio en muchas comunidades autónomas. Si adoptas, firma siempre
                un contrato responsable.
              </span>
            </div>
          </div>

          {/* 6. Warning box — indicador v2.0 */}
          <div className={styles.warningBox}>
            <h3>Errores Frecuentes al Elegir Raza</h3>
            <ul className={styles.warningList}>
              <li>
                Elegir por estética sin informarse del temperamento ni las necesidades de la
                raza; muchos Bengals y Savannah terminan en refugios por este motivo.
              </li>
              <li>
                No tener en cuenta a los demás convivientes (niños, perros, personas alérgicas)
                antes de adoptar.
              </li>
              <li>
                Comprar en tiendas de mascotas o por Internet sin ver al animal ni al criador;
                facilita el tráfico de animales y la cría irresponsable.
              </li>
              <li>
                No esterilizar por desconocimiento o por "querer que tenga crías una vez". Los
                gatos no esterilizados tienen una calidad de vida peor y contribuyen a la
                sobrepoblación felina.
              </li>
              <li>
                Subestimar el coste total: alimentación, veterinario, peluquería (razas de pelo
                largo), gastos imprevistos. Un gato cuesta entre 800 y 2.000 € al año según
                la raza y la salud.
              </li>
            </ul>
          </div>

        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('guia-razas-gatos')} />
      <ShareCard appName="guia-razas-gatos" />
      <Footer appName="guia-razas-gatos" />
    </div>
  );
}
