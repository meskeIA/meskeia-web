'use client';

import { useState, useMemo } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './QueCervezaElegir.module.css';

// ── Tipos ─────────────────────────────────────────────────────────────────

type Situacion = 'comida' | 'regalo' | 'bar' | 'ocasion' | 'probar';
type TipoCerveza = 'Ale' | 'Lager' | 'Híbrida' | 'Silvestre';

interface Cerveza {
  nombre: string;
  tipo: TipoCerveza;
  origen: string;
  perfilCorto: string;
  notasClave: string[];
  ibu: string;
  abv: string;
  maridajes: string[];
  ocasiones: string[];
  estilos: string[];
  presupuesto: string[];
  temperaturaServicio: string;
  porQue: string;
}

interface Recomendacion extends Cerveza {
  score: number;
  porcentaje: number;
}

// ── Catálogo de cervezas con tags ─────────────────────────────────────────

const CATALOGO: Cerveza[] = [
  {
    nombre: 'Pilsner (Checa)',
    tipo: 'Lager', origen: 'República Checa',
    perfilCorto: 'Lager dorada, refrescante, con amargor de lúpulo Saaz. La cerveza más copiada del mundo.',
    notasClave: ['Lúpulo floral', 'Cereal', 'Limpia'], ibu: '30-45', abv: '4.5%',
    maridajes: ['pollo', 'pescado', 'mariscos', 'ensalada', 'sushi', 'queso-suave'],
    ocasiones: ['aperitivo', 'terraza', 'comida-rapida', 'verano', 'cena-familiar', 'biergarten'],
    estilos: ['ligero', 'refrescante', 'equilibrado', 'amargo-suave'],
    presupuesto: ['economico', 'medio'],
    temperaturaServicio: '4–7 °C',
    porQue: 'La lager dorada por excelencia. Refrescante y limpia, va con casi todo: pollo, pescado, ensaladas o aperitivo veraniego.',
  },
  {
    nombre: 'Munich Helles',
    tipo: 'Lager', origen: 'Alemania (Múnich)',
    perfilCorto: 'Lager bávara suave, más maltosa que la Pilsner. La cerveza de la biergarten.',
    notasClave: ['Malta suave', 'Cereal', 'Pan'], ibu: '16-22', abv: '5%',
    maridajes: ['salchichas', 'pollo', 'pretzel', 'queso-suave', 'cerdo'],
    ocasiones: ['biergarten', 'cena-familiar', 'comida-rapida', 'primera-cerveza'],
    estilos: ['ligero', 'malta', 'accesible', 'equilibrado'],
    presupuesto: ['economico', 'medio'],
    temperaturaServicio: '4–7 °C',
    porQue: 'La cerveza más servida en las biergarten muniquesas. Suave, maltosa y accesible: ideal para iniciarse o para cenas en familia.',
  },
  {
    nombre: 'Märzen / Oktoberfest',
    tipo: 'Lager', origen: 'Alemania',
    perfilCorto: 'Lager ámbar tradicional del Oktoberfest. Malta tostada y cuerpo medio.',
    notasClave: ['Caramelo', 'Pan tostado', 'Malta'], ibu: '18-24', abv: '6%',
    maridajes: ['salchichas', 'pollo-asado', 'cerdo', 'pretzel', 'carne-asada', 'estofado'],
    ocasiones: ['cena-familiar', 'celebracion', 'biergarten', 'invierno'],
    estilos: ['medio', 'malta', 'equilibrado'],
    presupuesto: ['medio'],
    temperaturaServicio: '5–9 °C',
    porQue: 'La cerveza tradicional del Oktoberfest. Malta rica perfecta para salchichas, pollo asado o platos contundentes.',
  },
  {
    nombre: 'IPA (West Coast)',
    tipo: 'Ale', origen: 'EE.UU. (California)',
    perfilCorto: 'IPA clásica americana: lúpulo intenso, cítrico y resinoso, amargor pronunciado.',
    notasClave: ['Lúpulo cítrico', 'Pino', 'Pomelo'], ibu: '50-70', abv: '6.5%',
    maridajes: ['hamburguesas', 'queso-azul', 'picante', 'asiatico', 'mexicana', 'curry'],
    ocasiones: ['noche-amigos', 'after-work', 'regalo-cervecero', 'sobremesa'],
    estilos: ['amargo', 'lupulado', 'complejo', 'intenso'],
    presupuesto: ['medio', 'premium'],
    temperaturaServicio: '8–12 °C',
    porQue: 'La cerveza craft por antonomasia. Lúpulo cítrico que limpia el paladar entre bocados de hamburguesa, comida picante o queso azul.',
  },
  {
    nombre: 'NEIPA / Hazy IPA',
    tipo: 'Ale', origen: 'EE.UU. (Vermont)',
    perfilCorto: 'IPA turbia, jugosa, con amargor moderado y aromas explosivos a fruta tropical.',
    notasClave: ['Mango', 'Maracuyá', 'Durazno'], ibu: '40-65', abv: '6.5%',
    maridajes: ['pescado', 'sushi', 'fish-tacos', 'queso-cremoso', 'pollo-curry', 'asiatico'],
    ocasiones: ['noche-amigos', 'regalo-cervecero', 'descubrir', 'terraza', 'after-work'],
    estilos: ['aromatico', 'frutal', 'jugoso', 'medio'],
    presupuesto: ['medio', 'premium'],
    temperaturaServicio: '6–9 °C',
    porQue: 'El estilo craft de moda. Tropical y jugosa pero menos amarga que una IPA clásica. Excepcional con pescado, sushi o fish tacos.',
  },
  {
    nombre: 'Double IPA',
    tipo: 'Ale', origen: 'EE.UU. (California)',
    perfilCorto: 'IPA amplificada: lúpulo brutal, alcohol notorio, para paladares experimentados.',
    notasClave: ['Resina', 'Cítrico potente', 'Alcohol cálido'], ibu: '70-100', abv: '9%',
    maridajes: ['queso-azul', 'hamburguesa-grasa', 'picante-extremo', 'curry', 'BBQ-ahumado'],
    ocasiones: ['noche-amigos', 'regalo-cervecero', 'sobremesa'],
    estilos: ['fuerte', 'robusto', 'lupulado', 'intenso'],
    presupuesto: ['premium'],
    temperaturaServicio: '9–13 °C',
    porQue: 'Para los que aman el lúpulo intenso. Aguanta sabores brutales: queso azul, BBQ ahumado, comida india muy picante.',
  },
  {
    nombre: 'Stout (Irish)',
    tipo: 'Ale', origen: 'Irlanda',
    perfilCorto: 'Cerveza negra cremosa, café y cebada tostada. La cerveza del invierno por excelencia.',
    notasClave: ['Café', 'Chocolate', 'Cebada tostada'], ibu: '30-45', abv: '4.5%',
    maridajes: ['ostras', 'chocolate', 'postre-chocolate', 'carne-asada', 'estofado', 'asado'],
    ocasiones: ['cena-romantica', 'sobremesa', 'invierno', 'cena-familiar'],
    estilos: ['oscuro', 'cremoso', 'tostado', 'medio'],
    presupuesto: ['economico', 'medio'],
    temperaturaServicio: '10–13 °C',
    porQue: 'La cerveza negra clásica. Cremosa y tostada, perfecta para invierno, sobremesa larga o el clásico maridaje con ostras.',
  },
  {
    nombre: 'Imperial Stout',
    tipo: 'Ale', origen: 'Reino Unido / EE.UU.',
    perfilCorto: 'Stout amplificada: chocolate negro, espresso, fuerte. Casi un licor cervecero.',
    notasClave: ['Espresso', 'Chocolate negro', 'Ciruelas pasas'], ibu: '50-90', abv: '10%',
    maridajes: ['postre-chocolate', 'queso-azul', 'frutos-secos', 'tarta-chocolate'],
    ocasiones: ['postre', 'sobremesa', 'invierno', 'regalo-cervecero'],
    estilos: ['fuerte', 'complejo', 'oscuro', 'intenso'],
    presupuesto: ['premium'],
    temperaturaServicio: '12–16 °C',
    porQue: 'La cerveza más intensa del catálogo. Casi un licor: para sobremesa de invierno, tarta de chocolate o queso azul.',
  },
  {
    nombre: 'Porter',
    tipo: 'Ale', origen: 'Reino Unido',
    perfilCorto: 'Cerveza marrón oscura con notas de chocolate y café. Más suave que la Stout.',
    notasClave: ['Chocolate', 'Café', 'Caramelo'], ibu: '20-35', abv: '5%',
    maridajes: ['estofado', 'salmon-ahumado', 'postre-chocolate', 'queso-curado', 'carne-asada'],
    ocasiones: ['cena-familiar', 'sobremesa', 'invierno', 'comida-cotidiana'],
    estilos: ['medio', 'malta', 'tostado'],
    presupuesto: ['medio'],
    temperaturaServicio: '10–13 °C',
    porQue: 'Equilibrada y bebible. Maridaje seguro con estofados, salmón ahumado o un postre de chocolate moderado.',
  },
  {
    nombre: 'Hefeweizen',
    tipo: 'Ale', origen: 'Alemania (Baviera)',
    perfilCorto: 'Cerveza de trigo bávara con aromas a plátano y clavo. Refrescante y aromática.',
    notasClave: ['Plátano', 'Clavo', 'Trigo'], ibu: '8-15', abv: '5%',
    maridajes: ['bratwurst', 'ensalada', 'pescado', 'pollo', 'asiatico', 'brunch'],
    ocasiones: ['aperitivo', 'biergarten', 'terraza', 'brunch', 'primera-cerveza', 'verano'],
    estilos: ['ligero', 'aromatico', 'refrescante', 'frutal'],
    presupuesto: ['medio'],
    temperaturaServicio: '5–8 °C',
    porQue: 'Refrescante y aromática. Va con pescado, ensaladas, brunch o terraza estival. La cerveza para los que dicen "no me gusta la cerveza".',
  },
  {
    nombre: 'Witbier (Hoegaarden)',
    tipo: 'Ale', origen: 'Bélgica',
    perfilCorto: 'Cerveza belga de trigo con naranja y cilantro. Turbia, refrescante y especiada.',
    notasClave: ['Naranja', 'Cilantro', 'Trigo'], ibu: '10-20', abv: '4.8%',
    maridajes: ['marisco', 'ensalada', 'queso-suave', 'brunch', 'vegetariano', 'mejillones'],
    ocasiones: ['aperitivo', 'brunch', 'terraza', 'primera-cerveza', 'verano'],
    estilos: ['ligero', 'refrescante', 'citrico', 'aromatico'],
    presupuesto: ['economico', 'medio'],
    temperaturaServicio: '4–7 °C',
    porQue: 'Refrescante con un toque cítrico. Maridaje clásico: moules-frites belgas, ensalada con queso de cabra o brunch dominical.',
  },
  {
    nombre: 'Belgian Tripel',
    tipo: 'Ale', origen: 'Bélgica (trapense)',
    perfilCorto: 'Cerveza dorada belga fuerte, frutal y especiada. Engañosamente bebible para sus 8.5 °.',
    notasClave: ['Frutas tropicales', 'Especias', 'Pimienta blanca'], ibu: '20-40', abv: '8.5%',
    maridajes: ['pollo-curry', 'marisco-ajillo', 'gambas', 'queso-suave'],
    ocasiones: ['cena-romantica', 'regalo-cervecero', 'sobremesa', 'restaurante-formal'],
    estilos: ['complejo', 'fuerte', 'especiado', 'frutal'],
    presupuesto: ['premium'],
    temperaturaServicio: '8–12 °C',
    porQue: 'Cerveza compleja como un buen vino. Acompaña gambas al ajillo, pollo al curry suave o queso brie. Bebida pausadamente.',
  },
  {
    nombre: 'Belgian Quadrupel',
    tipo: 'Ale', origen: 'Bélgica / Países Bajos',
    perfilCorto: 'La trapense más fuerte: pasas, dátiles, chocolate. Para postres y sobremesa larga.',
    notasClave: ['Pasa', 'Dátil', 'Chocolate negro'], ibu: '20-35', abv: '10%',
    maridajes: ['queso-azul', 'postre-chocolate', 'estofado', 'foie', 'frutos-secos'],
    ocasiones: ['postre', 'sobremesa', 'regalo-cervecero', 'invierno'],
    estilos: ['fuerte', 'complejo', 'oscuro', 'dulce'],
    presupuesto: ['premium'],
    temperaturaServicio: '12–14 °C',
    porQue: 'Cerveza para sobremesa o postre. Maridaje brutal con queso azul, tarta de chocolate o un buen foie.',
  },
  {
    nombre: 'Saison',
    tipo: 'Ale', origen: 'Bélgica (Valonia)',
    perfilCorto: 'Cerveza de granja belga: especiada, frutal, sequedad final. Versátil con la comida.',
    notasClave: ['Pimienta', 'Frutas blancas', 'Hierbas'], ibu: '20-35', abv: '6%',
    maridajes: ['ensalada', 'marisco', 'queso-cabra', 'vegetariano', 'picante', 'pescado'],
    ocasiones: ['aperitivo', 'terraza', 'brunch', 'cena-romantica', 'primera-cerveza'],
    estilos: ['medio', 'especiado', 'frutal', 'refrescante'],
    presupuesto: ['medio', 'premium'],
    temperaturaServicio: '6–10 °C',
    porQue: 'Una de las cervezas más versátiles con la comida. Mariscos, ensaladas con queso de cabra, brunch o cena ligera.',
  },
  {
    nombre: 'Belgian Strong Golden Ale (Duvel)',
    tipo: 'Ale', origen: 'Bélgica',
    perfilCorto: 'Dorada engañosamente bebible: parece una rubia, golpea como una ale fuerte.',
    notasClave: ['Pera', 'Especias', 'Levadura belga'], ibu: '20-35', abv: '8.5%',
    maridajes: ['mejillones', 'gambas', 'pollo-mantequilla', 'marisco', 'queso-suave'],
    ocasiones: ['regalo-cervecero', 'cena-romantica', 'restaurante-formal', 'aperitivo'],
    estilos: ['fuerte', 'especiado', 'seco', 'aromatico'],
    presupuesto: ['premium', 'medio'],
    temperaturaServicio: '6–10 °C',
    porQue: 'La "cerveza del diablo": parece inocente, golpea con fuerza. Maridaje belga clásico: moules-frites, gambas o pollo a la mantequilla.',
  },
  {
    nombre: 'Lambic / Gueuze',
    tipo: 'Silvestre', origen: 'Bélgica (Bruselas)',
    perfilCorto: 'Cerveza ácida de fermentación espontánea. Compleja, vinosa, polarizante.',
    notasClave: ['Cítrico ácido', 'Madera', 'Funky'], ibu: '5-15', abv: '5%',
    maridajes: ['ostras', 'sushi', 'queso-cabra', 'postre-frutos-rojos', 'marisco'],
    ocasiones: ['aperitivo', 'regalo-cervecero', 'descubrir', 'restaurante-formal'],
    estilos: ['acido', 'complejo', 'ligero'],
    presupuesto: ['medio', 'premium'],
    temperaturaServicio: '7–12 °C',
    porQue: 'Para curiosos: ácida, vinosa y compleja. Si te gustan los vinos naturales o el champagne, esta cerveza te enganchará.',
  },
  {
    nombre: 'Flanders Red Ale',
    tipo: 'Silvestre', origen: 'Bélgica (Flandes)',
    perfilCorto: 'La "Borgoña de Flandes": cereza ácida, madera, taninos vínicos. Casi un vino.',
    notasClave: ['Cereza ácida', 'Madera', 'Vinagre balsámico'], ibu: '10-25', abv: '5.5%',
    maridajes: ['pato', 'queso-cabra', 'postre-frutos-rojos', 'pizza-anchoas'],
    ocasiones: ['regalo-cervecero', 'sobremesa', 'cena-romantica', 'descubrir'],
    estilos: ['complejo', 'acido', 'vinoso', 'medio'],
    presupuesto: ['medio', 'premium'],
    temperaturaServicio: '8–12 °C',
    porQue: 'Cerveza más vínica del mundo. Marida como un vino: pato, queso de cabra envejecido o postre con frutos rojos.',
  },
  {
    nombre: 'Brown Ale',
    tipo: 'Ale', origen: 'Reino Unido',
    perfilCorto: 'Cerveza marrón maltosa, suave y muy bebible. Notas a nuez y caramelo.',
    notasClave: ['Nuez', 'Caramelo', 'Bizcocho'], ibu: '15-25', abv: '4.5%',
    maridajes: ['jamon', 'queso-curado', 'embutidos', 'ternera', 'carne-asada', 'setas'],
    ocasiones: ['cena-familiar', 'comida-cotidiana', 'sobremesa', 'primera-cerveza'],
    estilos: ['medio', 'malta', 'suave'],
    presupuesto: ['economico', 'medio'],
    temperaturaServicio: '10–13 °C',
    porQue: 'Cerveza pub clásica: suave, maltosa, fácil de beber. Va con jamón serrano, queso curado o un bocata.',
  },
  {
    nombre: 'American Pale Ale',
    tipo: 'Ale', origen: 'EE.UU.',
    perfilCorto: 'Versión equilibrada de la IPA: lúpulo presente pero amargor moderado. Muy bebible.',
    notasClave: ['Lúpulo cítrico', 'Floral', 'Malta caramelo'], ibu: '30-45', abv: '5%',
    maridajes: ['hamburguesas', 'pizza', 'pollo-brasa', 'mexicana', 'BBQ', 'tacos'],
    ocasiones: ['noche-amigos', 'after-work', 'comida-rapida', 'verano'],
    estilos: ['medio', 'lupulado', 'equilibrado'],
    presupuesto: ['economico', 'medio'],
    temperaturaServicio: '7–10 °C',
    porQue: 'La cerveza del after-work. Equilibrada, lupulada pero no agresiva: hamburguesa, pizza, alitas o noche con amigos.',
  },
  {
    nombre: 'Mexican Lager (Negra Modelo)',
    tipo: 'Lager', origen: 'México',
    perfilCorto: 'Lager ámbar mexicana con malta vienesa. Refrescante y maltosa, perfecta con tacos.',
    notasClave: ['Maíz suave', 'Malta vienesa', 'Lima'], ibu: '12-25', abv: '5%',
    maridajes: ['tacos', 'mexicana', 'ceviche', 'fajitas', 'picante-suave', 'guacamole'],
    ocasiones: ['aperitivo', 'terraza', 'verano', 'comida-rapida', 'noche-amigos'],
    estilos: ['ligero', 'malta', 'refrescante'],
    presupuesto: ['economico', 'medio'],
    temperaturaServicio: '4–7 °C',
    porQue: 'La cerveza para tacos al pastor. Refrescante y suave, soporta el picante y casa con la cocina mexicana de bar.',
  },
  {
    nombre: 'Schwarzbier',
    tipo: 'Lager', origen: 'Alemania',
    perfilCorto: 'Lager negra alemana: notas tostadas pero cuerpo ligero. Cerveza oscura accesible.',
    notasClave: ['Café suave', 'Chocolate amargo', 'Lúpulo herbal'], ibu: '22-30', abv: '5%',
    maridajes: ['pato', 'setas', 'chocolate-amargo', 'estofado', 'queso-curado'],
    ocasiones: ['cena-familiar', 'comida-cotidiana', 'descubrir', 'invierno'],
    estilos: ['medio', 'malta', 'equilibrado'],
    presupuesto: ['medio'],
    temperaturaServicio: '8–12 °C',
    porQue: 'Cerveza negra accesible: ligera pese al color. Perfecta para los que aún no se atreven con una Stout. Va con pato, setas o estofado.',
  },
  {
    nombre: 'Gose',
    tipo: 'Híbrida', origen: 'Alemania (Goslar)',
    perfilCorto: 'Cerveza ácida con sal y cilantro. Refrescante y polarizante.',
    notasClave: ['Sal marina', 'Cilantro', 'Lima'], ibu: '5-15', abv: '4.5%',
    maridajes: ['marisco', 'gazpacho', 'queso-fresco', 'sushi', 'ensalada', 'ceviche'],
    ocasiones: ['aperitivo', 'terraza', 'verano', 'descubrir'],
    estilos: ['ligero', 'acido', 'citrico', 'refrescante'],
    presupuesto: ['medio'],
    temperaturaServicio: '4–7 °C',
    porQue: 'Salina y ácida: la cerveza ideal para terraza estival y mariscos. Para los que buscan algo distinto del clásico.',
  },
  {
    nombre: 'Doppelbock',
    tipo: 'Lager', origen: 'Alemania (Múnich)',
    perfilCorto: 'Lager fuerte y maltosa, "pan líquido". Caza, queso intenso, sobremesa de invierno.',
    notasClave: ['Frutas oscuras', 'Caramelo intenso', 'Malta rica'], ibu: '16-26', abv: '8%',
    maridajes: ['caza', 'queso-emmental', 'pate', 'frutos-secos', 'estofado', 'cordero'],
    ocasiones: ['invierno', 'regalo-cervecero', 'sobremesa', 'cena-formal'],
    estilos: ['fuerte', 'malta', 'oscuro', 'complejo'],
    presupuesto: ['medio', 'premium'],
    temperaturaServicio: '8–12 °C',
    porQue: 'La lager más maltosa de Múnich. Para invierno, caza, paté o queso emmental añejo. Bebida pausadamente.',
  },
  {
    nombre: 'Cream Ale',
    tipo: 'Híbrida', origen: 'EE.UU.',
    perfilCorto: 'Cerveza dorada suave y refrescante. Híbrida americana ideal para cualquier comida casual.',
    notasClave: ['Maíz', 'Malta suave', 'Limpia'], ibu: '8-20', abv: '5%',
    maridajes: ['pizza', 'hamburguesas', 'pollo-frito', 'ensalada', 'comida-rapida'],
    ocasiones: ['aperitivo', 'comida-rapida', 'primera-cerveza', 'after-work', 'verano'],
    estilos: ['ligero', 'suave', 'refrescante'],
    presupuesto: ['economico'],
    temperaturaServicio: '4–7 °C',
    porQue: 'Cerveza fácil y refrescante. Va con todo lo informal: pizza, hamburguesa, alitas, alas. La cerveza "sin complicaciones".',
  },
];

