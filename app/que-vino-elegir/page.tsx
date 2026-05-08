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
import styles from './QueVinoElegir.module.css';

// ── Tipos ─────────────────────────────────────────────────────────────────

type Situacion = 'cena' | 'regalo' | 'restaurante' | 'ocasion' | 'probar';
type TipoVino = 'Tinto' | 'Blanco' | 'Espumoso' | 'Generoso';

interface Vino {
  nombre: string;
  tipo: TipoVino;
  origen: string;
  perfilCorto: string;
  notasClave: string[];
  maridajes: string[];
  ocasiones: string[];
  estilos: string[];
  presupuesto: string[];
  temperaturaServicio: string;
  porQue: string;
}

interface Recomendacion extends Vino {
  score: number;
  porcentaje: number;
}

// ── Catálogo de vinos con tags para scoring ────────────────────────────────

const CATALOGO: Vino[] = [
  {
    nombre: 'Tempranillo (Rioja)',
    tipo: 'Tinto', origen: 'España (Rioja)',
    perfilCorto: 'Clásico español: cuerpo medio, taninos suaves, notas a vainilla y cuero por la crianza en roble.',
    notasClave: ['Cereza', 'Vainilla', 'Cuero', 'Tabaco'],
    maridajes: ['carne-roja', 'caza', 'queso-curado', 'jamon', 'embutidos', 'tapas'],
    ocasiones: ['cena-familiar', 'cena-informal', 'noche-amigos', 'sobremesa', 'restaurante-casual'],
    estilos: ['medio', 'tanico', 'especiado', 'frutal'],
    presupuesto: ['medio', 'economico'],
    temperaturaServicio: '16–18 °C',
    porQue: 'El clásico español por excelencia. Sus notas de cuero y vainilla casan perfectamente con carnes, embutidos y quesos curados.',
  },
  {
    nombre: 'Cabernet Sauvignon (Burdeos/Napa)',
    tipo: 'Tinto', origen: 'Francia / EE.UU. / Chile',
    perfilCorto: 'Tinto potente y estructurado: taninos firmes, gran capacidad de envejecimiento, ideal para platos contundentes.',
    notasClave: ['Grosella negra', 'Cedro', 'Menta', 'Grafito'],
    maridajes: ['carne-roja', 'caza', 'queso-curado'],
    ocasiones: ['cena-romantica', 'celebracion', 'restaurante-formal', 'regalo-jefe', 'regalo-aniversario'],
    estilos: ['robusto', 'complejo', 'tanico', 'especiado'],
    presupuesto: ['premium', 'medio'],
    temperaturaServicio: '17–19 °C',
    porQue: 'Rey de los tintos potentes. Sus taninos firmes acompañan carnes rojas grasas, chuletón al carbón o caza mayor.',
  },
  {
    nombre: 'Pinot Noir (Borgoña/Oregón)',
    tipo: 'Tinto', origen: 'Francia (Borgoña)',
    perfilCorto: 'Tinto ligero pero complejo: el más versátil del mundo. Va de salmón a queso brie sin esfuerzo.',
    notasClave: ['Cereza', 'Frambuesa', 'Tierra húmeda', 'Hongos'],
    maridajes: ['carne-blanca', 'pescado', 'queso-suave', 'asiatico', 'pasta'],
    ocasiones: ['cena-romantica', 'restaurante-formal', 'regalo-aniversario'],
    estilos: ['ligero', 'frutal', 'sutil', 'fresco', 'mineral'],
    presupuesto: ['premium', 'medio'],
    temperaturaServicio: '14–16 °C',
    porQue: 'El tinto más elegante del mundo. Ligero pero complejo, va con casi todo: salmón a la plancha, pato a la naranja, pollo asado o queso brie.',
  },
  {
    nombre: 'Malbec (Mendoza)',
    tipo: 'Tinto', origen: 'Argentina',
    perfilCorto: 'El gran tinto argentino: frutal, generoso, con taninos suaves. Hecho para el asado.',
    notasClave: ['Mora', 'Ciruela', 'Violeta', 'Especias'],
    maridajes: ['carne-roja', 'caza', 'queso-curado', 'embutidos', 'picante'],
    ocasiones: ['cena-informal', 'noche-amigos', 'celebracion', 'regalo-amigo', 'sobremesa'],
    estilos: ['robusto', 'complejo', 'frutal', 'tanico'],
    presupuesto: ['medio', 'premium'],
    temperaturaServicio: '17–18 °C',
    porQue: 'El rey del asado. Frutal, generoso y con taninos suaves. Ideal para carnes a la brasa, parrilla o cocina latinoamericana.',
  },
  {
    nombre: 'Garnacha',
    tipo: 'Tinto', origen: 'España / Francia (Mediterráneo)',
    perfilCorto: 'Mediterráneo y especiado, con notas a frambuesa y pimienta blanca. Calidad-precio insuperable.',
    notasClave: ['Frambuesa', 'Pimienta blanca', 'Especias mediterráneas'],
    maridajes: ['carne-blanca', 'tapas', 'pasta', 'queso-suave', 'embutidos', 'arroz'],
    ocasiones: ['cena-familiar', 'cena-informal', 'noche-amigos', 'sobremesa', 'verano-terraza', 'restaurante-casual'],
    estilos: ['medio', 'frutal', 'especiado'],
    presupuesto: ['economico', 'medio'],
    temperaturaServicio: '15–17 °C',
    porQue: 'La uva mediterránea por excelencia. Especiada y jugosa, va con tapas, paellas, pasta o cordero al horno. Excelente calidad-precio.',
  },
  {
    nombre: 'Carménère (Chile)',
    tipo: 'Tinto', origen: 'Chile (Maipo/Colchagua)',
    perfilCorto: 'Bandera de Chile, perfil único con notas de pimiento rojo y cacao. El "tinto sorpresa" para sobremesa.',
    notasClave: ['Pimiento rojo', 'Ciruela', 'Cuero', 'Cacao'],
    maridajes: ['carne-roja', 'queso-curado', 'asiatico', 'embutidos'],
    ocasiones: ['cena-informal', 'noche-amigos', 'regalo-amigo', 'sobremesa'],
    estilos: ['medio', 'especiado', 'frutal'],
    presupuesto: ['medio', 'economico'],
    temperaturaServicio: '15–17 °C',
    porQue: 'Bandera de Chile con perfil único. Acompaña carnes a la parrilla, cazuelas chilenas, mexicanas o cocina con especias suaves.',
  },
  {
    nombre: 'Syrah (Ródano)',
    tipo: 'Tinto', origen: 'Francia (Ródano)',
    perfilCorto: 'Tinto especiado con pimienta negra característica. Para carnes contundentes y sabores intensos.',
    notasClave: ['Mora', 'Pimienta negra', 'Olivas negras'],
    maridajes: ['carne-roja', 'caza', 'embutidos', 'queso-curado', 'picante'],
    ocasiones: ['cena-romantica', 'sobremesa', 'restaurante-formal'],
    estilos: ['robusto', 'complejo', 'especiado', 'tanico'],
    presupuesto: ['medio', 'premium'],
    temperaturaServicio: '16–18 °C',
    porQue: 'Pimienta negra y mora. Encaja con carnes especiadas, cordero al romero, magret de pato o cocina marroquí.',
  },
  {
    nombre: 'Gamay (Beaujolais)',
    tipo: 'Tinto', origen: 'Francia (Beaujolais)',
    perfilCorto: 'Tinto ligero y jugoso, casi se sirve frío. El "vino de picnic" por antonomasia.',
    notasClave: ['Frambuesa', 'Cereza', 'Granito mineral'],
    maridajes: ['embutidos', 'queso-suave', 'tapas', 'carne-blanca'],
    ocasiones: ['picnic', 'cena-informal', 'verano-terraza', 'aperitivo', 'noche-amigos'],
    estilos: ['ligero', 'frutal', 'fresco'],
    presupuesto: ['economico', 'medio'],
    temperaturaServicio: '13–15 °C',
    porQue: 'Tinto fresco y jugoso, casi se sirve frío. Ideal para picnic, charcutería, sobremesa veraniega o cualquier comida ligera.',
  },
  {
    nombre: 'Sangiovese (Chianti)',
    tipo: 'Tinto', origen: 'Italia (Toscana)',
    perfilCorto: 'El tinto italiano por excelencia: acidez vibrante que corta la salsa de tomate.',
    notasClave: ['Cereza ácida', 'Hierba toscana', 'Tomate seco'],
    maridajes: ['pasta', 'pizza', 'queso-curado', 'carne-roja', 'jamon', 'arroz'],
    ocasiones: ['cena-familiar', 'cena-informal', 'noche-amigos', 'restaurante-casual'],
    estilos: ['medio', 'fresco', 'tanico', 'frutal'],
    presupuesto: ['medio', 'economico'],
    temperaturaServicio: '16–18 °C',
    porQue: 'El rey de la pasta italiana. Acidez vibrante que corta la salsa de tomate, ragù o pizza. Engancha bocado tras bocado.',
  },
  {
    nombre: 'Mencía (Ribeira Sacra/Bierzo)',
    tipo: 'Tinto', origen: 'España (Galicia/León)',
    perfilCorto: 'Tinto ligero y mineral: el vino atlántico para pulpo, pescado o sobremesa romántica.',
    notasClave: ['Frambuesa', 'Pizarra', 'Hierbas'],
    maridajes: ['carne-blanca', 'pescado', 'pulpo', 'queso-suave', 'embutidos'],
    ocasiones: ['cena-romantica', 'cena-informal', 'restaurante-casual'],
    estilos: ['ligero', 'medio', 'mineral', 'fresco'],
    presupuesto: ['medio'],
    temperaturaServicio: '14–16 °C',
    porQue: 'Ligera y mineral. Excepcional con pulpo a feira, lacón con grelos, salmón a la plancha o cocina gallega en general.',
  },
  {
    nombre: 'Chardonnay (Borgoña/Napa)',
    tipo: 'Blanco', origen: 'Francia / EE.UU.',
    perfilCorto: 'Blanco con cuerpo, cremoso si tiene madera. Acompaña platos elaborados con salsas o mantequilla.',
    notasClave: ['Manzana', 'Mantequilla', 'Avellana', 'Vainilla'],
    maridajes: ['carne-blanca', 'pescado', 'marisco', 'queso-suave', 'pasta', 'arroz'],
    ocasiones: ['cena-romantica', 'celebracion', 'regalo-aniversario', 'restaurante-formal'],
    estilos: ['complejo', 'medio', 'aromatico'],
    presupuesto: ['premium', 'medio'],
    temperaturaServicio: '10–12 °C',
    porQue: 'Cremoso y elegante. Acompaña bogavante, pollo a la crema, queso brie o risotto con mantequilla.',
  },
  {
    nombre: 'Sauvignon Blanc (Loire/Rueda/NZ)',
    tipo: 'Blanco', origen: 'Francia / España / Nueva Zelanda',
    perfilCorto: 'Blanco aromático y fresco con notas a hierba y pomelo. El "blanco de tapas" universal.',
    notasClave: ['Pomelo', 'Hierba fresca', 'Maracuyá'],
    maridajes: ['pescado', 'marisco', 'sushi', 'ceviche', 'ensalada', 'queso-suave', 'vegetariano', 'tapas'],
    ocasiones: ['aperitivo', 'verano-terraza', 'cena-informal', 'restaurante-casual'],
    estilos: ['ligero', 'fresco', 'aromatico', 'mineral'],
    presupuesto: ['economico', 'medio'],
    temperaturaServicio: '8–10 °C',
    porQue: 'Aromático y fresco. Ideal para ensaladas, ceviche, sushi, queso de cabra o pescado a la plancha.',
  },
  {
    nombre: 'Albariño (Rías Baixas)',
    tipo: 'Blanco', origen: 'España (Galicia)',
    perfilCorto: 'El blanco atlántico: salinidad marina que hace pareja perfecta con marisco gallego.',
    notasClave: ['Melocotón', 'Sal marina', 'Flor de azahar'],
    maridajes: ['marisco', 'pescado', 'sushi', 'arroz', 'tapas'],
    ocasiones: ['aperitivo', 'verano-terraza', 'cena-romantica', 'celebracion', 'cena-informal'],
    estilos: ['medio', 'mineral', 'fresco', 'aromatico'],
    presupuesto: ['medio'],
    temperaturaServicio: '8–10 °C',
    porQue: 'La salinidad atlántica perfecta para mariscos. El maridaje rey con percebes, mejillones, gambas, navajas o paella de marisco.',
  },
  {
    nombre: 'Verdejo (Rueda)',
    tipo: 'Blanco', origen: 'España (Castilla y León)',
    perfilCorto: 'El blanco español más versátil y accesible. Calidad-precio imbatible.',
    notasClave: ['Hinojo', 'Hierba fresca', 'Lima'],
    maridajes: ['tapas', 'pescado', 'queso-suave', 'jamon', 'ensalada', 'vegetariano'],
    ocasiones: ['aperitivo', 'verano-terraza', 'cena-informal', 'noche-amigos', 'cena-familiar'],
    estilos: ['ligero', 'fresco', 'aromatico'],
    presupuesto: ['economico', 'medio'],
    temperaturaServicio: '8–10 °C',
    porQue: 'El blanco amigo. Excelente con tapas, jamón ibérico, gazpacho o pescaítos fritos. Calidad-precio imbatible.',
  },
  {
    nombre: 'Riesling (Mosela)',
    tipo: 'Blanco', origen: 'Alemania',
    perfilCorto: 'Blanco aromático con acidez vibrante. La pareja perfecta de la cocina asiática y picante.',
    notasClave: ['Melocotón', 'Lima', 'Pizarra'],
    maridajes: ['asiatico', 'picante', 'pescado', 'foie', 'sushi'],
    ocasiones: ['cena-romantica', 'restaurante-formal', 'regalo-especial'],
    estilos: ['ligero', 'aromatico', 'fresco', 'mineral'],
    presupuesto: ['medio', 'premium'],
    temperaturaServicio: '8–10 °C',
    porQue: 'La pareja perfecta de la cocina asiática y picante. Su acidez y dulzor sutil equilibran sabores intensos como curry, sushi o foie.',
  },
  {
    nombre: 'Torrontés (Cafayate)',
    tipo: 'Blanco', origen: 'Argentina',
    perfilCorto: 'El blanco argentino: aromático y floral, hecho para cocina latinoamericana.',
    notasClave: ['Jazmín', 'Rosa', 'Melocotón'],
    maridajes: ['ceviche', 'asiatico', 'sushi', 'ensalada', 'picante'],
    ocasiones: ['aperitivo', 'verano-terraza', 'cena-informal', 'regalo-amigo'],
    estilos: ['ligero', 'aromatico', 'floral', 'fresco'],
    presupuesto: ['medio', 'economico'],
    temperaturaServicio: '8–10 °C',
    porQue: 'Aromático y floral. Acompaña perfectamente ceviche, sushi, empanadas salteñas y cocina latinoamericana en general.',
  },
  {
    nombre: 'Pinot Grigio (Italia)',
    tipo: 'Blanco', origen: 'Italia',
    perfilCorto: 'Blanco italiano fresco y bebible: el blanco fácil para cualquier cena.',
    notasClave: ['Manzana verde', 'Almendra', 'Pera'],
    maridajes: ['pasta', 'arroz', 'pescado', 'marisco', 'jamon', 'queso-suave'],
    ocasiones: ['aperitivo', 'verano-terraza', 'cena-informal', 'restaurante-casual', 'cena-familiar'],
    estilos: ['ligero', 'fresco', 'sutil'],
    presupuesto: ['economico', 'medio'],
    temperaturaServicio: '9–11 °C',
    porQue: 'Fresco y bebible. Ideal con pasta al limón, vitello tonnato, prosciutto e melone o un aperitivo veraniego.',
  },
  {
    nombre: 'Vermentino (Cerdeña/Liguria)',
    tipo: 'Blanco', origen: 'Italia (Mediterráneo)',
    perfilCorto: 'Salinidad marina y herbal: el blanco mediterráneo perfecto para mariscos y cocina costera.',
    notasClave: ['Pomelo', 'Hierbas mediterráneas', 'Sal marina'],
    maridajes: ['marisco', 'pescado', 'pasta', 'queso-suave', 'arroz'],
    ocasiones: ['verano-terraza', 'cena-informal', 'aperitivo', 'cena-romantica'],
    estilos: ['medio', 'mineral', 'fresco', 'aromatico'],
    presupuesto: ['medio'],
    temperaturaServicio: '9–11 °C',
    porQue: 'Salinidad marina pura. Excepcional con spaghetti alle vongole, mariscos al vapor y cocina costera mediterránea.',
  },
  {
    nombre: 'Cava Brut Nature',
    tipo: 'Espumoso', origen: 'España (Penedès)',
    perfilCorto: 'Espumoso español por método tradicional: el aperitivo y celebración españoles por excelencia.',
    notasClave: ['Manzana', 'Almendra', 'Brioche', 'Cítrico'],
    maridajes: ['jamon', 'tapas', 'sushi', 'pescado', 'queso-suave', 'marisco'],
    ocasiones: ['aperitivo', 'celebracion', 'brindis', 'cena-romantica', 'verano-terraza', 'regalo-amigo'],
    estilos: ['ligero', 'fresco', 'mineral'],
    presupuesto: ['economico', 'medio'],
    temperaturaServicio: '7–9 °C',
    porQue: 'Calidad-precio imbatible. Va con tapas, jamón ibérico, sushi o cualquier aperitivo. El espumoso democrático español.',
  },
  {
    nombre: 'Prosecco',
    tipo: 'Espumoso', origen: 'Italia (Veneto)',
    perfilCorto: 'El espumoso italiano más alegre. Burbujas frutales para aperitivo o cócteles.',
    notasClave: ['Pera', 'Manzana verde', 'Flores blancas'],
    maridajes: ['tapas', 'jamon', 'postre-frutas', 'queso-suave'],
    ocasiones: ['aperitivo', 'verano-terraza', 'celebracion', 'noche-amigos', 'brindis'],
    estilos: ['ligero', 'fresco', 'frutal', 'aromatico'],
    presupuesto: ['economico', 'medio'],
    temperaturaServicio: '6–8 °C',
    porQue: 'Perfecto para aperitivo, terraza estival o el clásico Aperol Spritz. Espumoso ligero y frutal para empezar la velada.',
  },
  {
    nombre: 'Champagne',
    tipo: 'Espumoso', origen: 'Francia',
    perfilCorto: 'El rey de los espumosos: complejidad y prestigio. Para regalos especiales y celebraciones memorables.',
    notasClave: ['Brioche', 'Almendra', 'Manzana', 'Levadura'],
    maridajes: ['marisco', 'pescado', 'queso-suave', 'foie', 'sushi'],
    ocasiones: ['celebracion', 'brindis', 'cena-romantica', 'regalo-aniversario', 'regalo-especial', 'restaurante-formal', 'regalo-jefe'],
    estilos: ['complejo', 'mineral', 'aromatico'],
    presupuesto: ['premium'],
    temperaturaServicio: '8–10 °C',
    porQue: 'Para regalo especial, aniversarios o celebraciones que se recuerdan. El espumoso de las grandes ocasiones.',
  },
  {
    nombre: 'Pedro Ximénez (PX)',
    tipo: 'Generoso', origen: 'España (Andalucía)',
    perfilCorto: 'Vino dulce de Jerez/Montilla: textura de sirope y sabor a pasas y café. Bomba de placer en sobremesa.',
    notasClave: ['Pasa', 'Higo', 'Café', 'Chocolate'],
    maridajes: ['postre-chocolate', 'queso-azul', 'foie', 'helado'],
    ocasiones: ['postre', 'sobremesa', 'regalo-especial'],
    estilos: ['complejo', 'dulce', 'aromatico'],
    presupuesto: ['medio', 'premium'],
    temperaturaServicio: '12–14 °C',
    porQue: 'El vino dulce más espectacular. Sobre helado de vainilla, queso roquefort o postre de chocolate, una bomba de placer.',
  },
  {
    nombre: 'Manzanilla / Fino (Palomino)',
    tipo: 'Generoso', origen: 'España (Sanlúcar / Jerez)',
    perfilCorto: 'Generoso seco con velo de flor: salino, almendrado y punzante. El aperitivo perfecto.',
    notasClave: ['Almendra', 'Levadura de flor', 'Sal marina'],
    maridajes: ['jamon', 'tapas', 'marisco', 'pescado', 'embutidos', 'queso-curado'],
    ocasiones: ['aperitivo', 'cena-informal', 'verano-terraza', 'sobremesa'],
    estilos: ['ligero', 'mineral', 'fresco', 'sutil'],
    presupuesto: ['economico', 'medio'],
    temperaturaServicio: '6–8 °C',
    porQue: 'El vino del aperitivo perfecto. Salino y punzante, idolatra el jamón ibérico, los pescaítos fritos o los langostinos.',
  },
  {
    nombre: 'Moscatel dulce',
    tipo: 'Blanco', origen: 'Mediterráneo (Málaga / Setúbal / Asti)',
    perfilCorto: 'Blanco aromático dulce: miel, jazmín y uvas frescas. Postre líquido a precio amable.',
    notasClave: ['Uva', 'Miel', 'Naranja amarga', 'Jazmín'],
    maridajes: ['postre-frutas', 'foie', 'queso-azul', 'asiatico'],
    ocasiones: ['postre', 'sobremesa', 'aperitivo'],
    estilos: ['aromatico', 'dulce', 'floral'],
    presupuesto: ['economico', 'medio'],
    temperaturaServicio: '7–9 °C',
    porQue: 'Aromas a uva fresca y miel. El maridaje seguro con un postre con frutas, foie de aperitivo o queso azul de sobremesa.',
  },
];

