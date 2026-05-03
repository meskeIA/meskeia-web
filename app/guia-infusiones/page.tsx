'use client';

import { useState, useMemo } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './GuiaInfusiones.module.css';

type Familia =
  | 'Digestiva'
  | 'Relajante'
  | 'Estimulante'
  | 'Depurativa / Diurética'
  | 'Respiratoria'
  | 'Antiinflamatoria'
  | 'Antioxidante'
  | 'Adaptógena / Energética';

interface Preparacion {
  temperatura: string;
  tiempo: string;
  cantidad: string;
}

interface Infusion {
  nombre: string;
  nombreCientifico: string;
  partePlanta: string;
  familia: Familia;
  descripcion: string;
  usosTradicionales: string[];
  preparacion: Preparacion;
  contraindicaciones: string[];
  combinaCon: string[];
}

const FAMILIAS: Familia[] = [
  'Digestiva',
  'Relajante',
  'Estimulante',
  'Depurativa / Diurética',
  'Respiratoria',
  'Antiinflamatoria',
  'Antioxidante',
  'Adaptógena / Energética',
];

const FAMILIA_ICONOS: Record<Familia, string> = {
  'Digestiva': '🌿',
  'Relajante': '🌙',
  'Estimulante': '⚡',
  'Depurativa / Diurética': '💧',
  'Respiratoria': '🌬️',
  'Antiinflamatoria': '🔥',
  'Antioxidante': '✨',
  'Adaptógena / Energética': '🌱',
};

function getFamiliaClass(familia: Familia): string {
  const mapa: Record<Familia, string> = {
    'Digestiva': styles.familiaDigestiva,
    'Relajante': styles.familiaRelajante,
    'Estimulante': styles.familiaEstimulante,
    'Depurativa / Diurética': styles.familiaDepurativa,
    'Respiratoria': styles.familiaRespiratoria,
    'Antiinflamatoria': styles.familiaAntiinflamatoria,
    'Antioxidante': styles.familiaAntioxidante,
    'Adaptógena / Energética': styles.familiaAdaptogena,
  };
  return mapa[familia] || '';
}