// ── Construcción de tags + scoring ────────────────────────────────────────

function construirTags(situacion: Situacion, r: Record<string, string>): string[] {
  const tags: string[] = [];
  if (situacion === 'comida' || situacion === 'bar') {
    if (r.plato) tags.push(r.plato);
    if (r.tipo) tags.push(r.tipo);
  } else if (situacion === 'regalo') {
    if (r.receptor) tags.push(r.receptor);
    if (r.preferencia) tags.push(r.preferencia);
  } else if (situacion === 'ocasion') {
    if (r.ocasion) tags.push(r.ocasion);
  } else if (situacion === 'probar') {
    if (r.estiloDeseado) tags.push(r.estiloDeseado);
    if (r.intensidad) tags.push(r.intensidad);
  }
  if (r.presupuesto) tags.push(r.presupuesto);
  return tags;
}

function calcularScore(cerveza: Cerveza, tags: string[]): number {
  if (tags.length === 0) return 0;
  const allTags = [...cerveza.maridajes, ...cerveza.ocasiones, ...cerveza.estilos, ...cerveza.presupuesto, cerveza.tipo.toLowerCase()];
  let matches = 0;
  for (const tag of tags) {
    if (allTags.some((t) => t === tag || t.includes(tag) || tag.includes(t))) matches++;
  }
  return matches;
}

