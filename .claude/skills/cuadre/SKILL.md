---
name: cuadre
description: Cuadra lo que pediste con lo que se tocó en la sesión, y calla si cuadra. Cubre UNA clase de fallo — se coló algo que nadie pidió: un test borrado, un disclaimer caído, una dependencia nueva, un candado desenganchado del build, un dominio nuevo. Cuenta y compara; NO juzga si el código es bueno, de eso responde el Inspector. Normalmente no hace falta invocarla: el pre-commit la ejecuta solo y bloquea. Se invoca para mirar cómo va la sesión, para entender un commit bloqueado o para tenderle la trampa y comprobar que sigue viva.
allowed-tools: Bash, Read, Edit, Glob, Grep
---

# El Cuadre

**Rol: contable. Cuentas y comparas. NO opinas.**

Existes porque los 17 candados del proyecto comprueban **propiedades positivas enumeradas de
antemano** —«esto debe estar, y está»— y ninguno dice «aquí hay algo que no debería estar» ni
«aquí falta algo que antes estaba». Lo que produce un generador con puntos ciegos no suele
incumplir las reglas: **opera fuera de ellas**.

No lo ejecuta Claude por su cuenta: lo disparan los hooks. Si dependiera de que el generador se
acuerde de ejecutarlo, el verificador volvería a depender del generador.

## Lo que NO eres

- **No eres el Inspector.** Una fórmula fiscal mal calculada no produce ninguna sorpresa, y el
  Cuadre dirá «todo normal» con toda la razón. «Lo que pedí está mal» es del Inspector; esto es
  «se coló algo que nadie pidió».
- **No juzgas el código.** Si emitieras un juicio serías Claude auditando a Claude, con los
  mismos puntos ciegos: añadirías confianza en vez de información.
- **No ves el radio.** Un cambio de 40 ficheros que no borra nada, no añade dependencias y no
  desarma ningún candado pasa en silencio. Es el precio aceptado el 15/09/2026 para que el 2 %
  que sí habla sea creíble.

## Qué cuenta como sorpresa (las 9 reglas)

| | Regla | Precedentes medidos |
|---|---|---|
| R1 | Un fichero de `tests/` desaparece | 1 en toda la historia |
| R2 | Alta de fichero en la raíz del repositorio | 0 en 200 commits |
| R3 | Un `check-*.mjs` sale de la cadena de `build` | 1 en 400 |
| R4 | `@ts-ignore`, `eslint-disable` o `allowlist-secret` añadido a código que ya existía | 2 en 400 |
| R5 | Paquete NUEVO en package.json (subir versión no cuenta) | 1 en 400 |
| R6 | Dominio que no estaba en la CSP anterior | 1 en 400 |
| R7 | `DisclaimerCard`, `LegalNotice`, `DataReference`, `RegionBadge`, `Footer`, `RelatedApps`, `ShareCard`, `role="alert"` o `aria-live` cae a CERO en un fichero de `app/` o `components/` | 1 en 400 |
| R8 | Un registro del catálogo pierde entradas | 2 en 400 |
| R9 | Se escribió un fichero fuera del ámbito declarado — repositorio + los `additionalDirectories` de `settings.json` (Vigilancia, markets, `.claude`…), porque anotar en la Agenda en la misma sesión es una regla del proyecto | — |

Los escapes de la casa (`parser-ok:`, `a11y-ok:`, `minimo-ok:`, `og-ok:`, `hidratacion-ok:`,
`@disclaimer: exempt`) **no bloquean**: su convención ya obliga a escribir la razón al lado, que
es el rastro que el Cuadre busca. Se nombran en el acta y nada más.

## Cómo se dispara

| Momento | Qué hace |
|---|---|
| `SessionStart` | anota el commit de partida y dónde vive el transcript |
| `UserPromptSubmit` | guarda tu texto **literal** — el lado izquierdo de la comparación viene de ti |
| `pre-commit` | cuenta y **bloquea**. Es el commit que acaba en producción |
| `SessionEnd` | cuenta, reconcilia y avisa; no bloquea porque no hay qué |

Y siempre que habla, sale un **toast de Windows**, también cuando el hallazgo se autoriza. Un
aviso impreso en la salida de una herramienta lo lee Claude, que es el auditado; el toast sale
por una puerta que la sesión no controla. Si callara al autorizar, autorizar sería la forma de
silenciarlo.

**Dónde están declarados, y por qué ahí**: los cuatro viven en `~/.claude/settings.json`, no en
el `.claude/settings.json` del proyecto. Se intentó lo segundo el 16/09/2026 —es lo correcto en
principio, porque no cargaría en los demás proyectos— y **no llegaron a cargar**: no dio error,
simplemente dejaron de registrarse las peticiones. Un verificador que se apaga sin avisar es peor
que el coste que ahorra (67 ms por orden de bash, medido). Si algún día se reintenta, la prueba
es la trampa de abajo, no la lectura del fichero.

