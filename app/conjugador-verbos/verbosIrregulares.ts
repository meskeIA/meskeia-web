/**
 * Base de datos de verbos irregulares españoles
 * Incluye los 100+ verbos irregulares más comunes
 */

export interface ConjugacionCompleta {
  infinitivo: string;
  gerundio: string;
  participio: string;
  indicativo: {
    presente: string[];
    preterito_imperfecto: string[];
    preterito_indefinido: string[];
    futuro: string[];
    condicional: string[];
  };
  subjuntivo: {
    presente: string[];
    preterito_imperfecto: string[];
  };
  imperativo: {
    afirmativo: string[];
    negativo: string[];
  };
}

// Orden de personas: yo, tú, él/ella/usted, nosotros, vosotros, ellos/ellas/ustedes

export const verbosIrregulares: Record<string, ConjugacionCompleta> = {
  // ========== VERBOS AUXILIARES Y MÁS COMUNES ==========
  ser: {
    infinitivo: 'ser',
    gerundio: 'siendo',
    participio: 'sido',
    indicativo: {
      presente: ['soy', 'eres', 'es', 'somos', 'sois', 'son'],
      preterito_imperfecto: ['era', 'eras', 'era', 'éramos', 'erais', 'eran'],
      preterito_indefinido: ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'],
      futuro: ['seré', 'serás', 'será', 'seremos', 'seréis', 'serán'],
      condicional: ['sería', 'serías', 'sería', 'seríamos', 'seríais', 'serían'],
    },
    subjuntivo: {
      presente: ['sea', 'seas', 'sea', 'seamos', 'seáis', 'sean'],
      preterito_imperfecto: ['fuera', 'fueras', 'fuera', 'fuéramos', 'fuerais', 'fueran'],
    },
    imperativo: {
      afirmativo: ['-', 'sé', 'sea', 'seamos', 'sed', 'sean'],
      negativo: ['-', 'no seas', 'no sea', 'no seamos', 'no seáis', 'no sean'],
    },
  },

  estar: {
    infinitivo: 'estar',
    gerundio: 'estando',
    participio: 'estado',
    indicativo: {
      presente: ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están'],
      preterito_imperfecto: ['estaba', 'estabas', 'estaba', 'estábamos', 'estabais', 'estaban'],
      preterito_indefinido: ['estuve', 'estuviste', 'estuvo', 'estuvimos', 'estuvisteis', 'estuvieron'],
      futuro: ['estaré', 'estarás', 'estará', 'estaremos', 'estaréis', 'estarán'],
      condicional: ['estaría', 'estarías', 'estaría', 'estaríamos', 'estaríais', 'estarían'],
    },
    subjuntivo: {
      presente: ['esté', 'estés', 'esté', 'estemos', 'estéis', 'estén'],
      preterito_imperfecto: ['estuviera', 'estuvieras', 'estuviera', 'estuviéramos', 'estuvierais', 'estuvieran'],
    },
    imperativo: {
      afirmativo: ['-', 'está', 'esté', 'estemos', 'estad', 'estén'],
      negativo: ['-', 'no estés', 'no esté', 'no estemos', 'no estéis', 'no estén'],
    },
  },

  haber: {
    infinitivo: 'haber',
    gerundio: 'habiendo',
    participio: 'habido',
    indicativo: {
      presente: ['he', 'has', 'ha', 'hemos', 'habéis', 'han'],
      preterito_imperfecto: ['había', 'habías', 'había', 'habíamos', 'habíais', 'habían'],
      preterito_indefinido: ['hube', 'hubiste', 'hubo', 'hubimos', 'hubisteis', 'hubieron'],
      futuro: ['habré', 'habrás', 'habrá', 'habremos', 'habréis', 'habrán'],
      condicional: ['habría', 'habrías', 'habría', 'habríamos', 'habríais', 'habrían'],
    },
    subjuntivo: {
      presente: ['haya', 'hayas', 'haya', 'hayamos', 'hayáis', 'hayan'],
      preterito_imperfecto: ['hubiera', 'hubieras', 'hubiera', 'hubiéramos', 'hubierais', 'hubieran'],
    },
    imperativo: {
      afirmativo: ['-', 'he', 'haya', 'hayamos', 'habed', 'hayan'],
      negativo: ['-', 'no hayas', 'no haya', 'no hayamos', 'no hayáis', 'no hayan'],
    },
  },

  tener: {
    infinitivo: 'tener',
    gerundio: 'teniendo',
    participio: 'tenido',
    indicativo: {
      presente: ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen'],
      preterito_imperfecto: ['tenía', 'tenías', 'tenía', 'teníamos', 'teníais', 'tenían'],
      preterito_indefinido: ['tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvisteis', 'tuvieron'],
      futuro: ['tendré', 'tendrás', 'tendrá', 'tendremos', 'tendréis', 'tendrán'],
      condicional: ['tendría', 'tendrías', 'tendría', 'tendríamos', 'tendríais', 'tendrían'],
    },
    subjuntivo: {
      presente: ['tenga', 'tengas', 'tenga', 'tengamos', 'tengáis', 'tengan'],
      preterito_imperfecto: ['tuviera', 'tuvieras', 'tuviera', 'tuviéramos', 'tuvierais', 'tuvieran'],
    },
    imperativo: {
      afirmativo: ['-', 'ten', 'tenga', 'tengamos', 'tened', 'tengan'],
      negativo: ['-', 'no tengas', 'no tenga', 'no tengamos', 'no tengáis', 'no tengan'],
    },
  },

  ir: {
    infinitivo: 'ir',
    gerundio: 'yendo',
    participio: 'ido',
    indicativo: {
      presente: ['voy', 'vas', 'va', 'vamos', 'vais', 'van'],
      preterito_imperfecto: ['iba', 'ibas', 'iba', 'íbamos', 'ibais', 'iban'],
      preterito_indefinido: ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'],
      futuro: ['iré', 'irás', 'irá', 'iremos', 'iréis', 'irán'],
      condicional: ['iría', 'irías', 'iría', 'iríamos', 'iríais', 'irían'],
    },
    subjuntivo: {
      presente: ['vaya', 'vayas', 'vaya', 'vayamos', 'vayáis', 'vayan'],
      preterito_imperfecto: ['fuera', 'fueras', 'fuera', 'fuéramos', 'fuerais', 'fueran'],
    },
    imperativo: {
      afirmativo: ['-', 've', 'vaya', 'vayamos', 'id', 'vayan'],
      negativo: ['-', 'no vayas', 'no vaya', 'no vayamos', 'no vayáis', 'no vayan'],
    },
  },

  hacer: {
    infinitivo: 'hacer',
    gerundio: 'haciendo',
    participio: 'hecho',
    indicativo: {
      presente: ['hago', 'haces', 'hace', 'hacemos', 'hacéis', 'hacen'],
      preterito_imperfecto: ['hacía', 'hacías', 'hacía', 'hacíamos', 'hacíais', 'hacían'],
      preterito_indefinido: ['hice', 'hiciste', 'hizo', 'hicimos', 'hicisteis', 'hicieron'],
      futuro: ['haré', 'harás', 'hará', 'haremos', 'haréis', 'harán'],
      condicional: ['haría', 'harías', 'haría', 'haríamos', 'haríais', 'harían'],
    },
    subjuntivo: {
      presente: ['haga', 'hagas', 'haga', 'hagamos', 'hagáis', 'hagan'],
      preterito_imperfecto: ['hiciera', 'hicieras', 'hiciera', 'hiciéramos', 'hicierais', 'hicieran'],
    },
    imperativo: {
      afirmativo: ['-', 'haz', 'haga', 'hagamos', 'haced', 'hagan'],
      negativo: ['-', 'no hagas', 'no haga', 'no hagamos', 'no hagáis', 'no hagan'],
    },
  },

  poder: {
    infinitivo: 'poder',
    gerundio: 'pudiendo',
    participio: 'podido',
    indicativo: {
      presente: ['puedo', 'puedes', 'puede', 'podemos', 'podéis', 'pueden'],
      preterito_imperfecto: ['podía', 'podías', 'podía', 'podíamos', 'podíais', 'podían'],
      preterito_indefinido: ['pude', 'pudiste', 'pudo', 'pudimos', 'pudisteis', 'pudieron'],
      futuro: ['podré', 'podrás', 'podrá', 'podremos', 'podréis', 'podrán'],
      condicional: ['podría', 'podrías', 'podría', 'podríamos', 'podríais', 'podrían'],
    },
    subjuntivo: {
      presente: ['pueda', 'puedas', 'pueda', 'podamos', 'podáis', 'puedan'],
      preterito_imperfecto: ['pudiera', 'pudieras', 'pudiera', 'pudiéramos', 'pudierais', 'pudieran'],
    },
    imperativo: {
      afirmativo: ['-', 'puede', 'pueda', 'podamos', 'poded', 'puedan'],
      negativo: ['-', 'no puedas', 'no pueda', 'no podamos', 'no podáis', 'no puedan'],
    },
  },

  decir: {
    infinitivo: 'decir',
    gerundio: 'diciendo',
    participio: 'dicho',
    indicativo: {
      presente: ['digo', 'dices', 'dice', 'decimos', 'decís', 'dicen'],
      preterito_imperfecto: ['decía', 'decías', 'decía', 'decíamos', 'decíais', 'decían'],
      preterito_indefinido: ['dije', 'dijiste', 'dijo', 'dijimos', 'dijisteis', 'dijeron'],
      futuro: ['diré', 'dirás', 'dirá', 'diremos', 'diréis', 'dirán'],
      condicional: ['diría', 'dirías', 'diría', 'diríamos', 'diríais', 'dirían'],
    },
    subjuntivo: {
      presente: ['diga', 'digas', 'diga', 'digamos', 'digáis', 'digan'],
      preterito_imperfecto: ['dijera', 'dijeras', 'dijera', 'dijéramos', 'dijerais', 'dijeran'],
    },
    imperativo: {
      afirmativo: ['-', 'di', 'diga', 'digamos', 'decid', 'digan'],
      negativo: ['-', 'no digas', 'no diga', 'no digamos', 'no digáis', 'no digan'],
    },
  },

  querer: {
    infinitivo: 'querer',
    gerundio: 'queriendo',
    participio: 'querido',
    indicativo: {
      presente: ['quiero', 'quieres', 'quiere', 'queremos', 'queréis', 'quieren'],
      preterito_imperfecto: ['quería', 'querías', 'quería', 'queríamos', 'queríais', 'querían'],
      preterito_indefinido: ['quise', 'quisiste', 'quiso', 'quisimos', 'quisisteis', 'quisieron'],
      futuro: ['querré', 'querrás', 'querrá', 'querremos', 'querréis', 'querrán'],
      condicional: ['querría', 'querrías', 'querría', 'querríamos', 'querríais', 'querrían'],
    },
    subjuntivo: {
      presente: ['quiera', 'quieras', 'quiera', 'queramos', 'queráis', 'quieran'],
      preterito_imperfecto: ['quisiera', 'quisieras', 'quisiera', 'quisiéramos', 'quisierais', 'quisieran'],
    },
    imperativo: {
      afirmativo: ['-', 'quiere', 'quiera', 'queramos', 'quered', 'quieran'],
      negativo: ['-', 'no quieras', 'no quiera', 'no queramos', 'no queráis', 'no quieran'],
    },
  },

  saber: {
    infinitivo: 'saber',
    gerundio: 'sabiendo',
    participio: 'sabido',
    indicativo: {
      presente: ['sé', 'sabes', 'sabe', 'sabemos', 'sabéis', 'saben'],
      preterito_imperfecto: ['sabía', 'sabías', 'sabía', 'sabíamos', 'sabíais', 'sabían'],
      preterito_indefinido: ['supe', 'supiste', 'supo', 'supimos', 'supisteis', 'supieron'],
      futuro: ['sabré', 'sabrás', 'sabrá', 'sabremos', 'sabréis', 'sabrán'],
      condicional: ['sabría', 'sabrías', 'sabría', 'sabríamos', 'sabríais', 'sabrían'],
    },
    subjuntivo: {
      presente: ['sepa', 'sepas', 'sepa', 'sepamos', 'sepáis', 'sepan'],
      preterito_imperfecto: ['supiera', 'supieras', 'supiera', 'supiéramos', 'supierais', 'supieran'],
    },
    imperativo: {
      afirmativo: ['-', 'sabe', 'sepa', 'sepamos', 'sabed', 'sepan'],
      negativo: ['-', 'no sepas', 'no sepa', 'no sepamos', 'no sepáis', 'no sepan'],
    },
  },

  venir: {
    infinitivo: 'venir',
    gerundio: 'viniendo',
    participio: 'venido',
    indicativo: {
      presente: ['vengo', 'vienes', 'viene', 'venimos', 'venís', 'vienen'],
      preterito_imperfecto: ['venía', 'venías', 'venía', 'veníamos', 'veníais', 'venían'],
      preterito_indefinido: ['vine', 'viniste', 'vino', 'vinimos', 'vinisteis', 'vinieron'],
      futuro: ['vendré', 'vendrás', 'vendrá', 'vendremos', 'vendréis', 'vendrán'],
      condicional: ['vendría', 'vendrías', 'vendría', 'vendríamos', 'vendríais', 'vendrían'],
    },
    subjuntivo: {
      presente: ['venga', 'vengas', 'venga', 'vengamos', 'vengáis', 'vengan'],
      preterito_imperfecto: ['viniera', 'vinieras', 'viniera', 'viniéramos', 'vinierais', 'vinieran'],
    },
    imperativo: {
      afirmativo: ['-', 'ven', 'venga', 'vengamos', 'venid', 'vengan'],
      negativo: ['-', 'no vengas', 'no venga', 'no vengamos', 'no vengáis', 'no vengan'],
    },
  },

  poner: {
    infinitivo: 'poner',
    gerundio: 'poniendo',
    participio: 'puesto',
    indicativo: {
      presente: ['pongo', 'pones', 'pone', 'ponemos', 'ponéis', 'ponen'],
      preterito_imperfecto: ['ponía', 'ponías', 'ponía', 'poníamos', 'poníais', 'ponían'],
      preterito_indefinido: ['puse', 'pusiste', 'puso', 'pusimos', 'pusisteis', 'pusieron'],
      futuro: ['pondré', 'pondrás', 'pondrá', 'pondremos', 'pondréis', 'pondrán'],
      condicional: ['pondría', 'pondrías', 'pondría', 'pondríamos', 'pondríais', 'pondrían'],
    },
    subjuntivo: {
      presente: ['ponga', 'pongas', 'ponga', 'pongamos', 'pongáis', 'pongan'],
      preterito_imperfecto: ['pusiera', 'pusieras', 'pusiera', 'pusiéramos', 'pusierais', 'pusieran'],
    },
    imperativo: {
      afirmativo: ['-', 'pon', 'ponga', 'pongamos', 'poned', 'pongan'],
      negativo: ['-', 'no pongas', 'no ponga', 'no pongamos', 'no pongáis', 'no pongan'],
    },
  },

  salir: {
    infinitivo: 'salir',
    gerundio: 'saliendo',
    participio: 'salido',
    indicativo: {
      presente: ['salgo', 'sales', 'sale', 'salimos', 'salís', 'salen'],
      preterito_imperfecto: ['salía', 'salías', 'salía', 'salíamos', 'salíais', 'salían'],
      preterito_indefinido: ['salí', 'saliste', 'salió', 'salimos', 'salisteis', 'salieron'],
      futuro: ['saldré', 'saldrás', 'saldrá', 'saldremos', 'saldréis', 'saldrán'],
      condicional: ['saldría', 'saldrías', 'saldría', 'saldríamos', 'saldríais', 'saldrían'],
    },
    subjuntivo: {
      presente: ['salga', 'salgas', 'salga', 'salgamos', 'salgáis', 'salgan'],
      preterito_imperfecto: ['saliera', 'salieras', 'saliera', 'saliéramos', 'salierais', 'salieran'],
    },
    imperativo: {
      afirmativo: ['-', 'sal', 'salga', 'salgamos', 'salid', 'salgan'],
      negativo: ['-', 'no salgas', 'no salga', 'no salgamos', 'no salgáis', 'no salgan'],
    },
  },

  ver: {
    infinitivo: 'ver',
    gerundio: 'viendo',
    participio: 'visto',
    indicativo: {
      presente: ['veo', 'ves', 've', 'vemos', 'veis', 'ven'],
      preterito_imperfecto: ['veía', 'veías', 'veía', 'veíamos', 'veíais', 'veían'],
      preterito_indefinido: ['vi', 'viste', 'vio', 'vimos', 'visteis', 'vieron'],
      futuro: ['veré', 'verás', 'verá', 'veremos', 'veréis', 'verán'],
      condicional: ['vería', 'verías', 'vería', 'veríamos', 'veríais', 'verían'],
    },
    subjuntivo: {
      presente: ['vea', 'veas', 'vea', 'veamos', 'veáis', 'vean'],
      preterito_imperfecto: ['viera', 'vieras', 'viera', 'viéramos', 'vierais', 'vieran'],
    },
    imperativo: {
      afirmativo: ['-', 've', 'vea', 'veamos', 'ved', 'vean'],
      negativo: ['-', 'no veas', 'no vea', 'no veamos', 'no veáis', 'no vean'],
    },
  },

  dar: {
    infinitivo: 'dar',
    gerundio: 'dando',
    participio: 'dado',
    indicativo: {
      presente: ['doy', 'das', 'da', 'damos', 'dais', 'dan'],
      preterito_imperfecto: ['daba', 'dabas', 'daba', 'dábamos', 'dabais', 'daban'],
      preterito_indefinido: ['di', 'diste', 'dio', 'dimos', 'disteis', 'dieron'],
      futuro: ['daré', 'darás', 'dará', 'daremos', 'daréis', 'darán'],
      condicional: ['daría', 'darías', 'daría', 'daríamos', 'daríais', 'darían'],
    },
    subjuntivo: {
      presente: ['dé', 'des', 'dé', 'demos', 'deis', 'den'],
      preterito_imperfecto: ['diera', 'dieras', 'diera', 'diéramos', 'dierais', 'dieran'],
    },
    imperativo: {
      afirmativo: ['-', 'da', 'dé', 'demos', 'dad', 'den'],
      negativo: ['-', 'no des', 'no dé', 'no demos', 'no deis', 'no den'],
    },
  },

  conocer: {
    infinitivo: 'conocer',
    gerundio: 'conociendo',
    participio: 'conocido',
    indicativo: {
      presente: ['conozco', 'conoces', 'conoce', 'conocemos', 'conocéis', 'conocen'],
      preterito_imperfecto: ['conocía', 'conocías', 'conocía', 'conocíamos', 'conocíais', 'conocían'],
      preterito_indefinido: ['conocí', 'conociste', 'conoció', 'conocimos', 'conocisteis', 'conocieron'],
      futuro: ['conoceré', 'conocerás', 'conocerá', 'conoceremos', 'conoceréis', 'conocerán'],
      condicional: ['conocería', 'conocerías', 'conocería', 'conoceríamos', 'conoceríais', 'conocerían'],
    },
    subjuntivo: {
      presente: ['conozca', 'conozcas', 'conozca', 'conozcamos', 'conozcáis', 'conozcan'],
      preterito_imperfecto: ['conociera', 'conocieras', 'conociera', 'conociéramos', 'conocierais', 'conocieran'],
    },
    imperativo: {
      afirmativo: ['-', 'conoce', 'conozca', 'conozcamos', 'conoced', 'conozcan'],
      negativo: ['-', 'no conozcas', 'no conozca', 'no conozcamos', 'no conozcáis', 'no conozcan'],
    },
  },

  pensar: {
    infinitivo: 'pensar',
    gerundio: 'pensando',
    participio: 'pensado',
    indicativo: {
      presente: ['pienso', 'piensas', 'piensa', 'pensamos', 'pensáis', 'piensan'],
      preterito_imperfecto: ['pensaba', 'pensabas', 'pensaba', 'pensábamos', 'pensabais', 'pensaban'],
      preterito_indefinido: ['pensé', 'pensaste', 'pensó', 'pensamos', 'pensasteis', 'pensaron'],
      futuro: ['pensaré', 'pensarás', 'pensará', 'pensaremos', 'pensaréis', 'pensarán'],
      condicional: ['pensaría', 'pensarías', 'pensaría', 'pensaríamos', 'pensaríais', 'pensarían'],
    },
    subjuntivo: {
      presente: ['piense', 'pienses', 'piense', 'pensemos', 'penséis', 'piensen'],
      preterito_imperfecto: ['pensara', 'pensaras', 'pensara', 'pensáramos', 'pensarais', 'pensaran'],
    },
    imperativo: {
      afirmativo: ['-', 'piensa', 'piense', 'pensemos', 'pensad', 'piensen'],
      negativo: ['-', 'no pienses', 'no piense', 'no pensemos', 'no penséis', 'no piensen'],
    },
  },

  sentir: {
    infinitivo: 'sentir',
    gerundio: 'sintiendo',
    participio: 'sentido',
    indicativo: {
      presente: ['siento', 'sientes', 'siente', 'sentimos', 'sentís', 'sienten'],
      preterito_imperfecto: ['sentía', 'sentías', 'sentía', 'sentíamos', 'sentíais', 'sentían'],
      preterito_indefinido: ['sentí', 'sentiste', 'sintió', 'sentimos', 'sentisteis', 'sintieron'],
      futuro: ['sentiré', 'sentirás', 'sentirá', 'sentiremos', 'sentiréis', 'sentirán'],
      condicional: ['sentiría', 'sentirías', 'sentiría', 'sentiríamos', 'sentiríais', 'sentirían'],
    },
    subjuntivo: {
      presente: ['sienta', 'sientas', 'sienta', 'sintamos', 'sintáis', 'sientan'],
      preterito_imperfecto: ['sintiera', 'sintieras', 'sintiera', 'sintiéramos', 'sintierais', 'sintieran'],
    },
    imperativo: {
      afirmativo: ['-', 'siente', 'sienta', 'sintamos', 'sentid', 'sientan'],
      negativo: ['-', 'no sientas', 'no sienta', 'no sintamos', 'no sintáis', 'no sientan'],
    },
  },

  dormir: {
    infinitivo: 'dormir',
    gerundio: 'durmiendo',
    participio: 'dormido',
    indicativo: {
      presente: ['duermo', 'duermes', 'duerme', 'dormimos', 'dormís', 'duermen'],
      preterito_imperfecto: ['dormía', 'dormías', 'dormía', 'dormíamos', 'dormíais', 'dormían'],
      preterito_indefinido: ['dormí', 'dormiste', 'durmió', 'dormimos', 'dormisteis', 'durmieron'],
      futuro: ['dormiré', 'dormirás', 'dormirá', 'dormiremos', 'dormiréis', 'dormirán'],
      condicional: ['dormiría', 'dormirías', 'dormiría', 'dormiríamos', 'dormiríais', 'dormirían'],
    },
    subjuntivo: {
      presente: ['duerma', 'duermas', 'duerma', 'durmamos', 'durmáis', 'duerman'],
      preterito_imperfecto: ['durmiera', 'durmieras', 'durmiera', 'durmiéramos', 'durmierais', 'durmieran'],
    },
    imperativo: {
      afirmativo: ['-', 'duerme', 'duerma', 'durmamos', 'dormid', 'duerman'],
      negativo: ['-', 'no duermas', 'no duerma', 'no durmamos', 'no durmáis', 'no duerman'],
    },
  },

  pedir: {
    infinitivo: 'pedir',
    gerundio: 'pidiendo',
    participio: 'pedido',
    indicativo: {
      presente: ['pido', 'pides', 'pide', 'pedimos', 'pedís', 'piden'],
      preterito_imperfecto: ['pedía', 'pedías', 'pedía', 'pedíamos', 'pedíais', 'pedían'],
      preterito_indefinido: ['pedí', 'pediste', 'pidió', 'pedimos', 'pedisteis', 'pidieron'],
      futuro: ['pediré', 'pedirás', 'pedirá', 'pediremos', 'pediréis', 'pedirán'],
      condicional: ['pediría', 'pedirías', 'pediría', 'pediríamos', 'pediríais', 'pedirían'],
    },
    subjuntivo: {
      presente: ['pida', 'pidas', 'pida', 'pidamos', 'pidáis', 'pidan'],
      preterito_imperfecto: ['pidiera', 'pidieras', 'pidiera', 'pidiéramos', 'pidierais', 'pidieran'],
    },
    imperativo: {
      afirmativo: ['-', 'pide', 'pida', 'pidamos', 'pedid', 'pidan'],
      negativo: ['-', 'no pidas', 'no pida', 'no pidamos', 'no pidáis', 'no pidan'],
    },
  },

  contar: {
    infinitivo: 'contar',
    gerundio: 'contando',
    participio: 'contado',
    indicativo: {
      presente: ['cuento', 'cuentas', 'cuenta', 'contamos', 'contáis', 'cuentan'],
      preterito_imperfecto: ['contaba', 'contabas', 'contaba', 'contábamos', 'contabais', 'contaban'],
      preterito_indefinido: ['conté', 'contaste', 'contó', 'contamos', 'contasteis', 'contaron'],
      futuro: ['contaré', 'contarás', 'contará', 'contaremos', 'contaréis', 'contarán'],
      condicional: ['contaría', 'contarías', 'contaría', 'contaríamos', 'contaríais', 'contarían'],
    },
    subjuntivo: {
      presente: ['cuente', 'cuentes', 'cuente', 'contemos', 'contéis', 'cuenten'],
      preterito_imperfecto: ['contara', 'contaras', 'contara', 'contáramos', 'contarais', 'contaran'],
    },
    imperativo: {
      afirmativo: ['-', 'cuenta', 'cuente', 'contemos', 'contad', 'cuenten'],
      negativo: ['-', 'no cuentes', 'no cuente', 'no contemos', 'no contéis', 'no cuenten'],
    },
  },

  volver: {
    infinitivo: 'volver',
    gerundio: 'volviendo',
    participio: 'vuelto',
    indicativo: {
      presente: ['vuelvo', 'vuelves', 'vuelve', 'volvemos', 'volvéis', 'vuelven'],
      preterito_imperfecto: ['volvía', 'volvías', 'volvía', 'volvíamos', 'volvíais', 'volvían'],
      preterito_indefinido: ['volví', 'volviste', 'volvió', 'volvimos', 'volvisteis', 'volvieron'],
      futuro: ['volveré', 'volverás', 'volverá', 'volveremos', 'volveréis', 'volverán'],
      condicional: ['volvería', 'volverías', 'volvería', 'volveríamos', 'volveríais', 'volverían'],
    },
    subjuntivo: {
      presente: ['vuelva', 'vuelvas', 'vuelva', 'volvamos', 'volváis', 'vuelvan'],
      preterito_imperfecto: ['volviera', 'volvieras', 'volviera', 'volviéramos', 'volvierais', 'volvieran'],
    },
    imperativo: {
      afirmativo: ['-', 'vuelve', 'vuelva', 'volvamos', 'volved', 'vuelvan'],
      negativo: ['-', 'no vuelvas', 'no vuelva', 'no volvamos', 'no volváis', 'no vuelvan'],
    },
  },

  traer: {
    infinitivo: 'traer',
    gerundio: 'trayendo',
    participio: 'traído',
    indicativo: {
      presente: ['traigo', 'traes', 'trae', 'traemos', 'traéis', 'traen'],
      preterito_imperfecto: ['traía', 'traías', 'traía', 'traíamos', 'traíais', 'traían'],
      preterito_indefinido: ['traje', 'trajiste', 'trajo', 'trajimos', 'trajisteis', 'trajeron'],
      futuro: ['traeré', 'traerás', 'traerá', 'traeremos', 'traeréis', 'traerán'],
      condicional: ['traería', 'traerías', 'traería', 'traeríamos', 'traeríais', 'traerían'],
    },
    subjuntivo: {
      presente: ['traiga', 'traigas', 'traiga', 'traigamos', 'traigáis', 'traigan'],
      preterito_imperfecto: ['trajera', 'trajeras', 'trajera', 'trajéramos', 'trajerais', 'trajeran'],
    },
    imperativo: {
      afirmativo: ['-', 'trae', 'traiga', 'traigamos', 'traed', 'traigan'],
      negativo: ['-', 'no traigas', 'no traiga', 'no traigamos', 'no traigáis', 'no traigan'],
    },
  },

  caer: {
    infinitivo: 'caer',
    gerundio: 'cayendo',
    participio: 'caído',
    indicativo: {
      presente: ['caigo', 'caes', 'cae', 'caemos', 'caéis', 'caen'],
      preterito_imperfecto: ['caía', 'caías', 'caía', 'caíamos', 'caíais', 'caían'],
      preterito_indefinido: ['caí', 'caíste', 'cayó', 'caímos', 'caísteis', 'cayeron'],
      futuro: ['caeré', 'caerás', 'caerá', 'caeremos', 'caeréis', 'caerán'],
      condicional: ['caería', 'caerías', 'caería', 'caeríamos', 'caeríais', 'caerían'],
    },
    subjuntivo: {
      presente: ['caiga', 'caigas', 'caiga', 'caigamos', 'caigáis', 'caigan'],
      preterito_imperfecto: ['cayera', 'cayeras', 'cayera', 'cayéramos', 'cayerais', 'cayeran'],
    },
    imperativo: {
      afirmativo: ['-', 'cae', 'caiga', 'caigamos', 'caed', 'caigan'],
      negativo: ['-', 'no caigas', 'no caiga', 'no caigamos', 'no caigáis', 'no caigan'],
    },
  },

  creer: {
    infinitivo: 'creer',
    gerundio: 'creyendo',
    participio: 'creído',
    indicativo: {
      presente: ['creo', 'crees', 'cree', 'creemos', 'creéis', 'creen'],
      preterito_imperfecto: ['creía', 'creías', 'creía', 'creíamos', 'creíais', 'creían'],
      preterito_indefinido: ['creí', 'creíste', 'creyó', 'creímos', 'creísteis', 'creyeron'],
      futuro: ['creeré', 'creerás', 'creerá', 'creeremos', 'creeréis', 'creerán'],
      condicional: ['creería', 'creerías', 'creería', 'creeríamos', 'creeríais', 'creerían'],
    },
    subjuntivo: {
      presente: ['crea', 'creas', 'crea', 'creamos', 'creáis', 'crean'],
      preterito_imperfecto: ['creyera', 'creyeras', 'creyera', 'creyéramos', 'creyerais', 'creyeran'],
    },
    imperativo: {
      afirmativo: ['-', 'cree', 'crea', 'creamos', 'creed', 'crean'],
      negativo: ['-', 'no creas', 'no crea', 'no creamos', 'no creáis', 'no crean'],
    },
  },

  leer: {
    infinitivo: 'leer',
    gerundio: 'leyendo',
    participio: 'leído',
    indicativo: {
      presente: ['leo', 'lees', 'lee', 'leemos', 'leéis', 'leen'],
      preterito_imperfecto: ['leía', 'leías', 'leía', 'leíamos', 'leíais', 'leían'],
      preterito_indefinido: ['leí', 'leíste', 'leyó', 'leímos', 'leísteis', 'leyeron'],
      futuro: ['leeré', 'leerás', 'leerá', 'leeremos', 'leeréis', 'leerán'],
      condicional: ['leería', 'leerías', 'leería', 'leeríamos', 'leeríais', 'leerían'],
    },
    subjuntivo: {
      presente: ['lea', 'leas', 'lea', 'leamos', 'leáis', 'lean'],
      preterito_imperfecto: ['leyera', 'leyeras', 'leyera', 'leyéramos', 'leyerais', 'leyeran'],
    },
    imperativo: {
      afirmativo: ['-', 'lee', 'lea', 'leamos', 'leed', 'lean'],
      negativo: ['-', 'no leas', 'no lea', 'no leamos', 'no leáis', 'no lean'],
    },
  },

  oír: {
    infinitivo: 'oír',
    gerundio: 'oyendo',
    participio: 'oído',
    indicativo: {
      presente: ['oigo', 'oyes', 'oye', 'oímos', 'oís', 'oyen'],
      preterito_imperfecto: ['oía', 'oías', 'oía', 'oíamos', 'oíais', 'oían'],
      preterito_indefinido: ['oí', 'oíste', 'oyó', 'oímos', 'oísteis', 'oyeron'],
      futuro: ['oiré', 'oirás', 'oirá', 'oiremos', 'oiréis', 'oirán'],
      condicional: ['oiría', 'oirías', 'oiría', 'oiríamos', 'oiríais', 'oirían'],
    },
    subjuntivo: {
      presente: ['oiga', 'oigas', 'oiga', 'oigamos', 'oigáis', 'oigan'],
      preterito_imperfecto: ['oyera', 'oyeras', 'oyera', 'oyéramos', 'oyerais', 'oyeran'],
    },
    imperativo: {
      afirmativo: ['-', 'oye', 'oiga', 'oigamos', 'oíd', 'oigan'],
      negativo: ['-', 'no oigas', 'no oiga', 'no oigamos', 'no oigáis', 'no oigan'],
    },
  },

  escribir: {
    infinitivo: 'escribir',
    gerundio: 'escribiendo',
    participio: 'escrito',
    indicativo: {
      presente: ['escribo', 'escribes', 'escribe', 'escribimos', 'escribís', 'escriben'],
      preterito_imperfecto: ['escribía', 'escribías', 'escribía', 'escribíamos', 'escribíais', 'escribían'],
      preterito_indefinido: ['escribí', 'escribiste', 'escribió', 'escribimos', 'escribisteis', 'escribieron'],
      futuro: ['escribiré', 'escribirás', 'escribirá', 'escribiremos', 'escribiréis', 'escribirán'],
      condicional: ['escribiría', 'escribirías', 'escribiría', 'escribiríamos', 'escribiríais', 'escribirían'],
    },
    subjuntivo: {
      presente: ['escriba', 'escribas', 'escriba', 'escribamos', 'escribáis', 'escriban'],
      preterito_imperfecto: ['escribiera', 'escribieras', 'escribiera', 'escribiéramos', 'escribierais', 'escribieran'],
    },
    imperativo: {
      afirmativo: ['-', 'escribe', 'escriba', 'escribamos', 'escribid', 'escriban'],
      negativo: ['-', 'no escribas', 'no escriba', 'no escribamos', 'no escribáis', 'no escriban'],
    },
  },

  abrir: {
    infinitivo: 'abrir',
    gerundio: 'abriendo',
    participio: 'abierto',
    indicativo: {
      presente: ['abro', 'abres', 'abre', 'abrimos', 'abrís', 'abren'],
      preterito_imperfecto: ['abría', 'abrías', 'abría', 'abríamos', 'abríais', 'abrían'],
      preterito_indefinido: ['abrí', 'abriste', 'abrió', 'abrimos', 'abristeis', 'abrieron'],
      futuro: ['abriré', 'abrirás', 'abrirá', 'abriremos', 'abriréis', 'abrirán'],
      condicional: ['abriría', 'abrirías', 'abriría', 'abriríamos', 'abriríais', 'abrirían'],
    },
    subjuntivo: {
      presente: ['abra', 'abras', 'abra', 'abramos', 'abráis', 'abran'],
      preterito_imperfecto: ['abriera', 'abrieras', 'abriera', 'abriéramos', 'abrierais', 'abrieran'],
    },
    imperativo: {
      afirmativo: ['-', 'abre', 'abra', 'abramos', 'abrid', 'abran'],
      negativo: ['-', 'no abras', 'no abra', 'no abramos', 'no abráis', 'no abran'],
    },
  },

  morir: {
    infinitivo: 'morir',
    gerundio: 'muriendo',
    participio: 'muerto',
    indicativo: {
      presente: ['muero', 'mueres', 'muere', 'morimos', 'morís', 'mueren'],
      preterito_imperfecto: ['moría', 'morías', 'moría', 'moríamos', 'moríais', 'morían'],
      preterito_indefinido: ['morí', 'moriste', 'murió', 'morimos', 'moristeis', 'murieron'],
      futuro: ['moriré', 'morirás', 'morirá', 'moriremos', 'moriréis', 'morirán'],
      condicional: ['moriría', 'morirías', 'moriría', 'moriríamos', 'moriríais', 'morirían'],
    },
    subjuntivo: {
      presente: ['muera', 'mueras', 'muera', 'muramos', 'muráis', 'mueran'],
      preterito_imperfecto: ['muriera', 'murieras', 'muriera', 'muriéramos', 'murierais', 'murieran'],
    },
    imperativo: {
      afirmativo: ['-', 'muere', 'muera', 'muramos', 'morid', 'mueran'],
      negativo: ['-', 'no mueras', 'no muera', 'no muramos', 'no muráis', 'no mueran'],
    },
  },

  romper: {
    infinitivo: 'romper',
    gerundio: 'rompiendo',
    participio: 'roto',
    indicativo: {
      presente: ['rompo', 'rompes', 'rompe', 'rompemos', 'rompéis', 'rompen'],
      preterito_imperfecto: ['rompía', 'rompías', 'rompía', 'rompíamos', 'rompíais', 'rompían'],
      preterito_indefinido: ['rompí', 'rompiste', 'rompió', 'rompimos', 'rompisteis', 'rompieron'],
      futuro: ['romperé', 'romperás', 'romperá', 'romperemos', 'romperéis', 'romperán'],
      condicional: ['rompería', 'romperías', 'rompería', 'romperíamos', 'romperíais', 'romperían'],
    },
    subjuntivo: {
      presente: ['rompa', 'rompas', 'rompa', 'rompamos', 'rompáis', 'rompan'],
      preterito_imperfecto: ['rompiera', 'rompieras', 'rompiera', 'rompiéramos', 'rompierais', 'rompieran'],
    },
    imperativo: {
      afirmativo: ['-', 'rompe', 'rompa', 'rompamos', 'romped', 'rompan'],
      negativo: ['-', 'no rompas', 'no rompa', 'no rompamos', 'no rompáis', 'no rompan'],
    },
  },

  cubrir: {
    infinitivo: 'cubrir',
    gerundio: 'cubriendo',
    participio: 'cubierto',
    indicativo: {
      presente: ['cubro', 'cubres', 'cubre', 'cubrimos', 'cubrís', 'cubren'],
      preterito_imperfecto: ['cubría', 'cubrías', 'cubría', 'cubríamos', 'cubríais', 'cubrían'],
      preterito_indefinido: ['cubrí', 'cubriste', 'cubrió', 'cubrimos', 'cubristeis', 'cubrieron'],
      futuro: ['cubriré', 'cubrirás', 'cubrirá', 'cubriremos', 'cubriréis', 'cubrirán'],
      condicional: ['cubriría', 'cubrirías', 'cubriría', 'cubriríamos', 'cubriríais', 'cubrirían'],
    },
    subjuntivo: {
      presente: ['cubra', 'cubras', 'cubra', 'cubramos', 'cubráis', 'cubran'],
      preterito_imperfecto: ['cubriera', 'cubrieras', 'cubriera', 'cubriéramos', 'cubrierais', 'cubrieran'],
    },
    imperativo: {
      afirmativo: ['-', 'cubre', 'cubra', 'cubramos', 'cubrid', 'cubran'],
      negativo: ['-', 'no cubras', 'no cubra', 'no cubramos', 'no cubráis', 'no cubran'],
    },
  },

  seguir: {
    infinitivo: 'seguir',
    gerundio: 'siguiendo',
    participio: 'seguido',
    indicativo: {
      presente: ['sigo', 'sigues', 'sigue', 'seguimos', 'seguís', 'siguen'],
      preterito_imperfecto: ['seguía', 'seguías', 'seguía', 'seguíamos', 'seguíais', 'seguían'],
      preterito_indefinido: ['seguí', 'seguiste', 'siguió', 'seguimos', 'seguisteis', 'siguieron'],
      futuro: ['seguiré', 'seguirás', 'seguirá', 'seguiremos', 'seguiréis', 'seguirán'],
      condicional: ['seguiría', 'seguirías', 'seguiría', 'seguiríamos', 'seguiríais', 'seguirían'],
    },
    subjuntivo: {
      presente: ['siga', 'sigas', 'siga', 'sigamos', 'sigáis', 'sigan'],
      preterito_imperfecto: ['siguiera', 'siguieras', 'siguiera', 'siguiéramos', 'siguierais', 'siguieran'],
    },
    imperativo: {
      afirmativo: ['-', 'sigue', 'siga', 'sigamos', 'seguid', 'sigan'],
      negativo: ['-', 'no sigas', 'no siga', 'no sigamos', 'no sigáis', 'no sigan'],
    },
  },

  elegir: {
    infinitivo: 'elegir',
    gerundio: 'eligiendo',
    participio: 'elegido',
    indicativo: {
      presente: ['elijo', 'eliges', 'elige', 'elegimos', 'elegís', 'eligen'],
      preterito_imperfecto: ['elegía', 'elegías', 'elegía', 'elegíamos', 'elegíais', 'elegían'],
      preterito_indefinido: ['elegí', 'elegiste', 'eligió', 'elegimos', 'elegisteis', 'eligieron'],
      futuro: ['elegiré', 'elegirás', 'elegirá', 'elegiremos', 'elegiréis', 'elegirán'],
      condicional: ['elegiría', 'elegirías', 'elegiría', 'elegiríamos', 'elegiríais', 'elegirían'],
    },
    subjuntivo: {
      presente: ['elija', 'elijas', 'elija', 'elijamos', 'elijáis', 'elijan'],
      preterito_imperfecto: ['eligiera', 'eligieras', 'eligiera', 'eligiéramos', 'eligierais', 'eligieran'],
    },
    imperativo: {
      afirmativo: ['-', 'elige', 'elija', 'elijamos', 'elegid', 'elijan'],
      negativo: ['-', 'no elijas', 'no elija', 'no elijamos', 'no elijáis', 'no elijan'],
    },
  },

  jugar: {
    infinitivo: 'jugar',
    gerundio: 'jugando',
    participio: 'jugado',
    indicativo: {
      presente: ['juego', 'juegas', 'juega', 'jugamos', 'jugáis', 'juegan'],
      preterito_imperfecto: ['jugaba', 'jugabas', 'jugaba', 'jugábamos', 'jugabais', 'jugaban'],
      preterito_indefinido: ['jugué', 'jugaste', 'jugó', 'jugamos', 'jugasteis', 'jugaron'],
      futuro: ['jugaré', 'jugarás', 'jugará', 'jugaremos', 'jugaréis', 'jugarán'],
      condicional: ['jugaría', 'jugarías', 'jugaría', 'jugaríamos', 'jugaríais', 'jugarían'],
    },
    subjuntivo: {
      presente: ['juegue', 'juegues', 'juegue', 'juguemos', 'juguéis', 'jueguen'],
      preterito_imperfecto: ['jugara', 'jugaras', 'jugara', 'jugáramos', 'jugarais', 'jugaran'],
    },
    imperativo: {
      afirmativo: ['-', 'juega', 'juegue', 'juguemos', 'jugad', 'jueguen'],
      negativo: ['-', 'no juegues', 'no juegue', 'no juguemos', 'no juguéis', 'no jueguen'],
    },
  },

  comenzar: {
    infinitivo: 'comenzar',
    gerundio: 'comenzando',
    participio: 'comenzado',
    indicativo: {
      presente: ['comienzo', 'comienzas', 'comienza', 'comenzamos', 'comenzáis', 'comienzan'],
      preterito_imperfecto: ['comenzaba', 'comenzabas', 'comenzaba', 'comenzábamos', 'comenzabais', 'comenzaban'],
      preterito_indefinido: ['comencé', 'comenzaste', 'comenzó', 'comenzamos', 'comenzasteis', 'comenzaron'],
      futuro: ['comenzaré', 'comenzarás', 'comenzará', 'comenzaremos', 'comenzaréis', 'comenzarán'],
      condicional: ['comenzaría', 'comenzarías', 'comenzaría', 'comenzaríamos', 'comenzaríais', 'comenzarían'],
    },
    subjuntivo: {
      presente: ['comience', 'comiences', 'comience', 'comencemos', 'comencéis', 'comiencen'],
      preterito_imperfecto: ['comenzara', 'comenzaras', 'comenzara', 'comenzáramos', 'comenzarais', 'comenzaran'],
    },
    imperativo: {
      afirmativo: ['-', 'comienza', 'comience', 'comencemos', 'comenzad', 'comiencen'],
      negativo: ['-', 'no comiences', 'no comience', 'no comencemos', 'no comencéis', 'no comiencen'],
    },
  },

  empezar: {
    infinitivo: 'empezar',
    gerundio: 'empezando',
    participio: 'empezado',
    indicativo: {
      presente: ['empiezo', 'empiezas', 'empieza', 'empezamos', 'empezáis', 'empiezan'],
      preterito_imperfecto: ['empezaba', 'empezabas', 'empezaba', 'empezábamos', 'empezabais', 'empezaban'],
      preterito_indefinido: ['empecé', 'empezaste', 'empezó', 'empezamos', 'empezasteis', 'empezaron'],
      futuro: ['empezaré', 'empezarás', 'empezará', 'empezaremos', 'empezaréis', 'empezarán'],
      condicional: ['empezaría', 'empezarías', 'empezaría', 'empezaríamos', 'empezaríais', 'empezarían'],
    },
    subjuntivo: {
      presente: ['empiece', 'empieces', 'empiece', 'empecemos', 'empecéis', 'empiecen'],
      preterito_imperfecto: ['empezara', 'empezaras', 'empezara', 'empezáramos', 'empezarais', 'empezaran'],
    },
    imperativo: {
      afirmativo: ['-', 'empieza', 'empiece', 'empecemos', 'empezad', 'empiecen'],
      negativo: ['-', 'no empieces', 'no empiece', 'no empecemos', 'no empecéis', 'no empiecen'],
    },
  },

  entender: {
    infinitivo: 'entender',
    gerundio: 'entendiendo',
    participio: 'entendido',
    indicativo: {
      presente: ['entiendo', 'entiendes', 'entiende', 'entendemos', 'entendéis', 'entienden'],
      preterito_imperfecto: ['entendía', 'entendías', 'entendía', 'entendíamos', 'entendíais', 'entendían'],
      preterito_indefinido: ['entendí', 'entendiste', 'entendió', 'entendimos', 'entendisteis', 'entendieron'],
      futuro: ['entenderé', 'entenderás', 'entenderá', 'entenderemos', 'entenderéis', 'entenderán'],
      condicional: ['entendería', 'entenderías', 'entendería', 'entenderíamos', 'entenderíais', 'entenderían'],
    },
    subjuntivo: {
      presente: ['entienda', 'entiendas', 'entienda', 'entendamos', 'entendáis', 'entiendan'],
      preterito_imperfecto: ['entendiera', 'entendieras', 'entendiera', 'entendiéramos', 'entendierais', 'entendieran'],
    },
    imperativo: {
      afirmativo: ['-', 'entiende', 'entienda', 'entendamos', 'entended', 'entiendan'],
      negativo: ['-', 'no entiendas', 'no entienda', 'no entendamos', 'no entendáis', 'no entiendan'],
    },
  },

  perder: {
    infinitivo: 'perder',
    gerundio: 'perdiendo',
    participio: 'perdido',
    indicativo: {
      presente: ['pierdo', 'pierdes', 'pierde', 'perdemos', 'perdéis', 'pierden'],
      preterito_imperfecto: ['perdía', 'perdías', 'perdía', 'perdíamos', 'perdíais', 'perdían'],
      preterito_indefinido: ['perdí', 'perdiste', 'perdió', 'perdimos', 'perdisteis', 'perdieron'],
      futuro: ['perderé', 'perderás', 'perderá', 'perderemos', 'perderéis', 'perderán'],
      condicional: ['perdería', 'perderías', 'perdería', 'perderíamos', 'perderíais', 'perderían'],
    },
    subjuntivo: {
      presente: ['pierda', 'pierdas', 'pierda', 'perdamos', 'perdáis', 'pierdan'],
      preterito_imperfecto: ['perdiera', 'perdieras', 'perdiera', 'perdiéramos', 'perdierais', 'perdieran'],
    },
    imperativo: {
      afirmativo: ['-', 'pierde', 'pierda', 'perdamos', 'perded', 'pierdan'],
      negativo: ['-', 'no pierdas', 'no pierda', 'no perdamos', 'no perdáis', 'no pierdan'],
    },
  },

  encontrar: {
    infinitivo: 'encontrar',
    gerundio: 'encontrando',
    participio: 'encontrado',
    indicativo: {
      presente: ['encuentro', 'encuentras', 'encuentra', 'encontramos', 'encontráis', 'encuentran'],
      preterito_imperfecto: ['encontraba', 'encontrabas', 'encontraba', 'encontrábamos', 'encontrabais', 'encontraban'],
      preterito_indefinido: ['encontré', 'encontraste', 'encontró', 'encontramos', 'encontrasteis', 'encontraron'],
      futuro: ['encontraré', 'encontrarás', 'encontrará', 'encontraremos', 'encontraréis', 'encontrarán'],
      condicional: ['encontraría', 'encontrarías', 'encontraría', 'encontraríamos', 'encontraríais', 'encontrarían'],
    },
    subjuntivo: {
      presente: ['encuentre', 'encuentres', 'encuentre', 'encontremos', 'encontréis', 'encuentren'],
      preterito_imperfecto: ['encontrara', 'encontraras', 'encontrara', 'encontráramos', 'encontrarais', 'encontraran'],
    },
    imperativo: {
      afirmativo: ['-', 'encuentra', 'encuentre', 'encontremos', 'encontrad', 'encuentren'],
      negativo: ['-', 'no encuentres', 'no encuentre', 'no encontremos', 'no encontréis', 'no encuentren'],
    },
  },

  mover: {
    infinitivo: 'mover',
    gerundio: 'moviendo',
    participio: 'movido',
    indicativo: {
      presente: ['muevo', 'mueves', 'mueve', 'movemos', 'movéis', 'mueven'],
      preterito_imperfecto: ['movía', 'movías', 'movía', 'movíamos', 'movíais', 'movían'],
      preterito_indefinido: ['moví', 'moviste', 'movió', 'movimos', 'movisteis', 'movieron'],
      futuro: ['moveré', 'moverás', 'moverá', 'moveremos', 'moveréis', 'moverán'],
      condicional: ['movería', 'moverías', 'movería', 'moveríamos', 'moveríais', 'moverían'],
    },
    subjuntivo: {
      presente: ['mueva', 'muevas', 'mueva', 'movamos', 'mováis', 'muevan'],
      preterito_imperfecto: ['moviera', 'movieras', 'moviera', 'moviéramos', 'movierais', 'movieran'],
    },
    imperativo: {
      afirmativo: ['-', 'mueve', 'mueva', 'movamos', 'moved', 'muevan'],
      negativo: ['-', 'no muevas', 'no mueva', 'no movamos', 'no mováis', 'no muevan'],
    },
  },

  mostrar: {
    infinitivo: 'mostrar',
    gerundio: 'mostrando',
    participio: 'mostrado',
    indicativo: {
      presente: ['muestro', 'muestras', 'muestra', 'mostramos', 'mostráis', 'muestran'],
      preterito_imperfecto: ['mostraba', 'mostrabas', 'mostraba', 'mostrábamos', 'mostrabais', 'mostraban'],
      preterito_indefinido: ['mostré', 'mostraste', 'mostró', 'mostramos', 'mostrasteis', 'mostraron'],
      futuro: ['mostraré', 'mostrarás', 'mostrará', 'mostraremos', 'mostraréis', 'mostrarán'],
      condicional: ['mostraría', 'mostrarías', 'mostraría', 'mostraríamos', 'mostraríais', 'mostrarían'],
    },
    subjuntivo: {
      presente: ['muestre', 'muestres', 'muestre', 'mostremos', 'mostréis', 'muestren'],
      preterito_imperfecto: ['mostrara', 'mostraras', 'mostrara', 'mostráramos', 'mostrarais', 'mostraran'],
    },
    imperativo: {
      afirmativo: ['-', 'muestra', 'muestre', 'mostremos', 'mostrad', 'muestren'],
      negativo: ['-', 'no muestres', 'no muestre', 'no mostremos', 'no mostréis', 'no muestren'],
    },
  },

  recordar: {
    infinitivo: 'recordar',
    gerundio: 'recordando',
    participio: 'recordado',
    indicativo: {
      presente: ['recuerdo', 'recuerdas', 'recuerda', 'recordamos', 'recordáis', 'recuerdan'],
      preterito_imperfecto: ['recordaba', 'recordabas', 'recordaba', 'recordábamos', 'recordabais', 'recordaban'],
      preterito_indefinido: ['recordé', 'recordaste', 'recordó', 'recordamos', 'recordasteis', 'recordaron'],
      futuro: ['recordaré', 'recordarás', 'recordará', 'recordaremos', 'recordaréis', 'recordarán'],
      condicional: ['recordaría', 'recordarías', 'recordaría', 'recordaríamos', 'recordaríais', 'recordarían'],
    },
    subjuntivo: {
      presente: ['recuerde', 'recuerdes', 'recuerde', 'recordemos', 'recordéis', 'recuerden'],
      preterito_imperfecto: ['recordara', 'recordaras', 'recordara', 'recordáramos', 'recordarais', 'recordaran'],
    },
    imperativo: {
      afirmativo: ['-', 'recuerda', 'recuerde', 'recordemos', 'recordad', 'recuerden'],
      negativo: ['-', 'no recuerdes', 'no recuerde', 'no recordemos', 'no recordéis', 'no recuerden'],
    },
  },

  probar: {
    infinitivo: 'probar',
    gerundio: 'probando',
    participio: 'probado',
    indicativo: {
      presente: ['pruebo', 'pruebas', 'prueba', 'probamos', 'probáis', 'prueban'],
      preterito_imperfecto: ['probaba', 'probabas', 'probaba', 'probábamos', 'probabais', 'probaban'],
      preterito_indefinido: ['probé', 'probaste', 'probó', 'probamos', 'probasteis', 'probaron'],
      futuro: ['probaré', 'probarás', 'probará', 'probaremos', 'probaréis', 'probarán'],
      condicional: ['probaría', 'probarías', 'probaría', 'probaríamos', 'probaríais', 'probarían'],
    },
    subjuntivo: {
      presente: ['pruebe', 'pruebes', 'pruebe', 'probemos', 'probéis', 'prueben'],
      preterito_imperfecto: ['probara', 'probaras', 'probara', 'probáramos', 'probarais', 'probaran'],
    },
    imperativo: {
      afirmativo: ['-', 'prueba', 'pruebe', 'probemos', 'probad', 'prueben'],
      negativo: ['-', 'no pruebes', 'no pruebe', 'no probemos', 'no probéis', 'no prueben'],
    },
  },

  cerrar: {
    infinitivo: 'cerrar',
    gerundio: 'cerrando',
    participio: 'cerrado',
    indicativo: {
      presente: ['cierro', 'cierras', 'cierra', 'cerramos', 'cerráis', 'cierran'],
      preterito_imperfecto: ['cerraba', 'cerrabas', 'cerraba', 'cerrábamos', 'cerrabais', 'cerraban'],
      preterito_indefinido: ['cerré', 'cerraste', 'cerró', 'cerramos', 'cerrasteis', 'cerraron'],
      futuro: ['cerraré', 'cerrarás', 'cerrará', 'cerraremos', 'cerraréis', 'cerrarán'],
      condicional: ['cerraría', 'cerrarías', 'cerraría', 'cerraríamos', 'cerraríais', 'cerrarían'],
    },
    subjuntivo: {
      presente: ['cierre', 'cierres', 'cierre', 'cerremos', 'cerréis', 'cierren'],
      preterito_imperfecto: ['cerrara', 'cerraras', 'cerrara', 'cerráramos', 'cerrarais', 'cerraran'],
    },
    imperativo: {
      afirmativo: ['-', 'cierra', 'cierre', 'cerremos', 'cerrad', 'cierren'],
      negativo: ['-', 'no cierres', 'no cierre', 'no cerremos', 'no cerréis', 'no cierren'],
    },
  },

  servir: {
    infinitivo: 'servir',
    gerundio: 'sirviendo',
    participio: 'servido',
    indicativo: {
      presente: ['sirvo', 'sirves', 'sirve', 'servimos', 'servís', 'sirven'],
      preterito_imperfecto: ['servía', 'servías', 'servía', 'servíamos', 'servíais', 'servían'],
      preterito_indefinido: ['serví', 'serviste', 'sirvió', 'servimos', 'servisteis', 'sirvieron'],
      futuro: ['serviré', 'servirás', 'servirá', 'serviremos', 'serviréis', 'servirán'],
      condicional: ['serviría', 'servirías', 'serviría', 'serviríamos', 'serviríais', 'servirían'],
    },
    subjuntivo: {
      presente: ['sirva', 'sirvas', 'sirva', 'sirvamos', 'sirváis', 'sirvan'],
      preterito_imperfecto: ['sirviera', 'sirvieras', 'sirviera', 'sirviéramos', 'sirvierais', 'sirvieran'],
    },
    imperativo: {
      afirmativo: ['-', 'sirve', 'sirva', 'sirvamos', 'servid', 'sirvan'],
      negativo: ['-', 'no sirvas', 'no sirva', 'no sirvamos', 'no sirváis', 'no sirvan'],
    },
  },

  preferir: {
    infinitivo: 'preferir',
    gerundio: 'prefiriendo',
    participio: 'preferido',
    indicativo: {
      presente: ['prefiero', 'prefieres', 'prefiere', 'preferimos', 'preferís', 'prefieren'],
      preterito_imperfecto: ['prefería', 'preferías', 'prefería', 'preferíamos', 'preferíais', 'preferían'],
      preterito_indefinido: ['preferí', 'preferiste', 'prefirió', 'preferimos', 'preferisteis', 'prefirieron'],
      futuro: ['preferiré', 'preferirás', 'preferirá', 'preferiremos', 'preferiréis', 'preferirán'],
      condicional: ['preferiría', 'preferirías', 'preferiría', 'preferiríamos', 'preferiríais', 'preferirían'],
    },
    subjuntivo: {
      presente: ['prefiera', 'prefieras', 'prefiera', 'prefiramos', 'prefiráis', 'prefieran'],
      preterito_imperfecto: ['prefiriera', 'prefirieras', 'prefiriera', 'prefiriéramos', 'prefirierais', 'prefirieran'],
    },
    imperativo: {
      afirmativo: ['-', 'prefiere', 'prefiera', 'prefiramos', 'preferid', 'prefieran'],
      negativo: ['-', 'no prefieras', 'no prefiera', 'no prefiramos', 'no prefiráis', 'no prefieran'],
    },
  },

  repetir: {
    infinitivo: 'repetir',
    gerundio: 'repitiendo',
    participio: 'repetido',
    indicativo: {
      presente: ['repito', 'repites', 'repite', 'repetimos', 'repetís', 'repiten'],
      preterito_imperfecto: ['repetía', 'repetías', 'repetía', 'repetíamos', 'repetíais', 'repetían'],
      preterito_indefinido: ['repetí', 'repetiste', 'repitió', 'repetimos', 'repetisteis', 'repitieron'],
      futuro: ['repetiré', 'repetirás', 'repetirá', 'repetiremos', 'repetiréis', 'repetirán'],
      condicional: ['repetiría', 'repetirías', 'repetiría', 'repetiríamos', 'repetiríais', 'repetirían'],
    },
    subjuntivo: {
      presente: ['repita', 'repitas', 'repita', 'repitamos', 'repitáis', 'repitan'],
      preterito_imperfecto: ['repitiera', 'repitieras', 'repitiera', 'repitiéramos', 'repitierais', 'repitieran'],
    },
    imperativo: {
      afirmativo: ['-', 'repite', 'repita', 'repitamos', 'repetid', 'repitan'],
      negativo: ['-', 'no repitas', 'no repita', 'no repitamos', 'no repitáis', 'no repitan'],
    },
  },

  conducir: {
    infinitivo: 'conducir',
    gerundio: 'conduciendo',
    participio: 'conducido',
    indicativo: {
      presente: ['conduzco', 'conduces', 'conduce', 'conducimos', 'conducís', 'conducen'],
      preterito_imperfecto: ['conducía', 'conducías', 'conducía', 'conducíamos', 'conducíais', 'conducían'],
      preterito_indefinido: ['conduje', 'condujiste', 'condujo', 'condujimos', 'condujisteis', 'condujeron'],
      futuro: ['conduciré', 'conducirás', 'conducirá', 'conduciremos', 'conduciréis', 'conducirán'],
      condicional: ['conduciría', 'conducirías', 'conduciría', 'conduciríamos', 'conduciríais', 'conducirían'],
    },
    subjuntivo: {
      presente: ['conduzca', 'conduzcas', 'conduzca', 'conduzcamos', 'conduzcáis', 'conduzcan'],
      preterito_imperfecto: ['condujera', 'condujeras', 'condujera', 'condujéramos', 'condujerais', 'condujeran'],
    },
    imperativo: {
      afirmativo: ['-', 'conduce', 'conduzca', 'conduzcamos', 'conducid', 'conduzcan'],
      negativo: ['-', 'no conduzcas', 'no conduzca', 'no conduzcamos', 'no conduzcáis', 'no conduzcan'],
    },
  },

  producir: {
    infinitivo: 'producir',
    gerundio: 'produciendo',
    participio: 'producido',
    indicativo: {
      presente: ['produzco', 'produces', 'produce', 'producimos', 'producís', 'producen'],
      preterito_imperfecto: ['producía', 'producías', 'producía', 'producíamos', 'producíais', 'producían'],
      preterito_indefinido: ['produje', 'produjiste', 'produjo', 'produjimos', 'produjisteis', 'produjeron'],
      futuro: ['produciré', 'producirás', 'producirá', 'produciremos', 'produciréis', 'producirán'],
      condicional: ['produciría', 'producirías', 'produciría', 'produciríamos', 'produciríais', 'producirían'],
    },
    subjuntivo: {
      presente: ['produzca', 'produzcas', 'produzca', 'produzcamos', 'produzcáis', 'produzcan'],
      preterito_imperfecto: ['produjera', 'produjeras', 'produjera', 'produjéramos', 'produjerais', 'produjeran'],
    },
    imperativo: {
      afirmativo: ['-', 'produce', 'produzca', 'produzcamos', 'producid', 'produzcan'],
      negativo: ['-', 'no produzcas', 'no produzca', 'no produzcamos', 'no produzcáis', 'no produzcan'],
    },
  },

  traducir: {
    infinitivo: 'traducir',
    gerundio: 'traduciendo',
    participio: 'traducido',
    indicativo: {
      presente: ['traduzco', 'traduces', 'traduce', 'traducimos', 'traducís', 'traducen'],
      preterito_imperfecto: ['traducía', 'traducías', 'traducía', 'traducíamos', 'traducíais', 'traducían'],
      preterito_indefinido: ['traduje', 'tradujiste', 'tradujo', 'tradujimos', 'tradujisteis', 'tradujeron'],
      futuro: ['traduciré', 'traducirás', 'traducirá', 'traduciremos', 'traduciréis', 'traducirán'],
      condicional: ['traduciría', 'traducirías', 'traduciría', 'traduciríamos', 'traduciríais', 'traducirían'],
    },
    subjuntivo: {
      presente: ['traduzca', 'traduzcas', 'traduzca', 'traduzcamos', 'traduzcáis', 'traduzcan'],
      preterito_imperfecto: ['tradujera', 'tradujeras', 'tradujera', 'tradujéramos', 'tradujerais', 'tradujeran'],
    },
    imperativo: {
      afirmativo: ['-', 'traduce', 'traduzca', 'traduzcamos', 'traducid', 'traduzcan'],
      negativo: ['-', 'no traduzcas', 'no traduzca', 'no traduzcamos', 'no traduzcáis', 'no traduzcan'],
    },
  },

  reducir: {
    infinitivo: 'reducir',
    gerundio: 'reduciendo',
    participio: 'reducido',
    indicativo: {
      presente: ['reduzco', 'reduces', 'reduce', 'reducimos', 'reducís', 'reducen'],
      preterito_imperfecto: ['reducía', 'reducías', 'reducía', 'reducíamos', 'reducíais', 'reducían'],
      preterito_indefinido: ['reduje', 'redujiste', 'redujo', 'redujimos', 'redujisteis', 'redujeron'],
      futuro: ['reduciré', 'reducirás', 'reducirá', 'reduciremos', 'reduciréis', 'reducirán'],
      condicional: ['reduciría', 'reducirías', 'reduciría', 'reduciríamos', 'reduciríais', 'reducirían'],
    },
    subjuntivo: {
      presente: ['reduzca', 'reduzcas', 'reduzca', 'reduzcamos', 'reduzcáis', 'reduzcan'],
      preterito_imperfecto: ['redujera', 'redujeras', 'redujera', 'redujéramos', 'redujerais', 'redujeran'],
    },
    imperativo: {
      afirmativo: ['-', 'reduce', 'reduzca', 'reduzcamos', 'reducid', 'reduzcan'],
      negativo: ['-', 'no reduzcas', 'no reduzca', 'no reduzcamos', 'no reduzcáis', 'no reduzcan'],
    },
  },

  destruir: {
    infinitivo: 'destruir',
    gerundio: 'destruyendo',
    participio: 'destruido',
    indicativo: {
      presente: ['destruyo', 'destruyes', 'destruye', 'destruimos', 'destruís', 'destruyen'],
      preterito_imperfecto: ['destruía', 'destruías', 'destruía', 'destruíamos', 'destruíais', 'destruían'],
      preterito_indefinido: ['destruí', 'destruiste', 'destruyó', 'destruimos', 'destruisteis', 'destruyeron'],
      futuro: ['destruiré', 'destruirás', 'destruirá', 'destruiremos', 'destruiréis', 'destruirán'],
      condicional: ['destruiría', 'destruirías', 'destruiría', 'destruiríamos', 'destruiríais', 'destruirían'],
    },
    subjuntivo: {
      presente: ['destruya', 'destruyas', 'destruya', 'destruyamos', 'destruyáis', 'destruyan'],
      preterito_imperfecto: ['destruyera', 'destruyeras', 'destruyera', 'destruyéramos', 'destruyerais', 'destruyeran'],
    },
    imperativo: {
      afirmativo: ['-', 'destruye', 'destruya', 'destruyamos', 'destruid', 'destruyan'],
      negativo: ['-', 'no destruyas', 'no destruya', 'no destruyamos', 'no destruyáis', 'no destruyan'],
    },
  },

  construir: {
    infinitivo: 'construir',
    gerundio: 'construyendo',
    participio: 'construido',
    indicativo: {
      presente: ['construyo', 'construyes', 'construye', 'construimos', 'construís', 'construyen'],
      preterito_imperfecto: ['construía', 'construías', 'construía', 'construíamos', 'construíais', 'construían'],
      preterito_indefinido: ['construí', 'construiste', 'construyó', 'construimos', 'construisteis', 'construyeron'],
      futuro: ['construiré', 'construirás', 'construirá', 'construiremos', 'construiréis', 'construirán'],
      condicional: ['construiría', 'construirías', 'construiría', 'construiríamos', 'construiríais', 'construirían'],
    },
    subjuntivo: {
      presente: ['construya', 'construyas', 'construya', 'construyamos', 'construyáis', 'construyan'],
      preterito_imperfecto: ['construyera', 'construyeras', 'construyera', 'construyéramos', 'construyerais', 'construyeran'],
    },
    imperativo: {
      afirmativo: ['-', 'construye', 'construya', 'construyamos', 'construid', 'construyan'],
      negativo: ['-', 'no construyas', 'no construya', 'no construyamos', 'no construyáis', 'no construyan'],
    },
  },

  huir: {
    infinitivo: 'huir',
    gerundio: 'huyendo',
    participio: 'huido',
    indicativo: {
      presente: ['huyo', 'huyes', 'huye', 'huimos', 'huís', 'huyen'],
      preterito_imperfecto: ['huía', 'huías', 'huía', 'huíamos', 'huíais', 'huían'],
      preterito_indefinido: ['huí', 'huiste', 'huyó', 'huimos', 'huisteis', 'huyeron'],
      futuro: ['huiré', 'huirás', 'huirá', 'huiremos', 'huiréis', 'huirán'],
      condicional: ['huiría', 'huirías', 'huiría', 'huiríamos', 'huiríais', 'huirían'],
    },
    subjuntivo: {
      presente: ['huya', 'huyas', 'huya', 'huyamos', 'huyáis', 'huyan'],
      preterito_imperfecto: ['huyera', 'huyeras', 'huyera', 'huyéramos', 'huyerais', 'huyeran'],
    },
    imperativo: {
      afirmativo: ['-', 'huye', 'huya', 'huyamos', 'huid', 'huyan'],
      negativo: ['-', 'no huyas', 'no huya', 'no huyamos', 'no huyáis', 'no huyan'],
    },
  },

  incluir: {
    infinitivo: 'incluir',
    gerundio: 'incluyendo',
    participio: 'incluido',
    indicativo: {
      presente: ['incluyo', 'incluyes', 'incluye', 'incluimos', 'incluís', 'incluyen'],
      preterito_imperfecto: ['incluía', 'incluías', 'incluía', 'incluíamos', 'incluíais', 'incluían'],
      preterito_indefinido: ['incluí', 'incluiste', 'incluyó', 'incluimos', 'incluisteis', 'incluyeron'],
      futuro: ['incluiré', 'incluirás', 'incluirá', 'incluiremos', 'incluiréis', 'incluirán'],
      condicional: ['incluiría', 'incluirías', 'incluiría', 'incluiríamos', 'incluiríais', 'incluirían'],
    },
    subjuntivo: {
      presente: ['incluya', 'incluyas', 'incluya', 'incluyamos', 'incluyáis', 'incluyan'],
      preterito_imperfecto: ['incluyera', 'incluyeras', 'incluyera', 'incluyéramos', 'incluyerais', 'incluyeran'],
    },
    imperativo: {
      afirmativo: ['-', 'incluye', 'incluya', 'incluyamos', 'incluid', 'incluyan'],
      negativo: ['-', 'no incluyas', 'no incluya', 'no incluyamos', 'no incluyáis', 'no incluyan'],
    },
  },

  concluir: {
    infinitivo: 'concluir',
    gerundio: 'concluyendo',
    participio: 'concluido',
    indicativo: {
      presente: ['concluyo', 'concluyes', 'concluye', 'concluimos', 'concluís', 'concluyen'],
      preterito_imperfecto: ['concluía', 'concluías', 'concluía', 'concluíamos', 'concluíais', 'concluían'],
      preterito_indefinido: ['concluí', 'concluiste', 'concluyó', 'concluimos', 'concluisteis', 'concluyeron'],
      futuro: ['concluiré', 'concluirás', 'concluirá', 'concluiremos', 'concluiréis', 'concluirán'],
      condicional: ['concluiría', 'concluirías', 'concluiría', 'concluiríamos', 'concluiríais', 'concluirían'],
    },
    subjuntivo: {
      presente: ['concluya', 'concluyas', 'concluya', 'concluyamos', 'concluyáis', 'concluyan'],
      preterito_imperfecto: ['concluyera', 'concluyeras', 'concluyera', 'concluyéramos', 'concluyerais', 'concluyeran'],
    },
    imperativo: {
      afirmativo: ['-', 'concluye', 'concluya', 'concluyamos', 'concluid', 'concluyan'],
      negativo: ['-', 'no concluyas', 'no concluya', 'no concluyamos', 'no concluyáis', 'no concluyan'],
    },
  },

  caber: {
    infinitivo: 'caber',
    gerundio: 'cabiendo',
    participio: 'cabido',
    indicativo: {
      presente: ['quepo', 'cabes', 'cabe', 'cabemos', 'cabéis', 'caben'],
      preterito_imperfecto: ['cabía', 'cabías', 'cabía', 'cabíamos', 'cabíais', 'cabían'],
      preterito_indefinido: ['cupe', 'cupiste', 'cupo', 'cupimos', 'cupisteis', 'cupieron'],
      futuro: ['cabré', 'cabrás', 'cabrá', 'cabremos', 'cabréis', 'cabrán'],
      condicional: ['cabría', 'cabrías', 'cabría', 'cabríamos', 'cabríais', 'cabrían'],
    },
    subjuntivo: {
      presente: ['quepa', 'quepas', 'quepa', 'quepamos', 'quepáis', 'quepan'],
      preterito_imperfecto: ['cupiera', 'cupieras', 'cupiera', 'cupiéramos', 'cupierais', 'cupieran'],
    },
    imperativo: {
      afirmativo: ['-', 'cabe', 'quepa', 'quepamos', 'cabed', 'quepan'],
      negativo: ['-', 'no quepas', 'no quepa', 'no quepamos', 'no quepáis', 'no quepan'],
    },
  },

  valer: {
    infinitivo: 'valer',
    gerundio: 'valiendo',
    participio: 'valido',
    indicativo: {
      presente: ['valgo', 'vales', 'vale', 'valemos', 'valéis', 'valen'],
      preterito_imperfecto: ['valía', 'valías', 'valía', 'valíamos', 'valíais', 'valían'],
      preterito_indefinido: ['valí', 'valiste', 'valió', 'valimos', 'valisteis', 'valieron'],
      futuro: ['valdré', 'valdrás', 'valdrá', 'valdremos', 'valdréis', 'valdrán'],
      condicional: ['valdría', 'valdrías', 'valdría', 'valdríamos', 'valdríais', 'valdrían'],
    },
    subjuntivo: {
      presente: ['valga', 'valgas', 'valga', 'valgamos', 'valgáis', 'valgan'],
      preterito_imperfecto: ['valiera', 'valieras', 'valiera', 'valiéramos', 'valierais', 'valieran'],
    },
    imperativo: {
      afirmativo: ['-', 'vale', 'valga', 'valgamos', 'valed', 'valgan'],
      negativo: ['-', 'no valgas', 'no valga', 'no valgamos', 'no valgáis', 'no valgan'],
    },
  },

  satisfacer: {
    infinitivo: 'satisfacer',
    gerundio: 'satisfaciendo',
    participio: 'satisfecho',
    indicativo: {
      presente: ['satisfago', 'satisfaces', 'satisface', 'satisfacemos', 'satisfacéis', 'satisfacen'],
      preterito_imperfecto: ['satisfacía', 'satisfacías', 'satisfacía', 'satisfacíamos', 'satisfacíais', 'satisfacían'],
      preterito_indefinido: ['satisfice', 'satisficiste', 'satisfizo', 'satisficimos', 'satisficisteis', 'satisficieron'],
      futuro: ['satisfaré', 'satisfarás', 'satisfará', 'satisfaremos', 'satisfaréis', 'satisfarán'],
      condicional: ['satisfaría', 'satisfarías', 'satisfaría', 'satisfaríamos', 'satisfaríais', 'satisfarían'],
    },
    subjuntivo: {
      presente: ['satisfaga', 'satisfagas', 'satisfaga', 'satisfagamos', 'satisfagáis', 'satisfagan'],
      preterito_imperfecto: ['satisficiera', 'satisficieras', 'satisficiera', 'satisficiéramos', 'satisficierais', 'satisficieran'],
    },
    imperativo: {
      afirmativo: ['-', 'satisfaz', 'satisfaga', 'satisfagamos', 'satisfaced', 'satisfagan'],
      negativo: ['-', 'no satisfagas', 'no satisfaga', 'no satisfagamos', 'no satisfagáis', 'no satisfagan'],
    },
  },

  andar: {
    infinitivo: 'andar',
    gerundio: 'andando',
    participio: 'andado',
    indicativo: {
      presente: ['ando', 'andas', 'anda', 'andamos', 'andáis', 'andan'],
      preterito_imperfecto: ['andaba', 'andabas', 'andaba', 'andábamos', 'andabais', 'andaban'],
      preterito_indefinido: ['anduve', 'anduviste', 'anduvo', 'anduvimos', 'anduvisteis', 'anduvieron'],
      futuro: ['andaré', 'andarás', 'andará', 'andaremos', 'andaréis', 'andarán'],
      condicional: ['andaría', 'andarías', 'andaría', 'andaríamos', 'andaríais', 'andarían'],
    },
    subjuntivo: {
      presente: ['ande', 'andes', 'ande', 'andemos', 'andéis', 'anden'],
      preterito_imperfecto: ['anduviera', 'anduvieras', 'anduviera', 'anduviéramos', 'anduvierais', 'anduvieran'],
    },
    imperativo: {
      afirmativo: ['-', 'anda', 'ande', 'andemos', 'andad', 'anden'],
      negativo: ['-', 'no andes', 'no ande', 'no andemos', 'no andéis', 'no anden'],
    },
  },

  nacer: {
    infinitivo: 'nacer',
    gerundio: 'naciendo',
    participio: 'nacido',
    indicativo: {
      presente: ['nazco', 'naces', 'nace', 'nacemos', 'nacéis', 'nacen'],
      preterito_imperfecto: ['nacía', 'nacías', 'nacía', 'nacíamos', 'nacíais', 'nacían'],
      preterito_indefinido: ['nací', 'naciste', 'nació', 'nacimos', 'nacisteis', 'nacieron'],
      futuro: ['naceré', 'nacerás', 'nacerá', 'naceremos', 'naceréis', 'nacerán'],
      condicional: ['nacería', 'nacerías', 'nacería', 'naceríamos', 'naceríais', 'nacerían'],
    },
    subjuntivo: {
      presente: ['nazca', 'nazcas', 'nazca', 'nazcamos', 'nazcáis', 'nazcan'],
      preterito_imperfecto: ['naciera', 'nacieras', 'naciera', 'naciéramos', 'nacierais', 'nacieran'],
    },
    imperativo: {
      afirmativo: ['-', 'nace', 'nazca', 'nazcamos', 'naced', 'nazcan'],
      negativo: ['-', 'no nazcas', 'no nazca', 'no nazcamos', 'no nazcáis', 'no nazcan'],
    },
  },

  parecer: {
    infinitivo: 'parecer',
    gerundio: 'pareciendo',
    participio: 'parecido',
    indicativo: {
      presente: ['parezco', 'pareces', 'parece', 'parecemos', 'parecéis', 'parecen'],
      preterito_imperfecto: ['parecía', 'parecías', 'parecía', 'parecíamos', 'parecíais', 'parecían'],
      preterito_indefinido: ['parecí', 'pareciste', 'pareció', 'parecimos', 'parecisteis', 'parecieron'],
      futuro: ['pareceré', 'parecerás', 'parecerá', 'pareceremos', 'pareceréis', 'parecerán'],
      condicional: ['parecería', 'parecerías', 'parecería', 'pareceríamos', 'pareceríais', 'parecerían'],
    },
    subjuntivo: {
      presente: ['parezca', 'parezcas', 'parezca', 'parezcamos', 'parezcáis', 'parezcan'],
      preterito_imperfecto: ['pareciera', 'parecieras', 'pareciera', 'pareciéramos', 'parecierais', 'parecieran'],
    },
    imperativo: {
      afirmativo: ['-', 'parece', 'parezca', 'parezcamos', 'pareced', 'parezcan'],
      negativo: ['-', 'no parezcas', 'no parezca', 'no parezcamos', 'no parezcáis', 'no parezcan'],
    },
  },

  crecer: {
    infinitivo: 'crecer',
    gerundio: 'creciendo',
    participio: 'crecido',
    indicativo: {
      presente: ['crezco', 'creces', 'crece', 'crecemos', 'crecéis', 'crecen'],
      preterito_imperfecto: ['crecía', 'crecías', 'crecía', 'crecíamos', 'crecíais', 'crecían'],
      preterito_indefinido: ['crecí', 'creciste', 'creció', 'crecimos', 'crecisteis', 'crecieron'],
      futuro: ['creceré', 'crecerás', 'crecerá', 'creceremos', 'creceréis', 'crecerán'],
      condicional: ['crecería', 'crecerías', 'crecería', 'creceríamos', 'creceríais', 'crecerían'],
    },
    subjuntivo: {
      presente: ['crezca', 'crezcas', 'crezca', 'crezcamos', 'crezcáis', 'crezcan'],
      preterito_imperfecto: ['creciera', 'crecieras', 'creciera', 'creciéramos', 'crecierais', 'crecieran'],
    },
    imperativo: {
      afirmativo: ['-', 'crece', 'crezca', 'crezcamos', 'creced', 'crezcan'],
      negativo: ['-', 'no crezcas', 'no crezca', 'no crezcamos', 'no crezcáis', 'no crezcan'],
    },
  },

  ofrecer: {
    infinitivo: 'ofrecer',
    gerundio: 'ofreciendo',
    participio: 'ofrecido',
    indicativo: {
      presente: ['ofrezco', 'ofreces', 'ofrece', 'ofrecemos', 'ofrecéis', 'ofrecen'],
      preterito_imperfecto: ['ofrecía', 'ofrecías', 'ofrecía', 'ofrecíamos', 'ofrecíais', 'ofrecían'],
      preterito_indefinido: ['ofrecí', 'ofreciste', 'ofreció', 'ofrecimos', 'ofrecisteis', 'ofrecieron'],
      futuro: ['ofreceré', 'ofrecerás', 'ofrecerá', 'ofreceremos', 'ofreceréis', 'ofrecerán'],
      condicional: ['ofrecería', 'ofrecerías', 'ofrecería', 'ofreceríamos', 'ofreceríais', 'ofrecerían'],
    },
    subjuntivo: {
      presente: ['ofrezca', 'ofrezcas', 'ofrezca', 'ofrezcamos', 'ofrezcáis', 'ofrezcan'],
      preterito_imperfecto: ['ofreciera', 'ofrecieras', 'ofreciera', 'ofreciéramos', 'ofrecierais', 'ofrecieran'],
    },
    imperativo: {
      afirmativo: ['-', 'ofrece', 'ofrezca', 'ofrezcamos', 'ofreced', 'ofrezcan'],
      negativo: ['-', 'no ofrezcas', 'no ofrezca', 'no ofrezcamos', 'no ofrezcáis', 'no ofrezcan'],
    },
  },

  establecer: {
    infinitivo: 'establecer',
    gerundio: 'estableciendo',
    participio: 'establecido',
    indicativo: {
      presente: ['establezco', 'estableces', 'establece', 'establecemos', 'establecéis', 'establecen'],
      preterito_imperfecto: ['establecía', 'establecías', 'establecía', 'establecíamos', 'establecíais', 'establecían'],
      preterito_indefinido: ['establecí', 'estableciste', 'estableció', 'establecimos', 'establecisteis', 'establecieron'],
      futuro: ['estableceré', 'establecerás', 'establecerá', 'estableceremos', 'estableceréis', 'establecerán'],
      condicional: ['establecería', 'establecerías', 'establecería', 'estableceríamos', 'estableceríais', 'establecerían'],
    },
    subjuntivo: {
      presente: ['establezca', 'establezcas', 'establezca', 'establezcamos', 'establezcáis', 'establezcan'],
      preterito_imperfecto: ['estableciera', 'establecieras', 'estableciera', 'estableciéramos', 'establecierais', 'establecieran'],
    },
    imperativo: {
      afirmativo: ['-', 'establece', 'establezca', 'establezcamos', 'estableced', 'establezcan'],
      negativo: ['-', 'no establezcas', 'no establezca', 'no establezcamos', 'no establezcáis', 'no establezcan'],
    },
  },
};

// Lista de infinitivos disponibles para búsqueda
export const listaVerbosIrregulares = Object.keys(verbosIrregulares);