const INFUSIONES: Infusion[] = [
  // ── DIGESTIVA ──────────────────────────────────────────────────────────────
  {
    nombre: 'Manzanilla',
    nombreCientifico: 'Matricaria chamomilla',
    partePlanta: 'Flores',
    familia: 'Digestiva',
    descripcion: 'Una de las plantas medicinales más utilizadas en Europa. Aroma suave y floral con notas de manzana. Ideal tras las comidas.',
    usosTradicionales: ['Molestias digestivas leves', 'Gases e hinchazón', 'Espasmos intestinales', 'Nerviosismo leve'],
    preparacion: { temperatura: '90°C', tiempo: '5-7 min', cantidad: '1-2 cucharaditas por taza' },
    contraindicaciones: ['Alergia a plantas Asteraceae', 'Embarazo en dosis altas', 'Precaución con anticoagulantes'],
    combinaCon: ['Melisa', 'Hinojo', 'Tila'],
  },
  {
    nombre: 'Hinojo',
    nombreCientifico: 'Foeniculum vulgare',
    partePlanta: 'Semillas',
    familia: 'Digestiva',
    descripcion: 'Planta mediterránea con sabor anisado característico. Sus semillas se usan en cocina y fitoterapia tradicional para el bienestar digestivo.',
    usosTradicionales: ['Gases y flatulencia', 'Digestión pesada', 'Espasmos intestinales', 'Estímulo del apetito'],
    preparacion: { temperatura: '95°C', tiempo: '8-10 min', cantidad: '1 cucharadita por taza' },
    contraindicaciones: ['Embarazo', 'Niños menores de 1 año en grandes cantidades', 'Alergia a apiáceas'],
    combinaCon: ['Anís estrellado', 'Manzanilla', 'Jengibre'],
  },
  {
    nombre: 'Anís estrellado',
    nombreCientifico: 'Illicium verum',
    partePlanta: 'Fruto estrellado',
    familia: 'Digestiva',
    descripcion: 'Originario del sur de China, su aroma intensamente anisado lo hace inconfundible. Muy usado en Asia y Europa para infusiones digestivas.',
    usosTradicionales: ['Digestión pesada', 'Gases y flatulencia', 'Tos y resfriados leves', 'Aliento fresco'],
    preparacion: { temperatura: '95°C', tiempo: '7-10 min', cantidad: '1-2 estrellas por taza' },
    contraindicaciones: ['Embarazo', 'Lactancia', 'Niños menores de 1 año', 'No confundir con anís estrellado japonés (tóxico)'],
    combinaCon: ['Hinojo', 'Canela', 'Jengibre'],
  },
  {
    nombre: 'Anís verde',
    nombreCientifico: 'Pimpinella anisum',
    partePlanta: 'Frutos (semillas)',
    familia: 'Digestiva',
    descripcion: 'Sabor anisado más suave y dulce que el anís estrellado. Muy popular en la cocina y fitoterapia española. Base de licores y dulces tradicionales.',
    usosTradicionales: ['Gases y flatulencia', 'Digestión pesada', 'Espasmos intestinales', 'Tos leve'],
    preparacion: { temperatura: '90°C', tiempo: '8-10 min', cantidad: '1 cucharadita de semillas ligeramente machacadas' },
    contraindicaciones: ['Alergia a apiáceas', 'Embarazo en grandes cantidades'],
    combinaCon: ['Hinojo', 'Manzanilla', 'Regaliz'],
  },
  {
    nombre: 'Boldo',
    nombreCientifico: 'Peumus boldus',
    partePlanta: 'Hojas',
    familia: 'Digestiva',
    descripcion: 'Árbol originario de los Andes chilenos. Sabor amargo pronunciado. Muy popular en Latinoamérica y España para el bienestar hepático y digestivo.',
    usosTradicionales: ['Pesadez y lentitud digestiva', 'Bienestar hepático', 'Digestión de grasas', 'Flatulencia'],
    preparacion: { temperatura: '90°C', tiempo: '5-8 min', cantidad: '1 cucharadita por taza' },
    contraindicaciones: ['Embarazo', 'Lactancia', 'Enfermedades hepáticas graves', 'No consumir en exceso ni prolongadamente'],
    combinaCon: ['Alcachofa', 'Diente de León', 'Menta piperita'],
  },
  {
    nombre: 'Menta piperita',
    nombreCientifico: 'Mentha × piperita',
    partePlanta: 'Hojas',
    familia: 'Digestiva',
    descripcion: 'Mayor contenido de mentol entre las mentas. Refrescante y versátil en cocina y fitoterapia. Una de las infusiones más consumidas del mundo.',
    usosTradicionales: ['Digestión pesada', 'Náuseas leves', 'Gases y espasmos intestinales', 'Cefalea tensional (vapor)'],
    preparacion: { temperatura: '85°C', tiempo: '5-7 min', cantidad: '1-2 cucharaditas por taza' },
    contraindicaciones: ['Reflujo gastroesofágico (puede agravarlo)', 'Hernia de hiato', 'Niños menores de 2 años'],
    combinaCon: ['Jengibre', 'Hierbabuena', 'Manzanilla'],
  },
  {
    nombre: 'Hierbabuena',
    nombreCientifico: 'Mentha spicata',
    partePlanta: 'Hojas',
    familia: 'Digestiva',
    descripcion: 'La menta más consumida en España y el norte de África. Aroma más suave y dulce que la menta piperita. Ideal sola o combinada con otras plantas.',
    usosTradicionales: ['Digestión ligera', 'Frescor y bienestar general', 'Gases leves', 'Náuseas suaves'],
    preparacion: { temperatura: '85°C', tiempo: '5 min', cantidad: '3-4 hojas frescas o 1 cucharadita seca' },
    contraindicaciones: ['Reflujo gastroesofágico en dosis altas', 'Niños menores de 2 años'],
    combinaCon: ['Menta piperita', 'Manzanilla', 'Jengibre'],
  },
  {
    nombre: 'Cardamomo',
    nombreCientifico: 'Elettaria cardamomum',
    partePlanta: 'Vainas y semillas',
    familia: 'Digestiva',
    descripcion: 'Conocido como "la reina de las especias". Sabor cálido, especiado y floral. Protagonista del té chai y el café árabe. Originario de la India.',
    usosTradicionales: ['Digestión tras comidas copiosas', 'Aliento fresco', 'Náuseas y gases', 'Bienestar general'],
    preparacion: { temperatura: '95°C', tiempo: '8-10 min', cantidad: '2-3 vainas machacadas por taza' },
    contraindicaciones: ['Precaución con cálculos biliares', 'Alergia al cardamomo'],
    combinaCon: ['Canela', 'Jengibre', 'Anís estrellado'],
  },
  {
    nombre: 'Regaliz',
    nombreCientifico: 'Glycyrrhiza glabra',
    partePlanta: 'Raíz',
    familia: 'Digestiva',
    descripcion: 'Sabor intensamente dulce y anisado, hasta 50 veces más dulce que el azúcar. Planta mediterránea tradicional en infusiones digestivas y respiratorias.',
    usosTradicionales: ['Molestias gástricas leves', 'Tos y catarro', 'Inflamación de mucosas', 'Endulzante natural'],
    preparacion: { temperatura: '95°C', tiempo: '8-10 min', cantidad: 'Pieza de 3-4 cm de raíz seca' },
    contraindicaciones: ['Hipertensión arterial', 'Embarazo', 'Enfermedades renales', 'Insuficiencia cardíaca', 'No más de 4-6 semanas seguidas'],
    combinaCon: ['Anís estrellado', 'Hinojo', 'Tomillo'],
  },
  {
    nombre: 'Verbena',
    nombreCientifico: 'Verbena officinalis',
    partePlanta: 'Hojas y tallos floridos',
    familia: 'Digestiva',
    descripcion: 'Planta herbácea muy común en Europa con sabor herbáceo y ligeramente amargo. Utilizada en la medicina popular europea durante siglos.',
    usosTradicionales: ['Digestión pesada', 'Tensión nerviosa y fatiga', 'Fiebre moderada', 'Bienestar general'],
    preparacion: { temperatura: '90°C', tiempo: '7-10 min', cantidad: '1-2 cucharaditas por taza' },
    contraindicaciones: ['Embarazo', 'Lactancia', 'Hipertiroidismo'],
    combinaCon: ['Melisa', 'Tila', 'Manzanilla'],
  },

  // ── RELAJANTE ──────────────────────────────────────────────────────────────
  {
    nombre: 'Tila',
    nombreCientifico: 'Tilia europaea',
    partePlanta: 'Flores y brácteas',
    familia: 'Relajante',
    descripcion: 'Una de las infusiones más apreciadas en España. Aroma dulce y floral, sabor suave. Muy popular para favorecer la relajación y el descanso.',
    usosTradicionales: ['Nerviosismo e irritabilidad', 'Dificultad para dormir', 'Ansiedad leve', 'Tensión muscular', 'Resfriados (diaforética)'],
    preparacion: { temperatura: '90°C', tiempo: '5-8 min', cantidad: '1-2 cucharaditas por taza' },
    contraindicaciones: ['Alergia a plantas Tiliaceae', 'Interacciones con sedantes y ansiolíticos', 'Uso prolongado en dosis altas'],
    combinaCon: ['Valeriana', 'Melisa', 'Pasiflora'],
  },
  {
    nombre: 'Valeriana',
    nombreCientifico: 'Valeriana officinalis',
    partePlanta: 'Raíz',
    familia: 'Relajante',
    descripcion: 'Una de las plantas más estudiadas para el sueño. Aroma y sabor pronunciado y terroso. Se combina habitualmente con otras plantas para suavizar su gusto.',
    usosTradicionales: ['Insomnio y dificultad para dormir', 'Ansiedad y nerviosismo', 'Tensión y agitación', 'Calambres musculares'],
    preparacion: { temperatura: '90°C', tiempo: '10-15 min', cantidad: '1 cucharadita por taza' },
    contraindicaciones: ['No combinar con alcohol ni sedantes', 'Embarazo', 'Lactancia', 'Precaución para conducir', 'Niños menores de 12 años'],
    combinaCon: ['Tila', 'Pasiflora', 'Melisa'],
  },
  {
    nombre: 'Pasiflora',
    nombreCientifico: 'Passiflora incarnata',
    partePlanta: 'Hojas y flores',
    familia: 'Relajante',
    descripcion: 'Planta trepadora originaria de Norteamérica con flores espectaculares. Sabor herbáceo y suave. Utilizada en fitoterapia para la tensión nerviosa y el descanso.',
    usosTradicionales: ['Tensión nerviosa y ansiedad leve', 'Insomnio por pensamiento excesivo', 'Espasmos nerviosos', 'Palpitaciones leves'],
    preparacion: { temperatura: '90°C', tiempo: '8-10 min', cantidad: '1-2 cucharaditas por taza' },
    contraindicaciones: ['Embarazo', 'Lactancia', 'No combinar con sedantes o ansiolíticos', 'Precaución con anticoagulantes'],
    combinaCon: ['Valeriana', 'Tila', 'Melisa'],
  },
  {
    nombre: 'Melisa',
    nombreCientifico: 'Melissa officinalis',
    partePlanta: 'Hojas',
    familia: 'Relajante',
    descripcion: 'También llamada toronjil o citronela. Aroma cítrico y refrescante con notas de limón. Muy apreciada en la medicina popular europea para el bienestar nervioso y digestivo.',
    usosTradicionales: ['Nerviosismo y ansiedad leve', 'Digestión de origen nervioso', 'Insomnio leve', 'Tensión y agitación'],
    preparacion: { temperatura: '85°C', tiempo: '5-7 min', cantidad: '1-2 cucharaditas por taza' },
    contraindicaciones: ['Hipotiroidismo (puede reducir actividad tiroidea)', 'Embarazo en dosis altas', 'Glaucoma'],
    combinaCon: ['Tila', 'Manzanilla', 'Verbena'],
  },
  {
    nombre: 'Lavanda',
    nombreCientifico: 'Lavandula angustifolia',
    partePlanta: 'Flores',
    familia: 'Relajante',
    descripcion: 'Planta mediterránea icónica, muy cultivada en Provenza y Castilla-La Mancha. Aroma floral intenso. Más habitual en aromaterapia, pero también válida en infusión (dosis pequeñas).',
    usosTradicionales: ['Relajación y bienestar general', 'Tensión nerviosa', 'Cefaleas tensionales', 'Insomnio leve', 'Ansiedad situacional'],
    preparacion: { temperatura: '85°C', tiempo: '5-7 min', cantidad: '½-1 cucharadita por taza (sabor muy pronunciado)' },
    contraindicaciones: ['Embarazo', 'Niños pequeños', 'Alergia a lamiáceas', 'No consumir aceite esencial por vía oral'],
    combinaCon: ['Manzanilla', 'Melisa', 'Tila'],
  },
  {
    nombre: 'Lúpulo',
    nombreCientifico: 'Humulus lupulus',
    partePlanta: 'Conos (estróbilos)',
    familia: 'Relajante',
    descripcion: 'Planta trepadora conocida principalmente como ingrediente de la cerveza. Sus conos contienen resinas con propiedades sedantes. Sabor amargo, habitualmente combinado con otras plantas.',
    usosTradicionales: ['Insomnio y dificultad para dormir', 'Nerviosismo e irritabilidad', 'Tensión y ansiedad leve', 'Sofocos de la menopausia (uso tradicional)'],
    preparacion: { temperatura: '90°C', tiempo: '8-10 min', cantidad: '1 cucharadita de conos secos por taza' },
    contraindicaciones: ['Depresión (puede agravarla)', 'Embarazo', 'Lactancia', 'No combinar con sedantes y alcohol'],
    combinaCon: ['Valeriana', 'Melisa', 'Pasiflora'],
  },
  {
    nombre: 'Espino blanco',
    nombreCientifico: 'Crataegus monogyna',
    partePlanta: 'Flores y hojas',
    familia: 'Relajante',
    descripcion: 'Arbusto espinoso muy común en Europa. Sus flores tienen un suave aroma floral. Utilizado en fitoterapia europea para el bienestar cardiovascular y la relajación nerviosa.',
    usosTradicionales: ['Nerviosismo y ansiedad leve', 'Palpitaciones funcionales', 'Bienestar cardiovascular', 'Insomnio de origen nervioso'],
    preparacion: { temperatura: '90°C', tiempo: '10 min', cantidad: '1-2 cucharaditas por taza' },
    contraindicaciones: ['No combinar con medicamentos cardíacos sin supervisión', 'Embarazo', 'Lactancia'],
    combinaCon: ['Tila', 'Valeriana', 'Melisa'],
  },

  // ── ESTIMULANTE ─────────────────────────────────────────────────────────────
  {
    nombre: 'Té verde',
    nombreCientifico: 'Camellia sinensis',
    partePlanta: 'Hojas jóvenes (sin fermentar)',
    familia: 'Estimulante',
    descripcion: 'Originario de China. Hojas sin oxidar, ricas en catequinas y L-teanina. Sabor vegetal y suave. Energía tranquila sin el pico de nerviosismo del café.',
    usosTradicionales: ['Energía y concentración suave', 'Antioxidante', 'Bienestar metabólico', 'Hidratación saludable'],
    preparacion: { temperatura: '75-80°C', tiempo: '2-3 min', cantidad: '1-2 cucharaditas por taza' },
    contraindicaciones: ['Anemia (dificulta absorción del hierro, tomar alejado de comidas)', 'Sensibilidad a la cafeína', 'Embarazo (limitar a 1-2 tazas/día)'],
    combinaCon: ['Jengibre', 'Menta piperita', 'Limón'],
  },
  {
    nombre: 'Té negro',
    nombreCientifico: 'Camellia sinensis',
    partePlanta: 'Hojas completamente oxidadas',
    familia: 'Estimulante',
    descripcion: 'El mismo arbusto que el té verde, con oxidación completa. Sabor robusto, terroso y tostado. Mayor contenido de cafeína. Base del té con leche británico y el chai.',
    usosTradicionales: ['Energía y alerta mental', 'Concentración', 'Bienestar digestivo suave', 'Hidratación'],
    preparacion: { temperatura: '95-100°C', tiempo: '3-5 min', cantidad: '1 cucharadita por taza' },
    contraindicaciones: ['Sensibilidad a la cafeína', 'Insomnio si se consume tarde', 'Anemia (alejar de las comidas)', 'Embarazo (limitar)'],
    combinaCon: ['Canela', 'Cardamomo', 'Jengibre'],
  },
  {
    nombre: 'Té blanco',
    nombreCientifico: 'Camellia sinensis',
    partePlanta: 'Brotes y hojas tiernas (mínima oxidación)',
    familia: 'Estimulante',
    descripcion: 'El menos procesado de todos los tés. Procede de brotes tiernos recogidos antes de abrirse. Sabor delicado, floral y suave. Muy apreciado en la cultura china.',
    usosTradicionales: ['Antioxidante suave', 'Energía tranquila sin nerviosismo', 'Bienestar general', 'Hidratación saludable'],
    preparacion: { temperatura: '70-75°C', tiempo: '2-3 min', cantidad: '2 cucharaditas por taza' },
    contraindicaciones: ['Sensibilidad a la cafeína', 'Embarazo (limitar)', 'Anemia (alejar de las comidas)'],
    combinaCon: ['Melisa', 'Rosa mosqueta', 'Hibisco'],
  },
  {
    nombre: 'Yerba mate',
    nombreCientifico: 'Ilex paraguariensis',
    partePlanta: 'Hojas y ramas jóvenes',
    familia: 'Estimulante',
    descripcion: 'Bebida tradicional del Cono Sur sudamericano. Rica en mateína, antioxidantes y minerales. Sabor intenso, herbáceo y ligeramente amargo. Se toma en mate o en infusión.',
    usosTradicionales: ['Energía y resistencia física', 'Concentración y claridad mental', 'Bienestar metabólico', 'Reducción de fatiga'],
    preparacion: { temperatura: '70-80°C', tiempo: '3-5 min', cantidad: '1-2 cucharadas (mate) o 1 cucharadita (taza)' },
    contraindicaciones: ['No tomar muy caliente (riesgo cáncer esófago)', 'Embarazo', 'Hipertensión', 'Insomnio si se consume tarde'],
    combinaCon: ['Menta piperita', 'Cáscara de naranja'],
  },
  {
    nombre: 'Guaraná',
    nombreCientifico: 'Paullinia cupana',
    partePlanta: 'Semillas',
    familia: 'Estimulante',
    descripcion: 'Planta trepadora amazónica con el mayor contenido natural de cafeína conocido (hasta el doble que el café). Usada por pueblos indígenas brasileños desde hace siglos.',
    usosTradicionales: ['Energía y reducción de fatiga', 'Concentración y rendimiento mental', 'Bienestar metabólico', 'Resistencia física'],
    preparacion: { temperatura: '90°C', tiempo: '5-8 min', cantidad: '½ cucharadita de polvo por taza' },
    contraindicaciones: ['Sensibilidad a la cafeína', 'Hipertensión', 'Cardiopatías', 'Embarazo', 'Insomnio', 'No combinar con otros estimulantes'],
    combinaCon: ['Jengibre', 'Canela'],
  },

  // ── DEPURATIVA / DIURÉTICA ──────────────────────────────────────────────────
  {
    nombre: 'Diente de León',
    nombreCientifico: 'Taraxacum officinale',
    partePlanta: 'Hojas y raíz',
    familia: 'Depurativa / Diurética',
    descripcion: 'Planta silvestre muy común en Europa con amplia tradición fitoterapéutica. Sabor amargo. Las hojas son más diuréticas; la raíz tiene propiedades más hepáticas.',
    usosTradicionales: ['Bienestar hepático y biliar', 'Drenaje y depuración', 'Retención de líquidos', 'Digestión de grasas'],
    preparacion: { temperatura: '95°C', tiempo: '10 min', cantidad: '1-2 cucharaditas por taza' },
    contraindicaciones: ['Cálculos biliares', 'Obstrucción de vías biliares', 'Alergia a Asteraceae', 'Interacciones con anticoagulantes y diuréticos'],
    combinaCon: ['Alcachofa', 'Boldo', 'Ortiga'],
  },
  {
    nombre: 'Cola de Caballo',
    nombreCientifico: 'Equisetum arvense',
    partePlanta: 'Tallos estériles',
    familia: 'Depurativa / Diurética',
    descripcion: 'Planta sin flores, descendiente de especies prehistóricas. Rica en sílice y minerales. Uno de los depurativos y diuréticos más utilizados en la fitoterapia europea.',
    usosTradicionales: ['Retención de líquidos', 'Drenaje renal', 'Salud articular y tejido conectivo', 'Cabello y uñas'],
    preparacion: { temperatura: '95°C', tiempo: '10-15 min', cantidad: '1 cucharada por taza' },
    contraindicaciones: ['Enfermedades renales graves', 'Edema cardíaco', 'Deficiencia de tiamina', 'No usar más de 4-6 semanas', 'Embarazo'],
    combinaCon: ['Ortiga', 'Abedul', 'Diente de León'],
  },
  {
    nombre: 'Ortiga',
    nombreCientifico: 'Urtica dioica',
    partePlanta: 'Hojas (desecadas)',
    familia: 'Depurativa / Diurética',
    descripcion: 'Una de las plantas silvestres más nutritivas de Europa. Rica en hierro, vitaminas y minerales. El desecado elimina el efecto urticante. Sabor herbáceo y vegetal.',
    usosTradicionales: ['Drenaje y depuración', 'Retención de líquidos', 'Bienestar articular', 'Aporte de hierro y minerales'],
    preparacion: { temperatura: '95°C', tiempo: '8-10 min', cantidad: '1-2 cucharaditas por taza' },
    contraindicaciones: ['Interacciones con anticoagulantes', 'Interacciones con diuréticos', 'Diabetes (puede afectar glucemia)', 'Embarazo en dosis altas'],
    combinaCon: ['Cola de Caballo', 'Diente de León', 'Abedul'],
  },
  {
    nombre: 'Abedul',
    nombreCientifico: 'Betula pendula',
    partePlanta: 'Hojas',
    familia: 'Depurativa / Diurética',
    descripcion: 'Árbol caducifolio muy extendido en Europa del norte. Sus hojas tienen sabor fresco y ligeramente amargo. Uno de los diuréticos vegetales más suaves y bien tolerados.',
    usosTradicionales: ['Retención de líquidos', 'Drenaje renal suave', 'Bienestar urinario', 'Depuración primaveral'],
    preparacion: { temperatura: '90°C', tiempo: '10 min', cantidad: '1-2 cucharaditas por taza' },
    contraindicaciones: ['Alergia al abedul o al polen', 'Enfermedades renales graves', 'Edema cardíaco', 'Embarazo'],
    combinaCon: ['Cola de Caballo', 'Ortiga', 'Diente de León'],
  },
  {
    nombre: 'Alcachofa',
    nombreCientifico: 'Cynara scolymus',
    partePlanta: 'Hojas',
    familia: 'Depurativa / Diurética',
    descripcion: 'Conocida principalmente como alimento, las hojas de alcachofa tienen larga tradición en fitoterapia para el bienestar hepático y digestivo. Sabor amargo e intenso.',
    usosTradicionales: ['Bienestar hepático', 'Digestión de grasas', 'Drenaje biliar', 'Depuración', 'Colesterol (uso tradicional)'],
    preparacion: { temperatura: '90°C', tiempo: '8-10 min', cantidad: '1-2 cucharaditas por taza' },
    contraindicaciones: ['Obstrucción de vías biliares', 'Cálculos biliares', 'Alergia a Asteraceae', 'Embarazo en dosis altas'],
    combinaCon: ['Boldo', 'Diente de León', 'Limón'],
  },
  {
    nombre: 'Bardana',
    nombreCientifico: 'Arctium lappa',
    partePlanta: 'Raíz',
    familia: 'Depurativa / Diurética',
    descripcion: 'Planta bianual nativa de Europa y Asia. Su raíz, comestible en Japón (gobo), se usa en fitoterapia como depurativo clásico, especialmente vinculado al bienestar cutáneo.',
    usosTradicionales: ['Depuración cutánea', 'Bienestar de la piel', 'Drenaje hepático', 'Bienestar articular'],
    preparacion: { temperatura: '95°C', tiempo: '10-15 min', cantidad: '1 cucharadita de raíz seca por taza' },
    contraindicaciones: ['Embarazo', 'Diabetes (puede afectar glucemia)', 'Alergia a Asteraceae', 'Interacciones con anticoagulantes'],
    combinaCon: ['Diente de León', 'Ortiga', 'Cola de Caballo'],
  },
  {
    nombre: 'Gayuba',
    nombreCientifico: 'Arctostaphylos uva-ursi',
    partePlanta: 'Hojas',
    familia: 'Depurativa / Diurética',
    descripcion: 'Arbusto rastrero de montaña muy extendido en Europa. Sabor amargo y astringente. Muy utilizado en fitoterapia para el bienestar del tracto urinario.',
    usosTradicionales: ['Bienestar del tracto urinario', 'Cistitis recurrente (preventivo tradicional)', 'Acción antiséptica urinaria suave'],
    preparacion: { temperatura: '90°C', tiempo: '10-15 min', cantidad: '1 cucharadita por taza' },
    contraindicaciones: ['Embarazo', 'Lactancia', 'Niños', 'Enfermedades renales', 'No usar más de 1-2 semanas seguidas'],
    combinaCon: ['Cola de Caballo', 'Ortiga', 'Abedul'],
  },

  // ── RESPIRATORIA ────────────────────────────────────────────────────────────
  {
    nombre: 'Tomillo',
    nombreCientifico: 'Thymus vulgaris',
    partePlanta: 'Hojas y flores',
    familia: 'Respiratoria',
    descripcion: 'Planta aromática mediterránea omnipresente en la cocina española. Aroma intenso, terroso y herbáceo. Larga tradición en fitoterapia para las vías respiratorias.',
    usosTradicionales: ['Tos y catarro', 'Bronquitis leve', 'Expectoración', 'Antiséptico bucal (enjuague)'],
    preparacion: { temperatura: '95°C', tiempo: '8-10 min', cantidad: '1 cucharadita por taza' },
    contraindicaciones: ['Embarazo en dosis altas (estimulante uterino)', 'Alergia a lamiáceas', 'Hipertiroidismo'],
    combinaCon: ['Eucalipto', 'Regaliz', 'Jengibre'],
  },
  {
    nombre: 'Eucalipto',
    nombreCientifico: 'Eucalyptus globulus',
    partePlanta: 'Hojas',
    familia: 'Respiratoria',
    descripcion: 'Árbol originario de Australia, ampliamente cultivado en España (Galicia, Asturias). Su aceite esencial cineol le da el característico olor mentolado e intenso.',
    usosTradicionales: ['Congestión nasal y respiratoria', 'Catarro y gripe', 'Tos mucosa', 'Inhalaciones para vías respiratorias'],
    preparacion: { temperatura: '90°C', tiempo: '5-8 min', cantidad: '2-3 hojas secas por taza' },
    contraindicaciones: ['Niños menores de 6 años', 'Embarazo', 'Asma (puede irritar a algunos pacientes)', 'Insuficiencia hepática grave'],
    combinaCon: ['Tomillo', 'Poleo', 'Saúco'],
  },
  {
    nombre: 'Poleo',
    nombreCientifico: 'Mentha pulegium',
    partePlanta: 'Hojas y flores',
    familia: 'Respiratoria',
    descripcion: 'Variedad de menta con aroma muy intenso y fresco, con matices mentolados pronunciados. Muy popular en Andalucía y otras regiones del sur de España.',
    usosTradicionales: ['Catarro y congestión', 'Tos', 'Digestión pesada', 'Expectoración'],
    preparacion: { temperatura: '90°C', tiempo: '5-7 min', cantidad: '1 cucharadita por taza' },
    contraindicaciones: ['Embarazo (abortivo en dosis altas)', 'Lactancia', 'Niños menores de 6 años', 'Enfermedades hepáticas', 'No usar en grandes cantidades'],
    combinaCon: ['Tomillo', 'Eucalipto', 'Manzanilla'],
  },
  {
    nombre: 'Saúco',
    nombreCientifico: 'Sambucus nigra',
    partePlanta: 'Flores',
    familia: 'Respiratoria',
    descripcion: 'Arbusto muy extendido en Europa. Sus flores blancas tienen aroma floral y dulce. Las flores son la parte segura para infusión; las bayas crudas y otras partes pueden ser tóxicas.',
    usosTradicionales: ['Catarro y resfriado', 'Fiebre moderada (diaforético)', 'Tos', 'Congestión nasal', 'Bienestar inmune tradicional'],
    preparacion: { temperatura: '90°C', tiempo: '5-8 min', cantidad: '1-2 cucharaditas de flores secas' },
    contraindicaciones: ['No consumir bayas crudas, corteza ni hojas (tóxicas)', 'Embarazo', 'Enfermedades autoinmunes (puede estimular sistema inmune)'],
    combinaCon: ['Tomillo', 'Jengibre', 'Rosa mosqueta'],
  },
  {
    nombre: 'Llantén',
    nombreCientifico: 'Plantago major',
    partePlanta: 'Hojas',
    familia: 'Respiratoria',
    descripcion: 'Planta silvestre muy común en Europa, crece en caminos y praderas. Sabor herbáceo y suave. Sus mucílagos tienen efecto calmante sobre las mucosas respiratorias y digestivas.',
    usosTradicionales: ['Tos seca e irritativa', 'Irritación de garganta', 'Bronquitis leve', 'Mucosas inflamadas'],
    preparacion: { temperatura: '90°C', tiempo: '8-10 min', cantidad: '1-2 cucharaditas por taza' },
    contraindicaciones: ['Alergia a plantagináceas', 'Estreñimiento severo (mucílagos pueden agravar)'],
    combinaCon: ['Malvavisco', 'Tomillo', 'Gordolobo'],
  },
  {
    nombre: 'Malvavisco',
    nombreCientifico: 'Althaea officinalis',
    partePlanta: 'Raíz',
    familia: 'Respiratoria',
    descripcion: 'Raíz rica en mucílagos que forman un gel suave al hidratarse. El dulce marshmallow original se fabricaba con ella. Sabor suave y mucilaginoso, muy reconfortante.',
    usosTradicionales: ['Tos seca y garganta irritada', 'Gastritis y acidez', 'Irritación de mucosas digestivas y respiratorias'],
    preparacion: { temperatura: '40-60°C (templada o fría)', tiempo: '30-60 min en frío o 10 min en templado', cantidad: '1-2 cucharaditas de raíz picada' },
    contraindicaciones: ['Diabetes (puede interferir con medicación hipoglucemiante)', 'Tomar alejado de otros medicamentos (retrasa su absorción)'],
    combinaCon: ['Llantén', 'Tomillo', 'Regaliz'],
  },
  {
    nombre: 'Gordolobo',
    nombreCientifico: 'Verbascum thapsus',
    partePlanta: 'Flores',
    familia: 'Respiratoria',
    descripcion: 'Planta bianual de gran porte con flores amarillas, común en baldíos y bordes de caminos. Sabor suave y levemente mucilaginoso. Utilizada para la tos y la bronquitis.',
    usosTradicionales: ['Tos y bronquitis leve', 'Expectoración', 'Irritación de garganta', 'Catarro'],
    preparacion: { temperatura: '90°C', tiempo: '8-10 min', cantidad: '1-2 cucharaditas (filtrar bien los pelillos)' },
    contraindicaciones: ['Embarazo', 'Filtrar siempre bien (los tricomas pueden irritar la garganta)'],
    combinaCon: ['Llantén', 'Malvavisco', 'Tomillo'],
  },

  // ── ANTIINFLAMATORIA ────────────────────────────────────────────────────────
  {
    nombre: 'Jengibre',
    nombreCientifico: 'Zingiber officinale',
    partePlanta: 'Rizoma',
    familia: 'Antiinflamatoria',
    descripcion: 'Rizoma originario del sur de Asia, indispensable en la cocina oriental. Sabor picante, cálido y ligeramente cítrico. Una de las plantas más versátiles y estudiadas.',
    usosTradicionales: ['Náuseas y mareos', 'Resfriados y gripe', 'Bienestar articular', 'Digestión', 'Circulación y calentamiento corporal'],
    preparacion: { temperatura: '95-100°C', tiempo: '10-15 min', cantidad: '1-2 rodajas frescas o 1 cucharadita de polvo' },
    contraindicaciones: ['Cálculos biliares', 'Interacciones con anticoagulantes', 'Dosis altas en embarazo', 'Reflujo severo en personas sensibles'],
    combinaCon: ['Cúrcuma', 'Limón', 'Miel', 'Canela'],
  },
  {
    nombre: 'Cúrcuma',
    nombreCientifico: 'Curcuma longa',
    partePlanta: 'Rizoma',
    familia: 'Antiinflamatoria',
    descripcion: 'Responsable del color amarillo del curry. La curcumina, su principio activo, está siendo estudiada intensamente. Sabor terroso, ligeramente amargo y picante.',
    usosTradicionales: ['Bienestar articular', 'Digestión', 'Bienestar hepático', 'Antioxidante', 'Bienestar general'],
    preparacion: { temperatura: '95°C', tiempo: '10 min', cantidad: '1 cucharadita de polvo por taza (añadir pimienta negra mejora absorción)' },
    contraindicaciones: ['Obstrucción biliar', 'Cálculos biliares', 'Interacciones con anticoagulantes', 'Dosis altas en embarazo'],
    combinaCon: ['Jengibre', 'Pimienta negra', 'Canela'],
  },
  {
    nombre: 'Romero',
    nombreCientifico: 'Salvia rosmarinus',
    partePlanta: 'Hojas y ramas tiernas',
    familia: 'Antiinflamatoria',
    descripcion: 'Planta aromática mediterránea icónica. Sabor resinoso, cálido y pronunciado. Muy valorada tanto en cocina española como en fitoterapia por su contenido en ácido rosmarínico.',
    usosTradicionales: ['Bienestar circulatorio', 'Fatiga y decaimiento', 'Memoria y concentración', 'Bienestar muscular y articular'],
    preparacion: { temperatura: '90°C', tiempo: '5-8 min', cantidad: '1 ramita fresca o 1 cucharadita seca' },
    contraindicaciones: ['Embarazo en dosis altas', 'Epilepsia', 'Hipertensión', 'No en grandes cantidades'],
    combinaCon: ['Tomillo', 'Lavanda', 'Salvia'],
  },
  {
    nombre: 'Salvia',
    nombreCientifico: 'Salvia officinalis',
    partePlanta: 'Hojas',
    familia: 'Antiinflamatoria',
    descripcion: 'Nombre derivado del latín "salvare" (salvar). Sabor fuerte, terroso y levemente amargo. Una de las plantas medicinales más utilizadas en Europa durante siglos.',
    usosTradicionales: ['Bienestar de garganta y mucosas', 'Sudoración excesiva', 'Sofocos de la menopausia', 'Digestión pesada', 'Antiséptico bucal (enjuague)'],
    preparacion: { temperatura: '90°C', tiempo: '5-8 min', cantidad: '1 cucharadita de hojas secas por taza' },
    contraindicaciones: ['Embarazo (estimulante uterino)', 'Lactancia (puede reducir producción de leche)', 'Epilepsia', 'No usar prolongadamente en grandes cantidades'],
    combinaCon: ['Romero', 'Tomillo', 'Limón'],
  },
  {
    nombre: 'Ulmaria',
    nombreCientifico: 'Filipendula ulmaria',
    partePlanta: 'Flores y sumidades floridas',
    familia: 'Antiinflamatoria',
    descripcion: 'Planta de zonas húmedas europeas con aroma delicado y almendrado. Contiene salicilatos naturales, los precursores naturales de la aspirina. Sabor suave y floral.',
    usosTradicionales: ['Dolor articular leve', 'Bienestar digestivo', 'Fiebre leve', 'Acidez (los salicilatos protegen la mucosa)'],
    preparacion: { temperatura: '85°C', tiempo: '8-10 min', cantidad: '1-2 cucharaditas por taza' },
    contraindicaciones: ['Alergia a la aspirina o salicilatos', 'Anticoagulantes', 'Embarazo', 'Úlcera gástrica activa'],
    combinaCon: ['Jengibre', 'Menta piperita', 'Limón'],
  },
  {
    nombre: 'Caléndula',
    nombreCientifico: 'Calendula officinalis',
    partePlanta: 'Flores',
    familia: 'Antiinflamatoria',
    descripcion: 'Planta anual de brillantes flores naranjas, muy cultivada en jardines europeos. Sabor suave y ligeramente amargo. Más conocida en uso tópico, pero también se usa en infusión.',
    usosTradicionales: ['Irritación de mucosas digestivas', 'Bienestar menstrual', 'Cicatrización (uso tópico)', 'Inflamación digestiva leve'],
    preparacion: { temperatura: '90°C', tiempo: '8-10 min', cantidad: '1-2 cucharaditas de flores secas' },
    contraindicaciones: ['Alergia a Asteraceae', 'Embarazo (estimulante uterino)', 'Interacciones con sedantes'],
    combinaCon: ['Manzanilla', 'Melisa', 'Lavanda'],
  },
  {
    nombre: 'Sauce Blanco',
    nombreCientifico: 'Salix alba',
    partePlanta: 'Corteza',
    familia: 'Antiinflamatoria',
    descripcion: 'Árbol de ribera europeo cuya corteza contiene salicina, precursor natural del ácido acetilsalicílico (aspirina). Sabor amargo e intenso; se combina con otras plantas.',
    usosTradicionales: ['Dolor y fiebre (uso tradicional)', 'Bienestar articular', 'Cefaleas leves', 'Inflamación general'],
    preparacion: { temperatura: '95-100°C', tiempo: '15-20 min (decocción)', cantidad: '1-2 cucharaditas de corteza seca' },
    contraindicaciones: ['Alergia a la aspirina o salicilatos', 'Niños menores de 16 años (riesgo síndrome Reye)', 'Anticoagulantes', 'Embarazo', 'Úlcera gástrica'],
    combinaCon: ['Jengibre', 'Ulmaria', 'Menta piperita'],
  },

  // ── ANTIOXIDANTE ────────────────────────────────────────────────────────────
  {
    nombre: 'Rosa mosqueta',
    nombreCientifico: 'Rosa canina',
    partePlanta: 'Frutos (escaramujos)',
    familia: 'Antioxidante',
    descripcion: 'Los escaramujos son los frutos del rosal silvestre, de color rojo-naranja brillante. Una de las fuentes vegetales más ricas en vitamina C. Sabor ácido y afrutado.',
    usosTradicionales: ['Aporte de vitamina C', 'Bienestar inmune', 'Antioxidante', 'Bienestar articular', 'Convalecencia'],
    preparacion: { temperatura: '95°C', tiempo: '10-15 min', cantidad: '1-2 cucharaditas de frutos secos triturados' },
    contraindicaciones: ['Interacciones con anticoagulantes en grandes cantidades', 'Cálculos renales de oxalato (limitar en exceso)'],
    combinaCon: ['Hibisco', 'Canela', 'Jengibre'],
  },
  {
    nombre: 'Hibisco',
    nombreCientifico: 'Hibiscus sabdariffa',
    partePlanta: 'Cálices florales',
    familia: 'Antioxidante',
    descripcion: 'Los cálices rojos del hibisco dan una infusión carmesí con sabor ácido y afrutado. Muy popular en África, Caribe y México (agua de jamaica). Rico en antocianinas.',
    usosTradicionales: ['Antioxidante', 'Bienestar cardiovascular', 'Drenaje y depuración', 'Bienestar digestivo', 'Refrescante caliente o frío'],
    preparacion: { temperatura: '95°C', tiempo: '5-8 min', cantidad: '1-2 cucharaditas por taza' },
    contraindicaciones: ['Hipotensión (puede bajar la tensión)', 'Embarazo en grandes cantidades', 'Interacciones con antihipertensivos y antiretrovirales'],
    combinaCon: ['Rosa mosqueta', 'Jengibre', 'Canela'],
  },
  {
    nombre: 'Rooibos',
    nombreCientifico: 'Aspalathus linearis',
    partePlanta: 'Hojas y ramas',
    familia: 'Antioxidante',
    descripcion: '"Arbusto rojo" en afrikáans. Endémico de Sudáfrica. Sin teína, sabor dulce y avainillado. Muy apreciado como alternativa al té para quienes evitan la cafeína.',
    usosTradicionales: ['Antioxidante sin cafeína', 'Bienestar digestivo suave', 'Descanso (sin teína)', 'Hidratación saludable'],
    preparacion: { temperatura: '95-100°C', tiempo: '5-8 min', cantidad: '1-2 cucharaditas por taza' },
    contraindicaciones: ['Sin contraindicaciones destacables conocidas'],
    combinaCon: ['Canela', 'Vainilla', 'Cardamomo'],
  },
  {
    nombre: 'Canela',
    nombreCientifico: 'Cinnamomum verum',
    partePlanta: 'Corteza interior seca',
    familia: 'Antioxidante',
    descripcion: 'Una de las especias más antiguas del mundo. La canela de Ceilán es más delicada que la cassia. Sabor cálido, dulce y especiado. Ideal sola o para aromatizar otras infusiones.',
    usosTradicionales: ['Antioxidante', 'Bienestar metabólico (glucemia)', 'Digestión', 'Calentamiento y circulación'],
    preparacion: { temperatura: '95°C', tiempo: '8-10 min (rama) o 5 min (polvo)', cantidad: '1 rama o ½ cucharadita de polvo por taza' },
    contraindicaciones: ['Cassia en grandes cantidades: contiene cumarina (hepatotóxica)', 'Embarazo en dosis altas', 'Anticoagulantes en grandes cantidades'],
    combinaCon: ['Jengibre', 'Anís estrellado', 'Cardamomo'],
  },
  {
    nombre: 'Moringa',
    nombreCientifico: 'Moringa oleifera',
    partePlanta: 'Hojas',
    familia: 'Antioxidante',
    descripcion: 'Conocido como "el árbol de la vida". Originario del norte de India. Sus hojas son extraordinariamente ricas en vitaminas, minerales y aminoácidos. Sabor herbáceo y ligeramente amargo.',
    usosTradicionales: ['Antioxidante y aporte nutricional', 'Bienestar energético', 'Bienestar general', 'Usos tradicionales varios'],
    preparacion: { temperatura: '80-85°C', tiempo: '5-7 min', cantidad: '1 cucharadita de polvo o 1-2 cucharaditas de hojas secas' },
    contraindicaciones: ['Embarazo (raíz y corteza son abortivas; hojas más seguras, con precaución)', 'Interacciones con antitiroideos', 'Interacciones con medicamentos para diabetes'],
    combinaCon: ['Jengibre', 'Limón', 'Hibisco'],
  },
  {
    nombre: 'Cascarilla de Cacao',
    nombreCientifico: 'Theobroma cacao',
    partePlanta: 'Cáscara del fruto',
    familia: 'Antioxidante',
    descripcion: 'Subproducto de la fabricación del chocolate. Sabor suave y chocolateado sin el amargor del cacao puro. Rica en teobromina y antioxidantes. Tendencia creciente en España.',
    usosTradicionales: ['Antioxidante', 'Bienestar cardiovascular', 'Energía suave sin nerviosismo', 'Bienestar digestivo suave'],
    preparacion: { temperatura: '95°C', tiempo: '8-10 min', cantidad: '1 cucharada de cascarilla por taza' },
    contraindicaciones: ['Sensibilidad a la teobromina o cafeína', 'Migraña (desencadenante en personas sensibles)'],
    combinaCon: ['Canela', 'Cardamomo', 'Vainilla'],
  },

  // ── ADAPTÓGENA / ENERGÉTICA ─────────────────────────────────────────────────
  {
    nombre: 'Ashwagandha',
    nombreCientifico: 'Withania somnifera',
    partePlanta: 'Raíz',
    familia: 'Adaptógena / Energética',
    descripcion: 'Planta central de la medicina ayurvédica india, llamada "ginseng indio". Considerada adaptógena: ayuda al organismo a gestionar el estrés. Sabor terroso y ligeramente amargo.',
    usosTradicionales: ['Bienestar en situaciones de estrés', 'Energía y vitalidad', 'Bienestar cognitivo', 'Bienestar hormonal', 'Recuperación física'],
    preparacion: { temperatura: '95°C', tiempo: '10-15 min', cantidad: '1 cucharadita de polvo de raíz por taza' },
    contraindicaciones: ['Embarazo', 'Enfermedades autoinmunes (lupus, AR, esclerosis múltiple)', 'Tiroides (puede alterar niveles)', 'Interacciones con sedantes e inmunosupresores'],
    combinaCon: ['Cúrcuma', 'Canela', 'Miel'],
  },
  {
    nombre: 'Ginseng',
    nombreCientifico: 'Panax ginseng',
    partePlanta: 'Raíz',
    familia: 'Adaptógena / Energética',
    descripcion: 'Considerado "panacea" en la medicina tradicional china desde hace más de 2000 años. Sabor amargo, terroso y ligeramente dulce. Una de las plantas más estudiadas científicamente.',
    usosTradicionales: ['Energía y rendimiento físico', 'Concentración y memoria', 'Bienestar en estrés', 'Vitalidad general', 'Sistema inmune'],
    preparacion: { temperatura: '95°C', tiempo: '10-15 min', cantidad: '1 cucharadita de raíz seca' },
    contraindicaciones: ['No combinar con anticoagulantes', 'Diabetes (afecta glucemia)', 'Hipertensión', 'Insomnio si se toma tarde', 'Embarazo', 'No usar más de 3 meses seguidos sin descanso'],
    combinaCon: ['Jengibre', 'Miel', 'Té verde'],
  },
  {
    nombre: 'Rhodiola',
    nombreCientifico: 'Rhodiola rosea',
    partePlanta: 'Raíz',
    familia: 'Adaptógena / Energética',
    descripcion: 'Crece en alturas árticas y montañosas. Usada por pueblos escandinavos y siberianos para resistir el frío y el estrés. Sabor ligeramente amargo y astringente.',
    usosTradicionales: ['Fatiga y agotamiento', 'Rendimiento mental en estrés', 'Estado de ánimo', 'Energía y vitalidad', 'Resistencia física'],
    preparacion: { temperatura: '90°C', tiempo: '10 min', cantidad: '1 cucharadita de raíz seca por taza' },
    contraindicaciones: ['Embarazo', 'Trastorno bipolar (puede desencadenar manía)', 'No combinar con antidepresivos sin supervisión'],
    combinaCon: ['Ashwagandha', 'Ginseng', 'Menta piperita'],
  },
  {
    nombre: 'Maca',
    nombreCientifico: 'Lepidium meyenii',
    partePlanta: 'Hipocótilo (raíz engrosada)',
    familia: 'Adaptógena / Energética',
    descripcion: 'Planta andina cultivada en Perú a más de 4000 m de altitud desde hace milenios. Sabor terroso y ligeramente malteado. Muy popular en nutrición deportiva y bienestar hormonal.',
    usosTradicionales: ['Energía y resistencia', 'Bienestar hormonal y sexual', 'Fertilidad (uso tradicional)', 'Rendimiento físico', 'Estado de ánimo en menopausia'],
    preparacion: { temperatura: '85-90°C', tiempo: '5-8 min', cantidad: '1-2 cucharaditas de polvo por taza' },
    contraindicaciones: ['Embarazo (falta de estudios)', 'Enfermedades hormono-dependientes (cáncer de mama, endometriosis)', 'Hipertensión en grandes cantidades'],
    combinaCon: ['Cascarilla de Cacao', 'Canela'],
  },
  {
    nombre: 'Schisandra',
    nombreCientifico: 'Schisandra chinensis',
    partePlanta: 'Frutos',
    familia: 'Adaptógena / Energética',
    descripcion: 'Conocida en chino como "wu wei zi" (fruto de los cinco sabores): ácido, dulce, amargo, picante y salado simultáneamente. Planta adaptógena fundamental de la MTC.',
    usosTradicionales: ['Bienestar hepático', 'Resistencia al estrés', 'Vitalidad y energía', 'Concentración mental', 'Bienestar cutáneo'],
    preparacion: { temperatura: '90°C', tiempo: '10-15 min', cantidad: '1 cucharadita de frutos secos por taza' },
    contraindicaciones: ['Embarazo', 'Hipertensión intracraneal', 'Epilepsia', 'Interacciones con medicamentos hepáticos'],
    combinaCon: ['Ginseng', 'Ashwagandha', 'Rosa mosqueta'],
  },
  {
    nombre: 'Ginseng siberiano',
    nombreCientifico: 'Eleutherococcus senticosus',
    partePlanta: 'Raíz',
    familia: 'Adaptógena / Energética',
    descripcion: 'Pese al nombre, no pertenece al género Panax. Arbusto del noreste de Asia con propiedades adaptógenas bien documentadas. Sabor suave y ligeramente amargo.',
    usosTradicionales: ['Energía y resistencia al estrés', 'Bienestar inmune', 'Rendimiento físico y mental', 'Convalecencia y recuperación'],
    preparacion: { temperatura: '95°C', tiempo: '10-15 min', cantidad: '1 cucharadita de raíz seca por taza' },
    contraindicaciones: ['Embarazo', 'Hipertensión', 'No combinar con digoxina', 'Enfermedades autoinmunes', 'Insomnio si se toma tarde'],
    combinaCon: ['Ginseng', 'Rhodiola', 'Jengibre'],
  },
];