function recomendar(situacion: Situacion, respuestas: Record<string, string>): { top: Recomendacion[]; alternativa: Recomendacion } {
  const tags = construirTags(situacion, respuestas);
  const ranked: Recomendacion[] = CATALOGO.map((c) => {
    const score = calcularScore(c, tags);
    return { ...c, score, porcentaje: tags.length > 0 ? Math.round((score / tags.length) * 100) : 0 };
  }).sort((a, b) => b.score - a.score);

  const top = ranked.slice(0, 3);
  const alternativa = ranked.find((c) => !top.some((t) => t.nombre === c.nombre) && c.score > 0) || ranked[3];
  return { top, alternativa };
}

// ── Componentes auxiliares ─────────────────────────────────────────────────

function TipoBadge({ tipo }: { tipo: TipoCerveza }) {
  const iconos: Record<TipoCerveza, string> = {
    'Ale': '🍺', 'Lager': '🍻', 'Híbrida': '🌗', 'Silvestre': '🌿',
  };
  return <span className={styles.tipoBadge}><span aria-hidden="true">{iconos[tipo]}</span> {tipo}</span>;
}

function CervezaCard({ cerveza, esTop, posicion }: { cerveza: Recomendacion; esTop?: boolean; posicion?: number }) {
  return (
    <article className={`${styles.cervezaCard} ${esTop ? styles.topCard : styles.altCard}`}>
      <header className={styles.cervezaHeader}>
        {posicion && <span className={styles.posicion}>#{posicion}</span>}
        <TipoBadge tipo={cerveza.tipo} />
        {cerveza.porcentaje > 0 && <span className={styles.porcentaje}>{cerveza.porcentaje}% afinidad</span>}
      </header>
      <h3 className={styles.cervezaNombre}>{cerveza.nombre}</h3>
      <p className={styles.cervezaOrigen}><span aria-hidden="true">📍</span> {cerveza.origen}</p>
      <div className={styles.statsRow}>
        <span className={styles.statItem}><strong>IBU</strong> {cerveza.ibu}</span>
        <span className={styles.statItem}><strong>ABV</strong> {cerveza.abv}</span>
      </div>
      <p className={styles.cervezaPerfil}>{cerveza.perfilCorto}</p>
      <div className={styles.notasContainer}>
        {cerveza.notasClave.map((n) => <span key={n} className={styles.nota}>{n}</span>)}
      </div>
      <div className={styles.porQueBox}>
        <strong>¿Por qué?</strong>
        <p>{cerveza.porQue}</p>
      </div>
      <p className={styles.tempServicio}><span aria-hidden="true">🌡️</span> Servir a {cerveza.temperaturaServicio}</p>
    </article>
  );
}

// ── Página principal ───────────────────────────────────────────────────────

export default function QueCervezaElegir() {
  const [step, setStep] = useState<number>(1);
  const [situacion, setSituacion] = useState<Situacion | null>(null);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});

  const resultados = useMemo(() => {
    if (step < 3 || !situacion) return null;
    return recomendar(situacion, respuestas);
  }, [step, situacion, respuestas]);

  const reset = () => {
    setStep(1);
    setSituacion(null);
    setRespuestas({});
  };

  const setRespuesta = (clave: string, valor: string) => {
    setRespuestas((prev) => ({ ...prev, [clave]: valor }));
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1><span aria-hidden="true">🍺</span> ¿Qué cerveza elegir?</h1>
        <p>Asistente situacional: dime qué necesitas y te recomiendo la cerveza adecuada</p>
      </header>

      <LegalNotice />

      <DisclaimerCard variant="alcohol" severity="high" />

      <main className={styles.main}>
        <div className={styles.stepper} aria-label="Progreso del asistente">
          <span className={`${styles.stepDot} ${step >= 1 ? styles.stepActivo : ''}`}>1</span>
          <span className={styles.stepLine} />
          <span className={`${styles.stepDot} ${step >= 2 ? styles.stepActivo : ''}`}>2</span>
          <span className={styles.stepLine} />
          <span className={`${styles.stepDot} ${step >= 3 ? styles.stepActivo : ''}`}>3</span>
        </div>

        {step === 1 && (
          <section className={styles.paso}>
            <h2 className={styles.pasoTitulo}>¿Para qué necesitas la cerveza?</h2>
            <div className={styles.opcionesGrid}>
              {[
                { id: 'comida', icono: '🍽️', titulo: 'Para una comida', desc: 'Voy a comer y quiero acertar con el plato' },
                { id: 'regalo', icono: '🎁', titulo: 'Para regalar', desc: 'Pack para un amigo, jefe o cervecero' },
                { id: 'bar', icono: '🍻', titulo: 'En un bar', desc: 'Tengo que pedir y no sé qué' },
                { id: 'ocasion', icono: '✨', titulo: 'Para una ocasión', desc: 'Aperitivo, terraza, sobremesa, postre…' },
                { id: 'probar', icono: '🔎', titulo: 'Quiero probar algo', desc: 'Salir de mi zona de confort' },
              ].map((op) => (
                <button
                  key={op.id}
                  type="button"
                  className={styles.opcionCard}
                  onClick={() => { setSituacion(op.id as Situacion); setStep(2); }}
                >
                  <span className={styles.opcionIcono} aria-hidden="true">{op.icono}</span>
                  <strong>{op.titulo}</strong>
                  <span className={styles.opcionDesc}>{op.desc}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 2 && situacion && (
          <section className={styles.paso}>
            <PreguntasPorSituacion
              situacion={situacion}
              respuestas={respuestas}
              setRespuesta={setRespuesta}
            />
            <div className={styles.botonesNav}>
              <button type="button" className={styles.btnSecundario} onClick={() => { setStep(1); setRespuestas({}); }}>← Cambiar situación</button>
              <button
                type="button"
                className={styles.btnPrimario}
                onClick={() => setStep(3)}
                disabled={Object.keys(respuestas).length === 0}
              >
                Ver recomendaciones →
              </button>
            </div>
          </section>
        )}

        {step === 3 && resultados && situacion && (
          <section className={styles.paso} role="status" aria-live="polite" aria-label="Resultados de la recomendación">
            <h2 className={styles.pasoTitulo}>Estas son mis recomendaciones</h2>
            <p className={styles.subtituloResultado}>Tres opciones razonadas + una alternativa para salir de tu zona de confort</p>

            <div className={styles.resultadosGrid}>
              {resultados.top.map((cerveza, idx) => (
                <CervezaCard key={cerveza.nombre} cerveza={cerveza} esTop posicion={idx + 1} />
              ))}
            </div>

            <div className={styles.alternativaSection}>
              <h3 className={styles.alternativaTitulo}><span aria-hidden="true">🎲</span> Y si quieres salir de tu zona de confort…</h3>
              <CervezaCard cerveza={resultados.alternativa} />
            </div>

            <div className={styles.tipsBox}>
              <h3>Consejos prácticos</h3>
              <ul>
                <li><strong>Temperatura:</strong> nunca sirvas una cerveza demasiado fría. Las lagers ligeras a 4-7°C, las ales con cuerpo a 8-13°C, las cervezas fuertes (Tripel, Quadrupel, Imperial Stout) hasta 14°C.</li>
                <li><strong>La copa importa:</strong> tulipa para Belgian, Weizenglas para Hefeweizen, pinta para Stout, tubo solo para lagers ligeras. Concentra los aromas.</li>
                <li><strong>Frescura:</strong> las IPAs y NEIPAs son sensibles a la luz y el tiempo. Búscalas siempre frescas (menos de 3 meses desde el envasado).</li>
                <li><strong>Si dudas en el bar:</strong> pídele recomendación al camarero indicando el plato. Los buenos bares cerveceros tienen criterio.</li>
              </ul>
            </div>

            <div className={styles.botonesNav}>
              <button type="button" className={styles.btnSecundario} onClick={() => setStep(2)}>← Modificar respuestas</button>
              <button type="button" className={styles.btnPrimario} onClick={reset}>↻ Nueva consulta</button>
            </div>
          </section>
        )}
      </main>

      <EducationalSection
        title="¿Cómo elegir una cerveza sin equivocarse?"
        subtitle="Reglas básicas de maridaje, estilos y servicio que te ayudan a no fallar"
      >
        <p>
          Elegir una cerveza se reduce a tres preguntas: <strong>¿qué voy a comer?</strong>,
          <strong>¿qué intensidad quiero?</strong> y <strong>¿cuánto quiero gastar?</strong>.
          Esta herramienta te orienta entre los 47 estilos de la guía meskeIA, pero los matices
          finales (cervecería concreta, frescura, lote) los marca el bar o la tienda.
        </p>

        <h3>Tabla de maridaje básico</h3>
        <table className={styles.tablaEducativa}>
          <thead>
            <tr><th>Plato</th><th>Cerveza que casi nunca falla</th><th>Por qué</th></tr>
          </thead>
          <tbody>
            <tr><td>Hamburguesa / pizza</td><td>American Pale Ale, IPA, Cream Ale</td><td>Lúpulo limpia el paladar entre bocados</td></tr>
            <tr><td>Mariscos / sushi</td><td>Pilsner, Hefeweizen, Witbier, Gose</td><td>Salinidad y cítrico potencian el marisco</td></tr>
            <tr><td>Tacos / mexicana</td><td>Mexican Lager, Pilsner, Witbier</td><td>Refrescantes, soportan picante</td></tr>
            <tr><td>Carne roja / asado</td><td>Stout, Märzen, Doppelbock, Brown Ale</td><td>Malta tostada equilibra la grasa</td></tr>
            <tr><td>Comida picante / curry</td><td>NEIPA, IPA, Hefeweizen, Riesling de cerveza</td><td>Lúpulo o dulzor sutil refrescan</td></tr>
            <tr><td>Postre de chocolate</td><td>Imperial Stout, Quadrupel, Porter</td><td>Notas a chocolate dialogan con el postre</td></tr>
            <tr><td>Quesos azules</td><td>Quadrupel, Imperial Stout, Barleywine</td><td>Intensidad iguala la del queso</td></tr>
          </tbody>
        </table>

        <h3>Reglas de oro</h3>
        <ol>
          <li><strong>Igualar intensidad:</strong> plato delicado con cerveza ligera, plato contundente con cerveza con cuerpo.</li>
          <li><strong>El amargor (IBU) limpia la grasa:</strong> por eso las IPAs maridan tan bien con hamburguesas o queso azul.</li>
          <li><strong>El dulzor de la malta acompaña tostados:</strong> Stout con carne asada, Doppelbock con caza.</li>
          <li><strong>Servir a temperatura correcta:</strong> nunca a 0°C. El frío extremo oculta los matices del lúpulo y la malta.</li>
        </ol>

        <h3>Errores frecuentes</h3>
        <ul className={styles.listaErrores}>
          <li><strong>Servir todas las cervezas a la misma temperatura.</strong> Una IPA a 2°C no sabe a nada; una Stout a 13°C revela toda su complejidad.</li>
          <li><strong>Asociar "negro = fuerte":</strong> una Schwarzbier negra de 5° tiene menos cuerpo que una Tripel dorada de 8.5°.</li>
          <li><strong>Beber siempre el mismo estilo por costumbre.</strong> Si solo bebes lagers ligeras, te pierdes el 95% del mundo cervecero.</li>
          <li><strong>Comprar IPAs viejas:</strong> el lúpulo se degrada en 3-6 meses. Una IPA caducada sabe a metal.</li>
        </ul>

        <h3>Cuándo gastar más, cuándo gastar menos</h3>
        <p>
          <strong>Gasta menos (1-3 €):</strong> aperitivo de tapas, comida casual, calor extremo,
          eventos largos. Una Pilsner de calidad cumple perfectamente.
        </p>
        <p>
          <strong>Gasta más (4-10 €):</strong> regalo cervecero, sobremesa de invierno, cena
          especial, postre. Aquí brillan las trapenses, NEIPAs frescas o Imperial Stouts añejas.
        </p>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('que-cerveza-elegir')} />
      <ShareCard appName="que-cerveza-elegir" />
      <Footer appName="que-cerveza-elegir" />
    </div>
  );
}

// ── Sub-componente: preguntas según situación ───────────────────────────────

function PreguntasPorSituacion({
  situacion,
  respuestas,
  setRespuesta,
}: {
  situacion: Situacion;
  respuestas: Record<string, string>;
  setRespuesta: (k: string, v: string) => void;
}) {
  if (situacion === 'comida' || situacion === 'bar') {
    return (
      <>
        <h2 className={styles.pasoTitulo}>{situacion === 'comida' ? 'Cuéntame qué vas a comer' : 'Cuéntame qué vas a pedir en el bar'}</h2>

        <fieldset className={styles.preguntaGrupo}>
          <legend>¿Qué vas a comer?</legend>
          <div className={styles.opcionesChips}>
            {[
              { v: 'hamburguesas', l: '🍔 Hamburguesa / pizza' },
              { v: 'tacos', l: '🌮 Tacos / mexicana' },
              { v: 'mariscos', l: '🦐 Marisco' },
              { v: 'pescado', l: '🐟 Pescado / sushi' },
              { v: 'carne-asada', l: '🥩 Carne roja / asado' },
              { v: 'pollo', l: '🍗 Pollo / blanca' },
              { v: 'queso-curado', l: '🧀 Queso curado o azul' },
              { v: 'asiatico', l: '🍜 Asiático / curry' },
              { v: 'ensalada', l: '🥗 Ensalada / vegetariano' },
              { v: 'postre-chocolate', l: '🍫 Postre / chocolate' },
            ].map((op) => (
              <button
                key={op.v}
                type="button"
                className={`${styles.chip} ${respuestas.plato === op.v ? styles.chipActivo : ''}`}
                onClick={() => setRespuesta('plato', op.v)}
                aria-pressed={respuestas.plato === op.v}
              >
                {op.l}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.preguntaGrupo}>
          <legend>¿Qué tipo de momento?</legend>
          <div className={styles.opcionesChips}>
            {[
              { v: 'noche-amigos', l: '🎉 Con amigos' },
              { v: 'cena-romantica', l: '💕 Romántico' },
              { v: 'cena-familiar', l: '👨‍👩‍👧 Familiar' },
              { v: 'after-work', l: '🌆 After-work' },
              { v: 'comida-rapida', l: '⚡ Comida rápida' },
            ].map((op) => (
              <button
                key={op.v}
                type="button"
                className={`${styles.chip} ${respuestas.tipo === op.v ? styles.chipActivo : ''}`}
                onClick={() => setRespuesta('tipo', op.v)}
                aria-pressed={respuestas.tipo === op.v}
              >
                {op.l}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.preguntaGrupo}>
          <legend>Presupuesto orientativo</legend>
          <div className={styles.opcionesChips}>
            {[
              { v: 'economico', l: 'Hasta 3 €' },
              { v: 'medio', l: '3-6 €' },
              { v: 'premium', l: 'Más de 6 €' },
            ].map((op) => (
              <button
                key={op.v}
                type="button"
                className={`${styles.chip} ${respuestas.presupuesto === op.v ? styles.chipActivo : ''}`}
                onClick={() => setRespuesta('presupuesto', op.v)}
                aria-pressed={respuestas.presupuesto === op.v}
              >
                {op.l}
              </button>
            ))}
          </div>
        </fieldset>
      </>
    );
  }

  if (situacion === 'regalo') {
    return (
      <>
        <h2 className={styles.pasoTitulo}>Cuéntame del regalo</h2>

        <fieldset className={styles.preguntaGrupo}>
          <legend>¿Para quién es?</legend>
          <div className={styles.opcionesChips}>
            {[
              { v: 'regalo-cervecero', l: '🍺 Cervecero entusiasta' },
              { v: 'primera-cerveza', l: '🌱 Acaba de empezar' },
              { v: 'descubrir', l: '🔎 Le gusta descubrir' },
              { v: 'noche-amigos', l: '🎉 Para compartir' },
            ].map((op) => (
              <button
                key={op.v}
                type="button"
                className={`${styles.chip} ${respuestas.receptor === op.v ? styles.chipActivo : ''}`}
                onClick={() => setRespuesta('receptor', op.v)}
                aria-pressed={respuestas.receptor === op.v}
              >
                {op.l}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.preguntaGrupo}>
          <legend>¿Qué le suele gustar?</legend>
          <div className={styles.opcionesChips}>
            {[
              { v: 'lager', l: '🍻 Lagers / suaves' },
              { v: 'ale', l: '🍺 Ales / con cuerpo' },
              { v: 'lupulado', l: '🌿 IPAs / lúpulo' },
              { v: 'oscuro', l: '🌑 Stouts / negras' },
              { v: 'descubrir', l: '🎲 Algo distinto' },
            ].map((op) => (
              <button
                key={op.v}
                type="button"
                className={`${styles.chip} ${respuestas.preferencia === op.v ? styles.chipActivo : ''}`}
                onClick={() => setRespuesta('preferencia', op.v)}
                aria-pressed={respuestas.preferencia === op.v}
              >
                {op.l}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.preguntaGrupo}>
          <legend>Presupuesto</legend>
          <div className={styles.opcionesChips}>
            {[
              { v: 'economico', l: 'Hasta 5 €/unidad' },
              { v: 'medio', l: '5-10 €/unidad' },
              { v: 'premium', l: 'Más de 10 €/unidad' },
            ].map((op) => (
              <button
                key={op.v}
                type="button"
                className={`${styles.chip} ${respuestas.presupuesto === op.v ? styles.chipActivo : ''}`}
                onClick={() => setRespuesta('presupuesto', op.v)}
                aria-pressed={respuestas.presupuesto === op.v}
              >
                {op.l}
              </button>
            ))}
          </div>
        </fieldset>
      </>
    );
  }

  if (situacion === 'ocasion') {
    return (
      <>
        <h2 className={styles.pasoTitulo}>¿Para qué ocasión?</h2>
        <fieldset className={styles.preguntaGrupo}>
          <legend>Selecciona la ocasión</legend>
          <div className={styles.opcionesChips}>
            {[
              { v: 'aperitivo', l: '🍻 Aperitivo' },
              { v: 'terraza', l: '☀️ Terraza estival' },
              { v: 'biergarten', l: '🌳 Biergarten / aire libre' },
              { v: 'sobremesa', l: '☕ Sobremesa larga' },
              { v: 'postre', l: '🍰 Acompañar postre' },
              { v: 'invierno', l: '❄️ Cervecería invierno' },
              { v: 'after-work', l: '🌆 After-work' },
            ].map((op) => (
              <button
                key={op.v}
                type="button"
                className={`${styles.chip} ${respuestas.ocasion === op.v ? styles.chipActivo : ''}`}
                onClick={() => setRespuesta('ocasion', op.v)}
                aria-pressed={respuestas.ocasion === op.v}
              >
                {op.l}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className={styles.preguntaGrupo}>
          <legend>Presupuesto</legend>
          <div className={styles.opcionesChips}>
            {[
              { v: 'economico', l: 'Hasta 3 €' },
              { v: 'medio', l: '3-6 €' },
              { v: 'premium', l: 'Más de 6 €' },
            ].map((op) => (
              <button
                key={op.v}
                type="button"
                className={`${styles.chip} ${respuestas.presupuesto === op.v ? styles.chipActivo : ''}`}
                onClick={() => setRespuesta('presupuesto', op.v)}
                aria-pressed={respuestas.presupuesto === op.v}
              >
                {op.l}
              </button>
            ))}
          </div>
        </fieldset>
      </>
    );
  }

  // probar
  return (
    <>
      <h2 className={styles.pasoTitulo}>Quieres explorar algo nuevo</h2>
      <fieldset className={styles.preguntaGrupo}>
        <legend>¿Qué tipo de cerveza?</legend>
        <div className={styles.opcionesChips}>
          {[
            { v: 'ale', l: '🍺 Ale (frutal/aromática)' },
            { v: 'lager', l: '🍻 Lager (limpia/refrescante)' },
            { v: 'silvestre', l: '🌿 Silvestre / sour' },
            { v: 'oscuro', l: '🌑 Oscura (Stout, Porter)' },
          ].map((op) => (
            <button
              key={op.v}
              type="button"
              className={`${styles.chip} ${respuestas.estiloDeseado === op.v ? styles.chipActivo : ''}`}
              onClick={() => setRespuesta('estiloDeseado', op.v)}
              aria-pressed={respuestas.estiloDeseado === op.v}
            >
              {op.l}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className={styles.preguntaGrupo}>
        <legend>¿Cómo te gusta?</legend>
        <div className={styles.opcionesChips}>
          {[
            { v: 'ligero', l: '🍃 Ligera y bebible' },
            { v: 'medio', l: '⚖️ Equilibrada' },
            { v: 'fuerte', l: '💪 Con cuerpo y carácter' },
            { v: 'lupulado', l: '🌿 Muy lupulada' },
            { v: 'malta', l: '🌾 Maltosa / dulce' },
            { v: 'acido', l: '🍋 Ácida / refrescante' },
          ].map((op) => (
            <button
              key={op.v}
              type="button"
              className={`${styles.chip} ${respuestas.intensidad === op.v ? styles.chipActivo : ''}`}
              onClick={() => setRespuesta('intensidad', op.v)}
              aria-pressed={respuestas.intensidad === op.v}
            >
              {op.l}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className={styles.preguntaGrupo}>
        <legend>Presupuesto</legend>
        <div className={styles.opcionesChips}>
          {[
            { v: 'economico', l: 'Hasta 4 €' },
            { v: 'medio', l: '4-8 €' },
            { v: 'premium', l: 'Más de 8 €' },
          ].map((op) => (
            <button
              key={op.v}
              type="button"
              className={`${styles.chip} ${respuestas.presupuesto === op.v ? styles.chipActivo : ''}`}
              onClick={() => setRespuesta('presupuesto', op.v)}
            >
              {op.l}
            </button>
          ))}
        </div>
      </fieldset>
    </>
  );
}
