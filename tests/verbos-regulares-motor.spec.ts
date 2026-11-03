import { test, expect } from '@playwright/test';
import {
  VERBOS_REGULARES, pasadosRegulares, reglaOrtografia, terminacionDe, pasadoRegularCorrecto,
  explicarOrtografia, explicarPronunciacion, type Terminacion, type VerboRegular,
} from '../app/quiz-verbos-irregulares/regulares';
import { verbosIrregulares } from '../data/verbos-irregulares';

/**
 * Motor de la práctica de verbos regulares de quiz-verbos-irregulares (S0246), con casos resueltos
 * A MANO antes de escribir la vista.
 *
 * El CANON escribe, verbo a verbo, el pasado y cómo suena la -ed tal como los dan Cambridge
 * Dictionary y Oxford Learner's Dictionaries. No sale del motor: si el motor o el banco se
 * equivocan, este fichero no se equivoca con ellos.
 */
const CANON: Record<string, { pasado: string[]; suena: Terminacion }> = {
  work: { pasado: ['worked'], suena: 't' },
  walk: { pasado: ['walked'], suena: 't' },
  look: { pasado: ['looked'], suena: 't' },
  talk: { pasado: ['talked'], suena: 't' },
  cook: { pasado: ['cooked'], suena: 't' },
  like: { pasado: ['liked'], suena: 't' },
  ask: { pasado: ['asked'], suena: 't' },
  help: { pasado: ['helped'], suena: 't' },
  hope: { pasado: ['hoped'], suena: 't' },
  stop: { pasado: ['stopped'], suena: 't' },
  drop: { pasado: ['dropped'], suena: 't' },
  shop: { pasado: ['shopped'], suena: 't' },
  jump: { pasado: ['jumped'], suena: 't' },
  laugh: { pasado: ['laughed'], suena: 't' },
  cough: { pasado: ['coughed'], suena: 't' },
  kiss: { pasado: ['kissed'], suena: 't' },
  miss: { pasado: ['missed'], suena: 't' },
  dance: { pasado: ['danced'], suena: 't' },
  fix: { pasado: ['fixed'], suena: 't' },
  mix: { pasado: ['mixed'], suena: 't' },
  relax: { pasado: ['relaxed'], suena: 't' },
  wash: { pasado: ['washed'], suena: 't' },
  finish: { pasado: ['finished'], suena: 't' },
  push: { pasado: ['pushed'], suena: 't' },
  brush: { pasado: ['brushed'], suena: 't' },
  watch: { pasado: ['watched'], suena: 't' },
  touch: { pasado: ['touched'], suena: 't' },
  want: { pasado: ['wanted'], suena: 'id' },
  start: { pasado: ['started'], suena: 'id' },
  visit: { pasado: ['visited'], suena: 'id' },
  wait: { pasado: ['waited'], suena: 'id' },
  hate: { pasado: ['hated'], suena: 'id' },
  invite: { pasado: ['invited'], suena: 'id' },
  admit: { pasado: ['admitted'], suena: 'id' },
  chat: { pasado: ['chatted'], suena: 'id' },
  count: { pasado: ['counted'], suena: 'id' },
  need: { pasado: ['needed'], suena: 'id' },
  decide: { pasado: ['decided'], suena: 'id' },
  end: { pasado: ['ended'], suena: 'id' },
  add: { pasado: ['added'], suena: 'id' },
  play: { pasado: ['played'], suena: 'd' },
  stay: { pasado: ['stayed'], suena: 'd' },
  enjoy: { pasado: ['enjoyed'], suena: 'd' },
  study: { pasado: ['studied'], suena: 'd' },
  carry: { pasado: ['carried'], suena: 'd' },
  worry: { pasado: ['worried'], suena: 'd' },
  try: { pasado: ['tried'], suena: 'd' },
  cry: { pasado: ['cried'], suena: 'd' },
  die: { pasado: ['died'], suena: 'd' },
  agree: { pasado: ['agreed'], suena: 'd' },
  open: { pasado: ['opened'], suena: 'd' },
  listen: { pasado: ['listened'], suena: 'd' },
  happen: { pasado: ['happened'], suena: 'd' },
  clean: { pasado: ['cleaned'], suena: 'd' },
  plan: { pasado: ['planned'], suena: 'd' },
  live: { pasado: ['lived'], suena: 'd' },
  love: { pasado: ['loved'], suena: 'd' },
  arrive: { pasado: ['arrived'], suena: 'd' },
  move: { pasado: ['moved'], suena: 'd' },
  close: { pasado: ['closed'], suena: 'd' },
  answer: { pasado: ['answered'], suena: 'd' },
  remember: { pasado: ['remembered'], suena: 'd' },
  offer: { pasado: ['offered'], suena: 'd' },
  prefer: { pasado: ['preferred'], suena: 'd' },
  call: { pasado: ['called'], suena: 'd' },
  smile: { pasado: ['smiled'], suena: 'd' },
  travel: { pasado: ['travelled', 'traveled'], suena: 'd' },
  cancel: { pasado: ['cancelled', 'canceled'], suena: 'd' },
  control: { pasado: ['controlled'], suena: 'd' },
  climb: { pasado: ['climbed'], suena: 'd' },
  change: { pasado: ['changed'], suena: 'd' },
  rob: { pasado: ['robbed'], suena: 'd' },
  beg: { pasado: ['begged'], suena: 'd' },
  hug: { pasado: ['hugged'], suena: 'd' },
};

const verbo = (inf: string): VerboRegular => {
  const v = VERBOS_REGULARES.find((x) => x.infinitivo === inf);
  if (!v) throw new Error(`no está en el banco: ${inf}`);
  return v;
};

