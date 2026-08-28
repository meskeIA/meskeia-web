# types/ — la unión discriminada que no discrimina

> Bajado del índice de memoria el 28/08/2026 (fase 2 de la recomposición de `MEMORY.md`): es un
> gotcha de tipado que solo importa al declarar tipos. Ficha completa:
> `reference_union_discriminada_no_discrimina`.

**Escribir `tipo: 'limite'` en un `return` NO crea una unión discriminada.** Si el tipo de retorno
se deja a la inferencia —el molde habitual del catálogo, `useMemo(() => { switch (...) { ... } })`—
TypeScript hace dos cosas que juntas apagan la comprobación:

1. **`tipo` se ensancha a `string`**, no queda como literal, así que
   `resultados.tipo === 'limite'` **no estrecha nada**.
2. **Normaliza los miembros rellenando lo que falta con `?: undefined`**, así que
   `resultados.valorFuncion` compila desde *cualquier* rama.

Resultado: el compilador acepta leer un campo de otra rama y en pantalla sale `undefined` **en
silencio**. Como los campos que llegan por spread (`...resultado`) no siempre entran en esa
normalización, esos sí dan error — y ahí es cuando alguien los tapa con `as any`. **Ese `any` no
es pereza: es el único síntoma visible de un problema de tipado.**

**Cómo verlo**: sonda `const _sonda: never = valor;` + `npm run check:tipos`. El error imprime el
tipo inferido completo, con los `?: undefined` a la vista. Quitar la sonda después.

**Arreglo**: declarar la unión a mano con los literales y anotar el hook —
`useMemo<ResultadoCalculo | null>(...)`.

Caso de origen: `app/calculadora-calculo/page.tsx` (03/08/2026, commit `91eea12a`), 7 de los 13
`any` del catálogo. Al tipar bien no apareció ningún acceso inválido: no había fallo latente, pero
la red de seguridad llevaba tiempo apagada. **Es probable que se repita**, porque el molde es común.
