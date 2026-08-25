export interface VerboIrregular {
  infinitive: string;
  pastSimple: string;
  pastParticiple: string;
  spanish: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  /**
   * Segunda forma de participio admitida, con la variedad que la usa.
   *
   * El banner de feedback del quiz enseña «la conjugación completa», y en los verbos que
   * admiten dos participios enseñaba solo uno: «get → got → got», contradiciendo a la propia
   * caja de avisos de la app («algunos verbos admiten dos participios correctos:
   * got/gotten…») y a su tabla de patrones, que escribe «get/got/got(ten)» (hallazgo 315).
   * Con la mitad del público en Latinoamérica, el americano «gotten» no es marginal.
   */
  varianteParticipio?: { forma: string; variedad: string };
  /**
   * Cierto cuando el past simple de este verbo NO es irregular.
   *
   * Solo `show`: es irregular únicamente en el participio («shown»), y su past simple
   * «showed» era el ÚNICO acabado en -ed de los 75, así que se acertaba —o se descartaba—
   * sin saber el verbo, solo por la forma de la palabra (hallazgo 316). Se queda en las
   * tablas, que es donde enseña algo, y sale del sorteo de preguntas.
   */
  pastSimpleRegular?: boolean;
}

export const verbosIrregulares: VerboIrregular[] = [
  // ── A1 BÁSICO (15 verbos esenciales) ──────────────────────────────
  { infinitive: 'be',    pastSimple: 'was / were', pastParticiple: 'been',    spanish: 'ser / estar',         level: 'A1' },
  { infinitive: 'have',  pastSimple: 'had',        pastParticiple: 'had',     spanish: 'tener',               level: 'A1' },
  { infinitive: 'do',    pastSimple: 'did',        pastParticiple: 'done',    spanish: 'hacer',               level: 'A1' },
  { infinitive: 'go',    pastSimple: 'went',       pastParticiple: 'gone',    spanish: 'ir',                  level: 'A1' },
  { infinitive: 'come',  pastSimple: 'came',       pastParticiple: 'come',    spanish: 'venir',               level: 'A1' },
  { infinitive: 'get',   pastSimple: 'got',        pastParticiple: 'got',     spanish: 'obtener / conseguir', level: 'A1', varianteParticipio: { forma: 'gotten', variedad: 'AmE' } },
  { infinitive: 'make',  pastSimple: 'made',       pastParticiple: 'made',    spanish: 'hacer / fabricar',    level: 'A1' },
  { infinitive: 'know',  pastSimple: 'knew',       pastParticiple: 'known',   spanish: 'saber / conocer',     level: 'A1' },
  { infinitive: 'think', pastSimple: 'thought',    pastParticiple: 'thought', spanish: 'pensar',              level: 'A1' },
  { infinitive: 'see',   pastSimple: 'saw',        pastParticiple: 'seen',    spanish: 'ver',                 level: 'A1' },
  { infinitive: 'say',   pastSimple: 'said',       pastParticiple: 'said',    spanish: 'decir',               level: 'A1' },
  { infinitive: 'take',  pastSimple: 'took',       pastParticiple: 'taken',   spanish: 'tomar / coger',       level: 'A1' },
  { infinitive: 'give',  pastSimple: 'gave',       pastParticiple: 'given',   spanish: 'dar',                 level: 'A1' },
  { infinitive: 'find',  pastSimple: 'found',      pastParticiple: 'found',   spanish: 'encontrar',           level: 'A1' },
  { infinitive: 'tell',  pastSimple: 'told',       pastParticiple: 'told',    spanish: 'contar / decir',      level: 'A1' },

  // ── A2 ELEMENTAL (20 verbos frecuentes) ──────────────────────────
  { infinitive: 'write', pastSimple: 'wrote',   pastParticiple: 'written', spanish: 'escribir',           level: 'A2' },
  { infinitive: 'read',  pastSimple: 'read',    pastParticiple: 'read',    spanish: 'leer',               level: 'A2' },
  { infinitive: 'buy',   pastSimple: 'bought',  pastParticiple: 'bought',  spanish: 'comprar',            level: 'A2' },
  { infinitive: 'eat',   pastSimple: 'ate',     pastParticiple: 'eaten',   spanish: 'comer',              level: 'A2' },
  { infinitive: 'drink', pastSimple: 'drank',   pastParticiple: 'drunk',   spanish: 'beber',              level: 'A2' },
  { infinitive: 'sleep', pastSimple: 'slept',   pastParticiple: 'slept',   spanish: 'dormir',             level: 'A2' },
  { infinitive: 'run',   pastSimple: 'ran',     pastParticiple: 'run',     spanish: 'correr',             level: 'A2' },
  { infinitive: 'put',   pastSimple: 'put',     pastParticiple: 'put',     spanish: 'poner',              level: 'A2' },
  { infinitive: 'sit',   pastSimple: 'sat',     pastParticiple: 'sat',     spanish: 'sentarse',           level: 'A2' },
  { infinitive: 'meet',  pastSimple: 'met',     pastParticiple: 'met',     spanish: 'conocer / quedar',   level: 'A2' },
  { infinitive: 'leave', pastSimple: 'left',    pastParticiple: 'left',    spanish: 'salir / dejar',      level: 'A2' },
  { infinitive: 'lose',  pastSimple: 'lost',    pastParticiple: 'lost',    spanish: 'perder',             level: 'A2' },
  { infinitive: 'win',   pastSimple: 'won',     pastParticiple: 'won',     spanish: 'ganar',              level: 'A2' },
  { infinitive: 'drive', pastSimple: 'drove',   pastParticiple: 'driven',  spanish: 'conducir',           level: 'A2' },
  { infinitive: 'bring', pastSimple: 'brought', pastParticiple: 'brought', spanish: 'traer',              level: 'A2' },
  { infinitive: 'speak', pastSimple: 'spoke',   pastParticiple: 'spoken',  spanish: 'hablar',             level: 'A2' },
  { infinitive: 'hear',  pastSimple: 'heard',   pastParticiple: 'heard',   spanish: 'oír',                level: 'A2' },
  { infinitive: 'feel',  pastSimple: 'felt',    pastParticiple: 'felt',    spanish: 'sentir',             level: 'A2' },
  { infinitive: 'keep',  pastSimple: 'kept',    pastParticiple: 'kept',    spanish: 'mantener / guardar', level: 'A2' },
  { infinitive: 'stand', pastSimple: 'stood',   pastParticiple: 'stood',   spanish: 'estar de pie',       level: 'A2' },

  // ── B1 INTERMEDIO (20 verbos habituales) ──────────────────────────
  { infinitive: 'break',  pastSimple: 'broke',   pastParticiple: 'broken',    spanish: 'romper',              level: 'B1' },
  { infinitive: 'build',  pastSimple: 'built',   pastParticiple: 'built',     spanish: 'construir',           level: 'B1' },
  { infinitive: 'choose', pastSimple: 'chose',   pastParticiple: 'chosen',    spanish: 'elegir',              level: 'B1' },
  { infinitive: 'cut',    pastSimple: 'cut',     pastParticiple: 'cut',       spanish: 'cortar',              level: 'B1' },
  { infinitive: 'fall',   pastSimple: 'fell',    pastParticiple: 'fallen',    spanish: 'caer',                level: 'B1' },
  { infinitive: 'fly',    pastSimple: 'flew',    pastParticiple: 'flown',     spanish: 'volar',               level: 'B1' },
  { infinitive: 'forget', pastSimple: 'forgot',  pastParticiple: 'forgotten', spanish: 'olvidar',             level: 'B1' },
  { infinitive: 'grow',   pastSimple: 'grew',    pastParticiple: 'grown',     spanish: 'crecer',              level: 'B1' },
  { infinitive: 'hold',   pastSimple: 'held',    pastParticiple: 'held',      spanish: 'sostener / sujetar',  level: 'B1' },
  { infinitive: 'hurt',   pastSimple: 'hurt',    pastParticiple: 'hurt',      spanish: 'doler / herir',       level: 'B1' },
  { infinitive: 'pay',    pastSimple: 'paid',    pastParticiple: 'paid',      spanish: 'pagar',               level: 'B1' },
  { infinitive: 'sell',   pastSimple: 'sold',    pastParticiple: 'sold',      spanish: 'vender',              level: 'B1' },
  { infinitive: 'send',   pastSimple: 'sent',    pastParticiple: 'sent',      spanish: 'enviar',              level: 'B1' },
  { infinitive: 'show',   pastSimple: 'showed',  pastParticiple: 'shown',     spanish: 'mostrar',             level: 'B1', pastSimpleRegular: true, varianteParticipio: { forma: 'showed', variedad: 'menos frecuente' } },
  { infinitive: 'sing',   pastSimple: 'sang',    pastParticiple: 'sung',      spanish: 'cantar',              level: 'B1' },
  { infinitive: 'spend',  pastSimple: 'spent',   pastParticiple: 'spent',     spanish: 'gastar / pasar tiempo', level: 'B1' },
  { infinitive: 'swim',   pastSimple: 'swam',    pastParticiple: 'swum',      spanish: 'nadar',               level: 'B1' },
  { infinitive: 'wear',   pastSimple: 'wore',    pastParticiple: 'worn',      spanish: 'llevar puesto',        level: 'B1' },
  { infinitive: 'begin',  pastSimple: 'began',   pastParticiple: 'begun',     spanish: 'comenzar',            level: 'B1' },
  { infinitive: 'teach',  pastSimple: 'taught',  pastParticiple: 'taught',    spanish: 'enseñar',             level: 'B1' },

  // ── B2 AVANZADO (20 verbos complejos) ────────────────────────────
  { infinitive: 'bite',   pastSimple: 'bit',     pastParticiple: 'bitten',    spanish: 'morder',              level: 'B2' },
  { infinitive: 'blow',   pastSimple: 'blew',    pastParticiple: 'blown',     spanish: 'soplar',              level: 'B2' },
  { infinitive: 'draw',   pastSimple: 'drew',    pastParticiple: 'drawn',     spanish: 'dibujar',             level: 'B2' },
  { infinitive: 'feed',   pastSimple: 'fed',     pastParticiple: 'fed',       spanish: 'alimentar',           level: 'B2' },
  { infinitive: 'fight',  pastSimple: 'fought',  pastParticiple: 'fought',    spanish: 'luchar / pelear',     level: 'B2' },
  { infinitive: 'freeze', pastSimple: 'froze',   pastParticiple: 'frozen',    spanish: 'congelar',            level: 'B2' },
  { infinitive: 'hide',   pastSimple: 'hid',     pastParticiple: 'hidden',    spanish: 'esconder',            level: 'B2' },
  { infinitive: 'lay',    pastSimple: 'laid',    pastParticiple: 'laid',      spanish: 'colocar / poner',     level: 'B2' },
  { infinitive: 'lead',   pastSimple: 'led',     pastParticiple: 'led',       spanish: 'liderar / guiar',     level: 'B2' },
  { infinitive: 'lend',   pastSimple: 'lent',    pastParticiple: 'lent',      spanish: 'prestar',             level: 'B2' },
  { infinitive: 'mean',   pastSimple: 'meant',   pastParticiple: 'meant',     spanish: 'significar',          level: 'B2' },
  { infinitive: 'ride',   pastSimple: 'rode',    pastParticiple: 'ridden',    spanish: 'montar / ir en',      level: 'B2' },
  { infinitive: 'rise',   pastSimple: 'rose',    pastParticiple: 'risen',     spanish: 'levantarse / subir',  level: 'B2' },
  { infinitive: 'shake',  pastSimple: 'shook',   pastParticiple: 'shaken',    spanish: 'sacudir / agitar',    level: 'B2' },
  { infinitive: 'shoot',  pastSimple: 'shot',    pastParticiple: 'shot',      spanish: 'disparar',            level: 'B2' },
  { infinitive: 'steal',  pastSimple: 'stole',   pastParticiple: 'stolen',    spanish: 'robar',               level: 'B2' },
  { infinitive: 'throw',  pastSimple: 'threw',   pastParticiple: 'thrown',    spanish: 'lanzar / tirar',      level: 'B2' },
  { infinitive: 'wake',   pastSimple: 'woke',    pastParticiple: 'woken',     spanish: 'despertar',           level: 'B2', varianteParticipio: { forma: 'waked', variedad: 'AmE' } },
  { infinitive: 'forbid', pastSimple: 'forbade', pastParticiple: 'forbidden', spanish: 'prohibir',            level: 'B2' },
  { infinitive: 'shine',  pastSimple: 'shone',   pastParticiple: 'shone',     spanish: 'brillar',             level: 'B2' },
];