test.describe('Banco', () => {
  test('el banco y el canon tienen exactamente los mismos verbos, sin repetir', () => {
    const banco = VERBOS_REGULARES.map((v) => v.infinitivo);
    expect(new Set(banco).size).toBe(banco.length);
    expect([...banco].sort()).toEqual(Object.keys(CANON).sort());
  });

  test('ningún verbo regular está también en el banco de irregulares', () => {
    const irregulares = new Set(verbosIrregulares.map((v) => v.infinitive));
    expect(VERBOS_REGULARES.filter((v) => irregulares.has(v.infinitivo)).map((v) => v.infinitivo)).toEqual([]);
  });

  test('hay de las tres terminaciones, para que la pregunta de pronunciación no se acierte siempre igual', () => {
    const cuenta = { t: 0, d: 0, id: 0 };
    for (const v of VERBOS_REGULARES) cuenta[terminacionDe(v)]++;
    expect(cuenta.t).toBeGreaterThanOrEqual(10);
    expect(cuenta.d).toBeGreaterThanOrEqual(10);
    expect(cuenta.id).toBeGreaterThanOrEqual(10);
  });
});

test.describe('Canon verbo a verbo', () => {
  for (const [inf, esperado] of Object.entries(CANON)) {
    test(`${inf} → ${esperado.pasado.join(' / ')} · -ed suena /${esperado.suena}/`, () => {
      const v = verbo(inf);
      expect(pasadosRegulares(v)).toEqual(esperado.pasado);
      expect(terminacionDe(v)).toBe(esperado.suena);
    });
  }
});

test.describe('Reglas de ortografía', () => {
  test('cada regla con su verbo de ejemplo', () => {
    expect(reglaOrtografia(verbo('like'))).toBe('e');
    expect(reglaOrtografia(verbo('study'))).toBe('consonante-y');
    expect(reglaOrtografia(verbo('play'))).toBe('vocal-y');
    expect(reglaOrtografia(verbo('stop'))).toBe('duplica');
    expect(reglaOrtografia(verbo('prefer'))).toBe('duplica');
    expect(reglaOrtografia(verbo('travel'))).toBe('l-britanica');
    expect(reglaOrtografia(verbo('visit'))).toBe('atona');
    expect(reglaOrtografia(verbo('fix'))).toBe('wx');
    expect(reglaOrtografia(verbo('work'))).toBe('general');
  });

  test('dos vocales escritas antes de la consonante no doblan: cook, wait, clean, need', () => {
    for (const inf of ['cook', 'wait', 'clean', 'need']) expect(reglaOrtografia(verbo(inf))).toBe('general');
  });

  test('la tonicidad decide: admit dobla y visit no, con la misma terminación -it', () => {
    expect(pasadosRegulares(verbo('admit'))).toEqual(['admitted']);
    expect(pasadosRegulares(verbo('visit'))).toEqual(['visited']);
  });

  test('una l tónica dobla en las dos variedades: control → controlled, sin «controled»', () => {
    expect(pasadoRegularCorrecto(verbo('control'), 'controlled')).toBe(true);
    expect(pasadoRegularCorrecto(verbo('control'), 'controled')).toBe(false);
  });
});

test.describe('Corrección de lo escrito', () => {
  test('mayúsculas, espacios y punto final no cuentan', () => {
    expect(pasadoRegularCorrecto(verbo('study'), '  Studied. ')).toBe(true);
  });

  test('travel admite travelled y traveled; las dos juntas también', () => {
    expect(pasadoRegularCorrecto(verbo('travel'), 'travelled')).toBe(true);
    expect(pasadoRegularCorrecto(verbo('travel'), 'traveled')).toBe(true);
    expect(pasadoRegularCorrecto(verbo('travel'), 'travelled / traveled')).toBe(true);
  });

  test('los errores típicos se dan por malos', () => {
    expect(pasadoRegularCorrecto(verbo('study'), 'studyed')).toBe(false);
    expect(pasadoRegularCorrecto(verbo('stop'), 'stoped')).toBe(false);
    expect(pasadoRegularCorrecto(verbo('like'), 'likeed')).toBe(false);
    expect(pasadoRegularCorrecto(verbo('play'), 'plaied')).toBe(false);
    expect(pasadoRegularCorrecto(verbo('visit'), 'visitted')).toBe(false);
    expect(pasadoRegularCorrecto(verbo('fix'), 'fixxed')).toBe(false);
    expect(pasadoRegularCorrecto(verbo('work'), '')).toBe(false);
  });
});

test.describe('Explicaciones', () => {
  test('la de ortografía nombra el pasado correcto, y en la l británica las dos formas', () => {
    expect(explicarOrtografia(verbo('study'))).toContain('studied');
    expect(explicarOrtografia(verbo('travel'))).toContain('travelled');
    expect(explicarOrtografia(verbo('travel'))).toContain('traveled');
    expect(explicarOrtografia(verbo('fix'))).toContain('termina en x');
  });

  test('la de pronunciación nombra el sonido, no la letra: laugh acaba en /f/ y close en /z/', () => {
    expect(explicarPronunciacion(verbo('laugh'))).toContain('/f/');
    expect(explicarPronunciacion(verbo('laugh'))).toContain('suena /t/');
    expect(explicarPronunciacion(verbo('close'))).toContain('/z/');
    expect(explicarPronunciacion(verbo('close'))).toContain('suena /d/');
    expect(explicarPronunciacion(verbo('want'))).toContain('/ɪd/');
  });
});