// ── Construcción de tags según situación + respuestas ──────────────────────

function construirTags(situacion: Situacion, r: Record<string, string>): string[] {
  const tags: string[] = [];

  if (situacion === 'cena' || situacion === 'restaurante') {
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

// ── Motor de scoring ────────────────────────────────────────────────────────

function calcularScore(vino: Vino, tags: string[]): number {
  if (tags.length === 0) return 0;
  const allTags = [...vino.maridajes, ...vino.ocasiones, ...vino.estilos, ...vino.presupuesto, vino.tipo.toLowerCase()];
  let matches = 0;
  for (const tag of tags) {
    if (allTags.some((t) => t === tag || t.includes(tag) || tag.includes(t))) {
      matches++;
    }
  }
  return matches;
}

function recomendar(situacion: Situacion, respuestas: Record<string, string>): { top: Recomendacion[]; alternativa: Recomendacion } {
  const tags = construirTags(situacion, respuestas);
  const ranked: Recomendacion[] = CATALOGO.map((v) => {
    const score = calcularScore(v, tags);
    return { ...v, score, porcentaje: tags.length > 0 ? Math.round((score / tags.length) * 100) : 0 };
  }).sort((a, b) => b.score - a.score);

  const top = ranked.slice(0, 3);
  const alternativa = ranked.find((v) => !top.some((t) => t.nombre === v.nombre) && v.score > 0) || ranked[3];
  return { top, alternativa };
}

// ── Componentes auxiliares ─────────────────────────────────────────────────

function TipoBadge({ tipo }: { tipo: TipoVino }) {
  const iconos: Record<TipoVino, string> = {
    Tinto: '🍷', Blanco: '🥂', Espumoso: '🍾', Generoso: '🥃',
  };
  return <span className={styles.tipoBadge}>{iconos[tipo]} {tipo}</span>;
}

function VinoCard({ vino, esTop, posicion }: { vino: Recomendacion; esTop?: boolean; posicion?: number }) {
  return (
    <article className={`${styles.vinoCard} ${esTop ? styles.topCard : styles.altCard}`}>
      <header className={styles.vinoHeader}>
        {posicion && <span className={styles.posicion}>#{posicion}</span>}
        <TipoBadge tipo={vino.tipo} />
        {vino.porcentaje > 0 && <span className={styles.porcentaje}>{vino.porcentaje}% afinidad</span>}
      </header>
      <h3 className={styles.vinoNombre}>{vino.nombre}</h3>
      <p className={styles.vinoOrigen}>📍 {vino.origen}</p>
      <p className={styles.vinoPerfil}>{vino.perfilCorto}</p>
      <div className={styles.notasContainer}>
        {vino.notasClave.map((n) => <span key={n} className={styles.nota}>{n}</span>)}
      </div>
      <div className={styles.porQueBox}>
        <strong>¿Por qué?</strong>
        <p>{vino.porQue}</p>
      </div>
      <p className={styles.tempServicio}>🌡️ Servir a {vino.temperaturaServicio}</p>
    </article>
  );
}

// ── Página principal ───────────────────────────────────────────────────────

export default function QueVinoElegir() {
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
        <h1>🍷 ¿Qué vino elegir?</h1>
        <p>Asistente situacional: dime qué necesitas y te recomiendo el vino adecuado</p>
      </header>

      <LegalNotice />

      <DisclaimerCard variant="alcohol" severity="high" />

      <main className={styles.main}>
        {/* Stepper */}
        <div className={styles.stepper} aria-label="Progreso del asistente">
          <span className={`${styles.stepDot} ${step >= 1 ? styles.stepActivo : ''}`}>1</span>
          <span className={styles.stepLine} />
          <span className={`${styles.stepDot} ${step >= 2 ? styles.stepActivo : ''}`}>2</span>
          <span className={styles.stepLine} />
          <span className={`${styles.stepDot} ${step >= 3 ? styles.stepActivo : ''}`}>3</span>
        </div>

        {/* Paso 1: situación */}
        {step === 1 && (
          <section className={styles.paso}>
            <h2 className={styles.pasoTitulo}>¿Para qué necesitas el vino?</h2>
            <div className={styles.opcionesGrid}>
              {[
                { id: 'cena', icono: '🍽️', titulo: 'Para una cena', desc: 'Llevo un vino y quiero acertar con la comida' },
                { id: 'regalo', icono: '🎁', titulo: 'Para regalar', desc: 'Quiero acertar con quien lo recibirá' },
                { id: 'restaurante', icono: '🥂', titulo: 'En un restaurante', desc: 'Tengo que pedir y no sé qué elegir' },
                { id: 'ocasion', icono: '✨', titulo: 'Para una ocasión', desc: 'Aperitivo, brindis, terraza, postre…' },
                { id: 'probar', icono: '🔎', titulo: 'Quiero probar algo', desc: 'Salir de mi zona de confort o explorar' },
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

        {/* Paso 2: detalles según situación */}
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

        {/* Paso 3: resultados */}
        {step === 3 && resultados && situacion && (
          <section className={styles.paso}>
            <h2 className={styles.pasoTitulo}>Estas son mis recomendaciones</h2>
            <p className={styles.subtituloResultado}>Tres opciones razonadas + una alternativa para salir de tu zona de confort</p>

            <div className={styles.resultadosGrid}>
              {resultados.top.map((vino, idx) => (
                <VinoCard key={vino.nombre} vino={vino} esTop posicion={idx + 1} />
              ))}
            </div>

            <div className={styles.alternativaSection}>
              <h3 className={styles.alternativaTitulo}>🎲 Y si quieres salir de tu zona de confort…</h3>
              <VinoCard vino={resultados.alternativa} />
            </div>

            <div className={styles.tipsBox}>
              <h3>Consejos prácticos</h3>
              <ul>
                <li><strong>Temperatura:</strong> respeta el rango indicado. Demasiado frío oculta aromas; demasiado cálido aplana la frescura.</li>
                <li><strong>Decantar:</strong> tintos con cuerpo (Cabernet, Malbec, Syrah) ganan con 30 minutos de aireación. Espumosos y blancos ligeros, no.</li>
                <li><strong>Copa:</strong> la copa amplía o concentra los aromas. Una copa balón para tintos, una flauta para espumosos, copa más estrecha para blancos.</li>
                <li><strong>Si dudas en el restaurante:</strong> pregunta al sumiller indicando el plato. Es su trabajo y suele acertar mejor que la lista.</li>
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
        title="¿Cómo elegir un vino sin equivocarse?"
        subtitle="Reglas básicas de maridaje, presupuesto y servicio que casi nadie te explica"
      >
        <p>
          Elegir un vino se reduce a tres preguntas: <strong>¿qué voy a comer?</strong>,
          <strong>¿cuánto quiero gastar?</strong> y <strong>¿con qué intensidad
          quiero acompañar la comida?</strong>. Esta herramienta no sustituye el criterio
          de un sumiller, pero sí ayuda a no quedarse bloqueado en el supermercado o ante
          una carta de restaurante.
        </p>

        <h3>Tabla de maridaje básico</h3>
        <table className={styles.tablaEducativa}>
          <thead>
            <tr><th>Plato</th><th>Vino que casi nunca falla</th><th>Por qué</th></tr>
          </thead>
          <tbody>
            <tr><td>Carne roja a la brasa</td><td>Tinto con cuerpo y taninos (Malbec, Cabernet, Syrah)</td><td>Los taninos cortan la grasa</td></tr>
            <tr><td>Pescado blanco / marisco</td><td>Blanco mineral (Albariño, Sauvignon Blanc)</td><td>La acidez limpia el paladar</td></tr>
            <tr><td>Pasta con tomate</td><td>Tinto fresco (Sangiovese, Mencía, Gamay)</td><td>La acidez del vino dialoga con la del tomate</td></tr>
            <tr><td>Sushi / cocina asiática</td><td>Riesling, Torrontés o espumoso</td><td>El dulzor sutil equilibra umami y picante</td></tr>
            <tr><td>Tapas / aperitivo</td><td>Cava, Manzanilla, Verdejo</td><td>Frescos, salinos y bebibles</td></tr>
            <tr><td>Postre con chocolate</td><td>Pedro Ximénez, Banyuls, Oporto</td><td>El dulzor del vino debe igualar o superar al postre</td></tr>
          </tbody>
        </table>

        <h3>Reglas de oro</h3>
        <ol>
          <li><strong>Igualar intensidad:</strong> plato delicado con vino delicado, plato contundente con vino con cuerpo. Romper esta regla aplasta el plato o el vino.</li>
          <li><strong>El blanco no es solo de pescado:</strong> un Chardonnay con cuerpo va con pollo a la crema; un Riesling, con curry. La regla "blanco-pescado / tinto-carne" es una simplificación.</li>
          <li><strong>El precio no garantiza el placer:</strong> un Verdejo de 7 € puede satisfacer más que un Borgoña de 60 € en una cena informal de tapas.</li>
          <li><strong>Decantar tintos jóvenes con cuerpo:</strong> 30 minutos antes basta. No decantar blancos ni espumosos ni tintos viejos delicados.</li>
        </ol>

        <h3>Errores frecuentes</h3>
        <ul className={styles.listaErrores}>
          <li><strong>Servir todos los tintos a temperatura ambiente.</strong> En verano, una habitación está a 25 °C, pero un tinto debe estar a 16-18 °C. Diez minutos en la nevera lo arregla.</li>
          <li><strong>Pedir el vino más caro de la carta para impresionar.</strong> El sumiller respeta más al cliente que pregunta por una opción interesante de calidad-precio.</li>
          <li><strong>Repetir siempre el mismo varietal por miedo a equivocarse.</strong> Probar uvas distintas (Mencía, Carménère, Vermentino, Torrontés) abre el paladar y descubre joyas.</li>
          <li><strong>Asociar dulzor con baja calidad.</strong> Un Riesling Spätlese o un PX de 30 años son joyas enológicas. El dulzor es un estilo, no un defecto.</li>
        </ul>

        <h3>Cuándo gastar más, cuándo gastar menos</h3>
        <p>
          <strong>Gasta menos (5-12 €):</strong> aperitivo de tapas, cena informal con amigos,
          comida diaria, vino para cocinar. La diferencia entre un Verdejo de 7 € y otro de
          15 € es marginal en estos contextos.
        </p>
        <p>
          <strong>Gasta más (20-50 €):</strong> regalo a alguien que lo apreciará, cena
          romántica, ocasión que se quiere recordar. Aquí la complejidad de un Reserva
          Rioja, un Albariño de finca o un Champagne brut sí se nota.
        </p>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('que-vino-elegir')} />
      <ShareCard appName="que-vino-elegir" />
      <Footer appName="que-vino-elegir" />
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
  if (situacion === 'cena' || situacion === 'restaurante') {
    return (
      <>
        <h2 className={styles.pasoTitulo}>{situacion === 'cena' ? 'Cuéntame sobre la cena' : 'Cuéntame qué vas a pedir'}</h2>

        <fieldset className={styles.preguntaGrupo}>
          <legend>¿Qué plato principal?</legend>
          <div className={styles.opcionesChips}>
            {[
              { v: 'carne-roja', l: '🥩 Carne roja' },
              { v: 'carne-blanca', l: '🍗 Carne blanca' },
              { v: 'pescado', l: '🐟 Pescado' },
              { v: 'marisco', l: '🦐 Marisco' },
              { v: 'pasta', l: '🍝 Pasta' },
              { v: 'arroz', l: '🍚 Arroz / Risotto' },
              { v: 'queso', l: '🧀 Quesos' },
              { v: 'tapas', l: '🥘 Tapas variadas' },
              { v: 'asiatico', l: '🍣 Asiático / Picante' },
              { v: 'vegetariano', l: '🥗 Vegetariano' },
            ].map((op) => (
              <button
                key={op.v}
                type="button"
                className={`${styles.chip} ${respuestas.plato === op.v ? styles.chipActivo : ''}`}
                onClick={() => setRespuesta('plato', op.v)}
              >
                {op.l}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.preguntaGrupo}>
          <legend>¿Qué tipo de cena?</legend>
          <div className={styles.opcionesChips}>
            {[
              { v: 'cena-romantica', l: '💕 Romántica' },
              { v: 'cena-familiar', l: '👨‍👩‍👧 Familiar' },
              { v: 'noche-amigos', l: '🎉 Con amigos' },
              { v: situacion === 'restaurante' ? 'restaurante-formal' : 'cena-informal', l: situacion === 'restaurante' ? '🍴 Restaurante formal' : '🪑 Informal' },
            ].map((op) => (
              <button
                key={op.v}
                type="button"
                className={`${styles.chip} ${respuestas.tipo === op.v ? styles.chipActivo : ''}`}
                onClick={() => setRespuesta('tipo', op.v)}
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
              { v: 'economico', l: 'Hasta 10 €' },
              { v: 'medio', l: '10-25 €' },
              { v: 'premium', l: 'Más de 25 €' },
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

  if (situacion === 'regalo') {
    return (
      <>
        <h2 className={styles.pasoTitulo}>Cuéntame del regalo</h2>

        <fieldset className={styles.preguntaGrupo}>
          <legend>¿Para quién es?</legend>
          <div className={styles.opcionesChips}>
            {[
              { v: 'regalo-amigo', l: '🤝 Amigo o conocido' },
              { v: 'regalo-aniversario', l: '💝 Pareja / aniversario' },
              { v: 'regalo-jefe', l: '🎩 Jefe o cliente' },
              { v: 'regalo-especial', l: '✨ Ocasión muy especial' },
            ].map((op) => (
              <button
                key={op.v}
                type="button"
                className={`${styles.chip} ${respuestas.receptor === op.v ? styles.chipActivo : ''}`}
                onClick={() => setRespuesta('receptor', op.v)}
              >
                {op.l}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.preguntaGrupo}>
          <legend>¿Conoces sus gustos?</legend>
          <div className={styles.opcionesChips}>
            {[
              { v: 'tinto', l: '🍷 Le gusta el tinto' },
              { v: 'blanco', l: '🥂 Le gusta el blanco' },
              { v: 'espumoso', l: '🍾 Le gustan los espumosos' },
              { v: 'aromatico', l: '🌸 Le gustan vinos aromáticos' },
              { v: 'complejo', l: '🎯 Sin saberlo, juego seguro' },
            ].map((op) => (
              <button
                key={op.v}
                type="button"
                className={`${styles.chip} ${respuestas.preferencia === op.v ? styles.chipActivo : ''}`}
                onClick={() => setRespuesta('preferencia', op.v)}
              >
                {op.l}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.preguntaGrupo}>
          <legend>Presupuesto del regalo</legend>
          <div className={styles.opcionesChips}>
            {[
              { v: 'economico', l: 'Hasta 15 €' },
              { v: 'medio', l: '15-30 €' },
              { v: 'premium', l: 'Más de 30 €' },
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

  if (situacion === 'ocasion') {
    return (
      <>
        <h2 className={styles.pasoTitulo}>¿Para qué ocasión?</h2>

        <fieldset className={styles.preguntaGrupo}>
          <legend>Selecciona la ocasión</legend>
          <div className={styles.opcionesChips}>
            {[
              { v: 'aperitivo', l: '🥂 Aperitivo' },
              { v: 'brindis', l: '🍾 Brindis / celebración' },
              { v: 'verano-terraza', l: '☀️ Terraza estival' },
              { v: 'sobremesa', l: '☕ Sobremesa larga' },
              { v: 'postre', l: '🍰 Acompañar postre' },
              { v: 'picnic', l: '🧺 Picnic / aire libre' },
              { v: 'noche-amigos', l: '🎉 Noche con amigos' },
            ].map((op) => (
              <button
                key={op.v}
                type="button"
                className={`${styles.chip} ${respuestas.ocasion === op.v ? styles.chipActivo : ''}`}
                onClick={() => setRespuesta('ocasion', op.v)}
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
              { v: 'economico', l: 'Hasta 10 €' },
              { v: 'medio', l: '10-25 €' },
              { v: 'premium', l: 'Más de 25 €' },
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

  // probar
  return (
    <>
      <h2 className={styles.pasoTitulo}>Quieres explorar algo nuevo</h2>

      <fieldset className={styles.preguntaGrupo}>
        <legend>¿Qué tipo de vino quieres probar?</legend>
        <div className={styles.opcionesChips}>
          {[
            { v: 'tinto', l: '🍷 Tinto' },
            { v: 'blanco', l: '🥂 Blanco' },
            { v: 'espumoso', l: '🍾 Espumoso' },
            { v: 'generoso', l: '🥃 Generoso (Jerez, PX)' },
          ].map((op) => (
            <button
              key={op.v}
              type="button"
              className={`${styles.chip} ${respuestas.estiloDeseado === op.v ? styles.chipActivo : ''}`}
              onClick={() => setRespuesta('estiloDeseado', op.v)}
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
            { v: 'ligero', l: '🍃 Ligero y fresco' },
            { v: 'medio', l: '⚖️ Equilibrado' },
            { v: 'robusto', l: '💪 Con cuerpo y carácter' },
            { v: 'aromatico', l: '🌸 Muy aromático' },
            { v: 'mineral', l: '🪨 Mineral / salino' },
          ].map((op) => (
            <button
              key={op.v}
              type="button"
              className={`${styles.chip} ${respuestas.intensidad === op.v ? styles.chipActivo : ''}`}
              onClick={() => setRespuesta('intensidad', op.v)}
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
            { v: 'economico', l: 'Hasta 12 €' },
            { v: 'medio', l: '12-25 €' },
            { v: 'premium', l: 'Más de 25 €' },
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
