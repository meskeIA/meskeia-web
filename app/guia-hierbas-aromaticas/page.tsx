'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './GuiaHierbasAromaticas.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ============================================================
// TIPOS
// ============================================================

type FamiliaHierba = 'Lamiáceas' | 'Apiáceas' | 'Asteráceas' | 'Liliáceas' | 'Otras';
type OrigenHierba = 'Mediterráneo' | 'Asia' | 'América' | 'Europa Norte' | 'África';
type DificultadCultivo = 'Fácil' | 'Media' | 'Difícil';
type IntensidadAroma = 'Suave' | 'Medio' | 'Intenso' | 'Muy intenso';
type FormaUso = 'Fresca' | 'Seca' | 'Ambas';

interface HierbaAromatica {
  nombre: string;
  nombreCientifico: string;
  familia: FamiliaHierba;
  origen: OrigenHierba;
  paisesAsociados: string[];
  intensidad: IntensidadAroma;
  formaUso: FormaUso;
  dificultadCultivo: DificultadCultivo;
  exposicionSol: string;
  riego: string;
  perfilSabor: string[];
  maridajeIdeal: string[];
  cocinasTipicas: string[];
  cuandoAnadir: string;
  conservacion: string;
  descripcion: string;
  curiosidad: string;
}

const FAMILIAS: FamiliaHierba[] = ['Lamiáceas', 'Apiáceas', 'Asteráceas', 'Liliáceas', 'Otras'];
const ORIGENES: OrigenHierba[] = ['Mediterráneo', 'Asia', 'América', 'Europa Norte', 'África'];
const INTENSIDADES: IntensidadAroma[] = ['Suave', 'Medio', 'Intenso', 'Muy intenso'];
const FORMAS_USO: FormaUso[] = ['Fresca', 'Seca', 'Ambas'];
const DIFICULTADES: DificultadCultivo[] = ['Fácil', 'Media', 'Difícil'];

const FAMILIA_ESTILOS: Record<FamiliaHierba, string> = {
  'Lamiáceas': styles.familiaLamiaceas,
  'Apiáceas': styles.familiaApiaceas,
  'Asteráceas': styles.familiaAsteraceas,
  'Liliáceas': styles.familiaLiliaceas,
  'Otras': styles.familiaOtras,
};

// ============================================================
// DATOS — 35 hierbas aromáticas
// ============================================================

