/**
 * Formateo del editor y de la tabla de resultados. Sin dependencias.
 */

type Trozo = { tipo: 'codigo' | 'cadena' | 'comentarioLinea' | 'comentarioBloque'; texto: string };

// Parte la consulta en código, cadenas ('…', "…", `…`) y comentarios (de línea «--» y de bloque).
function trocear(sql: string): Trozo[] {
  const trozos: Trozo[] = [];
  let codigo = '';
  let i = 0;
  const cerrarCodigo = (): void => {
    if (codigo) trozos.push({ tipo: 'codigo', texto: codigo });
    codigo = '';
  };
  while (i < sql.length) {
    const c = sql[i];
    if (c === '-' && sql[i + 1] === '-') {
      cerrarCodigo();
      const fin = sql.indexOf('\n', i);
      const hasta = fin === -1 ? sql.length : fin;
      trozos.push({ tipo: 'comentarioLinea', texto: sql.slice(i, hasta) });
      i = hasta;
    } else if (c === '/' && sql[i + 1] === '*') {
      cerrarCodigo();
      const fin = sql.indexOf('*/', i + 2);
      const hasta = fin === -1 ? sql.length : fin + 2;
      trozos.push({ tipo: 'comentarioBloque', texto: sql.slice(i, hasta) });
      i = hasta;
    } else if (c === "'" || c === '"' || c === '`') {
      cerrarCodigo();
      // Una comilla doblada ('') es una comilla escapada dentro de la cadena
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === c) {
          if (sql[j + 1] === c) j += 2;
          else break;
        } else j++;
      }
      trozos.push({ tipo: 'cadena', texto: sql.slice(i, j + 1) });
      i = j + 1;
    } else {
      codigo += c;
      i++;
    }
  }
  cerrarCodigo();
  return trozos;
}

const CLAUSULAS =
  /\b(FROM|WHERE|GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|(?:(?:LEFT|RIGHT|FULL)(?:\s+OUTER)?\s+|INNER\s+|CROSS\s+)?JOIN)\b/gi;

function formatearCodigo(texto: string): string {
  return texto
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\bSELECT\b/gi, 'SELECT')
    .replace(CLAUSULAS, (m) => `\n${m.replace(/\s+/g, ' ').toUpperCase()}`)
    .replace(/ \n/g, '\n');
}

/**
 * Pone cada cláusula en su línea sin cambiar lo que hace la consulta: no toca cadenas ni
 * comentarios, y tras un «--» conserva el salto de línea (antes lo colapsaba y el comentario se
 * tragaba el SELECT; también partía «LEFT JOIN» y reescribía 'a,b' como 'a, b' — hallazgo 2996).
 */
export function formatearConsulta(sql: string): string {
  const trozos = trocear(sql);
  let salida = '';
  trozos.forEach((t, idx) => {
    let texto = t.tipo === 'codigo' ? formatearCodigo(t.texto) : t.texto;
    // Tras un salto de línea (el de un «--»), sin espacio ni línea en blanco delante
    if (salida.endsWith('\n')) texto = texto.replace(/^[ \n]+/, '');
    salida += texto;
    if (t.tipo === 'comentarioLinea' && idx < trozos.length - 1) salida += '\n';
  });
  return salida.trim();
}

/**
 * Un valor de SQLite en formato español. Los reales, con 15 cifras significativas, como los
 * muestra la consola de SQLite: antes se cortaban a 2 decimales, y 0,004 salía «0» y un AVG sin
 * redondear no se distinguía de su ROUND (hallazgo 2997). Con 15 cifras se ve todo eso sin el
 * ruido binario del double (234,98 y no 234,98000000000002).
 */
export function formatearValor(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return String(value);
    const texto = String(Number.isInteger(value) ? value : Number(value.toPrecision(15)));
    if (/e/i.test(texto)) return texto.replace('.', ',');
    const negativo = value < 0;
    const [entera, decimales] = texto.replace('-', '').split('.');
    const enteraEs = Number(entera).toLocaleString('es-ES', { maximumFractionDigits: 0 });
    return `${negativo ? '-' : ''}${enteraEs}${decimales ? `,${decimales}` : ''}`;
  }
  return String(value);
}