export default function GuiaInfusiones() {
  const [busqueda, setBusqueda] = useState('');
  const [familiaActiva, setFamiliaActiva] = useState<Familia | 'Todas'>('Todas');

  const infusionesFiltradas = useMemo(() => {
    const termino = busqueda.toLowerCase().trim();
    return INFUSIONES.filter((inf) => {
      const coincideFamilia = familiaActiva === 'Todas' || inf.familia === familiaActiva;
      const coincideBusqueda =
        !termino ||
        inf.nombre.toLowerCase().includes(termino) ||
        inf.nombreCientifico.toLowerCase().includes(termino) ||
        inf.usosTradicionales.some((u) => u.toLowerCase().includes(termino)) ||
        inf.descripcion.toLowerCase().includes(termino);
      return coincideFamilia && coincideBusqueda;
    });
  }, [busqueda, familiaActiva]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Guía de Infusiones</h1>
        <p>55 plantas medicinales: usos tradicionales, preparación y contraindicaciones</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <div className={styles.controles}>
          <input
            type="search"
            placeholder="Buscar infusión o uso tradicional..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={styles.buscador}
            aria-label="Buscar infusión"
          />
          <div className={styles.filtros} role="group" aria-label="Filtrar por familia">
            <button
              className={`${styles.filtroBtn} ${familiaActiva === 'Todas' ? styles.filtroActivo : ''}`}
              onClick={() => setFamiliaActiva('Todas')}
            >
              Todas
            </button>
            {FAMILIAS.map((f) => (
              <button
                key={f}
                className={`${styles.filtroBtn} ${familiaActiva === f ? styles.filtroActivo : ''}`}
                onClick={() => setFamiliaActiva(f)}
              >
                {FAMILIA_ICONOS[f]} {f}
              </button>
            ))}
          </div>
          <p className={styles.contador} aria-live="polite">
            {infusionesFiltradas.length}{' '}
            {infusionesFiltradas.length === 1 ? 'infusión' : 'infusiones'}
          </p>
        </div>

        <div className={styles.grid}>
          {infusionesFiltradas.map((inf) => (
            <article key={inf.nombre} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={`${styles.familiaBadge} ${getFamiliaClass(inf.familia)}`}>
                  {FAMILIA_ICONOS[inf.familia]} {inf.familia}
                </span>
                <span className={styles.partePlanta}>🌱 {inf.partePlanta}</span>
              </div>

              <h2 className={styles.nombre}>{inf.nombre}</h2>
              <p className={styles.nombreCientifico}>{inf.nombreCientifico}</p>
              <p className={styles.descripcion}>{inf.descripcion}</p>

              <div className={styles.usosSection}>
                <h3 className={styles.sectionLabel}>Usos tradicionales</h3>
                <div className={styles.usosTags}>
                  {inf.usosTradicionales.map((uso) => (
                    <span key={uso} className={styles.usoTag}>
                      {uso}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.preparacionGrid}>
                <div className={styles.prepItem}>
                  <span className={styles.prepIcon} aria-hidden="true">🌡️</span>
                  <span className={styles.prepLabel}>Temperatura</span>
                  <span className={styles.prepValor}>{inf.preparacion.temperatura}</span>
                </div>
                <div className={styles.prepItem}>
                  <span className={styles.prepIcon} aria-hidden="true">⏱️</span>
                  <span className={styles.prepLabel}>Tiempo</span>
                  <span className={styles.prepValor}>{inf.preparacion.tiempo}</span>
                </div>
                <div className={styles.prepItem}>
                  <span className={styles.prepIcon} aria-hidden="true">🫖</span>
                  <span className={styles.prepLabel}>Cantidad</span>
                  <span className={styles.prepValor}>{inf.preparacion.cantidad}</span>
                </div>
              </div>

              {inf.contraindicaciones.length > 0 && (
                <div className={styles.contraindicaciones}>
                  <h3 className={styles.contraindicacionesLabel}>
                    <span aria-hidden="true">⚠️</span> Precauciones conocidas
                  </h3>
                  <ul className={styles.contraindicacionesList}>
                    {inf.contraindicaciones.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {inf.combinaCon.length > 0 && (
                <div className={styles.combinaciones}>
                  <span className={styles.combinaLabel}>Combina bien con:</span>
                  <div className={styles.combinaTags}>
                    {inf.combinaCon.map((c) => (
                      <span key={c} className={styles.combinaTag}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}
          {infusionesFiltradas.length === 0 && (
            <p className={styles.sinResultados}>
              No se encontraron infusiones con esos criterios.
            </p>
          )}
        </div>
      </main>

      <DisclaimerCard variant="medical" severity="medium" collapsible={true} />

      <EducationalSection
        title="Todo sobre las infusiones de plantas"
        subtitle="Familias, preparación perfecta, usos tradicionales y precauciones"
      >
        <p>
          Las infusiones de plantas son una de las prácticas más antiguas y extendidas de la
          humanidad. Desde el té verde de la China imperial hasta la manzanilla de las abuelas
          españolas, cada cultura ha desarrollado su propio repertorio de plantas para preparar
          bebidas calientes con fines tanto nutritivos como de bienestar. Hoy, el interés por la
          fitoterapia ha resurgido con fuerza respaldado por investigaciones científicas que
          comienzan a documentar lo que la tradición popular conocía desde hace siglos.
        </p>
        <p>
          Es importante distinguir entre "usos tradicionales" y "tratamientos médicos probados".
          Muchas plantas tienen una larga historia de uso popular y algunas evidencias científicas
          preliminares, pero esto no equivale a que estén clínicamente validadas para tratar
          enfermedades. La infusión de tomillo para la tos o la tila para el nerviosismo son
          remedios culturalmente transmitidos que pueden complementar el bienestar cotidiano,
          pero nunca deben sustituir al consejo médico profesional.
        </p>

        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <caption>Comparativa de familias de infusiones</caption>
            <thead>
              <tr>
                <th>Familia</th>
                <th>Para qué se usa</th>
                <th>Momento ideal</th>
                <th>Ejemplos típicos</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>🌿 Digestiva</td>
                <td>Pesadez, gases, digestión lenta</td>
                <td>Tras las comidas</td>
                <td>Manzanilla, hinojo, menta</td>
              </tr>
              <tr>
                <td>🌙 Relajante</td>
                <td>Nerviosismo, insomnio, ansiedad leve</td>
                <td>Tarde-noche</td>
                <td>Tila, valeriana, melisa</td>
              </tr>
              <tr>
                <td>⚡ Estimulante</td>
                <td>Energía, concentración, alerta</td>
                <td>Mañana, mediodía</td>
                <td>Té verde, yerba mate</td>
              </tr>
              <tr>
                <td>💧 Depurativa</td>
                <td>Drenaje, retención de líquidos</td>
                <td>Mañana en ayunas</td>
                <td>Diente de León, cola de caballo</td>
              </tr>
              <tr>
                <td>🌬️ Respiratoria</td>
                <td>Tos, catarro, congestión</td>
                <td>Ante síntomas</td>
                <td>Tomillo, eucalipto, poleo</td>
              </tr>
              <tr>
                <td>🔥 Antiinflamatoria</td>
                <td>Articulaciones, dolores leves, fiebre</td>
                <td>Según necesidad</td>
                <td>Jengibre, cúrcuma, salvia</td>
              </tr>
              <tr>
                <td>✨ Antioxidante</td>
                <td>Protección celular, vitamina C</td>
                <td>Cualquier momento</td>
                <td>Hibisco, rosa mosqueta, rooibos</td>
              </tr>
              <tr>
                <td>🌱 Adaptógena</td>
                <td>Estrés crónico, energía sostenida</td>
                <td>Mañana, mediodía</td>
                <td>Ashwagandha, ginseng, rhodiola</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>¿Para qué perfil es cada familia?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <strong>👩‍💼 Persona con vida estresante</strong>
            <p>
              Las familias Relajante y Adaptógena son un buen punto de partida. La tila o la
              melisa por la tarde; el ashwagandha o la rhodiola por la mañana para gestionar el
              estrés de fondo.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>🥗 Persona con problemas digestivos</strong>
            <p>
              Las infusiones Digestivas tras cada comida: manzanilla, hinojo o menta piperita
              según el síntoma. Boldo o alcachofa si hay pesadez hepática.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>🤧 Persona con catarros frecuentes</strong>
            <p>
              La familia Respiratoria es aliada en temporada de frío: tomillo, saúco o poleo ante
              los primeros síntomas, acompañados de rosa mosqueta para el aporte de vitamina C.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>☕ Persona que quiere reducir el café</strong>
            <p>
              Té verde o té negro para una energía más suave y sostenida. Si se quiere eliminar
              la cafeína, el rooibos tiene sabor agradable sin teína. La yerba mate si se quiere
              un impulso más potente.
            </p>
          </div>
        </div>

        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Cuántas infusiones se pueden tomar al día?</strong>
            <p>
              En general, 2-3 tazas diarias de una misma planta es un límite razonable para uso
              cotidiano. Algunas plantas (valeriana, gayuba, sauce blanco) requieren periodos de
              descanso. Consultar siempre el apartado de contraindicaciones de cada planta.
            </p>
            <span className={styles.faqTip}>
              💡 Variar las plantas según la temporada es una práctica tradicional sabia.
            </span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué es importante la temperatura del agua?</strong>
            <p>
              La temperatura determina qué compuestos se extraen. El té verde a 100°C se vuelve
              amargo porque se liberan taninos en exceso. Las plantas con mucílagos (malvavisco,
              llantén) funcionan mejor en agua templada o fría. Respetar la temperatura indicada
              mejora el sabor y la extracción de los compuestos de interés.
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Infusión o decocción?</strong>
            <p>
              La infusión se hace vertiendo agua caliente sobre la planta y dejando reposar.
              La decocción consiste en hervir la planta directamente en el agua. Las partes duras
              (raíces, cortezas) suelen requerir decocción; las flores y hojas delicadas,
              infusión.
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Las infusiones son seguras en el embarazo?</strong>
            <p>
              Muchas plantas tienen contraindicación en el embarazo (valeriana, poleo, tomillo en
              dosis altas, regaliz...). Consultar siempre con el médico o matrona antes de tomar
              cualquier infusión durante el embarazo. Las más seguras suelen ser manzanilla,
              melisa o jengibre en dosis moderadas, pero siempre con supervisión.
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Las infusiones pueden interactuar con medicamentos?</strong>
            <p>
              Sí. Valeriana y melisa pueden potenciar sedantes. La salvia puede reducir la
              producción de leche y tiene efecto estrogénico. El jengibre y la ulmaria interactúan
              con anticoagulantes. El espino blanco interactúa con digitálicos. Consultar siempre
              al farmacéutico si se toma medicación habitual.
            </p>
            <span className={styles.faqTip}>
              ⚠️ Tener especial precaución con anticoagulantes, hipoglucemiantes y sedantes.
            </span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Las plantas adaptógenas son para uso diario?</strong>
            <p>
              La tradición ayurvédica y la medicina china las usan en ciclos (por ejemplo, 3 meses
              de uso y 1 de descanso). El ginseng, en particular, no se recomienda de forma
              indefinida. La rhodiola se tolera bien en ciclos de 8-12 semanas. Siempre respetar
              los periodos de descanso indicados.
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Dónde comprar plantas de calidad?</strong>
            <p>
              Las herboristerías de confianza, farmacias con sección de fitoterapia y productores
              certificados son las mejores opciones. Buscar certificación BIO cuando sea posible.
              Evitar fuentes sin garantías de identidad botánica, especialmente para plantas
              como el saúco (donde la confusión entre partes puede ser problemática).
            </p>
          </li>
        </ul>

        <h3>Cómo preparar una infusión perfecta</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Usa agua de calidad</strong>
              <p>
                El agua filtrada o mineral suave mejora notablemente el sabor. El cloro del agua
                del grifo puede alterar los aromas delicados de flores y hojas.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Respeta la temperatura</strong>
              <p>
                Consulta la ficha de cada planta. El té verde a 75-80°C; raíces y cortezas a
                95-100°C. Un termómetro de cocina es una inversión útil si tomas infusiones
                con regularidad.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Tapa siempre el recipiente</strong>
              <p>
                Muchos compuestos volátiles (aceites esenciales) se evaporan con el vapor. Tapar
                la taza durante la infusión preserva el aroma y los compuestos activos.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Controla el tiempo</strong>
              <p>
                Más tiempo no siempre es mejor. El té verde se vuelve amargo después de 3 minutos;
                la valeriana necesita 10-15 minutos para extraer sus principios activos. Sigue las
                indicaciones de cada planta.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Filtra con cuidado</strong>
              <p>
                Usa colador de malla fina, especialmente con plantas como el gordolobo (cuyos
                pelillos pueden irritar la garganta si no se filtra bien). Las bolsitas de
                infusión reutilizables son práctica y respetuosa con el medio ambiente.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>6</span>
            <div className={styles.stepContent}>
              <strong>Toma en el momento adecuado</strong>
              <p>
                Las digestivas, justo después de comer. Las relajantes, por la tarde o antes de
                dormir. Las estimulantes, por la mañana o a primera hora de la tarde. Las
                depurativas, en ayunas o entre comidas.
              </p>
            </div>
          </li>
        </ol>

        <h3>Consejos prácticos</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌿</span>
            <p>
              Guarda las plantas secas en botes de cristal oscuro, alejadas de la luz y la humedad.
              Duran hasta 1-2 años con la potencia completa.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">❄️</span>
            <p>
              Las infusiones de frutos (hibisco, rosa mosqueta) están deliciosas también en frío.
              Prepáralas concentradas, déjalas enfriar y sirve con hielo.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🍯</span>
            <p>
              Para endulzar, la miel es mejor que el azúcar (sobre todo local y cruda). El regaliz
              endulza de forma natural. La estevia añade dulzor sin calorías.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔄</span>
            <p>
              Varía las infusiones semanalmente. La diversidad botánica es beneficiosa y evita
              acostumbramiento o efectos acumulativos indeseados de una sola planta.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📏</span>
            <p>
              Más cantidad no siempre es mejor efecto. Muchas plantas tienen un rango óptimo;
              por encima de él los efectos pueden ser adversos (ej: valeriana en dosis altas
              puede causar más agitación, no menos).
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🏥</span>
            <p>
              Si tienes una condición médica o tomas medicación habitual, consulta siempre con
              tu médico o farmacéutico antes de incorporar nuevas plantas de forma regular.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes con las infusiones</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Creer que "natural" significa "sin riesgo":</strong> muchas plantas tienen
              contraindicaciones importantes y pueden interactuar con medicamentos.
            </li>
            <li>
              <strong>Usar dosis excesivas:</strong> duplicar la cantidad recomendada no duplica
              el beneficio y puede causar efectos indeseados.
            </li>
            <li>
              <strong>Tomar plantas sin consultar en embarazo:</strong> varias plantas comunes
              (poleo, salvia, tomillo en exceso) están contraindicadas durante el embarazo.
            </li>
            <li>
              <strong>Sustituir tratamientos médicos:</strong> las infusiones pueden complementar
              el bienestar cotidiano, pero no son un sustituto de la atención médica para
              enfermedades diagnosticadas.
            </li>
            <li>
              <strong>Confundir plantas similares:</strong> el saúco negro (flores seguras) puede
              confundirse con el saúco rojo (tóxico). Comprar siempre en herboristerías de
              confianza con identificación botánica garantizada.
            </li>
            <li>
              <strong>No informar al médico:</strong> muchos pacientes no mencionan el consumo
              de plantas medicinales al médico. Es información clínicamente relevante, especialmente
              antes de cirugías o con anticoagulantes.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('guia-infusiones')} />
      <ShareCard appName="guia-infusiones" />
      <Footer appName="guia-infusiones" />
    </div>
  );
}