const HIERBAS: HierbaAromatica[] = [
  // ── LAMIÁCEAS (15) ──────────────────────────────────────
  {
    nombre: 'Albahaca',
    nombreCientifico: 'Ocimum basilicum',
    familia: 'Lamiáceas',
    origen: 'Mediterráneo',
    paisesAsociados: ['Italia', 'Tailandia', 'India'],
    intensidad: 'Intenso',
    formaUso: 'Fresca',
    dificultadCultivo: 'Fácil',
    exposicionSol: 'Pleno sol',
    riego: 'Frecuente',
    perfilSabor: ['Anís', 'Clavo', 'Dulce', 'Floral'],
    maridajeIdeal: ['Tomate', 'Mozzarella', 'Pesto', 'Pollo'],
    cocinasTipicas: ['Italiana', 'Tailandesa'],
    cuandoAnadir: 'Al final de la cocción para preservar aroma',
    conservacion: 'Fresca: tallo en agua. Seca: pierde aroma rápido',
    descripcion:
      'Originaria de la India, donde se cultiva desde hace 5.000 años y es planta sagrada en el hinduismo (tulsi). Hoy es central en la cocina italiana (pesto, caprese), tailandesa (3 variedades: thai sweet, holy, lemon) y vietnamita.',
    curiosidad: "En Génova solo el cultivar 'genovese DOP' puede usarse en pesto auténtico",
  },
  {
    nombre: 'Romero',
    nombreCientifico: 'Salvia rosmarinus',
    familia: 'Lamiáceas',
    origen: 'Mediterráneo',
    paisesAsociados: ['España', 'Italia', 'Francia'],
    intensidad: 'Muy intenso',
    formaUso: 'Ambas',
    dificultadCultivo: 'Fácil',
    exposicionSol: 'Pleno sol',
    riego: 'Bajo',
    perfilSabor: ['Pino', 'Resinoso', 'Cítrico', 'Eucalipto'],
    maridajeIdeal: ['Cordero', 'Patatas', 'Pollo asado', 'Aceite oliva'],
    cocinasTipicas: ['Mediterránea', 'Provenzal'],
    cuandoAnadir: 'Al inicio de cocciones largas o en marinados',
    conservacion: 'Fresco aguanta 2 semanas en nevera. Seco: 12 meses',
    descripcion:
      "Arbusto leñoso aromático del Mediterráneo. Su nombre significa 'rocío del mar' en latín. Tan robusto que puede sobrevivir años con poca agua.",
    curiosidad:
      'En la antigua Grecia, los estudiantes llevaban coronas de romero para mejorar la memoria durante exámenes',
  },
  {
    nombre: 'Tomillo',
    nombreCientifico: 'Thymus vulgaris',
    familia: 'Lamiáceas',
    origen: 'Mediterráneo',
    paisesAsociados: ['España', 'Francia', 'Grecia'],
    intensidad: 'Intenso',
    formaUso: 'Ambas',
    dificultadCultivo: 'Fácil',
    exposicionSol: 'Pleno sol',
    riego: 'Bajo',
    perfilSabor: ['Terroso', 'Limón', 'Mineral', 'Floral'],
    maridajeIdeal: ['Cordero', 'Pescado', 'Verduras asadas', 'Estofados'],
    cocinasTipicas: ['Provenzal', 'Española', 'Griega'],
    cuandoAnadir: 'Al inicio o medio de la cocción — soporta calor',
    conservacion: 'Fresco 2 semanas. Seco aguanta hasta 18 meses',
    descripcion:
      'Hierba mediterránea con cientos de variedades (limón, naranja, oregano, etc.). Esencial en hierbas de Provenza y bouquet garni francés. Antimicrobiano natural.',
    curiosidad:
      "Los antiguos egipcios lo usaban para embalsamar — su nombre griego significa 'fumigar/sahumar'",
  },
  {
    nombre: 'Orégano',
    nombreCientifico: 'Origanum vulgare',
    familia: 'Lamiáceas',
    origen: 'Mediterráneo',
    paisesAsociados: ['Grecia', 'Italia', 'Turquía'],
    intensidad: 'Intenso',
    formaUso: 'Ambas',
    dificultadCultivo: 'Fácil',
    exposicionSol: 'Pleno sol',
    riego: 'Bajo',
    perfilSabor: ['Picante', 'Cálido', 'Resinoso', 'Ligeramente amargo'],
    maridajeIdeal: ['Pizza', 'Tomate', 'Pescado', 'Cordero'],
    cocinasTipicas: ['Italiana', 'Griega', 'Mexicana'],
    cuandoAnadir: 'Inicio o final — versátil',
    conservacion: 'Seco mantiene aroma 2 años (más intenso seco)',
    descripcion:
      "El nombre viene del griego 'oros ganos' (alegría de la montaña). Más intenso seco que fresco — único entre las hierbas frescas. Imprescindible en pizza italiana.",
    curiosidad:
      'El orégano mexicano (Lippia graveolens) es de otra familia botánica — más cítrico y picante que el mediterráneo',
  },
  {
    nombre: 'Salvia',
    nombreCientifico: 'Salvia officinalis',
    familia: 'Lamiáceas',
    origen: 'Mediterráneo',
    paisesAsociados: ['Italia', 'Francia', 'Grecia'],
    intensidad: 'Muy intenso',
    formaUso: 'Ambas',
    dificultadCultivo: 'Fácil',
    exposicionSol: 'Pleno sol',
    riego: 'Bajo',
    perfilSabor: ['Eucalipto', 'Pino', 'Cálido', 'Ligeramente picante'],
    maridajeIdeal: ['Mantequilla', 'Cerdo', 'Pavo', 'Calabaza'],
    cocinasTipicas: ['Italiana', 'Provenzal'],
    cuandoAnadir: 'Inicio de cocción o frita en mantequilla',
    conservacion: 'Fresca 1 semana. Seca 12 meses',
    descripcion:
      "Su nombre viene del latín 'salvere' (salvar/curar). Una de las hierbas medicinales más antiguas. Su uso en mantequilla derretida sobre ravioli o pasta es icónico italiano.",
    curiosidad:
      'Los romanos la consideraban tan sagrada que solo un sacerdote podía recolectarla con un cuchillo de plata',
  },
  {
    nombre: 'Menta',
    nombreCientifico: 'Mentha spicata',
    familia: 'Lamiáceas',
    origen: 'Mediterráneo',
    paisesAsociados: ['Marruecos', 'Reino Unido', 'Vietnam'],
    intensidad: 'Medio',
    formaUso: 'Fresca',
    dificultadCultivo: 'Fácil',
    exposicionSol: 'Sombra parcial',
    riego: 'Frecuente',
    perfilSabor: ['Mentol', 'Refrescante', 'Dulce', 'Verde'],
    maridajeIdeal: ['Cordero', 'Té', 'Mojito', 'Yogur'],
    cocinasTipicas: ['Marroquí', 'Británica', 'Vietnamita'],
    cuandoAnadir: 'Al final, sin cocinar',
    conservacion: 'Fresca: tallo en agua 1 semana. Seca pierde mucho',
    descripcion:
      'Hierba refrescante con dezenas de variedades (yerbabuena, hierbabuena, hortelana). El té de menta marroquí es ceremonia social. La menta inglesa acompaña el cordero asado.',
    curiosidad:
      "Marruecos consume 70% de la producción mundial de menta — el té con menta es el 'whisky bereber'",
  },
  {
    nombre: 'Hierbabuena',
    nombreCientifico: 'Mentha sativa',
    familia: 'Lamiáceas',
    origen: 'Mediterráneo',
    paisesAsociados: ['España', 'Cuba', 'Marruecos'],
    intensidad: 'Medio',
    formaUso: 'Fresca',
    dificultadCultivo: 'Fácil',
    exposicionSol: 'Sombra parcial',
    riego: 'Frecuente',
    perfilSabor: ['Mentol suave', 'Cítrico', 'Dulce', 'Verde'],
    maridajeIdeal: ['Mojito', 'Té', 'Tabulé', 'Yogur'],
    cocinasTipicas: ['Cubana', 'Marroquí', 'Mediterránea'],
    cuandoAnadir: 'Al final, fresca',
    conservacion: 'Fresca 1 semana en nevera con tallo en agua',
    descripcion:
      'Variedad de menta más suave y dulce. Hierba fundamental del mojito cubano (no es menta común — es hierbabuena). En España es la hierba aromática casera más cultivada.',
    curiosidad:
      'El auténtico mojito cubano lleva hierbabuena, NO menta común — es un error común',
  },
  {
    nombre: 'Mejorana',
    nombreCientifico: 'Origanum majorana',
    familia: 'Lamiáceas',
    origen: 'Mediterráneo',
    paisesAsociados: ['Egipto', 'Francia', 'Italia'],
    intensidad: 'Medio',
    formaUso: 'Ambas',
    dificultadCultivo: 'Fácil',
    exposicionSol: 'Pleno sol',
    riego: 'Moderado',
    perfilSabor: ['Dulce floral', 'Suave', 'Ligeramente picante', 'Cálido'],
    maridajeIdeal: ['Verduras', 'Embutidos', 'Pizza', 'Cordero'],
    cocinasTipicas: ['Italiana', 'Alemana', 'Egipcia'],
    cuandoAnadir: 'Al final — el calor degrada su aroma sutil',
    conservacion: 'Seca conserva mejor el aroma que fresca',
    descripcion:
      'Pariente del orégano pero más dulce y delicada. Esencial en hierbas de Provenza y herbamare. Más sutil que el orégano y mejor para platos delicados.',
    curiosidad:
      "Su nombre viene del egipcio antiguo 'amar-akus' — los egipcios la consideraban sagrada para Osiris",
  },
  {
    nombre: 'Albahaca thai',
    nombreCientifico: 'Ocimum basilicum var. thyrsiflora',
    familia: 'Lamiáceas',
    origen: 'Asia',
    paisesAsociados: ['Tailandia', 'Vietnam', 'Laos'],
    intensidad: 'Intenso',
    formaUso: 'Fresca',
    dificultadCultivo: 'Media',
    exposicionSol: 'Pleno sol',
    riego: 'Frecuente',
    perfilSabor: ['Anís', 'Clavo', 'Picante', 'Regaliz'],
    maridajeIdeal: ['Curry rojo', 'Pho', 'Pad thai', 'Arroz frito'],
    cocinasTipicas: ['Tailandesa', 'Vietnamita', 'Camboyana'],
    cuandoAnadir: 'Al final o casi al servir',
    conservacion: 'Fresca 1 semana en nevera',
    descripcion:
      'Variedad de albahaca con tallos morados y sabor a anís. Imprescindible en cocina tailandesa, especialmente curries y stir-fry. Mucho más intensa que la genovesa.',
    curiosidad:
      'Los chefs thai la añaden literalmente cuando el wok aún está al fuego — solo se calienta 5 segundos',
  },
  {
    nombre: 'Hisopo',
    nombreCientifico: 'Hyssopus officinalis',
    familia: 'Lamiáceas',
    origen: 'Mediterráneo',
    paisesAsociados: ['Italia', 'Francia', 'España'],
    intensidad: 'Intenso',
    formaUso: 'Ambas',
    dificultadCultivo: 'Media',
    exposicionSol: 'Pleno sol',
    riego: 'Bajo',
    perfilSabor: ['Mentol', 'Cánfora', 'Amargo', 'Pino'],
    maridajeIdeal: ['Sopas', 'Estofados', 'Caza', 'Licores'],
    cocinasTipicas: ['Provenzal', 'Italiana'],
    cuandoAnadir: 'Inicio de cocción',
    conservacion: 'Seca conserva 12 meses',
    descripcion:
      'Hierba bíblica menos conocida hoy. Sabor entre menta y salvia. Ingrediente del Chartreuse y otros licores monásticos. Tradicional en cocina monacal medieval.',
    curiosidad:
      "Aparece en la Biblia (Salmo 51:7): 'Purifícame con hisopo, y seré limpio'",
  },
  {
    nombre: 'Ajedrea',
    nombreCientifico: 'Satureja hortensis',
    familia: 'Lamiáceas',
    origen: 'Mediterráneo',
    paisesAsociados: ['Italia', 'Bulgaria', 'Hungría'],
    intensidad: 'Intenso',
    formaUso: 'Ambas',
    dificultadCultivo: 'Fácil',
    exposicionSol: 'Pleno sol',
    riego: 'Bajo',
    perfilSabor: ['Picante', 'Tomillo', 'Resinoso', 'Pimienta'],
    maridajeIdeal: ['Legumbres', 'Carnes ahumadas', 'Encurtidos', 'Embutidos'],
    cocinasTipicas: ['Búlgara', 'Italiana', 'Provenzal'],
    cuandoAnadir: 'Inicio de cocción',
    conservacion: 'Seca conserva 12 meses',
    descripcion:
      'Hierba pariente del tomillo, más intensa y picante. Esencial en cocina búlgara (chubritsa) y para preparar legumbres reduciendo flatulencias.',
    curiosidad:
      'Los romanos creían que era afrodisíaca por su sabor picante — los monjes medievales la prohibieron',
  },
  {
    nombre: 'Lavanda culinaria',
    nombreCientifico: 'Lavandula angustifolia',
    familia: 'Lamiáceas',
    origen: 'Mediterráneo',
    paisesAsociados: ['Francia (Provenza)', 'Italia', 'Reino Unido'],
    intensidad: 'Intenso',
    formaUso: 'Ambas',
    dificultadCultivo: 'Media',
    exposicionSol: 'Pleno sol',
    riego: 'Bajo',
    perfilSabor: ['Floral', 'Cítrico', 'Eucalipto', 'Resinoso'],
    maridajeIdeal: ['Postres', 'Helados', 'Cordero', 'Limón'],
    cocinasTipicas: ['Provenzal', 'Inglesa'],
    cuandoAnadir: 'Mínima cantidad — al final o infusión',
    conservacion: 'Flores secas 12 meses',
    descripcion:
      'La variedad fina (angustifolia) es la única apta para cocina. Ingrediente de las hierbas de Provenza. Usar con cuidado: poca cantidad, mucho aroma. Ideal en repostería y caza.',
    curiosidad: '1 gramo de lavanda culinaria es suficiente para perfumar 1 kg de masa de bizcocho',
  },
  {
    nombre: 'Toronjil / Melisa',
    nombreCientifico: 'Melissa officinalis',
    familia: 'Lamiáceas',
    origen: 'Mediterráneo',
    paisesAsociados: ['Grecia', 'Italia', 'Francia'],
    intensidad: 'Suave',
    formaUso: 'Fresca',
    dificultadCultivo: 'Fácil',
    exposicionSol: 'Sombra parcial',
    riego: 'Moderado',
    perfilSabor: ['Limón', 'Dulce', 'Mentol suave', 'Floral'],
    maridajeIdeal: ['Té', 'Postres', 'Pescados', 'Ensaladas'],
    cocinasTipicas: ['Mediterránea', 'Alemana'],
    cuandoAnadir: 'Al final, sin cocinar',
    conservacion: 'Fresca 5 días, seca pierde aroma rápido',
    descripcion:
      "Hierba de aroma a limón sin acidez. Su nombre 'melissa' significa abeja en griego — atrae abejas. Calmante natural usado en infusiones. Base del Agua del Carmen.",
    curiosidad:
      "Las monjas carmelitas inventaron el 'agua del Carmen' en 1611 — sigue siendo medicina popular",
  },
  {
    nombre: 'Perilla / Shiso',
    nombreCientifico: 'Perilla frutescens',
    familia: 'Lamiáceas',
    origen: 'Asia',
    paisesAsociados: ['Japón', 'Corea', 'China'],
    intensidad: 'Intenso',
    formaUso: 'Fresca',
    dificultadCultivo: 'Media',
    exposicionSol: 'Pleno sol',
    riego: 'Frecuente',
    perfilSabor: ['Anís', 'Menta', 'Comino', 'Canela'],
    maridajeIdeal: ['Sushi', 'Sashimi', 'Tempura', 'Encurtidos'],
    cocinasTipicas: ['Japonesa', 'Coreana'],
    cuandoAnadir: 'Al final, fresca',
    conservacion: 'Fresca 5 días en nevera',
    descripcion:
      'Hierba japonesa también conocida como shiso. Hojas verdes (aoshiso) en sashimi, hojas rojas (akashiso) para teñir umeboshi. Sabor único intenso y herbal.',
    curiosidad:
      'El sabor del shiso es tan único que no tiene equivalente — los chefs japoneses lo consideran irremplazable',
  },
  {
    nombre: 'Pataca / Mastranzo',
    nombreCientifico: 'Mentha suaveolens',
    familia: 'Lamiáceas',
    origen: 'Mediterráneo',
    paisesAsociados: ['España', 'Francia', 'Italia'],
    intensidad: 'Medio',
    formaUso: 'Fresca',
    dificultadCultivo: 'Fácil',
    exposicionSol: 'Sol o sombra parcial',
    riego: 'Moderado',
    perfilSabor: ['Manzana', 'Menta suave', 'Dulce', 'Floral'],
    maridajeIdeal: ['Helados', 'Salsas frutales', 'Té', 'Postres'],
    cocinasTipicas: ['Mediterránea', 'Marroquí'],
    cuandoAnadir: 'Al final, sin cocinar',
    conservacion: 'Fresca 5 días',
    descripcion:
      'Variedad de menta con aroma a manzana, menos intensa que la menta común. Usada en Andalucía y Marruecos para té y postres. Hojas suaves y aterciopeladas.',
    curiosidad:
      'En Andalucía es la hierba de los molinos: aparece en cuadros costumbristas siempre cerca de molinos de aceite',
  },

  // ── APIÁCEAS, ASTERÁCEAS, LILIÁCEAS, OTRAS (20) ──────────
  {
    nombre: 'Perejil',
    nombreCientifico: 'Petroselinum crispum',
    familia: 'Apiáceas',
    origen: 'Mediterráneo',
    paisesAsociados: ['Italia', 'Francia', 'España'],
    intensidad: 'Medio',
    formaUso: 'Fresca',
    dificultadCultivo: 'Fácil',
    exposicionSol: 'Sol o sombra parcial',
    riego: 'Moderado',
    perfilSabor: ['Verde', 'Refrescante', 'Ligeramente amargo', 'Pimienta'],
    maridajeIdeal: ['Salsas', 'Pescados', 'Pasta', 'Ajo'],
    cocinasTipicas: ['Mediterránea', 'Internacional'],
    cuandoAnadir: 'Al final, fresco picado',
    conservacion: 'Fresco 1 semana en nevera con tallo en agua',
    descripcion:
      'Una de las hierbas más extendidas del Mediterráneo, Europa y Oriente Medio. Variedades: liso (italiano, mejor sabor) y rizado (decorativo). Imprescindible en gremolata, chimichurri, tabulé. En cocinas asiáticas y latinoamericanas su lugar lo ocupan otras hierbas como el cilantro, la albahaca thai o el epazote.',
    curiosidad:
      'Los antiguos griegos no lo comían — lo consideraban planta sagrada de Perséfone, diosa del inframundo',
  },
  {
    nombre: 'Cilantro',
    nombreCientifico: 'Coriandrum sativum',
    familia: 'Apiáceas',
    origen: 'Mediterráneo',
    paisesAsociados: ['México', 'India', 'Tailandia'],
    intensidad: 'Intenso',
    formaUso: 'Fresca',
    dificultadCultivo: 'Fácil',
    exposicionSol: 'Sombra parcial',
    riego: 'Frecuente',
    perfilSabor: ['Cítrico', 'Verde', 'Especiado', 'Polarizante'],
    maridajeIdeal: ['Tacos', 'Curry', 'Pho', 'Guacamole'],
    cocinasTipicas: ['Mexicana', 'India', 'Tailandesa'],
    cuandoAnadir: 'Al final, sin cocinar',
    conservacion: 'Fresco 1 semana en nevera con tallo en agua',
    descripcion:
      'Una de las hierbas más controvertidas: para algunos sabe a jabón por una variante genética. Hojas y semillas (coriandro) tienen sabores muy distintos. Esencial en cocinas latina y asiática.',
    curiosidad: 'El gen OR6A2 hace que para el 10% de la población el cilantro sepa a jabón',
  },
  {
    nombre: 'Eneldo',
    nombreCientifico: 'Anethum graveolens',
    familia: 'Apiáceas',
    origen: 'Europa Norte',
    paisesAsociados: ['Suecia', 'Polonia', 'Rusia'],
    intensidad: 'Medio',
    formaUso: 'Ambas',
    dificultadCultivo: 'Fácil',
    exposicionSol: 'Sombra parcial',
    riego: 'Frecuente',
    perfilSabor: ['Anís', 'Limón', 'Refrescante', 'Suave'],
    maridajeIdeal: ['Salmón ahumado', 'Encurtidos', 'Pepino', 'Yogur'],
    cocinasTipicas: ['Nórdica', 'Polaca', 'Rusa'],
    cuandoAnadir: 'Al final, fresco',
    conservacion: 'Fresca 5 días, semillas secas 12 meses',
    descripcion:
      'Hierba indispensable en Escandinavia y Europa del Este. Esencial para preparar gravlax (salmón curado) y pickles tipo agridulce. Sus semillas se usan en encurtidos.',
    curiosidad:
      'Suecia consume tanto eneldo per cápita que está cultivado en jardines escolares — los niños aprenden a usarlo desde pequeños',
  },
  {
    nombre: 'Hinojo',
    nombreCientifico: 'Foeniculum vulgare',
    familia: 'Apiáceas',
    origen: 'Mediterráneo',
    paisesAsociados: ['Italia', 'Francia', 'España'],
    intensidad: 'Medio',
    formaUso: 'Fresca',
    dificultadCultivo: 'Fácil',
    exposicionSol: 'Pleno sol',
    riego: 'Moderado',
    perfilSabor: ['Anís', 'Regaliz', 'Floral', 'Dulce'],
    maridajeIdeal: ['Pescado', 'Cerdo', 'Embutidos', 'Naranja'],
    cocinasTipicas: ['Italiana', 'Provenzal'],
    cuandoAnadir: 'Inicio o final — versátil',
    conservacion: 'Bulbo 1 semana en nevera, hojas 5 días',
    descripcion:
      "Su bulbo, semillas, hojas y polen son comestibles. Las hojas (eneldo de mar) aromatizan pescados. El polen ('polvo de oro' de los chefs) puede costar 100€/100g.",
    curiosidad:
      'El polen de hinojo silvestre toscano es uno de los condimentos más caros del mundo — 1.000€/kg',
  },
  {
    nombre: 'Cebollino',
    nombreCientifico: 'Allium schoenoprasum',
    familia: 'Liliáceas',
    origen: 'Europa Norte',
    paisesAsociados: ['Francia', 'Alemania', 'EE.UU.'],
    intensidad: 'Suave',
    formaUso: 'Fresca',
    dificultadCultivo: 'Fácil',
    exposicionSol: 'Sombra parcial',
    riego: 'Frecuente',
    perfilSabor: ['Cebolla suave', 'Verde', 'Dulce', 'Refrescante'],
    maridajeIdeal: ['Patatas', 'Huevos', 'Pescados', 'Quesos frescos'],
    cocinasTipicas: ['Francesa', 'Internacional'],
    cuandoAnadir: 'Al final, picado',
    conservacion: 'Fresco 1 semana en nevera',
    descripcion:
      'El más suave de la familia de la cebolla. Sus tallos huecos verdes son finos e indispensables en finas hierbas francesas (junto con perejil, estragón y perifollo).',
    curiosidad: 'Las flores moradas son comestibles y decorativas — sabor más fuerte que las hojas',
  },
  {
    nombre: 'Estragón',
    nombreCientifico: 'Artemisia dracunculus',
    familia: 'Asteráceas',
    origen: 'Asia',
    paisesAsociados: ['Francia', 'Rusia', 'Irán'],
    intensidad: 'Intenso',
    formaUso: 'Ambas',
    dificultadCultivo: 'Media',
    exposicionSol: 'Pleno sol',
    riego: 'Moderado',
    perfilSabor: ['Anís', 'Dulce', 'Cálido', 'Suave'],
    maridajeIdeal: ['Pollo', 'Salsas crema', 'Vinagre', 'Mostaza'],
    cocinasTipicas: ['Francesa', 'Rusa'],
    cuandoAnadir: 'Al inicio o medio de la cocción',
    conservacion: 'Fresco 5 días, seco 12 meses',
    descripcion:
      'Hierba esencial de la cocina francesa, ingrediente de las finas hierbas y la salsa béarnaise. La variedad francesa (no produce semillas, se reproduce por esquejes) es la verdadera.',
    curiosidad:
      "El 'estragón ruso' (que se vende por semilla) es prácticamente sin sabor — solo el francés es válido",
  },
  {
    nombre: 'Perifollo',
    nombreCientifico: 'Anthriscus cerefolium',
    familia: 'Apiáceas',
    origen: 'Mediterráneo',
    paisesAsociados: ['Francia', 'Bélgica', 'Holanda'],
    intensidad: 'Suave',
    formaUso: 'Fresca',
    dificultadCultivo: 'Media',
    exposicionSol: 'Sombra parcial',
    riego: 'Frecuente',
    perfilSabor: ['Anís suave', 'Perejil', 'Delicado', 'Floral'],
    maridajeIdeal: ['Sopas', 'Salsas', 'Huevos', 'Pollo'],
    cocinasTipicas: ['Francesa'],
    cuandoAnadir: 'Al final — el calor destruye su aroma',
    conservacion: 'Fresco 3 días — muy delicado',
    descripcion:
      "Hierba clave del 'fines herbes' francés. Aroma extremadamente delicado que no soporta calor. Visualmente parece un perejil minúsculo y muy ramificado.",
    curiosidad:
      "En la antigua Roma, los soldados llevaban perifollo como amuleto durante batallas — llamaban 'perifollo' a las plumas en el casco",
  },
  {
    nombre: 'Borraja',
    nombreCientifico: 'Borago officinalis',
    familia: 'Otras',
    origen: 'Mediterráneo',
    paisesAsociados: ['España (Aragón)', 'Italia', 'Alemania'],
    intensidad: 'Suave',
    formaUso: 'Fresca',
    dificultadCultivo: 'Fácil',
    exposicionSol: 'Pleno sol',
    riego: 'Moderado',
    perfilSabor: ['Pepino', 'Salobre', 'Refrescante', 'Marino'],
    maridajeIdeal: ['Sopa Aragonesa', 'Cócteles', 'Ensaladas', 'Pescados'],
    cocinasTipicas: ['Aragonesa', 'Italiana'],
    cuandoAnadir: 'Hojas hervidas, flores frescas',
    conservacion: 'Fresca 3 días en nevera',
    descripcion:
      'Hojas peludas con sabor a pepino y mar. En Aragón es plato tradicional (borraja con patatas). Sus flores azul intenso son decorativas comestibles muy apreciadas.',
    curiosidad:
      "Las flores de borraja se usaban tradicionalmente en Pimm's Cup — ahora muchos las sustituyen por pepino",
  },
  {
    nombre: 'Acedera',
    nombreCientifico: 'Rumex acetosa',
    familia: 'Otras',
    origen: 'Europa Norte',
    paisesAsociados: ['Francia', 'Reino Unido', 'Polonia'],
    intensidad: 'Medio',
    formaUso: 'Fresca',
    dificultadCultivo: 'Fácil',
    exposicionSol: 'Sombra parcial',
    riego: 'Frecuente',
    perfilSabor: ['Limón intenso', 'Ácido', 'Verde', 'Refrescante'],
    maridajeIdeal: ['Salmón', 'Sopas', 'Salsas', 'Ensaladas'],
    cocinasTipicas: ['Francesa', 'Inglesa'],
    cuandoAnadir: 'Cocción corta',
    conservacion: 'Fresca 3 días',
    descripcion:
      'Hojas verdes con sabor extremadamente ácido, casi a limón puro. La acedera francesa (Rumex scutatus) es la más fina. Esencial en la salsa al sorrel del salmón.',
    curiosidad:
      'Su sabor ácido viene del ácido oxálico — no debe consumirse en grandes cantidades por personas con problemas renales',
  },
  {
    nombre: 'Verbena olorosa / Hierba luisa',
    nombreCientifico: 'Aloysia citrodora',
    familia: 'Otras',
    origen: 'América',
    paisesAsociados: ['Argentina', 'España', 'Francia'],
    intensidad: 'Intenso',
    formaUso: 'Fresca',
    dificultadCultivo: 'Media',
    exposicionSol: 'Pleno sol',
    riego: 'Moderado',
    perfilSabor: ['Limón intenso', 'Floral', 'Dulce', 'Fresco'],
    maridajeIdeal: ['Té', 'Helados', 'Postres', 'Cócteles'],
    cocinasTipicas: ['Francesa', 'Mediterránea'],
    cuandoAnadir: 'Al final o en infusión',
    conservacion: 'Fresca 1 semana, seca conserva aroma 12 meses',
    descripcion:
      'Aroma a limón intenso pero más floral que la melisa. Originaria de Sudamérica, llevada a Europa por los españoles en el siglo XVII. Base de muchos licores digestivos.',
    curiosidad:
      'El absenta de calidad lleva verbena olorosa — su aroma se libera lentamente en alcohol',
  },
  {
    nombre: 'Curry leaf / Hoja de curry',
    nombreCientifico: 'Murraya koenigii',
    familia: 'Otras',
    origen: 'Asia',
    paisesAsociados: ['India', 'Sri Lanka', 'Birmania'],
    intensidad: 'Intenso',
    formaUso: 'Ambas',
    dificultadCultivo: 'Difícil',
    exposicionSol: 'Pleno sol cálido',
    riego: 'Moderado',
    perfilSabor: ['Cítrico', 'Anís', 'Especiado', 'Único'],
    maridajeIdeal: ['Curry', 'Daal', 'Pescado', 'Arroz'],
    cocinasTipicas: ['India sur', 'Srilanquesa'],
    cuandoAnadir: 'Al inicio, fritas en aceite',
    conservacion: 'Frescas 1 semana, congeladas 6 meses',
    descripcion:
      'Hierba esencial del sur de la India y Sri Lanka. Sabor único e irreplaceble. Se usan frescas (mucho mejor) o secas. Un árbol pequeño que prospera en climas cálidos húmedos.',
    curiosidad:
      'Las hojas frescas pierden 80% de su aroma al secarse — los secos son casi inútiles culinariamente',
  },
  {
    nombre: 'Hojas de lima kaffir',
    nombreCientifico: 'Citrus hystrix',
    familia: 'Otras',
    origen: 'Asia',
    paisesAsociados: ['Tailandia', 'Indonesia', 'Camboya'],
    intensidad: 'Muy intenso',
    formaUso: 'Ambas',
    dificultadCultivo: 'Difícil',
    exposicionSol: 'Pleno sol cálido',
    riego: 'Moderado',
    perfilSabor: ['Cítrico extremo', 'Floral', 'Bergamota', 'Único'],
    maridajeIdeal: ['Curry tailandés', 'Sopa tom kha', 'Pescado', 'Coco'],
    cocinasTipicas: ['Tailandesa', 'Indonesia'],
    cuandoAnadir: 'Inicio de cocción, retirar al servir',
    conservacion: 'Frescas 2 semanas, congeladas 12 meses',
    descripcion:
      'Hojas dobles únicas, esenciales en cocina tailandesa. Sabor cítrico explosivo sin acidez. Imposibles de sustituir — el curry tailandés sin estas hojas no es lo mismo.',
    curiosidad:
      "También se llaman makrut leaves — el término 'kaffir' es problemático en algunos países africanos",
  },
];