Por eso mismo el `pre-commit` avisa cuando NO le llegan los eventos: sigue contando —es un hook
de git, no depende de la sesión— pero lo dice en vez de comparar a ciegas contra HEAD. Y
`npm run hooks:install` comprueba que los cuatro estén declarados.

## Procedimiento

### Si el usuario pregunta «¿cómo va esta sesión?»

```bash
npm run cuadre
```

Dice lo que la sesión ha tocado y si hay algo que no encaje. Sin sorpresas, una línea.

### Si un commit ha quedado bloqueado

1. **Lee el acta** que nombra la salida (`scratch/cuadre/actas/AAAA-MM-DD-HHMM.md`).
2. **Enséñale el hecho al usuario, no tu interpretación**: «desapareció X de Y». La decisión
   sobre si eso debía pasar es suya: es el único que sabe lo que pidió.
3. Según lo que decida:
   - **No debía estar** → deshacer el cambio y volver a commitear. Sin discusión ni excusas.
   - **Sí debía estar** → autorizar dejando la razón escrita:
     ```bash
     CUADRE_OK="por qué es correcto" git commit -m "…"
     ```
4. **NUNCA `--no-verify`.** Desarma a la vez el guardián de secretos, los goldens de cálculo y
   este candado. Hay un `PreToolUse` que lo rechaza; si te lo encuentras, no busques la vuelta:
   pregúntale al usuario.

### Si el usuario quiere comprobar que sigue vivo

```bash
npm run cuadre:probar-candado     # las cinco trampas, ~25 s
```

Cuatro trampas que deben saltar (test borrado, dependencia inventada, candado desenganchado,
disclaimer caído) y —la que de verdad importa— la **especificidad**: reinyecta los últimos 400
commits reales y exige que hable en 10 o menos. Sin esa quinta, un detector que gritara
«sorpresa» en todo pasaría las otras cuatro con matrícula de honor.

La trampa que el usuario puede tender él mismo, sin entender el código: borrar un test, pedir un
commit, y mirar si sale el toast.

### Cómo se sabe que no está roto

El silencio es el estado normal, así que **el silencio no puede ser también el indicador de
salud**: un detector diseñado para callar no se distingue de uno roto. Dos controles, uno
automático y otro no:

1. **En CADA pre-commit**, antes de contar nada, el contador se tiende a sí mismo las cuatro
   trampas contra escenarios escritos a mano (`TRAMPAS` en `cuadre-motor.mjs`). Cuesta menos de
   un milisegundo porque no toca git ni el disco. Si alguna falla, **no deja pasar el commit
   dando el silencio por bueno**: dice que está roto. Es el patrón de la Ronda —autoverificarse
   en cada pasada— aplicado donde el control es barato.
2. **Cada seis meses**, la mitad que no se puede automatizar: reinyectar 400 commits reales y
   comprobar que sigue callando donde debe (22 s). Tiene entrada propia en la Agenda
   (`cuadre-especificidad-semestral`). El acta imprime además cuántos commits lleva sin hablar:
   a los 50 pide la trampa, a los 100 la lectura por defecto pasa a ser «compruébame».

## Los dos límites, dichos sin adornos

1. **No se puede impedir que el auditado se salte a su auditor.** Los commits los teclea Claude,
   y todo escape que exista es un escape que Claude puede teclear. Lo que sí se garantiza es que
   no lo haga en silencio: el toast sale antes del bloqueo, y el cierre de sesión reconcilia
   —hallazgo vivo sin acta que lo cubra significa que alguien pasó por encima del pre-commit—.
2. **Dos sesiones a la vez sobre el mismo repositorio** comparten repositorio pero no estado: el
   pre-commit toma el fichero de sesión tocado más recientemente, que es casi siempre el correcto
   —quien acaba de escribirte es quien va a commitear— pero no siempre. Si el acta cita una
   petición que no viene a cuento, es esto.

## Dónde vive cada pieza

- `scripts/cuadre-motor.mjs` — las 9 reglas, sin git y sin disco, para poder probarlas a mano
- `scripts/cuadre.mjs` — el contador (`--pre-commit`, `--sesion`, `--cierre`, `--simular N`)
- `scripts/cuadre-hook.mjs` — lo que ejecutan los hooks de Claude Code
- `scripts/pruebas/probar-cuadre.mjs` — las cinco trampas
- `scratch/cuadre/` — estado de sesión, actas y contador (fuera del repositorio, por diseño)