// ============================================================
// COMPONENTE
// ============================================================

export default function GuiaHierbasAromaticasPage() {
  const [busqueda, setBusqueda] = useState('');
  const [familiaActiva, setFamiliaActiva] = useState<FamiliaHierba | 'Todas'>('Todas');
  const [origenActivo, setOrigenActivo] = useState<OrigenHierba | 'Todos'>('Todos');
  const [intensidadActiva, setIntensidadActiva] = useState<IntensidadAroma | 'Todas'>('Todas');
  const [formaActiva, setFormaActiva] = useState<FormaUso | 'Todas'>('Todas');
  const [dificultadActiva, setDificultadActiva] = useState<DificultadCultivo | 'Todas'>('Todas');

  const hierbasFiltradas = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return HIERBAS.filter((h) => {
      const coincideFamilia = familiaActiva === 'Todas' || h.familia === familiaActiva;
      const coincideOrigen = origenActivo === 'Todos' || h.origen === origenActivo;
      const coincideIntensidad =
        intensidadActiva === 'Todas' || h.intensidad === intensidadActiva;
      const coincideForma = formaActiva === 'Todas' || h.formaUso === formaActiva;
      const coincideDificultad =
        dificultadActiva === 'Todas' || h.dificultadCultivo === dificultadActiva;

      const coincideBusqueda =
        !q ||
        h.nombre.toLowerCase().includes(q) ||
        h.nombreCientifico.toLowerCase().includes(q) ||
        h.perfilSabor.some((s) => s.toLowerCase().includes(q)) ||
        h.maridajeIdeal.some((m) => m.toLowerCase().includes(q)) ||
        h.cocinasTipicas.some((c) => c.toLowerCase().includes(q)) ||
        h.paisesAsociados.some((p) => p.toLowerCase().includes(q));

      return (
        coincideFamilia &&
        coincideOrigen &&
        coincideIntensidad &&
        coincideForma &&
        coincideDificultad &&
        coincideBusqueda
      );
    });
  }, [busqueda, familiaActiva, origenActivo, intensidadActiva, formaActiva, dificultadActiva]);

  const resetFiltros = () => {
    setBusqueda('');
    setFamiliaActiva('Todas');
    setOrigenActivo('Todos');
    setIntensidadActiva('Todas');
    setFormaActiva('Todas');
    setDificultadActiva('Todas');
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>🌿 Guía de Hierbas Aromáticas</h1>
          <p className={styles.subtitle}>
            Descubre {HIERBAS.length} hierbas aromáticas: sabor, usos, cultivo y maridaje. Eleva tus platos con la hierba correcta.
          </p>
          <div className={styles.heroStats}>
            <span className={styles.stat}>
              <strong>{HIERBAS.length}</strong> hierbas
            </span>
            <span className={styles.statDivider}>·</span>
            <span className={styles.stat}>
              <strong>{FAMILIAS.length}</strong> familias botánicas
            </span>
            <span className={styles.statDivider}>·</span>
            <span className={styles.stat}>
              <strong>Cultivo + maridaje</strong> incluidos
            </span>
          </div>
        </header>

        <LegalNotice />

        {/* Buscador */}
        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon} aria-hidden="true">
              🔍
            </span>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Busca por nombre, sabor, plato o cocina…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar hierba aromática"
            />
            {busqueda && (
              <button
                className={styles.clearBtn}
                onClick={() => setBusqueda('')}
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filtros: Familia */}
        <div className={styles.filtrosGrupo}>
          <span className={styles.filtroLabel}>Familia botánica</span>
          <div className={styles.filtrosWrapper} role="group" aria-label="Filtrar por familia">
            <button
              className={`${styles.filtroBtn} ${familiaActiva === 'Todas' ? styles.filtroActivo : ''}`}
              onClick={() => setFamiliaActiva('Todas')}
              aria-pressed={familiaActiva === 'Todas'}
            >
              Todas
              <span className={styles.filtroCount}>{HIERBAS.length}</span>
            </button>
            {FAMILIAS.map((f) => {
              const count = HIERBAS.filter((h) => h.familia === f).length;
              return (
                <button
                  key={f}
                  className={`${styles.filtroBtn} ${familiaActiva === f ? styles.filtroActivo : ''}`}
                  onClick={() => setFamiliaActiva(f)}
                  aria-pressed={familiaActiva === f}
                >
                  {f}
                  <span className={styles.filtroCount}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtros: Origen */}
        <div className={styles.filtrosGrupo}>
          <span className={styles.filtroLabel}>Origen</span>
          <div className={styles.filtrosWrapper} role="group" aria-label="Filtrar por origen">
            <button
              className={`${styles.filtroBtn} ${origenActivo === 'Todos' ? styles.filtroActivo : ''}`}
              onClick={() => setOrigenActivo('Todos')}
              aria-pressed={origenActivo === 'Todos'}
            >
              Todos
            </button>
            {ORIGENES.map((o) => {
              const count = HIERBAS.filter((h) => h.origen === o).length;
              if (count === 0) return null;
              return (
                <button
                  key={o}
                  className={`${styles.filtroBtn} ${origenActivo === o ? styles.filtroActivo : ''}`}
                  onClick={() => setOrigenActivo(o)}
                  aria-pressed={origenActivo === o}
                >
                  {o}
                  <span className={styles.filtroCount}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtros: Intensidad */}
        <div className={styles.filtrosGrupo}>
          <span className={styles.filtroLabel}>Intensidad de aroma</span>
          <div className={styles.filtrosWrapper} role="group" aria-label="Filtrar por intensidad">
            <button
              className={`${styles.filtroBtn} ${intensidadActiva === 'Todas' ? styles.filtroActivo : ''}`}
              onClick={() => setIntensidadActiva('Todas')}
              aria-pressed={intensidadActiva === 'Todas'}
            >
              Todas
            </button>
            {INTENSIDADES.map((i) => {
              const count = HIERBAS.filter((h) => h.intensidad === i).length;
              if (count === 0) return null;
              return (
                <button
                  key={i}
                  className={`${styles.filtroBtn} ${intensidadActiva === i ? styles.filtroActivo : ''}`}
                  onClick={() => setIntensidadActiva(i)}
                  aria-pressed={intensidadActiva === i}
                >
                  {i}
                  <span className={styles.filtroCount}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtros: Forma de uso */}
        <div className={styles.filtrosGrupo}>
          <span className={styles.filtroLabel}>Forma de uso</span>
          <div className={styles.filtrosWrapper} role="group" aria-label="Filtrar por forma de uso">
            <button
              className={`${styles.filtroBtn} ${formaActiva === 'Todas' ? styles.filtroActivo : ''}`}
              onClick={() => setFormaActiva('Todas')}
              aria-pressed={formaActiva === 'Todas'}
            >
              Todas
            </button>
            {FORMAS_USO.map((f) => {
              const count = HIERBAS.filter((h) => h.formaUso === f).length;
              if (count === 0) return null;
              return (
                <button
                  key={f}
                  className={`${styles.filtroBtn} ${formaActiva === f ? styles.filtroActivo : ''}`}
                  onClick={() => setFormaActiva(f)}
                  aria-pressed={formaActiva === f}
                >
                  {f}
                  <span className={styles.filtroCount}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtros: Dificultad cultivo */}
        <div className={styles.filtrosGrupo}>
          <span className={styles.filtroLabel}>Dificultad de cultivo</span>
          <div className={styles.filtrosWrapper} role="group" aria-label="Filtrar por dificultad">
            <button
              className={`${styles.filtroBtn} ${dificultadActiva === 'Todas' ? styles.filtroActivo : ''}`}
              onClick={() => setDificultadActiva('Todas')}
              aria-pressed={dificultadActiva === 'Todas'}
            >
              Todas
            </button>
            {DIFICULTADES.map((d) => {
              const count = HIERBAS.filter((h) => h.dificultadCultivo === d).length;
              if (count === 0) return null;
              return (
                <button
                  key={d}
                  className={`${styles.filtroBtn} ${dificultadActiva === d ? styles.filtroActivo : ''}`}
                  onClick={() => setDificultadActiva(d)}
                  aria-pressed={dificultadActiva === d}
                >
                  {d}
                  <span className={styles.filtroCount}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Resultados */}
        <div className={styles.resultadosHeader} role="status" aria-live="polite">
          {hierbasFiltradas.length === 0 ? (
            <div>
              <p className={styles.sinResultados}>
                No hay hierbas que coincidan con los filtros aplicados.
              </p>
              <div style={{ textAlign: 'center' }}>
                <button className={styles.btnReset} onClick={resetFiltros}>
                  Restablecer filtros
                </button>
              </div>
            </div>
          ) : (
            <p className={styles.contadorResultados}>
              Mostrando <strong>{hierbasFiltradas.length}</strong> de {HIERBAS.length} hierbas aromáticas
            </p>
          )}
        </div>

        {/* Grid */}
        <div className={styles.hierbasGrid}>
          {hierbasFiltradas.map((h) => (
            <article key={h.nombre} className={styles.hierbaCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.nombre}>{h.nombre}</h3>
              </div>
              <p className={styles.nombreCientifico}>{h.nombreCientifico}</p>

              <div className={styles.badgesRow}>
                <span className={`${styles.badge} ${FAMILIA_ESTILOS[h.familia]}`}>{h.familia}</span>
                <span className={`${styles.badge} ${styles.origenBadge}`}>📍 {h.origen}</span>
                <span className={`${styles.badge} ${styles.intensidadBadge}`}>🌶️ {h.intensidad}</span>
                <span className={`${styles.badge} ${styles.formaBadge}`}>{h.formaUso}</span>
              </div>

              <div className={styles.cultivoRow}>
                <div className={styles.cultivoItem}>
                  <span className={styles.cultivoLabel}>Cultivo</span>
                  <span className={styles.cultivoValor}>{h.dificultadCultivo}</span>
                </div>
                <div className={styles.cultivoItem}>
                  <span className={styles.cultivoLabel}>☀️ Sol</span>
                  <span className={styles.cultivoValor}>{h.exposicionSol}</span>
                </div>
                <div className={styles.cultivoItem}>
                  <span className={styles.cultivoLabel}>💧 Riego</span>
                  <span className={styles.cultivoValor}>{h.riego}</span>
                </div>
              </div>

              <p className={styles.descripcion}>{h.descripcion}</p>

              <div className={styles.tagSection}>
                <span className={styles.tagLabel}>Perfil de sabor</span>
                <div className={styles.tags}>
                  {h.perfilSabor.map((s) => (
                    <span key={s} className={styles.tagSabor}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.tagSection}>
                <span className={styles.tagLabel}>Maridaje ideal</span>
                <div className={styles.tags}>
                  {h.maridajeIdeal.map((m) => (
                    <span key={m} className={styles.tagMaridaje}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <p className={styles.cocinasLista}>
                <strong>Cocinas:</strong> {h.cocinasTipicas.join(' · ')}
              </p>

              <p className={styles.cuandoAnadir}>
                <strong>Cuándo añadir</strong>
                {h.cuandoAnadir}
              </p>

              <p className={styles.conservacion}>
                <span className={styles.conservaIcon} aria-hidden="true">
                  🫙
                </span>
                {h.conservacion}
              </p>

              <p className={styles.curiosidad}>
                <strong>💡 ¿Sabías que...?</strong> {h.curiosidad}
              </p>
            </article>
          ))}
        </div>

        {/* ============================================================
            EDUCATIONAL SECTION v2.0
        ============================================================ */}
        <EducationalSection
          title="Guía de Hierbas Aromáticas"
          subtitle="Descubre 35 hierbas aromáticas: sabor, usos, cultivo y maridaje. Eleva tus platos con la hierba correcta"
        >
          {/* 1. Tabla comparativa */}
          <section className={styles.guideSection}>
            <h2>📊 Tabla comparativa: intensidad, uso y momento de añadir</h2>
            <p>
              Conocer cuándo añadir cada hierba durante la cocción y si funciona mejor fresca o seca marca la diferencia
              entre un plato perfumado y otro insípido. Esta guía resume las hierbas más usadas en la cocina diaria:
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Hierba</th>
                    <th>Intensidad</th>
                    <th>Fresca / Seca</th>
                    <th>Cuándo añadir</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Albahaca</strong>
                    </td>
                    <td>Intenso</td>
                    <td>Solo fresca</td>
                    <td>Al final, sin cocinar</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Romero</strong>
                    </td>
                    <td>Muy intenso</td>
                    <td>Ambas</td>
                    <td>Al inicio (cocciones largas)</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Tomillo</strong>
                    </td>
                    <td>Intenso</td>
                    <td>Ambas</td>
                    <td>Inicio o medio</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Orégano</strong>
                    </td>
                    <td>Intenso</td>
                    <td>Mejor seca</td>
                    <td>Versátil</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Salvia</strong>
                    </td>
                    <td>Muy intenso</td>
                    <td>Ambas</td>
                    <td>Inicio o frita</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Perejil</strong>
                    </td>
                    <td>Medio</td>
                    <td>Solo fresca</td>
                    <td>Al final, picado</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Cilantro</strong>
                    </td>
                    <td>Intenso</td>
                    <td>Solo fresca</td>
                    <td>Al final, sin cocinar</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Eneldo</strong>
                    </td>
                    <td>Medio</td>
                    <td>Ambas</td>
                    <td>Al final, fresco</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Estragón</strong>
                    </td>
                    <td>Intenso</td>
                    <td>Ambas</td>
                    <td>Inicio o medio</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Cebollino</strong>
                    </td>
                    <td>Suave</td>
                    <td>Solo fresca</td>
                    <td>Al final, picado</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. Casos de uso */}
          <section className={styles.guideSection}>
            <h2>👥 ¿Para quién es esta guía?</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🍳</span>
                  <h3>Cocinero casero que quiere ampliar sabores</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <code>Pollo asado → Romero + Tomillo + Salvia + Limón</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Por qué es útil:</strong> Filtra por familia, origen o cocina típica para descubrir qué hierbas combinan mejor con tus platos del día a día.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🪴</span>
                  <h3>Jardinero principiante con balcón o jardín</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <code>Hierbas fáciles + pleno sol + riego bajo → Romero, Tomillo, Salvia, Orégano</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Por qué es útil:</strong> Filtra por dificultad &quot;Fácil&quot; y consulta exposición y riego para empezar tu jardín de hierbas con éxito.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🌿</span>
                  <h3>Preparar un bouquet garni o ramillete</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <code>Bouquet garni clásico → Tomillo + Laurel + Perejil + Romero</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Por qué es útil:</strong> Identifica las hierbas que aguantan cocciones largas (intensas, leñosas) y las que solo se añaden al final.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🍵</span>
                  <h3>Aficionado a infusiones y tés caseros</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <code>Infusión digestiva → Menta + Melisa + Verbena olorosa</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Por qué es útil:</strong> Filtra por familia Lamiáceas (menta, melisa) o busca por sabor &quot;cítrico&quot; o &quot;refrescante&quot; para crear tus mezclas.
                </p>
              </div>
            </div>
          </section>

          {/* 3. FAQ */}
          <section className={styles.guideSection}>
            <h2>❓ Preguntas frecuentes</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>❓ ¿Cuál es la diferencia entre hierba y especia?</h4>
                <p>
                  Las <strong>hierbas</strong> son las hojas verdes (frescas o secas) de plantas no leñosas: albahaca, perejil,
                  cilantro, romero, tomillo... Las <strong>especias</strong> proceden de otras partes de la planta: semillas
                  (comino, cilantro seco), corteza (canela), flores (clavo), raíces (jengibre, cúrcuma) o frutos secos (pimienta).
                </p>
                <p className={styles.faqTip}>
                  💡 <strong>Curiosidad:</strong> El cilantro es ambas cosas: sus hojas son hierba, sus semillas son especia (coriandro), con sabores muy diferentes entre sí.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Cuándo usar hierbas frescas y cuándo secas?</h4>
                <p>
                  Las <strong>frescas</strong> son ideales cuando se añaden al final (albahaca, perejil, cilantro, eneldo) porque
                  el calor destruye sus aceites volátiles. Las <strong>secas</strong> aguantan cocciones largas y aportan sabor
                  más concentrado (orégano, tomillo, romero). Regla práctica: 1 cucharada de hierba fresca = 1 cucharadita de seca.
                </p>
                <p className={styles.faqTip}>
                  💡 <strong>Excepción:</strong> El orégano es la única hierba que <em>mejora</em> al secarse — más intenso y aromático que fresco.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Cómo conservar las hierbas frescas en la nevera?</h4>
                <p>
                  Las hierbas de tallo blando (albahaca, perejil, cilantro, eneldo, menta) duran 1-2 semanas si las metes con
                  el tallo en un vaso con agua, como un ramo de flores, cubiertas con bolsa de plástico floja en la nevera.
                  Las leñosas (romero, tomillo, salvia) se guardan envueltas en papel de cocina húmedo dentro de un tupper.
                </p>
                <p className={styles.faqTip}>
                  💡 <strong>Truco:</strong> La albahaca prefiere temperatura ambiente — si la metes en la nevera se ennegrece. Mejor en un vaso con agua sobre la encimera.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Qué son las &quot;hierbas de Provenza&quot; y las &quot;finas hierbas&quot;?</h4>
                <p>
                  Son dos mezclas clásicas francesas muy diferentes. <strong>Hierbas de Provenza</strong>: tomillo, romero,
                  orégano, ajedrea, mejorana y a veces lavanda — para asados y guisos. <strong>Finas hierbas</strong>: perejil,
                  cebollino, estragón y perifollo — siempre frescas y al final, para huevos, pescados delicados y salsas.
                </p>
                <p className={styles.faqTip}>
                  💡 <strong>Regla:</strong> Hierbas de Provenza son secas y para cocción larga; finas hierbas son frescas y para platos delicados.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Por qué el cilantro le sabe a jabón a algunas personas?</h4>
                <p>
                  Una variante del gen <strong>OR6A2</strong> (receptor olfativo) hace que entre el 8% y el 15% de la población
                  perciba los aldehídos del cilantro como un sabor jabonoso desagradable. Es genético, no preferencia. Si te
                  pasa, sustituirlo por perejil de hoja plana es la mejor alternativa en la mayoría de recetas.
                </p>
                <p className={styles.faqTip}>
                  💡 <strong>Prueba sociedad:</strong> En México y Tailandia, donde el cilantro es esencial, esta variante genética es mucho menos frecuente que en Europa.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Pasos: Cómo cultivar hierbas en casa */}
          <section className={styles.guideSection}>
            <h2>🌱 5 pasos para cultivar hierbas aromáticas en casa</h2>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h4>Elige hierbas fáciles para empezar</h4>
                  <p>
                    Empieza con romero, tomillo, salvia, orégano, perejil, hierbabuena y cebollino: son las más resistentes
                    y crecen casi solas. Evita perifollo, lavanda culinaria y curry leaf hasta tener experiencia. Compra
                    plantas en vivero, no semillas — más rápido y seguro.
                  </p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h4>Agrupa por necesidades de sol y agua</h4>
                  <p>
                    Mediterráneas (romero, tomillo, salvia, orégano, lavanda): pleno sol y poca agua, las puedes plantar
                    juntas. Hierbas de hoja blanda (perejil, cilantro, menta, cebollino): sombra parcial y riego frecuente,
                    en otra maceta. Mezclarlas en la misma maceta hace que unas mueran por exceso o falta de agua.
                  </p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h4>Macetas con buen drenaje y sustrato adecuado</h4>
                  <p>
                    Macetas de barro (mejor que plástico para mediterráneas) con agujeros y plato para drenaje. Usa sustrato
                    universal mezclado con un 30% de arena para mediterráneas. Riega solo cuando los 2 cm superiores estén
                    secos — el exceso de agua mata más hierbas que la sequía.
                  </p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h4>Poda regularmente para que crezcan más</h4>
                  <p>
                    Corta las puntas de las ramas cada 2-3 semanas (incluso si no las usas) para que la planta se ramifique
                    y produzca más hojas. Nunca cortes más del 30% de la planta de una vez. La albahaca y la menta agradecen
                    cortes drásticos: rebrotan más vigorosas.
                  </p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <h4>Conserva el excedente: secar, congelar o aceite</h4>
                  <p>
                    Si tienes mucha cosecha: las leñosas (romero, tomillo, salvia) se secan colgadas boca abajo en lugar
                    aireado durante 1-2 semanas. Las de hoja blanda (albahaca, perejil) se congelan en cubitera con aceite
                    de oliva — listas para usar directamente en sartén. Tarros etiquetados con fecha.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Tips */}
          <section className={styles.guideSection}>
            <h2>💡 5 trucos para sacar el máximo a tus hierbas</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">
                  🫙
                </span>
                <h4>Cómo conservar frescas más tiempo</h4>
                <p>
                  Hierbas de tallo blando: tallo en agua + bolsa floja en nevera. Leñosas: papel de cocina húmedo en tupper.
                  La albahaca, en agua a temperatura ambiente — la nevera la ennegrece.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">
                  ⏱️
                </span>
                <h4>Cuándo añadirlas en la cocción</h4>
                <p>
                  Leñosas (romero, tomillo, salvia, laurel): al inicio para cocciones largas. De hoja blanda (perejil, cilantro,
                  albahaca): al final, fuera del fuego. Orégano: aguanta el calor — entra cuando quieras.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">
                  🌬️
                </span>
                <h4>Cómo secar hierbas en casa</h4>
                <p>
                  Cuelga ramos pequeños boca abajo en lugar oscuro y ventilado durante 1-2 semanas. Funciona perfecto con
                  romero, tomillo, salvia, orégano. NO funciona con albahaca, cilantro, perifollo (mejor congelar).
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">
                  🧊
                </span>
                <h4>Cómo congelar hierbas frescas</h4>
                <p>
                  Pica la hierba, métela en cubitera y cubre con aceite de oliva. Congelado: 6 meses. Para usar, echa el
                  cubito directamente en la sartén caliente — el aceite y la hierba se incorporan al plato.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">
                  🤝
                </span>
                <h4>Cómo combinar varias hierbas sin saturar</h4>
                <p>
                  Regla de oro: una hierba dominante (intensa) + dos secundarias (suaves). Ej: Romero (estrella) + Tomillo
                  + Perejil. Evita mezclar varias muy intensas (romero + salvia + orégano) — anulan el plato.
                </p>
              </div>
            </div>
          </section>

          {/* 6. Errores comunes */}
          <section className={styles.guideSection}>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">
                  ⚠️
                </span>
                <h3>Errores comunes al cocinar y conservar hierbas</h3>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>Cocer hierbas frescas mucho rato:</strong> Albahaca, cilantro, perejil o eneldo pierden todo su aroma
                  con el calor prolongado. Añádelas siempre al final, fuera del fuego, o decorando el plato terminado.
                </li>
                <li>
                  <strong>Comprar hierbas secas baratas en grandes cantidades:</strong> Las hierbas secas pierden el 50% de su
                  aroma a los 6 meses. Comprar tarros enormes &quot;de oferta&quot; es perder dinero. Mejor envases pequeños y rotarlos.
                </li>
                <li>
                  <strong>Mezclar hierbas incompatibles:</strong> El cilantro con cualquier mediterránea (romero, salvia, tomillo)
                  desentona. La menta con orégano o tomillo en el mismo plato es batalla de aromas. Respeta las cocinas: lo que
                  no aparece junto en una receta tradicional, suele ser por algo.
                </li>
                <li>
                  <strong>Lavar y guardar las hierbas húmedas:</strong> El agua acelera la putrefacción. Lava solo lo que vayas
                  a usar y seca con papel antes. Para conservar varios días, guárdalas SIN lavar en la nevera; lava al usarlas.
                </li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('guia-hierbas-aromaticas')} />
        <ShareCard appName="guia-hierbas-aromaticas" />
        <Footer appName="guia-hierbas-aromaticas" />
      </div>
    </>
  );
}
